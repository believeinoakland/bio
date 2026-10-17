/* Settings › Members at the module's interface (R1, R2, R8 as R47 leaves them: the roster only; R12, R23, R29, R35, R47, R51): the
   screen run over the stand-in shell and a fake plane answering each op in its owner's shape; what it reads, what it draws, and
   what each act sends. The team's key and its account are `teamai`'s (teamai.test.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, textOf, texts, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, READER, ROSTER, FOUNDER_ROW, membersTable, membersTableMember, refuse, env } from "./fixtures.mjs";

const btn = (n, op, pred = () => true) => acts(n).filter((b) => b.attrs["data-act"] === op && pred(b));

test("R1 the reads: the roster for every member; the recovery step and the signing keys for an administrator; a member's expertise when opened; nothing of the team's key (R47)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  // the screen's own reads, from its first (the frame's own reads, interface-shell R20, come before it)
  const all0 = a.p.requests.map((r) => [r.op, r.query]);
  const reads = all0.slice(all0.findIndex((r) => r[0] === "memberlist")).slice(0, 4);
  assert.deepEqual(reads, [["memberlist", {}], ["expertiselist", { memberId: "ana" }], ["adminrecoverystep", {}], ["signerlist", {}]]);
  for (const op of ["accountuses", "ailimits", "aiusage", "accounthistory", "aiuseovertime"]) assert.ok(!a.p.requests.some((r) => r.op === op), `${op} is teamai's (R47)`);
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  const mo = m.p.requests.map((r) => r.op);
  assert.deepEqual(mo.filter((op) => !["whoami", "interfacewords", "groupidentity", "queue", "infolevel", "bootstrap", "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate"].includes(op)), ["memberlist"]);
  // what the owners refuse a member: the reads the screen asks of an administrator beyond those it asks of a member (N1073)
  const members = SCREENS.find((s) => s.id === "members");
  const adminOnly = Object.values(members.reads({ me: ADMIN, subject: "ana" })).map((r) => r.op).filter((op) => !Object.values(members.reads({ me: MEMBER })).some((r) => r.op === op));
  assert.ok(adminOnly.includes("adminrecoverystep") && adminOnly.includes("signerlist"), "the administrators' reads");
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
    // the capabilities in words; an administrator's row says all of it (R47)
    if (m.role === "admin") assert.ok(t.includes(said("screen.members.cap.all")), `${m.member_id}'s capabilities`);
    else for (const c of m.capabilities) assert.ok(t.includes(said("screen.members.cap." + c)));
    assert.ok(t.includes(said("screen.members.status." + m.status)));
  }
  has(a, "screen.members.count", { members: 5, administrators: 3 });
  assert.ok(!/formerly/i.test(a.html), "no formerly");
  assert.ok(textOf(rowOf(a.tree, "ana")).includes(said("screen.members.expertise.declared", { label: "CPA" })));
});

test("R47 to a member who does not administer, Members is a table of members, what each may do and their expertise, with who changes it; no key or keep-away section", async () => {
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!m.html.includes("R. Medina") && !m.html.includes(said("screen.members.col.cover")), "no cover column, no cover");
  const th = all(m.tree, (e) => e.tag === "th").map((e) => textOf(e));
  assert.deepEqual(th, ["column.members.member.name", "column.members.may-do.name", "column.members.expertise.name"].map((k) => said(k)));
  for (const c of ["member", "may-do", "expertise"]) assert.ok(all(m.tree, (e) => e.attrs["data-tip"] === said(`column.members.${c}.shows`)).length, `${c} is explained`);
  const dev = all(m.tree, (e) => e.tag === "tr").find((r) => textOf(r).startsWith("dev"));
  assert.ok(textOf(dev).includes(said("screen.members.cap.contribute")), "the capabilities in words");
  assert.ok(textOf(dev).includes(said("screen.members.expertise.none")), "an empty expertise is told");
  const lu = all(m.tree, (e) => e.tag === "tr").find((r) => textOf(r).startsWith("lu"));
  assert.ok(textOf(lu).includes(said("screen.members.cap.all")), "an administrator's row");
  has(m, "screen.members.member.note");
  for (const k of ["screen.members.key.heading", "screen.members.keepaway.heading", "screen.panel.usage.heading"]) lacks(m, k);
  assert.deepEqual(acts(m.tree).map((b) => b.attrs["data-act"]), []);
  // control: an administrator's roster keeps the invitations and the administrators' acts, and draws no key section either
  const a = await open("members", { me: ADMIN, table: membersTable() });
  for (const k of ["screen.members.key.heading", "screen.members.keepaway.heading"]) lacks(a, k);
  assert.ok(btn(a.tree, "memberadd").length);
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

test("R1 each read drawn in its state: still loading, empty, could not read (never as empty), or its data", async () => {
  const loading = await open("members", { me: ADMIN, table: membersTable({ memberlist: "pending" }) });
  assert.ok(all(loading.tree, (e) => e.attrs["data-state"] === "loading").length >= 1);
  const empty = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [] }) }) });
  has(empty, "screen.members.empty");
  const failed = await open("members", { me: ADMIN, table: membersTable({ memberlist: "none" }) });
  assert.equal(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length, 1);
  lacks(failed, "screen.members.empty");
});

/* R2's act table (R47: the roster's eleven): every registry act of `members`, the state in which it applies, and where it is drawn. */
const TABLE = [
  ["passwordresetlink", "dev"], ["signerset", "dev"],
  ["memberadd", null], ["membercaps", "dev"], ["memberset", "dev"], ["adminendorse", "kim"], ["adminremove", "lu"], ["expertiseconfirm", "ana"],
  ["invitewithdraw", "mai-k"], ["websitekeycreate", null], ["joinlinkenable", null],
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

/* R29, R35, R51: the counts agree with what they name, and the founder's row is the roster's own */
test("R29 Administrators and Active members count the roster as listed, the founder's row once among them (R51)", async () => {
  const one = [{ member_id: "rosa", handle: "rosa", role: "admin", status: "active", capabilities: [], cover: "R", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [FOUNDER_ROW, ...one] }) }) });
  has(a, "screen.members.count", { members: 2, administrators: 2 });
  // the same count to a member who does not administer
  const m = await open("members", { me: MEMBER, table: membersTableMember({ memberlist: env({ members: [FOUNDER_ROW, ...one] }) }) });
  has(m, "screen.members.count", { members: 2, administrators: 2 });
  // control: an unclaimed team's roster holds no founder row, so none is counted; a proposed or revoked administrator is not counted
  const u = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: ROSTER }) }) });
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

