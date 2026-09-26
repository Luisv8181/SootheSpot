import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Each temporary mutation must fail its named behavior test; original bytes are always restored.
const probes = [
  ["domain/data/storage.ts", "return { ok: false, rollbackFailed };", "return { ok: true, rollbackFailed };", "tests/storage.test.ts", "does not claim success", "Report a failed save as successful"],
  ["domain/data/storage.ts", "if (clear) storage.removeItem(storageKey);", "if (clear && key !== 'hiddenToolIds') storage.removeItem(storageKey);", "tests/storage.test.ts", "clears all owned keys", "Leave exclusions behind after clearing data"],
  ["domain/safety/support.ts", "return Object.hasOwn(services, region) ? services[region] : null;", "return services[region] ?? services.US;", "tests/support.test.ts", "never supplies a regional", "Default unknown regions to US support"],
  ["domain/safety/support.ts", "if (!/^\\+?[\\d\\s().-]+$/.test(phone)) return null;", "return 'tel:' + phone;", "tests/support.test.ts", "only creates a dialer", "Accept an unsafe dialer target"],
  ["domain/data/actions.ts", "JSON.stringify({ formatVersion: 1, exportedAt: new Date().toISOString(), data, unreadableCollections }, null, 2)", "JSON.stringify({ data: {} })", "tests/personalization.test.ts", "resets learned feedback", "Silently omit personal data from export"]
];

let failed = false;
for (const [file, find, replacement, testFile, testName, consequence] of probes) {
  const original = readFileSync(file, "utf8");
  if (!original.includes(find)) throw new Error(`NOT EVALUATED: mutation no longer matches ${file}`);
  try {
    writeFileSync(file, original.replace(find, replacement));
    const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", testFile, "-t", testName], { encoding: "utf8" });
    const output = result.stdout + result.stderr;
    const caught = result.status !== 0 && output.includes("AssertionError");
    console.log(`${caught ? "CAUGHT" : "SURVIVED / NOT EVALUATED"}: ${consequence}`);
    if (!caught) { console.log(output); failed = true; }
  } finally { writeFileSync(file, original); }
}
process.exitCode = failed ? 1 : 0;
