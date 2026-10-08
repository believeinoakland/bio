/* THE FLEET'S BUILD STEP, AND THE GUARD THAT MAKES A COMMITTED ARTIFACT SAFE.
 *
 * ONE implementation of the recipe and ONE implementation of the check. Every
 * member's `scripts/build.mjs` and the plane's `scripts/build-plane.mjs` are thin
 * callers of this, and its verification is read by the fleet gate
 * (`bio-plane/test/system/fleetbundles.test.mjs`), `scripts/bundles.mjs` (R21) and
 * `scripts/release-assemble.mjs` (R22), never re-implemented by any of them. A second copy of a rule is how the next one goes stale in
 * silence — this estate has measured that five times (the note in the retired
 * `scripts/coverage.mjs` on the fleet `control` flag, where the arm written to
 * prove a fix came back GREEN because nothing read the flag any more).
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
 * ---- WHY IT LIVES IN `bio-plane/scripts/` ----------------------------------
 *
 * Because `esbuild` is here. `bio-plane/node_modules` is the only install in the
 * repository that carries it for every member, the repository ROOT has no
 * `node_modules` at all, and `agent-worker` deliberately has no dependencies of
 * its own. A library outside `bio-plane/` could not `import "esbuild"` (the old
 * process's `tools/`, retired in T19, could not, which is why this never lived there). The precedent
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
 * `pdf-worker`), and a fresh checkout has none — there `verifyFresh` says it
 * could not check (bundler R7) and `test/system/fleetbundles.test.mjs` reports a
 * SKIP. **A guard that skips is not a guard**, so the manifest carries the sha256
 * of every INPUT, and the input
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
/* THIS WALK IS GUARDED RATHER THAN NAMED. Found by the census in the old
   `hygiene.test.mjs` (deleted in T20): it went red on this file the first full
   run after it was written, before anyone read the diff, the sixth time that
   ratchet caught a new walk on the day it landed.
   WHY GUARDED AND NOT NAMED: `discoverMembers` walks the REPOSITORY ROOT for
   `fleet-member.json`, which is the second discovery path M0-15 named — a
   manifest enrols a WHOLE DIRECTORY, so it is a larger hole than an untracked
   suite, not a smaller one — and this module's count FEEDS A FLOOR in
   `test/system/fleetbundles.test.mjs`. The named list's own rule says naming is
   defensible for a walk that only REPORTS and much weaker for one whose count
   feeds a ratchet, because a floor set while a phantom was present is
   permanently too high and gets switched off. `fleetProvenance` below is a
   caller of `provenance.mjs`'s one mechanism (bundler R9), never a second
   statement of the rule. */
import { readGitProvenance, reportProvenance, repoPath } from "./provenance.mjs";

export const REPO_ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), "..", ".."));

/* The recipe every member shares. A member's `fleet-member.json` may override
   `entry`, `outfile`, `manifest` and `external`; it may NOT override `format` or
   `platform`, because those two are what make the output a Worker module and a
   member that needed a different answer would not be a fleet member. */
export const RECIPE = Object.freeze({ format: "esm", platform: "neutral" });
export const DEFAULT_EXTERNAL = Object.freeze(["cloudflare:workers", "node:*"]);

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/* The remedy every staleness finding names (N31): the one command that rebuilds
   every bundle a change staled, each by its member's own `npm run build`
   (bundler R21), run from the repository root. One string, so the findings
   cannot drift apart when the command moves again. */
const REBUILD = "Run `node bio-plane/scripts/bundles.mjs` from the repository root, "
  + "which rebuilds every bundle this change staled";

