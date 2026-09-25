#!/usr/bin/env node
/* pensweep.mjs — M0-182's SWEEP: where every control driver keeps its PRISTINE COPY.
 *
 * THE DEFECT. A negative-control driver copies the sources it is about to break into a PEN and restores
 * from it. Across this estate that pen was a directory or a sibling file INSIDE THE WORKTREE, so the tree
 * is DIRTY for as long as the control runs — and a dirty tree is not a neutral inconvenience here: since
 * D-293 a gate on one RECORDS NOTHING, repository-walking suites WALK the pen (REC-185's `.rec185/` moved
 * the battery's assertion total with no source change), and `gates.mjs` §2e reads it as under-inclusion. A
 * pen written BESIDE its source (`${file}.pristine-<arm>`) is worse: it is undeclared, so no `.gitignore`
 * line covers it, and an interrupted arm leaves an untracked copy of a source file where the next walk
 * enrols it as a source.
 *
 * THE RULINGS. BOB #32 (2026-09-24, `kickoffs/WORKER.md`) put a driver's pristine copies OUTSIDE the
 * worktree. BOB #33 (17:12Z, M0-172) held that an in-worktree pen which is DECLARED — gitignored and
 * item-named — is a driver's own mechanism and STANDS; M0-172's scope-add is that an UNDECLARED one does
 * not. M0-182 takes the `nc-*.mjs` class and the seven pens no `.gitignore` line covered to one helper,
 * `controlPen(item)` in `test/pen.mjs` — `mkdtempSync(join(tmpdir(), "nc-<item>-"))`.
 *
 * THE QUESTION THIS ASKS, and why it is this one. Not "which call writes a pen" — a driver's pen and its
 * ARM both write, its writes go through its own helpers, and a destination that arrives as a PARAMETER is
 * invisible to any walk over call sites (measured on this estate's first draft: 229 of 286 drivers graded
 * UNCLASSIFIED because `writeFileSync(file, …)` says nothing about `file`). The property that actually
 * costs us anything is DIRTINESS, and that is a property of the PATH, not of the call: so this walk asks
 *
 *      DOES THIS DRIVER NAME A PATH INSIDE THE WORKTREE THAT GIT NEITHER TRACKS NOR IGNORES?
 *
 * A path the driver names is one it builds from its OWN constants, which is what a pen root is. A path git
 * TRACKS is the driver's SUBJECT — the source it breaks and restores, in the worktree by necessity. A path
 * git IGNORES is a DECLARED pen, which BOB #33 let stand. What is left — untracked and unignored, inside
 * the tree — is the pen this row moves, and it is named per path, never counted in aggregate.
 *
 *   TEMP                  every path the driver names is OUTSIDE the worktree (`controlPen(`, `tmpdir()`,
 *                         an absolute path under /tmp or /var/folders) and none is dirty. The end state.
 *                         THE GRADE IS ABOUT THE PATHS NAMED, NEVER ABOUT A PEN IDENTIFIED: a driver whose
 *                         temp path is a scratch ESTATE while its pen is built at runtime reads TEMP too.
 *                         MEASURED, and this is why the wording matters: 55 driver files on this estate
 *                         spell `mkdtempSync(join(tmpdir(), …))` and only 7 spell it for a PEN (D-478's
 *                         census, 2026-09-24). What TEMP supports is "names nothing inside the tree" —
 *                         the property that costs us something — and not "its pen is outside".
 *   MEMORY                the driver names NO pen at all: it holds its pristine text in a variable and
 *                         restores from that. Also honest, and the cheapest pen there is.
 *   IN-WORKTREE/declared  its only in-worktree pen paths are ones a `.gitignore` line covers (BOB #33).
 *   IN-WORKTREE/DIRTY     it names at least one untracked, unignored path inside the worktree. NAMED.
 *   UNCLASSIFIED          a path expression that resolves to neither a temp root nor a definite worktree
 *                         path. NAMED, never scored — and a FAILING grade for the floored class, because a
 *                         destination the matcher cannot read is not evidence of a pen outside the tree.
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: build the pen path at RUNTIME out of something this
 * walk cannot resolve (a parameter, another module, a `.replace()` on an unknown) and be graded MEMORY,
 * because a driver that names no path names no dirty one. That blind spot is the reason the floored class
 * is ALSO verified by running each control and reading `git status` — the sweep is the ratchet, the run is
 * the evidence — and the reason `pen-sweep.test.mjs` drives a scratch estate whose every grade is known,
 * both directions, including a driver whose pen is hidden behind a parameter.
 *
 * WHAT IT CAN SEE. Path expressions: a `join`/`resolve`/`normalize` call, a string literal holding a `/` or
 * spelled as a dot-name, a template literal with a path in it, and `new URL(…, import.meta.url)`. Each is
 * resolved to a repo-relative path through the file's own `const`/`let` table, `dirname`, `+`,
 * `process.env.X || "<literal>"`, `mkdtempSync(`, `controlPen(`, `tmpdir()`, `fileURLToPath(import.meta.url)`,
 * `process.cwd()`, and an object property whose key is defined in the same file; an interpolation it cannot
 * resolve becomes a `*` and the path is matched as a pattern.
 * WHAT IT CANNOT SEE, stated: a path assembled only at runtime (a parameter, an import, a loop variable, a
 * `.replace()` chain on an unknown) — such a path is NOT named here and its driver is graded on the paths it
 * does name; a path written by a spawned command or a shell driver; and `*.control.sh`, which is not read.
 * The question is asked over `stripComments` — comments and regex literals blanked, STRINGS KEPT, because a
 * path IS a string — so a path spelled inside a fixture string is named here, and that is stated rather
 * than hidden.
 *
 * THE CORPUS is `git ls-files --cached --others --exclude-standard`, so an uncommitted driver is swept and
 * an untracked one is not mistaken for a tracked subject. Ignore coverage is asked of `git check-ignore`,
 * never of a hand list of patterns.
 *
 *   node scripts/pensweep.mjs        print the sweep; exit 1 on a DIRTY or UNCLASSIFIED pen in the floored set
 */
