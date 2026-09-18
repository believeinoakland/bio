/* NEGATIVE CONTROL: RUN 2026-09-17 by the REC-114 worker — FIVE arms, each armed ALONE, four in `src/store.mjs` and one in `src/query.mjs`, every arm restored from its OWN uniquely-named pristine copy and every restore verified byte-identical by sha256 AND by `cmp` AND by size against a floor (store.mjs 2,297,565 bytes sha256 00159bb3ea6f6047, floored at 500 kB; query.mjs 154,874 bytes sha256 5fb4c187b038342f, floored at 50 kB; 0 copies left in the tree). ONE COMMAND EACH: `node test/nc-rec114.mjs <none|a|b|c|d|e>` from `bio-plane/` — the driver holds every patch, its DECLARATION and the declared-vs-actual check, so the next session re-runs an arm in ONE step instead of re-deriving how to break the subject. BASELINE ARM `none` = 36 pass / 0 fail / exit 0, and it exists because a driver whose every arm reports one number cannot tell four-arms-broken from four-arms-working. (a) THE ITEM'S OWN — the resolver hands every row back untouched, so the listing publishes the AUTHORED letter again exactly as it did before this item -> 24 pass, 12 FAIL, AS DECLARED, and **THE HEADLINE FAILURE NAMES BOTH LETTERS AND THE SURFACE**, which the row requires because a failure naming one is one a reader cannot act on: `want {"surface":"op=meaningrows&rows=leg","grade_earned_published":"C","grade_authored_published":"B",…,"authority_op_inquirystrength":"C"} got {"surface":"op=meaningrows&rows=leg","grade_earned_published":"B",…,"authority_op_inquirystrength":"C"}`. (b) THE MEMBER'S ACT ERASED — the letter capped correctly but `grade_authored`/`grade_why` not published, which is the OTHER defensible answer to this item's doctrine question, implemented -> 25 pass, 11 FAIL, AS DECLARED. **This is the arm that proves the ruling's COMPROMISE is load-bearing rather than decorative:** without it, a fix that silently replaced a member's authored letter passes every assertion about the earned one. (c) THE AXIS IGNORED — the capture ceiling applied to every leg carrying a letter -> 33 pass, 3 FAIL, AS DECLARED; the connection leg moves, which is the fence-tighter-than-its-rule failure caught in the direction that publishes a letter nobody asked to bound. (d) THE DECLARATION DROPPED — `rowColumns` stops publishing `rowDerived`, so the ROWS still carry both fields and only `op=searchfields` stops naming them -> 34 pass, 2 FAIL, AS DECLARED. **Behaviourally invisible, which is exactly why it needs an arm** — this is how `target_present` hid for five weeks. (e) OVER-STRICTNESS — the same rule written as an explicit `for` loop instead of a `.map` -> 36 pass, 0 fail, exit 0: correct work in a spelling this item did not anticipate PASSES. **ONE FINDING ABOUT THE ARMS THEMSELVES, recorded rather than smoothed and kept at the arm in the driver:** arm (d)'s first declaration also named *"and the derived fields are DECLARED"* and that assertion did NOT fail — **the ARM was right and the DECLARATION was wrong**, because that source pin asserts the `rowDerived:` DECLARATION exists while the arm removes the WIRING that publishes it. Declaration and wiring are two facts; it is in the held-open half now, and it is the reason this item keeps BOTH a source pin and two op-driven assertions for one field. **AND THE WHOLE CONTROL IS DRIVEN ON A FIXTURE, NEVER ON THE LIVE INSTANCE, WHICH IS STATED BECAUSE IT IS A LIMIT AND NOT A CHOICE:** the live instance holds ZERO basis legs and `test/rec88-instance-census.mjs` measured ZERO captures carrying a transcription chain anywhere in store `bio` on 2026-09-15, so every live answer this item touches is byte-identical BY CONSTRUCTION and would pass every arm above **without exercising one of them**. A control run there would be the costs-nothing equality exactly. REC-108 hit this and stated it; so does this. */
/* REC-114 · D-383 — A LEG LISTING PUBLISHES WHAT THE RECORD CAN SUPPORT, AND
 * THE LETTER THE MEMBER AUTHORED TRAVELS BESIDE IT.
 *
 * THE DEFECT, IN ONE SENTENCE. `MEANING.leg` names `grade`, so
 * `op=meaningrows&rows=leg` handed a member the letter a member AUTHORED,
 * straight off `inquiry_basis.grade`, with no registry ceiling applied — and
 * `leg:grade=` and `leg:axis=capture` are SELECTORS over the same column, so
 * all three routes published it. DEC-4 bounds the capture axis by transcription
 * fidelity; REC-88 corrected the registry; REC-105 corrected the strength walk.
 * This is the FOURTH reader of one rule, found by REC-108's census (block 7 of
 * `rec108-cache-asof.test.mjs`, which is CORRECTED by this landing rather than
 * exempted — it asserted the defect's presence and the defect is now gone).
 *
 * THE RULING TAKEN, AND WHY IT IS A SWEEP RATHER THAN FRESH DOCTRINE. The row
 * offers two defensible answers — publish what was AUTHORED (a member's own act,
 * and erasing it hides the record's own history) or publish what is EARNED (what
 * the record can support; anything stronger is the overclaim this project weighs
 * heaviest). **It is ruled EARNED, with the authored letter published BESIDE it
 * rather than erased**, so neither is lost. The precedent argument was FALSIFIED
 * AT THE ARTIFACT before it was relied on: REC-105's cap is
 * `Store.#capturedAt(stated, earned, targetId)`, a pure per-leg function over a
 * leg's stated letter and its TARGET's registry entry, applied on the capture
 * axis only and only ever lowering. That is the same construct, the same column,
 * the same question and the SAME GRAIN as this listing publishes — so the cap
 * does cover what this surface publishes, and the ruling is REC-105's own,
 * carried to a surface nobody swept.
 *
 * `grade` MOVED RATHER THAN GAINING A SIBLING, and that is the whole fix. An
 * `earned` field beside an uncorrected `grade` would have left every existing
 * consumer publishing the overclaim and called the item done.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE FIXTURE IS REAL AND NON-EMPTY, printed and FLOORED — a headline
 *      totality assertion has passed over an empty corpus here three times.
 *   2. THE DEFECT IS CLOSED AT THE ROW, and the headline NAMES BOTH LETTERS AND
 *      THE SURFACE, because a failure naming one is one a reader cannot act on.
 *   3. ALL THREE READERS DRIVEN — `rows=leg`, `leg:grade=`, `leg:axis=capture`.
 *      All three, because reaching one and missing the others is precisely how
 *      this axis acquired three readers and then a fourth.
 *   4. THE MEMBER'S ACT IS NOT ERASED, and the UNCAPPED control is UNMOVED.
 *   5. THE EQUALITY IS MADE TO COST SOMETHING. A capped letter agreeing with
 *      `op=inquirystrength` proves little when both run `#capturedAt` — so the
 *      pair is first shown DISAGREEING (authored B vs derived C) and only then
 *      agreeing, which is REC-108's arm-3 discipline.
 *   6. THE VOCABULARY IS HONEST — `op=searchfields` names both derived columns,
 *      and the selector says it selects on the AUTHORED column.
 *   7. OVER-STRICTNESS — connection-axis, inquiry-target and ungraded legs are
 *      byte-identical; nothing is invented and nothing is raised.
 *   8. SOURCE PINS — properties of the CODE: ONE arithmetic, not two.
 *   9. THE FIFTH-READER CENSUS, DRIVEN THROUGH THE OPS AND NAMED. It found TWO
 *      and they are NOT closed here — see block 9 and the rows this landing files.
 *
 * Everything runs against `src/index.mjs`'s real worker through miniflare, so a
 * feature no caller can reach fails here rather than passing at store level
 * (D-43: `op=invitelook` shipped with a ReferenceError while 1276 assertions
 * passed).
 */
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

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r114", MEMBER_TOKEN: "mem-r114", PROBE_TOKEN: "prb-r114",
              AI_TOKEN: "ai-r114", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r114") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r114") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ===================== THE FIXTURE =====================
   THE ORDER IS FORCED BY THE RECORD RATHER THAN CHOSEN, and it is REC-108's
   finding reused rather than rediscovered: REC-88's write-side refusal (C-2.8)
   means a leg at capture B on a document ALREADY OCR'd at C cannot be authored
   at all. The only route into this shape is the one D-383 describes — the
   document is CLEAN when the leg is written and is RE-READ afterwards — and the
   record is append-only, so the member's authored letter survives its own
   document being re-read at a weaker fidelity.

   AND EVERY PAIR IS PROMOTED ONCE AND NEVER CORRECTED, which REC-108 had to
   learn the expensive way: its block 3 CORRECTED the mover's leg to move a
   cache, and that correction destroyed the state its block 7 needed, so it had
   to add a third untouched pair. This suite touches no leg after writing it. */
