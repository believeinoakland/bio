// @ts-check
/* connection-grammar: what an owner's `neighbours` answer must be, checked at the interface (R6, R8). A registry's
   `neighbours` and the conformance battery (R9) judge every answer by the same rules. Sight (R7) depends on the
   owner's own visibility, so only the battery, over the owner's fixture, can check it. */
import { validAt } from '../civil-time/index.mjs';
import { BOUNDS } from './bounds.mjs';
import { connectionErrors } from './shape.mjs';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const filled = (v) => typeof v === 'string' && v.trim() !== '';
const isThenable = (v) => v !== null && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';

/** Whether an answer is a refusal `{refused, why}`. @param {unknown} a */
export const isRefusal = (a) => isObj(a) && filled(a.refused);

/**
 * The failures of one answer of an owner's `neighbours`, each `{check, why}`; empty when it conforms.
 * @param {unknown} answer
 * @param {{owner: string, ownKinds: string[], kinds?: unknown, node: unknown, at: unknown, scope: unknown,
 *   kindOf: (k: string) => any}} ctx
 */
export function answerFailures(answer, ctx) {
  const out = [];
  const fail = (check, why) => out.push({ check, why });
  if (isThenable(answer)) return [{ check: 'answer', why: 'neighbours must answer synchronously' }];
  if (!isObj(answer) || !Array.isArray(answer.items)) return [{ check: 'answer', why: 'an answer is {items, next?, truncated?, hub?}' }];
  const { items } = answer;
  if (items.length > BOUNDS.fanout) fail('fanout', `a page holds at most ${BOUNDS.fanout} items; this one holds ${items.length}`);
  if (answer.hub !== undefined) {
    const h = answer.hub;
    if (!isObj(h) || !Number.isInteger(h.set_size) || !filled(h.why)) fail('hub', 'a hub is answered {set_size, why}');
    else if (h.set_size <= BOUNDS.hub) fail('hub', `a hub's set exceeds ${BOUNDS.hub}; ${h.set_size} does not`);
    if (items.length) fail('hub', 'a hub is answered with no items, never a partial set shown as whole');
  }
  const asked = Array.isArray(ctx.kinds) ? ctx.kinds : null;
  const seen = new Set();
  for (const item of items) {
    const name = isObj(item) && filled(item.id) ? item.id : '(an item without an id)';
    const errors = connectionErrors(item, ctx.kindOf);
    for (const e of errors) {
      const check = e.field === 'label' ? 'label' : e.field === 'id' && /derivedId/.test(e.why) ? 'derived_id' : 'shape';
      fail(check, `${name}: ${e.why}`);
    }
    if (!isObj(item)) continue;
    if (seen.has(item.id)) fail('paging', `${name} is answered twice on one page`);
    seen.add(item.id);
    if (item.owner !== ctx.owner || !ctx.ownKinds.includes(item.kind)) fail('kinds', `${name} is not of ${ctx.owner}'s own kinds`);
    else if (asked && !asked.includes(item.kind)) fail('kinds', `${name} is of kind ${item.kind}, which was not asked`);
    if (item.from !== ctx.node && item.to !== ctx.node) fail('node', `${name} does not have the node at either end`);
    if (errors.some((e) => e.field === 'valid')) continue;
    let v;
    try { v = validAt({ valid: item.valid, basis: item.basis }, ctx.at); } catch (e) { v = { undetermined: true, why: String(e?.message ?? e) }; }
    if (v === 'out') fail('at', `${name} is out at the date asked, so it is not returned`);
    else if (v === 'in') { if (item.undetermined !== undefined) fail('at', `${name} is in at the date asked, yet marked undetermined`); }
    else if (!isObj(item.undetermined) || !filled(item.undetermined.why)) fail('at', `${name} is undetermined at the date asked and is not marked undetermined: {why}`);
    if (ctx.kindOf(item.kind)?.class === 'hunch' && (ctx.scope === null || ctx.scope === undefined || item.scope !== ctx.scope)) {
      fail('scope', `${name} is a hunch returned outside the working inquiry that holds it`);
    }
  }
  return out;
}
