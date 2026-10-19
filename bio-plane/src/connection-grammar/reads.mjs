// @ts-check
/* connection-grammar: what an owner's `neighbours` answer must be, checked at the interface (R6, R8, R20). A registry's
   `neighbours` and the conformance battery (R9) judge every answer by the same rules. Sight (R7) depends on the
   owner's own visibility, so only the battery, over the owner's fixture, can check it. */
import { validAt, reasonText } from '../civil-time/index.mjs';
import { BOUNDS, hubBoundOf } from './bounds.mjs';
import { connectionErrors } from './shape.mjs';
import { word, localize, hasWord } from '../setup-words/index.mjs';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const filled = (v) => typeof v === 'string' && v.trim() !== '';
const isThenable = (v) => v !== null && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const ID = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/;

/** R6 (civil-time R30): an undetermined `why` is a `{key, vars}`, its key a word the list fills with those vars, or
 *  a localize id (any dotted id, not held by the list), with vars an object. Never throws. */
function reasonFills(why) {
  if (!isObj(why) || !filled(why.key) || !ID.test(why.key) || !isObj(why.vars)) return false;
  if (!hasWord(why.key)) return true;
  try { word(why.key, why.vars); return true; } catch { return false; }
}

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
  if (!isObj(answer) || !Array.isArray(answer.items)) return [{ check: 'answer', why: 'an answer is {items, next?, truncated?, hub?, unread?}' }];
  const { items } = answer;
  // R20: what the owner holds for the node as a table and did not read, each {what, why}; optional.
  if (answer.unread !== undefined) {
    const u = answer.unread;
    if (!Array.isArray(u) || u.some((e) => !isObj(e) || !filled(e.what) || !filled(e.why))) {
      fail('unread', localize('connection-grammar.reads.unread_shape', 'unread is a list of entries, each with a non-empty what and a non-empty why'));
    }
  }
  if (items.length > BOUNDS.fanout) fail('fanout', localize('connection-grammar.reads.a_page_holds_at_most', 'a page holds at most {fanout} items; this one holds {length}', { fanout: String(BOUNDS.fanout), length: String(items.length) }));
  const asked = Array.isArray(ctx.kinds) ? ctx.kinds : null;
  if (answer.hub !== undefined) {
    // R6, R10: a hub is a node whose set of one kind exceeds that kind's bound. The answer names no kind, so its set
    // must exceed the least bound of the owner's kinds that were asked.
    const h = answer.hub;
    const mine = ctx.ownKinds.filter((k) => !asked || asked.includes(k));
    const pool = mine.length ? mine : ctx.ownKinds;
    const bound = pool.length ? Math.min(...pool.map(hubBoundOf)) : BOUNDS.hub;
    if (!isObj(h) || !Number.isInteger(h.set_size) || !filled(h.why)) fail('hub', 'a hub is answered {set_size, why}');
    else if (h.set_size <= bound) fail('hub', localize('connection-grammar.reads.a_hubs_set_of_one', 'a hub\'s set of one kind exceeds that kind\'s bound, here at least {bound}; {set_size} does not', { bound: String(bound), set_size: String(h.set_size) }));
    if (items.length) fail('hub', localize('connection-grammar.reads.hub_with_items', 'a hub is answered with no items, never a partial set shown as whole'));
  }
  const seen = new Set();
  for (const item of items) {
    const name = isObj(item) && filled(item.id) ? item.id : word('connection-grammar.item_without');
    const errors = connectionErrors(item, ctx.kindOf);
    for (const e of errors) {
      const check = e.field === 'label' ? 'label' : e.field === 'id' && /derivedId/.test(e.why) ? 'derived_id' : 'shape';
      fail(check, `${name}: ${e.why}`);
    }
    if (!isObj(item)) continue;
    if (seen.has(item.id)) fail('paging', localize('connection-grammar.reads.name_is_answered_twice_on', '{name} is answered twice on one page', { name: String(name) }));
    seen.add(item.id);
    if (item.owner !== ctx.owner || !ctx.ownKinds.includes(item.kind)) fail('kinds', localize('connection-grammar.reads.name_is_not_of_owner', '{name} is not of {owner}\'s own kinds', { name: String(name), owner: String(ctx.owner) }));
    else if (asked && !asked.includes(item.kind)) fail('kinds', localize('connection-grammar.reads.name_is_of_kind_kind', '{name} is of kind {kind}, which was not asked', { name: String(name), kind: String(item.kind) }));
    if (item.from !== ctx.node && item.to !== ctx.node) fail('node', localize('connection-grammar.reads.name_does_not_have_the', '{name} does not have the node at either end', { name: String(name) }));
    if (errors.some((e) => e.field === 'valid')) continue;
    let v;
    try { v = validAt({ valid: item.valid, basis: item.basis }, ctx.at); } catch (e) { v = { undetermined: true, why: String(e?.message ?? e) }; }
    if (v === 'out') fail('at', localize('connection-grammar.reads.name_is_out_at_the', '{name} is out at the date asked, so it is not returned', { name: String(name) }));
    else if (v === 'in') { if (item.undetermined !== undefined) fail('at', localize('connection-grammar.reads.name_is_in_at_the', '{name} is in at the date asked, yet marked undetermined', { name: String(name) })); }
    else if (!isObj(item.undetermined)) fail('at', localize('connection-grammar.reads.name_is_undetermined_at_the', '{name} is undetermined at the date asked and is not marked undetermined: {why}', { name: String(name), why: reasonText(v.why) }));
    else if (!reasonFills(item.undetermined.why)) fail('at', localize('connection-grammar.reads.reason_not_filled', '{name} is marked undetermined, but its reason is not a key with the vars the word list fills, nor a localize id', { name: String(name) }));
    if (ctx.kindOf(item.kind)?.class === 'hunch' && (ctx.scope === null || ctx.scope === undefined || item.scope !== ctx.scope)) {
      fail('scope', localize('connection-grammar.reads.name_is_a_hunch_returned', '{name} is a hunch returned outside the working inquiry that holds it', { name: String(name) }));
    }
  }
  return out;
}
