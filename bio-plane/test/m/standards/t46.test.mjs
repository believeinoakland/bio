/* standards: T46's refusal words by key (R55; T46-10, N913; DEC-194). The rows C-112.63 and C-112.64 take their
   translations from `words.json`'s `refusal.<CODE>`, read by key (`./words.mjs`; a key the list lacks fails the test);
   codes, numbers, `where`s and behaviour are unmoved, and every other row keeps its own translation. Driven at the
   module's interface over the test profile (`test-port-ellery`: `MCBC <n>` is a budget commitment). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, REASON } from "./fixture.mjs";
import { WORD, HAS } from "./words.mjs";
import { STANDARDS_CHECKS, REFUSAL_WORDS } from "../../../src/standards/index.mjs";

const PAGE0 = { kind: "pdf-page", page: 0 };
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
const RE_WORDED = ["COMMITMENT_AS_HEARD", "COMMITMENT_OWN_LETTER"];
const commitment = (w, extra = {}) => w.declare({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", ...extra });

/* A member's firsthand observation (provenance R28, `testify`), and a passage of it minted as content. */
function heard(w) {
  const t = w.prov.testify({ words: "The chair said the commission will publish the audit by June.", observedAt: "2026-09-01", author: V("bob") });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  w.ex.readings[t.capture_sha] = { chain: LAYER, pageCount: 1 };
  const m = w.content.mint({ bundleId: t.bundle_id, captureSha: t.capture_sha, extent: PAGE0, mintedBy: V("bob") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  return { contentId: m.content_id, capSha: t.capture_sha };
}

test("R55 C-112.63 COMMITMENT_AS_HEARD and C-112.64 COMMITMENT_OWN_LETTER translate as words.json's refusal.<CODE>, verbatim, read by key (REFUSAL_WORDS holds exactly those keys, each the list's word); codes, numbers and wheres unmoved", () => {
  assert.deepEqual(Object.keys(REFUSAL_WORDS).sort(), RE_WORDED.map((c) => `refusal.${c}`).sort(), "only the codes the list holds");
  for (const [key, en] of Object.entries(REFUSAL_WORDS)) assert.equal(en, WORD(key), `${key} is the list's word`);
  for (const code of RE_WORDED) {
    assert.equal(STANDARDS_CHECKS[code].translation, WORD(`refusal.${code}`), code);
    assert.equal(STANDARDS_CHECKS[code].translation, REFUSAL_WORDS[`refusal.${code}`], `${code} reads the word by its key`);
  }
  assert.deepEqual(RE_WORDED.map((c) => [STANDARDS_CHECKS[c].check, STANDARDS_CHECKS[c].where]), [
    ["C-112.63", "src/standards/index.mjs #commitmentRefusal > is-commitment-confirmed"],
    ["C-112.64", "src/standards/index.mjs #commitmentRefusal > is-commitment-not-own-letter"]]);
  assert.ok(Object.isFrozen(REFUSAL_WORDS));
});

test("R55 the control: every other row of the module is one words.json does not hold as refusal.<CODE>, and keeps its own translation, none of them the two words", () => {
  const others = Object.keys(STANDARDS_CHECKS).filter((c) => !RE_WORDED.includes(c));
  assert.ok(others.length > 50, "the family's other rows");
  for (const code of others) {
    assert.equal(HAS(`refusal.${code}`), false, `${code}: the list holds no refusal word for it, so its own translation stands`);
    assert.ok(!Object.values(REFUSAL_WORDS).includes(STANDARDS_CHECKS[code].translation), code);
    assert.match(STANDARDS_CHECKS[code].translation, /\S/, code);
  }
  assert.throws(() => WORD("refusal.NO_SUCH_STANDARD"), /holds no word/);
});

test("R55 R52 R53 the refusals answered at the interface carry the list's words: a commitment resting on a member's account is refused COMMITMENT_AS_HEARD, one resting on the group's own letter COMMITMENT_OWN_LETTER, each with its check and the word, nothing written; the body's letter lands (behaviour unmoved)", () => {
  const w = seeded();
  const a = heard(w);
  const ours = w.passage("our-confirming-letter"), theirs = w.passage("commission-reply");
  w.s.registerOwnSendingCheck("actions", ({ captureSha }) => captureSha === ours.capSha);
  const before = w.snapshot();
  const asHeard = commitment(w, { text: [a.contentId] });
  assert.deepEqual([asHeard.ok, asHeard.reason, asHeard.code, asHeard.check, asHeard.translation, asHeard.content_ids],
                   [false, "COMMITMENT_AS_HEARD", "COMMITMENT_AS_HEARD", "C-112.63", WORD("refusal.COMMITMENT_AS_HEARD"), [a.contentId]]);
  const own = commitment(w, { text: [a.contentId, ours.contentId] });
  assert.deepEqual([own.ok, own.reason, own.code, own.check, own.translation, own.own_sending, own.as_heard],
                   [false, "COMMITMENT_OWN_LETTER", "COMMITMENT_OWN_LETTER", "C-112.64", WORD("refusal.COMMITMENT_OWN_LETTER"),
                    [ours.contentId], [a.contentId]]);
  /* R10 answers the same words on an adoption */
  const p = w.s.standardPropose({ cite: "MCBC 2024-7", kind: "commitment", issuer: "Marlow County Commission", text: [a.contentId],
                                  why: "Said at the meeting.", proposer: V("carol") }).proposal;
  const snap = w.snapshot();
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: V("bob"), reason: REASON }).translation, WORD("refusal.COMMITMENT_AS_HEARD"));
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  assert.deepEqual(before.standards, snap.standards, "no standard written by a refusal");
  /* the controls: the body's reply lands, as before */
  assert.equal(commitment(w, { text: [a.contentId, ours.contentId, theirs.contentId] }).ok, true);
  assert.equal(w.s.standardAdopt({ proposal: p.id, author: V("bob"), reason: REASON, text: [theirs.contentId] }).ok, true);
});
