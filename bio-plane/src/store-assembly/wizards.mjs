/* plane R19 (N528; DEC-120, DEC-121 (5); K1396): the registration the plane makes with `wizard-scripts` at start (its
   R13), held apart from the class so the release suite reads the same parts without the Durable Object runtime; and
   R24's check of the one registry (`wizard-scripts`' `SCREEN_REGISTRY`), the registry `answers`' explain read is handed. */
import { CIVICSMITH_LIBRARY, SCREEN_REGISTRY, ADMIN_ACTS, ADMIN_SCREENS } from "../wizard-scripts/index.mjs";
import { MACHINE_REFUSALS, RUNGS } from "../op-grades/index.mjs";
import { OPS } from "../op-declarations/index.mjs";

/* R19 (N528; K1396): the labelled machine drafts the canon allows on a member's act, `case-authoring` R39's
   `whatchangedpropose` and `escalationreasondraft` (DEC-101's "what changed"), and (T34; DEC-152, DEC-153; K1818)
   `instance-setup` R65's `groupdescriptiondraft` and `wizard-scripts` R27's `writinghelp`, registered with
   `wizard-scripts`. */
/* (T45; K2880, K2881; wizard-scripts R13's T45 clause) the documentation of an infraction for one audience, the
   assistant's `infractiondraft` (agent-worker R76, declared by op-declarations R49); the chance-to-fix notice's draft has
   no op declared in T45, so it is not listed (an undeclared draft would be refused by wizard-scripts all the same). */
export const MACHINE_DRAFTS = Object.freeze(["whatchangedpropose", "escalationreasondraft", "groupdescriptiondraft", "writinghelp",
                                             "infractiondraft"]);

/** R19 (T34; DEC-153; K1818, K1907): the acts `op-grades` grades `irreversible` (its R1, R14), read from its `RUNGS` at
 *  registration, so the set follows the grading and is never a copy of it. */
export const irreversibleActs = (rungs = RUNGS) => Object.keys(rungs).filter((op) => rungs[op] === "irreversible");

/** R19 (N528; DEC-121 (5); T34, K1818): what the plane registers with `wizard-scripts` at start (its R13), and what the
 *  release suite holds `requiredFailures` empty for: the screen registry (`wizard-scripts`' `SCREEN_REGISTRY`, the design
 *  stream's `registry.json` it carries, so the required flows walk the registry's screens; K1869 (2)) and the Civicsmith
 *  library the bundle carries,
 *  the member op table (`op-declarations`), the acts a machine is refused (`op-grades`' `MACHINE_REFUSALS`, its R5), the
 *  labelled machine drafts and the irreversible acts (`wizard-scripts` R24's refused set); with `door`, the front door's
 *  finder (its R23).
 *  R57 (R085-34; K3531; wizard-scripts R40): and the administrator's acts and screens (`interface-shell`'s `ADMIN_ACTS` and
 *  `ADMIN_SCREENS`), so `startFrom` withholds the group-setup scripts from a viewer without `administer`. */
export const wizardRegistration = ({ door = null } = {}) => ({ screens: SCREEN_REGISTRY, ops: OPS,
  machineRefused: Object.keys(MACHINE_REFUSALS), machineDrafts: MACHINE_DRAFTS, irreversible: irreversibleActs(),
  library: CIVICSMITH_LIBRARY, adminActs: [...ADMIN_ACTS], adminScreens: [...ADMIN_SCREENS],
  /* (K2586; wizard-scripts R23) the front door's in-process finder (and pointer, once one is given), the plane's
     composition (`wiring.mjs`' `frontDoorFinder`); absent, `matches` is [] and the pointer null. */
  ...(door ? { door } : {}) });

/** R24 (T51): what the release suite holds empty: each screen of the registry whose shape is not `{id, name, purpose,
 *  acts}` (an id or name or purpose that is not a non-empty string, an id repeated, acts not a list of names, or a name
 *  repeated), and each act no spec in `ops` holds, as `{screen, problem, act?}`. A screen's `owed` acts are named apart and
 *  are not acts: an owed act with no op, a browser act among them, is no failure. */
export function screenFailures(screens = SCREEN_REGISTRY, ops = OPS) {
  const out = [], seen = new Set();
  const said = (v) => typeof v === "string" && v.trim() !== "";
  for (const s of Array.isArray(screens) ? screens : []) {
    const id = s && s.id;
    for (const f of ["id", "name", "purpose"]) if (!said(s && s[f])) out.push({ screen: id ?? null, problem: `no ${f}` });
    if (said(id) && seen.has(id)) out.push({ screen: id, problem: "id repeated" });
    seen.add(id);
    const acts = s && s.acts;
    if (!Array.isArray(acts)) { out.push({ screen: id ?? null, problem: "acts is not a list" }); continue; }
    if (new Set(acts).size !== acts.length) out.push({ screen: id, problem: "an act repeated" });
    for (const a of acts) if (!said(a) || !Object.hasOwn(ops, a)) out.push({ screen: id, problem: "no op spec", act: a });
  }
  return out;
}
