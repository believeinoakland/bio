/* observation-log: the meaning level's rows in full (R8, R27) and their registration with connections under this
   module's own name (R8; connections R3, R5, R51). Carries observation-log's shares of the old `observation-meaning`
   and `d241-derivation-stated` suites (legacy-tests' T17 inventory). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { OBSERVATION_LOG_MODULE, derivationStatement, derivationDocumentsFrom, derivationObservation }
  from "../../../src/observation-log/index.mjs";
import { Connections } from "../../../src/connections/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";

const reading = (over = {}) => ({ content_type: "agenda", reader_version: 2, read_from_text: true, found: true,
  entities: [{ ref: "k:1" }, { ref: "k:2" }], ...over });
const fields = (r) => [r.level, r.subject_kind, r.subject, r.authority_kind, r.authority, r.state, r.condition, r.result_kind,
                       r.result_ref, r.actor_class, r.actor];

test("R8 the reader run: PRESENT with its count names the reading; a reader that found none is LOOKED_ABSENT still naming the reading; found and the entity list disagreeing records the weaker; only an explicit readerRegistered false is LOOKED_INDETERMINATE, naming nothing", () => {
  const w = world();
  const last = () => w.log().at(-1);
  assert.deepEqual(w.obs.observeReaderRun("INFO-2026-0001", "c1", reading(), { author: "member:alice" }),
    { written: 1, refused: [], state: "PRESENT" });
  assert.deepEqual(fields(last()), ["meaning", "capture", "c1", "derive", "INFO-2026-0001", "PRESENT", null, "reading", "c1", "member", "member:alice"]);
  assert.equal(last().detail, "reader agenda v2 ran over this document and found 2 entity reference(s)");
  // found true with an empty list, and a list without found: LOOKED_ABSENT, each saying which
  w.obs.observeReaderRun("B", "c2", reading({ found: true, entities: [] }));
  assert.deepEqual([last().state, last().result_kind, last().result_ref], ["LOOKED_ABSENT", "reading", "c2"]);
  assert.match(last().detail, /says it found something and carries an empty entity list/);
  w.obs.observeReaderRun("B", "c3", reading({ found: false }));
  assert.deepEqual([last().state, last().result_ref], ["LOOKED_ABSENT", "c3"]);
  assert.match(last().detail, /carries 2 reference\(s\) and does not say it found anything, so the weaker/);
  w.obs.observeReaderRun("B", "c4", reading({ found: false, entities: [] }));
  assert.match(last().detail, /found no entity references\. This is a MEANING-level absence/);
  // an unrecorded type and version are said, never guessed
  w.obs.observeReaderRun("B", "c5", reading({ content_type: null, reader_version: null }));
  assert.match(last().detail, /^reader of an unrecorded type ran over/);
  // readerRegistered: every value but false is judged on the reading's evidence
  for (const [i, v] of [null, true, undefined, "false", 0].entries()) {
    w.obs.observeReaderRun("B", `r${i}`, reading(), { readerRegistered: v });
    assert.equal(last().state, "PRESENT", String(v));
  }
  w.obs.observeReaderRun("B", "none", reading(), { readerRegistered: false });
  assert.deepEqual([last().state, last().condition, last().result_kind, last().result_ref], ["LOOKED_INDETERMINATE", null, null, null]);
  assert.match(last().detail, /no reader is registered for this document's type \(agenda\)/);
  // no reading: nothing to record
  const n = w.count("observation_log");
  assert.deepEqual(w.obs.observeReaderRun("B", "gone", null), { written: 0, refused: [], state: null });
  assert.equal(w.count("observation_log"), n);
  // a machine's run is the machine's; no author is the plane's
  w.obs.observeReaderRun("B", "m", reading(), { author: "class:ai/tok-1" });
  assert.deepEqual([last().actor_class, last().actor], ["machine", "class:ai/tok-1"]);
  w.obs.observeReaderRun("B", "p", reading());
  assert.deepEqual([last().actor_class, last().actor], ["plane", null]);
  assert.ok(w.log().every((r) => r.level === "meaning" && r.authority_kind === "derive"));
});

test("R8 the resolution attempt: the subject the reference and the authority the capture; no match LOOKED_ABSENT naming what was tried; a match PRESENT naming the first entity, its grades in detail (a C match is still PRESENT), an ambiguous name said and not chosen; no reference writes nothing", () => {
  const w = world();
  const last = () => w.log().at(-1);
  w.obs.observeResolutionAttempt({ captureSha: "c1", bundleId: "B", ref: "person:Jane Doe", matches: [], considered: "the composite key" });
  assert.deepEqual(fields(last()), ["meaning", "reference", "person:Jane Doe", "derive", "c1", "LOOKED_ABSENT", null, null, null, "plane", null]);
  assert.match(last().detail, /tried 'person:Jane Doe' against the subject registry and matched no entity; it tried the composite key/);
  w.obs.observeResolutionAttempt({ captureSha: "c1", ref: { ref: "k:2" }, matches: [{ entity_id: "ENT-1", grade: "C" }], resolvedBy: "member:bob" });
  assert.deepEqual(fields(last()), ["meaning", "reference", "k:2", "derive", "c1", "PRESENT", null, "entity", "ENT-1", "member", "member:bob"]);
  assert.equal(last().detail, "the recogniser matched 'k:2' to 1 registered entity(ies) at grade(s) C");
  w.obs.observeResolutionAttempt({ captureSha: "c1", ref: "k:3", matches: [{ entity_id: "ENT-2", grade: "B" }, { entity_id: "ENT-3", grade: "A" }],
                                   resolvedBy: "class:ai/tok-1" });
  assert.deepEqual([last().state, last().result_ref, last().actor_class], ["PRESENT", "ENT-2", "machine"]);
  assert.match(last().detail, /to 2 registered entity\(ies\) at grade\(s\) A,B; the name is ambiguous across entities .* does not choose between them/);
  const n = w.count("observation_log");
  for (const ref of [null, "", { ref: null }])
    assert.deepEqual(w.obs.observeResolutionAttempt({ captureSha: "c1", ref, matches: [] }), { written: 0, refused: [], state: null });
  assert.equal(w.count("observation_log"), n);
});

test("R8 the connection derivation: its count and documents, PRESENT when it wrote connections, LOOKED_ABSENT when it formed none (a pair needs two documents), partial whenever its bound cut it; an unregistered entity said; `system` the plane; no entity writes nothing", () => {
  const w = world();
  const last = () => w.log().at(-1);
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 6, documents: 4, assertedBy: "system" });
  assert.deepEqual(fields(last()), ["meaning", "entity", "ENT-1", "derive", "ENT-1", "PRESENT", null, "entity", "ENT-1", "plane", null]);
  assert.equal(last().detail, "the derivation read 4 document(s) concerning this entity and wrote 6 connection(s)");
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 0, documents: 1 });
  assert.equal(last().state, "LOOKED_ABSENT");
  assert.match(last().detail, /ran over 1 document\(s\) .* found no connection to write; a connection is a PAIR/);
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 0, documents: 5 });
  assert.doesNotMatch(last().detail, /PAIR/);
  for (const count of [0, 496]) {
    w.obs.observeConnectionDerivation({ entityId: "ENT-1", count, documents: 32, truncated: true, assertedBy: "member:carol" });
    assert.deepEqual([last().state, last().result_ref, last().actor_class, last().actor], ["partial", "ENT-1", "member", "member:carol"], String(count));
    assert.match(last().detail, new RegExp(`over 32 document\\(s\\) .* was CUT by its own bound and wrote ${count} connection`));
  }
  w.obs.observeConnectionDerivation({ entityId: "ENT-9", count: 1, documents: null, entityKnown: false });
  assert.match(last().detail, /read an unrecorded number of document\(s\).*not in the subject registry/);
  const n = w.count("observation_log");
  assert.deepEqual(w.obs.observeConnectionDerivation({ entityId: null, count: 1 }), { written: 0, refused: [], state: null });
  assert.equal(w.count("observation_log"), n);
});

test("R8 R27 the derivation statement read back from the row: whole, cut, formed none and any other state, with documents, at and a sentence; never derived only under never_looked, pre_log and undetermined otherwise; documents read from the row's own detail or null", () => {
  const whole = derivationStatement({ state: "PRESENT", at: "2026-09-27T03:00:00Z", detail: derivationObservation({ entityId: "E", count: 3, documents: 4 }).row.detail });
  assert.deepEqual(whole, { state: "PRESENT", cut: false, at: "2026-09-27T03:00:00Z", documents: 4, derived: "derived",
    says: "the latest derivation (2026-09-27T03:00:00Z) read 4 document(s) and was not cut" });
  const cutRow = derivationStatement({ state: "partial", at: "t", detail: derivationObservation({ entityId: "E", count: 496, documents: 32, truncated: true }).row.detail });
  assert.deepEqual([cutRow.cut, cutRow.documents, cutRow.derived], [true, 32, "derived"]);
  assert.match(cutRow.says, /was CUT by its bound after 32 document\(s\): the connections here are true but are part of the set/);
  const none = derivationStatement({ state: "LOOKED_ABSENT", at: "t", detail: derivationObservation({ entityId: "E", count: 0, documents: 1 }).row.detail });
  assert.deepEqual([none.cut, none.documents], [false, 1]);
  assert.match(none.says, /ran over 1 document\(s\), was not cut, and formed no connection/);
  const odd = derivationStatement({ state: "LOOKED_INDETERMINATE", at: "t", detail: "something else" });
  assert.deepEqual([odd.documents, odd.cut], [null, false]);
  assert.match(odd.says, /recorded state LOOKED_INDETERMINATE/);
  assert.match(derivationStatement({ state: "PRESENT", at: "t", detail: null }).says, /an unrecorded number of documents/);
  // no row: §5.1's cause decides the word
  assert.deepEqual([derivationStatement(null, "never_looked").derived, derivationStatement(null, "pre_log").derived,
                    derivationStatement(null, "purged").derived, derivationStatement(null, "watermark_band").derived,
                    derivationStatement(null).derived, derivationStatement(null, "gremlins").derived],
    ["never_derived", "pre_log", "undetermined", "undetermined", "undetermined", "undetermined"]);
  for (const c of ["never_looked", "pre_log", "purged", "watermark_band"]) {
    const s = derivationStatement(null, c);
    assert.deepEqual([s.state, s.cut, s.at, s.documents], [null, null, null, null], c);
    assert.ok(s.says.length > 40, c);
  }
  // every detail template the writer spells is read back; anything else is null, never a guessed figure
  assert.equal(derivationDocumentsFrom("the derivation over 7 document(s) concerning"), 7);
  assert.equal(derivationDocumentsFrom("the derivation read 12 document(s) concerning"), 12);
  assert.equal(derivationDocumentsFrom("the derivation ran over 0 document(s) concerning"), 0);
  for (const d of [null, "", "derivation read 3 document(s)", "the derivation read three document(s)", 5])
    assert.equal(derivationDocumentsFrom(d), null, String(d));
});

test("R8 registered with connections itself, under this module's name: a derivation connections runs writes this module's meaning row through its notice, and connections' read carries the statement this module provides (connections R3, R5, R51); a second registration is refused and the first stands", () => {
  const w = world();
  const entities = entitiesOf(w.host, { record: w.record, membership: w.membership });
  entities.migrate();
  const k = new Connections({ storage: w.st, record: w.record, membership: w.membership, content: w.content, extraction: w.ex, entities });
  k.migrate();
  assert.equal(k.derivationStatement("ENT-1").cause, "NO_PROVIDER", "before registration nothing provides it");
  const out = w.obs.attachMeaning({ connections: k });
  assert.deepEqual([out.connections.ok, out.connections.module, out.derivationProvider.ok, out.derivationProvider.module],
    [true, OBSERVATION_LOG_MODULE, true, OBSERVATION_LOG_MODULE]);
  // the provider answers from this log: undetermined with no row (no registration instant)
  assert.equal(k.derivationStatement("ENT-1").derived, "undetermined");
  // connections derives over an entity nothing concerns: its notice reaches this module, which records the look
  const d = k.derive({ entityId: "ENT-1" });
  assert.deepEqual([d.ok, d.count, d.documents], [true, 0, 0]);
  assert.deepEqual(w.log().map(fields),
    [["meaning", "entity", "ENT-1", "derive", "ENT-1", "LOOKED_ABSENT", null, "entity", "ENT-1", "plane", null]]);
  assert.match(w.log()[0].detail, /ran over 0 document\(s\) .* not in the subject registry/);
  // and connections' own read carries the statement read back from that row
  const read = k.read({ entityId: "ENT-1", viewer: "class:member" });
  assert.deepEqual([read.derivation.state, read.derivation.cut, read.derivation.documents, read.derivation.derived],
    ["LOOKED_ABSENT", false, 0, "derived"]);
  assert.match(read.derivation.says, /ran over 0 document\(s\), was not cut, and formed no connection/);
  w.obs.observeConnectionDerivation({ entityId: "ENT-1", count: 496, documents: 32, truncated: true });
  const s = k.derivationStatement("ENT-1");
  assert.deepEqual([s.state, s.cut, s.documents, s.derived], ["partial", true, 32, "derived"]);
  // a second registration by this module, or another provider, is refused; the first stands
  const again = w.obs.attachMeaning({ connections: k });
  assert.equal(again.connections.ok, false);
  assert.equal(again.derivationProvider.reason, "PROVIDER_DECLARED");
  assert.match(again.derivationProvider.detail, /^observation-log already provides/);
  assert.equal(k.registerDerivationProvider("legacy-store", () => null).reason, "PROVIDER_DECLARED");
  assert.equal(k.derivationStatement("ENT-1").state, "partial");
  k.derive({ entityId: "ENT-2" });
  assert.equal(w.log().filter((r) => r.subject === "ENT-2").length, 1, "the notice runs this module's writer once");
  // a module without the slots is left alone
  assert.deepEqual(w.obs.attachMeaning({ connections: {} }), {});
});
