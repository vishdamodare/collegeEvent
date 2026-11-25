"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(200, "Email is too long."),
  subject: z.string().trim().min(1, "Please enter a subject.").max(200, "Subject is too long."),
  message: z.string().trim().min(1, "Please write a message.").max(5000, "Message is too long."),
  // Honeypot: hidden from people, bots fill every field
  website: z.string().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

const MAX_PER_EMAIL = 3;
const WINDOW_MS = 10 * 60 * 1000;

/** Persist a contact form inquiry from the homepage so super admins can review it. */
export async function submitInquiry(input: InquiryInput): Promise<{ success?: boolean; error?: string }> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your inquiry details." };
  }
  const { website, ...data } = parsed.data;
  if (website) return { success: true }; // bot: pretend it worked, store nothing

  try {
    // ponytail: per-email cap only; add an IP-based limit if bots start rotating emails
    const recent = await prisma.inquiry.count({
      where: { email: { equals: data.email, mode: "insensitive" }, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
    });
    if (recent >= MAX_PER_EMAIL) {
      return { error: "You've sent a few messages already. Please wait a few minutes before sending another." };
    }

    await prisma.inquiry.create({ data });
    revalidatePath("/superadmin", "layout");
    return { success: true };
  } catch (err) {
    console.error("submitInquiry failed:", err);
    return { error: "Could not send your inquiry right now. Please try again." };
  }
}
