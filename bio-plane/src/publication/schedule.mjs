/* publication — publishing at a set time (requirements: `build/requirements/publication.md` R66–R71, R21's waiting
 * clause; DEC-147, Bob's "S1: B"; K1784, K1785, K1790, K1811, K1816). The case ceremony (`ratification`, `op=publishat`)
 * signs and, in place of R22's commit, sets the edition to wait (R66): its signature is held here beside the document,
 * never on it, so until it is published the document answers as an unsigned preparation and nothing of the edition is
 * public (R29). At its time the one publisher `ratification` registers (R67) runs every signing check again and commits
 * through R22 only when nothing has changed; otherwise the edition stops, once, and publishing it needs a new signing.
 * An owner of the case's project may move or cancel the time until it comes (R68). R69 lists them; R71 tells
 * `scheduler` the next wake after each act, so a waiting edition is taken on an idle instance.
 *
 * The table is `scheduled_editions` (`./schema.mjs`): one row per setting, its `seq` the order made; at most one row of a
 * case edition is `waiting` at a time (R66's PUBLISH_AT_ALREADY_SET). Each function takes the module's instance `p`
 * (its `sql`, `record`, `membership`, clock and the R1 standing test) and is called through its method of the same name. */

import { bounds, isCalendarDate } from "../civil-time/index.mjs";
import { combine as combineProfiles } from "../../../jurisdictions/index.mjs";
import { viewerPredicate } from "../membership/index.mjs";

/** R69: the page of `scheduledEditions`, its default and its ceiling. */
export const SCHEDULED_EDITIONS_MAX = 500;
/** R67, R69: the states a scheduled edition passes through; only `waiting` changes, and only once. */
export const SCHEDULE_STATES = Object.freeze(["waiting", "published", "stopped", "cancelled"]);
/** R67: the reason a waiting edition is stopped when no publisher could check it: never published unchecked. */
export const SCHEDULED_CHECK_UNAVAILABLE = Object.freeze({
  code: "SCHEDULED_CHECK_UNAVAILABLE",
  translation: "This edition was not published at its set time, because the checks it needed then could not be run. "
    + "Nothing was published. Sign it again to publish it.",
});

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
const safeJson = (s, d) => { try { return s == null ? d : JSON.parse(s); } catch { return d; } };
const rows = (p, q, ...a) => [...p.sql.exec(q, ...a)];
const one = (p, q, ...a) => { for (const r of p.sql.exec(q, ...a)) return r; return null; };
const ms = (t) => { const n = Date.parse(String(t ?? "")); return Number.isFinite(n) ? n : NaN; };
const clock = (p) => { const w = p.now(); return typeof w === "string" && w ? w : new Date().toISOString(); };

/** R66: the group's time zone, the active profiles' `time_zone` (`jurisdictions` R41) through `jurisdictions.combine`
 *  over record-core's `jurisdiction_profiles` setting, or null when none is held (never UTC by default). */
export function groupZone(p) {
  try {
    const list = typeof p.record.getSetting === "function" ? p.record.getSetting("jurisdiction_profiles") : null;
    const r = combineProfiles(Array.isArray(list) ? list : []);
    const z = r && r.ok && r.view && r.view.time_zone ? r.view.time_zone.value : null;
    return str(z) || null;
  } catch { return null; }
}

/* R66's refusals of `at`, in order, each a refusal or `{at, publish_at}`: the date and time as set with the zone, and
   the instant the minute begins in it (`civil-time.bounds`, its `earliest`). */
