/* Embeds the current bio-plane release into the wizard as a string, so the
 * wizard uploads exactly one module into the group's account and depends on
 * no repository, no CDN, and no second fetch at install time.
 *
 * Run from newgroup/: `npm run embed`. Expects the sibling ../bio-plane tree
 * with its devDependencies installed (esbuild does the bundling there).
 *
 * WHY THIS REFUSES (D-106, 2026-07-31). The installer shipped 0.35.0 while the
 * plane ran 0.48.0, thirteen releases, and nobody noticed. The cause was not a
 * forgotten build step: this script read the embedded version out of
 * `bio-plane/wrangler.jsonc`, and NOTHING ELSE IN THE TREE READS THAT FIELD.
 * `scripts/deploy.mjs` binds VERSION from its command line, so every release
 * since 0.35.0 deployed correctly while the config literal sat untouched. A
 * field with exactly one reader, and that reader a build step whose output
 * nobody inspects, is a field that rots invisibly. Re-running the old script
 * today would still have embedded 0.35.0.
 *
 * So: `bio-plane/package.json` is the AUTHORITY, because that is the version a
 * release is cut from and the version RELEASE.json carries. Every other place
 * the version appears must agree with it or this refuses to build. The check is
 * equality, never a comparison: "newer" is not a defence, because a wrangler
 * config ahead of package.json is the same class of drift in the other
 * direction and equally worth stopping.
 *
 * WHY THIS NO LONGER BUILDS (2026-09-18, DIST). This script used to run
 * `npm run build` in bio-plane and embed whatever the working tree compiled
 * to, labelled with package.json's version. Between releases that is NOT the
 * signed release: measured on 5ea27761, the committed embed was the signed
 * 0.58.0 asset (sha256 72fce1e9...) and one `npm run embed` replaced it with
 * an unsigned build of 834 later commits (9efea448...) still calling itself
 * 0.58.0. `npm test` and `npm run build` both ran it, so the installer's own
 * gate put an unsigned plane under a signed version's name, and the installer
 * installs its built-in copy WITHOUT verifying it (it is the fallback). So the
 * embed now COPIES the signed asset from release/ and refuses unless the bytes
 * hash to RELEASE.json's sha256, carry a signature that verifies against the
 * installer's own ARMED_SIGNERS, and name the version package.json names.
 * It builds nothing and is idempotent: between cuts it rewrites the same file.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { verifySshsig, NS_RELEASE } from "../../bio-plane/src/sshsig.mjs";
import { ARMED_SIGNERS } from "../src/signers.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

/** Resolve the version to embed, or throw naming the disagreement.
 *
 *  Pure, taking the file CONTENTS rather than paths, so the refusal can be
 *  tested without a build and without a fixture tree on disk. Every throw says
 *  which file is authority and what to change, because the person who trips
 *  this is mid-release and should not have to read the script to act on it.
 */
export function resolveVersion({ packageJson, wranglerJsonc }) {
  let pkg;
  try { pkg = JSON.parse(packageJson); }
  catch (e) { throw new Error(`bio-plane/package.json does not parse: ${e.message}`); }

  const version = pkg && pkg.version;
  if (typeof version !== "string" || !SEMVER.test(version)) {
    throw new Error(
      `bio-plane/package.json has no usable "version" (got ${JSON.stringify(version)}). `
      + "It is the authority for what the installer embeds; nothing can be built without it.");
  }

  const m = /"VERSION":\s*"([^"]*)"/.exec(wranglerJsonc);
  if (!m) {
    throw new Error(
      "bio-plane/wrangler.jsonc declares no VERSION var. It is the version `wrangler dev` "
      + `binds locally, so it must agree with package.json (${version}) or local runs lie `
      + "about which plane they are.");
  }
  if (m[1] !== version) {
    throw new Error(
      "REFUSING TO EMBED: version sources disagree.\n"
      + `  bio-plane/package.json    ${version}   <- authority, cut releases from this\n`
      + `  bio-plane/wrangler.jsonc  ${m[1]}\n`
      + "This is D-106: wrangler.jsonc's VERSION has no other reader, so it drifts silently "
      + "and the installer ships whatever it last said. Set wrangler.jsonc to "
      + `"VERSION": "${version}" and build again.`);
  }
  return version;
}

