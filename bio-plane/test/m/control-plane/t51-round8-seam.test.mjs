/* control-plane (fix round 8; K4817; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE ROUND'S WALKER CASES THROUGH THE REAL PLANE, in ONE file. The sections live in `r8-seam-capture.mjs`
   (A, A1b, A2: an enrolled member's large capture listed from the press to the delivery, the watch ending in the finished line, a held-elsewhere delivery ending in words; the
   alarm-delivered halves of G108/G109) and `r8-seam-misc.mjs` (F: a prepared edition's Sign step after a reload; C: a table declared from the file's bytes; Q: the Queue count
   through the counting door, G115/G116), each a member's own acts over the Worker, object, alarm and R2 under Miniflare. The no-tick control of G106 is `r8-door-phases.test.mjs`. */
import "../../sandbox.mjs";
import { after } from "node:test";
import { makeKit } from "./r8-kit.mjs";
import { sections as capture } from "./r8-seam-capture.mjs";
import { sections as misc } from "./r8-seam-misc.mjs";

const kit = makeKit({ tag: "r8seam" });
const counting = makeKit({ tag: "r8seamc", counting: true });
after(() => { kit.mf.dispose(); counting.mf.dispose(); });
capture(kit);
misc(kit, counting);
