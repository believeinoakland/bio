/* workbooks over the modules it uses, each the real one (record-core, membership, promotion, content with the
   provenance it builds on the same host), on a real SQLite database (node:sqlite) standing in for a Durable Object's
   storage, at the plane's shape (`sql.exec` answers a cursor). `calculations` is a stand-in holding tables and
   calculations in the answer shapes workbooks reads (J1), with a sight rule the test sets; the engine is a function
   the test hands as `ctx.recompute`, or the real `sheet-worker` engine. Workbooks are built here as OOXML bytes, so
   each fixture is readable where it is used. Every test drives `workbooks` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { workbooksOf } from "../../../src/workbooks/index.mjs";
import { zipStored } from "../../../src/workbooks/xlsxwrite.mjs";

export const sha = (s) => createHash("sha256").update(s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const r = c.toArray(); if (r.length !== 1) throw new Error(`Expected exactly one result, got ${r.length}`); return r[0]; },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    db, sql, rows: (q, ...a) => [...sql.exec(q, ...a)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const NOW = "2026-10-06T01:00:00.000Z";
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

/* ---- workbooks as bytes ---- */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A cell spec: a number (`5`, `"0.1"` with `n`), text (`{s}`), a boolean (`{b}`), an error (`{e}`), or a formula
 *  (`{f, v?, t?}`: `v` its cached value, `t` the cached type: n (default), str, b, e). */
function cellXml(ref, spec) {
  if (spec === null || spec === undefined) return "";
  if (typeof spec === "number") return `<c r="${ref}"><v>${spec}</v></c>`;
  if (spec.n !== undefined) return `<c r="${ref}"><v>${spec.n}</v></c>`;
  if (spec.s !== undefined) return `<c r="${ref}" t="inlineStr"><is><t>${esc(spec.s)}</t></is></c>`;
  if (spec.b !== undefined) return `<c r="${ref}" t="b"><v>${spec.b ? 1 : 0}</v></c>`;
  if (spec.e !== undefined) return `<c r="${ref}" t="e"><v>${esc(spec.e)}</v></c>`;
  if (spec.f !== undefined) {
    const t = spec.t && spec.t !== "n" ? ` t="${spec.t}"` : "";
    return `<c r="${ref}"${t}><f>${esc(spec.f)}</f>${spec.v === undefined ? "" : `<v>${esc(spec.v)}</v>`}</c>`;
  }
  throw new Error(`bad cell spec ${JSON.stringify(spec)}`);
}

/** An xlsx: `sheets` [{name, cells: {A1: spec}, hidden?, hiddenRows?: [r], hiddenCols?: [[min, max]]}], `names`
 *  {name: "Sheet!$A$1:$A$3"}. */
