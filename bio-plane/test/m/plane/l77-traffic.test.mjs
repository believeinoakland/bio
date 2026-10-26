/* plane R77 L (fix round 5, B38; K4549): TRAFFIC NEVER POSTPONES A DUE ENTRY. On workerd under Miniflare with the real alarm: an `ocr` entry due now, whose passes take 2 s
   each (three passes), while requests reach the object every 4 s as a member's page polls `op=reading`. Each pass must begin within one tick of the entry's due time (the
   previous pass's end), whatever the traffic; the times are printed. Control: the same entry with no traffic. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./l75-entry.mjs", import.meta.url));
const boot = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Held", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "l77t", VERSION: "test" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-l77t-")),
});
async function run(traffic) {
  const mf = boot();
  try {
    const ns = await mf.getDurableObjectNamespace("STORE"), stub = ns.get(ns.idFromName("bio"));
    const ask = async (path) => { const r = await stub.fetch(`http://do/${path}`); return JSON.parse(await r.text()); };
    await ask("l75/state?sha=" + "0".repeat(64));   /* the object is up */
    const started = await ask(`l75/ocr?sha=${"e".repeat(64)}&ms=2000`);
    let s, n = 0;
    for (let i = 0; i < 90; i++) {
      s = await ask("l75/passes");
      if (s.passes.length >= 3 && !s.pending.length) break;
      if (traffic) { await ask("owedwork?cls=member&viewer=member:ann"); n++; await new Promise((r) => setTimeout(r, 4000)); } else await new Promise((r) => setTimeout(r, 500));
    }
    return { started: started.at, passes: s.passes.map((t) => t - started.at), left: s.pending.length, requests: n };
  } finally { await mf.dispose(); }
}
test("R77 L (B38): an `ocr` entry due now is worked pass after pass within one tick of its due time while requests reach the object every 4 s; the same with none", { timeout: 400_000 }, async () => {
  const quiet = await run(false), busy = await run(true);
  console.log(`# L77 traffic: quiet ${JSON.stringify(quiet.passes)} ms; every 4 s (${busy.requests} requests) ${JSON.stringify(busy.passes)} ms`);
  for (const [name, r] of [["quiet", quiet], ["busy", busy]]) {
    assert.equal(r.passes.length, 3, `${name}: three passes (${JSON.stringify(r.passes)})`);
    assert.equal(r.left, 0, `${name}: the entry ended`);
    r.passes.forEach((t, i) => i && assert.ok(t - r.passes[i - 1] < 2000 + 2500, `${name}: pass ${i + 1} began ${t - r.passes[i - 1]} ms after the last began (a pass takes 2000)`));
  }
});