import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, isAbsolute, relative, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./walkfloor.mjs";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/* A control driver, recognised by what it IS rather than from a list of names: a negative-control harness
   (`nc-*.mjs`) or a control driver (`*.control.mjs`), anywhere in the estate. */
export const isDriver = (f) => /(^|\/)nc-[^/]*\.mjs$/.test(f) || /\.control\.mjs$/.test(f);

/* THE FLOORED CLASS — what this row moves. Every other driver is graded and NAMED just the same, and its
   dirty-path count is floored as a ratchet by `pen-sweep.test.mjs` so the class cannot grow. */
export const FLOORED = (f) => /^bio-plane\/test\/nc-[^/]*\.mjs$/.test(f) || MOVED_FIRST.has(f);

/* The six drivers that owned the seven pens no `.gitignore` line covered — the row's "FIRST" list. They are
   floored alongside the nc-* class so their pens cannot drift back, which a pinned pen NAME alone would not
   catch (a driver can go dirty under a new name). */
export const MOVED_FIRST = new Set([
  "bio-plane/test/coord.control.mjs", "bio-plane/test/delegations.control.mjs",
  "bio-plane/test/entries.control.mjs", "bio-plane/test/m0107-budget.control.mjs",
  "bio-plane/test/owed-controls.control.mjs", "bio-plane/test/train.control.mjs",
]);

/* THE SEVEN PENS NO `.gitignore` LINE COVERED — the row's "FIRST" list, pinned BY NAME so a returning pen
   fails by name rather than moving a count. `.m0109-harness` is in the list the row gives and no driver in
   the tree names it; that it is named here and found nowhere is the honest answer, and the suite says so. */
export const UNIGNORED_PENS = [
  ".m0110-harness", ".m0109-harness", ".m037-harness", ".m0100-harness",
  ".m0107-harness", ".vf1-control-pristine", ".m0111-harness",
];

/* THE LEDGER: a path a driver NAMES inside the worktree, or a path expression this walk cannot resolve, that
   is NOT this driver's pen — each with WHY, and each pinned to the EXPRESSION that produced it so a driver
   edited out from under its entry reads as DRIFT rather than passing on an old judgement. It is a register of
   JUDGEMENTS, not of spellings: every entry says what the path IS, which is the thing a matcher cannot know.
   Only the floored class needs one; everything else is named in the report and graded, never gated. */
export const PEN_LEDGER = {
  "bio-plane/test/nc-d355.mjs": [
    { expr: 'path.join(armDir, "logs")',
      why: "`armDir` is a PARAMETER of `seedLogs`, and every call site passes `path.join(LOGROOT, \"armN\")` where LOGROOT is `_m025/nc-d355` — gitignored by `_m025/`" },
    { expr: 'path.join(armDir, "census-summary.txt")',
      why: "the same `armDir` parameter under `_m025/nc-d355`, gitignored by `_m025/`" },
  ],
  "bio-plane/test/nc-m028.mjs": [
    { expr: "join(CROOT, p)",
      why: "`CROOT` is `tools/corpuscheck.mjs`'s exported ROOT, and the join is a READ of each governed document in the real corpus (arm A4's over-strictness pass) — never a write" },
  ],
  "bio-plane/test/nc-rec116.mjs": [
    { expr: "`${BASE}:bio-plane/${rel}`",
      why: "NOT A PATH — a git REVSPEC handed to `git show` to read the pre-item build out of the object store. `BASE` is a commit sha" },
  ],
  "bio-plane/test/owed-controls.control.mjs": [
    { expr: "`${abs}.vf1-aside`",
      why: "NOT A PEN BUT A MOVE-ASIDE, and it must stay in the worktree: the arm's subject is a file that is ABSENT, so the file itself is RENAMED aside and renamed back, and a rename to the system temp root would fail EXDEV across devices. It is transient for one arm and the driver restores it by name" },
  ],
};

const git = (args, repo, input) => {
  const r = spawnSync("git", args, { cwd: repo, encoding: "utf8", input, maxBuffer: 256 * 1024 * 1024 });
  return r.status === 0 && typeof r.stdout === "string" ? r.stdout : null;
};

const lineOf = (text, idx) => { let n = 1; for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++; return n; };

/* ------------------------------------------------------------------ 1. THE READER */

/* Split a call's argument list at TOP LEVEL, from the index just after its `(`. Answers null when the
   parenthesis never closes — a lexer that lost its place must not invent an argument. */
export function splitArgs(code, open) {
  const args = [];
  let depth = 0, start = open;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (c === ")" && depth === 0) { args.push(code.slice(start, i)); return args; }
      depth--;
    } else if (c === "," && depth === 0) { args.push(code.slice(start, i)); start = i + 1; }
    else if (c === "`" || c === '"' || c === "'") { const q = c; i++; while (i < code.length && code[i] !== q) { if (code[i] === "\\") i++; i++; } }
  }
  return null;
}

const closer = (s, from, open, close) => {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) { depth--; if (depth === 0) return i; }
    else if (s[i] === "`" || s[i] === '"' || s[i] === "'") { const q = s[i]; i++; while (i < s.length && s[i] !== q) { if (s[i] === "\\") i++; i++; } }
  }
  return -1;
};

/* The file's binding table: `const|let|var NAME = <expr>`, the expression taken to the end of its
   statement. A name bound twice keeps BOTH expressions, so a resolver that would silently have taken the
   first says so instead. */
