#!/usr/bin/env node
// words-convert: the one-pass conversion codemod of build/plan/words-B-design.md section 9 (K3930).
//   node build/tools/words-convert.mjs <product-root> [--write] [--no-coerce] [--report <file>]
//   (each non-literal variable is passed as String(expr), so a null or undefined value renders as the template did, not as WORD_VAR_MISSING; --no-coerce passes the bare expression)
//   node build/tools/words-convert.mjs --verify <report>
// Candidates are exactly the sites checks/words.mjs reports as `inline` (untagged, copy, table) and `testcopy` (exact),
// taken from the check itself (its module list included). Each is mapped to its AST node (acorn) and replaced by exact
// source range, back to front. Rules: (a) word('key'[, vars]) for a row-equal sentence; (b) localize('id','en'[, vars]);
// (c) localize(...) for a hand-written table's value; (d) word('key'[, vars]) for a test copy of a row. Everything else is
// listed for judgment with its reason. Without --write nothing is written. Never commits.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, basename, extname, posix, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const ACORN = process.env.WORDS_CONVERT_ACORN || '/opt/node-tools/node_modules/acorn/dist/acorn.mjs';
const CHECKS = process.env.WORDS_CONVERT_CHECKS || '/home/user/civicos-process/checks';
const acorn = await import(pathToFileURL(ACORN).href);
const { checkWords, WORDS_JSON, DRAWN_MODULES } = await import(pathToFileURL(`${CHECKS}/words.mjs`).href);
const { readModules, ownerIndex } = await import(pathToFileURL(`${CHECKS}/lib.mjs`).href);

const SIGNED = new Set(['case-grammar', 'case-checker', 'publication', 'contradiction', 'strength']);
const OWN = 'setup-words';
const KEY_ID = /^[a-z][a-z0-9_-]*(\.[A-Za-z0-9_-]+)+$/; // the words check's KEY_RE: an id the marker may carry
const MARKER = 'localize'; // setup-words R14's marker, named so no file of the tree binds it already (K3943)
const WORDS_INDEX = 'bio-plane/src/setup-words/index.mjs';
const PH = /\{([A-Za-z0-9_]+)\}/g;
const HAS_PH = /\{[A-Za-z0-9_]+\}/;
const HTML = /<\/?[A-Za-z!][^>]*>/;
const nlx = (s) => s.replace(/\r\n/g, '\n');

export function excerpt(v) {
  const s = v.replace(/\s+/g, ' ').trim();
  return JSON.stringify(s.length > 70 ? s.slice(0, 67) + '...' : s);
}

// ---- parsing ----------------------------------------------------------------------------------------------------------
export function parseSource(src) {
  for (const sourceType of ['module', 'script']) {
    const comments = [];
    try { return { ast: acorn.parse(src, { ecmaVersion: 'latest', sourceType, locations: true, allowHashBang: true, onComment: comments }), sourceType, comments }; } catch { /* next */ }
  }
  return null;
}

function walk(node, parent, inTpl, visit) {
  node._p = parent;
  visit(node, inTpl);
  for (const k of Object.keys(node)) {
    if (k === '_p' || k === 'loc') continue;
    const v = node[k];
    const sub = inTpl || (node.type === 'TemplateLiteral' && k === 'expressions');
    if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') walk(c, node, sub, visit); }
    else if (v && typeof v.type === 'string') walk(v, node, sub, visit);
  }
}

// every name the file binds anywhere (declaration, parameter, destructuring, import, catch, function/class name)
function patNames(p, out) {
  if (!p) return;
  switch (p.type) {
    case 'Identifier': out.add(p.name); break;
    case 'ObjectPattern': for (const q of p.properties) patNames(q.type === 'RestElement' ? q.argument : q.value, out); break;
    case 'ArrayPattern': for (const q of p.elements) patNames(q, out); break;
    case 'AssignmentPattern': patNames(p.left, out); break;
    case 'RestElement': patNames(p.argument, out); break;
  }
}
function boundNames(ast, skipSpec) {
  const out = new Set();
  walk(ast, null, false, (n) => {
    switch (n.type) {
      case 'VariableDeclarator': patNames(n.id, out); break;
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression':
        if (n.id) out.add(n.id.name);
        for (const p of n.params) patNames(p, out);
        break;
      case 'ClassDeclaration': case 'ClassExpression': if (n.id) out.add(n.id.name); break;
      case 'CatchClause': patNames(n.param, out); break;
      case 'ImportSpecifier': case 'ImportDefaultSpecifier': case 'ImportNamespaceSpecifier':
        if (!skipSpec.has(n)) out.add(n.local.name);
        break;
    }
  });
  return out;
}

