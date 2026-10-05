/* A throwaway repository for driving bundler's commands at their interface (R16–R23): the module's own
 * scripts copied into `<root>/bio-plane/scripts/`, so each command finds this root exactly as it finds the
 * real one (beside itself), with a tiny plane and fleet members, `esbuild` linked from the plane's real
 * install, a fake `wrangler` that records what it was asked, and signatures' files it reads. Nothing here
 * touches the real repository or a real account. */
import { spawnSync } from "node:child_process";
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, symlinkSync, rmSync, readdirSync, statSync,
  chmodSync, existsSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLANE = join(HERE, "..", "..", "..");                 /* the real bio-plane/ */
export const REAL_ROOT = join(PLANE, "..");
export const STUB = join(HERE, "stubfetch.mjs");

/* bundler's scripts (its `paths`), and the files of other modules they read. */
const OWN = ["fleet-bundle.mjs", "provenance.mjs", "build-plane.mjs", "deploy.mjs", "derive-bindings.mjs",
  "resolve-version.mjs", "jsonc.mjs", "bundles.mjs", "deploy-fleet.mjs", "release-assemble.mjs"];

export const hex = (b) => createHash("sha256").update(b).digest("hex");
export const VERSION = "1.2.3";
export const ACCOUNT = "0123456789abcdef0123456789abcdef";

const put = (root, rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };
const jsonc = (obj, comment = "a fixture config") => `// ${comment}: a // inside a string survives "https://x.test/a"\n${JSON.stringify(obj, null, 2)}\n`;

/* The fake wrangler: records argv, cwd and the config it was handed, and exits $WRANGLER_EXIT. */
const WRANGLER = `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const c = args[args.indexOf("-c") + 1];
fs.appendFileSync(process.env.WRANGLER_LOG, JSON.stringify({ args, cwd: process.cwd(),
  config: c && fs.existsSync(c) ? fs.readFileSync(c, "utf8") : null,
  token: process.env.CLOUDFLARE_API_TOKEN ? "present" : "absent" }) + "\\n");
process.exit(Number(process.env.WRANGLER_EXIT || 0));
`;

/** A member's files: source, marker, configs, and a build script that is the member's own `npm run build`. */
export function addMember(root, name, { version = VERSION, services = [{ binding: "PLANE", service: "bio-plane" }],
  assets = null, compat = "2026-07-01", flags = ["nodejs_compat"], account = ACCOUNT, vendored = false } = {}) {
  const dir = join(root, name);
  put(root, `${name}/src/index.mjs`, `import { word } from "./word.mjs";\n`
    + (vendored ? `import { V } from "fakedep";\n` : "const V = 0;\n")
    + `export default { fetch() { return new Response(word + V); } };\n`);
  put(root, `${name}/src/word.mjs`, `export const word = ${JSON.stringify(name)};\n`);
  if (vendored) {
    put(root, `${name}/node_modules/fakedep/package.json`, JSON.stringify({ name: "fakedep", type: "module", exports: "./index.mjs" }));
    put(root, `${name}/node_modules/fakedep/index.mjs`, "export const V = 7;\n");
    put(root, `${name}/package-lock.json`, JSON.stringify({ name, lockfileVersion: 3 }) + "\n");
  }
  const bundle = { entry: "src/index.mjs", outfile: `dist/${name}.bundled.mjs`, manifest: `dist/${name}.bundle.json`,
    external: ["cloudflare:workers", "node:*"] };
  if (assets) { bundle.assets = Object.keys(assets); for (const [p, t] of Object.entries(assets)) put(root, `${name}/${p}`, t); }
  put(root, `${name}/fleet-member.json`, JSON.stringify({ name, entry: "src/index.mjs", bundle }, null, 2));
  put(root, `${name}/package.json`, JSON.stringify({ name, version, private: true, type: "module",
    scripts: { build: "node build.mjs" } }, null, 2));
  put(root, `${name}/build.mjs`, `import { discoverMembers, writeMember } from "../bio-plane/scripts/fleet-bundle.mjs";\n`
    + `await writeMember(discoverMembers().find((m) => m.dir === ${JSON.stringify(name)}));\n`);
  const cfg = { name, ...(account ? { account_id: account } : {}), main: `dist/${name}.bundled.mjs`,
    ...(compat ? { compatibility_date: compat } : {}), ...(flags ? { compatibility_flags: flags } : {}),
    vars: { VERSION: version }, services };
  if (assets) cfg.rules = [{ type: "Data", globs: ["**/*.bin"] }, { type: "CompiledWasm", globs: ["**/*.wasm"] }];
  put(root, `${name}/wrangler.jsonc`, jsonc(cfg));
  return dir;
}

/** The plane's configuration, as a parsed object, for a fixture or a function test. */
export function planeConfig({ version = VERSION, services = [{ binding: "SELF", service: "bio-plane" }] } = {}) {
  return {
    name: "bio-plane", account_id: ACCOUNT, main: "src/plane/index.mjs",
    compatibility_date: "2026-07-01", compatibility_flags: ["nodejs_compat"],
    vars: { VERSION: version, MODE: "fixture" },
    durable_objects: { bindings: [{ name: "STORE", class_name: "Store" }] },
    r2_buckets: [{ binding: "CAPTURES", bucket_name: "c" }, { binding: "PUBLISHED", bucket_name: "p" }],
    services, browser: { binding: "BROWSER" }, limits: { subrequests: 500, cpu_ms: 30000 },
  };
}

