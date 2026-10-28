// @ts-check
/* explore: every meaningful chain between two ends (R30), the most direct (R31), shorter chains beside a member's own
   (R32) and a search kept after a stop by time (R33). Still the one walker (R15): the same owners' answers read through
   `reader.mjs`, here from both ends at once, so a pair six steps apart is found by reading three rings from each end and
   not six from one. An edge is known when either of its ends was read, so a chain is found whole from the answers of
   its nodes; a hub is never asked for its own list (R5, R20), so a chain through a hub is listed only when both its
   steps there came from the answers of the chain's other nodes, and the hub is named. Nothing is written, ranked or
   scored (R9, R16); a chain is told apart from another by connection-grammar's order alone (`orderPaths`). */
import { BOUNDS, chainStrength, strongerChain, foldParallel, chainLimitOf, orderPaths, exhausted, isRecordId } from '../connection-grammar/index.mjs';
import { kindsByOwner, makeReader } from './reader.mjs';
import { checkWalkArgs, sourcedSteps, describePath, depthStop, absence } from './walk.mjs';
import { nameEnds } from './labels.mjs';
import { CHAIN_MAX } from './rederive.mjs';
import { refuse, isObj, filled, viewerRefusal, NOT_ASSERTED } from './answer.mjs';
import { localize } from '../setup-words/index.mjs';

/** The time a search of the four ops waits when none is asked, and the most it may be asked to wait (R34; K4354). */
export const CHAIN_BUDGET_MS = Object.freeze({ default: 1500, max: 10000 });
/** How long a resume token holds, in milliseconds (R33). */
export const RESUME_TTL_MS = 15 * 60 * 1000;
/** The most a resume token may weigh, in characters (R33). */
export const RESUME_MAX = 256 * 1024;
/** The most chains one search lists out of before it says it stopped at a bound (R30): a protective count, never a measure. */
const FOUND_MAX = 20000;
const OPS = ['exploreall', 'explorepath', 'exploreshorter'];
const SEP = '\u0000';

/**
 * The time a search runs for: 1,500 ms when none is asked, a whole number of milliseconds from 1 to 10,000 otherwise,
 * else a refusal (R34). This module's own check: connection-grammar holds no budget helper.
 * @param {unknown} [requested]
 */
export function budgetMsOf(requested) {
  const { default: dflt, max } = CHAIN_BUDGET_MS;
  if (requested === undefined || requested === null) return dflt;
  if (typeof requested !== 'number' || !Number.isInteger(requested) || requested < 1 || requested > max) {
    return refuse('BUDGET_OUT_OF_RANGE', localize('explore.chains.budget_out_of_range', 'a search waits a whole number of milliseconds from 1 to {max}; {requested} is not one', { max: String(max), requested: String(requested).slice(0, 40) }));
  }
  return requested;
}

const isRefused = (v) => isObj(v) && typeof v.refused === 'string';

/**
 * The arguments of the two-ended ops, in R1's order after the viewer, then the end, the limit and the budget (R30).
 * @param {any} c @param {any} a @param {boolean} withLimit
 */
function checkChainArgs(c, a, withLimit) {
  const arg = isObj(a) ? a : {};
  const k = checkWalkArgs(c.registry, arg);
  if (k.refusal) return { refusal: k.refusal };
  if (!filled(arg.to)) return { refusal: refuse('EXPLORE_NO_END', localize('explore.chains.no_end', 'no to is named: a search between two ends names both')) };
  if (arg.to === arg.from) return { refusal: refuse('EXPLORE_SAME_END', localize('explore.chains.same_end', 'from and to are the same record: a search between two ends names two')) };
  let limit = null;
  if (withLimit) {
    const l = chainLimitOf(arg.limit);
    if (isRefused(l)) return { refusal: refuse(l.refused, l.why) };
    limit = l;
  }
  const b = budgetMsOf(arg.budget_ms);
  if (isRefused(b)) return { refusal: b };
  return { p: { from: arg.from, to: arg.to, at: arg.at, kinds: /** @type {string[]} */ (k.kinds), depth: /** @type {number} */ (k.depth), scope: arg.scope ?? null, limit, viewer: arg.viewer }, budget: Math.min(/** @type {number} */ (b), c.budget_ms) };
}

