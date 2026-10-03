/* case-disclosures over the modules it uses, each the real one (record-core, membership, promotion, provenance,
   attestation, capture, sources, extraction's tables, content, inquiry, strength, contradiction), on a real SQLite
   database (node:sqlite) standing in for a Durable Object's storage. Copied from case-authoring's fixture without
   `caseAuthoringOf` (N529, K1333) and without the modules case-disclosures does not use: what `case-authoring` would
   hand a service (`prepared`, `memberRoles`) the test builds as case-authoring R4 and R5 do. What a later module fills
   is a stand-in the test controls: the run gate `ai-runs` registers with contradiction (its R13; `runs`), and, unless
   a test asks for the real one, `case-import`'s reads (`importsStandIn`); the real one's checker is scripted at
   case-checker's R1 and its re-evaluation listener answered. Every test drives `case-disclosures` at its
   interface: its services, its renderers, its exports. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { contradictionOf } from "../../../src/contradiction/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";
import { sourcesOf } from "../../../src/sources/index.mjs";
import { parseImportedFindingRef, importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { caseImportOf } from "../../../src/case-import/index.mjs";
import { caseDisclosuresOf } from "../../../src/case-disclosures/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const NOW = "2026-09-28T01:00:00Z";
export const T0 = "2026-09-27T00:00:00Z";
export const ADMIN = "class:admin";

/** `deps` replaces any dependency the module is handed (a scripted one, or one that throws); `realImports` composes
 *  the real `case-import` in place of the stand-in. */
