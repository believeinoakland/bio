/* NEGATIVE CONTROL: RAN 2026-09-25 by the REC-221 worker, driver in its session scratchpad (`rec221-nc.mjs`), FIVE ARMS PLUS A BASELINE, each armed ALONE on src/store.mjs (anchor count asserted), every restore verified by sha256 AND `cmp` against a uniquely-named per-arm pristine copy (3340216 B, f5bb52ae752b…), each arm declaring BY NAME what MUST fail and what MUST NOT. ALL FIVE AS DECLARED. Baseline 28/0. (1) collapseC — THE ROW'S OWN CONTROL: C collapsed into B (both C returns) -> 23/5, failing at C (pdf), C (docx), C (pptx), C (whole document) and content=, every A/B/NOT FOUND/UNDETERMINED arm green. (2) extentAsGrade — the grade read off REC-82's extent test (holds => A) -> 15/13, failing at C (pdf) and NOT FOUND (pdf) among thirteen: the liar's reading this item exists to refuse. (3) notFoundOverPartial — NOT FOUND said over a PARTIAL index -> 27/1, failing at PARTIAL alone. (4) notHeldAsA — a cited extent with no held text graded A -> 27/1, failing at NOT HELD (doc-table) alone. (5) overstrictNoMove, THE OVER-STRICTNESS DIRECTION — identical text found only at the same extent -> 26/2, failing at B (pdf) and B (docx) while every A arm stays green. The units are written with `rect`/`run` OMITTED, a spelling no leg uses, and every A arm passing on the baseline is the over-strictness arm for the address.
 *
 * REC-221 — DOES A NEWER VERSION AFFECT THE REFERENCED PART? (Bob, 2026-09-25
 * 00:40Z, rule 2; CONTENT-EXTENT-DESIGN-SPACE.md §5.8's grades; Framework §18.1.)
 *
 * `op=versionnotice` said whether a newer version EXISTS and whether the cited
 * EXTENT exists in it. Neither says whether the publisher changed the passage:
 * page 3 exists in a revision that rewrote page 3. This suite drives the grade
 * the notice now carries per candidate (`grade`, `affects`) with FIXTURE PAIRS —
 * two captures at one address, each read, each holding text units — one pair (or
 * one leg over a pair) per grade, over every extent arm that carries text units
 * (pdf-page, doc-para, slide-shape, the whole document) and the office arms that
 * carry none (doc-table, an image cited as bytes), which must read UNDETERMINED.
 *
 * HOW A LIAR PASSES THIS, and the arm that catches each:
 *   (a) it reads the EXTENT test as the grade (page 3 exists, so unaffected)
 *       -> the C and NOT FOUND pdf arms: the extent holds, and the grade is AFFECTED.
 *   (b) it collapses C into B (similar is "the same text elsewhere")
 *       -> the C arms, by name (the row's own negative control).
 *   (c) it says NOT FOUND over text it did not hold whole
 *       -> the PARTIAL and UNREAD arms read UNDETERMINED with their reasons.
 *   (d) it says A where the cited text was never held
 *       -> the NOT HELD arms (a page with no unit, a table, an image as bytes).
 *   (e) it writes something -> the stats counters are identical across the reads.
 *
 * WHAT THIS SUITE CANNOT SEE, stated. The similarity floor is driven at one
 * pair either side, not swept. `sheet-range`/`sheet-cell` are not driven: no
 * unit writer produces workbook units (CONTENT-SEARCH-DESIGN.md §4.1), so a
 * sheet citation reaches the same `cited_text_not_held` branch the doc-table arm
 * drives. The grade compares the text held NOW for both captures; a cited
 * capture re-read by another engine since the citation is compared as re-read.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { normalizeAddress } from "../src/subresources.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r221", MEMBER_TOKEN: "mem-r221", PROBE_TOKEN: "prb-r221", VERSION: "test" },
  defaultPersistRoot: mkdtempSync(join(tmpdir(), "rec221-persist-")),
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r221") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-r221") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const legOf = (r, ord) => ((r && r.notices) || []).find((n) => n.ord === ord) || {};
const cand = (n) => (n && n.candidates && n.candidates[0]) || {};

const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";

try {

const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                      capabilities: ["contribute"] }, "adm-r221");
const en = await post("enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
if (!en?.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
const RUTH = (await post("login", { role: "member:ruth", password: "ruth-passphrase-1" }))?.token;
if (!RUTH) throw new Error("login failed");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const FIELDS = { page: "extent_page", para: "extent_para", slide: "extent_slide", table: "extent_table",
                 part: "extent_part", cited_as: "extent_cited_as" };
const inquiryMd = (id, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
    ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
    ...Object.entries(FIELDS).filter(([k]) => l[k] !== undefined).map(([k, f]) => `    ${f}: ${l[k]}`)]),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

/* A READ capture: its reading, its container extent, and its text units as the
   acquire wire hands them. `over` > 0 marks the index PARTIAL (the wire's own
   `text_units_over_bound`), and `units: null` is a capture read with no text. */
