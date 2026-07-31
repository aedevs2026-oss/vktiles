import "server-only";
import nodemailer from "nodemailer";
import { getEmailConfigServer } from "@/lib/email-config";

function applyTemplate(template, vars) {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

async function createTransport(config) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export async function sendEnquiryNotification(enquiry) {
  const config = await getEmailConfigServer();
  if (!config.isConfigured) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const transporter = await createTransport(config);
  const subject = applyTemplate(config.notifySubject, {
    name: enquiry.name,
    type: enquiry.inquiryType,
  });

  const html = `
    <h2>New website enquiry</h2>
    <p><strong>Name:</strong> ${enquiry.name}</p>
    <p><strong>Phone:</strong> ${enquiry.phone}</p>
    <p><strong>Email:</strong> ${enquiry.email || "—"}</p>
    <p><strong>Type:</strong> ${enquiry.inquiryType}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${enquiry.message}</p>
    <hr>
    <p style="color:#666;font-size:12px">Sent from VK Tiles website contact form</p>
  `;

  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail || config.smtpUser}>`,
    to: config.formRecipientEmail,
    replyTo: enquiry.email || undefined,
    subject,
    html,
    text: `New enquiry from ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email || "—"}\nType: ${enquiry.inquiryType}\n\n${enquiry.message}`,
  });

  return { sent: true };
}

export async function sendCustomerAutoReply(enquiry) {
  const config = await getEmailConfigServer();
  if (!config.isConfigured || !config.sendAutoReply || !enquiry.email) {
    return { sent: false };
  }

  const transporter = await createTransport(config);

  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail || config.smtpUser}>`,
    to: enquiry.email,
    subject: "We received your enquiry — VK Tiles & Granites",
    html: `<p>${config.autoReplyMessage.replace(/\n/g, "<br>")}</p>`,
    text: config.autoReplyMessage,
  });

  return { sent: true };
}

export async function sendTestEmail(toEmail) {
  const config = await getEmailConfigServer();
  if (!config.isConfigured) {
    throw new Error("SMTP is not fully configured. Check host, user, password and recipient email.");
  }

  const transporter = await createTransport(config);

  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail || config.smtpUser}>`,
    to: toEmail || config.formRecipientEmail,
    subject: "VK Tiles — SMTP test email",
    html: `
      <h2>SMTP test successful</h2>
      <p>Your VK Tiles admin email configuration is working correctly.</p>
      <p style="color:#666;font-size:12px">Sent at ${new Date().toLocaleString("en-IN")}</p>
    `,
    text: "SMTP test successful. Your VK Tiles admin email configuration is working.",
  });

  return { success: true };
}
