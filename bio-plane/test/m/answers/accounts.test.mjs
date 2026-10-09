/* Accounts and limits (R30; D38, B3; N812, K2373), at the interface, over the real credentials: an ask's account,
   asked of `accountFor` with kind `ask` and its project, judged by the paying account's limits (`ai-use.useCheck`, its
   R3, the test's provider, handed in as the composition root hands it); and R2 widened: every read under a grant drops
   the rows of the projects `credentials.projectsKeptAway` names for the grant's use. Each arm with its negative
   control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { answersWorld, answer, V } from "./fixture.mjs";
import { GRANT_USES, ownerOf } from "../../../src/answers/index.mjs";

const BOB = V("bob"), CAROL = V("carol"), ALICE = V("alice");

test("R30 an ask calls accountFor with kind ask and its project, and is judged by useCheck for the account chosen in place of the ceiling: {ok, account, owner}, or the refusal unchanged; writes nothing", async () => {
  const w = answersWorld();
  const seen = [];
  const real = w.credentials;
  w.a.deps.credentials = new Proxy(real, { get: (t, k) => { const v = t[k]; return typeof v === "function"
    ? (...a) => { if (k === "accountFor") seen.push(a[0]); return v.apply(t, a); } : v; } });
  w.a.resolved.delete("credentials");
  /* no account serves bob yet: NO_ACCOUNT, no limit asked */
  assert.equal((await w.a.askAccount({ member: BOB })).code, "NO_ACCOUNT");
  assert.equal(w.limit.asked.length, 0, "no limit asked for an ask no account serves");
  await real.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: BOB });
  const before = w.snapshot();
  const r = await w.a.askAccount({ member: BOB, at: "2026-10-05T16:00:00Z" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.owner, "member:bob"); assert.equal(r.account.level, "member");
  assert.deepEqual(seen.at(-1), { member: BOB, act: { kind: "ask", member: BOB } }, "kind ask, no project named");
  assert.deepEqual(w.limit.asked.at(-1), { owner: "member:bob", member: "bob", use: "ask", at: "2026-10-05T16:00:00Z" });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* the limit reached: ai-use's refusal, unchanged */
  const reached = w.reach("member:bob", "ask");
  assert.deepEqual(await w.a.askAccount({ member: BOB }), reached);
  w.unreach("member:bob", "ask");
  assert.equal((await w.a.askAccount({ member: BOB })).ok, true, "under its limit again");
  /* the account chosen is the one used: its ask use off is credentials R56's refusal, never the next account */
  assert.equal(real.accountUsesSet({ owner: "member:bob", switch: "ask", on: false, by: BOB }).ok, true);
  assert.equal((await w.a.askAccount({ member: BOB })).code, "AI_USE_SWITCHED_OFF");
  assert.equal(real.accountUsesSet({ owner: "member:bob", switch: "ask", on: true, by: BOB }).ok, true);
  /* fail closed: no useCheck to judge it, or one that throws, refuses (the negative control of the judgement) */
  for (const useCheck of [null, () => { throw new Error("down"); }]) {
    w.a.deps.useCheck = useCheck;
    const x = await w.a.askAccount({ member: BOB });
    assert.equal(x.ok, false); assert.equal(x.reason, "LIMITS_UNREADABLE");
  }
  w.a.deps.useCheck = (a) => w.useCheck(a);
  /* a project the member has joined: its account pays, judged by the project's limits */
  const P = w.project("Carol's work", "carol");
  assert.equal((await real.projectKeySet({ project: P, key: "sk-p", by: CAROL })).ok, true);
  assert.equal(real.projectAccountSwitch({ project: P, on: true, by: CAROL }).ok, true);
  assert.equal((await real.projectKeyNoticeSeen({ member: "carol", project: P, by: CAROL })).ok, true);
  const p = await w.a.askAccount({ member: CAROL, project: P });
  assert.equal(p.ok, true, JSON.stringify(p));
  assert.equal(p.owner, `project:${P}`); assert.equal(p.account.level, "project");
  assert.deepEqual(seen.at(-1), { member: CAROL, act: { kind: "ask", member: CAROL, project: P } });
  assert.equal(w.limit.asked.at(-1).owner, `project:${P}`);
  /* a project the member has not joined, or cannot see, is credentials' refusal: no limit asked */
  const n = w.limit.asked.length;
  const out = await w.a.askAccount({ member: BOB, project: P });
  assert.equal(out.ok, false); assert.match(out.code ?? out.reason, /^(NO_SUCH_PROJECT|PROJECT_ACT_NOT_A_PARTICIPANT)$/);
  assert.equal(w.limit.asked.length, n);
  /* a project keeping its material away from asks refuses the ask in it */
  assert.equal((await real.projectAiKeepAwaySet({ project: P, on: true, uses: ["ask"], reason: "Private for now.", by: CAROL })).ok, true);
  assert.equal((await w.a.askAccount({ member: CAROL, project: P })).code, "PROJECT_AI_KEPT_AWAY");
  /* ownerOf spells each owner as ai-use R1 does */
  assert.equal(ownerOf({ level: "group" }, BOB), "group");
  assert.equal(ownerOf({ level: "member", kind: "signin", member: "bob" }, BOB), "member:bob");
});

