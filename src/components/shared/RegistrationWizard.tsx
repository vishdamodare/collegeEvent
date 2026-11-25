"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Image from "next/image";
import { 
  X, Check, Loader2, Users, User, Plus, Trash2, 
  Ticket, Calendar, Share2, Printer, MapPin, 
  Tag, Info, Smartphone, Mail, GraduationCap, ShieldAlert 
} from "lucide-react";
import { registerForFreeEvent } from "@/actions/registrations";
import { updateStudentProfile } from "@/actions/profile";
import { authClient } from "@/lib/auth-client";
import type { StudentProfile } from "@prisma/client";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { format } from "date-fns";

type WizardEvent = {
  id: string;
  title: string;
  date: Date | string;
  location: string;
  capacity: number;
  eventType?: string;
  teamMinSize?: number;
  teamMaxSize?: number;
  additionalQuestions?: unknown; // organizer questions: JSON array (or legacy JSON string)
  // Optional display fields some callers provide
  cat?: string;
  college?: string;
  img?: string;
  venue?: string;
};

type WizardQuestion = { label: string; type?: string; required?: boolean; options?: string[]; placeholder?: string };

export type WizardProfile = Partial<Pick<StudentProfile,
  "academicYear" | "bio" | "branch" | "college" | "gender" | "interests" | "phoneNumber" | "profileImage" | "studentId"
>> & { user?: { name: string | null; email: string } | null };

interface RegistrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  event: WizardEvent;
  initialProfile: WizardProfile | null;
}

const subscribeNoop = () => () => {};

