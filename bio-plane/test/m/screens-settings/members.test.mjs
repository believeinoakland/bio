/* Settings › Members at the module's interface (R1, R2, R8, R9 over `owner: "group"`): the screen run over the stand-in
   shell and a fake plane answering each op in its owner's shape; what it reads, what it draws, and what each act sends. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, acts, all, texts, textOf, said, ancestor } from "./kit.mjs";
import { ADMIN, MEMBER, READER, ROSTER, membersTable, membersTableMember, refuse, env } from "./fixtures.mjs";

const panelOf = (o, id) => all(o.tree, (e) => e.attrs["data-panel-of"] === id)[0] || { children: [] };
const btn = (n, op, pred = () => true) => acts(n).filter((b) => b.attrs["data-act"] === op && pred(b));
const has = (o, key, fills) => assert.ok(o.html.includes(o.cs.w(key, fills)), `drawn: ${key}`);
const lacks = (o, key, fills) => assert.ok(!o.html.includes(o.cs.w(key, fills)), `not drawn: ${key}`);

test("R1 the reads: the roster, the group's key and the keep-away for every member; the recovery step and the group's account (owner group) for an administrator; a member's expertise when opened", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  const reads = a.p.requests.map((r) => [r.op, r.query]);
  assert.deepEqual(reads, [["memberlist", {}], ["groupkeystate", {}], ["aikeepawaystate", {}], ["expertiselist", { memberId: "ana" }],
    ["adminrecoverystep", {}], ["accountuses", { owner: "group" }], ["ailimits", { owner: "group" }], ["aiusage", { owner: "group" }], ["accounthistory", { owner: "group" }]]);
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.deepEqual(m.p.requests.map((r) => r.op), ["memberlist", "groupkeystate", "aikeepawaystate"], "nothing the owners refuse a member is read");
});

test("R1 the roster: each member's handle, cover (to an administrator), role, capabilities and status; no \"formerly\" (DEC-197)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  for (const m of ROSTER) {
    const row = all(a.tree, (e) => e.attrs["data-row"] === m.member_id)[0];
    assert.ok(row, m.member_id);
    const t = textOf(row);
    assert.ok(t.includes(m.handle || said("screen.members.nohandle")));
    assert.ok(t.includes(m.cover), `${m.member_id}'s cover`);
    assert.ok(t.includes(said(m.role === "admin" ? "screen.members.role.admin" : "screen.members.role.member")));
    for (const c of m.capabilities) assert.ok(t.includes(said("screen.members.cap." + c)));
    assert.ok(t.includes(said("screen.members.status." + m.status)));
  }
  has(a, "screen.members.count", { members: 4, administrators: 2 });
  assert.ok(!/formerly/i.test(a.html), "no formerly");
  assert.ok(textOf(all(a.tree, (e) => e.attrs["data-row"] === "ana")[0]).includes(said("screen.members.expertise.declared", { label: "CPA" })));
  // a member who does not administer: no cover column, no cover
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!m.html.includes("R. Medina") && !m.html.includes(said("screen.members.col.cover")));
});

test("R1 the one-administrator note while the step is not met, as setup-page R16 states it; nothing once met", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  has(a, "screen.members.recovery.one");
  has(a, "screen.members.recovery.nocodes", { remaining: 0 });
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "#members-invite").length === 1, "the act that meets it: adding an administrator");
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/").length === 1, "and issuing codes, in Group settings");
  const two = await open("members", { me: ADMIN, table: membersTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: true, remaining: 7, met: true }) }) });
  assert.ok(!all(two.tree, (e) => e.attrs["data-note"] === "recovery").length);
  const many = await open("members", { me: ADMIN, table: membersTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: false, remaining: 0, met: false }) }) });
  has(many, "screen.members.recovery.many", { administrators: 2 });
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!all(m.tree, (e) => e.attrs["data-note"] === "recovery").length);
});

test("R1 the group's key and its use: held and on, never the key; use summed over members, naming none (DEC-188 (5))", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  has(a, "screen.members.key.heldon", { by: "rosa", date: "2026-10-06" });
  const usage = all(a.tree, (e) => e.tag === "section" && textOf(e).startsWith(said("screen.panel.usage.heading")))[0];
  assert.ok(usage, "the use is drawn");
  const ut = textOf(usage);
  for (const m of ROSTER) assert.ok(!new RegExp(`\\b${m.member_id}\\b`).test(ut), `the use names no member (${m.member_id})`);
  assert.ok(ut.includes(said("screen.panel.usage.all")) && ut.includes("296") && ut.includes("$31.40"), "summed");
  // a member who does not administer sees whether the key is on, nothing of its use
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  has(m, "screen.members.key.on");
  assert.ok(!m.html.includes(said("screen.panel.usage.heading")));
});

test("R1 each read drawn in its state: still loading, empty, could not read (never as empty), or its data", async () => {
  const loading = await open("members", { me: ADMIN, table: membersTable({ memberlist: "pending" }) });
  assert.ok(all(loading.tree, (e) => e.attrs["data-state"] === "loading").length >= 1);
  const empty = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [] }) }) });
  has(empty, "screen.members.empty");
  const failed = await open("members", { me: ADMIN, table: membersTable({ memberlist: "none", groupkeystate: refuse("NOT_AN_ADMIN") }) });
  assert.equal(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length, 2);
  lacks(failed, "screen.members.empty");
  const ka = await open("members", { me: ADMIN, table: membersTable({ aikeepawaystate: env({ on: null, reason: null, set_by: null, set_at: null, uses: [] }) }) });
  has(ka, "screen.members.keepaway.unread");
  lacks(ka, "screen.members.keepaway.off");
});

/* R2's act table: every registry act of `members`, the state in which it applies, and where it is drawn. */
const TABLE = [
  ["memberadd", null], ["membercaps", "dev"], ["memberset", "dev"], ["adminendorse", "kim"], ["adminremove", "lu"], ["expertiseconfirm", "ana"],
  ["invitewithdraw", "mai-k"], ["websitekeycreate", null], ["joinlinkenable", null], ["groupkeyset", null], ["groupkeyswitch", null],
  ["groupkeyremove", null], ["accountusesset", null], ["ailimitset", null], ["aikeepaway", null],
];

