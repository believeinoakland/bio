/* NEGATIVE CONTROL: (run 2026-08-07, rec60-agent, REC-60/D-225) FOUR arms, SIX runs, every
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
/* Identifiers assigned from one, in the same segment — `documentsConcerning` returns
   `documents`, a plain name, and a walk that only read inline expressions would have
   missed the very read D-225 was raised about. */
const localCollections = (body) => {
  const out = new Set();
  let m;
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*)/g;
  while ((m = re.exec(body))) if (ARRAY_EXPR.test(m[2]) || /^\s*\[\s*\]/.test(m[2])) out.add(m[1]);
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

/* The roster: method -> what it publishes, and whether it is bounded and says so. */
const collectionReads = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const locals = localCollections(body);
    const rows = rowCalls(body);
    let keys = [], bound = [], more = [], bareReturn = false;
    for (const ro of returnObjects(body)) {
      if (!/\bok\s*:\s*true/.test(ro)) continue;
      const pairs = topPairs(ro);
      const arr = pairs.filter(([k, v]) => ARRAY_EXPR.test(v) || locals.has(v) || (k === v && locals.has(k))).map(([k]) => k);
      if (!arr.length) continue;
      keys = [...new Set([...keys, ...arr])];
      bound = [...new Set([...bound, ...pairs.map(([k]) => k).filter((k) => BOUND_KEY.test(k))])];
      more = [...new Set([...more, ...pairs.map(([k]) => k).filter((k) => MORE_KEY.test(k))])];
    }
    for (const expr of returnBare(body)) if (ARRAY_EXPR.test(expr)) bareReturn = true;
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

const CODE = decomment(SRC_STORE);
const READS = collectionReads(CODE);
const OPS = opsFor(CODE, READS);
const opsWhere = (v) => [...OPS].filter(([, meth]) => READS.get(meth).verdict === v).map(([op]) => op).sort();
const BARE_OPS = opsWhere("bare"), BOUNDED_OPS = opsWhere("bounded"), UNJUDGED_OPS = opsWhere("unjudged");

/* PRINTED EVERY RUN — corpus size first, so a corpus that SHRANK TO NOTHING is visible
   rather than silent. Three walks this week kept a headline assertion green over an empty
   corpus, twice inside the instrument built to prevent it. */
console.log("\n--- WALK: every published collection, read off store.mjs's own return shapes ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${segments(CODE).size} method segments, `
          + `${READS.size} publishing a collection, reaching ${OPS.size} ops`);
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

/* ------------------------------------------------------- THE RATCHET.
   The residual roster is REAL and this item does not pretend to have emptied it. What is
   pinned is that it cannot GROW: a new read that publishes a collection off an unbounded
   row source fails here, and the roster is printed above so the failure names it. The
   figure is a MEASUREMENT with a date, not a target. */
const BARE_ROSTER_MEASURED_2026_08_07 = BARE_OPS.length;
console.log(`  RATCHET: ${BARE_ROSTER_MEASURED_2026_08_07} bare-collection read ops remain, `
          + `listed above and measured 2026-08-07`);
t("RATCHET: the bare roster is a CEILING, not a target — a NEW read that publishes a collection "
+ "off an unbounded row source pushes this over the figure measured on 2026-08-07 and fails here",
  BARE_OPS.length <= 27, true);

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

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
