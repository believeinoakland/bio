/* extraction: the converts of four legacy suites' extraction shares (`build/jobs/T17/legacy-tests.md`'s rows for
   `test/reading-position-occurrences.test.mjs`, `test/reading-position.test.mjs`, `test/observation-content.test.mjs`
   and `test/testify.test.mjs`), at the module's interface: the promotion step this module registers (R20) standing for
   `op=promote`, `writeReading`'s projection (R19), `op=readingref` (R28) through `extractionOps`, the R24 and R62
   notices, `unitsOf` (R36) and `indexTestimony` (R61). The old suites were deleted in T20 (K931); their other modules' shares
   are those modules'. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fresh, bundle } from "./fixture.mjs";
import { extractionOps } from "../../../src/extraction/index.mjs";
import { readingSourceJson, readingOccurrenceKey, readingSourceFromColumns } from "../../../src/textchain.mjs";

const sha = (v) => createHash("sha256").update(v).digest("hex");
const NOW = "2026-09-25T00:00:00Z";
const pg = (n) => ({ kind: "pdf-page", ref: `p.${n}`, page: n - 1, rect: null });
const ORD = { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" };
const provFile = (docs) => ({ path: "data/provenance.json", text: JSON.stringify({ documents: docs }) });
const agenda = (entities, extra = {}) => ({ content_type: "meeting_agenda", reader_version: 1, found: entities.length > 0,
  at: NOW, entities, facts: {}, text_source: [{ step: "layer" }], ...extra });
/* op=promote's projection: the step this module registered with promotion (R20). */
const promote = (w, bundleId, docs, author = "member:ines") => { bundle(w.s, bundleId); return w.prom.steps[0].project({ bundleId, author, files: [provFile(docs)] }); };
const readingDoc = (captureSha, reading) => ({ capture: { sha256: captureSha, encoding: "binary", bytes: 10 }, reading });
const op = (w, name, qs) => extractionOps(w.x, new URL(`http://x/${name}?${qs}`), {}, {})[name]();

/* ---- converted from reading-position-occurrences.test.mjs §1 and §4 (D-454) ---- */
test("R19 R20 R28 (reading-position-occurrences §1, §4): one row per distinct place; a place read twice is one row and every unplaced read one unplaced row; op=readingref lists every place in reading order, a document read once in the old shape; a re-read replaces the places", () => {
  const w = fresh();
  const SA = sha("d454-A"), SB = sha("d454-B"), SD = sha("d454-D");
  promote(w, "INFO-2026-8801-o", [readingDoc(SA, agenda([{ ...ORD, source: pg(3), occurrences: [pg(3), pg(9), pg(14)] }]))]);
  promote(w, "INFO-2026-8802-o", [readingDoc(SB, agenda([{ ...ORD, source: pg(5) }]))]);
  promote(w, "INFO-2026-8803-o", [readingDoc(SD, agenda([{ ...ORD, source: pg(4), occurrences: [pg(4), pg(4), null, null] }]))]);
  const rows = (s) => w.rows(`SELECT pos_ref, occurrence, seq FROM reading_refs WHERE capture_sha=? AND ref=? ORDER BY seq`, s, ORD.ref)
    .map((r) => [r.pos_ref, r.occurrence, r.seq]);
  const key = (n) => readingOccurrenceKey(pg(n));
  assert.deepEqual(rows(SA), [["p.3", key(3), 0], ["p.9", key(9), 1], ["p.14", key(14), 2]]);
  assert.deepEqual(rows(SB), [["p.5", key(5), 0]]);
  assert.deepEqual(rows(SD), [["p.4", key(4), 0], [null, "", 1]], "p.4 read twice is one row; the two unplaced reads one unplaced row");
  const doc = (s, bundleId, position, occurrences) => ({ capture_sha: s, bundle_id: bundleId, ref: ORD.ref, kind: ORD.kind, key: ORD.key,
    label: ORD.label, content_type: "meeting_agenda", position, ...(occurrences ? { occurrences } : {}) });
  const rr = op(w, "readingref", `ref=${encodeURIComponent(ORD.ref)}&viewer=class:member`);
  assert.deepEqual(rr, { ok: true, ref: ORD.ref, count: 3, limit: 200, truncated: false, documents: [
    doc(SA, "INFO-2026-8801-o", pg(3), [pg(3), pg(9), pg(14)]),
    doc(SB, "INFO-2026-8802-o", pg(5)),
    doc(SD, "INFO-2026-8803-o", pg(4), [pg(4), null]),
  ] });
  assert.equal("occurrences" in rr.documents[1], false, "read once: a position and no occurrences key");
  /* §4: a re-read that no longer reads p.9 leaves no p.9 row; the rest keep reading order */
  promote(w, "INFO-2026-8801-o", [readingDoc(SA, agenda([{ ...ORD, source: pg(3), occurrences: [pg(3), pg(14)] }]))]);
  assert.deepEqual(rows(SA), [["p.3", key(3), 0], ["p.14", key(14), 1]]);
  assert.deepEqual(op(w, "readingref", `ref=${encodeURIComponent(ORD.ref)}&viewer=class:member`).documents[0].occurrences, [pg(3), pg(14)]);
});

