/* NEGATIVE CONTROL: run 2026-09-24 on src/odf.mjs, each arm ALONE, restored from a per-arm pristine copy and verified by sha256 (ab41dbceaf02fa31…, 76,343 B) AND cmp, 4 of 4 MATCH/IDENTICAL; RE-RUN on that final file after the ODF_FORMATS export was added, with identical tallies (first run on a76b2644…, 76,012 B). BASELINE 41 pass 0 fail. Declared before arming: ENV fails the three-exports arm and the fold while the changed-cell arm must still PASS; REF fails only §4's image arm; ODT fails only §4's .odt arms; OVER (over-strictness) fails the main arms. (1) ENV, the row's own: digest the ENVELOPE again (`sha256Hex(b)` for `sha256Hex(read.bytes)`): 34/7, failing BY NAME "THE THREE-EXPORTS ARM: one evidentiary digest across three envelopes", the content.xml recompute, C-18.3 FOLDS (and its normalised-arm and op=audit rows) and the monitor re-export reading modified; "A CHANGED CELL MOVES THE EVIDENTIARY DIGEST" still PASSED, as declared — an envelope digest moves on a real change too, which is why the three-exports arm, not the changed-cell arm, is what catches the liar. (2) REF, the member-reference refusal off: 38/3, the image arm by name. (3) ODT, claim .odt as measured: 38/3, the three .odt arms by name, and C-18.3 still did not fold the two .odt exports because M-121's xml:id instability moved the digest — the split is load-bearing. (4) OVER, refuse on EVERY href, the tidy over-strict rule: 24/17 across the main arms. FINDINGS ABOUT THE INSTRUMENT, recorded rather than smoothed: OVER's first draft was itself malformed (it threw on elements with no href), and that throw crashed op=acquire with a non-JSON 500 and ended this suite with NO TALLY (-1) — so `substanceDigests` now catches a throw in the container arm as a stated undetermined, and `P` reads a non-JSON reply as a failed answer; and OVER's second run PASSED the three-exports arm over three NULL digests (a free equality), so that arm now floors 3 non-null digests before comparing. */
/* D-351 — THE EVIDENTIARY DIGEST OF AN OPENDOCUMENT EXPORT, taken over the
 * CONTAINER'S substance member (`content.xml`) and never over the envelope,
 * driven THROUGH `op=acquire`, `op=promote`, the C-18.3 fold and `op=monitor`.
 *
 * THE DEFECT. A Google Drive export is Google's conversion at fetch time, and its
 * ZIP envelope differs on every request (MEASUREMENTS.md 2026-09-14 §4: timestamps
 * and member order). So three exports of one UNCHANGED Sheet carry three
 * `capture_sha`, the raw arm of C-18.3 folds nothing, and — because the bytes are
 * not read as text — the digests block said `determined: false`: the record could
 * not see that three captures were one document. It said LESS than it could.
 *
 * THE DESIGN. `BIO_Content_Framework_v0_10.md` §5 and DOCUMENT-PROFILES.md "Three
 * digests, not one": identity (the raw bytes — `capture_sha`, UNCHANGED, the trust
 * root), rendition, evidentiary. The evidentiary digest of an `.ods` is the sha256
 * of its content.xml member; the envelope, meta.xml, settings.xml, styles.xml and
 * thumbnails are discounted (src/odf.mjs, D-351 block, says which region each is).
 *
 * THE ROW'S BAR. Three exports of one unchanged `.ods` agree on the evidentiary
 * digest while their `capture_sha` differ, and C-18.3 folds them; a changed cell
 * moves the digest. HOW A LIAR PASSES IT: an envelope digest with timestamps
 * stripped agrees for free. So the three exports here differ in MEMBER ORDER and
 * in meta.xml/settings.xml CONTENT as well as in timestamps — a timestamp-stripping
 * envelope digest still sees three documents — and the changed-cell export keeps
 * the FIRST export's envelope exactly (order, timestamps, meta), so a digest that
 * read the envelope instead of content.xml would call it unchanged.
 *
 * THE SPLIT (the row's own alternative: "state it, or split .odt out"). `.odt`'s
 * content.xml differs on every export (M-121: random xml:id on text:list, measured
 * on 2 documents, which M-121 said this build must re-measure). It was NOT
 * re-measured, so `.odt` is UNDETERMINED here with the reason stated, never
 * normalised on an unmeasured rule. `.odp` has no measurement at all.
 *
 * WHAT THIS SUITE CANNOT SEE: Google. Every byte here is written by this file; the
 * claim that real Google `.ods` exports hold content.xml byte-stable is M-121's
 * (18/18 over 3 census targets, 13 minutes, one day) and MEASUREMENTS.md's (3/3),
 * cited, not re-measured.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { checkBundle } from "../checks/bio-checks.mjs";
import { ODT_CONTENT_TYPE, ODS_CONTENT_TYPE } from "../src/odf.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const HEX64 = /^[0-9a-f]{64}$/;

/* ---- an independent crc32 + zip assembler (drive.test.mjs's), with a
        per-member modification time so envelopes can differ by timestamp ---- */
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
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
  'xmlns:xlink="http://www.w3.org/1999/xlink"',
].join(" ");
const cell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
const sheetXml = (cells, extra = "") => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<office:document-content ${NS} office:version="1.3"><office:body><office:spreadsheet>`
  + `<table:table table:name="Budget"><table:table-row>${cells.map(cell).join("")}</table:table-row></table:table>`
  + extra + `</office:spreadsheet></office:body></office:document-content>`;
const textXml = (p) => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<office:document-content ${NS} office:version="1.3"><office:body><office:text>`
  + `<text:list xml:id="list${p.id}"><text:list-item><text:p>${p.text}</text:p></text:list-item></text:list>`
  + `</office:text></office:body></office:document-content>`;
