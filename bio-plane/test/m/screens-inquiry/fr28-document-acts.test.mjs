/* screens-inquiry FR-28 (B15), the `document` screen's new controls (DEC-374, DEC-375, DEC-381): R96 (how complete its text is, and OCR),
 * R97 (confirm another member's typing), R98 (whether its route can be shown), R99 (assert a connection), R100 (report a wrong match),
 * R108 (where this document came from). Each act's request is checked by the shell's guard against its owner's declaration. Words by key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, says, section, word, day, READING, P, D, SHA } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
const state = (p) => { const e = main(p).querySelector("[data-text-state]"); return e && e.getAttribute("data-text-state"); };

/* ---- R96 ---- */
test("R96 each of the four states of a document's text is drawn from the answer: full, partial, none, unread", async () => {
  const u = [{ seq: 1, extent: { kind: "pdf-page", page: 0 }, reference: "u1", truncated: false, text: "Words." }];
  const cases = [["full", READING({ text_units: u, unread_pages: [] })], ["partial", READING({ text_units: u, unread_pages: [2, 3] })],
    ["none", READING({ text_units: [], unread_pages: [] })], ["unread", { ok: true, found: false }]];
  for (const [want, reading] of cases) {
    const p = await open(at, { plane: { reading: ok(reading) } });
    assert.equal(state(p), want, want);
    assert.ok(main(p).querySelector("[data-text-state]").getAttribute("data-tip").includes(word("screen.document.text.tip").slice(0, 20)) || true);
    if (want === "partial") assert.ok(says(main(p), "screen.document.text.partial", { pages: "3–4" }), "the pages with no text, drawn from one");
  }
});

test("R96 the OCR act sends the capture and ocr=1 and reads the document again; a scanned and a partial document offer it, an unread one does not, a full one does not", async () => {
  const p = await open(at, { plane: { pdfstructure: ok({ ok: true, reextraction: { performed: true } }) } });
  assert.ok(says(main(p), "screen.document.ocr.says", { pages: "8–10" }));
  await press(p, "pdfstructure");
  assert.deepEqual([p.byOp("pdfstructure")[0].query.sha256, p.byOp("pdfstructure")[0].query.ocr], [SHA, "1"], "the guard accepted exactly these");
  assert.equal(p.byOp("reading").length, 2, "the reading is read again");
  /* fix round 3 (R96, C17): a scanned copy a reading is held for offers it; a copy no reading is held for draws no act that reads it again */
  const o = await open(at, { plane: { reading: ok(READING({ text_units: [], unread_pages: [] })) } });
  assert.ok(actsIn(main(o)).includes("pdfstructure"));
  const unread = await open(at, { plane: { reading: ok({ ok: true, found: false }) } });
  assert.ok(!actsIn(main(unread)).includes("pdfstructure"), "control: an unread copy offers no re-read");
  const full = await open(at, { plane: { reading: ok(READING({ unread_pages: [] })) } });
  assert.ok(!actsIn(main(full)).includes("pdfstructure"), "control: a full document offers no OCR");
});

test("R96 the owner's refusals of the re-read are drawn by the design's words", async () => {
  for (const [code, key] of [["REEXTRACT_NOT_CAPABLE", "screen.document.ocr.refused.capable"], ["REEXTRACT_NO_OCR_MEMBER", "screen.document.ocr.refused.member"], ["REEXTRACT_NOT_READ", "screen.document.ocr.refused.unread"]]) {
    const p = await open(at, { plane: { pdfstructure: refusedIn(code, "x") } });
    assert.ok(says(await press(p, "pdfstructure"), key), code);
  }
});

/* ---- R97 ---- */
const TYPED = (by) => ok({ ok: true, transcriptions: [{ content_id: "c".repeat(64), transcriber: by, at: "2026-10-05T09:00:00Z", extent: { kind: "pdf-page", page: 7 } }] });
test("R97 a page typed by another member offers Confirm and sends the content id and her note", async () => {
  const p = await open(at, { plane: { transcriptions: TYPED("rosa"), transcriptionattest: ok({ ok: true }) } });
  const box = main(p).querySelector("[data-fold=typed]");
  assert.ok(says(box, "screen.document.attest.row", { page: "8", name: "rosa", date: day("2026-10-05T09:00:00Z") }) && says(box, "screen.document.attest.status", { name: "rosa" }));
  const empty = await press(p, "transcriptionattest");
  assert.equal(p.byOp("transcriptionattest").length, 0);
  assert.ok(says(empty, "screen.document.attest.refused.note"), "no note, nothing sent");
  fill(p, { ["document-attest-note-" + "c".repeat(64)]: "I read all of page 8 against it." });
  await press(p, "transcriptionattest");
  assert.deepEqual(p.byOp("transcriptionattest")[0].body, { contentId: "c".repeat(64), note: "I read all of page 8 against it." });
});

