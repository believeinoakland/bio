/* filings over the modules it uses. The earlier ones are the real ones, on publication's own test world (record-core,
   membership, promotion, provenance, content, inquiry, publication; a real SQLite database standing in for a Durable
   Object's storage). The layer-9 modules built beside it (actions, conformance, standards, consequences) are stand-ins
   that answer exactly what their Provides state (`build/requirements/<module>.md`), each read only through the services
   filings calls. Every test drives `filings` at its interface. */
import { createHash } from "node:crypto";
import { world as publicationWorld, V, NOW } from "../publication/fixture.mjs";
import { filingsOf, filingsOps } from "../../../src/filings/index.mjs";
import { consequencesModule } from "../../../src/consequences/index.mjs";
import { isMachineIdentity } from "../../../checks/bio-checks.mjs";
import { get as profileOf } from "../../../../jurisdictions/index.mjs";

export { V, NOW };
export const MACHINE = "class:daemon";
export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
export const F = "INQ-2026-0001", G = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes", EVID = "INFO-2026-0002-ledger";
export const CASE = "CASE-2026-0001";
export const PROFILE = "test-port-ellery";

/* A viewer sees an object when it names no audience, or when the viewer is a machine or in its audience. */
const sees = (obj, viewer) => !obj.audience || isMachineIdentity(viewer) || obj.audience.includes(viewer);

