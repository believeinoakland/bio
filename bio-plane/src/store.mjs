import { DurableObject } from "cloudflare:workers";
/* The catalog's own frontmatter parser. References are read from the document
   with the same code that later checks them, so the store's projection and the
   checker's view cannot disagree about what the document says. */
import { parseFrontmatter, checkGatheringGrammar, MECHANICAL_FIELD_SETS,
         checkBundle } from "../checks/bio-checks.mjs";
import { SCHEMA as SCHEMA_TEXT } from "./schema.mjs";
/* The retrieval surface is compiled, never assembled here. This file executes
   statements and maintains the index; it builds no query. That is what makes the
   D-15 viewer gate a SINGLE compilation point rather than a convention: there is
   no second place in the plane where a query could come from. */
import { compile, textOf, FTS_COLUMNS, GATE_MARK, FIELDS, DEFAULT_FACETS, IDS_MAX } from "./query.mjs";

/* BIO store, plane layer, step 1.
 *
 * Replaces storeReadAdapter_, storeWriteAdapter_, indexWriteAdapter_ and the
 * Drive traversal helpers from promotion-service.gs (about 890 lines) with SQL
 * against the Durable Object's embedded SQLite.
 *
 * What is deliberately absent, because the plane makes it unnecessary:
 *   - findBundleFolder_ / allBundleFolders_ / typeRootFor_ traversal: a primary
 *     key replaces four type roots and getFoldersByName.
 *   - duplicateBundleIds_ / duplicatePaths_ / duplicatePathError_: the refusal
 *     machinery for Drive's same-name defect. A primary key cannot collide.
 *   - completeInterruptedCreation_ and the .pending manifest-last marker: one
 *     transaction cannot be half applied.
 *   - the deadline, checkpoint, cursor and budget parameters: no execution
 *     ceiling.
 *
 * What is preserved exactly: promotion is the sole writer of live state, the
 * CAS is the lost-update floor, history is append-only, the register is the
 * root of trust, and the gate runs over a byte-complete image.
 */

/* The SHA-256 of the empty string: the canonical base of a creation, as the
   accelerator recorded it and as the check catalog recognises it. */
const EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const INLINE_MAX = 1024 * 1024; // spill to R2 above 1MB; measured hard limit ~2MiB