export function world({ group = "test-group", deps = {}, realImports = false } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
  for (const c of ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const prov = provenanceOf(host, { record, membership, now: () => clock.now });
  prov.migrate();
  const attestation = attestationOf(host, { record, provenance: prov });
  const capture = new Capture(st, { record, env: { INSTANCE_NAME: "test", VERSION: "0.0.0" }, governor: null,
                                    provenance: prov, membership });
  capture.migrate();
  const sources = sourcesOf(host, { record, membership, capture, now: () => Date.parse(clock.now) });
  const ex = extractionOf(host, { record, membership, calibration: { onCalibration() { return { ok: true }; } } });
  ex.migrate();
  const exProvider = {
    readingOf: () => null, unitsOf: () => ({ units: [], state: null }), capturesReadFor: () => [], onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, provenance: prov, extraction: exProvider, now: () => clock.now });
  content.migrate();
  const retrieval = { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION", check: "C-33.20" }) };
  const inquiry = inquiryOf(host, { record, membership, content, retrieval, provenance: prov, now: () => clock.now });
  inquiry.migrate();
  const promotion = inquiry.promotion;
  promotion.registerFact("producingGroup", "instance-setup", () => group);
  inquiry.entities.migrate();
  inquiry.connections.migrate();
  const strength = strengthOf(host, { record, membership,
    inquiry: { basisFor: (id, o) => inquiry.basisFor(id, o), earned: (e, t) => inquiry.earned(e, t), legCapped,
               subjectEntityOf: (id) => inquiry.subjectEntityOf(id) },
    producingGroup: () => group, now: () => clock.now });
  /* basis-versions (layer 6) is not a module case-disclosures uses: strength and contradiction each reach its one
     instance on this host themselves, and the fixture creates its tables through that instance. */
  strength.versions.migrate();
  const contradiction = contradictionOf(host, { record, extraction: ex, membership, promotion, now: () => clock.now });
  contradiction.migrate();
  const runs = new Map();
  contradiction.registerRunGate("test", (id, viewer, caller) => {
    const r = runs.get(id);
    if (!r) return { found: false, running: false, refusal: null };
    return { found: true, running: r.status === "running",
             refusal: caller === r.principal ? null : { ok: false, reason: "AI_RUN_NOT_PRINCIPAL", code: "AI_RUN_NOT_PRINCIPAL" } };
  });
  /* `case-import`: the real one composed on this host (it fills accepted-work's registration itself), its checker
     scripted at case-checker's R1 (`w.checks`); else the stand-in, registered with accepted-work's one instance. */
  const checks = { group: "other-group", case: "CASE-2026-0900", edition: 1, findings: [] };
  const imports = realImports
    ? caseImportOf(host, { record, membership, strength, acceptedWork: strength.acceptedWork,
                           reevaluation: { acceptanceWithdrawn: () => ({ ok: true, told: true, dependents: 0 }) },
                           checkCaseFile: async () => ({ format: "bio-case-file/1", case: checks.case, edition: checks.edition,
                             group: checks.group, checker: { grading_versions: ["bio-grading/1"], checks_version: "1.57.0" },
                             integrity: { departures: [] }, signatures: { case: { verified: true } },
                             publication_checks: { findings: [] }, complete_edition: { equal: true },
                             statement: "Recreating shows the case intact and consistent, not true.",
                             findings: checks.findings.map((f) => ({ role: "load_bearing", result: "recreated", missing: [],
                                                                     differs: [], bar_met: "not_asked", ...f })) }),
                           now: () => Date.parse(clock.now) })
    : importsStandIn();
  if (!realImports) strength.acceptedWork.registerAcceptedWork("case-import", imports.registration);
  const w = {
    imports, checks, st, host, record, membership, promotion, prov, content, inquiry, strength, contradiction, runs, clock,
    capture, sources, attestation, extraction: ex,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
  };
  w.cd = caseDisclosuresOf(host, { record, inquiry, strength, contradiction, provenance: prov, attestation, capture,
    sources, extraction: ex, promotion, caseImport: imports, ...deps });
  let n = 0;
  Object.assign(w, {
    head: (id) => record.head(id)?.bundleSha ?? null,
    fm: (text) => parseFrontmatter(String(text || "")).data || {},
    member(id) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, 'member', 'active', '["contribute","publish"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`);
    },
    /** A whole extracted-text index for `captureSha` (extraction R36's `unitsOf` reads it), one unit per entry of
     *  `units` (`{text, truncated?}`), or with `state` other than whole. */
    indexText(captureSha, bundleId, units = [{ text: `the text of ${bundleId}` }], state = "whole") {
      st.sql.exec(`INSERT OR REPLACE INTO capture_text_state (capture_sha, bundle_id, state, offered, written, over_bound,
                   unaddressable, truncated, skipped_named, chain_kind, at) VALUES (?,?,?,?,?,0,0,?,0,'text',?)`,
                  captureSha, bundleId, state, units.length, units.length, units.filter((u) => u.truncated).length, T0);
      units.forEach((u, i) => st.sql.exec(`INSERT OR REPLACE INTO capture_text (capture_sha, bundle_id, extent_kind, extent,
                   ref, seq, text, truncated, chain_kind) VALUES (?,?,'doc-para',?,?,?,?,?,'text')`,
                  captureSha, bundleId, JSON.stringify({ kind: "doc-para", para: i + 1 }), `paragraph ${i + 1}`, i, u.text,
                  u.truncated ? 1 : 0));
    },
    /** An information bundle registering one capture whose provenance document carries `extra`; its text indexed
     *  whole unless `indexed: false`; fetched `direct` by this instance unless `receipt: false` (a Grade B capture,
     *  provenance R13, R24). Answers the capture's sha. */
    doc(id, extra = {}, { receipt = false, text = `bytes of ${id}`, indexed = true } = {}) {
      const c = { path: "snapshots/c0.txt", text, sha: sha(text) };
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path: c.path, text: c.text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...provDoc(c), ...extra }] }) }],
        meta: { object_type: "information" },
        register: [{ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) }] });
      if (!r.ok) throw new Error(`fixture doc refused: ${JSON.stringify(r).slice(0, 400)}`);
      if (indexed) w.indexText(c.sha, id);
      if (receipt) prov.recordReceipt({ address: `https://example.org/${id}`, addressNorm: `example.org/${id}`,
                                        captureSha: c.sha, retrieved: T0, via: "direct" });
      return c.sha;
    },
    /** A content row over `capture` in `bundle` (content R45's read contract). */
    content(id, capture, bundle, ref = `the page of ${bundle}`, extent = "{}") {
      st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                   VALUES (?, ?, ?, 'pdf-page', ?, ?, 'plane', '2026-01-01', 0)`, id, capture, bundle, extent, ref);
    },
    /** An inquiry whose basis is `legs` (each `{target, …leg fields}`), concluded in its own bytes. */
    finding(id, legs, { state = "concluded", lines = [] } = {}) {
      const head = record.head(id);
      const r = promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: V("alice"), files: [{ path: "bundle.md", text: inqMd(id, legs, { state, lines }) }],
        meta: { object_type: "inquiry" } });
      if (!r.ok) throw new Error(`fixture finding refused: ${JSON.stringify(r).slice(0, 600)}`);
      return r;
    },
    /** A project owned (and so joined) by `owner`, citing `cites`. */
    project(title, owner, cites = []) {
      const r = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title, cites) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** case-authoring R4's `prepared`, as it would hand it: each member with its current pin. */
    prepared: (ids) => ids.map((id) => ({ id, bundleSha: w.head(id) })),
    /** case-authoring R5's partition, every member load-bearing unless named in `supporting`. */
    roles: (ids, supporting = []) => ids.map((id) => ({ target: id, role: supporting.includes(id) ? "supporting" : "load_bearing" })),
    /** A knock the doorbell received, already pulled into `captureSha` (capture R65, R72). */
    knocked(captureSha, { knockId = `KNOCK-2026-09-27-${captureSha.slice(0, 8)}`, received = T0, pseudonym = null } = {}) {
      st.sql.exec(`INSERT INTO inbox (knock_id, sha256, bytes, received, status, capture_sha, pulled_by, pulled_at,
                   pseudonym) VALUES (?, ?, 1, ?, 'pulled', ?, 'alice', ?, ?)`,
                  knockId, captureSha, received, captureSha, received, pseudonym);
      return knockId;
    },
  });
  return w;
}

/** `case-import` at its ruled interface (its R4, R9, R16), a stand-in the test controls: another group's imported
 *  editions, the acceptances in force and the open flags. `accept(...)` answers the ref a leg names; `flagsRead`, when
 *  set, answers `openFlagsOn` in place of the held flags (a failed or incomplete read). Copied from case-authoring's. */
export function importsStandIn() {
  const editions = new Map(), acceptances = new Map(), flags = [];
  const key = (...a) => a.join("#");
  const s = {
    flagsRead: null,
    edition(imp, edition, { group = "other-group", caseId = "CASE-2026-0900", manifestSha = "f".repeat(64), findings = [] } = {}) {
      editions.set(key(imp, edition), { edition, group, case: caseId, manifest_sha: manifestSha, findings });
    },
    accept(imp, edition, finding, a = {}) {
      acceptances.set(key(imp, edition, finding), { by: "alice", at: T0, reason: "We recreated it whole.",
        checked: "every passage", gaps: null, ...a });
      return importedFindingRef(imp, finding);
    },
    withdraw(imp, edition, finding) { acceptances.delete(key(imp, edition, finding)); },
    flag(imp, edition, f) { flags.push({ import: imp, edition, open: true, finding: null, at: T0, ...f }); },
    clear(flag) { for (const f of flags) if (f.flag === flag) f.open = false; },
    acceptanceOf: ({ import: imp, edition, finding }) => acceptances.get(key(imp, edition, finding)) ?? null,
    openFlagsOn: ({ import: imp, edition }) => (s.flagsRead ? s.flagsRead({ import: imp, edition })
      : { ok: true, complete: true, flags: flags.filter((f) => f.open && f.import === imp && f.edition === edition)
          .map(({ flag, finding, issue, at }) => ({ flag, finding, issue, at })) }),
    importedCase: ({ import: imp, edition }) => {
      const e = editions.get(key(imp, edition));
      return e ? { ok: true, import: imp, group: e.group, case: e.case, editions: [{ edition: e.edition }],
                   edition: { edition: e.edition, manifest_sha: e.manifest_sha, findings: e.findings } }
               : { ok: false, reason: "IMPORT_NO_SUCH_EDITION" };
    },
  };
  s.registration = {
    finding: ({ ref, edition }) => {
      const p = parseImportedFindingRef(ref);
      const e = p && editions.get(key(p.import, edition));
      if (!p || !e) return null;
      const f = e.findings.find((x) => x.finding === p.finding) || {};
      return { ref, import: p.import, group: e.group, case: e.case, edition, finding: p.finding,
               manifest_sha: e.manifest_sha, result: f.result ?? null, pair: f.pair ?? null,
               acceptance: acceptances.get(key(p.import, edition, p.finding)) ?? null };
    },
    openFlags: ({ ref, edition }) => {
      const p = parseImportedFindingRef(ref);
      return { complete: true, flags: flags.filter((f) => p && f.open && f.import === p.import && f.edition === edition) };
    },
    withdrawals: () => ({ withdrawals: [], cursor: null }),
  };
  return s;
}

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "${T0}"`,
          `last_updated: "${T0}"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

/** An inquiry document: `legs` its basis (each cited by a confirmed `cites` reference); concluded in its own bytes. */
export function inqMd(id, legs = [], { state = "concluded", lines = [] } = {}) {
  const val = (v) => (typeof v === "number" ? String(v) : `${v}`);
  /* a leg on another group's finding is not a reference (inquiry-grammar R11) */
  const refs = [...new Set(legs.map((l) => l.target).filter((t) => !String(t).startsWith("imported:")))];
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
    `current_state: ${state}`, "prior_state: open", `created: "${T0}"`, `last_updated: "${T0}"`, "surfaced_by: human",
    ...(refs.length ? ["references:", ...refs.flatMap((t) => ["  - rel: cites", `    target: ${t}`, "    status: confirmed",
                                                              '    note: ""'])] : ["references: []"]),
    "state_history: []",
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => Object.entries({ role: "supports", ...l })
      .sort(([a], [b]) => (a === "target" ? -1 : b === "target" ? 1 : 0))
      .map(([k, v], i) => `${i ? "    " : "  - "}${k}: ${val(v)}`))] : []),
    ...(state === "concluded" ? [`conclusion: "the award followed the minutes"`, `falsifier: "a later amendment"`] : []),
    ...lines, "---", "", "## Question", "", `Was ${id} answered?`, "", "## Session Log", ""].join("\n");
}

export function projMd(title, cites = []) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "${T0}"`, `last_updated: "${T0}"`,
          ...(cites.length ? ["references:", ...cites.flatMap((t) => ["  - rel: cites", `    target: ${t}`,
                                                                       "    status: confirmed", '    note: ""'])]
                           : ["references: []"]),
          "state_history: []", "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
}

export function provDoc(c) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: T0,
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
  };
}
