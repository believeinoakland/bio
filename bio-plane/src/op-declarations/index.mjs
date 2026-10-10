/* op-declarations: WHAT EACH OP IS (R1–R46). Every op's spec, the act lists that drive the stamps and the fences, the
   session sets, the capability table, the recorded decisions that a verb is not a person's, and the act gate read
   from those tables. It declares; it judges no caller and routes nothing (`admission` and `control-plane` read it).
   Copied from `control-plane/ops.mjs` at the control-plane split (T18, K617, K624 (1), (2)), which control-plane's own
   job has since deleted; that file came from legacy-index at control-plane's extraction (T12, K3, K93). The handlers stay with
   their modules and only the declarations live here.
   R5: every table and list is FROZEN data, read as it is exported — the specs and their class lists, the arrays, the
   two session sets (each a `FrozenSet`, whose `add`, `delete` and `clear` refuse) and the two maps. Nothing here is
   computed from a request, a store or the environment, and nothing here reads one (R7). */
import { decorate } from "../affordances.mjs";

/* R5: a set that answers `has`, `size` and iteration as a Set does and has no way to change. Its members live in a
   private field, so `Set.prototype.add.call` finds no set to add to; it has no `add`, `delete` or `clear` of its own
   (each refuses by name, so a reader who reaches for one is told why); it and its prototype are frozen. */
class FrozenSet {
  #items;
  constructor(items) { this.#items = new Set(items); Object.freeze(this); }
  has(x) { return this.#items.has(x); }
  get size() { return this.#items.size; }
  [Symbol.iterator]() { return this.#items.values(); }
  values() { return this.#items.values(); }
  keys() { return this.#items.keys(); }
  entries() { return this.#items.entries(); }
  forEach(fn, self) { for (const x of this.#items) fn.call(self, x, x, this); }
  add() { throw new TypeError("op-declarations: a session set is frozen data (R5)"); }
  delete() { throw new TypeError("op-declarations: a session set is frozen data (R5)"); }
  clear() { throw new TypeError("op-declarations: a session set is frozen data (R5)"); }
}
Object.freeze(FrozenSet.prototype);
Object.freeze(FrozenSet);
const frozenSet = (items) => new FrozenSet(items);
/* R5: an op table frozen to its leaves — each spec, and each class list in it. */
const frozenTable = (t) => {
  for (const v of Object.values(t)) if (v && typeof v === "object") {
    for (const w of Object.values(v)) if (Array.isArray(w)) Object.freeze(w);
    Object.freeze(v);
  }
  return Object.freeze(t);
};
const frozenList = (a) => Object.freeze(a);

/* T34 (R21; DEC-139 (5), K1565): THE REGISTRY'S REQUIREMENT FUNCTIONS UNDER THEIR OWN NAMES. The screen registry
   (`docs/development/ux-substrate/screens/registry.json`) marks an act `function` by its requirement function's name
   lowercased; where that name is not already an op, its owner serves the function under the op named here, and the
   alias is that op in every table — its spec, both session sets, its `NEEDS` row, every act list naming the op and its
   stamps — so the control plane routes the two to one handler and they answer alike (control-plane R55). Each was read
   at the owner's ops map. A function no op serves has no alias (R6).
   T35 (K1901): the registry is read as PR #12 left it. The person screen names `personexpunge` itself (DEC-142), so it
   is the declared op of people's family and no alias names `expunge`; an act marked `owed:<op>` whose op is declared
   here under that name (`placewanted`, `securitymap`, `findin`, …) is that op, with no alias made for it.
   T37 (R21; N776, DEC-182 (1), (4)): the registry is read as PR #14 left it (`e08cd35ecb`). It names no function that
   no op serves: `projectcreated`, `countask`, `registerproceeding` and `deadlinecompute` are withdrawn there (their
   buttons re-pointed to `promote`, `calculationcreate`, `entitycreate` and `clockpropose`, each a declared op), and
   `setpassword` is an owed act, declared under its own name in credentials' family (R39) beside `obscuremark` (R38),
   `subscriptionsignin` (R36) and the translation acts (R35, R37); `infolevelset` alone stays owed with no spec. The
   same-person claim is one op there, `identityclaim` (DEC-182 (2)): `claimidentity` is no registry function and no
   alias.
   T38 (R21, R40; N788, DEC-183): the registry is read as PR #15 left it (`c848b56671`): its owed act
   `obscuremarkwithdraw` (the ceremony's Photos step) is declared under its own name in case-carriage's family (R40),
   with no alias; `infolevelset` alone stays owed with no spec. */
const OP_ALIASES = Object.freeze({
  signerregisterown: "signerregister", signerrevokeown: "signerrevoke",             // credentials (membership R89, R90)
  declaretie: "membertie", withdrawtie: "membertiewithdraw", recordpersonfact: "personfact",   // people
  withdrawidentityclaim: "identitywithdraw",
  adoptversion: "versionadopt", keepversion: "versionkeep",                         // reevaluation
  strengthbarset: "strengthbar",                                                    // strength
  ruleanswer: "rule", standingquestionset: "standingset", standingquestionend: "standingend",  // answers
  createevent: "eventcreate", addparticipant: "participantadd", relate: "eventrelate",         // events
  recorddatedfact: "datedfact",
  recordfact: "moneyrecord", createset: "moneysetcreate", include: "moneysetinclude",           // money
  exclude: "moneysetexclude", reconcile: "moneyreconcile",
  addworkbook: "workbookadd", bind: "workbookbind", recordcheck: "workbooksecondcheck",         // workbooks
  recordline: "linerecord",                                                         // lines
  declare: "dutydeclare",                                                           // duties
  filingrecordsent: "filingsent",                                                   // filings
});
const ALIAS_PAIRS = Object.entries(OP_ALIASES);
/* a list with each alias beside the op it names; a table with each alias's row a copy of its op's */
const withAliases = (a) => [...a, ...ALIAS_PAIRS.filter(([al, op]) => a.includes(op) && !a.includes(al)).map(([al]) => al)];
const listed = (a) => frozenList(withAliases(a));
const aliasRows = (t) => {
  for (const [al, op] of ALIAS_PAIRS) if (Object.hasOwn(t, op))
    t[al] = Array.isArray(t[op]) ? frozenList([...t[op]]) : t[op] && typeof t[op] === "object" ? { ...t[op], ...(Array.isArray(t[op].classes) ? { classes: [...t[op].classes] } : {}),
      ...(Array.isArray(t[op].machineClasses) ? { machineClasses: [...t[op].machineClasses] } : {}) } : t[op];
  return t;
};

/* T33 (R17–R20; T33-88, K1122; B1a.16, C:A-16, Q0-10, Q1-6): THE OP FAMILIES, ONE APPEND SITE EACH. Every op T33's new
   modules serve, and every op T33 adds to an earlier module, is declared here once, in its owner's entry, and the entry
   is all that is spread below into `OPS`, both `SESSION_OPS` sets and `NEEDS` — so a family cannot be specced in one
   table and forgotten in another. An entry names each op's KIND (the spec and capability it takes) and the stamps the
   door sets on it: `viewer` on every op of every family (each owner answers by the caller's sight and fails closed
   without it) but T34's public doors and reads, which stamp only what their family names (R22), `actor` on each act and `proposer` on each proposal, each `{key, at}` — the parameter the owner reads
   and whether it reads it from the `query` or the `body`, because the owners differ (events, duties, following and
   credentials read `by` from the query; lines, money, workbooks, people and hypotheses from the body; standards reads
   `author` and `proposer` from the body; calculations and answers take the stamped `viewer` as their actor). The
   stamps themselves are the control plane's (`control-plane`'s arms, K1122): this table only says which.
   The kinds (R19): an act its owner admits a machine to (labelled `class:<cls>`, DEC-52) is `open` — admin, member and
   probe, `contribute`; an act its owner refuses a machine by name is `member` — a session's only (`machineClasses: []`),
   `contribute`; an administrator's own act (asked of the roster, NOT_AN_ADMIN) is `admin`, and a member's act on their
   own account, attention or ties is `own` — each a session's only and, on D-136's and `queuemute`'s reasoning, no
   working capability (`null`; since T37 also a member's act its owner gates by its own grant, not a capability: the
   interface's translation, R35, R37); a `proposal` is any credential's, an agent credential's by its scope (R2), labelled by
   its proposer, `contribute`; a `tally` writes a count in no one's name (`null`); a `read` is admin, member and probe
   and an `ownread` a session's only, each with a present `null` row (affordances R40 names each a NON_ACT). */
const MEMBER_PROBE = ["admin", "member", "probe"];
const SESSION_KINDS = ["admin", "member"];
const OP_KINDS = Object.freeze({
  open:     Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: true },  needs: "contribute" }),
  member:   Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: "contribute" }),
  admin:    Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: null }),
  own:      Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: null }),
  proposal: Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: true },  needs: "contribute" }),
  tally:    Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: true },  needs: null }),
  read:     Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: false }, needs: null }),
  ownread:  Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: false }, needs: null }),
  /* T34 (R22, R25, R28): an administrator's roster act, `hostingaccessset`'s spec (the operator's bearer reaches it and
     the owner asks the roster, NOT_AN_ADMIN; K1749); a member's act or read whose classes name `probe` and whose
     `machineClasses: []` refuses every bearer — `publishact` on the publication surface (`publish`), `sessionact` on
     the member's own settings (no working capability), `sessionread` a read. */
  roster:   Object.freeze({ spec: { classes: MEMBER_PROBE, machineClasses: ["admin", "probe"], mutating: true }, needs: null }),
  publishact:  Object.freeze({ spec: { classes: MEMBER_PROBE, machineClasses: [], mutating: true }, needs: "publish" }),
  sessionact:  Object.freeze({ spec: { classes: MEMBER_PROBE, machineClasses: [], mutating: true }, needs: null }),
  sessionread: Object.freeze({ spec: { classes: MEMBER_PROBE, machineClasses: [], mutating: false }, needs: null }),
  /* T34 (R22): what is stamped nothing — a public door that gates itself by what its body carries (`door`), a public
     read (`public`), and a read of the group's own published setting (`plainread`). Each has NO `NEEDS` row
     (`needs: undefined`), and a public one is in no session set: every caller reaches it. A family's extras still
     stamp it (R22's `groupdescription` reads who is asking from `viewer`). */
  door:      Object.freeze({ spec: { classes: null, mutating: true },  needs: undefined, public: true,  stamped: false }),
  public:    Object.freeze({ spec: { classes: null, mutating: false }, needs: undefined, public: true,  stamped: false }),
  plainread: Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: false }, needs: undefined, stamped: false }),
  /* T35 (R30): the archive's unpack, which the daemon continues past one call (`capture`'s `archive-unpack` queue) — the
     one family act a `daemon` reaches, its bearers bounded to `daemon` and `probe` by `machineClasses`, `contribute`;
     a group setting's plain read with a present null row (`coarchivestate`), stamped nothing; and a session's own end
     (`signout`, `signouteverywhere`), a session's only, no working capability, stamped only with what its family's
     extras name (the session token itself, never the caller's copy). */
  daemonact:   Object.freeze({ spec: { classes: [...MEMBER_PROBE, "daemon"], machineClasses: ["daemon", "probe"], mutating: true },
                               needs: "contribute" }),
  settingread: Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: false }, needs: null, stamped: false }),
  sessionend:  Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: null, stamped: false }),
  /* T36 (R32; file-safety R8, R10, R13, R33): a member's act on a file they may see that names no actor — opening the
     original, asking a deeper check or a safe copy — a session's only, no working capability, stamped with the viewer
     alone (its family's extras): nothing it stamps says who asked, beside the viewer the owner reads sight by. */
  sightact:    Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: null, stamped: false }),
  /* T41 (R42; K2574): a public read with a present null row, stamped only what its family's extras name (`handlecheck`,
     as `noticespublic` is in NEEDS, so op-grades' NON_ACTS row stands); and (R43; K2496) a run's act declared as
     `extractpropose` is — any credential, an agent's by its scope, `contribute` — stamped only its extras (the run's
     `principal` and the `viewer`), never an actor of the family's (`readpages`). */
  publicread:  Object.freeze({ spec: { classes: null, mutating: false }, needs: null, public: true, stamped: false }),
  runact:      Object.freeze({ spec: { classes: MEMBER_PROBE, mutating: true }, needs: "contribute", stamped: false }),
  /* T41 (R43; run-productions R23): a session's act of record whose owner reads the caller as the run's `principal`
     beside the `viewer`, never a `by` (`bearingnote`): a session's only, `contribute`, stamped only its extras. */
  sessionrunact: Object.freeze({ spec: { classes: SESSION_KINDS, machineClasses: [], mutating: true }, needs: "contribute",
                                 stamped: false }),
});
const QUERY = (key) => Object.freeze({ key, at: "query" });
const BODY = (key) => Object.freeze({ key, at: "body" });
/* One family: `ops` maps each op to its kind; the lists are derived from it so they cannot disagree. */
/* `extra` names, per op, the stamps beyond these the owner reads (credentials' account ops read the session's own
   `member`, and the ask grant's mint the `session` itself, R22–R27; answers' `ask` the asking `member`). */