/* ---------------------------------------------------------------- discovery */
/* Members are DISCOVERED by their own marker file (D-117), never hand-listed
   here: a list maintained by hand is a list that silently falls behind the
   thing it lists (bundler R1).

   A member opts INTO a bundle by carrying a `bundle` block. A member without one
   is not a defect and is not silently skipped either — the gate names it, so a
   `bundle` block DELETED is visible rather than being a member that quietly
   stops being guarded.

   A CONTAINER MEMBER (bundler R24; N578, K1601) is the one exception, and it is
   stated by its own marker, never inferred: `"kind": "container"` AND an `image`
   block. Its deliverable is an image, named by digest, not a Worker bundle, so it
   is listed with its kind and its image and is not bundle-guarded for want of
   one. A marker that says `container` and states no image is not a container
   member: it falls through to the ordinary rule and is named as unguarded. A
   container member that DOES declare a `bundle` (the Worker hosting its class,
   T34-74) is guarded like any member.

   A CONTAINER MEMBER WITH MORE THAN ONE CLASS (R25, R27; T36-2, `file-scanner` R10) states its classes as a
   `containers` list, each entry `{class_name, image, max_instances?, bind?}` with its own `image` block, in place of
   the one top-level `image`; `max_instances` and `bind` not stated on a class are read from the member's top level
   (the marker stating them once for every class), and are never defaulted. A `containers` list whose every entry has
   an `image` block is that member's "image block" for R24. */
const isBlock = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const classList = (meta) =>
  (Array.isArray(meta.containers) && meta.containers.length && meta.containers.every((c) => isBlock(c) && isBlock(c.image))
    ? meta.containers : null);

/** R24 read off a marker itself (what `deploy-fleet.mjs` holds): `kind: "container"` and an image block, the top-level
 *  one or a `containers` list whose every entry has one. */
export const markerIsContainer = (meta) => isBlock(meta) && meta.kind === "container" && (isBlock(meta.image) || !!classList(meta));

export function isContainer(member) {
  return !!member && member.kind === "container"
    && (isBlock(member.image) || (Array.isArray(member.containers) && member.containers.length > 0));
}

/** Does the bundle guard (R6, R7, R21, R22) cover this member? Every member but a
 *  container member with no Worker bundle (R24). */
export const isGuarded = (member) => !isContainer(member) || !!member.bundle;

export function discoverMembers(repoRoot = REPO_ROOT) {
  const out = [];
  for (const dir of readdirSync(repoRoot).filter((d) => !d.startsWith("."))) {
    const marker = join(repoRoot, dir, "fleet-member.json");
    let text;
    try { text = readFileSync(marker, "utf8"); }
    catch (e) {
      if (e.code === "ENOENT" || e.code === "ENOTDIR") continue;   /* not a member */
      throw e;
    }
    /* A marker that does not parse is an error, never a member that silently
       stops being guarded. */
    let meta;
    try { meta = JSON.parse(text); }
    catch (e) { throw new Error(`fleet member marker ${marker} is not valid JSON: ${e.message}`); }
    const container = meta.kind === "container";
    const image = container && isBlock(meta.image) ? meta.image : null;
    const classes = container ? classList(meta) : null;
    out.push({
      dir,
      name: meta.name || dir,
      abs: join(repoRoot, dir),
      entry: meta.entry || (meta.bundle && meta.bundle.entry) || null,
      bundle: meta.bundle || null,
      kind: typeof meta.kind === "string" && meta.kind ? meta.kind : "worker",
      image,
      /* R24: a member with several classes is listed with each class's name and image. */
      ...(classes ? { containers: classes.map((c) => ({ class_name: c.class_name ?? null, image: c.image })) } : {}),
      marker: meta,
    });
  }
  /* Code-point order, then the directory: the same list on every machine and
     locale, whatever order the file system walks in. */
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  return out.sort((a, b) => cmp(a.name, b.name) || cmp(a.dir, b.dir));
}

