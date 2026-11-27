/**
 * Dependency-free SVG charts for the super admin dashboard. Pure rendering (no hooks), so they run on the server.
 * Every chart carries a text alternative, and colour is never the only cue (legends show the numbers).
 */

export type Series = { label: string; color: string; values: number[] };
export type Slice = { label: string; value: number; color: string };

const niceMax = (max: number) => (max <= 4 ? 4 : Math.ceil(max / 4) * 4);

/* ───────── Daily bars (several series over a shared x axis) ───────── */

/** Grouped bars, one group per day. Bars (not smoothed lines) because daily counts are discrete: nothing is drawn between days, and zero days stay empty. `id` is kept for callers; unused. */
export function AreaChart({ labels, series, height = 230 }: { id?: string; labels: string[]; series: Series[]; height?: number }) {
  const W = 680;
  const H = height;
  const padL = 28;
  const padR = 4;
  const padT = 10;
  const padB = 26;
  const n = labels.length;
  const top = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const band = (W - padL - padR) / n;
  const barW = Math.max(2, Math.min(9, (band * 0.72) / series.length));
  const groupW = barW * series.length + (series.length - 1);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const step = Math.max(1, Math.round(n / 6));
  const summary = series.map((s) => `${s.label}: ${s.values.reduce((a, b) => a + b, 0)} in total`).join(", ");

  return (
    // Below ~560px the labels would shrink past readability, so the chart scrolls sideways instead
    <div className="overflow-x-auto -mx-2 px-2 pb-1">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Activity over the last ${n} days. ${summary}.`} className="w-full min-w-[560px] h-auto overflow-visible">
        {[0, 1, 2, 3, 4].map((g) => {
          const v = (top * g) / 4;
          return (
            <g key={g}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className={g === 0 ? "stroke-sa-fg/25" : "stroke-sa-fg/[0.07]"} />
              <text x={padL - 8} y={y(v) + 3.5} textAnchor="end" fontSize="10.5" className="fill-sa-fg/45 tabular-nums">
                {v}
              </text>
            </g>
          );
        })}

        {labels.map((l, i) => {
          const last = i === n - 1;
          if (!(i % step === 0 && n - 1 - i >= step * 0.6) && !last) return null; // keep the final label, drop one that would collide with it
          return (
            <text key={i} x={padL + band * (i + 0.5)} y={H - 6} textAnchor={last ? "end" : i === 0 ? "start" : "middle"} fontSize="10.5" className={last ? "fill-sa-fg/80" : "fill-sa-fg/45"}>
              {l}
            </text>
          );
        })}

        {labels.map((l, i) => {
          const gx = padL + band * i + (band - groupW) / 2;
          return (
            <g key={i}>
              {series.map((s, j) => {
                const v = s.values[i] ?? 0;
                return v > 0 ? <rect key={s.label} x={gx + j * (barW + 1)} y={y(v)} width={barW} height={y(0) - y(v)} rx="1.5" fill={s.color} opacity="0.92" /> : null;
              })}
              {/* full-height hover column: highlights the day and gives a native tooltip */}
              <rect x={padL + band * i} y={padT} width={band} height={H - padT - padB} className="fill-transparent hover:fill-sa-fg/[0.06]">
                <title>{`${l}: ${series.map((s) => `${s.label} ${s.values[i] ?? 0}`).join(", ")}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───────── Share of a total (segmented bar + legend) ───────── */

/** Named `Donut` for existing callers. A ring with 2–5 slices reads worse than one segmented bar plus exact numbers, so it is a bar now. */
export function Donut({ slices, centerLabel }: { slices: Slice[]; centerLabel: string; size?: number }) {
  const total = slices.reduce((n, s) => n + s.value, 0);
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <div className="space-y-4">
      <p className="flex items-baseline gap-2">
        <span className="font-anton text-[34px] leading-none tabular-nums">{total}</span>
        <span className="text-[13.5px] text-sa-fg/55">{centerLabel}</span>
      </p>

      <div
        role="img"
        aria-label={`${centerLabel}: ${total} total. ${slices.map((s) => `${s.label} ${s.value}`).join(", ")}.`}
        className="flex h-3 gap-[2px] rounded-full overflow-hidden bg-sa-fg/[0.07]"
      >
        {total > 0 &&
          slices
            .filter((s) => s.value > 0)
            .map((s) => (
              <div key={s.label} title={`${s.label}: ${s.value} (${pct(s.value)}%)`} style={{ flex: s.value, background: s.color }} className="min-w-1.5 first:rounded-l-full last:rounded-r-full hover:brightness-125 transition" />
            ))}
      </div>

      <ul className="text-[13.5px] divide-y divide-sa-fg/5">
        {slices.map((s) => (
          <li key={s.label} className={`flex items-center gap-2.5 py-2 ${s.value === 0 ? "opacity-40" : ""}`}>
            <span aria-hidden className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-sa-fg/80">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{s.value}</span>
            <span className="w-10 text-right text-sa-fg/40 text-[12px] tabular-nums">{pct(s.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Horizontal bar list ───────── */

export function BarList({ items, color, empty }: { items: { label: string; value: number; hint?: string }[]; color: string; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="rounded-xl border border-dashed border-sa-fg/15 p-6 text-center text-sa-fg/50 text-[14px]">{empty}</p>;
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={i.label} title={`${i.label}: ${i.value}${i.hint ? ` ${i.hint}` : ""}`} className="group">
          <div className="flex items-baseline justify-between gap-4 text-[13.5px]">
            <span className="truncate text-sa-fg/80 group-hover:text-sa-fg transition-colors">{i.label}</span>
            <span className="shrink-0 tabular-nums">
              <strong className="font-semibold">{i.value}</strong>
              {i.hint && <span className="ml-1.5 text-sa-fg/40 text-[12px]">{i.hint}</span>}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-sa-fg/[0.07] overflow-hidden" role="presentation">
            <div className="h-full rounded-full group-hover:brightness-125 transition" style={{ width: `${Math.max(3, (i.value / max) * 100)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
