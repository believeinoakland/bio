/* content: the capture's context (R42), a member's attestation of a capture's text (R43), the attestations over a
   capture (R44), and the read contract on `content`'s columns (R45) — K73 (1), K134; ids as proposed in CONTENT #1's
   job record, "Proposed requirements". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { noSha } from "../../../src/extraction/index.mjs";
import { ATTEST_NOTE_MAX, TRANSCRIBE_CHECKS, contentOps } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a";

test("R42: contentContextFor: the chain, the page set (stored count first, else the named pages), the page boxes and the container, each absence stated", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 5, pageBoxes: { boxes: [{ media_box: [0, 0, 10, 10] }], of_page: [0] } });
  const c = w.content.contentContextFor(a.sha);
  assert.deepEqual([c.pageCount, c.pageBoxes.of_page, Array.isArray(c.chain)], [5, [0], true]);
  assert.equal(c.container.held, false);
  assert.match(c.container.why, /does not hold/);
  assert.equal(c.container.office, null);
  /* no stored count: the highest page a scoped step or an attestation names, plus one */
  const b = w.cap("b"); w.doc("INFO-2026-0002-b", [b]);
  w.read(b.sha, { pageCount: null, chain: [{ step: "layer", tier: 1, extent: { kind: "pages", pages: [0, 3] } }] });
  assert.equal(w.content.contentContextFor(b.sha).pageCount, 4);
  w.content.attestText({ note: "compared with the page", captureSha: b.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 6 } });
  assert.equal(w.content.contentContextFor(b.sha).pageCount, 7);
  /* an office container, by the format registry, never a list of slugs */
  const d = w.cap("d"); w.doc("INFO-2026-0003-d", [d]);
  w.read(d.sha, { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 4, tables: [], images: [] } });
  const dc = w.content.contentContextFor(d.sha).container;
  assert.deepEqual([dc.office, dc.format, dc.paragraphs, dc.tables, dc.images, dc.held], [true, "docx", 4, [], [], true]);
  w.read(d.sha, { captureFormat: "pdf", containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 1, 1] }] } });
  const pc = w.content.contentContextFor(d.sha).container;
  assert.deepEqual([pc.office, pc.container_name, pc.page_images_why], [false, "pdf", null]);
  assert.equal(w.content.contentContextFor("0".repeat(64)).container.office, null, "no reading: undetermined, stated");
});

test("R43: attestText: a member's attestation over a stated extent, the chain snapshotted; refusals are text-chain's; no reading is NO_READING", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { pageCount: 3 });
  assert.equal(w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer: V("bo"), member: "class:ai", extent: { kind: "document" } }).code, "TEXT_ATTEST_MACHINE");
  assert.equal(w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page" } }).code, "TEXT_ATTEST_EXTENT");
  assert.equal(w.content.attestText({ captureSha: "0".repeat(64), viewer: V("bo"), member: V("cy"), extent: { kind: "document" } }).reason, "NO_READING");
  const r = w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "region", source: { kind: "pdf-page", page: 1, rect: [0, 0, 5, 5] } }, at: "2026-09-02T00:00:00Z", note: "ok" });
  assert.deepEqual([r.ok, r.attestor, r.at], [true, V("cy"), "2026-09-02T00:00:00Z"]);
  assert.deepEqual(r.chain_at_attestation, w.ex.readings[a.sha].chain);
  /* the viewer is the stamp and is asked: a bundle the viewer may not see, or no stamp, answers as a capture never read */
  const unread = w.content.attestText({ note: "compared with the page", captureSha: "0".repeat(64), viewer: V("bo"), member: V("cy"), extent: { kind: "document" } });
  for (const viewer of ["nobody", null, undefined])
    assert.deepEqual(w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer, member: V("cy"), extent: { kind: "document" } }), unread);
  /* a repeat by the same attestor over the same extent replaces it */
  w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "region", source: { kind: "pdf-page", page: 1, rect: [0, 0, 5, 5] } }, at: "2026-09-02T00:00:00Z", note: "ok" });
  assert.equal(w.count("text_attestations"), 1);
  const row = w.row(`SELECT * FROM text_attestations`);
  assert.deepEqual([row.bundle_id, row.extent_kind, row.extent_page, JSON.parse(row.extent_rect), row.note], [DOC, "region", 1, [0, 0, 5, 5], "ok"]);
  /* and over a page or the whole document, whose key holds a NULL page or rect: still one, the repeat replacing it */
  for (const extent of [{ kind: "page", page: 2 }, { kind: "document" }]) {
    w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent, at: "2026-09-04T00:00:00Z", note: "first" });
    w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent, at: "2026-09-05T00:00:00Z", note: "second" });
    const held = w.rows(`SELECT at, note FROM text_attestations WHERE extent_kind=?`, extent.kind).map((x) => ({ ...x }));
    assert.deepEqual(held, [{ at: "2026-09-05T00:00:00Z", note: "second" }], extent.kind);
  }
  assert.equal(w.count("text_attestations"), 3);
});