test("R30 R2 widened: every read under a grant also drops the rows of projects kept away from AI for the grant's use (credentials.projectsKeptAway), before the read log records them, and a count counts none; another use's limit drops nothing; unreadable limits drop every project's rows", async () => {
  const w = answersWorld();
  const P = w.project("Carol's work", "carol");
  const inP = w.document("carol's budget", { title: "Budget draft", project: P });
  const open = w.document("budget minutes", { title: "Budget minutes" });
  const read = (grant, use) => w.a.logRead({ grant, viewer: CAROL, op: "search", args: { q: "budget" }, use,
    answer: { ok: true, count: 3, hits: [{ bundle_id: open.bundleId }, { bundle_id: inP.bundleId }, { bundle_id: P }] } });
  /* no limit: carol, a participant, sees her project's rows (the negative control) */
  assert.deepEqual(read("g0").hits.map((h) => h.bundle_id), [open.bundleId, inP.bundleId, P]);
  assert.equal((await w.credentials.projectAiKeepAwaySet({ project: P, on: true, uses: ["ask"], reason: "Private for now.", by: CAROL })).ok, true);
  const asked = read("g1");
  assert.deepEqual(asked.hits, [{ bundle_id: open.bundleId }], "the project and its rows dropped for an ask");
  assert.equal(asked.count, 1, "a count counts none of them");
  assert.equal(w.a.readLog("g1").answered(inP.bundleId), false); assert.equal(w.a.readLog("g1").answered(P), false);
  assert.equal(w.a.readLog("g1").use, "ask");
  /* a draft's grant reads under `draft`, a standing run's under `standing`: an ask-only limit drops nothing there */
  assert.equal(read("g2", "draft").hits.length, 3);
  assert.equal(read("g3", "standing").hits.length, 3);
  assert.deepEqual(GRANT_USES, ["ask", "draft", "standing"]);
  /* a rule answer under the grant is dropped the same way */
  w.a.registerRuleService("projectfacts", () => ({ value: { items: [{ id: P, note: "kept away" }, { id: open.bundleId }], count: 2 },
                                                    basis: "test", grade: null, status: "held", label: "computed_fact" }));
  const rule = await w.a.ruleAnswer({ service: "projectfacts", viewer: CAROL, grant: "g1" });
  assert.deepEqual(rule.value, { items: [{ id: open.bundleId }], count: 1 });
  assert.deepEqual((await w.a.ruleAnswer({ service: "projectfacts", viewer: CAROL, grant: "g2" })).value.count, 2, "a draft's grant keeps it");
  /* limits that cannot be read: every project's rows dropped, fail closed */
  const real = w.credentials;
  w.a.deps.credentials = { projectsKeptAway: () => null, aiKeptAway: () => null };
  w.a.resolved.delete("credentials");
  assert.deepEqual(read("g4", "standing").hits, [{ bundle_id: open.bundleId }]);
  w.a.deps.credentials = { projectsKeptAway: () => { throw new Error("down"); } };
  w.a.resolved.delete("credentials");
  assert.deepEqual(read("g5", "draft").hits, [{ bundle_id: open.bundleId }]);
  w.a.deps.credentials = real; w.a.resolved.delete("credentials");
  /* R14 still: the reads write nothing */
  const before = w.snapshot();
  read("g6");
  assert.deepEqual(w.snapshot(), before);
});

test("R30 R19 a standing run's grant reads under its own use: a project kept away from standing questions is dropped from what the AI half reads", async () => {
  const w = answersWorld();
  const P = w.project("Carol's work", "carol");
  assert.equal(w.a.standingAiSwitch({ on: true, by: ALICE }).ok, true);
  await w.credentials.accountReferenceSet({ member: "carol", kind: "apikey", secret: "sk-c", by: CAROL });
  assert.equal(w.credentials.accountUsesSet({ owner: "member:carol", switch: "standing", on: true, by: CAROL }).ok, true);
  assert.equal((await w.credentials.projectAiKeepAwaySet({ project: P, on: true, uses: ["standing"], reason: "Private.", by: CAROL })).ok, true);
  const got = [];
  w.a.registerStandingAnswerer("agent-worker", async (x) => {
    got.push(w.a.logRead({ grant: x.grant, viewer: x.author, op: "search", args: {},
                           answer: { ok: true, total: 2, hits: [{ bundle_id: x.finds.ids[0] }, { bundle_id: P }] } }));
    return answer();
  });
  const q = w.a.standingQuestionSet({ author: CAROL, question: "Anything new?", query: "title:budget", cadence: "daily", ends: "2026-12-31" });
  await w.a.standingTick(w.clock.now);
  const doc = w.document("budget one", { title: "Budget one" });
  w.at("2026-10-06T15:00:00.000Z");
  const run = (await w.a.standingTick(w.clock.now)).ran.find((x) => x.id === q.id);
  assert.equal(run.held_back, null, JSON.stringify(run));
  assert.deepEqual(got[0].hits, [{ bundle_id: doc.bundleId }]); assert.equal(got[0].total, 1);
  /* the same read under an ask grant keeps the project: the limit covers standing questions only */
  const ask = w.a.logRead({ grant: "g-ask", viewer: CAROL, op: "search", args: {}, answer: { ok: true, hits: [{ bundle_id: P }] } });
  assert.deepEqual(ask.hits, [{ bundle_id: P }]);
});

test("R30 with no useCheck handed in, answers judges by ai-use's useCheck on its own host (the negative control: an account under its limits is served)", async () => {
  const w = answersWorld({ deps: { useCheck: undefined } });
  await w.credentials.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: BOB });
  assert.equal((await w.a.askAccount({ member: BOB })).ok, true);
  const reached = w.reach("member:bob", "ask");
  const r = await w.a.askAccount({ member: BOB });
  assert.deepEqual(r, reached);
  assert.equal(r.code, "AI_LIMIT_REACHED");
  assert.equal(w.limit.asked.length, 0, "the fixture's watched provider was not the one asked");
});
