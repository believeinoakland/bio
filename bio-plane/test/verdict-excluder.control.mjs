/* D-240 · THE NEGATIVE CONTROLS FOR THE TWO INVERTED CLASSIFIERS
 * (and, since D-254, for the ONE-HOME pin that replaced D-240's drift pin).
 * ============================================================================
 * DELIBERATELY NOT A `.test.mjs`: it MUTATES `src/index.mjs`, `src/store.mjs`,
 * `test/meaning-bounds.test.mjs`, `test/plane-envelope.test.mjs`,
 * `test/verdict-reader.mjs` and `civicos-ui/check-refusal-codes.mjs` while it
 * runs, so the battery must not discover it.
 * Every arm is armed ALONE with every other held open, and every file is
 * restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND
 * by CONTENT (`cmp`-equivalent byte comparison), with the byte count printed and
 * floored — a restore over an empty file agrees for free (`e3b0c442…`).
 *
 * THE BASELINE ROW IS RUN FIRST AND IS NOT DECORATION: a harness whose first run
 * reported `null` for every arm INCLUDING the baseline is on this project's
 * record, and only the baseline row distinguished six-arms-broken from
 * six-arms-working.
 *
 * EVERY ARM READS THE SUITE'S OWN FOOT LINE, never a tally: a `TypeError` inside
 * an assertion ends the module through no assertion at all while the count reads
 * clean, so a run with no foot is reported as `-1` and never as `0`.
 *
 * THE ARMS, and what each MUST do — declared BEFORE arming (D-240's ten; D-254
 * re-aimed (3) and added (3m), (3c) and (3d)):
 *   (0) BASELINE -> meaning-bounds GREEN, plane-envelope GREEN.
 *   (1) restore meaning-bounds' one-literal EXCLUDER -> meaning-bounds RED on
 *       D-240 (b) and (e); plane-envelope UNTOUCHED and GREEN; and THE RATCHETS
 *       STAY GREEN, which is the finding: a ceiling cannot catch a reader that
 *       is too generous.
 *   (2) restore plane-envelope's one-literal GATE -> plane-envelope RED on
 *       D-240 (b) and (c); DETECTOR A ITSELF STAYS GREEN at 0 violations, which
 *       is the whole defect: the gate decides what the detector may see.
 *   (3) RE-AIMED BY D-254, AND IT IS STILL D-240's ARM: ONE CHARACTER of drift
 *       inside `verdictKind`, in a SECOND copy. Until D-254 the second copy was
 *       the guard's own and this arm drifted `verdict-reader.mjs` against it.
 *       D-254 deleted that copy — the guard IMPORTS the reader — so "one
 *       character of drift" needs a second copy to drift FROM, and the one place
 *       a copy can grow back is the guard (a stale merge, a revert, a local
 *       "fix"). So the arm RE-GROWS it there: `verdictKind` dropped from the
 *       guard's import and a copy with the arm's one-character change declared
 *       in its place -> BOTH suites RED on D-240 (a) and on nothing else, the
 *       READER line naming `verdictKind` NOT SINGLE-HOMED; and THE GUARD STILL
 *       EXITS 0, because that copy is dead code today — which is exactly why
 *       only a structural pin can see it.
 *   (3m) THE STALE-MERGE SHAPE (D-254) — all EIGHT declarations re-grown in the
 *       guard BESIDE its full import, which is what merging a pre-D-254 branch
 *       would produce -> the GUARD FAILS TO LOAD (a duplicate declaration, exit
 *       1), and BOTH suites RED on D-240 (a) naming all eight.
 *   (3b) OVER-STRICTNESS ON THE PIN — edit a COMMENT in `verdict-reader.mjs`
 *       OUTSIDE the shared functions -> BOTH suites GREEN. A pin that fires on
 *       any edit to the file is not a pin on the reader.
 *   (3c) THE OLD ARM-(3) EDIT, APPLIED TO THE ONE HOME (D-254) — the same one
 *       character inside `verdictKind`, in `verdict-reader.mjs` itself. That is
 *       no longer drift (there is no twin to drift from); it is a change to what
 *       the reader all three instruments read ANSWERS, which the old pin passed
 *       by design whenever both copies moved together (REC-79). -> BOTH suites
 *       RED on D-240 (a), the READER line naming `verdictKind` MISREAD (a
 *       READING, not the home, catches it); plane-envelope ALSO RED on D-240 (d),
 *       its own behavioural fixture `{ ok: Boolean(r.result), n }`; NOTHING ELSE
 *       in meaning-bounds; and the GUARD exits 0 with output BYTE-IDENTICAL to the
 *       unarmed run, because no governed site spells a `Boolean(…)` verdict.
 *   (3d) OVER-STRICTNESS ON THE IMPORT PIN (D-254) — the guard's import RE-SPELLED
 *       in ways nobody wrote: names reversed and one per line, a trailing comma,
 *       single quotes, and one `as` alias -> BOTH suites GREEN and the guard
 *       exits 0. An import pin that only accepts its author's spelling is one
 *       the next tidy-up switches off.
 *   (4) PLANT THE REAL DEFECT — remove the `promoted.answered` guard in
 *       `src/index.mjs` -> plane-envelope RED, DETECTOR A naming `promoted`.
 *       PAIRED with (4b), the same plant under the OLD gate -> GREEN. That pair
 *       is the receipt: the same real defect that the new gate catches is
 *       INVISIBLE to the one this item replaced.
 *   (5) PLANT A REFUSAL-SHAPED READ in `src/store.mjs` — a dispatched op whose
 *       refusal is spelled `found: false` and carries a collection off an
 *       unbounded scan -> meaning-bounds GREEN (the refusal is excluded).
 *       PAIRED with (5b), the same plant under the OLD excluder -> RED, the
 *       BARE ratchet failing ONE PAST the baseline's printed BARE figure over a
 *       NON-DEFECT (39 of 38 at D-240; 41 of 40 at D-254, read from the baseline
 *       run since D-254 rather than typed). That pair is the
 *       receipt for instrument (1): the widening removes a false positive that
 *       would make REC-70's ceiling unholdable.
 *   (6) OVER-STRICTNESS ON THE TREE — plant a correctly-bounded read whose
 *       truncation flag is a COMPARISON in a spelling nothing in this plane
 *       writes (`overflowed: rows.length > cap`) -> meaning-bounds GREEN and the
 *       op on the BOUNDED roster, NOT excluded and NOT vanished. This is the arm
 *       that refused this edit's first draft, kept as a standing control.
 * ------------------------------------------------------------------------ */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
