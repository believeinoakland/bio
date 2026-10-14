/* plane T47's composition (T47-66; N908, N955, N961, N981, N993, N1002; K3030, K3084, K3089, K3137): instance-setup's
   disclosure read registered with credentials (R44); case-inputs' and action-records' maps spread before their source
   modules' and the route map re-pinned to T47's ops (R45, R48); the Store's `dispatchMemberRun` RPC taking no
   credential (R46); a draft grant's `op=rule` read opened with the draft use (answers R35); and the plane's global scope
   measured against bundler R31's budget (R43). R47 is t46.test.mjs' (the sign-in's held token on the wire). Each test
   drives the plane at its interface (construction over a storage, the object's door and RPC, the built artifact) and
   carries a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { relative } from "node:path";
import { store } from "./fixture.mjs";
import { MODULE_MAPS, ownMaps } from "./maps.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { instanceSetupOf, ASSISTANT_DISCLOSURE } from "../../../src/setup.mjs";
import { caseInputsOf, caseInputsOps } from "../../../src/case-inputs/index.mjs";
import { caseAuthoringOf, caseAuthoringOps } from "../../../src/case-authoring/index.mjs";
import { actionRecordsOf, actionRecordsOps } from "../../../src/action-records/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { aiRunsOf } from "../../../src/ai-runs/index.mjs";
import { answersOf } from "../../../src/answers/index.mjs";
import { draftOnObject } from "../../../src/plane/ask.mjs";

/* Instants and minted ids differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");
const SESSION = "s".repeat(64);
const member = (x, id, role = "member") => x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status,
  capabilities, created, updated) VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);

/* ===== R44 (T47; N981; K3030; credentials R64) ===== */

test("R44 (T47; N981; credentials R64, R22; instance-setup R54): at start the plane registers instance-setup's disclosureOf with credentials once, so through the door a member with no disclosure recorded is refused DISCLOSURE_DUE at accountreferenceset and admitted once disclosureshown records it; a second registration is refused LISTENER_DECLARED", async () => {
  const x = await store({ env: { ACCOUNT_SEAL_SECRET: "a-long-seal-secret-for-the-t47-test" } });
  member(x, "ann");
  const set = async () => JSON.parse(await (await x.fetch("/accountreferenceset?by=member:ann&viewer=member:ann",
    { method: "POST", body: JSON.stringify({ member: "member:ann", kind: "apikey", secret: "sk-ant-zz-ann" }) })).text());
  const refused = await set();
  assert.equal(refused.result.ok, false, JSON.stringify(refused));
  assert.equal(refused.result.reason, "DISCLOSURE_DUE", JSON.stringify(refused));
  assert.equal(credentialsOf(x.ctx).accountReferenceState({ member: "member:ann", viewer: "member:ann" }).reference ?? null, null,
               "nothing was set");
  /* the read is instance-setup's, on this object's one instance */
  assert.equal(credentialsOf(x.ctx).disclosureDue({ member: "member:ann" }).reason, "DISCLOSURE_DUE");
  const shown = JSON.parse(await (await x.fetch("/disclosureshown?by=member:ann&viewer=member:ann",
    { method: "POST", body: JSON.stringify({ member: "member:ann", version: ASSISTANT_DISCLOSURE.version }) })).text());
  assert.equal(shown.result.ok, true, JSON.stringify(shown));
  assert.equal(instanceSetupOf(x.ctx).disclosureOf({ member: "member:ann" }).shown, true);
  const admitted = await set();
  assert.equal(admitted.result.ok, true, JSON.stringify(admitted));
  /* the plane's registration is held: a second, whoever makes it, is refused */
  const again = credentialsOf(x.ctx).registerDisclosureRead("zz-probe", () => ({ shown: true }));
  assert.deepEqual([again.ok, again.reason], [false, "LISTENER_DECLARED"], JSON.stringify(again));
  /* negative control: another member, never shown it, is still refused */
  member(x, "bob");
  assert.equal(credentialsOf(x.ctx).disclosureDue({ member: "member:bob" }).reason, "DISCLOSURE_DUE");
});

/* ===== R45, R48 (T47; N908, N961; op-declarations R57–R59, R61; tasks R19): the route map ===== */

