"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactForm({ inquiryTypes = [] }) {
  const [status, setStatus] = useState("idle");

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("success");
    e.target.reset();
  }

  if (status === "success") {
    return (
      <div className="bg-accent/30 border border-gold/30 p-8 text-center">
        <p className="font-display text-xl text-dark mb-2">Thank you!</p>
        <p className="text-gray text-sm">
          Your enquiry has been received. We&apos;ll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-gold text-sm font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-dark mb-2 uppercase tracking-wider">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-gold transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-dark mb-2 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full px-4 py-3 bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-gold transition-colors"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-dark mb-2 uppercase tracking-wider">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full px-4 py-3 bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-gold transition-colors"
          placeholder="you@example.com"
        />
      </div>

      {inquiryTypes.length > 0 && (
        <div>
          <label htmlFor="type" className="block text-xs font-medium text-dark mb-2 uppercase tracking-wider">
            Enquiry Type
          </label>
          <select
            id="type"
            name="type"
            className="w-full px-4 py-3 bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-gold transition-colors"
          >
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-dark mb-2 uppercase tracking-wider">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-gold transition-colors resize-none"
          placeholder="Tell us about your project or product requirements..."
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Send Enquiry
      </Button>
    </form>
  );
}
