/* NEGATIVE CONTROL: (run 2026-08-05, rec57-agent) FOUR arms, each RUN. (1) DROP THE PUBLISHED BOUND — in src/store.mjs delete `limit: cap,` from any roster op's return block (e.g. taskList) -> the LIVE arm for that op fails naming it and what a consumer can no longer tell. (2) COUNT WHAT IT SENT — in documentsNamingEntity replace `truncated: merged.length > cap || aliasPageFilled` with `truncated: false` (the pre-REC-57 behaviour: `count` is the length of what was SENT and nothing says more exists) -> the DELTA arm fails, because a bitten call and a complete call read alike. (3) NEUTER THE ROSTER WALK — replace the body of `cappedMethods` with `return new Map()` -> the three REACH assertions fail AS DELTAS and the roster-vs-driven pin fails. (4) OVER-STRICTNESS — a correct answer phrased unlike anything this file wrote must not fail; asserted in the last block. */
/* NEGATIVE CONTROL: (run 2026-08-07, rec59-agent, IC-24/REC-59) FOUR arms, each RUN, every file restored BYTE-IDENTICALLY (sha256 compared). (1) REVERT op=projection TO THE BARE ARRAY — in src/store.mjs projection(), insert `return bundles;` above the envelope's `return {` -> 25 assertions fail across FOUR suites: bounds 6 (both PIN arms, the PIN GUARD, and three of op=projection's LIVE arms including the DELTA), gate-reads 4 (the enumeration, and all three of the viewer-gated `total` / viewer-independent `limit` arms), projection 3 (the json_extract read and both filter-total arms), projects 12. (1b) AND THE CONTROL FOUND A DEFECT IN THE INSTRUMENT RATHER THAN CONFIRMING IT: on the first run gate-reads, projection and projects all THREW on `.bundles.length` / `.find(...)` of undefined and DIED, hiding every arm behind the throw — D-93's class inside a control. Every migrated read is null-tolerant now, so the control NAMES what it broke; the failure counts above are the post-fix ones. (2) A SECOND BARE-ARRAY CAPPED OP, run in two stages because the stages fail differently and only the second is the pin: (2a) add a capped method returning a bare array plus its dispatch entry -> the walk FINDS it (`op=ncsecond -> ncSecondBareArray` prints on the roster) and 3 fail, headed by "every capped op the walk found is DRIVEN here"; (2b) additionally drive it into `answersByOp` -> **"PIN: ZERO capped ops answer with a bare array" FAILS with `got ["ncsecond"]`**, naming the offender, which is the proof it is a pin and not an exemption. (3) NEUTER THE WALKS, both of them: (3a) `cappedMethods` -> `return new Map()` -> 9 fail including all three REACH-AS-A-DELTA arms, with the corpus PRINTED as `0 carrying a cap, reaching 0 ops`; (3b) empty the consumer walk's corpus (`allFiles.length = 0`) -> 8 fail, corpus PRINTED as `0 files, 0 chars`, every REC-59 REACH arm among them — while "REC-59 REACH (THE FAILURE MODE NAMED)" deliberately STAYS GREEN, because its whole subject is that IC-24's claim still reads true over nothing. (4) OVER-STRICTNESS — inherited from REC-57 and still passing, plus this item's own PIN GUARD arm proving the array reader can still SEE an array when one is present. */
/* NEGATIVE CONTROL: (run 2026-08-07, rec60-agent, REC-60/D-225) THIS SUITE'S SHARE of REC-60's controls, run against the three ops that JOINED its roster when they gained a bound, each restored byte-identically. (1) RESTORE EACH UNBOUNDED READ in src/store.mjs — drop `LIMIT ?`/`cap + 1` and the `limit:`/`truncated` keys — and this file fails FOUR arms per op, every one naming it: the bound-applied arm, both direction arms, and the DELTA. Run per op: resolutionsForCapture 4, documentsConcerning 4, connectionsFor 4. (2) COUNT WHAT IT SENT (`const truncated = false;` beside a real slice) -> 2 fail per op here, the cut-answer arm and the DELTA. Note that the WALK stays green under (2) — the scan is still capped, so `OPS.size` is still 14 and only the LIVE arms catch a dishonest answer. (3)/(4) are `test/meaning-bounds.test.mjs`'s, which is where REC-60's own walk and its reach deltas live. */
/* REC-57 · EVERY CAPPED OP PUBLISHES THE BOUND IT APPLIED, AND WHETHER IT BIT.
 * ===================================================================== *
 * UI-39 measured this one layer up: a plane that caps and does not say so forces
 * every consumer to guess or to author its own bound. It named two ops. THE
 * ITEM IS NOT THE TWO OPS — it is the CLASS, so the roster is read off
 * `store.mjs`/`query.mjs` here rather than listed, and the list UI-39 could see
 * is the smaller half of it.
 *
 * WHY THIS IS NOT COSMETIC. The consumer is a COMPLETENESS CLAIM in every case.
 * UI-25 existed because a member with more than 500 hits could cite only the
 * first 500 into a case and nothing said so. `op=audit` publishes `ok` over ONE
 * PAGE; `op=exportlog` shows an administrator the newest 200 rows of a log the
 * export manifest describes to them as append-only and complete. A count of what
 * was SENT and a count of what EXISTS are different claims, and a producer that
 * publishes only the first has said the second.
 *
 * THE TWO QUESTIONS A CAPPED ANSWER MUST SETTLE, and they are separate:
 *   (1) WHAT BOUND DID YOU APPLY?  -> `limit`, the cap AFTER clamping. Never the
 *       number the caller asked for: answering 5000 to a caller who asked 5000
 *       and got 500 is a second way of lying about the same fact.
 *   (2) IS THIS ALL OF IT?         -> whatever this op already says it with.
 *
 * (2) IS DELIBERATELY NOT ONE WORD, and that is the REC-55 rule rather than
 * sloppiness. The plane already answers it in four spellings, each of which
 * gives the caller something a bare flag would not: `truncated` (op=queue),
 * `cursor` (op=audit, op=list, op=searchindexcheck — non-null means "more, and
 * resume HERE"), `remaining` (op=taskdrain, op=reproject — "run me again, this
 * many left"), and `total` beside `limit`/`offset` (op=search, which had this
 * right all along and is the model the rest were brought to). Minting a fifth
 * word and pasting it beside the four would be two spellings of one fact, which
 * is the drift REC-55 explicitly declined to add. So this suite asserts the
 * PROPERTY — a caller can tell "this is all of it" from "this is the first N" —
 * and reads each op in its own vocabulary.
 *
 * WHAT WAS ACTUALLY WRONG, per op, measured and not assumed. Five published no
 * bound and no truncation signal at all (`readingname`, `tasks`, `exportlog`,
 * `reindexnames`, and the orphan list inside `searchindexcheck`); five published
 * the truncation signal and not the bound (`queue`, `audit`, `list`,
 * `taskdrain`, `reproject`, `searchindexcheck`'s page); one — `search` — was
 * already right. Nothing that already published a fact had a second spelling of
 * it added.
 *
 * THE WALK, AND WHY IT IS WIDER THAN UI-39'S. UI-39 found FOUR capped ops. It
 * matched a dispatch entry only when the entry forwarded `limit:` inside a
 * 400-character window, and four of these ops pass `body || {}` instead, so they
 * were invisible to it; and it looked only for a `limit = N` parameter default,
 * so a cap that lived in a named constant or a SQL literal was invisible too.
 * The walk here matches on the METHOD NAME off the dispatch and recognises four
 * cap shapes. It finds ELEVEN. The detector was widened rather than the source
 * reworded to suit it.
 *
 * THE WALK RUNS ON CODE, NOT ON PROSE, AND THIS COST A DRAFT. The first version
 * matched `LIMIT 200` inside a COMMENT THIS VERY ITEM HAD JUST WRITTEN and
 * reported two methods as capped that carry no cap at all — UI-35's class,
 * reproduced inside the instrument built to prevent it. Block comments are
 * blanked before any anchor is matched, and the blanking is itself guarded in
 * BOTH directions: a known code line must survive it and a known prose line must
 * not.
 *
 * REACH IS ASSERTED AS A DELTA, THREE TIMES. A walk that matches nothing reports
 * zero and passes forever; REC-56 neutered its own walk and found all five
 * direct judgements passing at zero cost over an empty corpus. So the corpus
 * size is PRINTED every run, and each walk is re-run over a MECHANICALLY BROKEN
 * copy of the same source and must find FEWER. The difference is the evidence.
 *
 * AND THE ROSTER DRIVES THE LIVE ARMS. The set of ops this file exercises is
 * asserted EQUAL to the set the walk found, so an op that grows a cap tomorrow
 * fails this suite until somebody drives it. That pin is what stops the live
 * half from silently covering less than the sweep claims.
 *
 * WHAT THIS SUITE DOES NOT MEASURE, stated so nobody trusts it for more. It
 * sweeps ops whose answer is bounded by a COUNT. It says nothing about an answer
 * bounded some other way (a depth walk, a gate, a time window), and `op=queue`'s
 * ancestor walk is bounded by depth and reports `undetermined` on its own terms.
 * REC-59, 2026-08-07 — THE LAST MEMBER OF THE CLASS, AND THE PIN INVERTED.
 * This header said: *"One roster op — `op=projection` — answers its capped arms
 * with a BARE ARRAY, which can carry no key at all; that is measured, named,
 * pinned to exactly one op, and filed as IC-23."* Two corrections, both dated,
 * neither exempted:
 *
 *   (a) THE IC NUMBER WAS WRONG. It is **IC-24**, not IC-23. IC-23 is REC-57's
 *       own additive change; IC-24 is this exception. The two were renumbered at
 *       integration when UI-40 took IC-22 in flight, and this sentence kept the
 *       pre-rebase number while `INTERFACE-CHANGES.md` and `INTERFACES.md` both
 *       carried the corrected one. Left alone it would have sent the next reader
 *       to the wrong contract to find out why an op is shaped as it is.
 *   (b) THE EXCEPTION IS CLOSED. IC-24 walked RESPONSES -> SETTLED and landed:
 *       both corpus arms now answer `op=list`'s envelope. So the pin no longer
 *       reads "exactly ONE op may answer with a bare array" — it reads **ZERO**,
 *       and it is MEASURED by driving every roster op rather than by comparing a
 *       hand-written Set against its own length. That is strictly stronger and it
 *       is the point of keeping the pin alive through the change: an exemption
 *       would have let the next such op join a list, and a pin makes it fail.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, extname, relative } from "node:path";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* =================================================================== * WALK — THE ROSTER OF CAPPED OPS, READ OFF THE PLANE'S OWN SOURCE.
 * ========================================================================== */
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SRC_QUERY = readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8");

