import "server-only";
import fs from "fs";
import path from "path";
import {
  business as defaultBusiness,
  businessHours as defaultBusinessHours,
  contact as defaultContact,
  gallery as defaultGallery,
  testimonials as defaultTestimonials,
} from "@/content/data";

let _cache = null;

const DEFAULTS = {
  business: defaultBusiness,
  businessHours: defaultBusinessHours,
  contact: defaultContact,
  gallery: defaultGallery,
  testimonials: defaultTestimonials,
  emailConfig: {
    formRecipientEmail: defaultBusiness.email,
    sendAutoReply: false,
    autoReplyMessage:
      "Thank you for contacting VK Tiles & Granites. We have received your enquiry and will respond shortly.",
  },
};

function loadFromDisk() {
  try {
    const filePath = path.join(process.cwd(), "content", "site-content.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch {
    /* fallback */
  }
  return null;
}

export function getSiteContent() {
  if (!_cache) {
    const file = loadFromDisk();
    _cache = {
      ...DEFAULTS,
      ...(file || {}),
      business: { ...DEFAULTS.business, ...(file?.business || {}) },
      contact: { ...DEFAULTS.contact, ...(file?.contact || {}) },
      emailConfig: { ...DEFAULTS.emailConfig, ...(file?.emailConfig || {}) },
      gallery: file?.gallery?.length ? file.gallery : DEFAULTS.gallery,
      testimonials: file?.testimonials?.length ? file.testimonials : DEFAULTS.testimonials,
      businessHours: file?.businessHours?.length ? file.businessHours : DEFAULTS.businessHours,
    };
  }
  return _cache;
}

export function getBusiness() {
  return getSiteContent().business;
}

export function getGallery() {
  return getSiteContent().gallery.filter((g) => g.published !== false);
}

export function getTestimonials() {
  return getSiteContent().testimonials.filter((t) => t.published !== false);
}

export function getContactConfig() {
  const { contact, emailConfig, businessHours } = getSiteContent();
  return { contact, emailConfig, businessHours };
}

export function clearSiteContentCache() {
  _cache = null;
}
