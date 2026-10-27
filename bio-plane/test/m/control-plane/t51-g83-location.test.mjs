/* control-plane R33 (fix round 7, G83; K4746, K4747; runtime-limits R27, R28): THE DOOR OBTAINS THE TEAM'S ROOM ONLY THROUGH `storeStub`. A recording `env.STORE` (the harness'
   `env.gets`: each `get()`'s id, options and call stack; only the calls whose caller is this module's file are judged, admission's own `bioStore` is its job's) through the five sites of the door's forwards: the AI grant's admission (`bio`), the delivery's owed row (the store named by the
   session), the claim/login and public-read stub (`bio`), the scratch stub of an invitation, and the request's own forward. With `STORE_LOCATION` an allowed hint every `get()`
   carries `{locationHint}`; with `STORE_GENERATION` 2 the room's name is `<name>~g2` while the logical names (`store=`, the rows' `store`) stay `bio` and `scratch`; with
   neither, the calls are today's (no second argument, the bare name). Red before: the door called `env.STORE.get(env.STORE.idFromName(name))` with no options. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, hex64, opCalls } from "./harness.mjs";
import { AI_GRANT_OPS } from "../../../src/credentials/index.mjs";

const SHA = "d".repeat(64);
const ok = (result) => new Response(JSON.stringify({ ok: true, result }), { status: 200, headers: { "content-type": "application/json" } });

/* the five sites, each driven by the request that reaches it; answers the env after the request */
const SITES = {
  "AI grant admission (bio)": async (v) => {
    const GRANT = hex64();
    const w = world({ answer: (c) => (c.route === "aigrantadmit" ? ok({ ok: true, member: "ann", viewer: "member:ann", expires: 1 }) : null) });
    const op = AI_GRANT_OPS.find((x) => !["askceiling", "askcheck", "askusage", "agentpack"].includes(x)) || "search";
    Object.assign(w.env, v);
    await call(w.env, { op, token: GRANT, params: { q: "x" } });
    return { env: w.env, names: ["bio"] };
  },
  "request forward and public stub (bio)": async (v) => {
    const w = world();
    Object.assign(w.env, v);
    const r = await call(w.env, { op: "queue", token: w.S.ann });
    assert.equal(r.status, 200, r.text);
    return { env: w.env, names: ["bio"] };
  },
  "scratch stub (an invitation addressed to scratch)": async (v) => {
    const w = world();
    Object.assign(w.env, v);
    await call(w.env, { op: "invitelook", method: "POST", params: { store: "scratch" }, body: JSON.stringify({}) });
    return { env: w.env, names: ["scratch"] };
  },
};

const roomOf = (e) => String(e.id);
/* the get()'s owner: the first frame that is not the harness, the phase clock's wrapper or the helper (admission's own `bioStore` is another module's) */
const ownerOf = (g) => (g.at.split("\n").slice(1).find((l) => !/harness\.mjs|phase-clock\.mjs|store-place\.mjs/.test(l)) || "");
const mine = (env) => env.gets.filter((g) => /\/src\/control-plane\/index\.mjs/.test(ownerOf(g)));
const logical = (names, gen) => names.map((n) => (gen === 1 ? n : `${n}~g${gen}`));

for (const [label, drive] of Object.entries(SITES)) {
  test(`R33 (G83): ${label}: with STORE_LOCATION \`wnam\` every get() of the door carries {locationHint: "wnam"}`, async () => {
    const { env } = await drive({ STORE_LOCATION: "wnam" });
    assert.ok(mine(env).length > 0, "the site obtained a room");
    for (const g of mine(env)) assert.deepEqual(g.opts, { locationHint: "wnam" }, `get(${roomOf(g)}) carries the hint`);
  });
  test(`R33 (G83 control): ${label}: with neither binding the get() is today's: the bare name, no second argument`, async () => {
    const { env, names } = await drive({});
    assert.ok(mine(env).length > 0);
    for (const g of mine(env)) assert.equal(g.opts, undefined, `get(${roomOf(g)}) has no options`);
    for (const n of names) assert.ok(mine(env).some((g) => roomOf(g) === n), `the room ${n} is named as it was`);
  });
  test(`R33 (G83): ${label}: with STORE_GENERATION 2 the room is named \`<name>~g2\` and no get() names the bare logical room`, async () => {
    const { env, names } = await drive({ STORE_GENERATION: "2" });
    for (const n of logical(names, 2)) assert.ok(mine(env).some((g) => roomOf(g) === n), `${n} is obtained`);
    for (const n of names) assert.equal(mine(env).some((g) => roomOf(g) === n), false, `${n} (the bare name) is not obtained`);
  });
  test(`R33 (G83 control): ${label}: a hint not on the list (\`WNAM\`, \`bogus\`, empty) passes no options`, async () => {
    for (const bad of ["WNAM", "bogus", "", " wnam"]) {
      const { env } = await drive({ STORE_LOCATION: bad });
      for (const g of mine(env)) assert.equal(g.opts, undefined, `${JSON.stringify(bad)} is no hint`);
    }
  });
}

test("R33 (G83): the delivery's owed-row forward (the store named by the session) is the room obtained with the hint and the generation, while its `store=` stays the logical name", async () => {
  const { M, world: w2, call: c2, defaultHooks } = await import("./harness.mjs");
  const landed = { ok: true, existed: false, capture: { sha256: SHA, bytes: 12000060 },
    document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, retrieved: "2026-10-22T00:00:00Z", profile: {}, capture: { sha256: SHA, bytes: 12000060, method: "uploaded", content_type: "text/plain" } } };
  const w = w2({ answer: (c) => (c.route === "captureupload" ? ok(landed) : c.route === "readheldfor" ? ok({ ok: true, read: false, why: "NO_HOME" }) : null) });
  Object.assign(w.env, { STORE_LOCATION: "wnam", STORE_GENERATION: "2" });
  const r = await c2(w.env, { op: "captureupload", token: w.S.ann, method: "POST", params: { statement: "s", name: "a.txt", type: "text/plain" }, body: "x", hooks: defaultHooks() });
  assert.equal(r.status, 200, r.text);
  const adds = opCalls(w.env).filter((c) => c.route === "pendingadd");
  assert.equal(adds.length, 1, "one row owed");
  assert.equal(adds[0].ns, "bio~g2", "the room is the generation's");
  assert.equal(adds[0].params.store, "bio", "the logical name rides the request");
  for (const g of mine(w.env)) assert.deepEqual(g.opts, { locationHint: "wnam" });
  void M;
});
