#!/usr/bin/env node
/* bundles.mjs — REBUILD EVERY COMMITTED BUNDLE A SOURCE EDIT HAS STALED, AND SAY
 * WHICH ONES IT REBUILT.
 *
 * M0-178, 2026-09-24. **The measured failure this closes:** `kickoffs/WORKER.md`
 * step 0 told a worker who touched `bio-plane/src/` to run `npm run build` in
 * `bio-plane/` — the PLANE's bundle and nothing else. But THREE committed bundles
 * read the plane's sources: `pdf-worker` takes `../bio-plane/src/pdfstructure.mjs`,
 * `subresources.mjs` and `cpu.mjs`, and `ocr-worker` takes `../bio-plane/src/
 * pdfstructure.mjs` behind `../pdf-worker/src/pagepixels.mjs`. So one `src` edit
 * stales three artifacts, the worker rebuilt one, and `fleetbundles.test.mjs`
 * named the other two in a red gate — a round of the battery spent on a fact the
 * instruction could have carried. Found by D-502's worker.
 *
 * **THE ANSWER IS NOT A LONGER INSTRUCTION.** A sentence naming three directories
 * is a list of spellings, and it goes stale the moment a fourth bundle exists or
 * a member gains an import — which is how this defect arrived in the first place.
 * So the command DERIVES the set it rebuilds, from the same two things the gate
 * derives its verdict from and never from a list kept here:
 *
 *   - `discoverMembers` — the fleet's members, by their own `fleet-member.json`
 *     marker (D-117), plus `planeMember` for the plane, which is DELIBERATELY not
 *     a marker member (FL-10) and is therefore the one entry that must be named.
 *     It is named through the library's own exported descriptor, not re-declared.
 *   - `verifyStatic` — the dependency-free staleness arm, which compares every
 *     input sha256 the committed manifest RECORDS against the file in the tree.
 *     That is precisely "whose manifest names a touched file", and it is stricter
 *     than a diff against a branch point: it answers against the bytes the bundle
 *     was actually built from.
 *
 * **IT DOES NOT DECIDE WHICH FINDINGS A REBUILD FIXES.** A table of finding
 * spellings would be a second copy of `verifyStatic`'s rules, and the second copy
 * is the one that goes stale in silence. It rebuilds what is red, then RE-READS
 * the tree and reports what is still red. A member that was red for a reason a
 * rebuild cannot cure is therefore NAMED rather than classified away.
 *
 * **A REBUILD IS REPORTED ONLY WHEN THE BYTES MOVED.** The artifact's and
 * manifest's sha256 are read before and after, so "rebuilt" is a measurement and
 * not the fact that a build command exited 0 — a build that changed nothing is
 * reported as `no change`, which is the honest answer for a comment-only edit
 * esbuild strips (measured both ways, c20-batch14).
 *
 * **HOW IT REBUILDS: `npm run build` IN THE MEMBER'S OWN DIRECTORY**, never
 * `writeMember` from here. Two members have a PRE-STEP that a direct call would
 * silently skip — the plane's `embed:sign` regenerates `src/signpage.mjs` from
 * `tools/sign-release.html`, and `ocr-worker`'s build regenerates
 * `src/tesslib.mjs` from its vendor — and a rebuild that skipped them would leave
 * a generated source stale while reporting the bundle fresh, which is this
 * defect's own shape one layer down. `package.json`'s `build` script is the ONE
 * expression of how a member is built; this command chooses WHICH, never HOW.
 *
 * ---- WHAT IT CANNOT SEE ------------------------------------------------------
 *
 *   - A VENDORED input that is not installed. `verifyStatic` treats an absent
 *     vendored file as the normal condition of a fresh checkout, so a bundle
 *     stale only against a dependency it does not have reads FRESH here. The
 *     byte-identity arm in `fleetbundles.test.mjs` is what covers that half, and
 *     it needs the install.
 *   - A GENERATED input whose generator's input moved without the render being
 *     re-run — `tools/sign-release.html` against `src/signpage.mjs`. The input
 *     hashes cannot see it (the render is what is hashed), and the gate closes
 *     that loop by re-rendering in memory. This command closes it a different
 *     way, by running the member's real build, whose pre-step re-renders; the
 *     render then moves a hashed input and the bundle is rebuilt behind it. So
 *     it is covered in the REBUILD and invisible in `--check`.
 *   - Anything outside a committed manifest. A bundle nobody guards is a bundle
 *     this command does not know exists, which is why the members are DISCOVERED
 *     and why `fleetbundles.test.mjs` floors the count.
 *
 * NEGATIVE CONTROL: declared and run by `bio-plane/test/bundles.test.mjs`, whose
 * header carries the arms and their measured results.
 *
 *   node tools/bundles.mjs              rebuild every stale bundle, say which
 *   node tools/bundles.mjs --check      report only; write nothing; 0 all fresh, 1 stale
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

/* The library lives in `bio-plane/scripts/` because `esbuild` does (its header
   says why), so it is imported LAZILY and its absence is NAMED: a fresh checkout
   with no install would otherwise fail here with a bare ERR_MODULE_NOT_FOUND for
   a package the reader never asked for. */
