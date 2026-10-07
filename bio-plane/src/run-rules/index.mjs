/* run-rules: the AI run's rules without a store (build/requirements/run-rules.md). The pure rules and vocabulary
 * (`./rules.mjs`, R1–R8, R10, R13, R17, R18), the one deployment order, the modes `ask` and `draft` and the
 * verification that enables the next mode (`./deployment.mjs`, R9, R14, R16, R19, R21) and the table of every run refusal's row
 * (`./checks.mjs`, R11, R15, R20). Pure: no storage, no clock, no viewer. */
export * from "./rules.mjs";
export * from "./deployment.mjs";
export * from "./checks.mjs";
