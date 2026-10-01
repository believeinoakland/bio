/* plane R6: the Worker's module. Its default export is `control-plane`'s door (`makeFetch`) over the hooks the door takes,
   each composed from the arms' owners' handlers (`door.mjs`); `Store` is the Durable Object class `wrangler.jsonc` binds
   (R1). The published read is handed its plane binding (`bindPublishedPlane`, public-read's) when this module loads. No
   other export. */
import { makeFetch, json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON, STORE_SILENT_DETAIL,
         PUBLISHED_STORE } from "../control-plane/index.mjs";
import { bindPublishedPlane } from "../publication/worker.mjs";
import { publicInstanceGroup } from "../setup.mjs";
import { publicOp, gatedOp } from "./door.mjs";

export { Store } from "./store.mjs";

bindPublishedPlane({ json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON,
                     STORE_SILENT_DETAIL, PUBLISHED_STORE });

export default { fetch: makeFetch({ publicOp, gatedOp,
  publicInstanceGroup: (env, storeName, projection) => publicInstanceGroup(env, storeName, projection, doAnswer) }) };
