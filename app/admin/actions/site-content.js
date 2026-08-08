"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveImageFromForm } from "@/lib/supabase/upload";
import { clearSiteContentCache } from "@/lib/site-content";
import { sanitizeEmailConfigForPublish } from "@/lib/email-config";
import { sendTestEmail } from "@/lib/mail";

async function getSupabase() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

function writeSiteContentJson(data) {
  const filePath = path.join(process.cwd(), "content", "site-content.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  clearSiteContentCache();
  return filePath;
}

// ─── Gallery ───────────────────────────────────────────────────────────────

export async function getAdminGallery() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminGalleryItem(id) {
  const supabase = await getSupabase();
  const { data } = await supabase.from("gallery_items").select("*").eq("id", id).single();
  return data;
}

export async function saveGalleryAction(id, formData) {
  try {
    const supabase = await getSupabase();
    const slug = String(formData.get("slug") || "").trim();
    const caption = String(formData.get("caption") || "").trim();
    if (!slug || !caption) return { error: "Slug and caption are required." };

    const image = await resolveImageFromForm(
      formData,
      "imageFile",
      "image",
      "existingImage",
      `gallery/${slug}`
    );
    if (!image) return { error: "Image is required." };

    const thumb =
      (await resolveImageFromForm(
        formData,
        "thumbFile",
        "thumb",
        "existingThumb",
        `gallery/${slug}-thumb`
      )) || image;

    const row = {
      slug,
      caption,
      image,
      thumb,
      sort_order: Number(formData.get("sortOrder") || 0),
      published: formData.get("published") !== "off",
    };

    let error;
    if (id && id !== "new") {
      ({ error } = await supabase.from("gallery_items").update(row).eq("id", id));
    } else {
      ({ error } = await supabase.from("gallery_items").insert(row));
    }
    if (error) return { error: error.message };
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to save gallery item." };
  }
}

export async function deleteGalleryFormAction(id) {
  const supabase = await getSupabase();
  await supabase.from("gallery_items").delete().eq("id", id);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

// ─── Testimonials ──────────────────────────────────────────────────────────

export async function getAdminTestimonials() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminTestimonial(id) {
  const supabase = await getSupabase();
  const { data } = await supabase.from("testimonials").select("*").eq("id", id).single();
  return data;
}

export async function saveTestimonialAction(id, formData) {
  try {
    const supabase = await getSupabase();
    const name = String(formData.get("name") || "").trim();
    const quote = String(formData.get("quote") || "").trim();
    if (!name || !quote) return { error: "Name and quote are required." };

    const avatar = await resolveImageFromForm(
      formData,
      "avatarFile",
      "avatar",
      "existingAvatar",
      `testimonials/${name.toLowerCase().replace(/\s+/g, "-")}`
    );

    const row = {
      name,
      role: formData.get("role"),
      avatar,
      quote,
      rating: Math.min(5, Math.max(1, Number(formData.get("rating") || 5))),
      sort_order: Number(formData.get("sortOrder") || 0),
      published: formData.get("published") !== "off",
    };

    let error;
    if (id && id !== "new") {
      ({ error } = await supabase.from("testimonials").update(row).eq("id", id));
    } else {
      ({ error } = await supabase.from("testimonials").insert(row));
    }
    if (error) return { error: error.message };
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to save testimonial." };
  }
}

export async function deleteTestimonialFormAction(id) {
  const supabase = await getSupabase();
  await supabase.from("testimonials").delete().eq("id", id);
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

// ─── Contact settings ──────────────────────────────────────────────────────

export async function getContactSettings() {
  const supabase = await getSupabase();
  const keys = ["business", "businessHours", "contact", "emailConfig"];
  const { data } = await supabase.from("site_settings").select("*").in("key", keys);
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  if (map.emailConfig) {
    map.emailConfig = {
      ...map.emailConfig,
      hasSmtpPassword: Boolean(map.emailConfig.smtpPass),
      smtpPass: "",
    };
  }
  return map;
}

export async function saveContactSettingsAction(_prevState, formData) {
  try {
    const supabase = await getSupabase();

    const { data: existing } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "emailConfig")
      .maybeSingle();

    const prevEmail = existing?.value || {};
    const newPass = String(formData.get("smtpPass") || "").trim();

    const business = {
      name: formData.get("businessName"),
      tagline: formData.get("tagline"),
      description: formData.get("description"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      phoneRaw: formData.get("phoneRaw"),
      email: formData.get("email"),
      whatsapp: formData.get("whatsapp"),
      mapLink: formData.get("mapLink"),
      mapEmbed: formData.get("mapEmbed"),
      founded: Number(formData.get("founded") || 2010),
    };

    const emailConfig = {
      smtpEnabled: formData.get("smtpEnabled") === "on",
      smtpHost: String(formData.get("smtpHost") || "").trim(),
      smtpPort: Number(formData.get("smtpPort") || 587),
      smtpSecure: formData.get("smtpSecure") === "on",
      smtpUser: String(formData.get("smtpUser") || "").trim(),
      smtpPass: newPass || prevEmail.smtpPass || "",
      smtpFromEmail: String(formData.get("smtpFromEmail") || "").trim(),
      smtpFromName: String(formData.get("smtpFromName") || "VK Tiles & Granites").trim(),
      formRecipientEmail: String(formData.get("formRecipientEmail") || "").trim(),
      notifySubject: String(formData.get("notifySubject") || "New enquiry from {{name}} — VK Tiles").trim(),
      sendAutoReply: formData.get("sendAutoReply") === "on",
      autoReplyMessage: formData.get("autoReplyMessage"),
    };

    const contact = {
      eyebrow: formData.get("contactEyebrow"),
      title: formData.get("contactTitle"),
      subtitle: formData.get("contactSubtitle"),
      inquiryTypes: String(formData.get("inquiryTypes") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const businessHours = [
      { day: "Monday – Saturday", hours: formData.get("weekdayHours") },
      { day: "Sunday", hours: formData.get("sundayHours") },
    ];

    const rows = [
      { key: "business", value: business },
      { key: "emailConfig", value: emailConfig },
      { key: "contact", value: contact },
      { key: "businessHours", value: businessHours },
    ];

    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) return { error: error.message };

    revalidatePath("/admin/contact");
    revalidatePath("/contact");
    clearSiteContentCache();
    return { success: true };
  } catch (err) {
    return { error: err.message || "Failed to save contact settings." };
  }
}

export async function sendTestEmailAction(_prevState, formData) {
  try {
    const to = String(formData.get("testEmail") || "").trim();
    await sendTestEmail(to);
    return { success: true, message: `Test email sent to ${to || "recipient address"}.` };
  } catch (err) {
    return { error: err.message || "Failed to send test email." };
  }
}

export async function sendTestEmailFormAction(formData) {
  const result = await sendTestEmailAction(null, formData);
  if (result?.error) throw new Error(result.error);
}

// ─── Enquiries ─────────────────────────────────────────────────────────────

export async function getEnquiries() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("contact_enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateEnquiryStatusAction(id, status) {
  const supabase = await getSupabase();
  await supabase.from("contact_enquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/enquiries");
}

// ─── Publish site content ──────────────────────────────────────────────────

export async function publishSiteContentAction() {
  const supabase = await getSupabase();

  const [galleryRes, testimonialsRes, settingsRes] = await Promise.all([
    supabase.from("gallery_items").select("*").eq("published", true).order("sort_order"),
    supabase.from("testimonials").select("*").eq("published", true).order("sort_order"),
    supabase.from("site_settings").select("*"),
  ]);

  if (galleryRes.error) return { error: galleryRes.error.message };
  if (testimonialsRes.error) return { error: testimonialsRes.error.message };

  const settings = Object.fromEntries((settingsRes.data || []).map((r) => [r.key, r.value]));

  const gallery = (galleryRes.data || []).map((g) => ({
    slug: g.slug,
    caption: g.caption,
    image: g.image,
    thumb: g.thumb || g.image,
    published: true,
  }));

  const testimonials = (testimonialsRes.data || []).map((t) => ({
    name: t.name,
    role: t.role,
    avatar: t.avatar,
    quote: t.quote,
    rating: t.rating,
    published: true,
  }));

  const payload = {
    updatedAt: new Date().toISOString(),
    business: settings.business,
    businessHours: settings.businessHours,
    contact: settings.contact,
    emailConfig: sanitizeEmailConfigForPublish(settings.emailConfig),
    gallery,
    testimonials,
  };

  writeSiteContentJson(payload);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/testimonials");
  revalidatePath("/contact");

  return { success: true };
}

export async function publishSiteContentFormAction() {
  const result = await publishSiteContentAction();
  if (result?.error) throw new Error(result.error);
}
