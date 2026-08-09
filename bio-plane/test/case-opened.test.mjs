/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 2a/2b is the decisive pair; ARM 5 proves the SWEEP did not narrow — a
   finding in an uncommitted file still reds its suite.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* NEGATIVE CONTROL: see the block at the foot of this file. Every arm is RUN and
   recorded there with the count it MEASURED, and every file is restored
   byte-identically with sha256 compared before and after. */
/* REC-58 — DOES `case.opened` REACH ANY CALLER? THE RE-MEASUREMENT, AND THE
 * FENCE THE ANSWER TURNS OUT TO REST ON.
 *
 * THE ITEM'S PREMISE IS FALSE ABOUT THE OP, AND THAT IS THIS ITEM'S RESULT.
 * REC-58 was raised to decide whether the publish-case act should stop
 * publishing `case.opened`. It does not publish it. It never did:
 * `Store.publishCase()` — the method that act dispatches to — computes no
 * `opened`, reads none, and returns none. The only occurrence of the letters
 * anywhere in its body is the word "reopened" inside a refusal sentence, which
 * is why this suite blinds string CONTENTS before it counts anything.
 *
 * M0-12, 2026-08-08 — AND THE OP NAME IN THIS VERY BLOCK WAS ITSELF AT THE
 * WRONG LEVEL. Corrected here rather than dropped, because this is the file
 * that recorded the class. Every sentence above used to write `publishcase` as
 * though it were an op. IT IS THE STORE'S DO PATH. `DO_PATH` in index.mjs
 * aliases `op=publish` onto it, so the routing chain in full is
 * **`op=publish` -> DO path `publishcase` -> `Store.publishCase()`**, and a
 * caller sending the path name as the `op=` parameter gets `unknown op`.
 * REC-58 was right about the FIELD and wrong about the OP inside the very
 * comment it wrote to record that REC-41 had been right about the field and
 * wrong about the op. FOURTH TIME. The mechanical check that finally caught it
 * is `scripts/op-claims.mjs`, driven by `test/op-claims.test.mjs`.
 *
 * This is REC-41's lesson arriving for the third time, and the third time is
 * worth stating plainly: an item's assertion about an OP is a claim about
 * routing, and routing is the part nobody re-checks. REC-41's item was wrong
 * about its op while right about its field. UI-40 re-measured the FIELD
 * correctly and then wrote the wrong OP into the comment it left behind. REC-58
 * inherited that comment as its premise. The field was right every time; the op
 * was wrong from UI-40 onward.
 *
 * WHERE `opened` ACTUALLY LIVES, measured rather than assumed:
 *
 *   `#caseEditionState()` SELECTs `opened` off the `published_cases` row and
 *   returns it as a key. That is the PRODUCER, and it has exactly TWO callers:
 *
 *     1. `Store.publish()` — the RATIFICATION committer — returns the state
 *        WHOLE, as `case: caseState`. This is the one place a spread exists, and
 *        it is an INTERNAL Durable Object hop: the control plane fetches
 *        `http://do/publish` inside `if (op === "ratify")` and nowhere else.
 *     2. `Store.publishedCase()` — the PUBLIC read — picks its fields
 *        explicitly and has not carried `opened` since IC-22.
 *
 *   Between `Store.publish()` and the wire stands the control plane, which
 *   builds `op=ratify`'s answer by naming five fields of the case block
 *   (`edition`, `complete`, `awaiting`, `findings`, `detail`) and the container
 *   manifest by naming its own list. `opened` is in NEITHER. It is dropped, and
 *   it is dropped by an EXPLICIT PICK rather than by a filter — which is why the
 *   fence holds and why this suite pins the pick rather than the outcome alone.
 *
 *   And `op=publish` is an ALIAS: `DO_PATH` in index.mjs maps it to
 *   `publishcase`, so no op reaches `Store.publish()` through the generic
 *   passthrough either. Every fetch of `http://do/publish` in the control plane
 *   was counted; there is one.
 *
 * SO THE RULING IS **KEEP**, AND THE REASONING IS NOT THE ONE THE ITEM
 * ANTICIPATED. The item offered a genuine argument for keeping — a writer
 * echoing back what it wrote is not a public read publishing a field nobody
 * wants. That argument is sound and it is not the one that applies, because
 * there is no publication on either op to weigh. Nothing is removed because
 * nothing is published; no `INTERFACE-CHANGES.md` entry is filed because no
 * published shape moves by a byte. `#caseEditionState` keeps computing `opened`
 * because `published_cases.opened` is a REAL RECORDED FACT written at case
 * creation, and the one accessor that answers "what is this case edition" is
 * where a future consumer should find it without re-deriving it from SQL.
 *
 * WHAT THAT MAKES THIS SUITE. The risk here was never that `opened` is
 * published. It is that it BECOMES published — one `...state` spread in any of
 * the three consumers and a field with zero measured demand is on the wire with
 * nobody having decided it. So the assertions below pin THE FENCE: that each
 * consumer names its fields, and that the two facts hold TOGETHER — the producer
 * computes it AND no published surface carries it. Held as a RELATION rather
 * than collapsed to either half, because either half alone is satisfiable by
 * deleting the wrong thing.
 *
 * THE WALK'S OWN REACH IS A DELTA, NEVER AN ABSOLUTE. UI-40 measured that its
 * headline "zero consumers" assertion STILL PASSED over an empty corpus, caught
 * only by a paired arm asserting the producer itself was found. That failure
 * mode is reproduced deliberately below and is what the neutering arm exists for.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, extname } from "node:path";
/* M0-18 — ONE mechanism, imported. Why it exists and what it cannot see is in
   its own header; why THIS suite needed it is at the REC-58 corpus walk. */
