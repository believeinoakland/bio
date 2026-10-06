/* query-language's tests run the compiled statements against a real SQLite (node:sqlite, FTS5) holding the
   tables the statements name, each with the columns its owner's read contract states (record-core R37's
   `bundles` (its `project` included, N426: membership's gate fences by it) and `bundles_fts`, membership's `members` and `project_participants`, content R45,
   extraction's `capture_text` and its index, entities' `resolutions`, inquiry's `inquiry_basis`, basis-versions'
   `inquiry_basis_version_legs`, provenance's `register`, extraction's `readings`, the `observation_log`).
   The module holds no database: every test compiles a plan at the interface and runs what it returns.
   `world({projection: {table, key}})` holds the projection in a relation of its own (R25, N106): retrieval R2's
   columns, `fm_json` and `fts_id` there, keyed by bundle, and none of them on `bundles`, so a statement that reads
   one off `bundles` fails; every compile of that world is given the relation. `world({fields: {<field>: {table,
   key, col}}})` likewise holds each named field's column in its own table (R26), under the name `col`, and nowhere
   else. Every database refuses a compound SELECT of more than five terms, the ceiling workerd imposes (measured,
   2026-07-25), so a statement that would fail on the plane fails here. */
import { DatabaseSync } from "node:sqlite";
import { compile, FIELDS, PROVENANCE_COLS, FTS_COLUMNS } from "../../../src/query.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* retrieval R2's projection columns (its R61 moves them, with `fts_id`, off `bundles`). */
export const PROJECTION_COLS = ["schema_id", "produced_mode", "capability_tier", "source_locator", "source_authority",
  "source_retrieved", "source_status", "content_hash", "monitor_enabled", "monitor_frequency", "monitor_last_checked",
  "annotations_open", "reeval_flag", "reeval_since", "reeval_source", "fm_json", "action_kind", "action_risk_tier",
  "action_counterparty_state", "action_resolution", "action_clock_next", "action_clock_overdue"];

/* workerd's measured ceiling on the terms of one compound SELECT. */
export const WORKERD_COMPOUND_SELECT = 5;

