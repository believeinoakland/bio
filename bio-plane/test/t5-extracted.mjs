/* T5 (legacy-tests), 2026-09-27: layers 4 and 5 of tranche T5 EXTRACTED `calibration`, `extraction`, `content`,
   `entities`, `connections`, `progressions`, `bias`, `observation-log` and `retrieval` out of the legacy store
   (`src/store.mjs`) into `src/<module>/`. The store keeps a ONE-LINE delegation for some methods that moved
   (`x(...a) { return contentOf(this.ctx).y(...a); }`), and its dispatch maps spread each module's routes
   (`...entitiesOps(entitiesOf(this.ctx), url, body),`). A walk whose subject is the store's own class read as a census
   (op -> method off the dispatch map, the method's segment, what it scans and returns) reads those delegations and
   spreads and finds the code gone. T3's `inlinedStore` (`extracted-sources.mjs`) and T4's `reinlineLayer3`
   (`t4-extracted.mjs`) re-inline layers 2 and 3; this does the same, and only the same, for T5's nine modules:

     (1) a PURE delegation line — its whole body `return <module>Of(this.ctx).y(…);` — is replaced by the module's
         class method `y` itself, under the STORE's name (the text the method had before it moved);
     (2) with `{ ops: true }`, a dispatch map's spread `...<fn>(<module>Of(this.ctx), url, body[, this.env]),` is
         replaced by the entries `<fn>` returns, their receiver (the function's first parameter) read as `this.`;
     (3) with `{ ops: true }`, every module class method those entries reach that the store has no method of that
         name for is appended after the store's text (the rest are the store's own or (1)'s re-inlined delegations);
         where the name is already taken by a DIFFERENT method (the store's own, or another module's appended one,
         e.g. extraction's `read` and connections' `read`), the entry and the appended method are both spelled
         `<name>$<module>Of`, so no op reads another module's segment;
     (4) a re-inlined or appended method whose whole body is one hop to a reader the module holds as a field
         (`frontier(a) { return this.frontierReader.read(a); }`) is that reader class's method under the same name.

   Nothing else changes: every other store method is the store's own, a module method nothing reaches is not added,
   and module code outside the modules' classes (free functions, the routes' local helpers such as `q`) is not
   included. `reinlined` names each substitution. */
/* ADDED 2026-09-27 by legacy-tests (T5-12), for `meaning-bounds.test.mjs`, OPT-IN (`{ privates: true }`; without it
   the text is byte-identical to what it was, so `bounds.test.mjs` and every other caller read what they read):
     (5) a module's PRIVATE methods, which the store never held under the module's spelling. That walk follows a
         method's RETURN-DELEGATES (`return this.#x(…)`, `const v = this.#x(…); … return v;`) into their segments,
         and T5 moved the private helpers behind several reads with their public methods (entities' `#resolveOne`
         behind `op=resolve`, D-291's own helper; retrieval's frontier reader's `#document`/`#content`/`#meaning`/
         `#internet` behind `op=frontier`; progressions' `#answer` behind `op=instance`). So: in every re-inlined,
         hopped or appended module method, a call `this.#x(` to a private method of the same module (its own class
         first) is spelled `this.#x$<module>Of(` and that method is appended under that name, transitively; and a
         store method (not a pure delegation) that RETURNS a module's answer, `return <module>Of(this.ctx).y(…)` or
         `const v = <module>Of(this.ctx).y(…)`, has that call spelled `this.#y$<module>Of(` with `y` appended, so
         the walk's delegate rule reads it as it read the store's own helper (`resolveReferences` arms the derive
         sweep around entities' `resolve`, so it is not a pure delegation). The row primitives `#rows` and `#one`
         are never renamed (the walk reads `#rows(` as the row source, whichever class runs it). A dispatch arrow
         is neither shape, so the dispatch census does not move. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));
export const T5_MODULES = {
  calibrationOf: "calibration", extractionOf: "extraction", contentOf: "content", entitiesOf: "entities",
  connectionsOf: "connections", progressionsOf: "progressions", biasOf: "bias", observationLogOf: "observation-log",
  retrievalOf: "retrieval",
};
const OF = Object.keys(T5_MODULES).join("|");
const HEAD = /^ {2}(?:static\s+|async\s+)*(?:get\s+|set\s+)?(?:\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\(/;
const DELEGATION = new RegExp(String.raw`^ {2}((?:static\s+|async\s+)*)(#?[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+(?:await\s+)?(${OF})\(this\.ctx\)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$`);
const SPREAD = new RegExp(String.raw`^( +)\.\.\.([A-Za-z_$][\w$]*)\((${OF})\(this\.ctx\), url, body(?:, this\.env)?\),[ \t]*$`, "gm");

const moduleText = (mod) => readdirSync(`${SRC_DIR}${mod}`).filter((f) => f.endsWith(".mjs")).sort()
  .map((f) => readFileSync(`${SRC_DIR}${mod}/${f}`, "utf8")).join("\n");

/** A module's classes, `className -> (name -> text)`, each class's methods read up to the next column-0 line. */
function moduleClasses(text) {
  const out = new Map(), lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const c = /^(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(lines[i]);
    if (!c) continue;
    let j = i + 1;
    while (j < lines.length && !/^\}/.test(lines[j])) j++;
    out.set(c[1], classMethods(lines.slice(i + 1, j).join("\n")));
    i = j;
  }
  return out;
}

