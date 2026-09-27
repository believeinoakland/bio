/* promotion's `reopen` — requirement-named tests (build/requirements/promotion.md R21–R26). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, create, T0 } from "./fixtures.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";
import { EDGE_REASON_MAX, REOPENABLE_FROM } from "../../../src/promotion/index.mjs";

const ID = "INQ-2026-0001";
const inq = (state, extra = {}) => doc({ id: ID, object_type: "inquiry", title: "Where did the fund go?", current_state: state,
  prior_state: "open", created: T0, last_updated: T0, group: "test-group", disposition_reason: "\"set aside\"",
  case_id: "CASE-2026-0001", case_edition: 1, state_history: "[]", ...extra },
  "\n## Question\n\nWhere did the fund go?\n\n## Session Log\n\n### Session x | Formation | agent\n\n## Review Notes\n");

function setup(state = "deferred", opts = {}) {
  const env = makePromotion(opts);
  const r = env.p.promote({ ...create(ID, inq(state)), replay: true,
    files: [{ path: "bundle.md", text: inq(state) }, { path: "data/notes.txt", text: "carried" },
            { path: "data/cap.pdf", blobSha: "a".repeat(64), bytes: 10 }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { ...env, first: r };
}
const call = (p, over = {}) => p.reopen({ target: ID, reason: "new evidence arrived", viewer: "member:ann", author: "member:ann", ...over });

test("R21: an empty author or a machine identity is refused MACHINE_CANNOT_REOPEN before anything else", () => {
  const { p } = setup();
  for (const author of [null, "", "  ", "token:ai", "token:mechanical"])
    assert.equal(p.reopen({ target: null, reason: "", author }).reason, "MACHINE_CANNOT_REOPEN");
});

test("R22: the reason is required, bounded and free of quotes, backslashes and newlines", () => {
  const { p } = setup();
  assert.equal(call(p, { reason: "" }).reason, "NO_REASON");
  assert.equal(call(p, { reason: "   " }).reason, "NO_REASON");
  assert.equal(call(p, { reason: "x".repeat(EDGE_REASON_MAX + 1) }).reason, "BAD_REASON");
  for (const bad of ['a "quote"', "back\\slash", "new\nline"]) assert.equal(call(p, { reason: bad }).reason, "BAD_REASON");
  assert.equal(call(p, { reason: "x".repeat(EDGE_REASON_MAX) }).ok, true);
});

test("R23: NO_TARGET; absent and unseen targets answer NO_SUCH_BUNDLE identically; NOT_AN_INQUIRY; NO_DOCUMENT", () => {
  const { p, record, membership } = setup();
  assert.equal(call(p, { target: "" }).reason, "NO_TARGET");
  const absent = call(p, { target: "INQ-2026-0404" });
  membership.hidden.add(ID);
  const unseen = call(p);
  assert.deepEqual({ ...unseen, target: null }, { ...absent, target: null });
  assert.equal(absent.reason, "NO_SUCH_BUNDLE");
  membership.hidden.delete(ID);
  assert.equal(call(p, { viewer: null }).reason, "NO_SUCH_BUNDLE");
  const info = "INFO-2026-0001";
  p.promote(create(info, doc({ id: info, object_type: "information", title: "I", current_state: "collected", created: T0, last_updated: T0 })));
  assert.equal(call(p, { target: info }).reason, "NOT_AN_INQUIRY");
  record.db.prepare("UPDATE files SET content=NULL, blob_sha='b' WHERE bundle_id=? AND path='bundle.md'").run(ID);
  assert.equal(call(p).reason, "NO_DOCUMENT");
});

test("R24: reopenable from a disposition or as a case member; otherwise NOT_SET_DOWN; an undeclared move is ILLEGAL_TRANSITION", () => {
  assert.deepEqual(REOPENABLE_FROM, ["deferred", "dismissed"]);
  for (const s of REOPENABLE_FROM) assert.equal(call(setup(s).p).ok, true);
  const conc = setup("concluded");
  const r = call(conc.p);
  assert.deepEqual([r.reason, r.from, r.reopenable], ["NOT_SET_DOWN", "concluded", REOPENABLE_FROM]);
  const member = setup("concluded", { caseMember: new Set([ID]) });
  assert.equal(call(member.p).ok, true);
  const open = setup("open", { caseMember: new Set([ID]) });
  assert.equal(call(open.p).reason, "ILLEGAL_TRANSITION");
  const divided = setup("divided", { caseMember: new Set([ID]) });
  assert.equal(call(divided.p).reason, "ILLEGAL_TRANSITION");
});

test("R25: reopening is a new promotion over the head: state history, Session Log, prior/current state, cleared disposition and edition, carried files", () => {
  const { p, record, first } = setup("dismissed");
  const r = call(p);
  assert.deepEqual([r.ok, r.from, r.to, r.why, r.author, r.weight], [true, "dismissed", "open", "new evidence arrived", "member:ann", "single"]);
  const text = record.readFile(ID, "bundle.md").text;
  const fm = parseFrontmatter(text).data;
  assert.deepEqual([fm.current_state, fm.prior_state, fm.disposition_reason, fm.case_edition, fm.case_id],
                   ["open", "dismissed", "", null, "CASE-2026-0001"]);
  assert.equal(fm.last_updated, r.at);
  assert.deepEqual(fm.state_history.at(-1), { timestamp: r.at, from_state: "dismissed", to_state: "open",
                                               blurb: "new evidence arrived", author: "member:ann" });
  assert.match(text, new RegExp(`### Session ${r.at} \\| Reopened \\| member:ann\\nTrigger: op=reopen on ${ID}`));
  assert.equal(record.head(ID).currentState, "open");
  assert.equal(record.one("SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?", ID).n, 2);
  assert.equal(record.readFile(ID, "data/notes.txt").text, "carried");
  assert.equal(record.readFile(ID, "data/cap.pdf").blobSha, "a".repeat(64));
  assert.ok(record.one("SELECT 1 AS x FROM history WHERE bundle_id=? AND sha256=?", ID, first.bundleSha));
  /* Every rule of promote applies: a later module's refusal refuses the reopening, returned with target. */
  const again = setup("deferred");
  again.p.registerStep("later", { check: () => ({ ok: false, reason: "LATER_SAYS_NO" }) });
  assert.deepEqual([call(again.p).reason, call(again.p).target], ["LATER_SAYS_NO", ID]);
  /* A state_history block that cannot be extended is refused. */
  const bad = makePromotion();
  const t = inq("deferred", { state_history: "oops" });
  assert.equal(bad.p.promote({ ...create(ID, t), replay: true }).ok, true);
  assert.equal(call(bad.p).reason, "UNSPLICEABLE_STATE_HISTORY");
});

