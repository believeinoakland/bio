/* test-support: requirement-named tests at the module's interface
 * (build/requirements/test-support.md). Each test names the requirement id it
 * checks in its title.
 *
 * The module's services are side effects on a whole process, so nearly every
 * test runs a child node process that imports the module with $TMPDIR pointed
 * at a fresh "host" directory, reports what it saw as JSON on a line of its
 * own, and exits by the path under test. The parent then inspects the host
 * directory, which nothing but the child touches. The host directories live
 * inside this process's own sandbox (the import below), so a failing test
 * leaks nothing. */
import { SANDBOX as OWN_SANDBOX } from "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, openSync, closeSync, readdirSync, readFileSync, statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative } from "node:path";

const SANDBOX_URL = new URL("../../sandbox.mjs", import.meta.url).href;
const STDIO_URL = new URL("../../stdio.mjs", import.meta.url).href;
const MARK = "@@RESULT@@";

/** A fresh, empty host directory for one child to use as its $TMPDIR. */
const host = () => mkdtempSync(join(tmpdir(), "host-"));

/** Runs `body` (module code) in a child with $TMPDIR = `hostDir`. `body` may
 *  call `report(obj)` to send one JSON result line on stdout. */
function child(body, { hostDir, stdio, env = {}, cwd } = {}) {
  const code = `const report = (o) => process.stdout.write(${JSON.stringify(MARK)} + JSON.stringify(o) + "\\n");\n${body}`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    env: { ...process.env, TMPDIR: hostDir, ...env }, encoding: "utf8", stdio, cwd,
    maxBuffer: 64 * 1024 * 1024, timeout: 60_000,
  });
  const line = (r.stdout ?? "").split("\n").find((l) => l.startsWith(MARK));
  return { ...r, result: line ? JSON.parse(line.slice(MARK.length)) : undefined };
}

/** Every path under `dir`, relative, with each file's content: a full snapshot. */
function snapshot(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      const k = relative(dir, p);
      if (e.isDirectory()) { out[k] = "<dir>"; walk(p); } else out[k] = readFileSync(p, "utf8");
    }
  };
  walk(dir);
  return out;
}

/** Builds a tree of files and nested directories inside the child's sandbox. */
const FILL = `
  const { mkdirSync, writeFileSync, mkdtempSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const fill = (root) => {
    for (let i = 0; i < 4; i++) {
      const d = join(root, "d" + i, "e", "f");
      mkdirSync(d, { recursive: true });
      for (let j = 0; j < 8; j++) writeFileSync(join(d, "x" + j), "y".repeat(j * 100));
      writeFileSync(join(root, "d" + i, "top"), "t");
    }
  };
  fill(SANDBOX);
  fill(mkdtempSync(join(tmpdir(), "own-")));
`;

/* The ways a process can end that run exit handlers (R2), each as the code
   that ends the child after the sandbox has been filled. */
const ENDINGS = {
  "a normal end": ``,
  "process.exit()": `process.exit();`,
  "process.exit(0)": `process.exit(0);`,
  "process.exit(7)": `process.exit(7);`,
  "process.exitCode then a normal end": `process.exitCode = 5;`,
  "an uncaught error": `throw new Error("boom");`,
  "an uncaught error in a later tick": `setTimeout(() => { throw new Error("late"); }, 5);`,
  "an unhandled rejection": `Promise.reject(new Error("rejected"));`,
  "process.exit() from a timer": `setTimeout(() => process.exit(0), 5);`,
};

/* ------------------------------------------------------------------ R1 */

test("R1 importing creates one directory under the host temp directory, named with the pid, and $TMPDIR and os.tmpdir() point inside it for the rest of the process", () => {
  const H = host();
  const r = child(`
    const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
    const { tmpdir } = await import("node:os");
    const { readdirSync, statSync, mkdtempSync } = await import("node:fs");
    const at = () => ({ env: process.env.TMPDIR, os: tmpdir() });
    const first = at();
    const entries = readdirSync(${JSON.stringify(H)});
    const isDir = statSync(SANDBOX).isDirectory();
    const made = mkdtempSync(tmpdir() + "/probe-");
    await new Promise((res) => setTimeout(res, 20));
    await new Promise((res) => setImmediate(res));
    const later = at();
    report({ SANDBOX, pid: process.pid, first, later, entries, isDir, made });
  `, { hostDir: H });
  assert.equal(r.status, 0, r.stderr);
  const { SANDBOX, pid, first, later, entries, isDir, made } = r.result;
  assert.equal(dirname(SANDBOX), H, "created directly under the host temp directory");
  assert.equal(entries.length, 1, `exactly one directory created, saw ${entries}`);
  assert.equal(entries[0], basename(SANDBOX));
  assert.ok(isDir);
  assert.ok(basename(SANDBOX).includes(String(pid)), "named with the process id");
  assert.match(basename(SANDBOX), new RegExp(`(^|\\D)${pid}(\\D|$)`), "the pid appears as a whole number");
  for (const p of [first.env, first.os, later.env, later.os]) {
    const rel = relative(SANDBOX, p);
    assert.ok(!rel.startsWith("..") && !isAbsolute(rel), `${p} is inside ${SANDBOX}`);
  }
  assert.deepEqual(later, first, "still pointing there later in the process");
  assert.ok(!relative(SANDBOX, made).startsWith(".."), "a temp file made through os.tmpdir() lands inside");
  assert.deepEqual(readdirSync(H), [], "and it is gone after exit");
});

