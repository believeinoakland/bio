/* promotion's own refusal rows: the write door's refusals, held here rather than in the catalogue (`legacy-checks`).
 *
 * Each row is `{check, translation}`, the shape of the catalogue's DEC-49 rows, so a refusal carries its check id and
 * a member-facing translation (requirement R20's "Errors"). C-86.5 to C-86.14 were written for `op=promote` by the
 * Batch30 rows D-546, D-578, D-615, D-628, D-692, D-707 and D-726 (never landed; reachable on
 * `snapshot/pre-refactor-2026-09-25`'s branches), and are carried here with their wording. `BUNDLE_ID_DISAGREES`
 * (R14, D-738) is the catalogue's C-1.1 asked at the door; `BUNDLE_MD_UNREADABLE` (R17, D-741) is C-2.1's.
 *
 * Each row's `where` names the marked region of `promote` that mints its code (N118; the catalogue's "WHAT A `where`
 * MEANS", REC-71), so the DEC-49 guard reads exactly that span. The four codes that name what the request must carry
 * share one region, whose every refusal is one of them.
 *
 * C-86.1–C-86.4 (`PROMOTED_TYPE_CHECKS`) and C-97 (`PROJECT_CREATION_VISIBILITY_CHECKS`), the families only this
 * module mints, moved here whole from the catalogue in T18 (K586 BOB-1, K636), each row unmoved: their notes follow.
 */

export const PROMOTION_CHECKS = {
  STATE_MOVE_UNDECLARED: {
    check: "C-86.6",
    where: "src/promotion/index.mjs #promote > is-state-move-undeclared",
    translation: "That is not a move this item can make from where it stands. Each kind of thing has a set of moves "
      + "its rules allow, and this one is not among them, so nothing was written. Move it by a step the rules allow, "
      + "or leave it where it stands and record what changed.",
  },
  PROMOTED_TYPE_UNSTATED: {
    check: "C-86.5",
    where: "src/promotion/index.mjs #promote > is-promoted-type-unstated",
    translation: "This is a new item and nothing says what kind of thing it is: neither the document nor the request "
      + "names a type. What it is decides which rules protect it, so the record will not guess. Nothing was written. "
      + "Say in the document what kind of thing it is, and send it again.",
  },
  ENVELOPE_DATES_DISAGREE: {
    check: "C-86.7",
    where: "src/promotion/index.mjs #promote > is-promoted-dates-disagree",
    translation: "The document being filed says when it was made or last changed, and the request that carried it says "
      + "a different time. The record keeps its history in the order those dates give, and it goes by the document, so "
      + "it stops and tells you both. Nothing was written. Send it again with the request giving the document's dates, "
      + "or giving none, or change the document first.",
  },
  PROMOTED_FIELD_UNSTATED: {
    check: "C-86.8",
    where: "src/promotion/index.mjs #promote > is-promoted-field-unstated",
    translation: "This is a new item and it does not say where it stands, or when it was made or last changed: neither "
      + "the document nor the request gives it. The record keeps its history in the order those dates give and decides "
      + "what may be done with a thing by where it stands, so it will not guess. Nothing was written. Say it in the "
      + "document, and send it again.",
  },
  REVISION_REDATES_CREATION: {
    check: "C-86.9",
    where: "src/promotion/index.mjs #promote > is-revision-redates-creation",
    translation: "This change says the item was made at a different time than the record holds. A change can alter what "
      + "a document says, but not when it was made: the record orders its history by that date, and letting a later "
      + "change move it would let anyone backdate something. Nothing was written. Send it again with the date the "
      + "record holds, or with none.",
  },
  PROMOTE_SNAP_KEY_UNSTATED: {
    check: "C-86.10",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: "This change does not say what to call it in the item's history: the request carries no snapshot "
      + "key. Every change is kept under its own name so it can be found and compared later, and the record will not "
      + "make one up. Nothing was written. Send it again with a snapshot key.",
  },
  PROMOTED_FILE_PATH_UNSTATED: {
    check: "C-86.11",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: "A file in this change has no name: it gives no path, or it is not a file at all. The record keeps "
      + "every file under its name and will not guess one. Nothing was written. Name each file, and send it again.",
  },
  PROMOTED_FILE_CONTENT_UNSTATED: {
    check: "C-86.12",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: "A file in this change holds nothing the record can keep: it carries neither its text nor the "
      + "address of stored bytes. The record keeps only what it can check, so nothing was written. Give each file its "
      + "text or the address its bytes are stored under, and send it again.",
  },
  PROMOTED_FILE_BYTES_UNSTATED: {
    check: "C-86.13",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: "A stored file in this change does not say how large it is. The record keeps that size beside the "
      + "file and checks it against the bytes it holds, and it will not guess one. Nothing was written. Give each "
      + "stored file its size in bytes, and send it again.",
  },
  REVISION_REGROUPS_BUNDLE: {
    check: "C-86.14",
    where: "src/promotion/index.mjs #promote > is-revision-regroups-bundle",
    translation: "This change says the item was produced by a different group than the record holds. A change can alter "
      + "what a document says, but not whose it is: the record keeps who produced each thing so it can be held to "
      + "account, and letting a later change move that would let anyone re-attribute it. Nothing was written. Send it "
      + "again with the group the record holds, or with none.",
  },
  BUNDLE_ID_DISAGREES: {
    check: "C-1.1",
    where: "src/promotion/index.mjs #promote > is-promote-bundle-id",
    translation: "The document says it is a different item from the one it is being filed under. The record files a "
      + "document under the id it states, so it will not put it somewhere else. Nothing was written. Send it under the "
      + "id the document states, or correct the document's id.",
  },
  BUNDLE_MD_UNREADABLE: {
    check: "C-2.1",
    where: "src/promotion/index.mjs #promote > is-promote-readable",
    translation: "The document in this change cannot be read: it is not held as text, or it does not begin with a "
      + "readable front matter block. Every rule about a change reads the document first, so nothing was written. Send "
      + "the document as text with its front matter, and send it again.",
  },
};

