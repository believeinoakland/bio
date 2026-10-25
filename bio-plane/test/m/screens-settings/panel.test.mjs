/* The AI account panel at the module's interface (R9; DEC-188 (1)): one render over an owner, drawn by `teamai` for the
   team's key (R48) and by `connect` for the member's own account (R49), each in the parts that open and close. Over the world
   (store-request): the team's key, its uses and limits, the use the model's calls counted and the changes are made by the owners' real
   acts, and the expectations are read back from the owners' answers (`seed-connect.mjs`). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import * as S from "./seed-connect.mjs";

// a section by its heading, or a part (R48, R49) by its title
const section = (o, key) => all(o.tree, (e) => (e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))
  || (e.tag === "details" && /\bcs-part\b/.test(e.attrs.class || "") && all(e, (h) => h.attrs.class === "t")[0] && textOf(all(e, (h) => h.attrs.class === "t")[0]) === said(key)))[0];
const group = (query) => ({ query: { owner: "group", ...query } });
const dollars = (d) => "$" + Number(d || 0).toFixed(2);

/** The team's key held and on, the founder (its administrator) reading the team's assistant page. */
async function keyed(limits = [], opts = {}) {
  const t = await S.team({ testInstance: true, ...opts });
  await S.teamKey(t, limits);
  return t;
}
const teamai = (t, table) => open("teamai", { world: t.w, as: t.founder, ...(table ? { table } : {}) });
const connect = (t, as = t.dev, table) => open("connect", { world: t.w, as, ...(table ? { table } : {}) });
/** `as` is served by the team's key and has used it: the notice read, `n` calls asked of the model. */
async function using(t, as, n = 1) {
  await as.act("groupkeynoticeseen", { body: {} });
  await S.ask(t, as, n);
}

test("R9 one render serves both: teamai (owner group) and connect (owner member:<me>) draw the same panel function", () => {
  const m = SCREENS.find((s) => s.id === "teamai"), c = SCREENS.find((s) => s.id === "connect");
  assert.equal(m.parts.aiPanel, c.parts.aiPanel);
  assert.equal(m.parts.aiPanelSend, c.parts.aiPanelSend);
});

test("R9 what the account pays for: each use (ai.use.<u>.name) on or off with its switch; exploring (ai.explore.*) at group level only", async () => {
  const t = await keyed();
  const a = await teamai(t);
  const held = (await t.founder.read("accountuses", group())).uses;
  const uses = section(a, "screen.panel.uses.heading");
  for (const u of ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "suggestions"]) assert.ok(textOf(uses).includes(said(`ai.use.${u}.name`)), u);
  const sw = acts(uses).filter((b) => b.attrs["data-act"] === "accountusesset" && b.attrs["data-sw"] !== "explore");
  assert.equal(sw.length, 9);
  for (const b of sw) assert.equal(b.attrs["data-to"], held[b.attrs["data-sw"]] ? "off" : "on", `${b.attrs["data-sw"]}: a use that is on offers off, one that is off offers on`);
  assert.equal(held.standing, false);
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "standing").attrs["data-to"], "on", "an off use offers on");
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "ask").attrs["data-to"], "off");
  const ex = all(uses, (e) => e.attrs.id === "aig-explore")[0];
  assert.deepEqual(all(ex, (e) => e.tag === "option").map((o) => textOf(o)), ["ai.explore.no", "ai.explore.ask", "ai.explore.yes"].map((k) => said(k)));
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "standing", to: "on" } })).sent[0].body, { owner: "group", switch: "standing", on: true });
  assert.equal((await t.founder.read("accountuses", group())).uses.standing, true, "the team's record holds the switch");
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "explore" }, values: { "aig-explore": "ask" } })).sent[0].body, { owner: "group", switch: "explore", on: "ask" });
  assert.equal((await t.founder.read("accountuses", group())).uses.explore, "ask", "and exploring");
  // R28: with no account there is nothing to set, and a section that holds nothing is not drawn
  const tn = await S.team();
  const none = await connect(tn);
  assert.equal((await tn.dev.read("accountuses", { query: { owner: "member:" + tn.dev.member } })).uses, null);
  assert.equal(section(none, "screen.panel.uses.heading"), undefined);
});

