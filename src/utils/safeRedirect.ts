// Only same-site paths: blocks open redirects like "//evil.com", "/\evil.com" or "/%09/evil.com"
export function safeRedirect(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || /[\x00-\x1f\\]/.test(path)) return null;
  try {
    const base = "http://x.invalid";
    return new URL(path, base).origin === base ? path : null;
  } catch {
    return null;
  }
}
