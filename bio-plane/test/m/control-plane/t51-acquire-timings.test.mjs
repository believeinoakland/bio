/* control-plane R115 (T51; K4222; acquisition R95; K4234 (B13)): a call the door stops waiting for (R105's bound) answers the stage times the
   object keeps for the request's trace, read through the store-internal `acquiretimings` route. The hook plays the plane's part: it keeps the
   stages the way `acquire` keeps them, under the trace it is handed. The stand-in object answers the read from what the hook kept. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks } from "./harness.mjs";

test("R115 (T51; K4222; K4234): a timed-out `acquire` answers the stage times the object keeps for the request's trace, read by the store-internal `acquiretimings` with that trace: the stages it ran and the one running", async () => {
  const kept = new Map();
  const handed = [];
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: kept.get(c.params.trace) ?? {} } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      handed.push(ctx.trace);
      kept.set(ctx.trace, { stages: { fetch: 12 }, running: "read", total_ms: 40 });
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(handed.length, 1, "the handler was handed one trace");
  assert.equal(typeof handed[0], "string", "a session's `acquire` carries a trace");
  assert.ok(handed[0].length > 0, "the trace is not empty");
  const reads = w.env.calls.filter((c) => c.route === "acquiretimings");
  assert.equal(reads.length, 1, "the object is asked once, for the timed-out call's stages");
  assert.equal(reads[0].params.trace, handed[0], "the read names the trace the hook was handed");
  /* R121 (amends R115): the object's record stands as it states it, and the door's own phases are beside it */
  const { door, ...stated } = late.json.timings;
  assert.deepEqual(stated, { stages: { fetch: 12 }, running: "read", total_ms: 40 }, "the stage times are the object's answer, not the door's");
  assert.ok(door && Object.hasOwn(door, "acquire"), "R121: the door's phases are stated beside them");
});

test("R115 control (K4234): a call with no trace (the bootstrap credential's) answers its timeout with no stage times, and the object is asked nothing", async () => {
  const handed = [];
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: { stages: { fetch: 1 } } } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      handed.push(ctx.trace);
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.env.ADMIN_TOKEN, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(handed[0], undefined, "no trace reaches the hook");
  assert.deepEqual(late.json.timings.stages, {}, "no stage times are stated");
  assert.ok(late.json.timings.door, "R121: the door's own phases are, though the object was asked nothing");
  assert.equal(w.env.calls.some((c) => c.route === "acquiretimings"), false, "the object is asked nothing");
});

test("R115 control: a call answered in time carries no door timings, asks the object nothing, and an op other than `acquire` is handed none", async () => {
  const w = world();
  const seen = [];
  const hooks = { ...defaultHooks(), acquireBoundMs: 400,
    async gatedOp(ctx) {
      seen.push([ctx.op, ctx.timings]);
      // fixtures-own: synthetic a finished acquire the handler gives in time; only that the door adds nothing to it is tested
      return ctx.op === "acquire" ? M.json({ ok: true, result: { ok: true, done: true } }) : undefined;
    } };
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200);
  assert.equal(quick.json.timings, undefined, "an answer in time is the handler's, untouched");
  assert.equal(w.env.calls.some((c) => c.route === "acquiretimings"), false, "an answer in time asks the object nothing");
  await call(w.env, { op: "whoami", token: w.S.ann, hooks });
  const acquired = seen.find(([op]) => op === "acquire");
  assert.ok(acquired && acquired[1] && typeof acquired[1] === "object", "`acquire` is handed its timings object");
  const other = seen.find(([op]) => op === "whoami");
  assert.equal(other ? other[1] : null, null, "an op other than `acquire` is handed no timings object");
});

/* R105, R115 (fix round 2, C12; acquisition R20, R95): THE 504 SAYS WHAT WAS KEPT. The attestation now runs after the document is kept, but a
   page can still outlast the bound after its capture is recorded (the walk: `attest` ran 20 s with the capture filed and a retry answering
   `existed`), and "kept nothing" was untrue. The door states `kept` from the stages the object reports for the trace: `held` once the
   capture's receipt (acquisition R13) is recorded and the call was stopped after it, `nothing` while it was before, `undetermined` when
   the object states no stage. The sentence is the design's: the door puts `detail` (`refusal.ACQUIRE_TIMED_OUT`, "kept nothing") only where
   nothing was kept, and states the state for the interface to draw (`kept`). */
import { hasWord, word } from "../../../src/setup-words/index.mjs";

async function timedOutWith(stageTimes) {
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  return late.json;
}

test("R105, R115 (C12): a call stopped while its attestation ran, after the capture was recorded, is answered `kept: held` and does not say it kept nothing", async () => {
  /* the walk's ca.gov: fetch 934, read 828, receipt, profile 2825, attest 20887 and running */
  const a = await timedOutWith({ total_ms: 25000, stages: { reputation: 12, fetch: 934, read: 828, receipt: 40, profile: 2825, attest: 20887 }, running: "attest" });
  assert.equal(a.kept, "held");
  assert.notEqual(a.detail, word("refusal.ACQUIRE_TIMED_OUT"), "the design's `kept nothing` is not said of a capture that is kept");
  /* K4334: the design's own row for a kept capture (DEC-397) is its detail once the word table holds it, else none */
  assert.equal(a.detail, hasWord("refusal.ACQUIRE_TIMED_OUT.held") ? word("refusal.ACQUIRE_TIMED_OUT.held") : undefined);
  assert.deepEqual(a.timings.running, "attest", "the times are still stated");
  /* control: every stage after the receipt reads the same, the stopped one included */
  for (const running of ["profile", "subresources", "unpack"]) {
    const b = await timedOutWith({ total_ms: 25000, stages: { fetch: 100, read: 80, receipt: 5, [running]: 24000 }, running });
    assert.equal(b.kept, "held", running);
  }
  /* a call whose stages ended (the object kept them past the end) with the receipt is kept as well */
  const c = await timedOutWith({ total_ms: 25100, stages: { fetch: 100, read: 80, receipt: 5, attest: 24000 } });
  assert.equal(c.kept, "held");
});

