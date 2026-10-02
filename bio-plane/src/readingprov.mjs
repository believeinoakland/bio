/* reading-pipeline (N513): `readingprov.mjs` moved to `reading-pipeline/readingprov.mjs`. This re-export keeps
   `extraction`'s import (`extraction/index.mjs`:24, and its `pipeline.mjs` copy) resolving until extraction's T25 L4
   job re-points it to `reading-pipeline/index.mjs`; it is then removed by this module (accepted red 10's window). */
export { readingProvenance, compareProvenance, describePages, PROVENANCE_SCHEME, TIER_MEMBERS } from "./reading-pipeline/readingprov.mjs";