/* D-510 / C-86 — THE PROMOTED DOCUMENT DECLARES ITS OWN TYPE (`BIO_Case_Making_v0_1.md` §2; C-2.5 already
 * pins a document's type to its id prefix). ONE refusal, and the family is one row rather than padded out,
 * because there is exactly one way for the two statements to be wrong about each other.
 * D-547 adds C-86.2 below: not a third statement, but the request against the RECORD's head.
 *
 * WHY IT IS A REFUSAL AND NOT A SILENT NORMALISATION, which was the alternative the row licensed: the
 * request carries TWO statements of what is being promoted — the document's own `object_type`, which every
 * column of the projection is already read from, and the envelope's `meta.object_type`, which `promote`
 * wrote into `bundles.object_type` and gated the action, bias and inquiry projections on. Obeying the
 * envelope filed an ACTION as information with its risk tier in the bytes and its basis and correspondence
 * never projected: a record holding an action it does not index as one. Obeying the document SILENTLY would
 * be the other half of the same defect — the caller asked for one thing and got another, and nothing said
 * so. So the record takes the DOCUMENT's word (the bytes are what it holds) and REFUSES the request that
 * contradicts it, naming both answers, before anything is written.
 *
 * THE COMPARISON GOES THROUGH `normalizeType` ON BOTH SIDES, so `focus` and `problem` — legal legacy
 * spellings of `inquiry` (REC-10) — are not disagreements. A fence tighter than its rule is not a safer
 * fence. A document that states NO type is not a disagreement either: the envelope is then all there is. */
