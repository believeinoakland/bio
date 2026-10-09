/* ai-use R6 (the exploring gate) and R9 (the daily ask), and R10, R11 (cost before and after), at the interface, each
   with a negative control (K874). The explorer itself is not built here (B9; N815): the gate and the ask are tested
   without it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, WORDS } from "./fixture.mjs";
import { ESTIMATE_SAMPLE, aiUseOps } from "../../../src/ai-use/index.mjs";

const AT = "2026-10-09T12:00:00Z";
const explore = (w, owner, on, by) => w.c.accountUsesSet({ owner, switch: "explore", on, by });

/* A world with a question INQ-1 drawn on by P, INQ-2 drawn on by no project, and a document that is no question. */
async function exploring() {
  const w = await standard();
  w.bundle("INQ-1", "inquiry");
  w.bundle("INQ-2", "inquiry");
  w.bundle("INFO-1", "information");
  w.cite("P", "INQ-1");
  return w;
}

/* ===== R6 ===== */

test("R6 exploreAllowed refuses EXPLORE_NOT_ENABLED when the owner's explore is no (the default), on every kind of account; at yes it passes with the machine's label naming the owner", async () => {
  const w = await exploring();
  for (const owner of ["group", "project:P", "member:ann"]) {
    const r = w.u.exploreAllowed({ owner, question: "INQ-1", at: AT });
    assert.deepEqual([r.code, r.check], ["EXPLORE_NOT_ENABLED", "C-143.4"], owner);
  }
  explore(w, "group", "yes", "admin");
  explore(w, "project:P", "yes", "ann");
  assert.deepEqual(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }),
    { ok: true, ask: false, owner: "group", label: { kind: "machine", enabled_by: "group" } });
  assert.deepEqual(w.u.exploreAllowed({ owner: "project:P", question: "INQ-1", at: AT }).label, { kind: "machine", enabled_by: "project:P" });
});

test("R6 at ask, it answers {ask: true} until the owner approves that local day (R9), then passes; another day asks again", async () => {
  const w = await exploring();
  explore(w, "group", "ask", "admin");
  assert.deepEqual(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }), { ok: true, ask: true, owner: "group" });
  assert.equal(w.u.exploreApprove({ owner: "group", day: "2026-10-09", by: "second", at: AT }).ok, true);
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).ask, false);
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: "2026-10-10T12:00:00Z" }).ask, true);
});

test("R6 R3's AI_LIMIT_REACHED, by its overall limit and by its explore limit; under them it passes (control)", async () => {
  const w = await exploring();
  explore(w, "group", "yes", "admin");
  w.u.aiLimitSet({ owner: "group", scope: "explore", unit: "calls", period: "day", amount: 1, by: "admin" });
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).ask, false);
  w.count("group", "ann", "explore", { mode: "explore" });
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).scope, "explore");
  w.u.aiLimitSet({ owner: "group", scope: "explore", unit: "calls", period: "day", amount: null, by: "admin" });
  w.u.aiLimitSet({ owner: "group", scope: "overall", unit: "calls", period: "day", amount: 1, by: "admin" });
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).scope, "overall");
});

test("R6 credentials.aiKeptAway({use: explore}) refuses: the group's keep-away on explore, and a project's own on explore for the project's account; one not covering explore does not (control)", async () => {
  const w = await exploring();
  explore(w, "group", "yes", "admin");
  explore(w, "project:P", "yes", "ann");
  assert.equal(w.c.aiKeepAwaySet({ on: true, uses: ["ask"], reason: "not ask", by: "admin" }).ok, true);
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).ok, true, "a keep-away on ask alone");
  w.c.aiKeepAwaySet({ on: true, uses: ["explore"], reason: "no exploring", by: "admin" });
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).code, "AI_KEPT_AWAY");
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: ["explore"], reason: "ours", by: "ann" });
  assert.equal(w.u.exploreAllowed({ owner: "project:P", question: "INQ-1", at: AT }).code, "PROJECT_AI_KEPT_AWAY");
});

test("R6 the question outside the owner's scope is refused EXPLORE_OUT_OF_SCOPE: the group's is every question the record holds, a project's those it draws on (citesInto), a member's none (D36)", async () => {
  const w = await exploring();
  explore(w, "group", "yes", "admin");
  explore(w, "project:P", "yes", "ann");
  w.c.subscriptionConnected({ member: "cy" });
  explore(w, "member:ann", "yes", "ann");
  const out = (owner, q) => w.u.exploreAllowed({ owner, question: q, at: AT });
  assert.equal(out("group", "INQ-2").ok, true);
  for (const q of ["INFO-1", "NOPE-1", null]) assert.deepEqual([out("group", q).code, out("group", q).check], ["EXPLORE_OUT_OF_SCOPE", "C-143.5"], String(q));
  assert.equal(out("project:P", "INQ-1").ok, true);
  assert.equal(out("project:P", "INQ-2").code, "EXPLORE_OUT_OF_SCOPE", "P does not draw on INQ-2");
  assert.equal(out("member:ann", "INQ-1").code, "EXPLORE_OUT_OF_SCOPE");
});

