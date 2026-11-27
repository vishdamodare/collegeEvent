import { appUrl } from "@/lib/app-url";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer }[];
}

/** "CollegeEvent <tickets@collegeevent.in>" or a bare address -> Brevo's { name, email } sender. */
function parseSender(from: string) {
  const m = from.match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  return m ? { name: m[1]?.trim() || "CollegeEvent", email: m[2].trim() } : { name: "CollegeEvent", email: from.trim() };
}

/**
 * Sends one transactional email through Brevo (https://developers.brevo.com/reference/sendtransacemail).
 * Needs BREVO_API_KEY and EMAIL_FROM, and EMAIL_FROM must be a sender/domain verified in Brevo.
 * Never throws: callers get { success } so a mail problem can't break registration or sign-up.
 */
export async function sendEmail({ to, subject, html, text, attachments }: SendEmailArgs) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(`⚠️ Email skipped (set BREVO_API_KEY and EMAIL_FROM). To: ${to} | Subject: ${subject}`);
    return { success: false, error: "Email is not configured" };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: parseSender(from),
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
        ...(attachments?.length ? { attachment: attachments.map((a) => ({ name: a.filename, content: a.content.toString("base64") })) } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Brevo API error: ${res.status} - ${errText}`);
      return { success: false, error: errText };
    }
    return { success: true, data: await res.json() };
  } catch (error) {
    console.error("Brevo delivery failed:", error);
    return { success: false, error };
  }
}

const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      background-color: #0A0A0A;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #141414;
      border: 1px solid #2A2A2A;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #FF4B50;
      text-decoration: none;
      margin-bottom: 30px;
      display: inline-block;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 20px;
      color: #FFFFFF;
    }
    p {
      color: #A0A0A0;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      background-color: #DC2229;
      color: #FFFFFF;
      font-weight: bold;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      display: inline-block;
      font-size: 16px;
    }
    .footer {
      margin-top: 40px;
      color: #555555;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <span class="logo">🎓 CollegeEvent</span>
      <h1>${title}</h1>
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 CollegeEvent. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(to: string, url: string) {
  const content = `
    <p>Welcome to CollegeEvent! Verify your email address to activate your account and start discovering amazing events.</p>
    <a href="${url}" class="btn" style="color: #FFFFFF;">Verify Email Address</a>
    <p style="margin-top: 30px; font-size: 14px; color: #555555;">This link will expire in 24 hours.</p>
  `;
  return sendEmail({
    to,
    subject: "Verify your email address - CollegeEvent",
    html: emailWrapper("Verify Your Email", content),
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const content = `
    <p>You requested a password reset for your CollegeEvent account. Click the button below to set a new password.</p>
    <a href="${url}" class="btn" style="color: #FFFFFF;">Reset Password</a>
    <p style="margin-top: 30px; font-size: 14px; color: #555555;">If you did not request this, you can safely ignore this email.</p>
  `;
  return sendEmail({
    to,
    subject: "Reset your password - CollegeEvent",
    html: emailWrapper("Reset Your Password", content),
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const content = `
    <p>Hey ${name}, welcome to CollegeEvent! Your student account is fully active. Start browsing tech fests, hackathons, and cultural events near you.</p>
    <a href="${appUrl}/dashboard" class="btn" style="color: #FFFFFF;">Go to Dashboard</a>
  `;
  return sendEmail({
    to,
    subject: "Welcome to CollegeEvent!",
    html: emailWrapper(`Welcome, ${name}!`, content),
  });
}

export async function sendOrganizerApprovedEmail(to: string, name: string) {
  const content = `
    <p>Hello ${name}, your event organizer account has been approved by the platform administrators! You can now log in and start publishing events for your institution.</p>
    <a href="${appUrl}/login" class="btn" style="color: #FFFFFF;">Login to Admin Panel</a>
  `;
  return sendEmail({
    to,
    subject: "Account Approved - CollegeEvent Organizer",
    html: emailWrapper("Your Account has been Approved!", content),
  });
}

export async function sendOrganizerRejectedEmail(to: string, name: string) {
  const content = `
    <p>Hello ${name}, we regret to inform you that your event organizer application has been declined after administrative review. Please ensure your official ID or club authorization document is valid and try signing up again.</p>
    <p style="color: #FF4B33; font-weight: bold; margin-top: 20px;">Reason: Official documentation verification failed.</p>
  `;
  return sendEmail({
    to,
    subject: "Application Status - CollegeEvent Organizer",
    html: emailWrapper("Application Declined", content),
  });
}

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface TicketEmailArgs {
  to: string;
  studentName: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
  college?: string | null;
  organizerName?: string | null;
  category?: string | null;
  teamName?: string | null;
  ticketId: string;
  ticketNumber: string;
  verificationToken: string;
}

/** Registration confirmation with the event details and the entry QR (shown from /api/ticket-qr, and attached as a file). */
export async function sendTicketConfirmationEmail(a: TicketEmailArgs) {
  const tz = "Asia/Kolkata";
  const day = a.eventDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
  const time = a.eventDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).toUpperCase();
  const first = a.studentName.trim().split(/\s+/)[0] || "there";
  const ticketUrl = `${appUrl}/dashboard/tickets`;
  const qrUrl = `${appUrl}/api/ticket-qr?id=${encodeURIComponent(a.ticketId)}&t=${encodeURIComponent(a.verificationToken)}`;
  const hostedBy = [a.college, a.organizerName].filter(Boolean).join(", ");

  const rows: [string, string][] = [
    ["Date", day],
    ["Time", `${time} IST`],
    ["Venue", a.venue],
    ...(hostedBy ? ([["Hosted by", hostedBy]] as [string, string][]) : []),
    ...(a.category ? ([["Category", a.category]] as [string, string][]) : []),
    ...(a.teamName ? ([["Team", a.teamName]] as [string, string][]) : []),
  ];
  const detailRows = rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:8px 16px 8px 0;font-size:13px;color:#5A6382;white-space:nowrap;vertical-align:top;">${esc(k)}</td>
        <td style="padding:8px 0;font-size:15px;color:#0A1024;font-weight:600;">${esc(v)}</td>
      </tr>`
    )
    .join("");

  const brand = a.college ? `${esc(a.college)} <span style="color:#DC2229;">&times;</span> CollegeEvent` : "CollegeEvent";
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're registered for ${esc(a.eventTitle)}. Your entry QR is inside.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="padding:0 4px 20px;color:#FFFFFF;font-size:15px;font-weight:700;letter-spacing:.2px;">🎓 ${brand}</td></tr>
      <tr><td style="background:#F3F5FB;border-radius:20px;padding:32px 28px;">
        <p style="margin:0 0 6px;font-size:14px;color:#5A6382;">You're in, ${esc(first)}!</p>
        <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#0A1024;">${esc(a.eventTitle)}</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #D9DEEE;width:100%;">${detailRows}</table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="center" style="background:#FFFFFF;border:1px dashed #B7BFD8;border-radius:16px;padding:22px 16px;">
          <img src="${qrUrl}" width="220" height="220" alt="Entry QR code for ${esc(a.ticketNumber)}" style="display:block;margin:0 auto;border:0;">
          <p style="margin:14px 0 2px;font-size:12px;color:#5A6382;">Show this QR at the entry gate</p>
          <p style="margin:0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:18px;font-weight:700;color:#DC2229;letter-spacing:1px;">${esc(a.ticketNumber)}</p>
        </td></tr></table>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;"><tr><td style="background:#DC2229;border-radius:12px;">
          <a href="${ticketUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">View your ticket</a>
        </td></tr></table>
        <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#5A6382;">Can't see the QR? Open it any time in your CollegeEvent dashboard.</p>
      </td></tr>
      <tr><td style="padding:20px 4px 0;text-align:center;font-size:12px;color:#7A7A7A;">&copy; ${new Date().getFullYear()} CollegeEvent. Keep this email, it is your entry pass.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `You're in, ${first}!\n\n${a.eventTitle}\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nTicket number: ${a.ticketNumber}\nOpen your QR ticket: ${ticketUrl}\n\nCollegeEvent`;

  const { generateQRCodePng } = await import("@/lib/ticket-generator");
  const qr = await generateQRCodePng(a.ticketId, a.verificationToken);
  return sendEmail({
    to: a.to,
    subject: `You're registered: ${a.eventTitle}`,
    html,
    text,
    attachments: [{ filename: `ticket-${a.ticketNumber}.png`, content: qr }], // also attached, so the QR is there even if images are blocked
  });
}

export async function sendCertificateIssuedEmail({
  to,
  studentName,
  eventTitle,
}: {
  to: string;
  studentName: string;
  eventTitle: string;
}) {
  const content = `
    <p>Dear ${studentName}, thank you for attending <strong>${eventTitle}</strong>! Your official Certificate of Participation has been generated and issued.</p>
    <a href="${appUrl}/dashboard/events" class="btn" style="color: #FFFFFF;">View & Download Certificate</a>
  `;
  return sendEmail({
    to,
    subject: `Certificate Issued: ${eventTitle} - CollegeEvent`,
    html: emailWrapper("Participation Certificate Issued 🏆", content),
  });
}

