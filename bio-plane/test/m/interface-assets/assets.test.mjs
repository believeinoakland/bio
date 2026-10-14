/* interface-assets at its interface (R1–R7; DEC-138; N897 (1); N559; N1039; K3254): `ASSET_FILES` read against the
   design stream's docs/development/ux-substrate/visual-language/ and screens/page.src.html at ASSETS_COMMIT, read from
   git so the working copy never moves it.
   Each check is a function returning its failures, so a negative control shows it refusing a wrong map. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import * as assets from "../../../src/interface-assets/index.mjs";
import { ASSET_FILES, ASSETS_COMMIT } from "../../../src/interface-assets/index.mjs";
import { shellCss } from "../../../src/interface-assets/generate.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MODULE = join(ROOT, "bio-plane/src/interface-assets/index.mjs");
const DIR = "docs/development/ux-substrate/visual-language";
const PAGE = "docs/development/ux-substrate/screens/page.src.html";
const COMMIT = "4664e8efd4"; // R5: main at PR #34's merge (PR #33's visual language); START named no later commit
const git = (args) => execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 26 });
const atCommit = (path) => git(["show", `${ASSETS_COMMIT}:${DIR}/${path}`]);
const bytesOf = (e) => (e.encoding === "base64" ? Buffer.from(e.body, "base64") : Buffer.from(e.body, "utf8"));

/* What R1 says the map holds, stated from git independently of the generator. */
function expected() {
  const faces = git(["ls-tree", "--name-only", ASSETS_COMMIT, `${DIR}/fonts/`]).toString("utf8").split("\n")
    .filter((p) => p.endsWith(".woff2")).map((p) => p.slice(DIR.length + 1));
  const faceCss = atCommit("faces.css").toString("utf8");
  const rewritten = faceCss.split('url("fonts/').join('url("/app/assets/fonts/');
  const want = new Map([
    ["civicsmith.css", { type: "text/css", bytes: Buffer.concat([atCommit("civicsmith.css"), Buffer.from(rewritten, "utf8")]) }],
    ["shell.css", { type: "text/css", bytes: Buffer.from(shellCss(git(["show", `${ASSETS_COMMIT}:${PAGE}`]).toString("utf8")), "utf8") }],
    ["icons.svg", { type: "image/svg+xml", bytes: atCommit("icons.svg") }],
  ]);
  for (const f of faces) want.set(f, { type: "font/woff2", base64: true, bytes: atCommit(f) });
  for (const n of ["source-serif-4", "source-sans-3", "source-code-pro"])
    want.set(`fonts/OFL-${n}.txt`, { type: "text/plain", bytes: atCommit(`fonts/OFL-${n}.txt`) });
  return { want, faces, faceCss };
}

function r1Failures(files, commit) {
  const out = [];
  const { want } = expected();
  if (commit !== COMMIT) out.push(`ASSETS_COMMIT ${commit}, not ${COMMIT}`);
  const names = Object.keys(files);
  for (const n of names) if (!want.has(n)) out.push(`${n}: not a name R1 gives`);
  for (const [n, w] of want) {
    const e = files[n];
    if (!e) { out.push(`${n}: missing`); continue; }
    const keys = Object.keys(e).sort().join(",");
    if (keys !== (w.base64 ? "body,encoding,type" : "body,type")) out.push(`${n}: fields ${keys}`);
    if (e.type !== w.type) out.push(`${n}: type ${e.type}`);
    if (typeof e.body !== "string") { out.push(`${n}: body not a string`); continue; }
    if (w.base64 && e.encoding !== "base64") out.push(`${n}: encoding ${e.encoding}`);
    if (w.base64 && Buffer.from(e.body, "base64").toString("base64") !== e.body) out.push(`${n}: not canonical base64`);
    if (!bytesOf(e).equals(w.bytes)) out.push(`${n}: bytes differ from git at the commit`);
  }
  return out;
}

/* Every resource a file names, in url(), @import, href or src; R2 allows only /app/assets/… on the page's origin, and
   a fragment of the same file (#id). An XML namespace declaration (xmlns) names no resource. */
