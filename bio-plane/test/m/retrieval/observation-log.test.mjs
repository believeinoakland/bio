/* retrieval: its share of the old battery's `test/observation-log.test.mjs`, at the module's interface.
 *
 * Converted: §D (a member's ad hoc search writes no observation row) as R32 over every read this module answers —
 * search, meaningRows, the frontier, contentAxis, the projection and the selections; §E5/E5b (each level the frontier
 * reads is built and says so) as R35/R36; and §M9c–f (D-516, the watermark band) as what retrieval's readers answer for a
 * subject that entered in the clock second immediately before the level's first row: the document, content and meaning
 * frontiers (R41, R43, R46), contentAxis (R24) and the passage tally (R14). The rule itself (`enteredAfterFirstRow`,
 * `missingCause`, the cause words and sets) is observation-log's and is tested there; here the readers are asked what
 * they publish around it. The band is placed exactly: `register.registered` is the module clock's whole second, and the
 * level's first row is written one second after it, so no clock luck is involved. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, VOCAB, T0 } from "./fixture.mjs";
import { causesNotRuledOut } from "../../../src/observation-log/index.mjs";

const BAND = "watermark_band";
const REG = "2026-09-27T03:00:00Z";             /* the band capture's registration second */
const FIRST = "2026-09-27T03:00:01Z";           /* each level's first row: one second after it */
const BEFORE = "2026-09-27T02:59:59Z";          /* a registration more than the watermark's second before it */

function link(w, fromCapture, address, firstSeen) {
  w.st.sql.exec(`INSERT INTO links (source_bundle, source_capture, link_ref, address, address_norm, citation_norm, fragment, partition,
                 origin, chrome, captured_at, first_seen) VALUES (NULL,?,?,?,?,?,NULL,'deferred',NULL,0,?,?)`,
    fromCapture, `l-${address}`, address, address, address, firstSeen, firstSeen);
}

/* Three captures, each in its own document, registered at three instants around the levels' first row: `after` in the
   first row's own second (never_looked), `band` in the second before it (the band), `before` two seconds before it
   (purged). None has a row at the content or meaning level and none has a reading. Each level's first row is written at
   FIRST over a subject no capture here is. */
function banded() {
  const w = world();
  const cap = {};
  for (const [name, at] of [["after", FIRST], ["band", REG], ["before", BEFORE]]) {
    w.clock.now = Date.parse(at) + 700;         /* the registration keeps the whole second only */
    cap[name] = w.cap(name, `bytes of the ${name} capture`);
    w.doc(`INFO-${name}`, {}, { captures: [cap[name]] });
  }
  const reg = Object.fromEntries(Object.entries(cap).map(([k, c]) =>
    [k, w.row(`SELECT registered FROM register WHERE capture_sha=?`, c.sha).registered]));
  assert.deepEqual(reg, { after: FIRST, band: REG, before: BEFORE }, "the registrations sit where the arm needs them");
  w.observe({ level: "content", subject_kind: "capture", subject: "0".repeat(64), authority_kind: "extract", state: "LOOKED_ABSENT", at: FIRST });
  w.observe({ level: "meaning", subject_kind: "entity", subject: "ENT-W", authority_kind: "derive", state: "LOOKED_ABSENT", at: FIRST });
  w.observe({ level: "document", subject_kind: "address", subject: "https://example.org/first", authority_kind: "acquire",
              authority: "INFO-after", state: "LOOKED_ABSENT", at: FIRST });
  return { w, cap };
}