const family = ({ owner, cite, actor = null, proposer = null, extra = {}, ops }) => {
  const of = (pred) => frozenList(Object.keys(ops).filter((op) => pred(ops[op])));
  for (const [op, k] of Object.entries(ops)) if (!Object.hasOwn(OP_KINDS, k)) throw new TypeError(`op-declarations: ${op}: no kind ${k}`);
  for (const op of Object.keys(extra)) if (!Object.hasOwn(ops, op)) throw new TypeError(`op-declarations: ${op}: an extra stamp on no op`);
  return Object.freeze({ owner, cite, actor, proposer, kinds: Object.freeze({ ...ops }),
    extra: Object.freeze(Object.fromEntries(Object.entries(extra).map(([op, k]) => [op, frozenList([...k])]))),
    acts: of((k) => OP_KINDS[k].spec.mutating && k !== "proposal"), proposals: of((k) => k === "proposal"),
    reads: of((k) => !OP_KINDS[k].spec.mutating) });
};
const OP_FAMILIES = Object.freeze({
  /* events R36 (K1122): dated facts and events; `eventmerge`/`eventsplit` refuse a machine (MEMBER_ACT_ONLY, R14), the
     read opt-in is an administrator's (R4, K1505 (9)); the machine's following imports write as `class:daemon` (R22).
     T35 (R43–R46): a use of a power and an assessment recorded by a member (MEMBER_ACT_ONLY: the machine proposes), a
     use withdrawn with a reason (no machine refusal, as a relation's withdrawal), and the uses read. */
  events: family({ owner: "events", cite: "events R36, R43–R46", actor: QUERY("by"), ops: {
    datedfact: "open", editacts: "open", readoptin: "admin", eventcreate: "open", eventattest: "open", eventgovern: "open",
    participantadd: "open", participantcorrect: "open", eventmerge: "member", eventsplit: "member", eventrelate: "open",
    eventrelationwithdraw: "open", actalias: "open", eventimport: "open", registerimport: "open",
    event: "read", eventforact: "read", datedfacts: "read", eventsfor: "read", timeline: "read", sequence: "read",
    whowassent: "read", statementsof: "read", proceedingstatus: "read",
    discretionrecord: "member", assessmentrecord: "member", usewithdraw: "open", usesof: "read" } }),
  /* lines R16 (A ORG; R18 here): a line recorded, withdrawn or held current through by a member or, on a system rule's
     basis, the machine (MACHINE_NEEDS_IDENTIFIERS otherwise, R4, R21); `structureat` and `holderat` its one home. */
  lines: family({ owner: "lines", cite: "lines R16, R21; R18", actor: BODY("by"), ops: {
    linerecord: "open", linewithdraw: "open", linecurrentthrough: "open",
    line: "read", linesof: "read", structureat: "read", holderat: "read", partiesof: "read", proceedinglinks: "read" } }),
  /* money R18 (K1573): a fact recorded by a member or a member-bound machine method (R3, R4); a set's inclusion and
     exclusion a member's (MEMBER_ACT_ONLY, R12); its proposal any credential's (R13). */
  money: family({ owner: "money", cite: "money R18", actor: BODY("by"), proposer: BODY("by"), ops: {
    moneyrecord: "open", moneywithdraw: "open", moneysetcreate: "open", moneysetinclude: "member",
    moneysetexclude: "member", moneysetpropose: "proposal", moneyfundtype: "open",
    money: "read", moneyof: "read", moneysummable: "read", moneyreconcile: "read", moneyset: "read",
    committedagainstpaid: "read", authoritychain: "read" } }),
  /* money-checks R11 (K1566): parameters and detectors a member's (MEMBER_ACT_ONLY, R3–R5), the display gate an
     administrator's (R8); the run itself is the scheduler's (R6), declared apart below. */
  "money-checks": family({ owner: "money-checks", cite: "money-checks R11", actor: BODY("by"), ops: {
    moneycheckparam: "member", moneydetectordefine: "member", moneydetectorswitch: "member", moneydetectorgate: "admin",
    moneyamountchecks: "read", moneyjunction: "read", moneycheckparams: "read", moneydetectors: "read",
    moneynoticed: "read" } }),
  /* duties R19: a duty proposed by any credential (R1, R5), adopted, declared, revised, withdrawn, matched and
     transitioned by a member (MEMBER_ACT_ONLY, R2–R14). T35 (R27, R28): a use linked to a power and unlinked by a member
     (DUTY_MEMBER_ACT_ONLY), a policy's review proposed by any credential (R2's `propose`), and a power's uses read. */
  duties: family({ owner: "duties", cite: "duties R19, R27, R28", actor: QUERY("by"), proposer: QUERY("by"), ops: {
    dutypropose: "proposal", dutyadopt: "member", dutydeclare: "member", dutyrevise: "member", dutywithdraw: "member",
    dutymatch: "member", dutytransition: "member",
    duty: "read", dutiesof: "read", dutyoccurrences: "read", dutytransitions: "read", powersof: "read",
    dutysetagainst: "read",
    uselink: "member", useunlink: "member", reviewpropose: "proposal", poweruses: "read" } }),
  /* people R27: identity claims and person facts by a member or, within R3 and R10, the machine; a member's own tie
     (R20) and a source's person link a member's (MEMBER_ACT_ONLY, R21); expunging and the check gate an
     administrator's (R12, R24); `samepersoncandidates` published since M-P6 passed (R8, K1592). */
  people: family({ owner: "people", cite: "people R27", actor: BODY("by"), ops: {
    identityclaim: "open", identitywithdraw: "open", personfact: "open", personfactwithdraw: "open",
    personexpunge: "admin", membertie: "own", membertiewithdraw: "own", sourcepersonlink: "member",
    interestcheckdefine: "open", interestcheckswitch: "open", interestcheckgate: "admin",
    identity: "read", samepersoncandidates: "read", person: "read", career: "read", personcredentials: "read",
    personinterests: "read", personstatements: "read", staffing: "read", memberties: "read", sourcepersonlinks: "read",
    interestchecks: "read" } }),
  /* explore R14 (K1566): reads only, the viewer stamped; it writes nothing and logs no one's exploring (R9). */
  explore: family({ owner: "explore", cite: "explore R14", ops: {
    explore: "read", explorepreset: "read", exploreverify: "read", exploretimeline: "read" } }),
  /* hypotheses R7: a hypothesis held, revised and withdrawn by a member (MACHINE_CANNOT_HYPOTHESISE, R1, R2, K1473);
     since T34 (K1807; its R11–R13) a member's own note written and turned, the body's `by` its author, and the notes
     read, the viewer stamped; since T35 (R30; DEC-144) a member's own note revised and deleted, `notewrite`'s posture. */
  /* T41 (R43; its R17–R21; K2486): a proposal taken up or set aside with a reason, and a note shared to a project
     and the share withdrawn, a member's (MACHINE_CANNOT_HYPOTHESISE, MACHINE_CANNOT_NOTE), the body's `by`; a project's
     shares a session's read. */
  hypotheses: family({ owner: "hypotheses", cite: "hypotheses R7, R11–R13, R17–R21; K1807; R30, R43", actor: BODY("by"), ops: {
    hypothesishold: "member", hypothesisrevise: "member", hypothesiswithdraw: "member", hypotheses: "read",
    notewrite: "member", noteturn: "member", notes: "read", noterevise: "member", notedelete: "member",
    hypothesistakeup: "member", hypothesissetaside: "member", noteshare: "member", noteunshare: "member",
    shares: "ownread" } }),
  /* calculations R24 (C:A-16): its actor is the stamped viewer. Declaring a table, adopting a binding, ingesting money,
     accepting a calculation, recording a set and switching a pattern refuse a machine (MEMBER_ACT_ONLY, R2, R8, R14,
     R21, R23); a calculation and a recorded draw any author's (R4, R18); the pattern gate an administrator's (R23).
     T35 (R32, R33): freezing the held uses a member's (MEMBER_ACT_ONLY), the recipes of application a read. T36 (R31;
     its R38, R39): a spot-check's visit a member's (MEMBER_ACT_ONLY), `by` stamped as R31 names it beside the viewer
     calculations reads as its actor; the spot-check's data a read. */
  calculations: family({ owner: "calculations", cite: "calculations R24, R32, R33, R38, R39; R31", actor: QUERY("viewer"),
    extra: { spotcheckvisit: ["by"] }, ops: {
    tabledeclare: "member", bindingadopt: "member", moneyingest: "member", calculationcreate: "open",
    calculationaccept: "member", calculationdraw: "open", recordset: "member", patterngate: "admin",
    patternswitch: "member",
    table: "read", tablesat: "read", calculationevaluate: "read", calculation: "read", patterns: "read",
    usesfreeze: "member", applicationrecipes: "read",
    spotcheckvisit: "member", spotcheck: "read" } }),
  /* workbooks R15 (K1570): every act a sighted author's, a machine not refused by name (R13); the second check
     refuses only its own author (SELF_CHECK, R11). */
  workbooks: family({ owner: "workbooks", cite: "workbooks R15; K1570", actor: BODY("by"), ops: {
    workbookadd: "open", workbookbind: "open", workbookunbind: "open", workbookrecompute: "open",
    workbooklintexplain: "open", workbookmethodnote: "open", workbooksecondcheck: "open",
    workbook: "read", workbookinputs: "read", workbooklint: "read", workbookexport: "read" } }),
  /* answers (K1609; R20 here): its actor is the stamped viewer. `rule` is the ask's read door (R7); `answercheck`
     counts the check in no one's name (R13); the tallies and the two switches an administrator's (R13, R19, K1603);
     a standing question the member's own (MACHINE_CANNOT_AUTHOR, R15, R16, R20); `ask` (Q0-10, Q1-6) a member's own
     session, reaching only their own account reference (credentials R24). */
  answers: family({ owner: "answers", cite: "answers; K1609; R20", actor: QUERY("viewer"), extra: { ask: ["member"] }, ops: {
    ask: "own", answercheck: "tally", ruleservicesswitch: "admin", standingset: "own", standingend: "own",
    standingaiswitch: "admin",
    rule: "read", asktallies: "ownread", standing: "ownread", standinganswers: "ownread" } }),
  /* following: every follow a member's own (MACHINE_CANNOT_FOLLOW, R1, R7–R10; MEMBER_ACT_ONLY, R8); it reads the
     query's `by` as its `author`. */
  following: family({ owner: "following", cite: "following R1–R14", actor: QUERY("by"), ops: {
    followbody: "member", unfollow: "member", followregister: "member", followpersonquery: "member",
    followportal: "member", permeetingbody: "member", refreshregister: "member",
    follows: "read", snapshots: "read", snapshotdiff: "read" } }),
  /* T33's ops in earlier modules (R17, R18; the START's findings). standards (K1571): relating, linking and treating a
     member's (MACHINE_CANNOT_RELATE, R23, R26, R27, R30), proposing any credential's; `inforceat` is R18's in-force
     read beside `standardinforce` (R7's alias). T35 (T35-31; its R35, R37, R40, R43): a provision's force declared or
     confirmed, withdrawn, a standard released from its bundle's sight, an adoption, an imposition and a benchmark
     recorded, each a member's (MACHINE_CANNOT_DECLARE_STANDARD, MACHINE_CANNOT_RELATE), `author` the body's; a force
     proposed by any credential; the forces, overrides, edition in force and whether it binds, reads. T36 (R31; its
     R50): a version known in force through a date recorded and withdrawn by a member (MACHINE_CANNOT_DECLARE_STANDARD),
     and the records read. */
  standards: family({ owner: "standards", cite: "standards R20–R30, R35, R37, R40, R43, R50; K1571; R18, R31", actor: BODY("author"),
    proposer: BODY("proposer"), ops: {
    lawrelate: "member", lawwithdraw: "member", lawpropose: "proposal", courtlink: "member", courttreat: "member",
    inforceat: "read", standardsfor: "read", lawrelations: "read", lawaddresses: "read", stillstanding: "read",
    citationresolve: "read",
    standardforce: "member", standardforcewithdraw: "member", standardrelease: "member", standardadoption: "member",
    standardimpose: "member", standardbenchmark: "member", standardforcepropose: "proposal",
    forcesof: "read", overridesof: "read", editioninforce: "read", bindsat: "read",
    standardinforcethrough: "member", standardinforcethroughwithdraw: "member", inforcethroughof: "read" } }),
  /* credentials (K1544; R20): the member's own account reference, its switches and the ask grant, set by the member
     alone (MACHINE_CANNOT_HOLD_ACCOUNT, NOT_YOUR_ACCOUNT, R22–R27), never an administrator for another member;
     `aigrantmint` also reads the session's own `member` and `session` (R27); the keyed services an administrator's
     (R29). No spec admits a project-level Claude credential or a group subscription: neither exists (K1502, K1755);
     the group's API key is reached only through R24's acts below. T35 (R30; its R39, R43, R45–R47; F14, N703, K1888):
     a session's own end and every session of its role, the session token the control plane authenticated the one
     stamp; the security map, an administrator's read with `by`; recovery codes issued and their state, an
     administrator's own (NOT_AN_ADMIN), `by` stamped; `recover` reached with no credential, as `login` is, its role,
     code and password the body's and `source` and `country` the control plane's (admission R21); and a member's own
     subscription disconnected (R43). T36 (R33; its R51, R52; DEC-172): keeping
     the group's material away from every assistant, an administrator's own act (NOT_AN_ADMIN), `on` and `reason` the
     body's; its state answered to every active member, stamped nothing. `securitycount` (its R50) is a store-internal
     route and declared nowhere (R6). T37 (R36, R39; N708, N776; DEC-156, DEC-182 (4)): a member's own sign-in to their
     Claude subscription, `by` the stamped member and `step` and `code` the body's only, its handler the control
     plane's route to the member's own runner (`agent-worker` R66; the fact is credentials R43's); and the caller's
     change of their own password (its R3), `by`, the presenting `session`, and `source` and `country` stamped (as
     `signout`'s and `login`'s), `current` and `password` the body's only, no role named (the session's).
     T41 (R41; its R54, R55, R57, R58, R60, R61; N812, DEC-188; K2373, K2435): a project's account — an API key or one
     owner's sign-in, set, removed and switched, and kept away from every assistant — an owner's own act (credentials
     answers anyone else PROJECT_ACT_NOT_THE_OWNER), its key the body's only; the notice marked seen by the member's own
     `by`; the one switch act `accountusesset` (`owner` group, project or member: an administrator's, an owner's or the
     member's own, each answered by credentials); and the state, notice, uses and history reads, the viewer stamped.
     DEC-188 (8): `accountswitchset` and `groupswitchset` are retired to `accountusesset` and have no spec. */
  credentials: family({ owner: "credentials", cite: "credentials R3, R22–R29, R39, R43, R45–R47, R51, R52, R54, R55, R57, R58, R60, R61; K1544; R20, R30, R33, R36, R39, R41", actor: QUERY("by"),
    extra: { accountreferenceset: ["member"], accountreferenceremove: ["member"],
             accountreference: ["member"], aigrantmint: ["member", "session"],
             signout: ["session"], signouteverywhere: ["session"], securitymap: ["by"], recoverycodesstate: ["by"],
             recover: ["source", "country"], setpassword: ["session", "source", "country"] }, ops: {
    accountreferenceset: "own", accountreferenceremove: "own", aigrantmint: "own",
    keyedserviceset: "admin", keyedserviceswitch: "admin",
    accountreference: "ownread", keyedservices: "read",
    /* T34 (R24; credentials R33, R34, R36, R37; K1755, K1764): the group's API key, set, removed, switched and its
       switches set by an administrator's own session (NOT_AN_ADMIN); its state a session's read; the notice a member's
       own, read by the viewer and marked seen by the session's own `by`. None is on `AI_GRANT_OPS`. */
    groupkeyset: "admin", groupkeyremove: "admin", groupkeyswitch: "admin",
    groupkeystate: "ownread", groupkeynotice: "ownread", groupkeynoticeseen: "own",
    signout: "sessionend", signouteverywhere: "sessionend", securitymap: "ownread", recoverycodesissue: "admin",
    recoverycodesstate: "ownread", recover: "door", subscriptiondisconnect: "own",
    aikeepaway: "admin", aikeepawaystate: "settingread",
    subscriptionsignin: "own", setpassword: "own",
    projectkeyset: "own", projectsigninset: "own", projectaccountremove: "own", projectaccountswitch: "own",
    projectaccountstate: "ownread", projectkeynotice: "ownread", projectkeynoticeseen: "own", projectaikeepaway: "own",
    projectaikeepawaystate: "ownread", accountusesset: "own", accountuses: "ownread", accounthistory: "ownread" } }),
  /* sources (K1550): marking a capture as from a keyed service, its capturer's own act (MACHINE_CANNOT_MARK, R16, R18). */
  sources: family({ owner: "sources", cite: "sources R16, R18; K1550", actor: QUERY("by"), ops: { sourcekeyed: "member" } }),
  /* entities (K1572; R18): a scheme identifier, `resolutiondefect`'s stamp; a machine on a system rule's basis (R43).
     T35 (R30; its R51, N699): the registry's entities of a kind, the offices among them, a read. */
  entities: family({ owner: "entities", cite: "entities R43, R51; K1572; R18, R30", actor: BODY("by"), ops: {
    entityidentify: "open", entitieskind: "read" } }),
  /* ai-runs (K1601, K1610, K1612; R20): a run's verification refused to a machine (AI_RUN_VERIFICATION_UNFIT, run-rules
     R19). T41 (R41; K2514): the ceilings are retired to ai-use's `ailimitset` and the usage read is ai-use's `aiusage`.
     T41 (R43; its R74, R75; K2514, K2569): a run opened over the steps a member may see (`stepsrunai`, `openMany`, the
     run's open: `contribute`, the run's `principal` beside the actor), the group's test of a part set by an active
     member (AI_GROUP_TEST_INVALID otherwise) and its results read — no map of ai-runs serves the three; the door's own
     does (control-plane R71). */
  "ai-runs": family({ owner: "ai-runs", cite: "ai-runs R74, R75; run-rules R19; K1601, K1612, K2514; R20, R41, R43", actor: QUERY("by"),
    extra: { stepsrunai: ["principal"] }, ops: {
    airunverify: "member", stepsrunai: "member", grouptestset: "member", grouptestresults: "ownread" } }),
  /* T41 (R41, R43; ai-use R2, R4, R9–R12; N812, DEC-188; K2373, K2570): a limit set on an account and an explore
     approved, each its owner's own act (ai-use answers NOT_YOUR_CEILING, an owner's refusal or NOT_AN_ADMIN); the limits,
     the usage (with `owner` an owner's figure, without it the member's own), the estimate and the actual cost, reads
     answered by the viewer's sight. `aiestimate` and `aiactual` have no arm in ai-use's map: the door's own serves them
     (control-plane R71). */
  "ai-use": family({ owner: "ai-use", cite: "ai-use R2, R4, R9–R12; R41, R43; K2373, K2570", actor: QUERY("by"), ops: {
    ailimitset: "own", exploreapprove: "own", ailimits: "ownread", aiusage: "ownread", aiestimate: "ownread",
    aiactual: "ownread" } }),
  /* inquiry (K1604): a member's look at their own dated wait (MACHINE_CANNOT_LOOK, R56), `author` from the query. */
  /* T41 (R43; its R55; K2498): what a question waits on, a session's read. */
  inquiry: family({ owner: "inquiry", cite: "inquiry R55, R56; K1604; R43", actor: QUERY("author"), ops: { waitlook: "member",
    questionwaits: "ownread" } }),
  /* corpus-export (K1640): the render a member's, by their stamped viewer (R10), writing one export-log row in no
     working capability's name; `exportpage` takes `export`'s credential and is declared apart below. */
  "corpus-export": family({ owner: "corpus-export", cite: "corpus-export R10; K1640", ops: { exportrender: "own" } }),
  /* actions (K1657; R17): the addressee suggestion, a read for every signed-in class (R62); the `proceeding` filter of
     `op=actions` (R65) is a parameter of an op already declared. */
  /* T41 (R43; actions R73; K2561): what a records request seeks, proposed by any credential as `actionlawspropose` is,
     its `proposer` the caller's (actions reads it from the query), `target` and `seeks` the body's. */
  actions: family({ owner: "actions", cite: "actions R62, R73; K1657, K2561; R17, R43", proposer: QUERY("proposer"), ops: {
    addresseesuggest: "read", actionseekspropose: "proposal" } }),
  /* action-clocks (K1658; R17): adopting a proposed clock a member's (MACHINE_CANNOT_ADOPT_CLOCK, R13), `author` from
     the query; `clockpropose` any credential's, `actionlawspropose`'s posture (R2); the two reads (R14, R15). */
  "action-clocks": family({ owner: "action-clocks", cite: "action-clocks R2, R13–R15; K1658; R17", actor: QUERY("author"),
    proposer: QUERY("proposer"), ops: {
    clockadopt: "member", clockpropose: "proposal", clocksics: "read", clocklateness: "read" } }),
  /* capture-requests (K1601): marking a host a platform and lifting the mark, a member's act on the group's drain
     (R46), its actor the stamped viewer; the marks a read. T35 (its R51–R53): the group's records request for a policy
     held by citation, opened and its answer recorded by a member (MACHINE_CANNOT_REQUEST_RECORDS), its `by` read from
     the control plane's `principal` stamp; the requests a read. */
  "capture-requests": family({ owner: "capture-requests", cite: "capture-requests R46, R51–R53; K1601", actor: QUERY("viewer"),
    extra: { recordsrequestopen: ["principal"], recordsrequestanswer: ["principal"] }, ops: {
    capturerequestplatformmark: "member", capturerequestplatformunmark: "member", capturerequestplatformhosts: "read",
    recordsrequestopen: "member", recordsrequestanswer: "member", recordsrequests: "read" } }),
  /* instance-setup (R17; K1683, its op names): seeding the offices and the seats and setting the assistant, an
     administrator's own session (R50, R52, R53); the disclosure shown, a member's own record (R54); the assistant's
     state a read, and a member's disclosure their own read. T34: the unheld place, an administrator's act and read
     (R26; its R60, NOT_AN_ADMIN); the member's screen language, their own act (`machineClasses: []`) and the read
     (R28; its R64); the group's description drafted for its administrator, a session's labelled draft writing nothing,
     `by` and `viewer` stamped (R29; its R65, DEC-152; K1837). T35 (R30; its R66, K1888): the second-administrator
     step, a session's read answered to an administrator (NOT_AN_ADMIN otherwise). T36 (R17; DEC-172): `assistantset` is
     retired with its owner's act (the assistant's state is derived from credentials' keep-away) and has no spec.
     T37 (R35, R37; its R67, R69–R74; N669, DEC-127 (5), DEC-157; K2200, K2201): the interface's translation, each a
     session's only with no working capability (the owner's grant gates it, R69): the assistant's draft asked
     (`translationdraft`, writing labelled drafts or, read back into English, its fact), a speaker granted and revoked
     and a word's latest change undone (an administrator's, NOT_AN_ADMIN), a word kept, confirmed and marked wrong (a
     granted speaker's or, the mark, any member's), `by` from the query, every other field the body's; the
     workspace and the words a member reads, the viewer stamped. `translationdraftrecord` (its R67's record route) is
     a store-internal route and declared nowhere (R6). */
  "instance-setup": family({ owner: "instance-setup", cite: "instance-setup R50, R52–R54, R60, R64–R67, R69–R74; R17, R26, R28–R30, R35, R37; K1683",
    actor: QUERY("by"), extra: { groupdescriptiondraft: ["by"] }, ops: {
    officesseed: "admin", seatsseed: "admin", disclosureshown: "own",
    assistantstate: "read", disclosureof: "ownread",
    placewanted: "admin", placewantedstate: "ownread", memberlanguageset: "sessionact", memberlanguage: "read",
    groupdescriptiondraft: "ownread", adminrecoverystep: "ownread",
    translationdraft: "own", translationgrant: "admin", translationadopt: "own", translationconfirm: "own",
    translationrevert: "admin", translationmark: "own", translations: "ownread", interfacewords: "ownread" } }),
  /* T34 (R22; membership R98–R110, DEC-133, DEC-134, DEC-136; K1749): the group's settings. The administrator's acts
     take `hostingaccessset`'s spec (`roster`; NOT_AN_ADMIN is membership's own answer, a bearer's included), `by`
     from the query; the website's and the join page's doors are public, stamped nothing, the key or link read from the
     body (admission R17); the court notice a plain read, stamped nothing; the description a public read, `viewer`
     set so a member reads the whole record. `checkaddressees` is a store-internal route and declared nowhere (R6). */
  /* T41 (R42; its R123, R124; N797, N799; DEC-184, DEC-186; K2574): whether a handle is free, a public read with a
     present null row, `invite` and `handle` the body's and `viewer` set as admission R16 reads who asks; a member's own
     handle changed, their own act (HANDLE_CHANGE_NOT_A_MEMBER otherwise), `by` from the query, `handle` the body's. */
  membership: family({ owner: "membership", cite: "membership R98–R110, R123, R124; R22, R42; K1749, K2574", actor: QUERY("by"),
    extra: { groupdescription: ["viewer"], handlecheck: ["viewer"] }, ops: {
    handlecheck: "publicread", handlechange: "own",
    invitewithdraw: "roster", websitekeycreate: "roster", websitekeyset: "roster", websitekeyrevoke: "roster",
    joinlinkenable: "roster", joinlinkset: "roster", joinlinkreplace: "roster", joinlinkoff: "roster",
    courtnoticeset: "roster", groupdescriptionset: "roster",
    websiteinvite: "door", joinlinkinvite: "door", courtnotice: "plainread", groupdescription: "public" } }),
  /* T34 (R23; tasks R13–R16, DEC-135): asking for a check, taking it and recording it, a member's (MACHINE_CANNOT_CHECK),
     `by` from the query; the two reads, the viewer stamped, also a member session's only (K1873). */
  tasks: family({ owner: "tasks", cite: "tasks R13–R16; R23; K1873", actor: QUERY("by"), ops: {
    checkrequest: "member", checktake: "member", checkrecord: "member", checkrequests: "ownread", checksof: "ownread" } }),
  /* T34 (R25; publication R68, R69, DEC-147): moving and cancelling a set publish time, on the publication surface
     (`publish`), `by` from the query; the schedule a member session's read. `publishat` itself is `caseratify`'s
     ceremony, declared beside it in `OPS`. T41 (R25; N823, K2438): the three are `publish-schedule`'s (its R3, R4). */
  "publish-schedule": family({ owner: "publish-schedule", cite: "publish-schedule R3, R4; publication R68, R69; R25; K1784, K2438",
    actor: QUERY("by"), ops: {
    publishatmove: "publishact", publishatcancel: "publishact", publishschedule: "sessionread" } }),
  /* T34 (R15, R28, R29; wizard-scripts R23, R26, R27; DEC-129, DEC-153, DEC-158 (4)): the first steps from the home, a
     read; the copies whose base has a newer version, a member session's read; writing help, a session's labelled draft
     writing nothing, `by` and `viewer` stamped (K1837). wizard-scripts' T31 ops are declared in `OPS` below. */
  "wizard-scripts": family({ owner: "wizard-scripts", cite: "wizard-scripts R23, R26, R27; R15, R28, R29; K1818",
    actor: QUERY("by"), extra: { writinghelp: ["by"] }, ops: {
    startfrom: "read", baseupdates: "ownread", writinghelp: "ownread" } }),
  /* T35 (R30; acquisition R38–R43, served through `capture`'s map, its R73; N688, DEC-167, K1844, K1888, K1940): the
     archive opened and continued (the daemon drains `archive-unpack` as this op), `by` from the query beside the door's
     `cls` and `member`, any other caller answered UNPACK_NOT_PERMITTED; its entries read; the group's co-archive setting
     set by an administrator (`hostingaccessset`'s spec, NOT_AN_ADMIN), and read, stamped nothing. */
  acquisition: family({ owner: "acquisition", cite: "acquisition R38, R41, R43; capture R73; R30", actor: QUERY("by"), ops: {
    unpack: "daemonact", archivelist: "read", coarchiveset: "roster", coarchivestate: "settingread" } }),
  /* T35 (R30; retrieval R73, DEC-164, K1972): "Find in this", a read, the viewer and the selection's `owner` stamped
     (a selection scope is read under its owner, the viewer by default). */
  retrieval: family({ owner: "retrieval", cite: "retrieval R73; K1972; R30", extra: { findin: ["owner"] }, ops: {
    findin: "read" } }),
  /* T35 (R30; public-read R30, DEC-146): the credit page, the same bytes for every caller, stamped nothing. */
  "public-read": family({ owner: "public-read", cite: "public-read R30; R30", ops: { credit: "public" } }),
  /* T36 (R32; file-safety R2–R38, N714, N707, N710; DEC-169, DEC-173; K1892, K1929): a file's safety, `fileSafetyOps`.
     The reads by sight — its notes, its threat, what opening it would answer, its safe view and safe copy (byte
     answers), the findings — `read`, the viewer stamped; a finding's kind explained, the same for every caller, stamped
     nothing. Opening the original (with `override`, or with `warned`, the member's two confirmations, each a body
     field never kept), asking a deeper check and asking a safe copy: a member's act on a file they may see, `sightact`,
     the viewer alone stamped, so nothing names who opened or asked (file-safety R10). Releasing a scan hold an act of
     record, a member's (MACHINE_CANNOT_RELEASE_HOLD), `contribute`, `by` from the query, `reason` the body's. The
     security tools read and changed by an administrator's own session (NOT_AN_ADMIN), `securitytooladd`'s
     `credentials` and `config` the body's. None is on `AI_GRANT_OPS`: the assistant reads a file's text and `active`
     list only. The scheduler's four wakes are no member's and are declared in `OPS` apart, unattended by decision. */
  "file-safety": family({ owner: "file-safety", cite: "file-safety R2, R5, R6, R8, R9, R11, R13, R15, R17, R27–R31, R33, R38; R32",
    actor: QUERY("by"), extra: { openoriginal: ["viewer"], openwithwarning: ["viewer"], deepercheck: ["viewer"],
                                 safecopyrequest: ["viewer"] }, ops: {
    verdictnotes: "read", threatof: "read", originalstate: "read", safeview: "read", safecopy: "read",
    scanfindings: "read", findingkind: "settingread",
    openoriginal: "sightact", openwithwarning: "sightact", deepercheck: "sightact", safecopyrequest: "sightact",
    releasescanhold: "member",
    scanstatus: "ownread", securitytools: "ownread", securitytoolcatalogue: "ownread", securitytoolevents: "ownread",
    securitytooladd: "admin", securitytooltest: "admin", securitytoolremove: "admin" } }),
  /* T37 (R38; case-carriage R9, R10; N757, DEC-180; K2171, K2206): a photo's marks of who and what to obscure. Marking
     one an act of record, a member's (MACHINE_CANNOT_MARK_PHOTO, N790), `contribute`, `by` from the query, `captureSha`
     and `areas` the body's; the marks and the derived copy a session's read, the viewer stamped. T38 (R40; case-carriage
     R14; N788, DEC-183 (2); K2300): withdrawing a mark, by its maker or any member, with a reason, an act of record, a
     member's (MACHINE_CANNOT_WITHDRAW_MARK), `contribute`, `by` from the query, `captureSha`, `mark` and `reason` the
     body's. None is on `AI_GRANT_OPS`. */
  "case-carriage": family({ owner: "case-carriage", cite: "case-carriage R9, R10, R14; R38, R40", actor: QUERY("by"), ops: {
    obscuremark: "member", photomarks: "ownread", obscuremarkwithdraw: "member" } }),
  /* T41 (R45; capture R86; K2458, K2484): a file a member holds, uploaded — a member's act of record from their own
     session (capture answers MEMBER_SESSION_REQUIRED to any other), `contribute`, `by` from the session, the request's
     raw body the bytes. Not on `AI_GRANT_OPS`. */
  capture: family({ owner: "capture", cite: "capture R86; R45; K2458, K2484", actor: QUERY("by"), ops: {
    captureupload: "member" } }),
  /* T41 (R43; N820; steps R1–R24; K2405, K2418, K2570): the investigation's steps. Each act a member's, from a session
     only (R43; steps refuses a machine by name, STEP_MEMBER_ONLY, or holds it to its own steps), `contribute`, `by`
     stamped; a member's reminder on a step and the following of a question their own (`queuemute`'s reasoning, no
     working capability); every read a session's, the viewer stamped. steps exports no ops map: the door's own map calls
     each service by name (control-plane R71). */
  steps: family({ owner: "steps", cite: "steps R1, R4–R7, R9–R13, R15, R16, R24; R43; K2418, K2570", actor: QUERY("by"), ops: {
    stepcreate: "member", stepstart: "member", stepend: "member", stepdelete: "member", steprefer: "member",
    stepproduct: "member", stepwait: "member", stepwaitremove: "member", stepreminder: "own", stepcostadd: "member",
    stepcostremove: "member", costmessage: "member", questionfollow: "own", stepaccept: "member",
    stepoutcome: "member", steplearn: "member", stepbywhen: "member",
    stepslike: "ownread", steps: "ownread", stepproposals: "ownread", costmessages: "ownread",
    questionfollowstate: "ownread", stepproducts: "ownread", recordsteps: "ownread" } }),
  /* T41 (R43; question-explorer R6; K2570): a find accepted onto a question, a member's (EXPLORE_ACCEPT_INVALID to a
     machine), `contribute`; a find muted, the member's own; the doors a find opens, a session's read (null answered as
     absent). No map: control-plane R71. */
  "question-explorer": family({ owner: "question-explorer", cite: "question-explorer R6; R43; K2570", actor: QUERY("by"), ops: {
    findaccept: "member", findmute: "own", finddoors: "ownread" } }),
  /* T41 (R43; N820; investigation R1–R20; K2525, K2560): a project's milestones, reports, interview, claims, plan
     acceptance and close with gaps, each a joined member's act (INVESTIGATION_MEMBER_ONLY to a machine), `contribute`;
     a milestone's reminder (its `at` a body calendar day, never a stamp) and the watch on a quiet project the member's
     own; the draft report (it writes nothing) and the rest reads of a session, the viewer stamped. `planPropose` and
     `claimfindstep`'s machine arm are no session ops (N842). No map: control-plane R71. */
  investigation: family({ owner: "investigation", cite: "investigation R1–R3, R6, R7, R11–R15, R17–R20; R43; K2525, K2560",
    actor: QUERY("by"), ops: {
    milestoneset: "member", milestonerevise: "member", milestoneremove: "member", milestoneitemremove: "member",
    milestonereminder: "own", reportkeep: "member", interviewkeep: "member", narrativeclaim: "member",
    claimfindstep: "member", claimfound: "member", planaccept: "member", projectwatch: "own",
    projectclosewithgaps: "member",
    milestones: "ownread", reportdraft: "ownread", reports: "ownread", interview: "ownread", projectstanding: "ownread",
    claims: "ownread", investigationproposals: "ownread", quietstate: "ownread", interviewform: "ownread" } }),
  /* T41 (R43; reading-guides R2–R8, R12; K2584): a reading guide drafted, reviewed, offered, adopted, retired and
     proposed to Civicsmith's library, each a member's (GUIDE_MEMBER_ACT to a machine), `contribute`, the body's `by`; a
     machine's labelled draft (`guidepropose`) declared as `extractpropose` is (any credential, the run's `principal`),
     and its body's `by` stamped too, since reading-guides takes the proposer from the body (R12);
     the guides, a kind's guide, one guide and the drafts proposed, a session's reads. */
  "reading-guides": family({ owner: "reading-guides", cite: "reading-guides R2–R8, R12; R43; K2584", actor: BODY("by"),
    extra: { guidepropose: ["bodyBy", "viewer", "principal"] }, ops: {
    guidedraft: "member", guidereview: "member", guideoffer: "member", guideadopt: "member", guideretire: "member",
    guideproposetocivicsmith: "member", guidepropose: "runact",
    guides: "ownread", guidefor: "ownread", guide: "ownread", guideproposals: "ownread" } }),
  /* T41 (R43; run-productions R15, R22–R24; K2496): a proposal accepted (ACCEPT_NOT_A_MEMBER to a machine), `by`
     stamped, and a bearing note written from a session, the caller's `principal` and the `viewer` stamped (the owner
     reads no `by`), each `contribute`; the acceptance counts and the bearing notes, a session's reads; `readpages`, a run's read declared
     as `extractpropose` is (any credential, the run's `principal` and the `viewer`), mutating since it spends the
     run's `pages` bound. */
  "run-productions": family({ owner: "run-productions", cite: "run-productions R15, R22–R24; R43; K2496", actor: QUERY("by"),
    extra: { bearingnote: ["viewer", "principal"], readpages: ["viewer", "principal"] }, ops: {
    proposalaccept: "member", bearingnote: "sessionrunact", readpages: "runact",
    acceptancecounts: "ownread", bearingnotes: "ownread" } }),
  /* T41 (R43; leg-earning R14; K2569): the projects a question is shown on, a session's read. No arm in leg-earning's
     map: control-plane R71. */
  "leg-earning": family({ owner: "leg-earning", cite: "leg-earning R14; R43; K2569", ops: { projectsshownon: "ownread" } }),
  /* T41 (R43; case-authoring R64; K2569): an account of a case proposed for its authors, from a session only (R43),
     `contribute`, `by` stamped (the door hands it as the owner's `proposedBy`); the case's account drafts a session's
     read. No arm in case-authoring's map: control-plane R71. */
  "case-authoring": family({ owner: "case-authoring", cite: "case-authoring R64; R43; K2569", actor: QUERY("by"), ops: {
    accountpropose: "member", accountdrafts: "ownread" } }),
  /* T41 (R43; review R30, R31, R33; K2529): the group's approval rule, an administrator's own act (NOT_AN_ADMIN); a case
     edition approved by an approver (CASE_NOT_AN_APPROVER otherwise), `contribute`; the review comments (with an
     optional `draft`), a session's read. No arm in review's map: control-plane R71. */
  review: family({ owner: "review", cite: "review R30, R31, R33; R43; K2529", actor: QUERY("by"), ops: {
    approvalruleset: "admin", caseapprove: "member", reviewcomments: "ownread" } }),
});
const FAMILY_OPS = frozenList(Object.values(OP_FAMILIES).flatMap((f) => Object.keys(f.kinds)));
/* T34: a public kind's op is in no session set (every caller reaches it); every other family op is in both. */
const FAMILY_SESSION_OPS = frozenList(Object.values(OP_FAMILIES).flatMap((f) => Object.keys(f.kinds)
  .filter((op) => !OP_KINDS[f.kinds[op]].public)));
const FAMILY_SPECS = Object.fromEntries(Object.values(OP_FAMILIES).flatMap((f) => Object.entries(f.kinds).map(([op, k]) => {
  const s = OP_KINDS[k].spec;
  return [op, { classes: s.classes ? [...s.classes] : null, ...(s.machineClasses ? { machineClasses: [...s.machineClasses] } : {}),
                mutating: s.mutating }];
})));
/* a kind whose `needs` is undefined has no row (T34's unstamped kinds) */
const FAMILY_NEEDS = Object.fromEntries(Object.values(OP_FAMILIES).flatMap((f) => Object.entries(f.kinds)
  .filter(([, k]) => OP_KINDS[k].needs !== undefined).map(([op, k]) => [op, OP_KINDS[k].needs])));
/* K1601 (AGENT-WORKER #9 J1 (3), (4)): THE ASK'S PLANE OPS, which agent-worker's `/ask` calls under the member's `ai`
   grant and the control plane admits OUTSIDE the grant's read list (`AI_GRANT_OPS`), the grant's member stamped as the
   viewer: the ceiling read before any model call, the answer's check over the grant's read log, and the usage count
   per call. No spec names `ai` (R2): each admits a session's kinds and no bearer (`machineClasses: []`), so the grant
   is their only machine route; `askusage`, a write no session set holds, is recorded unattended below. */
const ASK_GRANT_OPS = frozenList(["askceiling", "askcheck", "askusage"]);
/* K1674, K1683 (CONTROL-PLANE #22 J1): THE STAMP INTERFACE. Every op this module declares for T33 maps to the stamp
   keys the door sets on it, from a closed set the control plane implements once each: `viewer` (the caller's sight),
   `by` (the actor in the query), `bodyBy` (the actor in the body, a caller's copy overwritten), `author` (the
   positional identity), `proposer` (the label), `member` (the session's own member) and `session` (the session token,
   into the store request only); since T35 (R30) `owner` (a selection's owner, `select`'s expression), `principal` (the
   caller's principal, `capturerequestretry`'s expression), and `source` and `country` (the caller's keyed fingerprint
   and Cloudflare's country label, admission R21, never the address). Read from `OP_FAMILIES` — `viewer` on every op, the actor's key on each act, the
   proposer's on each proposal, and the family's extras — so the families stay the one append site. A family whose
   actor IS the viewer (calculations, answers, capture-requests' marks) needs no second key. The ask's three plane
   ops carry the grant's member as `viewer` (K1601); `exportpage` and `moneydetectorsrun` are stamped nothing. T35
   (R30): `claim` and `login` keep their specs and are stamped `source` and `country` (admission R21), as `recover` is;
   `agentpack` is stamped `viewer`, as the untargeted `affordances` it is served apart from. */
const stampKey = (st) => (!st || st.key === "viewer" ? null : st.key === "by" ? (st.at === "body" ? "bodyBy" : "by") : st.key);
const OP_STAMPS = Object.freeze(aliasRows(Object.fromEntries([
  ...Object.values(OP_FAMILIES).flatMap((f) => Object.keys(f.kinds).map((op) => {
    if (OP_KINDS[f.kinds[op]].stamped === false) return [op, frozenList([...(f.extra[op] ?? [])])];
    const who = f.acts.includes(op) ? stampKey(f.actor) : f.proposals.includes(op) ? stampKey(f.proposer) : null;
    return [op, frozenList([...new Set(["viewer", ...(who ? [who] : []), ...(f.extra[op] ?? [])])])];
  })),
  ...ASK_GRANT_OPS.map((op) => [op, frozenList(["viewer"])]),
  ["exportpage", frozenList([])], ["moneydetectorsrun", frozenList([])],
  ["claim", frozenList(["source", "country"])], ["login", frozenList(["source", "country"])],
  ["agentpack", frozenList(["viewer"])],
])));

/* BIO plane, control plane entry.
 *
 * Secret discipline, which is a design constraint rather than a convention:
 *
 *   1. No module reads a credential at import time. Every secret arrives as a
 *      binding on env, so the whole tree loads and the module tests run with
 *      no secrets present at all. That is what makes them credential-free by
 *      construction rather than by accident.
 *   2. R2 credentials never leave the Worker. The Worker holds the bucket as a
 *      BINDING, not as an access key, so there is no key to leak, rotate, or
 *      hand to anyone. Nothing outside Cloudflare ever signs an R2 request.
 *   3. Callers present a token whose CLASS bounds what it can do. A probe-class
 *      token can read and can touch only the scratch namespace. If it leaks it
 *      buys nothing.
 *
 * Token classes, extending the accelerator's tokenClass_ rather than replacing
 * it:
 *   admin   every op, including promotion against the live store
 *   member  read, lease, allocid, promote within the member's group
 *   probe   read-only ops, plus writes confined to the scratch namespace
 *   daemon  the UNATTENDED PATH, and nothing else: op=monitor and the archive
 *           arm of op=acquire, against the LIVE store. Not scratch-confined,
 *           because what it does is write the real record's reachability. See
 *           `classify()` for DEC-37's reasoning and why it is named for the
 *           path rather than for either of its two consumers.
 *
 * There is deliberately no public class. A credential handed to the public is
 * not a credential: to be public it must be widely distributed, and once
 * distributed it bounds nothing. It bought two ops and cost one real defect,
 * because the class existing invited op=index onto its list while op=index reads
 * the working corpus (D-30). The public surface is protected STRUCTURALLY
 * instead, by the classes:null ops below, each of which enforces its own gate
 * and answers only from the published projection. Safety comes from WHERE an op
 * reads, not from who holds a token.
 */

