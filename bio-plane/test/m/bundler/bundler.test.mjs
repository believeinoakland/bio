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
} from "../../../scripts/fleet-bundle.mjs";
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
