// @ts-check
/* explore: re-deriving a derived connection (R12, R19). The owner recomputes it, read through the registry as of its
   `as_of`; this module answers whether its deterministic id (`connection-grammar.derivedId`) equals the id asked,
   with the hops it rests on and whether any is declared or a hunch. The derivation's ends, and the hops its inputs
   name, are read with the leg's inquiry as `scope`, so a hunch of that inquiry the viewer may see is reported as a
   hunch; an input naming a hop that is not read is undetermined, and the answer is then never a match. It never
   guesses and writes nothing. Over a `chain` (R23), each derived step is re-derived so, and each other step cited. */
import { derivedId, isRecordId, chainLabel, DECLARED_LABEL, HUNCH_LABEL } from '../connection-grammar/index.mjs';
import { kindsByOwner, makeReader } from './reader.mjs';
import { isObj, filled, refuse, viewerRefusal, nodeRefusal } from './answer.mjs';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DERIVED_ID = /^[0-9a-f]{64}$/;
const no = (why, extra = {}) => ({ ok: true, matches: false, why, ...extra });

/** Why an input naming a hop is not read: one reason, whether it is not held, withheld or a hunch outside scope (R7, R19). */
export const INPUT_NOT_READ = 'no connection by this id is read at either end of the derivation for this viewer within this scope, so what it rests on is not settled';

/**
 * rederive({kind, from, to, as_of, method, id, scope?, viewer}).
 * @param {{registry: any, now: () => number, budget_ms: number}} ctx @param {any} arg
 */
export function rederive(ctx, arg) {
  const a = isObj(arg) ? arg : {};
  if (a.chain !== undefined) return rederiveChain(ctx, a);
  return rederiveOne(ctx, a);
}

/** One derived connection (R12, R19). @param {{registry: any, now: () => number, budget_ms: number}} ctx @param {any} a */
function rederiveOne(ctx, a) {
  const r0 = viewerRefusal(a.viewer) || nodeRefusal(a.from, 'from', true) || nodeRefusal(a.to, 'to', true);
  if (r0) return r0;
  if (a.scope !== undefined && a.scope !== null && !(isObj(a.scope) && filled(a.scope.inquiry))) {
    return refuse('BAD_SCOPE', 'a scope is {inquiry}: the inquiry the leg naming the derived connection belongs to');
  }
  const scope = a.scope ? a.scope.inquiry : null;
  for (const f of ['kind', 'as_of', 'method', 'id']) if (!filled(a[f])) return no(`${f} is not stated, so the derivation cannot be recomputed`);
  const entry = ctx.registry.kindOf(a.kind);
  if (!entry) return no(`no owner registered the kind ${a.kind}`);
  if (entry.class !== 'derived') return no(`${a.kind} is of class ${entry.class}, not a derived kind`);
  const recomputed = derivedId({ kind: a.kind, from: a.from, to: a.to, as_of: a.as_of, method: a.method });
  // The owner is read as of the derivation's own date: a day is read in UTC, an instant as it is.
  const at = DAY.test(a.as_of) ? { value: a.as_of, precision: 'day', zone: 'UTC' } : a.as_of;
  const reader = makeReader(ctx, { at, viewer: a.viewer, scope });
  const items = reader.read(entry.owner, a.from, [a.kind]);
  if (!items) {
    const why = reader.s.refusals[0] ? `${entry.owner} refused: ${reader.s.refusals[0].why}` : reader.s.hubs[0] ? `${a.from} is ${reader.s.hubs[0].words}` : 'the read used its time budget';
    return no(why, { recomputed_id: recomputed });
  }
  const held = items.find((h) => h.kind === a.kind && isObj(h.derived) && h.derived.method === a.method && h.derived.as_of === a.as_of
    && ((h.from === a.from && h.to === a.to) || (h.from === a.to && h.to === a.from)));
  if (!held) return no(`${entry.owner} holds no ${a.kind} between ${a.from} and ${a.to} by ${a.method} as of ${a.as_of}`, { recomputed_id: recomputed });
  const rests = restsOn(ctx, reader, held, [a.from, a.to]);
  const undetermined = rests.filter((r) => r.undetermined);
  const idsMatch = recomputed === a.id && held.id === recomputed;
  const matches = idsMatch && !undetermined.length;
  const why = !idsMatch ? (recomputed !== a.id ? 'the id asked is not the id its parameters derive' : 'the owner\'s held id is not the id its parameters derive')
    : undetermined.length ? `${undetermined.length} of the hops it rests on ${undetermined.length === 1 ? 'is' : 'are'} not read, so it cannot be re-derived` : null;
  return {
    ok: true, matches, recomputed_id: recomputed, id: a.id, held_id: held.id, derivation: held.derived, scope: a.scope ?? null, rests_on: rests,
    declared_or_hunch: rests.some((r) => r.class === 'declared' || r.class === 'hunch'),
    ...(undetermined.length ? { undetermined: true } : {}),
    ...(why ? { why } : {}),
  };
}