const REFS = [
  /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi,
  /@import\s+(?:url\(\s*)?(?:"([^"]*)"|'([^']*)'|([^\s;)'"]+))/gi,
  /(?<![\w-])(?:xlink:)?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
  /(?<![\w-])src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
];
function r2Failures(files) {
  const out = [];
  for (const [n, e] of Object.entries(files)) {
    const text = e.encoding === "base64" ? Buffer.from(e.body, "base64").toString("latin1") : e.body;
    for (const re of REFS)
      for (const m of text.matchAll(re)) {
        const ref = (m[1] ?? m[2] ?? m[3] ?? "").trim();
        const ok = (ref.startsWith("/app/assets/") && !ref.includes("..")) || /^#[\w-]+$/.test(ref);
        if (!ok) out.push(`${n}: names ${JSON.stringify(ref)}`);
      }
  }
  return out;
}

function r3Failures(files) {
  const out = [];
  if (!Object.isFrozen(files)) out.push("the map is not frozen");
  for (const [n, e] of Object.entries(files)) if (!Object.isFrozen(e)) out.push(`${n}: not frozen`);
  const tryWrite = (label, fn) => { try { fn(); out.push(`${label}: write accepted`); } catch (err) { if (!(err instanceof TypeError)) out.push(`${label}: ${err}`); } };
  tryWrite("add", () => { files["evil.css"] = { type: "text/css", body: "" }; });
  tryWrite("delete", () => { delete files["civicsmith.css"]; });
  for (const [n, e] of Object.entries(files)) {
    tryWrite(`${n} body`, () => { e.body = "x"; });
    tryWrite(`${n} type`, () => { e.type = "text/html"; });
    tryWrite(`${n} new field`, () => { e.extra = 1; });
  }
  return out;
}

/* R4: load a module in a fresh process whose every import, I/O, timer, clock and randomness source is watched. */
const WATCH = `
import { register } from "node:module";
import fs from "node:fs";
const seen = [];
globalThis.__seen = seen;
const { port1, port2 } = new MessageChannel();
port1.on("message", (m) => seen.push("import " + m)); port1.unref();
register("data:text/javascript," + encodeURIComponent(\`
  let port; export function initialize(d) { port = d.port; }
  export async function resolve(s, c, next) { if (c.parentURL && c.parentURL === process.env.WATCHED) port.postMessage(s); return next(s, c); }\`),
  import.meta.url, { data: { port: port2 }, transferList: [port2] });
const trap = (o, k, label) => { const f = o[k]; o[k] = function (...a) { if (globalThis.__on) seen.push(label); return f.apply(this, a); }; };
for (const k of Object.keys(fs)) if (typeof fs[k] === "function" && /^[a-z]/.test(k)) trap(fs, k, "fs." + k);
for (const k of Object.keys(fs.promises)) if (typeof fs.promises[k] === "function") trap(fs.promises, k, "fs.promises." + k);
trap(Date, "now", "Date.now"); trap(Math, "random", "Math.random"); trap(globalThis, "fetch", "fetch");
trap(globalThis, "setTimeout", "setTimeout"); trap(globalThis, "setInterval", "setInterval"); trap(globalThis, "queueMicrotask", "queueMicrotask");
trap(crypto, "getRandomValues", "crypto.getRandomValues"); trap(crypto, "randomUUID", "crypto.randomUUID");
trap(performance, "now", "performance.now");
const RealDate = Date;
globalThis.Date = new Proxy(RealDate, { construct(t, a) { if (globalThis.__on && a.length === 0) seen.push("new Date()"); return new t(...a); } });
`;
function loadWatched(path) {
  const dir = mkdtempSync(join(tmpdir(), "interface-assets-"));
  try {
    const hook = join(dir, "watch.mjs");
    writeFileSync(hook, WATCH);
    const url = pathToFileURL(path).href;
    const main = `globalThis.__on = true; const m = await import(${JSON.stringify(url)}); globalThis.__on = false;
      await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
      process.stdout.write(JSON.stringify({ seen: globalThis.__seen, exports: Object.keys(m).sort() }));`;
    const r = spawnSync(process.execPath, ["--import", pathToFileURL(hook).href, "--input-type=module", "-e", main],
      { encoding: "utf8", env: { ...process.env, WATCHED: url }, maxBuffer: 1 << 26 });
    if (r.status !== 0) throw new Error(r.stderr);
    return JSON.parse(r.stdout);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
function r4Failures(loaded) {
  const out = loaded.seen.map((s) => `does ${s} when loaded`);
  if (loaded.exports.join(",") !== "ASSETS_COMMIT,ASSET_FILES") out.push(`exports ${loaded.exports.join(",")}`);
  return out;
}

test("R1, R5: ASSETS_COMMIT is 4664e8efd4 and ASSET_FILES holds exactly R1's 20 files and R7's shell.css, each equal byte for byte to git at the commit", () => {
  const { faces } = expected();
  assert.equal(faces.length, 15);
  assert.equal(Object.keys(ASSET_FILES).length, 21);
  assert.deepEqual(r1Failures(ASSET_FILES, ASSETS_COMMIT), []);
  // The stylesheet's stated rewriting: every face named at /app/assets/fonts/, no relative fonts/ url left.
  const css = ASSET_FILES["civicsmith.css"].body;
  assert.equal(css.split('url("/app/assets/fonts/').length - 1, 15);
  assert.ok(!css.includes('url("fonts/'));
});

test("R1 control: a wrong commit, a changed byte, a lost face, an extra name, a wrong type or a missing encoding is refused", () => {
  const copy = () => Object.fromEntries(Object.entries(ASSET_FILES).map(([n, e]) => [n, { ...e }]));
  assert.ok(r1Failures(ASSET_FILES, "8e5f57fad0").length > 0);
  assert.ok(r1Failures(ASSET_FILES, "3f40899950").length > 0, "R5: T45's commit no longer holds");
  let c = copy(); c["icons.svg"].body = c["icons.svg"].body.replace("svg", "SVG"); assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); c["civicsmith.css"].body = c["civicsmith.css"].body.split("/app/assets/fonts/").join("fonts/"); assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); const face = Object.keys(c).find((n) => n.endsWith(".woff2"));
  const b = Buffer.from(c[face].body, "base64"); b[b.length - 1] ^= 1; c[face].body = b.toString("base64"); assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); delete c[face]; assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); c["page.src.html"] = { type: "text/html", body: "" }; assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); c["icons.svg"].type = "text/xml"; assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); delete c[face].encoding; assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
  c = copy(); c["fonts/OFL-source-sans-3.txt"].encoding = "base64"; assert.ok(r1Failures(c, ASSETS_COMMIT).length > 0);
});

