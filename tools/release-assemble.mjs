#!/usr/bin/env node
/* Assemble a release that carries the WHOLE FLEET, and refuse to assemble one
 * that cannot be believed.
 *
 * ---- WHAT THIS EXISTS TO PREVENT, MEASURED ---------------------------------
 *
 * `release/RELEASE.json` carried ONE asset (the plane) with one sha256 and one
 * signature, and `newgroup` installs only what the release names — so a group
 * got a plane and no fleet, which is D-115's "an instance quietly doing less".
 * The obvious fix is a `fleet` array. On 2026-09-10 that obvious fix was
 * measured and IT WOULD HAVE SHIPPED A LIE:
 *
 *   the released plane asset was cut 2026-08-05 (da67aa4d…)
 *   bio-plane/src had moved 114 commits / +19,027 lines since
 *   THREE of pdf-worker's six build inputs LIVE IN bio-plane/src (FL-9's finding)
 *   all three hashed EQUAL to the tree, so the member bundle was fresh
 *
 * A `fleet` array added then would have published, inside ONE signed release,
 * `pdfstructure.mjs` as of today (inside pdf-worker) and as of a month earlier
 * (inside the plane). One release, two versions of the same source, one
 * signature over all of it. That is D-298, and it is the reason this file is a
 * gate and not a serialiser.
 *
 * ---- THE THREE REFUSALS ----------------------------------------------------
 *
 *  1. EVERY ASSET IS PROVED FRESH, by FL-9/FL-10's guard rather than by a
 *     second implementation of it (D-112: one path, no drift). `verifyFresh`
 *     builds each member from source with write:false and byte-compares against
 *     the artifact read from disk BEFORE the build. A stale artifact REFUSES.
 *     It also answers, from the build's own metafile, whether the output still
 *     imports anything a one-part script upload cannot resolve — which is
 *     precisely the installer's constraint, so the guard that protects the
 *     repository is the same one that protects the install.
 *
 *  2. THE SIGNATURE COVERS THE SET, NOT EACH FILE. One signature per asset
 *     would let anyone who can serve the manifest DROP a member: every
 *     remaining signature still verifies, and the installer silently installs
 *     less. So `fleetSig` signs a canonical payload naming the plane AND every
 *     member together. Removing a member, swapping one, or pairing this fleet
 *     with a different plane all invalidate it.
 *
 *  3. THE PLANE LINE IS IN THAT PAYLOAD ON PURPOSE. It is what makes the
 *     signature say "these members were built against THIS plane", which is the
 *     exact claim D-298 found unbacked.
 *
 * ---- BACKWARD COMPATIBILITY, AND WHY IT IS ADDITIVE ------------------------
 *
 * `version`, `sha256`, `asset`, `sig` and `signer` KEEP their present meaning:
 * `sig` is still an SSHSIG over the PLANE ASSET BYTES in namespace
 * `bio-release`. Every installer already deployed keeps working unchanged. The
 * fleet arrives as two NEW keys (`fleet`, `fleetSig`) that an older installer
 * ignores. Re-pointing `sig` at a combined manifest was the tidier design and
 * was rejected: it would make every installed copy fail verification and fall
 * back to its built-in release — safe, but it freezes every existing install
 * silently, and silence is the failure mode this project keeps paying for.
 *
 * An installer that finds NO `fleet` key installs the plane and MUST SAY SO
 * (D-106's class). It must never treat absence as "no members exist".
 *
 * NEGATIVE CONTROL: RUN 2026-09-10, five arms, every refusal DRIVEN rather than
 * described, and every on-disk arm restored BYTE-IDENTICALLY (verified by hash
 * after each) —
 *   (a) GUARD_CANNOT_RUN — with pdf-worker/node_modules absent, the byte arm
 *       cannot run and assembly REFUSES rather than skipping the guard on an
 *       artifact it is about to sign. Found on this tool's first run, not
 *       contrived.
 *   (b) STALE_OR_UNINSTALLABLE — 13 bytes appended to the committed
 *       agent-worker artifact; refused, naming both hashes and both lengths
 *       (48,405 committed vs 48,392 fresh) and the command that fixes it.
 *   (c) VERSION_DISAGREES — `--version 0.57.0` against sources reading 0.56.0
 *       is refused, so the flag cannot fake a bump the tree has not made.
 *   (d) VERSION_ALREADY_RELEASED — the live state of this tree: every source
 *       reads 0.56.0 while the plane artifact is FL-10's rebuild, so assembly
 *       refuses to publish a second, different 0.56.0. THIS ARM WROTE THE
 *       REFUSAL: the check did not exist until the first dry-run reported
 *       "a release cut now would carry 3 assets at 0.56.0" and that sentence
 *       was false in a way no other check could see.
 *   (e) PLANE_SIG_DOES_NOT_COVER_ASSET — sources temporarily bumped to 0.57.0
 *       to get past (d), then assembled without --sign: stock ssh-keygen says
 *       "Signature verification failed: incorrect signature" and assembly
 *       refuses. This one was a printed NOTE first, which is not a gate.
 *   FLEET_SIG_REJECTED is the same `verifyWith` call as (e) with a different
 *   namespace and payload, and is NOT separately driven — stated rather than
 *   claimed.
 * NEGATIVE CONTROL, SECOND PASS: RUN 2026-09-12, when `ocr-worker` arrived with
 * upload parts (CPDF-10 / IC-78) — (g) MEMBER_PART_MISSING, the declared
 * `assets/eng.traineddata` moved aside: refused, because releasing without a
 * declared part publishes a member that cannot run while the manifest says it
 * is complete; (h) MEMBER_PART_DISAGREES, one byte appended to that model:
 * refused, naming both hashes — the engine or model changing underneath a
 * member is staleness exactly as a changed source is, and CPDF-15's measured
 * fidelity is a fidelity of THOSE EXACT BYTES. Both restored byte-identically,
 * verified by hash. MEMBER_PART_UNHASHED (a manifest with no hash for a
 * declared part) is NOT driven — it requires hand-editing a generated manifest,
 * and it is stated rather than claimed.
 *
 * usage:
 *   node tools/release-assemble.mjs --dry-run
 *   node tools/release-assemble.mjs --version 0.57.0 --emit-payload <file>
 *   node tools/release-assemble.mjs --version 0.57.0 --sign
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import {
  REPO_ROOT, discoverMembers, planeMember, verifyFresh, freshBuildRunnable, sha256,
} from "../bio-plane/scripts/fleet-bundle.mjs";
/* The statement and its namespace come from the module the INSTALLER also
   imports. Neither side builds the bytes it signs or verifies — see the comment
   on `fleetStatement`. This file defined its own copy for exactly one commit. */
