/* plane T45's composition (R39, R14; K2781 (1), K2815, K2839, K2858, K2874; the plan's reconciliation R19; M-T45-5):
   the five new modules built at their places, migrated and routed; every registration a T45 module makes with an earlier
   one held once before the first request; and `action-holds`' `purgeHeld` the reader the door is handed (hold.test.mjs).
   Each module's own behaviour is its own tests'; these check the composition through the plane's interface:
   construction over a storage, the route map and the object's door. Each test carries a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { MODULE_MAPS } from "./maps.mjs";
import { actionHoldsOf, actionHoldsOps, ACTION_HOLDS_TABLES } from "../../../src/action-holds/index.mjs";
import { actionRepliesOf, actionRepliesOps, ACTION_REPLIES_TABLES } from "../../../src/action-replies/index.mjs";
import { planWorkOf, planWorkOps, PLAN_WORK_TABLES } from "../../../src/plan-work/index.mjs";
import { caseCheckOf, caseCheckOps, CASE_CHECK_TABLES } from "../../../src/case-check/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { actionPlansOf } from "../../../src/action-plans/index.mjs";
import { doorbellOf } from "../../../src/doorbell/index.mjs";
import { ratificationOf } from "../../../src/ratification/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import { stepsOf } from "../../../src/steps/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { consequencesModule } from "../../../src/consequences/index.mjs";
import { conformanceOf } from "../../../src/conformance/index.mjs";
import { followingOf, followingOps } from "../../../src/following/index.mjs";
import { filingsOf } from "../../../src/filings/index.mjs";
import { projectRosterOf } from "../../../src/project-roster/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const nameOf = (t) => (typeof t === "string" ? t : t.name);
const NEW_TABLES = Object.freeze({
  "action-holds": ACTION_HOLDS_TABLES.map(nameOf), "action-replies": ACTION_REPLIES_TABLES.map(nameOf),
  "plan-work": PLAN_WORK_TABLES.map(nameOf), "case-check": CASE_CHECK_TABLES.map(nameOf),
});
const tables = (x) => new Set([...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name));
/* Which module declared table `t` to purge (record-core R21): a probe's declaration is refused naming its holder. */
const declaredBy = (ctx, t) => recordOf(ctx).declarePurge("zz-probe", [t]).declaredBy ?? null;

test("R39 (T45; K2781 (1)): a fresh store holds every table action-holds, action-replies, plan-work and case-check declare, each declared to purge under its own module", async () => {
  const x = await store();
  const have = tables(x);
  for (const [mod, list] of Object.entries(NEW_TABLES)) {
    assert.ok(list.length > 0, mod);
    for (const t of list) {
      assert.ok(have.has(t), `${mod}: ${t}`);
      assert.equal(declaredBy(x.ctx, t), mod, `${t} is declared by ${mod}`);
    }
  }
  /* negative control: a name no module declares is declared by none */
  assert.equal(have.has("zz_not_a_table"), false);
});

test("R39, R3: a store written before T45's modules opens with their tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  /* the store as an earlier release left it: none of T45's new tables */
  for (const list of Object.values(NEW_TABLES)) for (const t of list) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(NEW_TABLES["action-holds"].some((t) => tables(first).has(t)), false, "armed: the tables are gone");
  const migrated = await store({ db });
  for (const list of Object.values(NEW_TABLES)) for (const t of list) assert.ok(tables(migrated).has(t), t);
  const schema = () => [...db.prepare(`SELECT type, name, sql FROM sqlite_master ORDER BY type, name`).all()].map((r) => ({ ...r }));
  const before = schema();
  await store({ db });
  assert.deepEqual(schema(), before, "a second construction changes no table");
});

test("R39 (K2815, reconciliation R19; doorbell R3, ratification R45, case-authoring R70, steps R29, standards R53, consequences R19, plan-work R9, action-plans R44, actions R95): every T45 registration is held once before the first request, by the module that now owns it; a second is refused by its door", async () => {
  const x = await store(), c = x.ctx, f = () => ({});
  const held = (r, by, label) => {
    assert.equal(r.ok, false, `${label}: ${JSON.stringify(r)}`);
    if (by) assert.equal(r.module, by, `${label} is held by ${by}`);
  };
  held(doorbellOf(c).registerReader("litigation-hold", "zz-probe", f), "action-holds", "doorbell's litigation-hold reader");
  assert.equal(ratificationOf(c).registerHoldReader({ holdsOn: f }).reason, "HOLD_READER_DECLARED", "ratification's hold reader");
  held(caseAuthoringOf(c).registerOpenRequests("zz-probe", { openRequestsOn: f }), "action-replies", "case-authoring's open requests");
  held(stepsOf(c).registerDueHolder("zz-probe", f), "action-clocks", "steps' due holder");
  held(standardsOf(c).registerOwnSendingCheck("zz-probe", f), "actions", "standards' own-sending check");
  held(consequencesModule(c).registerOwnActReader(f, "zz-probe"), "actions", "consequences' own-act reader");
  held(planWorkOf(c).registerWatchReader("zz-probe", f), "following", "plan-work's watch reader");
  held(actionPlansOf(c).registerCloseSnapshot("zz-probe", f), "plan-work", "action-plans' close snapshot");
  assert.deepEqual(planWorkOf(c).registered, { close_snapshot: { ok: true, module: "plan-work" },
                                               response_listener: { ok: true, module: "plan-work" } });
  assert.deepEqual(followingOf(c).registered, { ok: true, module: "following" });
  held(actionsOf(c).registerResponseListener("plan-work", f), null, "actions' response listener, plan-work's once");
  /* negative control: a response listener of another module is not refused (actions R95 holds one per module) */
  assert.equal(actionsOf(c).registerResponseListener("zz-probe", f).ok, true);
});