test("R2 every registry act is drawn for an administrator where it applies, each row's acts in its own panel; none to a member who does not administer", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  assert.deepEqual([...new Set(acts(a.tree).map((b) => b.attrs["data-act"]))].sort(), TABLE.map((t) => t[0]).sort(), "exactly the registry's acts");
  for (const [op, row] of TABLE) {
    const bs = btn(a.tree, op);
    assert.ok(bs.length, op);
    if (row) assert.ok(bs.some((b) => ancestor(b, (p) => p.attrs["data-panel-of"] === row)), `${op} in ${row}'s panel`);
    if (row) assert.ok(bs.every((b) => ancestor(b, (p) => p.attrs["data-panel-of"])), `${op} only in a row's panel`);
  }
  // no act where it does not apply: no endorsing an active administrator, no capabilities for one, none on oneself
  assert.ok(!btn(panelOf(a, "rosa"), "adminremove").length && !btn(panelOf(a, "lu"), "membercaps").length && !btn(panelOf(a, "dev"), "adminendorse").length);
  assert.ok(!btn(panelOf(a, "dev"), "invitewithdraw").length);
  for (const me of [MEMBER, READER]) {
    const m = await open("members", { me, table: membersTableMember() });
    assert.deepEqual(acts(m.tree).map((b) => b.attrs["data-act"]), [], "absent, not greyed");
  }
});

test("R2 memberadd: the short id, the cover and the capabilities ticked; the invitation answered shown once, with the sentence that no email is sent", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  has(a, "screen.members.invite.noemail");
  assert.ok(said("screen.members.invite.noemail").startsWith("Your group's Civicsmith sends no email"));
  const r = await a.press("memberadd", { values: { "mi-id": "mai-k2", "mi-cover": "Mai's cousin", "mi-cap-contribute": true, "mi-cap-publish": true } });
  assert.deepEqual(r.sent[0], { op: "memberadd", query: {}, body: { memberId: "mai-k2", cover: "Mai's cousin", capabilities: ["contribute", "publish"] }, headers: r.sent[0].headers });
  const shown = all(a.tree, (e) => e.attrs["data-shown"] === "invite")[0];
  assert.ok(textOf(shown).includes("https://group.example/#invite=0123456789abcdef0123456789abcdef"));
  const admin = await a.press("memberadd", { values: { "mi-id": "lee", "mi-cover": "Lee", "mi-cap-contribute": true, "mi-cap-administer": true } });
  assert.equal(admin.sent[0].body.role, "admin");
  const held = await a.press("memberadd", { values: { "mi-id": "", "mi-cover": "x" } });
  assert.deepEqual(held.sent, []);
  assert.equal(a.refused.key, "screen.members.invite.incomplete");
});

test("R2 the row acts send their owners' arguments: membercaps, memberset, adminendorse, adminremove (with its reason), expertiseconfirm, invitewithdraw", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  const body = async (op, opt) => (await a.press(op, opt)).sent[0].body;
  assert.deepEqual(await body("membercaps", { data: { member: "dev" }, values: { "mc-dev-contribute": true, "mc-dev-create_projects": true } }), { memberId: "dev", capabilities: ["contribute", "create_projects"] });
  assert.deepEqual(await body("memberset", { data: { member: "dev", status: "revoked" } }), { memberId: "dev", status: "revoked" });
  assert.deepEqual(await body("memberset", { data: { member: "old", status: "active" } }), { memberId: "old", status: "active" });
  assert.deepEqual(await body("adminendorse", { data: { member: "kim" } }), { memberId: "kim" });
  has(a, "screen.members.invite.shown", { handle: "kim", expires: "2026-10-19" });
  assert.deepEqual(await body("adminremove", { data: { member: "lu" }, reason: "Moved away" }), { memberId: "lu", reason: "Moved away" });
  assert.deepEqual(await body("expertiseconfirm", { data: { member: "ana", label: "CPA" } }), { memberId: "ana", label: "CPA" });
  assert.deepEqual(await body("invitewithdraw", { data: { member: "mai-k" } }), { memberId: "mai-k" });
  // the panel's own data drive them: the buttons carry what the requests name
  const p = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  assert.equal(btn(panelOf(p, "ana"), "expertiseconfirm")[0].attrs["data-label"], "CPA");
  assert.equal(btn(panelOf(p, "dev"), "memberset")[0].attrs["data-status"], "revoked");
  assert.equal(btn(panelOf(p, "old"), "memberset")[0].attrs["data-status"], "active");
});

