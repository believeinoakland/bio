/* plane R79 (fix round 6, G1), the platform check L: the plane's own Worker and `Store` booted on workerd by `l79.test.mjs` under Miniflare,
   with the real Durable Object alarm and the real `scheduled` handler. `Watched` is the plane's `Store` plus a few debug routes
   (`/l79/...`) that make the states the watchdog is for: an object that owes work and has no alarm, an object busy in one long
   synchronous stretch, an alarm in the past. Every other request is the plane's own door (`Store.fetch`). */
import { Store } from "../../../src/plane/store.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
export { default } from "../../../src/plane/index.mjs";

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });

export class Watched extends Store {
  readHeldCalls = [];
  constructor(ctx, env) {
    super(ctx, env);
    /* every read the ledger asks for is answered at once, and counted */
    // fixtures-own: synthetic the owner of the reading is a counter that answers at once: this probe measures when the alarm runs the ledger, and asserts nothing of what the reader answers
    extractionOf(ctx).readHeld = async (a) => { this.readHeldCalls.push({ ...a, at: Date.now() }); return { ok: true, read: true }; };
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/l79/")) return super.fetch(req);
    const ctx = this.ctx, step = url.pathname.slice(5);
    if (step === "owe") {
      /* a row due twenty minutes ago, written as the ledger writes it, and no alarm: an object whose alarm was lost */
      const sha = url.searchParams.get("sha"), at = Date.now();
      ctx.storage.sql.exec(`INSERT OR REPLACE INTO keeps_pending (sha, kind, parts, detail, attempts, registered_at, due_at) VALUES (?, 'reading', '[]', '{}', 0, ?, ?)`,
                           sha, at - 20 * 60_000, at - 20 * 60_000);
      await ctx.storage.deleteAlarm();
      return json({ at });
    }
    if (step === "state") {
      return json({ pending: pendingOf(ctx).list(), alarm: await ctx.storage.getAlarm(), now: Date.now(), readHeld: this.readHeldCalls.length,
                    health: await schedulerOf(ctx, this.env).health() });
    }
    if (step === "hold") {
      /* the object held: every other call to it waits behind this one (`blockConcurrencyWhile`), as it waits behind a long read. (A synchronous
         spin cannot show it on workerd locally: all isolates of one process share its thread, so the Worker's own timer would stop too.) */
      const ms = Number(url.searchParams.get("ms"));
      await ctx.blockConcurrencyWhile(() => new Promise((r) => setTimeout(r, ms)));
      return json({ held: ms });
    }
    if (step === "alarm-at") {
      await ctx.storage.setAlarm(Number(url.searchParams.get("at")));
      return json({ alarm: await ctx.storage.getAlarm() });
    }
    return json({ error: "no such step" }, 404);
  }
}
