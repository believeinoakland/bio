/* NEGATIVE CONTROL: run 2026-09-25 on src/odf.mjs's `odtNormalisedContentXml`, each arm ALONE, restored from a uniquely-named per-arm pristine copy in the session scratchpad and verified by sha256 (e4eedeef82f084b6…) AND cmp, 80,191 B, 3 of 3 IDENTICAL. BASELINE 28 pass 0 fail (d351-odf-evidentiary 41/0). Declared before arming: SKIP must fail the re-fetch pair, the fold and the monitor's `unchanged` while the one-byte text arm still PASSES; STRIP (delete xml:id, leave text:continue-list verbatim — the row's literal "strip") must fail only the continue-list over-strictness arms; ERASE (delete xml:id AND text:continue-list — the tidy rule that hides a change) must fail "A LIST THAT CONTINUES A DIFFERENT LIST MOVES THE DIGEST". (1) SKIP, the row's own — skip the relabelling (return the bytes unchanged): 20/8, failing BY NAME "THE RE-FETCH PAIR: one evidentiary digest across two exports with fresh list ids", C-18.3 FOLDS and its normalised arm, and "ACCEPTS-WHEN: an unchanged Doc reads `unchanged`"; "A ONE-BYTE TEXT CHANGE MOVES THE DIGEST" still PASSED, as declared; d351's corrected .odt arms failed 39/2; and over the LIVE pairs (M-167) `tools/measure-odf-stability.mjs derive` read the list-bearing Docs 1aJYj4Nb…, 1jZcxvXs… and 1kW6nVp3… NORMALISED_UNSTABLE by name, the instrument's own control 11/15. (2) STRIP: 25/3 — the over-strictness arm and the monitor arm (its Doc continues a list), plus the relabel-shape pin; d351 41/0. A FINDING about the row's wording: "strip xml:id" alone leaves a text:continue-list naming a random id, so it is NOT stable over a Doc that continues a list; the relabelling is what the measurement licenses. (3) ERASE: 26/2 — the different-list arm by name, plus the relabel-shape pin: a rule that forgets the relationship an id carries folds a real change. */
/* D-473 — THE `.odt` EVIDENTIARY DIGEST: Google's per-export list ids relabelled,
 * driven THROUGH `op=acquire`, `op=promote`, the C-18.3 fold and `op=monitor`
 * over a Drive Doc LINK.
 *
 * THE DEFECT. D-351 gave `.ods` an evidentiary digest over content.xml and split
 * `.odt` out UNDETERMINED, because Google writes a fresh random `xml:id` on every
 * `<text:list>` at every export (M-123, 2 documents) and the normalisation had
 * not been measured. So a Google Doc nobody touched read `modified` on every
 * monitor tick where Google's conversion moved the ids — the cry-wolf D-472's
 * worker named — and C-18.3 could not fold two exports of one Doc.
 *
 * THE MEASUREMENT this build rests on is `docs/development/measurements/M-167.md`
 * (D-473): a fresh population of public government Docs and Slides, each fetched
 * twice apart in time through the plane's egress. This suite cannot see Google;
 * every byte here is written by this file, shaped the way M-167 measured.
 *
 * THE BAR. Two exports of one unchanged Doc, differing in envelope AND in every
 * list's random id, carry one evidentiary digest while their capture_sha differ,
 * and C-18.3 folds them; a one-byte text change moves it; a list that continues
 * a DIFFERENT list moves it (the relabelling keeps the relationship an id
 * carries — stripping the ids would have hidden that change); and the monitor
 * reads a re-export `unchanged` and a changed Doc `modified`. `.odp` stays
 * UNDETERMINED, naming its census target.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { checkBundle } from "../checks/bio-checks.mjs";
import { ODT_CONTENT_TYPE, ODP_CONTENT_TYPE, odtNormalisedContentXml } from "../src/odf.mjs";
import { readDriveAddress } from "../src/drive.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const HEX64 = /^[0-9a-f]{64}$/;

/* ---- an independent crc32 + zip assembler (d351's), per-member mtime ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32le = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files, mtime) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.from(f.data, "utf-8");
    const method = f.store ? 0 : 8;
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(mtime), u16le(0x5921),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(mtime), u16le(0x5921),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

const NS = [
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
  'xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"',
  'xmlns:xlink="http://www.w3.org/1999/xlink"',
].join(" ");
/* A Doc the way Google exports it: several lists, each with a random xml:id;
   `cont` makes the LAST list continue list number `cont` (text:continue-list),
   the one relationship an id carries. An external link rides along (an href
   that is not a package member — over-strictness, built in). */
