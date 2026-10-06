/* R6: dated waits come round, over the real `inquiry` (its R54–R56), on inquiry's own test world, the profile's zone
   America/Los_Angeles (UTC-7 in October: 07:00Z is the local midnight). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V } from "../inquiry/fixture.mjs";
import { producers, reader, ofKind, sentences, snapshot, notHintFailures } from "./fixture.mjs";
import { WAIT_LOOK, HINT_MARK } from "../../../src/notice-producers/index.mjs";

const Q = "INQ-2026-0701-q", R = "INQ-2026-0702-r";
const KIND = "inquiry-recheck-due";
const LA = () => ({ time_zone: { value: "America/Los_Angeles" } });
const trig = (list) => ["recheck_triggers:", ...list.flatMap((t) => [`  - text: "${t.text}"`,
  `    description: "${t.description ?? "from the clerk"}"`, ...(t.date ? [`    date: "${t.date}"`] : [])])];
const doc = (id, list) => inquiryMd(id, { extra: trig(list) });

function setup() {
  const w = world({ view: LA });
  w.member("alice"); w.member("bob");
  w.promote(Q, doc(Q, [{ text: "records reply", description: "from the city clerk", date: "2026-10-10" }]), null, { author: V("alice") });
  const n = producers(w.host, { membership: w.membership, inquiry: w.k });
  return { w, ...reader(n) };
}

test("R6: a wait due on the local day is one OBLIGATION inquiry-recheck-due, keyed by inquiry and date, to the member who set it and to nobody else; waiting before its local day", () => {
  const { read } = setup();
  assert.deepEqual(ofKind(read("alice", { now: "2026-10-10T06:59:59Z" }), KIND), [], "23:59:59 on the 9th, local");
  const items = ofKind(read("alice", { now: "2026-10-10T07:00:00Z" }), KIND);
  assert.equal(items.length, 1);
  const it = items[0];
  assert.equal(it.id, `OBLIGATION::${KIND}::${Q}::2026-10-10`);
  assert.equal(it.class, "OBLIGATION");
  assert.equal(it.due, "2026-10-10");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.equal(it.subject.kind, "inquiry");
  assert.equal(it.subject.id, Q);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), [Q]);
  for (const m of ["bob", null]) assert.deepEqual(ofKind(read(m, { now: "2026-10-11T00:00:00Z" }), KIND), [], String(m));
});

test("R6: it names what is awaited, from whom and by when (DEC-98), in a to-do's words", () => {
  const { read } = setup();
  const it = ofKind(read("alice", { now: "2026-10-11T00:00:00Z" }), KIND)[0];
  assert.match(it.summary, /records reply \(from the city clerk\), by 2026-10-10/);
  assert.deepEqual(it.subject.waits.map((x) => [x.index, x.text, x.description]), [[0, "records reply", "from the city clerk"]]);
  for (const s of sentences(it)) assert.doesNotMatch(s, /\bobligation\b/i, s);
  assert.equal(it.options[0].id, WAIT_LOOK.id);
});

test("R6: raised once; it leaves when its setter records a look, sets a new date or removes the wait, or the inquiry concludes", () => {
  const { w, read } = setup();
  const at = "2026-10-11T00:00:00Z";
  assert.deepEqual(ofKind(read("alice", { now: at }), KIND).map((i) => i.id), ofKind(read("alice", { now: at }), KIND).map((i) => i.id));
  const before = snapshot((q) => w.st.sql.exec(q));
  read("alice", { now: at });
  assert.deepEqual(snapshot((q) => w.st.sql.exec(q)), before, "the read writes nothing");
  assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by: V("alice") }).ok, true);
  assert.deepEqual(ofKind(read("alice", { now: at }), KIND), [], "looked");
  /* a new date: the old item leaves, a new one comes when that day does */
  w.promote(R, doc(R, [{ text: "agenda out", date: "2026-10-10" }]), null, { author: V("alice") });
  assert.equal(ofKind(read("alice", { now: at }), KIND).length, 1);
  w.promote(R, doc(R, [{ text: "agenda out", date: "2026-10-20" }]), undefined, { author: V("alice") });
  assert.deepEqual(ofKind(read("alice", { now: at }), KIND), [], "re-dated");
  assert.deepEqual(ofKind(read("alice", { now: "2026-10-20T07:00:00Z" }), KIND).map((i) => i.id), [`OBLIGATION::${KIND}::${R}::2026-10-20`]);
  w.promote(R, doc(R, []), undefined, { author: V("alice") });
  assert.deepEqual(ofKind(read("alice", { now: "2026-10-20T07:00:00Z" }), KIND), [], "removed");
  w.promote(R, doc(R, [{ text: "x", date: "2026-10-10" }]), undefined, { author: V("alice") });
  w.st.sql.exec(`UPDATE bundles SET current_state='concluded' WHERE bundle_id=?`, R);
  assert.deepEqual(ofKind(read("alice", { now: at }), KIND), [], "concluded");
});

test("R6: an inquiry the viewer may not see raises nothing", () => {
  const { w, read } = setup();
  const P = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, Q);
  assert.deepEqual(ofKind(read("alice", { now: "2026-10-11T00:00:00Z" }), KIND), []);
});

test("R6: its age runs from the start of the wait's local day in inquiry's zone, never the UTC midnight (K1444 (iii), K1688): west of UTC, at the day boundary", () => {
  const { read } = setup();
  const at = (now) => ofKind(read("alice", { now }), KIND)[0].age;
  assert.deepEqual(at("2026-10-10T07:00:00Z"), { state: "determined", since: "2026-10-10", ms: 0 }, "local midnight in Los Angeles");
  assert.equal(at("2026-10-10T08:00:00Z").ms, 3_600_000, "one hour, not the eight a UTC midnight would give");
  assert.equal(at("2026-10-11T07:00:00Z").ms, 86_400_000);
});

test("R6: with no zone in inquiry's answer, the age is undetermined, never computed on the UTC day", async () => {
  const { w } = setup();
  const { fresh } = await import("./fixture.mjs");
  const n = fresh(w.host, { membership: w.membership, inquiry: { datedWaits: ({ member }) => ({ ok: true, member, zone: null,
    waits: [{ inquiry: Q, index: 0, text: "records reply", description: "from the clerk", date: "2026-10-10", set_by: member, state: "due" }] }) } });
  const it = ofKind(reader(n).read("alice", { now: "2026-10-11T00:00:00Z" }), KIND)[0];
  assert.equal(it.age.state, "undetermined");
  assert.equal(it.age.reason, "no_zone");
  assert.equal(it.due, "2026-10-10");
});

test("R11: a dated wait's to-do is no hint: it carries no \"Hint · machine work\" mark and never calls itself a hint or a signal", () => {
  const { read } = setup();
  const items = ofKind(read("alice", { now: "2026-10-11T00:00:00Z" }), KIND);
  assert.equal(items.length, 1);
  assert.deepEqual(notHintFailures(items[0], HINT_MARK), []);
});
