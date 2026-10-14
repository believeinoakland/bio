/* Settings › Members at the module's interface (R1, R2, R8, R9 over `owner: "group"`): the screen run over the stand-in
   shell and a fake plane answering each op in its owner's shape; what it reads, what it draws, and what each act sends. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, textOf, texts, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, READER, ROSTER, membersTable, membersTableMember, refuse, env } from "./fixtures.mjs";

const btn = (n, op, pred = () => true) => acts(n).filter((b) => b.attrs["data-act"] === op && pred(b));

test("R1 the reads: the roster, the group's key and the keep-away for every member; the recovery step and the group's account (owner group) for an administrator; a member's expertise when opened", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  // the screen's own reads, from its first (the frame's own reads, interface-shell R20, come before it)
  const all0 = a.p.requests.map((r) => [r.op, r.query]);
  const reads = all0.slice(all0.findIndex((r) => r[0] === "memberlist")).slice(0, 10);
  assert.deepEqual(reads, [["memberlist", {}], ["groupkeystate", {}], ["aikeepawaystate", {}], ["expertiselist", { memberId: "ana" }],
    ["adminrecoverystep", {}], ["signerlist", {}], ["accountuses", { owner: "group" }], ["ailimits", { owner: "group" }], ["aiusage", { owner: "group" }], ["accounthistory", { owner: "group" }]]);
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  const mo = m.p.requests.map((r) => r.op);
  assert.deepEqual(mo.slice(mo.indexOf("memberlist"), mo.indexOf("memberlist") + 3), ["memberlist", "groupkeystate", "aikeepawaystate"]);
  // what the owners refuse a member: the reads the screen asks of an administrator beyond those it asks of a member (N1073)
  const members = SCREENS.find((s) => s.id === "members");
  const adminOnly = Object.values(members.reads({ me: ADMIN, subject: "ana" })).map((r) => r.op).filter((op) => !Object.values(members.reads({ me: MEMBER })).some((r) => r.op === op));
  assert.ok(adminOnly.includes("adminrecoverystep") && adminOnly.includes("aiusage"), "the administrators' reads");
  for (const op of adminOnly) assert.ok(!m.p.requests.some((r) => r.op === op), `nothing the owners refuse a member is read (${op})`);
});

test("R1 the roster: each member's handle, cover (to an administrator), role, capabilities and status; no \"formerly\" (DEC-197)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  for (const m of ROSTER) {
    const row = rowOf(a.tree, m.member_id, m.handle || said("screen.members.nohandle"));
    assert.ok(row, m.member_id);
    const t = textOf(row);
    assert.ok(t.includes(m.handle || said("screen.members.nohandle")));
    assert.ok(t.includes(m.cover), `${m.member_id}'s cover`);
    assert.ok(t.includes(said(m.role === "admin" ? "screen.members.role.admin" : "screen.members.role.member")));
    for (const c of m.capabilities) assert.ok(t.includes(said("screen.members.cap." + c)));
    assert.ok(t.includes(said("screen.members.status." + m.status)));
  }
  has(a, "screen.members.count", { members: 5, administrators: 3 });
  assert.ok(!/formerly/i.test(a.html), "no formerly");
  assert.ok(textOf(rowOf(a.tree, "ana")).includes(said("screen.members.expertise.declared", { label: "CPA" })));
  // a member who does not administer: no cover column, no cover
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!m.html.includes("R. Medina") && !m.html.includes(said("screen.members.col.cover")));
});

test("R1 the one-administrator note while the step is not met, as setup-page R16 states it; nothing once met", async () => {
  // the founder alone administers (R35): the sentence names her, by member.founder.unnamed while she has no handle
  const sole = [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: sole }) }) });
  has(a, "screen.members.recovery.one", { name: said("member.founder.unnamed") });
  has(a, "screen.members.recovery.nocodes", { remaining: 0 });
  assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "#members-invite").length === 1, "the act that meets it: adding an administrator");
  const note = all(a.tree, (e) => e.attrs["data-note"] === "recovery")[0];
  assert.ok(all(note, (e) => e.tag === "a" && e.attrs.href === "/app/recovery").length === 1, "and issuing codes, on Recovery codes");
  assert.equal(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/").length, 0, "no link opens the setup page");
  const two = await open("members", { me: ADMIN, table: membersTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: true, remaining: 7, met: true }) }) });
  assert.ok(!all(two.tree, (e) => e.attrs["data-note"] === "recovery").length);
  const many = await open("members", { me: ADMIN, table: membersTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: false, remaining: 0, met: false }) }) });
  has(many, "screen.members.recovery.many", { administrators: 2 });
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!all(m.tree, (e) => e.attrs["data-note"] === "recovery").length);
});

test("R1 the group's key and its use: held and on, never the key; use summed over members, naming none (DEC-188 (5))", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  has(a, "screen.members.key.heldon", { by: "rosa", date: day("2026-10-06") });
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
  ["passwordresetlink", "dev"], ["signerset", "dev"],
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
    if (row) assert.ok(btn(panelOf(a.tree, row), op).length, `${op} in ${row}'s panel`);
    if (row) assert.ok(bs.every((b) => ancestor(b, (p) => /cs-panel/.test(p.attrs.class || ""))), `${op} only in a row's panel`);
  }
  // no act where it does not apply: no endorsing an active administrator, no capabilities for one, none on oneself
  assert.ok(!btn(panelOf(a.tree, "rosa"), "adminremove").length && !btn(panelOf(a.tree, "lu"), "membercaps").length && !btn(panelOf(a.tree, "dev"), "adminendorse").length);
  assert.ok(!btn(panelOf(a.tree, "dev"), "invitewithdraw").length);
  for (const me of [MEMBER, READER]) {
    const m = await open("members", { me, table: membersTableMember() });
    assert.deepEqual(acts(m.tree).map((b) => b.attrs["data-act"]), [], "absent, not greyed");
  }
});

test("R2 memberadd: the short id, the cover and the capabilities ticked; the invitation answered shown once, with the sentence that no email is sent", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  has(a, "screen.members.invite.noemail");
  const r = await a.press("memberadd", { values: { "mi-id": "mai-k2", "mi-cover": "Mai's cousin", "mi-cap-contribute": true, "mi-cap-publish": true } });
  assert.deepEqual([r.sent[0].op, r.sent[0].query, r.sent[0].body, r.sent[0].method], ["memberadd", {}, { memberId: "mai-k2", cover: "Mai's cousin", capabilities: ["contribute", "publish"] }, "POST"]);
  assert.equal(r.sent[0].headers.Authorization, "Bearer tok-1", "the session in the header only");
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
  has(a, "screen.members.invite.shown", { handle: "kim", expires: day("2026-10-19") });
  assert.deepEqual(await body("adminremove", { data: { member: "lu" }, values: { "mr-lu": " Moved away " } }), { memberId: "lu", reason: "Moved away" });
  assert.deepEqual((await a.press("adminremove", { data: { member: "lu" }, values: { "mr-lu": "" } })).sent, [], "not without a reason");
  assert.deepEqual(await body("expertiseconfirm", { data: { member: "ana", label: "CPA" } }), { memberId: "ana", label: "CPA" });
  assert.deepEqual(await body("invitewithdraw", { data: { member: "mai-k" } }), { memberId: "mai-k" });
  // the panel's own data drive them: the buttons carry what the requests name
  const p = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  assert.equal(btn(panelOf(p.tree, "ana"), "expertiseconfirm")[0].attrs["data-label"], "CPA");
  assert.equal(btn(panelOf(p.tree, "dev"), "memberset")[0].attrs["data-status"], "revoked");
  assert.equal(btn(panelOf(p.tree, "old"), "memberset")[0].attrs["data-status"], "active");
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
  const r = await a.press("groupkeyset", { values: { "mk-key0": KEY } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.query, x.body]).slice(0, 2), [["groupkeyset", {}, { key: KEY }], ["groupkeyswitch", {}, { on: true }]]);
  assert.ok(!a.html.includes(KEY), "never drawn again");
  assert.ok(!a.p.requests.slice(1).some((x) => x.op !== "groupkeyset" && JSON.stringify(x).includes(KEY)), "never sent again");
  assert.deepEqual((await a.press("groupkeyswitch", { data: { on: "off" } })).sent[0].body, { on: false });
  assert.equal(btn(a.tree, "groupkeyswitch")[0].attrs["data-on"], "off", "drawn to switch off while on");
  assert.deepEqual((await a.press("groupkeyremove")).sent[0].body, {});
  const empty = await a.press("groupkeyset", { values: { "mk-key0": " " } });
  assert.deepEqual(empty.sent, []);
});

test("R2 aikeepaway: says first what it does; on only with a reason of 1 to 2,000 characters, for every use or the ones chosen; off with its reason too (op-grades: reasoned)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const form = ancestor(btn(a.tree, "aikeepaway")[0], (e) => e.tag === "div" && texts(e)[0] === said("act.aikeepaway.does"));
  const words = texts(form);
  assert.ok(words.indexOf(said("act.aikeepaway.does")) === 0, "what it does, first");
  const spec = a.s.acts.find((x) => x.op === "aikeepaway");
  assert.equal(spec.reasonField, "reason");
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "We hold tips." } })).sent[0].body, { on: true, reason: "We hold tips." });
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true, "mk-use-ask": true, "mk-use-run": true, "mk-why": "Tips." } })).sent[0].body, { on: true, reason: "Tips.", uses: ["ask", "run"] });
  for (const why of ["", " ", "x".repeat(2001)]) {
    assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": why } })).sent, [], "no reason, no keep-away");
    assert.equal(a.refused.key, "screen.members.keepaway.noreason");
  }
  assert.equal((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "x".repeat(2000) } })).sent[0].body.reason.length, 2000);
  const none = await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true, "mk-use-ask": false, "mk-use-run": false, "mk-why": "x" } });
  assert.deepEqual(none.sent, []);
  const on = await open("members", { me: ADMIN, table: membersTable({ aikeepawaystate: env({ on: true, reason: "We hold tips.", set_by: "rosa", set_at: "2026-10-02T00:00:00Z", uses: ["ask"] }) }) });
  has(on, "screen.members.keepaway.on", { by: "rosa", date: day("2026-10-02") });
  assert.ok(on.html.includes("We hold tips."));
  assert.deepEqual((await on.press("aikeepaway", { data: { on: "off" }, values: { "mk-why": "We publish our sources now." } })).sent[0].body, { on: false, reason: "We publish our sources now." });
  assert.deepEqual((await on.press("aikeepaway", { data: { on: "off" }, values: { "mk-why": "" } })).sent, [], "turning it off is reasoned too");
});

test("R2 a refusal is drawn beside its act and nothing else changes; R8 nothing is drawn as done before the answer", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable({ memberadd: refuse("EXISTS") }) });
  const before = a.text;
  const r = await a.press("memberadd", { values: { "mi-id": "dev", "mi-cover": "x" } });
  assert.ok(r.refused && a.refused.text.includes(said("refusal.EXISTS")), "the refusal's key's words (interface-shell R13)");
  assert.equal(a.text.replace(a.refused.text, "").replace(/\s+/g, " "), before.replace(/\s+/g, " "), "nothing else changes");
  assert.equal(a.b.doc.getElementById("mi-id").value, "dev", "the form keeps what was typed");
  const b = await open("members", { me: ADMIN, table: membersTable({ memberset: "pending" }) });
  const was = b.html;
  b.press("memberset", { data: { member: "dev", status: "revoked" } });
  await new Promise((res) => setTimeout(res, 10));
  assert.equal(b.html, was, "nothing drawn while the act has not answered");
});

test("R12 each row's name is the member's reference (cs.ref member, opening members/<id>), its panel opened by its own control", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  for (const m of ROSTER.filter((x) => x.handle)) {
    const row = rowOf(a.tree, m.member_id, m.handle);
    const ref = all(row, (e) => e.tag === "a" && e.attrs.href === "/app/members/" + m.member_id)[0];
    assert.ok(ref && textOf(ref) === m.handle, `${m.member_id}'s name is its reference`);
    assert.ok(!ancestor(ref, (p) => p.tag === "button"), "never inside its panel's control");
  }
  // control: one not joined yet has no reference
  assert.ok(!all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/members/mai-k").length);
});

test("R23 a member's row offers Make a reset link (passwordresetlink), the link shown once with the sentence that no email is sent", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable({ passwordresetlink: (q, b) => env({ ok: true, member: b.member, link: "rl-SENTINELLINK", expiresAt: "2026-10-19T00:00:00Z" }) }) });
  assert.ok(btn(panelOf(a.tree, "dev"), "passwordresetlink").length, "in the row's panel");
  assert.ok(!btn(panelOf(a.tree, "rosa"), "passwordresetlink").length && !btn(panelOf(a.tree, "mai-k"), "passwordresetlink").length, "not for oneself, nor one not joined");
  const r = await a.press("passwordresetlink", { data: { member: "dev" }, reason: "lost their password" });
  assert.deepEqual(r.sent[0].body.member, "dev");
  const shown = all(a.tree, (e) => e.attrs["data-shown"] === "reset")[0];
  assert.ok(textOf(shown).includes("https://group.example/app/reset#reset=rl-SENTINELLINK"));
  assert.ok(textOf(shown).includes(said("screen.members.reset.shown", { handle: "dev", expires: day("2026-10-19") })) && textOf(shown).includes(said("screen.members.reset.noemail")));
  assert.ok(![...a.b.store.values(), ...a.b.local.values()].some((v) => String(v).includes("SENTINELLINK")), "kept nowhere");
  // a member who does not administer is offered none
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!btn(m.tree, "passwordresetlink").length);
});

test("R23 More for administrators links group, places and recovery; a row offers Withdraw <handle>'s signing key (signerset) for a lost or stolen device", async () => {
  const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIDev000000000000000000000000000000000000009";
  const a = await open("members", { me: ADMIN, table: membersTable({ signerlist: env({ signers: [{ key_b64: KEY, member_id: "dev", comment: "", status: "active", added: "2026-10-04T00:00:00Z" }, { key_b64: "AAAAold", member_id: "dev", status: "revoked", added: "2026-10-01T00:00:00Z" }] }), signerset: (q, b) => env({ ok: true, ...b, by: "rosa" }) }) });
  for (const id of ["group", "places", "recovery"]) assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/" + id).length, id);
  has(a, "screen.members.more.heading");
  const w = btn(panelOf(a.tree, "dev"), "signerset");
  assert.equal(w.length, 1, "only the active key");
  assert.equal(textOf(w[0]).startsWith(said("screen.members.signer.withdraw", { handle: "dev" })), true);
  assert.deepEqual((await a.press("signerset", { data: { key: KEY } })).sent[0].body, { keyB64: KEY, status: "revoked" });
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  lacks(m, "screen.members.more.heading");
  assert.ok(!m.p.requests.some((r) => r.op === "signerlist"));
});

/* R29: the counts agree with what they name */
test("R29 Administrators counts the founder once claimed, with or without a roster row; the members count says it counts active members", async () => {
  const one = [{ member_id: "rosa", handle: "rosa", role: "admin", status: "active", capabilities: [], cover: "R", expertise: [], invitation: "spent" }];
  // a founder with no roster row and one roster administrator
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: one }), bootstrap: { ok: true, claimed: true } }) });
  // (R35) the founder is among the active members: never fewer than the administrators the count names
  has(a, "screen.members.count", { members: 2, administrators: 2 });
  // the same count to a member who does not administer (the founder is public as claimed)
  const m = await open("members", { me: MEMBER, table: membersTableMember({ memberlist: env({ members: one }), bootstrap: { ok: true, claimed: true } }) });
  has(m, "screen.members.count", { members: 2, administrators: 2 });
  // control: an unclaimed instance has no founder to count; a proposed or revoked administrator is not counted
  const u = await open("members", { me: ADMIN, table: membersTable({ bootstrap: { ok: true, claimed: false } }) });
  has(u, "screen.members.count", { members: 4, administrators: 2 });
});