function resolveAt(p, at) {
  const date = at && typeof at === "object" ? at.date : null, time = at && typeof at === "object" ? at.time : null;
  if (typeof date !== "string" || !isCalendarDate(date) || typeof time !== "string" || !HHMM.test(time))
    return { ok: false, reason: "PUBLISH_AT_MALFORMED",
             detail: "a publishing time is a date (YYYY-MM-DD, a real day) and a 24-hour time (HH:MM, 00:00 to 23:59)" };
  const zone = groupZone(p);
  if (!zone)
    return { ok: false, reason: "PUBLISH_AT_NO_ZONE",
             detail: "the group holds no time zone, so a local time cannot be read; it is never read as UTC" };
  let b = null;
  try { b = bounds({ value: `${date}T${time}`, precision: "minute", zone }); } catch { b = null; }
  if (!b || !b.earliest)
    return { ok: false, reason: "PUBLISH_AT_NO_ZONE", detail: `the group's time zone (${zone}) cannot be read` };
  if (!(ms(b.earliest) > ms(clock(p))))
    return { ok: false, reason: "PUBLISH_AT_PAST", at: { date, time, zone }, publish_at: b.earliest,
             detail: "that time is not after now; publishing now is the ceremony's own commit" };
  return { ok: true, at: { date, time, zone }, publish_at: b.earliest };
}

/* R69's entry for one row. */
function entryOf(p, r) {
  const project = projectOf(p, r.case_id, r.edition);
  return { case: r.case_id, edition: Number(r.edition), project, state: r.state, signer: r.signer ?? null,
           set_by: r.set_by ?? null, signed_at: r.signed_at, at: { date: r.at_date, time: r.at_time, zone: r.zone },
           publish_at: r.publish_at, moves: safeJson(r.moves, []), outcome_at: r.outcome_at ?? null,
           reasons: r.state === "stopped" ? safeJson(r.reasons, []) : null };
}

/* The case's owning project: the `cases` row, else the document's own `case_project`. */
function projectOf(p, caseId, edition) {
  const k = one(p, `SELECT project_id FROM cases WHERE case_id=?`, caseId);
  if (k && k.project_id) return k.project_id;
  const d = one(p, `SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, Number(edition));
  const m = d ? /^case_project:\s*(.+)$/m.exec(d.text) : null;
  const v = m ? m[1].trim().replace(/^"(.*)"$/, "$1") : "";
  return v && v !== "null" ? v : null;
}

/* The one row of a case edition that waits, or null. */
const waitingRow = (p, caseId, edition) => one(p,
  `SELECT * FROM scheduled_editions WHERE case_id=? AND edition=? AND state='waiting' ORDER BY seq DESC LIMIT 1`,
  caseId, Number(edition));

/** R21: whether a case edition's document waits (R66), and so counts as signed for R21's writes. */
export const isWaiting = (p, caseId, edition) => !!waitingRow(p, str(caseId), edition);

/** R66: set a signed case edition to wait for its time, inside the caller's transaction. */
export function scheduleEdition(p, { case: caseArg = null, caseId = null, edition = null, docSha = null, signature = null,
                                     signer = null, deliveredBy = null, at = null, checked = null, by = null } = {}) {
  const id = str(caseArg ?? caseId), ed = Number(edition);
  if (!id || !Number.isInteger(ed) || ed < 1 || !str(docSha) || !str(signature))
    return { ok: false, reason: "MALFORMED",
             detail: "a waiting edition names its case, a positive edition, the document's sha and the signature" };
  const when = resolveAt(p, at);
  if (!when.ok) return when;
  const doc = one(p, `SELECT doc_sha, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, id, ed);
  if (!doc || (!doc.sig_armored && doc.doc_sha !== str(docSha)))
    return { ok: false, reason: "NO_CASE_DOCUMENT", caseId: id, edition: ed,
             detail: `no unsigned case document of ${id} edition ${ed} is held at that sha` };
  if (doc.sig_armored)
    return { ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED", caseId: id, edition: ed,
             detail: `case ${id} edition ${ed} is already signed and published, and a signed edition answers forever` };
  const held = waitingRow(p, id, ed);
  if (held) {
    if (held.doc_sha === str(docSha) && held.sig_armored === str(signature) && held.at_date === when.at.date
        && held.at_time === when.at.time)
      return { ok: true, existed: true, case: id, edition: ed, state: "waiting", at: entryOf(p, held).at,
               publish_at: held.publish_at };
    return { ok: false, reason: "PUBLISH_AT_ALREADY_SET", caseId: id, edition: ed, waiting: entryOf(p, held),
             detail: `case ${id} edition ${ed} already waits to be published; move or cancel that time` };
  }
  const now = clock(p);
  p.sql.exec(
    `INSERT INTO scheduled_editions (case_id,edition,doc_sha,sig_armored,signer,delivered_by,signed_at,at_date,at_time,
       zone,publish_at,set_by,state,checked,moves) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'waiting',?,'[]')`,
    id, ed, str(docSha), str(signature), signer ?? null, deliveredBy ?? null, now, when.at.date, when.at.time,
    when.at.zone, when.publish_at, by ?? null, checked === undefined ? null : JSON.stringify(checked));
  /* R71: the caller's transaction is still open here, so the notice follows it, reading the wake as it then stands. */
  queueMicrotask(() => tell(p));
  return { ok: true, case: id, edition: ed, state: "waiting", at: when.at, publish_at: when.publish_at };
}

