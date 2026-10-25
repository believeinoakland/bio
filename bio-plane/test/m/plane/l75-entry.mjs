/* plane R75 (T51 fix round 4; C5a, C5c; K4429), the platform check L: the plane's own Worker and `Store` booted on workerd by
   `l75.test.mjs` under Miniflare, with the real Durable Object alarm, the real R2 multipart upload and the real storage. `Held`
   is the plane's `Store` plus a few debug routes (`/l75/...`) that do what acquisition and the door do and nothing else: lay a
   document's parts in the evidence store, leave a keep pending through `captureOf(ctx).keepLater` (the call acquisition makes),
   write a stage record, and read the state. Every other request is the plane's own door (`Store.fetch`). */
import { Store } from "../../../src/plane/store.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { acquireTimingsOf } from "../../../src/store-assembly/acquire-timings.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
export { default } from "../../../src/plane/index.mjs";

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha = async (bytes) => hex(await crypto.subtle.digest("SHA-256", bytes));
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });

export class Held extends Store {
  readHeldCalls = [];
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/l75/")) return super.fetch(req);
    const ctx = this.ctx, step = url.pathname.slice(5);
    const ev = recordOf(ctx).evidenceStore();
    if (step === "hold") {
      /* `mib` MiB in `n` parts of near-equal size, pseudo-random so no part is compressible; the whole is not stored */
      const n = Number(url.searchParams.get("n")), mib = Number(url.searchParams.get("mib"));
      const whole = new Uint8Array(mib * 1024 * 1024);
      for (let i = 0; i < whole.length; i += 65536) crypto.getRandomValues(whole.subarray(i, Math.min(i + 65536, whole.length)));
      const size = Math.ceil(whole.length / n), parts = [];
      for (let at = 0; at < whole.length; at += size) {
        const p = whole.slice(at, at + size), d = await sha(p);
        await ev.put(d, p); parts.push(d);
      }
      return json({ sha: await sha(whole), parts, bytes: whole.length });
    }
    if (step === "keep") {
      const body = await req.json();
      // fixtures-own: synthetic the owner of the reading is a counter that answers at once: this probe measures when the alarm runs the ledger and how often it asks, and asserts nothing of what the reader answers
      extractionOf(ctx).readHeld = async (a) => { this.readHeldCalls.push({ ...a, at: Date.now() }); return { ok: true, read: true }; };
      return json({ filed: await captureOf(ctx).keepLater(body), at: Date.now() });
    }
    if (step === "state") {
      const d = url.searchParams.get("sha");
      return json({ pending: pendingOf(ctx).list(), whole: !!(await ev.head(d)), alarm: await ctx.storage.getAlarm(), now: Date.now(),
                    readHeld: this.readHeldCalls });
    }
    if (step === "hang") {
      /* R77 (fix round 5, E2): an owner that never returns, as an isolate killed in the middle of a read; the test then ends this runtime */
      const d = url.searchParams.get("sha");
      extractionOf(ctx).readHeld = async (a) => { this.readHeldCalls.push({ ...a, at: Date.now() }); return new Promise(() => {}); };
      return json({ owed: await pendingOf(ctx).owe({ kind: "reading", sha: d }), at: Date.now() });
    }
    if (step === "ocr") {
      /* R77 (fix round 5, B38): an `ocr` entry due now whose passes take `ms` each (the OCR member's 24 pages), 3 passes; the times each pass began are read back */
      const d = url.searchParams.get("sha"), ms = Number(url.searchParams.get("ms") || 2000);
      this.passes = [];
      // fixtures-own: synthetic the OCR owner is a timed driver: each pass takes `ms` and the third ends the row; the figures under test are the times the plane ran the passes, not what the reader answers
      extractionOf(ctx).readHeld = async (a) => {
        this.passes.push(Date.now());
        await new Promise((r) => setTimeout(r, ms));
        return { ok: true, read: true, owed: this.passes.length < 3, why: this.passes.length < 3 ? "READING_HELD" : undefined };
      };
      return json({ owed: await pendingOf(ctx).owe({ kind: "ocr", sha: d }), at: Date.now() });
    }
    if (step === "passes") return json({ passes: this.passes || [], pending: pendingOf(ctx).list(), alarm: await ctx.storage.getAlarm(), now: Date.now() });
    if (step === "migrate-old") {
      /* R77: a ledger of the earlier shape (one row for each digest, five tries) carried over on workerd's storage */
      const sql = ctx.storage.sql;
      sql.exec(`DROP TABLE keeps_pending`);
      sql.exec(`CREATE TABLE keeps_pending (sha TEXT PRIMARY KEY, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', attempts INTEGER NOT NULL DEFAULT 0, registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT)`);
      sql.exec(`INSERT INTO keeps_pending (sha, kind, parts, attempts, registered_at, due_at, last_try, last_why) VALUES (?, 'reading', '[]', 5, 1, 9999999999999, 2, 'NO_HOME')`, "a".repeat(64));
      pendingOf(ctx).migrate(); pendingOf(ctx).migrate();
      return json({ rows: [...sql.exec(`SELECT * FROM keeps_pending`)], old: [...sql.exec(`SELECT name FROM sqlite_master WHERE name='keeps_pending_old'`)].length,
                    owed: await pendingOf(ctx).owe({ kind: "ocr", sha: "b".repeat(64), detail: { next_page: 25 } }), list: pendingOf(ctx).list() });
    }
    if (step === "stages") {
      const h = acquireTimingsOf(ctx), t = h.open(url.searchParams.get("trace"));
      t.start = performance.now(); t.end = null; t.stages = {}; t.running = { name: "read", since: performance.now() };
      return json({ ok: true });
    }
    return json({ error: "unknown l75 step" }, 404);
  }
}
