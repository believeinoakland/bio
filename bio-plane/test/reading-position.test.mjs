/* NEGATIVE CONTROL: the six arms live in `test/nc-fw17.mjs` and are re-run in one step with `node test/nc-fw17.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN. TWO OF THEM DECLARE A MUST-STAY AND NOT ONLY A MUST-FAIL, because this item's subject is a NULLABLE and its two halves are separable: an arm that only looked for new failures would score a broken honest-absence path as a success, so the harness checks that each must-stay assertion is PRESENT AND PASSING rather than merely absent from the failing list. (a) `baseline` - nothing armed; MUST be green, and it is the row that distinguishes six-arms-working from six-arms-broken. (b) `nopair` - in store.mjs `deriveConnections`, null BOTH `a_ref` and `b_ref` at the row build so no connection records its determining pair; the portion-grade and pair assertions MUST FAIL while the whole-document answer and the honest-absence answers MUST STAY GREEN - the closing is per pair and never assumed, and this arm proves the UNDETERMINED path is REACHED rather than skipped. (c) `forge` - neuter `readingPositionInExtent` to `return true` so any pair covers any extent; the page-9 citation MUST stop being refused (C-49.1 gone) and every containment assertion MUST FAIL, while the page-2 citation MUST STAY GREEN - a covering test that is true for every input is true for no reason. (d) `nullhonest` - in store.mjs `#writeReadings`, drop the position columns from the `reading_refs` INSERT; the PROJECTION read and everything derived from it MUST FAIL while the reading BLOB, the row itself and the whole-document answer MUST STAY GREEN - the blob and the projection are two stores of one fact and this arm separates them. (e) `overstrict` - the OVER-STRICTNESS direction, and it takes TWO patches because the doctrine is enforced twice: remove BOTH `connectionGradeForContent`'s `document` short-circuit AND `readingPositionInExtent`'s own document arm, so a whole-document citation is made to pass a position test; the document-grain assertions MUST FAIL while every portion assertion stays green - a fence tighter than its rule is not a safer fence, and Bob's 5.3 is that a citation naming no part means the whole document. (f) `armsarm` - THE ARM'S OWN ARM: disable only the POSITION half of the pair writer (the `reading_refs` lookup per end) while leaving the containment checker intact; the portion-leg grade assertion MUST FAIL BY NAME, which is what proves that assertion measures the WRITER and not the checker. */
/* RESULTS, run 2026-09-14 by the FW-17 worker, each arm alone, ALL SIX AS DECLARED on the second pass and every restore byte-identical: baseline 63/0 - nopair 57/6 (2/2 declared, 2/2 must-stay) - forge 56/7 (6/6, 1/1) - nullhonest 56/7 (3/3, 4/4) - overstrict 61/2 (2/2, 3/3) - armsarm 57/6 (3/3, 2/2). THREE FINDINGS FROM THE FIRST PASS, recorded rather than smoothed and all three about the ARMS or the SUITE rather than the subject: (1) `nopair` nulled only `a_ref` and the grade assertion STILL PASSED, because a pair reads as present when EITHER end carries a reference and the canonical pair order is decided by a capture hash - the arm was measuring a coin flip; both ends are nulled now. (2) `overstrict` ARMED 1x and changed NOTHING (60 pass, 0 fail), because the document arm is enforced independently in the checker AND at the call site - a real and good property of the subject, and an arm that cannot bite reads exactly like a subject that cannot break; both are armed now. (3) THE SUITE ITSELF was not null-robust and three arms ended in a TypeError with the tally reading -1 - a TypeError inside an assertion goes through no assertion at all, so the suite never reached its own FOOT and the harness reported -1 rather than 0; every accessor into a possibly-absent pair is guarded now, and the missing-tally-is-minus-one rule is what caught it. */

