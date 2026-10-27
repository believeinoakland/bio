// @ts-check
/* explore: the names of the ends an answer lists (R25, R26, R29; entities R56). An answer states data only (K3665): the
   canonical label of the registered entity for an `ENT-` end, else `null`, never the id; a graph node is also named
   when it is an event (its kind and date) or a document (its title), each read from its owner for the viewer. Names are
   read once for each distinct end of what the answer lists, in reads of at most 500 ids, so a hop the viewer may not
   see names nothing (R7). */
import { isRecordId } from '../connection-grammar/index.mjs';
import { localize } from '../setup-words/index.mjs';
import { isObj } from './answer.mjs';

/** The most entity ids one `entities.labelsOf` read takes (entities R56); ends are read in reads of this size. */
export const LABELS_PER_READ = 500;

/** The id's kind as the id grammar reads it: its prefix, for a record id. @param {string} id */
export const idKindOf = (id) => (isRecordId(id) ? id.split('-')[0] : null);

/**
 * What `entities.labelsOf` answers for each `ENT-` id among `ids`, as a map to `{label, kind}`; an id the record holds
 * no name for, and any id that is not an entity, is absent. Distinct ids are read once.
 * @param {{entities?: any}} ctx @param {Iterable<string>} ids @param {any} viewer
 * @returns {Map<string, {label: any, kind: any}>}
 */
export function readEntities(ctx, ids, viewer) {
  const ents = [...new Set([...ids].filter((id) => idKindOf(id) === 'ENT'))];
  const known = new Map();
  const reader = typeof ctx.entities === 'function' ? ctx.entities() : ctx.entities;
  if (!reader || typeof reader.labelsOf !== 'function') return known;
  for (let i = 0; i < ents.length; i += LABELS_PER_READ) {
    const slice = ents.slice(i, i + LABELS_PER_READ);
    const got = reader.labelsOf({ ids: slice, viewer });
    const byId = got && typeof got === 'object' ? (got.labels ?? got) : {};
    for (const id of slice) if (isObj(byId[id])) known.set(id, byId[id]);
  }
  return known;
}

/**
 * The names R29 adds for the graph's nodes, as a map to `{label, kind: null}` like `readEntities`': an `EVT-` node's kind
 * in the Timeline's words (`screen.timeline.kind`) and its date as `events.readEvent` answers them for the viewer
 * ("{kind} · {date}", the kind alone when it holds none),
 * an `INFO-` node's document title as the `documents` reader's `titlesOf` answers it (reads of at most 500 ids). An end the
 * owner does not answer, or answers with its own id, is absent; no reader leaves every such node unnamed.
 * @param {{events?: any, documents?: any}} ctx @param {Iterable<string>} ids @param {any} viewer
 * @returns {Map<string, {label: string, kind: null}>}
 */
export function readNodeNames(ctx, ids, viewer) {
  const known = new Map();
  const distinct = [...new Set(ids)];
  const events = typeof ctx.events === 'function' ? ctx.events() : ctx.events;
  if (events && typeof events.readEvent === 'function') {
    for (const id of distinct.filter((i) => idKindOf(i) === 'EVT')) {
      const got = events.readEvent({ eventId: id, viewer });
      const e = got && got.ok && got.found ? got.event : null;
      if (!isObj(e) || typeof e.kind !== 'string' || e.kind === '') continue;
      const date = isObj(e.when) && typeof e.when.value === 'string' && e.when.value !== '' ? e.when.value : null;
      const kind = localize('screen.timeline.kind', '{kind}', { kind: e.kind });
      known.set(id, { label: date === null ? kind : localize('explore.label.event', '{kind} · {date}', { kind, date }), kind: null });
    }
  }
  const docs = typeof ctx.documents === 'function' ? ctx.documents() : ctx.documents;
  if (docs && typeof docs.titlesOf === 'function') {
    const infos = distinct.filter((i) => idKindOf(i) === 'INFO');
    for (let i = 0; i < infos.length; i += LABELS_PER_READ) {
      const slice = infos.slice(i, i + LABELS_PER_READ);
      const got = docs.titlesOf({ ids: slice, viewer });
      const byId = got && typeof got === 'object' ? (got.titles ?? got) : {};
      for (const id of slice) if (typeof byId[id] === 'string' && byId[id].trim() !== '') known.set(id, { label: byId[id], kind: null });
    }
  }
  return known;
}

/** A name: the entity's label when it holds one that is not its own id, else `null` (R25, R26). @param {Map<string, any>} known @param {string} id */
export function labelIn(known, id) {
  const label = known.get(id)?.label;
  return typeof label === 'string' && label !== '' && label !== id ? label : null;
}

/**
 * Each hop of `hops` with `from_label` and `to_label` (R26), the hop otherwise as its owner answered it. A hop shared by
 * several paths is named alike in each.
 * @param {any} ctx @param {any[]} hops @param {any} viewer
 */
export function nameEnds(ctx, hops, viewer) {
  const known = readEntities(ctx, hops.flatMap((h) => [h.from, h.to]), viewer);
  return (/** @type {any} */ h) => ({ ...h, from_label: labelIn(known, h.from), to_label: labelIn(known, h.to) });
}
