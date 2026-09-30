/* run-rules: the AI run's rules without a store (build/requirements/run-rules.md). The pure rules and vocabulary
 * (`./rules.mjs`, R1–R8, R10, R13), the one deployment order (`./deployment.mjs`, R9, R14) and the table of every run
 * refusal's row (`./checks.mjs`, R11, R15). Pure: no storage, no clock, no viewer. */
export * from "./rules.mjs";
export * from "./deployment.mjs";
export * from "./checks.mjs";
