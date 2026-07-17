"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "@/components/auth/AuthCard";
import { ProgressStepper } from "@/components/auth/ProgressStepper";
import { completeOAuthStudentOnboardingAction } from "@/actions/auth/oauth";

const STEPS = ["Academic", "Interests"];

const INTERESTS = [
  "Hackathon", "AI", "Cyber Security", "Robotics", "Gaming", 
  "Music", "Dance", "Photography", "Sports", "Startup", 
  "Business", "UI/UX", "Web Development", "App Development", "Marketing"
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      if (!college || !branch || !academicYear || !graduationYear) {
        setError("Please fill out all required academic fields");
        return;
      }
      setError(null);
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0);
    }
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await completeOAuthStudentOnboardingAction({
      college,
      branch,
      academicYear,
      graduationYear,
      rollNumber,
      interests: selectedInterests,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to save profile. Please try again.");
    }
  };

  return (
    <AuthCard className="max-w-[540px]">
      {step > 0 && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 text-[13px] font-bold text-white/50 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      )}

      <div className="mt-8 mb-10 text-center">
        <h2 className="text-[28px] font-anton uppercase tracking-tight mb-2">
          Complete Profile
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-6">
          We need a few details to complete your student profile setup.
        </p>
        <ProgressStepper steps={STEPS} currentStep={step} />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] mb-6 font-semibold text-center">
          {error}
        </div>
      )}

      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[18px] font-anton uppercase mb-1">Academic Info</h3>
                <input 
                  type="text" 
                  placeholder="College / University Name" 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <input 
                  type="text" 
                  placeholder="Branch / Major" 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white/70 text-[14px] outline-none transition-colors focus:border-[var(--color-lime)] appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Current Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgrad">Postgrad</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Graduation Year" 
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Student Roll Number (Optional)" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                
                <button 
                  onClick={handleNext} 
                  className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] font-bold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[18px] font-anton uppercase mb-1">What are you into?</h3>
                <p className="text-[13px] text-white/50 mb-2">Select topics to personalize your event feed.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors cursor-pointer ${
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
                
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] flex justify-center items-center font-bold cursor-pointer"
                >
                  {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Submit Profile"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
