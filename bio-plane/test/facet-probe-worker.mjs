/* Probe-only Durable Object. NOT part of the shipped plane.
 *
 * Probe 2 measures the substrate a full search/filter/list/sort/select surface
 * needs, which probe 1 did not touch. Probe 1 measured free text only. Filtering
 * on typed frontmatter, counting facets for a sidebar, sorting by an arbitrary
 * field, and selecting a whole result set are DIFFERENT query shapes with their
 * own cost curves, so they are measured rather than assumed to inherit probe 1's.
 *
 * Two candidate metadata substrates are built over the same corpus:
 *   WIDE  a typed column per projected field (what bundles already is), indexed.
 *   EAV   facets(field, value) rows, one shape that absorbs any frontmatter key.
 * The real frontmatter is heterogeneous by object_type/schema (information@1,
 * information@2, problem@1, project@1 carry different field sets), so WIDE
 * cannot cover it alone. The question is what EAV costs.
 *
 * FTS5 rowid is aligned with meta.rowid_ so a text+metadata query is an integer
 * join, not a string join.
 */
import { DurableObject } from "cloudflare:workers";

/* Fields the WIDE table projects. Mirrors the real bundles table plus the
   frontmatter fields the real corpus carries that bundles does not project. */
const WIDE_COLS = [
  "object_type", "schema_id", "current_state", "prior_state", "criticality",
  "classification", "created", "last_updated", "produced_mode",
  "capability_tier", "source_authority", "source_status", "monitor_freq",
  "annotations_open", "reeval_flag",
];