const manifest = (mime) => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
  + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}"/></manifest:manifest>`;
const meta = (when) => `<?xml version="1.0" encoding="UTF-8"?><office:document-meta ${NS}><office:meta>`
  + `<meta:creation-date xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0">${when}</meta:creation-date>`
  + `</office:meta></office:document-meta>`;
const settings = (cursor) => `<?xml version="1.0" encoding="UTF-8"?><office:document-settings ${NS}>`
  + `<office:settings>CursorPositionX=${cursor}</office:settings></office:document-settings>`;
const STYLES = `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${NS}/>`;

/* One export: `order` permutes the members after the (first, stored) mimetype —
   the member-order instability MEASUREMENTS.md 2026-09-14 §4 names. */
const pkg = (mime, content, { mtime, when, cursor, order, more = [] }) => {
  const m = {
    manifest: { name: "META-INF/manifest.xml", data: manifest(mime) },
    content:  { name: "content.xml", data: content },
    styles:   { name: "styles.xml", data: STYLES },
    meta:     { name: "meta.xml", data: meta(when) },
    settings: { name: "settings.xml", data: settings(cursor) },
  };
  return zip([{ name: "mimetype", data: mime, store: true }, ...order.map((k) => m[k]), ...more], mtime);
};

/* OVER-STRICTNESS, BUILT INTO THE MAIN FIXTURE: an external hyperlink and a bare
   in-document anchor are hrefs that are NOT package members, and a digest that
   refused on every href would refuse every real sheet with a link in it. */
const LINKS = `<text:a xlink:href="https://www.oaklandca.gov/budget">source</text:a> `
  + `<text:a xlink:href="#Budget.A1">top</text:a>`;
const SHEET = sheetXml(["General Fund", "1,200,000", LINKS]);
const EXPORTS = [
  pkg(ODS_CONTENT_TYPE, SHEET, { mtime: 0x6a01, when: "2026-09-24T00:00:01", cursor: 3,
    order: ["manifest", "content", "styles", "meta", "settings"] }),
  pkg(ODS_CONTENT_TYPE, SHEET, { mtime: 0x6a17, when: "2026-09-24T00:00:09", cursor: 7,
    order: ["meta", "settings", "content", "styles", "manifest"] }),
  pkg(ODS_CONTENT_TYPE, SHEET, { mtime: 0x6a2c, when: "2026-09-24T00:00:17", cursor: 1,
    order: ["styles", "content", "manifest", "settings", "meta"] }),
];
/* THE CHANGED CELL, IN THE FIRST EXPORT'S ENVELOPE EXACTLY: same order, same
   timestamps, same meta.xml and settings.xml. Only content.xml differs, by one
   cell. An envelope digest would call this the same document. */