test("R45 (T47; N908, N961; case-inputs R16, action-records R15): case-inputs' map is spread directly before case-authoring's and action-records' directly before actions', each over the one instance its source module's factory creates, so statementack, whatchangedpropose, whatchangeddrafts and action-records' acts answer through the door what that instance's map answers; control: case-authoring's map no longer holds case-inputs' ops", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const names = MODULE_MAPS.map(([m]) => m);
  assert.equal(names.indexOf("case-inputs"), names.indexOf("case-authoring") - 1, "case-inputs directly before case-authoring");
  assert.equal(names.indexOf("action-records"), names.indexOf("actions") - 1, "action-records directly before actions");
  assert.equal(caseAuthoringOf(x.ctx).inputs, caseInputsOf(x.ctx), "case-authoring's own case-inputs is the one routed");
  assert.equal(actionsOf(x.ctx).records, actionRecordsOf(x.ctx), "actions' own action-records is the one routed");
  const keys = Object.keys(x.s.routes(u, null));
  const ci = Object.keys(caseInputsOps(caseInputsOf(x.ctx), u, null));
  const ar = Object.keys(actionRecordsOps(actionRecordsOf(x.ctx), u, null));
  assert.deepEqual(ci, ["whatchangedpropose", "whatchangeddrafts", "statementack"]);
  assert.equal(ar.length, 6);
  /* at their places: case-inputs' ops directly before case-authoring's first own op */
  const firstCa = Object.keys(caseAuthoringOps(caseAuthoringOf(x.ctx), u, null))[0];
  assert.deepEqual(keys.slice(keys.indexOf(firstCa) - ci.length, keys.indexOf(firstCa)), ci);
  const at = keys.indexOf(ar[0]);
  assert.deepEqual(keys.slice(at, at + ar.length), ar, "action-records' acts at its place");
  for (const op of ci) assert.equal(Object.hasOwn(caseAuthoringOps(caseAuthoringOf(x.ctx), u, null), op), false, op);
  const paths = [...ci.map((op) => [caseInputsOps, caseInputsOf, `${op}?case=CASE-2026-none&draft=D-none&edition=1&viewer=member:nobody&author=member:nobody`]),
                 ...ar.map((op) => [actionRecordsOps, actionRecordsOf, `${op}?target=ACTN-2026-0009-none&viewer=member:nobody&author=member:nobody&proposer=member:nobody`])];
  for (const [ops, of, path] of paths) {
    const op = path.split("?")[0];
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const direct = await ops(of(twin.ctx), new URL(`http://do/${path}`), {})[op]();
    assert.equal(res.status, 200, op);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct ?? null }))), op);
  }
  /* negative control: an op of neither map is no route */
  assert.equal(keys.includes("statementackzz"), false);
});

/* T47's new ops served through owners' maps (op-declarations R57–R59, R61; tasks R19; R45's list), each to be reached
   through the door. `signintrace` is the Worker door's own (control-plane R87), never a store route, so not listed. */
const T47_OPS = ["projectlist", "projectquestions", "drawquestion", "projectbarset", "monitorset", "peopledirectory",
  "unlock", "reauth", "passwordresetlink", "passwordresetlook", "passwordreset",
  "grouplogoset", "grouplanguagesset", "grouplanguages", "signrequest"];

test("R45, R48 (T47; op-declarations R57–R59, R61; tasks R19): the route map is re-pinned to T47's new ops: each is in the map of the module that serves it, in the route map, and answers through control-plane's door what that map answers called directly; an op no map serves is no route", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  for (const op of T47_OPS) {
    const owner = ownMaps(x.ctx, u, null, x.env).find(([, m]) => Object.hasOwn(m, op));
    assert.ok(owner, `no module's map serves ${op}`);
    assert.ok(keys.includes(op), `the route map lacks ${op}`);
    const path = `${op}?viewer=member:nobody&by=member:nobody&author=member:nobody&project=PROJ-2026-none&case=CASE-2026-none&edition=1`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const fn = MODULE_MAPS.find(([m]) => m === owner[0])[1];
    let direct;
    try { direct = await fn(twin.ctx, new URL(`http://do/${path}`), {}, twin.env)[op](); } catch (e) { direct = { threw: String(e) }; }
    assert.equal(res.status, 200, `${op} (${owner[0]})`);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct ?? null }))), op);
  }
  assert.equal(keys.includes("signintrace"), false, "the sign-in trace is the Worker door's, no store route");
  assert.equal(keys.includes("zzprobe47"), false);
});

/* ===== R46 (T47; N955; ai-runs R18; credentials R63) ===== */

