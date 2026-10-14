/* action-replies' T47 requirement at its interface (T47-40): C-150.3 `BEARING_REFUSED` answers DEC-199's sentence from
   `words.json`'s `refusal.BEARING_REFUSED`, read by key, with its `{item}` filled with the item `action-grammar`'s
   findings name first (R9). R3's re-pointing to `case-inputs` and R8 are in `open.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, M, MACHINE, INQ, INQ2, INQ3, INFO, RFC, leg } from "./fixture.mjs";
import { ACTION_REPLY_CHECKS, ACTION_REPLY_WORDS } from "../../../src/action-replies/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const KEY = "refusal.BEARING_REFUSED";
const SENTENCE = WORDS.find((x) => x.key === KEY)?.en;

/* A request for comment putting two inquiries and resting on a document, sent, then answered. */
function answered() {
  const w = world();
  w.rfc(RFC, { legs: [leg(INQ, "advances"), leg(INQ2, "advances"), leg(INFO, "rests_on")] });
  w.say(RFC, "sent", "2026-09-10");
  const got = w.say(RFC, "received", "2026-09-20");
  return { w, got };
}
const ok = (claim, bearing = "new_evidence") => ({ claim, bearing });

/* Every arm R24 refuses, with the item its sentence names: the list itself for a count outside 1 to 50, else the
   claim's position counted from 1, with the claim when the entry names one. */
const ARMS = [
  ["no claims", [], "The list of claims"],
  ["no list", null, "The list of claims"],
  ["not a list", "new_evidence", "The list of claims"],
  ["51 claims", Array.from({ length: 51 }, () => ok(INQ)), "The list of claims"],
  ["a claim not among the legs", [ok(INQ), ok(INQ3)], `Claim 2 (${INQ3})`],
  ["a claim listed twice", [ok(INQ), ok(INQ2), ok(INQ, "not_addressed")], `Claim 3 (${INQ})`],
  ["a bearing not of BEARINGS", [ok(INQ, "agreed")], `Claim 1 (${INQ})`],
  ["a note over 500 characters", [ok(INQ), { ...ok(INQ2), note: "x".repeat(501) }], `Claim 2 (${INQ2})`],
  ["an entry that is not one", [ok(INQ), "INQ-2026-0002-zoning"], "Claim 2"],
  ["an entry with no claim", [{ bearing: "new_evidence" }], "Claim 1"],
];

test("R9 the row reads DEC-199's sentence from words.json's refusal.BEARING_REFUSED by key, never a copy; code, number and where unmoved", () => {
  assert.ok(SENTENCE && SENTENCE.includes("{item}"), "words.json holds DEC-199's sentence with {item}");
  assert.match(SENTENCE, /from 1 to 50 claims/);
  assert.equal(ACTION_REPLY_WORDS[KEY], SENTENCE, "the list holds words.json's sentence, verbatim");
  const row = ACTION_REPLY_CHECKS.BEARING_REFUSED;
  assert.deepEqual([row.check, row.where, row.translation],
    ["C-150.3", "src/action-replies/index.mjs #bearingShape > is-bearing-shape", SENTENCE], "the row holds it for the screen");
});

test("R9 controls: each arm R24 refuses answers the key's sentence with its item filled, at R1's layout and R5's proposal alike; none carries an unfilled {item}; each writes nothing", () => {
  const { w, got } = answered();
  const before = w.counts();
  for (const [arm, claims, item] of ARMS) {
    const laid = w.r.actionReplyBearing({ target: RFC, ord: got, claims, author: M, viewer: M });
    const proposed = w.r.actionBearingPropose({ target: RFC, ord: got, claims, proposer: MACHINE, viewer: MACHINE });
    for (const [act, r] of [["layout", laid], ["proposal", proposed]]) {
      assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "BEARING_REFUSED", "BEARING_REFUSED", "C-150.3"], `${act}: ${arm}`);
      assert.equal(r.translation, SENTENCE.replace("{item}", item), `${act}: ${arm}`);
      assert.ok(!JSON.stringify(r).includes("{item}"), `${act}: ${arm}: no unfilled {item} anywhere in the answer`);
      assert.ok(r.findings.length >= 1 && r.findings.every((f) => f.check === "C-2.10"), `${act}: ${arm}: R24's findings`);
    }
  }
  assert.deepEqual(w.counts(), before, "nothing written by any refusal");
  /* a long claim is named by its first 60 characters */
  const long = `INQ-2026-0009-${"a".repeat(80)}`;
  const r = w.r.actionReplyBearing({ target: RFC, ord: got, claims: [ok(long)], author: M, viewer: M });
  assert.equal(r.translation, SENTENCE.replace("{item}", `Claim 1 (${long.slice(0, 60)})`));
  /* the control: a layout one claim per leg with a listed bearing lands, and its proposal too */
  const good = [ok(INQ), ok(INQ2, "not_addressed"), ok(INFO, "disputed_without_evidence")];
  assert.equal(w.r.actionReplyBearing({ target: RFC, ord: got, claims: good, author: M, viewer: M }).ok, true);
  assert.equal(w.r.actionBearingPropose({ target: RFC, ord: got, claims: good, proposer: MACHINE, viewer: MACHINE }).ok, true);
});
