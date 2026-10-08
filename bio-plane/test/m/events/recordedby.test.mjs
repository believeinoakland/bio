/* events: who recorded something from this passage (T36-14; R49; N715, DEC-164 (4); K2113, K2114), at the interface:
   the one shape every read by capture and extent answers in, its rows (dated facts, attestations, a relation's citation,
   the passages a use cites), the extent filter, the order and bound, sight, and the refusals. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, sha, MEMBER, MACHINE, OUTSIDER } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { eventsOps } from "../../../src/events/index.mjs";

const doc = { kind: "document" };
const page = (n) => ({ kind: "pdf-page", page: n });
const rect = (n, r) => ({ kind: "pdf-page", page: n, rect: r });
const BOB = "member:bob";
function paged(w, name, n = 3, opts = {}) {
  const texts = Array.from({ length: n }, (_, i) => `Page ${i} of ${name}.`);
  return w.capture(name, { pages: n, units: texts.map((text, i) => ({ seq: i, extent: page(i), text })), ...opts });
}
const KEYS = ["module", "record", "kind", "field", "extent", "relation", "by", "at", "withdrawn"];
const tuple = (i) => [i.kind, i.field, i.record, i.by, i.withdrawn];

test("R49 recordedBy answers {ok, module, capture_sha, items, truncated}, one item per row citing the capture: a dated fact, an event's attestation (extent and dated-fact forms), a relation's citation and each passage a use cites, each naming who recorded it (a member, or class:<cls> for the machine), at this module's instant, withdrawn per R20 and R45; testimony is never an item", async () => {
  const w = world();
  const s = paged(w, "decision");
  const director = w.entity("Dana Director"), college = w.entity("Harbor College", "institution");
  /* a dated fact by a member, and an event attested by it (dated-fact form) and by a page (extent form), by bob */
  const fact = w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "signed", value: "2026-03-04", method: "read by a member", by: MEMBER }).dated_fact;
  const ev = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: fact.dated_fact_id }], by: BOB }).event_id;
  w.ev.attest({ eventId: ev, attestation: { captureSha: s, extent: page(1) }, by: MEMBER });
  w.ev.attest({ eventId: ev, attestation: { testimony: "I was there" }, by: MEMBER });
  /* a relation cited by a page, later withdrawn */
  const other = w.event({ value: "2026-03-01" }).event_id;
  const rel = w.ev.relate({ from: ev, to: other, kind: "answers", attestation: { captureSha: s, extent: page(2) }, by: BOB }).relation.relation_id;
  w.ev.withdrawRelation({ relationId: rel, reason: "misread", by: MEMBER });
  /* a use: a waiver citing its reason, outcome, scope and two conditions; an assessment's unmet item; one use withdrawn */
  const wv = w.ev.recordDiscretion({ kind: "waiver", statedReason: { captureSha: s, extent: page(1) }, outcome: { value: "granted", extent: { captureSha: s, extent: page(0) } },
    scope: { captureSha: s, extent: page(2) }, conditions: [{ captureSha: s, extent: page(1) }, { captureSha: s, extent: page(2) }],
    attestations: [{ captureSha: s, extent: page(0) }], participants: [{ entityId: director, role: "decider", attestation: 0 }], by: MEMBER }).event_id;
  const as = w.ev.recordAssessment({ provision: { standard: "STD-A" }, unmet: [{ provision: { standard: "STD-A", portion: "2" }, extent: { captureSha: s, extent: page(2) } }],
    attestations: [{ captureSha: s, extent: page(0) }], participants: [{ entityId: college, role: "subject", attestation: 0 }], by: BOB }).event_id;
  w.ev.withdrawUse({ eventId: as, reason: "recorded twice", by: MEMBER });
  /* a machine's dated fact: the after-read hook, stamped class:daemon */
  w.ev.setReadOptIn({ captureClasses: ["staff_report"], by: "member:root" });
  const report = w.capture("report", { contentType: "staff_report", facts: { date: "2026-04-01" } });
  await new Promise((r) => setTimeout(r, 0));

  let before = w.rows(`SELECT COUNT(*) AS n FROM dated_facts`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM event_attestations`)[0].n;
  const r = w.ev.recordedBy({ captureSha: s, viewer: MEMBER });
  assert.deepEqual(Object.keys(r).sort(), ["capture_sha", "items", "module", "ok", "truncated"]);
  assert.deepEqual([r.ok, r.module, r.capture_sha, r.truncated], [true, "events", s, false]);
  for (const i of r.items) {
    assert.deepEqual(Object.keys(i).sort(), [...KEYS].sort());
    assert.equal(i.module, "events");
    assert.equal(i.relation, null, "no extent asked: relation null");
    assert.match(i.at, /^2026-10-01T/, "this module's instant of the write");
  }
  const got = r.items.map(tuple);
  const expect = [
    ["dated_fact", "extent", fact.dated_fact_id, MEMBER, false],
    ["attestation", "extent", ev, BOB, false],              /* the dated-fact form, added by bob's createEvent */
    ["attestation", "extent", ev, MEMBER, false],           /* the extent form, added by alice's attest */
    ["relation", "attestation", String(rel), BOB, true],    /* withdrawn per R20 */
    ["attestation", "extent", wv, MEMBER, false],
    ["waiver", "stated_reason", wv, MEMBER, false],
    ["waiver", "outcome", wv, MEMBER, false],
    ["waiver", "scope", wv, MEMBER, false],
    ["waiver", "conditions", wv, MEMBER, false],
    ["waiver", "conditions", wv, MEMBER, false],
    ["attestation", "extent", as, BOB, true],               /* the event is a use withdrawn (R45) */
    ["assessment", "unmet", as, BOB, true],
  ];
  assert.deepEqual([...got].sort(), [...expect].sort());
  assert.equal(r.items.length, expect.length, "the testimony is no item");
  /* each condition is its own item: one item per cited extent */
  assert.deepEqual(r.items.filter((i) => i.field === "conditions").map((i) => i.extent.page).sort(), [1, 2]);
  /* the same passage cited twice in one field is one item */
  const twice = w.ev.recordDiscretion({ kind: "waiver", statedReason: "none", outcome: { value: "granted", extent: { captureSha: s, extent: page(0) } },
    scope: { captureSha: s, extent: page(2) }, conditions: [{ captureSha: s, extent: page(1) }, { captureSha: s, extent: page(1) }],
    attestations: [{ captureSha: s, extent: page(0) }], by: MEMBER }).event_id;
  const t = w.ev.recordedBy({ captureSha: s, viewer: MEMBER }).items.filter((i) => i.record === twice);
  assert.deepEqual(t.map((i) => i.field).sort(), ["conditions", "extent", "outcome", "scope"]);
  before = w.rows(`SELECT COUNT(*) AS n FROM dated_facts`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM event_attestations`)[0].n;
  /* the machine's row names class:daemon */
  const m = w.ev.recordedBy({ captureSha: report, viewer: MEMBER }).items;
  assert.deepEqual(m.map((i) => [i.kind, i.by, i.extent]), [["dated_fact", MACHINE, { kind: "document" }]]);
  /* it writes nothing, and is no arm of R36 */
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM dated_facts`)[0].n + w.rows(`SELECT COUNT(*) AS n FROM event_attestations`)[0].n, before);
  assert.equal(eventsOps(w.ev, new URL("https://plane.test/op"), {}).recordedby, undefined);
});

test("R49 each item's extent is content's canonical form parsed back to an object (a citation naming no part read as document); items ordered by that string in code-unit order, then record, then field; limit clamped 1-500 (default 100), truncated by reading one past", () => {
  const w = world();
  const s = paged(w, "order", 3);
  const facts = [];
  for (const [ext, kind] of [[page(2), "signed"], [doc, "issued"], [rect(1, [10, 10, 0, 0]), "adopted"], [page(1), "effective"], [page(1), "received"]])
    facts.push(w.ev.recordDatedFact({ captureSha: s, extent: ext, kind, value: "2026-01-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id);
  /* a stored attestation whose extent names no part is read as document */
  const e = w.event({ value: null, capture: s }).event_id;
  w.st.sql.exec(`UPDATE event_attestations SET extent=NULL WHERE event_id=?`, e);
  const r = w.ev.recordedBy({ captureSha: s, viewer: MEMBER });
  for (const i of r.items) assert.deepEqual(i.extent, JSON.parse(canonicalExtent(i.extent)), "canonical, as an object");
  assert.deepEqual(r.items.find((i) => i.kind === "attestation").extent, { kind: "document" });
  assert.deepEqual(r.items.find((i) => i.record === facts[2]).extent.rect, [0, 0, 10, 10], "rect corners ordered (content R2)");
  const key = (i) => canonicalExtent(i.extent);
  const sorted = [...r.items].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
    || (a.record < b.record ? -1 : a.record > b.record ? 1 : 0) || (a.field < b.field ? -1 : a.field > b.field ? 1 : 0));
  assert.deepEqual(r.items, sorted);
  assert.equal(r.items.length, 6);
  const one = w.ev.recordedBy({ captureSha: s, viewer: MEMBER, limit: 2 });
  assert.deepEqual([one.items, one.truncated], [r.items.slice(0, 2), true]);
  assert.equal(w.ev.recordedBy({ captureSha: s, viewer: MEMBER, limit: 6 }).truncated, false, "exactly the limit is not truncated");
  assert.equal(w.ev.recordedBy({ captureSha: s, viewer: MEMBER, limit: 0 }).items.length, 6, "0 reads as the default 100");
  assert.equal(w.ev.recordedBy({ captureSha: s, viewer: MEMBER, limit: -5 }).items.length, 1, "clamped to at least 1");
  /* the clamp's top, 500, and the default, 100 */
  const big = paged(w, "big", 1);
  for (let i = 0; i < 501; i++) {
    const d = `2026-01-01T00:${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`;
    w.ev.recordDatedFact({ captureSha: big, extent: doc, kind: "issued", value: d, method: "m", by: MEMBER });
  }
  const full = w.ev.recordedBy({ captureSha: big, viewer: MEMBER, limit: 9999 });
  assert.deepEqual([full.items.length, full.truncated], [500, true]);
  const dflt = w.ev.recordedBy({ captureSha: big, viewer: MEMBER });
  assert.deepEqual([dflt.items.length, dflt.truncated], [100, true]);
});

test("R49 with an extent, only rows whose extent is the same, narrower or wider (content.extentRelation(extent, row's)) are items, relation that answer; disjoint ones are not; a merged-away event's rows answer the kept event", () => {
  const w = world();
  const s = paged(w, "filter", 3);
  const at = (ext, kind) => w.ev.recordDatedFact({ captureSha: s, extent: ext, kind, value: "2026-01-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const whole = at(doc, "issued"), p1 = at(page(1), "signed"), box = at(rect(1, [0, 0, 50, 50]), "adopted"), p2 = at(page(2), "effective");
  const rel = (extent) => Object.fromEntries(w.ev.recordedBy({ captureSha: s, extent, viewer: MEMBER }).items.map((i) => [i.record, i.relation]));
  assert.deepEqual(rel(page(1)), { [whole]: "wider", [p1]: "same", [box]: "narrower" });
  assert.deepEqual(rel(doc), { [whole]: "same", [p1]: "narrower", [box]: "narrower", [p2]: "narrower" });
  assert.deepEqual(rel(rect(1, [0, 0, 50, 50])), { [whole]: "wider", [p1]: "wider", [box]: "same" });
  assert.deepEqual(rel(rect(1, [60, 60, 70, 70])), { [whole]: "wider", [p1]: "wider" }, "a disjoint box is no item");
  /* merge: the absorbed event's attestation answers its kept event, not withdrawn */
  const keep = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: s, extent: page(0) }], by: MEMBER }).event_id;
  const absorb = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: s, extent: page(2) }], by: BOB }).event_id;
  assert.equal(w.ev.mergeEvents({ keep, absorb, reason: "one meeting", by: MEMBER }).ok, true);
  const a = w.ev.recordedBy({ captureSha: s, extent: page(2), viewer: MEMBER }).items.filter((i) => i.kind === "attestation");
  assert.deepEqual(a.map((i) => [i.record, i.by, i.withdrawn, i.relation]), [[keep, BOB, false, "same"]]);
});

test("R49 sight is R40's: a hidden row is neither answered nor counted; a capture not held or not visible answers items [] as an absent one; a use citing a visible passage whose event the viewer may not see is not answered; a viewer membership refuses answers items []", () => {
  const w = world();
  w.project("PROJ-2026-0001-r", "bob");
  const open = paged(w, "open", 2);
  const fenced = paged(w, "fenced", 2, { bundleId: "INFO-2026-0002-r", project: "PROJ-2026-0001-r" });
  w.ev.recordDatedFact({ captureSha: fenced, extent: page(0), kind: "signed", value: "2026-01-01", method: "m", by: BOB });
  /* a use attested only in the fenced capture, citing its reason in the open one */
  const u = w.ev.recordDiscretion({ kind: "discretion", statedReason: { captureSha: open, extent: page(1) }, outcome: { value: "denied", extent: { captureSha: fenced, extent: page(1) } },
    attestations: [{ captureSha: fenced, extent: page(0) }], by: BOB });
  assert.equal(u.ok, true);
  w.ev.recordDatedFact({ captureSha: open, extent: page(0), kind: "issued", value: "2026-02-02", method: "m", by: MEMBER });
  const items = (sha_, viewer) => w.ev.recordedBy({ captureSha: sha_, viewer }).items;
  assert.deepEqual(items(fenced, OUTSIDER), [], "a capture the viewer may not see: no items");
  assert.deepEqual(items(fenced, MEMBER), []);
  assert.deepEqual(items(fenced, BOB).map((i) => i.kind).sort(), ["attestation", "dated_fact", "discretion"]);
  assert.deepEqual(items(open, OUTSIDER).map((i) => i.kind), ["dated_fact"], "the use's reason in a visible capture, its event unseen: not answered, not counted");
  assert.deepEqual(items(open, BOB).map((i) => [i.kind, i.field]).sort(), [["dated_fact", "extent"], ["discretion", "stated_reason"]]);
  assert.deepEqual(items(sha("never captured"), MEMBER), [], "absent alike");
  assert.deepEqual(items("not-a-sha", MEMBER), []);
  const denied = w.ev.recordedBy({ captureSha: open, viewer: "nobody" });
  assert.deepEqual([denied.ok, denied.items, denied.truncated], [true, [], false], "a viewer membership refuses sees nothing");
  assert.equal(items(open, "class:admin").length, 2, "the machine's read sees what it holds");
});

test("R49 refuses in order VIEWER_MISSING (an absent or empty viewer only), NO_SHA, EXTENT_MALFORMED (an extent that is not an object of a CONTENT_EXTENT_KINDS kind), each writing nothing; it never throws", () => {
  const w = world();
  const s = paged(w, "refusals", 1);
  w.ev.recordDatedFact({ captureSha: s, extent: page(0), kind: "issued", value: "2026-01-01", method: "m", by: MEMBER });
  const r = (x) => w.ev.recordedBy({ captureSha: s, viewer: MEMBER, ...x });
  assert.equal(r({ viewer: undefined, captureSha: "", extent: "x" }).reason, "VIEWER_MISSING");
  assert.equal(r({ viewer: null }).reason, "VIEWER_MISSING");
  assert.equal(r({ viewer: "" }).reason, "VIEWER_MISSING");
  assert.equal(r({ captureSha: "", extent: "x" }).reason, "NO_SHA");
  assert.equal(r({ captureSha: 7 }).reason, "NO_SHA");
  for (const bad of ["page 1", [page(0)], {}, { kind: "nonsense" }, { kind: 3 }, 5])
    assert.equal(r({ extent: bad }).reason, "EXTENT_MALFORMED", JSON.stringify(bad));
  for (const ok of [doc, page(0), { kind: "envelope", item: "core-property", name: "created" }]) assert.equal(r({ extent: ok }).ok, true, JSON.stringify(ok));
  assert.equal(r({ extent: null }).items.length, 1, "no extent: every row");
  const count = () => w.rows(`SELECT COUNT(*) AS n FROM dated_facts`)[0].n;
  const n = count();
  for (const junk of [undefined, null, 7, "x", [], { captureSha: {} }, { viewer: MEMBER, captureSha: s, limit: {} }, { viewer: MEMBER, captureSha: s, extent: { kind: "pdf-page", page: "x" } }])
    assert.doesNotThrow(() => w.ev.recordedBy(junk));
  assert.equal(count(), n, "writes nothing");
});
