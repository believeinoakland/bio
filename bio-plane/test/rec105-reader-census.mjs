/* REC-105 · THE READER CENSUS — HOW MANY SURFACES ANSWER A CAPTURE-AXIS GRADE,
 * ESTABLISHED BY DRIVING THEM RATHER THAN BY READING THE CODE.
 *
 * "A FACT WITH TWO DISAGREEING READERS USUALLY HAS A THIRD NOBODY HAS PROBED"
 * (QUEUE REC-105). D-373 was raised from a probe that compared ONE PAIR —
 * `op=earnedbasis` against `op=inquirystrength` — so the pair is what the record
 * knows about. This probe asks the question the pair could not: over ONE store,
 * ONE document and ONE leg, WHICH SURFACES ANSWER A CAPTURE-AXIS GRADE AT ALL,
 * and what does each of them say.
 *
 * IT IS A CENSUS AND A BASELINE PROBE IN ONE, DELIBERATELY. Every answer is
 * printed WITH ITS SHA-256, so running this file against a pristine
 * `origin/main` checkout and against the landing gives a CROSS-CHECKOUT identity
 * for the surfaces that must not move and a CROSS-CHECKOUT difference for the
 * ones that must. An identity measured against a copy of itself on one tree
 * costs nothing to produce and is not evidence; two checkouts is.
 *
 * FIVE DOCUMENT SHAPES, and they are the five the bound can meet:
 *
 *   OCR-C     captured, leg written, LATER OCR'd at a measured fidelity
 *   UNMEAS    captured, leg written, LATER re-read with NO measured fidelity
 *   CLEAN     captured and read with NO chain — publisher-typed; nothing moves
 *   NOGRADE   captured and later OCR'd, but the leg CLAIMS NO LETTER
 *   NOCAP     no registered capture at all — the registry states NO ceiling
 *
 * The last three are the over-strictness arms and they are the point of the
 * exercise: correct work in a shape this item did not set out to change must
 * answer BYTE-IDENTICALLY. NOCAP is the one the row did not name — a document
 * the record holds no bytes of has no ceiling, so there is nothing for a bound
 * to bound and the walk must keep reporting what the member authored.
 *
 * WHAT THIS PROBE CANNOT SEE, STATED: it drives the ops a member can reach on
 * one store through miniflare. It cannot see a consumer outside this plane
 * (`civicos-ui/`, the skillpack), it cannot see a surface that answers a capture
 * grade only for a PUBLISHED case's frozen bytes (DEC-12 freezes those by
 * design and this item must not move them), and it says nothing about the live
 * instance — `test/rec88-instance-census.mjs` is the read-only probe for that
 * and this item ran it separately.
 *
 * Run: `node test/rec105-reader-census.mjs [path/to/index.mjs]` from `bio-plane/`.
 * NOT a suite — it prints, it asserts nothing, and it exits 0 either way. */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = process.argv[2] || fileURLToPath(new URL("../src/index.mjs", import.meta.url));
