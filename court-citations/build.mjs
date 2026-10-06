/* court-citations: the build (R3–R6). Reads the two pinned Free Law Project packages' files (`pins.json`), expands
 * their Python regular-expression templates exactly as each package's own loader does, translates every pattern to
 * JavaScript (translate.mjs), checks each against the package's own examples, and writes the one generated data
 * module, `court-data.mjs`. Run from the repository root: `node court-citations/build.mjs` (writes the file) or
 * `node court-citations/build.mjs --check` (verifyFresh). Build time only: nothing at run time imports this file. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { translate, Untranslatable } from "./translate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PINS = JSON.parse(readFileSync(join(HERE, "pins.json"), "utf8"));
const pin = (name) => PINS.packages.find((p) => p.package === name);
export const DATA_FILE = join(HERE, "court-data.mjs");
const DEFAULTS = { reportersDir: join(HERE, "vendor", pin("reporters-db").dir), courtsDir: join(HERE, "vendor", pin("courts-db").dir) };
const FLAGS = { reporters: "u", courts: "iu" };

/* ---- Python's string.Template and str helpers, as the packages' loaders use them ---- */
const TEMPLATE = /\$(?:(\$)|([_a-zA-Z][_a-zA-Z0-9]*)|\{([_a-zA-Z][_a-zA-Z0-9]*)\}|())/g;
function substitute(tpl, vars, safe) {
  return tpl.replace(TEMPLATE, (m, esc, named, braced, bad) => {
    if (esc !== undefined) return "$";
    const k = named ?? braced;
    if (k !== undefined) {
      if (Object.hasOwn(vars, k)) return vars[k];
      if (safe) return m;
      throw new Error(`template variable ${k} is not defined`);
    }
    if (safe) return m;
    throw new Error(`invalid template placeholder at "${tpl.slice(tpl.indexOf(m), tpl.indexOf(m) + 12)}"`);
  });
}
const PY_SPACE = "\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const splitlines = (s) => { const a = s.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/); if (a.at(-1) === "") a.pop(); return a; };
/* courts-db's strip_punc: runs of two or more white-space characters become one space; the ends are trimmed. */
export const stripPunc = (s) => s.replace(new RegExp(`[${PY_SPACE}]{2,}`, "gu"), " ").replace(new RegExp(`^[${PY_SPACE}]+|[${PY_SPACE}]+$`, "gu"), "");
/* Python 3.7+ re.escape: the characters it escapes. */
const pyEscape = (s) => s.replace(/[()[\]{}?*+\-|^$\\.&~# \t\n\r\v\f]/g, (c) => `\\${c}`);

/* ---- reporters-db: utils.process_variables and recursive_substitute ---- */
function processVariables(raw) {
  const flat = {};
  (function flatten(d, parent) {
    for (const [k, v] of Object.entries(d)) {
      if (k.endsWith("#")) continue;
      const key = [parent, k].filter(Boolean).join("_");
      if (v && typeof v === "object") flatten(v, key); else flat[key] = v;
    }
  })(raw, "");
  for (const [k, v] of Object.entries({ ...flat })) flat[`${k}_optional`] = `(?:${v} ?)?`;
  const out = {};
  for (const [k, v] of Object.entries(flat)) out[k] = recursiveSubstitute(v, flat);
  return out;
}
function recursiveSubstitute(tpl, vars) {
  let old = tpl;
  for (let n = 0; n < 100; n++) { const next = substitute(old, vars, true); if (next === old) return next; old = next; }
  throw new Error(`max_depth exceeded for template '${tpl}'`);
}

/* ---- courts-db: utils.load_courts_db ---- */
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth", "tenth", "eleventh",
  "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth"];
for (const tens of ["twenty", "thirty", "fourty", "fifty", "sixty", "seventy", "eighty", "ninety"]) {
  if (tens !== "twenty") ORDINALS.push({ thirty: "thirtieth", fourty: "fortieth", fifty: "fiftieth", sixty: "sixtieth", seventy: "seventieth", eighty: "eightieth", ninety: "ninetieth" }[tens]);
  for (const u of ["first", "secondth", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth"]) ORDINALS.push(`${tens}(-| )${u}`);
}
ORDINALS.push("one[- ]hundredth");

function loadCourts(text, variables) {
  let temp = text;
  for (const [, a, b] of [...text.matchAll(/\$\{(\d+)-(\d+)\}/g)]) {
    temp = temp.replaceAll(`\${${a}-${b}}`, `((${ORDINALS.slice(Number(a) - 1, Number(b)).join(")|(")}))`);
  }
  const data = JSON.parse(substitute(temp, variables, false).replaceAll("\\", "\\\\"));
  for (const k of data) {
    if ("parent" in k && !["dates", "type", "location"].every((f) => f in k)) {
      const parent = data.find((x) => x.id === k.parent);
      for (const f of ["dates", "type", "location"]) if (!(f in k)) k[f] = parent[f];
    }
  }
  return data;
}

/* ---- reading the pinned files ---- */
function readPackage(pins, name, dir) {
  const p = pins.packages.find((x) => x.package === name), files = [], text = {};
  for (const [rel, sha] of Object.entries(p.files)) {
    const path = join(dir, rel);
    if (!existsSync(path)) return { absent: `${name}: ${rel} is not in ${dir}` };
    const bytes = readFileSync(path);
    const got = createHash("sha256").update(bytes).digest("hex");
    if (got !== sha) return { wrong: `${name}: ${rel} is not the pinned ${p.version} (SHA-256 ${got})` };
    files.push({ name: rel, sha256: sha });
    text[rel] = bytes.toString("utf8");
  }
  return { pin: p, files, text };
}

const anchored = (source, flags) => new RegExp(`^(?:${source})$`, flags);
function tryTranslate(src, ignoreCase) {
  try { return { ok: translate(src, { ignoreCase }).source }; } catch (e) { if (e instanceof Untranslatable) return { why: e.message }; throw e; }
}

/* R5's check for one entry: every example must match a translated pattern whole. A failure withholds all of the
 * entry's patterns (the packages give examples per entry, not per pattern), each listed with the example. */
function checkExamples(kind, key, examples, patterns, flags, prepare, untranslated) {
  const compiled = patterns.map((p) => anchored(p.source, flags));
  const failed = examples.filter((e) => !compiled.some((r) => r.test(prepare(e))));
  if (!failed.length) return true;
  for (const p of patterns) untranslated.push({ package: kind, key, pattern: p.python, why: `translation fails the package's example(s): ${failed.map((e) => JSON.stringify(e)).join(", ")}` });
  return false;
}

function buildReporters(pkg, untranslated) {
  const t = pkg.text, base = "reporters_db/data/";
  const vars = processVariables(JSON.parse(t[`${base}regexes.json`]));
  const raw = JSON.parse(t[`${base}reporters.json`]);
  const reporters = [];
  let editions = 0, variations = 0, patterns = 0;
  for (const [key, list] of Object.entries(raw)) {
    for (const d of list) {
      variations += Object.keys(d.variations).length;
      const eds = [], all = [];
      for (const [ek, ev] of Object.entries(d.editions)) {
        editions++;
        const spellings = [ek, ...Object.keys(d.variations).filter((v) => d.variations[v] === ek)]
          .sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
        const alt = `(?:${spellings.map(pyEscape).join("|")})`;
        const pats = [];
        for (const tpl of ev.regexes ?? ["$full_cite"]) {
          let py = recursiveSubstitute(tpl, vars);
          if (py.includes("$edition") || py.includes("${edition}")) py = substitute(py, { edition: alt }, true);
          const r = tryTranslate(py, false);
          if (r.why) untranslated.push({ package: "reporters-db", key: `${key} / ${ek}`, pattern: tpl, why: r.why });
          else { const p = { source: r.ok, python: tpl }; pats.push(p); all.push(p); }
        }
        eds.push({ key: ek, start: ev.start ?? null, end: ev.end ?? null, patterns: pats });
      }
      const examples = d.examples ?? [];
      const ok = checkExamples("reporters-db", key, examples, all, FLAGS.reporters, (e) => e, untranslated);
      for (const e of eds) { e.patterns = ok ? e.patterns.map((p) => p.source) : []; patterns += e.patterns.length; }
      reporters.push({ key, name: d.name, cite_type: d.cite_type, editions: eds, variations: { ...d.variations }, examples });
    }
  }
  return { reporters, counts: { reporters: Object.keys(raw).length, entries: reporters.length, editions, variations, patterns } };
}

function buildCourts(pkg, untranslated) {
  const t = pkg.text, base = "courts_db/data/";
  const variables = JSON.parse(t[`${base}variables.json`]);
  for (const rel of Object.keys(t).filter((r) => r.startsWith(`${base}places/`) && r.endsWith(".txt")).sort()) {
    variables[rel.slice(`${base}places/`.length, -4)] = `(${splitlines(t[rel]).join("|")})`;
  }
  const data = loadCourts(t[`${base}courts.json`], variables);
  let source = 0, shipped = 0;
  const courts = data.map((c) => {
    const pats = [];
    for (const raw of c.regex) {
      source++;
      const py = raw.replaceAll("\\\\", "\\");
      const r = tryTranslate(py, true);
      if (r.why) untranslated.push({ package: "courts-db", key: c.id, pattern: py, why: r.why });
      else pats.push({ source: r.ok, python: py });
    }
    // courts-db matches a court's name as one more pattern (gather_regexes); it is shipped apart from `patterns`.
    const namePy = c.name.replaceAll("\\\\", "\\"), nr = tryTranslate(namePy, true);
    if (nr.why) untranslated.push({ package: "courts-db", key: c.id, pattern: namePy, why: `the name, as a pattern: ${nr.why}` });
    const all = nr.why ? pats : [...pats, { source: nr.ok, python: namePy }];
    const examples = c.examples ?? [];
    const ok = checkExamples("courts-db", c.id, examples, all, FLAGS.courts, stripPunc, untranslated);
    const patterns = ok ? pats.map((p) => p.source) : [];
    shipped += patterns.length;
    return { id: c.id, name: c.name, citation_string: c.citation_string ?? null, type: c.type ?? null, level: c.level ?? null,
      system: c.system ?? null, jurisdiction: c.jurisdiction ?? null, dates: c.dates ?? [], patterns,
      name_pattern: ok && !nr.why ? nr.ok : null, examples };
  });
  return { courts, counts: { courts: courts.length, patterns: source, patterns_shipped: shipped } };
}

function sourceEntry(pkg, counts, pattern_flags) {
  const p = pkg.pin, licence_text = pkg.text[p.licence_file];
  const copyright = licence_text.split("\n").find((l) => /^Copyright/.test(l)) ?? null;
  return { package: p.package, version: p.version, licence: p.licence, url: p.url, project: p.project, wheel: p.wheel,
    files: pkg.files, counts, pattern_flags, copyright, licence_text };
}

function render(sources, reporters, courts) {
  const lines = (a) => a.map((x) => JSON.stringify(x)).join(",\n");
  const notice = sources.map((s) => `// ${s.package} ${s.version}: ${s.copyright} (${s.licence}; full text in SOURCES).`).join("\n");
  return `// GENERATED by court-citations/build.mjs from the pinned Free Law Project packages (court-citations/pins.json).
// Do not edit: regenerate from the repository root with \`node court-citations/build.mjs\` (PROCESS-MECHANICS §14).
${notice}
// This file reproduces their data, translated; their copyright notices, conditions and disclaimer are carried whole
// in SOURCES[].licence_text, as their licence requires.
const freeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { for (const v of Object.values(o)) freeze(v); Object.freeze(o); } return o; };
export const SOURCES = freeze(${JSON.stringify(sources)});
export const REPORTERS = freeze([
${lines(reporters)}
]);
export const COURTS = freeze([
${lines(courts)}
]);
`;
}

/* R4–R5. With write: false, nothing is written and `text` carries the result (verifyFresh). `pins` defaults to
 * pins.json; a test passes its own to build a small package of its own. */
export function buildCourtCitations({ reportersDir = DEFAULTS.reportersDir, courtsDir = DEFAULTS.courtsDir, out = DATA_FILE, write = true, pins = PINS } = {}) {
  const rp = readPackage(pins, "reporters-db", reportersDir), cp = readPackage(pins, "courts-db", courtsDir);
  for (const p of [rp, cp]) if (p.absent || p.wrong) return { ok: false, file: null, untranslated: [], why: p.absent ?? p.wrong, absent: !!p.absent };
  const untranslated = [];
  const r = buildReporters(rp, untranslated), c = buildCourts(cp, untranslated);
  const sources = [sourceEntry(rp, r.counts, FLAGS.reporters), sourceEntry(cp, c.counts, FLAGS.courts)];
  const text = render(sources, r.reporters, c.courts);
  if (write) writeFileSync(out, text);
  return { ok: true, file: write ? out : null, untranslated, text };
}

/* R6: rebuild without writing; fresh only when byte-identical to the committed file. */
export function verifyFresh({ reportersDir, courtsDir, file = DATA_FILE } = {}) {
  let b;
  try { b = buildCourtCitations({ reportersDir, courtsDir, write: false }); } catch (e) { return { fresh: false, why: `the build failed: ${e.message}` }; }
  if (!b.ok) return b.absent ? { fresh: null, why: `could not check: ${b.why}` } : { fresh: false, why: b.why };
  if (!existsSync(file)) return { fresh: false, why: `${file} is not there` };
  const committed = readFileSync(file);
  return Buffer.from(b.text, "utf8").equals(committed) ? { fresh: true, why: "byte-identical to a rebuild from the pinned packages" }
    : { fresh: false, why: `${file} differs from a rebuild from the pinned packages; regenerate with \`node court-citations/build.mjs\`` };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes("--check")) { const v = verifyFresh(); console.log(JSON.stringify(v)); process.exit(v.fresh ? 0 : 1); }
  const b = buildCourtCitations();
  if (!b.ok) { console.error(b.why); process.exit(1); }
  for (const u of b.untranslated) console.log(`untranslated: ${u.package} ${u.key}: ${u.why}`);
  console.log(`wrote ${b.file}; ${b.untranslated.length} untranslated`);
}
