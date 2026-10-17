/* journey-check R15 (N1162; `agent-worker` wrangler config; `installer` R59; amends R11): the local world gives the
   agent-worker it runs under Miniflare its `SEGMENTS` Durable Object (`SegmentDriver`, with its migration), as the
   installed worker has it, so a run's segment outlives the request that started it. The walk's own step-9 failure by name
   is run in journey.test.mjs (R15's control); here the world's configuration is read against the worker's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { planeOptions, AGENT_WORKER, AGENT_WORKER_ENTRY } from "../../../src/journey-check/local.mjs";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const BINDINGS = [{ type: "plain_text", name: "VERSION", text: "1" }];
const agentOf = (o) => o.opts.workers.find((w) => w.name === AGENT_WORKER);

test("R15: the agent-worker of the local world is given SEGMENTS as SegmentDriver, a SQLite class (its migration), beside RUNNER", () => {
  const a = agentOf(planeOptions(BINDINGS, { dir: "/tmp/x", name: "plane", outbound: () => new Response("") }));
  assert.deepEqual(a.durableObjects.SEGMENTS, { className: "SegmentDriver", useSQLite: true });
  assert.equal(a.durableObjects.RUNNER.className, "AgentRunner");
  /* it is the binding and class the worker's own configuration declares, and the worker exports the class */
  const wrangler = readFileSync(join(ROOT, "agent-worker", "wrangler.jsonc"), "utf8");
  assert.match(wrangler, /"name": "SEGMENTS", "class_name": "SegmentDriver"/);
  assert.match(wrangler, /"new_sqlite_classes": \["SegmentDriver"\]/);
  assert.match(readFileSync(AGENT_WORKER_ENTRY, "utf8"), /^export class SegmentDriver\b/m);
});

test("R15 control: with the binding removed (segments: false) the agent-worker has none, and the walk is told so by name", () => {
  const a = agentOf(planeOptions(BINDINGS, { dir: "/tmp/x", name: "plane", outbound: () => new Response(""), segments: false }));
  assert.equal("SEGMENTS" in a.durableObjects, false);
  assert.equal(a.durableObjects.RUNNER.className, "AgentRunner");
});