test("R29 control: a member with no expertise shows no Expertise, and an empty cell draws nothing", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const cells = (key) => all(rowOf(a.tree, key), (e) => e.tag === "td").map((c) => textOf(c).trim());
  const last = (key) => cells(key)[cells(key).length - 1];
  assert.equal(last("dev"), "", "dev declared nothing: the cell is empty");
  assert.ok(last("ana").includes("CPA"), "ana declared CPA");
  assert.ok(!textOf(rowOf(a.tree, "dev")).match(/undefined|null/));
});

/* R35 (T49; D26 M; membership R144, R64, R86; project-roster R29): the founder is counted among the active members, her row is drawn
   whether or not the roster holds one, named by her handle or by member.founder.unnamed (explained by its help), never by `admin` */
test("R35 the founder is among the active members and has a row: a founder with no roster row and one roster member read Active members 2, Administrators 1", async () => {
  const one = [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: one }), bootstrap: { ok: true, claimed: true }, adminrecoverystep: env({ ok: true, administrators: 1, codes_held: true, remaining: 8, met: true }) }) });
  has(a, "screen.members.count", { members: 2, administrators: 1 });
  const row = rowOf(a.tree, "admin", said("member.founder.unnamed") + said("member.founder.unnamed.help"));
  assert.ok(row, "her row is drawn");
  assert.ok(textOf(row).includes(said("member.founder.unnamed")) && textOf(row).includes(said("member.founder.unnamed.help")), "named, and explained");
  assert.ok(textOf(row).includes(said("screen.members.role.admin")) && textOf(row).includes(said("screen.members.status.active")));
  assert.ok(!/\badmin\b/.test(a.text.replace(said("screen.members.role.admin"), "")), "never named by admin");
  // no act removes or resets the founder
  assert.deepEqual(acts(panelOf(a.tree, "admin")).map((b) => b.attrs["data-act"]), [], "no act on her row");
  // control: an unclaimed instance has no founder to count or to draw
  const u = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: one }), bootstrap: { ok: true, claimed: false }, adminrecoverystep: env({ ok: true, administrators: 0, codes_held: false, remaining: 0, met: false }) }) });
  has(u, "screen.members.count", { members: 1, administrators: 0 });
  assert.equal(rowOf(u.tree, "admin", said("member.founder.unnamed") + said("member.founder.unnamed.help")), null);
});

