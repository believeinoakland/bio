/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/dec65-strength-reach.control.mjs` — deliberately NOT a `.test.mjs` because it EDITS REAL SOURCES while it runs, so the battery must not discover it (PL-2/PL-3/PL-14/PL-19's shape). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY-NAMED per-arm pristine copy, and every arm names what MUST fail and what MUST NOT. See that file's header for the MEASURED results — no figure is copied here, because a hand-carried number in a second file is this repository's most-measured defect.
   THE ARMS: (0) BASELINE, nothing patched — every arm green, so a run where six arms report the same thing as a broken instrument is distinguishable from one where they do not. (1) MAKE THE ARITHMETIC READ THE FIELD — `#strengthWalk`'s `site` carries `asserted_by` and `#axisResult` consults it: §1's reach assertion MUST fail. This is the arm that stops "zero readers" from being a walk looking in the wrong place. (2) NAME THE FIELD IN A COMMENT INSIDE THE ARITHMETIC and nowhere else: §1 MUST NOT fail. A sweep that cited its own prose would fail here, which is the receipt that the comment-stripping is doing work rather than decorating. (3) BREAK THE SCANNER'S REGEX ARM: the desync self-check MUST fail — the instrument's own defect, which cost this item `suggestVersion` and thirteen other methods before it was caught. (4) BLIND THE DIFFERENTIAL — make it compare an answer against itself: §3's SENSITIVITY assertion MUST fail while its equality assertions stay green, which is what shows the equalities are not free. (5) NEUTER THE WRITE GATE (`C-25.6`'s asserted arm): §4 MUST fail AND the harm is NAMED — a reading whose second group of reasons nobody signed for is admitted, and the maximum is taken over it. (6) OVER-STRICTNESS, WHICH MUST PASS: a genuine member claim in a spelling nobody anticipated — unicode, spaces, an email shape, and a name that CONTAINS the minted no-claim literal as a substring — still reads as a member's claim.
*/
/* IS-BUILD-PLAN PL-20 / DEC-65 STEP THREE — THE STRENGTH PAIR, RE-MEASURED OVER GROUNDS.
 *
 * DEC-65 was enacted in three steps and this is the third. PL-17 minted the
 * third `asserted_by` state (`SUFFICIENCY_UNCLAIMED` — *no independent-
 * sufficiency claim was made*). PL-19 wired it at the two sites that had to
 * move together, `C-25.6` and PL-3's endpoint guard, so a machine may compose a
 * reading declaring EXACTLY ONE part and no more. PL-19's delegation names what
 * it did NOT do and hands it here:
 *
 *     *"WHAT IS NOT MEASURED, AND IT IS YOURS. Whether anything in the strength
 *      walk READS `asserted_by` at all across SEVERAL grounds. … If the walk
 *      takes its maximum over declared grounds without consulting the
 *      attribution, the third state is arithmetically inert by construction and
 *      that is worth saying out loud."*
 *
 * IT DOES NOT, AND THIS FILE IS THAT SENTENCE SAID AS A MEASUREMENT RATHER THAN
 * AS AN ABSENCE OF FINDINGS. Two independent instruments, from two directions,
 * because either one alone is the shape this project keeps finding wrong:
 *
 *   THE REACH (§1–§2), STATIC, over comment-stripped real source. The
 *   arithmetic is the transitive callee closure of `#strengthWalk` — the ONE
 *   function that turns legs into a pair — and the closure is COMPUTED here,
 *   never listed, so a helper added tomorrow is swept without this file being
 *   edited. Nothing in it names the field, and the whole PROPERTY VOCABULARY of
 *   the closure is printed so a reader can check the negative themselves rather
 *   than trusting a regex. And the recogniser is RE-RUN over a source that DOES
 *   read the field and must FIND it — a matcher that finds nothing over a
 *   corpus it cannot see is the failure mode, not the result.
 *
 *   THE DIFFERENTIAL (§3), DRIVEN THROUGH THE OPS, at BOTH altitudes the field
 *   exists at: `grounds[].asserted_by` on a finding (C-2.8) read through
 *   `op=inquirystrength`, and `basis_version_grounds[].asserted_by` on a
 *   version (C-25.6, DEC-65's own field) read through `op=versionstrength`.
 *   The attribution is varied across SEVERAL grounds — different members,
 *   different dates, different row order, statements present and absent — and
 *   the pair does not move by one byte. This arm is SPELLING-BLIND: it never
 *   names the field, so it would catch the value reaching the arithmetic under
 *   an alias, which is precisely what the static arm cannot see.
 *   AND IT CARRIES ITS OWN SENSITIVITY PROOF: the same comparison over a
 *   changed ground LABEL MOVES the pair on both axes. An equality that costs
 *   nothing to produce is not evidence, so the differential is required to
 *   demonstrate it can see a difference before its equalities count.
 *
 * §4 IS THE CONSEQUENCE, AND IT IS THE HALF THAT IS NOT GOOD NEWS. Because the
 * arithmetic is attribution-BLIND, every guarantee that *the maximum is never
 * taken over a part nobody claimed* is a WRITE-TIME fact and nothing else. The
 * gates are not a belt beside a brace: they are the whole defence, and control
 * arm (5) takes one down to say what the record then claims.
 *
 * AND §4 CARRIES THIS ITEM'S UNEXPECTED FINDING, PINNED AS A DEFECT RATHER THAN
 * DESCRIBED. On this tree — PL-17 landed, PL-19 committed but NOT merged — a
 * hand-authored TWO-part reading whose second part carries the minted no-claim
 * value is ADMITTED at `op=promote`, because `C-25.6`'s member arm asks
 * `isMachineIdentity` and PL-17 minted the value in a namespace deliberately
 * NEITHER `token:` NOR `class:`. The maximum is then taken over a part whose own
 * row says outright that nobody claimed it, and the reading reports one whole
 * grade stronger than the parts anybody signed for support. PL-17 measured that
 * arm over ONE part and pinned it there; nobody measured it over SEVERAL, which
 * is exactly the question step three was delegated. **PL-19 CLOSES IT**, so this
 * is the integration gap and not a design gap — and §4's three assertions are
 * WRITTEN TO FAIL the moment step two lands, for the integrator to CORRECT with
 * a dated reason rather than exempt.
 *
 * WHAT IS DELIBERATELY NOT PINNED, because step two moves it: whether a ONE-part
 * version carrying the minted value is admitted. That is the whole of DEC-65's
 * licence and it is step two's to assert, not step three's.
 *
 * NO MEMBER-FACING STRING IN THIS FILE SAYS "ground", "AND" or "OR" as a
 * member-facing word (DEC-32's elicitation clause, D-226). `ground` appears as
 * a FIELD NAME, which is what the record calls it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { SUFFICIENCY_UNCLAIMED, SUFFICIENCY_CLAIM_STATES, sufficiencyClaimState,
         isSufficiencyClaimed, isMachineIdentity } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const CHK = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ===================================================================== *
 * THE INSTRUMENT. One scanner, two outputs, so the comment-stripped text
 * and the string-blanked text cannot desync from each other: they are the
 * same walk. `stripped` KEEPS string contents, because a `SELECT asserted_by`
 * is a read of the field; `code` blanks them, because a call-graph pass fed
 * SQL keywords and refusal prose invents callees that do not exist (it
 * invented 189 of them before this was split).
 * ===================================================================== */
