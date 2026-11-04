import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import QRCode from "qrcode";
import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomString(length: number): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

/**
 * Generates a unique, non-sequential ticket number (not enumerable).
 * Example: CE-2026-K7M4Q9XB. Retries on the (rare) collision.
 */
export async function generateTicketNumber(tx?: Prisma.TransactionClient): Promise<string> {
  const client = tx || prisma;
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const ticketNumber = `CE-${year}-${randomString(8)}`;
    const existing = await client.ticket.findUnique({ where: { ticketNumber }, select: { id: true } });
    if (!existing) return ticketNumber;
  }
  throw new Error("Could not allocate a ticket number");
}

/** Cryptographically secure alphanumeric verification token. */
export function generateVerificationToken(length: number = 12): string {
  return randomString(length);
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