/* ---- THE PLANE ITSELF, GUARDED BY THE SAME LIBRARY (FL-10, D-298) ----------
 *
 * DIST measured the MIRROR of FL-9's defect: `dist/bio-plane.bundled.mjs` was
 * 114 commits stale against `src` and the tests could not tell — a test of the
 * artifact proves it WORKS, never that it MATCHES its source.
 *
 * The plane is DELIBERATELY NOT a `fleet-member.json` member: that marker
 * makes a directory a fleet member, and a fleet member holds no store binding
 * (each member's own tests hold it to that), which the plane necessarily
 * violates — it IS the store. So the plane arrives as an exported descriptor
 * with the same `bundle` shape, consumed by the gate and by
 * `scripts/build-plane.mjs`, and `discoverMembers`' walk and the fleet gate's
 * `GUARDED_FLOOR` keep their meaning untouched.
 *
 * The plane's build has ONE pre-step no member has: `embed:sign` regenerates
 * `src/signpage.mjs` from `src/sign-release.html` (K33), deterministically. The
 * generated file is COMMITTED and input-hashed like any other source, and the
 * gate closes the loop the input hashes cannot see — a changed
 * `sign-release.html` whose render was never re-run — by comparing the
 * committed module against `renderSignpage()` in memory. Nothing writes.
 *
 * The entry is the plane's own Worker entry, `src/plane/index.mjs` (plane R6),
 * the same file `wrangler.jsonc`'s `main` names, so the bundle and a wrangler
 * deploy start from one module (T20, K846). */
const PLANE_ENTRY = "src/plane/index.mjs";
export function planeMember(repoRoot = REPO_ROOT) {
  return {
    dir: "bio-plane",
    name: "bio-plane",
    abs: join(repoRoot, "bio-plane"),
    entry: PLANE_ENTRY,
    bundle: {
      entry: PLANE_ENTRY,
      outfile: "dist/bio-plane.bundled.mjs",
      manifest: "dist/bio-plane.bundle.json",
      external: [...DEFAULT_EXTERNAL],
    },
  };
}

/* ---- A CONTAINER MEMBER'S DESCRIPTOR (bundler R25; N610, K1678 (1)) ----------
 *
 * The one part a container member carries beyond its Worker bundle: what the
 * installer needs to create (or roll out) the Containers application and bind its
 * class into the members that call it. It is COPIED from the member's own marker,
 * never defaulted (IC-82's copy-never-default condition, one part over), so a
 * field the marker does not state is a refusal naming that field. The image is
 * named only by digest, in agent-runner R7's own form, because an install that
 * names a tag installs whatever the tag points at that day. */
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const REPOSITORY = /^[a-z0-9.-]+(:[0-9]+)?\/[a-z0-9._/-]+$/;
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** `<repository>@sha256:<64 hex>` from a container member's `image` block, or
 *  `{missing}` naming the first field that does not say it. Shared by the release
 *  (R25) and the deploy (R26), so the two cannot name the image differently. */
export function imageReference(image) {
  if (!image || typeof image !== "object") return { missing: "image" };
  if (typeof image.repository !== "string" || !REPOSITORY.test(image.repository) || image.repository.includes("@"))
    return { missing: "image.repository" };
  if (typeof image.digest !== "string" || !DIGEST.test(image.digest)) return { missing: "image.digest" };
  return { reference: `${image.repository}@${image.digest}` };
}

/* ---- THE NPM PACKAGES A LOCKFILE INSTALLS (bundler R27, R28 (a); F20, F21) ----
 *
 * Read off the lockfile npm itself installs from, so the list is the install's
 * without running it: every entry under `packages` whose key is a `node_modules/`
 * path and that is not marked `dev`, one per installed copy (a nested copy is a
 * second entry). The name is the entry's own `name` where npm records one (an
 * alias), else the path's last package segment. A lockfile that is not npm 7+'s
 * shape (no `packages` map) is unread, never an empty list. */
const packageOfPath = (key) => {
  const seg = key.split("node_modules/").pop().split("/");
  return seg[0].startsWith("@") ? `${seg[0]}/${seg[1]}` : seg[0];
};
const byNameVersion = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.version < b.version ? -1 : a.version > b.version ? 1 : 0);

