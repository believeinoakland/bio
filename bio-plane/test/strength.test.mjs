/* NEGATIVE CONTROL: (run 2026-08-04, five arms in src/store.mjs, each broken ALONE and restored; 42 pass when whole) (a) STRONGEST-LEG COMPOSITION — #weakestOf: `Store.#GRADE_RANK[m.grade] < Store.#GRADE_RANK[weakest.grade]` -> `>` -> 6 fail, both weak-link assertions first ("CAPTURE reads C", "CONNECTION reads D" now read B and A) and the inheritance and cached-query assertions after them. (b) A NULL IN THE RANK COMPARISON — #weakestOf's body replaced by the reuse R1 forbids, `if (weakest === null) { weakest = m; continue; } if (Store.#weakerGrade(m.grade, weakest.grade) === m.grade) weakest = m;` -> 16 fail: every chain reads `null` because `|| 0` ranks the unknown at 0, BELOW D (rank 1) and below a member's signed testimony, and the source assertion "the derivation never calls #weakerGrade" names the reuse itself. (c) COMPOSING THE AXES — #strengthWalk: `const onAxis = leg.grade_axis === axis` -> `const onAxis = true` (one letter joins both populations) -> 11 fail, naming the axes mixed: "the CAPTURE axis never reads a CONNECTION leg's grade (capture composed with connection)" and its mirror, plus the disjoint-population counts. (d) THE DEPTH BOUND REMOVED — #strengthWalk: `if (depth + 1 > bound) {` -> `if (false) {` -> the over-depth chain reads a grade instead of `undetermined` (4 fail) and the store-constructed cycle DOES NOT TERMINATE: the Durable Object answers `RangeError: Maximum call stack size exceeded` from basisFor inside #strengthWalk instead of a result — R3's "our machinery breaking rather than a refusal naming the offender", measured. (e) AN UNGRADED LEG RANKED IN THE POPULATION — #axisResult: `const isLoadBearing = (m) => m.grade != null` -> `() => true` -> 8 fail: the ungraded legs vanish from every not_load_bearing list ("EVERY ungraded leg is named, one or MANY" gets []), the population counts move, and promote itself throws where an axis claims a load-bearing population #weakestOf cannot describe. Restored after each; battery 79/79 green. */
/* REC-12: STRENGTH at inquiry altitude — a PAIR over two POPULATIONS, over a
 * bounded DAG. RECONCILED.md §3.1 (REC-12) read WITH §1.1's amendment block
 * and §1.2's; DEC-21, DEC-18, D-160 and DEC-15 folded in.
 *
 * CORRECTED 2026-08-05 (REC-42), never exempted. This header read "DEC-32's
 * provisional folded in" — the provisional being that a basis is ONE FLAT
 * CONJUNCTION, so an axis is its weakest load-bearing member. Bob has since
 * answered DEC-32 and the flat model is known WRONG as a general rule: a basis
 * carries the RELATIONSHIP between its legs, and strength is the MINIMUM over
 * AND-related legs and the MAXIMUM over independently sufficient GROUNDS.
 *
 * NOT ONE ASSERTION IN THIS FILE CHANGED, and that is the finding rather than
 * luck. Every basis here is UNSTRUCTURED, and DEC-32's ruling makes the
 * unstructured case the conservative one BY REQUIREMENT: legs nobody grouped
 * are necessary, so weakest-leg is still exactly what this file measures. What
 * this header can no longer say is that weakest-leg is the WHOLE rule — it is
 * the within-branch rule, and REC-42's grounds.test.mjs holds the composition
 * ABOVE it, including the control that makes an unstructured basis stronger and
 * fails here as well as there.
 *
 * What is asserted, each in the direction that fails:
 *   1. TWO MEASUREMENTS OVER TWO POPULATIONS (DEC-21). A mixed basis reads TWO
 *      strengths, each naming ITS OWN weakest leg, and no code path anywhere
 *      produces a single composed letter. A leg IS an edge, so one document leg
 *      carries both grades and the leg's recorded AXIS is what admits it to a
 *      population — never "evidentiary legs versus inferential legs".
 *   2. INHERITANCE, PER AXIS. A leg to another inquiry contributes that
 *      inquiry's derived PAIR, capture into capture and connection into
 *      connection, carrying up the ACTUAL leg it names. And the projection is a
 *      CACHE: raise a leg beneath a case and the stored column is stale while
 *      the derivation is right.
 *   3. AN UNGRADED LEG IS INERT, NOT UNRATING (DEC-18). It is excluded from its
 *      axis's population — not weighed, not flooring, not unrating — and NAMED
 *      as not yet load-bearing. UNRATED — D-160's word, and the retired one is
 *      not written in this file either, see RETIRED_WORD below — is the
 *      BOUNDARY CASE where no leg on that axis is graded, and every ungraded
 *      leg is named, one or many. A hunch composes NORMALLY (DEC-15).
 *   4. THE DEPTH BOUND (R3). The walk carries REC-20's EXPORTED
 *      QUEUE_ANCESTOR_DEPTH — one constant, two walks — and an over-depth chain
 *      reports `undetermined` NAMING THE DEPTH rather than throwing. A store-
 *      constructed cycle (REC-11 refuses one at the write, so this suite writes
 *      it straight into inquiry_basis through a subclassed store) TERMINATES
 *      for the same reason, which is the whole argument for the bound.
 *   5. THE COMPARATOR (R1). #weakerGrade is NOT reused: its `|| 0` ranks an
 *      unknown below D — below a member's signed testimony. Asserted at the
 *      source, because "we did not call that function" is a property of the
 *      code and not of one answer.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");
/* The derivation's own region of store.mjs, so a source assertion below is
   about THIS item's code and not about the whole file. */
