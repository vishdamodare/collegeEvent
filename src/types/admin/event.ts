import { TicketType } from "./ticket";
import { CouponType } from "./coupon";
import { FormField } from "./registration";
import { SponsorType } from "./sponsor";
import { AuditLog } from "./audit";

export type EventStatus =
  | "DRAFT"
  | "INCOMPLETE_DRAFT"
  | "READY_TO_PUBLISH"
  | "SUBMITTED_FOR_REVIEW"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "EVENT_LIVE"
  | "COMPLETED"
  | "CERTIFICATES_GENERATED"
  | "ARCHIVED"
  | "DELETED";

export interface EventBasicInfo {
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  eventType?: string;
  shortDescription: string;
  description: string;
  language?: string;
  tags: string[];
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  openGraphImage?: string;
}

export interface EventSchedule {
  registrationOpens: string;
  registrationCloses: string;
  start: string;
  end: string;
  timezone: string;
  earlyBirdDeadline?: string;
  lateRegistrationDeadline?: string;
  countdownTimer?: boolean;
}

export interface EventVenue {
  venueType: "OFFLINE" | "ONLINE" | "HYBRID";
  venueLocation: string; // Merged college, building, hall, room, etc.
  address?: string;
  googleMapsLink?: string;
  meetingLink?: string;
  platform?: string;
  password?: string;
}

export interface EventRegistrationConfig {
  isTeam: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  maxRegistrations: number;
  isWaitingListEnabled: boolean;
  requireApproval: boolean;
  allowMultiple: boolean;
  allowCollegeVerification?: boolean;
  collectAdditionalInfo?: boolean;
  registrationDeadline?: string;
  lateRegistrationAllowed?: boolean;
  registrationFormFields?: FormField[];
  captainCode?: string;
  teamApprovalRequired?: boolean;
}

export interface EventPricing {
  isFree: boolean;
  fee: number;
  couponCodes: string[];
  discounts?: string;
  refundPolicy?: string;
  gstIncluded?: boolean;
  platformFee?: number;
  cancellationPolicy?: string;
  paymentDeadline?: string;
  successMessage?: string;
  failureMessage?: string;
  ticketingEnabled?: boolean;
  tickets?: TicketType[];
  couponsEnabled?: boolean;
  coupons?: CouponType[];
}

export interface EventMedia {
  banner: string;
  poster?: string;
  thumbnail?: string;
  gallery?: string[];
  sponsorLogos?: string[];
  videos?: string[];
  attachments?: string[];
  promoVideoUrl?: string;
  brochurePdfUrl?: string;
  rulebookPdfUrl?: string;
}

export interface PrizeType {
  title: string;
  cashPrize?: number;
  goodies?: string;
  description?: string;
}

export interface EventRules {
  eligibility?: string;
  requirements?: string;
  instructions?: string;
  dressCode?: string;
  codeOfConduct?: string;
  termsAndConditions?: string;
  judgingCriteria?: string;
  prizes?: PrizeType[];
  faqs?: { question: string; answer: string }[];
  privacyPolicy?: string;
}

export interface EventContact {
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  instagram?: string;
  website?: string;
  linkedin?: string;
}

export interface EventCertificates {
  participationTemplate?: string;
  autoGenerate?: boolean;
  emailAfterEvent?: boolean;
}

export interface AdminEvent {
  id: string;
  status: EventStatus;
  basic: EventBasicInfo;
  schedule: EventSchedule;
  venue: EventVenue;
  registration: EventRegistrationConfig;
  pricing: EventPricing;
  media: EventMedia;
  rules: EventRules;
  contact: EventContact;
  certificates: EventCertificates;
  sponsors?: SponsorType[];
  auditLogs?: AuditLog[];
  createdAt: string;
  updatedAt: string;
}
