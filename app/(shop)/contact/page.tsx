"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Instagram, Twitter, MapPin, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.enum(["General", "Order", "Product", "Partnership", "Press"], {
    required_error: "Please select a subject",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@nueclothing.com",
    href: "mailto:hello@nueclothing.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@nueclothing",
    href: "https://instagram.com/nueclothing",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    value: "@nueclothing",
    href: "https://twitter.com/nueclothing",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: "42, Kala Ghoda, Fort, Mumbai — 400001",
    href: null,
  },
];

const SUBJECTS = ["General", "Order", "Product", "Partnership", "Press"] as const;

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.message || "Failed to send message. Please try again.");
        return;
      }

      setIsSuccess(true);
      reset();
    } catch {
      setServerError("Unable to send your message. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-nue-charcoal py-16 px-4">
        <div className="container text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-nue-gold mb-4">Get in Touch</p>
          <h1 className="text-5xl font-serif text-nue-cream tracking-tight">Contact Us</h1>
          <p className="mt-4 text-nue-cream/60 text-sm max-w-sm mx-auto leading-relaxed">
            We&apos;re a small, passionate team and we genuinely love hearing from you.
          </p>
        </div>
      </div>

      <div className="container py-16 max-w-5xl">
        <div className="grid md:grid-cols-5 gap-16">
          {/* ── Left: contact info ── */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-6">
                Find Us
              </h2>
              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex gap-3.5 items-start">
                    <div className="w-8 h-8 flex items-center justify-center bg-nue-cream shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-nue-charcoal" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-nue-stone">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-sm text-nue-charcoal hover:text-nue-gold transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-nue-charcoal">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-nue-cream/50 border border-nue-charcoal/8">
              <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-2">
                Response Time
              </p>
              <p className="text-sm text-nue-stone leading-relaxed">
                We respond to all enquiries within 1–2 business days. For urgent order issues,
                please include your order number.
              </p>
            </div>

            <div className="p-5 bg-nue-cream/50 border border-nue-charcoal/8">
              <p className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-2">
                Studio Hours
              </p>
              <p className="text-sm text-nue-stone leading-relaxed">
                Mon – Fri: 10am – 6pm IST
                <br />
                Sat: 11am – 3pm IST
                <br />
                Closed on Sundays
              </p>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="md:col-span-3">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-6">
                <div className="w-16 h-16 rounded-full bg-nue-charcoal flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-nue-gold" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif text-nue-charcoal">Message sent!</h2>
                  <p className="text-sm text-nue-stone leading-relaxed max-w-xs mx-auto">
                    Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-sm text-nue-gold hover:text-nue-charcoal transition-colors"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase text-nue-charcoal mb-6">
                  Send a Message
                </h2>

                {serverError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                        Name
                      </label>
                      <input
                        {...register("name")}
                        className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                        placeholder="Jane Doe"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                        Email
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                      Subject
                    </label>
                    <select
                      {...register("subject")}
                      className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors bg-white appearance-none"
                    >
                      <option value="">Select a topic</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s} Enquiry
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="text-xs text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                      Message
                    </label>
                    <textarea
                      {...register("message")}
                      rows={6}
                      className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold transition-colors resize-none"
                      placeholder="Tell us how we can help..."
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-nue-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-nue-gold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
