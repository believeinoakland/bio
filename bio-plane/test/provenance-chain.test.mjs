/* NEGATIVE CONTROL: (all six arms RUN 2026-08-05 against the FINAL files, so every count below agrees with the file it names; each file restored BYTE-IDENTICALLY with sha256 compared before and after — src/store.mjs a9466d2b..., checks/bio-checks.mjs 79c4588e..., test/provenance-chain.test.mjs 5b8f72ae...) — REC-54 / D-200, the ten live bundles that claim a provenance route they cannot show. Baseline 63 pass, 0 fail.
   (a) THE INVENTION ARM — hand a bundle a chain the capture record does not support: in src/store.mjs replace `chainFromEvidence`'s final `return { ok: false, missing };` with a hop built from nothing (`{ who: "instance " + instanceName, asserts: "these bytes came from somewhere", evidence: "none", bound: false, via: "direct" }`) -> 56 pass, 7 FAIL, naming the invention: the evidence-free document is `reconstructed` instead of refused, `EVIDENCE_INSUFFICIENT` never fires, the detail that calls stating a route an invention never appears, and the register that should have been left untouched is REWRITTEN — including the mixed register, where the derivable document is written on the back of the invented one.
   (b) THE NEUTERED-CHECK ARM, AND ITS POLARITY IS THE POINT — weaken C-18.9 to tolerate a missing chain (in checks/bio-checks.mjs guard the three chain arms with `false` and let the hop loop run only on a real array) -> 9 FAIL naming the check just neutered, then the run STOPS at `weakenC189`, which throws "the chain arm was not found — the stripper matched NOTHING, so any delta it reports is meaningless". That second half is the arm's own instrument finding and is reported rather than smoothed: the stripper REFUSES to report a delta once the guard it strips has been removed by hand, which is exactly the protection against a walk that covers nothing passing everything. These pins go GREEN for a genuine fix (a real chain written to the record removes the finding) and RED for the weakening — each asserts the check FIRES, never that the defect persists, which is the polarity error corrected three times in four items.
   (c) THE OTHER DIRECTION, because these must not collapse that way either — a document legitimately BELOW `verified` with no chain must still read CLEAN: drop the `if (!atFence) return;` guard in checkAuthorityPublishable -> 57 pass, 6 FAIL: all three collected-state assertions report a chain the document is not yet required to carry, AND the walk's three reach assertions fail with it, because a fence that fires everywhere makes the corpus's clean bundles dirty and the measured delta stops matching the corpus.
   (d) THE SWEEP'S OWN REACH, ASSERTED AS A DELTA AND NEVER AGAINST AN ABSOLUTE — neuter the live-bundle walk (`walkForC189` returns an empty array) -> 61 pass, 2 FAIL, and they are the two that can only fail as a DELTA: "the real catalog finds exactly those" and "so the walk's REACH is the delta, and it is not zero". A walk that covers nothing scores 0 against a corpus count measured FROM the corpus rather than typed. The weakened catalog it is compared against is produced by MECHANICALLY STRIPPING THE REAL GUARD FROM A COPY OF THE REAL SOURCE, so reach is proved against the real defect at the real site rather than against a planted specimen.
   (e) THE WRITE-PATH ARM, asserted at its OWN layer per VERIFICATION.md 3a — remove the provenance-chain entry requirement from `release()` in src/store.mjs -> 60 pass, 3 FAIL: the batch path admits a document with no chain, it is not named in the refusal, and the document REACHES `verified`. Nothing in the catalog arm above moves, which is the point of asserting both: `runGate` never runs on this path, so a control that broke only the check would have left this silent.
   (f) THE ARCHIVE-HOP ARM — let `chainFromEvidence` read `co_archive` as a second hop -> 61 pass, 2 FAIL: a co-archive records that we ALSO asked an archive to keep a copy, not that the bytes REACHED US through one, so writing it as a hop states a weaker route than what happened and contradicts the `grade: B` the register already carries. */

