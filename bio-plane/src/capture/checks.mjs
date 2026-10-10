/* capture's own refusal rows (requirements: `build/requirements/capture.md`). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached.
 *
 * C-48.1–C-48.7, C-83 and C-28.13 went with the acquisition act to `acquisition` (its R29; K617, K649 (1)). C-85, the
 * doorbell's five refusals, moved here from the catalogue in T18 (`KNOCK_CHECKS`, below; K585 (3), K649), the
 * catalogue's copy deleted in the same job (✱, K586): no product module but this one reads it. The row below is new with R63 (N285, K275, K343): "no evidence object is held under a digest" is one condition,
 * minted at one site, `evidenceAbsent` (`src/capture/ops.mjs`), which this module's R21 get and extraction's R31 answer
 * through. The evidence store had no family in the catalogue, so it takes the next free family number, C-118
 * (K107 (3)'s rule: the job names a new code's row; K174: a module holds its new rows).
 *
 * NO_SUCH_KNOCK is new with K383: the inbox answered an unknown knock id with the bare `NOT_FOUND`, a different condition
 * under R63's code (K275); R32 words it as its own code, with the next row of C-118, minted at one site, `#noSuchKnock`
 * (`src/capture/index.mjs`), which the inbox's read and resolve both answer through.
 *
 * C-118.1's code was `NOT_FOUND` until N347 (K440): a generic word any module could mint, so the door could not read
 * this table without lending the row to them. It is `EVIDENCE_NOT_HELD` (R63's own words); the row keeps its number and
 * its translation.
 *
 * C-118.3–C-118.6 are new with N364 (K509): the knocker's secret (R66), bringing a knock in (R65), and the capturing
 * member's signed account (R69), each minted at the one site its `where` names.
 *
 * C-118.7 is new with DEC-88 (R32: a resolve records the member's reason), C-118.8 and C-118.9 with DEC-97 (R79, R81:
 * setting held material aside and bringing it back); C-118.3 and C-85's sentences gained DEC-108's (R52) (K1019).
 *
 * C-118.10 is new with R86 (T41-8a; K2425 (4)): a member's upload names where the file came from. */

const at = (fn, region) => `src/capture/ops.mjs ${fn} > ${region}`;
const inIndex = (fn, region) => `src/capture/index.mjs ${fn} > ${region}`;

export const CAPTURE_CHECKS = Object.freeze({
  EVIDENCE_NOT_HELD: Object.freeze({
    check: 'C-118.1', where: at("evidenceAbsent", "is-evidence-held"),
    translation: 'The record holds no stored copy of a document under this fingerprint.',
  }),
  NO_SUCH_KNOCK: Object.freeze({
    check: 'C-118.2', where: inIndex("#noSuchKnock", "is-knock-held"),
    translation: 'No knock in the inbox answers to this id. Nothing was changed.',
  }),
  KNOCKER_SECRET_WEAK: Object.freeze({
    check: 'C-118.3', where: "src/capture/doorbell.mjs knockerSecretWeak > is-knocker-secret-strong",
    translation: 'A knocker secret this short could be guessed, letting someone else continue your pseudonym. Use a '
               + 'longer one, or ask the doorbell to make one. Nothing was received. The group can see how often its doorbell turns people away.',
  }),
  KNOCK_DISCARDED: Object.freeze({
    check: 'C-118.4', where: inIndex("pullKnock", "is-knock-pullable"),
    translation: 'This knock was set aside. Move it back to new before bringing it in. Nothing was written.',
  }),
  NOT_THE_CAPTURING_ACTOR: Object.freeze({
    check: 'C-118.5', where: inIndex("recordCaptureAccount", "is-capturing-actor"),
    translation: 'An account of how a document was captured is added only by the member who captured it, and that is '
               + 'not you, or no member captured it. Nothing was written.',
  }),
  ACCOUNT_NO_TEXT: Object.freeze({
    check: 'C-118.6', where: inIndex("recordCaptureAccount", "is-account-worded"),
    translation: 'An account of how you captured a document says what happened in your own words, and this one is '
               + 'empty. Write it. Nothing was written.',
  }),
  RESOLVE_NO_REASON: Object.freeze({
    check: 'C-118.7', where: inIndex("inboxResolve", "is-resolve-reasoned"),
    translation: 'Changing a knock\'s status records why, in your own words, and no reason was given, or it is longer '
               + 'than 2,000 characters. Write one. Nothing was written.',
  }),
  MACHINE_CANNOT_SET_ASIDE: Object.freeze({
    check: 'C-118.8', where: inIndex("#heldActRefusal", "is-held-act-by-member"),
    translation: 'Setting held material aside, or bringing it back, is a member\'s own act, and no member made this '
               + 'request. Nothing was written.',
  }),
  SET_ASIDE_NO_REASON: Object.freeze({
    check: 'C-118.9', where: inIndex("#heldActRefusal", "is-held-act-reasoned"),
    translation: 'Setting held material aside, or bringing it back, records why, in your own words, and no reason was '
               + 'given, or it is longer than 2,000 characters. Write one. Nothing was written.',
  }),
  /* R86 (T41-8a; K2425 (4), K2434): the next free row of C-118, awaiting T42's stamp (plan rule 4 (2)). Its words are
     R86's Suggestion's meaning until the UX stream gives its own. */
  UPLOAD_NO_STATEMENT: Object.freeze({
    check: 'C-118.10', where: inIndex("uploadCapture", "is-upload-stated"),
    translation: 'A file brought into the record records where it came from, in your own words, and none was given, or '
               + 'it is longer than 2,000 characters. Write it. Nothing was written.',
  }),
});

