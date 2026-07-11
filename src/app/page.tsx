import { HeroSection } from "@/components/home/HeroSection";
import { MOCK_EVENTS } from "@/constants/events";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* 
        The HeroSection acts as the orchestrator of the landing page's first viewport.
        It receives the typed mock data via props, which can easily be replaced 
        by a Server Component Prisma fetch in the future.
      */}
      <HeroSection events={MOCK_EVENTS} />
    </main>
  );
}