/* REC-54 / D-200: a published hash claims these bytes came from somewhere by
 * some route, and ten live bundles named none.
 *
 * THE ITEM IS THE CLASS, NOT THE TEN. What is asserted here, in the order the
 * questions were asked:
 *
 *   (a) THE WRITE PATH. `runGate` — the only thing that runs the check catalog
 *       — has exactly ONE call site, `op=ratify`. `op=release` is the OTHER way
 *       an Information document reaches `verified`, and it hand-checked three of
 *       C-2.7's entry requirements and never asked C-18.9's question at all. That
 *       path is the defect; the ten are its symptom.
 *
 *   (b) HELD OPEN, not collapsed: whether any OTHER check tolerates a record
 *       state it cannot support. Measured here as a RELATION rather than ruled,
 *       because the answer found — five checks advising a repair a sixth refuses
 *       — reaches four check functions this item did not claim.
 *
 *   (c) THE AUDIT'S OWN VOCABULARY. `no chain recorded` and `a chain recorded
 *       and empty` are different facts about the record and read alike. They no
 *       longer do.
 *
 * WHAT SEPARATES RECONSTRUCTION FROM BACK-DATING, since that is the whole item:
 * a hop may carry only what the register ALREADY recorded, and every derived hop
 * is STAMPED `reconstructed` so a chain derived today cannot be read as one
 * witnessed at capture. A document whose route was never recorded is
 * UNDETERMINED and is refused rather than repaired.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkBundle, STATES } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const CHECKS_SRC = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* CORRECTED MID-RUN 2026-08-05, and reported rather than smoothed: the first
   draft indexed findings and hops directly (`absent[0].message`), so every
   negative-control arm that removed a finding died with a TypeError instead of
   FAILING — which is D-93's class inside a single suite, the crash hiding every
   arm behind it. A control that cannot report what it broke is worth much less
   than one that can. These read defensively so a neutered subject produces a
   readable failing assertion and the run still reaches its tally. */
const at = (arr, i) => (Array.isArray(arr) && arr[i] && typeof arr[i] === "object" ? arr[i] : {});
const msgOf = (arr, i) => at(arr, i).message ?? "<no finding was produced>";
const shaHex = async (v) => sha(typeof v === "string" ? v : Buffer.from(v));
const sha512Hex = async (b) => new Uint8Array(createHash("sha512").update(Buffer.from(b)).digest());

/* ------------------------------------------------------------------ fixtures */

const NOW = "2026-08-05T00:00:00Z";

/* The evidence shape the TEN LIVE BUNDLES actually carry, copied from the live
   record on 2026-08-05 rather than invented for the suite: a locator, the
   instant, a capture method and actor class, a sha, an archive CO-archive and an
   RFC3161 token. `provenance_chain` is ABSENT — which is what all ten have, and
   is a different fact from an empty one. */
const LIVE_SHAPED = {
  file: "snapshots/capture-2026-07-19-doc.pdf",
  locator: "https://www.example.gov/reports/acfr.pdf",
  authority: "Example Finance Department",
  retrieved: "2026-07-19T19:15:50Z",
  capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon", sha256: "a".repeat(64), encoding: "binary" },
  origin: { kind: "named_request", request: "GATH-2026-0005-doc" },
  co_archive: "https://web.archive.org/web/20260719192109/https://www.example.gov/reports/acfr.pdf",
  timestamp: { authority: "freetsa.org", token_file: "snapshots/capture-2026-07-19-doc.pdf.tsr", encoding: "binary" },
  authority_state: "undetermined",
  authority_basis: "no assertion was supplied; recorded 2026-07-19T19:15:50Z for resolution through the task list",
};

/* The member-original shape, also copied from the live record: no fetch to
   describe, a custody block instead. `locator: "in hand"` is a SENTINEL and not
   an address, which is exactly why the fetched arm must refuse it. */
const CUSTODY_SHAPED = {
  file: "snapshots/allowed_signers.txt",
  locator: "in hand",
  authority: "Believe in Oakland (operator)",
  retrieved: "2026-07-22T14:30:00Z",
  capture: { method: "member-upload", grade: "A", actor_class: "member", sha256: "b".repeat(64), encoding: "utf8" },
  origin: { kind: "member" },
  custody: { holder: "bob-krause", obtained: "2026-07-22T14:30:00Z",
             setting: "generated locally by gen-registry.sh on the operator machine",
             attestation: "key material generated and held by the operator" },
  timestamp: { authority: "freetsa.org", token_file: "snapshots/allowed_signers.txt.tsr", encoding: "binary" },
  authority_state: "undetermined",
  authority_basis: "member original; recorded 2026-07-22T14:30:00Z",
};

/* A document with NO route recorded at all: this is the one that must be
   refused rather than repaired. */
