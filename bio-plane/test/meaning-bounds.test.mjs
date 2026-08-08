/* NEGATIVE CONTROL: (run 2026-08-08, rec67-agent, REC-67) ONE arm, this file's share of REC-67's
   six, armed ALONE and restored from a PRISTINE copy verified by sha256 AND by `cmp`.
   Baseline 83/0. RESTORE THE STRING-TRIM ADMISSION — `const collectionExpr = (v) =>
   ARRAY_EXPR.test(String(v))`, dropping `deTrim`, so a `.slice(` on a trimmed STRING is read as
   a collection again -> **80/3**: the REC-67 both-directions guard fails, the bare-roster
   CEILING fails at 40 of 39 with the walk PRINTING `BARE … 40 ops` and `OPAQUE … 9 ops`, and the
   NAMED opaque residual fails missing `thread->threadInstance`. The failure NAMES the op, which
   is what makes this a pin rather than a count. Note the FLOOR arm stays green under this arm by
   design — a floor cannot catch a roster that GREW, which is what the ceiling is for. To re-run:
   make that one substitution, run this suite, restore. */
/* NEGATIVE CONTROL: (run 2026-08-07, rec70-agent, REC-70) FIVE arms, every file restored and
   verified by CONTENT as well as sha256. THE SUBJECT IS THE WALK'S REACH, not one op.
   (1) RESTORE THE UNBOUNDED READ — in src/store.mjs `aiRunLog`, drop `LIMIT ?` and the
   `cap + 1` argument, drop the `limit:`/`truncated:` keys from both returns, and drop the
   `.slice(0, cap)`. THE ARM THAT PROVES THE BLINDNESS IS FIXED, and it must fail for the
   RIGHT REASON: the walk prints `op=airunlog -> aiRunLog [entries]` back on the BARE roster
   and the RATCHET fails at 41 of a ceiling of 40, so the failure NAMES the op with no list
   to add it to; the D-227 SQL-bound pin and every live arm name it too.
     MEASURED: meaning-bounds 68/13, bounds 108/4 — the walk printed
     `op=airunlog -> aiRunLog [entries]` on the BARE roster and the RATCHET failed at
     **41 of a ceiling of 40**. `airun.test.mjs` stayed GREEN, which is the finding
     inside the control: that suite drives the op at six sites and none asks for more
     than 200 rows, so the op's OWN suite could never have caught this.
     (1b) AND THE D-227 VARIANT, run separately because it fails DIFFERENTLY: drop ONLY
     `LIMIT ?`/`cap + 1` and leave the envelope honest. MEASURED: **meaning-bounds 80/1
     and bounds 112/0 — FULLY GREEN except the one direct SQL-bound pin.** The walk
     grades what a method PUBLISHES, so an honest envelope over an unbounded scan reads
     as bounded — D-227's open finding, reproduced here on a second op. That single
     surviving arm is the whole reason the SQL pin exists beside the roster verdict.
   (2) A SECOND OP THE WALK CANNOT REACH — `ncOpaqueRead`, which scans `ai_run_log`, pushes
   the rows into a local through a `for…of` this reader cannot follow, publishes only a
   count, and IS dispatched. MEASURED: **2 fail, both REACH/OPAQUE arms, at 9 of 8 and
   naming `ncopaque->ncOpaqueRead`.** Every other arm stayed green, which is the point:
   the tripwire fired on reach alone, with no collection and no bound involved.
   (3) NEUTER THE WALK — `if (1) return out;` at the head of `collectionReads`. MEASURED:
   **20 fail**, corpus PRINTED AS ZERO (`0 publishing a collection, reaching 0 ops`;
   `REACH: 0 of 156 DISPATCHED ops judged`; BARE 0), every REACH-AS-A-DELTA arm among them.
   **AND THE RATCHET CEILING STAYED GREEN AT 0 OF 40** — a ceiling passes trivially over
   nothing, which is exactly how REC-60's 27 survived a walk that could see 55 of 156 ops.
   The FLOOR is what fires, and this control is why it exists.
   (4) OVER-STRICTNESS — four arms in the last block, all PASSING on the clean tree, two of
   them REC-70's own: success spelled `found: true` (graded BOUNDED) and success spelled with
   NO marker (graded BARE); plus a refusal carrying a list, still NOT graded.
   (5) POLARITY on the marker inversion — restore `if (!/ok: true/.test(ro)) continue;`.
   MEASURED: **7 fail** — `op=airunlog` returns to the OPAQUE bucket (the exact state REC-60
   shipped in and CONDUCT found by hand), the OPAQUE ceiling fails at 9 of 8, the RATCHET
   FLOOR fails, and BOTH REC-70 over-strictness arms go red. **The RATCHET CEILING stayed
   green here too.**
   EVERY ARM: anchor guarded unique before mutation, bytes asserted changed, and every file
   restored and verified by CONTENT and sha256 (driver kept out of the suite tree).
   ---- REC-60's own controls, retained verbatim; still re-runnable ---------------------------
   (run 2026-08-07, rec60-agent, REC-60/D-225) FOUR arms, SIX runs, every
   file restored BYTE-IDENTICALLY (sha256 compared after each).
   (1) RESTORE EACH UNBOUNDED READ, run once PER OP so each names its own — in src/store.mjs
   drop the `LIMIT ?` and its `cap + 1` argument and remove the `limit:`/`truncated` keys.
     (1a) resolutionsForCapture -> 17 fail (bounds 4, meaning-bounds 13). The WALK PRINTS
          `op=resolutions -> resolutionsForCapture [resolutions]` back on the BARE roster and
          the RATCHET fails at 28 of a ceiling of 27, so the failure NAMES the op with no list
          to add it to; every live arm names it too.
     (1b) documentsConcerning -> 16 fail (bounds 4, meaning-bounds 12), including the
          VIEWER-INDEPENDENCE arm and the FIXTURE arm that proves the same record answers a
          bound of 4 completely on op=concerns and CUT on op=connections.
     (1c) connectionsFor (both arms) -> 15 fail (bounds 4, meaning-bounds 11).
   (2) COUNT WHAT IT SENT — `const truncated = false;` beside a real slice, so `count` equals
   what was SENT while more exists. Run twice because the sharpest arm lives on one op:
     (2a) documentsConcerning -> 4 fail (bounds 2, meaning-bounds 2), both DELTA arms.
     (2b) resolutionsForCapture -> 5 fail (bounds 2, meaning-bounds 3), headed by
          **"SAME-COUNT DELTA: `count` cannot tell them apart, and `truncated` can — the two
          must never read alike"**, which is this control's own arm firing on its own subject.
     NOTE, and it is the finding: THE WALK STAYS GREEN UNDER (2). The scan is still bounded —
     what broke is HONESTY, not BOUNDEDNESS — so only the LIVE arms catch it. The two
     instruments answer different questions and neither substitutes for the other.
   (3) NEUTER THE WALK — `if (1) return out;` at the head of `collectionReads` -> 13 fail with
   the corpus PRINTED AS ZERO on all four lines (`0 publishing a collection, reaching 0 ops`;
   BARE/BOUNDED/UNJUDGED all 0), every REACH-AS-A-DELTA arm among them and every
   OVER-STRICTNESS arm too, which is what proves those are armed rather than decorative.
     (3a) AND THE CONTROL FOUND A DEFECT IN THE INSTRUMENT RATHER THAN CONFIRMING IT: on the
          first run the spelling arm THREW on `.bound` of undefined and DIED, hiding every arm
          behind it — D-93's class inside a control, for the fourth recorded time. That read is
          null-tolerant now and FAILS SAYING `WALK FOUND NO READ FOR op=…`; the counts above
          are the post-fix ones.
     (3b) AND THE FAILURE MODE THIS FILE NAMES REPRODUCED ITSELF: over the empty roster, both
          `the three named ops are NO LONGER bare` and the RATCHET **STAY GREEN** — a ceiling
          test passes trivially over nothing. That is why the delta arms exist and why the
          corpus is printed.
   (4) OVER-STRICTNESS — three arms in the last block, all PASSING on the clean tree: two
   correctly-enveloped reads in vocabularies this file never emits (`page_size`/`has_more`,
   `cap`/`next`) are NOT called bare, and the pre-REC-60 shape still IS. */
