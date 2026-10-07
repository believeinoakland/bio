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
  "resolve-version.mjs", "jsonc.mjs", "bundles.mjs", "deploy-fleet.mjs", "release-assemble.mjs", "release-advisories.mjs"];

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

/* The fake docker (R26): records argv and exits $DOCKER_EXIT. Found on PATH, as the deploy finds the real one. */
const DOCKER = `#!/usr/bin/env node
require("node:fs").appendFileSync(process.env.DOCKER_LOG, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + "\\n");
process.exit(Number(process.env.DOCKER_EXIT || 0));
`;
export const DIGEST = "sha256:" + "ab".repeat(32);

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

/** The production lockfile a container member's image installs from (R27): one package each of the shapes the
 *  reading must handle, a dev package it must leave out, and the root entry. */
export const CONTAINER_LOCK = {
  name: "runner", version: VERSION, lockfileVersion: 3, requires: true,
  packages: {
    "": { name: "runner", version: VERSION, dependencies: { zeta: "2.0.0", alpha: "1.0.0" } },
    "node_modules/zeta": { version: "2.0.0", resolved: "https://registry.npmjs.org/zeta/-/zeta-2.0.0.tgz" },
    "node_modules/alpha": { version: "1.0.0" },
    "node_modules/zeta/node_modules/alpha": { version: "0.9.0" },
    "node_modules/@scope/pkg": { version: "3.1.0", optional: true },
    "node_modules/aliased": { name: "real-name", version: "5.0.0" },
    "node_modules/devonly": { version: "9.9.9", dev: true },
  },
};
/** R27's list for CONTAINER_LOCK, written by hand: every non-dev installed copy, by name then version. */
export const CONTAINER_PACKAGES = [
  { name: "@scope/pkg", version: "3.1.0" }, { name: "alpha", version: "0.9.0" }, { name: "alpha", version: "1.0.0" },
  { name: "real-name", version: "5.0.0" }, { name: "zeta", version: "2.0.0" },
];

/** A container member (R24): `kind: "container"` and an `image` block, with R25's descriptor fields, and, unless
 *  `bundle: false`, the Worker that hosts its class (a guarded bundle) and a config declaring its container. Any
 *  `marker` key overrides the marker's (`undefined` removes one). Its `package-lock.json` is `lock` (R27), none when
 *  null. */
export function addContainerMember(root, name, { bundle = true, marker = {}, containers = true, lock = CONTAINER_LOCK } = {}) {
  const dir = join(root, name);
  if (bundle) {
    addMember(root, name, { services: [] });
    const cfg = parseCfg(join(dir, "wrangler.jsonc"));
    if (containers) cfg.containers = [{ class_name: "Runner", image: "./Dockerfile", max_instances: 3 }];
    put(root, `${name}/wrangler.jsonc`, jsonc(cfg));
  } else {
    put(root, `${name}/src/entry.mjs`, "export const runner = true;\n");
    put(root, `${name}/package.json`, JSON.stringify({ name, version: VERSION, private: true, type: "module" }, null, 2));
  }
  const prev = bundle ? JSON.parse(readFileSync(join(dir, "fleet-member.json"), "utf8")) : { name, entry: "src/entry.mjs" };
  const m = { ...prev, kind: "container",
    image: { repository: "docker.io/civicos/runner", digest: DIGEST, platform: "linux/amd64", port: 8080, schedulingPolicy: "default" },
    class_name: "Runner", max_instances: 3, bind: [{ member: "alpha-worker", binding: "RUNNER" }], ...marker };
  for (const k of Object.keys(m)) if (m[k] === undefined) delete m[k];
  put(root, `${name}/fleet-member.json`, JSON.stringify(m, null, 2));
  if (lock) put(root, `${name}/package-lock.json`, JSON.stringify(lock, null, 2) + "\n");
  return dir;
}
/** R25, R27 (T36-2): a container member with TWO classes, as `file-scanner` states itself — a `containers` list, each
 *  class with its own image, a base pinned by digest and a package statement for its system packages; `bind` once at
 *  the top level, `max_instances` per class. Its Worker config declares one container per class. `classes` overrides
 *  the list; `statements` (path → object, or null for none) the statement files; any `marker` key the marker's. */
