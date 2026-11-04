const TRUSTED_HOSTS = ["res.cloudinary.com", "images.unsplash.com", "upload.wikimedia.org", "lh3.googleusercontent.com"];
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

/** https URL that points at an image (trusted image host or image file extension), not an arbitrary web page. */
export function isImageUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && (TRUSTED_HOSTS.includes(u.hostname) || IMAGE_EXT.test(u.pathname));
  } catch {
    return false;
  }
}
