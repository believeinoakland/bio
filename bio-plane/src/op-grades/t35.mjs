/* op-grades — R21, R22 (K1943; T35): THE OPS `op-declarations` R30 DECLARES, graded by R5 and R3 with `affordances` R12's
 * totality holding over them, each grade read from its owner's requirements as R13 and R17 do; and `personexpunge`'s
 * consequence statement (N623, DEC-142), a named exception beside `actionholdrelease` (R8, DEC-113's tier). Data only: no
 * op's behaviour is decided here (P6). `./index.mjs` spreads the four tables into `RUNGS`, `RUNG_ABSENT`, `NON_ACTS` and
 * `CONSEQUENCE_STATEMENTS`, and derives R21's Irreversible weight. This file imports nothing, so the spread closes no
 * cycle. None of these ops is in `MACHINE_REFUSALS`, which holds only `affordances`' `ACTS` (R5, `affordances` R20).
 * `subscriptionsignin` has no op in T35 and no grade (`op-declarations` R27). */

const R = (s) => `read: ${s}; writes nothing`;
const NOTE_DIRECTED = "note-directed: a member's own note, keyed by the note and answered to its author alone; never a "
  + "record id, never cited, published or counted; moves no bundle";
const SESSION_DIRECTED = "session-directed: ends the caller's own session, or every session of the caller's role; moves "
  + "no bundle";

/* ---- the rungs (`affordances` R19's backing beside each) ---- */
export const T35_RUNGS = {
  /* acquisition R43: a further set takes it back, and it asks no reason (R3) */
  coarchiveset:         "reversible", // a further coarchiveset sets it again
};

/* ---- the stated absences ---- */
export const T35_RUNG_ABSENT = {
  /* acquisition R38, R40, on R3's rule, as inboxpull and caseimport */
  unpack:               { ground: "undetermined", is: "files a held archive's entries as captures of their own in a member's name, each at the archive's grade and promoted beside it; asks no authored reason, and no published act takes it back (acquisition R38, R40)" },
  /* hypotheses R11, R12 (DEC-144), as notewrite (R15) */
  noterevise:           { ground: "caller-owned", is: "a member revises their own note in place, answered to that member alone; no history is kept (hypotheses R11, R12)" },
  notedelete:           { ground: "caller-owned", is: "a member deletes their own note for good, with no marker, answered to that member alone (hypotheses R11, R12)" },
  /* credentials R39 (F14), a member's own sessions, as reminderset: so by R18 each is a phone act */
  signout:              { ground: "caller-owned", is: "a member ends the session they are using; it moves nothing in the record (credentials R39)" },
  signouteverywhere:    { ground: "caller-owned", is: "a member ends every session of their own role; it moves nothing in the record (credentials R39)" },
  /* credentials R46, R47 (K1888), as signeradd and knockerconsent */
  recoverycodesissue:   { ground: "credential", is: "an administrator issues their own ten one-time recovery codes, shown once and stored as digests (credentials R46)" },
  recover:              { ground: "credential", is: "a recovery code and a new password, reached with no session, set the password and spend the code (credentials R47)" },
};

/* ---- every op's NON_ACTS reason (R5) ---- */
export const T35_NON_ACTS = {
  unpack: "archive-directed: keyed by a held archive's capture, reached from its screen; files its entries as captures of "
    + "their own at the archive's grade, each promoted beside it",
  coarchiveset: "setting: the group's choice whether a capture asks for a co-archive; an administrator's act; moves no "
    + "bundle",
  noterevise: NOTE_DIRECTED,
  notedelete: NOTE_DIRECTED,
  signout: SESSION_DIRECTED,
  signouteverywhere: SESSION_DIRECTED,
  recoverycodesissue: "credential: an administrator's own recovery codes, shown once; moves no bundle",
  recover: "credential: a recovery code and a new password, reached with no session; moves no bundle",
  archivelist: R("a held archive's entries, each one's state and, when not filed, its refusal by name"),
  coarchivestate: R("whether the group's captures ask for a co-archive"),
  findin: R("what a scope holds of the kinds asked, each match with its words and extent, found by search; it records "
    + "nothing"),
  entitieskind: R("the group's registered entities of one kind, within the viewer's gate"),
  securitymap: R("the group's count-only security tally by kind and period, with its usual and its level, to an "
    + "administrator; it names no address and no handle"),
  recoverycodesstate: R("how many of an administrator's own recovery codes are unspent, never a code"),
  adminrecoverystep: R("whether the group's second-administrator step is done, to an administrator"),
  agentpack: R("the agent's pack and fences, as op=affordances carries them"),
  credit: "read: public, no credential",
};

/* ---- R21 (N623, DEC-142): `personexpunge`'s consequence statement. Its rung stays `reasoned` (people R12 refuses it
   without a reason, R13), its name honest; the full dialog states what the owner enforces: the value removed from the
   person's page, every question that cited it and every export, with no read answering it again (people R12), and a
   marker in its place. The surface reads it by the act's id and fills `<date>` and `<member>`. ---- */
export const T35_CONSEQUENCE_STATEMENTS = Object.freeze({
  personexpunge: Object.freeze({ friction: "dialog",
    statement: "This removes the value for good: from the person's page, from every question that cited it and from "
      + "every export. It cannot be undone, by you or by anyone. A marker stays in its place: \"Removed where the law "
      + "requires, <date>, by <member>\". Published cases change only through the docket. Confirm with a reason naming "
      + "the law or order that requires it: \"Remove it for good, with this reason\"." }),
});
