/* basis-version-grammar — the module's one public face (requirements: `build/requirements/basis-version-grammar.md`; T51,
 * T51-148, K624, K3946). The grammar of an inquiry's basis versions (`./grammar.mjs`, R1–R7, R10) and its rows and
 * vocabularies (`./checks.mjs`, R8, R9). A library, as `inquiry-grammar` is: pure, no storage, no instance, no ops;
 * apart from `registerBasisVersionGrammar` (R6), nothing here reads or writes the record, the clock or the network. */

export * from "./grammar.mjs";
export * from "./checks.mjs";
