/* ai-accounts R20, R21, R22, R34, R57 at the interface: the material limits that keep the team's, or a project's, material
   away from AI, judged before any account (R57) and binding every account. Ported from the T48 split's arms (their old ids
   kept, K874), the accounts now R40's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, SECRET } from "./fixture.mjs";
import { shape, refusal, act, ask, projectWorld, on } from "./helpers.mjs";
import { AI_ACCOUNT_CHECKS, KEEP_AWAY_REASON, USE_KINDS, KEPT_AWAY_UNREADABLE, AI_ACCOUNTS_PROJECT_TABLES, aiAccountsOf, AiAccounts }
  from "../../../src/ai-accounts/index.mjs";
import { notAnAdmin, noSuchProject, notTheOwner } from "../../../src/membership/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

/* ===== R20, R21: keeping the team's material away from AI ===== */

test("R20: aiKeepAwaySet: an active administrator only (NOT_AN_ADMIN through membership, a machine refused the same); on: true without a reason of 1 to 2,000 characters, or a reason not a string or over 2,000, AI_KEEP_AWAY_NO_REASON (C-29.32); each refusal writing nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual({ ...KEEP_AWAY_REASON }, { min: 1, max: 2000 });
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", "token:ai", null, ""])
    for (const on of [true, false])
      assert.deepEqual(w.c.aiKeepAwaySet({ on, reason: "r", by }),
        notAnAdmin(by ?? null, localize("ai-accounts.index.keeping_the_teams_material_away", "keeping the team's material away from every assistant")), `${String(by)} ${on}`);
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.c.aiKeepAwaySet({ on: true, reason: "r", by: "second" }).reason, "NOT_AN_ADMIN");
  w.sql.exec(`UPDATE members SET status='active' WHERE member_id='second'`);
  for (const reason of [undefined, null, "", "   ", "\n", "x".repeat(2001), "é".repeat(2001), 7, ["r"], { r: 1 }]) {
    const r = w.c.aiKeepAwaySet({ on: true, reason, by: "admin" });
    assert.deepEqual(shape(r), refusal("AI_KEEP_AWAY_NO_REASON"), JSON.stringify(reason)?.slice(0, 30));
    assert.match(r.detail, /Nothing was changed\.$/);
  }
  for (const reason of ["x".repeat(2001), 7])
    assert.deepEqual(shape(w.c.aiKeepAwaySet({ on: false, reason, by: "admin" })), refusal("AI_KEEP_AWAY_NO_REASON"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  for (const reason of ["x", "x".repeat(2000), "é".repeat(2000)]) assert.equal(w.c.aiKeepAwaySet({ on: true, reason, by: "admin" }).ok, true);
});

test("R20 R21: each set is appended with its on, reason, who and when, never replacing an earlier one, and answers the state; aiKeepAwayState answers the latest set, the reason in the administrator's words, null when none; off with nulls before any set; it writes nothing and never throws", async () => {
  const w = await world().group("ann");
  const none = { on: false, reason: null, set_by: null, set_at: null, uses: [...USE_KINDS] };
  assert.deepEqual(w.c.aiKeepAwayState(), none, "off by default");
  const words = "  We are under a confidentiality order until the hearing; \"no AI\" until 1 March.  ";
  const on = w.c.aiKeepAwaySet({ on: true, reason: words, by: "member:second" });
  assert.deepEqual(Object.keys(on).sort(), ["ok", "on", "reason", "set_at", "set_by", "uses"]);
  assert.deepEqual({ ...on, set_at: null, uses: null }, { ok: true, on: true, reason: words, set_by: "second", set_at: null, uses: null });
  assert.match(on.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const before = w.snapshot();
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: words, set_by: "second", set_at: on.set_at, uses: none.uses });
  assert.equal(w.snapshot(), before, "the state writes nothing");
  const off = w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.deepEqual({ ...off, set_at: null }, { ok: true, on: false, reason: null, set_by: "admin", set_at: null, uses: none.uses });
  assert.equal(w.c.aiKeepAwaySet({ on: "yes", reason: "only `true` is on", by: "admin" }).on, false);
  const again = w.c.aiKeepAwaySet({ on: true, reason: "second reason", by: "admin" });
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: "second reason", set_by: "admin", set_at: again.set_at, uses: none.uses });
  assert.deepEqual(w.rows(`SELECT is_on, reason, set_by FROM ai_keep_away ORDER BY seq`).map((r) => [r.is_on, r.reason, r.set_by]),
    [[1, words, "second"], [0, null, "admin"], [0, "only `true` is on", "admin"], [1, "second reason", "admin"]]);
  const d = w.core.declared.get("ai_keep_away").classes;
  assert.deepEqual([d.purge, d.sight, d.export], ["exempt", "group", "admin-only"]);
  w.sql.exec(`DROP TABLE ai_keep_away`);
  assert.deepEqual(w.c.aiKeepAwayState(), { on: null, reason: null, set_by: null, set_at: null, uses: null });
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(w.c.aiKeepAwayState.call(broken), { on: null, reason: null, set_by: null, set_at: null, uses: null });
});