/** actions, as its R9, R15–R16, R25, R29, R32 state (the stand-in keeps each action as an object). */
export function actionsStandIn(w) {
  const held = new Map();
  const calls = { correspond: [], clockPropose: [] };
  return {
    held, calls,
    actionRead({ id, viewer }) {
      const a = held.get(id);
      if (!a || !sees(a, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE" };
      const { audience, ...block } = structuredClone(a);
      return { ok: true, ...block };
    },
    actionCorrespond({ target, direction, at, medium, artifactSha, account, author, viewer }) {
      calls.correspond.push({ target, direction, at, medium, artifactSha, account, author, viewer });
      if (!author || isMachineIdentity(author)) return { ok: false, reason: "MACHINE_CANNOT_CORRESPOND" };
      if (!["sent", "received", "no_response"].includes(direction)) return { ok: false, reason: "BAD_DIRECTION" };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(at ?? ""))) return { ok: false, reason: "BAD_DATE" };
      if (artifactSha && account) return { ok: false, reason: "CAPTURE_AND_TESTIMONY" };
      if (!artifactSha && !account) return { ok: false, reason: "NEITHER_CAPTURE_NOR_TESTIMONY" };
      const a = held.get(target);
      if (!a || !sees(a, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE" };
      if (artifactSha && !w.prov.homeOf(artifactSha)) return { ok: false, reason: "UNREGISTERED_ARTIFACT" };
      const ord = a.correspondence.length;
      a.correspondence.push({ ord, direction, at, ...(medium ? { medium } : {}),
                              ...(artifactSha ? { artifact_sha: artifactSha } : { account }), author });
      return { ok: true, target, ord, direction, at, author, held_as: artifactSha ? "capture" : "testimony" };
    },
    clockPropose({ target, rule, proposer, viewer }) {
      calls.clockPropose.push({ target, rule, proposer, viewer });
      return { ok: true, proposal: { target, rule, label: { by: proposer } }, evidence: false };
    },
  };
}

/** conformance, as its R9–R11 state. */
export function conformanceStandIn() {
  const held = new Map();
  return {
    held,
    determinationRead({ id, viewer }) {
      const d = held.get(id);
      if (!d || !sees(d, viewer)) return { ok: false, reason: "NO_SUCH_DETERMINATION" };
      const { audience, ...rest } = structuredClone(d);
      return { ok: true, live: !rest.superseded_by, ...rest,
               outcomes: rest.standards.map((s) => ({ standard: s.id, outcome: s.outcome })) };
    },
    determinationsFor({ finding, live, viewer }) {
      const items = [...held.values()].filter((d) => sees(d, viewer) && (!live || !d.superseded_by)
        && d.findings.some((f) => f && f.id === finding)).map((d) => ({ id: d.id }));
      return { ok: true, items, truncated: false };
    },
  };
}

/** standards, as its R5 and R7 state. */
export function standardsStandIn() {
  const held = new Map();
  return {
    held,
    standardRead({ id, viewer }) {
      const s = held.get(id);
      if (!s || !sees(s, viewer)) return { ok: false, reason: "NO_SUCH_STANDARD" };
      const { audience, ...rest } = structuredClone(s);
      return { ok: true, ...rest };
    },
    inForce(id, date) {
      const s = held.get(id);
      if (!s) return { state: "undetermined", why: "no such standard" };
      const { from, to } = s.period || {};
      if ((from && date < from) || (to && date > to)) return { state: "not_in_force", why: "outside its period" };
      if (!from) return { state: "undetermined", why: "its start is not stated" };
      return { state: "in_force", why: null };
    },
  };
}

/** The world: a published case over F (resting on DOC), the test profile active, a named counsel and the stand-ins.
 *  `profiles` replaces the active profile list (ids or profile objects). */
export function world({ profiles = undefined, group = "test-group" } = {}) {
  const w = publicationWorld({ group });
  w.member("olive"); w.member("bo"); w.member("cy");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  attestedDoc(w, EVID);
  w.inquiry(F, { legs: [{ target: DOC }], extra: [] });
  w.promote(F, w.text(F).replace("## Conclusion\n", "## Conclusion\n\nThe works order was let without the vote the bylaw requires.\n"));
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare(CASE, 1, { project: proj, roles });
  const signed = w.signCase(CASE, 1, { project: proj, roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
  if (!signed.ok) throw new Error(`fixture case refused: ${JSON.stringify(signed)}`);
  const pub = w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] });
  if (!pub.ok) throw new Error(`fixture publish refused: ${JSON.stringify(pub)}`);
  w.record.setSetting("jurisdiction_profiles", [PROFILE], V("olive"));
  const actions = actionsStandIn(w), conformance = conformanceStandIn(), standards = standardsStandIn();
  /* consequences is the real module (merged early, K250), reading the conformance stand-in. */
  const consequences = consequencesModule(w.host, { record: w.record, membership: w.membership, promotion: w.promotion,
    conformance, content: w.content, provenance: w.prov, inquiry: w.k, now: () => w.clock.now });
  const groupRef = { value: group };
  const deps = { record: w.record, publication: w.p, provenance: w.prov, content: w.content, actions, conformance,
                 standards, consequences, producingGroup: () => groupRef.value, now: () => w.clock.now,
                 ...(profiles !== undefined ? { profiles: () => profiles } : {}) };
  const f = filingsOf(w.host, deps);
  const evidenceCid = w.content.mint({ bundleId: EVID, captureSha: sha(`the text of ${EVID}`), extent: { kind: "document" },
                                       mintedBy: V("bo") }).content_id;
  standards.held.set("STD-2026-0001", { id: "STD-2026-0001", cite: "P.E.B.L. § 12", kind: "ordinance",
    issuer: "Port Ellery Selectboard", text: [evidenceCid], period: { from: "2020-01-01", to: null }, superseded_by: null });
  standards.held.set("STD-2026-0002", { id: "STD-2026-0002", cite: "MCBC 2025-3", kind: "commitment",
    issuer: "Marlow County Commission", text: [evidenceCid], period: { from: null, to: null }, superseded_by: null });
  conformance.held.set("CONF-2026-0001", {
    id: "CONF-2026-0001", project: proj,
    act: { id: "ACT-2026-0001", description: "the works order let on 2026-03-02", actor: { role: "Selectboard", body: "Port Ellery Selectboard" },
           at: "2026-03-02", evidence: [evidenceCid] },
    findings: [{ id: F, case: CASE, edition: 1, version_sha: pin }],
    standards: [{ id: "STD-2026-0001", outcome: "noncompliant" }, { id: "STD-2026-0002", outcome: "compliant" }],
    rows: [], superseded_by: null, basis_changed: null, author: V("olive"), at: NOW });
  const action = (id, over = {}) => {
    const a = { id, kind: "bylaw_complaint", risk_tier: 1, current_state: "active",
      counterparty: { state: "named", role: "Selectboard", body: "Port Ellery Selectboard", level: "city" },
      clock: [{ text: "answer due", description: "the Selectboard answers", date: "2026-04-01", basis: "P.E.B.L. § 4", status: "pending" }],
      legs: [{ target: "CONF-2026-0001", kind: "rests_on" }], correspondence: [],
      state_history: [{ at: "2026-03-10T09:00:00Z", from: "planned", to: "active", reason: "opened" }],
      governing_laws: { state: "stated", laws: [{ level: "city", citation: "P.E.B.L. § 4" }], by: V("olive"), at: NOW },
      law: null, ...over };
    actions.held.set(id, a);
    return a;
  };
  const x = {
    ...w, w, f, proj, pin, actions, conformance, standards, consequences, groupRef, evidenceCid, action,
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
