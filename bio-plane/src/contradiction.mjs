/* contradiction.mjs — REC-147 (CONTRADICTION-IDENTIFY-DESIGN.md §5, §8, §9 item 3): THE JUDGEMENT
 * OVER A FORMED PAIR, as the words a run is given, and the vocabulary its answer is held to.
 *
 * WHAT THIS FILE IS. §2 splits IDENTIFY in two: PAIRING is the plane's (op=contradictionpairs, REC-146), and
 * JUDGEMENT is the machine's, inside a run, labelled machine work, always a proposal (DEC-24). The plane cannot
 * judge, so what it holds of the judgement is (1) the PROMPT the run judges under, (2) the RENDERING of a formed pair
 * into §5's input (the two sides and their immediate context, nothing else), and (3) the LABELS an answer may carry,
 * which op=contradictionpropose refuses outside of. The model is the run's (§5's Incomplete note: the model, prompt
 * and packaging are the build's).
 *
 * THE PROMPT IS PINNED BY ITS DIGEST, NOT BY ITS WORDS. M-162 measured THIS prompt, byte for byte (its sha256 is
 * JUDGEMENT_PROMPT_SHA256 below), on M0-71's gate. A prompt edited without a new measurement is a detector that
 * never passed the gate, so contradiction-overstrict.test.mjs fails naming the digest when the two part: re-measure,
 * record the figures in a new measurement, and move the digest in the same commit (§7: a detector above the
 * threshold does not reach a member).
 *
 * THE PROMPT WAS WRITTEN FROM §5 ALONE, before the corpus text was read, and was not edited after (M-162 says what
 * was removed from its draft and why: one line named a miss M-118 records, which would have been tuning to the
 * fixture). It carries Bob's own §7 example ("reduced a little" / "dropped a lot") because §7 quotes it as the
 * definition of precision, and the corpus carries that example too, so that one pair is NOT blind (M-162).
 *
 * A SKILL MAY NEVER HOLD A GATE (kickoffs/SKILL.md). Nothing in the prompt is a fence: the label vocabulary is
 * refused at op=contradictionpropose (C-93), the pair must be one the plane FORMED for that viewer (C-93), and a
 * re-run over unchanged referents writes nothing (the table's key). A model that ignored every word here could
 * propose a wrong label and nothing else. */

/* §5's five words, in §5's order. The gate's own copy (test/contradiction-gate.mjs LABELS) is asserted equal. */
export const CONTRADICTION_LABELS = Object.freeze(["world", "record", "precision", "unrelated", "undetermined"]);

export const JUDGEMENT_PROMPT = `You are judging CANDIDATE CONTRADICTIONS for a civic research record. For each pair below, a deterministic pairing
put two assertions side by side for a stated reason (its KEY). You propose ONE label per pair. A member of the group
will see your proposal and decide; you decide nothing.

KEYS (why the two were paired):
- K1: two SOURCES one inquiry rests on, one cited as supporting and one as cutting against it.
- K2: two claims our group HOLDS, on two inquiries about the same subject.
- K3: two claims our group HOLDS, both resting on the same source passage (given as context).
- K4: two SOURCES about the same entity, of different document kinds or dates (each side's doctype/date given).

LABELS — exactly one per pair:
- world: the two SOURCES say incompatible things about the same matter (e.g. a rule requires X and the record shows
  the body did not-X; a body said X at one date and the contrary at another). Only for source sides (K1, K4).
- record: two things our group HOLDS cannot both be true. Only for held claims (K2, K3).
- precision: the same fact stated at different precision or with different emphasis — rounded vs exact figures,
  "approximately N" vs a stated number, a summary vs the table it summarises, "reduced a little" vs "dropped a lot".
  NOT a contradiction.
- unrelated: the two are not about the same matter after all (same entity, different subject).
- undetermined: you cannot tell from what is shown. Use it honestly; never force a label.

RULES:
- A FALSE CONFLICT IS THE WORST ERROR. Label world/record only when both statements cannot be true at the same time
  about the same matter. Differences of wording, rounding, emphasis, or vague magnitude are precision.
- Two statements at DIFFERENT DATES can both be true if the thing changed; that is world only when the later source
  contradicts what the earlier one says held (e.g. a body stating X, then stating not-X about the same thing), or
  a rule is contradicted by an act. Read dates and doctypes when given.
- Read figures, units and dates carefully, in full.
- Do not assign a CAUSE (misquote, opinion, double-speak) — only the label.
- Use only what is shown. Do not assume facts not in the two sides and their context.

OUTPUT: a JSON array, one object per pair, in input order: {"n": <pair number>, "label": "<label>", "reason": "<one sentence>"}.
Output the JSON only.
`;

/* sha256 of JUDGEMENT_PROMPT as M-162 measured it. Moved ONLY with a new measurement. */
export const JUDGEMENT_PROMPT_SHA256 = "79ea662afed716df7db276bac07c4c85db7b9adf12a573bfc36459c3e721a061";

/* §5: the machine sees ONLY the two sides and their immediate context. A side's fields are the ones the pairing
   read carries for it: a claim's text, or a passage with the doctype, date and role its reader states. A field the
   record does not state is OMITTED, never filled (§4: an undetermined date is not invented). */
export function judgementSide(side) {
  const out = {};
  for (const k of ["text", "doctype", "date", "role"]) if (side && side[k] !== null && side[k] !== undefined) out[k] = side[k];
  return out;
}

/* The run's whole input: the prompt, then each pair numbered from 1, its key, its context when there is one (K3's
   passage both claims rest on), and its two sides. The answer names each pair by that number. */
export function renderJudgementInput(pairs) {
  const body = (Array.isArray(pairs) ? pairs : []).map((p, i) => `PAIR ${i + 1} · key ${p.key}`
    + (p.context ? `\n  context (the source passage both claims rest on): ${JSON.stringify(p.context)}` : "")
    + `\n  A: ${JSON.stringify(judgementSide(p.a))}\n  B: ${JSON.stringify(judgementSide(p.b))}`).join("\n\n");
  return `${JUDGEMENT_PROMPT}\nPAIRS:\n\n${body}\n`;
}