/** (4) One hop inside a module: a method whose whole body is `return this.<field>.<m>(…);`, where the module builds
 *  `this.<field> = new <Class>(…)`, is replaced by `<Class>`'s method `m` under the outer method's name (the Frontier
 *  and Themes readers retrieval and connections hold as fields). */
function followHop(methodText, moduleSrc, classes) {
  const h = /^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)(#?[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s+(?:await\s+)?this\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$/.exec(methodText.trim() ? "  " + methodText.trim() : "");
  if (!h) return null;
  const f = new RegExp(String.raw`this\.${h[3]}\s*=\s*new\s+([A-Za-z_$][\w$]*)\(`).exec(moduleSrc);
  const target = f && classes.get(f[1]) && classes.get(f[1]).get(h[4]);
  return target ? target.replace(/^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)#?[A-Za-z_$][\w$]*/, `$1${h[2]}`) : null;
}

/** (5) The class whose method (4) followed for `methodText`, or null: the same reading as `followHop`'s. */
function hopClass(methodText, moduleSrc, classes) {
  const h = /^\s*(?:static\s+|async\s+)*(?:\*\s*)?#?[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{\s*return\s+(?:await\s+)?this\.([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\([^;]*\);\s*\}\s*$/.exec(methodText);
  if (!h) return null;
  const f = new RegExp(String.raw`this\.${h[1]}\s*=\s*new\s+([A-Za-z_$][\w$]*)\(`).exec(moduleSrc);
  return f && classes.get(f[1]) && classes.get(f[1]).get(h[2]) ? f[1] : null;
}