const pairKey = (u, v) => (u < v ? u + SEP + v : v + SEP + u);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** Breadth-first distances over an adjacency of node → neighbours. @param {Map<string, Iterable<string>>} adj @param {string} start */
function bfs(adj, start) {
  const dist = new Map([[start, 0]]);
  let level = [start];
  for (let d = 1; level.length; d++) {
    const next = [];
    for (const u of level) for (const v of adj.get(u) ?? []) if (!dist.has(v)) { dist.set(v, d); next.push(v); }
    level = next;
  }
  return dist;
}

/**
 * One search over the owners' answers from both ends. `restore` is the nodes an earlier slice read, in order (R33).
 * @param {any} c @param {any} p the checked arguments @param {number} budget @param {string[]} restore
 */
function openSearch(c, p, budget, restore) {
  const { registry } = c;
  const byOwner = kindsByOwner(registry, p.kinds);
  const r = makeReader({ ...c, budget_ms: budget }, { at: p.at, viewer: p.viewer, scope: p.scope ? p.scope.inquiry : null, replay: new Set(restore) });
  /** @type {Set<string>} */ const nodes = new Set([p.from, p.to]);
  /** @type {Map<string, Set<string>>} */ const nbrs = new Map();
  /** @type {Map<string, Map<string, any>>} */ const hopsOf = new Map();
  /** @type {Map<string, any[]>} */ const linkCache = new Map();
  const readOrder = [];
  const read = new Set(), blocked = new Set();
  let capped = false;

  /** One node's answers, every owner of the asked kinds: false when a bound stopped it, the node then not counted as read. */
  function readNode(node) {
    const hubsBefore = r.s.hubs.length;
    let items = [];
    for (const [owner, kinds] of byOwner) {
      const got = r.read(owner, node, kinds);
      if (r.s.stop) return false;
      if (got) items.push(...got);
    }
    items = sourcedSteps(registry, r, node, items, p.kinds);
    if (r.s.stop) return false;
    const fresh = new Set();
    for (const h of items) { const o = h.from === node ? h.to : h.from; if (o !== node && !nodes.has(o)) fresh.add(o); }
    if (nodes.size + fresh.size > BOUNDS.nodes) { r.s.stop = 'nodes'; r.s.stop_node = node; return false; }
    for (const h of items) {
      if (h.from !== node && h.to !== node) continue;
      const o = h.from === node ? h.to : h.from;
      if (o === node) continue;
      nodes.add(o);
      if (!nbrs.has(node)) nbrs.set(node, new Set());
      if (!nbrs.has(o)) nbrs.set(o, new Set());
      /** @type {Set<string>} */ (nbrs.get(node)).add(o);
      /** @type {Set<string>} */ (nbrs.get(o)).add(node);
      const key = pairKey(node, o);
      if (!hopsOf.has(key)) hopsOf.set(key, new Map());
      /** @type {Map<string, any>} */ (hopsOf.get(key)).set(String(h.id), h);
      linkCache.delete(key);
    }
    // A node whose every kind was answered as a hub gave no list: it is named, and counts for no ring (R5, R20).
    if (!items.length && r.s.hubs.length > hubsBefore) blocked.add(node); else read.add(node);
    readOrder.push(node);
    return true;
  }

  for (const n of restore) { if (!readNode(n)) break; }

  /**
   * Where a side stands: the rings it has read whole, and the nodes of the ring it reads next (R30). A hub in a ring is
   * read as an empty answer (it is never asked for its list, R5), so its ring is whole; an end that is a hub gives
   * nothing to read from its side, and every edge there is then known only from the other end's reach.
   * @param {string} end
   */
  function sideOf(end) {
    if (blocked.has(end)) return { done: -1, todo: /** @type {string[]} */ ([]), closed: false };
    const dist = bfs(nbrs, end);
    /** @type {string[][]} */ const rings = [];
    for (const [n, d] of dist) (rings[d] ??= []).push(n);
    let done = -1, todo = /** @type {string[]} */ ([]);
    for (let k = 0; k < rings.length; k++) {
      const open = rings[k].filter((n) => !read.has(n) && !blocked.has(n)).sort(cmp);
      if (open.length) { todo = open; break; }
      done = k;
    }
    // Everything this end reaches is read and no hub among it: whatever else joins it was told by what was read.
    const closed = !todo.length && ![...dist.keys()].some((n) => blocked.has(n));
    return { done, todo, closed };
  }

  /** The largest L such that every meaningful chain of at most L steps is counted (R30). */
  const cover = (a, b) => (a.closed || b.closed || (!a.todo.length && !b.todo.length) ? p.depth : Math.max(0, Math.min(p.depth, a.done + b.done + 2)));

  /** Reads ring by ring from the end with the smaller next ring until `satisfied(cover, dist)` holds, a bound stops it, or nothing is left. */
  function advance(satisfied) {
    for (;;) {
      if (r.s.stop) break;
      const a = sideOf(p.from), b = sideOf(p.to);
      const cov = cover(a, b);
      if (satisfied(cov, bfs(nbrs, p.from).get(p.to))) break;
      const pick = a.todo.length && (!b.todo.length || a.todo.length <= b.todo.length) ? a : b.todo.length ? b : null;
      if (!pick) break;
      for (const n of pick.todo) if (!readNode(n)) break;
    }
  }

  /** The grouped links of one pair of nodes (R24; connection-grammar R24). */
  function linksOf(u, v) {
    const key = pairKey(u, v);
    if (!linkCache.has(key)) linkCache.set(key, /** @type {any[]} */ (foldParallel([.../** @type {Map<string, any>} */ (hopsOf.get(key) ?? new Map()).values()])));
    return /** @type {any[]} */ (linkCache.get(key));
  }

  /**
   * Every chain of at most `maxLen` steps over the links `allow` takes, each a list of links with no record twice (R30).
   * @param {number} maxLen @param {(link: any) => boolean} allow
   */
  function chains(maxLen, allow) {
    /** @type {Map<string, Map<string, any[]>>} */ const adj = new Map();
    for (const [key, held] of hopsOf) {
      if (!held.size) continue;
      const [u, v] = key.split(SEP);
      const ok = linksOf(u, v).filter(allow);
      if (!ok.length) continue;
      for (const [x, y] of [[u, v], [v, u]]) { if (!adj.has(x)) adj.set(x, new Map()); /** @type {Map<string, any[]>} */ (adj.get(x)).set(y, ok); }
    }
    const toward = bfs(new Map([...adj].map(([u, m]) => [u, m.keys()])), p.to);
    /** @type {string[][]} */ const walks = [];
    const onPath = new Set([p.from]), at = [p.from];
    let steps = 0;
    const dfs = (u, left) => {
      for (const v of [.../** @type {Map<string, any[]>} */ (adj.get(u) ?? new Map()).keys()].sort(cmp)) {
        if (capped || onPath.has(v)) continue;
        const d = toward.get(v);
        if (d === undefined || d + 1 > left) continue;
        if ((++steps & 1023) === 0 && r.spent() > budget) { r.s.stop = 'time'; return; }
        if (v === p.to) { walks.push([...at, v]); continue; }
        onPath.add(v); at.push(v);
        dfs(v, left - 1);
        at.pop(); onPath.delete(v);
        if (r.s.stop) return;
      }
    };
    if (toward.has(p.from)) dfs(p.from, maxLen);
    /** @type {any[][]} */ const out = [];
    for (const w of walks) {
      let acc = [[]];
      for (let i = 0; i + 1 < w.length && acc.length <= FOUND_MAX; i++) {
        const ls = /** @type {any[]} */ (adj.get(w[i])?.get(w[i + 1]));
        acc = acc.flatMap((x) => ls.map((l) => [...x, l]));
      }
      for (const x of acc) { if (out.length >= FOUND_MAX) { capped = true; break; } out.push(x); }
      if (capped) break;
    }
    return out;
  }

  const isLead = (l) => registryClass(registry, l) === 'declared' || registryClass(registry, l) === 'hunch';
  return {
    r, nodes, nbrs, readOrder, read, blocked, sideOf, cover, advance, chains, isLead,
    get capped() { return capped; },
    /** The nodes the record joins to an end at exactly the depth, which the search did not go beyond (R22): the far end is not one. */
    atDepth: () => {
      const out = new Set();
      for (const [n, d] of bfs(nbrs, p.from)) if (d === p.depth && n !== p.to) out.add(n);
      for (const [n, d] of bfs(nbrs, p.to)) if (d === p.depth && n !== p.from) out.add(n);
      return [...out].sort(cmp);
    },
    distance: () => bfs(nbrs, p.from).get(p.to),
  };
}

