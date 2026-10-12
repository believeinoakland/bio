/* duties, T46 (T46-11; R32; DEC-194, N913): the rows C-133.41 RESPONSE_KIND_UNKNOWN, C-133.42 RESPONSE_EXTENT_NOT_IN
   and C-133.44 DUTY_SOURCE_NOT_HELD take their translations from `words.json`'s `refusal.<CODE>`, read by key, never a
   copy; C-133.43 PROMISE_DATE_UNREAD keeps its present translation; every other row keeps its own; codes, numbers,
   `where`s and behaviour unmoved. At the interface: the rows as exported, and each refusal as the acts answer it, each
   beside its control, the same act landing without the refusing condition; over the real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, E, BOB, MACHINE } from "./fixture.mjs";
import { DUTIES_CHECKS, DUTIES_WORDS } from "../../../src/duties/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* The three rows R32 re-words, with their numbers and `where`s, which it does not move. */
const AT = (fn, region) => `src/duties/index.mjs ${fn} > ${region}`;
const TAKEN = {
  RESPONSE_KIND_UNKNOWN: ["C-133.41", AT("proposeFromResponse", "is-duty-response-kind")],
  RESPONSE_EXTENT_NOT_IN: ["C-133.42", AT("proposeFromResponse", "is-duty-response-extent")],
  DUTY_SOURCE_NOT_HELD: ["C-133.44", AT("adopt", "is-duty-source-held")],
};
/* The three as T45 worded them: none is answered any longer. */
const T45 = {
  RESPONSE_KIND_UNKNOWN: "An obligation proposed from a reply or a report is either a promise the body made or a response "
    + "the report requires. This is neither. Nothing was written.",
  RESPONSE_EXTENT_NOT_IN: "The passage quoted is not part of the reply or report the obligation arises in. Quote a passage "
    + "of that document. Nothing was written.",
  DUTY_SOURCE_NOT_HELD: "This promise rests on a commitment that is still only proposed as a standard. Adopt that "
    + "commitment as a standard first; the obligation then names it. Nothing was written.",
};
/* C-133.43 keeps its present translation in T46 (R32): R30 refuses the promise and writes nothing. */
const PROMISE_DATE_UNREAD = "A promise's date is read from the body's own words, and those words must state one whole "
  + "calendar date. These do not (such as \"by spring\", a month without its day, or more than one date): they are kept "
  + "as written and never completed. Nothing was written.";
/* Every other row of the family (39, C-133.1–.40 less the retired .13 and .28, and .43), as T45 left them: their
   canonical JSON's sha256, so no check, where or translation of theirs moves. */
const KEPT = { count: 39, sha256: "ec1cdde4690f018b44ec912bb1b2f065126eec4e058d8698301a905117ce151b" };

test("R32 C-133.41, .42 and .44 read words.json's refusal.<CODE> by key from DUTIES_WORDS, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(DUTIES_WORDS));
  assert.deepEqual(Object.keys(DUTIES_WORDS).sort(), Object.keys(TAKEN).map((c) => `refusal.${c}`).sort(),
    "the table holds exactly the three rows' keys");
  for (const [key, text] of Object.entries(DUTIES_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const row = DUTIES_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    assert.equal(row.translation, DUTIES_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    assert.notEqual(row.translation, T45[code], `${code}: T45's words no longer`);
  }
});

test("R32 C-133.43 PROMISE_DATE_UNREAD keeps its present translation, not words.json's (which says the promise is kept with no due date, while R30 refuses it); every other row keeps its own", () => {
  const row = DUTIES_CHECKS.PROMISE_DATE_UNREAD;
  assert.deepEqual([row.check, row.where, row.translation],
    ["C-133.43", AT("proposeFromResponse", "is-duty-promise-date"), PROMISE_DATE_UNREAD]);
  assert.ok(!("refusal.PROMISE_DATE_UNREAD" in DUTIES_WORDS), "not taken in T46");
  assert.notEqual(row.translation, en("refusal.PROMISE_DATE_UNREAD"), "words.json's sentence and R30 do not yet agree");
  assert.match(row.translation, /Nothing was written\.$/);
  const kept = Object.fromEntries(Object.entries(DUTIES_CHECKS).filter(([c]) => !(c in TAKEN)));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(DUTIES_WORDS).includes(r.translation), code);
});

