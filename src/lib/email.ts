interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is not defined. Email dispatch skipped. Logged email content:");
    console.log(`To: ${to}\nSubject: ${subject}\nHTML Preview: ${subject}`);
    return { success: false, error: "API key missing" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend API Error: ${res.status} - ${errText}`);
      return { success: false, error: errText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("Resend delivery failed:", error);
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
      color: #D7FF3D;
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
      background-color: #D7FF3D;
      color: #0B0B08;
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
      <span class="logo">🎓 CollegeEvents</span>
      <h1>${title}</h1>
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 CollegeEvents. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export async function sendVerificationEmail(to: string, url: string) {
  const content = `
    <p>Welcome to CollegeEvents! Verify your email address to activate your account and start discovering amazing events.</p>
    <a href="${url}" class="btn" style="color: #0B0B08;">Verify Email Address</a>
    <p style="margin-top: 30px; font-size: 14px; color: #555555;">This link will expire in 24 hours.</p>
  `;
  return sendEmail({
    to,
    subject: "Verify your email address - CollegeEvents",
    html: emailWrapper("Verify Your Email", content),
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const content = `
    <p>You requested a password reset for your CollegeEvents account. Click the button below to set a new password.</p>
    <a href="${url}" class="btn" style="color: #0B0B08;">Reset Password</a>
    <p style="margin-top: 30px; font-size: 14px; color: #555555;">If you did not request this, you can safely ignore this email.</p>
  `;
  return sendEmail({
    to,
    subject: "Reset your password - CollegeEvents",
    html: emailWrapper("Reset Your Password", content),
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const content = `
    <p>Hey ${name}, welcome to CollegeEvents! Your student account is fully active. Start browsing tech fests, hackathons, and cultural events near you.</p>
    <a href="${appUrl}/dashboard" class="btn" style="color: #0B0B08;">Go to Dashboard</a>
  `;
  return sendEmail({
    to,
    subject: "Welcome to CollegeEvents!",
    html: emailWrapper(`Welcome, ${name}!`, content),
  });
}

export async function sendOrganizerApprovedEmail(to: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const content = `
    <p>Hello ${name}, your event organizer account has been approved by the platform administrators! You can now log in and start publishing events for your institution.</p>
    <a href="${appUrl}/login" class="btn" style="color: #0B0B08;">Login to Admin Panel</a>
  `;
  return sendEmail({
    to,
    subject: "Account Approved - CollegeEvents Organizer",
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
    subject: "Application Status - CollegeEvents Organizer",
    html: emailWrapper("Application Declined", content),
  });
}