console.log(`REC-105 reader census — source: ${IDX}`);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r105", MEMBER_TOKEN: "mem-r105", PROBE_TOKEN: "prb-r105",
              AI_TOKEN: "ai-r105", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const dig = (v) => sha(JSON.stringify(v ?? null)).slice(0, 16);
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r105") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r105") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-15T00:00:00Z", LATER = "2026-09-15T01:00:00Z";
const refLines = (t) => t.length
  ? ["references:", ...t.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: supports`,
      ...(l.grade ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : [])])]
  : [];
const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
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
    snapKey: `20260915T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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
const UNMEAS_CHAIN = [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", confidence: { basis: "none" } }];

/* THE FIVE SHAPES, AND THE ORDER OF ACTS IS FORCED BY THE RECORD RATHER THAN
   CHOSEN — WHICH IS ITSELF THIS PROBE'S FIRST FINDING.
   *
   * The obvious fixture — promote an OCR'd-at-C document and write a leg on it
   * at capture grade B — IS REFUSED AT THE WRITE, by name, with C-2.8 naming
   * the measured fidelity. REC-88 built that refusal and it works. So a leg in
   * D-373's shape CANNOT BE AUTHORED TODAY, and the only route into it is the
   * one D-373 itself describes: the document is CLEAN when the leg is written
   * and is RE-READ afterwards. The record is append-only and nothing rewrites a
   * member's authored letter, so the leg survives its own document being
   * re-read at a weaker fidelity. Every mover below is built that way.
   *
   * THE SAME REFUSAL BOUNDS THE OVER-STRICTNESS ARMS. A leg claiming a letter
   * on a document the record holds NO bytes of is refused too — "the record
   * holds no registered capture for that document" — so the absent-entry shape
   * is unreachable for a GRADED leg at the write, and the honest arm for it is
   * an UNGRADED leg, which is legal, inert by DEC-18 and must stay inert. */
const SHAPES = [
  { key: "OCR-C",  doc: "INFO-2026-9101-ocr-at-c",       reread: OCR_CHAIN,    register: true, grade: "B",
    note: "MOVER — leg at B written while clean, document later OCR'd at C" },
  { key: "UNMEAS", doc: "INFO-2026-9102-unmeasured",     reread: UNMEAS_CHAIN, register: true, grade: "B",
    note: "MOVER — leg at B written while clean, later re-read with NO measured fidelity" },
  { key: "CLEAN",  doc: "INFO-2026-9103-publishertyped", reread: null,         register: true, grade: "B",
    note: "OVER-STRICTNESS — read, no chain; publisher-typed text earns the ceiling and must NOT move" },
  { key: "NOGRADE", doc: "INFO-2026-9104-ungraded",      reread: OCR_CHAIN,    register: true, grade: null,
    note: "OVER-STRICTNESS — captured, later OCR'd, but the leg CLAIMS NO LETTER; inert before and after" },
  { key: "NOCAP",  doc: "INFO-2026-9105-no-capture",     reread: null,         register: false, grade: null,
    note: "OVER-STRICTNESS — the record holds no bytes at all; the registry has NO entry" },
];

for (const s of SHAPES) {
  s.sha = sha(`rec105-${s.key}`);
  const reg = s.register
    ? [{ path: "snapshots/r.bin", sha256: s.sha, encoding: "binary", bytes: 10 }] : [];
  /* Step 1 — the document as it stood WHEN THE LEG WAS WRITTEN. For every
     shape that has bytes at all that is a capture read with NO transcription
     chain, which is what earns the ceiling. NOCAP is promoted with no register
     and no reading: the record holds the DOCUMENT and none of its bytes, which
     is the shape a member reaches by recording a document they have only seen. */
  await promote(s.doc, infoMd(s.doc), "information",
    s.register ? { reading: readingOf(s.sha, undefined), register: reg } : {});
  if (s.register) await post("resolve", { captureSha: s.sha });
  s.inq = `INQ-2026-910${SHAPES.indexOf(s) + 1}-${s.key.toLowerCase()}`;
  /* Step 2 — the member's leg, authored against the document as it then stood. */
  await promote(s.inq, inquiryMd(s.inq, { subject: ORD, refs: [s.doc],
    legs: [{ target: s.doc, ...(s.grade ? { grade: s.grade, axis: "capture", source: "capture" } : {}) }] }),
    "inquiry");
  /* Step 3 — and only now is the document RE-READ, which is the act that opens
     the gap between what the leg says and what the record can support. */
  if (s.reread)
    await promote(s.doc, infoMd(s.doc), "information",
      { reading: readingOf(s.sha, s.reread), register: reg });
}

/* ===================== THE CENSUS ITSELF =====================
   Every surface this plane serves that could answer a capture-axis grade for
   ONE leg, asked about the SAME leg, printed side by side. A surface that
   answers the same fact differently from another is a drift whether or not
   anybody has named it. */
const capOf = (st) => st && st.capture
  ? { state: st.capture.state, grade: st.capture.grade,
      weakest: st.capture.weakest ? st.capture.weakest.grade : null,
      nlb: (st.capture.not_load_bearing || []).length, detail: st.capture.detail }
  : st;

console.log(`\n${"=".repeat(78)}\nREADERS OF A CAPTURE-AXIS GRADE, one row per surface per shape\n${"=".repeat(78)}`);
for (const s of SHAPES) {
  const earned = await get("earnedbasis", `id=${s.inq}`);
  const eCap = earned && earned.earned ? (earned.earned.capture || {})[s.doc] ?? null : null;
  const strength = await get("inquirystrength", `id=${s.inq}`);
  /* D-373'S CLASS NAMES `op=strengthbarof`'S PAIR AS A SECOND CONSUMER OF
     `strengthOf()`. IT IS NOT ONE, AND THIS ROW IS HERE TO SHOW THAT RATHER
     THAN TO ASSERT IT: `strengthBarOf` answers the DECLARED BAR for a group or
     a project (REC-14/DEC-17) and computes no pair at all. Driven, printed, and
     the row is kept in the census precisely because a class statement with a
     wrong member is how a later sweep misses a real one. */
  const bar = await get("strengthbarof", `id=${s.inq}`);
  /* THE AUTHORED LETTER — AND THE CENSUS'S OWN LIMIT, STATED. There is no
     control-plane read for either: `/basis` and `/restson` are the DO-internal
     class and are not in `index.mjs`'s OPS whitelist. What
     `op=earnedbasis` publishes under `legs` is the leg's ADDRESS and its content
     row, not its authored grade — so this probe cannot read the authored letter
     back through any member-reachable op, and it says so rather than printing a
     null as though it were a measurement. The authored letter is known here
     BY CONSTRUCTION (it is what the fixture wrote) and that is what is shown.
     THE TWO DO-INTERNAL READS ARE NAMED WITHOUT AN `op=` PREFIX ON PURPOSE:
     `op-claims.test.mjs` refuses prose that spells a DO path as an op, because
     writing one that way tells the next reader a door exists where none does.
     It caught this file's first draft. */
  const aLeg = earned && Array.isArray(earned.legs)
    ? earned.legs.find((l) => l && l.target_id === s.doc) ?? null : null;
  const authored = s.grade;
  /* THE THIRD READER, asked as a member would ask it: the projection CACHE, via
     the query language's own `capture:` selector. It is an indexed SEEK over
     `bundles.inquiry_capture_strength`, written by `#writeStrengthProjection`
     from `strengthOf()` at promote time — so it is not a second COMPUTATION of
     the grade, it is the FIRST one persisted, and it answers at a different
     TIME. That is exactly why it belongs in a census: a reader who filters on
     it gets the walk's answer as of the last promotion, not the walk's answer. */
  const seekB = await get("search", `q=${encodeURIComponent(`capture:B id:${s.inq}`)}&viewer=mem-r105`);
  const seekC = await get("search", `q=${encodeURIComponent(`capture:C id:${s.inq}`)}&viewer=mem-r105`);
  const hit = (r) => r && Array.isArray(r.rows) ? r.rows.length : (r && r.total != null ? r.total : `?${JSON.stringify(r).slice(0, 80)}`);

  console.log(`\n--- ${s.key}  (${s.note})`);
  console.log(`    doc=${s.doc}  inq=${s.inq}`);
  console.log(`  R0 (the fixture)       AUTHORED letter ......... ${JSON.stringify(authored)}`
    + `   — NOT reachable through any control-plane op; op=earnedbasis's leg carries`
    + ` ${aLeg ? Object.keys(aLeg).join(",") : "(no leg row)"}`);
  console.log(`  R1 op=earnedbasis      registry capture entry .. grade=${JSON.stringify(eCap && eCap.grade)}`
    + ` bounded_by=${JSON.stringify(eCap && eCap.bounded_by)} undet=${JSON.stringify(eCap && eCap.undetermined_because)}`
    + `   digest ${dig(eCap)}`);
  console.log(`  R2 op=inquirystrength  the DERIVED pair ........ ${JSON.stringify(capOf(strength))}`);
  console.log(`     R2 digest ${dig(strength && strength.capture)}`);
  console.log(`  R3 op=search capture:  the projection CACHE .... capture:B hits=${hit(seekB)} · capture:C hits=${hit(seekC)}`);
  console.log(`  R4 op=strengthbarof    D-373 names it — it is NOT a pair reader:`
    + ` carries ${bar && typeof bar === "object" ? Object.keys(bar).join(",") : String(bar)}`);
  /* THE VERDICT IS ONLY ASKED WHERE IT MEANS SOMETHING, and the exception is
     worth stating rather than scoring as a failure. The registry's capture
     entry is a CEILING ON THE DOCUMENT; the walk's letter is what THE LEG is
     worth. Where the leg states no letter at all there is nothing to compare:
     the leg is inert by DEC-18, the document still has a ceiling, and calling
     that a disagreement would be this probe not understanding its own subject.
     A matcher that cannot tell the two apart is the "invert, do not lengthen a
     list" failure in miniature, so it is named here instead. */
  const walkGrade = strength && strength.capture ? strength.capture.grade : null;
  const regGrade = eCap ? (eCap.grade ?? null) : null;
  console.log(authored == null
    ? `  >>> NOT COMPARABLE: the leg states no letter, so it is inert (DEC-18) and there is no`
      + ` derived letter to hold against the document's ceiling (${JSON.stringify(regGrade)}).`
      + ` Walk answers ${JSON.stringify(walkGrade)}.`
    : `  >>> R1 vs R2 AGREE ON THE LETTER: ${regGrade === walkGrade ? "YES" : "NO"}`
      + `  (registry ${JSON.stringify(regGrade)} · walk ${JSON.stringify(walkGrade)})`);
  /* THE THIRD READER'S OWN VERDICT, printed rather than left to be inferred:
     does the indexed CACHE still answer the letter the walk has stopped
     answering? A YES here is not a defect — it is a cache with a documented
     staleness contract doing exactly what `#writeStrengthProjection`'s comment
     says it does — but it is a THIRD surface answering this fact, and it is
     printed because nobody had probed it before this item. */
  if (authored != null)
    console.log(`  >>> THIRD READER: the cache seeks ${hit(seekB) ? "capture:B" : hit(seekC) ? "capture:C" : "neither"}`
      + ` while the walk now answers ${JSON.stringify(walkGrade)} —`
      + ` ${(hit(seekB) && walkGrade !== "B") || (hit(seekC) && walkGrade !== "C") ? "STALE (by design: it is refreshed at the inquiry's next promote)" : "in step"}`);
}

console.log(`\n${"=".repeat(78)}\nWHAT THE CENSUS FOUND — read the R-rows above, not this sentence.\n`
  + `A surface printed here is a surface that ANSWERS a capture-axis grade to a member.\n`
  + `R0 is the AUTHORED statement and is not a derived grade: the record keeps what a\n`
  + `member wrote, append-only, and publishing it back is not a second opinion.\n${"=".repeat(78)}`);
await mf.dispose();
process.exit(0);
