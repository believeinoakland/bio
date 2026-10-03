/* case-checker: the standalone program (R13, R16) and its committed build (`program.mjs`, a generated artifact, manifest
   §14), run as a person runs it: one file copied to an empty directory outside the repository, started by Node. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import * as CC from "../../../src/case-checker/index.mjs";
import { buildProgram, programModule } from "../../../src/case-checker/build-program.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { unresolvableSpecifiers } from "../../../scripts/fleet-bundle.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { caseFile, keyFor, A, MINUTES, MINUTES_BYTES } from "./fixture.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");

test("R13: the build gives the same bytes every time, and the committed program.mjs is that build (regenerate: node bio-plane/src/case-checker/build-program.mjs)", async () => {
  const one = await buildProgram();
  const two = await buildProgram();
  assert.equal(one.text, two.text);
  assert.equal(CC.PROGRAM_SHA256, one.sha256, "program.mjs is stale: run node bio-plane/src/case-checker/build-program.mjs");
  assert.ok(CC.PROGRAM === one.text);
  assert.equal(programModule(one), programModule(two));
});

test("R13: the program file carries its own SHA-256: its first line names the SHA-256 of everything after it, and the served SHA-256 is the whole file's", () => {
  const nl = CC.PROGRAM.indexOf("\n");
  const first = CC.PROGRAM.slice(0, nl);
  const body = CC.PROGRAM.slice(nl + 1);
  assert.match(first, new RegExp(`SHA-256 of everything after this line: ${sha(body)}$`));
  assert.equal(CC.PROGRAM_BODY_SHA256, sha(body));
  assert.equal(CC.PROGRAM_SHA256, sha(CC.PROGRAM));
  const served = CC.caseCheckerProgram();
  assert.equal(served.program, CC.PROGRAM);
  assert.equal(served.sha256, sha(CC.PROGRAM));
  assert.equal(served.bytes, Buffer.byteLength(CC.PROGRAM));
});

test("R13: nothing to install and no network: the program imports only Node's own built-ins, and none that reaches the network", () => {
  assert.deepEqual(unresolvableSpecifiers(CC.PROGRAM, ["node:fs/promises", "node:path", "node:url"]), []);
  const dynamic = [...CC.PROGRAM.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(dynamic)].sort(), ["node:fs/promises", "node:path", "node:url"]);
  for (const net of ["fetch(", "XMLHttpRequest", "WebSocket", "node:http", "node:https", "node:net", "node:dns"])
    assert.equal(CC.PROGRAM.includes(net), false, net);
});

test("R13 R16: run offline from an empty directory, the program prints each finding's result first and then the same answer checkCaseFile gives on the same parts, byte-identical", async () => {
  const dir = mkdtempSync(join(tmpdir(), "case-checker-"));
  try {
    writeFileSync(join(dir, "case-checker.mjs"), CC.PROGRAM);
    const cf = caseFile({ parts: 2, withImported: true, edit: (b) => b.delete(CG.caseFilePath("document", MINUTES)) });
    cf.parts.forEach((p, i) => writeFileSync(join(dir, `part${i + 1}.zip`), p));
    writeFileSync(join(dir, "minutes.pdf"), MINUTES_BYTES);
    writeFileSync(join(dir, "keys.txt"), `# the group's published keys\n${["group", "alice", "bob"].map((k) => keyFor(k).line).join("\n")}\n`);
    const run = (...args) => execFileSync(process.execPath, ["case-checker.mjs", ...args], { cwd: dir, encoding: "utf8", env: { PATH: process.env.PATH } });
    for (const [args, call] of [
      [["part1.zip", "part2.zip"], { parts: cf.parts }],
      [["part1.zip", "part2.zip", "--document", "minutes.pdf", "--keys", "keys.txt"],
       { parts: cf.parts, documents: [Buffer.from(MINUTES_BYTES)], keys: ["group", "alice", "bob"].map((k) => keyFor(k).line) }]]) {
      const out = run(...args);
      const expected = await CC.checkCaseFile(call);
      const lines = out.split("\n");
      expected.findings.forEach((f, i) => assert.equal(lines[i], `${f.finding}: ${CC.RESULT_WORDS[f.result]}`));
      const json = out.slice(out.indexOf("{"));
      assert.equal(canonicalJson(JSON.parse(json)), canonicalJson(expected));
    }
    assert.match(run("part1.zip", "part2.zip").split("\n")[0], new RegExp(`^${A}: Recreated in part$`));
    /* a file it cannot read: exit status 2, saying so */
    assert.throws(() => run("nope.zip"), (e) => e.status === 2 && /could not read nope\.zip/.test(e.stdout));
    assert.throws(() => run(), (e) => e.status === 2 && /usage:/.test(e.stdout));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("R13: runProgram, the program's own entry, answers what it prints and its status", async () => {
  const cf = caseFile();
  const files = new Map([["a.zip", cf.parts[0]]]);
  const out = await CC.runProgram(["a.zip"], async (p) => { if (!files.has(p)) throw new Error("no such file"); return files.get(p); });
  assert.equal(out.status, 0);
  assert.equal(out.text.split("\n")[0], `${A}: Recreated`);
  assert.equal((await CC.runProgram([], async () => null)).status, 2);
  assert.equal((await CC.runProgram(["--help"], async () => null)).status, 0);
});