export function bindings(code) {
  const map = new Map();
  for (const m of code.matchAll(/(?:^|[;{}()\n,])\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g)) {
    const from = m.index + m[0].length;
    let depth = 0, i = from;
    for (; i < code.length; i++) {
      const c = code[i];
      if (c === "(" || c === "[" || c === "{") depth++;
      else if (c === ")" || c === "]" || c === "}") { if (depth === 0) break; depth--; }
      else if ((c === ";" || c === ",") && depth === 0) break;
      else if (c === "\n" && depth === 0) { const rest = code.slice(i + 1).match(/^\s*(\S)/); if (!rest || !"+?:.|&".includes(rest[1])) break; }
      else if (c === "`" || c === '"' || c === "'") { const q = c; i++; while (i < code.length && code[i] !== q) { if (code[i] === "\\") i++; i++; } }
    }
    const expr = code.slice(from, i).trim();
    if (!expr) continue;
    if (map.has(m[1])) map.get(m[1]).push(expr); else map.set(m[1], [expr]);
  }
  return map;
}

/* Object-literal property values for a key, anywhere in the file — for an `arm.file` destination. */
export function propValues(code, key) {
  const out = [];
  for (const m of code.matchAll(new RegExp(`(?:^|[,{\\n]|\\s)${key.replace(/[$]/g, "\\$")}\\s*:\\s*`, "g"))) {
    const from = m.index + m[0].length;
    let depth = 0, i = from;
    for (; i < code.length; i++) {
      const c = code[i];
      if (c === "(" || c === "[" || c === "{") depth++;
      else if (c === ")" || c === "]" || c === "}") { if (depth === 0) break; depth--; }
      else if ((c === "," || c === "\n") && depth === 0) break;
      else if (c === "`" || c === '"' || c === "'") { const q = c; i++; while (i < code.length && code[i] !== q) { if (code[i] === "\\") i++; i++; } }
    }
    out.push(code.slice(from, i).trim());
  }
  return out;
}

/* ------------------------------------------------------------ 2. THE RESOLVER */

/* A resolved path: `{ root, path }` where root is TEMP, TREE (repo-relative in `path`, `*` for a part the
   resolver could not read) or UNKNOWN (with `why`). ABSOLUTE tells a path outside both. */
const TEMP = () => ({ root: "TEMP" });
const REL = (p) => ({ root: "RELATIVE", path: p });
const OUT = (p) => ({ root: "ABSOLUTE", path: p });
const UNKNOWN = (why) => ({ root: "UNKNOWN", why });
const TREE = (p) => ({ root: "TREE", path: p });

