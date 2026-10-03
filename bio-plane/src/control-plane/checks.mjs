/* control-plane's own refusal rows (R32; K6: each check moves as an invariant with its test). DEC-49: every refusal the
 * doors answer carries its code, its row's check id and the member's translation, read from the one row here.
 *
 * Moved from the check catalogue (`checks/bio-checks.mjs`) at control-plane's extraction (T12, K6, K64's pattern), each
 * row keeping its check id and its words, and each `where` naming its site in this module: the dispatch rows C-69.1–.4
 * whole; the bootstrap claim's C-68.2–.4 (`INSTALLATION_CHECKS` keeps C-68.1, minted at acquisition's one region); the
 * unverified replay C-66.6; and, at T18 (K621, K636), the argument complaint C-61.1 with R39's gate. The admission rows
 * (C-38, C-78, C-29.6–.10, C-32.17, C-64.4) left with the gates that raise them for `admission`'s own table at the
 * split (K617, K624 (1), (2); admission R14). */

/* ===========================================================================
   D-278 (C-69) — NO OPERATION BY THAT NAME.

   Group (5) of BOB #26's ruling. `error: "unknown op"` is kept BYTE-IDENTICAL
   beside the code, and that is load-bearing rather than courtesy: `civicos-ui`
   reads it (`queueAbsent` and its two siblings) to tell a copy running an OLDER
   plane — one that has not got the op yet — from a refusal. The translation
   says only what the copy knows: it has no op by that name. It does not guess
   which of "older", "newer" or "misspelt" is true.
   =========================================================================== */
export const DISPATCH_CHECKS = {
  UNKNOWN_OP: {
    check: 'C-69.1',
    where: 'src/control-plane/index.mjs fetch > is-unknown-op',
    translation: 'This copy has no operation by that name. A copy running an older or newer version can have '
      + 'a different set of operations, and a misspelt name reads the same way. Nothing was changed.',
  },
  /* D-561. THE STORE DID NOT ANSWER (REC-52's `storeSilent`). Every public read can meet it — `publishedbytes`,
     `publishedcase`, `verify`, `publishedmanifest` — so its reader is often a member of the public holding nothing,
     and until D-561 the code reached them bare. It is a fact about the EXCHANGE, never about the record, and the
     sentence says only that. It does NOT say "nothing was changed": `storeSilent` also answers a write whose store
     went silent, and whether that write took effect is exactly what a silence cannot say. */
  STORE_DID_NOT_ANSWER: {
    check: 'C-69.2',
    where: 'src/control-plane/index.mjs storeSilent > is-store-silent',
    translation: 'This copy of the record could not consult its own records just now, so nothing in this reply is a '
      + 'statement about them: not that what you asked for is missing, unpublished or refused. Ask again. If your '
      + 'request was meant to change something, look before repeating it, because this reply cannot say whether it did.',
  },
  /* D-629 (R25, C-69.3) — THE WORKER DOOR THREW. It had no outermost catch (the platform's own error page); the stack is
     now logged server-side under a CORRELATION id, and the caller receives the code, this sentence and the id, nothing
     else. Numbered after C-69.2, which D-561 gave `STORE_DID_NOT_ANSWER`. The store's own row (`STORE_INTERNAL_ERROR`,
     C-69.4) came with the store's door (N333, K412). THE TRANSLATION CLAIMS NOTHING ABOUT THE RECORD: a throw part-way through
     an op may or may not have left a write behind, and the catch cannot say which. */
  PLANE_INTERNAL_ERROR: {
    check: 'C-69.3',
    where: 'src/control-plane/index.mjs planeInternalAnswer > is-plane-internal-error',
    translation: 'This copy failed while handling the request, before it could produce an answer. That is a fault '
      + 'in this copy, not a statement about what the record holds or about your request; whether any part of it '
      + 'took effect is not known from here. The administrator can find the details in this copy\'s logs under the '
      + 'reference given with this answer.',
  },
  /* D-629 (R25, C-69.4) — THE STORE'S DOOR THREW. Its outermost catch answered `String(e.stack)` for any throw on any op
     (file paths, line numbers and constraint text, public ops included). It came with the store's door (N333, K412);
     C-69.3 being PLANE_INTERNAL_ERROR's since T12, it takes the next free number (stamped by 1.44.0, N318). Same posture:
     the stack is logged under a CORRELATION id, the caller receives the code, this sentence and the id. */
  STORE_INTERNAL_ERROR: {
    check: 'C-69.4',
    where: 'src/control-plane/dispatch.mjs internalAnswer > is-store-internal-error',
    translation: 'This copy failed inside its own record while carrying out the request, so no answer was produced. '
      + 'That is a fault in this copy, not a statement about what the record holds or about your request; whether '
      + 'any part of it took effect is not known from here. The administrator can find the details in this copy\'s '
      + 'logs under the reference given with this answer.',
  },
  /* DEC-113 (R46, C-69.5; K1252, K1253) — A PURGE THAT WOULD REACH HELD MATERIAL. While a litigation hold stands, the
     store's door refuses every purge of the real record that would reach what the hold preserves: the whole store while
     any hold is in place, and a single bundle of a held project or a held action, or one whose project cannot be told.
     A failure to ask the hold refuses too, so the sentence claims only that the removal could not be shown to be clear
     of the hold. Nothing was removed, read for proof or written. The test store (`scratch`) is never refused for a hold. */
  PURGE_HOLD_IN_PLACE: {
    check: 'C-69.5',
    where: 'src/control-plane/dispatch.mjs purgeHoldRefusal > is-purge-hold-in-place',
    translation: 'This copy is preserving records under a litigation hold, and this removal would reach material the '
      + 'hold covers, or could not be shown to stay clear of it. Nothing was removed. A removal ordered while a hold '
      + 'stands waits until the hold is released.',
  },
};

