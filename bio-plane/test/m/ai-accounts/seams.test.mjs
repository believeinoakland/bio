/* ai-accounts' own seams and invariants (R23, R24, R28, R29, R30, R32, R33, R39): the disclosure-first order, the seal as a
   service, the tables' declarations, its words, its factory and route map, its rows and the instance clock. Every arm drives
   the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { world, realWorld, SECRET, SEAL } from "./fixture.mjs";
import { PLANS as P } from "./catalogue.mjs";
import { ask, projectWorld } from "./helpers.mjs";
import { tableDeclarationRefusals } from "../record-core/fixtures.mjs";
import { aiAccountsOf, aiAccountsOps, AI_ACCOUNT_CHECKS, AI_ACCOUNTS_TABLES, AI_ACCOUNTS_MIXED_TABLES, AI_ACCOUNTS_PROJECT_TABLES,
  AI_ACCOUNTS_HISTORY_TABLE, AI_ACCOUNTS_LEGACY_TABLES } from "../../../src/ai-accounts/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const WORDS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const wordOf = (key) => WORDS.words.find((w) => w.key === key)?.en;
const DUE_KEYS = ["check", "code", "detail", "member", "ok", "reason", "translation"];
const SENTINEL = "sk-ant-api03-SENTINEL-reference-9f8e7d6c5b4a";

/* The seal as credentials held it before T48, computed here independently of the module: HKDF-SHA-256 from the seal secret,
   the owner as salt, `bio-credentials-seal/1` as info; AES-256-GCM with `owner|kind` as AAD. */
async function openIndependently(secret, owner, kind, sealed, iv) {
  const enc = new TextEncoder();
  const base = await webcrypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
  const key = await webcrypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: enc.encode(owner), info: enc.encode("bio-credentials-seal/1") },
    base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const pt = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(iv, "base64"), additionalData: enc.encode(`${owner}|${kind}`) }, key, Buffer.from(sealed, "base64"));
  return new TextDecoder().decode(pt);
}
async function sealIndependently(secret, owner, kind, text) {
  const enc = new TextEncoder();
  const base = await webcrypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
  const key = await webcrypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: enc.encode(owner), info: enc.encode("bio-credentials-seal/1") },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const ct = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(`${owner}|${kind}`) }, key, enc.encode(text));
  return { sealed: Buffer.from(new Uint8Array(ct)).toString("base64"), iv: Buffer.from(iv).toString("base64") };
}

/* ===== R23: the disclosure-first order ===== */

test("R23: registerDisclosureRead: one registration whoever makes it, malformed and second refused through membership R81; disclosureDue null for shown, DISCLOSURE_DUE (C-29.40) for anything else or a throw, nothing asked with none registered; writes nothing; reached by no route", async () => {
  const w = await world().group("ann");
  assert.equal(w.c.disclosureDue({ member: "ann" }), null, "with none registered: no order is held");
  for (const [module, fn] of [[null, () => ({ shown: true })], ["", () => ({ shown: true })], ["instance-setup", null], ["instance-setup", "disclosureOf"], [7, () => ({})]]) {
    const r = w.c.registerDisclosureRead(module, fn);
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "LISTENER_MALFORMED", MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation], String(module));
  }
  assert.equal(w.c.disclosureDue({ member: "ann" }), null, "a refused registration registers nothing");
  let answer = { ok: true, shown: false };
  const asked = [];
  const fn = (a) => { asked.push(a); if (answer instanceof Error) throw answer; return answer; };
  assert.deepEqual(w.c.registerDisclosureRead("instance-setup", fn), { ok: true, module: "instance-setup" });
  for (const who of ["instance-setup", "plane"]) {
    const second = w.c.registerDisclosureRead(who, () => ({ shown: true }));
    assert.deepEqual([second.ok, second.code, second.module, second.check], [false, "LISTENER_DECLARED", "instance-setup", MEMBERSHIP_CHECKS.LISTENER_DECLARED.check], who);
  }
  const before = w.snapshot();
  for (const a of [{ ok: true, shown: false }, { shown: "true" }, { shown: 1 }, {}, null, undefined, "shown", true, Promise.resolve({ shown: true }), new Error("store unreadable")]) {
    answer = a;
    const r = w.c.disclosureDue({ member: "ann" });
    assert.deepEqual(Object.keys(r).sort(), DUE_KEYS, String(a));
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.member], [false, "DISCLOSURE_DUE", "DISCLOSURE_DUE", "C-29.40", wordOf("refusal.DISCLOSURE_DUE"), "ann"], String(a));
  }
  answer = { ok: true, member: "ann", shown: true, shown_at: "2026-10-12T00:00:00Z" };
  assert.equal(w.c.disclosureDue({ member: "ann" }), null, "shown: the order is met");
  assert.deepEqual(asked.at(-1), { member: "ann" });
  assert.equal(w.snapshot(), before, "R23 writes nothing");
  assert.deepEqual(AI_ACCOUNT_CHECKS.DISCLOSURE_DUE, { check: "C-29.40", where: "src/ai-accounts/base.mjs disclosureDue > is-disclosure-shown", translation: wordOf("refusal.DISCLOSURE_DUE") });
  assert.ok(!Object.keys(w.ops()).some((r) => /disclosure/.test(r)), "in-plane: no route reaches the seam or the read");
});

