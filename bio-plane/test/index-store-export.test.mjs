/* index-store-export — N348 (LEGACY-INDEX #10, CONTROL-PLANE #5; LEGACY-TESTS #12, T14).

   THE CLAIM. The Worker's `Store`, the Durable Object class `src/index.mjs` exports and wrangler binds as STORE, IS
   control-plane's `Store` (`src/control-plane/dispatch.mjs`, R35: it starts instance-setup once and routes its ops
   inside R26's frame), exported unwrapped: no wrapper class stands between the binding and control-plane's door.

   WHY IT LIVES HERE. Control-plane cannot import `src/index.mjs` in its own tests (legacy-index is later in the order,
   P4; `checks/architecture.mjs` refuses it), and legacy-index has no `tests` path, so the assertion that joins the two
   is the old battery's (B1, CONTROL-PLANE #5's report). `src/index.mjs` reaches `cloudflare:` modules and does not
   import under node, so the identity is taken inside Miniflare, from an entry that imports both modules exactly as
   the Worker does, and a Durable Object bound to the class the entry exports proves the class is the one that runs.

   NEGATIVE CONTROL (run 2026-09-30, LEGACY-TESTS #12, restored by `git checkout`): `src/index.mjs`'s export replaced by
   `export class Store extends DispatchStore {}` over the same import -> the identity arm fails naming the wrapper
   (`false`), and the Durable Object arm still passes (a subclass still answers), so each arm is the one it says. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { fileURLToPath } from "node:url";

const ENTRY = fileURLToPath(new URL("../src/__index-store-export.entry.mjs", import.meta.url));
const script = [
  'import worker, { Store as Exported } from "./index.mjs";',
  'import { Store as ControlPlaneStore } from "./control-plane/dispatch.mjs";',
  "export { Exported as Store };",
  "export default {",
  "  async fetch(req, env) {",
  "    const u = new URL(req.url);",
  '    if (u.pathname === "/identity") return Response.json({ same: Exported === ControlPlaneStore, name: Exported.name,',
  "      wrapped: Object.getPrototypeOf(Exported) === ControlPlaneStore });",
  "    return worker.fetch(req, env);",
  "  },",
  "};",
].join("\n");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-n348", VERSION: "test" },
});
try {
  const id = await (await mf.dispatchFetch("http://x/identity")).json();
  t("N348: the Store src/index.mjs exports IS control-plane's dispatch.mjs Store, unwrapped (no class between them)",
    [id.same, id.wrapped], [true, false]);
  /* And that class is the one the binding runs: a store read through the Worker answers from it. */
  const st = await (await mf.dispatchFetch("http://x/api/?op=stats&token=adm-n348")).json();
  t("N348: the Durable Object bound to that class answers a store read through the Worker",
    [st && st.ok, typeof (st && (st.result ?? st))], [true, "object"]);
} catch (e) {
  fail++; console.log(`  FAIL  threw before its foot — ${e && e.stack || e}`);
} finally {
  await mf.dispose().catch(() => {});
}
console.log(`\nindex-store-export: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
