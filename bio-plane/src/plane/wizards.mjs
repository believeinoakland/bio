/* plane R19 (N528; DEC-120, DEC-121 (5); K1396): the registration the plane makes with `wizard-scripts` at start (its
   R13), held apart from the class so the release suite reads the same parts without the Durable Object runtime. */
import { CIVICSMITH_LIBRARY } from "../wizard-scripts/index.mjs";
import { MACHINE_REFUSALS } from "../affordances.mjs";
import { OPS } from "../op-declarations/index.mjs";
import { SCREENS } from "./screens.mjs";

/* R19 (N528; K1396): the labelled machine drafts the canon already allows on a member's act, `case-authoring` R39's
   `whatchangedpropose` and `escalationreasondraft` (DEC-101's "what changed"), registered with `wizard-scripts`. */
export const MACHINE_DRAFTS = Object.freeze(["whatchangedpropose", "escalationreasondraft"]);

/** R19 (N528; DEC-121 (5)): what the plane registers with `wizard-scripts` at start (its R13), and what the release
 *  suite holds `requiredFailures` empty for: the screen registry and the Civicsmith library the bundle carries, the
 *  member op table (`op-declarations`), the acts a machine is refused (`affordances`' `MACHINE_REFUSALS`) and the
 *  labelled machine drafts. */
export const wizardRegistration = () => ({ screens: SCREENS, ops: OPS, machineRefused: Object.keys(MACHINE_REFUSALS),
                                           machineDrafts: MACHINE_DRAFTS, library: CIVICSMITH_LIBRARY });