test("R46 (T47; N955; ai-runs R18, credentials R63): the Store's RPC dispatchMemberRun takes no credential: ai-runs is handed only run, by, viewer and at, so a sentinel `credential` in the args dispatches as a call without it and reaches no request the plane makes; control: the same call with no credential answers alike", async () => {
  const sent = [];
  const binding = { fetch: async (u, init) => { sent.push(String(u) + (init && init.body ? String(init.body) : "")); return new Response("{}"); } };
  const x = await store({ env: { AGENT_WORKER: binding, AGENT_RUNNER: binding } });
  const ai = aiRunsOf(x.ctx), was = ai.dispatchMemberRun.bind(ai), seen = [];
  ai.dispatchMemberRun = async (a) => { seen.push(a); return was(a); };
  try {
    const SENTINEL = "aik-sentinel-credential-t47";
    const args = { run: "RUN-2026-0009-none", by: "member:ann", viewer: "member:ann", at: "2026-10-14T00:00:00Z" };
    const r = await x.s.dispatchMemberRun({ ...args, credential: SENTINEL });
    assert.deepEqual(seen, [args], "ai-runs reached once, with no credential");
    const control = await x.s.dispatchMemberRun(args);
    assert.deepEqual(seen[1], args);
    assert.deepEqual(JSON.parse(mask(JSON.stringify(r))), JSON.parse(mask(JSON.stringify(control))), "dispatched as one without it");
    assert.equal(JSON.stringify(r).includes(SENTINEL), false);
    assert.equal(sent.some((s) => s.includes(SENTINEL)), false, "no request carries it");
    /* no args is ai-runs' own answer to none */
    await x.s.dispatchMemberRun();
    assert.deepEqual(seen.at(-1), {});
  } finally { ai.dispatchMemberRun = was; }
});

/* ===== answers R35 (T47; K3089): a draft grant's `op=rule` read ===== */

