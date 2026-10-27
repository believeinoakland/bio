/* odf-reader: odfEvidentiaryDigest, the evidentiary digest of an
 * OpenDocument package's substance (build/requirements/odf-reader.md R32–R37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { odfEvidentiaryDigest, odtNormalisedContentXml, ODF_EVIDENTIARY_VERSION, ODF_EVIDENTIARY_MEASURED, ODF_EVIDENTIARY_NORMALISE } from "../../../src/odf.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { buildZip, members, pkg, withCd, contentXml, sha256, sha256Hex, enc, TYPES, OVER_BOUND } from "./pkg.mjs";

const D = (bytes) => odfEvidentiaryDigest(bytes, sha256Hex);
// the basis a determined digest states: its part, its normalisation or absence, the version and the measurement
const v1Of = (flavour) => (ODF_EVIDENTIARY_NORMALISE[flavour]
  ? word("odf-reader.odf.normalised_by", { name: ODF_EVIDENTIARY_NORMALISE[flavour].name })
  : word("odf-reader.odf.no_byte_rewritten"));
const basisOf = (flavour) => word("odf-reader.odf.the_sha256_of_the_flavour", {
  flavour, v1: v1Of(flavour), ODF_EVIDENTIARY_VERSION: String(ODF_EVIDENTIARY_VERSION), v2: ODF_EVIDENTIARY_MEASURED[flavour],
});
const refused = (d, flavour) => {
  assert.equal(d.determined, false);
  assert.equal(d.flavour, flavour);
  assert.equal(d.evidentiary, null);
  assert.equal(typeof d.basis, "string");
  assert.ok(d.basis.length > 20);
};

/* ------------------------------------------------------------------ R32 */

test("R32 only a package detected with certainty is digested; anything else is refused with flavour null", async () => {
  for (const bytes of [
    enc("not a zip"), new Uint8Array(0), null, undefined,
    buildZip([{ name: "a.txt", data: "a" }]),
    buildZip(members("ods").map((m) => (m.name === "mimetype" ? { ...m, method: 8 } : m))),   // mimetype compressed
    buildZip(members("ods"), { cdOrder: [1, 0, 2] }),                                         // mimetype not first
    pkg("ods", { mimetype: TYPES.ods + "\n" }),
    pkg("ods", { content: false }),
    pkg("ods").subarray(0, 200),
  ]) {
    const d = await D(bytes);
    refused(d, null);
    assert.equal(d.basis, word("odf-reader.odf.the_bytes_are_not_an"));
  }
  assert.equal((await D(pkg("ods"))).determined, true);
});

/* ------------------------------------------------------------------ R33 */

test("R33 a flavour with no measured-stable entry (.odp) is refused, naming that, without reading further", async () => {
  assert.deepEqual(Object.keys(ODF_EVIDENTIARY_MEASURED).sort(), ["ods", "odt"]);
  for (const bytes of [pkg("odp"), buildZip(withCd(members("odp"), "content.xml", { crc: 1 }))]) {
    const d = await D(bytes);
    refused(d, "odp");
    assert.equal(d.basis, word("odf-reader.odf.no_odp_export_has_been"));
  }
});

/* ------------------------------------------------------------------ R34 */

test("R34 refused when content.xml is over the bound (not inflated) or cannot be read whole", async () => {
  for (const f of ["odt", "ods"]) {
    const over = await D(buildZip(withCd(members(f), "content.xml", { usize: OVER_BOUND })));
    refused(over, f);
    assert.equal(over.basis, word("odf-reader.odf.content_xml_is_over_the", { v1: "over_size_bound" }));
    for (const [cd, why] of [[{ crc: 1 }, "crc_mismatch"], [{ usize: 5 }, "size_mismatch"], [{ lhOffset: 1 }, "local_header_invalid"]]) {
      const d = await D(buildZip(withCd(members(f), "content.xml", cd)));
      refused(d, f);
      assert.equal(d.basis, word("odf-reader.odf.content_xml_could_not_be", { why }));
    }
  }
});

/* ------------------------------------------------------------------ R35 */

test("R35 refused when content.xml references, by any href in any namespace, a member it does not hold; up to 3 named, with the count", async () => {
  const extra = ["Pictures/1.png", "Pictures/2.png", "Object 1/content.xml", "Object 1/styles.xml", "media/v.mp4"].map((name) => ({ name, data: name }));
  const body = `<text:p><draw:frame><draw:image xlink:href="Pictures/1.png"/></draw:frame><draw:frame><draw:object xlink:href="./Object 1"/></draw:frame>`
    + `<draw:frame><draw:plugin foo:href="Pictures/2.png"/></draw:frame><draw:frame><draw:plugin href="media/v.mp4"/></draw:frame></text:p>`;
  for (const f of ["odt", "ods"]) {
    const d = await D(pkg(f, { body, extra }));
    refused(d, f);
    assert.equal(d.basis, word("odf-reader.odf.content_xml_references_length_package", {
      length: "5", refs: "Pictures/1.png, Object 1/content.xml, Object 1/styles.xml", v1: ", \u2026",
    }));
    const one = await D(pkg(f, { body: `<text:p><draw:image xlink:href="./Pictures/1.png"/></text:p>`, extra }));
    refused(one, f);
    assert.equal(one.basis, word("odf-reader.odf.content_xml_references_length_package", { length: "1", refs: "Pictures/1.png", v1: "" }));
    // not members: a URL, a fragment, a name the package does not hold
    const none = await D(pkg(f, { body: `<text:p><text:a xlink:href="https://example.org/Pictures/1.png">u</text:a><text:a xlink:href="#Pictures/1.png">f</text:a><draw:image xlink:href="Pictures/absent.png"/></text:p>`, extra }));
    assert.equal(none.determined, true);
  }
});