/** `{packages: [{name, version}]}` sorted by name then version, or `{unread}` naming the file, or the package
 *  with no version. Never throws. */
export function npmProductionPackages(lockPath, label = lockPath) {
  let lock;
  try { lock = JSON.parse(readFileSync(lockPath, "utf8")); }
  catch (e) { return { unread: `${label} ${e.code === "ENOENT" ? "is missing" : "does not parse"}` }; }
  if (!lock || typeof lock.packages !== "object" || lock.packages === null || Array.isArray(lock.packages))
    return { unread: `${label} does not parse: it has no \`packages\` map (npm 7 or later writes one)` };
  const packages = [];
  for (const [key, entry] of Object.entries(lock.packages)) {
    if (!key.includes("node_modules/") || !entry || typeof entry !== "object" || entry.dev === true) continue;
    const name = typeof entry.name === "string" && entry.name ? entry.name : packageOfPath(key);
    if (typeof entry.version !== "string" || !entry.version)
      return { unread: `${label} names the installed package ${name} (${key}) without a version` };
    packages.push({ name, version: entry.version });
  }
  return { packages: packages.sort(byNameVersion) };
}

/** R27: a container member's image packages, from its own `package-lock.json` (the file its image's `npm ci
 *  --omit=dev` installs from). */
export const containerPackages = (member) =>
  npmProductionPackages(join(member.abs, "package-lock.json"), `${member.dir}/package-lock.json`);

/* ---- AN IMAGE WHOSE PACKAGES ARE NOT NPM'S (bundler R27, R28 (b); T36-2, rev. 2 §2 R10) ----
 *
 * `file-scanner`'s images install ClamAV, LibreOffice and Poppler from their base's system packages, which no
 * lockfile names. So the member commits a PACKAGE STATEMENT for each such image and names it in the class's
 * `image.packages` (member-relative):
 *
 *   { "ecosystem": "Debian:12",                      the OSV ecosystem its packages belong to (R28, R29)
 *     "base": { "repository": "…", "digest": "sha256:<64 hex>" },   the base image it was taken against
 *     "packages": [ { "name": "clamav", "version": "1.4.3+dfsg-1" }, … ] }
 *
 * The statement is pinned with its base: a base digest other than the one the marker pins (`image.base.digest`)
 * describes some other image, so it is unread, never believed. A class with no `image.packages` installs from npm,
 * and its list is the member's `package-lock.json`'s, as before. */
const STATEMENT_ECOSYSTEM = /^[A-Za-z][A-Za-z0-9.+:_ -]*$/;

/** `{ecosystem, packages: [{name, version}]}` sorted by name then version, or `{unread}` naming the file, the package
 *  or the digest. Never throws. */
