export const CERTIFICATE_TEMPLATES = [
  { id: "cert-participation", name: "Participation Standard", url: "participation-std.pdf" },
  { id: "cert-winner", name: "Gold Winner Trophy", url: "winner-gold.pdf" },
  { id: "cert-runner", name: "Silver Runner Up", url: "runner-silver.pdf" }
];

export function getCertificateTemplates() {
  return CERTIFICATE_TEMPLATES;
}