/* Blank block comments. See the header: an anchor that matches prose measures
   the prose. `//` line comments are left alone deliberately — blanking them
   would have to reason about `https://` inside the SQL template literals, and
   no cap in this file lives in one. */
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

/* Split the class into METHOD SEGMENTS on signature lines at exactly two spaces
   of indent. Bounded by the NEXT signature rather than by brace matching: UI-35
   lost a draft to a brace matcher that did not skip comments and swallowed
   27,059 characters, and a boundary that cannot run past the next method cannot
   make that mistake. Comments are already blanked, so a prose line cannot open
   a segment either. */
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

/* FOUR CAP SHAPES. Each earned its place: `param-default` is the only one UI-39
   looked for; `named-cap` is how `op=exportlog` and the orphan list carry theirs
   after this item named their literals; `sql-literal` is how they carried them
   BEFORE, and is kept so a new literal cannot slip in unnamed; `clamp` catches a
   method that decides a bound in code without any of the other three. */
const CAP_CONST = /\b(?:LIMIT_DEFAULT|LIMIT_MAX|[A-Z][A-Z0-9_]*_MAX|[A-Z][A-Z0-9_]*_LIMIT(?:_DEFAULT|_MAX)?)\b/;
const cappedMethods = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const why = [];
    if (/\(\{[^)]*\blimit\s*=\s*\d+/.test(body)) why.push("param-default");
    if (/\bLIMIT\s+([2-9]|\d{2,})\b/.test(body)) why.push("sql-literal");
    if (/\bLIMIT\s+\?/.test(body) && CAP_CONST.test(body)) why.push("named-cap");
    if (/Math\.min\([^)]*\blimit/i.test(body) || /\blimit[^\n]*Math\.min\(/i.test(body)) why.push("clamp");
    /* A FIFTH CAP SHAPE, added 2026-08-07 by PL-9, and it closes a blind spot
       this walk has carried since REC-57 rather than merely admitting a new op.
       All four shapes above look for the bound INSIDE the method. `op=search`'s
       bound is not there: it lives in `query.mjs` as `LIMIT_DEFAULT`/`LIMIT_MAX`,
       is applied by `compile()`, and reaches the answer as `plan.limit`. So THE
       ONE OP REC-57's header calls *"the model the rest were brought to"* was
       itself invisible to the roster that drives the bare-array pin — and PL-9's
       `op=meaningrows`, capped the same way in the same module, would have been
       invisible for the same reason. The property is real and not a spelling:
       a method that PUBLISHES a bound taken off a compiled plan is a capped
       method. The detector is widened; neither source is reworded to suit it,
       which is REC-57's own rule for this walk. */
    if (/\bplan\.(?:[a-z][\w$]*\.)?limit\b/.test(body)) why.push("compiler-cap");
    if (why.length) out.set(name, why);
  }
  return out;
};
/* op -> method, off the dispatch, ANCHORED ON THE METHOD NAME. UI-39's version
   required the entry to forward `limit:` in its argument text and therefore
   missed every entry that forwards `body || {}`. */
const cappedOps = (code, methods) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) if (methods.has(m[2])) out.set(m[1], m[2]);
  return out;
};

const CODE = decomment(SRC_STORE);
const METHODS = cappedMethods(CODE);
const OPS = cappedOps(CODE, METHODS);

console.log("\n--- WALK: the roster, read off the plane's own source ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${segments(CODE).size} method segments, ` +
            `${METHODS.size} carrying a cap, reaching ${OPS.size} ops`);
for (const [op, meth] of [...OPS].sort()) console.log(`    op=${op.padEnd(20)} -> ${meth}`);

/* GUARDS. A regex that silently yielded nothing makes every assertion below
   vacuous, which is the failure the whole sweep exists to prevent. */
t("WALK GUARD: block comments are blanked, and a known CODE line SURVIVES it",
  /static SEARCH_ORPHAN_MAX = 100;/.test(CODE), true);
t("WALK GUARD: and a known PROSE line does NOT — the anchor cannot match this item's own comments",
  /buried in its statement/.test(CODE), false);
t("WALK GUARD: the segmenter partitions the class into a plausible number of methods",
  segments(CODE).size > 250, true);
