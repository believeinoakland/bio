#!/usr/bin/env node
/* nc-m039 — THE NEGATIVE CONTROLS FOR M0-39's TWO ARMS.  2026-09-15.
 *
 *   node tools/nc-m039.mjs            every arm; exit 1 if any came back NOT AS DECLARED
 *   node tools/nc-m039.mjs --quiet    the verdict table only
 *
 * WHAT IS DECLARED BEFORE ANYTHING IS ARMED, because an arm whose expectation is written
 * after its result is not a control.  Each row below states what MUST fail and what MUST
 * NOT, and the runner compares the ACTUAL against the DECLARED and prints both.  An arm
 * that comes back wrong is a finding about the ARM and is printed, never smoothed.
 *
 * ---------------------------------------------------------------- the cheap defeat
 *
 * NAMED FIRST BECAUSE IT IS THE ONE THESE ARMS INVITE.  An attribution arm satisfied by a
 * corpus-wide rewrite of ONE PHRASE has verified NOTHING — it can be satisfied by making
 * every attribution uniformly WRONG.  So arm 2's acceptance is not "it fails on a bad
 * sentence".  It is:
 *
 *     PASS  over a corpus where BOTH forms are correctly used, and
 *     FAIL  over the same corpus with the two forms SWAPPED, and
 *     FAIL  over the same corpus rewritten UNIFORMLY to one form,
 *
 * which no phrase list can do, because the verdict comes from RESOLVING the citation
 * rather than from recognising the words.  Arms 2c, 2d and 2e are exactly those three.
 *
 * ------------------------------------------------- why the specimens are built, not typed
 *
 * EVERY DEFECTIVE SPECIMEN IN THIS FILE IS ASSEMBLED FROM PIECES AND NEVER SPELLED.  This
 * file is a `.mjs` under `tools/`, which is INSIDE arm 2's own corpus, so a specimen typed
 * here would be read by the arm it is testing and would fail the gate it is proving.  That
 * is the sweep-arm-that-cites-itself class, which this project has paid for three times in
 * two days (`mintid.mjs`'s own debt row poisoning its own floor; the C-29 catalogue
 * comment; `decided.mjs`'s KNOWN_COLLISIONS naming a retired check).  `plancheck.mjs`
 * builds its merge markers the same way and for the same reason.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const QUIET = process.argv.includes("--quiet");
const rows = [];
const say = (...a) => { if (!QUIET) console.log(...a); };

function arm(n, what, declared, actual, ok) {
  rows.push({ n, what, declared, actual, ok });
  say(`\nARM ${n} — ${what}`);
  say(`   DECLARED  ${declared}`);
  say(`   ACTUAL    ${actual}`);
  say(`   ${ok ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
}

/* ------------------------------------------------------------------ the specimens
 *
 * Assembled from pieces.  `B` is the architect's name, `TICK` a backtick.  Nothing below
 * ever concatenates to a live-corpus sentence by accident: each specimen carries its own
 * fixture-only subject so that a reader grepping for it finds this file and nothing else. */
const B = String.fromCharCode(66, 111, 98);          /* the architect */
const TICK = String.fromCharCode(96);
const SESSION_SHA = "9954a9c";                        /* a real BOB-session commit */
const ARCH_DEC = "DEC-72";                            /* a real `for: bob` register entry */
const sha = (s) => TICK + s + TICK;

/* The two CORRECT forms, in the corpus's own grammar. */
const CORRECT_SESSION_TO_COMMIT = `BOB #11's own correction (${sha(SESSION_SHA)}) is mechanism.`;
const CORRECT_ARCHITECT_TO_RULING = `${B} ruled ${ARCH_DEC} and it is doctrine.`;
/* The two SWAPPED forms — the same citations, the attributions exchanged. */
const SWAPPED_ARCHITECT_TO_COMMIT = `${B}'s ${sha(SESSION_SHA)} is mechanism.`;
const SWAPPED_SESSION_TO_RULING = `CONDUCT #11 ruled ${ARCH_DEC} and it is doctrine.`;
/* UNIFORM: every attribution rewritten to the SESSION form, which is what a corpus-wide
   phrase rewrite produces and what a phrase list would score clean. */