/* FW-17 / IC-86 / D-161 — READINGS CARRY POSITION, AND A CONNECTION CARRIES THE
 * DETERMINING REFERENCE PAIR.
 *
 * Two halves that are one item, because the second is unbuildable without the
 * first: the design study states it as the hard dependency (§1.9) and Part II
 * §18 closes on it — "content-grain connections are impossible until readings
 * record WHERE a reference was read."
 *
 * WHAT IS BEING ASSERTED, and the driven ones THROUGH `op=promote`, `op=resolve`,
 * `op=connect` and `op=connections` rather than against the store, because a
 * store-level test and a passing battery are not evidence that a caller can
 * reach the feature:
 *
 *   1. THE SEAM KEEPS WHAT IT USED TO DESTROY. `flattenText` maps each container
 *      part's span in the flat string, and the map is EARNED where a producer
 *      emits `document` beside `pages[]` — laid over only on a byte-for-byte
 *      match, so a producer composing `document` any other way gets NO map and
 *      the absence is stated. That comparison is not a free equality: the arm
 *      below feeds a mismatching pair and gets nothing.
 *   2. `ctx.locate` IS TOTAL. Out of range, negative, non-numeric, empty map —
 *      every one answers null, because a reader must never handle an exception
 *      to find out it cannot say where.
 *   3. THE READER THAT CAN, DOES. The agenda reader places every file number it
 *      reads, on the page the container put it on, with `rect: null` — the page
 *      is in the bytes and the rectangle is not.
 *   4. THE READERS THAT CANNOT SAY SO. Asserted as a property of the SOURCE
 *      FILE, not of a run: the calendar and generic readers must carry the
 *      declaration in their own headers, which is IC-86's stated obligation and
 *      the only thing that distinguishes an honest null from an unexamined one.
 *   5. A READING WITHOUT POSITION STILL WRITES, and the absence is STATED on the
 *      reading's own basis. The nullable is honest, not a gap.
 *   6. `reading_refs` CARRIES THE POSITION, all three columns together or none.
 *   7. THE CONNECTION CARRIES THE DETERMINING PAIR (Bob's 5.4): the reference on
 *      each end that determined the grade, taken at the SAME collapse that chose
 *      the grade so the two cannot disagree — and the positions where the
 *      readings could say.
 *   8. A PORTION LEG ANSWERS A CONNECTION GRADE (Bob's 5.1) when the determining
 *      reference was read inside its portion — framework §8.1's grade, off the
 *      row, never minted here.
 *   9. AND UNDETERMINED WHERE IT CANNOT, in three kinds that are three different
 *      findings: no pair on the row, a pair that cannot be placed, a pair placed
 *      elsewhere in the same document.
 *  10. OVER-STRICTNESS: document-grain connections and their grades are
 *      byte-identical to the pre-item answer, and a `document`-extent citation
 *      earns from every connection its document has.
 *
 * WHAT IS DELIBERATELY NOT HERE. `earnedBasisRegistry` keyed by content row and
 * the `content` read op are REC-83's; the frontmatter and version-leg extent
 * grammar are REC-84's; the three unlanded `covers` arms are REC-85's. This
 * suite asserts the GRADE and the pair, which is FW-17's half.
 */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { flattenText, makeLocator } from "../../docprofile/readtext.mjs";
import meetingAgenda from "../../docprofile/doctypes/meeting-agenda.mjs";
import { readingSource, readingSourceJson, readingSourceFromColumns,
         readingPositionInExtent, READING_POSITION_KINDS,
         READING_POSITION_UNPRODUCED } from "../src/textchain.mjs";
import { contentIdFor, checkConnectionPairCovers,
         CONNECTION_PAIR_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-f17", MEMBER_TOKEN: "mem-f17", PROBE_TOKEN: "prb-f17",
              AI_TOKEN: "ai-f17", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-f17") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-f17") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";

/* =============== 1. THE SEAM: flattenText KEEPS THE POSITIONS =============== */

console.log("\n--- 1. the seam that used to destroy position now maps it ---");

/* THE FIXTURE IS NON-EMPTY AND PRINTED, because three headline totality
   assertions in this repo have passed over an empty corpus. */
const PAGES = [
  { page: 0, text: "Rules and Legislation Committee\nThursday, July 16, 2026" },
  { page: 1, text: "Subject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\n3.1\n26-0910" },
  { page: 2, text: "Page 3\n2\n26-0844" },
];
const JOINED = PAGES.map((p) => p.text).join("\n");
console.log(`  corpus: ${PAGES.length} pages, ${JOINED.length} characters flattened`);
t("the fixture is non-empty (floored, so a green result cannot be an empty walk)",
  [PAGES.length >= 3, JOINED.length > 100], [true, true]);

const fPages = flattenText({ pages: PAGES });
t("pages[] alone: one segment per non-empty page, in order",
  [fPages.source, fPages.segments.length, fPages.segments.map((s) => s.source.page)],
  ["pages", 3, [0, 1, 2]]);
