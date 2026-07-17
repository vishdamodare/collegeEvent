"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Gets the current authenticated user session
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * Sends a mock 6-digit OTP code to the requested phone number.
 * Logs the code to the terminal console for manual testing.
 */
export async function sendOtpAction(phone: string) {
  try {
    const trimmedPhone = phone.trim();
    if (!/^[+]?[0-9\s-]{10,15}$/.test(trimmedPhone)) {
      return { error: "Invalid phone number format." };
    }

    // Rate limiting: check if an OTP was sent in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        phone: trimmedPhone,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentOtp) {
      return { error: "Please wait 60 seconds before requesting another OTP." };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save/update OTP verification record
    await prisma.otpVerification.create({
      data: {
        phone: trimmedPhone,
        code,
        expiresAt,
      },
    });

    // SMS GATEWAY INTEGRATIONS
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    let smsSentReal = false;

    // 1. FAST2SMS Integration
    if (fast2smsKey) {
      try {
        console.log(`⚡ Sending OTP to ${trimmedPhone} via Fast2SMS API...`);
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": fast2smsKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "variables_values": code,
            "route": "otp",
            "numbers": trimmedPhone
          })
        });
        const result = await response.json();
        if (result.return) {
          smsSentReal = true;
          console.log(`✓ Fast2SMS OTP successfully dispatched!`);
        } else {
          console.error("✗ Fast2SMS API error response:", result.message);
        }
      } catch (smsErr) {
        console.error("✗ Fast2SMS delivery exception:", smsErr);
      }
    } 
    // 2. Twilio REST API Integration
    else if (twilioSid && twilioToken && twilioPhone) {
      try {
        console.log(`⚡ Sending OTP to ${trimmedPhone} via Twilio API...`);
        const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            To: trimmedPhone,
            From: twilioPhone,
            Body: `Your CollegeEvents verification OTP code is: ${code}. It expires in 5 minutes.`
          })
        });

        const result = await response.json();
        if (response.ok) {
          smsSentReal = true;
          console.log(`✓ Twilio OTP successfully dispatched! SID: ${result.sid}`);
        } else {
          console.error("✗ Twilio REST API error response:", result.message);
        }
      } catch (smsErr) {
        console.error("✗ Twilio delivery exception:", smsErr);
      }
    }

    // 3. Fallback: Local Developer Mock Sandbox Log
    if (!smsSentReal) {
      console.log(`\n========================================`);
      console.log(`☎️  [SMS GATEWAY - SIMULATOR FALLBACK]`);
      console.log(`📱  Phone: ${trimmedPhone}`);
      console.log(`🎫  OTP Code: ${code}`);
      console.log(`⏰  Expires in: 5 minutes`);
      console.log(`💡  (Provide FAST2SMS_API_KEY or TWILIO credentials in .env to send real SMSs)`);
      console.log(`========================================\n`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return { error: "Failed to send verification code. Please try again." };
  }
}

/**
 * Verifies a 6-digit OTP code against the database record.
 */
export async function verifyOtpAction(phone: string, code: string) {
  try {
    const trimmedPhone = phone.trim();
    const trimmedCode = code.trim();

    if (!trimmedPhone || !trimmedCode) {
      return { error: "Phone number and verification code are required." };
    }

    // Retrieve the most recent OTP record for this phone
    const recentOtp = await prisma.otpVerification.findFirst({
      where: { phone: trimmedPhone },
      orderBy: { createdAt: "desc" },
    });

    if (!recentOtp) {
      return { error: "No verification code found for this phone number." };
    }

    // Check expiration
    if (new Date() > recentOtp.expiresAt) {
      return { error: "Verification code has expired. Please request a new one." };
    }

    // Check attempt limits
    if (recentOtp.attempts >= 3) {
      return { error: "Too many failed attempts. Please request a new OTP code." };
    }

    // Verify code match
    if (recentOtp.code !== trimmedCode) {
      // Increment attempt counter
      await prisma.otpVerification.update({
        where: { id: recentOtp.id },
        data: { attempts: { increment: 1 } },
      });
      return { error: `Invalid verification code. ${2 - recentOtp.attempts} attempts remaining.` };
    }

    // OTP Verified! Clean up old OTP records for this phone number
    await prisma.otpVerification.deleteMany({
      where: { phone: trimmedPhone },
    });

    // If the verified phone belongs to the logged-in student, mark their profile verified
    const user = await getCurrentUser();
    if (user && user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });

      if (studentProfile && studentProfile.phoneNumber === trimmedPhone) {
        await prisma.studentProfile.update({
          where: { id: studentProfile.id },
          data: {
            phoneVerified: true,
            verifiedAt: new Date(),
            verificationMethod: "SMS_OTP",
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return { error: "Failed to verify verification code. Please try again." };
  }
}
