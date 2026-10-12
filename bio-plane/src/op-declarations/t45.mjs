/* op-declarations R49 (T45; the Actions fold, N893; K2780, K2781, K2787, K2817, K2820, K2824, K2834, K2839, K2874):
   T45'S OPS, held apart from `index.mjs` for size (M-T45-6). Each op is named under its owner with the kind
   `index.mjs`' `OP_KINDS` gives it, read from the owner's merged requirements and its ops map's arm:
   - an act its owner refuses a machine by name (`MACHINE_CANNOT_…`) is `member`: a session's only, `contribute`;
   - a member's own setting or to-do (a review rhythm, an item taken up, a standing question's end) is `own`;
   - an administrator's act (NOT_AN_ADMIN) is `admin`; a project's setting decided by the owner's own predicate is
     `owners`, `projectvisibilityset`'s posture (no working capability);
   - a labelled machine proposal is `proposal`, any credential's, its proposer stamped;
   - a read is `read`, or `ownread` where the owner answers a member's session only;
   - case-check's held check is `publishgate`, `publish`'s spec and capability.
   This file is data only (R5, R7): `index.mjs` builds each entry with `family()` and spreads it into the tables.

   `T45_SHARES` adds T45's ops to an owner whose family exists (its `ops` merged, its `extra` merged, and `actor` or
   `proposer` given where the family had none); `T45_FAMILIES` are the owners T45 gives a family. */
const QUERY = (key) => Object.freeze({ key, at: "query" });
const BODY = (key) => Object.freeze({ key, at: "body" });

const T45_SHARES = Object.freeze({
  /* following R22–R25 (D6d; K2781 (2)): a follow's end changed by its author, a watch linked to the plan that set it
     running and the once-only question answered (MACHINE_CANNOT_FOLLOW, MACHINE_CANNOT_LINK_WATCH), `by` from the
     query; the due questions a read. */
  following: Object.freeze({ cite: "following R22–R25; R49", ops: Object.freeze({
    followend: "member", watchlink: "member", watchanswer: "member", watchquestions: "read" }) }),
  /* answers R34: a standing question's end changed by its author, the member's own (MACHINE_CANNOT_AUTHOR). */
  answers: Object.freeze({ cite: "answers R34; R49", ops: Object.freeze({ standingendset: "own" }) }),
  /* duties R30, R31 (K2817): a duty proposed from a reply's promise or a report's required response, any credential's,
     labelled by its `by`; the duties arising in captures a read. */
  duties: Object.freeze({ cite: "duties R30, R31; R49", ops: Object.freeze({ dutyfromresponse: "proposal", dutiesarising: "read" }) }),
  /* reading-guides R13 (K2820, K2825): a kind's procedure guides, a read a planning run's agent reaches by its scope
     (`PLAN_RUN_SCOPE`, K2824), so `read`, not a session's only. */
  "reading-guides": Object.freeze({ cite: "reading-guides R13; R49", ops: Object.freeze({ procedureguides: "read" }) }),
  /* actions R80, R87, R88, R92: receipt recorded on a sent entry, the confidential scope set and removed, a promise
     the group made recorded, each a member's (MACHINE_CANNOT_CORRESPOND, _SET_SCOPE, _RECORD_PROMISE), `author` from the
     query; the open items with the same office a read. */
  actions: Object.freeze({ cite: "actions R80, R87, R88, R92; R49", actor: QUERY("author"), ops: Object.freeze({
    actionreceipt: "member", actionscope: "member", actionpromise: "member", openitemswith: "read" }) }),
  /* action-clocks R18 (v0.2 rule 6): a clock entry stated by a member (MACHINE_CANNOT_STATE_CLOCK). */
  "action-clocks": Object.freeze({ cite: "action-clocks R18; R49", ops: Object.freeze({ clockstate: "member" }) }),
  /* case-account R13 (K2834): a member's own text checked against the evidence in her own project
     (MACHINE_CANNOT_CHECK_ADVOCACY), `by` from the query, which the door hands as the owner's `author`; the checks a
     session's read. No map: the plane routes both (T45-47). */
  "case-account": Object.freeze({ cite: "case-account R13; R49", ops: Object.freeze({
    advocacycheck: "member", advocacychecks: "ownread" }) }),
  /* instance-setup R77: the group's declared stake, an administrator's act (NOT_AN_ADMIN), `stake` the body's. */
  "instance-setup": Object.freeze({ cite: "instance-setup R77; R49", ops: Object.freeze({ declaredstakeset: "admin" }) }),
});