// ---- names, ids, source text --------------------------------------------------------------------------------------------
export function slug(text) {
  const words = text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
  return words.slice(0, 5).join('_') || 's';
}
const stemOf = (file) => basename(file).replace(/\.[^.]*$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
const TOSTR = new Set(['toString', 'toFixed', 'toISOString', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString', 'join', 'trim', 'slice', 'toUpperCase', 'toLowerCase', 'padStart', 'padEnd']);
function exprName(e) {
  switch (e?.type) {
    case 'Identifier': return e.name;
    case 'MemberExpression': return e.computed ? (e.property.type === 'Literal' && /^[A-Za-z_]\w*$/.test(String(e.property.value)) ? String(e.property.value) : null) : e.property.name;
    case 'CallExpression': case 'NewExpression': {
      const c = e.callee;
      if (c.type === 'MemberExpression' && !c.computed && TOSTR.has(c.property.name)) return exprName(c.object);
      return exprName(c);
    }
    case 'AwaitExpression': return exprName(e.argument);
    case 'ChainExpression': return exprName(e.expression);
    default: return null;
  }
}
export function quoteStr(s, q) {
  let o = '';
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === '\\') o += '\\\\';
    else if (ch === q) o += '\\' + q;
    else if (ch === '\n') o += '\\n';
    else if (ch === '\r') o += '\\r';
    else if (ch === '\t') o += '\\t';
    else if (c === 0x2028 || c === 0x2029) o += '\\u' + c.toString(16);
    else if (c < 0x20) o += '\\x' + c.toString(16).padStart(2, '0');
    else o += ch;
  }
  return q + o + q;
}

// ---- why a site is not converted, from its place in the tree ----------------------------------------------------------------
// `+` chains: a string-valued `+` node (one whose operands include a string literal or a template, so the whole sum is a
// concatenation from the start) is flattened to its operands; a numeric sum such as `a + b` inside it stays one operand.
const isStrNode = (n) => (n.type === 'Literal' && typeof n.value === 'string') || n.type === 'TemplateLiteral' || (n.type === 'BinaryExpression' && n.operator === '+' && (isStrNode(n.left) || isStrNode(n.right)));
export function flat(n, out = []) {
  if (n.type === 'BinaryExpression' && n.operator === '+' && isStrNode(n)) { flat(n.left, out); flat(n.right, out); } else out.push(n);
  return out;
}
// operands -> { cooked: [text between expressions], exprs: [nodes] } (null when a template has an invalid escape)
export function partsOf(operands) {
  const cooked = [''], exprs = [];
  for (const o of operands) {
    if (o.type === 'Literal' && typeof o.value === 'string') cooked[cooked.length - 1] += o.value;
    else if (o.type === 'TemplateLiteral') {
      for (let i = 0; i < o.quasis.length; i++) {
        const c = o.quasis[i].value.cooked; if (c == null) return null;
        cooked[cooked.length - 1] += c;
        if (i < o.expressions.length) { exprs.push(o.expressions[i]); cooked.push(''); }
      }
    } else { exprs.push(o); cooked.push(''); }
  }
  return { cooked, exprs };
}
// the checker's text for a chain (one `{}` per run of non-literal operands; a template's `{}` counts as text)
function checkerText(operands) {
  let text = '';
  for (const o of operands) {
    if (o.type === 'Literal' && typeof o.value === 'string') text += o.value;
    else if (o.type === 'TemplateLiteral') { if (o.quasis.some((q) => q.value.cooked == null)) return null; text += o.quasis.map((q) => q.value.cooked).join('{}'); }
    else if (!text.endsWith('{}')) text += '{}';
  }
  return text;
}
const chainRoot = (n) => { let r = n; while (r._p && r._p.type === 'BinaryExpression' && r._p.operator === '+') r = r._p; return r; };

function contextReason(node, isTest) {
  const p = node._p;
  if (!p) return null;
  switch (p.type) {
    case 'Property': if (p.key === node) return 'object property key'; break;
    case 'MethodDefinition': case 'PropertyDefinition': if (p.key === node) return 'class member key'; break;
    case 'MemberExpression': if (p.property === node && p.computed) return 'computed member key'; break;
    case 'AssignmentPattern': if (p.right === node) return 'default parameter'; break;
    case 'SwitchCase': if (p.test === node) return 'switch case'; break;
    case 'TaggedTemplateExpression': if (p.quasi === node) return 'tagged template'; break;
    case 'ImportDeclaration': case 'ExportNamedDeclaration': case 'ExportAllDeclaration': if (p.source === node) return 'import specifier'; break;
    case 'ImportSpecifier': case 'ExportSpecifier': return 'import specifier';
    case 'NewExpression': case 'CallExpression': if (p.callee.type === 'Identifier' && p.callee.name === 'RegExp' && p.arguments[0] === node) return 'regex'; break;
    case 'BinaryExpression': if (!isTest && ['===', '!==', '==', '!='].includes(p.operator)) return 'compared as a value (not shown)'; break;
  }
  let c = node;
  while (c._p) {
    const q = c._p;
    if (q.type === 'AssignmentExpression' && q.operator === '+=' && q.right === c) return 'string concatenation (+=)';
    if ((q.type === 'ConditionalExpression' && q.test !== c) || q.type === 'LogicalExpression' || q.type === 'ChainExpression') { c = q; if (c._p && c._p.type === 'BinaryExpression' && c._p.operator === '+') return 'string concatenation (operand is a conditional or logical expression)'; continue; }
    break;
  }
  return null;
}

// ---- the words table ------------------------------------------------------------------------------------------------------
function loadRows(root) {
  const p = join(root, WORDS_JSON);
  const rows = existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')).words || []) : [];
  const keys = new Set(), byEn = new Map(), byNorm = new Map(), en = new Map();
  for (const r of rows) {
    keys.add(r.key);
    if (typeof r.en !== 'string') continue;
    en.set(r.key, r.en);
    const names = [...r.en.matchAll(PH)].map((m) => m[1]);
    if (!names.length) { if (!byEn.has(r.en)) byEn.set(r.en, []); byEn.get(r.en).push(r.key); }
    else { const n = r.en.replace(PH, '{}'); if (!byNorm.has(n)) byNorm.set(n, []); byNorm.get(n).push({ key: r.key, names }); }
  }
  return { keys, byEn, byNorm, en };
}

// files the module's tests require to load nothing, or to import only a named leaf (found from the red tests of the dry runs): never given an import; a trailing / is a directory
export const LEAVES = new Set(['bio-plane/src/duties/vocab.mjs', 'bio-plane/src/setup-fleet.mjs', 'doctypes/staff-directory.mjs', 'stewards/src/']);
// a word the setup-words tests ban in any row (bio-plane/test/m/setup-words/word-list.test.mjs: R8's control)
const BANNED = /labelled/i;

// ---- the conversion -----------------------------------------------------------------------------------------------------------
export async function convert(root, { write = false, coerce = true, leaves = LEAVES } = {}) {
  root = resolve(root);
  const rows = loadRows(root);
  const state = readModules(root);
  const owner = ownerIndex(state);
  const target = resolve(root, WORDS_INDEX);
  const chk = await checkWords(root);
  const rep = { root, written: write, coerce, summary: chk.summary, counts: {}, totals: { a: 0, b: 0, c: 0, d: 0 }, judgments: [], judgmentCounts: {}, ids: [], filesEdited: [], usesAdded: [], converted: [], concat: { itemsConverted: 0, itemsJudged: {} } };
  const J = (module, file, line, reason, raw) => {
    const key = reason.replace(/\(.*\)/, '').replace(/: .*$/, '').trim();
    rep.judgments.push({ module, file, line, reason, excerpt: excerpt(raw ?? '') });
    rep.judgmentCounts[key] = (rep.judgmentCounts[key] || 0) + 1;
  };

  const byFile = new Map();
  for (const it of chk.items) {
    let reason = null, cand = false;
    if (it.arm === 'inline') {
      if (['', 'copy', 'table', 'stitched'].includes(it.tag)) cand = true;
      else reason = it.tag === '?' ? 'custom error class message (?)' : it.tag === 'unkeyed' ? 'unkeyed (design: no member reads)' : `inline tag ${it.tag}`;
    } else if (it.arm === 'testcopy') {
      if (it.tag === '') cand = true; else reason = 'part test copy';
    } else if (it.arm === 'handlist') reason = 'handlist';
    else continue; // marker, missingkey, unreviewed: not candidates
    if (cand && DRAWN_MODULES(it.module)) { J(it.module, it.file, it.line, 'drawn module: its L11 job', it.raw); continue; }
    if (cand && SIGNED.has(it.module)) { J(it.module, it.file, it.line, 'signed or pinned text', it.raw); continue; }
    if (cand && it.module === OWN) { J(it.module, it.file, it.line, 'setup-words own module (its job)', it.raw); continue; }
    if (cand && [...leaves].some((l) => it.file === l || (l.endsWith('/') && it.file.startsWith(l)))) { J(it.module, it.file, it.line, 'leaf: loads nothing', it.raw); continue; }
    if (!cand) { J(it.module, it.file, it.line, reason, it.raw); continue; }
    if (!byFile.has(it.file)) byFile.set(it.file, []);
    byFile.get(it.file).push(it);
  }

  const usedIds = new Set(rows.keys);
  const fileResults = [];

  for (const file of [...byFile.keys()].sort()) {
    const items = byFile.get(file);
    const abs = join(root, file);
    const own = owner(file);
    const isTest = own?.role === 'tests';
    const judgeAll = (reason) => { for (const it of items) J(it.module, file, it.line, reason, it.raw); };
    let src;
    try { src = readFileSync(abs, 'utf8'); } catch { judgeAll('unreadable'); continue; }
    const parsed = parseSource(src);
    if (!parsed) { judgeAll('unparsable (not edited)'); continue; }
    if (parsed.sourceType !== 'module' || extname(file) === '.cjs') { judgeAll('non-module (script or CommonJS)'); continue; }
    const { ast, comments } = parsed;
    let cjs = false, hasEsm = false;
    const nodes = [], roots = new Map();
    walk(ast, null, false, (n, inTpl) => {
      if (n.type === 'ImportDeclaration' || n.type.startsWith('Export')) hasEsm = true;
      if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'require') cjs = true;
      if (n.type === 'MemberExpression' && n.object.name === 'module' && n.property.name === 'exports') cjs = true;
      if (inTpl) return;
      if (n.type === 'Literal' && typeof n.value === 'string' && n._p?.directive === undefined) nodes.push(n);
      else if (n.type === 'TemplateLiteral') nodes.push(n);
      if (n.type === 'BinaryExpression' && n.operator === '+' && isStrNode(n) && !(n._p?.type === 'BinaryExpression' && n._p.operator === '+')) roots.set(n, null);
    });
    if (cjs && !hasEsm) { judgeAll('non-module (script or CommonJS)'); continue; }

    const dir = dirname(abs);
    const imports = ast.body.filter((s) => s.type === 'ImportDeclaration');
    const existing = imports.find((d) => { const r = d.source.value.startsWith('.') ? resolve(dir, d.source.value) : null; return r === target; });
    const local = { word: 'word', t: MARKER };
    const have = { word: false, t: false };
    if (existing) for (const s of existing.specifiers) if (s.type === 'ImportSpecifier' && (s.imported.name === 'word' || s.imported.name === MARKER)) { const k = s.imported.name === MARKER ? 't' : 'word'; local[k] = s.local.name; have[k] = true; }
    const skip = new Set(existing ? existing.specifiers.filter((s) => s.type === 'ImportSpecifier' && (s.imported.name === 'word' || s.imported.name === MARKER)) : []);
    const bound = boundNames(ast, skip);
    const boundFn = { word: bound.has(local.word), t: bound.has(local.t) };
    const q1 = (() => { let s = 0, d = 0; for (const n of nodes) if (n.type === 'Literal') { if (n.raw[0] === "'") s++; else if (n.raw[0] === '"') d++; } return d > s ? '"' : "'"; })();
    const semi = (() => { const d = imports[0] || ast.body[0]; return d ? src[d.end - 1] === ';' : true; })();
    const nl = src.includes('\r\n') ? '\r\n' : '\n';
    const commentIn = (a, b) => comments.some((c) => c.start >= a && c.end <= b);

    // checker findings -> nodes
    const byLine = new Map();
    for (const n of nodes) {
      const cooked = n.type === 'Literal' ? [n.value] : n.quasis.map((x) => x.value.cooked);
      if (cooked.includes(null)) continue;
      const val = nlx(cooked.join('{}'));
      const l = n.loc.start.line;
      if (!byLine.has(l)) byLine.set(l, []);
      byLine.get(l).push({ n, val, cooked, used: false });
    }
    const chainsByLine = new Map();
    for (const r of roots.keys()) {
      const ops = flat(r); const ck = checkerText(ops); if (ck == null) continue;
      const l = ops[0].loc.start.line;
      if (!chainsByLine.has(l)) chainsByLine.set(l, []);
      chainsByLine.get(l).push({ r, ops, ck });
    }

    const sites = [];       // planned conversions of this file
    const done = new Map(); // site key (start) -> outcome, so a chain hit by several findings is planned once
    items.sort((a, b) => a.line - b.line);
    const tally = (viaConcat, outcome) => { if (!viaConcat) return; if (outcome === true) rep.concat.itemsConverted++; else rep.concat.itemsJudged[outcome] = (rep.concat.itemsJudged[outcome] || 0) + 1; };

    for (const it of items) {
      let target_ = null, viaConcat = false; // { node(for position/context), start, end, cooked, exprs, kind }
      if (it.tag === 'stitched') {
        const c = (chainsByLine.get(it.line) || []).find((x) => x.ck === nlx(it.raw));
        if (!c) { J(it.module, file, it.line, 'stitched (not matched to a + chain)', it.raw); continue; }
        target_ = { node: c.r, ops: c.ops, kind: 'chain' }; viaConcat = true;
      } else {
        const cands = byLine.get(it.line) || [];
        let hit;
        if (it.arm === 'inline') hit = cands.find((c) => !c.used && c.val === nlx(it.raw));
        else hit = cands.find((c) => {
          if (c.used) return false;
          if (c.n.type === 'Literal') return excerpt(c.val) === it.raw;
          return c.val.split('{}').some((ch) => ch.length >= 25 && excerpt(ch) === it.raw) || excerpt(c.val) === it.raw;
        });
        if (!hit) { J(it.module, file, it.line, 'no AST match for the finding', it.raw); continue; }
        hit.used = true;
        const p = hit.n._p;
        if (p && p.type === 'BinaryExpression' && p.operator === '+') { const r = chainRoot(hit.n); target_ = { node: r, ops: flat(r), kind: 'chain' }; viaConcat = true; }
        else target_ = { node: hit.n, kind: 'node', cooked: hit.cooked };
      }
      const node = target_.node;
      const key = node.start;
      if (done.has(key)) { const o = done.get(key); if (o.reason) J(it.module, file, it.line, o.reason, it.raw); tally(viaConcat, o.reason ?? true); continue; }
      const jj = (r) => { done.set(key, { reason: r }); J(it.module, file, it.line, r, it.raw); tally(viaConcat, r.replace(/\(.*\)/, '').replace(/: .*$/, '').trim()); };

      const cr = contextReason(node, isTest);
      if (cr) { jj(cr); continue; }
      let cooked, exprs;
      if (target_.kind === 'chain') { const pp = partsOf(target_.ops); if (!pp) { jj('template with invalid escape'); continue; } ({ cooked, exprs } = pp); }
      else if (node.type === 'TemplateLiteral') { cooked = target_.cooked; exprs = node.expressions; }
      else { cooked = [node.value]; exprs = []; }
      const nexp = exprs.length;
      if (node.type !== 'Literal' && commentIn(node.start, node.end)) { jj('comment inside the expression'); continue; }
      if (cooked.some((c) => HAS_PH.test(c))) { jj('text holds a literal {name}, filled by its caller'); continue; }
      if (cooked.some((c) => /[{}]/.test(c))) { jj('text holds braces (ICU syntax in t)'); continue; }
      if (!isTest && HTML.test(cooked.join(' '))) { jj('HTML string'); continue; }
      const exprSrc = (e) => {
        const s = src.slice(e.start, e.end);
        if (coerce && e.type !== 'Literal' && e.type !== 'TemplateLiteral') return `String(${s})`;
        return e.type === 'SequenceExpression' ? `(${s})` : s;
      };
      const staticText = cooked.join('{}');
      let rule = null, fn = null, rowKey = null, vars = null;
      if (nexp === 0) {
        const keys = rows.byEn.get(cooked.join(''));
        if (keys?.length === 1) { rule = isTest ? 'd' : 'a'; fn = 'word'; rowKey = keys[0]; vars = []; }
        else if (keys?.length > 1) { jj(`ambiguous: ${keys.length} rows share this en (${keys.slice(0, 3).join(', ')})`); continue; }
      } else {
        const ms = (rows.byNorm.get(staticText) || []).filter((m) => m.names.length === nexp);
        if (ms.length === 1) {
          const map = new Map(); let bad = false;
          ms[0].names.forEach((nm, i) => { const s = exprSrc(exprs[i]); if (map.has(nm) && map.get(nm) !== s) bad = true; map.set(nm, s); });
          if (bad) { jj('row placeholder repeated with different expressions'); continue; }
          rule = isTest ? 'd' : 'a'; fn = 'word'; rowKey = ms[0].key; vars = [...map];
        } else if (ms.length > 1) { jj(`ambiguous: ${ms.length} rows share this template (${ms.slice(0, 3).map((m) => m.key).join(', ')})`); continue; }
      }
      if (!rule) {
        if (isTest) { jj(nexp ? 'partial test copy (template not matched to a row)' : 'test copy not matched to a row'); continue; }
        if (BANNED.test(cooked.join(' '))) { jj('spelling: fix in the module\'s job'); continue; }
        rule = it.tag === 'table' ? 'c' : 'b'; fn = 't';
      }
      // a row-equal sentence in a file that binds `word` itself reads the row through the marker by its key (the table wins)
      let keyed = false;
      if (fn === 'word' && boundFn.word && !boundFn.t && KEY_ID.test(rowKey)) { fn = 't'; keyed = true; }
      if (boundFn[fn]) { jj(`${local[fn]} already bound`); continue; }
      const quote = node.type === 'Literal' ? node.raw[0] : q1;
      let id = null, enArg = null, enText = null;
      if (keyed) { id = rowKey; enText = rows.en.get(rowKey); enArg = quoteStr(enText, quote); }
      else if (fn === 't') {
        const used = new Set(); let vi = 0; let text = '';
        vars = [];
        for (let i = 0; i < cooked.length; i++) {
          text += cooked[i];
          if (i < nexp) {
            let nm = exprName(exprs[i]);
            if (nm) nm = nm.replace(/[^A-Za-z0-9_]/g, '');
            if (!nm) nm = `v${++vi}`;
            const base = nm; let k = 2; while (used.has(nm)) nm = `${base}_${k++}`;
            used.add(nm); text += `{${nm}}`; vars.push([nm, exprSrc(exprs[i])]);
          }
        }
        const base = `${it.module}.${stemOf(file)}.${slug(text)}`; id = base;
        for (let k = 2; usedIds.has(id); k++) id = `${base}_${k}`;
        usedIds.add(id);
        enText = text;
        enArg = node.type === 'Literal' ? src.slice(node.start, node.end) : quoteStr(text, quote);
      }
      const L = local[fn];
      const varsTxt = vars.length ? `, { ${vars.map(([nm, s]) => (nm === s ? nm : `${nm}: ${s}`)).join(', ')} }` : '';
      const call = fn === 'word' ? `${L}(${quoteStr(rowKey, quote)}${varsTxt})` : `${L}(${quoteStr(id, quote)}, ${enArg}${varsTxt})`;
      const site = { module: it.module, file, line: it.line, rule, fn, id: fn === 't' ? id : rowKey, en: enText, origSrc: src.slice(node.start, node.end), call, start: node.start, end: node.end, viaConcat, tag: it.tag };
      done.set(key, { site });
      sites.push(site);
      tally(viaConcat, true);
    }
    if (sites.length) fileResults.push({ file, abs, src, ast, imports, existing, have, q1, semi, nl, sites, isCode: !isTest, module: sites[0].module });
  }

  // overlap: a site that contains another site is moved to judgment (the inner one is converted)
  for (const fr of fileResults) {
    fr.sites.sort((a, b) => a.start - b.start || b.end - a.end);
    const keep = [];
    for (const s of fr.sites) {
      while (keep.length && s.start < keep[keep.length - 1].end) { const o = keep.pop(); J(o.module, fr.file, o.line, 'contains another converted site', o.origSrc); }
      keep.push(s);
    }
    fr.sites = keep;
  }

  const bump = (m, r) => { (rep.counts[m] ??= { a: 0, b: 0, c: 0, d: 0 })[r]++; rep.totals[r]++; };
  const gained = new Set();
  for (const fr of fileResults) {
    const { file, abs, src, ast, imports, existing, have, q1, semi, nl, sites } = fr;
    if (!sites.length) continue;
    const dir = dirname(abs);
    const edits = sites.map((s) => ({ start: s.start, end: s.end, text: s.call, site: s }));
    const need = new Set(sites.map((s) => s.fn));
    const add = ['word', 't'].filter((n) => need.has(n) && !have[n]).map((n) => (n === 't' ? MARKER : n));
    if (add.length) {
      const named = existing?.specifiers.filter((s) => s.type === 'ImportSpecifier');
      if (existing && named.length) edits.push({ start: named[named.length - 1].end, end: named[named.length - 1].end, text: add.map((n) => `, ${n}`).join('') });
      else {
        let rel = relative(dir, target).split(sep).join('/'); if (!rel.startsWith('.')) rel = './' + rel;
        const stmt = `import { ${add.join(', ')} } from ${quoteStr(rel, q1)}${semi ? ';' : ''}`;
        if (imports.length) { const last = imports[imports.length - 1]; edits.push({ start: last.end, end: last.end, text: nl + stmt }); }
        else { const first = ast.body.find((s) => !(s.type === 'ExpressionStatement' && s.directive)) || ast.body[ast.body.length - 1]; edits.push({ start: first.start, end: first.start, text: stmt + nl + nl }); }
      }
      if (fr.isCode && !existing) gained.add(fr.module);
    }
    edits.sort((a, b) => a.start - b.start || a.end - b.end);
    for (let i = 1; i < edits.length; i++) if (edits[i].start < edits[i - 1].end) throw new Error(`overlapping edits in ${file}`);
    let delta = 0;
    for (const e of edits) { e.newStart = e.start + delta; delta += e.text.length - (e.end - e.start); e.newEnd = e.newStart + e.text.length; }
    let out = src;
    for (const e of [...edits].reverse()) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    for (const e of edits) {
      const s = e.site; if (!s) continue;
      bump(s.module, s.rule);
      rep.converted.push({ module: s.module, file, line: s.line, rule: s.rule, fn: s.fn, id: s.id, origSrc: s.origSrc, call: s.call, newStart: e.newStart, newEnd: e.newEnd, viaConcat: s.viaConcat });
      if (s.fn === 't') rep.ids.push({ id: s.id, en: s.en, file, line: s.line });
    }
    rep.filesEdited.push(file);
    if (write) writeFileSync(abs, out);
  }

  // modules.json: each module that gained an import of setup-words declares it in `uses`
  const mj = join(root, 'build/modules.json');
  let mtext = readFileSync(mj, 'utf8');
  for (const id of [...gained].sort()) {
    if (id === OWN) continue;
    const m = state.modules.find((x) => x.id === id);
    if (!m || (m.uses || []).includes(OWN)) continue;
    const re = new RegExp(`("id":\\s*"${id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}"[^\\n]*?"uses":\\s*\\[)([^\\]]*)(\\])`);
    const mm = re.exec(mtext);
    if (!mm) { J(id, 'build/modules.json', 0, 'uses not edited: module line not found', id); continue; }
    const inner = mm[2].trim() ? `${mm[2]}, "${OWN}"` : `"${OWN}"`;
    mtext = mtext.slice(0, mm.index) + mm[1] + inner + mm[3] + mtext.slice(mm.index + mm[0].length);
    rep.usesAdded.push(id);
  }
  if (write && rep.usesAdded.length) {
    writeFileSync(mj, mtext);
    const back = JSON.parse(readFileSync(mj, 'utf8'));
    for (const id of rep.usesAdded) if (!back.modules.find((x) => x.id === id).uses.includes(OWN)) throw new Error(`modules.json read-back: ${id} lacks ${OWN}`);
  }
  rep.judgments.sort((a, b) => a.module.localeCompare(b.module) || a.file.localeCompare(b.file) || a.line - b.line);
  return rep;
}

