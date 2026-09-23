/* NEGATIVE CONTROL: RUN 2026-09-16 by the REC-108 worker — SIX arms, each armed ALONE in `src/query.mjs` and restored from its OWN uniquely-named pristine copy, every restore verified byte-identical by sha256 AND by `cmp` AND by size (118,327 bytes, sha256 ee26cea1fa44de9f, floored at 50 kB, 0 copies left in the tree). ONE COMMAND EACH: `node test/nc-rec108.mjs <none|a|b|c|d|e>` from `bio-plane/` — the driver holds every patch, its DECLARATION and the declared-vs-actual check, so the next session re-runs an arm in ONE step instead of re-deriving how to break the subject. BASELINE ARM `none` = 38 pass / 0 fail / exit 0, and it exists because a driver whose every arm reports one number cannot tell five-arms-broken from five-arms-working. (a) THE ITEM'S OWN — `cachedNotes` answers `[]` for every query, so the cache publishes the stronger letter again with nothing saying what the letter is a value OF (also this item's one-line reversal if IC-108 is rejected) -> 29 pass, 9 FAIL, AS DECLARED, and **THE HEADLINE FAILURE NAMES BOTH FIGURES**, which the row requires because a failure naming one is one a reader cannot act on: `want {"filtered_by":"B","derived_now":"C","answer_states_the_source":"capture (inquiry_capture_strength) as of each question's LAST PROMOTION; authority op=inquirystrength"} got {"filtered_by":"B","derived_now":"C","answer_states_the_source":null}`. (b) THE FACET ROUTE DROPPED — the route D-379's own text does not name, and the one that answers a member who never asked -> 36 pass, 2 FAIL, AS DECLARED. **This is the arm that proves the CENSUS changed the fix rather than decorating it:** without it, a sentence on the selector alone passes every other assertion in the suite. (c) THE MARKER LISTED INSTEAD OF DERIVED — behaviourally IDENTICAL, which is exactly why it needs an arm -> 37 pass, 1 FAIL, AS DECLARED, and the ONLY assertion that sees it is the inversion pin. (d) THE ROUTES NOT GATED ON WHAT ACTUALLY RAN — the honesty mechanism itself overclaiming -> 32 pass, 6 FAIL, AS DECLARED. (e) OVER-STRICTNESS — the SAME rule written as a lookup table instead of a chain of short-circuits -> 38 pass, 0 FAIL, exit 0: correct work in a spelling this item did not anticipate PASSES. **THREE FINDINGS ABOUT THE ARMS THEMSELVES, recorded rather than smoothed and kept at each arm in the driver.** ONE: arm (a) FIRST DID NOT REACH THE SUITE'S OWN FOOT — it reported -1/-1, because emptying the block made `one.field` throw a TypeError, and **a TypeError inside an assertion goes through NO assertion at all**: four DECLARED failures never fired and the driver caught it only because it reports a missing foot as -1 rather than 0. The suite was corrected (`|| {}`, with the reason at the site) so the assertions FAIL instead of throwing, and the arm then bit 9. TWO: arm (b)'s first declaration also named "the statement fires over an AGREEING pair too" and it did NOT fail — the arm was right and the DECLARATION was wrong, because that assertion queries with `facets=none` and is blind to a dropped facet route BY CONSTRUCTION; it is in the held-open half now. THREE: arm (d) bit ONE MORE than declared and in the correct direction — `op=meaningrows` also lost its ability to say it read no cache, because `compile()` fills `facetList` with the defaults whatever the caller will do with them; declared now, so the record matches the measurement rather than being generous. **AND THE WHOLE ARM IS DRIVEN ON A FIXTURE, NEVER ON THE LIVE INSTANCE, WHICH IS STATED BECAUSE IT IS A LIMIT AND NOT A CHOICE:** `test/rec88-instance-census.mjs` measured ZERO captures carrying a transcription chain anywhere in store `bio` on 2026-09-15, so on the live instance every answer is byte-identical by construction and would pass every arm above **without exercising one of them**. A control run there would be the costs-nothing equality exactly. */
/* REC-108 · D-379 — THE CAPTURE-AXIS CACHE STAYS A CACHE, AND EVERY ROUTE INTO
 * IT STATES WHAT IT IS A VALUE *OF*.
 *
 * WHAT THIS ITEM IS NOT, SAID FIRST BECAUSE THE ROW IS EASY TO MISREAD. This is
 * NOT a third computation of a capture letter. The first computation PERSISTED,
 * into `bundles.inquiry_capture_strength`, and it answers at a different TIME.
 * Its staleness was always a documented contract (REC-12's own comment, and its
 * suite proves the staleness on purpose). What REC-105 made new is the PATH: a
 * DOCUMENT being re-read — a machine's act, on another bundle, with no member
 * involved — now moves the ceiling `strengthOf()` caps by, and the stale value
 * is the STRONGER letter, which is the direction this project weighs heaviest.
 *
 * THE RULING, AND IT IS D-379 OPTION (b) TAKEN ON REC-105'S OWN RECOMMENDATION.
 * The full argument and its evidence live at `query.mjs`'s `CACHED_FIELDS` and
 * at `store.mjs`'s `#writeStrengthProjection`; the two lines that matter here
 * are that (a) would have made the column fresh along the NEW path and left it
 * stale along REC-12's ORIGINAL one — a cache about which the honest sentence
 * can no longer be said — and that its cost is an UNBOUNDED fan-out inside
 * `op=promote`'s transaction, VERIFIED on this tree rather than inherited from
 * the row (`#writeTextSource` runs inside `#writeReadings` inside promote; the
 * dependents are `inquiry_basis.target_id` rows, indexed but unbounded, each
 * needing a full recursive walk).
 *
 * WHAT THE CENSUS CORRECTED IN THE ROW'S OWN STATEMENT OF THE PROBLEM, and it
 * is why the fix is a mechanism rather than one sentence on one selector:
 * THE CACHED COLUMN HAS THREE ROUTES, NOT ONE — the `capture:` SELECTOR a
 * member typed, the DEFAULT FACET nobody asked for, and `sort=capture`. Both
 * halves are DRIVEN below. And `overdue`, the precedent D-379 rests option (b)
 * on, is NOT in `DEFAULT_FACETS` — checked against the artifact rather than
 * cited — so the precedent does not extend on its own.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE FIXTURE IS REAL AND NON-EMPTY, printed and floored.
 *   2. THE DIVERGENCE IS DRIVEN END TO END IN ONE TEST, through the SELECTOR
 *      and through `op=inquirystrength`, and the headline assertion NAMES BOTH
 *      FIGURES — the letter the member was filtered by and the letter the
 *      record derives now.
 *   3. THE CACHE CHANGES WHERE THE REGISTRY BOUNDS IT. Re-promote the question
 *      and the column moves B -> C while nothing else does. This is the arm
 *      that makes the equality EVIDENCE: two paths through one function cannot
 *      disagree, so a pin over them would prove nothing (REC-105's arm (b) is
 *      the worked example). The cache and the walk are shown to be genuinely
 *      different sources by being made to answer differently and then agree.
 *   4. THE ANSWER SAYS WHAT IT READ, on each of the three routes separately,
 *      including the FACET-ONLY answer to a member who never typed `capture:`.
 *   5. OVER-STRICTNESS: a query that consults no cached column answers `[]`; a
 *      publisher-typed document's question is unmoved; and `op=inquirystrength`
 *      carries NO new key, because the authority was not this item's to touch.
 *   6. SOURCE PINS — properties of the CODE rather than of one fixture.
 *   7. THE READER CENSUS, DRIVEN: is there a FOURTH? There is, and it is NAMED
 *      rather than implied — see block 7 and D-383.
 *
 * Everything runs against `src/index.mjs`'s real worker through miniflare, so a
 * feature no caller can reach fails here rather than passing at store level
 * (D-43: `op=invitelook` shipped with a ReferenceError while 1276 assertions
 * passed).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r108", MEMBER_TOKEN: "mem-r108", PROBE_TOKEN: "prb-r108",
              AI_TOKEN: "ai-r108", VERSION: "test" },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r108") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r108") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ===================== THE FIXTURE =====================
   Built the way REC-105's census established it must be, and the ORDER IS
   FORCED BY THE RECORD RATHER THAN CHOSEN: REC-88's write-side refusal (C-2.8,
   naming the measured fidelity) means a leg at capture B on a document already
   OCR'd at C CANNOT BE AUTHORED. The only route into D-379's shape is the one
   D-379 describes — the document is CLEAN when the leg is written and is
   RE-READ afterwards — and the record is append-only, so the member's authored
   letter survives its own document being re-read at a weaker fidelity. */
