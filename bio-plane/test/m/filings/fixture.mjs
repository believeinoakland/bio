/* filings over the modules it uses, every one the real one (K253): record-core, membership, promotion, provenance,
   content, inquiry and publication on publication's own test world, and the layer-9 modules standards, conformance,
   consequences and actions, each through its own factory on the same host. A real SQLite database stands in for a
   Durable Object's storage. What only a later module or the legacy store fills (the producing group, retrieval's
   registrations) is a stand-in the test controls. Every test drives `filings` at its interface, and changes the record
   only through the acts of the modules that own it. */
import { createHash } from "node:crypto";
import { world as publicationWorld, V, NOW } from "../publication/fixture.mjs";
import { filingsOf, filingsOps } from "../../../src/filings/index.mjs";
import { consequencesModule } from "../../../src/consequences/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { conformanceOf } from "../../../src/conformance/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { legCapped } from "../../../src/inquiry/index.mjs";
import { get as profileOf } from "../../../../jurisdictions/index.mjs";

export { V, NOW };
export const MACHINE = "class:daemon";
/** A viewer the plane admits to nothing (membership R43): every bundle is invisible to it. */
export const STRANGER = "stranger";
export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
export const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes", EVID = "INFO-2026-0002-ledger";
export const CASE = "CASE-2026-0001";
export const PROFILE = "test-port-ellery";

const q = (v) => JSON.stringify(String(v));
/** An action's bundle.md from `o` (`kind`, `risk_tier`, `state`, `resolution`, `counterparty`, `clock`, `legs`, `law`,
 *  `breach`, `state_history`). */
export function actionMd(id, o) {
  const cp = o.counterparty;
  const lines = ["---", `id: ${id}`, "object_type: action", `title: ${id}`, `current_state: ${o.state ?? "active"}`,
    'created: "2026-03-10T00:00:00Z"', 'last_updated: "2026-03-10T00:00:00Z"', `action_kind: ${o.kind}`,
    ...(o.risk_tier != null && o.risk_tier !== "undetermined" ? [`risk_tier: ${o.risk_tier}`] : []),
    ...(o.resolution ? [`resolution: ${o.resolution}`] : []),
    ...(cp ? ["counterparty:", ...Object.entries(cp).map(([k, v]) => `  ${k}: ${q(v)}`)] : []),
    ...(o.clock && o.clock.length ? ["clock:", ...o.clock.flatMap((c) => [`  - text: ${q(c.text)}`, `    description: ${q(c.description)}`,
        `    date: "${c.date}"`, `    basis: ${q(c.basis)}`, `    status: ${c.status}`])] : []),
    ...(o.legs && o.legs.length ? ["action_basis:", ...o.legs.flatMap((l) => [`  - target: ${l.target}`, `    kind: ${l.kind}`])] : []),
    ...(o.law ? [`law: ${q(o.law)}`] : []),
    ...(o.breach ? ["breach: true"] : []),
    ...(o.state_history && o.state_history.length ? ["state_history:", ...o.state_history.flatMap((h) => [
        `  - timestamp: "${h.at}"`, `    from_state: ${h.from}`, `    to_state: ${h.to}`, `    blurb: ${q(h.reason ?? "moved")}`,
        `    author: ${h.by ?? V("olive")}`])] : []),
    "---", "", "An action.", ""];
  return lines.join("\n");
}

/** The world: a project (olive owns it; bo and cy joined; quinn outside) whose published case edition holds F (resting on
 *  DOC), a live determination D of an act against two standards resting on F, the test profile active, and the layer-9
 *  modules. `profiles` replaces the active profile list filings reads (ids or profile objects); actions reads
 *  record-core's setting, the test profile. */
