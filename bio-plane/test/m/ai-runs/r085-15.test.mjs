/* ai-runs R085-15 (K3501): R85, the search half names what to look at — the context's subjects; R86, an inquiry in a
   project takes the project's bar. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ } from "./world.mjs";
import { STANDARD_BASIS } from "../../../src/run-rules/index.mjs";

const INFO = "INFO-2026-0003", INFO2 = "INFO-2026-0004", HIDDEN = "PROJ-2026-0009", INQ2 = "INQ-2026-0002";

/** A leg of `inq` on `target`, at the extent `ref` (null: the leg names none; "document": the whole document). */
function leg(w, inq, ord, target, ref = null, kind = "doc-para") {
  const cid = ref === null ? null : `c-${inq}-${ord}`;
  if (cid) w.sql.exec(`INSERT INTO content (content_id, extent_kind, ref) VALUES (?, ?, ?)`, cid, kind, ref);
  w.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, content_id) VALUES (?, ?, ?, ?)`, inq, ord, target, cid);
}
const subjects = async (w, run, viewer = "admin") => (await w.runs.spawnPayload({ run, viewer, half: "search" })).payload.subjects;

async function subjectWorld() {
  const w = world();
  await w.group("ann", "bob", "dan");
  w.bundle(INQ); w.bundle(INQ2); w.bundle(INFO, "information"); w.bundle(INFO2, "information");
  return w;
}

test("R85: the search half carries subjects {items, truncated} — a run over an inquiry names each leg's target with the extent the leg names, and each record the inquiry cites; control: a record the viewer cannot see is absent", async () => {
  const w = await subjectWorld();
  w.project(HIDDEN, "ann");
  leg(w, INQ, 0, INFO, "¶1");
  leg(w, INQ, 1, INFO2);
  w.cites(INQ, INFO); w.cites(INQ, INFO2); w.cites(INQ, HIDDEN);
  await w.runs.open(OPEN({ run: "S1" }));
  const s = await subjects(w, "S1", "member:ann");
  assert.deepEqual(s, { items: [
    { id: INFO, extent: "¶1", kind: "leg" },
    { id: INFO2, extent: null, kind: "leg" },
    { id: INFO, extent: null, kind: "cited" },
    { id: HIDDEN, extent: null, kind: "cited" } ], truncated: false }, "ann owns the hidden project and sees it");
  /* control: dan cannot see the hidden project, and it is not named, counted or hinted at */
  const d = await subjects(w, "S1", "member:dan");
  assert.deepEqual(d.items.map((i) => i.id), [INFO, INFO2, INFO]);
  assert.equal(JSON.stringify(d).includes(HIDDEN), false);
  /* a leg naming the whole document names no extent; the other half of the payload is as before (no lens field) */
  leg(w, INQ2, 0, INFO, "document", "document");
  await w.runs.open(OPEN({ run: "S2", contextId: INQ2 }));
  assert.deepEqual((await subjects(w, "S2")).items, [{ id: INFO, extent: null, kind: "leg" }]);
  assert.equal(/bias|lens|manifest/i.test(JSON.stringify((await w.runs.spawnPayload({ run: "S1", viewer: "admin" })).payload)), false);
});

test("R85: for a run over a project, the subjects are those of each question R19's questions lists — only questions the viewer sees; deduplicated by id and extent; at most 50, truncated past that", async () => {
  const w = await subjectWorld();
  w.project(PROJ, "ann", { joined: ["bob"] });
  w.cites(PROJ, INQ); w.cites(PROJ, INQ2);
  w.cites(INQ, PROJ); w.cites(INQ2, PROJ);   /* confirmed both ways: the question cites the project it sits in */
  leg(w, INQ, 0, INFO, "¶1"); leg(w, INQ2, 0, INFO, "¶1"); leg(w, INQ2, 1, INFO, "¶2");
  await w.runs.open(OPEN({ run: "P1", contextType: "project", contextId: PROJ, actor: "bob", viewer: "member:bob", principalPlane: "member:bob" }));
  const r = (await w.runs.read({ run: "P1", viewer: "member:bob" })).session;
  assert.deepEqual(r.context.questions, [INQ, INQ2]);
  const s = await subjects(w, "P1", "member:bob");
  const legs = s.items.filter((i) => i.kind === "leg");
  assert.deepEqual(legs.map((i) => [i.id, i.extent]), [[INFO, "¶1"], [INFO, "¶2"]], "INFO ¶1 once, though two questions rest on it");
  assert.equal(s.truncated, false);
  /* the bound: 60 distinct documents cited leave 50 and say so */
  for (let i = 0; i < 60; i++) { const id = `INFO-2026-${String(100 + i).padStart(4, "0")}`; w.bundle(id, "information"); w.cites(INQ, id); }
  const big = await subjects(w, "P1", "member:bob");
  assert.deepEqual([big.items.length, big.truncated], [50, true]);
  assert.equal(new Set(big.items.map((i) => `${i.id}|${i.extent}`)).size, 50);
});

test("R86: a run over a question in a project takes the project's bar — none-recorded when none is declared, recorded with its pair when handed; control: a question in no project is context-has-no-project, and a project the viewer cannot see does not change what the viewer is told", async () => {
  const w = await subjectWorld();
  w.bundle("INQ-2026-0005");
  w.project(PROJ, "ann", { joined: ["bob"] });
  w.project(HIDDEN, "ann");
  w.cites(PROJ, INQ); w.cites(INQ, PROJ);
  w.cites(HIDDEN, INQ2); w.cites(INQ2, HIDDEN);
  const bar = async (run, o, viewer = "member:bob") => {
    await w.runs.open(OPEN({ run, ...o }));
    const r = (await w.runs.read({ run, viewer })).session.standard;
    assert.deepEqual((await w.runs.spawnPayload({ run, viewer })).payload.standard, r, "both readers answer alike");
    return r;
  };
  const inProject = await bar("B1", {});
  assert.deepEqual(inProject, { in_force: false, basis: "none-recorded", stated: STANDARD_BASIS["none-recorded"], pair: null });
  const recorded = await bar("B2", { standardPair: '{"capture":"B","connection":"C"}' });
  assert.deepEqual([recorded.basis, recorded.pair], ["recorded", { capture: "B", connection: "C" }]);
  /* control */
  const alone = await bar("B3", { contextId: "INQ-2026-0005" });
  assert.deepEqual(alone, { in_force: false, basis: "context-has-no-project", stated: STANDARD_BASIS["context-has-no-project"], pair: null });
  const hidden = await bar("B4", { contextId: INQ2 });
  assert.equal(hidden.basis, "context-has-no-project", "bob sees no project over INQ2: the hidden one is not his to see");
  assert.equal((await bar("B5", { contextId: INQ2 }, "member:ann")).basis, "none-recorded", "ann, who sees HIDDEN, is told it has one");
});
