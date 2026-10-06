// @ts-check
/* explore (layer 5; T33-37; K1442, K1469, K1470, K1471, K1486, K1487): the one read across every owner of a
   relationship. A bounded, as-of exploration from a node over the owners registered with `connection-grammar`, each
   hop cited and graded in the one connection shape, the weakest hop governing; presets as kind sets; overlaps
   between two persons; re-deriving a derived connection; a timeline over a set. It writes nothing, asserts no
   connection, ranks nothing and records no one's exploring (R9, R16). The walk is synchronous on the instance's one
   thread, so its time budget is checked between owner calls. */
import { BOUNDS, defaultRegistry } from '../connection-grammar/index.mjs';
import { checkWalkArgs, walk } from './walk.mjs';
import { presets, chain, flowsFrom, relationsOf, pathBetween, overlaps } from './presets.mjs';
import { rederive } from './rederive.mjs';
import { timelineOver } from './timeline.mjs';
import { eventsOf } from '../events/index.mjs';
import { moneyOf } from '../money/index.mjs';

export { exploreOps } from './ops.mjs';
export { PRESET_RULES, OVERLAP_SENTENCE } from './presets.mjs';
export { PATH_ORDER, QUANTITY_OF_PATH } from './walk.mjs';
export { HUB_WORDS, PAGE_LIMIT } from './reader.mjs';
export { LEAD_SENTENCE } from './answer.mjs';

/** The time budget every exploration answers with (R5): connection-grammar's default, provisional until M-X1b. */
export const TIME_BUDGET_MS = BOUNDS.time_budget_ms;

/**
 * The explore instance for one host (K1563 (1)): `host` is passed to every owner's `neighbours` unchanged. `deps`:
 * `registry` the owner registry (the plane's default when absent); `events` and `money` the instances whose
 * `timeline` and `moneyOf` R13 composes (by default `eventsOf(host)` and `moneyOf(host)`, reached on first use); `now` a clock in milliseconds; `budget_ms` lowers the budget, never raises it.
 * @param {any} [host]
 * @param {{registry?: any, events?: any, money?: any, now?: () => number, budget_ms?: number}} [deps]
 */
export function exploreOf(host, deps = {}) {
  const budget = typeof deps.budget_ms === 'number' && deps.budget_ms > 0 ? Math.min(deps.budget_ms, TIME_BUDGET_MS) : TIME_BUDGET_MS;
  const c = { host, registry: deps.registry ?? defaultRegistry, now: deps.now ?? (() => performance.now()), budget_ms: budget,
    events: deps.events ?? (host ? () => eventsOf(host) : undefined), money: deps.money ?? (host ? () => moneyOf(host) : undefined) };
  return Object.freeze({
    /** explore({from, to?, kinds?, at, depth?, sortBy?, scope?, viewer}) (R1–R9). */
    explore(arg) {
      const k = checkWalkArgs(c.registry, arg);
      if (k.refusal) return k.refusal;
      const { from, to, at, sortBy, scope, viewer } = arg;
      return walk(c, { from, to: to ?? undefined, at, sortBy: sortBy ?? undefined, scope: scope ?? null, viewer,
        kinds: /** @type {string[]} */ (k.kinds), depth: /** @type {number} */ (k.depth) });
    },
    presets: () => presets(c.registry),
    chain: (a) => chain(c, a),
    flowsFrom: (a) => flowsFrom(c, a),
    relationsOf: (a) => relationsOf(c, a),
    pathBetween: (a) => pathBetween(c, a),
    overlaps: (a) => overlaps(c, a),
    rederive: (a) => rederive(c, a),
    timelineOver: (a) => timelineOver(c, a),
  });
}