test("R9 its limits as a table with one form: set (overall, a use within or on top, each member's use at group level) and remove", async () => {
  // an overall limit, each member's, and a use's on top of the overall one, whose figure the use has passed
  const t = await keyed([{ scope: "overall", unit: "usd", period: "month", amount: 60 }, { scope: "per_member", unit: "usd", period: "day", amount: 5 },
    { scope: "ask", unit: "tokens", period: "month", amount: 1000, inclusive: false }]);
  await using(t, t.dev);
  const a = await teamai(t);
  const held = (await t.founder.read("ailimits", group())).limits;
  const lim = section(a, "screen.panel.limits.heading");
  const rows = all(lim, (e) => e.tag === "tbody")[0].children.filter((c) => c.tag === "tr");
  assert.equal(rows.length, held.length);
  const rowOf = (l) => rows.find((r) => textOf(r).includes(said(l.scope === "overall" ? "screen.panel.scope.overall" : l.scope === "per_member" ? "screen.panel.scope.per_member" : `ai.use.${l.scope}.name`)));
  const overall = held.find((l) => l.scope === "overall"), perMember = held.find((l) => l.scope === "per_member"), ask = held.find((l) => l.scope === "ask");
  assert.ok(textOf(rowOf(overall)).includes(dollars(overall.amount)));
  assert.ok(rowOf(perMember));
  assert.equal(ask.reached, true, "the use has passed its figure");
  assert.ok(textOf(rowOf(ask)).includes(said("screen.panel.ontop")) && textOf(rowOf(ask)).includes(said("screen.panel.reached")));
  const scopes = all(all(lim, (e) => e.attrs.id === "aig-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(scopes.includes("per_member") && scopes.includes("explore") && scopes[0] === "overall");
  assert.equal(all(lim, (e) => e.tag === "button" && e.attrs["data-act"] === "ailimitset" && e.attrs["data-remove"] === "").length, 1, "one form");
  const v = { "aig-scope": "run", "aig-amount": "2,000,000", "aig-unit": "tokens", "aig-period": "month" };
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-ontop": true } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: 2000000, inclusive: false });
  const run = (await t.founder.read("ailimits", group())).limits.find((l) => l.scope === "run");
  assert.deepEqual([run.amount, run.inclusive, run.on_top], [2000000, false, true], "held on top");
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-within": true } })).sent[0].body.inclusive, true);
  assert.equal((await t.founder.read("ailimits", group())).limits.find((l) => l.scope === "run").inclusive, true, "and then within");
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { "aig-scope": "per_member", "aig-amount": "$5", "aig-unit": "usd", "aig-period": "day" } })).sent[0].body, { owner: "group", scope: "per_member", unit: "usd", period: "day", amount: 5 });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "1", scope: "run", unit: "tokens", period: "month" } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: null });
  assert.ok(!(await t.founder.read("ailimits", group())).limits.some((l) => l.scope === "run"), "removed from the team's record");
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-amount": "0" } })).sent, []);
  // a member's own account: no exploring, no per-member limit
  const to = await S.team();
  await S.ownKey(to.dev);
  const c = await connect(to);
  const cs = all(all(c.tree, (e) => e.attrs.id === "aio-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(!cs.includes("per_member") && !cs.includes("explore"));
});

test("R9 a refused limit is drawn with ai.limitfield.* naming the field (AI_LIMIT_INVALID)", async () => {
  // what a member can type that the owner refuses, one for each field it names (the page sends the typed unit, period and scope as chosen)
  const typed = { amount: { "aig-amount": "0.001" }, unit: { "aig-unit": "gallons" }, period: { "aig-period": "decade" }, scope: { "aig-scope": "everything" } };
  const t = await keyed();
  for (const [field, bad] of Object.entries(typed)) {
    const a = await teamai(t);
    const values = { "aig-scope": "overall", "aig-amount": "5", "aig-unit": "usd", "aig-period": "day", ...bad };
    const sent = (await a.press("ailimitset", { data: { remove: "" }, values })).sent[0].body;
    const refusal = (await t.w.door({ url: "/api/?op=ailimitset", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sent) } }, t.founder)).json.result;
    assert.equal(refusal.code, "AI_LIMIT_INVALID", `${field}: the owner refuses it`);
    assert.equal(refusal.field, field, `${field}: and names the field`);
    assert.equal(a.refused.text, said("ai.refused.limitinvalid", { field: said(`ai.limitfield.${refusal.field}`) }));
  }
  // a subscription cannot be limited in dollars: the page offers tokens and calls, and a unit typed past that is refused
  const ts = await S.team();
  await S.signedIn(ts.dev);
  const u = await connect(ts);
  await u.press("ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "5", "aio-unit": "usd", "aio-period": "day" } });
  assert.equal(u.refused.text, said("ai.refused.unitunavailable"));
});