const registryClass = (registry, link) => registry.kindOf(link.kind)?.class ?? null;

/* ---- the token a stopped search leaves (R33): its arguments and the nodes it read, signed against a changed byte ---- */

/** A short checksum of a text (not a secret: no key is held, so it only tells a changed byte). @param {string} text */
function checksum(text) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

const toBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64 = (text) => {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
};

/** @param {any} c @param {string} op @param {any} args the caller's arguments, viewer and budget left out @param {any} viewer @param {number} slice @param {string[]} readNodes */
function tokenOf(c, op, args, viewer, slice, readNodes) {
  const body = { v: 1, op, who: checksum(String(viewer)), t: c.wall(), slice, args, read: readNodes };
  const text = toBase64(JSON.stringify({ ...body, sig: checksum(JSON.stringify(body)) }));
  return text.length > RESUME_MAX ? null : text;
}

/** @param {any} resume */
function readToken(resume) {
  try {
    const o = JSON.parse(fromBase64(resume));
    if (!isObj(o) || o.v !== 1 || !OPS.includes(o.op) || typeof o.who !== 'string' || typeof o.t !== 'number' || !Number.isInteger(o.slice) || o.slice < 1
      || !isObj(o.args) || !Array.isArray(o.read) || o.read.length > BOUNDS.nodes || !o.read.every(isRecordId) || typeof o.sig !== 'string') return null;
    const { sig, ...body } = o;
    return checksum(JSON.stringify(body)) === sig ? o : null;
  } catch { return null; }
}

