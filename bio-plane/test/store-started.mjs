/* The store as the plane starts it (T12 B6 item 1; K414, INSTANCE-SETUP #1 J4/J5): legacy-index's `Store` export is
   legacy-store's class started with instance-setup, which registers promotion's `producingGroup` fact (R1). A suite
   that boots `src/store.mjs`'s class directly is refused FACT_UNAVAILABLE (C-102.4) at its fixture; a suite that
   drives the store's door as a Miniflare script points here instead (`script` + `scriptPath`). The default export is
   store.mjs's own. */
export { Store } from "../src/index.mjs";
export default { fetch(req, env) { return env.STORE.get(env.STORE.idFromName("bio")).fetch(req); } };
