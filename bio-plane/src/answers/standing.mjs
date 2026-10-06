/* Standing questions (R15–R21; L5; K1481, K1500, K1502, K1503). A member keeps a question with the saved query the
 * assistant wrote and showed, a cadence and an end date. The scheduler's tick re-runs each due question's saved query
 * under its author's sight at that moment, with no model call (R17); a run finds something new only when its result
 * holds an id the previous run's did not, or an occurrence it reads changed state (R18). Only then may the AI half
 * answer, and only when every condition of R19 holds; it is built switched off (plan Rules (7)). A question, its runs
 * and its finds are seen by its author alone (R16), and it reads nothing outside the asking scope (R21).
 *
 * These are the `Answers` instance's methods' bodies (`self`); `index.mjs` binds them. */

import { localDay } from "../civil-time/index.mjs";
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { refusal } from "./checks.mjs";
import { checkAnswer } from "./check.mjs";
import { ReadLog } from "./readlog.mjs";

/** R15: the cadences. */
export const CADENCES = Object.freeze(["daily", "weekly", "monthly"]);
/** R17: the most questions one tick runs. */
export const STANDING_TICK_MAX = 50;
/** R20: the most entries one read answers. */
export const STANDING_ANSWERS_MAX = 200;
/** R20 (DEC-94): the label a standing answer carries. */
export const STANDING_LABEL = "machine work, from your standing question";
/** The copy's switch for the AI half (R19; off until the 150-question bar is met, plan Rules (7)). */
export const STANDING_AI_SETTING = "answers_standing_ai";
/** R17: the most ids a run reads of its saved query's answer. */
export const STANDING_IDS_MAX = 10000;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const json = (v) => (v === undefined ? null : JSON.stringify(v));
const parse = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/** The member a stamp names: `member:<id>` → `<id>`, bare `admin` → `admin`; anything else → null. */
export function memberOf(stamp) {
  if (stamp === "admin") return "admin";
  const m = /^member:([A-Za-z0-9._:-]{1,128})$/.exec(typeof stamp === "string" ? stamp : "");
  return m ? m[1] : null;
}
const stampOf = (member) => `member:${member}`;

/* Calendar arithmetic on local days (`YYYY-MM-DD`), the zone already applied. */
const dayNum = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86400000;
const dayStr = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
const isDay = (d) => typeof d === "string" && DAY.test(d) && dayStr(dayNum(d)) === d;
/** R17: the local day a question is next due, from the local day of its last run. A month with no such day takes its
 *  last day (the question is not skipped). */
