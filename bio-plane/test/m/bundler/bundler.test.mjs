/* bundler: requirement-named tests at the module's interface
 * (build/requirements/bundler.md). Each test names the requirement id it checks
 * in its title. Every build runs over a tiny fixture member in a temporary
 * directory; esbuild comes from the plane's installed dependencies. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync, symlinkSync,
  cpSync, existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import {
  REPO_ROOT, RECIPE, DEFAULT_EXTERNAL, discoverMembers, optionsFor, buildMember, manifestFrom,
  writeMember, verifyStatic, verifyFresh, freshBuildRunnable, unresolvableSpecifiers, sha256,
  isContainer, isGuarded, containerDescriptor, imageReference, containerClasses, containerParts, classPackages,
  statementPackages, markerIsContainer, workerPart, WORKER_PART_PATH, BUCKET_ROLES,
} from "../../../scripts/fleet-bundle.mjs";
import { parseJsonc } from "../../../scripts/jsonc.mjs";
import {
  readGitProvenance, stateOf, contentStateOf, classifyDiscovered, reportProvenance, repoPath,
} from "../../../scripts/provenance.mjs";

const hex = (b) => createHash("sha256").update(b).digest("hex");
const tmp = (tag) => mkdtempSync(join(tmpdir(), `bundler-${tag}-`));

/** Writes a fixture member under `root/dir`: a two-file first-party source, one
 *  vendored dependency under node_modules, a lockfile, and the declared externals. */
function fixture(root, dir = "probe", { name = dir, lock = true, vendored = true, external } = {}) {
  const abs = join(root, dir);
  mkdirSync(join(abs, "src"), { recursive: true });
  writeFileSync(join(abs, "src/dep.mjs"), "export const N = 1;\n");
  writeFileSync(join(abs, "src/index.mjs"),
    'import { N } from "./dep.mjs";\n'
    + (vendored ? 'import { V } from "fakedep";\n' : "const V = 0;\n")
    + 'import { env } from "cloudflare:workers";\n'
    + 'import { readFileSync } from "node:fs";\n'
    + "export default { fetch() { return new Response(String(N + V) + typeof env + typeof readFileSync); } };\n");
  if (vendored) {
    mkdirSync(join(abs, "node_modules/fakedep"), { recursive: true });
    writeFileSync(join(abs, "node_modules/fakedep/package.json"),
      JSON.stringify({ name: "fakedep", version: "1.0.0", type: "module", exports: "./index.mjs" }));
    writeFileSync(join(abs, "node_modules/fakedep/index.mjs"), "export const V = 40;\n");
  }
  if (lock) writeFileSync(join(abs, "package-lock.json"), JSON.stringify({ name, lockfileVersion: 3 }) + "\n");
  const bundle = { entry: "src/index.mjs", outfile: `dist/${name}.bundled.mjs`, manifest: `dist/${name}.bundle.json` };
  if (external) bundle.external = external;
  writeFileSync(join(abs, "fleet-member.json"), JSON.stringify({ name, entry: "src/index.mjs", bundle }));
  return discoverMembers(root).find((m) => m.name === name);
}

/** Every file under `dir` with its bytes and mtime: the whole state a call could change. */
function snapshot(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { out[relative(dir, p) + "/"] = "dir"; walk(p); }
      else { const s = statSync(p); out[relative(dir, p)] = `${hex(readFileSync(p))} ${s.mtimeMs} ${s.size}`; }
    }
  };
  walk(dir);
  return out;
}

/* ------------------------------------------------------------------------- R1 */

