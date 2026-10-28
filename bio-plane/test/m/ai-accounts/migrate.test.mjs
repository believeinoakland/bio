/* ai-accounts R28, R59 at the interface: `migrate` converts today's rows (as a T52 store holds them) into accounts of the T53
   model in one transaction, idempotently, answering counts per kind; the sealed bytes are unchanged, the switches, keep-away
   and history are kept, a project's sign-in account ends with one notice to its owners, and a row of an unknown kind is left and
   counted. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { world, SEAL } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E, emptyCatalogue } from "./catalogue.mjs";
import { coreOver } from "../record-core/fixtures.mjs";
import { ask, projectWorld } from "./helpers.mjs";
import { AI_ACCOUNTS_LEGACY_SCHEMA, AI_ACCOUNTS_LEGACY_TABLES, aiAccountsOf } from "../../../src/ai-accounts/index.mjs";

async function seal(owner, kind, text, secret = SEAL) {
  const enc = new TextEncoder();
  const base = await webcrypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, ["deriveKey"]);
  const key = await webcrypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: enc.encode(owner), info: enc.encode("bio-credentials-seal/1") },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const ct = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(`${owner}|${kind}`) }, key, enc.encode(text));
  return { sealed: Buffer.from(new Uint8Array(ct)).toString("base64"), iv: Buffer.from(iv).toString("base64") };
}
const KEYS = { ann: "sk-ant-api03-legacy-ann-0001", team: "sk-ant-api03-legacy-team-0002", P: "sk-ant-api03-legacy-P-0003", bob: "sk-ant-oat01-legacy-bob-signin-0004" };

/* a store as T52 left it: every kind of row, in the old tables, beside a booted module of the new model */
async function legacy({ extra = () => {} } = {}) {
  const w = await projectWorld();
  for (const st of AI_ACCOUNTS_LEGACY_SCHEMA.split(";")) { const s = st.trim(); if (s) w.sql.exec(s); }
  const ann = await seal("member:ann", "apikey", KEYS.ann);
  w.sql.exec(`INSERT INTO account_references (member_id, kind, sealed, iv, set_at, suggestions, standing, use_ask, use_draft, explore) VALUES ('ann','apikey',?,?,'2026-03-01T00:00:00Z',1,1,0,1,'ask')`, ann.sealed, ann.iv);
  const bob = await seal("member:bob", "signin", KEYS.bob);
  w.sql.exec(`INSERT INTO subscription_connections (member_id, since, sealed, iv, valid_until, standing) VALUES ('bob','2026-04-01T00:00:00Z',?,?,'2027-04-01T00:00:00Z',1)`, bob.sealed, bob.iv);
  w.sql.exec(`INSERT INTO subscription_connections (member_id, since) VALUES ('cy','2026-04-02T00:00:00Z')`);
  const team = await seal("group-key:anthropic", "apikey", KEYS.team);
  w.sql.exec(`INSERT INTO group_key (id, sealed, iv, is_on, set_by, set_at, standing, use_run) VALUES (1,?,?,1,'admin','2026-02-01T00:00:00Z',1,0)`, team.sealed, team.iv);
  const p = await seal("project:P", "apikey", KEYS.P);
  w.sql.exec(`INSERT INTO project_accounts (project_id, kind, sealed, iv, is_on, set_by, set_at, use_draft) VALUES ('P','apikey',?,?,1,'ann','2026-05-01T00:00:00Z',0)`, p.sealed, p.iv);
  w.sql.exec(`INSERT INTO project_accounts (project_id, kind, member_id, is_on, set_by, set_at) VALUES ('S','signin','cy',1,'cy','2026-05-02T00:00:00Z')`);
  w.sql.exec(`INSERT INTO group_key_notices (member_id, seen_at) VALUES ('eve','2026-02-02T00:00:00Z')`);
  w.sql.exec(`INSERT INTO project_key_notices (member_id, project_id, seen_at) VALUES ('bob','P','2026-05-03T00:00:00Z')`);
  w.sql.exec(`INSERT INTO group_key_acts (act, detail, actor, at) VALUES ('set', NULL, 'admin', '2026-02-01T00:00:00Z')`);
  w.sql.exec(`INSERT INTO project_account_acts (project_id, act, detail, actor, at) VALUES ('P','setkey',NULL,'ann','2026-05-01T00:00:00Z')`);
  extra(w);
  return w;
}
const accountsOf = (w) => w.rows(`SELECT * FROM ai_accounts ORDER BY seq`);

