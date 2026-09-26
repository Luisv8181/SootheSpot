type SupportService = { source: string; phone: string; name: string; verifiedOn: string };
const services: Record<string, SupportService> = {
  US: { source: "https://988lifeline.org/", phone: "988", name: "988 Suicide & Crisis Lifeline", verifiedOn: "2026-09-25" },
  CA: { source: "https://988.ca/", phone: "988", name: "9-8-8: Suicide Crisis Helpline", verifiedOn: "2026-09-25" }
};
export function supportForRegion(region: string): SupportService | null {
  return Object.hasOwn(services, region) ? services[region] : null;
}
export function contactHref(phone: string): string | null {
  if (!/^\+?[\d\s().-]+$/.test(phone)) return null;
  const normalized = phone.replace(/[\s().-]/g, "");
  return /^\+?\d{7,15}$/.test(normalized) ? `tel:${normalized}` : null;
}
