/* reach-by-op.mjs — THE DEC-49 GUARD'S REACH, BY OP (D-542, D-562; 2026-09-25).
 *
 * THE DEFECT THIS CLOSES. `check-refusal-codes.mjs` put a code IN REACH only by
 * R1 (a catalogue row), R2 (a code LITERAL in `app.html`) or R3 (a harness mock
 * feeding it). UI-68's review-copy surface renders the plane's own `detail` and
 * keys on NO literal, so TEN of D-448's eleven codes were scored OUT OF REACH for
 * a day while a member could meet them on that surface (arm F's F6 on origin/main
 * 9f8b69e6, measured by D-448's worker). "Out of reach" was a statement about how
 * a surface SPELLS things, not about whether a member can meet the code.
 *
 * THE RULE THIS MODULE MEASURES, and nothing else:
 *
 *   (R5) BY OP — a code the plane mints ON AN OP that `app.html` CALLS is in reach,
 *        whether or not the surface names the code. "Calls" is read structurally:
 *        a request helper is any function in `app.html` whose FIRST PARAMETER is
 *        named `op` (discovered, never listed — `api`, `apiQ`, `recR`, `actAsk`, …
 *        and whatever seam is written next), and a call is that helper applied to
 *        a quoted op name the dispatch table (`OPS`) holds.
 *   (R6) PUBLIC OP (D-562) — a code minted on an op a STRANGER can call (`OPS`
 *        row `classes: null`) is in reach, surface or no surface: the member who
 *        meets it is whoever asked.
 *
 * WHAT "MINTED ON AN OP" MEANS, which is where an instrument like this lies:
 *
 *   - THE STORE HALF. The op's DO path (`DO_PATH` alias first — `op=publish` is
 *     routed to `publishcase`) names an entry in the store's dispatch `map`, read
 *     by `op-claims.mjs`'s `readDispatch`, the estate's ONE reader of that table.
 *     From the entry's text the walk follows calls to a fixpoint: `this.m(` /
 *     `Store.m(` to a `Store` method, a bare `f(` to a top-level function of the
 *     same file or one it imports by name from a sibling `src` module.
 *     **IT STOPS AT ANOTHER OP'S ENTRY METHOD.** Measured on origin/main 5e8a65a8:
 *     without the stop, `op=reviewcopy` reached 47 codes, most of them `publish`'s
 *     (a read that asks another op's method for a PREVIEW consumes that answer, it
 *     does not hand its refusal on); with it, `reviewcopy` reaches exactly the one
 *     code its read mints, NO_REVIEW_COPY. Without any name resolution (every
 *     `name(` matched to every function of that name anywhere) the ALL-ops union was
 *     667 codes per op — a walk that puts everything in reach is as blind as one
 *     that puts nothing there, and it would LOCK that into a floor.
 *   - THE CONTROL-PLANE HALF. `index.mjs` answers some ops itself inside
 *     `if (… op === "x" …)` handlers. A code minted inside such a span is
 *     attributed to the ops its condition names POSITIVELY, the INNERMOST span
 *     winning (the `publishedbytes` arm inside the `publishedcase || publishedbytes`
 *     one is `publishedbytes`'s alone). Calls out of a span are followed as above,
 *     and a code inside a CALLEE's own op-span counts only for the ops that span
 *     names.
 *   - A MINT is the census's own spelling minus its comparison matcher: `reason:`
 *     / `code:` a literal, `reason:` an expression's literals, `refusal("X"`. A
 *     comparison (`reason === "X"`) is a READ of a code, not a mint.
 *
 * WHAT IT CANNOT SEE — stated here and PRINTED by the guard every run:
 *   - A helper called with a COMPUTED op (`actAsk(a.op, …)`) — its sites are
 *     counted and printed by the guard, never resolved or scored.
 *   - A call through an object other than `this`/`Store` (`obj.method(`), a method
 *     of any class but `Store`, and a function passed as a value.
 *   - The control plane's GENERIC path (authentication, namespaces, the op
 *     whitelist): those codes are minted for EVERY op and belong to no op's
 *     handler, so they are not attributed here. They are R1/R2/R3's business.
 *   - Whether a code minted on the path actually leaves on the wire: the walk
 *     over-approximates WITHIN an op (a helper's refusal that its caller consumes
 *     still counts). The stop at another op's entry is the one pruning it makes.
 *
 * No side effects: nothing here prints, exits or writes. It reads the paths it is
 * handed. A tree with no dispatch (the guard's fixture trees) answers `ok: false`
 * with the reason, and EMPTY sets — the guard prints that, and its floors decide.
 */