const REGION = STORE_SRC.slice(
  STORE_SRC.indexOf("REC-12: STRENGTH at inquiry altitude"),
  STORE_SRC.indexOf("/* Eviction. The store is append-only"));
/* D-160: the word this behaviour used to be called, ASSEMBLED FROM HALVES so
   that this file does not carry it either — it names the OPPOSITE behaviour in
   SB-OUTPUT §5.1, and a suite that spells it while forbidding it hands the next
   worker the exact string to copy. Grep D-160 to find this guard. */
const RETIRED_WORD = "SUS" + "PEND";

const mf = new Miniflare({
  modules: true, script: STORE_SRC,
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});

/* Block 5 needs a basis the store itself would REFUSE to write (R3's cycle),
   so it drives a SUBCLASS that adds one raw-insert route and changes nothing
   else. Every method under test is Store's own; the subclass exists because
   REC-11 enforces the DAG at the write and the bound has to be proved against
   the graph that guard exists to keep out. */
const PROBE_SRC = `
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawleg") {
      const p = url.searchParams;
      this.sql.exec(
        "INSERT OR REPLACE INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        p.get("from"), Number(p.get("ord") || 0), p.get("to"), p.get("ttype") || "inquiry",
        "supports", p.get("grade"), p.get("axis"), p.get("source"), null, null);
      return Response.json({ result: { ok: true } });
    }
    return super.fetch(req);
  }
}
export default { fetch(req, env) { return env.STORE.get(env.STORE.idFromName("bio")).fetch(req); } };
`;
const mfp = new Miniflare({
  modules: true, script: PROBE_SRC,
  modulesRoot: "/", scriptPath: SRC("strength-cycle-probe.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
});

const caller = (inst) => async (p, body) => (await (await inst.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;
const call = caller(mf), callp = caller(mfp);

/* ------------------------------------------------------------- documents */

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* A leg renders exactly the keys it carries, so an ABSENT grade is absent in
   the document too — undetermined, stated by the absence, never invented. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : [])])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [] } = {}) => ["---",
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
  ...legLines(legs),
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

const promoteOn = (c) => (id, text, type, base = null) => c("/promote", {
  bundleId: id, base, snapKey: `${id}-${base ? sha(base).slice(0, 8) : "new"}`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER },
  /* REC-18, 2026-08-04: an INFORMATION bundle REGISTERS a capture. A
     capture-axis grade is EARNED from the capture record now, so a document
     with no registered bytes has nothing for the axis to measure and the leg
     claiming one is refused. One sha per bundle — `register.capture_sha` is the
     table's primary key, so a shared sha would move the row rather than add
     one. */
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
});
const promote = promoteOn(call), promoteP = promoteOn(callp);
const strength = (id) => call(`/strength?id=${id}`);
/* REC-25: a direct-DO read of a GATED surface carries the viewer the control
   plane would have stamped; the store fails closed and an unstamped read is an
   outage rather than a leak. /strength and /basis are the ungated DO-internal
   class (REC-11's precedent), and /search is not. */
