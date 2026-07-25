/* The plane's projection, judged by the authoritative catalog.
 *
 * Every other suite in this directory asserts what the plane's authors
 * believed. This one asserts what the specification requires, by importing
 * bio-checks and running it unmodified against the plane's actual output. It
 * exists because the gap between those two things was invisible for months:
 * plane-gate/0.1 implements four checks, the catalog has forty-nine, and the
 * plane's history layout diverged from canonical in three ways at once without
 * a single test noticing.
 *
 * Scope today is the C-12 history family, which is what the canonical
 * projection work (PLAN.md S-1) claims to fix. Findings from other families are
 * counted and reported but not failed, because the intake path does not yet
 * write all fifteen core fields (DEBT.md D-7) and pretending otherwise would
 * make this suite red for a reason it is not testing. When S-3 lands, the
 * assertion below tightens from "zero C-12 findings" to "zero findings".
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
  "classification: fact", "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", "  retrieved: 2026-07-24T00:00:00Z",
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `revision ${rev}`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
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
    refs: [], register: [],
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

/* Reported, not asserted. See the header: the intake path owes D-7. */
const byFamily = {};
for (const f of errs) {
  const fam = f.check.split(".")[0];
  byFamily[fam] = (byFamily[fam] || 0) + 1;
}
console.log(`         remaining error families (not asserted yet): ${JSON.stringify(byFamily)}`);


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
  const fn = new Function(...Object.keys(sandbox), script + "\n;return { mdFor, FIRST_STATE, PREFIX };");
  const ui = fn(...Object.values(sandbox));

  t("first states come from the catalog, not from memory", ui.FIRST_STATE,
    { information: "collected", problem: "surfaced", project: "forming", action: "planned" });

  const now = "2026-07-24T12:00:00Z";
  for (const type of ["information", "problem", "project", "action"]) {
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
    t(`a new ${type} bundle has zero errors`, errs.length, 0);
  }
}

await mf.dispose();
console.log(`\nconformance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
