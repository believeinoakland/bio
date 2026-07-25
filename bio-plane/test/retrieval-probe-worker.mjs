/* Probe-only Durable Object. NOT part of the shipped plane.
 * Models three retrieval implementations over the SAME workerd SQLite the
 * deployed Store uses, so the FTS5-vs-export comparison is measured on the real
 * engine rather than argued about. One v0 retrieval semantics, three callers,
 * held to exact agreement.
 *
 * v0 semantics (explicit so agreement is meaningful):
 *   normalize(text) = lowercase, split on [^a-z0-9]+, keep tokens length >= 2.
 *   a query is a token set; a doc matches iff its token set superseteq query set (AND).
 */
import { DurableObject } from "cloudflare:workers";

export class Probe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      // scan baseline: normalized body wrapped in spaces, no index -> full scan.
      this.sql.exec(`CREATE TABLE IF NOT EXISTS docs (rowid_ INTEGER PRIMARY KEY, id TEXT, body TEXT)`);
    });
  }
  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }

  seed(docs) {
    // docs: [{id, body}] where body is the already-normalized space-joined token text
    this.sql.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS ftsx USING fts5(id UNINDEXED, body, tokenize='ascii')`);
    const t0 = Date.now();
    this.ctx.storage.transactionSync(() => {
      for (const d of docs)
        this.sql.exec(`INSERT INTO docs (id, body) VALUES (?, ?)`, d.id, ` ${d.body} `);
    });
    const writeMs = Date.now() - t0;

    // FTS5 populate: only THIS chunk's rows, once each. ascii tokenizer: our
    // tokens are already lowercase alnum, so ascii tokenization reproduces them
    // exactly -> the same token stream the scan sees.
    const before = this.ctx.storage.sql.databaseSize;
    const tf = Date.now();
    this.ctx.storage.transactionSync(() => {
      for (const d of docs)
        this.sql.exec(`INSERT INTO ftsx (id, body) VALUES (?, ?)`, d.id, d.body);
    });
    const ftsBuildMs = Date.now() - tf;
    const ftsBytes = this.ctx.storage.sql.databaseSize - before;
    return { seeded: docs.length, writeMs, ftsBuildMs, ftsBytes, dbBytes: this.ctx.storage.sql.databaseSize };
  }

  // scan: exact-token AND via space-delimited LIKE, a full table scan (no index).
  scan(tokens) {
    if (!tokens.length) return { ids: [], ms: 0 };
    const where = tokens.map(() => `body LIKE ?`).join(" AND ");
    const args = tokens.map((t) => `% ${t} %`);
    const t = Date.now();
    const ids = this.#rows(`SELECT id FROM docs WHERE ${where} ORDER BY id`, ...args).map((r) => r.id);
    return { ids, ms: Date.now() - t };
  }

  // fts5: exact-token AND via quoted phrases, one query inside the object.
  fts(tokens) {
    if (!tokens.length) return { ids: [], ms: 0 };
    const match = tokens.map((t) => `"${t}"`).join(" AND ");
    const t = Date.now();
    const ids = this.#rows(`SELECT id FROM ftsx WHERE ftsx MATCH ? ORDER BY id`, match).map((r) => r.id);
    return { ids, ms: Date.now() - t };
  }

  // build the exported inverted index inside the object: token -> sorted rowids.
  // measures the cost the DO pays to PRODUCE the artifact and its serialized size.
  buildExport() {
    const t = Date.now();
    const post = new Map();
    for (const r of this.#rows(`SELECT rowid_, body FROM docs ORDER BY rowid_`)) {
      const seen = new Set(r.body.trim().split(/\s+/).filter(Boolean));
      for (const tok of seen) {
        let a = post.get(tok);
        if (!a) { a = []; post.set(tok, a); }
        a.push(r.rowid_);
      }
    }
    const obj = {};
    for (const [k, v] of post) obj[k] = v;
    const json = JSON.stringify({ n: this.#rows(`SELECT COUNT(*) c FROM docs`)[0].c, postings: obj });
    return { buildMs: Date.now() - t, bytes: json.length, tokens: post.size };
  }

  async fetch(req) {
    const url = new URL(req.url);
    const op = url.pathname.slice(1);
    const body = req.method === "POST" ? await req.json() : null;
    const q = (url.searchParams.get("q") || "").toLowerCase().match(/[a-z0-9]{2,}/g) || [];
    const map = {
      seed: () => this.seed(body.docs),
      scan: () => this.scan(q),
      fts: () => this.fts(q),
      buildexport: () => this.buildExport(),
      stats: () => ({ docs: this.#rows(`SELECT COUNT(*) c FROM docs`)[0].c, dbBytes: this.ctx.storage.sql.databaseSize }),
    };
    if (!map[op]) return Response.json({ error: "unknown op " + op }, { status: 400 });
    return Response.json({ ok: true, result: await map[op]() });
  }
}
export default { fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