const docXml = ({ ids, text = "Item 4: approve the minutes", cont = null }) => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<office:document-content ${NS} office:version="1.3"><office:body><office:text>`
  + `<text:p>${text} <text:a xlink:href="https://www.oaklandca.gov/agenda">agenda</text:a></text:p>`
  + ids.map((id, i) => `<text:list xml:id="list${id}" text:style-name="L${i}"`
      + `${cont !== null && i === ids.length - 1 ? ` text:continue-list="list${ids[cont]}"` : ""}>`
      + `<text:list-item><text:p>point ${i}</text:p></text:list-item></text:list>`).join("")
  + `</office:text></office:body></office:document-content>`;
const slidesXml = `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${NS} office:version="1.3">`
  + `<office:body><office:presentation><draw:page draw:name="p1"><draw:frame><draw:text-box><text:p>Budget</text:p>`
  + `</draw:text-box></draw:frame></draw:page></office:presentation></office:body></office:document-content>`;
const manifest = (mime) => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
  + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}"/></manifest:manifest>`;
const meta = (n) => `<?xml version="1.0" encoding="UTF-8"?><office:document-meta ${NS}><office:meta>`
  + `<meta:creation-date xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">2026-09-25T00:00:0${n}</meta:creation-date>`
  + `</office:meta></office:document-meta>`;
const pkg = (mime, content, n) => zip([
  { name: "mimetype", data: mime, store: true },
  ...(n % 2 ? [{ name: "content.xml", data: content }, { name: "META-INF/manifest.xml", data: manifest(mime) }]
            : [{ name: "META-INF/manifest.xml", data: manifest(mime) }, { name: "content.xml", data: content }]),
  { name: "meta.xml", data: meta(n) },
], 0x6a00 + n);

/* A FRESH RANDOM ID PER LIST PER EXPORT, as M-167 measured (never a fixed pair,
   so the suite cannot pass on two ids it happens to know). */
let rnd = 0x9e3779b9;
const nextId = () => { rnd = (Math.imul(rnd ^ (rnd >>> 15), 0x2c1b3c6d) + 0x297a2d39) >>> 0; return String(rnd); };
const freshIds = (k) => Array.from({ length: k }, nextId);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* THE FIXTURE'S DRIVE: each request to an export address is the NEXT export. */
const DOC_ID = "1d473OdtListIdsDocAAAAAAAAAAAAAAAAAAAAAAAA";
const CHG_ID = "1d473OdtChangedDocBBBBBBBBBBBBBBBBBBBBBBBB";
const CNT_ID = "1d473OdtContinueDocCCCCCCCCCCCCCCCCCCCCCCC";
const MON_ID = "1d473OdtMonitoredDocDDDDDDDDDDDDDDDDDDDDDD";
const DECK_ID = "1d473OdpSlidesDeckEEEEEEEEEEEEEEEEEEEEEEEE";
const docLink = (id) => `https://docs.google.com/document/d/${id}/edit`;
const DECK = `https://docs.google.com/presentation/d/${DECK_ID}/edit`;
let n = 0;
const served = [];
let monText = "Item 4: approve the minutes";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-473", MEMBER_TOKEN: "mem-473", PROBE_TOKEN: "prb-473",
              VERSION: "test", INSTANCE_NAME: "d473test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url), p = u.pathname, fmt = u.searchParams.get("format");
    const odt = (content) => { const b = pkg(ODT_CONTENT_TYPE, content, ++n); served.push(sha(b));
      return new Response(b, { headers: { "content-type": ODT_CONTENT_TYPE } }); };
    if (u.hostname === "docs.google.com" && fmt === "odt") {
      if (p === `/document/d/${DOC_ID}/export`) return odt(docXml({ ids: freshIds(3) }));
      if (p === `/document/d/${CHG_ID}/export`) return odt(docXml({ ids: freshIds(3), text: "Item 4: approve the minuteS" }));
      if (p === `/document/d/${CNT_ID}/export`) return odt(docXml({ ids: freshIds(3), cont: 0 }));
      if (p === `/document/d/${MON_ID}/export`) return odt(docXml({ ids: freshIds(3), cont: 1, text: monText }));
    }
    if (u.hostname === "docs.google.com" && fmt === "odp" && p === `/presentation/d/${DECK_ID}/export`)
      return new Response(pkg(ODP_CONTENT_TYPE, slidesXml, ++n), { headers: { "content-type": ODP_CONTENT_TYPE } });
    return new Response("unscripted", { status: 500 });
  },
});
/* NULL-TOLERANT: a non-JSON 500 fails the assertions that read it, never ends the module. */
const P = async (op, b) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-473&store=scratch`,
    { method: "POST", body: JSON.stringify(b) });
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return { ok: false, status: r.status, unparsed: txt.slice(0, 200) }; }
};
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-473&store=scratch&${q}`)).json();
const acquire = async (locator) => (await P("acquire", { locator, authority: "City Clerk" })).document || null;
const dg = (d) => (d && d.profile && d.profile.digests) || {};
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

