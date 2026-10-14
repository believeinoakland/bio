/* op-grades — R38–R41 (T48; R32's pattern; N880, N882, N670, N1042, N1047, N1026, N1027, N1029, N1030, N1034, N1035,
 * N1043; K3149, K3203, K3206, K3207, K3211, K3278, K3280, K3282, K3284) and R39's three given rows: EVERY OP T48'S
 * OWNERS ADD, graded by R5 and R3 with `affordances` R12's totality holding over them, each grade read from its owner's
 * requirements as R13, R17, R22–R37 do: `action-replies`' quoting record, `following`'s proceeding dates, `plane`'s
 * translation of one passage, `instance-setup`'s update choices and notice, `ai-use`'s use over time, `explore`'s graph,
 * `standards`' proposals, `filings`' read, `action-holds`' pressure read, `action-plans`' ask, `connections`' step source
 * and `membership`'s mark of when a member last looked at Home. Data only: no op's behaviour is decided here (P6).
 *
 * `./index.mjs` spreads the tables into `RUNGS`, `RUNG_ABSENT`, `NON_ACTS` and `MACHINE_REFUSALS`. This file imports
 * nothing, so the spread closes no cycle. `actionreplyquoting` is an `ACTS` row on an action target (`affordances` R58),
 * so it has no `NON_ACTS` row and enters `MACHINE_REFUSALS` with its owner's code; every other op, `planask` included
 * (K3297: its subject is a plan), takes a `NON_ACTS` row, which gives `op-declarations` its `NEEDS` row. No vocabulary, prompt, consequence statement
 * or Irreversible weight is added. By R18 `phone` follows the rung or ground: every op here answers true (advisory;
 * nothing refuses by device).
 *
 * R39's three: `translationdraft` leaves the `undetermined` ground (it is edited in ./t37.mjs, where its row stands),
 * and `groupdescriptiondraft` and `securitymap` are given `RUNG_ABSENT` rows below, so `interface-shell` R11 draws none of
 * the three as a reasoned act. R42's `MARKS` is in ./marks.mjs. */

const R = (s) => `read: ${s}; writes nothing`;

/* ---- the rungs (`affordances` R19's backing beside each) ---- */
export const T48_RUNGS = {
  /* R38. action-replies R10: a later record takes it back (`quotable: true` withdraws the declaration), and it asks no
     reason (its `words` are the reply's own, a quote's shape, not the member's account) */
  actionreplyquoting: "reversible", // a later actionreplyquoting takes it back
  /* R40. instance-setup R90: refused without a reason UPDATE_SKIP_NO_REASON; a skip is recorded with who, when and why and
     never erased */
  updateskip:         "reasoned",   // UPDATE_SKIP_NO_REASON (instance-setup R90)
  /* R40: `updatelater` sets the release aside until it returns on its own, a later choice takes it back; `updatestart`
     records the choice and answers the installer's address, installing nothing, and a later updatelater or updateskip
     stands in its place while the release is not installed. Neither asks a reason. */
  updatelater:        "reversible", // a later choice takes it back (instance-setup R90)
  updatestart:        "reversible", // a later updatelater or updateskip stands in its place (instance-setup R90)
  /* R41. action-plans R51: `airunopen`'s shape (R1), the run-starting act: it opens a planning run that `airunclose` ends,
     and asks no reason */
  planask:            "reversible", // airunclose ends the run it opens
  /* connections R68: the member's `basis` is its authored reason, as connectionassert's; STEP_SOURCE_NO_BASIS refuses its
     absence. A withdrawal says why (NO_REASON, already in the family); nothing is erased. */
  stepsource:         "reasoned",   // STEP_SOURCE_NO_BASIS (connections R68)
  stepsourcewithdraw: "reasoned",   // NO_REASON (connections R68)
};