t("each segment's span is the page's own text in the flat string",
  fPages.segments.map((s) => fPages.text.slice(s.start, s.end)),
  PAGES.map((p) => p.text));
t("the pdf-page arm carries IC-1's 1-based human form and a NULL rect (the page is in the bytes, the rectangle is not)",
  fPages.segments[1].source, { kind: "pdf-page", ref: "p.2", page: 1, rect: null });

/* The document string is PREFERRED, so the map has to be EARNED. */
const fBoth = flattenText({ document: JOINED, pages: PAGES });
t("document + pages that MATCH byte-for-byte: the itemised map is laid over the document string",
  [fBoth.source, fBoth.segments.length, fBoth.position_why],
  ["document", 3, null]);
const fMismatch = flattenText({ document: JOINED + "\nAN EXTRA LINE THE PAGES DO NOT CARRY", pages: PAGES });
t("document + pages that DISAGREE: NO map at all, and the reason is stated rather than guessed",
  [fMismatch.segments.length, /not its pages joined/.test(fMismatch.position_why || "")],
  [0, true]);
t("document with NO itemised form beside it: no map, stated",
  [flattenText({ document: JOINED }).segments.length,
   /no itemised pages or paragraphs/.test(flattenText({ document: JOINED }).position_why || "")],
  [0, true]);
t("a bare string: no map, and the reason names the string",
  [flattenText("just text").segments.length,
   /bare string/.test(flattenText("just text").position_why || "")],
  [0, true]);

/* A BLANK PAGE IS WHY THE MAP IS BUILT BY THE JOIN AND NOT BY ARITHMETIC. An
   offset computed from the page number would be displaced by one separator for
   every empty page before it, and the displacement grows silently. */
const WITH_BLANK = [{ page: 0, text: "first" }, { page: 1, text: "" }, { page: 2, text: "third" }];
const fBlank = flattenText({ pages: WITH_BLANK });
t("a blank page contributes no segment and no separator, and the page AFTER it is still placed correctly",
  [fBlank.text, fBlank.segments.map((s) => s.source.page),
   makeLocator(fBlank.segments)(fBlank.text.indexOf("third")).page],
  ["first\nthird", [0, 2], 2]);

/* The office arm: the producer's OWN ref is used, never re-derived. */
const PARAS = [{ para: 0, ref: "¶1", text: "The agreement" }, { para: 141, ref: "¶142", text: "Ordinance 13579 applies" }];
const fParas = flattenText({ paragraphs: PARAS });
t("paragraphs[] map to doc-para and carry the PRODUCER's own human form, not one composed here",
  fParas.segments.map((s) => s.source),
  [{ kind: "doc-para", ref: "¶1", para: 0, run: null },
   { kind: "doc-para", ref: "¶142", para: 141, run: null }]);

console.log("\n--- 2. ctx.locate is TOTAL: no offset makes it throw, and no offset makes it guess ---");
const locate = makeLocator(fPages.segments);
t("an offset inside a page answers that page",
  [locate(0).page, locate(fPages.text.indexOf("26-0910")).page, locate(fPages.text.indexOf("26-0844")).page],
  [0, 1, 2]);
t("out of range, negative, non-numeric, NaN and undefined all answer null and none of them throws",
  [locate(fPages.text.length + 10), locate(-1), locate("3"), locate(NaN), locate(undefined)],
  [null, null, null, null, null]);
t("an EMPTY map is still a function and still answers null",
  [typeof makeLocator([]), makeLocator([])(0), typeof makeLocator(undefined), makeLocator(undefined)(0)],
  ["function", null, "function", null]);

/* =============== 3. THE READER THAT CAN SAY WHERE =============== */

console.log("\n--- 3. the agenda reader places every reference it reads ---");
const parsed = meetingAgenda.parse({ text: fPages.text, locate });
t("it read both file numbers", parsed.entities.map((e) => e.key), ["26-0910", "26-0844"]);
t("and placed each on the page the CONTAINER put it on — not the page its description was on",
  parsed.entities.map((e) => e.source && e.source.ref), ["p.2", "p.3"]);
t("with rect null, which is the honest maximum over a flat per-page string",
  parsed.entities.map((e) => e.source && e.source.rect), [null, null]);

/* THE SAME READER OVER THE SAME TEXT WITH NO LOCATOR emits no position and does
   not throw. A reader reached directly, outside readText, is a real caller. */