import { NS_FLEET, fleetStatement } from "../bio-plane/src/sshsig.mjs";
import { parseJsonc } from "./jsonc.mjs";
import { resolveVersion } from "../bio-plane/scripts/resolve-version.mjs";
import { signSshsig } from "./sign-sshsig.mjs";

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i === -1 ? null : (argv[i + 1] ?? ""); };
const DRY = argv.includes("--dry-run");
const SIGN = argv.includes("--sign");
const EMIT = flag("--emit-payload");

const RELEASE_DIR = join(REPO_ROOT, "release");

const die = (code, msg, detail) => {
  console.error(`REFUSED [${code}]: ${msg}`);
  if (detail) console.error(detail);
  process.exit(1);
};

/* ---------------------------------------------------------------- the assets */

const plane = planeMember();
const members = discoverMembers().filter((m) => m.bundle);
const all = [plane, ...members];

function committedArtifact(m) {
  const p = join(m.abs, m.bundle.outfile);
  if (!existsSync(p)) die("NO_ARTIFACT", `${m.name} has no committed ${m.bundle.outfile}.`,
    `Run \`npm run build\` in ${m.dir}/ and commit the artifact.`);
  return readFileSync(p);                      // read BEFORE any build runs
}

console.log("assets discovered:");
for (const m of all) console.log(`   ${m.name.padEnd(14)} ${m.bundle.outfile}`);

/* ---- REFUSAL 1: every asset proved fresh, by the landed guard -------------- */

