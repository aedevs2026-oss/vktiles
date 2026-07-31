"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/site-content";
import { sendEnquiryNotification, sendCustomerAutoReply } from "@/lib/mail";

export async function submitContactEnquiryAction(_prev, formData) {
  // Honeypot — bots fill hidden fields
  if (formData.get("website")) {
    return { success: true };
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const inquiryType = String(formData.get("type") || "General").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !phone || !message) {
    return { error: "Name, phone and message are required." };
  }

  if (message.length > 5000) {
    return { error: "Message is too long." };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { error: "Contact form is temporarily unavailable. Please call us directly." };
  }

  const { error } = await supabase.from("contact_enquiries").insert({
    name,
    phone,
    email: email || null,
    inquiry_type: inquiryType,
    message,
    status: "new",
  });

  if (error) {
    return { error: "Could not send your enquiry. Please try calling us." };
  }

  // Send email notifications (non-blocking for user — enquiry already saved)
  try {
    await sendEnquiryNotification({ name, phone, email, inquiryType, message });
    if (email) {
      await sendCustomerAutoReply({ name, phone, email, inquiryType, message });
    }
  } catch (mailErr) {
    console.error("Email send failed:", mailErr.message);
  }

  const { emailConfig } = getSiteContent();
  const reply = emailConfig?.autoReplyMessage;

  return {
    success: true,
    message:
      emailConfig?.sendAutoReply && reply
        ? reply
        : "Thank you! Your enquiry has been received. We'll get back to you shortly.",
  };
}
