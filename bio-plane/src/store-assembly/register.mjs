/* store-assembly R83 (was plane R68; K4168): THE START'S REGISTRATION. Importing this module hands every owner's op
   declarations, and the assembly's own, to `op-declarations` and `op-grades` once (`declarations.mjs`), so it is the first
   import of the assembly (`assemble.mjs`) and, once plane takes it from here (Wave B), of the Worker's entry: the
   registrations are refused once any table either keeps has been read, and `control-plane` reads them when it loads. A
   duplicate op or a row that disagrees with a hand row throws here, naming the op, so the start stops. */
import { assembleDeclaredOps } from "./declarations.mjs";

assembleDeclaredOps();
