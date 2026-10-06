// @ts-check
/* connection-grammar: the bounds of every walk (R10) and the shape a walk answers when it stops at one (R15). No bound
   measures how connected a node is (R17): each limits work, never ranks. */

/** The walk bounds (K1470; legistar-events §6). `time_budget_ms` is a default every walk may lower. */
export const BOUNDS = Object.freeze({
  depth_default: 8,
  depth_max: 10,
  fanout: 1000,
  nodes: 5000,
  hub: 1000,
  time_budget_ms: 10000,
});

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
  hub: `the walk reached a hub (a node with more than ${BOUNDS.hub} connections), which is named, never expanded`,
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
