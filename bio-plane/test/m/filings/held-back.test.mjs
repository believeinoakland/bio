/* filings — R8's carriage of a copyrighted or paywalled standard (T35, N653; K1739): a standard whose access is not
   `free` travels in the counsel packet as its designation, edition, issuer, citation, adoption and access, and only the
   passages relied on (the comparison rows' `requires`, the findings' legs), each with its content id, quoted; never
   whole. Driven at the module's interface over the real modules; the finding's published bytes carry a leg naming a
   passage of the standard through a proxy of record-core answering them as its `textAtSha` does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, F, WHY } from "./fixture.mjs";
import { Filings } from "../../../src/filings/index.mjs";

const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };
const CODE = "INFO-2026-0010-code", ACTS = "INFO-2026-0011-acts";
const WORDS = ["4.1 A vote of the board is required before any works order is let.",
               "4.2 The vote is recorded in the minutes of the meeting.",
               "4.3 Nothing in this section limits the board's other powers."];

/* A world holding a standards body's standard S3 (kind `standard`, no access stated) whose text is three typed passages
   of CODE and the whole of CODE, and another, S5 (kind `standard`, no access, no edition) whose text is the third; a determination
   D3 of the fixture's act against both, its row for S3 citing the first passage and the whole document; a Tier 3 action
   resting on D3; and filings reading F's published bytes with a leg naming the second passage. */
