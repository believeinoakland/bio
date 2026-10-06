/* The connection owner "placed on a declared flow" (R40; connection-grammar R2, R6–R9): registered once at load, its
   `neighbours` answering each current placement in connection-grammar's shape, and its owner-conformance battery. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, BOB, ZONE } from "./fixture.mjs";
import { ownerConformance, owners, kindOf, neighbours as registryNeighbours, checkConnection } from "../../../src/connection-grammar/index.mjs";
import { PLACED_KIND, PLACED_KINDS, OWNER_REGISTRATION } from "../../../src/progressions/index.mjs";

const ENT = "ENT-2026-0001", ENT2 = "ENT-2026-0002";
const B_IN = "INFO-2026-0001-award", B_OUT = "INFO-2026-0002-need", B_UND = "INFO-2026-0003-contract", B_PROJ = "PROJ-2026-0001-file";
const EVT = "EVT-2026-aaaaaaaaaaaaaaaa";
const AT = { value: "2026-03-05", precision: "day", zone: ZONE };

/* One instance with four placements: in at AT (its own date that day), out (another day), undetermined (no own date),
   and one filed in a project only MEMBER may see; and a second entity placed by the same event. */
async function placed() {
  const w = seeded();
  for (const b of [B_IN, B_OUT, B_UND]) w.bundle(b);
  w.bundle(B_PROJ, "project");
  w.entity(ENT); w.entity(ENT2);
  w.resolve(ENT, "s-in", B_IN, "B"); w.resolve(ENT, "s-out", B_OUT, "A"); w.resolve(ENT, "s-und", B_UND, "C");
  w.resolve(ENT, "s-proj", B_PROJ, "A"); w.resolve(ENT2, "s-in", B_IN, "A");
  w.define("proc", { contract: { cardinality: "0..n" } });
  w.fact("s-out", "2026-03-01");
  w.fact("s-proj", "2026-03-05");
  w.event(EVT, { start: "2026-03-05", end: null, precision: "day", zone: ZONE }, ["s-in"]);
  const T = (entityId, placements) => w.p.threadInstance({ progressionKey: "proc", entityId, placements, threadedBy: "member:alice", viewer: MEMBER });
  await T(ENT, [{ stage: "need", captureSha: "s-out" }, { stage: "award", captureSha: "s-in", event: EVT },
                { stage: "contract", captureSha: "s-und" }, { stage: "contract", captureSha: "s-proj" }]);
  await T(ENT2, [{ stage: "award", captureSha: "s-in", event: EVT }]);
  const id = (stage, sha, ent = ENT, ev = null) => `placed:proc:${stage}:${sha}:${ent}${ev ? `:${ev}` : ""}`;
  return { w, ids: { in: id("award", "s-in", ENT, EVT), out: id("need", "s-out"), und: id("contract", "s-und"),
                     proj: id("contract", "s-proj"), in2: id("award", "s-in", ENT2, EVT) } };
}

test("R40: registered once at load as the owner of \"placed on a declared flow\", class evidentiary", () => {
  assert.deepEqual(OWNER_REGISTRATION, { ok: true, owner: "progressions" });
  assert.deepEqual(PLACED_KINDS.map((k) => ({ ...k })), [{ kind: PLACED_KIND, word: "placed on a declared flow", class: "evidentiary" }]);
  assert.deepEqual(owners().filter((o) => o.owner === "progressions"), [{ owner: "progressions", kinds: [{ kind: PLACED_KIND, word: "placed on a declared flow", class: "evidentiary" }] }]);
  assert.deepEqual(kindOf(PLACED_KIND), { owner: "progressions", word: "placed on a declared flow", class: "evidentiary" });
});