const NOW = "2026-09-17T00:00:00Z", LATER = "2026-09-17T01:00:00Z";
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
/* `supersedes` is a parameter because block 9 has to make a DOCUMENT move.
   `op=reevaluations` raises an obligation only when the leg's TARGET moved, and
   its four causes are supersession, deferred, dismissed and reopened — of which
   an information bundle's own machine (`collected -> verified -> retired`) can
   reach NONE. Supersession is the one route in, and it is open to a document:
   `#writeSupersededBy` derives the reverse edge from any `supersedes` ref and
   does not branch on object_type. Checked at the artifact rather than assumed,
   because if it had been inquiry-only then every leg that op can publish would
   name an INQUIRY target — which the capture axis treats as having no referent
   and never caps — and the fifth reader would have been LATENT rather than
   live. That distinction is the difference between a row worth filing and an
   overclaim, so it was driven. */
const infoMd = (id, { supersedes = null } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland",
  ...(supersedes
    /* `reason` is REQUIRED (C-6.1: "a replacement with no account of why cannot
       be checked by anyone") — driven out by the refusal, not read from a doc. */
    ? ["references:", `  - target: ${supersedes}`, "    rel: supersedes", "    status: confirmed",
       "    reason: The successor restates this document's figures from the adopted budget."]
    : ["references: []"]), "state_history: []",
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
    snapKey: `20260917T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24681"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24681", kind: "ordinance", key: "24681", label: "Ordinance No. 24681" }];
const readingOf = (s, chain) => ({
  capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });
const OCR_CHAIN = [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];

/* THREE PAIRS, AND EACH ONE IS A DIFFERENT ARM OF THE RULE.
     MOVER  — the document is re-read at a weaker fidelity AFTER the leg was
              written, so the authored letter (B) outruns what the record can
              support (C). This is the defect's own shape.
     CLEAN  — publisher-typed text, no chain, nothing to cap. The UNMOVED
              control: if this row moves, the fix is capping things it must not.
     CONN   — a leg on the CONNECTION axis over a document re-read exactly like
              the MOVER's. The capture ceiling must not touch it, because a
              connection leg's earned answer is a VALUE the write already pins
              and not a ceiling a read applies (REC-105's own boundary).

   THE CONNECTION LEG IS AUTHORED AT `A` AND THAT IS NOT A CHOICE — IT IS THE
   RECORD REFUSING, AND IT IS RECORDED HERE BECAUSE IT IS EVIDENCE FOR THE VERY
   BOUNDARY THIS BLOCK TESTS. Authoring it at B was tried first and `op=promote`
   refused with C-2.8: *"basis[0] states an EARNED connection grade of B … but
   the record earns A: an earned grade is computed by the record and a caller
   does not hand it to us in either direction."* That refusal IS the difference
   between the two axes, driven rather than asserted: the connection axis is
   pinned BY VALUE at the write, so it can never need a ceiling at the read,
   which is precisely why REC-105 capped capture alone and why this item does
   too. A fixture that had quietly used A from the start would have hidden the
   reason the arm exists. */
const DOC_MOVE = "INFO-2026-9701-ocr-at-c",   INQ_MOVE = "INQ-2026-9701-mover";
const DOC_CLEAN = "INFO-2026-9702-typed",     INQ_CLEAN = "INQ-2026-9702-clean";
const DOC_CONN = "INFO-2026-9703-connaxis",   INQ_CONN = "INQ-2026-9703-conn";
/* A FOURTH PAIR, FOR BLOCK 9 ONLY, and it is separate for REC-108's measured
   reason: block 9 has to SUPERSEDE its document, and doing that to the mover
   would change the very row blocks 2-8 measure. */
const DOC_SUP = "INFO-2026-9704-superseded",  INQ_SUP = "INQ-2026-9704-reeval";
const DOC_NEWER = "INFO-2026-9705-successor";
const SHA_MOVE = sha("rec114-move"), SHA_CLEAN = sha("rec114-clean"),
      SHA_CONN = sha("rec114-conn"), SHA_SUP = sha("rec114-sup"), SHA_NEW = sha("rec114-new");

for (const [doc, inq, s, reread, axis, grade] of [
  [DOC_MOVE,  INQ_MOVE,  SHA_MOVE,  OCR_CHAIN, "capture",    "B"],
  [DOC_CLEAN, INQ_CLEAN, SHA_CLEAN, null,      "capture",    "B"],
  [DOC_CONN,  INQ_CONN,  SHA_CONN,  OCR_CHAIN, "connection", "A"],
  [DOC_SUP,   INQ_SUP,   SHA_SUP,   OCR_CHAIN, "capture",    "B"]]) {
  const reg = [{ path: "snapshots/r.bin", sha256: s, encoding: "binary", bytes: 10 }];
  await promote(doc, infoMd(doc), "information", { reading: readingOf(s, undefined), register: reg });
  await post("resolve", { captureSha: s });
  await promote(inq, inquiryMd(inq, { subject: ORD, refs: [doc],
    legs: [{ target: doc, grade, axis, source: axis === "capture" ? "capture" : "resolution" }] }), "inquiry");
  if (reread) await promote(doc, infoMd(doc), "information",
    { reading: readingOf(s, reread), register: reg });
}

/* THE SUCCESSOR, promoted LAST so the supersession edge exists only after the
   leg resting on its parent was already written — which is the real order: a
   member rests a claim on a document, and the world replaces that document
   afterwards. */
await promote(DOC_NEWER, infoMd(DOC_NEWER, { supersedes: DOC_SUP }), "information",
  { reading: readingOf(SHA_NEW, undefined),
    register: [{ path: "snapshots/r.bin", sha256: SHA_NEW, encoding: "binary", bytes: 10 }] });

/* ---- small readers over the real ops, so every figure below is DRIVEN ---- */
const capOf = async (id) => {
  const st = await get("inquirystrength", `id=${id}`);
  return st && st.capture ? st.capture.grade : `NO-ANSWER:${JSON.stringify(st).slice(0, 120)}`;
};
/* The listing read back through the door a member actually has. `qs` carries
   the selector under test, so blocks 2 and 3 differ ONLY in how the same row
   was reached — which is what makes "all three readers" a measurement rather
   than three spellings of one call. */
const legRows = async (qs) => {
  const r = await get("meaningrows", qs);
  return { rows: r.rows || [], raw: r, n: (r.rows || []).length };
};
const legOf = async (qs, inq, doc) =>
  (await legRows(qs)).rows.filter((x) => x.bundle_id === inq && x.target_id === doc)[0] || null;

console.log("\n--- 1. THE FIXTURE IS REAL AND NON-EMPTY (a headline over an empty corpus has passed here three times) ---");
{
  const all = await legRows("rows=leg&q=type:inquiry&limit=500");
  const ids = [...new Set(all.rows.map((r) => r.bundle_id))].sort();
  console.log(`  corpus: ${all.n} leg rows over ${ids.length} inquiries · ${JSON.stringify(ids)}`);
  t("all three questions carry a leg row in the corpus this suite is about to measure",
    [ids.includes(INQ_MOVE), ids.includes(INQ_CLEAN), ids.includes(INQ_CONN)],
    [true, true, true]);
  t("and the corpus is FLOORED, so a fixture that silently stopped promoting fails HERE rather than passing everywhere",
    all.n >= 3, true);
}

console.log("\n--- 2. THE DEFECT IS CLOSED AT THE ROW, AND THE HEADLINE NAMES BOTH LETTERS AND THE SURFACE ---");
{
  const leg = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_MOVE, DOC_MOVE);
  const derivedNow = await capOf(INQ_MOVE);
  /* THE HEADLINE. It carries the EARNED letter, the AUTHORED letter, the axis,
     the surface and what the authority derives — five values in one assertion,
     because the row requires that a failure name BOTH letters AND the surface:
     a reader who sees only "expected C got B" cannot tell which of the four
     readers of this axis regressed. */
  t("op=meaningrows&rows=leg PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
    { surface: "op=meaningrows&rows=leg",
      grade_earned_published: leg ? leg.grade : null,
      grade_authored_published: leg ? leg.grade_authored : null,
      axis: leg ? leg.grade_axis : null,
      authority_op_inquirystrength: derivedNow,
      why_names_both_letters: !!(leg && leg.grade_why
        && leg.grade_why.includes("C") && leg.grade_why.includes("B")),
      why_names_the_target: !!(leg && leg.grade_why && leg.grade_why.includes(DOC_MOVE)) },
    { surface: "op=meaningrows&rows=leg",
      grade_earned_published: "C", grade_authored_published: "B", axis: "capture",
      authority_op_inquirystrength: "C",
      why_names_both_letters: true, why_names_the_target: true });
  t("the published letter is never RAISED — the authored letter is the ceiling's floor, not its target",
    ["A", "B", "C", "D"].indexOf(leg ? leg.grade : "A")
      >= ["A", "B", "C", "D"].indexOf(leg ? leg.grade_authored : "A"), true);
}

console.log("\n--- 3. ALL THREE READERS, DRIVEN — reaching one and missing the others is how this axis acquired four ---");
{
  /* The three routes the row names, each reaching the SAME column by a
     different door. They are driven separately and compared to each other,
     because a fix applied at the projection reaches all three ONLY if all three
     return rows through that projection — which is a claim about the compiler,
     not an obvious truth. */
  const plain = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_MOVE, DOC_MOVE);
  const byGrade = await legOf("rows=leg&q=leg:grade=B&limit=500", INQ_MOVE, DOC_MOVE);
  const byAxis = await legOf("rows=leg&q=leg:axis=capture&limit=500", INQ_MOVE, DOC_MOVE);
  console.log(`  reader 1 rows=leg        -> grade=${plain && plain.grade} authored=${plain && plain.grade_authored}`);
  console.log(`  reader 2 leg:grade=B     -> grade=${byGrade && byGrade.grade} authored=${byGrade && byGrade.grade_authored}`);
  console.log(`  reader 3 leg:axis=capture-> grade=${byAxis && byAxis.grade} authored=${byAxis && byAxis.grade_authored}`);

  t("READER 1 — the bare listing publishes the EARNED letter",
    plain ? [plain.grade, plain.grade_authored] : null, ["C", "B"]);
  t("READER 2 — `leg:grade=B` still SELECTS on the authored column (so the row is reachable) and publishes EARNED",
    byGrade ? [byGrade.grade, byGrade.grade_authored] : null, ["C", "B"]);
  t("READER 3 — `leg:axis=capture` publishes EARNED too",
    byAxis ? [byAxis.grade, byAxis.grade_authored] : null, ["C", "B"]);
  t("and ALL THREE agree with each other, which is what makes this ONE projection rather than three fixes",
    JSON.stringify([plain, byGrade, byAxis].map((r) => r && [r.grade, r.grade_authored, r.grade_why])),
    JSON.stringify([plain, plain, plain].map((r) => r && [r.grade, r.grade_authored, r.grade_why])));
  /* The selector's own behaviour, stated rather than smoothed: `leg:grade=C`
     must NOT reach this leg, because the FILTER reads the authored column and
     the authored letter is B. That is a real disagreement between the filter
     and the published column, it cannot be removed (the ceiling is a JS
     derivation with no column to select on), and it is DECLARED here and told
     to the member through `op=searchfields` — see block 6. */
  const wrongWay = await legOf("rows=leg&q=leg:grade=C&limit=500", INQ_MOVE, DOC_MOVE);
  t("THE FILTER STILL SELECTS ON THE AUTHORED COLUMN, and that is declared rather than hidden: `leg:grade=C` does NOT reach a leg authored at B",
    wrongWay, null);
}

console.log("\n--- 4. THE MEMBER'S ACT IS NOT ERASED, AND THE UNCAPPED CONTROL IS UNMOVED ---");
{
  const clean = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_CLEAN, DOC_CLEAN);
  t("publisher-typed text earns its letter, so the authored letter STANDS and `grade` equals `grade_authored`",
    clean ? { grade: clean.grade, authored: clean.grade_authored, why: clean.grade_why } : null,
    { grade: "B", authored: "B", why: null });
  t("`grade_why` is NULL rather than a filler sentence when nothing was capped — a reason with nothing to explain is noise",
    clean ? clean.grade_why : "MISSING", null);
  t("BOTH DERIVED FIELDS ARE PRESENT ON EVERY LEG ROW, never only on the capped ones — a field that appears sometimes makes a surface test for presence",
    clean ? ["grade_authored" in clean, "grade_why" in clean] : null, [true, true]);
  const moved = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_MOVE, DOC_MOVE);
  t("and the member's authored B survives on the CAPPED row too — the act is published, not erased",
    moved ? moved.grade_authored : null, "B");
}

console.log("\n--- 5. THE EQUALITY IS MADE TO COST SOMETHING (two paths through one function cannot disagree) ---");
{
  /* REC-108's arm-3 discipline, and the reason it is here: `op=inquirystrength`
     and this listing BOTH run `Store.#capturedAt`, so asserting that they agree
     proves only that one function was called twice. The equality becomes
     evidence only against a DISAGREEMENT the fixture actually produces — so the
     authored letter and the derived letter are shown to be genuinely different
     values first, and the listing is then shown to have landed on the derived
     one rather than on the stored one. */
  const moved = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_MOVE, DOC_MOVE);
  const clean = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_CLEAN, DOC_CLEAN);
  const movedAuth = await capOf(INQ_MOVE), cleanAuth = await capOf(INQ_CLEAN);
  console.log(`  mover: authored=${moved && moved.grade_authored} derived=${movedAuth} published=${moved && moved.grade}`);
  console.log(`  clean: authored=${clean && clean.grade_authored} derived=${cleanAuth} published=${clean && clean.grade}`);
  t("THE TWO SOURCES GENUINELY DISAGREE on the mover — so landing on one of them is a choice the fixture can see",
    moved ? moved.grade_authored !== movedAuth : null, true);
  t("...and they AGREE on the clean control — so the suite can tell 'capped correctly' from 'capped everything'",
    clean ? clean.grade_authored === cleanAuth : null, true);
  t("the listing landed on the DERIVED letter where they disagree, and on the SHARED letter where they agree",
    [moved && moved.grade === movedAuth, clean && clean.grade === cleanAuth], [true, true]);
}