test("R43: attestText: ATTEST_NO_NOTE (C-52.10) after NO_READING: a note absent, not a string, blank or over 2,000 characters is refused with nothing written; at 2,000 it is kept and read back", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 3, chain: [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "1", cap: "C", measured_by: "m" }] });
  const att = (o) => w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 1 }, ...o });
  /* the earlier refusals are asked first, note or none: text-chain's, then NO_READING (unread, invisible, no viewer) */
  for (const note of [undefined, ""]) {
    assert.equal(att({ member: "class:ai", note }).code, "TEXT_ATTEST_MACHINE");
    assert.equal(att({ extent: { kind: "page" }, note }).code, "TEXT_ATTEST_EXTENT");
    assert.equal(att({ captureSha: "0".repeat(64), note }).reason, "NO_READING");
    assert.equal(att({ viewer: "nobody", note }).reason, "NO_READING");
    assert.equal(att({ viewer: null, note }).reason, "NO_READING");
  }
  /* every way a note can fail, each refused by C-52.10's row, with nothing written: no attestation row, the ceiling and
     the attestations unchanged */
  const before = w.snapshot();
  const list0 = w.content.attestationsFor(a.sha, { page: 1 }, V("bo"));
  const ctx0 = w.content.contentContextFor(a.sha);
  const row = TRANSCRIBE_CHECKS.ATTEST_NO_NOTE;
  const bad = [["absent", {}], ["null", { note: null }], ["a number", { note: 7 }], ["true", { note: true }],
               ["an object", { note: { said: "ok" } }], ["empty", { note: "" }], ["white space", { note: "\u00a0 \n" }],
               ["2,001 characters", { note: "n".repeat(ATTEST_NOTE_MAX + 1) }],
               ["2,001 astral characters", { note: "\u{1D538}".repeat(ATTEST_NOTE_MAX + 1) }]];
  for (const [label, o] of bad) {
    const r = att(o);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.max_chars],
                     [false, "ATTEST_NO_NOTE", "ATTEST_NO_NOTE", "C-52.10", row.translation, ATTEST_NOTE_MAX], label);
    assert.equal(r.capture_sha, a.sha, label);
  }
  assert.equal(w.count("text_attestations"), 0, "no refusal writes");
  assert.deepEqual(w.snapshot(), before, "nothing written anywhere");
  assert.deepEqual(w.content.attestationsFor(a.sha, { page: 1 }, V("bo")), list0, "the attestations and the ceiling unchanged");
  assert.deepEqual([list0.count, list0.ceiling.determinant], [0, "derivation"]);
  assert.deepEqual(w.content.contentContextFor(a.sha), ctx0);
  /* through the route arm: the note is the body's, and a body without one is refused the same way */
  const run = (body) => contentOps(w.content, new URL(`https://plane.invalid/?${new URLSearchParams({ attestor: V("cy"), viewer: V("bo") })}`), body).attesttext();
  assert.equal(run({ captureSha: a.sha, extent: { kind: "document" } }).code, "ATTEST_NO_NOTE");
  assert.equal(run({ captureSha: a.sha, extent: { kind: "document" }, note: " " }).code, "ATTEST_NO_NOTE");
  assert.deepEqual(w.snapshot(), before);
  /* the bound: exactly 2,000 characters (an astral one counts once) is admitted, kept byte for byte, read back */
  const at2000 = "\u{1D538}".repeat(ATTEST_NOTE_MAX - 1) + ".";
  const ok = att({ note: at2000, at: "2026-09-02T00:00:00Z" });
  assert.equal(ok.ok, true);
  assert.equal(w.row(`SELECT note FROM text_attestations`).note, at2000);
  const list1 = w.content.attestationsFor(a.sha, { page: 1 }, V("bo"));
  assert.deepEqual(list1.attestations.map((x) => [x.attestor, x.note]), [[V("cy"), at2000]], "read back with its note");
  assert.deepEqual([list1.ceiling.determinant, list1.ceiling.by], ["attestation", [V("cy")]]);
  assert.equal(att({ member: V("di"), note: "n".repeat(ATTEST_NOTE_MAX) }).ok, true, "2,000 plain characters admitted");
  /* a refused repeat leaves the held attestation as it was; an accepted one replaces it, with its note */
  const held = w.snapshot();
  assert.equal(att({ note: "" }).code, "ATTEST_NO_NOTE");
  assert.deepEqual(w.snapshot(), held);
  assert.equal(att({ note: "page 1 against the scan, line by line", at: "2026-09-03T00:00:00Z" }).ok, true);
  assert.deepEqual({ ...w.row(`SELECT at, note FROM text_attestations WHERE attestor=?`, V("cy")) },
                   { at: "2026-09-03T00:00:00Z", note: "page 1 against the scan, line by line" });
  assert.equal(w.count("text_attestations"), 2);
});