export function resolvePath(expr, ctx, seen = new Set(), depth = 0) {
  let e = String(expr || "").trim();
  while (e.startsWith("(") && closer(e, 0, "(", ")") === e.length - 1) e = e.slice(1, -1).trim();
  if (!e) return UNKNOWN("empty expression");
  if (depth > 14) return UNKNOWN("resolution too deep");
  if (seen.has(e)) return UNKNOWN(`circular: ${e.slice(0, 40)}`);
  seen = new Set(seen); seen.add(e);

  /* `a || b` / `a ?? b` — an env override with a literal fallback: the fallback is what a run without the
     variable uses, and an env var pointing elsewhere is a MOVE, not this walk's business. */
  const alt = topSplit(e, ["||", "??"]);
  if (alt) {
    const lit = alt.filter((p) => !/process\.env\b/.test(p));
    if (!lit.length) return UNKNOWN(`only an environment variable: ${e.slice(0, 50)}`);
    return joinAll(lit.map((p) => resolvePath(p, ctx, seen, depth + 1)), "an `||` whose sides disagree");
  }
  /* A ternary: both branches, and they must agree. */
  const q = topSplit(e, ["?"]);
  if (q && q.length === 2) {
    const both = topSplit(q[1], [":"]);
    if (both && both.length === 2) return joinAll(both.map((p) => resolvePath(p, ctx, seen, depth + 1)), "a ternary whose branches disagree");
  }
  /* `a + b`: concatenation. */
  const plus = topSplit(e, ["+"]);
  if (plus) return concat(plus.map((p) => resolvePath(p, ctx, seen, depth + 1)));

  /* A template literal: its chunks and interpolations, in order. */
  if (e.startsWith("`")) {
    const body = e.slice(1, e.lastIndexOf("`"));
    const parts = [];
    let i = 0, chunk = "";
    while (i < body.length) {
      if (body[i] === "\\") { chunk += body[i + 1] || ""; i += 2; continue; }
      if (body[i] === "$" && body[i + 1] === "{") {
        const close = closer(body, i + 1, "{", "}");
        if (close < 0) return UNKNOWN("unterminated interpolation");
        if (chunk) { parts.push(parts.length ? REL(chunk) : literal(chunk, ctx)); chunk = ""; }
        parts.push(resolvePath(body.slice(i + 2, close), ctx, seen, depth + 1));
        i = close + 1; continue;
      }
      chunk += body[i]; i++;
    }
    if (chunk) parts.push(parts.length ? REL(chunk) : literal(chunk, ctx));
    /* RAW concatenation, never segment-joined: a template's chunks already carry their own separators, and
       joining them as segments put a spurious separator in front of every chunk after an interpolation —
       `test/<star>.test.mjs` came out as `test/<star>` + `/` + `.test.mjs` (measured on this estate). */
    return concat(parts);
  }
  /* A string literal. */
  const str = /^(["'])((?:[^\\]|\\.)*)\1$/.exec(e);
  if (str) return literal(str[2].replace(/\\(.)/g, "$1"), ctx);

  /* `new URL("…", import.meta.url)` and its `.pathname` / `.href`. */
  const url = /^new\s+URL\s*\(/.exec(e);
  if (url) {
    const args = splitArgs(e, e.indexOf("(") + 1) || [];
    if (!/import\s*\.\s*meta\s*\.\s*url/.test(args[1] || "")) return UNKNOWN(`new URL over ${(args[1] || "?").trim().slice(0, 30)}`);
    const rel = resolvePath(args[0], ctx, seen, depth + 1);
    if (rel.root !== "TREE" && rel.root !== "RELATIVE") return rel;
    /* Relative to the DRIVER's own directory, which is where `import.meta.url` points — and a URL that
       resolves to a DIRECTORY keeps its trailing slash, because `ROOT + "../x"` reads differently without
       it (`bio-plane../x` rather than `bio-plane/../x`). */
    const dir = /(?:^|\/)\.\.?$/.test(rel.path) || rel.path.endsWith("/") || rel.path === "";
    return TREE(clean(join(dirname(ctx.file), rel.path)) + (dir ? "/" : ""));
  }

  /* A call. */
  const call = /^(?:[A-Za-z_$][\w$]*\s*\.\s*)*([A-Za-z_$][\w$]*)\s*\(/.exec(e);
  if (call) {
    const fn = call[1];
    const args = splitArgs(e, e.indexOf("(", call[0].length - 1) + 1) || [];
    if (fn === "tmpdir" || fn === "controlPen") return TEMP();
    if (fn === "mkdtempSync" || fn === "mkdtemp") return args[0] ? resolvePath(args[0], ctx, seen, depth + 1) : UNKNOWN("mkdtempSync with no prefix");
    if (fn === "join" || fn === "resolve" || fn === "normalize")
      return args.length ? concat(args.map((a) => resolvePath(a, ctx, seen, depth + 1)), true) : UNKNOWN(`${fn}()`);
    if (fn === "dirname") { const r = args[0] ? resolvePath(args[0], ctx, seen, depth + 1) : UNKNOWN("dirname()"); return r.root === "TREE" ? TREE(clean(dirname(r.path))) : r.root === "RELATIVE" ? REL(clean(dirname(r.path))) : r; }
    if (fn === "realpathSync") return args[0] ? resolvePath(args[0], ctx, seen, depth + 1) : UNKNOWN("realpathSync()");
    /* `fileURLToPath(import.meta.url)` is THIS FILE; `fileURLToPath(new URL(…))` is whatever the URL
       resolved to, which must be recursed into — reading the `import.meta.url` inside the URL as if it
       were the argument put every such driver's pen one directory deep (measured: 209 false DIRTY). */
    if (fn === "fileURLToPath") return /^import\s*\.\s*meta\s*\.\s*url$/.test((args[0] || "").trim())
      ? TREE(ctx.file) : (args[0] ? resolvePath(args[0], ctx, seen, depth + 1) : UNKNOWN("fileURLToPath()"));
    /* `process.cwd()` is inside the worktree but WHERE depends on how the driver was launched (`bio-plane/`
       or the repo root), so a path built on it is UNPLACED rather than placed at the root. */
    if (fn === "cwd") return REL("");
    /* A CALL TO AN ARROW BOUND IN THIS FILE, resolved by SUBSTITUTING THE ACTUAL ARGUMENTS. This estate's
       drivers spell their subjects through a one-line resolver — `const P = (rel) => fileURLToPath(new
       URL(rel, import.meta.url))` — and without this step every path through it reads "`rel` is not bound
       in this file", which made four drivers UNCLASSIFIED over paths that are perfectly determinate.
       Substitution is TEXTUAL on word boundaries, so a parameter name also occurring inside a string in the
       body would be replaced there too; the body is a path expression, so that is stated rather than feared. */
    const arrow = arrowOf(ctx, fn);
    if (arrow) {
      let body = arrow.body;
      arrow.params.forEach((name, k) => {
        if (!name) return;
        body = body.replace(new RegExp(`(?<![\\w$.])${name.replace(/[$]/g, "\\$")}(?![\\w$])`, "g"), `(${(args[k] || "undefined").trim()})`);
      });
      return resolvePath(body, ctx, seen, depth + 1);
    }
    return UNKNOWN(`a call this walk does not read: ${fn}(…)`);
  }
  if (/^import\s*\.\s*meta\s*\.\s*url$/.test(e)) return TREE(ctx.file);
  if (/^process\s*\.\s*env\b/.test(e)) return UNKNOWN("an environment variable with no fallback");

  /* An identifier. */
  if (/^[A-Za-z_$][\w$]*$/.test(e)) {
    const defs = ctx.binds.get(e);
    if (!defs) return UNKNOWN(`\`${e}\` is not bound in this file (a parameter, an import or a loop variable)`);
    return joinAll(defs.map((d) => resolvePath(d, ctx, seen, depth + 1)), `\`${e}\` is bound more than once, to different roots`);
  }
  /* A member access `x.prop`, resolved by the KEY as this file defines it; `.pathname`/`.href` pass through. */
  const member = /^([A-Za-z_$][\w$[\].]*)\s*\.\s*([A-Za-z_$][\w$]*)$/.exec(e);
  if (member) {
    if (member[2] === "pathname" || member[2] === "href") return resolvePath(member[1], ctx, seen, depth + 1);
    const vals = propValues(ctx.code, member[2]);
    if (!vals.length) return UNKNOWN(`no \`${member[2]}:\` is defined in this file`);
    const roots = vals.map((v) => resolvePath(v, ctx, seen, depth + 1)).filter((r) => r.root !== "UNKNOWN");
    if (!roots.length) return UNKNOWN(`every \`${member[2]}:\` in this file is itself unresolved`);
    return joinAll(roots, `\`${member[2]}:\` disagrees across its definitions`);
  }
  return UNKNOWN(`an expression this walk does not read: ${e.replace(/\s+/g, " ").slice(0, 56)}`);
}

/* A one-expression arrow bound to NAME in this file: its parameter names and its body. A block body (`{ … }`)
   is not read — a path built by statements is not a path expression, and pretending otherwise would be the
   "believed on the strength of its existence" error inside the resolver. */
function arrowOf(ctx, name) {
  const defs = ctx.binds.get(name);
  if (!defs || defs.length !== 1) return null;
  const m = /^(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>\s*([\s\S]+)$/.exec(defs[0].trim());
  if (!m) return null;
  const body = m[3].trim();
  if (body.startsWith("{")) return null;
  const params = (m[1] !== undefined ? m[1].split(",") : [m[2]]).map((x) => x.trim().split(/[=\s]/)[0]).filter(Boolean);
  return { params, body };
}

/* Several resolutions of the SAME path: they must agree, or the answer is named. TREE paths agree when
   their patterns are equal; otherwise the disagreement is the answer. */
function joinAll(rs, why) {
  const known = rs.filter((r) => r.root !== "UNKNOWN");
  if (!known.length) return rs[0] || UNKNOWN(why);
  return known.reduce((a, b) => {
    if (a.root !== b.root) return UNKNOWN(why);
    if ((a.root === "TREE" || a.root === "RELATIVE") && a.path !== b.path) return UNKNOWN(why);
    return a;
  });
}

/* Concatenation, in order: the FIRST part gives the root; a TREE part contributes its text; a part the
   resolver could not read becomes a `*`. A TEMP or ABSOLUTE root swallows what follows. */
function concat(parts, asSegments = false) {
  if (!parts.length) return UNKNOWN("nothing to concatenate");
  const first = parts[0];
  if (first.root === "TEMP") return TEMP();
  if (first.root === "ABSOLUTE") return OUT(first.path);
  if (first.root === "UNKNOWN") return first;
  let p = first.path;
  for (const r of parts.slice(1)) {
    const piece = (r.root === "TREE" || r.root === "RELATIVE") ? r.path : r.root === "UNKNOWN" ? "*" : null;
    if (piece === null) return UNKNOWN("a temp or absolute root in the middle of a path");
    p = asSegments ? (p ? `${p}/${piece}` : piece) : p + piece;
  }
  return first.root === "RELATIVE" ? REL(clean(p)) : TREE(clean(p));
}

/* A literal path's root: an absolute path under a system temp root is TEMP, any other absolute path is
   read against the repository, and a RELATIVE one is worktree-rooted because a driver's cwd is the tree. */
function literal(s, ctx) {
  const p = s.trim();
  if (!p) return TREE("");
  if (isAbsolute(p)) {
    if (/^\/(tmp|var\/tmp|var\/folders|private\/var\/folders|dev\/shm)(\/|$)/.test(p)) return TEMP();
    if (ctx.repoReal && (p === ctx.repoReal || p.startsWith(`${ctx.repoReal}/`))) return TREE(clean(relative(ctx.repoReal, p)));
    return OUT(p);
  }
  return REL(clean(p));
}

/* A trailing slash is KEPT: it is the difference between `ROOT + "../x"` reading `bio-plane/../x` and
   `bio-plane../x`. Grading strips it before it asks git anything. */
const clean = (p) => normalize(p).split("\\").join("/").replace(/^\.\//, "").replace(/\/\/+$/, "/");

/* Split at a top-level operator, or null when it does not occur there. */
function topSplit(e, ops) {
  let depth = 0;
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (c === "(" || c === "[" || c === "{") { depth++; continue; }
    if (c === ")" || c === "]" || c === "}") { depth--; continue; }
    if (c === "`" || c === '"' || c === "'") { const qq = c; i++; while (i < e.length && e[i] !== qq) { if (e[i] === "\\") i++; i++; } continue; }
    if (depth !== 0) continue;
    for (const op of ops) {
      if (!e.startsWith(op, i)) continue;
      if (op === "+" && (e[i + 1] === "+" || e[i - 1] === "+" || e[i - 1] === "=")) continue;
      if (op === "?" && (e[i + 1] === "?" || e[i + 1] === "." || e[i - 1] === "?")) continue;
      if (op === ":" && (e[i + 1] === ":" || e[i - 1] === ":")) continue;
      if (op === "||" && e[i - 1] === "|") continue;
      return [e.slice(0, i), e.slice(i + op.length)];
    }
  }
  return null;
}

/* ------------------------------------------------------------- 3. THE PATHS NAMED */

/* Every PATH EXPRESSION a driver names: a `join`/`resolve`/`normalize` call, a `new URL(…)`, a string
   literal that holds a `/` or is spelled as a dot-name, and a template literal with either. Nested
   expressions are not reported twice: an outer `join(…)` swallows the literals inside it. */
export function namedPaths(src, file, ctx) {
  const code = stripComments(src);
  const local = { ...ctx, file, code, binds: bindings(code) };
  const spans = [];                                  /* [start, end, expr] of each candidate, outermost first */
  const push = (a, b) => { if (!spans.some(([x, y]) => a >= x && b <= y)) spans.push([a, b, code.slice(a, b)]); };
  /* A BARE `join`/`resolve`/`normalize` is a path builder only when THIS FILE imports it from `node:path`.
     Without that test the Promise idiom `resolve({ out, code })` is read as a path (measured on nc-d355),
     which is the "a failed search returns its own error text as matches" shape one level down. */
  const fromPath = new Set();
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']node:path["']/g))
    for (const n of m[1].split(",")) { const t = n.trim().split(/\s+as\s+/).pop().trim(); if (t) fromPath.add(t); }
  const bare = [...fromPath].filter((n) => ["join", "resolve", "normalize"].includes(n));
  /* A FILE-LOCAL ONE-LINE PATH RESOLVER IS A PATH BUILDER TOO, and its CALL SITES are where the paths are.
     Every driver here spells its subjects through one — `const P = (rel) => fileURLToPath(new URL(rel,
     import.meta.url))` — and a walk that reads only the BODY sees `rel` unbound and grades the driver
     UNCLASSIFIED over four determinate paths. So: name such arrows, add their calls to the builders, and
     EXCLUDE their bodies from collection, because the body without its argument is not a path. */
  const localBuilders = [];
  const bodySpans = [];
  for (const m of code.matchAll(/(?:^|[;{}\n])\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>\s*/g)) {
    const from = m.index + m[0].length;
    if (code[from] === "{") continue;                                  /* a block body is not an expression */
    const end = (() => { let d = 0; for (let i = from; i < code.length; i++) { const c = code[i];
      if (c === "(" || c === "[" || c === "{") d++; else if (c === ")" || c === "]" || c === "}") { if (d === 0) return i; d--; }
      else if ((c === ";" || c === "\n") && d === 0) return i;
      else if (c === "`" || c === '"' || c === "'") { const q = c; i++; while (i < code.length && code[i] !== q) { if (code[i] === "\\") i++; i++; } } }
      return code.length; })();
    const body = code.slice(from, end).trim();
    const params = (m[2] !== undefined ? m[2] : m[3] || "").split(",").map((x) => x.trim()).filter(Boolean);
    /* THE WHOLE BODY must BE a path expression, and the arrow must take an argument. "Its body CONTAINS a
       join somewhere" is far too generous: it enrolled `const suite = () => run(…)` and, worse, made every
       one-letter name a builder, so a fixture STRING containing `P (` was read as a call to it (measured:
       `P (the pure arms carry their own kind)`). */
    if (!params.length) continue;
    if (!/^(?:fileURLToPath|path\s*\.\s*(?:join|resolve)|join|resolve|new\s+URL)\s*\(/.test(body)) continue;
    localBuilders.push(m[1]);
    bodySpans.push([from, from + code.slice(from, end).length]);
  }
  const builder = new RegExp(`(?<![\\w$.])path\\s*\\.\\s*(?:join|resolve|normalize)\\s*\\(`
    + (bare.length ? `|(?<![\\w$.])(?:${bare.join("|")})\\s*\\(` : "")
    + (localBuilders.length ? `|(?<![\\w$.])(?:${localBuilders.join("|")})\\s*\\(` : "") + `|new\\s+URL\\s*\\(`, "g");
  const inBody = (a, b) => bodySpans.some(([x, y]) => a >= x && b <= y);
  /* A BUILDER SPELLED INSIDE A STRING IS NOT A CALL. The question is asked over `stripComments`, which keeps
     strings on purpose (a path IS a string), so the spans of the literals have to be excluded by hand here. */
  const strSpans = [];
  for (const m of code.matchAll(/`(?:[^`\\]|\\.|\$\{(?:[^{}]|\{[^{}]*\})*\})*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g))
    strSpans.push([m.index, m.index + m[0].length]);
  const inString = (a) => strSpans.some(([x, y]) => a > x && a < y);
  for (const m of code.matchAll(builder)) {
    if (inString(m.index)) continue;
    const open = code.indexOf("(", m.index + m[0].length - 1);
    const close = closer(code, open, "(", ")");
    if (close > 0 && !inBody(m.index, close + 1)) push(m.index, close + 1);
  }
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const outer = [];
  for (const s of spans) if (!outer.some(([x, y]) => s[0] >= x && s[1] <= y)) outer.push(s);
  /* Then the bare literals and templates not already inside one of those. */
  const litRe = /`(?:[^`\\]|\\.|\$\{(?:[^{}]|\{[^{}]*\})*\})*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
  for (const m of code.matchAll(litRe)) {
    if (outer.some(([x, y]) => m.index >= x && m.index + m[0].length <= y)) continue;
    if (inBody(m.index, m.index + m[0].length)) continue;
    const text = m[0].slice(1, -1);
    /* A path has no whitespace in it. Without this line a driver's PROSE — ` RESTORED ${f} byte-identically`
       — is read as a path expression, which is how the first draft of this walk graded 283 of 286 drivers
       DIRTY: measured on this estate, 2026-09-24. A template's INTERPOLATIONS may hold anything; only its
       literal chunks are tested. */
    const chunks = m[0][0] === "`" ? text.split(/\$\{(?:[^{}]|\{[^{}]*\})*\}/) : [text];
    if (chunks.some((c) => /\s/.test(c))) continue;
    /* A SEPARATOR ADJACENT TO A NAME, inside ONE literal chunk — or a dot-name. A bare `/` between two
       interpolations is a RATIO, not a path: `${foot[1]}/${n}` is a suite's `pass/total` tally, and reading
       it as a path made two drivers UNCLASSIFIED over their own output line (measured). */
    if (!chunks.some((c) => /[\w.-]\/|\/[\w.-]/.test(c) || /^\.[\w.-]+$/.test(c) || /^[\w.-]+\.(?:mjs|js|json|md|html|txt|out|sh|db|tsv|jsonc|css)$/.test(c))) continue;
    if (/^https?:|^[a-z-]+:\/\//i.test(text)) continue;
    outer.push([m.index, m.index + m[0].length, m[0]]);
  }
  const out = [];
  for (const [a, , expr] of outer.sort((x, y) => x[0] - y[0])) {
    const r = resolvePath(expr, local);
    out.push({ line: lineOf(code, a), expr: expr.replace(/\s+/g, " ").slice(0, 78), ...r });
  }
  /* THE HELPER IS ITSELF A DECLARATION. A call to `controlPen(` names a pen outside the worktree whatever the
     driver then builds on top of it, and reading it directly is what stops a driver whose copies are named
     through its own helper — `penPath(f, suffix)` over `${PEN}/…` — from being graded MEMORY for naming no
     path this walk recognises. Measured: three drivers read MEMORY that way. */
  for (const m of code.matchAll(/(?<![\w$.])controlPen\s*\(/g))
    out.push({ line: lineOf(code, m.index), expr: "controlPen(…)", root: "TEMP" });
  return out.sort((x, y) => x.line - y.line);
}

/* ------------------------------------------------------------------ 4. THE SWEEP */

/* What to ask `git check-ignore` about a named path: the longest prefix of WHOLE SEGMENTS before the first
   one this walk could not read. A `.gitignore` line covering a pen directory covers what is written under
   it, so the prefix is the honest question — and a path whose FIRST segment is unreadable has no prefix to
   ask about, which is why this can answer "". */
export const ignoreProbe = (p) => {
  const segs = String(p).split("/");
  const cut = segs.findIndex((s) => s.includes("*"));
  return (cut < 0 ? segs : segs.slice(0, cut)).join("/");
};

export function sweepPens({ repo = REPO } = {}) {
  const listed = git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"], repo);
  if (listed === null) return { walkFailed: true, corpus: 0, drivers: [] };
  const files = [...new Set(listed.split("\0").filter(Boolean))].sort();
  const corpusSet = new Set(files);
  const dirSet = new Set();
  for (const f of files) { let d = dirname(f); while (d && d !== "." && d !== "/") { dirSet.add(d); d = dirname(d); } }
  let repoReal = null;
  try { repoReal = realpathSync(repo); } catch { /* an unreadable repo root is not a pen finding */ }

  const drivers = files.filter(isDriver);
  const perDriver = new Map();
  const candidates = new Set();
  for (const f of drivers) {
    let src;
    try { src = readFileSync(join(repo, f), "utf8"); } catch { continue; }
    const paths = namedPaths(src, f, { repoReal });
    perDriver.set(f, paths);
    /* Repo-relative, once and in one place: a leading slash is a `join` artefact of the repository root and
       a trailing one is the directory-URL marker the resolver needed. Normalising here rather than at each
       lookup is what stops a path being submitted to `check-ignore` in one spelling and looked up in
       another — measured: `pdf-worker/node_modules/` came back DIRTY that way. */
    for (const q of paths) if (q.root === "TREE") q.path = String(q.path).replace(/^\/+/, "").replace(/\/+$/, "");
    for (const q of paths) if (q.root === "TREE" && q.path) candidates.add(ignoreProbe(q.path));
  }
  /* ONE `check-ignore` for the whole sweep. Asked of git, never of a hand list of patterns. */
  /* EVERY PROBE IS ASKED TWICE, BARE AND WITH A TRAILING SLASH. `git check-ignore` will not match a
     `dir/` pattern against a path that does not exist on disk — and on a clean tree NO pen exists — so the
     bare probe answered NO for every declared pen in the estate and read it DIRTY. Measured 2026-09-24:
     `.pl13-harness` bare is unignored, `.pl13-harness/` is ignored at `.gitignore:54`. The slash is what
     tells git the path is a directory. */
  const cand = [...candidates].filter(Boolean);
  const probes = cand.flatMap((c) => [c, `${c}/`]);
  const hitSet = new Set(probes.length ? (git(["check-ignore", "--stdin"], repo, `${probes.join("\n")}\n`) || "").split("\n").filter(Boolean) : []);
  const ignored = new Set(cand.filter((c) => hitSet.has(c) || hitSet.has(`${c}/`)));

  const graded = [];
  const ledgerDrift = [];
  for (const f of drivers) {
    const paths = perDriver.get(f) || [];
    for (const p of paths) {
      if (p.root === "RELATIVE") { p.grade = "UNPLACED"; continue; }
      if (p.root !== "TREE") { p.grade = p.root === "UNKNOWN" ? "UNKNOWN" : p.root; continue; }
      if (!p.path || p.path === "." || p.path === "..") { p.grade = "SUBJECT"; continue; }   /* the tree itself */
      /* IGNORED is asked FIRST and of the path's declared prefix: a `.gitignore` line covering a pen
         directory covers everything the driver writes under it, wildcards and all. */
      if (ignored.has(ignoreProbe(p.path))) { p.grade = "IGNORED"; continue; }
      if (p.path.includes("*")) {
        const re = new RegExp(`^${p.path.split("*").map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`);
        p.grade = [...corpusSet].some((c) => re.test(c)) || [...dirSet].some((d) => re.test(d)) ? "SUBJECT" : "DIRTY";
        continue;
      }
      p.grade = (corpusSet.has(p.path) || dirSet.has(p.path)) ? "SUBJECT" : "DIRTY";
    }
    /* THE LEDGER, applied by EXPRESSION: a ledgered path is graded LEDGERED and named with its why. An entry
       whose expression no longer occurs in the driver is DRIFT — the judgement was about a file that has
       since changed, and a judgement nobody re-made is not one. */
    const entries = PEN_LEDGER[f] || [];
    const hit = new Set();
    for (const p of paths) {
      if (p.grade !== "DIRTY" && p.grade !== "UNKNOWN") continue;
      const e = entries.find((x) => p.expr.includes(x.expr) || x.expr.includes(p.expr));
      if (e) { p.grade = "LEDGERED"; p.why = e.why; hit.add(e.expr); }
    }
    for (const e of entries) if (!hit.has(e.expr)) ledgerDrift.push(`${f}: the ledger names \`${e.expr}\`, which this walk no longer sees`);
    const dirty = paths.filter((p) => p.grade === "DIRTY");
    const unknown = paths.filter((p) => p.grade === "UNKNOWN");
    const pens = paths.filter((p) => p.grade === "IGNORED");
    const temp = paths.filter((p) => p.grade === "TEMP");
    let grade, why;
    if (dirty.length) { grade = "IN-WORKTREE/DIRTY"; why = `${dirty.length} path(s) git neither tracks nor ignores`; }
    else if (unknown.length) { grade = "UNCLASSIFIED"; why = `${unknown.length} path expression(s) this walk cannot resolve`; }
    else if (pens.length) { grade = "IN-WORKTREE/declared"; why = `gitignored: ${[...new Set(pens.map((p) => p.path))].join(", ")}`; }
    else if (temp.length) { grade = "TEMP"; why = `${temp.length} path(s) named, every root outside the worktree (not a claim that a PEN was identified — see REACH)`; }
    else { grade = "MEMORY"; why = "names no pen — its pristine copy is held in a variable, or built at runtime (see REACH)"; }
    graded.push({ file: f, grade, why, floored: FLOORED(f), paths, dirty, unknown });
  }
  /* BOB #33's SECOND DEFECT CLASS (CONDUCT #20's correction, 2026-09-24 22:25Z): a pen that is NOT
     ITEM-NAMED, so two drivers could share it. Asked of the estate rather than of a name: one in-worktree
     pen path named by TWO OR MORE drivers is a pen they share, whatever it is called, and that is the
     property the "item-named" rule exists to produce. A driver READING another driver's pen (nc-d355 asserts
     refusal-partition's pen is absent) is not sharing it, so a path only one driver WRITES under is not a
     finding here — this walk cannot tell a read from a write, so a shared path is reported as SHARED and
     named for a reader to judge, never scored as a defect on its own. */
  /* A PEN'S IDENTITY is the path up to and including the FIRST segment git does not already track as a
     directory — where the driver's own space begins. Truncating to two segments instead reported
     `bio-plane/test` as one pen shared by thirteen drivers, which is a directory they all write INTO, not a
     pen they share (measured on the first run of this arm). */
  const penIdentity = (path) => {
    const segs = String(path).split("/");
    for (let i = 0; i < segs.length; i++) {
      const upto = segs.slice(0, i + 1).join("/");
      if (!dirSet.has(upto)) return upto;
    }
    return null;                                   /* every segment is a tracked directory: not a pen */
  };
  const penOwners = new Map();
  for (const d of graded)
    for (const p of d.paths)
      if (p.grade === "IGNORED" || p.grade === "DIRTY") {
        const root = penIdentity(p.path);
        if (!root) continue;
        if (!penOwners.has(root)) penOwners.set(root, new Set());
        penOwners.get(root).add(d.file);
      }
  const shared = [...penOwners].filter(([, owners]) => owners.size > 1)
    .map(([root, owners]) => ({ pen: root, drivers: [...owners].sort() }))
    .sort((a, b) => b.drivers.length - a.drivers.length);

  /* The seven the row names, asked of the DRIVERS: is one named again? */
  const unignoredBack = UNIGNORED_PENS
    .map((p) => ({ pen: p, by: graded.filter((d) => d.paths.some((x) => String(x.expr).includes(p))).map((d) => d.file) }))
    .filter((x) => x.by.length);
  return { walkFailed: false, corpus: files.length, drivers: graded, unignoredBack, ledgerDrift, shared };
}

export function report(res, log = console.log) {
  if (res.walkFailed) { log("pen sweep (M0-182): the corpus could not be listed (git) — says NOTHING about pens"); return 1; }
  const g = (n) => res.drivers.filter((d) => d.grade === n);
  const floored = res.drivers.filter((d) => d.floored);
  const bad = floored.filter((d) => d.grade === "IN-WORKTREE/DIRTY" || d.grade === "UNCLASSIFIED");
  log(`pen sweep (M0-182): corpus ${res.corpus} file(s) · ${res.drivers.length} control driver(s), ${floored.length} in the floored nc-* class`
    + ` · ${g("TEMP").length} TEMP · ${g("MEMORY").length} MEMORY · ${g("IN-WORKTREE/declared").length} IN-WORKTREE/declared`
    + ` · ${g("IN-WORKTREE/DIRTY").length} IN-WORKTREE/DIRTY · ${g("UNCLASSIFIED").length} UNCLASSIFIED`);
  log(`  the floored class: ${floored.filter((d) => d.grade === "TEMP").length} TEMP · ${floored.filter((d) => d.grade === "MEMORY").length} MEMORY`
    + ` · ${floored.filter((d) => d.grade === "IN-WORKTREE/declared").length} declared · ${bad.length} NOT YET MOVED`);
  for (const d of res.drivers) {
    log(`  ${d.floored ? "*" : " "}${d.grade.padEnd(21)} ${d.file.padEnd(48)} — ${d.why}`);
    for (const p of d.paths.filter((x) => x.grade === "LEDGERED")) log(`      LEDGERED :${String(p.line).padEnd(5)} ${p.why}\n           from  ${p.expr}`);
    for (const p of [...d.dirty, ...d.unknown]) log(`      ${(p.grade === "DIRTY" ? "DIRTY" : "UNKNOWN").padEnd(8)} :${String(p.line).padEnd(5)} ${p.grade === "DIRTY" ? p.path : p.why}\n           from  ${p.expr}`);
  }
  log(`  BOB #33's DEFECT CLASSES (CONDUCT #20, 2026-09-24 22:25Z — an in-worktree pen that is gitignored and`
    + ` item-named STANDS; it is not a defect to sweep away):`);
  log(`    (a) a pen NO .gitignore line covers: ${res.drivers.filter((d) => d.grade === "IN-WORKTREE/DIRTY").length} driver(s), named above`);
  log(`    (b) a pen TWO OR MORE drivers name, so it is not item-private: ${res.shared.length} path(s)`);
  for (const s of res.shared) log(`        ${s.pen}  <- ${s.drivers.join(", ")}`);
  log(`    (c) a driver that LEAVES its pen behind on a clean run: NOT CHECKABLE HERE — it is a property of a RUN,`
    + ` not of the source. M0-172 owns it (status.control.mjs), and this walk says so rather than scoring it 0.`);
  for (const d of res.ledgerDrift) log(`  LEDGER DRIFT  ${d}`);
  for (const u of res.unignoredBack) log(`  UNIGNORED PEN NAMED AGAIN: ${u.pen} by ${u.by.join(", ")}`);
  log("  REACH: the paths a driver NAMES from its own constants (a join/resolve/new URL/literal/template), over"
    + " stripComments — comments and regex blanked, STRINGS KEPT. A path assembled only at runtime (a parameter, an"
    + " import, a loop variable) is NOT named here; nor is a write by a spawned command or a `.control.sh`. SUBJECT"
    + " means git tracks the path (the source a control breaks and restores); IGNORED means a .gitignore line covers it.");
  return bad.length || res.unignoredBack.length || res.ledgerDrift.length ? 1 : 0;
}

const IS_CLI = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
if (IS_CLI) process.exit(report(sweepPens()));