export function statementPackages(path, label, baseDigest) {
  let st;
  try { st = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { return { unread: `${label} ${e.code === "ENOENT" ? "is missing" : "does not parse"}` }; }
  if (!isBlock(st)) return { unread: `${label} does not parse: it is not a JSON object` };
  if (typeof st.ecosystem !== "string" || !STATEMENT_ECOSYSTEM.test(st.ecosystem))
    return { unread: `${label} does not parse: it names no ecosystem` };
  if (!Array.isArray(st.packages)) return { unread: `${label} does not parse: it has no \`packages\` list` };
  const digest = isBlock(st.base) ? st.base.digest : undefined;
  if (typeof digest !== "string" || !DIGEST.test(digest))
    return { unread: `${label} names no base image digest (\`base.digest\`, sha256:<64 hex>)` };
  if (digest !== baseDigest)
    return { unread: `${label} was taken against the base ${digest}, not the base the marker pins (${baseDigest ?? "none"})` };
  const packages = [];
  for (const p of st.packages) {
    const name = isBlock(p) && typeof p.name === "string" && p.name ? p.name : null;
    if (!name) return { unread: `${label} names a package with no name: ${JSON.stringify(p)}` };
    if (typeof p.version !== "string" || !p.version) return { unread: `${label} names the package ${name} without a version` };
    packages.push({ name, version: p.version });
  }
  return { ecosystem: st.ecosystem, packages: packages.sort(byNameVersion) };
}

/** A container member's classes, each as the part describes it: one entry per class, `{class_name, image,
 *  max_instances, bind}` with `max_instances` and `bind` taken from the class, else from the member's top level.
 *  One class (the top-level `image` form, or a `containers` list of one) or several. `multi` is true only for more
 *  than one. `conflict` names a marker that states both forms. */
export function containerClasses(member) {
  const meta = (member && member.marker) || {};
  const list = classList(meta);
  if (!list) return { classes: [{ class_name: meta.class_name, image: meta.image, max_instances: meta.max_instances, bind: meta.bind }], multi: false };
  const conflict = isBlock(meta.image) ? "image (a top-level image beside a `containers` list)" : null;
  return {
    classes: list.map((c) => ({ class_name: c.class_name, image: c.image,
      max_instances: c.max_instances !== undefined ? c.max_instances : meta.max_instances,
      bind: c.bind !== undefined ? c.bind : meta.bind })),
    multi: list.length > 1, conflict,
  };
}

/** R27: one class's image packages, `{ecosystem, packages}` or `{unread}`: its package statement where the class names
 *  one, else the member's npm lockfile. */
export function classPackages(member, cls) {
  const img = isBlock(cls && cls.image) ? cls.image : {};
  if (img.packages === undefined) {
    const r = containerPackages(member);
    return r.unread ? r : { ecosystem: "npm", packages: r.packages };
  }
  if (typeof img.packages !== "string" || !img.packages || img.packages.startsWith("/") || img.packages.split("/").includes(".."))
    return { unread: `${member.dir}/fleet-member.json names no package statement for ${cls.class_name} as a member-relative path` };
  const base = isBlock(img.base) && typeof img.base.digest === "string" ? img.base.digest : null;
  return statementPackages(join(member.abs, img.packages), `${member.dir}/${img.packages}`, base);
}

/** One class's descriptor, or the fields it lacks. */
function classDescriptor(cls, memberNames, packages) {
  const missing = [];
  const img = imageReference(cls.image);
  if (img.missing) missing.push(img.missing);
  const policy = cls.image && cls.image.schedulingPolicy;
  if (policy !== undefined && policy !== "default") missing.push("image.schedulingPolicy");
  if (typeof cls.class_name !== "string" || !IDENTIFIER.test(cls.class_name)) missing.push("class_name");
  if (!Number.isInteger(cls.max_instances) || cls.max_instances < 1) missing.push("max_instances");
  const bindOk = Array.isArray(cls.bind) && cls.bind.length > 0 && cls.bind.every((b) =>
    b && typeof b === "object" && typeof b.member === "string" && memberNames.includes(b.member)
    && typeof b.binding === "string" && IDENTIFIER.test(b.binding));
  if (!bindOk) missing.push("bind");
  if (missing.length) return { missing };
  const descriptor = {
    class_name: cls.class_name,
    image: img.reference,
    scheduling_policy: "default",
    max_instances: cls.max_instances,
    bind: cls.bind.map((b) => ({ member: b.member, binding: b.binding })),
    ...(packages ? { packages: packages.map((p) => ({ name: p.name, version: p.version })) } : {}),
  };
  return { descriptor, bytes: Buffer.from(JSON.stringify(descriptor, null, 2) + "\n") };
}

/** The `container.json` part for a one-class container member (its top-level marker): `{descriptor, bytes}`, or
 *  `{missing: [field, …]}` naming every field the marker does not state in the form the part needs. `memberNames`
 *  are the fleet's members, which `bind` must name. `packages`, where given, is R27's list, written as the part's
 *  last field; the others are unchanged by it. */
export function containerDescriptor(member, memberNames = [], { packages = null } = {}) {
  const meta = (member && member.marker) || {};
  const d = classDescriptor({ class_name: meta.class_name, image: meta.image, max_instances: meta.max_instances, bind: meta.bind },
    memberNames, packages);
  if (!member || !member.bundle) return { missing: ["bundle", ...(d.missing || [])] };
  return d;
}

/** R25, R27: every `Container` part a container member carries, one per class: `{parts: [{path, class_name,
 *  descriptor, bytes}]}`. One class is `container.json`, as before; with several, each class is
 *  `container/<class_name>.json`. Refusals, in the order the release checks them: `{missing: [field, …], class?}`
 *  (R25, the class named when there are several), then `{unread}` (R27). Each class's packages are `classPackages`';
 *  `packages: false` leaves them out. */
export function containerParts(member, memberNames = [], { packages = true } = {}) {
  const { classes, multi, conflict } = containerClasses(member);
  if (!member || !member.bundle) return { missing: ["bundle"] };
  if (conflict) return { missing: [conflict] };
  const seen = new Set();
  for (const cls of classes) {
    const d = classDescriptor(cls, memberNames, null);
    if (d.missing) return multi ? { missing: d.missing, class: typeof cls.class_name === "string" && cls.class_name ? cls.class_name : "(unnamed)" } : { missing: d.missing };
    if (seen.has(cls.class_name)) return { missing: ["class_name"], class: cls.class_name };
    seen.add(cls.class_name);
  }
  const parts = [];
  for (const cls of classes) {
    let pk = null;
    if (packages) {
      const r = classPackages(member, cls);
      if (r.unread) return { unread: r.unread };
      pk = r.packages;
    }
    const d = classDescriptor(cls, memberNames, pk);
    parts.push({ path: multi ? `container/${cls.class_name}.json` : "container.json", class_name: cls.class_name,
      descriptor: d.descriptor, bytes: d.bytes });
  }
  return { parts };
}

/* ---- A MEMBER'S OWN BUCKETS AND SCHEDULE (bundler R25; N772, K2155) -----------
 *
 * The fleet statement's `services` carry a member's service bindings and nothing else, so a member that binds an R2
 * bucket or states a cron (`file-scanner`'s `CAPTURES` and its daily refresh; the readers' `CAPTURES`) carries one more
 * part, type `Worker`, at `worker.json`: `{r2_buckets: [{binding, bucket}], crons}`, copied from the member's own
 * `wrangler.jsonc` and never defaulted. A bucket is named by its ROLE, never by the account's bucket name, so the
 * installer binds the copy's own bucket of that role and a later per-copy name needs no new release. The roles are the
 * plane's two buckets, as this project's configs name them; any other bucket is refused by its binding. The statement's
 * format is unchanged: the part rides `parts=` like every other. */
export const WORKER_PART_PATH = "worker.json";
export const BUCKET_ROLES = Object.freeze({ "bio-captures": "captures", "bio-published": "published" });

/** A member's `Worker` part from its parsed `wrangler.jsonc`: `{part: null}` when it binds no bucket and states no
 *  cron; `{part: {descriptor, bytes}}`; or `{missing: [what, …]}` naming each binding whose bucket has no role (by its
 *  binding name) and each list that is not one (`r2_buckets`, `triggers.crons`). Never throws. */
export function workerPart(cfg) {
  const c = isBlock(cfg) ? cfg : {};
  const missing = [];
  const r2 = c.r2_buckets === undefined ? [] : c.r2_buckets;
  if (!Array.isArray(r2)) missing.push("r2_buckets");
  const buckets = [];
  for (const b of Array.isArray(r2) ? r2 : []) {
    const binding = isBlock(b) && typeof b.binding === "string" && b.binding ? b.binding : null;
    const role = binding && typeof b.bucket_name === "string" && Object.hasOwn(BUCKET_ROLES, b.bucket_name) ? BUCKET_ROLES[b.bucket_name] : null;
    if (!role) { missing.push(binding || "(an R2 bucket binding with no name)"); continue; }
    buckets.push({ binding, bucket: role });
  }
  const triggers = c.triggers === undefined ? {} : c.triggers;
  const crons = isBlock(triggers) && triggers.crons !== undefined ? triggers.crons : (isBlock(triggers) ? [] : null);
  if (!Array.isArray(crons) || !crons.every((x) => typeof x === "string" && x.trim()))
    missing.push("triggers.crons");
  if (missing.length) return { missing };
  if (!buckets.length && !crons.length) return { part: null };
  const descriptor = { r2_buckets: buckets, crons: [...crons] };
  return { part: { descriptor, bytes: Buffer.from(JSON.stringify(descriptor, null, 2) + "\n") } };
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
  /* Silent: a failure arrives as the thrown error, never as stray stderr. */
  const opts = { ...optionsFor(member), write, logLevel: "silent" };
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
      + "The gate bio-plane/test/system/fleetbundles.test.mjs asserts every figure here against the tree; "
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
/** Is `specifier` one of the `allowed` externals? A trailing `*` is a prefix. */
const isAllowed = (allowed, specifier) =>
  allowed.some((a) => (a.endsWith("*") ? specifier.startsWith(a.slice(0, -1)) : specifier === a));

export function unresolvableSpecifiers(text, allowed = DEFAULT_EXTERNAL) {
  const ok = (s) => isAllowed(allowed, s);
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

  /* R24: a container member with no Worker bundle has no artifact to be stale. It
     is listed, and `guarded: false` says so, so no caller reads it as checked. */
  if (!isGuarded(member)) return { findings, manifest: null, committed: null, guarded: false };

  if (!member.bundle) {
    add("declares no `bundle` block in fleet-member.json, so nothing guards its artifact. "
      + "Every fleet member commits a guarded bundle (FL-9, BOB 2026-09-10).");
    return { findings, manifest: null, committed: null };
  }

  let manifest;
  try { manifest = JSON.parse(readFileSync(join(member.abs, member.bundle.manifest), "utf8")); }
  catch (e) {
    add(`its committed manifest ${member.bundle.manifest} is missing or unreadable (${e.message}). `
      + `${REBUILD}.`);
    return { findings, manifest: null, committed: null };
  }

  let committed;
  try { committed = readFileSync(join(member.abs, member.bundle.outfile)); }
  catch (e) {
    add(`its committed artifact ${member.bundle.outfile} is missing (${e.message}). `
      + `${REBUILD}.`);
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
        + `reproduced, so it is STALE by definition. ${REBUILD}.`);
      continue;
    }
    const liveSha = sha256(live);
    if (liveSha !== inp.sha256)
      add(`STALE BUNDLE — the source ${inp.path} has changed since ${member.bundle.outfile} was built `
        + `(source is now sha256 ${liveSha}, the bundle was built from ${inp.sha256}). `
        + `${REBUILD}, and commit the artifacts with the change.`);
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
        + `${REBUILD}.`);
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
        + `so nothing would notice those bytes changing. ${REBUILD}.`);
      continue;
    }
    let live = null;
    try { live = readFileSync(join(member.abs, rel)); } catch { /* named below */ }
    if (!live) {
      add(`STALE BUNDLE — the declared upload asset ${rel} is MISSING. An upload part is committed, `
        + `so an absent one means this member cannot be installed or reproduced. `
        + `Restore it. ${REBUILD}.`);
      continue;
    }
    const liveSha = sha256(live);
    if (liveSha !== rec.sha256)
      add(`STALE BUNDLE — the upload asset ${rel} has changed since ${member.bundle.outfile} was built `
        + `(now sha256 ${liveSha}, the manifest records ${rec.sha256}). This member's stated fidelity `
        + `is a measurement OF these bytes, so a swap here is a claim about something else. `
        + `Re-measure the engine. ${REBUILD}.`);
    if (rec.bytes != null && live.length !== rec.bytes)
      add(`STALE BUNDLE — the upload asset ${rel} is ${live.length} B, the manifest says ${rec.bytes} B.`);
  }
  for (const rec of recordedAssets)
    if (rec && !declaredAssets.includes(rec.path))
      add(`its committed manifest records an upload asset ${rec.path} the member no longer declares. `
        + `An asset that stops being declared stops being shipped, which is a change nobody stated. `
        + `${REBUILD}.`);

  /* (c) the lock moved without a rebuild */
  let liveLock = null;
  try { liveLock = sha256(readFileSync(join(member.abs, "package-lock.json"))); } catch { /* none */ }
  const recordedLock = manifest.lock ? manifest.lock.sha256 : null;
  if (liveLock !== recordedLock)
    add(`STALE BUNDLE — package-lock.json has changed since the bundle was built `
      + `(lock is now ${liveLock ?? "absent"}, the bundle was built against ${recordedLock ?? "no lock"}). `
      + `${REBUILD}.`);

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
        + `${REBUILD}.`);
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
 *  that was read from disk BEFORE this ran. Never writes.
 *
 *  Returns `{ checked: true, findings, built }`, or, where the member's committed
 *  manifest names vendored inputs that are not installed here or the source
 *  does not build here, `{ checked: false, reason, findings: null, built: null }`: it could not check,
 *  and there is no empty list of findings a caller could read as fresh. */
