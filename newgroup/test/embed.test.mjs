/* The embed step's refusal, tested without running a build.
 *
 * D-106: the installer shipped a plane thirteen releases old because the embed
 * script read its version from `bio-plane/wrangler.jsonc`, the one field in the
 * tree that nothing else reads. `resolveVersion` is pure and takes file
 * CONTENTS, so every refusal below is asserted in milliseconds and the last
 * block asserts the invariant against the REAL tree, which is the assertion
 * that would have caught D-106 on the day it was introduced.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { resolveVersion, publishedTokens, checkSignedAsset } from "../scripts/embed-release.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* Returns the message, or null if it did not throw. Asserting on the message
   matters: a refusal nobody can act on sends the reader into the script. */
const refusal = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };

const pkg = (v) => JSON.stringify({ name: "bio-plane", version: v });
const wcfg = (v) => `{ "name": "biosmoke7", "vars": { "VERSION": "${v}" } }`;

console.log("\n--- agreement passes ---");
t("matching sources resolve to the version",
  resolveVersion({ packageJson: pkg("0.48.0"), wranglerJsonc: wcfg("0.48.0") }), "0.48.0");
t("a prerelease suffix is still a version",
  resolveVersion({ packageJson: pkg("1.0.0-rc.1"), wranglerJsonc: wcfg("1.0.0-rc.1") }), "1.0.0-rc.1");

console.log("\n--- disagreement refuses, in both directions ---");
{
  const m = refusal(() => resolveVersion({ packageJson: pkg("0.48.0"), wranglerJsonc: wcfg("0.35.0") }));
  t("a stale wrangler.jsonc is refused", typeof m, "string");
  t("and the message names both versions", !!m && m.includes("0.48.0") && m.includes("0.35.0"), true);
  t("and names package.json as the authority", !!m && /package\.json.*authority/s.test(m), true);
  t("and cites the debt item", !!m && m.includes("D-106"), true);
  t("and says exactly what to change", !!m && m.includes('"VERSION": "0.48.0"'), true);
}
t("a wrangler.jsonc AHEAD of package.json is refused too, not accepted as newer",
  typeof refusal(() => resolveVersion({ packageJson: pkg("0.48.0"), wranglerJsonc: wcfg("0.49.0") })), "string");

console.log("\n--- malformed sources refuse rather than guess ---");
t("no VERSION var at all is refused",
  typeof refusal(() => resolveVersion({ packageJson: pkg("0.48.0"), wranglerJsonc: '{ "name": "x" }' })), "string");
t("package.json without a version is refused",
  typeof refusal(() => resolveVersion({ packageJson: '{"name":"bio-plane"}', wranglerJsonc: wcfg("0.48.0") })), "string");
t("a non-semver version is refused",
  typeof refusal(() => resolveVersion({ packageJson: pkg("latest"), wranglerJsonc: wcfg("latest") })), "string");
t("unparseable package.json is refused",
  typeof refusal(() => resolveVersion({ packageJson: "{not json", wranglerJsonc: wcfg("0.48.0") })), "string");

console.log("\n--- the token screen reads a SECRETS.txt ---");
t("values are taken from the right side of each assignment",
  publishedTokens("ADMIN_TOKEN=aaa\nMEMBER_TOKEN=bbb\n"), ["aaa", "bbb"]);
t("blank lines contribute nothing", publishedTokens("ADMIN_TOKEN=aaa\n\n"), ["aaa"]);

/* The regression guard. Not a fixture: the real files, so this suite fails the
   day the two sources drift, whichever one moved. */
console.log("\n--- the real tree agrees (the D-106 guard) ---");
{
  const plane = join(fileURLToPath(new URL("../..", import.meta.url)), "bio-plane");
  const version = refusal(() => resolveVersion({
    packageJson: readFileSync(join(plane, "package.json"), "utf8"),
    wranglerJsonc: readFileSync(join(plane, "wrangler.jsonc"), "utf8"),
  }));
  t("the checked-in bio-plane resolves without refusing", version, null);
}

/* THE EMBED IS THE SIGNED RELEASE (2026-09-18, DIST). The embed used to build
   the working tree and label it with package.json's version, so between cuts
   `npm test` replaced the signed plane with an unsigned one under the same
   name. These run BEFORE `npm run embed` in `npm test`, so the last block reads
   the COMMITTED embed, which is what a release of the installer ships.
   NEGATIVE CONTROL: RUN 2026-09-18 — the pre-fix embed-release.mjs restored
   aside, `npm run embed` run, then this suite: FAILED at "the committed embed IS
   the signed release asset" (9efea448... vs 72fce1e9...) and "and its label is
   RELEASE.json's version" held, which is the lie exactly: right name, wrong
   bytes. Restored by cp, verified by hash (src/release.mjs 99e18af4...). */
console.log("\n--- only the signed asset is embedded ---");
{
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const manifest = JSON.parse(readFileSync(join(root, "release", "RELEASE.json"), "utf8"));
  const bytes = readFileSync(join(root, "release", manifest.asset));
  t("the real release/ asset passes", await checkSignedAsset({ manifest, bytes, version: manifest.version }), null);
  const flipped = Buffer.from(bytes); flipped[flipped.length - 2] ^= 1;
  const m1 = await checkSignedAsset({ manifest, bytes: flipped, version: manifest.version });
  t("one flipped byte is refused, naming the hash", !!m1 && m1.includes("REFUSING") && m1.includes("hashes"), true);
  const m2 = await checkSignedAsset({ manifest, bytes, version: "99.0.0" });
  t("a version the release does not carry is refused (a bump is not a signature)",
    !!m2 && m2.includes("99.0.0") && m2.includes("release-assemble"), true);
  const m3 = await checkSignedAsset({ manifest: { ...manifest, sig: "" }, bytes, version: manifest.version });
  t("an unsigned manifest is refused", !!m3 && m3.includes("no signature"), true);
  const other = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIsvYEq6HIlXZtcJ7N02tiP63u3n1Rj27dR6NNLzeZUk other";
  const m4 = await checkSignedAsset({ manifest, bytes, version: manifest.version, signers: [other] });
  t("a signature from a key the installer does not trust is refused", !!m4 && m4.includes("does not verify"), true);
  t("an installer with no keys refuses rather than embedding unvouched bytes",
    typeof (await checkSignedAsset({ manifest, bytes, version: manifest.version, signers: [] })), "string");

  const emb = await import("../src/release.mjs");
  t("the committed embed IS the signed release asset",
    createHash("sha256").update(emb.RELEASE_SOURCE, "utf8").digest("hex"), manifest.sha256);
  t("and its label is RELEASE.json's version", emb.RELEASE_VERSION, manifest.version);
}

console.log(`\nembed: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
