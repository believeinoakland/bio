/* observation-log: the writers other modules' events drive (R5, R6, R7, R8): provenance's receipt, extraction's reading
   notice (its R24) and index notice (its R62), and the meaning-level notices. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { contentObservationsFor, CAPTURE_TEXT_UNIT_CONTAINERS, INDEX_NOTICE_UNIT_CONTAINERS, observationLogOf, OBSERVATION_LOG_MODULE }
  from "../../../src/observation-log/index.mjs";
import { CAPTURE_TEXT_CAPTURE_UNIT_BOUND } from "../../../src/extraction/index.mjs";

const LAYER = (tier = 1, extent = null) => ({ step: "layer", tier, container: "pdf", cap: null, ...(extent ? { extent } : {}) });
const OCR_PAGES = (pages) => [
  { step: "pixels", tier: 3, cap: "C", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tess", version: "5", tier: 3, cap: "C", measured_by: "cal-1", extent: { kind: "pages", pages } }];
const reading = (over = {}) => ({ content_type: "agenda", reader_version: 2, read_from_text: true, found: true,
  entities: [{ ref: "k:1" }, { ref: "k:2" }], text_source: [LAYER()], text_container: "pdf", page_count: 3, ...over });
const indexed = (over = {}) => ({ offered: 3, written: 3, bytes: 90, truncated: 0, over_bound: 0, unaddressable: 0, ...over });
const notice = (w, bundleId, captureSha, r, ix = indexed(), author = "member:alice") =>
  w.ex.fire({ bundleId, captureSha, reading: r, chainBefore: null, chainAfter: r.text_source, unitsBefore: null, indexed: ix, author });

test("R5 a receipt at an address is a PRESENT document-level row naming the capture: acquire for a direct fetch, link for another route unless the caller named its own; detail new, unchanged or changed with the route; an unchanged revisit writes none", () => {
  const w = world();
  const [a, b] = w.doc("INFO-2026-0001", ["first bytes", "second bytes"]);
  const rec = (captureSha, via = "direct", context = null, retrieved = "2026-09-27T03:00:00Z") =>
    w.prov.recordReceipt({ address: "https://e.org/x", addressNorm: "https://e.org/x", captureSha, retrieved, via, context });
  const r1 = rec(a);
  assert.deepEqual(r1.listeners.find((l) => l.module === OBSERVATION_LOG_MODULE).answer, { written: true });
  rec(a);                                                                  // unchanged: no row
  rec(b, "direct", null, "2026-09-27T04:00:00Z");                          // changed
  rec(a, "archive.org");                                                   // another route: new at that via
  rec(b, "archive.org", { authorityKind: "sweep", authority: "CR-1", actorClass: "plane" });   // a caller-named authority
  rec(b, "direct", { observe: false });                                    // a caller that writes its own look
  const rows = w.log().map((r) => [r.level, r.subject_kind, r.subject, r.state, r.authority_kind, r.authority, r.result_kind, r.result_ref, r.detail, r.at]);
  assert.deepEqual(rows, [
    ["document", "address", "https://e.org/x", "PRESENT", "acquire", null, "capture", a, "new (via direct)", "2026-09-27T03:00:00Z"],
    ["document", "address", "https://e.org/x", "PRESENT", "acquire", null, "capture", b, "changed (via direct)", "2026-09-27T04:00:00Z"],
    ["document", "address", "https://e.org/x", "PRESENT", "link", null, "capture", a, "new (via archive.org)", "2026-09-27T03:00:00Z"],
    ["document", "address", "https://e.org/x", "PRESENT", "sweep", "CR-1", "capture", b, "changed (via archive.org)", "2026-09-27T03:00:00Z"],
  ]);
  assert.ok(w.log().every((r) => r.actor_class === "plane" && r.actor === null), "the plane's own fetch names no member");
});

test("R6 the content level: one extract row per tier outcome naming the bundle, subject the capture, `first extraction;` then `re-extraction;`, answering {written, states, refused, reextraction, unclassified}", () => {
  const w = world();
  const c = sha("doc");
  // a mixed document: a layer over pages 0-1, OCR over page 2, read whole across the two tiers
  const mixed = reading({ text_source: [LAYER(1, { kind: "pages", pages: [0, 1] }), ...OCR_PAGES([2])] });
  const x1 = w.obs.observeExtraction("INFO-2026-0001", c, mixed, { author: "member:alice" });
  assert.deepEqual(x1, { written: 2, states: ["partial", "PRESENT"], refused: [], reextraction: false, unclassified: [] });
  const rows = w.log();
  assert.deepEqual(rows.map((r) => [r.level, r.authority_kind, r.authority, r.subject_kind, r.subject, r.state, r.result_kind, r.result_ref, r.actor_class, r.actor]),
    [["content", "extract", "INFO-2026-0001", "capture", c, "partial", "reading", c, "member", "member:alice"],
     ["content", "extract", "INFO-2026-0001", "capture", c, "PRESENT", "reading", c, "member", "member:alice"]]);
  assert.ok(rows.every((r) => r.detail.startsWith("first extraction; ")));
  assert.match(rows[0].detail, /tier 1/); assert.match(rows[1].detail, /tier 3/);
  // a second reading of the same capture is a re-extraction, derived from the log
  const x2 = w.obs.observeExtraction("INFO-2026-0001", c, reading(), { author: null });
  assert.deepEqual([x2.reextraction, x2.states], [true, ["PRESENT"]]);
  assert.match(w.log().at(-1).detail, /^re-extraction; /);
  assert.deepEqual([w.log().at(-1).actor_class, w.log().at(-1).actor], ["plane", null]);
  // no text possible
  const d = sha("scan");
  const x3 = w.obs.observeExtraction("INFO-2026-0002", d, reading({ read_from_text: false }));
  assert.deepEqual(x3.states, ["LOOKED_INDETERMINATE"]);
  assert.equal(w.log().at(-1).condition, "text-undetermined");
  // pages left unread make an otherwise whole reading partial; no page count never reads whole over a page list
  assert.deepEqual(w.obs.observeExtraction("B", sha("s1"), reading({ tier3_candidate: true })).states, ["partial"]);
  assert.deepEqual(w.obs.observeExtraction("B", sha("s2"), reading({ page_count: null, text_source: [LAYER(1, { kind: "pages", pages: [0] })] })).states, ["partial"]);
  // `found: false` is a meaning-level absence, not a content-level one
  assert.deepEqual(w.obs.observeExtraction("B", sha("s3"), reading({ found: false, entities: [] })).states, ["PRESENT"]);
  // no reading at all writes nothing
  assert.deepEqual(w.obs.observeExtraction("B", sha("s4"), null).written, 0);
  // a count the text states is judged by coverage as before; a null or absent count is never "no text"
  assert.deepEqual(w.obs.observeExtraction("B", sha("s6"), reading({ text_chars: 42 })).states, ["PRESENT"]);
  assert.deepEqual(w.obs.observeExtraction("B", sha("s7"), reading({ text_chars: null })).states, ["PRESENT"]);
  assert.deepEqual(w.obs.observeExtraction("B", sha("s8"), reading({ text_chars: null, read_from_text: false })).states,
    ["LOOKED_INDETERMINATE"]);
  // a machine author is a machine look
  w.obs.observeExtraction("B", sha("s5"), reading(), { author: "class:ai/tok-1" });
  assert.deepEqual([w.log().at(-1).actor_class, w.log().at(-1).actor], ["machine", "class:ai/tok-1"]);
});

test("R6 the fourth row: a reading whose text_chars is 0 is the document with no text, one LOOKED_ABSENT row with condition null; a null or absent count, or found: false, never reads as no text", () => {
  const w = world();
  const OCR = OCR_PAGES([0, 1, 2]);
  // the reader declines empty text, so the scan read to nothing arrives read_from_text: false; the count says it
  for (const [i, r] of [reading({ read_from_text: false, found: false, entities: [], text_chars: 0, text_source: OCR }),
                        reading({ text_chars: 0, text_source: OCR }),
                        reading({ read_from_text: false, text_chars: 0, text_source: [LAYER()] }),
                        reading({ read_from_text: false, text_chars: 0, text_source: null })].entries()) {
    const c = sha(`empty${i}`);
    const x = w.obs.observeExtraction("INFO-2026-0001", c, r, { author: "member:alice" });
    assert.deepEqual([x.written, x.states, x.refused], [1, ["LOOKED_ABSENT"], []], String(i));
    const row = w.log().at(-1);
    assert.deepEqual([row.level, row.authority_kind, row.authority, row.subject_kind, row.subject, row.state, row.condition,
                      row.result_kind, row.result_ref], ["content", "extract", "INFO-2026-0001", "capture", c, "LOOKED_ABSENT",
                      null, null, null], String(i));
    assert.match(row.detail, /^first extraction; no text/);
  }
  assert.match(w.log()[0].detail, /tier 3/, "on the last tier the chain evidences");
  // pages left unread are not a page with no text: a zero count there stays no text possible
  const unread = w.obs.observeExtraction("B", sha("unread"), reading({ read_from_text: false, text_chars: 0, tier3_candidate: true }));
  assert.deepEqual(unread.states, ["LOOKED_INDETERMINATE"]);
  assert.equal(w.log().at(-1).condition, "text-undetermined");
  assert.deepEqual(w.obs.observeExtraction("B", sha("unread2"), reading({ text_chars: 0, tier3_candidate: true })).states,
    ["LOOKED_INDETERMINATE"]);
  // only an integer 0 is no text: null, absent, a string "0" and found: false are not
  for (const [i, over] of [{ text_chars: null }, {}, { text_chars: "0" }, { found: false, entities: [] },
                           { found: false, entities: [], text_chars: 7 }].entries())
    assert.deepEqual(w.obs.observeExtraction("B", sha(`text${i}`), reading(over)).states, ["PRESENT"], String(i));
  // the same through extraction's reading notice
  const out = notice(w, "INFO-2026-0002", sha("scan"), reading({ read_from_text: false, found: false, entities: [], text_chars: 0, text_source: OCR }));
  assert.deepEqual(out.find((o) => o.module === OBSERVATION_LOG_MODULE).answer.observed.states, ["LOOKED_ABSENT"]);
  assert.deepEqual(contentObservationsFor(reading({ text_chars: 0 }), "c", () => ({ tiers: [], unclassified: [] })).rows.map((r) => [r.tier, r.state]),
    [[null, "LOOKED_ABSENT"]], "a chain evidencing no tier: one row, no tier");
});

test("R6 a chain step no rule classifies is returned by name, never counted as nothing", () => {
  const out = contentObservationsFor(reading(), "c", () => ({ tiers: [{ tier: 1, covers: "all", steps: ["layer"] }], unclassified: ["mystery"] }));
  assert.deepEqual(out.unclassified, ["mystery"]);
  assert.equal(out.rows.length, 1);
  const w = world();
  assert.deepEqual(w.obs.observeExtraction("B", "c", reading()).unclassified, []);
});

test("R7 the index: one derive row per capture — PRESENT when every unit was stored, partial with the bound that stopped it, LOOKED_ABSENT with no text, LOOKED_INDETERMINATE with the reason when the container has no unit arm; its referent is the reading", () => {
  const w = world();
  const row = () => w.log().at(-1);
  assert.equal(w.obs.observeIndexed("B", "c1", indexed(), { hadText: true, unitArm: true }), null);
  assert.deepEqual([row().level, row().authority_kind, row().authority, row().subject, row().state, row().result_kind, row().result_ref, row().bound],
    ["content", "derive", "B", "c1", "PRESENT", "reading", "c1", null]);
  w.obs.observeIndexed("B", "c2", indexed({ written: 2, over_bound: 5, offered: 7 }), { hadText: true });
  assert.deepEqual([row().state, row().result_kind, row().result_ref], ["partial", "reading", "c2"]);
  assert.match(row().bound, /per-capture text bound/);
  w.obs.observeIndexed("B", "c2b", indexed({ written: CAPTURE_TEXT_CAPTURE_UNIT_BOUND, over_bound: 1 }), { hadText: true });
  assert.match(row().bound, /UNIT bound/);
  w.obs.observeIndexed("B", "c3", indexed({ written: 0 }), { hadText: false });
  assert.deepEqual([row().state, row().result_kind, row().result_ref], ["LOOKED_ABSENT", null, null]);
  w.obs.observeIndexed("B", "c4", indexed(), { hadText: true, unitArm: false, armReason: "a xlsx has no indexing unit arm" });
  assert.deepEqual([row().state, row().bound, row().result_ref], ["LOOKED_INDETERMINATE", "a xlsx has no indexing unit arm", null]);
  w.obs.observeIndexed("B", "c5", indexed({ written: 0, offered: 0 }), { hadText: true, unitArm: true });
  assert.equal(row().state, "LOOKED_ABSENT", "an arm that produced nothing is never PRESENT over zero units");
  w.obs.observeIndexed("B", "c6", indexed({ truncated: 2, unaddressable: 1 }), { hadText: true });
  assert.match(row().detail, /2 unit\(s\) stored to the per-unit cap/); assert.match(row().detail, /1 unit\(s\) offered an address/);
  assert.ok(w.log().every((r) => r.result_kind !== "content"), "never a content row");
});

test("R6 R7 R8 registered on extraction's reading notice: the index row, the content rows and the reader run, in the reading's call; a container with no unit arm reads LOOKED_INDETERMINATE naming it", () => {
  const w = world();
  assert.deepEqual(w.ex.listeners.map((l) => l.module), ["content", OBSERVATION_LOG_MODULE], "in the modules' total order");
  const c = sha("agenda");
  const out = notice(w, "INFO-2026-0001", c, reading());
  const mine = out.find((o) => o.module === OBSERVATION_LOG_MODULE).answer;
  assert.deepEqual(mine, { observed: { written: 1, states: ["PRESENT"], reextraction: false, refused: 0, unclassified: [] } });
  assert.deepEqual(w.log().map((r) => [r.level, r.authority_kind, r.state]),
    [["content", "derive", "PRESENT"], ["content", "extract", "PRESENT"], ["meaning", "derive", "PRESENT"]]);
  assert.deepEqual([...CAPTURE_TEXT_UNIT_CONTAINERS].sort(), ["csv", "docx", "odp", "ods", "odt", "pdf", "pptx", "xlsx"]);
  // a workbook's sheets are units (extraction R16, N134): its index row reads indexed
  for (const book of ["xlsx", "ods", "csv"]) {
    notice(w, `INFO-2026-${book}`, sha(book), reading({ text_container: book }));
    const ix = w.log().find((r) => r.subject === sha(book) && r.authority_kind === "derive" && r.level === "content");
    assert.deepEqual([ix.state, ix.bound, ix.result_kind], ["PRESENT", null, "reading"], book);
  }
  notice(w, "INFO-2026-0002", sha("page"), reading({ text_container: "html" }));
  const ix = w.log().find((r) => r.subject === sha("page") && r.authority_kind === "derive" && r.level === "content");
  assert.equal(ix.state, "LOOKED_INDETERMINATE"); assert.match(ix.bound, /a html has no indexing unit arm/);
  assert.doesNotMatch(ix.bound, /workbook|sheet-range units into/, "the reason no longer says a workbook has no unit arm");
  notice(w, "INFO-2026-0003", sha("unknown"), reading({ text_container: null }));
  assert.match(w.log().find((r) => r.subject === sha("unknown") && r.authority_kind === "derive" && r.level === "content").bound,
    /does not hold which container/);
  // a second registration by the module is refused by extraction, and the module listens once
  assert.equal(observationLogOf(w.host), w.obs);
  assert.equal(w.obs.listenTo(w.ex), true);
  assert.equal(w.ex.listeners.filter((l) => l.module === OBSERVATION_LOG_MODULE).length, 1);
});

test("R7 the index notice (extraction R62): one derive row per indexed authored observation, by R7's rule — PRESENT, partial with its bound, LOOKED_ABSENT with no text, LOOKED_INDETERMINATE naming a container with no unit arm; its referent the capture; no content row and no reader run", () => {
  const w = world();
  assert.deepEqual(w.ex.indexListeners.map((l) => l.module), [OBSERVATION_LOG_MODULE], "registered beside onReading");
  const c = sha("I asked the clerk and was told the minutes were not kept");
  const fire = (over = {}) => w.ex.fireIndexed({ bundleId: "INFO-2026-0001", captureSha: c, author: "member:alice", container: "document",
    indexed: indexed({ offered: 1, written: 1, bytes: 57 }), ...over }).find((o) => o.module === OBSERVATION_LOG_MODULE).answer;
  const row = () => w.log().at(-1);
  // every unit stored: PRESENT, the referent the reading (the capture), the member who wrote it
  assert.deepEqual(fire(), { observed: { written: 1, state: "PRESENT" } });
  assert.equal(w.count("observation_log"), 1, "one row: no content row (R6) and no reader run (R8), because no reader ran");
  assert.deepEqual([row().level, row().authority_kind, row().authority, row().subject_kind, row().subject, row().state, row().bound,
                    row().result_kind, row().result_ref, row().actor_class, row().actor],
    ["content", "derive", "INFO-2026-0001", "capture", c, "PRESENT", null, "reading", c, "member", "member:alice"]);
  assert.match(row().detail, /^1 unit\(s\) indexed, 57 B/);
  // stored to a bound: partial with the bound that stopped it
  assert.deepEqual(fire({ indexed: indexed({ offered: 2, written: 1, over_bound: 1 }) }).observed.state, "partial");
  assert.deepEqual([row().result_kind, row().result_ref], ["reading", c]);
  assert.match(row().bound, /per-capture text bound/);
  // a unit stored to the per-unit cap is said
  fire({ indexed: indexed({ offered: 1, written: 1, truncated: 1 }) });
  assert.deepEqual([row().state, row().result_ref], ["PRESENT", c]);
  assert.match(row().detail, /1 unit\(s\) stored to the per-unit cap/);
  // words holding no glyph offered no unit (extraction R22): no text, LOOKED_ABSENT, saying why and naming no extraction row
  assert.deepEqual(fire({ indexed: indexed({ offered: 0, written: 0, bytes: 0 }) }).observed.state, "LOOKED_ABSENT");
  assert.deepEqual([row().state, row().condition, row().bound, row().result_kind, row().result_ref], ["LOOKED_ABSENT", null, null, null, null]);
  assert.match(row().detail, /holds no character/);
  assert.doesNotMatch(row().detail, /extraction observation|PDF/, "no reader ran, so no extraction row is pointed at");
  assert.equal(fire({ indexed: null }).observed.state, "LOOKED_ABSENT", "an index answer carrying nothing is no text");
  // a container with no unit arm: LOOKED_INDETERMINATE naming it, even with text
  assert.equal(fire({ container: "pdf-page" }).observed.state, "LOOKED_INDETERMINATE");
  assert.deepEqual([row().result_kind, row().result_ref], [null, null]);
  assert.match(row().bound, /a pdf-page extent has no indexing unit arm/);
  fire({ container: undefined });
  assert.deepEqual([row().state], ["LOOKED_INDETERMINATE"]);
  assert.match(row().bound, /did not say which container/);
  assert.deepEqual([...INDEX_NOTICE_UNIT_CONTAINERS], ["document"]);
  // who looked is derived from the author, never guessed
  fire({ author: null });
  assert.deepEqual([row().actor_class, row().actor], ["plane", null]);
  fire({ author: "class:ai/tok-1" });
  assert.deepEqual([row().actor_class, row().actor], ["machine", "class:ai/tok-1"]);
  // every row is the index's and never a content row
  assert.ok(w.log().every((r) => r.level === "content" && r.authority_kind === "derive" && r.result_kind !== "content"));
  // a notice naming no capture has no subject and writes nothing
  const n = w.count("observation_log");
  assert.deepEqual(fire({ captureSha: null }).observed.written, 0);
  assert.equal(w.count("observation_log"), n);
  // the index row never reads as an extraction: the next reading of the capture is still its first extraction (R6)
  w.obs.observeExtraction("INFO-2026-0001", c, reading());
  assert.match(w.log().at(-1).detail, /^first extraction; /);
  // the module listens once
  assert.equal(w.obs.listenTo(w.ex), true);
  assert.equal(w.ex.indexListeners.length, 1);
});

test("R7 through extraction itself: indexTestimony's write (extraction R61) raises the index notice and this module records the index row in the same transaction; words with no glyph record LOOKED_ABSENT; a call naming no capture records nothing", () => {
  const w = world({ extraction: "module" });
  const [c] = w.doc("INFO-2026-0001", ["an authored observation"]);
  const words = "I asked the clerk for the minutes and was told they were not kept.";
  const out = w.record.transact(() => w.ex.indexTestimony({ bundleId: "INFO-2026-0001", captureSha: c, words, author: "member:alice" }));
  assert.deepEqual([out.offered, out.written], [1, 1]);
  assert.deepEqual(w.log().map((r) => [r.level, r.authority_kind, r.authority, r.subject, r.state, r.result_kind, r.result_ref, r.actor]),
    [["content", "derive", "INFO-2026-0001", c, "PRESENT", "reading", c, "member:alice"]]);
  assert.match(w.log()[0].detail, new RegExp(`^1 unit\\(s\\) indexed, ${Buffer.byteLength(words)} B`));
  // words holding no glyph index nothing: the look is still recorded, as no text
  const [d] = w.doc("INFO-2026-0002", ["another"]);
  assert.equal(w.record.transact(() => w.ex.indexTestimony({ bundleId: "INFO-2026-0002", captureSha: d, words: " \n\t ", author: "member:alice" })).written, 0);
  assert.deepEqual([w.log().at(-1).subject, w.log().at(-1).state, w.log().at(-1).result_ref], [d, "LOOKED_ABSENT", null]);
  // a call naming no capture writes nothing and raises no notice
  assert.equal(w.ex.indexTestimony({ bundleId: "INFO-2026-0001", captureSha: null, words }).written, 0);
  assert.equal(w.count("observation_log"), 2);
  // the reading notice is still this module's too
  assert.equal(w.obs.listenTo(w.ex), true);
});

test("R8 the meaning level: the reader run per capture (PRESENT with the count, LOOKED_ABSENT, LOOKED_INDETERMINATE when no reader is registered); per resolution attempt; per connection derivation with its count, documents and truncation", () => {
  const w = world();
  const last = () => w.log().at(-1);
  w.obs.observeReaderRun("B", "c1", reading(), { author: "member:alice" });
  assert.deepEqual([last().level, last().subject_kind, last().subject, last().authority_kind, last().authority, last().state, last().result_ref],
    ["meaning", "capture", "c1", "derive", "B", "PRESENT", "c1"]);
  assert.match(last().detail, /found 2 entity reference/);
  w.obs.observeReaderRun("B", "c2", reading({ found: false, entities: [] }));
  assert.equal(last().state, "LOOKED_ABSENT");
  w.obs.observeReaderRun("B", "c3", reading(), { readerRegistered: false });
  assert.equal(last().state, "LOOKED_INDETERMINATE");
  // resolution attempts, entities' notice payload (its R13)
  w.obs.observeResolutionAttempt({ captureSha: "c1", bundleId: "B", ref: "k:1", matches: [], considered: "the composite key", resolvedBy: null });
  assert.deepEqual([last().subject_kind, last().subject, last().authority, last().state, last().actor_class], ["reference", "k:1", "c1", "LOOKED_ABSENT", "plane"]);
  assert.match(last().detail, /it tried the composite key/);
  w.obs.observeResolutionAttempt({ captureSha: "c1", ref: "k:2", matches: [{ entity_id: "ENT-1", grade: "B" }], resolvedBy: "member:bob" });
  assert.deepEqual([last().state, last().result_kind, last().result_ref, last().actor_class, last().actor], ["PRESENT", "entity", "ENT-1", "member", "member:bob"]);
  // connection derivations, connections' notice payload (its R3)
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 3, documents: 3, truncated: false, entityKnown: true, assertedBy: "system" });
  assert.deepEqual([last().subject_kind, last().subject, last().authority, last().state, last().actor_class, last().actor], ["entity", "ENT-1", "ENT-1", "PRESENT", "plane", null]);
  assert.match(last().detail, /read 3 document\(s\).*wrote 3 connection/);
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 496, documents: 32, truncated: true, assertedBy: "member:carol" });
  assert.deepEqual([last().state, last().actor], ["partial", "member:carol"]);
  w.obs.observeConnectionDerivation({ entityId: "ENT-2", count: 0, documents: 1, entityKnown: false });
  assert.equal(last().state, "LOOKED_ABSENT"); assert.match(last().detail, /not in the subject registry/);
  // registered on entities' and connections' notices when they exist
  const regs = [];
  const fake = (name) => ({ [name]: (module, fn) => { regs.push([name, module]); fn({ entityId: "ENT-3", count: 0, documents: 0, captureSha: "c9", ref: "k:9", matches: [] }); return { ok: true }; } });
  w.obs.attachMeaning({ entities: fake("onResolveAttempt"), connections: fake("onDerived") });
  assert.deepEqual(regs, [["onResolveAttempt", OBSERVATION_LOG_MODULE], ["onDerived", OBSERVATION_LOG_MODULE]]);
  assert.deepEqual(w.log().slice(-2).map((r) => r.subject_kind), ["reference", "entity"]);
  // the derivation statement connections reads (its R5)
  assert.equal(w.obs.derivationStatementFor("ENT-1").state, "partial");
  assert.equal(w.obs.derivationStatementFor("ENT-9", { enteredAt: "2030-01-01T00:00:00Z" }).derived, "never_derived");
  assert.equal(w.obs.derivationStatementFor("ENT-9", { hasArtifact: true }).derived, "pre_log");
});

test("R6 R7 R8 end to end through extraction's own reading write (its R19, R24): one write records the index row, the content row and the reader run in its transaction, a second reading of the capture is a re-extraction, and the answer is this module's under its name", () => {
  const w = world({ extraction: "module" });
  const [c] = w.doc("INFO-2026-0001", ["agenda text"]);
  const r = reading({ entities: [{ kind: "person", key: "jane", ref: "person:jane" }], page_count: 1, text_chars: 11 });
  const out = w.ex.writeReading({ bundleId: "INFO-2026-0001", captureSha: c, reading: r, author: "member:alice",
    textUnits: [{ extent: { kind: "page", page: 0 }, ref: "p. 1", text: "agenda text" }] });
  assert.deepEqual(out.listeners[OBSERVATION_LOG_MODULE],
    { observed: { written: 1, states: ["PRESENT"], reextraction: false, refused: 0, unclassified: [] } });
  assert.deepEqual(w.log().map((x) => [x.level, x.authority_kind, x.authority, x.subject, x.state, x.result_kind, x.result_ref, x.actor]), [
    ["content", "derive", "INFO-2026-0001", c, "PRESENT", "reading", c, "member:alice"],
    ["content", "extract", "INFO-2026-0001", c, "PRESENT", "reading", c, "member:alice"],
    ["meaning", "derive", "INFO-2026-0001", c, "PRESENT", "reading", c, "member:alice"]]);
  assert.match(w.log()[1].detail, /^first extraction; text over the whole document; tier 1/);
  assert.match(w.log()[2].detail, /found 1 entity reference/);
  // a second reading of the same capture (no units this time) is a re-extraction; its index row says no unit carried text
  const again = w.ex.writeReading({ bundleId: "INFO-2026-0001", captureSha: c, reading: { ...r, at: "2026-09-27T04:00:00Z" } });
  assert.equal(again.listeners[OBSERVATION_LOG_MODULE].observed.reextraction, true);
  assert.deepEqual(w.log().slice(3).map((x) => [x.level, x.authority_kind, x.state, x.actor_class]),
    [["content", "derive", "LOOKED_ABSENT", "plane"], ["content", "extract", "PRESENT", "plane"], ["meaning", "derive", "PRESENT", "plane"]]);
  assert.match(w.log()[4].detail, /^re-extraction; /);
});