test("R59: migrate converts today's rows in one transaction, answering counts per kind: a member's `apikey` reference becomes an account of provider anthropic, the catalogue's Anthropic API plan, means `sealed` (the same sealed bytes), on, alone in the member's list, entries the plan's in catalogue order; a `signin` (a connected subscription with a held token) the plan `subscription`, means `issued` (token carried sealed); one with a fact and no token `held: false`; the team's key and each project's key team and project accounts of that API plan, means sealed, switches and `on` kept; seen key notices become seen recipient notices; the legacy tables are dropped", async () => {
  const w = await legacy();
  const r = w.a.migrate();
  assert.deepEqual(r, { ok: true, converted: { member_key: 1, member_signin: 2, team_key: 1, project_key: 1, project_signin_ended: 1, notices_seen: 2 }, left: 0, deferred: 0 });
  const by = Object.fromEntries(accountsOf(w).map((a) => [a.owner, a]));
  const ann = by["member:ann"];
  assert.deepEqual([ann.provider, ann.plan, ann.means, ann.is_on, ann.held, JSON.parse(ann.entries)], ["anthropic", P.teamApi, "sealed", 1, 1, [E.a, E.b]]);
  const orig = KEYS.ann;
  assert.equal((await w.a.accountSecretFor({ account_id: ann.account_id, act: ask("ann") })).secret, orig, "the same sealed bytes open");
  assert.deepEqual(w.a.accountsOf({ owner: "member:ann", viewer: "ann" }).accounts.map((x) => [x.account_id, x.position]), [[ann.account_id, 1]], "alone in the member's list");
  assert.deepEqual(w.a.accountUses({ account_id: ann.account_id, viewer: "ann" }).uses, { ask: false, draft: true, run: true, standing: true, explore: "ask", enquire: true, read: true, transcribe: true, account: true, suggestions: true }, "switches kept");
  const bob = by["member:bob"];
  assert.deepEqual([bob.plan, bob.means, bob.held, bob.personal, bob.valid_until], [P.subscription, "issued", 1, 1, "2027-04-01T00:00:00Z"]);
  assert.equal((await w.a.accountSecretFor({ account_id: bob.account_id, act: ask("bob") })).secret, KEYS.bob, "the token carried sealed");
  assert.equal(w.a.personalChoiceState({ account_id: bob.account_id, viewer: "bob" }).record.at, "2026-04-01T00:00:00Z");
  const cy = by["member:cy"];
  assert.deepEqual([cy.means, cy.held, cy.sealed], ["issued", 0, null], "a fact and no token: held false, it serves nothing");
  const team = by.group;
  assert.deepEqual([team.plan, team.means, team.is_on, team.held, team.seal_owner, JSON.parse(team.entries)], [P.teamApi, "sealed", 1, 1, "group-key:anthropic", [E.a, E.b]]);
  assert.equal((await w.a.accountSecretFor({ account_id: team.account_id, act: ask("admin") })).reason, "NOT_YOUR_ACCOUNT", "a team account's secret only through accountFor");
  assert.equal(w.a.accountUses({ account_id: team.account_id, viewer: "admin" }).uses.run, false);
  assert.equal(w.a.accountUses({ account_id: team.account_id, viewer: "admin" }).uses.standing, true);
  const proj = by["project:P"];
  assert.deepEqual([proj.plan, proj.means, proj.is_on, w.a.accountUses({ account_id: proj.account_id, viewer: "ann" }).uses.draft], [P.teamApi, "sealed", 1, false]);
  assert.equal(by["project:S"], undefined, "a project's sign-in account is removed");
  /* the team's account serves a member, with the sealed bytes the old group key held */
  const f = await w.a.accountFor({ member: "eve", act: ask("eve") });
  assert.deepEqual([f.ok, f.level, f.secret], [true, "group", KEYS.team], "eve read the old notice: her recipient notice is seen");
  assert.equal((await w.a.accountFor({ member: "dee", act: ask("dee") })).reason, "RECIPIENT_NOTICE_DUE", "control: one who read none");
  assert.equal((await w.a.accountFor({ member: "bob", act: { kind: "ask", member: "bob", project: "P" } })).secret, KEYS.P, "bob read the project key's notice");
  /* the history is kept; the old tables are dropped */
  const hist = w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.map((c) => c.change);
  assert.ok(hist.includes("key_set") && hist.includes("account_set"), "the carried record beside the conversion's");
  for (const t of AI_ACCOUNTS_LEGACY_TABLES) assert.equal(w.rows(`SELECT name FROM sqlite_master WHERE name=?`, t).length, 0, `${t} dropped`);
});

