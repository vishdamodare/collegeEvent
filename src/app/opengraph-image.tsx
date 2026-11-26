import { ImageResponse } from "next/og";

// Default 1200x630 share card for every page that doesn't set its own image (events use their banner)
export const alt = "CollegeEvent — Discover and register for college events in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#070914",
          color: "#F3F5FB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#DC2229", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 34 }}>
            E
          </div>
          <span>
            College<span style={{ color: "#DC2229" }}>Event</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Find college events across India</div>
          <div style={{ fontSize: 32, color: "#C2C8DC" }}>Fests, hackathons and competitions. Register free, get your QR ticket instantly.</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8189A6" }}>collegeevent.in</div>
      </div>
    ),
    { ...size }
  );
}