test("R1 R23: accountSet for a member is refused DISCLOSURE_DUE while R23 answers the disclosure due, asked after every other refusal, writing nothing; held once shown; accountRemove never refused for it; the team's and a project's are asked none; through the route too", async () => {
  const w = await projectWorld();
  const shown = new Set();
  const asked = [];
  w.c.registerDisclosureRead("instance-setup", ({ member }) => { asked.push(member); return { ok: true, shown: shown.has(member) }; });
  const set = (o) => w.c.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, means: "sealed", secret: SENTINEL, by: "ann", ...o });
  const before = w.snapshot();
  for (const [o, code] of [[{ by: "class:member" }, "MACHINE_CANNOT_HOLD_ACCOUNT"], [{ by: "bob" }, "NOT_YOUR_ACCOUNT"], [{ plan: "none" }, "UNKNOWN_PLAN"], [{ secret: " " }, "NO_SECRET"]])
    assert.equal((await set(o)).code, code, code);
  const due = await set({});
  assert.deepEqual([due.ok, due.code, due.check, due.translation], [false, "DISCLOSURE_DUE", "C-29.40", wordOf("refusal.DISCLOSURE_DUE")]);
  assert.equal(asked.at(-1), "ann", "asked for the acting member, the door's stamp");
  assert.equal((await w.ops("by=ann", { provider: P.provider, plan: P.memberApi, means: "sealed", secret: SENTINEL }).aiownadd()).code, "DISCLOSURE_DUE");
  assert.equal(w.snapshot(), before, "no refusal writes, and the key is held nowhere");
  assert.equal((await w.team()).ok, true, "the team's: no disclosure asked");
  assert.equal((await w.projectAccount("P", "ann")).ok, true);
  shown.add("ann");
  const ok = await set({});
  assert.equal(ok.ok, true);
  shown.delete("ann");
  assert.equal(w.c.accountRemove({ account_id: ok.account_id, by: "ann" }).removed, true, "removal is never refused for it");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal((await w.c.accountSet({ owner: "member:bob", provider: P.provider, plan: P.memberApi, secret: "x", by: "bob" })).code, "ACCOUNT_MEMBER_NOT_ACTIVE");
  const v = await world().group("ann");
  assert.equal((await v.c.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, secret: "x", by: "ann" })).ok, true, "control: with none registered, no order is held");
});

/* ===== R24: the seal ===== */

test("R24: sealText seals a sentinel that unsealText opens for the same owner and kind; the sealed text holds no trace of it", async () => {
  const w = world();
  const s = await w.a.sealText({ owner: "group:courtlistener", kind: "key", text: SENTINEL });
  assert.equal(s.ok, true);
  assert.ok(!JSON.stringify(s).includes(SENTINEL) && !JSON.stringify(s).includes(Buffer.from(SENTINEL).toString("base64")));
  assert.deepEqual(await w.a.unsealText({ owner: "group:courtlistener", kind: "key", sealed: s.sealed, iv: s.iv }), { ok: true, text: SENTINEL });
});