const search = (q) => call(`/search?q=${encodeURIComponent(q)}&viewer=class:member`);

/* Fixtures. NOTE the capture grades never reach A: grade A for a capture is
   forbidden (CAPTURE-FIDELITY.md:40 — "grade B is what a direct capture by this
   instance is worth"), while grade A for a CONNECTION is legitimate. The two
   axes are not interchangeable even in a fixture. */
const CAP_B = "INFO-2026-0900-cap-b";      // capture B
const CAP_C = "INFO-2026-0900-cap-c";      // capture C  <- the weakest capture
const CON_A = "INFO-2026-0900-con-a";      // connection A
const CON_D = "INFO-2026-0900-con-d";      // connection D, a member's testimony
const UNGR1 = "INFO-2026-0900-ungraded-1"; // no grade at all
const UNGR2 = "INFO-2026-0900-ungraded-2";
for (const d of [CAP_B, CAP_C, CON_A, CON_D, UNGR1, UNGR2]) await promote(d, infoMd(d), "information");

/* CORRECTED 2026-08-04 (REC-18), never exempted, and every GRADE in every
   fixture below is unchanged — this suite is about the ARITHMETIC (two axes, two
   populations, the weakest member of each) and the arithmetic does not care
   where a grade came from. What changed is that `grade_source` stopped being a
   label a fixture could pick: `resolution` is now EARNED against the inquiry's
   subject entity and admits only the CONNECTION axis, and none of these
   questions names a subject. So the default source follows the AXIS — `capture`
   on the capture axis, EARNED from the capture each document now registers, and
   `hunch` on the connection axis, which is the honest name for an authored
   connection grade and the only authored source permitted above D (DEC-15),
   carrying the author and date a hunch must announce itself by. The explicit
   `testimony` legs below are untouched: they were always a member's act. */
const HUNCH = { author: "suite", date: "2026-08-04" };
const g = (target, grade, axis, source = axis === "capture" ? "capture" : "hunch", extra = {}) =>
  ({ target, role: "supports", grade, axis, source,
     ...(source === "hunch" ? HUNCH : {}), ...extra });
const bare = (target, role = "supports") => ({ target, role });