const NO_EVIDENCE = {
  file: "snapshots/mystery.pdf",
  locator: "",
  authority_state: "undetermined",
  authority_basis: "nothing was established; recorded 2026-08-05T00:00:00Z",
  capture: { grade: "C" },
};

const bundleMd = (id, state) => `---\nid: ${id}\nobject_type: information\ncurrent_state: ${state}\n---\n\n# ${id}\n`;

const runCatalog = async (mod, { id = "INFO-2026-0009-fence", state = "verified", docs }) => {
  const files = new Map([
    ["bundle.md", bundleMd(id, state)],
    ["data/provenance.json", JSON.stringify({ documents: docs })],
  ]);
  const { findings } = await mod.checkBundle({ folderName: id, files,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  return findings.filter((x) => x.check === "C-18.9");
};

/* =====================================================================
   (c) THE AUDIT'S OWN VOCABULARY — three facts that used to read alike
   ===================================================================== */
console.log("\n--- C-18.9 distinguishes NO CHAIN RECORDED from A CHAIN RECORDED AND EMPTY ---");
{
  const real = { checkBundle };
  const absent = await runCatalog(real, { docs: [{ ...LIVE_SHAPED }] });
  const empty = await runCatalog(real, { docs: [{ ...LIVE_SHAPED, provenance_chain: [] }] });
  const notArray = await runCatalog(real, { docs: [{ ...LIVE_SHAPED, provenance_chain: null }] });

  /* POLARITY: each of these asserts the check FIRES. Weakening C-18.9 turns
     them RED; a genuine fix to the RECORD (writing a real chain) turns them
     green by removing the finding, which the reconstruction arms below assert
     separately. Neither pin requires the defect to persist. */
  t("a document that records NO chain at all is refused", absent.length, 1);
  t("an EMPTY chain is refused too", empty.length, 1);
  t("a chain field that is not an array is refused", notArray.length, 1);

  t("and the three no longer read alike: every message is distinct",
    new Set([msgOf(absent,0), msgOf(empty,0), msgOf(notArray,0)]).size, 3);
  t("the absent case says the record holds no chain at all",
    /records no provenance_chain at all/.test(msgOf(absent,0)), true);
  t("the empty case says a chain WAS recorded and names no party",
    /records an EMPTY provenance_chain/.test(msgOf(empty,0)), true);
  t("and says plainly that it is a different fact from never having recorded one",
    /different fact from never having recorded one/.test(msgOf(empty,0)), true);
  t("the malformed case says whatever wrote it did not write a chain",
    /did not write a chain/.test(msgOf(notArray,0)), true);

  /* The repair advice is part of the finding, and the EMPTY case must not be
     repaired by assuming a route — that is the invention the gate exists to
     prevent, arriving through the repair text. */
  t("the empty case's repair never suggests assuming a route",
    (at(empty,0).repairs || []).some((r) => /undetermined/.test(r)), true);

  /* NOTHING IS WEAKENED: a good chain still passes, and an unattributed hop
     still fails, so the split did not open a hole beside the one it closed. */
  const good = await runCatalog(real, { docs: [{ ...LIVE_SHAPED,
    provenance_chain: [{ who: "instance x", asserts: "y", evidence: "z", bound: false, via: "direct" }] }] });
  t("a chain naming its attestor still passes", good.length, 0);
  const anon = await runCatalog(real, { docs: [{ ...LIVE_SHAPED,
    provenance_chain: [{ asserts: "y", bound: false }] }] });
  t("an unattributed hop is still refused", anon.length, 1);
  t("naming what a hop must carry", /names no attestor/.test(msgOf(anon,0)), true);
}

/* =====================================================================
   THE OTHER DIRECTION — below `verified`, no chain is not a finding
   ===================================================================== */
console.log("\n--- a document legitimately BELOW verified with no chain reads CLEAN ---");
{
  const real = { checkBundle };
  t("collected with no chain draws nothing",
    (await runCatalog(real, { state: "collected", docs: [{ ...LIVE_SHAPED }] })).length, 0);
  t("collected with an EMPTY chain draws nothing either",
    (await runCatalog(real, { state: "collected", docs: [{ ...LIVE_SHAPED, provenance_chain: [] }] })).length, 0);
  t("collected with NO route recorded at all still draws nothing",
    (await runCatalog(real, { state: "collected", docs: [{ ...NO_EVIDENCE }] })).length, 0);
}

/* =====================================================================
   (d) THE SWEEP'S REACH, AS A DELTA AGAINST THE REAL GUARD
   =====================================================================
   The weakened catalog is the REAL SOURCE with the REAL guard mechanically
   removed — the same weakening negative control (b) applies by hand — so the
   walk's reach is measured against the real defect at the real site. A walk
   that covers nothing has a delta of zero and fails, which is the property
   eight sightings of this class were missing. */
console.log("\n--- the live-bundle walk proves its reach as a DELTA, never against an absolute ---");

function weakenC189(src) {
  /* Collapse the three chain arms back into ONE TOLERATED branch: exactly
     "weaken C-18.9 to tolerate a missing chain". */
  const from = "if (!('provenance_chain' in d)) {";
  const to = "} else {";
  const a = src.indexOf(from);
  if (a === -1) throw new Error("weakenC189: the chain arm was not found — the stripper matched NOTHING, so any delta it reports is meaningless");
  const b = src.indexOf(to, a);
  if (b === -1) throw new Error("weakenC189: the closing arm was not found");
  const out = src.slice(0, a) + "if (!Array.isArray(chain) || chain.length === 0) { /* tolerated */ " + src.slice(b);
  if (out === src) throw new Error("weakenC189: the strip changed nothing");
  return out;
}

const dir = mkdtempSync(join(tmpdir(), "rec54-"));
const weakPath = join(dir, "weak-checks.mjs");
writeFileSync(weakPath, weakenC189(readFileSync(CHECKS_SRC, "utf8")));
const weak = await import(pathToFileURL(weakPath).href);

/* The corpus the walk sweeps: shaped like the live ten, plus documents that
   must NOT be counted, so the walk is measured on a mixed corpus rather than
   one built to agree with it. */
const CORPUS = [
  { id: "INFO-2026-0001-a", state: "verified", docs: [{ ...LIVE_SHAPED }] },                       // dirty: absent
  { id: "INFO-2026-0002-b", state: "verified", docs: [{ ...LIVE_SHAPED }] },                       // dirty: absent
  { id: "INFO-2026-0003-c", state: "verified", docs: [{ ...LIVE_SHAPED, provenance_chain: [] }] }, // dirty: empty
  { id: "INFO-2026-0004-d", state: "verified", docs: [{ ...CUSTODY_SHAPED }] },                    // dirty: absent
  { id: "INFO-2026-0005-e", state: "collected", docs: [{ ...LIVE_SHAPED }] },                      // CLEAN: below the fence
  { id: "INFO-2026-0006-f", state: "verified", docs: [{ ...LIVE_SHAPED,                            // CLEAN: has a chain
      provenance_chain: [{ who: "instance x", asserts: "y", evidence: "z", bound: false, via: "direct" }] }] },
];

async function walkForC189(mod) {
  const out = [];
  for (const b of CORPUS) {
    const found = await runCatalog(mod, b);
    if (found.length) out.push(b.id);
  }
  return out;
}

{
  const realHits = await walkForC189({ checkBundle });
  const weakHits = await walkForC189(weak);
  const delta = realHits.length - weakHits.length;

  /* Measured from the corpus, never typed: a hand-typed expected count agrees
     with a walk that covers nothing just as readily. */
  const dirtyInCorpus = CORPUS.filter((b) => b.state === "verified"
    && !(Array.isArray(b.docs[0].provenance_chain) && b.docs[0].provenance_chain.length)).length;

  t("the corpus really does contain bundles the guard must catch", dirtyInCorpus > 0, true);
  t("the real catalog finds exactly those", realHits.length, dirtyInCorpus);
  t("the weakened catalog — the REAL source with the REAL guard removed — finds none", weakHits.length, 0);
  t("so the walk's REACH is the delta, and it is not zero", delta, dirtyInCorpus);
  t("and the walk never counts a document below the fence or one that carries a chain",
    realHits.includes("INFO-2026-0005-e") || realHits.includes("INFO-2026-0006-f"), false);
}

/* =====================================================================
   (b) HELD OPEN — does any OTHER check tolerate a state it cannot support?
   =====================================================================
   A RELATION, deliberately, and it asserts no value. The measurement found
   FIVE repair strings in the catalog advising "return the bundle to collected",
   a transition `STATES.information.edges` does not have and C-4.2 refuses by
   name. REC-54 corrected the ONE inside C-18.9, which is the only check
   function this item claimed; the other four sit in check functions it did not
   open, so the question is RECORDED here rather than ruled. Pinning a relation
   asserts no value, so it is not a ruling — and it will change the moment
   somebody fixes or adds one, which is what makes it worth holding. */
console.log("\n--- HELD OPEN: repair advice that names a transition the machine refuses ---");
{
  const catalogSrc = readFileSync(CHECKS_SRC, "utf8");
  const advisesCollected = [...catalogSrc.matchAll(/return the bundle to collected|set current_state to collected/g)].length;

  t("the information machine has no verified -> collected edge",
    STATES.information.edges.verified.includes("collected"), false);
  t("so C-4.2 would refuse that transition as illegal",
    STATES.information.edges.verified, ["retired"]);
  /* The RELATION: C-18.9 no longer advises it, and the catalog still does
     elsewhere. Both halves are the finding. */
  t("C-18.9's own repair no longer advises the impossible transition",
    /return the bundle to collected/.test(
      catalogSrc.slice(catalogSrc.indexOf("function checkAuthorityPublishable"),
                       catalogSrc.indexOf("function checkReleaseAuthority"))), false);
  t("and the question stays OPEN elsewhere in the catalog, recorded rather than ruled",
    advisesCollected > 0, true);
}

/* =====================================================================
   THE RECONSTRUCTION, DRIVEN THROUGH THE OP — op=provenancechain
   ===================================================================== */
console.log("\n--- op=provenancechain: derive from evidence, or refuse and name what is missing ---");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p",
              VERSION: "test", INSTANCE_NAME: "testinstance" },
});
const post = async (op, body, qs = "") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-p${qs}`, { method: "POST", body: JSON.stringify(body || {}) })).json();
const get = async (op, qs = "") => (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=mem-p${qs}`)).json();