test("R9 this month's use summed per use and in all, naming no member; the changes with who and when, the limits' and the account's together", async () => {
  const t = await keyed();
  // the changes: the team's key set and switched on (made above), a use's setting, a limit set and a limit removed
  await t.founder.act("accountusesset", { body: { owner: "group", switch: "explore", on: "ask" } });
  await t.founder.act("ailimitset", { body: { owner: "group", scope: "overall", unit: "usd", period: "month", amount: 60 } });
  await t.founder.act("ailimitset", { body: { owner: "group", scope: "draft", unit: "calls", period: "day", amount: 3 } });
  await t.founder.act("ailimitset", { body: { owner: "group", scope: "draft", unit: "calls", period: "day", amount: null } });
  // the use: a member asked twice and a draft was made
  await using(t, t.dev, 2);
  await S.counted(t, t.dev, 1, "draft");
  const a = await teamai(t);
  const month = (await t.founder.read("aiusage", group())).uses;
  assert.ok(month.length >= 2);
  const use = textOf(section(a, "screen.panel.usage.heading"));
  const total = (k) => month.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  for (const r of month) for (const x of [Number(r.calls).toLocaleString("en"), Number(r.tokens).toLocaleString("en"), dollars(r.total_cost_usd)]) assert.ok(use.includes(x), `${r.use}: ${x}`);
  for (const x of [total("calls").toLocaleString("en"), total("tokens").toLocaleString("en"), dollars(total("total_cost_usd"))]) assert.ok(use.includes(x), `in all: ${x}`);
  assert.ok(use.includes(said("screen.panel.usage.group")));
  // the changes, the limits' history among them
  const history = (await t.founder.read("accounthistory", group())).changes, limits = (await t.founder.read("ailimits", group())).history;
  const ch = all(section(a, "screen.panel.changes.heading"), (e) => e.tag === "li").map((e) => textOf(e));
  assert.equal(ch.length, history.length + limits.length);
  assert.ok(ch.length >= 5);
  const removed = limits.find((h) => h.change === "removed");
  const removedSaid = said("screen.panel.change.limit.removed", { who: t.founder.handle, scope: said("ai.use.draft.name"), amount: "", unit: said("screen.panel.unit.calls"), period: said("screen.panel.period.day") });
  assert.ok(ch.some((x) => x.startsWith(removedSaid) && x.endsWith(day(removed.at))), "a limit removed, with who and when");
  const newest = [...history, ...limits].map((c) => c.at).sort().at(-1);
  assert.ok(ch[0].endsWith(day(newest)), "newest first");
  assert.ok(ch.some((x) => x.startsWith(said("screen.panel.change.use_set", { who: t.founder.handle, use: said("ai.use.explore.name"), value: said("ai.explore.ask") }))));
  assert.ok(ch.some((x) => x.startsWith(said("screen.panel.change.key_set", { who: t.founder.handle }))));
  // R49: her own page draws no changes; the team's names each by handle, the founder never by `admin` (R37)
  assert.ok(!ch.some((x) => /\badmin\b/.test(x)), "the founder is named by her handle, never by her id");
  const to = await S.team();
  await S.ownKey(to.dev);
  assert.equal(section(await connect(to), "screen.panel.changes.heading"), undefined);
});

/* R26: thirty days of bars and a meter against each limit */
const bars = (o) => all(o.tree, (e) => e.attrs.class === "mk-bars")[0];
const meters = (o) => all(o.tree, (e) => /\bmk-meter\b/.test(e.attrs.class || ""));

/** The team's key, or `dev`'s own, used for ten dollars today against a limit for the month (a sixth of it) and one for the day (five sixths of it). */
async function used(kind) {
  const cost = 10;
  if (kind === "team") {
    const t = await keyed([{ scope: "overall", unit: "usd", period: "month", amount: 60 }, { scope: "overall", unit: "usd", period: "day", amount: 12 }]);
    t.worker.usage = { ...S.CALL, usage: { ...S.CALL.usage, total_cost_usd: cost } };
    await using(t, t.dev);
    return { t, screen: "teamai", as: t.founder, owner: "group", cost };
  }
  const t = await S.team({ testInstance: true });
  t.worker.usage = { ...S.CALL, usage: { ...S.CALL.usage, total_cost_usd: cost } };
  await S.ownKey(t.dev);
  for (const [period, amount] of [["month", 60], ["day", 12]]) await t.dev.act("ailimitset", { body: { owner: "member:dev", scope: "overall", unit: "usd", period, amount } });
  await S.ask(t, t.dev);
  return { t, screen: "connect", as: t.dev, owner: "member:" + t.dev.member, cost };
}