test("R43 (D-516): the content frontier states the band and does not pick — a capture registered in the second before the level's first row is in missing_unexplained with the band's cause and its own why, never in never_looked; not_ruled_out is exactly purged's set; the answer publishes the band's word among its causes", () => {
  const { w, cap } = banded();
  const f = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  assert.equal(w.observation.firstRowAt("content"), FIRST);
  assert.deepEqual(f.never_looked.map((r) => [r.subject, r.missing_cause, r.not_ruled_out, r.evidence_one_sided]),
    [[cap.after.sha, "never_looked", ["never_looked"], false]], "the positive statement only past the watermark");
  const by = Object.fromEntries(f.missing_unexplained.map((r) => [r.subject, r]));
  assert.deepEqual(Object.keys(by).sort(), [cap.band.sha, cap.before.sha].sort());
  const band = by[cap.band.sha];
  assert.deepEqual([band.missing_cause, band.why, band.not_ruled_out, band.evidence_one_sided],
    [BAND, VOCAB.MISSING_ROW_CAUSES[BAND], causesNotRuledOut("purged", { evidenceOneSided: false }), false]);
  assert.match(band.why, /whole\s+seconds/);
  assert.match(band.why, /DOES NOT PICK/);
  assert.deepEqual(band.not_ruled_out, ["purged", "never_looked"], "the band widens nothing and narrows nothing");
  assert.deepEqual([by[cap.before.sha].missing_cause, by[cap.before.sha].not_ruled_out], ["purged", ["purged", "never_looked"]]);
  assert.ok(Object.prototype.hasOwnProperty.call(f.missing_causes, BAND));
  assert.deepEqual([f.never_looked_count, f.missing_unexplained_count], [1, 2]);
});

test("R24 (D-516): contentAxis agrees with the frontier — a capture in the band reads undetermined, not determined, with the band's cause and no extraction; past the watermark it is the positive not_extracted, before it purged", () => {
  const { w, cap } = banded();
  const a = (c) => w.retrieval.contentAxis({ captureSha: c.sha, viewer: V("vera") });
  const band = a(cap.band);
  assert.deepEqual([band.found, band.indexed, band.determined, band.missing_cause, band.extraction, band.index],
    [true, VOCAB.CONTENT_AXIS_UNDETERMINED, false, BAND, null, null]);
  assert.ok(band.why.includes(VOCAB.MISSING_ROW_CAUSES[BAND]), "why names the stored watermark's whole-second precision");
  assert.ok(Object.prototype.hasOwnProperty.call(band.missing_causes, BAND));
  const after = a(cap.after), before = a(cap.before);
  assert.deepEqual([after.indexed, after.determined, after.missing_cause], ["not_extracted", true, "never_looked"]);
  assert.deepEqual([before.indexed, before.determined, before.missing_cause], [VOCAB.CONTENT_AXIS_UNDETERMINED, false, "purged"]);
});