/** The class methods of a module's files, `name -> text`, each bounded by the next method or a column-0 line. */
function classMethods(text) {
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

/** The store's text (as handed in) with each pure T5 delegation re-inlined and, with `{ ops: true }`, each T5 routes
 *  spread expanded; `reinlined` lists every substitution. */
export function reinlineLayer5(storeText, { ops = false, privates = false } = {}) {
  const texts = Object.fromEntries(Object.entries(T5_MODULES).map(([of, mod]) => [of, moduleText(mod)]));
  const methods = Object.fromEntries(Object.entries(texts).map(([of, t]) => [of, classMethods(t)]));
  const classes = Object.fromEntries(Object.entries(texts).map(([of, t]) => [of, moduleClasses(t)]));
  const hop = (of, m) => followHop(m, texts[of], classes[of]) || m;
  /* (5), with `{ privates: true }`: `priv` spells a chunk's calls to its module's private methods apart and queues
     them; without the option it is the identity, and nothing below it runs. */
  const classOf = (of, m) => [...classes[of]].find(([, ms]) => ms.has(m))?.[0] || null;
  const privQueue = [], privNamed = new Map();   /* spelled name -> `${of}|${cls}|${m}` */
  const privName = (of, cls, m) => {
    const key = `${of}|${cls}|${m}`, base = `#${m.replace(/^#/, "")}$${of}`;
    for (const name of [base, `${base}$${cls}`]) {
      if (privNamed.get(name) === key) return name;
      if (!privNamed.has(name)) { privNamed.set(name, key); privQueue.push({ name, of, cls, m }); return name; }
    }
    return `${base}$${cls}`;
  };
  const priv = (of, cls, chunk) => !privates ? chunk : chunk.replace(/\bthis\.(#[A-Za-z_$][\w$]*)\(/g, (whole, x) => {
    if (x === "#rows" || x === "#one") return whole;
    const own = cls && classes[of].get(cls) && classes[of].get(cls).has(x) ? cls : classOf(of, x);
    return own ? `this.${privName(of, own, x)}(` : whole;
  });
  const chunkOf = (of, m) => priv(of, hopClass(methods[of].get(m), texts[of], classes[of]) || classOf(of, m), hop(of, methods[of].get(m)));
  const reinlined = [];
  const fromStore = new Map();   /* store name -> `${of}.${m}` for (1)'s re-inlined delegations */
  let text = storeText.split("\n").map((l) => {
    const d = DELEGATION.exec(l);
    if (!d || !methods[d[3]].has(d[4])) return l;
    reinlined.push(`${d[2]} <- ${T5_MODULES[d[3]]}.${d[4]}`);
    fromStore.set(d[2], `${d[3]}.${d[4]}`);
    return chunkOf(d[3], d[4]).replace(/^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)#?[A-Za-z_$][\w$]*/, `$1${d[2]}`);
  }).join("\n");
  if (ops) {
    const have = new Set([...text.matchAll(/^ {2}(?:static\s+|async\s+)*(?:\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\(/gm)].map((m) => m[1]));
    const appended = new Map();   /* spelled name -> `${of}.${m}` */
    const spell = (of, m) => {
      const key = `${of}.${m}`;
      if (fromStore.get(m) === key || appended.get(m) === key) return m;
      if (!have.has(m) && !appended.has(m)) { appended.set(m, key); return m; }
      const alt = `${m}$${of}`;
      appended.set(alt, key);
      return alt;
    };
    text = text.replace(SPREAD, (whole, indent, fnName, of) => {
      const fn = new RegExp(String.raw`^export function ${fnName}\(([A-Za-z_$][\w$]*)[^)]*\) \{[\s\S]*?\n  return \{\n([\s\S]*?)\n  \};\n\}`, "m")
        .exec(texts[of]);
      if (!fn) return whole;
      const recv = new RegExp(String.raw`\b${fn[1]}\.([A-Za-z_$][\w$]*)\(`, "g");
      const entries = fn[2].split("\n").map((l) => l.replace(recv, (_, m) => methods[of].has(m) ? `this.${spell(of, m)}(` : `this.${m}(`));
      reinlined.push(`${fnName} spread <- ${entries.filter((l) => /^\s*[A-Za-z_$][\w$]*:\s*(?:async\s*)?\(\)\s*=>/.test(l)).length} entries`);
      return entries.map((l) => indent + l.trim()).join("\n");
    });
    const add = [];
    for (const [name, key] of appended) {
      const [of, m] = key.split(".");
      add.push(name === m ? `${T5_MODULES[of]}.${m}` : `${T5_MODULES[of]}.${m} as ${name}`);
      text += "\n" + chunkOf(of, m).replace(/^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)#?[A-Za-z_$][\w$]*/, `$1${name}`);
    }
    if (add.length) reinlined.push(`appended module methods: ${add.join(", ")}`);
  }
  if (privates) {
    const RETURNED = new RegExp(String.raw`(return\s+(?:await\s+)?|const\s+[A-Za-z_$][\w$]*\s*=\s*(?:await\s+)?)(${OF})\(this\.ctx\)\.([A-Za-z_$][\w$]*)\(`, "g");
    const wrapped = [];
    text = text.replace(RETURNED, (whole, lead, of, m) => {
      if (!methods[of].has(m)) return whole;
      wrapped.push(`${T5_MODULES[of]}.${m}`);
      return `${lead}this.${privName(of, classOf(of, m), m)}(`;
    });
    if (wrapped.length) reinlined.push(`store calls returned as private delegates: ${wrapped.join(", ")}`);
    const add = [];
    for (let i = 0; i < privQueue.length; i++) {
      const { name, of, cls, m } = privQueue[i];
      const own = (cls && classes[of].get(cls) && classes[of].get(cls).get(m)) || methods[of].get(m);
      const body = m.startsWith("#") ? priv(of, cls, own) : chunkOf(of, m);
      add.push(`${T5_MODULES[of]}.${cls}.${m} as ${name}`);
      text += "\n" + body.replace(/^( {2}(?:static\s+|async\s+)*(?:\*\s*)?)#?[A-Za-z_$][\w$]*/, `$1${name}`);
    }
    if (add.length) reinlined.push(`appended private module methods: ${add.join(", ")}`);
  }
  return { text, reinlined };
}