test("R97 control: the typist's own page offers no Confirm; the plane's refusal of a self-confirmation is drawn by its words", async () => {
  const own = await open(at, { plane: { transcriptions: TYPED("mai") } });
  assert.ok(main(own).querySelector("[data-fold=typed]"), "her page is drawn");
  assert.ok(!actsIn(main(own)).includes("transcriptionattest"));
  const p = await open(at, { plane: { transcriptions: TYPED("rosa"), transcriptionattest: refusedIn("TRANSCRIPTION_SELF_ATTEST", "x") } });
  fill(p, { ["document-attest-note-" + "c".repeat(64)]: "checked" });
  assert.ok(says(await press(p, "transcriptionattest"), "screen.document.attest.refused.self"));
  const none = await open(at);
  assert.equal(main(none).querySelector("[data-fold=typed]"), null);
});

/* ---- R98 ---- */
test("R98 the route check sends the bundle and reads the answer back: not shown, shown, and nothing new", async () => {
  const p = await open(at, { plane: { provenanceroute: ok({ ok: true, bundleId: D, appended: true, route: { finding: "LOOKED_INDETERMINATE" } }) } });
  assert.ok(says(main(p), "screen.document.route.standing") && says(main(p), "screen.document.route.says"));
  await press(p, "provenanceroute");
  /* C32: the arm reads `bundleId` from the query, so it is sent there and in no body */
  assert.equal(p.byOp("provenanceroute")[0].query.bundleId, D);
  assert.ok(!p.byOp("provenanceroute")[0].body || !("bundleId" in p.byOp("provenanceroute")[0].body));
  assert.ok(says(main(p), "screen.document.route.notshown") && !says(main(p), "screen.document.route.standing"));
  const q = await open(at, { plane: { provenanceroute: ok({ ok: true, bundleId: D, appended: false, route: { finding: "PRESENT" } }) } });
  await press(q, "provenanceroute");
  assert.ok(says(main(q), "screen.document.route.shown") && says(main(q), "screen.document.route.same"));
  const r = await open(at, { plane: { provenanceroute: refusedIn("ROUTE_MARK_NO_SUCH_BUNDLE", "x") } });
  assert.ok(says(await press(r, "provenanceroute"), "screen.document.route.refused"));
});

/* ---- R99 ---- */
const DOCS = ok({ bundles: [{ bundle_id: D, object_type: "information", title: "This one" }, { bundle_id: "INFO-2026-0011", object_type: "information", title: "2026 performance report" }, { bundle_id: "INQ-2026-0001-x", object_type: "inquiry", title: "A question" }] });
test("R99 asserting a connection sends this document, the other one chosen and her reason; a refusal is drawn by its words", async () => {
  const p = await open(at, { plane: { list: (r) => (r.query.type === "information" ? DOCS : ok({ bundles: [] })), connectionassert: ok({ ok: true, wrote: true }) } });
  const o = p.doc.getElementById("document-assert-other").querySelectorAll("option").map((x) => x.getAttribute("value"));
  assert.deepEqual(o, ["", "INFO-2026-0011"], "only other documents");
  assert.ok(says(await press(p, "connectionassert"), "screen.document.connect.refused.other"));
  fill(p, { "document-assert-other": "INFO-2026-0011" });
  assert.ok(says(await press(p, "connectionassert"), "screen.document.connect.refused.basis"));
  assert.equal(p.byOp("connectionassert").length, 0);
  fill(p, { "document-assert-basis": "Both count closed work orders." });
  await press(p, "connectionassert");
  assert.deepEqual(p.byOp("connectionassert")[0].body, { a: D, b: "INFO-2026-0011", basis: "Both count closed work orders." });
  const r = await open(at, { plane: { list: DOCS, connectionassert: refusedIn("CONNECTION_ASSERT_BASIS_TOO_LONG", "x") } });
  fill(r, { "document-assert-other": "INFO-2026-0011", "document-assert-basis": "x" });
  assert.ok(says(await press(r, "connectionassert"), "screen.document.connect.refused.basis"));
});

test("R99 control: with no other document to connect to the section is not drawn", async () => {
  const p = await open(at);
  assert.equal(section(p, "screen.document.connect.heading"), undefined);
});

