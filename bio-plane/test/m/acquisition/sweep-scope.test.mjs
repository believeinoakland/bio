/* acquisition R31 (link-sweep R1, R5, R6; K1036, K1126): a sweep-origin acquire, declared in process as
   `{kind: "sweep", matched_sweep, deeming_actor}` (link-sweep R5's shape) on the capture-request arm, carries `scope`;
   a redirect out of scope is not followed and answers SWEEP_REDIRECT_OUT_OF_SCOPE with its target, nothing fetched at
   it and nothing filed; no scope is SWEEP_SCOPE_MISSING with nothing fetched. capture-requests R38's drain origin (no
   `kind`) is not a sweep origin, and a body's `matchedSweep` sets none. Each refusal carries its row (R29's form) and
   has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text } from "./fixture.mjs";
import { SWEEP_SCOPE_CHECKS, ACQUISITION_CHECKS } from "../../../src/acquisition/index.mjs";

const SWEEP = { kind: "sweep", matched_sweep: "INFO-2026-0001-listing#s1", deeming_actor: "bio-monitor" };
const SEED = "https://s.example/news/list";
const sweep = (w, routes, captureRequest) => run(w, routes, {}, { cls: "daemon", member: false, sessMember: null,
  captureRequest: { locator: SEED, purpose: "gathering", agent: null, render: false, origin: SWEEP, ...captureRequest } });
const redirect = (to, status = 302) => () => new Response("", { status, headers: { location: to } });
const nothingFiled = (w, r, what) => {
  assert.equal(r.body.document, undefined, `${what}: no document`);
  assert.deepEqual([w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0], `${what}: nothing filed or stored`);
};
const ROW = (code) => [SWEEP_SCOPE_CHECKS[code].check, SWEEP_SCOPE_CHECKS[code].translation];

test("R31 R29: a sweep-origin acquire without scope is refused SWEEP_SCOPE_MISSING with its row, nothing fetched or filed; with scope it files as the sweep", async () => {
  for (const scope of [undefined, null, [], "https://s.example/", [""], [7]]) {
    const w = world();
    const r = await sweep(w, { [SEED]: text("list") }, scope === undefined ? {} : { scope });
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.code, r.body.check, r.body.translation],
                     [400, false, "SWEEP_SCOPE_MISSING", "SWEEP_SCOPE_MISSING", ...ROW("SWEEP_SCOPE_MISSING")], JSON.stringify(scope));
    assert.equal(r.net.seen.length, 0, "nothing fetched");
    nothingFiled(w, r, JSON.stringify(scope));
  }
  /* negative control: the same act with its scope files, under the sweep's own origin */
  const w = world();
  const ok = await sweep(w, { [SEED]: text("list") }, { scope: ["https://s.example/news"] });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body.document.origin, SWEEP);
  /* capture-requests R38's drain origin (no kind) is not a sweep origin: no scope is asked of it */
  const drain = await sweep(world(), { [SEED]: text("list") }, { origin: { matched_sweep: "INQ-2026-0001-q", deeming_actor: "run" } });
  assert.deepEqual([drain.status, drain.body.document.origin.kind], [200, "sweep"]);
  assert.equal(ACQUISITION_CHECKS.SWEEP_SCOPE_MISSING, SWEEP_SCOPE_CHECKS.SWEEP_SCOPE_MISSING, "the row is in this module's table");
});

test("R31 R29: a redirect out of the sweep's scope is not followed: SWEEP_REDIRECT_OUT_OF_SCOPE names its target, nothing at it is fetched and nothing is filed", async () => {
  const scope = ["https://s.example/news"];
  for (const [to, target] of [["https://other.example/x", "https://other.example/x"], ["/newsletter", "https://s.example/newsletter"],
                              ["http://s.example/news/a", "http://s.example/news/a"], ["https://s.example/", "https://s.example/"]]) {
    const w = world();
    const r = await sweep(w, { [SEED]: redirect(to), [target]: text("must not be fetched") }, { scope });
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.code, r.body.target, r.body.check, r.body.translation],
                     [422, false, "SWEEP_REDIRECT_OUT_OF_SCOPE", "SWEEP_REDIRECT_OUT_OF_SCOPE", target, ...ROW("SWEEP_REDIRECT_OUT_OF_SCOPE")], to);
    assert.deepEqual(r.net.seen.map((x) => x.url), [SEED], `${to}: nothing at the target is fetched`);
    assert.equal(r.net.seen[0].init.redirect, "manual", "the runtime never follows a sweep's redirect");
    nothingFiled(w, r, to);
    assert.ok(w.gov.calls.some((c) => c[0] === "report" && c[2] === 302), "the redirect itself was reported to the governor");
  }
  /* a later hop out of scope is caught as the first is */
  const w = world();
  const deep = await sweep(w, { [SEED]: redirect("/news/b"), "https://s.example/news/b": redirect("https://evil.example/"),
                                "https://evil.example/": text("x") }, { scope });
  assert.deepEqual([deep.status, deep.body.reason, deep.body.target, deep.body.redirected_from], [422, "SWEEP_REDIRECT_OUT_OF_SCOPE", "https://evil.example/", "https://s.example/news/b"]);
  assert.deepEqual(deep.net.seen.map((x) => x.url), [SEED, "https://s.example/news/b"]);
  nothingFiled(w, deep, "second hop");
});

test("R31 R9 R13 R14: a redirect within the sweep's scope is followed hop by hop through the governor, and the capture filed under where it resolved", async () => {
  const w = world();
  const final = "https://s.example/news/2026/item";
  const r = await sweep(w, { [SEED]: redirect("/news/2026/"), "https://s.example/news/2026/": redirect("item", 301), [final]: text("the item") },
                        { scope: ["https://s.example/news"] });
  assert.equal(r.status, 200);
  assert.deepEqual(r.net.seen.map((x) => x.url), [SEED, "https://s.example/news/2026/", final]);
  assert.equal(w.gov.calls.filter((c) => c[0] === "admit" && c[1] === "s.example").length, 3, "each hop admitted by the governor");
  const d = r.body.document;
  assert.deepEqual([d.capture.transport.requested, d.capture.transport.resolved, d.capture.transport.redirected], [SEED, final, true]);
  assert.equal(w.prov.receipts[0].address, final, "the receipt names where the bytes resolved");
  assert.deepEqual(d.origin, SWEEP);
  /* an exact prefix is in scope */
  const exact = await sweep(world(), { [SEED]: redirect("https://s.example/news"), "https://s.example/news": text("n") }, { scope: ["https://s.example/news"] });
  assert.equal(exact.status, 200);
});

test("R31: a body's matchedSweep sets no sweep origin, on op=acquire or on the drain's arm (K1126)", async () => {
  const member = await run(world(), { [SEED]: text("x") }, { locator: SEED, matchedSweep: "INFO-2026-0001-listing#s1" });
  assert.deepEqual(member.body.document.origin, { kind: "named_request" });
  const admin = await run(world(), { [SEED]: text("x") }, { locator: SEED, matchedSweep: "S-2", scope: ["https://evil.example/"] }, { cls: "admin", member: false, sessMember: null });
  assert.deepEqual([admin.status, admin.body.document.origin], [200, { kind: "named_request" }], "a body's scope is no scope either");
  const arm = await run(world(), { [SEED]: text("x") }, { matchedSweep: "FORGED" }, { cls: "daemon", member: false, sessMember: null,
    captureRequest: { locator: SEED, purpose: "p", agent: null, render: false } });
  assert.deepEqual(arm.body.document.origin, { kind: "named_request" });
});