/* ---- converted from reading-position-occurrences.test.mjs §5 (M-155): no numbered requirement; carried under R58's columns ---- */
test("R58 R28 (reading-position-occurrences §5, M-155): a reading_refs table in the pre-occurrence shape is copied forward by migrate, every row kept byte for byte at seq 0 with its occurrence from its own position, keyed (capture_sha, ref, occurrence), both lookup indexes on the new table, no interim table; the pre-position shape too, every row unplaced", () => {
  const w = fresh();
  const SA = sha("m155-A"), SB = sha("m155-B"), SC = sha("m155-C");
  promote(w, "INFO-2026-8811-o", [readingDoc(SA, agenda([{ ...ORD, source: pg(3), occurrences: [pg(3), pg(9)] }, { ref: "file:26-0910", kind: "file", key: "26-0910", label: null, source: pg(2) }]))]);
  promote(w, "INFO-2026-8812-o", [readingDoc(SB, agenda([{ ...ORD, source: pg(5) }]))]);
  promote(w, "INFO-2026-8813-o", [readingDoc(SC, agenda([{ ...ORD }]))]);
  const COLS9 = "capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref";
  const plain = (rs) => rs.map((r) => ({ ...r }));
  /* the pre-D-454 store held one row per (capture, ref): the first read. Re-create exactly that, from FW-17's DDL. */
  const before = plain(w.rows(`SELECT ${COLS9} FROM reading_refs WHERE seq=0 ORDER BY capture_sha, ref`));
  w.s.db.exec("DROP TABLE reading_refs");
  w.s.db.exec(`CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
    ref_kind TEXT, ref_key TEXT, label TEXT, pos_kind TEXT, pos TEXT, pos_ref TEXT, PRIMARY KEY (capture_sha, ref))`);
  w.s.db.exec("CREATE INDEX reading_refs_ref ON reading_refs(ref)");
  w.s.db.exec("CREATE INDEX reading_refs_bundle ON reading_refs(bundle_id)");
  const ins = w.s.db.prepare("INSERT INTO reading_refs VALUES (?,?,?,?,?,?,?,?,?)");
  for (const r of before) ins.run(...COLS9.split(",").map((c) => r[c]));
  assert.ok(before.length >= 4 && before.some((r) => r.pos_kind === null) && before.some((r) => r.pos_kind !== null), "the fixture holds placed and unplaced rows");
  w.x.migrate();
  const after = plain(w.rows(`SELECT ${COLS9},occurrence,seq FROM reading_refs ORDER BY capture_sha, ref`));
  assert.deepEqual(after.map(({ occurrence, seq, ...r }) => r), before, "every row kept, its own columns unchanged");
  assert.deepEqual(after.map((r) => [r.seq, r.occurrence]),
                   before.map((r) => [0, r.pos_kind && r.pos ? `${r.pos_kind}:${r.pos}` : ""]));
  assert.deepEqual(after.filter((r) => r.pos).map((r) => r.occurrence), after.filter((r) => r.pos).map((r) => readingOccurrenceKey(readingSourceFromColumns(r.pos_kind, r.pos, r.pos_ref))),
                   "the occurrence is the rule readingOccurrenceKey states");
  const shape = () => ({
    pk: w.rows("PRAGMA table_info(reading_refs)").filter((r) => r.pk > 0).sort((x, y) => x.pk - y.pk).map((r) => r.name),
    idx: w.rows("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='reading_refs' AND name LIKE 'reading_refs_%' ORDER BY name").map((r) => r.name),
    interim: w.one("SELECT count(*) AS c FROM sqlite_master WHERE name='reading_refs_preoccurrence'").c });
  assert.deepEqual(shape(), { pk: ["capture_sha", "ref", "occurrence"], idx: ["reading_refs_bundle", "reading_refs_ref"], interim: 0 });
  const rr = op(w, "readingref", `ref=${encodeURIComponent(ORD.ref)}&viewer=class:member`);
  assert.deepEqual(rr.documents.map((d) => [d.capture_sha, d.position, "occurrences" in d]).sort(),
                   [[SA, pg(3), false], [SB, pg(5), false], [SC, null, false]].sort(), "the store serves after the migration, the first read each");
  /* the pre-FW-17 shape: no position columns; every row copied forward unplaced */
  const older = plain(w.rows(`SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label FROM reading_refs WHERE seq=0 ORDER BY capture_sha, ref`));
  w.s.db.exec("DROP TABLE reading_refs");
  w.s.db.exec(`CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
    ref_kind TEXT, ref_key TEXT, label TEXT, PRIMARY KEY (capture_sha, ref))`);
  const ins6 = w.s.db.prepare("INSERT INTO reading_refs VALUES (?,?,?,?,?,?)");
  for (const r of older) ins6.run(r.capture_sha, r.bundle_id, r.ref, r.ref_kind, r.ref_key, r.label);
  w.x.migrate();
  const got = plain(w.rows(`SELECT capture_sha,bundle_id,ref,ref_kind,ref_key,label,pos_kind,pos,pos_ref,occurrence,seq FROM reading_refs ORDER BY capture_sha, ref`));
  assert.deepEqual(got, older.map((r) => ({ ...r, pos_kind: null, pos: null, pos_ref: null, occurrence: "", seq: 0 })));
  assert.deepEqual(shape(), { pk: ["capture_sha", "ref", "occurrence"], idx: ["reading_refs_bundle", "reading_refs_ref"], interim: 0 });
});

