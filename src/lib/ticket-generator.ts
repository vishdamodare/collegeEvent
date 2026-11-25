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
 * Generates the entry QR as a base64 Data URL.
 * Payload is just "ticketId:verificationToken" (~50 chars) at medium error correction, so the code is
 * low-density and scans instantly. The old JSON payload at level H was ~80x80 modules and slow to read.
 */
export async function generateQRCodeDataUrl(ticketId: string, verificationToken: string): Promise<string> {
  try {
    return await QRCode.toDataURL(`${ticketId}:${verificationToken}`, {
      errorCorrectionLevel: "M",
      margin: 4, // 4-module quiet zone is the QR spec minimum; phone cameras read it faster
      width: 1024, // high-res so it stays crisp when shown large or printed
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
