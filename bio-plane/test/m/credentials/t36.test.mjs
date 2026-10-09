/* T36 (T36-7; DEC-172, K1957; K1946 T1, T3; K2038, N743, N744), at the interface: each outside security tool's
   credentials held under R29 (a set of named fields as one value; a set with no key removes it); the group's setting
   that keeps its material away from every assistant (R51, R52) and what it refuses (R35, with R27 and R32); a member's
   own account always served otherwise (K1757's "the group's key only" retired); the tally's totals for a period (R49);
   and the store-internal route `securitycount` (R50). R45's failure answer is in t35-tally.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, SEAL } from "./fixture.mjs";
import { ACCOUNT_CHECKS, KEYED_SERVICE_CHECKS, SIGN_IN_CHECKS, SECURITY_KINDS, KEEP_AWAY_REASON, SECURITY_SERVICE_PREFIX,
         credentialsOf } from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const H = 3600e3;
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const row = (table, code) => ({ ok: false, reason: code, code, check: table[code].check, translation: table[code].translation });
const ask = (member) => ({ kind: "ask", member });
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
async function at(t, fn) {
  const real = Date.now;
  Date.now = () => t;
  try { return await fn(); } finally { Date.now = real; }
}
const lay = (w, kind, hour, n, country = "") =>
  w.sql.exec(`INSERT INTO security_counts (kind, hour, country, count) VALUES (?,?,?,?)
              ON CONFLICT(kind, hour, country) DO UPDATE SET count=count+excluded.count`, kind, hour, country, n);

/* ===== R29: the security tools' keys ===== */

const FIELDS = { service_account_key: '{"type":"service_account","private_key":"-----SENTINEL-PK-77-----"}', tenant: "t-SENT-3" };

