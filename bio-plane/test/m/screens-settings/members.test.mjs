/* Settings › Members at the module's interface (R1, R2, R8 as R47 leaves them: the roster only; R12, R23, R29, R35, R47, R51): the
   screen run over the stand-in shell and a fake plane answering each op in its owner's shape; what it reads, what it draws, and
   what each act sends. The team's key and its account are `teamai`'s (teamai.test.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, squash, textOf, texts, SCREENS } from "./kit.mjs";
import { SHELL_OPS } from "../../../src/interface-shell/index.mjs";
import { ADMIN, MEMBER, READER, ROSTER, FOUNDER_ROW, SIGNERS, SIGNER_KEYS, ARITH, membersTable, membersTableMember, refuse, env } from "./fixtures.mjs";

const btn = (n, op, pred = () => true) => acts(n).filter((b) => b.attrs["data-act"] === op && pred(b));

test("R1 the reads: the roster for every member; the recovery step and the signing keys for an administrator; a member's expertise when opened; nothing of the team's key (R47)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable(), subject: "ana" });
  // the screen's own reads, from its first (the frame's own reads, interface-shell R20, come before it)
  const all0 = a.p.requests.map((r) => [r.op, r.query]);
  const reads = all0.slice(all0.findIndex((r) => r[0] === "memberlist")).slice(0, 6);
  assert.deepEqual(reads, [["memberlist", {}], ["expertiselist", { memberId: "ana" }], ["adminrecoverystep", {}], ["signerlist", {}], ["adminarith", {}], ["adminremovalsopen", {}]]);
  // the team's key and its use are `teamai`'s reads (R47): whatever it reads beyond the roster's own and the frame's is not read here
  const mine = Object.values(SCREENS.find((s) => s.id === "members").reads({ me: ADMIN, subject: "ana" })).map((r) => r.op);
  const teams = Object.values(SCREENS.find((s) => s.id === "teamai").reads({ me: ADMIN })).map((r) => r.op).filter((op) => !mine.includes(op) && !SHELL_OPS.includes(op));
  assert.ok(teams.length >= 5, "the team's account reads");
  for (const op of teams) assert.ok(!a.p.requests.some((r) => r.op === op), `${op} is teamai's (R47)`);
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  const mo = m.p.requests.map((r) => r.op);
  assert.deepEqual(mo.filter((op) => !SHELL_OPS.includes(op)), ["memberlist"]);
  // what the owners refuse a member: the reads the screen asks of an administrator beyond those it asks of a member (N1073)
  const members = SCREENS.find((s) => s.id === "members");
  const adminOnly = Object.values(members.reads({ me: ADMIN, subject: "ana" })).map((r) => r.op).filter((op) => !Object.values(members.reads({ me: MEMBER })).some((r) => r.op === op));
  assert.ok(adminOnly.includes("adminrecoverystep") && adminOnly.includes("signerlist") && adminOnly.includes("adminarith") && adminOnly.includes("adminremovalsopen"), "the administrators' reads");
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
  ["passwordresetlink", "dev"], ["signerset", null], ["signeradd", null],
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
  const r = await a.press("memberadd", { values: { "mi-id": "mai-k2", "mi-cover": "Mai's cousin", "mi-caps-0": true, "mi-caps-1": true } });
  assert.deepEqual([r.sent[0].op, r.sent[0].query, r.sent[0].body, r.sent[0].method], ["memberadd", {}, { memberId: "mai-k2", cover: "Mai's cousin", capabilities: ["contribute", "publish"] }, "POST"]);
  assert.equal(r.sent[0].headers.Authorization, "Bearer tok-1", "the session in the header only");
  const shown = all(a.tree, (e) => e.attrs["data-shown"] === "invite")[0];
  assert.ok(textOf(shown).includes("https://group.example/#invite=0123456789abcdef0123456789abcdef"));
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
  // the shell marks the pressed button busy (interface-shell R74); nothing else is drawn
  assert.equal(b.html.replace(/ aria-busy="true"/g, ""), was, "nothing drawn while the act has not answered");
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

test("R23 More for administrators links group, places and recovery; a member's row offers no signing-key act of its own (R55 draws them in the keys section)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  for (const id of ["group", "places", "recovery"]) assert.ok(all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/" + id).length, id);
  has(a, "screen.members.more.heading");
  for (const m of ROSTER) assert.ok(!btn(panelOf(a.tree, m.member_id), "signerset").length, `${m.member_id}'s panel`);
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  lacks(m, "screen.members.more.heading");
  assert.ok(!m.p.requests.some((r) => r.op === "signerlist"));
});

/* R55 (T51; K3807; DEC-330 A74, B5; DEC-332 (4); DEC-335, DEC-336 (7)): the members' signing keys, withdrawn and reactivated, and one registered for a member */
const keysSection = (o) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("screen.members.keys.heading")))[0];
const keyRow = (o, id) => all(keysSection(o), (e) => e.tag === "li" && e.attrs["data-member"] === id)[0];

