// @ts-check
/* explore: one owner's read of one node, every page, through the registry's `neighbours` (connection-grammar R19),
   which passes `viewer` and `scope` unchanged and refuses a non-conforming answer whole. One node per call, so no
   owner call binds more than one node (R2). What the reads met on the way (hubs, fan-out, owners' refusals, tables
   held but not read) is gathered for the answer (R5, R8). Hidden items are never returned by an owner, so nothing
   here can count them (R7). */
import { BOUNDS } from '../connection-grammar/index.mjs';
import { isObj, isRefusal } from './answer.mjs';

/** The most pages one owner's read of one node is followed before the walk calls its paging unbounded. */
export const PAGE_LIMIT = 100;
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
 * @param {{registry: any, now: () => number, budget_ms: number}} ctx
 * @param {{at: any, viewer: any, scope: string|null}} q
 */
export function makeReader(ctx, q) {
  const { registry, now, budget_ms } = ctx;
  const t0 = now();
  const s = { hubs: [], fanout: [], refusals: [], unread: [], calls: 0, stop: /** @type {string|null} */ (null) };
  const elapsed = () => Math.max(0, Math.round(now() - t0));

  /**
   * Every page of one owner's read of one node, kept to BOUNDS.fanout per kind; null when the owner refused, the
   * node is a hub, or the time ran out (`s.stop` then says `time`).
   * @param {string} owner @param {string} node @param {string[]} kinds @param {any} [at]
   */
  function read(owner, node, kinds, at = q.at) {
    const items = [];
    const seenPages = new Set();
    let page;
    for (let i = 0; ; i++) {
      if (now() - t0 > budget_ms) { s.stop = 'time'; return null; }
      if (i === PAGE_LIMIT) { s.fanout.push({ node, owner, why: `${owner}'s paging did not end within ${PAGE_LIMIT} pages` }); break; }
      s.calls++;
      const a = registry.neighbours({ owner, node, kinds, at, page, viewer: q.viewer, scope: q.scope });
      if (isRefusal(a)) { s.refusals.push({ owner, node, refused: a.refused, why: a.why }); return null; }
      if (Array.isArray(a.unread)) for (const u of a.unread) if (isObj(u)) s.unread.push({ owner, node, what: String(u.what ?? ''), why: String(u.why ?? '') });
      if (a.hub) { s.hubs.push({ node, owner, kinds, set_size: a.hub.set_size, why: a.hub.why, words: HUB_WORDS }); return null; }
      items.push(...a.items);
      if (a.truncated) s.fanout.push({ node, owner, why: `${owner} answered only part of this node's connections` });
      if (a.next === undefined || a.next === null) break;
      const key = JSON.stringify(a.next);
      if (seenPages.has(key)) { s.refusals.push({ owner, node, refused: 'PAGING_REPEATS', why: `${owner}'s paging repeats a page` }); return null; }
      seenPages.add(key);
      page = a.next;
    }
    const perKind = new Map(), over = new Set(), kept = [];
    for (const it of items) {
      const n = (perKind.get(it.kind) ?? 0) + 1;
      perKind.set(it.kind, n);
      if (n <= BOUNDS.fanout) kept.push(it); else over.add(it.kind);
    }
    for (const kind of over) s.fanout.push({ node, owner, kind, why: `more than ${BOUNDS.fanout} connections of ${kind}; the first ${BOUNDS.fanout} in ${owner}'s order were followed` });
    return kept;
  }

  return { read, s, elapsed, complete: () => !s.stop && !s.hubs.length && !s.fanout.length && !s.refusals.length };
}