/* ---- what every answer of the four ops says about its bounds (R30) ---- */

/**
 * @param {any} c @param {any} p @param {number} budget @param {ReturnType<typeof openSearch>} s @param {number} cov
 * @param {{cutByLimit?: boolean}} [o]
 */
function bounds(c, p, budget, s, cov, o = {}) {
  const st = s.r.s;
  const atDepth = s.atDepth();
  const reason = st.stop ?? (s.capped || st.fanout.length ? 'fanout' : st.hubs.length ? 'hub' : atDepth.length ? 'depth' : null);
  const depth = depthStop(atDepth);
  const ex = reason ? /** @type {any} */ (exhausted({ visited: s.nodes.size, reason })) : null;
  return {
    complete_through_steps: cov,
    more_may_exist: Boolean(o.cutByLimit) || reason !== null,
    ...(reason ? { stopped: { reason, why: ex.why, visited: s.nodes.size, ...(st.stop_node && st.stop ? { node: st.stop_node } : {}) } } : {}),
    ...(reason === 'time' || reason === 'nodes' ? { truncated: true, undetermined: true } : {}),
    hubs: st.hubs, unread: st.unread, fanout_truncated: st.fanout, owner_refusals: st.refusals, ...depth,
    visited: s.nodes.size, depth: p.depth, budget_ms: budget, elapsed_ms: s.r.elapsed(), owner_calls: st.calls, note: NOT_ASSERTED,
  };
}

/** One chain as the answer gives it (R30). @param {any} c @param {any[]} links @param {number} cov */
function describe(c, links, cov) {
  const d = /** @type {any} */ (describePath(c.registry, links));
  return {
    steps: d.hops, step_count: links.length, grade: d.grade, strength: chainStrength(links), label: d.label,
    ...(d.lead ? { lead: d.lead } : {}), marks: d.marks, at_date: d.at_date, ...(d.undetermined ? { undetermined: d.undetermined } : {}),
    level_complete: links.length <= cov,
  };
}