test("R33 (T47; K3089; answers R35, R30): a grant the draft path minted whose first read is op=rule opens its read log with use `draft`, the plane's stamp, whatever use the caller's address names; control: an ask's grant opens it with `ask`", async () => {
  const asks = [];
  const env = { ACCOUNT_SEAL_SECRET: "a-long-seal-secret-for-the-t47-test", AGENT_WORKER: { fetch: async (u, init) => {
    asks.push([u, JSON.parse(init.body)]);
    return new Response(JSON.stringify({ ok: true, draft: { text: "t" }, label: { kind: "machine" } }), { status: 200 }); } } };
  const { deployed, GATE_FLAGS, GATE_SET, GATE_PARTS } = await import("./fixture.mjs");
  const { assistantGateOf } = await import("../../../src/plane/ask.mjs");
  const x = await store({ env, before: (ctx) => assistantGateOf(ctx, { flags: GATE_FLAGS, testSet: GATE_SET }) });
  await deployed(x.ctx, GATE_PARTS);
  member(x, "ada", "admin");
  member(x, "ann");
  const c = credentialsOf(x.ctx);
  assert.equal(c.aiKeepAwaySet({ on: false, by: "ada" }).ok, true);
  x.ctx.storage.sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`,
                         createHash("sha256").update(SESSION).digest("hex"), Date.now() + 3600e3);
  assert.equal(instanceSetupOf(x.ctx).disclosureShown({ member: "member:ann", version: ASSISTANT_DISCLOSURE.version, by: "member:ann" }).ok, true);
  assert.equal((await c.accountReferenceSet({ member: "member:ann", kind: "apikey", secret: "sk-ant-zz-ann", by: "member:ann" })).ok, true);
  assert.equal((await c.accountUsesSet({ owner: "member:ann", switch: "suggestions", on: true, by: "member:ann" })).ok, true);
  assert.equal(answersOf(x.ctx).ruleServicesSwitch({ on: true, by: "member:ada" }).ok, true);
  const d = await (await draftOnObject(x.ctx, x.env, { op: "writinghelp", member: "ann", session: SESSION, told: "t", act: "conclude", field: "reason" })).json();
  assert.match(d.grant, /^[0-9a-f]{64}$/, JSON.stringify(d));
  const rule = (grant) => x.fetch("/rule?service=profiles&viewer=member:ann&use=ask", { method: "POST", headers: { "x-bio-grant": grant }, body: "{}" });
  const rr = await rule(d.grant);
  assert.equal(rr.status, 200);
  assert.equal(JSON.parse(await rr.text()).result.ok, true, "the rule service answered");
  assert.equal(answersOf(x.ctx).readLog(d.grant).use, "draft", "the draft grant's log opened as a draft");
  /* control: an ask's grant */
  const g = await c.aiGrantMint({ member: "member:ann", by: "member:ann", session: SESSION });
  assert.equal(g.ok, true, JSON.stringify(g));
  await rule(g.token);
  assert.equal(answersOf(x.ctx).readLog(g.token).use, "ask");
});

/* ===== R43 (T47; N993; bundler R31; K3147) ===== */

test("R43 (T47; N993; bundler R31; K3147): the plane's global scope is measured as bundler's fleetbundles measures it (a fresh import of the built artifact, five times) and printed beside R31's 500 ms budget, a time past it a warning (the cause named, PLANE #35 J1), never a failure; control: a run that cannot be measured fails", async () => {
  const { planeMember, buildMember, measureStart, startVerdict, BUDGET } = await import("../../../scripts/fleet-bundle.mjs");
  const { writeFileSync, mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  assert.equal(BUDGET.startWarnMs, 500, "R31's budget, never raised here");
  const m = planeMember();
  const dir = mkdtempSync(join(tmpdir(), "plane-r43-"));
  try {
    const out = join(dir, "bio-plane.bundled.mjs");
    writeFileSync(out, (await buildMember(m)).bytes);
    const runs = [];
    for (let i = 0; i < 5; i++) {
      const r = await measureStart(m, { artifact: relative(m.abs, out) });
      assert.equal(r.measured, true, r.reason);
      runs.push(r.ms);
    }
    const median = [...runs].sort((a, b) => a - b)[2];
    const v = startVerdict(m, median, BUDGET);
    console.log(`R43: the plane's global scope, five fresh imports: ${runs.map((ms) => ms.toFixed(0)).join(", ")} ms; median `
      + `${median.toFixed(0)} ms, budget ${BUDGET.startWarnMs} ms: ${v.verdict}${v.warning ? ` (${v.warning})` : ""}`);
    assert.ok(runs.every((ms) => ms > 1), "a fresh import evaluates the artifact, never a cached module");
    assert.ok(["ok", "warn"].includes(v.verdict), "past the budget is a warning, never a failure (R31)");
    /* control: an artifact that cannot be read is unmeasured, which is a failure */
    const none = await measureStart(m, { artifact: relative(m.abs, join(dir, "absent.mjs")) });
    assert.equal(none.measured, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

/* ===== R48 (T47; N1002; DEC-201; control-plane R81, R82; interface-shell R28): the composed page ===== */

/* The nine screen modules whose `SCREENS` the page the plane serves is composed from (`screens-entry` among them). */
const SCREEN_MODULES = ["screens-entry", "screens-settings", "screens-intake", "screens-daily", "screens-inquiry",
                        "screens-wizards", "screens-investigate", "screens-publish", "screens-action"];

test("R48 (T47; N1002; DEC-201; control-plane R81, R82): the page the plane's Worker serves at /app and at / is composed from the nine screen modules' screens, screens-entry among them: every screen of each is drawn by the page (its render carried in the page's script); control: a screen of no module is not", async () => {
  const worker = (await import("../../../src/plane/index.mjs")).default;
  const env = { STORE: { idFromName: (n) => n, get: () => ({}) }, VERSION: "t47" };
  const pages = {};
  for (const path of ["/app", "/"]) {
    const res = await worker.fetch(new Request(`https://bio.example.workers.dev${path}`), env, {});
    assert.equal(res.status, 200, path);
    assert.match(res.headers.get("content-type") || "", /^text\/html/, path);
    pages[path] = await res.text();
  }
  let screens = 0;
  for (const mod of SCREEN_MODULES) {
    let SCREENS;
    try { ({ SCREENS } = await import(`../../../src/${mod}/index.mjs`)); } catch (e) { assert.fail(`${mod}: ${String(e && e.message).split("\n")[0]}`); }
    assert.ok(Array.isArray(SCREENS) && SCREENS.length > 0, `${mod} offers screens`);
    for (const s of SCREENS) {
      screens++;
      for (const [path, page] of Object.entries(pages))
        assert.ok(page.includes(String(s.render)), `${path}: ${mod}'s ${s.id} is not drawn by the page`);
    }
  }
  assert.ok(screens >= SCREEN_MODULES.length);
  /* negative control: a render no module offers is not in the page */
  const probe = function render() { return "zz-probe-screen-t47"; };
  assert.equal(pages["/app"].includes(String(probe)), false);
});