/* ---- converted from reading-position.test.mjs §8 (FW-17) ---- */
test("R28 R19 R27 (reading-position §8): the reading keeps the position the reader emitted and a reading with none still writes; op=readingref projects the placed position and, for the unplaced one, a null position beside a reference that is fully there", () => {
  const w = fresh();
  const P2 = { kind: "pdf-page", ref: "p.2", page: 1, rect: null }, P8 = { kind: "pdf-page", ref: "p.8", page: 7, rect: null };
  const A = sha("f17-doc-A"), B = sha("f17-doc-B"), C = sha("f17-doc-C");
  const ent = (label, source) => ({ ref: ORD.ref, kind: ORD.kind, key: ORD.key, label, ...(source ? { source } : {}) });
  promote(w, "INFO-2026-7301-f17", [readingDoc(A, agenda([ent("Ordinance No. 13579", P2)]))]);
  promote(w, "INFO-2026-7302-f17", [readingDoc(B, agenda([ent("Ord. No. 13,579", P8)]))]);
  promote(w, "INFO-2026-7303-f17", [readingDoc(C, agenda([ent("Ordinance 13579")]))]);
  const readA = op(w, "reading", `sha256=${A}&viewer=class:member`), readC = op(w, "reading", `sha256=${C}&viewer=class:member`);
  assert.deepEqual([readA.ok, readA.reading.entities[0].source], [true, P2], "the reading keeps the position");
  assert.deepEqual([readC.ok, readC.found, readC.reading.entities[0].ref, "source" in readC.reading.entities[0]], [true, true, ORD.ref, false]);
  const rc = w.one(`SELECT pos_kind, pos, pos_ref, occurrence, seq, label FROM reading_refs WHERE capture_sha=?`, C);
  assert.deepEqual({ ...rc }, { pos_kind: null, pos: null, pos_ref: null, occurrence: "", seq: 0, label: "Ordinance 13579" }, "none of the three, not the whole document");
  assert.equal(w.one(`SELECT pos FROM reading_refs WHERE capture_sha=?`, A).pos, readingSourceJson(P2));
  const idx = op(w, "readingref", `ref=${encodeURIComponent(ORD.ref)}&viewer=class:member`);
  const by = Object.fromEntries(idx.documents.map((d) => [d.capture_sha, d]));
  assert.equal(idx.count, 3);
  assert.deepEqual(by[A].position, P2);
  assert.deepEqual(by[B].position, P8);
  assert.deepEqual(by[C], { capture_sha: C, bundle_id: "INFO-2026-7303-f17", ref: ORD.ref, kind: ORD.kind, key: ORD.key,
                            label: "Ordinance 13579", content_type: "meeting_agenda", position: null });
});

