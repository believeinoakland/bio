/* following's test fixture: a Durable Object storage stand-in over node:sqlite (the plane's `sql.exec` cursor shape,
   `transactionSync` as savepoints) with the real modules following reads through — record-core, membership,
   extraction (the readings events reads), provenance (the register a landing writes; product code imports neither,
   promotion reaches them), entities (the body's identifiers) and
   events (its Legistar import and observed meetings) — over the fictional test profile, to which a test adds a
   Legistar system and body scheme as test data (the profile names none).
   Services injected, coded to their requirements (K1563 (1)): `content`'s extent context (no container extent held); `monitoring`'s host (its R65: pause, epoch,
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
import { Entities } from "../../../src/entities/index.mjs";
import { eventsOf } from "../../../src/events/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { followingOf } from "../../../src/following/index.mjs";
import { monitoringOf, MONITOR_PAUSE_SETTING } from "../../../src/monitoring/index.mjs";

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
      body: { ...view.spaces.body, forms: [...view.spaces.body.forms, numeric("legistar-body")] },
      person: { ...view.spaces.person, forms: [...view.spaces.person.forms, { form: "licence", pattern: { re: "^(L-\\d{5})$" }, normal: [{ group: 1 }], basis: "TEST" }] } };
    view.identifier_schemes = [...(view.identifier_schemes || []),
      { scheme: "legistar_body", label: "Legistar BodyId", entity_kinds: ["body"], space: "body", form: "legistar-body", systems: ["ellery.legistar"], basis: "TEST" },
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
  /* the real monitoring (its R65 host: pause, epoch, claim, running, ranked, and the landing through promotion) */
  const w0 = { t: now };
  const mon = monitoringOf(host, { record, membership, env: {}, now: () => w0.t, intent: null, publication: null });
  const promotion = mon.promotion;
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  const x = new Extraction(st, { record, membership, promotion });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-10-01T00:00:00Z" });
  prov.migrate();
  const ents = new Entities(st, { record, membership, provenance: prov });
  ents.migrate();
  ents.view = () => ({ ...view, conflicts: [] });
  let clock = 0;
  /* content's extent context (its R12–R13) for a capture whose container extent this record does not hold */
  const content = { contentContextFor: () => ({ chain: null, pageCount: null, pageBoxes: null, container: { held: false }, format: null, office: null }) };
  const ev = eventsOf(host, { record, membership, provenance: prov, extraction: x, content, entities: ents,
                              now: () => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString(), view: () => view });
  ev.migrate();
  for (const [m, role] of [["alice", "member"], ["bob", "member"], ["outsider", "member"], ["root", "admin"]])
    st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', ?, 'active', '2026-01-01', '2026-01-01')`, m, role);

  const w = { st, host, record, membership, x, prov, ents, ev, view, mon, promotion, get t() { return w0.t; }, set t(v) { w0.t = v; },
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
      const retrieved = new Date(w.t).toISOString().replace(/\.\d{3}Z$/, "Z");
      return { status: 200, body: { ok: true, existed: false, document: { locator: q.locator, retrieved, file: `snapshots/${s.slice(0, 12)}`,
        authority_state: "undetermined", authority_basis: `${retrieved}: fetched for a follow; no authority asserted`,
        origin: { kind: "named_request" }, attestation_attempts: [],
        provenance_chain: [{ who: "instance test (Civicsmith/0.0.0)", asserts: `these bytes were served for ${q.locator} at ${retrieved}`, bound: false, via: "direct" }],
        capture: { method: q.render ? "rendered" : "direct", grade: "B", actor_class: opts.member ? "member" : "daemon", actor: opts.sessMember || null,
                   sha256: s, encoding: "binary", bytes: bytes.length, content_type: "application/json",
                   ...(q.credential ? { credentialed: { kind: q.credential.kind }, reproducible_by_public: false } : {}) } } } };
    },
  };

  /* ---- monitoring: its real host (R65), with `schedule` (R16's unscheduled per_meeting rows, which need retrieval's
     projection, a module following does not use) and `monitor` (R1–R10, monitoring's own tests') standing in ---- */
  w.landed = [];
  w.watched = [];            /* {bundle, address}: per_meeting subjects */
  w.monitored = [];
  const real = mon.sweepHost();
  const sweepHost = Object.freeze({ ...real, land: (request, filed, at, say) => {
    const r = real.land(request, filed, at, say);
    w.landed.push({ request, filed, at, say, bundle: r && r.bundle_id, answer: r });
    return r;
  } });
  w.pause = (on) => record.setSetting(MONITOR_PAUSE_SETTING, on ? { paused: true, by: "class:admin", at: "2026-10-01T00:00:00Z" } : { paused: false }, "class:admin");
  const monitoring = {
    sweepHost: () => sweepHost,
    schedule: () => ({ due: [], scheduled: [], unscheduled: w.watched.map((s) => ({ bundle: s.bundle, address: s.address, frequency: "per_meeting",
      reason: "cadence is a meeting schedule your group's Civicsmith does not hold" })) }),
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
export const voteRow = (id, itemId, personId, value = "Content") => ({ VoteId: id, VoteEventItemId: itemId, VotePersonId: personId, VoteValueName: value, VoteResult: 1 });
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
  w.x.writeReading({ bundleId: "INFO-2026-0900-minutes", captureSha: s, composed: true,
    reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-10-01T00:00:00Z", entities: [], facts: {} } });
  const df = w.ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: "meeting", value, method: "read by a member", by: MEMBER });
  if (!df.ok) throw new Error(`fixture: dated fact refused ${df.reason}: ${df.detail}`);
  const e = w.ev.createEvent({ kind: "meeting", status, concerns: [bodyId], attestations: [{ datedFactId: df.dated_fact.dated_fact_id }], by: MEMBER });
  if (!e.ok) throw new Error(`fixture: createEvent refused ${e.reason}: ${e.detail}`);
  return e.event_id ?? e.event?.event_id;
}