export function xlsx(sheets, { names = {} } = {}) {
  const head = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const sheetXml = (s) => {
    const rows = new Map();
    for (const [ref, spec] of Object.entries(s.cells)) {
      const r = Number(/[0-9]+$/.exec(ref)[0]);
      if (!rows.has(r)) rows.set(r, []);
      rows.get(r).push([ref, spec]);
    }
    for (const r of s.hiddenRows || []) if (!rows.has(r)) rows.set(r, []);
    const colNum = (ref) => [...(/^[A-Z]+/.exec(ref)[0])].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
    const body = [...rows.keys()].sort((a, b) => a - b).map((r) => {
      const hidden = (s.hiddenRows || []).includes(r) ? ` hidden="1"` : "";
      const cs = rows.get(r).sort((a, b) => colNum(a[0]) - colNum(b[0])).map(([ref, spec]) => cellXml(ref, spec)).join("");
      return `<row r="${r}"${hidden}>${cs}</row>`;
    }).join("");
    const cols = (s.hiddenCols || []).length ? `<cols>${s.hiddenCols.map(([a, b]) => `<col min="${a}" max="${b}" width="9" hidden="1"/>`).join("")}</cols>` : "";
    return `${head}<worksheet xmlns="${ns}">${cols}<sheetData>${body}</sheetData></worksheet>`;
  };
  const files = [
    ["[Content_Types].xml", `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],
    ["_rels/.rels", `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `${head}<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}"${s.hidden ? ` state="hidden"` : ""} r:id="rId${i + 1}"/>`).join("")}</sheets>${Object.keys(names).length ? `<definedNames>${Object.entries(names).map(([n, r]) => `<definedName name="${esc(n)}">${esc(r)}</definedName>`).join("")}</definedNames>` : ""}</workbook>`],
    ["xl/_rels/workbook.xml.rels", `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${rel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rIdS" Type="${rel}/styles" Target="styles.xml"/></Relationships>`],
    ["xl/styles.xml", `${head}<styleSheet xmlns="${ns}"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
    ...sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s)]),
  ];
  return zipStored(files);
}

/** The analysis most tests use: three inputs B2:B4 (one a hidden row's), their total, a share, and a constant in a
 *  formula. Sheet "Model"; D1 tells copies apart. */
let copies = 0;
export const BASIC = () => xlsx([{ name: "Model", cells: {
  D1: { s: `copy ${++copies}` },
  A1: { s: "item" }, B1: { s: "amount" },
  A2: { s: "rent" }, B2: { n: "1200.50" },
  A3: { s: "power" }, B3: { n: "300" },
  A4: { s: "water" }, B4: { n: "99.5" },
  A5: { s: "total" }, B5: { f: "SUM(B2:B4)", v: "1600" },
  B6: { f: "B5*1.1", v: "1760" },
} }]);

/* ---- the stand-in calculations ---- */

export function calculationsStandIn() {
  const tables = new Map(), calcs = new Map(), hidden = new Set();
  const sees = (key, viewer) => typeof viewer === "string" && viewer !== "" && !hidden.has(`${key}|${viewer}`) && !hidden.has(`${key}|*`);
  return {
    tables, calcs, hidden,
    addTable(t) { tables.set(t.sha, t); return t.sha; },
    hide(key, viewer = "*") { hidden.add(`${key}|${viewer}`); },
    readTable({ sha: s, viewer }) {
      const t = tables.get(s);
      return t && sees(s, viewer) ? { ok: true, found: true, table: t } : { ok: true, found: false };
    },
    read({ calcId, viewer }) {
      const c = calcs.get(calcId);
      return c && sees(calcId, viewer) ? { ok: true, found: true, calculation: c } : { ok: true, found: false };
    },
  };
}

export function world({ recompute = undefined, now = NOW } = {}) {
  const st = storage();
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const bytes = new Map();
  const host = { storage: st, ...(recompute !== undefined ? { recompute } : {}) };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const ex = { readings: {}, units: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null }, chain: LAYER, pageCount: 3, textContainer: null, captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: (s) => ex.units[s] || { units: [], state: null },
    capturesReadFor: () => [],
    onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, extraction, now: () => clock.now });
  const prov = content.provenance;
  prov.migrate();
  content.migrate();
  /* a cited figure's text is a provider the test controls, as extraction's units would give it */
  const passages = new Map();
  const passageText = content.passageText.bind(content);
  content.passageText = (id) => (passages.has(id) ? passages.get(id) : passageText(id));
  const calculations = calculationsStandIn();
  const wb = workbooksOf(host, { record, membership, provenance: prov, content, calculations,
                                 bytesOf: async (s) => bytes.get(s) || null, now: () => clock.now });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, calculations, wb, clock, ex, bytes,
    rows: (q, ...a) => st.rows(q, ...a),
    count: (t) => st.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot(prefix = "workbook") {
      const out = {};
      for (const { name } of st.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE ? ORDER BY name`, `${prefix}%`))
        out[name] = st.rows(`SELECT * FROM ${name}`);
      return out;
    },
    member(id, { role = "member" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
    },
    /** A captured document holding `data` (bytes or text), in `project` when given: its capture sha and bundle. */
    capture(data, { name = `cap${++n}`, project = null } = {}) {
      const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
      const capSha = sha(buf);
      const id = `INFO-2026-${String(++n).padStart(4, "0")}-${name}`;
      const text = `capture ${name} ${capSha}`;
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${n}`, author: V("alice"), ...(project ? { project } : {}),
        files: [{ path: "bundle.md", text: infoMd(id, project) }, { path: `snapshots/${name}.txt`, text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(`snapshots/${name}.txt`, capSha)] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: capSha, path: `snapshots/${name}.txt`, encoding: "utf8", bytes: buf.length }] });
      if (!r.ok) throw new Error(`fixture capture refused: ${JSON.stringify(r).slice(0, 400)}`);
      bytes.set(capSha, buf);
      ex.readings[capSha] = { chain: LAYER, pageCount: 3 };
      return { capSha, bundleId: id };
    },
    /** A cited figure: a passage whose text is `text`, minted as content; its content id. */
    figure(text, opts = {}) {
      const { capSha, bundleId } = w.capture(`figure source ${++n}`, opts);
      const m = content.mint({ bundleId, captureSha: capSha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("alice") });
      if (!m.ok) throw new Error(`fixture mint refused: ${JSON.stringify(m).slice(0, 300)}`);
      passages.set(m.content_id, text);
      return { contentId: m.content_id, capSha, bundleId };
    },
    passages,
    /** A project owned by `owner`, with `participants` joined. */
    project(title, owner, participants = []) {
      const r = promotion.promote({ base: null, snapKey: `p${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      for (const m of participants)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?,?,'joined',0,'t','t')`, r.bundleId, m);
      membership.reindexProjectSight(r.bundleId);
      return r.bundleId;
    },
    /** A table held by the stand-in calculations: `fields` [[name, type]], rows as arrays. */
    table(fields, rows, grade_facts = { capture_grade: "B", derivation: "B", grade: "B" }) {
      const fs = fields.map(([name, type]) => ({ name, type }));
      const t = { sha: sha(JSON.stringify([fields, rows, ++n])), fields: fs,
                  rows: rows.map((r) => Object.fromEntries(fs.map((f, i) => [f.name, r[i]]))), grade_facts };
      return calculations.addTable(t);
    },
  };
  return w;
}

/** alice an administrator; bob and carol members; P a project bob owns that carol has joined; a workbook held in P. */
export async function seeded(opts = {}, book = BASIC()) {
  const w = world(opts);
  w.member("alice", { role: "admin" });
  w.member("bob");
  w.member("carol");
  w.member("dave");
  w.P = w.project("Rates", "bob", ["carol"]);
  w.cap = w.capture(book).capSha;
  const r = await w.wb.addWorkbook({ captureSha: w.cap, question: "What does the service cost?", period: "FY2025", project: w.P, by: V("bob") });
  if (!r.ok) throw new Error(`fixture add refused: ${JSON.stringify(r)}`);
  w.at = { captureSha: w.cap, project: w.P };
  return w;
}

function infoMd(id, project) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          ...(project ? [`project: ${project}`] : []),
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

function provDoc(file, capSha) {
  return { file, locator: `https://example.org/${file}`, retrieved: "2026-09-27T00:00:00Z",
           authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: capSha, encoding: "utf8", bytes: 1 },
           origin: { kind: "named_request" } };
}

function projMd(title) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          `objective: "Find out."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""]
    .join("\n");
}
