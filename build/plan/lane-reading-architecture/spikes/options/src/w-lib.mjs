import { Miniflare } from "/home/user/bio/bio-plane/node_modules/miniflare/dist/src/index.js";
import path from "node:path";
const B = path.resolve(import.meta.dirname, "..");
export async function mk(persist) {
  const mf = new Miniflare({
    modules: true, scriptPath: B + "/src/w-worker.mjs", modulesRoot: B + "/src",
    modulesRules: [], script: undefined,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { CTR: { className: "Ctr", useSQLite: true } },
    workflows: { FIFTY: { name: "fifty", className: "Fifty" }, FLAKY: { name: "flaky", className: "Flaky" }, BIG: { name: "big", className: "Big" } },
    durableObjectsPersist: persist + "/do", workflowsPersist: persist + "/wf", kvPersist: persist + "/kv",
  });
  await mf.ready; return mf;
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function j(mf, p) { const r = await mf.dispatchFetch("http://x" + p); return r.json(); }