test("R55 the keys section lists a row for each active member and the founder: who registered each active key and when, the founder named as R51 names her, and no key says so", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const sec = keysSection(a);
  assert.ok(sec, "drawn to an administrator");
  assert.ok(all(sec, (e) => e.tag === "li").length === 5, "the founder, rosa, dev, ana and lu: each active member once");
  assert.ok(!keyRow(a, "kim") && !keyRow(a, "old") && !keyRow(a, "mai-k"), "no row for a member proposed, revoked or not joined");
  // the founder, named by `member.founder.unnamed` (her roster row has no handle), registered by herself
  assert.ok(textOf(keyRow(a, "admin")).includes(said("member.founder.unnamed")));
  assert.ok(textOf(keyRow(a, "admin")).includes(said("screen.members.key.registered.by.rosa.3", { member: said("member.founder.unnamed"), date: day("2026-10-02T00:00:00Z") })));
  // an administrator registered lu's key: named by handle through the roster, with the day
  assert.ok(textOf(keyRow(a, "lu")).includes(said("screen.members.key.registered.by.rosa.3", { member: "rosa", date: day("2026-10-05T00:00:00Z") })));
  assert.ok(textOf(keyRow(a, "dev")).includes(said("screen.members.key.registered.by.rosa.3", { member: "dev", date: day("2026-10-04T00:00:00Z") })));
  // ana has none
  assert.ok(textOf(keyRow(a, "ana")).includes(said("screen.members.no.signing.key.yet")));
  // the notes
  for (const k of ["screen.members.a.signing.key.lets.a", "screen.members.civicsmith.holds.only.the.public", "screen.members.use.this.when.a.member", "screen.members.key.react.withdraw.a.key.when.a", "screen.members.key.react.a.key.a.member.withdrew"]) has(a, k);
});

test("R55 Withdraw is offered on another member's active key and never on the viewer's own (she revokes it on account); it sends signerset revoked for that key", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const withdraw = (id) => btn(keyRow(a, id), "signerset").filter((b) => b.attrs["data-status"] === "revoked");
  assert.equal(withdraw("rosa").length, 0, "not on her own key");
  for (const id of ["dev", "lu", "admin"]) assert.equal(withdraw(id).length, 1, id);
  assert.ok(textOf(withdraw("dev")[0]).startsWith(said("screen.members.signer.withdraw", { handle: "dev" })));
  const r = await a.press("signerset", { data: { key: SIGNER_KEYS.dev, status: "revoked" } });
  assert.deepEqual(r.sent.find((x) => x.op === "signerset").body, { keyB64: SIGNER_KEYS.dev, status: "revoked" });
  assert.ok(r.sent.some((x) => x.op === "signerlist"), "the list is read again (R8)");
});

test("R55 a withdrawn key reads who withdrew it and when, that it does not sign, and offers Reactivate: signerset active; never for a member who has left", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const row = keyRow(a, "dev");
  assert.ok(textOf(row).includes(said("screen.members.key.react.key.withdrawn.by.rosa.12", { member: "rosa", date: day("2026-10-12T00:00:00Z") })));
  assert.ok(textOf(row).includes(said("screen.members.key.react.it.does.not.sign")));
  const back = btn(row, "signerset").filter((b) => b.attrs["data-status"] === "active");
  assert.equal(back.length, 1);
  assert.ok(textOf(back[0]).startsWith(said("screen.members.key.react.reactivate.devs.signing.key", { member: "dev" })));
  // explained by its three sentences
  const tip = all(row, (e) => e.attrs["data-tip"] && e.attrs["data-tip"].includes(said("screen.members.key.react.help")))[0];
  assert.ok(tip && tip.attrs["data-tip"].includes(said("screen.members.key.react.help2")) && tip.attrs["data-tip"].includes(said("screen.members.key.react.help3")));
  const r = await a.press("signerset", { data: { key: SIGNER_KEYS.devOld, status: "active" } });
  assert.deepEqual(r.sent.find((x) => x.op === "signerset").body, { keyB64: SIGNER_KEYS.devOld, status: "active" });
  // control: a key whose member is no longer active offers no Reactivate (credentials R7 refuses it)
  const gone = SIGNERS.map((k) => (k.key_b64 === SIGNER_KEYS.devOld ? { ...k, member_status: "revoked", attests_why: "member_revoked" } : k));
  const g = await open("members", { me: ADMIN, table: membersTable({ signerlist: env({ signers: gone }) }) });
  assert.ok(textOf(keyRow(g, "dev")).includes(said("screen.members.key.react.it.does.not.sign")));
  assert.ok(!btn(keyRow(g, "dev"), "signerset").some((b) => b.attrs["data-status"] === "active"));
});

test("R55 a registered_by or status_by of `not recorded`, or a null status_at, is never drawn as a person or a day: the unrecorded lines", async () => {
  const rows = [
    { ...SIGNERS[3], registered_by: "not recorded" },
    { ...SIGNERS[4], status_by: "not recorded", status_at: null },
    { ...SIGNERS[2], key_b64: SIGNER_KEYS.lu, added: null },
  ];
  const a = await open("members", { me: ADMIN, table: membersTable({ signerlist: env({ signers: rows }) }) });
  assert.ok(textOf(keyRow(a, "dev")).includes(said("screen.members.key.registered.unrecorded")));
  assert.ok(textOf(keyRow(a, "dev")).includes(said("screen.members.key.withdrawn.unrecorded")));
  assert.ok(textOf(keyRow(a, "lu")).includes(said("screen.members.key.registered.unrecorded")), "no day drawn");
  assert.ok(!/not recorded|null|undefined/.test(textOf(keysSection(a)).replaceAll(said("screen.members.key.registered.unrecorded"), "").replaceAll(said("screen.members.key.withdrawn.unrecorded"), "")), "nothing else says so");
});