test("R26: a live edge citing the target does not refuse a reopening", () => {
  const { p } = setup("deferred", { citedBy: { [ID]: ["INQ-2026-0099"] } });
  assert.equal(call(p).ok, true);
});

const tick = () => new Promise((r) => setTimeout(r, 0));

test("R46: onReopened — after an accepted reopening commits, every listener is called once, in the modules' total order, with {target, from, at, author, viewer}; its object answer joins the reply under its module id", async () => {
  const { makeRecord, makeMembership } = await import("./fixtures.mjs");
  const { promotionOf } = await import("../../../src/promotion/index.mjs");
  const record = makeRecord();
  const p = promotionOf({}, { record, membership: makeMembership(), order: ["reevaluation", "later", "legacy-store"],
                              now: () => "2026-09-27T10:00:00.000Z" });
  p.registerFact("producingGroup", "legacy-store", () => "test-group");
  p.registerFact("caseMember", "legacy-store", () => false);
  assert.equal(p.promote({ ...create(ID, inq("deferred")), replay: true }).ok, true);
  const seen = [];
  /* Registered out of order; called in the modules' order. Each sees the reopening committed. */
  for (const [m, out] of [["legacy-store", undefined], ["later", null], ["reevaluation", { raised: ["INQ-2026-0009"] }]])
    assert.deepEqual(p.onReopened(m, (n) => { seen.push([m, n, record.head(n.target).currentState]); return out; }), { ok: true, module: m });
  const r = call(p);
  assert.equal(r.ok, true, JSON.stringify(r));
  const n = { target: ID, from: "deferred", at: "2026-09-27T10:00:00Z", author: "member:ann", viewer: "member:ann" };
  assert.deepEqual(seen, [["reevaluation", n, "open"], ["later", n, "open"], ["legacy-store", n, "open"]]);
  /* The listener's object joins under its module id; null and undefined add nothing; reopen's own keys stand. */
  assert.deepEqual(r, { ok: true, target: ID, from: "deferred", to: "open", why: "new evidence arrived", author: "member:ann",
                        at: n.at, weight: "single", reevaluation: { raised: ["INQ-2026-0009"] } });
  /* Once per module: a second registration is LISTENER_DECLARED; one naming no module or no function is refused. */
  assert.equal(p.onReopened("reevaluation", () => ({})).reason, "LISTENER_DECLARED");
  for (const [m, fn] of [["", () => null], [null, () => null], ["x", null]]) assert.equal(p.onReopened(m, fn).reason, "LISTENER_MALFORMED");
  /* onReopened and onCommitted are separate registrations: one does not declare the other. */
  assert.equal(p.onCommitted("reevaluation", () => null).ok, true);
  /* A listener cannot replace a key of reopen's own answer. */
  const env = setup();
  env.p.onReopened("target", () => ({ forged: true }));
  env.p.onReopened("weight", () => "not an object");
  const r2 = call(env.p);
  assert.deepEqual([r2.ok, r2.target, r2.weight], [true, ID, "single"]);
});