const entries = [];
for (const m of all) {
  const committed = committedArtifact(m);
  const manifestPath = join(m.abs, m.bundle.manifest);
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;
  if (!manifest) die("NO_MANIFEST", `${m.name} has no ${m.bundle.manifest}.`,
    "The bundle manifest carries the input hashes the guard reads. Rebuild the member.");

  const runnable = freshBuildRunnable(m, manifest);
  if (!runnable.runnable) {
    /* A GUARD THAT SKIPS IS NOT A GUARD — FL-9's own words, and a release is the
       last place to accept one. The battery may legitimately skip this arm; an
       assembler may not, because the artifact is about to be SIGNED. */
    die("GUARD_CANNOT_RUN",
      `${m.name}: the byte-identity arm cannot run here, and a release will not be assembled on a skipped guard.`,
      runnable.reason);
  }

  const { findings, built } = await verifyFresh(m, committed);
  if (findings.length) {
    die("STALE_OR_UNINSTALLABLE", `${m.name} did not pass the fleet build guard.`,
      findings.map((f) => "  - " + f).join("\n"));
  }
  if (sha256(committed) !== manifest.sha256) {
    die("MANIFEST_DISAGREES", `${m.name}: ${m.bundle.manifest} records ${manifest.sha256.slice(0, 16)}… `
      + `but the artifact hashes ${sha256(committed).slice(0, 16)}….`,
      "The manifest and the artifact must be written by the same build.");
  }
  /* The member's DECLARED service bindings, taken from its own config and
     carried into the signed statement exactly as written — phantom and all.
     The installer substitutes the instance slug at upload, so the slug is never
     a value that arrived over the network. */
  const wrangler = join(m.abs, "wrangler.jsonc");
  const wcfg = existsSync(wrangler)
    ? parseJsonc(readFileSync(wrangler, "utf8"), `${m.name}/wrangler.jsonc`)
    : null;
  const services = (wcfg?.services || []).map((s) => ({ binding: s.binding, service: s.service }));
  /* IC-82, under FLEET's copy-never-default condition: the member's UPLOAD
     FACTS are COPIED from its own config at cut time, and a member whose
     config does not state them REFUSES assembly — a default supplied here is
     the installer-guessing defect one layer up, wearing the signature it
     should have been refused by. An ABSENT flags key is wrangler's own
     spelling of the empty list (ocr-worker's deliberate, commented state) and
     is copied as the stated []; an absent compatibility_date is the gap. */
  let compat = null;
  if (m.name !== "bio-plane") {
    if (!wcfg || typeof wcfg.compatibility_date !== "string" || !wcfg.compatibility_date) {
      die("MEMBER_COMPAT_UNSTATED",
        `${m.name}'s wrangler.jsonc states no compatibility_date, and IC-82 forbids defaulting one.`,
        "The manifest COPIES upload facts from the member's own config. State the date there\n"
        + "(FLEET's file, FLEET's truth), then assemble again.");
    }
    compat = { date: wcfg.compatibility_date, flags: wcfg.compatibility_flags || [] };
  }
  /* Each part's module type, from the member's own `rules` — the very rules
     3607b5c had to fix. A part no rule covers refuses; extension inference is
     the defect IC-82 exists to keep out of group accounts. */
  const globToRe = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "(?:.*/)?").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$");
  const typeOfPart = (rel) => {
    for (const r of wcfg?.rules || []) {
      if ((r.globs || []).some((g) => globToRe(g).test(rel))) return r.type;
    }
    return null;
  };
  /* THE MEMBER'S OTHER UPLOAD PARTS. `ocr-worker` (CPDF-10 / IC-78) ships a
     tesseract wasm core and a language model beside its bundle — declared
     `external` so esbuild does not inline them, and `assets` so FL-9's guard
     hashes them. An installer that uploaded only the bundle would deploy a
     member that fails at runtime with no engine, and the release would have
     SAID it was complete. Each part is hashed HERE and the hash is required to
     match the committed manifest, so the guard's reading and the release's
     reading cannot diverge. */
  const parts = [];
  for (const rel of m.bundle.assets || []) {
    const abs = join(m.abs, rel);
    if (!existsSync(abs)) {
      die("MEMBER_PART_MISSING",
        `${m.name} declares the upload part ${rel}, and it is not in the tree.`,
        "A member's declared parts are what an installer must ship beside its bundle.\n"
        + "Releasing without one publishes a member that cannot run.");
    }
    const bytes = readFileSync(abs);
    const declared = (manifest.assets || []).find((a) => a.path === rel);
    if (!declared) {
      die("MEMBER_PART_UNHASHED",
        `${m.name}'s manifest does not hash the declared part ${rel}.`,
        "The bundle manifest must carry a hash for every part, or the guard is not\n"
        + "watching the bytes the release is about to sign. Rebuild the member.");
    }
    if (declared.sha256 !== sha256(bytes)) {
      die("MEMBER_PART_DISAGREES",
        `${m.name}'s part ${rel} does not match its manifest.`,
        `  manifest: ${declared.sha256}\n  on disk : ${sha256(bytes)}\n`
        + "The engine or model underneath this member changed without a rebuild.");
    }
    const ptype = typeOfPart(rel);
    if (!ptype) {
      die("MEMBER_PART_UNTYPED",
        `${m.name}'s part ${rel} matches no module rule in its wrangler.jsonc, and IC-82 forbids inferring one.`,
        "The part's module type is what 3607b5c had to fix at deploy; state the rule in the\n"
        + "member's own config (FLEET's file), then assemble again.");
    }
    parts.push({ path: rel, type: ptype, sha256: sha256(bytes), bytes: bytes.length, from: abs });
  }
  if (parts.length) {
    console.log(`       + ${parts.length} upload part(s): `
      + parts.map((x) => `${x.path} (${x.bytes} B)`).join(", "));
  }
  entries.push({ member: m.name, asset: `${m.name}.bundled.mjs`, sha256: sha256(committed),
                 bytes: committed.length, from: join(m.abs, m.bundle.outfile), services, parts,
                 ...(compat ? { compat } : {}) });
  console.log(`guard: ${m.name} fresh — ${built.bytes.length} B, sha256 ${sha256(committed).slice(0, 16)}…`);
}