// ---- the verifier ---------------------------------------------------------------------------------------------------------------
function fill(en, vars, what) {
  return en.replace(PH, (_, n) => {
    if (!Object.hasOwn(vars, n) || vars[n] == null) throw new Error(`${what} needs {${n}}`);
    return String(vars[n]);
  });
}
export function verify(rep) {
  const rows = loadRows(rep.root);
  const mism = [];
  for (const c of rep.converted) {
    const where = `${c.file}:${c.line}`;
    try {
      if (rep.written) {
        const cur = readFileSync(join(rep.root, c.file), 'utf8');
        if (cur.slice(c.newStart, c.newEnd) !== c.call) { mism.push({ where, why: 'edited file does not hold the call at the recorded range' }); continue; }
      }
      const PRIV = /(?<![\w$])#(?=[A-Za-z_$])/g; // a private name parses outside its class only as a plain name of equal length
      const cs = c.call.replace(PRIV, '_'), os = c.origSrc.replace(PRIV, '_');
      const call = acorn.parseExpressionAt(cs, 0, { ecmaVersion: 'latest' });
      const args = call.arguments;
      const lit = (a) => { if (a?.type !== 'Literal' || typeof a.value !== 'string') throw new Error('argument is not a string literal'); return a.value; };
      const first = lit(args[0]);
      const objArg = c.fn === 'word' ? args[1] : args[2];
      const vars = {}, valueSrc = {};
      if (objArg) for (const p of objArg.properties) { const k = p.key.name ?? p.key.value; vars[k] = `«${k}»`; valueSrc[k] = cs.slice(p.value.start, p.value.end); }
      let en;
      if (c.fn === 'word') { if (!rows.en.has(first)) throw new Error(`UNKNOWN_WORD ${first}`); en = rows.en.get(first); }
      else { en = rows.en.has(first) ? rows.en.get(first) : lit(args[1]); if (rows.en.has(first) && lit(args[1]) !== rows.en.get(first)) throw new Error(`id ${first} is a words.json key with another en`); }
      const got = fill(en, vars, first);
      // the original, rendered with the same samples by placeholder position
      const o = acorn.parseExpressionAt(os, 0, { ecmaVersion: 'latest' });
      const pp = partsOf(flat(o));
      if (!pp) throw new Error('original has an invalid escape');
      const names = [...en.matchAll(PH)].map((m) => m[1]);
      if (names.length !== pp.exprs.length) throw new Error(`placeholders ${names.length} != expressions ${pp.exprs.length}`);
      let want = '';
      pp.cooked.forEach((t, i) => {
        want += t;
        if (i < pp.exprs.length) {
          const e = pp.exprs[i], s = os.slice(e.start, e.end);
          const vs = valueSrc[names[i]];
          if (vs !== s && vs !== `(${s})` && vs !== `String(${s})`) throw new Error(`{${names[i]}} is bound to ${vs}, not ${s}`);
          want += `«${names[i]}»`;
        }
      });
      if (got !== want) mism.push({ where, why: 'text differs', want, got });
    } catch (e) { mism.push({ where, why: e.message }); }
  }
  return mism;
}