export function world({ profiles = undefined, group = "test-group" } = {}) {
  const w = publicationWorld({ group });
  for (const m of ["olive", "bo", "cy", "quinn"]) w.member(m);
  const proj = w.project("Parks", "olive");
  for (const m of ["bo", "cy"]) {
    const inv = w.membership.projectInvite({ projectId: proj, handle: `h_${m}`, by: "olive", viewer: V("olive") });
    if (inv && inv.ok === false) throw new Error(`fixture invite refused: ${JSON.stringify(inv)}`);
    const j = w.membership.projectJoin({ projectId: proj, by: m, viewer: V(m) });
    if (j && j.ok === false) throw new Error(`fixture join refused: ${JSON.stringify(j)}`);
  }
  w.doc(DOC);
  attestedDoc(w, EVID);
  w.inquiry(F, { legs: [{ target: DOC }] });
  w.promote(F, w.text(F).replace("## Conclusion\n", "## Conclusion\n\nThe works order was let without the vote the bylaw requires.\n"));
  const pin = w.head(F);
  /** Edition `edition` of CASE, owned by the project, pinning F, ratified and published. */
  const publishEdition = (edition) => {
    const roles = [{ target: F, version_sha: pin, edition }];
    w.prepare(CASE, edition, { project: proj, roles });
    const signed = w.signCase(CASE, edition, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
    if (!signed.ok) throw new Error(`fixture case refused: ${JSON.stringify(signed)}`);
    const pub = w.signFinding(F, { edges: edition === 1 ? [{ to: DOC, kind: "cites", disclosure: "serve" }] : [] });
    if (!pub.ok) throw new Error(`fixture publish refused: ${JSON.stringify(pub)}`);
  };
  publishEdition(1);
  w.record.setSetting("jurisdiction_profiles", [PROFILE], V("olive"));
  const now = () => w.clock.now;
  const deps = { record: w.record, membership: w.membership, promotion: w.promotion, content: w.content, now };
  const standards = standardsOf(w.host, deps);
  standards.migrate();
  const strength = strengthOf(w.host, { record: w.record, membership: w.membership, now,
    inquiry: { basisFor: (id, o) => w.k.basisFor(id, o), earned: (e, t) => w.k.earned(e, t), legCapped,
               subjectEntityOf: (id) => w.k.subjectEntityOf(id) } });
  const reevaluation = reevaluationOf(w.host, { ...deps, inquiry: w.k, strength, provenance: w.prov, basisVersions: w.basisVersions });
  const conformance = conformanceOf(w.host, { ...deps, inquiry: w.k, strength, reevaluation, publication: w.p, standards });
  const consequences = consequencesModule(w.host, { ...deps, conformance, provenance: w.prov, inquiry: w.k, strength });
  const actions = actionsOf(w.host, { ...deps, retrieval: null, conformance, now: () => Date.parse(w.clock.now) });
  const groupRef = { value: group };
  const f = filingsOf(w.host, { record: w.record, publication: w.p, provenance: w.prov, content: w.content,
    producingGroup: () => groupRef.value, now, ...(profiles !== undefined ? { profiles: () => profiles } : {}) });
  const evidenceCid = w.content.mint({ bundleId: EVID, captureSha: sha(`the text of ${EVID}`), extent: { kind: "document" },
                                       mintedBy: V("bo") }).content_id;
  const declare = (over) => {
    const r = standards.standardDeclare({ text: [evidenceCid], author: V("olive"), viewer: V("olive"), ...over });
    if (!r.ok) throw new Error(`fixture standard refused: ${JSON.stringify(r).slice(0, 300)}`);
    return r.id;
  };
  const S1 = declare({ cite: "P.E.B.L. § 12", kind: "ordinance", issuer: "Port Ellery Selectboard", period: { from: "2020-01-01", to: "2030-12-31" } });
  const S2 = declare({ cite: "MCBC 2025-3", kind: "commitment", issuer: "Marlow County Commission", period: { from: null, to: null } });
  const act = { description: "the works order let on 2026-03-02", actor: { role: "Selectboard", body: "Port Ellery Selectboard" },
                at: "2026-03-02", evidence: [evidenceCid] };
  /** A determination by olive through conformance's R1 (every field `over` replaces); answers its id. */
  const determine = (over = {}) => {
    const stds = over.standards || [{ standard: S1, outcome: "noncompliant" }, { standard: S2, outcome: "compliant" }];
    const r = conformance.determine({ project: proj, act, findings: [F], standards: stds,
      rows: stds.map((s) => ({ standard: s.standard, requires: "a vote of the Selectboard", did: "let it without one",
                               reading: s.outcome === "compliant" ? "aligns" : "diverges", content: [evidenceCid] })),
      author: V("olive"), viewer: V("olive"), ...over });
    if (!r.ok) throw new Error(`fixture determination refused: ${JSON.stringify(r).slice(0, 500)}`);
    return r.id;
  };
  const D = determine();
  let n = 0;
  const x = {
    ...w, w, f, proj, pin, actions, conformance, standards, consequences, groupRef, evidenceCid, S1, S2, D, declare,
    determine, publishEdition, act,
    /** A new action created by a member (throws when refused); answers its id. `o` as `actionMd`'s, over defaults;
     *  its governing laws are stated through actions' R18 act unless `laws: null`. */
    action(o = {}) {
      const id = o.id || `ACTN-2026-${String(9000 + ++n)}-x`;
      const doc = {
        kind: "bylaw_complaint", risk_tier: 1, state: "active",
        counterparty: { state: "named", role: "Selectboard", body: "Port Ellery Selectboard", level: "city" },
        clock: [{ text: "answer due", description: "the Selectboard answers", date: "2026-04-01", basis: "P.E.B.L. § 4", status: "pending" }],
        legs: [{ target: D, kind: "rests_on" }],
        state_history: [{ at: "2026-03-10T09:00:00Z", from: "planned", to: "active", reason: "opened" }], ...o };
      const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `a${++n}`, author: V("olive"),
        files: [{ path: "bundle.md", text: actionMd(id, doc) }], meta: { object_type: "action" } });
      if (!r.ok) throw new Error(`fixture action refused: ${JSON.stringify(r).slice(0, 600)}`);
      if (o.laws !== null) {
        const l = actions.actionLaws({ target: id, laws: o.laws || [{ level: "city", citation: "P.E.B.L. § 4" }],
                                       author: V("olive"), viewer: V("olive") });
        if (!l.ok) throw new Error(`fixture laws refused: ${JSON.stringify(l).slice(0, 300)}`);
      }
      return id;
    },
    /** A member's revision of an action's bundle.md, `edit` taking and returning its text. */
    revise(id, edit) {
      const head = w.record.head(id);
      const r = w.promotion.promote({ bundleId: id, base: head.bundleSha, snapKey: `r${++n}`, author: V("olive"),
        files: [{ path: "bundle.md", text: edit(w.text(id)) }], meta: { object_type: "action" } });
      if (!r.ok) throw new Error(`fixture revision refused: ${JSON.stringify(r).slice(0, 600)}`);
      return r;
    },
    read: (id) => actions.actionRead({ id, viewer: MACHINE }),
    op(name, query = {}, body = null) {
      const url = new URL(`http://do/${name}`);
      for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
      return filingsOps(f, url, body)[name]();
    },
    /** A capture registered in the record (a filing's sent bytes, say): its sha. */
    capture(id, text) {
      const path = `snapshots/${id}.txt`;
      const res = w.promotion.promote({ bundleId: id, base: null, snapKey: `c-${id}`, author: V("bo"),
        files: [{ path: "bundle.md", text: infoMd(id) }, { path, text },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(path, text)] }) }],
        meta: { object_type: "information" }, register: [{ sha256: sha(text), path, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
      if (!res.ok) throw new Error(`fixture capture refused: ${JSON.stringify(res).slice(0, 300)}`);
      return sha(text);
    },
    profile: (id = PROFILE) => profileOf(id),
  };
  return x;
}

