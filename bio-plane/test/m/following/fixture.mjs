/* following's test fixture: a Durable Object storage stand-in over node:sqlite (the plane's `sql.exec` cursor shape,
   `transactionSync` as savepoints) with the real modules following reads through — record-core, membership,
   extraction (the readings events reads), provenance (the register), content, entities (the body's identifiers) and
   events (its Legistar import and observed meetings) — over the fictional test profile, to which a test adds a
   Legistar system and body scheme as test data (the profile names none).
   Two services are injected, coded to their requirements (K1563 (1)): `monitoring`'s host (its R65: pause, epoch,
   claim, running, ranked, land; `land` registers the capture under a new bundle in the request's project and writes
   the document's reading as promotion's projection does, extraction R20), its `schedule` (R16's unscheduled
   `per_meeting` rows) and `monitor` (R1–R10's answer); and `capture.acquire`'s capture-request arm (acquisition
   R21–R23), serving bytes a test puts at an address, answering `unchanged` to a matching `heldSha`. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { readHooksOf } from "../../../src/reading-pipeline/hooks.mjs";
import { eventsOf } from "../../../src/events/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { followingOf } from "../../../src/following/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? s : Buffer.from(s)).digest("hex");
export const MACHINE = "class:daemon";
export const MEMBER = "member:alice";
export const BOB = "member:bob";
export const OUTSIDER = "member:outsider";
export const T0 = Date.UTC(2026, 9, 6, 12, 0, 0);
export const DAY = 86400000;
export const CLIENT = "ellery";
export const API = `https://webapi.legistar.com/v1/${CLIENT}`;

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = { next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
              [Symbol.iterator]() { return c; }, toArray() { const o = rows.slice(i); i = rows.length; return o; } };
  return c;
}
function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}
const promotionStub = () => ({ registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; }, onCommitted() { return { ok: true }; } });

/** The test profile's view with a Legistar system (API and site hosts of one origin) and a body scheme it issues, and a
 *  register system a person scheme names, as test data. */
export function testView({ legistar = true } = {}) {
  const view = structuredClone(combine(["test-port-ellery"]).view);
  if (legistar) {
    view.systems = [...(view.systems || []),
      { origin: "ellery.legistar", name: "Legistar (test)", hosts: ["webapi.legistar.com"], path: { re: "^/v1/ellery(/|$)", flags: "i" }, basis: "TEST" },
      { origin: "ellery.legistar", name: "Legistar site (test)", hosts: ["ellery.legistar.com"], basis: "TEST" },
      { origin: "ellery.licences", name: "Licence register (test)", hosts: ["licences.ellery.example"], basis: "TEST" }];
    const numeric = (form) => ({ form, pattern: { re: "^(\\d+)$" }, normal: [{ group: 1 }], basis: "TEST" });
    view.spaces = { ...view.spaces,
      object: { ...(view.spaces.object || { label: "object" }), forms: [...((view.spaces.object || {}).forms || []), numeric("legistar-body")] },
      person: { ...view.spaces.person, forms: [...view.spaces.person.forms, { form: "licence", pattern: { re: "^(L-\\d{5})$" }, normal: [{ group: 1 }], basis: "TEST" }] } };
    view.identifier_schemes = [...(view.identifier_schemes || []),
      { scheme: "legistar_body", label: "Legistar BodyId", entity_kinds: ["body"], space: "object", form: "legistar-body", systems: ["ellery.legistar"], basis: "TEST" },
      { scheme: "ellery_licence", label: "licence number", entity_kinds: ["person"], space: "person", form: "licence", systems: ["ellery.licences"], basis: "TEST" }];
  }
  return view;
}