function scan(src) {
  let stripped = "", code = "";
  const put = (a, b) => { stripped += a; code += b; };
  let i = 0; const n = src.length, tmpl = [];
  let mode = "code", lastSig = "";
  const REGEX_OK_AFTER = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?",
    "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^", "\n"]);
  const KEYWORD_BEFORE = /\b(return|typeof|instanceof|case|in|of|do|else|yield|await|new|delete|void)\s*$/;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (mode === "code") {
      if (c === "/" && d === "/") { mode = "line"; i += 2; continue; }
      if (c === "/" && d === "*") { mode = "block"; put(" ", " "); i += 2; continue; }
      if (c === "/" && (REGEX_OK_AFTER.has(lastSig) || KEYWORD_BEFORE.test(code.slice(-24)))) {
        /* A REGEX LITERAL, CONSUMED WHOLE. A `/` inside a character class must
           not open a comment and a quote inside one must not open a string.
           Both did, in this file's own first build, and the damage was silent:
           fourteen methods including `suggestVersion` were swallowed into a
           neighbour's span and the closure looked FINE. The desync self-check
           below exists because of that arm, not in anticipation of it. */
        let j = i + 1, cls = false;
        while (j < n) {
          const e = src[j];
          if (e === "\\") { j += 2; continue; }
          if (e === "[") cls = true;
          else if (e === "]") cls = false;
          else if (e === "/" && !cls) break;
          else if (e === "\n") break;
          j++;
        }
        const body = src.slice(i, Math.min(j + 1, n));
        put(body, body.replace(/[^\n]/g, " "));
        lastSig = "/"; i = j + 1; continue;
      }
      if (c === "'" || c === '"') { mode = c === "'" ? "sq" : "dq"; put(c, c); lastSig = c; i++; continue; }
      if (c === "`") { mode = "tmpl"; tmpl.push(0); put(c, c); lastSig = c; i++; continue; }
      if (c === "}" && tmpl.length && tmpl[tmpl.length - 1] > 0) {
        tmpl[tmpl.length - 1]--;
        if (tmpl[tmpl.length - 1] === 0) { mode = "tmpl"; put(c, c); lastSig = c; i++; continue; }
      }
      put(c, c);
      if (!/\s/.test(c) || c === "\n") lastSig = c;
      i++; continue;
    }
    if (mode === "line") { if (c === "\n") { mode = "code"; put("\n", "\n"); lastSig = "\n"; } i++; continue; }
    if (mode === "block") {
      if (c === "*" && d === "/") { mode = "code"; i += 2; continue; }
      if (c === "\n") put("\n", "\n");
      i++; continue;
    }
    if (mode === "sq" || mode === "dq") {
      if (c === "\\") { put(src.slice(i, i + 2), "  "); i += 2; continue; }
      if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"')) { put(c, c); mode = "code"; lastSig = c; i++; continue; }
      put(c, c === "\n" ? "\n" : " "); i++; continue;
    }
    if (c === "\\") { put(src.slice(i, i + 2), "  "); i += 2; continue; }
    if (c === "`") { put(c, c); tmpl.pop(); mode = "code"; lastSig = c; i++; continue; }
    if (c === "$" && d === "{") { put("${", " {"); tmpl[tmpl.length - 1] = 1; mode = "code"; lastSig = "{"; i += 2; continue; }
    put(c, c === "\n" ? "\n" : " "); i++;
  }
  return { stripped, code };
}