/* ---- the stated absences ---- */
export const T48_RUNG_ABSENT = {
  /* R39 (N1042; K3149), amending R2: an administrator's own draft request, and an administrator's own read of a tally. Each
     is drawn with no weight and no reason asked, since none is an act on the record; their NON_ACTS sentences stand
     (R16, R22). */
  groupdescriptiondraft: { ground: "caller-owned", is: "an administrator's own request for a labelled machine draft of the group's description, answered into their own field and never the group's words until they keep it by their own act (instance-setup R65)" },
  securitymap:           { ground: "caller-owned", is: "an administrator's own read of the group's count-only security tally by kind and period, with its usual and its level, naming no address and no handle (file-safety)" },
  /* R41. membership R143: a member's own mark of when she last looked at Home, answered to her alone and recorded at the
     read, as memberlanguageset's subject; it asks no reason */
  lookedsince:           { ground: "caller-owned", is: "a member's own mark of the instant she last looked at Home, recorded when she looks and answered to her alone; it asks no reason and holds nothing else (membership R143)" },
};

/* ---- the refusals of a machine by name (R5; `affordances` R20) ---- */
export const T48_MACHINE_REFUSALS = {
  actionreplyquoting: "MACHINE_CANNOT_RECORD_QUOTING", // action-replies R10, as actionreplybearing
  /* `planask` has none (K3297): its subject is a plan, so it is a NON_ACTS row, as T45 left the plan acts; action-plans R51
     refuses a machine by its own code. */
};

/* ---- every op's NON_ACTS reason (R5; R32: a read "read: …" and a draft "draft: …") ---- */
export const T48_NON_ACTS = {
  /* R38 */
  proceedingdates: R("the dates of one proceeding the author may see, in two lanes never interleaved: what the record "
    + "already dates and what is followed (following R30)"),
  readtranslate: "draft: a machine translation of one passage of the group's own writing (a note, question, finding or "
    + "notice) into the member's language, labelled machine work, the original one tap away; held nowhere and writes "
    + "nothing (plane R50)",
  /* R40 */
  updateskip: "release-directed: keyed by a verified release notice, reached from Settings › Updates and the "
    + "administrators' queue; an administrator's choice, recorded with who and when; installs nothing (the installer "
    + "installs, with Cloudflare's consent)",
  updatelater: "release-directed: keyed by a verified release notice, reached from Settings › Updates and the "
    + "administrators' queue; an administrator's choice, recorded with who and when; installs nothing (the installer "
    + "installs, with Cloudflare's consent)",
  updatestart: "release-directed: keyed by a verified release notice, reached from Settings › Updates and the "
    + "administrators' queue; an administrator's choice, recorded with who and when; installs nothing (the installer "
    + "installs, with Cloudflare's consent)",
  updatenotice: R("the verified release notice Settings › Updates draws, to administrators only (instance-setup R89)"),
  /* R41 */
  aiuseovertime: R("one assistant account's use over time, by day and by period, to that account's owners (ai-use R14)"),
  exploregraph: R("what the record joins a centre to, two rings out: the nodes and steps the connection graph draws on "
    + "Explore connections, a person's Connections and the money trail (explore R21)"),
  standardproposals: R("the proposals made for one project's standards, open, adopted or all, each labelled as who "
    + "proposed it and whether it is machine work (standards R57)"),
  filingread: R("one prepared draft or communication as it was stored, its text, blanks, fills and offers, beside its "
    + "approval and sending when recorded (filings R59)"),
  pressurefor: R("the pressure marks and pressure records of an action or project the viewer may see, each with where it "
    + "arrived (action-holds R16)"),
  planask: "plan-directed: keyed by a plan; a member asks the assistant for options on it, opening one planning run whose "
    + "proposals reach the member's tray; writes no option and moves no bundle",
  stepsource: "relation-directed: keyed by a declared relation and a held capture's passage; a member's cited backing of "
    + "a declared step, withdrawn only by a reasoned act and never erased; moves no bundle",
  stepsourcewithdraw: "relation-directed: keyed by a declared relation and a held capture's passage; a member's cited "
    + "backing of a declared step, withdrawn only by a reasoned act and never erased; moves no bundle",
  lookedsince: "personal state, keyed by member: the instant she last looked at Home, answered to her alone and recorded "
    + "at the read; moves no bundle",
};