t("WALK GUARD: a segment is bounded by the NEXT method and does not run into it",
  [/const cap = Math\.max\(1, Math\.min\(1000/.test(segments(CODE).get("taskList")),
   /taskDrain\(\{/.test(segments(CODE).get("taskList"))], [true, false]);
t("WALK GUARD: the roster is non-trivial", METHODS.size >= 10, true);
t("WALK GUARD: and it reaches ops through the dispatch", OPS.size >= 8, true);

/* THE TWO OPS THE ITEM NAMED ARE ON THE PLANE'S OWN ROSTER — found through the
   source, never listed here. */
t("WALK: op=readingname and op=tasks, the two the item named, are on the roster the source yields",
  [OPS.get("readingname"), OPS.get("tasks")], ["documentsNamingEntity", "taskList"]);
/* AND THE ITEM'S PREMISE IS WIDENED BY THE MEASUREMENT: nine more.
   CORRECTED 2026-08-07 (REC-60 / D-225): 11 -> 14, and the old figure is SUPERSEDED rather
   than wrong — it was the true measurement on the day it was written. `op=resolutions`,
   `op=concerns` and `op=connections` were UNCAPPED, so REC-57's roster could not see them:
   it enumerates methods that CARRY A CAP, and a method with no cap at all is invisible to
   it. REC-60 gave all three a bound, which is what puts them on this roster — and this
   assertion failing on a clean tree is how the two instruments were made to agree. The
   label no longer says "nine wider" because the count of what the sweep found beyond the
   two named ops is now twelve, and a stale sentence beside a corrected number is the drift
   this suite exists to catch. */
/* CORRECTED 2026-08-07 (PL-9), not exempted, and 14 was the true measurement on
   the day it was written. 14 -> 16 for TWO reasons that are one reason: the walk
   gained its fifth cap shape (`compiler-cap`, at `cappedMethods` above) and
   therefore now sees `op=search`, whose bound has always lived in `query.mjs`
   and was never on this roster; and `op=meaningrows`, PL-9's new meaning-grain
   read, is capped the same way in the same module. So one of the two is a NEW
   op and the other is an op this instrument could not previously see — the same
   correction REC-60 made when three uncapped reads gained a bound, arriving from
   the other direction. The label no longer counts "wider than the pair", because
   a stale sentence beside a corrected number is the drift this suite exists to
   catch.
   CORRECTED 2026-08-07 (PL-10), not exempted, and 16 was the true measurement on
   the day it was written. 16 -> 17 for ONE reason: `op=versionchain`, D-220's
   document-version chain, is a NEW capped read — the third kind of arrival this
   number has seen, after "an uncapped read gained a bound" (REC-60) and "the
   walk grew a shape and could finally see an op it always missed" (PL-9). It
   carries its cap in its own body as a named constant beside `LIMIT ?`, which is
   the `named-cap` shape this walk has recognised since REC-57, so nothing about
   the detector had to move to admit it. The label no longer counts against the
   pair the item named, because a stale sentence beside a corrected number is the
   drift this suite exists to catch.

   CORRECTED AGAIN 2026-08-07 (REC-70), not exempted, and 16 was the true
   measurement on the day PL-9 wrote it. 16 -> 17: `op=airunlog` gained a cap.
   It is a plain JOIN — a read that carried no bound now carries one — and the
   arrival is worth a sentence because of HOW it was found. It was NOT found by
   this walk, which enumerates methods that carry a cap and therefore cannot see
   a method that carries none; and it was NOT found by the sibling walk built for
   exactly that blind spot either, because `meaning-bounds.test.mjs` graded only
   returns spelling success `ok: true` while `aiRunLog` answers `found: true`.
   TWO instruments, each blind to it for its own reason, and it was found by hand
   at another item's integration. Both are corrected; both now name it. */
/* CORRECTED 2026-08-08 (PL-3 / IS-4), not exempted, and 21 was the true
   measurement on the day PL-12's rebase wrote it. 21 -> 22 for ONE reason:
   `op=suggest`, the investigative session's write, carries TWO named caps
   (`SUGGEST_LEGS_MAX`, `SUGGEST_ORIGIN_MAX`) beside `LIMIT ?`, which is the
   `named-cap` shape this walk has recognised since REC-57 — so nothing about the
   detector had to move to admit it.

   AND IT IS A FOURTH KIND OF ARRIVAL ON THIS ROSTER, worth its own sentence
   because the three before it were all READS. This one is a WRITE, and its
   bounds do not TRUNCATE — they REFUSE. A read cut at its cap must say so or a
   caller believes it saw everything; a write over its cap is turned away naming
   the bound, so the caller knows exactly what did not happen. Both settle
   REC-57's two questions and they settle them differently, which is why this op
   is driven below the loop rather than inside it: the loop's descriptor asks for
   a small bite and a completeness flag, and there is no bite to take. */
/* CORRECTED 2026-08-08 (PL-4 / IS-4), not exempted, and 22 was the true
   measurement on the day PL-3 wrote it, hours before this. 22 -> 24, and BOTH
   arrivals are the capture-request door: `op=capturerequests` is a capped READ
   (`LIMIT ?` against a clamped `cap`, the ordinary shape) and
   `op=capturerequestdrain` is a capped WRITE-ish consumer whose bound is
   `CAPTURE_REQUEST_TICK_BATCH` — how many requests one drain tick will act on.

   THE DRAIN IS A FIFTH KIND OF ARRIVAL and it earns its own sentence. Its bound
   neither truncates an answer nor refuses a submission: it PACES an outward act.
   What a caller loses if it goes unpublished is not "did I see everything" but
   "is there more work queued at somebody else's server", so the honest signal is
   `remaining` — a count of what is still waiting — and that is what it
   publishes. Both are driven below the loop rather than inside it, on
   `op=suggest`'s precedent, because the loop's descriptor asks for a small bite
   and a completeness flag and a tick has no bite to take. */
t("WALK: the roster is TWENTY-FOUR ops — the sweep is the item, not the two the item named",
/* CORRECTED 2026-08-07 (PL-1), not exempted, and 18 was the true measurement on the day
   CONDUCT wrote it below. 18 -> 19 for ONE reason: `op=basisversions`, IS-1's read of an
   inquiry's basis VERSIONS, is a NEW capped read — the same kind of arrival PL-10 recorded,
   a method carrying its cap as a named constant beside `LIMIT ?`, so nothing about the
   detector had to move to admit it. Recorded as its own paragraph rather than folded into
   the one below, because the one below is a record of two items colliding on this number
   and that record is worth keeping intact. */
/* CORRECTED 2026-08-08 (PL-12), not exempted, and PL-1's 19 was true on the day it
   was written — three hours before this. **19 -> 21, and the number was MEASURED by
   running the walk rather than derived by adding.** PL-1 took 18 -> 19 and PL-12 took
   18 -> 20 from the same base, in different worktrees, neither able to see the other;
   19 + 2 and 20 + 1 both happen to give 21 here, and that coincidence is exactly why
   it must not be arrived at by arithmetic — CONDUCT's instruction at this rebase was
   to run it and take what the walk reports, because THIS PIN'S OWN SUBJECT is that
   hand-carried counts go stale, and it has now been corrected at integration twice for
   that reason.
   THE TWO PL-12 ARRIVALS, and the second is the one worth reading: THE ITEM EXPECTED
   ONE AND THE WALK FOUND TWO. `op=biasmanifest` is a new capped read, PL-10's kind of
   arrival — born with its bound. `op=biasinhale` also carries a named cap, and the
   item's author had not counted it as a bounded read at all because it opens no table:
   it is a pure function over a policy document the caller POSTed. It publishes three
   collections regardless, and a RESIDUE silently cut at N is precisely the failure
   DEC-54 (b) exists to prevent. The walk was right and the item was wrong, which is the
   direction this pin is for.
   AND ONE SHAPE THIS ROSTER HAD NOT CARRIED BEFORE: `biasManifest` applies its bound
   with `Array.prototype.slice` over a set it composed in memory, NOT with `LIMIT ?` in
   SQL. It must — the effective set is instance statements minus project nullifications
   plus project additions, so a SQL limit on either input would cut the set BEFORE the
   subtraction and change WHICH statements are in force rather than how many are shown.
   The walk finds it anyway because the cap constants carry their own names, which is
   the property REC-57 chose the detector for, proved here for a non-SQL bound. */
/* CORRECTED TO 18 AT INTEGRATION, 2026-08-07 by CONDUCT — and the correction is the point.
   PL-10 and REC-70 landed in the same integration and EACH corrected this pin 16 -> 17,
   for DIFFERENT ops: `op=versionchain` (a new capped read) and `op=airunlog` (a read that
   carried no bound and gained one). Both comment blocks above are true and both are kept.
   Taking either worker's number would have left this pin asserting 17 over a roster of 18 —
   a hand-carried count going stale in the very suite whose subject is that counts go stale.
   Two items may not both be right about a shared number, and merging them is the integrator's.
   CORRECTED TO 21, 2026-08-08 at PL-12's rebase — MEASURED, not added up. See the block
   immediately above the assertion for why the arithmetic agreeing was not evidence. */
/* CORRECTED TO 24, 2026-08-08 by PL-4 — MEASURED by running the walk in this
   worktree and taking what it printed, never by adding two to PL-3's figure. See
   the block above for the two arrivals and for why the drain is a shape this
   roster had not carried. */
/* CORRECTED TO 25, 2026-08-08 by PL-14 / IS-7 — MEASURED by running the walk in
   this worktree and taking what it PRINTED (it reported 25 against a pin of 24),
   never by adding one to PL-4's figure. The arrival is `op=versionstrength`, the
   strength pair over one reading of a question's evidence, and it is a SIXTH
   kind on this roster:

   ITS BOUND IS NOT THE CALLER'S. Every other capped read here takes a `limit`
   and publishes the one it applied; this op takes none, because a caller has no
   business asking for HALF a reading. The cap is `BASIS_VERSION_LEGS_MAX` — the
   same named constant `op=basisversions` reads legs with — and what it protects
   is not the answer's size but the answer's HONESTY: a strength is a fact about
   a WHOLE composition, so a pair computed over a reading that was read short
   would be a wrong number rather than a short list. The completeness signal is
   therefore `legs_complete` (with `legs_read` beside it), in `op=basisversions`'
   own idiom rather than `truncated`, because what a caller must learn is not
   "was this cut" but "is this the whole reading the letters were derived from".

   AND WHAT IS DELIBERATELY NOT SHIPPED, stated so the next reader does not think
   it was missed: the op does NOT refuse when `legs_complete` is false. It would
   be the stricter posture and arguably the right one, but no path in this plane
   can produce a version over 500 legs — the WRITE cap is 120 — so the refusal
   would be a code nobody could drive, which PL-4 recorded as the reason to
   delete rather than ship one. The honest fact is published instead. */
  OPS.size, 25);

/* op=search's cap lives in query.mjs as a module constant, not as a parameter
   default, so it is confirmed by its own name — and it is the op the others were
   brought into line WITH. */
const LIMIT_DEFAULT = Number((/LIMIT_DEFAULT\s*=\s*(\d+)/.exec(SRC_QUERY) || [])[1]);
const LIMIT_MAX = Number((/LIMIT_MAX\s*=\s*(\d+)/.exec(SRC_QUERY) || [])[1]);
t("WALK: op=search's bound is query.mjs's own published pair, and it is the model",
  [LIMIT_DEFAULT, LIMIT_MAX, LIMIT_MAX > LIMIT_DEFAULT], [50, 500, true]);

/* ---------------------------------------------------------- REACH, AS DELTAS.
   Each walk re-run over a MECHANICALLY BROKEN copy of the same source, which
   must yield FEWER. The absolute number is not the evidence; the difference is. */
const strippedCaps = CODE.replace(/\blimit\s*=\s*\d+/g, "limit = null")
                         .replace(/Math\.min\(/g, "Number(")
                         .replace(/\bLIMIT\s+\d+/g, "LIMIT ?")
                         .replace(CAP_CONST, "zzz");
const strippedMethods = cappedMethods(strippedCaps);
t("REACH IS A DELTA (methods): stripping the caps from a copy of store.mjs shrinks the roster the walk finds",
  strippedMethods.size < METHODS.size, true);
t("REACH IS A DELTA (ops): and shrinks the ops it reaches",
  cappedOps(strippedCaps, strippedMethods).size < OPS.size, true);
/* The dispatch walk has its own reach, independent of the method walk: break the
   ARROW SHAPE it anchors on and it must find fewer even with the roster intact. */
t("REACH IS A DELTA (dispatch): breaking the dispatch arrow shape shrinks the ops found, with the roster unchanged",
  cappedOps(CODE.replace(/\)\s*=>\s*this\./g, ") => that."), METHODS).size < OPS.size, true);

/* =================================================================== * LIVE — every roster op driven through its real route, twice: once with the
 * bound BITING and once with it NOT. The pair is the assertion.
 * ========================================================================== */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The automatic drain is pushed far out so the taskdrain arm below is never
     raced by the alarm — task-fence.test.mjs's precedent. */
  bindings: { ADMIN_TOKEN: "adm-r57", MEMBER_TOKEN: "mem-r57", PROBE_TOKEN: "prb-r57",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

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

/* THREE captured documents, each with a reading NAMING the same subject, so one
   registered alias reaches all three and a cap of 1 provably bites. */
const CAPS = [];
for (let i = 1; i <= 3; i++) {
  const id = `INFO-2026-000${i}-r57`;
  const md = bundleMd(id);
  const capture = sha(`r57-${i}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:26-090${i}`, kind: "legislation", key: `26-090${i}`, label: LABEL }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r57", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r57", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  CAPS.push(capture);
}
const ENT = (await POST("op=entitycreate&token=mem-r57", { kind: "contract", label: LABEL })).entity_id;
if (!ENT) throw new Error("entitycreate failed");

/* Three task EVENTS on the three registered captures (there is deliberately no
   control-plane enqueue), and two exports, so every roster op has more than one
   of whatever it counts. */
for (let i = 0; i < 3; i++)
  await DO("taskenqueue", { kind: "authority-undetermined", captureSha: CAPS[i],
                            subject: `https://example.gov/doc${i}.pdf`,
                            locator: `https://example.gov/doc${i}.pdf`, at: NOW });
/* THE FIXTURE IS PROVED TO ARM THE TRAP, rather than assumed to. A corpus that
   never exceeds a cap would let every `truncated:false` below pass at zero cost
   — the "green first time with the defect present" shape that caught two arms
   today. Three of everything, against caps of one. */
t("FIXTURE ARMS THE TRAP: three captured documents exist, so a cap of 1 has something to cut",
  (await GET("op=list&token=mem-r57&limit=100")).total, 3);
t("FIXTURE ARMS THE TRAP: three task events are queued, so a drain of 1 leaves work behind",
  (await GET("op=tasks&token=mem-r57")).counts.queued, 3);

/* op=taskdrain is driven HERE rather than in the loop below, because draining is
   what CREATES the tasks the op=tasks and op=queue arms then read: its two calls
   are this suite's fixture as well as its own pin. `remaining` is its own
   'this is not all of it' — see the header on why no `truncated` is minted. */
console.log("\n--- LIVE: op=taskdrain, whose two calls are also the task fixture ---");
const td1 = await POST("op=taskdrain&token=mem-r57", { limit: 1, now: NOW });
t("op=taskdrain: publishes the bound this pass applied", td1.limit, 1);
t("op=taskdrain: and `remaining` says the queue is not drained — its own 'this is the first N'",
  [td1.drained, td1.remaining], [1, 2]);
const td2 = await POST("op=taskdrain&token=mem-r57", { limit: 500, now: NOW });
t("op=taskdrain: DELTA — a pass that emptied the queue reads differently from one that was cut",
  [td2.limit, td2.remaining > 0, td1.remaining > 0], [500, false, true]);
t("FIXTURE ARMS THE TRAP: three tasks now exist, so op=tasks and op=queue have something to cut",
  (await GET("op=tasks&token=mem-r57&limit=500")).tasks.length, 3);

/* TWO EXPORTS, so the append-only export log has more than one row and a cap of
   1 provably bites it. */
for (const note of ["first", "second"]) {
  const e = await GET(`op=export&token=adm-r57&note=${note}`);
  if (e?.ok === false) throw new Error(`export ${note}: ${JSON.stringify(e)}`);
}
t("FIXTURE ARMS THE TRAP: the append-only export log carries two rows, so a cap of 1 cuts it",
  (await GET("op=exportlog&token=adm-r57&limit=200")).exports.length, 2);

/* ------------------------------------------------------ PL-10 / D-220's FIXTURE.
   The version chain joined this roster as a NEW capped read. It counts VERSIONS
   AT ONE ADDRESS, so the three registered captures above are recorded as three
   versions of one document — which is the whole subject of D-220 and also, here,
   simply three of something against a cap of one. Written straight at the DO,
   the way op=acquire writes it, because there is no control-plane route that
   records a locator. */
const VC_ADDR = "https://example.gov/agenda.pdf";
for (let i = 0; i < CAPS.length; i++)
  await DO("recordcapturedlocator", { address: VC_ADDR, addressNorm: VC_ADDR, captureSha: CAPS[i],
                                      retrieved: `2026-0${i + 1}-15T00:00:00Z` });
t("FIXTURE ARMS THE TRAP: three versions of ONE document sit at one address, so op=versionchain's cap of "
+ "1 has something to cut — and the chain is three long while the corpus is three documents, which is "
+ "D-220's whole point arriving as a fixture",
  (await GET(`op=versionchain&token=mem-r57&address=${encodeURIComponent(VC_ADDR)}&limit=5000`)).total, 3);

/* ------------------------------------------------------ PL-12 / D-84's FIXTURE.
   The bias manifest joined this roster as a NEW capped read. It counts the
   STATEMENTS IN THE EFFECTIVE SET, so the set needs more than one before a cap
   of 1 can be shown to bite — three, matching everything else here.

   THE ADOPTION IS WRITTEN AT THE DO, and the reason is worth stating because it
   is a property of the feature rather than a convenience: `op=biasadopt` REFUSES
   a machine credential by name (C-26.9), since adoption is an authored,
   attributed act (DEC-46, D-90, D-82) and `mem-r57` is a token with no member
   behind it. This suite holds no member session, so the row is written the way
   `recordcapturedlocator` above is — straight at the Durable Object. That is a
   fixture shortcut and NOT a hole: the refusal it steps around is driven through
   the real control plane in test/bias.test.mjs. */
const BIAS_ID = "BIAS-2026-0001-r57";
const biasMd57 = (state) => [
  "---", `id: ${BIAS_ID}`, "object_type: bias", "schema: bias@1",
  `title: "${BIAS_ID}"`, `current_state: ${state}`, "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: human",
  "  capability_tier: member", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []",
  "statements:",
  ...[1, 2, 3].flatMap((i) => [
    `  - id: "s${i}"`, "    kind: \"scrutiny\"", `    subject: "ENT-2026-000${i}"`,
    `    text: "Claims from source ${i} need a second, independent record before they bear load."`,
    `    justification: "Source ${i} is a party to a matter this group is examining."`,
    "    citations: []", "    locked: false"]),
  "---", "", "## Statements", "", "Three of them.", "",
  "## Adoption", "", "Adopted under the group's own process document.", "",
  "## What This Does Not Enforce", "",
  "It does not check source independence, direct knowledge, or chain of custody.", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
{
  const mk = async (state, base) => {
    const md = biasMd57(state);
    const r = await POST("op=promote&token=mem-r57", {
      bundleId: BIAS_ID, base, snapKey: `${BIAS_ID}-${base ? "rev" : "new"}`, author: "r57",
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
      meta: { object_type: "bias", group: "believe-in-oakland", title: BIAS_ID,
              current_state: state, created: NOW, last_updated: NOW } });
    if (r?.ok === false) throw new Error(`promote ${BIAS_ID} ${state}: ${JSON.stringify(r)}`);
    return r.bundleSha;
  };
  const proposedSha = await mk("proposed", null);
  const ad = await DO(`biasadopt?bundleId=${BIAS_ID}&scope=instance&author=r57-member`);
  if (ad?.ok === false) throw new Error(`biasadopt: ${JSON.stringify(ad)}`);
  await mk("adopted", proposedSha);
}
t("FIXTURE ARMS THE TRAP: three statements are in force, so op=biasmanifest's cap of 1 has something to cut",
  (await GET("op=biasmanifest&token=mem-r57&scope=instance&limit=5000")).total, 3);

/* ------------------------------------------------- REC-60 / D-225's FIXTURE.
   The three meaning-layer reads joined this roster when they gained a bound, so
   they must have MORE THAN ONE of whatever they count or every `truncated:false`
   below passes at zero cost. Resolve all three documents against the subject (a
   resolution row each, so op=concerns has three), derive the connections among
   them (three pairs, D-224's k(k-1)/2 at k=3), and testify a SECOND subject onto
   one document's reference so op=resolutions has two rows on one capture. */
for (const c of CAPS) {
  const r = await POST("op=resolve&token=mem-r57", { captureSha: c, resolvedBy: "r57" });
  if (r?.ok === false) throw new Error(`resolve ${c}: ${JSON.stringify(r)}`);
}
const ENT2 = (await POST("op=entitycreate&token=mem-r57", { kind: "contract", label: "Second Subject r60" })).entity_id;
if (!ENT2) throw new Error("entitycreate (second) failed");
const testified = await POST("op=resolvetestify&token=mem-r57",
  { captureSha: CAPS[0], ref: "legislation:26-0901", entityId: ENT2,
    basis: "REC-60 fixture: a second subject on the same reference, so one capture carries two resolutions",
    resolvedBy: "r57" });
if (testified?.ok === false) throw new Error(`resolvetestify: ${JSON.stringify(testified)}`);
const derived = await POST("op=connect&token=mem-r57", { entityId: ENT, assertedBy: "r57" });
if (derived?.ok === false) throw new Error(`connect: ${JSON.stringify(derived)}`);
t("FIXTURE ARMS THE TRAP: three documents concern the subject, so op=concerns' cap of 1 has something to cut",
  (await GET(`op=concerns&token=mem-r57&id=${ENT}&limit=5000`)).count, 3);
t("FIXTURE ARMS THE TRAP: the three documents form THREE connections — k(k-1)/2 at k=3, D-224's curve, "
+ "which is why this is the read the bound was raised for",
  (await GET(`op=connections&token=mem-r57&id=${ENT}&limit=5000`)).count, 3);
t("FIXTURE ARMS THE TRAP: one capture carries TWO resolutions, so op=resolutions' cap of 1 cuts it",
  (await GET(`op=resolutions&token=mem-r57&sha256=${CAPS[0]}&limit=5000`)).count, 2);

/* ------------------------------------------------------------------ the pins.
   ONE DESCRIPTOR PER ROSTER OP: how to drive it, and how IT says "there is
   more". The `more` reader is each op's OWN vocabulary — see the header on why
   a fifth spelling is not minted. */
/* REC-70, 2026-08-07: the observation log needs a RUN with more than one entry
   before its bound can be shown to bite. Driven here rather than borrowed,
   because a descriptor on this roster that could not actually be called is the
   coverage-on-paper shape both these files exist to catch. */
const R70_RUN = "RUN-2026-0807-bounds70";
{
  const opened = await POST(`op=airunopen&token=mem-r57`, {
    run: R70_RUN, contextType: "inquiry", contextId: "INFO-2026-0001-r57",
    label: "REC-70 fixture — the observation log, bounded", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`REC-70 fixture airunopen: ${JSON.stringify(opened)}`);
  const ticked = await POST(`op=airuntick&token=mem-r57`, { run: R70_RUN, leaseMs: 600000,
    log: [1, 2, 3].map((i) => ({ level: "document", subject: `observation:r70-${i}`,
      state: "PRESENT", detail: `REC-70 fixture observation ${i}` })) });
  if (ticked?.ticked !== true) throw new Error(`REC-70 fixture airuntick: ${JSON.stringify(ticked)}`);
}
t("FIXTURE ARMS THE TRAP: the REC-70 run's log holds THREE observations, so op=airunlog's cap of 1 cuts it",
  (await GET(`op=airunlog&token=mem-r57&run=${R70_RUN}&limit=5000`)).entries?.length, 3);

/* ------------------------------------------------------- PL-1 / IS-1's FIXTURE.
   The basis-version read joined this roster as a NEW capped read. An inquiry
   carrying THREE alternative accounts of its evidence is what a cap of 1 has to
   cut; two would do, and three is used so an `offset` page in the middle is a
   real page. Written through op=promote because THERE IS NO OTHER WAY IN — the
   versions are a projection of bundle.md and the item's whole constraint is that
   no op appends to the tables directly. */
const PL1_INQ = "INQ-2026-0807-bounds-pl1";
{
  const v = (name, ground) => [`  - name: "${name}"`,
    `    description: "Reading ${name}, composed for the bound fixture and no other purpose."`,
    "    relationship: \"and\"", "    state: \"suggested\"", "    derived_from: null",
    "    hidden: false"].join("\n");
  const g = (name, ground) => [`  - version: "${name}"`, `    ground: "${ground}"`,
    "    asserted_by: \"r57\"", `    at: "${NOW}"`].join("\n");
  const l = (name, ground, target) => [`  - version: "${name}"`, `    target: "${target}"`,
    "    role: \"supports\"", `    ground: "${ground}"`].join("\n");
  const names = ["first reading", "second reading", "third reading"];
  const md = ["---", `id: ${PL1_INQ}`, "object_type: inquiry", "schema: inquiry@1",
    `title: "Which reading of the agenda holds?"`, "current_state: open", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
    "  capability_tier: session", "group: believe-in-oakland", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
    "  since: null", "  source: null", "visuals: []", "surfaced_by: agent",
    'disposition_reason: ""', "recheck_triggers:", "  - text: Revisit next cycle",
    "    description: The next agenda may restate it.",
    "basis_versions:", ...names.map((n) => v(n)),
    "basis_version_grounds:", ...names.map((n, i) => g(n, `route ${i + 1}`)),
    "basis_version_legs:", ...names.map((n, i) => l(n, `route ${i + 1}`, `INFO-2026-000${i + 1}-r57`)),
    "---", "", "## Question", "", "Which reading of the agenda holds?", "",
    "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
    "## Session Log", "", "## Review Notes", ""].join("\n");
  const r = await POST("op=promote&token=mem-r57", {
    bundleId: PL1_INQ, base: null, snapKey: `${PL1_INQ}-new`, author: "r57",
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: PL1_INQ,
            current_state: "open", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`PL-1 fixture promote: ${JSON.stringify(r).slice(0, 600)}`);
}
t("FIXTURE ARMS THE TRAP: one inquiry carries THREE alternative accounts of its evidence, so "
+ "op=basisversions' cap of 1 has something to cut",
  (await GET(`op=basisversions&token=mem-r57&id=${PL1_INQ}&limit=5000`)).total, 3);

const DRIVEN = [
  { op: "readingname", bite: 1, whole: 500,
    drive: (n) => GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether `count` is the number that EXIST or only the number it SENT" },
  { op: "tasks", bite: 1, whole: 500,
    drive: (n) => GET(`op=tasks&token=mem-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether the inbox is empty of further work or merely cut, which its sibling op=queue always said" },
  { op: "queue", bite: 1, whole: 500,
    drive: (n) => GET(`op=queue&token=mem-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "which bound produced a feed it already admits is truncated" },
  { op: "audit", bite: 1, whole: 1000,
    drive: (n) => GET(`op=audit&token=adm-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "whether `ok` is a verdict over the record or over one page of it" },
  { op: "list", bite: 1, whole: 5000,
    drive: (n) => GET(`op=list&token=mem-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "that a request for 100000 was silently answered at 5000" },
  { op: "searchindexcheck", bite: 1, whole: 1000,
    drive: (n) => GET(`op=searchindexcheck&token=mem-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "whether index parity was checked over the record or over one page" },
  { op: "exportlog", bite: 1, whole: 200,
    drive: (n) => GET(`op=exportlog&token=adm-r57&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "that an append-only log described as complete was shown newest-first and cut" },
  /* REC-59 / IC-24, 2026-08-07: the last member of the class, joining the roster
     it was the one exception to. It answers `op=list`'s envelope now, so it
     answers `op=list`'s completeness question in `op=list`'s own word — a
     non-null `cursor` — rather than being given a twelfth spelling of its own. */
  { op: "projection", bite: 1, whole: 5000,
    drive: (n) => GET(`op=projection&token=mem-r57&limit=${n}`),
    more: (a) => a.cursor !== null, says: "a non-null `cursor`",
    lost: "that the corpus was cut at 200 by a bound the wire could not see, ask for, or resume past" },
  /* REC-60 / D-225, 2026-08-07: the three MEANING-LAYER reads, which reached this
     roster from the direction it could not see — they carried NO cap, and a roster
     built from methods that carry one cannot enumerate the method that carries none.
     They answer in `op=readingname`'s vocabulary (`limit` beside `truncated`), the
     closest sibling and a keyed read over the same layer, rather than a twelfth
     spelling; see `test/meaning-bounds.test.mjs` for the walk that found them. */
  { op: "resolutions", bite: 1, whole: 5000,
    drive: (n) => GET(`op=resolutions&token=mem-r57&sha256=${CAPS[0]}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether a document's subjects are all of them, or the first N of an answer that grew with the reading" },
  { op: "concerns", bite: 1, whole: 5000,
    drive: (n) => GET(`op=concerns&token=mem-r57&id=${ENT}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether the reverse index answered over every document concerning the subject or over the first N rows of it" },
  { op: "connections", bite: 1, whole: 5000,
    drive: (n) => GET(`op=connections&token=mem-r57&id=${ENT}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether the graph around a subject is whole, on the one read that grows as k(k-1)/2 so the most "
        + "important subject produces the largest answer" },
  /* PL-9 / D-222 option C, 2026-08-07: the two COMPILER-CAPPED ops, which reached
     this roster only when the walk grew its fifth shape. Both answer completeness
     in `op=search`'s own vocabulary — `total` beside `limit` and `offset` — which
     is not a twelfth spelling but the FIRST one: REC-57's header calls op=search
     "the model the rest were brought to", and it is on the roster at last. */
  { op: "search", bite: 1, whole: 500,
    drive: (n) => GET(`op=search&token=mem-r57&q=&limit=${n}&facets=none`),
    more: (a) => a.offset + (a.hits?.length ?? 0) < a.total,
    says: "`total` beside `limit` and `offset`",
    lost: "that a corpus-wide read was answered at a bound the caller did not name — the very defect UI-25 "
        + "found when a member could cite only the first 500 hits into a case" },
  { op: "meaningrows", bite: 1, whole: 1000,
    drive: (n) => GET(`op=meaningrows&token=mem-r57&rows=concerns&q=${encodeURIComponent("has:resolves")}&limit=${n}`),
    more: (a) => a.offset + a.count < a.total,
    says: "`total` beside `limit` and `offset`",
    lost: "whether a basis was returned WHOLE or cut — and a basis returned in part reads as a basis, which "
        + "is a record claiming more than it can support" },
  /* PL-10 / D-220, 2026-08-07: the document-version chain, a NEW capped read
     rather than one this walk could not previously see. It answers completeness
     in `op=readingname`'s vocabulary — `limit` beside `truncated` — because it
     is the same kind of read: a KEYED lookup (an address, not a query) whose
     answer is a list. No spelling is minted for it. */
  { op: "versionchain", bite: 1, whole: 5000,
    drive: (n) => GET(`op=versionchain&token=mem-r57&address=${encodeURIComponent(VC_ADDR)}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether these are ALL the versions the record holds at this address or the first N of them — "
        + "and a version history that is silently the first N is the false-coverage failure D-220 exists "
        + "to remove, reappearing inside the op built to remove it" },
  /* REC-70, 2026-08-07: the OBSERVATION LOG, and it reached this roster the same
     way REC-60's three did — it carried no cap, so a roster built from methods
     that carry one could not enumerate it. It answers in `op=exportlog`'s
     vocabulary (`limit` beside `truncated`) because op=exportlog is the plane's
     only other append-only, `seq`-ordered log and this is its sibling by KIND,
     not a twelfth spelling.
     WHY IT IS HERE AND NOT MERELY IN meaning-bounds.test.mjs: that walk found it
     only after REC-70 corrected its success-marker gate — it had been grading
     just `ok: true` returns while this method answers `found: true`, hiding 27
     dispatched ops. Two instruments now name this op independently, which is the
     point: neither one's blind spot is the other's. */
  /* PL-12 / D-84, 2026-08-07: the bias manifest, a NEW capped read. It answers
     completeness in `op=search`'s vocabulary — `total` beside `limit` and
     `offset` — because it is a read whose answer is a SET the caller may page
     through, and op=search is the model REC-57's header says the rest were
     brought to. No spelling is minted for it.
     IT IS THE FIRST ROSTER OP WHOSE BOUND IS NOT `LIMIT ?` IN SQL, and that is
     forced rather than chosen: the effective set is instance statements minus
     project nullifications plus project additions, so a SQL limit on either
     input would cut the set BEFORE the subtraction and change WHICH statements
     are in force rather than how many are shown. */
  { op: "biasmanifest", bite: 1, whole: 5000,
    drive: (n) => GET(`op=biasmanifest&token=mem-r57&scope=instance&limit=${n}`),
    more: (a) => a.offset + a.count < a.total,
    says: "`total` beside `limit` and `offset`",
    lost: "whether this is the WHOLE lens the work was produced under or the first N statements of it — "
        + "and a manifest that is silently the first N would let a published case name a lens it was not "
        + "held to, which is the one thing the manifest exists to make checkable" },
  /* PL-12 / DEC-54 (b): the policy inhale. It reads NO table and is on this
     roster anyway, which is the point — it publishes three collections (bars,
     proposed statements, and the RESIDUE), and the residue is the one whose
     silent truncation would be a defect rather than an inconvenience: the whole
     ruling is that "its most valuable product is the list of what it COULD NOT
     mechanise". It answers in `op=readingname`'s vocabulary, `limit` beside
     `truncated`, because like that op it is a keyed request whose answer is a
     list rather than a query the caller pages through. */
  { op: "biasinhale", bite: 1, whole: 1000,
    drive: (n) => POST(`op=biasinhale&token=mem-r57&limit=${n}`, {
      policy: "A story may not run on more than one source unless each has been separately verified. "
            + "Consider whether the source is reliable and in a position to have direct knowledge. "
            + "Weigh the source's track record, position and motive before relying on what they say. "
            + "A refusal to comment does not mean the allegation is true. "
            + "Reporters must maintain a chain of custody for every document from a confidential source. "
            + "The subject of an investigative story must be given a meaningful opportunity to respond." }),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether the list of what BIO CANNOT check is complete or the first N of it — and DEC-54 (b) "
        + "makes that list the capability's most valuable output, because in four of five documented "
        + "verification failures the countable rules were satisfied while the uncountable ones failed" },
  { op: "airunlog", bite: 1, whole: 5000,
    drive: (n) => GET(`op=airunlog&token=mem-r57&run=${R70_RUN}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether these are the run's observations or its first N — and §14b.7's RESUMED run reads its own "
        + "log to continue rather than restart, so a cut it cannot see is work silently redone" },
  /* PL-1 / IS-1, 2026-08-07: the basis versions of one inquiry, a NEW capped
     read. It answers in `op=versionchain`'s vocabulary — `limit` beside
     `truncated`, with `offset` — because it is the same KIND of read: a KEYED
     lookup (one inquiry, not a query) whose answer is a list. No spelling is
     minted for it, and its 200/1000 pair is op=versionchain's reused. */
  { op: "basisversions", bite: 1, whole: 1000,
    drive: (n) => GET(`op=basisversions&token=mem-r57&id=${PL1_INQ}&limit=${n}`),
    more: (a) => a.truncated, says: "`truncated`",
    lost: "whether these are ALL the readings of the evidence this question carries or the first N — and a "
        + "member choosing between accounts of the evidence while an account they were never shown sits "
        + "behind a cut is the record deciding an argument by omission" },
];

console.log("\n--- LIVE: every roster op, driven twice — the bound biting, and not ---");
for (const d of DRIVEN) {
  const bitten = await d.drive(d.bite);
  const whole = await d.drive(d.whole);
  t(`op=${d.op}: publishes the bound it APPLIED, and it is the clamped cap and not the number asked for`,
    bitten.limit, d.bite);
  t(`op=${d.op}: a cut answer says so, in this op's own vocabulary (${d.says})`,
    d.more(bitten), true);
  t(`op=${d.op}: a complete answer says the opposite — ${d.lost} is READABLE, not inferred`,
    d.more(whole), false);
  /* THE DELTA. This is the accepts-when clause in one line: the two must not be
     able to read alike. Asserted as a difference on the SAME store, so it cannot
     pass by both calls happening to answer the same way. */
  t(`op=${d.op}: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike`,
    d.more(bitten) !== d.more(whole), true);
}

/* An over-ask is CLAMPED and the clamp is what is published — the half a caller
   could not see, and the reason echoing the request back would be a new lie. */
const over = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=99999`);
t("op=readingname: an over-ask is answered at the ceiling and the CEILING is what is published",
  over.limit, 500);
const overList = await GET("op=list&token=mem-r57&limit=99999");
t("op=list: likewise — 99999 asked, 5000 applied, 5000 published",
  overList.limit, 5000);

/* THE ITEM'S OWN (a), IN ITS OWN TERMS: `count` is the length of what was SENT
   and always was. What changed is that the answer now says which that is. */
const one = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=1`);
const all = await GET(`op=readingname&token=mem-r57&entity=${ENT}&limit=500`);
t("op=readingname: `count` is STILL the length of what was sent — unchanged, and that was never the defect",
  [one.count, one.documents.length, all.count, all.documents.length], [1, 1, 3, 3]);
t("op=readingname: the defect was that 1-of-3 and 3-of-3 published the same shape; now they do not",
  [one.truncated, all.truncated], [true, false]);
t("op=readingname: and a cut answer SAYS SO IN WORDS, so a member reading the detail is not left to the flags",
  [/THIS IS THE FIRST 1 AND NOT ALL OF THEM/.test(one.detail), /NOT ALL OF THEM/.test(all.detail)],
  [true, false]);

/* THE ITEM'S OWN (b): the two siblings on one surface now answer in ONE shape. */
t("op=tasks and op=queue: the two siblings publish the SAME two keys, so a consumer that reads one reads the other",
  [Object.hasOwn(one, "limit"), ...["tasks", "queue"].map(() => true)].length > 0
  && ["limit", "truncated"].every((k) => Object.hasOwn(all, k)), true);
const tk1 = await GET("op=tasks&token=mem-r57&limit=1"), q1 = await GET("op=queue&token=mem-r57&limit=1");
t("op=tasks answers the completeness question in op=queue's OWN shape — not a new one beside it",
  [["limit", "truncated"].every((k) => k in tk1), ["limit", "truncated"].every((k) => k in q1)], [true, true]);

/* ---------------------------------------------------- the two backfills, LAST,
   because both CLEAR a derived structure to arm themselves. `reindexnames`
   is not on the control plane at all (there is no OPS entry — M0-12: it is a DO
   PATH and naming it `op=` would be the wrong level), so it and the two
   clear paths are driven at the Durable Object — projection.test.mjs's
   precedent. */
console.log("\n--- LIVE: the two bounded BACKFILLS, which say 'run me again' rather than 'truncated' ---");
await DO("projectionclear", {});
const rp1 = await DO("reproject", { limit: 1 });
t("op=reproject: publishes the bound this pass applied", rp1.limit, 1);
t("op=reproject: and `remaining` says work is left — its own 'this is not all of it'", rp1.remaining > 0, true);
const rp2 = await DO("reproject", { limit: 500 });
t("op=reproject: DELTA — a pass that finished reads differently from one that was cut",
  [rp2.limit, rp2.remaining > 0, rp1.remaining > 0], [500, false, true]);

await DO("readingtermsclear", {});
const rn1 = await DO("reindexnames", { limit: 1 });
t("DO reindexnames: publishes the bound this pass applied", rn1.limit, 1);
/* THIS ONE WAS NOT IN THE ITEM'S BRIEF. It published `examined` — the count of
   what it TOOK, which EQUALS the cap on exactly the run where more is left —
   and no remainder, while its own sibling `#backfillProjection` published one.
   The op=tasks/op=queue defect, between two backfills, one layer down. */
t("DO reindexnames: `remaining` now says work is left, in its SIBLING's word rather than a third spelling",
  rn1.remaining > 0, true);
t("DO reindexnames: and `examined` alone could NOT have said it — it equals the cap on exactly that run",
  rn1.examined, rn1.limit);
const rn2 = await DO("reindexnames", { limit: 500 });
t("DO reindexnames: DELTA — a finished pass reads differently from a cut one",
  [rn2.remaining > 0, rn1.remaining > 0], [false, true]);

/* ------------------------------------------- the orphan list inside op=searchindexcheck.
   A SECOND, SEPARATE bound inside one op, hard-coded in the statement and named
   by nothing. `ok:false` on this op is a completeness claim about index parity,
   so an operator clearing a truncated orphan list would repair all of them and
   watch the op keep reporting findings. */
const sic = await GET("op=searchindexcheck&token=mem-r57&limit=1000");
t("op=searchindexcheck: the ORPHAN list carries its own bound and its own truncation flag, said separately",
  [sic.orphans_limit, sic.orphans_truncated], [100, false]);
t("op=searchindexcheck: and that bound is NOT the page's — two lists, two bounds, resumed differently",
  sic.orphans_limit !== sic.limit, true);

/* =================================================================== * THE ROSTER DRIVES THE SUITE — the pin that stops this file covering less
 * than the sweep claims.
 * ========================================================================== */
console.log("\n--- PIN: the ops driven are the ops the walk found ---");
/* Driven above the loop rather than inside it — `taskdrain` because its calls are
   also the task fixture, the two backfills because each must CLEAR a derived
   structure to arm itself and `reindexnames` has no control-plane entry at all. */
/* PL-3 / IS-4 joins them, and for a reason of its own rather than the three
   above: `op=suggest`'s caps REFUSE rather than truncate, so the loop's
   descriptor — take a bite of one, then read the completeness flag — has nothing
   to bite. It is driven immediately below with both arms, which is what keeps it
   DRIVEN rather than exempt. */
/* PL-4 / IS-4 joins them with TWO ops and one reason each. `capturerequests` is
   an ordinary capped read and COULD sit in the loop, but it is driven here with
   its sibling so the door's two bounds are read together rather than a page
   apart. `capturerequestdrain` cannot sit in the loop at all: its bound paces an
   OUTWARD ACT rather than cutting an answer, so there is no bite to take and the
   honest completeness signal is `remaining` — how much work is still queued at
   somebody else's server. */
/* PL-14 / IS-7 joins them, and for the reason its comment at the roster pin
   gives: `op=versionstrength` takes NO `limit` from the caller, so the loop's
   descriptor — ask for a bite of one, then read the completeness flag — has
   nothing to ask for. Its bound guards the honesty of a derived pair rather than
   the size of a list, and its completeness signal is `legs_complete`. */
const DRIVEN_ELSEWHERE = new Set(["taskdrain", "reindexnames", "reproject", "suggest",
                                  "capturerequests", "capturerequestdrain", "versionstrength"]);

/* ----------------------------------------------- PL-3 / IS-4's TWO ARMS.
   The write whose bound REFUSES. Driven against PL-1's fixture inquiry and
   REC-70's fixture run, both built above, so this adds no third corpus. */
const SUGGEST_OVER = await POST("op=suggest&token=mem-r57", {
  target: PL1_INQ, kind: "basis-version", run: R70_RUN, name: "over the bound",
  description: "A reading composed only to carry more legs than one reading may carry.",
  relationship: "and",
  legs: Array.from({ length: 121 }, () => ({ target: "INFO-2026-0001-r57", role: "supports" })),
});
t("op=suggest: a submission OVER the cap is REFUSED and the refusal PUBLISHES the bound — a write does "
+ "not truncate silently, because the caller has to know what did not land",
  [SUGGEST_OVER.ok, SUGGEST_OVER.code, SUGGEST_OVER.limit, SUGGEST_OVER.legs],
  [false, "SUGGEST_TOO_MANY_LEGS", 120, 121]);
/* THE SUCCESS ARM IS §9's EMPTY-LEVEL KIND, and that is a fact about this
   suite rather than about the op: `mem-r57` is a token with no member behind
   it, and a reading that RESTS on documents carries a structure only a named
   member may sign (C-25.5 with C-25.15, refused here as C-27.13). The kind that
   rests on nothing is exactly the one a machine credential may write, which is
   also the point of it existing. The bound is published on this answer too —
   REC-70's lesson that a not-found return was the one shape a bound sweep could
   not see. The legged path is driven under a real member session in
   test/suggest.test.mjs. */
const SUGGEST_OK = await POST("op=suggest&token=mem-r57", {
  target: PL1_INQ, kind: "level-empty", run: R70_RUN, name: "within the bound",
  description: "We searched the open internet for a superseding agenda and found none in this window.",
  relationship: "and", level: "internet", observed_at: `observation:r70-1`,
});
t("op=suggest: and one WITHIN the cap publishes the bound APPLIED beside an explicit completeness flag "
+ "— `truncated: false` said rather than implied by silence, REC-70's lesson on the empty answer",
  [SUGGEST_OK.ok, SUGGEST_OK.limit, SUGGEST_OK.truncated, SUGGEST_OK.count],
  [true, 120, false, 0]);

/* ----------------------------------------------- PL-4 / IS-4's THREE ARMS.
   The capture-request door's two bounds, driven against the SAME fixture inquiry
   and run every arm above uses, so this adds no third corpus. Two requests are
   written so a `limit=1` read is genuinely cut and a `limit=200` read genuinely
   is not — the DELTA this file exists to hold, applied to a new op. */
for (const n of [1, 2]) {
  const r = await POST("op=capturerequest&token=mem-r57", {
    target: PL1_INQ, run: R70_RUN, purpose: "investigate",
    address: `https://records.example.gov/bounds-${n}.pdf` });
  if (!r.ok) throw new Error(`bounds fixture capturerequest ${n}: ${JSON.stringify(r).slice(0, 400)}`);
}
const CR_BITE = await GET("op=capturerequests&token=mem-r57&limit=1");
const CR_WHOLE = await GET("op=capturerequests&token=mem-r57&limit=200");
t("op=capturerequests: publishes the bound it APPLIED, and a cut answer SAYS SO — a queue of "
+ "addresses this instance is about to fetch is exactly the read where 'is that all of them' matters",
  [CR_BITE.limit, CR_BITE.count, CR_BITE.truncated], [1, 1, true]);
t("op=capturerequests: DELTA — 'this is all of it' and 'this is the first one' do NOT read alike",
  [CR_WHOLE.truncated, CR_WHOLE.count >= 2], [false, true]);
const CR_OVER = await GET("op=capturerequests&token=mem-r57&limit=99999");
t("op=capturerequests: an over-ask is answered at the ceiling and the CEILING is what is published",
  CR_OVER.limit, 1000);
/* THE DRAIN. Its bound is not a read cut and not a refusal: it PACES an outward
   act, so what a caller would lose if it went unpublished is not "did I see
   everything" but "is there more work queued at somebody else's server". The
   instance here is not configured for draining (no SELF binding), which is the
   honest state to assert it in — the answer still says so rather than reporting
   an empty tick, and `remaining` is still the signal. */
const DRAIN1 = await POST("op=capturerequestdrain&token=adm-r57", { limit: 1 });
t("op=capturerequestdrain: an unconfigured instance SAYS it drains nothing rather than reporting an "
+ "empty tick — a stated absence, never a silent no-op",
  [DRAIN1.configured, DRAIN1.drained, typeof DRAIN1.detail === "string"], [false, 0, true]);
t("op=capturerequestdrain: and the bound it would apply is a CONSTANT this walk can see, so a tick "
+ "that grows its appetite fails the roster pin until somebody drives it",
  /CAPTURE_REQUEST_TICK_BATCH = \d+/.test(SRC_STORE), true);

/* ----------------------------------------------- PL-14 / IS-7's TWO ARMS.
   Driven against the SAME PL-1 fixture inquiry every version arm above uses, so
   this adds no corpus. Its three readings are `suggested`, so the state set is
   widened — which is §6 rule 6's exploration and is the only way to compute over
   an unadopted reading at all. */
const VS = await GET(`op=versionstrength&token=mem-r57&id=${PL1_INQ}`
  + `&version=${encodeURIComponent("first reading")}&states=suggested`);
t("op=versionstrength: publishes how many legs the pair was derived from AND whether that is the WHOLE "
+ "reading — a strength over a reading read short is a wrong number, not a short list",
  [VS.ok, VS.legs_read, VS.legs_complete], [true, 1, true]);
t("op=versionstrength: and the bound it applies is a CONSTANT this walk can see, shared with "
+ "op=basisversions rather than a second figure that could drift from it",
  [/BASIS_VERSION_LEGS_MAX = \d+/.test(SRC_STORE),
   (SRC_STORE.match(/Store\.BASIS_VERSION_LEGS_MAX/g) || []).length >= 2], [true, true]);
/* =================================================================== * THE BARE-ARRAY PIN, INVERTED AND NOW MEASURED — REC-59 / IC-24, 2026-08-07.
 *
 * IT USED TO READ: `const ARRAY_SHAPED = new Set(["projection"])`, with the
 * assertion `ARRAY_SHAPED.size === 1`. That pin was RIGHT to exist and WRONG in
 * one respect worth stating, because the correction is the lesson: it compared a
 * HAND-WRITTEN Set against its own length. `size === 1` was true because the
 * literal above it had one element, and it would have stayed true no matter what
 * any op actually answered. Only `op=projection` itself was genuinely measured.
 * A second op could have gone bare-array and this pin would not have noticed —
 * it would have failed only when a person remembered to add it to the Set, which
 * is a convention wearing a pin's clothes.
 *
 * NOW THE SET IS PRODUCED BY DRIVING THE ROSTER. Every capped op the walk found
 * is called and its answer inspected, and the pin is that the set is EMPTY. That
 * is what makes negative control (2) meaningful: adding a bare-array capped op
 * anywhere in `store.mjs` puts a member into this set and fails here, with no
 * list for it to be quietly added to.
 * ========================================================================== */
const answersByOp = new Map([
  ...await Promise.all(DRIVEN.map(async (d) => [d.op, await d.drive(d.whole)])),
  /* Driven above and REUSED rather than re-driven: both backfills CLEAR a
     derived structure to arm themselves, so calling them again here would
     re-arm them and change what the arms above measured. */
  ["taskdrain", td2], ["reproject", rp2], ["reindexnames", rn2],
  /* PL-3 / IS-4: driven above with both arms and REUSED here rather than
     re-driven — a second successful submission would be refused as a duplicate
     by C-27.10, which is the feature working and would make this line a
     misleading answer. */
  ["suggest", SUGGEST_OK],
  /* PL-4 / IS-4: both driven above and REUSED here rather than re-driven. The
     READ is idempotent and could be re-driven safely, but the DRAIN is not — a
     second tick would report a different account of the same queue — so the two
     are carried the same way, which keeps the pair readable as a pair. */
  ["capturerequests", CR_WHOLE], ["capturerequestdrain", DRAIN1],
  /* PL-14 / IS-7: driven above and REUSED here. It is a pure read and could be
     re-driven safely; it is carried the same way as its neighbours so the
     roster reads as one list rather than as two conventions. */
  ["versionstrength", VS],
]);
const ARRAY_SHAPED = new Set([...answersByOp].filter(([, a]) => Array.isArray(a)).map(([op]) => op));
t("PIN: op=projection's capped corpus arm is NO LONGER a bare array — IC-24 landed, and this is measured "
+ "through the op rather than asserted about it",
  Array.isArray(await GET("op=projection&token=mem-r57&jsonPath=$.group&jsonEquals=believe-in-oakland")), false);
t("PIN: ZERO capped ops answer with a bare array — the set is DRIVEN off the roster, not written here, so a "
+ "new member of the class fails the build instead of joining an exception list",
  [...ARRAY_SHAPED], []);
/* THE PIN MUST BE ABLE TO SEE ONE. A set that is empty because the measurement
   reaches nothing is the equality that costs nothing to produce — the failure
   this whole suite exists to prevent, met here in its own instrument. */
t("PIN GUARD: the array test can actually SEE a bare array — the same reader over a known array-shaped answer "
+ "reports it, so the empty set above is a measurement and not an unarmed check",
  [...new Set([...new Map([...answersByOp, ["__control", [1, 2, 3]]])]
    .filter(([, a]) => Array.isArray(a)).map(([op]) => op))], ["__control"]);
t("PIN GUARD: and the sweep drove every roster op — an answer per op, none skipped",
  answersByOp.size, OPS.size);
const covered = new Set([...DRIVEN.map((d) => d.op), ...DRIVEN_ELSEWHERE]);
const uncovered = [...OPS.keys()].filter((o) => !covered.has(o));
t("PIN: every capped op the walk found is DRIVEN here — an op that grows a cap tomorrow fails until somebody drives it",
  uncovered, []);
t("PIN: and nothing is driven that the walk did NOT find — the roster is the source's, not this file's",
  [...covered].filter((o) => !OPS.has(o)), []);

/* =================================================================== * REC-59 · THE CONSUMER WALK, RE-MEASURED — and IC-24's own count was WRONG.
 *
 * IC-24 recorded: *"every one of the nine call sites found … uses the `&id=`
 * arm, which does not move."* RE-MEASURED HERE, and the number is right about
 * nothing it was used for. There are **38** call sites, and **NINE OF THEM
 * TARGET THE CORPUS ARMS** — the coincidence in the figure is what makes this
 * worth pinning rather than reporting: a reader comparing "nine" to "nine" would
 * have concluded the count was confirmed. It was a count of the wrong
 * population. REC-41's lesson for the fourth time: right about the FIELD, wrong
 * about the OP, and only re-measuring catches it.
 *
 * THE EXCLUSION RULE, STATED IN THE INSTRUMENT RATHER THAN IN A REPORT, and it
 * is REC-58's, reused deliberately because it was measured there:
 *   - Files that embed the whole bundled plane AS A STRING are excluded
 *     STRUCTURALLY, by what stands at BYTE 0, never by filename — the next
 *     generated artifact will have a third name. A walk excluding only one still
 *     counts the plane as its own consumer through the other.
 *   - THE GENERATOR IS KEPT IN. UI-40's first exclusion tested whether a file
 *     CONTAINED the banner, which also excluded the generator that WRITES it.
 *     That is the DANGEROUS direction: a consumer living in the generator would
 *     have been invisible while the answer still read "zero". A generated file
 *     BEGINS with its banner; the anchor is `^`.
 *   - `dist/` is skipped as a DIRECTORY, which is what covers the two artifacts
 *     the brief did not name (`bio-plane/dist/` and `newgroup/dist/`): there are
 *     FOUR generated copies of this plane in the tree, not two.
 *
 * WHAT THIS WALK CANNOT SEE, said plainly: it reads REQUEST-FORMING STRING
 * LITERALS. A caller that builds its query by concatenation from a variable, or
 * that reaches the op through a helper this file does not know, is invisible to
 * it — which is why the migrated consumers are ALSO asserted through the op in
 * their own suites, and why the number below is a floor and not a census.
 * ========================================================================== */
console.log("\n--- REC-59: the consumer walk, re-measured over the whole repository ---");
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SKIP = new Set(["node_modules", ".git", "dist", ".claude", "coverage"]);
const EXT = new Set([".mjs", ".js", ".html"]);
const allFiles = [];
(function walkDir(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walkDir(p); continue; }
    if (EXT.has(extname(e.name))) allFiles.push(p);
  }
})(REPO);
const generatedReason = (src) =>
    /^\/\* GENERATED by scripts\/embed-release\.mjs/.test(src) ? "embed-release banner, at byte 0"
  : (/^\/\/ src\/schema\.mjs\n/.test(src) && /var SCHEMA = `/.test(src)) ? "bundler output, first line names the entry module"
  : null;
/* Comment-blind in BOTH directions. `op=projection` appears in dozens of prose
   comments in this repository — including in this very block — and a walk that
   counted them would report consumers that are sentences. */
const blankComments = (text) => {
  let out = "", i = 0;
  const n = text.length;
  while (i < n) {
    if (text.startsWith("/*", i)) { const e = text.indexOf("*/", i + 2); const seg = text.slice(i, e < 0 ? n : e + 2); out += seg.replace(/[^\n]/g, " "); i = e < 0 ? n : e + 2; continue; }
    if (text.startsWith("<!--", i)) { const e = text.indexOf("-->", i + 4); const seg = text.slice(i, e < 0 ? n : e + 3); out += seg.replace(/[^\n]/g, " "); i = e < 0 ? n : e + 3; continue; }
    /* `//` guarded on the preceding `:` so `https://` inside a URL survives. */
    if (text.startsWith("//", i) && text[i - 1] !== ":") {
      const e = text.indexOf("\n", i); const seg = text.slice(i, e < 0 ? n : e); out += seg.replace(/[^\n]/g, " "); i = e < 0 ? n : e; continue;
    }
    out += text[i]; i++;
  }
  return out;
};
/* Every string literal, quote- and escape-aware. The call sites are LITERALS,
   never lines: a line-anchored walk classified `t("op=projection: hidden and
   absent…")` as a bare-corpus call site on the first draft of this instrument. */
const literals = (code) => {
  const out = [];
  let i = 0;
  const n = code.length;
  while (i < n) {
    const q = code[i];
    if (q === '"' || q === "'" || q === "`") {
      let j = i + 1, body = "";
      while (j < n) {
        if (code[j] === "\\") { body += code[j] + (code[j + 1] || ""); j += 2; continue; }
        if (code[j] === q) break;
        if (q !== "`" && code[j] === "\n") break;
        body += code[j]; j++;
      }
      if (j < n && code[j] === q) { out.push({ at: i, body, end: j }); i = j + 1; continue; }
    }
    i++;
  }
  return out;
};
const consumerCorpus = [], consumerExcluded = [];
for (const f of allFiles) {
  const raw = readFileSync(f, "utf8");
  const g = generatedReason(raw);
  if (g) { consumerExcluded.push({ f: relative(REPO, f), why: g, chars: raw.length }); continue; }
  consumerCorpus.push({ f: relative(REPO, f), code: blankComments(raw) });
}
const walkChars = consumerCorpus.reduce((a, x) => a + x.code.length, 0);
/* PRINTED EVERY RUN, so a corpus that SHRANK to nothing is visible rather than
   silent. Three walks this week kept a headline assertion green over an empty
   corpus, twice inside the instrument built to prevent it. */
console.log(`  REC-59 CORPUS: ${consumerCorpus.length} files, ${walkChars} chars scanned; `
          + `${consumerExcluded.length} generated artifact(s) excluded (${consumerExcluded.map((x) => `${x.f} ${x.chars}`).join("; ")})`);

/* `op=projection` request shapes: the wire query, the Durable Object path, and
   the helper form. The wire form requires a query SEPARATOR after the op name,
   which is what tells a request from a sentence beginning with the same word. */
const callSites = (files) => {
  const out = [];
  for (const c of files) {
    for (const L of literals(c.code)) {
      let params = null;
      if (/^(?:\/api\/\?)?op=projection(?:&|$)/.test(L.body)) params = L.body.replace(/^(?:\/api\/\?)?op=projection&?/, "");
      else if (/^\/projection(?:\?|$)/.test(L.body)) params = L.body.replace(/^\/projection\??/, "");
      else if (L.body === "projection" && /(?:\brecR|\brec|\bcall|\bDO|\bget|\bj|\bGET)\(\s*$/.test(c.code.slice(Math.max(0, L.at - 12), L.at)))
        params = c.code.slice(L.end + 1, L.end + 160).split("\n")[0];
      if (params === null) continue;
      /* An object KEY is not a request. `publishedcase.test.mjs` keys an
         expected-answer map by `"op=projection"`, derived from a request made on
         another line — counting it would be counting one call twice. */
      if (/^\s*:/.test(c.code.slice(L.end + 1))) continue;
      out.push({ f: c.f, arm: /(?:^|[?&,{\s])id[=:}]|`id=/.test(params) ? "id"
                            : /jsonPath|jsonEquals/.test(params) ? "corpus-filter" : "corpus-bare" });
    }
  }
  return out;
};
const SITES = callSites(consumerCorpus);
const armCount = (a) => SITES.filter((s) => s.arm === a).length;
console.log(`  REC-59 CALL SITES: ${SITES.length} total — id-arm ${armCount("id")}, `
          + `corpus-bare ${armCount("corpus-bare")}, corpus-filter ${armCount("corpus-filter")}`);

t("REC-59 RE-MEASURED: IC-24 said NINE call sites and that all of them used the `&id=` arm. The walk finds "
+ "MANY more than nine, so the count was not merely stale — it was a count of a different population",
  SITES.length > 9, true);
/* MEASURED WITH THIS SUITE'S OWN PROBES REMOVED. This file drives the corpus arm
   deliberately, so a claim that "the corpus arms have consumers" would pass on
   its own test code — an equality that costs nothing to produce, in the suite
   whose whole subject is claims that cost nothing. The consumers below are other
   people's. */
const foreignSites = callSites(consumerCorpus.filter((c) => c.f !== "bio-plane/test/bounds.test.mjs"));
const foreignCorpusArm = foreignSites.filter((s) => s.arm !== "id");
console.log(`  REC-59 CORPUS-ARM CONSUMERS OUTSIDE THIS SUITE: ${foreignCorpusArm.length}`);
t("REC-59 RE-MEASURED: and the corpus arms are NOT unconsumed — IC-24's `measured consumer impact is nil` "
+ "was false in this tree, measured with THIS suite's own probes excluded so the claim is not self-served",
  foreignCorpusArm.length > 0, true);
t("REC-59 RE-MEASURED: the `&id=` arm is nonetheless the overwhelming majority, so IC-24's CONCLUSION "
+ "(the break is small and worth taking) survives its arithmetic being wrong",
  armCount("id") > armCount("corpus-bare") + armCount("corpus-filter"), true);
/* THE UI IS THE CONSUMER CONDUCT ANSWERED FOR, so what it actually does is
   asserted rather than described: `civicos-ui` reaches this op through ONE
   helper and that helper passes an id. NOT-AFFECTED is now evidenced. */
const uiSites = callSites(consumerCorpus.filter((c) => c.f.startsWith("civicos-ui/")));
t("REC-59 RE-MEASURED: `civicos-ui` reaches op=projection ONLY through the `&id=` arm, which does not move — "
+ "so CONDUCT's NOT-AFFECTED answer on UI's behalf is a measurement and not a courtesy",
  [uiSites.length > 0, uiSites.every((s) => s.arm === "id")], [true, true]);

/* REACH AS A DELTA. A walk that matches nothing reports zero and passes forever.
   The same reader is re-run over an EMPTY corpus and must find FEWER; the
   difference is the evidence, and the failure mode is NAMED in-suite so it
   cannot be lost the way it was lost three times this week. */
t("REC-59 REACH: the walk read a real corpus — over 200 files and 5,000,000 characters of it",
  consumerCorpus.length > 200 && walkChars > 5_000_000, true);
t("REC-59 REACH: BOTH string embeds of the plane are excluded, each recognised STRUCTURALLY at byte 0 and "
+ "neither by name, and each is over a megabyte — so neither counts the plane as its own consumer",
  [consumerExcluded.length, consumerExcluded.every((x) => x.chars > 1_000_000)], [2, true]);
t("REC-59 REACH: THE GENERATOR IS KEPT IN — `newgroup/scripts/embed-release.mjs` is in the corpus and not in "
+ "the exclusions, which is the arm UI-40's first exclusion would have failed",
  [consumerCorpus.some((x) => x.f === "newgroup/scripts/embed-release.mjs"),
   consumerExcluded.some((x) => /embed-release/.test(x.f))], [true, false]);
t("REC-59 REACH (DELTA): the same reader over an EMPTY corpus finds ZERO, while over the real one it does "
+ "not — so every count above answers the corpus and not itself",
  [callSites([]).length, SITES.length > 0], [0, true]);
t("REC-59 REACH (THE FAILURE MODE NAMED): over that same empty corpus, a `no corpus-arm consumers` claim — "
+ "IC-24's exact claim — STILL READS TRUE. That is how a walk covering nothing passes triumphantly, and it "
+ "is asserted here so the reason the DELTA arm above exists cannot be forgotten",
  callSites([]).filter((s) => s.arm !== "id").length === 0, true);

/* =================================================================== * OVER-STRICTNESS. A pin that only accepts the phrasing its author wrote is
 * measuring its author. These are answers that are GENUINELY HONEST and look
 * nothing like what this file emits, and they must NOT fail.
 * ========================================================================== */
console.log("\n--- OVER-STRICTNESS: a correct answer phrased unlike anything here must pass ---");
const honestAlternatives = [
  /* page/of/hasMore, a shape no op here uses */
  { page: { size: 25, index: 0 }, hasMore: true, records: [] },
  /* RFC-5988-ish: a next link is a truncation signal and a perfectly good one */
  { items: [], links: { next: "?after=INFO-9" }, bound_applied: 25 },
  /* the plane's own fifth spelling, `bounded`, from #conditionBundlesForHost */
  { ids: [], bounded: true, cap: 16 },
];
/* The PROPERTY, not the vocabulary: an answer is honest if some key states the
   bound and some key settles completeness. Read structurally. */
const statesBound = (a) => Object.entries(a).some(([k, v]) =>
  /limit|cap|bound|size/i.test(k) ? true : (v && typeof v === "object" && statesBound(v)));
const settlesCompleteness = (a) => Object.entries(a).some(([k, v]) =>
  /truncated|remaining|cursor|total|hasMore|next|bounded/i.test(k) ? true : (v && typeof v === "object" && settlesCompleteness(v)));
t("OVER-STRICTNESS: three genuinely honest answers in vocabularies this file never emits are all accepted",
  honestAlternatives.filter((a) => !(statesBound(a) && settlesCompleteness(a))).length, 0);
/* And the same reader REFUSES the pre-REC-57 shape, so it is not simply
   permissive — an over-strictness arm that accepts everything proves nothing. */
t("OVER-STRICTNESS: and the reader still REFUSES the shape this item existed to fix",
  [statesBound({ ok: true, count: 3, documents: [] }),
   settlesCompleteness({ ok: true, count: 3, documents: [] })], [false, false]);

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