test("R55 Register a key for this member (signeradd): the pasted line is split into keyB64 and comment, with memberId; a line not of that shape, a private key or an empty line sends nothing", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const opts = all(all(a.tree, (e) => e.attrs.id === "ms-who")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]);
  assert.deepEqual(opts, [["rosa", "rosa"], ["dev", "dev"], ["ana", "ana"], ["lu", "lu"]], "the active members who have a handle; the founder, holding none in this roster, is not among them (R64)");
  has(a, "screen.members.keys.whose"); has(a, "screen.members.keys.public"); has(a, "screen.members.keys.public.help");
  has(a, "screen.members.the.one.line.the.member"); has(a, "screen.members.the.record.shows.that.you"); has(a, "screen.members.they.see.it.under.your");
  const line = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAnaKey0000000000000000000000000000000000 ana@laptop";
  const r = await a.press("signeradd", { choose: { "ms-who": "ana" }, values: { "ms-line": line } });
  assert.deepEqual(r.sent[0].body, { memberId: "ana", keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAIAnaKey0000000000000000000000000000000000", comment: "ana@laptop" });
  assert.ok(r.sent.some((x) => x.op === "signerlist"), "the section reads the list again");
  const bare = await a.press("signeradd", { choose: { "ms-who": "dev" }, values: { "ms-line": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDevKey00000000000000000000000000000000000" } });
  assert.deepEqual(bare.sent[0].body, { memberId: "dev", keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAIDevKey00000000000000000000000000000000000" }, "no comment is sent when there is none");
  for (const bad of ["", "AAAAC3NzaC1lZDI1NTE5", "-----BEGIN OPENSSH PRIVATE KEY----- b3BlbnNzaC1rZXktdjE=", "ssh-ed25519 not-base64!", "ssh-ed25519"]) {
    const x = await a.press("signeradd", { choose: { "ms-who": "ana" }, values: { "ms-line": bad } });
    assert.deepEqual(x.sent, [], `nothing is sent for ${JSON.stringify(bad.slice(0, 20))}`);
    assert.equal(a.refused.key, "refusal.BAD_KEY");
  }
});

test("R55 control: a member who does not administer is drawn none of it and reads no signerlist; a failed read is drawn failed, never as no keys", async () => {
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.equal(keysSection(m), undefined);
  assert.ok(!btn(m.tree, "signeradd").length && !btn(m.tree, "signerset").length);
  const failed = await open("members", { me: ADMIN, table: membersTable({ signerlist: "none" }) });
  assert.ok(all(keysSection(failed), (e) => e.attrs["data-state"] === "failed").length === 1);
  assert.ok(!textOf(keysSection(failed)).includes(said("screen.members.no.signing.key.yet")));
});

/* R56 (T51; K3807; DEC-330 A72, B5; DEC-332 (3); DEC-335): what removing an administrator takes; a removal under way is not drawn (N1248, T52's) */
const arithSection = (o) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2").some((h) => textOf(h) === said("screen.members.what.removing.an.administrator.takes")))[0];

test("R56 with adminarith answering the live row for 4 administrators the sentence carries 3 and 4; at 3 and above it says how many votes it takes", async () => {
  const members = [FOUNDER_ROW, ...ROSTER, { member_id: "ana2", handle: "ana2", role: "admin", status: "active", capabilities: [], cover: "A2", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(4), memberlist: env({ members }) }) });
  const sec = arithSection(a);
  assert.ok(sec, "drawn to an administrator");
  assert.ok(textOf(sec).includes(said("screen.members.this.takes.3.of.4", { n: 3, total: 4 })));
  assert.ok(textOf(sec).includes(said("screen.members.nothing.here.changes.anything.explain")));
  assert.ok(all(a.tree, (e) => e.tag === "h2" && textOf(e) === said("screen.members.what.removing.an.administrator.takes") && /own rule for removing an administrator/.test(e.attrs["data-tip"])).length, "the heading is explained");
  // the fold of how it changes, with its notes
  const fold = all(sec, (e) => e.tag === "details" && textOf(e).includes(said("screen.members.how.it.changes.with.the")))[0];
  assert.ok(fold);
  for (const k of ["screen.members.removal.takes.a.majority.of", "screen.members.the.one.facing.removal.is", "screen.members.a.lone.administrator.can.never"]) assert.ok(textOf(fold).includes(said(k)), k);
  // the roster lists every counted administrator (the founder's row included): no reconcile fold
  assert.ok(!all(sec, (e) => e.tag === "details" && textOf(e).includes(said("screen.members.founder.if.the.count.is.higher"))).length);
});

test("R56 control: one administrator reads that none can be removed by vote; a roster that lists every counted administrator draws no reconcile fold; more counted than listed draws it with the difference", async () => {
  const one = [{ ...FOUNDER_ROW }];
  const a = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(1), memberlist: env({ members: one }) }) });
  const sec = arithSection(a);
  assert.ok(textOf(sec).includes(said("screen.members.with.1.administrator.no.administrator", { n: 1 })));
  assert.ok(textOf(sec).includes(said("screen.members.a.majority.that.leaves.out")) && textOf(sec).includes(said("screen.members.that.is.the.rule.holding")));
  assert.ok(!textOf(sec).includes(said("screen.members.this.takes.3.of.4", { n: 1, total: 1 })));
  // two counted, one listed: the founder is counted and the roster has no entry for her (membership R147 not claimed)
  const two = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(2), memberlist: env({ members: [ROSTER[0]] }) }) });
  const fold = all(arithSection(two), (e) => e.tag === "details" && textOf(e).includes(said("screen.members.founder.if.the.count.is.higher")))[0];
  assert.ok(fold, "more counted than listed");
  assert.ok(textOf(fold).includes(said("screen.members.founder.the.count.includes.1.administrator", { n: 1 })));
  assert.ok(!textOf(arithSection(two)).includes(said("screen.members.with.1.administrator.no.administrator", { n: 2 })), "no singular sentence for 2");
  const three = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(5), memberlist: env({ members: [ROSTER[0]] }) }) });
  assert.ok(textOf(arithSection(three)).includes(said("screen.members.founder.the.count.includes.n.administrators", { n: 4 })));
  // a member who does not administer is drawn none (R47's table), and reads no arithmetic
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.equal(arithSection(m), undefined);
  assert.ok(!m.p.requests.some((r) => r.op === "adminarith"));
  // no block of a removal under way is drawn, whatever the roster holds
  assert.equal(all(a.tree, (e) => e.attrs["data-removal"] !== undefined).length, 0, "no removal under way");
  // a failed read is drawn failed
  const f = await open("members", { me: ADMIN, table: membersTable({ adminarith: "none" }) });
  assert.ok(all(arithSection(f), (e) => e.attrs["data-state"] === "failed").length === 1);
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
  const expertise = (key) => cells(key)[5];   // handle, cover, role, may do, status, expertise (then the projects, R47)
  assert.equal(expertise("dev"), "", "dev declared nothing: the cell is empty");
  assert.ok(expertise("ana").includes("CPA"), "ana declared CPA");
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

