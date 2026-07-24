import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
const SRC = process.argv[2];
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "0.3.5-local", ADMIN_TOKEN: "adm-local-migration", MEMBER_TOKEN: "mem-local-migration", PROBE_TOKEN: "prb-local-migration" },
  port: 8787, defaultPersistRoot: "/tmp/plane-persist",
});
console.log("plane at", (await mf.ready).toString());