export class FacetProbe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(
        `CREATE TABLE IF NOT EXISTS meta (
           rowid_ INTEGER PRIMARY KEY,
           id TEXT UNIQUE,
           ${WIDE_COLS.map((c) => (c === "annotations_open" ? `${c} INTEGER` : `${c} TEXT`)).join(", ")}
         )`
      );
      /* Index every field the UX can filter or sort on. Without these a filter
         is a full table scan whose cost grows with the corpus; with them it is a
         seek whose cost tracks the result, which is the same property probe 1
         chose FTS5 for. The composite carries the common pair. */
      for (const c of ["object_type", "current_state", "criticality", "classification",
                       "produced_mode", "source_status", "source_authority",
                       "reeval_flag", "last_updated", "created", "annotations_open"])
        this.sql.exec(`CREATE INDEX IF NOT EXISTS meta_${c} ON meta(${c})`);
      this.sql.exec(`CREATE INDEX IF NOT EXISTS meta_type_state ON meta(object_type, current_state)`);
      this.sql.exec(`CREATE INDEX IF NOT EXISTS meta_type_crit ON meta(object_type, criticality)`);

      /* EAV. vnum/vtime split so range and order are typed rather than lexical
         guesses. vtime keeps ISO-8601 Z text, which sorts correctly as text. */
      this.sql.exec(
        `CREATE TABLE IF NOT EXISTS facets (
           row INTEGER NOT NULL, field TEXT NOT NULL,
           vtext TEXT, vnum REAL, vtime TEXT,
           PRIMARY KEY (field, vtext, row)
         ) WITHOUT ROWID`
      );
      this.sql.exec(`CREATE INDEX IF NOT EXISTS facets_row ON facets(row, field)`);
      this.sql.exec(`CREATE INDEX IF NOT EXISTS facets_time ON facets(field, vtime, row)`);
      this.sql.exec(`CREATE INDEX IF NOT EXISTS facets_num ON facets(field, vnum, row)`);
    });
  }
  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }

  /* ---------- capability probe ----------
     What the query compiler is allowed to emit depends on what this engine
     actually has. Each feature is attempted for real and reported pass/fail.  */
  capabilities() {
    const out = {};
    const t = (name, fn) => {
      try { out[name] = { ok: true, note: String(fn() ?? "").slice(0, 90) }; }
      catch (e) { out[name] = { ok: false, note: String(e.message || e).slice(0, 90) }; }
    };
    this.sql.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS capf USING fts5(body, tokenize='unicode61')`);
    this.sql.exec(`DELETE FROM capf`);
    this.sql.exec(`INSERT INTO capf (rowid, body) VALUES (1, 'sewer service fund transfer oakland auditor')`);
    this.sql.exec(`INSERT INTO capf (rowid, body) VALUES (2, 'water district billing collection agreement')`);

    t("fts5_match_and", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH 'sewer AND fund'`).length);
    t("fts5_match_or", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH 'sewer OR billing'`).length);
    t("fts5_match_not", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH 'sewer NOT auditor'`).length);
    t("fts5_match_parens", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH '(sewer OR water) AND (fund OR billing)'`).length);
    t("fts5_phrase", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH '"service fund"'`).length);
    t("fts5_prefix", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH 'audit*'`).length);
    t("fts5_near", () => this.#rows(`SELECT rowid FROM capf WHERE capf MATCH 'NEAR(sewer fund, 3)'`).length);
    t("fts5_bm25", () => this.#rows(`SELECT rowid, bm25(capf) AS s FROM capf WHERE capf MATCH 'sewer' ORDER BY s`)[0]?.s);
    t("fts5_snippet", () => this.#rows(`SELECT snippet(capf, 0, '[', ']', '...', 6) AS s FROM capf WHERE capf MATCH 'fund'`)[0]?.s);
    t("fts5_highlight", () => this.#rows(`SELECT highlight(capf, 0, '<b>', '</b>') AS s FROM capf WHERE capf MATCH 'sewer'`)[0]?.s);
    t("fts5_unicode61", () => this.#rows(`SELECT count(*) AS c FROM capf WHERE capf MATCH 'OAKLAND'`)[0]?.c);

    /* column-scoped MATCH: needed if metadata is folded into FTS columns */
    t("fts5_multicol_scoped", () => {
      this.sql.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS capf2 USING fts5(title, body)`);
      this.sql.exec(`DELETE FROM capf2`);
      this.sql.exec(`INSERT INTO capf2 (title, body) VALUES ('sewer report', 'unrelated text')`);
      return this.#rows(`SELECT rowid FROM capf2 WHERE capf2 MATCH 'title:sewer'`).length;
    });

    /* JSON1: would allow querying unprojected frontmatter without a facet table */
    t("json_extract", () => this.#rows(`SELECT json_extract('{"a":{"b":7}}','$.a.b') AS v`)[0]?.v);
    t("json_each", () => this.#rows(`SELECT count(*) AS c FROM json_each('["x","y","z"]')`)[0]?.c);
    t("json_valid", () => this.#rows(`SELECT json_valid('{"a":1}') AS v`)[0]?.v);

    /* generated column + index on an expression: the other way to index JSON */
    t("generated_column", () => {
      this.sql.exec(`CREATE TABLE IF NOT EXISTS gtest (j TEXT, k TEXT GENERATED ALWAYS AS (json_extract(j,'$.k')) VIRTUAL)`);
      this.sql.exec(`INSERT INTO gtest (j) VALUES ('{"k":"ratified"}')`);
      return this.#rows(`SELECT k FROM gtest LIMIT 1`)[0]?.k;
    });
    t("index_on_expression", () => {
      this.sql.exec(`CREATE INDEX IF NOT EXISTS gidx ON gtest(json_extract(j,'$.k'))`);
      return "created";
    });
    t("collate_nocase", () => this.#rows(`SELECT 'A' = 'a' COLLATE NOCASE AS v`)[0]?.v);
    t("query_plan", () => this.#rows(`EXPLAIN QUERY PLAN SELECT * FROM meta WHERE current_state = 'x'`).length);
    return out;
  }

  /* ---------- seed ---------- */
  seed(docs) {
    this.sql.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS ftsm USING fts5(body, tokenize='unicode61')`
    );
    const cols = WIDE_COLS.join(", ");
    const qs = WIDE_COLS.map(() => "?").join(", ");
    const t0 = Date.now();
    this.ctx.storage.transactionSync(() => {
      for (const d of docs) {
        this.sql.exec(
          `INSERT INTO meta (rowid_, id, ${cols}) VALUES (?, ?, ${qs})`,
          d.row, d.id, ...WIDE_COLS.map((c) => d.meta[c] ?? null)
        );
        /* FTS rowid aligned with meta.rowid_ -> integer join */
        this.sql.exec(`INSERT INTO ftsm (rowid, body) VALUES (?, ?)`, d.row, d.body);
      }
    });
    const wideMs = Date.now() - t0;

    const before = this.ctx.storage.sql.databaseSize;
    const t1 = Date.now();
    this.ctx.storage.transactionSync(() => {
      for (const d of docs) {
        for (const c of WIDE_COLS) {
          const v = d.meta[c];
          if (v === undefined || v === null) continue;
          const isTime = c === "created" || c === "last_updated";
          const isNum = c === "annotations_open";
          this.sql.exec(
            `INSERT OR IGNORE INTO facets (row, field, vtext, vnum, vtime) VALUES (?, ?, ?, ?, ?)`,
            d.row, c, String(v), isNum ? Number(v) : null, isTime ? String(v) : null
          );
        }
      }
    });
    const eavMs = Date.now() - t1;
    const eavBytes = this.ctx.storage.sql.databaseSize - before;
    return { seeded: docs.length, wideMs, eavMs, eavBytes, dbBytes: this.ctx.storage.sql.databaseSize };
  }

  /* ---------- ground truth ----------
     No index used: read every row and decide in JS. Slow on purpose. Any
     indexed implementation must agree with this exactly.                    */
  truth(spec) {
    const t = Date.now();
    const all = this.#rows(`SELECT rowid_ AS row, id, ${WIDE_COLS.join(", ")} FROM meta`);
    const bodies = new Map(this.#rows(`SELECT rowid AS row, body FROM ftsm`).map((r) => [r.row, r.body]));
    const toks = (s) => (String(s).toLowerCase().match(/[a-z0-9]{2,}/g) || []);
    let hits = all.filter((r) => {
      for (const [f, v] of Object.entries(spec.eq || {})) if (String(r[f]) !== String(v)) return false;
      if (spec.after && !(String(r[spec.after.field]) > spec.after.value)) return false;
      if (spec.terms?.length) {
        const set = new Set(toks(bodies.get(r.row) || ""));
        for (const tk of spec.terms) if (!set.has(tk)) return false;
      }
      return true;
    });
    if (spec.sort) {
      const { field, dir } = spec.sort;
      /* direction applies to the sort field ONLY. id is the stable tiebreak and
         is always ascending, matching `ORDER BY f DESC, id`. Getting this wrong
         is invisible until a field has ties, which is why it survived 30 docs. */
      hits.sort((a, b) => {
        const x = a[field] ?? "", y = b[field] ?? "";
        if (x !== y) return (x < y ? -1 : 1) * (dir === "desc" ? -1 : 1);
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    } else hits.sort((a, b) => (a.id < b.id ? -1 : 1));
    return { ids: hits.map((r) => r.id), ms: Date.now() - t };
  }

  /* ---------- WIDE: one SQL statement, compiled the way a real op would ---------- */
  wide(spec) {
    const where = [], args = [];
    if (spec.terms?.length) { where.push(`ftsm MATCH ?`); args.push(spec.terms.map((t) => `"${t}"`).join(" AND ")); }
    for (const [f, v] of Object.entries(spec.eq || {})) { where.push(`m.${f} = ?`); args.push(String(v)); }
    if (spec.after) { where.push(`m.${spec.after.field} > ?`); args.push(spec.after.value); }
    const from = spec.terms?.length
      ? `FROM ftsm JOIN meta m ON m.rowid_ = ftsm.rowid`
      : `FROM meta m`;
    const order = spec.sort
      ? `ORDER BY m.${spec.sort.field} ${spec.sort.dir === "desc" ? "DESC" : "ASC"}, m.id`
      : `ORDER BY m.id`;
    const q = `SELECT m.id ${from} ${where.length ? "WHERE " + where.join(" AND ") : ""} ${order}`;
    const t = Date.now();
    const ids = this.#rows(q, ...args).map((r) => r.id);
    return { ids, ms: Date.now() - t, sql: q, args };
  }

  /* ---------- EAV: same semantics through the facet table ---------- */
  eav(spec) {
    const parts = [], args = [];
    for (const [f, v] of Object.entries(spec.eq || {})) {
      parts.push(`SELECT row FROM facets WHERE field = ? AND vtext = ?`); args.push(f, String(v));
    }
    if (spec.after) {
      parts.push(`SELECT row FROM facets WHERE field = ? AND vtime > ?`); args.push(spec.after.field, spec.after.value);
    }
    if (spec.terms?.length) {
      parts.push(`SELECT rowid AS row FROM ftsm WHERE ftsm MATCH ?`);
      args.push(spec.terms.map((t) => `"${t}"`).join(" AND "));
    }
    const inner = parts.length ? parts.join(" INTERSECT ") : `SELECT rowid_ AS row FROM meta`;
    const order = spec.sort
      ? `ORDER BY m.${spec.sort.field} ${spec.sort.dir === "desc" ? "DESC" : "ASC"}, m.id`
      : `ORDER BY m.id`;
    const q = `SELECT m.id FROM (${inner}) x JOIN meta m ON m.rowid_ = x.row ${order}`;
    const t = Date.now();
    const ids = this.#rows(q, ...args).map((r) => r.id);
    return { ids, ms: Date.now() - t };
  }

  /* ---------- facet counts: the sidebar ----------
     Every value of `field` with how many results carry it, over the CURRENT
     filtered set. This is the shape a filter sidebar needs to render.        */
  facetCounts(spec, field) {
    const where = [], args = [];
    if (spec.terms?.length) { where.push(`ftsm MATCH ?`); args.push(spec.terms.map((t) => `"${t}"`).join(" AND ")); }
    for (const [f, v] of Object.entries(spec.eq || {})) { where.push(`m.${f} = ?`); args.push(String(v)); }
    const from = spec.terms?.length ? `FROM ftsm JOIN meta m ON m.rowid_ = ftsm.rowid` : `FROM meta m`;
    const q = `SELECT m.${field} AS v, count(*) AS c ${from} ${where.length ? "WHERE " + where.join(" AND ") : ""} GROUP BY m.${field} ORDER BY c DESC`;
    const t = Date.now();
    const rows = this.#rows(q, ...args);
    return { buckets: rows.map((r) => [r.v, r.c]), ms: Date.now() - t };
  }

  /* one page of results vs every id in the set (select-all) */
  page(spec, limit, offset) {
    const t = Date.now();
    const full = this.wide(spec);
    const ids = full.ids.slice(offset, offset + limit);
    return { ids, total: full.ids.length, ms: Date.now() - t };
  }
  pageSql(spec, limit, offset) {
    const where = [], args = [];
    if (spec.terms?.length) { where.push(`ftsm MATCH ?`); args.push(spec.terms.map((t) => `"${t}"`).join(" AND ")); }
    for (const [f, v] of Object.entries(spec.eq || {})) { where.push(`m.${f} = ?`); args.push(String(v)); }
    const from = spec.terms?.length ? `FROM ftsm JOIN meta m ON m.rowid_ = ftsm.rowid` : `FROM meta m`;
    const order = spec.sort ? `ORDER BY m.${spec.sort.field} ${spec.sort.dir === "desc" ? "DESC" : "ASC"}, m.id` : `ORDER BY m.id`;
    const t = Date.now();
    const ids = this.#rows(`SELECT m.id ${from} ${where.length ? "WHERE " + where.join(" AND ") : ""} ${order} LIMIT ? OFFSET ?`, ...args, limit, offset).map((r) => r.id);
    return { ids, ms: Date.now() - t };
  }

  /* ranked + snippet: the "rich listing" shape */
  ranked(terms, limit) {
    const t = Date.now();
    const rows = this.#rows(
      `SELECT m.id, bm25(ftsm) AS score, snippet(ftsm, 0, '[', ']', '...', 8) AS snip
       FROM ftsm JOIN meta m ON m.rowid_ = ftsm.rowid
       WHERE ftsm MATCH ? ORDER BY score LIMIT ?`,
      terms.map((x) => `"${x}"`).join(" AND "), limit
    );
    return { n: rows.length, ms: Date.now() - t, sample: rows[0] || null };
  }

  plan(spec) {
    const w = this.wide(spec);
    return this.#rows(`EXPLAIN QUERY PLAN ${w.sql}`, ...w.args).map((r) => r.detail);
  }

  /* ---------- compound booleans mixing text and metadata ----------
     FTS5 MATCH only knows the text table, so a nested boolean that mixes text
     terms with metadata selectors cannot be handed to MATCH whole. Under AND it
     is an INTERSECT of two cheap sets. Under OR it must be a UNION, and under
     NOT an EXCEPT, of a text subquery and a metadata subquery. Measured because
     UNION over a broad text arm could degrade to whole-corpus work.
       shape A: (text:term OR state=S) AND type=T
       shape B: type=T NOT text:term                                          */
  compound(shape, term, state, type) {
    const m = `"${term}"`;
    const t = Date.now();
    let q, args;
    if (shape === "orAnd") {
      q = `SELECT m.id FROM meta m WHERE m.rowid_ IN (
             SELECT rowid FROM ftsm WHERE ftsm MATCH ?
             UNION
             SELECT rowid_ FROM meta WHERE current_state = ?
           ) AND m.object_type = ? ORDER BY m.id`;
      args = [m, state, type];
    } else {
      q = `SELECT m.id FROM meta m WHERE m.object_type = ? AND m.rowid_ NOT IN (
             SELECT rowid FROM ftsm WHERE ftsm MATCH ?
           ) ORDER BY m.id`;
      args = [type, m];
    }
    const ids = this.#rows(q, ...args).map((r) => r.id);
    return { ids, ms: Date.now() - t };
  }
  compoundTruth(shape, term, state, type) {
    const toks = (s) => new Set(String(s).toLowerCase().match(/[a-z0-9]{2,}/g) || []);
    const rows = this.#rows(`SELECT rowid_ AS row, id, object_type, current_state FROM meta`);
    const bodies = new Map(this.#rows(`SELECT rowid AS row, body FROM ftsm`).map((r) => [r.row, r.body]));
    const hasTerm = (r) => toks(bodies.get(r.row) || "").has(term);
    const hits = rows.filter((r) =>
      shape === "orAnd"
        ? (hasTerm(r) || r.current_state === state) && r.object_type === type
        : r.object_type === type && !hasTerm(r)
    );
    return { ids: hits.map((r) => r.id).sort() };
  }

  /* deliberate sabotage: drop one row's facet postings so a filter silently
     under-reports, to confirm the truth implementation refuses it. */
  sabotage(row) { this.sql.exec(`DELETE FROM facets WHERE row = ?`, row); return { dropped: row }; }

  async fetch(req) {
    const { op, args } = await req.json();
    const map = {
      capabilities: () => this.capabilities(),
      seed: () => this.seed(args.docs),
      truth: () => this.truth(args.spec),
      wide: () => this.wide(args.spec),
      eav: () => this.eav(args.spec),
      facetCounts: () => this.facetCounts(args.spec, args.field),
      page: () => this.page(args.spec, args.limit, args.offset),
      pageSql: () => this.pageSql(args.spec, args.limit, args.offset),
      ranked: () => this.ranked(args.terms, args.limit),
      plan: () => this.plan(args.spec),
      compound: () => this.compound(args.shape, args.term, args.state, args.type),
      compoundTruth: () => this.compoundTruth(args.shape, args.term, args.state, args.type),
      sabotage: () => this.sabotage(args.row),
    };
    return Response.json(map[op]());
  }
}

export default {
  async fetch(req, env) {
    return env.FACET.get(env.FACET.idFromName("probe2")).fetch(req);
  },
};
