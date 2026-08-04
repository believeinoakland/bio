/* REC-3 / D-39: an empty POST body returns a NAMED BIO refusal, never a raw
 * Cloudflare 1101 (a worker exception).
 *
 * The defect: the Durable Object's `fetch` called `await req.json()`
 * unconditionally on a POST, so an empty body threw a SyntaxError BEFORE any op
 * was dispatched and the caller saw an opaque platform error (error 1101)
 * rather than a structured reason. It was general to every op — the control
 * plane forwards the body verbatim to the DO — and it was found live on the
 * five READ ops named in D-39: stats, index, dangling, searchfields,
 * selectionlist. The guard now lives in store.mjs's fetch (`raw.trim() !== ""`
 * before JSON.parse; a present-but-invalid body is refused BAD_JSON by name),
 * and this suite is what locks it in: the code fix had landed (commit 6ac72d0a)
 * but no suite proved it, so the debt stayed open with nothing to catch a
 * regression.
 *
 * What is asserted, through the OP (the control plane, a real caller's only
 * route — a store-level test would not have caught the D-43 class): an empty
 * POST to each of the five debt ops returns well-formed JSON carrying a boolean
 * `ok` (i.e. NOT a non-JSON platform error), and a mutating op that requires a
 * body returns a structured `{ok:false, reason:...}` naming why.
 *
 * NEGATIVE CONTROL: replace the empty-body guard in store.mjs `fetch` with an
 * unconditional `body = await req.json()` -> the five debt ops return a
 * non-JSON HTTP 500 (`SyntaxError: Unexpected end of JSON input`), the exact
 * 1101-class platform error the guard closes, and the five "returns well-formed
 * JSON" assertions fail. RUN 2026-07-31: guard broken -> stats/index/dangling/
 * searchfields/selectionlist all 500 non-JSON (5 fail); guard restored -> green.
 */
/* NEGATIVE CONTROL: replace the store.mjs fetch empty-body guard with an unconditional `body = await req.json()` -> the five debt ops (stats/index/dangling/searchfields/selectionlist) return a non-JSON HTTP 500 (the 1101 class) and the "well-formed JSON" assertions FAIL. RUN 2026-07-31 record-agent-3: guard broken -> 8 fail; restored -> 10 pass. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});

/* An empty POST: method POST, no body at all — exactly the client bug that used
   to surface as a 1101. Returns { status, json, isJson } so a NON-JSON platform
   error is distinguishable from a structured refusal. */
const emptyPost = async (op) => {
  const r = await mf.dispatchFetch("http://x/api/?op=" + op + "&token=t-admin-1", { method: "POST" });
  const txt = await r.text();
  let json = null, isJson = true;
  try { json = JSON.parse(txt); } catch { isJson = false; }
  return { status: r.status, json, isJson };
};

console.log("\n--- the five D-39 ops: an empty POST is well-formed JSON, not a 1101 ---");
for (const op of ["stats", "index", "dangling", "searchfields", "selectionlist"]) {
  const r = await emptyPost(op);
  /* The 1101 class is a NON-JSON platform error. The fix guarantees a parseable
     JSON envelope carrying a boolean `ok`, which is all D-39 asks: a client bug
     no longer becomes an opaque platform error. */
  t(`op=${op} empty POST returns well-formed JSON (not a 1101)`,
    r.isJson && typeof r.json.ok === "boolean", true);
}

console.log("\n--- a mutating op with no body returns a NAMED reason ---");
/* promote requires a POSTed package: an empty body is answered by name, not by
   a crash. This is the "structured {ok:false, reason:...}" the task asks for. */
const prom = await emptyPost("promote");
t("op=promote empty POST is JSON", prom.isJson, true);
t("op=promote empty POST names NO_BODY", prom.json?.result?.reason, "NO_BODY");

/* governorconfig and acquire are two more mutating ops: each names its own
   reason on an empty body rather than throwing, confirming the guard is general
   and every op reaches its own validation with body === null. */
const gc = await emptyPost("governorconfig");
t("op=governorconfig empty POST names NEED_HOST", gc.json?.reason, "NEED_HOST");
const acq = await emptyPost("acquire");
t("op=acquire empty POST names BAD_LOCATOR", acq.json?.reason, "BAD_LOCATOR");

/* A present-but-invalid body is a DIFFERENT, also-named refusal: BAD_JSON. The
   guard distinguishes absent (null, fine) from malformed (refused by name),
   which is the other half of turning a platform error into a stated reason. */
const badJson = await mf.dispatchFetch("http://x/api/?op=stats&token=t-admin-1",
  { method: "POST", body: "{ not json" });
const bjTxt = await badJson.text();
let bj = null; try { bj = JSON.parse(bjTxt); } catch { /* leave null */ }
t("a malformed body is refused BAD_JSON by name", bj?.reason, "BAD_JSON");

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
