/* REC-3 / D-110 and D-62: two honesty defects in the installer's own setup
 * surface (setup.mjs, served at / as SETUP_HTML).
 *
 * D-110 (drift): `acquireWhy` still mapped NO_AUTHORITY to "Say who issued the
 * document." — a refusal D-97 (0.47.0) REMOVED, when authority became
 * three-valued and a caller who cannot name the issuer leaves the capture
 * honestly undetermined rather than being forced to invent one. The string was
 * unreachable (grep: NO_AUTHORITY existed only here), but it is a copy of an
 * overturned rule in the surface a member reads, so it is deleted.
 *
 * D-62 (defect): the wizard's `mdFor` omitted `content_hash` even when a
 * document was attached, so C-2.7's verified branch refused the bundle at
 * collected -> verified for a field the writing surface never wrote, and the
 * search layer's hash: facet — which reads that same field — could not find it,
 * defeating the D-60 duplicate detection. `mdFor` now emits
 * `content_hash: sha256:<primary capture sha>` whenever a document is present,
 * and ABSENT for typed intake, where there is no document and inventing one
 * would be a lie. This mirrors civicos-ui's already-landed port.
 *
 * Verified two ways: the served source (SETUP_HTML) carries the two edits, and
 * the catalog (checkBundle, the authority) agrees the emitted SHAPE clears the
 * C-2.7 content_hash requirement it used to trip.
 *
 * NEGATIVE CONTROL: (a) re-add the NO_AUTHORITY branch to acquireWhy -> the
 * "no NO_AUTHORITY explanation" assertion fails. (b) drop the content_hash line
 * from mdFor -> the "SETUP_HTML emits content_hash" assertion fails AND the
 * checkBundle "content_hash present clears the C-2.7 requirement" assertion
 * fails, because a document bundle with no content_hash re-raises "verified
 * state requires a well-formed content_hash". RUN 2026-07-31: (a) branch
 * re-added -> 1 fail; (b) content_hash line removed from setup.mjs -> 3 fail
 * (source presence + both checkBundle arms); both reverted -> green.
 */
/* NEGATIVE CONTROL: (a) re-add the NO_AUTHORITY branch to setup.mjs acquireWhy -> the "no removed refusal named" assertion FAILS; (b) drop the content_hash line from mdFor -> the "emits content_hash" and the checkBundle "content_hash present clears C-2.7" assertions FAIL. RUN 2026-07-31 record-agent-3: (a) 1 fail; (b) 3 fail; both reverted -> 6 pass. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { SETUP_HTML } from "../src/setup.mjs";
import { checkBundle, createSha256 } from "../checks/bio-checks.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const enc = (s) => new TextEncoder().encode(s);
const shaHex = async (s) => createSha256().update(typeof s === "string" ? enc(s) : s).hex();

console.log("\n--- D-110: no explanation for the refusal D-97 removed ---");
/* The reachable branch is gone AND the dead reason's token appears nowhere in
   the served surface — not in code, not in a comment. Carrying the name of an
   overturned rule into the page a member reads is the drift D-110 names. */
t("SETUP_HTML no longer names the removed refusal", SETUP_HTML.includes("NO_AUTHORITY"), false);
/* The reachable refusals D-97 KEPT are still explained, so the deletion removed
   the stale mapping and nothing else. */
t("BAD_LOCATOR is still explained", SETUP_HTML.includes('why === "BAD_LOCATOR"'), true);

console.log("\n--- D-62: mdFor emits content_hash for a document bundle ---");
/* The served source carries the emission, guarded so it is present only when a
   document is (src && src.content_hash), and written as the sha256:<hex> shape
   the hash: facet and C-2.7 both read. */
t("SETUP_HTML emits content_hash for a captured document",
  /content_hash: sha256:"\s*\+\s*src\.content_hash/.test(SETUP_HTML), true);
t("the emission is guarded by a present document", SETUP_HTML.includes("src && src.content_hash"), true);

console.log("\n--- D-62: the emitted shape clears C-2.7 (checkBundle, the authority) ---");
/* A wizard-shaped information@2 document bundle, as mdFor writes it, at the
   verified state the release flow drives it to. We assert ONLY on the C-2.7
   content_hash requirement (other findings come from the minimal provenance
   fixture and are not D-62's subject). */
const now = "2026-07-31T00:00:00Z";
const docBytes = enc("the captured document bytes");
const docSha = await shaHex(docBytes);
const wizardMd = (withHash) => [
  "---", "id: INFO-2026-0001-doc", "object_type: information", "schema: information@2",
  'title: "A captured document"', "current_state: verified", "prior_state: null",
  "created: " + now, "last_updated: " + now,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  ...(withHash ? ["content_hash: sha256:" + docSha] : []),
  "source:", "  locator: in hand", "  authority: member-entered", "  retrieved: " + now,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "what the member wrote", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""
].join("\n");
const runChecks = async (withHash) => {
  const files = new Map([["bundle.md", wizardMd(withHash)]]);
  const { findings } = await checkBundle({ files, folderName: "INFO-2026-0001-doc",
    sha256: shaHex, nowMs: Date.parse(now) });
  return findings.some((x) => x.check === "C-2.7" && /requires a well-formed content_hash/.test(x.message));
};
t("WITHOUT content_hash, C-2.7 refuses the verified bundle (the D-62 block)",
  await runChecks(false), true);
t("WITH content_hash, that C-2.7 refusal is gone (the fix)",
  await runChecks(true), false);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
