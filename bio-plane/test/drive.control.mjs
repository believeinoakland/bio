/* CAP-8's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one
 * step:
 *
 *     node test/drive.control.mjs            # every arm, in order
 *     node test/drive.control.mjs f          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never be one that rewrites `src/` underneath the suites running
 * beside it (`d249-port.control.mjs`'s rule, followed here unchanged).
 *
 * THE THREE RULES THIS PROJECT PAID FOR, obeyed here:
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, uniquely named PER ARM and per
 *      file, never in the shared scratchpad — two workers writing one scratch
 *      path materialised one's file into the other's tree.
 *   2. EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, byte count printed and
 *      FLOORED. A harness once reported a byte-identical restore over a file it
 *      had not restored.
 *   3. THE SUITE'S OUTPUT GOES TO A FILE, NEVER A PIPE. D-282: a suite calling
 *      `process.exit()` discards unflushed pipe writes and the tally reads -1.
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open.
 *
 * WHAT THE SIX ARMS ASK, since a list of edits is not a list of questions:
 *   (1) does the export fetch FAILING actually refuse — and, the half that
 *       matters, does the shell stay unfiled when it does?
 *   (2) is the D-112 fence LOAD-BEARING, or would a caller's hop fact be
 *       harmlessly ignored anyway?
 *   (3) OVER-STRICTNESS: does a google.com address that is not Drive still take
 *       the ordinary path, byte for byte?
 *   (4a/4b) the shell at the export address, at BOTH sites — the declared type
 *       and the bytes — because one predicate at two points leaves one of them
 *       undrivable (PL-4), and these are two separate codes for that reason.
 *   (5) is a FOLDER named, or would it silently capture Google's listing?
 *   (6) THE ARM'S OWN ARM: neuter the SHAPE RECOGNISER and the fixture's Drive
 *       address takes the ordinary path. The suite must FAIL BY NAME. Without
 *       this arm every assertion above could be passing over an inert handler.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-drive");               /* inside this worktree, rule 1 */
