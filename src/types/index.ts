export interface TimelineNode {
  title: string;
  subtitle: string;
  desc: string;
}

export interface Event {
  id: string;
  title: string;
  cat: string;
  college: string;
  venue: string;
  date: string;
  participants: string;
  prize: string;
  img: string;
  sub: string;
  badge: string;
  slug?: string;
  timeline?: TimelineNode[];
}

export interface Category {
  name: string;
  count: string;
  icon: string;
  glow: string;
}

export interface PastEvent {
  name: string;
  icon: string;
  type: string;
}

export interface CollegeInfo {
  loc: string;
  founded: string;
  students: string;
  events: string;
  img: string;
  about: string;
  gallery: string[];
  past: PastEvent[];
}

export interface College {
  name: string;
  loc: string;
  events: string;
  students: string;
  img: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}