export async function library() {
  try {
    return await import("../bio-plane/scripts/fleet-bundle.mjs");
  } catch (e) {
    const err = new Error(
      "bundles: the fleet bundle library could not be loaded — " + e.message
      + "\nbundles: it resolves `esbuild` from bio-plane/node_modules. Run `npm ci` in bio-plane/.");
    err.cause = e;
    throw err;
  }
}

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const readOrNull = (p) => { try { return readFileSync(p); } catch { return null; } };

/** The sha256 of the two files a rebuild writes. `null` where the file is absent,
 *  which is a legitimate before-state (a bundle that was never built). */
export function artifactState(member) {
  const b = member.bundle;
  const a = b ? readOrNull(join(member.abs, b.outfile)) : null;
  const m = b ? readOrNull(join(member.abs, b.manifest)) : null;
  return { artifact: a ? sha(a) : null, bytes: a ? a.length : null, manifest: m ? sha(m) : null };
}

/** Every bundle a committed manifest guards, the plane included.
 *
 *  `plane` is a PARAMETER rather than a probe for the plane's files, because a
 *  probe would drop the plane SILENTLY on the day its entry moved — and the
 *  plane going quietly missing from this set is the exact defect the command
 *  exists for. The CLI always passes `true`; only a suite driving a synthetic
 *  repository root passes `false`, and it says so where it does. */