test("R26 thirty bars, oldest first, the newest marked today so far; the summary line; a meter for each limit, rust from four fifths", async () => {
  for (const kind of ["team", "own"]) {
    const { t, screen, as, owner, cost } = await used(kind);
    const a = await open(screen, { world: t.w, as: kind === "team" ? t.founder : t.dev });
    assert.ok(a.p.requests.some((r) => r.op === "aiuseovertime" && r.query.owner === owner), `${screen} reads aiuseovertime over ${owner}`);
    const over = await as.read("aiuseovertime", { query: { owner } });
    const b = bars(a);
    assert.ok(b, `${screen} draws the bars`);
    const bar = all(b, (e) => e.tag === "i");
    assert.equal(bar.length, 30);
    assert.equal(all(b, (e) => e.tag === "i" && e.attrs.class === "now").length, 1);
    assert.equal(bar[29].attrs.class, "now", "the newest is last and marked");
    assert.ok(bar[29].attrs["data-tip"].includes(said("ai.usage.today")), "its tooltip says today, so far");
    const tip = (d) => said("ai.usage.day", { day: day(d.day), calls: Number(d.calls).toLocaleString("en"), dollars: dollars(d.dollars) });
    assert.equal(over.days[29].dollars, cost, "today's use is the model's counted call");
    assert.ok(bar[28].attrs["data-tip"].includes(tip(over.days[28])) && !bar[28].attrs["data-tip"].includes(said("ai.usage.today")));
    assert.ok(bar[29].attrs["data-tip"].includes(tip(over.days[29])));
    assert.ok(a.text.includes(said("ai.usage.bars")), "the heading line");
    const tallest = bar.map((x) => Number(/height:(\d+)px/.exec(x.attrs.style)[1]));
    assert.equal(Math.max(...tallest), 44, "the busiest day is the tallest");
    assert.equal(tallest.indexOf(44), 29, "and it is today");
    const sum = over.days.reduce((s, d) => s + d.dollars, 0), calls = over.days.reduce((s, d) => s + d.calls, 0);
    assert.ok(a.text.includes(said("ai.usage.summary", { dollars: dollars(sum), calls: calls.toLocaleString("en"), day: day(over.days[29].day), daydollars: dollars(cost) })), "the summary");
    // R48: the team's card carries this month's meter on the key, ahead of the use part's own
    if (screen === "teamai") assert.equal(meters(a).length, 3, "the card's meter and one for each limit");
    const m = screen === "teamai" ? meters(a).slice(1) : meters(a);
    assert.equal(m.length, 2, "a meter for each limit");
    assert.equal(over.periods.length, 2);
    for (const p of over.periods) {
      const label = said("screen.panel.scope.overall") + " · " + said("screen.panel.unit.usd") + " · " + said("screen.panel.period." + p.period);
      assert.ok(a.text.includes(said("ai.usage.meter", { label, used: dollars(p.used), limit: dollars(p.limit) })), `${p.period}: used against the limit`);
      const meter = m.find((x) => textOf(x).includes(said("ai.usage.meter", { label, used: dollars(p.used), limit: dollars(p.limit) })));
      const pct = Math.round(100 * p.used / p.limit);
      assert.equal(meter.attrs["data-near"], pct >= 80 ? "1" : undefined, `${p.period}: ${pct}% ${pct >= 80 ? "is" : "is not"} near the limit`);
      assert.equal(textOf(meter).includes(said("ai.usage.meter.near")), pct >= 80);
      assert.ok(textOf(meter).includes(pct + "%"));
    }
    assert.ok(over.periods.some((p) => p.used / p.limit < 0.8) && over.periods.some((p) => p.used / p.limit >= 0.8), "one limit is far, the other near");
    // no member is named (K1450)
    const named = new RegExp(["founder", "dev"].join("|"));
    assert.ok(!all(b, () => true).some((e) => named.test(JSON.stringify(e.attrs))), "no bar names a member");
  }
});

