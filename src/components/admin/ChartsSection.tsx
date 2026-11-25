"use client";

import { useState } from "react";

interface ChartsSectionProps {
  data: {
    dailyRegistrations: Array<{ label: string; value: number }>;
    topEvents: Array<{ name: string; value: number }>;
    categoryDistribution: Array<{ category: string; value: number }>;
  };
}

// Plot area in % of the chart box. Dots, tooltip and day labels all use the same x/y math,
// so they line up at any width (the old SVG viewBox and the label row used different padding).
const PAD_L = 7;
const PAD_R = 4;
const PAD_T = 10;
const PAD_B = 10;

export function ChartsSection({ data }: ChartsSectionProps) {
  const [active, setActive] = useState<number | null>(null);

  const linePoints = data?.dailyRegistrations || [];
  const n = linePoints.length;
  const peak = Math.max(...linePoints.map((p) => p.value), 0);
  const maxVal = Math.max(4, Math.ceil(peak * 1.1)); // headroom so the peak isn't glued to the top edge
  const weekTotal = linePoints.reduce((s, p) => s + p.value, 0);

  const xPct = (i: number) => (n > 1 ? PAD_L + (i * (100 - PAD_L - PAD_R)) / (n - 1) : 50);
  const yPct = (v: number) => PAD_T + (1 - v / maxVal) * (100 - PAD_T - PAD_B);
  const coords = linePoints.map((p, i) => ({ ...p, x: xPct(i), y: yPct(p.value) }));

  const linePath = coords.map((c, i) => `${i ? "L" : "M"} ${c.x} ${c.y}`).join(" ");
  const baseY = 100 - PAD_B;
  const areaPath = coords.length > 1 ? `${linePath} L ${coords[coords.length - 1].x} ${baseY} L ${coords[0].x} ${baseY} Z` : "";
  const ticks = [maxVal, Math.round(maxVal / 2), 0];
  const activePt = active !== null ? coords[active] : null;

  // Category share list calculations
  const categoryDistribution = data?.categoryDistribution || [];
  const total = categoryDistribution.reduce((acc, curr) => acc + curr.value, 0);
  const categoryRegistrations = categoryDistribution.map(cat => {
    const percentage = total > 0 ? Math.round((cat.value / total) * 100) : 0;
    return {
      category: cat.category,
      percentage,
      color: "var(--color-lime)"
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Registrations Over Time (Line Chart) */}
      <div className="lg:col-span-2 rounded-2xl bg-[#141414]/50 border border-white/10 p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--ink)]">Registrations this week</h2>
            <p className="text-[13px] text-[var(--ink-3)]">New sign-ups per day across your events</p>
          </div>
          {/* Fixed summary instead of a hover box here: inserting content in the header shifted the chart under the cursor */}
          <div className="text-right font-archivo shrink-0">
            <p className="text-[18px] font-bold text-white tabular-nums leading-none">{weekTotal}</p>
            <p className="text-[10px] text-white/40 mt-1">this week</p>
          </div>
        </div>

        {n === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-[var(--ink-3)] text-[13px]">
            No registration data available
          </div>
        ) : (
          <>
            {/* Chart box: SVG draws line/area/grid; dots, guide and tooltip are HTML on the same % grid */}
            <div className="relative h-[220px] select-none" onMouseLeave={() => setActive(null)}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {ticks.map((t, i) => (
                  <line
                    key={i}
                    x1={PAD_L}
                    x2={100 - PAD_R}
                    y1={yPct(t)}
                    y2={yPct(t)}
                    stroke={t === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}
                    strokeDasharray={t === 0 ? undefined : "3 3"}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {areaPath && <path d={areaPath} fill="url(#chart-glow)" />}
                {n > 1 && (
                  <path d={linePath} fill="none" stroke="var(--color-lime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                )}
              </svg>

              {/* Y-axis values */}
              {ticks.map((t, i) => (
                <span key={i} className="absolute left-0 -translate-y-1/2 text-[10px] text-white/30 tabular-nums" style={{ top: `${yPct(t)}%` }}>
                  {t}
                </span>
              ))}

              {/* Vertical guide for the hovered day */}
              {activePt && <div className="absolute top-[6%] bottom-[10%] w-px bg-white/15 -translate-x-1/2 pointer-events-none" style={{ left: `${activePt.x}%` }} />}

              {/* Dots */}
              {coords.map((pt, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute rounded-full border-[2.5px] border-[var(--color-lime)] bg-[#0B0B08] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-[width,height] duration-150 ${active === i ? "w-4 h-4" : "w-3 h-3"}`}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              ))}

              {/* Hover/focus targets: one full-height column per day, so you don't have to hit a 5px dot */}
              {coords.map((pt, i) => {
                const half = n > 1 ? (100 - PAD_L - PAD_R) / (n - 1) / 2 : 50;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${pt.label}: ${pt.value} signups`}
                    className="absolute top-0 bottom-0 cursor-crosshair focus:outline-none"
                    style={{ left: `${Math.max(0, pt.x - half)}%`, width: `${half * 2}%` }}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  />
                );
              })}

              {/* Tooltip floats next to the point (absolute, so nothing else moves); flips below near the top edge */}
              {activePt && (
                <div
                  role="status"
                  className="absolute z-10 pointer-events-none bg-[#1C1C1C] border border-white/10 px-3 py-1.5 rounded-lg font-archivo shadow-lg whitespace-nowrap"
                  style={{
                    left: `${activePt.x}%`,
                    top: `${activePt.y}%`,
                    transform: `translate(${active === 0 ? "-10%" : active === n - 1 ? "-90%" : "-50%"}, ${activePt.y < 35 ? "14px" : "calc(-100% - 14px)"})`,
                  }}
                >
                  <p className="text-[10px] text-white/50">{activePt.label}</p>
                  <p className="text-[14px] font-bold text-[var(--color-lime)] tabular-nums">
                    {activePt.value} {activePt.value === 1 ? "signup" : "signups"}
                  </p>
                </div>
              )}
            </div>

            {/* X-axis labels on the same % positions as the dots */}
            <div className="relative h-5 mt-2 text-[10px] font-bold text-white/30 font-archivo uppercase tracking-wider">
              {coords.map((pt, i) => (
                <span key={i} className={`absolute -translate-x-1/2 transition-colors ${active === i ? "text-white" : ""}`} style={{ left: `${pt.x}%` }}>
                  {pt.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Popular Categories Breakdown (Donut Graphic) */}
      <div className="rounded-2xl bg-[#141414]/50 border border-white/10 p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
          <h2 className="text-[16px] font-semibold text-[var(--ink)] mb-1">By category</h2>
          <p className="text-[13px] text-[var(--ink-3)] mb-6">Where your registrations come from</p>
        </div>

        {/* Category Share List */}
        <div className="space-y-4 max-h-[160px] overflow-y-auto pr-1">
          {categoryRegistrations.length === 0 ? (
            <div className="text-[var(--ink-3)] text-[13px] py-8 text-center">
              No categories distribution yet
            </div>
          ) : (
            categoryRegistrations.map((cat, idx) => (
              <div key={idx} className="space-y-1.5 font-archivo">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-white/80">{cat.category}</span>
                  <span className="font-bold text-white">{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color || "var(--color-lime)"
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 text-center font-archivo">
          <p className="text-[12px] text-[var(--ink-3)]">Active registrations</p>
          <p className="text-[20px] font-anton text-white mt-0.5">{total} Students</p>
        </div>
      </div>
    </div>
  );
}

export default ChartsSection;
