import { appUrl } from "@/lib/app-url";
import { campusFor } from "@/lib/campuses";

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

/** Logo chip: white rounded square so a dark logo stays visible on any background (Outlook ignores object-fit, so size by height). */
const logoChip = (src: string, alt: string) =>
  `<span style="display:inline-block;background:#FFFFFF;border:1px solid #E2E6F3;border-radius:10px;padding:4px 6px;vertical-align:middle;margin-right:10px;line-height:0;"><img src="${src}" alt="${alt}" height="30" style="height:30px;width:auto;max-width:64px;border:0;"></span>`;

/**
 * Brand header: [institute logo] Institute name x [CollegeEvent logo] CollegeEvent.
 * No college given (or unknown logo) still reads well: only ours, or initials in place of the institute logo.
 * tone "dark" is for the dark email backdrop (white text), "light" for the paper card.
 */
function brandHeader(college: string | null | undefined, tone: "dark" | "light") {
  const campus = campusFor(college);
  const name = (campus?.name ?? college ?? "").trim();
  const ink = tone === "dark" ? "#FFFFFF" : "#0A1024";
  const word = tone === "dark" ? "#FFFFFF" : "#DC2229";
  let inst = "";
  if (name) {
    const initials = name.split(/\s+/).filter((w) => /^[a-z]/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "CE";
    const mark = campus?.logo
      ? logoChip(`${appUrl}${campus.logo}`, esc(name))
      : `<span style="display:inline-block;width:38px;height:38px;line-height:38px;background:#FFFFFF;border:1px solid #E2E6F3;border-radius:10px;color:#DC2229;font-weight:700;font-size:14px;text-align:center;vertical-align:middle;margin-right:10px;">${esc(initials)}</span>`;
    inst = `${mark}<span style="vertical-align:middle;color:${ink};">${esc(name)}</span><span style="vertical-align:middle;color:#DC2229;margin:0 12px;font-weight:700;">&times;</span>`;
  }
  return `${inst}${logoChip(`${appUrl}/logo-mark.png`, "CollegeEvent")}<span style="vertical-align:middle;color:${word};">CollegeEvent</span>`;
}

const emailWrapper = (title: string, content: string, college?: string | null) => `
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
      background-color: #F3F5FB;
      border-radius: 20px;
      padding: 36px 28px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #DC2229;
      text-decoration: none;
      margin-bottom: 30px;
      display: inline-block;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 20px;
      color: #0A1024;
    }
    p {
      color: #3A4262;
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
      color: #7A7A7A;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="margin-bottom:26px;font-size:17px;font-weight:700;line-height:1.3;">${brandHeader(college, "light")}</div>
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

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

/** Numbered how-it-works list (a real sequence), inline-styled for email clients. */
const steps = (items: string[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;text-align:left;max-width:440px;">${items
    .map(
      (t, i) => `<tr>
        <td style="vertical-align:top;padding:6px 14px 6px 0;"><span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:13px;background:#DC2229;color:#FFFFFF;font-weight:700;font-size:13px;text-align:center;">${i + 1}</span></td>
        <td style="padding:6px 0;font-size:15px;line-height:1.5;color:#0A1024;">${t}</td>
      </tr>`
    )
    .join("")}</table>`;

/** Welcome for a new student: personal greeting, their college's page if we list it, and what to do first. */
export async function sendWelcomeEmail(to: string, name: string, college?: string | null) {
  const first = esc(firstName(name));
  const campus = campusFor(college);
  const where = college?.trim() ? ` from <strong>${esc(college.trim())}</strong>` : "";
  const content = `
    <p style="margin-bottom:22px;">Thank you for joining CollegeEvent, ${first}. Your student account${where} is ready, and every fest, hackathon and workshop near you is one tap away.</p>
    ${steps([
      "<strong>Find an event.</strong> Browse fests, hackathons, workshops and competitions.",
      "<strong>Register in seconds.</strong> It's free, and teams can add their members.",
      "<strong>Get your QR ticket.</strong> We email it the moment you register. Show it at the gate.",
    ])}
    <a href="${appUrl}/events" class="btn" style="color: #FFFFFF;">Explore events</a>
    ${campus ? `<p style="margin:26px 0 0;font-size:14px;">Or see what's on at <a href="${appUrl}/colleges/${campus.slug}" style="color:#DC2229;font-weight:600;">${esc(campus.name)}</a>.</p>` : ""}
  `;
  return sendEmail({
    to,
    subject: `Welcome to CollegeEvent, ${firstName(name)}!`,
    html: emailWrapper(`Welcome aboard, ${first}!`, content, college),
    text: `Welcome to CollegeEvent, ${firstName(name)}!\n\nYour student account is ready. Browse events: ${appUrl}/events\nRegister for free and we'll email your QR ticket instantly.`,
  });
}