import { readGitProvenance, reportProvenance } from "../scripts/provenance.mjs";

const DIR = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(DIR, "..", "..");                  // bio-plane/test -> repo root
const read = (p) => readFileSync(p, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ============================================================================
   THE SCANNER.
   ============================================================================
   Comments blanked, STRING CONTENTS blanked (delimiters kept), regex literals
   blanked — all newline-preserving, so a reported line number is one somebody
   can open the file and check.

   BLANKING STRING CONTENTS IS LOAD-BEARING HERE AND IS NOT UI-40's RULE.
   UI-40's walk blanked comments and KEPT strings, which is right for counting
   property READS. This suite counts DECLARATIONS and method bodies, and
   `publishCase()` carries the word "reopened" inside a refusal sentence and the
   schema carries table DDL inside a template literal. A scanner that kept string
   bodies would report `publishCase` as mentioning `opened` — a confident wrong
   answer in the direction that would have made this item's finding disappear.

   REGEX LITERALS. A scanner that treats `'` as a string delimiter runs straight
   through `/won't/` and swallows everything to the next apostrophe. UI-40 found
   that the hard way and the handling is carried across rather than re-derived. */
const blank = (s) => s.replace(/[^\n]/g, " ");
function skeleton(src) {
  let out = "", i = 0;
  const regexOk = () => {
    for (let k = out.length - 1; k >= 0; k--) {
      const c = out[k];
      if (/\s/.test(c)) continue;
      if ("(,=:[!&|?{};+-*%~^<>".includes(c)) return true;
      if (/[A-Za-z0-9_$)\]]/.test(c))
        return /\b(return|typeof|case|in|of|do|else|yield|await|new|delete|void|instanceof)$/
          .test(out.slice(Math.max(0, k - 10), k + 1));
      return false;
    }
    return true;
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "*") {
      const e = src.indexOf("*/", i + 2), end = e < 0 ? src.length : e + 2;
      out += blank(src.slice(i, end)); i = end; continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      const e = src.indexOf("\n", i), end = e < 0 ? src.length : e;
      out += blank(src.slice(i, end)); i = end; continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch; let j = i + 1;
      while (j < src.length && src[j] !== q) { if (src[j] === "\\") j++; j++; }
      const end = Math.min(j + 1, src.length);
      /* delimiters kept, body blanked — so `"opened"` stays visible AS A STRING
         to the brace balancer while its letters stop counting as code. */
      out += q + blank(src.slice(i + 1, end - 1)) + (src[end - 1] === q ? q : "");
      i = end; continue;
    }
    if (ch === "/" && regexOk()) {
      let j = i + 1, cls = false, closed = false;
      for (; j < src.length; j++) {
        const c = src[j];
        if (c === "\\") { j++; continue; }
        if (c === "\n") break;
        if (c === "[") cls = true; else if (c === "]") cls = false;
        else if (c === "/" && !cls) { closed = true; break; }
      }
      if (closed) {
        while (j + 1 < src.length && /[a-z]/.test(src[j + 1])) j++;
        out += blank(src.slice(i, j + 1)); i = j + 1; continue;
      }
    }
    out += ch; i++;
  }
  return out;
}

/* Brace-balanced region extraction over the SKELETON, so a brace inside a
   comment or a string cannot move the boundary. Returns the line span too, so a
   failure names something checkable rather than an offset. */
function regionAt(skel, anchorRe) {
  const lines = skel.split("\n");
  const i = lines.findIndex((l) => anchorRe.test(l));
  if (i < 0) return { found: false, why: "anchor not found", text: "", from: 0, to: 0 };
  let depth = 0, started = false;
  for (let n = i; n < lines.length; n++) {
    for (const ch of lines[n]) {
      if (ch === "{") { depth++; started = true; }
      else if (ch === "}") depth--;
    }
    if (started && depth <= 0)
      return { found: true, text: lines.slice(i, n + 1).join("\n"), from: i + 1, to: n + 1 };
  }
  return { found: false, why: "never closed", text: lines.slice(i).join("\n"), from: i + 1, to: lines.length };
}

