/* control-plane (fix round 9; K4837; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE ROUND'S CASES THROUGH THE REAL PLANE, in ONE file. Sections 1-3 and 9 are `r9-seam-reading.mjs`, 4-8 `r9-seam-documents.mjs`,
   14-15 `r9-seam-limits.mjs` (job 38); 10-13 `r9-seam-parts.mjs` and 16-18 `r9-seam-safety.mjs` (job 43). Heavy: run alone, five runs, and the 40 s scanner case on one core too (R-NOLOAD). */
import "../../sandbox.mjs";
import { after } from "node:test";
import { makeKit } from "./r8-kit.mjs";
import { sections as reading } from "./r9-seam-reading.mjs";
import { sections as documents } from "./r9-seam-documents.mjs";
import { sections as limits } from "./r9-seam-limits.mjs";
import { sections as parts } from "./r9-seam-parts.mjs";

const kit = makeKit({ tag: "r9seam" });
const counting = makeKit({ tag: "r9seamc", counting: true });
after(() => { kit.mf.dispose(); counting.mf.dispose(); });
reading(kit, counting);
documents(kit, counting);
limits(kit, counting);
parts(kit, counting);
