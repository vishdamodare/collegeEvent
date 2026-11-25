"use client";

import Link from "next/link";

interface Category {
  name: string;
  count: string;
  icon: string;
  glow: string;
  slug: string;
  nearestCity?: string;
  trending?: boolean;
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Only categories a student can actually find something in
  const live = categories.filter((c) => !c.count.startsWith("0 "));
  if (live.length === 0) return null;

  return (
    <section className="pb-16 sm:pb-24">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-10">
        <h2 className="text-[clamp(28px,3.6vw,40px)] mb-6">Browse by category</h2>
        <div className="flex flex-wrap gap-3">
          {live.map((cat) => (
            <Link
              key={cat.slug}
              href={`/events?category=${cat.slug}`}
              className="inline-flex items-baseline gap-2 rounded-xl border border-[var(--color-border-bright)] px-4 py-2.5 text-[16px] font-semibold hover:bg-[var(--color-card-hover)] hover:border-[var(--color-text-faint)] transition-colors"
            >
              {cat.name}
              <span className="text-[14px] font-medium text-[var(--color-text-faint)]">{cat.count.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