test("R26 a limit that is not set draws no limit, not a meter against nothing; a day with no use is a zero bar", async () => {
  const t = await keyed();
  await using(t, t.dev);
  const over = await t.founder.read("aiuseovertime", group());
  assert.deepEqual(over.periods.map((p) => p.limit), [null], "the owner answers one period, with no limit");
  const a = await teamai(t);
  const m = meters(a);
  assert.equal(m.length, 1);
  assert.ok(textOf(m[0]).includes(said("ai.usage.nolimit")));
  assert.equal(all(m[0], (e) => e.attrs.class === "track")[0].children.length, 0, "no bar fills a meter with no limit");
  const bar = all(bars(a), (e) => e.tag === "i");
  assert.equal(over.days[3].calls, 0);
  assert.match(bar[3].attrs.style, /height:2px/, "a zero day is the least bar, not missing");
  assert.equal(bar.length, 30);
});

/** The refusal the owner gives a member who does not administer the team's account, as the door gives it: a read that is refused, not a use that cannot be read. */
const refusedRead = (t) => async () => (await t.w.door({ url: "/api/?op=aiuseovertime&owner=group" }, t.dev)).json;

test("R26 control: a read answering unreadable, or refused, is drawn failed, never as zeros", async () => {
  const t = await keyed();
  // the use cannot be read: the table of the counted use is gone from the record, and the owner answers `unreadable`, never zeros
  const tu = await keyed();
  tu.w.sql.exec("ALTER TABLE ai_usage RENAME TO ai_usage_lost");
  assert.equal((await tu.founder.read("aiuseovertime", group())).unreadable, true);
  for (const [w, table] of [[tu, undefined], [t, { aiuseovertime: refusedRead(t) }], [t, { aiuseovertime: "none" }]]) {
    const a = await teamai(w, table);
    assert.equal(bars(a), undefined, "no bars");
    assert.equal(meters(a).length, 0, "no meter");
    const sec = section(a, "screen.panel.usage.heading");
    assert.ok(all(sec, (e) => e.attrs["data-state"] === "failed").length >= 1, "drawn failed");
  }
});

test("R26 control: a member who does not administer reads no group use over time", async () => {
  const t = await keyed();
  const a = await open("teamai", { world: t.w, as: t.dev });
  assert.ok(!a.p.requests.some((r) => r.op === "aiuseovertime"));
  assert.equal(bars(a), undefined);
});

test("R26 (K3293) aiUsageBars is a part of the module: it draws the bars and a meter per limit over an aiuseovertime answer already read, whether handed the answer or the screen's read of it", async () => {
  const members = SCREENS.find((s) => s.id === "teamai");
  assert.equal(typeof members.parts.aiUsageBars, "function");
  assert.equal(members.parts.aiUsageBars, SCREENS.find((s) => s.id === "connect").parts.aiUsageBars, "one function for every screen that draws it");
  // a screen's functions are self-contained in the page: the answer is written into the host's source
  const hosted = (value) => ({ ...members, reads: () => ({}), render: new Function("cs", "view", `return cs.title() + view.parts.aiUsageBars(cs, view, { owner: "group", value: ${JSON.stringify(value)} });`) });
  const t = await keyed([{ scope: "overall", unit: "usd", period: "month", amount: 60 }, { scope: "overall", unit: "usd", period: "day", amount: 12 }]);
  await using(t, t.dev);
  const over = await t.founder.read("aiuseovertime", group());
  assert.equal(over.periods.length, 2);
  for (const value of [over, { state: "ok", value: over }]) {
    const a = await open("teamai", { world: t.w, as: t.founder, screens: SCREENS.map((s) => (s.id === "teamai" ? hosted(value) : s)) });
    assert.equal(all(bars(a), (e) => e.tag === "i").length, 30);
    assert.equal(meters(a).length, 2);
    assert.equal(a.p.requests.filter((r) => r.op === "aiuseovertime").length, 0, "it reads nothing itself");
  }
  // control: an answer that is unreadable, refused or failed to read is drawn failed, never as zeros
  const tu = await keyed();
  tu.w.sql.exec("ALTER TABLE ai_usage RENAME TO ai_usage_lost");
  const unreadable = await tu.founder.read("aiuseovertime", group());
  assert.equal(unreadable.unreadable, true);
  const refused = (await t.w.door({ url: "/api/?op=aiuseovertime&owner=group" }, t.dev)).json.result;
  assert.equal(refused.ok, false, "the owner refuses a member who does not administer");
  for (const value of [unreadable, { state: "failed" }, { state: "ok", value: refused }]) {
    const a = await open("teamai", { world: t.w, as: t.founder, screens: SCREENS.map((s) => (s.id === "teamai" ? hosted(value) : s)) });
    assert.equal(bars(a), undefined);
    assert.equal(meters(a).length, 0);
    assert.ok(all(a.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  }
});