export const BASE_A = "sha256:" + "a1".repeat(32), BASE_B = "sha256:" + "b2".repeat(32);
export const DIGEST_A = "sha256:" + "c3".repeat(32), DIGEST_B = "sha256:" + "d4".repeat(32);
export const SCANNER_STATEMENTS = {
  "images/scan.packages.json": { ecosystem: "Debian:12", base: { repository: "docker.io/library/debian", digest: BASE_A },
    packages: [{ name: "clamav", version: "1.4.3+dfsg-1" }, { name: "clamav-base", version: "1.4.3+dfsg-1" },
      { name: "ca-certificates", version: "20230311" }] },
  "images/render.packages.json": { ecosystem: "Debian:12", base: { repository: "docker.io/library/debian", digest: BASE_B },
    packages: [{ name: "poppler-utils", version: "22.12.0-2" }, { name: "libreoffice-core", version: "4:7.4.7-1" }] },
};
/** The two statements' lists as R27 writes them, by hand: sorted by name then version. */
export const SCANNER_PACKAGES = {
  FileScanner: [{ name: "ca-certificates", version: "20230311" }, { name: "clamav", version: "1.4.3+dfsg-1" },
    { name: "clamav-base", version: "1.4.3+dfsg-1" }],
  SafeViewRenderer: [{ name: "libreoffice-core", version: "4:7.4.7-1" }, { name: "poppler-utils", version: "22.12.0-2" }],
};
export function scannerClasses() {
  return [
    { class_name: "FileScanner", max_instances: 4,
      image: { repository: "docker.io/civicos/file-scanner", digest: DIGEST_A, platform: "linux/amd64", port: 3310,
        schedulingPolicy: "default", base: { repository: "docker.io/library/debian", digest: BASE_A }, packages: "images/scan.packages.json" } },
    { class_name: "SafeViewRenderer", max_instances: 2,
      image: { repository: "docker.io/civicos/safe-view", digest: DIGEST_B, platform: "linux/amd64", port: 8080,
        base: { repository: "docker.io/library/debian", digest: BASE_B }, packages: "images/render.packages.json" } },
  ];
}
export function addScannerMember(root, name, { classes = scannerClasses(), statements = SCANNER_STATEMENTS, marker = {} } = {}) {
  const dir = join(root, name);
  addMember(root, name, { services: [] });
  const cfg = parseCfg(join(dir, "wrangler.jsonc"));
  cfg.containers = classes.map((c) => ({ class_name: c.class_name, image: "./Dockerfile", max_instances: c.max_instances ?? 1 }));
  put(root, `${name}/wrangler.jsonc`, jsonc(cfg));
  const prev = JSON.parse(readFileSync(join(dir, "fleet-member.json"), "utf8"));
  const m = { ...prev, kind: "container", containers: classes, bind: [{ member: "alpha-worker", binding: "FILE_SCANNER" }], ...marker };
  for (const k of Object.keys(m)) if (m[k] === undefined) delete m[k];
  put(root, `${name}/fleet-member.json`, JSON.stringify(m, null, 2));
  for (const [p, o] of Object.entries(statements || {})) if (o) put(root, `${name}/${p}`, JSON.stringify(o, null, 2) + "\n");
  return dir;
}

const parseCfg = (p) => JSON.parse(readFileSync(p, "utf8").split("\n").slice(1).join("\n"));

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
  put(root, ".fakebin/docker", DOCKER);
  chmodSync(join(root, ".fakebin/docker"), 0o755);

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
  for (const m of [lib.planeMember(root), ...lib.discoverMembers(root).filter((x) => x.bundle)]) await lib.writeMember(m);
}

/** Runs a command; `stub` is a scenario object for stubfetch, `env` extra environment. */
export function run(root, cwdRel, args, { env = {}, stub = null, timeout = 120_000 } = {}) {
  const work = mkdtempSync(join(tmpdir(), "bundler-run-"));
  const stubFile = join(work, "stub.json"), stubLog = join(work, "stub.log"), wLog = join(work, "wrangler.log");
  const dLog = join(work, "docker.log");
  writeFileSync(stubFile, JSON.stringify(stub || {}));
  const clean = Object.fromEntries(Object.entries(process.env).filter(([k]) =>
    !/^(CF_TOKEN|CF_ACCT|CLOUDFLARE_API_TOKEN|INSTANCE_CLAUDE_TOKEN|INSTANCE_AI_TOKEN|BIO_RELEASE_SEED|GITHUB_ACTIONS|NODE_OPTIONS|NODE_TEST_CONTEXT)$/.test(k)));
  const r = spawnSync(process.execPath, ["--import", STUB, ...args], {
    cwd: join(root, cwdRel), encoding: "utf8", timeout,
    env: { ...clean, PATH: `${join(root, ".fakebin")}:${process.env.PATH}`, BUNDLER_STUB: stubFile, BUNDLER_STUB_LOG: stubLog,
      WRANGLER_LOG: wLog, DOCKER_LOG: dLog, ...env },
  });
  const lines = (f) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
  const out = { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "", calls: lines(stubLog), wrangler: lines(wLog),
    docker: lines(dLog) };
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