/** The hub each step at a hub is marked with (R30): the chain's interior nodes only. @param {any[]} steps @param {string[]} ends @param {any[]} hubs */
function markHubs(steps, ends, hubs) {
  return steps.map((l) => {
    for (const node of [l.from, l.to]) {
      if (ends.includes(node)) continue;
      const h = hubs.find((x) => x.node === node && x.kind === l.kind);
      if (h) return { ...l, hub: { node: h.node, kind: h.kind, bound: h.bound, set_size: h.set_size } };
    }
    return l;
  });
}

/** Lists the first `limit` of ordered chains with their steps named and hub-marked. @param {any} c @param {any} p @param {any[][]} ordered @param {number} cov @param {ReturnType<typeof openSearch>} s */
function listed(c, p, ordered, cov, s) {
  const named = nameEnds(c, ordered.flatMap((x) => x), p.viewer);
  return ordered.map((links) => {
    const d = describe(c, links, cov);
    return { ...d, steps: markHubs(d.steps.map(named), [p.from, p.to], s.r.s.hubs) };
  });
}

const sameStrength = (a, b) => strongerChain(a, b) === 0;

/* ---- the four ops ---- */

/**
 * connectionsBetween({from, to, kinds?, at, depth?, scope?, limit?, budget_ms?, viewer}) (R30): every meaningful chain between two ends.
 * @param {any} c @param {any} arg
 */
export function connectionsBetween(c, arg) { return everyChain(c, arg, null); }

/** @param {any} c @param {any} arg @param {{slice: number, restore: string[]} | null} again */
function everyChain(c, arg, again) {
  const k = checkChainArgs(c, arg, true);
  if (k.refusal) return k.refusal;
  const { p, budget } = k;
  const s = openSearch(c, p, budget, again?.restore ?? []);
  s.advance((cov) => cov >= p.depth);
  const cov = s.cover(s.sideOf(p.from), s.sideOf(p.to));
  const all = /** @type {any[][]} */ (orderPaths(s.chains(p.depth, () => true)));
  const shown = listed(c, p, all.slice(0, p.limit), cov, s);
  const cut = all.length > shown.length;
  const b = bounds(c, p, budget, s, cov, { cutByLimit: cut });
  const slice = again?.slice ?? 1;
  const ans = {
    ok: true, from: p.from, to: p.to, at: p.at, kinds: p.kinds, scope: p.scope, slice,
    chains: shown, listed: shown.length, found: all.length, cut_by_limit: cut,
    ...b,
  };
  if (!shown.length) /** @type {any} */ (ans).absence = absence({ from: p.from, to: p.to, kinds: p.kinds, at: p.at, depth: p.depth }, s.r.complete() && cov >= p.depth, s.r.s.unread);
  return withResume(c, ans, s, 'exploreall', arg, p, slice);
}

/**
 * mostDirect({from, to, kinds?, at, depth?, scope?, budget_ms?, viewer}) (R31).
 * @param {any} c @param {any} arg
 */
export function mostDirect(c, arg) { return directChain(c, arg, null); }

