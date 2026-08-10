/* NEGATIVE CONTROL: (run 2026-07-31) disable the store CAS-on-base in promote (guard `cur.bundle_sha !== base` with `false`) so the plane the self-test drives no longer refuses a stale write -> livefire reports 14/19, ok:false, exit 1: 5 self-test assertions fail (STALE base refused, garbage base refused, live state is the winning revision, history holds the superseded revision, lease returns live sha); restored, 19/19 ok:true. */
/* Runs the deployed battery against local workerd first, so we know it works
   before it is fired at real storage. Credential-free.
   Negative-control detail: disable the store CAS-on-base in promote (guard `cur.bundle_sha !== base` with `false`) so the plane the self-test drives no longer refuses a stale write -> livefire reports 14/19, ok:false, exit 1: 5 self-test assertions fail (STALE base refused, garbage base refused, live state is the winning revision, history holds the superseded revision, lease returns live sha); restored, 19/19 ok:true. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "0.2.0-local", PROBE_TOKEN: "probe-local-battery" },
});
const j = async (p) => (await (await mf.dispatchFetch("http://x" + p)).json());
const st = await j("/?op=selftest&token=probe-local-battery");
console.log("selftest ok:", st.ok, "bindings:", JSON.stringify(st.bindings), "captures:", st.captures);
const lf = await j("/?op=livefire&token=probe-local-battery");
console.log("\nlivefire:", lf.summary, "| store:", lf.store, "| ok:", lf.ok);
for (const a of lf.assertions) console.log(`  ${a.ok ? "PASS" : "FAIL"}  ${a.name}${a.ok ? "" : "  want " + JSON.stringify(a.want) + " got " + JSON.stringify(a.got)}`);
console.log("\nR2:", JSON.stringify(lf.r2, null, 1));
console.log("store:", JSON.stringify(lf.storeState));
console.log("\n--- confinement ---");
const d1 = await j("/?op=promote&token=probe-local-battery&store=bio");
console.log("  probe asking for live store :", d1.error || "ALLOWED (DEFECT)");
const d2 = await j("/?op=promote&token=probe-local-battery");
console.log("  probe promote with no body  :", d2.result?.reason || d2.error);
const d3 = await j("/?op=stats&token=probe-local-battery");
console.log("  probe reads land on         :", d3.store);
await mf.dispose();
process.exit(lf.ok ? 0 : 1);
