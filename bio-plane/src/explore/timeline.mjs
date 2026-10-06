// @ts-check
/* explore: the timeline over a set (R13). It composes `events.timeline` over the set a caller passes with the payers
   and payees of the money facts concerning those events (`money`), each item cited, in `events`' order, the lanes
   "what they did" (`world`) and "what we did" (`ours`) kept apart exactly as `events` answers them. It reads no project or inquiry; the
   caller resolves the set (R-3 I-6). */
import { refuse, isObj, isRefusal, viewerRefusal } from './answer.mjs';

const EVENT_ID = /^EVT-/;

/** The event ids of the world's lane, in `events`' order (`events` R28, R29: `world.items`, then those placed nowhere). */
function eventIdsOf(lane) {
  const items = isObj(lane) ? [...(Array.isArray(lane.items) ? lane.items : []), ...(Array.isArray(lane.placed_nowhere) ? lane.placed_nowhere : [])] : [];
  const ids = [];
  for (const it of items) {
    const id = isObj(it) ? it.event_id : null;
    if (typeof id === 'string' && EVENT_ID.test(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * timelineOver({set, from?, to?, viewer}).
 * @param {{events?: any, money?: any}} ctx @param {any} arg
 */
export function timelineOver(ctx, arg) {
  const a = isObj(arg) ? arg : {};
  const v = viewerRefusal(a.viewer);
  if (v) return v;
  if (!Array.isArray(a.set) || a.set.length === 0) return refuse('NO_SET', 'a timeline is over a set of record ids the caller names');
  const events = typeof ctx.events === 'function' ? ctx.events() : ctx.events;
  const money = typeof ctx.money === 'function' ? ctx.money() : ctx.money;
  if (!events || typeof events.timeline !== 'function') return refuse('NOT_AVAILABLE', 'events is not wired into this instance, so no timeline can be read');
  const t = events.timeline({ set: a.set, from: a.from ?? null, to: a.to ?? null, viewer: a.viewer });
  if (isRefusal(t) || (isObj(t) && t.ok === false)) return t;
  const out = [];
  const wired = !!money && typeof money.moneyOf === 'function';
  if (wired) {
    for (const event of eventIdsOf(t.world)) {
      const m = money.moneyOf({ entity: event, viewer: a.viewer });
      if (isRefusal(m) || (isObj(m) && m.ok === false)) { out.push({ event, refused: m.refused ?? m.reason, why: m.why ?? m.detail }); continue; }
      const facts = [...(Array.isArray(m.facts) ? m.facts : []), ...(Array.isArray(m.undetermined) ? m.undetermined : [])];
      if (!facts.length) continue;
      out.push({ event, facts: facts.map((f) => ({ fact_id: f.fact_id, payer: f.from, payee: f.to, kind: f.kind, phase: f.phase,
        ...(f.stage ? { stage: f.stage } : {}), source: f.source, citation: f.citation, grade: f.grade })), ...(m.truncated ? { truncated: true } : {}) });
    }
  }
  return { ok: true, set: a.set, timeline: t, money: out, ...(wired ? {} : { money_note: 'money is not wired into this instance, so no payer or payee is shown' }) };
}
