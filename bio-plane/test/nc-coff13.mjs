/* COFF-13's NEGATIVE CONTROL HARNESS (IC-207, D-359's named residue — the DECK
 * LENGTH). Declared on the suite it drives, run from `bio-plane/` in one step:
 *
 *     node test/nc-coff13.mjs                # every arm, baseline first
 *     node test/nc-coff13.mjs readablecount  # one arm
 *
 * NOT a `.test.mjs`, deliberately: it EDITS A REAL SOURCE while it runs, so the
 * battery's discovery and `coverage.mjs`'s fleet walk must not find it — the
 * `nc-coff12.mjs` precedent, whose runner loop this file carries VERBATIM (the
 * rules and their receipts are in that file's header and in WORKER.md): one arm
 * at a time with every other defence held OPEN; a BASELINE row; each arm declares
 * BEFORE it runs what MUST fail AND what MUST NOT, and BOTH halves are CHECKED;
 * an arm that did not match exactly once is a FINDING; every restore is verified
 * against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by content, with a
 * byte count printed and a per-file minimum guarded (never `git checkout --`).
 *
 * THE ARMS.
 *  - `readablecount` — THE ROW'S OWN DECLARED ARM, and the liar its accepts-when
 *    names: the pptx entry emits the READABLE slide count as the deck length.
 *  - `wiredrop` — the producer is left correct and the WIRE ignores the length,
 *    which is exactly what the record held before this item; it separates a
 *    producer failure from a consumer one.
 *  - `shortlength` — THE OVER-STRICTNESS DIRECTION: a producer states a length
 *    SHORTER than a slide number it itemised. The wire's floor must hold, so the
 *    MIDDLE-gapped deck (whose readable slide 3 is the highest) keeps all three
 *    slots — a stated length never tightens the record below what it itemised.
 *    It MUST fail only the trailing-deck arms, where the short length is the
 *    whole of the evidence the record has.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* Inside this worktree, in a DOT-directory named for the item (.gitignore). */