/* Loaded ONCE, before any arm mutates the file: the harness reads the pristine
   reader's own extractor and list, never a mutated one. */
import { fnSource, SHARED_FNS } from "./verdict-reader.mjs";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const P = {
  mb: HERE + "meaning-bounds.test.mjs",
  pe: HERE + "plane-envelope.test.mjs",
  reader: HERE + "verdict-reader.mjs",
  index: ROOT + "src/index.mjs",
  store: ROOT + "src/store.mjs",
  guard: REPO + "civicos-ui/check-refusal-codes.mjs",
};
const MIN_BYTES = { mb: 40000, pe: 30000, reader: 20000, index: 150000, store: 500000, guard: 150000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* A pristine copy per ARM, uniquely named, plus the digest and the byte count
   taken BEFORE the mutation. `restore` refuses a copy that is missing, short, or
   whose digest does not match what was recorded. */
function snapshot(arm, keys) {
  const s = {};
  for (const k of keys) {
    const copy = `${P[k]}.pristine.${arm}`;
    copyFileSync(P[k], copy);
    const bytes = readFileSync(P[k]).length;
    if (bytes < MIN_BYTES[k]) throw new Error(`ARM ${arm}: ${k} is ${bytes} bytes, under its floor ${MIN_BYTES[k]}`);
    s[k] = { copy, digest: sha(P[k]), bytes };
  }
  return s;
}
function restore(arm, s) {
  for (const [k, v] of Object.entries(s)) {
    if (!existsSync(v.copy)) throw new Error(`ARM ${arm}: pristine copy for ${k} is GONE`);
    const pristine = readFileSync(v.copy);
    if (pristine.length !== v.bytes) throw new Error(`ARM ${arm}: pristine ${k} is ${pristine.length} bytes, recorded ${v.bytes}`);
    writeFileSync(P[k], pristine);
    const after = sha(P[k]);
    const same = Buffer.compare(readFileSync(P[k]), pristine) === 0;   /* CONTENT, not only digest */
    if (after !== v.digest || !same)
      throw new Error(`ARM ${arm}: RESTORE FAILED for ${k} (sha ${after} vs ${v.digest}, content ${same})`);
    console.log(`      restored ${k}: ${v.bytes} bytes, sha256 ${after.slice(0, 16)}…, content identical`);
    unlinkSync(v.copy);
  }
}
/* An anchor must occur EXACTLY ONCE, or the arm never armed / armed twice. */
function patch(key, from, to) {
  const src = readFileSync(P[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`anchor in ${key} occurs ${n} times, expected exactly 1`);
  const out = src.replace(from, to);
  if (out === src) throw new Error(`patch to ${key} changed nothing`);
  writeFileSync(P[key], out);
}
/* THE FOOT LINE, never the tally. `-1` means the suite did not reach its own end. */
function run(which) {
  const file = which === "mb" ? P.mb : P.pe;
  let out = "";
  try { out = execFileSync(process.execPath, [file], { cwd: ROOT, encoding: "utf8", timeout: 900000 }); }
  catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = /(?:^|\n)(?:plane-envelope: )?(\d+) pass, (\d+) fail/.exec(out);
  if (!m) return { pass: -1, fail: -1, out };
  return { pass: +m[1], fail: +m[2], out };
}
const named = (r, re) => (r.out.match(new RegExp(`^  FAIL  ${re}.*$`, "gm")) || []).length;
const failing = (r) => (r.out.match(/^  FAIL {2}(.{0,80})/gm) || []).map((s) => s.replace(/^ {2}FAIL {2}/, ""));
/* D-254: THE GUARD, RUN AS THE SCRIPT IT STILL IS, its OWN exit read — never a
   wrapper's. `out` is stdout and stderr together, so a load error is visible. */
function runGuard() {
  try {
    const out = execFileSync(process.execPath, [P.guard], { cwd: REPO, encoding: "utf8", stdio: "pipe", timeout: 300000 });
    return { exit: 0, out };
  } catch (e) {
    return { exit: e.status === undefined || e.status === null ? -1 : e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}
const readerLine = (r) => (r.out.match(/^ {2}READER:.*$/m) || ["(none)"])[0].trim();

/* `agreed` is a PREDICATE over the run, not a string comparison. The first
   version of this harness compared the declared SENTENCE with the observed one
   and reported every arm — including the working ones — as NOT AS DECLARED;
   recorded here rather than smoothed, because an arm register that cannot say
   which arms behaved is the same defect as a suite that cannot say which
   assertions failed. */
const rows = [];
const record = (arm, declared, agreed, actual, extra = "") => {
  rows.push({ arm, declared, actual, agreed, extra });
  console.log(`  ${agreed ? "AS DECLARED" : "!! NOT AS DECLARED"}  ARM ${arm}`);
  console.log(`      declared: ${declared}`);
  console.log(`      actual  : ${actual}${extra ? `\n      ${extra}` : ""}`);
};

console.log("=== D-240 CONTROL: the two inverted classifiers, each arm alone ===");

/* ---------------------------------------------------------------- (0) BASELINE */
const b0 = run("mb"), b1 = run("pe"), g0 = runGuard();
console.log(`  BASELINE: meaning-bounds ${b0.pass}/${b0.fail} · plane-envelope ${b1.pass}/${b1.fail} · guard exit ${g0.exit}`);
record("0 BASELINE", "both suites GREEN, each having reached its own FOOT, and the DEC-49 guard exits 0",
  b0.fail === 0 && b1.fail === 0 && b0.pass > 0 && b1.pass > 0 && g0.exit === 0,
  `mb ${b0.pass}/${b0.fail} · pe ${b1.pass}/${b1.fail} · guard exit ${g0.exit} (${g0.out.length} bytes of output)`);
const BASE_MB = b0.pass, BASE_PE = b1.pass;

/* ------------------------------------- (1) THE OLD EXCLUDER, meaning-bounds */
{
  const s = snapshot("a1", ["mb"]);
  patch("mb", "return !!v && v.kind === \"false\";", "return REFUSAL_RETURN_OLD.test(ro);");
  const r = run("mb"), pe = run("pe");
  record("1 old one-literal EXCLUDER restored",
    "meaning-bounds RED on D-240 (b), (c) and (e); plane-envelope UNTOUCHED and GREEN; and the "
    + "BARE/OPAQUE RATCHETS STAY GREEN — a ceiling cannot catch a reader that is too generous",
    r.fail > 0 && named(r, "D-240 \\(b\\)") === 1 && named(r, "D-240 \\(c\\)") === 1
      && named(r, "D-240 \\(e\\)") === 1 && named(r, "RATCHET") === 0 && pe.fail === 0,
    `meaning-bounds ${r.pass}/${r.fail} (b:${named(r, "D-240 \\(b\\)")} c:${named(r, "D-240 \\(c\\)")} `
    + `e:${named(r, "D-240 \\(e\\)")}), plane-envelope ${pe.pass}/${pe.fail}, RATCHET failures ${named(r, "RATCHET")}`,
    `failing: ${failing(r).join(" | ")}`);
  restore("a1", s);
}

/* ------------------------------------------ (2) THE OLD GATE, plane-envelope */
{
  const s = snapshot("a2", ["pe"]);
  patch("pe", "const canReportSuccess = (arg) => { const v = declaresRefusalEnvelope(arg); return !!v && (v.kind === \"true\" || v.kind === \"expr\"); };",
              "const canReportSuccess = (arg) => SUCCESS_ENVELOPE_OLD.test(arg);");
  const r = run("pe"), mb = run("mb");
  record("2 old one-literal GATE restored",
    "plane-envelope RED on D-240 (b), (c) and (d); DETECTOR A ITSELF still reports 0 violations and "
    + "stays GREEN — the gate decides what the detector may see, which is the whole defect; meaning-bounds GREEN",
    r.fail > 0 && named(r, "D-240 \\(b\\)") === 1 && named(r, "D-240 \\(c\\)") === 1
      && named(r, "DETECTOR A") === 0 && mb.fail === 0,
    `plane-envelope ${r.pass}/${r.fail} (b:${named(r, "D-240 \\(b\\)")} c:${named(r, "D-240 \\(c\\)")} `
    + `d:${named(r, "D-240 \\(d\\)")}), DETECTOR A failures ${named(r, "DETECTOR A")}, `
    + `meaning-bounds ${mb.pass}/${mb.fail}`,
    `failing: ${failing(r).join(" | ")}`);
  restore("a2", s);
}

/* D-254's anchors. The drift is D-240's own one-character edit, unchanged; the
   import tail is the guard's, and every one is asserted to occur exactly once. */
const DRIFT_FROM = "  if (/^Boolean\\s*\\(/.test(s)) return \"expr\";";
const DRIFT_TO = "  if (/^Boolean\\s*\\(/.test(s)) return \"exprr\";";
const IMPORT_TAIL = "\n         verdictKind, verdictOf } from \"../bio-plane/test/verdict-reader.mjs\";\n";
const GUARD_IMPORT = "import { skipString, matchBrace, outcomeReturns, topLevelParts, topLevelProps, topLevelSpreads,"
                   + IMPORT_TAIL;
const READER_SRC = readFileSync(P.reader, "utf8");   /* pristine: read before any arm touches it */
const oneLine = (r) => `mb ${r.mb.pass}/${r.mb.fail} (a:${named(r.mb, "D-240 \\(a\\)")}), `
  + `pe ${r.pe.pass}/${r.pe.fail} (a:${named(r.pe, "D-240 \\(a\\)")}), guard exit ${r.g.exit}`;

/* ------- (3) ONE CHARACTER OF DRIFT INSIDE A SECOND `verdictKind` (RE-AIMED BY D-254)
   The copy is RE-GROWN in the guard, which is the only place one can come back,
   with `verdictKind` dropped from the import so the guard still loads. It is D-240's
   arm in the only form the defect can now take. */
{
  const s = snapshot("a3", ["guard"]);
  const home = fnSource(READER_SRC, "verdictKind");
  if (!home || home.split(DRIFT_FROM).length - 1 !== 1)
    throw new Error("ARM 3: the drift anchor is not inside the reader's verdictKind exactly once — the arm cannot arm");
  patch("guard", IMPORT_TAIL, "\n         verdictOf } from \"../bio-plane/test/verdict-reader.mjs\";\n"
    + "/* D-254 CONTROL ARM 3: a second verdictKind, grown back with one character of drift */\n"
    + home.replace(DRIFT_FROM, DRIFT_TO));
  const r = { mb: run("mb"), pe: run("pe"), g: runGuard() };
  record("3 ONE CHARACTER of drift inside a SECOND verdictKind, re-grown in the guard (the only place a copy can come back)",
    "BOTH suites RED on D-240 (a) and on NOTHING ELSE, the READER line naming verdictKind NOT SINGLE-HOMED; "
    + "the GUARD still exits 0 — the copy is dead code today, which is why only the pin can see it",
    r.mb.fail === 1 && r.pe.fail === 1 && named(r.mb, "D-240 \\(a\\)") === 1 && named(r.pe, "D-240 \\(a\\)") === 1
      && /NOT SINGLE-HOMED: verdictKind · MISREAD: none$/m.test(r.mb.out)
      && /NOT SINGLE-HOMED: verdictKind · MISREAD: none$/m.test(r.pe.out) && r.g.exit === 0,
    oneLine(r), `mb reader line: ${readerLine(r.mb)}`);
  restore("a3", s);
}

/* ------------- (3m) THE STALE-MERGE SHAPE: all eight re-grown BESIDE the import (D-254) */
{
  const s = snapshot("a3m", ["guard"]);
  const eight = SHARED_FNS.map((n) => fnSource(READER_SRC, n));
  if (eight.length !== 8 || eight.some((x) => !x)) throw new Error("ARM 3m: the pristine reader did not yield all eight functions");
  patch("guard", GUARD_IMPORT, GUARD_IMPORT
    + "/* D-254 CONTROL ARM 3m: the pre-D-254 declarations, merged back beside the import */\n" + eight.join("\n"));
  const r = { mb: run("mb"), pe: run("pe"), g: runGuard() };
  const all8 = new RegExp(`NOT SINGLE-HOMED: ${SHARED_FNS.join(", ")} · MISREAD: none$`, "m");
  record("3m THE STALE-MERGE SHAPE: all eight declarations re-grown BESIDE the guard's full import",
    "the GUARD FAILS TO LOAD (a duplicate declaration, exit 1), and BOTH suites RED on D-240 (a) and on NOTHING "
    + "ELSE, the READER line naming ALL EIGHT",
    r.g.exit === 1 && /has already been declared/.test(r.g.out)
      && r.mb.fail === 1 && r.pe.fail === 1 && named(r.mb, "D-240 \\(a\\)") === 1 && named(r.pe, "D-240 \\(a\\)") === 1
      && all8.test(r.mb.out) && all8.test(r.pe.out),
    `${oneLine(r)} — ${(r.g.out.match(/SyntaxError[^\n]*/) || ["no SyntaxError"])[0]}`,
    `mb reader line: ${readerLine(r.mb)}`);
  restore("a3m", s);
}

/* ------------------- (3b) OVER-STRICTNESS: the pin is on the READER, not the file */
{
  const s = snapshot("a3b", ["reader"]);
  patch("reader", " * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT.",
                  " * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT. (arm 3b touched this line)");
  const mb = run("mb"), pe = run("pe");
  record("3b OVER-STRICTNESS: a comment edited OUTSIDE the shared functions",
    "BOTH suites GREEN — the pin is on the READER, not on the file",
    mb.fail === 0 && pe.fail === 0,
    `mb ${mb.pass}/${mb.fail}, pe ${pe.pass}/${pe.fail}`);
  restore("a3b", s);
}

/* ------ (3c) D-240's OWN ARM-(3) EDIT, APPLIED TO THE ONE HOME (D-254)
   Not drift any more — there is no twin — but a change to what the reader all
   three instruments read ANSWERS. The old pin passed that by design whenever both
   copies moved together; a READING is what catches it now. */
{
  const s = snapshot("a3c", ["reader"]);
  patch("reader", DRIFT_FROM, DRIFT_TO);
  const r = { mb: run("mb"), pe: run("pe"), g: runGuard() };
  const misreadVK = /NOT SINGLE-HOMED: none · MISREAD: verdictKind$/m;
  record("3c D-240's arm-(3) edit applied to the ONE home: one character inside verdictKind in verdict-reader.mjs",
    "BOTH suites RED on D-240 (a), the READER line naming verdictKind MISREAD (a reading catches it, not the home); "
    + "plane-envelope ALSO RED on D-240 (d) and on nothing else; meaning-bounds on nothing else; the GUARD exits 0 "
    + "with output BYTE-IDENTICAL to the unarmed run — no governed site spells a `Boolean(…)` verdict",
    r.mb.fail === 1 && named(r.mb, "D-240 \\(a\\)") === 1 && misreadVK.test(r.mb.out)
      && r.pe.fail === 2 && named(r.pe, "D-240 \\(a\\)") === 1 && named(r.pe, "D-240 \\(d\\)") === 1
      && misreadVK.test(r.pe.out) && r.g.exit === 0 && r.g.out === g0.out,
    `${oneLine(r)} (pe d:${named(r.pe, "D-240 \\(d\\)")}), guard output `
    + `${r.g.out === g0.out ? "BYTE-IDENTICAL to the unarmed run" : "DIFFERS from the unarmed run"}`,
    `failing: mb ${failing(r.mb).join(" | ") || "(none)"} · pe ${failing(r.pe).join(" | ") || "(none)"}`);
  restore("a3c", s);
}

/* ------- (3d) OVER-STRICTNESS ON THE IMPORT PIN: the guard's import re-spelled (D-254)
   Reversed, one name per line, a trailing comma, single quotes, and an `as` alias on
   a name arm C never calls — spellings nobody in this estate writes. */
{
  const s = snapshot("a3d", ["guard"]);
  patch("guard", GUARD_IMPORT, "import {\n  verdictOf,\n  verdictKind,\n  topLevelSpreads,\n  topLevelProps,\n"
    + "  topLevelParts as d254AliasedParts,\n  outcomeReturns,\n  matchBrace,\n  skipString,\n"
    + "} from '../bio-plane/test/verdict-reader.mjs';\n");
  const r = { mb: run("mb"), pe: run("pe"), g: runGuard() };
  record("3d OVER-STRICTNESS on the import pin: the guard's import re-spelled (reversed, one per line, trailing comma, "
       + "single quotes, an `as` alias)",
    "BOTH suites GREEN at their baselines and the guard exits 0 — the pin reads what is IMPORTED, not how it is spelled",
    r.mb.fail === 0 && r.pe.fail === 0 && r.mb.pass === BASE_MB && r.pe.pass === BASE_PE && r.g.exit === 0,
    oneLine(r), `mb reader line: ${readerLine(r.mb)}`);
  restore("a3d", s);
}

/* ------------------------------ (4) THE REAL DEFECT AT THE COMPUTED-VERDICT SITE */
const PROMOTED_GUARD = /^[ \t]*if \(!promoted\.answered\).*$\n/m;
{
  const s = snapshot("a4", ["index"]);
  const src = readFileSync(P.index, "utf8");
  const hits = (src.match(new RegExp(PROMOTED_GUARD.source, "gm")) || []).length;
  if (hits !== 1) throw new Error(`ARM 4: promoted.answered guard occurs ${hits} times, expected 1`);
  writeFileSync(P.index, src.replace(PROMOTED_GUARD, ""));
  const r = run("pe");
  record("4 the promoted.answered guard REMOVED (the real defect at the computed-verdict site)",
    "plane-envelope RED, DETECTOR A firing and NAMING `promoted`",
    r.fail > 0 && named(r, "DETECTOR A") === 1 && /DETECTOR A[^\n]*promoted/.test(r.out),
    `plane-envelope ${r.pass}/${r.fail}, DETECTOR A failures ${named(r, "DETECTOR A")}, `
    + `names promoted: ${/DETECTOR A[^\n]*promoted/.test(r.out)}`,
    `failing: ${failing(r).join(" | ")}`);
  restore("a4", s);
}
/* ------------- (4b) THE PAIR: the SAME defect under the OLD gate must PASS ---- */
{
  const s = snapshot("a4b", ["index", "pe"]);
  const src = readFileSync(P.index, "utf8");
  writeFileSync(P.index, src.replace(PROMOTED_GUARD, ""));
  patch("pe", "const canReportSuccess = (arg) => { const v = declaresRefusalEnvelope(arg); return !!v && (v.kind === \"true\" || v.kind === \"expr\"); };",
              "const canReportSuccess = (arg) => SUCCESS_ENVELOPE_OLD.test(arg);");
  const r = run("pe");
  record("4b THE RECEIPT: the SAME removed guard, read by the OLD one-literal gate",
    "DETECTOR A reports ZERO violations — the same real defect is INVISIBLE to the gate this item replaced",
    named(r, "DETECTOR A") === 0,
    `DETECTOR A failures ${named(r, "DETECTOR A")} (suite ${r.pass}/${r.fail}; the D-240 arms fail here because the gate is the old one, which is arm 2)`);
  restore("a4b", s);
}

/* -------------- (5) A REFUSAL-SHAPED READ THE OLD EXCLUDER COUNTS AS A DEFECT
   The planted method is a REAL member of the class the walk grades: it scans
   the observation log with NO `LIMIT`, publishes `entries`, and refuses in a
   spelling the old excluder cannot see.
   RE-AIMED 2026-09-14 BY REC-93, and the arm is unchanged in every respect that
   matters. Both plants below read `ai_run_log`, which `OBSERVATION-LOG-DESIGN.md`
   §4.4 folded into `observations` and `#migrate` DROPS. The walk these arms
   exercise is a SOURCE walk, so a plant naming a table that no longer exists
   would NOT have failed the arm — it would have gone on passing while planting
   code the plane can no longer run, which is the quietest way for a control to
   stop being about anything. The table name is corrected so a reader who plants
   this by hand gets a method that actually executes. Under the new excluder it is a refusal and is not
   graded; under the old one it lands on the BARE roster and breaks the ceiling —
   over a method that is not a defect at all. */
const PLANT_REFUSAL = [
  "  ncD240Read(input = {}) {",
  "    const run = String((input && input.run) || \"\");",
  "    const entries = this.#rows(`SELECT seq FROM observation_log WHERE authority_kind = 'run' AND authority = ?`, run);",
  "    if (!entries.length) return { found: false, reason: \"NO_SUCH_RUN\", run, entries };",
  "    return { found: true, run };",
  "  }",
  "",
].join("\n");
const PLANT_BOUNDED = [
  "  ncD240Read(input = {}) {",
  "    const cap = 50;",
  "    const rows = this.#rows(`SELECT seq FROM observation_log ORDER BY seq LIMIT ?`, cap + 1);",
  "    return { entries: rows.slice(0, cap), limit: cap, overflowed: rows.length > cap };",
  "  }",
  "",
].join("\n");
const DISPATCH_LINE = "        ncd240: () => this.ncD240Read(body),\n";
/* BUILT BY CONCATENATION ON PURPOSE. `op-claims.test.mjs` walks every comment
   and string in the estate for `op=<name>` and refuses one that is not in the
   dispatch table — and this arm's op exists only WHILE the arm is armed. Writing
   the token literally here made that suite red, which is the estate catching a
   control file exactly as it should. The token is never spelled whole. */
const ON_BOUNDED = new RegExp("op" + "=ncd240\\s+-> ncD240Read");
const DISPATCH_ANCHOR = (() => {
  const src = readFileSync(P.store, "utf8");
  const m = /^ {8}airunlog: \(\) => .*$\n/m.exec(src);
  if (!m) throw new Error("cannot locate the dispatch table anchor");
  return m[0];
})();
function plantStoreRead(methodText) {
  const src = readFileSync(P.store, "utf8");
  const at = src.indexOf(DISPATCH_ANCHOR);
  if (at < 0) throw new Error("dispatch anchor not found");
  if (src.split(DISPATCH_ANCHOR).length - 1 !== 1) throw new Error("dispatch anchor is not unique");
  const withDispatch = src.slice(0, at) + DISPATCH_LINE + src.slice(at);
  /* the method goes immediately before `aiRunLog`, which the segmenter bounds by
     the NEXT signature — so the plant is a segment of its own and nothing else
     moves. The anchor is asserted unique before it is used. */
  const anchor = "\n  aiRunLog({ run, viewer = null, limit = null } = {}) {";
  if (withDispatch.split(anchor).length - 1 !== 1) throw new Error("method anchor is not unique");
  const mAt = withDispatch.indexOf(anchor);
  const out = withDispatch.slice(0, mAt) + "\n" + methodText + withDispatch.slice(mAt + 1);
  if (out.length <= src.length) throw new Error("plant added nothing");
  writeFileSync(P.store, out);
}
{
  const s = snapshot("a5", ["store"]);
  plantStoreRead(PLANT_REFUSAL);
  const r = run("mb");
  record("5 a DISPATCHED read whose refusal is spelled `found: false` and carries a collection",
    "the BARE RATCHET stays GREEN — the refusal is EXCLUDED, so a NON-DEFECT does not join the ceiling. "
    + "The planted op DOES move the OPAQUE roster and the (e) residual, and that is the walk correctly "
    + "reporting a new method it cannot reach rather than a failure of this arm",
    named(r, "RATCHET") === 0 && named(r, "REACH: the OPAQUE") === 1,
    `meaning-bounds ${r.pass}/${r.fail}, RATCHET failures ${named(r, "RATCHET")}, `
    + `BARE roster line: ${(r.out.match(/^ {2}BARE — .*$/m) || ["(none)"])[0].trim()}`,
    `failing: ${failing(r).join(" | ") || "(none)"}`);
  restore("a5", s);
}
/* ----------- (5b) THE PAIR: the SAME plant under the OLD excluder must go RED
   CORRECTED 2026-09-21 by D-254, never exempted: the predicate TYPED the figure,
   `BARE … 39 ops` ("39 of 38"), and the BARE roster has since moved to 40 on
   `main` — so on the untouched base `fc94b045` this arm read NOT AS DECLARED
   (BARE 41, RATCHET failing exactly as the arm means) over a harness nobody had
   re-run since D-240. The figure is READ from the baseline run now: the plant must
   push the roster ONE past what the unarmed suite printed and fail the ratchet. */
{
  const bareBase = +((b0.out.match(/^ {2}BARE — .*: (\d+) ops$/m) || [])[1]);
  if (!Number.isInteger(bareBase)) throw new Error("ARM 5b: the baseline run printed no BARE roster figure — the arm cannot arm");
  const s = snapshot("a5b", ["store", "mb"]);
  plantStoreRead(PLANT_REFUSAL);
  patch("mb", "return !!v && v.kind === \"false\";", "return REFUSAL_RETURN_OLD.test(ro);");
  const r = run("mb");
  record("5b THE RECEIPT: the SAME planted refusal, read by the OLD one-literal excluder",
    `the BARE RATCHET FAILS at ${bareBase + 1} of ${bareBase} over a NON-DEFECT — the false positive that makes `
    + `REC-70's ceiling unholdable (the figure is the baseline run's own print, plus the plant)`,
    named(r, "RATCHET") === 1 && new RegExp(`BARE — .*: ${bareBase + 1} ops$`, "m").test(r.out),
    `meaning-bounds ${r.pass}/${r.fail}, RATCHET failures ${named(r, "RATCHET")}, `
    + `BARE roster line: ${(r.out.match(/^ {2}BARE — .*$/m) || ["(none)"])[0].trim()}`,
    `failing: ${failing(r).join(" | ") || "(none)"}`);
  restore("a5b", s);
}

/* ------------------------------------------------ (6) OVER-STRICTNESS ON TREE
   `overflowed` is a spelling NOTHING in this plane writes, so a walk that only
   passed this arm by having met the word before would fail it. The read is
   correctly bounded, and its completeness flag is a COMPARISON — the shape that
   refused this edit's first draft, kept as a standing control rather than as a
   sentence in a report. */
{
  const s = snapshot("a6", ["store"]);
  plantStoreRead(PLANT_BOUNDED);
  const r = run("mb");
  record("6 OVER-STRICTNESS: a correctly-bounded read whose completeness flag is a COMPARISON, in a "
       + "spelling this plane never uses",
    "meaning-bounds GREEN and the planted `ncd240` on the BOUNDED roster — NOT excluded as a refusal, NOT vanished",
    r.fail === 0 && ON_BOUNDED.test(r.out),
    `meaning-bounds ${r.pass}/${r.fail}, on BOUNDED: ${ON_BOUNDED.test(r.out)}, `
    + `RATCHET failures ${named(r, "RATCHET")}`,
    `failing: ${failing(r).join(" | ") || "(none)"}`);
  restore("a6", s);
}

console.log("\n=== SUMMARY ===");
for (const r of rows) console.log(`  ${r.agreed ? "as declared" : "NOT AS DECLARED"}  ARM ${r.arm}`);
const final = { mb: run("mb"), pe: run("pe"), g: runGuard() };
console.log(`  FINAL (after every restore): meaning-bounds ${final.mb.pass}/${final.mb.fail} `
          + `(baseline ${BASE_MB}) · plane-envelope ${final.pe.pass}/${final.pe.fail} (baseline ${BASE_PE}) · `
          + `guard exit ${final.g.exit}, output ${final.g.out === g0.out ? "BYTE-IDENTICAL to" : "DIFFERENT from"} the baseline run`);
const notAsDeclared = rows.filter((r) => !r.agreed).length;
console.log(`  ${rows.length - notAsDeclared} of ${rows.length} arms AS DECLARED`);
if (final.mb.pass !== BASE_MB || final.pe.pass !== BASE_PE || final.mb.fail || final.pe.fail
    || final.g.exit !== 0 || final.g.out !== g0.out)
  console.log("  !! THE TREE DID NOT COME BACK TO ITS BASELINE — a restore is wrong.");
/* D-254: the harness's own exit says whether every arm behaved, so a caller need not
   parse the register to know — read it UNPIPED. */
process.exitCode = notAsDeclared ? 1 : 0;