export function summarize(rep) {
  const L = [];
  L.push(`words-convert ${rep.written ? '(written)' : '(dry, nothing written)'} in ${rep.root}`);
  L.push(`concatenation findings: ${rep.concat.itemsConverted} converted; judged ${JSON.stringify(rep.concat.itemsJudged)}; modules.json uses added to ${rep.usesAdded.length} modules`);
  L.push(`converted a ${rep.totals.a}, b ${rep.totals.b}, c ${rep.totals.c}, d ${rep.totals.d}; files edited ${rep.filesEdited.length}; judgments ${rep.judgments.length}`);
  for (const [m, c] of Object.entries(rep.counts).sort()) L.push(`  ${m}: a ${c.a} b ${c.b} c ${c.c} d ${c.d}`);
  L.push('judgments by reason:');
  for (const [r, n] of Object.entries(rep.judgmentCounts).sort((x, y) => y[1] - x[1])) L.push(`  ${n}  ${r}`);
  return L.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2);
  const val = (f) => { const i = args.indexOf(f); return i < 0 ? null : args[i + 1]; };
  if (args.includes('--verify')) {
    const rep = JSON.parse(readFileSync(val('--verify'), 'utf8'));
    const mism = verify(rep);
    for (const m of mism) console.log(`MISMATCH ${m.where}: ${m.why}${m.want !== undefined ? `\n  want ${JSON.stringify(m.want)}\n  got  ${JSON.stringify(m.got)}` : ''}`);
    console.log(`verify: ${rep.converted.length} sites, ${mism.length} mismatches`);
    process.exitCode = mism.length ? 1 : 0;
  } else {
    const root = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--report');
    if (!root) { console.error('usage: words-convert.mjs <product-root> [--write] [--report <file>] | --verify <report>'); process.exit(2); }
    const rep = await convert(root, { write: args.includes('--write'), coerce: !args.includes('--no-coerce') });
    const text = summarize(rep);
    const rf = val('--report');
    if (rf) { writeFileSync(rf, JSON.stringify(rep)); writeFileSync(rf.replace(/\.json$/, '') + '.summary.txt', text + '\n'); }
    console.log(text);
  }
}
