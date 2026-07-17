"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "success" | "loading">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      label: "Support Email",
      value: "support@collegeevents.in",
      href: "mailto:support@collegeevents.in",
      icon: (
        <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: "Partnership Email",
      value: "partners@collegeevents.in",
      href: "mailto:partners@collegeevents.in",
      icon: (
        <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: "Instagram",
      value: "@collegeevents",
      href: "https://instagram.com/collegeevents",
      icon: (
        <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zm8 7.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
        </svg>
      )
    },
    {
      label: "LinkedIn",
      value: "CollegeEvents",
      href: "https://linkedin.com/company/collegeevents",
      icon: (
        <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: "Response Time",
      value: "Usually within 24 hours",
      icon: (
        <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="contact" className="py-24 bg-[#0B0B08] border-t border-[var(--color-border)]">
      <div className="max-w-[1360px] mx-auto px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="eyebrow mb-4">
            <span className="dot"></span>
            Reach Out
          </div>
          <h2 className="font-anton text-[44px] sm:text-[64px] text-white tracking-wider leading-none mb-4">
            GET IN TOUCH
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] font-medium max-w-2xl">
            Questions, partnerships or support? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column - Contact Details */}
          <div className="flex flex-col gap-5 w-full">
            {contactInfo.map((info, i) => {
              const content = (
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-[var(--color-lime)]/10 group-hover:border-[var(--color-lime)]/20">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-0.5">
                      {info.label}
                    </p>
                    <p className="text-[16px] sm:text-[17px] text-white font-medium">
                      {info.value}
                    </p>
                  </div>
                </div>
              );

              return info.href ? (
                <motion.a
                  href={info.href}
                  key={i}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-lime)] hover:shadow-[0_0_20px_rgba(215,255,61,0.03)] hover:scale-[1.01] transition-all duration-300 block cursor-pointer"
                >
                  {content}
                </motion.a>
              ) : (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group p-6 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] transition-all duration-300"
                >
                  {content}
                </motion.div>
              );
            })}
          </div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-10 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] backdrop-blur-[10px] w-full"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-[13px] font-bold text-white uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Mahek Dembla"
                    className="w-full rounded-[16px] px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[var(--color-lime)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[13px] font-bold text-white uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    suppressHydrationWarning
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@gmail.com"
                    className="w-full rounded-[16px] px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[var(--color-lime)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-[13px] font-bold text-white uppercase tracking-wide">
                  Subject
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry about Event Listing / Partnership"
                  className="w-full rounded-[16px] px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[var(--color-lime)] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[13px] font-bold text-white uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  suppressHydrationWarning
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  className="w-full rounded-[16px] px-5 py-4 bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-[var(--color-lime)] focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                suppressHydrationWarning
                type="submit"
                disabled={status === "loading"}
                className="btn bg-[var(--color-lime)] text-[#0B0B08] font-bold py-4 rounded-[16px] w-full hover:shadow-[0_0_20px_rgba(215,255,61,0.4)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : status === "success" ? (
                  <>
                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Message Sent!
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