const NOW = "2026-09-25T00:00:00Z";
const bundleMd = (id, locator, monitored) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "D-473 ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City of Oakland", `  retrieved: ${NOW}`,
  "monitoring:", `  enabled: ${monitored}`, `  frequency: ${monitored ? "weekly" : "none"}`,
  ...(monitored ? ["  last_checked: null"] : []), "---", "",
  "## Summary", "", "D-473 bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");
let seq = 0;
const promote = async (docs, locator, monitored = false) => {
  const id = `INFO-2026-${String(9470 + ++seq)}-d473`;
  const md = bundleMd(id, locator, monitored);
  const prov = JSON.stringify({ documents: docs });
  const files = [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
                 { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }];
  const register = [];
  if (monitored) for (const d of docs) {
    files.push({ path: d.file, blobSha: d.capture.sha256, sha256: d.capture.sha256, bytes: d.capture.bytes });
    register.push({ sha256: d.capture.sha256, path: d.file, encoding: "binary", bytes: d.capture.bytes });
  }
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260925T000000Z_d473${String(seq).padStart(4, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `D-473 ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files, register,
  });
  return { id, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};
const checksOf = async (id) => {
  const img = (await G(`op=image&id=${encodeURIComponent(id)}`)).result;
  const files = new Map(), el = new Set();
  for (const [p, v] of Object.entries(img)) { if (typeof v === "string") files.set(p, v); else el.add(p); }
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: el,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  return findings;
};

/* ====================================================================== 0 */
console.log("\n--- 0. the recogniser is live and the fixture moves what M-167 measured ---");
t("THE RECOGNISER IS LIVE — the Doc link composes an `export?format=odt` address",
  (readDriveAddress(docLink(DOC_ID)) || {}).exportAddress, `https://docs.google.com/document/d/${DOC_ID}/export?format=odt`);
{
  const a = docXml({ ids: freshIds(3) }), b = docXml({ ids: freshIds(3) });
  t("two exports' content.xml DIFFER raw (the class is present, not assumed)", a === b, false);
  t("…and relabelled by the plane's normaliser they are byte-equal",
    sha(odtNormalisedContentXml(new TextEncoder().encode(a))), sha(odtNormalisedContentXml(new TextEncoder().encode(b))));
  t("the relabelling writes L1, L2, … and keeps every other byte",
    new TextDecoder().decode(odtNormalisedContentXml(new TextEncoder().encode(a))),
    a.replace(/xml:id="list\d+"/g, ((k) => () => `xml:id="L${++k}"`)(0)));
  t("content.xml that is not valid UTF-8 is REFUSED (null), never decoded lossily",
    odtNormalisedContentXml(new Uint8Array([0x3c, 0xff, 0x3e])), null);
}

/* ====================================================================== 1 */
console.log("\n--- 1. two exports of one unchanged Doc agree on the evidentiary digest ---");
const D = [await acquire(docLink(DOC_ID)), await acquire(docLink(DOC_ID))];
t("both acquired as .odt", D.map((d) => d && d.profile && d.profile.format && d.profile.format.format), ["odt", "odt"]);
t("THE ENVELOPE: two distinct capture_sha — capture_sha stays the envelope's",
  new Set(D.map((d) => d && d.capture.sha256)).size, 2);
t("each capture_sha IS the sha256 of the export served (the trust root untouched)",
  D.map((d) => d && d.capture.sha256), served.slice(0, 2));
t("each .odt digest is DETERMINED, over content.xml", D.map((d) => [dg(d).determined, dg(d).over]),
  [[true, "content.xml"], [true, "content.xml"]]);
/* NON-NULL, THEN EQUAL: two absent digests agree for free. */
t("THE RE-FETCH PAIR: one evidentiary digest across two exports with fresh list ids",
  [D.filter((d) => HEX64.test(dg(d).evidentiary || "")).length, new Set(D.map((d) => dg(d).evidentiary)).size], [2, 1]);
t("the basis names the normalisation and the measurement it rests on",
  /odt-list-ids v1/.test(dg(D[0]).basis || "") && /M-167/.test(dg(D[0]).basis || ""), true);

/* ====================================================================== 2 */
console.log("\n--- 2. what a normalisation must NOT hide ---");
const Cx = await acquire(docLink(CHG_ID));
t("A ONE-BYTE TEXT CHANGE MOVES THE DIGEST", HEX64.test(dg(Cx).evidentiary || "") && dg(Cx).evidentiary !== dg(D[0]).evidentiary, true);
const K = [await acquire(docLink(CNT_ID)), await acquire(docLink(CNT_ID))];
t("OVER-STRICTNESS: a list continuing another, relabelled consistently, is STABLE across exports",
  [K.filter((d) => HEX64.test(dg(d).evidentiary || "")).length, new Set(K.map((d) => dg(d).evidentiary)).size], [2, 1]);
t("A LIST THAT CONTINUES A DIFFERENT LIST MOVES THE DIGEST — the relationship an id carries survives",
  dg(K[0]).evidentiary !== dg(D[0]).evidentiary, true);

/* ====================================================================== 3 */
console.log("\n--- 3. C-18.3 folds the two exports; it does not fold a changed Doc ---");
{
  const two = await promote(D, docLink(DOC_ID));
  t("the two-export bundle promoted", two.promoted, true);
  const fold = (await checksOf(two.id)).filter((x) => x.check === "C-18.3");
  t("C-18.3 FOLDS the two .odt exports into one corroboration", fold.length, 1);
  t("by the NORMALISED arm", /share the evidentiary digest/.test(fold[0] ? fold[0].message : ""), true);
  const ch = await promote([D[0], Cx], docLink(DOC_ID));
  t("C-18.3 does NOT fold a changed Doc", (await checksOf(ch.id)).some((x) => x.check === "C-18.3"), false);
}

/* ====================================================================== 4 */
console.log("\n--- 4. op=monitor over a Drive Doc LINK: the cry-wolf ends, a real change still reads ---");
{
  const base = await acquire(docLink(MON_ID));
  t("the monitored Doc's baseline digest is determined", dg(base).determined, true);
  const M = await promote([base], docLink(MON_ID), true);
  t("the monitored bundle promoted", M.promoted, true);
  const m1 = await P("monitor", { bundleId: M.id }), m2 = await P("monitor", { bundleId: M.id });
  t("ACCEPTS-WHEN: an unchanged Doc reads `unchanged` across two re-exports", [m1.status, m2.status], ["unchanged", "unchanged"]);
  t("…on the EVIDENTIARY comparison", [m1.compared, m2.compared], ["evidentiary", "evidentiary"]);
  t("…while the RAW bytes differed on both ticks (the arm is not free)",
    [m1.seen === m1.baseline, m2.seen === m2.baseline], [false, false]);
  monText = "Item 4: approve the minutes as amended";
  const m3 = await P("monitor", { bundleId: M.id });
  t("a changed Doc reads `modified`, on the evidentiary comparison", [m3.status, m3.compared], ["modified", "evidentiary"]);
  t("…and raises the re-evaluation flag", m3.reeval_raised, true);
}

/* ====================================================================== 5 */
console.log("\n--- 5. .odp: NOT claimed, and says why ---");
{
  const S = await acquire(DECK);
  t("an .odp export is acquired as .odp", S && S.profile && S.profile.format && S.profile.format.format, "odp");
  t(".odp: UNDETERMINED, no digest invented", [dg(S).determined, dg(S).evidentiary], [false, null]);
  t(".odp: the basis cites M-167 and names the census target that would widen it",
    /M-167/.test(dg(S).basis || "") && /census target/.test(dg(S).basis || ""), true);
}

await mf.dispose();
console.log(`\nd473-odt-evidentiary: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