test("R105, R115 (C12) control: a call stopped before the capture was recorded is answered `kept: nothing` and carries the design's `refusal.ACQUIRE_TIMED_OUT` as its `detail`", async () => {
  assert.ok(hasWord("refusal.ACQUIRE_TIMED_OUT"), "the design holds the key");
  for (const times of [{ total_ms: 25000, stages: { reputation: 5, fetch: 24990 }, running: "fetch" },
                       { total_ms: 25000, stages: { fetch: 100, read: 24800 }, running: "read" },
                       { total_ms: 25000, stages: { fetch: 5655, render: 19000 }, running: "render" },
                       /* a receipt begun and not ended is not a receipt */
                       { total_ms: 25000, stages: { fetch: 100, read: 80, receipt: 24000 }, running: "receipt" }]) {
    const a = await timedOutWith(times);
    assert.equal(a.kept, "nothing", JSON.stringify(times));
    assert.equal(a.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  }
});

test("R105, R115 (C12) control: with no stage stated (the bootstrap credential's call has no trace, or the object answers none) nothing is claimed either way: `kept: undetermined`, its own row or no `detail`", async () => {
  const a = await timedOutWith({});
  assert.equal(a.kept, "undetermined");
  /* K4334: never `kept nothing`; the design's undetermined row (DEC-397) once the word table holds it, else none */
  assert.notEqual(a.detail, word("refusal.ACQUIRE_TIMED_OUT"));
  assert.equal(a.detail, hasWord("refusal.ACQUIRE_TIMED_OUT.undetermined") ? word("refusal.ACQUIRE_TIMED_OUT.undetermined") : undefined);
  const b = await timedOutWith(null);
  assert.equal(b.kept, "undetermined");
  const noTrace = world({ answer: (c) => (c.route === "acquiretimings" ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: { stages: { receipt: 1 } } } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40, async gatedOp(ctx) { if (ctx.op !== "acquire") return undefined; await new Promise((r) => setTimeout(r, 400)); return M.json({ ok: true }); } };
  const c = await call(noTrace.env, { op: "acquire", token: noTrace.env.ADMIN_TOKEN, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(c.json.kept, "undetermined", "a call with no trace is asked of nothing, so it states nothing");
  assert.equal(c.json.detail, hasWord("refusal.ACQUIRE_TIMED_OUT.undetermined") ? word("refusal.ACQUIRE_TIMED_OUT.undetermined") : undefined);
});

test("R105, R115 (C12) control: an answer in time carries no `kept`", async () => {
  const w = world();
  const hooks = { ...defaultHooks(), acquireBoundMs: 400, async gatedOp(ctx) { return ctx.op === "acquire" ? M.json({ ok: true, result: { ok: true } }) : undefined; } };
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200);
  assert.equal(quick.json.kept, undefined);
});

/* R58, R105 (fix round 2, C12/C13; acquisition R12): A RENDER CONTINUATION'S `document` REACHES THE CALLER. `acquire {continue}` answers the
   render still pending (the capture stands, `render: {state: "pending"}`) or the pair (the rendered document the primary, the page beside
   it, as a second document); the member's surface files that `document` as it files any acquire's (the promotion the capture screen sends,
   R100), so the door relays it whole: nothing of the acquisition's answer is held back, restamped or tied to a step it was not asked. The
   door promotes only an archive's own files (R58) and none of these. */
test("R58, R105 (acquisition R12): the answer of an `acquire {continue}` is relayed whole: the pair's `document` with its `render`, the pending answer with its session, and nothing is promoted by the door", async () => {
  const pair = { ok: true, document: { file: "snapshots/p.html", locator: "https://example.org/p", capture: { sha256: "c".repeat(64) },
                  pair: { shell: "snapshots/p.shell.html" }, render: { status: 200 } }, store: "bio", tokenClass: "member" };
  const pending = { ok: true, existed: true, continued: { session: "rs_1", primary: { sha256: "d".repeat(64) } },
                    render: { state: "pending", session: "rs_1" }, store: "bio", tokenClass: "member" };
  for (const answer of [pair, pending]) {
    const w = world();
    const hooks = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "acquire" ? M.json(answer, 200) : undefined; } };
    const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { continue: "rs_1", project: "PROJ-2026-0001-p" } });
    assert.equal(r.status, 200, r.text);
    assert.deepEqual(r.json, answer, "the answer is the owner's, whole");
    assert.equal(w.env.calls.some((c) => c.route === "promote" || c.route === "allocid" || c.route === "capturestepproduct"), false,
      "the door filed nothing of it");
  }
});
