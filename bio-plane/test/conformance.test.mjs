/* NEGATIVE CONTROL: (run 2026-07-31) revert Store.snapPath to the non-canonical `_history/<snapKey>/<path>` layout (D-2) instead of the filename-suffix form -> 6 assertions fail (the snapshot-key-form and zero-C-12 / projection-conformant checks); restored, 49 pass. */
/* The plane's projection, judged by the authoritative catalog.
 *
 * Negative-control detail: revert Store.snapPath to the non-canonical `_history/<snapKey>/<path>` layout (D-2) instead of the filename-suffix form -> 6 assertions fail (the snapshot-key-form and zero-C-12 / projection-conformant checks); restored, 49 pass.
 *
 * Every other suite in this directory asserts what the plane's authors
 * believed. This one asserts what the specification requires, by importing
 * bio-checks and running it unmodified against the plane's actual output. It
 * exists because the gap between those two things was invisible for months:
 * plane-gate/0.1 implements four checks, the catalog has forty-nine, and the
 * plane's history layout diverged from canonical in three ways at once without
 * a single test noticing.
 *
 * Scope was once the C-12 history family alone, with other families counted and
 * reported but not failed, because the intake path did not yet write all fifteen
 * core fields (D-7). S-3 landed that in 0.5.1 and the gate port landed in 0.6.0,
 * so the assertion tightened to ZERO FINDINGS OF ANY FAMILY and has held there
 * since. Both assertions are kept below rather than collapsed into one: the
 * C-12 line names the family this suite was created for, and the general line is
 * the one that would catch a regression anywhere else. D-18 closed 0.19.0.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-conf", MEMBER_TOKEN: "mem-conf", PROBE_TOKEN: "prb-conf", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-conf",
  { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-conf&" + qs)).json();

/* A bundle with three revisions, so the history chain has something to be
   coherent about, and a nested data file, so the snapshot path exercises the
   directory case rather than only the bare-filename case. */
const ID = "INFO-2026-0001-conformance-target";
const md = (state, rev) => [
  "---", `id: ${ID}`, "object_type: information", "schema: information@1",
  `title: Conformance target`, `current_state: ${state}`, "prior_state: null",
  "created: 2026-07-24T00:00:00Z", "last_updated: 2026-07-24T0" + rev + ":00:00Z",
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", "  retrieved: 2026-07-24T00:00:00Z",
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `revision ${rev}`, "", "## Provenance Notes", "",
  "## Session Log", "",
  /* C-13.2: a bundle whose last_updated moves past created must say what
     happened. A revision that logs nothing is a revision nobody can audit. */
  /* C-5.1: the Session Log is append-only, so a revision carries every prior
     entry as well as its own. Dropping earlier entries is tamper, not tidying. */
  ...Array.from({ length: rev }, (_, i) => [`### Session ${i + 1}`, "", `Promoted revision ${i + 1}.`, ""]).flat(),
  "## Review Notes", "",
].join("\n");

const dataFor = (rev) => JSON.stringify({ rev }, null, 1);
const pkg = (rev, state, base, snapKey) => {
  const body = md(state, rev), data = dataFor(rev);
  return {
    bundleId: ID, base, snapKey, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Conformance target",
            current_state: state, created: "2026-07-24T00:00:00Z",
            last_updated: `2026-07-24T0${rev}:00:00Z` },
    files: [
      { path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) },
      { path: "data/dataset.json", text: data, bytes: data.length, sha256: sha(data) },
    ],
    register: [],
  };
};

const KEYS = ["20260724T010000Z_aaaa1111", "20260724T020000Z_bbbb2222", "20260724T030000Z_cccc3333"];
const r1 = await post("promote", pkg(1, "collected", null, KEYS[0]));
const r2 = await post("promote", pkg(2, "collected", r1.result.bundleSha, KEYS[1]));
const r3 = await post("promote", pkg(3, "collected", r2.result.bundleSha, KEYS[2]));
t("three revisions promoted", [r1.result.ok, r2.result.ok, r3.result.ok], [true, true, true]);

const img = (await get(`op=image&id=${ID}`)).result;