export async function verifyFresh(member, committed) {
  /* R24: nothing to rebuild, and that is neither stale nor fresh. */
  if (!isGuarded(member))
    return { checked: false, guarded: false, findings: null, built: null,
      reason: `${member.name}: not checked — a container member with no Worker bundle is not bundle-guarded (bundler R24)` };
  let manifest = null;
  try { manifest = JSON.parse(readFileSync(join(member.abs, member.bundle.manifest), "utf8")); }
  catch { /* no manifest to read: the build itself is the test of what is installed */ }
  if (manifest) {
    const { runnable, reason } = freshBuildRunnable(member, manifest);
    if (!runnable) return { checked: false, reason: `${member.name}: not checked — ${reason}`, findings: null, built: null };
  }
  let built;
  try { built = await buildMember(member, { write: false }); }
  catch (e) {
    /* A source that does not build here (a dependency not installed, with no
       manifest to say so first) is not a fresh artifact: say it was not checked. */
    return { checked: false, reason: `${member.name}: not checked — a fresh build of ${member.bundle.entry} `
      + `failed here: ${String(e.message).split("\n").slice(0, 2).join(" ")}`, findings: null, built: null };
  }
  const findings = [];
  if (Buffer.compare(built.bytes, committed) !== 0)
    findings.push(`${member.name}: STALE BUNDLE — a fresh build of ${member.bundle.entry} is `
      + `${built.bytes.length} B / sha256 ${built.sha256}, the committed ${member.bundle.outfile} is `
      + `${committed.length} B / sha256 ${sha256(committed)}. They must be byte-identical. `
      + `${REBUILD}, and commit the artifacts with the change.`);

  /* THE PARSER'S OWN ANSWER to "what does this output still import", which is the
     half a lexical scan of the bytes cannot give honestly — it covers DYNAMIC
     imports too, and it cannot mistake a string for a statement. It is available
     only here, because it comes out of a build. */
  const allowed = member.bundle.external || DEFAULT_EXTERNAL;
  for (const out of Object.values(built.metafile.outputs || {}))
    for (const imp of out.imports || [])
      if (imp.external !== false && !isAllowed(allowed, imp.path))
        findings.push(`${member.name}: the built module still imports ${imp.path} (${imp.kind}), `
          + "which a one-part script upload cannot resolve — so an installer that cannot bundle "
          + "could not install it.");
  return { checked: true, findings, built };
}