const IMG = sha("rec221 an embedded image");
const docOf = (c) => {
  const pdf = c.fmt === "pdf";
  const n = c.units ? c.units.length : 1;
  const reading = {
    content_type: "meeting_packet", reader_version: 1, found: false, entities: [], facts: {}, at: NOW,
    read_from_text: !!c.units, text_container: c.fmt,
    text_source: pdf
      ? [{ step: "pixels", extent: { kind: "pages", pages: [...Array(n).keys()] } },
         { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
           extent: { kind: "pages", pages: [...Array(n).keys()] } }]
      : [{ step: "layer", tier: 1, container: c.fmt }],
    container_extent: c.fmt === "docx"
      ? { levels: ["paragraphs", "tables", "images"], paragraphs: n, tables: [{ rows: 2, cols: 2 }], images: [{ part: IMG }] }
      : c.fmt === "pptx" ? { levels: ["slides"], slides: [...Array(n).keys()].map((i) => ({ index: i + 1 })) } : null,
  };
  /* THE OVER-STRICTNESS SPELLING: units are written with their optional fields
     OMITTED (no `rect`, no `run`), a spelling the leg never uses — canonicalExtent
     must make them one address, or every A below reads UNDETERMINED. */
  const ext = (i) => pdf ? { kind: "pdf-page", page: i } : c.fmt === "docx" ? { kind: "doc-para", para: i }
                                                                            : { kind: "slide-shape", slide: i + 1 };   /* slides are 1-based */
  return { file: `snapshots/${c.sha.slice(0, 8)}.${c.fmt}`, locator: c.addr, retrieved: c.at,
           capture: { sha256: c.sha, encoding: "binary", bytes: 4096 }, reading,
           ...(c.units ? { text_units: c.units.map((text, i) => ({ extent: ext(i), seq: i, text })) } : {}),
           ...(c.over ? { text_units_over_bound: c.over } : {}) };
};
let snap = 0;
const HEAD = new Map();
const promote = async (id, text, type, docs = [], tok = "mem-r221") => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (docs.length) {
    const prov = JSON.stringify({ documents: docs.map(docOf) });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260925T${String(100000 + (++snap)).slice(-6)}Z_${sha(String(snap)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files,
    register: docs.map((c) => ({ sha256: c.sha, path: `documents/${c.sha.slice(0, 8)}.${c.fmt}`,
                                 encoding: "binary", bytes: 4096 })) }, tok);
  if (r?.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const locate = async (address, captureSha, retrieved) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = rP(await (await ns.get(ns.idFromName("bio")).fetch("http://x/recordcapturedlocator",
    { method: "POST", body: JSON.stringify({ address, addressNorm: address, captureSha, retrieved }) })).json());
  if (r?.ok === false) throw new Error(`recordcapturedlocator ${address}: ${JSON.stringify(r)}`);
};

/* ------------------------------------------------------------------ ground truth */
const T = "Council approved the transfer of two point one million dollars from the general fund to the reserve";
const T_EDIT = "Council approved the transfer of three point four million dollars from the general fund to the reserve";
const OTHER = (k) => `Unrelated matter ${k}: the parks commission heard public comment on the library hours`;
const P = [OTHER("p0"), T, OTHER("p2")];
/* Each pair: an OLDER capture cited, a NEWER capture at the same address. */
const PAIRS = {
  pA: { fmt: "pdf", old: P, neu: [OTHER("p0 revised"), T, OTHER("p2")] },           // page 1 byte-identical
  pB: { fmt: "pdf", old: P, neu: [OTHER("p0"), OTHER("inserted"), T] },              // T moved to page 2
  pC: { fmt: "pdf", old: P, neu: [OTHER("p0"), T_EDIT, OTHER("p2")] },               // page 1 edited
  pN: { fmt: "pdf", old: P, neu: [OTHER("p0"), OTHER("replaced"), OTHER("p2")] },    // T gone, text held whole
  pP: { fmt: "pdf", old: P, neu: [OTHER("p0"), OTHER("replaced")], over: 3 },        // T gone, index PARTIAL
  pR: { fmt: "pdf", old: P, neu: null },                                             // newer read, no text
  pH: { fmt: "pdf", old: [OTHER("p0")], neu: [OTHER("p0"), T] },                     // cited page never held text
  pW: { fmt: "pdf", old: P, neu: [...P] },                                           // every unit identical
  dX: { fmt: "docx", old: ["Item 1. Call to order.", T, "Item 3. Adjournment at nine.", "Item 4. A closed session."],
        neu: ["Item 1. Call to order.", "Item 3. Adjournment at nine.", T_EDIT, "Item 5. Public comment."] },
  sX: { fmt: "pptx", old: ["Slide one: the budget gap", T], neu: ["Slide one: the budget gap", T_EDIT] },
};
const CAP = {};
let day = 1;
for (const [k, p] of Object.entries(PAIRS)) {
  const addr = normalizeAddress(`https://www.oaklandca.gov/rec221/${k}.${p.fmt}`);
  CAP[k] = {
    old: { sha: sha(`rec221 ${k} old`), fmt: p.fmt, addr, at: `2026-01-${String(day).padStart(2, "0")}T09:00:00Z`,
           units: p.old, doc: `INFO-2026-2210-${k.toLowerCase()}1` },
    neu: { sha: sha(`rec221 ${k} new`), fmt: p.fmt, addr, at: `2026-03-${String(day).padStart(2, "0")}T09:00:00Z`,
           units: p.neu, over: p.over, doc: `INFO-2026-2210-${k.toLowerCase()}2` },
  };
  day++;
}
for (const c of Object.values(CAP).flatMap((x) => [x.old, x.neu])) {
  await promote(c.doc, infoMd(c.doc), "information", [c]);
  await locate(c.addr, c.sha, c.at);
}
const L = [
  { target: CAP.pA.old.doc, kind: "pdf-page", page: 1 },      // 0  A
  { target: CAP.pB.old.doc, kind: "pdf-page", page: 1 },      // 1  B (page 2)
  { target: CAP.pC.old.doc, kind: "pdf-page", page: 1 },      // 2  C, the extent still HOLDS
  { target: CAP.pN.old.doc, kind: "pdf-page", page: 1 },      // 3  NOT FOUND, the extent still HOLDS
  { target: CAP.pP.old.doc, kind: "pdf-page", page: 1 },      // 4  UNDETERMINED newer_text_partial
  { target: CAP.pR.old.doc, kind: "pdf-page", page: 1 },      // 5  UNDETERMINED newer_text_not_held
  { target: CAP.pH.old.doc, kind: "pdf-page", page: 0 },      // 6  A (page 0 held on both)
  { target: CAP.pW.old.doc },                                 // 7  whole document, A
  { target: CAP.pC.old.doc },                                 // 8  whole document, C
  { target: CAP.dX.old.doc, kind: "doc-para", para: 0 },      // 9  docx A
  { target: CAP.dX.old.doc, kind: "doc-para", para: 2 },      // 10 docx B (para 1)
  { target: CAP.dX.old.doc, kind: "doc-para", para: 1 },      // 11 docx C (para 2)
  { target: CAP.dX.old.doc, kind: "doc-para", para: 3 },      // 12 docx NOT FOUND
  { target: CAP.dX.old.doc, kind: "doc-table", table: 0 },    // 13 docx table: UNDETERMINED, no unit text
  { target: CAP.dX.old.doc, kind: "image", part: IMG, cited_as: "bytes" },  // 14 UNDETERMINED cited_as_bytes
  { target: CAP.sX.old.doc, kind: "slide-shape", slide: 1 },  // 15 pptx A
  { target: CAP.sX.old.doc, kind: "slide-shape", slide: 2 },  // 16 pptx C
  { target: CAP.pR.old.doc },                                 // 17 whole document, newer unread
];
const INQ = "INQ-2026-2210-main";
const pInq = await promote(INQ, inquiryMd(INQ, L), "inquiry", [], RUTH);
t("the ground: every leg resolves to a content row (a leg that did not would grade nothing and pass for free)",
  L.map((_, o) => !!(pInq.content || []).find((c) => c.ord === o)?.content_id), L.map(() => true));
console.log(`  corpus: ${Object.keys(PAIRS).length} pairs (${Object.keys(CAP).length * 2} captures), `
          + `${L.length} legs, ${Object.values(PAIRS).reduce((n, p) => n + p.old.length + (p.neu || []).length, 0)} text units`);

const statsA = await get("stats");
const all = await get("versionnotice", `target=${INQ}`);
const again = await get("versionnotice", `target=${INQ}`);
const statsB = await get("stats");
const leg = (o) => legOf(all, o);
const G = (o) => [leg(o).state, cand(leg(o)).grade, cand(leg(o)).affects, cand(leg(o)).grade_reason, leg(o).affects];
t("every leg saw its newer version (a grade over no newer capture measures nothing)",
  L.map((_, o) => leg(o).newer), L.map(() => true));

console.log("\n--- 1. A and B: UNAFFECTED, only on positive evidence ---");
t("A (pdf): page 1 byte-identical in the newer version -> A, unaffected",
  G(0), ["newer_capture_matched", "A", "unaffected", "identical_at_extent", "unaffected"]);
t("A names where: the same extent", cand(leg(0)).found_at?.extent, { kind: "pdf-page", page: 1, rect: null });
t("B (pdf): the passage moved to page 2 -> B, unaffected, and found_at names page 2",
  [...G(1), cand(leg(1)).found_at?.extent?.page], ["newer_capture_matched", "B", "unaffected", "identical_elsewhere", "unaffected", 2]);
t("A holds on another page of another pair (page 0 held on both sides)", G(6).slice(1, 3), ["A", "unaffected"]);
t("A (docx ¶0)", G(9).slice(1, 3), ["A", "unaffected"]);
t("B (docx): ¶2's text is now ¶1 -> B", [...G(10).slice(1, 3), cand(leg(10)).found_at?.extent?.para], ["B", "unaffected", 1]);
t("A (pptx slide 1)", G(15).slice(1, 3), ["A", "unaffected"]);
t("A (whole document): every unit identical, though the capture's bytes differ", G(7).slice(1, 4),
  ["A", "unaffected", "identical_at_extent"]);

console.log("\n--- 2. C and NOT FOUND: AFFECTED, where the extent test still holds ---");
t("C (pdf): page 1 edited -> C, AFFECTED — while the EXTENT test says matched (the liar's reading)",
  [...G(2), cand(leg(2)).matched], ["newer_capture_matched", "C", "affected", "similar_text", "affected", true]);
t("C carries its similarity, under 1 and at or over the published floor",
  [cand(leg(2)).similarity < 1, cand(leg(2)).similarity >= 0.7], [true, true]);
t("NOT FOUND (pdf): the passage is gone and the newer text is held WHOLE -> NOT_FOUND, AFFECTED, extent still matched",
  [...G(3), cand(leg(3)).matched], ["newer_capture_matched", "NOT_FOUND", "affected", "text_not_found", "affected", true]);
t("C (docx): ¶1's edited text is at ¶2 -> C, and found_at names ¶2",
  [...G(11).slice(1, 3), cand(leg(11)).found_at?.extent?.para], ["C", "affected", 2]);
t("NOT FOUND (docx): ¶3 was removed", G(12).slice(1, 4), ["NOT_FOUND", "affected", "text_not_found"]);
t("C (pptx): slide 2 edited", G(16).slice(1, 3), ["C", "affected"]);
t("C (whole document): the document's text changed a little", G(8).slice(1, 4), ["C", "affected", "similar_text"]);

console.log("\n--- 3. UNDETERMINED, stated with its reason — never A, never NOT FOUND ---");
t("PARTIAL: the passage is not in the part of the newer text held -> UNDETERMINED newer_text_partial, never NOT FOUND",
  G(4).slice(1), ["UNDETERMINED", "undetermined", "newer_text_partial", "undetermined"]);
t("UNREAD: the newer capture holds no text -> UNDETERMINED newer_text_not_held",
  G(5).slice(1), ["UNDETERMINED", "undetermined", "newer_text_not_held", "undetermined"]);
t("UNREAD, whole document -> UNDETERMINED", G(17).slice(1, 4), ["UNDETERMINED", "undetermined", "newer_text_not_held"]);
t("NOT HELD (doc-table): no unit carries a table's text -> UNDETERMINED cited_text_not_held",
  G(13).slice(1, 4), ["UNDETERMINED", "undetermined", "cited_text_not_held"]);
t("NOT HELD (image as bytes) -> UNDETERMINED cited_as_bytes", G(14).slice(1, 4), ["UNDETERMINED", "undetermined", "cited_as_bytes"]);
t("every UNDETERMINED says why, in a sentence",
  [4, 5, 13, 14, 17].map((o) => typeof cand(leg(o)).grade_why === "string" && cand(leg(o)).grade_why.length > 40),
  [true, true, true, true, true]);

console.log("\n--- 4. on the wire, and nothing written ---");
t("the answer publishes the five grades, each with what it means for the part",
  Object.fromEntries(Object.entries(all?.grades || {}).map(([k, v]) => [k, v.affects])),
  { A: "unaffected", B: "unaffected", C: "affected", NOT_FOUND: "affected", UNDETERMINED: "undetermined" });
t("the grade is ADDITIVE: every pre-REC-221 field is still on each notice and candidate",
  ["state", "newer", "chain_read", "chains", "candidates", "says"].every((k) => k in leg(2))
  && ["matched", "reason", "why", "candidate_only", "identity", "says"].every((k) => k in cand(leg(2))), true);
t("the answer is the same on a second read (computed from the record, not from the first read)",
  JSON.stringify(again) === JSON.stringify(all), true);
t("NOTHING WRITTEN: every counter op=stats reports is identical across the reads",
  JSON.stringify(statsB) === JSON.stringify(statsA), true);
const one = await get("versionnotice", `content=${(pInq.content || []).find((c) => c.ord === 2)?.content_id}`);
t("content= carries the same grade as the question's leg", [one?.notices?.[0]?.affects, cand(one?.notices?.[0]).grade],
  ["affected", "C"]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}

console.log(`\nversiongrade: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
