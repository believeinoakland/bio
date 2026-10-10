/* R16 (B7; K2353, K2376, K2488; DEC-188 (6), (7)): the AI accounts' items, over the real `ai-use` (its R5
   `limitsReached`, R9 `exploreAsksPending`) and the real `credentials` (its R59 `projectAccountsSuspended`) and
   `membership`, on ai-use's own test world: ann owns P (bob joined) and her own key; cy's project S runs on cy's
   sign-in; second is an administrator. Each item's words are read by key from the design stream's `words.json`; every
   test has its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, WORDS } from "../ai-use/fixture.mjs";
import { fresh, reader, ofKind, sentences, texts, byId } from "./fixture.mjs";
import { NOTICE_KINDS, NOTICED_LABEL, ASK_LABEL, EXPLORE_APPROVE, ACCOUNT_ITEMS_MAX, LIMIT_USES_OVERALL } from "../../../src/notice-producers/index.mjs";
import { NOTICE_WORDS, wordsOf } from "../../../src/notice-producers/words.mjs";

const AT = "2026-10-09T12:00:00Z";
const UTC = () => ({ time_zone: { value: "UTC" } });

async function setup() {
  const w = await standard();
  w.sql.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);   /* duties' table, empty (R5) */
  w.project("S", "cy");
  w.c.subscriptionConnected({ member: "cy" });
  assert.equal(w.c.projectSigninSet({ project: "S", by: "cy" }).ok, true);
  const n = fresh(w.ctx, { membership: w.m, aiUse: w.u, credentials: w.c, view: UTC });
  const { read } = reader(n);
  const items = (member, kind, at = AT) => ofKind(read(member, { now: at }), kind);
  return { w, n, read, items };
}
/* No member's id, handle or cover in any member-facing word or in the item's subject. */
/* (the administrator's handle, "second", is also an English word the suspended item's words use; it reads no account here) */
const MEMBERS = [/\bann\b/, /\bbob\b/, /\bcy\b/, /cover of/, /member:/];
function namesNoMember(it) {
  const bad = [];
  for (const t of [...sentences(it), ...texts(it.subject), ...texts(it.fills || {})]) for (const m of MEMBERS) if (m.test(t)) bad.push(`${m} in ${t}`);
  return bad;
}

test("R16 its words are read by key from words.json, verbatim: ai.queue.exploreask, ai.queue.limitreached, ai.queue.suspended (and R17's ai.label.explored); a key the file lacks fails, never a fallback sentence", () => {
  for (const key of ["ai.queue.exploreask", "ai.queue.limitreached", "ai.queue.suspended", "ai.label.explored"])
    assert.ok(typeof WORDS[key] === "string", `${key} is in words.json`);
  for (const [key, en] of Object.entries(NOTICE_WORDS)) assert.equal(en, WORDS[key], `${key} is words.json's own sentence`);
  /* negative control: a key the file lacks is no word here, and asking for it fails rather than answering a sentence */
  assert.equal(WORDS["ai.queue.nosuchword"], undefined);
  assert.equal(NOTICE_WORDS["ai.queue.nosuchword"], undefined);
  assert.throws(() => wordsOf("ai.queue.nosuchword", {}), /no words for ai\.queue\.nosuchword/);
  assert.equal(wordsOf("ai.queue.suspended", { project: "S" }), WORDS["ai.queue.suspended"].replace("{project}", "S"));
});