test("R40: neighbours passes connection-grammar's owner-conformance battery over this module's fixture", async () => {
  const { w, ids } = await placed();
  const r = ownerConformance({ owner: "progressions", neighbours: (a) => w.p.neighbours(a), kinds: [...PLACED_KINDS],
    fixture: { node: ENT, at: AT, in: ids.in, out: ids.out, undetermined: ids.und, fenced: ids.proj,
               viewers: { sees: MEMBER, blind: BOB }, expected: [ids.in, ids.und, ids.proj] } });
  assert.deepEqual(r, { ok: true, failures: [] });
});

test("R40: for an entity its placements, for an event or a document the instances it is placed on; grade the placement's, valid its own date, a hidden bundle neither returned nor counted", async () => {
  const { w, ids } = await placed();
  const ask = (node, viewer = MEMBER, at = AT) => w.p.neighbours({ node, kinds: [PLACED_KIND], at, page: null, viewer, scope: null });
  const ent = ask(ENT);
  const byId = new Map(ent.items.map((i) => [i.id, i]));
  const i = byId.get(ids.in);
  assert.deepEqual([i.from, i.to, i.kind, i.owner, i.stage_key, i.progression_key, i.definition_version, i.grade, i.derived],
                   [EVT, ENT, PLACED_KIND, "progressions", "award", "proc", 1, { assertion: "B", ends: ["B", "B"] }, null]);
  assert.deepEqual(i.valid, { from: "2026-03-05", to: "2026-03-05", precision: "day", zone: ZONE });
  assert.deepEqual(i.evidence, [{ source: "s-in", bundle_id: B_IN, progression_key: "proc", stage_key: "award" }]);
  for (const c of ent.items) assert.deepEqual(checkConnection(c), { ok: true }, c.id);
  // a document with no event: from its bundle; no own date: unstated, marked undetermined
  const u = byId.get(ids.und);
  assert.deepEqual([u.from, u.valid.from, u.valid.to], [B_UND, null, null]);
  assert.ok(u.undetermined && /no start is stated/.test(u.undetermined.why));
  // the event node: every instance it is placed on; the document's bundle node likewise
  assert.deepEqual(ask(EVT).items.map((x) => x.id).sort(), [ids.in, ids.in2].sort());
  assert.deepEqual(ask(B_OUT, MEMBER, { value: "2026-03-01", precision: "day", zone: ZONE }).items.map((x) => x.id), [ids.out]);
  assert.deepEqual(ask(B_PROJ).items.map((x) => x.id), [ids.proj]);
  // R13: a bundle the viewer may not see is neither returned nor counted
  assert.deepEqual(ask(B_PROJ, BOB).items, []);
  assert.ok(!ask(ENT, BOB).items.some((x) => x.id === ids.proj));
  // other kinds asked: none of this owner's; an absent viewer is refused
  assert.deepEqual(w.p.neighbours({ node: ENT, kinds: ["other"], at: AT, viewer: MEMBER }).items, []);
  assert.equal(w.p.neighbours({ node: ENT, at: AT }).refused, "VIEWER_MISSING");
  // through the default registry the plane wires (K1563 (1)): the host passed through answers, judged conforming; with
  // several instances in the isolate and no host, the read is refused rather than guessed
  const viaRegistry = registryNeighbours({ owner: "progressions", host: w.host, node: ENT, kinds: [PLACED_KIND], at: AT, viewer: MEMBER, scope: null });
  assert.deepEqual(viaRegistry.items.map((x) => x.id).sort(), ent.items.map((x) => x.id).sort());
  assert.equal(registryNeighbours({ owner: "progressions", host: w.host, node: ENT, at: AT }).refused, "VIEWER_MISSING");
  assert.equal(registryNeighbours({ owner: "progressions", node: ENT, at: AT, viewer: MEMBER }).refused, "OWNER_HOST_AMBIGUOUS");
  assert.equal(registryNeighbours({ owner: "progressions", host: {}, node: ENT, at: AT, viewer: MEMBER }).refused, "OWNER_HOST_AMBIGUOUS");
  // it writes nothing
  const before = w.snapshot();
  ask(ENT); ask(EVT);
  assert.deepEqual(w.snapshot(), before);
});