test("R1 a process started with a nested $TMPDIR nests its directory there rather than escaping to the system temp", () => {
  const H = host();
  const nested = join(H, "outer", "inner");
  mkdirSync(nested, { recursive: true });
  const r = child(`
    const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
    report({ SANDBOX });
  `, { hostDir: nested });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(dirname(r.result.SANDBOX), nested);
});

/* ------------------------------------------------------------------ R2 */

for (const [name, ending] of Object.entries(ENDINGS)) {
  test(`R2 the directory and everything in it are removed when the process ends by ${name}`, () => {
    const H = host();
    const r = child(`
      const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
      ${FILL}
      report({ SANDBOX });
      ${ending}
    `, { hostDir: H });
    assert.ok(r.result, `child reported (status ${r.status}): ${r.stderr}`);
    assert.equal(existsSync(r.result.SANDBOX), false, "the sandbox is gone");
    assert.deepEqual(readdirSync(H), [], "nothing is left under the host temp directory");
    assert.equal(r.signal, null);
  });
}

test("R2 the removal completes before the process ends even while an unawaited asynchronous removal races it (the miniflare dispose() shape), over 40 endings", () => {
  for (let i = 0; i < 40; i++) {
    const H = host();
    const r = child(`
      const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
      const { mkdirSync, writeFileSync, promises } = await import("node:fs");
      const { join } = await import("node:path");
      const trees = [];
      for (let t = 0; t < 2; t++) {
        const root = join(SANDBOX, "miniflare-" + t);
        for (let a = 0; a < 6; a++) {
          const d = join(root, "a" + a, "b", "c");
          mkdirSync(d, { recursive: true });
          for (let f = 0; f < 20; f++) writeFileSync(join(d, "f" + f), "z");
        }
        trees.push(root);
      }
      report({ SANDBOX });
      for (const t of trees) promises.rm(t, { recursive: true, force: true }).catch(() => {});
      process.exit(0);
    `, { hostDir: H });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(readdirSync(H), [], `ending ${i}: left ${readdirSync(H)}`);
  }
});

test("R2 the removal is synchronous: an exit listener registered after the import sees the directory gone once exit handlers ran, and the parent sees it gone the moment the child is reaped", async () => {
  const H = host();
  /* The parent does not wait for any flush: it inspects the host directory in
     the 'exit' event, the first moment it knows the child has ended. */
  const out = await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ["--input-type=module", "-e", `
      const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
      const { writeFileSync, mkdirSync } = await import("node:fs");
      mkdirSync(SANDBOX + "/x/y", { recursive: true });
      writeFileSync(SANDBOX + "/x/y/z", "q");
      process.exit(0);
    `], { env: { ...process.env, TMPDIR: H }, stdio: "ignore" });
    p.on("error", reject);
    p.on("exit", (code) => resolve({ code, left: readdirSync(H) }));
  });
  assert.equal(out.code, 0);
  assert.deepEqual(out.left, []);
});

/* ------------------------------------------------------------------ R3 */