export async function guardedBundles(repoRoot, { plane = true } = {}) {
  const lib = await library();
  const root = repoRoot || lib.REPO_ROOT;
  const all = [...lib.discoverMembers(root), ...(plane ? [lib.planeMember(root)] : [])];
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

/** Ask the dependency-free arm of the gate about every guarded bundle. */
export async function survey(members) {
  const lib = await library();
  return members.map((m) => {
    const { findings } = m.bundle ? lib.verifyStatic(m) : { findings: [`${m.name}: declares no \`bundle\` block in fleet-member.json, so there is no artifact to rebuild.`] };
    return { name: m.name, dir: m.dir, member: m, findings, stale: findings.length > 0 };
  });
}

/** Run the member's OWN build. Returns its exit status and its output, both
 *  read from the process rather than from a wrapper (a `&&` chain reports the
 *  wrapper's status, which is how a killed battery reads green). */
export function rebuildMember(member, { log = console.log } = {}) {
  const r = spawnSync("npm", ["run", "build"], { cwd: member.abs, encoding: "utf8" });
  const out = [r.stdout || "", r.stderr || ""].join("").trimEnd();
  if (out) for (const line of out.split("\n")) log(`         | ${line}`);
  return { status: r.status, error: r.error ? r.error.message : null, out };
}

export async function run({ repoRoot = null, check = false, plane = true, log = console.log } = {}) {
  const members = await guardedBundles(repoRoot, { plane });
  log(`bundles: ${members.length} guarded bundle(s) — ${members.map((m) => m.name).join(", ")}`);

  const before = await survey(members);
  for (const r of before) for (const f of r.findings) log(`         ! ${f}`);

  const stale = before.filter((r) => r.stale);
  if (!stale.length) {
    log(`bundles: every guarded bundle is fresh — nothing to rebuild.`);
    return 0;
  }
  log(`bundles: ${stale.length} of ${members.length} bundle(s) are STALE — ${stale.map((r) => r.name).join(", ")}`);
  if (check) {
    log(`bundles: --check, so nothing was rebuilt. Run \`node tools/bundles.mjs\` to rebuild them.`);
    return 1;
  }

  /* Rebuild, and MEASURE the rebuild: a build command that exits 0 having
     changed nothing has not rebuilt anything, and saying otherwise is the
     mechanism-believed-on-its-existence claim this estate meets most. */
  const moved = [], unmoved = [], failed = [];
  for (const r of stale) {
    if (!r.member.bundle) { failed.push({ name: r.name, why: "declares no `bundle` block, so no build step of its own" }); continue; }
    const was = artifactState(r.member);
    log(`bundles: rebuilding ${r.name} (npm run build in ${r.dir}/)`);
    const res = rebuildMember(r.member, { log });
    if (res.status !== 0) { failed.push({ name: r.name, why: `its build exited ${res.status}${res.error ? ` (${res.error})` : ""}` }); continue; }
    const now = artifactState(r.member);
    /* **THE TWO HALVES ARE REPORTED SEPARATELY, AND MEASUREMENT IS WHY.** Run on
       2026-09-24 against an unused export appended to `bio-plane/src/cpu.mjs`, all
       three stale bundles came back with the ARTIFACT BYTE-IDENTICAL and only the
       MANIFEST moved: esbuild TREE-SHAKES an unused export out of a non-entry
       module (FL-9's own measurement, which is why the input-hash arm is the
       load-bearing one). The bundle was genuinely stale and the rebuild genuinely
       needed, so a line reading `sha256 X (was X)` would have been true and
       unreadable. Say which half moved. */
    const artifactMoved = now.artifact !== was.artifact;
    const manifestMoved = now.manifest !== was.manifest;
    const changed = artifactMoved || manifestMoved;
    (changed ? moved : unmoved).push({ name: r.name, was, now, artifactMoved, manifestMoved });
    log(`bundles: ${r.name} — ${changed ? "REBUILT" : "rebuilt, NOTHING MOVED"} ${r.member.bundle.outfile}`
      + ` ${now.bytes} B — artifact ${artifactMoved ? `sha256 ${now.artifact} (was ${was.artifact ?? "absent"})` : "BYTE-IDENTICAL"}`
      + `, manifest ${manifestMoved ? "moved" : "unchanged"}`);
  }

  /* THE POSITIVE ARTIFACT: the tree is READ AGAIN. The rebuild's own exit status
     is not the evidence — the staleness being gone is. */
  const after = await survey(members);
  const left = after.filter((r) => r.stale);
  for (const r of left) for (const f of r.findings) log(`         ! STILL ${f}`);

  log(`bundles: ${moved.length} rebuilt${moved.length ? ` (${moved.map((m) => m.name).join(", ")})` : ""}`
    + `, ${unmoved.length} already byte-identical`
    + `, ${members.length - stale.length} already fresh`
    + `, ${left.length} STILL STALE${left.length ? ` (${left.map((r) => r.name).join(", ")})` : ""}`
    + `${failed.length ? `, ${failed.length} could not be rebuilt (${failed.map((f) => `${f.name}: ${f.why}`).join("; ")})` : ""}`);
  return left.length || failed.length ? 1 : 0;
}

/* Run as a command, never when IMPORTED — compared as RESOLVED PATHS rather than
   by a filename suffix, which `bundles.test.mjs` would satisfy on some spellings
   and which is how a module that exits the importing process gets written. */
const INVOKED = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (INVOKED) {
  const check = process.argv.includes("--check");
  process.exit(await run({ check }));
}
