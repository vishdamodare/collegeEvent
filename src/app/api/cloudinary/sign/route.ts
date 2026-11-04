import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateCloudinarySignature } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["events", "colleges", "sponsors", "media", "general"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ORGANIZER" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const folder = typeof body.folder === "string" && ALLOWED_FOLDERS.includes(body.folder) ? body.folder : "events";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: `college-events/${folder}`,
    };

    const signatureData = generateCloudinarySignature(paramsToSign);

    return NextResponse.json({
      success: true,
      ...signatureData,
      folder: paramsToSign.folder,
    });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 });
  }
}