test("R2 joining through the website: websitekeycreate and joinlinkenable with a daily cap; the key and the link shown once", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const k = await a.press("websitekeycreate", { values: { "mw-cap": "5", "mw-days": "" } });
  assert.deepEqual(k.sent[0].body, { dailyCap: 5 });
  assert.ok(textOf(all(a.tree, (e) => e.attrs["data-shown"] === "websitekey")[0]).includes("a".repeat(64)));
  const l = await a.press("joinlinkenable", { values: { "mw-cap": "3", "mw-days": "14" } });
  assert.deepEqual(l.sent[0].body, { dailyCap: 3, expiresInDays: 14 });
  assert.ok(textOf(all(a.tree, (e) => e.attrs["data-shown"] === "joinlink")[0]).includes("https://group.example/#join=" + "b".repeat(64)));
  const none = await a.press("websitekeycreate", { values: { "mw-cap": "0" } });
  assert.deepEqual(none.sent, []);
  assert.equal(a.refused.key, "screen.members.website.nocap");
});

test("R2 the group's key: groupkeyset sends the key in the body only, then groupkeyswitch on (setup-page R18); never drawn again; switch and remove", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const KEY = "sk-ant-api03-SENTINELKEY";
  const r = await a.press("groupkeyset", { values: { "mk-key": KEY } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.query, x.body]).slice(0, 2), [["groupkeyset", {}, { key: KEY }], ["groupkeyswitch", {}, { on: true }]]);
  assert.ok(!a.html.includes(KEY), "never drawn again");
  assert.ok(!a.p.requests.slice(1).some((x) => x.op !== "groupkeyset" && JSON.stringify(x).includes(KEY)), "never sent again");
  assert.deepEqual((await a.press("groupkeyswitch", { data: { on: "off" } })).sent[0].body, { on: false });
  assert.equal(btn(a.tree, "groupkeyswitch")[0].attrs["data-on"], "off", "drawn to switch off while on");
  assert.deepEqual((await a.press("groupkeyremove")).sent[0].body, {});
  const empty = await a.press("groupkeyset", { values: { "mk-key": " " } });
  assert.deepEqual(empty.sent, []);
});

test("R2 aikeepaway: says first what it does; on only with a reason (the shell's reasoned friction, sent as `reason`), for every use or the ones chosen; off with none", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const form = ancestor(btn(a.tree, "aikeepaway")[0], (e) => e.attrs.class === "cs-form");
  const words = texts(form);
  assert.ok(words.indexOf(said("act.aikeepaway.does")) === 0, "what it does, first");
  const spec = a.s.acts.find((x) => x.op === "aikeepaway");
  assert.equal(spec.reasonField, "reason");
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true }, reason: "We hold tips." })).sent[0].body, { on: true, reason: "We hold tips." });
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true, "mk-use-ask": true, "mk-use-run": true }, reason: "Tips." })).sent[0].body, { on: true, uses: ["ask", "run"], reason: "Tips." });
  const none = await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true }, reason: "x" });
  assert.deepEqual(none.sent, []);
  const on = await open("members", { me: ADMIN, table: membersTable({ aikeepawaystate: env({ on: true, reason: "We hold tips.", set_by: "rosa", set_at: "2026-10-02T00:00:00Z", uses: ["ask"] }) }) });
  has(on, "screen.members.keepaway.on", { by: "rosa", date: "2026-10-02" });
  assert.ok(on.html.includes("We hold tips."));
  assert.deepEqual((await on.press("aikeepaway", { data: { on: "off" } })).sent[0].body, { on: false });
});

test("R2 a refusal is drawn beside its act and nothing else changes; R8 nothing is drawn as done before the answer", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable({ memberadd: refuse("EXISTS") }) });
  const before = a.html;
  const r = await a.press("memberadd", { values: { "mi-id": "dev", "mi-cover": "x" } });
  assert.ok(r.refused && a.refused.drawn.includes("translated EXISTS"));
  assert.equal(a.html, before, "nothing else changes");
  const b = await open("members", { me: ADMIN, table: membersTable({ memberset: "pending" }) });
  const was = b.html;
  b.press("memberset", { data: { member: "dev", status: "revoked" } });
  await new Promise((res) => setTimeout(res, 10));
  assert.equal(b.html, was, "nothing drawn while the act has not answered");
});