const T45_FAMILIES = Object.freeze([
  /* action-holds R1–R12 (K2781 (1)): the hold notice recorded sent and pressure recorded outside any action, each a
     member's (MACHINE_CANNOT_SEND, MACHINE_CANNOT_MARK_PRESSURE), `author` from the query. The ops moved from
     `actions` keep their specs and take their lists here (`ACTION_HOLDS_ACTIONS`, `ACTION_HOLDS_READS`). */
  Object.freeze({ owner: "action-holds", cite: "action-holds R11, R12; R49", actor: QUERY("author"), ops: Object.freeze({
    holdnoticesent: "member", pressurerecord: "member" }) }),
  /* action-replies R1, R2, R4: a reply's bearing claim by claim and a response's arising, a member's
     (MACHINE_CANNOT_RECORD_BEARING, MACHINE_CANNOT_LINK); a proposed bearing any credential's, labelled. */
  Object.freeze({ owner: "action-replies", cite: "action-replies R1, R2, R4; R49", actor: QUERY("author"),
    proposer: QUERY("proposer"), ops: Object.freeze({
    actionreplybearing: "member", actionbearingpropose: "proposal", arosefrom: "member" }) }),
  /* action-plans R33, R39, R40: a scenario set aside and restored, a plan paused and resumed, each with a reason, a
     joined member's (MACHINE_CANNOT_PLAN). */
  Object.freeze({ owner: "action-plans", cite: "action-plans R33, R39, R40; R49", actor: QUERY("author"), ops: Object.freeze({
    scenariosetaside: "member", scenariorestore: "member", planpause: "member", planresume: "member" }) }),
  /* plan-work R1–R8, R11, R13 (K2781 (1)): a matter's outcome, a review recorded, a preparation item added and done,
     a comment and a status report kept, each a member's (MACHINE_CANNOT_PLAN); the review rhythm and the take-ups, a
     member's own to-dos (`queuemute`'s reasoning); the matters, timeline, review, items, comments, where the plan
     stands, the status report's draft (machine work writing nothing), the reports and a matter's duties, reads. */
  Object.freeze({ owner: "plan-work", cite: "plan-work R1–R8, R11, R13; R49", actor: QUERY("author"), ops: Object.freeze({
    matteroutcomeset: "member", planreviewrecord: "member", prepitemadd: "member", prepitemdone: "member",
    plancomment: "member", statusreportsave: "member",
    planreviewrhythm: "own", prepitemtakeup: "own", itemtakeup: "own",
    matters: "read", plantimeline: "read", planreviewopen: "read", planreviews: "read", prepitems: "read",
    plancomments: "read", whereitstands: "read", statusreportdraft: "read", statusreports: "read",
    matterpromiseduties: "read" }) }),
  /* filings R36, R41, R42, R47: a second approval and a partner's joint approval recorded, a member's
     (MACHINE_CANNOT_APPROVE); the hold notice drafted, any credential's, labelled by its preparer (`author`, as
     `communicationprepare`'s); the templates offered for an action a read. The assertion resolution per sentence is
     `filingapprove`'s (the plan's reconciliation R1), declared in `FILINGS_ACTIONS`. */
  Object.freeze({ owner: "filings", cite: "filings R36, R41, R42, R47; R49", actor: QUERY("author"),
    proposer: QUERY("author"), ops: Object.freeze({
    filingsecondapprove: "member", jointsignatory: "member", holdnoticeprepare: "proposal", templatesforaction: "read" }) }),
  /* conformance R36, R37: a cure linked and unlinked, a joined member's (MACHINE_CANNOT_LINK_CURE); the cures a read. */
  Object.freeze({ owner: "conformance", cite: "conformance R36, R37; R49", actor: QUERY("author"), ops: Object.freeze({
    curelink: "member", cureunlink: "member", cures: "read" }) }),
  /* consequences R17–R23: a success recorded, revised and carried into a case's next edition, a joined member's
     (MACHINE_CANNOT_RECORD_SUCCESS, MACHINE_CANNOT_CARRY); the records reads. */
  Object.freeze({ owner: "consequences", cite: "consequences R17–R23; R49", actor: QUERY("author"), ops: Object.freeze({
    successrecord: "member", successrevise: "member", outcomecarry: "member", successread: "read",
    successrecords: "read" }) }),
  /* case-check R1, R2 (K2839): a case checked and held unsigned, graded as publishing (`publish`'s spec and
     capability; the owner answers MACHINE_CANNOT_PUBLISH and NOT_THE_PROJECT_OWNER); a check's state a read. */
  Object.freeze({ owner: "case-check", cite: "case-check R1, R2; R49", actor: QUERY("author"), ops: Object.freeze({
    publishcheck: "publishgate", casecheck: "read" }) }),
  /* project-roster R21, R24: a project's scope set (a counsel matter, `own`, `none` its removal) and its second-approval
     rule, project settings decided by the owner's own predicate (PROJECT_ACT_NOT_A_PARTICIPANT, NOT_THE_OWNER), `by`
     from the query. */
  Object.freeze({ owner: "project-roster", cite: "project-roster R21, R24; R49", actor: QUERY("by"), ops: Object.freeze({
    projectscopeset: "owners", projectapprovalset: "owners" }) }),
  /* local-facts R10–R13: a group rule drafted, confirmed and withdrawn, a member's (MACHINE_CANNOT_DRAFT_RULE,
     MACHINE_CANNOT_CONFIRM), `by` the body's (as `factconfirm`'s); a confirmed rule offered and the group's rules (R12),
     a session's reads. */
  Object.freeze({ owner: "local-facts", cite: "local-facts R10–R13; R49", actor: BODY("by"), ops: Object.freeze({
    ruledraft: "member", ruleconfirm: "member", rulewithdraw: "member", ruleoffer: "ownread", grouprules: "ownread" }) }),
  /* agent-worker R76, R77 (K2824, K2881): the assistant's infraction draft and reply-bearing draft, each a member's own
     labelled draft that writes nothing, declared as `writinghelp` is (a session's read, `by` and the viewer stamped);
     the plane builds their doors (T45-47), handing the records the drafts read. `textcheck` is no op in T45 (N917). */
  Object.freeze({ owner: "agent-worker", cite: "agent-worker R76, R77; R49; K2824, K2881", actor: QUERY("by"),
    extra: Object.freeze({ infractiondraft: Object.freeze(["by"]), bearingdraft: Object.freeze(["by"]) }), ops: Object.freeze({
    infractiondraft: "ownread", bearingdraft: "ownread" }) }),
]);

export { T45_SHARES, T45_FAMILIES };