export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => this.#migrate());
  }

  #migrate() {
    const bare = (this.env.SCHEMA || SCHEMA_TEXT || "").split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
    for (const s of bare.split(";")) { const t = s.trim(); if (t) this.sql.exec(t); }
    /* CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
       columns added after a store was first written need adding by hand. Done
       here rather than in a versioned migration ladder because these are
       additive and nullable: an older row simply has no writer, which is exactly
       what a hand-authored promotion means. */
    /* members.name became members.cover on 2026-07-24. A field called "name"
       invites an administrator to type a legal name, which is the whole exposure
       the cover-and-handle split exists to prevent, so the column carries the
       honest word. Renamed rather than aliased: two words for one thing is how
       the drift this repo keeps finding gets started. */
    const memberCols = [...this.sql.exec(`PRAGMA table_info(members)`)].map((r) => r.name);
    if (memberCols.includes("name") && !memberCols.includes("cover"))
      this.sql.exec(`ALTER TABLE members RENAME COLUMN name TO cover`);
    for (const [table, column, decl] of [
      ["manifest", "writer", "TEXT"],
      ["manifest", "operation", "TEXT"],
      /* S-10 step 1: the metadata projection the retrieval surface filters and
         sorts on. Probe 2 (development/RETRIEVAL-SUBSTRATE.md) measured that the
         original nine columns cover about half of what real frontmatter carries,
         and that typed indexed columns beat a facet table by roughly 9x on write
         cost and 5.5x on space while never being slower. So: a column for every
         field the UX filters on, and fm_json for the per-schema tail, since
         information@1, information@2, problem@1 and project@1 carry different
         field sets and more versions are coming. All nullable and additive, so
         an older row simply has an empty projection until the backfill below
         re-derives it from bundle.md. */
      ["bundles", "schema_id", "TEXT"],
      ["bundles", "produced_mode", "TEXT"],
      ["bundles", "capability_tier", "TEXT"],
      ["bundles", "source_locator", "TEXT"],
      ["bundles", "source_authority", "TEXT"],
      ["bundles", "source_retrieved", "TEXT"],
      ["bundles", "source_status", "TEXT"],
      ["bundles", "content_hash", "TEXT"],
      ["bundles", "monitor_enabled", "INTEGER"],
      ["bundles", "monitor_frequency", "TEXT"],
      ["bundles", "monitor_last_checked", "TEXT"],
      ["bundles", "annotations_open", "INTEGER"],
      ["bundles", "reeval_flag", "INTEGER"],
      ["bundles", "reeval_since", "TEXT"],
      ["bundles", "reeval_source", "TEXT"],
      ["bundles", "fm_json", "TEXT"],
      /* S-10 step 2: the row key the text index is aligned on. FTS5 addresses
         rows by integer rowid, and probe 2 chose an integer join over a string
         join for text-plus-metadata queries, so a bundle needs a stable integer
         of its own. NOT the table's implicit rowid: that is an implementation
         detail SQLite is entitled to renumber, and an index keyed on a number
         the engine may change is an index that can silently point at the wrong
         document. */
      ["bundles", "fts_id", "INTEGER"],
    ]) {
      const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].some((r) => r.name === column);
      if (!have) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    /* Indexed because probe 2 recorded the difference in the query PLAN, not
       only the latency: without an index a filter is a full table scan whose
       cost grows with the corpus, and at 20,000 rows a scan is still fast
       enough to look like success. */
    for (const c of ["schema_id", "produced_mode", "source_authority", "source_status",
                     "monitor_frequency", "reeval_flag", "annotations_open"])
      this.sql.exec(`CREATE INDEX IF NOT EXISTS bundles_${c} ON bundles(${c})`);
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS bundles_fts_id ON bundles(fts_id)`);

    /* S-10 step 2: the text index, inside the Durable Object, which is what
       probe 1 measured and chose. Not an exported index: cost tracks result size
       rather than corpus size, and the whole surface stays behind the two-bucket
       fence by construction because it never leaves the object that holds the
       working corpus.

       Five columns rather than one blob, so a member can scope a term to the
       part of the document they mean. `meta` carries the flattened frontmatter,
       which is what makes the per-schema tail searchable without a column per
       schema version: information@1, information@2, problem@1 and project@1
       carry different field sets and more versions are coming.

       A regular content table, not contentless and not external-content. A
       contentless table cannot produce snippet(), and Bob settled that a result
       carries provenance and context rather than bare ids. External content
       requires the text to be reconstructable from one table with matching
       columns, and `body` spans every inline text file in the bundle. The cost
       is a second copy of the text, measured at roughly 430 bytes per document. */
    this.sql.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS bundles_fts USING fts5(
         ${FTS_COLUMNS.join(", ")}, tokenize='unicode61')`);

    /* Backfill. Rows written before these columns existed carry an empty
       projection, and nothing downstream can tell that apart from a bundle whose
       frontmatter genuinely says nothing. Re-derive from the stored bundle.md,
       which is the authority anyway. Bounded per construction because a Durable
       Object has a CPU budget: the development record is 30 bundles and this is
       milliseconds, but a large store finishes over successive constructions
       rather than timing out on one. */
    this.#backfillProjection(500);
  }

  /* The projection derived from a bundle.md, using the CATALOG'S OWN parser so
     the store's view and the checker's view cannot disagree about what the
     document says. Returns nulls rather than guesses when frontmatter does not
     parse: a wrong value in a filterable column is worse than an absent one,
     because a filter silently under-reports and the member cannot tell. */
  static projectionOf(bundleMdText) {
    const empty = {
      schema_id: null, produced_mode: null, capability_tier: null,
      source_locator: null, source_authority: null, source_retrieved: null,
      source_status: null, content_hash: null, monitor_enabled: null,
      monitor_frequency: null, monitor_last_checked: null, annotations_open: null,
      reeval_flag: null, reeval_since: null, reeval_source: null, fm_json: null,
    };
    if (typeof bundleMdText !== "string") return empty;
    let fm = null;
    try { fm = parseFrontmatter(bundleMdText).data; } catch { return empty; }
    if (!fm || typeof fm !== "object") return empty;
    const s = (v) => (typeof v === "string" && v !== "" ? v : v === 0 ? "0" : v == null ? null : String(v));
    const nested = (block, key) => {
      const b = fm[block];
      return b && typeof b === "object" && !Array.isArray(b) ? b[key] : undefined;
    };
    const bool = (v) => (v === true ? 1 : v === false ? 0 : null);
    const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    /* reeval_pending is a {flag, since, source} record, but the catalog also
       tolerates a legacy boolean, so both shapes are read rather than one
       assumed. */
    const rp = fm.reeval_pending;
    const rpObj = rp && typeof rp === "object" && !Array.isArray(rp);
    return {
      schema_id: s(fm.schema),
      produced_mode: s(nested("produced_by", "mode")),
      capability_tier: s(nested("produced_by", "capability_tier")),
      source_locator: s(nested("source", "locator")),
      source_authority: s(nested("source", "authority")),
      source_retrieved: s(nested("source", "retrieved")),
      source_status: s(fm.source_status),
      content_hash: s(fm.content_hash),
      monitor_enabled: bool(nested("monitoring", "enabled")),
      monitor_frequency: s(nested("monitoring", "frequency")),
      monitor_last_checked: s(nested("monitoring", "last_checked")),
      annotations_open: num(fm.annotations_open),
      reeval_flag: rpObj ? bool(rp.flag) : bool(rp),
      reeval_since: rpObj ? s(rp.since) : null,
      reeval_source: rpObj ? s(rp.source) : null,
      fm_json: JSON.stringify(fm),
    };
  }

  static PROJECTION_COLS = [
    "schema_id", "produced_mode", "capability_tier", "source_locator",
    "source_authority", "source_retrieved", "source_status", "content_hash",
    "monitor_enabled", "monitor_frequency", "monitor_last_checked",
    "annotations_open", "reeval_flag", "reeval_since", "reeval_source", "fm_json",
  ];

  /* Write the projection for one bundle. Called inside promote's transaction, so
     the projection can never be a revision behind the document. */
  #writeProjection(bundleId, bundleMdText) {
    const p = Store.projectionOf(bundleMdText);
    const set = Store.PROJECTION_COLS.map((c) => `${c}=?`).join(", ");
    this.sql.exec(
      `UPDATE bundles SET ${set} WHERE bundle_id=?`,
      ...Store.PROJECTION_COLS.map((c) => p[c]), bundleId
    );
    return p;
  }

  /* The integer the text index is keyed on. Allocated once per bundle and never
     reassigned while the bundle exists, so a revision replaces its own index row
     rather than orphaning one. MAX+1 rather than a sequence because it is
     allocated inside promote's transaction, and a Durable Object runs one
     transaction at a time, so there is no race to lose. */
  #ftsIdFor(bundleId) {
    const cur = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
    if (cur && cur.fts_id !== null && cur.fts_id !== undefined) return cur.fts_id;
    const next = (this.#one(`SELECT COALESCE(MAX(fts_id), 0) AS m FROM bundles`).m || 0) + 1;
    this.sql.exec(`UPDATE bundles SET fts_id=? WHERE bundle_id=?`, next, bundleId);
    return next;
  }

  /* Delete-then-insert rather than an FTS5 UPDATE, because a revision can change
     which files exist and an in-place update of a virtual table row is the shape
     that leaves stale terms behind. Called inside promote's transaction, so the
     text index cannot be a revision behind the corpus. */
  #writeText(bundleId, files) {
    const fid = this.#ftsIdFor(bundleId);
    const t = textOf(bundleId, files);
    this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, fid);
    this.sql.exec(
      `INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}) VALUES (?, ${FTS_COLUMNS.map(() => "?").join(", ")})`,
      fid, ...FTS_COLUMNS.map((c) => t[c]));
    return { fts_id: fid, chars: FTS_COLUMNS.reduce((n, c) => n + t[c].length, 0) };
  }

  #filesOf(bundleId) {
    return this.#rows(`SELECT path, content FROM files WHERE bundle_id=?`, bundleId)
      .map((r) => ({ path: r.path, text: r.content }));
  }

  /* One backfill for both derived structures. A row is stale if it has no
     projection or no text index, which covers a row written before either
     existed and a row whose index was cleared for repair. Bounded per pass
     because a Durable Object has a CPU budget: a large store finishes over
     successive constructions rather than timing out on one. */
  #backfillProjection(limit) {
    const stale = this.#rows(
      `SELECT bundle_id, fm_json IS NULL AS need_proj, fts_id IS NULL AS need_text
         FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL ORDER BY bundle_id LIMIT ?`, limit);
    let n = 0, t = 0;
    for (const r of stale) {
      const files = this.#filesOf(r.bundle_id);
      const md = files.find((f) => f.path === "bundle.md");
      if (!md || md.text === null) continue;
      if (r.need_proj) { this.#writeProjection(r.bundle_id, md.text); n++; }
      if (r.need_text) { this.#writeText(r.bundle_id, files); t++; }
    }
    return {
      reprojected: n, reindexed: t,
      remaining: this.#one(`SELECT count(*) c FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL`).c,
    };
  }

  /** Re-derive the projection and the text index for rows that lack one. Exposed
   *  because a deploy runs the bounded pass once at construction and a large
   *  store may need more than one. Idempotent: a row that has both is left
   *  alone. */
  reproject({ limit = 500 } = {}) {
    return this.#backfillProjection(limit);
  }

  /** The projected metadata for one bundle, or a json_extract query over the
   *  per-schema tail. This is what the retrieval compiler will filter on. */
  projection({ bundleId = null, jsonPath = null, jsonEquals = null, limit = 200 } = {}) {
    const cols = ["bundle_id", "object_type", "group_id", "title", "current_state",
                  "prior_state", "created", "last_updated", "criticality",
                  "classification", "bundle_sha", ...Store.PROJECTION_COLS].join(", ");
    if (bundleId) return this.#one(`SELECT ${cols} FROM bundles WHERE bundle_id=?`, bundleId);
    if (jsonPath !== null && jsonEquals !== null)
      return this.#rows(
        `SELECT ${cols} FROM bundles WHERE json_extract(fm_json, ?) = ? ORDER BY bundle_id LIMIT ?`,
        jsonPath, jsonEquals, limit);
    return this.#rows(`SELECT ${cols} FROM bundles ORDER BY bundle_id LIMIT ?`, limit);
  }

  /** EXPLAIN QUERY PLAN for representative filters, so a test can assert the
   *  index is USED rather than trusting that creating it was enough. */
  projectionPlan() {
    const out = {};
    for (const c of ["source_status", "produced_mode", "schema_id", "reeval_flag"])
      out[c] = this.#rows(`EXPLAIN QUERY PLAN SELECT bundle_id FROM bundles WHERE ${c} = ?`, "x")
        .map((r) => r.detail);
    return out;
  }

  /** Test and repair support: clear a projection so the backfill path can be
   *  exercised against a row that looks like it predates the columns. */
  projectionClear({ bundleId = null, text = true } = {}) {
    const set = Store.PROJECTION_COLS.map((c) => `${c}=NULL`).join(", ");
    if (bundleId) this.sql.exec(`UPDATE bundles SET ${set} WHERE bundle_id=?`, bundleId);
    else this.sql.exec(`UPDATE bundles SET ${set}`);
    /* The text index is cleared with the projection by default, because the two
       are one derived structure with one backfill and clearing half of it would
       leave the repair path untested on the half that stayed. */
    if (text) {
      if (bundleId) {
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL`);
      }
    }
    return { ok: true, scope: bundleId || "ALL", text };
  }

  /* ---- S-10 step 3: the retrieval surface ----
   *
   * Five verbs, one call, run where the data is, which is the shape D-26 chose.
   *   search  the query string, compiled by query.mjs
   *   filter  selectors in that same string, plus facet counts to drive a sidebar
   *   list    every hit arrives with full provenance, per Bob's decision
   *   sort    any projected field, always with the declared id tiebreak
   *   select  mode=ids returns the WHOLE set, which is a different request
   *
   * The store builds no SQL. Every statement comes from compile(), and this
   * method refuses to execute one that does not carry the viewer gate, so a
   * query path that skipped D-15's single compilation point fails loudly instead
   * of quietly returning more than the viewer may see.
   */
  #runQuery(stmt, tally) {
    if (!stmt || typeof stmt.sql !== "string" || !stmt.sql.includes(GATE_MARK))
      throw new Error("REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)");
    tally.applied++;
    return this.#rows(stmt.sql, ...stmt.args);
  }

  search(input = {}) {
    const mode = input.mode === "ids" ? "ids" : input.mode === "count" ? "count" : "page";
    const plan = compile(input);
    const tally = { applied: 0 };
    const total = this.#runQuery(plan.statements.count(), tally)[0]?.n ?? 0;

    const out = {
      query: {
        q: String(input.q ?? ""), terms: plan.terms, match: plan.match,
        sort: plan.sort, warnings: plan.warnings, mode,
      },
      /* The gate is reported, not assumed. `scope` is DENY when the caller
         presented no recognisable viewer, which is the fail-closed answer, and
         `applied` counts the statements that carried the gate. */
      gate: { scope: plan.gate, applied: 0 },
      total, limit: plan.limit, offset: plan.offset,
    };

    if (mode === "page") {
      out.hits = this.#runQuery(plan.statements.page(), tally);
    } else if (mode === "ids") {
      /* Select-all. A distinct operation from a page because acting on a
         selection needs every id in the set, not the fifty on screen, and the
         payload and the cost are different. Ordered identically to the page so
         the set an operator selected is the set they were looking at. */
      const ids = this.#runQuery(plan.statements.ids(), tally).map((r) => r.bundle_id);
      out.ids = ids;
      out.truncated = ids.length >= IDS_MAX;
    }

    if (input.facets !== false && mode !== "count") {
      out.facets = {};
      for (const f of plan.facetFields)
        out.facets[f] = this.#runQuery(plan.statements.facet(f), tally);
    }

    /* The affordance that makes AND safe. AND's failure mode is nothing found
       because of a typo or one word too many, which reads as "the system has
       nothing" when the truth is "nothing matches all of these". So a bare
       conjunction that returns zero is re-run as OR and the wider count is
       offered. It costs one extra query only in the case that already returned
       nothing. */
    out.widen = null;
    if (total === 0 && plan.widenable && input.widen !== false) {
      const or = compile({ ...input, implicitOp: "or" });
      const n = this.#runQuery(or.statements.count(), tally)[0]?.n ?? 0;
      if (n > 0) out.widen = { interpretation: "OR", total: n, q: String(input.q ?? ""),
                               detail: "no bundle matches all of these terms; this many match any of them" };
    }
    out.gate.applied = tally.applied;
    return out;
  }

  /** The fields the surface knows, so a UI can build its own controls from the
   *  plane's vocabulary rather than a copy of it that drifts. */
  searchFields() {
    return {
      fields: Object.fromEntries(Object.entries(FIELDS).map(([k, f]) =>
        [k, { type: f.type, freeText: !!f.fts, column: f.col }])),
      ftsColumns: FTS_COLUMNS, defaultFacets: DEFAULT_FACETS, idsMax: IDS_MAX,
      syntax: [
        "bare words are AND, ranked by relevance",
        "\"quoted phrase\" is one unit",
        "term* is a prefix match",
        "-term and NOT term exclude",
        "OR and parentheses nest",
        "field:value filters; free-text fields (title, locator, authority) match text, enumerations match exactly",
        "field:>value, field:<value, field:a..b compare and range",
        "has:field asks whether the field carries any value",
        "fm:path and fm:path=value reach frontmatter no column projects",
        "sort:field and sort:-field order the result",
      ],
    };
  }

  /** The verifier for the claim that the index cannot diverge from the corpus.
   *
   *  "Maintained in the same transaction" is a design, and a design is not a
   *  measurement. This re-derives the expected text row for every bundle from
   *  the stored files and compares it against what the index actually holds,
   *  which is the only thing that can tell the difference between an index that
   *  cannot diverge and one that has not diverged yet. Paginated and resumable
   *  by cursor, the same shape as the conformance audit. */
  searchIndexCheck({ after = "", limit = 200 } = {}) {
    const cap = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)));
    const rows = this.#rows(
      `SELECT bundle_id, fts_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`, after, cap);
    const findings = [];
    for (const r of rows) {
      if (r.fts_id === null || r.fts_id === undefined) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_FTS_ID", detail: "the bundle has no text index key" });
        continue;
      }
      const have = this.#one(
        `SELECT ${FTS_COLUMNS.join(", ")} FROM bundles_fts WHERE rowid=?`, r.fts_id);
      if (!have) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_INDEX_ROW", ftsId: r.fts_id });
        continue;
      }
      const want = textOf(r.bundle_id, this.#filesOf(r.bundle_id));
      const bad = FTS_COLUMNS.filter((c) => String(have[c] ?? "") !== String(want[c] ?? ""));
      if (bad.length)
        findings.push({ bundleId: r.bundle_id, finding: "DIVERGED", columns: bad,
                        chars: Object.fromEntries(bad.map((c) => [c, [String(have[c] ?? "").length, String(want[c] ?? "").length]])) });
    }
    /* Orphans: an index row no bundle claims. It matters because fts_id is
       allocated as MAX+1, so an orphan can be inherited by a later bundle and
       hand it a deleted document's text. */
    const orphans = this.#rows(
      `SELECT rowid AS fts_id FROM bundles_fts WHERE rowid NOT IN (SELECT fts_id FROM bundles WHERE fts_id IS NOT NULL) LIMIT 100`)
      .map((r) => r.fts_id);
    const last = rows.length ? rows[rows.length - 1].bundle_id : null;
    return {
      checked: rows.length, findings, orphans,
      counts: { bundles: this.#one(`SELECT count(*) c FROM bundles`).c,
                indexed: this.#one(`SELECT count(*) c FROM bundles_fts`).c,
                keyed: this.#one(`SELECT count(*) c FROM bundles WHERE fts_id IS NOT NULL`).c },
      cursor: rows.length === cap ? last : null,
      ok: findings.length === 0 && orphans.length === 0,
    };
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- reads: what storeReadAdapter_ did, without the re-resolution tax ---- */

  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }

  /** The canonical snapshot path for a file archived under a snapshot key.
   *
   *  The key goes in the FILENAME, not in a directory: `bundle.md` archived
   *  under key K is `_history/bundle_K.md`, and `data/changes.json` is
   *  `_history/data/changes_K.json`. This is not a style choice. The bundle
   *  format is authoritative (see schema.mjs line 3) and the check catalog
   *  parses exactly this shape, so a directory-per-key projection makes every
   *  snapshot in every bundle unaccountable to C-12.2 while losing no bytes.
   *  That is precisely what happened: 168 findings across 30 bundles, all of
   *  them this one mistake, invisible until the catalog could be run. */
  static snapPath(path, snapKey) {
    const cut = path.lastIndexOf("/");
    const dir = cut === -1 ? "" : path.slice(0, cut + 1);
    const name = cut === -1 ? path : path.slice(cut + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1
      ? `_history/${dir}${name}_${snapKey}`
      : `_history/${dir}${name.slice(0, dot)}_${snapKey}${name.slice(dot)}`;
  }


  /* A whole-store conformance pass, run WHERE THE DATA IS.
   *
   * The benchmark that produced this: gating 20,000 bundles from outside costs
   * about 2,060 seconds on the deployed plane and 63 locally, and roughly 97% of
   * the difference is one network round trip per image. The store and the checks
   * are not the constraint; fetching bundles one at a time is. The catalog is a
   * pure function over an injected filesystem and the images are already here, so
   * the pass belongs here too.
   *
   * Paginated rather than exhaustive, because a Durable Object has a CPU budget
   * and 20,000 bundles is about 63 seconds of work. A page of a few hundred is
   * well inside it, and a hundred calls instead of twenty thousand captures
   * essentially all of the benefit. The cursor is the last bundle id seen, so a
   * pass is resumable and does not depend on a snapshot of the store.
   *
   * Blob-backed files are declared elided, exactly as the gate does: existence
   * assertions see them, byte checks skip them, and capture integrity was proven
   * at write time by the capture op rather than re-proven here.
   */
  async auditPass({ after = "", limit = 200 } = {}) {
    const cap = Math.max(1, Math.min(1000, Number(limit) || 200));
    const known = new Set(this.#rows(`SELECT bundle_id FROM bundles`).map((r) => r.bundle_id));
    const page = this.#rows(
      `SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`, after, cap);
    const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
    const te = new TextEncoder();
    const sha256 = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));

    const tally = {}; const offenders = [];
    let clean = 0, withErrors = 0;
    for (const row of page) {
      const img = this.readImage(row.bundle_id) || {};
      const files = new Map(), elided = new Set();
      for (const [path, v] of Object.entries(img)) {
        if (typeof v === "string") files.set(path, v); else elided.add(path);
      }
      const { findings } = await checkBundle({
        folderName: row.bundle_id, files, elidedPaths: elided,
        sha256, sha512, resolveTarget: (id) => known.has(id),
      });
      const errs = findings.filter((f) => f.severity === "error");
      if (!errs.length) { clean++; continue; }
      withErrors++;
      for (const e of errs) tally[e.check] = (tally[e.check] || 0) + 1;
      /* Bounded: a pass over a broken store must not answer with a megabyte of
         repetition. The tally says how much, these say what it looks like. */
      if (offenders.length < 20)
        offenders.push({ bundleId: row.bundle_id,
                         errors: errs.slice(0, 5).map((e) => ({ check: e.check, detail: e.message })) });
    }
    const last = page.length ? page[page.length - 1].bundle_id : after;
    return {
      ok: true, checked: page.length, clean, withErrors, tally, offenders,
      cursor: page.length === cap ? last : null,
      total: known.size,
    };
  }

  /** The byte-complete image the gate consumes. One bundle, one call, no
   *  per-file resolution. This is the operation that cost ~43s on Drive.
   *
   *  Projects three things the catalog requires and an earlier version of this
   *  method did not: canonical snapshot paths, a verbatim promotion record per
   *  manifest entry, and the manifest's own entries. The promotion record is
   *  load-bearing beyond its own check: classifyDivergence reconstructs the
   *  bundle.md hash chain from the per-file sha256 lists inside it, and C-20.1
   *  uses it to establish what a mechanical writer actually changed. Without
   *  the records both are unreachable rather than passing. */
  readImage(bundleId) {
    const img = {};
    /* A blob reference carries its size as well as its hash, because a caller
       rewriting one file of a bundle has to hand every OTHER file back to
       promote unchanged, and promote needs bytes to record. Without this a
       partial writer silently drops what it did not mention: the monitor's
       first tick deleted the provenance register of every bundle it touched. */
    for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content
        : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
    /* Per-snapshot file hashes, collected while walking history so the
       promotion records below can carry them without a second pass. */
    const snapFiles = new Map();
    for (const r of this.sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId)) {
      img[Store.snapPath(r.path, r.snap_key)] =
        r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      if (!snapFiles.has(r.snap_key)) snapFiles.set(r.snap_key, []);
      snapFiles.get(r.snap_key).push({ name: r.path, sha256: r.sha256 });
    }
    const entries = [];
    for (const r of this.sql.exec(`SELECT snap_key, kind, base, author, created, files_json, writer, operation FROM manifest WHERE bundle_id=?`, bundleId)) {
      /* files_json holds the files as WRITTEN by this promotion, with their
         hashes. Two consumers want different views of it and both are right:
         the manifest entry wants names, because C-20.1 asks whether a later
         entry touched bundle.md; the verbatim promotion record wants the
         hashes, because that is how classifyDivergence rebuilds the chain and
         how C-20.1 decides whether live is still this promotion's result. An
         earlier version stored only names here and put the PRE-image hashes in
         the record, which made every mechanical audit unknowable and silently
         skipped. */
      const written = JSON.parse(r.files_json);
      const writtenPairs = written.map((f) => typeof f === "string" ? { name: f, sha256: null } : f);
      const files = writtenPairs.map((f) => f.name);
      const snapshotted = (snapFiles.get(r.snap_key) || []).map((f) => f.name);
      entries.push({ key: r.snap_key, kind: r.kind, base: r.base, author: r.author,
                     created: r.created, files, snapshotted,
                     ...(r.writer ? { writer: r.writer, operation: r.operation } : {}) });
      /* The verbatim promotion record, in the shape the original accelerator
         wrote and the catalog reads: what was targeted, what it was based on,
         and the hash of every file as promoted. */
      img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({
        target: bundleId, base: r.base, files: writtenPairs,
        created: r.created, author: r.author, skill_version: "bio-plane",
        /* C-20.1 reads the writer and operation from HERE, not from the
           manifest, so a mechanical claim that is not in the promotion record is
           a claim the auditor never sees. */
        ...(r.writer ? { writer: r.writer, operation: r.operation } : {}),
      }, null, 2);
    }
    if (entries.length) {
      entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      img["_history/manifest.json"] = JSON.stringify({ entries }, null, 2);
    }
    return Object.keys(img).length ? img : null;
  }

  /* Every bundle, or a page of them.
   *
   * Measured: 81ms at 5,000 bundles and 434ms at 20,000, which is honestly linear
   * and about two seconds at 100,000. It returned everything because nothing had
   * ever needed less, and a caller that wants everything can still have it, since
   * breaking that would break the browser, the audit, and the migration verifier
   * at once.
   *
   * So paging is OPT-IN and shaped like the audit's: a cursor that is the last
   * identifier seen, which makes it resumable and independent of any snapshot of
   * the store. A caller that passes no limit gets what it always got. */
  listBundles(filter = {}) {
    let q = `SELECT bundle_id, object_type, current_state, title, last_updated, bundle_sha FROM bundles`;
    const w = [], a = [];
    if (filter.type) { w.push(`object_type=?`); a.push(filter.type); }
    if (filter.state) { w.push(`current_state=?`); a.push(filter.state); }
    if (filter.after) { w.push(`bundle_id > ?`); a.push(filter.after); }
    if (w.length) q += ` WHERE ` + w.join(" AND ");
    q += ` ORDER BY bundle_id`;
    const limit = Number(filter.limit);
    if (!Number.isFinite(limit) || limit <= 0) return this.#rows(q, ...a);
    const cap = Math.min(5000, Math.floor(limit));
    const rows = this.#rows(q + ` LIMIT ?`, ...a, cap);
    /* The shape changes only when paging was asked for, so no existing caller
       has to learn a new answer. */
    return { bundles: rows, cursor: rows.length === cap ? rows[rows.length - 1].bundle_id : null,
             total: this.#one(`SELECT COUNT(*) AS n FROM bundles`).n };
  }

  /** The index projection. One stored artifact on Drive, one query here.
   *  Note the absence of `locator`: there is no substrate path to leak. */
  buildIndex() {
    return {
      generated: new Date().toISOString(),
      version: 2,
      bundles: this.#rows(
        `SELECT bundle_id AS id, object_type, current_state, title, last_updated, bundle_sha AS sha256 FROM bundles ORDER BY bundle_id`),
    };
  }

  /** C-6.2: every reference whose target does not exist. A join, not a scan. */
  danglingRefs() {
    return this.#rows(
      `SELECT r.bundle_id, r.target_id FROM refs r
       LEFT JOIN bundles b ON b.bundle_id=r.target_id WHERE b.bundle_id IS NULL`);
  }

  /** Streaming whole-store pass. Peak memory is one image, measured at 37KB,
   *  against 558MB if every image is materialised at once. */
  *eachImage() {
    for (const r of this.#rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`))
      yield [r.bundle_id, this.readImage(r.bundle_id)];
  }

  /* ---- writes: promotion is the sole writer of live state ---- */

  /**
   * One transaction. Either the whole bundle advances or nothing does.
   *
   * base is the CAS. It must equal the current bundle_sha, or null when
   * creating. A stale base is refused, which is the lost-update floor that
   * manifest base-sha CAS provided on Drive.
   */
  promote(pkg) {
    if (!pkg || typeof pkg !== "object") return { ok: false, reason: "NO_BODY", detail: "promote requires a POSTed package" };
    const { bundleId, base, files, meta, snapKey, author, register = [] } = pkg;
    /* A mechanical writer must name an operation the catalog knows, because
       C-20.1 holds it to that operation's declared field set and refuses one
       that names nothing. Validated here so a daemon cannot write an
       unaccountable mechanical revision and discover the problem at
       ratification, when the revision is already in the history. */
    const writer = pkg.writer === "mechanical" ? "mechanical" : null;
    const operation = writer ? pkg.operation : null;
    if (writer && !(operation in MECHANICAL_FIELD_SETS))
      return { ok: false, reason: "UNDECLARED_OPERATION",
               detail: `a mechanical promotion names one of: ${Object.keys(MECHANICAL_FIELD_SETS).join(", ")}`,
               got: operation ?? null };
    /* References used to arrive in the payload AND live in the frontmatter, and
       only the frontmatter was ever checked, so the two could disagree with
       nothing noticing (DEBT D-21). The document is authoritative. A caller
       still sending the old field is refused rather than quietly overridden,
       because a silent override is how the two drifted apart in the first
       place. */
    if (Array.isArray(pkg.refs) && pkg.refs.length)
      return { ok: false, reason: "REFS_IN_PAYLOAD",
               detail: "references are read from bundle.md frontmatter, not from the promote payload; remove the refs field" };
    if (!bundleId || !Array.isArray(files) || !meta) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);

      if (cur && base === null)
        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };
      if (!cur && base !== null)
        return { ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" };
      if (cur && cur.bundle_sha !== base)
        return { ok: false, reason: "CAS_STALE", expected: cur.bundle_sha, got: base };

      for (const f of files) {
        if (f.text !== undefined && f.text.length > INLINE_MAX)
          return { ok: false, reason: "OVERSIZE_INLINE", path: f.path, bytes: f.text.length };
      }
      /* A gathering queue is validated at the WRITE, not only at ratification.
         C-18.5's grammar exists because a leaked write token must be able to
         litter the queue without steering a member's session: the exporter
         renders these fields as quoted data and the grammar bounds what they can
         carry. Refusing at the write means a malformed request never lands, so
         nobody has to read it to find out it was junk. The catalog's own function
         does the judging; the store supplies the file and reports its findings
         verbatim. */
      /* Historical replay is not authorship. The record's own history contains
         gathering queues written before this grammar existed, and a migration
         replays them verbatim through this same front door. Refusing them would
         mean the plane cannot faithfully hold its own past, so a replay says so
         explicitly and the manifest entry records it forever. The exemption is
         narrow by construction: it skips THIS check and nothing else, and it
         cannot hide, because a replayed revision is marked in the history a
         reader can see. */
      const gj = pkg.replay ? null : files.find((f) => f.path === "data/gathering.json");
      if (gj && typeof gj.text === "string") {
        const gf = [];
        checkGatheringGrammar({ files: new Map([["data/gathering.json", gj.text]]) }, gf);
        const errs = gf.filter((x) => x.severity === "error");
        if (errs.length)
          return { ok: false, reason: "GATHERING_REFUSED",
                   findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
      }

      // history is append-only: snapshot the outgoing live state first
      /* A creation records a manifest entry with the empty-string SHA as its
         base and no snapshot, because there is no prior state to snapshot.
         The accelerator did exactly this and the catalog depends on it:
         classifyDivergence anchors the hash chain on entry bases, and C-20.1
         recognises a creation by that same sentinel. Omitting the entry, which
         is what this method did before, leaves the chain with no first link. */
      if (!cur) {
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          bundleId, snapKey, pkg.replay ? "promotion-replay" : "promotion", EMPTY_STRING_SHA, author,
          meta.last_updated || new Date().toISOString(),
          JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      }
      if (cur) {
        for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
          this.sql.exec(
            `INSERT OR REPLACE INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,
            bundleId, snapKey, r.path, r.content, r.blob_sha, r.sha256, new Date().toISOString());
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          /* The catalog switches on kind === 'promotion' (C-12.2, C-20.1), so
             that is the vocabulary. A creation is still distinguishable, by a
             base equal to the empty-string SHA, which is how the accelerator
             recorded it and how C-20.1 recognises one. */
          bundleId, snapKey, pkg.replay ? "promotion-replay" : "promotion", base, author,
          /* The revision's own time, never the server's wall clock. C-12.1
             compares live last_updated against earlier entries' created, and a
             signed ratification legitimately backdates last_updated to the
             transition instant. Stamping server time here made that comparison
             fail on honest content. */
          meta.last_updated || new Date().toISOString(),
          JSON.stringify(files.map(f => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      }

      /* Silent deletion has no legitimate use in an append-only record.
       *
       * promote writes a WHOLE image, so a caller that mentions one file removes
       * every other one. That is efficient and it is a trap, and it has already
       * cost twice: the monitor's first tick destroyed the provenance register of
       * every bundle it touched, and the browser's revise path did the same thing
       * for anyone who edited a captured document. Both were the DEFAULT
       * behaviour of a caller doing the obvious thing.
       *
       * So a promotion that drops a path the previous revision had must name it.
       * A deliberate deletion is still possible and is now on the record; an
       * accidental one is refused with the paths listed. Replay is exempt because
       * the history it reconstructs may legitimately contain deletions, and a
       * replayed revision is already marked as such in the manifest.
       */
      if (cur && !pkg.replay) {
        const had = new Set(this.#rows(`SELECT path FROM files WHERE bundle_id=?`, bundleId).map((r) => r.path));
        const now2 = new Set(files.map((f) => f.path));
        const declared = new Set(Array.isArray(pkg.drop) ? pkg.drop : []);
        const dropped = [...had].filter((p) => !now2.has(p) && !declared.has(p));
        if (dropped.length)
          return { ok: false, reason: "FILES_DROPPED", paths: dropped.sort(),
                   detail: "this promotion would remove files the previous revision had. "
                         + "Carry them forward, or name them in drop[] to delete them on purpose." };
      }
      this.sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f of files)
        this.sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId, f.path, f.text ?? null, f.blobSha ?? null, f.bytes, f.sha256);

      const newSha = files.find(f => f.path === "bundle.md")?.sha256;
      if (!newSha) return { ok: false, reason: "NO_BUNDLE_MD" };

      this.sql.exec(
        `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,prior_state,created,last_updated,criticality,classification,bundle_sha,row_version)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,COALESCE((SELECT row_version+1 FROM bundles WHERE bundle_id=?),1))
         ON CONFLICT(bundle_id) DO UPDATE SET
           object_type=excluded.object_type, title=excluded.title,
           current_state=excluded.current_state, prior_state=excluded.prior_state,
           last_updated=excluded.last_updated, criticality=excluded.criticality,
           classification=excluded.classification, bundle_sha=excluded.bundle_sha,
           row_version=bundles.row_version+1`,
        bundleId, meta.object_type, meta.group, meta.title, meta.current_state, meta.prior_state ?? null,
        meta.created, meta.last_updated, meta.criticality ?? null, meta.classification ?? null, newSha, bundleId);

      /* Projected from the document, every promotion, so the table is a view of
         bundle.md rather than a second place to state the same thing. */
      this.sql.exec(`DELETE FROM refs WHERE bundle_id=?`, bundleId);
      const md = files.find((f) => f.path === "bundle.md");
      const fmRefs = md && typeof md.text === "string"
        ? (parseFrontmatter(md.text).data?.references ?? []) : [];
      for (const t of Array.isArray(fmRefs) ? fmRefs : []) {
        if (!t || typeof t !== "object" || typeof t.target !== "string") continue;
        this.sql.exec(`INSERT OR REPLACE INTO refs (bundle_id,target_id,kind) VALUES (?,?,?)`,
          bundleId, t.target, typeof t.rel === "string" ? t.rel : "");
      }

      for (const c of register)
        this.sql.exec(
          `INSERT OR REPLACE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
          c.sha256, bundleId, c.path, c.encoding ?? "utf8", c.bytes, new Date().toISOString());

      /* S-10 step 1: derive the metadata projection from the bundle.md being
         written, inside this same transaction. Inside, because a projection
         maintained separately is a projection that can be a revision behind the
         document, and the whole point of it is to be filtered on. From the
         document rather than from `meta`, because these fields have no
         representation in meta at all: the document is not the better source,
         it is the only one. */
      const bundleMd = files.find(f => f.path === "bundle.md");
      this.#writeProjection(bundleId, bundleMd?.text ?? null);

      /* S-10 step 2: the text index, written in the SAME transaction as the
         files and the projection it describes. Inside, because an index
         maintained by a separate pass is an index that can be a revision behind
         the corpus, and a text index that disagrees with the documents does not
         merely return stale hits, it returns hits for text that no longer exists
         and misses text that does. Either the whole bundle advances with its
         index or nothing does. */
      this.#writeText(bundleId, files);

      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version };
    });
  }

  /* ---- coordination: what LockService and the nextSeq race did ---- */

  allocId(prefix, year) {
    return this.ctx.storage.transactionSync(() => {
      const scope = `${prefix}-${year}`;
      const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);
      const n = cur ? cur.next : 1;
      this.sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);
      return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };
    });
  }

  acquireLease(bundleId, actor, ttlMs) {
    return this.ctx.storage.transactionSync(() => {
      const now = Date.now();
      const cur = this.#one(`SELECT actor, expires, base_sha FROM leases WHERE bundle_id=?`, bundleId);
      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)
        return { ok: false, heldBy: cur.actor, until: cur.expires };
      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
      const expires = new Date(now + ttlMs).toISOString();
      this.sql.exec(
        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,
        bundleId, actor, new Date(now).toISOString(), expires, b ? b.bundle_sha : "");
      // the lease returns the CURRENT bundle sha as the edit base, so re-anchor
      // is structural and the CAS is anchored on live state
      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };
    });
  }

  stats() {
    const n = (t) => this.#one(`SELECT count(*) c FROM ${t}`).c;
    return {
      bundles: n("bundles"), files: n("files"), history: n("history"),
      refs: n("refs"), register: n("register"), indexed: n("bundles_fts"),
      dbBytes: this.ctx.storage.sql.databaseSize,
    };
  }

  /* Eviction. The store is append-only by doctrine, so removal is deliberate,
     never implicit, and admin-only at the control plane. Two modes: one bundle
     with its whole lineage, or everything.

     seq is deliberately NOT reset. allocid must never reissue an identifier
     that has already existed, so a purged store keeps counting from where it
     stopped. A purge that reset the counter would make identifiers ambiguous
     across the purge boundary, which is worse than a gap.

     R2 is untouched. Registered captures are immutable and content-addressed,
     so orphaning them costs storage but cannot corrupt anything. Reclaiming
     them is a separate sweep against the register, not part of this. */
  purge({ bundleId = null } = {}) {
    const TABLES = ["files", "history", "manifest", "refs", "register", "leases"];
    const before = this.stats();
    this.ctx.storage.transactionSync(() => {
      if (bundleId) {
        /* The text index row goes with the bundle it describes, and it goes
           first, while the row that names its rowid still exists. An orphaned
           FTS row is worse than a missing one: fts_id is allocated as MAX+1, so
           a later bundle can be handed the same integer and inherit the deleted
           document's text. */
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t} WHERE bundle_id=?`, bundleId);
        this.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`);
        this.sql.exec(`DELETE FROM bundles`);
      }
    });
    const after = this.stats();
    const d = (k) => before[k] - after[k];
    return {
      ok: true, scope: bundleId || "ALL", before, after,
      removed: { bundles: d("bundles"), files: d("files"), history: d("history"),
                 refs: d("refs"), register: d("register") },
    };
  }

  /* ---- credentials ----

     A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap
     credential rather than the credential. It is spent once, exchanging itself
     for an operator-chosen password whose hash lives here. Recovery is to
     overwrite ADMIN_TOKEN in the dashboard, which clears the consumed marker
     and returns the instance to unclaimed. That makes the group's Cloudflare
     login the root of trust, which is the only thing they reliably still have
     when a password is lost. */

  static #enc = new TextEncoder();

  static async #derive(password, salt, iterations) {
    const key = await crypto.subtle.importKey(
      "raw", Store.#enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: Store.#enc.encode(salt), iterations }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))]
      .map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  bootstrapState(tokenFp = null) {
    const b = this.#one(`SELECT consumed_at, token_fp FROM bootstrap WHERE id=1`);
    const roles = this.#rows(`SELECT role, updated FROM credentials`);
    const spent = !!(b && b.consumed_at);
    /* A different bootstrap secret than the one that was spent means the
       operator has rotated it in the dashboard, which is the recovery gesture.
       Re-arm rather than lock them out. */
    const rearmed = spent && tokenFp !== null && b.token_fp !== tokenFp;
    return {
      claimed: spent && !rearmed,
      rearmed,
      consumedAt: rearmed ? null : (b?.consumed_at || null),
      roles,
    };
  }

  /* Spending the bootstrap credential. Refuses if already spent, so a leaked
     ADMIN_TOKEN cannot silently re-claim a running instance. */
  async claim({ role = "admin", password, tokenFp = null } = {}) {
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    const st = this.bootstrapState(tokenFp);
    if (st.claimed)
      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };
    await this.setPassword({ role, password });
    const now = new Date().toISOString();
    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,
                     token_fp=excluded.token_fp`, now, tokenFp);
    return { ok: true, role, consumedAt: now };
  }

  async setPassword({ role, password, iterations = 100000 }) {
    const salt = Store.#rand(16);
    const hash = await Store.#derive(password, salt, iterations);
    this.sql.exec(
      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)
       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,
         iterations=excluded.iterations, updated=excluded.updated`,
      role, salt, hash, iterations, new Date().toISOString());
    return { ok: true, role };
  }

  /* Exchanges a password for a bearer token so the password does not travel on
     every later request. Constant-time comparison is not meaningful over a
     network round trip at this granularity, but the derived-hash compare avoids
     ever holding the password beyond this call. */
  async login({ role = "admin", password, ttlSeconds = 43200 } = {}) {
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    if (!c) return { ok: false, reason: "NO_SUCH_ROLE" };
    const got = await Store.#derive(String(password ?? ""), c.salt, c.iterations);
    if (got !== c.hash) return { ok: false, reason: "BAD_PASSWORD" };
    const token = Store.#rand(32);
    const expires = Date.now() + ttlSeconds * 1000;
    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());
    this.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES (?,?,?,?)`,
      token, role, expires, new Date().toISOString());
    return { ok: true, role, token, expires };
  }

  session(token) {
    if (!token) return null;
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token=?`, token);
    if (!s) return null;
    if (s.expires < Date.now()) { this.sql.exec(`DELETE FROM sessions WHERE token=?`, token); return null; }
    return { role: s.role, expires: s.expires };
  }

  /* ---- members: each person their own credential, admin-invited ----

     The invite is spent exactly like the bootstrap credential is spent: its
     hash is cleared on enrollment, so possession of an old invite buys
     nothing against an enrolled member. Passwords live only as PBKDF2
     hashes under credentials role 'member:<id>'. */

  async memberAdd({ memberId, cover, name, role = "member" } = {}) {
    /* `name` is still read, because an older caller may send it, but the field
       is a cover and the response says so. */
    const label = typeof cover === "string" && cover.trim() ? cover : name;
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(memberId || ""))
      return { ok: false, reason: "BAD_MEMBER_ID", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (!label || typeof label !== "string")
      return { ok: false, reason: "NO_COVER",
               detail: "a cover is the label you use to tell participants apart; it need not be, and often should not be, a legal name" };
    if (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "EXISTS", memberId };
    const invite = Store.#rand(16);
    const hash = await Store.#sha256(invite);
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO members (member_id,cover,role,status,invite_hash,created,updated) VALUES (?,?,?,?,?,?,?)`,
      memberId, label, role === "admin" ? "admin" : "member", "invited", hash, now, now);
    /* The plaintext invite appears exactly once, here, for handing to the
       person. It is never readable again. */
    return { ok: true, memberId, invite };
  }

  async enroll({ memberId, invite, password } = {}) {
    const m = this.#one(`SELECT status, invite_hash FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.status === "revoked") return { ok: false, reason: "REVOKED" };
    if (!m.invite_hash) return { ok: false, reason: "ALREADY_ENROLLED" };
    if (!invite || (await Store.#sha256(invite)) !== m.invite_hash)
      return { ok: false, reason: "BAD_INVITE" };
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    await this.setPassword({ role: `member:${memberId}`, password });
    this.sql.exec(`UPDATE members SET status='active', invite_hash=NULL, updated=? WHERE member_id=?`,
      new Date().toISOString(), memberId);
    return { ok: true, memberId };
  }

  memberList() {
    return { members: this.#rows(
      `SELECT member_id, cover, role, status, created, updated,
              CASE WHEN invite_hash IS NULL THEN 0 ELSE 1 END AS invite_pending
       FROM members ORDER BY member_id`) };
  }

  memberSet({ memberId, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const m = this.#one(`SELECT status FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    this.sql.exec(`UPDATE members SET status=?, updated=? WHERE member_id=?`,
      status, new Date().toISOString(), memberId);
    if (status === "revoked") {
      /* Revocation is immediate: live sessions die with it, and the member's
         registered keys stop attesting. */
      this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
      this.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id=?`, memberId);
    }
    return { ok: true, memberId, status };
  }

  /* ---- signers: the registered-key projection ---- */

  signerAdd({ keyB64, memberId, comment } = {}) {
    if (!keyB64 || !/^AAAA[A-Za-z0-9+/=]+$/.test(keyB64))
      return { ok: false, reason: "BAD_KEY", detail: "expected the base64 field of an ssh-ed25519 public key" };
    if (!this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "NO_SUCH_MEMBER" };
    this.sql.exec(
      `INSERT INTO signers (key_b64,member_id,comment,status,added) VALUES (?,?,?,'active',?)
       ON CONFLICT(key_b64) DO UPDATE SET member_id=excluded.member_id,
         comment=excluded.comment, status='active'`,
      keyB64, memberId, comment ?? null, new Date().toISOString());
    return { ok: true, keyB64, memberId };
  }

  signerList() {
    return { signers: this.#rows(`SELECT key_b64, member_id, comment, status, added FROM signers ORDER BY added`) };
  }

  signerSet({ keyB64, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    if (!this.#one(`SELECT key_b64 FROM signers WHERE key_b64=?`, keyB64))
      return { ok: false, reason: "NO_SUCH_KEY" };
    this.sql.exec(`UPDATE signers SET status=? WHERE key_b64=?`, status, keyB64);
    return { ok: true, keyB64, status };
  }

  /* ---- ratification support: facts out, published rows in ----

     The gate and the signature check run at the control plane, which also
     owns all R2 traffic. This store only hands out the facts and commits
     the published rows in one transaction. */

  /* Facts ratify needs that are not in the image: the row for its CAS check and
     the active signer set. The manifest, history, and dangling-ref lists are
     still returned because the migrate tool and the older gate consumed them;
     plane-gate/1.0 reads all of that out of the image instead, since the catalog
     wants the bundle as a filesystem rather than as query results. */
  gateFacts(bundleId) {
    const row = this.#one(
      `SELECT bundle_id, object_type, current_state, bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
    if (!row) return { ok: false, reason: "ABSENT", bundleId };
    return {
      ok: true, row,
      manifest: this.#rows(`SELECT snap_key, kind, base, created FROM manifest WHERE bundle_id=? ORDER BY created`, bundleId),
      history: this.#rows(`SELECT snap_key, sha256 FROM history WHERE bundle_id=? AND path='bundle.md'`, bundleId),
      registers: this.#rows(`SELECT capture_sha, path, bytes FROM register WHERE bundle_id=?`, bundleId),
      dangling: this.#rows(
        `SELECT r.target_id FROM refs r LEFT JOIN bundles b ON b.bundle_id=r.target_id
         WHERE r.bundle_id=? AND b.bundle_id IS NULL`, bundleId).map((r) => r.target_id),
      signers: this.#rows(
        `SELECT s.key_b64, s.member_id FROM signers s
         JOIN members m ON m.member_id=s.member_id
         WHERE s.status='active' AND m.status='active'`),
    };
  }

  publish({ bundleId, bundleSha, attestorKey, attestorMember, gateVersion, sigArmored, shas } = {}) {
    if (!bundleId || !bundleSha || !attestorKey || !gateVersion || !sigArmored || !Array.isArray(shas))
      return { ok: false, reason: "MALFORMED" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha FROM published_bundles WHERE bundle_id=?`, bundleId);
      const existed = !!(cur && cur.bundle_sha === bundleSha);
      const now = new Date().toISOString();
      this.sql.exec(
        `INSERT INTO published_bundles (bundle_id,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET bundle_sha=excluded.bundle_sha,
           ratified_at=excluded.ratified_at, attestor_key=excluded.attestor_key,
           attestor_member=excluded.attestor_member, gate_version=excluded.gate_version,
           sig_armored=excluded.sig_armored`,
        bundleId, bundleSha, now, attestorKey, attestorMember ?? null, gateVersion, sigArmored);
      /* Append-only: a hash once published stays answerable forever, across
         any number of re-ratifications. */
      for (const s of shas)
        this.sql.exec(
          `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
           ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
          s.sha256, bundleId, s.path, s.kind, s.bytes ?? null, now);
      return { ok: true, bundleId, bundleSha, existed, ratifiedAt: now };
    });
  }

  /* ---- the doorbell, store side ---- */

  /* 7a: answers ONLY from the published projection. Working material is not
     consulted, so there is nothing to leak: a hash that was never ratified
     is indistinguishable from a hash that never existed. */
  verifySha(sha) {
    const matches = this.#rows(
      `SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published`, sha);
    return { published: matches.length > 0, sha256: sha, matches };
  }

  publishedList() {
    return { bundles: this.#rows(
      `SELECT bundle_id, bundle_sha, ratified_at, attestor_member, gate_version FROM published_bundles ORDER BY bundle_id`) };
  }

  /* 7b: the knock. Rate accounting and the row land in one transaction, so
     an attacker cannot slip past the caps on a race. The worst case is by
     construction a full inbox. */
  knock({ knockId, sha256, bytes, content, inR2, note, contact,
          ipBucket, globalBucket, perIpLimit, globalLimit } = {}) {
    return this.ctx.storage.transactionSync(() => {
      const cnt = (b) => this.#one(`SELECT count FROM knock_rate WHERE bucket=?`, b)?.count || 0;
      if (cnt(ipBucket) >= perIpLimit) return { ok: false, reason: "RATE_IP" };
      if (cnt(globalBucket) >= globalLimit) return { ok: false, reason: "RATE_GLOBAL" };
      for (const b of [ipBucket, globalBucket])
        this.sql.exec(`INSERT INTO knock_rate (bucket,count) VALUES (?,1)
                       ON CONFLICT(bucket) DO UPDATE SET count=count+1`, b);
      /* Prune buckets from past windows; bucket names embed their window. */
      const win = globalBucket.split(":").pop();
      this.sql.exec(`DELETE FROM knock_rate WHERE bucket NOT LIKE '%:' || ?`, win);
      this.sql.exec(
        `INSERT INTO inbox (knock_id,sha256,bytes,content,in_r2,note,contact,received,status)
         VALUES (?,?,?,?,?,?,?,?,'new')`,
        knockId, sha256, bytes, content ?? null, inR2 ? 1 : 0,
        (note || "").slice(0, 2000), (contact || "").slice(0, 300), new Date().toISOString());
      return { ok: true, knockId, sha256, bytes };
    });
  }

  inboxList(status) {
    return { inbox: this.#rows(
      `SELECT knock_id, sha256, bytes, in_r2, note, contact, received, status, resolved, resolved_by
       FROM inbox ${status ? "WHERE status=?" : ""} ORDER BY received DESC`,
      ...(status ? [status] : [])) };
  }

  inboxGet(knockId) {
    const r = this.#one(`SELECT knock_id, sha256, bytes, content, in_r2, note, contact, received, status FROM inbox WHERE knock_id=?`, knockId);
    return r ? { ok: true, item: r } : { ok: false, reason: "NOT_FOUND" };
  }

  inboxResolve({ knockId, status, by } = {}) {
    if (!["pulled", "discarded", "new"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const r = this.#one(`SELECT knock_id FROM inbox WHERE knock_id=?`, knockId);
    if (!r) return { ok: false, reason: "NOT_FOUND" };
    this.sql.exec(`UPDATE inbox SET status=?, resolved=?, resolved_by=? WHERE knock_id=?`,
      status, new Date().toISOString(), by ?? null, knockId);
    return { ok: true, knockId, status };
  }

  static async #sha256(v) {
    const b = await crypto.subtle.digest("SHA-256", Store.#enc.encode(v));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  async fetch(req) {
    const url = new URL(req.url);
    const op = url.pathname.slice(1);
    const body = req.method === "POST" ? await req.json() : null;
    const t = Date.now();
    try {
      const map = {
        promote: () => this.promote(body),
        allocid: () => this.allocId(url.searchParams.get("prefix"), url.searchParams.get("year")),
        lease: () => this.acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 300000),
        image: () => this.readImage(url.searchParams.get("id")),
        file: () => this.readFile(url.searchParams.get("id"), url.searchParams.get("path")),
        list: () => this.listBundles({ type: url.searchParams.get("type"), state: url.searchParams.get("state"),
                                       after: url.searchParams.get("after") || null,
                                       limit: url.searchParams.get("limit") }),
        index: () => this.buildIndex(),
        projection: () => this.projection({
          bundleId: url.searchParams.get("id"),
          jsonPath: url.searchParams.get("jsonPath"),
          jsonEquals: url.searchParams.get("jsonEquals"),
        }),
        /* Retrieval. `viewer` is stamped by the control plane and is never taken
           from the caller's own parameters there; here it is simply read, and an
           absent one compiles to the deny predicate. */
        search: () => this.search({
          q: url.searchParams.get("q") ?? "",
          viewer: url.searchParams.get("viewer"),
          sort: url.searchParams.get("sort"),
          dir: url.searchParams.get("dir"),
          limit: url.searchParams.get("limit"),
          offset: url.searchParams.get("offset"),
          mode: url.searchParams.get("mode"),
          facets: url.searchParams.get("facets") === "none" ? false
                : url.searchParams.get("facets") ? url.searchParams.get("facets").split(",") : null,
          widen: url.searchParams.get("widen") !== "0",
          snippetChars: Number(url.searchParams.get("snippet")) || 12,
        }),
        searchfields: () => this.searchFields(),
        searchindexcheck: () => this.searchIndexCheck({
          after: url.searchParams.get("after") || "",
          limit: url.searchParams.get("limit"),
        }),
        projectionplan: () => this.projectionPlan(),
        projectionclear: () => this.projectionClear(body || {}),
        reproject: () => this.reproject(body || {}),
        dangling: () => ({ dangling: this.danglingRefs() }),
        stats: () => this.stats(),
        bootstrap: () => this.bootstrapState(url.searchParams.get("fp")),
        claim: () => this.claim({ ...(body || {}), tokenFp: url.searchParams.get("fp") }),
        login: async () => {
          /* A member login is refused unless the member is active, so
             revocation closes the front door as well as the sessions. */
          const role = body?.role || "admin";
          if (role.startsWith("member:")) {
            const m = this.#one(`SELECT status FROM members WHERE member_id=?`, role.slice(7));
            if (!m || m.status !== "active") return { ok: false, reason: "NO_SUCH_ROLE" };
          }
          return this.login(body || {});
        },
        memberadd: () => this.memberAdd(body || {}),
        enroll: () => this.enroll(body || {}),
        memberlist: () => this.memberList(),
        memberset: () => this.memberSet(body || {}),
        signeradd: () => this.signerAdd(body || {}),
        signerlist: () => this.signerList(),
        signerset: () => this.signerSet(body || {}),
        gatefacts: () => this.gateFacts(url.searchParams.get("id")),
        audit: () => this.auditPass({ after: url.searchParams.get("after") || "",
                                      limit: url.searchParams.get("limit") }),
        publish: () => this.publish(body || {}),
        verify: () => this.verifySha((url.searchParams.get("sha256") || "").toLowerCase()),
        publishedlist: () => this.publishedList(),
        knock: () => this.knock(body || {}),
        inboxlist: () => this.inboxList(url.searchParams.get("status") || null),
        inboxget: () => this.inboxGet(url.searchParams.get("id")),
        inboxresolve: () => this.inboxResolve(body || {}),
        setpassword: () => this.setPassword(body || {}),
        session: () => ({ session: this.session(url.searchParams.get("t")) }),
        purge: () => this.purge({ bundleId: url.searchParams.get("bundleId") }),
      };
      if (!map[op]) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
      return Response.json({ ok: true, ms: Date.now() - t, result: await map[op]() });
    } catch (e) {
      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });
    }
  }
}

export default {
  fetch(req, env) {
    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
  },
};
