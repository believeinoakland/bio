/* legacy-store: the four layer-8 and layer-9 modules whose ops its dispatch carries (K671, K704, K711): public-read,
   project-stage, action-clocks and action-plans. Each op of each module's own map is reached through the store's route
   map, answering exactly what the module's own map answers for the same request on the same host; and action-plans'
   planning-run check stands at ai-runs from the store's construction, before any route runs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";
import { projectStageOf, projectStageOps } from "../../../src/project-stage/index.mjs";
import { actionClocksOf, actionClocksOps } from "../../../src/action-clocks/index.mjs";
import { actionPlansOf, actionPlansOps } from "../../../src/action-plans/index.mjs";
import { aiRunsOf } from "../../../src/ai-runs/index.mjs";

/* Each module's map, built on a host as the store builds it. The request names no record object and carries a viewer
   and author no one is, so every act refuses and writes nothing: the two answers can be compared. */
const MODULES = {
  "public-read": (ctx, url) => publicReadOps(publicReadOf(ctx), url),
  "project-stage": (ctx, url) => projectStageOps(projectStageOf(ctx), url),
  "action-clocks": (ctx, url, body) => actionClocksOps(actionClocksOf(ctx), url, body),
  "action-plans": (ctx, url, body) => actionPlansOps(actionPlansOf(ctx), url, body),
};
const QUERY = "?viewer=member:nobody&author=member:nobody&proposer=token:ai&id=X-none&plan=PLN-none&project=PROJ-none"
  + "&target=ACT-none&sha256=" + "0".repeat(64);
const strip = (v) => JSON.parse(JSON.stringify(v ?? null));

test("every op of public-read, project-stage, action-clocks and action-plans is reached through the store's dispatch, answering as the module's own map does", async () => {
  const x = await store();
  const url = new URL("http://do/x" + QUERY);
  const map = x.s.routes(url, {});
  let n = 0;
  for (const [mod, ops] of Object.entries(MODULES)) {
    const own = ops(x.ctx, url, {});
    assert.ok(Object.keys(own).length > 0, `${mod} publishes ops`);
    for (const op of Object.keys(own)) {
      assert.ok(Object.hasOwn(map, op), `${mod}'s op=${op} is a route of the store`);
      const viaStore = strip(await map[op]());
      const direct = strip(await ops(x.ctx, url, {})[op]());
      assert.deepEqual(viaStore, direct, `${mod}'s op=${op} answers through the store as through its own map`);
      n++;
    }
  }
  assert.equal(n, 5 + 1 + 2 + 15);
});

test("each such op answers through the store's route map as the plane's frame calls it, a promise-answering op awaited to its answer (K711)", async () => {
  const x = await store();
  for (const op of ["publishedlist", "projectstage", "reminderset", "plans", "optionpropose"]) {
    const r = await x.call("/" + op + QUERY, {});
    assert.ok(r && typeof r === "object" && Object.keys(r).length > 0, `op=${op} answers its own result`);
  }
  const pending = x.routes("/optionpropose" + QUERY, {}).optionpropose();
  assert.ok(pending instanceof Promise, "op=optionpropose answers a promise");
  assert.equal((await pending).code, "NO_SUCH_PLAN");
});

test("action-plans' planning-run check stands at ai-runs from the store's construction (K711)", async () => {
  const x = await store();
  const second = aiRunsOf(x.ctx).registerOpenCheck("probe", "plan", () => null);
  assert.equal(second.ok, false);
  assert.equal(second.code, "LISTENER_DECLARED");
  assert.match(second.detail, /action-plans/);
});
