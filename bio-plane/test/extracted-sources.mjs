/* T3 (legacy-tests), 2026-09-26: layer 2 of tranche T3 EXTRACTED `record-core`, `membership` and `promotion`
   out of the legacy store (`src/store.mjs`) into `src/<module>/`. A suite whose check is by nature a census of
   the store's SOURCE TEXT (a harvest of refusal codes, a writer census, a walk of ops) widens its corpus to the
   extracted module's files with this helper, rather than reading `store.mjs` alone and finding the code gone. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));

/** The `.mjs` files of `src/<module>/`, sorted, as paths relative to `src/` (e.g. `membership/index.mjs`). */
export const moduleFiles = (module) =>
  readdirSync(`${SRC_DIR}${module}`).filter((f) => f.endsWith(".mjs")).sort().map((f) => `${module}/${f}`);

/** The text of every `.mjs` file of the named extracted modules, joined by a newline, in the given encoding. */
export const moduleSources = (modules, enc = "utf8") =>
  [].concat(modules).flatMap(moduleFiles).map((f) => readFileSync(`${SRC_DIR}${f}`, enc)).join("\n");

/** `src/store.mjs` AND the named extracted modules' files: the store's corpus as it stood before the extraction. */
export const storeCorpus = (modules, enc = "utf8") =>
  [readFileSync(`${SRC_DIR}store.mjs`, enc), moduleSources(modules, enc)].join("\n");

/* ---------------------------------------------------------------------------------------------------------------
 * THE STORE AS ONE TEXT, the extracted modules RE-INLINED where the store now delegates to them — for the walks whose
 * subject is the store's own class as a census (op -> method off the dispatch map, a method's segment, what it
 * returns), which the extraction left looking at one-line delegations and a spread of `membershipOps(...)`. It is the
 * store's text with, and only with, these substitutions, each mechanical and each stated:
 *   (1) a PURE delegation method — its whole body `return membershipOf(this.ctx).y(…);` (or `promotionOf`) — is
 *       replaced by the module's method `y` itself, under the STORE's name (a private `#x` keeps `#x`);
 *   (2) inside every re-inlined module method, `this.y(` for such a `y` reads `this.#x(` where the store knew it as
 *       the private `#x` — the spelling the method had before it moved;
 *   (3) a static alias `static X = Membership.X;` is replaced by the module's own `static X = …;` line (emptied where
 *       the method re-inlined by (1) already carries that line);
 *   (4) the dispatch map's `...membershipOps(membershipOf(this.ctx), url, body, this.env),` is replaced by the map
 *       entries that function returns, their receiver `m.` read as `this.` (with (2)'s private names);
 *   (5) every module method the store has no method of that name for is appended after the store's text, at the
 *       class indent; a module method whose name the store already has (its own `#rows`, a non-pure `reopen`) is not.
 * Module code outside the modules' classes (free functions) is not included. Record-core is not re-inlined: the
 * store calls it as a service (`recordOf(this.ctx).x(…)`) inside its own methods, not by delegation.
 * The class-indent head below is this helper's own; it is NOT one of the five segmenter walks D-414's parity arm
 * counts, and it is not used as one — it only finds where a module method starts. */
