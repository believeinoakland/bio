/* NEGATIVE CONTROL: (declared before arming, run 2026-09-25 with `node test/nc-rec203.mjs [arm]` from `bio-plane/`;
   every arm ALONE, each EDITING A REAL SOURCE with its anchor required to match EXACTLY ONCE, restored from a
   uniquely-named per-arm pristine copy verified by sha256 AND cmp — never `git checkout --`.)
   (a) `baseline` — nothing armed. MUST be green.
   (b) `independence` — THE ROW'S CONTROL: two publications of one source counted as two systems (idspaces.mjs's
       independence test compares the HOST each end was retrieved from instead of the system it publishes). MUST
       FAIL the independence arm BY NAME ("the county's roll and Oakland's republication of it are ONE system");
       MUST NOT move the same-host arm (one host is one host either way) or any refusal arm.
   (c) `fundbare` — the fund NAME requirement dropped. MUST FAIL "a fund code alone never counts" by name.
   (d) `formjoin` — the form check dropped, so forms compare as plain strings. MUST FAIL the two cross-form arms
       (C###### against 100xxxx; the suffixed 1003439A against 1003439) and "it says no crosswalk is captured", by
       name; MUST NOT move the same-form arms.
   (e) OVER-STRICTNESS — the independence test written the other way round (`b` against `a`). MUST PASS.
   CONTROL RUN 2026-09-25 (figures as the suite printed them): (a) baseline GREEN 42/0 · (b) independence RED 41/1,
   the one FAIL "the county's roll and Oakland's republication of it are ONE system", the same-host arm GREEN ·
   (c) fundbare RED 41/1, "a fund code alone never counts — not even on a caller's reading" · (d) formjoin RED 39/3,
   exactly the two cross-form arms and "it says no crosswalk is captured" · (e) overstrict GREEN 42/0. idspaces.mjs
   restored after each arm to sha256 0cb6b2a508d6… (16,309 B), cmp-identical to its per-arm pristine copy. ALL FIVE
   AS DECLARED. One INSTRUMENT correction before the run, recorded at its arm: the APN "never RETIRED by absence"
   assertion first matched words and caught the answer's own "retired before the lineage".
 * =========================================================================
 * rec203-idspaces.test.mjs — REC-203. THE RECOGNISERS AND THE COUNTING RULE OF
 * `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT", with rule 3's APN
 * clause as BOB #34 amended it on M-157 (2026-09-25 01:50Z; cite until folded).
 *
 * THROUGH THE OP: every pair is judged by `op=idmatch` on Miniflare, over captures the plane ACQUIRED from scripted
 * addresses, so each end's system is read from the record's own `captured_locators` rows — the one route a real
 * caller has. The APN standing's RETIRED and CURRENT branches are judged at the module, because the record holds no
 * assessor vintage for the op to search; the op's own APN answer (UNDETERMINED over none) is asserted through it.
 *
 * WHAT IT CANNOT SEE: whether a value actually OCCURS in its capture's bytes (the op takes the caller's word for
 * the value and says so by reading nothing else); a live host; the viewer gate's refusal of a document in a
 * project the caller was never invited to (the refusal it shares with an absent capture is asserted instead).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { IDSPACE_CHECKS } from "../checks/bio-checks.mjs";

const SRC_DIR = process.env.REC203_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { recognise, apnStanding, judgePair, systemOfAddresses, CMS_FLOOR } = await import(join(SRC_DIR, "idspaces.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* THE SOURCES. Each address serves its own bytes; the systems are the ones M-119, M-132 and M-157 measured. */
const SOURCES = {
  leg:    ["https://webapi.legistar.com/v1/oakland/matters/10219", "LEG: award resolution, West Grand Avenue sewer, project C329142; 3100 Sewer Service Fund"],
  odp:    ["https://data.oaklandca.gov/resource/vmzx-e5fe.csv?project_code=C329142", "ODP: FY13-15 line C329142 West Grand Ave sewer rehab; 3100 Sewer Service Fund"],
  odp2:   ["https://data.oaklandca.gov/api/views/vmzx-e5fe/rows.csv", "ODP again: the same budget system's line items, published a second way"],
  county: ["https://services5.arcgis.com/ROBnTHSNjoZ2Wm1P/arcgis/rest/services/Parcels/FeatureServer/0/query?where=APN", "COUNTY: parcel layer row 11-836-17"],
  c3xp:   ["https://data.oaklandca.gov/resource/c3xp-qcgn.json?apn=011-0836-017-00", "OAKLAND PORTAL: the county layer republished, row 11-836-17"],
  www:    ["https://www.oaklandca.gov/documents/budget-book.pdf", "WEBSITE: a budget book naming C329142"],
  otherlegistar: ["https://webapi.legistar.com/v1/sanjose/matters/1", "SAN JOSE LEGISTAR: C329142"],
};

