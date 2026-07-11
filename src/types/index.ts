export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface College {
  id: string;
  name: string;
  logo?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  capacity: number;
  registeredCount: number;
  category: Category;
  college: College;
  images: { url: string; isHero: boolean }[];
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';
}

export interface HeroEvent extends Event {
  images: { url: string; isHero: boolean }[];
}