/** @param {any} c @param {any} arg @param {{slice: number, restore: string[]} | null} again */
function directChain(c, arg, again) {
  const k = checkChainArgs(c, arg, false);
  if (k.refusal) return k.refusal;
  const { p, budget } = k;
  const s = openSearch(c, p, budget, again?.restore ?? []);
  s.advance((cov, d) => cov >= p.depth || (d !== undefined && d <= cov));
  let cov = s.cover(s.sideOf(p.from), s.sideOf(p.to));
  const first = s.distance();
  const level = first !== undefined && first <= cov ? first : null;
  let direct = null, equally = 0;
  if (level !== null) {
    const ordered = /** @type {any[][]} */ (orderPaths(s.chains(level, () => true).filter((x) => x.length === level)));
    if (ordered.length) {
      direct = ordered[0];
      equally = ordered.slice(1).filter((x) => sameStrength(/** @type {any} */ (direct), x)).length;
    }
  }
  const mostDirectChain = direct ? listed(c, p, [direct], cov, s)[0] : null;
  const ans = /** @type {any} */ ({ ok: true, from: p.from, to: p.to, at: p.at, kinds: p.kinds, scope: p.scope, slice: again?.slice ?? 1, most_direct: mostDirectChain, equally_short: direct ? equally : 0 });
  if (mostDirectChain && mostDirectChain.label === 'lead') {
    // A finding never rests on a lead (K1487): look on, within the same bounds, for a chain with no declared or hunch step.
    s.advance((cv) => cv >= p.depth);
    cov = s.cover(s.sideOf(p.from), s.sideOf(p.to));
    const evidenced = /** @type {any[][]} */ (orderPaths(s.chains(p.depth, (l) => !s.isLead(l))));
    ans.most_direct_evidenced = evidenced.length ? listed(c, p, [evidenced[0]], cov, s)[0] : null;
    if (!evidenced.length) ans.searched = { depth: p.depth, complete: cov >= p.depth && !s.r.s.stop };
  }
  Object.assign(ans, bounds(c, p, budget, s, cov));
  if (!mostDirectChain) {
    if (s.r.s.stop) ans.undetermined = true;
    ans.absence = absence({ from: p.from, to: p.to, kinds: p.kinds, at: p.at, depth: p.depth }, s.r.complete() && cov >= p.depth, s.r.s.unread);
  }
  return withResume(c, ans, s, 'explorepath', arg, p, ans.slice);
}

/** The ends of a member's chain in walking order, or the refusal naming the hop (R32). @param {any} chain */
function endsOfChain(chain) {
  const bad = (why) => ({ refusal: refuse('OWN_CHAIN_INVALID', why) });
  if (!Array.isArray(chain) || chain.length < 1 || chain.length > CHAIN_MAX) return bad(localize('explore.chains.own_invalid', 'a chain is its steps in order, 1 to {CHAIN_MAX}, each with an id and a kind', { CHAIN_MAX: String(CHAIN_MAX) }));
  for (const [i, h] of chain.entries()) if (!isObj(h) || !filled(h.id) || !filled(h.kind)) return bad(localize('explore.chains.own_step_invalid', 'step {step} has no id or no kind', { step: String(i + 1) }));
  for (const [i, h] of chain.entries()) {
    if (!filled(h.from) || !filled(h.to) || !isRecordId(h.from) || !isRecordId(h.to)) {
      return { refusal: refuse('OWN_CHAIN_NO_ENDS', localize('explore.chains.own_no_ends', 'step {step} ({id}) names no record at one of its ends: each step carries from and to', { step: String(i + 1), id: String(h.id).slice(0, 60) })) };
    }
  }
  let start = chain[0].from, cur = chain[0].to;
  if (chain.length > 1) {
    const second = chain[1];
    if (second.from === cur || second.to === cur) { /* walked a to b */ } else if (second.from === start || second.to === start) { [start, cur] = [cur, start]; } else {
      return { refusal: refuse('OWN_CHAIN_GAPPED', localize('explore.chains.own_gapped', 'step {step} ({id}) shares no record with the step before it', { step: '2', id: String(second.id).slice(0, 60) })) };
    }
    for (let i = 1; i < chain.length; i++) {
      const h = chain[i];
      if (h.from !== cur && h.to !== cur) {
        return { refusal: refuse('OWN_CHAIN_GAPPED', localize('explore.chains.own_gapped', 'step {step} ({id}) shares no record with the step before it', { step: String(i + 1), id: String(h.id).slice(0, 60) })) };
      }
      cur = h.from === cur ? h.to : h.from;
    }
  }
  if (start === cur) return bad(localize('explore.chains.own_ends_same', 'the chain starts and ends at the same record: its two ends are told apart'));
  return { from: start, to: cur };
}

/**
 * shorterThan({chain, kinds?, at, depth?, scope?, limit?, budget_ms?, viewer}) (R32): shorter chains beside a member's own.
 * @param {any} c @param {any} arg
 */
export function shorterThan(c, arg) { return shorterChains(c, arg, null); }