test("R46 (D-516): the meaning frontier states the same band with its own sentence, for a capture, for a reference entered at that capture's registration, and for an entity over the whole band [first − 1 s, first); one-sided kinds name every cause", () => {
  const { w, cap } = banded();
  w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref) VALUES (?, 'INFO-band', 'the band name')`, cap.band.sha);
  for (const [id, at] of [["ENT-1", "2026-09-27T02:59:59.999Z"], ["ENT-2", "2026-09-27T03:00:00.000Z"],
                          ["ENT-3", "2026-09-27T03:00:00.999Z"], ["ENT-4", "2026-09-27T03:00:01.000Z"]])
    w.st.sql.exec(`INSERT INTO entities (entity_id, kind, label, at) VALUES (?, 'body', ?, ?)`, id, `Body ${id}`, at);
  const f = w.retrieval.frontier({ level: "meaning", viewer: V("vera") });
  assert.equal(w.observation.firstRowAt("meaning"), FIRST);
  const all = [...f.never_looked, ...f.missing_unexplained];
  const key = (r) => `${r.subject_kind}:${r.subject}`;
  const by = Object.fromEntries(all.map((r) => [key(r), r]));
  const causes = Object.fromEntries(all.map((r) => [key(r), r.missing_cause]));
  assert.deepEqual(causes, {
    [`capture:${cap.after.sha}`]: "never_looked", [`capture:${cap.band.sha}`]: BAND, [`capture:${cap.before.sha}`]: "purged",
    "reference:the band name": BAND,
    "entity:ENT-1": "purged", "entity:ENT-2": BAND, "entity:ENT-3": BAND, "entity:ENT-4": "never_looked" });
  /* The band is never in never_looked, and each band row carries this level's sentence, not the content level's. */
  assert.deepEqual(f.never_looked.map(key).sort(), [`capture:${cap.after.sha}`, "entity:ENT-4"].sort());
  for (const k of [`capture:${cap.band.sha}`, "reference:the band name", "entity:ENT-2", "entity:ENT-3"]) {
    const r = by[k];
    assert.equal(r.why, VOCAB.MEANING_MISSING_ROW_CAUSES[BAND], k);
    assert.notEqual(r.why, VOCAB.MISSING_ROW_CAUSES[BAND], k);
    assert.deepEqual(r.not_ruled_out, causesNotRuledOut("purged", { evidenceOneSided: r.evidence_one_sided }), k);
  }
  assert.deepEqual([by[`capture:${cap.band.sha}`].evidence_one_sided, by[`capture:${cap.band.sha}`].not_ruled_out],
    [false, ["purged", "never_looked"]]);
  for (const k of ["reference:the band name", "entity:ENT-2"])
    assert.deepEqual([by[k].evidence_one_sided, by[k].not_ruled_out], [true, ["pre_log", "purged", "never_looked"]], k);
  assert.ok(Object.prototype.hasOwnProperty.call(f.missing_causes, BAND));
});

test("R41 (D-516): the document frontier reads a deferred address first seen in the second before the level's first row as the band, in missing_unexplained, never never_looked; past the watermark it is never_looked, before it purged, each naming all three causes (one-sided)", () => {
  const { w, cap } = banded();
  link(w, cap.after.sha, "https://example.org/x-band", REG);
  link(w, cap.after.sha, "https://example.org/x-after", FIRST);
  link(w, cap.after.sha, "https://example.org/x-before", BEFORE);
  const f = w.retrieval.frontier({ level: "document", viewer: V("vera") });
  assert.equal(w.observation.firstRowAt("document"), FIRST);
  const all = ["pre_log", "purged", "never_looked"];
  assert.deepEqual(f.never_looked.map((r) => [r.subject, r.missing_cause, r.not_ruled_out, r.evidence_one_sided]),
    [["https://example.org/x-after", "never_looked", all, true]]);
  assert.deepEqual(f.missing_unexplained.map((r) => [r.subject, r.missing_cause, r.not_ruled_out, r.evidence_one_sided]),
    [["https://example.org/x-band", BAND, all, true], ["https://example.org/x-before", "purged", all, true]]);
});

test("R14 (D-516): the passage tally counts a capture in the band as not read and undetermined — never among those nobody has read — and says so", () => {
  const { w } = banded();
  const miss = w.retrieval.meaningRows({ q: "passage:zzqx", rows: "passage", viewer: V("vera") });
  const s = miss.scope;
  assert.equal(s.captures_counted, 3);
  assert.deepEqual(s.not_read, { never_looked: 1, undetermined: 2 }, "the band and the purged capture apart from the unread one");
  assert.deepEqual([s.not_extracted, s.undetermined, s.indexed_full, s.indexed_partial, s.indexed_none], [1, 2, 0, 0, 0]);
  assert.match(miss.says, /^Coverage: /);
  assert.match(miss.says, /1 never extracted — nobody has read them/);
  assert.match(miss.says, /2 have no extraction this record can account for/);
  assert.doesNotMatch(miss.says, /[23] never extracted/, "the band capture is not said to be unread");
  /* The same capture alone in scope: undetermined, not read, not never_looked. */
  const one = w.retrieval.meaningRows({ q: "passage:zzqx id:INFO-band", rows: "passage", viewer: V("vera") });
  assert.deepEqual([one.scope.captures_counted, one.scope.not_read, one.scope.undetermined, one.scope.not_extracted],
    [1, { never_looked: 0, undetermined: 1 }, 1, 0]);
  assert.match(one.says, /0 never extracted — nobody has read them/);
  assert.match(one.says, /1 have no extraction this record can account for/);
});

test("R35, R36: each level the frontier reads — document, content, meaning, internet — is built and says so: found and built true, its level, limit, truncated, looked, never_looked, never_looked_count, tally and a note in words, for a member and for the machine credential; an unknown level is not built", () => {
  const w = world();
  w.st.sql.exec(`INSERT INTO leads (lead_id, author, words, at) VALUES ('LEAD-1', 'vera', 'the pool closed', ?)`, T0);
  for (const viewer of [V("vera"), MACHINE]) {
    for (const level of ["document", "content", "meaning", "internet"]) {
      const f = w.retrieval.frontier({ level, viewer });
      assert.deepEqual([f.found, f.built, f.level, f.failed ?? false], [true, true, level, false], `${level} ${viewer}`);
      assert.deepEqual([typeof f.limit, typeof f.truncated, Array.isArray(f.looked), Array.isArray(f.never_looked),
                        typeof f.never_looked_count, typeof f.tally], ["number", "boolean", true, true, "number", "object"], level);
      assert.ok(typeof f.note === "string" && f.note.length > 40, level);
      assert.doesNotMatch(f.note, /NOT an empty frontier/, `${level}: the built note is not the not-built one`);
    }
  }
  const x = w.retrieval.frontier({ level: "cosmos", viewer: V("vera") });
  assert.deepEqual([x.found, x.built, x.looked.length], [false, false, 0]);
  assert.match(x.note, /NOT an empty frontier/);
});

test("R32: no read retrieval answers writes an observation row — search in every mode, meaningRows, the frontier at every level, contentAxis, the projection and the selections leave observation_log as it was; a frontier read writes nothing at all", async () => {
  const w = world();
  const c = w.cap("a", "a"), h = w.cap("h", "h");
  w.doc("INFO-1", { title: "water audit" }, { files: [{ path: "n.md", text: "sewer transfers" }], captures: [c] });
  w.doc("INFO-2", { title: "parks" }, { files: [{ path: "n.md", text: "library hours" }] });
  w.project("Hidden", "ann", { captures: [h] });
  w.unit(c.sha, "INFO-1", 0, "the sewer fund transfers");
  w.observe({ level: "document", subject_kind: "address", subject: "https://example.org/x", authority_kind: "acquire",
              authority: "INFO-1", state: "PRESENT", result_kind: "capture", result_ref: c.sha });
  w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", authority: "INFO-1", state: "PRESENT" });
  w.observe({ level: "meaning", subject_kind: "entity", subject: "ENT-1", authority_kind: "derive", state: "LOOKED_ABSENT" });
  w.st.sql.exec(`INSERT INTO leads (lead_id, author, words, at) VALUES ('LEAD-1', 'vera', 'the pool closed', ?)`, T0);
  w.observe({ level: "internet", subject_kind: "description", subject: "the pool closed", authority_kind: "lead",
              authority: "LEAD-1", actor_class: "member", state: "LOOKED_ABSENT" });
  const log = () => JSON.stringify(w.rows(`SELECT * FROM observation_log ORDER BY seq`));
  const whole = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));
  const before = log();
  assert.equal(w.count("observation_log"), 4, "the counter reads a table that holds rows");
  const all = whole();
  for (const viewer of [V("vera"), V("ann"), MACHINE, null])
    for (const level of ["document", "content", "meaning", "internet", "cosmos"]) {
      w.retrieval.frontier({ level, viewer });
      w.retrieval.frontier({ level, viewer, limit: 1 });
    }
  assert.equal(whole(), all, "a frontier read writes nothing");
  for (const viewer of [V("vera"), V("ann"), MACHINE, null]) {
    for (const q of ["sewer", "transfers", "water library", "passage:sewer", "", "status:live"])
      for (const mode of ["page", "ids", "count"]) w.retrieval.search({ q, viewer, mode });
    w.retrieval.meaningRows({ q: "passage:sewer", rows: "passage", viewer });
    w.retrieval.meaningRows({ q: "passage:zzqx", rows: "passage", viewer });
    w.retrieval.meaningRows({ q: "", rows: "leg", viewer });
    for (const sha of [c.sha, h.sha, "f".repeat(64), null]) w.retrieval.contentAxis({ captureSha: sha, viewer });
    w.retrieval.projection({ viewer });
    await w.retrieval.projection({ bundleId: "INFO-1", viewer });
  }
  w.retrieval.searchFields();
  w.retrieval.searchIndexCheck({ viewer: MACHINE });
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), ids: ["INFO-1", "INFO-2"] });
  const q = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "sewer" });
  w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera"), weight: "refuse" });
  w.retrieval.selectionResolve({ handle: q.handle, owner: "o", viewer: V("vera") });
  w.retrieval.selectionList({ owner: "o", viewer: V("vera") });
  w.retrieval.selectionRelease({ owner: "o" });
  assert.equal(log(), before, "not one observation row written, changed or removed");
});
