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
import { resolveVersion, publishedTokens } from "../scripts/embed-release.mjs";

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

console.log(`\nembed: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