/** Every published token value that must not survive into the artifact. */
export function publishedTokens(secretsTxt) {
  return secretsTxt.trim().split("\n").map((l) => l.split("=")[1]).filter(Boolean);
}

/** Refuse unless `bytes` are the release RELEASE.json describes, for the
 *  version the tree names. Pure except for the signature check, which is the
 *  installer's own verifier against the installer's own keys. Returns null,
 *  or the reason in words a person mid-release can act on. */
export async function checkSignedAsset({ manifest, bytes, version, signers = ARMED_SIGNERS }) {
  if (!manifest || typeof manifest !== "object") return "release/RELEASE.json is missing or does not parse.";
  if (manifest.version !== version) {
    return `REFUSING TO EMBED: release/RELEASE.json is ${JSON.stringify(manifest.version)} but bio-plane/package.json `
      + `is ${version}. Only a SIGNED release is embedded; cut and sign ${version} `
      + "(tools/release-assemble.mjs --sign) before embedding it.";
  }
  const got = createHash("sha256").update(bytes).digest("hex");
  if (got !== manifest.sha256) {
    return `REFUSING TO EMBED: release/${manifest.asset} hashes ${got.slice(0, 16)}... but RELEASE.json `
      + `records ${String(manifest.sha256).slice(0, 16)}.... The asset is not the release that was signed.`;
  }
  if (!signers.length) return "REFUSING TO EMBED: the installer lists no ARMED_SIGNERS, so nothing can vouch for the asset.";
  if (typeof manifest.sig !== "string" || !manifest.sig.trim()) return "REFUSING TO EMBED: RELEASE.json carries no signature.";
  const v = await verifySshsig(manifest.sig, new Uint8Array(bytes), NS_RELEASE, signers);
  if (!v.ok) return `REFUSING TO EMBED: the release signature does not verify against the installer's keys (${v.reason}).`;
  return null;
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const plane = path.resolve(here, "../../bio-plane");
  const releaseDir = path.resolve(here, "../../release");
  const out = path.resolve(here, "../src/release.mjs");

  const version = resolveVersion({
    packageJson: readFileSync(path.join(plane, "package.json"), "utf8"),
    wranglerJsonc: readFileSync(path.join(plane, "wrangler.jsonc"), "utf8"),
  });

  const manifest = JSON.parse(readFileSync(path.join(releaseDir, "RELEASE.json"), "utf8"));
  const bytes = readFileSync(path.join(releaseDir, manifest.asset || "bio-plane.bundled.mjs"));
  const refused = await checkSignedAsset({ manifest, bytes, version });
  if (refused) throw new Error(refused);
  const src = bytes.toString("utf8");

  /* Refuse to embed a release that still contains any published token value.
     The denylist protects the runtime; this protects the artifact. */
  for (const s of publishedTokens(readFileSync(path.join(plane, "dist/SECRETS.txt"), "utf8"))) {
    if (src.includes(s)) throw new Error("published token value found in the bundled release; refusing to embed");
  }

  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out,
    "/* GENERATED by scripts/embed-release.mjs. Do not edit. */\n"
    + `export const RELEASE_VERSION = ${JSON.stringify(version)};\n`
    + `export const RELEASE_SOURCE = ${JSON.stringify(src)};\n`);
  console.log(`embedded the SIGNED bio-plane ${version} (sha256 ${manifest.sha256.slice(0, 16)}...), ${src.length} chars, into src/release.mjs`);
}

/* Importable for tests without running a build. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
