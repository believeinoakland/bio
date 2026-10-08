/* store-door: the routes this module adds to plane's one map (`controlPlaneRoutes`), each passing R1's frame — sources'
   own map and credentials' two own-key acts (R1), the unattributed refusal tally (R8), the three drafts with the assistant
   resolved per act before their handlers (R10) — and R12, no place named. Driven at the record store's door over a real
   record (`record.mjs`). Moved from control-plane's `doorbell.test.mjs`, `r50-routes.test.mjs` and `t34-routes.test.mjs`
   at the split (K1974); the Worker's admission and stamps for these ops stay control-plane's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { D, go, quietly } from "./harness.mjs";
const { record } = await import("./record.mjs");
const { credentialsOf } = await import("../../../src/credentials/index.mjs");
const { membershipOf } = await import("../../../src/membership/index.mjs");
const { instanceSetupOf } = await import("../../../src/setup.mjs");
const { aiRunsOf } = await import("../../../src/ai-runs/index.mjs");
const { wizardScriptsOf } = await import("../../../src/wizard-scripts/index.mjs");
const { queueOps } = await import("../../../src/queue/index.mjs");
const { tasksOps } = await import("../../../src/tasks/index.mjs");
const { affordancesOps } = await import("../../../src/affordances.mjs");
const { sourcesOps } = await import("../../../src/sources/index.mjs");
const P = await import("../../../src/store-door/pull.mjs");

const USE = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null };
const URL0 = new URL("http://do/");

test("R1 (N13, N364, N379; K566, K723, K757, K784, K1674): the map this module adds holds queue's, tasks', affordances' and sources' own maps whole, made lazily (no instance built until a route runs), the two own-key acts, the tally, the ask's four store-internal routes, R10's two (`aikeptaway`, `subscriptionconnected`), the three drafts and the pull, and nothing else", () => {
  const mine = D.controlPlaneRoutes(null, URL0, null);
  const own = (ops) => Object.keys(ops(null, URL0, null));
  const want = new Set([...own(queueOps), ...own(tasksOps), ...own(affordancesOps), ...Object.keys(sourcesOps(null, URL0, null)),
    "signerregister", "signerrevoke", "wizardrefusaltally", "aigrantadmit", "aikeptaway", "subscriptionconnected", "askceiling", "askusage", "askcheck",
    "groupdescriptiondraft", "writinghelp", "translationdraft", "inboxpullfile"]);
  assert.deepEqual(new Set(Object.keys(mine)), want);
  for (const [op, f] of Object.entries(mine)) assert.equal(typeof f, "function", op);
  assert.ok(own(tasksOps).includes("checkrequest") && own(queueOps).length > 0 && own(affordancesOps).length > 0);
});

test("R1 (N379, K566): the record store's door dispatches sources' own map — each of its routes, the no-account knockerconsent included, answers sources' own words through R1's envelope, never `unknown op`; the stamps it reads are the query's", async () => {
  const r = await record();
  const { sourcesOps } = await import("../../../src/sources/index.mjs");
  const routes = Object.keys(sourcesOps({}, new URL("http://do/"), null));
  /* T33 (sources R16; K1550): `sourcekeyed`, a member's mark of a keyed result, joins them */
  assert.deepEqual(routes.sort(), ["knockerconsent", "sourceconsent", "sourceconsentwithdraw", "sourcedisclose", "sourcekeyed",
                                   "sourcelink", "sourceof", "sourcepublishable", "sourcereadlog", "sourcerung"]);
  for (const op of routes) {
    const a = await r.go(`${op}?by=ann&viewer=member:ann&source=203.0.113.9&now=${Date.now()}`, "POST", { captureSha: "a".repeat(64) });
    assert.equal(a.status, 200, `${op}: ${JSON.stringify(a.json).slice(0, 200)}`);
    assert.equal(a.json.ok, true, op);
    assert.notEqual(a.json.error, `unknown op: ${op}`, op);
  }
  /* the knocker's consent by a secret no knock carries is sources' own refusal */
  const kc = await r.go(`knockerconsent?source=203.0.113.9&now=${Date.now()}`, "POST", { knockerSecret: "s".repeat(24), entry: "E-1", audience: "public" });
  assert.deepEqual([kc.json.ok, kc.json.result.ok, kc.json.result.reason], [true, false, "SECRET_NOT_RECOGNISED"]);
  /* negative control: a name no module serves is still R1's refusal */
  const u = await r.go("sourcenothing", "POST", {});
  assert.deepEqual([u.status, u.json.error], [400, "unknown op: sourcenothing"]);
});

