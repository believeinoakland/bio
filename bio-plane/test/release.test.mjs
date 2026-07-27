/* S-11 step 5, the LAST rung: bulk RELEASE of Information, `op=release`,
 * collected -> verified over a selection, weight `refuse`.
 *
 * Decided by Bob 2026-07-27, Intake Doctrine v1.2. What is asserted here, in
 * doctrine order:
 *   - a named member authors it; the machine-shaped author stamp is refused
 *   - the acknowledgment and mitigation are REQUIRED and land in the RECORD
 *   - crucial-criticality material never rides a batch
 *   - C-2.7's verified-entry requirements are checked BEFORE any state moves
 *   - the whole set moves or none of it does
 *   - released documents conformance-check clean AFTER, and started clean
 *     BEFORE (standing lesson 4: an after-check alone measures nothing)
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, canonicalJson } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;
const STAMP = "viewer=class:member&owner=class:member";
const AUTHOR = "m-riley";
const ACK = encodeURIComponent("Batch of public jobs-board postings, uniform in kind; bulk-release risks weighed.");
const MIT = encodeURIComponent("Sampled 12 of 40; checked sender domains and posting dates against the board.");

const DATASET = JSON.stringify({ v: 1 });
const HASH = "sha256:" + sha(canonicalJson(JSON.parse(DATASET)));

const infoMd = (id, { crit = "supporting", hash = HASH } = {}) => `---
id: ${id}
object_type: information
schema: information@1
title: "Info ${id}"
current_state: collected
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: assisted
  capability_tier: session
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
criticality: ${crit}
source_status: unchanged
content_hash: "${hash}"
source:
  locator: "https://example.org/jobs"
  authority: "Example Jobs Board"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
  last_checked: null
---

## Summary

A posting.

## Provenance Notes

Grade B fetch, hashed at receipt.

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | assisted
Trigger: intake
Changes: created.

## Review Notes
`;

const mk = (id, text, extraFiles = []) => call("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
  meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
          current_state: "collected", created: "2026-07-01T00:00:00Z",
          last_updated: "2026-07-02T00:00:00Z", criticality: /crucial/.test(text) ? "crucial" : "supporting" },
});
const FULL = [
  { path: "data/dataset.json", text: DATASET, bytes: DATASET.length, sha256: sha(DATASET) },
  { path: "snapshots/capture.html", text: "<html/>", bytes: 7, sha256: sha("<html/>") },
];
const docOf = async (id) => (await call(`/image?id=${id}`))["bundle.md"];
const errorsOf = async (id) => {
  const files = new Map(Object.entries(await call(`/image?id=${id}`)));
  const { findings } = await checkBundle({ folderName: id, files,
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => x.check);
};
const stateOf = async (id) => (await call(`/projection?id=${id}`)).current_state;
const select = async (ids) => (await call(`/select?${STAMP}`, { ids })).handle;
const release = (h, q = "") =>
  call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&author=${AUTHOR}&${STAMP}${q}`);

console.log("--- a named member authors it, or nobody does ---");
{
  const id = "INFO-2026-0500-who";
  await mk(id, infoMd(id), FULL);
  const h = await select([id]);
  t("a machine-shaped author stamp is refused by name",
    (await call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&author=token:member&${STAMP}`)).reason,
    "MACHINE_CANNOT_RELEASE");
  t("the generic default is refused the same way",
    (await call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&author=member&${STAMP}`)).reason,
    "MACHINE_CANNOT_RELEASE");
  t("and an absent author is not a member either",
    (await call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&${STAMP}`)).reason,
    "MACHINE_CANNOT_RELEASE");
}

console.log("\n--- the acknowledgment is a record, not a dialog ---");
{
  const id = "INFO-2026-0501-ack";
  await mk(id, infoMd(id), FULL);
  const h = await select([id]);
  t("no acknowledgment, no release",
    (await call(`/release?handle=${h}&mitigation=${MIT}&author=${AUTHOR}&${STAMP}`)).reason, "NO_ACKNOWLEDGMENT");
  t("no mitigation statement, no release",
    (await call(`/release?handle=${h}&acknowledgment=${ACK}&author=${AUTHOR}&${STAMP}`)).reason, "NO_MITIGATION");
  t("an acknowledgment that cannot be spliced is refused, not mangled",
    (await call(`/release?handle=${h}&acknowledgment=${encodeURIComponent('has "quotes"')}&mitigation=${MIT}&author=${AUTHOR}&${STAMP}`)).reason,
    "BAD_ACKNOWLEDGMENT");
  t("nothing moved while the paperwork was wrong", await stateOf(id), "collected");
}

console.log("\n--- the happy path: a homogeneous batch, and what the record shows after ---");
{
  const ids = [];
  for (let i = 0; i < 8; i++) {
    const id = `INFO-2026-051${i}-jobs`;
    await mk(id, infoMd(id), FULL);
    ids.push(id);
  }
  for (const id of ids.slice(0, 2)) t(`${id} starts conformant`, await errorsOf(id), []);
  const h = await select(ids);
  const r = await release(h);
  t("eight postings release in one call", r.ok, true);
  t("every one of them moved", r.released.length, 8);
  t("weight is refuse, stated", r.weight, "refuse");
  t("the last one really is verified", await stateOf(ids[7]), "verified");
  t("and still conformant, including C-2.7's verified-entry checks", await errorsOf(ids[7]), []);
  const doc = await docOf(ids[0]);
  t("the transition is in state_history, authored by the member",
    /to_state: verified/.test(doc) && doc.includes(`author: ${AUTHOR}`), true);
  t("the Session Log names it a batch release, permanently distinguishable",
    doc.includes("| Released (batch) |"), true);
  t("the acknowledgment is IN the document",
    doc.includes("Acknowledgment: Batch of public jobs-board postings"), true);
  t("and so are the mitigation steps, auditable later",
    doc.includes("Mitigation: Sampled 12 of 40"), true);
}

console.log("\n--- crucial never rides a batch ---");
{
  const plain = "INFO-2026-0520-plain", cru = "INFO-2026-0521-crucial";
  await mk(plain, infoMd(plain), FULL);
  await mk(cru, infoMd(cru, { crit: "crucial" }), FULL);
  const h = await select([plain, cru]);
  const r = await release(h);
  t("refused by name", r.reason, "CRUCIAL_IN_BATCH");
  t("the crucial member is the named offender", r.offenders, [cru]);
  t("the whole set is refused, not narrowed: the plain one did not move",
    await stateOf(plain), "collected");
}

console.log("\n--- C-2.7's entry requirements are checked BEFORE any state moves ---");
{
  const ok1 = "INFO-2026-0530-ok", bare = "INFO-2026-0531-bare";
  await mk(ok1, infoMd(ok1), FULL);
  await mk(bare, infoMd(bare)); // no dataset, no snapshot
  const h = await select([ok1, bare]);
  const r = await release(h);
  t("refused by name", r.reason, "ENTRY_REQUIREMENTS");
  t("the offender and exactly what it lacks are named",
    r.offenders, [{ id: bare, missing: ["data/dataset.json", "a file in snapshots/"] }]);
  t("and the well-provisioned one did not move without it", await stateOf(ok1), "collected");
}

console.log("\n--- release is not repeatable, and retired is terminal ---");
{
  const id = "INFO-2026-0540-again";
  await mk(id, infoMd(id), FULL);
  await release(await select([id]));
  const r = await release(await select([id]));
  t("already-verified is an illegal transition", r.reason, "ILLEGAL_TRANSITION");
  t("with the offender and where it actually is named",
    r.offenders, [{ id, from: "verified" }]);
}

console.log("\n--- an empty selection is refused, not a successful no-op ---");
{
  const h = await select(["INFO-2026-9999-nope"]);
  t("refused by name", (await release(h)).reason, "EMPTY_SELECTION");
}

console.log("\n--- something that is not Information refuses the whole set ---");
{
  const prob = "PROB-2026-0550-notinfo";
  const pd = `---\nid: ${prob}\nobject_type: problem\ncurrent_state: surfaced\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\nreferences: []\n---\n\n## Statement\n\nX.\n`;
  await call("/promote", { bundleId: prob, base: null, snapKey: `${prob}-new`, author: "suite",
    files: [{ path: "bundle.md", text: pd, bytes: pd.length, sha256: sha(pd) }],
    meta: { object_type: "problem", group: "believe-in-oakland", title: "P",
            current_state: "surfaced", created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  const info = "INFO-2026-0551-with";
  await mk(info, infoMd(info), FULL);
  const r = await release(await select([info, prob]));
  t("refused by name", r.reason, "NOT_INFORMATION");
  t("the non-Information member is the named offender", r.offenders, [prob]);
  t("and the Information member did not move", await stateOf(info), "collected");
}

console.log("\n--- C-18.1 both ways: the release transition this op writes satisfies the check ---");
/* Standing lesson 2. The check refuses machine-authored collected -> verified
   transitions; this suite proves the transition op=release writes carries a
   member author and passes, which is the direction a check suite alone cannot
   show. The refusing direction lives in the conformance suite. */
{
  const id = "INFO-2026-0560-check";
  await mk(id, infoMd(id), FULL);
  await release(await select([id]));
  t("the released document draws no C-18.1 finding", (await errorsOf(id)).includes("C-18.1"), false);
}

await mf.dispose();
console.log(`\nrelease: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