const HEAD = new RegExp("^  (?:static\\s+|async\\s+)?(?:\\*\\s*)?(#?[A-Za-z_$][\\w$]*)\\s*\\(");
const DELEGATE = /^ {2}(?:static\s+)?(#?[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+(membershipOf|promotionOf)\(this\.ctx\)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$/;

/** The class methods of a module file, as `name -> text`, each bounded by the next method or a column-0 line. */
const classMethods = (text) => {
  const lines = text.split("\n"), out = new Map();
  let open = null;
  const close = (end) => { if (open && !out.has(open.name)) out.set(open.name, lines.slice(open.at, end).join("\n")); open = null; };
  for (let i = 0; i < lines.length; i++) {
    const h = HEAD.exec(lines[i]);
    if (h) { close(i); open = { name: h[1], at: i }; continue; }
    if (/^\S/.test(lines[i])) close(i);
  }
  close(lines.length);
  return out;
};

export const inlinedStore = (enc = "utf8") => {
  const store = readFileSync(`${SRC_DIR}store.mjs`, enc);
  const mods = { membershipOf: "membership", promotionOf: "promotion" };
  const methods = {}, statics = {}, texts = {};
  for (const [of, mod] of Object.entries(mods)) {
    texts[of] = moduleFiles(mod).map((f) => readFileSync(`${SRC_DIR}${f}`, enc)).join("\n");
    methods[of] = classMethods(texts[of]);
    statics[of] = new Map([...texts[of].matchAll(/^ {2}static ([A-Z][A-Z0-9_]*) = [^\n]*;$/gm)].map((m) => [m[1], m[0]]));
  }
  /* The store's segments by head, to find the pure delegations (a delegation spans its head line to the next head). */
  const lines = store.split("\n");
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const h = HEAD.exec(lines[i]); if (h) heads.push({ at: i, name: h[1] }); }
  const storeNames = new Set(heads.map((h) => h.name));
  const pure = [];
  for (let k = 0; k < heads.length; k++) {
    const end = k + 1 < heads.length ? heads[k + 1].at : lines.length;
    let last = end; while (last > heads[k].at + 1 && !/\}\s*$/.test(lines[last - 1])) last--;
    const text = lines.slice(heads[k].at, last).join(" ").replace(/\s+/g, " ");
    const d = DELEGATE.exec(`  ${text.trim()}`);
    if (d && d[1] === heads[k].name && methods[d[2]].has(d[3])) pure.push({ at: heads[k].at, last, name: d[1], of: d[2], target: d[3] });
  }
  /* (2): the private spelling each public module name had in the store. Where two store methods delegate to ONE
     module method (`#inSight` and `#viewerSees`), the method is inlined once — under its public name if the store
     has that name, else under the first private one — and the other stays a one-line delegation to it. */
  const privateOf = { membershipOf: new Map(), promotionOf: new Map() };
  for (const p of pure) if (p.name.startsWith("#") && !privateOf[p.of].has(p.target)
                            && !pure.some((q) => q.of === p.of && q.name === p.target)) privateOf[p.of].set(p.target, p.name);
  const primary = (p) => privateOf[p.of].get(p.target) ?? p.target;
  const respell = (of, text) => text.replace(/\bthis\.([A-Za-z_$][\w$]*)\(/g, (all, y) =>
    privateOf[of].has(y) ? `this.${privateOf[of].get(y)}(` : all);
  const asStore = (of, name, target) => respell(of, methods[of].get(target)).replace(HEAD, (h) => h.replace(target, name));
  /* (1) and (3), bottom-up so earlier line numbers stay put. */
  const used = { membershipOf: new Set(), promotionOf: new Set() };
  for (const p of [...pure].reverse()) {
    const inline = p.name === primary(p);
    lines.splice(p.at, p.last - p.at, ...(inline ? asStore(p.of, p.name, p.target).split("\n")
      : [`  ${p.name}(...a) { return this.${primary(p)}(...a); }`]));
    used[p.of].add(p.target);
  }
  let text = lines.join("\n");
  /* (3) — where the re-inlined method already carries the module's static line (it sat below the method), the alias
     line is emptied rather than doubled. */
  text = text.replace(/^ {2}static ([A-Z][A-Z0-9_]*) = (?:Membership|Promotion)\.\1;$/gm, (all, x) => {
    const own = statics.membershipOf.get(x) ?? statics.promotionOf.get(x);
    return own === undefined ? all : text.includes(own) ? "" : own;
  });
  /* (4) */
  const opsFn = /^export function membershipOps\([^)]*\) \{\n {2}return \{\n([\s\S]*?)\n {2}\};\n\}/m.exec(texts.membershipOf);
  if (opsFn) {
    const entries = respell("membershipOf", opsFn[1].replace(/\bm\.(?=[A-Za-z_$][\w$]*\()/g, "this."));
    text = text.replace(/^ {8}\.\.\.membershipOps\(membershipOf\(this\.ctx\), url, body, this\.env\),$/m, () => `${entries},`);
  }
  /* (5) */
  const extra = [];
  for (const of of Object.keys(mods))
    for (const [name, body] of methods[of])
      if (!used[of].has(name) && !storeNames.has(name) && !storeNames.has(privateOf[of].get(name)))
        extra.push(respell(of, body));
  return `${text}\n${extra.join("\n")}\n`;
};