test("R1 (N364, K784; credentials R9, R10): the record store's door routes signerregister and signerrevoke to credentials' own-key acts, `by` read from the query over the body's", async () => {
  const r = await record();
  /* a machine stamp in the query is refused by credentials, whatever the body names */
  for (const op of ["signerregister", "signerrevoke"]) {
    const a = await r.go(`${op}?by=class:admin`, "POST", { keyB64: "AAAA", by: "ann" });
    assert.equal(a.status, 200, op);
    assert.equal(a.json.ok, true);
    assert.equal(a.json.result.ok, false, op);
    assert.ok(["MACHINE_CANNOT_REGISTER_KEY", "NO_SUCH_KEY"].includes(a.json.result.reason), `${op}: ${a.json.result.reason}`);
  }
  /* negative control: the query's `by` reaches credentials — a member id that is no member is answered as such */
  const n = await r.go("signerregister?by=nobody", "POST", { keyB64: "AAAA", by: "class:admin" });
  assert.notEqual(n.json.result.reason, "MACHINE_CANNOT_REGISTER_KEY");
});

test("R8 (was control-plane R50's store half; wizard-scripts R16): the store-internal route `wizardrefusaltally` hands wizard-scripts' tallyRefusal the op and the code alone — one row per call, carrying nothing but (op, code, day), whatever else the body names (negative control: an op or code that is no token is not counted)", async () => {
  assert.equal(typeof D.controlPlaneRoutes({}, new URL("http://do/"), null).wizardrefusaltally, "function");
  const r = await record();
  for (let i = 0; i < 2; i++) {
    const a = await r.go("wizardrefusaltally", "POST", { op: "index", code: "NO_SUCH_BUNDLE", viewer: "member:ann", member: "ann",
                                                         project: "PROJ-1", at: "2026-10-03T20:00:00Z" });
    assert.deepEqual([a.status, a.json], [200, { ok: true, result: { ok: true } }]);
  }
  const cols = r.db.prepare("PRAGMA table_info(wiz_refusal_tallies)").all().map((c) => c.name);
  const rows = r.db.prepare("SELECT * FROM wiz_refusal_tallies").all().map((x) => ({ ...x }));
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.deepEqual([row.op, row.code], ["index", "NO_SUCH_BUNDLE"]);
    assert.match(String(row.day), /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(JSON.stringify(row).includes("ann") || JSON.stringify(row).includes("PROJ-1"), false, JSON.stringify(row));
  }
  assert.deepEqual(cols.filter((c) => !["op", "code", "day", "tid"].includes(c)), [], cols.join());
  const bad = await r.go("wizardrefusaltally", "POST", { op: "index; drop", code: "x y" });
  assert.deepEqual(bad.json.result, { ok: false });
  assert.equal(r.db.prepare("SELECT COUNT(*) AS n FROM wiz_refusal_tallies").get().n, 2);
});

/* A record with a claimed founder, the members `ann` (an administrator) and `bea` and `cal` (members), and the three drafts'
   handlers replaced by recorders, so what the door hands each is seen whatever its owner answers; `translationdraft`'s own
   first refusal (instance-setup's `translationDraftRefusal`) answers `first.value`, recorded as asked; and every account
   read and use check counted, so a gate that read none is seen. */
