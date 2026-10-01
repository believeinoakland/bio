/* control-plane: the act gate's re-export for `legacy-index` (`src/index.mjs`' `op=affordances` and `op=queue` arms), the
   one importer outside the product modules left after the split (K617, K624 (1), (2)). What each op is — every spec, the
   act lists, the session sets, the capability table, the recorded decisions and the act gate — is `op-declarations`'. */
export { decorateAct, ACT_GATE } from "../op-declarations/index.mjs";
