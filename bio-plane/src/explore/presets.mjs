// @ts-check
/* explore: the presets (R10) and overlaps (R11). Each preset is the one walk (walk.mjs) over a kind set, never a
   walker of its own (R15). A preset's set is a rule over the registry, read on every call, so a kind an owner
   registers later joins the preset that names it with no change here. */
import { BOUNDS } from '../connection-grammar/index.mjs';
import { checkWalkArgs, walk, resolveKinds } from './walk.mjs';
import { kindsByOwner, makeReader } from './reader.mjs';
import { intersect, spanOfValidity, spanOfWindow } from './intervals.mjs';
import { refuse, isObj, viewerRefusal, nodeRefusal, dateRefusal, NOT_ASSERTED } from './answer.mjs';

/** The rules of each preset's kind set (R10): an owner's kinds named, or every kind of an owner (K1563 (8): duties' power kind). */
export const PRESET_RULES = Object.freeze({
  chain: Object.freeze({ words: 'organisation chains', rules: [
    { owner: 'lines', kinds: ['part_of', 'reports_to', 'oversees', 'appoints', 'funds'] },
    { owner: 'duties', kinds: ['holds_power'] },
  ] }),
  flowsFrom: Object.freeze({ words: 'money trails', rules: [{ owner: 'money' }] }),
  relationsOf: Object.freeze({ words: 'event links', rules: [
    { owner: 'events', kinds: ['authorises', 'answers', 'amends', 'reverses', 'stated_cause', 'within'] },
  ] }),
  pathBetween: Object.freeze({ words: 'the path between two records', rules: [{ every: true }] }),
  overlaps: Object.freeze({ words: 'overlaps', rules: [{ every: true }] }),
});

/** The kinds a preset names now, in registration order. @param {any} registry @param {string} name */
export function presetKinds(registry, name) {
  const p = /** @type {any} */ (PRESET_RULES)[name];
  const out = [];
  for (const o of registry.owners()) {
    for (const k of o.kinds) {
      const hit = p.rules.some((r) => r.every || (r.owner === o.owner && (r.kinds ? r.kinds.includes(k.kind) : true)));
      if (hit) out.push(k.kind);
    }
  }
  return out;
}

/** Each preset by name with its kind set as registered now (R10). @param {any} registry */
export function presets(registry) {
  return Object.keys(PRESET_RULES).map((name) => ({ name, words: /** @type {any} */ (PRESET_RULES)[name].words, kinds: presetKinds(registry, name) }));
}

/** The one walk over a preset's set. */
function presetWalk(ctx, name, a, extra = {}) {
  const kinds = presetKinds(ctx.registry, name);
  const c = checkWalkArgs(ctx.registry, { ...a, kinds });
  if (c.refusal) return c.refusal;
  const ans = walk(ctx, { ...a, ...extra, kinds: /** @type {string[]} */ (c.kinds), depth: /** @type {number} */ (c.depth), scope: null });
  return { preset: name, ...ans, ...(kinds.length ? {} : { preset_note: `no owner has registered a kind of ${name} yet` }) };
}

const argOf = (a) => (isObj(a) ? a : {});

/** chain({from, at, viewer}): organisation chains (R10). */
export const chain = (ctx, a) => { const x = argOf(a); return presetWalk(ctx, 'chain', { from: x.from, at: x.at, viewer: x.viewer }); };

/** flowsFrom({from, at, period?, viewer}): money trails from payer to payee, as of `period` when one is stated (R10). */
export const flowsFrom = (ctx, a) => {
  const x = argOf(a);
  const at = x.period !== undefined && x.period !== null ? x.period : x.at;
  return presetWalk(ctx, 'flowsFrom', { from: x.from, at, viewer: x.viewer }, { direction: 'out' });
};

/** relationsOf({event, at, viewer}): an event's links (R10). */
export const relationsOf = (ctx, a) => { const x = argOf(a); return presetWalk(ctx, 'relationsOf', { from: x.event, at: x.at, viewer: x.viewer }); };

/** pathBetween({from, to, at, depth?, viewer}): every registered kind, with `to` given (R10). */
export const pathBetween = (ctx, a) => {
  const x = argOf(a);
  const v = viewerRefusal(x.viewer);
  if (v) return v;
  if (x.to === undefined || x.to === null || x.to === '') return refuse('NO_NODE', 'no to is named: a path between two records names both');
  return presetWalk(ctx, 'pathBetween', { from: x.from, to: x.to, at: x.at, depth: x.depth, viewer: x.viewer });
};

/** The sentence every overlap carries (R11, R16). */
export const OVERLAP_SENTENCE = 'An overlap is a cited fact: both held a connection of this kind to the same record in the same span. It does not say the two are acquainted.';

/**
 * overlaps({a, b, at | period, kinds?, viewer}) (R11): each record both reach in one step of the same kind whose two
 * validities meet at `at` or within `period`, three-valued, with both steps, the shared span, and how many others
 * hold a step of that kind to that record in that span.
 */
