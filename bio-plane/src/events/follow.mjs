/* events: what the machine writes (R4, R22–R25, R38). Only what a source identifies at both ends by its own ids is
   written: a meeting by its `EventId`, an item by its `EventItemId` within its meeting, a participant whose `PersonId`
   resolves to a registered entity through a scheme identifier (grade A). Nothing is inferred: no cause, no relation but
   `within`, no participant from office holding (R41). Each row is stamped as the machine's, cites its capture, and is
   correctable by a member (R13, R14, R20). An import is idempotent by source id (R25). */
import { readDate } from "./time.mjs";
import { noSha } from "../extraction/index.mjs";
import { noEntity, noSuchEntity } from "../entities/index.mjs";
import { joinLocal } from "../civil-time/index.mjs";

export const MACHINE = "class:daemon";
const said = (v) => typeof v === "string" && v.trim() !== "";
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });

/* ---- R4: the dates a reading states ---- */

/* The fields of a reading's facts that state a date, by content type, and the dated-fact kind each is. A field named
   for a dated kind is that kind in every reading; `date` is a meeting's day in a minutes or agenda reading and a
   report's issue in a staff report. Any other field, or a value that is no date, is not held. */
const DATE_FIELD = { meeting_minutes: { date: "meeting" }, meeting_agenda: { date: "meeting" }, staff_report: { date: "issued" } };
const NAMED = ["meeting", "adopted", "effective", "signed", "entered", "issued", "published", "received", "hearing"];
export const READ_DATE_CLASSES = Object.freeze(["meeting_minutes", "meeting_agenda", "staff_report", "regulation",
  "meeting_calendar"]);

/** R4: each `{kind, date, method}` a reading states, with the reader's method (its content type, version and field). */
export function datesOfReading(reading, zone) {
  if (!isObj(reading) || !isObj(reading.facts)) return [];
  const type = reading.content_type, map = DATE_FIELD[type] || {}, out = [];
  for (const [field, v] of Object.entries(reading.facts)) {
    const kind = map[field] || (NAMED.includes(field) ? field : null);
    if (!kind || v == null) continue;
    const d = readDate(typeof v === "string" ? v.trim() : v, zone);
    if (d.bad) continue;
    out.push({ kind, date: d, method: `reader ${type}${reading.reader_version != null ? ` v${reading.reader_version}` : ""}: the field ${field}, as the reader states it` });
  }
  return out;
}

/* ---- R22: whose id resolves ---- */

/* The one registered entity a source id names through the view's schemes of the right space or kind (grade A), or null
   when none or two different ones do. */
function byScheme(k, id, test) {
  const ents = k.entities;
  if (!ents || typeof ents.entityByIdentifier !== "function") return null;
  const schemes = (Array.isArray(k.view().identifier_schemes) ? k.view().identifier_schemes : []).filter(test);
  const found = new Set();
  for (const s of schemes) {
    let r = null;
    try { r = ents.entityByIdentifier({ scheme: s.scheme, id: String(id) }); } catch { r = null; }
    const eid = r && typeof r === "object" ? r.entity_id ?? (r.entity && r.entity.entity_id) : typeof r === "string" ? r : null;
    if (eid) found.add(eid);
  }
  return found.size === 1 ? [...found][0] : null;
}
const personOf = (k, id) => byScheme(k, id, (s) => s && s.space === "person");
const bodyOf = (k, id) => byScheme(k, id, (s) => s && Array.isArray(s.entity_kinds) && s.entity_kinds.includes("body"));

/* The reading of a capture, through extraction (its R30's `readingOf`). */
function readingOf(k, sha) {
  try { const r = k.extraction.readingOf(sha); return r && r.reading ? r.reading : null; } catch { return null; }
}
function rowsOf(reading) {
  const f = reading && reading.facts;
  if (f && Array.isArray(f.rows)) return { rows: f.rows, endpoint: f.endpoint ?? null, at: (f.facts && f.facts.at) || reading.at || null };
  return { rows: [], endpoint: null, at: null };
}