const OPS = frozenTable(aliasRows({
  //  op          class allowed              mutating
  selftest:   { classes: ["admin", "member", "probe"],           mutating: false },
  livefire:   { classes: ["admin", "probe"],                     mutating: true  },
  /* Working corpus (`bundles`): a title names what the group is looking into, so never public; the public list is
     `publishedlist` (D-30). */
  index:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* S-10 step 1: the metadata projection retrieval filters on; working corpus, op=index's fence. */
  projection: { classes: ["admin", "member", "probe"],           mutating: false },
  reproject:  { classes: ["admin", "probe"],                     mutating: true  },

  /* Section 7 participation (REC-138): `by` and `viewer` are stamped; a machine class reaches them and matches no
     roster row, so the store refuses it (fail closed). */
  projectinvite:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectjoin:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectleave:        { classes: ["admin", "member", "probe"], mutating: true  },
  projectremove:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectowneradd:     { classes: ["admin", "member", "probe"], mutating: true  },
  projectownerremove:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectfork:         { classes: ["admin", "member", "probe"], mutating: true  },
  /* 7.13: the one administrator authority over a project, only when every owner is inactive; the store enforces both
     halves. The roster read beside it. */
  projectownerrescue:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectparticipants: { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-149 (§7.14): DISCOVERABLE or HIDDEN, an owner's act (C-70.2); its read to whoever sees the project; the
     directory for a member session (C-70.4). */
  projectvisibilityset: { classes: ["admin", "member", "probe"], mutating: true  },
  projectvisibility:    { classes: ["admin", "member", "probe"], mutating: false },
  projectdirectory:     { classes: ["admin", "member", "probe"], mutating: false },
  /* N321 (publication R44): the project's stage and readiness, derived at the read; viewer-stamped, the roster read's
     classes. */
  projectstage:         { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-150 (§7.14): asking and withdrawing are a member session's acts (C-95.1), answering an owner's (C-95.5); the
     read to owners, administrators and the asker. */
  projectrequest:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestwithdraw: { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestanswer:   { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequests:        { classes: ["admin", "member", "probe"], mutating: false },
  /* The 7.10 arithmetic, computed rather than transcribed, so an interface can say what a change would take
     (`adminarith` is §4.7's). */
  projectownerarith:   { classes: ["admin", "member", "probe"], mutating: false },
  /* Section 1.3: a member declares their own expertise and an administrator confirms, both stamped; it gates nothing. */
  expertisedeclare:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiseconfirm:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiselist:       { classes: ["admin", "member", "probe"], mutating: false },
  /* D-98's task inbox has no `taskenqueue` route: the capture path is the producer, `taskdrain` the sole writer,
     `actor` stamped. D-104: `sourcereach` shows why a document is or is not archive-eligible. */
  sourcereach:         { classes: ["admin", "member", "probe"], mutating: false },
  /* The archive fallback's decision half, a read: asks the Archive and applies the rules; capturing is op=acquire with
     via=archive.org. */
  archivelookup:       { classes: ["admin", "member", "probe"], mutating: false },
  tasks:               { classes: ["admin", "member", "probe"], mutating: false },
  taskdrain:           { classes: ["admin", "member", "probe"], mutating: true  },
  /* REC-28 / D-151: no probe on a person's two task verbs; a member binding reaches them and the store refuses a
     machine actor by shape (MACHINE_CANNOT_FORWARD/RESOLVE). */
  taskforward:         { classes: ["admin", "member"],          mutating: true  },
  taskresolve:         { classes: ["admin", "member"],          mutating: true  },
  /* Section 8.1: the ADMIN_TOKEN credential only, never a session (refused at the gate); mutating because it writes
     the export log. */
  export:              { classes: ["admin"],                    mutating: true  },
  /* Read by administrators who cannot export, so they see that one happened. */
  exportlog:           { classes: ["admin", "member", "probe"], mutating: false },
  /* D-436 / REC-163: the producing group's slug is public (Publication §7 point 1); a credentialed caller gets the
     whole row. RECORDING THE INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN CREDENTIAL HELD
     IN THE HOSTING ACCOUNT, THE CREDENTIAL THE INSTALLER'S OWN CLAIM IS ARMED BY — AND NO SESSION OF ANY ROLE REACHES
     IT. */
  instancegroup:       { classes: null,                         mutating: false },
  instancegroupseed:   { classes: ["admin"],                    mutating: true  },
  /* REC-164 (Publication §7 points 2–3): the identity read is public; the two sets are an administrator's session act,
     bearers refused by name (C-64.4). */
  groupidentity:       { classes: null,                         mutating: false },
  groupnameset:        { classes: ["admin", "member", "probe"], mutating: true  },
  groupdomainset:      { classes: ["admin", "member", "probe"], mutating: true  },
  /* Section 8.2: published-record reconstruction needs nothing; it reads the published projection only, as op=verify
     does. */
  publishedmanifest:   { classes: null,                         mutating: false },
  /* What the caller may do, so an interface builds its controls from the plane (section 5's absence). */
  whoami:              { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-19 / DEC-8: what may be done to an object, published by the plane; working corpus, member and above,
     viewer-stamped. */
  affordances:         { classes: ["admin", "member", "probe"], mutating: false },
  /* T35 (R30; N695; control-plane R41): the agent's pack and fences served apart from the untargeted `affordances`,
     with its spec, its session sets (none: a read) and its NEEDS row (none), so a member's agent credential reaches it
     by its scope as it reaches `op=affordances`; `viewer` stamped (`OP_STAMPS`). */
  agentpack:           { classes: ["admin", "member", "probe"], mutating: false },
  /* S-10: the retrieval surface reads the working corpus, never public; `viewer` is stamped (D-15). */
  search:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-9 / D-222: op=search's compiler at meaning grain, fenced as op=search and viewer-stamped. */
  meaningrows: { classes: ["admin", "member", "probe"],          mutating: false },
  /* The query language's vocabulary, so a UI builds controls from the plane; working-corpus field names. */
  searchfields:{ classes: ["admin", "member", "probe"],          mutating: false },
  /* The verifier that the text index cannot diverge from the corpus; a read. */
  searchindexcheck: { classes: ["admin", "member", "probe"],     mutating: false },
  /* S-10 step 5: a server-side selection, the set an action lands on; `select` writes a snapshot, nothing about the
     corpus. */
  select:          { classes: ["admin", "member", "probe"],      mutating: true  },
  selection:       { classes: ["admin", "member", "probe"],      mutating: false },
  selectionlist:   { classes: ["admin", "member", "probe"],      mutating: false },
  selectionrelease:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* Citing Information in a Project (weight `report`): promotes the Project with the new edges (D-21). */
  cite:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11: bulk disposition of Problems, weight `refuse`, contribute-gated. */
  dispose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11: bulk retirement, heavier than dispose (`retired` is terminal); refuses anything a live `cites` edge points
     at (C-6.2). */
  retire:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11: collected-to-verified is a named member's decision (C-18.1); a machine reaches it and the store refuses the
     stamp (MACHINE_CANNOT_RELEASE). */
  release:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-13: concluding is a member's; a machine reaches it and is refused by the store (MACHINE_CANNOT_CONCLUDE); one
     target, never a bulk act. */
  conclude:        { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-136: a project withdraws its conclusion, appending to its history; conclude's cut and refusal. */
  withdrawconclusion: { classes: ["admin", "member", "probe"],   mutating: true  },
  /* REC-31: reopening overturns the group's own disposition; conclude's cut, MACHINE_CANNOT_REOPEN, one target. */
  reopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-16: dividing a question is a member's judgement; conclude's cut, MACHINE_CANNOT_DIVIDE; the children in the
     POST body. */
  inquirydivide:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-45 (DEC-32): authoring the grounds partition is a member's judgement; conclude's cut, MACHINE_CANNOT_GROUND;
     the partition in the body. */
  inquiryground:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-2 / IS-2: the six version acts settle which reading an answer rests on; a machine reaches them and the store
     refuses it (MACHINE_CANNOT_MOVE_VERSION). */
  versionaccept:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionreject:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionconsider: { classes: ["admin", "member", "probe"],      mutating: true  },
  versionrevert:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versioncurrent:  { classes: ["admin", "member", "probe"],      mutating: true  },
  versionhide:     { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-24: the two acts that operate an action; a machine reaches them and the store refuses it
     (MACHINE_CANNOT_MOVE_ACTION, MACHINE_CANNOT_CORRESPOND). */
  actionmove:      { classes: ["admin", "member", "probe"],      mutating: true  },
  actioncorrespond:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* D-149: the laws an action's request is made under; a machine is refused by the store (MACHINE_CANNOT_SET_LAWS);
     the list in the body. */
  actionlaws:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-214: a member's revision of an action's risk tier with a reason; a machine is refused
     (MACHINE_CANNOT_SET_RISK_TIER, C-32.19). */
  actionrisktier:  { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-195: proposing the laws is the machine's half of D-149, so nobody is refused by class; the fence is
     `actionlaws` (C-32.18). */
  actionlawspropose:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* T8 (actions R28): a proposed risk tier, labelled and stored apart; the fence is `actionrisktier` (C-32.19). */
  actionriskpropose:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11: sever and reinstate move a citation with a reason, never deleting it. The corpus reads beside them are
     viewer-stamped. */
  sever:           { classes: ["admin", "member", "probe"],      mutating: true  },
  reinstate:       { classes: ["admin", "member", "probe"],      mutating: true  },
  list:       { classes: ["admin", "member", "probe"],           mutating: false },
  image:      { classes: ["admin", "member", "probe"],           mutating: false },
  file:       { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-25: every edge INTO a bundle, the citing bundle filtered by the viewer (7.9); viewer-stamped. */
  backlinks:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-17: the re-evaluation obligation, derived on read; viewer-stamped; no NEEDS entry (a read carries no
     capability). */
  reevaluations: { classes: ["admin", "member", "probe"],        mutating: false },
  /* REC-34: the derived strength pair from `strengthOf()`, never the cache; member and above, viewer-stamped; NEEDS
     null with a NON_ACTS row. */
  inquirystrength: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-18: what the record earns for a candidate leg, from the one function promote's refusal uses; NEEDS null with a
     NON_ACTS row. */
  earnedbasis: { classes: ["admin", "member", "probe"],          mutating: false },
  /* REC-83: the fixed-key content read; writes nothing, refuses any unnamed parameter (D-222); a hidden row answers as
     an absent one; NEEDS null. */
  content:     { classes: ["admin", "member", "probe"],          mutating: false },
  /* D-419: the crop a viewer shows for an image citation, op=content's cut and stamp; NEEDS null. */
  contentcrop: { classes: ["admin", "member", "probe"],          mutating: false },
  /* SK-7 (§14.4): marking a passage citable; probe admitted (EXTRACT is a machine's to do), never attesting (C-35.10);
     the minter is stamped. */
  contentmint: { classes: ["admin", "member", "probe"],          mutating: true  },
  /* SK-8 (§7.3): the EXTRACT run's productions, contentmint's cut; the store narrows by the run (a live EXTRACT run, a
     `mints` bound). */
  extractpropose:   { classes: ["admin", "member", "probe"],     mutating: true  },
  extractproposals: { classes: ["admin", "member", "probe"],     mutating: false },
  /* REC-86: NARROW and its candidates, contentmint's cut; the store refuses a machine author by shape (C-50.5). */
  narrow:           { classes: ["admin", "member", "probe"],     mutating: true  },
  narrowcandidates: { classes: ["admin", "member", "probe"],     mutating: false },
  /* REC-122: choosing a connection's on-point mention; the store refuses a machine author by shape (C-74.1). */
  connectionchoose: { classes: ["admin", "member", "probe"],     mutating: true  },
  /* T5-11 (connections R53–R57): assertion and containment judgement are a member's (refused a machine by shape);
     storing containments and the reads any credential's. */
  connectionassert:    { classes: ["admin", "member", "probe"],  mutating: true  },
  connectionsasserted: { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipstore: { classes: ["admin", "member", "probe"],  mutating: true  },
  filemembership:      { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipjudge: { classes: ["admin", "member", "probe"],  mutating: true  },
  /* REC-146: the pairing read writes nothing; viewer-stamped fail-closed, since it pairs only what that member may
     see. */
  contradictionpairs: { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-147: the judgement's write, extractpropose's cut; the store refuses a proposal with no run of the caller's in
     sight (C-93). */
  contradictionpropose: { classes: ["admin", "member", "probe"], mutating: true },
  /* N345 (contradiction R25–R55, DEC-85; K490): the five reads, viewer-stamped; the six acts a member's, conclude's cut (the
     store refuses a machine author by name, C-93.10), `author` and `viewer` stamped; `contradictionrecommend` the run's one
     act, `contradictionpropose`'s cut and stamps. */
  contradictioncandidates: { classes: ["admin", "member", "probe"], mutating: false },
  contradictiontensions:   { classes: ["admin", "member", "probe"], mutating: false },
  contradictionfacts:      { classes: ["admin", "member", "probe"], mutating: false },
  contradictionnotices:    { classes: ["admin", "member", "probe"], mutating: false },
  contradictionresponses:  { classes: ["admin", "member", "probe"], mutating: false },
  contradictiondismiss:    { classes: ["admin", "member", "probe"], mutating: true  },
  contradictionclarify:    { classes: ["admin", "member", "probe"], mutating: true  },
  contradictiontakeup:     { classes: ["admin", "member", "probe"], mutating: true  },
  contradictionresolve:    { classes: ["admin", "member", "probe"], mutating: true  },
  contradictionoptin:      { classes: ["admin", "member", "probe"], mutating: true  },
  contradictionrespond:    { classes: ["admin", "member", "probe"], mutating: true  },
  contradictionrecommend:  { classes: ["admin", "member", "probe"], mutating: true  },
  /* D-148: a fee quote is evidence; a read across actions, viewer-stamped fail-closed. */
  actionquotes:     { classes: ["admin", "member", "probe"],     mutating: false },
  /* N231: the action kinds this instance accepts now; a read naming no bundle, so no viewer stamp and no NEEDS entry. */
  actionkinds:      { classes: ["admin", "member", "probe"],     mutating: false },
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-176: the census of manifest rows a repeated snap key overwrote; counts and lists, never rewrites;
     registeraudit's fence. */
  snapkeycensus: { classes: ["admin", "probe"],                    mutating: false },
  /* D-256: every old "changed from" sentence classed through the version chain; writes nothing (BOB #31);
     registeraudit's fence. */
  changedfromaudit: { classes: ["admin", "probe"],                 mutating: false },
  /* REC-151: the plane mints every gated prefix opaque and refuses those prefixes here (C-59.5); shared prefixes still
     count. */
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:     { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* Which partition a link falls in depends on what the record holds today, so it is computed at read. */
  links:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-10 / D-220: every version held at one address with its bundle; a join over existing tables; viewer-stamped. */
  versionchain: { classes: ["admin", "member", "probe"],         mutating: false },
  /* D-394: the cross-version notice, versionchain's cut; viewer-stamped fail-closed. */
  versionnotice: { classes: ["admin", "member", "probe"],        mutating: false },
  /* T6-13 (K199): `reevaluationraise` is R14's unattended sweep (admin, daemon); the two reads are reevaluations' cut;
     adopt, keep and record are a member's, refused a machine by name. */
  reevaluationraise:   { classes: ["admin", "daemon"],                    mutating: true  },
  reevaluationnotices: { classes: ["admin", "member", "probe"],          mutating: false },
  reevaluationchanges: { classes: ["admin", "member", "probe"],          mutating: false },
  versionadopt:        { classes: ["admin", "member", "probe"],          mutating: true  },
  versionkeep:         { classes: ["admin", "member", "probe"],          mutating: true  },
  reevaluationrecord:  { classes: ["admin", "member", "probe"],          mutating: true  },
  /* PL-1 / IS-1: every account of a question's evidence; authored in bundle.md, so no write op (D-21); viewer-stamped. */
  basisversions: { classes: ["admin", "member", "probe"],        mutating: false },
  /* PL-14 / IS-7: the strength pair over one reading, never composed; writes nothing; viewer-stamped. */
  versionstrength: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-161: independence over a proposed partition, and REC-192 a stored version's; versionstrength's classes and
     stamp. */
  partitionindependence: { classes: ["admin", "member", "probe"], mutating: false },

  /* PL-12 / D-84: the manifest is a gated read; adopting is a member's attributed act (C-26.9); inhaling proposes and
     never installs (DEC-54 c). */
  biasmanifest: { classes: ["admin", "member", "probe"],         mutating: false },
  biasadopt:    { classes: ["admin", "member", "probe"],         mutating: true  },
  biasinhale:   { classes: ["admin", "member", "probe"],         mutating: false },
  /* D-91: PDF structure is a read over captured bytes, holding no PUT arm; op=capture's GET posture. */
  pdfstructure: { classes: ["admin", "member", "probe"],         mutating: false },
  runtime:    { classes: ["admin", "member", "probe"],           mutating: false },
  /* Turning resolved links into edges writes, so it is its own op rather than a flag on the read. */
  linkproject:{ classes: ["admin", "member", "probe"],           mutating: true  },
  /* Burns compute deliberately to find where the runtime cuts it off. Probe and admin only: it belongs nowhere near a
     member's session. */
  cpuprobe:   { classes: ["admin", "probe"],                     mutating: true  },
  /* M2', the fetch layer; REC-33: `daemon` is admitted so the class can reach the archive arm, and the direct arm
     refuses it in the handler. */
  acquire:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* Co-attestation: a timestamp authority attests a capture existed at an instant. */
  attest:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* The monitor records whether a source still serves what was captured (C-20.1); REC-33: the op IS the daemon's
     unattended job. */
  monitor:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* A conformance pass inside the Durable Object: read-only, paginated, resumable. */
  audit:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-54 / D-200: rebuild a provenance chain from the evidence or name what is missing; reports by default; not the
     daemon's (a member's judgement). */
  provenancechain: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-63 / DEC-56: assess a route and record the standing marker, nothing else; not the daemon's (a member's
     judgement). */
  provenanceroute: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-116: the read over the route markers. */
  provenanceroutes: { classes: ["admin", "member", "probe"],     mutating: false },
  /* The write arc: ratification's authority is the SSHSIG against registered signers; probe reaches it in scratch's
     own tables. */
  ratify:       { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-14: authoring a case writes what op=ratify then signs, so it is separate from ratify. The bar and editions
     beside it. */
  publish:      { classes: ["admin", "member", "probe"],           mutating: true  },
  /* N345 (case-authoring R32): the ceremony's read before op=publish; publish's classes and its two stamps. */
  publishtensions: { classes: ["admin", "member", "probe"],        mutating: false },
  /* N364 (case-authoring R34): the ceremony's pre-flight, op=publish run and rolled back; it writes nothing, so it is
     not mutating. Publish's classes and its stamps. */
  publishpreflight: { classes: ["admin", "member", "probe"],       mutating: false },
  strengthbar:  { classes: ["admin", "member", "probe"],           mutating: true  },
  strengthbarof:{ classes: ["admin", "member", "probe"],           mutating: false },
  publishededitions: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-22: the public read path answers from the published projection only; bytes by hash, never by path. */
  publishedcase:  { classes: null,                                 mutating: false },
  publishedbytes: { classes: null,                                 mutating: false },
  /* CASE-4 / DEC-72: a published case's revision flags, every fact already public; ungated, no NEEDS entry. */
  caseflags:      { classes: null,                                 mutating: false },
  /* CASE-5b / REC-130: a ratified case document is public, an unsigned one answers only to standing (`caseReader`);
     caseratify is gated as ratify. */
  casedocument:   { classes: null,                                 mutating: false },
  caseratify:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* T34 (R25; ratification R40, DEC-147): the ceremony's last act with a set date and time, `caseratify`'s gate — its
     classes, its `NEEDS` row (`publish`) and both session sets — and a member session's only (`machineClasses: []`);
     `at` is a body field, as ratification reads the ceremony's whole body. */
  publishat:      { classes: ["admin", "member", "probe"], machineClasses: [], mutating: true  },
  /* REC-126 (§6A): the review copy — authoring, issuing and revoking gated, the store refusing a machine; reading and
     commenting ungated for a grant's holder. */
  casedraft:      { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewgrant:    { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewrevoke:   { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewcopy:     { classes: null,                                   mutating: false },
  reviewcomment:  { classes: null,                                   mutating: true  },
  /* D-150 (§3 rule 11): the exclusion statement's acknowledgement, through the review copy's two doors; writes a row,
     gates nothing. */
  statementack:   { classes: null,                                   mutating: true  },
  /* REC-198: the list of a project's drafts, fenced like reading one (the member door only). The inbox reads and
     resolve beside it. */
  casedrafts:     { classes: ["admin", "member", "probe"],           mutating: false },
  excludedby:   { classes: ["admin", "member", "probe"],           mutating: false },
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  /* N364 (capture R65, R67, R72; R36): the pull, and the two knock reads, are a signed-in member's (R32's fence):
     `machineClasses: []` refuses every bearer, and so every agent credential. The pull files a capture and promotes it
     at `collected` in one act (R36); `inboxresolve` to `pulled` is routed as it. */
  inboxpull:    { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  knocksof:     { classes: ["admin", "member"], machineClasses: [], mutating: false },
  pulledknocks: { classes: ["admin", "member"], machineClasses: [], mutating: false },
  /* N364 (capture R68, R69): a late co-attestation and a capture's signed account, `by` stamped; the reads beside them. */
  reattest:         { classes: ["admin", "member", "probe"],       mutating: true  },
  lateattestations: { classes: ["admin", "member", "probe"],       mutating: false },
  captureaccount:   { classes: ["admin", "member", "probe"],       mutating: true  },
  captureaccounts:  { classes: ["admin", "member", "probe"],       mutating: false },
  /* T22 (K1023, K1037; capture R76, R77, R79–R81; R9): setting a held capture aside and restoring it are a member's
     reasoned acts — a machine reaches each and capture refuses it by name (MACHINE_CANNOT_SET_ASIDE, C-118.8) — `by` and
     `viewer` stamped; the held list and a capture's grade note are reads, viewer-stamped; the doorbell's tally is a read
     for a member's own session only, `knocksof`'s fence (`machineClasses: []` refuses every bearer), viewer-stamped.
     NOTHING IS DECLARED FOR `doorbellrefused`, capture's map's other R80 arm: it is the Worker's count of a knock it
     refused before the store, a store-internal route the plane calls from within itself and never a public op (R6;
     K1037), as `monitorlook` is. */
  heldsetaside:     { classes: ["admin", "member", "probe"],       mutating: true  },
  heldrestore:      { classes: ["admin", "member", "probe"],       mutating: true  },
  heldcaptures:     { classes: ["admin", "member", "probe"],       mutating: false },
  gradenote:        { classes: ["admin", "member", "probe"],       mutating: false },
  doorbelltally:    { classes: ["admin", "member"], machineClasses: [], mutating: false },
  /* N364 (sources R1–R9): a source's disclosures, links and consents, `by` stamped; the reads `viewer`-stamped (a
     machine credential reads nothing, the module's NO_SUCH_SOURCE); `sourcepublishable` writes nothing. */
  sourcedisclose:        { classes: ["admin", "member", "probe"], mutating: true  },
  sourcelink:            { classes: ["admin", "member", "probe"], mutating: true  },
  sourceconsent:         { classes: ["admin", "member", "probe"], mutating: true  },
  sourceconsentwithdraw: { classes: ["admin", "member", "probe"], mutating: true  },
  sourceof:              { classes: ["admin", "member", "probe"], mutating: false },
  sourcerung:            { classes: ["admin", "member", "probe"], mutating: false },
  sourcereadlog:         { classes: ["admin", "member", "probe"], mutating: false },
  sourcepublishable:     { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-159 (§4.9): `member` admits an enrolled administrator's session; `machineClasses` keeps the MEMBER_TOKEN
     bearer and `ai` out. */
  memberadd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  /* D-136: section 4 governance, decided by the roster on the stamped `by` (NOT_AN_ADMIN); `member` admits an
     administrator's session and the operator fence refuses bearers. `memberlist` projects the pairing on the
     `administer` stamp (D-157). */
  membercaps:   { classes: ["admin", "member", "probe"],           mutating: true  },
  adminendorse: { classes: ["admin", "member", "probe"],           mutating: true  },
  adminremove:  { classes: ["admin", "member", "probe"],           mutating: true  },
  adminarith:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* N43 (membership R10, R11, R19): a person's own roster acts in both session sets with a stamped `by`;
     `machineClasses` as REC-159. */
  adminresign:      { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccessset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccess:    { classes: ["admin", "member", "probe"],           mutating: false },
  memberpairingset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberpairings:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* D-9: why a register row is unreferenced, classified against what the store holds; admin and probe. */
  registeraudit:{ classes: ["admin", "probe"],                     mutating: false },
  /* REC-175: the census of held rows whose stored sha disagrees with their bytes; lists, never rewrites;
     registeraudit's fence. */
  digestcensus: { classes: ["admin", "probe"],                     mutating: false },
  /* REC-190: the census of displaced homes (D-179's residue); lists both bundles, never repairs; registeraudit's
     fence. */
  homecensus:   { classes: ["admin", "probe"],                     mutating: false },
  /* FW-5: a captured document's reading, and the reverse index of a raw reference; read-only. */
  reading:      { classes: ["admin", "member", "probe"],           mutating: false },
  readingref:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-36 / REC-40: which documents name a registered subject, at every tier, as candidates only; op=resolve still
     grades; NEEDS null. */
  readingname:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* CPDF-10: the two provenance reads are reads; attesting is a person's testimony, refused a machine at the gate and
     at the store (C-35.10). */
  textprovenance: { classes: ["admin", "member", "probe"],         mutating: false },
  textattest:   { classes: ["admin", "member", "probe"],           mutating: false },
  attesttext:   { classes: ["admin", "member"],                    mutating: true  },
  /* REC-87: typing and attesting a typing are a person's word, attesttext's cut and two fences (C-52.1, C-35.10); the
     read is open. */
  transcribe:          { classes: ["admin", "member"],             mutating: true  },
  transcriptionattest: { classes: ["admin", "member"],             mutating: true  },
  transcription:       { classes: ["admin", "member", "probe"],    mutating: false },
  /* MK-1: a member's firsthand observation, transcribe's cut; the store refuses a machine by name (C-53.1). */
  testify:             { classes: ["admin", "member"],             mutating: true  },
  /* MK-4: a lead and a look against it are a person's acts, transcribe's cut (C-54.2, C-54.8); a hidden lead answers
     as absent (C-54.5). */
  lead:                { classes: ["admin", "member"],             mutating: true  },
  leadlook:            { classes: ["admin", "member"],             mutating: true  },
  /* BOB #14: the author shares a lead to a project, lead's cut. */
  leadshare:           { classes: ["admin", "member"],             mutating: true  },
  /* MK-7: the author chooses what an edition publishes of who said it, testify's cut (C-92.1). The lead read beside
     it. */
  attribute:           { classes: ["admin", "member"],             mutating: true  },
  leadread:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-681: the leads this viewer may read, leadread's cut and fence. */
  leadlist:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-162 (§8.4): declaring and placing are a person's acts (C-81.2, C-81.7); proposing is the machine's half,
     contentmint's cut; the read is open. */
  themedeclare:        { classes: ["admin", "member"],             mutating: true  },
  themeplace:          { classes: ["admin", "member"],             mutating: true  },
  themepropose:        { classes: ["admin", "member", "probe"],    mutating: true  },
  themeread:           { classes: ["admin", "member", "probe"],    mutating: false },
  /* T5-11 (connections R43): withdrawing or rejecting is a person's act, themeplace's cut (C-81.11). */
  themewithdraw:       { classes: ["admin", "member"],             mutating: true  },
  /* REC-203: the identifier-space judgement, a read; each capture viewer-gated. */
  idmatch:             { classes: ["admin", "member", "probe"],    mutating: false },
  /* CPDF-13: the two reads are open; calibrating is measuring, a machine's to do (probe admitted), and a measurement
     never moves a grade (CAL_CANNOT_REGRADE); a vendor signal only pulls a probe earlier. */
  calibrations: { classes: ["admin", "member", "probe"],           mutating: false },
  calibrationdrift: { classes: ["admin", "member", "probe"],       mutating: false },
  calibrate:    { classes: ["admin", "member", "probe"],           mutating: true  },
  calibrationsubject: { classes: ["admin", "member", "probe"],     mutating: true  },
  calibrationsignal: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* FW-6: building the subject registry; the writes stamp `declared_by` (DEC-52: a machine may declare, and is named). */
  entitycreate: { classes: ["admin", "member", "probe"],           mutating: true  },
  entityalias:  { classes: ["admin", "member", "probe"],           mutating: true  },
  relationdeclare:{ classes: ["admin", "member", "probe"],         mutating: true  },
  /* T5-11 (entities R8): an alias or relation withdrawn with a reason, stamped as the writes are. The registry reads
     beside them. */
  aliaswithdraw:  { classes: ["admin", "member", "probe"],         mutating: true  },
  relationwithdraw:{ classes: ["admin", "member", "probe"],        mutating: true  },
  /* N345 (entities R38): a report that a resolution matched the wrong subject, stamped `by` as the registry writes are. */
  resolutiondefect:{ classes: ["admin", "member", "probe"],        mutating: true  },
  entity:       { classes: ["admin", "member", "probe"],           mutating: false },
  entitybyalias:{ classes: ["admin", "member", "probe"],           mutating: false },
  relation:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* FW-7: resolving (grades A–C, never D) and grade-D testimony, both stamped `resolved_by`; the reads are open. */
  resolve:        { classes: ["admin", "member", "probe"],         mutating: true  },
  resolvetestify: { classes: ["admin", "member", "probe"],         mutating: true  },
  resolutions:    { classes: ["admin", "member", "probe"],         mutating: false },
  concerns:       { classes: ["admin", "member", "probe"],         mutating: false },
  /* FW-8: connections derived with the weaker end's grade, and progression definitions as data, stamped; the reads are
     open. */
  connect:          { classes: ["admin", "member", "probe"],       mutating: true  },
  connections:      { classes: ["admin", "member", "probe"],       mutating: false },
  progressiondefine:{ classes: ["admin", "member", "probe"],       mutating: true  },
  progression:      { classes: ["admin", "member", "probe"],       mutating: false },
  /* FW-9: threading documents that resolve to the entity into an instance, stamped; the instance read derives its
     grade and findings. */
  thread:           { classes: ["admin", "member", "probe"],       mutating: true  },
  instance:         { classes: ["admin", "member", "probe"],       mutating: false },
  /* FW-10: an exception document discharges a lawful skip, stamped; the raw discharges read. */
  discharge:        { classes: ["admin", "member", "probe"],       mutating: true  },
  exceptions:       { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-6: the discovery feed of derived findings, read-time and never mutating. */
  proposals:        { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-7: deferring or dismissing a derived proposal writes one disposition row and mints no bundle (D-79); the
     decider is stamped. */
  proposedispose:   { classes: ["admin", "member", "probe"],       mutating: true  },
  /* REC-9: a capture's place in the progression instances it is threaded into, from the one derivation; a read. */
  captureprogressions:{ classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-20 / DEC-16: the member's one queue, never public; `member` and `viewer` are stamped (D-15 §7.9). */
  queue:              { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-21 / D-125: the queue's personal writes, no probe (a mute with no member is not a thing); they write
     `queue_state` only. */
  queuemute:          { classes: ["admin", "member"],               mutating: true  },
  queuesnooze:        { classes: ["admin", "member"],               mutating: true  },
  /* T6-13 (intent R2–R18): the ten acts take conclude's cut (a machine refused by name, but `triage`'s `question`);
     the seven reads are viewer-stamped. */
  objectivecondition:  { classes: ["admin", "member", "probe"],      mutating: true  },
  objectiveprogress:   { classes: ["admin", "member", "probe"],      mutating: false },
  objectivegaps:       { classes: ["admin", "member", "probe"],      mutating: false },
  goaldeclare:         { classes: ["admin", "member", "probe"],      mutating: true  },
  goallink:            { classes: ["admin", "member", "probe"],      mutating: true  },
  goalclose:           { classes: ["admin", "member", "probe"],      mutating: true  },
  goal:                { classes: ["admin", "member", "probe"],      mutating: false },
  aspirationdeclare:   { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationdepart:    { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationdeadend:   { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirationretire:    { classes: ["admin", "member", "probe"],      mutating: true  },
  aspirations:         { classes: ["admin", "member", "probe"],      mutating: false },
  aspirationcontacts:  { classes: ["admin", "member", "probe"],      mutating: false },
  pursuit:             { classes: ["admin", "member", "probe"],      mutating: false },
  intentproposals:     { classes: ["admin", "member", "probe"],      mutating: false },
  triage:              { classes: ["admin", "member", "probe"],      mutating: true  },
  workobjective:       { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T8–T9 (layer 9): the acts take conclude's cut (a machine refused by name), the proposals any credential's,
     labelled; the reads are viewer-stamped. */
  standarddeclare:     { classes: ["admin", "member", "probe"],      mutating: true  },
  standardpropose:     { classes: ["admin", "member", "probe"],      mutating: true  },
  standardadopt:       { classes: ["admin", "member", "probe"],      mutating: true  },
  standard:            { classes: ["admin", "member", "probe"],      mutating: false },
  standards:           { classes: ["admin", "member", "probe"],      mutating: false },
  standardinforce:     { classes: ["admin", "member", "probe"],      mutating: false },
  determine:           { classes: ["admin", "member", "probe"],      mutating: true  },
  comparisonpropose:   { classes: ["admin", "member", "probe"],      mutating: true  },
  determination:       { classes: ["admin", "member", "probe"],      mutating: false },
  determinations:      { classes: ["admin", "member", "probe"],      mutating: false },
  comparison:          { classes: ["admin", "member", "probe"],      mutating: false },
  /* N345 (conformance R21): the facts a comparison started from a contradiction reads; viewer-stamped. */
  comparisonfacts:     { classes: ["admin", "member", "probe"],      mutating: false },
  consequencerecord:   { classes: ["admin", "member", "probe"],      mutating: true  },
  consequencerevise:   { classes: ["admin", "member", "probe"],      mutating: true  },
  addressedrecord:     { classes: ["admin", "member", "probe"],      mutating: true  },
  consequence:         { classes: ["admin", "member", "probe"],      mutating: false },
  consequencesof:      { classes: ["admin", "member", "probe"],      mutating: false },
  addressed:           { classes: ["admin", "member", "probe"],      mutating: false },
  filingprepare:       { classes: ["admin", "member", "probe"],      mutating: true  },
  filingapprove:       { classes: ["admin", "member", "probe"],      mutating: true  },
  filingsent:          { classes: ["admin", "member", "probe"],      mutating: true  },
  counselpacket:       { classes: ["admin", "member", "probe"],      mutating: true  },
  counselpacketexport: { classes: ["admin", "member", "probe"],      mutating: true  },
  theorypropose:       { classes: ["admin", "member", "probe"],      mutating: true  },
  counselpacketread:   { classes: ["admin", "member", "probe"],      mutating: false },
  filingsfor:          { classes: ["admin", "member", "probe"],      mutating: false },
  availableactions:    { classes: ["admin", "member", "probe"],      mutating: false },
  escalationopen:      { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationattach:    { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationevaluate:  { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationadvance:   { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationdecline:   { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationend:       { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationsuspend:   { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationresume:    { classes: ["admin", "member", "probe"],      mutating: true  },
  escalation:          { classes: ["admin", "member", "probe"],      mutating: false },
  escalationsdue:      { classes: ["admin", "member", "probe"],      mutating: false },
  /* T22 (K1019, J3; escalation R27, R28; R9): declining to escalate, a member's reasoned act, `escalationopen`'s posture
     (a machine reaches it and escalation refuses it by name), `author` and `viewer` query-stamped; the status read,
     `escalationsdue`'s, viewer-stamped. */
  declinetoescalate:   { classes: ["admin", "member", "probe"],      mutating: true  },
  escalationstatus:    { classes: ["admin", "member", "probe"],      mutating: false },
  /* T23 (N485: K1025; escalation R29, R25; R10): the opening reason pre-assembled from a determination, labelled machine
     work and writing nothing; `escalationstatus`' read, viewer-stamped. */
  escalationreasondraft: { classes: ["admin", "member", "probe"],    mutating: false },
  /* T18 (N-A12, K608; K705): filings' drafted communication (R23). Any credential prepares a communication, labelled
     (`proposalLabel`). T21 (K922 (1)): `templatesave` is filings R32's, a member starting a template draft from an
     approved filing through `filing-templates.templateDraft` (a machine refused by that module, its R3); its spec and
     stamps are unchanged. The library's read, `templates`, is `filing-templates`' (its R14), declared below. */
  communicationprepare: { classes: ["admin", "member", "probe"],     mutating: true  },
  templatesave:        { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T21 (K921, K927; filing-templates R3, R4, R7, R8, R10, R11): the template library's member acts. A machine reaches
     each and the module refuses it by name (MACHINE_CANNOT_DRAFT_TEMPLATE, MACHINE_CANNOT_APPROVE_TEMPLATE), conclude's
     posture; `author` (the module's `by` where its R says `by`) and `viewer` stamped. `templatereviewgrant` takes the
     grant's `secretSha` from the door (control-plane R44), as `reviewgrant` does. */
  templatedraft:       { classes: ["admin", "member", "probe"],      mutating: true  },
  templaterevise:      { classes: ["admin", "member", "probe"],      mutating: true  },
  templatesubmit:      { classes: ["admin", "member", "probe"],      mutating: true  },
  templatereviewgrant: { classes: ["admin", "member", "probe"],      mutating: true  },
  templategrantrevoke: { classes: ["admin", "member", "probe"],      mutating: true  },
  templateapprove:     { classes: ["admin", "member", "probe"],      mutating: true  },
  templateretire:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* filing-templates R6: any credential proposes wording (an agent credential by its scope), labelled; `proposer` and
     `viewer` stamped, `optionpropose`'s posture. */
  templatepropose:     { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T23 (N485: K1025, K1035; case-authoring R39; R10): a draft of a new edition's statement of what changed is any
     credential's (an agent credential by its scope), labelled by its proposer (`proposalLabel`), `templatepropose`'s
     posture; `proposedBy` and `viewer` stamped. The case's drafts are a read, viewer-stamped. */
  whatchangedpropose:  { classes: ["admin", "member", "probe"],      mutating: true  },
  whatchangeddrafts:   { classes: ["admin", "member", "probe"],      mutating: false },
  /* filing-templates R8, R9, R12–R14: the review grant's doors, `reviewcopy`'s and `reviewcomment`'s posture — public at
     the class gate because each gates itself: a member by session (`author`), a recipient by the grant's secret
     (`secretSha`), every other caller the one dead answer (NO_TEMPLATE_GRANT). */
  templatereview:      { classes: null,                              mutating: true  },
  templatecomment:     { classes: null,                              mutating: true  },
  templateread:        { classes: null,                              mutating: false },
  templatecomments:    { classes: null,                              mutating: false },
  /* filing-templates R14 (moved from filings R26, K921): the library's list; viewer-stamped. */
  templates:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* T21 (K921; local-facts R1, R2, R4): a member's confirmation, correction or dispute of a profile fact (a machine
     reaches it and the module refuses it by name, MACHINE_CANNOT_CONFIRM; `by` and `viewer` stamped), and the two reads,
     viewer-stamped. */
  factconfirm:         { classes: ["admin", "member", "probe"],      mutating: true  },
  factstatus:          { classes: ["admin", "member", "probe"],      mutating: false },
  factsdue:            { classes: ["admin", "member", "probe"],      mutating: false },
  /* T18 (N-A12; actions R47, R48, K709): an action's creation as a promotion and its pressure mark, a member's acts
     (the module refuses a machine by name, MACHINE_CANNOT_MARK_PRESSURE; a creation the promotion's own fences); the
     read and the list are viewer-stamped. */
  actioncreate:        { classes: ["admin", "member", "probe"],      mutating: true  },
  actionpressure:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T20 (K899 (7), K902; actions R52): a litigation hold stated on a `legal` pressure mark, `actionpressure`'s posture
     (the module refuses a machine by name, MACHINE_CANNOT_SET_HOLD). */
  actionhold:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T27 (N518, DEC-113, K1134 (3); actions R56–R58; R12): the hold's release, `actionhold`'s posture (the module refuses
     a machine by name, MACHINE_CANNOT_SET_HOLD), its author query-stamped; what a release would restart, and whether
     projects are held, reads, viewer-stamped. */
  actionholdrelease:   { classes: ["admin", "member", "probe"],      mutating: true  },
  actionholdpreview:   { classes: ["admin", "member", "probe"],      mutating: false },
  projectholds:        { classes: ["admin", "member", "probe"],      mutating: false },
  action:              { classes: ["admin", "member", "probe"],      mutating: false },
  actions:             { classes: ["admin", "member", "probe"],      mutating: false },
  /* T18 (K704; action-clocks R4, R6, DEC-94): a member's own reminder on a dated clock entry, set and answered; a
     machine reaches both and the module refuses it by name (MACHINE_CANNOT_SET_REMINDER), conclude's posture. */
  reminderset:         { classes: ["admin", "member", "probe"],      mutating: true  },
  reminderanswer:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T18 (N-A12, K711; action-plans R1–R34): the plan's eleven acts take conclude's cut (a machine reaches each and is
     refused by name, R24, R33); `optionpropose` is any credential's (R11, R31: a machine's names its planning run),
     labelled; the three reads, the tray (`planproposals`, R34, K660) among them, are viewer-stamped. Every row admits
     `member` and none carries `machineClasses`, so an agent credential reaches the reads and may be scoped to
     `optionpropose` (K660; `PLAN_RUN_SCOPE` below). */
  planopen:            { classes: ["admin", "member", "probe"],      mutating: true  },
  plansubjectadd:      { classes: ["admin", "member", "probe"],      mutating: true  },
  plansubjectremove:   { classes: ["admin", "member", "probe"],      mutating: true  },
  optionadd:           { classes: ["admin", "member", "probe"],      mutating: true  },
  optionrevise:        { classes: ["admin", "member", "probe"],      mutating: true  },
  optionpropose:       { classes: ["admin", "member", "probe"],      mutating: true  },
  optionadopt:         { classes: ["admin", "member", "probe"],      mutating: true  },
  optiondispose:       { classes: ["admin", "member", "probe"],      mutating: true  },
  scenarioset:         { classes: ["admin", "member", "probe"],      mutating: true  },
  checkpointrecord:    { classes: ["admin", "member", "probe"],      mutating: true  },
  optionstart:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* T24 (N490, DEC-115, K1134; action-plans R37; R11): what `optionstart` would do with the same arguments, answered
     at that instant and writing nothing, so a read; `optionstart`'s classes, and its stamps (`author` from the query, so
     the preview is asked as the very caller the start would be, and `viewer`) through `ACTION_PLANS_PREVIEWS` below. */
  optionstartpreview:  { classes: ["admin", "member", "probe"],      mutating: false },
  planclose:           { classes: ["admin", "member", "probe"],      mutating: true  },
  plan:                { classes: ["admin", "member", "probe"],      mutating: false },
  plans:               { classes: ["admin", "member", "probe"],      mutating: false },
  planproposals:       { classes: ["admin", "member", "probe"],      mutating: false },
  /* IS-6 (§11): the investigative run; probe admitted (a run is a real object a fleet member drives); the reads gated
     on the run's context. */
  airunopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airuntick:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airunclose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  airun:              { classes: ["admin", "member", "probe"],      mutating: false },
  airunlog:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-207: settling a bias debt is a member's judgement, no probe (refused by shape too); the read carries the run
     reads' classes. */
  biasdebtresolve:    { classes: ["admin", "member"],               mutating: true  },
  biasdebt:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-93: the frontier read; what a caller may see is the viewer stamp's, the run log's classes. */
  frontier:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-525: the Drive shell sweep lists bundles whose baseline is Google's page; op=index's classes and stamp. */
  driveshells:        { classes: ["admin", "member", "probe"],      mutating: false },
  /* T8 (monitoring R32): what the group monitors, driveshells' cut; viewer-stamped. */
  monitoring:         { classes: ["admin", "member", "probe"],      mutating: false },
  /* K372, N314: the daemon's pause — the ADMIN_TOKEN bearer and every member session; `actor` stamped; monitoring
     refuses a non-administrator. The slate is a viewer-stamped read. */
  monitorpause:       { classes: ["admin", "member"], machineClasses: ["admin"], mutating: true  },
  /* K407: the profiles read (admin bearer and sessions); the set a session act, every bearer refused (`machineClasses:
     []`), `by` stamped. */
  profiles:           { classes: ["admin", "member"],               mutating: false },
  profilesset:        { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  monitorslate:       { classes: ["admin", "member", "probe"],      mutating: false },
  /* T22 (K1019; monitoring R17, R52; R9): an address's own frequency, a source owner's reasoned act — a machine reaches
     it and monitoring refuses it by name (MACHINE_CANNOT_SET_FREQUENCY) — `author` and `viewer` query-stamped. */
  addressfrequencyset: { classes: ["admin", "member", "probe"],     mutating: true  },
  /* T23 (the link sweep, K1094; R10), served since T24 by `link-sweep` (its R9; N506): the sweeps a member may see, a
     read for a member session, viewer-stamped; link-sweep answers a bearer's call as monitoring answers its reads. */
  sweeps:             { classes: ["admin", "member", "probe"],      mutating: false },
  /* T23 (DEC-111, K1031, K1100; network-notices R1, R2, R4, R5, R22, R23, R24; R10): a project's notice is prepared
     (writing nothing) and posted by an owner signed in as themselves, and read by a member who sees the project — each a
     member session's only, `knocksof`'s fence: `machineClasses: []` refuses every bearer, and so every agent credential
     and operator token. `by` and `viewer` stamped on the two the owner performs, `viewer` on the reads (network-notices
     reads both from the query). `directorysubmission` (its R23) is `notices`' read, by R6. */
  noticeprepare:      { classes: ["admin", "member"], machineClasses: [], mutating: false },
  noticepost:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  notices:            { classes: ["admin", "member"], machineClasses: [], mutating: false },
  directorysubmission:{ classes: ["admin", "member"], machineClasses: [], mutating: false },
  /* T27 (N520; DEC-116, DEC-100; docket R1–R8, R12, R18; R13): a case's docket — filing to the record and marking a
     threat (`author` stamped), the manager's preparation, signed post and decline (`by` stamped), and the reads — each a
     member session's only, `knocksof`'s fence: `machineClasses: []` refuses every bearer, and so every agent credential
     and operator token (docket refuses a machine stamp by name too, MACHINE_CANNOT_FILE_DOCKET, _PLACE_DOCKET). `viewer`
     stamped on each. */
  docketfile:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  docketpressure:     { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  docketdecline:      { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  docketpost:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  docket:             { classes: ["admin", "member"], machineClasses: [], mutating: false },
  docketprepare:      { classes: ["admin", "member"], machineClasses: [], mutating: false },
  docketinvitation:   { classes: ["admin", "member"], machineClasses: [], mutating: false },
  /* T28 (N520, N522; DEC-112 (3)(6), DEC-96 items 1, 2; case-import R1–R8; R14): another group's case file imported into
     a read-only project, a missing document completed, an edition accepted for its recreated findings and the acceptance
     withdrawn, a flag raised and cleared — each a member's act in their own name, `by` stamped — and the two reads of
     what is imported, each a member session's only, `knocksof`'s fence: `machineClasses: []` refuses every bearer, and
     so every agent credential and operator token (case-import refuses a machine `by` by name too, MACHINE_CANNOT_IMPORT).
     `viewer` stamped on each. */
  caseimport:           { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  caseimportdocument:   { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importaccept:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importacceptwithdraw: { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importflag:           { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importflagclear:      { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importedcases:        { classes: ["admin", "member"], machineClasses: [], mutating: false },
  importedcase:         { classes: ["admin", "member"], machineClasses: [], mutating: false },
  /* T31 (N534; DEC-101 (3); case-import R17; R16): a member's watch on an import's publisher docket, set and lifted in
     their own name — `by` and `viewer` stamped, the import acts' fence (`machineClasses: []` refuses every bearer). */
  importwatch:          { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  importunwatch:        { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  /* T31 (N528; DEC-120, DEC-121; wizard-scripts R3–R16; R15): the wizard library. Drafting, revising, submitting,
     approving and retiring a script are a member's acts in their own name, each a member session's only (`machineClasses:
     []`; wizard-scripts refuses a machine stamp by name too, MACHINE_CANNOT_DRAFT_WIZARD, _APPROVE_WIZARD); the advanced
     editor's grant and revocation are an administrator's own session acts, asked of the roster (NOT_AN_ADMIN); a
     proposal is any credential's, an agent credential's by its scope, labelled (`templatepropose`'s posture); a wizard's
     progress is a member session's unattributed tally; the five reads are a member session's, and the check is any
     credential's read, an agent credential's included, so a wizard planned on the fly passes the same checks.
     NOTHING IS DECLARED FOR `wizardrefusaltally`: it is the door's own call of wizard-scripts' refusal tally (its R16;
     control-plane R50), a store-internal route never served to a caller (R6; K1396), as `doorbellrefused` is. */
  wizarddraft:          { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardrevise:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardsubmit:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardapprove:        { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardretire:         { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardeditorgrant:    { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardeditorrevoke:   { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizardpropose:        { classes: ["admin", "member", "probe"],          mutating: true  },
  wizardprogress:       { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  wizards:              { classes: ["admin", "member"], machineClasses: [], mutating: false },
  wizardread:           { classes: ["admin", "member"], machineClasses: [], mutating: false },
  wizardsat:            { classes: ["admin", "member"], machineClasses: [], mutating: false },
  wizarduse:            { classes: ["admin", "member"], machineClasses: [], mutating: false },
  wizardcandidates:     { classes: ["admin", "member"], machineClasses: [], mutating: false },
  wizardcheck:          { classes: ["admin", "member", "probe"],          mutating: false },
  /* REC-94: a capture's content-axis state; frontier's classes and gate. */
  contentaxis:        { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-69: the context-keyed run read; the viewer stamp decides what a caller sees. */
  airuns:             { classes: ["admin", "member", "probe"],      mutating: false },
  /* PL-3 (§4 group 2): the session's one write, `suggested` only, with its six checks plane-side; the run ops'
     classes. */
  suggest:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-4: the door requests and holds no fetch; `daemon` is here BY DECISION: SWEEP 4b item 1 is the decision DEC-37
     required for widening the class *"by decision, not by drift"*; the queue read admits no daemon. */
  capturerequest:      { classes: ["admin", "member", "probe"],           mutating: true  },
  capturerequestdrain: { classes: ["admin", "probe", "daemon"],           mutating: true  },
  capturerequests:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* T6-13 (capture-requests R42): retrying a request the source refused, a member's act on the group's queue. */
  capturerequestretry: { classes: ["admin", "member"],                    mutating: true  },
  /* PL-11 / D-199: no row names `ai` (this module's R2 test); no probe (minting is a member act, C-29.1); the read is wider and
     carries no value. */
  aicredentialmint:    { classes: ["admin", "member"],                    mutating: true  },
  aicredentialrevoke:  { classes: ["admin", "member"],                    mutating: true  },
  aicredentials:       { classes: ["admin", "member"],                    mutating: false },
  /* PL-12 §14: the spawn contract's fence as an op, so it can be pointed at; a gated read on the run's context. */
  airunspawn:         { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-103: the governor's state is readable by members; its config is the operator's, the founder's session alone
     (§4.9, BOB #23). */
  governorstate:  { classes: ["admin", "member", "probe"],           mutating: false },
  governorconfig: { classes: ["admin", "probe"],                     mutating: true  },
  /* REC-159: `member` and `machineClasses` for memberadd's reason. */
  signeradd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  signerlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  signerset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  /* N364 (membership R89, R90): a member registers or revokes their own attesting key from their own signed-in
     session, `by` stamped; `machineClasses: []` refuses every bearer, and so every agent credential. */
  signerregister: { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  signerrevoke:   { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  /* The unauthenticated surface, each gating itself: bootstrap reveals claimed or not, claim needs the bootstrap
     secret, login the password, enroll a live invitation. */
  bootstrap:  { classes: null,                                   mutating: false },
  claim:      { classes: null,                                   mutating: true  },
  login:      { classes: null,                                   mutating: false },
  enroll:     { classes: null,                                   mutating: true  },
  /* An invitation's look answers only a live one; verify reads the published projection; knock lands in a quarantined,
     capped inbox. */
  invitelook: { classes: null,                                   mutating: false },
  verify:     { classes: null,                                   mutating: false },
  knock:      { classes: null,                                   mutating: true  },
  /* N364 (sources R11): a knocker consents, or withdraws, by their knocker secret, with no account; the connecting
     address and the instant are stamped as the knock's are, and the attempt is counted in the knock's windows. */
  knockerconsent: { classes: null,                               mutating: true  },
  /* T23 (public-read R18; network-notices R10, R20, R21; R10): the credential-free reads network-notices registers with
     public-read, served by name or through the door's own `publicread` (`publishedmanifest`'s posture, R6): each
     answers only what is already public, so nothing is stamped and no session set holds it. */
  publicread:      { classes: null,                              mutating: false },
  activitymethod:  { classes: null,                              mutating: false },
  noticespublic:   { classes: null,                              mutating: false },
  groupkeyspublic: { classes: null,                              mutating: false },
  /* T27 (public-read R21; docket R14, R15; R13): the docket's public shelves and its feed, credential-free and served
     through public-read's map as `publishedcase` is: each answers only what is already public, so nothing is stamped
     and no session set holds it. */
  docketpublic:    { classes: null,                              mutating: false },
  docketfeed:      { classes: null,                              mutating: false },
  /* T28 (public-read R18; case-checker R15; DEC-112 (3); R14): the standalone checker program and the readable
     specification of a case-file format, credential-free and registered with public-read as network-notices' reads
     are: each answers only what is already public, so nothing is stamped and no session set holds it. */
  casechecker:     { classes: null,                              mutating: false },
  casefilespec:    { classes: null,                              mutating: false },
  /* T33 (K1640; R17): a page of an export, with `export`'s credential (corpus-export R6, R8); it writes nothing. */
  exportpage:      { classes: ["admin"],                         mutating: false },
  /* T33 (K1566; money-checks R6): the detectors' bounded run is the scheduler's, which calls it in-process; the op is
     the operator's, `reproject`'s posture, and no session reaches it (recorded below). */
  moneydetectorsrun: { classes: ["admin", "probe"],              mutating: true  },
  /* K1601: the ask's three plane ops (`ASK_GRANT_OPS` above): a session's kinds, no bearer; the grant is admitted
     outside this table. */
  askceiling:      { classes: ["admin", "member"], machineClasses: [], mutating: false },
  askcheck:        { classes: ["admin", "member"], machineClasses: [], mutating: false },
  askusage:        { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  /* T36 (R32; file-safety R4, R12, R36, R35; K1913): the scheduler's wakes over the files — the due scans, the safe views
     to render, the deeper checks to start and poll, the hourly counts forwarded — each a binding credential's (the
     administrator's bearer, the probe, the daemon), no member's, in no session set and unattended by decision below,
     `taskdrain`'s posture. */
  scanbatch:       { classes: ["admin", "probe", "daemon"],      mutating: true  },
  renderbatch:     { classes: ["admin", "probe", "daemon"],      mutating: true  },
  deeperbatch:     { classes: ["admin", "probe", "daemon"],      mutating: true  },
  securityforward: { classes: ["admin", "probe", "daemon"],      mutating: true  },
  /* T33 (R17–R20): every family's ops, each from its one entry in `OP_FAMILIES` above. */
  ...FAMILY_SPECS,
}));

/* What a signed-in browser session may do, the write arc's evolution of the
   read-only session rule. Intake is browser-writable: it is append-only,
   CAS-protected, history-preserving, and runs through the same promote path
   as everything else. Publishing requires a registered key's signature
   regardless of how the caller authenticated, and purge stays reachable
   only by machine credential. Member sessions get intake and review; admin
   sessions additionally manage the roster and keys. */
/* The retrieval READS belong here as much as `select` does, and their absence
   was a real gap rather than a boundary: a signed-in member could create a
   selection and then neither search to build one nor resolve the one they had
   made, so the browser half of S-10 was unreachable from a session. Found when
   `cite` needed them, 2026-07-25. They read the working corpus, which a member
   session already reads through op=index and op=audit, so this widens no fence:
   `viewer` and `owner` are stamped from the session's own identity below. */
/* PL-9 adds `meaningrows` here rather than to a new list, and that is the point:
   it is a statement shape on op=search's own compiler, so it takes op=search's
   own session reach and op=search's own server-side `viewer` stamp. A second
   list would be one more place for the member and admin sets to drift apart —
   the defect class this file keeps naming. */
const RETRIEVAL_READS = listed(["search", "searchfields", "searchindexcheck", "selection", "selectionlist",
                         "meaningrows"]);
/* CONSTRUCTS Step 3 (FW-5): the reading reads. A member session viewing a
   captured document may read what the plane read out of it and which other
   documents' readings carry the same entity reference. Reads of the working
   corpus, like the retrieval reads above; named as one set so the member and
   admin lists cannot drift apart.
   CORRECTED 2026-08-04 by REC-36, and stated rather than quietly reworded: this
   comment used to say "neither takes a viewer stamp: they key on a capture sha
   and a raw reference, not on the corpus view." That stopped being true when
   REC-30 swept both into REC30_VIEWER_READS — their answers name the bundle a
   capture is filed in — and the sentence survived the sweep. All three are
   stamped, and REC-36's `readingname` is entity-driven besides. */
/* CPDF-10 adds the two transcription-provenance READS to this set rather than
   listing them beside it, for the reason the block above gives: the member and
   admin lists drifting apart is the defect this naming exists to prevent. The
   WRITE (`attesttext`) is deliberately NOT here — it is a member act with its
   own session route, and folding it into a read set would be exactly the
   collapse the fence exists to stop. */
const READING_READS = listed(["reading", "readingref", "readingname", "textprovenance", "textattest"]);
/* The selection-backed actions on a Project's citation edges. Named as a set
   rather than listed twice, because the member and admin session lists drifting
   apart is exactly the class of defect this repository keeps finding. */
/* `linkproject` belongs here rather than beside acquire: it creates EDGES, which
   is what these actions do, and it is a member's contribution even though the
   edge it creates records the SOURCE's assertion rather than the member's. The
   member's act is deciding to admit the observed connection into the graph; the
   edge itself says asserted_by: source. */
const EDGE_ACTIONS = listed(["cite", "sever", "reinstate", "linkproject"]);
/* S-11 step 3. The first selection-backed action to move an OBJECT's state
   rather than an edge's, so it takes the same server-side viewer, owner and
   author stamps the edge actions take: a caller that could name the viewer
   could dispose Problems it cannot see. */
/* REC-13 adds `conclude`. It belongs in THIS array rather than a fourth list
   because it needs exactly what the array confers — both SESSION_OPS lists, the
   server-side viewer stamp and the server-side author stamp — and a second list
   would be one more place for the two session sets to drift apart, which is the
   defect class this file keeps naming. It is not selection-backed, so the
   `owner` stamp below is inert for it (nothing reads it); that costs nothing and
   is cheaper than a list that exists to omit one parameter. */
/* REC-31 adds `reopen` and REC-14 adds `publish`, both for exactly REC-13's
   reason above: each needs what this array confers — both SESSION_OPS lists,
   the server-side viewer stamp and the server-side author stamp — and nothing
   else. Neither is selection-backed (one question is picked back up at a time;
   one case is published at a time), so the `owner` stamp is inert for both.
   `publish`'s author is the member whose name goes on the completeness
   assertion and on the declared position about putting the case to its
   subject, which is the strictest reason in this file for the stamp to be the
   server's. */
/* REC-16 adds `inquirydivide` for exactly the same reason as its three
   predecessors: it needs both SESSION_OPS lists, the server-side viewer stamp
   and the server-side author stamp, and nothing else. Not selection-backed (one
   question is divided at a time), so the `owner` stamp is inert for it. Its
   author is the member whose name goes on the apportionment — WHO decided where
   each leg went, including every leg that cuts against the case — which is the
   same reason publish's stamp must be the server's. */
/* REC-136 adds `withdrawconclusion` for exactly conclude's reason: it needs both
   SESSION_OPS lists, the server-side viewer stamp and the server-side author
   stamp — the author is the member whose name goes on the withdrawal in the
   project's append-only record, which a caller must not be able to supply. It
   moves the (project, inquiry) relationship's state, so the array's name stays
   true. Not selection-backed, so `owner` is inert for it. */
const STATE_ACTIONS = listed(["dispose", "retire", "release", "conclude", "reopen", "publish", "inquirydivide",
                       "withdrawconclusion"]);
/* REC-24: the two ACTION acts, as their own array rather than folded into
   STATE_ACTIONS. They need exactly what that array confers — both SESSION_OPS
   lists, the server-side viewer stamp and the server-side author stamp — and
   op=actionmove would sit there honestly. op=actioncorrespond would NOT: it
   moves no state, and a reader of that array would then be reading a list whose
   name had stopped being true. The `owner` stamp STATE_ACTIONS also sets is
   inert for both (neither is selection-backed), so nothing is lost by naming
   them separately and one thing is kept: the name of each list still says what
   is in it. The author is the member whose name goes on the state_history entry
   and, on the testimony arm of a correspondence entry, on the evidence itself —
   which is the strictest reason in this file for a stamp to be the server's. */
/* D-149 adds `actionlaws`, for REC-24's reason: it needs both SESSION_OPS lists, the server-side viewer stamp
   and the server-side author stamp — the author is the member named beside the list of laws the request is made
   under — and it moves no state, so STATE_ACTIONS would be the wrong list. */
/* REC-214 adds `actionrisktier` for the same reason: the author is the member named beside the revision and its
   reason, so the stamp must be the server's; it moves no state. */
const ACTION_ACTIONS = listed(["actionmove", "actioncorrespond", "actionlaws", "actionrisktier"]);
/* REC-14 / DEC-17: declaring the group's default required strength is a
   session act whose AUTHOR is part of the declaration — "you can lower your own
   bar; you cannot do it quietly" — so it takes the author stamp without being a
   state action on any object. */
const DECLARATION_ACTIONS = listed(["strengthbar"]);
/* REC-45 / DEC-32: AUTHORING THE STRUCTURE of an inquiry's basis. Its own array
   and NOT folded into STATE_ACTIONS, on the same reasoning REC-24 wrote for
   ACTION_ACTIONS and for the same benefit: it moves NO state. An inquiry that
   was `open` before it was grouped is `open` after, and a reader of an array
   called STATE_ACTIONS that contained this op would be reading a list whose
   name had stopped being true. What it needs is what that array CONFERS minus
   one thing — both SESSION_OPS lists, the server-side viewer stamp and the
   server-side author stamp — and `owner` is inert for it anyway (it is not
   selection-backed: one question's structure is authored at a time).

   THE AUTHOR STAMP IS THE STRICTEST INSTANCE IN THIS FILE OF THE RULE IT
   SHARES WITH `publish`, and REC-45 exists partly to say so. Grouping is the
   ONE act in the record that makes a finding STRONGER — OR takes the maximum —
   and what it writes into the document is a NAME and a DATE against the claim
   "these reasons were enough on their own". A caller who could supply that name
   could put somebody else's signature on an overclaim, and a caller who could
   supply the date could make a structure authored AFTER a strength was seen
   look like one authored before it, which is precisely the distinction DEC-32
   requires a reader to be able to draw. So the store DELETES any caller-supplied
   `asserted_by`/`at` on every row before stamping — the op=promote
   `ownerMemberId` discipline — and this stamp is where the name comes from. */
const STRUCTURE_ACTIONS = listed(["inquiryground"]);
/* PL-2 / IS-2 — THE SIXTH STATE MACHINE'S SIX MEMBER OPS, in their own array
   for the reason STRUCTURE_ACTIONS has one: they share a stamp, a capability and
   a class list, and a list written out six times in four places is the drift
   that made DISPOSITIONS one array.

   THE `author` STAMP IS THE FIRST OF THE THREE LAYERS the fence around these
   acts is made of, and it is worth naming all three here because a reader
   meeting one of them will assume it is the whole thing:

     1. HERE — a machine credential is stamped `token:<class>` and a
        caller-supplied `author` is OVERWRITTEN, never honoured. Without this a
        machine could sign a member's name to the decision.
     2. THE ENDPOINT — `NEEDS` requires `contribute`, so a session that does not
        hold it is refused before the store is reached.
     3. THE TRANSITION — the store refuses a machine identity BY SHAPE through
        REC-46's one predicate (MACHINE_CANNOT_MOVE_VERSION).

   Each layer absorbs the others when it is whole, so each is proved where it
   lives, on its own: layer 2 by this module's R3 test
   (`test/m/op-declarations/tables.test.mjs`, the six acts riding `contribute`),
   layer 3 by basis-versions' tests (`test/m/basis-versions/acts.test.mjs`,
   MACHINE_CANNOT_MOVE_VERSION), layer 1 by the control plane's stamp.

   Machine classes REACH all six and are refused by the store rather than being
   absent from the table — conclude's posture, fail closed, so the refusal says
   what is wrong instead of "requires a credential you have". */
const VERSION_ACTIONS = listed(["versionaccept", "versionreject", "versionconsider",
                         "versionrevert", "versioncurrent", "versionhide"]);
const PROJECT_ACTIONS = listed(["projectinvite", "projectjoin", "projectleave", "projectremove",
                         "projectowneradd", "projectownerremove", "projectfork",
                         "projectownerrescue",
                         /* REC-149: the owner's §7.14 setting — `by` and `viewer` stamped like every roster act. */
                         "projectvisibilityset",
                         /* REC-150: §7.14's request to join — the requester's two acts and the owner's answer,
                            each needing the SERVER's `by` (who asks, who answers) and `viewer` (at what sight). */
                         "projectrequest", "projectrequestwithdraw", "projectrequestanswer"]);
/* D-136 — THE SECTION 4.7 VOTE AND THE SECTION 4.9 CAPABILITY EDIT, AND THEY ARE
   ONE ARRAY BECAUSE THEY ARE ONE LANDING.
   `BIO_Membership_Architecture_v2.md` §4.7 (BOB #17, 2026-09-19, read at the
   code) found these three reachable by NO session while §4.7 assigns the vote to
   a PERSON, and `by` stamped for `PROJECT_ACTIONS` alone — so on the one
   reachable path THE CALLER NAMED THE VOTER, and seven releases of governance
   arithmetic rested on an attribution the caller supplied.
   **EITHER HALF ALONE IS WORSE THAN NEITHER, which is why one array carries
   both.** Session reach without the stamp leaves the vote forgeable by whoever
   can name a voter; the stamp without reach makes the vote castable by NOBODY,
   because a bearer token would stamp as a machine and be refused with no session
   route to replace it. An array is what makes the two halves impossible to ship
   apart: it is spread into BOTH of `SESSION_OPS`' sets below, it is a disjunct
   of the `by` stamp's condition, and it is the operator fence's subject — so a
   later hand adding a fourth governance verb gets all three at once or none.
   Why BOTH sets rather than the admin one is argued at the spread itself, where
   a reader meets it: `SESSION_OPS.admin` means the FOUNDER'S session alone, and
   §4.7 gives these acts to every administrator.
   `membercaps` rides with the two votes rather than beside the roster ops:
   §4.9 makes setting capabilities a custodial act over MEMBERSHIP, §5 says an
   administrator's own field is not editable at all (4.4 defeated by arithmetic
   otherwise), and the store refuses that case by name. It is the same
   bearer-only state and the same fix.
   NOT `memberadd`/`memberset` — CORRECTED 2026-09-21 by REC-156, because only one
   of this sentence's three clauses was true. It read: *"they already hold session
   reach, they take their own `by` at the store, and widening this array to them
   would be a reach change wearing this item's costume."* `memberSet` takes NO `by`
   at all, and `memberadd`'s session reach is the FOUNDER'S alone (`SESSION_OPS.admin`
   — this block's own measurement). Its `by` WAS the caller's: the §4.7 forgery this
   array closed for three ops, alive in a fourth. REC-156 stamps it by its OWN
   disjunct on the `by` stamp, NOT by joining this array — and the reason is the
   clause that stays true: this array also spreads MEMBER-set reach and the operator
   fence, and moving either is a reach change and a refusal nobody ruled. The stamp
   site says what was decided about a bearer, and that it is provisional. */
const GOVERNANCE_ACTIONS = listed(["adminendorse", "adminremove", "membercaps"]);
/* REC-164 / Publication §7 points 2 and 3: the group's display name and its domain claim are set by an
   administrator's session, with `by` stamped by the server "as for the Membership v2 §4 governance acts". A SET OF
   ITS OWN rather than three more names in `GOVERNANCE_ACTIONS`, because that array's fence carries C-32.17, whose
   canned sentence names the §4 votes and the capability edit — it would be FALSE here (D-270's class). Same shape:
   both session sets (an enrolled administrator holds `member:<id>`, so the admin set alone is the founder alone),
   a fence that refuses any caller who did not arrive by a session, and a `by` stamp the store asks the roster. */
const IDENTITY_ACTIONS = listed(["groupnameset", "groupdomainset"]);
/* REC-159 — §4.9's CUSTODIAL ACTS, AND EACH IS EVERY ADMINISTRATOR'S. `BIO_Membership_Architecture_v2.md`
   §4.7's block *"WHAT IS STILL NOT CLOSED"* named this fix and REC-156 measured the defect: the four sat in
   `SESSION_OPS.admin` alone — the FOUNDER'S password session — so an enrolled administrator was refused
   them with a sentence calling the op an administrator's, which she IS. D-136's call, applied again, in
   three halves that ship together or not at all:
     (1) REACH — spread into BOTH `SESSION_OPS` sets, and `member` in each OPS row's `classes`, because an
         enrolled administrator's `kind` is `member` however her roster row reads;
     (2) THE STAMP — a disjunct of the `by` stamp, so the SERVER names who acted, and the store's relays
         read `by` from the query over anything in the body;
     (3) THE ROSTER — each owning module's method (membership's for `memberadd` and `memberset`, credentials'
         `#custodialBar` for `signeradd` and `signerset`) refuses a member-named `by` that is not an ACTIVE
         administrator, NOT_AN_ADMIN, before it looks anything up.
   Reach without the roster would hand an ordinary member the roster; the roster without the stamp would
   let a caller name somebody who passes it.
   **NOT `GOVERNANCE_ACTIONS`, and that is the one call this array exists to make.** That array also
   carries the operator fence (C-32.17), and BOB #22 RULED that an operator's bearer keeps reaching these
   four, its `by` stamped `class:<cls>` and naming no person. So the bearer route is bounded by each row's
   `machineClasses` instead — `admin` and `probe`, the classes it held before — which keeps the
   MEMBER_TOKEN bearer and an `ai` credential out exactly as they were. */
const CUSTODIAL_ACTIONS = listed(["memberadd", "memberset", "signeradd", "signerset"]);
/* N43 (T4) — membership's R10, R11 and R19, each a named person's own act on the roster: an administrator resigning
   (never the founder, whom the store answers ROOT_OF_TRUST), an administrator recording who holds hosting access,
   and a member (or an administrator) choosing whether a pairing is published. REC-159's three halves: REACH in both
   `SESSION_OPS` sets, THE STAMP (`by` set by the server, read by the store from the query after the body), and THE
   ROSTER (the store refuses NOT_AN_ADMIN or PAIRING_NOT_YOURS). A SET OF ITS OWN rather than more names in
   `GOVERNANCE_ACTIONS` or `CUSTODIAL_ACTIONS`: the first carries the operator fence, whose C-32.17 sentence names
   the §4.7 votes and would be false here (D-270's class), and the second's `by` condition is one expression at the
   stamp site. A bearer stamps `class:<cls>`, which is on no roster, so the store refuses it. */
const ROSTER_SELF_ACTIONS = listed(["adminresign", "hostingaccessset", "memberpairingset"]);
/* N364 (membership R89, R90): a member's own attesting key, registered and revoked from their own session. Its own set
   for ROSTER_SELF_ACTIONS' reason: REACH in both `SESSION_OPS` sets (every bearer is refused by the rows'
   `machineClasses`), and THE STAMP, `by` from the session, read by membership from the query after the body. */
const OWN_KEY_ACTIONS = listed(["signerregister", "signerrevoke"]);
/* N364 (capture R65, R68, R69): the pull, a late co-attestation and a capture's signed account, each a member's act in
   their own name, `by` stamped and read by capture from the query first; in both session sets. T22 (K1023; capture
   R79, R81; R9): setting a held capture aside and restoring it join them, `by` stamped for the same reason (capture
   reads `by` from the query before `author`). */
const CAPTURE_MEMBER_ACTIONS = listed(["inboxpull", "reattest", "captureaccount", "heldsetaside", "heldrestore"]);
/* T22 (K1023, K1037; capture R76, R77, R79–R81; R9): the capture ops that answer by the caller's sight, so `viewer` is
   stamped on each (capture reads it from the query; an unstamped call sees nothing): the two held acts, and the held
   list, the grade note and the doorbell's tally. In both session sets. */
const CAPTURE_VIEWER_ACTIONS = listed(["heldsetaside", "heldrestore"]);
const CAPTURE_READS = listed(["heldcaptures", "gradenote", "doorbelltally"]);
/* N364 (sources R2, R6, R7): a member's record of a source's disclosure, link claim, consent and its withdrawal, `by`
   stamped and read by sources from the query after the body; in both session sets. */
const SOURCE_ACTIONS = listed(["sourcedisclose", "sourcelink", "sourceconsent", "sourceconsentwithdraw"]);
/* N364 (sources R1, R5, R9): the reads that answer by the caller's sight, `viewer` stamped. */
const SOURCE_READS = listed(["sourceof", "sourcerung", "sourcereadlog"]);
/* REC-155 — `BIO_Membership_Architecture_v2.md` §4.10 (RULED by BOB #19, 2026-09-21): five of the seven ops
   that no session reached and no decision explained JOIN BOTH SESSION SETS. Both sets for D-136's reason at
   the spread below: `SESSION_OPS.admin` is the FOUNDER'S session alone, and none of the five is the founder's.
   THE PROVENANCE PAIR: their OPS rows call the act *"a named member's judgement"*, and a signed-in session is
   the one caller that carries a name — the `author` stamp already names `sessMember` on the session route.
   The bearer WRITE route closes in §4.10's SECOND landing (REC-158), not here: this one refuses nobody. */
const PROVENANCE_JUDGEMENT_ACTIONS = listed(["provenancechain", "provenanceroute"]);
/* THE CALIBRATION WRITES: their OPS row rules that the fence is NOT who may measure but that a measurement
   never moves a GRADE (`CAL_CANNOT_REGRADE`), so a person measures on the same terms as a probe, and the
   bearer route stays — a scheduled re-probe is a machine act by construction. */
const CALIBRATION_WRITE_ACTIONS = listed(["calibrate", "calibrationsubject", "calibrationsignal"]);
/* Section 1.3. Both are in the MEMBER set: a member declares their own, and a
   member reaching confirm is refused by the store with NOT_AN_ADMIN, which says
   what is wrong. Putting confirm in the admin set alone would answer "requires a
   machine credential", which is true of neither the caller nor the rule. */
const EXPERTISE_ACTIONS = listed(["expertisedeclare", "expertiseconfirm"]);
/* CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY actions. Members BUILD the
   registry — register a subject, alias it, declare a constitutive relation — and
   READ it by key, by alias, and by relation id. Named as one set, in both the member
   and admin lists, so the two cannot drift apart (the class of defect this repository
   keeps finding). The three WRITES are stamped with the declaring member below, like
   the expertise actions: a declared relation is a member's constitutive statement,
   and who declared it is part of the record. The reads take no viewer stamp: they key
   on an entity id, an alias and a relation id, not on the corpus view.
   REC-65 / DEC-52: "Members BUILD the registry" is now *members AND machine credentials
   build it*. Bob ruled 2026-08-07 that the machine may rule, and nothing here ever refused
   one — the code was the right half and this sentence was the wrong one. A machine's entry
   carries `class:<cls>` where a member's carries their id, so who built what stays legible.
   The reasoning is at the FW-6 stamp site and deliberately not copied here. */
/* T5-11 (entities R8): the two withdrawals join the set, stamped with the withdrawing member as the three writes are
   with the declaring one. */
/* N345 (entities R38): the defect report joins the set, stamped with the reporting member as the writes are. */
const REGISTRY_ACTIONS = listed(["entitycreate", "entityalias", "relationdeclare", "aliaswithdraw", "relationwithdraw",
                          "resolutiondefect", "entity", "entitybyalias", "relation"]);
/* D-98, the TASK construct's two member verbs. Forwarding and resolving a task
   are MEMBER actions performed by a PERSON through their session — the construct
   makes them a human judgement, and the record's whole point is that who
   resolved or forwarded a task is that member's own act. They were reachable
   only by a machine credential, which left the browser half unreachable: the
   `recPost("taskresolve", …)` a signed-in member fires from the Tasks screen was
   answered "requires a machine credential". They belong in BOTH session lists
   for the same reason the edge and state actions do (REC-4). The actor is
   stamped server-side from the session below, so a browser can never sign a
   forward or a resolution as somebody else, and the store's TASK-ACTOR FENCE
   (`#refuseNotYours`, NOT_YOURS) refuses a member who is neither the assignee
   nor an admin — the enforcement UI-1 delegated as cosmetic. */
const TASK_ACTIONS = listed(["taskforward", "taskresolve"]);
/* REC-21: the queue's PERSONAL writes. They are MUTATING, so SESSION_OPS is what
   actually lets a member session reach them, and they are in BOTH lists for the
   same reason every other member surface is: an administrator is a member too.
   Kept as their own array rather than folded into TASK_ACTIONS because they are
   the OTHER doctrine — a task act changes the record for everyone, and these
   change nothing for anyone but the member who made them. Naming them together
   would be the first step toward one control. */
const QUEUE_ACTIONS = listed(["queuemute", "queuesnooze"]);
/* IS-6: the investigative run's three WRITES. Its two reads are not here, for
   the reason stated on QUEUE_ACTIONS above: SESSION_OPS gates MUTATING ops alone
   (admission's session gate passes every read), so a read needs no place in it.
   Named as one array rather than folded into an existing set because a run is
   neither a task act (it changes nothing for anyone else yet) nor a personal
   preference (it spends the group's Claude budget and will propose versions to
   the record). Naming them together would be the first step toward one control
   over two different doctrines — the same reason QUEUE_ACTIONS was kept apart
   from TASK_ACTIONS. */
/* PL-4 joins `capturerequest` and NOT `capturerequestdrain`, and the split is
   the item: the door is a SESSION's act (the run asks, under a member's session
   or a machine credential's class), and the drain is the DAEMON'S — a member
   reaching for it by hand would be a person doing the daemon's job with the
   daemon's conduct rules applied to them. `taskenqueue`/`taskdrain` draw the
   same line one door over, and `taskenqueue` is not in OPS at all for the same
   reason `capturerequestdrain` is not in this list. */
const AI_RUN_ACTIONS = listed(["airunopen", "airuntick", "airunclose", "suggest", "capturerequest",
                        /* SK-8: the EXTRACT role's production is an ACT OF A RUN
                           (§7.3 (2)), and it is named here for the reason
                           `suggest` and `capturerequest` are — this array says
                           WHAT KIND OF ACT an op is and carries it into the
                           member and admin class sets as one entry rather than
                           two literals. IT IS NOT THE GATE, and that is worth
                           saying because a reader could take it for one: nothing
                           in this array checks that a run exists. The refusal for
                           a production with no live run is the STORE's
                           (`extractPropose`: NO_RUN, NO_SUCH_RUN,
                           RUN_NOT_RUNNING, NOT_AN_EXTRACT_RUN), where the run
                           object is, which is the only place that can see it.
                           The READ is deliberately absent: reading what a run
                           proposed is not a production, and a member reviews
                           proposals without holding a run at all. */
                        "extractpropose",
                        /* REC-147: the judgement's candidates are an act OF A RUN, for extractpropose's reason; the
                           run is checked at the store (C-93.2, C-93.3), not here. */
                        "contradictionpropose",
                        /* N345 (contradiction R37): the run's recommendation, for `contradictionpropose`'s reason. */
                        "contradictionrecommend"]);
/* PL-18 / DEC-63 — THE THREE RUN VERBS, AS THEIR OWN LIST, because Bob's
   ruling is about exactly these three and not about the array above them.
   `AI_RUN_ACTIONS` also carries `suggest` and `capturerequest`, which are acts
   a run performs rather than the act of running, and neither is gated on
   project participation: PL-3 and PL-4 settled their capabilities on their own
   grounds and DEC-63 does not reach them. Writing the three as one named list
   rather than as three literals at the stamp site is the same discipline
   `QUEUE_ACTIONS` and `PROJECT_ACTIONS` keep — a fourth run verb should join
   the gate by being added here, not by somebody remembering. */
const RUN_VERB_ACTIONS = listed(["airunopen", "airuntick", "airunclose"]);
/* REC-165 (INVESTIGATIVE-SESSION.md §11 item 5, rule 1, BOB #25): THE RUN'S PRODUCTIONS. A production names
   a run, and the run is what the production is READ AGAINST (its lens, bar, skill version and principal), so the
   store asks that the run is one the CALLER holds — REC-152's `runPrincipalGate`, fed by REC-152's ONE `principal`
   stamp expression, which this list EXTENDS and nothing else of the run verbs' does: not the `actor` stamp (PL-18
   measured its blast radius) and not DEC-63's project gate.
   REC-168 (BOB #28, 2026-09-22, the `op=capturerequest` paragraph of §11 item 5): `capturerequest` JOINS — a request
   that names a run is a production of that run, so it takes the same stamp and the store asks sight, then
   `runPrincipalGate`, then status, and records the CALLER's principal on the row. It is the ONE list extended, not a
   second stamp condition beside it. Rule 1's TARGET does not reach it (a request names an address, not a question). */
/* REC-147 JOINS: a candidate names a run, is read against it, and takes the same principal stamp. */
/* N345 (contradiction R37) JOINS: a recommendation names a run and is compared with its principal, as a candidate is. */
const RUN_PRODUCTION_ACTIONS = listed(["suggest", "extractpropose", "capturerequest", "contradictionpropose", "contradictionrecommend"]);
/* REC-134 / C-56: the acts that change a project and read the POSITIONAL `identity` stamp for
   the store's `#projectAuthority` check (SIGHT IS NOT AUTHORITY, Membership v2 §7). `op=promote`
   carries the same stamp in its body as `actorIdentity`. The stamp site says why. */
/* REC-136 adds `withdrawconclusion`: it writes the project's own conclusion record, so it is conclude's position. */
/* D-722 (T5-11, connections R27) adds `linkproject`: edges it hangs on a PROJECT's source bundle are that project's,
   so it is cite's position. Its handler stamps the identity itself (it returns above the stamp site); listed here so the
   set of positional acts is read in one place. */
const POSITIONAL_ACTS = listed(["cite", "sever", "reinstate", "versioncurrent", "proposedispose", "biasadopt", "conclude",
                         "withdrawconclusion", "linkproject"]);
/* PL-12 / D-84: the bias object's ONE write. `op=biasmanifest` and
   `op=biasinhale` are not here for the reason restated on AI_RUN_ACTIONS above —
   SESSION_OPS gates MUTATING ops alone — and `op=biasinhale` in particular is
   non-mutating BY RULING rather than by shape (DEC-54 c: it proposes and never
   installs), so its absence from this array is the third place that fact is
   enforced and not a fourth place it is merely stated.
   ONE-MEMBER ARRAY, ON PURPOSE, and kept apart from every existing set for the
   reason QUEUE_ACTIONS was kept apart from TASK_ACTIONS: adoption is its own
   doctrine — an authored, attributed act that puts a LENS over a group's work —
   and folding it into a neighbouring array would be the first step toward one
   control over two different things. It is in BOTH lists because an
   administrator is a member too, and because the doctrine puts instance bias
   with the admins and project bias with the project managers, who are members. */
const BIAS_ACTIONS = listed(["biasadopt"]);
/* REC-207 (BOB #32, 2026-09-23 23:42Z): SETTLING A BIAS-DEBT OBLIGATION, which is a MEMBER's act through
   their session and nothing else. `op=biasdebt` is not here for the reason restated on BIAS_ACTIONS above —
   SESSION_OPS gates MUTATING ops alone — and this array is the third place the resolve's member-only nature
   is enforced rather than a fourth place it is stated: the OPS table admits no probe class, this list is what
   a signed-in session actually reaches, and the store refuses a machine BY SHAPE.
   ITS OWN ARRAY, on BIAS_ACTIONS's and QUEUE_ACTIONS's reasoning: adopting a lens and answering the debt a
   lens change left are two different doctrines, and one control over both is how they come to drift.
   WITHOUT THIS LINE THE DOOR DOES NOT EXIST FOR A PERSON — measured on this item's first suite run, where a
   signed-in member's resolve was answered SESSION_ROUTE_NOT_RECORDED, D-270's honest "no session reaches
   this and no decision says why". It is in BOTH lists because an administrator is a member too. */
const BIAS_DEBT_ACTIONS = listed(["biasdebtresolve"]);
/* T6-13 (intent R2, R8–R11, R16, R18): INTENT's ten acts, as ONE array for the reason every array here is one — they
   share a stamp (`author`, in the body), a capability (`contribute`) and both session sets, and a list written out in
   four places is the drift that made DISPOSITIONS one array. Its own array and not STATE_ACTIONS: they move no bundle
   state through the selection path and would inherit an `owner` stamp and a viewer-gated set shape they do not have. */
const INTENT_ACTIONS = listed(["objectivecondition", "goaldeclare", "goallink", "goalclose", "aspirationdeclare",
                        "aspirationdepart", "aspirationdeadend", "aspirationretire", "triage", "workobjective"]);
/* T6-13 (intent R3–R6, R12–R15): its seven reads, every one stamped with the viewer (intent R23). */
const INTENT_READS = listed(["objectiveprogress", "objectivegaps", "goal", "aspirations", "aspirationcontacts", "pursuit",
                      "intentproposals"]);
/* T6-13 (reevaluation R15, R16): a member's three acts on a reference they hold, stamped `author` in the query, where
   reevaluation reads it after the body. */
const REEVALUATION_ACTIONS = listed(["versionadopt", "versionkeep", "reevaluationrecord"]);
/* T8 (layer 9, K248, K250): the action layer's acts and reads, one array each per module, for the reason every array
   here is one — they share a stamp, a capability and both session sets. `STANDARDS_ACTIONS` take their stamp in the BODY
   (`author`, or `proposer` for the proposal), where standards reads it; the others read `author` from the QUERY, after
   the body. Every read is stamped with the viewer. */
const STANDARDS_ACTIONS = listed(["standarddeclare", "standardpropose", "standardadopt"]);
const STANDARDS_READS = listed(["standard", "standards", "standardinforce"]);
const CONFORMANCE_ACTIONS = listed(["determine", "comparisonpropose"]);
const CONFORMANCE_READS = listed(["determination", "determinations", "comparison", "comparisonfacts"]);
const CONSEQUENCES_ACTIONS = listed(["consequencerecord", "consequencerevise", "addressedrecord"]);
const CONSEQUENCES_READS = listed(["consequence", "consequencesof", "addressed"]);
/* T18 (N-A12, K705): filings' communication (R23) and template (R26) acts read `author` from the query as its other
   acts do (the communication's preparer is that stamp), and the template read is viewer-stamped. */
const FILINGS_ACTIONS = listed(["filingprepare", "filingapprove", "filingsent", "counselpacket", "counselpacketexport",
                         "theorypropose", "communicationprepare", "templatesave"]);
const FILINGS_READS = listed(["counselpacketread", "filingsfor", "availableactions"]);
/* T21 (K921, K927): the template library's member acts (filing-templates R3, R4, R7, R8, R10, R11), one array for the
   reason every array here is one. filing-templates reads `author` from the QUERY for each (as its `by` where its R says
   `by`), so the array joins `QUERY_AUTHOR_ACTIONS` below and takes that stamp's positional identity; `viewer` beside it.
   The library's list moved here from `FILINGS_READS` with its owner (filing-templates R14). */
const FILING_TEMPLATES_ACTIONS = listed(["templatedraft", "templaterevise", "templatesubmit", "templatereviewgrant",
                                  "templategrantrevoke", "templateapprove", "templateretire"]);
const FILING_TEMPLATES_READS = listed(["templates"]);
/* filing-templates R6: a proposal is any credential's and names its PROPOSER, the label (`proposalLabel`), not an
   author; its own array, `PLAN_PROPOSAL_ACTIONS`' reason. */
const TEMPLATE_PROPOSAL_ACTIONS = listed(["templatepropose"]);
/* filing-templates R8, R9, R12–R14: the review grant's doors (`classes: null`). A member arrives by session and is
   stamped `author` and `viewer`; a recipient arrives by the grant's secret, which the door hashes into `secretSha`
   (control-plane R44), as `reviewcopy` and `reviewcomment` do. */
const TEMPLATE_DOOR_ACTIONS = listed(["templatereview", "templatecomment"]);
const TEMPLATE_DOOR_READS = listed(["templateread", "templatecomments"]);
/* control-plane R44: the acts that issue a revocable door to a named outsider. The door mints the secret, stamps only
   its SHA-256 as `secretSha` (a caller's copy overwritten) and hands the secret back once. */
const GRANT_SECRET_ACTIONS = listed(["reviewgrant", "templatereviewgrant"]);
/* T21 (K921; local-facts R1, R2, R4): the member's act on a profile fact, stamped `by` (local-facts reads it from the
   body, so the door overwrites a caller's copy there), and the two reads, viewer-stamped. */
const LOCAL_FACTS_ACTIONS = listed(["factconfirm"]);
const LOCAL_FACTS_READS = listed(["factstatus", "factsdue"]);
/* T22 (K1019, J3; escalation R27, R28; R9): `declinetoescalate` joins escalation's acts, `escalationopen`'s place, so its
   `author` is query-stamped and its `viewer` stamped; `escalationstatus` joins the reads, `escalationsdue`'s place. */
const ESCALATION_ACTIONS = listed(["escalationopen", "escalationattach", "escalationevaluate", "escalationadvance",
                            "escalationdecline", "escalationend", "escalationsuspend", "escalationresume",
                            "declinetoescalate"]);
/* T23 (N485: K1025; escalation R29; R10): `escalationreasondraft` joins the reads, `escalationstatus`' place, viewer-stamped. */
const ESCALATION_READS = listed(["escalation", "escalationsdue", "escalationstatus", "escalationreasondraft"]);
/* T18 (N-A12, K704, K709, K711): the action layer's new modules, one array each, for the reason every array here is
   one. Each act reads `author` from the QUERY after the body and asks membership of it (a joined member's act, or the
   member whose reminder it is), so each joins `QUERY_AUTHOR_ACTIONS` and takes that stamp's positional identity; every
   read is stamped with the viewer. `actions`' two acts are `ACTIONS_ACTIONS`, apart from REC-24's `ACTION_ACTIONS`,
   whose stamp is a different expression. T20 (K902; actions R52): `actionhold` joins them, its author query-stamped.
   T27 (N518; actions R56–R58; R12): `actionholdrelease` joins them beside `actionhold`, and the release's preview and the
   held-project read join the reads, viewer-stamped. */
const ACTIONS_ACTIONS = listed(["actioncreate", "actionpressure", "actionhold", "actionholdrelease"]);
const ACTIONS_READS = listed(["action", "actions", "actionholdpreview", "projectholds"]);
const ACTION_CLOCKS_ACTIONS = listed(["reminderset", "reminderanswer"]);
const ACTION_PLANS_ACTIONS = listed(["planopen", "plansubjectadd", "plansubjectremove", "optionadd", "optionrevise",
                              "optionadopt", "optiondispose", "scenarioset", "checkpointrecord", "optionstart",
                              "planclose"]);
const ACTION_PLANS_READS = listed(["plan", "plans", "planproposals"]);
/* T24 (N490, DEC-115; action-plans R37; R11): the start preview, a read that answers what `optionstart` would do. It
   reads `author` from the QUERY after the body, as `optionstart` does, and must be asked as the very caller the start
   would be (the same positional identity, so the same fences answer), so it joins `QUERY_AUTHOR_ACTIONS` below and,
   through it, the action layer's viewer stamp. Its own array because it writes nothing: it is no act. */
const ACTION_PLANS_PREVIEWS = listed(["optionstartpreview"]);
/* action-plans R11, R31: a proposal is any credential's, and it names its PROPOSER, which action-plans reads from the
   query (`proposer`, not `author`) both as the proposal's label and as the caller its planning run's principal is
   compared with; viewer-stamped beside it. Its own array because its stamp is not the acts' `author`. */
const PLAN_PROPOSAL_ACTIONS = listed(["optionpropose"]);
/* N345 (contradiction R30–R36, R51, R53): the six member acts on a candidate, one array for the reason every array here is
   one — they share a stamp (`author`, the POSITIONAL identity, read from the query after the body, the expression the
   action layer's acts take below, because contradiction hands it to promotion as `actorIdentity` and asks membership of
   it), a capability and both session sets. The five reads beside them are viewer-stamped. */
const CONTRADICTION_ACTIONS = listed(["contradictiondismiss", "contradictionclarify", "contradictiontakeup", "contradictionresolve",
                               "contradictionoptin", "contradictionrespond"]);
const CONTRADICTION_READS = listed(["contradictioncandidates", "contradictiontensions", "contradictionfacts", "contradictionnotices",
                             "contradictionresponses"]);
/* T22 (K1019; monitoring R52; R9): an address's own frequency, a source owner's act; monitoring reads `author` (bare or
   positional) and `viewer` from the query, so it joins `QUERY_AUTHOR_ACTIONS` below, and with it the action layer's
   viewer stamp. Its own array, one per module, for the reason every array here is one. */
const MONITORING_ACTIONS = listed(["addressfrequencyset"]);
/* T23 (K1094; R10), link-sweep's since T24 (its R9; N506): the sweeps read, viewer-stamped (link-sweep's ops map reads
   `viewer` from the query); it joins `ACTION_LAYER_READS` below as monitoring's act joins the action layer's acts, so the
   same stamp reaches it. Its own array, its owner's, for the reason every array here is one. */
const LINK_SWEEP_READS = listed(["sweeps"]);
/* T23 (N485: K1025, K1035; case-authoring R39; R10): a draft of what changed names its PROPOSER (the label,
   `proposalLabel`), `TEMPLATE_PROPOSAL_ACTIONS`' kind of stamp, under the name case-authoring reads it as, `proposedBy`
   (its ops map takes it from the query's `author`); `viewer` beside it. The drafts' read is viewer-stamped. Their own
   arrays, one per module, for the reason every array here is one. */
const WHAT_CHANGED_PROPOSAL_ACTIONS = listed(["whatchangedpropose"]);
const WHAT_CHANGED_READS = listed(["whatchangeddrafts"]);
/* T23 (DEC-111, K1100; network-notices R1, R2, R4, R5, R22, R23; R10): the notice's one act and its three reads, each
   viewer-stamped (network-notices asks the project's sight of it); `NETWORK_NOTICES_BY` names the two an owner performs
   in their own name, prepare and post, `by` stamped (network-notices reads `by` from the query, else `author`). The
   public reads network-notices registers with public-read (its R10, R20, R21) stamp nothing. */
const NETWORK_NOTICES_ACTIONS = listed(["noticepost"]);
const NETWORK_NOTICES_READS = listed(["noticeprepare", "notices", "directorysubmission"]);
const NETWORK_NOTICES_BY = listed(["noticeprepare", "noticepost"]);
const NETWORK_NOTICES_PUBLIC_READS = listed(["activitymethod", "noticespublic", "groupkeyspublic"]);
/* T27 (N520; DEC-116, DEC-100; docket R1–R8, R12, R14, R15; R13): the docket's four acts and three reads, each
   viewer-stamped (docket asks the case's project's sight of it; its map reads `viewer` from the query); `DOCKET_AUTHOR`
   names the two any joined member performs, filing and marking a threat, `author` stamped; `DOCKET_BY` the three only the
   manager performs in their own name, preparing, posting and declining, `by` stamped (docket's map reads each from the
   query, `by` else `author`). The public shelves and the feed (public-read R21) stamp nothing. One array per stamp, the
   network notices' shape. */
const DOCKET_ACTIONS = listed(["docketfile", "docketpressure", "docketdecline", "docketpost"]);
const DOCKET_READS = listed(["docket", "docketprepare", "docketinvitation"]);
const DOCKET_AUTHOR = listed(["docketfile", "docketpressure"]);
const DOCKET_BY = listed(["docketprepare", "docketdecline", "docketpost"]);
const DOCKET_PUBLIC_READS = listed(["docketpublic", "docketfeed"]);
/* T28 (N520, N522; case-import R1–R8; R14): case-import's six acts and two reads, each viewer-stamped (case-import asks
   whether the viewer is an active member; an unstamped read is answered as if no import exists); `CASE_IMPORT_BY` names
   the six a member performs in their own name, `by` stamped (case-import's map reads `by` from the query, else
   `author`). One array per stamp, the docket's shape. `publish` and `publishpreflight` gain nothing here: `flagsDisclosed`
   (case-authoring R52, R53) is a body field the handler reads as given, as `tensionsDisclosed` is, never a stamp.
   case-checker's two public reads (its R15) stamp nothing. */
/* T31 (N534; case-import R17; R16): the watch and its lifting join the acts, `by` and `viewer` stamped as the rest. */
const CASE_IMPORT_ACTIONS = listed(["caseimport", "caseimportdocument", "importaccept", "importacceptwithdraw",
                                        "importflag", "importflagclear", "importwatch", "importunwatch"]);
const CASE_IMPORT_READS = listed(["importedcases", "importedcase"]);
const CASE_IMPORT_BY = listed(["caseimport", "caseimportdocument", "importaccept", "importacceptwithdraw",
                                   "importflag", "importflagclear", "importwatch", "importunwatch"]);
const CASE_CHECKER_PUBLIC_READS = listed(["casechecker", "casefilespec"]);
/* T31 (N528; wizard-scripts R3–R16; R15): one array per stamp, the docket's shape. `WIZARD_SCRIPTS_ACTIONS` are the
   viewer-stamped acts (wizard-scripts asks the viewer's sight of a script); `WIZARD_SCRIPTS_AUTHOR` names the three an
   author performs, `author` stamped (its R3, R4, R6); `WIZARD_SCRIPTS_BY` the four an approver or administrator performs
   in their own name, `by` stamped (its R7–R9); `WIZARD_PROPOSAL_ACTIONS` the proposal, which names its PROPOSER, the
   label (`proposalLabel`), `TEMPLATE_PROPOSAL_ACTIONS`' kind of stamp, with `viewer`. `WIZARD_PROGRESS_ACTIONS` stamps
   NOTHING: the tally keeps no member, viewer or identity (its R15; control-plane R50), so the door passes none. The five
   reads are viewer-stamped; the check (its R12) is pure over the registration and stamps nothing. */
const WIZARD_SCRIPTS_ACTIONS = listed(["wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove", "wizardretire",
                                           "wizardpropose"]);
const WIZARD_SCRIPTS_AUTHOR = listed(["wizarddraft", "wizardrevise", "wizardsubmit"]);
const WIZARD_SCRIPTS_BY = listed(["wizardapprove", "wizardretire", "wizardeditorgrant", "wizardeditorrevoke"]);
const WIZARD_PROPOSAL_ACTIONS = listed(["wizardpropose"]);
const WIZARD_PROGRESS_ACTIONS = listed(["wizardprogress"]);
const WIZARD_SCRIPTS_READS = listed(["wizards", "wizardread", "wizardsat", "wizarduse", "wizardcandidates"]);
const WIZARD_CHECK_READS = listed(["wizardcheck"]);
/* The modules whose acts read `author` from the query: the four of T8, T18's three, T21's filing-templates and T22's
   monitoring act; and T24's start preview, the one read among them, stamped as the start it previews (R11). */
const QUERY_AUTHOR_ACTIONS = listed([...CONFORMANCE_ACTIONS, ...CONSEQUENCES_ACTIONS, ...FILINGS_ACTIONS, ...ESCALATION_ACTIONS,
                              ...ACTIONS_ACTIONS, ...ACTION_CLOCKS_ACTIONS, ...ACTION_PLANS_ACTIONS, ...FILING_TEMPLATES_ACTIONS,
                              ...MONITORING_ACTIONS, ...ACTION_PLANS_PREVIEWS]);
/* The action layer's acts and reads, each viewer-stamped (fail closed); T22's monitoring act rides in through
   `QUERY_AUTHOR_ACTIONS`, viewer-stamped as they are. T21 adds the template proposal and the fact
   confirmation, whose stamps are their own (`proposer`, `by`), and the two modules' reads. The grant's doors are not
   here: a recipient arrives with no session, so no viewer. */
const ACTION_LAYER_ACTIONS = listed([...STANDARDS_ACTIONS, ...QUERY_AUTHOR_ACTIONS, ...PLAN_PROPOSAL_ACTIONS,
                              ...TEMPLATE_PROPOSAL_ACTIONS, ...LOCAL_FACTS_ACTIONS]);
const ACTION_LAYER_READS = listed([...STANDARDS_READS, ...CONFORMANCE_READS, ...CONSEQUENCES_READS, ...FILINGS_READS,
                            ...ESCALATION_READS, ...ACTIONS_READS, ...ACTION_PLANS_READS, ...FILING_TEMPLATES_READS,
                            ...LOCAL_FACTS_READS, ...LINK_SWEEP_READS]);
/* K660 (agent-worker R51, R53; K683): WHAT A PLAN-MODE RUN'S AGENT CREDENTIAL IS SCOPED TO. An agent credential is
   admitted by its task scope alone (R2): it reaches a non-mutating op a member reaches, and a mutating one only when its
   declared writes name it (`admission`). So a planning run's credential reads its plan, the project's earlier plans and,
   for each subject, the reads agent-worker R51 names through the ops declared for them, and its declared writes are its
   one production, `optionpropose`, with the run's own tick and close. Every op here admits `member` and carries no
   `machineClasses`, which is what makes it reachable by such a credential at all. */
const PLAN_RUN_SCOPE = Object.freeze({
  reads: listed(["plan", "plans", "determination", "standard", "consequencesof", "availableactions",
                     "publishededitions", "profiles"]),
  writes: listed(["optionpropose", "airuntick", "airunclose"]),
});
/* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISER actions. A member RESOLVES a
   captured document's references to registry entities (resolve), TESTIFIES a grade-D
   connection (resolvetestify), and READS the resolutions of a document (resolutions)
   and the reverse index for an entity (concerns). Named as one set in both the member
   and admin lists so the two cannot drift apart. The two WRITES are stamped with the
   resolving member below, like the registry writes: who resolved or testified is part
   of the record. The reads take no viewer stamp — they key on a capture sha and an
   entity id, not on the corpus view. */
const RECOGNISER_ACTIONS = listed(["resolve", "resolvetestify", "resolutions", "concerns"]);
/* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA and the PROGRESSION DEFINITION
   as data. A member DERIVES the connections among the documents concerning an entity
   (connect) and READS them (connections), and AUTHORS a progression definition
   (progressiondefine) and READS one (progression). Named as one set in both the member
   and admin lists so the two cannot drift apart. The two WRITES are stamped with the
   declaring member below, like the registry and recogniser writes: a progression
   definition is a member's claim about how an institution ought to behave (framework
   §8.1), and who derived a connection is part of the record. The reads take no viewer
   stamp — they key on an entity id, a capture sha and a progression key.
   CONSTRUCTS Step 5, SLICE B (FW-9) extends the set: a member THREADS real documents into a
   progression instance (thread — stamped with the threading member below, like the writes
   above) and READS the instance (instance — no viewer stamp, keyed on progression key and
   entity id). Named here so the member and admin lists cannot drift apart.
   CONSTRUCTS Step 5, SLICE C (FW-10) extends it again: a member DISCHARGES a lawful skip by
   recording an exception document (discharge — stamped with the declaring member below) and
   READS the raw discharges (exceptions — no viewer stamp, keyed on progression key + entity id).
   REC-6 extends it once more with a READ: `proposals` is the DISCOVERY feed — a read-time walk of
   every progression instance for its missing-predecessor findings, D-79-aggregated. Ungated like
   the other progression reads (no viewer stamp, keys on nothing — it enumerates the whole record's
   derived questions), named here so the member and admin lists cannot drift apart.
   REC-7 adds a WRITE: `proposedispose` records a member's DEFER/DISMISS of a derived proposal
   (stamped with the deciding member below, like the other progression writes) — WITHOUT minting a
   bundle (D-79: declining is not authoring). op=proposals then ages the disposed proposal out of
   the open feed. Named here so the member and admin lists cannot drift apart.
   REC-9 adds a READ: `captureprogressions` is the per-document lookup — it maps a CAPTURE back to the
   progression instances it is threaded into, its stage in each, and each instance's missing-predecessor
   + overdue-successor findings (the same ONE derivation op=proposals reads, keyed by capture). Ungated
   like the other progression reads, named here so the two lists cannot drift apart.
   REC-65 / DEC-52 CORRECTS THE ACTOR IN EVERY SENTENCE ABOVE, and it is one correction rather
   than five: where this block says a MEMBER authors a progression definition, threads an instance
   or discharges a skip, read *a member OR a machine credential*. Bob ruled 2026-08-07 that the
   machine may rule; nothing here ever refused one, and DEC-52 settles that the CODE was right and
   this prose was wrong. Who acted is recorded either way — `class:<cls>` for a machine, never a
   person's name — so the two remain distinguishable claims. The full reasoning, and the four
   things the ruling carries with it, are at the FW-6 stamp site in the request path; it is not
   restated here, because a ruling copied into two files is a ruling that will disagree with
   itself. `proposedispose` is the EXCEPTION and is NOT covered — see its own site. */
const PROGRESSION_ACTIONS = listed(["connect", "connections", "progressiondefine", "progression",
                             "thread", "instance", "discharge", "exceptions", "proposals",
                             "proposedispose", "captureprogressions"]);
const SESSION_OPS = Object.freeze({
  member: frozenSet(withAliases(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   /* CASE-5b: signing the CASE DOCUMENT, beside signing a finding.
                      A session op for `ratify`'s own reason — the attestation carries
                      a member's name for as long as the record lasts. */
                   "caseratify", "publishat",
                   /* CPDF-10: attesting that a transcription matches the image is a
                      MEMBER act — a person's testimony, carrying their name for as
                      long as the record lasts. It is a session op before it is
                      anything else, on `aicredentialmint`'s reasoning below: the
                      only route that produces a name the store will accept is a
                      session, and the store refuses every other shape (C-35.10). */
                   "attesttext",
                   /* SK-7 / framework Part II §14.4: MARKING A PASSAGE AS CITABLE is
                      a session op TOO, and the reason is the ruling's own list rather
                      than symmetry with the line above. §14.4: *"where an edge points
                      at a whole document, the assistant, A MEMBER, or another means
                      tries to find the specific passages"* — so a member doing by hand
                      what the assistant does on its own is the SAME act by a different
                      actor, and the record distinguishes them by who is stamped on the
                      row rather than by which of them is allowed to perform it. It is
                      NOT the act that changes a leg's target (REC-86's NARROW) and it
                      is not TRANSCRIBE (REC-87); it mints an address and writes no
                      edge. Unlike `attesttext` above, the machine route is open too —
                      that asymmetry IS this item. */
                   "contentmint",
                   /* SK-8: the READ half of the EXTRACT role. `extractpropose` is
                      NOT named here because it arrives through `AI_RUN_ACTIONS`
                      below, as an act of a run; this one is not an act of a run
                      and a member reviews proposals without holding one, so it
                      is named beside `contentmint`, whose act it reads back. */
                   "extractproposals",
                   /* REC-86: NARROW and its candidate read — a member's act on a
                      reading of a question, reached by a signed-in member. */
                   "narrow", "narrowcandidates",
                   /* REC-122: choosing a connection's on-point mention — a member's
                      act, reached by a signed-in member. */
                   "connectionchoose",
                   /* T5-11 (K145): connections' three writes, `connectionchoose`'s route. */
                   "connectionassert", "filemembershipstore", "filemembershipjudge",
                   /* D-136: THE §4.7 VOTE BECOMES CASTABLE BY THE PEOPLE §4.7 ASSIGNS IT
                      TO — AND THAT IS WHY THE THREE ARE IN **BOTH** SETS, WHICH IS THE ONE
                      DESIGN CALL THIS ITEM HAD TO MAKE. It is `EXPERTISE_ACTIONS`' posture,
                      written out at that array with its reasoning, and the reasoning is the
                      same here.
                      **THE MEASUREMENT THAT FORCED IT.** `kind` is
                      `sess.role === "admin" ? "admin" : "member"`, so `SESSION_OPS.admin`
                      does NOT mean *an administrator's session*: it means THE FOUNDER'S
                      PASSWORD SESSION AND NOTHING ELSE. An enrolled administrator holds
                      `member:<id>` however their roster row reads — found by D-270, where
                      two separate harnesses made exactly that mistake and measured a split
                      of zero over a plane that had one; admission's tests
                      (`test/m/admission/admission.test.mjs`) now prove the founder's set is
                      the founder's session alone. So `...GOVERNANCE_ACTIONS` in the ADMIN SET ALONE would have
                      given the §4.7 vote to ONE person, the founder, while the operator
                      fence below took the bearer route away from everybody else — and §4.7
                      needs *the consensus of all existing administrators*. A group of three
                      would have been left unable to add or remove an administrator at all.
                      **That is the row's own failure mode, not an improvement on it:**
                      "stamping without reach makes the 4.7 vote unreachable by anybody",
                      arrived at one administrator instead of zero.
                      **WHAT DECIDES THESE ACTS IS THE ROSTER, AND THE STORE ASKS IT.** Both
                      sets reach the op; the `by` stamp below names whoever is signed in;
                      and `adminEndorse`, `adminRemove` and `memberCaps` each refuse a `by`
                      that is not an ACTIVE ADMINISTRATOR, by name. An ordinary member
                      therefore gets NOT_AN_ADMIN — which says what is actually wrong —
                      rather than "only an administrator's session", which would be true of
                      neither the caller nor the rule, and which every real administrator
                      would have received too. `expertiseconfirm` is in the member set for
                      that sentence exactly, and `conclude`'s fail-closed posture is the
                      same argument: reach the handler, be refused by the thing that knows.
                      IT WIDENS NOTHING A MEMBER COULD NOT ALREADY SEE: `op=memberlist` is
                      admin/member/probe and already publishes the roster with its roles, so
                      no arm of these three discloses anything new before refusing.
                      Before this landing the three were in NEITHER set, so every session
                      got SESSION_ROUTE_NOT_RECORDED: an OMISSION honestly stated (D-270
                      (c)), and this is the item that discharges it. */
                   ...IDENTITY_ACTIONS,
                   ...GOVERNANCE_ACTIONS,
                   /* REC-159: §4.9's custodial acts, in BOTH sets for D-136's reason
                      above — the roster decides them, asked by the store against the
                      stamped `by`, and an ordinary member is told NOT_AN_ADMIN. */
                   ...CUSTODIAL_ACTIONS,
                   /* N43: membership's R10, R11 and R19 acts, in BOTH sets for D-136's reason above. */
                   ...ROSTER_SELF_ACTIONS,
                   /* N364: a member's own key, capture's member acts and sources' acts, in BOTH sets. */
                   ...OWN_KEY_ACTIONS, ...CAPTURE_MEMBER_ACTIONS, ...SOURCE_ACTIONS,
                   /* REC-155: §4.10's five, in BOTH sets for D-136's reason above — none
                      of them is the founder's act, and an enrolled administrator is a
                      `member` kind. */
                   ...PROVENANCE_JUDGEMENT_ACTIONS, ...CALIBRATION_WRITE_ACTIONS,
                   /* REC-146: THE CONTRADICTION PAIRING READ. It reads across QUESTIONS,
                      their accepted readings and the documents those rest on, so the
                      viewer decides what it may pair at all — the session route is the
                      only one that produces a member the gate can filter by. */
                   "contradictionpairs",
                   /* D-148: the fee-quote read, across actions, gated by the viewer. */
                   "actionquotes",
                   /* D-394: THE CROSS-VERSION NOTICE — shown where a member meets a
                      citation, so the session route is the one it must reach. */
                   "versionnotice",
                   /* REC-87: TRANSCRIBE and the attestation of a typing — a person's
                      word in their own name, `attesttext`'s route and reason. */
                   "transcribe", "transcriptionattest",
                   /* MK-1: TESTIFY — a member's own word, `transcribe`'s route. */
                   "testify",
                   /* MK-4: THE LEAD and a look recorded against it — a person's word
                      in their own name, `transcribe`'s route and reason. */
                   "lead", "leadlook", "leadshare",
                   /* MK-7: THE ATTRIBUTION ACT — the author's own choice about their own words, `testify`'s
                      route and reason. */
                   "attribute",
                   /* D-162: THE THEME — declaring, placing and proposing, each a session
                      op for `lead`'s reason (a person's act in their own name); the
                      store refuses a machine declarer or placer by name. */
                   "themedeclare", "themeplace", "themepropose",
                   /* T5-11 (connections R43): withdrawing from a theme, `themeplace`'s route and reason. */
                   "themewithdraw",
                   /* REC-195: the governing-law PROPOSAL, a session op for `themepropose`'s reason — the
                      proposer is stamped from the credential that asked, and the session route is the one
                      that produces a member's own name for a member's proposal. */
                   "actionlawspropose",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_DEBT_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS,
                   /* T6-13: intent's ten acts and reevaluation's three, a member's own acts in their own name, and
                      capture-requests' retry (R42), a member's act on the group's queue; in BOTH sets, because an
                      administrator is a member too. */
                   ...INTENT_ACTIONS, ...REEVALUATION_ACTIONS, "capturerequestretry",
                   /* T8: the action layer's acts and actions' risk-tier proposal (R28), a member's own acts in their
                      own name (the proposal `actionlawspropose`'s route), in BOTH sets. */
                   ...STANDARDS_ACTIONS, ...CONFORMANCE_ACTIONS, ...CONSEQUENCES_ACTIONS, ...FILINGS_ACTIONS,
                   ...ESCALATION_ACTIONS, "actionriskpropose",
                   /* T18 (N-A12, K704, K709, K711): actions', action-clocks' and action-plans' acts and the plan's proposal,
                      each a member's own act in their own name (a machine reaching one is refused by its module, or, for
                      the proposal, labelled), in BOTH sets, because an administrator is a member too. */
                   ...ACTIONS_ACTIONS, ...ACTION_CLOCKS_ACTIONS, ...ACTION_PLANS_ACTIONS, ...PLAN_PROPOSAL_ACTIONS,
                   /* N345: contradiction's six acts on a candidate, a member's own acts in their own name, in BOTH sets. */
                   ...CONTRADICTION_ACTIONS,
                   /* T21 (K921, K927; op-declarations R8): every op of filing-templates and local-facts — the member
                      acts, the proposal, the grant's doors (public at the class gate; a member's session reaches them
                      too) and the reads — in BOTH sets, because an administrator is a member too. */
                   ...FILING_TEMPLATES_ACTIONS, ...FILING_TEMPLATES_READS, ...TEMPLATE_PROPOSAL_ACTIONS,
                   ...TEMPLATE_DOOR_ACTIONS, ...TEMPLATE_DOOR_READS, ...LOCAL_FACTS_ACTIONS, ...LOCAL_FACTS_READS,
                   /* T22 (K1019, K1023; op-declarations R9): every op T22 adds, in BOTH sets — escalation's decline
                      (through `ESCALATION_ACTIONS` above) and its status read, capture's two held acts (through
                      `CAPTURE_MEMBER_ACTIONS` above) and its three reads, monitoring's frequency act. */
                   "escalationstatus", ...CAPTURE_READS, ...MONITORING_ACTIONS,
                   /* T23 (op-declarations R10): every op T23 adds that a session reaches, in BOTH sets — escalation's
                      pre-assembled reason, case-authoring's draft of what changed and its read, link-sweep's sweeps and
                      network-notices' act and reads (a bearer refused them by `machineClasses: []`). The public reads
                      are in neither: every caller reaches them. */
                   "escalationreasondraft", ...WHAT_CHANGED_PROPOSAL_ACTIONS, ...WHAT_CHANGED_READS, ...LINK_SWEEP_READS,
                   ...NETWORK_NOTICES_ACTIONS, ...NETWORK_NOTICES_READS,
                   /* T24 (op-declarations R11): action-plans' start preview, in BOTH sets, as the start it previews. */
                   ...ACTION_PLANS_PREVIEWS,
                   /* T27 (op-declarations R12, R13): the hold's release and its two reads arrive through
                      `ACTIONS_ACTIONS` above and the reads here; the docket's acts and reads, in BOTH sets (a bearer
                      refused them by `machineClasses: []`). Its public reads are in neither: every caller reaches them. */
                   "actionholdpreview", "projectholds", ...DOCKET_ACTIONS, ...DOCKET_READS,
                   /* T28 (op-declarations R14): case-import's acts and reads, in BOTH sets (a bearer refused them by
                      `machineClasses: []`). case-checker's public reads are in neither: every caller reaches them. */
                   ...CASE_IMPORT_ACTIONS, ...CASE_IMPORT_READS,
                   /* T31 (op-declarations R15): every op of wizard-scripts, in BOTH sets (an enrolled administrator's
                      session is a `member` kind, D-136; the editor grant is asked of the roster), the bearers refused
                      by `machineClasses: []` but for the proposal and the check, which any credential reaches. */
                   ...WIZARD_SCRIPTS_ACTIONS, ...WIZARD_SCRIPTS_BY, ...WIZARD_PROGRESS_ACTIONS, ...WIZARD_SCRIPTS_READS,
                   ...WIZARD_CHECK_READS,
                   /* N314 (T12, monitoring R30): the daemon's pause, every member session's to ask; monitoring refuses a
                      non-administrator by name. */
                   "monitorpause",
                   /* K407: the instance's profiles, an administrator's own session act (instance-setup asks the roster). */
                   "profilesset",
                   /* PL-11 / IS-5 / D-199 (3): MINTING AN AI TOKEN IS A MEMBER ACT,
                      and a MEMBER is a signed-in person — not the MEMBER_TOKEN
                      machine credential, which stamps `token:member` and is a
                      machine by REC-46's predicate exactly as REC-45 measured. So
                      these are session ops before they are anything else: the only
                      route that produces a name the store will accept is a session,
                      and the store refuses everything else BY SHAPE (C-29.1). */
                   "aicredentialmint", "aicredentialrevoke",
                   /* T33 (R17–R20): every op of every family, in BOTH sets — an enrolled administrator's session is a
                      `member` kind (D-136), and the owner or the roster decides the rest. */
                   ...FAMILY_SESSION_OPS,
                   /* REC-126 / DEC-31: THE REVIEW COPY's three authoring acts. A
                      session op before anything else, on `aicredentialmint`'s
                      reasoning: each is attributed to the person who performed it,
                      and the store refuses every machine shape by name. */
                   "casedraft", "reviewgrant", "reviewrevoke"])),
  admin:  frozenSet(withAliases(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "caseratify", "publishat",
                   "attesttext",
                   "contentmint",
                   /* SK-8: the READ half of the EXTRACT role. `extractpropose` is
                      NOT named here because it arrives through `AI_RUN_ACTIONS`
                      below, as an act of a run; this one is not an act of a run
                      and a member reviews proposals without holding one, so it
                      is named beside `contentmint`, whose act it reads back. */
                   "extractproposals",
                   "narrow", "narrowcandidates",
                   "connectionchoose",
                   "connectionassert", "filemembershipstore", "filemembershipjudge",
                   "contradictionpairs",
                   "actionquotes",
                   "versionnotice",
                   "transcribe", "transcriptionattest",
                   "testify",
                   "lead", "leadlook", "leadshare",
                   /* MK-7: THE ATTRIBUTION ACT — the author's own choice about their own words, `testify`'s
                      route and reason. */
                   "attribute",
                   /* D-162: THE THEME — declaring, placing and proposing, each a session
                      op for `lead`'s reason (a person's act in their own name); the
                      store refuses a machine declarer or placer by name. */
                   "themedeclare", "themeplace", "themepropose",
                   "themewithdraw",
                   /* REC-195: the governing-law PROPOSAL, a session op for `themepropose`'s reason — the
                      proposer is stamped from the credential that asked, and the session route is the one
                      that produces a member's own name for a member's proposal. */
                   "actionlawspropose",
                   "inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease",
                   ...RETRIEVAL_READS, ...READING_READS, ...REGISTRY_ACTIONS, ...RECOGNISER_ACTIONS,
                   ...PROGRESSION_ACTIONS, ...EDGE_ACTIONS, ...STATE_ACTIONS, ...ACTION_ACTIONS,
                   ...PROJECT_ACTIONS, ...EXPERTISE_ACTIONS, ...TASK_ACTIONS, ...QUEUE_ACTIONS, ...AI_RUN_ACTIONS,
                   ...BIAS_DEBT_ACTIONS,
                   ...BIAS_ACTIONS,
                   ...DECLARATION_ACTIONS, ...STRUCTURE_ACTIONS, ...VERSION_ACTIONS,
                   ...INTENT_ACTIONS, ...REEVALUATION_ACTIONS, "capturerequestretry",
                   ...STANDARDS_ACTIONS, ...CONFORMANCE_ACTIONS, ...CONSEQUENCES_ACTIONS, ...FILINGS_ACTIONS,
                   ...ESCALATION_ACTIONS, "actionriskpropose",
                   ...ACTIONS_ACTIONS, ...ACTION_CLOCKS_ACTIONS, ...ACTION_PLANS_ACTIONS, ...PLAN_PROPOSAL_ACTIONS,
                   ...CONTRADICTION_ACTIONS,
                   ...FILING_TEMPLATES_ACTIONS, ...FILING_TEMPLATES_READS, ...TEMPLATE_PROPOSAL_ACTIONS,
                   ...TEMPLATE_DOOR_ACTIONS, ...TEMPLATE_DOOR_READS, ...LOCAL_FACTS_ACTIONS, ...LOCAL_FACTS_READS,
                   "escalationstatus", ...CAPTURE_READS, ...MONITORING_ACTIONS,
                   "escalationreasondraft", ...WHAT_CHANGED_PROPOSAL_ACTIONS, ...WHAT_CHANGED_READS, ...LINK_SWEEP_READS,
                   ...NETWORK_NOTICES_ACTIONS, ...NETWORK_NOTICES_READS,
                   ...ACTION_PLANS_PREVIEWS,
                   "actionholdpreview", "projectholds", ...DOCKET_ACTIONS, ...DOCKET_READS,
                   ...CASE_IMPORT_ACTIONS, ...CASE_IMPORT_READS,
                   ...WIZARD_SCRIPTS_ACTIONS, ...WIZARD_SCRIPTS_BY, ...WIZARD_PROGRESS_ACTIONS, ...WIZARD_SCRIPTS_READS,
                   ...WIZARD_CHECK_READS,
                   ...IDENTITY_ACTIONS,
                   ...GOVERNANCE_ACTIONS,
                   ...CUSTODIAL_ACTIONS,
                   ...ROSTER_SELF_ACTIONS,
                   ...OWN_KEY_ACTIONS, ...CAPTURE_MEMBER_ACTIONS, ...SOURCE_ACTIONS,
                   ...PROVENANCE_JUDGEMENT_ACTIONS, ...CALIBRATION_WRITE_ACTIONS,
                   "governorstate", "governorconfig",
                   /* K372 (monitoring R30): the daemon's pause, `governorconfig`'s route — the founder's session. */
                   "monitorpause",
                   "profilesset",
                   "aicredentialmint", "aicredentialrevoke",
                   ...FAMILY_SESSION_OPS,
                   "casedraft", "reviewgrant", "reviewrevoke"])),
});

/* ---- capabilities at the op layer. Membership Architecture v2 section 5 ----
 *
 * Capabilities gate a SESSION and nothing else. A token class has no member
 * behind it and therefore holds no capabilities: a machine credential is bounded
 * by OPS above and by scopeFor below, and asking a capability question about one
 * would mean inventing a member who does not exist.
 *
 * Section 5 says a capability a member does not hold is ABSENT from their
 * interface rather than present and refused. BOTH halves ship. setup.mjs builds
 * its controls from op=whoami so the control is not there, and this table
 * refuses the op anyway, because a hidden button is a courtesy and not a
 * boundary.
 *
 * STRUCTURAL, not a hand list. Every mutating op a SESSION can reach appears
 * here, including the ones that need no capability, written as an explicit null
 * with the reason. This module's R3 test (test/m/op-declarations/tables.test.mjs)
 * reads SESSION_OPS and this table as exported and fails on any session-reachable
 * mutating op that is missing,
 * AND on anything named here that no session can reach, so the table cannot rot
 * in either direction. Standing lesson 2: a later addition must not pass by not
 * being mentioned.
 */
const NEEDS = Object.freeze(aliasRows({
  /* contribute: create and revise bundles in the working corpus (5). */
  promote:          "contribute",
  lease:            "contribute",
  allocid:          "contribute",
  capture:          "contribute",   // the PUT; its GET is a read and is exempted at the check
  linkproject:      "contribute",
  acquire:          "contribute",
  attest:           "contribute",
  /* CPDF-10: NO FIFTH CAPABILITY TOKEN, on REC-13's reasoning below exactly.
     Attesting that a transcription matches the image is a corpus write and
     rides `contribute` like every other one. The thing that makes it different
     from its siblings is not a permission — it is that a MACHINE cannot perform
     it, and that is enforced where machine-ness is decided (the store's
     `checkAttestation`, C-35.10), never by inventing a capability a group would
     have to be told about. */
  attesttext:       "contribute",
  /* SK-7: NO FIFTH CAPABILITY TOKEN, on `attesttext`'s reasoning immediately
     above. Marking a passage as citable puts a row in the corpus and rides
     `contribute` like every other corpus write — and a VIEW-ONLY member must
     not, because a row minted here is a durable address the record then carries
     with an author's name on it. What is special about this act is not a
     permission either: it is that a machine credential MAY perform it (§14.4's
     EXTRACT role) where it may never perform the one above, and that asymmetry
     lives in the OPS class cut and in C-35.10, not in a capability a group
     would have to be told about. */
  contentmint:      "contribute",
  /* SK-8: the same capability as the act they perform, for the reason written
     against `contentmint` above — a proposal is CONTRIBUTING and it is never
     publishing. Nothing either op writes is the group putting its name on
     anything: an uncited machine-minted row is a PROPOSAL (§7.3 (6)), and the
     act that makes one part of a finding is a member's citation. */
  extractpropose:   "contribute",
  extractproposals: "contribute",
  /* REC-86: NO FIFTH CAPABILITY TOKEN. Narrowing a citation writes a new reading
     into the working corpus and rides `contribute` like `cite`, the act that
     wrote the citation in the first place; the candidate read rides it too, on
     `extractproposals`' reasoning one line up. Nothing either writes is the
     group putting its name on anything — the new reading is born `suggested`. */
  narrow:           "contribute",
  narrowcandidates: "contribute",
  /* REC-122: choosing a connection's on-point mention rides `contribute`, on `narrow`'s
     reasoning — it is a member's judgment written into the working record, and nothing it
     writes is the group putting its name on anything. */
  connectionchoose: "contribute",
  /* T5-11 (K145): asserting a connection, storing an agenda's containments and judging one each write the working
     record's connections, `connectionchoose`'s capability and reason. */
  connectionassert:    "contribute",
  filemembershipstore: "contribute",
  filemembershipjudge: "contribute",
  /* REC-146: NO CAPABILITY. The pairing read takes none, on `op=content`'s and
     `op=transcription`'s reasoning: asking which of the record's own assertions are
     worth comparing is READING the record. It writes nothing into the working corpus
     and puts nobody's name on anything, so there is no contribution to gate — and a
     capability here would mean a member could be shown a question and refused the
     answer to "what else does this record say about it". */
  contradictionpairs: null,
  /* REC-147: `extractpropose`'s capability and for its reason — a proposal is CONTRIBUTING, never publishing, and
     nothing it writes puts the group's name on anything: a candidate is labelled machine work, state proposed. */
  contradictionpropose: "contribute",
  /* N345: each of contradiction's six acts appends a row in a member's name to the working record (and a take-up promotes
     an inquiry), and the run's recommendation is `contradictionpropose`'s kind of production — `contribute`, and NO fifth
     capability token (CAPABILITIES.md §4). Who may act on a candidate is the module's, asked of the stamped author. */
  contradictiondismiss:   "contribute",
  contradictionclarify:   "contribute",
  contradictiontakeup:    "contribute",
  contradictionresolve:   "contribute",
  contradictionoptin:     "contribute",
  contradictionrespond:   "contribute",
  contradictionrecommend: "contribute",
  /* N345 (K516): NO CAPABILITY for the five reads, on `contradictionpairs`' reasoning above: asking what the record's
     candidates, marks, facts, notices and responses say is READING the record, and it writes nothing. PRESENT, null,
     because affordances names each in NON_ACTS (its R7) and its totality guard reads a NON_ACTS key this table does not
     carry as stale (its R12). */
  contradictioncandidates: null,
  contradictiontensions:   null,
  contradictionfacts:      null,
  contradictionnotices:    null,
  contradictionresponses:  null,
  /* D-148: NO CAPABILITY, on `contradictionpairs`' reasoning: reading what a body
     quoted is READING the record, and it writes nothing. */
  actionquotes: null,
  /* D-394: NO CAPABILITY, on `op=content`'s reasoning — asking whether the document a
     citation rests on has a newer version is READING the record, and it writes nothing. */
  versionnotice: null,
  /* REC-87: NO FIFTH CAPABILITY TOKEN. Typing a portion's text writes a content
     row and its text into the working corpus, and attesting a typing is
     `attesttext`'s act on different text — both ride `contribute`, as
     `attesttext` does. Nothing either writes is the group putting its name on
     anything. The READ takes none, on `op=content`'s reasoning: resolving what a
     citation points at, including what a member typed, is reading the record. */
  transcribe:          "contribute",
  transcriptionattest: "contribute",
  transcription:       null,
  /* MK-1: an observation is written into the working corpus as an INFO bundle —
     `contribute`, as capturing a document is. Nothing it writes is the group
     putting its name on anything; attribution in a published case is MK-3's. */
  testify:             "contribute",
  /* MK-4: NO FIFTH CAPABILITY TOKEN, on `transcribe`'s reasoning. A lead and a
     look against it are writes into the record in a member's name and ride
     `contribute`; a VIEW-ONLY member must not, because either leaves a row
     carrying their name for as long as the record lasts. The read takes none. */
  lead:                "contribute",
  leadlook:            "contribute",
  leadshare:           "contribute",
  /* MK-7: NO FIFTH CAPABILITY TOKEN. §4.2: the act needs no `publish` capability — it is a decision about
     the member's own words, not about the case — so it rides `contribute`, the token that recorded them. */
  attribute:           "contribute",
  /* D-162: declaring a theme, placing in one and proposing a placement all write the working
     record's lens layer, `lead`'s capability. */
  themedeclare:        "contribute",
  themeplace:          "contribute",
  themepropose:        "contribute",
  /* T5-11 (connections R43): withdrawing from a theme writes the lens layer too, `themeplace`'s capability. */
  themewithdraw:       "contribute",
  leadread:            null,
  /* D-681: the lead list takes no capability, `leadread`'s posture; the store answers each viewer its own reach. */
  leadlist:            null,
  /* D-162: the theme read takes no capability, `leadread`'s posture; its placements are gated by the viewer. */
  themeread:           null,
  /* REC-203: the identifier judgement takes no capability; it reads, and its captures are gated by the viewer. */
  idmatch:             null,
  monitor:          "contribute",
  cite:             "contribute",
  sever:            "contribute",
  reinstate:        "contribute",
  dispose:          "contribute",
  retire:           "contribute",
  /* Release authority is the member's decision (Intake Doctrine 4); the
     SURFACE it rides is contribute, like its state-action siblings, and the
     named-member requirement is enforced by the store on the author stamp,
     not by a capability, because capabilities gate sessions and the rule here
     is about who a session IS. */
  release:          "contribute",
  /* REC-13: concluding rides `contribute` like every other corpus write, and
     NO FIFTH CAPABILITY TOKEN IS MINTED. CAPABILITIES.md §4 is explicit that a
     fifth would break the pattern and would need §5 reopened, and the strength
     of a claim is not a permission question — a group does not hold a
     "conclude" right distinct from the right to write the record. DEC-30 fixes
     the rest: no owner gate and no ballot, so any contribute holder may
     conclude and the act is attributed in the state_history and the Session
     Log. The named-member requirement is enforced by the store on the author
     stamp, exactly as release's is, because capabilities gate SESSIONS and the
     rule here is about who a session IS. */
  conclude:         "contribute",
  /* REC-136: withdrawing a conclusion rides `contribute` for conclude's reason
     — a group holds no separate right to change its mind — and the named-member
     requirement is the store's, on the author stamp. */
  withdrawconclusion: "contribute",
  /* REC-31: reopening rides `contribute` like every other corpus write, and
     mints no capability of its own. Disagreeing with a disposition is not a
     separate right a group grants — CAPABILITIES.md §4 is explicit that a
     fifth token would need §5 reopened — and DEC-30 fixes the rest: no owner
     gate, no ballot, the act attributed in the state_history and the Session
     Log. The named-member requirement is enforced by the store on the author
     stamp, as release's and conclude's are, because capabilities gate SESSIONS
     and the rule here is about who a session IS. */
  reopen:           "contribute",
  /* REC-16 / DEC-30, and this one is SETTLED rather than provisional: division
     is AUTHOR-SCOPED — any `contribute` holder, with the act attributed — and
     no fifth capability token is minted. The reasoning is Bob's and it is
     decisive: division is how a member escapes an overclaiming mix, so
     owner-only would let an owner hold another member's name against an
     overclaim that member can see, and DE-ESCALATION MUST NEVER REQUIRE
     PERMISSION FROM SOMEONE WHOSE INCENTIVE MAY RUN THE OTHER WAY. What bounds
     misuse is not a gate but R4's disclosure: nothing leaves the record, the
     sibling exists, and a published child must name it. The named-member
     requirement is enforced by the store on the author stamp, as release's,
     conclude's and reopen's are, because capabilities gate SESSIONS and the
     rule here is about who a session IS. */
  inquirydivide:    "contribute",
  /* REC-45: GROUPING RIDES `contribute` and NO NEW CAPABILITY TOKEN IS MINTED,
     which the item states and which the reasoning above already settles.
     Membership §5's four rights are the whole set and a fifth would need §5
     reopened; there is nothing here a fifth would express that `contribute`
     does not, because authoring the structure of a basis is a corpus write on a
     question and a view-only member does not perform one.

     THE ARGUMENT FOR A NARROWER GATE IS REAL AND IS REJECTED, and it is worth
     stating because this act raises a grade. One could argue that the act which
     makes a finding STRONGER deserves `publish`'s right, or an owner's. It
     would be the wrong mechanism twice over. First, `publish` gates the
     PUBLICATION, which is where a stronger grade actually reaches a reader, and
     it is untouched: a member may group their reasons all day and nothing
     leaves the record until somebody with `publish` authors a case. Second — and
     this is DEC-30's argument arriving from the other side — grouping is also
     the only route BACK to an ungrouped basis, so an owner-only gate would let
     an owner hold a structure in place that another member can see is an
     overclaim, and DE-ESCALATION MUST NEVER REQUIRE PERMISSION FROM SOMEONE
     WHOSE INCENTIVE MAY RUN THE OTHER WAY. What bounds misuse here is not a
     gate: it is the NAME on every group, the legs staying visible under it, and
     the frozen per-group breakdown a reader checks (DEC-32's three
     containments). The named-member requirement is enforced by the store on the
     author stamp, as release's, conclude's, reopen's and inquirydivide's are,
     because capabilities gate SESSIONS and the rule here is about who a session
     IS. */
  inquiryground:    "contribute",
  /* PL-2 / IS-2: the six version acts ride `contribute` like every other corpus
     write and mint NO fifth capability token. CAPABILITIES.md §4 is explicit
     that a fifth would break the pattern and would need §5 reopened, and what a
     group's record stands on is not a permission question — a group does not
     hold a "settle a reading" right distinct from the right to write the record.
     The NAMED-MEMBER requirement is enforced by the store on the author stamp,
     exactly as release's, conclude's and inquiryground's are, because
     capabilities gate SESSIONS and the rule here is about who a session IS.
     THIS IS FENCE LAYER 2 (see VERSION_ACTIONS above). A member session without
     `contribute` is refused here and never reaches the store — which is exactly
     why the negative control has to break this row with the other two layers
     standing, or the transition refusal absorbs it and proves nothing. */
  versionaccept:    "contribute",
  versionreject:    "contribute",
  versionconsider:  "contribute",
  versionrevert:    "contribute",
  versioncurrent:   "contribute",
  versionhide:      "contribute",
  /* REC-24: BOTH ACTION OPS RIDE `contribute`, and NO NEW CAPABILITY TOKEN is
     minted — the item says so and the reasoning is the one every act above
     already runs on. Membership §5's four rights are the whole set; a fifth
     would need §5 reopened, and there is nothing here a fifth would express
     that `contribute` does not: moving an action and recording what came back
     are corpus writes, and a view-only member does neither.
     It is tempting to argue the OUTWARD reach deserves its own right — an
     action touches people outside the system. It would be the wrong mechanism:
     what bounds that reach is the RISK TIER on the object and the counterparty
     that must be named or honestly undetermined (REC-23), both of which are
     properties of the act being composed. A capability is a property of the
     SESSION and could not see either. The named-member requirement is enforced
     by the store on the author stamp, as release's, conclude's and reopen's
     are, because capabilities gate sessions and this rule is about who a
     session IS. */
  actionmove:       "contribute",
  actioncorrespond: "contribute",
  actionlaws:       "contribute",
  actionrisktier:   "contribute",
  /* REC-195: proposing takes `contribute` beside the act it proposes to, and the capability is the only gate
     it has — who proposed is RECORDED and labelled rather than fenced (D-149: the machine may propose). */
  actionlawspropose: "contribute",
  /* T8 (actions R28): proposing a tier takes `actionlawspropose`'s capability, for its reason. */
  actionriskpropose: "contribute",
  /* T8 (layer 9): each of the action layer's acts writes the working record — a standard or a proposal, a
     determination or a comparison, a consequence or its addressing, a filing draft, approval or sending, a counsel
     packet or its export, an escalation's stage — so each rides `contribute`, `actioncorrespond`'s capability and the
     version acts' reason, and NO fifth capability token is minted (CAPABILITIES.md §4). Who may act — a named member,
     joined to the project — is the module's, asked of the stamped author: who a session IS, not a capability. */
  standarddeclare:     "contribute",
  standardpropose:     "contribute",
  standardadopt:       "contribute",
  determine:           "contribute",
  comparisonpropose:   "contribute",
  consequencerecord:   "contribute",
  consequencerevise:   "contribute",
  addressedrecord:     "contribute",
  filingprepare:       "contribute",
  filingapprove:       "contribute",
  filingsent:          "contribute",
  counselpacket:       "contribute",
  counselpacketexport: "contribute",
  theorypropose:       "contribute",
  escalationopen:      "contribute",
  escalationattach:    "contribute",
  escalationevaluate:  "contribute",
  escalationadvance:   "contribute",
  escalationdecline:   "contribute",
  escalationend:       "contribute",
  escalationsuspend:   "contribute",
  escalationresume:    "contribute",
  /* FW-6 / D-83: building the SUBJECT REGISTRY reshapes what the working corpus's
     statements MEAN — registering a subject, aliasing it, and declaring a
     constitutive relation between subjects (mechanical bias-statement equivalence
     extends exactly as far as the registry declares it, safeguard 4). That is a
     corpus-shaping act, the same surface as the state and edge actions, so it takes
     `contribute`: a view-only member does not reshape subject equivalences. The
     declaring member is stamped server-side, so who fixed a relation is in the
     record; the reads (entity/entitybyalias/relation) are ungated, like the other
     working-corpus reads. */
  entitycreate:     "contribute",
  entityalias:      "contribute",
  relationdeclare:  "contribute",
  /* T5-11 (entities R8): correcting the registry is the same corpus-shaping surface as building it. */
  aliaswithdraw:    "contribute",
  relationwithdraw: "contribute",
  /* N345 (entities R38): reporting a wrong subject match writes a row in the reporter's name, the registry's surface. */
  resolutiondefect: "contribute",
  /* FW-7: RESOLVING a reference to an entity, and TESTIFYING a grade-D connection,
     both write into the record what documents concern which subjects — a corpus-shaping
     act on the same surface as building the registry, so `contribute`: a view-only
     member does not resolve references or testify. The resolving member is stamped
     server-side. The reads (resolutions/concerns) are ungated, like the registry and
     working-corpus reads. */
  resolve:          "contribute",
  resolvetestify:   "contribute",
  /* FW-8: deriving a CONNECTION between two documents that concern one subject, and
     authoring a PROGRESSION DEFINITION, both write into the record how the corpus's
     documents relate and how the group expects its institutions to behave — a corpus-
     shaping act on the same surface as building the registry and resolving references, so
     `contribute`: a view-only member does not derive connections or define progressions.
     The declaring member is stamped server-side. The reads (connections/progression) are
     ungated, like the registry, recogniser and working-corpus reads. */
  connect:          "contribute",
  progressiondefine:"contribute",
  /* FW-9: threading REAL documents into a progression instance places evidence into the
     record's account of how a happening unfolded — a corpus-shaping act on the same surface
     as deriving connections and defining progressions, so `contribute`: a view-only member
     does not thread instances. The threading member is stamped server-side. The read
     (instance) is ungated, like connections/progression. */
  thread:           "contribute",
  /* FW-10: recording an exception document that DISCHARGES a lawful skip is likewise a
     corpus-shaping act — it changes what the record claims about a missing stage (a gap becomes
     a lawful recorded skip) — so `contribute`, stamped with the declaring member below. The read
     (exceptions) is ungated, like the other progression reads. */
  discharge:        "contribute",
  /* REC-7: deferring or dismissing a derived proposal ages the record's own question — it changes
     what the working corpus SURFACES as open (an aged finding stops appearing) — so it rides the
     same `contribute` surface as the other progression writes: a view-only member does not age the
     record's questions. It mints NO bundle (D-79: declining is not authoring); the deciding member
     is stamped server-side. op=proposals (the read) is ungated, like the other progression reads. */
  proposedispose:   "contribute",
  /* Dispositioning a knock decides what enters the working corpus, which is the
     contribute surface even though the row it writes is an inbox row. Reading
     the inbox is not gated; acting on it is. */
  inboxresolve:     "contribute",
  /* N364 (capture R65, R68, R69; R36): pulling a knock files a capture and a bundle, re-attesting asks a fresh
     timestamp over a held capture, and an account is appended in the capturer's name — each writes the working record,
     `inboxresolve`'s and `attest`'s capability, and NO fifth capability token (CAPABILITIES.md §4). */
  inboxpull:        "contribute",
  reattest:         "contribute",
  captureaccount:   "contribute",
  /* N364 (sources R2, R6, R7): a disclosure, a link claim, a consent and its withdrawal each append a row to a source's
     history in a member's name, `contribute`, NO fifth token. Who may read or state a value is the module's (R5). */
  sourcedisclose:        "contribute",
  sourcelink:            "contribute",
  sourceconsent:         "contribute",
  sourceconsentwithdraw: "contribute",
  /* N364: NO CAPABILITY for the reads, on `contradictionpairs`' reasoning (asking the record is reading it); PRESENT,
     null, so affordances names each in NON_ACTS (its R7, R12), K516's precedent. The ceremony's pre-flight is
     `publishtensions`' posture: it tells a publisher what publishing would do and writes nothing. */
  knocksof:          null,
  pulledknocks:      null,
  lateattestations:  null,
  captureaccounts:   null,
  sourceof:          null,
  sourcerung:        null,
  sourcereadlog:     null,
  sourcepublishable: null,
  publishpreflight:  null,
  /* N364 (membership R89, R90): a member's own attesting key carries NO working capability, `signeradd`'s reasoning:
     what bounds it is who the session IS, and membership asks the roster of the stamped `by`. */
  signerregister:    null,
  signerrevoke:      null,
  /* publish: ratify. The capability governs the SURFACE and the registered
     signing key governs the authority (5). Both exist because before this the
     key was doing the capability's job: a member with no publish reached
     op=ratify and was stopped only by not having a key. */
  ratify:           "publish",
  /* CASE-5b: ratifying the CASE DOCUMENT is the same surface as ratifying a
     finding — it is the act that commits what the group is publishing, one
     altitude up. A member who may not publish may not sign a case either. */
  caseratify:       "publish",
  /* T34 (R25): setting a publish time is the ceremony's last act, `caseratify`'s surface. */
  publishat:        "publish",
  /* REC-14: authoring a case carries the SAME capability as ratifying one, and
     deliberately not `contribute`. Concluding says what the record shows;
     publishing puts the group's name on it and states, in the group's voice,
     what it does not cover and whether it was put to its subject. That is the
     publication surface, and a member who may not publish may not author it
     either. No fifth capability token is minted (CAPABILITIES.md section 4). */
  publish:          "publish",
  /* REC-126 / DEC-31, as REC-133 builds `BIO_Publication_v0_1.md` §6A.2 (BOB #15).
     No fifth capability token is minted for any of the three.
     - ISSUING and REVOKING a grant ride `publish`, UNCHANGED: handing the group's
       unratified draft to a named outsider is the act that stands beside
       publishing, and a member who may not publish may not do it either; the store
       adds the OWNER, with no administrator bypass for either act (§6A.2 as
       corrected by BOB #15 the same day: administrators direct nothing).
     - AUTHORING a draft rides `contribute`: §6A.2 makes it the project's EDIT
       permission (*"editing needs project permissions and is the editor's act"*),
       and `contribute` is Membership v2 §5's *"create and revise bundles in the
       working corpus"* — the capability half; the store checks the positional half
       (an owner or a joined participant, §7.5). REC-126 had it at `publish`, so an
       owner holding `publish` WITHOUT `contribute` no longer authors a draft: that
       is the ruling applied, since such an owner may edit nothing in the corpus. */
  casedraft:        "contribute",
  reviewgrant:      "publish",
  reviewrevoke:     "publish",
  /* REC-198: NO CAPABILITY, on `reviewcopy`'s terms — the single read takes none, and the list is fenced exactly
     like it (BOB #32). Listing which drafts one's own project holds is reading; it writes nothing. */
  casedrafts:       null,
  /* N345 (case-authoring R32; K516): NO CAPABILITY, on `contradictionpairs`' reasoning — the ceremony's read tells a
     publisher what publishing will disclose and writes nothing; `publish` gates the act itself. Present, null, for the
     reason the contradiction reads are (affordances R7, R12). */
  publishtensions:  null,
  /* DEC-17: the group's declared bar is about what publishing REQUIRES, so it
     rides the publication surface too. Lowering your own bar is legitimate and
     is an authored, dated, on-the-record act; what it may not be is quiet. */
  strengthbar:      "publish",
  /* create_projects is deliberately absent, because no op creates a project. A
     project is created by promoting a bundle with no base whose object_type is
     `project`, so the check lives at that SHAPE, once, in the promote branch. */

  /* No capability, and the reason, so a later reader does not read the absence
     as an oversight. A selection is a server-side snapshot of what the caller
     themselves selected; it writes nothing about the corpus, and a member with
     view rights only still needs to build one in order to read (7.5). */
  select:           null,
  selectionrelease: null,
  /* The roster ops are governed by `administer`, which is not a working
     capability and moves only by the Section 4 process. What bounds them is
     SESSION_OPS.admin above, not section 5. */
  /* Participation is governed by section 7, not section 5, and the store
     enforces it: only an owner invites and removes (7.2, 7.7 as REVERSED in v2),
     and `by` is stamped server-side so the store judges the real caller. */
  projectinvite:    null,
  projectjoin:      null,
  projectleave:     null,
  projectremove:    null,
  projectowneradd:  null,
  projectownerremove: null,
  projectownerrescue: null,
  /* REC-149: §7.14's setting is an owner's act over participation-level policy, governed by §7 and not §5. */
  projectvisibilityset: null,
  /* REC-150: §7.14's request to join is participation, governed by §7 and not §5 — the same reason as the roster
     acts: asking to be added needs no working capability, and answering is an owner's position. */
  projectrequest: null,
  projectrequestwithdraw: null,
  projectrequestanswer: null,
  /* The one participation op that DOES carry a capability, because a fork
     creates a project. Without this any participant creates projects they were
     not trusted to create, which is create_projects defeated by a button. */
  projectfork:      "create_projects",
  /* No capability. Declaring what you hold is not a corpus write, and
     confirming one is an administrator act governed by the class ACL. Neither
     is section 5's business, and declared expertise gates nothing in the other
     direction either. */
  expertisedeclare: null,
  expertiseconfirm: null,
  /* REC-159: still NO working capability now that an enrolled administrator's
     session reaches these (and `signeradd`/`signerset` below): what bounds them is
     the ROSTER, asked by the store against the stamped `by` — D-136's reasoning
     for the three that follow, applied again. */
  memberadd:        null,
  memberset:        null,
  /* D-136: NO WORKING CAPABILITY, and the reason is §5's own rather than
     `memberadd`'s by proximity. The §4.7 vote and the §4.9 capability edit are
     custodial powers over MEMBERSHIP: what bounds them is `SESSION_OPS.admin`
     above — who a session IS — and section 4's process, not one of section 5's
     four working rights. Hanging `administer` here would be the wrong mechanism
     twice over: `administer` is not a working capability, it moves only by the
     section 4 process, and §5 says an administrator holds every working
     capability and their own field is not consulted at all — so a capability
     test here would be a test of a field the design says nobody reads.
     PRESENT rather than absent because both totality guards must SEE them: this
     module's R3 test fails on a session-reachable mutating op that is missing
     from this table, and `affordances.mjs` requires every NEEDS key to be an ACT
     or a NAMED non-act — all three are named there with their reasons. */
  membercaps:       null,
  adminendorse:     null,
  adminremove:      null,
  /* REC-164: NO WORKING CAPABILITY, on D-136's reasoning above: what bounds the two is who a session IS, and the
     store asks the roster for an ACTIVE ADMINISTRATOR (C-64.5), not one of section 5's four working rights. */
  groupnameset:     null,
  groupdomainset:   null,
  signeradd:        null,
  signerset:        null,
  /* N43: NO WORKING CAPABILITY, on D-136's reasoning above — what bounds each is who the session IS, asked of the
     roster by the store against the stamped `by` (membership R10, R11, R19). */
  adminresign:      null,
  hostingaccessset: null,
  memberpairingset: null,
  /* PL-11 / IS-5 / D-199: NO WORKING CAPABILITY, and NO FIFTH CAPABILITY TOKEN
     IS MINTED — CAPABILITIES.md §4's rule, which every act since REC-13 has
     followed. Creating or withdrawing an agent credential is instance-level
     governance in `memberadd`/`signeradd`'s family, bounded by the class ACL
     and by SESSION_OPS, not by section 5's four working rights. It would be
     tempting to hang it on `contribute` because the credential can go on to
     write; that would be the wrong mechanism for the reason `release` records
     one line of reasoning over — a capability is a property of the SESSION, and
     what bounds this act is who a session IS. */
  aicredentialmint:   null,
  aicredentialrevoke: null,
  /* D-103: setting a host's appetite is an operator act bounded by
     SESSION_OPS.admin, not a section-5 working capability. CORRECTED 2026-09-23
     by REC-159: this read "the same as the roster ops above", and REC-159 moved
     those into both session sets; governorconfig is the operator's (§4.9, BOB #23).
     governorstate is a read and needs no entry at all. */
  governorconfig:   null,
  /* K372 (monitoring R30): pausing the daemon is the root of trust's act over the instance's own fetching, bounded by
     its class and `SESSION_OPS.admin`, `governorconfig`'s reason: not a section-5 working capability. */
  monitorpause:     null,
  /* K407: setting the instance's profiles is an administrator's act asked of the roster, D-136's reasoning: no working
     capability. */
  profilesset:      null,
  /* REC-4 / D-98: forwarding or resolving a task carries NO working capability.
     The authorization is not "may this member contribute" but "is this THIS
     member's task" — an identity question the store's TASK-ACTOR FENCE answers
     (`taskResolve`/`taskForward` refuse a non-assignee, non-admin with NOT_YOURS,
     naming who it is with). Exactly the reasoning `release` records: the rule is
     about who a session IS, not a capability, so a view-only member holds these
     as much as a contributor does — an obligation is settled by whoever it was
     addressed to. */
  taskforward:      null,
  taskresolve:      null,
  /* REC-20: reading your own queue carries NO working capability, for the same
     reason taskforward/taskresolve carry none — the question is not "may this
     member contribute" but "what has this record put in front of THIS member",
     and a view-only member holds it exactly as a contributor does. It is
     non-mutating, so SESSION_OPS does not gate it either. The entry exists
     rather than being absent so REC-19's totality guard can see it: an op in
     NEEDS is either a published act or a NAMED non-act, and op=queue is named
     in NON_ACTS with its reason. */
  queue:            null,
  /* REC-34: reading the derived pair carries NO working capability, on op=queue's
     reasoning exactly — the question is not "may this member contribute" but "what
     does this question rest on", and a view-only member holds it precisely as a
     contributor does; weighing a case is what viewing IS. It is non-mutating, so
     SESSION_OPS does not gate it either, and what bounds it is the D-15 viewer
     stamp rather than section 5. The entry exists rather than being absent so
     REC-19's totality guard can SEE it: an op in NEEDS is either a published act
     or a NAMED non-act, and op=inquirystrength is named in NON_ACTS with its
     reason. (op=reevaluations' precedent — no entry at all — is the other legal
     shape for a read; this one is taken because the op is a SURFACE a member acts
     from, and a read that is silently absent from both registries is exactly how
     REC-25's six ungated reads accumulated.) */
  inquirystrength:  null,
  /* REC-18: NO CAPABILITY, on op=inquirystrength's reasoning exactly. Asking
     what the record already earned for a document is reading the record, not
     shaping it — the WRITE that puts the earned grade on a leg is op=promote,
     which carries `contribute` and is where the capability belongs. A view-only
     member weighing a case needs to see what its legs rest on precisely as a
     contributor does. Present rather than absent so REC-19's totality guard
     sees it; named in NON_ACTS with its reason. */
  earnedbasis:      null,
  /* REC-83: NO CAPABILITY, on op=earnedbasis' reasoning exactly. Resolving what
     a citation POINTS AT is reading the record; the acts that create or change
     the thing resolved carry their own gates (op=promote's projection mints it,
     op=attesttext attests it, REC-86's NARROW re-points a leg). A view-only
     member weighing a case needs to see what a leg actually cites precisely as
     a contributor does — and a fence here would mean a member could be shown a
     citation and never be told what part of the document it names. Present
     rather than absent so REC-19's totality guard SEES it, and named in
     NON_ACTS with its reason. */
  content:          null,
  /* D-419 (T5-11): NO CAPABILITY, on op=content's reasoning exactly — showing the picture a citation names is reading
     the record. Present rather than absent so REC-19's totality guard SEES it. */
  contentcrop:      null,
  /* REC-36: NO CAPABILITY, on op=earnedbasis' reasoning exactly. Asking which
     documents NAME a subject is reading the record; the write that acts on the
     answer is op=resolve, which carries its own gate and is where the capability
     belongs. A view-only member weighing a case needs to see what mentions their
     subject precisely as a contributor does. Present rather than absent so
     REC-19's totality guard SEES it — a read silently absent from both registries
     is how REC-25's six ungated reads accumulated — and named in NON_ACTS with
     its reason. (Its two siblings op=reading/op=readingref take the other legal
     shape, no entry at all; this op takes op=queue's because it is a SURFACE a
     member acts from: the candidate list a resolve is chosen out of.) */
  readingname:      null,
  /* REC-21 / D-125: NO CAPABILITY, and the reason IS the doctrine rather than a
     convenience. `contribute` is the corpus-shaping surface — it is what
     separates a member who may change what the record says from one who may only
     read it. A mute changes nothing the record says: it is one member deciding
     what they are told about their own attention, and requiring `contribute` for
     it would classify a personal preference as a corpus act, which is the exact
     collapse this item exists to prevent. It would also mean a view-only member
     could be notified and could never manage it — an attention surface they can
     receive and cannot answer. The `select` precedent is the same shape: a
     server-side snapshot of the caller's own state, writing nothing about the
     corpus, and needed by a view-only member in order to read at all.
     What DOES bound these is SESSION_OPS above (they are mutating, so a machine
     credential cannot reach them through a session route) and the store's own
     NO_MEMBER refusal — an identity question, like the task fence, not a
     capability one. */
  queuemute:        null,
  queuesnooze:      null,
  /* IS-6. Opening an investigative run rides the CONTRIBUTE surface, and the
     reasoning is the one op=proposedispose records two entries up rather than a
     new one: a run shapes what the working corpus surfaces as open — it will
     propose versions of an inquiry's basis and it spends the group's Claude
     budget against their account. A view-only member does not start work the
     group pays for and the record then carries. It is deliberately NOT
     `publish`: a run proposes and nothing it does is the group putting its name
     on anything (§1's suggesting / authoring / committing, kept apart).

     `airuntick` and `airunclose` carry the SAME capability rather than none.
     The alternative — gate the open and leave the tick free — would mean a
     credential that may not start a run may still spend its budget and close
     it, which is the fence in the wrong place. The two READS are ungated by
     capability and gated by VIEWER, like every other read here.

     ***** PL-18 / DEC-63, 2026-08-09: THESE THREE VALUES ARE NOW A FLOOR AND
     NO LONGER THE GATE, AND THE FLOOR IS THE SMALLER HALF. *****
     IS-6 shipped `contribute` as a PROVISIONAL and asked Bob which capability a
     run costs. He answered that it is not a capability question at all:
     *"AN INVESTIGATION CAN BE STARTED BY ANY MEMBER OF A PROJECT… the gate is
     PROJECT MEMBERSHIP, not a capability tier — participation in the project
     the inquiry belongs to is what licenses asking the system to look, and the
     spend rides on membership the group already governs."*
     So `contribute` STAYS HERE — unchanged, still enforced, and refusing in its
     own words with `needs` on the answer — while the real gate is participation
     in the project the run's context belongs to, checked in the store where the
     citation graph and the participation rows are, and refused with its own
     C-22.8 code and canned translation.
     **THE TWO REFUSALS ARE DELIBERATELY NOT ONE.** *You are not in this
     project* and *you lack contribute* are different facts about an account
     with different remedies — an owner of that project invites you, or an
     administrator grants a capability — and a single refusal covering both
     would tell a member nothing they can act on.
     The order is: this capability floor first (here, at the control plane),
     then participation (in the store). A member who fails both is told about
     the capability, because that is the refusal that fires first; neither
     answer is ever both. */
  airunopen:        "contribute",
  airuntick:        "contribute",
  airunclose:       "contribute",
  /* REC-207: NO CAPABILITY on either, and `op=taskresolve`'s entry above is the precedent rather than a
     new argument. Settling an obligation the record raised is answering something addressed to you; it is
     not the corpus-shaping surface `contribute` separates out, and a view-only member who is shown a
     bias-debt obligation and cannot answer it has been handed an item they can receive and never
     discharge. What DOES bound the act is its class list (no probe), the store's own machine refusal by
     shape, and the run's read gate — an identity question, like the task fence, not a capability one. */
  biasdebtresolve:  null,
  biasdebt:         null,
  /* PL-3 / IS-4. A suggestion is `contribute` and deliberately NOT `publish`:
     §1's three verbs are kept apart, and proposing a reading of the evidence is
     suggesting. Nothing this op writes is the group putting its name on
     anything — the version is born `suggested`, and every act that would make
     it the record's stance is a member act this credential cannot reach. */
  suggest:          "contribute",
  /* PL-4 / IS-4. Requesting a capture is `contribute` and deliberately NOT
     `publish`: it adds a document to the STORE and adds nothing to any case.
     Bob, 2026-08-05 — *"the capture is an entry of a document to the cache
     (store), but not an entry of the document into the leg of a claim"* — so a
     run that captures four hundred documents has changed the store and changed
     no conclusion. It is not NULL either, the way a personal mute is: this act
     sends traffic to somebody else's server with the group's name on it, which
     is corpus-shaping work and not a preference about one's own attention. */
  capturerequest:   "contribute",
  /* T6-13 (capture-requests R42): retrying a refused request sends the group's traffic to the source again, the
     request's own capability and reason. */
  capturerequestretry: "contribute",
  /* T6-13 (intent R2, R8–R11, R16, R18): each of intent's acts writes the working record — a project document's
     condition or adoption, a goal or aspiration document, a question, a triage row, a run — so each rides
     `contribute` and mints NO fifth capability token (CAPABILITIES.md §4). What bounds a GROUP aspiration to an
     administrator (R9) and an adoption to a joined member is the store's, asked of the stamped author: who a session
     IS, not a capability. */
  objectivecondition: "contribute",
  goaldeclare:        "contribute",
  goallink:           "contribute",
  goalclose:          "contribute",
  aspirationdeclare:  "contribute",
  aspirationdepart:   "contribute",
  aspirationdeadend:  "contribute",
  aspirationretire:   "contribute",
  triage:             "contribute",
  workobjective:      "contribute",
  /* T6-13 (intent R3–R6, R12–R15; B3, AFFORDANCES #1 J4.3): intent's seven READS take NO capability, op=queue's
     precedent and not op=reevaluations': each is a SURFACE a member acts from (progress and gaps, the goals and
     aspirations in force, the proposals a triage is chosen out of), so it is present here, null, where REC-19's totality
     guard SEES it and `affordances.mjs` names it in NON_ACTS with its reason. What bounds each is the viewer stamp. */
  objectiveprogress:  null,
  objectivegaps:      null,
  goal:               null,
  aspirations:        null,
  aspirationcontacts: null,
  pursuit:            null,
  intentproposals:    null,
  /* T6-13 (reevaluation R15, R16): adopting a newer version appends a basis version, keeping the earlier one and
     recording a re-evaluation write the working record — the version acts' capability and their reason. */
  versionadopt:       "contribute",
  versionkeep:        "contribute",
  reevaluationrecord: "contribute",
  /* PL-12 / D-84. Adopting a bias set is `contribute` and deliberately NOT
     `publish`: it is the group declaring the lens it works under, which is
     ordinary record work that every contributing member's own project managers
     do — and DEC-20 settles that declaring a bias never gates anything, so
     nothing downstream of this is a publication act. A view-only member does not
     put a lens over other people's work; the capability is what says so.
     `biasinhale` carries NONE, like every other read in this file, and it is a
     read precisely because it writes nothing. */
  biasadopt:        "contribute",
  /* REC-155 / §4.10: NO FIFTH CAPABILITY TOKEN. Repairing a provenance chain and recording a route marker are
     corrections to the working record in a member's name, and recording a calibration, an engine to probe or a
     vendor's announcement puts a row in the record — each rides `contribute`, as `attesttext` does, and a
     VIEW-ONLY member does neither. PROVISIONAL, and stated: `provenancechain`'s REPORT arm writes nothing, but
     this table gates an op rather than an arm (only `capture`'s GET is exempted, at the check), so a view-only
     member does not reach the report through a session either. §4.10 ruled reach and is silent on capability. */
  provenancechain:    "contribute",
  provenanceroute:    "contribute",
  calibrate:          "contribute",
  calibrationsubject: "contribute",
  calibrationsignal:  "contribute",
  /* T18 (N-A12, K705, K709, K711): the action layer's new acts write the working record — a communication draft or a
     template, an action's creation or a pressure mark on its correspondence, a plan, its subjects, options, proposals,
     dispositions, scenarios, checkpoint judgements, an option's start and a plan's close — so each rides `contribute`,
     T8's layer-9 acts' capability and reason, and NO fifth capability token is minted (CAPABILITIES.md §4). Who may act
     (a named member joined to the project) is each module's, asked of the stamped author: who a session IS. The
     proposal takes `actionlawspropose`'s capability, for its reason: proposing is contributing, never publishing. */
  communicationprepare: "contribute",
  templatesave:        "contribute",
  actioncreate:        "contribute",
  actionpressure:      "contribute",
  /* T20 (K902; actions R52): a hold statement is appended to the action's record in a member's name, `actionpressure`'s
     capability and reason. */
  actionhold:          "contribute",
  planopen:            "contribute",
  plansubjectadd:      "contribute",
  plansubjectremove:   "contribute",
  optionadd:           "contribute",
  optionrevise:        "contribute",
  optionpropose:       "contribute",
  optionadopt:         "contribute",
  optiondispose:       "contribute",
  scenarioset:         "contribute",
  checkpointrecord:    "contribute",
  optionstart:         "contribute",
  planclose:           "contribute",
  /* T18 (K704; action-clocks R4, R6; DEC-94): NO CAPABILITY, on `queuemute`'s reasoning (REC-21 / D-125) exactly. A
     reminder is one member asking when they are told about a deadline: it is a row of action-clocks' own table, never
     a field or a revision of the action, and changes nothing the record says. Requiring `contribute` would class a
     member's own attention as a corpus act, and leave a view-only member who can see a deadline unable to be reminded
     of it. What bounds the two is the module's: a machine refused by name, and only the member who set a reminder
     changes or answers it. Present, null, so the capability totality sees each. */
  reminderset:         null,
  reminderanswer:      null,
  /* T21 (K921, K927; op-declarations R8): the template library's member acts and the proposal write its rows in a
     member's name (or, for the proposal, a labelled machine's), `templatesave`'s capability and reason; confirming,
     correcting or disputing a profile fact writes local-facts' row in the member's name, the same. NO fifth capability
     token (CAPABILITIES.md §4): who may approve, retire or grant is the module's, asked of the stamped author. */
  templatedraft:       "contribute",
  templaterevise:      "contribute",
  templatesubmit:      "contribute",
  templatereviewgrant: "contribute",
  templategrantrevoke: "contribute",
  templateapprove:     "contribute",
  templateretire:      "contribute",
  templatepropose:     "contribute",
  factconfirm:         "contribute",
  /* NO CAPABILITY for the grant's two mutating doors: a recipient reaches them by the secret, with no session to hold a
     capability (`reviewcomment`'s posture), and a member's review or comment is judged by the module, asked of who may
     see the template. Nor for the five reads, on `contradictionpairs`' reasoning (asking the record is reading it).
     PRESENT, null, because affordances names all seven in NON_ACTS (its R30) and its totality reads a NON_ACTS key this
     table does not carry as stale (its R12), K516's precedent. */
  templatereview:      null,
  templatecomment:     null,
  templateread:        null,
  templatecomments:    null,
  templates:           null,
  factstatus:          null,
  factsdue:            null,
  /* T22 (K1019, K1023; op-declarations R9): declining to escalate appends to the escalation's record in a member's
     name, `escalationopen`'s capability and reason; setting a held capture aside or restoring it writes capture's row in
     the member's name, `inboxresolve`'s; an address's own frequency is a source owner's setting written to the record,
     the action layer's reason. Each `contribute`, NO fifth capability token (CAPABILITIES.md §4): who may act (a
     project's owner, a member who may see the capture) is the owning module's, asked of the stamped author. */
  declinetoescalate:   "contribute",
  heldsetaside:        "contribute",
  heldrestore:         "contribute",
  addressfrequencyset: "contribute",
  /* NO CAPABILITY for capture's three reads, on `contradictionpairs`' reasoning (asking the record is reading it);
     PRESENT, null, as capture's other reads (`knocksof`, `lateattestations`), so affordances names each in NON_ACTS
     (its R7, R12). `escalationstatus` takes `escalationsdue`'s shape: no row. */
  heldcaptures:        null,
  gradenote:           null,
  doorbelltally:       null,
  /* T23 (op-declarations R10): a draft of what changed is a row in case-authoring's table in its proposer's name,
     `templatepropose`'s capability and reason (proposing is contributing, never publishing); a posted notice publishes an
     owner's signed revision in the project's name, a write of the record, `contribute` — NO fifth capability token
     (CAPABILITIES.md §4): who may post (an owner signed in as themselves) is network-notices', asked of the stamped `by`. */
  whatchangedpropose:    "contribute",
  noticepost:            "contribute",
  /* NO CAPABILITY for T23's reads, on `contradictionpairs`' reasoning (asking the record is reading it; preparing a
     notice writes nothing), nor for the three public reads, which answer every caller. PRESENT, null, because
     affordances names each in NON_ACTS (its R32) and its totality reads a NON_ACTS key this table does not carry as
     stale (its R12), K516's precedent — which is why `escalationreasondraft` has a row where `escalationstatus` has none.
     `directorysubmission` and `publicread`, named in no NON_ACTS, take `escalationstatus`' shape: no row. */
  escalationreasondraft: null,
  whatchangeddrafts:     null,
  sweeps:                null,
  noticeprepare:         null,
  notices:               null,
  activitymethod:        null,
  noticespublic:         null,
  groupkeyspublic:       null,
  /* T24 (op-declarations R11): NO CAPABILITY for the start preview, `publishpreflight`'s posture: it tells a member what
     starting would do and writes nothing, and `contribute` gates the start itself. PRESENT, null, because affordances
     names it in NON_ACTS (its R7) and its totality reads a NON_ACTS key this table does not carry as stale (its R12),
     K516's precedent. */
  optionstartpreview:    null,
  /* T27 (op-declarations R12; actions R56): releasing a hold appends a statement to the action's record in a member's
     name, `actionhold`'s capability and reason. NO CAPABILITY for the release's preview and the held-project read, the
     start preview's posture (each writes nothing; `contribute` gates the release itself): PRESENT, null, because
     affordances names both (its R33) in NON_ACTS and its totality reads a NON_ACTS key this table does not carry as stale
     (its R12), K516's precedent. */
  actionholdrelease:     "contribute",
  actionholdpreview:     null,
  projectholds:          null,
  /* T27 (op-declarations R13; docket R1, R2, R5, R7): filing to the record, marking a threat, posting a signed entry and
     declining a submission each write the docket in a member's name — `contribute`, NO fifth capability token
     (CAPABILITIES.md §4): who may post or decline (the case's manager) is docket's, asked of the stamped `by`. NO
     CAPABILITY for its reads (preparing writes nothing) nor its public reads, on `contradictionpairs`' reasoning: PRESENT,
     null, because affordances names each in NON_ACTS (its R34), K516's precedent. */
  docketfile:            "contribute",
  docketpressure:        "contribute",
  docketdecline:         "contribute",
  docketpost:            "contribute",
  docket:                null,
  docketprepare:         null,
  docketinvitation:      null,
  docketpublic:          null,
  docketfeed:            null,
  /* T28 (op-declarations R14; case-import R1, R5–R8): importing a case file, completing a missing document, accepting an
     edition or withdrawing the acceptance, and flagging or clearing a flag each write case-import's rows in a member's
     name — `contribute`, the house default for a member's act on the record, NO fifth capability token (CAPABILITIES.md
     §4): who may act (an active member) is case-import's, asked of the stamped `by`. NO CAPABILITY for its two reads nor
     case-checker's two public reads, on `contradictionpairs`' reasoning: PRESENT, null, because affordances names each
     (its R35) and its totality reads a NON_ACTS key this table does not carry as stale (its R12), K516's precedent. */
  caseimport:            "contribute",
  caseimportdocument:    "contribute",
  importaccept:          "contribute",
  importacceptwithdraw:  "contribute",
  importflag:            "contribute",
  importflagclear:       "contribute",
  importedcases:         null,
  importedcase:          null,
  casechecker:           null,
  casefilespec:          null,
  /* T31 (op-declarations R16; case-import R17): setting and lifting a watch write case-import's rows in a member's name,
     the import acts' capability and reason. */
  importwatch:           "contribute",
  importunwatch:         "contribute",
  /* T31 (op-declarations R15; wizard-scripts R3–R9): drafting, revising, submitting, approving and retiring a script each
     write wizard-scripts' rows in a member's name, `templatedraft`'s capability and reason, and the proposal
     `templatepropose`'s (proposing is contributing, never publishing) — NO fifth capability token (CAPABILITIES.md §4):
     who may approve or retire is the module's, asked of the stamped `by`. NO WORKING CAPABILITY for the editor's grant and
     revocation, on D-136's reasoning: an administrator's act over a member, bounded by the roster (NOT_AN_ADMIN, its R8),
     not one of section 5's working rights. NONE for the progress tally, on `queuemute`'s reasoning: it writes an
     unattributed count, nothing in anyone's name, and a view-only member runs wizards too (DEC-120 (1)). NONE for the six
     reads, on `contradictionpairs`' reasoning. Each PRESENT, because affordances names all fifteen (its R37) and its
     totality reads a NON_ACTS key this table does not carry as stale (its R12), K516's precedent. */
  wizarddraft:           "contribute",
  wizardrevise:          "contribute",
  wizardsubmit:          "contribute",
  wizardapprove:         "contribute",
  wizardretire:          "contribute",
  wizardpropose:         "contribute",
  wizardeditorgrant:     null,
  wizardeditorrevoke:    null,
  wizardprogress:        null,
  wizards:               null,
  wizardread:            null,
  wizardsat:             null,
  wizarduse:             null,
  wizardcandidates:      null,
  wizardcheck:           null,
  /* T33 (R17–R20): each family op's row, from its kind in `OP_FAMILIES`: `contribute` for an act on the record and a
     proposal (proposing is contributing, never publishing); NO WORKING CAPABILITY for an administrator's act (D-136), a
     member's act on their own account, attention or ties (`queuemute`'s reasoning) and an unattributed tally; and a
     present null for every read, which affordances names a NON_ACT (its R40, R12). */
  ...FAMILY_NEEDS,
  /* R18: the in-force read (standards R7's alias `standardinforce`), a present null as `inforceat`'s beside it. */
  standardinforce:       null,
  /* K1689: an export's page (`export`'s credential) and the detectors' run (the operator's, unattended by decision)
     take NO WORKING CAPABILITY — neither is a session's act — and are PRESENT, null, because affordances grades each
     (its R40: the page a NON_ACT, the run a substrate absence) and its totality reads a graded key this table lacks as
     stale (its R12), K516's precedent. */
  exportpage:            null,
  moneydetectorsrun:     null,
  /* T35 (K2038): the credit page and `recover` take NO WORKING CAPABILITY — each public, reached by every caller — and
     are PRESENT, null, because op-grades names both in NON_ACTS (its R22) and affordances' totality reads a NON_ACTS key
     this table does not carry as stale (its R12), K516's precedent. */
  credit:                null,
  recover:               null,
  /* T36 (R32): the scheduler's four wakes over the files take NO WORKING CAPABILITY — none is a session's act — and are
     PRESENT, null, as `moneydetectorsrun`'s, because op-grades grades each (its R24) and affordances' totality reads a
     graded key this table lacks as stale (its R12), K516's precedent. */
  scanbatch:             null,
  renderbatch:           null,
  deeperbatch:           null,
  securityforward:       null,
}));

/* REC-19's act decoration, shared by op=affordances and op=queue (REC-20) so a queue item's options[] and an
   op=affordances answer for the same subject are identical by construction and not by agreement. N177 (T8): the
   decoration itself is affordances' `decorate(act, gate)` (its R11) — `id`, `label`, `weight`, the DECLARED rung and
   the ground of a stated absence (FW-14), and DEC-29(b)'s `prompt`, each a stated null where the record holds none.
   The GATE is the one half that lives only here: the capability `NEEDS` gates the call with, and how the op is
   reached (`SESSION_OPS`), read from the very tables that gate it, so the publication and the gate cannot drift.
   `ACT_GATE` is read only when a request is decorated, after both tables exist. */
const decorateAct = (a) => decorate(a, ACT_GATE);
const ACT_GATE = Object.freeze({
  needs: (id) => (Object.hasOwn(NEEDS, id) ? NEEDS[id] : null) ?? null,
  mode: (id) => SESSION_OPS.member.has(id) ? "session" : SESSION_OPS.admin.has(id) ? "admin-session" : "machine",
});

/* WHERE A DECISION IS RECORDED THAT A VERB IS NOT FOR A PERSON.
 *
 * THIS TABLE IS THE PLANE HOLDING ITS OWN WARRANT. Sentence (a) is a claim
 * about the DESIGN, and the plane may only make it while it can say where the
 * decision lives — so the citation is served to the caller in `recorded` and
 * the claim travels with the thing that licenses it.
 *
 * IT IS A PROPERTY AND NOT A LIST OF SPELLINGS, which is what makes it safe to
 * leave alone: an op added tomorrow is absent from this table, so it gets (c)
 * automatically and the plane invents nothing about it. **The default is the
 * honest answer**, and that is deliberate — the failure mode this item exists
 * to close is a rationale asserted where none was recorded, so the direction
 * that costs nothing must be the one that claims nothing.
 *
 * EACH ENTRY WAS READ AT THE ARTIFACT, not inferred from an op looking
 * machine-ish. Adding a row here is recording a decision, so it is an act to
 * take deliberately and never to tidy up.
 * CORRECTED 2026-09-25 BY REC-155. This paragraph read: *"Ops refused to every
 * session with NO entry here — `livefire`, `reproject`, `provenancechain`,
 * `provenanceroute` and the three calibration writes — are UNDETERMINED rather
 * than decided."* True until BOB #19 RULED all seven
 * (`BIO_Membership_Architecture_v2.md` §4.10): the provenance pair and the three
 * calibration writes JOINED BOTH SESSION SETS (`PROVENANCE_JUDGEMENT_ACTIONS`,
 * `CALIBRATION_WRITE_ACTIONS`), and `livefire` and `reproject` are recorded
 * below, each with the citation §4.10 quotes. So on this plane NO mutating op
 * that reaches the gate is an omission today — and sentence (c) STAYS, because
 * it is the answer the plane owes the next op somebody adds without a ruling. */
const UNATTENDED_BY_DECISION = Object.freeze({
  purge: "src/control-plane/index.mjs, the admission gate's own doctrine paragraph: 'Everything outside "
       + "SESSION_OPS, purge above all, still requires a machine credential.'",
  cpuprobe: "src/control-plane/ops.mjs, op=cpuprobe's OPS row: 'Burns compute deliberately to find where the "
          + "runtime cuts it off. Probe and admin only: it belongs nowhere near a member's session.'",
  capturerequestdrain: "src/control-plane/ops.mjs, op=capturerequestdrain's OPS row: 'daemon is here BY "
                     + "DECISION: SWEEP 4b item 1 is the decision DEC-37 required for widening the "
                     + "class by decision, not by drift.'",
  taskdrain: "src/control-plane/ops.mjs, the AI_RUN_ACTIONS note (PL-4): 'the drain is the DAEMON'S — a member "
           + "reaching for it by hand would be a person doing the daemon's job with the daemon's "
           + "conduct rules applied to them.'",
  /* D-436: recorded by the D-436 worker as a PROVISIONAL decision, and stated as one in IC-172 — the seed is
     the root of trust's, as the claim and the export are. The citation is the OPS row's own sentence. */
  instancegroupseed: "src/control-plane/ops.mjs, op=instancegroupseed's OPS row (D-436, provisional): 'RECORDING THE "
                   + "INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN CREDENTIAL HELD IN "
                   + "THE HOSTING ACCOUNT, THE CREDENTIAL THE INSTALLER'S OWN CLAIM IS ARMED BY — AND NO SESSION "
                   + "OF ANY ROLE REACHES IT.'",
  /* REC-155: the two §4.10 RULES unattended by decision (BOB #19, 2026-09-21). Each citation is the one §4.10
     quotes, re-read at the artifact by this landing; the ruling is cited beside it so a caller can find both. */
  livefire: "BIO_Membership_Architecture_v2.md §4.10 (BOB #19), citing src/livefire.mjs, header: 'the only "
          + "channel available for reaching a deployment may be a plain fetch of a URL. Confined to the scratch "
          + "namespace' — the deployment's live-fire battery, addressed to the operator's credential.",
  /* T6-13: recorded by K199 (BOB #51, 2026-09-28), reevaluation R14's sweep. The citation is the ruling's own words. */
  reevaluationraise: "build/rulings.md K199 (BOB #51), reevaluation R14: 'R14's notices are raised by a bounded sweep "
                   + "raiseNotices({limit, after}) (op reevaluationraise, admin and daemon)', which scheduler or "
                   + "monitoring calls.",
  /* T33: the detectors' run (money-checks R6) and the ask's usage count (K1601), each addressed to a credential. */
  moneydetectorsrun: "build/requirements/money-checks.md R6 (K1566): the machine's detectors run as a bounded sweep "
                   + "runDetectors({budgetMs, cursor}) that the scheduler fires; no member starts it.",
  askusage: "build/rulings.md K1601 (AGENT-WORKER #9 J1 (3), (4)): under an ai grant the control plane admits, outside "
          + "AI_GRANT_OPS, op=askusage (POST {mode:\"ask\", model, usage} per call; "
          + "`calls` beside `usage` since K1798, K1805, so an ask of N calls counts N), with the grant's member as viewer.",
  reproject: "BIO_Membership_Architecture_v2.md §4.10 (BOB #19), citing src/store.mjs, reproject: 'Exposed "
           + "because a deploy runs the bounded pass once at construction and a large store may need more than "
           + "one' — a deploy's maintenance pass, addressed to the operator's credential.",
  /* T36 (R32; K1913): the scheduler's four wakes over the files, each recorded by its owner's requirement as the
     scheduler's and no member's. The citations are the requirement's own words. */
  scanbatch: "build/requirements/file-safety.md R4 (K1913): 'scanBatch({limit, at}) (op=scanbatch; the scheduler's "
           + "daily wake, an administrator or daemon) sends the due files, oldest due first' — read as the administrator's "
           + "bearer or the daemon, since a scan batch is no member's act.",
  renderbatch: "build/requirements/file-safety.md R12 (K1913): 'renderBatch({limit}) (op=renderbatch; the scheduler's "
             + "wake) renders queued files after their capture, never inside the capture's act.'",
  deeperbatch: "build/requirements/file-safety.md R36 (K1913): 'deeperBatch({limit}) (op=deeperbatch; the scheduler's "
             + "wake, every few minutes while checks are queued or running) starts queued checks'.",
  securityforward: "build/requirements/file-safety.md R35 (K1892, K1913): 'forwardSecurityCounts({from, to}) "
                 + "(op=securityforward; the scheduler's hourly wake) builds one counts record for the period'.",
});

/* T36 (R34; N726, its share; DEC-174 (3); K2063 (3)): THE MEMBER OPS WITH NO EXPLANATION IN `affordances`' `ACT_HELP`
   (its R48), each named under the one ground of why not, grouped by ground (BOB's START, K2130). Every op in
   `SESSION_OPS.member` is either explained there under its own name or named here, never both, and nothing here names an
   op `OPS` does not hold. Read at PR #13's `mock-acts.js` as affordances R48 holds it (an alias's text under its op, an
   `owed_` key under its op once declared): 426 of the member set's ops have no text — 28 aliases, 161 reads, 5 acts no control
   offers and 232 acts the design has not yet explained, named back to the design stream. No owed act is named: every
   owed act this module declares has its text, and an owed act no owner serves has no spec (R21, R27). Frozen data
   (R5); a new member op must be explained or named here, or R34's test fails.
   T37 (R34; N776; DEC-182 (5); K2159): read at PR #14's `mock-acts.js` as affordances R48 re-generates it (T37-27):
   `clockpropose` has its text there and leaves the last ground; the owed acts T37 declares (`obscuremark`,
   `setpassword`, `subscriptionsignin`, `translationdraft`, `translationadopt`, `translationgrant`,
   `translationconfirm`, `translationrevert`) are explained under their own names; the reads `photomarks`,
   `translations` and `interfacewords` are reads a screen draws from, and `translationmark` an act the design has not
   yet explained.
   T38 (R34, R40; K2300): `obscuremarkwithdraw` is named here under no ground: PR #15's `mock-acts.js` explains it
   (`owed_obscuremarkwithdraw`), and affordances R48 re-generates `ACT_HELP` with that text (T38-31).
   T41 (R34, R41–R43, R45): every member op T41 declares is named here until its text is held under it. The ten owed
   acts of R41 and R42 that PR #19's `mock-acts.js` explains (`owed_accountusesset`, …, `owed_handlechange`) are under
   the owed ground until affordances' T41 job (its R48) carries their texts under their ops; the reads under the read
   ground; every other act under the last, named back to the design stream. */
const ACT_HELP_ABSENT = Object.freeze({
  alias: Object.freeze({ ground: "An alias of a declared op (R21): its op's explanation serves it.",
    ops: frozenList([
      "addparticipant", "addworkbook", "adoptversion", "bind", "createevent", "createset", "declare",
      "declaretie", "exclude", "filingrecordsent", "include", "keepversion", "reconcile", "recordcheck",
      "recorddatedfact", "recordfact", "recordline", "recordpersonfact", "relate", "ruleanswer", "signerregisterown",
      "signerrevokeown", "standingquestionend", "standingquestionset", "strengthbarset", "withdrawidentityclaim",
      "withdrawtie"]) }),
  read: Object.freeze({ ground: "A read a screen draws from: no control on a screen offers it as an act.",
    ops: frozenList([
      "acceptancecounts", "accountdrafts", "accounthistory", "accountreference", "accountuses", "actionholdpreview",
      "actionquotes", "adminrecoverystep", "aiactual", "aiestimate", "aikeepawaystate", "ailimits", "aiusage",
      "applicationrecipes", "asktallies", "assistantstate", "audit", "baseupdates", "bearingnotes", "bindsat",
      "calculation", "calculationevaluate", "captureprogressions", "capturerequestplatformhosts", "career",
      "checkrequests", "checksof", "citationresolve", "claims", "clocklateness", "clocksics", "coarchivestate",
      "concerns", "connections", "contradictionpairs", "costmessages", "courtnotice", "datedfacts",
      "directorysubmission", "disclosureof", "docket", "docketinvitation", "docketprepare", "doorbelltally", "dutiesof",
      "duty", "dutyoccurrences", "dutysetagainst", "dutytransitions", "editioninforce", "entitieskind", "entity",
      "entitybyalias", "escalationreasondraft", "escalationstatus", "event", "eventforact", "eventsfor", "exceptions",
      "exploretimeline", "extractproposals", "factsdue", "factstatus", "finddoors", "findingkind", "follows",
      "forcesof", "governorstate", "groupkeynotice", "groupkeystate", "grouptestresults", "guide", "guidefor",
      "guideproposals", "guides", "holderat", "hypotheses", "identity", "importedcase", "importedcases", "inbox",
      "inboxget", "inforceat", "inforcethroughof", "instance", "interestchecks", "interfacewords", "interview",
      "interviewform", "investigationproposals", "keyedservices", "lawaddresses", "lawrelations", "line", "linesof",
      "meaningrows", "memberlanguage", "memberties", "milestones", "money", "moneyamountchecks", "moneycheckparams",
      "moneydetectors", "moneyjunction", "moneynoticed", "moneyof", "moneyset", "moneysummable", "narrowcandidates",
      "notes", "noticeprepare", "notices", "originalstate", "overridesof", "partiesof", "patterns", "personcredentials",
      "personinterests", "personstatements", "photomarks", "placewantedstate", "powersof", "poweruses",
      "proceedinglinks", "proceedingstatus", "progression", "projectaccountstate", "projectaikeepawaystate",
      "projectholds", "projectkeynotice", "projectsshownon", "projectstanding", "proposals", "publishschedule",
      "questionfollowstate", "questionwaits", "quietstate", "reading", "readingname", "readingref", "recordsrequests",
      "recordsteps", "recoverycodesstate", "relation", "reportdraft", "reports", "resolutions", "reviewcomments",
      "safecopy", "samepersoncandidates", "scanfindings", "scanstatus", "searchfields", "searchindexcheck",
      "securitytoolcatalogue", "securitytoolevents", "securitytools", "selection", "selectionlist", "sequence",
      "shares", "snapshotdiff", "snapshots", "sourcepersonlinks", "spotcheck", "staffing", "standardsfor", "standing",
      "standinganswers", "statementsof", "stepproducts", "stepproposals", "steps", "stepslike", "stillstanding",
      "structureat", "sweeps", "table", "tablesat", "templatecomments", "templateread", "templates", "textattest",
      "textprovenance", "threatof", "timeline", "translations", "usesof", "verdictnotes", "versionnotice",
      "whatchangeddrafts", "whowassent", "wizardcandidates", "wizardcheck", "wizardread", "wizardsat", "wizarduse",
      "workbook", "workbookexport", "workbookinputs", "workbooklint"]) }),
  nocontrol: Object.freeze({ ground: "A step another act takes, which no control on a screen offers: a promotion's lease and identifier, a run's tick, the count of a check or a wizard's progress.",
    ops: frozenList([
      "airuntick", "allocid", "answercheck", "lease", "wizardprogress"]) }),
  owed: Object.freeze({ ground: "An owed act the design explains under its owed key, held under the op once affordances carries it there (its R48).",
    ops: frozenList([
      "accountusesset", "ailimitset", "exploreapprove", "handlechange", "projectaccountremove", "projectaccountswitch",
      "projectaikeepaway", "projectkeynoticeseen", "projectkeyset", "projectsigninset"]) }),
  unexplained: Object.freeze({ ground: "An act the design has not yet explained; named back to the design stream (DEC-174 (3)).",
    ops: frozenList([
      "accountpropose", "actalias", "actionholdrelease", "actionlawspropose", "actionriskpropose", "actionrisktier",
      "actionseekspropose", "addressedrecord", "addressfrequencyset", "adminresign", "aicredentialmint",
      "aicredentialrevoke", "aigrantmint", "airunverify", "aliaswithdraw", "approvalruleset", "ask",
      "aspirationdeadend", "aspirationdeclare", "aspirationdepart", "aspirationretire", "assessmentrecord",
      "attesttext", "bearingnote", "biasadopt", "biasdebtresolve", "bindingadopt", "calibrate", "calibrationsignal",
      "calibrationsubject", "captureaccount", "capturerequestplatformmark", "capturerequestplatformunmark",
      "capturerequestretry", "captureupload", "caseapprove", "caseimportdocument", "checkrecord", "checktake",
      "claimfindstep", "claimfound", "coarchiveset", "comparisonpropose", "connect", "connectionchoose",
      "consequencerecord", "consequencerevise", "contentmint", "contradictionclarify", "contradictiondismiss",
      "contradictionoptin", "contradictionpropose", "contradictionrecommend", "contradictionresolve",
      "contradictionrespond", "contradictiontakeup", "costmessage", "counselpacket", "counselpacketexport",
      "courttreat", "determine", "discharge", "discretionrecord", "dispose", "docketdecline", "docketpressure",
      "dutyadopt", "dutymatch", "dutypropose", "dutyrevise", "dutytransition", "dutywithdraw", "editacts",
      "entityalias", "entityidentify", "escalationattach", "escalationdecline", "escalationevaluate",
      "escalationresume", "escalationsuspend", "eventattest", "eventgovern", "eventimport", "eventmerge",
      "eventrelationwithdraw", "eventsplit", "exportrender", "extractpropose", "factconfirm", "filemembershipjudge",
      "filemembershipstore", "findaccept", "findmute", "followbody", "followpersonquery", "followportal", "goalclose",
      "goaldeclare", "goallink", "grouptestset", "guideadopt", "guidedraft", "guideoffer", "guidepropose",
      "guideproposetocivicsmith", "guideretire", "guidereview", "hostingaccessset", "hypothesisrevise",
      "hypothesissetaside", "hypothesistakeup", "hypothesiswithdraw", "importacceptwithdraw", "importflagclear",
      "importunwatch", "inquirydivide", "inquiryground", "interestcheckdefine", "interestcheckgate",
      "interestcheckswitch", "interviewkeep", "joinlinkoff", "joinlinkreplace", "joinlinkset", "keyedserviceset",
      "keyedserviceswitch", "lawpropose", "lawwithdraw", "lead", "leadlook", "leadshare", "linecurrentthrough",
      "linewithdraw", "linkproject", "memberpairingset", "milestoneitemremove", "milestonereminder", "milestoneremove",
      "milestonerevise", "milestoneset", "moneycheckparam", "moneydetectordefine", "moneydetectorgate",
      "moneydetectorswitch", "moneyfundtype", "moneyingest", "moneysetpropose", "moneywithdraw", "monitorpause",
      "narrativeclaim", "noteshare", "noteunshare", "noticepost", "objectivecondition", "optionrevise",
      "participantcorrect", "patterngate", "patternswitch", "permeetingbody", "personfactwithdraw", "planaccept",
      "plansubjectremove", "progressiondefine", "projectclosewithgaps", "projectfork", "projectleave",
      "projectowneradd", "projectownerremove", "projectownerrescue", "projectremove", "projectrequest",
      "projectrequestanswer", "projectrequestwithdraw", "projectvisibilityset", "projectwatch", "proposalaccept",
      "provenancechain", "provenanceroute", "publishatcancel", "publishatmove", "questionfollow", "ratify", "readoptin",
      "readpages", "reattest", "recordset", "recordsrequestanswer", "recordsrequestopen", "recoverycodesissue",
      "reevaluationrecord", "refreshregister", "registerimport", "relationdeclare", "relationwithdraw", "reopen",
      "reportkeep", "resolutiondefect", "resolve", "resolvetestify", "reviewpropose", "ruleservicesswitch",
      "safecopyrequest", "seatsseed", "signeradd", "signerset", "signout", "signouteverywhere", "sourceconsent",
      "sourceconsentwithdraw", "sourcedisclose", "sourcekeyed", "sourcepersonlink", "spotcheckvisit",
      "standardadoption", "standardbenchmark", "standardforce", "standardforcepropose", "standardforcewithdraw",
      "standardimpose", "standardinforcethrough", "standardinforcethroughwithdraw", "standardpropose",
      "standardrelease", "standingaiswitch", "stepaccept", "stepbywhen", "stepcostadd", "stepcostremove", "stepcreate",
      "stepdelete", "stepend", "steplearn", "stepoutcome", "stepproduct", "steprefer", "stepreminder", "stepsrunai",
      "stepstart", "stepwait", "stepwaitremove", "subscriptiondisconnect", "templateapprove", "templatecomment",
      "templatedraft", "templategrantrevoke", "templatepropose", "templateretire", "templatereview",
      "templatereviewgrant", "templaterevise", "templatesave", "templatesubmit", "themedeclare", "themeplace",
      "themepropose", "themewithdraw", "theorypropose", "thread", "transcribe", "transcriptionattest",
      "translationmark", "triage", "unfollow", "unpack", "uselink", "usesfreeze", "useunlink", "usewithdraw",
      "versionaccept", "versionconsider", "versioncurrent", "versionhide", "versionreject", "versionrevert", "waitlook",
      "websitekeyrevoke", "websitekeyset", "wizardeditorgrant", "wizardeditorrevoke", "wizardpropose",
      "workbooklintexplain", "workbookmethodnote", "workbookrecompute", "workbookunbind", "workobjective"]) }),
});

export { OPS, RETRIEVAL_READS, READING_READS, EDGE_ACTIONS, STATE_ACTIONS, ACTION_ACTIONS, DECLARATION_ACTIONS, STRUCTURE_ACTIONS, VERSION_ACTIONS, PROJECT_ACTIONS, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS, CUSTODIAL_ACTIONS, ROSTER_SELF_ACTIONS, OWN_KEY_ACTIONS, CAPTURE_MEMBER_ACTIONS, CAPTURE_VIEWER_ACTIONS, CAPTURE_READS, SOURCE_ACTIONS, SOURCE_READS, PROVENANCE_JUDGEMENT_ACTIONS, CALIBRATION_WRITE_ACTIONS, EXPERTISE_ACTIONS, REGISTRY_ACTIONS, TASK_ACTIONS, QUEUE_ACTIONS, AI_RUN_ACTIONS, RUN_VERB_ACTIONS, RUN_PRODUCTION_ACTIONS, POSITIONAL_ACTS, BIAS_ACTIONS, BIAS_DEBT_ACTIONS, INTENT_ACTIONS, INTENT_READS, REEVALUATION_ACTIONS, STANDARDS_ACTIONS, STANDARDS_READS, CONFORMANCE_ACTIONS, CONFORMANCE_READS, CONSEQUENCES_ACTIONS, CONSEQUENCES_READS, FILINGS_ACTIONS, FILINGS_READS, FILING_TEMPLATES_ACTIONS, FILING_TEMPLATES_READS, TEMPLATE_PROPOSAL_ACTIONS, TEMPLATE_DOOR_ACTIONS, TEMPLATE_DOOR_READS, GRANT_SECRET_ACTIONS, LOCAL_FACTS_ACTIONS, LOCAL_FACTS_READS, ESCALATION_ACTIONS, ESCALATION_READS, MONITORING_ACTIONS, LINK_SWEEP_READS, WHAT_CHANGED_PROPOSAL_ACTIONS, WHAT_CHANGED_READS, NETWORK_NOTICES_ACTIONS, NETWORK_NOTICES_READS, NETWORK_NOTICES_BY, NETWORK_NOTICES_PUBLIC_READS, DOCKET_ACTIONS, DOCKET_READS, DOCKET_AUTHOR, DOCKET_BY, DOCKET_PUBLIC_READS, CASE_IMPORT_ACTIONS, CASE_IMPORT_READS, CASE_IMPORT_BY, CASE_CHECKER_PUBLIC_READS, WIZARD_SCRIPTS_ACTIONS, WIZARD_SCRIPTS_AUTHOR, WIZARD_SCRIPTS_BY, WIZARD_PROPOSAL_ACTIONS, WIZARD_PROGRESS_ACTIONS, WIZARD_SCRIPTS_READS, WIZARD_CHECK_READS, CONTRADICTION_ACTIONS, CONTRADICTION_READS, ACTIONS_ACTIONS, ACTIONS_READS, ACTION_CLOCKS_ACTIONS, ACTION_PLANS_ACTIONS, ACTION_PLANS_READS, ACTION_PLANS_PREVIEWS, PLAN_PROPOSAL_ACTIONS, QUERY_AUTHOR_ACTIONS, ACTION_LAYER_ACTIONS, ACTION_LAYER_READS, PLAN_RUN_SCOPE, RECOGNISER_ACTIONS, PROGRESSION_ACTIONS, OP_KINDS, OP_FAMILIES, FAMILY_OPS, FAMILY_SESSION_OPS, OP_ALIASES, ASK_GRANT_OPS, OP_STAMPS, SESSION_OPS, NEEDS, decorateAct, ACT_GATE, UNATTENDED_BY_DECISION, ACT_HELP_ABSENT };