test("R56 the scale table: a row for each count of administrators from adminarith's table, the live row marked (now) and aria-current; one administrator reads not removable", async () => {
  const members = [FOUNDER_ROW, ...ROSTER, { member_id: "ana2", handle: "ana2", role: "admin", status: "active", capabilities: [], cover: "A2", expertise: [], invitation: "spent" }];
  const a = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(4), memberlist: env({ members }) }) });
  const table = all(a.tree, (e) => e.tag === "table" && e.attrs["data-list"] === "scale")[0];
  assert.ok(table);
  assert.deepEqual(all(table, (e) => e.tag === "th").map((h) => textOf(h)), ["screen.members.scale.head.admins", "screen.members.scale.head.takes", "screen.members.scale.head.who"].map((k) => said(k)));
  const rows = all(table, (e) => e.tag === "tr").slice(1);
  assert.equal(rows.length, 9);
  const cells = (r) => all(r, (e) => e.tag === "td").map((c) => textOf(c).replace(/\s+/g, " ").trim());
  assert.deepEqual(cells(rows[3]), ["4 " + said("screen.members.scale.now"), said("screen.members.scale.takes", { k: 3, n: 4 }), said("screen.members.scale.who", { v: 3, n: 4 })]);
  assert.deepEqual(rows.filter((r) => r.attrs["aria-current"] === "true"), [rows[3]], "only the live row is current");
  assert.equal(cells(rows[0])[1], said("screen.members.scale.not_removable"));
  assert.equal(cells(rows[1])[2], said("screen.members.scale.no_majority"));
});