/* R25: a source row's held record, and its facts as last written. */
function source(k, key) { return k.one(`SELECT * FROM event_sources WHERE source_key=?`, key); }
function keepSource(k, key, target, targetId, facts, sha) {
  k.rows(`INSERT OR REPLACE INTO event_sources (source_key, target, target_id, facts, capture_sha, at) VALUES (?,?,?,?,?,?)`,
         key, target, targetId, JSON.stringify(facts), sha, k.now());
}

/* One attestation of the capture's row, on an event (found, never repeated). */
function rowAttestation(k, eventId, held, row, datedFact = null) {
  const att = { form: datedFact ? "dated_fact" : "extent", dated_fact_id: datedFact ? datedFact.dated_fact_id : null,
    capture_sha: held.sha, extent: JSON.stringify({ kind: "document" }), source_row: Number.isInteger(row.source) ? row.source : null,
    statement: null, value: datedFact ? datedFact.value : null, precision: datedFact ? datedFact.precision : null,
    zone: datedFact ? datedFact.zone : null, bundle_id: held.bundleId, grade: k.captureGrade(held.sha) };
  return k.sameAttestation(eventId, att) ?? k.addAttestation(eventId, att, MACHINE);
}

function newEvent(k, kind, status) {
  const id = k.allocEvent();
  if (!id || !id.id) throw Object.assign(new Error("mint"), { refusal: id });
  k.insert("events", { event_id: id.id, kind, status, where_text: null, by_actor: MACHINE, at: k.now(), alias_of: null });
  return id.id;
}
function within(k, sub, larger, attestationId) {
  if (k.one(`SELECT 1 AS x FROM event_relations WHERE from_event=? AND to_event=? AND kind='within' AND withdrawn_at IS NULL`, sub, larger)) return;
  k.insert("event_relations", { from_event: sub, to_event: larger, kind: "within", attestation_id: attestationId, by_actor: MACHINE, at: k.now() });
}
function change(k, eventId, detail) {
  k.rows(`INSERT INTO event_changes (event_id, kind, detail, reason, by_actor, at) VALUES (?,?,?,?,?,?)`, eventId, "source_changed",
         JSON.stringify(detail), "the source's own value changed", MACHINE, k.now());
}
function participant(k, eventId, entityId, role, attestationId, voteValue = null) {
  const live = k.one(`SELECT * FROM event_participants WHERE event_id=? AND role=? AND entity_id=? AND superseded_by IS NULL`, eventId, role, entityId);
  if (live && (live.vote_value ?? null) === (voteValue ?? null)) return { id: Number(live.participant_id), added: false };
  const pid = k.insert("event_participants", { event_id: eventId, entity_id: entityId, role, vote_value: voteValue,
    attestation_id: attestationId, by_actor: MACHINE, at: k.now() });
  if (live) {
    k.rows(`UPDATE event_participants SET superseded_by=?, superseded_actor=?, superseded_at=?, superseded_why=? WHERE participant_id=?`,
           pid, MACHINE, k.now(), "the source's own value changed", live.participant_id);
    change(k, eventId, { participant: Number(live.participant_id), was: live.vote_value, now: voteValue });
  }
  return { id: pid, added: true };
}

/* ---- R22–R25: Legistar following ---- */