/** R67: the earliest `publish_at` of a waiting edition, or null. */
export function publishWake(p) {
  const r = one(p, `SELECT publish_at FROM scheduled_editions WHERE state='waiting' ORDER BY publish_at, seq LIMIT 1`);
  return r ? r.publish_at : null;
}

/* R67: the editions a `publishDue` is taking now, per instance, so an alarm overlapping an earlier one awaiting its
   publisher never takes the same edition twice. */
const TAKING = new WeakMap();

/** R67 (K1832): take each waiting edition whose time has come, in `publish_at` order, and hand it to the registered
 *  publisher, awaiting each answer (it may be a Promise) before taking the next. Answers a Promise of `{ok, taken}`. */
export async function publishDue(p, now) {
  const at = str(now) || clock(p);
  if (!TAKING.has(p)) TAKING.set(p, new Set());
  const busy = TAKING.get(p);
  const due = rows(p, `SELECT * FROM scheduled_editions WHERE state='waiting' ORDER BY publish_at, seq`)
    .filter((r) => ms(r.publish_at) <= ms(at) && !busy.has(r.seq));
  const taken = [];
  for (const r of due) {
    /* settled by another take meanwhile, or being taken: never handed twice */
    if (busy.has(r.seq) || !one(p, `SELECT 1 AS w FROM scheduled_editions WHERE seq=? AND state='waiting'`, r.seq)) continue;
    busy.add(r.seq);
    try { taken.push(await takeOne(p, r, at)); } finally { busy.delete(r.seq); }
  }
  return { ok: true, taken };
}

/* R67: one due edition, handed with the entry R66 recorded (its held signature included) and settled once. */
async function takeOne(p, r, at) {
  const entry = { ...entryOf(p, r), doc_sha: r.doc_sha, signature: r.sig_armored, delivered_by: r.delivered_by ?? null,
                  checked: safeJson(r.checked, null) };
  let answer = null;
  const pub = p.scheduledPublisher();
  if (pub) { try { answer = await pub.publishScheduled(entry, at); } catch { answer = null; } }
  /* Settled once: a row no longer waiting (a cancel cannot reach a due one; this is defence) is answered as it is. */
  const now = one(p, `SELECT state FROM scheduled_editions WHERE seq=?`, r.seq);
  if (!now || now.state !== "waiting") return { case: r.case_id, edition: Number(r.edition), state: now ? now.state : null };
  /* What the store holds decides: published only when the document is signed at the waiting bytes (R22's commit). */
  const signed = one(p, `SELECT ratified_at FROM case_documents WHERE case_id=? AND edition=? AND doc_sha=?
                          AND sig_armored IS NOT NULL`, r.case_id, Number(r.edition), r.doc_sha);
  const stops = answer && Array.isArray(answer.stopped) && answer.stopped.length
    ? answer.stopped.map((s) => ({ code: String(s && s.code || ""), translation: String(s && s.translation || ""),
                                   ...(s && s.check ? { check: String(s.check) } : {}),
                                   ...(s && s.cause ? { cause: s.cause } : {}) }))
    : [{ ...SCHEDULED_CHECK_UNAVAILABLE }];
  const state = signed ? "published" : "stopped";
  p.record.transact(() => p.sql.exec(
    `UPDATE scheduled_editions SET state=?, outcome_at=?, reasons=? WHERE seq=? AND state='waiting'`,
    state, signed ? signed.ratified_at : at, signed ? null : JSON.stringify(stops), r.seq));
  tell(p);
  return { case: r.case_id, edition: Number(r.edition), state,
           ...(signed ? { published_at: signed.ratified_at } : { reasons: stops }) };
}

