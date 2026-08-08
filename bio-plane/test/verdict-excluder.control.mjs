/* D-240 · THE NEGATIVE CONTROLS FOR THE TWO INVERTED CLASSIFIERS.
 * ============================================================================
 * DELIBERATELY NOT A `.test.mjs`: it MUTATES `src/index.mjs`, `src/store.mjs`,
 * `test/meaning-bounds.test.mjs`, `test/plane-envelope.test.mjs` and
 * `test/verdict-reader.mjs` while it runs, so the battery must not discover it.
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
 * THE SEVEN ARMS, and what each MUST do — declared BEFORE arming:
 *   (0) BASELINE -> meaning-bounds GREEN, plane-envelope GREEN.
 *   (1) restore meaning-bounds' one-literal EXCLUDER -> meaning-bounds RED on
 *       D-240 (b) and (e); plane-envelope UNTOUCHED and GREEN; and THE RATCHETS
 *       STAY GREEN, which is the finding: a ceiling cannot catch a reader that
 *       is too generous.
 *   (2) restore plane-envelope's one-literal GATE -> plane-envelope RED on
 *       D-240 (b) and (c); DETECTOR A ITSELF STAYS GREEN at 0 violations, which
 *       is the whole defect: the gate decides what the detector may see.
 *   (3) DRIFT the shared reader by ONE character inside `verdictKind` -> BOTH
 *       suites RED on D-240 (a), naming `verdictKind`.
 *   (3b) OVER-STRICTNESS ON THE DRIFT PIN — edit a COMMENT in
 *       `verdict-reader.mjs` OUTSIDE the six shared functions -> BOTH suites
 *       GREEN. A pin that fires on any edit to the file is not a pin on the
 *       reader.
 *   (4) PLANT THE REAL DEFECT — remove the `promoted.answered` guard in
 *       `src/index.mjs` -> plane-envelope RED, DETECTOR A naming `promoted`.
 *       PAIRED with (4b), the same plant under the OLD gate -> GREEN. That pair
 *       is the receipt: the same real defect that the new gate catches is
 *       INVISIBLE to the one this item replaced.
 *   (5) PLANT A REFUSAL-SHAPED READ in `src/store.mjs` — a dispatched op whose
 *       refusal is spelled `found: false` and carries a collection off an
 *       unbounded scan -> meaning-bounds GREEN (the refusal is excluded).
 *       PAIRED with (5b), the same plant under the OLD excluder -> RED, the
 *       BARE ratchet failing at 39 of 38 over a NON-DEFECT. That pair is the
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

const HERE = fileURLToPath(new URL("./", import.meta.url));
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const P = {
  mb: HERE + "meaning-bounds.test.mjs",
  pe: HERE + "plane-envelope.test.mjs",
  reader: HERE + "verdict-reader.mjs",
  index: ROOT + "src/index.mjs",
  store: ROOT + "src/store.mjs",
};
const MIN_BYTES = { mb: 40000, pe: 30000, reader: 6000, index: 150000, store: 500000 };
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
const b0 = run("mb"), b1 = run("pe");
console.log(`  BASELINE: meaning-bounds ${b0.pass}/${b0.fail} · plane-envelope ${b1.pass}/${b1.fail}`);
record("0 BASELINE", "both suites GREEN, each having reached its own FOOT",
  b0.fail === 0 && b1.fail === 0 && b0.pass > 0 && b1.pass > 0,
  `mb ${b0.pass}/${b0.fail} · pe ${b1.pass}/${b1.fail}`);
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

/* --------------------------------------------- (3) DRIFT IN THE SHARED READER */
{
  const s = snapshot("a3", ["reader"]);
  patch("reader", "  if (/^Boolean\\s*\\(/.test(s)) return \"expr\";", "  if (/^Boolean\\s*\\(/.test(s)) return \"exprr\";");
  const mb = run("mb"), pe = run("pe");
  record("3 ONE CHARACTER of drift inside verdictKind",
    "BOTH suites RED on D-240 (a), and the printed READER line NAMES verdictKind",
    named(mb, "D-240 \\(a\\)") === 1 && named(pe, "D-240 \\(a\\)") === 1
      && /differing from REC-76's copy: verdictKind/.test(mb.out) && /differing from REC-76's copy: verdictKind/.test(pe.out),
    `mb ${mb.pass}/${mb.fail} (a:${named(mb, "D-240 \\(a\\)")}), pe ${pe.pass}/${pe.fail} (a:${named(pe, "D-240 \\(a\\)")})`,
    `mb reader line: ${(mb.out.match(/^ {2}READER:.*$/m) || ["(none)"])[0].trim()}`);
  restore("a3", s);
}

/* ------------------- (3b) OVER-STRICTNESS: the pin is on the READER, not the file */
{
  const s = snapshot("a3b", ["reader"]);
  patch("reader", " * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT.",
                  " * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT. (arm 3b touched this line)");
  const mb = run("mb"), pe = run("pe");
  record("3b OVER-STRICTNESS: a comment edited OUTSIDE the six shared functions",
    "BOTH suites GREEN — the pin is on the READER, not on the file",
    mb.fail === 0 && pe.fail === 0,
    `mb ${mb.pass}/${mb.fail}, pe ${pe.pass}/${pe.fail}`);
  restore("a3b", s);
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
   `ai_run_log` with NO `LIMIT`, publishes `entries`, and refuses in a spelling
   the old excluder cannot see. Under the new excluder it is a refusal and is not
   graded; under the old one it lands on the BARE roster and breaks the ceiling —
   over a method that is not a defect at all. */
const PLANT_REFUSAL = [
  "  ncD240Read(input = {}) {",
  "    const run = String((input && input.run) || \"\");",
  "    const entries = this.#rows(`SELECT seq FROM ai_run_log WHERE run = ?`, run);",
  "    if (!entries.length) return { found: false, reason: \"NO_SUCH_RUN\", run, entries };",
  "    return { found: true, run };",
  "  }",
  "",
].join("\n");
const PLANT_BOUNDED = [
  "  ncD240Read(input = {}) {",
  "    const cap = 50;",
  "    const rows = this.#rows(`SELECT seq FROM ai_run_log ORDER BY seq LIMIT ?`, cap + 1);",
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
/* ----------- (5b) THE PAIR: the SAME plant under the OLD excluder must go RED */
{
  const s = snapshot("a5b", ["store", "mb"]);
  plantStoreRead(PLANT_REFUSAL);
  patch("mb", "return !!v && v.kind === \"false\";", "return REFUSAL_RETURN_OLD.test(ro);");
  const r = run("mb");
  record("5b THE RECEIPT: the SAME planted refusal, read by the OLD one-literal excluder",
    "the BARE RATCHET FAILS at 39 of 38 over a NON-DEFECT — the false positive that makes REC-70's ceiling unholdable",
    named(r, "RATCHET") === 1 && /BARE — .*: 39 ops/.test(r.out),
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
const final = { mb: run("mb"), pe: run("pe") };
console.log(`  FINAL (after every restore): meaning-bounds ${final.mb.pass}/${final.mb.fail} `
          + `(baseline ${BASE_MB}) · plane-envelope ${final.pe.pass}/${final.pe.fail} (baseline ${BASE_PE})`);
if (final.mb.pass !== BASE_MB || final.pe.pass !== BASE_PE || final.mb.fail || final.pe.fail)
  console.log("  !! THE TREE DID NOT COME BACK TO ITS BASELINE — a restore is wrong.");
