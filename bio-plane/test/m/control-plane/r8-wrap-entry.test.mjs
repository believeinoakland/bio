/* control-plane R-ONE (fix round 8, K4427): THE COUNTING DOOR counts what it says it counts. `wrap-entry.mjs` is the plane's default export wrapped so every Durable Object call by
   route and every R2 call of a request is counted; the tests of G115–G121 read its header, so its own count is controlled here against calls whose number is known: one
   `whoami` makes the object calls its `Server-Timing` names (`do-<route>` is one metric for each distinct route; the wrapper counts every call, so it is never fewer), and an upload
   puts its bytes in R2 inside the object, where the Worker's own counts cannot see it. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { wrapScript, readCalls, doCalls, r2Calls } from "./wrap-entry.mjs";

const ADM = "adm-r8wrap-0123456789abcdef", PASSWORD = "the founder's long password, wrap", ORIGIN = "https://group.example";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", ...wrapScript(),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r8wrap-0123456789abcdef", PROBE_TOKEN: "prb-r8wrap-0123456789abcdef", VERSION: "4.7.9",
              INSTANCE_NAME: "r8wrap-town", GOVERNOR_APPETITE_PER_MIN: "600000" },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true);
  return { authorization: `Bearer ${signed.result.token}` };
}
const metricsOf = (res) => (res.headers.get("server-timing") || "").split(",").map((m) => m.trim().split(";")[0]).filter(Boolean);

test("R-ONE (fix round 8): the counting door counts the Worker's calls to the object by route, as many as `Server-Timing` names, and the object's R2 calls", { timeout: 300000 }, async () => {
  const auth = await founder();
  const res = await plane("/api/?op=whoami", { headers: auth });
  await res.arrayBuffer();
  assert.equal(res.status, 200);
  const calls = readCalls(res);
  const named = metricsOf(res).filter((m) => m.startsWith("do-")).length;
  assert.ok(named >= 1, "the op reached the object");
  assert.ok(Object.keys(calls.do).length === named, `one route for each do- metric: ${JSON.stringify(calls.do)} against ${res.headers.get("server-timing")}`);
  assert.ok(doCalls(calls) >= named, "every call is counted");
  for (const e of Object.values(calls.do)) assert.ok(e.n >= 1 && Number.isFinite(e.ms) && e.ms >= 0);
  /* an upload puts its bytes in R2 inside the object: the Worker's own counts do not see it, the object's do */
  const bytes = new TextEncoder().encode("The clerk stamped the contract before the vote.\n".repeat(40));
  const up = await plane("/api/?op=captureupload&statement=wrap&name=wrap.txt&type=text%2Fplain", { method: "POST", headers: auth, body: bytes });
  await up.arrayBuffer();
  assert.equal(up.status, 200);
  const upCalls = readCalls(up);
  const put = Object.entries(upCalls.object).filter(([k]) => k.endsWith(".put"));
  assert.ok(put.length >= 1 && put.reduce((n, [, e]) => n + e.n, 0) >= 1, `the object put the upload: ${JSON.stringify(upCalls.object)}`);
  assert.ok(put.reduce((n, [, e]) => n + e.bytes, 0) >= bytes.length, "and counted its bytes");
  assert.ok(r2Calls(upCalls, "put") >= 1);
  /* control: a read that touches no R2 counts none, and an answer with no header (an unknown address page) counts empty */
  assert.equal(r2Calls(calls, "put"), 0);
  const page = await plane("/nonesuch");
  await page.arrayBuffer();
  assert.equal(doCalls(readCalls(page)), 0, "a page makes no call to the object");
});