const METHOD_RE = /^  (?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;
const FN_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/;
const CONST_FN_RE = /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(|function)/;
const spansFrom = (lines, marks) => {
  const out = new Map();
  for (let k = 0; k < marks.length; k++) {
    const span = { from: marks[k].line, to: k + 1 < marks.length ? marks[k + 1].line : lines.length };
    if (out.has(marks[k].name)) out.get(marks[k].name).push(span);
    else out.set(marks[k].name, [span]);
  }
  return out;
};
const methodsOf = (lines, startLine) => {
  const marks = [];
  for (let i = startLine; i < lines.length; i++) {
    const m = METHOD_RE.exec(lines[i]);
    if (m) marks.push({ name: m[1], line: i });
  }
  return spansFrom(lines, marks);
};
const topLevelFns = (lines) => {
  const marks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = FN_RE.exec(lines[i]) || CONST_FN_RE.exec(lines[i]);
    if (m) marks.push({ name: m[1], line: i });
  }
  return spansFrom(lines, marks);
};
const CALL_RE = /(?:this|Store)\.(#?[A-Za-z_$][\w$]*)\s*\(|(?:^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g;
const callsIn = (body) => {
  const found = new Set(); let m; CALL_RE.lastIndex = 0;
  while ((m = CALL_RE.exec(body))) found.add(m[1] || m[2]);
  return found;
};
/* JS keywords and platform globals a bare-call regex necessarily picks up.
   They are excluded from the UNRESOLVED report because they are not functions
   this repository defines — and the report is required to be EMPTY of anything
   else, which is the difference between naming what the matcher could not
   classify and silently scoring it zero. */
const NOT_A_CALLEE = new Set(["if", "for", "while", "switch", "catch", "return", "typeof",
  "function", "await", "new", "do", "else", "in", "of", "case", "void", "delete", "yield",
  "String", "Number", "Boolean", "Array", "Object", "Map", "Set", "JSON", "Math", "Date",
  "RegExp", "Error", "Promise", "Symbol", "BigInt", "parseInt", "parseFloat", "isNaN",
  "Uint8Array", "Int32Array", "TextEncoder", "TextDecoder", "structuredClone", "require"]);

/* THE RECOGNISER, AND IT IS A PRINCIPLE RATHER THAN A LIST OF SPELLINGS. A site
   READS the sufficiency attribution if the FIELD NAME occurs anywhere in it in
   any syntactic position — `x.asserted_by`, `x["asserted_by"]`, `{ asserted_by }`,
   a SELECT list, a frontmatter key, an interpolated string — or if it asks any
   catalog export that itself reads it. The second half is COMPUTED (the closure
   crosses into `bio-checks.mjs` and the same test applies there), never typed,
   because a list of three predicate names goes stale the day a fourth is
   written. */
const FIELD_RE = /\basserted_by\b/;

function reachFrom(storeRaw, checksRaw, roots) {
  const s = scan(storeRaw), c = scan(checksRaw);
  const sStripped = s.stripped.split("\n"), sCode = s.code.split("\n");
  const cStripped = c.stripped.split("\n"), cCode = c.code.split("\n");
  const classAt = sStripped.findIndex((l) => /^export class Store extends DurableObject/.test(l));
  const marksIn = (lines) => [...methodsOf(lines, classAt).keys()].sort().join(",");
  const desync = marksIn(sStripped) !== marksIn(sCode);
  const methods = methodsOf(sCode, classAt);
  const checkFns = topLevelFns(cCode);
  const text = (f, sp) => (f === "store" ? sStripped : cStripped).slice(sp.from, sp.to).join("\n");
  const code = (f, sp) => (f === "store" ? sCode : cCode).slice(sp.from, sp.to).join("\n");
  const universe = new Map();
  for (const [n, spans] of methods) universe.set("Store." + n, { file: "store", spans });
  for (const [n, spans] of checkFns) if (!universe.has(n)) universe.set(n, { file: "checks", spans });

  const seen = new Set(), unresolved = new Set(), queue = [...roots];
  while (queue.length) {
    const cur = queue.shift();
    if (seen.has(cur)) continue;
    seen.add(cur);
    const ent = universe.get(cur);
    if (!ent) continue;
    for (const sp of ent.spans)
      for (const call of callsIn(code(ent.file, sp))) {
        if (NOT_A_CALLEE.has(call)) continue;
        const m = "Store." + call;
        if (universe.has(m)) { if (!seen.has(m)) queue.push(m); }
        else if (universe.has(call)) { if (!seen.has(call)) queue.push(call); }
        else unresolved.add(call);
      }
  }
  const readers = [];
  const props = new Set();
  const PROP_RE = /\.([A-Za-z_$][\w$]*)/g;
  for (const name of seen) {
    const ent = universe.get(name);
    if (!ent) continue;
    for (const sp of ent.spans) {
      if (FIELD_RE.test(text(ent.file, sp))) readers.push(`${name}@${sp.from + 1}`);
      const body = code(ent.file, sp); let m; PROP_RE.lastIndex = 0;
      while ((m = PROP_RE.exec(body))) props.add(m[1]);
    }
  }
  /* WHAT THE MATCHER COULD NOT RESOLVE, CLASSIFIED RATHER THAN LISTED. A name
     is explained if the span DECLARES it — as a method (the `#name(` on its own
     declaration line is picked up by the bare-call branch), or as a local
     binding. Anything left is genuinely unknown and is NAMED. */
  const declaredSomewhere = (nm) => {
    for (const name of seen) {
      const ent = universe.get(name);
      if (!ent) continue;
      for (const sp of ent.spans) {
        const body = code(ent.file, sp);
        if (new RegExp(`(?:const|let|var|function)\\s+${nm}\\b`).test(body)) return "local binding";
        if (new RegExp(`^\\s*(?:static\\s+)?(?:async\\s+)?#?${nm}\\s*\\(`, "m").test(body)
            && universe.has("Store.#" + nm)) return "its own declaration line";
      }
    }
    return null;
  };
  const explained = {}, unknown = [];
  for (const nm of [...unresolved].sort()) {
    const why = declaredSomewhere(nm);
    if (why) (explained[why] ??= []).push(nm); else unknown.push(nm);
  }
  const walkCallers = [];
  for (const [n, spans] of methods)
    for (const sp of spans) if (callsIn(code("store", sp)).has("#strengthWalk"))
      walkCallers.push(`${n}@${sp.from + 1}`);
  return { closure: [...seen].sort(), readers, unresolved: [...unresolved].sort(),
           explained, unknown, walkCallers, methodCount: methods.size,
           checkFnCount: checkFns.size, desync, props: [...props].sort(),
           sStripped, sCode, methods, universe, text, code, classAt };
}

const STORE_RAW = readFileSync(SRC("store.mjs"), "utf8");
const CHECKS_RAW = readFileSync(CHK, "utf8");
const SCHEMA_RAW = readFileSync(SRC("schema.mjs"), "utf8");

try {

/* ==================================================================== 0 */
console.log("--- 0. the corpus, and the instrument's own defect first ---");

const R = reachFrom(STORE_RAW, CHECKS_RAW, ["Store.#strengthWalk"]);
console.log(`  CORPUS  store.mjs ${STORE_RAW.split("\n").length} lines · ${R.methodCount} methods`
          + ` · bio-checks.mjs ${R.checkFnCount} top-level functions`);
t("the scanner's two outputs agree on where the methods are — a desync here is the INSTRUMENT "
  + "wrong, and it was, before the regex arm existed",
  R.desync, false);
/* FLOORS, not equalities: both files grow. A floor catches the instrument
   silently reading a truncated or unparsed file, which is what an assertion
   over an EMPTY corpus looks like from the outside. */
t("the method roster is non-empty and floored, so a headline over an empty corpus cannot pass",
  [R.methodCount > 300, R.checkFnCount > 80], [true, true]);
t("`#strengthWalk` is FOUND, so the walk this file is about is the walk it measured",
  R.closure.includes("Store.#strengthWalk"), true);

/* ==================================================================== 1 */
console.log("--- 1. THE REACH: nothing in the arithmetic reads the attribution ---");

console.log(`  CLOSURE (${R.closure.length}) ${R.closure.join(" ")}`);
t("the arithmetic closure is non-empty and floored — it is COMPUTED from `#strengthWalk`, "
  + "never listed, so a helper added tomorrow is swept without editing this file",
  [R.closure.length >= 8, R.closure.includes("Store.#axisResult"),
   R.closure.includes("Store.#groundResult"), R.closure.includes("Store.#weakestOf")],
  [true, true, true, true]);
t("NOT ONE FUNCTION IN THE ARITHMETIC NAMES THE FIELD — the measurement this item was "
  + "delegated, with its reach printed above",
  R.readers, []);

/* THE MATCHER PROVED SENSITIVE, over a source that DOES read it. A recogniser
   that finds nothing is worthless until it has found something. */
const MUTATED = STORE_RAW.replace(
  `                     ground: leg.ground ?? null };`,
  `                     ground: leg.ground ?? null, asserted_by: leg.asserted_by ?? null };`);
t("the mutation the sensitivity arm needs actually applied (an arm that never armed is a finding)",
  MUTATED !== STORE_RAW, true);
const RM = reachFrom(MUTATED, CHECKS_RAW, ["Store.#strengthWalk"]);
t("RE-RUN over a source that DOES read the field, the same recogniser FINDS it — so the zero "
  + "above is a measurement and not a walk looking in the wrong place",
  [RM.readers.length, RM.readers.map((x) => x.split("@")[0])], [1, ["Store.#strengthWalk"]]);

/* AND IT DOES NOT CITE PROSE. A sweep that reads its own comments would report
   a reader here, and this repository has already had a sweep arm fail by
   citing itself. */
const COMMENTED = STORE_RAW.replace(
  `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`,
  `  /* nothing here reads asserted_by, and this comment says so */\n`
  + `  #strengthWalk(bundleId, depth, bound, legsOverride = null) {`);
t("the comment-only mutation applied", COMMENTED !== STORE_RAW, true);
t("naming the field in a COMMENT inside the arithmetic does NOT register as a reader — the "
  + "comment-stripping is load-bearing, not decoration",
  reachFrom(COMMENTED, CHECKS_RAW, ["Store.#strengthWalk"]).readers, []);

/* THE WHOLE PROPERTY VOCABULARY, PRINTED. This is what the static arm CANNOT
   see stated as something a reader can check: it cannot tell an attribution
   arriving under an alias from an innocent property, so every property name
   the arithmetic touches is listed rather than summarised. The differential in
   §3 closes that hole from the other side, by VALUE and never by name. */
console.log(`  PROPERTY VOCABULARY (${R.props.length}) ${R.props.join(" ")}`);
t("the property vocabulary is non-empty and floored, and the field is not in it",
  [R.props.length >= 40, R.props.includes("asserted_by"), R.props.includes("ground"),
   R.props.includes("grade")],
  [true, false, true, true]);

console.log(`  UNRESOLVED (${R.unresolved.length}) ${R.unresolved.join(" ") || "(none)"}`);
for (const [why, names] of Object.entries(R.explained)) console.log(`    ${why}: ${names.join(" ")}`);
t("every callee name the matcher could not resolve is EXPLAINED — nothing is silently scored "
  + "zero, and the genuinely-unknown bucket is what has to be empty",
  R.unknown, []);

/* ==================================================================== 2 */
console.log("--- 2. THE SUPPLY: what a leg can even carry when it reaches the arithmetic ---");

console.log(`  CALL SITES OF #strengthWalk: ${R.walkCallers.join(", ")}`);
t("there are exactly FOUR call sites — the walk's own recursion and THREE suppliers — so the "
  + "supply is enumerable rather than assumed",
  [R.walkCallers.length, R.walkCallers.map((x) => x.split("@")[0])],
  [4, ["#strengthWalk", "strengthOf", "versionStrength", "suggestVersion"]]);

/* NO SQL COLUMN CARRIES IT, on either table the arithmetic reads from. Asserted
   over the schema's own text, and asserted in BOTH directions: the `connections`
   table DOES have a column of that name — a different fact about a different
   thing — so a pin that could not tell the two apart would pass vacuously here. */
const schema = scan(SCHEMA_RAW).stripped;
const tableBody = (name) => {
  const m = new RegExp(`CREATE TABLE IF NOT EXISTS ${name} \\(([\\s\\S]*?)\\n\\);`).exec(schema);
  return m ? m[1] : null;
};
const hasCol = (tbl, col) => {
  const b = tableBody(tbl);
  return b === null ? "NO SUCH TABLE" : new RegExp(`^\\s*${col}\\s`, "m").test(b);
};
t("neither table the arithmetic reads legs from projects the attribution — AND the pin can "
  + "tell them from `connections`, which carries a column of that name about a different fact",
  [hasCol("inquiry_basis", "asserted_by"), hasCol("inquiry_basis_version_legs", "asserted_by"),
   hasCol("connections", "asserted_by")],
  [false, false, true]);
t("the schema states the omission on purpose rather than by oversight, at the `inquiry_basis` site",
  /THE ATTRIBUTION IS NOT PROJECTED HERE/.test(SCHEMA_RAW), true);

/* THE THIRD SUPPLIER BUILDS ITS LEGS AS A LITERAL, so its field set is
   readable directly. Named here because it is the one supply route that does
   NOT come from a SELECT list and therefore could carry anything a caller
   handed the endpoint. */
const walkLegsLit = /const walkLegs = legsIn\.map\(\(l, k\) => \(\{([\s\S]*?)\}\)\);/.exec(scan(STORE_RAW).stripped);
t("`op=suggest`'s candidate legs are built as a CLOSED literal and the attribution is not one "
  + "of its keys — the one supply route a caller's own bytes could otherwise ride in on",
  [walkLegsLit !== null, walkLegsLit ? FIELD_RE.test(walkLegsLit[1]) : "NOT FOUND"],
  [true, false]);

/* ==================================================================== 3 */
console.log("--- 3. THE DIFFERENTIAL, DRIVEN, over SEVERAL grounds and at BOTH altitudes ---");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl20", MEMBER_TOKEN: "mem-pl20", PROBE_TOKEN: "prb-pl20", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl20",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const AT1 = "2026-08-05T09:00:00Z", AT2 = "2026-08-07T17:31:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.ground ? [`    ground: ${l.ground}`] : [])])]
  : [];
const groundLines = (rows) => rows === null ? [] : rows.length
  ? ["grounds:", ...rows.flatMap((r) => [`  - ground: ${r.ground}`,
      `    asserted_by: ${r.by ?? "carol"}`, `    at: "${r.at ?? AT1}"`,
      ...(r.statement ? [`    statement: "${r.statement}"`] : [])])]
  : ["grounds: []"];
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [],
                         grounds = null, subject = null, versions = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...legLines(legs), ...groundLines(grounds), ...(versions ?? []),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let seq = 0;
const promote = async (id, text, type, base = null, reading = null) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return POST(`op=promote&token=${RUTH}`, {
    bundleId: id, base,
    snapKey: `20260809T${String(100000 + (++seq)).slice(-6)}Z_${sha(String(seq)).slice(0, 8)}`,
    files,
    register: type === "information" && !reading
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
      : reading
      ? [{ path: "snapshots/d.bin", sha256: reading.capture.sha256, encoding: "binary", bytes: 10 }]
      : [],
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW, last_updated: LATER } });
};
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