test("R20 R21: the routes: aikeepaway takes `by` from the query over the body; aikeepawaystate answers the state, whoever the plane admits (every active member, by its spec)", async () => {
  const w = await world().group("ann");
  assert.equal(w.ops("by=ann", { on: true, reason: "r", by: "admin" }).aikeepaway().reason, "NOT_AN_ADMIN", "the stamp wins");
  const set = w.ops("by=second", { on: true, reason: "a reason", by: "ann" }).aikeepaway();
  assert.deepEqual([set.ok, set.on, set.reason, set.set_by], [true, true, "a reason", "second"]);
  assert.deepEqual(w.ops("viewer=ann").aikeepawaystate(), w.c.aiKeepAwayState());
});

test("R20: keep-away's reason refusal is AI_KEEP_AWAY_NO_REASON on row C-29.32, its number unmoved; the module holds no `NO_REASON` code of its own, so progressions' NO_REASON (C-100.18) reads its own row", () => {
  assert.deepEqual([AI_ACCOUNT_CHECKS.AI_KEEP_AWAY_NO_REASON.check, AI_ACCOUNT_CHECKS.AI_KEEP_AWAY_NO_REASON.where],
    ["C-29.32", "src/ai-accounts/limits.mjs #keepAwayReason > is-keep-away-reason"]);
  assert.ok(!("NO_REASON" in AI_ACCOUNT_CHECKS));
});

/* ===== R7, R57: keep-away refuses every account, a personal subscription among them, before any is read ===== */

async function served() {
  const w = await projectWorld();
  const ann = await on(w, w.own("ann"));
  const team = await on(w, w.team());
  const sub = await on(w, w.a.accountSet({ owner: "member:bob", provider: "anthropic", plan: "anthropic-sub", means: "issued", secret: "sk-ant-oat01-sentinel-bob-0123456789", by: "bob" }));
  for (const m of ["ann", "bob", "cy"]) w.a.recipientNoticeSeen({ member: m, provider: "anthropic", host: "api.anthropic.com", by: m });
  return { w, ann, team, sub };
}