/* A reply, an unrelated report and a commitment held as a standard, over the real modules (R30's world). */
function responseWorld() {
  const w = world();
  const words = (name, text) => { const p = w.passage(name, { text }); return { ...p, cite: { captureSha: p.capSha, extent: { kind: "pdf-page", page: 0 } } }; };
  const reply = words("reply", "We will publish the audit response by June 30, 2026.");
  const vague = words("vague-reply", "We will publish it by spring.");
  const report = words("report", "Recommendation R1: the Town Clerk shall respond within the period the law sets.");
  const commitment = w.sw.declare({ cite: "Clerk's letter of 3 March 2026", kind: "commitment", issuer: "Town Clerk", text: [reply.contentId] });
  assert.equal(commitment.ok, true, JSON.stringify(commitment).slice(0, 300));
  const propose = (over = {}) => w.duties.proposeFromResponse({ kind: "promise", arisingIn: reply.capSha, quote: reply.cite, obligor: E.clerk,
    performance: "publish the audit response", standard: commitment.id, by: MACHINE, ...over });
  return { w, reply, vague, report, propose };
}
const written = (w) => ["duties", "duty_proposals", "duty_versions"].map((t) => w.sqlRows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n).join();
const answers = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  const row = DUTIES_CHECKS[code];
  assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, row.check, row.translation], code);
};

test("R32 each re-worded refusal is answered by the acts with words.json's sentence, behaviour unmoved: refused, nothing written, beside its control", () => {
  const { w, reply, vague, report, propose } = responseWorld();
  const before = written(w);
  /* C-133.41: the kind */
  const kind = propose({ kind: "rumour" });
  answers(kind, "RESPONSE_KIND_UNKNOWN");
  assert.equal(kind.translation, en("refusal.RESPONSE_KIND_UNKNOWN"));
  assert.deepEqual(kind.kinds, ["promise", "required_response"]);
  /* C-133.42: a quote of another capture */
  const ext = propose({ quote: report.cite });
  answers(ext, "RESPONSE_EXTENT_NOT_IN");
  assert.equal(ext.translation, en("refusal.RESPONSE_EXTENT_NOT_IN"));
  assert.deepEqual([ext.quote, ext.arising_in], [report.capSha.slice(0, 80), reply.capSha]);
  /* C-133.43: unchanged */
  const date = propose({ arisingIn: vague.capSha, quote: vague.cite });
  answers(date, "PROMISE_DATE_UNREAD");
  assert.equal(date.translation, PROMISE_DATE_UNREAD);
  assert.equal(written(w), before, "nothing written");
  /* the control: the same act without the refusing condition lands */
  const ok = propose();
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  /* C-133.44: adoption of a promise on a commitment still proposed as a standard, and its control once adopted */
  const sp = w.standards.standardPropose({ cite: "Clerk's spoken promise", kind: "commitment", issuer: "Town Clerk", text: [reply.contentId],
    why: "the clerk's reply states it", proposer: MACHINE, viewer: MACHINE });
  assert.equal(sp.ok, true, JSON.stringify(sp).slice(0, 300));
  const p = propose({ standard: undefined, standardProposal: sp.proposal.id });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const mid = written(w);
  const held = w.duties.adopt({ proposalId: p.proposal_id, clause: "the reply", by: BOB });
  answers(held, "DUTY_SOURCE_NOT_HELD");
  assert.equal(held.translation, en("refusal.DUTY_SOURCE_NOT_HELD"));
  assert.equal(held.standard_proposal, sp.proposal.id);
  answers(w.declare({ source: { kind: "standard", standard_proposal: sp.proposal.id }, time: { basis: "commitment" } }), "DUTY_SOURCE_NOT_HELD");
  assert.equal(written(w), mid, "nothing written");
  assert.equal(w.standards.standardAdopt({ proposal: sp.proposal.id, reason: "the written reply confirms it", period: { from: "2026-03-03", to: null },
    author: BOB, viewer: BOB }).ok, true);
  assert.equal(w.duties.adopt({ proposalId: p.proposal_id, clause: "the reply", by: BOB }).ok, true, "the control: adopted once the commitment is");
  /* no answer carries T45's words */
  const text = JSON.stringify([kind, ext, held]);
  for (const old of Object.values(T45)) assert.ok(!text.includes(old));
});
