"use client";



import { useActionState } from "react";

import { saveContactSettingsAction, sendTestEmailAction } from "@/app/admin/actions/site-content";

import { AdminField, AdminSection, AdminTextArea, ui } from "@/components/admin/admin-ui";



export default function ContactSettingsForm({ settings = {} }) {

  const business = settings.business || {};

  const contact = settings.contact || {};

  const emailConfig = settings.emailConfig || {};

  const hours = settings.businessHours || [];



  const [state, formAction, pending] = useActionState(saveContactSettingsAction, null);

  const [testState, testAction, testPending] = useActionState(sendTestEmailAction, null);



  return (

    <div className="space-y-8 max-w-4xl">

      <form action={formAction} className="space-y-8">

        <AdminSection title="Business information">

          <div className="grid sm:grid-cols-2 gap-4">

            <AdminField label="Business name" name="businessName" defaultValue={business.name} />

            <AdminField label="Tagline" name="tagline" defaultValue={business.tagline} />

            <AdminField label="Phone (display)" name="phone" defaultValue={business.phone} />

            <AdminField label="Phone (tel link)" name="phoneRaw" defaultValue={business.phoneRaw} />

            <AdminField label="Public email" name="email" defaultValue={business.email} type="email" />

            <AdminField label="WhatsApp URL" name="whatsapp" defaultValue={business.whatsapp} />

            <AdminField label="Founded year" name="founded" defaultValue={business.founded} type="number" />

            <AdminField label="Google Maps link" name="mapLink" defaultValue={business.mapLink} />

          </div>

          <AdminField label="Address" name="address" defaultValue={business.address} />

          <AdminTextArea label="Map embed URL" name="mapEmbed" defaultValue={business.mapEmbed} rows={2} />

          <AdminTextArea label="Description" name="description" defaultValue={business.description} rows={3} />

        </AdminSection>



        <AdminSection

          title="SMTP email configuration"

          description="Configure outgoing email for contact form notifications. Works with Gmail, Outlook, Zoho, Hostinger, cPanel, etc."

        >

          <label className={ui.checkbox}>

            <input type="checkbox" name="smtpEnabled" defaultChecked={emailConfig.smtpEnabled !== false} />

            Enable email notifications

          </label>



          <div className="grid sm:grid-cols-2 gap-4">

            <AdminField label="SMTP host" name="smtpHost" defaultValue={emailConfig.smtpHost} placeholder="smtp.gmail.com" />

            <AdminField label="SMTP port" name="smtpPort" defaultValue={emailConfig.smtpPort || 587} type="number" />

            <AdminField label="SMTP username" name="smtpUser" defaultValue={emailConfig.smtpUser} placeholder="your-email@gmail.com" />

            <AdminField

              label="SMTP password"

              name="smtpPass"

              type="password"

              placeholder={emailConfig.hasSmtpPassword ? "•••••••• (leave blank to keep)" : "App password"}

            />

            <AdminField label="From email" name="smtpFromEmail" defaultValue={emailConfig.smtpFromEmail} type="email" />

            <AdminField label="From name" name="smtpFromName" defaultValue={emailConfig.smtpFromName || "VK Tiles & Granites"} />

            <AdminField

              label="Send enquiries to"

              name="formRecipientEmail"

              defaultValue={emailConfig.formRecipientEmail}

              type="email"

            />

            <AdminField

              label="Notification subject"

              name="notifySubject"

              defaultValue={emailConfig.notifySubject || "New enquiry from {{name}} — VK Tiles"}

            />

          </div>



          <label className={ui.checkbox}>

            <input type="checkbox" name="smtpSecure" defaultChecked={emailConfig.smtpSecure} />

            Use SSL/TLS (port 465)

          </label>



          <div className={ui.infoBox}>

            <p><strong className="text-sky">Gmail:</strong> smtp.gmail.com, port 587, use an App Password</p>

            <p><strong className="text-sky">Outlook:</strong> smtp.office365.com, port 587</p>

            <p><strong className="text-sky">Zoho:</strong> smtp.zoho.in, port 587</p>

            <p>You can also set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local as a fallback.</p>

          </div>

        </AdminSection>



        <AdminSection title="Auto-reply to customers">

          <label className={ui.checkbox}>

            <input type="checkbox" name="sendAutoReply" defaultChecked={emailConfig.sendAutoReply} />

            Send automatic thank-you email to customer (if they provide email)

          </label>

          <AdminTextArea label="Thank-you message" name="autoReplyMessage" defaultValue={emailConfig.autoReplyMessage} rows={3} />

        </AdminSection>



        <AdminSection title="Contact page content">

          <AdminField label="Eyebrow" name="contactEyebrow" defaultValue={contact.eyebrow} />

          <AdminField label="Title" name="contactTitle" defaultValue={contact.title} />

          <AdminField label="Subtitle" name="contactSubtitle" defaultValue={contact.subtitle} />

          <AdminField

            label="Inquiry types (comma separated)"

            name="inquiryTypes"

            defaultValue={(contact.inquiryTypes || []).join(", ")}

          />

          <div className="grid sm:grid-cols-2 gap-4">

            <AdminField label="Weekday hours" name="weekdayHours" defaultValue={hours.find((h) => h.day?.includes("Monday"))?.hours} />

            <AdminField label="Sunday hours" name="sundayHours" defaultValue={hours.find((h) => h.day === "Sunday")?.hours} />

          </div>

        </AdminSection>



        {state?.error && <p className={ui.error}>{state.error}</p>}

        {state?.success && <p className={ui.success}>Contact settings saved.</p>}



        <button type="submit" disabled={pending} className={`px-6 py-3 ${ui.btnPrimary}`}>

          {pending ? "Saving..." : "Save contact settings"}

        </button>

      </form>



      <AdminSection title="Test SMTP connection" description="Save settings first, then send a test email to verify configuration.">

        <form action={testAction} className="flex flex-col sm:flex-row gap-3">

          <input

            name="testEmail"

            type="email"

            placeholder="test@email.com (optional — uses recipient if empty)"

            className={`flex-1 ${ui.input}`}

          />

          <button type="submit" disabled={testPending} className={ui.btnOutlineSky}>

            {testPending ? "Sending..." : "Send test email"}

          </button>

        </form>

        {testState?.error && <p className={ui.error}>{testState.error}</p>}

        {testState?.success && <p className={ui.success}>{testState.message}</p>}

      </AdminSection>

    </div>

  );

}


