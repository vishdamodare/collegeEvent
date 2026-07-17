import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

/**
 * Generates a unique, sequential, and human-readable ticket number.
 * Example: CE-2026-000001
 */
export async function generateTicketNumber(tx?: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  const client = tx || prisma;
  const count = await client.ticket.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  let attempts = 0;
  let ticketNumber = "";
  while (attempts < 100) {
    const sequenceNum = String(count + 1 + attempts).padStart(6, "0");
    ticketNumber = `CE-${currentYear}-${sequenceNum}`;
    
    const existing = await client.ticket.findUnique({
      where: { ticketNumber },
      select: { id: true }
    });
    
    if (!existing) {
      break;
    }
    attempts++;
  }

  return ticketNumber;
}

/**
 * Generates a secure random alphanumeric verification token.
 * Example: 7XK4L92AFR18
 */
export function generateVerificationToken(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generates a QR Code as a base64 Data URL.
 * Contains critical ticket validation parameters.
 */
export async function generateQRCodeDataUrl(
  ticketId: string,
  registrationId: string,
  eventId: string,
  organizerId: string,
  verificationToken: string,
  attendeeName: string,
  teamName: string
): Promise<string> {
  const data = JSON.stringify({
    ticketId,
    registrationId,
    eventId,
    organizerId,
    verificationToken,
    attendeeName,
    teamName,
    generatedAt: new Date().toISOString(),
  });

  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}
