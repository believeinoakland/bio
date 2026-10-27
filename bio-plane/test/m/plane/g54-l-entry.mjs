/* plane R87 (T51 fix round 6, G54), the platform check L: the plane's REAL `Store` (the Durable Object class `wrangler.jsonc` binds, with its scheduler and the registered `casefile-sweep`) booted on workerd by
   `g54-l.test.mjs` under Miniflare, with a real Durable Object alarm path, real R2 buckets and the real storage. `G54Plane` is the plane's `Store` plus debug routes that do what a ceremony and the
   completing act do and nothing else: `/g54/seed`, `/g54/finding`, `/g54/state`, `/g54/cs`, `/g54/fault` (the routes ratification's Worker half, re-exported here as the default, asks of its stub;
   a silent store for `recordcasemanifest` is made here), and `/g54p/alarm` (the object's own alarm handler `onAlarm(at)`, what the runtime calls), `/g54p/wake` (the alarm instant stored) and `/g54p/bucket`
   (faults for the object's own bucket binding: a `put` that throws once, one that throws only for the manifest's bytes, one that never answers; and the counts of what the bucket was asked).
   Every other request is the plane's own door. The Worker's `/g54w/...` routes are ratification's `g54-entry.mjs` (`run`, `complete`: the Worker half's post-commit block); every other path is the plane's own Worker (its public door, `publishedcase`). */
import { Store } from "../../../src/plane/store.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { seedEdition, completeEdition } from "./g54-seed.mjs";
import ratificationWorker from "../ratification/g54-entry.mjs";
import plane from "../../../src/plane/index.mjs";

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
const isManifest = (value) => { const t = value instanceof Uint8Array ? new TextDecoder().decode(value.slice(0, 80)) : ""; return t.trimStart().startsWith("{") && t.includes("\"format\""); };

export class G54Plane extends Store {
  #silent = false;
  #hold = false;
  /* `/g54p/hold?on=1` (R-NOLOAD): the platform's alarm does nothing while held, so the only ticks of the object are the ones a test asks for (`/g54p/alarm`). Any ordinary request re-arms a lost alarm (plane R102), so
     deleting the alarm once does not keep it away: the alarm the runtime fires on its own, at once, beside the test's tick built what the test was about to fail (whole-file runs under load). */
  async alarm() { if (this.#hold) { await this.ctx.storage.deleteAlarm(); return; } return super.alarm(); }
  #counts = { get: 0, head: 0, put: 0, bytes: 0 };
  #mode = { mode: "none", n: 0 };
  #real = null;
  async fetch(req) {
    const url = new URL(req.url), p = url.pathname, q = (k) => url.searchParams.get(k);
    if (this.#silent && p === "/recordcasemanifest") return new Response("down", { status: 500 });
    if (!p.startsWith("/g54/") && !p.startsWith("/g54p/")) return super.fetch(req);
    const ctx = this.ctx, pub = publicationOf(ctx);
    const caseId = q("case"), edition = Number(q("edition") || 1);
    if (p === "/g54/fault") { this.#silent = q("mode") === "record_silent"; return json({ silent: this.#silent }); }
    if (p === "/g54/seed") return json(await seedEdition(ctx, caseId, edition, { env: this.env, materials: Number(q("materials") || 0), kib: Number(q("kib") || 1) }));
    if (p === "/g54/finding") {
      const s = { finding: q("finding") }; await completeEdition(ctx, this.env, s);
      /* `disarm=1`: the completing act arms the alarm for the edition it owes (its first-attempt grace is past), and the runtime then fires that alarm ON ITS OWN, at once, beside the test's own ticks: a
         tick of the object that a test did not ask for. A test that asserts what ITS tick built takes the alarm back before the request is answered, so the only tick is the one it asks (`/g54p/alarm`). */
      if (q("disarm") === "1") await ctx.storage.deleteAlarm();
      return json({ ok: true });
    }
    if (p === "/g54/cs") return json(pub.caseEditionState(caseId, edition, "test-group"));
    if (p === "/g54/state") {
      const cs = pub.caseEditionState(caseId, edition, "test-group");
      const row = [...ctx.storage.sql.exec(`SELECT * FROM published_cases WHERE case_id=? AND edition=?`, caseId, edition)][0] || {};
      const listed = await (this.#real || this.env.PUBLISHED).list({ prefix: "bio/published/" });
      return json({ complete: !!(cs && cs.complete), manifest_sha: cs ? cs.manifest_sha ?? null : null, awaiting: cs ? cs.awaiting ?? null : null, objects: listed.objects.length,
                    ledger: { state: row.casefile_state ?? null, attempts: row.casefile_attempts ?? null, why: row.casefile_why ?? null } });
    }
    if (p === "/g54p/alarm") {
      const at = Number(q("at")) || Date.now(), ans = await this.onAlarm(at);
      return json({ sweep: ans && ans.casefilesweep ? ans.casefilesweep : null, keys: Object.keys(ans || {}), alarm: await ctx.storage.getAlarm(), counts: { ...this.#counts } });
    }
    if (p === "/g54p/hold") { this.#hold = q("on") === "1"; if (this.#hold) await ctx.storage.deleteAlarm(); return json({ hold: this.#hold }); }
    if (p === "/g54p/wake") return json({ alarm: await ctx.storage.getAlarm() });
    if (p === "/g54p/bucket") {
      /* the object's own binding, replaced on the env object the sweep's worker reads at each call */
      if (!this.#real) this.#real = this.env.PUBLISHED;
      const mode = q("mode") || "none"; this.#mode = { mode, n: Number(q("n") || 0) };
      this.#counts = { get: 0, head: 0, put: 0, bytes: 0 };
      const real = this.#real, counts = this.#counts, st = this.#mode; let puts = 0, thrown = false;
      const wrapped = new Proxy(real, { get(t, k) {
        const v = t[k];
        if (k === "put") return async (key, value, opts) => {
          counts.put++; puts++;
          if (st.mode === "put_throws_once" && !thrown) { thrown = true; throw new Error("bucket refused (injected)"); }
          if (st.mode === "manifest_put_throws_once" && !thrown && isManifest(value)) { thrown = true; throw new Error("bucket refused (injected)"); }
          if (st.mode === "hang_after" && puts > st.n) await new Promise(() => {});
          return t.put(key, value, opts);
        };
        if (k === "get") return async (...a) => { counts.get++; const o = await t.get(...a); if (o && typeof o.size === "number") counts.bytes += o.size; return o; };
        if (k === "head") return async (...a) => { counts.head++; return t.head(...a); };
        return typeof v === "function" ? v.bind(t) : v;
      } });
      Object.defineProperty(this.env, "PUBLISHED", { value: wrapped, configurable: true, writable: true, enumerable: true });
      return json({ mode, installed: this.env.PUBLISHED === wrapped });
    }
    return json({ error: "unknown g54 step" }, 404);
  }
}

export default {
  async fetch(req, env, ctx) { return new URL(req.url).pathname.startsWith("/g54w/") ? ratificationWorker.fetch(req, env, ctx) : plane.fetch(req, env, ctx); },
  scheduled: plane.scheduled,
};
