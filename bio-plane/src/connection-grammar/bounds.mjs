// @ts-check
/* connection-grammar: the bounds of every walk (R10) and the shape a walk answers when it stops at one (R15). No bound
   measures how connected a node is (R17): each limits work, never ranks. */

/** The hub bound of every kind not named in `hub_by_kind` (R10). */
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
    return { refused: 'DEPTH_INVALID', why: `a depth is a whole number of hops from 1 to ${BOUNDS.depth_max}; ${String(requested).slice(0, 40)} is not` };
  }
  if (requested > BOUNDS.depth_max) {
    return { refused: 'DEPTH_OVER_MAX', why: `a walk goes at most ${BOUNDS.depth_max} hops; ${requested} were asked` };
  }
  return requested;
}

const WHY = Object.freeze({
  depth: 'the walk reached its depth bound before it was done',
  nodes: `the walk visited its bound of ${BOUNDS.nodes} nodes before it was done`,
  fanout: `a node had more than ${BOUNDS.fanout} connections in one hop, so not every path from it was followed`,
  hub: `the walk reached a hub (a node with more connections of one kind than that kind's bound: ${BOUNDS.hub}, a member's vote ${HUB_BY_KIND.event_voted}), which is named, never expanded`,
  time: 'the walk used its time budget before it was done',
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
    return { refused: 'REASON_UNKNOWN', why: `a walk stops at one of ${EXHAUSTION_REASONS.join(', ')}; ${String(reason).slice(0, 40)} is none of them` };
  }
  if (typeof visited !== 'number' || !Number.isInteger(visited) || visited < 0) {
    return { refused: 'VISITED_INVALID', why: 'visited is the count of nodes the walk reached, a whole number of at least 0' };
  }
  return { truncated: true, undetermined: true, why: WHY[/** @type {keyof typeof WHY} */ (reason)], visited };
}