test("R2, R7: no file of ASSET_FILES, shell.css among them, names a resource outside /app/assets/ on the page's own origin", () => {
  assert.ok("shell.css" in ASSET_FILES);
  assert.deepEqual(r2Failures(ASSET_FILES), []);
  // The scan sees the stylesheet's 15 face urls, so it is not reading nothing.
  assert.equal([...ASSET_FILES["civicsmith.css"].body.matchAll(REFS[0])].length, 15);
});

test("R2 control: another origin, a scheme-relative or relative url, an @import, an href or a src is refused", () => {
  for (const bad of [
    'a{background:url("https://fonts.example/x.woff2")}', "a{background:url(//cdn.example/x.png)}",
    "a{background:url('fonts/x.woff2')}", '@import "https://fonts.example/css";', "@import url(/elsewhere.css);",
    '<svg><use href="https://x.example/i.svg#a"/></svg>', '<svg><image xlink:href="data:image/png;base64,AA"/></svg>',
    '<img src="/other/x.png">', 'a{background:url("/app/assets/../secret")}',
  ]) assert.ok(r2Failures({ "x.css": { type: "text/css", body: bad } }).length > 0, bad);
  assert.deepEqual(r2Failures({ "x.svg": { type: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg"><use href="#a"/></svg>' } }), []);
});

test("R3: ASSET_FILES and each entry are frozen; no write changes the map, an entry or a field", () => {
  const before = JSON.stringify(ASSET_FILES);
  assert.deepEqual(r3Failures(ASSET_FILES), []);
  assert.equal(JSON.stringify(ASSET_FILES), before);
});

test("R3 control: an unfrozen map or entry is refused", () => {
  const open = { "a.css": Object.freeze({ type: "text/css", body: "" }) };
  assert.ok(r3Failures(open).length > 0);
  assert.ok(r3Failures(Object.freeze({ "a.css": { type: "text/css", body: "" } })).length > 0);
});

test("R4: loading the module imports nothing, does no I/O, timing or randomness, and defines only its two exports; every read answers the same", async () => {
  assert.deepEqual(r4Failures(loadWatched(MODULE)), []);
  assert.deepEqual(Object.keys(assets).sort(), ["ASSETS_COMMIT", "ASSET_FILES"]);
  const again = await import(`${pathToFileURL(MODULE).href}?again`);
  assert.equal(again.ASSETS_COMMIT, ASSETS_COMMIT);
  assert.deepEqual(again.ASSET_FILES, ASSET_FILES);
  assert.equal(JSON.stringify(ASSET_FILES), JSON.stringify(ASSET_FILES));
});

test("R4 control: a module that imports, reads a file, reads the clock or draws randomness when loaded is refused", () => {
  const dir = mkdtempSync(join(tmpdir(), "interface-assets-ctl-"));
  try {
    const cases = {
      "imports.mjs": 'import "./dep.mjs"; export const ASSET_FILES = {}, ASSETS_COMMIT = "";',
      "io.mjs": 'import fs from "node:fs"; fs.existsSync("/"); export const ASSET_FILES = {}, ASSETS_COMMIT = "";',
      "clock.mjs": "export const ASSET_FILES = { t: Date.now() }, ASSETS_COMMIT = String(new Date());",
      "random.mjs": "export const ASSET_FILES = { r: Math.random() }, ASSETS_COMMIT = \"\";",
      "extra.mjs": 'export const ASSET_FILES = {}, ASSETS_COMMIT = "", more = 1;',
    };
    writeFileSync(join(dir, "dep.mjs"), "export {};");
    for (const [f, body] of Object.entries(cases)) {
      writeFileSync(join(dir, f), body);
      assert.ok(r4Failures(loadWatched(join(dir, f))).length > 0, f);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

/* R5: the stylesheet's rules, comments removed, as {media, sel, body}; a rule inside an @media block carries its query. */
function rules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  let media = null, depth = 0, i = 0, start = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "{") {
      const pre = text.slice(start, i).trim();
      if (pre.startsWith("@")) { media = pre; depth++; start = i + 1; i++; continue; }
      const end = text.indexOf("}", i);
      out.push({ media: depth ? media : null, sel: pre, body: text.slice(i + 1, end) });
      i = end + 1; start = i; continue;
    }
    if (c === "}") { depth--; if (!depth) media = null; start = i + 1; }
    i++;
  }
  return out;
}
const sels = (r) => r.sel.split(",").map((s) => s.trim());
const KINDS = ["--c-kind-money", "--c-kind-part", "--c-kind-mention"];
function r5Failures(css) {
  const out = [];
  if (/cursor\s*:\s*help/i.test(css)) out.push("cursor: help");
  const all = rules(css);
  for (const r of all) if (sels(r).some((s) => /^\.cs-card(?![\w-])\S*$/.test(s)) && /(^|[;\s])cursor\s*:/.test(r.body)) out.push(`${r.sel}: a cursor`);
  for (const k of KINDS) {
    const at = all.filter((r) => new RegExp(`${k}\\s*:`).test(r.body));
    if (!at.some((r) => !r.media)) out.push(`${k}: not in light`);
    if (!at.some((r) => /prefers-color-scheme:\s*dark/.test(r.media ?? "") || /data-theme="dark"/.test(r.sel))) out.push(`${k}: not in dark`);
  }
  return out;
}

test("R5: civicsmith.css at 4664e8efd4 holds no cursor: help, no cursor in .cs-card, and the three kind tokens light and dark", () => {
  assert.equal(ASSETS_COMMIT, COMMIT);
  const css = ASSET_FILES["civicsmith.css"].body;
  assert.deepEqual(r5Failures(css), []);
  // Control: the cursor stays over a control, so the scan reads real rules.
  assert.ok(rules(css).some((r) => sels(r).includes(".cs-btn") && /cursor\s*:\s*pointer/.test(r.body)), ".cs-btn keeps cursor: pointer");
  assert.ok(rules(css).some((r) => sels(r).includes(".cs-card")), "the scan finds .cs-card");
});

test("R5 control: a help cursor, a cursor on .cs-card or a missing light or dark kind token is refused", () => {
  const css = ASSET_FILES["civicsmith.css"].body;
  assert.ok(r5Failures(css + "\n.cs-mark { cursor: help; }").length > 0);
  assert.ok(r5Failures(css + "\n.cs-card { cursor: pointer; }").length > 0);
  assert.ok(r5Failures(css + "\n.cs-card:hover { cursor: default }").length > 0);
  assert.ok(r5Failures(css.split("--c-kind-part").join("--c-kind-x")).length > 0);
  const lightOnly = rules(css).filter((r) => !r.media && !/data-theme="dark"/.test(r.sel)).map((r) => `${r.sel} {${r.body}}`).join("\n");
  assert.ok(r5Failures(lightOnly).some((f) => f.endsWith("not in dark")));
});

/* R6: a fresh process imports the module, measuring its heap and time (bundler R31's fresh import), then reads every
   face; a face's text is built only on its read. */
function faceHeap(path) {
  const script = `
    gc(); const h0 = process.memoryUsage().heapUsed; const t0 = performance.now();
    const m = await import(${JSON.stringify(pathToFileURL(path).href)});
    const importMs = performance.now() - t0; gc(); const h1 = process.memoryUsage().heapUsed;
    const faces = Object.entries(m.ASSET_FILES).filter(([n]) => n.endsWith(".woff2"));
    let chars = 0; for (const [, e] of faces) chars += e.body.length;
    gc(); const h2 = process.memoryUsage().heapUsed;
    process.stdout.write(JSON.stringify({ importMs, atImport: h1 - h0, onRead: h2 - h1, chars, faces: faces.length }));`;
  const r = spawnSync(process.execPath, ["--expose-gc", "--input-type=module", "-e", script], { encoding: "utf8", maxBuffer: 1 << 26 });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

test("R6: a fresh import evaluates no face; each face's base64 is built on its first read, byte-identical to R1's", () => {
  const m = faceHeap(MODULE);
  console.log(`interface-assets R6: import ${m.importMs.toFixed(1)} ms (bundler R31 budget 500 ms), heap at import ${(m.atImport / 1024) | 0} KB, on reading the faces ${(m.onRead / 1024) | 0} KB of ${(m.chars / 1024) | 0} KB base64`);
  assert.equal(m.faces, 15);
  assert.ok(m.atImport < m.chars / 2, `the import holds ${m.atImport} bytes, not under half the faces' ${m.chars}`);
  assert.ok(m.onRead > m.chars * 0.75, `reading the faces built ${m.onRead} bytes of their ${m.chars}`);
  // Every read answers the same text, equal to R1's bytes (R1's test checks each against git).
  for (const [n, e] of Object.entries(ASSET_FILES)) if (n.endsWith(".woff2")) assert.equal(e.body, ASSET_FILES[n].body);
  assert.deepEqual(r1Failures(ASSET_FILES, ASSETS_COMMIT), []);
});

test("R6 control: a module holding its faces as base64 literals in the global scope is refused", () => {
  const dir = mkdtempSync(join(tmpdir(), "interface-assets-r6-"));
  try {
    const eager = join(dir, "eager.mjs");
    const faces = Object.entries(ASSET_FILES).filter(([n]) => n.endsWith(".woff2"))
      .map(([n, e]) => `  ${JSON.stringify(n)}: Object.freeze({ type: "font/woff2", encoding: "base64", body: ${JSON.stringify(e.body)} }),`);
    writeFileSync(eager, `export const ASSETS_COMMIT = "x";\nexport const ASSET_FILES = Object.freeze({\n${faces.join("\n")}\n});\n`);
    const m = faceHeap(eager);
    assert.ok(!(m.atImport < m.chars / 2), `an eager module held only ${m.atImport} bytes at import`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

/* R7: shell.css is the generator's transform of the page's <style> at ASSETS_COMMIT. */
const PHONE_QUERY = "@media (max-width: 760px)";
function r7Failures(css) {
  const out = [];
  for (const r of rules(css)) for (const s of sels(r)) {
    if (/\.(mk-device|mk-scaler|mk-mockctl|mk-osprompt|anat|asfig|viewer|vlist|mk-page)(?![\w-])/.test(s)) out.push(`${s}: names a mock-only or page class`);
    if (!/\.(mk|cs)-[\w-]/.test(s)) out.push(`${s}: names no cs- or mk- class`);
  }
  return out;
}

test("R7: shell.css equals the generator's transform of page.src.html's <style> at ASSETS_COMMIT, with the product rules and the phone rules under the 760 px query", () => {
  const e = ASSET_FILES["shell.css"];
  assert.equal(e.type, "text/css");
  assert.equal(e.body, shellCss(git(["show", `${ASSETS_COMMIT}:${PAGE}`]).toString("utf8")));
  const all = rules(e.body);
  for (const c of [".mk-door", ".mk-acts", ".mk-frontgrid", ".mk-avatar"])
    assert.ok(all.some((r) => !r.media && sels(r).includes(c)), `${c} carried`);
  assert.ok(all.some((r) => r.media === PHONE_QUERY && sels(r).includes(".cs-tabs")), ".cs-tabs inside the 760 px query");
  assert.ok(all.some((r) => sels(r).some((s) => s.startsWith(".cs-frame"))), ".mk-page carried as .cs-frame");
  assert.deepEqual(r7Failures(e.body), []);
});

test("R7 control: the transform drops mock-only, page and unprefixed rules and rewrites the phone prefix and .mk-page; the scan refuses a stray rule", () => {
  const src = `<style>\n{{FACES}}\n{{CSS}}\n/* a comment { } */
.doc { margin: 0; }
.mk-door { cursor: pointer; } .mk-door b { font-size: 1px; }
.mk-device { padding: 10px; } .mk-scaler { transform: none; } .mk-mockctl, .mk-acts { gap: 1px; }
.asfig .mk-device { padding: 6px; } .anat .mk-x { gap: 0; } .vlist .cs-x { gap: 0; }
.mk-page .cs-tabs { display: none; } .mk-page.cs-shell { display: grid; }
.mk-tl::before { content: ", ;"; }
@media (max-width: 900px) { .viewer { gap: 0; } }
@media (max-width: 560px) { .mk-facts { grid-template-columns: 1fr; } .anat { gap: 0; } }
.mk-device[data-device="phone"] .cs-tabs { display: grid; }
.mk-device[data-device="phone"] .mk-page.cs-shell { grid-template-rows: auto; }
.mk-device[data-device="phone"] { border-radius: 28px; }
</style>`;
  const out = shellCss(src);
  const all = rules(out);
  const at = (media) => all.filter((r) => r.media === media).map((r) => `${r.sel} {${r.body.trim() ? ` ${r.body.trim()} ` : ""}}`);
  assert.deepEqual(at(null), [".mk-door { cursor: pointer; }", ".mk-door b { font-size: 1px; }", ".cs-frame .cs-tabs { display: none; }",
    ".cs-frame.cs-shell { display: grid; }", '.mk-tl::before { content: ", ;"; }']);
  assert.deepEqual(at("@media (max-width: 560px)"), [".mk-facts { grid-template-columns: 1fr; }"]);
  assert.deepEqual(at(PHONE_QUERY), [".cs-tabs { display: grid; }", ".cs-frame.cs-shell { grid-template-rows: auto; }"]);
  assert.deepEqual(r7Failures(out), []);
  // A brace or comma inside a string never splits a rule or a selector list.
  assert.equal(shellCss('<style>.mk-q::after { content: "} {"; } .mk-q[title="a, b"] { gap: 0; }</style>').split("\n").slice(2).join("\n"),
    '.mk-q::after { content: "} {"; }\n.mk-q[title="a, b"] { gap: 0; }\n');
  assert.ok(r7Failures(".mk-device .mk-x { gap: 0; }").length > 0);
  assert.ok(r7Failures(".mk-scaler { gap: 0; }").length > 0);
  assert.ok(r7Failures(".anat .mk-x { gap: 0; }").length > 0);
  assert.ok(r7Failures(".e-money { stroke: red; }").length > 0);
});