/** R22: the machine's writes from one Legistar capture of a followed body and period. */
export function followedImport(k, { captureSha, body, period, by = MACHINE } = {}) {
  if (!said(body)) return refuse("NO_BODY", "following names the one body a member follows, by its entity id");
  if (!isObj(period) || (!said(period.from) && !said(period.to)))
    return refuse("NO_PERIOD", "following names the period a member follows: {from, to}, days");
  if (!said(captureSha)) return noSha("an import reads one captured Legistar list, named by its capture sha256");
  const held = k.heldCapture(captureSha, null);
  if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture");
  const reading = readingOf(k, held.sha);
  if (!reading || reading.content_type !== "legistar_api")
    return refuse("NOT_LEGISTAR", "the capture is not one legistar-reader read");
  if (!k.entities || !k.entities.has(body)) return noSuchEntity(body, { end: "body" });
  const zone = k.zone();
  const from = said(period.from) ? period.from.trim() : null, to = said(period.to) ? period.to.trim() : null;
  const { rows, endpoint } = rowsOf(reading);
  const out = { written: [], updated: [], unchanged: 0, unresolved: [], outside: 0 };
  const res = k.tx(() => {
    for (const row of rows) {
      const f = row.facts || {};
      if (endpoint === "events" || row.kind === "event") meeting(k, held, row, f, { body, from, to, zone }, out);
      else if (endpoint === "eventitems" || row.kind === "event_item") item(k, held, row, f, out);
      else if (endpoint === "votes" || row.kind === "vote") vote(k, held, row, f, out);
    }
    return { ok: true };
  });
  if (res && res.ok === false) return res;
  return { ok: true, capture_sha: held.sha, endpoint, body, period: { from, to }, ...out,
           ...(["events", "eventitems", "votes"].includes(endpoint) ? {} : { why: `a ${endpoint} list holds no event, item or vote to write` }) };
}

function meeting(k, held, row, f, scope, out) {
  const bodyId = Number.isInteger(f.BodyId) ? bodyOf(k, f.BodyId) : null;
  if (bodyId !== scope.body) {
    if (bodyId === null) out.unresolved.push({ row: row.source, key: row.key, why: "its BodyId resolves to no registered body" });
    else out.outside++;
    return;
  }
  const day = typeof f.date === "string" ? f.date.slice(0, 10) : null;
  if (!day || (scope.from && day < scope.from) || (scope.to && day > scope.to)) { out.outside++; return; }
  /* R23: the source's day and its separate local time joined in the profile's zone (no EventDate carries a zone). */
  let date = null, why = null;
  if (!scope.zone) why = "no active profile gives a time zone, so the meeting's time is not placed";
  else if (said(f.time)) {
    const j = joinLocal(day, f.time, scope.zone);
    if (j.refused || j.undetermined) why = j.why; else date = { value: j.value, precision: "minute", zone: j.zone };
  } else date = readDate(day, scope.zone);
  if (date && date.bad) { why = date.bad; date = null; }
  const status = f.status === "cancelled" ? "EventCancelled" : "EventScheduled";
  const facts = { date: day, time: f.time ?? null, status, agenda: f.agenda_last_published ?? null, minutes: f.minutes_last_published ?? null };
  const fact = date ? k.holdFact({ sha: held.sha, bundleId: held.bundleId, extent: { kind: "document" }, kind: "meeting", date,
    method: "legistar-reader: EventDate and EventTime joined in the profile's zone", by: MACHINE, sourceRow: row.source }).dated_fact : null;
  const prior = source(k, row.key);
  let eventId;
  if (!prior) {
    eventId = newEvent(k, "meeting", status);
    rowAttestation(k, eventId, held, row, fact);
    k.setWhen(eventId);
    out.written.push({ key: row.key, event_id: eventId, ...(why ? { when_why: why } : {}) });
  } else {
    eventId = k.resolve(prior.target_id);
    const was = JSON.parse(prior.facts);
    const moved = was.date !== facts.date || was.time !== facts.time;
    const aid = rowAttestation(k, eventId, held, row, fact);
    if (moved && fact) k.rows(`INSERT INTO event_choices (event_id, attestation_id, reason, by_actor, at) VALUES (?,?,?,?,?)`,
                              eventId, aid, "the source's own date or time changed", MACHINE, k.now());
    if (was.status !== status) k.rows(`UPDATE events SET status=? WHERE event_id=?`, status, eventId);
    if (moved || was.status !== status) { change(k, eventId, { key: row.key, was: { date: was.date, time: was.time, status: was.status }, now: { date: facts.date, time: facts.time, status } }); out.updated.push({ key: row.key, event_id: eventId }); }
    else out.unchanged++;
    k.setWhen(eventId);
  }
  keepSource(k, row.key, "event", eventId, { ...facts, agenda: (prior && JSON.parse(prior.facts).agenda) || facts.agenda,
    minutes: (prior && JSON.parse(prior.facts).minutes) || facts.minutes }, held.sha);
  /* R24: a posting time is the agenda's or the minutes' publication, within the meeting, on or before the first value seen. */
  for (const [which, v] of [["agenda", f.agenda_last_published], ["minutes", f.minutes_last_published]]) {
    if (!said(v)) continue;
    const key = `${row.key}:${which}_published`;
    const p = source(k, key);
    const seen = p ? JSON.parse(p.facts).first : null;
    const first = seen && seen <= v ? seen : v;
    const d = readDate(first, "UTC");
    if (d.bad) continue;
    const pf = k.holdFact({ sha: held.sha, bundleId: held.bundleId, extent: { kind: "document" }, kind: "published", date: d,
      method: `legistar-reader: Event${which === "agenda" ? "Agenda" : "Minutes"}LastPublishedUTC, the last publication, an upper bound`,
      by: MACHINE, sourceRow: row.source, upperBound: true }).dated_fact;
    let pub;
    if (!p) {
      pub = newEvent(k, "publication", "EventScheduled");
      const aid = rowAttestation(k, pub, held, row, pf);
      within(k, pub, eventId, aid);
    } else {
      pub = k.resolve(p.target_id);
      const aid = rowAttestation(k, pub, held, row, pf);
      if (first !== seen) k.rows(`INSERT INTO event_choices (event_id, attestation_id, reason, by_actor, at) VALUES (?,?,?,?,?)`,
                                 pub, aid, "an earlier publication value was observed", MACHINE, k.now());
    }
    k.setWhen(pub);
    keepSource(k, key, "event", pub, { first, last: v }, held.sha);
  }
}

