import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Rate limiting: check recent password reset requests
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentRequests = await prisma.passwordReset.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: windowStart },
      },
    });

    if (recentRequests >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // Always return the same response to prevent email enumeration
    const successResponse = NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return successResponse;
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
        used: false,
      },
    });

    await sendPasswordResetEmail(user.email!, user.name ?? "User", token);

    return successResponse;
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