/** `rel` (under the real bio-plane/) and every file it reaches through relative static imports, as paths under
 *  bio-plane/. */
function localClosure(rel) {
  const seen = new Set(), todo = [rel];
  while (todo.length) {
    const f = todo.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const text = readFileSync(join(PLANE, f), "utf8");
    for (const [, spec] of text.matchAll(/(?:^|[\s;])(?:import|export)\b[^'"`;]*?\bfrom\s*["']([^"']+)["']/g))
      if (spec.startsWith(".")) todo.push(relative(PLANE, join(PLANE, dirname(f), spec)));
  }
  return [...seen];
}

/** A fixture repository: the plane, `members` (name → addMember options), the module's scripts, and the
 *  other modules' files the commands read. `build: true` writes every guarded bundle fresh. */
export async function makeRepo({ members = { "alpha-worker": {}, "beta-worker": { assets: { "assets/model.bin": "MODEL-1" } } },
  plane = {}, build = true, realPackageJson = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "bundler-repo-"));
  for (const f of OWN) put(root, `bio-plane/scripts/${f}`, readFileSync(join(PLANE, "scripts", f)));
  put(root, "bio-plane/scripts/embed-signpage.mjs", readFileSync(join(PLANE, "scripts/embed-signpage.mjs")));
  /* sshsig.mjs is signatures', and it imports other modules (record-grammar since T33-7): copy its whole relative
     import closure, so a new import there never strands the fixture. */
  for (const rel of localClosure("src/sshsig.mjs")) put(root, `bio-plane/${rel}`, readFileSync(join(PLANE, rel)));
  put(root, "bio-plane/src/sign-release.html", readFileSync(join(PLANE, "src/sign-release.html")));
  put(root, "bio-plane/scripts/sign-sshsig.mjs", readFileSync(join(PLANE, "scripts/sign-sshsig.mjs")));
  mkdirSync(join(root, "bio-plane/node_modules/.bin"), { recursive: true });
  symlinkSync(join(PLANE, "node_modules/esbuild"), join(root, "bio-plane/node_modules/esbuild"), "dir");
  put(root, "bio-plane/node_modules/.bin/wrangler", WRANGLER);
  chmodSync(join(root, "bio-plane/node_modules/.bin/wrangler"), 0o755);

  const version = plane.version ?? VERSION;
  put(root, "bio-plane/src/plane/index.mjs", `import { tag } from "../tag.mjs";\nexport default { fetch() { return new Response(tag); } };\n`);
  put(root, "bio-plane/src/tag.mjs", `export const tag = "plane";\n`);
  put(root, "bio-plane/wrangler.jsonc", jsonc(planeConfig({ version, ...plane.config })));
  if (realPackageJson) {
    const pkg = JSON.parse(readFileSync(join(PLANE, "package.json"), "utf8"));
    put(root, "bio-plane/package.json", JSON.stringify({ ...pkg, version }, null, 2));
  } else {
    put(root, "bio-plane/package.json", JSON.stringify({ name: "bio-plane", version, private: true, type: "module",
      scripts: { build: "node scripts/build-plane.mjs" } }, null, 2));
  }
  for (const [name, opts] of Object.entries(members)) addMember(root, name, opts);
  mkdirSync(join(root, "release"), { recursive: true });
  if (build) await buildAll(root);
  return root;
}

/** Writes every guarded bundle in the fixture fresh, through the module's real `writeMember`. */
export async function buildAll(root) {
  const lib = await import(pathToFileURL(join(root, "bio-plane/scripts/fleet-bundle.mjs")).href);
  for (const m of [lib.planeMember(root), ...lib.discoverMembers(root)]) await lib.writeMember(m);
}

/** Runs a command; `stub` is a scenario object for stubfetch, `env` extra environment. */
export function run(root, cwdRel, args, { env = {}, stub = null, timeout = 120_000 } = {}) {
  const work = mkdtempSync(join(tmpdir(), "bundler-run-"));
  const stubFile = join(work, "stub.json"), stubLog = join(work, "stub.log"), wLog = join(work, "wrangler.log");
  writeFileSync(stubFile, JSON.stringify(stub || {}));
  const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) =>
    !/^(CF_TOKEN|CF_ACCT|CLOUDFLARE_API_TOKEN|INSTANCE_CLAUDE_TOKEN|INSTANCE_AI_TOKEN|BIO_RELEASE_SEED|NODE_OPTIONS|NODE_TEST_CONTEXT)$/.test(k)));
  const r = spawnSync(process.execPath, ["--import", STUB, ...args], {
    cwd: join(root, cwdRel), encoding: "utf8", timeout,
    env: { ...clean, BUNDLER_STUB: stubFile, BUNDLER_STUB_LOG: stubLog, WRANGLER_LOG: wLog, ...env },
  });
  const lines = (f) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
  const out = { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "", calls: lines(stubLog), wrangler: lines(wLog) };
  rmSync(work, { recursive: true, force: true });
  return out;
}

/** Every file under `dir` with its bytes: the state a command could change. */
export function snapshot(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[relative(dir, p)] = `${hex(readFileSync(p))} ${statSync(p).size}`;
    }
  };
  walk(dir);
  return out;
}

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export const writeJson = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + "\n");
export const rm = (root) => rmSync(root, { recursive: true, force: true });
