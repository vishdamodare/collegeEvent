"use client";

import { Event } from "@/types";
import { EventCard } from "./EventCard";

interface HeroCarouselProps {
  events: Event[];
  activeEventIndex: number;
  onEventSelect: (index: number) => void;
}

export function HeroCarousel({ events, activeEventIndex, onEventSelect }: HeroCarouselProps) {
  // Create an array of upcoming events by shifting the array based on the active index.
  // Example: if activeEventIndex is 1, we want [2, 3, 0]
  const upcomingEvents = [
    ...events.slice(activeEventIndex + 1),
    ...events.slice(0, activeEventIndex)
  ];

  return (
    <div className="w-full md:w-[40%] h-[50vh] md:h-full flex items-center justify-start overflow-visible pl-6 md:pl-12 lg:pl-16 relative z-20 mt-12 md:mt-0">
      <div className="flex items-center gap-6 md:gap-8 overflow-visible">
        {upcomingEvents.map((event, i) => {
          const originalIndex = events.findIndex(e => e.id === event.id);

          return (
            <EventCard
              key={event.id}
              event={event}
              index={originalIndex}
              isFirst={i === 0}
              onClick={() => onEventSelect(originalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
