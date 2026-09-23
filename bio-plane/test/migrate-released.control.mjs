/* REC-143's NEGATIVE CONTROL DRIVER, re-runnable in one step from `bio-plane/`:
 *
 *     node test/migrate-released.control.mjs            # every arm, in order
 *     node test/migrate-released.control.mjs alterafter # one arm
 *
 * Built on `conclude-project.control.mjs`'s driver, whose rules it keeps.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * The pristine copies live INSIDE THIS WORKTREE and are uniquely named per arm;
 * every restore is verified by CONTENT and by sha256 with the byte count floored
 * (never `git checkout --`, CLAUDE.md's trap); the suite's output is captured to a
 * FILE, never a pipe (D-282). Each arm is armed ALONE.
 *
 * THE DECLARATIONS ARE IN THE SUITE'S OWN `NEGATIVE CONTROL:` HEADER, made before
 * arming. The MEASURED figures are recorded at the foot of this file.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-migrate-released");       /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "migrate-released.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous needle
   — an arm that silently edited nothing reports the subject as unbreakable. With
   `DRY` set it records the anchor and writes nothing (D-331's preflight). */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

/* The FIRST pass is the call that closes the list and precedes the chain_kind
   block; the SECOND is the one under its own REC-143 comment. Each needle names
   exactly one of the two. */
const FIRST_PASS = "    addColumns();\n\n    /* REC-104: `content.chain_kind`";
const SECOND_PASS = "    /* REC-143: the second pass — see ADDITIVE_COLUMNS above the schema for why there are two. */\n    addColumns();";
/* D-436's first-boot witness (DIST #4, 2026-09-22): the ONE line that decides whether this boot is the
   store's birth, and so whether INSTANCE_NAME is recorded as its producing group. */
