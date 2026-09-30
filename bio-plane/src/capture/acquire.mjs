/* capture — the acquisition act's old address, kept as a re-export only (K617, K649 (1), K624 (1)). The act moved to
 * `acquisition` (its R1–R23; `capture` R73 hands it this module's store). These names stay reachable here for the
 * importers not yet re-pointed (`ratification/ops.mjs`, `monitoring/index.mjs`, `test/m/capture-requests/drain.test.mjs`,
 * `test/m/monitoring/tick.test.mjs`, each re-pointed in its own job), and the file is deleted by capture's next job. */
export { ACQUIRE_GRADE_NOTE, ODF_DIGEST_MAX, PROFILE_TEXT_MAX, acquire, acquireGradeNote, archiveLookup, governedCall,
         governedFetch, profileOf, profileView, profilesAsText, sha256Hex, substanceDigests, userAgent } from "../acquisition/index.mjs";