/* C-85 — THE DOORBELL'S REFUSALS (D-508, D-513; R47–R52), moved from the check catalogue in T18 with their reasoning:

   `op=knock` is the one door open to the public, the one refusal surface whose reader is guaranteed NOT to be a
   member, so every refusal it makes carries a code, its row and a canned translation (DEC-49), never a bare store
   reason. `stated` IS NOT A TRANSLATION and the two are kept apart: `stated` publishes the instance's own bound,
   composed in `doorbell.mjs` from the limits it runs (R31, R47, R48), and must move when they move; the translation is
   the knocker's answer (what happened, what it means for what they sent, what to do) and names no figure at all
   (R52), because a figure here would be a second authority for the bound and the two could disagree.

   One family for the door rather than the limiter: no other family's subject is the public door (C-28 is a member's
   capture request, C-69 the router's "no op by that name", C-61 a shape rule at any door). THREE size-and-content
   rows, not one widened sentence: a request body this door will not READ (the envelope, before anything is decoded)
   and decoded material THIS INSTANCE cannot HOLD (a far smaller cap without evidence storage, with another remedy)
   are two conditions, and empty content a third. Their keys are the door's own (`KNOCK_ENVELOPE_TOO_LARGE`,
   `KNOCK_PAYLOAD_TOO_LARGE`, `KNOCK_EMPTY`), because the older tokens are minted elsewhere in the plane and a row under
   either would have claimed those sites for this door's sentence.

   Each `where` names the smallest span in which the refusal is enforced: the three helpers in `doorbell.mjs`, which
   answer before the store is called, and the one region `is-knock-rate` in `Capture#knockRateRefusal`, whose two
   adjacent lines are both rate refusals. The code is a string literal at its site (DEC-49's rule). The codes are READ
   as well as minted, deliberately: `knockOp` compares the store's `reason` against the two rate codes to attach the
   bound (a surface keying on a code the plane sent, not a second mint).

   NOT FROZEN, unlike `CAPTURE_CHECKS`: R52 holds that a code whose row is missing or has no translation fails as an
   internal error rather than reach a knocker bare, and its test removes a row to prove it. The helpers read the row
   at the moment of the refusal, never a copy. */
export const KNOCK_CHECKS = {
  RATE_IP: {
    check: 'C-85.1',
    where: 'src/capture/index.mjs #knockRateRefusal > is-knock-rate',
    translation: 'Your material was not received. This group\'s inbox is not taking any more material from where '
      + 'you are sending it '
      + 'just now. It is a limit on how fast one sender may knock, not a judgement about you or '
      + 'about what you sent, and it lifts on its own shortly — the bound is published beside this '
      + 'message. Nothing was stored and nothing was read, so send the same material again a little '
      + 'later and it will arrive. The group can see how often its doorbell turns people away.',
  },
  RATE_GLOBAL: {
    check: 'C-85.2',
    where: 'src/capture/index.mjs #knockRateRefusal > is-knock-rate',
    translation: 'Your material was not received. This group\'s inbox is not taking any more material from anyone '
      + 'just now. The whole '
      + 'instance is at its limit rather than you — the cap exists so that no one sender can fill '
      + 'the inbox — and it lifts on its own shortly; the bound is published beside this message. '
      + 'Nothing was stored and nothing was read, so send the same material again a little later. '
      + 'The group can see how often its doorbell turns people away.',
  },
  /* D-513 — THE THREE REFUSALS THIS DOOR MAKES BEFORE THE STORE IS CALLED. Each
     `where` names a module-scope helper (capture's `doorbell.mjs` since T4) and
     the region inside it, because that is where each refusal is enforced; the two oversize
     rows are two conditions and deliberately not one row with a widened
     sentence. */
  KNOCK_ENVELOPE_TOO_LARGE: {
    check: 'C-85.3',
    where: 'src/capture/doorbell.mjs knockEnvelopeTooLarge > is-knock-envelope-too-large',
    translation: 'This group\'s inbox did not read what you sent, because the request itself is larger '
      + 'than this door accepts. Nothing was stored, nothing was opened, and nothing about your '
      + 'material was judged — its size was read off the request and it stopped there. The size this '
      + 'inbox will read is published beside this message. Send the material again smaller, or as '
      + 'more than one knock, and it will be read. The group can see how often its doorbell turns people away.',
  },
  KNOCK_PAYLOAD_TOO_LARGE: {
    check: 'C-85.4',
    where: 'src/capture/doorbell.mjs knockPayloadTooLarge > is-knock-payload-too-large',
    translation: 'This group\'s inbox read your material and cannot keep it, because it is larger than '
      + 'this inbox stores. That is a fact about how this group has set its Civicsmith up rather '
      + 'than a judgement about what you sent — a group that has configured evidence storage can keep '
      + 'far more — and the size this one can keep is published beside this message. Nothing was '
      + 'stored. Send something smaller, or ask the group\'s members how to get the whole of it to them. The group can see how often its doorbell turns people away.',
  },
  KNOCK_EMPTY: {
    check: 'C-85.5',
    where: 'src/capture/doorbell.mjs knockEmpty > is-knock-empty',
    translation: 'This group\'s inbox has nothing to keep, because what you sent decoded to no bytes at '
      + 'all. The request itself was well formed and named its content, so this is most likely an '
      + 'empty file or an empty box rather than anything wrong with how you sent it. Nothing was '
      + 'stored. Check what you attached and knock again. The group can see how often its doorbell turns people away.',
  },
};