test("R24: the seal is byte-identical to credentials' before T48: an independent HKDF/AES-GCM under `bio-credentials-seal/1` opens what the module seals, and the module opens what it seals; an account's secret opens under the same rule (owner, its kind)", async () => {
  const w = await projectWorld();
  const s = await w.a.sealText({ owner: "group:courtlistener", kind: "fields", text: SENTINEL });
  assert.equal(await openIndependently(SEAL, "group:courtlistener", "fields", s.sealed, s.iv), SENTINEL);
  const theirs = await sealIndependently(SEAL, "group:courtlistener", "key", SENTINEL);
  assert.deepEqual(await w.a.unsealText({ owner: "group:courtlistener", kind: "key", ...theirs }), { ok: true, text: SENTINEL });
  const x = await w.own("ann", { secret: SENTINEL });
  const r = w.row(`SELECT sealed, iv FROM ai_accounts WHERE account_id=?`, x.account_id);
  assert.equal(await openIndependently(SEAL, "member:ann", "apikey", r.sealed, r.iv), SENTINEL);
  const t = await w.team({ secret: SENTINEL });
  const rt = w.row(`SELECT sealed, iv FROM ai_accounts WHERE account_id=?`, t.account_id);
  assert.equal(await openIndependently(SEAL, "group", "apikey", rt.sealed, rt.iv), SENTINEL);
});

test("R24: the wrong owner, the wrong kind or a changed seal secret does not open it: ACCOUNT_SEAL_UNAVAILABLE with its row (control: the right owner opens)", async () => {
  const w = world();
  const s = await w.a.sealText({ owner: "group:courtlistener", kind: "key", text: SENTINEL });
  const row = AI_ACCOUNT_CHECKS.ACCOUNT_SEAL_UNAVAILABLE;
  for (const [owner, kind] of [["group:other", "key"], ["group:courtlistener", "fields"], ["member:ann", "key"]]) {
    const u = await w.a.unsealText({ owner, kind, sealed: s.sealed, iv: s.iv });
    assert.deepEqual([u.ok, u.code, u.check, u.translation], [false, "ACCOUNT_SEAL_UNAVAILABLE", row.check, row.translation]);
    assert.ok(!JSON.stringify(u).includes(SENTINEL));
  }
  const other = world({ sealSecret: "another-seal-secret-000000" });
  assert.equal((await other.a.unsealText({ owner: "group:courtlistener", kind: "key", sealed: s.sealed, iv: s.iv })).code, "ACCOUNT_SEAL_UNAVAILABLE");
  assert.equal((await w.a.unsealText({ owner: "group:courtlistener", kind: "key", sealed: null, iv: null })).code, "ACCOUNT_SEAL_UNAVAILABLE");
  assert.equal((await w.a.unsealText({ owner: "group:courtlistener", kind: "key", sealed: s.sealed, iv: s.iv })).text, SENTINEL);
});

test("R24: with no seal secret bound, sealText and unsealText each answer ACCOUNT_SEAL_UNAVAILABLE and never throw", async () => {
  const w = world({ sealSecret: null });
  const s = await w.a.sealText({ owner: "group:courtlistener", kind: "key", text: SENTINEL });
  assert.deepEqual([s.code, s.check], ["ACCOUNT_SEAL_UNAVAILABLE", "C-29.22"]);
  const u = await w.a.unsealText({ owner: "group:courtlistener", kind: "key", sealed: "AAAA", iv: "AAAA" });
  assert.equal(u.translation, AI_ACCOUNT_CHECKS.ACCOUNT_SEAL_UNAVAILABLE.translation);
});

/* ===== R28, R29: the tables ===== */

