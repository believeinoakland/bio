/* case-checker, G47 (fix round 6): the attestation join of R3 by capture. A source captured more than once is several
   materials of one `ref`; a row that states a capture's `sha` is joined to that capture and its failure or gap is
   reported against it alone, a row without one (an earlier document) is joined by `ref` as before. The inflated case is
   built by the real writers (`case-grammar`'s line builders through `./fixture.mjs`), the two captures are of one
   source, and the answers are read through the answer's attestation rows and each finding's `differs` and `missing`.
   The cases that read the row's `sha` wait for `case-grammar`'s optional `sha` (CASE-GRAMMAR): red by name until it merges. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import { caseFile, gradingFacts, byId, sha, A, B, C, MEMO, MEMO_SHA, MEMO_BYTES, sign, accountMessage, W } from "./fixture.mjs";

const MEMO2_BYTES = `${MEMO_BYTES}, captured a second time`;
const MEMO2_SHA = sha(MEMO2_BYTES);
const MEMO2_ACCOUNT = "I fetched it again the next week and it had not changed.";

/** The memo captured twice: one material row for each capture, both of `ref` MEMO. */
const twoCaptures = (rows) => [...rows, { ...rows.find((r) => r.ref === MEMO), sha: MEMO2_SHA, text_sha: rows.find((r) => r.ref === MEMO).text_sha }];
/** Finding A rests on both captures; finding B (reached from A) on the first only. */
const factsOf = () => {
  const f = gradingFacts();
  f[A].legs.push({ target: MEMO, kind: "document", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null, captures: [MEMO2_SHA] });
  return f;
};
const accountOf = (signer) => ({ capture: MEMO2_SHA, by: "bob", at: "2026-10-02T12:00:00Z", text_b64: Buffer.from(MEMO2_ACCOUNT).toString("base64"),
  signature_b64: Buffer.from(sign(signer, accountMessage(MEMO2_SHA, MEMO2_ACCOUNT))).toString("base64") });
/** Each capture's member attestation states its `sha`; capture B's is signed by `signer`. */
function opts({ signer = "bob", withAccount = true, sha: stated = true, format } = {}) {
  const account = accountOf(signer);
  return { format, facts: factsOf(), materialRows: twoCaptures,
    accountRows: (rows) => (withAccount ? [...rows, account] : rows),
    attestationRows: (rows) => [...rows.map((r) => (r.ref === MEMO && r.by_kind === "member" && stated ? { ...r, sha: MEMO_SHA } : r)),
      { ref: MEMO, by_kind: "member", by: "bob", level: "cover", at: "2026-10-02T12:00:00Z", signature: account.signature_b64, ...(stated ? { sha: MEMO2_SHA } : {}) }] };
}
const run = (o) => CC.checkCaseFile({ parts: caseFile(o).parts });
const sigEntries = (f) => [...f.differs, ...f.missing].filter((e) => e.check === "signature");

test("R3 (G47 (4)): a k = 2 case in which only capture B's attestation fails is reported for B and not for A, through the failure map", async () => {
  const r = await run(opts({ signer: "mallory" }));
  const rows = r.signatures.attestations.filter((a) => a.ref === MEMO && a.by_kind === "member");
  assert.deepEqual(rows.map((a) => [a.sha, a.state]), [[MEMO_SHA, "checked"], [MEMO2_SHA, "fails"]]);
  const mine = sigEntries(byId(r)[A]).filter((e) => e.sha256 !== undefined);
  assert.deepEqual(mine.map((e) => e.sha256), [MEMO2_SHA], "one entry, against capture B");
  assert.ok(!sigEntries(byId(r)[B]).some((e) => e.sha256 === MEMO2_SHA), "finding B rests on capture A alone");
  assert.equal(byId(r)[A].result, "did_not_recreate");
});

test("R3 (G47 (4)): a k = 2 case in which only capture B's attestation is not carried is reported for B and not for A, through the gap map", async () => {
  const r = await run(opts({ withAccount: false }));
  const rows = r.signatures.attestations.filter((a) => a.ref === MEMO && a.by_kind === "member");
  assert.deepEqual(rows.map((a) => [a.sha, a.state]), [[MEMO_SHA, "checked"], [MEMO2_SHA, "not_carried"]]);
  const gaps = byId(r)[A].missing.filter((e) => e.check === "signature");
  assert.deepEqual(gaps.map((e) => e.sha256), [MEMO2_SHA]);
  assert.equal(gaps[0].detail, W("case-checker.gap.signed_account_attesting", { ref: MEMO }));
  assert.ok(!byId(r)[B].missing.some((e) => e.check === "signature"));
});

test("R3 (G47 (4)): rows that state no sha verify as before: joined and keyed by ref, so a failure of the ref is reported against the capture the finding rests on", async () => {
  const r = await run(opts({ signer: "mallory", sha: false }));
  assert.ok(r.signatures.attestations.every((a) => !("sha" in a)), "an answer row states a sha only where the document row does");
  const f = sigEntries(byId(r)[A]);
  assert.ok(f.length > 0 && f.every((e) => !("sha256" in e)), "the entries of a row without sha carry none");
  /* a document with no second capture is the old case: a forged account fails the finding that rests on it, once */
  const k1 = await run({ memoAccountSigner: "mallory" });
  assert.equal(sigEntries(byId(k1)[A]).length, 1);
  assert.equal(byId(k1)[C].result, "recreated");
});

test("R3 R10 R25 (G47): a bio-case-document/9 document, any attestation carrying a sha, is accepted and recreates every finding", async () => {
  const r = await run(opts({ format: "bio-case-document/9" }));
  assert.equal(r.complete_edition.equal, true);
  assert.deepEqual(r.signatures.attestations.filter((a) => a.ref === MEMO && a.by_kind === "member").map((a) => a.state), ["checked", "checked"]);
  assert.deepEqual(byId(r)[C].result, "recreated");
});