test("R56 a removal under way is drawn from adminremovalsopen alone: who it waits for, how many of those who may vote have agreed, the one facing removal counted and not voting; none under way draws no block; a failed read is drawn failed", async () => {
  const under = env({ ok: true, removals: [{ target: "lu", voters: [{ voter: "admin", at: "2026-10-14T00:00:00Z" }], awaiting: ["rosa"], have: 1, need: 2 }] });
  const a = await open("members", { me: ADMIN, table: membersTable({ adminremovalsopen: under }) });
  const block = all(a.tree, (e) => e.attrs["data-removal"] === "lu")[0];
  assert.ok(block, "drawn from the answer");
  const t = textOf(block).replace(/\s+/g, " ");
  assert.ok(t.includes(said("screen.members.2.of.3.have.agreed", { n: 1, total: 2 })));
  assert.ok(t.includes(said("screen.members.teo.is.counted.but.doesn", { member: "lu", n: 2 })));
  assert.ok(t.includes(said("screen.members.the.removal.waits.for.ana", { member: "rosa" })));
  assert.ok(t.includes(said("screen.members.removal.heading")));
  assert.ok(t.includes(said("screen.members.removal.agreed", { member: said("member.founder.unnamed") })) && t.includes(day("2026-10-14T00:00:00Z")), "who agreed, the day beside");
  assert.ok(t.includes(said("screen.members.removal.notyet", { member: "rosa" })));
  assert.ok(t.includes(said("screen.members.removal.faces", { member: "lu" })));
  assert.ok(t.includes(said("screen.members.removing.teo.as.an.administrator", { member: "lu" })));
  assert.ok(t.includes(said("screen.members.four.administrators.rosa.dev.ana", { n: 3, members: "the founder, rosa, and lu" }).replace("the founder", said("member.founder.unnamed"))));
  assert.ok(t.includes(said("screen.members.counted.in.the.4.doesn", { n: 3 })));
  // "Agree" is on the viewer's own row only: rosa has not voted, so she is offered it; the founder, who has, is not
  assert.equal(btn(block, "adminremove").length, 1);
  assert.deepEqual((await a.press("adminremove", { data: { member: "lu" }, values: { "rm-lu": " we agree " } })).sent[0].body, { memberId: "lu", reason: "we agree" });
  const other = await open("members", { me: { ...ADMIN, member: "lu2", handle: "lu2" }, table: membersTable({ adminremovalsopen: under }) });
  assert.equal(btn(all(other.tree, (e) => e.attrs["data-removal"] === "lu")[0], "adminremove").length, 0, "not drawn on another's row");
  // control: none under way, whatever the roster holds, draws nothing
  const none = await open("members", { me: ADMIN, table: membersTable() });
  assert.equal(all(none.tree, (e) => e.attrs["data-removal"] !== undefined).length, 0);
  // a failed read is drawn failed in the section, never as none under way
  const f = await open("members", { me: ADMIN, table: membersTable({ adminremovalsopen: "none" }) });
  assert.equal(all(arithSection(f), (e) => e.attrs["data-state"] === "failed").length, 1);
  // a member who does not administer reads none of it
  const m = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!m.p.requests.some((r) => r.op === "adminremovalsopen"));
});

/* ---- T51 FR-25: C79 and DEC-386 (R63), C80 (R64), L30 (R71), T-05 (R72) ---- */

const CPA_CONFIRMED = { label: "CPA", state: "confirmed", confirmed: true, by: "rosa", at: "2026-10-05T10:00:00Z", history: [] };
const withExpertise = (member, expertise) => ROSTER.map((m) => (m.member_id === member ? { ...m, expertise } : m));

test("R63 a confirmed expertise offers Withdraw an expertise, its own act: expertisewithdraw sends memberId, label and the reason; an unconfirmed one still offers Confirm and no withdrawal (control)", async () => {
  const table = membersTable({
    memberlist: env({ members: [FOUNDER_ROW, ...withExpertise("ana", [CPA_CONFIRMED, { label: "Zoning", state: "declared", confirmed: false, by: null, at: "2026-10-06T10:00:00Z", history: [] }])] }),
    expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: [CPA_CONFIRMED, { label: "Zoning", state: "declared", confirmed: false, by: null, at: "2026-10-06T10:00:00Z", history: [] }], gates: "nothing" }),
    expertisewithdraw: (q, b) => env({ ok: true, memberId: b.memberId, label: b.label, state: "withdrawn", confirmed: false, by: "rosa", reason: b.reason }),
  });
  const a = await open("members", { me: ADMIN, table, subject: "ana" });
  const panel = panelOf(a.tree, "ana");
  const withdraw = btn(panel, "expertisewithdraw");
  assert.equal(withdraw.length, 1, "one withdrawal, for the confirmed label");
  assert.equal(withdraw[0].attrs["data-label"], "CPA");
  assert.ok(textOf(withdraw[0]).includes(said("act.owed_expertisewithdraw.label.members")));
  assert.deepEqual(btn(panel, "expertiseconfirm").map((b) => b.attrs["data-label"]), ["Zoning"], "control: the declared one is confirmed, not withdrawn");
  const r = await a.press("expertisewithdraw", { data: { member: "ana", label: "CPA" }, reason: "She no longer practises." });
  assert.equal(r.asked, true, "an administrator's act asks its reason (interface-shell R107)");
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["expertisewithdraw", { memberId: "ana", label: "CPA", reason: "She no longer practises." }]);
  assert.ok(r.sent.some((x) => x.op === "memberlist") && r.sent.some((x) => x.op === "expertiselist"), "the roster and the expertise are read again");
  // nothing is sent until a reason is given
  const none = await a.press("expertisewithdraw", { data: { member: "ana", label: "CPA" }, reason: null });
  assert.deepEqual(none.sent, []);
  // confirming still sends expertiseconfirm
  const c = await a.press("expertiseconfirm", { data: { member: "ana", label: "Zoning" } });
  assert.deepEqual([c.sent[0].op, c.sent[0].body], ["expertiseconfirm", { memberId: "ana", label: "Zoning" }]);
});

test("R63 control: no withdrawal for an expertise already withdrawn, nor to a member who does not administer", async () => {
  const gone = { ...CPA_CONFIRMED, state: "withdrawn", confirmed: false };
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [FOUNDER_ROW, ...withExpertise("ana", [gone])] }), expertiselist: (q) => env({ ok: true, memberId: q.memberId, expertise: [gone], gates: "nothing" }) }), subject: "ana" });
  assert.deepEqual(btn(a.tree, "expertisewithdraw"), []);
  const m = await open("members", { me: MEMBER, table: membersTableMember({ memberlist: env({ members: [FOUNDER_ROW, ...withExpertise("ana", [CPA_CONFIRMED]).map(({ cover, invitation, ...r }) => r)] }) }) });
  assert.deepEqual(acts(m.tree), []);
});

