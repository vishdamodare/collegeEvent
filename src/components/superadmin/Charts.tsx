/**
 * Dependency-free SVG charts for the super admin dashboard. Pure rendering (no hooks), so they run on the server.
 * Every chart carries a text alternative, and colour is never the only cue (legends show the numbers).
 */

export type Series = { label: string; color: string; values: number[] };
export type Slice = { label: string; value: number; color: string };

const niceMax = (max: number) => (max <= 4 ? 4 : Math.ceil(max / 4) * 4);

/* ───────── Area / line chart (several series over a shared x axis) ───────── */

export function AreaChart({ id, labels, series, height = 230 }: { id: string; labels: string[]; series: Series[]; height?: number }) {
  const W = 680;
  const H = height;
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const n = labels.length;
  const top = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const x = (i: number) => padL + (n <= 1 ? 0 : (i * (W - padL - padR)) / (n - 1));
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const base = y(0);
  // Horizontal-tangent bezier between points: smooth, but never overshoots below 0 or above a real value
  const line = (vals: number[]) =>
    vals
      .map((v, i) => {
        if (i === 0) return `M${x(0).toFixed(1)} ${y(v).toFixed(1)}`;
        const mid = ((x(i - 1) + x(i)) / 2).toFixed(1);
        return `C${mid} ${y(vals[i - 1]).toFixed(1)} ${mid} ${y(v).toFixed(1)} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
      })
      .join(" ");
  const step = Math.max(1, Math.round(n / 5));
  const summary = series.map((s) => `${s.label}: ${s.values.reduce((a, b) => a + b, 0)} in total`).join(", ");

  return (
    // Below ~560px the labels would shrink past readability, so the chart scrolls sideways instead
    <div className="overflow-x-auto -mx-2 px-2 pb-1">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Activity over the last ${n} days. ${summary}.`} className="w-full min-w-[560px] h-auto overflow-visible">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`${id}-g${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0, 1, 2, 3, 4].map((g) => {
        const v = (top * g) / 4;
        return (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.08)" strokeDasharray={g === 0 ? undefined : "3 5"} />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.55)">
              {v}
            </text>
          </g>
        );
      })}

      {labels.map((l, i) =>
        i % step === 0 || i === n - 1 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="11" fill="rgba(255,255,255,0.55)">
            {l}
          </text>
        ) : null
      )}

      {series.map((s, i) => (
        <g key={s.label}>
          <path d={`${line(s.values)} L${x(n - 1).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`} fill={`url(#${id}-g${i})`} />
          <path d={line(s.values)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(n - 1)} cy={y(s.values[n - 1] ?? 0)} r="4" fill={s.color} stroke="#0A0A0A" strokeWidth="2" />
        </g>
      ))}

      {/* invisible hover columns give a native tooltip per day */}
      {labels.map((l, i) => (
        <rect key={i} x={x(i) - (W - padL - padR) / (n * 2)} y={padT} width={(W - padL - padR) / n} height={H - padT - padB} fill="transparent">
          <title>{`${l}: ${series.map((s) => `${s.label} ${s.values[i] ?? 0}`).join(" · ")}`}</title>
        </rect>
      ))}
    </svg>
    </div>
  );
}

/* ───────── Donut ───────── */

export function Donut({ slices, centerLabel, size = 168 }: { slices: Slice[]; centerLabel: string; size?: number }) {
  const total = slices.reduce((n, s) => n + s.value, 0);
  const r = 44;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const len = (s.value / total) * C;
      const arc = { ...s, len, offset };
      offset += len;
      return arc;
    });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${centerLabel}: ${total} total. ${slices.map((s) => `${s.label} ${s.value}`).join(", ")}.`} className="shrink-0">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
        {total > 0 &&
          arcs.map((a) => (
            <circle
              key={a.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth="14"
              strokeDasharray={`${Math.max(a.len - 1.5, 0.01)} ${C}`}
              strokeDashoffset={-a.offset}
              transform="rotate(-90 60 60)"
            >
              <title>{`${a.label}: ${a.value}`}</title>
            </circle>
          ))}
        <text x="60" y="60" textAnchor="middle" fontSize="24" fontWeight="700" fill="#fff" fontFamily="var(--font-anton), sans-serif">
          {total}
        </text>
        <text x="60" y="76" textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.6)">
          {centerLabel}
        </text>
      </svg>
      <ul className="w-full space-y-1.5 text-[13.5px]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span aria-hidden className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-white/75">{s.label}</span>
            <span className="ml-auto font-bold tabular-nums">{s.value}</span>
            <span className="w-10 text-right text-white/45 text-[12px] tabular-nums">{total ? Math.round((s.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Horizontal bar list ───────── */

export function BarList({ items, color, empty }: { items: { label: string; value: number; hint?: string }[]; color: string; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-white/50 text-[14px]">{empty}</p>;
  return (
    <ul className="space-y-3.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
            <span className="truncate text-white/85">{i.label}</span>
            <span className="font-bold tabular-nums shrink-0">
              {i.value}
              {i.hint && <span className="ml-1.5 text-white/45 font-normal text-[12px]">{i.hint}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-white/[0.07] overflow-hidden" role="presentation">
            <div className="h-full rounded-full" style={{ width: `${Math.max(4, (i.value / max) * 100)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