/* ---- 3a. THE FINDING ALTITUDE: `grounds[].asserted_by`, C-2.8's field ---- */

const CH_CAP = "INFO-2026-4000-charter-cap", CH_CON = "INFO-2026-4000-charter-con";
const CO_CAP = "INFO-2026-4000-code-cap", CO_CON = "INFO-2026-4000-code-con";
const PR_CON = "INFO-2026-4000-practice-con";
for (const d of [CH_CAP, CH_CON, CO_CAP, CO_CON, PR_CON]) await mustPromote(d, infoMd(d), "information");

const HUNCH = { author: "ruth", date: "2026-08-05" };
const leg = (target, grade, axis, ground, source = axis === "capture" ? "capture" : "hunch") =>
  ({ target, role: "supports", grade, axis, source, ...(source === "hunch" ? HUNCH : {}), ground });

/* THREE parts, not two, because DEC-65's delegation says SEVERAL and a
   two-part fixture cannot tell "the maximum ignored one part" from "the
   maximum ignored the attribution". Capture and connection are set by
   DIFFERENT parts, so a single composed answer could not pass either. */
const LEGS = [
  leg(CH_CAP, "B", "capture", "charter"), leg(CH_CON, "C", "connection", "charter"),
  leg(CO_CAP, "C", "capture", "code"), leg(CO_CON, "A", "connection", "code"),
  leg(PR_CON, "D", "connection", "practice"),
];
const TARGETS = LEGS.map((l) => l.target);
const INQ = "INQ-2026-4000-three-parts";

