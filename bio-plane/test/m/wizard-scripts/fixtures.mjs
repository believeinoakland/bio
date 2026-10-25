/* Fixtures wizard-scripts publishes (K4990, K5046): each is made by the real code when it is called, never stored. */
import { seeded, V } from "./fixture.mjs";

/** The real NO_SUCH_WIZARD refusal of `wizardRead` for an id no script holds. */
export const noSuchWizard = () => seeded().wz.wizardRead({ script: "WIZ-0000000000000000", viewer: V("alice") });
