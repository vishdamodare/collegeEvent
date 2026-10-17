// Only same-site paths: blocks open redirects like "//evil.com" or "https://evil.com"
export function safeRedirect(path: string | null | undefined): string | null {
  return path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : null;
}