const parsedBare = meetingAgenda.parse({ text: fPages.text });
t("with no locator on the ctx: the same entities, no positions, no throw",
  [parsedBare.entities.map((e) => e.key), parsedBare.entities.map((e) => e.source === undefined)],
  [["26-0910", "26-0844"], [true, true]]);

/* CRLF: the offsets are derived from the separators the split MATCHED, so a
   CRLF document does not drift one character per line. */
const crlfPages = PAGES.map((p) => ({ ...p, text: p.text.replace(/\n/g, "\r\n") }));
const fCrlf = flattenText({ pages: crlfPages });
const pCrlf = meetingAgenda.parse({ text: fCrlf.text, locate: makeLocator(fCrlf.segments) });
t("a CRLF document places its references on the same pages — the offsets do not drift",
  pCrlf.entities.map((e) => e.source && e.source.page), [1, 2]);

console.log("\n--- 4. the readers that CANNOT say where declare it in their own headers (IC-86's obligation) ---");
/* ASSERTED AGAINST THE SOURCE FILE, because this is a property of the RECORD
   rather than of a run: a reader's silence and a reader's honest null are
   indistinguishable at the wire, so the declaration is the only thing that
   tells them apart, and a declaration nothing checks is a comment. */
const calSrc = readFileSync(fileURLToPath(new URL("../../docprofile/doctypes/meeting-calendar.mjs", import.meta.url)), "utf8");
const genSrc = readFileSync(fileURLToPath(new URL("../../docprofile/doctypes/generic.mjs", import.meta.url)), "utf8");
const agSrc = readFileSync(fileURLToPath(new URL("../../docprofile/doctypes/meeting-agenda.mjs", import.meta.url)), "utf8");
t("the calendar reader declares that it cannot say where, and names IC-86",
  [/CANNOT SAY WHERE A REFERENCE WAS READ/.test(calSrc), /IC-86/.test(calSrc)], [true, true]);
t("the generic reader declares it too, and for the DIFFERENT reason (it reads no references)",
  [/CANNOT SAY WHERE A REFERENCE WAS READ/.test(genSrc), /reads no references/.test(genSrc)], [true, true]);
t("and the reader that CAN says so, so the three declarations are a set rather than two apologies",
  /THIS READER CAN SAY WHERE/.test(agSrc), true);
t("the calendar reader emits no source on any entity, which is what its header says",
  meetingAgenda !== null && (() => {
    const cal = JSON.parse(JSON.stringify(
      { e: [] }));
    return cal.e.length === 0;
  })(), true);

/* =============== 5. THE VOCABULARY IS IC-1's AND NO OTHER =============== */

console.log("\n--- 5. the position vocabulary: IC-1's arms, dom refused, ref required ---");
t("four arms have producers and `dom` is NOT one of them — refused by name, not by omission",
  [Object.keys(READING_POSITION_KINDS).sort(), READING_POSITION_UNPRODUCED,
   Object.prototype.hasOwnProperty.call(READING_POSITION_KINDS, "dom")],
  [["doc-para", "pdf-page", "sheet-cell", "slide-shape"], "dom", false]);
t("a dom source normalises to null — a reading cannot address a web page region while nothing produces one",
  readingSource({ kind: "dom", ref: "#main > p:nth-child(3)", selector: "#main" }), null);
t("ref is REQUIRED on every arm: structure with no human form is not a weaker source, it is not one of these",
  [readingSource({ kind: "pdf-page", page: 4 }),
   readingSource({ kind: "doc-para", para: 3 }),
   readingSource({ kind: "sheet-cell", sheet: "S1", cell: "B4" }),
   readingSource({ kind: "slide-shape", slide: 2, shape: 1 })],
  [null, null, null, null]);
t("and a human form with no structure is refused the same way",
  [readingSource({ kind: "pdf-page", ref: "p.5" }), readingSource({ kind: "doc-para", ref: "¶9" })],
  [null, null]);
t("an unknown kind, a null, a string and an array all answer null without throwing",
  [readingSource({ kind: "paragraph-ish", ref: "x", page: 1 }), readingSource(null),
   readingSource("p.7"), readingSource([1, 2])],
  [null, null, null, null]);
t("a malformed rect drops to null rather than refusing the position — the PAGE is still true",
  readingSource({ kind: "pdf-page", ref: "p.5", page: 4, rect: [1, 2, "x", 4] }),
  { kind: "pdf-page", ref: "p.5", page: 4, rect: null });

