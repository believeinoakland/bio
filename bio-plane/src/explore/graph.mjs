// @ts-check
/* explore: the connection graph's read (R21; N1027, DEC-215 (2), K1469, K1487): what the record joins a centre to, one
   or two rings out. It is the one walk (walk.mjs) from the centre to depth `rings`, never a walker of its own (R15),
   its answer reshaped as nodes and steps: each step with its kind, the members' word for it, its grade and its citation
   as its owner answered them; and every place the walk stopped short, where what lies beyond is undetermined, not
   absent. Nodes and steps are in the order of the paths that reach them, never ranked (R16); nothing hidden from the
   viewer is answered or counted (R7); it writes nothing (R9). */
import { LOWEST_GRADE, isRecordId, orderPaths, exhausted } from '../connection-grammar/index.mjs';
import { checkWalkArgs, traverse, depthStop } from './walk.mjs';
import { refuse, isObj, DECLARED_MARK, HUNCH_MARK, NOT_ASSERTED } from './answer.mjs';

/** The sentence every stop carries (R21, K1469). */
export const STOPPED_SENTENCE = 'Where the walk stopped short, what lies beyond is undetermined, not absent.';
/** The rings a graph may be asked for (R21). */
export const RINGS = Object.freeze([1, 2]);

/** The id's kind as the id grammar reads it: its prefix, for a record id (R21). @param {string} id */
const idKindOf = (id) => (isRecordId(id) ? id.split('-')[0] : null);

/**
 * One step as the graph answers it (R21, R6): the members' word, the class, the grade and the citation as the owner
 * answered them; a declared step at the lowest grade, a hunch with none.
 * @param {any} registry @param {any} h
 */
function stepOf(registry, h) {
  const k = registry.kindOf(h.kind);
  const cls = k?.class ?? null;
  const grade = cls === 'declared' ? { assertion: LOWEST_GRADE, ends: [LOWEST_GRADE, LOWEST_GRADE] } : cls === 'hunch' ? null : h.grade;
  return {
    id: h.id, from: h.from, to: h.to, kind: h.kind, word: k?.word ?? null, class: cls, grade, evidence: h.evidence, valid: h.valid,
    ...(cls === 'declared' ? { label: DECLARED_MARK } : cls === 'hunch' ? { label: HUNCH_MARK } : {}),
    ...(cls === 'derived' ? { derived: h.derived } : {}),
    ...(h.backs !== undefined ? { backs: h.backs } : {}),
    ...(isObj(h.undetermined) ? { undetermined: h.undetermined } : {}),
  };
}

/**
 * neighbourhood({centre, at, rings?, kinds?, scope?, viewer}) (`op=exploregraph`).
 * @param {{registry: any, now: () => number, budget_ms: number}} ctx @param {any} arg
 */
export function neighbourhood(ctx, arg) {
  const a = isObj(arg) ? arg : {};
  const { centre, rings: _r, ...rest } = a;
  const k = checkWalkArgs(ctx.registry, { ...rest, from: centre, to: undefined, sortBy: undefined, depth: undefined }, 'centre');
  if (k.refusal) return k.refusal;
  const rings = a.rings === undefined || a.rings === null ? 2 : a.rings;
  if (!RINGS.includes(rings)) return refuse('BAD_RINGS', 'rings is 1 or 2: the graph shows the records one or two steps from the centre');
  const t = traverse(ctx, { from: centre, at: a.at, viewer: a.viewer, scope: a.scope ?? null, kinds: /** @type {string[]} */ (k.kinds), depth: rings });
  const s = t.r.s;
  const elapsed_ms = t.r.elapsed();
  const paths = /** @type {any[][]} */ (orderPaths(t.found));
  const nodes = [{ id: centre, ring: 0, id_kind: idKindOf(centre) }];
  const seenNode = new Set([centre]), seenStep = new Set(), steps = [];
  for (const hops of paths) {
    for (const h of hops) {
      if (!seenStep.has(h.id)) { seenStep.add(h.id); steps.push(stepOf(ctx.registry, h)); }
      for (const n of [h.from, h.to]) {
        if (seenNode.has(n) || !t.level.has(n)) continue;
        seenNode.add(n);
        nodes.push({ id: n, ring: /** @type {number} */ (t.level.get(n)), id_kind: idKindOf(n) });
      }
    }
  }
  const stopped = [
    ...t.atDepth.map((node) => ({ node, why: 'ring' })),
    ...s.hubs.map((h) => ({ node: h.node, why: 'hub', kind: h.kind, bound: h.bound, set_size: h.set_size })),
    ...s.fanout.map((f) => ({ node: f.node, why: 'fanout', ...(f.kind ? { kind: f.kind, bound: f.bound } : {}) })),
    ...(s.stop ? [{ node: s.stop_node, why: s.stop }] : []),
  ];
  return {
    ok: true, centre, at: a.at, rings, kinds: k.kinds, scope: a.scope ?? null, nodes, steps, stopped,
    ...(stopped.length ? { stopped_sentence: STOPPED_SENTENCE } : {}),
    ...depthStop(t.atDepth), owner_refusals: s.refusals,
    visited: t.visited, budget_ms: ctx.budget_ms, elapsed_ms, owner_calls: s.calls, complete: t.r.complete(), note: NOT_ASSERTED,
    ...(s.stop ? exhausted({ visited: t.visited, reason: s.stop }) : {}),
  };
}