import fs from "fs";
import path from "path";
import { stripComments } from "../bio-plane/scripts/walkfloor.mjs";
import { readDispatch } from "../bio-plane/scripts/op-claims.mjs";

const CODE = "[A-Z][A-Z0-9_]{2,}";
const MINT_LITERAL = [
  new RegExp(`\\breason\\s*[:=]\\s*"(${CODE})"`, "g"),
  new RegExp(`\\bcode\\s*[:=]\\s*"(${CODE})"`, "g"),
  new RegExp(`\\brefusal\\s*\\(\\s*"(${CODE})"`, "g"),
];

/* Every mint in `text`, with its offset, so a caller can ask which span holds it. */
export function mintsIn(text) {
  const out = [];
  for (const re of MINT_LITERAL) for (const m of text.matchAll(re)) out.push({ code: m[1], at: m.index });
  for (const m of text.matchAll(/\breason\s*[:=]\s*([^\n]*)/g))
    for (const q of m[1].slice(0, 240).matchAll(new RegExp(`"(${CODE})"`, "g")))
      out.push({ code: q[1], at: m.index });
  return out;
}

function braceSpan(s, open) {
  let d = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") d++;
    else if (s[i] === "}") { d--; if (!d) return [open, i + 1]; }
  }
  return null;
}
function parenClose(s, lp) {
  let d = 0;
  for (let j = lp; j < s.length; j++) {
    if (s[j] === "(") d++;
    else if (s[j] === ")") { d--; if (!d) return j; }
  }
  return -1;
}
const skipWs = (s, i) => { while (i < s.length && /\s/.test(s[i])) i++; return i; };

/* The body `{…}` that follows a parameter list opening at `lp`, or null. */
function bodyAfterParams(s, lp) {
  const rp = parenClose(s, lp);
  if (rp < 0) return null;
  let o = skipWs(s, rp + 1);
  if (s.slice(o, o + 2) === "=>") o = skipWs(s, o + 2);
  return s[o] === "{" ? braceSpan(s, o) : null;
}

const KEYWORD = /^(if|for|while|switch|catch|return|function|await|new|typeof|constructor|super)$/;

/* THE FUNCTION INDEX of `bio-plane/src`: `file:name` for a top-level function
   (column zero — a nested helper is part of its parent's text), `Store.name` for
   a method of the `Store` class. */
