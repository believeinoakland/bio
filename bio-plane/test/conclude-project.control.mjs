/* REC-124's NEGATIVE CONTROL DRIVER — REC-136 added arms e, f and g (seven arms plus a
 * baseline), re-runnable in one step
 * from `bio-plane/`:
 *
 *     node test/conclude-project.control.mjs            # every arm, in order
 *     node test/conclude-project.control.mjs a          # one arm
 *
 * Built on `reviewcopy.control.mjs`'s driver (REC-126), whose rules it keeps.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * `casesign.control.mjs`'s three rules, obeyed for its reasons: pristine copies live
 * INSIDE THIS WORKTREE and are uniquely named per arm; every restore is verified by
 * CONTENT and by sha256 with the byte count floored; the suite's output is captured
 * to a FILE, never a pipe (D-282). Each arm is armed ALONE.
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
const PEN = join(ROOT, ".nc-conclude-project");          /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const CHECKS = join(ROOT, "checks", "bio-checks.mjs");
const SUITE = join(DIR, "conclude-project.test.mjs");
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

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(A) THE PER-PROJECT RECORD COLLAPSED TO ONE SHARED STATE: #conclusionOf answers from the "
            + "first project that concluded the inquiry, whichever project was asked — one conclusion, echoed",
       /* REC-136: the ONE reader is now #conclusionRecordOf (the history and the
          stance); the liar is the same — the anchor moved with the reader. */
       apply: () => edit(STORE,
         "    const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, pid);\n"
       + "    if (!md || md.content === null) return none;\n"
       + "    const fm = parseFrontmatter(md.content).data || {};\n"
       + "    const rows = Array.isArray(fm.conclusions) ? fm.conclusions : [];",
         "    const md = this.#one(`SELECT content FROM files WHERE path='bundle.md' AND content LIKE ? "
       + "ORDER BY bundle_id LIMIT 1`, `%conclusions:%${inquiryId}%`);\n"
       + "    if (!md || md.content === null) return none;\n"
       + "    const fm = parseFrontmatter(md.content).data || {};\n"
       + "    const rows = Array.isArray(fm.conclusions) ? fm.conclusions : [];") },

  b: { files: [STORE],
       label: "(B) THE NO_CLAIM REFUSAL REMOVED for a reading that states no claim: it is adopted with an "
            + "empty claim",
       apply: () => edit(STORE,
         "if (!v || v.state !== \"accepted\" || !claimText)",
         "if (!v || v.state !== \"accepted\")") },

  c: { files: [STORE],
       label: "(C) THE LEGACY CLAIM BACK-FILLED from the conclusion text — claim := conclusion on read",
       /* REC-136: the legacy read now starts from an undetermined claim and
          upgrades only a verified adoption; the back-fill arms the starting value. */
       apply: () => edit(STORE,
         "    let claim = Store.#undeterminedClaim();",
         "    let claim = { state: \"adopted\", text: s(fm.conclusion), version: null };") },

  d: { files: [STORE],
       label: "(D) OVER-STRICTNESS: a project may NOT conclude a question whose own state is already "
            + "`concluded` — one relationship's conclusion barring another's",
       apply: () => edit(STORE,
         "if (!legalFrom.includes(\"concluded\") && !(pid && b.current_state === \"concluded\"))",
         "if (!legalFrom.includes(\"concluded\"))") },

  /* ---- REC-136 (INVESTIGATIVE-SESSION.md §7.1 items 6-7) ---- */
  e: { files: [STORE],
       label: "(E) REPLACE-THE-ROW RESTORED: a project's new conclusion or withdrawal REPLACES its earlier "
            + "entry for the question instead of appending — REC-124's writer, the defect item 7 names",
       apply: () => edit(STORE,
         "    let i = at + 1;\n"
       + "    while (i < end && /^\\s{2,}(- )?\\S/.test(lines[i])) i++;\n"
       + "    return [...lines.slice(0, i), ...block, ...lines.slice(i)].join(\"\\n\");",
         "    const unquote = (s) => String(s).trim().replace(/^\"(.*)\"$/, \"$1\").trim();\n"
       + "    let i = at + 1, rowStart = -1, rowEnd = -1;\n"
       + "    while (i < end && /^\\s{2,}(- )?\\S/.test(lines[i])) {\n"
       + "      if (/^\\s{2}- /.test(lines[i])) {\n"
       + "        if (rowStart !== -1 && rowEnd === -1) rowEnd = i;\n"
       + "        const m = /^\\s{2}- inquiry:\\s*(.+)$/.exec(lines[i]);\n"
       + "        if (m && unquote(m[1]) === inquiryId) rowStart = i;\n"
       + "      }\n"
       + "      i++;\n"
       + "    }\n"
       + "    if (rowStart === -1) return [...lines.slice(0, i), ...block, ...lines.slice(i)].join(\"\\n\");\n"
       + "    if (rowEnd === -1) rowEnd = i;\n"
       + "    return [...lines.slice(0, rowStart), ...block, ...lines.slice(rowEnd)].join(\"\\n\");") },

  f: { files: [STORE],
       label: "(F) THE VERSION REQUIREMENT DROPPED: a no-project conclude naming no reading is accepted, as "
            + "REC-124 built it, adopting nothing (an empty reading recorded, read undetermined)",
       apply: () => {
         edit(STORE, "    if (!pid && !vname)\n      return { ok: false, reason: \"NO_CLAIM\", target,",
                     "    if (false)\n      return { ok: false, reason: \"NO_CLAIM\", target,");
         edit(STORE, "    if (!v || v.state !== \"accepted\" || !claimText)",
                     "    if (want && (!v || v.state !== \"accepted\" || !claimText))");
         edit(STORE, "    adopted = { version: v.name, claim: claimText, leg_count: Number(v.leg_count) || 0 };",
                     "    adopted = v ? { version: v.name, claim: claimText, leg_count: Number(v.leg_count) || 0 }\n"
                   + "                : { version: \"\", claim: \"\", leg_count: legs.length };");
       } },

  g: { files: [CHECKS],
       label: "(G) C-5.1 BLIND TO THE CONCLUSION RECORD: the append-only check reads `state_history` only, "
            + "so a promote that rewrites a project's `conclusions` is never named",
       apply: () => edit(CHECKS, "  for (const key of ['state_history', 'conclusions']) {",
                                 "  for (const key of ['state_history']) {") },
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
preflight("conclude-project.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
    tally = (/conclude-project: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length });
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
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} named failure(s))`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);

/* REC-136's MEASUREMENT is recorded in the suite's own NEGATIVE CONTROL header
   (the figures below are REC-124's, on REC-124's 43-assertion suite, kept as the
   receipt). */
/* MEASURED 2026-09-18, from this driver's own printed SUMMARY (worktree
   agent-a16f5d75eb9d8097c), every restore sha256 MATCH / content IDENTICAL:
     baseline  conclude-project: 43 pass, 0 fail
     a         conclude-project: 35 pass, 8 fail   as declared (B's own read held: the echoed state was B's)
     b         conclude-project: 40 pass, 3 fail   as declared
     c         conclude-project: 41 pass, 2 fail   as declared
     d         conclude-project: 42 pass, 1 fail   as declared — the over-strictness arm sees a tighter fence
   The declarations are in the suite's own NEGATIVE CONTROL header. */