test("R16 one Noticed ai-limit-reached item per entry of ai-use.limitsReached for the viewer, keyed by the entry's own key (never composed here), in ai.queue.limitreached's words naming whose limit, which use and the period's end, never a member; nothing to another member, nothing before it is reached", async () => {
  const { w, items } = await setup();
  w.u.aiLimitSet({ owner: "project:P", scope: "overall", unit: "calls", period: "day", amount: 2, by: "ann" });
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "calls", period: "month", amount: 1, by: "ann" });
  w.count("project:P", "bob", "run", { at: "2026-10-09T10:00:00Z" });
  assert.deepEqual(items("ann", "ai-limit-reached"), [], "negative control: not yet reached");
  w.count("project:P", "bob", "run", { at: "2026-10-09T11:00:00Z" });
  w.count("member:ann", "ann", "ask", { at: "2026-10-09T11:45:00Z" });
  const reached = w.u.limitsReached({ viewer: "ann", at: AT }).reached;
  const got = items("ann", "ai-limit-reached");
  assert.deepEqual(got.map((i) => i.id), reached.map((e) => `FINDING::ai-limit-reached::${e.key}`), "the source's own key, as given");
  const m = byId({ items: got });
  const p = m["FINDING::ai-limit-reached::ai-limit:project:P:overall:calls:day:2026-10-09"];
  const own = m["FINDING::ai-limit-reached::ai-limit:member:ann:ask:calls:month:2026-10-01"];
  assert.equal(p.detail, WORDS["ai.queue.limitreached"].replace("{account}", "Project P's account").replace("{period}", "daily")
    .replace("{for_use}", "").replace("{date}", "2026-10-09").replace("{Uses}", LIMIT_USES_OVERALL).replace("{when}", "tomorrow"));
  assert.equal(LIMIT_USES_OVERALL, "Uses counted in its overall limit", "J1's fill, as BOB confirmed it (B2)");
  assert.equal(own.detail, "Your own account reached its monthly limit for asking on 2026-10-09. Asking on it pause until November 1; its other uses go on.");
  for (const it of got) {
    assert.equal(it.class, "FINDING");
    assert.equal(NOTICE_KINDS[it.kind], "FINDING");
    assert.equal(it.label, NOTICED_LABEL);
    assert.equal(it.word, "ai.queue.limitreached");
    assert.equal(it.summary, it.detail);
    assert.deepEqual(it.recipients, ["ann"]);
    assert.deepEqual(namesNoMember(it), [], it.id);
  }
  assert.deepEqual(p.case.ancestors.map((a) => a.id), ["P"], "homed under the project whose account it is");
  assert.equal(own.subject.id, "own");
  /* negative controls: no item for another member's account; the day's limit is gone in the next period */
  assert.deepEqual(items("bob", "ai-limit-reached"), [], "bob owns neither account");
  assert.deepEqual(items("second", "ai-limit-reached"), []);
  assert.deepEqual(items("ann", "ai-limit-reached", "2026-10-10T12:00:00Z").map((i) => i.subject.id), ["own"]);
  /* the group's limit, to its administrators */
  w.count("group", "bob", "ask", { calls: 3 });
  w.u.aiLimitSet({ owner: "group", scope: "ask", unit: "calls", period: "day", amount: 2, by: "admin", at: AT });
  const [g] = items("second", "ai-limit-reached");
  assert.equal(g.detail, "Your group's account reached its daily limit for asking on 2026-10-09. Asking on it pause until tomorrow; its other uses go on.");
  assert.deepEqual(items("ann", "ai-limit-reached").filter((i) => i.subject.id === "group"), []);
});

test("R16 one Ask item per entry of ai-use.exploreAsksPending, keyed by its own key, in ai.queue.exploreask's words with the questions, offering to approve exploring today; to the account's owners only; gone once approved", async () => {
  const { w, items } = await setup();
  w.bundle("INQ-1", "inquiry");
  w.cite("P", "INQ-1");
  w.c.accountUsesSet({ owner: "project:P", switch: "explore", on: "ask", by: "ann" });
  assert.deepEqual(items("ann", "explore-ask"), [], "negative control: nothing asked");
  w.u.exploreAsk({ owner: "project:P", at: AT, what: ["What did the council vote?"] });
  const [it] = items("ann", "explore-ask");
  assert.equal(it.id, "FINDING::explore-ask::explore-ask:project:P:2026-10-09");
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, ASK_LABEL);
  assert.equal(it.word, "ai.queue.exploreask");
  assert.equal(it.detail, WORDS["ai.queue.exploreask"].replace("{scope}", "Project P").replace("{what}", "What did the council vote?")
    .replace("{account}", "Project P's account"));
  assert.deepEqual(it.subject.questions, ["What did the council vote?"]);
  assert.equal(it.basis.estimate, "not known yet", "R10's rough cost, as ai-use states it");
  assert.deepEqual(it.options[0], EXPLORE_APPROVE);
  assert.equal(EXPLORE_APPROVE.label, WORDS["act.owed_exploreapprove.label.queue"]);
  assert.deepEqual(it.recipients, ["ann"]);
  assert.deepEqual(namesNoMember(it), []);
  for (const m of ["bob", "second", "cy"]) assert.deepEqual(items(m, "explore-ask"), [], `not an owner: ${m}`);
  w.u.exploreApprove({ owner: "project:P", day: "2026-10-09", by: "ann", at: AT });
  assert.deepEqual(items("ann", "explore-ask"), [], "approved: no longer asked");
});