test("R39 (K2858, K2874; P8: K1654): the T45 readers are handed the plane's own instances — filings action-holds, the project roster and case-check; following plan-work and action-plans; plan-work action-holds — and conformance, built before actions, holds the seeded offices' read", async () => {
  const x = await store(), c = x.ctx;
  const fil = filingsOf(c);
  assert.equal(fil.actionHolds, actionHoldsOf(c));
  assert.equal(fil.projectRoster, projectRosterOf(c));
  assert.equal(fil.caseCheck, caseCheckOf(c));
  assert.equal(followingOf(c).planWork, planWorkOf(c));
  assert.equal(followingOf(c).actionPlans, actionPlansOf(c));
  assert.equal(planWorkOf(c).actionHolds, actionHoldsOf(c));
  /* K1654: conformance's office port is the plane's (instance-setup R50), answering null until instance-setup does */
  assert.equal(typeof conformanceOf(c).officeEntityOf, "function");
  assert.equal(conformanceOf(c).officeEntityOf({ role: "Clerk", body: "nobody" }), null);
  /* the project roster is migrated at start (K2858): its tables exist before any read */
  for (const t of ["project_scopes", "project_approval_settings"]) assert.ok(tables(x).has(t), t);
  /* negative control: a second store's instances are its own */
  const y = await store();
  assert.notEqual(filingsOf(y.ctx).actionHolds, actionHoldsOf(c));
});

/* Instants and minted ids differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

test("R39, R5 (op-declarations R49; K2839): every op of action-holds', action-replies', plan-work's and case-check's maps is in the route map, each map at its place, and an op of each answers through the door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const names = MODULE_MAPS.map(([m]) => m);
  for (const [mod, after] of [["action-holds", "actions"], ["action-replies", "action-clocks"], ["plan-work", "action-plans"],
                              ["case-check", "review"]])
    assert.equal(names.indexOf(mod), names.indexOf(after) + 1, `${mod}'s map directly after ${after}'s`);
  const maps = { "action-holds": [actionHoldsOps, actionHoldsOf], "action-replies": [actionRepliesOps, actionRepliesOf],
                 "plan-work": [planWorkOps, planWorkOf], "case-check": [caseCheckOps, caseCheckOf] };
  for (const [mod, [ops]] of Object.entries(maps)) {
    const own = Object.keys(ops({}, u, null));
    assert.ok(own.length > 0, mod);
    for (const op of own) assert.ok(keys.includes(op), `${mod}: the route map lacks ${op}`);
  }
  assert.deepEqual(Object.keys(caseCheckOps({}, u, null)), ["publishcheck", "casecheck"]);
  for (const [mod, path] of [["action-holds", "projectholds?viewer=member:nobody&projects=PROJ-2026-none"],
                             ["action-replies", "actionreplybearing?viewer=member:nobody&author=member:nobody&target=ACT-2026-none"],
                             ["plan-work", "matters?plan=PLAN-2026-none&viewer=member:nobody"],
                             ["case-check", "casecheck?case=CASE-2026-none&viewer=member:nobody"]]) {
    const [ops, of] = maps[mod];
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const op = path.split("?")[0];
    const direct = await ops(of(twin.ctx), new URL(`http://do/${path}`), {})[op]();
    assert.equal(res.status, 200, `${mod} ${op}`);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), `${mod} ${op}`);
  }
  /* K2874: following's new ops (FOLLOWING #5) are in its map and so routed */
  for (const op of ["followend", "watchlink", "watchanswer", "watchquestions"]) {
    assert.ok(Object.keys(followingOps(followingOf(x.ctx), u, null)).includes(op), op);
    assert.ok(keys.includes(op), op);
  }
  /* negative control: an op of no module's map is no route */
  assert.equal(keys.includes("zzprobe"), false);
  assert.equal((await x.fetch("/zzprobe", { method: "POST", body: "{}" })).status === 200, false);
});
