/* interface-assets at its interface (R1–R4; DEC-138; N897 (1); N559): `ASSET_FILES` read against the design stream's
   docs/development/ux-substrate/visual-language/ at ASSETS_COMMIT, read from git so the working copy never moves it.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const MODULE = join(ROOT, "bio-plane/src/interface-assets/index.mjs");
const DIR = "docs/development/ux-substrate/visual-language";
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
  if (commit !== "3f40899950") out.push(`ASSETS_COMMIT ${commit}, not 3f40899950`);
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

test("R1: ASSETS_COMMIT is 3f40899950 and ASSET_FILES holds exactly R1's 20 files, each equal byte for byte to git at the commit", () => {
  const { faces } = expected();
  assert.equal(faces.length, 15);
  assert.equal(Object.keys(ASSET_FILES).length, 20);
  assert.deepEqual(r1Failures(ASSET_FILES, ASSETS_COMMIT), []);
  // The stylesheet's stated rewriting: every face named at /app/assets/fonts/, no relative fonts/ url left.
  const css = ASSET_FILES["civicsmith.css"].body;
  assert.equal(css.split('url("/app/assets/fonts/').length - 1, 15);
  assert.ok(!css.includes('url("fonts/'));
});

test("R1 control: a wrong commit, a changed byte, a lost face, an extra name, a wrong type or a missing encoding is refused", () => {
  const copy = () => Object.fromEntries(Object.entries(ASSET_FILES).map(([n, e]) => [n, { ...e }]));
  assert.ok(r1Failures(ASSET_FILES, "8e5f57fad0").length > 0);
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

test("R2: no file of ASSET_FILES names a resource outside /app/assets/ on the page's own origin", () => {
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