const A_ROWS = [{ ground: "charter" }, { ground: "code" }, { ground: "practice" }];
await mustPromote(INQ, inquiryMd(INQ, { refs: TARGETS, legs: LEGS, grounds: A_ROWS }), "inquiry");
const pairOf = async (id) => {
  const r = await GET(`op=inquirystrength&token=${RUTH}&id=${id}`);
  return { capture: r?.capture ?? null, connection: r?.connection ?? null };
};
const P1 = await pairOf(INQ);
t("the fixture is NOT degenerate: both axes are graded, they read DIFFERENT letters, and the "
  + "letters are set by DIFFERENT parts — so the maximum is doing visible work",
  [P1.capture?.state, P1.capture?.grade, P1.capture?.weakest?.target_id,
   P1.connection?.state, P1.connection?.grade, P1.connection?.weakest?.target_id],
  ["graded", "B", CH_CAP, "graded", "A", CO_CON]);

/* THE SAME FIVE LEGS AND THE SAME THREE LABELS, with every attribution fact
   changed: a different member on each part, different dates, a statement added,
   and the rows in a different order. Nothing the record says about WHO claimed
   what survives this rewrite. */
const B_ROWS = [
  { ground: "practice", by: "dave", at: AT2, statement: "Long-settled practice would answer it alone." },
  { ground: "charter", by: "gus", at: AT2 },
  { ground: "code", by: "ruth", at: AT1, statement: "The code section is sufficient by itself." },
];
await mustPromote(INQ, inquiryMd(INQ, { refs: TARGETS, legs: LEGS, grounds: B_ROWS }),
                  "inquiry", await shaOf(INQ));
