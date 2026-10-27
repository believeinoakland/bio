/* provenance: a member's decision on a captured document's content authority (R65, R66, R67; K4169, C62; UC-046), driven at
   the module's interface over the real modules: `declareAuthority`, `authorityOf`, the resolver C-18.9 reads (R46) and the
   register's own check over a bundle at `verified`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, provDoc, infoMd, sha, V } from "./fixture.mjs";
import { PROVENANCE_ACT_CHECKS, registerChecks, withRegisterChecks } from "../../../src/provenance/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const B = "INFO-2026-0001-a";
const T = "2026-09-27T03:00:00Z";

/* A record holding one document whose register states authority `determined` by acquisition. */
function held(over = {}) {
  const w = world({ now: "2026-09-27T03:00:00.000Z" });
  const a = w.cap("a");
  const r = w.promoteInfo(B, { captures: [a], docs: [provDoc(a, over)] });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { w, a };
}
const decide = (w, a, over = {}) => w.prov.declareAuthority({ bundle: B, capture: a.sha, outcome: "determined", authority: "City Clerk",
  basis: "named on the letterhead", by: V("ruth"), viewer: V("ruth"), ...over });
const rowOf = (r, code) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
  [false, code, code, PROVENANCE_ACT_CHECKS[code].check, PROVENANCE_ACT_CHECKS[code].translation], code);

/* The register's C-18.9 findings over a document at `verified`, as the gate asks them with the record's resolver. */
function c189(w, doc) {
  const md = infoMd(B, { state: "verified" });
  return registerChecks({ files: new Map([["bundle.md", md], ["data/provenance.json", JSON.stringify({ documents: [doc] })]]),
                          fm: parseFrontmatter(md).data, resolve: w.prov.containerResolver() }).filter((x) => x.check === "C-18.9");
}

test("R65: a member's decision is dated, attributed and append-only, and its answer says what was stored", () => {
  const { w, a } = held();
  const d = decide(w, a, { authority: "  The   City  Clerk ", basis: " named on the\nletterhead " });
  assert.deepEqual(d, { ok: true, bundle: B, capture: a.sha, outcome: "determined", authority: "The City Clerk",
                        basis: "named on the letterhead", by: V("ruth"), at: T, seq: 1 });
  w.clock.now = "2026-09-28T00:00:00.000Z";
  const e = decide(w, a, { by: V("sam"), viewer: V("sam"), outcome: "undetermined_after_review", authority: undefined,
                           basis: "the office was written to and did not answer" });
  assert.equal(e.ok, true, JSON.stringify(e));
  assert.deepEqual([e.seq, e.authority, e.at], [2, null, "2026-09-28T00:00:00Z"]);
  assert.equal(w.count("authority_decisions"), 2, "append-only: the first stays");
  /* A `sha256:`-prefixed, upper-case digest names the same capture (R5's spelling). */
  assert.equal(decide(w, a, { capture: `sha256:${a.sha.toUpperCase()}` }).seq, 3);
  /* Bounds: the issuer at 500 and the basis at 2,000 are kept whole. */
  assert.equal(decide(w, a, { authority: "x".repeat(500), basis: "y".repeat(2000) }).ok, true);
});