export function overlaps(ctx, arg) {
  const a = argOf(arg);
  const r0 = viewerRefusal(a.viewer) || nodeRefusal(a.a, 'a', true) || nodeRefusal(a.b, 'b', true);
  if (r0) return r0;
  const window = a.at !== undefined && a.at !== null ? a.at : a.period;
  const rd = dateRefusal(window, a.at !== undefined && a.at !== null ? 'at' : 'at or period');
  if (rd) return rd;
  const k = resolveKinds(ctx.registry, a.kinds ?? presetKinds(ctx.registry, 'overlaps'));
  if (k.refusal) return k.refusal;
  const kinds = /** @type {string[]} */ (k.kinds);
  const byOwner = kindsByOwner(ctx.registry, kinds);
  const reader = makeReader(ctx, { at: window, viewer: a.viewer, scope: null });
  const win = spanOfWindow(window);

  /** Each one-step neighbour of a person: `kind|node` → hops. */
  const reach = (person) => {
    const m = new Map();
    for (const [owner, ks] of byOwner) {
      const items = reader.read(owner, person, ks);
      if (!items) continue;
      for (const h of items) {
        const other = h.from === person ? h.to : h.from;
        if (other === a.a || other === a.b) continue;
        const key = `${h.kind}\u0000${other}`;
        if (!m.has(key)) m.set(key, []);
        m.get(key).push(h);
      }
    }
    return m;
  };
  const ra = reach(a.a), rb = reach(a.b);
  const found = [];
  const keys = [...ra.keys()].filter((key) => rb.has(key)).sort();
  for (const key of keys) {
    if (reader.s.stop) break;
    const [kind, node] = key.split('\u0000');
    for (const ha of ra.get(key)) for (const hb of rb.get(key)) {
      const both = [spanOfValidity(ha.valid), spanOfValidity(hb.valid)];
      let x = intersect([...both, win]);
      if (x.holds === 'out') continue;
      const span = { start: x.from, end: x.to };
      const pair = intersect(both);
      if (x.holds === 'in' && (isObj(ha.undetermined) || isObj(hb.undetermined))) {
        x = { ...x, holds: 'undetermined', why: [ha, hb].filter((h) => isObj(h.undetermined)).map((h) => `${h.id}: ${h.undetermined.why}`).join('; ') };
      }
      // The shared span is the two steps' own; whether it holds is judged at the date or within the period.
      const intersection = { holds: x.holds, from: pair.from, to: pair.to, ...(x.why ? { why: x.why } : {}) };
      found.push({ node, kind, word: ctx.registry.kindOf(kind)?.word, hops: [ha, hb], intersection,
        others: sharedSet(ctx, reader, { kind, node, span, a: a.a, b: a.b }), sentence: OVERLAP_SENTENCE });
    }
  }
  const s = reader.s;
  return {
    ok: true, a: a.a, b: a.b, ...(a.at !== undefined && a.at !== null ? { at: a.at } : { period: a.period }), kinds, overlaps: found,
    hubs: s.hubs, fanout_truncated: s.fanout, owner_refusals: s.refusals, owner_calls: s.calls,
    budget_ms: ctx.budget_ms, elapsed_ms: reader.elapsed(), complete: reader.complete(), note: NOT_ASSERTED,
    ...(s.stop ? { truncated: true, undetermined: true, why: 'the read used its time budget before it was done' } : {}),
  };
}

/** How many others hold a step of `kind` to `node` in the span, counted from the owner's answer; a hub by its set size. */
function sharedSet(ctx, reader, { kind, node, span, a, b }) {
  const owner = ctx.registry.kindOf(kind)?.owner;
  const hubsBefore = reader.s.hubs.length;
  const items = reader.read(owner, node, [kind]);
  if (!items) {
    const hub = reader.s.hubs.length > hubsBefore ? reader.s.hubs[reader.s.hubs.length - 1] : null;
    if (hub) return { hub: true, set_size: hub.set_size, words: `with ${hub.set_size} others held; ${hub.words}` };
    return { held: null, why: 'the owner did not answer this record\'s set' };
  }
  const held = new Set(), undetermined = new Set();
  for (const h of items) {
    const other = h.from === node ? h.to : h.from;
    if (other === a || other === b || other === node) continue;
    const x = intersect([spanOfValidity(h.valid), span]);
    if (x.holds === 'in' && !isObj(h.undetermined)) held.add(other);
    else if (x.holds !== 'out') undetermined.add(other);
  }
  for (const o of held) undetermined.delete(o);
  return { held: held.size, undetermined: undetermined.size, words: `with ${held.size} others held${undetermined.size ? ` (and ${undetermined.size} not settled)` : ''}`,
    ...(items.length >= BOUNDS.fanout ? { at_least: true } : {}) };
}