const P2 = await pairOf(INQ);
t("EVERY attribution fact rewritten across THREE parts — different members, dates, statements, "
  + "row order — and the pair does not move by one byte. This is the measurement DEC-65's step "
  + "three was delegated, driven through `op=inquirystrength` and never named the field",
  JSON.stringify(P2) === JSON.stringify(P1), true);

/* SENSITIVITY. The identical comparison over a changed LABEL must MOVE the
   pair — otherwise the two equalities above cost nothing to produce and are
   not evidence of anything. */
const MERGED = LEGS.map((l) => l.ground === "code" ? { ...l, ground: "charter" } : l);
await mustPromote(INQ, inquiryMd(INQ, { refs: TARGETS, legs: MERGED,
    grounds: [{ ground: "charter" }, { ground: "practice" }] }), "inquiry", await shaOf(INQ));
const P3 = await pairOf(INQ);
t("SENSITIVITY: change what the arithmetic DOES read — the part LABEL — and the pair moves on "
  + "BOTH axes. The equalities above are therefore a finding and not a free agreement",
  [JSON.stringify(P3) === JSON.stringify(P1), P3.capture?.grade, P3.connection?.grade],
  [false, "C", "C"]);

/* ---- 3b. THE VERSION ALTITUDE: `basis_version_grounds[].asserted_by` ----
   DEC-65's OWN field, `C-25.6`'s, read through `op=versionstrength`. The letters
   here are EARNED from `earnedBasisRegistry` rather than authored, so this arm
   needs real captures and resolutions — which is also what makes it a different
   route to the same answer rather than the same fixture twice. */