test("R7 R57 R21: while the team keeps its material away every account is refused AI_KEPT_AWAY (C-29.31) with R21's reason, who and when, before any account is read: a member's own key, a personal subscription and the team's alike, for every act and every caller; turned off, each served as before", async () => {
  const { w } = await served();
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "cy", ask: 1, act: ask("cy") })).level, "group");
  const set = w.c.aiKeepAwaySet({ on: true, reason: "A confidentiality order.", by: "second" });
  const keepAway = { reason: "A confidentiality order.", set_by: "second", set_at: set.set_at };
  const want = (r, label) => { assert.deepEqual(shape(r), refusal("AI_KEPT_AWAY"), label); assert.deepEqual(r.keep_away, keepAway, label); };
  const kept = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual(Object.keys(kept).sort(), ["check", "code", "detail", "keep_away", "ok", "reason", "translation"]);
  const { on: isOn, uses, ...state } = w.c.aiKeepAwayState();
  assert.deepEqual([isOn, kept.keep_away], [true, state]);
  const before = w.snapshot();
  for (const [member, a] of [["ann", ask("ann")], ["ann", act("run", "ann")], ["ann", act("standing", "ann")], ["bob", ask("bob")],
                             ["cy", ask("cy")], ["ann", ask("bob")], ["class:ai", ask("class:ai")], ["ghost", ask("ghost")], [null, null]])
    want(await w.c.accountFor({ member, act: a }), `accountFor ${member} ${JSON.stringify(a)}`);
  const first = w.a._account ? w.rows(`SELECT account_id FROM ai_accounts ORDER BY seq`)[0].account_id : null;
  want(await w.c.accountSecretFor({ account_id: first, act: ask("ann") }), "accountSecretFor");
  assert.equal(w.snapshot(), before, "nothing read, unsealed or written");
  const other = aiAccountsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: "another-secret", catalogue: w.catalogue });
  want(await other.accountFor({ member: "ann", act: ask("ann") }), "before the seal");
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).personal, true);
  w.sql.exec(`DROP TABLE ai_keep_away`);
  const unread = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual([shape(unread), unread.keep_away], [refusal("AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.match(unread.detail, /could not be read/);
});

test("R57: unticking P6 never lifts a limit, and an offered set cannot widen one: with a limit on `ask`, the act is refused AI_KEPT_AWAY or PROJECT_AI_KEPT_AWAY with P6 unticked at every level (control: with the limit off the same act is served)", async () => {
  const { w } = await served();
  w.c.checksSet({ level: "group", check: "P6", ticked: false, by: "admin" });
  w.c.checksSet({ level: "member:ann", check: "P6", ticked: false, by: "ann" });
  w.c.offeredSet({ owner: "member:ann", entries: ["claude-a"], by: "ann" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).ok, true, "control: the limit off");
  w.c.aiKeepAwaySet({ on: true, uses: ["ask"], reason: "r", by: "admin" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).reason, "AI_KEPT_AWAY");
  assert.equal((await w.c.accountFor({ member: "ann", act: act("run", "ann") })).ok, true, "another use is not covered");
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: ["ask"], reason: "r", by: "ann" });
  w.c.checksSet({ level: "project:P", check: "P6", ticked: false, by: "ann" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann", "P") })).reason, "PROJECT_AI_KEPT_AWAY");
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).ok, true, "outside the project");
});

/* ===== R20, R21, R22 (was R57): material limits by use ===== */

test("R20 R21 R22: aiKeepAwaySet takes `uses` (every kind when absent); a `uses` that is not a non-empty list of USE_KINDS entries, each once, SWITCH_VALUE_INVALID (C-29.36) naming the values, writing nothing; aiKeepAwayState answers `uses`", async () => {
  const w = await projectWorld();
  const before = w.snapshot();
  for (const uses of [[], ["ask", "ask"], ["Ask"], ["suggestions"], "ask", 7, {}, [null]]) {
    const r = w.c.aiKeepAwaySet({ on: true, uses, reason: "r", by: "admin" });
    assert.deepEqual(shape(r), refusal("SWITCH_VALUE_INVALID"), JSON.stringify(uses));
    assert.deepEqual(r.values, [...USE_KINDS]);
  }
  assert.equal(w.snapshot(), before);
  assert.equal(w.c.aiKeepAwaySet({ on: true, uses: ["explore", "ask"], reason: "r", by: "admin" }).uses.join(), "ask,explore", "in USE_KINDS' order");
  assert.deepEqual(w.c.aiKeepAwayState().uses, ["ask", "explore"]);
  w.c.aiKeepAwaySet({ on: true, reason: "all", by: "admin" });
  assert.deepEqual(w.c.aiKeepAwayState().uses, [...USE_KINDS], "absent: every use");
  w.sql.exec(`INSERT INTO ai_keep_away (is_on, reason, set_by, set_at) VALUES (1, 'old', 'admin', '2026-01-01T00:00:00Z')`);
  assert.deepEqual(w.c.aiKeepAwayState().uses, [...USE_KINDS]);
  assert.equal(w.row(`SELECT uses FROM ai_keep_away ORDER BY seq DESC LIMIT 1`).uses, null);
});

