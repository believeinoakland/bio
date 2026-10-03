/* The Civicsmith library (wizard-scripts R1, R13, R14; DEC-121 (1), (9)): the wizard scripts shipped with the release,
 * their content approved by Bob, read-only to every group. Empty until the UX stream's step 5 writes its scripts with
 * Bob's approval. `plane` passes it to `wizardRegister` at start; the release suite runs `requiredFailures` over it.
 *
 * An entry: `{id, name, required, version, steps, approved: {by, at}}`: `id` a `WIZ-` id, `required` true for a
 * required flow (one that fails R12 blocks the release, R14), `version` counting from 1, `steps` R2's, `approved` who
 * approved this version for the library and when. */

export const CIVICSMITH_LIBRARY = Object.freeze([]);
