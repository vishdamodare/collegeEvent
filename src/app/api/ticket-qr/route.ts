import { prisma } from "@/lib/prisma";
import { generateQRCodePng } from "@/lib/ticket-generator";

export const dynamic = "force-dynamic";

/**
 * GET /api/ticket-qr?id=<ticketId>&t=<verificationToken>
 * Serves a ticket's entry QR as a PNG so the confirmation email can show it (mail apps block data: images).
 * The token is the same secret the QR itself carries, so only someone holding the ticket can fetch it.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("t") ?? "";
  if (!id || !token || id.length > 64 || token.length > 64) return new Response("Not found", { status: 404 });

  const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true, verificationToken: true } });
  if (!ticket || ticket.verificationToken !== token) return new Response("Not found", { status: 404 });

  const png = await generateQRCodePng(ticket.id, ticket.verificationToken);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Mail clients proxy and cache images; the QR for a given ticket never changes
      "Cache-Control": "private, max-age=86400",
    },
  });
}