test("R3 importing more than once in one process (static, dynamic, via stdio first, and through another module) creates one directory, removes it once, and never throws", () => {
  const H = host();
  const via = join(H, "..", `via-${basename(H)}.mjs`);
  writeFileSync(via, `export { SANDBOX } from ${JSON.stringify(SANDBOX_URL)};\n`);
  const r = child(`
    await import(${JSON.stringify(STDIO_URL)});
    const a = await import(${JSON.stringify(SANDBOX_URL)});
    const b = await import(${JSON.stringify(SANDBOX_URL)});
    const c = await import(${JSON.stringify(new URL(`file://${via}`).href)});
    const d = await import(${JSON.stringify(SANDBOX_URL.replace("/test/sandbox.mjs", "/test/m/../sandbox.mjs"))});
    const { readdirSync } = await import("node:fs");
    report({ all: [a.SANDBOX, b.SANDBOX, c.SANDBOX, d.SANDBOX], entries: readdirSync(${JSON.stringify(H)}) });
    process.exit(0);
  `, { hostDir: H });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stderr, "", "nothing thrown or warned");
  assert.equal(new Set(r.result.all).size, 1, "every import sees the same directory");
  assert.equal(r.result.entries.length, 1, "one directory created");
  assert.deepEqual(readdirSync(H), [], "and removed");
});

/* ------------------------------------------------------------------ R4 */

test("R4 SANDBOX is the absolute path of the directory R1 created", () => {
  const H = host();
  const r = child(`
    const { SANDBOX } = await import(${JSON.stringify(SANDBOX_URL)});
    const { readdirSync, statSync, realpathSync } = await import("node:fs");
    report({ SANDBOX, type: typeof SANDBOX, entries: readdirSync(${JSON.stringify(H)}), isDir: statSync(SANDBOX).isDirectory(), real: realpathSync(SANDBOX) });
  `, { hostDir: H });
  assert.equal(r.status, 0, r.stderr);
  const { SANDBOX, type, entries, isDir } = r.result;
  assert.equal(type, "string");
  assert.ok(isAbsolute(SANDBOX));
  assert.ok(isDir);
  assert.deepEqual(entries, [basename(SANDBOX)], "it names the one directory created");
  assert.equal(join(H, entries[0]), SANDBOX);
  /* In this very process too. */
  assert.ok(isAbsolute(OWN_SANDBOX) && statSync(OWN_SANDBOX).isDirectory());
  assert.equal(relative(OWN_SANDBOX, tmpdir()).startsWith(".."), false);
});

/* ------------------------------------------------------------------ R5 */

test("R5 sweepSandbox() removes the directory at once, never throws when repeated, and a later exit by every path does not fail because it is gone", () => {
  for (const [name, ending] of Object.entries(ENDINGS)) {
    const H = host();
    const r = child(`
      const { SANDBOX, sweepSandbox } = await import(${JSON.stringify(SANDBOX_URL)});
      const { existsSync, readdirSync } = await import("node:fs");
      ${FILL}
      const ret = sweepSandbox();
      const goneAtOnce = !existsSync(SANDBOX);
      const left = readdirSync(${JSON.stringify(H)});
      let threw = null;
      try { sweepSandbox(); sweepSandbox(); } catch (e) { threw = String(e); }
      report({ ret: ret === undefined ? "undefined" : ret, goneAtOnce, left, threw });
      ${ending}
    `, { hostDir: H });
    assert.ok(r.result, `${name}: child reported: ${r.stderr}`);
    assert.equal(r.result.ret, "undefined", `${name}: returns nothing`);
    assert.equal(r.result.goneAtOnce, true, `${name}: gone at once`);
    assert.deepEqual(r.result.left, [], `${name}: nothing left in the host directory at once`);
    assert.equal(r.result.threw, null, `${name}: a repeat never throws`);
    const expected = { "process.exit(7)": 7, "process.exitCode then a normal end": 5 }[name]
      ?? (/uncaught|unhandled/.test(name) ? 1 : 0);
    assert.equal(r.status, expected, `${name}: the exit status is the ending's own, not a failure of the sweep: ${r.stderr}`);
    assert.doesNotMatch(r.stderr, /ENOENT|sweep/i, `${name}: the later exit reports no error about the sweep`);
    assert.deepEqual(readdirSync(H), []);
  }
});

test("R5 sweepSandbox() never throws when the directory was already removed from outside, or replaced by a file", () => {
  for (const tamper of [
    `rmSync(SANDBOX, { recursive: true, force: true });`,
    `rmSync(SANDBOX, { recursive: true, force: true }); writeFileSync(SANDBOX, "not a dir");`,
  ]) {
    const H = host();
    const r = child(`
      const { SANDBOX, sweepSandbox } = await import(${JSON.stringify(SANDBOX_URL)});
      const { rmSync, writeFileSync, existsSync } = await import("node:fs");
      ${tamper}
      let threw = null;
      try { sweepSandbox(); } catch (e) { threw = String(e); }
      report({ threw, gone: !existsSync(SANDBOX) });
      process.exit(0);
    `, { hostDir: H });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.result.threw, null);
    assert.equal(r.result.gone, true);
    assert.deepEqual(readdirSync(H), []);
  }
});

/* ------------------------------------------------------------------ R6 */

/** A child that imports `url`, floods stdout and stderr with `total` bytes each
 *  in `chunk`-byte writes, prints a tally last, and calls process.exit(0). */
