/* REC-220's NEGATIVE CONTROL HARNESS. Declared in `test/rec220-version-pin.test.mjs`, run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-rec220.mjs            # every arm, in order, baseline first
 *     node test/nc-rec220.mjs newest     # one arm
 *
 * NOT a `.test.mjs`: it EDITS `src/store.mjs` while it runs, so the battery must never discover it.
 * `nc-rec97.mjs`'s shape: one arm at a time with every other defence held open; a BASELINE row; each
 * arm DECLARES what must and must not fail before it runs and REPORTS whether it armed (a match count
 * other than exactly 1 is a finding); every restore is verified against a uniquely-named per-arm
 * pristine copy by sha256 AND by content, with the byte count printed and floored. The pen is
 * `.rec220-control-pristine/` at the repository root, gitignored and item-named.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, rmdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const SAFE = join(PLANE, "..", ".rec220-control-pristine");
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const run = () => {
  const r = spawnSync(process.execPath, ["test/rec220-version-pin.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /rec220-version-pin: (\d+) pass, (\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(6)) };
};

const ARMS = {
  baseline: { patch: null, mustFail: [], mustPass: ["PIN:", "AUTHORED:", "the leg's own bytes name"] },
  /* THE ROW'S OWN CONTROL: the resolver ignores the pin and answers the capture the bundle resolves to
     NOW — in the fixture that is B, the LATER capture. First armed as "ORDER BY at DESC" over the
     resolver's own column; that picked A, because the column mixes the SERVER's registration instant
     with a READING's own date and B's reading is dated 2020 — so it armed nothing the row names, and
     the run said so (NOT AS DECLARED). "The later capture" is the one the record came to hold after the
     citation, which is B, and resolving to it is what this arm now does. */
  newest: {
    patch: [`      return held ? held.capture_sha : null;
    }`, `      return held ? this.#captureForContent(bundleId) : null;
    }`],
    mustFail: ["PIN: the pinned bytes, projected fresh"],
    mustPass: ["the leg's own bytes name the capture it was made against", "the fixture ARMS the pin"] },
  /* The act stops writing the pin: the leg is back to naming only a bundle. */
  nostamp: {
    patch: [`        const pin = pinOf(target);`, `        const pin = null;`],
    mustFail: ["the leg's own bytes name the capture it was made against", "the receipt states the capture",
               "PIN: the pinned bytes, projected fresh"],
    mustPass: ["the fixture ARMS the pin"] },
  /* The carry-forward ignores an authored capture again (the pre-item key). */
  carry: {
    patch: [`              const carried = cp.authored
                ? priorContentAt.get(`, `              const carried = false
                ? priorContentAt.get(`],
    mustFail: ["AUTHORED: a leg its author re-points to B"],
    mustPass: ["PIN: the pinned bytes, projected fresh", "the leg's own bytes name"] },
  /* The read collapses "several captures, no pin" into "the only capture": undetermined stops being said. */
  collapse: {
    patch: [`                : n === 1 ? { state: "only_capture", capture: cap }`,
            `                : n >= 1 ? { state: "only_capture", capture: cap }`],
    mustFail: ["VERSION: now that two captures are held"],
    mustPass: ["VERSION: the unpinned leg reads `only_capture`", "PIN: the pinned bytes, projected fresh"] },
};

const only = process.argv[2];
const rows = [];
for (const [name, arm] of Object.entries(ARMS)) {
  if (only && only !== name) continue;
  const pristine = join(SAFE, `store.${name}.pristine.mjs`);
  copyFileSync(STORE, pristine);
  const before = sha(STORE);
  let armed = "n/a";
  if (arm.patch) {
    const src = readFileSync(STORE, "latin1");
    const n = src.split(arm.patch[0]).length - 1;
    armed = n === 1 ? "ARMED" : `DID NOT ARM (${n} matches)`;
    if (n === 1) writeFileSync(STORE, src.replace(arm.patch[0], arm.patch[1]), "latin1");
  }
  const r = armed.startsWith("DID NOT") ? { pass: -1, fail: -1, failing: [] } : run();
  copyFileSync(pristine, STORE);
  const restored = sha(STORE) === before && readFileSync(STORE).equals(readFileSync(pristine));
  const bytes = readFileSync(STORE).length;
  if (!restored || bytes < MIN_BYTES) { console.error(`RESTORE FAILED for ${name} (${bytes} bytes)`); process.exit(2); }
  rmSync(pristine);
  const hit = (label) => r.failing.some((f) => f.startsWith(label));
  const declared = arm.mustFail.every(hit) && !arm.mustPass.some(hit)
    && (arm.patch ? r.fail > 0 : r.fail === 0);
  rows.push(name);
  console.log(`[${name}] ${armed} -> ${r.pass} pass, ${r.fail} fail; ${declared ? "AS DECLARED" : "NOT AS DECLARED"}; `
            + `restored by sha256+cmp (${bytes} bytes, ${before.slice(0, 12)})`);
  for (const f of r.failing) console.log(`     FAIL ${f}`);
}
/* The pen is removed only if EMPTY: rmdir refuses a non-empty directory, which is the guard (a pristine
   copy left behind by a failed restore stays for a person to see). */
try { rmdirSync(SAFE); } catch { console.log(`pen kept: ${SAFE} is not empty`); }
console.log(`arms run: ${rows.join(", ")}`);
