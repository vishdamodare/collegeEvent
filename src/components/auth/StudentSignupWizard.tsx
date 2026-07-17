"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "./AuthCard";
import { ProgressStepper } from "./ProgressStepper";
import { registerStudentAction } from "@/actions/auth/registerStudent";
import { resendVerificationAction } from "@/actions/auth/verifyEmail";
import { uploadFileAction } from "@/actions/auth/upload";

const STEPS = ["Personal", "Academic", "Interests", "Profile", "Success"];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  if (!mounted) {
    return null;
  }

  const validateStep = () => {
    if (step === 0) {
      if (!name || !email || !password || !confirmPassword) {
        setError("All fields are required");
        return false;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    } else if (step === 1) {
      if (!college || !branch || !academicYear || !graduationYear) {
        setError("All required academic fields must be filled");
        return false;
      }
      if (!/^\d{4}$/.test(graduationYear)) {
        setError("Graduation year must be a 4-digit number");
        return false;
      }
    } else if (step === 2) {
      if (selectedInterests.length === 0) {
        setError("Please select at least one interest");
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

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const submitFinal = async (skipImage: boolean = false) => {
    setIsSubmitting(true);
    setError(null);

    let imageUrl = "";

    try {
      // 1. Upload profile image if selected and not skipped
      if (!skipImage && profileImageFile) {
        const uploadData = new FormData();
        uploadData.append("file", profileImageFile);
        uploadData.append("folder", "students");

        const uploadRes = await uploadFileAction(uploadData);
        if (!uploadRes.success) {
          setError(uploadRes.error || "Failed to upload profile image");
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadRes.url || "";
      }

      // 2. Submit student signup action
      const signupRes = await registerStudentAction({
        name,
        email,
        password,
        confirmPassword,
        college,
        branch,
        academicYear,
        graduationYear,
        rollNumber,
        interests: selectedInterests,
        profileImage: imageUrl || undefined,
      });

      setIsSubmitting(false);

      if (signupRes.success) {
        setStep(4); // Navigate to email verification step
      } else {
        setError(signupRes.error || "Sign up failed");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "An unexpected error occurred during signup");
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    setError(null);
    const res = await resendVerificationAction(email);
    setIsSubmitting(false);
    if (res.success) {
      alert("Verification email resent successfully!");
    } else {
      setError(res.error || "Failed to resend email.");
    }
  };

  return (
    <AuthCard className="max-w-[540px]">
      {step < 4 && (
        <button 
          onClick={prevStep}
          className="absolute top-6 left-6 text-[13px] font-bold text-white/50 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
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
                <h3 className="text-[20px] font-anton uppercase mb-2">Personal Details</h3>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-[12px] bg-[#141414] border border-[#2A2A2A] text-white text-[14px] outline-none transition-colors focus:border-[var(--color-lime)]" 
                />
                <button 
                  onClick={nextStep} 
                  className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] font-bold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 1: Academic */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">Academic Info</h3>
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
                  onClick={nextStep} 
                  className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] font-bold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2: Interests */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[20px] font-anton uppercase mb-2">What are you into?</h3>
                <p className="text-[14px] text-white/50 mb-2 font-archivo">Select topics to personalize your event feed.</p>
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
                  onClick={nextStep} 
                  className="btn btn-primary w-full py-[16px] text-[16px] mt-4 shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] font-bold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 3: Profile Picture */}
            {step === 3 && (
              <div className="flex flex-col gap-4 text-center">
                <h3 className="text-[20px] font-anton uppercase mb-2">Make it personal</h3>
                <p className="text-[14px] text-white/50 mb-6 font-archivo">Upload a profile picture for your student ID.</p>
                
                <label className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 mx-auto flex items-center justify-center mb-6 hover:border-[var(--color-lime)] transition-colors cursor-pointer bg-white/5 group relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[32px] group-hover:scale-110 transition-transform">📸</div>
                  )}
                </label>

                <div className="flex gap-4">
                  <button 
                    onClick={() => submitFinal(true)} 
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-[12px] bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={() => submitFinal(false)} 
                    disabled={isSubmitting}
                    className="flex-1 btn btn-primary py-4 text-[16px] shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)] flex justify-center items-center font-bold cursor-pointer"
                  >
                    {isSubmitting ? <span className="animate-spin text-xl">↻</span> : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--color-lime)]/20 flex items-center justify-center text-[40px] mx-auto mb-2 text-[var(--color-lime)] border border-[var(--color-lime)]/30 shadow-[0_0_30px_rgba(215,255,61,0.2)]">
                  ✓
                </div>
                <h3 className="text-[28px] font-anton uppercase mb-2">Account Created!</h3>
                <p className="text-[15px] text-white/70 mb-8 max-w-sm leading-relaxed font-archivo">
                  Your student account has been created successfully. You can now log in to access the platform.
                </p>
                
                <button 
                  onClick={() => window.location.href = "/login"} 
                  className="btn btn-primary px-8 w-full cursor-pointer flex justify-center items-center font-bold py-[16px] shadow-[4px_4px_0_var(--color-coral)] hover:shadow-[6px_6px_0_var(--color-coral)]"
                >
                  Log In to Account
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthCard>
  );
}
