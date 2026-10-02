/* control-plane: the inbox's door after capture's T22 folds (K1037; DEC-88 (2), DEC-108 (2)). R36's `pulled` resolve takes
   capture R32's reason, refused `RESOLVE_NO_REASON` before anything is written and recorded on the knock's row with the
   pull in the one act with its promotion, while `op=inboxpull` takes none; capture's refusals that state their status are
   answered at it (R23); `op=inbox`'s `sort` and `dir` reach capture's `inboxList`. Driven through `makeFetch(hooks)` for
   the Worker's half and at the record store's door over a real record (`record.mjs`) for the store's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, FORGED } from "./harness.mjs";
const { record: fixture } = await import("./record.mjs");
const P = await import("../../../src/control-plane/pull.mjs");
const { captureOf, REASON_MAX } = await import("../../../src/capture/index.mjs");
const { CAPTURE_CHECKS } = await import("../../../src/capture/checks.mjs");
const { provenanceOf } = await import("../../../src/provenance/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");

const SESSION = "by=ann&identity=member:ann&viewer=member:ann";
async function record() {
  const r = await fixture();
  const knock = async (text = "material for the group") =>
    (await r.go("knock?source=203.0.113.9", "POST", { content: text, note: "please look", contact: "knocker@example.org", now: Date.now() })).json.result;
  const state = (knockId) => captureOf(r.ctx).inboxGet(knockId).item;
  const held = (knockId, sha) => {
    const k = state(knockId);
    return { status: k.status, capture_sha: k.capture_sha ?? null, pulled_by: k.pulled_by ?? null,
             resolve_reason: k.resolve_reason ?? null, receipt: provenanceOf(r.ctx).registerHolds({ sha }).acquired,
             home: provenanceOf(r.ctx).homeOf(sha)?.bundleId ?? null, bundles: recordOf(r.ctx).listBundles().ids.length };
  };
  return { ...r, knock, state, held };
}
const UNTOUCHED = { status: "new", capture_sha: null, pulled_by: null, resolve_reason: null, receipt: false, home: null, bundles: 0 };
/* What capture R32 refuses: absent, not a string, blank, over REASON_MAX code points. */
const REASONLESS = [undefined, null, 7, "", "   \n\t", "x".repeat(REASON_MAX + 1)];

test("R36 (capture R32, C-118.7; DEC-88 (2), K1037): the `pulled` resolve at the record store's door refuses a reason absent, not a string, blank or over 2,000 characters RESOLVE_NO_REASON at 400 with capture's own row, and nothing is written — the knock still new, no receipt, no capture, no bundle (negative control: 2,000 characters is a reason)", async () => {
  const r = await record();
  const k = await r.knock();
  assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED);
  const row = CAPTURE_CHECKS.RESOLVE_NO_REASON;
  for (const reason of REASONLESS) {
    const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST",
                         { knockId: k.knockId, status: "pulled", ...(reason === undefined ? {} : { reason }) });
    const x = a.json.result;
    assert.deepEqual([a.status, a.json.ok, x.ok, x.reason, x.code, x.check, x.translation, x.status],
                     [200, true, false, "RESOLVE_NO_REASON", "RESOLVE_NO_REASON", row.check, row.translation, 400], String(reason).slice(0, 20));
    assert.equal(row.check, "C-118.7");
    assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED, `nothing written for ${JSON.stringify(reason)?.slice(0, 20)}`);
  }
  /* a knock no knock answers to is refused first (capture's order), with nothing written */
  const none = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: "KNOCK-none", status: "pulled" });
  assert.equal(none.json.result.reason, "NO_SUCH_KNOCK");
  /* negative control: exactly REASON_MAX code points is admitted */
  const max = "é".repeat(REASON_MAX);
  const ok = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: k.knockId, status: "pulled", reason: max });
  assert.equal(ok.json.result.ok, true, JSON.stringify(ok.json).slice(0, 300));
  assert.equal(r.held(k.knockId, k.sha256).status, "pulled");
});

test("R36 (capture R32, R65; DEC-88 (2), K1037): a reasoned `pulled` resolve is the pull with its promotion — the knock pulled by the member, its receipt, one new information bundle at collected holding the capture, the puller its author; `op=inboxpull` asked directly takes no reason, whatever its body carries", async () => {
  const r = await record();
  const k = await r.knock("the minutes they did not publish");
  const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST",
                       { knockId: k.knockId, status: "pulled", reason: "this is the agenda packet we asked for" });
  const x = a.json.result;
  assert.deepEqual([x.ok, x.existed], [true, false], JSON.stringify(a.json).slice(0, 300));
  assert.match(x.bundle.bundleId, /^INFO-\d{4}-0001-doorbell-knock$/);
  const { resolve_reason: _recorded, ...held } = r.held(k.knockId, k.sha256);   /* the row's reason: the test below */
  assert.deepEqual(held, { status: "pulled", capture_sha: k.sha256, pulled_by: "ann", receipt: true, home: x.bundle.bundleId, bundles: 1 });
  const head = recordOf(r.ctx).head(x.bundle.bundleId);
  assert.deepEqual([head.type, head.currentState], ["information", "collected"]);
  assert.match(recordOf(r.ctx).readFile(x.bundle.bundleId, "bundle.md").text, / \| Collected \| ann$/m);
  /* the direct pull: no resolve stamp, so a reason in its body is not the resolve's and is not recorded */
  const e = await r.knock("another");
  const d = await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId, status: "pulled", reason: "smuggled" });
  assert.equal(d.json.result.ok, true);
  assert.deepEqual([r.held(e.knockId, e.sha256).status, r.held(e.knockId, e.sha256).resolve_reason], ["pulled", null]);
  /* negative control: and the direct pull needs none — a reasonless direct pull is admitted */
  const f = await r.knock("a third");
  assert.equal((await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: f.knockId })).json.result.ok, true);
});

