import { expect, it } from "vitest";
import { supportForRegion, contactHref } from "@/domain/safety/support";

it("never supplies a regional phone number without an explicit supported region", () => {
  for (const region of ["", "other", "es", "en", "unknown"]) {
    expect(supportForRegion(region)).toBeNull();
  }
});

it("routes explicit US and Canada choices to their own sourced services", () => {
  expect(supportForRegion("US")?.source).toBe("https://988lifeline.org/");
  expect(supportForRegion("CA")?.source).toBe("https://988.ca/");
  expect(supportForRegion("US")?.phone).toBe("988");
});

it("only creates a dialer link from a valid phone number", () => {
  expect(contactHref("+1 (212) 555-0100")).toBe("tel:+12125550100");
  expect(contactHref("javascript:alert(1)")).toBeNull();
  expect(contactHref("")).toBeNull();
});