test("R7 R22: aiKeptAway({project, use}) answers the team's AI_KEPT_AWAY when its limit covers `use`, else PROJECT_AI_KEPT_AWAY (C-29.38) with its reason, who and when when the project's covers it, else null; with neither argument as before; a setting it cannot read fails closed; it writes nothing", async () => {
  const w = await projectWorld();
  assert.equal(w.c.aiKeptAway({ project: "P", use: "ask" }), null);
  w.c.aiKeepAwaySet({ on: true, uses: ["explore"], reason: "no exploring", by: "admin" });
  assert.equal(w.c.aiKeptAway({ use: "explore" }).reason, "AI_KEPT_AWAY");
  assert.equal(w.c.aiKeptAway({ use: "ask" }), null, "negative control: another use");
  assert.equal(w.c.aiKeptAway().reason, "AI_KEPT_AWAY", "with neither argument: as now, whenever it is on");
  const set = w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: ["ask", "draft"], reason: "Under seal until March.", by: "ann" });
  assert.deepEqual({ ...set, set_at: null }, { ok: true, project: "P", on: true, uses: ["ask", "draft"], reason: "Under seal until March.", set_by: "ann", set_at: null });
  const before = w.snapshot();
  const k = w.c.aiKeptAway({ project: "P", use: "ask" });
  assert.deepEqual(shape(k), refusal("PROJECT_AI_KEPT_AWAY"));
  assert.deepEqual([k.project, k.use, k.keep_away], ["P", "ask", { reason: "Under seal until March.", set_by: "ann", set_at: set.set_at }]);
  assert.equal(w.c.aiKeptAway({ project: "P", use: "run" }), null, "a use it does not name");
  assert.equal(w.c.aiKeptAway({ project: "S", use: "ask" }), null, "another project");
  assert.equal(w.c.aiKeptAway({ project: "P", use: "explore" }).reason, "AI_KEPT_AWAY", "the team's first");
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal(w.c.aiKeptAway({ project: "P" }).reason, "PROJECT_AI_KEPT_AWAY", "no use asked: covered while on");
  assert.equal(w.c.aiKeptAway(), null);
  assert.equal(w.snapshot() === before, false, "(the sets above wrote; the reads below do not)");
  const before2 = w.snapshot();
  w.c.aiKeptAway({ project: "P", use: "ask" });
  w.c.projectsKeptAway({ use: "ask" });
  assert.equal(w.snapshot(), before2);
  await on(w, w.own("bob"));
  w.a.recipientNoticeSeen({ member: "bob", provider: "anthropic", host: "api.anthropic.com", by: "bob" });
  assert.equal((await w.c.accountFor({ member: "bob", act: act("ask", "bob", "P") })).reason, "PROJECT_AI_KEPT_AWAY");
  assert.equal((await w.c.accountFor({ member: "bob", act: act("run", "bob", "P") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: act("ask", "bob") })).level, "member", "outside the project's context");
  assert.equal(w.c.projectsKeptAway({ use: "ask" }).join(), "P");
  w.sql.exec(`DROP TABLE project_keep_away`);
  const unread = w.c.aiKeptAway({ project: "P", use: "run" });
  assert.deepEqual([shape(unread), unread.keep_away], [refusal("PROJECT_AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.match(unread.detail, /could not be read/);
  assert.equal(w.c.aiKeptAway({ use: "run" }), null, "the team's own read is unaffected");
  assert.equal(w.c.projectsKeptAway({ use: "ask" }), null, "unknown, never an empty list");
});

test("R22: projectAiKeepAwaySet is an owner's act (R10's refusals) under R20's reason rule (AI_KEEP_AWAY_NO_REASON) and `uses` rule, appended; projectAiKeepAwayState answers the project's participants, anyone else as absent; projectsKeptAway answers the projects whose latest limit covers `use`", async () => {
  const w = await projectWorld();
  const before = w.snapshot();
  assert.deepEqual(w.c.projectAiKeepAwaySet({ project: "P", on: true, reason: "r", by: "bob" }), notTheOwner("bob", "P"));
  assert.deepEqual(w.c.projectAiKeepAwaySet({ project: "P", on: true, reason: "r", by: "eve" }), noSuchProject("P"));
  for (const reason of [null, "", "  ", "x".repeat(2001), 7])
    assert.equal(w.c.projectAiKeepAwaySet({ project: "P", on: true, reason, by: "ann" }).reason, "AI_KEEP_AWAY_NO_REASON", String(reason));
  assert.equal(w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: [], reason: "r", by: "ann" }).reason, "SWITCH_VALUE_INVALID");
  assert.equal(w.snapshot(), before);
  w.c.projectAiKeepAwaySet({ project: "P", on: true, uses: ["explore"], reason: "no exploring here", by: "ann" });
  w.c.projectAiKeepAwaySet({ project: "S", on: true, reason: "nothing", by: "cy" });
  w.c.projectAiKeepAwaySet({ project: "D", on: true, uses: ["explore"], reason: "x", by: "dee" });
  w.c.projectAiKeepAwaySet({ project: "D", on: false, by: "dee" });
  assert.equal(w.rows(`SELECT project_id, is_on FROM project_keep_away ORDER BY seq`).length, 4, "appended");
  assert.deepEqual(w.c.projectsKeptAway({ use: "explore" }), ["P", "S"]);
  assert.deepEqual(w.c.projectsKeptAway({ use: "ask" }), ["S"]);
  for (const viewer of ["ann", "bob"]) {
    const st = w.c.projectAiKeepAwayState({ project: "P", viewer });
    assert.deepEqual([st.ok, st.on, st.uses, st.reason, st.set_by], [true, true, ["explore"], "no exploring here", "ann"], viewer);
  }
  for (const viewer of ["eve", "class:admin", null]) assert.deepEqual(w.c.projectAiKeepAwayState({ project: "P", viewer }), noSuchProject("P"));
  assert.equal(w.c.projectAiKeepAwayState({ project: "P", viewer: "second" }).reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.core.declared.get("project_keep_away").classes.export, "admin-only", "declared as R20's");
});

