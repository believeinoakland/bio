// @ts-check
/* explore: the op handlers the control plane routes to (R14), reads only: `explore`, `explorepreset`,
   `exploreverify` (one derived connection, or a `chain`, R23), `exploretimeline` and `exploregraph` (R21). The viewer comes from the query string, where the control plane stamped it,
   never from the body (a body field a caller can fill is a name a machine can post). */
import { refuse, isObj } from './answer.mjs';
import { localize } from '../setup-words/index.mjs';

const PRESET_NAMES = ['presets', 'chain', 'flowsFrom', 'relationsOf', 'pathBetween', 'overlaps'];

/** @param {any} explore an instance from `exploreOf` @param {URL} url @param {any} body */
export function exploreOps(explore, url, body) {
  const viewer = url.searchParams.get('viewer');
  const b = isObj(body) ? body : {};
  const { viewer: _ignored, ...args } = b;
  return {
    explore: () => explore.explore({ ...args, viewer }),
    explorepreset: () => {
      const name = args.preset ?? url.searchParams.get('preset');
      if (!PRESET_NAMES.includes(name)) return refuse('UNKNOWN_PRESET', localize('explore.ops.a_preset_is_one_of', 'a preset is one of {PRESET_NAMES}', { PRESET_NAMES: String(PRESET_NAMES.join(', ')) }));
      const { preset: _p, ...rest } = args;
      return name === 'presets' ? explore.presets() : explore[name]({ ...rest, viewer });
    },
    exploreverify: () => explore.rederive({ ...args, viewer }),
    exploretimeline: () => explore.timelineOver({ ...args, viewer }),
    exploregraph: () => explore.neighbourhood({ ...args, viewer }),
  };
}

/* R27 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  explore: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("explore.declared.explore", "read: the paths from a node over the registered kinds as of a date, each hop cited and graded, within the bounds; writes nothing"),
    fields: { accepts: ["from","to","kinds","at","depth","sortBy","scope"], requires: ["from","at"] } },
  explorepreset: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("explore.declared.explorepreset", "read: one preset walk — chain, flows, relations, a path between two nodes, overlaps — or the presets; writes nothing"),
    fields: { accepts: ["preset","from","to","event","at","period","depth","a","b","kinds"], requires: ["preset"] } },
  /* R28 (T51; K4206): a chain, or one derivation's ends. A derivation missing its kind, date, method or id is answered `matches: false`
     with the reason (R12), uniformly, so those four are not required: the reason names the field. */
  exploreverify: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("explore.declared.exploreverify", "read: whether a derived connection re-derives to its id, and which hops it rests on; writes nothing"),
    fields: { accepts: ["chain","from","to","kind","as_of","method","id","scope"], requires: [["from","chain"],["to","chain"]] } },
});
