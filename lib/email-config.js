import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const ENV_DEFAULTS = {
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "VK Tiles & Granites",
  formRecipientEmail: process.env.SMTP_TO_EMAIL || "",
};

export async function getEmailConfigServer() {
  const supabase = createAdminClient();
  let stored = {};

  if (supabase) {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "emailConfig")
      .maybeSingle();
    stored = data?.value || {};
  }

  const config = {
    smtpEnabled: stored.smtpEnabled ?? Boolean(ENV_DEFAULTS.smtpHost && ENV_DEFAULTS.smtpUser),
    smtpHost: stored.smtpHost || ENV_DEFAULTS.smtpHost,
    smtpPort: Number(stored.smtpPort || ENV_DEFAULTS.smtpPort || 587),
    smtpSecure: stored.smtpSecure ?? ENV_DEFAULTS.smtpSecure,
    smtpUser: stored.smtpUser || ENV_DEFAULTS.smtpUser,
    smtpPass: stored.smtpPass || ENV_DEFAULTS.smtpPass,
    smtpFromEmail: stored.smtpFromEmail || ENV_DEFAULTS.smtpFromEmail,
    smtpFromName: stored.smtpFromName || ENV_DEFAULTS.smtpFromName,
    formRecipientEmail: stored.formRecipientEmail || ENV_DEFAULTS.formRecipientEmail,
    sendAutoReply: stored.sendAutoReply ?? false,
    autoReplyMessage:
      stored.autoReplyMessage ||
      "Thank you for contacting VK Tiles & Granites. We have received your enquiry and will respond shortly.",
    notifySubject: stored.notifySubject || "New enquiry from {{name}} — VK Tiles",
  };

  config.isConfigured = Boolean(
    config.smtpEnabled &&
      config.smtpHost &&
      config.smtpUser &&
      config.smtpPass &&
      config.formRecipientEmail
  );

  return config;
}

/** Strip secrets before writing to public site-content.json */
export function sanitizeEmailConfigForPublish(emailConfig = {}) {
  const { smtpPass, smtpUser, ...safe } = emailConfig;
  return {
    ...safe,
    smtpConfigured: Boolean(smtpPass && smtpUser),
  };
}
