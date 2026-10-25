/* file-safety's published fixtures (fix round 10; K4990, K4993): the answers a later module's tests need from this one, made by this
   module's real code when the test runs, never stored and never hand-built. Each is an async function; a user awaits it. */
import { world } from "./fixture.mjs";
import { FILE_SAFETY_CHECKS } from "../../../src/file-safety/index.mjs";

const ADMIN = "member:boss";

/** The answers of the five batches the scheduler ticks, on an empty store with a scanner bound:
 *  `{scan, render, deeper, forward, refresh}` from `scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts` and
 *  `refreshReputationLists`. */
export async function batchTickAnswers() {
  const w = world();
  return { scan: await w.fs.scanBatch({}), render: await w.fs.renderBatch({}), deeper: await w.fs.deeperBatch({}),
           forward: await w.fs.forwardSecurityCounts({}), refresh: await w.fs.refreshReputationLists({}) };
}

/** The real refusal of each declared `*_ABSENT`, `*_UNREADABLE` and `*_INVALID` code of `FILE_SAFETY_CHECKS` (SCANNER_ABSENT,
 *  RENDERER_ABSENT, DEEPER_CHECKS_UNREADABLE, RENDER_QUEUE_UNREADABLE, FORWARD_PERIOD_INVALID, LIMIT_INVALID), keyed by code, each
 *  the answer the code's own site gives. */
export async function declaredRefusals() {
  const none = world({ bound: false });
  const unreadableDeeper = world();
  unreadableDeeper.exec("DROP TABLE fs_deeper");
  const unreadableQueue = world();
  unreadableQueue.exec("ALTER TABLE fs_files RENAME TO fs_files_away");
  const bad = world();
  const out = {
    SCANNER_ABSENT: await none.fs.scanBatch({}),
    RENDERER_ABSENT: await none.fs.renderBatch({}),
    DEEPER_CHECKS_UNREADABLE: await unreadableDeeper.fs.deeperBatch({}),
    RENDER_QUEUE_UNREADABLE: await unreadableQueue.fs.renderBatch({}),
    FORWARD_PERIOD_INVALID: await bad.fs.forwardSecurityCounts({ from: "x", to: "y" }),
    LIMIT_INVALID: await bad.fs.securityToolAdd({ providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" },
      handlingDigest: bad.fs.securityToolCatalogue({ viewer: ADMIN }).offered.find((d) => d.provider_id === "scanii").handling_digest, monthlyLimit: 0, by: "boss" }),
  };
  return out;
}

/** `securityToolTest` with no scanner bound: `SCANNER_ABSENT` with its row. */
export async function scannerAbsent() {
  const w = world({ bound: false });
  const added = await w.fs.securityToolAdd({ providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" },
    handlingDigest: w.fs.securityToolCatalogue({ viewer: ADMIN }).offered.find((d) => d.provider_id === "scanii").handling_digest, by: "boss" });
  return w.fs.securityToolTest({ toolId: added.tool_id, by: "boss" });
}

/** `securityToolTest` of a tool whose key the provider refuses: `{ok, tool_id, state: "test_failed", passed: false, detail}`. */
export async function toolTestFailed() {
  const w = world({ scan: { test: { scanii: { passed: false, detail: "the key was refused" } } } });
  const id = await addScanii(w);
  return w.fs.securityToolTest({ toolId: id, by: "boss" });
}

/** `securityToolTest` ok: `{ok, tool_id, state: "on", passed: true, detail, tested_at}`. */
export async function toolTested() {
  const w = world();
  const id = await addScanii(w);
  return w.fs.securityToolTest({ toolId: id, by: "boss" });
}

async function addScanii(w) {
  const entry = w.fs.securityToolCatalogue({ viewer: ADMIN }).offered.find((d) => d.provider_id === "scanii");
  const added = await w.fs.securityToolAdd({ providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" },
    handlingDigest: entry.handling_digest, by: "boss" });
  if (!added.ok) throw new Error(`tool not added: ${added.code}`);
  return added.tool_id;
}

export { FILE_SAFETY_CHECKS };