/* ---- converted from observation-content.test.mjs §C, §D, §F (REC-94): the reading written at promote and what a listener is handed ---- */
test("R20 R19 R24 R36 R23 R21 (observation-content §C, §D, §F): each promoted reading is written and handed to the observer with its bundle, capture, reading, both chains, units before, index outcome and author; a promote with no reading hands nothing; a moved chain is handed before and after and the earlier reading is kept; unitsOf answers none for a capture read without units and null for one never read", () => {
  const w = fresh();
  const heard = [];
  assert.equal(w.x.onReading("observation-log", (e) => { heard.push(structuredClone(e)); return { observed: 1 }; }).ok, true);
  const whole1 = [{ step: "layer", tier: 1, container: "pdf" }];
  const mixed = [{ step: "layer", tier: 1, container: "pdf", extent: { kind: "pages", pages: [0, 1] } },
                 { step: "pixels", cap: "C", extent: { kind: "pages", pages: [2] } },
                 { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" }, extent: { kind: "pages", pages: [2] } }];
  const readingOf = (over) => ({ content_type: "meeting_calendar", reader_version: 1, read_from_text: true, found: false, entities: [],
                                 facts: {}, at: "2026-09-15T09:00:00Z", text_container: "pdf", ...over });
  const S = { whole: "a".repeat(64), short: "b".repeat(64), notext: "c".repeat(64), unread: "d".repeat(64) };
  const R = { whole: readingOf({ text_source: whole1, text_tier: 1 }),
              short: readingOf({ text_source: whole1, text_tier: 1, tier3_candidate: true }),
              notext: readingOf({ read_from_text: false, text_source: whole1, text_tier: 1 }) };
  const AUTHOR = "token:admin";
  for (const k of ["whole", "short", "notext"]) promote(w, `INF-2026-0915-${k}`, [readingDoc(S[k], R[k])], AUTHOR);
  /* a capture held, nothing ever tried to read: no reading in its document, and a promote with no provenance file at all */
  promote(w, "INF-2026-0915-unread", [{ capture: { sha256: S.unread, encoding: "binary", bytes: 10 } }], AUTHOR);
  assert.equal(w.prom.steps[0].project({ bundleId: "INF-2026-0915-unread", author: AUTHOR, files: [] }), null);
  assert.deepEqual(heard.map((e) => e.captureSha), [S.whole, S.short, S.notext], "no reading, no notice");
  for (const [i, k] of ["whole", "short", "notext"].entries()) {
    const e = heard[i];
    assert.deepEqual(Object.keys(e).sort(), ["author", "bundleId", "captureSha", "chainAfter", "chainBefore", "indexed", "reading", "unitsBefore"]);
    assert.deepEqual([e.bundleId, e.captureSha, e.author, e.chainBefore, e.unitsBefore], [`INF-2026-0915-${k}`, S[k], AUTHOR, null, null],
                     "the first extraction: no chain and no index before");
    assert.deepEqual(e.reading, R[k], "the reading exactly as promoted, tier3_candidate and read_from_text included");
    assert.deepEqual(e.chainAfter, whole1);
    assert.deepEqual([e.indexed.offered, e.indexed.written, e.indexed.over_bound, e.indexed.unaddressable, e.indexed.state], [0, 0, 0, 0, "none"]);
    assert.deepEqual(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, S[k]).reading), R[k]);
    const o = w.x.readingFor(S[k], "class:member").origin;
    assert.deepEqual([o.state, o.asserted_by, o.standing], ["asserted", AUTHOR, "machine"], "the caller's reading, the machine credential named");
  }
  assert.equal(w.one(`SELECT found FROM readings WHERE capture_sha=?`, S.notext).found, 0, "a failed reading is recorded, never withheld");
  assert.deepEqual(w.x.readingFor(S.unread), { ok: true, found: false, capture_sha: S.unread, reading: null });
  /* §D: the index axis's inputs */
  const u = w.x.unitsOf(S.whole);
  assert.deepEqual([u.state, u.units, u.counts.offered, u.counts.written], ["none", [], 0, 0], "read, no unit offered: none, determined");
  assert.deepEqual(w.x.unitsOf(S.unread), { capture_sha: S.unread, units: [], state: null }, "never indexed");
  /* §F: the chain moved; the listener is handed both chains, and the history appends */
  const moved = readingOf({ text_source: mixed, text_tier: 3, page_count: 3 });
  heard.length = 0;
  const out = promote(w, "INF-2026-0915-short", [readingDoc(S.short, moved)], AUTHOR);
  assert.equal(out, null);
  assert.equal(heard.length, 1);
  assert.deepEqual([heard[0].chainBefore, heard[0].chainAfter, heard[0].unitsBefore, heard[0].reading], [whole1, mixed, [], moved]);
  const f = w.x.readingFor(S.short, "class:member");
  assert.deepEqual(f.reading, moved);
  assert.equal(f.reading_history.kept, 2, "the earlier reading kept, not rewritten");
  assert.deepEqual(w.rows(`SELECT reading FROM reading_history WHERE capture_sha=? ORDER BY seq`, S.short).map((r) => JSON.parse(r.reading)), [R.short, moved]);
});