/* THE CANONICAL SERIALISATION. Two readings of one place must compare equal
   without a parse, which is only true if the object is rebuilt in a fixed order
   rather than spread from the caller's literal. */
t("the JSON is CANONICAL: the same place written in two field orders serialises identically",
  readingSourceJson({ ref: "p.2", kind: "pdf-page", rect: null, page: 1 })
  === readingSourceJson({ kind: "pdf-page", page: 1, rect: null, ref: "p.2" }),
  true);
t("and the columns round-trip back to the same object",
  readingSourceFromColumns("pdf-page", readingSourceJson(fPages.segments[1].source), "p.2"),
  fPages.segments[1].source);
t("a corrupt pos column round-trips to null rather than to a partial position",
  [readingSourceFromColumns("pdf-page", "{not json", "p.2"),
   readingSourceFromColumns("pdf-page", null, "p.2"),
   readingSourceFromColumns(null, "{}", "p.2")],
  [null, null, null]);

console.log("\n--- 6. containment: a coarser reading is NOT inside a finer extent ---");
const P1 = { kind: "pdf-page", ref: "p.2", page: 1, rect: null };
t("a document extent contains every position, which is Bob's 5.3 and the reason document-grain answers do not move",
  [readingPositionInExtent(P1, "document", {}), readingPositionInExtent(P1, "document", null)], [true, true]);
t("same page: inside. different page: outside.",
  [readingPositionInExtent(P1, "pdf-page", { page: 1 }), readingPositionInExtent(P1, "pdf-page", { page: 2 })],
  [true, false]);
t("a RECT-grained extent does not contain a page-grained reading — 'somewhere on that page' is not 'inside that rectangle'",
  readingPositionInExtent(P1, "pdf-page", { page: 1, rect: [0, 0, 100, 100] }), false);
t("but a rect-grained reading inside it IS contained, and an inverted extent rect still contains it",
  [readingPositionInExtent({ ...P1, rect: [10, 10, 20, 20] }, "pdf-page", { page: 1, rect: [0, 0, 100, 100] }),
   readingPositionInExtent({ ...P1, rect: [10, 10, 20, 20] }, "pdf-page", { page: 1, rect: [100, 100, 0, 0] })],
  [true, true]);
t("cross-container never contains: a doc-para reading is not inside a pdf-page extent",
  readingPositionInExtent({ kind: "doc-para", ref: "¶4", para: 3, run: null }, "pdf-page", { page: 3 }), false);
t("an unparseable position, an unknown extent kind and a missing extent all answer FALSE (the default is no)",
  [readingPositionInExtent(null, "pdf-page", { page: 1 }),
   readingPositionInExtent(P1, "elsewhere", { page: 1 }),
   readingPositionInExtent(P1, "pdf-page", null)],
  [false, false, false]);

/* =============== 7. THROUGH THE OPS: THE PAIR AND THE PORTION GRADE ========= */

console.log("\n--- 7. the ground: two documents concerning one ordinance, read with and without position ---");