console.log("\n--- the projection is canonical ---");
t("bundle.md snapshots use the filename-suffix form",
  `_history/bundle_${KEYS[1]}.md` in img, true);
t("nested files keep their directory and take the suffix",
  `_history/data/dataset_${KEYS[1]}.json` in img, true);
t("no snapshot is projected under a key-named directory",
  Object.keys(img).some((k) => /^_history\/\d{8}T\d{6}Z/.test(k)), false);
t("a verbatim promotion record exists for every revision, creation included",
  KEYS.every((k) => `_history/promotion_${k}.json` in img), true);
t("the creation's base is the empty-string sentinel the catalog recognises",
  JSON.parse(img[`_history/promotion_${KEYS[0]}.json`]).base,
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
t("the manifest is projected", "_history/manifest.json" in img, true);

const man = JSON.parse(img["_history/manifest.json"]);
t("manifest entries claim the catalog's kind", [...new Set(man.entries.map((e) => e.kind))], ["promotion"]);
t("the creation snapshots nothing, having no prior state", man.entries[0].snapshotted, []);
t("later entries record what they snapshotted",
  man.entries[1].snapshotted.slice().sort(), ["bundle.md", "data/dataset.json"]);
const rec = JSON.parse(img[`_history/promotion_${KEYS[1]}.json`]);
t("the promotion record carries the bundle.md hash the chain needs",
  typeof (rec.files.find((f) => f.name === "bundle.md") || {}).sha256, "string");

console.log("\n--- the catalog judges the plane's own output ---");
const files = new Map(), elided = new Set();
for (const [p, v] of Object.entries(img)) {
  if (typeof v === "string") files.set(p, v); else elided.add(p);
}
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const { findings } = await checkBundle({
  folderName: ID, files, elidedPaths: elided,
  sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === ID,
});
const errs = findings.filter((f) => f.severity === "error");
const c12 = errs.filter((f) => f.check.startsWith("C-12"));
for (const f of c12) console.log(`         ${f.check}: ${f.message.slice(0, 120)}`);
t("zero C-12 findings: history accounts for itself", c12.length, 0);
t("and zero findings of any family: the projection is conformant", errs.length, 0);

for (const f of errs) console.log(`         unexpected: ${f.check} ${f.message.slice(0, 110)}`);

console.log("\n--- the gate runs the catalog, it does not imitate it ---");
{
  const { GATE_VERSION, CATALOG_VERSION } = await import("../src/gate.mjs");
  t("the gate names the catalog version it ran", GATE_VERSION.includes(CATALOG_VERSION), true);
  t("and calls itself 1.0, not 0.1", GATE_VERSION.startsWith("plane-gate/1.0"), true);
  const gateSrc = readFileSync(fileURLToPath(new URL("../src/gate.mjs", import.meta.url)), "utf8");
  t("it imports the catalog", /from "\.\.\/checks\/bio-checks\.mjs"/.test(gateSrc), true);
  t("and reimplements no check of its own",
    (gateSrc.match(/'C-\d/g) || []).length, 0);
}


/* ---- the intake path, judged per type ----
   The instance page's bundle writer is lifted out of the SERVED page and run
   here, so this tests the bytes a member's browser actually produces rather
   than a reimplementation of them. Four types, four canonical heading sets,
   four different sets of extension fields, and the catalog decides. */
console.log("\n--- the intake form writes conformant bundles ---");
{
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sandbox = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const fn = new Function(...Object.keys(sandbox), script + "\n;return { mdFor, FIRST_STATE, PREFIX, reviseText };");
  const ui = fn(...Object.values(sandbox));

  /* Superseded 2026-08-03 (REC-10): the catalog gained the inquiry machine
     (first state `open`) and KEEPS the legacy focus/problem vocabularies, so
     the derived table now carries all six keys, in the catalog's order. */
  t("first states come from the catalog, not from memory, legacy spellings included", ui.FIRST_STATE,
    { information: "collected", inquiry: "open", focus: "surfaced", project: "forming", action: "planned", problem: "surfaced" });

  const now = "2026-07-24T12:00:00Z";
  for (const type of ["information", "inquiry", "focus", "problem", "project", "action"]) {
    const id = `${ui.PREFIX[type]}-2026-0002-intake-check`;
    const text = ui.mdFor(id, type, ui.FIRST_STATE[type], "Intake check", "What the member wrote.", now);
    const f2 = new Map([["bundle.md", text]]);
    if (type === "information") {
      /* verified state would demand a dataset and a snapshot; collected does
         not, so an Information bundle at intake is complete as written. */
    }
    const { findings } = await checkBundle({
      folderName: id, files: f2, sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true,
    });
    const errs = findings.filter((x) => x.severity === "error");
    for (const x of errs.slice(0, 4)) console.log(`         ${type}: ${x.check} ${x.message.slice(0, 110)}`);
    if (type === "action") {
      /* Superseded 2026-08-04 (REC-23/D-130). This used to assert zero errors
         for an action too, and it PASSED because mdFor wrote
         `counterparty: to be named` and C-2.10 accepted any non-empty string.
         The old assertion was therefore true of the bytes and false about the
         record: what it certified as "conformant" was a bundle asserting a
         counterparty nobody had. Corrected, never exempted — and deliberately
         made SHARPER than "zero errors", because the one remaining finding is
         the point of the item:
           - the intake surface is still conformant in every other respect
             (headings, core fields, action_kind, risk_tier, state legality),
             so this still catches an intake regression the way it always did;
           - the ONE error is C-2.10 naming the absent counterparty, which is
             the honest state of a surface with no control to author one. The
             machine will not invent a name and will not invent an
             `undetermined` BASIS to get past its own gate — that is the
             D-97 pressure this project removes rather than reproduces.
         This assertion FLIPS BACK to zero errors when UI-19 gives the surface
         the radio pair (a named counterparty, or undetermined with an authored
         reason) and mdFor takes its values from the member. Until then, an
         action bundle that gates clean is one whose counterparty a person
         wrote. */
      t("a new action bundle has exactly one error", errs.length, 1);
      t("and it is C-2.10 naming the counterparty the surface cannot honestly author (UI-19 closes it)",
        errs.length === 1 && errs[0].check === "C-2.10" && /counterparty block is missing/.test(errs[0].message), true);
      continue;
    }
    t(`a new ${type} bundle has zero errors`, errs.length, 0);
  }
}


console.log("\n--- a revision through the browser stays conformant ---");
{
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script2 = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el2 = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sb = {
    document: { querySelector: () => el2(), querySelectorAll: () => [], getElementById: () => el2(),
                addEventListener() {}, createElement: () => el2(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sb.window = sb;
  const ui2 = new Function(...Object.keys(sb), script2 + "\n;return { mdFor, FIRST_STATE, reviseText };")(...Object.values(sb));

  const created = "2026-07-01T00:00:00Z";
  const first = ui2.mdFor("INFO-2026-0003-revise-check", "information", "collected",
    "Revise check", "First writing.", created);
  const later = "2026-07-24T12:00:00Z";
  const rev = ui2.reviseText(first + "\nEdited by hand.\n", "ruth", later);

  t("created is preserved, not overwritten with the save time",
    /^created: 2026-07-01T00:00:00Z$/m.test(rev), true);
  t("last_updated moves in the document itself",
    /^last_updated: 2026-07-24T12:00:00Z$/m.test(rev), true);
  t("a session entry is appended naming who did it",
    rev.includes("### Session " + later) && rev.includes("Revised by ruth."), true);

  const f3 = new Map([["bundle.md", rev]]);
  const { findings: rf } = await checkBundle({ folderName: "INFO-2026-0003-revise-check",
    files: f3, sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  const re = rf.filter((x) => x.severity === "error");
  for (const x of re) console.log(`         ${x.check}: ${x.message.slice(0, 120)}`);
  t("the revised bundle has zero errors", re.length, 0);

  /* A second revision must not eat the first one's entry (C-5.1). */
  const rev2 = ui2.reviseText(rev, "sparky", "2026-07-25T09:00:00Z");
  t("the earlier session entry survives a second revision",
    rev2.includes("### Session " + later), true);
  t("and the later one is present too",
    rev2.includes("### Session 2026-07-25T09:00:00Z"), true);
  t("Review Notes still follows the Session Log",
    rev2.indexOf("## Review Notes") > rev2.indexOf("### Session 2026-07-25T09:00:00Z"), true);
}


console.log("\n--- references have one home ---");
{
  /* The document is authoritative. A caller sending the old payload field is
     refused by name, and the refs table is a projection of the frontmatter, so
     the dangling-reference view and the catalog's C-6.2 read the same edges. */
  const RID = "INFO-2026-0004-refs-check";
  const withRef = (target) => md("collected", 1).replace("id: " + ID, "id: " + RID)
    .replace("references: []", ["references:", "  - rel: cites",
      "    target: " + target, "    status: confirmed", '    note: ""'].join("\n"));
  const body1 = withRef(ID);
  const mk = (text, base, snapKey) => ({
    bundleId: RID, base, snapKey, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Conformance target",
            current_state: "collected", created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [],
  });
  const bad = await post("promote", { ...mk(body1, null, "20260724T040000Z_dddd4444"), refs: [{ target: ID }] });
  t("a caller still sending payload refs is refused by name", bad.result.reason, "REFS_IN_PAYLOAD");

  const good = await post("promote", mk(body1, null, "20260724T040000Z_dddd4444"));
  t("without it, the promotion lands", good.result.ok, true);
  const dang1 = (await get(`op=dangling`)).result.dangling.filter((d) => d.bundle_id === RID);
  t("a reference to something that exists is not dangling", dang1.length, 0);

  const body2 = withRef("INFO-2026-9999-nowhere");
  const upd = await post("promote", mk(body2, good.result.bundleSha, "20260724T050000Z_eeee5555"));
  t("repointing it at nothing lands as a document edit", upd.result.ok, true);
  const dang2 = (await get(`op=dangling`)).result.dangling.filter((d) => d.bundle_id === RID);
  t("and the store's own view now sees the dangle", dang2.map((d) => d.target_id), ["INFO-2026-9999-nowhere"]);

  const img2 = (await get(`op=image&id=${RID}`)).result;
  const f4 = new Map(); for (const [p2, v] of Object.entries(img2)) if (typeof v === "string") f4.set(p2, v);
  const { findings: rf2 } = await checkBundle({ folderName: RID, files: f4,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === RID || x === ID });
  t("and the catalog agrees, by name",
    rf2.filter((x) => x.severity === "error").map((x) => x.check), ["C-6.2"]);
}

/* classification was removed from the Information catalog on 2026-07-27.
   Asserted BOTH ways (standing lesson 2): a bundle without the field is
   conformant, which every fixture above now proves, and a bundle still
   CARRYING the field is inert rather than refused, because history is
   append-only and the live corpus drains the field on each bundle's next
   promotion, not by decree. A catalog that errored on presence would flag
   every existing bundle for a field it no longer defines. */
{
  console.log("\n--- the retired classification field is inert, not refused ---");
  const carrying = md("collected", 1).replace(
    "criticality: supporting", "criticality: supporting\nclassification: fact");
  const data = dataFor(1);
  const f5 = new Map([["bundle.md", carrying], ["data/dataset.json", data]]);
  const { findings: cf } = await checkBundle({ folderName: ID, files: f5,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === ID });
  t("a bundle still carrying classification: fact draws no finding for it",
    cf.filter((x) => String(x.message).includes("classification")).length, 0);
  t("and no finding of any severity beyond what the bare fixture draws",
    cf.filter((x) => x.severity === "error").length, 0);
}

console.log("\n--- C-18.9: what a capture must establish before it may be published ---");
{
  /* CORRECTED 2026-07-31, not exempted. This suite previously asserted that
     content-authority-undetermined material could not cross the fence. That
     rule was wrong and the reason is the project's own: refusing publication
     on a missing attribution recreates, at the publication gate, the pressure
     to INVENT an authority that D-97 removed at the intake gate. The gate now
     sits on the PROVENANCE CHAIN, which is what a published hash actually
     attests, and on the undetermined state being STATED rather than silent.

     Deliberately minimal fixtures: other families will find plenty here, and
     only C-18.9 is asserted, so what is measured is the fence and nothing
     else. */
  const HOP = [{ who: "instance biosmoke7 (CivicOS/test)",
                 asserts: "these bytes were served for https://example.gov/doc.pdf",
                 evidence: "first-party https fetch", bound: false, via: "direct" }];
  const prov = (o = {}) => JSON.stringify({ documents: [{
    file: "snapshots/doc.pdf", locator: "https://example.gov/doc.pdf",
    retrieved: "2026-07-30T00:00:00Z",
    authority_state: o.det ? "determined" : "undetermined",
    ...(o.det ? { authority: "Example City" } : {}),
    ...(o.noBasis ? {} : { authority_basis: o.det
      ? "asserted by the capturing member at intake, 2026-07-30T00:00:00Z"
      : "no assertion was supplied and no mechanical determination is implemented; recorded 2026-07-30T00:00:00Z" }),
    ...(o.chain === undefined ? { provenance_chain: HOP } : (o.chain === null ? {} : { provenance_chain: o.chain })),
    capture: { method: "test", grade: "B", actor_class: "daemon", sha256: "0".repeat(64) },
    origin: { kind: "named_request" },
  }] });
  const md = (state) => `---\nid: INFO-2026-0009-fence\nobject_type: information\ncurrent_state: ${state}\n---\n\n# Fence\n`;
  const run = async (state, o) => {
    const files = new Map([["bundle.md", md(state)], ["data/provenance.json", prov(o)]]);
    const { findings } = await checkBundle({ folderName: "INFO-2026-0009-fence", files,
      sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
    return findings.filter((x) => x.check === "C-18.9");
  };
  t("undetermined in the working corpus draws nothing", (await run("collected", {})).length, 0);
  t("undetermined content authority NO LONGER blocks publication, when it is stated",
    (await run("verified", {})).length, 0);
  t("a determined authority still passes", (await run("verified", { det: true })).length, 0);

  const silent = await run("verified", { noBasis: true });
  t("but undetermined and SILENT is refused", silent.length, 1);
  t("naming the distinction: an unanswered question may be published, an unstated one may not",
    /unanswered question is honest only when the record says it is unanswered/.test(silent[0].message), true);

  const noChain = await run("verified", { chain: null });
  t("no provenance chain at all is refused at the fence", noChain.length, 1);
  t("because a published hash claims a route the document does not name",
    /claims these bytes came from somewhere by some route/.test(noChain[0].message), true);

  const anon = await run("verified", { chain: [{ asserts: "x", bound: false }] });
  t("an unattributed hop is refused", anon.length, 1);
  t("naming what a hop must carry", /names no attestor/.test(anon[0].message), true);

  const twoHop = await run("verified", { chain: [HOP[0], { who: "Internet Archive Wayback Machine",
    asserts: "these bytes were served for the original", bound: false, via: "archive.org" }] });
  t("a two-hop archive chain passes, which is the whole point of disclosure", twoHop.length, 0);

  t("determined with no authority named is refused",
    (await run("verified", { det: true, chain: undefined })).length === 0
      ? (await (async () => { const files = new Map([["bundle.md", md("verified")],
          ["data/provenance.json", JSON.stringify({ documents: [{ file: "snapshots/doc.pdf",
            locator: "https://example.gov/doc.pdf", retrieved: "2026-07-30T00:00:00Z",
            authority_state: "determined", authority: "   ", authority_basis: "b",
            provenance_chain: HOP,
            capture: { method: "test", grade: "B", actor_class: "daemon", sha256: "0".repeat(64) },
            origin: { kind: "named_request" } }] })]]);
          const { findings } = await checkBundle({ folderName: "INFO-2026-0009-fence", files,
            sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
          return findings.filter((x) => x.check === "C-18.9").length; })())
      : -1, 1);
}

await mf.dispose();
console.log(`\nconformance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