/* ---- converted from testify.test.mjs §1, §3 (MK-1): the observation's words as its capture's own text ---- */
test("R61 R62 R36 (testify §1, §3): an authored observation's words are its capture's one whole unit, found by the text index; two members' identical words under two captures are two indexed captures, the second moving nothing of the first; no reading, reference or reader stands behind either", () => {
  const w = fresh();
  const WORDS = "On 10 September at the Clerk's counter I watched the deputy clerk stamp the amended "
              + "contract RECEIVED before the council had voted on it. I was the next person in line.";
  const canon = (id) => `bio-testimony/1\nid: ${id}\nobserved_at: 2026-09-10\n\n${WORDS}`;
  const OBS = "INFO-2026-0001-observation", DUP = "INFO-2026-0002-observation";
  const OSHA = sha(canon(OBS)), DSHA = sha(canon(DUP));
  bundle(w.s, OBS); bundle(w.s, DUP);
  const notices = [];
  assert.equal(w.x.onIndexed("observation-log", (e) => { notices.push(e); return null; }).ok, true);
  const a = w.core.transact(() => w.x.indexTestimony({ bundleId: OBS, captureSha: OSHA, words: WORDS, author: "member:ruth" }));
  const ruthBefore = w.x.unitsOf(OSHA);
  const b = w.core.transact(() => w.x.indexTestimony({ bundleId: DUP, captureSha: DSHA, words: WORDS, author: "member:sam" }));
  for (const [s, x] of [[OSHA, a], [DSHA, b]]) {
    assert.deepEqual([x.offered, x.written, x.truncated, x.over_bound, x.unaddressable], [1, 1, 0, 0, 0]);
    const u = w.x.unitsOf(s);
    assert.equal(u.state, "whole");
    assert.deepEqual(u.units.map((v) => [v.extent, v.text, v.seq, v.truncated]), [[{ kind: "document" }, WORDS, 0, false]], "the words, not the header");
  }
  assert.deepEqual(w.x.unitsOf(OSHA), ruthBefore, "indexing sam's capture moves nothing of ruth's");
  const hits = w.rows(`SELECT c.capture_sha, c.bundle_id FROM capture_text_fts f JOIN capture_text c ON c.rowid = f.rowid
                        WHERE capture_text_fts MATCH 'deputy' ORDER BY c.bundle_id`).map((r) => [r.bundle_id, r.capture_sha]);
  assert.deepEqual(hits, [[OBS, OSHA], [DUP, DSHA]], "both found by the same words");
  assert.deepEqual(notices, [{ bundleId: OBS, captureSha: OSHA, indexed: a, author: "member:ruth", container: "document" },
                             { bundleId: DUP, captureSha: DSHA, indexed: b, author: "member:sam", container: "document" }]);
  /* no reader ran over the words: nothing for the connection axis to stand on */
  for (const s of [OSHA, DSHA]) {
    assert.deepEqual(w.x.readingFor(s), { ok: true, found: false, capture_sha: s, reading: null });
    assert.equal(w.x.readingOf(s), null);
    assert.equal(w.rows(`SELECT * FROM reading_refs WHERE capture_sha=?`, s).length, 0);
  }
  assert.deepEqual([...w.x.capturesReadFor(OBS)], []);
});