test("R64 the signing-key chooser lists the founder, first, once the instance is claimed and she holds a handle; a roster without her row, or her with none, is unchanged (control)", async () => {
  const named = { ...FOUNDER_ROW, handle: "sparky" };
  const a = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: [named, ...ROSTER] }) }) });
  const opts = all(all(a.tree, (e) => e.attrs.id === "ms-who")[0], (e) => e.tag === "option").map((o) => [o.attrs.value, textOf(o)]);
  assert.deepEqual(opts, [["admin", "sparky"], ["rosa", "rosa"], ["dev", "dev"], ["ana", "ana"], ["lu", "lu"]]);
  // a key registered for her is registered for the id the roster holds her under
  const key = "AAAAC3NzaC1lZDI1NTE5AAAAIFounderKey000000000000000000000000000001";
  const r = await a.press("signeradd", { choose: { "ms-who": "admin" }, values: { "ms-line": "ssh-ed25519 " + key } });
  assert.deepEqual(r.sent[0].body, { memberId: "admin", keyB64: key });
  // control: before the claim the roster holds no row for her; claimed with no handle held she is not offered
  const unclaimed = await open("members", { me: ADMIN, table: membersTable({ memberlist: env({ members: ROSTER }) }) });
  assert.deepEqual(all(all(unclaimed.tree, (e) => e.attrs.id === "ms-who")[0], (e) => e.tag === "option").map((o) => o.attrs.value), ["rosa", "dev", "ana", "lu"]);
  const nameless = await open("members", { me: ADMIN, table: membersTable() });
  assert.ok(!all(all(nameless.tree, (e) => e.attrs.id === "ms-who")[0], (e) => e.tag === "option").some((o) => o.attrs.value === "admin"));
});

test("R71 a member's name is a reference to their handle, not to the id they were invited under; opening that address opens that member's row", async () => {
  const joined = { member_id: "journeys-newcomer", handle: "jrn-newcomer", role: "member", status: "active", capabilities: ["contribute"], cover: "Journeys newcomer", expertise: [CPA_CONFIRMED], invitation: "spent" };
  const table = membersTable({ memberlist: env({ members: [FOUNDER_ROW, ...ROSTER, joined] }), expertiselist: (q) => (q.memberId === "journeys-newcomer" ? env({ ok: true, memberId: q.memberId, expertise: [CPA_CONFIRMED], gates: "nothing" }) : refuse("NO_SUCH_MEMBER")) });
  const a = await open("members", { me: ADMIN, table, subject: "jrn-newcomer" });
  const row = rowOf(a.tree, "journeys-newcomer", "jrn-newcomer");
  const refs = all(row, (e) => e.tag === "a" && /^\/app\/members\//.test(e.attrs.href || ""));
  assert.deepEqual(refs.map((e) => e.attrs.href), ["/app/members/jrn-newcomer"], "the address carries the handle");
  assert.ok(!all(a.tree, (e) => e.tag === "a" && e.attrs.href === "/app/members/journeys-newcomer").length, "never the id");
  // the row for that address is open, with its own expertise and acts
  assert.ok(btn(panelOf(a.tree, "journeys-newcomer"), "expertisewithdraw").length, "its panel is open");
  // control: an address that is the id still opens the row (a link kept from before)
  const old = await open("members", { me: ADMIN, table, subject: "journeys-newcomer" });
  assert.ok(btn(panelOf(old.tree, "journeys-newcomer"), "expertisewithdraw").length);
  // control: a member whose handle equals their id is unchanged
  assert.ok(all(rowOf(a.tree, "ana", "ana"), (e) => e.tag === "a" && e.attrs.href === "/app/members/ana").length);
});

test("R72 choosing the grant that includes administering draws the confirmation and sends nothing; Go back sends nothing and unticks it; Make them an administrator sends the declared fields; a grant without administering sends at once (control)", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const fill = { "mi-id": "lee", "mi-cover": "Lee from 62nd" };
  const caps = (vocab) => [...vocab, "administer"];
  const idx = caps(ADMIN.vocabulary).indexOf("administer");
  // nothing drawn before the choice; the invitation button is there
  lacks(a, "screen.members.cap.administer.confirm.head", { who: "Lee from 62nd" });
  // type who, then choose the grant
  for (const [id, v] of Object.entries(fill)) { const el = a.b.doc.getElementById(id); el.value = v; }
  const before = a.p.requests.length;
  await a.tick("mi-caps-" + idx, true);
  has(a, "screen.members.cap.administer.confirm.head", { who: "Lee from 62nd" });
  has(a, "screen.members.cap.administer.confirm", { who: "Lee from 62nd" });
  has(a, "screen.members.cap.administer.confirm.yes", { who: "Lee from 62nd" });
  has(a, "screen.members.cap.administer.confirm.no");
  assert.equal(a.p.requests.length, before, "choosing sends nothing");
  assert.deepEqual(btn(a.tree, "memberadd"), [], "the invitation waits for the answer");
  // Go back: nothing sent, the grant is unticked and the invitation button is back
  await a.tick("mi-ok-1", true);
  assert.equal(a.p.requests.length, before, "Go back sends nothing");
  lacks(a, "screen.members.cap.administer.confirm.head", { who: "Lee from 62nd" });
  assert.equal(a.b.doc.getElementById("mi-caps-" + idx).checked, false);
  assert.equal(btn(a.tree, "memberadd").length, 1);
  // choose it again and confirm: the declared fields are sent
  await a.tick("mi-caps-" + idx, true);
  await a.tick("mi-ok-0", true);
  const r = await a.press("memberadd", {});
  assert.deepEqual(r.sent[0].body, { memberId: "lee", cover: "Lee from 62nd", capabilities: ["contribute"], role: "admin" });
  // control: without administering the invitation is sent at once
  const b2 = await open("members", { me: ADMIN, table: membersTable() });
  const plain = await b2.press("memberadd", { values: { "mi-id": "kay", "mi-cover": "Kay", "mi-caps-0": true } });
  assert.deepEqual(plain.sent[0].body, { memberId: "kay", cover: "Kay", capabilities: ["contribute"] });
  assert.equal(plain.sent[0].body.role, undefined);
  // pressing the invitation with the grant ticked and no answer given sends nothing and draws the confirmation
  const c = await open("members", { me: ADMIN, table: membersTable() });
  const stuck = await c.press("memberadd", { values: { "mi-id": "lee", "mi-cover": "Lee", ["mi-caps-" + idx]: true } });
  assert.deepEqual(stuck.sent, []);
  has(c, "screen.members.cap.administer.confirm.head", { who: "Lee" });
});