/* REC-60 · D-225 — THE WALK STARTS FROM RETURN SHAPES, BECAUSE THAT IS THE DIRECTION
 * REC-57'S INSTRUMENT COULD NOT SEE FROM.
 * ============================================================================
 *
 * `store.mjs:resolutionsForCapture`, `documentsConcerning` and `connectionsFor` returned
 * UNBOUNDED arrays — no limit, no paging, no truncation marker — and they were not on
 * REC-57's bounded-ops roster. NOT because that roster was careless: it enumerated ops
 * WITH ENVELOPES, by finding methods that CARRY A CAP. **An op with no envelope at all is
 * invisible to the instrument that would have flagged it.** That is the covered-on-paper
 * failure arriving from a direction the walk could not see, and it is the whole reason
 * this file exists beside `bounds.test.mjs` rather than inside it.
 *
 * SO THIS WALK ASKS A DIFFERENT QUESTION. Not *what does this method clamp* but **what
 * does this method PUBLISH**: every method whose success answer carries a COLLECTION, and
 * then whether that collection has a bound and a completeness signal beside it. A method
 * that caps nothing is exactly what it is looking for, so the blind spot is inverted.
 *
 * IT READS TWO RETURN SHAPES, AND THE SECOND IS THE ONE THAT BITES:
 *   (a) an object literal with an array-valued key   — `{ ok: true, …, documents }`
 *   (b) a BARE ARRAY, returned as the whole answer   — `return this.#rows(q, …a)`
 * (b) is here because a walk that only reads object returns has REC-57's blind spot in a
 * new costume: `op=projection`'s defect was a bare array, and `op=list` still answers one.
 * A roster that could not see a bare return could not see either.
 *
 * TWO DEFECTS, SEPARATED — and separating them is what decides the `op=list` rider:
 *   HONESTY     a bound APPLIED must be PUBLISHED. REC-57's discipline. `op=projection`
 *               violated it: capped at 200, silent, no parameter to ask past it.
 *   BOUNDEDNESS a response must not grow WITHOUT LIMIT. D-225's concern, and what the
 *               three reads above violated. `connections` grows k(k-1)/2 (D-224), so the
 *               most important entity produces the largest unbounded response.
 * They are not the same defect and a walk that conflates them reaches the wrong verdict on
 * `op=list`, whose unbounded bare-array arm is HONEST (it applies no bound, so it has none
 * to publish) and is DELIBERATE, documented, and required whole by three named consumers.
 * REC-60's decision is KEEP, with the reasoning at `store.mjs:listBundles` and the licence
 * PINNED HERE: a bare array is permitted only while it is COMPLETE.
 *
 * WHAT THIS WALK CANNOT SEE, said plainly rather than left to be discovered. It reads the
 * SOURCE of one file. A collection assembled in a helper and returned by its caller is
 * attributed to the helper; a method reached by a route other than the `op:` dispatch
 * arrow is not given an op name; and a collection whose growth is bounded by ONE PARENT
 * ROW (a progression's stages, a decision's deciders) is indistinguishable here from one
 * that grows with the record. That last judgement is NOT mechanical and this file does not
 * pretend to make it — the residual roster is PRINTED every run and ratcheted, so a NEW
 * member of the class fails the build even though the walk cannot grade the old ones.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ==========================================================================
 * THE WALK — every published collection, read off the plane's own source.
 * ========================================================================== */
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");

/* Block and line comments blanked before any anchor is matched. UI-35's class and
   REC-57's redraft: an anchor that matches PROSE measures the prose, and this file's own
   header names every op it is about. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) {
      const e = L.indexOf("*/", i);
      if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; }
      continue;
    }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");

/* Method segments, bounded by the NEXT signature — `bounds.test.mjs`'s segmenter, reused
   deliberately because it was MEASURED there: a brace matcher that does not skip comments
   swallowed 27,059 characters in UI-35's draft, and a boundary that cannot run past the
   next method cannot make that mistake. */
const segments = (code) => {
  const lines = code.split("\n");
  const sig = /^ {2}(?:static\s+|async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const m = sig.exec(lines[i]); if (m) heads.push([i, m[1]]); }
  const out = new Map();
  for (let k = 0; k < heads.length; k++) {
    const j = k + 1 < heads.length ? heads[k + 1][0] : lines.length;
    out.set(heads[k][1], lines.slice(heads[k][0], j).join("\n"));
  }
  return out;
};

/* An expression that PRODUCES a collection. Deliberately syntactic: the walk reads code,
   not types, and says so. */