/* ---- the version, and that the WHOLE FLEET agrees on it ------------------
   This checked only bio-plane's two files until DS-2. That was too narrow by
   exactly the amount that matters here: a release carries ONE version over a
   SET of artifacts, so a member declaring something else makes the manifest's
   `version` field a claim about nothing. The fleet-spanning resolver is the
   same one `deploy.mjs` refuses on, so the release and the deploy cannot
   disagree about what "the version" means. */
const version = flag("--version") || resolveVersion().version;
{
  const r = resolveVersion();
  if (!r.ok) {
    die("VERSION_SKEW", "the fleet does not agree on one version.",
      `  authority: bio-plane/package.json = ${JSON.stringify(r.version)}\n`
      + r.findings.map((f) => "  - " + f).join("\n"));
  }
  if (version !== r.version) {
    die("VERSION_DISAGREES",
      `--version ${version} does not match what the tree declares.`,
      `  declared: ${JSON.stringify(r.version)} (bio-plane/package.json, the authority)\n`
      + "A flag cannot fake a bump the tree has not made. Bump the authority and the\n"
      + "fleet together — `node bio-plane/scripts/resolve-version.mjs` names every site.");
  }
}

/* ---- REFUSAL 4: A PUBLISHED VERSION IS IMMUTABLE -------------------------
   Caught by this tool's own first dry-run, which is why it is here rather than
   in a comment about diligence. Every version source read 0.56.0 and passed the
   check above, while the plane artifact hashed d95d280d… — because FL-10 had
   just REBUILT it from a tree 114 commits past the one 0.56.0 was cut from. The
   version check compares sources to each other and CANNOT see that. So the
   assembler would have cheerfully signed a second, different 0.56.0, and every
   installer that had already fetched the first one would be holding bytes that
   no longer match the manifest under the same version number. A version is a
   promise about bytes; re-using one is the release-channel form of the record
   claiming more than it can support. Bump the version instead. */
{
  const prevPath = join(RELEASE_DIR, "RELEASE.json");
  const prev = existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, "utf8")) : null;
  const planeFresh = entries.find((e) => e.member === "bio-plane");
  if (prev && prev.version === version && prev.sha256 && prev.sha256 !== planeFresh.sha256) {
    die("VERSION_ALREADY_RELEASED",
      `${version} has already been released, with a DIFFERENT plane asset.`,
      `  released ${version}: ${prev.sha256}\n` +
      `  this tree  ${version}: ${planeFresh.sha256}\n` +
      "A version is a promise about bytes. Bump bio-plane/package.json and\n" +
      "bio-plane/wrangler.jsonc together, then assemble again.");
  }
}