function heldBack() {
  const x = world();
  x.doc(CODE);
  const typed = (extent, text) => {
    const t = x.content.transcribe({ bundleId: CODE, extent, text, transcriber: V("bo"), viewer: V("bo") });
    assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
    return t.content_id;
  };
  const [P0, P1, P2] = WORDS.map((w, page) => typed({ kind: "pdf-page", page }, w));
  const WHOLE = typed({ kind: "document" }, WORDS.join("\n"));
  const S3 = x.declare({ cite: "TS 101:2024", kind: "standard", issuer: "Test Standards Body", designation: "TS 101",
                         edition: "2024", text: [P0, P1, P2, WHOLE], period: { from: null, to: null } });
  const S5 = x.declare({ cite: "TS 102", kind: "standard", issuer: "Test Standards Body", text: [P2], period: { from: null, to: null } });
  const ROW = "A vote of the board is required before a works order is let (4.1).";
  const D3 = x.determine({ standards: [{ standard: S3, outcome: "compliant" }, { standard: S5, outcome: "compliant" }],
                           rows: [{ standard: S3, requires: ROW, did: "let it after one", reading: "aligns", content: [P0, WHOLE, x.evidenceCid] },
                                  { standard: S5, requires: "a minute of the vote", did: "minuted it", reading: "aligns", content: [x.evidenceCid] }] });
  const A = x.action({ kind: "commitment_claim", legs: [{ target: D3, kind: "rests_on" }] });
  const real = x.record;
  const record = new Proxy(real, { get: (t, k) => (k === "textAtSha"
    ? (id, sha) => { const s = t.textAtSha(id, sha);
                     return id === F && typeof s === "string"
                       ? s.replace("basis:\n", `basis:\n  - target: ${CODE}\n    role: supports\n    content_id: ${P1}\n`) : s; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const f = x.filingsWith({ record });
  const pack = (over = {}, ff = f) => ff.counselPacket({ reason: WHY, action: A, counsel: COUNSEL, author: V("olive"), viewer: V("olive"), ...over });
  return { x, f, pack, A, D3, S3, S5, P0, P1, P2, WHOLE, ROW };
}

test("R8 a standard whose access is not free is carried by its designation, edition, issuer, citation, adoption and access and only the passages relied on: the comparison rows' requires with their content ids among its text, and the passages the findings' legs target, each quoted; its whole text and any other passage never in the packet, its versions or its export", async () => {
  const { x, f, pack, A, S3, S5, P0, P1, P2, WHOLE, ROW } = heldBack();
  const p = pack();
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const items = Object.fromEntries(p.sections.standards.items.map((i) => [i.standard, i]));
  const s = items[S3];
  assert.deepEqual([s.cite, s.kind, s.issuer, s.designation, s.edition, s.access], ["TS 101:2024", "standard", "Test Standards Body", "TS 101", "2024", "undetermined"]);
  assert.match(s.access_says, /not stated, so it is carried as not free/);
  assert.equal("text" in s, false, "no list of its text");
  /* the comparison row's requires, with the row's content ids that are passages of its text (the act's evidence is not) */
  assert.deepEqual(s.requires, [{ requires: ROW, content_ids: [P0, WHOLE], row: 0, source: S3 }]);
  /* the passages relied on: the row's, then the finding's leg; each quoted, the whole document named and not quoted */
  assert.deepEqual(s.passages.map((q) => [q.content_id, q.text]), [[P0, WORDS[0]], [WHOLE, null], [P1, WORDS[1]]]);
  assert.match(s.passages[1].text_why, /whole document, so it is not quoted/);
  assert.deepEqual(s.passages[0].relied_on_by, [{ comparison_row: 0, source: S3 }]);
  assert.deepEqual(s.passages[2].relied_on_by, [{ finding_leg: CODE, source: p.sections.facts.items[0].source }]);
  /* another stating no access and no edition: not free, and nothing of its text relied on, so no passage */
  assert.deepEqual([items[S5].access, items[S5].passages, "text" in items[S5], items[S5].edition], ["undetermined", [], false, null]);
  assert.match(items[S5].edition_says, /states no edition/);
  assert.match(items[S5].says, /no passage of its text is relied on/);
  /* never the whole text, nor any other passage: P2 is in both standards' text and relied on by nothing */
  const v2 = pack();
  const read = f.counselPacketRead({ id: p.id, version: 1, viewer: V("bo") });
  const e = await f.counselPacketExport({ id: p.id, version: 2, author: V("olive"), viewer: V("olive") });
  for (const [what, bytes] of [["v1", JSON.stringify(p)], ["v2", JSON.stringify(v2)], ["read", JSON.stringify(read)],
                               ["render", Filings.render(read)], ["export", e.bytes]]) {
    assert.equal(bytes.includes(P2), false, `${what}: the passage relied on by nothing is not named`);
    assert.equal(bytes.includes(WORDS[2]), false, `${what}: nor quoted`);
    assert.equal(bytes.includes(WORDS.join("\n")), false, `${what}: the whole text is never carried`);
    assert.ok(bytes.includes(WORDS[0].slice(0, 30)) && bytes.includes(WORDS[1].slice(0, 30)), `${what}: the passages relied on, quoted`);
  }
  assert.deepEqual(read.sections.standards, p.sections.standards, "read back as assembled");
  assert.deepEqual(f.filingsFor({ action: A, viewer: V("bo") }).packets.map((x) => x.version), [1, 2]);
  /* through the real filings over the same record (no leg proxy): the row's passage only */
  const plain = pack({}, x.f).sections.standards.items.find((i) => i.standard === S3);
  assert.deepEqual(plain.passages.map((q) => q.content_id), [P0, WHOLE]);
});

test("R8 a standard's adoption is the edition the act's body had adopted on the act's day, as standards' editionInForce answers it; undetermined with why when no adoption decides it", async () => {
  const { x, pack, S3 } = heldBack();
  const none = pack().sections.standards.items.find((i) => i.standard === S3).adoption;
  assert.deepEqual([none.state, none.body, none.date, none.edition], ["undetermined", "Port Ellery Selectboard", "2026-03-02", null]);
  assert.match(none.why, /no adoption by Port Ellery Selectboard/);
  /* the Selectboard adopts edition 2024 by an ordinance of its own (standards R40) */
  x.doc(ACTS);
  const cite = x.content.transcribe({ bundleId: ACTS, extent: { kind: "pdf-page", page: 0 }, text: "TS 101:2024 is adopted by reference.",
                                      transcriber: V("bo"), viewer: V("bo") }).content_id;
  const ACT = x.declare({ cite: "P.E.B.L. § 20", kind: "ordinance", issuer: "Port Ellery Selectboard", text: [cite],
                          period: { from: "2025-01-01", to: null }, access: "free" });
  const ad = x.standards.adoptionRecord({ standard: S3, act: ACT, edition: "2024", from: "2025-01-01", mode: "by_reference", citation: cite,
                                          reason: "the board adopted it", author: V("olive"), viewer: V("olive") });
  assert.equal(ad.ok, true, JSON.stringify(ad).slice(0, 300));
  const got = pack().sections.standards.items.find((i) => i.standard === S3).adoption;
  assert.deepEqual([got.state, got.edition, got.adoption.id, got.adoption.mode, got.adoption.citation, got.source],
                   ["in_force", "2024", ad.adoption.id, "by_reference", cite, ad.adoption.id]);
  const own = x.standards.editionInForce({ standard: S3, body: "Port Ellery Selectboard", date: "2026-03-02", viewer: V("olive") });
  assert.deepEqual([got.state, got.edition, got.why], [own.state, own.edition, own.why], "standards' own answer");
  /* no module answering adoptions: undetermined, said so */
  const bare = { ...Object.fromEntries(["standardRead", "inForce"].map((k) => [k, x.standards[k].bind(x.standards)])) };
  const u = pack({}, x.filingsWith({ standards: bare })).sections.standards.items.find((i) => i.standard === S3).adoption;
  assert.deepEqual([u.state, u.why], ["undetermined", "no module answers a standard's adoptions here"]);
});

test("R8 R9 access as standards holds it: paywalled and reading-room standards carried with only the passages relied on, in the members' words, a law kind's too; a free standard, and a law kind stating no access (K2019: public law), carried as R9 states (its text content ids, no passages quoted); negative controls", async () => {
  const { x, pack, S3, P0, P1, P2, WHOLE } = heldBack();
  const as = (access, words) => new Proxy(x.standards, { get: (t, k) => (k === "standardRead"
    ? (a) => { const r = t.standardRead(a); return r.ok && r.id === S3 ? { ...r, access, says: { ...r.says, ...(words ? { access: words } : {}) } } : r; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  for (const [access, words] of [["paywalled", "Behind a paywall"], ["reading_room", "Reading room only"]]) {
    const s = pack({}, x.filingsWith({ standards: as(access, words) })).sections.standards.items.find((i) => i.standard === S3);
    assert.deepEqual([s.access, s.passages.map((q) => q.content_id), "text" in s], [access, [P0, WHOLE], false], access);
    assert.equal(s.access_says, `${words}: only the passages relied on are carried, never the whole text`);
  }
  /* negative control: the same standard free to read is carried whole, as R9 states */
  const free = pack({}, x.filingsWith({ standards: as("free", "Free to read") })).sections.standards.items.find((i) => i.standard === S3);
  assert.deepEqual([free.access, free.text, "passages" in free, "designation" in free], ["free", [P0, P1, P2, WHOLE], false, false]);
  /* the fixture's ordinance and commitment state no access: public law, carried as R9 states (K2019) */
  const T = x.action({ kind: "commitment_claim" });
  const law = Object.fromEntries(pack({ action: T }).sections.standards.items.map((i) => [i.standard, i]));
  for (const id of [x.S1, x.S2]) assert.deepEqual([law[id].access, law[id].text, "passages" in law[id]], [null, [x.evidenceCid], false], id);
  /* a law kind stated paywalled is carried as not free */
  const paid = new Proxy(x.standards, { get: (t, k) => (k === "standardRead"
    ? (a) => { const r = t.standardRead(a); return r.ok && r.id === x.S1 ? { ...r, access: "paywalled" } : r; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const held = pack({ action: T }, x.filingsWith({ standards: paid })).sections.standards.items.find((i) => i.standard === x.S1);
  assert.deepEqual([held.access, "text" in held, held.passages.map((q) => [q.content_id, q.text])], ["paywalled", false, [[x.evidenceCid, null]]],
                   "its one text row, which the row cites, is the whole document: named, never quoted");
  assert.deepEqual(held.requires.map((r) => [r.requires, r.content_ids]), [["a vote of the Selectboard", [x.evidenceCid]]]);
});