/* C-68.2–.4 — THE BOOTSTRAP CLAIM (D-278). `claim`'s three bootstrap-credential complaints, pre-authentication, met
   before anyone holds anything, and each says no more than its `error` did. Addressed to whoever installed the copy,
   the only person who can act on them. Split from `INSTALLATION_CHECKS`, which keeps C-68.1. */
export const BOOTSTRAP_CHECKS = {
  BOOTSTRAP_CREDENTIAL_UNSET: {
    check: 'C-68.2',
    where: 'src/control-plane/index.mjs fetch > is-bootstrap-claim',
    translation: 'This copy has no administrator token set, so it cannot be claimed yet. Whoever installed it '
      + 'sets one in the hosting account. Nothing was changed.',
  },
  BOOTSTRAP_CREDENTIAL_PUBLISHED: {
    check: 'C-68.3',
    where: 'src/control-plane/index.mjs fetch > is-bootstrap-claim',
    translation: 'This copy\'s administrator token is a value published in the project\'s public repository, '
      + 'so it can never be used to claim the copy: anyone can read it. Whoever installed the copy sets a '
      + 'fresh one in the hosting account. Nothing was changed.',
  },
  BOOTSTRAP_CREDENTIAL_MISMATCH: {
    check: 'C-68.4',
    where: 'src/control-plane/index.mjs fetch > is-bootstrap-claim',
    translation: 'The administrator token given does not match the one this copy holds, so the copy was not '
      + 'claimed. Nothing was changed.',
  },
};

