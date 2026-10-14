/* N1073 (K3268) — THE OPS THIS MEMBER CALLS THAT ANOTHER MODULE OWNS, READ FROM THEIR OWNERS' DECLARATIONS. Each owner
 * declares its op names once (`aiRunsOps`, `captureRequestsOps`, `actionPlansOps` return a table keyed by op); a suite
 * that pins this member's `PLANE_OPS` names the ones it calls through `ownedBy`, which refuses a name its owner does not
 * declare, so an owner's rename fails here and a suite no longer carries a second copy of a foreign list. NOT a
 * `.test.mjs`: a fixture the suites share. */
import { aiRunsOps } from "../../bio-plane/src/ai-runs/index.mjs";
import { captureRequestsOps } from "../../bio-plane/src/capture-requests/index.mjs";
import { actionPlansOps } from "../../bio-plane/src/action-plans/index.mjs";

const HERE = new URL("http://owner.invalid/");
const declared = (ops) => Object.keys(ops(null, HERE, null));
export const AI_RUNS_DECLARES = declared(aiRunsOps);
export const CAPTURE_REQUESTS_DECLARES = declared(captureRequestsOps);
export const ACTION_PLANS_DECLARES = declared(actionPlansOps);

/** The names this member calls of one owner's declaration; throws for a name the owner does not declare. */
export function ownedBy(declares, names) {
  const missing = names.filter((n) => !declares.includes(n));
  if (missing.length) throw new Error(`the owner no longer declares: ${missing.join(", ")}`);
  return names;
}

/** What this member calls of each owner. */
export const AI_RUNS_READS = ownedBy(AI_RUNS_DECLARES, ["airun", "airunlog", "airunspawn"]);
export const AI_RUNS_WRITES = ownedBy(AI_RUNS_DECLARES, ["airunclose", "airuntick"]);
export const CAPTURE_REQUESTS_WRITES = ownedBy(CAPTURE_REQUESTS_DECLARES, ["capturerequest"]);
export const ACTION_PLANS_READS = ownedBy(ACTION_PLANS_DECLARES, ["plan", "plans"]);
export const ACTION_PLANS_WRITES = ownedBy(ACTION_PLANS_DECLARES, ["optionpropose"]);

/** This member's whole pin: its own names beside the owned ones, sorted. */
export const PINNED_OPS = (own, ...owned) => [...own, ...owned.flat()].sort();
/** R37, R53, R78 — the ops this member calls: [reads, writes]. Its own are listed here; the three owners' are read. */
export const PLANE_OPS_PINNED = [
  PINNED_OPS(["action", "agentpack", "availableactions", "basisversions", "consequencesof", "determination", "meaningrows",
              "procedureguides", "profiles", "publishededitions", "reading", "search", "standard", "versionchain", "whoami"],
             AI_RUNS_READS, ACTION_PLANS_READS),
  PINNED_OPS(["suggest"], AI_RUNS_WRITES, CAPTURE_REQUESTS_WRITES, ACTION_PLANS_WRITES),
];
