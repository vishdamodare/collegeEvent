"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "20vh 16px", background: "#0b0b08", color: "#fff" }}>
        <h1>Something went wrong</h1>
        <button onClick={() => reset()} style={{ marginTop: 16, padding: "10px 20px", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