const seed = async (id, docs, state = "verified") => {
  const body = bundleMd(id, state);
  const prov = JSON.stringify({ documents: docs }, null, 2);
  return post("promote", {
    bundleId: id, base: null, snapKey: "20260805T000000Z_aaaa1111", author: "m-riley",
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: state, created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  });
};
const registerOf = async (id) => {
  const img = (await get("image", `&id=${encodeURIComponent(id)}`)).result;
  return JSON.parse(img["data/provenance.json"]);
};

{
  /* ---- the fetched arm, on the shape the live ten actually carry ---- */
  await seed("INFO-2026-0011-fetched", [{ ...LIVE_SHAPED }]);

  const report = await post("provenancechain", {}, "&bundleId=INFO-2026-0011-fetched");
  t("a report is produced without writing anything", (report.result||{}).applied, false);
  t("and it says the chain is reconstructible", at(report.result.documents,0).outcome, "reconstructed");
  t("nothing was written while only reporting",
    "provenance_chain" in (await registerOf("INFO-2026-0011-fetched")).documents[0], false);

  const applied = await post("provenancechain", {}, "&bundleId=INFO-2026-0011-fetched&apply=1");
  t("applying writes it", (applied.result||{}).applied, true);

  const reg = await registerOf("INFO-2026-0011-fetched");
  const hops = reg.documents[0].provenance_chain;
  t("the document now carries a chain", Array.isArray(hops), true);

  /* A DIRECT FETCH IS ONE HOP. The co-archive is present in this fixture and
     must not have become a second one: it records that we ALSO asked an archive
     to keep a copy, not that the bytes reached us through one, and writing it as
     a hop would state a weaker route than what happened. */
  t("exactly one hop, because the route was direct", hops.length, 1);
  t("and the co_archive did NOT become a hop", JSON.stringify(hops).includes("web.archive.org"), false);
  t("the co_archive is still recorded on the document, untouched", reg.documents[0].co_archive, LIVE_SHAPED.co_archive);

  t("the hop names its attestor", /^instance testinstance/.test(String(at(hops,0).who)), true);
  t("it asserts only what the register recorded: the address and the instant",
    at(hops,0).asserts, `these bytes were served for ${LIVE_SHAPED.locator} at ${LIVE_SHAPED.retrieved}`);
  t("the assertion is STATED, not cryptographically bound", at(hops,0).bound, false);
  t("and the timestamp token is cited as binding the BYTES, never the address",
    /binds these bytes to their capture instant, not to the address/.test(String(at(hops,0).evidence)), true);

  /* THE STAMP IS WHAT KEEPS THIS FROM BEING A BACK-DATING. */
  t("every hop is stamped as reconstructed", !!at(hops,0).reconstructed, true);
  t("naming what produced it", (at(hops,0).reconstructed || {}).by, "op=provenancechain (REC-54)");
  t("and which recorded fields it was derived from",
    ((at(hops,0).reconstructed || {}).from || []).includes("locator") && ((at(hops,0).reconstructed || {}).from || []).includes("retrieved"), true);

  /* And the bundle is now clean for C-18.9 where it was not before. */
  const found = await runCatalog({ checkBundle }, { id: "INFO-2026-0011-fetched", docs: reg.documents });
  t("C-18.9 is satisfied afterwards", found.length, 0);
}