const UNIFORM_SESSION_TO_COMMIT = CORRECT_SESSION_TO_COMMIT;
const UNIFORM_SESSION_TO_RULING = SWAPPED_SESSION_TO_RULING;

/* The over-strictness specimens: correct work in spellings the arm must NOT touch. */
const OVERSTRICT = [
  `Complete as a study at ${TICK}origin/main${TICK} ${sha("51d128a")}; §5 brings the doctrine items to ${B}.`,
  `${B}'s 2026-09-14 rule is landed at ${sha("8e7e247")}; the standard's §4.7 is the specification.`,
  `VF-2's ${"DEC-49"} guard is what asked for it.`,
  `Relation: ${"DEC-49"}, REC-64, D-262.`,
  `${"DEC-20"}, ${B}, 2026-08-02; vocabulary corrected 2026-08-05.`,
  /* THE MODEL THE ROW'S NEGATIVE CONTROL NAMES BY NAME: the framework's own correct
     architect attribution, `RULED by ${B}, 2026-07-30` — a DATE and a place, no sha and
     no register id. It carries no citation this arm can RESOLVE, so it must not be
     graded at all, and the arm must certainly not fail it. This is the specimen that
     decides whether the row was worth having: a banned-phrase arm fails it, and failing
     it would be enforcing a house style over the commonest correct form in the corpus. */
  `RULED by ${B}, 2026-07-30: the deletion ledger is a first-class construct.`,
  `RULED by ${B}: legs relate by AND or OR; the weakest leg governs across AND.`,
  /* FOUND BY `--census` OVER THE EXCLUDED PATHS, and it is a defect of the ARM rather than
     of the sentence: a session CORRECTING A REGISTER ROW is not a session claiming the
     decision.  Live in the archive as `FL-3 corrected ${"DEC-65"}'s entry`. */
  `FL-3 corrected ${"DEC-65"}'s entry, but PL-3's guard still cited the old check.`,
  `${B} ruled ${ARCH_DEC}'s scope narrower than the row assumed.`,
];

/* ================================================================== ARM 2, in memory
 *
 * Driven through the PREDICATE with an injected reader and an injected `git`, so the
 * fixture is a corpus of exactly the sentences declared above and nothing else — a
 * headline assertion that passed over an EMPTY corpus has happened three times in this
 * project, so the fixture is PRINTED and FLOORED. */

const { attributionAudit } = await import("./attribution.mjs");

/* The injected resolver answers for the two real citations this fixture uses, in the same
   shape `git log -1 --format=%an%n%ae%n%s%n%b` answers — so the fixture drives the real
   classifier rather than a stub of it. */
const FAKE_GIT = (args) => {
  const want = args[args.length - 1];
  if (want === SESSION_SHA)
    return `Bob Krause\nneobobkrause@gmail.com\nbob: the observation log had the defect it was written to prevent\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\n`;
  if (want === "51d128a" || want === "8e7e247")
    return `Bob Krause\nneobobkrause@gmail.com\ncorpus: a row names the design it builds from\n\nCo-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>\n`;
  throw new Error("unknown revision");
};
const REGISTER = new Map([[ARCH_DEC, { actor: "architect", why: "the register's `for:` line says bob" }],
                          ["DEC-49", { actor: "architect", why: "the register's `for:` line says bob" }],
                          ["DEC-20", { actor: "architect", why: "the register's `for:` line says bob" }]]);

function overFixture(lines, { decisions = REGISTER, run = FAKE_GIT } = {}) {
  const body = lines.join("\n") + "\n";
  return attributionAudit({ files: ["fixture.md"], read: () => body, run, decisions });
}

/* 2a — THE FIXTURE IS NON-EMPTY AND THE ARM READS IT.  Before any verdict is believed. */
{
  const a = overFixture([CORRECT_SESSION_TO_COMMIT, CORRECT_ARCHITECT_TO_RULING, ...OVERSTRICT]);
  say(`\nFIXTURE, printed and floored — ${2 + OVERSTRICT.length} sentence(s), `
    + `${a.graded.length} binding(s) read:`);
  for (const g of a.graded) say(`   ${g.claimed} -> ${g.cited} resolves ${g.resolved}  ${JSON.stringify(g.text)}`);
  arm("2a", "the fixture is non-empty and the arm actually reads it (a headline that passed over an empty corpus has happened three times here)",
      "at least 3 bindings read", `${a.graded.length} binding(s) read`, a.graded.length >= 3);
}