console.log("--- 1. a mixed basis reads TWO strengths, each naming its own weakest leg (DEC-21) ---");
const MIX = "INQ-2026-0900-mixed";
{
  const legs = [g(CAP_B, "B", "capture"), g(CAP_C, "C", "capture"),
                g(CON_A, "A", "connection"), g(CON_D, "D", "connection", "testimony")];
  const r = await promote(MIX, inquiryMd(MIX, { refs: legs.map((l) => l.target), legs }), "inquiry");
  t("the promotion is accepted", r.ok, true);
  const s = await strength(MIX);

  t("CAPTURE reads C — no stronger than the weakest DOCUMENT the conclusion reaches",
    [s.capture.state, s.capture.grade, s.capture.weakest.target_id], ["graded", "C", CAP_C]);
  t("CONNECTION reads D — no stronger than the weakest EDGE the conclusion rests on",
    [s.connection.state, s.connection.grade, s.connection.weakest.target_id], ["graded", "D", CON_D]);
  t("the two axes answer DIFFERENTLY over the same basis, which is what two populations means",
    s.capture.grade === s.connection.grade, false);

  /* If the axes were composed, the capture axis would read D (the connection
     leg) and the connection axis would read C (the capture leg). Each of these
     names both axes, which is what makes the mixing control legible. */
  t("the CAPTURE axis never reads a CONNECTION leg's grade (capture composed with connection)",
    s.capture.weakest.target_id === CON_D || s.capture.grade === "D", false);
  t("the CONNECTION axis never reads a CAPTURE leg's grade (connection composed with capture)",
    s.connection.weakest.target_id === CAP_C || s.connection.grade === "C", false);
  t("a connection-graded leg is NAMED as not load-bearing on capture, with the axis said out loud",
    s.capture.not_load_bearing.map((m) => [m.target_id, /connection axis/.test(m.why || "")])
      .sort(), [[CON_A, true], [CON_D, true]]);
  t("and the populations are DISJOINT by construction: two graded members each side of four legs",
    [s.capture.load_bearing, s.capture.population,
     s.connection.load_bearing, s.connection.population], [2, 4, 2, 4]);

  /* NO CODE PATH PRODUCING A SINGLE COMPOSED LETTER — asserted three ways,
     because "we did not compose them" is a property of the code and of the
     shape, not of one answer. */
  t("the answer carries TWO axis objects and NO scalar for a caller to render as 'the strength'",
    Object.keys(s).sort(), ["bundleId", "capture", "connection", "depth_bound", "ok"]);
  t("neither axis object leaks a composed sibling grade",
    [Object.keys(s.capture).includes("strength"), Object.keys(s.connection).includes("strength")],
    [false, false]);
  t("the derivation never calls #weakerGrade — R1: its `|| 0` ranks an unknown below D",
    /#weakerGrade\s*\(/.test(REGION), false);
  t("and it never composes the two axes through one reduce: #weakestOf is called PER AXIS",
    (REGION.match(/Store\.#weakestOf\(/g) || []).length, 1);
  t("D-160: the word is UNRATED, and the retired one (opposite meaning in SB-OUTPUT §5.1) is absent",
    [/UNRATED/.test(REGION), new RegExp(RETIRED_WORD, "i").test(REGION)], [true, false]);
}

console.log("\n--- 2. an inquiry leg inherits that inquiry's PAIR, per axis; the column is a CACHE ---");
const LEAF = "INQ-2026-0901-leaf", PARENT = "INQ-2026-0901-parent";
const L_CAP = "INFO-2026-0901-leaf-cap", L_CON = "INFO-2026-0901-leaf-con", P_CAP = "INFO-2026-0901-par-cap";
{
  for (const d of [L_CAP, L_CON, P_CAP]) await promote(d, infoMd(d), "information");
  const leafLegs = [g(L_CAP, "C", "capture"), g(L_CON, "B", "connection")];
  const leaf0 = inquiryMd(LEAF, { refs: leafLegs.map((l) => l.target), legs: leafLegs });
  await promote(LEAF, leaf0, "inquiry");
  const sl = await strength(LEAF);
  t("the leaf reads its own pair: capture C, connection B",
    [sl.capture.grade, sl.connection.grade], ["C", "B"]);

  const parentLegs = [g(P_CAP, "B", "capture"), g(LEAF, "A", "connection")];
  await promote(PARENT, inquiryMd(PARENT, { refs: parentLegs.map((l) => l.target), legs: parentLegs }), "inquiry");
  const sp = await strength(PARENT);
  t("CAPTURE inherits the leaf's capture (C), not its connection: B here, C beneath, weakest C",
    [sp.capture.grade, sp.capture.weakest.inherited_from, sp.capture.weakest.through],
    ["C", LEAF, L_CAP]);
  t("CONNECTION inherits the leaf's connection (B), not its capture: A on the edge itself, B beneath",
    [sp.connection.grade, sp.connection.weakest.inherited_from, sp.connection.weakest.through],
    ["B", LEAF, L_CON]);
  t("the leg to the inquiry is ITSELF an edge and sits in the connection population carrying its own A",
    sp.connection.not_load_bearing.length + sp.connection.load_bearing, 3);
  t("an inquiry is not a document, so the leg itself contributes nothing to CAPTURE — only what it reaches",
    sp.capture.population, 2);

  /* THE PROJECTION IS A CACHE AND NEVER THE AUTHORITY. Raising a leg one level
     down does not re-promote the parent, so the parent's stored column is stale
     the moment it happens — which is the whole reason the derivation is the
     truth and the column exists only to make a filter an indexed seek. */
  const before = await search(`capture:C`);
  t("the cached column answers a query: the parent is found at capture C",
    before.hits.some((h) => h.bundle_id === PARENT), true);
  const leafLegs2 = [g(L_CAP, "B", "capture"), g(L_CON, "B", "connection")];
  await promote(LEAF, inquiryMd(LEAF, { refs: leafLegs2.map((l) => l.target), legs: leafLegs2 }),
                "inquiry", sha(leaf0));
  t("the DERIVATION is right the instant the leg beneath is raised: the parent now reads capture B",
    (await strength(PARENT)).capture.grade, "B");
  t("and the CACHE is stale, by design — the parent still answers capture:C from its column",
    (await search(`capture:C`)).hits.some((h) => h.bundle_id === PARENT), true);
  t("the two axes are two query fields and there is no combined `strength:` selector to type",
    [/capture:\s*{ col: "inquiry_capture_strength"/.test(QUERY_SRC),
     /connection:\s*{ col: "inquiry_connection_strength"/.test(QUERY_SRC),
     /\n\s*strength:\s*{ col:/.test(QUERY_SRC)], [true, true, false]);
  t("`B or better on an axis` is one indexed query, not a scan of every basis in the store",
    (await search(`capture:<=B legs:>0`)).hits.some((h) => h.bundle_id === LEAF), true);
}

console.log("\n--- 3. an ungraded leg is INERT, not unrating (DEC-18); UNRATED is the boundary case ---");
{
  const INERT = "INQ-2026-0902-inert";
  const legs = [g(CAP_B, "B", "capture"), g(CON_A, "A", "connection"), bare(UNGR1)];
  await promote(INERT, inquiryMd(INERT, { refs: legs.map((l) => l.target), legs }), "inquiry");
  const s = await strength(INERT);
  t("the ungraded leg does NOT unrate and does NOT floor: capture still reads B from its graded leg",
    [s.capture.state, s.capture.grade, s.capture.weakest.target_id], ["graded", "B", CAP_B]);
  t("and the other axis reads too: connection A, from ITS graded leg",
    [s.connection.state, s.connection.grade], ["graded", "A"]);
  t("the ungraded leg is EXCLUDED from both populations — one load-bearing member on each axis",
    [s.capture.load_bearing, s.connection.load_bearing], [1, 1]);
  t("and it is NAMED on both, present and not yet load-bearing — inert never means invisible",
    [s.capture.not_load_bearing.some((m) => m.target_id === UNGR1 && /carries no grade/.test(m.why)),
     s.connection.not_load_bearing.some((m) => m.target_id === UNGR1 && /carries no grade/.test(m.why))],
    [true, true]);

  /* DEC-15: a hunch grade composes NORMALLY — present and asserted, never
     treated as undetermined — and stays VISIBLE as a hunch, because REC-15's
     pre-flight refuses to publish while one is outstanding. */
  const HUNCH = "INQ-2026-0902-hunch";
  const hlegs = [g(CON_A, "B", "connection", "hunch", { author: "casey", date: "2026-08-03" }),
                 g(CAP_C, "C", "capture")];
  await promote(HUNCH, inquiryMd(HUNCH, { refs: hlegs.map((l) => l.target), legs: hlegs }), "inquiry");
  const h = await strength(HUNCH);
  t("a hunch grade is load-bearing and composes normally (DEC-15), and says it is a hunch",
    [h.connection.state, h.connection.grade, h.connection.weakest.grade_source, h.connection.load_bearing],
    ["graded", "B", "hunch", 1]);

  const UNRATED = "INQ-2026-0902-unrated";
  const ulegs = [bare(UNGR1), bare(UNGR2, "cuts_against")];
  await promote(UNRATED, inquiryMd(UNRATED, { refs: ulegs.map((l) => l.target), legs: ulegs }), "inquiry");
  const u = await strength(UNRATED);
  t("no leg graded on an axis: that axis reads UNRATED — no computed strength, not a low score",
    [u.capture.state, u.capture.grade, u.capture.determined,
     u.connection.state, u.connection.grade, u.connection.determined],
    ["unrated", null, false, "unrated", null, false]);
  t("EVERY ungraded leg is named, one or MANY — the plural is part of the ruling",
    u.capture.not_load_bearing.map((m) => m.target_id).sort(), [UNGR1, UNGR2]);
  t("including the leg that CUTS AGAINST: invariant 7's row cannot be dropped by a rendering",
    (u.connection.not_load_bearing.find((m) => m.target_id === UNGR2) || {}).role ?? null,
    "cuts_against");
  t("and the state a caller reads is spelled UNRATED, never the retired word (D-160)",
    [u.capture.state, new RegExp(RETIRED_WORD, "i").test(JSON.stringify(u))], ["unrated", false]);

  const EMPTY = "INQ-2026-0902-nolegs";
  await promote(EMPTY, inquiryMd(EMPTY), "inquiry");
  const e = await strength(EMPTY);
  t("a zero-leg inquiry is legal (DEC-22) and reads UNRATED on both axes with nothing named",
    [e.capture.state, e.capture.population, e.connection.state, e.connection.population],
    ["unrated", 0, "unrated", 0]);
}

console.log("\n--- 4. the walk carries R3's depth bound, and exhaustion is `undetermined` (not an error) ---");
{
  const D = (n) => `INQ-2026-0903-d${n}`;
  /* Deepest first, so every write is legal: d8 rests on a document, and dK on
     d(K+1). Eight links is two more than the bound. */
  await promote(D(8), inquiryMd(D(8), { refs: [CAP_B], legs: [g(CAP_B, "B", "capture")] }), "inquiry");
  for (let i = 7; i >= 0; i--)
    await promote(D(i), inquiryMd(D(i), { refs: [D(i + 1)], legs: [g(D(i + 1), "A", "connection")] }), "inquiry");

  const bound = Number(/QUEUE_ANCESTOR_DEPTH\s*=\s*(\d+)/.exec(STORE_SRC)[1]);
  t("the bound is REC-20's EXPORTED constant, INHERITED and not a second one minted here",
    [(await strength(D(0))).depth_bound, bound,
     /(?:STRENGTH|BASIS)_(?:DEPTH|BOUND)\s*=/.test(REGION)], [6, 6, false]);

  const deep = await strength(D(0));
  t("a chain deeper than the bound reports `undetermined` on BOTH axes rather than throwing",
    [deep.ok, deep.capture.state, deep.capture.grade, deep.capture.determined,
     deep.connection.state, deep.connection.determined],
    [true, "undetermined", null, false, "undetermined", false]);
  t("and it NAMES the depth and where it stopped — R1's shape, an honest not-known",
    [deep.capture.depth_bound, /depth bound of 6/.test(deep.capture.detail),
     (deep.capture.undetermined_at ?? []).length > 0], [6, true, true]);
  t("undetermined is NOT unrated: unknown is not the same fact as nothing-established",
    deep.capture.state === "unrated", false);
  t("at exactly the bound the chain still reads: d2 reaches the document in six hops",
    [(await strength(D(2))).capture.state, (await strength(D(2))).capture.grade], ["graded", "B"]);
  t("one hop further and it does not: the boundary is the bound, not a rounding",
    (await strength(D(1))).capture.state, "undetermined");
}

console.log("\n--- 5. a store-constructed cycle TERMINATES, because the bound is what makes it ---");
{
  const A = "INQ-2026-0904-cyc-a", B = "INQ-2026-0904-cyc-b";
  await promoteP(A, inquiryMd(A), "inquiry");
  await promoteP(B, inquiryMd(B), "inquiry");
  t("REC-11 refuses a cycle at the WRITE, so the suite has to write it directly into the projection",
    (await callp(`/rawleg?from=${A}&to=${B}`)).ok && (await callp(`/rawleg?from=${B}&to=${A}`)).ok, true);
  t("the legs really are cyclic in the store",
    [(await callp(`/basis?id=${A}`)).legs[0].target_id, (await callp(`/basis?id=${B}`)).legs[0].target_id],
    [B, A]);
  /* Read defensively ON PURPOSE: with the bound removed this walk does not
     terminate, the Durable Object answers a stack-overflow error instead of a
     result, and a suite that throws here reports LESS than one that says the
     cycle went unanswered. The control is meant to be re-runnable in one step. */
  const s = (await callp(`/strength?id=${A}`)) ?? {};
  t("and the derivation TERMINATES, reporting `undetermined` and naming the depth",
    [s.ok ?? null, s.capture?.state ?? null, s.connection?.state ?? null,
     /depth bound of 6/.test(s.connection?.detail ?? "")],
    [true, "undetermined", "undetermined", true]);
}

await mf.dispose();
await mfp.dispose();
console.log(`\nstrength: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