{
  /* ---- the member-original arm: no fetch, a custody record instead ---- */
  await seed("INFO-2026-0012-custody", [{ ...CUSTODY_SHAPED }]);
  const applied = await post("provenancechain", {}, "&bundleId=INFO-2026-0012-custody&apply=1");
  t("a member original reconstructs from its custody record", (applied.result||{}).applied, true);
  const hops = (await registerOf("INFO-2026-0012-custody")).documents[0].provenance_chain;
  t("one hop, and the attestor is the MEMBER rather than the instance", at(hops,0).who, "member bob-krause");
  t("via records that it never travelled a network", at(hops,0).via, "member");
  t("and it asserts only the custody the register recorded",
    /held these bytes and supplied them to the record at 2026-07-22T14:30:00Z/.test(String(at(hops,0).asserts)), true);
  t("stamped as reconstructed like every other derived hop", !!at(hops,0).reconstructed, true);
}

{
  /* ---- THE REFUSAL. This is the arm that makes the rest mean anything ---- */
  await seed("INFO-2026-0013-nothing", [{ ...NO_EVIDENCE }]);
  const r = await post("provenancechain", {}, "&bundleId=INFO-2026-0013-nothing&apply=1");
  t("a document whose route was never recorded is REFUSED, not repaired", (r.result||{}).reason, "EVIDENCE_INSUFFICIENT");
  t("and it is called undetermined by name", at(r.result.documents,0).outcome, "undetermined");
  t("naming what is missing rather than guessing",
    (at(r.result.documents,0).missing || []).length > 0, true);
  t("the detail says plainly that stating the route would be an invention",
    /would be an invention/.test(String((r.result||{}).detail)), true);
  t("and NOTHING was written",
    "provenance_chain" in (await registerOf("INFO-2026-0013-nothing")).documents[0], false);

  /* A REGISTER IS REFUSED WHOLE. Half a reconstruction is a register where a
     reader cannot tell which documents were established. */
  await seed("INFO-2026-0014-mixed", [{ ...LIVE_SHAPED }, { ...NO_EVIDENCE }]);
  const mixed = await post("provenancechain", {}, "&bundleId=INFO-2026-0014-mixed&apply=1");
  t("a register with one underivable document is refused WHOLE", (mixed.result||{}).reason, "EVIDENCE_INSUFFICIENT");
  t("and the derivable document was not written either",
    "provenance_chain" in (await registerOf("INFO-2026-0014-mixed")).documents[0], false);
}

