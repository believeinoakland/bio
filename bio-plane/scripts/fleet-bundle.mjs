/* THE FLEET'S BUILD STEP, AND THE GUARD THAT MAKES A COMMITTED ARTIFACT SAFE.
 *
 * ONE implementation of the recipe and ONE implementation of the check. Both
 * `agent-worker/scripts/build.mjs` and `pdf-worker/scripts/build.mjs` are thin
 * callers of this, and `bio-plane/test/fleetbundles.test.mjs` is the only reader
 * of the verification. A second copy of a rule is how the next one goes stale in
 * silence — this estate has measured that five times (`coverage.mjs`'s own note
 * on the fleet `control` flag, where the arm written to prove a fix came back
 * GREEN because nothing read the flag any more).
 *
 * ---- WHY THIS EXISTS AT ALL (BOB, 2026-09-10, answering DIST's DELEGATION) ---
 *
 * `newgroup` is a Worker. It cannot run `wrangler` and it cannot bundle, and
 * `agent-worker` is three modules, so a one-part script upload — which is all an
 * installer has — cannot resolve them. An installable fleet therefore needs one
 * bundled, hashed, signed artifact PER MEMBER.
 *
 * FLEET's own ruling said the SOURCE deploys, not a bundle, because a committed
 * bundle is "a second place its version lives and a committed artifact that can
 * drift from its source (D-106's class)". **That objection is ANSWERED here, not
 * overruled.** The instrument is the one this record always reaches for — a
 * hash-verified copy of exact bytes, never a second codebase
 * (`newgroup/scripts/embed-release.mjs`, `scripts/embed-signpage.mjs`) — and the
 * shape is `check-versions`': EQUALITY, in both directions, refusing rather than
 * preferring whichever side looks newer.
 *
 * **A STALE ARTIFACT FAILS INSTEAD OF SHIPPING.** That is the whole product of
 * this file.
 *
 * ---- WHY IT LIVES IN `bio-plane/scripts/` AND NOT IN `tools/` ---------------
 *
 * Because `esbuild` is here. `bio-plane/node_modules` is the only install in the
 * repository that carries it for every member, the repository ROOT has no
 * `node_modules` at all, and `agent-worker` deliberately has no dependencies of
 * its own. A library under `tools/` could not `import "esbuild"`. The precedent
 * is `newgroup/scripts/embed-release.mjs`, which already expects "the sibling
 * ../bio-plane tree with its devDependencies installed".
 *
 * ---- THE TRAP THIS FILE WAS WRITTEN AROUND, MEASURED 2026-09-10 -------------
 *
 * **esbuild writes its input paths into the output as comments, RELATIVE TO THE
 * PROCESS WORKING DIRECTORY.** The identical `pdf-worker` source built from
 * `pdf-worker/` and from `bio-plane/` differs by 30 bytes — `// src/index.mjs`
 * against `// ../pdf-worker/src/index.mjs`, and the mirror of that for the plane
 * sources it imports. The first measurement taken for this item read
 * `identical: false` and looked exactly like a stale committed artifact; it was
 * a false stale produced by the instrument's own cwd.
 *
 * So `absWorkingDir` is PINNED to the member directory, the pin is RECORDED in
 * the committed manifest, and the gate asserts the pin as well as the bytes. A
 * guard that cries wolf gets switched off, which is the same outcome as not
 * having one.
 *
 * **The same false stale, one layer down: esbuild writes a module's RESOLVED path,
 * and by default it resolves SYMLINKS.** Measured 2026-09-23 (BOB #29, reproduced
 * by FLEET #4): in a worktree whose `node_modules` is a symlink to another
 * checkout, `pdf-worker` built `// ../../../../../../../home/user/bio/pdf-worker/
 * node_modules/unpdf/dist/pdfjs.mjs` where the committed bundle has
 * `// node_modules/unpdf/dist/pdfjs.mjs`, and this guard read 84/3 on identical
 * source. So `preserveSymlinks` is ON: a module is named by the path it was
 * reached through, which is the member-relative one on every layout. A real
 * install has no symlinks, so the committed bytes do not move, and the manifest's
 * recipe does not record the flag because no layout makes it vary.
 *
 * ---- WHAT THE MANIFEST IS FOR, AND WHY IT IS NOT DECORATION -----------------
 *
 * The byte-identity arm needs the member's dependencies INSTALLED (unpdf, for
 * `pdf-worker`), and a fresh checkout has none — `battery.mjs`'s fleet walk
 * already says so and skips such suites loudly. **A guard that skips is not a
 * guard**, so the manifest carries the sha256 of every INPUT, and the input
 * check runs on any machine with no install at all. The two arms cover different
 * halves and say which half they are:
 *
 *   - INPUT HASHES catch first-party drift — a member's own source, or the PLANE
 *     source a member imports — everywhere, always, with zero dependencies.
 *     This is the arm FL-9 exists for.
 *   - THE FRESH BUILD catches everything, including a dependency's bytes moving,
 *     and runs wherever those bytes are present. **The case it cannot check is
 *     the case where the unverifiable inputs are also unchangeable**: a
 *     dependency's bytes cannot drift in a checkout that does not contain them.
 *     The member's `package-lock.json` hash is recorded too, so a lock that moved
 *     without a rebuild is caught by the dependency-free arm.
 *
 * ---- WHAT THIS FILE MUST NEVER DO -------------------------------------------
 *
 * **VERIFICATION NEVER WRITES.** `buildMember` takes `write` and the gate always
 * passes `false`. A guard that regenerates the artifact it is about to compare
 * against agrees with itself for free, which is the defect wearing the costume of
 * a guard. The two sides are: bytes esbuild produced from the SOURCE FILES just
 * now, and bytes read from a COMMITTED FILE before the build ran. Nothing in
 * this module lets those be the same buffer.
 */