/* C-66.6 — A REPLAY THE PLANE COULD NOT VERIFY (D-512). Split from `SURFACE_CHECKS`. */
export const REPLAY_CHECKS = {
  /* D-512 (INVESTIGATIVE-SESSION.md §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33's
     STEP (2)): `replay` exempts a promotion from every shape fence `promote` has, because a replay re-states the
     record's own past verbatim. D-511 (step 1) removed the flag from every caller but the ADMIN class with no
     session; this is the end state. A promotion of ANY type and ANY revision that asserts a replay names its
     drive-provenance capture, and `op=promote` verifies it against what the record HOLDS — the capture registered
     by this promotion, its bytes read back and hashed, and one preserved promotion record naming this bundle and
     listing this revision's `bundle.md` SHA-256 — never against the request's own claim. Found
     before this existed (`9f8b69e6`, by the old `risk-tier.test.mjs` §8 arm (δ)): the admin deploy token sending
     `replay: true` with no provenance landed `risk_tier: 1` on an action nobody assessed. R16's tests
     (`test/m/control-plane/gates.test.mjs`, `converts.test.mjs`) prove the gate now. Asked in `op=promote`'s stamp block
     BEFORE the store is called, so nothing is written. The admin is refused rather than downgraded to an ordinary
     promotion, because an honest replay carries the past verbatim and an ordinary creation is rewritten on the way in.
     (Its one honest sender was the Drive-era migration tool, `migrate.mjs`, retired in K739; no product caller sends a
     replay today, and the gate stands for any that does.) */
  REPLAY_UNVERIFIED: {
    check: 'C-66.6',
    where: 'src/control-plane/index.mjs fetch > is-promote-replay-verified',
    translation: 'This save says it is a replay of the record\'s own history, and the plane could not check that '
      + 'against the history it holds: the replay must name the provenance file for this document, already '
      + 'uploaded, whose records list this document and exactly this version of it. A replay is excused from '
      + 'the rules a new save must meet only when that check succeeds. Nothing was saved.',
  },
};

/* ===========================================================================
   D-270 — THE ARGUMENT COMPLAINT (C-61), the other half of the row. Moved from the check catalogue at T18 (K636,
   K621: R39's gate and its raiser `requiredArgument` with it; the row and its words unchanged, its `where` now this
   module's; stamped by 1.49.0).

   THREE OPS REFUSED A MISSING OR MALFORMED ARGUMENT WITH A BARE `error` STRING
   AND NO CODE OF ANY KIND: `op=capture` and `op=pdfstructure` (*"requires
   sha256=<64 lowercase hex>"*) and `op=monitor` (*"needs a bundleId"*). A
   refusal with no code is one layer further out than REC-64's sweep of codes
   with no translation — there is nothing to translate, DEC-49's guard cannot
   see it, and a census of CODES cannot count a refusal that has none.

   ONE ROW AND NOT THREE, and the reason is that the CONDITION is one condition.
   `AI_BEYOND_TASK_SCOPE` is the standing precedent for a single code whose
   producers are told apart by a field. The site names the argument and the shape
   it wanted, so a caller can tell `op=capture`'s complaint from `op=monitor`'s
   without the catalogue growing a row per call site.

   AND IT IS MINTED IN ONE GOVERNED FUNCTION rather than at three edited sites,
   because a DEC-49 row holds ONE `where` naming the SMALLEST SPAN. A code minted
   at three sites inside `fetch` could not name one honestly — the guard's own
   arm-C note calls that the MULTI-SITE class. Minting it in `requiredArgument`
   is what makes this row's `where` true.

   CORRECTED 2026-09-23 BY D-278. This paragraph read *`op=verify` and
   `op=publishedbytes` make the same sha256 complaint and keep their bare
   strings … D-278's subject and a different determination.* BOB #26 made that
   determination (INTERFACES.md I3, **Answers**, 2026-09-22): the PRE-
   AUTHENTICATION argument complaints of `verify`, `publishedbytes`,
   `publishedcase` and `knock` take THIS row, because the fact is the same fact
   and the sentence below carries no member vocabulary. They are minted through
   the same helper, so the row's one `where` stays true.
   =========================================================================== */
export const REQUIRED_ARGUMENT_CHECKS = {
  /* NOTHING WAS CHANGED, and the sentence says so first. A caller who cannot
     tell a refused request from a half-applied one has to go and look, and this
     is the one refusal in the plane most likely to be met by a script. */
  REQUIRED_ARGUMENT_MISSING: {
    check: 'C-61.1',
    where: 'src/control-plane/index.mjs requiredArgument > is-required-argument',
    translation: 'This request left out an argument the operation cannot run without, or sent one '
      + 'in a shape it does not accept. Nothing was changed. The argument and the shape it must '
      + 'take are named beside this message.',
  },
};
