// @ts-check
/* connection-grammar: the bounds of every walk (R10) and the shape a walk answers when it stops at one (R15). No bound
   measures how connected a node is (R17): each limits work, never ranks. */

/** The hub bound of every kind not named in `hub_by_kind` (R10). */
import { word, localize } from '../setup-words/index.mjs';

const HUB = 1000;

/**
 * The hub bound per kind (R10; N566, K2063): `event_voted`, `events`' kind for a member's vote, 4,000 (a four-year
 * term is about 3,400 votes at the desk figure); every kind not named here is `hub`'s. A protective limit (K1881).
 * Frozen, with no prototype, so `hub_by_kind[kind] ?? hub` reads a named kind's bound and nothing inherited.
 */
const HUB_BY_KIND = Object.freeze(Object.assign(Object.create(null), { event_voted: 4000 }));

/** The walk bounds (K1470; legistar-events §6). `time_budget_ms` is a default every walk may lower. */
export const BOUNDS = Object.freeze({
  depth_default: 8,
  depth_max: 10,
  fanout: 1000,
  nodes: 5000,
  hub: HUB,
  hub_by_kind: HUB_BY_KIND,
  time_budget_ms: 10000,
});

/**
 * The hub bound of one kind: its own in `hub_by_kind`, else `hub` (R6, R10). A node whose set of that kind exceeds it
 * is a hub, answered by its set size with no items.
 * @param {unknown} kind
 */
export const hubBoundOf = (kind) => (typeof kind === 'string' && HUB_BY_KIND[kind] !== undefined ? HUB_BY_KIND[kind] : HUB);

/**
 * The depth a walk runs to: 8 when none is asked, the asked depth from 1 to 10, else a refusal saying why (R10, R18).
 * @param {unknown} [requested]
 */
export function depthOf(requested) {
  if (requested === undefined || requested === null) return BOUNDS.depth_default;
  if (typeof requested !== 'number' || !Number.isInteger(requested) || requested < 1) {
    return { refused: 'DEPTH_INVALID', why: word('connection-grammar.why.depth_whole_number', { depth_max: String(BOUNDS.depth_max), requested: String(String(requested).slice(0, 40)) }) };
  }
  if (requested > BOUNDS.depth_max) {
    return { refused: 'DEPTH_OVER_MAX', why: word('connection-grammar.why.walk_goes_hops', { depth_max: String(BOUNDS.depth_max), requested: String(requested) }) };
  }
  return requested;
}

const WHY = Object.freeze({
  depth: word('connection-grammar.walk_reached_depth'),
  nodes: word('connection-grammar.walk_visited_bound', { nodes: String(BOUNDS.nodes) }),
  fanout: word('connection-grammar.node_connections_hop', { fanout: String(BOUNDS.fanout) }),
  hub: word('connection-grammar.walk_reached_hub', { hub: String(BOUNDS.hub), event_voted: String(HUB_BY_KIND.event_voted) }),
  time: word('connection-grammar.walk_used_time'),
});

/** The bounds a walk can stop at (R15). */
export const EXHAUSTION_REASONS = Object.freeze(Object.keys(WHY));

/**
 * What a walk that stopped at a bound answers: truncated and undetermined, never a partial path shown as complete
 * (R15, K1442, K1470).
 * @param {{visited?: unknown, reason?: unknown}} [arg]
 */
export function exhausted(arg) {
  const { visited, reason } = arg && typeof arg === 'object' ? arg : /** @type {any} */ ({});
  if (typeof reason !== 'string' || !Object.hasOwn(WHY, reason)) {
    return { refused: 'REASON_UNKNOWN', why: word('connection-grammar.why.walk_stops_none', { exhaustion_reasons: String(EXHAUSTION_REASONS.join(', ')), reason: String(String(reason).slice(0, 40)) }) };
  }
  if (typeof visited !== 'number' || !Number.isInteger(visited) || visited < 0) {
    return { refused: 'VISITED_INVALID', why: word('connection-grammar.why.visited_count_nodes') };
  }
  return { truncated: true, undetermined: true, why: WHY[/** @type {keyof typeof WHY} */ (reason)], visited };
}

/**
 * The most chains a member's list of every chain shows (R25; N1260, DEC-409, DEC-411): a count only, kept apart from
 * `BOUNDS`. The times a search waits are `runtime-limits`' budget classes, never here.
 */
export const CHAIN_LIMITS = Object.freeze({ chains: Object.freeze({ default: 50, max: 200 }) });

/**
 * The count a list of every chain is cut at: 50 when none is asked, the asked count from 1 to 200, else a refusal
 * saying why (R25, R18).
 * @param {unknown} [requested]
 */
export function chainLimitOf(requested) {
  const { default: dflt, max } = CHAIN_LIMITS.chains;
  if (requested === undefined || requested === null) return dflt;
  if (typeof requested !== 'number' || !Number.isInteger(requested) || requested < 1) {
    return { refused: 'CHAIN_LIMIT_INVALID', why: localize('connection-grammar.why.chain_limit_whole', 'a chain limit is a whole number of chains from 1 to {max}; {requested} is not', { max, requested: String(requested).slice(0, 40) }) };
  }
  if (requested > max) {
    return { refused: 'CHAIN_LIMIT_OVER_MAX', why: localize('connection-grammar.why.chain_limit_over', 'a list shows at most {max} chains; {requested} were asked', { max, requested }) };
  }
  return requested;
}