const CHANGED = pkg(ODS_CONTENT_TYPE, sheetXml(["General Fund", "1,250,000", LINKS]),
  { mtime: 0x6a01, when: "2026-09-24T00:00:01", cursor: 3, order: ["manifest", "content", "styles", "meta", "settings"] });
/* An .ods whose content.xml REFERENCES a package member (an image): content.xml
   cannot speak for the image's bytes, so no digest may be claimed. */
const WITH_IMAGE = pkg(ODS_CONTENT_TYPE,
  sheetXml(["General Fund", "1,200,000"],
    `<draw:frame><draw:image xlink:href="Pictures/chart.png" xlink:type="simple"/></draw:frame>`),
  { mtime: 0x6a01, when: "2026-09-24T00:00:01", cursor: 3, order: ["manifest", "content", "styles", "meta", "settings"],
    more: [{ name: "Pictures/chart.png", data: "\x89PNG-not-really" }] });
/* Two .odt exports of one unchanged Doc, differing the way M-121 measured: a
   random xml:id on text:list. */
const ODT = [
  pkg(ODT_CONTENT_TYPE, textXml({ id: "888038964", text: "Agenda item 4" }), { mtime: 0x6a01, when: "a", cursor: 1,
    order: ["manifest", "content", "styles", "meta", "settings"] }),
  pkg(ODT_CONTENT_TYPE, textXml({ id: "3685929024", text: "Agenda item 4" }), { mtime: 0x6a02, when: "b", cursor: 1,
    order: ["manifest", "content", "styles", "meta", "settings"] }),
];

const ID = { sheet: "1BbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu", changed: "1ZzCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu",
             image: "1YyCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu", doc: "1AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTt" };
const A = {
  sheet:   `https://docs.google.com/spreadsheets/d/${ID.sheet}/edit#gid=0`,
  changed: `https://docs.google.com/spreadsheets/d/${ID.changed}/edit`,
  image:   `https://docs.google.com/spreadsheets/d/${ID.image}/edit`,
  doc:     `https://docs.google.com/document/d/${ID.doc}/edit`,
  direct:  "https://www.oaklandca.gov/budget/general-fund.ods",
};
let sheetTake = 0, docTake = 0;
const served = { direct: EXPORTS[0] };
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-351", MEMBER_TOKEN: "mem-351", PROBE_TOKEN: "prb-351",
              VERSION: "test", INSTANCE_NAME: "d351test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url), p = u.pathname, fmt = u.searchParams.get("format");
    const ods = (b) => new Response(b, { headers: { "content-type": ODS_CONTENT_TYPE } });
    /* The export address the plane composes, and only it: each request is the
       NEXT export, the way Google converts afresh on every fetch. */
    if (p === `/spreadsheets/d/${ID.sheet}/export` && fmt === "ods") return ods(EXPORTS[sheetTake++ % 3]);
    if (p === `/spreadsheets/d/${ID.changed}/export` && fmt === "ods") return ods(CHANGED);
    if (p === `/spreadsheets/d/${ID.image}/export` && fmt === "ods") return ods(WITH_IMAGE);
    if (p === `/document/d/${ID.doc}/export` && fmt === "odt")
      return new Response(ODT[docTake++ % 2], { headers: { "content-type": ODT_CONTENT_TYPE } });
    if (u.host === "www.oaklandca.gov" && p === "/budget/general-fund.ods") return ods(served.direct);
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT on purpose: a plane that answers a non-JSON 500 must fail the
   assertions that read it, never end the module before its tally (WORKER.md:
   a TypeError inside an assertion goes through no assertion at all). */
const P = async (op, b) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-351&store=scratch`,
    { method: "POST", body: JSON.stringify(b) });
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return { ok: false, status: r.status, unparsed: txt.slice(0, 200) }; }
};
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-351&store=scratch&${q}`)).json();
const acquire = async (locator) => (await P("acquire", { locator })).document || null;
const dg = (d) => (d && d.profile && d.profile.digests) || {};
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