{
  /* ---- a recorded chain is never overwritten by a derived one ---- */
  const witnessed = [{ who: "Internet Archive Wayback Machine", asserts: "served the replay",
                       evidence: "CDX record", bound: false, via: "archive.org" }];
  await seed("INFO-2026-0015-already", [{ ...LIVE_SHAPED, provenance_chain: witnessed }]);
  const r = await post("provenancechain", {}, "&bundleId=INFO-2026-0015-already&apply=1");
  t("a document that already records a chain is left alone", at(r.result.documents,0).outcome, "already_recorded");
  t("and the witnessed chain survives byte-for-byte",
    (await registerOf("INFO-2026-0015-already")).documents[0].provenance_chain, witnessed);
  t("nothing was applied", (r.result||{}).applied, false);
}

{
  /* ---- the op's own fences ---- */
  const absent = await post("provenancechain", {}, "&bundleId=INFO-2026-9999-nope");
  t("a bundle nobody can see refuses as absent", (absent.result||{}).reason, "NO_SUCH_BUNDLE");
  const noId = await post("provenancechain", {});
  t("no target is refused by name", (noId.result||{}).reason, "NO_BUNDLE");
}

/* =====================================================================
   (a) THE WRITE PATH — asserted at ITS OWN layer (VERIFICATION.md 3a)
   =====================================================================
   `runGate` has exactly one call site and it is `op=ratify`. `op=release` is
   the other way an Information document reaches `verified`, and it never asked
   C-18.9's question. The catalog arm above cannot see this and this cannot see
   the catalog arm, so both are asserted rather than one absorbing the other. */
