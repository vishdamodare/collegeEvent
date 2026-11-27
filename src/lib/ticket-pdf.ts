import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { appUrl } from "@/lib/app-url";
import { campusFor } from "@/lib/campuses";
import { generateQRCodePng } from "@/lib/ticket-generator";

export interface TicketPdfArgs {
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

const INK = rgb(0.04, 0.06, 0.14);
const MUTED = rgb(0.35, 0.39, 0.51);
const RED = rgb(0.86, 0.13, 0.16);
const PAPER = rgb(0.953, 0.961, 0.984);
const NIGHT = rgb(0.04, 0.04, 0.04);
const WHITE = rgb(1, 1, 1);
const LINE = rgb(0.72, 0.75, 0.85);

/** Fetch one of our own static PNGs (public/ files aren't in the serverless bundle, so read them over HTTP). null = skip it. */
async function loadPng(path: string | undefined): Promise<Uint8Array | null> {
  if (!path) return null;
  try {
    const res = await fetch(`${appUrl}${path}`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/** Rounded rectangle; (x, top) is the top-left corner. pdf-lib has no rounded rect, so draw an SVG path (its y axis points down). */
function rrect(page: PDFPage, x: number, top: number, w: number, h: number, r: number, color: ReturnType<typeof rgb>, border?: ReturnType<typeof rgb>) {
  const path = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  page.drawSvgPath(path, { x, y: top, color, ...(border ? { borderColor: border, borderWidth: 1 } : {}) });
}

/** Draw an image centred and scaled to fit inside a w x h box whose top-left is (x, top). */
function fit(page: PDFPage, img: PDFImage, x: number, top: number, w: number, h: number) {
  const s = Math.min(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  page.drawImage(img, { x: x + (w - iw) / 2, y: top - h + (h - ih) / 2, width: iw, height: ih });
}

/**
 * One-page branded PDF ticket: the institute's logo and the CollegeEvent logo, the event details, and the entry QR.
 * Standard PDF fonts only cover Latin text, so characters outside it (e.g. Devanagari) print as "?" instead of failing.
 */
export async function generateTicketPdf(a: TicketPdfArgs): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Ticket ${a.ticketNumber} - ${a.eventTitle}`);
  pdf.setAuthor("CollegeEvent");
  const page = pdf.addPage([595, 842]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.CourierBold);

  const safe = (font: PDFFont, s: string) =>
    [...s.replace(/\s+/g, " ")]
      .map((c) => {
        try {
          font.encodeText(c);
          return c;
        } catch {
          return "?";
        }
      })
      .join("");
  const wrap = (font: PDFFont, text: string, size: number, maxW: number, maxLines: number) => {
    const words = safe(font, text).split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) <= maxW || !cur) cur = next;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, "...");
    }
    return lines;
  };
  const text = (font: PDFFont, s: string, x: number, y: number, size: number, color = INK) => page.drawText(safe(font, s), { x, y, size, font, color });

  const W = 595;
  const M = 40;
  const campus = campusFor(a.college);
  const instituteName = campus?.name ?? a.college ?? a.organizerName ?? "CollegeEvent";
  const [instLogoBytes, brandLogoBytes, qrBytes] = await Promise.all([loadPng(campus?.logo), loadPng("/logo-mark.png"), generateQRCodePng(a.ticketId, a.verificationToken)]);
  const instLogo = instLogoBytes ? await pdf.embedPng(instLogoBytes).catch(() => null) : null;
  const brandLogo = brandLogoBytes ? await pdf.embedPng(brandLogoBytes).catch(() => null) : null;
  const qr = await pdf.embedPng(qrBytes);

  // Paper background and dark header band
  page.drawRectangle({ x: 0, y: 0, width: W, height: 842, color: PAPER });
  page.drawRectangle({ x: 0, y: 842 - 112, width: W, height: 112, color: NIGHT });

  // Institute logo (white chip), or initials when we have no logo for this institute
  const chip = 64;
  const chipTop = 842 - 24;
  rrect(page, M, chipTop, chip, chip, 12, WHITE);
  if (instLogo) fit(page, instLogo, M + 6, chipTop - 6, chip - 12, chip - 12);
  else {
    const initials = instituteName.split(/\s+/).filter((w) => /^[a-z]/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "CE";
    const iw = bold.widthOfTextAtSize(initials, 22);
    text(bold, initials, M + (chip - iw) / 2, chipTop - chip / 2 - 8, 22, RED);
  }
  const nameLines = wrap(bold, instituteName, 15, 285, 2);
  nameLines.forEach((l, i) => text(bold, l, M + chip + 14, chipTop - 26 - i * 18, 15, WHITE));
  text(regular, "Official event ticket", M + chip + 14, chipTop - 26 - nameLines.length * 18, 10.5, rgb(0.7, 0.72, 0.78));

  // CollegeEvent logo (white chip) + wordmark, right-aligned
  const brandName = "CollegeEvent";
  const bw = bold.widthOfTextAtSize(brandName, 16);
  const bx = W - M - chip;
  rrect(page, bx, chipTop, chip, chip, 12, WHITE);
  if (brandLogo) fit(page, brandLogo, bx + 6, chipTop - 6, chip - 12, chip - 12);
  text(bold, brandName, bx - 12 - bw, chipTop - chip / 2 - 5, 16, WHITE);

  // Event title
  let y = 842 - 112 - 44;
  text(regular, `Admit one: ${a.studentName}`, M, y, 12, MUTED);
  y -= 34;
  const titleLines = wrap(bold, a.eventTitle, 25, W - 2 * M, 3);
  titleLines.forEach((l) => {
    text(bold, l, M, y, 25, INK);
    y -= 31;
  });
  y -= 6;

  // Details
  const tz = "Asia/Kolkata";
  const day = a.eventDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
  const time = a.eventDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).toUpperCase();
  const hostedBy = [a.college, a.organizerName].filter(Boolean).join(", ");
  const rows: [string, string][] = [
    ["Date", day],
    ["Time", `${time} IST`],
    ["Venue", a.venue],
    ...(hostedBy ? ([["Hosted by", hostedBy]] as [string, string][]) : []),
    ...(a.category ? ([["Category", a.category]] as [string, string][]) : []),
    ...(a.teamName ? ([["Team", a.teamName]] as [string, string][]) : []),
  ];
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE });
  y -= 24;
  for (const [k, v] of rows) {
    const lines = wrap(bold, v, 13, W - 2 * M - 100, 2);
    text(regular, k, M, y, 11, MUTED);
    lines.forEach((l, i) => text(bold, l, M + 100, y - i * 16, 13, INK));
    y -= 12 + lines.length * 16 + 6;
  }

  // Tear-off line
  y -= 8;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.2, color: LINE, dashArray: [5, 4] });

  // QR stub
  const stubTop = y - 22;
  const stubH = 232;
  rrect(page, M, stubTop, W - 2 * M, stubH, 18, WHITE, LINE);
  const qrSize = 184;
  page.drawImage(qr, { x: M + 24, y: stubTop - 24 - qrSize, width: qrSize, height: qrSize });
  const tx = M + 24 + qrSize + 28;
  text(bold, "Show this QR at the entry gate", tx, stubTop - 52, 14, INK);
  text(regular, "Ticket number", tx, stubTop - 88, 10.5, MUTED);
  text(mono, a.ticketNumber, tx, stubTop - 110, 19, RED);
  wrap(regular, "Valid for one person. This QR is unique to you, so please don't share it.", 10.5, W - M - 24 - tx, 4).forEach((l, i) =>
    text(regular, l, tx, stubTop - 146 - i * 14, 10.5, MUTED)
  );
  text(regular, "View it any time in your dashboard:", tx, stubTop - 196, 9.5, MUTED);
  text(bold, `${appUrl.replace(/^https?:\/\//, "")}/dashboard/tickets`, tx, stubTop - 210, 9.5, INK);

  // Footer
  const foot = "Issued by CollegeEvent. Keep this ticket, it is your entry pass.";
  text(regular, foot, (W - regular.widthOfTextAtSize(safe(regular, foot), 10)) / 2, 30, 10, MUTED);

  return Buffer.from(await pdf.save());
}
