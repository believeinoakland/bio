/* plane G91 (fix round 9; K4807 (2), K4811 (4)), the platform check L: the plane's own Worker and `Store` booted on workerd by `r8-headofline.test.mjs` under Miniflare, with the REAL alarm.
   `Headline` is the plane's `Store` plus two debug routes and one wrapper, and nothing else: `readHeld` (the reading owner the ledger's `pending-work` consumer calls) is wrapped to COUNT its
   completed passes (`/r8/state` answers the count, so the scanner stub in the test can state how many passes had completed when it ended: an ORDER by count, never a time, R-CLOCK); `/r8/rows`
   answers the ledger's rows and the scheduler's health. Every other request is the plane's own door. */
import { Store } from "../../../src/plane/store.mjs";
import { pendingOf } from "../../../src/plane/pending.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { sha256HexSync } from "../../../src/record-grammar/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
export { default } from "../../../src/plane/index.mjs";

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });

export class Headline extends Store {
  #passes = 0;
  #wrapped = false;
  #counted = null;   /* the platform's alarm calls the object made, counted (G93: "storage reads counted") */
  #wrap() {
    if (this.#wrapped) return;
    const ex = extractionOf(this.ctx), real = ex.readHeld.bind(ex);
    ex.readHeld = async (...a) => { const r = await real(...a); if (r && r.ok !== false) this.#passes++; return r; };
    this.#wrapped = true;
  }
  /* counts the object's calls on the platform's alarm: `getAlarm` (a look), `setAlarm` (an arm), `deleteAlarm` */
  #count() {
    if (this.#counted) return this.#counted;
    const st = this.ctx.storage, c = { getAlarm: 0, setAlarm: 0, deleteAlarm: 0, wrapped: true };
    for (const k of ["getAlarm", "setAlarm", "deleteAlarm"]) {
      const real = st[k].bind(st);
      try { Object.defineProperty(st, k, { value: (...a) => { c[k]++; return real(...a); }, configurable: true, writable: true }); } catch { c.wrapped = false; }
    }
    return (this.#counted = c);
  }
  async fetch(req) {
    this.#count();
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/r8/")) { this.#wrap(); return super.fetch(req); }
    this.#wrap();
    const step = url.pathname.slice(4);
    if (step === "state") return json({ passes: this.#passes });
    if (step === "counters") { const alarm = await this.ctx.storage.getAlarm(); this.#counted.getAlarm--; return json({ ...this.#counted, alarm }); }   /* this read is not counted */
    if (step === "rows") {
      let health = null; try { health = await schedulerOf(this.ctx, this.env).health(Date.now()); } catch (e) { health = { error: String(e && e.message || e) }; }
      return json({ passes: this.#passes, pending: pendingOf(this.ctx).list(), health, alarm: await this.ctx.storage.getAlarm() });
    }
    if (step === "notes") return json({ notes: [...this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM fs_notes")][0].n, files: [...this.ctx.storage.sql.exec("SELECT COUNT(*) AS n FROM fs_files")][0].n });
    if (step === "session") {   /* a signed-in member who may contribute, as the walker is: a session row, so the test goes through the real door with a bearer token (g55-alarm-l-entry.mjs) */
      const sql = this.ctx.storage.sql, now = Date.now(), founder = new URL(req.url).searchParams.get("as") === "founder", ANN = founder ? "admin" : "member:ann";   /* the founder's session is the bare `admin` (R90) */
      const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
      if (!founder) sql.exec("INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('ann','Cover ann','h_ann','member','active','[\"contribute\"]','t','t')");
      sql.exec("INSERT INTO sessions (token_sha, role, expires, created, device, last_active) VALUES (?,?,?,?,?,?)", sha256HexSync(token), ANN, now + 3_600_000, new Date(now).toISOString(), "shared", now);
      return json({ token });
    }
    if (step === "kill-alarm") { await this.ctx.storage.deleteAlarm(); return json({ deleted: true }); }
    return json({ error: "no such step" }, 404);
  }
}
