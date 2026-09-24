/* bundles.test — `tools/bundles.mjs`, the one command that rebuilds every
 * committed bundle a source edit has staled (M0-178, 2026-09-24).
 *
 * THE SUBJECT IS A DERIVATION, so that is what is asserted. The command's whole
 * value is that it does not carry a list of directories: it asks
 * `discoverMembers` + `planeMember` which bundles exist and `verifyStatic` which
 * of them a touched file has staled. Section 2 asserts the fact the item exists
 * for — ONE plane source is named by THREE committed manifests — against the
 * manifests themselves, so the day a member gains or loses a cross-tree import
 * this suite says so instead of a kickoff sentence being wrong in silence.
 *
 * Section 3 drives the REAL command over a SYNTHETIC repository root: two
 * members built by the real library, one of them edited, rebuilt by the command
 * through the member's own `npm run build`. Nothing is faked — no injected
 * builder, no stubbed verifier — because a command believed on the strength of
 * a fake builder is the mechanism-believed-on-its-existence defect wearing a
 * test's costume. The synthetic root is what keeps the arm from writing into
 * this repository's own artifacts.
 *
 * NEGATIVE CONTROL: ARMS DECLARED BEFORE ARMING AND RUN 2026-09-24 by the M0-178
 * worker in worktree /home/user/bio on `land/worker/M0-178`, each arm ALONE with
 * the others held open, every restore verified by sha256 AND by `cmp` against a
 * per-arm pristine copy in the session scratchpad — never in this worktree (BOB
 * #32). **BASELINE 21 pass / 0 fail, exit 0** for this suite and **91 pass / 0
 * fail, exit 0** for `fleetbundles.test.mjs`, both read from the process's own
 * status and re-read before each arm.
 *
 *   (a) **THE ARM THE ITEM EXISTS FOR — the accepts-when, on the REAL tree and
 *       outside this suite.** Append one unused export to `bio-plane/src/cpu.mjs`
 *       (6682 B, sha256 71ee7af7…), a NON-entry plane module that BOTH
 *       `pdf-worker` and `ocr-worker` read, and rebuild nothing. DECLARED:
 *       `fleetbundles.test.mjs` must fail naming all three. ACTUAL: **88 pass /
 *       3 FAIL, exit 1**, naming bio-plane, ocr-worker AND pdf-worker, each
 *       saying STALE BUNDLE and naming `src/cpu.mjs`. `node tools/bundles.mjs
 *       --check` then named the same three and exited 1 WITHOUT WRITING; `node
 *       tools/bundles.mjs` rebuilt exactly those three and left `agent-worker`
 *       untouched; `fleetbundles.test.mjs` returned to **91 pass / 0 fail, exit
 *       0**. Restored by `cp`, verified identical by sha256 and `cmp`, and the
 *       command run once more: the three manifests came back to their committed
 *       bytes, `git status --porcelain` empty but for this item's own two new
 *       files.
 *   (b) **THE SURPRISE INSIDE (a), RECORDED RATHER THAN SMOOTHED, and it moved
 *       the tool.** All three rebuilds came back with the ARTIFACT BYTE-IDENTICAL
 *       — only the MANIFEST moved — because esbuild TREE-SHAKES an unused export
 *       out of a non-entry module (FL-9's own 2026-09-10 measurement, reproduced
 *       here). The bundles were genuinely stale and the rebuilds genuinely
 *       needed, so the first draft's line `sha256 X (was X)` was true and
 *       unreadable. The command now reports WHICH HALF moved. The other half of
 *       the pair is driven every run by section 3, where the edit is on the
 *       ENTRY and the artifact bytes DO move.
 *   (c) **THE ROW'S OWN CONTROL ARM — the failure this item was raised from.** The same edit, with only the PLANE's bundle rebuilt (`cd
 *       bio-plane && npm run build`, which is exactly what `kickoffs/WORKER.md`
 *       step 0 said before this landing). DECLARED: `fleetbundles.test.mjs`
 *       names the stale members. ACTUAL: **89 pass / 2 FAIL, exit 1**, naming
 *       ocr-worker and pdf-worker; every bio-plane arm PASSED, which is what
 *       made the old instruction look sufficient and is the whole receipt for
 *       this item. Restored and verified as in (a).
 *   (d) **THE DERIVATION BROKEN in the direction that restores the defect** —
 *       `guardedBundles` returning `discoverMembers` alone, the plane dropped.
 *       DECLARED: 1a, 1b, section 2's three, and 4b(ii) fail; section 3 (a
 *       synthetic root, which passes `plane: false` anyway) and 4a/4c hold.
 *       ACTUAL: **15 pass / 6 FAIL, exit 1**, exactly those six.
 *   (e) **A SURPRISING GREEN, MEASURED IN AN EARLIER PASS OF (d) AND THE REASON
 *       4b(ii) EXISTS.** Before it was written, arm (d) came back **15 pass / 5
 *       FAIL**: `4b` held, because it draws its corpus from the SAME derivation
 *       the report does and so compared a three-member report against a
 *       three-member expectation. An agreement that costs nothing is not
 *       evidence; the assertion that cannot agree for free names the plane.
 *   (f) **THE STALENESS DECISION BROKEN** — `survey` returning `findings: []`
 *       and `stale: false` for everything. DECLARED: exactly 4 FAILs — 3a's two
 *       (the member named, the STALE BUNDLE wording) and 3b's two (the artifact
 *       moved, the manifest moved) — **and "the command exits 0" PASSES**,
 *       declared IN ADVANCE as a finding about the ARM: an exit status is not
 *       evidence that anything was rebuilt, which is precisely why this suite
 *       asserts the BYTES. ACTUAL: **17 pass / 4 FAIL, exit 1**, exactly as
 *       declared, the surprising green included.
 *   (g) **OVER-STRICTNESS, AND THESE MUST PASS — all did.** (i) A member nothing
 *       touched is not rebuilt: `beta`'s artifact and manifest sha256 unmoved in
 *       3b, and `agent-worker` untouched throughout arm (a). (ii) A rebuild that
 *       would change nothing changes nothing: the command run twice in 3c, and on
 *       the REAL tree after (a)'s and (c)'s restores it left `git status
 *       --porcelain` empty. (iii) `--check` never writes: every artifact and
 *       manifest sha256 in this repository is byte-identical across a `--check`
 *       run (4a).
 *   RESTORES: `tools/bundles.mjs` 12168 B, sha256 eef927f7…, `cmp`-identical
 *   before and after each of (d) and (f); `bio-plane/src/cpu.mjs` 6682 B, sha256
 *   71ee7af7…, `cmp`-identical before and after each of (a) and (c).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { guardedBundles, survey, artifactState, run } from "../../tools/bundles.mjs";
import { writeMember, REPO_ROOT } from "../scripts/fleet-bundle.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
};
const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = join(HERE, "..", "scripts", "fleet-bundle.mjs");

console.log("\n--- 1 · the command's set is DERIVED, and it contains the one entry no marker file can discover ---");
const real = await guardedBundles();
{
  t("every fleet member with a marker file, PLUS the plane", real.map((m) => m.name),
    ["agent-worker", "bio-plane", "ocr-worker", "pdf-worker"]);
  /* 1b. FL-10 keeps the plane OUT of the `fleet-member.json` walk on purpose (that
     marker enrols a directory in coverage.mjs's FLEET rules, which the plane —
     being the store — necessarily violates). So the plane is the one bundle a
     discovery-only command would miss, and missing it is exactly the round
     WORKER.md's old instruction cost in reverse. */
  t("the PLANE is in it, though no fleet-member.json declares it (FL-10)",
    real.some((m) => m.name === "bio-plane" && m.bundle.outfile === "dist/bio-plane.bundled.mjs"), true);
  t("and every one of them declares a committed manifest to be judged against",
    real.every((m) => m.bundle && m.bundle.manifest), true);
}

