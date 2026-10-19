/* case-checker tests: a module-customisation hook that notes every key `word` and `localize` of `setup-words` read (R27), so a run of the battery can show
   which keys a fixture reaches (`node --import ./trace-register.mjs <script>`). It rewrites the loaded source of `setup-words` in
   memory and nothing on disk. */
import { registerHooks } from "node:module";

registerHooks({
  load(url, context, nextLoad) {
    const loaded = nextLoad(url, context);
    if (!url.endsWith("/src/setup-words/index.mjs")) return loaded;
    const note = "(globalThis.__reached ??= new Set()).add(";
    const a = "export function word(key, vars = {}) {", b = "export function localize(id, en, vars = {}) {";
    let source = String(loaded.source);
    if (!source.includes(a) || !source.includes(b)) throw new Error("trace-register: setup-words/index.mjs is no longer shaped as the hook expects");
    source = source.replace(a, `${a} ${note}key);`).replace(b, `${b} ${note}id);`);
    return { ...loaded, source };
  },
});