test("R16 one Noticed project-account-suspended item per entry of credentials.projectAccountsSuspended, keyed by its own key, in ai.queue.suspended's words naming the project and no member; to the project's owner alone, and none while the sign-in serves", async () => {
  const { w, items } = await setup();
  assert.deepEqual(items("cy", "project-account-suspended"), [], "negative control: serving, nothing");
  assert.equal(w.join("S", "cy", "bob").ok, true);
  const [s] = w.c.projectAccountsSuspended({ viewer: "cy" });
  const [it] = items("cy", "project-account-suspended");
  assert.equal(it.id, `FINDING::project-account-suspended::${s.key}`);
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, NOTICED_LABEL);
  assert.equal(it.detail, WORDS["ai.queue.suspended"].replace("{project}", "Project S"));
  assert.deepEqual(it.subject, { kind: "project", id: "S", since: s.since });
  assert.deepEqual(it.recipients, ["cy"]);
  assert.deepEqual(namesNoMember(it), []);
  assert.ok(!texts(it).includes("bob") && !texts(it.basis).some((t) => t === "cy"), "no member anywhere in the item");
  for (const m of ["bob", "ann", "second"]) assert.deepEqual(items(m, "project-account-suspended"), [], m);
});

test("R16 R1 a read that does not answer is its provider's failure, named in facts.failed, never read as no item; the bound and truncated stated", async () => {
  const { w } = await setup();
  const run = (deps) => reader(fresh(w.ctx, { membership: w.m, aiUse: w.u, credentials: w.c, view: UTC, ...deps })).read("ann", { now: AT });
  const boom = () => { throw new Error("down"); };
  for (const [deps, name] of [[{ aiUse: { exploreAsksPending: () => ({ ok: true, asks: [], unreadable: true }), limitsReached: () => ({ ok: true, reached: [] }) } }, "ai-use"],
                              [{ aiUse: { exploreAsksPending: () => ({ ok: true, asks: [] }), limitsReached: boom } }, "ai-use"],
                              [{ credentials: { ...w.c, projectAccountsSuspended: () => null, securityLevel: () => ({ level: "Ordinary" }) } }, "credentials"]])
    assert.deepEqual(run(deps).facts.failed, [name], name);
  const many = Array.from({ length: ACCOUNT_ITEMS_MAX + 1 }, (_, i) => ({ key: `ai-limit:member:ann:ask:calls:day:k${i}`, owner: "member:ann",
    scope: "ask", unit: "calls", period: "day", period_start: "2026-10-09", reached_at: AT }));
  const r = run({ aiUse: { exploreAsksPending: () => ({ ok: true, asks: [] }), limitsReached: () => ({ ok: true, reached: many }) } });
  assert.equal(ofKind(r, "ai-limit-reached").length, ACCOUNT_ITEMS_MAX);
  assert.deepEqual(r.facts.ai_limit, { bound: ACCOUNT_ITEMS_MAX, truncated: true });
  assert.deepEqual(run({}).facts.ai_limit, { bound: ACCOUNT_ITEMS_MAX, truncated: false }, "negative control: within the bound");
  const before = w.snapshot();
  run({});
  assert.equal(w.snapshot(), before, "the read writes nothing");
});

test("R16 a per-member limit reached reads as one, naming no member: the account, the period, \"for each member\", and when uses go on", async () => {
  const { w, items } = await setup();
  w.u.aiLimitSet({ owner: "project:P", scope: "per_member", unit: "calls", period: "day", amount: 1, by: "ann" });
  assert.deepEqual(items("ann", "ai-limit-reached"), [], "negative control: not yet reached");
  w.count("project:P", "bob", "ask", { at: "2026-10-09T11:00:00Z" });
  const [it] = items("ann", "ai-limit-reached");
  assert.equal(it.detail, "Project P's account reached its daily limit for each member on 2026-10-09. Each member's uses on it pause until tomorrow; its other uses go on.");
  assert.deepEqual(namesNoMember(it), []);
  assert.deepEqual(items("bob", "ai-limit-reached"), [], "the member who reached it owns no account: told nothing here");
});
