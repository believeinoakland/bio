// @ts-check
/* explore (layer 5; T33-37; K1442, K1469, K1470, K1471, K1486, K1487): the one read across every owner of a
   relationship. A bounded, as-of exploration from a node over the owners registered with `connection-grammar`, each
   hop cited and graded in the one connection shape, the weakest hop governing; presets as kind sets; overlaps
   between two persons; the connection graph's read, a centre two rings out (R21); re-deriving a derived connection or
   a chain; a timeline over a set. It writes nothing, asserts no connection, ranks nothing and records no one's
   exploring (R9, R16). The walk is synchronous on the instance's one thread, so its time budget is checked between
   owner calls. */
import { BOUNDS, defaultRegistry } from '../connection-grammar/index.mjs';
import { checkWalkArgs, walk } from './walk.mjs';
import { presets, chain, flowsFrom, relationsOf, pathBetween, overlaps } from './presets.mjs';
import { rederive } from './rederive.mjs';
import { timelineOver } from './timeline.mjs';
import { neighbourhood } from './graph.mjs';
import { connectionsBetween, mostDirect, shorterThan, continueWalk } from './chains.mjs';
import { eventsOf } from '../events/index.mjs';
import { moneyOf } from '../money/index.mjs';
import { entitiesOf } from '../entities/index.mjs';

export { exploreOps } from './ops.mjs';
export { PRESET_RULES, OVERLAP_SENTENCE } from './presets.mjs';
export { PATH_ORDER, QUANTITY_OF_PATH, DEPTH_SENTENCE, AT_DEPTH_MAX, STEP_SOURCE } from './walk.mjs';
export { STOPPED_SENTENCE, RINGS } from './graph.mjs';
export { HUB_WORDS } from './reader.mjs';
export { LEAD_SENTENCE } from './answer.mjs';
export { INPUT_NOT_READ, CHAIN_MAX } from './rederive.mjs';
export { budgetMsOf, CHAIN_BUDGET_MS, RESUME_TTL_MS, RESUME_MAX } from './chains.mjs';

/** The time budget every exploration answers with (R5): connection-grammar's default, provisional until M-X1b. */
export const TIME_BUDGET_MS = BOUNDS.time_budget_ms;

/**
 * The explore instance for one host (K1563 (1)): `host` is passed to every owner's `neighbours` unchanged. `deps`:
 * `registry` the owner registry (the plane's default when absent); `events` and `money` the instances whose
 * `timeline` and `moneyOf` R13 composes (by default `eventsOf(host)` and `moneyOf(host)`, reached on first use), `entities` the instance whose `labelsOf` names R25's nodes (by default `entitiesOf(host)`), `documents` the reader whose `titlesOf({ids, viewer})` names R29's document nodes (none by default: they stay unnamed); `now` a clock in milliseconds; `wall` the clock a resume token's age is read on (milliseconds since the epoch; by default `now` when one is given, else the wall clock); `budget_ms` lowers the budget, never raises it.
 * @param {any} [host]
 * @param {{registry?: any, events?: any, money?: any, entities?: any, documents?: any, now?: () => number, wall?: () => number, budget_ms?: number}} [deps]
 */
export function exploreOf(host, deps = {}) {
  const budget = typeof deps.budget_ms === 'number' && deps.budget_ms > 0 ? Math.min(deps.budget_ms, TIME_BUDGET_MS) : TIME_BUDGET_MS;
  const c = { host, registry: deps.registry ?? defaultRegistry, now: deps.now ?? (() => performance.now()), wall: deps.wall ?? deps.now ?? (() => Date.now()), budget_ms: budget,
    events: deps.events ?? (host ? () => eventsOf(host) : undefined), money: deps.money ?? (host ? () => moneyOf(host) : undefined),
    entities: deps.entities ?? (host ? () => entitiesOf(host) : undefined), documents: deps.documents };
  return Object.freeze({
    /** explore({from, to?, kinds?, at, depth?, sortBy?, scope?, viewer}) (R1–R9). */
    explore(arg) {
      const k = checkWalkArgs(c.registry, arg);
      if (k.refusal) return k.refusal;
      const { from, to, at, sortBy, scope, viewer } = arg;
      return walk(c, { from, to: to ?? undefined, at, sortBy: sortBy ?? undefined, scope: scope ?? null, viewer,
        kinds: /** @type {string[]} */ (k.kinds), depth: /** @type {number} */ (k.depth) });
    },
    /** neighbourhood({centre, at, rings?, kinds?, scope?, viewer}) (R21): the connection graph's read. */
    neighbourhood: (a) => neighbourhood(c, a),
    presets: () => presets(c.registry),
    chain: (a) => chain(c, a),
    flowsFrom: (a) => flowsFrom(c, a),
    relationsOf: (a) => relationsOf(c, a),
    pathBetween: (a) => pathBetween(c, a),
    overlaps: (a) => overlaps(c, a),
    rederive: (a) => rederive(c, a),
    timelineOver: (a) => timelineOver(c, a),
    /** The chains between two ends (R30-R33). */
    connectionsBetween: (a) => connectionsBetween(c, a),
    mostDirect: (a) => mostDirect(c, a),
    shorterThan: (a) => shorterThan(c, a),
    continueWalk: (a) => continueWalk(c, a),
  });
}