/** A fresh world: the real modules, the injected host, monitoring and capture, and `following` over them. */
export function world({ view = testView(), now = T0 } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "test");
  const membership = membershipOf(host, { record });
  membership.migrate();
  const x = new Extraction(st, { record, membership, promotion: promotionStub() });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion: promotionStub(), now: () => "2026-10-01T00:00:00Z" });
  prov.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: x });
  if (typeof content.migrate === "function") content.migrate();
  const ents = new Entities(st, { record, membership, provenance: prov });
  ents.migrate();
  ents.view = () => ({ ...view, conflicts: [] });
  let clock = 0;
  const ev = eventsOf(host, { record, membership, provenance: prov, extraction: x, content, entities: ents, readHooks: readHooksOf(host),
                              now: () => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString(), view: () => view });
  ev.migrate();
  for (const [m, role] of [["alice", "member"], ["bob", "member"], ["outsider", "member"], ["root", "admin"]])
    st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', ?, 'active', '2026-01-01', '2026-01-01')`, m, role);

  const w = { st, host, record, membership, x, prov, ents, ev, view, t: now,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)], one: (q, ...a) => [...st.sql.exec(q, ...a)][0] || null };

  /* ---- what bytes the network serves, and what capture did ---- */
  w.served = new Map();      /* address → string | {status} */
  w.store = new Map();       /* sha → bytes */
  w.fetches = [];            /* each capture-request arm call's options */
  w.serve = (address, body) => { w.served.set(address, typeof body === "string" ? body : JSON.stringify(body)); };
  const capture = {
    async acquire(_body, opts) {
      w.fetches.push(opts);
      const q = opts.captureRequest;
      const got = w.served.get(q.locator);
      if (got === undefined) return { status: 502, body: { ok: false, reason: "FETCH_FAILED" } };
      const bytes = new TextEncoder().encode(got);
      const s = sha(bytes);
      w.store.set(s, bytes);
      if (q.heldSha === s) return { status: 200, body: { ok: true, existed: true, unchanged: true, capture: { sha256: s } } };
      return { status: 200, body: { ok: true, existed: false, document: { locator: q.locator, retrieved: new Date(w.t).toISOString(), file: `snapshots/${s.slice(0, 12)}`,
        capture: { sha256: s, bytes: bytes.length, content_type: "application/json", method: q.render ? "rendered" : "direct",
                   ...(q.credential ? { credentialed: { kind: q.credential.kind }, reproducible_by_public: false } : {}) } } } };
    },
  };

  /* ---- monitoring's host (its R65), its schedule (R16) and its check (R1–R10) ---- */
  w.paused = false;
  w.landed = [];
  w.watched = [];            /* {bundle, address}: per_meeting subjects */
  w.monitored = [];
  const epochs = new Map(), claims = new Set(), running = new Set();
  let bundles = 0;
  const sweepHost = Object.freeze({
    paused: () => (w.paused ? { paused: true, by: "member:root", at: "2026-10-01T00:00:00Z" } : { paused: false }),
    openEpoch: (c, nowMs, stale) => { const e = epochs.get(c); if (e !== undefined && nowMs - e < stale) return e; epochs.set(c, nowMs);
      for (const k of [...claims]) if (k.startsWith(`${c}|`) && !k.startsWith(`${c}|${nowMs}|`)) claims.delete(k); return nowMs; },
    claim: (c, subject, e) => { const k = `${c}|${e}|${subject}`; if (claims.has(k)) return false; claims.add(k); return true; },
    closeEpoch: (c, e) => { epochs.delete(c); for (const k of [...claims]) if (k.startsWith(`${c}|${e}|`)) claims.delete(k); },
    running,
    ranked: (list, item, rank, nowMs) => {
      if (typeof rank !== "function") return list;
      let order;
      try { order = rank(list.map(item), nowMs); } catch { return list; }
      if (!Array.isArray(order)) return list;
      const byId = new Map(list.map((e) => [item(e).id, e]));
      const out = order.map((o) => byId.get(o.id)).filter(Boolean);
      return [...out, ...list.filter((e) => !out.includes(e))];
    },
    land: (request, filed, at, say) => {
      const id = `INFO-2026-${String(++bundles).padStart(4, "0")}-followed`;
      const home = request.bundle ? w.one(`SELECT project FROM bundles WHERE bundle_id=?`, request.bundle) : null;
      w.bundle(id, { project: home ? home.project || "" : "" });
      const doc = filed.doc;
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                  doc.capture.sha256, id, doc.file, doc.capture.bytes, at);
      if (doc.reading) x.writeReading({ bundleId: id, captureSha: doc.capture.sha256, reading: doc.reading });
      w.landed.push({ request, filed, at, say, bundle: id });
      return { ok: true, bundle_id: id, state: "collected" };
    },
    gate: () => null,
    recheckMs: () => 3600000,
  });
  const monitoring = {
    sweepHost: () => sweepHost,
    schedule: () => ({ due: [], scheduled: [], unscheduled: w.watched.map((s) => ({ bundle: s.bundle, address: s.address, frequency: "per_meeting",
      reason: "cadence is a meeting schedule this plane does not hold" })) }),
    async monitor({ bundleId }) { w.monitored.push({ bundleId, at: w.t }); return { status: 200, body: { ok: true, status: "unchanged", capture: { sha256: sha(`m${w.monitored.length}`) } } }; },
  };
  w.bundle = (id, { type = "information", project = "" } = {}) => {
    st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                 VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, project);
    return id;
  };
  w.project = (id, participant = "alice") => {
    w.bundle(id, { type: "project" });
    st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
    return id;
  };
  w.entity = (label, kind = "body") => ents.createEntity({ kind, label, note: "a subject the test registers", declaredBy: MEMBER }).entity_id;
  w.identify = (entityId, scheme, id) => {
    const r = ents.addIdentifier({ entityId, scheme, id: String(id), basis: "the test's cited source", by: MEMBER });
    if (!r.ok) throw new Error(`fixture: addIdentifier refused ${r.reason}: ${r.detail}`);
  };
  w.f = followingOf(host, { record, membership, capture, entities: ents, events: ev, monitoring, view: () => view,
                            now: () => w.t, bytes: async (s) => w.store.get(s) || null });
  w.capture = capture;
  w.monitoring = monitoring;
  w.sweepHost = sweepHost;
  return w;
}

