import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/utils";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

const FROM_ADDRESS = `NUE <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseEmailHtml(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #18181b; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 700; }
    .body { padding: 40px; color: #3f3f46; line-height: 1.6; }
    .body h2 { color: #18181b; font-size: 20px; margin-top: 0; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
    .footer { background: #f4f4f5; padding: 24px 40px; text-align: center; color: #a1a1aa; font-size: 13px; }
    p { margin: 0 0 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>NUE</h1></div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NUE. All rights reserved.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends an email verification link to the user.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;
  const transporter = createTransporter();

  const html = baseEmailHtml(
    "Verify your email — NUE",
    `
    <h2>Verify your email address</h2>
    <p>Hi ${name},</p>
    <p>Thanks for signing up with NUE! Please verify your email address by clicking the button below.</p>
    <p>This link will expire in <strong>24 hours</strong>.</p>
    <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break:break-all;color:#71717a;font-size:13px;">${verificationUrl}</p>
    `
  );

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: "Verify your email address — NUE",
    html,
  });
}

/**
 * Sends a password reset link to the user.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();

  const html = baseEmailHtml(
    "Reset your password — NUE",
    `
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your NUE account. Click the button below to choose a new password.</p>
    <p>This link will expire in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break:break-all;color:#71717a;font-size:13px;">${resetUrl}</p>
    <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    `
  );

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: "Reset your password — NUE",
    html,
  });
}

/**
 * Sends an order confirmation email with the order number and total.
 */
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const orderUrl = `${BASE_URL}/account/orders/${orderNumber}`;
  const transporter = createTransporter();

  const html = baseEmailHtml(
    `Order Confirmed — ${orderNumber}`,
    `
    <h2>Your order is confirmed!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your purchase. We've received your order and will begin processing it right away.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <tr>
        <td style="padding:12px 0;border-top:1px solid #e4e4e7;color:#71717a;">Order Number</td>
        <td style="padding:12px 0;border-top:1px solid #e4e4e7;text-align:right;font-weight:600;">${orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-top:1px solid #e4e4e7;color:#71717a;">Order Total</td>
        <td style="padding:12px 0;border-top:1px solid #e4e4e7;text-align:right;font-weight:600;">${formatPrice(total)}</td>
      </tr>
    </table>
    <a href="${orderUrl}" class="btn">View Order Details</a>
    <p>We'll send you another email once your order has been shipped.</p>
    `
  );

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: `Order Confirmed: ${orderNumber} — NUE`,
    html,
  });
}

/**
 * Sends a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const shopUrl = `${BASE_URL}/shop`;
  const transporter = createTransporter();

  const html = baseEmailHtml(
    "Welcome to NUE",
    `
    <h2>Welcome to NUE, ${name}!</h2>
    <p>We're thrilled to have you as part of our community. NUE is your destination for premium fashion and lifestyle products.</p>
    <p>Here's what you can do with your new account:</p>
    <ul style="padding-left:20px;color:#3f3f46;">
      <li style="margin-bottom:8px;">Browse our curated collections</li>
      <li style="margin-bottom:8px;">Save items to your wishlist</li>
      <li style="margin-bottom:8px;">Track your orders in real time</li>
      <li style="margin-bottom:8px;">Enjoy exclusive member discounts</li>
    </ul>
    <a href="${shopUrl}" class="btn">Start Shopping</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    `
  );

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: email,
    subject: "Welcome to NUE — Let's get started!",
    html,
  });
}