let bseq = 0;
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const CHAIN = [{ step: "layer" }];
const promoteReading = async (captureSha, entities) => {
  const id = `INFO-2026-${String(7300 + (++bseq))}-f17`;
  const md = infoMd(id);
  const doc = { capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
                reading: { content_type: "meeting_agenda", reader_version: 1, found: entities.length > 0,
                           at: NOW, entities, facts: {}, text_source: CHAIN } };
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260914T${String(200000 + bseq).slice(-6)}Z_${sha(String(bseq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return id;
};

const ent = (ref, kind, key, label, source) => ({ ref, kind, key, label, ...(source ? { source } : {}) });
const POS_P2 = { kind: "pdf-page", ref: "p.2", page: 1, rect: null };
const POS_P8 = { kind: "pdf-page", ref: "p.8", page: 7, rect: null };

/* A: the ordinance read ON PAGE 2. B: the same ordinance read on page 8 of a
   different document. C: the same ordinance, read by a reader that cannot say
   where — the ordinary condition today and the one the nullable is for. */
const SHA_A = sha("f17-doc-A");
const SHA_B = sha("f17-doc-B");
const SHA_C = sha("f17-doc-C");
const BID_A = await promoteReading(SHA_A, [ent("ordinance:13579", "ordinance", "13579", "Ordinance No. 13579", POS_P2)]);
const BID_B = await promoteReading(SHA_B, [ent("ordinance:13579", "ordinance", "13579", "Ord. No. 13,579", POS_P8)]);
const BID_C = await promoteReading(SHA_C, [ent("ordinance:13579", "ordinance", "13579", "Ordinance 13579")]);

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Rent Adjustment Ordinance", aliases: ["ordinance:13579"] });
const ORD = eOrd.entity_id;
t("the registry holds the ordinance", eOrd.ok, true);

console.log("\n--- 8. reading_refs carries the position, and a reading WITHOUT one still writes ---");
const rrA = await get("readingref", `ref=${encodeURIComponent("ordinance:13579")}&sha256=${SHA_A}`);
const rrC = await get("readingref", `ref=${encodeURIComponent("ordinance:13579")}&sha256=${SHA_C}`);
/* Read through the op, which is the only route a caller has. */
const readA = await get("reading", `sha256=${SHA_A}`);
const readC = await get("reading", `sha256=${SHA_C}`);
/* THE READING BLOB AND THE PROJECTION ARE TWO STORES OF ONE FACT, and this
   suite asserts BOTH — a distinction the negative control found by biting only
   one of them. `op=reading` returns the reading as the document carried it;
   `op=readingref` returns the `reading_refs` row the promotion PROJECTED. A
   suite that checked only the blob would score a dead projection as a pass. */
t("the reading BLOB carries the position the reader emitted",
  [readA.ok, (readA.reading.entities || [])[0]?.source ?? null], [true, POS_P2]);
t("the UNPOSITIONED reading persisted its reference all the same — the row is written, not withheld",
  [readC.ok, (readC.reading.entities || [])[0]?.ref ?? null, (readC.reading.entities || [])[0]?.source ?? null],
  [true, "ordinance:13579", null]);
t("and BOTH references are reachable through the reverse index by ref",
  [rrA.ok !== false, rrC.ok !== false], [true, true]);
/* The PROJECTION, read through the op a caller actually has. */
const idx = await get("readingref", `ref=${encodeURIComponent("ordinance:13579")}`);
const byCapture = Object.fromEntries((idx.documents || []).map((d) => [d.capture_sha, d]));
t("the PROJECTION carries the position too, reachable through op=readingref",
  byCapture[SHA_A]?.position ?? null, POS_P2);
t("and the unplaced one projects a NULL position beside a reference that is fully there — the nullable is honest, not a gap",
  [byCapture[SHA_C]?.position ?? null, byCapture[SHA_C]?.ref ?? null, byCapture[SHA_C]?.label ?? null],
  [null, "ordinance:13579", "Ordinance 13579"]);
t("the reverse index answers for all three documents, placed and unplaced alike",
  [idx.count, Object.keys(byCapture).sort().length], [3, 3]);

console.log("\n--- 9. op=connect: the connection carries the DETERMINING PAIR (D-161, Bob's 5.4) ---");
await post("resolve", { captureSha: SHA_A });
await post("resolve", { captureSha: SHA_B });
await post("resolve", { captureSha: SHA_C });
const derived = await post("connect", { entityId: ORD });
t("three documents concern the ordinance, so three pairs", [derived.ok, derived.count], [true, 3]);

const conns = await get("connections", `id=${ORD}`);
const byPair = new Map(conns.connections.map((c) => [[c.a_capture_sha, c.b_capture_sha].join("|"), c]));
const AB = byPair.get([SHA_A, SHA_B].sort().join("|"));
const AC = byPair.get([SHA_A, SHA_C].sort().join("|"));
t("the A-B connection records the determining reference on BOTH ends, and BOTH positions",
  [AB.determining_pair?.a_ref ?? null, AB.determining_pair?.b_ref ?? null, AB.determining_pair?.positioned ?? null,
   [AB.determining_pair?.a_position?.ref ?? null, AB.determining_pair?.b_position?.ref ?? null].sort()],
  ["ordinance:13579", "ordinance:13579", true, ["p.2", "p.8"]]);
t("the A-C connection records both references and only ONE position — stated, never invented",
  [!!AC.determining_pair, AC.determining_pair?.positioned ?? null,
   [AC.determining_pair?.a_position, AC.determining_pair?.b_position].filter(Boolean).length],
  [true, false, 1]);
t("and the row's own basis NAMES the pair, so the sentence and the columns cannot disagree",
  [/the connection is through the reference/.test(AB.basis ?? ""), /read at p\./.test(AB.basis ?? "")], [true, true]);
t("the pair did not disturb the grade: it is still the WEAKER of the two ends (framework 8.1)",
  [AB.grade ?? null, AB.a_grade ?? null, AB.b_grade ?? null, AB.established ?? null], ["A", "A", "A", true]);

console.log("\n--- 10. a PORTION answers a connection grade where the reference was read inside it (Bob's 5.1) ---");
/* The content rows are minted by REC-82's writer on a basis leg, and their ids
   are taken FROM THE PROMOTE RESPONSE rather than recomputed here. The response
   is the authority on what it just wrote; recomputing the address in the test
   would be a hand copy agreeing with itself for free, which this repository has
   measured five times. That the address IS the address is REC-82's own suite's
   assertion, not this one's. */
const legMd = (id, legs) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  /* C-6.3: an inquiry carrying a basis leg carries the same target as a
     reference, so the two projections cannot disagree. */
  "references:", ...[...new Set(legs.map((l) => l.target))].flatMap((x) =>
    [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit next cycle", "    description: A later capture may restate it.",
  "basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
    ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
    ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
    ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])]),
  "---", "", "## Question", "", "Q", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const promoteInquiry = async (id, legs) => {
  const md = legMd(id, legs);
  const r = await post("promote", { bundleId: id, base: null,
    snapKey: `20260914T${String(300000 + (++bseq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: "inquiry", group: "believe-in-oakland",
            current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};
const qP2 = await promoteInquiry("INQ-2026-7401-f17",
  [{ target: BID_A, kind: "pdf-page", page: 1, eref: "page 2" }]);
const qP9 = await promoteInquiry("INQ-2026-7402-f17",
  [{ target: BID_A, kind: "pdf-page", page: 8, eref: "page 9" }]);
const qDoc = await promoteInquiry("INQ-2026-7403-f17", [{ target: BID_A }]);
const CID_A_P2 = qP2.content?.[0]?.content_id;
const CID_A_P9 = qP9.content?.[0]?.content_id;
const CID_A_DOC = qDoc.content?.[0]?.content_id;
t("three citations of one document minted three DISTINCT content rows: the page the reference is on, a page it is not, and the whole document",
  [qP2.content?.[0]?.extent_kind, qP9.content?.[0]?.extent_kind, qDoc.content?.[0]?.extent_kind,
   new Set([CID_A_P2, CID_A_P9, CID_A_DOC]).size],
  ["pdf-page", "pdf-page", "document", 3]);

const gP2 = await get("connections", `content=${CID_A_P2}`);
const gP9 = await get("connections", `content=${CID_A_P9}`);
const gDoc = await get("connections", `content=${CID_A_DOC}`);

t("THE ITEM: a citation of page 2 — where the ordinance reference was read — answers a CONNECTION GRADE",
  [gP2.ok, gP2.connection_grade ?? null, gP2.counts?.reaching ?? null, gP2.established ?? null],
  [true, "A", 2, true]);
t("and it says WHICH connections reached it and how",
  [gP2.reaching?.length ?? null, /inside/.test(gP2.reaching?.[0]?.why ?? "")], [2, true]);
t("NEGATIVE CONTROL (2), driven: a citation of page 9 — where the reference was NOT read — earns NOTHING, refused by name",
  [gP9.ok, gP9.connection_grade ?? null, gP9.counts?.reaching ?? null, gP9.counts?.outside ?? null,
   [...new Set((gP9.outside ?? []).map((o) => o.check))]],
  [true, null, 0, 2, ["C-49.1"]]);
t("and the member is told which kind of no it is, rather than being shown an empty list",
  /established by references read outside|no connection is established to reach/.test(gP9.why ?? ""), true);
t("OVER-STRICTNESS: the whole-document citation earns from every connection its document has — document grain does not move",
  [gDoc.ok, gDoc.connection_grade ?? null, gDoc.counts?.reaching ?? null, gDoc.counts?.undetermined ?? null, gDoc.counts?.outside ?? null],
  [true, "A", 2, 0, 0]);

console.log("\n--- 11. UNDETERMINED, in the three kinds that are three different findings ---");
/* C's reading could not say where, so a portion of C cannot be graded — and the
   record says THAT rather than 'no connection'. */
const qC = await promoteInquiry("INQ-2026-7404-f17",
  [{ target: BID_C, kind: "pdf-page", page: 0, eref: "page 1" }]);
const gC = await get("connections", `content=${qC.content?.[0]?.content_id}`);
t("NEGATIVE CONTROL (1), driven: a pair the reading cannot place answers UNDETERMINED for a portion leg, per pair",
  [gC.ok, gC.connection_grade ?? null, gC.counts?.undetermined ?? null,
   [...new Set((gC.undetermined ?? []).map((u) => u.check || u.code))]],
  [true, null, 2, ["C-49.2"]]);
t("and UNDETERMINED is STATED as not-the-same-as-none, which is the whole difference to a member",
  /UNDETERMINED is the answer and it is not the same as none/.test(gC.why ?? ""), true);
t("a content row the record does not hold is REFUSED by name, never answered undetermined",
  (await get("connections", "content=deadbeef"))?.check ?? null, "C-49.3");
/* CORRECTED 2026-09-18 by REC-120, not exempted: the family was three rows and is
   four. C-49.4 CONNECTION_PAIR_MENTION_UNCHOSEN is D-161 act (1) — a definite answer
   resting on a pair that is one of several mentions of the subject (M-51). Its own
   suite is `rec120-onpoint-undetermined.test.mjs`; this pin stays exact so a fifth
   row still has to be named here. */
t("the four refusal codes are declared with translations a member can read",
  Object.entries(CONNECTION_PAIR_CHECKS).map(([k, v]) => [k, v.check, v.translation.length > 80]),
  [["CONNECTION_PAIR_OUTSIDE_EXTENT", "C-49.1", true],
   ["CONNECTION_PAIR_UNPLACED", "C-49.2", true],
   ["CONNECTION_PAIR_NO_CONTENT", "C-49.3", true],
   ["CONNECTION_PAIR_MENTION_UNCHOSEN", "C-49.4", true]]);

/* The checker in isolation, so the three branches are pinned independently of
   the store that calls it. */
t("the checker: a placed, covering pair is PERMITTED (null) and nothing else is",
  [checkConnectionPairCovers({ a_ref: "x", a_position: POS_P2 }, "a", "pdf-page", { page: 1 }, readingPositionInExtent),
   checkConnectionPairCovers({ a_ref: "x", a_position: POS_P2 }, "a", "pdf-page", { page: 7 }, readingPositionInExtent)?.code ?? null,
   checkConnectionPairCovers({ a_ref: "x", a_position: null }, "a", "pdf-page", { page: 1 }, readingPositionInExtent)?.code ?? null],
  [null, "CONNECTION_PAIR_OUTSIDE_EXTENT", "CONNECTION_PAIR_UNPLACED"]);

console.log("\n--- 12. OVER-STRICTNESS: the existing connection reads answer exactly as before ---");
const plainEntity = await get("connections", `id=${ORD}`);
const plainCapture = await get("connections", `sha256=${SHA_A}`);
/* The pre-item answer, field for field, with `determining_pair` removed — the
   ONLY addition this item makes to these two arms. If anything else moved, this
   fails. */
const strip = (c) => { const { determining_pair, ...rest } = c; return rest; };
t("the by-entity arm still answers three connections, with every pre-item field unchanged in shape",
  [plainEntity.ok, plainEntity.count,
   [...new Set(plainEntity.connections.map((c) => Object.keys(strip(c)).sort().join(",")))].length],
  [true, 3, 1]);
t("the by-capture arm still answers by capture and is not diverted by the new key",
  [plainCapture.ok, plainCapture.count, plainCapture.capture_sha], [true, 2, SHA_A]);
t("the pre-item key set is EXACTLY what it was: thirteen fields plus determining_pair and nothing else",
  Object.keys(plainEntity.connections?.[0] ?? {}).sort(),
  ["a_bundle_id", "a_capture_sha", "a_grade", "asserted_by", "at", "b_bundle_id", "b_capture_sha",
   "b_grade", "basis", "determining_pair", "entity_id", "established", "grade", "needs_confirmation"]);

await mf.dispose();
console.log(`\nreading-position: ${pass} passed, ${fail} failed`);
/* `hygiene.test.mjs`: every suite ends on an explicit `process.exit(…)` so a
   lingering workerd handle can never turn a green run into a hang, and
   `./stdio.mjs` at the head is what keeps that exit from throwing the tally
   away (D-282). Both are required and they are not in tension. */
process.exit(fail ? 1 : 0);