/**
 * What one input names (R19): an end of the derivation, a cited record or value, or a hop. An object input names a hop
 * by its `connection` or `id`; any other object (`{entity}`, `{end, capture}`, `{source}`) a record. A string input
 * names a hop when it is a record id or a derived id; any other string (an occurrence key) is a value the method names.
 */
function inputOf(input, ends) {
  if (isObj(input)) {
    const id = [input.connection, input.id].find(filled);
    return id ? { id, hop: !ends.includes(id) } : { id: null, hop: false };
  }
  if (!filled(input)) return { id: null, hop: false };
  if (ends.includes(input)) return { id: input, hop: false };
  return { id: input, hop: isRecordId(input) || DERIVED_ID.test(input) };
}

/** The inputs a derivation names, each hop read among the connections at its two ends with the reader's scope (R12, R19). */
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
    const { id, hop } = inputOf(input, ends);
    const h = id ? byId.get(id) : undefined;
    if (h) return { input: id, connection: h, class: ctx.registry.kindOf(h.kind)?.class ?? null };
    if (hop) return { input: id, class: null, undetermined: true, why: INPUT_NOT_READ };
    return { input: id ?? input, class: null };
  });
}

/** The most hops a chain may hold (R23): a path's depth at most. */
export const CHAIN_MAX = 10;
const DERIVED_FIELDS = ['kind', 'from', 'to', 'as_of', 'method', 'id'];

/**
 * One hop of a chain, by its form (R23): a derived connection's parameters, a hop of another class, or neither.
 * @param {any} registry @param {unknown} h
 */
function formOf(registry, h) {
  if (!isObj(h)) return null;
  const cls = filled(h.kind) ? registry.kindOf(h.kind)?.class ?? null : null;
  if (filled(h.method) || filled(h.as_of)) {
    return DERIVED_FIELDS.every((f) => filled(h[f])) && isRecordId(h.from) && isRecordId(h.to) ? 'derived' : null;
  }
  if (!filled(h.id) || !filled(h.kind) || !filled(h.owner) || cls === 'derived') return null;
  return 'other';
}

/**
 * rederive over a chain (R23): each derived hop re-derived as R12 and R19 say, with the scope passed to every owner;
 * each other hop cited, not recomputed. A match only when every derived hop matches and none is undetermined.
 * @param {{registry: any, now: () => number, budget_ms: number}} ctx @param {any} a
 */
function rederiveChain(ctx, a) {
  const v = viewerRefusal(a.viewer);
  if (v) return v;
  if (a.scope !== undefined && a.scope !== null && !(isObj(a.scope) && filled(a.scope.inquiry))) {
    return refuse('BAD_SCOPE', 'a scope is {inquiry}: the inquiry the leg naming the chain belongs to');
  }
  const chain = a.chain;
  if (!Array.isArray(chain) || chain.length < 1 || chain.length > CHAIN_MAX) {
    return refuse('BAD_CHAIN', `a chain is a path's steps in order, 1 to ${CHAIN_MAX}`);
  }
  const forms = chain.map((h) => formOf(ctx.registry, h));
  const bad = forms.indexOf(null);
  if (bad !== -1) {
    return refuse('BAD_CHAIN', `step ${bad + 1} is neither a derived connection's parameters {kind, from, to, as_of, method, id} nor a step of another class {id, kind, owner}`);
  }
  for (let i = 1; i < chain.length; i++) {
    const p = chain[i - 1], h = chain[i];
    if (![p.from, p.to, h.from, h.to].every(filled)) continue; // a step that states no ends cannot be shown apart
    if (![p.from, p.to].some((n) => n === h.from || n === h.to)) {
      return refuse('CHAIN_BROKEN', `step ${i + 1} shares no record with step ${i}`);
    }
  }
  const hops = chain.map((h, i) => {
    if (forms[i] === 'derived') {
      const { kind, from, to, as_of, method, id } = h;
      return { rederived: true, ...rederiveOne(ctx, { kind, from, to, as_of, method, id, scope: a.scope ?? null, viewer: a.viewer }) };
    }
    const k = ctx.registry.kindOf(h.kind);
    if (!k) return { id: h.id, rederived: false, class: null, undetermined: true, why: `no owner registered the kind ${String(h.kind).slice(0, 60)}` };
    if (k.owner !== h.owner) return { id: h.id, rederived: false, class: k.class, undetermined: true, why: `the kind ${h.kind} is ${k.owner}'s, not ${String(h.owner).slice(0, 60)}'s` };
    return { id: h.id, rederived: false, class: k.class };
  });
  const labelled = chain.map((h, i) => {
    const cls = forms[i] === 'derived' ? 'derived' : ctx.registry.kindOf(h.kind)?.class;
    return { id: h.id, label: cls === 'declared' ? DECLARED_LABEL : cls === 'hunch' ? HUNCH_LABEL : null };
  });
  const lead = chainLabel(labelled).label === 'lead';
  const undetermined = hops.some((h) => h.undetermined === true);
  const matches = !undetermined && hops.every((h) => !h.rederived || h.matches === true);
  return { ok: true, matches, lead, hops, scope: a.scope ?? null, ...(undetermined ? { undetermined: true } : {}) };
}
