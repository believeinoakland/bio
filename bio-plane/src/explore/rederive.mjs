// @ts-check
/* explore: re-deriving a derived connection (R12). The owner recomputes it, read through the registry as of its
   `as_of`; this module answers whether its deterministic id (`connection-grammar.derivedId`) equals the id asked,
   with the hops it rests on and whether any is declared or a hunch. It never guesses and writes nothing. */
import { derivedId } from '../connection-grammar/index.mjs';
import { kindsByOwner, makeReader } from './reader.mjs';
import { isObj, filled, viewerRefusal, nodeRefusal } from './answer.mjs';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const no = (why, extra = {}) => ({ ok: true, matches: false, why, ...extra });

/**
 * rederive({kind, from, to, as_of, method, id, viewer}).
 * @param {{registry: any, now: () => number, budget_ms: number}} ctx @param {any} arg
 */
export function rederive(ctx, arg) {
  const a = isObj(arg) ? arg : {};
  const r0 = viewerRefusal(a.viewer) || nodeRefusal(a.from, 'from', true) || nodeRefusal(a.to, 'to', true);
  if (r0) return r0;
  for (const f of ['kind', 'as_of', 'method', 'id']) if (!filled(a[f])) return no(`${f} is not stated, so the derivation cannot be recomputed`);
  const entry = ctx.registry.kindOf(a.kind);
  if (!entry) return no(`no owner registered the kind ${a.kind}`);
  if (entry.class !== 'derived') return no(`${a.kind} is of class ${entry.class}, not a derived kind`);
  const recomputed = derivedId({ kind: a.kind, from: a.from, to: a.to, as_of: a.as_of, method: a.method });
  // The owner is read as of the derivation's own date: a day is read in UTC, an instant as it is.
  const at = DAY.test(a.as_of) ? { value: a.as_of, precision: 'day', zone: 'UTC' } : a.as_of;
  const reader = makeReader(ctx, { at, viewer: a.viewer, scope: null });
  const items = reader.read(entry.owner, a.from, [a.kind]);
  if (!items) {
    const why = reader.s.refusals[0] ? `${entry.owner} refused: ${reader.s.refusals[0].why}` : reader.s.hubs[0] ? `${a.from} is ${reader.s.hubs[0].words}` : 'the read used its time budget';
    return no(why, { recomputed_id: recomputed });
  }
  const held = items.find((h) => h.kind === a.kind && isObj(h.derived) && h.derived.method === a.method && h.derived.as_of === a.as_of
    && ((h.from === a.from && h.to === a.to) || (h.from === a.to && h.to === a.from)));
  if (!held) return no(`${entry.owner} holds no ${a.kind} between ${a.from} and ${a.to} by ${a.method} as of ${a.as_of}`, { recomputed_id: recomputed });
  const rests = restsOn(ctx, reader, held, [a.from, a.to]);
  const matches = recomputed === a.id && held.id === recomputed;
  return {
    ok: true, matches, recomputed_id: recomputed, id: a.id, held_id: held.id, derivation: held.derived, rests_on: rests,
    declared_or_hunch: rests.some((r) => r.class === 'declared' || r.class === 'hunch'),
    ...(matches ? {} : { why: recomputed !== a.id ? 'the id asked is not the id its parameters derive' : 'the owner\'s held id is not the id its parameters derive' }),
  };
}

/** The inputs a derivation names, each with the class of the connection it is, where one at either end is it. */
function restsOn(ctx, reader, held, ends) {
  const inputs = Array.isArray(held.derived.inputs) ? held.derived.inputs : [];
  const byId = new Map();
  const kinds = ctx.registry.owners().flatMap((o) => o.kinds.map((k) => k.kind));
  for (const node of ends) {
    for (const [owner, ks] of kindsByOwner(ctx.registry, kinds)) {
      for (const h of reader.read(owner, node, ks) ?? []) byId.set(h.id, h);
    }
  }
  return inputs.map((input) => {
    const id = typeof input === 'string' ? input : isObj(input) ? input.id ?? input.source : null;
    const h = id ? byId.get(id) : undefined;
    return h ? { input: id, connection: h, class: ctx.registry.kindOf(h.kind)?.class ?? null } : { input: id ?? input, class: null };
  });
}