/* ===== R34: the fail-closed refusal ===== */

test("R34: the keep-away table made unreadable gives AI_KEPT_AWAY with its row and keep_away's three null, equal to KEPT_AWAY_UNREADABLE (control: a readable setting that is off answers null)", async () => {
  const w = await world().group("ann");
  assert.equal(w.c.aiKeptAway(), null);
  w.sql.exec(`DROP TABLE ai_keep_away`);
  assert.deepEqual(w.c.aiKeptAway(), KEPT_AWAY_UNREADABLE);
});

test("R34: KEPT_AWAY_UNREADABLE is exported frozen, the refusal R7 states with its row, never a throw or a refusal without one", () => {
  assert.ok(Object.isFrozen(KEPT_AWAY_UNREADABLE) && Object.isFrozen(KEPT_AWAY_UNREADABLE.keep_away));
  assert.deepEqual(shape(KEPT_AWAY_UNREADABLE), refusal("AI_KEPT_AWAY"));
  assert.deepEqual(KEPT_AWAY_UNREADABLE.keep_away, { reason: null, set_by: null, set_at: null });
  assert.match(KEPT_AWAY_UNREADABLE.detail, /could not be read/);
});

test("R34: a stored value that does not parse, a store that throws on every read, and an argument that throws inside the read each answer a refusal with its row, never a throw; a project's limit that cannot be read keeps R22's own fail-closed refusal (control: the readable limit off)", async () => {
  const w = await projectWorld();
  w.sql.exec(`INSERT INTO ai_keep_away (is_on, reason, set_by, set_at, uses) VALUES (1, 'r', 'admin', '2026-01-01T00:00:00Z', 'not json')`);
  assert.equal(w.c.aiKeptAway({ use: "ask" }).reason, "AI_KEPT_AWAY", "an unreadable `uses` covers every use");
  const broken = new AiAccounts({ sql: { exec() { throw new Error("disk gone"); } }, core: null, membership: w.m, sealSecret: "s" });
  assert.deepEqual(broken.aiKeptAway({ use: "ask" }), KEPT_AWAY_UNREADABLE, "a store that throws on every read");
  const hostile = { toString() { throw new Error("hostile"); } };
  let k;
  const w3 = await projectWorld();
  assert.doesNotThrow(() => { k = w3.c.aiKeptAway({ project: hostile, use: "ask" }); });
  assert.deepEqual(k, KEPT_AWAY_UNREADABLE, "an argument that throws inside the read");
  assert.ok(!Object.isFrozen(k), "a copy, so no caller holds the constant");
  assert.equal(w.c.aiKeptAway.call(Object.create(Object.getPrototypeOf(w.c))).reason, "AI_KEPT_AWAY");
  const w2 = await projectWorld();
  w2.sql.exec(`DROP TABLE project_keep_away`);
  assert.equal(w2.c.aiKeptAway({ project: "P", use: "ask" }).reason, "PROJECT_AI_KEPT_AWAY");
  assert.equal(w2.c.aiKeptAway({ use: "ask" }), null, "control: the team's limit is off and readable");
});