const NOW = "2026-09-24T00:00:00Z";
const bundleMd = (id, locator, monitored) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "D-351 ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City of Oakland", `  retrieved: ${NOW}`,
  "monitoring:", `  enabled: ${monitored}`, `  frequency: ${monitored ? "daily" : "none"}`,
  ...(monitored ? ["  last_checked: null"] : []), "---", "",
  "## Summary", "", "D-351 bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");
let seq = 0;
const promote = async (docs, locator, monitored = false, blobs = []) => {
  const id = `INFO-2026-${String(9350 + ++seq)}-d351`;
  const md = bundleMd(id, locator, monitored);
  const prov = JSON.stringify({ documents: docs });
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260924T000000Z_d351${String(seq).padStart(4, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `D-351 ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }, ...blobs.map((b) => b.file)],
    register: blobs.map((b) => b.reg),
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
console.log("\n--- 0. the fixture is armed: three exports, three envelopes, one content.xml ---");
{
  const shas = EXPORTS.map((b) => sha(b));
  console.log(`    CORPUS: ${EXPORTS.length} .ods exports · ${EXPORTS.map((b) => b.length).join(" / ")} B`);
  t("three distinct envelopes (the raw arm cannot fold them)", new Set(shas).size, 3);
  /* The liar's digest, computed here so the arm is non-vacuous: zero every
     local/central timestamp field and the three envelopes STILL differ, by
     member order and by meta.xml/settings.xml content. */
  const stripTimes = (b) => { const x = Buffer.from(b);
    for (let i = 0; i + 4 <= x.length; i++) {
      const s = x.readUInt32LE(i);
      if (s === 0x04034b50) { x.writeUInt32LE(0, i + 10); }
      else if (s === 0x02014b50) { x.writeUInt32LE(0, i + 12); }
    }
    return sha(x); };
  t("an envelope digest with timestamps stripped STILL sees three documents",
    new Set(EXPORTS.map(stripTimes)).size, 3);
}

/* ====================================================================== 1 */
console.log("\n--- 1. three exports of one unchanged .ods agree on the evidentiary digest ---");
const S = [await acquire(A.sheet), await acquire(A.sheet), await acquire(A.sheet)];
t("the fixture served three distinct exports", sheetTake, 3);
t("all three acquired", S.every((d) => d && typeof d.capture === "object"), true);
const caps = S.map((d) => d && d.capture && d.capture.sha256);
t("THE ENVELOPE: three distinct capture_sha — capture_sha stays the envelope's", new Set(caps).size, 3);
t("each capture_sha IS the sha256 of the export served (the trust root untouched)",
  caps, EXPORTS.map((b) => sha(b)));
t("each export's digest is DETERMINED — over a content.xml carrying an external link and an anchor",
  S.map((d) => dg(d).determined), [true, true, true]);
t("taken over content.xml, and saying so", S.map((d) => dg(d).over), ["content.xml", "content.xml", "content.xml"]);
t("the evidentiary digest is a 64-hex sha", HEX64.test(dg(S[0]).evidentiary || ""), true);
/* NON-NULL, THEN EQUAL: three absent digests agree for free — control arm OVER
   first passed this assertion over three nulls, which is why the floor is here. */
t("THE THREE-EXPORTS ARM: one evidentiary digest across three envelopes",
  [S.filter((d) => HEX64.test(dg(d).evidentiary || "")).length, new Set(S.map((d) => dg(d).evidentiary)).size], [3, 1]);
t("and it IS the sha256 of content.xml — recomputable from the artifact with stock tools",
  dg(S[0]).evidentiary, sha(Buffer.from(SHEET, "utf-8")));
t("the rendition digest is NOT claimed (nothing measured styles.xml)", dg(S[0]).rendition, null);
t("the basis names the measurement it rests on", /M-121/.test(dg(S[0]).basis || ""), true);
t("profiled_from_text is still false: the determination did not come from the text arm",
  S[0] && S[0].profile.profiled_from_text, false);

/* ====================================================================== 2 */
console.log("\n--- 2. a changed cell moves the digest (how a liar is caught) ---");
const Cx = await acquire(A.changed);
t("the changed-cell export's digest is determined", dg(Cx).determined, true);
t("A CHANGED CELL MOVES THE EVIDENTIARY DIGEST", dg(Cx).evidentiary !== dg(S[0]).evidentiary, true);

/* ====================================================================== 3 */
console.log("\n--- 3. C-18.3 folds the three exports; it does not fold a changed document ---");
{
  const three = await promote(S, A.sheet);
  t("the three-export bundle promoted", three.promoted, true);
  const f3 = await checksOf(three.id);
  const fold = f3.filter((x) => x.check === "C-18.3");
  t("C-18.3 FOLDS the three exports into one corroboration", fold.length, 1);
  t("by the NORMALISED arm (the raw arm cannot see them)", /share the evidentiary digest/.test(fold[0] ? fold[0].message : ""), true);
  const two = await promote([S[0], Cx], A.sheet);
  t("the changed-document bundle promoted", two.promoted, true);
  t("C-18.3 does NOT fold a changed cell", (await checksOf(two.id)).some((x) => x.check === "C-18.3"), false);
  const storeAudit = (await G("op=audit&limit=1000")).result;
  t("and op=audit's store-wide tally carries it, through the op", (storeAudit.tally["C-18.3"] || 0) >= 1, true);
}

/* ====================================================================== 4 */
console.log("\n--- 4. what is NOT claimed, and says why ---");
{
  const I = await acquire(A.image);
  t("an .ods whose content.xml references a package member: UNDETERMINED", dg(I).determined, false);
  t("its evidentiary digest is absent, never invented", dg(I).evidentiary, null);
  t("the basis names the member content.xml cannot speak for", /Pictures\/chart\.png/.test(dg(I).basis || ""), true);
  const D = [await acquire(A.doc), await acquire(A.doc)];
  t("the fixture served two distinct .odt exports", new Set(D.map((d) => d && d.capture.sha256)).size, 2);
  t(".odt: UNDETERMINED — the split the row allows, not a normalisation on an unmeasured rule",
    D.map((d) => dg(d).determined), [false, false]);
  t(".odt: no digest invented", D.map((d) => dg(d).evidentiary), [null, null]);
  t(".odt: the basis says why, citing the measurement that stands unrepeated",
    /xml:id/.test(dg(D[0]).basis || "") && /M-121/.test(dg(D[0]).basis || ""), true);
  t(".odt: C-18.3 therefore does not fold them — an absent digest is never equal",
    (await checksOf((await promote(D, A.doc)).id)).some((x) => x.check === "C-18.3"), false);
}

/* ====================================================================== 5 */
console.log("\n--- 5. op=monitor asks the same gate: an .ods served at its own address ---");
{
  /* op=monitor fetches `source.locator` itself. A Drive LINK is not composed into
     its export address there (a finding this item reports, not builds), so the
     monitor arm is driven with an .ods served directly — the same bytes, the same
     `substanceDigests` gate. */
  const base = await acquire(A.direct);
  t("the direct .ods baseline is determined", dg(base).determined, true);
  const cap = base && base.capture ? base.capture.sha256 : null, n = EXPORTS[0].length;
  const file = base ? base.file : "missing";
  const M = await promote([base], A.direct, true,
    [{ file: { path: file, blobSha: cap, sha256: cap, bytes: n }, reg: { sha256: cap, path: file, encoding: "binary", bytes: n } }]);
  t("the monitored bundle promoted", M.promoted, true);
  served.direct = EXPORTS[1];
  const re = await P("monitor", { bundleId: M.id });
  t("a re-export (new envelope) — the raw bytes really differ", re.seen !== null && re.seen !== re.baseline, true);
  t("re-export: status reads unchanged", re.status, "unchanged");
  t("re-export: compared evidentiary", re.compared, "evidentiary");
  t("re-export: the basis names content.xml", /content\.xml/.test(re.compared_basis || ""), true);
  t("re-export: no flag raised", re.reeval_raised, false);
  served.direct = CHANGED;
  const ch = await P("monitor", { bundleId: M.id });
  t("a changed cell: status reads modified", ch.status, "modified");
  t("a changed cell: compared evidentiary", ch.compared, "evidentiary");
  t("a changed cell: the flag is raised", ch.reeval_raised, true);
  const errs = (await checksOf(M.id)).filter((x) => x.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 130)}`);
  t("the gate finds nothing in the plane's own ticks", errs.length, 0);
}

await mf.dispose();
console.log(`\nd351-odf-evidentiary: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
