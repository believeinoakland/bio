/* setup-words (R4, R10–R13): the interface's word list and the two services that read it. The list is generated
   (rows.mjs, by build.mjs) and frozen; `word` fills a key's English, `hasWord` says whether a key is held. Nothing here
   does I/O, keeps state beyond the lookup table built on first call, or reads the clock or randomness. */
import { WORD_ROWS, WORDS_COMMIT } from "./rows.mjs";

export { WORD_ROWS, WORDS_COMMIT };

let table;
const rowsByKey = () => (table ??= new Map(WORD_ROWS.map((r) => [r[0], r])));

const fail = (code, message) => Object.assign(new Error(`${code}: ${message}`), { code });

/** R12: true exactly when the list holds `key`. */
export const hasWord = (key) => typeof key === "string" && rowsByKey().has(key);

/** R11: the English of `key`, each `{name}` filled from `vars[name]` (a string or a number, as `String` writes it).
 *  UNKNOWN_WORD when the list lacks `key`; WORD_VAR_MISSING when a placeholder's name is absent from `vars`. */
export function word(key, vars = {}) {
  const row = typeof key === "string" ? rowsByKey().get(key) : undefined;
  if (!row) throw fail("UNKNOWN_WORD", `no word ${typeof key === "string" ? key : String(key)}`);
  return row[1].replace(/\{([A-Za-z0-9_]+)\}/g, (_, name) => {
    const v = vars?.[name];
    if (!Object.hasOwn(vars ?? {}, name) || v === undefined || v === null) throw fail("WORD_VAR_MISSING", `${key} needs {${name}}`);
    return String(v);
  });
}