/* 2b — BOTH FORMS CORRECTLY USED: PASS.  This is the half a phrase list cannot do. */
{
  const a = overFixture([CORRECT_SESSION_TO_COMMIT, CORRECT_ARCHITECT_TO_RULING]);
  arm("2b", "a corpus using BOTH forms CORRECTLY passes",
      "0 finding(s), 0 undetermined, and BOTH forms present among the bindings",
      `${a.findings.length} finding(s), ${a.undetermined.length} undetermined, claimed classes {${[...new Set(a.graded.map((g) => g.claimed))].sort().join(",")}}`,
      a.findings.length === 0 && a.undetermined.length === 0
      && new Set(a.graded.map((g) => g.claimed)).size === 2);
}

/* 2c — THE SWAP: the same two citations, the attributions exchanged.  BOTH must fire, or
   the arm is enforcing a house style in one direction rather than verifying a pairing. */
{
  const a = overFixture([SWAPPED_ARCHITECT_TO_COMMIT, SWAPPED_SESSION_TO_RULING]);
  const dirs = new Set(a.findings.map((f) => f.claimed));
  arm("2c", "the SWAPPED corpus fails, and fails in BOTH directions",
      "2 finding(s): one claiming architect over a session commit, one claiming session over the architect's decision",
      `${a.findings.length} finding(s), directions {${[...dirs].sort().join(",")}}`,
      a.findings.length === 2 && dirs.has("architect") && dirs.has("session"));
}

/* 2d — THE CHEAP DEFEAT, DRIVEN.  Every attribution rewritten to ONE form, which is what a
   corpus-wide phrase rewrite produces.  A phrase list scores this clean; resolution does
   not, because the ruling citation still resolves to the architect. */
{
  const a = overFixture([UNIFORM_SESSION_TO_COMMIT, UNIFORM_SESSION_TO_RULING]);
  arm("2d", "a corpus made UNIFORMLY one form — the cheap defeat — still fails",
      "at least 1 finding: the ruling citation resolves to the architect however the sentence is worded",
      `${a.findings.length} finding(s)`, a.findings.length >= 1);
}

/* 2e — OVER-STRICTNESS.  Correct work in five spellings the arm did not have to anticipate:
   two tree POINTERS, a landing note that attributes the rule to the architect and the
   LANDING to whoever committed it, a possessive over a decision id that means "the work
   for it", and a comma list of ids.  Every one must PASS. */
{
  const a = overFixture(OVERSTRICT);
  arm("2e", `OVER-STRICTNESS: ${OVERSTRICT.length} correct spellings — two tree pointers, a landing note, a possessive over a register id, a comma list, and the framework's own model architect attribution — must PASS`,
      `0 finding(s) over all ${OVERSTRICT.length}`,
      `${a.findings.length} finding(s)${a.findings.length ? ": " + a.findings.map((f) => JSON.stringify(f.text)).join(", ") : ""}`,
      a.findings.length === 0);
}

/* 2f — THE ARM NEUTERED.  Resolution stubbed to agree with whatever the sentence claims.
   The SWAPPED corpus must then read CLEAN — which is what proves the verdict comes from
   resolving the citation and not from the words. */
{
  const agreeable = new Map([[ARCH_DEC, { actor: "session", why: "NEUTERED: resolution stubbed to agree" }]]);
  const neuteredGit = () => `x\nx\nx\n`;   /* no session marker: classifies undetermined */
  const a = overFixture([SWAPPED_ARCHITECT_TO_COMMIT, SWAPPED_SESSION_TO_RULING],
                        { decisions: agreeable, run: neuteredGit });
  arm("2f", "with RESOLUTION neutered, the SWAPPED corpus reads clean — so the verdict is the resolution's, not the phrase's",
      "0 finding(s) over the same corpus arm 2c failed on",
      `${a.findings.length} finding(s), ${a.undetermined.length} undetermined`, a.findings.length === 0);
}

