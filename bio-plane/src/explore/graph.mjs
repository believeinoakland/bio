// @ts-check
/* explore: the connection graph's read (R21; N1027, DEC-215 (2), K1469, K1487): what the record joins a centre to, one
   or two rings out. It is the one walk (walk.mjs) from the centre to depth `rings`, never a walker of its own (R15),
   its answer reshaped as nodes and steps: each step with its kind, the members' word for it, its grade and its citation
   as its owner answered them; and every place the walk stopped short, where what lies beyond is undetermined, not
   absent. Nodes and steps are in the order of the paths that reach them, never ranked (R16); nothing hidden from the
   viewer is answered or counted (R7); it writes nothing (R9). */
import { LOWEST_GRADE, orderPaths, exhausted } from '../connection-grammar/index.mjs';
import { checkWalkArgs, traverse, depthStop } from './walk.mjs';
import { readEntities, labelIn, idKindOf } from './labels.mjs';
import { refuse, isObj, DECLARED_MARK, HUNCH_MARK, NOT_ASSERTED } from './answer.mjs';
import { word } from '../setup-words/index.mjs';

/** The sentence every stop carries (R21, K1469). */
export const STOPPED_SENTENCE = word('explore.stopped_sentence');
/** The rings a graph may be asked for (R21). */
export const RINGS = Object.freeze([1, 2]);

/**
 * Each node's `label` and `entity_kind` (R25): an `ENT-` node's canonical label and kind as `entities` answers them,
 * `null` for any other node and for an entity the record holds no name for. A node's label is never its id.
 * @param {Map<string, any>} known @param {{id: string, ring: number, id_kind: string | null}[]} nodes
 */
function named(known, nodes) {
  return nodes.map((n) => ({ ...n, label: labelIn(known, n.id), entity_kind: n.id_kind === 'ENT' ? (known.get(n.id)?.kind ?? null) : null }));
}

/**
 * One step as the graph answers it (R21, R6): the members' word, the class, the grade and the citation as the owner
 * answered them; a declared step at the lowest grade, a hunch with none; its two ends' names (R26).
 * @param {any} registry @param {any} h @param {Map<string, any>} known
 */
function stepOf(registry, h, known) {
  const k = registry.kindOf(h.kind);
  const cls = k?.class ?? null;
  const grade = cls === 'declared' ? { assertion: LOWEST_GRADE, ends: [LOWEST_GRADE, LOWEST_GRADE] } : cls === 'hunch' ? null : h.grade;
  return {
    id: h.id, from: h.from, to: h.to, from_label: labelIn(known, h.from), to_label: labelIn(known, h.to), kind: h.kind, word: k?.word ?? null, class: cls, grade, evidence: h.evidence, valid: h.valid,
    ...(cls === 'declared' ? { label: DECLARED_MARK } : cls === 'hunch' ? { label: HUNCH_MARK } : {}),
    ...(cls === 'derived' ? { derived: h.derived } : {}),
    ...(h.backs !== undefined ? { backs: h.backs } : {}),
    ...(h.attached_by !== undefined ? { attached_by: h.attached_by } : {}),
    ...(h.at !== undefined ? { at: h.at } : {}),
    ...(isObj(h.undetermined) ? { undetermined: h.undetermined } : {}),
  };
}

/**
 * neighbourhood({centre, at, rings?, kinds?, scope?, viewer}) (`op=exploregraph`).
 * @param {{registry: any, now: () => number, budget_ms: number, entities?: any}} ctx @param {any} arg
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
  const seenNode = new Set([centre]), seenStep = new Set(), hops = [];
  for (const path of paths) {
    for (const h of path) {
      if (!seenStep.has(h.id)) { seenStep.add(h.id); hops.push(h); }
      for (const n of [h.from, h.to]) {
        if (seenNode.has(n) || !t.level.has(n)) continue;
        seenNode.add(n);
        nodes.push({ id: n, ring: /** @type {number} */ (t.level.get(n)), id_kind: idKindOf(n) });
      }
    }
  }
  // Names are read once for each distinct end of the nodes and steps listed (R25, R26), in bounded reads.
  const known = readEntities(ctx, [...nodes.map((n) => n.id), ...hops.flatMap((h) => [h.from, h.to])], a.viewer);
  const steps = hops.map((h) => stepOf(ctx.registry, h, known));
  const stopped = [
    ...t.atDepth.map((node) => ({ node, why: 'ring' })),
    ...s.hubs.map((h) => ({ node: h.node, why: 'hub', kind: h.kind, bound: h.bound, set_size: h.set_size })),
    ...s.fanout.map((f) => ({ node: f.node, why: 'fanout', ...(f.kind ? { kind: f.kind, bound: f.bound } : {}) })),
    ...(s.stop ? [{ node: s.stop_node, why: s.stop }] : []),
  ];
  return {
    ok: true, centre, at: a.at, rings, kinds: k.kinds, scope: a.scope ?? null, nodes: named(known, nodes), steps, stopped,
    ...(stopped.length ? { stopped_sentence: STOPPED_SENTENCE } : {}),
    ...depthStop(t.atDepth), owner_refusals: s.refusals,
    visited: t.visited, budget_ms: ctx.budget_ms, elapsed_ms, owner_calls: s.calls, complete: t.r.complete(), note: NOT_ASSERTED,
    ...(s.stop ? exhausted({ visited: t.visited, reason: s.stop }) : {}),
  };
}
