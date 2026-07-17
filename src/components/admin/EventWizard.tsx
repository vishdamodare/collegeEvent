"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Globe, 
  MapPin, 
  Calendar, 
  Info, 
  ShieldAlert,
  Users, 
  CreditCard, 
  Award, 
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Building,
  HelpCircle,
  Bookmark,
  Share2,
  ShieldCheck,
  Tag,
  Sliders,
  DollarSign,
  QrCode,
  Image,
  Sparkles,
  User,
  Settings,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { AdminEvent, EventStatus } from "@/types/admin";
import { EventStatus as PrismaEventStatus } from "@prisma/client";
import { 
  createEvent as createEventAction, 
  updateEvent as updateEventAction 
} from "@/actions/admin";
import { RegistrationFormBuilder } from "./RegistrationFormBuilder";
import { TicketBuilder } from "./TicketBuilder";
import { CouponBuilder } from "./CouponBuilder";
import { SponsorBuilder } from "./SponsorBuilder";
import { FAQBuilder } from "./FAQBuilder";
import { PreviewFrame } from "./PreviewFrame";
import { getTemplates } from "@/data/admin/templates";
import { getDefaultFormFields } from "@/data/admin/registrationForm";

interface EventWizardProps {
  initialData?: AdminEvent;
}

const STEPS = [
  "Basic Info",
  "Schedule",
  "Venue Details",
  "Registration Config",
  "Team Setup",
  "Ticketing",
  "Coupons",
  "Payment Details",
  "QR Tickets",
  "Media Assets",
  "Sponsors",
  "Rules & Prizes",
  "Organizers Team",
  "Certificates",
  "Responsive Preview"
];