test("R46: never for a refused reopening — whatever refused it, the reopen's own fences or a rule of promote", async () => {
  const { p, record } = setup("concluded");
  let called = 0;
  p.onReopened("later", () => { called++; return { x: 1 }; });
  const refused = [call(p, { author: "token:ai" }), call(p, { reason: "" }), call(p, { target: "" }), call(p, { target: "INQ-2026-0404" }),
                   call(p) /* NOT_SET_DOWN */];
  const again = setup("deferred");
  again.p.onReopened("later", () => { called++; return { x: 1 }; });
  again.p.registerStep("step", { check: () => ({ ok: false, reason: "LATER_SAYS_NO" }) });
  refused.push(call(again.p));
  assert.deepEqual(refused.map((r) => r.reason),
                   ["MACHINE_CANNOT_REOPEN", "NO_REASON", "NO_TARGET", "NO_SUCH_BUNDLE", "NOT_SET_DOWN", "LATER_SAYS_NO"]);
  for (const r of refused) assert.equal("x" in r || "later" in r, false);
  await tick();
  assert.equal(called, 0);
  assert.equal(record.head(ID).currentState, "concluded");
});

test("R46: a listener that throws, rejects or answers later adds nothing and changes neither the reopening's answer, what it wrote, nor another listener's call", async () => {
  const run = async (bad) => {
    const env = setup("dismissed");
    const order = [];
    env.p.onReopened("a-bad", (n) => { order.push("a"); return bad(n); });
    env.p.onReopened("b-good", () => { order.push("b"); return { fine: true }; });
    const r = call(env.p);
    const written = env.record.dump();
    await tick(); await tick();
    assert.equal(env.record.dump(), written);
    return { r, order, env };
  };
  const base = await run(() => null);
  for (const bad of [() => { throw new Error("boom"); }, async () => { throw new Error("later boom"); },
                     async () => ({ late: true }), () => Promise.reject(new Error("rejected"))]) {
    const { r, order, env } = await run(bad);
    assert.deepEqual(order, ["a", "b"]);
    assert.deepEqual(r, base.r);
    assert.deepEqual(r["b-good"], { fine: true });
    assert.equal("a-bad" in r, false);
    assert.equal(env.record.head(ID).currentState, "open");
  }
});
