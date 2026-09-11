/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/fleetbundles.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (PL-3/PL-4/PL-11's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, which a concurrent worker overwrote between ARM and RESTORE once already (PL-10). Every arm is armed ALONE, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm names what MUST fail AND what MUST NOT. ALL SIX ARMS RUN 2026-09-10 IN WORKTREE agent-abe10acbf93247266; baseline recorded at each arm.
   **BASELINE 43 pass / 0 fail, exit 0** (read from the process's own status, never a pipeline's), before each arm.
   (1) **THE ARM THIS ITEM EXISTS FOR — A SOURCE MOVES AND THE ARTIFACT DOES NOT.** Append one export to `agent-worker/src/harness.mjs` and do NOT rebuild -> **42 pass, 1 FAIL, exit 1**, naming `agent-worker`, naming `src/harness.mjs`, and saying STALE BUNDLE. pdf-worker held. **DECLARED WRONG FIRST AND CORRECTED INTO SOMETHING STRONGER RATHER THAN SMOOTHED, and this is the most useful thing the control found:** it was declared to fail from BOTH arms and the BYTE-IDENTITY ARM STAYED GREEN, because `harness.mjs` is a NON-ENTRY module and **esbuild TREE-SHAKES an unused export out of one** — the bundle really was byte-identical to a fresh build of the changed source. **So byte-identity alone would have PASSED a real source change**, and the dependency-free input-hash arm is the load-bearing one rather than a fallback for machines that cannot build. Arm (1b) is the pair that proves the other half.
   (1b) **THE SAME CHANGE ON THE ENTRY.** Append one export to `agent-worker/src/index.mjs` -> **39 pass, 4 FAIL, exit 1**: the input-hash arm AND the byte-identity arm AND the manifest-sha arm, because an ENTRY's exports are not tree-shaken. pdf-worker held.
   (2) **THE SAME ARM ON `pdf-worker` SPECIFICALLY**, because it is the member that was ALREADY missing this guard and a one-member fix would pass arm (1) while leaving it open. Append one export to `pdf-worker/src/index.mjs` -> **39 pass, 4 FAIL, exit 1**, naming `pdf-worker` and `src/index.mjs`; agent-worker held.
   (2, SECOND VARIANT — `2-noinstall`) **THE SAME ARM WITH `pdf-worker/node_modules` RENAMED AWAY**, which is a FRESH CHECKOUT's condition and the one that matters -> **36 pass, 1 FAIL, exit 1**. The byte-identity arm SKIPPED BY NAME (`SKIP  pdf-worker: byte-identity not runnable here`) and **the dependency-free input-hash arm STILL FAILED**, naming `pdf-worker` and `src/index.mjs`; `agent-worker`'s byte-identity arm still RAN, as declared. A guard that skips on the machine where it matters is not a guard.
   (2b) **THE CROSS-TREE ARM, and it is the one nobody would have looked for.** THREE of `pdf-worker`'s six build inputs are the PLANE's (`../bio-plane/src/pdfstructure.mjs`, `subresources.mjs`, `cpu.mjs`). Append one export to `bio-plane/src/pdfstructure.mjs` -> **42 pass, 1 FAIL, exit 1**, naming `pdf-worker` and `../bio-plane/src/pdfstructure.mjs`; `agent-worker` held, as declared, because it does not import the plane. A change to the plane stales a fleet member's artifact, from a directory whose author has no reason to think about `pdf-worker`.
   (3) **THE ARTIFACT ITSELF EDITED.** Append one line to `agent-worker/dist/agent-worker.bundled.mjs` -> **40 pass, 3 FAIL, exit 1**, naming the manifest mismatch (`does not match its own manifest`) and failing byte-identity; pdf-worker held. The manifest is not a second opinion about the artifact; it is a hash OF it.
   (4) **THE GUARD DELETED.** Remove the `bundle` block from `pdf-worker/fleet-member.json` -> **30 pass, 5 FAIL, exit 1**, naming `pdf-worker: declares no `bundle` block`. **TWO GATES FIRED OVER ONE ARM and both are recorded rather than claimed as one:** the per-member naming AND the GUARDED FLOOR. Discovery is the only evidence, so a member that stops declaring itself must not stop existing (VF-3's lesson, one file over).
   (5) **OVER-STRICTNESS, and these must all PASS.** (a) Rebuild BOTH members from unchanged sources — a legitimately rebuilt, byte-identical bundle must still pass and the tree must be UNCHANGED afterwards (`git status --porcelain` empty). **RUN AFTER THE COMMIT, deliberately: the tree-unchanged half is only a statement about a clean tree.** (b) A docs-only change must not fail the build — `tools/gates.mjs` derives its doc-facing set from whether a suite's own source or its sibling control mentions the prose directory, and NEITHER of this pair does, so a DOCS-class run does not select this suite at all. **STATED AS THE FENCE IT IS: the DERIVATION is asserted over the real files; a full DOCS-class run of `gates.mjs` was NOT driven from this branch, because the branch's own committed diff makes every classification FULL.** (c) `node scripts/coverage.mjs --strict` exits 0, read from the process's own status.
   ======================================================================== */
/* THE FLEET'S BUILD GUARD (FL-9, BOB 2026-09-10, answering DIST's DELEGATION).
 *
 * **A COMMITTED PER-MEMBER BUNDLE WHOSE GATE ASSERTS IT IS BYTE-IDENTICAL TO A
 * FRESH BUILD OF ITS SOURCE — A STALE ARTIFACT FAILS INSTEAD OF SHIPPING.**
 *
 * WHY IT LIVES IN THE PLANE'S `test/` AND NOT IN A MEMBER'S. `battery.mjs`
 * SKIPS a fleet member's suites when that member has no `node_modules` — loudly
 * and by name, which is the right treatment for a member's own suite and the
 * wrong one for a guard. **A guard that skips is not a guard.** `pdf-worker`'s
 * own suites were run by NOTHING for eight days for exactly this reason. A plane
 * suite runs wherever the battery runs.
 *
 * ---- HOW THE TWO SIDES ARE KEPT GENUINELY INDEPENDENT -----------------------
 *
 * This estate has been bitten six times by an expectation DERIVED FROM THE THING
 * UNDER TEST, which moves with it and proves nothing. This suite compares a
 * BUILD to an ARTIFACT, so it is squarely in that class and the separation is
 * made structural rather than promised:
 *
 *   1. The committed artifact is READ FROM DISK BEFORE any build runs, and the
 *      build runs with `write: false` — `fleet-bundle.mjs`'s verification path
 *      cannot touch the tree. Nothing here can end up comparing one buffer with
 *      itself.
 *   2. The expectation is not derived from the artifact. It is derived from the
 *      SOURCE FILES — `src/*.mjs`, and for `pdf-worker` three files in
 *      `bio-plane/src/` — by running esbuild over them. Different files,
 *      different producer.
 *   3. **THE SUITE PROVES ITS OWN GUARD CAN FAIL, ON EVERY RUN, WITHOUT BEING
 *      ARMED.** Section 4 builds a SYNTHETIC member in a temp directory, verifies
 *      it GREEN, changes one byte of its source, and requires the same check to
 *      go RED — then restores it and requires GREEN again. Section 5 rebuilds
 *      each REAL member with one comment appended to its entry IN MEMORY and
 *      requires the bytes to differ from the committed artifact. A guard nobody
 *      has seen fail is a guard nobody has seen.
 *
 * ---- WHAT EACH ARM COVERS, AND WHAT IT CANNOT ------------------------------
 *
 * The byte-identity arm needs the member's dependencies installed; a fresh
 * checkout has none. So the INPUT-HASH arm — every build input's sha256, recorded
 * in the committed manifest — runs with no install at all and is what catches the
 * case this item exists for. The case the byte arm cannot check is the case where
 * the unverifiable inputs are also unchangeable: a dependency's bytes cannot
 * drift in a checkout that does not contain them, and a lock that moved without a
 * rebuild is caught by the dependency-free arm anyway.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  REPO_ROOT, discoverMembers, buildMember, writeMember, verifyStatic, verifyFresh,
  freshBuildRunnable, unresolvableSpecifiers, sha256, fleetProvenance, memberPaths,
} from "../scripts/fleet-bundle.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* A finding is a failure. Printing them is not decoration: the item's acceptance
   is that the gate FAILS **NAMING THE MEMBER**, and a reader who cannot see the
   name cannot act on the red. */
const show = (findings) => { for (const f of findings) console.log(`         ! ${f}`); };

/* THE FLOOR, and it is a ratchet rather than a count. The member walk is
   DISCOVERY-driven (D-117), which is right and has one hole: a member that stops
   declaring itself stops existing, and `2 of 2 guarded` reads exactly as green
   as it did before a directory was deleted. Move this only UPWARD and only to a
   figure a green run PRINTED. */
const GUARDED_FLOOR = 2;

const members = discoverMembers(REPO_ROOT);

console.log("\n--- 1 · every fleet member is DISCOVERED, and every one of them is GUARDED ---");
t("members discovered by their own marker file, never a list kept here",
  members.map((m) => m.name), ["agent-worker", "pdf-worker"]);

/* D-238. `git stash` is REPOSITORY-WIDE across every worktree and `push -u`
   carries untracked files, so a `pop` can deposit a whole fleet directory —
   manifest and all — into a tree that never wrote it. The floor below is
   therefore measured against what ANOTHER CHECKOUT COULD SEE, not against what
   this walk counted, because a floor met by a phantom is permanently too high
   and a ratchet that cannot pass is one somebody switches off. */
const prov = fleetProvenance(members);
const off = new Set(prov.off.map((r) => r.path));
const reproducible = members.filter((m) => {
  if (!m.bundle) return false;
  const p = memberPaths(m);
  return !prov.verified || [p.marker, p.artifact, p.manifest].every((x) => !off.has(x));
}).length;
const counted = members.filter((m) => m.bundle).length;
if (reproducible !== counted)
  console.log(`        ${counted} guarded member(s) counted; ${reproducible} of them stand on files in the commit`);
t(`at least ${GUARDED_FLOOR} REPRODUCIBLE member(s) declare a committed bundle (the floor — a member DIRECTORY deleted is invisible to any per-member check, and a phantom one must not satisfy it)`,
  reproducible >= GUARDED_FLOOR, true);
t("every discovered member declares one — a member with no `bundle` block is NAMED, never silently unguarded",
  members.filter((m) => !m.bundle).map((m) => m.name), []);

/* The committed bytes are taken HERE, before a single build runs anywhere in
   this file. Everything downstream compares against this snapshot. */
const committedOf = new Map();
for (const m of members) {
  if (!m.bundle) continue;
  try { committedOf.set(m.name, readFileSync(join(m.abs, m.bundle.outfile))); }
  catch { committedOf.set(m.name, null); }
}

console.log("\n--- 2 · THE DEPENDENCY-FREE ARM: the committed artifact against the sources it was built from ---");
const manifests = new Map();
for (const m of members) {
  const { findings, manifest } = verifyStatic(m);
  manifests.set(m.name, manifest);
  show(findings);
  t(`${m.name}: no staleness, no recipe drift, no unresolvable import`, findings, []);
}

console.log("\n--- 2a · the manifest records the inputs it actually has, including the ones ACROSS TREES ---");
{
  /* IC-68 finding 3, asserted rather than described: three of `pdf-worker`'s
     inputs are the PLANE's, so a change in `bio-plane/src/` stales this member's
     artifact. Nothing said so anywhere before this item. */
  const pdf = manifests.get("pdf-worker");
  const cross = (pdf?.inputs || []).filter((i) => i.path.startsWith("../bio-plane/")).map((i) => i.path).sort();
  t("pdf-worker's build reaches into the PLANE's source, and the manifest hashes those files too",
    cross, ["../bio-plane/src/cpu.mjs", "../bio-plane/src/pdfstructure.mjs", "../bio-plane/src/subresources.mjs"]);
  const agent = manifests.get("agent-worker");
  t("agent-worker's three modules are all recorded — the reason a one-part upload needed a bundle at all",
    (agent?.inputs || []).map((i) => i.path).sort(),
    ["src/harness.mjs", "src/index.mjs", "src/subsession.mjs"]);
  t("and it vendors nothing: the member still imports NOTHING from npm",
    (agent?.vendoredInputs || []).length, 0);
  t("every recorded input carries a hash — a null sha256 would be an input nothing checks",
    members.flatMap((m) => (manifests.get(m.name)?.inputs || []).filter((i) => !i.sha256).map((i) => `${m.name}:${i.path}`)), []);
}

console.log("\n--- 3 · THE BYTE-IDENTITY ARM: a fresh build of the SOURCE against the COMMITTED artifact ---");
const freshRan = [];
for (const m of members) {
  if (!m.bundle) continue;
  const committed = committedOf.get(m.name);
  if (!committed) { t(`${m.name}: the committed artifact is readable`, false, true); continue; }
  const { runnable, reason } = freshBuildRunnable(m, manifests.get(m.name) || {});
  if (!runnable) {
    /* SKIPPED LOUDLY AND BY NAME — D-93's treatment, never a silent pass and
       never folded into the green figure. The arm above still covered this
       member's sources, which is why a skip here is not a hole. */
    console.log(`  SKIP  ${m.name}: byte-identity not runnable here — ${reason}`);
    console.log(`        (the dependency-free input-hash arm in section 2 DID run for ${m.name})`);
    continue;
  }
  const { findings, built } = await verifyFresh(m, committed);
  show(findings);
  t(`${m.name}: a fresh build of ${m.bundle.entry} is byte-identical to the committed ${m.bundle.outfile}`,
    findings, []);
  t(`${m.name}: and the manifest's sha256 is that same build's`, built.sha256, manifests.get(m.name)?.sha256);
  console.log(`        ${m.name}: ${built.bytes.length} B · sha256 ${built.sha256}`);
  freshRan.push(m.name);
}
t("the byte-identity arm ran for at least one member — an arm that never runs is not an arm",
  freshRan.length >= 1, true);

console.log("\n--- 4 · THE GUARD PROVES IT CAN FAIL, on a subject this suite fully controls ---");
{
  /* A SYNTHETIC member, built and verified end to end through the SAME code path
     the real members use. This is the answer to "the two sides must genuinely
     come from different places": here the suite knows the ground truth, so a
     green that costs nothing would be visible immediately. */
  const root = mkdtempSync(join(tmpdir(), "fl9-selftest-"));
  try {
    const dir = join(root, "probe-worker");
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "src/dep.mjs"), "export const N = 1;\n");
    writeFileSync(join(dir, "src/index.mjs"),
      "import { N } from \"./dep.mjs\";\nexport default { fetch() { return new Response(String(N)); } };\n");
    writeFileSync(join(dir, "fleet-member.json"), JSON.stringify({
      name: "probe-worker", entry: "src/index.mjs", surface: "SURFACE", testDir: "test",
      bundle: {
        entry: "src/index.mjs", outfile: "dist/probe-worker.bundled.mjs",
        manifest: "dist/probe-worker.bundle.json", external: ["cloudflare:workers", "node:*"],
      },
    }));
    const probe = discoverMembers(root).find((m) => m.name === "probe-worker");
    t("the synthetic member is discovered by the same walk the real ones are", !!probe, true);

    await writeMember(probe);
    t("(a) freshly built and freshly manifested, it verifies GREEN", verifyStatic(probe).findings, []);

    /* ARM: one byte of a source moves and the artifact does not. */
    const depPath = join(dir, "src/dep.mjs");
    const before = readFileSync(depPath);
    writeFileSync(depPath, "export const N = 2;\n");
    const armed = verifyStatic(probe).findings;
    t("(b) change one SOURCE byte without rebuilding -> the guard FAILS", armed.length > 0, true);
    t("(b) and the failure NAMES the member", armed.every((f) => f.startsWith("probe-worker:")), true);
    t("(b) and NAMES the file that moved", armed.some((f) => f.includes("src/dep.mjs")), true);
    t("(b) and says it is a STALE BUNDLE, not something the reader has to decode",
      armed.some((f) => f.includes("STALE BUNDLE")), true);
    const armedFresh = await verifyFresh(probe, readFileSync(join(dir, probe.bundle.outfile)));
    t("(b) the byte-identity arm fails on the same change, independently",
      armedFresh.findings.length > 0, true);

    /* RESTORE, verified by CONTENT and by sha256 — never by "I wrote it back". */
    writeFileSync(depPath, before);
    t("(c) restored BY CONTENT", readFileSync(depPath).equals(before), true);
    t("(c) restored BY sha256", sha256(readFileSync(depPath)), sha256(before));
    t("(c) and the guard is GREEN again — so the red above was the CHANGE and not the harness",
      verifyStatic(probe).findings, []);

    /* ARM: the ARTIFACT itself edited. The manifest is a hash OF the artifact,
       not a second opinion about it. */
    const artPath = join(dir, probe.bundle.outfile);
    const art = readFileSync(artPath);
    writeFileSync(artPath, Buffer.concat([art, Buffer.from("//x\n")]));
    const edited = verifyStatic(probe).findings;
    t("(d) edit the ARTIFACT and the guard FAILS on its own sha256",
      edited.some((f) => f.includes("does not match its own manifest")), true);
    writeFileSync(artPath, art);
    t("(d) restored BY CONTENT", readFileSync(artPath).equals(art), true);
    t("(d) GREEN again", verifyStatic(probe).findings, []);

    /* ARM: the guard DELETED. */
    const noBundle = { ...probe, bundle: null };
    const gone = verifyStatic(noBundle).findings;
    t("(e) a member that stops declaring a `bundle` block is NAMED, not silently dropped",
      gone.length === 1 && gone[0].startsWith("probe-worker:") && /no .bundle. block/.test(gone[0]), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log("\n--- 5 · the REAL members: the comparison is sensitive to their real sources ---");
for (const m of members) {
  if (!m.bundle) continue;
  const committed = committedOf.get(m.name);
  if (!committed) continue;
  if (!freshBuildRunnable(m, manifests.get(m.name) || {}).runnable) {
    console.log(`  SKIP  ${m.name}: needs its own install to rebuild (see section 3)`);
    continue;
  }
  /* One export appended to the ENTRY, IN MEMORY — nothing on disk moves. If the
     committed artifact and a build of a CHANGED source came back equal, the
     comparison would be measuring nothing. */
  const mutated = await buildMember(m, { write: false, mutateEntry: "\nexport const __fl9Probe = \"fl9 independence probe\";\n" });
  t(`${m.name}: a build of a CHANGED entry is NOT the committed artifact`,
    Buffer.compare(mutated.bytes, committed) === 0, false);
  t(`${m.name}: and the change is visible in the output, so the build really consumed it`,
    mutated.bytes.toString("utf8").includes("fl9 independence probe"), true);

  /* AND THE OTHER DIRECTION, WHICH IS WHY THE TWO ARMS ARE NOT REDUNDANT.
     **esbuild STRIPS ordinary comments**, so a comment-only source change
     produces a BYTE-IDENTICAL bundle — measured here, on the real member, every
     run. The byte arm is BLIND to it and the input-hash arm is not, which makes
     the dependency-free arm STRICTER rather than a fallback for machines that
     cannot run the other one. Discovered by paying for it: this section's first
     draft appended a comment and read `identical` as a broken probe. */
  const commentOnly = await buildMember(m, { write: false, mutateEntry: "\n/* fl9 comment-only probe */\n" });
  t(`${m.name}: a COMMENT-only source change bundles byte-identically — so byte-identity alone would MISS it`,
    Buffer.compare(commentOnly.bytes, committed) === 0, true);
  t(`${m.name}: and the input-hash arm would NOT miss it, because the source's sha256 moved`,
    sha256(readFileSync(join(m.abs, m.bundle.entry)) + "\n/* fl9 comment-only probe */\n")
      !== (manifests.get(m.name)?.inputs || []).find((i) => i.path === m.bundle.entry)?.sha256, true);
}

console.log("\n--- 6 · INSTALLABLE WITHOUT BUNDLING: one part, nothing left to resolve ---");
for (const m of members) {
  if (!m.bundle) continue;
  const committed = committedOf.get(m.name);
  if (!committed) continue;
  const left = unresolvableSpecifiers(committed.toString("utf8"), m.bundle.external);
  t(`${m.name}: its committed artifact imports nothing a one-part upload could not resolve`, left, []);
}
t("agent-worker bundles to ONE file with ZERO import specifiers of any kind — the REFUSED multi-part alternative would buy nothing here",
  /(?:^|[;\n])\s*(?:import|export)[^;]*?\bfrom\s*["']/.test(committedOf.get("agent-worker")?.toString("utf8") || "x from \"y\""),
  false);

console.log("\n--- 7 · and the committed bytes really are a Worker: each boots under workerd from ONE part ---");
{
  /* The property `newgroup` needs, driven rather than argued. A static scan says
     nothing resolves; this says the runtime agrees. Both members expose a GET
     `/version` that needs no plane and no bytes. */
  for (const [name, extra] of [["agent-worker", { serviceBindings: { PLANE: () => new Response("{}") } }],
                               ["pdf-worker", { r2Buckets: ["CAPTURES"] }]]) {
    const m = members.find((x) => x.name === name);
    if (!m || !m.bundle || !committedOf.get(name)) { t(`${name}: present to boot`, false, true); continue; }
    const p = join(m.abs, m.bundle.outfile);
    const mf = new Miniflare({
      modules: true, modulesRoot: "/", scriptPath: p, script: committedOf.get(name).toString("utf8"),
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "bundle-gate" }, ...extra,
    });
    try {
      const res = await mf.dispatchFetch(`http://${name}/version`);
      const body = await res.json();
      t(`${name}: the COMMITTED bundle boots under workerd as one part and answers /version`,
        [res.status, body.name], [200, name]);
      t(`${name}: and it is the version the runtime bound, so the module really initialised`,
        body.version, "bundle-gate");
    } finally { await mf.dispose(); }
  }
}

console.log(`\nfleetbundles: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