const SAFE = join(REPO, ".coff13-control-pristine");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const PPTX = join(PLANE, "src/pptx.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
/* A restore over a stub must fail loudly: index.mjs is ~600 KB, pptx.mjs ~40 KB. */
const MIN_BYTES = { [INDEX]: 400000, [PPTX]: 30000 };

const SUITES = { e2e: "test/capture-container-extent.test.mjs", pptx: "test/formats-pptx.test.mjs" };
/* Captured to a BUFFER, never a pipe the shell owns (D-282); a missing tally is
   -1, never 0 — the suite did not reach its own FOOT. */
function runSuite(key) {
  const r = spawnSync(process.execPath, [SUITES[key]],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return { key, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
}

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* The two sites this item landed, quoted verbatim so an arm that stops matching
   is a LOUD finding rather than a silent no-op. */
const PRODUCER = `  return Array.isArray(parts.order) ? parts.order.length : null;`;
const WIRE = `                    let n = Math.max(units.length, deckLen ?? 0);`;

/* Assertion labels, quoted by prefix. */
const TRAIL = [
  "the entry's deckLength is the slides the DECK declares and EXCEEDS",
  "the RECORD holds a slot for EVERY slide of the deck",
  "(1) a citation of the unreadable LAST slide 3 MINTS",
  "(2) and a SHAPE on it MINTS",
  "(3) a citation PAST the real deck (slide 4) is still REFUSED C-45.1",
];
const OVER = [
  "an OVER-THE-BOUND deck: no slide text was read, and the record still holds the deck's",
  "and a slide past it is REFUSED C-45.1 BY NAME with the deck's figure",
];
/* THE OVER-BOUND ADMISSION HALF, and it is HELD OPEN under `readablecount` and
   `wiredrop` rather than declared to fail. The FIRST RUN (2026-09-23) declared it
   to fail and it did NOT — a finding about the ARM, kept rather than smoothed:
   without a length the over-bound deck records NO slide list, so NOTHING bounds
   it and its last slide mints in both worlds. It proves the length does not
   OVER-refuse; the past-the-deck refusal beside it is what sees the gap. */
const OVER_ADMIT = "its last slide, any shape, MINTS";
const HELD = [
  "the fixture ARMS: the entry omits the unreadable LAST slide",
  "the RECORD keys the shape counts on the SLIDE NUMBER",
  "(1) the LAST declared slide MINTS",
  "(4) a shape on the UNREADABLE slide 2 MINTS",
  "a slide past the deck is REFUSED BY NAME",
];

const ARMS = {
  baseline: {
    files: [], suites: ["e2e", "pptx"],
    why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustNotFail: [], patch: () => ({ armed: true, matches: 0 }),
  },

  readablecount: {
    files: [PPTX], suites: ["e2e", "pptx"],
    why: "THE ROW'S DECLARED ARM: emit the READABLE slide count as the deck length — the liar the "
       + "accepts-when names. The trailing-slide arm must fail BY NAME, and so must the over-bound "
       + "deck (it read no slide, so its readable count is zero)",
    mustFail: [...TRAIL, ...OVER, "over the bound the deck STILL states its length"],
    mustNotFail: [...HELD, OVER_ADMIT],
    patch: () => arm(PPTX, PRODUCER, `  return parts.slideXml.size;`),
  },

  wiredrop: {
    files: [INDEX], suites: ["e2e", "pptx"],
    why: "the producer left CORRECT and the WIRE ignoring the length — what the record held before "
       + "this item. Separates a consumer failure from a producer one: the producer's own "
       + "assertions must stay green",
    mustFail: TRAIL.slice(1).concat(OVER),
    mustNotFail: [...HELD, OVER_ADMIT, "the entry's deckLength is the slides the DECK declares and EXCEEDS",
                  "over the bound the deck STILL states its length"],
    patch: () => arm(INDEX, WIRE, `                    let n = units.length;`),
  },

  shortlength: {
    files: [PPTX], suites: ["e2e", "pptx"],
    why: "THE OVER-STRICTNESS DIRECTION: a stated length SHORTER than a slide the entry itemised "
       + "(1). The wire's floor must hold — the middle-gapped deck keeps all three slots and every "
       + "one of its citations answers as before — so a length can only lengthen the record",
    /* The FIRST RUN declared only the first three and saw all nine: a deck
       whose only evidence of its length IS the stated length (the trailing and
       over-bound decks) is bounded by it wherever the lie falls — correct, and
       the declaration was too narrow. What this arm exists for is the HELD half. */
    mustFail: [...TRAIL, ...OVER, OVER_ADMIT, "over the bound the deck STILL states its length"],
    mustNotFail: [...HELD],
    patch: () => arm(PPTX, PRODUCER, `  return Array.isArray(parts.order) ? 1 : null;`),
  },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) {
  console.error(`no such arm: ${only}. Arms: ${Object.keys(ARMS).join(", ")}`);
  process.exit(2);
}

let notAsDeclared = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY          ${a.why}`);
  console.log(`  MUST FAIL    ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST NOT     ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing — baseline)"}`);

  const saved = [];
  for (const f of a.files) {
    const dest = join(SAFE, `${name}-${f.split("/").pop()}`);   // UNIQUELY NAMED PER ARM
    copyFileSync(f, dest);
    const bytes = statSync(dest).size;
    if (bytes < MIN_BYTES[f]) { console.log(`  ABORT        pristine copy of ${f} is ${bytes} B — below the guarded minimum`); process.exit(3); }
    saved.push({ f, dest, bytes, sha: sha(f) });
    console.log(`  PRISTINE     ${f.replace(REPO + "/", "")}  ${bytes} bytes  sha256 ${sha(f).slice(0, 12)}…`);
  }

  const armed = a.patch();
  console.log(`  ARMED        ${armed.armed ? "yes" : "NO — AN ARM THAT DID NOT ARM IS A FINDING"}  (patch matched ${armed.matches}×)`);

  const results = a.suites.map(runSuite);
  const totalFail = results.reduce((n, r) => n + (r.fail < 0 ? 1 : r.fail), 0);
  const failing = results.flatMap((r) => r.failing);
  for (const r of results) console.log(`  RESULT       ${SUITES[r.key]}  ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of failing) console.log(`               ${l}`);

  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f) === s.sha;
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED     ${s.f.replace(REPO + "/", "")}  byte-identically: ${back && same ? "YES" : "NO"}`
      + `  ${statSync(s.f).size} bytes  sha256 ${sha(s.f).slice(0, 12)}…`);
    if (!(back && same)) { console.log("  ABORT        a restore that is not byte-identical poisons every later arm"); process.exit(4); }
  }

  if (!armed.armed) { console.log("  VERDICT      ARM DID NOT ARM — a finding, not a retry"); notAsDeclared++; continue; }
  if (!a.mustFail.length) {
    const ok = totalFail === 0;
    console.log(`  VERDICT      ${ok ? "AS DECLARED — green" : "NOT AS DECLARED — the baseline is not green"}`);
    if (!ok) notAsDeclared++;
    continue;
  }
  const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
  /* THE HELD-OPEN HALF, CHECKED AND NOT DESCRIBED. An arm that takes the whole
     suite down proves nothing about its own subject. */
  const broke = a.mustNotFail.filter((m) => failing.some((l) => l.includes(m)));
  const ok = totalFail > 0 && hit.length === a.mustFail.length && broke.length === 0;
  console.log(`  VERDICT      ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, `
    + `${broke.length}/${a.mustNotFail.length} held-open assertion(s) ALSO broken, ${totalFail} total failing`);
  if (!ok) {
    for (const m of a.mustFail) if (!failing.some((l) => l.includes(m))) console.log(`               DECLARED BUT NOT SEEN: ${m}`);
    for (const m of broke) console.log(`               HELD OPEN BUT BROKEN: ${m}`);
    notAsDeclared++;
  }
}

console.log(notAsDeclared
  ? `\n${notAsDeclared} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`
  : "\nevery arm AS DECLARED");
process.exit(0);