/* ============================================================ ARM 1, in memory and on disk */

const { allocations, NAMESPACES } = await import("./mintid.mjs");

/* A scratch tree holding only what `allocations("M")` reads, so the plant is a plant and
   not an edit to a file another item holds. */
const SCRATCH = join(REPO, ".m039-nc");
function scratchWith(measurements) {
  rmSync(SCRATCH, { recursive: true, force: true });
  mkdirSync(join(SCRATCH, "docs/development"), { recursive: true });
  writeFileSync(join(SCRATCH, "docs/development/MEASUREMENTS.md"), measurements);
  writeFileSync(join(SCRATCH, "docs/development/QUEUE.md"), "### M-4 · done\n");
  return SCRATCH;
}
const ENTRY = (n, rest) => `## M-${n} · 2026-09-15 · ${rest}\n\nbody\n\n`;

/* 1a — THE HISTORICAL COLLISION, RE-PLANTED.  All four of 2026-09-15's filings take `M-21`
   again.  The arm must name `M-21`, and it must do so by READING THE FILE rather than from
   any list of known cases — `KNOWN_COLLISIONS` contains no M entry, which is checked. */
{
  const repo = scratchWith(ENTRY(21, "M0-34") + ENTRY(21, "COFF-11") + ENTRY(21, "REC-90") + ENTRY(21, "FW-18") + ENTRY(20, "M0-31"));
  const a = allocations("M", { repo });
  const known = (await import("./mintid.mjs")).KNOWN_COLLISIONS.some((k) => k.id.startsWith("M-"));
  arm("1a", "the four 2026-09-15 filings of one id, re-planted, are named by the detector",
      "covered:true, duplicates name M-21 at 4 sites, and no M entry exists in KNOWN_COLLISIONS",
      `covered:${a.covered}, duplicates=[${a.duplicates.map((d) => `${d.id}x${d.at.length}`).join(" ")}], KNOWN_COLLISIONS has an M entry: ${known}`,
      a.covered === true && a.duplicates.length === 1 && a.duplicates[0].id === "M-21"
      && a.duplicates[0].at.length === 4 && known === false);
}

/* 1b — THE ARM NEUTERED.  `M`'s allocation site removed, the same planted corpus.  It must
   go back to NOT COVERED and report NO duplicate — which is precisely the state the four
   real collisions were filed in, and is the proof that the SITE is what does the work. */
{
  const repo = scratchWith(ENTRY(21, "M0-34") + ENTRY(21, "COFF-11") + ENTRY(21, "REC-90") + ENTRY(21, "FW-18"));
  const keep = NAMESPACES.M.allocPattern;
  delete NAMESPACES.M.allocPattern;
  const a = allocations("M", { repo });
  NAMESPACES.M.allocPattern = keep;
  const back = allocations("M", { repo });
  arm("1b", "with M's SITE removed, the same four collisions vanish from the detector — the state they were actually filed in",
      "neutered: covered:false with 0 duplicates; restored: covered:true with M-21 back",
      `neutered: covered:${a.covered}, ${a.duplicates.length} duplicate(s); restored: covered:${back.covered}, ${back.duplicates.length} duplicate(s)`,
      a.covered === false && a.duplicates.length === 0 && back.covered === true && back.duplicates.length === 1);
}

/* 1c — OVER-STRICTNESS.  An id legitimately re-used in a way that is NOT a second
   allocation must pass: a queue-shaped `###` heading, a sub-heading quoting the id, and
   prose naming it twice in one sentence.  Only the ENTRY heading is an allocation. */
{
  const repo = scratchWith(ENTRY(21, "M0-34")
    + `### M-21 · a sub-section of the entry above\n`
    + `### M-21's figures HELD, every one of them\n`
    + `M-21 re-ran M-21's own probe and M-21 held.\n`
    + `| M-21 | a reference table row |\n`);
  const a = allocations("M", { repo });
  arm("1c", "OVER-STRICTNESS: a sub-heading, a possessive heading, prose naming the id three times and a table row are NOT allocations",
      "covered:true, exactly 1 site, 0 duplicates",
      `covered:${a.covered}, ${a.sites.length} site(s), ${a.duplicates.length} duplicate(s)`,
      a.covered === true && a.sites.length === 1 && a.duplicates.length === 0);
}

