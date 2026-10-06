/* progressions over the real events, standards and local-facts (K1563 (1), K1581): the modules R16, R37 and R39 read,
   built over one storage at the plane's shape with the fictional test profile (layers.md rule 3), so the shapes the
   other files' providers stand in for are the ones these modules answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { storage } from "./fixture.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { eventsOf, noSuchDatedFact } from "../../../src/events/index.mjs";
import { standardsOf, noSuchStandard } from "../../../src/standards/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";

const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const MEMBER = "class:member", ALICE = "member:alice";
const promotionStub = () => ({ registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; }, onCommitted() { return { ok: true }; } });

function realWorld() {
  const st = storage();
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "test");
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionStub();
  const x = extractionOf(host, { record, membership, promotion });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  const ents = new Entities(st, { record, membership, provenance: prov });
  ents.migrate();
  /* content's tables, as the plane's migration pass makes them (the extent check events runs reads them); events and
     standards reach content, the reading hooks and the jurisdiction view through their own factories */
  const content = contentOf(host, { record, membership, provenance: prov, extraction: x });
  if (typeof content.migrate === "function") content.migrate();
  const ev = eventsOf(host, { record, membership, provenance: prov, extraction: x, entities: ents, now: () => "2026-10-01T00:00:00Z" });
  ev.migrate();
  const view = { time_zone: { value: ev.zone() } };
  const std = standardsOf(host, { record, membership, promotion });
  st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES ('alice', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  const p = progressionsOf(host, { record, extraction: x, provenance: prov, entities: ents, now: () => "2026-10-01T12:00:00.000Z" });
  p.migrate();
  const w = {
    st, record, ev, std, p, ents, view,
    capture(name, bundleId) {
      const s = sha(name);
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, '')`, bundleId);
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, s, bundleId);
      prov.recordReceipt({ address: `https://example.test/${name}`, addressNorm: `https://example.test/${name}`, captureSha: s,
                           retrieved: "2026-09-27T00:00:00Z", via: "direct" });
      x.writeReading({ bundleId, captureSha: s, composed: true,
        reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [], facts: {} } });
      return s;
    },
    fact(s, value) {
      const r = ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: "signed", value, method: "read by a member", by: ALICE });
      if (!r.ok) throw new Error(`recordDatedFact refused ${r.reason}: ${r.detail}`);
      return r.dated_fact.dated_fact_id;
    },
  };
  return w;
}

test("R37 R16 R39: over the real events, standards and local-facts, own dates, the overdue clock and the basis standard read as their requirements say", async () => {
  const w = realWorld();
  const ent = w.ents.createEntity({ kind: "contract", label: "A contract", note: "the test's subject", declaredBy: ALICE });
  assert.equal(ent.ok, true, JSON.stringify(ent));
  const E = ent.entity_id;
  const a = w.capture("need", "INFO-2026-0001-need"), b = w.capture("award", "INFO-2026-0002-award");
  for (const [s, bid] of [[a, "INFO-2026-0001-need"], [b, "INFO-2026-0002-award"]])
    /* the resolution row at entities' read contract (its R35), as resolve writes one */
    w.st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method) VALUES (?, ?, 'contract:1', ?, 'A', 'test')`, s, bid, E);
  const fa = w.fact(a, "2026-01-10");
  const evt = w.ev.createEvent({ kind: "award", attestations: [{ datedFactId: w.fact(b, "2026-03-01") }], by: ALICE });
  assert.equal(evt.ok, true, JSON.stringify(evt));
  // the zone local-facts governs: the test profile's time_zone
  const zone = w.view.time_zone.value;
  // R37: a dated fact of another capture is events' own answer; an event the document does not attest is refused
  const def = w.p.defineProgression({ progressionKey: "proc", label: "Procurement", declaredBy: ALICE, basis: "why",
    stages: [{ key: "need", cardinality: "1", required: "always" }, { key: "award", after: "need", cardinality: "1", required: "always", within: "30 days" },
             { key: "contract", after: "award", cardinality: "1", required: "always", within: "1 month" }] });
  assert.equal(def.ok, true, JSON.stringify(def));
  const T = (placements) => w.p.threadInstance({ progressionKey: "proc", entityId: E, placements, threadedBy: ALICE, viewer: MEMBER });
  assert.deepEqual(await T([{ stage: "need", captureSha: b, datedFact: fa }]), noSuchDatedFact(fa, { stage_key: "need", capture_sha: b }));
  assert.equal((await T([{ stage: "need", captureSha: a, event: evt.event_id }])).code, "NOT_ATTESTED_BY_DOCUMENT");
  const r = await T([{ stage: "need", captureSha: a }, { stage: "award", captureSha: b, event: evt.event_id }]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const docs = Object.fromEntries(r.stages.flatMap((s) => s.documents).map((d) => [d.capture_sha, d]));
  assert.deepEqual([docs[a].own_date, docs[a].own_date_source], [{ value: "2026-01-10", precision: "day", zone }, "dated_fact"]);
  assert.deepEqual([docs[b].own_date.value, docs[b].own_date_source, docs[b].own_date_ref], ["2026-03-01", "event", evt.event_id]);
  // R32: the award (2026-03-01) is placed after its 30-day term from the need (2026-01-10 + 30 = 2026-02-09)
  assert.deepEqual(r.findings.filter((f) => f.kind === "placed_after_term").map((f) => f.term_ends), ["2026-02-09"]);
  // R16: the contract is due one calendar month after the award's own date, judged on the zone's local day
  const od = w.p.captureProgressions({ captureSha: b, nowMs: Date.parse("2026-04-03T12:00:00Z") }).instances[0].findings
    .filter((f) => f.kind === "overdue_successor");
  assert.deepEqual(od.map((f) => [f.stage_key, f.overdue, f.deadline, f.deadline_zone]), [["contract", true, "2026-04-01", zone]]);
  // R39: an absent standard is standards' one answer; the read's in-force answer is standards' own, on the local day
  assert.deepEqual(w.p.defineProgression({ progressionKey: "q", label: "Q", stages: [{ key: "a", cardinality: "1", required: "always" }],
                                           basis: { statement: "s", standard: "STD-2026-0099" }, viewer: MEMBER }), noSuchStandard("STD-2026-0099"));
});