export function RegistrationWizard({ isOpen, onClose, event, initialProfile }: RegistrationWizardProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  
  // Step indicator matching implementation plan: 
  // 1: Profile Verification
  // 2: Event Registration (Summary & Confirm)
  // 3: Team Name (if TEAM)
  // 4: Team Members (if TEAM)
  // 5: Custom Event Questions
  // 6: Review Registration
  // 7: Success Ticket
  const [step, setStep] = useState(1);

  // Step 1: Profile forms
  const [name, setName] = useState(initialProfile?.user?.name || "");
  const [email] = useState(initialProfile?.user?.email || "");
  const { data: session } = authClient.useSession();
  // Account email is read-only; fall back to the session when the student has no profile row yet
  const accountEmail = email || session?.user?.email || "";
  const [phone, setPhone] = useState(initialProfile?.phoneNumber || "");
  const [college, setCollege] = useState(initialProfile?.college || "");
  const [branch, setBranch] = useState(initialProfile?.branch || "");
  const [academicYear, setAcademicYear] = useState(initialProfile?.academicYear || "");
  const [gender, setGender] = useState(initialProfile?.gender || "");
  const [studentId, setStudentId] = useState(initialProfile?.studentId || "");

  // Step 3 & 4: Team configuration
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(String(event?.teamMinSize || 2));
  const [teamMembers, setTeamMembers] = useState<Array<{
    name: string;
    email: string;
    phone: string;
    college: string;
    branch: string;
    academicYear: string;
  }>>([]);

  // Step 5: Dynamic Questions
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 6: Review confirmation checkbox
  const [confirmCorrect, setConfirmCorrect] = useState(false);

  // Step 7: Generated Ticket details
  const [generatedTicket, setGeneratedTicket] = useState<{ id: string; ticketNumber: string; qrCode: string | null } | null>(null);

  // Transitions
  const [isPending, startTransition] = useTransition();

  if (!mounted || !isOpen || !event) return null;

  const eventType = event.eventType || "INDIVIDUAL";
  const teamMin = event.teamMinSize || 2;
  const teamMax = event.teamMaxSize || 4;

  // Parse dynamic organizer-created questions from Event.additionalQuestions
  let dynamicQuestions: WizardQuestion[] = [];
  if (event.additionalQuestions) {
    try {
      dynamicQuestions = typeof event.additionalQuestions === "string"
        ? JSON.parse(event.additionalQuestions)
        : event.additionalQuestions;
    } catch (e) {
      dynamicQuestions = [];
    }
  }
  if (!Array.isArray(dynamicQuestions)) {
    dynamicQuestions = [];
  }

  // --- Step Handlers ---

  // Step 1 Save -> Step 2
  const handleProfileSave = () => {
    // Name the empty fields — a greyed placeholder easily looks like a filled value
    const missing = Object.entries({
      "Full Name": name, "Email": accountEmail, "Phone Number": phone,
      "College": college, "Branch": branch, "Academic Year": academicYear,
    }).filter(([, v]) => !v.trim()).map(([label]) => label);
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateStudentProfile({
          name,
          college,
          branch,
          academicYear,
          bio: initialProfile?.bio || "",
          phoneNumber: phone,
          gender: gender || "",
          studentId: studentId || "",
          interests: initialProfile?.interests || [],
          profileImage: initialProfile?.profileImage || "",
        });

        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Profile verified!");
          setStep(2);
        }
      } catch (err) {
        console.error("Profile save error:", err);
        toast.error((err as Error)?.message || "Could not save your profile. Please try again.");
      }
    });
  };

  // Step 2 Summary -> Step 3 (Team details)
  const handleConfirmSummary = () => {
    setStep(3);
  };

  // Step 3 Team Configuration -> Step 4 (Roster) or Step 5/6
  const handleTeamDetailsSave = () => {
    if (eventType === "TEAM") {
      if (!teamName.trim()) {
        toast.error("Please provide a team name.");
        return;
      }
      const sizeVal = parseInt(teamSize);
      if (isNaN(sizeVal) || sizeVal < teamMin || sizeVal > teamMax) {
        toast.error(`Team size must be between ${teamMin} and ${teamMax}.`);
        return;
      }

      // Initialize/resize team members array based on selected Team Size (excluding Captain)
      const countNeeded = sizeVal - 1;
      const updated = [...teamMembers];
      if (updated.length < countNeeded) {
        while (updated.length < countNeeded) {
          updated.push({ name: "", email: "", phone: "", college: "", branch: "", academicYear: "" });
        }
      } else if (updated.length > countNeeded) {
        updated.splice(countNeeded);
      }
      setTeamMembers(updated);
      setStep(4);
    } else {
      // For INDIVIDUAL event, team name is optional, so we proceed directly
      if (dynamicQuestions.length > 0) {
        setStep(5);
      } else {
        setStep(6);
      }
    }
  };

  // Step 4 Roster Save -> Step 5 (Questions) or Step 6 (Review)
  const handleTeamRosterSave = () => {
    const totalSize = teamMembers.length + 1; // Captain + members
    if (totalSize < teamMin || totalSize > teamMax) {
      toast.error(`Team size must be between ${teamMin} and ${teamMax} members.`);
      return;
    }

    // Verify all member fields are filled
    for (let i = 0; i < teamMembers.length; i++) {
      const m = teamMembers[i];
      if (!m.name || !m.email || !m.phone || !m.college || !m.branch || !m.academicYear) {
        toast.error(`Please complete all fields for Member ${i + 1}.`);
        return;
      }
    }

    if (dynamicQuestions.length > 0) {
      setStep(5);
    } else {
      setStep(6);
    }
  };

  // Step 5 Dynamic Questions -> Step 6 (Review)
  const handleQuestionsSave = () => {
    // Validate required dynamic questions
    for (const q of dynamicQuestions) {
      if (q.required && !answers[q.label]?.trim()) {
        toast.error(`"${q.label}" is a required question.`);
        return;
      }
    }
    setStep(6);
  };

  // Step 6 Final Submit -> Step 7 (Ticket Success)
  const handleFinalSubmit = () => {
    if (!confirmCorrect) {
      toast.error("Please confirm that the information provided is correct.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await registerForFreeEvent(event.id, {
          answers,
          teamName: teamName.trim() || undefined,
          members: eventType === "TEAM" ? teamMembers : undefined
        });

        if (res.error) {
          toast.error(res.message || res.error);
        } else {
          toast.success("Registration completed!");
          setGeneratedTicket(res.ticket ?? null);
          setStep(7);
        }
      } catch (err) {
        console.error("Submit Error:", err);
        toast.error((err as Error).message || "An unexpected error occurred during submission.");
      }
    });
  };

  // Add Member
  const handleAddMember = () => {
    if (teamMembers.length + 1 >= teamMax) {
      toast.error(`Maximum team limit is ${teamMax} members.`);
      return;
    }
    setTeamMembers([
      ...teamMembers,
      { name: "", email: "", phone: "", college: "", branch: "", academicYear: "" }
    ]);
  };

  // Remove Member
  const handleRemoveMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  // Member Input Change
  const handleMemberChange = (idx: number, field: string, val: string) => {
    setTeamMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  // Share Ticket Actions
  const handleWhatsAppShare = () => {
    if (!generatedTicket) return;
    const message = `🎉 I'm registered for ${event.title}! \n🎫 Ticket: ${generatedTicket.ticketNumber}\n📍 Venue: ${event.location}\n📅 Date: ${format(new Date(event.date), "MMMM d, yyyy")}\n\nView Pass: ${window.location.origin}/dashboard/tickets/${generatedTicket.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCopyLink = () => {
    if (!generatedTicket) return;
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/tickets/${generatedTicket.id}`);
    toast.success("Ticket link copied to clipboard!");
  };

  const handleNativeShare = () => {
    if (!generatedTicket) return;
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${event.title}`,
        text: `Check out my ticket for ${event.title}!`,
        url: `${window.location.origin}/dashboard/tickets/${generatedTicket.id}`
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <style dangerouslySetInnerHTML={{__html: `
        select option {
          background-color: #0A0D1C !important;
          color: #FFFFFF !important;
        }
      `}} />
      
      <div className="w-full max-w-2xl bg-[#0A0D1C] border border-white/10 rounded-2xl p-6 md:p-8 relative shadow-2xl my-8">
        
        {/* Close Button */}
        {step < 7 && (
          <button 
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/55 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress through the six steps */}
        {step < 7 && (
          <div className="mb-7 mr-14 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step} aria-label={`Step ${step} of 6`}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span key={n} className={cn("h-1 flex-1 rounded-full transition-colors", n <= step ? "bg-lime" : "bg-white/15")} />
            ))}
          </div>
        )}

        {/* STEP 1: PROFILE VERIFICATION */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 1 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">Your details</h2>
              <p className="text-[15px] text-white/65 mt-2">We save these to your profile, so you won&apos;t retype them for the next fest.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <input 
                  type="email" 
                  value={accountEmail} 
                  readOnly 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white/50 text-[16px] outline-none cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. +91 98765 43210" 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">University / College <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Branch / Major <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Academic Year <span className="text-red-400">*</span></label>
                <select 
                  value={academicYear} 
                  onChange={(e) => setAcademicYear(e.target.value)} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
              <details className="sm:col-span-2 group">
                <summary className="cursor-pointer select-none text-[14px] font-medium text-white/70 hover:text-white list-none flex items-center gap-2">
                  <span className="transition-transform group-open:rotate-90" aria-hidden>›</span>
                  More details (optional)
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-1.5">Student ID or roll number</label>
                <input 
                  type="text" 
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)} 
                  placeholder="e.g. 2026 CS 105"
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>
                </div>
              </details>
            </div>

            <button 
              onClick={handleProfileSave}
              disabled={isPending}
              className="btn btn-primary w-full py-4 text-[15px] font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save and continue"}
            </button>
          </div>
        )}

        {/* STEP 2: EVENT SUMMARY */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 2 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">Check the event</h2>
              <p className="text-[15px] text-white/65 mt-2">Make sure this is the one you want to register for.</p>
            </div>

            <div className="bg-white/[0.05] border border-white/15 rounded-2xl overflow-hidden p-5 mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 border-b border-white/10 pb-4">
                {event.img && (
                  <div className="w-full sm:w-28 aspect-video sm:aspect-square relative rounded-xl overflow-hidden shrink-0">
                    <img src={event.img} alt={event.title} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-[#FF6B70]">{event.cat ? event.cat.charAt(0) + event.cat.slice(1).toLowerCase() : ""}</span>
                  <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                  <div className="text-[13px] text-white/55 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B70]" /> {event.college} · {event.venue}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-white/55 block font-semibold">Date</span>
                  <span className="text-white font-medium">{format(new Date(event.date), "MMMM d, yyyy")}</span>
                </div>
                <div>
                  <span className="text-white/55 block font-semibold">Type</span>
                  <span className="text-white font-medium capitalize">{eventType.toLowerCase()} Event</span>
                </div>
                {eventType === "TEAM" && (
                  <div>
                    <span className="text-white/55 block font-semibold">Team size</span>
                    <span className="text-white font-medium">{teamMin} - {teamMax} Members</span>
                  </div>
                )}
                <div>
                  <span className="text-white/55 block font-semibold">Seats</span>
                  <span className="text-white font-medium">{event.capacity.toLocaleString()} Seats</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-transparent border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleConfirmSummary}
                className="flex-[2] btn btn-primary py-4 text-sm font-bold flex items-center justify-center"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REGISTRATION TYPE (TEAM SPEC NAME) */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 3 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">
                {eventType === "TEAM" ? "Your team" : "Team or club"}
              </h2>
              <p className="text-[15px] text-white/65 mt-2">
                {eventType === "TEAM" 
                  ? "Pick a name for your team." 
                  : "Add a team or club name if you have one (optional)."}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[14px] font-medium text-white/85 mb-2">
                  {eventType === "TEAM" ? "Team Name *" : "Team / Club Name (Optional)"}
                </label>
                <input 
                  type="text" 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)} 
                  placeholder={eventType === "TEAM" ? "e.g. Code Gladiators" : "e.g. Cultural Club / Individual"} 
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                />
              </div>

              {eventType === "TEAM" && (
                <div>
                  <label className="block text-[14px] font-medium text-white/85 mb-2">Team Size (Including Captain)</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime dark-options"
                  >
                    {Array.from({ length: teamMax - teamMin + 1 }, (_, i) => {
                      const size = teamMin + i;
                      return (
                        <option key={size} value={size.toString()}>
                          {size} Members
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-transparent border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleTeamDetailsSave}
                className="flex-[2] btn btn-primary py-4 text-sm font-bold"
              >
                {eventType === "TEAM" ? "Add team members" : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TEAM MEMBERS ROSTER */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 4 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">Your team</h2>
              <p className="text-[15px] text-white/65 mt-2">Teams need {teamMin} to {teamMax} members.</p>
            </div>

            <div className="space-y-5 mb-6 max-h-[360px] overflow-y-auto pr-1">
              {/* Captain */}
              <div className="p-4 rounded-xl bg-lime/5 border border-lime/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime text-black font-anton text-[13px] flex items-center justify-center">
                  C
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-bold text-white">{name} (You)</div>
                  <div className="text-[13px] text-white/55">{accountEmail} · Team Captain</div>
                </div>
                <span className="text-[12px] font-bold text-[#FF6B70] bg-lime/10 border border-lime/20 px-2 py-0.5 rounded-full">
                  Leader
                </span>
              </div>

              {/* Members */}
              {teamMembers.map((member, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.05] border border-white/15 space-y-4 relative">
                  <h4 className="text-[13px] font-bold text-[#FF6B70] ">Member #{idx + 2}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime" 
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={member.email}
                      onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime" 
                    />
                    <input 
                      type="text" 
                      placeholder="Phone Number" 
                      value={member.phone}
                      onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime" 
                    />
                    <input 
                      type="text" 
                      placeholder="College Name" 
                      value={member.college}
                      onChange={(e) => handleMemberChange(idx, "college", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime" 
                    />
                    <input 
                      type="text" 
                      placeholder="Branch / Major" 
                      value={member.branch}
                      onChange={(e) => handleMemberChange(idx, "branch", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime" 
                    />
                    <select 
                      value={member.academicYear}
                      onChange={(e) => handleMemberChange(idx, "academicYear", e.target.value)}
                      className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-lime"
                    >
                      <option value="">Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              ))}

              {/* Size is fixed by team size dropdown */}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-transparent border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleTeamRosterSave}
                className="flex-[2] btn btn-primary py-4 text-sm font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DYNAMIC EVENT QUESTIONS */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 5 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">A few questions</h2>
              <p className="text-[15px] text-white/65 mt-2">The organizers ask these to run the event.</p>
            </div>

            <div className="space-y-4 mb-6">
              {dynamicQuestions.map((q, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <label className="block text-[14px] font-medium text-white/85">
                    {q.label} {q.required && <span className="text-coral">*</span>}
                  </label>
                  {q.type === "SELECT" ? (
                    <select
                      value={answers[q.label] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.label]: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime dark-options"
                    >
                      <option value="">Select option</option>
                      {q.options?.map((opt: string, oIdx: number) => (
                        <option key={oIdx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder={q.placeholder || `Enter details for ${q.label}`}
                      value={answers[q.label] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q.label]: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-3 text-white text-[16px] outline-none focus:border-lime" 
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(eventType === "TEAM" ? 4 : 3)}
                className="flex-1 py-4 bg-transparent border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleQuestionsSave}
                className="flex-[2] btn btn-primary py-4 text-sm font-bold"
              >
                Confirm Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW REGISTRATION */}
        {step === 6 && (
          <div>
            <div className="mb-6">
              <p className="text-[14px] font-semibold text-[#FF6B70]">Step 6 of 6</p>
              <h2 className="text-[28px] sm:text-[32px] leading-tight text-white mt-1.5">Review and register</h2>
              <p className="text-[15px] text-white/65 mt-2">Check everything below, then register.</p>
            </div>

            <div className="space-y-4 mb-6 max-h-[340px] overflow-y-auto pr-1 text-[13px] text-white/70">
              
              {/* Event Section */}
              <div className="bg-white/[0.05] border border-white/15 rounded-xl p-4 space-y-2">
                <span className="text-[12px] font-bold text-white/55 block border-b border-white/10 pb-1">Event Summary</span>
                <div className="flex justify-between font-medium"><span className="text-white/55">Event Name:</span><span className="text-white">{event.title}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">Category:</span><span className="text-white">{event.cat}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">Location:</span><span className="text-white">{event.venue}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">Date:</span><span className="text-white">{format(new Date(event.date), "MMMM d, yyyy")}</span></div>
              </div>

              {/* Attendee Section */}
              <div className="bg-white/[0.05] border border-white/15 rounded-xl p-4 space-y-2">
                <span className="text-[12px] font-bold text-white/55 block border-b border-white/10 pb-1">Participant Summary</span>
                <div className="flex justify-between font-medium"><span className="text-white/55">Name:</span><span className="text-white">{name}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">Email:</span><span className="text-white">{accountEmail}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">Phone:</span><span className="text-white">{phone}</span></div>
                <div className="flex justify-between font-medium"><span className="text-white/55">College:</span><span className="text-white">{college}</span></div>
              </div>

              {/* Team Section (if applicable) */}
              {(eventType === "TEAM" || teamName.trim() !== "") && (
                <div className="bg-white/[0.05] border border-white/15 rounded-xl p-4 space-y-2">
                  <span className="text-[12px] font-bold text-white/55 block border-b border-white/10 pb-1">Team Summary</span>
                  <div className="flex justify-between font-medium"><span className="text-white/55">Team Name:</span><span className="text-white font-bold text-[#FF6B70]">{teamName}</span></div>
                  {eventType === "TEAM" && (
                    <>
                      <div className="flex justify-between font-medium"><span className="text-white/55">Members Count:</span><span className="text-white">{teamMembers.length + 1} Attendees</span></div>
                      <div className="text-[12px] text-white/55 pt-1 leading-relaxed">
                        <b>Invited Roster:</b> {teamMembers.map(m => m.name).join(", ")}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Answers Section (if applicable) */}
              {Object.keys(answers).length > 0 && (
                <div className="bg-white/[0.05] border border-white/15 rounded-xl p-4 space-y-2">
                  <span className="text-[12px] font-bold text-white/55 block border-b border-white/10 pb-1">Questionnaire Responses</span>
                  {Object.entries(answers).map(([lbl, val]) => (
                    <div key={lbl} className="flex justify-between font-medium"><span className="text-white/55">{lbl}:</span><span className="text-white">{val}</span></div>
                  ))}
                </div>
              )}

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-lime/5 border border-lime/10 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={confirmCorrect}
                  onChange={(e) => setConfirmCorrect(e.target.checked)}
                  className="mt-0.5 accent-lime"
                />
                <span className="text-[13px] font-semibold text-white/90 leading-tight">
                  I confirm that all information provided is correct and understand that fake information can lead to registration rejection.
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(dynamicQuestions.length > 0 ? 5 : (eventType === "TEAM" ? 4 : 3))}
                className="flex-1 py-4 bg-transparent border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isPending}
                className="flex-[2] btn btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: SUCCESS DIGITAL TICKET */}
        {step === 7 && generatedTicket && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5"><Check className="w-7 h-7" aria-hidden /></div>
            <h2 className="text-[28px] sm:text-[32px] leading-tight text-white">You&apos;re registered</h2>
            <p className="text-sm text-white/55 mt-1.5 mb-6 max-w-md mx-auto leading-relaxed">
              Your ticket is saved to My Tickets. Show the QR code below at the gate.
            </p>

            {/* Ticket */}
            <div className="max-w-md mx-auto bg-white/[0.05] border border-white/15 rounded-3xl overflow-hidden mb-6 text-left relative shadow-xl">
              <div className="h-32 relative bg-zinc-950 border-b border-white/15 flex items-end p-4">
                {event.img && (
                  <div className="absolute inset-0">
                    <img src={event.img} alt={event.title} className="object-cover w-full h-full opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>
                )}
                <div className="relative z-10">
                  <span className="text-[13px] font-semibold text-[#FF6B70]">{event.cat ? event.cat.charAt(0) + event.cat.slice(1).toLowerCase() : ""}</span>
                  <h3 className="text-lg font-bold text-white mt-1.5 leading-tight">{event.title}</h3>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[13px] text-white/70">
                  <div>
                    <span className="text-[12px] text-white/55 block font-bold">Attendee</span>
                    <span className="text-white font-semibold text-[13px] mt-0.5 block">{name}</span>
                  </div>
                  <div>
                    <span className="text-[12px] text-white/55 block font-bold">Ticket Number</span>
                    <span className="text-[#FF6B70] font-mono font-bold text-[13px] mt-0.5 block">{generatedTicket.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="text-[12px] text-white/55 block font-bold">Venue</span>
                    <span className="text-white font-medium mt-0.5 block">{event.venue}</span>
                  </div>
                  <div>
                    <span className="text-[12px] text-white/55 block font-bold">Date</span>
                    <span className="text-white font-medium mt-0.5 block">
                      {event.date ? format(new Date(event.date), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  {eventType === "TEAM" && (
                    <div className="col-span-2 border-t border-white/10 pt-3">
                      <span className="text-[12px] text-white/55 block font-bold">Team Association</span>
                      <div className="text-white font-semibold text-[13px] mt-0.5 flex justify-between">
                        <span>Team: <span className="text-[#FF6B70]">{teamName}</span></span>
                        <span className="text-white/55 font-medium">({teamMembers.length + 1} members)</span>
                      </div>
                    </div>
                  )}
                </div>

                {generatedTicket.qrCode && (
                  <div className="bg-white p-3 rounded-2xl w-56 h-56 mx-auto border border-zinc-200 flex flex-col items-center justify-center shrink-0">
                    <img src={generatedTicket.qrCode} alt="Ticket QR code" className="w-full h-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-md mx-auto mb-4">
              <button 
                onClick={() => window.print()}
                className="py-3 px-2 bg-white/5 border border-white/15 text-white rounded-xl hover:border-lime/30 text-[13px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Save as PDF
              </button>
              <button 
                onClick={handleWhatsAppShare}
                className="py-3 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 text-[13px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                WhatsApp
              </button>
              <button 
                onClick={handleNativeShare}
                className="py-3 px-2 bg-lime/10 border border-lime/20 text-[#FF6B70] rounded-xl hover:bg-lime/20 text-[13px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <div className="flex gap-3 justify-center max-w-xs mx-auto">
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = `/dashboard/tickets/${generatedTicket.id}`;
                }}
                className="btn btn-primary flex-1 py-3 text-[13px] font-bold"
              >
                Open ticket
              </button>
              <button 
                onClick={onClose}
                className="px-5 py-3 text-[13px] bg-zinc-900 border border-white/15 text-white hover:bg-zinc-800 rounded-xl transition-all font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