test("R6 for the group, a question every project it is drawn on keeps from explore (projectsKeptAway) is refused; drawn on by one that does not, it passes (control)", async () => {
  const w = await exploring();
  explore(w, "group", "yes", "admin");
  w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: ["explore"], reason: "ours", by: "ann" });
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).code, "PROJECT_AI_KEPT_AWAY");
  w.project("Q", "bob");
  w.cite("Q", "INQ-1");
  assert.equal(w.u.exploreAllowed({ owner: "group", question: "INQ-1", at: AT }).ok, true);
});

test("R6 it writes nothing and never throws", async () => {
  const w = await exploring();
  explore(w, "group", "ask", "admin");
  const before = w.snapshot();
  for (const a of [{}, { owner: "group" }, { owner: "x", question: "INQ-1" }, { owner: "group", question: "INQ-1", at: AT }])
    assert.doesNotThrow(() => w.u.exploreAllowed(a));
  assert.equal(w.snapshot(), before);
});

/* ===== R9 ===== */

test("R9 exploreAsk records at most one pending ask an owner and local day, for an owner whose explore is ask; a second ask that day answers the first's key and mints nothing; at no or yes it is refused EXPLORE_NOT_ENABLED", async () => {
  const w = await exploring();
  assert.equal(w.u.exploreAsk({ owner: "group", at: AT, what: "INQ-1" }).code, "EXPLORE_NOT_ENABLED");
  explore(w, "group", "yes", "admin");
  assert.equal(w.u.exploreAsk({ owner: "group", at: AT, what: "INQ-1" }).code, "EXPLORE_NOT_ENABLED", "yes needs no ask");
  explore(w, "group", "ask", "admin");
  const a = w.u.exploreAsk({ owner: "group", at: AT, what: ["What did the council vote?", "Who signed?"] });
  assert.deepEqual(a, { ok: true, key: "explore-ask:group:2026-10-09", owner: "group", day: "2026-10-09", minted: true });
  const before = w.snapshot();
  assert.deepEqual(w.u.exploreAsk({ owner: "group", at: "2026-10-09T18:00:00Z", what: "something else" }),
    { ...a, minted: false });
  assert.equal(w.snapshot(), before, "mints nothing");
  assert.equal(w.u.exploreAsk({ owner: "group", at: "2026-10-10T09:00:00Z", what: "next day" }).minted, true);
  for (const what of [null, "", [], ["ok", 3], "x".repeat(2001)])
    assert.equal(w.u.exploreAsk({ owner: "group", at: AT, what }).code, "EXPLORE_ASK_INVALID", JSON.stringify(what)?.slice(0, 20));
});

test("R9 exploreAsksPending answers today's unapproved asks to the account's owners only, each stating the questions and R10's rough cost, its words ai.queue.exploreask; it writes nothing and never throws; approved, an ask is no longer pending", async () => {
  const w = await exploring();
  explore(w, "project:P", "ask", "ann");
  w.u.exploreAsk({ owner: "project:P", at: AT, what: ["What did the council vote?"] });
  const before = w.snapshot();
  const [item] = w.u.exploreAsksPending({ viewer: "ann", at: AT }).asks;
  assert.deepEqual([item.key, item.owner, item.what, item.word, item.estimate],
    ["explore-ask:project:P:2026-10-09", "project:P", ["What did the council vote?"], "ai.queue.exploreask", "not known yet"]);
  assert.equal(item.text, WORDS["ai.queue.exploreask"].replace("{what}", "What did the council vote?"));
  assert.deepEqual(w.u.exploreAsksPending({ viewer: "bob", at: AT }).asks, [], "a participant who is not an owner");
  assert.deepEqual(w.u.exploreAsksPending({ viewer: "admin", at: AT }).asks, []);
  assert.equal(w.snapshot(), before);
  assert.doesNotThrow(() => w.u.exploreAsksPending({}));
  /* with measured exploring runs, the rough cost is a range */
  for (let i = 0; i < ESTIMATE_SAMPLE.min; i++) w.count("project:P", "ann", "explore", { mode: "explore", act: `RUN-${i}`, cost: 0.1 * (i + 1) });
  assert.deepEqual(w.u.exploreAsksPending({ viewer: "ann", at: AT }).asks[0].estimate.unit, "usd");
  w.u.exploreApprove({ owner: "project:P", day: "2026-10-09", by: "ann", at: AT });
  assert.deepEqual(w.u.exploreAsksPending({ viewer: "ann", at: AT }).asks, []);
});