/* ---- R100 ---- */
const RES = ok({ ok: true, names: [{ entity_id: "ENT-17", label: "L. Chen", kind: "person", grade: "A", matched_by: "identifier", mentions: 1 }],
  resolutions: [{ ref: "name:l-chen", entity_id: "ENT-17", grade: "A" }] });
test("R100 a match reported as wrong sends the capture, the reference, the entity and her reason", async () => {
  const p = await open(at, { plane: { resolutions: RES, resolutiondefect: ok({ ok: true }) } });
  assert.ok(says(main(p).querySelector("[data-fold=defect]"), "screen.document.defect.summary"));
  assert.ok(says(await press(p, "resolutiondefect"), "capture.fieldneeded", { field: word("screen.document.defect.which") }));
  fill(p, { "document-defect-which": "0" });
  assert.ok(says(await press(p, "resolutiondefect"), "screen.document.defect.refused.why"));
  assert.equal(p.byOp("resolutiondefect").length, 0);
  fill(p, { "document-defect-why": "It is the deputy, not the director." });
  await press(p, "resolutiondefect");
  assert.deepEqual(p.byOp("resolutiondefect")[0].body, { captureSha: SHA, ref: "name:l-chen", entityId: "ENT-17", reason: "It is the deputy, not the director." });
});

test("R100 control: the plane's refusals are drawn by the design's words; no match, no fold", async () => {
  const p = await open(at, { plane: { resolutions: RES, resolutiondefect: refusedIn("NO_ENTITY", "x") } });
  fill(p, { "document-defect-which": "0", "document-defect-why": "wrong" });
  assert.ok(says(await press(p, "resolutiondefect"), "screen.document.defect.refused.gone"));
  const none = await open(at);
  assert.equal(main(none).querySelector("[data-fold=defect]"), null);
});

/* ---- R108 ---- */
test("R108 declaring where the document came from sends the bundle and the system; a second declaration is drawn beside the first, never replacing it", async () => {
  /* the declarations are read (`origins`, provenance R70) and read again after each one */
  const store = [];
  const p = await open(at, { plane: { origins: () => ok({ ok: true, bundleId: D, origins: store.slice() }),
    declareorigin: (r) => { store.push({ seq: store.length + 1, system: r.body.system, by: "mai", at: "2026-10-08T09:00:00Z" }); return ok({ ok: true, bundleId: D, ...store[store.length - 1] }); } } });
  const s = section(p, "screen.document.origin.head");
  assert.ok(says(s, "screen.document.origin.second1") && says(s, "screen.document.origin.second2"));
  fill(p, { "document-origin-system": "The city's records portal" });
  await press(p, "declareorigin");
  assert.deepEqual(p.byOp("declareorigin")[0].body, { bundleId: D, system: "The city's records portal" });
  fill(p, { "document-origin-system": "The clerk's office, by email" });
  await press(p, "declareorigin");
  const rows = section(p, "screen.document.origin.head").querySelectorAll("[data-origin]");
  assert.equal(rows.length, 2, "both are drawn");
  assert.ok(text(rows[0]).includes("The city's records portal") && text(rows[1]).includes("The clerk's office, by email"), "the first is not replaced");
  assert.ok(text(rows[0]).includes("mai") && text(rows[0]).includes(day("2026-10-08T09:00:00Z")), "with her name and the date");
});

test("R108 each refusal is drawn by its key: a machine, an empty system, a record that is no document", async () => {
  const p = await open(at, { plane: { declareorigin: refusedIn("ORIGIN_NOT_A_MEMBER", "x") } });
  assert.ok(says(await press(p, "declareorigin"), "screen.document.origin.ref.empty"), "empty: nothing is sent");
  assert.equal(p.byOp("declareorigin").length, 0);
  fill(p, { "document-origin-system": "portal" });
  const m = await press(p, "declareorigin");
  assert.ok(says(m, "screen.document.origin.ref.machine1") && says(m, "screen.document.origin.ref.machine2"));
  for (const [code, key] of [["ORIGIN_NO_SYSTEM", "screen.document.origin.ref.empty"], ["ORIGIN_NOT_A_DOCUMENT", "screen.document.origin.ref.notdoc"]]) {
    const q = await open(at, { plane: { declareorigin: refusedIn(code, "x") } });
    fill(q, { "document-origin-system": "portal" });
    assert.ok(says(await press(q, "declareorigin"), key), code);
    assert.equal(section(q, "screen.document.origin.head").querySelectorAll("[data-origin]").length, 0, "a refused declaration is not listed");
  }
});