/* ---- REFUSAL 2/3: the canonical payload naming the plane AND the members --- */

const planeEntry = entries.find((e) => e.member === "bio-plane");
const fleetEntries = entries.filter((e) => e.member !== "bio-plane")
  .sort((a, b) => a.member.localeCompare(b.member));

/* Built by the SHARED statement function, never here. */
const payload = fleetStatement({
  version,
  plane: { sha256: planeEntry.sha256, bytes: planeEntry.bytes, asset: "bio-plane.bundled.mjs" },
  members: fleetEntries,   /* carries services AND parts; both are signed */
});

console.log("\n──── the payload fleetSig covers ────");
process.stdout.write(payload);
console.log("─────────────────────────────────────");

if (EMIT) { writeFileSync(EMIT, payload); console.log(`payload written to ${EMIT}`); }

if (DRY) {
  console.log(`\n--dry-run: nothing written. A release cut now would carry ${entries.length} assets `
    + `at ${version}, all proved fresh against this tree.`);
  process.exit(0);
}

/* ---- signing, and the acceptance is STOCK ssh-keygen ---------------------- */

const existing = existsSync(join(RELEASE_DIR, "RELEASE.json"))
  ? JSON.parse(readFileSync(join(RELEASE_DIR, "RELEASE.json"), "utf8")) : {};

const NS_RELEASE = "bio-release";

/** Sign `bytes` in `ns` with the release seed.
 *  NOT via `ssh-keygen -Y sign`: that wants an OpenSSH private key FILE and this
 *  project's seed is a `BIOKEY-RAW1.<label>.<b64 seed>` envelope — measured
 *  2026-09-13, it fails with "Couldn't load public key … No such file or
 *  directory". The doctrine is unaffected: stock ssh-keygen remains the
 *  ACCEPTANCE authority and `verifyWith` below is run on everything signed here,
 *  including immediately after signing it. See tools/sign-sshsig.mjs. */
function signWith(seed, bytes, ns) {
  try { return signSshsig(seed, bytes, ns); }
  catch (e) {
    die("SIGNING_FAILED", `could not sign in namespace ${ns}.`,
      `  ${String(e.message || e)}\n`
      + "BIO_RELEASE_SEED must be the BIOKEY-RAW1 envelope this project mints.");
  }
}