function item(k, held, row, f, out) {
  const m = Number.isInteger(f.EventId) ? source(k, `legistar:event:${f.EventId}`) : null;
  const meetingId = m ? k.resolve(m.target_id) : null;
  if (!meetingId) { out.unresolved.push({ row: row.source, key: row.key, why: "its meeting is not held: import the meeting first" }); return; }
  const prior = source(k, row.key);
  let eventId = prior ? k.resolve(prior.target_id) : null;
  const facts = { passed: f.passed ?? null, action: f.action ?? null };
  if (!eventId) {
    eventId = newEvent(k, "vote", "EventScheduled");
    out.written.push({ key: row.key, event_id: eventId });
  } else if (JSON.stringify(JSON.parse(prior.facts)) !== JSON.stringify(facts)) {
    change(k, eventId, { key: row.key, was: JSON.parse(prior.facts), now: facts });
    out.updated.push({ key: row.key, event_id: eventId });
  } else out.unchanged++;
  const aid = rowAttestation(k, eventId, held, row);
  within(k, eventId, meetingId, aid);
  for (const role of ["mover", "seconder"]) {
    const who = f[role];
    if (!who) continue;
    const ent = Number.isInteger(who.PersonId) ? personOf(k, who.PersonId) : null;
    if (!ent) { out.unresolved.push({ row: row.source, key: row.key, role, source_row: who, why: "the source names no PersonId that resolves to a registered entity" }); continue; }
    participant(k, eventId, ent, role, aid);
  }
  k.setWhen(eventId);
  keepSource(k, row.key, "event", eventId, facts, held.sha);
}

function vote(k, held, row, f, out) {
  const it = Number.isInteger(f.EventItemId) ? source(k, `legistar:event_item:${f.EventItemId}`) : null;
  const eventId = it ? k.resolve(it.target_id) : null;
  if (!eventId) { out.unresolved.push({ row: row.source, key: row.key, why: "its item is not held: import the items first" }); return; }
  const ent = Number.isInteger(f.PersonId) ? personOf(k, f.PersonId) : null;
  if (!ent) { out.unresolved.push({ row: row.source, key: row.key, source_row: { PersonId: f.PersonId ?? null }, why: "its PersonId resolves to no registered entity" }); return; }
  const bad = k.voteRefusal(f.value);
  if (bad) { out.unresolved.push({ row: row.source, key: row.key, why: bad.detail, refusal: bad.reason }); return; }
  const aid = rowAttestation(k, eventId, held, row);
  const p = participant(k, eventId, ent, "voted", aid, String(f.value).trim());
  if (p.added) out.written.push({ key: row.key, event_id: eventId, participant_id: p.id }); else out.unchanged++;
  keepSource(k, row.key, "participant", String(p.id), { value: f.value }, held.sha);
}