/* ---- T51 fix round 2: C89, C90, C94 ---- */

test("R2 C89: inviting a third administrator is a proposal the plane records: it is drawn as done (not as a refusal) with who must still endorse, the roster is read again and shows the proposed member; control: another refusal is still a refusal, and an invitation that is not for an administrator is unchanged", async () => {
  let listed = 0;
  const proposed = { member_id: "lee", handle: null, role: "admin", status: "proposed", capabilities: ["contribute"], cover: "Lee from 62nd", expertise: [], invitation: null };
  const table = membersTable({
    memberlist: () => env({ members: [FOUNDER_ROW, ...ROSTER, ...(++listed > 1 ? [proposed] : [])] }),
    memberadd: (q, b) => refuse("CONSENSUS_REQUIRED", { memberId: b.memberId, proposed: true, have: ["rosa"], awaiting: ["admin", "lu"] }),
  });
  const a = await open("members", { me: ADMIN, table });
  const idx = [...ADMIN.vocabulary, "administer"].indexOf("administer");
  for (const [id, v] of Object.entries({ "mi-id": "lee", "mi-cover": "Lee from 62nd" })) a.b.doc.getElementById(id).value = v;
  await a.tick("mi-caps-" + idx, true);
  await a.tick("mi-ok-0", true);
  const before = a.p.requests.filter((r) => r.op === "memberlist").length;
  const r = await a.press("memberadd", {});
  assert.equal(a.p.requests.filter((x) => x.op === "memberadd").length, 1, "one request for the proposal");
  assert.deepEqual(r.sent.find((x) => x.op === "memberadd").body, { memberId: "lee", cover: "Lee from 62nd", capabilities: ["contribute"], role: "admin" });
  const done1 = all(a.tree, (e) => e.attrs["data-state"] === "done" && e.attrs.role === "status")[0];
  assert.ok(done1, "drawn as done, in the shell's done style");
  assert.ok(!all(a.tree, (e) => e.attrs.role === "alert").length, "not drawn as a refusal");
  assert.equal(squash(textOf(done1)), said("refusal.CONSENSUS_REQUIRED", { awaiting: said("member.founder.unnamed") + ", lu" }), "who must still endorse, by handle");
  assert.ok(!all(a.tree, (e) => e.attrs["data-shown"] === "proposed").length, "the screen draws no sentence of its own for it");
  assert.ok(a.p.requests.filter((x) => x.op === "memberlist").length > before, "the roster is read again");
  assert.ok(a.text.includes("Lee from 62nd") || rowOf(a.tree, "lee"), "the proposed member is in the roster");
  // control: any other refusal is drawn as one
  const b = await open("members", { me: ADMIN, table: membersTable({ memberadd: { ok: false, status: 403, code: "NOT_AN_ADMIN" } }) });
  for (const [id, v] of Object.entries({ "mi-id": "lee", "mi-cover": "Lee" })) b.b.doc.getElementById(id).value = v;
  await b.tick("mi-caps-" + idx, true);
  await b.tick("mi-ok-0", true);
  await b.press("memberadd", {});
  assert.ok(b.refused && b.refused.key === "refusal.NOT_AN_ADMIN", JSON.stringify(b.refused));
  // control: not for an administrator, sent as before
  const c = await open("members", { me: ADMIN, table: membersTable() });
  const plain = await c.press("memberadd", { values: { "mi-id": "kay", "mi-cover": "Kay", "mi-caps-0": true } });
  assert.deepEqual(plain.sent[0].body, { memberId: "kay", cover: "Kay", capabilities: ["contribute"] });
});