console.log("\n--- 2 · ONE plane source is named by THREE committed manifests — the item's own fact ---");
{
  /* Read off the COMMITTED manifests, never off a list here: this is the fact
     `kickoffs/WORKER.md` stated wrongly by naming the plane's bundle alone. The
     manifest records esbuild's own input paths, member-relative. */
  const named = (rel) => real.filter((m) => {
    const man = JSON.parse(readFileSync(join(m.abs, m.bundle.manifest), "utf8"));
    return (man.inputs || []).some((i) => join(m.abs, i.path) === join(REPO_ROOT, rel));
  }).map((m) => m.name);

  t("bio-plane/src/cpu.mjs stales THREE bundles — the plane's and two members'",
    named("bio-plane/src/cpu.mjs"), ["bio-plane", "ocr-worker", "pdf-worker"]);
  /* AND THE REACH IS PER FILE, which is why "three" belongs in no instruction:
     a different plane source reaches a different set, and `agent-worker` — which
     imports no PDF code at all — is reached by this one. A sentence naming three
     directories would be wrong here in the fourth direction. */
  t("bio-plane/src/tokens.mjs reaches a DIFFERENT set, agent-worker included",
    named("bio-plane/src/tokens.mjs"), ["agent-worker", "bio-plane"]);
  t("a plane source no member imports stales the plane alone",
    named("bio-plane/src/schema.mjs"), ["bio-plane"]);
}