/* A document whose capture carries an RFC 3161 attestation and a co-archive locator, as `op=attest` records them. */
function attestedDoc(w, id) {
  const text = `the text of ${id}`, path = `snapshots/${id}.txt`;
  const doc = { ...provDoc(path, text),
    attestations: [{ kind: "rfc3161", service: "tsa.example", file: "snapshots/timestamp-aaaa.tsr", sha256: "ab".repeat(32) }],
    co_archive: { service: "archive.example", locator: "https://archive.example/x" },
    attestation_attempts: [{ service: "tsa.example", ok: true, attempted: "2026-09-27T01:00:00Z", token_sha256: "ab".repeat(32) }] };
  const res = w.promotion.promote({ bundleId: id, base: null, snapKey: `a-${id}`, author: V("bo"),
    files: [{ path: "bundle.md", text: infoMd(id) }, { path, text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [doc] }, null, 2) }],
    meta: { object_type: "information" }, register: [{ sha256: sha(text), path, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
  if (!res.ok) throw new Error(`fixture attested doc refused: ${JSON.stringify(res).slice(0, 300)}`);
  w.prov.recordReceipt({ address: `https://example.org/${path}`, addressNorm: `example.org/${path}`, captureSha: sha(text),
                         retrieved: "2026-09-27T00:00:00Z" });
}

function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

function provDoc(path, text) {
  return { file: path, locator: `https://example.org/${path}`, retrieved: "2026-09-27T00:00:00Z",
           authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(text), encoding: "utf8",
                      bytes: Buffer.byteLength(text) },
           origin: { kind: "named_request" } };
}