function indexFunctions(stripped) {
  const defs = new Map();
  const imports = new Map();
  for (const [file, s] of Object.entries(stripped)) {
    for (const m of s.matchAll(/\n(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
      const b = bodyAfterParams(s, m.index + m[0].length - 1);
      if (b && !defs.has(`${file}:${m[1]}`)) defs.set(`${file}:${m[1]}`, { file, start: b[0], end: b[1] });
    }
    for (const m of s.matchAll(/\n(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?\(/g)) {
      const b = bodyAfterParams(s, m.index + m[0].length - 1);
      if (b && !defs.has(`${file}:${m[1]}`)) defs.set(`${file}:${m[1]}`, { file, start: b[0], end: b[1] });
    }
    const imp = new Map();
    for (const m of s.matchAll(/import\s*\{([^}]*)\}\s*from\s*"\.\/([\w.-]+\.mjs)"/g))
      for (const spec of m[1].split(",").map(x => x.trim()).filter(Boolean)) {
        const [a, b] = spec.split(/\s+as\s+/).map(x => x.trim());
        imp.set(b || a, `${m[2]}:${a}`);
      }
    imports.set(file, imp);
  }
  const s = stripped["store.mjs"];
  if (s) {
    const ci = s.indexOf("export class Store");
    const cls = ci < 0 ? null : braceSpan(s, s.indexOf("{", ci));
    if (cls) {
      const re = /\n  (?:static\s+)?(?:async\s+)?(?:get\s+|set\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/g;
      re.lastIndex = cls[0];
      for (let m; (m = re.exec(s)) && m.index < cls[1];) {
        if (KEYWORD.test(m[1])) continue;
        const b = bodyAfterParams(s, m.index + m[0].length - 1);
        if (b && !defs.has(`Store.${m[1]}`)) defs.set(`Store.${m[1]}`, { file: "store.mjs", start: b[0], end: b[1] });
      }
    }
  }
  return { defs, imports };
}

/* A BARE CALL `name(`, not preceded by `.`, a word character, `$` or `#`. The guard is a LOOKBEHIND, never a
   consumed character (D-641, 2026-09-25): consuming it made `matchAll` step past the `(` of an enclosing call, so
   a call nested as the first argument of another — `json(refuseMalformed({…}), 400)` — was never seen and its
   codes were attributed to no op. Measured on fac514e0 before D-641 touched a site: the union over the surface's
   and the public ops grew 349 -> 352 (KNOCK_EMPTY, KNOCK_ENVELOPE_TOO_LARGE, KNOCK_PAYLOAD_TOO_LARGE, all three
   already catalogued), so the blind spot was hiding no untranslated code. D-641's one-mint helpers are called in
   exactly that nested shape from index.mjs, which is how it was found. */
const BARE_CALL = /(^|(?<=[^.\w$#]))([A-Za-z_$][\w$]*)\s*\(/g;

function calleesOf(file, text, idx) {
  const out = new Set();
  if (file === "store.mjs")
    for (const m of text.matchAll(/\b(?:this|Store)\s*\.\s*(#?[A-Za-z_$][\w$]*)\s*\(/g))
      if (idx.defs.has(`Store.${m[1]}`)) out.add(`Store.${m[1]}`);
  const imp = idx.imports.get(file) || new Map();
  for (const m of text.matchAll(BARE_CALL)) {
    const n = m[2];
    if (idx.defs.has(`${file}:${n}`)) out.add(`${file}:${n}`);
    else if (imp.has(n) && idx.defs.has(imp.get(n))) out.add(imp.get(n));
  }
  return out;
}

/* `index.mjs`'s op-conditioned spans: every `if (…)` whose condition names
   `op === "x"`, with the block (or single statement) it guards. */
function opSpans(s, ops) {
  const spans = [];
  for (const m of s.matchAll(/\bif\s*\(/g)) {
    const lp = m.index + m[0].length - 1;
    const rp = parenClose(s, lp);
    if (rp < 0) continue;
    const cond = s.slice(lp, rp + 1);
    const named = [...cond.matchAll(/\bop\s*===\s*"([a-z][a-z0-9]*)"/g)].map(x => x[1]).filter(o => ops.has(o));
    if (!named.length) continue;
    const o = skipWs(s, rp + 1);
    let end;
    if (s[o] === "{") { const b = braceSpan(s, o); if (!b) continue; end = b[1]; }
    else {
      let d = 0, i = o;
      for (; i < s.length; i++) {
        const c = s[i];
        if (c === "(" || c === "{" || c === "[") d++;
        else if (c === ")" || c === "}" || c === "]") d--;
        else if (c === ";" && d === 0) break;
      }
      end = i + 1;
    }
    spans.push({ start: rp + 1, end, ops: new Set(named) });
  }
  return spans;
}
/* The innermost span holding offset `at`, or null. */
function innermost(spans, at) {
  let best = null;
  for (const sp of spans)
    if (at >= sp.start && at < sp.end && (!best || sp.end - sp.start < best.end - best.start)) best = sp;
  return best;
}

/* The request helpers of a surface: every function whose FIRST parameter is `op`. */
export function surfaceCalls(appRaw, ops) {
  const app = stripComments(appRaw.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, " ")));
  const helpers = new Set();
  for (const m of app.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(\s*op\b/g)) helpers.add(m[1]);
  for (const m of app.matchAll(/\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(\s*op\b/g)) helpers.add(m[1]);
  const called = new Map();     // op -> number of call sites
  const dynamic = [], notAnOp = new Set();
  if (helpers.size) {
    const re = new RegExp(`(?:^|[^.\\w$])(${[...helpers].join("|")})\\s*\\(\\s*([^,)]*)`, "g");
    for (const m of app.matchAll(re)) {
      const arg = m[2].trim();
      const q = /^["'`]([a-z][a-z0-9]*)["'`]$/.exec(arg);
      if (q) {
        if (ops.has(q[1])) called.set(q[1], (called.get(q[1]) || 0) + 1);
        else notAnOp.add(q[1]);
      } else if (arg !== "op") dynamic.push(`${m[1]}(${arg.slice(0, 40)}`);
    }
  }
  return { helpers: [...helpers].sort(), called, dynamic, notAnOp: [...notAnOp].sort() };
}

/* THE WALK. `planeDir` is `bio-plane`; `appPath` the surface. Returns per-op
   codes (code -> Set of files minting it on that op), the surface's ops, the
   public ops, and what the walk could not resolve. */
export function reachByOp({ planeDir, appPath }) {
  let table;
  try { table = readDispatch(planeDir); }
  catch (e) {
    return { ok: false, why: String(e && e.message || e), opCodes: new Map(), surface: null, publicOps: new Set(),
             unrouted: [] };
  }
  const srcDir = path.join(planeDir, "src");
  const stripped = {};
  for (const f of fs.readdirSync(srcDir).filter(f => f.endsWith(".mjs")))
    stripped[f] = stripComments(fs.readFileSync(path.join(srcDir, f), "utf8"));
  const idx = indexFunctions(stripped);
  const textOf = k => { const d = idx.defs.get(k); return stripped[d.file].slice(d.start, d.end); };
  const fileOf = k => idx.defs.get(k).file;

  /* The store's dispatch entries, by DO path, as TEXT (the reader gives the first
     method a route names; an entry can call two). */
  const s = stripped["store.mjs"] || "";
  const ai = s.indexOf("const map = {");
  const mb = ai < 0 ? null : braceSpan(s, s.indexOf("{", ai));
  const entries = new Map();
  if (mb) {
    const body = s.slice(mb[0] + 1, mb[1] - 1);
    const heads = [...body.matchAll(/^\s{8}([a-z][a-z0-9]*)\s*:\s*/gm)];
    heads.forEach((m, i) => entries.set(m[1],
      body.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : body.length)));
  }
  const entryMethods = new Map();
  for (const [p, text] of entries) entryMethods.set(p, calleesOf("store.mjs", text, idx));
  const anyEntry = new Set([...entryMethods.values()].flatMap(x => [...x]));

  const iSrc = stripped["index.mjs"] || "";
  const spans = opSpans(iSrc, table.ops);
  const spansByFile = new Map([["index.mjs", spans]]);

  const opCodes = new Map();
  const add = (op, code, file) => {
    if (!opCodes.has(op)) opCodes.set(op, new Map());
    const m = opCodes.get(op);
    if (!m.has(code)) m.set(code, new Set());
    m.get(code).add(file);
  };
  /* Mints of a function body, for `op`: a mint inside one of the body's own
     op-spans counts only for the ops that span names. */
  const harvestFn = (k, op) => {
    const d = idx.defs.get(k);
    const sp = spansByFile.get(d.file) || [];
    for (const { code, at } of mintsIn(textOf(k))) {
      const inner = innermost(sp, d.start + at);
      if (!inner || inner.ops.has(op)) add(op, code, d.file);
    }
  };
  const follow = (op, roots, own) => {
    const seen = new Set(), stack = [...roots];
    while (stack.length) {
      const k = stack.pop();
      if (seen.has(k)) continue;
      if (anyEntry.has(k) && !own.has(k)) continue;   /* ANOTHER OP'S ENTRY: its codes are its own */
      seen.add(k);
      harvestFn(k, op);
      for (const c of calleesOf(fileOf(k), textOf(k), idx)) stack.push(c);
    }
    return seen;
  };

  const unrouted = [];
  for (const op of table.ops) {
    /* THE STORE HALF */
    const p = table.doPath.get(op) ?? op;
    const e = entries.get(p);
    if (e) {
      const own = entryMethods.get(p);
      for (const { code } of mintsIn(e)) add(op, code, "store.mjs");
      follow(op, own, own);
    }
    /* THE CONTROL-PLANE HALF: the spans naming this op, innermost attribution. */
    let handled = false;
    for (const sp of spans) {
      if (!sp.ops.has(op)) continue;
      handled = true;
      const text = iSrc.slice(sp.start, sp.end);
      for (const { code, at } of mintsIn(text))
        if (innermost(spans, sp.start + at) === sp) add(op, code, "index.mjs");
      /* Calls made from this span (and not from a narrower span inside it). */
      const roots = new Set();
      for (const m of text.matchAll(BARE_CALL)) {
        const at = sp.start + m.index + m[1].length;
        if (innermost(spans, at) !== sp) continue;
        for (const k of calleesOf("index.mjs", m[0].slice(m[1].length), idx)) roots.add(k);
      }
      follow(op, roots, new Set());
    }
    if (!e && !handled) unrouted.push(op);
  }

  const appRaw = fs.existsSync(appPath) ? fs.readFileSync(appPath, "utf8") : "";
  const surface = surfaceCalls(appRaw, table.ops);
  return { ok: true, why: null, opCodes, surface, publicOps: new Set(table.ungated || []), unrouted: unrouted.sort(),
           ops: table.ops };
}
