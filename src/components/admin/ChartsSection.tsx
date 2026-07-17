"use client";

import { useState } from "react";

interface ChartsSectionProps {
  data: {
    dailyRegistrations: Array<{ label: string; value: number }>;
    topEvents: Array<{ name: string; value: number }>;
    categoryDistribution: Array<{ category: string; value: number }>;
  };
}

export function ChartsSection({ data }: ChartsSectionProps) {
  const [activePoint, setActivePoint] = useState<{ label: string; value: number } | null>(null);

  const linePoints = data?.dailyRegistrations || [];
  const maxVal = Math.max(...linePoints.map(p => p.value), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = () => {
    if (linePoints.length < 2) return [];
    const usableWidth = chartWidth - paddingX * 2;
    const usableHeight = chartHeight - paddingY * 2;
    const stepX = usableWidth / (linePoints.length - 1);
    
    return linePoints.map((point, index) => {
      const x = paddingX + index * stepX;
      const y = chartHeight - paddingY - (point.value / maxVal) * usableHeight;
      return { x, y, ...point };
    });
  };

  const coords = getCoordinates();
  
  // Build line path
  const linePath = coords.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  // Build area path (for gradient fill under the line)
  const areaPath = coords.length > 0 
    ? `${linePath} L ${coords[coords.length - 1].x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`
    : "";

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
      <div className="lg:col-span-2 rounded-2xl bg-[#141414]/50 border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent opacity-30"></div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-archivo text-[15px] font-bold text-white uppercase tracking-wider">Registration Growth</h3>
            <p className="font-archivo text-[11px] text-white/40">Weekly activity trends across all fests</p>
          </div>
          {activePoint && (
            <div className="bg-[#1C1C1C] border border-white/10 px-3 py-1.5 rounded-lg text-right font-archivo animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[10px] text-white/50">{activePoint.label}</p>
              <p className="text-[14px] font-bold text-[var(--color-lime)]">{activePoint.value} signups</p>
            </div>
          )}
        </div>

        {/* Custom SVG Line Chart */}
        <div className="w-full relative aspect-[5/2] min-h-[180px]">
          {linePoints.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-bold uppercase tracking-wider">
              No registration data available
            </div>
          ) : (
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0.0" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--color-lime)" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.1)" />

              {/* Gradient Area under line */}
              {areaPath && (
                <path d={areaPath} fill="url(#chart-glow)" />
              )}

              {/* Line Path */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="var(--color-lime)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />
              )}

              {/* Interaction Circles */}
              {coords.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#0B0B08"
                  stroke="var(--color-lime)"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all hover:r-7"
                  onMouseEnter={() => setActivePoint({ label: pt.label, value: pt.value })}
                  onMouseLeave={() => setActivePoint(null)}
                />
              ))}
            </svg>
          )}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center px-8 mt-2 text-[10px] font-bold text-white/30 font-archivo uppercase tracking-wider">
          {linePoints.map((pt, idx) => (
            <span key={idx}>{pt.label}</span>
          ))}
        </div>
      </div>

      {/* 2. Popular Categories Breakdown (Donut Graphic) */}
      <div className="rounded-2xl bg-[#141414]/50 border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-cobalt)] to-transparent opacity-30"></div>
        <div>
          <h3 className="font-archivo text-[15px] font-bold text-white uppercase tracking-wider mb-1">Categories Share</h3>
          <p className="font-archivo text-[11px] text-white/40 mb-6">Distribution of registrations across areas</p>
        </div>

        {/* Category Share List */}
        <div className="space-y-4 max-h-[160px] overflow-y-auto pr-1">
          {categoryRegistrations.length === 0 ? (
            <div className="text-white/40 text-xs font-bold uppercase tracking-wider py-8 text-center">
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
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Total Active Registrations</p>
          <p className="text-[20px] font-anton text-white mt-0.5">{total} Students</p>
        </div>
      </div>
    </div>
  );
}

export default ChartsSection;
