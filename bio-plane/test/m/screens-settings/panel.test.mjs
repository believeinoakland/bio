/* The AI account panel at the module's interface (R9; DEC-188 (1)): one render over an owner, drawn by `members` for the
   group's key and by `connect` for the member's own account. */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, acts, all, day, has, lacks, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, membersTable, connectTable, refuse, env, LIMITS } from "./fixtures.mjs";

const section = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];

test("R9 one render serves both: members (owner group) and connect (owner member:<me>) draw the same panel function", () => {
  const m = SCREENS.find((s) => s.id === "members"), c = SCREENS.find((s) => s.id === "connect");
  assert.equal(m.parts.aiPanel, c.parts.aiPanel);
  assert.equal(m.parts.aiPanelSend, c.parts.aiPanelSend);
});

test("R9 what the account pays for: each use (ai.use.<u>.name) on or off with its switch; exploring (ai.explore.*) at group level only", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const uses = section(a, "screen.panel.uses.heading");
  for (const u of ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "suggestions"]) assert.ok(textOf(uses).includes(said(`ai.use.${u}.name`)), u);
  const sw = acts(uses).filter((b) => b.attrs["data-act"] === "accountusesset" && b.attrs["data-sw"] !== "explore");
  assert.equal(sw.length, 9);
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "standing").attrs["data-to"], "on", "an off use offers on");
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "ask").attrs["data-to"], "off");
  const ex = all(uses, (e) => e.attrs.id === "aig-explore")[0];
  assert.deepEqual(all(ex, (e) => e.tag === "option").map((o) => textOf(o)), ["ai.explore.no", "ai.explore.ask", "ai.explore.yes"].map((k) => said(k)));
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "standing", to: "on" } })).sent[0].body, { owner: "group", switch: "standing", on: true });
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "explore" }, values: { "aig-explore": "ask" } })).sent[0].body, { owner: "group", switch: "explore", on: "ask" });
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own", { accountuses: (q) => env({ ok: true, owner: q.owner, held: false, uses: null, keptAway: [] }) }) });
  assert.ok(textOf(section(none, "screen.panel.uses.heading")).includes(said("screen.panel.uses.none")));
});

test("R9 its limits as a table with one form: set (overall, a use within or on top, each member's use at group level) and remove", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const lim = section(a, "screen.panel.limits.heading");
  const rows = all(lim, (e) => e.tag === "tbody")[0].children.filter((c) => c.tag === "tr");
  assert.equal(rows.length, LIMITS.limits.length);
  assert.ok(textOf(rows[0]).includes(said("screen.panel.scope.overall")) && textOf(rows[0]).includes("$60.00"));
  assert.ok(textOf(rows[1]).includes(said("screen.panel.scope.per_member")));
  assert.ok(textOf(rows[2]).includes(said("ai.use.run.name")) && textOf(rows[2]).includes(said("screen.panel.ontop")) && textOf(rows[2]).includes(said("screen.panel.reached")));
  const scopes = all(all(lim, (e) => e.attrs.id === "aig-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(scopes.includes("per_member") && scopes.includes("explore") && scopes[0] === "overall");
  assert.equal(all(lim, (e) => e.tag === "button" && e.attrs["data-act"] === "ailimitset" && e.attrs["data-remove"] === "").length, 1, "one form");
  const v = { "aig-scope": "run", "aig-amount": "2,000,000", "aig-unit": "tokens", "aig-period": "month" };
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-ontop": true } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: 2000000, inclusive: false });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-within": true } })).sent[0].body.inclusive, true);
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { "aig-scope": "per_member", "aig-amount": "$5", "aig-unit": "usd", "aig-period": "day" } })).sent[0].body, { owner: "group", scope: "per_member", unit: "usd", period: "day", amount: 5 });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "1", scope: "run", unit: "tokens", period: "month" } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: null });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-amount": "0" } })).sent, []);
  // a member's own account: no exploring, no per-member limit
  const c = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  const cs = all(all(c.tree, (e) => e.attrs.id === "aio-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(!cs.includes("per_member") && !cs.includes("explore"));
});

test("R9 a refused limit is drawn with ai.limitfield.* naming the field (AI_LIMIT_INVALID)", async () => {
  for (const field of ["amount", "unit", "period", "scope"]) {
    const a = await open("members", { me: ADMIN, table: membersTable({ ailimitset: refuse("AI_LIMIT_INVALID", { field }) }) });
    await a.press("ailimitset", { data: { remove: "" }, values: { "aig-scope": "overall", "aig-amount": "5", "aig-unit": "usd", "aig-period": "day" } });
    assert.equal(a.refused.text, said("ai.refused.limitinvalid", { field: said(`ai.limitfield.${field}`) }));
  }
  const u = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription", { ailimitset: refuse("LIMIT_UNIT_UNAVAILABLE") }) });
  await u.press("ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "5", "aio-unit": "usd", "aio-period": "day" } });
  assert.equal(u.refused.text, said("ai.refused.unitunavailable"));
});

test("R9 this month's use summed per use and in all, naming no member; the changes with who and when, the limits' and the account's together", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const use = textOf(section(a, "screen.panel.usage.heading"));
  assert.ok(use.includes("220") && use.includes("1,900,000") && use.includes("$12.60") && use.includes("296") && use.includes("5,000,000") && use.includes("$31.40"));
  assert.ok(use.includes(said("screen.panel.usage.group")));
  const ch = all(section(a, "screen.panel.changes.heading"), (e) => e.tag === "li").map((e) => textOf(e));
  assert.equal(ch.length, 5);
  assert.ok(ch[0].startsWith(said("screen.panel.change.limit.removed", { who: "lu", scope: said("ai.use.draft.name"), amount: "", unit: said("screen.panel.unit.calls"), period: said("screen.panel.period.day") })) && ch[0].endsWith(day("2026-10-08")), "newest first, with who and when");
  assert.ok(ch.some((t) => t.startsWith(said("screen.panel.change.use_set", { who: "lu", use: said("ai.use.explore.name"), value: said("ai.explore.ask") }))));
  assert.ok(ch.some((t) => t.startsWith(said("screen.panel.change.key_set", { who: "rosa" }))));
  const c = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.ok(textOf(section(c, "screen.panel.changes.heading")).includes(said("screen.panel.change.key_set", { who: said("screen.connect.you") })));
});
