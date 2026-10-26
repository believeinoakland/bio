/* standards: T51 fix round 10's binding read (R63) and R40's event arm (R64; DEC-438, SCREENS-INVESTIGATE #25 J44 (1), (3);
   K5302). Driven at the module's interface over the test profile (`test-port-ellery`), through the real acts. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, REASON } from "./fixture.mjs";
import { WORD } from "./words.mjs";
import { standardsOps } from "../../../src/standards/index.mjs";

const MHS = "MHS 101-2020 edition";
const PAGE0 = { kind: "pdf-page", page: 0 };
const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const later = (w, iso) => { w.clock.now = iso; };

/* a standard to be bound, an adopting ordinance, an imposing law, two bodies */
function scene(w) {
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const adoptingPassage = w.passage().contentId, lawPassage = w.passage().contentId;
  const ordinance = w.declare({ cite: "PEBL § 80", text: [adoptingPassage], issuer: "Port Ellery Selectboard" }).id;
  const law = w.declare({ cite: "PEBL § 81", text: [lawPassage], issuer: "Port Ellery Selectboard" }).id;
  return { std, adoptingPassage, lawPassage, ordinance, law, selectboard: w.entity("Port Ellery Selectboard"),
           schools: w.entity("Marlow Schools Board") };
}

test("R63 standardRead answers bindings: each adoption, imposition and benchmark declaration the viewer may see, with its fields and its says, newest first; a standard with none answers []; a viewer who may not see the standard is answered NO_SUCH_STANDARD with nothing of them", () => {
  const w = seeded();
  const s = scene(w);
  const none = w.s.standardRead({ id: s.std, viewer: V("carol") });
  assert.deepEqual(none.bindings, [], "no record: an empty list");
  later(w, "2026-09-28T02:00:00.000Z");
  const a = w.s.adoptionRecord({ standard: s.std, act: s.ordinance, edition: "2020", from: "2021-07-01", mode: "by_reference",
                                 citation: s.adoptingPassage, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  later(w, "2026-09-28T03:00:00.000Z");
  const i = w.s.impositionRecord({ standard: s.std, body: s.selectboard, law: s.law, citation: s.lawPassage, reason: REASON,
                                   author: V("alice"), viewer: V("alice") });
  assert.equal(i.ok, true, JSON.stringify(i).slice(0, 300));
  later(w, "2026-09-28T04:00:00.000Z");
  const b = w.s.benchmarkDeclare({ standard: s.std, body: s.schools, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  const read = w.s.standardRead({ id: s.std, viewer: V("carol") });
  assert.deepEqual(read.bindings, [
    { kind: "benchmark", id: b.benchmark.id, body: s.schools, by: V("bob"), at: b.benchmark.at,
      says: WORD("standard.binding.benchmark", { body: "Marlow Schools Board" }) },
    { kind: "imposition", id: i.imposition.id, body: s.selectboard, law: s.law, citation: s.lawPassage, by: V("alice"),
      at: i.imposition.at, says: WORD("standard.binding.binds", { body: "Port Ellery Selectboard" }) },
    { kind: "adoption", id: a.adoption.id, body: "Port Ellery Selectboard", act: s.ordinance, edition: "2020",
      from: { date: "2021-07-01" }, mode: "by_reference", citation: s.adoptingPassage, by: V("bob"), at: a.adoption.at,
      says: WORD("standard.binding.binds", { body: "Port Ellery Selectboard" }) },
  ]);
  assert.deepEqual(w.s.standardRead({ id: s.law, viewer: V("carol") }).bindings, [], "the law imposing it holds none of its own");
  /* a viewer the record admits to nothing is answered as for an absent standard, with no record of them */
  for (const viewer of [null, undefined, "", "nobody", "member:"]) {
    const r = w.s.standardRead({ id: s.std, viewer });
    assert.equal(codeOf(r), "NO_SUCH_STANDARD");
    assert.equal(r.bindings, undefined);
    assert.equal(JSON.stringify(r).includes(a.adoption.id), false);
  }
  /* the door: the op answers it as the read does */
  const door = standardsOps(w.s, new URL(`http://x/?id=${s.std}&viewer=${encodeURIComponent(V("carol"))}`), {}).standard();
  assert.deepEqual(door.bindings, read.bindings);
});

test("R63 R37 a binding record whose adopting act or law is a standard the viewer may not read answers neither the act nor its passage: a standard held at its source's sight is not named to another viewer", () => {
  const w = seeded();
  const P = w.project("Source material", "alice");
  const hidden = w.passage("leaked", { text: "Staff shall not discuss the waiver." });
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
  const act = w.declare({ cite: "HSO 4/21 para 3", kind: "policy", issuer: "Harbour Master", text: [hidden.contentId],
                          author: V("alice"), viewer: V("alice") });
  assert.equal(act.ok, true, JSON.stringify(act).slice(0, 300));
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const a = w.s.adoptionRecord({ standard: std, act: act.id, edition: "2020", from: "2021-07-01", mode: "voluntary",
                                 citation: hidden.contentId, reason: REASON, author: V("alice"), viewer: V("alice") });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const seen = w.s.standardRead({ id: std, viewer: V("alice") }).bindings[0];
  assert.deepEqual([seen.act, seen.citation], [act.id, hidden.contentId], "who may read the act is told it");
  const other = w.s.standardRead({ id: std, viewer: V("carol") }).bindings[0];
  assert.deepEqual([other.id, other.act, other.citation, other.edition], [a.adoption.id, null, null, "2020"]);
  assert.equal(JSON.stringify(w.s.standardRead({ id: std, viewer: V("carol") })).includes(act.id), false);
});

test("R64 R40 an adoption whose act is an event the record holds, with its citation a passage of that event's own capture, is recorded, read back by standardRead's bindings (R63) and decided by editionInForce", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard");
  const p = w.passage("minutes");
  const e = w.events.createEvent({ kind: "meeting", concerns: [body], by: V("bob"),
                                   attestations: [{ captureSha: p.capSha, extent: PAGE0 }] });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 300));
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const adopt = (extra = {}) => w.s.adoptionRecord({ standard: std, act: e.event_id, edition: "2020", from: "2022-01-01", mode: "by_reference",
                                                     citation: p.contentId, reason: REASON, author: V("bob"), viewer: V("bob"), ...extra });
  const a = adopt();
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.deepEqual([a.adoption.act, a.adoption.body, a.adoption.citation], [e.event_id, body, p.contentId]);
  const read = w.s.standardRead({ id: std, viewer: V("carol") }).bindings;
  assert.deepEqual(read.map((x) => [x.kind, x.id, x.act, x.body, x.citation]), [["adoption", a.adoption.id, e.event_id, body, p.contentId]]);
  assert.equal(read[0].says, WORD("standard.binding.binds", { body: "Port Ellery Selectboard" }));
  const at = w.s.editionInForce({ standard: std, body, date: "2024-06-01", viewer: V("carol") });
  assert.deepEqual([at.state, at.edition, at.adoption.id, at.adoption.act], ["in_force", "2020", a.adoption.id, e.event_id]);
  assert.equal(w.s.editionInForce({ standard: std, body, date: "2021-06-01", viewer: V("carol") }).state, "undetermined", "before it");
  /* controls: an event the record does not hold, a citation no content row answers, and each writes nothing */
  const before = w.snapshot();
  assert.equal(w.s.adoptionRecord({ standard: std, act: "EVT-2026-9999", edition: "2020", from: "2022-01-01", mode: "by_reference",
                                    citation: p.contentId, reason: REASON, author: V("bob"), viewer: V("bob") }).end, "act");
  assert.equal(codeOf(adopt({ citation: "CNT-none" })), "ADOPTION_NO_CITATION");
  assert.deepEqual(w.snapshot(), before);
});