test("R2 C89: endorsing a proposed administrator while others must still endorse is done, with who must still endorse by handle, and the roster is read again; control: a real refusal of the act is still a refusal", async () => {
  let listed = 0;
  const table = membersTable({
    memberlist: () => (++listed, env({ members: [FOUNDER_ROW, ...ROSTER] })),
    adminendorse: (q, b) => refuse("CONSENSUS_REQUIRED", { memberId: b.memberId, proposed: true, have: ["rosa"], awaiting: ["admin", "lu"] }),
  });
  const a = await open("members", { me: ADMIN, table });
  const before = a.p.requests.filter((r) => r.op === "memberlist").length;
  const r = await a.press("adminendorse", { data: { member: "kim" } });
  assert.deepEqual(r.sent.find((x) => x.op === "adminendorse").body, { memberId: "kim" });
  assert.ok(!all(a.tree, (e) => e.attrs.role === "alert").length, "not drawn as a refusal");
  const note = all(a.tree, (e) => e.attrs["data-state"] === "done" && e.attrs.role === "status")[0];
  assert.ok(note, "drawn as done");
  assert.equal(squash(textOf(note)), said("refusal.CONSENSUS_REQUIRED", { awaiting: said("member.founder.unnamed") + ", lu" }));
  assert.ok(a.p.requests.filter((x) => x.op === "memberlist").length > before, "the roster is read again");
  // control: any other refusal of the act is a refusal
  const b = await open("members", { me: ADMIN, table: membersTable({ adminendorse: { ok: false, status: 403, code: "NOT_AN_ADMIN" } }) });
  await b.press("adminendorse", { data: { member: "kim" } });
  assert.ok(b.refused && b.refused.key === "refusal.NOT_AN_ADMIN", JSON.stringify(b.refused));
  assert.ok(all(b.tree, (e) => e.attrs.role === "alert").length, "drawn as a refusal");
  assert.ok(!all(b.tree, (e) => e.attrs["data-state"] === "done" && e.attrs.role === "status").length, "no done sentence beside a refusal");
});

test("R56 C90: the vote to remove an administrator is not drawn where the plane cannot carry it (two administrators); with three, or with the count unread, it is (control)", async () => {
  const two = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(2) }) });
  assert.deepEqual(btn(panelOf(two.tree, "lu"), "adminremove"), [], "no removal vote at two administrators");
  has(two, "screen.members.a.majority.that.leaves.out");
  const three = await open("members", { me: ADMIN, table: membersTable({ adminarith: ARITH(3) }) });
  assert.equal(btn(panelOf(three.tree, "lu"), "adminremove").length, 1);
  const unread = await open("members", { me: ADMIN, table: membersTable({ adminarith: refuse("NOT_AN_ADMIN") }) });
  assert.equal(btn(panelOf(unread.tree, "lu"), "adminremove").length, 1, "an unread count hides nothing");
});

test("R55 R56 C94: a key's registrar and a removal's voters are named by memberName: a member the roster does not hold or who has no handle by the fallback word, never an id", async () => {
  const signers = [
    { key_b64: SIGNER_KEYS.dev, member_id: "dev", comment: "", status: "active", added: "2026-10-04T00:00:00Z", status_by: "ghost-7", status_at: "2026-10-04T00:00:00Z", origin: "admin", registered_by: "ghost-7", member_status: "active" },
    { key_b64: SIGNER_KEYS.lu, member_id: "lu", comment: "", status: "revoked", added: "2026-10-05T00:00:00Z", status_by: "mai-k", status_at: "2026-10-06T00:00:00Z", origin: "self", registered_by: "lu", member_status: "active" },
  ];
  const a = await open("members", { me: ADMIN, table: membersTable({ signerlist: env({ signers }) }) });
  const dev = textOf(all(a.tree, (e) => e.tag === "li" && e.attrs["data-member"] === "dev")[0]);
  assert.ok(dev.includes(said("screen.members.key.registered.by.rosa.3", { member: said("shell.card.member"), date: day("2026-10-04T00:00:00Z") })), dev);
  const lu = textOf(all(a.tree, (e) => e.tag === "li" && e.attrs["data-member"] === "lu")[0]);
  assert.ok(lu.includes(said("screen.members.key.react.key.withdrawn.by.rosa.12", { member: said("shell.card.member"), date: day("2026-10-06T00:00:00Z") })), lu);
  for (const id of ["ghost-7", "mai-k"]) assert.ok(!a.text.includes(id), id + " is not drawn");
  // a voter and the one awaited, by handle or the fallback word
  const under = env({ ok: true, removals: [{ target: "lu", voters: [{ voter: "ghost-7", at: "2026-10-14T00:00:00Z" }], awaiting: ["mai-k"], have: 1, need: 2 }] });
  const b = await open("members", { me: ADMIN, table: membersTable({ adminremovalsopen: under }) });
  const block = textOf(all(b.tree, (e) => e.attrs["data-removal"] === "lu")[0]).replace(/\s+/g, " ");
  assert.ok(block.includes(said("screen.members.removal.agreed", { member: said("shell.card.member") })));
  assert.ok(block.includes(said("screen.members.removal.notyet", { member: said("shell.card.member") })));
  for (const id of ["ghost-7", "mai-k"]) assert.ok(!block.includes(id), id + " is not drawn");
});