console.log("\n--- 6. THE VOCABULARY IS HONEST — op=searchfields cannot disagree with the rows ---");
{
  const sf = await get("searchfields", "");
  const cols = sf && sf.meaning && sf.meaning.leg && sf.meaning.leg.rows
    ? sf.meaning.leg.rows.columns : null;
  console.log(`  op=searchfields leg columns: ${JSON.stringify(cols)}`);
  t("op=searchfields NAMES both derived columns, so a surface can build a table over what the rows actually carry",
    cols ? [cols.includes("grade_authored"), cols.includes("grade_why")] : null, [true, true]);
  const leg = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_MOVE, DOC_MOVE);
  t("and the DECLARED columns are TOTAL over what a row carries — a column the rows hold and the vocabulary omits is how `target_present` hid for five weeks",
    leg && cols ? Object.keys(leg).filter((k) => !cols.includes(k) && k !== "bundle_id" && k !== "bundle_type") : null,
    []);
  const gsel = sf && sf.meaning && sf.meaning.leg && sf.meaning.leg.fields
    ? sf.meaning.leg.fields.grade : null;
  t("THE SELECTOR SAYS WHAT IT SELECTS ON, because `leg:grade=` reads a column the row no longer publishes verbatim",
    !!(gsel && typeof gsel.selects === "string" && /AUTHORED/.test(gsel.selects)), true);
  t("`selects` is ABSENT on a field that has nothing unusual to say, rather than an empty string on all of them",
    sf && sf.meaning && sf.meaning.leg && sf.meaning.leg.fields.role
      ? "selects" in sf.meaning.leg.fields.role : null, false);
}

