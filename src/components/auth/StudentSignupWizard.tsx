"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "./AuthCard";
import { ProgressStepper } from "./ProgressStepper";

const STEPS = ["Personal", "Academic", "Interests", "Profile", "Verify"];

const INTERESTS = [
  "Hackathon", "AI", "Cyber Security", "Robotics", "Gaming", 
  "Music", "Dance", "Photography", "Sports", "Startup", 
  "Business", "UI/UX", "Web Development", "App Development", "Marketing"
];

interface StudentSignupWizardProps {
  onBack: () => void;
}

export function StudentSignupWizard({ onBack }: StudentSignupWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const submitFinal = () => {
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      nextStep(); // go to verify
    }, 1500);
  };

  return (
    <AuthCard className="max-w-[540px]">
      <button 
        onClick={prevStep}
        className="absolute top-6 left-6 text-[13px] font-bold text-white/50 hover:text-white flex items-center gap-1 transition-colors"
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
                <h3 className="text-[20px] font-anton uppercase mb-2">Personal Details</h3>
                <input type="text" placeholder="Full Name" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <input type="password" placeholder="Password" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <input type="password" placeholder="Confirm Password" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <button onClick={nextStep} className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 1: Academic */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">Academic Info</h3>
                <input type="text" placeholder="College / University Name" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <input type="text" placeholder="Branch / Major" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                <div className="grid grid-cols-2 gap-4">
                  <select defaultValue="" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white/70 text-[14px] outline-none transition-colors focus:border-[var(--color-lime)] appearance-none cursor-pointer">
                    <option value="" disabled>Current Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Postgrad</option>
                  </select>
                  <input type="text" placeholder="Graduation Year" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                </div>
                <input type="text" placeholder="Student Roll Number (Optional)" className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" />
                
                <button onClick={nextStep} className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2: Interests */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">What are you into?</h3>
                <p className="text-[14px] text-white/50 mb-2">Select topics to personalize your event feed.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors ${
                          isSelected 
                            ? "bg-[var(--color-lime)] border-[var(--color-lime)] text-black"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
                
                <button onClick={nextStep} className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 3: Profile Picture */}
            {step === 3 && (
              <div className="flex flex-col gap-4 text-center">
                <h3 className="text-[20px] font-anton uppercase mb-2">Make it personal</h3>
                <p className="text-[14px] text-white/50 mb-6">Upload a profile picture for your student ID.</p>
                
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 mx-auto flex items-center justify-center mb-6 hover:border-[var(--color-lime)] transition-colors cursor-pointer bg-white/5 group relative overflow-hidden">
                  <div className="text-[32px] group-hover:scale-110 transition-transform">📸</div>
                </div>

                <div className="flex gap-4">
                  <button onClick={submitFinal} className="flex-1 py-4 rounded-[12px] bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
                    Skip
                  </button>
                  <button onClick={submitFinal} className="flex-1 btn btn-primary py-4 text-[16px] shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] flex justify-center items-center">
                    {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Verification */}
            {step === 4 && (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-lime)]/20 flex items-center justify-center text-[40px] mx-auto mb-2 text-[var(--color-lime)] border border-[var(--color-lime)]/30 shadow-[0_0_30px_rgba(215,255,61,0.2)]">
                  ✉️
                </div>
                <h3 className="text-[28px] font-anton uppercase mb-2">Verify your email</h3>
                <p className="text-[15px] text-white/70 mb-8 max-w-sm">
                  We've sent a verification link to your inbox. Click the link to activate your student account.
                </p>
                
                <button className="btn btn-glass px-8 w-full">
                  Resend Email
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