/* 1d — THE LEGACY HEADING IS OUTSIDE THE REACH, AND IT IS NAMED RATHER THAN SCORED CLEAN.
   `## 2026-08-08 · M-4 —` is the one entry written before the convention settled. A second
   one in that shape would NOT be caught. Asserted so the claim in `mintid.mjs`'s comment is
   a measurement rather than a sentence — a thing the matcher cannot see must be DRIVEN. */
{
  const repo = scratchWith(`## 2026-08-08 · M-4 — the first shape\n\nbody\n\n## 2026-08-08 · M-4 — a second one\n\nbody\n`);
  const a = allocations("M", { repo });
  arm("1d", "the LEGACY date-first heading is invisible to the site — stated in the comment, DRIVEN here",
      "0 site(s) and 0 duplicates even with the same id twice: the reach claim is true",
      `${a.sites.length} site(s), ${a.duplicates.length} duplicate(s)`,
      a.sites.length === 0 && a.duplicates.length === 0);
}

/* 1g — THE BYPASS IS VISIBLE TO `--audit`, WHICH IS THE THING THE SITE WAS DECLARED FOR.
 *
 * Driven through the CLI against a FIXTURE LEDGER rather than the live one, because the
 * live ledger is shared by every worktree of this clone and another worker minting `M`
 * while this runs would move the answer — an arm whose subject changes underneath it is
 * measuring the machine rather than the code.  The fixture holds every `M` the corpus
 * allocates EXCEPT four, so those four must be named as bypasses and no others. */
{
  const LEDGER = join(REPO, ".m039-nc-ledger");
  const present = [8, 11, 12, 13, 14, 18, 20, 21];
  const absent = [9, 22, 23, 24];
  rmSync(LEDGER, { recursive: true, force: true });
  mkdirSync(join(LEDGER, "M"), { recursive: true });
  for (const n of present) writeFileSync(join(LEDGER, "M", String(n)), "{}\n");
  writeFileSync(join(LEDGER, "M", ".watermark"), JSON.stringify({ ns: "M", floor: 5, at: "2026-09-15" }) + "\n");
  const section = (out) => out.slice(out.indexOf("2b. ALLOCATED WITHOUT THE ALLOCATOR"), out.indexOf("\n3. IDS INTRODUCED"));
  const audit = (tool) => execFileSync(process.execPath, [tool, "--audit"],
    { cwd: REPO, encoding: "utf8", env: { ...process.env, BIO_IDALLOC_DIR: LEDGER } });

  const sec = section(audit(join(REPO, "tools/mintid.mjs")));
  const named = absent.every((n) => sec.includes(`M-${n} `));
  const noFalse = !present.some((n) => sec.includes(`M-${n} `));
  arm("1g", "the BYPASS — an id at a site the ledger never issued — is named PER ID by `--audit`, which is what declaring the site was FOR",
      `section 2b names M-${absent.join(", M-")} and none of the ${present.length} ids the fixture ledger holds`,
      `names all four: ${named}; names none of the held: ${noFalse}`, named && noFalse);

  /* The same corpus and the same ledger with M's SITE STRUCK — the state the four were
     actually taken in. The patch is checked for having MATCHED before its result is read:
     an arm that never armed is a finding, and this project has met three of them. */
  {
    const src = readFileSync(join(REPO, "tools/mintid.mjs"), "utf8");
    const NEEDLE = "allocPattern: () => /^##\\s+M-(\\d+)\\s+·/gm, allocIsUnique: true";
    const armed = src.includes(NEEDLE);
    const alt = join(REPO, "tools", ".mintid-nc-m039.mjs");
    let sec2 = "";
    try {
      writeFileSync(alt, src.replace(NEEDLE, "/* SITE STRUCK BY nc-m039 ARM 1h */"));
      sec2 = section(audit(alt));
    } finally { rmSync(alt, { force: true }); }
    arm("1h", "with M's SITE struck, the SAME four bypasses become invisible to `--audit` — the state they were taken in",
        "the neutering patch MATCHED (an arm that never armed is a finding), and section 2b then names no M- id",
        `patch armed: ${armed}; section 2b still names an M- id: ${/M-\d+ /.test(sec2)}`,
        armed && !/M-\d+ /.test(sec2));
  }
  rmSync(LEDGER, { recursive: true, force: true });
}

