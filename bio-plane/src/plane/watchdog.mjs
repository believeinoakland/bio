/* plane R79 (fix round 6, G1; K4565, K4566, K4570; scheduler R28, R29): THE SECOND CLOCK. The object's own alarm is the one periodic
   mechanism, and nothing outside the object noticed when it stopped (the dead alarm of fix round 5). The Worker's cron, once every five
   minutes (`wrangler.jsonc`'s one trigger), asks each of the two objects, `bio` and `scratch`, to `watchdog(at)`: record that the
   watchdog came, and set the alarm afresh if it is absent, spent or stale (the scheduler's `watch`, which runs no work and reads no
   row). The handler is bounded and sturdy: a fresh stub for each object, each asked at once under its own bound (a long read that holds
   the object makes the call wait behind it, so a call that outlasts the bound is recorded `busy`, not dead), the whole in a try, both
   objects always tried. Any failure is one structured `console.error` line and then a THROW, so Cloudflare's Cron Events record a
   failed run: the one record that outlives a dead object. It does no `waitUntil` work and writes to no bucket or key-value store. */

/** The bound on one object's answer, milliseconds. */
export const WATCHDOG_BOUND_MS = 10_000;
/** The two objects the door addresses (`idFromName`), each with its own scheduler and alarm. */
export const WATCHDOG_OBJECTS = Object.freeze(["bio", "scratch"]);

const BUSY = Symbol("busy");
const messageOf = (e) => String((e && e.message) || e).slice(0, 200);

/* one object: null when it answered soundly, else what failed */
async function ask(env, object, at, bound) {
  let timer;
  try {
    const stub = env.STORE.get(env.STORE.idFromName(object));
    const call = Promise.resolve().then(() => stub.watchdog(at));
    call.catch(() => {});   /* a call that outlasts the bound may reject later: that is caught here, never unhandled */
    const said = await Promise.race([call, new Promise((resolve) => { timer = setTimeout(() => resolve(BUSY), bound); })]);
    if (said === BUSY) return { object, why: "busy", message: `no answer in ${bound} ms` };
    if (!said || typeof said !== "object") return { object, why: "broken", message: `answered ${typeof said}` };
    return null;
  } catch (e) {
    return { object, why: "failed", message: messageOf(e) };
  } finally { clearTimeout(timer); }
}

/** The `scheduled` handler's work. `controller.scheduledTime` is the instant the cron was scheduled for; `bound` is a test's own. */
export async function watchdog(controller, env, { bound = WATCHDOG_BOUND_MS } = {}) {
  const at = controller && Number.isFinite(controller.scheduledTime) ? controller.scheduledTime : Date.now();
  let failed;
  try { failed = (await Promise.all(WATCHDOG_OBJECTS.map((object) => ask(env, object, at, bound)))).filter(Boolean); }
  catch (e) { failed = [{ object: "*", why: "failed", message: messageOf(e) }]; }
  if (failed.length === 0) return;
  console.error(JSON.stringify({ event: "plane.watchdog", scheduledTime: at, failed }));
  throw new Error(`WATCHDOG_FAILED ${failed.map((f) => `${f.object}:${f.why}`).join(" ")}`);
}
