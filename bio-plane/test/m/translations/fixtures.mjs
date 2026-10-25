/* translations' published fixtures (K4990, K4993): each answer is made by this module's real code when the test runs, never
   stored, so a user's test takes the answer the module gives and not one it wrote by hand. */
import { boot } from "./fixture.mjs";

/** The real `registerMemberLanguageRead` and `wordsVersion` (R11, R20). `registered` is the real answer of a first
 *  registration of a read that answers `language` for every viewer (`{ok: true}`), `words_version` the real stamp of a
 *  team that has adopted nothing, and `translations` a fresh instance of the real module with no read registered yet,
 *  for a test that hands it to its user (`more` hands in the module's providers, as `boot` takes them): it answers `registerMemberLanguageRead` and `wordsVersion` as the module does. */
export function memberLanguageRead({ language = "es", more = {} } = {}) {
  const read = () => ({ ok: true, language, set_at: null });
  const first = boot({ more }).m;
  const registered = first.registerMemberLanguageRead(read);
  return { registered, words_version: first.wordsVersion(), translations: boot({ more }).m };
}