test("R29 a security tool's credentials are held under `security:<tool_id>` by an active administrator only, as one key or a set of named fields held as one value, answered to the in-plane caller as set only while on; sealed and never shown", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(SECURITY_SERVICE_PREFIX, "security:");
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", null])
    assert.deepEqual(await w.c.keyedServiceSet({ service: "security:t1", key: FIELDS, by }),
      notAnAdmin(by, "setting the group's key for an outside service"), String(by));
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* a set of named fields: held, off when first set, answered as the object it was set as once on */
  const s = await w.c.keyedServiceSet({ service: "security:t1", key: FIELDS, by: "second" });
  assert.deepEqual({ ...s, set_at: null }, { ok: true, service: "security:t1", held: true, set_at: null });
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "security:t1" })), row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_OFF"),
    "off by default");
  assert.deepEqual(w.c.keyedServiceSwitch({ service: "security:t1", on: true, by: "admin" }).on, true);
  assert.deepEqual(await w.c.keyedServiceFor({ service: "security:t1" }), { ok: true, service: "security:t1", key: FIELDS });
  /* one key, a string, for another tool; each tool its own */
  await w.c.keyedServiceSet({ service: "security:scanii-1", key: "scanii-SENTINEL-key", by: "admin" });
  w.c.keyedServiceSwitch({ service: "security:scanii-1", on: true, by: "admin" });
  assert.deepEqual(await w.c.keyedServiceFor({ service: "security:scanii-1" }), { ok: true, service: "security:scanii-1", key: "scanii-SENTINEL-key" });
  /* a set replaces a key and a key a set, one row, the switch kept */
  await w.c.keyedServiceSet({ service: "security:scanii-1", key: { api_key: "k2", api_secret: "s2" }, by: "admin" });
  assert.deepEqual((await w.c.keyedServiceFor({ service: "security:scanii-1" })).key, { api_key: "k2", api_secret: "s2" });
  await w.c.keyedServiceSet({ service: "security:scanii-1", key: "k3", by: "admin" });
  assert.equal((await w.c.keyedServiceFor({ service: "security:scanii-1" })).key, "k3");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM keyed_services WHERE service='security:scanii-1'`).n, 1);
  /* listed after the named services, by service, never a key */
  const listed = w.c.keyedServices().services;
  assert.deepEqual(listed.map((x) => [x.service, x.held, x.on, x.set_by]),
    [["courtlistener", false, false, null], ["security:scanii-1", true, true, "admin"], ["security:t1", true, true, "second"]]);
  /* sealed: no table, answer or route carries a field, the whole set, or its digest */
  const { createHash } = await import("node:crypto");
  const dump = w.snapshot();
  const said = JSON.stringify([listed, w.ops("by=admin").keyedservices(), s]);
  for (const secret of [FIELDS.service_account_key, FIELDS.tenant, "SENTINEL-PK-77", "scanii-SENTINEL-key", JSON.stringify(FIELDS)]) {
    assert.ok(!dump.includes(secret) && !said.includes(secret), secret);
    assert.ok(!dump.includes(createHash("sha256").update(secret).digest("hex")), `${secret}: its digest`);
  }
  assert.equal(w.core.declared.get("keyed_services").classes.export, "never");
  /* sealed under its own service and form: a set moved under another tool does not open, nor relabelled a key */
  w.sql.exec(`UPDATE keyed_services SET form='key' WHERE service='security:t1'`);
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "security:t1" })), row(ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE"));
  w.sql.exec(`UPDATE keyed_services SET form='fields' WHERE service='security:t1'`);
  w.sql.exec(`UPDATE keyed_services SET sealed=(SELECT sealed FROM keyed_services WHERE service='security:t1'),
              iv=(SELECT iv FROM keyed_services WHERE service='security:t1'), form='fields' WHERE service='security:scanii-1'`);
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "security:scanii-1" })), row(ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE"));
  const other = credentialsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: `${SEAL}-other` });
  assert.deepEqual(shape(await other.keyedServiceFor({ service: "security:t1" })), row(ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE"));
  assert.deepEqual(await w.c.keyedServiceFor({ service: "security:t1" }), { ok: true, service: "security:t1", key: FIELDS });
});

test("R29 a set with no key removes the service's key and the service is off: for a security tool (file-safety R30) and the named service alike; an administrator's act only; removing none answers removed: false", async () => {
  const w = await world().group("ann");
  for (const service of ["security:t1", "courtlistener"]) {
    await w.c.keyedServiceSet({ service, key: { api_key: "k" }, by: "admin" });
    w.c.keyedServiceSwitch({ service, on: true, by: "admin" });
    assert.equal((await w.c.keyedServiceFor({ service })).ok, true, service);
    const before = w.snapshot();
    assert.deepEqual(await w.c.keyedServiceSet({ service, by: "ann" }), notAnAdmin("ann", "setting the group's key for an outside service"));
    assert.equal(w.snapshot(), before, "a refused removal removes nothing");
    for (const key of [undefined, null]) {
      const r = await w.c.keyedServiceSet({ service, key, by: "second" });
      assert.deepEqual(r, { ok: true, service, held: false, removed: key === undefined }, `${service} ${String(key)}`);
    }
    assert.deepEqual(shape(await w.c.keyedServiceFor({ service })), row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_OFF"), service);
    assert.equal(w.row(`SELECT COUNT(*) AS n FROM keyed_services WHERE service=?`, service).n, 0, "nothing of it is kept");
    /* set again: off again until switched on */
    await w.c.keyedServiceSet({ service, key: "k2", by: "admin" });
    assert.deepEqual(shape(await w.c.keyedServiceFor({ service })), row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_OFF"), `${service}: off again`);
  }
  assert.deepEqual(w.c.keyedServices().services.map((x) => x.service), ["courtlistener", "security:t1"]);
  /* the route: the body's set, the stamp's `by`, and a body with no key removes */
  assert.equal((await w.ops("by=admin", { service: "security:t9", key: { a: "b" } }).keyedserviceset()).held, true);
  assert.deepEqual(await w.ops("by=admin", { service: "security:t9" }).keyedserviceset(),
    { ok: true, service: "security:t9", held: false, removed: true });
  assert.equal((await w.ops("by=ann", { service: "security:t9", by: "admin" }).keyedserviceset()).reason, "NOT_AN_ADMIN");
});

/* ===== R51, R52: keeping the group's material away from AI ===== */

test("R51 aiKeepAwaySet: an active administrator only (NOT_AN_ADMIN through membership, a machine refused the same); on: true without a reason of 1 to 2,000 characters, or a reason not a string or over 2,000, AI_KEEP_AWAY_NO_REASON (C-29.32, re-coded in T37); each refusal writing nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual({ ...KEEP_AWAY_REASON }, { min: 1, max: 2000 });
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", "token:ai", null, ""])
    for (const on of [true, false])
      assert.deepEqual(w.c.aiKeepAwaySet({ on, reason: "r", by }),
        notAnAdmin(by ?? null, "keeping the group's material away from every assistant"), `${String(by)} ${on}`);
  /* the second administrator is refused once no longer active */
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.c.aiKeepAwaySet({ on: true, reason: "r", by: "second" }).reason, "NOT_AN_ADMIN");
  w.sql.exec(`UPDATE members SET status='active' WHERE member_id='second'`);
  for (const reason of [undefined, null, "", "   ", "\n", "x".repeat(2001), "é".repeat(2001), 7, ["r"], { r: 1 }]) {
    const r = w.c.aiKeepAwaySet({ on: true, reason, by: "admin" });
    assert.deepEqual(shape(r), row(ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON"), JSON.stringify(reason)?.slice(0, 30));
    assert.match(r.detail, /Nothing was changed\.$/);
  }
  /* a reason given with off is held to the same bounds */
  for (const reason of ["x".repeat(2001), 7])
    assert.deepEqual(shape(w.c.aiKeepAwaySet({ on: false, reason, by: "admin" })), row(ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* exactly 1 and exactly 2,000 characters (2,000 two-byte characters too) are reasons */
  for (const reason of ["x", "x".repeat(2000), "é".repeat(2000)]) assert.equal(w.c.aiKeepAwaySet({ on: true, reason, by: "admin" }).ok, true);
});

test("R51 R52 each set is appended with its on, reason, who and when, never replacing an earlier one, and answers the state; aiKeepAwayState answers the latest set, the reason in the administrator's words, null when none; off with nulls before any set; it writes nothing and never throws", async () => {
  const w = await world().group("ann");
  const none = { on: false, reason: null, set_by: null, set_at: null, uses: ["ask", "draft", "run", "standing", "explore"] };
  assert.deepEqual(w.c.aiKeepAwayState(), none, "off by default");
  const words = "  We are under a confidentiality order until the hearing; \"no AI\" until 1 March.  ";
  const on = w.c.aiKeepAwaySet({ on: true, reason: words, by: "member:second" });
  assert.deepEqual(Object.keys(on).sort(), ["ok", "on", "reason", "set_at", "set_by", "uses"]);
  assert.deepEqual({ ...on, set_at: null, uses: null }, { ok: true, on: true, reason: words, set_by: "second", set_at: null, uses: null }, "in the administrator's words as set");
  assert.match(on.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const before = w.snapshot();
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: words, set_by: "second", set_at: on.set_at, uses: none.uses });
  assert.equal(w.snapshot(), before, "the state writes nothing");
  const off = w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.deepEqual({ ...off, set_at: null }, { ok: true, on: false, reason: null, set_by: "admin", set_at: null, uses: none.uses }, "null when none was given");
  assert.equal(w.c.aiKeepAwaySet({ on: "yes", reason: "only `true` is on", by: "admin" }).on, false);
  const again = w.c.aiKeepAwaySet({ on: true, reason: "second reason", by: "admin" });
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: "second reason", set_by: "admin", set_at: again.set_at, uses: none.uses });
  /* appended: every set kept, in order */
  assert.deepEqual(w.rows(`SELECT is_on, reason, set_by FROM ai_keep_away ORDER BY seq`).map((r) => [r.is_on, r.reason, r.set_by]),
    [[1, words, "second"], [0, null, "admin"], [0, "only `true` is on", "admin"], [1, "second reason", "admin"]]);
  for (const r of w.rows(`SELECT set_at FROM ai_keep_away`)) assert.match(r.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const d = w.core.declared.get("ai_keep_away").classes;
  assert.deepEqual([d.purge, d.sight], ["exempt", "group"]);
  /* never throws: a setting it cannot read is not known (on: null), never off */
  w.sql.exec(`DROP TABLE ai_keep_away`);
  assert.deepEqual(w.c.aiKeepAwayState(), { on: null, reason: null, set_by: null, set_at: null, uses: null });
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(w.c.aiKeepAwayState.call(broken), { on: null, reason: null, set_by: null, set_at: null, uses: null });
});

test("R51 R52 the routes: aikeepaway takes `by` from the query over the body; aikeepawaystate answers the state, whoever the plane admits (every active member, by its spec)", async () => {
  const w = await world().group("ann");
  assert.equal(w.ops("by=ann", { on: true, reason: "r", by: "admin" }).aikeepaway().reason, "NOT_AN_ADMIN", "the stamp wins");
  const set = w.ops("by=second", { on: true, reason: "a reason", by: "ann" }).aikeepaway();
  assert.deepEqual([set.ok, set.on, set.reason, set.set_by], [true, true, "a reason", "second"]);
  assert.deepEqual(w.ops("viewer=ann").aikeepawaystate(), w.c.aiKeepAwayState());
  assert.deepEqual(w.ops().aikeepawaystate().on, true);
});

/* ===== R35 with R27 and R32: keep-away refuses every account; otherwise a member's own is always served ===== */

async function servedWorld() {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ant-api03-ANN", by: "ann" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  await w.c.groupKeySet({ key: "sk-ant-api03-GROUP", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "admin" });
  w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" });
  w.session = {};
  for (const id of ["ann", "bob"]) w.session[id] = (await w.c.login({ role: `member:${id}`, password: PASSWORD(id) })).token;
  return w;
}

test("R35 while the group keeps its material away every account is refused AI_KEPT_AWAY (C-29.31) with R52's reason, who and when, before any account is read: the member's own reference and the group key alike, for every act and every caller; R27 and R32 are refused the same, minting nothing", async () => {
  const w = await servedWorld();
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).level, "group");
  const set = w.c.aiKeepAwaySet({ on: true, reason: "A confidentiality order.", by: "second" });
  const keepAway = { reason: "A confidentiality order.", set_by: "second", set_at: set.set_at };
  const want = (r, label) => {
    assert.deepEqual(shape(r), row(ACCOUNT_CHECKS, "AI_KEPT_AWAY"), label);
    assert.deepEqual(r.keep_away, keepAway, label);
  };
  /* the refusal carries the setting's reason, who and when, as R52 answers them */
  const kept = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual(Object.keys(kept).sort(), ["check", "code", "detail", "keep_away", "ok", "reason", "translation"]);
  const { on, uses, ...state } = w.c.aiKeepAwayState();
  assert.deepEqual([on, kept.keep_away], [true, state]);
  const before = w.snapshot();
  for (const [member, act] of [["ann", ask("ann")], ["ann", { kind: "run", member: "ann" }], ["ann", { kind: "standing", member: "ann" }],
                               ["bob", ask("bob")], ["bob", { kind: "run", member: "bob" }], ["ann", ask("bob")], ["class:ai", ask("class:ai")],
                               ["ghost", ask("ghost")], [null, null]]) {
    want(await w.c.accountFor({ member, act }), `accountFor ${member} ${JSON.stringify(act)}`);
    want(await w.c.accountReferenceFor({ member, act }), `accountReferenceFor ${member}`);
  }
  for (const id of ["ann", "bob"]) {
    want(await w.c.aiGrantMint({ member: id, by: id, session: w.session[id] }), `R27 ${id}`);
    want(await w.c.aiGrantMintStanding({ member: id, question: "what is new?" }), `R32 ${id}`);
  }
  assert.equal(w.snapshot(), before, "nothing read, unsealed, minted or written");
  /* before any account is read: a reference that would not open is not reached */
  const other = credentialsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: "another-secret" });
  want(await other.accountFor({ member: "ann", act: ask("ann") }), "before the seal");
  /* R22's own-act refusals still come first for the mint: they are about the caller, not an account */
  assert.equal((await w.c.aiGrantMint({ member: "ann", by: "bob", session: w.session.bob })).reason, "NOT_YOUR_ACCOUNT");
  /* turned off: served again, each as before */
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).level, "group");
  assert.equal((await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann })).ok, true);
  assert.equal((await w.c.aiGrantMintStanding({ member: "bob", question: "q" })).ok, true);
  /* a setting that cannot be read keeps everything away (fail closed), naming that it could not be read */
  w.sql.exec(`DROP TABLE ai_keep_away`);
  const unread = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual([shape(unread), unread.keep_away], [row(ACCOUNT_CHECKS, "AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.match(unread.detail, /could not be read/);
});

test("R35 R52 the refusal carries the reason R52 answers, in the administrator's words", async () => {
  const w = await servedWorld();
  const words = "Our counsel asked us to keep case material away from every AI service until the appeal is decided.";
  w.c.aiKeepAwaySet({ on: true, reason: words, by: "admin" });
  for (const r of [await w.c.accountFor({ member: "ann", act: ask("ann") }), await w.c.accountFor({ member: "bob", act: ask("bob") }),
                   await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann }),
                   await w.c.aiGrantMintStanding({ member: "bob", question: "q" })]) {
    assert.equal(r.reason, "AI_KEPT_AWAY");
    assert.equal(r.keep_away.reason, words);
    assert.equal(r.keep_away.reason, w.c.aiKeepAwayState().reason);
  }
});

test("R35 otherwise a member's own reference is always answered when held, whatever the group key's state (absent, held and off, on, its notice unread, removed): K1757's \"the group's key only\" retired", async () => {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ANN-own", by: "ann" });
  const own = { ok: true, kind: "apikey", level: "member", key: "sk-ANN-own" };
  const served = async (label) => assert.deepEqual(await w.c.accountFor({ member: "ann", act: ask("ann") }), own, label);
  await served("no group key");
  await w.c.groupKeySet({ key: "sk-GROUP", by: "admin" });
  await served("the group key held and off");
  w.c.groupKeySwitch({ on: true, by: "admin" });
  await served("the group key on, ann's notice unread");
  w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" });
  await served("the group key on, notice read");
  w.c.aiKeepAwaySet({ on: false, reason: "never on", by: "admin" });
  await served("keep-away set off");
  w.c.groupKeyRemove({ by: "admin" });
  await served("the group key removed");
  /* bob's own key likewise, the group key gone; and with none he is served by nothing */
  assert.equal((await w.c.accountFor({ member: "bob", act: { kind: "run", member: "bob" } })).reason, "NO_ACCOUNT");
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-BOB-own", by: "bob" });
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: { kind: "run", member: "bob" } }),
    { ok: true, kind: "apikey", level: "member", key: "sk-BOB-own" });
});

/* ===== R49: the counts for a period ===== */

test("R49 securityTotals answers R44's counts for the hours that start at or after `from` and before `to`, each kind summed over every country and the counts not placed; it names no country, writes nothing and is reached by no route", async () => {
  const w = await world().group();
  const NOW = (Math.floor(Date.now() / H) + 48) * H + 30 * 60e3, HOUR = Math.floor(NOW / H);
  lay(w, "signin", HOUR - 3, 2, "");
  lay(w, "signin", HOUR - 3, 3, "DE");
  lay(w, "credential", HOUR - 2, 4, "US");
  lay(w, "credential", HOUR - 2, 1, "");
  lay(w, "rate", HOUR - 1, 7, "BR");
  lay(w, "handover", HOUR, 5, "");
  lay(w, "through", HOUR - 4, 1, "");
  lay(w, "signin", HOUR - 24 * 100, 9, "CN");   /* older than any count kept, still summed if asked */
  const before = w.snapshot();
  await at(NOW, () => {
    const all = w.c.securityTotals({ from: iso((HOUR - 3) * H), to: iso((HOUR + 1) * H) });
    assert.deepEqual(Object.keys(all).sort(), ["counts", "from", "ok", "to"]);
    assert.deepEqual(all, { ok: true, from: iso((HOUR - 3) * H), to: iso((HOUR + 1) * H),
      counts: { signin: 5, credential: 5, rate: 7, handover: 5, through: 0 } });
    assert.deepEqual(Object.keys(all.counts), [...SECURITY_KINDS], "keyed by the five kinds");
    /* an hour counts when it starts at or after `from` and before `to` */
    assert.deepEqual(w.c.securityTotals({ from: (HOUR - 3) * H + 1, to: (HOUR - 1) * H }).counts,
      { signin: 0, credential: 5, rate: 0, handover: 0, through: 0 }, "HOUR-3 starts before from; HOUR-1 starts at to");
    assert.deepEqual(w.c.securityTotals({ from: (HOUR - 1) * H, to: (HOUR - 1) * H + 1 }).counts.rate, 7, "an hour starting at from");
    assert.deepEqual(w.c.securityTotals({ from: String((HOUR - 5) * H), to: iso(NOW) }).counts.through, 1, "milliseconds as text");
    assert.deepEqual(w.c.securityTotals({ from: NOW - 200 * 24 * H, to: NOW }).counts.signin, 14, "no bound on the period");
    const said = JSON.stringify(w.c.securityTotals({ from: NOW - 200 * 24 * H, to: NOW }));
    for (const c of ["DE", "US", "BR", "CN"]) assert.ok(!said.includes(`"${c}"`), `names no country: ${c}`);
  });
  assert.equal(w.snapshot(), before, "it writes nothing");
  assert.ok(!Object.keys(w.ops()).some((op) => /securitytotals/i.test(op)), "reached by no route");
});

test("R49 a period that is not from an earlier instant to a later one is refused SECURITY_PERIOD_INVALID (R45's row) naming what; counts that cannot be read are a refusal naming the failure (SECURITY_COUNTS_UNREADABLE, C-96.44), never zeros; it never throws", async () => {
  const w = await world().group();
  const now = Date.now();
  for (const [from, to, what] of [[null, now, "from is not an instant"], ["soon", now, "from is not an instant"], [now - H, undefined, "to is not an instant"],
                                  [now, now, "from is not before to"], [now, now - H, "from is not before to"], [{}, [], "from is not an instant"]]) {
    const r = w.c.securityTotals({ from, to });
    assert.deepEqual([shape(r), r.what], [row(SIGN_IN_CHECKS, "SECURITY_PERIOD_INVALID"), what], what);
    assert.match(r.detail, new RegExp(`^${what}\\.`));
  }
  assert.deepEqual(shape(w.c.securityTotals()), row(SIGN_IN_CHECKS, "SECURITY_PERIOD_INVALID"));
  w.sql.exec(`DROP TABLE security_counts`);
  const r = w.c.securityTotals({ from: now - H, to: now });
  assert.deepEqual(shape(r), row(SIGN_IN_CHECKS, "SECURITY_COUNTS_UNREADABLE"));
  assert.equal(r.counts, undefined, "no figure, never zeros");
  assert.match(r.failure, /security_counts/);
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(shape(w.c.securityTotals.call(broken, { from: now - H, to: now })), row(SIGN_IN_CHECKS, "SECURITY_COUNTS_UNREADABLE"));
});

/* ===== R50: the store-internal route ===== */

test("R50 the ops map routes `securitycount`, R44's write, taking {kind, country} from the body only and answering as R44 does", async () => {
  const w = await world().group();
  const hour = Math.floor(Date.now() / H);
  assert.deepEqual(w.ops("", { kind: "credential", country: "nl" }).securitycount(), { ok: true, kind: "credential", counted: true });
  assert.deepEqual(w.ops("", { kind: "rate" }).securitycount(), { ok: true, kind: "rate", counted: true });
  /* anything but kind and country is not read: not the query's, not another field of the body */
  assert.deepEqual(w.ops("kind=signin&country=FR", { kind: "handover", country: null, address: "203.0.113.9", hour: 1, by: "admin" })
    .securitycount(), { ok: true, kind: "handover", counted: true });
  const tally = w.rows(`SELECT kind, hour, country, count FROM security_counts ORDER BY kind`);
  assert.deepEqual(tally, [{ kind: "credential", hour, country: "NL", count: 1 }, { kind: "handover", hour, country: "", count: 1 },
                           { kind: "rate", hour, country: "", count: 1 }]);
  assert.ok(!JSON.stringify(w.rows(`SELECT * FROM security_counts`)).includes("203.0.113.9"));
  /* R44's refusal, as R44 answers it */
  for (const [body, kind] of [[{ kind: "nope" }, "nope"], [{}, null], [null, null], [[], null], ["signin", null]])
    assert.deepEqual(w.ops("kind=signin", body).securitycount(), w.c.securityCount({ kind }), JSON.stringify(body));
  assert.equal(w.rows(`SELECT * FROM security_counts`).length, 3, "the refusals counted nothing");
});
