/* control-plane R17, R29 (fix round 10; K5157; WALK-FINAL-11 L266, diag2-11 §1): an op graded as `publish` is stamped `author` by publish's
   expression. `publishcheck` is declared with the same spec and capability as `publish`, `publishpreflight` and `publishtensions`, and
   case-authoring asks `membership.isProjectOwner(project, author)` of the bare member id: it takes `ann`, never `member:ann`, and an agent's
   `aiCred` as the pre-flight's does. Each op is driven for every kind of caller with every stamp forged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, FORGED, QUERY_STAMPS } from "./harness.mjs";

const { OPS } = O;
const PUBLISH_OPS = ["publishpreflight", "publishtensions", "publishcheck"];

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  return { w, list: [
    { name: "admin", token: w.env.ADMIN_TOKEN, params: {} },
    { name: "founder", token: w.S.founder, params: {}, author: "admin" },
    { name: "ann", token: w.S.ann, params: {}, author: "ann" },
    { name: "agent", token: agent, params: {} },
  ] };
}

async function innerOf(w, c, op) {
  w.env.calls.length = 0;
  await call(w.env, { op, token: c.token, params: { ...c.params, viewer: FORGED, author: FORGED, aiCred: FORGED, project: "P-1" },
                      method: OPS[op].mutating ? "POST" : "GET", body: OPS[op].mutating ? { author: FORGED, viewer: FORGED } : undefined });
  return opCalls(w.env).filter((x) => x.route === op)[0] ?? null;
}

test("R17, R29 (fix round 10; case-check R1): publishcheck takes publish's `author` for every caller and none of the forged stamps reaches the store", async () => {
  const { w, list } = callers();
  let driven = 0;
  for (const c of list) {
    const pre = await innerOf(w, c, "publishpreflight");
    for (const op of PUBLISH_OPS) {
      assert.ok(Object.hasOwn(OPS, op), `${op} has a spec`);
      const inner = await innerOf(w, c, op);
      if (!inner || !pre) { assert.equal(!inner, !pre, `${op} admits ${c.name} as publishpreflight does`); continue; }
      driven++;
      assert.equal(inner.params.author, pre.params.author, `${op} author for ${c.name} equals the pre-flight's`);
      if (c.author) assert.equal(inner.params.author, c.author, `${op} author for ${c.name}`);
      for (const k of QUERY_STAMPS) assert.notEqual(inner.params[k], FORGED, `${op}: a forged ${k} reached the store for ${c.name}`);
    }
  }
  assert.ok(driven >= 9, String(driven));
});

test("R17, R29 (fix round 10; case-check R1): an agent's publishcheck carries the credential beside the viewer as the pre-flight does (`aiCred`: its token id and principal), and no other caller's carries one", async () => {
  const { w, list } = callers();
  for (const c of list) {
    const pre = await innerOf(w, c, "publishpreflight");
    const inner = await innerOf(w, c, "publishcheck");
    if (!inner || !pre) continue;
    assert.equal(inner.params.aiCred, pre.params.aiCred, `publishcheck aiCred for ${c.name} equals the pre-flight's`);
    if (c.name === "agent") assert.deepEqual(JSON.parse(inner.params.aiCred), { tokenId: "agent-ann", principal: "member:ann" });
    else assert.equal("aiCred" in inner.params, false, `${c.name} carries no aiCred`);
  }
});