test("R35, R51 a claimed team with no founder handle held draws her row from the roster, handle null: Active members 2, Administrators 1 with one other member; never named by admin", async () => {
  const one = [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [FOUNDER_ROW, ...one] }), adminrecoverystep: env({ ok: true, administrators: 1, codes_held: true, remaining: 8, met: true }) }) });
  has(a, "screen.members.count", { members: 2, administrators: 1 });
  const row = rowOf(a.tree, "admin", said("member.founder.unnamed") + said("member.founder.unnamed.help"));
  assert.ok(row, "her row is drawn");
  assert.ok(textOf(row).includes(said("member.founder.unnamed")) && textOf(row).includes(said("member.founder.unnamed.help")), "named, and explained");
  assert.ok(textOf(row).includes(said("screen.members.role.admin")) && textOf(row).includes(said("screen.members.status.active")));
  assert.ok(!/\badmin\b/.test(a.text.replace(said("screen.members.role.admin"), "")), "never named by admin");
  assert.equal(all(a.tree, (e) => e.tag === "details" && textOf(e).includes(said("member.founder.unnamed.summary"))).length, 0, "her row stays in the roster, not folded");
  assert.equal(all(a.tree, (e) => e.tag === "tr").filter((r) => textOf(r).includes(said("member.founder.unnamed"))).length, 1, "the page adds no row of its own");
  // no act removes or resets the founder
  assert.deepEqual(acts(panelOf(a.tree, "admin")).map((b) => b.attrs["data-act"]), [], "no act on her row");
  // control: an unclaimed team's roster holds no founder row, so none is drawn
  const u = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: one }), adminrecoverystep: env({ ok: true, administrators: 0, codes_held: false, remaining: 0, met: false }) }) });
  has(u, "screen.members.count", { members: 1, administrators: 0 });
  assert.equal(rowOf(u.tree, "admin", said("member.founder.unnamed") + said("member.founder.unnamed.help")), null);
});

test("R35 control: with her handle held her row draws it, in her own session and wherever the roster answers it", async () => {
  const one = [{ member_id: "ana", handle: "ana", role: "member", status: "active", capabilities: ["contribute"], cover: "Ana", expertise: [], invitation: "spent" }];
  const founder = { member: "admin", handle: "cleo", administer: true, capabilities: ["contribute"], vocabulary: ["contribute", "publish", "create_projects"], tokenClass: "session" };
  const mine = await open("members", { me: founder, table: membersTable({ whoami: env(founder), memberlist: env({ members: [FOUNDER_ROW, ...one] }) }) });
  assert.ok(textOf(rowOf(mine.tree, "admin", "cleo")).includes("cleo"));
  assert.ok(!mine.text.includes(said("member.founder.unnamed.help")), "no explanation once she has a handle");
  // a roster that answers her row with her handle names her to every reader
  const row = { ...FOUNDER_ROW, handle: "cleo" };
  const other = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [row, ...one] }) }) });
  has(other, "screen.members.count", { members: 2, administrators: 1 });
  assert.ok(textOf(rowOf(other.tree, "admin", "cleo")).includes("cleo"));
  assert.ok(!other.text.includes(said("member.founder.unnamed.help")));
});
