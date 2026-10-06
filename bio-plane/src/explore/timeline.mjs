// @ts-check
/* explore: the timeline over a set (R13). It composes `events.timeline` over the set a caller passes with the payers
   and payees of the money facts concerning those events (`money`), each item cited, in `events`' order, the lanes
   "what they did" and "what we did" kept apart exactly as `events` answers them. It reads no project or inquiry; the
   caller resolves the set (R-3 I-6). */
import { refuse, isObj, isRefusal, viewerRefusal } from './answer.mjs';

const EVENT_ID = /^EVT-/;

/** The event ids of the world's lane, in `events`' order. @param {any} lane */
function eventIdsOf(lane) {
  const items = Array.isArray(lane) ? lane : isObj(lane) && Array.isArray(lane.items) ? lane.items : [];
  const ids = [];
  for (const it of items) {
    const id = isObj(it) ? it.event_id ?? it.event ?? it.id : null;
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
  if (!ctx.events || typeof ctx.events.timeline !== 'function') return refuse('NOT_AVAILABLE', 'events is not wired into this instance, so no timeline can be read');
  const t = ctx.events.timeline({ set: a.set, from: a.from, to: a.to, viewer: a.viewer });
  if (isRefusal(t) || (isObj(t) && t.ok === false)) return t;
  const world = isObj(t) ? t.what_they_did ?? t.lanes?.what_they_did : null;
  const money = [];
  if (ctx.money && typeof ctx.money.moneyOf === 'function') {
    for (const event of eventIdsOf(world)) {
      const m = ctx.money.moneyOf({ entity: event, viewer: a.viewer });
      if (isRefusal(m) || (isObj(m) && m.ok === false)) { money.push({ event, refused: m.refused ?? m.reason, why: m.why ?? m.detail }); continue; }
      const facts = isObj(m) && Array.isArray(m.facts) ? m.facts : Array.isArray(m) ? m : [];
      if (!facts.length) continue;
      money.push({ event, facts: facts.map((f) => ({ fact_id: f.fact_id, payer: f.from, payee: f.to, kind: f.kind, phase: f.phase, stage: f.stage, source: f.source, grade: f.grade })),
        ...(isObj(m) && m.truncated ? { truncated: true } : {}) });
    }
  }
  return { ok: true, set: a.set, timeline: t, money, ...(ctx.money && typeof ctx.money.moneyOf === 'function' ? {} : { money_note: 'money is not wired into this instance, so no payer or payee is shown' }) };
}