/* R68: the common fence of a move and a cancel, in R68's order; the waiting row, or a refusal. */
function ownersRow(p, caseId, edition, by) {
  /* A machine credential, or no stamp at all; the founder is no machine, and owns no project (NOT_A_CASE_OWNER). */
  const g = viewerPredicate(by);
  if (g.scope === "DENY" || (g.scope === "member" && g.member === null && by !== "admin"))
    return { ok: false, reason: "MACHINE_CANNOT_SCHEDULE_PUBLISH",
             detail: "a publishing time is moved or cancelled by a member who owns the case's project, never a machine" };
  const notWaiting = { ok: false, reason: "NOT_WAITING", detail: "no edition of that case waits to be published" };
  const doc = one(p, `SELECT case_id, edition, text FROM case_documents WHERE case_id=? AND edition=?`, caseId, Number(edition));
  if (!doc || !p.hasCaseStanding(doc, by)) return notWaiting;
  const last = one(p, `SELECT * FROM scheduled_editions WHERE case_id=? AND edition=? ORDER BY seq DESC LIMIT 1`,
                   caseId, Number(edition));
  if (!last) return notWaiting;
  if (last.state !== "waiting")
    return { ...notWaiting, state: last.state, detail: `that edition no longer waits: it is ${last.state}` };
  if (ms(last.publish_at) <= ms(clock(p)))
    return { ...notWaiting, state: "waiting", detail: "that edition's time has come, so it is being published or stopped" };
  const project = projectOf(p, caseId, edition);
  if (!project || g.scope !== "participant" || !p.membership.isProjectOwner(project, g.member))
    return { ok: false, reason: "NOT_A_CASE_OWNER", detail: "only an owner of the case's project moves or cancels its time" };
  return { ok: true, row: last, member: g.member };
}

/** R68: move a waiting edition's time, keeping each earlier time with who moved it and when. */
export function publishAtMove(p, { case: caseArg = null, caseId = null, edition = null, at = null, by = null } = {}) {
  const id = str(caseArg ?? caseId), ed = Number(edition);
  const out = p.record.transact(() => {
    const f = ownersRow(p, id, ed, by);
    if (!f.ok) return f;
    const when = resolveAt(p, at);
    if (!when.ok) return when;
    const moves = [...safeJson(f.row.moves, []), { at: { date: f.row.at_date, time: f.row.at_time, zone: f.row.zone },
                                                    publish_at: f.row.publish_at, moved_by: by, moved_at: clock(p) }];
    p.sql.exec(`UPDATE scheduled_editions SET at_date=?, at_time=?, zone=?, publish_at=?, moves=? WHERE seq=? AND state='waiting'`,
               when.at.date, when.at.time, when.at.zone, when.publish_at, JSON.stringify(moves), f.row.seq);
    return { ok: true, ...entryOf(p, one(p, `SELECT * FROM scheduled_editions WHERE seq=?`, f.row.seq)) };
  });
  if (out.ok) tell(p);
  return out;
}