/* THE BITE: the ODP bytes served again at 32 more addresses of the same system, so one capture is located at 33. */
const MANY = "https://data.oaklandca.gov/resource/vmzx-e5fe.csv?page=";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r203", MEMBER_TOKEN: "mem-r203", PROBE_TOKEN: "prb-r203", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    if (request.url.startsWith(MANY)) return new Response(SOURCES.odp[1], { headers: { "content-type": "text/plain" } });
    const hit = Object.values(SOURCES).find(([u]) => u === request.url);
    return hit ? new Response(hit[1], { headers: { "content-type": "text/plain" } })
               : new Response("unscripted", { status: 500 });
  },
});

const POST = async (qs, body) => {
  const j = await (await mf.dispatchFetch(`http://x/api/?${qs}`, { method: "POST", body: JSON.stringify(body) })).json();
  return j && typeof j === "object" && "result" in j ? j.result : j;
};
const idmatch = async (params, tok = "adm-r203") => {
  const q = new URLSearchParams({ op: "idmatch", token: tok, ...params });
  const j = await (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
  return j && typeof j === "object" && "result" in j ? j.result : j;
};

/* ------------------------------------------------------------------ *
 * The fixture: each source ACQUIRED (which writes its locator) and registered under a bundle.
 * ------------------------------------------------------------------ */
const CAP = {};
{
  const NOW = "2026-09-25T02:00:00Z";
  let n = 0;
  for (const [k, [locator, text]] of Object.entries(SOURCES)) {
    const a = await POST("op=acquire&token=adm-r203", { locator, authority: "REC-203 fixture" });
    if (!a || !a.ok) throw new Error(`acquire ${k}: ${JSON.stringify(a).slice(0, 400)}`);
    CAP[k] = a.document.capture.sha256;
    const ID = `INFO-2026-0925-r203${String(++n).padStart(3, "0")}`;
    const md = ["---", `id: ${ID}`, "object_type: information", "schema: information@1", `title: "REC-203 ${k}"`,
      "current_state: collected", "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
      "produced_by:", "  mode: mechanical", "  capability_tier: daemon", "group: believe-in-oakland",
      "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
      "  since: null", "  source: null", "visuals: []", "---", "", "## Summary", "", `The ${k} capture.`, "",
      "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
    const p = await POST("op=promote&token=adm-r203", {
      bundleId: ID, base: null, snapKey: `20260925T0200${String(n).padStart(2, "0")}Z_r203`,
      files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
      register: [{ path: "snapshots/doc.txt", sha256: CAP[k], encoding: "utf8", bytes: Buffer.byteLength(text) }],
      meta: { object_type: "information", group: "believe-in-oakland", title: `REC-203 ${k}`,
              current_state: "collected", created: NOW, last_updated: NOW } });
    if (!p || !p.ok) throw new Error(`promote ${k}: ${JSON.stringify(p).slice(0, 400)}`);
  }
  console.log(`fixture: ${Object.keys(CAP).length} captures acquired and registered`);
  t("the fixture is not empty: seven captures, seven distinct shas", new Set(Object.values(CAP)).size, 7);
}

console.log("\n--- rule 1: a budget line and its Legistar award join by project number only when the referent agrees ---");
{
  const base = { space: "project", a: "C329142", a_capture: CAP.odp, b: "C329142", b_capture: CAP.leg };
  const agreed = await idmatch({ ...base, referent: "agrees" });
  t("budget (ODP) ↔ Legistar award, referent read as agreeing: SHARED, counts", [agreed.verdict, agreed.counts], ["SHARED", true]);
  t("each end's system is READ FROM THE RECORD", [agreed.a.system.origin, agreed.b.system.origin],
    ["oakland.budget", "oakland.legistar"]);
  t("and the answer says the referent reading is the CALLER'S, not the plane's", agreed.referent, { by: "the caller's reading", agrees: true });
  const unread = await idmatch(base);
  t("the same pair with NO referent reading does not count: REFERENT_UNREAD", [unread.verdict, unread.counts], ["REFERENT_UNREAD", false]);
  const dis = await idmatch({ ...base, referent: "disagrees" });
  t("read as naming different things: REFERENT_DISAGREES, not a match", [dis.verdict, dis.counts], ["REFERENT_DISAGREES", false]);
  const junk = await idmatch({ ...base, referent: "yes" });
  t("a reading that is neither word is no reading", junk.verdict, "REFERENT_UNREAD");
}

console.log("\n--- rule 1: INDEPENDENCE — two publications of one source are ONE system ---");
{
  const twoWays = await idmatch({ space: "project", a: "C329142", a_capture: CAP.odp, b: "C329142", b_capture: CAP.odp2,
                                  referent: "agrees" });
  t("the budget system published two ways (one host) is ONE system, whatever the reading", [twoWays.verdict, twoWays.counts],
    ["SAME_SYSTEM", false]);
  const roll = await idmatch({ space: "apn", a: "011-0836-017-00", a_capture: CAP.c3xp, b: "11-836-17", b_capture: CAP.county,
                               referent: "agrees" });
  t("the county's roll and Oakland's republication of it are ONE system", [roll.verdict, roll.counts], ["SAME_SYSTEM", false]);
  t("and the republication says the portal does not state its provenance",
    [roll.a.system.republication, roll.a.system.provenance_stated], [true, false]);
  const sj = await idmatch({ space: "project", a: "C329142", a_capture: CAP.otherlegistar, b: "C329142", b_capture: CAP.leg,
                             referent: "agrees" });
  t("another city's Legistar is not Oakland's record: its system is undetermined, so the pair does not count",
    [sj.verdict, sj.counts], ["SYSTEM_UNDETERMINED", false]);
  const www = await idmatch({ space: "project", a: "C329142", a_capture: CAP.www, b: "C329142", b_capture: CAP.leg,
                              referent: "agrees" });
  t("a document on the City's general website names no system, and the answer says why",
    [www.verdict, www.counts, /general website/.test(www.a.system.why)], ["SYSTEM_UNDETERMINED", false, true]);
  const lie = await idmatch({ space: "project", a: "C329142", a_capture: CAP.odp, b: "C329142", b_capture: CAP.odp2,
                              referent: "agrees", a_system: "oakland.legistar", b_system: "oakland.budget" });
  t("the caller cannot name the system: a pair of one system stays ONE system", [lie.verdict, lie.counts], ["SAME_SYSTEM", false]);
}

console.log("\n--- rule 1: a fund code alone never counts; the fund NAME must agree ---");
{
  const both = await idmatch({ space: "fund", a: "3100", a_capture: CAP.leg, a_name: "Sewer Service Fund",
                               b: "3100", b_capture: CAP.odp, b_name: "sewer service" });
  t("3100 with agreeing names in two systems: SHARED, the names compared by the plane itself",
    [both.verdict, both.counts, both.referent && both.referent.by], ["SHARED", true, "the names, compared normalised"]);
  const bare = await idmatch({ space: "fund", a: "3100", a_capture: CAP.leg, b: "3100", b_capture: CAP.odp, b_name: "Sewer Service Fund",
                               referent: "agrees" });
  t("a fund code alone never counts — not even on a caller's reading", [bare.verdict, bare.counts], ["FUND_NAME_ABSENT", false]);
  const differ = await idmatch({ space: "fund", a: "3100", a_capture: CAP.leg, a_name: "Sewer Service Fund",
                                 b: "3100", b_capture: CAP.odp, b_name: "Sewer Rate Stabilization Fund" });
  t("names that differ as written are a reading nobody has made: not counted", [differ.verdict, differ.counts], ["REFERENT_UNREAD", false]);
}

console.log("\n--- rule 2: forms told apart by SHAPE; across forms only through a captured crosswalk ---");
{
  const cross = await idmatch({ space: "project", a: "C329142", a_capture: CAP.odp, b: "1000858", b_capture: CAP.leg, referent: "agrees" });
  t("C###### against 100xxxx: the two forms stay UNJOINED, whatever the reading", [cross.verdict, cross.counts], ["FORMS_UNJOINED", false]);
  t("and it says no crosswalk is captured", /no(ne is)? captured|none is captured/.test(cross.says), true);
  const suffix = await idmatch({ space: "project", a: "1003439A", a_capture: CAP.odp, b: "1003439", b_capture: CAP.leg, referent: "agrees" });
  t("a suffixed value is a different form and string (M-157's 1003439A)", [suffix.verdict, suffix.counts], ["FORMS_UNJOINED", false]);
  const t1 = recognise("project", "C329142"), t2 = recognise("project", "1003439");
  t("the recognisers tell the forms apart by shape", [t1.form, t2.form], ["C#####", "100xxxx"]);
  t("a leading-zero variant is a NEAR-MISS, never counted",
    (await idmatch({ space: "cms", a: "9917 C.M.S.", a_capture: CAP.www, b: "09917", b_capture: CAP.leg })).near_miss, true);
}

console.log("\n--- OVER-STRICTNESS: correct values in spellings the recognisers must accept ---");
{
  const r = await idmatch({ space: "cms", a: "C.M.S. 87551", a_capture: CAP.odp, b: "87551 CMS", b_capture: CAP.leg, referent: "agrees" });
  t("'C.M.S. 87551' and '87551 CMS' are one value", [r.verdict, r.a.normal, r.b.normal], ["SHARED", "87551", "87551"]);
  const p = await idmatch({ space: "project", a: "#c329142", a_capture: CAP.odp, b: " C329142 ", b_capture: CAP.leg, referent: "agrees" });
  t("'#c329142' and ' C329142 ' are one project number", [p.verdict, p.counts], ["SHARED", true]);
  const apn = await idmatch({ space: "apn", a: "011-0836-017-00", a_capture: CAP.leg, b: "11-836-17", b_capture: CAP.county, referent: "agrees" });
  t("Legistar's padded APN and the county's unpadded one are one parcel (M-157's key)", [apn.verdict, apn.a.normal], ["SHARED", "11-836-17-0"]);
}

console.log("\n--- rule 3: the C.M.S. coverage floor — OUTSIDE THE RECORD'S REACH, never NOT FOUND ---");
{
  const old = await idmatch({ space: "cms", a: "Resolution No. 59916 C.M.S." });
  t("a resolution below Legistar's first reads OUTSIDE_REACH", old.a.reach.reach, "OUTSIDE_REACH");
  t("and never 'not found'", /not found/.test(old.a.reach.says) && /never "not found"/.test(old.a.reach.says), true);
  t("a resolution at the floor is INSIDE", (await idmatch({ space: "cms", a: `Resolution No. ${CMS_FLOOR.resolution}` })).a.reach.reach, "INSIDE");
  t("an ordinance one below its floor is OUTSIDE_REACH",
    (await idmatch({ space: "cms", a: `Ordinance No. ${CMS_FLOOR.ordinance - 1} C.M.S.` })).a.reach.reach, "OUTSIDE_REACH");
  t("13035 with no kind stated is UNDETERMINED between the floors, and says so",
    (await idmatch({ space: "cms", a: "13035 C.M.S." })).a.reach.reach, "UNDETERMINED");
}

console.log("\n--- rule 3 as BOB #34 amended it: an APN is RETIRED only where the assessor's lineage says so ---");
{
  const op = await idmatch({ space: "apn", a: "011-0836-017-00" });
  t("through the op, with no vintage held, an APN reads UNDETERMINED over none searched",
    [op.a.standing.standing, op.a.standing.vintages_searched], ["UNDETERMINED", []]);
  t("between retired-before-the-lineage and never-a-parcel", op.a.standing.between,
    ["retired before the earliest published lineage", "never a parcel"]);
  /* The standing is judged on its VALUE: the first draft of this arm matched words case-insensitively and
     caught the answer's own "retired before the lineage" — an instrument that failed on the rule it guards. */
  t("absence never reads RETIRED, and 'no such parcel' appears only as what it is never",
    [op.a.standing.standing !== "RETIRED",
     (JSON.stringify(op).match(/no such parcel/gi) || []).length
       === (JSON.stringify(op).match(/never \\"no such parcel\\"/gi) || []).length], [true, true]);
  const lineage = new Map([["11-836-17-0", [{ roll_year: 2014, children: ["11-836-40-0", "11-836-41-0"] }]]]);
  const ret = apnStanding("11-836-17-0", { lineage, current: new Set(), vintages: ["lineage 2005-06..2026-27"] });
  t("with the assessor's own lineage recording it: RETIRED, its roll year and children",
    [ret.standing, ret.roll_year, ret.children], ["RETIRED", 2014, ["11-836-40-0", "11-836-41-0"]]);
  t("in the current layer: CURRENT", apnStanding("10-787-33-0", { current: new Set(["10-787-33-0"]), lineage }).standing, "CURRENT");
  const none = apnStanding("33-2130-35-0", { current: new Set(), lineage, vintages: ["current layer", "lineage 2005-06..2026-27"] });
  t("absent from every vintage searched: UNDETERMINED, NAMING the vintages",
    [none.standing, none.vintages_searched], ["UNDETERMINED", ["current layer", "lineage 2005-06..2026-27"]]);
}

console.log("\n--- the three refusals (C-91), each with its catalogue row ---");
{
  const row = (code) => ({ code, check: IDSPACE_CHECKS[code].check, translation: IDSPACE_CHECKS[code].translation });
  const pick = (r) => ({ code: r.code, check: r.check, translation: r.translation });
  t("an unknown space: C-91.1", pick(await idmatch({ space: "zipcode", a: "94612" })), row("IDSPACE_UNKNOWN"));
  t("a value of no form's shape: C-91.2", pick(await idmatch({ space: "fund", a: "31000" })), row("IDSPACE_VALUE_NOT_IN_SPACE"));
  t("a pair naming a capture the record does not hold: C-91.3",
    pick(await idmatch({ space: "project", a: "C329142", a_capture: sha("never captured"), b: "C329142", b_capture: CAP.leg })),
    row("IDSPACE_CAPTURE_NOT_HELD"));
  t("a pair naming no capture at all: C-91.3, the same answer",
    pick(await idmatch({ space: "project", a: "C329142", b: "C329142", b_capture: CAP.leg })), row("IDSPACE_CAPTURE_NOT_HELD"));
}

console.log("\n--- the BOUND: a system is judged from EVERY address, and a cut read judges none ---");
{
  const within = await idmatch({ space: "project", a: "C329142", a_capture: CAP.odp, b: "C329142", b_capture: CAP.leg, referent: "agrees" });
  t("under the bound: the bound is published and the read is not cut", [within.limit, within.truncated], [32, false]);
  for (let i = 1; i <= 32; i++) {
    const r = await POST("op=acquire&token=adm-r203", { locator: `${MANY}${i}`, authority: "REC-203 fixture" });
    if (!r || !r.ok || r.document.capture.sha256 !== CAP.odp) throw new Error(`bite acquire ${i}: ${JSON.stringify(r).slice(0, 300)}`);
  }
  const cut = await idmatch({ space: "project", a: "C329142", a_capture: CAP.odp, b: "C329142", b_capture: CAP.leg, referent: "agrees" });
  t("33 addresses for one capture: the read is CUT, and says so", [cut.limit, cut.truncated], [32, true]);
  t("and a cut capture's system is UNDETERMINED, never judged off the addresses that fit",
    [cut.verdict, cut.counts, cut.a.system.origin], ["SYSTEM_UNDETERMINED", false, null]);
}

console.log("\n--- the module: a system is judged from EVERY address the record holds for the bytes ---");
{
  const mixed = systemOfAddresses([SOURCES.leg[0], SOURCES.odp[0]]);
  t("bytes located at two systems' addresses name neither", mixed.origin, null);
  t("no address at all names no system", systemOfAddresses([]).origin, null);
  const j = judgePair("project", { rec: recognise("project", "C329142"), system: { origin: "x" } },
                                 { rec: recognise("project", "C329142"), system: { origin: "x" } }, "agrees");
  t("the judge checks independence BEFORE the referent", j.verdict, "SAME_SYSTEM");
}

await mf.dispose();
console.log(`\nrec203-idspaces: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