/* ---- R38: a followed proceeding's register ---- */

const COURT_TYPES = ["courtlistener_docket", "cpuc_proceeding", "ecourt_roa"];
const US_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const LONG_DATE = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),\s*(\d{4})$/;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/* A register's date as written (`MM/DD/YYYY`, `Mon D, YYYY` or `YYYY-MM-DD`) as a day, or the text as given. */
function dayAsWritten(raw) {
  const us = US_DATE.exec(raw);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  const lg = LONG_DATE.exec(raw);
  const m = lg ? MONTHS.indexOf(lg[1].toLowerCase()) : -1;
  if (m >= 0) return `${lg[3]}-${String(m + 1).padStart(2, "0")}-${lg[2].padStart(2, "0")}`;
  return raw.slice(0, 10);
}
/* What the entry says it is: an order when its stated kind, or its own opening words, say order; else a filing. */
const kindOf = (row) => (/order/i.test(String(row.kind_as_written ?? "")) || /^\s*(?:minute\s+)?order\b/i.test(String(row.text ?? ""))
  ? "order" : "filing");

/** R38: register rows with a source-assigned entry id, as `filing` or `order` events of a proceeding a member follows. */
export function followedRegister(k, { captureSha, proceeding, by = MACHINE } = {}) {
  if (!said(proceeding)) return noEntity("following a register names the proceeding a member follows, by its entity id");
  if (!k.entities || !k.entities.has(proceeding)) return noSuchEntity(proceeding);
  if (!said(captureSha)) return noSha("a register import reads one captured register, named by its capture sha256");
  const held = k.heldCapture(captureSha, null);
  if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture");
  const reading = readingOf(k, held.sha);
  if (!reading || !COURT_TYPES.includes(reading.content_type)) return refuse("NOT_A_REGISTER", "the capture is not a register court-doctypes read");
  const rows = reading.facts && Array.isArray(reading.facts.rows) ? reading.facts.rows : [];
  const out = { written: [], unchanged: 0, skipped: [] };
  const res = k.tx(() => {
    rows.forEach((row, i) => {
      if (row.entry_id == null || row.entry_id === "") { out.skipped.push({ row: i, why: "the register assigns this entry no id" }); return; }
      const key = `register:${reading.content_type}:${proceeding}:${row.entry_id}`;
      const p = source(k, key);
      if (p) { out.unchanged++; return; }
      const kind = kindOf(row);
      const eventId = newEvent(k, kind, "EventScheduled");
      let fact = null;
      const d = readDate(dayAsWritten(typeof row.date === "string" ? row.date.trim() : ""), k.zone());
      if (!d.bad && k.zone()) fact = k.holdFact({ sha: held.sha, bundleId: held.bundleId, extent: { kind: "document" }, kind: "entered",
        date: d, method: `court-doctypes ${reading.content_type}: the entry's date as written`, by: MACHINE, sourceRow: i }).dated_fact;
      rowAttestation(k, eventId, held, { source: i }, fact);
      k.insert("event_concerns", { event_id: eventId, end_id: proceeding, by_actor: MACHINE, at: k.now() });
      k.setWhen(eventId);
      keepSource(k, key, "event", eventId, { entry_id: row.entry_id, date: row.date ?? null }, held.sha);
      out.written.push({ entry_id: row.entry_id, event_id: eventId, kind, ...(fact ? {} : { when_why: "the entry's date was not read as a day" }) });
    });
    return { ok: true };
  });
  if (res && res.ok === false) return res;
  return { ok: true, capture_sha: held.sha, proceeding, ...out };
}