/** Stock `ssh-keygen -Y verify` is the acceptance authority, here as everywhere. */
function verifyWith(signer, sig, bytes, ns) {
  const dir = join(tmpdir(), "bio-ver-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  mkdirSync(dir, { recursive: true });
  const allowed = join(dir, "allowed"), sigPath = join(dir, "p.sig");
  const principal = "bio-release";
  writeFileSync(allowed, `${principal} ${signer.split(" ").slice(0, 2).join(" ")}\n`);
  writeFileSync(sigPath, sig);
  try {
    execFileSync("ssh-keygen", ["-Y", "verify", "-f", allowed, "-I", principal, "-n", ns, "-s", sigPath],
      { input: bytes, stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, reason: null };
  } catch (e) { return { ok: false, reason: String(e.stderr || e.message).trim() }; }
}

let fleetSig = flag("--fleet-sig") ? readFileSync(flag("--fleet-sig"), "utf8") : null;
let planeSig = existing.sig ?? null;
const planeBytes = readFileSync(planeEntry.from);

if (SIGN) {
  const seed = process.env.BIO_RELEASE_SEED;
  if (!seed) die("NO_SEED", "--sign needs BIO_RELEASE_SEED and it is not set.",
    "It is machine-local and never printed. Without it, use --emit-payload and sign separately.");
  fleetSig = signWith(seed, payload, NS_FLEET);
  planeSig = signWith(seed, planeBytes, NS_RELEASE);
  console.log("signed: the plane asset and the fleet payload, with the release key");
}

/* ---- REFUSAL 5: THE PLANE SIGNATURE MUST COVER THE PLANE BEING RELEASED ----
   I first wrote this as a printed NOTE ("`sig` was not regenerated here") and
   that was wrong in the way this project keeps paying for: a warning at the end
   of a successful run is not a gate. On a real cut the plane asset CHANGES, so
   carrying the previous `sig` forward writes a manifest whose signature does not
   verify over its own asset. The installer would refuse it and fall back to its
   built-in release — safe, silent, and indistinguishable from the repository
   being unreachable. So it is checked, with the same stock verifier the
   installer uses, and it REFUSES. */
{
  if (!planeSig) die("NO_PLANE_SIG", "there is no plane signature to publish.",
    "Pass --sign (with BIO_RELEASE_SEED), or restore release/RELEASE.json's `sig`.");
  const v = verifyWith(existing.signer, planeSig, planeBytes, NS_RELEASE);
  if (!v.ok) {
    die("PLANE_SIG_DOES_NOT_COVER_ASSET",
      "the plane signature does not verify over the plane asset being released.",
      `  asset  : bio-plane.bundled.mjs  sha256 ${planeEntry.sha256}\n` +
      `  verifier says: ${v.reason}\n` +
      "The plane artifact changed since `sig` was made. Re-sign it in the same act that\n" +
      "publishes it — run this tool with --sign.");
  }
  console.log("verified: stock ssh-keygen accepts `sig` over the plane asset");
}

if (!fleetSig) die("NO_FLEET_SIG", "no fleet signature supplied.",
  "Pass --sign (with BIO_RELEASE_SEED) or --fleet-sig <file>.");

/* The fleet signature, checked by the same stock verifier — never by the code
   that produced it. A signature only its own author can check is worth nothing. */
{
  const v = verifyWith(existing.signer, fleetSig, payload, NS_FLEET);
  if (!v.ok) die("FLEET_SIG_REJECTED", "stock ssh-keygen did NOT accept the fleet signature.", v.reason);
  console.log("verified: stock ssh-keygen accepts fleetSig over this payload");
}

/* ---- write the release ---------------------------------------------------- */

for (const e of entries) copyFileSync(e.from, join(RELEASE_DIR, e.asset));
/* Parts are published under the member's own name so two members declaring the
   same relative path cannot collide in one flat directory. */
for (const e of entries) {
  for (const part of e.parts || []) {
    const dest = join(RELEASE_DIR, e.member, part.path);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(part.from, dest);
  }
}
copyFileSync(planeEntry.from, join(RELEASE_DIR, "bio-plane.bundled.mjs"));

const out = {
  version,
  sha256: planeEntry.sha256,
  /* THE PLANE'S BYTE LENGTH IS PUBLISHED BECAUSE THE SIGNED STATEMENT CONTAINS
     IT. Without it the installer cannot rebuild the bytes fleetSig covers, and
     a perfectly good release would verify as tampered — the producer/verifier
     divergence `fleetStatement` exists to prevent, reappearing as MISSING DATA
     rather than as divergent code. Additive; older installers ignore it. */
  bytes: planeEntry.bytes,
  asset: "bio-plane.bundled.mjs",
  sig: planeSig,              // the PLANE signature, verified above over THIS asset
  signer: existing.signer,
  fleet: fleetEntries.map(({ member, asset, sha256: s, bytes, compat, services, parts }) =>
    ({ member, asset, sha256: s, bytes, compat, services,
       parts: (parts || []).map(({ path, type, sha256: ps, bytes: pb }) => ({ path, type, sha256: ps, bytes: pb })) })),
  fleetSig,
};
writeFileSync(join(RELEASE_DIR, "RELEASE.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\nwrote release/RELEASE.json — ${version}, plane + ${fleetEntries.length} member(s)`);
console.log("both signatures were verified with stock ssh-keygen before this file was written.");
