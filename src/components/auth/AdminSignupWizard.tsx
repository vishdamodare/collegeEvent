"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "./AuthCard";
import { ProgressStepper } from "./ProgressStepper";
import { registerOrganizerAction } from "@/actions/auth/registerOrganizer";
import { uploadFileAction } from "@/actions/auth/upload";
import { useRouter } from "next/navigation";

const STEPS = ["Personal", "Institution", "Documents", "Pending"];

interface AdminSignupWizardProps {
  onBack: () => void;
}

export function AdminSignupWizard({ onBack }: AdminSignupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const validateStep = () => {
    if (step === 0) {
      if (!name || !email || !password) {
        setError("All fields are required");
        return false;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid work email address");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
    } else if (step === 1) {
      if (!college || !department || !position) {
        setError("All institutional fields are required");
        return false;
      }
    } else if (step === 2) {
      if (!documentFile) {
        setError("Verification document upload is required");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep() && step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setError(null);
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Document file size must be less than 5MB");
        return;
      }
      setDocumentFile(file);
      setDocumentName(file.name);
      setError(null);
    }
  };

  const submitFinal = async () => {
    if (!documentFile) {
      setError("Please select a verification document first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload verification document file
      const uploadData = new FormData();
      uploadData.append("file", documentFile);
      uploadData.append("folder", "documents");

      const uploadRes = await uploadFileAction(uploadData);
      if (!uploadRes.success) {
        setError(uploadRes.error || "Failed to upload document file");
        setIsSubmitting(false);
        return;
      }

      // 2. Submit organizer signup server action
      const signupRes = await registerOrganizerAction({
        name,
        email,
        password,
        college,
        department,
        position,
        verificationDocument: uploadRes.url,
      });

      setIsSubmitting(false);

      if (signupRes.success) {
        setStep(3); // Navigate to pending approval step
      } else {
        setError(signupRes.error || "Organizer registration failed");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "An unexpected error occurred during signup");
    }
  };

  return (
    <AuthCard className="max-w-[540px]">
      {step < 3 && (
        <button 
          onClick={prevStep}
          className="absolute top-6 left-6 text-[13px] font-bold text-[var(--color-cobalt)] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      )}

      <div className="mt-8 mb-10">
        <ProgressStepper steps={STEPS} currentStep={step} />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] mb-6 font-semibold text-center font-archivo">
          {error}
        </div>
      )}

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
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" 
                />
                <input 
                  type="email" 
                  placeholder="Official Work Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" 
                />
                
                <button 
                  onClick={nextStep} 
                  className="w-full py-[16px] text-[16px] mt-4 rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 1: Institution Info */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">Institution Info</h3>
                <input 
                  type="text" 
                  placeholder="College / University Name" 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" 
                />
                <input 
                  type="text" 
                  placeholder="Department" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)]" 
                />
                <select 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white/70 text-[14px] outline-none transition-colors focus:border-[var(--color-cobalt)] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Your Position</option>
                  <option value="Faculty / Professor">Faculty / Professor</option>
                  <option value="Club Head">Club Head</option>
                  <option value="Student Council">Student Council</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                </select>
                
                <button 
                  onClick={nextStep} 
                  className="w-full py-[16px] text-[16px] mt-4 rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2: Verification Docs */}
            {step === 2 && (
              <div className="flex flex-col gap-4 text-center">
                <h3 className="text-[20px] font-anton uppercase mb-2">Official Verification</h3>
                <p className="text-[14px] text-white/50 mb-6 text-left font-archivo leading-relaxed">
                  To host events, we need to verify your affiliation. Please upload your Faculty ID or a Club Authorization Letter.
                </p>
                
                <label className="w-full py-10 rounded-[16px] border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-6 hover:border-[var(--color-cobalt)] transition-colors cursor-pointer bg-[#141414] group relative">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="text-[32px] group-hover:scale-110 transition-transform mb-2">📄</div>
                  <p className="text-[13px] font-bold font-archivo text-white/90">
                    {documentName ? `Selected: ${documentName}` : "Upload Document (PDF/JPG/PNG)"}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1 font-archivo">Max size 5MB</p>
                </label>

                <button 
                  onClick={submitFinal} 
                  disabled={isSubmitting}
                  className="w-full py-[16px] text-[16px] rounded-xl font-bold bg-[var(--color-cobalt)] text-white shadow-[4px_4px_0_var(--color-lime)] hover:shadow-[6px_6px_0_var(--color-lime)] hover:-translate-y-0.5 transition-all flex justify-center items-center cursor-pointer"
                >
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
                <p className="text-[15px] text-white/70 mb-8 max-w-sm leading-relaxed font-archivo">
                  We've received your application and sent a verification link to your email. Our team will review your verification documents within 24-48 hours. We'll email you once your admin account is activated.
                </p>
                
                <button 
                  onClick={() => router.push("/")}
                  className="btn btn-glass px-8 w-full cursor-pointer font-bold"
                >
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
