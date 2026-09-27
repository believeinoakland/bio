/* T4 (legacy-tests), 2026-09-27: layer 3 of tranche T4 EXTRACTED `host-governor`, `provenance` and `capture` out of
   the legacy store (`src/store.mjs`) into `src/<module>/`, and the store keeps a ONE-LINE delegation for each method
   that moved: `x(...a) { return provenanceOf(this.ctx).y(...a); }` (and `captureOf`, `governorOf`). A walk whose
   subject is the store's own class read as a census (op -> method off the dispatch map, the method's segment, what it
   scans and returns) reads those delegations and finds the code gone. T3's `inlinedStore` (`extracted-sources.mjs`)
   re-inlines membership's and promotion's; this does the same, and only the same, for layer 3's three modules:

     a PURE delegation line — its whole body `return <module>Of(this.ctx).y(…);` — is replaced by the module's class
     method `y` itself, under the STORE's name (the text the method had before it moved).

   Nothing else changes: every other store method is the store's own, a module method the store does not delegate to
   is not added, and module code outside the modules' classes (free functions) is not included. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));
const MODULES = { provenanceOf: "provenance", captureOf: "capture", governorOf: "host-governor" };
const HEAD = /^ {2}(?:static\s+|async\s+)*(?:\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\(/;
const DELEGATION = /^ {2}((?:static\s+|async\s+)*)(#?[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+(?:await\s+)?(provenanceOf|captureOf|governorOf)\(this\.ctx\)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$/;

/** The class methods of a module's files, `name -> text`, each bounded by the next method or a column-0 line. */
function classMethods(mod) {
  const text = readdirSync(`${SRC_DIR}${mod}`).filter((f) => f.endsWith(".mjs")).sort()
    .map((f) => readFileSync(`${SRC_DIR}${mod}/${f}`, "utf8")).join("\n");
  const lines = text.split("\n"), out = new Map();
  let open = null;
  const close = (end) => { if (open && !out.has(open.name)) out.set(open.name, lines.slice(open.at, end).join("\n")); open = null; };
  for (let i = 0; i < lines.length; i++) {
    const h = HEAD.exec(lines[i]);
    if (h && !/^\s*(if|for|while|switch|catch|return)\b/.test(lines[i].trim())) { close(i); open = { name: h[1], at: i }; continue; }
    if (/^\S/.test(lines[i])) close(i);
  }
  close(lines.length);
  return out;
}

/** The store's text with each pure layer-3 delegation re-inlined; `reinlined` lists `store <- module.method`.
 *  With `{ ops: true }`, ALSO (T3's step (4) and (5), for capture's routes): the dispatch map's
 *  `...captureOps(captureOf(this.ctx), url, body, this.env),` is replaced by the entries `captureOps` returns, their
 *  receiver `c.` read as `this.`, and every capture class method those entries reach that the store has no method of
 *  that name for is appended after the store's text (the rest are already the store's re-inlined delegations). */
export function reinlineLayer3(storeText, { ops = false } = {}) {
  const methods = Object.fromEntries(Object.entries(MODULES).map(([of, mod]) => [of, classMethods(mod)]));
  const reinlined = [];
  let text = storeText.split("\n").map((l) => {
    const d = DELEGATION.exec(l);
    if (!d || !methods[d[3]].has(d[4])) return l;
    reinlined.push(`${d[2]} <- ${MODULES[d[3]]}.${d[4]}`);
    return methods[d[3]].get(d[4]).replace(/^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)#?[A-Za-z_$][\w$]*/, `$1${d[2]}`);
  }).join("\n");
  if (ops) {
    const capText = readdirSync(`${SRC_DIR}capture`).filter((f) => f.endsWith(".mjs")).sort()
      .map((f) => readFileSync(`${SRC_DIR}capture/${f}`, "utf8")).join("\n");
    const fn = /^export function captureOps\([^)]*\) \{[\s\S]*?\n  return \{\n([\s\S]*?)\n  \};\n\}/m.exec(capText);
    const SPREAD = /^( +)\.\.\.captureOps\(captureOf\(this\.ctx\), url, body, this\.env\),$/m;
    const sp = SPREAD.exec(text);
    if (fn && sp) {
      const entries = fn[1].split("\n").map((l) => l.replace(/\bc\.([A-Za-z_$][\w$]*)\(/g, "this.$1("));
      text = text.replace(SPREAD, entries.map((l) => sp[1] + l.trim()).join("\n"));
      reinlined.push(`captureOps spread <- ${entries.filter((l) => /:\s*\(\)\s*=>/.test(l)).length} entries`);
      const have = new Set([...text.matchAll(/^ {2}(?:static\s+|async\s+)*(?:\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\(/gm)].map((m) => m[1]));
      const reached = [...new Set([...fn[1].matchAll(/\bc\.([A-Za-z_$][\w$]*)\(/g)].map((m) => m[1]))];
      const add = reached.filter((n) => !have.has(n) && methods.captureOf.has(n));
      if (add.length) {
        text += "\n" + add.map((n) => methods.captureOf.get(n)).join("\n");
        reinlined.push(`appended capture methods: ${add.join(", ")}`);
      }
    }
  }
  return { text, reinlined };
}