export function world({ projection = null, fields = null } = {}) {
  const db = new DatabaseSync(":memory:", { limits: { compoundSelect: WORKERD_COMPOUND_SELECT } });
  const P = projection;
  /* R26: each named field's registry column, held in its own table and on neither `bundles` nor the projection. */
  const F = new Map(Object.entries(fields || {}).map(([name, r]) => [FIELDS[name].col, r]));
  /* A T33 field (`rel`, R29) is its owner's and is on no table here unless a relation names it. */
  const cols = [...new Set([...PROVENANCE_COLS, ...Object.values(FIELDS).filter((f) => !f.rel || F.has(f.col)).map((f) => f.col)])]
    .filter((c) => c !== "bundle_id");
  const decl = (c) => `${c} ${["annotations_open", "reeval_flag", "monitor_enabled", "inquiry_basis_count",
    "action_risk_tier", "action_clock_overdue", "fts_id"].includes(c) ? "INTEGER" : "TEXT"}`;
  const onProj = (c) => !!P && !F.has(c) && (c === "fts_id" || PROJECTION_COLS.includes(c));
  const all = ["fts_id", "fm_json", ...cols];
  /* record-core R37's `project` (N426): the project a bundle belongs to, empty or NULL for none. */
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, project TEXT, ${all.filter((c) => !onProj(c) && !F.has(c)).map(decl).join(", ")})`);
  if (P) db.exec(`CREATE TABLE ${P.table} (${P.key} TEXT PRIMARY KEY, ${all.filter(onProj).map(decl).join(", ")})`);
  const tables = new Map();
  for (const [c, r] of F) tables.set(r.table, { key: r.key, cols: [...(tables.get(r.table)?.cols || []), [c, r.col]] });
  for (const [t, { key, cols: tc }] of tables)
    db.exec(`CREATE TABLE ${t} (${key} TEXT PRIMARY KEY, ${tc.map(([c, col]) => decl(c).replace(c, col)).join(", ")})`);
  db.exec(`CREATE VIRTUAL TABLE bundles_fts USING fts5(${FTS_COLUMNS.join(", ")}, tokenize='unicode61')`);
  db.exec(`CREATE TABLE members (member_id TEXT PRIMARY KEY, role TEXT, status TEXT);
    CREATE TABLE project_participants (project_id TEXT, member_id TEXT, state TEXT);
    CREATE TABLE content (content_id TEXT PRIMARY KEY, capture_sha TEXT, bundle_id TEXT, extent_kind TEXT, extent TEXT,
      ref TEXT, chain TEXT, derivation_cap TEXT, page_count INTEGER, minted_by TEXT, at TEXT, stale INTEGER DEFAULT 0,
      cited_as TEXT NOT NULL DEFAULT 'text', chain_kind TEXT);
    CREATE TABLE inquiry_basis (bundle_id TEXT, ord INTEGER, target_id TEXT, target_type TEXT, role TEXT, grade TEXT,
      grade_axis TEXT, grade_source TEXT, ground TEXT, note TEXT, at TEXT, content_id TEXT, PRIMARY KEY (bundle_id, ord));
    CREATE TABLE inquiry_basis_version_legs (bundle_id TEXT, version INTEGER, ord INTEGER, content_id TEXT);
    CREATE TABLE resolutions (bundle_id TEXT, capture_sha TEXT, ref TEXT, entity_id TEXT, grade TEXT, method TEXT,
      basis TEXT, established TEXT, raised_from TEXT, resolved_by TEXT, at TEXT);
    CREATE TABLE capture_text (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, extent_kind TEXT NOT NULL,
      extent TEXT NOT NULL, ref TEXT NOT NULL, seq INTEGER NOT NULL, text TEXT NOT NULL,
      truncated INTEGER NOT NULL DEFAULT 0, chain_kind TEXT NOT NULL, PRIMARY KEY (capture_sha, extent_kind, extent));
    CREATE VIRTUAL TABLE capture_text_fts USING fts5(text, content='capture_text', content_rowid='rowid',
      tokenize='unicode61');
    CREATE TRIGGER capture_text_ai AFTER INSERT ON capture_text BEGIN
      INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text); END;
    CREATE TABLE register (capture_sha TEXT, bundle_id TEXT, registered TEXT);
    CREATE TABLE readings (capture_sha TEXT);
    CREATE TABLE observation_log (seq INTEGER PRIMARY KEY, level TEXT, subject_kind TEXT, authority_kind TEXT,
      subject TEXT, state TEXT, condition TEXT, detail TEXT, bound INTEGER);`);
  let fid = 0;
  const w = {
    db,
    /* A bundle: its projection row and its text-index row (the fts rowid is the row's `fts_id`). */
    bundle(id, { type = "information", title = "", body = "", meta = "", locator = "", authority = "", fm = null,
                 ...rest } = {}) {
      fid += 1;
      const row = { bundle_id: id, fts_id: fid, object_type: type, title, fm_json: fm ? JSON.stringify(fm) : null,
                    last_updated: rest.last_updated ?? `2026-01-${String(fid).padStart(2, "0")}`,
                    source_locator: locator, source_authority: authority, ...rest };
      const put = (table, keys) => db.prepare(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`)
        .run(...keys.map((k) => bind(row[k])));
      put("bundles", Object.keys(row).filter((k) => !onProj(k) && !F.has(k)));
      if (P) { row[P.key] = id; put(P.table, [P.key, ...Object.keys(row).filter(onProj)]); }
      for (const [t, { key, cols: tc }] of tables) {
        const held = tc.filter(([c]) => c in row);
        if (!held.length) continue;
        db.prepare(`INSERT INTO ${t} (${[key, ...held.map(([, col]) => col)].join(",")}) VALUES (${[id, ...held].map(() => "?").join(",")})`)
          .run(id, ...held.map(([c]) => bind(row[c])));
      }
      db.prepare(`INSERT INTO bundles_fts (rowid, title, body, meta, locator, authority) VALUES (?,?,?,?,?,?)`)
        .run(fid, title, body, `${id} ${meta}`, locator, authority);
      return id;
    },
    /* Replace a bundle's indexed text (a revision). */
    revise(id, { title = "", body = "", meta = "" } = {}) {
      const f = (P ? db.prepare(`SELECT fts_id FROM ${P.table} WHERE ${P.key}=?`)
                   : db.prepare(`SELECT fts_id FROM bundles WHERE bundle_id=?`)).get(id).fts_id;
      db.prepare(`DELETE FROM bundles_fts WHERE rowid=?`).run(f);
      db.prepare(`INSERT INTO bundles_fts (rowid, title, body, meta, locator, authority) VALUES (?,?,?,?,?,?)`)
        .run(f, title, body, `${id} ${meta}`, "", "");
    },
    member(id, role = "member", status = "active") {
      db.prepare(`INSERT INTO members VALUES (?,?,?)`).run(id, role, status);
    },
    participate(project, member, state = "joined") {
      db.prepare(`INSERT INTO project_participants VALUES (?,?,?)`).run(project, member, state);
    },
    insert(table, row) {
      const keys = Object.keys(row);
      db.prepare(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`)
        .run(...keys.map((k) => bind(row[k])));
    },
    all(stmt) { return db.prepare(stmt.sql).all(...stmt.args.map(bind)).map((r) => ({ ...r })); },
    /* Compile and run one shape. */
    run(opts, shape = "page", arg) {
      const plan = P || fields ? compile(opts, { ...(P ? { projection: P } : {}), ...(fields ? { fields } : {}) })
                               : compile(opts);
      const s = plan.statements[shape](arg);
      if (s === null) return { plan, rows: null };
      const rows = Array.isArray(s) ? s.flatMap((x) => w.all(x)) : w.all(s);
      return { plan, rows };
    },
    ids(opts) { return w.run(opts, "page").rows.map((r) => r.bundle_id); },
  };
  return w;
}

/* Every statement a plan's shapes return, each shape asked in each of its modes. */
export function everyStatement(plan) {
  const st = plan.statements, out = [];
  for (const k of ["page", "count", "ids", "snapshot", "facetScan"]) { const s = st[k](); if (s) out.push([k, s]); }
  for (const s of st.facets()) out.push(["facets", s]);
  for (const mode of ["rows", "count", "levels", "axis"]) { const s = st.meaning({ mode }); if (s) out.push([`meaning:${mode}`, s]); }
  return out;
}