test("R65: each refusal carries its catalogue row and writes nothing, and the same call by a member succeeds (control)", () => {
  const { w, a } = held();
  /* Each refusal in the order the requirement states, so a later one is reached only past every earlier one. */
  for (const who of ["class:ai", "class:admin", "token:member", "", null, undefined]) {
    rowOf(decide(w, a, { by: who }), "AUTHORITY_NOT_A_MEMBER");
  }
  assert.equal(decide(w, a, { viewer: "stranger" }).reason, "NO_SUCH_BUNDLE", "a bundle the viewer may not see answers as absent");
  assert.equal(decide(w, a, { bundle: "INFO-2026-0404-x" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(decide(w, a, { bundle: "" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(decide(w, a, { bundle: "INFO-2026-0404-x" }).check, undefined, "NO_SUCH_BUNDLE has no catalogue row (REC-64)");
  rowOf(decide(w, a, { capture: sha("nowhere") }), "AUTHORITY_NOT_A_DOCUMENT");
  rowOf(decide(w, a, { capture: "" }), "AUTHORITY_NOT_A_DOCUMENT");
  /* A capture another bundle holds is no document of this one. */
  const b = w.cap("b");
  w.promoteInfo("INFO-2026-0002-b", { captures: [b] });
  rowOf(decide(w, a, { capture: b.sha }), "AUTHORITY_NOT_A_DOCUMENT");
  for (const basis of ["", "  ", "\n", null, undefined, "z".repeat(2001)]) rowOf(decide(w, a, { basis }), "AUTHORITY_NO_BASIS");
  for (const authority of ["", " ", null, undefined, "q".repeat(501)]) rowOf(decide(w, a, { authority }), "AUTHORITY_NO_ISSUER");
  for (const outcome of ["", "determine", "UNDETERMINED", "undetermined", null, undefined]) rowOf(decide(w, a, { outcome }), "AUTHORITY_OUTCOME_UNKNOWN");
  assert.equal(w.count("authority_decisions"), 0, "no refusal wrote a decision");
  /* The order: a machine with no basis is refused as a machine; a missing basis with no issuer is refused for the basis. */
  rowOf(decide(w, a, { by: "class:ai", basis: "", capture: sha("nowhere") }), "AUTHORITY_NOT_A_MEMBER");
  rowOf(decide(w, a, { basis: "", authority: "" }), "AUTHORITY_NO_BASIS");
  /* Control: the same calls by a member, well formed, are accepted. */
  assert.equal(decide(w, a).ok, true);
  assert.equal(decide(w, a, { outcome: "undetermined_after_review", authority: undefined, basis: "reviewed the file and found nothing naming an issuer" }).ok, true);
  assert.equal(w.count("authority_decisions"), 2);
});

test("R65: each refusal has its own catalogue id and a translation a member reads", () => {
  for (const code of ["AUTHORITY_NOT_A_MEMBER", "AUTHORITY_NOT_A_DOCUMENT", "AUTHORITY_NO_BASIS", "AUTHORITY_NO_ISSUER", "AUTHORITY_OUTCOME_UNKNOWN"]) {
    const row = PROVENANCE_ACT_CHECKS[code];
    assert.match(row.check, /^C-103\.\d+$/, code);
    assert.equal(typeof row.translation, "string", code);
    assert.ok(row.translation.length > 20, code);
  }
  assert.equal(new Set(Object.values(PROVENANCE_ACT_CHECKS).map((r) => r.check)).size, Object.keys(PROVENANCE_ACT_CHECKS).length,
               "no two refusals share an id");
});

test("R66: authorityOf answers the standing decision over the register's value, with the whole history oldest first", () => {
  const { w, a } = held({ authority: "the publisher", authority_state: "determined", authority_basis: "named on the document" });
  /* Before any decision: the register's own acquisition-time value is the one entry. */
  const before = w.prov.authorityOf(B, a.sha);
  assert.deepEqual(before, { authority_state: "determined", authority: "the publisher", basis: "named on the document", by: null,
                             at: "2026-09-27T00:00:00Z", reviewed: false,
                             history: [{ source: "register", authority_state: "determined", authority: "the publisher",
                                         basis: "named on the document", by: null, at: "2026-09-27T00:00:00Z" }] });
  decide(w, a, { authority: "City Clerk" });
  w.clock.now = "2026-09-28T00:00:00.000Z";
  decide(w, a, { by: V("sam"), viewer: V("sam"), outcome: "undetermined_after_review", authority: undefined, basis: "no issuer could be found" });
  const after = w.prov.authorityOf(B, a.sha);
  assert.deepEqual([after.authority_state, after.authority, after.basis, after.by, after.at, after.reviewed],
                   ["undetermined", null, "no issuer could be found", V("sam"), "2026-09-28T00:00:00Z", true]);
  assert.deepEqual(after.history.map((e) => [e.source, e.authority_state, e.authority, e.seq ?? null]),
                   [["register", "determined", "the publisher", null], ["decision", "determined", "City Clerk", 1],
                    ["decision", "undetermined", null, 2]]);
  assert.equal(after.history[1].outcome, "determined");
  assert.equal(after.history[2].outcome, "undetermined_after_review");
  /* The later decision stands, whatever it is. */
  w.clock.now = "2026-09-29T00:00:00.000Z";
  decide(w, a, { authority: "County Recorder" });
  const last = w.prov.authorityOf(B, a.sha);
  assert.deepEqual([last.authority_state, last.authority, last.reviewed, last.history.length], ["determined", "County Recorder", false, 4]);
});

test("R66: a capture with neither a register value nor a decision answers null, and the register's undetermined state is the first entry", () => {
  const { w, a } = held({ authority: undefined, authority_state: "undetermined", authority_basis: "nothing was established" });
  const first = w.prov.authorityOf(B, a.sha);
  assert.deepEqual([first.authority_state, first.authority, first.basis, first.reviewed, first.history.length],
                   ["undetermined", null, "nothing was established", false, 1]);
  assert.equal(w.prov.authorityOf(B, sha("nowhere")), null);
  assert.equal(w.prov.authorityOf("INFO-2026-0404-x", a.sha), null);
  assert.equal(w.prov.authorityOf(B, ""), null);
  assert.equal(w.prov.authorityOf(undefined, undefined), null);
  /* A registered capture whose register states no authority has no register value: only a decision makes an answer. */
  const w2 = world();
  const c = w2.cap("c"), d = w2.cap("d");
  assert.equal(w2.promoteInfo("INFO-2026-0003-c", { captures: [c, d], docs: [provDoc(c)] }).ok, true);
  assert.equal(w2.prov.authorityOf("INFO-2026-0003-c", d.sha), null);
  assert.equal(w2.prov.declareAuthority({ bundle: "INFO-2026-0003-c", capture: d.sha, outcome: "determined", authority: "Mayor",
    basis: "signature", by: V("ruth"), viewer: V("ruth") }).ok, true);
  const only = w2.prov.authorityOf("INFO-2026-0003-c", d.sha);
  assert.deepEqual([only.authority, only.history.map((e) => e.source)], ["Mayor", ["decision"]]);
  /* An older document carries an authority and no state, which reads determined. */
  const w3 = held({ authority_state: undefined, authority: "the publisher" });
  assert.equal(w3.w.prov.authorityOf(B, w3.a.sha).authority_state, "determined");
  /* Writes nothing, never throws. */
  const snap = w.snapshot();
  w.prov.authorityOf(B, a.sha); w.prov.authorityOf(null, null);
  assert.deepEqual(w.snapshot(), snap);
});

test("R66: after a decision the C-18.9 check reads the new state, and before it the old", () => {
  const { w, a } = held();
  const chain = [{ who: "instance x", asserts: "served these bytes", bound: false, via: "direct" }];
  /* Undetermined and silent at verified: found; the decision's dated basis answers it. */
  const silent = { ...provDoc(a), authority: undefined, authority_state: "undetermined", authority_basis: "", provenance_chain: chain };
  assert.equal(c189(w, silent).length, 1, "before the decision the old state is read");
  assert.match(c189(w, silent)[0].message, /states no authority_basis/);
  decide(w, a, { outcome: "undetermined_after_review", authority: undefined, basis: "asked the office twice; no answer by 2026-09-27" });
  assert.deepEqual(c189(w, silent), [], "after it, the decision's state and basis are read");
  /* Determined with no authority named: found; the decision names one. */
  const w2 = held().w;
  const a2 = w2.cap("a");
  const unnamed = { ...provDoc(a2), authority: "", authority_state: "determined", provenance_chain: chain };
  assert.equal(c189(w2, unnamed).length, 1);
  assert.match(c189(w2, unnamed)[0].message, /no authority named/);
  w2.prov.declareAuthority({ bundle: B, capture: a2.sha, outcome: "determined", authority: "City Clerk", basis: "letterhead", by: V("ruth"), viewer: V("ruth") });
  assert.deepEqual(c189(w2, unnamed), []);
  /* A later decision is the one read: back to undetermined and silent can never happen (a basis is required), so the
     standing state follows the latest. */
  w2.prov.declareAuthority({ bundle: B, capture: a2.sha, outcome: "undetermined_after_review", basis: "a second look found the letterhead forged",
                             by: V("sam"), viewer: V("sam") });
  assert.deepEqual(c189(w2, unnamed), [], "undetermined with a dated basis still publishes (2026-07-31)");
  /* The gate reads the same: withRegisterChecks over the image, with the resolver, finds no C-18.9 authority finding, and without
     the record's resolver the document's own state is read and found. */
  const md = infoMd(B, { state: "verified" });
  const image = { "bundle.md": md, "data/provenance.json": JSON.stringify({ documents: [silent] }), [a.path]: a.text };
  const gate = { ok: true, findings: [], warnings: 0 };
  const authorityFindings = (g) => g.findings.filter((x) => x.check === "C-18.9");
  assert.deepEqual(authorityFindings(withRegisterChecks(image, gate, w.prov.containerResolver())), []);
  assert.equal(authorityFindings(withRegisterChecks(image, gate, null)).length, 1);
});

test("R66: a document with no decision reads as its own (control), and a decision on one capture touches no other", () => {
  const { w, a } = held();
  const b = w.cap("b");
  w.promoteInfo("INFO-2026-0002-b", { captures: [b] });
  const chain = [{ who: "instance x", asserts: "y", bound: false, via: "direct" }];
  const silentB = { ...provDoc(b), authority: undefined, authority_state: "undetermined", authority_basis: "", provenance_chain: chain };
  decide(w, a);
  assert.equal(w.prov.containerResolver().authority(b.sha), null);
  assert.equal(w.prov.containerResolver().authority(a.sha).authority, "City Clerk");
  assert.equal(c189(w, silentB).length, 1, "b was never decided");
  assert.equal(w.prov.containerResolver().authority(undefined), null);
  assert.equal(w.prov.containerResolver().authority(sha("nowhere")), null);
});

test("R67: a machine or AI identity never decides; a member's decision does", () => {
  const { w, a } = held();
  const before = w.prov.authorityOf(B, a.sha);
  for (const who of ["class:ai", "class:ai/tok-1", "class:daemon", "token:member"]) {
    for (const outcome of ["determined", "undetermined_after_review"])
      rowOf(decide(w, a, { by: who, outcome, authority: outcome === "determined" ? "Mallory" : undefined }), "AUTHORITY_NOT_A_MEMBER");
  }
  assert.deepEqual(w.prov.authorityOf(B, a.sha), before, "the standing value is unchanged");
  assert.equal(w.count("authority_decisions"), 0);
  /* The member's decision, by contrast, is the standing value. */
  decide(w, a, { authority: "County Recorder" });
  assert.equal(w.prov.authorityOf(B, a.sha).authority, "County Recorder");
  /* Nothing else the module offers writes a decision: a testimony, a receipt and an origin leave the table as it is. */
  const n = w.count("authority_decisions");
  w.prov.testify({ words: "I saw it.", observedAt: "2026-09-20", author: V("ruth") });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: a.sha, retrieved: T });
  w.prov.declareOrigin({ bundleId: B, system: "The portal", by: V("ruth"), viewer: V("ruth") });
  assert.equal(w.count("authority_decisions"), n);
  assert.equal(w.prov.authorityOf(B, a.sha).authority, "County Recorder");
});

test("R65, R41: the decisions are declared to purge with the module's other tables: a bundle purge takes its own, and another declaration of the table is refused", () => {
  const { w, a } = held();
  decide(w, a);
  const b = w.cap("b");
  w.promoteInfo("INFO-2026-0002-b", { captures: [b] });
  w.prov.declareAuthority({ bundle: "INFO-2026-0002-b", capture: b.sha, outcome: "determined", authority: "Mayor", basis: "signature",
                            by: V("ruth"), viewer: V("ruth") });
  assert.deepEqual(w.rows(`SELECT bundle_id, capture_sha FROM authority_decisions ORDER BY bundle_id`).map((r) => [r.bundle_id, r.capture_sha]),
                   [[B, a.sha], ["INFO-2026-0002-b", b.sha]]);
  const again = w.record.declarePurge("someone-else", ["authority_decisions"]);
  assert.deepEqual([again.ok, again.reason, again.declaredBy], [false, "TABLE_DECLARED", "provenance"]);
  w.record.purge({ bundleId: B });
  assert.deepEqual(w.rows(`SELECT bundle_id FROM authority_decisions`).map((r) => r.bundle_id), ["INFO-2026-0002-b"]);
  w.record.purge({});
  assert.equal(w.count("authority_decisions"), 0);
});