export function EventWizard({ initialData }: EventWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Draft Saved");

  // Advanced toggles
  const [showAdvancedSeo, setShowAdvancedSeo] = useState(false);
  const [showAdvancedReg, setShowAdvancedReg] = useState(false);
  const [showAdvancedTeam, setShowAdvancedTeam] = useState(false);
  const [showAdvancedCert, setShowAdvancedCert] = useState(false);

  // Form States - Step 1: Basic Info
  const [title, setTitle] = useState(initialData?.basic.title || "");
  const [slug, setSlug] = useState(initialData?.basic.slug || "");
  const [category, setCategory] = useState(initialData?.basic.category || "TECHNICAL");
  const [subcategory, setSubcategory] = useState(initialData?.basic.subcategory || "");
  const [eventType, setEventType] = useState(initialData?.basic.eventType || "GENERAL");
  const [shortDescription, setShortDescription] = useState(initialData?.basic.shortDescription || "");
  const [description, setDescription] = useState(initialData?.basic.description || "");
  const [language, setLanguage] = useState(initialData?.basic.language || "English");
  const [tags, setTags] = useState(initialData?.basic.tags.join(", ") || "");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "UNLISTED">(initialData?.basic.visibility || "PUBLIC");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.basic.isFeatured || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.basic.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.basic.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.basic.seoKeywords?.join(", ") || "");
  const [openGraphImage, setOpenGraphImage] = useState(initialData?.basic.openGraphImage || "");

  // Form States - Step 2: Schedule
  const [registrationOpens, setRegistrationOpens] = useState(initialData?.schedule.registrationOpens ? new Date(initialData.schedule.registrationOpens).toISOString().slice(0, 16) : "");
  const [registrationCloses, setRegistrationCloses] = useState(initialData?.schedule.registrationCloses ? new Date(initialData.schedule.registrationCloses).toISOString().slice(0, 16) : "");
  const [start, setStart] = useState(initialData?.schedule.start ? new Date(initialData.schedule.start).toISOString().slice(0, 16) : "");
  const [end, setEnd] = useState(initialData?.schedule.end ? new Date(initialData.schedule.end).toISOString().slice(0, 16) : "");
  const [timezone, setTimezone] = useState(initialData?.schedule.timezone || "Asia/Kolkata");
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState(initialData?.schedule.earlyBirdDeadline ? new Date(initialData.schedule.earlyBirdDeadline).toISOString().slice(0, 16) : "");
  const [lateRegistrationDeadline, setLateRegistrationDeadline] = useState(initialData?.schedule.lateRegistrationDeadline ? new Date(initialData.schedule.lateRegistrationDeadline).toISOString().slice(0, 16) : "");
  const [countdownTimer, setCountdownTimer] = useState<boolean>(initialData?.schedule.countdownTimer || false);

  // Form States - Step 3: Venue (Simplified)
  const [venueType, setVenueType] = useState<"OFFLINE" | "ONLINE" | "HYBRID">(initialData?.venue.venueType || "OFFLINE");
  const [venueLocation, setVenueLocation] = useState(initialData?.venue.venueLocation || "");
  const [address, setAddress] = useState(initialData?.venue.address || "");
  const [googleMapsLink, setGoogleMapsLink] = useState(initialData?.venue.googleMapsLink || "");
  const [meetingLink, setMeetingLink] = useState(initialData?.venue.meetingLink || "");
  const [platform, setPlatform] = useState(initialData?.venue.platform || "Zoom");
  const [password, setPassword] = useState(initialData?.venue.password || "");

  // Form States - Step 4: Registration
  const [maxRegistrations, setMaxRegistrations] = useState(initialData?.registration.maxRegistrations || 100);
  const [isWaitingListEnabled, setIsWaitingListEnabled] = useState<boolean>(initialData?.registration.isWaitingListEnabled || false);
  const [requireApproval, setRequireApproval] = useState<boolean>(initialData?.registration.requireApproval || false);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(initialData?.registration.allowMultiple || false);
  const [allowCollegeVerification, setAllowCollegeVerification] = useState<boolean>(initialData?.registration.allowCollegeVerification || false);
  const [collectAdditionalInfo, setCollectAdditionalInfo] = useState<boolean>(initialData?.registration.collectAdditionalInfo || false);
  const [registrationDeadline, setRegistrationDeadline] = useState(initialData?.registration.registrationDeadline ? new Date(initialData.registration.registrationDeadline).toISOString().slice(0, 16) : "");
  const [lateRegistrationAllowed, setLateRegistrationAllowed] = useState<boolean>(initialData?.registration.lateRegistrationAllowed || false);
  const [registrationFormFields, setRegistrationFormFields] = useState<any[]>(initialData?.registration.registrationFormFields || getDefaultFormFields());

  // Form States - Step 5: Team
  const [isTeam, setIsTeam] = useState<boolean>(initialData?.registration.isTeam || false);
  const [minTeamSize, setMinTeamSize] = useState(initialData?.registration.minTeamSize || 1);
  const [maxTeamSize, setMaxTeamSize] = useState(initialData?.registration.maxTeamSize || 1);
  const [captainCode, setCaptainCode] = useState(initialData?.registration.captainCode || "");
  const [teamApprovalRequired, setTeamApprovalRequired] = useState<boolean>(initialData?.registration.teamApprovalRequired || false);

  // Form States - Step 6: Ticketing
  const [ticketingEnabled, setTicketingEnabled] = useState<boolean>(initialData?.pricing.ticketingEnabled || false);
  const [tickets, setTickets] = useState<any[]>(initialData?.pricing.tickets || []);

  // Form States - Step 7: Coupons
  const [couponsEnabled, setCouponsEnabled] = useState<boolean>(initialData?.pricing.couponsEnabled || false);
  const [coupons, setCoupons] = useState<any[]>(initialData?.pricing.coupons || []);

  // Form States - Step 8: Payment / Pricing
  const [isFree, setIsFree] = useState<boolean>(initialData?.pricing.isFree ?? true);
  const [fee, setFee] = useState(initialData?.pricing.fee || 0);
  const [gstIncluded, setGstIncluded] = useState<boolean>(initialData?.pricing.gstIncluded || false);
  const [platformFee, setPlatformFee] = useState(initialData?.pricing.platformFee || 0);
  const [refundPolicy, setRefundPolicy] = useState(initialData?.pricing.refundPolicy || "");
  const [cancellationPolicy, setCancellationPolicy] = useState(initialData?.pricing.cancellationPolicy || "");
  const [paymentDeadline, setPaymentDeadline] = useState(initialData?.pricing.paymentDeadline ? new Date(initialData.pricing.paymentDeadline).toISOString().slice(0, 16) : "");
  const [successMessage, setSuccessMessage] = useState(initialData?.pricing.successMessage || "Thank you for registering! Your slot is confirmed.");
  const [failureMessage, setFailureMessage] = useState(initialData?.pricing.failureMessage || "Transaction failed. Please try again.");

  // Form States - Step 9: QR Check-in
  const [qrEnabled, setQrEnabled] = useState<boolean>(initialData?.pricing.ticketingEnabled || true);

  // Form States - Step 10: Media
  const [banner, setBanner] = useState(initialData?.media.banner || "");
  const [poster, setPoster] = useState(initialData?.media.poster || "");
  const [thumbnail, setThumbnail] = useState(initialData?.media.thumbnail || "");
  const [gallery, setGallery] = useState(initialData?.media.gallery?.join(", ") || "");
  const [sponsorLogos, setSponsorLogos] = useState(initialData?.media.sponsorLogos?.join(", ") || "");
  const [promoVideoUrl, setPromoVideoUrl] = useState(initialData?.media.promoVideoUrl || "");
  const [brochurePdfUrl, setBrochurePdfUrl] = useState(initialData?.media.brochurePdfUrl || "");
  const [rulebookPdfUrl, setRulebookPdfUrl] = useState(initialData?.media.rulebookPdfUrl || "");

  // Form States - Step 11: Sponsors
  const [sponsors, setSponsors] = useState<any[]>(initialData?.sponsors || []);

  // Form States - Step 12: Rules & Prizes
  const [eligibility, setEligibility] = useState(initialData?.rules.eligibility || "");
  const [requirements, setRequirements] = useState(initialData?.rules.requirements || "");
  const [instructions, setInstructions] = useState(initialData?.rules.instructions || "");
  const [dressCode, setDressCode] = useState(initialData?.rules.dressCode || "");
  const [codeOfConduct, setCodeOfConduct] = useState(initialData?.rules.codeOfConduct || "");
  const [termsAndConditions, setTermsAndConditions] = useState(initialData?.rules.termsAndConditions || "");
  const [judgingCriteria, setJudgingCriteria] = useState(initialData?.rules.judgingCriteria || "");
  const [prizes, setPrizes] = useState<any[]>(initialData?.rules.prizes || [
    { title: "First Place Winner", cashPrize: 10000, goodies: "Trophy & T-Shirts", description: "Top scoring contestant/team" },
    { title: "Runner-Up", cashPrize: 5000, goodies: "Medal", description: "Second place score" }
  ]);
  const [faqs, setFaqs] = useState<any[]>(initialData?.rules.faqs || [
    { question: "Who is eligible to participate?", answer: "Any student with a valid college ID card." }
  ]);
  const [privacyPolicy, setPrivacyPolicy] = useState(initialData?.rules.privacyPolicy || "");

  // Form States - Step 13: Organizers Contact (Simplified to single Coordinator)
  const [coordinatorName, setCoordinatorName] = useState(initialData?.contact.coordinatorName || "");
  const [coordinatorEmail, setCoordinatorEmail] = useState(initialData?.contact.coordinatorEmail || "");
  const [coordinatorPhone, setCoordinatorPhone] = useState(initialData?.contact.coordinatorPhone || "");
  const [instagram, setInstagram] = useState(initialData?.contact.instagram || "");
  const [website, setWebsite] = useState(initialData?.contact.website || "");
  const [linkedin, setLinkedin] = useState(initialData?.contact.linkedin || "");

  // Form States - Step 14: Certificates
  const [participationTemplate, setParticipationTemplate] = useState(initialData?.certificates.participationTemplate || "participation-std.pdf");
  const [autoGenerate, setAutoGenerate] = useState<boolean>(initialData?.certificates.autoGenerate ?? true);
  const [emailAfterEvent, setEmailAfterEvent] = useState<boolean>(initialData?.certificates.emailAfterEvent ?? true);

  // Auto slug generation from title
  useEffect(() => {
    if (!initialData) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title]);

  // Autosave simulation every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSaveStatus("Saving draft...");
      setTimeout(() => {
        setAutoSaveStatus("Draft Saved");
      }, 1000);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Quick Template Prefill Handler
  const applyTemplate = (templateId: string) => {
    const matched = getTemplates().find(t => t.id === templateId);
    if (!matched) return;

    const data = matched.prefilledData;
    if (data.basic) {
      setTitle(data.basic.title);
      setSlug(data.basic.slug);
      setCategory(data.basic.category);
      setSubcategory(data.basic.subcategory || "");
      setEventType(data.basic.eventType || "GENERAL");
      setShortDescription(data.basic.shortDescription);
      setDescription(data.basic.description);
      setTags(data.basic.tags.join(", "));
      setVisibility(data.basic.visibility);
      setIsFeatured(data.basic.isFeatured);
    }
    if (data.registration) {
      setIsTeam(data.registration.isTeam);
      setMinTeamSize(data.registration.minTeamSize);
      setMaxTeamSize(data.registration.maxTeamSize);
      setMaxRegistrations(data.registration.maxRegistrations);
      setIsWaitingListEnabled(data.registration.isWaitingListEnabled);
      setRequireApproval(data.registration.requireApproval);
      setAllowMultiple(data.registration.allowMultiple);
      setAllowCollegeVerification(data.registration.allowCollegeVerification || false);
      setCollectAdditionalInfo(data.registration.collectAdditionalInfo || false);
    }
    if (data.pricing) {
      setIsFree(data.pricing.isFree);
      setFee(data.pricing.fee);
      setTicketingEnabled(data.pricing.ticketingEnabled || false);
    }
    if (data.certificates) {
      setAutoGenerate(data.certificates.autoGenerate || false);
      setEmailAfterEvent(data.certificates.emailAfterEvent || false);
    }
    alert(`Applied "${matched.name}" template successfully! Prefilled basic fields, registration setups, and pricing guides.`);
  };

  const validateCurrentStep = () => {
    setError(null);
    if (currentStep === 0) {
      if (!title || !slug || !shortDescription) {
        setError("Please enter Event Name, URL slug, and a Short Description.");
        return false;
      }
    } else if (currentStep === 1) {
      if (!start || !end || !registrationOpens || !registrationCloses) {
        setError("Please configure all timeline constraints.");
        return false;
      }
      if (new Date(start) >= new Date(end)) {
        setError("Event start timestamp must occur before the end timestamp.");
        return false;
      }
      if (new Date(registrationOpens) >= new Date(registrationCloses)) {
        setError("Registration opening timestamp must precede its closure.");
        return false;
      }
    } else if (currentStep === 2) {
      if (venueType === "OFFLINE" || venueType === "HYBRID") {
        if (!venueLocation) {
          setError("Please specify the Venue Location (e.g. IT Department Room 302).");
          return false;
        }
      }
      if (venueType === "ONLINE" || venueType === "HYBRID") {
        if (!meetingLink || !platform) {
          setError("Please fill out the Meeting Link and virtual platform.");
          return false;
        }
      }
    } else if (currentStep === 3) {
      if (maxRegistrations <= 0) {
        setError("Maximum registrations limit must be greater than zero.");
        return false;
      }
    } else if (currentStep === 5) {
      if (ticketingEnabled && tickets.length === 0) {
        setError("You must create at least one Ticket Tier when Ticketing is enabled.");
        return false;
      }
    } else if (currentStep === 7) {
      if (!isFree && fee <= 0 && (!ticketingEnabled || tickets.every(t => t.price <= 0))) {
        setError("A paid event must have a registration fee or ticket price greater than ₹0.");
        return false;
      }
    } else if (currentStep === 9) {
      if (!banner) {
        setError("Banner Image cover URL is required.");
        return false;
      }
    } else if (currentStep === 12) {
      if (!coordinatorName || !coordinatorEmail || !coordinatorPhone) {
        setError("Primary Coordinator contact details (Name, Email, and Phone) are required.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const assembleData = () => {
    return {
      id: initialData?.id || `evt-${Math.random().toString(36).substr(2, 9)}`,
      status: "DRAFT" as EventStatus,
      basic: {
        title,
        slug,
        category,
        subcategory,
        eventType,
        shortDescription,
        description,
        language,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        visibility,
        isFeatured,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || shortDescription,
        seoKeywords: seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        openGraphImage: openGraphImage || banner,
      },
      schedule: {
        registrationOpens,
        registrationCloses,
        start,
        end,
        timezone,
        earlyBirdDeadline,
        lateRegistrationDeadline,
        countdownTimer,
      },
      venue: {
        venueType,
        venueLocation,
        address,
        googleMapsLink,
        meetingLink,
        platform,
        password,
      },
      registration: {
        isTeam,
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        maxRegistrations: Number(maxRegistrations),
        isWaitingListEnabled,
        requireApproval,
        allowMultiple,
        allowCollegeVerification,
        collectAdditionalInfo,
        registrationDeadline,
        lateRegistrationAllowed,
        registrationFormFields,
        captainCode,
        teamApprovalRequired,
      },
      pricing: {
        isFree,
        fee: Number(fee),
        couponCodes: coupons.map(c => c.code),
        refundPolicy,
        cancellationPolicy,
        gstIncluded,
        platformFee: Number(platformFee),
        paymentDeadline,
        successMessage,
        failureMessage,
        ticketingEnabled,
        tickets,
        couponsEnabled,
        coupons,
      },
      media: {
        banner,
        poster,
        thumbnail,
        gallery: gallery.split(",").map(g => g.trim()).filter(Boolean),
        sponsorLogos: sponsorLogos.split(",").map(s => s.trim()).filter(Boolean),
        videos: [],
        attachments: [],
        promoVideoUrl,
        brochurePdfUrl,
        rulebookPdfUrl,
      },
      rules: {
        eligibility,
        requirements,
        instructions,
        dressCode,
        codeOfConduct,
        termsAndConditions,
        judgingCriteria,
        prizes,
        faqs,
        privacyPolicy,
      },
      contact: {
        coordinatorName,
        coordinatorEmail,
        coordinatorPhone,
        instagram,
        website,
        linkedin,
      },
      certificates: {
        participationTemplate,
        autoGenerate,
        emailAfterEvent,
      },
      sponsors,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = async (statusOverride?: EventStatus) => {
    if (!validateCurrentStep()) return;
    setIsSaving(true);
    setError(null);
    
    const assembled = assembleData();
    
    // Map the wizard AdminEvent shape to the flat EventFormData the server action needs
    // Resolve categoryId: look up by name or use the value directly if it looks like an ID
    let categoryIdResolved = assembled.basic.category || "";

    // Map wizard EventStatus values to valid Prisma EventStatus values
    const toPrismaStatus = (s: string): PrismaEventStatus => {
      if (s === "PUBLISHED") return PrismaEventStatus.PUBLISHED;
      if (s === "ARCHIVED") return PrismaEventStatus.ARCHIVED;
      if (s === "CANCELLED") return PrismaEventStatus.CANCELLED;
      if (s === "COMPLETED") return PrismaEventStatus.COMPLETED;
      return PrismaEventStatus.DRAFT; // DRAFT, INCOMPLETE_DRAFT, SUBMITTED_FOR_REVIEW → DRAFT
    };

    // Map to flat server action format
    const eventPayload = {
      title: assembled.basic.title,
      description: assembled.basic.description || assembled.basic.shortDescription || "Event description",
      categoryId: categoryIdResolved,
      date: assembled.schedule.start ? new Date(assembled.schedule.start) : new Date(),
      location: assembled.venue?.venueLocation || assembled.venue?.address || "TBD",
      capacity: assembled.registration?.maxRegistrations || 100,
      status: toPrismaStatus(statusOverride || "DRAFT"),
      imageUrl: assembled.media?.banner || null,
    };

    try {
      if (initialData) {
        const res = await updateEventAction(initialData.id, eventPayload);
        if (res?.error) {
          setError(res.error);
          setIsSaving(false);
          return;
        }
        alert(`Event updated successfully as ${eventPayload.status}!`);
      } else {
        const res = await createEventAction(eventPayload);
        if (res?.error) {
          setError(res.error);
          setIsSaving(false);
          return;
        }
        alert(`New event created successfully as ${eventPayload.status}!`);
      }
      router.push("/admin/events");
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving the event.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentTemplateOptions = getTemplates();

  return (
    <div className="space-y-6 font-archivo text-white">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-[26px] font-anton uppercase tracking-wider text-white">
            {initialData ? `Modify: ${initialData.basic.title}` : "Production Event Wizard"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-white/40 font-archivo">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-bold text-green-400 font-archivo uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> {autoSaveStatus}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!initialData && currentStep === 0 && (
            <div className="flex items-center gap-1.5 mr-2 border-r border-white/10 pr-3">
              <span className="text-[11px] text-white/40 uppercase font-bold">Template:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-[11px] font-bold outline-none cursor-pointer"
              >
                <option value="">-- Choose Template --</option>
                {currentTemplateOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <button 
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-[13px] font-bold cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </div>

      {/* Progress Horizontal Stepper */}
      <div className="grid grid-cols-15 gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {STEPS.map((step, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (idx <= currentStep || validateCurrentStep()) {
                setCurrentStep(idx);
              }
            }}
            className="flex flex-col gap-1 min-w-[70px] text-left cursor-pointer group"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentStep 
                ? "bg-[var(--color-lime)]" 
                : idx < currentStep 
                  ? "bg-[var(--color-lime)]/50" 
                  : "bg-white/5 group-hover:bg-white/10"
            }`}></div>
            <span className={`text-[9px] font-semibold truncate ${
              idx === currentStep ? "text-white" : "text-white/30"
            }`}>{step}</span>
          </button>
        ))}
      </div>

      {/* Wizard Body Card */}
      <div className="rounded-2xl border border-white/10 bg-[#121212]/40 p-6 md:p-8 backdrop-blur-xl relative">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] mb-6 font-semibold flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="min-h-[350px]">
          {/* STEP 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Basic Details</h3>
                <p className="text-[11.5px] text-white/40">Core parameters of the event, categories, and tags.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Event Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CodeSprint 2026" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Auto Slug</label>
                  <input 
                    type="text" 
                    value={slug}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-[#181818]/60 border border-white/5 text-white/50 text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none cursor-pointer"
                  >
                    <option value="GENERAL">General Event</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SPORTS">Sports Match</option>
                    <option value="FESTIVAL">Cultural Fest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none cursor-pointer"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="SPORTS">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Subcategory</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Machine Learning" 
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Official Language</label>
                  <input 
                    type="text" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Short Pitch (One sentence) *</label>
                  <input 
                    type="text" 
                    placeholder="A quick summary for event list cards" 
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="Coding, AI, Robot" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Full Event Description</label>
                <textarea 
                  rows={5}
                  placeholder="Detailed rules, guidelines, schedules etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                ></textarea>
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* Advanced SEO Toggle */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSeo(!showAdvancedSeo)}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-[13px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[var(--color-lime)]" />
                  <span>Advanced SEO & Metadata Settings</span>
                  {showAdvancedSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedSeo && (
                  <div className="p-5 rounded-xl border border-white/5 bg-[#181818]/40 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[12px] text-white/50 mb-1.5">SEO Title</label>
                        <input 
                          type="text" 
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] text-white/50 mb-1.5">SEO Keywords (comma-separated)</label>
                        <input 
                          type="text" 
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-white/70 select-none">
                          <input 
                            type="checkbox" 
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                          />
                          Feature on Home Page
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1.5">SEO Meta Description</label>
                      <input 
                        type="text" 
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Date & Schedule */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Schedule & Timeline</h3>
                <p className="text-[11.5px] text-white/40">Set registration periods, start/end dates, and timezone options.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Registration Opens *</label>
                  <input 
                    type="datetime-local" 
                    value={registrationOpens}
                    onChange={(e) => setRegistrationOpens(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Registration Closes *</label>
                  <input 
                    type="datetime-local" 
                    value={registrationCloses}
                    onChange={(e) => setRegistrationCloses(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Event Start *</label>
                  <input 
                    type="datetime-local" 
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Event End *</label>
                  <input 
                    type="datetime-local" 
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Timezone</label>
                  <input 
                    type="text" 
                    value={timezone}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-[#181818]/60 border border-white/5 text-white/50 text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Early Bird Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={earlyBirdDeadline}
                    onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Late Registration Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={lateRegistrationDeadline}
                    onChange={(e) => setLateRegistrationDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <input 
                  type="checkbox" 
                  checked={countdownTimer}
                  onChange={(e) => setCountdownTimer(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-white">Enable Registration Countdown Widget</p>
                  <span className="text-[10px] text-white/40 block">Show a real-time countdown clock on the public event details landing page.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Venue Configuration (Simplified) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Venue Details</h3>
                <p className="text-[11.5px] text-white/40">Select where this event takes place (Physical, Online, or Hybrid).</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold text-white/70">Venue Type</label>
                <div className="flex gap-4">
                  {["OFFLINE", "ONLINE", "HYBRID"].map((type) => (
                    <label key={type} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 flex-1 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="venueType" 
                        checked={venueType === type} 
                        onChange={() => setVenueType(type as any)}
                        className="text-[var(--color-lime)]" 
                      />
                      <div>
                        <p className="text-[13px] font-bold text-white leading-none uppercase">{type}</p>
                        <span className="text-[10px] text-white/40 mt-1">
                          {type === "OFFLINE" ? "Physical campus locations" : type === "ONLINE" ? "Video link / webinar" : "Dual mode entry"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {(venueType === "OFFLINE" || venueType === "HYBRID") && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                    <Building className="w-4 h-4 text-[var(--color-lime)]" />
                    <span className="text-[13px] font-bold uppercase tracking-wider">Campus Location</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Venue Location *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. VIT College, IT Seminar Hall A-302"
                        value={venueLocation}
                        onChange={(e) => setVenueLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Google Maps Coordinates Link</label>
                      <input 
                        type="text" 
                        placeholder="https://maps.google.com/..."
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Full Address Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Wadala East, Mumbai, Maharashtra 400037"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                    />
                  </div>
                </div>
              )}

              {(venueType === "ONLINE" || venueType === "HYBRID") && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                    <Globe className="w-4 h-4 text-[var(--color-lime)]" />
                    <span className="text-[13px] font-bold uppercase tracking-wider">Virtual / Online Coordinates</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Platform *</label>
                      <select 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none cursor-pointer"
                      >
                        <option value="Zoom">Zoom Meeting</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="MS Teams">Microsoft Teams</option>
                        <option value="YouTube Live">YouTube Live Stream</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Meeting Link / Stream URL *</label>
                      <input 
                        type="text" 
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Meeting Password (Optional)</label>
                      <input 
                        type="text" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Registration Configuration & Builder */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Registration Settings</h3>
                <p className="text-[11.5px] text-white/40">Configure limits, registration deadlines, and customize fields.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Max Registration Capacity *</label>
                  <input 
                    type="number" 
                    value={maxRegistrations}
                    onChange={(e) => setMaxRegistrations(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Registration Form Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* Advanced Reg options toggle */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedReg(!showAdvancedReg)}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-[13px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[var(--color-lime)]" />
                  <span>Advanced Registration Options</span>
                  {showAdvancedReg ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedReg && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-xl border border-white/5 bg-[#181818]/40">
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-[13px] text-white/70">
                      <input 
                        type="checkbox" 
                        checked={isWaitingListEnabled}
                        onChange={(e) => setIsWaitingListEnabled(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Enable Auto-Waitlist
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-[13px] text-white/70">
                      <input 
                        type="checkbox" 
                        checked={requireApproval}
                        onChange={(e) => setRequireApproval(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Manual Approval Required
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-[13px] text-white/70">
                      <input 
                        type="checkbox" 
                        checked={allowCollegeVerification}
                        onChange={(e) => setAllowCollegeVerification(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Verify Student ID cards
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-[13px] text-white/70">
                      <input 
                        type="checkbox" 
                        checked={lateRegistrationAllowed}
                        onChange={(e) => setLateRegistrationAllowed(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Support Late Registration
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-[13px] text-white/70">
                      <input 
                        type="checkbox" 
                        checked={allowMultiple}
                        onChange={(e) => setAllowMultiple(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Allow Multi-Ticket Purchases
                    </label>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* Integration of RegistrationFormBuilder */}
              <RegistrationFormBuilder 
                fields={registrationFormFields}
                onChange={setRegistrationFormFields}
              />
            </div>
          )}

          {/* STEP 5: Team Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Team Formation Rules</h3>
                <p className="text-[11.5px] text-white/40">Toggle individual vs group squad signups and sizes.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-[13px] font-bold text-white/70">Participation Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 flex-1 cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="participationMode" 
                      checked={!isTeam} 
                      onChange={() => setIsTeam(false)}
                      className="text-[var(--color-lime)]" 
                    />
                    <div>
                      <p className="text-[13.5px] font-bold text-white leading-none">Individual Mode</p>
                      <span className="text-[10px] text-white/40 mt-1">Single student registration ticket</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 flex-1 cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="participationMode" 
                      checked={isTeam} 
                      onChange={() => setIsTeam(true)}
                      className="text-[var(--color-lime)]" 
                    />
                    <div>
                      <p className="text-[13.5px] font-bold text-white leading-none">Team Event Mode</p>
                      <span className="text-[10px] text-white/40 mt-1">Groups / Hackathon squads</span>
                    </div>
                  </label>
                </div>
              </div>

              {isTeam && (
                <div className="space-y-5 p-5 rounded-xl bg-white/5 border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Minimum Team Size</label>
                      <input 
                        type="number" 
                        value={minTeamSize}
                        onChange={(e) => setMinTeamSize(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Maximum Team Size</label>
                      <input 
                        type="number" 
                        value={maxTeamSize}
                        onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 my-1"></div>

                  {/* Advanced Team Toggle */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedTeam(!showAdvancedTeam)}
                      className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[var(--color-lime)]" />
                      <span>Advanced Team Rules</span>
                      {showAdvancedTeam ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvancedTeam && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-lg bg-[#181818]/60 border border-white/5">
                        <div>
                          <label className="block text-[12px] text-white/50 mb-1">Captain Access Code Prefix</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SQUAD-" 
                            value={captainCode}
                            onChange={(e) => setCaptainCode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                          />
                        </div>
                        <div className="flex items-end pb-3">
                          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/70 select-none">
                            <input 
                              type="checkbox" 
                              checked={teamApprovalRequired}
                              onChange={(e) => setTeamApprovalRequired(e.target.checked)}
                              className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                            />
                            Organizers must approve team changes
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Ticketing Builder */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Event Ticketing Setup</h3>
                <p className="text-[11.5px] text-white/40">Enable custom ticket types (VIP, early pass) or leave disabled for standard forms.</p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <input 
                  type="checkbox" 
                  checked={ticketingEnabled}
                  onChange={(e) => setTicketingEnabled(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-white">Enable Multi-Tier Ticket Booking</p>
                  <span className="text-[10px] text-white/40 block">Enable this if you want to offer different classes of tickets (VIP, Student, Guest pass).</span>
                </div>
              </div>

              {ticketingEnabled && (
                <TicketBuilder 
                  tickets={tickets}
                  onChange={setTickets}
                />
              )}
            </div>
          )}

          {/* STEP 7: Coupons Builder */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Coupon Configuration</h3>
                <p className="text-[11.5px] text-white/40">Configure discount codes to incentivize early registrations.</p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <input 
                  type="checkbox" 
                  checked={couponsEnabled}
                  onChange={(e) => setCouponsEnabled(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-white">Enable Promo / Coupon Codes</p>
                  <span className="text-[10px] text-white/40 block">Enable this if you want to support fixed/percentage discount codes.</span>
                </div>
              </div>

              {couponsEnabled && (
                <CouponBuilder 
                  coupons={coupons}
                  onChange={setCoupons}
                />
              )}
            </div>
          )}

          {/* STEP 8: Payment & Pricing Details */}
          {currentStep === 7 && (
            <div className="space-y-6 font-archivo">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Payment & Refund Setup</h3>
                <p className="text-[11.5px] text-white/40">Choose whether the event is free or paid, set deadlines, and refund details.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold text-white/70">Registration Pricing Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 flex-1 cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="pricingSelection" 
                      checked={isFree} 
                      onChange={() => { setIsFree(true); setFee(0); }}
                      className="text-[var(--color-lime)]" 
                    />
                    <div>
                      <p className="text-[13.5px] font-bold text-white leading-none">Free Event</p>
                      <span className="text-[10px] text-white/40 mt-1">₹0 ticket entry</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 flex-1 cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="pricingSelection" 
                      checked={!isFree} 
                      onChange={() => setIsFree(false)}
                      className="text-[var(--color-lime)]" 
                    />
                    <div>
                      <p className="text-[13.5px] font-bold text-white leading-none">Paid / Ticketed Entry</p>
                      <span className="text-[10px] text-white/40 mt-1">Custom enrollment fees</span>
                    </div>
                  </label>
                </div>
              </div>

              {!isFree && (
                <div className="space-y-5 p-5 rounded-xl bg-white/5 border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Standard Fee (INR) *</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="number" 
                          value={fee}
                          onChange={(e) => setFee(Number(e.target.value))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Platform Fee (INR)</label>
                      <input 
                        type="number" 
                        value={platformFee}
                        onChange={(e) => setPlatformFee(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Payment Deadline</label>
                      <input 
                        type="datetime-local" 
                        value={paymentDeadline}
                        onChange={(e) => setPaymentDeadline(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/70 select-none">
                      <input 
                        type="checkbox" 
                        checked={gstIncluded}
                        onChange={(e) => setGstIncluded(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)]"
                      />
                      Registration Fee includes GST taxes
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Refund Policy Details</label>
                      <input 
                        type="text" 
                        value={refundPolicy}
                        onChange={(e) => setRefundPolicy(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="e.g. 100% refund up to 48 hours before"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Cancellation / Booking policy</label>
                      <input 
                        type="text" 
                        value={cancellationPolicy}
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="e.g. No cancellations allowed after registration deadline"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Success Confirmation Message</label>
                      <input 
                        type="text" 
                        value={successMessage}
                        onChange={(e) => setSuccessMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-white/50 mb-1">Failure Alert Message</label>
                      <input 
                        type="text" 
                        value={failureMessage}
                        onChange={(e) => setFailureMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  {/* Future Payment Gateway readiness info */}
                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[12px] text-blue-400 flex items-start gap-2.5">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Future payment integrations placeholder</p>
                      <p className="mt-0.5 text-[11px] text-blue-400/80 leading-normal">
                        Settlements and payout settings are fully configured for Razorpay hook integrations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: QR & Check-in */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">QR Tickets & Check-in Setup</h3>
                <p className="text-[11.5px] text-white/40">Choose whether each ticket contains a unique QR code for verified entry scanning.</p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <input 
                  type="checkbox" 
                  checked={qrEnabled}
                  onChange={(e) => setQrEnabled(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-bold text-white">Generate Unique QR Codes for Enrollments</p>
                  <span className="text-[10px] text-white/40 block">Each student receives a ticket containing a verification token QR code.</span>
                </div>
              </div>

              {qrEnabled && (
                <div className="p-5 rounded-xl border border-white/5 bg-white/5 space-y-4 text-white/70 text-[13px] leading-relaxed font-archivo">
                  <div className="flex items-center gap-2 text-white">
                    <QrCode className="w-5 h-5 text-[var(--color-lime)]" />
                    <span className="font-bold">QR Ticket Validation Engine Ready</span>
                  </div>
                  <p>
                    When verified entry is enabled, the student portal and email tickets generate a unique QR code signature:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[12px] text-white/50">
                    <li>Stores Ticket ID, Participant ID, and Event Verification Token.</li>
                    <li>Supports live scanning and barcode validations via the **Barcode Scanner Portal**.</li>
                    <li>Automatically marks the ticket check-in log and prevents duplicate entries.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Media Assets */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Media & Cover Images</h3>
                <p className="text-[11.5px] text-white/40">Provide URLs for banners, thumbnails, promo videos, and rulebook PDFs.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Cover Banner Image URL *</label>
                  <input 
                    type="text" 
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {banner && (
                    <div className="mt-3 relative w-full h-[140px] rounded-xl overflow-hidden border border-white/5">
                      <img src={banner} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Poster Image URL</label>
                    <input 
                      type="text" 
                      value={poster}
                      onChange={(e) => setPoster(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Thumbnail URL (Square)</label>
                    <input 
                      type="text" 
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">YouTube Promo Video URL</label>
                    <input 
                      type="text" 
                      value={promoVideoUrl}
                      onChange={(e) => setPromoVideoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Rulebook PDF Document URL</label>
                    <input 
                      type="text" 
                      value={rulebookPdfUrl}
                      onChange={(e) => setRulebookPdfUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Brochure PDF Document URL</label>
                    <input 
                      type="text" 
                      value={brochurePdfUrl}
                      onChange={(e) => setBrochurePdfUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Gallery Images (comma-separated URLs)</label>
                  <input 
                    type="text" 
                    value={gallery}
                    onChange={(e) => setGallery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: Sponsors */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Brand Sponsors</h3>
                <p className="text-[11.5px] text-white/40">Register sponsors and select display priorities.</p>
              </div>

              <SponsorBuilder 
                sponsors={sponsors}
                onChange={setSponsors}
              />
            </div>
          )}

          {/* STEP 12: Rules & Prizes */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Rules, Prizes & FAQs</h3>
                <p className="text-[11.5px] text-white/40">Detail terms and conditions, prize brackets, and answer FAQs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Eligibility Details</label>
                  <textarea 
                    rows={3}
                    placeholder="Who is allowed to enter..."
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold mb-1.5 text-white/70">Technical Requirements</label>
                  <textarea 
                    rows={3}
                    placeholder="Laptops, GitHub accounts, software installs..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Dress Code</label>
                  <input 
                    type="text" 
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Conduct policy</label>
                  <input 
                    type="text" 
                    value={codeOfConduct}
                    onChange={(e) => setCodeOfConduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Judging / Evaluation Criteria</label>
                  <input 
                    type="text" 
                    value={judgingCriteria}
                    onChange={(e) => setJudgingCriteria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* Dynamic Prize brackets */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[var(--color-lime)]" />
                  <span className="text-[13px] font-bold text-white uppercase tracking-wider">Prize Brackets</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prizes.map((p, pIdx) => (
                    <div key={pIdx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 font-archivo">
                      <div className="flex justify-between items-center">
                        <span className="text-[12.5px] font-bold text-white">{p.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-white/40 uppercase mb-1">Cash Prize (INR)</label>
                          <input 
                            type="number"
                            value={p.cashPrize || 0}
                            onChange={(e) => {
                              const next = [...prizes];
                              next[pIdx].cashPrize = Number(e.target.value);
                              setPrizes(next);
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-[#181818] border border-white/5 text-white text-[12px] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/40 uppercase mb-1">Goodies / Gift items</label>
                          <input 
                            type="text"
                            value={p.goodies || ""}
                            onChange={(e) => {
                              const next = [...prizes];
                              next[pIdx].goodies = e.target.value;
                              setPrizes(next);
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-[#181818] border border-white/5 text-white text-[12px] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* FAQ List Builder */}
              <FAQBuilder 
                faqs={faqs}
                onChange={setFaqs}
              />
            </div>
          )}

          {/* STEP 13: Organizers Contact Info (Simplified to single Coordinator) */}
          {currentStep === 12 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Primary Coordinator</h3>
                <p className="text-[11.5px] text-white/40">Provide coordinator contact details to help students reach out.</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-white border-b border-white/5 pb-2">
                  <User className="w-4 h-4 text-[var(--color-lime)]" />
                  <span className="text-[13px] font-bold uppercase tracking-wider">Coordinator Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={coordinatorName}
                      onChange={(e) => setCoordinatorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Official Email *</label>
                    <input 
                      type="email" 
                      value={coordinatorEmail}
                      onChange={(e) => setCoordinatorEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Phone Number *</label>
                    <input 
                      type="text" 
                      value={coordinatorPhone}
                      onChange={(e) => setCoordinatorPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Official Instagram Link</label>
                    <input 
                      type="text" 
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Website URL</label>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-white/50 mb-1">Official LinkedIn Page</label>
                    <input 
                      type="text" 
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 14: Certificates Configuration */}
          {currentStep === 13 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Certificate Settings</h3>
                <p className="text-[11.5px] text-white/40">Link certificate templates to auto-issue after the event is completed.</p>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold mb-2 text-white/70">Participation Certificate PDF Template URL</label>
                <input 
                  type="text" 
                  value={participationTemplate}
                  onChange={(e) => setParticipationTemplate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-[13.5px] outline-none"
                />
              </div>

              <div className="h-[1px] bg-white/5 my-3"></div>

              {/* Advanced Certificate options */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedCert(!showAdvancedCert)}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-[12px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[var(--color-lime)]" />
                  <span>Advanced Delivery Options</span>
                  {showAdvancedCert ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedCert && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl border border-white/5 bg-[#181818]/40">
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoGenerate}
                        onChange={(e) => setAutoGenerate(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-white">Auto-Generate on Completion</p>
                        <span className="text-[10px] text-white/40 block">Create credentials automatically when marked complete.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailAfterEvent}
                        onChange={(e) => setEmailAfterEvent(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-white">Dispatch email attachments</p>
                        <span className="text-[10px] text-white/40 block">Email verified certificates immediately.</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 15: Multi-Device Preview Frame */}
          {currentStep === 14 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[17px] font-anton text-[var(--color-lime)] uppercase tracking-wider mb-1">Final Student Page Preview</h3>
                <p className="text-[11.5px] text-white/40">Toggle dimensions to verify responsiveness of details, registration forms, and ticket cards.</p>
              </div>

              <PreviewFrame>
                {/* Simulated Public Event Landing Detail Page */}
                <div className="text-white bg-[#0B0B08] min-h-[500px] overflow-hidden rounded-lg font-archivo pb-8 border border-white/5">
                  {/* Hero Banner Area */}
                  <div className="relative w-full h-[220px] bg-white/5 border-b border-white/5">
                    {banner ? (
                      <img src={banner} alt={title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-bold uppercase text-[15px]">
                        No Cover Banner Uploaded
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b08] to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[var(--color-lime)] text-[#0b0b0b]">
                          {category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/10 text-white border border-white/5">
                          {eventType}
                        </span>
                      </div>
                      <h2 className="text-[20px] font-anton tracking-wider uppercase text-white drop-shadow-md leading-tight">
                        {title || "(Untitled Event)"}
                      </h2>
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left details */}
                    <div className="md:col-span-2 space-y-5">
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-bold text-white/40">Description</span>
                        <p className="text-[12.5px] text-white/70 leading-relaxed whitespace-pre-wrap">
                          {description || shortDescription || "No detailed guidelines configured yet."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-white/40 block">Timing schedule</span>
                          <p className="text-[12.5px] text-white font-bold">{start ? new Date(start).toLocaleString() : "(Not set)"}</p>
                          <span className="text-[10.5px] text-white/40 block">To {end ? new Date(end).toLocaleString() : "(Not set)"}</span>
                        </div>
                        <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-white/40 block">Venue Coordinate</span>
                          <p className="text-[12.5px] text-white font-bold">
                            {venueType === "OFFLINE" ? `🏢 OFFLINE` : venueType === "ONLINE" ? `💻 Online (${platform})` : `Hybrid`}
                          </p>
                          <span className="text-[10.5px] text-white/40 block truncate">
                            {venueType === "OFFLINE" || venueType === "HYBRID" ? venueLocation : meetingLink || "Meeting details provided upon checkout"}
                          </span>
                        </div>
                      </div>

                      {/* Prizes listing */}
                      {prizes.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <span className="text-[11px] uppercase font-bold text-white/40 block">Prize Pool & Awards</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {prizes.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-lime)]/10 bg-[var(--color-lime)]/5">
                                <Award className="w-5 h-5 text-[var(--color-lime)] shrink-0" />
                                <div>
                                  <p className="text-[12px] font-extrabold text-white leading-none">{p.title}</p>
                                  <p className="text-[11px] text-[var(--color-lime)] font-bold mt-1">
                                    ₹{p.cashPrize} {p.goodies ? `+ ${p.goodies}` : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FAQs list */}
                      {faqs.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                          <span className="text-[11px] uppercase font-bold text-white/40 block">Frequently Asked Queries</span>
                          <div className="space-y-2">
                            {faqs.map((f, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[12px] font-bold text-white">Q: {f.question}</p>
                                <p className="text-[11.5px] text-white/50 mt-1.5">A: {f.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side checkout box mock */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 font-archivo">
                        <span className="text-[11px] uppercase font-bold text-white/40 block">Registration Ticket</span>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-[12.5px] text-white/70 font-semibold">Mode:</span>
                          <span className="text-[12.5px] text-white font-bold">{isTeam ? `${minTeamSize}-${maxTeamSize} Player Team` : "Individual"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                          <span className="text-[13.5px] text-white/70 font-semibold">Entrance fee:</span>
                          <span className="text-[15px] text-[var(--color-lime)] font-extrabold">
                            {isFree ? "FREE ENTRY" : `₹${fee}`}
                          </span>
                        </div>

                        {/* Custom Registration field previews */}
                        <div className="border-t border-white/5 pt-3.5 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-white/40 block">Simulated Form Fields</span>
                          <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                            {registrationFormFields.slice(0, 4).map((f) => (
                              <div key={f.id} className="space-y-1">
                                <label className="text-[11px] text-white/60 block">{f.label} {f.required && "*"}</label>
                                <input 
                                  type="text" 
                                  placeholder={f.placeholder || `Enter response...`}
                                  className="w-full px-2.5 py-1.5 rounded bg-black border border-white/5 text-white text-[12px] outline-none"
                                  disabled
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="w-full py-3 rounded-lg bg-[var(--color-lime)] text-[#0b0b0b] text-[13px] font-extrabold uppercase tracking-wider text-center"
                          disabled
                        >
                          Checkout Ticket
                        </button>
                      </div>

                      {/* Coordinator Contact info card */}
                      <div className="p-4 rounded-xl border border-white/5 bg-[#141414]/30 space-y-3 text-[12px] text-white/60 leading-normal">
                        <span className="text-[10px] uppercase font-bold text-white/40 block">Organizer Contact</span>
                        <div>
                          <p className="font-bold text-white">Coordinator: {coordinatorName || "(Not set)"}</p>
                          <p className="text-[11px] text-white/50">{coordinatorEmail || "No Email"}</p>
                          <p className="text-[11px] text-white/50">{coordinatorPhone || "No Phone"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PreviewFrame>

              {/* Wizard Final Submit blocks */}
              <div className="h-[1px] bg-white/10 my-6"></div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-extrabold text-white transition-colors cursor-pointer text-center text-[13.5px]"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit("SUBMITTED_FOR_REVIEW")}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 font-extrabold text-blue-400 transition-colors cursor-pointer text-center text-[13.5px]"
                >
                  Submit for Approval
                </button>
                <button
                  onClick={() => handleSubmit("PUBLISHED")}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl bg-[var(--color-lime)] hover:bg-[var(--color-lime)]/90 font-extrabold text-[#0B0B08] shadow-[0_0_20px_rgba(215,255,61,0.2)] transition-all cursor-pointer text-center text-[13.5px]"
                >
                  Publish Live Immediately
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Form Footer Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors cursor-pointer
              ${currentStep === 0 
                ? "text-white/20 border border-transparent pointer-events-none" 
                : "text-white/60 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10"
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white text-[13px] font-bold transition-colors cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default EventWizard;