const FLOOD = (url, total, chunk) => `
  const m = await import(${JSON.stringify(url)});
  const s = (await import(${JSON.stringify(STDIO_URL)})).synchronousStdio();
  const line = "x".repeat(${chunk} - 1) + "\\n";
  for (let n = 0; n < ${total}; n += ${chunk}) { process.stdout.write(line); process.stderr.write(line); }
  process.stdout.write("TALLY " + JSON.stringify(s) + "\\n");
  process.stderr.write("TALLY-ERR\\n");
  process.exit(0);
`;

test("R6 synchronousStdio() makes stdout and stderr synchronous through a pipe: every byte written before process.exit() reaches the reader, the last line included, and streams names both", async () => {
  for (const [total, chunk] of [[2_000_000, 1024], [2_000_000, 65_580], [4_000_000, 4096]]) {
    const H = host();
    const got = await new Promise((resolve, reject) => {
      const p = spawn(process.execPath, ["--input-type=module", "-e", FLOOD(STDIO_URL, total, chunk)],
        { env: { ...process.env, TMPDIR: H }, stdio: ["ignore", "pipe", "pipe"] });
      const out = [], err = [];
      /* A slow reader: pause between chunks so the child's writes outrun it. */
      p.stdout.on("data", (b) => { out.push(b); p.stdout.pause(); setTimeout(() => p.stdout.resume(), 1); });
      p.stderr.on("data", (b) => err.push(b));
      p.on("error", reject);
      p.on("close", (code) => resolve({ code, out: Buffer.concat(out).toString(), err: Buffer.concat(err).toString() }));
    });
    assert.equal(got.code, 0);
    const n = Math.ceil(total / chunk) * chunk;
    const lines = got.out.split("\n");
    const tally = lines.at(-2);
    assert.ok(tally.startsWith("TALLY "), `the final line arrived (${total}/${chunk})`);
    assert.equal(got.out.length, n + tally.length + 1, "every byte arrived");
    const s = JSON.parse(tally.slice(6));
    assert.deepEqual(s, { streams: ["stdout", "stderr"], already: true }, "the import applied it to both pipes");
    assert.ok(got.err.endsWith("TALLY-ERR\n"), "stderr's last line arrived");
    assert.equal(got.err.length, n + "TALLY-ERR\n".length);
  }
});

/* ------------------------------------------------------------------ R7 */

test("R7 a second call changes nothing and returns already:true with the same streams; repeated calls never throw", () => {
  const H = host();
  const r = child(`
    const { synchronousStdio } = await import(${JSON.stringify(STDIO_URL)});
    const calls = [];
    for (let i = 0; i < 5; i++) calls.push(synchronousStdio());
    calls[0].streams.push("mutated");
    const after = synchronousStdio();
    report({ calls: calls.slice(1), after });
  `, { hostDir: H, stdio: ["ignore", "pipe", "pipe"] });
  assert.equal(r.status, 0, r.stderr);
  for (const c of r.result.calls) assert.deepEqual(c, { streams: ["stdout", "stderr"], already: true });
  assert.deepEqual(r.result.after, { streams: ["stdout", "stderr"], already: true }, "a caller mutating a result changes nothing");
});

