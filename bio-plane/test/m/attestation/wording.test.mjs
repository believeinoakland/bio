/* attestation: the words members read (DEC-149, Bob's "S4: B"; plan T35 rule 4, entry T35-19; the sweep's rows in
   `build/plan/draft-T35-dec149-l1-l7.md`). Each of the module's nine member-facing strings calls the group's own
   Civicsmith "your group's Civicsmith", never "instance", "plane", "copy" or "server" for it. One test per row, named
   by its place and its string, each reading the string from the answer that carries it, at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, evidence, granted, net, resp } from "./fixture.mjs";
import { attest, attestOp, ATTEST_CHECKS } from "../../../src/attestation/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const OLD = /\b(this|the|its) (instance|plane|copy|server)\b/i;
const s = sha("capture");
const empty = evidence({});
const held = (answer) => attest({ sha256: s }, { head: empty.head, put: empty.put, holds: async () => answer,
                                                  fetch: net(() => resp(200, granted(s))).fetch });
const says = (text, phrase) => {
  assert.equal(typeof text, "string");
  assert.ok(text.includes(phrase), `${JSON.stringify(text)} lacks ${JSON.stringify(phrase)}`);
  assert.doesNotMatch(text, OLD);
};

const C891 = ATTEST_CHECKS.CAPTURE_HELD_IN_PARTS.translation;

test("DEC-149: checks.mjs:26 (C-89.1) \"…as one file, and your group's Civicsmith has no record of fetching it itself.\"", async () => {
  const r = await held({ acquired: false, registered: true });
  assert.equal(r.translation, C891);
  says(r.translation, word("refusal.CAPTURE_HELD_IN_PARTS"));
});

test("DEC-149: checks.mjs:27 (C-89.1) \"A timestamp is only requested for bytes your group's Civicsmith can vouch for\"", async () => {
  says((await held({ acquired: false, registered: true })).translation, word("refusal.CAPTURE_HELD_IN_PARTS"));
});

test("DEC-149: checks.mjs:29 (C-89.1) \"If your group's Civicsmith fetches it from its address, it can then be co-attested.\"", async () => {
  says((await held({ acquired: false, registered: true })).translation, word("refusal.CAPTURE_HELD_IN_PARTS"));
});

test("DEC-149: index.mjs:107 \"Your group's Civicsmith hashed the whole document as it arrived\"", async () => {
  const r = await held({ acquired: true });
  assert.equal(r.ok, true);
  says(r.held.detail, localize("attestation.index.held_in_parts", "no object is stored under this hash, because the document was captured in parts and only its parts are stored, each under its own hash. Your team's Civicsmith hashed the whole document as it arrived and recorded that receipt, which is what this attestation rests on."));
});

test("DEC-149: index.mjs:117 \"your group's Civicsmith holds no receipt of having acquired them\"", async () => {
  says((await held({ acquired: false, registered: true })).detail,
       localize("attestation.index.register_names_bytes", "the record's register names these bytes, but no object is stored under this hash and your team's Civicsmith holds no receipt of having acquired them, which is the shape of a document kept only in parts. A register row is written from what the promoting caller named, so a timestamp is not rested on it alone. Nothing here says the bytes are missing."));
});

test("DEC-149: index.mjs:124 \"your group's Civicsmith holds no receipt of having acquired it\"", async () => {
  const r = await held({ acquired: false, registered: false });
  assert.equal(r.reason, "NO_SUCH_CAPTURE");
  says(r.detail, localize("attestation.index.no_such_capture", "no object is stored under that hash, the register holds no row for it under a record that exists, and your team's Civicsmith holds no receipt of having acquired it"));
  /* The other arm of the same refusal (the store not asked) names nobody, and stays so. */
  const unasked = await held(null);
  assert.doesNotMatch(unasked.detail, OLD);
});

test("DEC-149: index.mjs:201 \"your group's Civicsmith obtains and stores it, and does not claim to have verified the signature.\"", async () => {
  const r = await held({ acquired: true });
  says(r.note, word("attestation.note.trusted_timestamp_capture"));
});

test("DEC-149: index.mjs:239 \"your group's Civicsmith holds no receipt-signing key it can read, so nothing is signed.\"", async () => {
  const w = world();
  for (const r of [await w.att.signReceipt({ captureSha: s, retrievalLocator: "https://web.archive.org/x", retrieved: "t" }),
                   await w.att.instanceSign(w.att.instanceStatement("a/1", s))]) {
    assert.equal(r.reason, "RECEIPT_NO_KEY");
    says(r.detail, localize("attestation.index.no_key_detail", "your team's Civicsmith holds no receipt-signing key it can read, so nothing is signed. Whoever hosts your team's Civicsmith sets one as a secret; nothing is claimed signed until then"));
  }
});

test("DEC-149: ops.mjs:28 \"your group's Civicsmith has no evidence storage configured\"", async () => {
  const seen = [];
  await attestOp({ method: "POST", json: async () => ({ sha256: s }) }, {}, null,
                 { json: (b) => b, storageAbsent: (op, error) => { seen.push(error); return { absent: op }; } });
  assert.equal(seen.length, 1);
  says(seen[0], word("capture.response.group_civicsmith_evidence"));
});

test("DEC-149: no other string the module answers names the instance, the plane, a copy or a server for the group's Civicsmith", async () => {
  const w = world();
  const texts = [C891, (await attest({ sha256: "x" }, {})).detail];
  const fail = await attest({ sha256: s }, { head: async () => ({ size: 1 }), put: empty.put, fetch: async () => { throw new Error("down"); } });
  texts.push(fail.note, w.att.attestationsOf(s).note, w.att.attestationsOf(s).undetermined, w.att.attestationsOf("x").detail);
  for (const t of texts) assert.doesNotMatch(String(t), OLD, t);
});