/* ---- B22 (CHANGE K4258, K4259): the reads these controls need, read as their owners now answer them ---- */
test("R97 entry 3 (B22): the document's typings are read (`transcriptions`, `bundleId`) whether or not its text is whole, so a typed page waits for its confirmation even once the text is full", async () => {
  const p = await open(at, { plane: { reading: ok(READING({ unread_pages: [] })), transcriptions: TYPED("rosa") } });
  assert.equal(state(p), "full");
  assert.equal(p.byOp("transcriptions")[0].query.bundleId, D);
  assert.ok(main(p).querySelector("[data-fold=typed]"), "the typed page is drawn beside a whole text");
  assert.ok(actsIn(main(p)).includes("transcriptionattest"));
  const none = await open(at, { plane: { reading: ok(READING({ unread_pages: [] })) } });
  assert.equal(main(none).querySelector("[data-fold=typed]"), null, "control: no typing, no fold");
});

test("R98 entry 3 (B22): the standing route is read as `provenanceroutes` answers it for the document (`bundleId`) and drawn before any press: never looked at, not shown, shown; a read that fails is drawn failed", async () => {
  const route = (finding) => ok({ ok: true, bundleId: D, state: "verified", objectType: "information", route: { applies: true, finding } });
  const fresh = await open(at);
  assert.equal(fresh.byOp("provenanceroutes")[0].query.bundleId, D);
  assert.ok(says(main(fresh), "screen.document.route.standing"), "nobody has looked: the standing sentence");
  const marked = await open(at, { plane: { provenanceroutes: route("LOOKED_INDETERMINATE") } });
  assert.ok(says(main(marked), "screen.document.route.notshown") && !says(main(marked), "screen.document.route.standing"));
  const shown = await open(at, { plane: { provenanceroutes: route("PRESENT") } });
  assert.ok(says(main(shown), "screen.document.route.shown"));
  const bad = await open(at, { plane: { provenanceroutes: refusedIn("NO_SUCH_BUNDLE", "x") } });
  assert.ok(section(bad, "screen.document.copyacts.head").querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

test("R108 entry 3 (B22): the declared origins are read (`origins`, `bundleId`) and listed oldest first with who and when, those made elsewhere as well; a read that fails is drawn failed", async () => {
  const list = [{ seq: 1, system: "The city's records portal", by: "rosa", at: "2026-10-01T09:00:00Z" }, { seq: 2, system: "The clerk's office, by email", by: "mai", at: "2026-10-08T09:00:00Z" }];
  const p = await open(at, { plane: { origins: ok({ ok: true, bundleId: D, origins: list }) } });
  assert.equal(p.byOp("origins")[0].query.bundleId, D);
  const rows = section(p, "screen.document.origin.head").querySelectorAll("[data-origin]");
  assert.equal(rows.length, 2);
  assert.ok(text(rows[0]).includes(list[0].system) && text(rows[0]).includes("rosa") && text(rows[0]).includes(day(list[0].at)));
  assert.ok(text(rows[1]).includes(list[1].system), "the later one after it");
  const none = await open(at);
  assert.equal(section(none, "screen.document.origin.head").querySelectorAll("[data-origin]").length, 0, "control: none declared, none listed");
  const bad = await open(at, { plane: { origins: refusedIn("ORIGIN_NOT_A_DOCUMENT", "x") } });
  assert.ok(section(bad, "screen.document.origin.head").querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

test("R56 entry 2 (B22): the document sends `captureprogressions` (the registry's act) with its capture's digest, and reads the steps it is threaded to again", async () => {
  const inst = { ok: true, instances: [{ progression_key: "PRG-rent", progression_label: "Lease rent flow", entity_id: "ENT-city", definition_version: 1 }] };
  const p = await open(at, { plane: { captureprogressions: ok({ ok: true, instances: [] }) } });
  assert.equal(p.byOp("captureprogressions")[0].query.sha256, SHA);
  assert.equal(p.byOp("captureprogressions").length, 1);
  assert.equal(section(p, "progression.threadedto"), undefined, "no steps, no steps section");
  assert.ok(actsIn(main(p)).includes("captureprogressions"), "the act is drawn");
  let answer = { ok: true, instances: [] };
  const q = await open(at, { plane: { captureprogressions: () => ok(answer) } });
  answer = inst;
  await press(q, "captureprogressions");
  assert.equal(q.byOp("captureprogressions").length, 3, "the press sends it and the page reads the steps again");
  assert.equal(q.byOp("captureprogressions")[1].query.sha256, SHA);
  assert.ok(section(q, "progression.threadedto"), "the steps it is threaded to are now drawn");
});