/* A key DECLARED in an object literal: `opened:` or `opened,` shorthand. Counted
   over the skeleton, so a mention in prose or in a SQL string does not count.
   REGION-WIDE and therefore NESTING-BLIND — see `objectKeys` below, which
   replaced it on every arm where nesting-blindness was a defect rather than a
   convenience. Kept for the two arms that genuinely ask "anywhere in this
   method". */
const declares = (region, key) =>
  new RegExp(`(^|[\\s{,(])${key}\\s*:`).test(region) ||
  new RegExp(`(^|[\\s{,(])${key}\\s*[,}]`).test(region);

/* THE KEYS AN OBJECT LITERAL DECLARES AT ITS OWN TOP LEVEL, and this exists
   because the OVER-STRICTNESS ARM CAUGHT `declares()` BEING WRONG — which is
   the only reason this suite has it, and is worth recording rather than
   quietly fixing.

   The arm asserted that `ratified_at` survives on the container manifest. To
   check the arm was not vacuous, `ratified_at: cs.ratified_at,` was DELETED
   from the manifest — and the arm STAYED GREEN, because the manifest's
   `findings:` array maps each finding to an object that ALSO declares
   `ratified_at`, and a region-wide regex cannot tell the case's own field from
   a member's. A confident wrong answer in the generous direction: the pin would
   have gone on passing after the field it names was removed.

   So the surface arms below ask for the object's OWN keys, at brace depth 1,
   with bracket and paren depth zero so a key inside a nested call or array is
   not counted. `expectKey` tracks key position across `,` so `{ complete,
   awaiting }` shorthand is read as keys while `edition: null` does not report
   `null` as one. */
function objectKeys(text) {
  const i = text.indexOf("{");
  if (i < 0) return [];
  let b = 0, k = 0, p = 0, tok = "", expectKey = true;
  const keys = [];
  for (let n = i; n < text.length; n++) {
    const ch = text[n];
    if (ch === "{") { b++; if (b === 1) expectKey = true; tok = ""; continue; }
    if (ch === "}") { if (b === 1 && expectKey && tok) keys.push(tok); b--; if (b === 0) break; tok = ""; continue; }
    if (ch === "[") { k++; tok = ""; continue; }
    if (ch === "]") { k--; tok = ""; continue; }
    if (ch === "(") { p++; tok = ""; continue; }
    if (ch === ")") { p--; tok = ""; continue; }
    if (!(b === 1 && k === 0 && p === 0)) continue;
    if (/[A-Za-z0-9_$]/.test(ch)) { tok += ch; continue; }
    if (ch === ":") { if (expectKey && tok) keys.push(tok); expectKey = false; tok = ""; continue; }
    if (ch === ",") { if (expectKey && tok) keys.push(tok); expectKey = true; tok = ""; continue; }
    tok = "";
  }
  return keys;
}
const has = (text, key) => objectKeys(text).includes(key);

const STORE_SRC = read(join(REPO, "bio-plane/src/store.mjs"));
const INDEX_SRC = read(join(REPO, "bio-plane/src/index.mjs"));
const STORE = skeleton(STORE_SRC);
const INDEX = skeleton(INDEX_SRC);

console.log("\n--- REC-58 · 1. THE ANCHORS, CHECKED AGAINST THE METHODS THEY CLAIM ---");
/* UI-35's anchor matched `publishCase()` when it wanted `publishedCase()` — two
   methods one letter apart, ten thousand lines apart in the file. Every region
   below is therefore PROVED to be the method it is named after, by a landmark
   only that method carries, BEFORE anything is measured inside it. A region that
   silently matched its sibling would answer this whole item backwards. */