async function drafts() {
  const r = await record({ sealSecret: "store-door-test-seal-secret-00002" });
  const C = credentialsOf(r.ctx), mb = membershipOf(r.ctx);
  await C.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
  for (const [id, role] of [["ann", "admin"], ["bea", "member"], ["cal", "member"]]) {
    const a = await mb.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: null, by: "admin" });
    assert.equal(a.ok, true, JSON.stringify(a));
    await mb.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  }
  const seen = [];
  instanceSetupOf(r.ctx).groupDescriptionDraft = (args) => { seen.push(["groupdescriptiondraft", args]); return { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" }; };
  wizardScriptsOf(r.ctx).writingHelp = (args) => { seen.push(["writinghelp", args]); return { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" }; };
  const setup = instanceSetupOf(r.ctx), first = { value: null, asked: [] };
  setup.translationDraftRefusal = (args) => { first.asked.push(args); return first.value; };
  setup.translationDraft = (args) => { seen.push(["translationdraft", args]); return { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" }; };
  const reads = { account: 0, use: 0 };
  const accountFor = C.accountFor.bind(C), runs = aiRunsOf(r.ctx), useCheck = runs.aiUseCheck.bind(runs);
  C.accountFor = (a) => { reads.account++; return accountFor(a); };
  runs.aiUseCheck = (a) => { reads.use++; return useCheck(a); };
  const code = (a) => a.json.result.code ?? a.json.result.reason;
  return { r, C, seen, code, first, reads };
}

/* The group's keep-away, credentials' (its R51; DEC-172), which R10 reads through `credentials.aiKeptAway()` (its R35)
   and from which instance-setup derives `assistantState()` (its R53; K2162): keep-away off is the assistant on. */
function assistant(r, on) {
  const k = credentialsOf(r.ctx).aiKeepAwaySet(on ? { on: false, by: "ann" } : { on: true, reason: "kept away for this test", by: "ann" });
  assert.equal(k.ok, true, JSON.stringify(k));
  const setup = instanceSetupOf(r.ctx);
  assert.equal(setup.assistantState().on, on);
}

test("R10 (N765; credentials R35; run-rules R20; ai-runs R50, R52; membership R84): before either draft's handler the door answers, in order, `groupdescriptiondraft`'s NOT_AN_ADMIN, AI_KEPT_AWAY as `credentials.aiKeptAway()` answers it (its row and keep-away reason; no account read, no use checked), AI_NO_ACCOUNT, the member's and the copy's ceilings, and credentials' own refusal of the account (the group key's notice unread), each before any handler is asked (negative control: once every one is cleared the handler is reached)", async () => {
  const { r, C, seen, code, reads } = await drafts();
  const gdd = (by) => r.go(`groupdescriptiondraft?by=${by}&viewer=${by}`, "POST", { answers: [{ question: "q", text: "t" }] });
  const help = (by) => r.go(`writinghelp?by=${by}&viewer=${by}`, "POST", { op: "notewrite", field: "text", told: "what I saw" });
  /* NOT_AN_ADMIN first, whatever else holds, keep-away included */
  assistant(r, false);
  for (const by of ["member:bea", "class:admin", ""]) assert.equal(code(await gdd(by)), "NOT_AN_ADMIN", by);
  /* kept away: credentials' one refusal as given, and nothing read past it */
  const away = C.aiKeptAway();
  assert.equal(away.reason, "AI_KEPT_AWAY");
  assert.equal(away.keep_away.reason, "kept away for this test");
  assert.deepEqual((await gdd("member:ann")).json.result, away);
  assert.deepEqual((await help("member:bea")).json.result, away);
  assert.deepEqual(reads, { account: 0, use: 0 }, "under keep-away no account is read");
  assistant(r, true);
  /* no account serves */
  assert.equal(code(await gdd("member:ann")), "AI_NO_ACCOUNT");
  assert.equal(code(await help("member:bea")), "AI_NO_ACCOUNT");
  /* the member's own account, then their own ceiling, then the copy's */
  assert.equal((await C.accountReferenceSet({ member: "member:bea", kind: "apikey", secret: "sk-bea-own", by: "member:bea" })).ok, true);
  const runs = aiRunsOf(r.ctx);
  runs.countAskUsage({ member: "member:bea", mode: "ask", usage: USE, calls: 2 });
  assert.equal(runs.aiCeilingSet({ member: "member:bea", calls: 2, by: "member:bea" }).ok, true);
  assert.equal(code(await help("member:bea")), "AI_USE_CEILING_REACHED");
  assert.equal(runs.aiCeilingSet({ member: "member:bea", calls: null, by: "member:bea" }).ok, true);
  assert.equal(runs.aiCopyCeilingSet({ calls: 2, by: "admin" }).ok, true);
  assert.equal(code(await help("member:bea")), "AI_USE_COPY_CEILING_REACHED");
  assert.equal(runs.aiCopyCeilingSet({ calls: null, by: "admin" }).ok, true);
  /* the group's key held and on, its notice unread by ann: credentials' own refusal, relayed with its row */
  assert.equal((await C.groupKeySet({ key: "sk-group-key", by: "admin" })).ok, true);
  assert.equal(C.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  const due = await gdd("member:ann");
  assert.equal(code(due), "GROUP_KEY_NOTICE_DUE");
  assert.equal(typeof due.json.result.translation, "string");
  assert.deepEqual(seen, [], "no handler was asked");
  /* every refusal cleared: the handlers are reached */
  assert.equal(C.groupKeyNoticeSeen({ member: "member:ann", by: "member:ann" }).ok, true);
  assert.equal(code(await gdd("member:ann")), "ASSISTANT_DRAFT_UNAVAILABLE");
  assert.equal(code(await help("member:bea")), "ASSISTANT_DRAFT_UNAVAILABLE");
  assert.deepEqual(seen.map(([op]) => op), ["groupdescriptiondraft", "writinghelp"]);
});

test("R10 (N669, N765; K2200, K2201; instance-setup R67): `translationdraft`, in both directions, answers instance-setup's own first refusal (asked with the body's `language`, `direction`, `keys`, `key` and the stamped `by`) before anything of the door's; then AI_KEPT_AWAY as credentials answers it, no account read and no draft routed; then AI_NO_ACCOUNT and the ceilings; admitted, the handler receives those arguments and `assistant: {on, account: {kind, level}}`, a caller's `assistant` never read and no key handed (negative control: a first refusal cleared reaches the gate)", async () => {
  const { r, C, seen, code, first, reads } = await drafts();
  const draft = (by, body) => r.go(`translationdraft?by=${by}&viewer=${by}`, "POST", body);
  const TO_LANG = { language: "es", direction: "to_language", keys: ["nav.home"] };
  const TO_EN = { language: "es", direction: "to_english", key: "nav.home" };
  const want = (body, by) => ({ language: body.language, direction: body.direction, keys: body.keys, key: body.key, by });
  /* the handler's own first refusal wins, kept away or not, and is answered as given */
  assistant(r, false);
  for (const [body, by, refusal] of [[TO_LANG, "member:bea", { ok: false, reason: "TRANSLATION_NOT_GRANTED", code: "TRANSLATION_NOT_GRANTED" }],
                                     [TO_EN, "member:bea", { ok: false, reason: "NOT_AN_ADMIN", code: "NOT_AN_ADMIN" }],
                                     [{ language: "es", direction: "sideways" }, "member:ann", { ok: false, reason: "TRANSLATION_DIRECTION_UNKNOWN" }]]) {
    first.value = refusal; first.asked.length = 0;
    assert.deepEqual((await draft(by, body)).json.result, refusal, JSON.stringify(body));
    assert.deepEqual(first.asked, [want(body, by)]);
  }
  assert.deepEqual(reads, { account: 0, use: 0 });
  /* past it, kept away: credentials' refusal as given, nothing read, nothing routed */
  first.value = null;
  for (const body of [TO_LANG, TO_EN]) assert.deepEqual((await draft("member:ann", body)).json.result, C.aiKeptAway(), body.direction);
  assert.deepEqual([reads, seen], [{ account: 0, use: 0 }, []]);
  assistant(r, true);
  /* then the account and the ceilings */
  assert.equal(code(await draft("member:ann", TO_LANG)), "AI_NO_ACCOUNT");
  assert.equal((await C.accountReferenceSet({ member: "member:ann", kind: "apikey", secret: "sk-ann-own-secret", by: "member:ann" })).ok, true);
  const runs = aiRunsOf(r.ctx);
  runs.countAskUsage({ member: "member:ann", mode: "draft", usage: USE, calls: 2 });
  assert.equal(runs.aiCopyCeilingSet({ calls: 2, by: "admin" }).ok, true);
  assert.equal(code(await draft("member:ann", TO_EN)), "AI_USE_COPY_CEILING_REACHED");
  assert.equal(runs.aiCopyCeilingSet({ calls: null, by: "admin" }).ok, true);
  assert.deepEqual(seen, [], "no draft routed before every refusal is cleared");
  /* admitted, both directions */
  const forged = { on: true, account: { kind: "apikey", level: "member", key: "sk-forged" } };
  const A = { on: true, account: { kind: "apikey", level: "member" } };
  for (const body of [TO_LANG, TO_EN]) assert.equal(code(await draft("member:ann", { ...body, assistant: forged })), "ASSISTANT_DRAFT_UNAVAILABLE");
  assert.deepEqual(seen, [["translationdraft", { ...want(TO_LANG, "member:ann"), assistant: A }],
                          ["translationdraft", { ...want(TO_EN, "member:ann"), assistant: A }]]);
  for (const s of ["sk-ann-own-secret", "sk-forged"]) assert.equal(JSON.stringify(seen).includes(s), false, s);
});

test("R10 (K1755; control-plane R29, R30): a draft's handler receives `assistant` as the door resolved it — `{on: true, account: {kind, level}}`, the member's own account or the group's key, never the key — its own arguments from the body and `by` and `viewer` as stamped; a caller's `assistant` is never read (negative control: no secret appears in anything handed over or answered)", async () => {
  const { r, C, seen } = await drafts();
  assistant(r, true);
  assert.equal((await C.accountReferenceSet({ member: "member:bea", kind: "apikey", secret: "sk-bea-own-secret", by: "member:bea" })).ok, true);
  assert.equal((await C.groupKeySet({ key: "sk-group-key-secret", by: "admin" })).ok, true);
  assert.equal(C.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  assert.equal(C.groupKeyNoticeSeen({ member: "member:ann", by: "member:ann" }).ok, true);
  const forged = { on: true, account: { kind: "apikey", level: "member", key: "sk-forged" } };
  const a = await r.go("groupdescriptiondraft?by=member:ann&viewer=member:ann", "POST",
                       { answers: [{ question: "Who are you?", text: "Tenants" }], assistant: forged });
  const b = await r.go("writinghelp?by=member:bea&viewer=member:bea", "POST",
                       { op: "notewrite", field: "text", told: "the lift was out", draftHeld: false, assistant: forged });
  assert.deepEqual(seen, [
    ["groupdescriptiondraft", { answers: [{ question: "Who are you?", text: "Tenants" }],
                                assistant: { on: true, account: { kind: "apikey", level: "group" } }, viewer: "member:ann", by: "member:ann" }],
    ["writinghelp", { op: "notewrite", field: "text", told: "the lift was out", draftHeld: false,
                      assistant: { on: true, account: { kind: "apikey", level: "member" } }, by: "member:bea", viewer: "member:bea" }],
  ]);
  const all = JSON.stringify([seen, a.json, b.json]);
  for (const s of ["sk-bea-own-secret", "sk-group-key-secret", "sk-forged"]) assert.equal(all.includes(s), false, s);
});

test("R10 (K2238; control-plane R65; credentials R35, R43): the store-internal routes `aikeptaway` and `subscriptionconnected` answer credentials' own words — `aiKeptAway()` as given while the group keeps its material away and `{ok: true}` while it does not; `subscriptionConnected` for the member the stamped `by`, whatever the body names (negative control: a member not active is credentials' own refusal, recording nothing)", async () => {
  const { r, C } = await drafts();
  assistant(r, false);
  const kept = await r.go("aikeptaway", "POST", {});
  assert.deepEqual([kept.status, kept.json.result], [200, C.aiKeptAway()]);
  assert.equal(kept.json.result.reason, "AI_KEPT_AWAY");
  assistant(r, true);
  assert.deepEqual((await r.go("aikeptaway", "POST", {})).json.result, { ok: true });
  const asked = [];
  const orig = C.subscriptionConnected.bind(C);
  C.subscriptionConnected = (a) => { asked.push(a); return orig(a); };
  const ok = await r.go("subscriptionconnected?by=member:bea", "POST", { member: "member:ann", login: "code-x" });
  assert.equal(ok.json.result.ok, true, JSON.stringify(ok.json));
  const no = await r.go("subscriptionconnected?by=member:nobody", "POST", {});
  assert.equal(no.json.result.reason, "ACCOUNT_MEMBER_NOT_ACTIVE");
  assert.deepEqual(asked, [{ member: "member:bea" }, { member: "member:nobody" }]);
  assert.deepEqual(r.db.prepare("SELECT member_id FROM subscription_connections").all().map((x) => x.member_id), ["bea"]);
});

test("R12: no place is named in this module's behaviour or outward text — every answer the door itself builds (BAD_JSON, unknown op, the internal error, both hold refusals), every reason it lists for a read naming no project, and the filed record and the sentences of the pull (negative control: the pattern finds a place)", async () => {
  const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|emeryville|contra costa)\b/i;
  assert.match("Oakland", PLACES);
  const texts = [];
  const s = { routes: () => ({ boom: () => { throw new Error("x"); }, purge: () => ({ ok: true }) }), membership: () => null,
              namespace: () => "bio", purgeHeld: () => true };
  texts.push((await go(s, "x", { method: "POST", body: "{" })).json, (await go(s, "nosuch")).json,
             (await quietly(() => go(s, "boom"))).value.json, (await go(s, "purge")).json, (await go(s, "purge?bundleId=B-1")).json);
  texts.push(D.PROJECT_NAMING_READS_NOT, D.PROJECT_NAMING_READS, P.PULL_BUNDLE_SLUG);
  for (const t of texts) assert.doesNotMatch(JSON.stringify(t), PLACES);
  /* the pull's filed bundle and its answers */
  const r = await record();
  const k = (await r.go("knock?source=203.0.113.9", "POST", { content: "material", note: "n", now: Date.now() })).json.result;
  const p = await r.go("inboxpullfile?by=ann&identity=member:ann&viewer=member:ann", "POST", { knockId: k.knockId });
  assert.equal(p.json.result.ok, true);
  const { recordOf } = await import("../../../src/record-core/index.mjs");
  assert.doesNotMatch(recordOf(r.ctx).readFile(p.json.result.bundle.bundleId, "bundle.md").text, PLACES);
  assert.doesNotMatch(JSON.stringify(p.json), PLACES);
});