/* ---- captured Legistar JSON for a fictional body (BodyId 41) ---- */
export const BODY_ID = 41;
export const meetingRow = (id, date, time, extra = {}) => ({ EventId: id, EventBodyId: BODY_ID, EventBodyName: "Port Ellery Selectboard",
  EventDate: `${date}T00:00:00`, EventTime: time, EventAgendaStatusName: "Final", EventMinutesStatusName: "Draft",
  EventAgendaLastPublishedUTC: null, EventMinutesLastPublishedUTC: null, EventInSiteURL: null, ...extra });
export const itemRow = (id, eventId, extra = {}) => ({ EventItemId: id, EventItemEventId: eventId, EventItemAgendaNumber: "1",
  EventItemMatterId: 900, EventItemMatterFile: "26-0001", EventItemTitle: "A resolution", EventItemActionName: "Adopted",
  EventItemPassedFlag: 1, EventItemMoverId: null, EventItemSeconderId: null, ...extra });
export const voteRow = (id, itemId, personId, value = "Aye") => ({ VoteId: id, VoteEventItemId: itemId, VotePersonId: personId, VoteValueName: value, VoteResult: 1 });
export const matterRow = (id, extra = {}) => ({ MatterId: id, MatterFile: `26-${id}`, MatterTypeName: "Ordinance", MatterStatusName: "Introduced",
  MatterIntroDate: "2026-09-01T00:00:00", MatterPassedDate: null, MatterEnactmentNumber: null, MatterEnactmentDate: null, ...extra });

/** A followed Legistar body: registered, with its BodyId in the test scheme. */
export function body(w, label = "Port Ellery Selectboard") {
  const id = w.entity(label);
  w.identify(id, "legistar_body", BODY_ID);
  return id;
}

/** An observed meeting of `body` in `events`: a member's event concerning the body, attested by a dated fact of a held
 *  capture (`value` a local minute in the profile's zone), with `status`. */
export function observedMeeting(w, bodyId, value, status = "EventScheduled") {
  const s = sha(`meeting ${value} ${Math.random()}`);
  w.bundle("INFO-2026-0900-minutes");
  w.st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0900-minutes', 'snapshots/m', 'utf8', 1, '2026-10-01T00:00:00Z')`, s);
  w.prov.recordReceipt({ address: `https://ellery.example/${s}`, addressNorm: `https://ellery.example/${s}`, captureSha: s, retrieved: "2026-10-01T00:00:00Z", via: "direct" });
  w.x.writeReading({ bundleId: "INFO-2026-0900-minutes", captureSha: s, composed: true,
    reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-10-01T00:00:00Z", entities: [], facts: {} } });
  const df = w.ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: "meeting", value, method: "read by a member", by: MEMBER });
  if (!df.ok) throw new Error(`fixture: dated fact refused ${df.reason}: ${df.detail}`);
  const e = w.ev.createEvent({ kind: "meeting", status, concerns: [bodyId], attestations: [{ datedFactId: df.dated_fact.dated_fact_id }], by: MEMBER });
  if (!e.ok) throw new Error(`fixture: createEvent refused ${e.reason}: ${e.detail}`);
  return e.event_id ?? e.event?.event_id;
}