import { build, version as ESBUILD_VERSION } from "esbuild";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
/* THIS WALK IS GUARDED RATHER THAN NAMED, and `hygiene.test.mjs`'s census is what
   asked the question — it went red on this file the first full battery after it
   was written, before anyone read the diff, which is the sixth time that ratchet
   has caught a new walk on the day it landed.
   WHY GUARDED AND NOT NAMED: `discoverMembers` walks the REPOSITORY ROOT for
   `fleet-member.json`, which is the second discovery path M0-15 named — a
   manifest enrols a WHOLE DIRECTORY, so it is a larger hole than an untracked
   suite, not a smaller one — and this module's count FEEDS A FLOOR in
   `test/fleetbundles.test.mjs`. The named list's own rule says naming is
   defensible for a walk that only REPORTS and much weaker for one whose count
   feeds a ratchet, because a floor set while a phantom was present is
   permanently too high and gets switched off. `battery.mjs` and `coverage.mjs`
   guard the identical walk; this is the third caller of one mechanism, never a
   fourth statement of the rule. */
import { readGitProvenance, reportProvenance, repoPath } from "./provenance.mjs";

export const REPO_ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), "..", ".."));

/* The recipe every member shares. A member's `fleet-member.json` may override
   `entry`, `outfile`, `manifest` and `external`; it may NOT override `format` or
   `platform`, because those two are what make the output a Worker module and a
   member that needed a different answer would not be a fleet member. */
export const RECIPE = Object.freeze({ format: "esm", platform: "neutral" });
export const DEFAULT_EXTERNAL = Object.freeze(["cloudflare:workers", "node:*"]);

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/* ---------------------------------------------------------------- discovery */
/* Members are DISCOVERED by their own marker file (D-117), never hand-listed
   here, for the same reason `battery.mjs` discovers suites from the directory
   and `coverage.mjs` discovers members from the manifest: a list maintained by
   hand is a list that silently falls behind the thing it lists.

   A member opts INTO a bundle by carrying a `bundle` block. A member without one
   is not a defect and is not silently skipped either — the gate names it, so a
   `bundle` block DELETED is visible rather than being a member that quietly
   stops being guarded. */