test("R59: each owner of a removed project sign-in account is owed one notice, answered by accountNoticesFor as {kind: 'signin-ended', key, project, …}, a stable key per removed account; control: a project whose account was a key is told nothing, a non-owner nothing", async () => {
  const w = await legacy();
  w.a.migrate();
  const n = w.a.accountNoticesFor({ viewer: "cy" });
  assert.deepEqual(n.map((x) => [x.kind, x.project, x.member]), [["signin-ended", "S", "cy"]]);
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "cy" }), n, "a stable key per removed account");
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "ann" }), [], "P held a key");
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "eve" }), []);
  assert.equal(JSON.stringify(n).includes("sk-"), false);
  w.a.migrate();
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "cy" }), n, "a second migrate adds none");
});

test("R59 R28: a second migrate changes nothing; a row of an unknown kind is left and counted, not dropped (its table stays); a store with the old tables keeps its rows: nothing is lost by the conversion", async () => {
  const w = await legacy({ extra: (x) => {
    x.sql.exec(`INSERT INTO account_references (member_id, kind, sealed, iv, set_at) VALUES ('dee','oauth','s','i','2026-01-01T00:00:00Z')`);
    x.sql.exec(`INSERT INTO project_accounts (project_id, kind, set_by, set_at) VALUES ('D','mystery','dee','2026-01-01T00:00:00Z')`);
  } });
  const r = w.a.migrate();
  assert.deepEqual([r.ok, r.converted.member_key, r.left, r.deferred], [true, 1, 2, 0]);
  assert.equal(w.rows(`SELECT member_id FROM account_references`).map((x) => x.member_id).join(), "dee", "left in place");
  assert.equal(w.rows(`SELECT project_id FROM project_accounts`).map((x) => x.project_id).join(), "D");
  assert.equal(w.rows(`SELECT name FROM sqlite_master WHERE name='group_key'`).length, 0, "an emptied table is dropped");
  const snap = w.snapshot();
  const again = w.a.migrate();
  assert.deepEqual(again.converted, { member_key: 0, member_signin: 0, team_key: 0, project_key: 0, project_signin_ended: 0, notices_seen: 0 });
  assert.deepEqual([again.left, again.deferred], [2, 0], "counted again, never dropped");
  assert.equal(w.snapshot(), snap, "a second migrate changes nothing");
  assert.equal(accountsOf(w).length, 5, "ann, bob, cy, the team, project P; the unknown kinds are not converted");
  /* a store with no old tables: nothing to do */
  const clean = await projectWorld();
  assert.deepEqual(clean.a.migrate(), { ok: true, converted: { member_key: 0, member_signin: 0, team_key: 0, project_key: 0, project_signin_ended: 0, notices_seen: 0 }, left: 0, deferred: 0 });
});

test("R59: a catalogue that cannot give the plan or its entries yet defers the conversion: the rows stay in their tables, counted `deferred`, and a later boot converts them; nothing is dropped", async () => {
  const w = await legacy();
  /* the same store, read by a copy whose catalogue holds no payload yet */
  const blind = aiAccountsOf({ storage: { sql: w.sql } }, { record: coreOver(w.db), membership: w.m, sealSecret: SEAL, catalogue: await emptyCatalogue() });
  const r = blind.migrate();
  assert.equal(r.ok, true);
  assert.deepEqual(Object.values(r.converted).reduce((a, b) => a + b, 0), 1, "only the project's sign-in account, which needs no plan, ends");
  assert.ok(r.deferred > 0);
  assert.equal(accountsOf(w).length, 0);
  assert.equal(w.rows(`SELECT member_id FROM account_references`).length, 1, "kept");
  assert.equal(w.rows(`SELECT member_id FROM subscription_connections`).length, 2);
  const later = w.a.migrate();
  assert.deepEqual([later.converted.member_key, later.converted.member_signin, later.converted.team_key, later.converted.project_key, later.deferred], [1, 2, 1, 1, 0]);
  assert.equal(accountsOf(w).length, 5);
});
