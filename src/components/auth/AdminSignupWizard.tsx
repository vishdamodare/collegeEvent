"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "./AuthCard";
import { ProgressStepper } from "./ProgressStepper";

const STEPS = ["Personal", "Institution", "Documents", "Pending"];

interface AdminSignupWizardProps {
  onBack: () => void;
}

export function AdminSignupWizard({ onBack }: AdminSignupWizardProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  const submitFinal = () => {
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      nextStep(); // go to pending
    }, 1500);
  };

  return (
    <AuthCard className="max-w-[540px]">
      <button 
        onClick={prevStep}
        className="absolute top-6 left-6 text-[13px] font-bold text-[var(--color-cobalt)] hover:text-white flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <div className="mt-8 mb-10">
        <ProgressStepper steps={STEPS} currentStep={step} />
      </div>

      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 0: Personal */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">Admin Details</h3>
                <input type="text" placeholder="Full Name" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" />
                <input type="email" placeholder="Official Work Email" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" />
                <input type="password" placeholder="Password" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" />
                
                <button onClick={nextStep} className="w-full py-[16px] text-[16px] mt-4 rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 1: Institution Info */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">Institution Info</h3>
                <input type="text" placeholder="College / University Name" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" />
                <input type="text" placeholder="Department" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" />
                <select defaultValue="" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white/70 text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)] appearance-none cursor-pointer">
                  <option value="" disabled>Your Position</option>
                  <option>Faculty / Professor</option>
                  <option>Club Head</option>
                  <option>Student Council</option>
                  <option>Event Coordinator</option>
                </select>
                
                <button onClick={nextStep} className="w-full py-[16px] text-[16px] mt-4 rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2: Verification Docs */}
            {step === 2 && (
              <div className="flex flex-col gap-4 text-center">
                <h3 className="text-[20px] font-anton uppercase mb-2">Official Verification</h3>
                <p className="text-[14px] text-white/50 mb-6 text-left">
                  To host events, we need to verify your affiliation. Please upload your Faculty ID or a Club Authorization Letter.
                </p>
                
                <div className="w-full py-10 rounded-[16px] border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-6 hover:border-[var(--color-cobalt)] transition-colors cursor-pointer bg-[#141414] group">
                  <div className="text-[32px] group-hover:scale-110 transition-transform mb-2">📄</div>
                  <p className="text-[13px] font-bold">Upload Document (PDF/JPG)</p>
                  <p className="text-[11px] text-white/40 mt-1">Max size 5MB</p>
                </div>

                <button onClick={submitFinal} className="w-full py-[16px] text-[16px] rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all flex justify-center items-center">
                  {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Submit for Verification"}
                </button>
              </div>
            )}

            {/* STEP 3: Pending */}
            {step === 3 && (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-cobalt)]/20 flex items-center justify-center text-[40px] mx-auto mb-2 text-[var(--color-cobalt)] border border-[var(--color-cobalt)]/30 shadow-[0_0_30px_rgba(77,159,255,0.2)]">
                  ⏳
                </div>
                <h3 className="text-[28px] font-anton uppercase mb-2">Pending Approval</h3>
                <p className="text-[15px] text-white/70 mb-8 max-w-sm">
                  We've received your application. Our team will review your documents within 24-48 hours. We'll email you once your admin account is activated.
                </p>
                
                <button className="btn btn-glass px-8 w-full">
                  Return to Home
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
