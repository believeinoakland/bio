/* case-carriage over the modules it uses, each the real one (record-core, membership, promotion, provenance from
   provenance's fixture; `sources` and `accepted-work` made on the same host), on a real SQLite database (node:sqlite)
   standing in for a Durable Object's storage, never publication's fixture, which is later in the order (seam map
   `build/extraction/publication-split-2.md` §5). Extraction's units are a stand-in answering exactly the shape of its
   `unitsOf` (its R36), which the test sets (`w.units`); the knocks `sources` mints its sources from are pulled through a
   stand-in for capture's one keyed read (`w.knock`); what case-import registers with `accepted-work` is a stand-in each
   test controls (`w.importer`). The case document is written with case-grammar's own line builders, as case-authoring
   writes it. Every test drives `case-carriage` at its interface. */
import { world as provenanceWorld, sha, V, provDoc, infoMd } from "../provenance/fixture.mjs";
import { sourcesOf } from "../../../src/sources/index.mjs";
import { acceptedWorkOf } from "../../../src/accepted-work/index.mjs";
import { materialsLines, acceptedWorkBlockLines, sourceBlockLines } from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { caseCarriageOf } from "../../../src/case-carriage/index.mjs";

export { sha, V, provDoc, infoMd };
export const NOW = "2026-09-28T01:00:00Z";

export function world() {
  const w = provenanceWorld({ now: NOW });
  const { host, record, membership, promotion, st } = w;
  /* sources (layer 3) over a stand-in for capture's `pulledKnocksOf`; its clock is the world's, in milliseconds. */
  const knocks = [];
  const src = sourcesOf(host, { record, membership, now: () => Date.parse(w.clock.now),
    capture: { pulledKnocksOf: (captureSha) => knocks.filter((k) => k.sha256 === captureSha) } });
  const acceptedWork = acceptedWorkOf(host, { record, promotion });
  const units = new Map(), unitCalls = [];
  const extraction = { unitsOf: (s) => { unitCalls.push(s); return units.has(s) ? { capture_sha: s, ...units.get(s) }
                                                                               : { capture_sha: s, units: [], state: null }; } };
  const cc = caseCarriageOf(host, { record, membership, promotion, sources: src, acceptedWork, extraction,
                                    now: () => w.clock.now });
  let n = 0;
  return Object.assign(w, {
    src, acceptedWork, units, unitCalls, cc,
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** A knock pulled into the capture `captureSha` (capture R65), and its source minted as `sources` R1 mints it. */
    knock(captureSha, { knockId = `KNOCK-${knocks.length + 1}`, pseudonym = null, received = NOW, viewer = V("olive") } = {}) {
      knocks.push({ knock_id: knockId, sha256: captureSha, bytes: 10, received, pseudonym,
                    knocker_digest: pseudonym ? `d-${pseudonym}` : null });
      const r = src.sourceOf({ captureSha, viewer });
      if (!r.ok) throw new Error(`fixture knock refused: ${JSON.stringify(r)}`);
      return [...st.sql.exec(`SELECT source_id FROM source_knocks WHERE knock_id=?`, knockId)][0].source_id;
    },
    /** A document (an information bundle) whose one capture is `text`, held inline; `files` added beside it, and
     *  `prov` extra fields on its provenance document. */
    doc(id, { text = `the text of ${id}`, files = [], prov = {} } = {}) {
      const path = `snapshots/${id}.txt`;
      const res = promotion.promote({ bundleId: id, base: null, snapKey: `cc${++n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path, text }, ...files,
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc({ path, text }, prov)] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: sha(text), path, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
      if (!res.ok) throw new Error(`fixture doc refused: ${JSON.stringify(res).slice(0, 400)}`);
      return sha(text);
    },
    /** A member's firsthand observation, through provenance's `testify`: `{id, sha, text}`. */
    observe(author, words = `I saw it, ${author}.`) {
      const r = w.prov.testify({ words, observedAt: "2026-09-27", title: `Observation by ${author}`, author });
      if (!r.ok) throw new Error(`fixture testify refused: ${JSON.stringify(r).slice(0, 400)}`);
      const reg = w.row(`SELECT capture_sha, path FROM register WHERE bundle_id=?`, r.bundle_id);
      return { id: r.bundle_id, sha: reg.capture_sha, text: record.readFile(r.bundle_id, reg.path).text };
    },
    /** case-import's registration with accepted-work, as a stand-in: `state.finding` and `state.openFlags` decide each
     *  answer; every read is recorded in the answered list. */
    importer(state) {
      const calls = [];
      const r = acceptedWork.registerAcceptedWork("case-import", {
        finding: (a) => { calls.push(["finding", a]); return state.finding ? state.finding(a) : null; },
        openFlags: (a) => { calls.push(["openFlags", a]); return state.openFlags ? state.openFlags(a) : null; },
        withdrawals: () => ({ withdrawals: [], cursor: null }) });
      if (!r.ok) throw new Error(`fixture registration refused: ${JSON.stringify(r)}`);
      return calls;
    },
    tables: () => w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((r) => r.name),
  });
}

/** A `/6` case document's text, its blocks written with case-grammar's line builders: `materials` (R12 rows),
 *  `acceptedWork` and `acceptedWorkFlags` (R16), `sources` (R1). */
export function caseText({ caseId = "CASE-2026-0001", edition = 1, format = "bio-case-document/6", materials = [],
                           acceptedWork = null, acceptedWorkFlags = null, sources = null } = {}) {
  return ["---", `format: ${format}`, `case_id: ${caseId}`, `case_edition: ${edition}`,
    ...(sources ? sourceBlockLines(sources) : []),
    ...materialsLines(materials),
    ...(acceptedWork || acceptedWorkFlags ? acceptedWorkBlockLines({ rows: acceptedWork || [], flags: acceptedWorkFlags || [] }) : []),
    "---", "", "## Scope", "", "The question.", ""].join("\n");
}

/** The front matter of `caseText(opts)`, as the commit hands it on. */
export const caseFm = (opts) => parseFrontmatter(caseText(opts)).data;