const ARRAY_EXPR = /(?:\.map\(|\.filter\(|\.slice\(|\.sort\(|\[\s*\.\.\.|Array\.from\(|#rows\(|\.concat\(|\.values\(\)\])/;
/* CORRECTED 2026-08-08 (REC-67), not exempted, and it is the THIRD instance of one
   defect in this file rather than a new one. `.slice(` is an Array method and a
   STRING method, and this plane trims a value with `String(x).slice(0, N)` in
   almost every act it records. PL-1 corrected the mis-read where it produced a
   bare-ARRAY return, PL-15 corrected it again where the refusal helper was
   spelled `refusal(` instead of `refuse(` — and it survived in the two places
   neither of them was looking at: `localCollections`, which promoted a trimmed
   string to a "local collection", and the pair filter below, which reads
   ARRAY_EXPR straight off a published VALUE.
   MEASURED rather than argued, on 2026-08-08 over `store.mjs`: three methods sat
   on this roster for no other reason — `#upsertResolution` (`basis: String(basis)
   .slice(0, 400)`), `threadInstance` (`by: String(threadedBy).slice(0, 200)`) and
   `projectLeave` (`comment: String(comment).slice(0, 280)`) — and two more,
   `defineProgression` and `dischargeStage`, published a phantom `declared_by`
   "collection" that is a trimmed name. `op=thread` was on the ratcheted BARE
   roster on the strength of it.
   THE DIRECTION IS THE SAFE ONE AND THAT IS WHY IT MUST STILL BE FIXED: a walk
   that INVENTS a member of the class inflates a CEILING, and a ceiling that
   counts non-defects cannot be held — PL-15's own words, one correction earlier.
   THE EXCLUSION IS DELIBERATELY INCOMPLETE, IN THE SAFE DIRECTION. It excludes a
   `.slice(` whose receiver chain is ROOTED IN A PROVABLE STRING — a `String(…)`
   call, a `.toISOString()`, a `.join(…)`, or a string literal — and nothing
   else. A string this reader cannot prove is a string keeps its old reading, so
   what survives is a FALSE POSITIVE (alarming, catchable) and never a missed
   collection. Dropping `.slice(` outright would have been the other shape and is
   refused: `rows.slice(0, cap)` is how half the bounded reads in this plane take
   their page, and losing those would HIDE the class this file exists to find. */
const STRING_TRIM =
  /(?:String\s*\([^;]*?\)|\.toISOString\s*\(\s*\)|\.join\s*\([^;]*?\)|"[^"\n]*"|'[^'\n]*')(?:\s*\.[A-Za-z_$][\w$]*\s*\([^;]*?\))*\s*\.slice\s*\(/g;
/* The expression with its provable string trims neutralised, so ARRAY_EXPR is
   asked about what is left. Everything except the `.slice(` survives, because a
   value may trim a string AND build a list in the same breath. */
const deTrim = (v) => String(v).replace(STRING_TRIM, (m) => m.replace(/\.slice\s*\($/, ".trimmedString("));
const collectionExpr = (v) => ARRAY_EXPR.test(deTrim(v));
/* Identifiers assigned from one, in the same segment — `documentsConcerning` returns
   `documents`, a plain name, and a walk that only read inline expressions would have
   missed the very read D-225 was raised about. */
const localCollections = (body) => {
  const out = new Set();
  let m;
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*)/g;
  while ((m = re.exec(body))) if (collectionExpr(m[2]) || /^\s*\[\s*\]/.test(m[2])) out.add(m[1]);
  return out;
};

/* Balanced extraction of every `return { … }` object literal in a segment. */
const returnObjects = (body) => {
  const out = [];
  const re = /return\s*\{/g; let m;
  while ((m = re.exec(body))) {
    let i = m.index + m[0].length - 1, depth = 0;
    for (; i < body.length; i++) {
      if (body[i] === "{") depth++;
      else if (body[i] === "}") { depth--; if (depth === 0) { i++; break; } }
    }
    out.push(body.slice(m.index, i));
  }
  return out;
};
/* …and every `return <expression>;` that is NOT an object literal. This is shape (b). */
const returnBare = (body) => {
  const out = [];
  const re = /return\s+([^;{][^;]*);/g; let m;
  while ((m = re.exec(body))) out.push(m[1].trim());
  return out;
};
/* PL-1, 2026-08-07 — CORRECTED, NOT EXEMPTED, and the defect was MEASURED rather
   than argued. A bare `return refuse("CODE", `…${id.slice(0, 60)}…`);` was being
   counted as a BARE ARRAY return, because ARRAY_EXPR matches `.slice(` and every
   refusal in this plane trims the offending value with exactly that call before
   putting it in a sentence. The classifier already excludes RETURN OBJECTS that
   declare themselves refusals (REFUSAL_RETURN, above); a bare return of the
   plane's own `refuse()` helper is the same class arriving in the other shape,
   and `op=versionchain`, `op=meaningrows` and `op=basisversions` all write it.
   THE MIS-READ IS A FALSE POSITIVE, so it inflates the bare roster rather than
   hiding a defect — which is the safe direction and also the one that makes the
   RATCHET meaningless, since a ceiling that counts non-defects cannot be held.
   Narrow on purpose: it excludes a CALL to the refusal helper and nothing else,
   and the arm below drives it in BOTH directions so the correction cannot
   quietly become an exemption. */
/* WIDENED 2026-08-08 (PL-15), CORRECTED AND NOT EXEMPTED, and the correction is
   PL-1's own finding meeting a spelling it did not know about. This read
   `/^refuse\s*\(/` and the plane's landed convention is `refusal(` — PL-3 named
   the helper that way, and PL-4, PL-11, PL-14 and PL-15 have all followed,
   because `check-refusal-codes`' arm C keys on it. So the first bare
   `return refusal("CODE", `…${x.slice(0, 60)}…`)` in a READ op put `op=queue` on
   the bare roster and pushed the ratchet to 41 of a ceiling of 40 — a FALSE
   POSITIVE of exactly the class PL-1 measured, wearing the other name. It
   inflates the roster rather than hiding a defect, which is the safe direction
   and also the one that makes the ratchet unholdable.
   STILL NARROW ON PURPOSE: it excludes a CALL to either spelling of the refusal
   helper and nothing else, and the arm below drives it in BOTH directions — now
   over both names — so the widening cannot quietly become an exemption. AND THE
   ARM CAUGHT THIS EDIT'S OWN FIRST DRAFT: `/^refusals?\s*\(/` matches `refusal`
   and `refusals` and NOT `refuse`, so it silently swapped which spelling was
   seen instead of covering both. The alternation is explicit for that reason. */
const REFUSAL_CALL = /^refus(?:e|al)\s*\(/;

/* Top-level `key: value` pairs of an object literal, depth-aware so a nested object's keys
   are not read as the answer's own. */
const topPairs = (ro) => {
  const inner = ro.slice(ro.indexOf("{") + 1, ro.lastIndexOf("}"));
  const parts = [];
  let depth = 0, seg = "";
  for (const c of inner) {
    if ("{[(".includes(c)) depth++;
    else if ("}])".includes(c)) depth--;
    if (c === "," && depth === 0) { if (seg.trim()) parts.push(seg.trim()); seg = ""; continue; }
    seg += c;
  }
  if (seg.trim()) parts.push(seg.trim());
  return parts.map((s) => {
    const c = s.indexOf(":");
    return c < 0 ? [s.trim(), s.trim()] : [s.slice(0, c).trim(), s.slice(c + 1).trim()];
  });
};

/* THE TWO QUESTIONS A BOUNDED ANSWER MUST SETTLE — REC-57's, read here as KEY NAMES rather
   than as one vocabulary, because the plane answers the second in five spellings on
   purpose and minting a sixth is the drift REC-55 declined. */
const BOUND_KEY = /^(?:limit|cap|bound|page_size|[a-z_]*_limit)$/;
const MORE_KEY = /^(?:truncated|cursor|remaining|total|bounded|has_more|hasMore|next|[a-z_]*_truncated)$/;
/* Every `#rows(…)` call in a segment, and whether its SQL carries a LIMIT. A call without
   one is a row source that can grow without end — which is D-225's defect, distinct from
   REC-57's. The TOTAL matters as much as the unbounded count: a method with no `#rows` at
   all is not clean, it is OUTSIDE what this walk can judge, and the two are reported
   separately rather than collapsed into one green bucket. */
const rowCalls = (body) => {
  const out = [];
  const re = /#rows\(/g; let m;
  while ((m = re.exec(body))) {
    let i = m.index + m[0].length - 1, depth = 0;
    for (; i < body.length; i++) {
      if (body[i] === "(") depth++;
      else if (body[i] === ")") { depth--; if (depth === 0) { i++; break; } }
    }
    out.push(/\bLIMIT\b/i.test(body.slice(m.index, i)));
  }
  return { total: out.length, unbounded: out.filter((x) => !x).length };
};

/* ===================== REC-70 · THE CAUSE OF THE WALK'S BLINDNESS ==============
 * THIS LINE IS THE ITEM. It read `if (!/\bok\s*:\s*true/.test(ro)) continue;` —
 * ONE success spelling, hard-coded as if it were the only one, FOUR LINES AFTER
 * `BOUND_KEY`/`MORE_KEY` were written as SETS precisely because "the plane
 * answers the second in five spellings on purpose". The instrument avoided the
 * one-vocabulary mistake in its leaves and committed it at its root.
 *
 * WHAT IT COST, MEASURED 2026-08-07 rather than argued: `store.mjs` dispatches
 * 156 ops; the walk graded 55 of them. Twenty-seven dispatched ops answer
 * success WITHOUT `ok: true` — `found: true` (`op=airunlog`, `op=airun`,
 * `op=airuntick`) or NO marker at all (`op=signerlist` returns `{ signers }`,
 * `op=publishedlist` `{ bundles, cases }`, `op=inboxlist` `{ inbox }`,
 * `op=memberlist`, `op=verify`, `op=index`, `op=thread`, …) — and EVERY ONE of
 * them was invisible to a walk built to find exactly this class. `op=airunlog`
 * was merely the one that got caught, by hand, at another item's integration.
 *
 * THE FIX INVERTS THE TEST rather than lengthening a list. A list of success
 * spellings goes stale the moment a fourth is written and fails SILENTLY, which
 * is the failure mode being fixed. So the walk now grades every return object
 * that does not DECLARE ITSELF A REFUSAL: refusals in this plane are `ok: false`
 * with a `reason`, they are the one shape a bounds walk has no business
 * grading, and they are the only shape excluded. A read that invents a fifth
 * success spelling is graded from the day it is written.
 *
 * AND THE INVERSION IS NOT TRUSTED ON ITS OWN — see REACH below, which asserts
 * that every DISPATCHED op lands in a bucket and that the ops this walk still
 * cannot judge are a RATCHETED, PRINTED figure rather than a silence. That
 * assertion is what would have named `op=airunlog` on the day IS-6 added it. */
const REFUSAL_RETURN = /\bok\s*:\s*false/;

/* The roster: method -> what it publishes, and whether it is bounded and says so. */
const collectionReads = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const locals = localCollections(body);
    const rows = rowCalls(body);
    let keys = [], bound = [], more = [], bareReturn = false;
    for (const ro of returnObjects(body)) {
      if (REFUSAL_RETURN.test(ro)) continue;
      const pairs = topPairs(ro);
      const arr = pairs.filter(([k, v]) => collectionExpr(v) || locals.has(v) || (k === v && locals.has(k))).map(([k]) => k);
      if (!arr.length) continue;
      keys = [...new Set([...keys, ...arr])];
      bound = [...new Set([...bound, ...pairs.map(([k]) => k).filter((k) => BOUND_KEY.test(k))])];
      more = [...new Set([...more, ...pairs.map(([k]) => k).filter((k) => MORE_KEY.test(k))])];
    }
    for (const expr of returnBare(body))
      if (collectionExpr(expr) && !REFUSAL_CALL.test(expr)) bareReturn = true;
    if (!keys.length && !bareReturn) continue;
    /* THREE VERDICTS, and the third is where this walk stops rather than where the plane is
       clean — a distinction the first draft of this file collapsed, and collapsing it would
       have printed 27 methods as "enveloped" that publish no bound and need none.
         bare            a collection off an UNBOUNDED row source, with no bound published —
                         either a bare array (nowhere to put one) or an envelope that settles
                         neither of REC-57's two questions. THIS IS THE CLASS.
         bounded         a collection off a row source where EVERY scan carries a LIMIT.
         unjudged        no `#rows` in this method at all: the collection comes from the
                         request, from a derivation, or from a helper this walk attributes
                         elsewhere. NOT a clean bill — a verdict this reader cannot reach. */
    const verdict = rows.unbounded > 0
      ? ((bareReturn || !(bound.length && more.length)) ? "bare" : "bounded")
      : rows.total > 0 ? "bounded" : "unjudged";
    out.set(name, { keys, bound, more, bareReturn, rows, verdict, bare: verdict === "bare" });
  }
  return out;
};
/* op -> method, off the dispatch arrow. `bounds.test.mjs`'s reader, reused. */
const opsFor = (code, methods) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) if (methods.has(m[2])) out.set(m[1], m[2]);
  return out;
};
/* REC-70: THE SAME ARROW READ WITHOUT THE `methods` FILTER — the DENOMINATOR.
   `opsFor` above can only ever report ops the classifier already accepted, so it
   cannot say how much of the plane the walk MISSED; asking it was how a walk
   that reached 55 of 156 ops read as a complete sweep. This is the roster the
   REACH assertions divide. */
const dispatchedOps = (code) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) out.set(m[1], m[2]);
  return out;
};

const CODE = decomment(SRC_STORE);
const READS = collectionReads(CODE);
const OPS = opsFor(CODE, READS);
const DISPATCHED = dispatchedOps(CODE);
const SEGMENTS = segments(CODE);
/* REC-70 · THE FOURTH BUCKET AND THE TRIPWIRE.
   An op the walk does not reach is currently INVISIBLE — it is simply absent
   from `OPS`, which is how `op=airunlog` sat outside all three buckets for two
   days without anything going red. Absence is now split in two, and only one
   half is acceptable:
     NO COLLECTION  the method's returns carry no array-valued key and no bare
                    array — there is nothing to bound, so no verdict is owed.
     OPAQUE         the method SCANS ROWS (`#rows(`) and is DISPATCHED, yet the
                    walk reached no verdict on it. That is a blind spot by
                    definition: rows came out of the store and this reader could
                    not say what happened to them. `aiRunLog` was in here.
   OPAQUE is a RATCHETED figure, exactly like the bare roster: it may shrink, it
   may not grow, and it is printed every run so a failure names its members. */
const opaqueOps = (dispatched, reads, segs) => [...dispatched]
  .filter(([, meth]) => !reads.has(meth) && rowCalls(segs.get(meth) || "").total > 0)
  .map(([op, meth]) => `${op}->${meth}`).sort();
const OPAQUE = opaqueOps(DISPATCHED, READS, SEGMENTS);
const NO_COLLECTION = [...DISPATCHED].filter(([, meth]) => !READS.has(meth)).map(([op]) => op).sort();
const opsWhere = (v) => [...OPS].filter(([, meth]) => READS.get(meth).verdict === v).map(([op]) => op).sort();
const BARE_OPS = opsWhere("bare"), BOUNDED_OPS = opsWhere("bounded"), UNJUDGED_OPS = opsWhere("unjudged");

/* PRINTED EVERY RUN — corpus size first, so a corpus that SHRANK TO NOTHING is visible
   rather than silent. Three walks this week kept a headline assertion green over an empty
   corpus, twice inside the instrument built to prevent it. */
console.log("\n--- WALK: every published collection, read off store.mjs's own return shapes ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${segments(CODE).size} method segments, `
          + `${READS.size} publishing a collection, reaching ${OPS.size} ops`);
/* REC-70: the DENOMINATOR beside the numerator, because "reaching 55 ops" read
   as a complete sweep for two days while 101 dispatched ops went ungraded. */
console.log(`  REACH: ${OPS.size} of ${DISPATCHED.size} DISPATCHED ops judged; `
          + `${NO_COLLECTION.length} publish no collection; ${OPAQUE.length} OPAQUE (scan rows, no verdict)`);
console.log(`  BARE — a collection off an UNBOUNDED row source, no bound published: ${BARE_OPS.length} ops`);
for (const op of BARE_OPS) {
  const r = READS.get(OPS.get(op));
  console.log(`    op=${op.padEnd(20)} -> ${OPS.get(op).padEnd(26)} [${r.bareReturn ? "BARE ARRAY" : r.keys.join(",")}]`);
}
console.log(`  BOUNDED — every scan carries a LIMIT: ${BOUNDED_OPS.length} ops`);
for (const op of BOUNDED_OPS) {
  const r = READS.get(OPS.get(op));
  console.log(`    op=${op.padEnd(20)} -> ${OPS.get(op).padEnd(26)} bound=[${r.bound}] more=[${r.more}]`);
}
/* PRINTED, NOT SUPPRESSED. These are the ops this walk cannot judge — no `#rows` in the
   method, so the collection comes from the request, a derivation, or a helper attributed
   elsewhere. Reporting them as clean would be the generous direction, which is the one
   failure mode this whole file exists to prevent. */
console.log(`  UNJUDGED — no row scan in the method, so this walk reaches no verdict: ${UNJUDGED_OPS.length} ops`);
console.log(`    ${UNJUDGED_OPS.map((o) => `op=${o}`).join(", ")}`);
/* PRINTED FOR THE SAME REASON THE UNJUDGED BUCKET IS. These ops put rows into
   the world and this walk cannot say what became of them. Naming them is the
   difference between a limitation and a blind spot. */
console.log(`  OPAQUE — DISPATCHED and scanning rows, yet outside every bucket above: ${OPAQUE.length} ops`);
console.log(`    ${OPAQUE.join(", ")}`);

/* ------------------------------------------------------------------- GUARDS.
   A reader that silently yielded nothing makes every assertion below vacuous —
   which is the exact failure this whole file exists to prevent, so it is checked
   in its own instrument first. */
t("WALK GUARD: comments are blanked, and a known CODE line SURVIVES it",
  /static SEARCH_ORPHAN_MAX = 100;/.test(CODE), true);
t("WALK GUARD: and a known PROSE line does NOT — this file's subject is named in dozens of comments",
  /the most important entity produces the largest unbounded response/.test(CODE), false);
t("WALK GUARD: the segmenter partitions the class into a plausible number of methods",
  segments(CODE).size > 250, true);
/* Anchored on text that PREDATES this item deliberately: a guard tied to the change it
   guards fails under this file's own negative control and reports the control as a broken
   instrument. Its job is to prove the segmenter's BOUNDARY, nothing else. */
t("WALK GUARD: a segment is bounded by the NEXT method and does not run into it",
  [/ORDER BY ref, entity_id/.test(segments(CODE).get("resolutionsForCapture")),
   /documentsConcerning\(\{/.test(segments(CODE).get("resolutionsForCapture"))], [true, false]);
t("WALK GUARD: the roster is non-trivial and reaches ops through the dispatch",
  [READS.size >= 25, OPS.size >= 20], [true, true]);
t("WALK GUARD: every op reached carries exactly one of the three verdicts, and the UNJUDGED bucket "
+ "is NON-EMPTY — a walk that judged everything would be claiming a reach it does not have",
  [BARE_OPS.length + BOUNDED_OPS.length + UNJUDGED_OPS.length === OPS.size, UNJUDGED_OPS.length > 0],
  [true, true]);
/* THE POSITIVE CONTROL FOR THE CLASSIFIER ITSELF. An empty BARE roster would be the
   equality that costs nothing to produce — it would read as "nothing to fix" whether the
   plane were clean or the reader broken. It must still SEE the class it is for. */
t("WALK GUARD: the classifier can still SEE a bare collection read — the roster is not empty, so "
+ "the three named ops being ABSENT from it below is a measurement and not an unarmed check",
  BARE_OPS.length > 0, true);
t("WALK GUARD: and it can see a BARE ARRAY return, shape (b) — the shape a return-object-only "
+ "reader would have missed, which is REC-57's blind spot in a new costume",
  [...READS].some(([, r]) => r.bareReturn), true);
/* PL-1's correction, DRIVEN IN BOTH DIRECTIONS over synthetic bodies, because a
   narrowing that is only argued for is an exemption with a comment attached.
   The first must be seen (a real bare array); the second must NOT (a refusal
   whose detail sentence trims a value with `.slice(`, which is what the plane
   actually writes at every refusal site). */
{
  const realBare = "  someRead(a) {\n    const rows = this.#rows(`SELECT x FROM y`);\n    return rows.slice(0, 5);\n  }";
  const refusalOnly = "  someRead(a) {\n    const rows = this.#rows(`SELECT x FROM y`);\n"
    + "    if (!a) return refuse(\"NO_A\", `a=${String(a).slice(0, 60)} is not an id`);\n"
    + "    return { ok: true, rows, limit: 1, truncated: false };\n  }";
  /* THE OTHER SPELLING, driven rather than assumed to follow (PL-15). `refusal`
     is the name every family since PL-3 has used, and it was invisible here. */
  const refusalOnlyLongName = "  someRead(a) {\n    const rows = this.#rows(`SELECT x FROM y`);\n"
    + "    if (!a) return refusal(\"NO_A\", `a=${String(a).slice(0, 60)} is not an id`);\n"
    + "    return { ok: true, rows, limit: 1, truncated: false };\n  }";
  /* ADDED 2026-08-08 (REC-67) SO PL-1's ARM KEEPS ITS TEETH. This item taught the
     reader that a `.slice(` rooted in `String(…)` is a trim, which means the two
     fixtures above would now read `false` even with `REFUSAL_CALL` deleted — a
     guard passing for a reason its author did not intend, which is the shape
     this whole sweep is about. So a THIRD fixture refuses with a REAL ARRAY
     slice: it survives `deTrim` and only `REFUSAL_CALL` can exclude it, so
     PL-1's narrowing is still the thing being measured here. */
  const refusalWithRealArray = "  someRead(a) {\n    const rows = this.#rows(`SELECT x FROM y`);\n"
    + "    if (!a) return refusal(\"TOO_MANY\", rows.slice(0, 3));\n"
    + "    return { ok: true, rows, limit: 1, truncated: false };\n  }";
  const bareOf = (src) => {
    const b = [...segments(src).values()][0] || "";
    return returnBare(b).some((e) => collectionExpr(e) && !REFUSAL_CALL.test(e));
  };
  t("WALK GUARD (PL-1, 2026-08-07): the bare-array reader still SEES a real bare array, and no longer "
  + "counts a refusal that trims a value with `.slice(` — measured in both directions, so the "
  + "narrowing is a correction and not an exemption",
    [bareOf(realBare), bareOf(refusalOnly), bareOf(refusalOnlyLongName), bareOf(refusalWithRealArray)],
    [true, false, false, false]);
  /* REC-67's own direction, driven beside PL-1's: a trimmed STRING is not a
     collection, and a real array slice still is. Both, or the narrowing is an
     exemption wearing a measurement's clothes. */
  t("WALK GUARD (REC-67, 2026-08-08): `String(x).slice(0, N)` is a TRIM and is no longer read as a "
  + "collection, while `rows.slice(0, cap)` — how half the bounded reads in this plane take their "
  + "page — still is. The narrowing is measured in both directions",
    [collectionExpr("String(basis).slice(0, 400)"),
     collectionExpr("new Date(n).toISOString().slice(0, 10)"),
     collectionExpr("comment === null ? null : String(comment).slice(0, 280)"),
     collectionExpr("merged.slice(0, cap)"),
     collectionExpr("Array.isArray(terms) && terms.length ? terms.slice(0, 24) : [\"oakland\"]"),
     collectionExpr("`${String(x).slice(0, 60)} and ` + rows.slice(0, 5)")],
    [false, false, false, true, true, true]);
}

/* ------------------------------------------------------- THE ITEM'S OWN (a).
   The three reads D-225 named are OFF the bare roster, and they are off it because
   they publish, not because the reader stopped looking at them. */
t("REC-60: the three reads D-225 named are NO LONGER bare — measured off the source, by name",
  ["resolutions", "concerns", "connections"].filter((op) => BARE_OPS.includes(op)), []);
t("REC-60: and each is on the BOUNDED roster — every row scan behind them now carries a LIMIT, "
+ "which is the D-225 half; publishing it is the REC-57 half, and both are required",
  ["resolutions", "concerns", "connections"].filter((op) => !BOUNDED_OPS.includes(op)), []);
/* NULL-TOLERANT, and it is not defensive style — REC-60's own negative control (3) made
   this arm THROW on `.bound` of undefined and DIE, hiding every arm behind it including
   the three REACH deltas and the whole live half. D-93's class inside a control, for the
   fourth recorded time. A read that finds nothing must FAIL SAYING SO, never crash. */
t("REC-60: in the SPELLING THE PLANE ALREADY USES — `limit` beside `truncated`, op=readingname's "
+ "pair, not a twelfth word minted for three ops",
  ["resolutions", "concerns", "connections"].map((op) => {
    const r = READS.get(OPS.get(op));
    if (!r) return `WALK FOUND NO READ FOR op=${op}`;
    return [r.bound.includes("limit"), r.more.includes("truncated")];
  }), [[true, true], [true, true], [true, true]]);

/* ------------------------------------------------- REC-66 · op=connect, AT SOURCE.
   The op D-225's sweep FOUND and REC-60 deliberately did not fold in, because bounding it
   needed its own interface break. It is this walk's class read one step earlier: the three
   above returned an unbounded ANSWER, this one did unbounded WORK to produce it. The walk
   cannot see that difference — it grades what a method publishes — so these two arms are
   only the half it CAN judge, and `test/derivation-bounds.test.mjs` is the half it cannot.
   Stated here rather than left implicit, because a walk trusted past its reach is how
   `op=airunlog` sat outside every bucket for two days. */
t("REC-66: `op=connect` is OFF the bare roster and ON the bounded one — the scan behind the "
+ "derivation carries a LIMIT, measured off the source rather than asserted about it",
  [BARE_OPS.includes("connect"), BOUNDED_OPS.includes("connect")], [false, true]);
t("REC-66: and it publishes in the spelling the plane already uses — `limit` beside `truncated`, "
+ "REC-60's pair on the three reads next door, with `document_limit` as the second bound rather "
+ "than a second vocabulary",
  (() => { const r = READS.get(OPS.get("connect"));
           return r ? [r.bound.includes("limit"), r.bound.includes("document_limit"), r.more.includes("truncated")]
                    : "WALK FOUND NO READ FOR op=connect"; })(),
  [true, true, true]);

/* ------------------------------------------------------- THE RATCHET.
   The residual roster is REAL and this item does not pretend to have emptied it. What is
   pinned is that it cannot GROW: a new read that publishes a collection off an unbounded
   row source fails here, and the roster is printed above so the failure names it. The
   figure is a MEASUREMENT with a date, not a target. */
const BARE_ROSTER_MEASURED_2026_08_07 = BARE_OPS.length;
console.log(`  RATCHET: ${BARE_ROSTER_MEASURED_2026_08_07} bare-collection read ops remain, `
          + `listed above and measured 2026-08-07`);
/* REC-70 MOVED THIS FIGURE, and the direction is the finding rather than an
   embarrassment. It read 27 while the walk could only see 55 of 156 dispatched
   ops; correcting the success-marker gate (above) brought 27 more ops into
   view, 14 of which were bare all along — `op=signerlist`, `op=publishedlist`,
   `op=inboxlist`, `op=memberlist`, `op=verify`, `op=index`, `op=thread`,
   `op=selection`, `op=reusedparts`, `op=reuseverdicts`, `op=readingnameplan`,
   `op=airun`, `op=airuntick`, and `op=airunlog`. `op=airunlog` is the one this
   item BOUNDED, so the honest figure is 41 members of the class MINUS the one
   fixed = 40. **The old 27 was never a smaller problem; it was a smaller
   measurement**, and a ratchet over a corpus the instrument could not see is
   the failure this item exists to record. The residual is REAL, is printed
   above, and is not claimed to be graded — only fixed in place. */
/* CORRECTED 2026-08-08 (REC-67), not exempted, and 40 was the true measurement
   on the day REC-70 wrote it. 40 -> 39 for ONE reason and it is a correction to
   the READER, not to the plane: `op=thread` was on this roster because
   `threadInstance` publishes `by: String(threadedBy).slice(0, 200)` and the
   collection detector read `.slice(` on a trimmed STRING as an array. It never
   published a collection at all. **THE OP DID NOT GET BETTER — IT WAS NEVER A
   MEMBER**, and it moves to the OPAQUE residual below rather than to a clean
   bill, because this reader still cannot say what `threadInstance` publishes;
   it can only now say that what it publishes is not this. A phantom member of a
   CEILING is the shape PL-15 named one correction earlier: a ceiling that counts
   non-defects cannot be held. */
/* CORRECTED 2026-08-08 (REC-66), not exempted, and 39 was the true measurement on
   the day REC-67 wrote it. 39 -> 38 for ONE reason and it is the OTHER kind of
   arrival from REC-67's: no phantom left the roster and the reader did not
   change — `op=connect` was a REAL member and it was FIXED. `deriveConnections`
   read the entity's resolutions with no LIMIT and emitted every pair, which is
   this roster's own definition twice over, and it now bounds the SCAN and
   publishes `limit`/`document_limit` beside `truncated`.
   THE MEASUREMENT IS THE WALK'S, TAKEN BY RUNNING IT: it printed 38 against a
   ceiling of 39 and the FLOOR below is what forced this figure to be moved
   deliberately rather than quietly enjoyed. Both halves moved in one edit. */
t("RATCHET: the bare roster is a CEILING, not a target — a NEW read that publishes a collection "
+ "off an unbounded row source pushes this over the figure RE-MEASURED on 2026-08-08 over the "
+ "CORRECTED corpus (REC-70: 27 was measured over 55 of 156 dispatched ops; REC-67 removed one "
+ "phantom; REC-66 FIXED one member) and fails here",
  BARE_OPS.length <= 38, true);
/* Guarded BOTH WAYS. A ceiling alone cannot tell "the roster shrank because a
   read was fixed" from "the roster shrank because the reader broke again" —
   which is precisely how this walk spent two days reporting 27. A DROP is not a
   failure, but it must be DELIBERATE, so the floor moves only when someone
   moves it. */
t("RATCHET: and a FLOOR beside the ceiling — the roster shrinking without this figure being moved "
+ "means the READER lost sight of ops, not that the plane got better. REC-60's 27 was a shrunken "
+ "measurement nobody could distinguish from progress",
  /* MOVED 2026-08-08 (REC-67) IN THE SAME EDIT AS THE CEILING, and this arm is
     exactly the reason the move is deliberate rather than silent: the roster
     shrank by one and this floor is what forced somebody to say WHY. The answer
     is recorded above the ceiling — a phantom left, no read was fixed.
     MOVED AGAIN 39 -> 38, 2026-08-08 (REC-66), same edit as the ceiling and for
     the OPPOSITE reason to REC-67's: this time a read WAS fixed. The arm did its
     job on a clean tree — it failed the moment `op=connect` came off the roster,
     which is the only reason this figure is being written by hand rather than
     drifting down unremarked. */
  BARE_OPS.length >= 38, true);

/* ==========================================================================
 * REC-70 · REACH — WHAT THIS WALK REACHES, ASSERTED RATHER THAN ASSUMED.
 *
 * REC-60's file said plainly what it could not see, in prose, in its header.
 * The prose was correct AND `op=airunlog` still slipped past it, because a
 * limitation nobody counts is indistinguishable from a limitation nobody has.
 * So the same statements are now ASSERTIONS over the DISPATCH ROSTER.
 * ========================================================================== */
console.log("\n--- REC-70: REACH over the DISPATCH roster, asserted rather than described ---");
t("REACH: the denominator is REAL — store.mjs dispatches a plausible number of ops, so the "
+ "fractions below are measurements and not divisions by a number this file chose",
  [DISPATCHED.size > 120, DISPATCHED.size >= OPS.size], [true, true]);
t("REACH: every DISPATCHED op is accounted for EXACTLY ONCE — bare, bounded, unjudged, or "
+ "publishing no collection at all. An op in none of them is one this walk never saw, which is "
+ "the state `op=airunlog` was in when REC-60's ratchet read green over it",
  [BARE_OPS.length + BOUNDED_OPS.length + UNJUDGED_OPS.length + NO_COLLECTION.length, DISPATCHED.size],
  [DISPATCHED.size, DISPATCHED.size]);
/* THE TRIPWIRE, and it is the arm that would have caught this item's own
   subject on the day it was written. "Publishes no collection" is a verdict a
   broken reader produces for free; "scans rows and publishes nothing this
   reader can find" is not. */
/* MOVED 8 -> 9 ON 2026-08-08 (PL-15), AND THE REASON IS THE SAME SHAPE AS
   REC-70's OWN 27 -> 41: the roster did not grow, the READER stopped being
   wrong. `op=versionstrength` (PL-14) returns bare `refusal(...)` calls whose
   detail strings trim a value with `.slice(`, so REFUSAL_CALL's old `refuse(`-
   only spelling counted it as a BARE ARRAY. It sat on the BARE roster as a
   FALSE POSITIVE, which meant this ceiling never saw it — and the bare roster
   read one too high for the same reason. Widening REFUSAL_CALL to both
   spellings moves it out of BARE and reveals what it actually is: DISPATCHED,
   scanning rows, and outside every bucket. **The 8 was never a smaller blind
   spot; it was a smaller measurement**, which is the finding REC-70 recorded
   one layer down and is why the figure moves with a date rather than being
   argued away. PL-15's own new work adds NOTHING here: `op=queue` came OFF the
   bare roster by the same correction and is on neither residual. */
/* MOVED 9 -> 10 ON 2026-08-08 (REC-67), AND IT IS PL-15's MOVE HAPPENING AGAIN
   FOR THE SAME REASON ONE FALSE POSITIVE OVER. `op=thread` sat on the BARE
   roster because the collection detector read `String(threadedBy).slice(0, 200)`
   — a trimmed NAME — as an array. Teaching it that a `.slice(` rooted in a
   provable string is a TRIM moves the op out of BARE and reveals what it
   actually is: DISPATCHED, scanning rows, and outside every bucket.
   THIS IS THE HONEST DIRECTION AND IT LOOKS LIKE THE WRONG ONE, so it is said
   plainly: the walk did not get blinder, it stopped claiming a verdict it never
   had. A FABRICATED verdict replaced by a STATED unknown is the trade this
   project makes everywhere else — undetermined is first-class and must be
   stated — and the ceiling is safe to move only because the residual below is
   pinned BY NAME, so the +1 cannot hide anything but the op that earned it. */
t("REACH: the OPAQUE roster is a CEILING too — an op that SCANS ROWS, is DISPATCHED, and lands "
+ "outside every bucket is a BLIND SPOT and not a clean bill. `op=airunlog` was one of 24 on "
+ "2026-08-07; correcting the success-marker gate left 8, correcting REFUSAL_CALL's spelling on "
+ "2026-08-08 revealed a 9th, and REC-67's string-trim correction a 10th — every one of them "
+ "already hiding inside the bare roster. A NEW one fails here",
  OPAQUE.length <= 10, true);
t("REACH: and `op=airunlog` is NOT among them — the arm stated positively, so it fails if the op "
+ "is ever returned to the state this item found it in",
  OPAQUE.filter((e) => e.startsWith("airunlog->")), []);
/* NOT AN EXEMPTION LIST — a NAMED residual with a reason, which is what the
   item asked for when it said "name exactly which it cannot reach and why".
   Every one of the eight is a WRITE path that scans rows for its own logic and
   answers a scalar or a status; none publishes a collection. They are pinned by
   NAME so that "8" cannot be satisfied by a different eight. */
t("REACH: and the residual is NAMED, not merely counted — a bare count is satisfied by ANY eight "
+ "ops, so the identities are pinned and a swap fails here",
  OPAQUE, ["projectfork->forkProject", "projectionplan->projectionPlan",
           "projectowneradd->projectOwnerAdd", "publish->publish",
           "registeraudit->registerAudit", "select->selectionCreate",
           "selectionrelease->selectionRelease", "taskdrain->taskDrain",
           /* ADDED 2026-08-08 (REC-67) — the SECOND member that is not a write
              path, and it arrives the same way PL-15's did: it was on the BARE
              roster on the strength of a `String(threadedBy).slice(0, 200)` the
              collection detector read as an array. `threadInstance` writes
              placements and answers a status; what it publishes is not a
              collection this reader can find, and saying THAT is honest where
              calling it bare was not. Named rather than absorbed, because "10"
              satisfied by a different ten is what this arm exists to refuse. */
           "thread->threadInstance",
           /* ADDED 2026-08-08 (PL-15) — and it is the ONE member of this list
              that is NOT a write path scanning rows for its own logic. It is a
              READ, and it is here because the reader could not classify what it
              publishes once it stopped mistaking it for a bare array. Named
              rather than absorbed, because "9" satisfied by a different nine is
              exactly what this arm exists to refuse. Whether it should be
              BOUNDED is PL-14's family's question, and it is delegated. */
           "versionstrength->versionStrength"]);
t("REACH IS A DELTA (dispatch denominator): breaking the dispatch arrow shape shrinks the "
+ "DENOMINATOR too — otherwise the reach fractions above are computed against a constant and "
+ "would keep reading '82 of 156' over a source this reader could no longer parse",
  dispatchedOps(CODE.replace(/\)\s*=>\s*this\./g, ") => that.")).size < DISPATCHED.size, true);

/* ==========================================================================
 * REC-70 · THE OP ITSELF, at source. The live arms are below.
 * ========================================================================== */
t("REC-70: `op=airunlog` is now ON the BOUNDED roster and OFF the bare one — measured off the "
+ "source by the corrected walk, which is the whole evidence that the blindness is fixed",
  [BARE_OPS.includes("airunlog"), BOUNDED_OPS.includes("airunlog")], [false, true]);
t("REC-70: and it is graded WITHOUT `ok: true` — this method still answers `found: true`, "
+ "deliberately, so a walk that had merely been taught one more literal would still miss it",
  [/\bfound\s*:\s*true/.test(SEGMENTS.get("aiRunLog") || "NOPE"),
   /\bok\s*:\s*true/.test(SEGMENTS.get("aiRunLog") || "ok: true")], [true, false]);
/* D-227 IS OPEN AND BITES EXACTLY HERE. The walk grades what a method
   PUBLISHES, so removing `LIMIT ?` while leaving the envelope honest still
   reads as bounded — CONDUCT measured that at REC-60's integration. The SQL
   bound is therefore pinned DIRECTLY off this method's own segment rather than
   inferred from its answer. Text-anchored over COMMENT-STRIPPED source so the
   prose above the method (which names `LIMIT` twice) cannot satisfy it. */
t("REC-70 / D-227: the SQL BOUND itself, pinned off aiRunLog's own comment-stripped segment — "
+ "the scan carries `LIMIT ?` and asks for `cap + 1`. The published envelope cannot stand in for "
+ "this: D-227 measured an envelope staying honest over a scan whose LIMIT had been removed",
  [/FROM ai_run_log WHERE run = \? ORDER BY seq LIMIT \?/.test(SEGMENTS.get("aiRunLog") || ""),
   /run,\s*cap \+ 1\)/.test(SEGMENTS.get("aiRunLog") || "")], [true, true]);
t("REC-70: the cap comes from the plane's OWN figures and is not a literal at the call site — "
+ "`AI_RUN_LOG_LIMIT_DEFAULT`/`_MAX` are named constants, so the pair can be read and re-decided "
+ "in one place rather than found by grep",
  [/Store\.AI_RUN_LOG_LIMIT_DEFAULT/.test(SEGMENTS.get("aiRunLog") || ""),
   /Store\.AI_RUN_LOG_LIMIT_MAX/.test(SEGMENTS.get("aiRunLog") || "")], [true, true]);
t("REC-70: NEITHER FIGURE IS NEW — 200 is op=exportlog's default (the plane's only other "
+ "append-only seq-ordered log) and 5000 is op=list's ceiling, which op=projection and the "
+ "meaning layer both reused rather than minting a second",
  [/static AI_RUN_LOG_LIMIT_DEFAULT = 200;/.test(SRC_STORE),
   /static AI_RUN_LOG_LIMIT_MAX = 5000;/.test(SRC_STORE),
   /static EXPORT_LOG_LIMIT_DEFAULT = 200;/.test(SRC_STORE),
   /static PROJECTION_LIMIT_MAX = 5000;/.test(SRC_STORE)], [true, true, true, true]);
/* A MARKER PIN, stated as one: it proves the reasoning was WRITTEN where the
   next reader meets the code, and claims nothing about what it says. The cause
   of the blindness belongs at the site, not only in a queue item — the whole
   complaint against REC-60's header is that prose nobody counts is prose nobody
   reads. */
/* ANCHORED ON THE SEGMENT, WHICH STARTS AT THE SIGNATURE — so a reasoning block
   written in the doc comment ABOVE the method does NOT satisfy this, and the
   first draft of this arm proved it by failing. That is the same mistake in
   miniature: an explanation placed where the instrument cannot read it. */
t("REC-70: THE CAUSE IS RECORDED AT THE SITE — `aiRunLog` carries, IN ITS BODY, why the ratchet "
+ "could not see it, so the next reader meets the blind spot at the code and the segmenter that "
+ "reads this file meets it too",
  /REC-70[^]{0,6000}?found\s*:\s*true/i.test(segments(SRC_STORE).get("aiRunLog") || ""), true);

/* ------------------------------------------------ REACH, AS DELTAS.
   A walk that matches nothing reports zero and passes forever. Each reader is re-run over a
   MECHANICALLY BROKEN copy of the same source and must find FEWER. The absolute number is
   not the evidence; the difference is. */
const strippedReturns = CODE.replace(/return\s*\{/g, "yield0 ({").replace(/return\s+/g, "yield1 ");
const strippedReads = collectionReads(strippedReturns);
t("REACH IS A DELTA (return shapes): breaking the RETURN anchor on a copy of store.mjs shrinks the "
+ "roster the walk finds — this walk's whole premise is that it reads return shapes",
  strippedReads.size < READS.size, true);
t("REACH IS A DELTA (dispatch): breaking the dispatch arrow shape shrinks the ops reached, with the "
+ "method roster unchanged",
  opsFor(CODE.replace(/\)\s*=>\s*this\./g, ") => that."), READS).size < OPS.size, true);
const emptyReads = collectionReads("");
console.log(`  REACH CONTROL: the same reader over an EMPTY corpus — 0 lines, `
          + `${segments("").size} segments, ${emptyReads.size} collection reads, `
          + `${opsFor("", emptyReads).size} ops`);
t("REACH IS A DELTA (empty corpus): the same reader over NOTHING finds NOTHING, while over the real "
+ "source it does not — and the empty corpus is PRINTED above, because a headline assertion staying "
+ "green over nothing is how three walks passed triumphantly this week",
  [emptyReads.size, READS.size > 0], [0, true]);
t("REACH: THE FAILURE MODE NAMED — over that same empty corpus, `the three named ops are not bare` "
+ "STILL READS TRUE. That is exactly how a covering-nothing walk congratulates itself, and it is "
+ "asserted here so the reason the delta arms exist cannot be forgotten",
  ["resolutions", "concerns", "connections"].filter((op) => [...opsFor("", emptyReads).keys()].includes(op)), []);

/* ==========================================================================
 * LIVE — the three reads driven through their real route.
 * ========================================================================== */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r60", MEMBER_TOKEN: "mem-r60", PROBE_TOKEN: "prb-r60",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const NOW = "2026-07-16T00:00:00Z";
const LABEL = "Coliseum Payment Allocation";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
  "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

/* FOUR captured documents on one subject, because FOUR is where the quadratic read starts
   telling a different story from the linear ones: k=4 gives SIX connections against FOUR
   documents, so an answer bounded at 4 is complete for op=concerns and CUT for
   op=connections on the very same record. */
const CAPS = [];
for (let i = 1; i <= 4; i++) {
  const id = `INFO-2026-000${i}-r60`;
  const md = bundleMd(id);
  const capture = sha(`r60-${i}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:26-090${i}`, kind: "legislation", key: `26-090${i}`, label: LABEL }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r60", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r60", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  CAPS.push(capture);
}
const ENT = (await POST("op=entitycreate&token=mem-r60", { kind: "contract", label: LABEL })).entity_id;
if (!ENT) throw new Error("entitycreate failed");
for (const c of CAPS) {
  const r = await POST("op=resolve&token=mem-r60", { captureSha: c, resolvedBy: "r60" });
  if (r?.ok === false) throw new Error(`resolve ${c}: ${JSON.stringify(r)}`);
}
/* A SECOND subject testified onto ONE document's reference, so that document carries TWO
   resolutions while the other three carry one. That asymmetry is what makes the
   same-count delta below possible, and it is the sharpest arm in this file. */
const ENT2 = (await POST("op=entitycreate&token=mem-r60", { kind: "contract", label: "Second Subject r60" })).entity_id;
const testified = await POST("op=resolvetestify&token=mem-r60",
  { captureSha: CAPS[0], ref: "legislation:26-0901", entityId: ENT2,
    basis: "REC-60 fixture: a second subject on one reference, so one capture carries two resolutions",
    resolvedBy: "r60" });
if (testified?.ok === false) throw new Error(`resolvetestify: ${JSON.stringify(testified)}`);
const derived = await POST("op=connect&token=mem-r60", { entityId: ENT, assertedBy: "r60" });
if (derived?.ok === false) throw new Error(`connect: ${JSON.stringify(derived)}`);

console.log("\n--- LIVE: the fixture, proved to ARM THE TRAP before anything is asserted over it ---");
t("FIXTURE: four documents concern the subject", (await GET(`op=concerns&token=mem-r60&id=${ENT}&limit=5000`)).count, 4);
t("FIXTURE: and they form SIX connections — k(k-1)/2 at k=4, D-224's curve, which is why the "
+ "quadratic read is the one this bound was raised for",
  (await GET(`op=connections&token=mem-r60&id=${ENT}&limit=5000`)).count, 6);
t("FIXTURE: one capture carries TWO resolutions and another carries ONE — the asymmetry the "
+ "same-count delta below depends on",
  [(await GET(`op=resolutions&token=mem-r60&sha256=${CAPS[0]}&limit=5000`)).count,
   (await GET(`op=resolutions&token=mem-r60&sha256=${CAPS[1]}&limit=5000`)).count], [2, 1]);
t("FIXTURE: the SAME record answers a bound of 4 completely on op=concerns and CUT on "
+ "op=connections — the two reads do not grow together, which is the point of D-224's curve",
  [(await GET(`op=concerns&token=mem-r60&id=${ENT}&limit=4`)).truncated,
   (await GET(`op=connections&token=mem-r60&id=${ENT}&limit=4`)).truncated], [false, true]);

console.log("\n--- LIVE: each read driven twice — the bound biting, and not ---");
const DRIVEN = [
  { op: "resolutions", bite: 1, whole: 5000,
    drive: (n) => GET(`op=resolutions&token=mem-r60&sha256=${CAPS[0]}&limit=${n}`),
    coll: "resolutions",
    lost: "whether a document's subjects are all of them or the first N" },
  { op: "concerns", bite: 1, whole: 5000,
    drive: (n) => GET(`op=concerns&token=mem-r60&id=${ENT}&limit=${n}`),
    coll: "documents",
    lost: "whether the reverse index answered over every document concerning the subject or over the first N rows" },
  { op: "connections", bite: 1, whole: 5000,
    drive: (n) => GET(`op=connections&token=mem-r60&id=${ENT}&limit=${n}`),
    coll: "connections",
    lost: "whether the graph around a subject is whole, on the read that grows as k(k-1)/2" },
];
for (const d of DRIVEN) {
  const bitten = await d.drive(d.bite);
  const whole = await d.drive(d.whole);
  t(`op=${d.op}: publishes the bound it APPLIED — the clamped cap, never the number asked for`,
    bitten.limit, d.bite);
  t(`op=${d.op}: a cut answer says so — ${d.lost} is READABLE, not inferred`, bitten.truncated, true);
  t(`op=${d.op}: a complete answer says the opposite`, whole.truncated, false);
  t(`op=${d.op}: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike`,
    bitten.truncated !== whole.truncated, true);
  /* Null-tolerant deliberately (REC-59's control found three suites DYING on `.length` of
     undefined and hiding every arm behind them — D-93's class inside a control). A read
     that answered nothing must FAIL here NAMING itself, never throw. */
  t(`op=${d.op}: and the collection itself is still there, cut to the bound`,
    [Array.isArray(bitten?.[d.coll]) ? bitten[d.coll].length : `MISSING ${d.coll}`,
     Array.isArray(whole?.[d.coll]) ? whole[d.coll].length > 1 : `MISSING ${d.coll}`], [1, true]);
  const over = await d.drive(99999);
  t(`op=${d.op}: an over-ask is answered at the CEILING and the ceiling is what is published — `
  + `echoing 99999 back would be a second way of lying about the same fact`, over.limit, 5000);
}

/* ------------------------------------------------ THE SHARPEST ARM, and NEGATIVE CONTROL
   (2)'s own subject. `count` is the length of what was SENT and always was. Two answers of
   the SAME LENGTH — one cut, one complete — must not read alike, and `count` alone cannot
   tell them apart on ANY record. That is why `truncated` had to be published rather than
   left to be inferred from `count === limit`. */
console.log("\n--- LIVE: two answers of the SAME COUNT, one cut and one complete ---");
const cut1 = await GET(`op=resolutions&token=mem-r60&sha256=${CAPS[0]}&limit=1`);
const whole1 = await GET(`op=resolutions&token=mem-r60&sha256=${CAPS[1]}&limit=5000`);
t("op=resolutions: two answers carry `count: 1` — one CUT from two rows, one COMPLETE at one row",
  [cut1.count, whole1.count], [1, 1]);
t("SAME-COUNT DELTA: `count` cannot tell them apart, and `truncated` can — the two must never read alike",
  [cut1.count === whole1.count, cut1.truncated !== whole1.truncated], [true, true]);
t("SAME-COUNT DELTA: and `count === limit` is NOT the test either — the complete answer's count "
+ "differs from its limit, so a consumer inferring truncation from the arithmetic gets it wrong "
+ "in BOTH directions",
  [cut1.count === cut1.limit, whole1.count === whole1.limit], [true, false]);

/* ------------------------------------------------------------- THE D-15 GATE IS UNMOVED.
   REC-30 stamped the viewer projection onto all three of these reads. A bound is a bound
   and not a new door: `limit` must be VIEWER-INDEPENDENT, exactly as REC-57 pinned for
   op=list. Driven at the two credential classes the plane distinguishes here. */
console.log("\n--- LIVE: the bound is viewer-INDEPENDENT, so it is not a second oracle ---");
const asMember = await GET(`op=concerns&token=mem-r60&id=${ENT}&limit=3`);
const asProbe = await GET(`op=concerns&token=prb-r60&id=${ENT}&limit=3`);
t("op=concerns: the bound APPLIED is the same figure for every reader — a viewer-dependent bound "
+ "would let a caller measure what is being withheld from them",
  [asMember.limit, asProbe.limit], [3, 3]);

/* ==========================================================================
 * REC-70 · op=airunlog DRIVEN THROUGH ITS REAL ROUTE.
 *
 * The source arms above prove the walk can now SEE this op. These prove the op
 * is actually bounded, because a corrected instrument agreeing with a broken
 * plane is the failure mode this whole file was built around.
 * ========================================================================== */
console.log("\n--- LIVE: op=airunlog, the op REC-60's ratchet could not see ---");
const RUN = "RUN-2026-0807-rec70";
{
  const opened = await POST("op=airunopen&token=mem-r60", {
    run: RUN, contextType: "inquiry", contextId: "INFO-2026-0001-r60",
    label: "REC-70 fixture — a log long enough for a bound to bite", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }],
    leaseMs: 600000, at: NOW,
  });
  t("REC-70 FIXTURE: the run opens — the arms below are over a REAL run, not an empty answer",
    opened?.started, true);
  /* SIX observations, because the bound must be driven at a figure BELOW the
     row count and at one ABOVE it, and a fixture of one row cannot tell a bound
     that bit from a bound that did not. */
  const entries = [];
  for (let i = 1; i <= 6; i++) entries.push({
    level: "document", subject: `observation:rec70-${i}`, state: "PRESENT",
    detail: `REC-70 fixture observation ${i} — the log grows one row per tick and nothing capped it` });
  const ticked = await POST("op=airuntick&token=mem-r60", { run: RUN, at: NOW, leaseMs: 600000, log: entries });
  t("REC-70 FIXTURE: and it records SIX observations, so a bound of 2 CUTS and a bound of 5000 does not",
    ticked?.ticked, true);

  const whole = await GET(`op=airunlog&token=mem-r60&run=${RUN}&limit=5000`);
  t("REC-70 FIXTURE: ARMED — the whole log is six entries, measured before anything is asserted "
  + "over a cut of it",
    Array.isArray(whole?.entries) ? whole.entries.length : "MISSING entries", 6);

  const cut = await GET(`op=airunlog&token=mem-r60&run=${RUN}&limit=2`);
  t("op=airunlog: publishes the bound it APPLIED — the clamped cap, never the number asked for",
    cut.limit, 2);
  t("op=airunlog: a cut answer SAYS SO — whether these are the run's observations or its first N "
  + "is READABLE, and §14b.7's resumed run is the reader that cannot afford to guess",
    cut.truncated, true);
  t("op=airunlog: a complete answer says the opposite", whole.truncated, false);
  t("op=airunlog: DELTA — 'this is the whole log' and 'this is the first N' do NOT read alike",
    cut.truncated !== whole.truncated, true);
  t("op=airunlog: and the collection itself is still there, cut to the bound",
    Array.isArray(cut?.entries) ? cut.entries.length : "MISSING entries", 2);
  /* ASCENDING ORDER IS THE CONTRACT AND THE CUT FALLS AT THE END. op=exportlog
     — the sibling this default came from — orders DESC because an administrator
     wants the newest export; §14b.7 replays this log FROM THE START, so
     reusing that ordering with the bound would have silently handed a resumed
     run the END of its own history and called it the beginning. */
  t("op=airunlog: the cut falls at the END — a bounded log still starts at seq 1, because the "
  + "resumed run replays forward and op=exportlog's newest-first ordering would have handed it "
  + "the wrong half",
    cut.entries.map((e) => e.seq), [1, 2]);
  const over = await GET(`op=airunlog&token=mem-r60&run=${RUN}&limit=99999`);
  t("op=airunlog: an over-ask is answered at the CEILING and the CEILING is what is published — "
  + "echoing 99999 back would be a second way of lying about the same fact",
    over.limit, 5000);
  const dflt = await GET(`op=airunlog&token=mem-r60&run=${RUN}`);
  t("op=airunlog: a caller that asks for NO bound is answered at the DEFAULT and is TOLD which — "
  + "the state this op shipped in was a caller who could not know a bound had been applied",
    [dflt.limit, dflt.truncated], [200, false]);
  /* REC-30's rule, and the bound must not become a second oracle. An absent run
     and an unviewable one already read identically; publishing the cap on one
     and not the other would reintroduce the difference through the envelope. */
  const absent = await GET("op=airunlog&token=mem-r60&run=RUN-2026-0807-nope");
  t("op=airunlog: the ABSENT run publishes the same bound — REC-30's rule is that the unknown run "
  + "and the unviewable one read identically, and an envelope present on one answer and missing "
  + "from the other is a difference a caller can measure",
    [absent.found, absent.limit, absent.truncated], [false, 200, false]);
  t("op=airunlog: the bound APPLIED is viewer-INDEPENDENT — a viewer-dependent bound would let a "
  + "caller measure what is being withheld from them (D-15, REC-57's pin on op=list)",
    [(await GET(`op=airunlog&token=mem-r60&run=${RUN}&limit=3`)).limit,
     (await GET(`op=airunlog&token=prb-r60&run=${RUN}&limit=3`)).limit], [3, 3]);
  /* THE VOCABULARIES ARE UNCHANGED BY THE BOUND. The log publishes four of them
     precisely so its reader holds no copy (DEC-8); a truncated answer that also
     truncated the vocabulary would leave a cut reader unable to read the rows
     it DID get. */
  t("op=airunlog: a CUT answer still carries the four vocabularies whole — they describe the "
  + "entries, they are not entries, and a reader cut at 2 rows still has to read those 2",
    [Object.keys(cut.vocabulary || {}).sort().join(","),
     Object.keys(whole.vocabulary || {}).sort().join(",")],
    ["bounds,endings,levels,states", "bounds,endings,levels,states"]);
}

/* ==========================================================================
 * THE RIDER — `op=list`'s unbounded bare-array arm, DECIDED: KEEP, and the
 * licence PINNED rather than asserted in a comment.
 * ========================================================================== */
console.log("\n--- THE RIDER: op=list's unbounded arm is KEPT, and the licence is that it is COMPLETE ---");
const listBare = await GET("op=list&token=mem-r60");
const listPaged = await GET("op=list&token=mem-r60&limit=5000");
t("RIDER: the walk PUTS op=list ON THE BARE ROSTER, with its shape read as a BARE ARRAY — so this "
+ "decision is taken against a measurement, and the op is not quietly missing from the sweep that "
+ "would have raised it",
  [BARE_OPS.includes("list"), READS.get("listBundles")?.bareReturn], [true, true]);
t("RIDER: op=list with no `limit` still answers a BARE ARRAY — the shape difference REC-59 routed "
+ "here is REAL and is kept deliberately, not overlooked",
  Array.isArray(listBare), true);
t("RIDER: AND THAT IS THE LICENCE — the bare arm is COMPLETE. It returns every row the paged arm "
+ "TOTALS, so the array IS the answer and there is no applied bound being withheld. A bare array "
+ "is honest only while it is whole; the day this arm quietly caps, THIS assertion fails and the "
+ "exception goes with it",
  [Array.isArray(listBare) ? listBare.length : "NOT AN ARRAY", listPaged.total], [4, 4]);
t("RIDER: the two defects are SEPARATE, and this is what decides it. op=projection's corpus arm "
+ "APPLIED a bound and published none (dishonest); this arm applies none at all (honest but "
+ "unbounded) — so the paged arm publishes a bound and the bare arm has none to publish",
  [Object.hasOwn(listPaged, "limit"), Array.isArray(listBare) && !Object.hasOwn(listBare, "limit")], [true, true]);
t("RIDER: the shape is CALLER-SELECTED, which op=projection's never was — send a bound and you get "
+ "the envelope, send none and you get everything",
  [Array.isArray(await GET("op=list&token=mem-r60")), Array.isArray(listPaged)], [true, false]);
/* THE REASONING LIVES AT THE SITE, not only in a queue item. A marker pin, and it is stated as
   one: it proves the decision was WRITTEN where the next reader meets the code, and claims
   nothing about what it says. */
t("RIDER: and the reasoning is AT THE SITE — `listBundles`'s unbounded arm carries REC-60's "
+ "decision in source, so the next reader meets it at the code rather than in a queue item",
  /REC-60[^]{0,4000}?named consumer that requires completeness/i
    .test(segments(SRC_STORE).get("listBundles") || ""), true);

/* ==========================================================================
 * OVER-STRICTNESS. A pin that only accepts the phrasing its author wrote is
 * measuring its author. A correctly-enveloped read phrased unlike anything in
 * this file must PASS the classifier.
 * ========================================================================== */
console.log("\n--- OVER-STRICTNESS: a correctly-enveloped read phrased unlike anything here must PASS ---");
const ALTERNATIVES = [
  /* page_size + has_more, from a `rows()` source, in a vocabulary this plane never emits */
  ["ncPageSize", `  ncPageSize({ n } = {}) {
    const rows = this.#rows(\`SELECT * FROM t WHERE x=? LIMIT ?\`, n, 10);
    return { ok: true, records: rows.map((r) => r), page_size: 10, has_more: rows.length === 10 };
  }`],
  /* an RFC-5988-ish next link beside a cap, keys nested nowhere near this file's shapes */
  ["ncNextLink", `  ncNextLink({ n } = {}) {
    const found = this.#rows(\`SELECT * FROM t WHERE x=? LIMIT ?\`, n, 25);
    return { ok: true, items: found.slice(0, 25), cap: 25, next: "?after=X" };
  }`],
];
for (const [name, src] of ALTERNATIVES) {
  const probe = collectionReads(`class Z {\n${src}\n  end() { return 1; }\n}`);
  t(`OVER-STRICTNESS: \`${name}\` is correctly enveloped in a vocabulary this file never emits, and is NOT called bare`,
    [probe.has(name), probe.get(name)?.bare], [true, false]);
}
/* And the same classifier still REFUSES the shape this item existed to fix — an
   over-strictness arm that accepts everything proves nothing. */
const offender = collectionReads(`class Z {
  ncUncapped({ n } = {}) {
    const rows = this.#rows(\`SELECT * FROM t WHERE x=?\`, n);
    return { ok: true, count: rows.length, things: rows.map((r) => r) };
  }
  end() { return 1; }
}`);
t("OVER-STRICTNESS: and the classifier still CALLS BARE the exact shape this item existed to fix, "
+ "so it is a measurement and not a permissive reader",
  [offender.has("ncUncapped"), offender.get("ncUncapped")?.bare], [true, true]);

/* ---------------------------------------------- REC-70's OWN OVER-STRICTNESS.
   The inverted success gate is the change this item makes to the reader, so it
   gets its own over-strictness arm rather than riding the two above — which
   both spell success `ok: true` and would have passed before the change too. */
console.log("\n--- OVER-STRICTNESS (REC-70): success spelled ways this file does not, graded anyway ---");
const REC70_ALTERNATIVES = [
  /* `found: true`, correctly bounded, in a vocabulary neither this file nor the
     plane's meaning layer emits — the SPELLING that hid `op=airunlog`, phrased
     unlike the fix that was written for it. */
  ["ncFoundBounded", `  ncFoundBounded({ q, n } = {}) {
    const hits = this.#rows(\`SELECT * FROM t WHERE q=? LIMIT ?\`, q, n);
    return { found: true, rows_out: hits.map((r) => r), row_limit: n, rows_truncated: hits.length > n };
  }`, "bounded"],
  /* NO marker at all, which is how op=signerlist, op=publishedlist, op=inboxlist
     and op=memberlist answer — and every one of them was invisible. Unbounded,
     so it must be called BARE: reaching it is worth nothing if reaching it
     forgives it. */
  ["ncNoMarkerUncapped", `  ncNoMarkerUncapped({ q } = {}) {
    return { things: this.#rows(\`SELECT * FROM t WHERE q=?\`, q) };
  }`, "bare"],
];
for (const [name, src, want] of REC70_ALTERNATIVES) {
  const probe = collectionReads(`class Z {\n${src}\n  end() { return 1; }\n}`);
  t(`OVER-STRICTNESS (REC-70): \`${name}\` spells success without \`ok: true\` and is graded ${want.toUpperCase()}`,
    [probe.has(name), probe.get(name)?.verdict], [true, want]);
}
/* AND THE DENY-LIST IS NOT A LICENCE TO GRADE EVERYTHING. A refusal carrying a
   list is still a refusal, and grading it would put refusal shapes on the bare
   roster — an inverted gate that excluded nothing would be a different kind of
   broken reader, so the one exclusion is asserted rather than assumed. */
const refusal = collectionReads(`class Z {
  ncRefusal({ q } = {}) {
    const missing = this.#rows(\`SELECT * FROM t WHERE q=?\`, q);
    if (missing.length) return { ok: false, reason: "MISSING", missing: missing.map((r) => r.id) };
    return { ok: true, q };
  }
  end() { return 1; }
}`);
t("OVER-STRICTNESS (REC-70): a REFUSAL that carries a list is still a refusal and is NOT graded — "
+ "inverting the gate excludes exactly one shape, and excluding nothing would be its own defect",
  refusal.has("ncRefusal"), false);

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
