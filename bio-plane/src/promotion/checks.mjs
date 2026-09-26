/* promotion's own refusal rows: the write door's refusals that the catalogue (`legacy-checks`) has no row for.
 *
 * Each row is `{check, translation}`, the shape of the catalogue's DEC-49 rows, so a refusal carries its check id and
 * a member-facing translation (requirement R20's "Errors"). C-86.5 to C-86.14 were written for `op=promote` by the
 * Batch30 rows D-546, D-578, D-615, D-628, D-692, D-707 and D-726 (never landed; reachable on
 * `snapshot/pre-refactor-2026-09-25`'s branches), and are carried here with their wording. `BUNDLE_ID_DISAGREES`
 * (R14, D-738) is the catalogue's C-1.1 asked at the door; `BUNDLE_MD_UNREADABLE` (R17, D-741) is C-2.1's.
 */

export const PROMOTION_CHECKS = {
  STATE_MOVE_UNDECLARED: {
    check: "C-86.6",
    translation: "That is not a move this item can make from where it stands. Each kind of thing has a set of moves "
      + "its rules allow, and this one is not among them, so nothing was written. Move it by a step the rules allow, "
      + "or leave it where it stands and record what changed.",
  },
  PROMOTED_TYPE_UNSTATED: {
    check: "C-86.5",
    translation: "This is a new item and nothing says what kind of thing it is: neither the document nor the request "
      + "names a type. What it is decides which rules protect it, so the record will not guess. Nothing was written. "
      + "Say in the document what kind of thing it is, and send it again.",
  },
  ENVELOPE_DATES_DISAGREE: {
    check: "C-86.7",
    translation: "The document being filed says when it was made or last changed, and the request that carried it says "
      + "a different time. The record keeps its history in the order those dates give, and it goes by the document, so "
      + "it stops and tells you both. Nothing was written. Send it again with the request giving the document's dates, "
      + "or giving none, or change the document first.",
  },
  PROMOTED_FIELD_UNSTATED: {
    check: "C-86.8",
    translation: "This is a new item and it does not say where it stands, or when it was made or last changed: neither "
      + "the document nor the request gives it. The record keeps its history in the order those dates give and decides "
      + "what may be done with a thing by where it stands, so it will not guess. Nothing was written. Say it in the "
      + "document, and send it again.",
  },
  REVISION_REDATES_CREATION: {
    check: "C-86.9",
    translation: "This change says the item was made at a different time than the record holds. A change can alter what "
      + "a document says, but not when it was made: the record orders its history by that date, and letting a later "
      + "change move it would let anyone backdate something. Nothing was written. Send it again with the date the "
      + "record holds, or with none.",
  },
  PROMOTE_SNAP_KEY_UNSTATED: {
    check: "C-86.10",
    translation: "This change does not say what to call it in the item's history: the request carries no snapshot "
      + "key. Every change is kept under its own name so it can be found and compared later, and the record will not "
      + "make one up. Nothing was written. Send it again with a snapshot key.",
  },
  PROMOTED_FILE_PATH_UNSTATED: {
    check: "C-86.11",
    translation: "A file in this change has no name: it gives no path, or it is not a file at all. The record keeps "
      + "every file under its name and will not guess one. Nothing was written. Name each file, and send it again.",
  },
  PROMOTED_FILE_CONTENT_UNSTATED: {
    check: "C-86.12",
    translation: "A file in this change holds nothing the record can keep: it carries neither its text nor the "
      + "address of stored bytes. The record keeps only what it can check, so nothing was written. Give each file its "
      + "text or the address its bytes are stored under, and send it again.",
  },
  PROMOTED_FILE_BYTES_UNSTATED: {
    check: "C-86.13",
    translation: "A stored file in this change does not say how large it is. The record keeps that size beside the "
      + "file and checks it against the bytes it holds, and it will not guess one. Nothing was written. Give each "
      + "stored file its size in bytes, and send it again.",
  },
  REVISION_REGROUPS_BUNDLE: {
    check: "C-86.14",
    translation: "This change says the item was produced by a different group than the record holds. A change can alter "
      + "what a document says, but not whose it is: the record keeps who produced each thing so it can be held to "
      + "account, and letting a later change move that would let anyone re-attribute it. Nothing was written. Send it "
      + "again with the group the record holds, or with none.",
  },
  BUNDLE_ID_DISAGREES: {
    check: "C-1.1",
    translation: "The document says it is a different item from the one it is being filed under. The record files a "
      + "document under the id it states, so it will not put it somewhere else. Nothing was written. Send it under the "
      + "id the document states, or correct the document's id.",
  },
  BUNDLE_MD_UNREADABLE: {
    check: "C-2.1",
    translation: "The document in this change cannot be read: it is not held as text, or it does not begin with a "
      + "readable front matter block. Every rule about a change reads the document first, so nothing was written. Send "
      + "the document as text with its front matter, and send it again.",
  },
};