const GROUP_RECORD = "    if (firstBoot) this.#recordGroupAtFirstBoot();";
const FIRST_BOOT = "    const firstBoot = [...this.sql.exec(`PRAGMA table_info(bundles)`)].length === 0;";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes arms-working from arms-broken",
              apply: () => {} },

  alterafter: { files: [STORE],
    label: "(B) THIS EXACT BUG: the pre-schema pass removed, so the additive list runs only AFTER the "
         + "schema, as it did in 0.59.0-0.63.0",
    apply: () => edit(STORE, FIRST_PASS, "\n    /* REC-104: `content.chain_kind`") },

  nosecondpass: { files: [STORE],
    label: "(C) the post-schema pass removed: a table the schema creates this boot never gets its "
         + "list-only columns",
    apply: () => edit(STORE, SECOND_PASS, "    /* (armed: no second pass) */") },

  percolumn: { files: [STORE],
    label: "(D) OVER-STRICTNESS: a DIFFERENT correct fix — only the three columns the sweep found are "
         + "added before the schema, the special case per column this item declined. Behaviour is right, "
         + "so the suite must PASS: it tests what a store does, not how #migrate is spelled",
    apply: () => edit(STORE, FIRST_PASS,
        "    for (const [tb, col, d] of ADDITIVE_COLUMNS.filter(([tb, col]) => [\"inquiry_basis.content_id\", "
      + "\"inquiry_basis_version_legs.content_id\", \"reading_text_source.calibrations\"].includes(tb + \".\" + col))) {\n"
      + "      const h = [...this.sql.exec(`PRAGMA table_info(${tb})`)].map((r) => r.name);\n"
      + "      if (h.length && !h.includes(col)) this.sql.exec(`ALTER TABLE ${tb} ADD COLUMN ${col} ${d}`);\n"
      + "    }\n\n    /* REC-104: `content.chain_kind`") },

  firstbootalways: { files: [STORE],
    label: "(E) D-436's DECISION (b) broken: the first-boot witness forced TRUE, so a store a released plane "
         + "wrote records the bound INSTANCE_NAME at the current plane's boot — the worker name, where a group's "
         + "slug belongs, on a record the seed can then never correct",
    apply: () => edit(STORE, FIRST_BOOT, "    const firstBoot = true;") },

  firstbootnever: { files: [STORE],
    label: "(F) D-436's DECISION (a) broken: the first-boot witness forced FALSE, so a store BORN on the current "
         + "plane records nothing — the positive half, which keeps (E)'s absence from passing for free",
    apply: () => edit(STORE, FIRST_BOOT, "    const firstBoot = false;") },

  groupwipe: { files: [STORE],
    label: "(G) added by DIST #5 at the 0.72.0 cut, with the 0.71.0 row: the current plane ERASES a producing "
         + "group an older plane recorded, at every boot — a store born on 0.71.0 (the first release that records "
         + "one) loses its group on upgrade. DECLARED BEFORE ARMING: that store's two KEPT assertions FAIL and "
         + "nothing else, 394 pass, 2 fail (section 0 boots its fresh store once, and records after the wipe)",
    apply: () => edit(STORE, GROUP_RECORD, "    this.sql.exec(\"DELETE FROM instance_group\");\n" + GROUP_RECORD) },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("migrate-released.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/migrate-released: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 150));
    /* Read from the `got` lines ONLY: the suite's own assertion LABELS quote the
       error it reproduces, so a scan of the whole output named it on the BASELINE
       (measured on this driver's first run) — the instrument reading its own label. */
    const named = [...new Set(out.split("\n").filter((l) => /^ {9}got /.test(l))
      .flatMap((l) => l.match(/no such column: \w+/g) || []))];
    console.log(`  RESULT  ${tally}`);
    console.log(`  engine errors named in the output: ${named.join(", ") || "(none)"}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length, named });
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
for (const r of results) console.log(`  ${r.arm.padEnd(15)} ${r.tally}   (${r.failed} named failure(s); engine: ${r.named.join(", ") || "none"})`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);

/* MEASURED 2026-09-18 by the REC-143 worker (worktree agent-a70dee1231b11c76d), from this
   driver's own printed SUMMARY, every restore sha256 MATCH / content IDENTICAL:
     baseline      migrate-released: 201 pass, 0 fail    engine: none
     alterafter    migrate-released: 135 pass, 66 fail   engine: no such column: content_id — as declared
     nosecondpass  migrate-released: 176 pass, 25 fail   engine: no such column: schema_id — as declared
     percolumn     migrate-released: 201 pass, 0 fail    the over-strictness arm PASSES — as declared
   The declarations are in the suite's own NEGATIVE CONTROL header.

   MEASURED 2026-09-22 by DIST #4 (worktree dist-4, the 0.71.0 cut: 13 RELEASES rows, 0.70.0 added, and the
   D-436 boot arm), from this driver's own printed SUMMARY, every restore sha256 MATCH / content IDENTICAL:
     baseline        migrate-released: 357 pass, 0 fail    engine: none — as declared
     alterafter      migrate-released: 279 pass, 78 fail   engine: no such column: content_id — as declared
     nosecondpass    migrate-released: 317 pass, 40 fail   engine: no such column: schema_id
     percolumn       migrate-released: 357 pass, 0 fail    the over-strictness arm PASSES
     firstbootalways migrate-released: 321 pass, 36 fail   the 36 D-436 assertions ALONE — as declared
     firstbootnever  migrate-released: 356 pass, 1 fail    the D-436 POSITIVE arm ALONE — as declared
   The alterafter SEQUENCE (DIST.md lesson 19): 135 -> 169 -> 186 -> 203 -> 220 -> 237 pass / 66 fail, then
   254/66 with the 0.70.0 row by arithmetic and 279/78 with the D-436 assertions measured — the step in the
   FAIL count is the six bricked stores failing the two new assertions, not a change in what bricks.
   MEASURED 2026-09-23 by DIST #5 (cloud clone, the 0.72.0 cut: 14 RELEASES rows, 0.71.0 added — the first
   release that records a producing group, which falsified two premises of the suite, corrected there: op=file
   is compared against the OLD PLANE's own answer, and a 0.71.0-born store's group is KEPT, not absent), from
   this driver's own printed SUMMARY, store.mjs restored sha256 MATCH / content IDENTICAL after every arm:
     baseline        migrate-released: 396 pass, 0 fail    engine: none (376 by arithmetic + 20 new ARMED)
     alterafter      migrate-released: 318 pass, 78 fail   engine: no such column: content_id
     nosecondpass    migrate-released: 354 pass, 42 fail   engine: no such column: schema_id
     percolumn       migrate-released: 396 pass, 0 fail    the over-strictness arm PASSES
     firstbootalways migrate-released: 360 pass, 36 fail   the 36 D-436 assertions of the 18 pre-0.71.0 stores ALONE
     firstbootnever  migrate-released: 395 pass, 1 fail    the D-436 POSITIVE arm ALONE
     groupwipe       migrate-released: 394 pass, 2 fail    the 0.71.0 store's two KEPT assertions ALONE — as declared
   alterafter SEQUENCE: ... -> 279/78 (0.71.0's cut) -> 318/78 (the 0.71.0 row, +19 ARMED op=file and +1 ARMED
   group arm, all on the OLD plane, so they pass under every arm): the pass count rose, so the row is exercised.
   MEASURED 2026-09-23 by DIST #5 at the 0.73.0 cut (15 RELEASES rows, 0.72.0 added), every restore sha256 MATCH:
   baseline 417/0 (396 + 21, as predicted) · alterafter 339/78 · nosecondpass 373/44 · percolumn 417/0 ·
   firstbootalways 381/36 · firstbootnever 416/1 · groupwipe 413/4 (the 0.71.0 and 0.72.0 stores' KEPT assertions
   ALONE). alterafter SEQUENCE: … 279/78 → 318/78 → 339/78.
   MEASURED 2026-09-23 by DIST #5 at the 0.74.0 cut (16 rows, 0.73.0 added), each at the figure predicted before
   arming, every restore sha256 MATCH: baseline 438/0 · alterafter 360/78 · nosecondpass 392/46 · percolumn 438/0 ·
   firstbootalways 402/36 · firstbootnever 437/1 · groupwipe 432/6. alterafter SEQUENCE: … 318/78 → 339/78 → 360/78.
   MEASURED 2026-09-23 by DIST #5 at the 0.75.0 cut (17 rows, 0.74.0 added), every restore sha256 MATCH: baseline 459/0 ·
   alterafter 381/78 · nosecondpass 411/48 · percolumn 459/0 · firstbootalways 423/36 · firstbootnever 458/1 · groupwipe
   451/8 — two KEPT assertions per group-recording store, now four (0.71.0-0.74.0); the handoff's "453/6" was an
   arithmetic slip, and the measured figure is the structure's. alterafter SEQUENCE: … 339/78 → 360/78 → 381/78. */
