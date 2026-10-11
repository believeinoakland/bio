/* R16 (B7; K2353, K2376, K2488; DEC-188 (6), (7)): the AI accounts' items, over the real `ai-use` (its R5
   `limitsReached`, R9 `exploreAsksPending`) and the real `credentials` (its R59 `projectAccountsSuspended`) and
   `membership`, on ai-use's own test world: ann owns P (bob joined) and her own key; cy's project S runs on cy's
   sign-in; second is an administrator. Each item's sentence and every fill are read by key from the design stream's
   `words.json` (DEC-189 (5), (6); N856), the expected words built here from that file, never from this module; every
   test has its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, WORDS } from "../ai-use/fixture.mjs";
import { fresh, reader, ofKind, sentences, texts, byId } from "./fixture.mjs";
import { NOTICE_KINDS, NOTICED_LABEL, ASK_LABEL, EXPLORE_APPROVE, ACCOUNT_ITEMS_MAX } from "../../../src/notice-producers/index.mjs";

const AT = "2026-10-09T12:00:00Z";
const UTC = () => ({ time_zone: { value: "UTC" } });
/* `words.json`'s sentence of `key`, its placeholders filled (a key the file lacks fails here) */
const say = (key, fills = {}) => {
  assert.equal(typeof WORDS[key], "string", `${key} is in words.json`);
  return WORDS[key].replace(/\{([A-Za-z_]+)\}/g, (m, k) => (k in fills ? fills[k] : m));
};
const LIMIT_KEYS = ["ai.queue.limitreached", "ai.queue.limitreached.overall", "ai.queue.limitreached.member"];

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

test("R16 a use's limit reached reads ai.queue.limitreached, by key: {account} from ai.account.project with the project's name, {period} from ai.period.day, {use} from ai.use.<use>.inline, {date} the local day reached_at falls on (day, then its month from date.month.*), {when} from ai.when.day; keyed by the entry's own key; nothing before it is reached, nothing to another member", async () => {
  const { w, items } = await setup();
  w.u.aiLimitSet({ owner: "project:P", scope: "ask", unit: "calls", period: "day", amount: 1, by: "ann" });
  assert.deepEqual(items("ann", "ai-limit-reached"), [], "negative control: not yet reached");
  w.count("project:P", "bob", "ask", { at: "2026-10-09T11:00:00Z" });
  const reached = w.u.limitsReached({ viewer: "ann", at: AT }).reached;
  const [it] = items("ann", "ai-limit-reached");
  assert.equal(it.id, `FINDING::ai-limit-reached::${reached[0].key}`, "the source's own key, as given");
  const expected = say("ai.queue.limitreached", { account: say("ai.account.project", { project: "Project P" }), period: say("ai.period.day"),
    use: say("ai.use.ask.inline"), date: `9 ${say("date.month.october")}`, when: say("ai.when.day") });
  assert.equal(it.detail, expected);
  assert.equal(it.detail, "Project P's account reached its daily limit for asking on 9 October. It pauses asking until tomorrow; its other uses go on.");
  assert.equal(it.word, "ai.queue.limitreached");
  /* negative control (K874): not the overall limit's sentence, nor the per-member limit's */
  for (const other of ["ai.queue.limitreached.overall", "ai.queue.limitreached.member"])
    assert.notEqual(it.detail, say(other, { account: say("ai.account.project", { project: "Project P" }), period: say("ai.period.day"),
      date: `9 ${say("date.month.october")}`, when: say("ai.when.day") }), other);
  assert.equal(it.class, "FINDING");
  assert.equal(NOTICE_KINDS[it.kind], "FINDING");
  assert.equal(it.label, NOTICED_LABEL);
  assert.equal(it.summary, it.detail);
  assert.deepEqual(it.recipients, ["ann"]);
  assert.deepEqual(namesNoMember(it), []);
  assert.ok(!/\{/.test(it.detail), "every placeholder filled");
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["P"], "homed under the project whose account it is");
  for (const m of ["bob", "second", "cy"]) assert.deepEqual(items(m, "ai-limit-reached"), [], `not an owner: ${m}`);
  assert.deepEqual(items("ann", "ai-limit-reached", "2026-10-10T12:00:00Z"), [], "the day's limit is gone in the next period");
});