const publishCase   = regionAt(STORE, /^  publishCase\(\{/);
const publishedCase = regionAt(STORE, /^  publishedCase\(\{/);
const caseEdState   = regionAt(STORE, /^  #caseEditionState\(/);
const storePublish  = regionAt(STORE, /^  publish\(\{ bundleId/);

t("REC-58 ANCHOR: all four regions are FOUND and BRACE-BALANCED (each closed, none ran to end of file)",
  [publishCase.found, publishedCase.found, caseEdState.found, storePublish.found],
  [true, true, true, true]);

/* The landmarks. Each is a refusal reason or a SQL fragment unique to its
   method, read off the SKELETON's string DELIMITERS being intact — so what is
   matched is the code shape, and the sibling cannot satisfy it. */
const rawRegion = (r) => STORE_SRC.split("\n").slice(r.from - 1, r.to).join("\n");
t("REC-58 ANCHOR: `publishCase` is the CASE-AUTHORING act and not its one-letter sibling — it carries "
+ "MACHINE_CANNOT_PUBLISH and NO_SUBJECT_POSITION, and carries NOT_PUBLISHED nowhere",
  [rawRegion(publishCase).includes("MACHINE_CANNOT_PUBLISH"),
   rawRegion(publishCase).includes("NO_SUBJECT_POSITION"),
   rawRegion(publishCase).includes("NOT_PUBLISHED")],
  [true, true, false]);
t("REC-58 ANCHOR: `publishedCase` is the PUBLIC READ and not its one-letter sibling — it carries "
+ "NOT_PUBLISHED and case_detail, and carries MACHINE_CANNOT_PUBLISH nowhere",
  [rawRegion(publishedCase).includes("NOT_PUBLISHED"),
   rawRegion(publishedCase).includes("case_detail"),
   rawRegion(publishedCase).includes("MACHINE_CANNOT_PUBLISH")],
  [true, true, false]);
t("REC-58 ANCHOR: the two are DISJOINT regions — the trap is that they overlap or that one contains "
+ "the other, and a containment would make every measurement below meaningless",
  publishCase.to < publishedCase.from || publishedCase.to < publishCase.from, true);
t("REC-58 ANCHOR: `#caseEditionState` is the producer — it SELECTs off published_cases and is the "
+ "method the other two call, and it is disjoint from publishCase",
  [rawRegion(caseEdState).includes("FROM published_cases"),
   caseEdState.from > publishCase.to],
  [true, true]);

/* THE FOUR OBJECT LITERALS THIS ITEM IS ABOUT, each anchored on its own first
   line so `objectKeys` reads the object and not the method around it. */
const producerReturn = regionAt(STORE, /^    return \{ caseId, edition: ed, group:/);
const publicReturn   = regionAt(STORE, /^    return \{ ok: true, caseId: theCase, edition: ed, scope:/);
t("REC-58 ANCHOR: the producer's RETURN OBJECT and the public read's RETURN OBJECT are found and "
+ "brace-balanced, and each sits inside the method it belongs to",
  [producerReturn.found, publicReturn.found,
   producerReturn.from > caseEdState.from && producerReturn.to <= caseEdState.to,
   publicReturn.from > publishedCase.from && publicReturn.to <= publishedCase.to],
  [true, true, true, true]);

console.log("\n--- REC-58 · 2. THE PRODUCER, AND THE OP THE ITEM NAMED ---");
t("REC-58 PRODUCER: `#caseEditionState`'s RETURN OBJECT declares `opened` among its OWN top-level keys "
+ "— the field exists and this walk can see it, which is what makes every ZERO below a measurement",
  [has(producerReturn.text, "opened"), has(producerReturn.text, "ratified_at")], [true, true]);

/* THE FINDING. Measured over the skeleton, so the word "reopened" inside
   publishCase's own ILLEGAL_TRANSITION sentence cannot masquerade as the field. */
t("REC-58 THE FINDING: the publish-case method — `Store.publishCase()`, reached by `op=publish` through "
+ "the DO path `publishcase` (M0-12) — DECLARES NO `opened`, READS "
+ "no `opened`, and never calls the producer at all. The item's premise is FALSE ABOUT THE OP",
  [declares(publishCase.text, "opened"),
   /\bopened\b/.test(publishCase.text),
   /caseEditionState/.test(publishCase.text)],
  [false, false, false]);
t("REC-58 AND THE TRAP THAT HID IT: the RAW bytes of `publishCase` DO contain the letters, inside a "
+ "refusal sentence — so a scanner that kept string bodies would have reported the field present and "
+ "agreed with the item",
  /reopened/.test(rawRegion(publishCase)), true);

console.log("\n--- REC-58 · 3. THE TWO CALLERS OF THE PRODUCER, AND WHICH ONE SPREADS ---");
t("REC-58: `Store.publish()` — the RATIFICATION committer — is the ONE caller that returns the state "
+ "WHOLE (`case: caseState`), which is the only place `opened` can leave the store at all",
  [/caseEditionState/.test(storePublish.text), /case:\s*caseState/.test(storePublish.text)],
  [true, true]);
t("REC-58: `Store.publishedCase()` calls the producer and PICKS ITS FIELDS — its return object's OWN "
+ "keys carry `ratified_at` and NOT `opened` (IC-22), so the public read is fenced by construction",
  [/caseEditionState/.test(publishedCase.text),
   has(publicReturn.text, "ratified_at"),
   has(publicReturn.text, "opened")],
  [true, true, false]);
t("REC-58: and those are the ONLY two callers in the whole store — a third would be a third way out "
+ "and is asserted absent rather than assumed",
  (STORE.match(/#caseEditionState\(/g) || []).length, 3);   /* 1 definition + 2 call sites */

console.log("\n--- REC-58 · 4. THE FENCE AT THE CONTROL PLANE ---");
/* This is where the ruling actually rests. `Store.publish()` hands `opened` to
   the control plane over an internal hop; the control plane names the fields it
   forwards, twice, and `opened` is in neither list. */
const ratifyCase = regionAt(INDEX, /case:\s*\{ edition: pub\.case\?\.edition/);
const manifest   = regionAt(INDEX, /const manifest = \{/);
t("REC-58 FENCE: both control-plane picks are FOUND and brace-balanced",
  [ratifyCase.found, manifest.found], [true, true]);
/* ASSERTED AS THE WHOLE KEY SET, not as a membership test: an EXACT set is what
   makes a SIXTH field arriving unannounced fail here, which a per-key `includes`
   would wave through. */
t("REC-58 FENCE (op=ratify's answer): the case block's OWN keys are EXACTLY the five it forwards — "
+ "edition, complete, awaiting, findings, detail — so `opened` never reaches the wire, and a sixth "
+ "field arriving unannounced fails this arm rather than riding along",
  objectKeys(ratifyCase.text), ["edition", "complete", "awaiting", "findings", "detail"]);
t("REC-58 FENCE (the container manifest): the artifact a stranger downloads declares `ratified_at` "
+ "among its OWN top-level keys and does NOT declare `opened` — the copy that travels without this "
+ "instance is fenced too, and this is measured at depth 1 so a member's own `ratified_at` cannot answer for the case's",
  [has(manifest.text, "ratified_at"), has(manifest.text, "opened")], [true, false]);
t("REC-58 FENCE: neither pick uses a SPREAD of the case state — a `...cs` or `...pub.case` would carry "
+ "`opened` onto the wire without anyone deciding to publish it, and THAT is the risk this pins",
  [/\.\.\.\s*cs\b/.test(manifest.text), /\.\.\.\s*pub\.case\b/.test(ratifyCase.text)],
  [false, false]);

console.log("\n--- REC-58 · 5. THE ROUTING, WHICH IS THE PART NOBODY RE-CHECKS ---");
/* THE REGION IS FOUND COMMENT-BLIND AND THE VALUE IS READ FROM RAW BYTES, and
   the split is not fussiness: `skeleton()` blanks string CONTENTS, so the alias
   TARGET — the string "publishcase" — is invisible to it by construction. The
   first version of this arm tested the skeleton for the value and FAILED, which
   is the instrument catching its own blind spot rather than the plane changing.
   Boundaries from the skeleton so a commented-out DO_PATH cannot be matched;
   the value from the source so a string can still be read. */
const doPath = regionAt(INDEX, /const DO_PATH = \{/);
const rawIndexRegion = (r) => INDEX_SRC.split("\n").slice(r.from - 1, r.to).join("\n");
t("REC-58 ROUTING: `op=publish` is an ALIAS for `publishcase` in DO_PATH — so the op whose NAME matches "
+ "the store method that DOES spread is routed away from it, and reaches the authoring act instead",
  [doPath.found, /publish:\s*"publishcase"/.test(rawIndexRegion(doPath))], [true, true]);
t("REC-58 ROUTING: `http://do/publish` is fetched EXACTLY ONCE in the whole control plane, and it is "
+ "inside the ratify handler — the state-carrying answer never had a second way out",
  (INDEX_SRC.match(/http:\/\/do\/publish"/g) || []).length, 1);

console.log("\n--- REC-58 · 6. THE CONSUMER WALK, RE-MEASURED OVER THE WHOLE REPOSITORY ---");
/* THE EXCLUSION RULE, STATED IN THE INSTRUMENT RATHER THAN IN A REPORT.
   Two files embed the whole bundled plane AS A STRING — `newgroup/src/release.mjs`
   and `release/bio-plane.bundled.mjs`. A walk excluding only one still counts the
   plane as its own consumer, through the other. BOTH are excluded STRUCTURALLY,
   by what stands at byte 0 of the file, and NEVER by filename, because the next
   generated artifact will have a third name.

   AND THE GENERATOR IS KEPT IN. UI-40's first exclusion tested whether a file
   CONTAINED the generator's banner, which also excluded
   `newgroup/scripts/embed-release.mjs` — the generator, which contains the banner
   because it WRITES it. That is the dangerous direction: a consumer living in the
   generator would have been invisible while the answer still read "zero". A
   generated artifact BEGINS with its banner; a file that merely mentions one does
   not, and the anchor is `^`. */
const SKIP = new Set(["node_modules", ".git", "dist", ".claude", "coverage"]);
const EXT = new Set([".mjs", ".js", ".html"]);
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); continue; }
    if (EXT.has(extname(e.name))) files.push(p);
  }
})(REPO);

const generatedReason = (src) =>
    /^\/\* GENERATED by scripts\/embed-release\.mjs/.test(src) ? "embed-release banner, at byte 0"
  : (/^\/\/ src\/schema\.mjs\n/.test(src) && /var SCHEMA = `/.test(src)) ? "bundler output, first line names the entry module"
  : null;

const corpus = [], excluded = [];
for (const f of files) {
  const raw = read(f);
  const g = generatedReason(raw);
  if (g) { excluded.push({ f: relative(REPO, f), why: g, chars: raw.length }); continue; }
  corpus.push({ f: relative(REPO, f), code: skeleton(raw) });
}
const chars = corpus.reduce((a, x) => a + x.code.length, 0);

/* ---- M0-18 · THE FLOOR IS THE REPRODUCIBLE FIGURE, THE SWEEP IS NOT ---------
 * The full argument is in `bio-plane/test/bounds.test.mjs`'s sibling block and
 * in `scripts/provenance.mjs`; the one sentence is: this walk read the WORKING
 * TREE and floored on what it found, `refs/stash` is repository-wide across all
 * sixty worktrees of this repository so an untracked file can arrive here from a
 * tree that never wrote it (D-238), and an arrival can only push a floor UP.
 *
 * THE SWEEP STILL READS THE WHOLE WORKING TREE — a `case.opened` read in an
 * uncommitted file is still a consumer and must still be found, which is the
 * half `readsOf()` below must not lose. Only the REACH FLOOR narrows to the
 * commit, because only the reach floor is a figure another checkout must
 * reproduce. */
const PROV = readGitProvenance(REPO);
const inCommit = (rel) => PROV.inHead === null ? true : PROV.inHead.has(rel);
const REPRO = corpus.filter((x) => inCommit(x.f));
const reproChars = REPRO.reduce((a, x) => a + x.code.length, 0);
/* SAY UNVERIFIED, NEVER CLEAN (D-233, and provenance.mjs's fourth rule). This
   label goes into the assertion text, not only into the report. */
const HEAD_SAYS = PROV.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk and is NOT a claim about any commit"
  : `in the commit at HEAD (${PROV.headSha})`;

/* PRINTED EVERY RUN, so a corpus that SHRANK is visible rather than silent, and
   BOTH figures are printed so a reader about to quote one into a floor is told
   which of them another checkout reproduces. */
console.log(`  REC-58 CORPUS: ${corpus.length} files, ${chars} chars scanned; `
          + `${excluded.length} generated artifact(s) excluded (${excluded.map((x) => `${x.f} ${x.chars}`).join("; ")})`);
console.log(`  REC-58 CORPUS, REPRODUCIBLE: ${REPRO.length} of ${corpus.length} file(s) and ${reproChars} of `
          + `${chars} chars are ${HEAD_SAYS} — floors 200 / 5,000,000 apply to THESE`);
reportProvenance({
  prov: PROV,
  /* THE FIELD NAME IS NOT SPELLED IN THIS STRING, AND THAT IS NOT FUSSINESS —
     it is a MEASURED failure of the first draft of this block. `civicos-ui/test/
     publishedcase.test.mjs` runs UI-40's consumer walk over this same
     repository, and UI-40's scanner deliberately blanks COMMENTS and KEEPS
     STRINGS (right for counting property reads, and stated in its own header).
     So the words `case` + `.` + the field, written here as prose inside a string
     literal, were counted as a CONSUMER: the UI harness went red at 224/226 with
     `bio-plane/test/case-opened.test.mjs:457` named as a reader of the field
     this suite exists to prove nobody reads. A walk that counted a sentence as a
     consumer — the exact failure `bounds.test.mjs` warns about for
     `op=projection`, and the third time this item met it. Reworded, not
     exempted, because the walk was right and the prose was wrong. */
  items: corpus.map((x) => ({ path: x.f, what: x.f.split("/").pop(),
    counted: "swept for reads of the case-edition field this suite fences" })),
  instrument: "REC-58's consumer walk",
  corpus: `${corpus.length} file(s) walked, ${REPRO.length} of them in the commit`,
  totals: PROV.inHead === null ? [] : [
    { label: "consumer files", contaminated: corpus.length, reproducible: REPRO.length, source: "files" },
  ],
});

/* `set` is a PARAMETER so the neutering arm has something to neuter and the
   reach arm is a DELTA against it rather than an absolute. */
const readsOf = (key, set = corpus) => {
  const re = new RegExp(`\\.${key}\\b|\\[\\s*["'\`]${key}["'\`]\\s*\\]`);
  const hits = [];
  for (const { f, code } of set)
    code.split("\n").forEach((l, n) => { if (re.test(l)) hits.push(`${f}:${n + 1}`); });
  return hits;
};

/* CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED. The old assertion floored on
   `corpus.length` and `chars` read off the working tree, so an untracked arrival
   raised the number the floor is compared against and the next session to move
   the floor to the figure a green run PRINTED would have moved it to one no
   other checkout reproduces. The QUESTION is unchanged; the corpus it is asked
   about is now the committed one. */
t(`REC-58 REACH: the walk read a real corpus — over 200 files and 5,000,000 characters of it, counted over `
+ `the files another checkout REPRODUCES (${REPRO.length} file(s), ${reproChars} chars, ${HEAD_SAYS})`,
  REPRO.length > 200 && reproChars > 5_000_000, true);
t("REC-58 REACH: the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — "
+ "never a silent third state, and under UNVERIFIED the two figures COLLAPSE rather than the reproducible "
+ "one quietly reading zero",
  [PROV.inHead instanceof Set || PROV.inHead === null,
   REPRO.length <= corpus.length,
   PROV.inHead === null ? REPRO.length === corpus.length : true],
  [true, true, true]);
t("REC-58 REACH: BOTH generated embeds are excluded, each recognised STRUCTURALLY and neither by name",
  [excluded.length, excluded.every((x) => x.chars > 1_000_000),
   excluded.some((x) => /newgroup/.test(x.f)), excluded.some((x) => /release\/bio-plane\.bundled/.test(x.f))],
  [2, true, true, true]);
t("REC-58 REACH: THE GENERATOR IS KEPT IN — `newgroup/scripts/embed-release.mjs` is in the corpus and "
+ "not in the exclusions, which is the arm UI-40's first version would have failed",
  [corpus.some((x) => x.f === "newgroup/scripts/embed-release.mjs"),
   excluded.some((x) => /embed-release/.test(x.f))],
  [true, false]);

/* THE POSITIVE CONTROL ON THE REAL CORPUS. `ratified_at` is a key of the very
   same producer that IS read across the repository. If this walk were passing
   over nothing — or matching nothing — this arm fails, and it is what makes the
   zero below mean something. */
const ratifiedReads = readsOf("ratified_at");
t("REC-58 REACH (positive control on the SAME corpus): a sibling key of the SAME producer that IS read "
+ "is found, and found outside the plane — so a zero below is a measurement and not an empty walk",
  ratifiedReads.length > 0 && ratifiedReads.some((h) => !h.startsWith("bio-plane/")), true);

/* THE NEUTERING CONTROL, RUN IN-SUITE AND AS A DELTA. UI-40 measured that its
   headline assertion still passed over an empty corpus. That is reproduced here
   deliberately: the emptied walk must take the POSITIVE control to zero, and the
   arm asserts the DELTA rather than either end of it. */
const neuteredPositive = readsOf("ratified_at", []).length;
t("REC-58 CONTROL (walk neutered, run in-suite): over an EMPTY corpus the positive control collapses to "
+ "ZERO while the real one does not — the reach arms answer the corpus and not themselves",
  [neuteredPositive === 0, ratifiedReads.length > 0, ratifiedReads.length > neuteredPositive],
  [true, true, true]);
t("REC-58 CONTROL (the failure mode NAMED): over that same empty corpus a `zero consumers` claim about "
+ "`opened` STILL READS TRUE — which is exactly how a walk that covers nothing passes triumphantly, and "
+ "is why the paired positive arm above is not optional",
  readsOf("opened", []).length === 0, true);

const openedReads = readsOf("opened");
const outsideProducer = openedReads.filter((h) => !h.startsWith("bio-plane/src/store.mjs"));
t("REC-58 RE-MEASURED: `opened` has ZERO consumers anywhere outside the producer — surface, installer, "
+ "fleet, tools and this whole battery read it not once. NOT inherited from UI-40's table",
  outsideProducer.length === 0, true);
t("REC-58 RE-MEASURED: and the only reads that exist are the PRODUCER reading its own SQL row, which is "
+ "what makes this an unconsumed COMPUTATION rather than a field with one caller",
  openedReads.length > 0 && openedReads.every((h) => h.startsWith("bio-plane/src/store.mjs")), true);

console.log("\n--- REC-58 · 7. THE RELATION, HELD OPEN RATHER THAN COLLAPSED ---");
/* The genuinely open question is not "is it published" (it is not) but "should a
   fact the record holds have a way to reach a reader who asks". That question
   stays open, and it is held as a RELATION between two facts rather than
   collapsed into either: the producer STILL COMPUTES it AND no published surface
   carries it. Deleting the producer's key satisfies half; publishing it
   satisfies the other half; only the pair describes the decided state. */
t("REC-58 RELATION: the producer computes `opened` AND no published surface carries it — BOTH halves, "
+ "so neither deleting the computation nor publishing the field can satisfy this assertion alone",
  [has(producerReturn.text, "opened"),
   has(publicReturn.text, "opened"),
   has(ratifyCase.text, "opened"),
   has(manifest.text, "opened")],
  [true, false, false, false]);

/* THE OVER-STRICTNESS ARM. A genuinely correct alternative statement about this
   code, phrased in nothing like the words above, must PASS — otherwise the pins
   are describing this session's wording rather than the plane's behaviour.
   `ratified_at` is the field that legitimately survives on every one of the four
   surfaces `opened` is absent from, and saying so is an independent truth. */
t("REC-58 OVER-STRICTNESS: the field that legitimately DOES travel — `ratified_at`, the instant the "
+ "last member signed — is declared at the OWN top level of the producer and of BOTH published "
+ "surfaces, so these pins are not merely asserting that case fields are scarce",
  [has(producerReturn.text, "ratified_at"),
   has(publicReturn.text, "ratified_at"),
   has(manifest.text, "ratified_at")],
  [true, true, true]);


/* ============================================================================
   NEGATIVE CONTROL — RUN 2026-08-05 by rec58-agent. Recorded at the foot rather
   than the head only because the header above is this item's argument; the arms
   are re-runnable in one step each and every count below is one this session
   MEASURED. Every file restored byte-identically, sha256 compared before and
   after each arm and equal to: src/store.mjs
   1e17fa64a8cf4e71ffc5193e71a729a611e31c6fcc2db9acbc60dff37860813a, src/index.mjs
   913c62a178cac01bdd23be4183fa5b6c0db52e58a9e2a3cf2a2c3e4c396fc3c9 (both are the
   PRE-EDIT shas; this item changes only comments in those two files, so the arms
   below were run against bodies identical to the shipped ones).

   THE SUITE IS 28 ASSERTIONS WHOLE. Every count below was MEASURED by this
   session against the FINAL files, and each arm is one unique string
   replacement at the site quoted with it.

   (1a) THE RULING RESTORED THE OTHER WAY, AT THE PUBLIC READ — in src/store.mjs
        publishedCase()'s success return add `opened: state.opened,` before
        `completeness: state.completeness, ratified_at: state.ratified_at,`
        -> **this suite 26/28, 2 FAIL** (the publishedCase fence arm and the
        RELATION arm) **AND publishedcase.test.mjs 77 pass / 1 fail**, IC-22's
        own assertion. TWO SUITES CATCH IT INDEPENDENTLY, one against source and
        one through the op.
   (1b) THE RULING RESTORED AT op=ratify's ANSWER — in src/index.mjs add
        `opened: pub.case?.opened ?? null,` after
        `case: { edition: pub.case?.edition ?? null,`
        -> **this suite 24/28, 4 FAIL AND multifinding.test.mjs 73/74**, the
        latter naming the op=ratify case block at the WIRE. THIS IS THE ARM THAT
        MATTERS MOST, because op=ratify is the surface the item BELIEVED was
        publishing the field: the fence is proved to be a fence rather than an
        accident of which fields were fashionable. NOTE THE THIRD AND FOURTH
        FAILURES, which were not predicted: the two RE-MEASURED consumer-walk
        arms ALSO fire, because `pub.case?.opened` is a genuine `.opened` READ
        in index.mjs — the walk detects a consumer being created, which is the
        behaviour it exists for and had not been shown to have.
   (1c) THE SPREAD, which is the real-world shape of the risk — in src/index.mjs
        insert `...cs,` before the container manifest's `ratified_at: cs.ratified_at,`
        -> **this suite 27/28, 1 FAIL (the no-spread arm ONLY) and
        multifinding.test.mjs 73/74**. READ THIS ARM BEFORE TRUSTING THE SOURCE
        PINS: the manifest KEY arm stayed GREEN, because a spread declares no
        key and `objectKeys` correctly reports none — so the source instrument
        CANNOT see a field arriving by spread, and only the no-spread arm and
        the through-the-op drive catch it. That is why both instruments exist
        and why neither is redundant.
   (2)  THE WALK NEUTERED, AS A DELTA — append `files.length = 0;` after the
        `})(REPO);` walk invocation -> **21/27 at the time it was run, 6 FAIL**,
        with the corpus line printing `0 files, 0 chars`. AND THE MEASUREMENT
        THE ARM EXISTS FOR: **the headline "opened has ZERO consumers" assertion
        STILL PASSED over the empty corpus.** It was caught only by the paired
        producer arm and the REACH arms — UI-40's finding reproduced exactly at
        a second site. The in-suite arm at block 6 asserts this failure mode
        directly so it cannot be lost.
   (3)  POLARITY — the RELATION arm's expectation flipped from
        `[true, false, false, false]` to `[false, true, true, true]` -> 26/27 at
        the time, 1 FAIL, confirmed RED then restored. No arm is passing because
        it asserts nothing.
   (4)  OVER-STRICTNESS, AND IT FOUND A DEFECT IN THIS SUITE RATHER THAN
        CONFIRMING IT — delete `ratified_at: cs.ratified_at,` from the container
        manifest in src/index.mjs. FIRST RUN, against the region-wide
        `declares()` helper: **27/27, FULLY GREEN** — the pin went on passing
        after the field it names was deleted, because the manifest's `findings:`
        array maps each member to an object that ALSO declares `ratified_at` and
        a region-wide regex cannot tell the case's field from a member's. A
        confident wrong answer in the generous direction. `objectKeys` was added
        in response (top-level keys only, bracket- and paren-depth aware) and the
        arm now measures **26/28, 2 FAIL**. The over-strictness arm is therefore
        the reason this suite's instrument is correct, which is the argument for
        having one at all.
   ========================================================================= */

console.log(`\ncase-opened: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