test("R1: discoverMembers lists every member of a repository, each with its directory and entry point, in a stable order", () => {
  const root = tmp("r1");
  try {
    fixture(root, "zed", { name: "b-worker", vendored: false });
    fixture(root, "alpha", { name: "c-worker", vendored: false });
    fixture(root, "mid", { name: "a-worker", vendored: false });
    fixture(root, ".hidden", { name: "hidden-worker", vendored: false });  /* a dot directory is not the fleet */
    mkdirSync(join(root, "not-a-member"));                                   /* no marker */
    writeFileSync(join(root, "a-file.txt"), "x");                            /* not a directory */
    const noBundle = join(root, "plain");
    mkdirSync(noBundle);
    writeFileSync(join(noBundle, "fleet-member.json"), JSON.stringify({ name: "d-worker", entry: "src/main.mjs" }));

    const got = discoverMembers(root);
    assert.deepEqual(got.map((m) => m.name), ["a-worker", "b-worker", "c-worker", "d-worker"]);
    for (const m of got) {
      assert.equal(m.abs, join(root, m.dir), `${m.name}: abs is its directory`);
      assert.ok(existsSync(join(m.abs, "fleet-member.json")), `${m.name}: the directory holds its marker`);
    }
    assert.deepEqual(got.map((m) => [m.dir, m.entry]),
      [["mid", "src/index.mjs"], ["zed", "src/index.mjs"], ["alpha", "src/index.mjs"], ["plain", "src/main.mjs"]]);
    assert.equal(got.find((m) => m.name === "d-worker").bundle, null, "a member without a bundle block is listed, not dropped");
    assert.deepEqual(discoverMembers(root), got, "the same repository gives the same list");

    /* The order is by name and does not depend on the locale or on the walk:
       names that differ only in case, and two directories with one name. */
    fixture(root, "dup2", { name: "Z-upper", vendored: false });
    const again = discoverMembers(root).map((m) => m.name);
    assert.deepEqual(again, [...again].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R1: a marker that cannot be read as JSON is an error naming it, never a member silently dropped", () => {
  const root = tmp("r1bad");
  try {
    fixture(root, "good", { vendored: false });
    mkdirSync(join(root, "broken"));
    writeFileSync(join(root, "broken", "fleet-member.json"), "{ not json");
    assert.throws(() => discoverMembers(root), /broken[\\/]fleet-member\.json/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R1: the repository's own fleet is discovered with each member's directory and entry point", () => {
  const got = discoverMembers();
  assert.equal(REPO_ROOT, join(import.meta.dirname, "..", "..", "..", ".."));
  const names = got.map((m) => m.name);
  for (const want of ["agent-worker", "ocr-worker", "pdf-worker"]) assert.ok(names.includes(want), want);
  for (const m of got) {
    assert.ok(m.dir && m.abs === join(REPO_ROOT, m.dir), m.name);
    assert.ok(existsSync(join(m.abs, m.entry)), `${m.name}: entry ${m.entry} exists`);
  }
});

/* ------------------------------------------------------------------------- R2 */

test("R2: one recipe: ES module output, platform-neutral, the declared externals, cwd pinned, symlinks preserved", () => {
  const root = tmp("r2opt");
  try {
    const m = fixture(root);
    const o = optionsFor(m);
    assert.equal(o.format, "esm");
    assert.equal(o.platform, "neutral");
    assert.deepEqual(RECIPE, { format: "esm", platform: "neutral" });
    assert.equal(o.absWorkingDir, m.abs);
    assert.equal(o.preserveSymlinks, true);
    assert.equal(o.bundle, true);
    assert.deepEqual(o.external, [...DEFAULT_EXTERNAL]);
    assert.deepEqual(DEFAULT_EXTERNAL, ["cloudflare:workers", "node:*"]);
    const custom = fixture(root, "custom", { external: ["cloudflare:workers", "node:*", "fakedep"] });
    assert.deepEqual(optionsFor(custom).external, ["cloudflare:workers", "node:*", "fakedep"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R2: the built bytes are an ES module that bundles first-party and vendored code and keeps only the declared externals", async () => {
  const root = tmp("r2out");
  try {
    const m = fixture(root);
    const { bytes } = await buildMember(m);
    const text = bytes.toString("utf8");
    assert.match(text, /\bexport\s*\{/, "ES module output");
    assert.match(text, /from\s*"cloudflare:workers"/);
    assert.match(text, /from\s*"node:fs"/);
    assert.doesNotMatch(text, /from\s*"fakedep"/, "a dependency not declared external is bundled");
    assert.doesNotMatch(text, /from\s*"\.\/dep\.mjs"/, "first-party modules are bundled");
    assert.match(text, /\b40\b/);
    assert.doesNotMatch(text, /\brequire\(/, "platform-neutral ESM: no CommonJS shim");
    const custom = fixture(root, "custom", { external: ["cloudflare:workers", "node:*", "fakedep"] });
    assert.match((await buildMember(custom)).bytes.toString("utf8"), /from\s*"fakedep"/,
      "a declared external stays an import");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R2: the same source gives the same bytes from any working directory and any checkout layout", async () => {
  const a = tmp("r2a"), b = tmp("r2b"), shared = tmp("r2dep");
  const cwd = process.cwd();
  try {
    const ma = fixture(a);
    process.chdir(ma.abs);
    const fromMember = (await buildMember(ma)).bytes;
    process.chdir(tmpdir());
    const fromElsewhere = (await buildMember(ma)).bytes;
    process.chdir(REPO_ROOT);
    const fromRepo = (await buildMember(ma)).bytes;
    process.chdir(cwd);
    assert.ok(fromMember.equals(fromElsewhere) && fromMember.equals(fromRepo), "cwd does not reach the bytes");

    /* A second checkout, deeper, whose node_modules is a symlink into another tree. */
    const mb = fixture(join(b, "deeper", "checkout"));
    cpSync(join(mb.abs, "node_modules"), join(shared, "node_modules"), { recursive: true });
    rmSync(join(mb.abs, "node_modules"), { recursive: true });
    symlinkSync(join(shared, "node_modules"), join(mb.abs, "node_modules"), "dir");
    const linked = (await buildMember(mb)).bytes;
    assert.ok(linked.equals(fromMember), "a symlinked install gives the same bytes as a real one");
    assert.match(linked.toString("utf8"), /\/\/ node_modules\/fakedep\/index\.mjs/);
    assert.ok(!linked.toString("utf8").includes(shared) && !fromMember.toString("utf8").includes(a),
      "no absolute path reaches the bytes");
  } finally {
    process.chdir(cwd);
    for (const d of [a, b, shared]) rmSync(d, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------------- R3 */

test("R3: buildMember writes the artifact only when write is true", async () => {
  const root = tmp("r3");
  try {
    const m = fixture(root);
    const out = join(m.abs, m.bundle.outfile);
    const before = snapshot(m.abs);
    for (const opts of [undefined, {}, { write: false }]) {
      const built = await buildMember(m, opts);
      assert.ok(built.bytes.length > 0);
      assert.equal(existsSync(out), false, `no artifact for ${JSON.stringify(opts)}`);
    }
    assert.deepEqual(snapshot(m.abs), before, "nothing in the member changed");
    const built = await buildMember(m, { write: true });
    assert.ok(readFileSync(out).equals(built.bytes), "write:true writes exactly the built bytes");
    assert.equal(built.sha256, hex(built.bytes));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R4 */

test("R4: the manifest records the artifact's SHA-256, every first-party input's, the lockfile's, and the pinned working directory", async () => {
  const root = tmp("r4");
  try {
    const m = fixture(root);
    const built = await buildMember(m);
    const man = manifestFrom(m, built);
    assert.equal(man.member, m.name);
    assert.equal(man.artifact, m.bundle.outfile);
    assert.equal(man.sha256, hex(built.bytes));
    assert.equal(man.bytes, built.bytes.length);
    assert.equal(man.recipe.absWorkingDir, "<member directory>");
    assert.equal(man.recipe.format, "esm");
    assert.equal(man.recipe.platform, "neutral");
    assert.equal(man.recipe.entry, "src/index.mjs");
    assert.deepEqual(man.recipe.external, [...DEFAULT_EXTERNAL]);
    assert.deepEqual(man.inputs.map((i) => i.path).sort(), ["src/dep.mjs", "src/index.mjs"]);
    for (const i of man.inputs) {
      assert.equal(i.sha256, hex(readFileSync(join(m.abs, i.path))), i.path);
      assert.equal(i.bytes, readFileSync(join(m.abs, i.path)).length, i.path);
    }
    assert.deepEqual(man.vendoredInputs.map((i) => i.path), ["node_modules/fakedep/index.mjs"]);
    assert.equal(man.vendoredInputs[0].sha256, hex(readFileSync(join(m.abs, "node_modules/fakedep/index.mjs"))));
    assert.deepEqual(man.lock, { path: "package-lock.json", sha256: hex(readFileSync(join(m.abs, "package-lock.json"))) });
    assert.ok(!JSON.stringify(man).includes(root), "no absolute path in the manifest");

    const noLock = fixture(root, "nolock", { lock: false, vendored: false });
    assert.equal(manifestFrom(noLock, await buildMember(noLock)).lock, null, "no lockfile is recorded as none");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R5 */

test("R5: writeMember builds with writing on and writes the artifact and its manifest", async () => {
  const root = tmp("r5");
  try {
    const m = fixture(root);
    const { built, manifest } = await writeMember(m);
    const art = readFileSync(join(m.abs, m.bundle.outfile));
    assert.ok(art.equals(built.bytes));
    assert.ok(art.equals((await buildMember(m)).bytes), "the written artifact is what the recipe builds");
    const onDisk = JSON.parse(readFileSync(join(m.abs, m.bundle.manifest), "utf8"));
    assert.deepEqual(onDisk, manifest);
    assert.equal(onDisk.sha256, hex(art));
    assert.deepEqual(verifyStatic(m).findings, [], "what it writes verifies");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R6 */

test("R6: with no dependencies installed, a changed input or lockfile is reported stale, naming the input", async () => {
  const root = tmp("r6");
  try {
    const m = fixture(root);
    const { manifest } = await writeMember(m);
    rmSync(join(m.abs, "node_modules"), { recursive: true });            /* no dependencies installed */
    assert.deepEqual(verifyStatic(m).findings, [], "a fresh artifact verifies with nothing installed");

    for (const inp of manifest.inputs) {
      const p = join(m.abs, inp.path), before = readFileSync(p);
      writeFileSync(p, before + "\n/* one comment */\n");                 /* even a change the build would strip */
      const f = verifyStatic(m).findings;
      assert.ok(f.some((x) => x.includes("STALE") && x.includes(inp.path)), `${inp.path} changed: ${f}`);
      assert.ok(f.every((x) => x.startsWith(`${m.name}:`)), "each finding names the member");
      rmSync(p);
      assert.ok(verifyStatic(m).findings.some((x) => x.includes(inp.path)), `${inp.path} vanished`);
      writeFileSync(p, before);
      assert.deepEqual(verifyStatic(m).findings, [], `${inp.path} restored`);
    }

    const lock = join(m.abs, "package-lock.json"), lockBefore = readFileSync(lock);
    writeFileSync(lock, lockBefore + " ");
    assert.ok(verifyStatic(m).findings.some((x) => x.includes("STALE") && x.includes("package-lock.json")));
    rmSync(lock);
    assert.ok(verifyStatic(m).findings.some((x) => x.includes("package-lock.json")), "a lock removed");
    writeFileSync(lock, lockBefore);
    assert.deepEqual(verifyStatic(m).findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R6: a vendored input that is present and changed, a moved artifact, or a changed recipe is stale too", async () => {
  const root = tmp("r6b");
  try {
    const m = fixture(root);
    await writeMember(m);
    const dep = join(m.abs, "node_modules/fakedep/index.mjs");
    writeFileSync(dep, "export const V = 41;\n");
    assert.ok(verifyStatic(m).findings.some((x) => x.includes("node_modules/fakedep/index.mjs")));
    writeFileSync(dep, "export const V = 40;\n");

    const art = join(m.abs, m.bundle.outfile), artBefore = readFileSync(art);
    writeFileSync(art, artBefore + "\n");
    assert.ok(verifyStatic(m).findings.length > 0, "an artifact that is not the one its manifest describes");
    writeFileSync(art, artBefore);

    const moved = { ...m, bundle: { ...m.bundle, external: ["cloudflare:workers", "node:*", "other"] } };
    assert.ok(verifyStatic(moved).findings.some((x) => x.includes("recipe.external")));
    assert.deepEqual(verifyStatic(m).findings, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R7 */

test("R7: with dependencies installed, a fresh build must equal the committed bytes exactly", async () => {
  const root = tmp("r7");
  try {
    const m = fixture(root);
    await writeMember(m);
    const committed = readFileSync(join(m.abs, m.bundle.outfile));
    const ok = await verifyFresh(m, committed);
    assert.equal(ok.checked, true);
    assert.deepEqual(ok.findings, []);

    const flipped = Buffer.from(committed); flipped[flipped.length - 2] ^= 1;
    const bad = await verifyFresh(m, flipped);
    assert.equal(bad.checked, true);
    assert.ok(bad.findings.some((x) => x.includes("STALE")), "one byte different is stale");
    assert.equal((await verifyFresh(m, Buffer.concat([committed, Buffer.from("\n")]))).findings.length > 0, true);

    /* A dependency's bytes moved: only the fresh build can see it past the lockfile. */
    writeFileSync(join(m.abs, "node_modules/fakedep/index.mjs"), "export const V = 41;\n");
    assert.ok((await verifyFresh(m, committed)).findings.some((x) => x.includes("STALE")));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R7: where the dependencies are not installed it says it could not check, never that the artifact is fresh", async () => {
  const root = tmp("r7b");
  try {
    const m = fixture(root);
    const { manifest } = await writeMember(m);
    const committed = readFileSync(join(m.abs, m.bundle.outfile));
    rmSync(join(m.abs, "node_modules"), { recursive: true });
    const r = await verifyFresh(m, committed);
    assert.equal(r.checked, false);
    assert.equal(r.findings, null, "no empty list of findings that a caller could read as fresh");
    assert.match(r.reason, /not installed/);
    assert.match(r.reason, /node_modules\/fakedep\/index\.mjs/);
    assert.equal(freshBuildRunnable(m, manifest).runnable, false);
    /* A member with no dependencies is always checkable. */
    const bare = fixture(root, "bare", { vendored: false });
    await writeMember(bare);
    const rb = await verifyFresh(bare, readFileSync(join(bare.abs, bare.bundle.outfile)));
    assert.equal(rb.checked, true);
    assert.deepEqual(rb.findings, []);
    /* No manifest to name the dependencies, and they are absent: the build fails, and that is not fresh. */
    rmSync(join(m.abs, m.bundle.manifest));
    const rn = await verifyFresh(m, committed);
    assert.equal(rn.checked, false);
    assert.equal(rn.findings, null);
    assert.match(rn.reason, /fakedep/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R8 */

test("R8: every import specifier that is neither bundled nor an allowed external is listed, once, sorted", () => {
  const text = [
    "// src/index.mjs",
    'import { a } from "zeta";',
    'import b from "./local.mjs";',
    'import "bare-side-effect";',
    'export * from "re-exported";',
    'export { c } from "named-reexport";',
    "import {",
    "  d,",
    '} from "multi-line";',
    'import{e}from"minified";import{f}from"node:fs";',
    'import { env } from "cloudflare:workers";',
    'import { g } from "node:crypto";',
    'import { h } from \'single-quoted\';',
    'import { a2 } from "zeta";',
    "export default { x: 1 };",
  ].join("\n");
  assert.deepEqual(unresolvableSpecifiers(text),
    ["./local.mjs", "bare-side-effect", "minified", "multi-line", "named-reexport", "re-exported",
      "single-quoted", "zeta"]);
  assert.deepEqual(unresolvableSpecifiers(text, ["zeta", "minified", "multi-line", "./local.mjs",
    "bare-side-effect", "re-exported", "named-reexport", "single-quoted"]),
    ["cloudflare:workers", "node:crypto", "node:fs"], "the allowed list replaces the default, with * as a prefix");
  assert.deepEqual(unresolvableSpecifiers('import { v } from "cloudflare:workers";\nexport { v };\n'), []);
});

test("R8: a fully bundled artifact lists nothing, and one with an undeclared external lists it", async () => {
  const root = tmp("r8");
  try {
    const m = fixture(root);
    assert.deepEqual(unresolvableSpecifiers((await buildMember(m)).bytes.toString("utf8")), []);
    const ext = fixture(root, "ext", { external: ["cloudflare:workers", "node:*", "fakedep"] });
    const text = (await buildMember(ext)).bytes.toString("utf8");
    assert.deepEqual(unresolvableSpecifiers(text), ["fakedep"]);
    assert.deepEqual(unresolvableSpecifiers(text, ext.bundle.external), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------- R9 */

const git = (cwd, ...args) => {
  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};

test("R9: each file is stated committed and unchanged, changed, staged, or untracked, and reported", () => {
  const root = tmp("r9");
  try {
    git(root, "init", "-q");
    for (const f of ["same.txt", "edited.txt", "sub/deleted.txt", "ignored-edit.txt"]) {
      mkdirSync(join(root, "sub"), { recursive: true });
      writeFileSync(join(root, f), `${f}\n`);
    }
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", "c1");
    writeFileSync(join(root, "edited.txt"), "moved\n");
    rmSync(join(root, "sub/deleted.txt"));
    writeFileSync(join(root, "staged.txt"), "s\n");
    git(root, "add", "staged.txt");
    writeFileSync(join(root, "loose2.txt"), "x");
    writeFileSync(join(root, "ignored-edit.txt"), "staged change\n");
    git(root, "add", "ignored-edit.txt");
    writeFileSync(join(root, "loose.txt"), "u\n");

    const prov = readGitProvenance(root);
    const want = {
      "same.txt": ["in the commit", "unchanged"],
      "edited.txt": ["in the commit", "changed"],
      "sub/deleted.txt": ["in the commit", "changed"],
      "ignored-edit.txt": ["in the commit", "changed"],
      "staged.txt": ["staged, not yet committed", null],
      "loose.txt": ["UNTRACKED", null],
    };
    for (const [p, [state, content]] of Object.entries(want)) {
      assert.equal(stateOf(prov, p), state, p);
      assert.equal(contentStateOf(prov, p), content, p);
    }
    assert.equal(repoPath(root, join(root, "sub", "deleted.txt")), "sub/deleted.txt");

    const items = Object.keys(want).map((path) => ({ path, what: path, counted: "one" }));
    const c = classifyDiscovered(prov, items);
    assert.equal(c.verified, true);
    assert.equal(c.accounted, 6);
    assert.deepEqual(c.off.map((r) => r.path).sort(), ["loose.txt", "staged.txt"]);
    assert.deepEqual(c.changed.map((r) => r.path).sort(), ["edited.txt", "ignored-edit.txt", "sub/deleted.txt"]);
    assert.deepEqual(c.inCommit.sort(), ["edited.txt", "ignored-edit.txt", "same.txt", "sub/deleted.txt"]);
    for (const r of c.rows) assert.deepEqual([r.state, r.content], want[r.path], r.path);

    const lines = [];
    const rc = reportProvenance({ prov, items, instrument: "the probe", corpus: "6 files", log: (s) => lines.push(s) });
    const out = lines.join("\n");
    assert.deepEqual(rc.rows, c.rows);
    assert.match(out, /4 of 6 discovered item\(s\) are in the commit/);
    assert.match(out, /loose\.txt\s+\(UNTRACKED\)/);
    assert.match(out, /staged\.txt\s+\(staged, not yet committed\)/);
    for (const p of ["edited.txt", "ignored-edit.txt", "sub/deleted.txt"])
      assert.match(out, new RegExp(`${p.replace(".", "\\.")}\\s+\\(changed since the commit\\)`), p);
    assert.doesNotMatch(out, /same\.txt/, "an unchanged committed file needs no line");

    /* Committed and clean: one line, nothing named. */
    git(root, "add", "-A"); git(root, "commit", "-q", "-m", "c2");
    const clean = [];
    const cc = reportProvenance({ prov: readGitProvenance(root), items: [{ path: "same.txt", what: "w", counted: "c" }],
      instrument: "the probe", log: (s) => clean.push(s) });
    assert.equal(clean.length, 1);
    assert.deepEqual([cc.off, cc.changed], [[], []]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R9: where git cannot answer, every file is UNVERIFIED and the report says so, never clean", () => {
  const root = tmp("r9none");
  try {
    writeFileSync(join(root, "a.txt"), "a");
    const prov = readGitProvenance(root);
    assert.equal(prov.inHead, null);
    assert.equal(stateOf(prov, "a.txt"), "UNVERIFIED");
    assert.equal(contentStateOf(prov, "a.txt"), "UNVERIFIED");
    const lines = [];
    const c = reportProvenance({ prov, items: [{ path: "a.txt", what: "w", counted: "c" }], instrument: "x",
      log: (s) => lines.push(s) });
    assert.equal(c.verified, false);
    assert.match(lines.join("\n"), /UNVERIFIED over all 1/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------------------------------ R10 */

test("R10: no verifying call creates or changes a file, fresh or stale, installed or not", async () => {
  const root = tmp("r10");
  try {
    const m = fixture(root);
    const { manifest } = await writeMember(m);
    const committed = readFileSync(join(m.abs, m.bundle.outfile));
    const verifyAll = async () => {
      verifyStatic(m);
      freshBuildRunnable(m, manifest);
      await verifyFresh(m, committed);
      unresolvableSpecifiers(committed.toString("utf8"));
    };
    const states = [
      ["fresh", () => {}],
      ["a source changed", () => writeFileSync(join(m.abs, "src/dep.mjs"), "export const N = 2;\n")],
      ["the artifact removed", () => rmSync(join(m.abs, m.bundle.outfile))],
      ["the manifest removed", () => rmSync(join(m.abs, m.bundle.manifest))],
      ["the dependencies removed", () => rmSync(join(m.abs, "node_modules"), { recursive: true })],
    ];
    for (const [label, arrange] of states) {
      arrange();
      const before = snapshot(root);
      await verifyAll();
      assert.deepEqual(snapshot(root), before, `${label}: nothing written`);
    }
    /* A member whose dist directory does not exist yet: verifying does not create it. */
    const unbuilt = fixture(root, "unbuilt", { vendored: false });
    const before = snapshot(root);
    verifyStatic(unbuilt);
    await verifyFresh(unbuilt, Buffer.from(""));
    assert.deepEqual(snapshot(root), before);
    assert.equal(existsSync(join(unbuilt.abs, "dist")), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R10: verifying the repository's own fleet writes nothing", async () => {
  const m = discoverMembers().find((x) => x.name === "agent-worker");
  const before = snapshot(m.abs);
  const { manifest, committed } = verifyStatic(m);
  if (freshBuildRunnable(m, manifest).runnable) await verifyFresh(m, committed);
  assert.deepEqual(snapshot(m.abs), before);
});

/* ------------------------------------------------------------------------ R24 */

const DIGEST = "sha256:" + "0f".repeat(32);
const IMAGE = { repository: "docker.io/civicos/runner", digest: DIGEST, platform: "linux/amd64", port: 8080, schedulingPolicy: "default" };

/** A container member's marker under `root/dir`, with no Worker bundle unless `bundle` is given. */
function containerFixture(root, dir, { image = IMAGE, noImage = false, kind = "container", extra = {} } = {}) {
  mkdirSync(join(root, dir, "src"), { recursive: true });
  writeFileSync(join(root, dir, "src/entry.mjs"), "export const runner = 1;\n");
  writeFileSync(join(root, dir, "fleet-member.json"), JSON.stringify({ name: dir, kind, entry: "src/entry.mjs",
    ...(noImage ? {} : { image }), ...extra }));
}

test("R24: a marker with kind container and an image block is a container member, listed with its kind and its image; every other member is listed as a worker", () => {
  const root = tmp("r24");
  try {
    fixture(root, "w", { name: "w-worker", vendored: false });
    containerFixture(root, "runner");
    containerFixture(root, "no-image", { noImage: true });                   /* says container, states no image */
    containerFixture(root, "odd-image", { image: "docker.io/x@sha256:0" });       /* an image that is not a block */
    const got = discoverMembers(root);
    assert.deepEqual(got.map((m) => [m.name, m.kind, isContainer(m)]),
      [["no-image", "container", false], ["odd-image", "container", false], ["runner", "container", true], ["w-worker", "worker", false]]);
    const runner = got.find((m) => m.name === "runner");
    assert.deepEqual(runner.image, IMAGE, "listed with its image, as its marker states it");
    assert.equal(runner.entry, "src/entry.mjs");
    assert.equal(runner.bundle, null);
    assert.equal(got.find((m) => m.name === "w-worker").image, null, "a worker has no image");
    assert.equal(got.find((m) => m.name === "no-image").image, null);
    /* Not bundle-guarded for want of a Worker bundle; a container member that declares one, and every other member, is. */
    assert.deepEqual(got.map((m) => [m.name, isGuarded(m)]),
      [["no-image", true], ["odd-image", true], ["runner", false], ["w-worker", true]]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R24: verifyStatic and verifyFresh never report a container member with no Worker bundle stale, unguarded or missing an artifact, and say it is not guarded; one that states no image is still named unguarded", async () => {
  const root = tmp("r24v");
  try {
    containerFixture(root, "runner");
    containerFixture(root, "no-image", { noImage: true });
    const [noImage, runner] = discoverMembers(root);
    const before = snapshot(root);
    const s = verifyStatic(runner);
    assert.deepEqual(s, { findings: [], manifest: null, committed: null, guarded: false });
    const f = await verifyFresh(runner, null);
    assert.equal(f.checked, false, "nothing was checked, so it is never said to be fresh (R7)");
    assert.equal(f.guarded, false);
    assert.equal(f.findings, null);
    assert.match(f.reason, /^runner: not checked — a container member with no Worker bundle is not bundle-guarded/);
    assert.deepEqual(snapshot(root), before, "R10: nothing written");
    const named = verifyStatic(noImage).findings;
    assert.equal(named.length, 1);
    assert.match(named[0], /^no-image: declares no `bundle` block/, "a marker that is not a container member's is not exempt");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R24: a container member that declares a Worker bundle is guarded like any member: built, verified, and named stale when its source moves", async () => {
  const root = tmp("r24b");
  try {
    const m0 = fixture(root, "runner", { vendored: false });
    const marker = JSON.parse(readFileSync(join(m0.abs, "fleet-member.json"), "utf8"));
    writeFileSync(join(m0.abs, "fleet-member.json"), JSON.stringify({ ...marker, kind: "container", image: IMAGE }));
    const m = discoverMembers(root)[0];
    assert.equal(isContainer(m), true);
    assert.equal(isGuarded(m), true);
    await writeMember(m);
    assert.deepEqual(verifyStatic(m).findings, []);
    const fresh = await verifyFresh(m, readFileSync(join(m.abs, m.bundle.outfile)));
    assert.deepEqual([fresh.checked, fresh.findings], [true, []]);
    writeFileSync(join(m.abs, "src/dep.mjs"), "export const N = 9;\n");
    assert.ok(verifyStatic(m).findings.some((x) => x.includes("STALE") && x.includes("src/dep.mjs")));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R24: the repository's own fleet lists agent-runner as a container member with its image, and only a container member goes unguarded", () => {
  const got = discoverMembers();
  const runner = got.find((m) => m.name === "agent-runner");
  assert.ok(runner, "agent-runner is listed");
  assert.equal(runner.kind, "container");
  assert.equal(isContainer(runner), true);
  /* RE-POINTED 2026-10-08 (BUNDLER #12, T38): agent-runner's image moved from `ghcr.io` to Docker Hub at T37's close
     (K2258, K2259), as file-scanner's did (fleetbundles.test.mjs, K2176). */
  assert.equal(runner.image.repository, "docker.io/civicos/agent-runner");
  assert.deepEqual(got.filter((m) => !isGuarded(m)).map((m) => m.name).filter((n) => n !== "agent-runner"), [],
    "every other member is guarded");
  for (const m of got.filter((x) => !isContainer(x))) assert.equal(m.kind, "worker", m.name);
});

/* ------------------------------------------------------------- R25 (functions) */

test("R25: containerDescriptor writes the part from the marker — class_name, image as <repository>@sha256:<64 hex>, scheduling_policy default, max_instances, bind — and names every field it lacks", () => {
  const member = (marker, bundle = { entry: "src/index.mjs" }) => ({ name: "runner", bundle, marker });
  const full = { kind: "container", image: IMAGE, class_name: "AgentRunner", max_instances: 4,
    bind: [{ member: "agent-worker", binding: "RUNNER" }] };
  const names = ["agent-worker", "runner"];
  const d = containerDescriptor(member(full), names);
  const want = { class_name: "AgentRunner", image: `docker.io/civicos/runner@${DIGEST}`, scheduling_policy: "default",
    max_instances: 4, bind: [{ member: "agent-worker", binding: "RUNNER" }] };
  assert.deepEqual(d.descriptor, want);
  assert.deepEqual(Object.keys(d.descriptor), ["class_name", "image", "scheduling_policy", "max_instances", "bind"]);
  assert.equal(d.bytes.toString("utf8"), JSON.stringify(want, null, 2) + "\n");
  assert.equal(containerDescriptor(member({ ...full, image: { ...IMAGE, schedulingPolicy: undefined } }), names).descriptor.scheduling_policy,
    "default", "an unstated policy is default, the only one the part carries");

  const lacks = (marker, bundle) => containerDescriptor(member(marker, bundle), names).missing;
  assert.deepEqual(lacks(full, null), ["bundle"]);
  assert.deepEqual(lacks({ ...full, image: { ...IMAGE, digest: null } }), ["image.digest"]);
  for (const digest of ["sha256:" + "0f".repeat(31), "sha256:" + "0F".repeat(32), "0f".repeat(32), "sha512:" + "0f".repeat(32)])
    assert.deepEqual(lacks({ ...full, image: { ...IMAGE, digest } }), ["image.digest"], digest);
  for (const repository of [undefined, "", "runner", "docker.io/civicos/runner@sha256:x", "Docker.io/x/y"])
    assert.deepEqual(lacks({ ...full, image: { ...IMAGE, repository } }), ["image.repository"], String(repository));
  assert.deepEqual(lacks({ ...full, image: undefined }), ["image"]);
  assert.deepEqual(lacks({ ...full, image: { ...IMAGE, schedulingPolicy: "regional" } }), ["image.schedulingPolicy"]);
  for (const class_name of [undefined, "", "1Runner", "a-b"])
    assert.deepEqual(lacks({ ...full, class_name }), ["class_name"], String(class_name));
  for (const max_instances of [undefined, 0, -1, 1.5, "4"])
    assert.deepEqual(lacks({ ...full, max_instances }), ["max_instances"], String(max_instances));
  for (const bind of [undefined, [], [{ member: "no-such", binding: "RUNNER" }], [{ member: "agent-worker" }],
    [{ member: "agent-worker", binding: "bad-name" }], ["agent-worker"]])
    assert.deepEqual(lacks({ ...full, bind }), ["bind"], JSON.stringify(bind));
  assert.deepEqual(lacks({ kind: "container" }, null), ["bundle", "image", "class_name", "max_instances", "bind"],
    "every field it lacks, each named");
});

test("R25: imageReference names the image only by digest, in agent-runner R7's form, or names the field that does not say it", () => {
  assert.deepEqual(imageReference(IMAGE), { reference: `docker.io/civicos/runner@${DIGEST}` });
  assert.deepEqual(imageReference({ ...IMAGE, repository: "registry.example.test:5000/a/b" }),
    { reference: `registry.example.test:5000/a/b@${DIGEST}` });
  assert.deepEqual(imageReference(null), { missing: "image" });
  assert.deepEqual(imageReference({ ...IMAGE, digest: null }), { missing: "image.digest" });
  assert.deepEqual(imageReference({ ...IMAGE, repository: "runner" }), { missing: "image.repository" });
  /* The repository's own marker states no digest until the release publishes the image (T33-D1). */
  const runner = discoverMembers().find((m) => m.name === "agent-runner");
  const own = imageReference(runner.image);
  assert.ok(own.reference ? /@sha256:[0-9a-f]{64}$/.test(own.reference) : own.missing === "image.digest", JSON.stringify(own));
});

/* --------------------------------------------- R24, R25, R27: a member with two classes (T36-2) */

const BASE = "sha256:" + "1e".repeat(32), OTHER = "sha256:" + "2e".repeat(32);
const TWO = () => [
  { class_name: "FileScanner", max_instances: 4,
    image: { ...IMAGE, repository: "docker.io/civicos/file-scanner", base: { digest: BASE }, packages: "img/scan.json" } },
  { class_name: "SafeViewRenderer",
    image: { ...IMAGE, repository: "docker.io/civicos/safe-view", digest: "sha256:" + "3e".repeat(32), base: { digest: BASE } } },
];

test("R24: a container member stating its classes as a `containers` list, each with its own image, is a container member, listed with each class's name and image", () => {
  const root = tmp("r24multi");
  try {
    containerFixture(root, "scanner", { noImage: true, extra: { containers: TWO(), bind: [{ member: "x", binding: "B" }] } });
    containerFixture(root, "half", { noImage: true, extra: { containers: [TWO()[0], { class_name: "NoImage" }] } });
    const [half, scanner] = discoverMembers(root);
    assert.equal(isContainer(scanner), true);
    assert.equal(scanner.image, null, "no one top-level image");
    assert.deepEqual(scanner.containers, TWO().map((c) => ({ class_name: c.class_name, image: c.image })));
    assert.equal(isGuarded(scanner), false, "no Worker bundle: listed, not guarded, as any container member");
    assert.equal(isContainer(half), false, "a class with no image block is not a container member's list");
    assert.equal(markerIsContainer(scanner.marker), true);
    assert.equal(markerIsContainer(half.marker), false);
    assert.equal(markerIsContainer({ kind: "container", image: IMAGE }), true);
    assert.equal(markerIsContainer({ kind: "worker", image: IMAGE }), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("R25: a member with more than one class gets one Container part per class, container/<class>.json, each its own class_name and image, max_instances and bind from the class else the member; one class is container.json as before", () => {
  const names = ["agent-worker", "plane-x"];
  const member = (marker) => ({ name: "scanner", dir: "scanner", abs: "/nowhere", bundle: { entry: "src/index.mjs" }, marker });
  const top = { kind: "container", containers: TWO(), max_instances: 1, bind: [{ member: "plane-x", binding: "FILE_SCANNER" }] };
  const got = containerParts(member(top), names, { packages: false });
  assert.deepEqual(got.parts.map((p) => p.path), ["container/FileScanner.json", "container/SafeViewRenderer.json"]);
  assert.deepEqual(got.parts.map((p) => p.descriptor), [
    { class_name: "FileScanner", image: `docker.io/civicos/file-scanner@${DIGEST}`, scheduling_policy: "default", max_instances: 4,
      bind: [{ member: "plane-x", binding: "FILE_SCANNER" }] },
    { class_name: "SafeViewRenderer", image: `docker.io/civicos/safe-view@sha256:${"3e".repeat(32)}`, scheduling_policy: "default",
      max_instances: 1, bind: [{ member: "plane-x", binding: "FILE_SCANNER" }] },
  ], "each class its own image; max_instances from the class where stated, else the member's");
  for (const p of got.parts) assert.equal(p.bytes.toString("utf8"), JSON.stringify(p.descriptor, null, 2) + "\n");
  const perClassBind = TWO().map((c, i) => ({ ...c, bind: [{ member: "agent-worker", binding: i ? "RENDER" : "SCAN" }] }));
  assert.deepEqual(containerParts(member({ ...top, containers: perClassBind }), names, { packages: false }).parts.map((p) => p.descriptor.bind),
    [[{ member: "agent-worker", binding: "SCAN" }], [{ member: "agent-worker", binding: "RENDER" }]], "a class's own bind wins");

  /* One class, either form: the part is container.json, exactly what containerDescriptor writes. */
  const one = { kind: "container", image: IMAGE, class_name: "Runner", max_instances: 2, bind: [{ member: "agent-worker", binding: "R" }] };
  const single = containerParts(member(one), names, { packages: false });
  assert.deepEqual(single.parts.map((p) => [p.path, p.bytes.toString()]), [["container.json", containerDescriptor(member(one), names).bytes.toString()]]);
  const listOfOne = { kind: "container", containers: [{ class_name: "Runner", image: IMAGE }], max_instances: 2, bind: one.bind };
  assert.deepEqual(containerParts(member(listOfOne), names, { packages: false }).parts.map((p) => [p.path, p.bytes.toString()]),
    single.parts.map((p) => [p.path, p.bytes.toString()]), "a list of one is one class");
  assert.equal(containerClasses(member(listOfOne)).multi, false);
  assert.equal(containerClasses(member(top)).multi, true);
});

test("R25: a class lacking a field is refused naming the class and every field; a duplicated class, both forms at once, or no bundle are refused too", () => {
  const names = ["plane-x"];
  const member = (marker, bundle = { entry: "src/index.mjs" }) => ({ name: "scanner", dir: "scanner", abs: "/nowhere", bundle, marker });
  const base = { kind: "container", max_instances: 1, bind: [{ member: "plane-x", binding: "FILE_SCANNER" }] };
  const lacks = (containers, extra = {}) => containerParts(member({ ...base, containers, ...extra }), names, { packages: false });
  const [a, b] = TWO();
  assert.deepEqual(lacks([a, { ...b, image: { ...b.image, digest: null } }]), { missing: ["image.digest"], class: "SafeViewRenderer" });
  assert.deepEqual(lacks([{ ...a, max_instances: 0 }, b]), { missing: ["max_instances"], class: "FileScanner" });
  assert.deepEqual(lacks([a, b], { bind: undefined }), { missing: ["bind"], class: "FileScanner" }, "no bind on the class or the member");
  assert.deepEqual(lacks([a, { ...b, class_name: "bad-name", image: { ...b.image, schedulingPolicy: "regional" } }]),
    { missing: ["image.schedulingPolicy", "class_name"], class: "bad-name" }, "every field it lacks");
  assert.deepEqual(lacks([a, { ...b, class_name: undefined }]), { missing: ["class_name"], class: "(unnamed)" });
  assert.deepEqual(lacks([a, { ...b, class_name: "FileScanner" }]), { missing: ["class_name"], class: "FileScanner" }, "two classes, one name");
  assert.match(lacks([a, b], { image: IMAGE }).missing[0], /^image \(a top-level image beside a `containers` list\)$/);
  assert.deepEqual(containerParts(member({ ...base, containers: TWO() }, null), names), { missing: ["bundle"] });
});

test("R27: a class naming a package statement reads its packages from it, sorted, under the ecosystem it names, only when its base digest is the marker's; otherwise unread naming the file, the package or the digest", () => {
  const root = tmp("r27st");
  try {
    const dir = join(root, "scanner");
    mkdirSync(join(dir, "img"), { recursive: true });
    const st = { ecosystem: "Debian:12", base: { repository: "docker.io/library/debian", digest: BASE },
      packages: [{ name: "clamav", version: "1.4.3" }, { name: "bzip2", version: "1.0.8" }, { name: "clamav", version: "1.0.0" }] };
    const file = join(dir, "img/scan.json");
    const write = (o) => writeFileSync(file, typeof o === "string" ? o : JSON.stringify(o));
    write(st);
    const sorted = [{ name: "bzip2", version: "1.0.8" }, { name: "clamav", version: "1.0.0" }, { name: "clamav", version: "1.4.3" }];
    assert.deepEqual(statementPackages(file, "scanner/img/scan.json", BASE), { ecosystem: "Debian:12", packages: sorted });
    const m = { name: "scanner", dir: "scanner", abs: dir, bundle: { entry: "src/index.mjs" },
      marker: { kind: "container", containers: TWO(), max_instances: 1, bind: [{ member: "plane-x", binding: "F" }] } };
    const [scan, render] = containerClasses(m).classes;
    assert.deepEqual(classPackages(m, scan), { ecosystem: "Debian:12", packages: sorted });
    assert.deepEqual(classPackages(m, render), { unread: "scanner/package-lock.json is missing" },
      "a class naming no statement installs from npm: the member's lockfile");
    writeFileSync(join(dir, "package-lock.json"), JSON.stringify({ lockfileVersion: 3, packages: { "": {}, "node_modules/x": { version: "1.0.0" } } }));
    assert.deepEqual(classPackages(m, render), { ecosystem: "npm", packages: [{ name: "x", version: "1.0.0" }] });
    const parts = containerParts(m, ["plane-x"]);
    assert.deepEqual(parts.parts.map((p) => p.descriptor.packages), [sorted, [{ name: "x", version: "1.0.0" }]], "each part its own image's list, last");

    const unread = () => statementPackages(file, "scanner/img/scan.json", BASE).unread;
    const cases = [
      ["scanner/img/scan.json is missing", () => rmSync(file)],
      ["scanner/img/scan.json does not parse", () => write("{ torn")],
      ["scanner/img/scan.json does not parse: it names no ecosystem", () => write({ ...st, ecosystem: undefined })],
      ["scanner/img/scan.json does not parse: it has no `packages` list", () => write({ ...st, packages: undefined })],
      ["scanner/img/scan.json names no base image digest", () => write({ ...st, base: { repository: "debian" } })],
      [`scanner/img/scan.json was taken against the base ${OTHER}, not the base the marker pins (${BASE})`, () => write({ ...st, base: { digest: OTHER } })],
      ["scanner/img/scan.json names the package bzip2 without a version", () => write({ ...st, packages: [{ name: "bzip2" }] })],
      ["scanner/img/scan.json names a package with no name", () => write({ ...st, packages: [{ version: "1" }] })],
    ];
    for (const [named, arrange] of cases) {
      arrange();
      const u = unread();
      assert.ok(typeof u === "string" && u.startsWith(named), `${named}: ${u}`);
      write(st);
    }
    assert.match(statementPackages(file, "scanner/img/scan.json", null).unread, /not the base the marker pins \(none\)/, "a marker pinning no base");
    const away = { ...scan, image: { ...scan.image, packages: "../elsewhere.json" } };
    assert.match(classPackages(m, away).unread, /names no package statement for FileScanner as a member-relative path/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/* ------------------------------------------------- R25 (functions): a member's Worker part (N772, K2155) */

test("R25: workerPart writes {r2_buckets, crons} from a member's config, each bucket by its role and the crons as stated; none for a member with neither; every binding with no role, and every list that is not one, named", () => {
  assert.equal(WORKER_PART_PATH, "worker.json");
  assert.deepEqual(BUCKET_ROLES, { "bio-captures": "captures", "bio-published": "published" }, "the plane's two buckets, the only roles");
  const cfg = { name: "m", r2_buckets: [{ binding: "PUBLISHED", bucket_name: "bio-published" }, { binding: "CAPTURES", bucket_name: "bio-captures" }],
    triggers: { crons: ["17 4 * * *"] }, services: [{ binding: "PLANE", service: "bio-plane" }] };
  const w = workerPart(cfg);
  const want = { r2_buckets: [{ binding: "PUBLISHED", bucket: "published" }, { binding: "CAPTURES", bucket: "captures" }], crons: ["17 4 * * *"] };
  assert.deepEqual(w.part.descriptor, want, "the config's order, the role for the bucket name");
  assert.equal(w.part.bytes.toString("utf8"), JSON.stringify(want, null, 2) + "\n");
  assert.deepEqual(workerPart({ r2_buckets: [{ binding: "CAPTURES", bucket_name: "bio-captures" }] }).part.descriptor,
    { r2_buckets: [{ binding: "CAPTURES", bucket: "captures" }], crons: [] });
  assert.deepEqual(workerPart({ triggers: { crons: ["0 0 * * *"] } }).part.descriptor, { r2_buckets: [], crons: ["0 0 * * *"] });
  for (const none of [{}, { r2_buckets: [], triggers: { crons: [] } }, { triggers: {} }, null, undefined])
    assert.deepEqual(workerPart(none), { part: null }, JSON.stringify(none));

  const lacks = (c) => workerPart(c).missing;
  assert.deepEqual(lacks({ r2_buckets: [{ binding: "ARCHIVE", bucket_name: "archive" }, { binding: "CAPTURES", bucket_name: "bio-captures" },
    { binding: "X" }, { bucket_name: "bio-published" }, "CAPTURES"] }),
    ["ARCHIVE", "X", "(an R2 bucket binding with no name)", "(an R2 bucket binding with no name)"], "each binding with no role, by name");
  assert.deepEqual(lacks({ r2_buckets: [{ binding: "C", bucket_name: "constructor" }] }), ["C"], "only the two roles, never an inherited key");
  assert.deepEqual(lacks({ r2_buckets: {} }), ["r2_buckets"]);
  for (const triggers of [{ crons: "17 4 * * *" }, { crons: [1] }, { crons: [" "] }, ["17 4 * * *"], "x"])
    assert.deepEqual(lacks({ triggers }), ["triggers.crons"], JSON.stringify(triggers));
  assert.deepEqual(lacks({ r2_buckets: [{ binding: "A", bucket_name: "a" }], triggers: { crons: [null] } }), ["A", "triggers.crons"], "both named");
});

test("R25: the repository's own members with buckets or crons carry a Worker part, every bucket with a role; file-scanner's names CAPTURES and its daily schedule", () => {
  const got = Object.fromEntries(discoverMembers().map((m) => {
    let cfg = null;
    try { cfg = parseJsonc(readFileSync(join(m.abs, "wrangler.jsonc"), "utf8")); } catch { /* a member with no config */ }
    return [m.name, cfg];
  }).filter(([, c]) => c));
  for (const [name, cfg] of Object.entries(got)) assert.equal(workerPart(cfg).missing, undefined, `${name}: every bucket has a role`);
  const scanner = workerPart(got["file-scanner"]).part.descriptor;
  assert.deepEqual(scanner.r2_buckets, [{ binding: "CAPTURES", bucket: "captures" }]);
  assert.ok(scanner.crons.length >= 1, "its schedule is stated");
});