test("R16 the overall limit reads ai.queue.limitreached.overall and the per-member limit ai.queue.limitreached.member, each by key and naming no member; each scope's sentence differs from the other two (K874)", async () => {
  const { w, items } = await setup();
  w.u.aiLimitSet({ owner: "project:P", scope: "overall", unit: "calls", period: "day", amount: 2, by: "ann" });
  w.u.aiLimitSet({ owner: "project:P", scope: "per_member", unit: "calls", period: "day", amount: 1, by: "ann" });
  w.count("project:P", "bob", "run", { at: "2026-10-09T10:00:00Z" });
  const once = items("ann", "ai-limit-reached");
  assert.deepEqual(once.map((i) => i.subject.scope), ["per_member"], "one member's one call: only the per-member limit");
  w.count("project:P", "bob", "run", { at: "2026-10-09T11:00:00Z" });
  const got = Object.fromEntries(items("ann", "ai-limit-reached").map((i) => [i.subject.scope, i]));
  const fills = { account: say("ai.account.project", { project: "Project P" }), period: say("ai.period.day"),
                  date: `9 ${say("date.month.october")}`, when: say("ai.when.day") };
  assert.equal(got.overall.detail, say("ai.queue.limitreached.overall", fills));
  assert.equal(got.overall.word, "ai.queue.limitreached.overall");
  assert.equal(got.per_member.detail, say("ai.queue.limitreached.member", fills));
  assert.equal(got.per_member.word, "ai.queue.limitreached.member");
  assert.equal(got.per_member.detail, "Project P's account: a member reached the daily amount each member may use, on 9 October. Their uses on it pause until tomorrow; other members' go on.");
  /* negative controls: each scope's item says none of the other scopes' sentences */
  for (const [scope, own] of [["overall", "ai.queue.limitreached.overall"], ["per_member", "ai.queue.limitreached.member"]])
    for (const k of LIMIT_KEYS.filter((x) => x !== own))
      assert.notEqual(got[scope].detail, say(k, { ...fills, use: say("ai.use.run.inline") }), `${scope} is not ${k}`);
  for (const it of Object.values(got)) assert.deepEqual(namesNoMember(it), [], it.id);
  assert.deepEqual(items("bob", "ai-limit-reached"), [], "the member who reached it owns no account: told nothing here");
});

test("R16 a month's limit on a member's own account: {account} from ai.account.own, {period} ai.period.month, {when} ai.when.month with the next period's month from date.month.*; the group's limit from ai.account.group, to its administrators only", async () => {
  const { w, items } = await setup();
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "calls", period: "month", amount: 1, by: "ann" });
  w.count("member:ann", "ann", "ask", { at: "2026-10-09T11:45:00Z" });
  const [own] = items("ann", "ai-limit-reached");
  assert.equal(own.subject.id, "own");
  assert.equal(own.detail, say("ai.queue.limitreached", { account: say("ai.account.own"), period: say("ai.period.month"), use: say("ai.use.ask.inline"),
    date: `9 ${say("date.month.october")}`, when: say("ai.when.month", { month: say("date.month.november") }) }));
  assert.match(own.detail, / until on November 1;/, "ai.when.month verbatim (J1 (1))");
  assert.doesNotMatch(own.detail, /December|October 1\b/, "negative control: the next period's month, not this one's nor a later one");
  assert.deepEqual(namesNoMember(own), []);
  /* a December period ends on January 1 */
  w.u.aiLimitSet({ owner: "member:ann", scope: "draft", unit: "calls", period: "month", amount: 1, by: "ann", at: "2026-12-02T00:00:00Z" });
  w.count("member:ann", "ann", "draft", { at: "2026-12-03T09:00:00Z" });
  const dec = items("ann", "ai-limit-reached", "2026-12-03T10:00:00Z").find((i) => i.subject.scope === "draft");
  assert.ok(dec, "December's draft limit reached");
  assert.match(dec.detail, /on 3 December\. It pauses drafting until on January 1;/);
  /* the group's account, to its administrators */
  w.count("group", "bob", "ask", { calls: 3 });
  w.u.aiLimitSet({ owner: "group", scope: "ask", unit: "calls", period: "day", amount: 2, by: "admin", at: AT });
  const [g] = items("second", "ai-limit-reached");
  assert.equal(g.detail, say("ai.queue.limitreached", { account: say("ai.account.group"), period: say("ai.period.day"), use: say("ai.use.ask.inline"),
    date: `9 ${say("date.month.october")}`, when: say("ai.when.day") }));
  assert.deepEqual(items("ann", "ai-limit-reached").filter((i) => i.subject.id === "group"), [], "negative control: ann is no administrator");
});

