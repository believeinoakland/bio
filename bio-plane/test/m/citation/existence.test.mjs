/* citation: the three acts against a project the viewer sees at existence only (R1, R4, R9), at the module's interface.
   Converted from the old battery's `project-discoverable` (legacy-tests T17, citation's share: C-70.1 at EXISTENCE for
   sever and reinstate, and hidden answering as absent); its other acts and reads are `membership`'s, `queue`'s and
   `basis-versions`'. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const VERA = { viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") };
/* What a C-70.1 answer may carry: the refusal's own words and the project's id and name, nothing else about it. */
const ALLOWED = ["ok", "reason", "code", "check", "translation", "detail", "project", "name"];

async function setup() {
  const w = world();
  w.info("INFO-2026-0001");
  w.info("INFO-2026-0002");
  const p = w.project("Discoverable sewer project", "ann", { visibility: "discoverable" });
  /* The owner cites both and severs one, so each act vera tries has an edge in its source state to move. */
  const both = await w.select(["INFO-2026-0001", "INFO-2026-0002"]);
  assert.equal(w.cit.cite({ project: p, handle: both, ...ANN }).ok, true);
  const two = await w.select(["INFO-2026-0002"]);
  assert.equal(w.cit.sever({ project: p, handle: two, ...ANN, reason: "superseded" }).ok, true);
  const vOne = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
  const vTwo = await w.select(["INFO-2026-0002"], { viewer: V("vera"), owner: "v" });
  const acts = (project) => [
    ["cite", () => w.cit.cite({ project, handle: vOne, ...VERA, note: "the minutes" })],
    ["sever", () => w.cit.sever({ project, handle: vOne, ...VERA, reason: "superseded" })],
    ["reinstate", () => w.cit.reinstate({ project, handle: vTwo, ...VERA, reason: "back in" })],
  ];
  return { w, p, acts };
}

test("R4, R9: at existence only, sever and reinstate (and cite, R1) answer membership's C-70.1, naming the project by its id and name and nothing else, and move nothing", async () => {
  const { w, p, acts } = await setup();
  const expected = w.membership.existenceAct(p, V("vera"));
  assert.equal(expected.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT", "vera sees the project at existence");
  const snap = w.snapshot(), md = w.md(p);
  for (const [act, run] of acts(p)) {
    const r = run();
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.project, r.name],
                     [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", "PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", p, "Discoverable sewer project"], act);
    assert.deepEqual(r, expected, `${act}: membership's one answer (its R77), byte for byte`);
    assert.deepEqual(Object.keys(r).filter((k) => !ALLOWED.includes(k)), [], `${act} carries nothing else`);
    assert.doesNotMatch(JSON.stringify(r), /\bann\b|forming|INFO-2026/, `${act} names no owner, state or edge`);
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  assert.equal(w.md(p), md);
  /* Control: the owner, who sees the project whole, is not refused by any of the three. */
  const one = await w.select(["INFO-2026-0001"]), two = await w.select(["INFO-2026-0002"]);
  assert.equal(w.cit.sever({ project: p, handle: one, ...ANN, reason: "cut" }).ok, true);
  assert.equal(w.cit.reinstate({ project: p, handle: two, ...ANN, reason: "back" }).ok, true);
});

test("R9: set hidden again, the same project answers each act exactly as an id that names nothing", async () => {
  const { w, p, acts } = await setup();
  assert.equal(w.membership.projectVisibilitySet({ projectId: p, setting: "hidden", reason: "closed", by: "ann", viewer: V("ann") }).ok, true);
  const absent = "PROJ-2026-0000-never-minted";
  const hidden = acts(p).map(([, run]) => run()), none = acts(absent).map(([, run]) => run());
  acts(p).forEach(([act], i) => {
    assert.deepEqual(hidden[i], noSuchProject(p), act);
    assert.deepEqual({ ...hidden[i], project: null }, { ...none[i], project: null }, act);
  });
});