test("R28 R29: every table is declared once by ai-accounts through declareTable, with its classes, none exported but the material limits (administrators only): the accounts, lists, offered sets and check ticks hold every owner's rows and a project's are deleted with it (purge clear keyed by project_id), the rest exempt; any refusal of a declaration is thrown", async () => {
  const w = world();
  const names = [...AI_ACCOUNTS_TABLES, ...AI_ACCOUNTS_MIXED_TABLES, ...AI_ACCOUNTS_PROJECT_TABLES, AI_ACCOUNTS_HISTORY_TABLE].map((t) => t.name);
  assert.equal(new Set(names).size, names.length);
  for (const n of ["ai_accounts", "ai_account_lists", "ai_offered", "ai_check_ticks", "ai_free_tier", "ai_personal_choices", "ai_recipients_seen",
                   "ai_keep_away", "project_keep_away", "account_changes"])
    assert.ok(names.includes(n), n);
  for (const n of names) {
    const d = w.core.declared.get(n);
    assert.equal(d.module, "ai-accounts", n);
    assert.equal(d.classes.expunge, "none", n);
    assert.equal(d.classes.export, n === "ai_keep_away" || n === "project_keep_away" ? "admin-only" : "never", n);
  }
  for (const n of ["ai_accounts", "ai_account_lists", "ai_offered", "ai_check_ticks", "account_changes"]) {
    const c = w.core.declared.get(n).classes;
    assert.deepEqual([c.purge, c.keys, c.whole], ["clear", ["project_id"], "project_id IS NOT NULL"], n);
  }
  for (const n of ["ai_keep_away", "ai_free_tier", "ai_personal_choices", "ai_recipients_seen"]) assert.equal(w.core.declared.get(n).classes.purge, "exempt", n);
  assert.equal(w.core.declared.get("project_keep_away").classes.purge, "clear");
  /* a refusal is a fault: thrown, never silently left purgeable or exportable */
  const sqlStub = { exec() { return []; } };
  const membership = { onRevoked() { return { ok: true }; } };
  const refused = tableDeclarationRefusals("ai_accounts", { by: "membership" });
  const held = { declareTable() { return refused.declaredAgainByTable; } };
  assert.throws(() => aiAccountsOf({ storage: { sql: sqlStub } }, { record: held, membership }).declareTables(), /refused its table declaration: TABLE_DECLARED \(ai_accounts\)/);
  const bad = { declareTable() { return refused.unknownClass; } };
  assert.throws(() => aiAccountsOf({ storage: { sql: sqlStub } }, { record: bad, membership }).declareTables(), /TABLE_CLASS_UNKNOWN/);
  /* the old tables are not declared, and not created at a boot that finds none */
  for (const t of AI_ACCOUNTS_LEGACY_TABLES) {
    assert.equal(w.core.declared.has(t), false, t);
    assert.equal(w.rows(`SELECT name FROM sqlite_master WHERE name=?`, t).length, 0, `${t} is not created`);
  }
  /* a purge of a project through the real record-core removes its accounts, list rows and history, and no other's */
  const r = realWorld();
  r.fact.claimed = true;
  for (const [id, role] of [["second", "admin"], ["ann", "member"], ["cy", "member"]]) {
    const a = await r.m.memberAdd({ memberId: id, cover: "c", role, by: "admin" });
    await r.m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  }
  for (const [p, owner] of [["PROJ-P", "ann"], ["PROJ-S", "cy"]]) {
    r.db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha) VALUES (?, 'project', 'g', ?, 'draft', 't', 't', 'x')`).run(p, p);
    r.m.projectCreated({ projectId: p, ownerId: owner, by: owner });
    assert.equal((await r.a.accountSet({ owner: `project:${p}`, provider: P.provider, plan: P.teamApi, means: "sealed", secret: "sk-" + p, by: owner })).ok, true, p);
  }
  assert.equal((await r.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, secret: "sk-ann", by: "ann" })).ok, true);
  const count = (p) => ["ai_accounts", "ai_account_lists", "account_changes"].map((t) => r.row(`SELECT COUNT(*) AS n FROM ${t} WHERE project_id=?`, p).n);
  assert.deepEqual([count("PROJ-P"), count("PROJ-S")], [[1, 1, 1], [1, 1, 1]]);
  assert.equal(r.rc.purge({ bundleId: "PROJ-P" }).ok, true);
  assert.deepEqual([count("PROJ-P"), count("PROJ-S")], [[0, 0, 0], [1, 1, 1]]);
  assert.equal(r.row(`SELECT COUNT(*) AS n FROM ai_accounts WHERE owner='member:ann'`).n, 1, "a member's own account is exempt from a project's purge");
});

/* ===== R30, R33: words and rows ===== */

test("R30 R33: every row keeps its number, code and words: each row is frozen, carries a check id of C-29, a `where` naming this module and a translation that is a sentence read by key; none says `group` where the team is meant; new rows C-29.48 to .82 are each distinct and numbered from the next free", () => {
  const rows = Object.entries(AI_ACCOUNT_CHECKS);
  assert.ok(Object.isFrozen(AI_ACCOUNT_CHECKS));
  const ids = rows.map(([, r]) => r.check);
  assert.equal(new Set(ids).size, ids.length, "one id per row");
  for (const [code, r] of rows) {
    assert.ok(Object.isFrozen(r), code);
    assert.match(r.check, /^C-29\.\d+$/, code);
    assert.match(r.where, /^src\/ai-accounts\/\w+\.mjs \S+ > is-[a-z-]+$/, code);
    assert.match(r.translation, /\S{3}/, code);
    assert.doesNotMatch(r.translation, /\bgroup\b/i, code);
  }
  const fresh = rows.filter(([, r]) => Number(r.check.split(".")[1]) >= 48).map(([c, r]) => [Number(r.check.split(".")[1]), c]).sort((a, b) => a[0] - b[0]);
  assert.deepEqual(fresh.map((x) => x[0]), Array.from({ length: 35 }, (_, i) => 48 + i), "C-29.48 to .82, none skipped");
  for (const [code, key] of [["NOT_YOUR_ACCOUNT", "refusal.NOT_YOUR_ACCOUNT"], ["NO_ACCOUNT", "refusal.NO_ACCOUNT"], ["AI_KEPT_AWAY", "refusal.AI_KEPT_AWAY"]])
    assert.equal(AI_ACCOUNT_CHECKS[code].translation, wordOf(key), code);
  /* the retired kinds' rows are gone */
  for (const gone of ["UNKNOWN_ACCOUNT_KIND", "GROUP_KEY_NOTICE_DUE", "SUBSCRIPTION_LOGIN_REFUSED", "PROJECT_NOT_SOLE_MEMBER", "SIGNIN_NOT_CONNECTED", "PROJECT_KEY_NOTICE_DUE", "SIGNIN_NOT_HELD", "SUBSCRIPTION_TOKEN_MALFORMED"])
    assert.equal(gone in AI_ACCOUNT_CHECKS, false, gone);
});

/* ===== R32: the factory and the route map ===== */

test("R32: aiAccountsOf answers one instance per storage, its tables declared at its boot, created with the seal secret it is given; the ops map answers each op's service, reading the stamps from the query after the body, so a caller's own `by` never wins", async () => {
  const w = await projectWorld();
  assert.equal(aiAccountsOf(w.ctx), w.a);
  assert.ok(w.core.declared.has("ai_accounts"));
  const ops = w.ops("by=ann", { provider: P.provider, plan: P.memberApi, means: "sealed", secret: SECRET("ann"), by: "bob" });
  const x = await ops.aiownadd();
  assert.deepEqual([x.ok, x.owner], [true, "member:ann"], "the stamp wins over the body");
  assert.equal(w.ops("by=ann&viewer=ann", null).accountstate === undefined, false);
  assert.equal(w.ops(`viewer=ann&account_id=${x.account_id}`).accountstate().owner, "member:ann");
  assert.equal(w.ops(`viewer=bob&account_id=${x.account_id}`).accountstate().reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.ops("owner=member:ann&viewer=ann").accountsof().accounts.length, 1);
  assert.equal(w.ops("owner=member:ann&viewer=ann").accounthistory().changes.length >= 1, true);
  assert.equal(w.ops("level=group&viewer=admin").aichecks().ticks.P1, true);
  assert.deepEqual(w.ops("owner=member:ann&viewer=ann").aioffered(), { ok: true, owner: "member:ann", entries: null });
  /* the retired ops are not in the map */
  for (const gone of ["subscriptiondisconnect", "accountreferenceset", "accountreferenceremove", "accountreference", "groupkeyset", "groupkeyremove", "groupkeyswitch",
                      "groupkeystate", "groupkeynotice", "groupkeynoticeseen", "projectkeyset", "projectsigninset", "projectaccountremove", "projectaccountswitch",
                      "projectaccountstate", "projectkeynotice", "projectkeynoticeseen", "accountswitchset", "groupswitchset"])
    assert.equal(gone in w.ops(), false, gone);
  /* `aiaccountadd` is the team's and a project's: a member owner is refused as no owner */
  assert.equal((await w.ops("by=ann", { owner: "member:ann", provider: P.provider, plan: P.memberApi, secret: "s" }).aiaccountadd()).ok, false);
  assert.equal((await w.ops("by=admin", { owner: "group", provider: P.provider, plan: P.teamApi, means: "sealed", secret: SECRET("t") }).aiaccountadd()).ok, true);
  assert.equal((await w.ops("by=ann", { owner: "project:P", provider: P.provider, plan: P.teamApi, means: "sealed", secret: SECRET("p") }).aiaccountadd()).ok, true);
});

/* ===== R39: the instance clock ===== */

const PINNED = Date.parse("2026-10-20T10:15:30.000Z");
const PINNED_SECOND = "2026-10-20T10:15:30Z";
const own = (w, ops, env) => aiAccountsOps(w.a, new URL("http://x/?by=ann"), { provider: P.provider, plan: P.memberApi, means: "sealed", secret: SENTINEL }, env).aiownadd();

test("R39: an account set in a pinned world records the pinned instant as its set_at and its change's at, not the wall clock; unpinned, the wall clock between the calls either side; an instance handed a clock records it with no environment at the door; a token's validity runs from the pinned clock", async () => {
  const w = await projectWorld();
  const answer = await own(w, null, { BIO_NOW_MS: PINNED });
  assert.equal(answer.ok, true);
  assert.equal(answer.set_at, PINNED_SECOND);
  assert.equal(w.row("SELECT set_at FROM ai_accounts WHERE account_id=?", answer.account_id).set_at, PINNED_SECOND);
  assert.equal(w.row("SELECT at FROM account_changes ORDER BY seq DESC LIMIT 1").at, PINNED_SECOND);
  const w2 = await projectWorld();
  const before = Date.now();
  const unpinned = await own(w2, null, {});
  const after = Date.now();
  assert.equal(unpinned.ok, true);
  const at = Date.parse(unpinned.set_at);
  assert.ok(at >= Math.floor(before / 1000) * 1000 && at <= after, `wall clock, got ${unpinned.set_at}`);
  const w3 = await projectWorld({ now: () => PINNED });
  const handed = await w3.own("ann");
  assert.equal(handed.set_at, PINNED_SECOND);
  const w4 = await projectWorld();
  aiAccountsOps(w4.a, new URL("http://x/?by=ann"), null, { BIO_NOW_MS: PINNED });
  const sub = await w4.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.subscription, means: "issued", secret: "sk-ant-oat01-sentinel-ann-0123456789", by: "ann" });
  const held = await w4.a.issuedTokenHold({ account_id: sub.account_id, token: "sk-ant-oat01-sentinel-ann2-0123456789", valid_until: "1 day" });
  assert.equal(held.since, PINNED_SECOND);
  assert.equal(w4.row("SELECT held_since, valid_until FROM ai_accounts WHERE account_id=?", sub.account_id).valid_until, "2026-10-21T10:15:30Z");
});
