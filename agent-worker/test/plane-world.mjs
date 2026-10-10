/* The REAL plane for section R of `harness.test.mjs` (REC-100), holding a passing test bar (T41 B6, K2520). run-rules
   R19 as amended gates every run on its mode's test bar on Civicsmith's set, which holds no matter yet (N829), so in
   the plane as deployed no run opens: the fixture's `op=airunopen` answered AI_RUN_MODE_NOT_DEPLOYED (C-109.1), every
   tick found no run, and REC100-0 read the log empty. The plane runs in a Durable Object, where no module test's
   `deps.testSet` can be handed in, so this stands in for that set the one way a running plane allows, as
   capture-requests' `plane-world.mjs` and ai-runs' `world.mjs` do: `planeEntry()` copies `bio-plane/src/` to a
   scratch directory whose Civicsmith set holds one matter, and adds an entry module that is the plane's own door and
   `Store`, the Store recording, once built, a passing result on that set for each part through ai-runs R75's
   `testBarRecord`. Nothing else differs from `src/`: the repository's other directories are linked beside the copy. */
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync, symlinkSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PLANE_DIR = fileURLToPath(new URL("../../bio-plane", import.meta.url));
const REPO = join(PLANE_DIR, "..");
const EMPTY = "matters: Object.freeze([]),";
const ONE_MATTER = 'matters: Object.freeze([Object.freeze({ id: "m1" })]),';

const ENTRY = `import door from "./index.mjs";
import { Store as PlaneStore } from "./store.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { CIVICSMITH_TEST_SET } from "../run-rules/test-set.mjs";
const PARTS = ["check", "investigate", "extract", "plan", "explore"];
export class Store extends PlaneStore {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      const runs = aiRunsOf(ctx, env);
      const held = new Set(runs.testBarRecords().filter((r) => r.passed && r.set === CIVICSMITH_TEST_SET.id
        && r.set_version === CIVICSMITH_TEST_SET.version).map((r) => r.part));
      for (const part of PARTS.filter((p) => !held.has(p))) {
        const r = runs.testBarRecord({ part, set: CIVICSMITH_TEST_SET.id, set_version: CIVICSMITH_TEST_SET.version,
          false_alarm_rate: 0, passed: true, graded_by: "harness", at: "2026-07-01T00:00:00Z" });
        if (!r.ok) throw new Error("test bar " + part + ": " + JSON.stringify(r));
      }
    });
  }
}
export default door;
`;

/** The scratch plane: `{ path, script, dispose }`, `path` and `script` the entry module Miniflare runs, `dispose()`
    removing the copy. */
export function planeEntry() {
  const root = mkdtempSync(join(tmpdir(), "aw-plane-"));
  for (const name of readdirSync(REPO)) if (name !== "bio-plane") symlinkSync(join(REPO, name), join(root, name));
  const plane = join(root, "bio-plane");
  mkdirSync(plane);
  for (const name of readdirSync(PLANE_DIR)) if (name !== "src") symlinkSync(join(PLANE_DIR, name), join(plane, name));
  const src = join(plane, "src");
  cpSync(join(PLANE_DIR, "src"), src, { recursive: true });
  const setPath = join(src, "run-rules", "test-set.mjs");
  const text = readFileSync(setPath, "utf8");
  if (text.split(EMPTY).length !== 2) throw new Error("plane-world: Civicsmith's test set no longer reads as one empty set");
  writeFileSync(setPath, text.replace(EMPTY, ONE_MATTER));
  const path = join(src, "plane", "test-world.mjs");
  writeFileSync(path, ENTRY);
  return { path, script: ENTRY, dispose: () => rmSync(root, { recursive: true, force: true }) };
}