console.log("\n--- 3 · the command, driven whole, over a SYNTHETIC repository root ---");
const root = mkdtempSync(join(tmpdir(), "m0178-bundles-"));
const synth = async (name, body) => {
  const abs = join(root, name);
  mkdirSync(join(abs, "src"), { recursive: true });
  mkdirSync(join(abs, "scripts"), { recursive: true });
  writeFileSync(join(abs, "src/index.mjs"), body);
  writeFileSync(join(abs, "fleet-member.json"), JSON.stringify({
    name, entry: "src/index.mjs", surface: "SURFACE", testDir: "test",
    bundle: { entry: "src/index.mjs", outfile: `dist/${name}.bundled.mjs`, manifest: `dist/${name}.bundle.json` },
  }, null, 2));
  /* The member's OWN build step, which is what the command runs — the real
     `writeMember`, reached the way every real member reaches it. */
  writeFileSync(join(abs, "package.json"), JSON.stringify({ name, private: true, scripts: { build: "node scripts/build.mjs" } }, null, 2));
  writeFileSync(join(abs, "scripts/build.mjs"),
    `import { discoverMembers, writeMember } from ${JSON.stringify(LIB)};\n`
    + `const m = discoverMembers(${JSON.stringify(root)}).find((x) => x.name === ${JSON.stringify(name)});\n`
    + `const { built } = await writeMember(m);\nconsole.log(\`${name}: built \${built.bytes.length} B\`);\n`);
  const members = await guardedBundles(root, { plane: false });   /* `plane: false` — this root has no bio-plane/ and a probe for one would be the silent drop the tool refuses */
  await writeMember(members.find((m) => m.name === name));
  return abs;
};
const alpha = await synth("alpha", "export const a = 1;\nexport default { fetch: () => new Response('a') };\n");
await synth("beta", "export const b = 2;\nexport default { fetch: () => new Response('b') };\n");
const quiet = () => {};
const members = await guardedBundles(root, { plane: false });
const stateOf = (n) => artifactState(members.find((m) => m.name === n));

{
  t("3a · both synthetic members are discovered and start FRESH", members.map((m) => m.name), ["alpha", "beta"]);
  t("...and the survey says so", (await survey(members)).map((r) => r.stale), [false, false]);
  const betaBefore = stateOf("beta");

  appendFileSync(join(alpha, "src/index.mjs"), "export const added = 3;\n");
  const found = await survey(members);
  t("...one member's source moves and the survey names EXACTLY that member",
    found.filter((r) => r.stale).map((r) => r.name), ["alpha"]);
  t("...and the finding says STALE BUNDLE and names the file",
    found.find((r) => r.name === "alpha").findings.some((f) => f.includes("STALE BUNDLE") && f.includes("src/index.mjs")), true);

  console.log("  3b · the command rebuilds it, through the member's own `npm run build`");
  const alphaBefore = stateOf("alpha");
  const exit = await run({ repoRoot: root, plane: false, log: quiet });
  t("...the command exits 0 — the staleness is gone when the tree is READ AGAIN", exit, 0);
  t("...alpha's artifact bytes MOVED", stateOf("alpha").artifact !== alphaBefore.artifact, true);
  t("...and its manifest with it", stateOf("alpha").manifest !== alphaBefore.manifest, true);
  /* OVER-STRICTNESS, the half that matters most: a command that rebuilt
     everything would also pass every assertion above. */
  t("...beta, which nothing touched, is BYTE-IDENTICAL — not rebuilt", stateOf("beta"), betaBefore);
  t("...and the survey now reports nothing stale", (await survey(members)).map((r) => r.stale), [false, false]);

  console.log("  3c · run again: a rebuild that would change nothing is not reported as one");
  const again = stateOf("alpha");
  t("...a second run exits 0", await run({ repoRoot: root, plane: false, log: quiet }), 0);
  t("...and wrote nothing at all", stateOf("alpha"), again);
}

console.log("\n--- 4 · `--check` reports and NEVER writes ---");
{
  const before = real.map((m) => artifactState(m));
  const lines = [];
  await run({ check: true, log: (s) => lines.push(s) });
  t("4a · every artifact and manifest sha256 is exactly as it was found",
    real.map((m) => artifactState(m)), before);
  t("4b · and every guarded bundle is NAMED in what it printed",
    real.every((m) => lines.some((l) => l.includes(m.name))), true);
  /* AND THE PLANE BY NAME, SPELLED OUT. The assertion above draws its corpus from
     the same derivation the report does, so it is blind in exactly one direction:
     with the plane dropped it compares a three-member report against a
     three-member expectation and passes. MEASURED — it came back a surprising
     GREEN under arm (d) and is recorded rather than smoothed. The half that
     cannot agree for free is naming the one bundle no marker file discovers. */
  t("4b(ii) · including the PLANE, which arm (d) proved 4b alone cannot see",
    lines.some((l) => l.includes("bio-plane")), true);

  /* The CLI wiring itself — a module that exits the process when it is IMPORTED,
     or that never runs when it is INVOKED, is a trap this estate has paid for.
     The VERDICT is section 3's subject; this arm proves only that the command
     runs and reports as a process. */
  const cli = spawnSync(process.execPath, [join(REPO_ROOT, "tools/bundles.mjs"), "--check"],
    { cwd: REPO_ROOT, encoding: "utf8" });
  t("4c · `node tools/bundles.mjs --check` runs as a command and names the set",
    [cli.stdout.includes("guarded bundle(s)"), [0, 1].includes(cli.status)], [true, true]);
}

console.log(`\nbundles.test: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