test("R36 (capture R32; DEC-88 (2); N499, K1117): an admitted `pulled` resolve's reason is recorded on the knock's row with the pull, through capture's `inboxResolve` (negative control: a direct pull records none)", async () => {
  const r = await record();
  const k = await r.knock("the reason's row");
  const a = await r.go(`inboxpullfile?${SESSION}&resolve=pulled`, "POST", { knockId: k.knockId, status: "pulled", reason: "worth a look" });
  assert.equal(a.json.result.ok, true);
  assert.deepEqual([r.held(k.knockId, k.sha256).status, r.held(k.knockId, k.sha256).resolve_reason], ["pulled", "worth a look"]);
  /* the reason is the row's, written with the pull: the knock's bundle is the one filed in the same act */
  assert.equal(r.held(k.knockId, k.sha256).home, a.json.result.bundle.bundleId);
  /* negative control: a direct pull of another knock records no reason */
  const e = await r.knock("pulled directly");
  assert.equal((await r.go(`inboxpullfile?${SESSION}`, "POST", { knockId: e.knockId, reason: "not taken" })).json.result.ok, true);
  assert.deepEqual([r.held(e.knockId, e.sha256).status, r.held(e.knockId, e.sha256).resolve_reason], ["pulled", null]);
});

test("R36 (capture R65's `within`; DEC-88 (2)): the reasoned `pulled` resolve and its promotion are one act — a promotion that refuses, or throws, leaves neither written: the knock new, no reason on its row, no receipt, no bundle", async () => {
  for (const fault of [{ ok: false, reason: "PROMOTE_REFUSED_HERE", detail: "raced" }, "throw"]) {
    const r = await record();
    const k = await r.knock(`one act ${JSON.stringify(fault)}`);
    let asked = 0;
    const promotion = { promote() { asked++; if (fault === "throw") throw new Error("a store fault"); return fault; } };
    const deps = { capture: captureOf(r.ctx), promotion, record: recordOf(r.ctx), provenance: provenanceOf(r.ctx) };
    const out = await P.pullAndFile(deps, { knockId: k.knockId, by: "ann", identity: "member:ann", viewer: "member:ann",
                                            resolve: true, reason: "worth a look" });
    assert.equal(out.ok, false, JSON.stringify(out).slice(0, 300));
    assert.equal(asked, 1, "the promotion is asked once, inside the pull");
    assert.equal(JSON.stringify(out).includes("a store fault"), false);
    assert.deepEqual(r.held(k.knockId, k.sha256), UNTOUCHED, "the resolve was rolled back with its promotion");
  }
});

test("R36, R17 (DEC-88 (2)): the Worker routes `inboxresolve` at `pulled` as the pull and marks it `resolve=pulled` — its body, the reason in it, whole — while a caller's own `resolve` never reaches the store: deleted on `op=inboxpull`, and the other statuses stay `inboxresolve`'s, unmarked", async () => {
  const { env, S } = world();
  env.calls.length = 0;
  await call(env, { op: "inboxresolve", token: S.ann, params: { resolve: FORGED }, method: "POST",
                    body: { knockId: "KNOCK-1", status: "pulled", reason: "worth a look" } });
  let [inner] = opCalls(env);
  assert.deepEqual([inner.route, inner.params.resolve, inner.body], ["inboxpullfile", "pulled",
                   { knockId: "KNOCK-1", status: "pulled", reason: "worth a look" }]);
  /* negative controls: op=inboxpull asked directly is never marked, whatever the caller sends */
  for (const params of [{}, { resolve: "pulled" }]) {
    env.calls.length = 0;
    await call(env, { op: "inboxpull", token: S.ann, params, method: "POST", body: { knockId: "KNOCK-1", status: "pulled", reason: "r" } });
    [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.params.resolve ?? null], ["inboxpullfile", null], JSON.stringify(params));
  }
  env.calls.length = 0;
  await call(env, { op: "inboxresolve", token: S.ann, method: "POST", body: { knockId: "KNOCK-1", status: "discarded", reason: "r" } });
  [inner] = opCalls(env);
  assert.deepEqual([inner.route, inner.body.reason, "resolve" in inner.params], ["inboxresolve", "r", false]);
});