const NOW = "2026-09-16T00:00:00Z", LATER = "2026-09-16T01:00:00Z";
const refLines = (t2) => t2.length
  ? ["references:", ...t2.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: supports`,
      ...(l.grade ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : [])])]
  : [];
const inquiryMd = (id, { subject = null, refs = [], legs = [], updated = LATER } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${updated}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []), ...legLines(legs),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260916T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }];
const readingOf = (s, chain) => ({
  capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });
const OCR_CHAIN = [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];

/* TWO SHAPES AND NO MORE, because this item's subject is the CACHE and not the
   bound. REC-105's census already drove all five shapes against the bound and
   this suite does not re-litigate them; what it needs is one MOVER (the shape
   whose registry ceiling falls after the leg was written) and one UNMOVED
   control (publisher-typed text, which earns the ceiling and must stay put). */
const DOC_MOVE = "INFO-2026-9601-ocr-at-c", INQ_MOVE = "INQ-2026-9601-mover";
const DOC_CLEAN = "INFO-2026-9602-publishertyped", INQ_CLEAN = "INQ-2026-9602-clean";
/* A THIRD PAIR, IDENTICAL TO THE MOVER AND NEVER TOUCHED AGAIN, and it exists
   because of a measurement rather than a plan: block 3 has to CORRECT the
   mover's leg to move its cache (C-2.8 forbids re-promoting it uncorrected),
   and that correction destroys the very state block 7 must observe — a leg
   still AUTHORED at B on a document the record now bounds at C. Reusing one
   fixture for both would have made block 7 measure the post-correction world
   and report `no fourth reader` over a shape that no longer existed. */
const DOC_CENSUS = "INFO-2026-9603-census", INQ_CENSUS = "INQ-2026-9603-census";
const SHA_MOVE = sha("rec108-move"), SHA_CLEAN = sha("rec108-clean"), SHA_CENSUS = sha("rec108-census");

for (const [doc, inq, s, reread] of [[DOC_MOVE, INQ_MOVE, SHA_MOVE, OCR_CHAIN],
                                     [DOC_CLEAN, INQ_CLEAN, SHA_CLEAN, null],
                                     [DOC_CENSUS, INQ_CENSUS, SHA_CENSUS, OCR_CHAIN]]) {
  const reg = [{ path: "snapshots/r.bin", sha256: s, encoding: "binary", bytes: 10 }];
  await promote(doc, infoMd(doc), "information", { reading: readingOf(s, undefined), register: reg });
  await post("resolve", { captureSha: s });
  await promote(inq, inquiryMd(inq, { subject: ORD, refs: [doc],
    legs: [{ target: doc, grade: "B", axis: "capture", source: "capture" }] }), "inquiry");
  if (reread) await promote(doc, infoMd(doc), "information",
    { reading: readingOf(s, reread), register: reg });
}

/* ---- small readers over the real ops, so every figure below is driven ---- */
const capOf = async (id) => {
  const st = await get("inquirystrength", `id=${id}`);
  return st && st.capture ? st.capture.grade : `NO-ANSWER:${JSON.stringify(st).slice(0, 120)}`;
};
const seek = async (qs) => {
  const r = await get("search", qs);
  return { ids: (r.hits || []).map((h) => h.bundle_id).sort(), cached: r.cached, total: r.total, raw: r };
};
/* The CACHE read back through the only door a member has to it: the indexed
   selector. `capture:X` is an equality seek on `inquiry_capture_strength`, so
   asking each letter in turn and seeing which one matches IS a read of the
   column — through the surface, never around it. */
const cachedLetterOf = async (id) => {
  for (const g of ["A", "B", "C", "D"]) {
    const r = await seek(`q=capture:${g}&facets=none&limit=200`);
    if (r.ids.includes(id)) return g;
  }
  return null;
};

console.log("\n--- 1. THE FIXTURE IS REAL AND NON-EMPTY (a headline over an empty corpus has passed here three times) ---");
{
  const all = await seek("q=type:inquiry&facets=none&limit=200");
  console.log(`  corpus: ${all.total} inquiries in scope · ${JSON.stringify(all.ids)}`);
  t("all three questions are in the corpus this suite is about to measure",
    [all.ids.includes(INQ_MOVE), all.ids.includes(INQ_CLEAN), all.ids.includes(INQ_CENSUS)],
    [true, true, true]);
  t("and the corpus is FLOORED, so a fixture that silently stopped promoting fails here",
    all.total >= 3, true);
}

console.log("\n--- 2. THE DIVERGENCE, DRIVEN END TO END: the selector and op=inquirystrength in ONE test ---");
let statedSource = null;
{
  const derivedNow = await capOf(INQ_MOVE);
  const filteredBy = await cachedLetterOf(INQ_MOVE);
  const r = await seek(`q=capture:B&facets=none&limit=200`);
  const note = (r.cached || []).find((c) => c.field === "capture") || null;
  statedSource = note ? `${note.field} (${note.column}) as of ${note.as_of}; authority ${note.authority}` : null;

  /* THE HEADLINE, AND IT NAMES BOTH FIGURES BY CONSTRUCTION. A failure naming
     one letter is a failure a reader cannot act on: "the cache is wrong" does
     not say wrong against WHAT, and "the walk says C" does not say what the
     member was shown. Both letters and the statement travel in one assertion so
     that removing the fix prints all three. */
  t("the letter a member is FILTERED BY, the letter the record DERIVES NOW, and whether the answer says which is which",
    { filtered_by: filteredBy, derived_now: derivedNow, answer_states_the_source: statedSource },
    { filtered_by: "B", derived_now: "C",
      answer_states_the_source: "capture (inquiry_capture_strength) as of each question's LAST PROMOTION; authority op=inquirystrength" });
  t("and the question IS returned by a `B or better` filter the record no longer supports — the exposure is the LIST",
    r.ids.includes(INQ_MOVE), true);
  t("while op=inquirystrength — the authority, which reads no column — answers the bounded letter",
    derivedNow, "C");
}

console.log("\n--- 3. THE CACHE CHANGES WHERE THE REGISTRY BOUNDS IT (the equality DRIVEN, not asserted) ---");
{
  /* REC-105's arm (b) is the worked example of why this block exists: two paths
     through ONE function cannot disagree, so a pin over them proves nothing. To
     be evidence, the cache must be SHOWN moving — and it only moves when the
     question is re-promoted, which is exactly the contract this item published.
     So the movement is not a fix; it is the PROOF that cache and walk are two
     sources answering at two times. */
  const before = await cachedLetterOf(INQ_MOVE);

  /* AN ARM THAT CAME BACK DIFFERENT FROM ITS DECLARATION, RECORDED RATHER THAN
     SMOOTHED, AND IT IS THIS BLOCK'S MOST USEFUL RESULT. The obvious way to
     refresh the column — re-promote the question unchanged — IS REFUSED, by
     name, with C-2.8 naming both letters. REC-88's write-side refusal
     re-validates the WHOLE basis on every promotion, so once the document has
     been re-read at a weaker fidelity the question CANNOT BE PROMOTED AT ALL
     until its leg is corrected. The consequence matters to D-379's ruling and
     is stated here because nothing else in the corpus says it: THE STALE
     STRONGER LETTER IS NOT SELF-CLEARING AND NO ORDINARY ACT CLEARS IT. It sits
     until a member lowers the leg — which is precisely why the answer has to
     say what it is a value of rather than wait for a re-promotion. */
  const refused = await post("promote", {
    bundleId: INQ_MOVE, base: HEAD.get(INQ_MOVE),
    snapKey: `20260916T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha("stuck").slice(0, 8)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Bundle ${INQ_MOVE}`,
            current_state: "open", created: NOW, last_updated: "2026-09-16T02:00:00Z" },
    files: [{ path: "bundle.md", text: inquiryMd(INQ_MOVE, { subject: ORD, refs: [DOC_MOVE],
              legs: [{ target: DOC_MOVE, grade: "B", axis: "capture", source: "capture" }],
              updated: "2026-09-16T02:00:00Z" }),
              bytes: 0, sha256: sha(inquiryMd(INQ_MOVE, { subject: ORD, refs: [DOC_MOVE],
                legs: [{ target: DOC_MOVE, grade: "B", axis: "capture", source: "capture" }],
                updated: "2026-09-16T02:00:00Z" })) }],
    register: [] });
  t("re-promoting the question UNCHANGED is REFUSED by C-2.8 — so the stale letter is NOT self-clearing",
    { ok: refused.ok, reason: refused.reason,
      check: (refused.findings || [])[0] ? refused.findings[0].check : null },
    { ok: false, reason: "BASIS_REFUSED", check: "C-2.8" });
  t("and the refusal NAMES BOTH LETTERS, which is what makes it actionable",
    /stronger than the C the record can earn/i.test(((refused.findings || [])[0] || {}).detail || "")
      && /capture grade of B/i.test(((refused.findings || [])[0] || {}).detail || ""), true);
  t("the cached column is UNMOVED by a refused promotion — a refusal writes nothing",
    await cachedLetterOf(INQ_MOVE), "B");

  /* THE ONE ACT THAT DOES MOVE IT — the member correcting the leg to the letter
     the record can earn, which is the act C-2.8 forces. The column is written
     from `strengthOf()` inside that transaction, so this is the cache being
     SHOWN CHANGING to exactly where the registry bounds it. */
  await promote(INQ_MOVE, inquiryMd(INQ_MOVE, { subject: ORD, refs: [DOC_MOVE],
    legs: [{ target: DOC_MOVE, grade: "C", axis: "capture", source: "capture" }],
    updated: "2026-09-16T02:00:00Z" }), "inquiry");
  const after = await cachedLetterOf(INQ_MOVE);
  const derivedNow = await capOf(INQ_MOVE);

  t("the cached column MOVES, B -> C, and lands where the registry bounds it — the movement that makes this evidence",
    { before, after }, { before: "B", after: "C" });
  t("it lands on the letter the registry bounds the leg to — the cache is a PROJECTION of the walk and is shown to be one",
    { cache: after, walk: derivedNow }, { cache: "C", walk: "C" });
  t("and a `capture:B` filter no longer returns it, while `capture:C` does",
    [(await seek("q=capture:B&facets=none&limit=200")).ids.includes(INQ_MOVE),
     (await seek("q=capture:C&facets=none&limit=200")).ids.includes(INQ_MOVE)], [false, true]);
  /* The control question must NOT have moved: if re-promoting one inquiry moved
     another's column, the movement above would be an artefact of the fixture. */
  t("the publisher-typed control's column is UNMOVED by any of it",
    await cachedLetterOf(INQ_CLEAN), "B");
}

console.log("\n--- 4. THE ANSWER SAYS WHAT IT READ, ON EACH OF THE THREE ROUTES SEPARATELY ---");
{
  const via = async (qs) => ((await seek(qs)).cached || []).map((c) => [c.field, c.via.join("+")]);

  t("FILTER only — facets off, default sort",
    await via("q=capture:C&facets=none&limit=5"), [["capture", "filter"]]);

  /* THE ROUTE D-379 DOES NOT NAME, AND IT IS THE ONE THAT ANSWERS UNASKED.
     `capture` is in DEFAULT_FACETS, so a member who typed a word and nothing
     else is handed a per-letter count of the corpus off the cached column. A
     sentence attached to the selector alone would never have reached them. */
  t("FACET only — a member who never typed `capture:` is STILL answered from the cache, and the answer says so",
    await via("q=type:inquiry&limit=5"),
    [["capture", "facet"], ["connection", "facet"]]);

  t("SORT only — `sort=capture` orders the page by the cached letter",
    await via("q=type:inquiry&facets=none&sort=capture&limit=5"), [["capture", "sort"]]);

  t("ALL THREE at once, in FIELDS order and never in the order they were reached",
    await via("q=capture:C&sort=capture&limit=5"),
    [["capture", "filter+facet+sort"], ["connection", "facet"]]);

  /* `|| {}` IS NOT DEFENSIVE TIDYING AND IS HERE BECAUSE AN ARM MEASURED IT. The
     first spelling read `[0]` bare, so the negative control that empties this
     block threw a TypeError on `one.field` — and a TypeError inside an assertion
     goes through NO assertion at all: it ends the module while the tally reads
     clean, and four DECLARED failures never fired. The driver caught it only
     because it reports a missing foot as -1 rather than 0. An assertion that
     cannot FAIL when its subject is empty is not an assertion. */
  const one = ((await seek("q=capture:C&facets=none&limit=5")).cached || [])[0] || {};
  t("the entry names the column, the authority, and what the value is a value OF",
    { field: one.field ?? null, column: one.column ?? null,
      authority: one.authority ?? null, as_of: one.as_of ?? null },
    { field: "capture", column: "inquiry_capture_strength", authority: "op=inquirystrength",
      as_of: "each question's LAST PROMOTION" });
  const detail = one.detail || "";
  t("and the sentence a member reads NAMES THE ACT that moves it without them — a document being re-read",
    /re-read/.test(detail) && /not at this query/.test(detail)
      && detail.includes("op=inquirystrength"), true);
}

console.log("\n--- 5. OVER-STRICTNESS: what this item must NOT have moved ---");
{
  t("a query that consults NO cached column answers with an EMPTY statement, published rather than omitted",
    (await seek("q=type:information&facets=none&sort=created&limit=5")).cached, []);
  t("and `[]` is a STATEMENT — the key is present, so `no cache was read` is distinguishable from `this build cannot say`",
    "cached" in (await seek("q=type:information&facets=none&sort=created&limit=5")).raw, true);
  t("a `count` runs neither facets nor an order, so only a FILTER can be stated",
    ((await seek("q=capture:C&mode=count")).cached || []).map((c) => c.via.join("+")), ["filter"]);

  /* The publisher-typed question: the registry states the ceiling its leg
     already claims, so cache and walk AGREE — and the statement fires ANYWAY.
     A statement that appeared only when the two disagreed would be a statement
     nobody could rely on, because its absence would then have two causes. */
  t("the publisher-typed question is unmoved on BOTH reads",
    { cache: await cachedLetterOf(INQ_CLEAN), walk: await capOf(INQ_CLEAN) },
    { cache: "B", walk: "B" });
  t("and the statement fires over an AGREEING pair too — it describes the SOURCE, never a disagreement",
    ((await seek("q=capture:B&facets=none&limit=5")).cached || []).map((c) => c.field), ["capture"]);

  /* THE AUTHORITY WAS NOT THIS ITEM'S TO TOUCH, and that is pinned structurally
     rather than promised. `op=inquirystrength` reads no column, so there is
     nothing for it to state and a `cached` key there would be this item leaking
     into the authority. */
  const st = await get("inquirystrength", `id=${INQ_CLEAN}`);
  t("op=inquirystrength carries NO new key — the derivation reads no cache and states none",
    "cached" in st, false);
  /* The op's own shape, READ OFF THE OP rather than off `strengthOf()`: it
     publishes `target`, not the derivation's `bundleId`. The first spelling of
     this assertion copied the DO-internal name and FAILED, which is the
     assertion doing its job — an equality against a remembered shape is not an
     equality against the shipped one. */
  t("and its answer still carries exactly the shape REC-34 published",
    ["ok", "target", "depth_bound", "capture", "connection"].filter((k) => !(k in st)), []);
}

console.log("\n--- 6. SOURCE PINS: properties of the CODE, not of one fixture ---");
{
  t("`CACHED_FIELDS` is DERIVED from FIELDS and never listed beside it — the inversion, not a list of spellings",
    /export const CACHED_FIELDS = Object\.fromEntries\(\s*\n?\s*Object\.entries\(FIELDS\)\.filter\(\(\[, f\]\) => f\.asOf\)/.test(QUERY_SRC), true);
  t("and the AST walk matches a CACHED COLUMN, not a selector NAME, so a second spelling over the same column is caught",
    /node\.op === "meta" && node\.col/.test(QUERY_SRC), true);

  /* THE MEASUREMENT THAT CHANGED THE FIX, PINNED SO THE NEXT READER SEES IT WAS
     MEASURED. D-379 rests option (b) on `overdue:`'s precedent. `overdue` is a
     filter a member OPTS INTO; `capture` is counted for everyone by default. */
  const facets = /export const DEFAULT_FACETS = \[([\s\S]*?)\]/.exec(QUERY_SRC)?.[1] ?? "";
  t("`capture` IS a DEFAULT facet and `overdue` is NOT — the precedent does not extend on its own",
    { capture: /"capture"/.test(facets), overdue: /"overdue"/.test(facets) },
    { capture: true, overdue: false });

  t("`legs` carries NO marker: it is written from the legs in the SAME transaction and is EXACT, not stale",
    /legs:\s+\{ col: "inquiry_basis_count",\s+type: "number" \}/.test(QUERY_SRC), true);

  /* NOTHING IN THE COMPUTATION MOVED. This item's whole claim is that it left
     the cache alone, so the absence of a re-walk is asserted rather than
     described: `#writeTextSource` gained no dependent sweep, and the projection
     writer still derives from `strengthOf()` and from nothing else. */
  /* THE MARKER MUST NOT WIDEN A SECOND OP'S CONTRACT, and nothing pinned that
     before this item. `searchFields()` projects each field EXPLICITLY as
     `{ type, freeText, column }`, so `asOf`/`authority`/`why` stay inside the
     plane — but an innocent refactor to `...f` would publish them on
     `op=searchfields` and silently widen I3 beyond the one shape IC-108
     declares. Driven through the op, not read off the source. */
  const sf = await get("searchfields", "");
  t("op=searchfields publishes EXACTLY the three keys it always did — the marker does not leak",
    Object.keys(sf.fields.capture).sort(), ["column", "freeText", "type"]);
  t("...and its `capture` entry is byte-identical to its `connection` entry in SHAPE, as it was",
    Object.keys(sf.fields.capture).sort().join(),
    Object.keys(sf.fields.connection).sort().join());

  const wts = /#writeTextSource\(bundleId, sha, chain\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("`#writeTextSource` gained NO dependent re-walk — option (a) was NOT taken, and that is structural",
    { found: wts.length > 0, walks: /inquiry_basis|strengthOf|writeStrengthProjection/.test(wts) },
    { found: true, walks: false });
  t("and the projection writer still derives from strengthOf() and touches no second source",
    /#writeStrengthProjection\(bundleId, isInquiry, subjectEntity = null\) \{[\s\S]*?const s = this\.strengthOf\(bundleId\);/.test(STORE_SRC), true);
}