/** @param {any} c @param {any} arg @param {{slice: number, restore: string[]} | null} again */
function shorterChains(c, arg, again) {
  const a = isObj(arg) ? arg : {};
  const v = viewerRefusal(a.viewer);
  if (v) return v;
  const e = endsOfChain(a.chain);
  if (e.refusal) return e.refusal;
  const k = checkChainArgs(c, { ...a, from: e.from, to: e.to }, true);
  if (k.refusal) return k.refusal;
  const { p, budget } = k;
  const n = a.chain.length;
  const reach = { ...p, depth: Math.min(p.depth, n - 1) };
  const s = openSearch(c, reach, budget, again?.restore ?? []);
  if (reach.depth >= 1) s.advance((cov) => cov >= reach.depth);
  const cov = reach.depth >= 1 ? s.cover(s.sideOf(reach.from), s.sideOf(reach.to)) : 0;
  const all = reach.depth >= 1 ? /** @type {any[][]} */ (orderPaths(s.chains(reach.depth, () => true))) : [];
  const evidenced = all.filter((x) => !x.some((l) => s.isLead(l)));
  const leads = all.filter((x) => x.some((l) => s.isLead(l)));
  const shown = (xs) => listed(c, p, xs.slice(0, p.limit), cov, s);
  const b = bounds(c, reach, budget, s, cov);
  const slice = again?.slice ?? 1;
  const ans = {
    ok: true, chain_steps: n, slice,
    shorter: { evidenced: shown(evidenced), leads: shown(leads) },
    fewest_steps: all.length ? Math.min(...all.map((x) => x.length)) : null,
    searched: { kinds: p.kinds, depth: reach.depth, visited: s.nodes.size, hubs: s.r.s.hubs },
    complete: cov >= reach.depth && !s.r.s.stop,
    ...b,
  };
  return withResume(c, ans, s, 'exploreshorter', arg, reach, slice);
}

/** Adds the token of a search stopped by time, or says why none is offered (R33). */
function withResume(c, ans, s, op, arg, p, slice) {
  if (ans.stopped?.reason !== 'time') return ans;
  const { viewer, resume, budget_ms, ...args } = isObj(arg) ? arg : /** @type {any} */ ({});
  const token = tokenOf(c, op, args, p.viewer, slice + 1, s.readOrder);
  return token ? { ...ans, resumable: true, resume: token } : { ...ans, resumable: false, resumable_why: localize('explore.chains.resume_too_large', 'the search read too many records to be kept for continuing: ask again for a narrower one') };
}

/**
 * continueWalk({resume, budget_ms?, viewer}) (R33): the search a stop by time left, carried on for another slice. It reads the record as it then stands.
 * @param {any} c @param {any} arg
 */
export function continueWalk(c, arg) {
  const a = isObj(arg) ? arg : {};
  const v = viewerRefusal(a.viewer);
  if (v) return v;
  if (!filled(a.resume)) return refuse('NO_RESUME', localize('explore.chains.no_resume', 'no resume is given: a search that stopped by time offers one'));
  const t = readToken(a.resume);
  if (!t) return refuse('BAD_RESUME', localize('explore.chains.bad_resume', 'this resume cannot be read: ask the search again'));
  if (t.who !== checksum(String(a.viewer))) return refuse('RESUME_OTHER_VIEWER', localize('explore.chains.resume_other_viewer', 'this resume was given to another member'));
  if (c.wall() - t.t > RESUME_TTL_MS) return refuse('RESUME_EXPIRED', localize('explore.chains.resume_expired', 'this resume is more than 15 minutes old: ask the search again'));
  const b = budgetMsOf(a.budget_ms);
  if (isRefused(b)) return b;
  const again = { slice: t.slice, restore: /** @type {string[]} */ (t.read) };
  const base = { ...t.args, viewer: a.viewer, budget_ms: /** @type {number} */ (b) };
  const ans = t.op === 'exploreall' ? everyChain(c, base, again) : t.op === 'explorepath' ? directChain(c, base, again) : shorterChains(c, base, again);
  return isRefused(ans) ? refuse('BAD_RESUME', localize('explore.chains.bad_resume', 'this resume cannot be read: ask the search again')) : ans;
}