console.log("\n--- 7. OVER-STRICTNESS: correct work in a shape this item did not anticipate must be UNTOUCHED ---");
{
  const conn = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_CONN, DOC_CONN);
  console.log(`  connection-axis leg on a RE-READ document: grade=${conn && conn.grade} authored=${conn && conn.grade_authored} why=${conn && conn.grade_why}`);
  t("A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED — the capture ceiling is not a general grade cap",
    conn ? { grade: conn.grade, authored: conn.grade_authored, why: conn.grade_why, axis: conn.grade_axis } : null,
    { grade: "A", authored: "A", why: null, axis: "connection" });
  /* The arm that would catch a fix which capped by AXIS NAME rather than by
     what the registry actually holds: this document IS bounded at C on the
     capture axis, so a fix ignoring `grade_axis` would move this row to C. */
  t("...and that is not free: the SAME document is bounded at C, so a fix that ignored the axis would have moved this row",
    conn ? conn.grade !== "C" : null, true);
  const other = await legRows("rows=resolves&q=type:inquiry&limit=50");
  t("ANOTHER MEANING ARM IS BYTE-IDENTICAL — the derived fields belong to `leg` alone and do not leak into every arm",
    other.rows.length ? ["grade_authored" in other.rows[0], "grade_why" in other.rows[0]] : [false, false],
    [false, false]);
}

