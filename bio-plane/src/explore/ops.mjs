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
