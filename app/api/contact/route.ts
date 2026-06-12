import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 submissions per 10 minutes per IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const { success } = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Persist to DB if a ContactMessage model exists, otherwise log
    try {
      await (prisma as any).contactMessage.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject?.trim() ?? null,
          message: message.trim(),
        },
      });
    } catch {
      // Model may not exist — fall through silently and just log
      console.info("[CONTACT] Message received:", { name, email, subject });
    }

    // Optionally send notification email (non-blocking)
    if (process.env.CONTACT_NOTIFY_EMAIL) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST!,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER!,
            pass: process.env.SMTP_PASS!,
          },
        });

        await transporter.sendMail({
          from: `NUE <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
          to: process.env.CONTACT_NOTIFY_EMAIL,
          replyTo: email,
          subject: `[NUE Contact] ${subject ?? "New message from " + name}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject ?? "N/A"}\n\n${message}`,
        });
      } catch (mailErr) {
        console.error("[CONTACT] Notification email failed:", mailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