test("R7 a stream that is a file, or absent, is left as it is and is no error; streams names only the streams changed", () => {
  const H = host();
  const cases = [
    { name: "stdout to a file, stderr a pipe", stdio: (f) => ["ignore", f, "pipe"], want: ["stderr"] },
    { name: "stderr to a file, stdout a pipe", stdio: (f) => ["ignore", "pipe", f], want: ["stdout"] },
    { name: "both to a file", stdio: (f) => ["ignore", f, f], want: [] },
    { name: "both ignored", stdio: () => ["ignore", "ignore", "ignore"], want: null },
  ];
  for (const c of cases) {
    const file = join(H, `out-${cases.indexOf(c)}.txt`);
    const resultFile = join(H, `result-${cases.indexOf(c)}.json`);
    const fd = openSync(file, "w");
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", `
      const { synchronousStdio } = await import(${JSON.stringify(STDIO_URL)});
      const { writeFileSync } = await import("node:fs");
      let threw = null, a, b;
      try { a = synchronousStdio(); b = synchronousStdio(); } catch (e) { threw = String(e); }
      process.stdout.write("to stdout\\n"); process.stderr.write("to stderr\\n");
      writeFileSync(${JSON.stringify(resultFile)}, JSON.stringify({ threw, a, b }));
      process.exit(0);
    `], { env: { ...process.env, TMPDIR: H }, stdio: c.stdio(fd), encoding: "utf8" });
    closeSync(fd);
    assert.equal(r.status, 0, `${c.name}: ${r.stderr}`);
    const got = JSON.parse(readFileSync(resultFile, "utf8"));
    assert.equal(got.threw, null, c.name);
    assert.deepEqual(got.a, got.b, `${c.name}: the second call returns the same`);
    assert.equal(got.b.already, true);
    if (c.want) assert.deepEqual(got.b.streams, c.want, c.name);
    else assert.ok(got.b.streams.every((s) => s === "stdout" || s === "stderr"), c.name);
    const text = readFileSync(file, "utf8");
    if (c.want && !c.want.includes("stdout")) assert.match(text, /to stdout/, `${c.name}: the file stream still works`);
    if (c.want && !c.want.includes("stderr")) assert.match(text, /to stderr/, `${c.name}: the file stream still works`);
  }
});

/* ------------------------------------------------------------------ R8 */

test("R8 importing the sandbox module also applies R6: through a pipe, a flood written before process.exit() arrives whole with its tally", async () => {
  const H = host();
  const body = `
    await import(${JSON.stringify(SANDBOX_URL)});
    const s = (await import(${JSON.stringify(STDIO_URL)})).synchronousStdio();
    const line = "y".repeat(1023) + "\\n";
    for (let n = 0; n < 2_000_000; n += 1024) process.stdout.write(line);
    process.stdout.write("TALLY " + JSON.stringify(s) + "\\n");
    process.exit(0);
  `;
  const got = await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ["--input-type=module", "-e", body],
      { env: { ...process.env, TMPDIR: H }, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    p.stdout.on("data", (b) => { out.push(b); p.stdout.pause(); setTimeout(() => p.stdout.resume(), 1); });
    p.stderr.resume();
    p.on("error", reject);
    p.on("close", (code) => resolve({ code, out: Buffer.concat(out).toString() }));
  });
  assert.equal(got.code, 0);
  const tally = got.out.split("\n").at(-2);
  assert.ok(tally.startsWith("TALLY "));
  assert.deepEqual(JSON.parse(tally.slice(6)), { streams: ["stdout", "stderr"], already: true },
    "the sandbox import had already applied it to both streams");
  assert.equal(got.out.length, Math.ceil(2_000_000 / 1024) * 1024 + tally.length + 1, "every byte arrived");
});

/* ------------------------------------------------------------------ R9 */

test("R9 nothing outside the sandbox directory is created or removed, by the import, a sweep, or any ending", () => {
  const endings = { ...ENDINGS, "sweepSandbox() then process.exit(0)": `sweepSandbox(); process.exit(0);` };
  for (const [name, ending] of Object.entries(endings)) {
    /* The host holds neighbours an over-eager removal would take: another
       process's sandbox (a live pid's and a dead one's), lookalike names, and
       ordinary files. Its parent holds more. */
    const P = host();
    const H = join(P, "tmp");
    mkdirSync(H);
    writeFileSync(join(P, "beside-host"), "p");
    mkdirSync(join(H, `bio-battery-${process.pid}-OTHER`, "inner"), { recursive: true });
    writeFileSync(join(H, `bio-battery-${process.pid}-OTHER`, "inner", "f"), "live");
    mkdirSync(join(H, "bio-battery-999999999-DEAD"));
    mkdirSync(join(H, "bio-battery-1-x-swept"));
    writeFileSync(join(H, "plain"), "q");
    mkdirSync(join(H, "miniflare-abc"));
    const before = snapshot(P);
    const cwd = mkdtempSync(join(tmpdir(), "cwd-"));
    const r = child(`
      const { SANDBOX, sweepSandbox } = await import(${JSON.stringify(SANDBOX_URL)});
      const { readdirSync } = await import("node:fs");
      ${FILL}
      report({ SANDBOX, during: readdirSync(${JSON.stringify(H)}).sort(), cwd: readdirSync(".") });
      ${ending}
    `, { hostDir: H, cwd });
    assert.ok(r.result, `${name}: ${r.stderr}`);
    const s = basename(r.result.SANDBOX);
    assert.deepEqual(r.result.during.filter((e) => e !== s), Object.keys(before)
      .filter((k) => k.startsWith("tmp/") && k.split("/").length === 2).map((k) => k.slice(4)).sort(),
      `${name}: during the process only the sandbox was added to the host`);
    assert.deepEqual(snapshot(P), before, `${name}: afterwards everything outside the sandbox is exactly as it was`);
    assert.deepEqual(r.result.cwd, [], `${name}: nothing created in the working directory`);
  }
});