test("R23, R36 (capture R32, R79, R81; K1037): a refusal of the resolve, the pull or the inbox list that states its status is answered at it — RESOLVE_NO_REASON 400, NO_SUCH_KNOCK 404, KNOCK_DISCARDED 409, a bad sort 400 — and one stating none, or none in 400–599, at the forward's own; the store's envelope is kept", async () => {
  const cases = [
    ["inboxresolve", { knockId: "K", status: "discarded" }, { ok: false, reason: "RESOLVE_NO_REASON", status: 400 }, 400],
    ["inboxresolve", { knockId: "K", status: "new" }, { ok: false, reason: "NO_SUCH_KNOCK" }, 404],
    ["inboxresolve", { knockId: "K", status: "discarded" }, { ok: false, reason: "BAD_STATUS" }, 200],
    ["inboxresolve", { knockId: "K", status: "pulled", reason: "r" }, { ok: false, reason: "KNOCK_DISCARDED", status: 409 }, 409],
    ["inboxresolve", { knockId: "K", status: "pulled" }, { ok: false, reason: "RESOLVE_NO_REASON", status: 400 }, 400],
    ["inboxpull", { knockId: "K" }, { ok: false, reason: "PULL_WITHIN_FAILED", status: 500 }, 500],
    ["inbox", undefined, { ok: false, reason: "REQUIRED_ARGUMENT_MISSING", argument: "sort", status: 400 }, 400],
    /* negative controls: no status, a status out of range, or a success */
    ["inboxresolve", { knockId: "K", status: "discarded" }, { ok: false, reason: "X", status: 302 }, 200],
    ["inbox", undefined, { ok: false, reason: "X" }, 200],
    ["inboxresolve", { knockId: "K", status: "discarded", reason: "r" }, { ok: true, status: 404 }, 200],
  ];
  const ROUTE = { inboxresolve: "inboxresolve", inboxpull: "inboxpullfile", inbox: "inboxlist" };
  for (const [op, body, result, status] of cases) {
    const route = op === "inboxresolve" && body.status === "pulled" ? "inboxpullfile" : ROUTE[op];
    const w = world({ answer: (c) => (c.route === route ? new Response(JSON.stringify({ ok: true, result })) : null) });
    const r = await call(w.env, { op, token: w.S.ann, method: body ? "POST" : "GET", body });
    assert.equal(r.status, status, `${op} ${JSON.stringify(result)}`);
    assert.deepEqual([r.json.ok, r.json.result.reason ?? null, r.json.store, r.json.tokenClass], [true, result.reason ?? null, "bio", "member"]);
  }
});

test("R2, R26 (capture R32's sort, DEC-108 (2), K1023): `op=inbox`'s `sort`, `dir`, `limit` and `after` reach capture's `inboxList` as the caller sent them, for every caller the op admits; capture sorts by them, and an unknown sort or dir is capture's own required-argument refusal, naming it, with nothing read", async () => {
  const { env, S } = world();
  for (const [token, params] of [[S.ann, {}], [S.founder, {}], [env.MEMBER_TOKEN, {}], [env.PROBE_TOKEN, { store: "scratch" }]]) {
    env.calls.length = 0;
    const r = await call(env, { op: "inbox", token, params: { ...params, status: "new", sort: "project", dir: "asc", limit: "5", after: "C" } });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.params.status, inner.params.sort, inner.params.dir, inner.params.limit, inner.params.after],
                     ["inboxlist", "new", "project", "asc", "5", "C"]);
  }
  /* at the record store's door, capture real */
  const r = await record();
  const a = await r.knock("first"), b = await r.knock("second");
  for (const [sort, dir] of [["received", "desc"], ["received", "asc"], ["status", "asc"], ["secret", "desc"], ["project", "asc"]]) {
    const x = (await r.go(`inboxlist?sort=${sort}&dir=${dir}`)).json.result;
    assert.deepEqual([x.sort, x.dir, x.inbox.length], [sort, dir, 2], `${sort} ${dir}`);
  }
  const asc = (await r.go("inboxlist?sort=received&dir=asc")).json.result.inbox.map((k) => k.knock_id);
  const desc = (await r.go("inboxlist?sort=received&dir=desc")).json.result.inbox.map((k) => k.knock_id);
  assert.deepEqual(new Set(asc), new Set([a.knockId, b.knockId]));
  assert.deepEqual(asc, [...desc].reverse());
  for (const [q, argument] of [["sort=nonsense", "sort"], ["dir=sideways", "dir"]]) {
    const x = (await r.go(`inboxlist?${q}`)).json.result;
    assert.deepEqual([x.ok, x.reason, x.argument, x.status], [false, "REQUIRED_ARGUMENT_MISSING", argument, 400], q);
  }
  /* negative control: no sort is capture's default, received, newest first */
  assert.deepEqual([(await r.go("inboxlist")).json.result.sort, (await r.go("inboxlist")).json.result.dir], ["received", "desc"]);
});