test("R16 a limit's {date} is the profile's local day reached_at falls on, never the UTC day; a use with no ai.use.<use>.inline key reads the overall limit's sentence (J1 (3)); an entry whose period or day cannot be read is no item", async () => {
  const { w } = await setup();
  const at = "2026-10-10T02:00:00Z";                        /* 9 October, 19:00, in Los Angeles */
  const entry = (x) => ({ key: "ai-limit:group:ask:calls:day:2026-10-09", owner: "group", scope: "ask", unit: "calls", period: "day",
    period_start: "2026-10-09", reached_at: at, ...x });
  const run = (reached, view = () => ({ time_zone: { value: "America/Los_Angeles" } })) => ofKind(reader(fresh(w.ctx, { membership: w.m, credentials: w.c, view,
    aiUse: { exploreAsksPending: () => ({ ok: true, asks: [] }), limitsReached: () => ({ ok: true, reached }) } })).read("second", { now: AT }), "ai-limit-reached");
  assert.match(run([entry()])[0].detail, / on 9 October\./, "the local day in the profile's zone");
  assert.match(run([entry()], UTC)[0].detail, / on 10 October\./, "negative control: in UTC it is the 10th");
  assert.equal(WORDS["ai.use.enquire.inline"], undefined, "words.json on main names no inline words for enquire yet (DEC-191, T44)");
  const [q] = run([entry({ scope: "enquire", key: "ai-limit:group:enquire:calls:day:2026-10-09" })]);
  assert.equal(q.word, "ai.queue.limitreached.overall");
  assert.equal(q.detail, say("ai.queue.limitreached.overall", { account: say("ai.account.group"), period: say("ai.period.day"),
    date: `9 ${say("date.month.october")}`, when: say("ai.when.day") }));
  for (const bad of [{ period: "week" }, { period: null }, { reached_at: "not an instant" }, { period: "month", period_start: null, reached_at: null }])
    assert.deepEqual(run([entry(bad)]), [], JSON.stringify(bad));
});

test("R16 one Ask item per entry of ai-use.exploreAsksPending, keyed by its own key, in ai.queue.exploreask's words: {scope} the project's name, or ai.scope.group / ai.scope.own; {account} from ai.account.<kind>.inline; offering act.exploreapprove; to the account's owners only; gone once approved", async () => {
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
  assert.equal(it.detail, say("ai.queue.exploreask", { scope: "Project P", what: "What did the council vote?", account: say("ai.account.project.inline") }));
  assert.notEqual(it.detail, say("ai.queue.exploreask", { scope: say("ai.scope.group"), what: "What did the council vote?", account: say("ai.account.group.inline") }),
    "negative control: not the group's words");
  assert.deepEqual(it.subject.questions, ["What did the council vote?"]);
  assert.equal(it.basis.estimate, "not known yet", "R10's rough cost, as ai-use states it");
  assert.deepEqual(it.options[0], EXPLORE_APPROVE);
  assert.equal(EXPLORE_APPROVE.label, WORDS["act.exploreapprove.label.queue"]);
  assert.deepEqual(it.recipients, ["ann"]);
  assert.deepEqual(namesNoMember(it), []);
  for (const m of ["bob", "second", "cy"]) assert.deepEqual(items(m, "explore-ask"), [], `not an owner: ${m}`);
  w.u.exploreApprove({ owner: "project:P", day: "2026-10-09", by: "ann", at: AT });
  assert.deepEqual(items("ann", "explore-ask"), [], "approved: no longer asked");
  /* the group's and a member's own account (ai-use's entries, as it answers them) */
  const asks = (owner) => ofKind(reader(fresh(w.ctx, { membership: w.m, credentials: w.c, view: UTC, aiUse: { limitsReached: () => ({ ok: true, reached: [] }),
    exploreAsksPending: () => ({ ok: true, asks: [{ key: `explore-ask:${owner}:2026-10-09`, owner, day: "2026-10-09", what: ["Q?"], asked_at: AT }] }) } }))
    .read("ann", { now: AT }), "explore-ask")[0];
  assert.equal(asks("group").detail, say("ai.queue.exploreask", { scope: say("ai.scope.group"), what: "Q?", account: say("ai.account.group.inline") }));
  assert.equal(asks("member:ann").detail, say("ai.queue.exploreask", { scope: say("ai.scope.own"), what: "Q?", account: say("ai.account.own.inline") }));
  assert.deepEqual(namesNoMember(asks("member:ann")), [], "a member's own account names no member");
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