export const PROMOTED_TYPE_CHECKS = {
  ENVELOPE_TYPE_DISAGREES: {
    check: 'C-86.1',
    where: 'src/promotion/index.mjs #promote > is-promoted-type-disagrees',
    translation: 'The document being filed says what kind of thing it is, and the request that carried it '
      + 'says something different. The record goes by the document, so rather than file an action as '
      + 'information — or the reverse — and index it as neither, it stops and tells you both answers. '
      + 'Nothing was written. Send it again with the request naming the type the document names, or change '
      + 'the document first.',
  },
  /* D-547 (2026-09-25) — the SECOND way a promotion's type can be wrong, and it is not the first one twice: C-86.1
   * compares the two statements in ONE request; this compares the request with the RECORD. A revision whose document
   * names a different type than the bundle already holds would rewrite `bundles.object_type` in place, and every
   * type-scoped fence would then ask the wrong machine. Replay is exempt, as for C-86.1. */
  REVISION_RETYPES_BUNDLE: {
    check: 'C-86.2',
    where: 'src/promotion/index.mjs #promote > is-promote-retypes-bundle',
    translation: 'This change would turn something the record already holds into a different kind of thing, '
      + 'an item of information into an action, say. A change can alter what a document says, but not what it '
      + 'is, because what it is decides which rules protect it. Nothing was written. To record it as the other '
      + 'kind, create a new one of that kind and link the two.',
  },
  /* D-563 (2026-09-25) — C-86.1's rule one field over, twice: the document states what it is CALLED and where it STANDS,
   * and a request whose label contradicts either is refused rather than obeyed. The name is what 7.1 holds unique and
   * the state decides who may move the item (7.11) and what may cite it (REC-181), so a label a caller can steer was
   * an authority over both. Only a contradiction between two statements: a label stating nothing takes the document's
   * word. Replay is exempt, as for C-86.1. */
  ENVELOPE_TITLE_DISAGREES: {
    check: 'C-86.3',
    where: 'src/promotion/index.mjs #promote > is-promoted-title-disagrees',
    translation: 'The document being filed gives itself one name, and the request that carried it gives another. '
      + 'The record goes by the document, and names are held unique across the instance, so rather than file it under '
      + 'a name it does not bear it stops and tells you both. Nothing was written. Send it again with the request '
      + 'naming the document\'s title, or naming none, or change the document first.',
  },
  ENVELOPE_STATE_DISAGREES: {
    check: 'C-86.4',
    where: 'src/promotion/index.mjs #promote > is-promoted-state-disagrees',
    translation: 'The document being filed says where it stands, and the request that carried it says something '
      + 'different. Where a thing stands decides who may move it and what may cite it, and the record goes by the '
      + 'document, so it stops and tells you both. Nothing was written. Send it again with the request saying what '
      + 'the document says, or saying nothing about it, or change the document first.',
  },
};

/* REC-197 / C-97 — A CREATION CARRIES ITS SETTING, AND AN OWNERLESS CREATION CANNOT CHOOSE ONE (Membership
 * Architecture v2 §7.14, RULED by BOB #32 (b), 2026-09-23: *"create and fork take one optional field,
 * `visibility` (`discoverable` or `hidden`), and an absent one is HIDDEN. A MACHINE credential never sets it:
 * the setting is an owner's act, and an ownerless project has no owner to choose. Its creation is therefore
 * HIDDEN, and a `visibility=discoverable` it sends is refused by name."*). Its own family, minted, rather than
 * C-70.5 and on, because REC-150 (the request to join) is extending C-70 in parallel. An unknown value on a
 * creation answers C-70.3, the same row the owner's act answers, through one helper. Both codes are minted in
 * `Store#promote`, before anything is written; a fork reaches them through `promote`. */
export const PROJECT_CREATION_VISIBILITY_CHECKS = {
  PROJECT_VISIBILITY_NO_OWNER: {
    check: 'C-97.1',
    where: 'src/promotion/index.mjs #promote > is-project-creation-ownerless',
    translation: 'Whether a project can be found is chosen by its owners, and a project created by a machine '
      + 'credential has no owner, so it is created hidden and cannot be made discoverable here. Nothing was '
      + 'created. Create it without the setting; an owner who joins it later can make it discoverable.',
  },
  PROJECT_VISIBILITY_NOT_A_CREATION: {
    check: 'C-97.2',
    where: 'src/promotion/index.mjs #promote > is-project-creation-visibility',
    translation: 'Whether a project can be found is chosen when it is created or forked, and this was not a '
      + 'project being created. Nothing was changed. An owner changes an existing project\'s setting in its '
      + 'settings.',
  },
};