const INDEX = join(ROOT, "src", "index.mjs");
const DRIVE = join(ROOT, "src", "drive.mjs");
const SUITE = join(DIR, "drive.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                /* a "restore" of a truncated file is not a restore */

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS when the needle is
   absent or ambiguous. An arm that silently edited nothing reports the subject
   as unbreakable, which is the one wrong answer a control can give — and this
   project has measured arms that NEVER ARMED three separate ways. */
const edit = (file, needle, replacement) => {
  if (ANCHOR_DRY) return void anchorPatch(file, needle, replacement);   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  baseline: {
    files: [],
    label: "nothing armed — the row that distinguishes six-arms-working from six-arms-broken. "
         + "A harness whose first run reported the same thing for every arm INCLUDING this one is "
         + "the receipt for why it exists",
    apply: () => {},
  },

  /* (1) THE EXPORT FETCH FAILING. The fixture's 404 and 403 arms are already in
     the suite; what this arms is the REFUSAL ITSELF, by making the plane fall
     through to the ordinary `SOURCE_REFUSED` instead of naming the Drive
     failure. The question is not only "does it refuse" — the ordinary path
     refuses too — but "does it refuse BY NAME, so an operator learns that a
     Drive export was unreachable rather than that some address 404'd". */
  one: {
    files: [INDEX],
    label: "(1) THE EXPORT FETCH FAILING loses its name — disarm the Drive-specific refusal so a 404 "
         + "or 403 at the export address falls through to the generic SOURCE_REFUSED. MUST GO RED: "
         + "the failure must be NAMED, and an unnamed refusal is the silent-skip defect wearing a "
         + "different hat",
    apply: () => edit(INDEX, "      if (driveCapture && !res.ok) {", "      if (false && !res.ok) {"),
  },

  /* (2) D-112. The fence's own value is in question here, not the plane's
     correctness: with the fence disarmed the capture still SUCCEEDS with the
     plane's own correctly derived hop, because nothing ever reads a hop fact off
     a body. So a SILENT drop would be behaviourally invisible, and the only
     thing that can tell the fence is present is that it SPEAKS. */
  two: {
    files: [DRIVE],
    label: "(2) A HOP FACT SUPPLIED BY THE CALLER is accepted silently — make `callerSuppliedHopFacts` "
         + "return [] always. MUST GO RED. The finding this arm produces is the interesting part: the "
         + "capture still succeeds with the plane's own derived hop, so the record is not corrupted — "
         + "which is exactly why the refusal has to be LOUD. A caller told nothing learns nothing",
    apply: () => edit(DRIVE,
      "  if (!body || typeof body !== \"object\") return [];\n"
    + "  return DRIVE_HOP_FACT_KEYS.filter((k) => Object.prototype.hasOwnProperty.call(body, k));",
      "  if (!body || typeof body !== \"object\") return [];\n"
    + "  return [];"),
  },

  /* (3) OVER-STRICTNESS, and it is armed in the direction that actually happens:
     somebody "tidies" the host test into a suffix match. `endsWith("google.com")`
     looks equivalent and swallows `www.google.com`, `fonts.googleapis.com` is
     spared only by accident, and every Google property in the corpus stops
     taking the ordinary path. */
  three: {
    files: [DRIVE],
    label: "(3) OVER-STRICTNESS — widen the host fence from an EXACT set to a suffix match "
         + "(`host.endsWith(\"google.com\")`), the tidy-up that looks equivalent. MUST GO RED: maps "
         + "and search are not Drive, and a fence tighter than its rule is an undeclared interface "
         + "change wearing the costume of caution",
    apply: () => edit(DRIVE,
      "  if (!DRIVE_HOSTS.includes(host)) return null;",
      "  if (!host.endsWith(\"google.com\")) return null;"),
  },

  /* (4a) THE SHELL ON THE DECLARED TYPE. Declared RED. Its actual answer is the
     more interesting one and is recorded in the suite's declaration: the BYTES
     arm catches the same shell one refusal later, under a DIFFERENT code — which
     is the measurement that justifies C-48.7 existing at all. */
  fourA: {
    files: [INDEX],
    label: "(4a) THE SHELL AT THE EXPORT ADDRESS, declared-type arm — disarm the `text/html` check in "
         + "`is-drive-export`. MUST GO RED on the arm that names the declared content type. What it "
         + "must NOT do is let the shell be filed: the bytes arm is the second line and this arm "
         + "measures whether there really is one",
    apply: () => edit(INDEX,
      "        if (ect === \"text/html\" || ect === \"application/xhtml+xml\") {",
      "        if (false) {"),
  },

  /* (4b) THE SHELL ON THE BYTES. This is the arm whose failure mode is the
     record holding Google's application in place of a city document — the exact
     outcome the item exists to prevent, measured rather than asserted. */
  fourB: {
    files: [INDEX],
    label: "(4b) THE SHELL AT THE EXPORT ADDRESS, bytes arm — disarm the bytes-first check in "
         + "`is-drive-bytes`, so a shell served under a LYING content type is not recognised. MUST GO "
         + "RED, and the failure must show the shell being FILED AS THE DOCUMENT. That is the defect "
         + "this whole item exists to prevent and this arm is the only place it is ever seen",
    apply: () => edit(INDEX,
      "      if (driveCapture && driveHeadBytes > 0) {",
      "      if (false && driveHeadBytes > 0) {"),
  },

  /* (5) THE FOLDER. Not "does it refuse" but "is the absence NAMED" — a folder
     falling through captures Google's listing page and files it as a document,
     which is the silent skip inverted and looks like a successful capture. */
  five: {
    files: [DRIVE],
    label: "(5) A FOLDER ADDRESS is silently skipped — make the folder branch never match, so a folder "
         + "falls through to the ordinary path. MUST GO RED, and the failure must show the folder "
         + "being CAPTURED: Google's listing HTML filed as though it were a document, which is a "
         + "success-shaped absence and the worst outcome available here",
    apply: () => edit(DRIVE,
      "  if ((seg[0] === \"drive\" && seg[1] === \"folders\")",
      "  if (false && (seg[0] === \"drive\" && seg[1] === \"folders\")"),
  },

  /* (6) THE ARM'S OWN ARM, and it is the one the brief names by hand. Every
     assertion in the suite could in principle be passing over a handler that
     never fires — the recogniser returning null everywhere would leave the
     fixture's Drive addresses taking the ordinary path and capturing the shell.
     If the suite does not go loudly red here, the suite is not testing its
     subject. */
  six: {
    files: [DRIVE],
    label: "(6) THE ARM'S OWN ARM — NEUTER THE SHAPE RECOGNISER (`readDriveAddress` returns null for "
         + "everything), so the fixture's Drive address takes the ordinary path and the APPLICATION "
         + "SHELL is captured as the document. MUST GO RED ACROSS EVERY BLOCK AND BY NAME. A green "
         + "here would mean this suite has been measuring an inert handler all along",
    apply: () => edit(DRIVE,
      "export function readDriveAddress(address) {\n"
    + "  if (typeof address !== \"string\" || !/^https:\\/\\//.test(address)) return null;",
      "export function readDriveAddress(address) {\n"
    + "  if (true) return null;\n"
    + "  if (typeof address !== \"string\" || !/^https:\\/\\//.test(address)) return null;"),
  },
};

anchorEach(ARMS, (a) => a.apply());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

mkdirSync(PEN, { recursive: true });
const results = [];

for (const name of order) {
  const arm = ARMS[name];
  const snaps = arm.files.map((f) => {
    const buf = readFileSync(f);
    if (buf.length < FLOOR) throw new Error(`refusing to snapshot a suspiciously small ${f}: ${buf.length} bytes`);
    const copy = join(PEN, `${name}--${f.split("/").pop()}.pristine`);
    writeFileSync(copy, buf);
    return { file: f, copy, bytes: buf.length, sha: sha(buf) };
  });
  console.log(`\n=== ARM ${name} ===\n${arm.label}`);
  for (const s of snaps) console.log(`  pristine ${s.file.split("/").pop()}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 16)}…`);

  let tally = "(not run)";
  let failedCount = 0;
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement, not an error */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    /* REPORT A MISSING TALLY AS -1 AND NEVER AS 0 (WORKER.md): a TypeError inside
       an assertion goes through no assertion at all and ends the module while the
       count still reads clean, so "the suite never reached its own foot" must be
       visibly different from "the suite passed". */
    const m = /^drive: (\d+) pass, (\d+) fail$/m.exec(out);
    tally = m ? m[0] : "(-1: the suite produced NO TALLY — it died before its own foot)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 120));
    failedCount = m ? Number(m[2]) : -1;
    console.log(`  RESULT  ${tally}`);
    for (const f of failed.slice(0, 8)) console.log(`    FAILING  ${f}`);
    if (failed.length > 8) console.log(`    … and ${failed.length - 8} more named failure(s)`);
    if (!failed.length && name !== "baseline")
      console.log("    (NO NAMED FAILURE — a surprising green is a finding about the ARM; record it)");
    results.push({ arm: name, tally, failed: failedCount, named: failed.length });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results)
  console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.named} named failure(s))`);
/* THE BASELINE ROW IS THE CONTROL ON THE CONTROL. If it is not green, every
   other row means nothing, and the harness says so rather than leaving the
   reader to notice. */
const base = results.find((r) => r.arm === "baseline");
if (base && base.failed !== 0)
  console.log("\n  WARNING: THE BASELINE IS NOT GREEN. Nothing above is a measurement of an arm.");
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
