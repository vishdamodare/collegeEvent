"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Discover Events",
      desc: "Find cultural, technical, sports, and literary events from colleges across Mumbai and Pune.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-13.32 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Verified Colleges",
      desc: "Only verified organizers and official student councils can publish and manage listings.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Easy Registration",
      desc: "Register for any event in under 30 seconds with pre-filled student profile parameters.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Personalized Recommendations",
      desc: "Get suggestions on your home feed tailored to your specific branch, year, and interests.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Event Reminders",
      desc: "Receive real-time alerts before registration deadlines and event dates close.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      title: "Digital Tickets",
      desc: "Access your verified QR registration passes and details from your personalized dashboard.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#0A0A0A] border-t border-[var(--color-border)] overflow-hidden">
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
            Overview
          </div>
          <h2 className="font-anton text-[44px] sm:text-[64px] text-white tracking-wider leading-none mb-4">
            ABOUT COLLEGEEVENTS
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] font-medium max-w-2xl">
            Connecting students across campuses through one unified platform.
          </p>
        </motion.div>

        {/* Narrative & Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-lg leading-relaxed text-[var(--color-text-muted)] space-y-6 font-light animate-text"
          >
            <p>
              CollegeEvents is India's platform dedicated to discovering, exploring and registering for inter-college festivals, cultural events, sports tournaments, workshops, hackathons and competitions.
            </p>
            <p>
              Instead of following dozens of college Instagram pages and websites, students can discover everything in one place.
            </p>
            <p>
              The platform connects colleges with students while giving organizers a better way to promote and manage events.
            </p>
          </motion.div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-5 w-full">
            {[
              { num: "120+", label: "Partner Colleges" },
              { num: "850+", label: "Events Listed" },
              { num: "15K+", label: "Students Connected" },
              { num: "50+", label: "Cities" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-[34px] px-[28px] rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-lime)] hover:shadow-[0_0_30px_rgba(215,255,61,0.05)] transition-all duration-300 flex flex-col justify-center"
              >
                <h3 className="font-anton text-[40px] sm:text-[56px] text-[var(--color-lime)] leading-none mb-1">
                  {stat.num}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[var(--color-text-muted)] font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why CollegeEvents Section */}
        <div className="mb-24">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-anton text-[28px] sm:text-[36px] text-white tracking-wider mb-10 text-center"
          >
            WHY COLLEGEEVENTS?
          </motion.h3>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h4 className="font-archivo text-[18px] text-white font-extrabold">
                  {feat.title}
                </h4>
                <p className="text-[14.5px] text-[var(--color-text-muted)] leading-relaxed font-light">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mission Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-10 sm:p-14 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] text-center max-w-4xl mx-auto backdrop-blur-[10px]"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-[var(--color-lime)]/10 flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-anton text-[32px] text-white tracking-wider mb-4">
            OUR MISSION
          </h3>
          <p className="text-[16px] sm:text-[18px] leading-relaxed text-[var(--color-text-muted)] max-w-2xl mx-auto font-light">
            To become India's largest student event ecosystem where every student can discover opportunities beyond their own campus.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
