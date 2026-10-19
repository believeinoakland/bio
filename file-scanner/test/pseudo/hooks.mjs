const PSEUDO = 'pseudo:setup-words';
const SOURCE = `export const WORD_ROWS = []; export const WORDS_COMMIT = 'pseudo';
export const hasWord = () => true;
export const word = (key) => '\\u27e6' + key + '\\u27e7';
export const localize = (id, en, vars = {}) => en.replace(/\\{(\\w+)\\}/g, (_, n) => vars[n]) + ' \\u27e6' + id + '\\u27e7';`;

export async function resolve(specifier, context, next) {
  const r = await next(specifier, context);
  return r.url.endsWith('/bio-plane/src/setup-words/index.mjs') ? { url: PSEUDO, shortCircuit: true } : r;
}
export async function load(url, context, next) {
  return url === PSEUDO ? { format: 'module', source: SOURCE, shortCircuit: true } : next(url, context);
}
