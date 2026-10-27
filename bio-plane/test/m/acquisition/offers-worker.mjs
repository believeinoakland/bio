/* A Durable Object that holds record-core, acquisition and the real provenance over a REAL workerd SQLite, for r122-workerd.test.mjs:
   `archive_entries` is made here WITHOUT the `offers` column (the table as it stood before R122), and acquisition's `migrate` is asked to add it. */
import { recordOf } from "../../../src/record-core/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { acquisitionOf, unpack } from "../../../src/acquisition/index.mjs";

const OLD_ENTRIES = `CREATE TABLE archive_entries (
  archive_sha TEXT NOT NULL, idx INTEGER NOT NULL,
  name TEXT, name_raw TEXT, name_encoding TEXT, name_shared INTEGER, path_unsafe INTEGER, kind TEXT, dos_time TEXT,
  uncompressed INTEGER, verdict TEXT,
  state TEXT NOT NULL, code TEXT, detail TEXT, limit_name TEXT, sha256 TEXT, target TEXT, at TEXT,
  depth INTEGER, root_sha TEXT, address TEXT, address_norm TEXT, origin TEXT, parts TEXT, entries INTEGER,
  declared_total INTEGER, bytes INTEGER, tree_entries INTEGER, tree_bytes INTEGER,
  PRIMARY KEY (archive_sha, idx))`;
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export class Archive {
  constructor(ctx) {
    this.ctx = ctx;
    const held = (this.held = new Map());
    const bucket = {
      async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; },
      async get(k, o) { if (!held.has(k)) return null; const b = o && o.range ? held.get(k).slice(o.range.offset, o.range.offset + o.range.length) : held.get(k);
        return { key: k, size: b.length, body: b, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; },
      async put(k, bytes) { held.set(k, new Uint8Array(bytes)); return { key: k }; },
    };
    ctx.blockConcurrencyWhile(async () => {
      this.core = recordOf(ctx, { evidence: bucket, evidencePrefix: "bio/captures/" });
      this.core.migrate();
      const membership = { admins: [], isAdministrator: () => false };
      const provenance = provenanceOf(ctx, { record: this.core, membership });   /* the real provenance over this record, as provenance's `provenanceOver` builds it */
      provenance.migrate();
      ctx.storage.sql.exec(OLD_ENTRIES);
      this.before = [...ctx.storage.sql.exec(`PRAGMA table_info(archive_entries)`)].map((c) => c.name);
      this.acq = acquisitionOf(ctx, { record: this.core, provenance, membership });
      this.after = [...ctx.storage.sql.exec(`PRAGMA table_info(archive_entries)`)].map((c) => c.name);
      this.store = { core: this.core, acquisition: this.acq, provenance, env: {} };
    });
  }
  async fetch(request) {
    const url = new URL(request.url), act = url.searchParams.get("act");
    if (act === "hold") {
      const bytes = new Uint8Array(await request.arrayBuffer());
      const sha = hex(await crypto.subtle.digest("SHA-256", bytes));
      await this.core.evidenceStore().put(sha, bytes);
      /* held as the doorbell's pull holds it: the bytes and a receipt (the real provenance's, as `unpack` asks it) */
      this.store.provenance.recordReceipt({ address: "https://files.example/set.zip", addressNorm: "https://files.example/set.zip", captureSha: sha,
        retrieved: "2026-01-01T00:00:00Z", via: "doorbell" });
      return Response.json({ sha });
    }
    if (act === "unpack") {
      const sha = url.searchParams.get("sha"), who = url.searchParams.get("who");
      const r = await unpack(this.store, who === "daemon" ? { archiveSha: sha, by: "daemon", cls: "daemon" } : { archiveSha: sha, by: "m1", cls: "member", member: true });
      return Response.json({ ok: r.ok, reason: r.reason ?? null, documents: (r.documents || []).map((d) => d.container.index), waiting: r.waiting, complete: r.complete,
                            not_promoted: r.not_promoted || null });
    }
    if (act === "columns") return Response.json({ before: this.before, after: this.after,
      now: [...this.ctx.storage.sql.exec(`PRAGMA table_info(archive_entries)`)].map((c) => c.name),
      rows: [...this.ctx.storage.sql.exec(`SELECT idx, state, offers FROM archive_entries WHERE idx>=0 ORDER BY idx`)] });
    return new Response("?", { status: 400 });
  }
}
export default { fetch: (req, env) => env.ARCHIVE.get(env.ARCHIVE.idFromName("one")).fetch(req) };