export function nextDueDay(lastDay, cadence) {
  if (cadence === "daily") return dayStr(dayNum(lastDay) + 1);
  if (cadence === "weekly") return dayStr(dayNum(lastDay) + 7);
  const y = +lastDay.slice(0, 4), m = +lastDay.slice(5, 7), d = +lastDay.slice(8, 10);
  const ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return `${ny}-${String(nm).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

function today(self, now) {
  const z = self.zone() || "UTC";
  const d = localDay(String(now).replace(/\.\d+Z$/, "Z"), z);
  return typeof d === "string" ? d : now.slice(0, 10);
}

function questionAnswer(r) {
  return { id: r.stq_id, question: r.question, query: parse(r.form_json), cadence: r.cadence, ends: r.ends,
           created_at: r.created_at, ended: r.ended_at ? { at: r.ended_at, by: r.ended_by } : null,
           last_run_at: r.last_run_at, next_due: r.ended_at ? null : r.next_due };
}

/** R15: a member's standing question, by that member's own act. */
export function standingQuestionSet(self, { author = null, question = null, query = null, cadence = null, ends = null } = {}) {
  if (!memberOf(author) || isMachineIdentity(author))
    return refusal("MACHINE_CANNOT_AUTHOR", "a standing question is set only by a member's own act");
  const ql = self.dep("query");
  const asked = typeof query === "string" ? { q: query } : query && typeof query === "object" ? query : {};
  const saved = ql && typeof ql.savedForm === "function"
    ? ql.savedForm({ ...asked, zone: self.zone() }, self.relations()) : { ok: false, reason: "SAVED_QUERY_EMPTY", detail: "no query compiler is reachable" };
  if (!saved || saved.ok !== true) return saved;
  if (!CADENCES.includes(cadence)) return refusal("BAD_CADENCE", `the cadence is one of ${CADENCES.join(", ")}`);
  const now = self.now();
  if (!isDay(ends) || ends <= today(self, now)) return refusal("STANDING_NEEDS_END", "the end date is a date after today");
  return self.record.transact(() => {
    const a = self.record.allocId("STQ", now.slice(0, 4));
    if (!a || !a.id) return { ok: false, reason: "MINT_EXHAUSTED", detail: "no standing-question id could be allocated" };
    self.sql.exec(`INSERT INTO standing_questions (stq_id, author, question, form_json, cadence, ends, created_at, next_due)
                   VALUES (?,?,?,?,?,?,?,NULL)`, a.id, stampOf(memberOf(author)), String(question ?? ""), json(saved.form),
                  cadence, ends, now);
    return { ok: true, id: a.id, question: String(question ?? ""), query: saved.form, cadence, ends, created_at: now };
  });
}

/* R16: the author's own row, or null for any other viewer, an administrator included. */
function own(self, id, viewer) {
  const m = memberOf(viewer);
  if (!m || typeof id !== "string") return null;
  const r = self.one(`SELECT * FROM standing_questions WHERE stq_id=?`, id);
  return r && memberOf(r.author) === m ? r : null;
}

const noSuch = (id) => refusal("NO_SUCH_STANDING_QUESTION", "no standing question of yours answers to that", { id: id ?? null });

/** R16: one of the viewer's own questions; any other viewer is answered as for none. */
export function standingQuestionRead(self, { id = null, viewer = null } = {}) {
  const r = own(self, id, viewer);
  if (!r) return noSuch(id);
  passEnd(self, r, self.now());
  return { ok: true, question: questionAnswer(own(self, id, viewer)) };
}

/** R16: the viewer's own questions. */
export function standingQuestionsOf(self, { viewer = null } = {}) {
  const m = memberOf(viewer);
  if (!m) return { ok: true, questions: [] };
  const rows = self.rows(`SELECT * FROM standing_questions WHERE author=? ORDER BY stq_id`, stampOf(m));
  return { ok: true, questions: rows.map(questionAnswer) };
}

/** R16: the author ends their own question, at any time. */
export function standingQuestionEnd(self, { id = null, author = null } = {}) {
  const r = own(self, id, author);
  if (!r) return noSuch(id);
  if (r.ended_at) return { ok: true, id, already: true, ended: { at: r.ended_at, by: r.ended_by } };
  const at = self.now();
  self.sql.exec(`UPDATE standing_questions SET ended_at=?, ended_by=? WHERE stq_id=?`, at, r.author, id);
  return { ok: true, id, ended: { at, by: r.author } };
}

/* R16: a question past its end date ends itself. */
function passEnd(self, r, now) {
  if (r.ended_at) return true;
  if (today(self, now) > r.ends) {
    self.sql.exec(`UPDATE standing_questions SET ended_at=?, ended_by='ends' WHERE stq_id=? AND ended_at IS NULL`, now, r.stq_id);
    return true;
  }
  return false;
}

function dueRows(self, now) {
  const d = today(self, now);
  return self.rows(`SELECT * FROM standing_questions WHERE ended_at IS NULL AND (next_due IS NULL OR next_due <= ?)
                    ORDER BY COALESCE(next_due, substr(created_at, 1, 10)), created_at, stq_id`, d)
    .filter((r) => d <= r.ends);
}

/** R17: how many questions are due at `now`. */
export function standingDue(self, now) { return dueRows(self, now).length; }

/** R17: when the next question falls due: `now` when one is due, else the first instant of the earliest next due day,
 *  or null when no question will run again. */
export function standingWake(self, now) {
  if (standingDue(self, now) > 0) return now;
  const d = today(self, now);
  const r = self.one(`SELECT MIN(next_due) AS d FROM standing_questions WHERE ended_at IS NULL AND next_due > ? AND next_due <= ends`, d);
  if (!r || !r.d) return null;
  const z = self.zone() || "UTC";
  const range = self.dayStart(r.d, z);
  return range || `${r.d}T00:00:00Z`;
}

/* R18: the occurrences a run reads: those of each duty its result names. */
async function occurrenceStates(self, ids, author, now) {
  const duties = self.dep("duties");
  const out = {};
  if (!duties || typeof duties.occurrencesOf !== "function") return out;
  for (const id of ids.filter((x) => /^DUT-\d{4}-/.test(x))) {
    let r;
    try { r = await duties.occurrencesOf({ dutyId: id, asOf: now.replace(/\.\d+Z$/, "Z"), viewer: author }); } catch { r = null; }
    for (const o of (r && r.occurrences) || []) if (o && o.key) out[`${id}/${o.key}`] = o.state ?? null;
  }
  return out;
}

/* R19: what holds the AI half back, or null when every condition holds. */
async function heldBack(self, author, at) {
  if (self.record.getSetting(STANDING_AI_SETTING) !== true) return { condition: "switch_off", switch: "copy" };
  const creds = self.dep("credentials");
  let acct = null;
  try { acct = creds ? creds.accountReferenceState({ member: author, viewer: author }) : null; } catch { acct = null; }
  if (!acct || acct.ok === false || !acct.held) return { condition: "no_account" };
  if (!acct.standing) return { condition: "switch_off", switch: "member" };
  const ceiling = self.dep("ceilingRefusal");
  let refused = null;
  try { refused = typeof ceiling === "function" ? await ceiling(memberOf(author), at) : null; } catch { refused = null; }
  if (refused && refused.ok === false)
    return { condition: "ceiling", code: refused.code || refused.reason, translation: refused.translation ?? null };
  if (!self.answerer) return { condition: "not_deployed" };
  return null;
}

/* One run of one question (R17–R19). */
async function runOne(self, r, now) {
  const retrieval = self.dep("retrieval");
  const form = parse(r.form_json);
  let res = null;
  try { res = retrieval ? retrieval.runSaved({ form, owner: r.author, viewer: r.author, limit: STANDING_IDS_MAX }) : null; }
  catch { res = null; }
  const day = today(self, now);
  const next = nextDueDay(day, r.cadence);
  if (!res || res.ok !== true) {
    /* the run could not read its query: it ran, found nothing, and says why */
    self.record.transact(() => {
      self.sql.exec(`UPDATE standing_questions SET last_run_at=?, next_due=? WHERE stq_id=?`, now, next, r.stq_id);
      self.sql.exec(`INSERT INTO standing_runs (stq_id, author, at, new_found, held_back_json) VALUES (?,?,?,0,?)`,
                    r.stq_id, r.author, now, json({ condition: "query_refused", reason: res ? res.reason ?? null : "no retrieval" }));
      return { ok: true };
    });
    return { id: r.stq_id, ran: true, new_found: false };
  }
  const ids = res.ids || [];
  const occ = await occurrenceStates(self, ids, r.author, now);
  const first = r.last_run_at === null;
  const prevIds = new Set(parse(r.last_ids_json) || []);
  const prevOcc = parse(r.last_occ_json) || {};
  const newIds = first ? [] : ids.filter((x) => !prevIds.has(x));
  const changed = first ? [] : Object.entries(occ).filter(([k, s]) => k in prevOcc && prevOcc[k] !== s)
    .map(([k, s]) => ({ occurrence: k, from: prevOcc[k], to: s }));
  const found = newIds.length > 0 || changed.length > 0;
  const finds = found ? { ids: newIds, occurrences: changed } : null;
  let answer = null, withheld = null, held = null;
  if (found) {
    held = await heldBack(self, r.author, now);
    if (!held) {
      const log = new ReadLog({ grant: `standing:${r.stq_id}:${now}`, viewer: r.author, at: now });
      self.holdLog(log);
      try {
        const given = await self.answerer.fn({ id: r.stq_id, question: r.question, query: form, finds, author: r.author,
                                               grant: log.grant, mode: "ask" });
        const checked = checkAnswer(given, { readLog: log, viewer: r.author });
        if (checked.ok) { answer = checked.answer; withheld = checked.withheld; }
        else { held = { condition: "answer_refused", code: checked.code }; }
        self.countAsk({ outcome: checked.ok ? "answered" : "refused",
                        codes: checked.ok ? checked.withheld.map((w) => w.code) : [checked.code], mode: "standing", at: now });
      } catch (e) {
        held = { condition: "answerer_failed", reason: String(e && e.message || e).slice(0, 200) };
      } finally { self.dropLog(log.grant); }
    }
  }
  self.record.transact(() => {
    self.sql.exec(`UPDATE standing_questions SET last_run_at=?, next_due=?, last_ids_json=?, last_occ_json=?, last_digest=?
                   WHERE stq_id=?`, now, next, json(ids), json(occ), res.digest ?? null, r.stq_id);
    if (found) self.sql.exec(`INSERT INTO standing_runs (stq_id, author, at, new_found, finds_json, answer_json, withheld_json, held_back_json)
                              VALUES (?,?,?,1,?,?,?,?)`, r.stq_id, r.author, now, json(finds), json(answer), json(withheld), json(held));
    else self.sql.exec(`INSERT INTO standing_runs (stq_id, author, at, new_found) VALUES (?,?,?,0)`, r.stq_id, r.author, now);
    return { ok: true };
  });
  return { id: r.stq_id, ran: true, new_found: found, ...(found ? { held_back: held } : {}) };
}

/** R17: runs each due question's saved query, at most 50, oldest due first. */
export async function standingTick(self, now) {
  const at = typeof now === "string" ? now : self.now();
  const all = self.rows(`SELECT * FROM standing_questions WHERE ended_at IS NULL`);
  for (const r of all) passEnd(self, r, at);
  const due = dueRows(self, at);
  const ran = [];
  for (const r of due.slice(0, STANDING_TICK_MAX)) ran.push(await runOne(self, r, at));
  return { at, ran, remaining: Math.max(0, due.length - STANDING_TICK_MAX) };
}

/** R20: the runs of a member's own questions that found something new, each told once, in run order after `after`. */
export function standingAnswersFor(self, { member = null, after = null, limit = null } = {}) {
  const m = memberOf(member) ?? (typeof member === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(member) ? member : null);
  if (!m) return { ok: true, entries: [], cursor: null };
  const n = Number(limit);
  const cap = Number.isInteger(n) && n > 0 ? Math.min(n, STANDING_ANSWERS_MAX) : STANDING_ANSWERS_MAX;
  const from = Number.isInteger(Number(after)) ? Number(after) : 0;
  const rows = self.rows(`SELECT r.*, q.question FROM standing_runs r JOIN standing_questions q ON q.stq_id = r.stq_id
                          WHERE r.author=? AND r.new_found=1 AND r.seq > ? ORDER BY r.seq LIMIT ?`, stampOf(m), from, cap + 1);
  const page = rows.slice(0, cap);
  return { ok: true,
           entries: page.map((x) => ({ question: { id: x.stq_id, question: x.question }, run: x.seq, at: x.at,
                                       finds: parse(x.finds_json), answer: parse(x.answer_json),
                                       withheld: parse(x.withheld_json) || [], held_back: parse(x.held_back_json),
                                       label: STANDING_LABEL })),
           cursor: rows.length > cap ? page[page.length - 1].seq : null };
}