rmSync(SCRATCH, { recursive: true, force: true });

/* =========================================== ON DISK, THROUGH THE GATE THE READER RUNS
 *
 * The arms above drive the PREDICATES.  This one drives `plancheck` itself over a real
 * checkout, because the acceptance is that a planted duplicate FAILS `plancheck` BY NAME —
 * and a predicate proved in memory is a mechanism believed on the strength of its existence
 * until the loop the reader actually runs is driven.
 *
 * THE RESTORE IS MEASURED, NOT ASSUMED: sha256 AND `cmp` against a uniquely-named per-arm
 * pristine copy, with the byte count printed and floored.  `git checkout --` is NOT used —
 * it restores to HEAD, which in a tree with uncommitted work throws your own work away and
 * exits 0 either way (measured twice in two days, both DIST). */
{
  const WT = join(REPO, ".m039-nc-wt");
  const git = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  rmSync(WT, { recursive: true, force: true });
  try { git(["worktree", "remove", "--force", WT]); } catch { /* not present */ }
  let ok1 = false, ok2 = false, restored = "not attempted", plancheckRan = false;
  try {
    git(["worktree", "add", "--detach", WT, "HEAD"]);
    /* the worktree is a checkout of HEAD; this item's uncommitted edits are carried in by
       hand so the arm runs against what is actually being shipped.  `docs/DECIDED.md` was
       carried too until M0-99 (2026-09-22): `plancheck` then failed on an index the carried
       prose had staled.  The index is no longer committed and `plancheck` no longer reads its
       staleness, so there is nothing to carry — the scratch checkout ignores it like any other.
       `tools/decided.mjs` IS carried now, for the rule this list exists for: `plancheck` (arm 2b)
       and `attribution.mjs` (`--census`) import it, so a carried importer beside a stale copy of
       what it imports would measure a tree that is shipped nowhere. */
    /* M0-110: `coord.mjs` and `ledger.mjs` join the list for the same rule — every importer above reads the state
       through `coord.mjs`, and `mintid.mjs` imports `ledger.mjs`. */
    for (const f of ["tools/mintid.mjs", "tools/attribution.mjs", "tools/plancheck.mjs", "tools/decided.mjs",
                     "tools/coord.mjs", "tools/ledger.mjs",
                     "docs/development/QUEUE.md", "docs/development/INTERFACE-CHANGES.md"])
      if (existsSync(join(REPO, f))) cpSync(join(REPO, f), join(WT, f));

    const target = join(WT, "docs/development/MEASUREMENTS.md");
    const pristine = join(WT, "MEASUREMENTS.m039-arm-ondisk.pristine");
    cpSync(target, pristine);
    const before = readFileSync(pristine);
    const digest = (b) => createHash("sha256").update(b).digest("hex");
    say(`\nON-DISK ARM — subject ${target}`);
    say(`   pristine ${before.length} byte(s), sha256 ${digest(before)}`);
    if (before.length < 100000) throw new Error(`the pristine copy is implausibly small (${before.length} bytes) — refusing to believe a restore of it`);

    const run = () => {
      try { execFileSync(process.execPath, [join(WT, "tools/plancheck.mjs"), "--local"], { cwd: WT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); return { code: 0, out: "" }; }
      catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
    };
    const clean = run();
    plancheckRan = true;

    /* PLANT: a second entry heading for an id the file already allocates. Built, not typed. */
    const dupId = 20;
    writeFileSync(target, before.toString() + `\n## M-${dupId} ` + String.fromCharCode(0xb7)
      + ` 2026-09-15 · a planted second allocation of an id this file already carries (M0-39 control arm)\n\nbody\n`);
    const planted = run();
    ok1 = clean.code === 0 && planted.code === 1 && planted.out.includes(`M-${dupId}`) && planted.out.includes("DUPLICATE ID");

    /* RESTORE and MEASURE it. */
    cpSync(pristine, target);
    const after = readFileSync(target);
    let cmpOk = false;
    try { execFileSync("cmp", ["-s", pristine, target]); cmpOk = true; } catch { cmpOk = false; }
    restored = `${after.length} byte(s), sha256 ${digest(after)}, cmp ${cmpOk ? "identical" : "DIFFERENT"}`;
    ok2 = cmpOk && digest(after) === digest(before) && after.length === before.length;

    arm("1e", "ON DISK, THROUGH plancheck: a planted duplicate M- entry heading FAILS BY NAME",
        `clean tree exit 0; planted tree exit 1 naming M-${dupId} and DUPLICATE ID`,
        `clean exit ${clean.code}; planted exit ${planted.code}; names M-${dupId}: ${planted.out.includes(`M-${dupId}`)}; names DUPLICATE ID: ${planted.out.includes("DUPLICATE ID")}`,
        ok1);
    arm("1f", "the on-disk subject is restored, MEASURED rather than assumed",
        `sha256 ${digest(before)}, ${before.length} byte(s), cmp identical`,
        restored, ok2);

    /* ARM 2 ON DISK, THROUGH THE SAME GATE. A swapped attribution planted in a real file. */
    const t2 = join(WT, "docs/development/DEBT.md");
    const p2 = join(WT, "DEBT.m039-arm2-ondisk.pristine");
    cpSync(t2, p2);
    const b2 = readFileSync(p2);
    if (b2.length < 10000) throw new Error(`arm 2's pristine copy is implausibly small (${b2.length} bytes)`);
    writeFileSync(t2, b2.toString() + `\n\n` + SWAPPED_ARCHITECT_TO_COMMIT + ` ` + SWAPPED_SESSION_TO_RULING + `\n`);
    const p2run = run();
    cpSync(p2, t2);
    const a2 = readFileSync(t2);
    let cmp2 = false;
    try { execFileSync("cmp", ["-s", p2, t2]); cmp2 = true; } catch { cmp2 = false; }
    arm("2g", "ON DISK, THROUGH plancheck: a SWAPPED pair of attributions FAILS BY NAME, both directions",
        `exit 1, naming ATTRIBUTION DOES NOT RESOLVE, ${SESSION_SHA} and ${ARCH_DEC}`,
        `exit ${p2run.code}; names the failure: ${p2run.out.includes("ATTRIBUTION DOES NOT RESOLVE")}; names ${SESSION_SHA}: ${p2run.out.includes(SESSION_SHA)}; names ${ARCH_DEC}: ${p2run.out.includes(ARCH_DEC)}`,
        p2run.code === 1 && p2run.out.includes("ATTRIBUTION DOES NOT RESOLVE")
        && p2run.out.includes(SESSION_SHA) && p2run.out.includes(ARCH_DEC));
    arm("2h", "arm 2's on-disk subject is restored, MEASURED rather than assumed",
        `sha256 ${digest(b2)}, ${b2.length} byte(s), cmp identical`,
        `${a2.length} byte(s), sha256 ${digest(a2)}, cmp ${cmp2 ? "identical" : "DIFFERENT"}`,
        cmp2 && digest(a2) === digest(b2));
  } catch (e) {
    arm("1e/2g", "ON DISK, THROUGH plancheck",
        "the worktree is created, the plants are driven and the subjects restored",
        `THREW: ${e.message}${plancheckRan ? "" : " (plancheck never ran)"}`, false);
  } finally {
    try { git(["worktree", "remove", "--force", WT]); } catch { /* reported by the arm above */ }
    rmSync(WT, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------------ the verdict */

const bad = rows.filter((r) => !r.ok);
console.log(`\nnc-m039: ${rows.length} arm(s), ${rows.length - bad.length} AS DECLARED, ${bad.length} NOT AS DECLARED`);
for (const r of rows) console.log(`  ${r.ok ? "ok  " : "FAIL"} ${String(r.n).padEnd(6)} ${r.what}`);
if (bad.length) console.log(`\nAn arm that came back wrong is a finding about the ARM. Record it; do not smooth it.`);
process.exit(bad.length ? 1 : 0);
