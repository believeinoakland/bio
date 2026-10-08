// @ts-check
/* explore: one owner's read of one node, every page, through the registry's `neighbours` (connection-grammar R19),
   which passes `viewer`, `scope` and `host` unchanged (K1563 (1)) and refuses a non-conforming answer whole. One node per call, so no
   owner call binds more than one node (R2). A kind's set is read to its end within that kind's own hub bound
   (`connection-grammar.hubBoundOf`), never cut at one page (R5); a hub is judged per kind, so a hub answer to a call
   naming several kinds is asked again for each kind alone (R20). What the reads met on the way (hubs, fan-out, owners'
   refusals, tables held but not read) is gathered for the answer (R5, R8). Hidden items are never returned by an owner,
   so nothing here can count them (R7). */
import { hubBoundOf } from '../connection-grammar/index.mjs';
import { isObj, isRefusal } from './answer.mjs';

/** What a hub is called in an answer (R5). */
export const HUB_WORDS = 'too common to walk';

/** Group kinds by their owner, in the order asked. @param {any} registry @param {string[]} kinds */
export function kindsByOwner(registry, kinds) {
  /** @type {Map<string, string[]>} */
  const by = new Map();
  for (const kind of kinds) {
    const e = registry.kindOf(kind);
    if (!e) continue;
    if (!by.has(e.owner)) by.set(e.owner, []);
    /** @type {string[]} */ (by.get(e.owner)).push(kind);
  }
  return by;
}

/**
 * A reader for one exploration: as of `at`, for `viewer`, within `scope`, against the time budget.
 * @param {{registry: any, now: () => number, budget_ms: number, host?: any}} ctx
 * @param {{at: any, viewer: any, scope: string|null}} q
 */
export function makeReader(ctx, q) {
  const { registry, now, budget_ms } = ctx;
  const t0 = now();
  const s = { hubs: [], fanout: [], refusals: [], unread: [], calls: 0, stop: /** @type {string|null} */ (null) };
  const elapsed = () => Math.max(0, Math.round(now() - t0));

  const unreadSeen = new Set();
  const hub = (node, owner, kind, h) => ({ node, owner, kind, bound: hubBoundOf(kind), set_size: h.set_size, why: h.why, words: HUB_WORDS });

  /**
   * Every page of one owner's answer for one node and the kinds asked: `{items}`, `{hub}`, or null when the owner
   * refused or the time ran out (`s.stop` then says `time`). Paging stops once it has passed every asked kind's bound,
   * since nothing beyond a kind's bound is walked (R5); the time budget bounds an owner whose paging never ends.
   * @param {string} owner @param {string} node @param {string[]} kinds @param {any} at
   */
  function pages(owner, node, kinds, at) {
    const items = [];
    const seenPages = new Set();
    const most = kinds.reduce((n, k) => n + hubBoundOf(k), 0);
    let page;
    for (;;) {
      if (now() - t0 > budget_ms) { s.stop = 'time'; return null; }
      s.calls++;
      const a = registry.neighbours({ owner, node, kinds, at, page, viewer: q.viewer, scope: q.scope, host: ctx.host });
      if (isRefusal(a)) { s.refusals.push({ owner, node, refused: a.refused, why: a.why }); return null; }
      if (Array.isArray(a.unread)) for (const u of a.unread) {
        if (!isObj(u)) continue;
        const e = { owner, node, what: String(u.what ?? ''), why: String(u.why ?? '') };
        const key = JSON.stringify(e);
        if (!unreadSeen.has(key)) { unreadSeen.add(key); s.unread.push(e); }
      }
      if (a.hub) return { hub: a.hub };
      items.push(...a.items);
      if (a.truncated) s.fanout.push({ node, owner, why: `${owner} answered only part of this node's connections` });
      if (a.next === undefined || a.next === null) break;
      if (items.length > most) break; // past every asked kind's bound: the rest would not be walked
      const key = JSON.stringify(a.next);
      if (seenPages.has(key)) { s.refusals.push({ owner, node, refused: 'PAGING_REPEATS', why: `${owner}'s paging repeats a page` }); return null; }
      seenPages.add(key);
      page = a.next;
    }
    return { items };
  }

  /** The items of each kind within that kind's bound; the node and kind named where an owner paged beyond it (R5). */
  function withinBounds(owner, node, items) {
    const perKind = new Map(), over = new Set(), kept = [];
    for (const it of items) {
      const n = (perKind.get(it.kind) ?? 0) + 1;
      perKind.set(it.kind, n);
      if (n <= hubBoundOf(it.kind)) kept.push(it); else over.add(it.kind);
    }
    for (const kind of over) {
      const bound = hubBoundOf(kind);
      s.fanout.push({ node, owner, kind, bound, why: `more than ${bound} connections of ${kind}; the first ${bound} in ${owner}'s order were followed` });
    }
    return kept;
  }

  /**
   * One owner's read of one node over the kinds asked of it: the items to walk, or null when the owner refused, the
   * one kind asked is a hub, or the time ran out. A hub answer names no kind, so when the call named several, each is
   * asked again alone (R20): a kind answered in items is walked, and only a kind answered as a hub alone is named.
   * @param {string} owner @param {string} node @param {string[]} kinds @param {any} [at]
   */
  function read(owner, node, kinds, at = q.at) {
    const a = pages(owner, node, kinds, at);
    if (!a) return null;
    if (!a.hub) return withinBounds(owner, node, a.items);
    if (kinds.length === 1) { s.hubs.push(hub(node, owner, kinds[0], a.hub)); return null; }
    const items = [];
    for (const kind of kinds) {
      const one = pages(owner, node, [kind], at);
      if (s.stop) return null;
      if (!one) continue; // this kind refused, named in owner_refusals; the others are still walked
      if (one.hub) s.hubs.push(hub(node, owner, kind, one.hub));
      else items.push(...one.items);
    }
    return withinBounds(owner, node, items);
  }

  return { read, s, elapsed, complete: () => !s.stop && !s.hubs.length && !s.fanout.length && !s.refusals.length };
}