test("R44: attestationsFor: every attestation over a capture, bounded, stale against the live chain (never on a null), with the ceiling for a target", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 3, chain: [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "1", cap: "C", measured_by: "m" }] });
  w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 1 }, at: "2026-09-01T00:00:00Z" });
  w.read(a.sha, { pageCount: 3, chain: [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }] });
  w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer: V("bo"), member: V("di"), extent: { kind: "page", page: 2 }, at: "2026-09-02T00:00:00Z" });
  const r = w.content.attestationsFor(a.sha, { page: 1 }, V("bo"));
  assert.deepEqual(r.attestations.map((x) => [x.attestor, x.stale]), [[V("cy"), true], [V("di"), false]]);
  assert.deepEqual([r.count, r.truncated, r.limit], [2, false, 200]);
  assert.equal(r.ceiling.determinant, "derivation", "the stale attestation over page 1 raises nothing");
  assert.equal(w.content.attestationsFor(a.sha, { page: 2 }, V("bo")).ceiling.determinant, "attestation");
  assert.deepEqual(w.content.attestationsFor(a.sha, null, V("bo"), 1).truncated, true);
  assert.equal(w.content.attestationsFor(a.sha, null, "nobody").attestations[0].bundle_id, null, "the bundle withheld from a viewer who may not see it");
  assert.equal(w.content.attestationsFor("", null, V("bo")).reason, "NO_SHA");
});

test("R44 (N285): no digest (absent, not a string, or empty) is extraction's one NO_SHA answer (its R63), field for field, and reads and writes nothing", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { pageCount: 1 });
  w.content.attestText({ note: "compared with the page", captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "document" } });
  let asked = 0;
  const orig = w.content.extraction.readingOf;
  w.content.extraction.readingOf = (s) => { asked++; return orig(s); };
  const before = w.snapshot();
  for (const bad of [undefined, null, "", 7, {}, [a.sha], true]) {
    const r = w.content.attestationsFor(bad, null, V("bo"));
    assert.deepEqual(r, noSha(r.detail), JSON.stringify(bad) ?? "undefined");
    assert.deepEqual([r.ok, r.reason, typeof r.code, typeof r.check, typeof r.translation], [false, "NO_SHA", "string", "string", "string"]);
    assert.match(r.detail, /attestations/, "the detail names what the digest was for");
  }
  assert.deepEqual(w.content.attestationsFor(undefined), w.content.attestationsFor(""), "one answer for every shape of absence");
  assert.equal(asked, 0, "nothing is read for a request that names no capture");
  assert.deepEqual(w.snapshot(), before, "nothing is written");
  w.content.extraction.readingOf = orig;
  /* the negative control: a digest, even one never read, is not this refusal */
  assert.equal(w.content.attestationsFor(a.sha, null, V("bo")).ok, true);
  assert.deepEqual([w.content.attestationsFor("0".repeat(64), null, V("bo")).ok, w.content.attestationsFor("0".repeat(64), null, V("bo")).count], [true, 0]);
});

test("R45: `content`'s columns content_id, capture_sha, bundle_id, extent_kind, extent, ref, stale, minted_by, cited_as and chain_kind are a stated read contract, with the meaning each has", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { pageCount: 3 });
  const cols = [...w.st.sql.exec(`PRAGMA table_xinfo(content)`)];
  const type = Object.fromEntries(cols.map((c) => [c.name, c.type]));
  for (const c of ["content_id", "capture_sha", "bundle_id", "extent_kind", "extent", "ref", "minted_by", "cited_as", "chain_kind"])
    assert.equal(type[c], "TEXT", c);
  assert.equal(type.stale, "INTEGER");
  assert.equal(cols.find((c) => c.name === "content_id").pk, 1);
  const m = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: V("bo") });
  const r = w.row(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, stale, minted_by, cited_as, chain_kind FROM content`);
  assert.deepEqual({ ...r }, { content_id: m.content_id, capture_sha: a.sha, bundle_id: DOC, extent_kind: "pdf-page",
    extent: '{"kind":"pdf-page","page":1,"rect":null}', ref: "page 2", stale: 0, minted_by: V("bo"), cited_as: "text", chain_kind: "layer" });
});