console.log("\n--- the batch write path refuses a document that would reach verified with no chain ---");
{
  const src = readFileSync(STORE_SRC, "utf8");
  const idxSrc = readFileSync(IDX, "utf8");

  /* The structural fact that makes this necessary, pinned so it cannot drift
     silently: if runGate ever gains a second call site, this pin changes and
     somebody re-reads the reasoning above. */
  t("runGate still has exactly one call site in the control plane",
    [...idxSrc.matchAll(/await runGate\(/g)].length, 1);
  t("and release() now carries the chain among its entry requirements",
    /a provenance_chain for documents\[/.test(src), true);
}

const mfStore = new Miniflare({
  modules: true, script: readFileSync(STORE_SRC, "utf8"),
  modulesRoot: "/", scriptPath: STORE_SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const scall = async (p, body) => (await (await mfStore.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

{
  const STAMP = "viewer=class:member&owner=class:member";
  const ACK = encodeURIComponent("Uniform batch; bulk-release risks weighed.");
  const MIT = encodeURIComponent("Sampled 3 of 3; checked capture records.");
  const DATASET = JSON.stringify({ v: 1 });

  const mkCollected = async (id, docs) => {
    const body = `---\nid: ${id}\nobject_type: information\nschema: information@1\ntitle: "T ${id}"\n`
      + `current_state: collected\nprior_state: null\ncreated: "${NOW}"\nlast_updated: "${NOW}"\n`
      + `produced_by:\n  mode: assisted\n  capability_tier: session\ngroup: believe-in-oakland\n`
      + `references: []\nstate_history: []\nannotations_open: 0\nreeval_pending:\n  flag: false\n`
      + `  since: null\n  source: null\nvisuals: []\ncriticality: supporting\nsource_status: unchanged\n`
      + `content_hash: "sha256:${"c".repeat(64)}"\nsource:\n  locator: "https://example.org/x"\n`
      + `  authority: "Example"\n  retrieved: "2026-07-01"\nmonitoring:\n  enabled: false\n`
      + `  frequency: none\n  last_checked: null\n---\n\n## Summary\n\nX.\n`;
    const prov = JSON.stringify({ documents: docs }, null, 2);
    await scall("/promote", {
      bundleId: id, base: null, snapKey: "20260805T000000Z_bbbb2222", author: "m-riley",
      meta: { object_type: "information", group: "believe-in-oakland", title: `T ${id}`,
              current_state: "collected", created: NOW, last_updated: NOW },
      files: [
        { path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
        { path: "data/dataset.json", text: DATASET, bytes: DATASET.length, sha256: sha(DATASET) },
        { path: "snapshots/doc.pdf", text: "bytes", bytes: 5, sha256: sha("bytes") },
        { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
      ],
      register: [],
    });
    return id;
  };

  const noChain = await mkCollected("INFO-2026-0021-nochain", [{ ...LIVE_SHAPED }]);
  const h1 = (await scall(`/select?${STAMP}`, { ids: [noChain] })).handle;
  const r1 = await scall(`/release?handle=${h1}&acknowledgment=${ACK}&mitigation=${MIT}&author=m-riley&${STAMP}`);
  t("releasing a document with no chain is refused at the entry gate", (r1||{}).reason, "ENTRY_REQUIREMENTS");
  t("naming the chain as what is missing",
    /provenance_chain/.test(JSON.stringify((r1||{}).offenders)), true);
  t("and it never reached verified",
    (await scall(`/image?id=${noChain}&viewer=class:member`))["bundle.md"].includes("current_state: collected"), true);

  const withChain = await mkCollected("INFO-2026-0022-chain", [{ ...LIVE_SHAPED,
    provenance_chain: [{ who: "instance x", asserts: "y", evidence: "z", bound: false, via: "direct" }] }]);
  const h2 = (await scall(`/select?${STAMP}`, { ids: [withChain] })).handle;
  const r2 = await scall(`/release?handle=${h2}&acknowledgment=${ACK}&mitigation=${MIT}&author=m-riley&${STAMP}`);
  t("while a document that names its route still releases", (r2||{}).ok, true);
}

await mf.dispose();
await mfStore.dispose();
console.log(`\nprovenance-chain: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