console.log("\n--- 7. THE READER CENSUS, DRIVEN: IS THERE A FOURTH? ---");
{
  /* The row's instruction, repeated from REC-105's: a fact with three readers
     may have a fourth, and the control must find no fourth OR NAME IT. It is
     NAMED. `op=meaningrows&rows=leg` publishes `inquiry_basis.grade` and
     `grade_axis` STRAIGHT OFF THE COLUMN — the AUTHORED letter, uncapped by the
     registry — and `leg:grade=B leg:axis=capture` is a SELECTOR over the same
     column. It is not a cache and not a time problem: it is the pre-REC-105
     read surviving in a surface nobody swept, and it is D-383.
     THIS ALSO CORRECTS REC-105'S OWN CENSUS IN ONE LINE, which said the
     authored letter could not be read back through any member-reachable op
     (`/basis` and `/restson` being the DO-internal class). It can. */
  const mr = await get("meaningrows", "rows=leg&q=type:inquiry&limit=500");
  const legs = (mr.rows || []).filter((r) => r.bundle_id === INQ_CENSUS && r.target_id === DOC_CENSUS);
  const derivedNow = await capOf(INQ_CENSUS);
  console.log(`  census: ${(mr.rows || []).length} leg rows read through op=meaningrows`);

  t("the meaning arm is REACHABLE and returns this question's leg",
    legs.length, 1);
  /* CORRECTED BY REC-114 (D-383 CLOSED), NOT EXEMPTED — and the old assertion
     is quoted here because what it asserted was TRUE when written and is the
     reason this block exists. It read:
         want { authored_published: "B", axis: "capture", record_derives: "C" }
     i.e. it pinned the DEFECT this block had just discovered: `grade` carrying
     the member's AUTHORED letter, uncapped, while the record derived a weaker
     one. REC-114 ruled that a leg listing publishes what the record can
     SUPPORT, with the authored letter beside it rather than erased — so `grade`
     is now the EARNED letter, `grade_authored` carries what was authored, and
     `grade_why` says why they differ. The census finding this block made is
     unchanged and still stands; only the letter the surface publishes moved.
     An exempted assertion here would have been a rule nobody was enforcing. */
  t("THE FOURTH READER IS CLOSED (REC-114): op=meaningrows now publishes the EARNED letter with the AUTHORED one beside it",
    { earned_published: legs[0] ? legs[0].grade : null,
      authored_published: legs[0] ? legs[0].grade_authored : null,
      axis: legs[0] ? legs[0].grade_axis : null, record_derives: derivedNow },
    { earned_published: "C", authored_published: "B", axis: "capture", record_derives: "C" });
  t("...and the letter it publishes now AGREES with the authority, which is what D-383 was open about",
    legs[0] ? legs[0].grade === derivedNow : null, true);
  t("it is NOT a cache — it reads `inquiry_basis` live, so it states nothing and correctly states nothing here",
    mr.cached, []);
  /* ALSO CORRECTED BY REC-114. The old pin read the `grade:` sub-field as the
     exact literal `grade: { col: "grade", case: "upper", vocab: [] }` — which
     REC-114 edited, adding a `selects` sentence telling a member that this
     SELECTOR still reads the AUTHORED column while the row publishes the earned
     letter. Pinning a whole literal made a true statement (the column is
     selectable) brittle against any addition to the descriptor, so the
     corrected pin asserts the PROPERTY instead: the selector still targets the
     `grade` column, which is what "the drift is filterable" actually means. */
  t("and the same column is STILL SELECTABLE, so the drift is filterable as well as readable",
    /grade:\s+\{ col: "grade",\s+case: "upper"/.test(QUERY_SRC), true);

  /* The OTHER fourth-reader candidate, named rather than left as a silence: the
     VERSION path. `#versionLegsAsMembers` resolves through `earnedBasisRegistry`
     and has since REC-88, so it is a reader of this fact that is ALREADY
     CORRECT — which is why neither D-373 nor D-379 counted it, and why saying
     "no fourth" without naming it would be the absence-with-two-causes failure
     `CLAUDE.md` forbids. Pinned by source, because it is correct and must stay. */
  t("the VERSION path is a further reader and is ALREADY CORRECT (REC-88) — named, not omitted",
    /#versionLegsAsMembers[\s\S]{0,4000}?earnedBasisRegistry\(/.test(STORE_SRC), true);
}

await mf.dispose();
console.log(`\nrec108-cache-asof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