test("R35 control: with her handle held her row draws it, in her own session and wherever the roster answers it; the sole administrator is named by it", async () => {
  const one = [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }];
  const founder = { member: "admin", handle: "cleo", administer: true, capabilities: ["contribute"], vocabulary: ["contribute", "publish", "create_projects"], tokenClass: "session" };
  const mine = await open("members", { me: founder, table: membersTable({ whoami: env(founder), memberlist: env({ members: one }), bootstrap: { ok: true, claimed: true } }) });
  assert.ok(textOf(rowOf(mine.tree, "admin", "cleo")).includes("cleo"));
  assert.ok(!mine.text.includes(said("member.founder.unnamed.help")), "no explanation once she has a handle");
  has(mine, "screen.members.recovery.one", { name: "cleo" });
  // a roster that answers her row (project-roster R29) names her to every reader
  const row = { member_id: "admin", handle: "cleo", founder: true, role: "admin", status: "active", capabilities: [] };
  const other = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [row, ...one] }), bootstrap: { ok: true, claimed: true } }) });
  has(other, "screen.members.count", { members: 2, administrators: 1 });
  assert.ok(textOf(rowOf(other.tree, "admin", "cleo")).includes("cleo"));
  has(other, "screen.members.recovery.one", { name: "cleo" });
  // the keep-away line and the key's line name her too, never admin
  const kept = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [row, ...one] }), bootstrap: { ok: true, claimed: true }, groupkeystate: env({ ok: true, held: true, on: true, set_at: "2026-10-06T08:00:00Z", by: "admin" }) }) });
  has(kept, "screen.members.key.heldon", { by: "cleo", date: day("2026-10-06") });
});