/** Congratulations for a new organizer: names their college, role and department, and the first steps as an organizer. */
export async function sendOrganizerWelcomeEmail({
  to,
  name,
  college,
  department,
  position,
}: {
  to: string;
  name: string;
  college: string;
  department?: string | null;
  position?: string | null;
}) {
  const first = esc(firstName(name));
  const role = [position, department].filter(Boolean).map((v) => esc(v as string)).join(", ");
  const campus = campusFor(college);
  const content = `
    <p style="margin-bottom:22px;">Thank you for choosing CollegeEvent to host events for <strong>${esc(college)}</strong>${role ? ` (${role})` : ""}. Your organizer account is live and ready to use.</p>
    ${steps([
      "<strong>Create your first event.</strong> Add the title, date, venue, capacity and any questions you want to ask.",
      "<strong>Publish it.</strong> It appears on CollegeEvent and your college page, and students can register right away.",
      "<strong>Check guests in.</strong> Scan the QR on each student's ticket at the gate from your console.",
    ])}
    <a href="${appUrl}/admin" class="btn" style="color: #FFFFFF;">Open organizer console</a>
    ${campus ? `<p style="margin:26px 0 0;font-size:14px;">Your college page: <a href="${appUrl}/colleges/${campus.slug}" style="color:#DC2229;font-weight:600;">${esc(campus.name)}</a></p>` : ""}
  `;
  return sendEmail({
    to,
    subject: `Congratulations, ${firstName(name)}! Your organizer account is live`,
    html: emailWrapper(`Congratulations, ${first}! 🎉`, content, college),
    text: `Congratulations, ${firstName(name)}!\n\nYour organizer account for ${college} is live. Create your first event: ${appUrl}/admin\nThank you for choosing CollegeEvent.`,
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

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're registered for ${esc(a.eventTitle)}. Your entry QR is inside.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="padding:0 4px 20px;color:#FFFFFF;font-size:15px;font-weight:700;line-height:1.5;">${brandHeader(a.college, "dark")}</td></tr>
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
        <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#5A6382;">Your PDF ticket is attached, with the same QR. You can also open it any time in your CollegeEvent dashboard.</p>
      </td></tr>
      <tr><td style="padding:20px 4px 0;text-align:center;font-size:12px;color:#7A7A7A;">&copy; ${new Date().getFullYear()} CollegeEvent. Keep this email, it is your entry pass.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `You're in, ${first}!\n\n${a.eventTitle}\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nTicket number: ${a.ticketNumber}\nOpen your QR ticket: ${ticketUrl}\n\nCollegeEvent`;

  // PDF ticket with both logos + QR attached. If the PDF can't be built for any reason, fall back to the plain QR image so the email still carries a scannable ticket.
  let attachments: { filename: string; content: Buffer }[];
  try {
    const { generateTicketPdf } = await import("@/lib/ticket-pdf");
    attachments = [{ filename: `ticket-${a.ticketNumber}.pdf`, content: await generateTicketPdf({ ...a, studentName: a.studentName }) }];
  } catch (err) {
    console.error("Ticket PDF failed, attaching QR image instead:", err);
    const { generateQRCodePng } = await import("@/lib/ticket-generator");
    attachments = [{ filename: `ticket-${a.ticketNumber}.png`, content: await generateQRCodePng(a.ticketId, a.verificationToken) }];
  }
  return sendEmail({
    to: a.to,
    subject: `You're registered: ${a.eventTitle}`,
    html,
    text,
    attachments,
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