const eOrd = await POST(`op=entitycreate&token=${RUTH}`,
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
const V_A1 = "INFO-2026-4100-key-one", V_A2 = "INFO-2026-4100-key-two", V_C1 = "INFO-2026-4100-name-only";
const CAP = Object.fromEntries([V_A1, V_A2, V_C1].map((d) => [d, sha(`capture-of-${d}`)]));
const byKey = { ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" };
const byName = { ref: "ordinance:99999", kind: "ordinance", key: "99999",
                 label: "Sewer Fund Transfer Ordinance" };
const readingOf = (s, ents) => ({ capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: ents.length > 0,
             at: NOW, entities: ents } });
for (const [d, e] of [[V_A1, byKey], [V_A2, byKey], [V_C1, byName]])
  await mustPromote(d, infoMd(d), "information", null, readingOf(CAP[d], [e]));
for (const d of [V_A1, V_A2, V_C1]) await POST(`op=resolve&token=${RUTH}`, { captureSha: CAP[d] });

const VINQ = "INQ-2026-4100-version-parts";
const scalarLine = (k, v) => v === undefined ? [] : v === null ? [`    ${k}: null`] : [`    ${k}: "${v}"`];
/* THE SAME FIVE LEGS AND THE SAME TWO LABELS FOR EVERY VERSION. Only the
   attribution differs between them, which is the whole experiment. */
const V_LEGS = [
  { g: "the ordinance record", target: V_A1, axis: "connection", source: "resolution", grade: "A" },
  { g: "the ordinance record", target: V_C1, axis: "connection", source: "resolution", grade: "C" },
  { g: "the second record", target: V_A2, axis: "connection", source: "resolution", grade: "A" },
  { g: "the ordinance record", target: V_A1, axis: "capture", source: "capture", grade: "B" },
  { g: "the second record", target: V_A2, axis: "capture", source: "capture", grade: "C" },
];
const versionBlock = (versions) => ["basis_versions:",
  ...versions.map((v) => [`  - name: "${v.name}"`, ...scalarLine("description",
      "Two records either of which would carry the answer, measured over what the record earns."),
    ...scalarLine("relationship", v.relationship ?? "or"), ...scalarLine("state", "accepted"),
    ...scalarLine("derived_from", null), "    hidden: false",
    ...scalarLine("author", "ruth"), ...scalarLine("at", NOW),
    ...scalarLine("state_by", "ruth"), ...scalarLine("state_at", LATER)].join("\n")),
  "basis_version_grounds:",
  ...versions.flatMap((v) => v.grounds.map((g) => [`  - version: "${v.name}"`,
    ...scalarLine("ground", g.ground), ...scalarLine("asserted_by", g.by ?? "ruth"),
    ...scalarLine("at", g.at ?? AT1),
    ...(g.statement ? scalarLine("statement", g.statement) : [])].join("\n"))),
  "basis_version_legs:",
  ...versions.flatMap((v) => V_LEGS.filter((l) => !v.legsIn || l.g === v.legsIn).map((l) => [`  - version: "${v.name}"`,
    ...scalarLine("target", l.target), ...scalarLine("role", "supports"),
    ...scalarLine("ground", l.g), ...scalarLine("grade", l.grade),
    ...scalarLine("grade_axis", l.axis), ...scalarLine("grade_source", l.source)].join("\n")))];

/* TWO READINGS RATHER THAN ONE REWRITTEN, AND THAT IS A MEASUREMENT THIS ITEM
   DID NOT EXPECT: a version is FROZEN once written (C-25.11) and its frozen
   COMPOSITION STRING INCLUDES the attribution row per part
   (`ground\t<label>\t<asserted_by>\t<at>\t<statement>`), so an attribution-only
   edit is refused in place and named as `ground changed`. That is asserted
   below rather than merely worked around, because it is a second and
   independent reason the third state cannot move a stored version's pair. */
const V_A = { name: "the reading",
              grounds: [{ ground: "the ordinance record" }, { ground: "the second record" }] };
const V_B = { name: "the same legs other hands",
              grounds: [{ ground: "the second record", by: "gus", at: AT2,
                          statement: "The second record settles it alone." },
                        { ground: "the ordinance record", by: "dave", at: AT2 }] };
await mustPromote(VINQ, inquiryMd(VINQ, { subject: ORD, refs: [V_A1, V_A2, V_C1],
  versions: versionBlock([V_A, V_B]) }), "inquiry");
const vPair = async (name) => {
  const r = await GET(`op=versionstrength&token=${RUTH}&id=${VINQ}&version=${encodeURIComponent(name)}`);
  return { ok: r?.ok ?? false, pair: r?.pair ?? null };
};
const V1 = await vPair(V_A.name);
t("the version fixture computes a real pair over TWO parts, with the two axes reading DIFFERENT "
  + "letters — the maximum over parts is what sets the connection axis",
  [V1.ok, V1.pair?.capture?.state, V1.pair?.capture?.grade,
   V1.pair?.connection?.state, V1.pair?.connection?.grade],
  [true, "graded", "B", "graded", "A"]);
const V2 = await vPair(V_B.name);
t("DEC-65's OWN FIELD, differing across both parts of an otherwise identical reading — "
  + "different members, dates, a statement, the rows in the other order — and "
  + "`op=versionstrength` answers the identical pair",
  JSON.stringify(V2.pair) === JSON.stringify(V1.pair), true);

/* AND THE ATTRIBUTION IS INSIDE THE FREEZE. Driven, not read off the source:
   re-promote `the reading` with nothing changed but who asserted one of its
   parts, and the write is refused BY NAME. */
const frozen = await promote(VINQ, inquiryMd(VINQ, { subject: ORD, refs: [V_A1, V_A2, V_C1],
  versions: versionBlock([{ ...V_A, grounds: [{ ground: "the ordinance record", by: "gus" },
                                              { ground: "the second record" }] }, V_B]) }),
  "inquiry", await shaOf(VINQ));
t("an attribution-ONLY edit to a stored reading is REFUSED as an edit to a frozen version — so "
  + "at this altitude the field cannot even be rewritten, let alone move a pair",
  [frozen.ok, frozen.reason, String(frozen.changed ?? "")],
  [false, "VERSION_FROZEN", "ground changed"]);

/* ==================================================================== 4 */
console.log("--- 4. WHAT THE LICENCE ACTUALLY RESTS ON: a write-time fact, not an arithmetic one ---");

/* The arithmetic is attribution-blind. So the sentence *the maximum is never
   taken over a part nobody claimed* is true only because a GATE refuses to
   store one — and ON THIS TREE NO GATE DOES.
   ===================================================================
   THE THREE ASSERTIONS BELOW PIN A DEFECT AND ARE WRITTEN TO FAIL THE MOMENT
   PL-19 IS INTEGRATED, which is PL-17's own idiom one step on. They were RIGHT
   WHEN WRITTEN (2026-08-09, PL-20, measured on `main` at 1081a6a with PL-17
   landed and PL-19 committed-but-unmerged) and the integrator CORRECTS them to
   the refusal rather than exempting them.
   WHAT WAS MEASURED, AND IT IS THIS ITEM'S UNEXPECTED FINDING. `C-25.6`'s
   member arm asks `isMachineIdentity`, and PL-17 minted the no-claim value in
   a namespace that is deliberately NEITHER `token:` NOR `class:` — so the
   value is not a machine stamp, it is not blank, and the arm reads it as A
   NAMED MEMBER. PL-17 recorded that of the ONE-part case and pinned it; nobody
   measured it over SEVERAL parts, which is exactly the question DEC-65's step
   three was delegated. Over several parts it is not a harmless inertness: the
   maximum IS taken over a part whose own row says outright that nobody claimed
   it, and the reading is reported ONE WHOLE GRADE STRONGER on the connection
   axis than the parts anybody signed for support.
   PL-19 closes it — its `C-25.6` refuses the value on two or more parts — so
   this is a window that exists only until step two lands, not a design gap.
   =================================================================== */
const TWO_PART_UNCLAIMED = { name: "the unclaimed reading",
  grounds: [{ ground: "the ordinance record" },
            { ground: "the second record", by: SUFFICIENCY_UNCLAIMED }] };
/* The counterfactual, so the harm is a DIFFERENCE and not an adjective: the
   same reading with only the part somebody actually signed for. */
const CLAIMED_ONLY = { name: "only the part somebody signed for",
  grounds: [{ ground: "the ordinance record" }], legsIn: "the ordinance record",
  /* ONE part composes as AND, and C-25.4 refuses a reading whose stated
     relationship is not the one its structure actually has. */
  relationship: "and" };
const admitted = await promote(VINQ, inquiryMd(VINQ, { subject: ORD, refs: [V_A1, V_A2, V_C1],
  versions: versionBlock([V_A, V_B, TWO_PART_UNCLAIMED, CLAIMED_ONLY]) }),
  "inquiry", await shaOf(VINQ));
t("PINNED DEFECT (correct at integration): a TWO-part reading one of whose parts carries the "
  + "explicit no-claim value is ADMITTED at the write on this tree — `C-25.6`'s member arm asks "
  + "`isMachineIdentity`, and the minted value is deliberately not a machine stamp",
  [admitted.ok === true, String(admitted.reason ?? "")], [true, ""]);
const VU = await vPair(TWO_PART_UNCLAIMED.name);
const VC = await vPair(CLAIMED_ONLY.name);
t("PINNED DEFECT (correct at integration): and the harm is a DIFFERENCE, not an adjective — the "
  + "maximum IS taken over the part nobody claimed, and it is the part that SETS the connection "
  + "axis, so the reading reports A where the parts anybody signed for support only C",
  [VU.pair?.connection?.grade, VU.pair?.connection?.weakest?.target_id,
   VC.pair?.connection?.grade],
  ["A", V_A2, "C"]);
t("PINNED DEFECT (correct at integration): and nothing in the answer says so — the pair carries "
  + "no state, no count and no sentence distinguishing a part a member signed for from one whose "
  + "own row says nobody did, because the arithmetic never saw the field",
  [JSON.stringify(VU.pair).includes("independent-sufficiency"),
   JSON.stringify(VU.pair).includes("unclaimed")],
  [false, false]);

/* THE ONE PREDICATE, AND THE OVER-STRICTNESS ARM WITH IT. `isSufficiencyClaimed`
   is TRUE for a named member and for nothing else. A member's claim in a
   spelling nobody anticipated must still read as a member's claim — including
   one whose NAME CONTAINS the minted literal, which a substring matcher would
   swallow. */
const SPELLINGS = ["ruth", "Ruth O'Brien-Kaur", "ruth@believeinoakland.org", "Ruth  ",
                   "Ruth Núñez", "俊 ruth", "none-of-the-above",
                   "none:independent-sufficiency-analyst", "ruth (acting chair)"];
t("OVER-STRICTNESS: every one of these is a genuine member's claim and reads as one, including "
  + "a member whose name CONTAINS the minted no-claim literal",
  SPELLINGS.map(isSufficiencyClaimed), SPELLINGS.map(() => true));
t("and the three states stay three: the minted value in any case is UNCLAIMED, blank is "
  + "UNSTATED, a machine stamp is neither, and none of them is a member's claim",
  [sufficiencyClaimState(SUFFICIENCY_UNCLAIMED), sufficiencyClaimState("None:Independent-Sufficiency"),
   sufficiencyClaimState(""), sufficiencyClaimState("  "), sufficiencyClaimState("class:ai"),
   isMachineIdentity(SUFFICIENCY_UNCLAIMED),
   Object.keys(SUFFICIENCY_CLAIM_STATES).sort()],
  ["unclaimed", "unclaimed", "unstated", "unstated", "machine_stamped", false,
   ["claimed", "machine_stamped", "unclaimed", "unstated"]]);

/* ==================================================================== 5 */
console.log("--- 5. the licence, closed, and the sentence stated as a measurement ---");
t("DEC-65's licence is CLOSED at the arithmetic: the field cannot reach it, so the third state "
  + "cannot move a pair — over ONE part or SEVERAL — and nothing further is owed to the "
  + "arithmetic. What is owed, and is not new, is that the WRITE gates stay whole",
  [R.readers.length, R.props.includes("asserted_by"),
   JSON.stringify(P2) === JSON.stringify(P1), JSON.stringify(V2) === JSON.stringify(V1)],
  [0, false, true, true]);

await mf.dispose();
} catch (e) {
  console.log(`  FAIL  the suite THREW before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}

/* THE FOOT. A suite that dies mid-file reports a clean tally it never earned,
   so this line is the receipt that the run reached the end. */
console.log(`\ndec65-strength-reach: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
