#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { loadEnvLocal, root } from "./load-env.mjs";
import {
  business,
  businessHours,
  contact,
  gallery,
  testimonials,
} from "../content/data.js";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function importSettings() {
  const rows = [
    { key: "business", value: business },
    { key: "businessHours", value: businessHours },
    { key: "contact", value: contact },
    {
      key: "emailConfig",
      value: {
        formRecipientEmail: business.email,
        sendAutoReply: true,
        autoReplyMessage:
          "Thank you for contacting VK Tiles & Granites. We have received your enquiry and will respond shortly.",
      },
    },
  ];
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  console.log("Settings: 4 keys");
}

async function importGallery() {
  const rows = gallery.map((g, i) => ({
    slug: g.slug || slugify(g.caption),
    caption: g.caption,
    image: g.image,
    thumb: g.thumb || g.image,
    sort_order: i,
    published: true,
  }));
  const { error } = await supabase.from("gallery_items").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`Gallery: ${rows.length}`);
}

async function importTestimonials() {
  const rows = testimonials.map((t, i) => ({
    name: t.name,
    role: t.role,
    avatar: t.avatar,
    quote: t.quote,
    rating: t.rating || 5,
    sort_order: i,
    published: true,
  }));
  const { error } = await supabase.from("testimonials").insert(rows);
  if (error && !error.message.includes("duplicate")) throw error;
  console.log(`Testimonials: ${rows.length}`);
}

async function writeLocalJson() {
  const payload = {
    updatedAt: new Date().toISOString(),
    business,
    businessHours,
    contact,
    emailConfig: {
      formRecipientEmail: business.email,
      sendAutoReply: true,
      autoReplyMessage:
        "Thank you for contacting VK Tiles & Granites. We have received your enquiry and will respond shortly.",
    },
    gallery,
    testimonials,
  };
  const out = path.join(root, "content", "site-content.json");
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
  console.log("Wrote content/site-content.json");
}

async function main() {
  console.log("Importing site content to Supabase...");
  await importSettings();
  await importGallery();
  await importTestimonials();
  await writeLocalJson();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
