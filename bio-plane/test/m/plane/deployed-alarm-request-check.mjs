/* plane B95 (K5178; K5063 step 4): the DEPLOYED-PLANE CHECK of LOAD-RED 5 (1): a request sent to the object while its alarm sweep runs is answered, never closed.
   The simulator could not reproduce the closed request in 20 whole-file runs of g54-l under 8 busy loops (PLANE #63's record), so this is the platform's own check, for BOB's redeploy of biosmoke8.
   Not a test: it contacts a live deployment and BOB runs it (`node bio-plane/test/m/plane/deployed-alarm-request-check.mjs`), never the job.
   Environment: PLANE_URL (the deployment's origin, e.g. https://biosmoke8...), PLANE_ADMIN_TOKEN (the administrator's token; read from the environment and never printed).
   It waits up to PLANE_WAIT_S seconds (default 600) for a firing in progress (`op=owedwork`, the administrator's `running_since` set: alarm() is running), and meanwhile sends one `whoami` each
   PLANE_EVERY_MS (default 250) ms to the object; every request is recorded with its start, its end, its status and, on a failure, the error's `cause` code. The check PASSES when at least one request
   was sent during a firing and every request in that window was answered 200; it says INCONCLUSIVE (exit 2) when no firing was seen; it FAILS (exit 1) on any request closed or refused in a firing. */
const base = (process.env.PLANE_URL || "").replace(/\/+$/, ""), token = process.env.PLANE_ADMIN_TOKEN || "";
if (!/^https:\/\//.test(base) || !token) { console.error("set PLANE_URL (https origin) and PLANE_ADMIN_TOKEN"); process.exit(64); }
const waitS = Number(process.env.PLANE_WAIT_S || 600), every = Number(process.env.PLANE_EVERY_MS || 250);
const get = async (op) => {
  const t0 = Date.now();
  try {
    const r = await fetch(`${base}/api?op=${op}`, { headers: { authorization: `Bearer ${token}` } });
    const text = await r.text();
    let body = null; try { body = JSON.parse(text); } catch { /* none */ }
    return { op, t0, t1: Date.now(), status: r.status, body: body && (body.result ?? body) };
  } catch (e) { return { op, t0, t1: Date.now(), status: null, cause: (e && e.cause && (e.cause.code || e.cause.message)) || String(e && e.message || e) }; }
};
const log = [];
let firing = false, sawFiring = 0;
const until = Date.now() + waitS * 1000;
while (Date.now() < until) {
  const w = await get("owedwork");
  firing = !!(w.body && Number.isFinite(w.body.running_since));
  if (firing) sawFiring++;
  const q = await get("whoami");
  log.push({ ...q, firing });
  if (!firing && sawFiring > 0) break;   /* the firing seen has ended */
  await new Promise((r) => setTimeout(r, every));
}
const inFiring = log.filter((x) => x.firing);
const bad = inFiring.filter((x) => x.status !== 200);
const slow = Math.max(0, ...inFiring.map((x) => x.t1 - x.t0));
console.log(JSON.stringify({ requests: log.length, in_firing: inFiring.length, longest_ms: slow, failed: bad.map((x) => ({ at: x.t0, status: x.status, cause: x.cause || null, ms: x.t1 - x.t0 })) }));
if (bad.length) { console.error("FAIL: a request during a firing was closed or refused"); process.exit(1); }
if (!inFiring.length) { console.error("INCONCLUSIVE: no firing was seen within the wait"); process.exit(2); }
console.log("PASS: every request sent during a firing was answered 200");