/* ===== R28: the project tables of the limits ===== */

test("R28 R29: the project's material limits are declared through declareTable, never exported but to administrators, keyed by project_id and cleared with their project: a purge of the project deletes its rows, and no other; the module's other tables of every owner clear only the rows that name a project", async () => {
  const w = world();
  for (const t of AI_ACCOUNTS_PROJECT_TABLES) {
    const d = w.core.declared.get(t.name);
    assert.equal(d.module, "ai-accounts", t.name);
    assert.deepEqual([d.classes.purge, d.classes.sight, d.classes.expunge, d.classes.keys], ["clear", "group", "none", ["project_id"]], t.name);
    assert.equal(d.classes.export, "admin-only", t.name);
  }
  assert.equal(w.core.declared.get("ai_recipients_seen").classes.purge, "exempt", "negative control");
  const r = realWorld();
  r.fact.claimed = true;
  for (const [id, role] of [["second", "admin"], ["ann", "member"], ["cy", "member"]]) {
    const a = await r.m.memberAdd({ memberId: id, cover: "c", role, by: "admin" });
    await r.m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  }
  for (const [p, owner] of [["PROJ-P", "ann"], ["PROJ-S", "cy"]]) {
    r.db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                  VALUES (?, 'project', 'g', ?, 'draft', 't', 't', 'x')`).run(p, p);
    r.m.projectCreated({ projectId: p, ownerId: owner, by: owner });
    assert.equal(r.a.projectAiKeepAwaySet({ project: p, on: true, reason: "r", by: owner }).ok, true, p);
  }
  const count = (p) => ["project_keep_away"].map((t) => r.row(`SELECT COUNT(*) AS n FROM ${t} WHERE project_id=?`, p).n);
  assert.deepEqual([count("PROJ-P"), count("PROJ-S")], [[1], [1]]);
  assert.equal(r.rc.purge({ bundleId: "PROJ-P" }).ok, true);
  assert.deepEqual([count("PROJ-P"), count("PROJ-S")], [[0], [1]]);
});