/** R68: cancel a waiting edition: it is `cancelled`, its signature never committed, and its document again an unsigned
 *  preparation (R21). */
export function publishAtCancel(p, { case: caseArg = null, caseId = null, edition = null, by = null } = {}) {
  const id = str(caseArg ?? caseId), ed = Number(edition);
  const out = p.record.transact(() => {
    const f = ownersRow(p, id, ed, by);
    if (!f.ok) return f;
    p.sql.exec(`UPDATE scheduled_editions SET state='cancelled', cancelled_by=?, outcome_at=? WHERE seq=? AND state='waiting'`,
               by, clock(p), f.row.seq);
    return { ok: true, ...entryOf(p, one(p, `SELECT * FROM scheduled_editions WHERE seq=?`, f.row.seq)) };
  });
  if (out.ok) tell(p);
  return out;
}

/** R69: the scheduled editions in `publish_at` order after `after` (a cursor this read answered), at most `limit`. A
 *  viewer without R1's standing sees none of a case; with no `viewer` (read as the plane) every edition answers. */
export function scheduledEditions(p, { case: caseArg = null, caseId = null, state = null, after = null, limit = null,
                                       viewer = undefined } = {}) {
  const cap = Math.max(1, Math.min(Math.floor(Number(limit)) || SCHEDULED_EDITIONS_MAX, SCHEDULED_EDITIONS_MAX));
  const id = str(caseArg ?? caseId), st = str(state);
  if (st && !SCHEDULE_STATES.includes(st))
    return { ok: false, reason: "MALFORMED", detail: `a state is one of ${SCHEDULE_STATES.join(", ")}` };
  const [aAt, aSeq] = typeof after === "string" && after.includes("#")
    ? [after.slice(0, after.lastIndexOf("#")), Number(after.slice(after.lastIndexOf("#") + 1)) || 0] : ["", 0];
  const where = [`(publish_at > ? OR (publish_at = ? AND seq > ?))`], args = [aAt, aAt, aSeq];
  if (id) { where.push(`case_id=?`); args.push(id); }
  if (st) { where.push(`state=?`); args.push(st); }
  const plane = viewer === undefined || viewer === null;
  const seen = new Map();
  const sees = (r) => {
    if (plane) return true;
    const k = `${r.case_id}\u0000${r.edition}`;
    if (!seen.has(k)) {
      const doc = one(p, `SELECT case_id, edition, text FROM case_documents WHERE case_id=? AND edition=?`, r.case_id, r.edition);
      seen.set(k, !!doc && p.hasCaseStanding(doc, viewer));
    }
    return seen.get(k);
  };
  const out = [];
  let more = false;
  for (const r of rows(p, `SELECT * FROM scheduled_editions WHERE ${where.join(" AND ")} ORDER BY publish_at, seq`, ...args)) {
    if (!sees(r)) continue;
    if (out.length === cap) { more = true; break; }
    out.push(r);
  }
  const last = out[out.length - 1];
  return { ok: true, editions: out.map((r) => entryOf(p, r)), limit: cap,
           cursor: more && last ? `${last.publish_at}#${last.seq}` : null };
}

/** R70: the instant a published case edition was signed: the waiting edition's signing when it was published at a set
 *  time, else the commit's own instant. */
export function signedAtFor(p, caseId, edition, commitAt) {
  const r = one(p, `SELECT signed_at FROM scheduled_editions WHERE case_id=? AND edition=? AND state='waiting'
                     ORDER BY seq DESC LIMIT 1`, caseId, Number(edition));
  return r ? r.signed_at : commitAt;
}

/* R71: each registered listener once, with the wake as it stands; one that throws never undoes the act. */
function tell(p) {
  const wake = publishWake(p);
  for (const l of p.publishListeners()) { try { l.fn({ publishAt: wake }); } catch { /* the act stands (R71) */ } }
}
