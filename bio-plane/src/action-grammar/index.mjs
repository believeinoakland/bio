/* action-grammar — the action document's grammar (requirements: `build/requirements/action-grammar.md`; layer 9,
 * directly before `actions`). Its one face: the vocabularies and grammars moved from the catalogue (`./grammar.mjs`) and
 * the arms, readers and rows copied from `actions` (`./checks.mjs`), which re-exports the former. Pure: it reads no
 * record and registers nothing; `actions` registers `checkActionExtension` with record-core's audit (its R51). */
export * from "./checks.mjs";