console.log("\n--- 8. SOURCE PINS — ONE ARITHMETIC, NOT TWO ---");
{
  /* The load-bearing structural claim of this landing: the listing does not
     re-decide what a capture letter may be. It calls the SAME function the
     strength walk calls. A second policy here would open at this surface
     exactly the divergence REC-105 closed at the walk. */
  const m = /#legEarnedCapture\(arm, rows\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("the listing's resolver EXISTS and calls `Store.#capturedAt` — REC-105's arithmetic, reused rather than restated",
    { found: m.length > 0, calls_capturedAt: /Store\.#capturedAt\(/.test(m) },
    { found: true, calls_capturedAt: true });
  t("it mints NO grade letter of its own — no A/B/C/D literal anywhere in the resolver",
    /["']\s*[ABCD]\s*["']/.test(m), false);
  t("it asks the registry ONCE for the whole page rather than once per leg (an unbounded per-row probe on a member-facing list)",
    (m.match(/earnedBasisRegistry\(/g) || []).length, 1);
  t("it applies the walk's OWN three conditions — capture axis, a leg carrying a letter, and a target that is not an inquiry",
    { axis: /grade_axis === "capture"/.test(m), carries: /grade != null/.test(m),
      not_inquiry: /normalizeType\(r\.target_type\) !== "inquiry"/.test(m) },
    { axis: true, carries: true, not_inquiry: true });
  t("and the derived fields are DECLARED in the compiler's registry, so `rowColumns` publishes them automatically",
    /rowDerived:\s*\{[\s\S]{0,400}?grade_authored[\s\S]{0,400}?grade_why/.test(QUERY_SRC), true);
  t("the WALK is untouched by this item — `#capturedAt` is READ, never edited, which is what keeps the two readers one rule",
    /static #capturedAt\(stated, earned, targetId\) \{/.test(STORE_SRC), true);
}

console.log("\n--- 9. THE FIFTH-READER CENSUS, DRIVEN THROUGH THE OPS AND NAMED ---");
{
  /* THE ROW REQUIRES A CENSUS AND REQUIRES ITS RESULT STATED EVEN IF IT FINDS
     NONE. IT FOUND TWO, and they are DRIVEN here rather than grepped, because a
     reader named from a grep is a claim and a reader driven through its own op
     is a measurement. NEITHER IS CLOSED BY THIS ITEM — REC-114's scope is the
     meaning listing, both of these are member-facing ops with their own
     envelopes and their own consumers, and one of them (the version path) is
     constrained by the FREEZE: `inquiry_basis_versions.composition` embeds the
     authored letters as text and is byte-compared at ratification, so capping
     there is a design question and not a sweep. They are rowed, in the same way
     REC-108 rowed THIS defect rather than closing it out of scope. */

  /* FIFTH READER — op=reevaluations. It publishes the authored leg letter
     UNCAPPED in the same answer object as a `strength` block that IS capped,
     which makes it the sharpest of the two: one answer, two letters for one
     fact, disagreeing. */
  const rv = await get("reevaluations", "limit=200");
  const obs = (rv && rv.obligations) || [];
  const mine = obs.filter((o) => o.bundle_id === INQ_SUP && o.target === DOC_SUP)[0] || null;
  console.log(`  op=reevaluations: ${obs.length} obligation(s); superseded pair present = ${!!mine}`);
  t("the fifth reader is REACHED — an obligation exists to read, so the assertion below measures rather than vacuously passes",
    !!mine, true);
  console.log(`    legs[0].grade = ${mine && mine.legs && mine.legs[0] && mine.legs[0].grade}`
    + ` · strength.capture = ${mine && mine.strength && mine.strength.capture && mine.strength.capture.grade}`);
  /* CORRECTED 2026-09-17 BY REC-118, NOT EXEMPTED — AND THE OLD ASSERTION WAS
     RIGHT WHEN IT WAS WRITTEN. As landed, this block ASSERTED THE DEFECT'S
     PRESENCE: `leg_grade_authored_uncapped: "B"` and `they_disagree: true`,
     because REC-114's scope was the meaning listing and this fifth reader was
     ROWED rather than closed. D-410 is now closed, so an assertion that the two
     halves DISAGREE is an assertion that the defect is still there — it would
     fail on a correct tree, which is the definition of a superseded test. The
     shape it measures is unchanged and the direction is flipped: the leg letter
     is now the EARNED one and the two halves of the envelope AGREE. REC-114 had
     this done to its own block 7 predecessor in `rec108-cache-asof.test.mjs`
     for exactly the same reason, by exactly this route. */
  t("A FIFTH READER, NAMED AND DRIVEN — and CLOSED by REC-118 (D-410): op=reevaluations publishes the EARNED letter, and the two halves of the one answer now AGREE",
    { leg_grade_earned: mine && mine.legs && mine.legs[0] ? mine.legs[0].grade : null,
      leg_grade_authored: mine && mine.legs && mine.legs[0] ? mine.legs[0].grade_authored : null,
      leg_axis: mine && mine.legs && mine.legs[0] ? mine.legs[0].grade_axis : null,
      strength_capture_capped: mine && mine.strength && mine.strength.capture ? mine.strength.capture.grade : null,
      they_disagree: !!(mine && mine.legs && mine.legs[0] && mine.strength && mine.strength.capture
                        && mine.legs[0].grade !== mine.strength.capture.grade) },
    { leg_grade_earned: "C", leg_grade_authored: "B", leg_axis: "capture",
      strength_capture_capped: "C", they_disagree: false });
  /* THE SAME LEG THROUGH BOTH SURFACES, so the two answers sit side by side in
     one suite. AS LANDED THIS ASSERTED THE DISAGREEMENT — the listing said C
     while op=reevaluations still said B — and that contrast WAS the row this
     landing filed. REC-118 closed it, so the two member-facing surfaces now
     answer alike; this assertion keeps measuring both and only flips which
     answer it demands of the second. */
  const sameLeg = await legOf("rows=leg&q=type:inquiry&limit=500", INQ_SUP, DOC_SUP);
  t("...while op=meaningrows, FIXED by this item, publishes the earned letter for the SAME leg — and since REC-118 the two surfaces AGREE rather than disagree, which is that row discharged",
    sameLeg ? { meaningrows_grade: sameLeg.grade, meaningrows_authored: sameLeg.grade_authored,
                reevaluations_grade: mine && mine.legs && mine.legs[0] ? mine.legs[0].grade : null } : null,
    { meaningrows_grade: "C", meaningrows_authored: "B", reevaluations_grade: "C" });

  /* SIXTH READER — #versionCollections, feeding op=basisversions and
     op=suggest. It is the same SELECT, over the same table, with the same
     columns and the same LIMIT constant as the path `op=versionstrength` uses
     — and that one resolves through `#versionLegsAsMembers` and has since
     REC-88. Two readers of one column in one file, ~650 lines apart, one
     capped and one not.

     CORRECTED 2026-09-17 BY REC-119, WHICH CLOSED D-411 — NOT EXEMPTED, AND
     THE WAY THE OLD ARM WOULD HAVE FAILED IS WORTH MORE THAN THE CORRECTION.

     The arm below used to assert `asks_registry: false` — the defect PINNED
     OPEN as a finding, which was right while it stood. **It would have gone on
     passing after the fix.** It asked whether `#versionCollections`'s OWN
     BODY spells `earnedBasisRegistry`, and REC-119 resolved the legs the way
     REC-114 and REC-118 both did — through a NAMED private resolver beside it.
     So the body does not spell the registry, the regex answers `false`, and
     the arm keeps reporting a defect that is gone, GREEN, for ever.

     That is an assertion passing for the wrong reason, which is worse here than
     a failing one: this suite is the census that FOUND D-411, so a stale arm in
     it would have told the next census the sixth reader was still raw. The arm
     now asks the question that survives the fix — is the letter RESOLVED on the
     way out, by the one arithmetic — rather than asking where one identifier
     happens to be spelled. */
  const VC_BODY = /#versionCollections\(bundleId, row\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  const VLE_BODY = /#versionLegsEarned\(rows\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("THE SIXTH READER IS CLOSED (REC-119/D-411): `#versionCollections` still reads the same columns, and now RESOLVES them through the named resolver, which asks the registry and applies the ONE arithmetic",
    { reads_grade: /#versionCollections\(bundleId, row\) \{[\s\S]{0,900}?grade, grade_axis/.test(STORE_SRC),
      routes_through_resolver: /#versionLegsEarned\(/.test(VC_BODY),
      resolver_exists: VLE_BODY.length > 0,
      resolver_asks_registry: /earnedBasisRegistry\(/.test(VLE_BODY),
      resolver_calls_one_arithmetic: /Store\.#capturedAt\(/.test(VLE_BODY),
      labels_the_frozen_half: /composition_grades/.test(VC_BODY) },
    { reads_grade: true, routes_through_resolver: true, resolver_exists: true,
      resolver_asks_registry: true, resolver_calls_one_arithmetic: true,
      labels_the_frozen_half: true });
  t("...and its CAPPED TWIN reads the SAME table in the SAME shape, which is what makes this a defect rather than a design",
    /#versionLegsAsMembers[\s\S]{0,4000}?earnedBasisRegistry\(/.test(STORE_SRC), true);
  t("both of its consumers are MEMBER-CLASS ops, so this is member-reachable and not a DO-internal read",
    /#versionCollections\(inq, r\)/.test(STORE_SRC) && /#versionCollections\(target, recorded\)/.test(STORE_SRC), true);

  /* NAMED AND ALREADY CORRECT, rather than omitted — saying "no further
     reader" without naming these would be the absence-with-two-causes failure.
     `basisFor` and `restingOn` return the raw letter and are the DO-INTERNAL
     class: no entry in the ops whitelist reaches them. */
  t("`basisFor` is the raw seam and is DO-INTERNAL — named rather than omitted, and its two in-plane callers are the cap itself and the walk",
    /basisFor\(bundleId\)/.test(STORE_SRC), true);
}

await mf.dispose();
console.log(`\nrec114-leg-earned: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