export function discoverMembers(repoRoot = REPO_ROOT) {
  const out = [];
  for (const dir of readdirSync(repoRoot).filter((d) => !d.startsWith("."))) {
    let meta;
    try { meta = JSON.parse(readFileSync(join(repoRoot, dir, "fleet-member.json"), "utf8")); }
    catch { continue; }
    out.push({
      dir,
      name: meta.name || dir,
      abs: join(repoRoot, dir),
      bundle: meta.bundle || null,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* ---- THE PLANE ITSELF, GUARDED BY THE SAME LIBRARY (FL-10, D-298) ----------
 *
 * DIST measured the MIRROR of FL-9's defect: `dist/bio-plane.bundled.mjs` was
 * 114 commits stale against `src` and the battery could not tell — the battery
 * proves the artifact WORKS, never that it MATCHES its source.
 *
 * The plane is DELIBERATELY NOT a `fleet-member.json` member: that marker
 * enrols a directory in `coverage.mjs`'s FLEET rules (a member holds no store
 * binding and no surface op may be `mutating`), which the plane necessarily
 * violates — it IS the store. So the plane arrives as an exported descriptor
 * with the same `bundle` shape, consumed by the gate and by
 * `scripts/build-plane.mjs`, and `discoverMembers`' walk, `FLEET_FLOOR`, and
 * `battery.mjs`'s member census all keep their meaning untouched.
 *
 * The plane's build has ONE pre-step no member has: `embed:sign` regenerates
 * `src/signpage.mjs` from `tools/sign-release.html`, deterministically. The
 * generated file is COMMITTED and input-hashed like any other source, and the
 * gate closes the loop the input hashes cannot see — a changed
 * `sign-release.html` whose render was never re-run — by comparing the
 * committed module against `renderSignpage()` in memory. Nothing writes. */
export function planeMember(repoRoot = REPO_ROOT) {
  return {
    dir: "bio-plane",
    name: "bio-plane",
    abs: join(repoRoot, "bio-plane"),
    bundle: {
      entry: "src/index.mjs",
      outfile: "dist/bio-plane.bundled.mjs",
      manifest: "dist/bio-plane.bundle.json",
      external: [...DEFAULT_EXTERNAL],
    },
  };
}

/** The three repository-relative paths a guarded member stands on. */
export function memberPaths(member, repoRoot = REPO_ROOT) {
  const rel = (p) => repoPath(repoRoot, join(member.abs, p));
  return {
    marker: rel("fleet-member.json"),
    artifact: member.bundle ? rel(member.bundle.outfile) : null,
    manifest: member.bundle ? rel(member.bundle.manifest) : null,
  };
}

/** D-238, one directory over: say which of the discovered items another checkout
 *  could actually see. The CALLER decides what to do with it — here the gate
 *  measures its floor against the REPRODUCIBLE count, because a floor met by a
 *  phantom is permanently too high and a ratchet that cannot pass is one that
 *  gets switched off. Never called by the build scripts: a build does not need
 *  git, and a build step that failed without it would be a new dependency
 *  nobody asked for. */
export function fleetProvenance(members, { repoRoot = REPO_ROOT, log = console.log } = {}) {
  const prov = readGitProvenance(repoRoot);
  const items = [];
  for (const m of members) {
    const p = memberPaths(m, repoRoot);
    items.push({ path: p.marker, what: `${m.name}'s fleet manifest`, counted: "enrolled the member" });
    if (p.artifact) items.push({ path: p.artifact, what: `${m.name}'s committed artifact`, counted: "guarded as one asset" });
    if (p.manifest) items.push({ path: p.manifest, what: `${m.name}'s bundle manifest`, counted: "the hashes every arm reads" });
  }
  return reportProvenance({ prov, items, instrument: "the fleet bundle guard",
    corpus: `${members.length} fleet member(s)`, log });
}

/** The esbuild options for one member. Exported so the build step and the gate
 *  cannot disagree about the recipe — there is one expression of it. */
export function optionsFor(member) {
  const b = member.bundle;
  return {
    absWorkingDir: member.abs,          /* PINNED — see the header. */
    preserveSymlinks: true,             /* the install LAYOUT never reaches the bytes — see the header. */
    entryPoints: [b.entry],
    outfile: b.outfile,
    bundle: true,
    format: RECIPE.format,
    platform: RECIPE.platform,
    external: [...(b.external || DEFAULT_EXTERNAL)],
    metafile: true,
  };
}

const isVendored = (p) => p.split("/").includes("node_modules");

/** The UPLOAD PARTS a member declares beside its bundle, member-relative.
 *  Absent for every member that is a one-part upload, which is both of the
 *  members that existed before `ocr-worker`. Read through one function so the
 *  build step, the manifest and the gate cannot disagree about what an asset is
 *  — the same rule the recipe itself follows. */
export function assetsOf(member) {
  const a = member && member.bundle ? member.bundle.assets : null;
  return Array.isArray(a) ? a.filter((p) => typeof p === "string" && p) : [];
}

/** Build one member. `write: false` (the default) NEVER touches the tree. */
export async function buildMember(member, { write = false, mutateEntry = null } = {}) {
  const opts = { ...optionsFor(member), write };
  /* The independence proof's hook, and the ONLY way anything mutates a source
     here: an in-memory suffix on the ENTRY's contents. Nothing on disk moves.
     **A CALLER MUST PASS SOMETHING THAT SURVIVES THE BUILD.** esbuild STRIPS
     ordinary comments, so a comment-only suffix produces a BYTE-IDENTICAL bundle
     — measured 2026-09-10, and it is the reason the input-hash arm is not
     redundant with the byte-identity arm but STRICTER than it. */
  if (mutateEntry) {
    opts.plugins = [{
      name: "fl9-mutate-entry",
      setup(b) {
        const entryAbs = join(member.abs, member.bundle.entry);
        b.onLoad({ filter: /\.mjs$/ }, (args) => {
          if (resolve(args.path) !== resolve(entryAbs)) return null;
          return { contents: readFileSync(args.path, "utf8") + mutateEntry, loader: "js" };
        });
      },
    }];
  }
  const res = await build(opts);
  const bytes = write
    ? readFileSync(join(member.abs, member.bundle.outfile))
    : Buffer.from(res.outputFiles[0].contents);
  const inputs = Object.entries(res.metafile.inputs)
    .map(([path, v]) => ({ path, bytes: v.bytes }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return { bytes, sha256: sha256(bytes), inputs, metafile: res.metafile };
}

/** The committed manifest, computed from a build. */
export function manifestFrom(member, built) {
  const hashOf = (rel) => {
    try { return sha256(readFileSync(join(member.abs, rel))); } catch { return null; }
  };
  const first = built.inputs.filter((i) => !isVendored(i.path));
  const vendored = built.inputs.filter((i) => isVendored(i.path));
  const assets = assetsOf(member);
  let lock = null;
  try {
    lock = { path: "package-lock.json", sha256: sha256(readFileSync(join(member.abs, "package-lock.json"))) };
  } catch { /* a member with no dependencies has no lock, and that is legal */ }
  return {
    _comment: "GENERATED by bio-plane/scripts/fleet-bundle.mjs. Do not edit. "
      + "The gate bio-plane/test/fleetbundles.test.mjs asserts every figure here against the tree; "
      + "a stale artifact FAILS instead of shipping (FL-9, BOB 2026-09-10).",
    member: member.name,
    artifact: member.bundle.outfile,
    sha256: built.sha256,
    bytes: built.bytes.length,
    recipe: {
      entry: member.bundle.entry,
      format: RECIPE.format,
      platform: RECIPE.platform,
      external: [...(member.bundle.external || DEFAULT_EXTERNAL)],
      absWorkingDir: "<member directory>",   /* pinned; never an absolute path, which would not travel */
      esbuild: ESBUILD_VERSION,
    },
    /* Paths are as ESBUILD names them, which — with `absWorkingDir` pinned — is
       member-relative and therefore identical in every checkout. THREE of
       `pdf-worker`'s six inputs are `../bio-plane/src/*`, so a change to the
       PLANE stales a fleet member's artifact. That was true before this item and
       written down nowhere (IC-68, finding 3). */
    inputs: first.map((i) => ({ path: i.path, bytes: i.bytes, sha256: hashOf(i.path) })),
    vendoredInputs: vendored.map((i) => ({ path: i.path, bytes: i.bytes, sha256: hashOf(i.path) })),
    /* ---- CPDF-10: THE UPLOAD PARTS A BUNDLE CANNOT SWALLOW ------------------
     *
     * `ocr-worker` is the first member that is NOT a one-part upload, and it is
     * not one for a PLATFORM reason rather than a build one: Workers FORBID
     * runtime wasm compilation, so `tesseract-core.wasm` must arrive as a module
     * the platform compiled at upload time. No bundler makes that one part.
     * Its language model rides the same way so the exact bytes are hashed here
     * rather than fetched at runtime from somewhere nothing pins.
     *
     * Those files are declared as `bundle.external`, which means ESBUILD NEVER
     * SEES THEM and they appear in no `inputs` list — so without this arm the
     * staleness guard would cover every line of the member's source and NONE of
     * the 5.95 MB that actually decides what its output says. A guard with that
     * shape is the FL-9 defect one directory over.
     *
     * THE KEY IS EMITTED ONLY FOR A MEMBER THAT DECLARES ASSETS, so
     * `pdf-worker`'s and `agent-worker`'s committed manifests are byte-unchanged
     * by this addition — asserted in `fleetbundles.test.mjs`, not assumed. An
     * asset a member declares and does not HAVE is `sha256: null`, which
     * `verifyStatic` treats as staleness rather than as an absence to tolerate:
     * unlike a vendored dependency, an upload part is committed, so it is never
     * legitimately missing. */
    ...(assets.length ? { assets: assets.map((rel) => ({
      path: rel,
      bytes: (() => { try { return readFileSync(join(member.abs, rel)).length; } catch { return null; } })(),
      sha256: hashOf(rel),
    })) } : {}),
    lock,
  };
}

/** Write the artifact and its manifest. The ONLY writing path in this module. */
export async function writeMember(member) {
  mkdirSync(join(member.abs, dirname(member.bundle.outfile)), { recursive: true });
  const built = await buildMember(member, { write: true });
  const manifest = manifestFrom(member, built);
  writeFileSync(join(member.abs, member.bundle.manifest), JSON.stringify(manifest, null, 2) + "\n");
  return { built, manifest };
}

/* ------------------------------------------------------------- the specifier
 * scan: "can an installer upload this as ONE part and have it resolve?"
 *
 * Read off the COMMITTED BYTES, never off the build, because the committed bytes
 * are what an installer would ship.
 *
 * **IT SCANS STATIC IMPORT AND EXPORT STATEMENTS, AND THAT FENCE IS DELIBERATE
 * RATHER THAN LEFT UNDONE.** Those are the set a one-part upload must resolve at
 * module INSTANTIATION, which is the property in question. A first draft also
 * matched `import("...")` anywhere in the text and reported `pdf-worker` as
 * unresolvable over a STRING inside pdf.js's dead CDN-wrapper helper — a regex
 * cannot tell code from string content, and a guard that cries wolf gets
 * switched off. The authoritative, PARSER-derived list of everything the output
 * still imports, dynamic imports included, is checked separately in
 * `verifyFresh` from esbuild's own metafile, wherever a fresh build is runnable.
 * Two instruments, each honest about its reach. */
export function unresolvableSpecifiers(text, allowed = DEFAULT_EXTERNAL) {
  const ok = (s) => allowed.some((a) => (a.endsWith("*") ? s.startsWith(a.slice(0, -1)) : s === a));
  const found = new Set();
  const re = /(?:^|[;\n])\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']/g;
  const bare = /(?:^|[;\n])\s*import\s*["']([^"']+)["']/g;
  for (const re2 of [re, bare]) {
    let m;
    while ((m = re2.exec(text))) if (!ok(m[1])) found.add(m[1]);
  }
  return [...found].sort();
}

/* --------------------------------------------------------------- the checks */
/* Every check returns FINDINGS — a finding is a failure, an empty list is a
   pass — and every finding NAMES THE MEMBER, because the item's own acceptance
   says the gate must fail naming the member. */

/** The dependency-free half. Runs on any checkout, with no install at all. */
export function verifyStatic(member) {
  const findings = [];
  const add = (what) => findings.push(`${member.name}: ${what}`);

  if (!member.bundle) {
    add("declares no `bundle` block in fleet-member.json, so nothing guards its artifact. "
      + "Every fleet member commits a guarded bundle (FL-9, BOB 2026-09-10).");
    return { findings, manifest: null, committed: null };
  }

  let manifest;
  try { manifest = JSON.parse(readFileSync(join(member.abs, member.bundle.manifest), "utf8")); }
  catch (e) {
    add(`its committed manifest ${member.bundle.manifest} is missing or unreadable (${e.message}). `
      + `Run \`npm run build\` in ${member.dir}/.`);
    return { findings, manifest: null, committed: null };
  }

  let committed;
  try { committed = readFileSync(join(member.abs, member.bundle.outfile)); }
  catch (e) {
    add(`its committed artifact ${member.bundle.outfile} is missing (${e.message}). `
      + `Run \`npm run build\` in ${member.dir}/.`);
    return { findings, manifest, committed: null };
  }

  /* (a) the artifact is the one the manifest describes */
  const got = sha256(committed);
  if (got !== manifest.sha256)
    add(`the committed artifact does not match its own manifest — `
      + `${member.bundle.outfile} is sha256 ${got}, the manifest says ${manifest.sha256}.`);
  if (committed.length !== manifest.bytes)
    add(`the committed artifact is ${committed.length} B, the manifest says ${manifest.bytes} B.`);

  /* (b) THE ARM THIS ITEM EXISTS FOR — a source moved and the artifact did not.
     Dependency-free, so it fires on every machine including a fresh checkout. */
  for (const inp of manifest.inputs || []) {
    let live;
    try { live = readFileSync(join(member.abs, inp.path)); }
    catch {
      add(`a recorded build input has vanished: ${inp.path}. The committed bundle cannot be `
        + `reproduced, so it is STALE by definition. Run \`npm run build\` in ${member.dir}/.`);
      continue;
    }
    const liveSha = sha256(live);
    if (liveSha !== inp.sha256)
      add(`STALE BUNDLE — the source ${inp.path} has changed since ${member.bundle.outfile} was built `
        + `(source is now sha256 ${liveSha}, the bundle was built from ${inp.sha256}). `
        + `Run \`npm run build\` in ${member.dir}/ and commit the artifact with the change.`);
  }
  if (!Array.isArray(manifest.inputs) || manifest.inputs.length === 0)
    add("its manifest records NO first-party inputs, so the dependency-free staleness arm would "
      + "pass over any source change at all. An empty input list is the emptiest possible green.");

  /* (b2) A VENDORED INPUT THAT IS PRESENT IS CHECKED TOO. Absent, it is not a
     finding — a fresh checkout has no member install and that is the normal
     condition, not a defect. Present and DIFFERENT is staleness exactly like any
     other input, and catching it here rather than only in the byte-identity arm
     means it is caught even when that arm is skipped for some other member. */
  for (const inp of manifest.vendoredInputs || []) {
    let live;
    try { live = readFileSync(join(member.abs, inp.path)); } catch { continue; }
    const liveSha = sha256(live);
    if (liveSha !== inp.sha256)
      add(`STALE BUNDLE — the vendored input ${inp.path} has changed since ${member.bundle.outfile} `
        + `was built (now sha256 ${liveSha}, the bundle was built from ${inp.sha256}). `
        + `Run \`npm run build\` in ${member.dir}/.`);
  }

  /* (b3) CPDF-10 — THE UPLOAD PARTS. Dependency-free like (b), and it is the
     arm that matters most for the member that has them: `ocr-worker`'s stated
     transcription fidelity is a measurement OF the exact wasm core and language
     model bytes it carries, so a model swapped underneath it makes a `cap` in
     the record a claim about something else. THREE conditions, and the third is
     the one an `inputs`-shaped arm would not have:

       - a declared asset that is ABSENT is staleness, not a tolerated gap. An
         upload part is COMMITTED (unlike a vendored dependency, which is
         legitimately missing in a fresh checkout), so absent means the artifact
         cannot be reproduced or installed.
       - a declared asset whose bytes MOVED is staleness in the ordinary way.
       - an asset the member DECLARES and the manifest does not RECORD — the
         asymmetry, and the direction that fails open: a member could otherwise
         gain a part that nothing hashes simply by being rebuilt with an older
         library. The manifest is checked against the member's declaration, not
         only the other way round. */
  const declaredAssets = assetsOf(member);
  const recordedAssets = Array.isArray(manifest.assets) ? manifest.assets : [];
  for (const rel of declaredAssets) {
    const rec = recordedAssets.find((a) => a && a.path === rel);
    if (!rec) {
      add(`it declares the upload asset ${rel} and its committed manifest records NO hash for it, `
        + `so nothing would notice those bytes changing. Run \`npm run build\` in ${member.dir}/.`);
      continue;
    }
    let live = null;
    try { live = readFileSync(join(member.abs, rel)); } catch { /* named below */ }
    if (!live) {
      add(`STALE BUNDLE — the declared upload asset ${rel} is MISSING. An upload part is committed, `
        + `so an absent one means this member cannot be installed or reproduced. `
        + `Restore it and run \`npm run build\` in ${member.dir}/.`);
      continue;
    }
    const liveSha = sha256(live);
    if (liveSha !== rec.sha256)
      add(`STALE BUNDLE — the upload asset ${rel} has changed since ${member.bundle.outfile} was built `
        + `(now sha256 ${liveSha}, the manifest records ${rec.sha256}). This member's stated fidelity `
        + `is a measurement OF these bytes, so a swap here is a claim about something else. `
        + `Re-measure the engine and run \`npm run build\` in ${member.dir}/.`);
    if (rec.bytes != null && live.length !== rec.bytes)
      add(`STALE BUNDLE — the upload asset ${rel} is ${live.length} B, the manifest says ${rec.bytes} B.`);
  }
  for (const rec of recordedAssets)
    if (rec && !declaredAssets.includes(rec.path))
      add(`its committed manifest records an upload asset ${rec.path} the member no longer declares. `
        + `An asset that stops being declared stops being shipped, which is a change nobody stated. `
        + `Run \`npm run build\` in ${member.dir}/.`);

  /* (c) the lock moved without a rebuild */
  let liveLock = null;
  try { liveLock = sha256(readFileSync(join(member.abs, "package-lock.json"))); } catch { /* none */ }
  const recordedLock = manifest.lock ? manifest.lock.sha256 : null;
  if (liveLock !== recordedLock)
    add(`STALE BUNDLE — package-lock.json has changed since the bundle was built `
      + `(lock is now ${liveLock ?? "absent"}, the bundle was built against ${recordedLock ?? "no lock"}). `
      + `Run \`npm run build\` in ${member.dir}/.`);

  /* (d) the recipe the manifest records is the recipe the member declares, and
     the toolchain that built it is the toolchain in the tree. A bundle built by
     an esbuild no longer installed cannot be reproduced, which is staleness. */
  const want = {
    entry: member.bundle.entry,
    format: RECIPE.format,
    platform: RECIPE.platform,
    external: [...(member.bundle.external || DEFAULT_EXTERNAL)],
    absWorkingDir: "<member directory>",
    esbuild: ESBUILD_VERSION,
  };
  for (const k of Object.keys(want)) {
    const a = JSON.stringify(want[k]), b = JSON.stringify((manifest.recipe || {})[k]);
    if (a !== b)
      add(`the committed manifest's recipe.${k} is ${b}, the tree says ${a}. `
        + (k === "esbuild"
          ? "A bundle built by a toolchain that is no longer installed cannot be reproduced. "
          : "")
        + `Run \`npm run build\` in ${member.dir}/.`);
  }

  /* (e) INSTALLABLE WITHOUT BUNDLING — the property `newgroup` needs, asserted
     against the committed bytes rather than against the build. */
  const unresolved = unresolvableSpecifiers(committed.toString("utf8"), manifest.recipe?.external || DEFAULT_EXTERNAL);
  if (unresolved.length)
    add(`its committed artifact still imports ${unresolved.join(", ")}, which a one-part script `
      + "upload cannot resolve — so an installer that cannot bundle could not install it.");

  return { findings, manifest, committed };
}

/** Is the fresh-build arm runnable here? A member with no vendored inputs is
 *  always runnable; one with them needs those bytes present. Named rather than
 *  guessed, so a SKIP says exactly what is absent and what to do. */
export function freshBuildRunnable(member, manifest) {
  const missing = (manifest.vendoredInputs || [])
    .filter((i) => { try { readFileSync(join(member.abs, i.path)); return false; } catch { return true; } })
    .map((i) => i.path);
  return missing.length
    ? { runnable: false, reason: `${missing.length} vendored input(s) are not installed, e.g. ${missing[0]} `
        + `— run \`npm ci\` in ${member.dir}/ to make the byte-identity arm runnable here` }
    : { runnable: true, reason: null };
}

/** The full half: a fresh build of the SOURCE, byte-compared with the artifact
 *  that was read from disk BEFORE this ran. Never writes. */
export async function verifyFresh(member, committed) {
  const built = await buildMember(member, { write: false });
  const findings = [];
  if (Buffer.compare(built.bytes, committed) !== 0)
    findings.push(`${member.name}: STALE BUNDLE — a fresh build of ${member.bundle.entry} is `
      + `${built.bytes.length} B / sha256 ${built.sha256}, the committed ${member.bundle.outfile} is `
      + `${committed.length} B / sha256 ${sha256(committed)}. They must be byte-identical. `
      + `Run \`npm run build\` in ${member.dir}/ and commit the artifact with the change.`);

  /* THE PARSER'S OWN ANSWER to "what does this output still import", which is the
     half a lexical scan of the bytes cannot give honestly — it covers DYNAMIC
     imports too, and it cannot mistake a string for a statement. It is available
     only here, because it comes out of a build. */
  const allowed = member.bundle.external || DEFAULT_EXTERNAL;
  const ok = (s) => allowed.some((a) => (a.endsWith("*") ? s.startsWith(a.slice(0, -1)) : s === a));
  for (const out of Object.values(built.metafile.outputs || {}))
    for (const imp of out.imports || [])
      if (imp.external !== false && !ok(imp.path))
        findings.push(`${member.name}: the built module still imports ${imp.path} (${imp.kind}), `
          + "which a one-part script upload cannot resolve — so an installer that cannot bundle "
          + "could not install it.");
  return { findings, built };
}
