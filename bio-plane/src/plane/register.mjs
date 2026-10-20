/* plane R68 (T51 fix round; K4168): THE START'S REGISTRATION. Importing this module hands every owner's op declarations, and
   the plane's own, to `op-declarations` and `op-grades` once (`declarations.mjs`), so it is the first import of both
   entries of the plane's graph, `index.mjs` (the Worker's) and `store.mjs` (the class's): the registrations are refused once
   any table either keeps has been read, and `control-plane` reads them when it loads, which `index.mjs` imports before
   `store.mjs`. A duplicate op or a row that disagrees with a hand row throws here, naming the op, so the start stops. */
import { assembleDeclaredOps } from "./declarations.mjs";

assembleDeclaredOps();
