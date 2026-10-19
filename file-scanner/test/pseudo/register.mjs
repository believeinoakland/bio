// Runs a script with setup-words' reading replaced by a pseudo-locale: every `localize(id, en)` answers its sentence
// followed by the bracketed id and `word(key)` the bracketed key, so a sentence that did not come through a key is the
// one string left with no bracket (the sentence stays, so a check that reads it, as R19's, still works).
import { register } from 'node:module';
register('./hooks.mjs', import.meta.url);
