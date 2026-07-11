import { Event } from '../types';

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'ANNUAL TECH FEST 2026',
    date: '2026-10-15T09:00:00Z',
    location: 'Main Campus Auditorium',
    description: 'Experience the future at our annual technology festival. Join thousands of students for 48 hours of innovation, coding, and networking.',
    capacity: 500,
    registeredCount: 342,
    category: { id: 'c1', name: 'Tech Fest', slug: 'tech-fest', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    college: { id: 'col1', name: 'MIT College of Engineering' },
    images: [{ url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', isHero: true }],
    status: 'ACTIVE'
  },
  {
    id: 'e2',
    title: 'GLOBAL HACKATHON',
    date: '2026-11-20T18:00:00Z',
    location: 'Innovation Hub',
    description: 'Build solutions that matter. A 36-hour coding marathon with industry experts, amazing prizes, and unlimited coffee.',
    capacity: 200,
    registeredCount: 198,
    category: { id: 'c2', name: 'Hackathon', slug: 'hackathon', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    college: { id: 'col2', name: 'Stanford University' },
    images: [{ url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', isHero: true }],
    status: 'ACTIVE'
  },
  {
    id: 'e3',
    title: 'CULTURAL NIGHT EXPO',
    date: '2026-12-05T19:00:00Z',
    location: 'Open Air Theater',
    description: 'A mesmerizing evening of music, dance, and art celebrating the diverse culture of our student community.',
    capacity: 1000,
    registeredCount: 850,
    category: { id: 'c3', name: 'Cultural', slug: 'cultural', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    college: { id: 'col1', name: 'MIT College of Engineering' },
    images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop', isHero: true }],
    status: 'ACTIVE'
  },
  {
    id: 'e4',
    title: 'AI SUMMIT 2026',
    date: '2026-09-10T10:00:00Z',
    location: 'Conference Hall A',
    description: 'Explore the frontiers of artificial intelligence with keynote speakers from top tech companies and cutting-edge research presentations.',
    capacity: 300,
    registeredCount: 120,
    category: { id: 'c4', name: 'Conference', slug: 'conference', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    college: { id: 'col3', name: 'Harvard Tech' },
    images: [{ url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop', isHero: true }],
    status: 'ACTIVE'
  }
];