/* ------------------------------------------------------------------ R36 */

test("R36 an href on a font-face-uri element (any prefix) is not a referenced member; images and objects still refuse", async () => {
  const fonts = `<style:font-face style:name="A"><svg:font-face-src><svg:font-face-uri xlink:href="Fonts/font1.ttf"/></svg:font-face-src></style:font-face>`
    + `<style:font-face style:name="B"><x:font-face-src><x:font-face-uri y:href="./Fonts/font2.ttf"/></x:font-face-src></style:font-face>`;
  const extra = [{ name: "Fonts/font1.ttf", data: "f1" }, { name: "Fonts/font2.ttf", data: "f2" }, { name: "Pictures/1.png", data: "p" }, { name: "Object 1/content.xml", data: "o" }];
  for (const f of ["odt", "ods"]) {
    const d = await D(pkg(f, { fonts, extra, body: "<text:p>t</text:p>" }));
    assert.equal(d.determined, true, d.basis);
    assert.equal(d.basis, basisOf(f));
    for (const [ref, name] of [[`<draw:image xlink:href="Pictures/1.png"/>`, "Pictures/1.png"], [`<draw:object xlink:href="./Object 1"/>`, "Object 1/content.xml"], [`<draw:image xlink:href="Fonts/font1.ttf"/>`, "Fonts/font1.ttf"]]) {
      const r = await D(pkg(f, { fonts, extra, body: `<text:p>${ref}</text:p>` }));
      refused(r, f);
      assert.equal(r.basis, word("odf-reader.odf.content_xml_references_length_package", { length: "1", refs: name, v1: "" }));
    }
  }
});

/* ------------------------------------------------------------------ R37 */

test("R37 .odt digests content.xml with text:list ids relabelled in document order; .ods digests content.xml unchanged", async () => {
  const listed = (a, b, cont) => contentXml("odt", `<text:list xml:id="${a}"><text:list-item><text:p>one</text:p></text:list-item></text:list>`
    + `<text:list xml:id='${b}' text:continue-list="${cont}"><text:list-item><text:p>two</text:p></text:list-item></text:list>`);
  const x1 = listed("list888038964", "list1", "list888038964");
  const x2 = listed("list3685929024", "list2", "list3685929024");
  const relabelled = listed("L1", "L2", "L1").replace(`xml:id='L2'`, `xml:id="L2"`);
  assert.equal(new TextDecoder().decode(odtNormalisedContentXml(enc(x1))), relabelled);
  const d1 = await D(pkg("odt", { content: x1 }));
  const d2 = await D(pkg("odt", { content: x2 }));
  assert.equal(d1.determined, true);
  assert.equal(d1.flavour, "odt");
  assert.equal(d1.over, "content.xml");
  assert.equal(d1.evidentiary, sha256(enc(relabelled)));
  assert.equal(d2.evidentiary, d1.evidentiary, "two exports differing only in list ids share one digest");
  // a list continuing a DIFFERENT list still moves the digest
  const d3 = await D(pkg("odt", { content: listed("list9", "list10", "list10") }));
  assert.notEqual(d3.evidentiary, d1.evidentiary);
  // a continue-list naming no list is left verbatim
  assert.match(new TextDecoder().decode(odtNormalisedContentXml(enc(listed("a", "b", "zzz")))), /text:continue-list="zzz"/);
  // the envelope around content.xml does not move it: member order, meta.xml, styles.xml
  const moved = await D(buildZip([...members("odt", { content: x1 }), { name: "meta.xml", data: "<m/>" }, { name: "styles.xml", data: "<s/>" }]));
  assert.equal(moved.evidentiary, d1.evidentiary);
  // .ods: no byte rewritten
  const odsXml = contentXml("ods", `<table:table table:name="S"><text:list xml:id="list5"/></table:table>`);
  const ds = await D(pkg("ods", { content: odsXml }));
  assert.equal(ds.determined, true);
  assert.equal(ds.evidentiary, sha256(enc(odsXml)));
  // the basis names the part, the normalisation or its absence, the version, the discounts and the measurement
  assert.equal(d1.basis, basisOf("odt"));
  assert.equal(ds.basis, basisOf("ods"));
  // not valid UTF-8: refused, for either flavour, never decoded lossily
  for (const f of ["odt", "ods"]) {
    const bad = new Uint8Array([...enc(contentXml(f, "<text:p>")), 0xff, 0xfe, ...enc("</text:p>")]);
    const r = await D(buildZip(members(f, { content: bad })));
    refused(r, f);
    assert.equal(r.basis, word("odf-reader.odf.content_xml_is_not_valid"));
  }
  assert.equal(odtNormalisedContentXml(new Uint8Array([0xc3, 0x28])), null);
});