test("R9 exploreApprove is one of the account's owners' act, refused as R2's for anyone else, writing nothing; a malformed day is refused; silence means no", async () => {
  const w = await exploring();
  explore(w, "project:P", "ask", "ann");
  const before = w.snapshot();
  for (const by of ["bob", "admin", null]) assert.equal(w.u.exploreApprove({ owner: "project:P", day: "2026-10-09", by }).ok, false, String(by));
  assert.equal(w.u.exploreApprove({ owner: "group", day: "2026-10-09", by: "ann" }).code, "NOT_AN_ADMIN");
  assert.equal(w.u.exploreApprove({ owner: "member:ann", day: "2026-10-09", by: "bob" }).code, "NOT_YOUR_CEILING");
  assert.equal(w.u.exploreApprove({ owner: "project:P", day: "9 Oct", by: "ann" }).code, "EXPLORE_ASK_INVALID");
  assert.equal(w.snapshot(), before);
  assert.equal(w.u.exploreAllowed({ owner: "project:P", question: "INQ-1", at: AT }).ask, true, "silence: no");
  const ok = aiUseOps(w.u, new URL("http://x/?by=ann"), { owner: "project:P", day: "2026-10-09", by: "bob" }).exploreapprove();
  assert.deepEqual([ok.ok, ok.approved_by], [true, "member:ann"]);
});

/* ===== R10, R11 ===== */

test("R10 estimate answers \"not known yet\" until 5 acts of that use and mode are measured, then the least and greatest per-act figure over the latest 20, times count: usd when every act stated a cost", async () => {
  const w = await standard();
  const est = (extra = {}) => w.u.estimate({ owner: "project:P", use: "run", mode: "investigate", viewer: "ann", ...extra });
  for (let i = 1; i < ESTIMATE_SAMPLE.min; i++) w.count("project:P", "bob", "run", { mode: "investigate", act: `R${i}`, cost: i / 10, at: `2026-10-0${i}T12:00:00Z` });
  assert.equal(est().estimate, "not known yet");
  w.count("project:P", "bob", "run", { mode: "investigate", act: "R5", cost: 0.5, at: "2026-10-05T12:00:00Z" });
  assert.deepEqual(est().estimate, { low: 0.1, high: 0.5, unit: "usd", measured: 5 });
  assert.deepEqual(est({ count: 3 }).estimate, { low: 0.3, high: 1.5, unit: "usd", measured: 5 });
  /* the latest 20 only */
  for (let i = 0; i < 20; i++) w.count("project:P", "bob", "run", { mode: "investigate", act: `L${i}`, cost: 1, at: `2026-10-08T${String(i).padStart(2, "0")}:00:00Z` });
  assert.deepEqual(est().estimate, { low: 1, high: 1, unit: "usd", measured: 20 });
  /* negative control: another mode, or another account, has its own sample */
  assert.equal(est({ mode: "other" }).estimate, "not known yet");
  assert.equal(w.u.estimate({ owner: "member:ann", use: "run", mode: "investigate", viewer: "ann" }).estimate, "not known yet");
});

test("R10 on a subscription (no cost stated) the range is in tokens and calls; it is answered only to the account's owners", async () => {
  const w = await standard();
  for (let i = 1; i <= 5; i++) w.count("member:ann", "ann", "ask", { act: `A${i}`, input: i * 100, calls: i, cost: null });
  const r = w.u.estimate({ owner: "member:ann", use: "ask", viewer: "ann" });
  assert.deepEqual(r.estimate, { low: 100, high: 500, unit: "tokens", calls: { low: 1, high: 5, unit: "calls" }, measured: 5 });
  assert.equal(w.u.estimate({ owner: "member:ann", use: "ask", viewer: "bob" }).code, "NOT_YOUR_CEILING");
  assert.equal(w.u.estimate({ owner: "group", use: "ask", viewer: "ann" }).code, "NOT_AN_ADMIN");
  assert.equal(w.u.estimate({ owner: "member:ann", use: "nope", viewer: "ann" }).code, "AI_LIMIT_INVALID");
  assert.equal(w.u.estimate({ owner: "member:ann", use: "ask", viewer: "ann", count: 0 }).code, "AI_LIMIT_INVALID");
});

test("R11 actualOf answers a run's or an act's actual cost after, in R10's units, only to the paying account's owners; to anyone else, and for an act not measured, found false", async () => {
  const w = await standard();
  w.count("project:P", "bob", "run", { act: "RUN-9", input: 40, cost: 0.2, calls: 2 });
  w.count("project:P", "bob", "run", { act: "RUN-9", input: 60, cost: 0.3, calls: 1 });
  w.count("member:ann", "ann", "ask", { act: "ASK-1", input: 10, cost: null });
  const r = w.u.actualOf({ run: "RUN-9", viewer: "ann" });
  assert.deepEqual([r.found, r.owner, r.tokens, r.calls, r.unit, r.cost], [true, "project:P", 100, 3, "usd", { usd: 0.5 }]);
  assert.deepEqual(w.u.actualOf({ run: "RUN-9", viewer: "bob" }), { ok: true, found: false }, "bob's act, but not his account");
  assert.deepEqual(w.u.actualOf({ act: "ASK-1", viewer: "ann" }).unit, "tokens");
  assert.equal(w.u.actualOf({ act: "ASK-1", viewer: "ann" }).cost, null);
  assert.deepEqual(w.u.actualOf({ act: "NONE", viewer: "ann" }), { ok: true, found: false });
  assert.deepEqual(w.u.actualOf({ act: "ASK-1", viewer: null }), { ok: true, found: false });
});
