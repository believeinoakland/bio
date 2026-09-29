/* control-plane: THE OP DECLARATIONS (R2, R10, R11, R13, R14, R17, R31, R34). Every op's spec, the act lists that
   drive the stamps and the fences, the session sets, the capability table and the recorded decisions that a verb is
   not a person's. Moved from legacy-index (`index.mjs`) at control-plane's extraction (T12, K3, K93); the handlers
   stay with their modules and only the declarations live here. */
import { decorate } from "../affordances.mjs";

/* BIO plane, control plane entry.
 *
 * Secret discipline, which is a design constraint rather than a convention:
 *
 *   1. No module reads a credential at import time. Every secret arrives as a
 *      binding on env, so the whole tree loads and the whole battery runs with
 *      no secrets present at all. That is what makes the local suite
 *      credential-free by construction rather than by accident.
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

const OPS = {
  //  op          class allowed              mutating
  selftest:   { classes: ["admin", "member", "probe"],           mutating: false },
  livefire:   { classes: ["admin", "probe"],                     mutating: true  },
  /* op=index reads the `bundles` table, which is WORKING corpus, so it is not a
     published-scope read and the public class must not have it. A title is the
     leak that matters: it names what the group is looking into, and the state
     says how far along they are, both before there is anything to answer. The
     public surface for a listing is `publishedlist`, which reads the projection
     that has never held unratified material. Asserted in test/fence.test.mjs. */
  index:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* S-10 step 1. The metadata projection the retrieval surface filters and sorts
     on, including source.locator and source.authority, which Bob settled as
     searchable. Working corpus, so member class and above, never public: the
     same fence that governs op=index governs this. */
  projection: { classes: ["admin", "member", "probe"],           mutating: false },
  reproject:  { classes: ["admin", "probe"],                     mutating: true  },

  /* Section 7 participation. These existed in the Durable Object's route map
     and were absent HERE, so every real caller got "unknown op": 7.2, 7.4, 7.6,
     7.7 and 7.8 were shipped and unreachable. Standing lesson 5 one level
     worse, since they were not merely tested at the DO but reachable only
     there. `by` is stamped server-side below from the session.

     A machine credential reaches these and is refused by the store, because
     `class:member` is not a member id and matches no participation row. Fail
     closed rather than fail open. */
  projectinvite:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectjoin:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectleave:        { classes: ["admin", "member", "probe"], mutating: true  },
  projectremove:       { classes: ["admin", "member", "probe"], mutating: true  },
  projectowneradd:     { classes: ["admin", "member", "probe"], mutating: true  },
  projectownerremove:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectfork:         { classes: ["admin", "member", "probe"], mutating: true  },
  /* 7.13. The single exception to administrators holding no authority over
     projects, and only when EVERY owner of that project is inactive. The store
     enforces both halves; `by` is stamped server-side below. */
  projectownerrescue:  { classes: ["admin", "member", "probe"], mutating: true  },
  projectparticipants: { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-149 (Membership v2 §7.14): DISCOVERABLE or HIDDEN. The setting is an OWNER's recorded act (the store
     refuses every other caller, machines included, by C-70.2); its read serves the setting and its history to a
     caller who can see the project; the directory lists, for a member session, the discoverable projects it is
     not in (a credential with no member is refused, C-70.4). */
  projectvisibilityset: { classes: ["admin", "member", "probe"], mutating: true  },
  projectvisibility:    { classes: ["admin", "member", "probe"], mutating: false },
  projectdirectory:     { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-150 (Membership v2 §7.14, the request to join): ASK and WITHDRAW are a member session's own acts (the store
     refuses a credential with no active member behind it, C-95.1); ANSWER — grant, which writes `invited`, or
     decline — is an OWNER's (C-95.5 for everyone else, administrators and machines included); the read serves a
     project's requests to its owners and administrators, and a member its own. */
  projectrequest:         { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestwithdraw: { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequestanswer:   { classes: ["admin", "member", "probe"], mutating: true  },
  projectrequests:        { classes: ["admin", "member", "probe"], mutating: false },
  /* The 7.10 arithmetic, computed rather than transcribed, so an interface can
     tell a group what a change would take BEFORE they start one. op=adminarith
     is the same thing for section 4.7, and the two differ at n=2 on purpose. */
  projectownerarith:   { classes: ["admin", "member", "probe"], mutating: false },
  /* Section 1.3. A member declares their own; an administrator confirms. Both
     stamped server-side below, because a declaration a caller can address to
     someone else is not a declaration, and a confirmation a caller can sign as
     an administrator is not a confirmation. GATES NOTHING: these appear in no
     capability check and no session. */
  expertisedeclare:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiseconfirm:    { classes: ["admin", "member", "probe"], mutating: true  },
  expertiselist:       { classes: ["admin", "member", "probe"], mutating: false },
  /* D-98, the task inbox. Note what is NOT here: `taskenqueue`. The producer is
     the capture path and reaches the queue through the Durable Object directly,
     so there is no control-plane route by which any credential can put an event
     in the queue on its own account. The consumer, `taskdrain`, is the sole
     writer of tasks, and `actor` on every one of these is stamped server-side
     below: a forward a caller can sign as someone else is not a forward. */
  /* D-104. The counter the archive fallback will read, exposed so an operator can
     see WHY a document is or is not eligible, including the governed refusals
     that are deliberately excluded from the verdict. */
  sourcereach:         { classes: ["admin", "member", "probe"], mutating: false },
  /* The archive fallback's DECISION half. Non-mutating: it asks the Internet
     Archive what it holds and applies the rules; capturing the bytes is a
     separate, ordinary op=acquire carrying via=archive.org. Keeping them apart
     means the eligibility fence and the capture path each do one thing, and the
     lookup can be run to ask "would this fire, and why" without fetching
     anything into the record. */
  archivelookup:       { classes: ["admin", "member", "probe"], mutating: false },
  tasks:               { classes: ["admin", "member", "probe"], mutating: false },
  taskdrain:           { classes: ["admin", "member", "probe"], mutating: true  },
  /* REC-28 / D-151: NO PROBE CLASS on the two MEMBER verbs, and the class list is
     the smaller half of that fix. A probe credential has no business forwarding
     or resolving anything — it is the unattended prober, and these two verbs are
     a person's acts — so the table stops advertising it and answers "forbidden
     for token class".
     What the class list CANNOT do is the reason the real fence is in the store:
     `classes` is checked against the caller's CLASS, and a member/admin SESSION
     arrives as exactly that class (index.mjs sets `cls = kind` from the session),
     so "admin"/"member" must stay for the Tasks screen to work at all — and a
     MEMBER_TOKEN or ADMIN_TOKEN machine credential is INDISTINGUISHABLE here from
     the session it must admit. Both still REACH the ops and are refused by the
     store BY SHAPE on the server-stamped actor (MACHINE_CANNOT_FORWARD /
     MACHINE_CANNOT_RESOLVE), the same way release/conclude/reopen are. Removing
     probe narrows who knocks; the act refusal is what answers the door. */
  taskforward:         { classes: ["admin", "member"],          mutating: true  },
  taskresolve:         { classes: ["admin", "member"],          mutating: true  },
  /* Section 8.1. Admin class ONLY, and additionally refused to a SESSION below:
     "the ADMIN_TOKEN-class credential" is not satisfied by a session belonging
     to an administrator, because a session is password-derived and the root of
     trust is the token set in the hosting dashboard. Mutating, because it writes
     the export log: an export that left no trace would defeat the recording. */
  export:              { classes: ["admin"],                    mutating: true  },
  /* The log is READ by in-app administrators who cannot run an export. They must
     be able to see that one happened even though they cannot cause it. */
  exportlog:           { classes: ["admin", "member", "probe"], mutating: false },
  /* D-436 / IC-172 — THE INSTANCE'S PRODUCING GROUP (State Rules v1.5 §3.1), the one value every bundle this
     instance writes names as its `group`. The READ is open to every class that reads the record, AND SINCE
     REC-163 (IC-174) TO THE PUBLIC: `BIO_Publication_v0_1.md` §7 point 1 (BOB #24, 2026-09-21) rules THE SLUG
     PUBLIC — it travels in every published bundle's signed `group` and names the worker, so a stranger learns
     nothing the group has not already published or served. `classes: null` is how this table says public (there
     is deliberately no public CLASS — see the header above), so the op answers through its own handler in the
     unauthenticated branch: a stranger is told the slug, or that none is recorded, and NOTHING ELSE — when and by
     which act it was recorded are not published anywhere, and §7 rules only the slug; a caller whose credential
     the admission gate would admit (a machine class in its namespace, a session, an agent credential in scope)
     is answered the whole row exactly as before. It answers what the store records, and when it records nothing
     it says so. The SEED is the other half of decision (b):
     a store that already held documents when the value arrived records nothing at boot, and is given its group
     by this act, once. RECORDING THE INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN
     CREDENTIAL HELD IN THE HOSTING ACCOUNT, THE CREDENTIAL THE INSTALLER'S OWN CLAIM IS ARMED BY — AND NO
     SESSION OF ANY ROLE REACHES IT: it is named in no SESSION_OPS set, and UNATTENDED_BY_DECISION cites this
     row, so a session is told which credential the verb is addressed to rather than an invented reason. */
  instancegroup:       { classes: null,                         mutating: false },
  instancegroupseed:   { classes: ["admin"],                    mutating: true  },
  /* REC-164 / Publication §7 points 2 and 3. `groupidentity` is PUBLIC on point 1's reasoning, and answers a stranger
     the slug, the display name only beside it, and the domain only while its latest verdict is `verified`; a
     credential the admission gate admits is answered the claim, its state and both dated histories too. The two SET
     acts are an administrator's own session act (`IDENTITY_ACTIONS`): admitted to the three bearer classes only so
     the fence can refuse a bearer BY NAME (C-64.4) rather than by a class list, exactly as the §4 governance acts. */
  groupidentity:       { classes: null,                         mutating: false },
  groupnameset:        { classes: ["admin", "member", "probe"], mutating: true  },
  groupdomainset:      { classes: ["admin", "member", "probe"], mutating: true  },
  /* Section 8.2. classes: null, because published-record reconstruction requires
     NOTHING: the hashes are public and verifiable by any stranger without this
     instance's cooperation or continued existence. It reads the published
     projection and never the working corpus, which is the whole of its safety,
     exactly as op=verify does. */
  publishedmanifest:   { classes: null,                         mutating: false },
  /* What the caller may DO, so an interface builds its controls from the plane
     rather than from a copy that drifts, exactly as op=searchfields does for the
     query language. Section 5's "absent from their interface" is implementable
     only if the interface can ask. */
  whoami:              { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-19, standing doctrine DEC-8: what may be DONE to an object, published
     by the plane so an act surface renders options it received and never
     computes one — whoami's pattern for capabilities, searchfields' for the
     query language, extended to the act construct. Reads the working corpus
     (an object's state and edges), so member class and above, never public;
     when REC-25 stamps the D-15 viewer gate onto the read paths this op should
     take the same stamp. */
  affordances:         { classes: ["admin", "member", "probe"], mutating: false },
  /* S-10 steps 2 to 4: the retrieval surface. It reads the WORKING corpus, so it
     is member class and above and never public, exactly like op=index and
     op=projection. There is no public token class to grant it to and there must
     never be one: a search result carries titles, states, locators and
     authorities, which together name what the group is looking into and how far
     along it is, before there is anything to answer.
     `viewer` is stamped below from the authenticated identity and a
     caller-supplied value is overwritten, because the D-15 visibility gate is
     only a gate if the caller cannot choose whose view it compiles. */
  search:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-9 / D-222 option C: the SAME query compiler, read at MEANING grain — the
     legs a claim rests on and the resolutions a document carries, for the
     bundles `q` selects. Fenced exactly as op=search is and for a STRONGER
     reason: a search result names what the group is looking into, and this names
     what it thinks the evidence establishes. `viewer` is stamped below from the
     authenticated identity, because a gate the caller can choose the view of is
     not a gate. */
  meaningrows: { classes: ["admin", "member", "probe"],          mutating: false },
  /* The vocabulary of the query language, so a UI builds its controls from the
     plane rather than from a copy that drifts. Working-corpus field names, so
     the same fence applies. */
  searchfields:{ classes: ["admin", "member", "probe"],          mutating: false },
  /* The verifier for "the index cannot diverge from the corpus": it re-derives
     the expected text row for every bundle and compares. Read-only. */
  searchindexcheck: { classes: ["admin", "member", "probe"],     mutating: false },
  /* S-10 step 5. A selection is a server-side construct so the set an operator
     selected is the set an action lands on. Two kinds: a QUERY selection, where
     the operator picked a criterion and the current answer to it is the correct
     set by definition, and an ENUMERATED one, where they picked specific items
     and membership is frozen. `select` is mutating because it writes a snapshot;
     it writes nothing about the corpus and a probe-class caller is still
     confined to scratch. */
  select:          { classes: ["admin", "member", "probe"],      mutating: true  },
  selection:       { classes: ["admin", "member", "probe"],      mutating: false },
  selectionlist:   { classes: ["admin", "member", "probe"],      mutating: false },
  selectionrelease:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* The first action that refers to a selection: citing Information in a
     Project, at weight `report`. Mutating, because it promotes the Project with
     the new edges written into its bundle.md; `refs` is a projection of that
     document and is never written directly (D-21). Member class and above like
     every other reader of the working corpus, and there is no public class to
     grant it to. */
  cite:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 3: bulk disposition of Problems, weight `refuse`. Contribute-gated
     like every other corpus write. */
  dispose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 4: bulk retirement of Information, weight `refuse`. Heavier than
     dispose because `retired` is TERMINAL, and it additionally refuses anything
     a live `cites` edge still points at: stranding citations manufactures the
     C-6.2 error condition at whatever scale the operator selected. */
  retire:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 5, the last rung. A machine class REACHES it and is refused by
     the store (MACHINE_CANNOT_RELEASE), fail closed like participation: the
     collected-to-verified transition is a named member's decision (Intake
     Doctrine section 4, C-18.1), and the author stamp below is `token:<class>`
     for a machine, which the store refuses by shape. */
  release:         { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-13: CONCLUDING an inquiry, open -> concluded. Release's shape and
     release's class list for release's reason — a machine class REACHES it and
     is refused by the store (MACHINE_CANNOT_CONCLUDE) rather than being absent,
     fail closed, because "a machine may surface a question and may never author
     the conclusion" is a rule about who the caller IS and is enforced on the
     author stamp below. Unlike its state-action siblings it takes a single
     `target` rather than a selection: one conclusion answers one question, and
     a bulk conclude would be the checkbox the construct exists to refuse. */
  conclude:        { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-136 / INVESTIGATIVE-SESSION.md §7.1 item 7: A PROJECT WITHDRAWS ITS
     CONCLUSION — an act that APPENDS to the relationship's history and never
     overwrites it. Conclude's class list for conclude's reason: a machine
     class REACHES it and is refused by the store (MACHINE_CANNOT_CONCLUDE,
     the same condition) rather than being absent. One `target` and one
     `project`: one project's stance on one question moves at a time. */
  withdrawconclusion: { classes: ["admin", "member", "probe"],   mutating: true  },
  /* REC-31: REOPENING an inquiry the group set down, deferred|dismissed ->
     open. Conclude's class list for conclude's reason — a machine class
     REACHES it and is refused by the store (MACHINE_CANNOT_REOPEN) rather
     than being absent, fail closed, because overturning the group's own
     disposition is a rule about who the caller IS and is enforced on the
     author stamp below. One `target`, like conclude: one question is picked
     back up at a time. */
  reopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-16: DIVIDING an inquiry, open|surfaced|concluded -> divided. Conclude's
     class list for conclude's reason — a machine class REACHES it and is
     refused by the store (MACHINE_CANNOT_DIVIDE) rather than being absent, fail
     closed, because deciding that a question was two questions is a member's
     judgement about the record and the rule is about who the caller IS. One
     `target`, like conclude and reopen: one question is divided at a time, and
     the CHILDREN arrive in the POST body because the apportionment is an array
     of arrays and a query string cannot express one honestly (op=publish's
     precedent exactly). */
  inquirydivide:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-45: AUTHORING THE GROUNDS PARTITION on an inquiry (DEC-32). Conclude's
     class list for conclude's reason — a machine class REACHES it and is
     refused by the store (MACHINE_CANNOT_GROUND) rather than being absent, fail
     closed, because "these reasons are enough on their own" is a member's
     authored judgement about their own argument and the rule is about who the
     caller IS. One `target`, like conclude, reopen and inquirydivide: one
     question's structure is authored at a time. The PARTITION arrives in the
     POST body because it is an array of objects each holding an array of
     ordinals, which a query string cannot express honestly — op=publish's and
     op=inquirydivide's precedent exactly. */
  inquiryground:   { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-2 / IS-2: THE SIX MEMBER OPS OF THE SIXTH STATE MACHINE — the acts that
     settle which reading of the evidence a question's answer rests on.
     Conclude's class list for conclude's reason: a machine class REACHES all six
     and is refused BY THE STORE (MACHINE_CANNOT_MOVE_VERSION) rather than being
     absent from this table, fail closed, because "the AI holds no op that
     accepts" (INVESTIGATIVE-SESSION.md section 4) is a rule about who the caller IS
     and is enforced on the author stamp below.
     One `target` and one `version` each, like conclude and reopen: one reading
     is settled at a time, and a bulk version would be the checkbox these
     constructs exist to refuse. The REASON arrives in the POST body because it
     is prose and a query string is a poor place for a sentence a member wrote. */
  versionaccept:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionreject:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versionconsider: { classes: ["admin", "member", "probe"],      mutating: true  },
  versionrevert:   { classes: ["admin", "member", "probe"],      mutating: true  },
  versioncurrent:  { classes: ["admin", "member", "probe"],      mutating: true  },
  versionhide:     { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-24 (c)/(d): THE TWO OPS THAT OPERATE AN ACTION — the first ops in this
     table whose subject is an action at all. `STATES.action` has carried five
     states and seven edges since the catalog was written and nothing wrote them,
     so IMPACTING had zero reachable processes.
     Conclude's class list for conclude's reason: a machine class REACHES both
     and is refused BY THE STORE (MACHINE_CANNOT_MOVE_ACTION,
     MACHINE_CANNOT_CORRESPOND) rather than being absent from the table, so the
     refusal says what is wrong instead of saying "requires a credential you
     have". An action reaches OUTSIDE this system and touches people who never
     agreed to be in it, and testimony about an exchange is somebody's — neither
     is a scheduler's to author.
     One `target` each, like conclude and reopen: one action moves at a time and
     one entry is appended at a time, and a bulk version of either would be the
     checkbox these constructs exist to refuse. */
  actionmove:      { classes: ["admin", "member", "probe"],      mutating: true  },
  actioncorrespond:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* D-149: stating the laws that govern an action's request. Conclude's class list for conclude's reason: a
     machine class REACHES it and is refused BY THE STORE (MACHINE_CANNOT_SET_LAWS), so the refusal says what
     is wrong. One `target`; the list arrives in the POST body. */
  actionlaws:      { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-214 (BOB #33, 2026-09-24): a member's revision of an action's risk tier — an authored, append-only act with
     a REQUIRED reason. `actionlaws`' class list for its reason: a machine class REACHES it and is refused BY THE
     STORE (MACHINE_CANNOT_SET_RISK_TIER, C-32.19), so the refusal says what is wrong. */
  actionrisktier:  { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-195: the PROPOSAL of that list — D-149's remaining half. `themepropose`'s class cut, for its reason:
     proposing is the MACHINE's half of the ruling, so the `ai` class reaches it through the DEC-55 floor when
     its minted `writes` name it, and the store refuses NOBODY by class here. The fence that matters is one op
     up: a machine is refused at `actionlaws` BY NAME (C-32.18), and this op writes no list at all. */
  actionlawspropose:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* T8 (actions R28, ACTIONS #1 J2.5): a proposed RISK TIER, stored apart and labelled, never touching `risk_tier` —
     `actionlawspropose`'s class cut and reason: proposing is the machine's half, so the store refuses nobody by class,
     and the fence is one op up, at `actionrisktier` (C-32.19). */
  actionriskpropose:{ classes: ["admin", "member", "probe"],      mutating: true  },
  /* S-11 step 2: the first STATE-CHANGING actions to refer to a selection, and
     therefore the first callers of selectionResolve's REFUSING arm. Severing
     withdraws a citation without deleting it and reinstating restores one; both
     require a reason, because the catalog's own remediation for a bad reference
     is "sever with reason" and an edge moved with no reason is an unexplained
     change wearing a status field. */
  sever:           { classes: ["admin", "member", "probe"],      mutating: true  },
  reinstate:       { classes: ["admin", "member", "probe"],      mutating: true  },
  list:       { classes: ["admin", "member", "probe"],           mutating: false },
  image:      { classes: ["admin", "member", "probe"],           mutating: false },
  file:       { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-25: the plane-side gated BACKLINK read — every edge INTO a bundle,
     with the citing bundle filtered by the viewer's position (Membership
     Architecture 7.9). Exists so the UI can delete its client-side
     reverseRefs walk, which rebuilt the reverse-edge leak by walking every
     project's projection. Working corpus, so member class and above; the
     viewer is stamped server-side below like every retrieval read. */
  backlinks:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-17 / P-64: the RE-EVALUATION OBLIGATION, derived on read. Which
     inquiries rest on something that has MOVED — superseded, republished at a
     new edition, deferred, reopened or dismissed — as a query over REC-11's
     reverse index and the supersession reverse column, never a stored flag and
     never a verdict computed from strength. Working corpus, so member class and
     above; the viewer is stamped server-side below like every retrieval read.
     NO `NEEDS` ENTRY, deliberately and on op=governorstate's precedent: a read
     carries no working capability, so REC-19's NEEDS/NON_ACTS totality neither
     gains nor loses a row. */
  reevaluations: { classes: ["admin", "member", "probe"],        mutating: false },
  /* REC-34: REC-12's derived PAIR for one inquiry, GATED — UI-11's delegation
     and UI-12's hard blocker. It answers from `strengthOf()`, the authority,
     and never from the five cached columns (a stale cache must not impersonate
     the derivation). Working corpus, so member class and above, exactly as
     op=backlinks and op=reevaluations are: the pair is what a member reading a
     question needs in order to weigh it, and fencing it to admin would fence a
     member off the one number the whole page is about. The viewer is stamped
     server-side below like every retrieval read. It carries a NEEDS entry of
     null rather than no entry at all — op=queue's precedent, not
     op=reevaluations' — so REC-19's totality guard SEES the op and its
     NON_ACTS row states why a read is not an act on an object. */
  inquirystrength: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-18: what the RECORD earns for each candidate basis leg, GATED. It is
     part of the earned rule rather than a convenience beside it: op=promote
     refuses a leg whose earned grade is not the value the record holds, and a
     member with no way to LEARN that value is a member the refusal pressures
     into guessing — "a gate that pressures someone into inventing one is a bug
     in the gate" (CLAUDE.md). The refusal and this answer come from ONE store
     function, so they cannot disagree. Member class and above on
     op=inquirystrength's reasoning exactly, and the viewer is stamped
     server-side below. NEEDS entry of null with a NON_ACTS row, same shape. */
  earnedbasis: { classes: ["admin", "member", "probe"],          mutating: false },
  /* REC-83 / IC-84 (4): THE FIXED-KEY CONTENT READ — one content row by
     `content_id`: its extent, its human `ref`, the chain and cap it was minted
     under, whether the transcription has since moved (`stale`), and the
     attestations that COVER it.

     MEMBER CLASS AND ABOVE, on op=textattest's reasoning exactly rather than by
     resemblance: what a citation points at, and whether the text under it has
     been checked, is a fact about the record that a view-only member weighing a
     case needs precisely as a contributor does. A probe may ask, because "is
     anything in this store cited at a grain nobody has attested" is a question
     an operator should be able to answer without a session.

     `mutating: false` AND IT WRITES NOTHING — unlike its sibling op=earnedbasis,
     whose backfill arm is declared at its own site. This op resolves a row that
     already exists and mints nothing: an id nothing has cited does not exist,
     and answering NO_SUCH_CONTENT is the whole of what it does about that.

     FIXED-KEY, AND THE REFUSAL IS PART OF THE CONTRACT (D-222): the
     content-grain QUERY arm is stage C, behind D-225's caps. This op takes its
     key and the server-stamped viewer and REFUSES every other parameter by
     name — a predicate or a page is not ignored here, because a parameter
     silently dropped is a filter the caller believes was applied.

     `viewer` is stamped server-side below like every read that names a bundle;
     the store fails closed on an absent stamp and answers a row the caller may
     not see EXACTLY as one that does not exist. That matters more here than on
     most reads: the id is a hash of a capture, an extent and a chain, so an
     answer that distinguished hidden from absent would let a caller confirm a
     passage exists in a project they were never invited to by guessing its
     address. NEEDS entry of null with a NON_ACTS row, op=earnedbasis' shape. */
  content:     { classes: ["admin", "member", "probe"],          mutating: false },
  /* D-419 (T5-11, content R32): THE CROP OF A CITED PDF IMAGE, `content`'s `cropOf`, cut in the store through
     `pdf-pixels`. A READ on op=content's class cut and for its reason: the crop is what a viewer SHOWS for an image
     citation, which a view-only member weighing a case needs as a contributor does. It writes nothing. `viewer` is
     stamped below, and the store answers a row the caller may not see exactly as one that does not exist
     (NO_SUCH_CONTENT). NEEDS null, op=content's shape. */
  contentcrop: { classes: ["admin", "member", "probe"],          mutating: false },
  /* SK-7 / framework Part II §14.4 (Bob's 5.7): MARKING A PASSAGE AS CITABLE.
     *"The assistant may mark passages as citable on its own, every such row
     labelled as machine work, never attested by it, and part of a finding only
     when a member cites it."*

     BEFORE THIS OP THERE WAS NO DOOR AT ALL. A content row came into being only
     inside `op=promote`'s projection, which means a passage became addressable
     at the instant a member had ALREADY cited it — so the EXTRACT role §14.4
     gives the machine had nowhere to land, and `minted_by` (IC-83's column,
     landed with REC-82) could only ever read `plane`.

     `probe` IS ADMITTED, and the cut is a different one from `attesttext`'s two
     lines up rather than a looser one. EXTRACTING is what §14.4 says the machine
     may do — *"document → content … the role that makes everything else
     addressable"* — and the recognisers and fleet members that do it today are
     probe-class by construction. ATTESTING is testimony and is refused to every
     machine credential (C-35.10, UNCHANGED). The two acts sit on opposite sides
     of the one fence this item is about, so they take opposite class cuts and
     the reasoning is written out rather than inherited by proximity.

     `member` IS IN THE LIST AND THAT IS WHAT LETS AN AGENT REACH IT AT ALL —
     `aiReachesAsMember` is the ONLY door for the `ai` class, so this row admits
     no `ai` (no row does) and FL-6's cascade reaches it exactly when the member
     who minted the credential named this op in its declared `writes`. Nothing
     about the class list is special-cased for machines; the floor does it.

     THE MINTER IS STAMPED SERVER-SIDE below and the body's is never read, which
     is the impostor rule at a field whose entire subject is who acted. */
  contentmint: { classes: ["admin", "member", "probe"],          mutating: true  },
  /* SK-8 / `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 — THE EXTRACT RUN'S
     PRODUCTIONS, and the class cut is the one directly above rather than a new
     one. D-358's answer was that EXTRACT runs in DEC-62's RUN with **no new
     runtime, no new credential class, no new fence**, so these two sit in
     `contentmint`'s classes because the write performs `contentmint`'s act
     inside a bounded object. The `ai` class reaches them through the DEC-55
     floor exactly as it reaches that one — the credential's own declared
     `writes` is what admits it, and nothing here is special-cased for machines.

     THE REAL NARROWING IS NOT IN THIS TABLE AND IS NOT IN A CLASS LIST: it is
     the STORE's, where the run object is. `extractPropose` refuses a production
     with no live EXTRACT run by name, and refuses one whose run declares no
     `mints` bound — because a run begins on a member's act (§7.3 (4)) and its
     productions are budgeted in the bounds table it already has (§7.3 (5)).
     `extractpropose` is named in `AI_RUN_ACTIONS` to say what KIND of act it is;
     that array gates nothing. The proposer is stamped server-side below and the
     body's is never read. */
  extractpropose:   { classes: ["admin", "member", "probe"],     mutating: true  },
  extractproposals: { classes: ["admin", "member", "probe"],     mutating: false },
  /* REC-86 / IC-123 — NARROW (Bob's 5.3). The ACT and its candidate READ, and
     the class cut is `contentmint`'s: a member (or an admin, or the probe) may
     reach both. What the ACT refuses to a machine is not decided here — it is
     the store's `NARROW_NOT_A_MEMBER` (C-50.5), on the author the control plane
     stamps below, because a machine arrives honestly named `token:<class>` and
     is refused BY SHAPE rather than by a class list that would also have to
     keep the probe out. The READ is open to every class that may read: a
     machine's proposals are listed to whoever may see the question. */
  narrow:           { classes: ["admin", "member", "probe"],     mutating: true  },
  narrowcandidates: { classes: ["admin", "member", "probe"],     mutating: false },
  /* REC-122 / IC-232 — A MEMBER CHOOSES THE ON-POINT MENTION of one end of a connection
     (D-161 act 3). `narrow`'s class cut and `narrow`'s reasoning: what the act refuses to a
     machine is decided by the store on the author the control plane stamps below
     (`CONNECTION_CHOICE_NOT_A_MEMBER`, C-74.1), so a machine arriving honestly named
     `token:<class>` is refused BY SHAPE and the probe with it. */
  connectionchoose: { classes: ["admin", "member", "probe"],     mutating: true  },
  /* T5-11 (K145, connections R53–R57): connections' ops for the connections derivation does not make.
     `connectionassert` is a MEMBER's assertion of a connection between two documents (R31, R53), and
     `filemembershipjudge` a member's confirmation or rejection of a stored containment (R57): `connectionchoose`'s
     class cut and reasoning, the store refusing a machine BY SHAPE on the `author` the control plane stamps below.
     `filemembershipstore` stores an agenda capture's item-to-file containments as SYSTEM-asserted connections (R49,
     R55); it asserts nothing of the caller's, so it takes the same cut and any credential that reaches it may run
     it. The two reads (R54, R56) are open to every class that may read. All five take the viewer stamp below. */
  connectionassert:    { classes: ["admin", "member", "probe"],  mutating: true  },
  connectionsasserted: { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipstore: { classes: ["admin", "member", "probe"],  mutating: true  },
  filemembership:      { classes: ["admin", "member", "probe"],  mutating: false },
  filemembershipjudge: { classes: ["admin", "member", "probe"],  mutating: true  },
  /* REC-146 / IC-167 — CONTRADICTION'S IDENTIFY, THE PAIRING READ. A pure read on
     `narrowcandidates`' class cut exactly: whoever may READ the record may ask which of
     its assertions are worth comparing. It writes nothing, judges nothing and mints
     nothing, so there is no act here to fence to a person — what it DOES need is the
     viewer, which it takes fail-closed in the stamp block below, because the pairing
     runs AS A MEMBER and pairs only what that member may see. */
  contradictionpairs: { classes: ["admin", "member", "probe"], mutating: false },
  /* REC-147 / IC-318 — CONTRADICTION'S IDENTIFY, THE JUDGEMENT'S WRITE. `extractpropose`'s class cut and for its
     reason: a run's production, reached by the `ai` class through AI_RUN_ACTIONS and by a member or admin session,
     and narrowed where the run object is — the STORE refuses a proposal with no live run in sight, one whose run
     is not the caller's (REC-152's gate), and any proposal over a pair the plane does not itself form for the
     viewer (C-93). The proposer is stamped server-side below and the body's is never read. */
  contradictionpropose: { classes: ["admin", "member", "probe"], mutating: true },
  /* D-148: A FEE QUOTE IS EVIDENCE — the read that sets quotes side by side, by
     counterparty or by request. A pure read on `contradictionpairs`' cut: whoever
     may read the record may read what a body quoted. It takes the viewer
     fail-closed in the stamp block below, because it ENUMERATES across actions. */
  actionquotes:     { classes: ["admin", "member", "probe"],     mutating: false },
  /* N231 (actions R42, K262): the kinds this instance accepts NOW, actions' `kinds()` through the Durable Object route
     `actionkinds`. A READ open to every signed-in class, `actionquotes`' cut: it writes nothing and names no bundle, so
     it takes no viewer stamp and no NEEDS entry (`reevaluations`' precedent). */
  actionkinds:      { classes: ["admin", "member", "probe"],     mutating: false },
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-176: the census of manifest rows a repeated snap key overwrote before `op=promote` refused one
     (`SNAP_KEY_TAKEN`, C-67.1) — per bundle, promotions (row_version) against manifest rows, counted and listed,
     NEVER rewritten. The method a deployed instance runs to learn whether its own history lost a row. Admin and
     probe, `registeraudit`'s fence: it is an audit of the working corpus, and it lists bundle ids. */
  snapkeycensus: { classes: ["admin", "probe"],                    mutating: false },
  /* D-256: every "changed from" sentence the pre-2026-08-08 `addGo` wrote, each resolved through the version chain
     (`op=versionchain`, PL-10) and classed wrong / right / undetermined with the three totals apart. WRITES NOTHING:
     BOB #31 ruled (2026-09-23 22:22Z) that the bodies stay as written and the correction is the read. Admin and
     probe, `registeraudit`'s fence: it is an audit of the working corpus, and it lists bundle ids. */
  changedfromaudit: { classes: ["admin", "probe"],                 mutating: false },
  /* REC-130's sweep said here that `allocid` with `prefix=CASE` disclosing how
     many case identities this year had minted was acceptable — instance-level
     knowledge a member already holds. SUPERSEDED 2026-09-19 by BOB #16 (Membership
     v2 §7, *"A MINTED ID CARRIES NO COUNT"*): a count is a disclosure of existence,
     and "`op=allocid` exposing the same counts … is the same defect, not a reason
     to accept it". REC-151: the plane mints every GATED prefix (PROJ, CASE, DRAFT,
     RVG, TASK) opaque, and this op REFUSES those prefixes (`Store#allocIdOp`,
     C-59.5). A shared prefix (INFO, INQ, …) still counts: everyone may see those
     objects, so counting them discloses nothing. */
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:     { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* A pure read, and computed at read time on purpose: which partition a link
     falls in depends on what the record holds today, not on what it held when
     the document was captured. */
  links:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* PL-10 / D-220: the DOCUMENT-VERSION CHAIN — every version at one address,
     in date order, with its bundle. A pure read, and it adds no state of its
     own: the answer is a JOIN over `captured_locators` and `register`, both of
     which the record has always held, asked through the index that has always
     existed. It sits beside op=links because it is the same kind of question
     asked of the same address key — op=links asks what pointed AT an address,
     this asks what we have HELD at one.
     `viewer` is stamped below from the authenticated identity: the answer names
     a bundle per version, so a member must not be able to learn from a version
     chain what op=list would not tell them. */
  versionchain: { classes: ["admin", "member", "probe"],         mutating: false },
  /* D-394 — THE CROSS-VERSION NOTICE (framework §18.1): does a newer capture exist at
     the address of a document a citation rests on, and is a passage at the same extent
     in it. A pure READ on `versionchain`'s class cut, because it IS that chain asked
     from a citation's side; it writes nothing, so there is no act to fence. `viewer`
     is stamped below, fail-closed, like the chain it reads. */
  versionnotice: { classes: ["admin", "member", "probe"],        mutating: false },
  /* T6-13 (reevaluation R8, R9, R14–R16; K199): reevaluation's six ops beyond the three above.
     `reevaluationraise` is R14's BOUNDED SWEEP that raises the pushed notices, called by `scheduler` or `monitoring`:
     the unattended path, so admin and daemon, `capturerequestdrain`'s cut and reason (K199 records the decision, and
     UNATTENDED_BY_DECISION cites it); it reads under the store's own machine viewer and stamps nothing.
     `reevaluationnotices` (R14's notices, for the queue that renders them) and `reevaluationchanges` (R9's pull read)
     are READS on `reevaluations`' cut, viewer-stamped, and no NEEDS entry, `reevaluations`' precedent.
     `versionadopt`, `versionkeep` (R15) and `reevaluationrecord` (R16) are a member's acts on a reference they hold:
     `conclude`'s cut and reason — a machine REACHES them and the store refuses it BY NAME on the author stamped
     below (MACHINE_CANNOT_ADOPT_VERSION, MACHINE_CANNOT_KEEP_VERSION, MACHINE_CANNOT_RECORD_REEVALUATION) — `contribute` in NEEDS, the
     version acts' capability, and a session op in both sets. */
  reevaluationraise:   { classes: ["admin", "daemon"],                    mutating: true  },
  reevaluationnotices: { classes: ["admin", "member", "probe"],          mutating: false },
  reevaluationchanges: { classes: ["admin", "member", "probe"],          mutating: false },
  versionadopt:        { classes: ["admin", "member", "probe"],          mutating: true  },
  versionkeep:         { classes: ["admin", "member", "probe"],          mutating: true  },
  reevaluationrecord:  { classes: ["admin", "member", "probe"],          mutating: true  },
  /* PL-1 / IS-1: THE BASIS VERSIONS OF ONE INQUIRY — every alternative account
     of the evidence for a question, with its ground partition, the AND/OR
     relationship it states, the derivation edge it came along, and the run that
     proposed it. A pure read, and there is deliberately NO write op beside it:
     versions are authored in `bundle.md` and land through op=promote's own
     projection, so a version table an op could append to directly would be a
     second place to state a fact `bundle.md` already holds (D-21).
     `viewer` is stamped below from the authenticated identity: the answer names
     an inquiry and the bundles its versions rest on, so a member must not learn
     from a version set what op=list would not tell them. */
  basisversions: { classes: ["admin", "member", "probe"],        mutating: false },
  /* PL-14 / IS-7: THE STRENGTH PAIR over ONE reading of a question's evidence
     (§12) — per axis, over two populations, never composed into one number. A
     pure read: it writes nothing, adopts nothing and makes nothing current,
     which is §6 rule 6 as a mechanism rather than a promise (exploring an
     unaccepted reading is CALCULATING OVER IT, never designating it). The
     state-set argument defaults to `accepted` inside the store, so a caller who
     says nothing gets the record's own answer rather than a permissive one.
     `viewer` is stamped below from the authenticated identity: the answer names
     a question and every document its legs rest on, so a member must not learn
     from a strength what op=list would not tell them. */
  versionstrength: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-161 / §12 clause (c): D-195's independence derivation over a PROPOSED
     partition of a question's reasons — the read the elicitation's read-back
     makes BEFORE the member's answers are written. A pure read through the one
     `#independenceOf`; it shows no strength and writes nothing. Same classes and
     the same fail-closed `viewer` stamp as versionstrength, below, because it
     names a question and every document its reasons rest on. REC-192: `version=`
     reads a STORED version's independence ON ITS OWN, with no strength key (BOB #31,
     2026-09-23 22:22Z), under the same classes and stamp. */
  partitionindependence: { classes: ["admin", "member", "probe"], mutating: false },

  /* PL-12 / D-84: the bias object's three ops.
     `biasmanifest` is a READ and is gated on the viewer below, like every read
     in this table that names a bundle.
     `biasadopt` is MUTATING and is deliberately reachable by `member` and not
     only by `admin`: the doctrine puts instance bias in the admins' hands and
     PROJECT bias in the project managers', and a project manager is a member.
     What stops a member adopting on the instance's behalf is not this list — it
     is that the act is ATTRIBUTED, published with the group's work, and refused
     outright to a credential with no name (C-26.9).
     `biasinhale` is MUTATING: FALSE, and that is not an accident of shape, it
     is DEC-54 (c). Reading a policy proposes; it never installs. The method
     holds no write path at all and `test/bias.test.mjs` asserts that off the
     source — this row is the second, weaker statement of the same fence, and it
     is here so that a caller reading the op table learns the fact too. */
  biasmanifest: { classes: ["admin", "member", "probe"],         mutating: false },
  biasadopt:    { classes: ["admin", "member", "probe"],         mutating: true  },
  biasinhale:   { classes: ["admin", "member", "probe"],         mutating: false },
  /* CONTENT-PDF's structure extractor (D-91), exposed as a READ over already-
     captured bytes. It reads the exact R2 object op=capture serves and parses
     it; it writes nothing and holds no PUT arm, so unlike op=capture it is
     genuinely non-mutating. That gives it the SAME effective posture as an
     op=capture GET — admin/member/probe class, a signed-in session reaches it
     with no capability, no write gate — without the GET special-case op=capture
     needs only because op=capture also writes. No new permission is invented. */
  pdfstructure: { classes: ["admin", "member", "probe"],         mutating: false },
  runtime:    { classes: ["admin", "member", "probe"],           mutating: false },
  /* Turning resolved links into traversable edges WRITES, so it is its own op
     rather than a flag on the read. A mutating arm hiding inside a
     non-mutating op would pass the gate that exists to stop exactly that. */
  linkproject:{ classes: ["admin", "member", "probe"],           mutating: true  },
  /* Burns compute deliberately to find where the runtime cuts it off. Probe and
     admin only: it belongs nowhere near a member's session. */
  cpuprobe:   { classes: ["admin", "probe"],                     mutating: true  },
  /* Acquisition: the fetch layer the intake doctrine calls M2'. It writes bytes
     and no bundle state, because the doctrine is explicit that no intake path
     writes live state and the daemon and the member are writers like any other. */
  /* REC-33: `daemon` is admitted HERE so the class can reach the op at all, and
     is then confined to the ARCHIVE ARM inside the handler — the direct arm
     refuses it by name. The confinement cannot live in this table, which knows
     only the op, so the two halves are asserted together in
     test/daemon-token.test.mjs: admitted here, refused there. */
  acquire:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* Co-attestation. Asks a timestamp authority to attest that a capture existed
     at a claimed instant, which is the one part of provenance a group cannot
     fabricate for itself. */
  attest:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* The monitor. Checks whether a monitored source still serves what was
     captured and records the answer as a mechanical monitor-tick, inside the
     field set C-20.1 holds that operation to. */
  /* REC-33: the FIRST of the daemon class's two verbs, and the whole of it —
     op=monitor is admitted wholesale because the op IS the unattended job; it
     has no second arm to confine the class to. */
  monitor:    { classes: ["admin", "member", "probe", "daemon"], mutating: true  },
  /* A conformance pass over the whole store, run inside the Durable Object where
     the images already are. Read-only, paginated, and resumable by cursor. */
  audit:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-54 / D-200. Rebuild a document's provenance chain FROM THE EVIDENCE the
     capture record already holds, or refuse and name what is missing. Mutating,
     but it REPORTS by default and writes only on `apply=1`, because every use of
     it is a correction to the real record. NOT open to `daemon`: deciding that
     the evidence supports a route is a named member's judgement, which is the
     same line op=release and op=reopen already draw, and the whole risk this op
     carries is a chain nobody witnessed being written by something unattended. */
  provenancechain: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-63 / DEC-56 / D-204. ASSESS a document's provenance route and record
     what was found — the standing MARKER Bob's ruling licenses, at the state the
     document already sits in. Mutating because it writes a marker row, and it is
     the ONLY thing it writes: no state moves, no file changes, no sha changes.
     NOT open to `daemon`, on op=provenancechain's own line: deciding that the
     evidence does not support a route is a named member's judgement about the
     record, and a standing statement in the record with nobody's name on it is
     not a statement. */
  provenanceroute: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* REC-116 / IC-120: the READ half. `mutating: false` is the whole point of the
     row — for 39 days the only op over this table was the WRITE above. */
  provenanceroutes: { classes: ["admin", "member", "probe"],     mutating: false },
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify:       { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-14. The state act that AUTHORS a case: it writes the completeness
     assertion, the declared subject position, both frozen strengths and the
     declared bar into the bytes op=ratify then signs. Separate from ratify
     because authoring the assertion CHANGES THE SHA -- you cannot sign first
     and write the caveat later. */
  publish:      { classes: ["admin", "member", "probe"],           mutating: true  },
  strengthbar:  { classes: ["admin", "member", "probe"],           mutating: true  },
  strengthbarof:{ classes: ["admin", "member", "probe"],           mutating: false },
  publishededitions: { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-22, the PUBLIC READ PATH. `classes: null` — NO credential of any kind,
     and it is the same argument op=verify and op=publishedmanifest already make
     rather than a new one: both read the PUBLISHED PROJECTION ONLY
     (published_bundles, published_shas, published_edges and the PUBLISHED
     bucket), all of which are written by ratification alone, so there is no
     working material for a missing predicate to leak. That is the property
     schema.mjs:172 says those tables exist to guarantee, and REC-30's sweep
     records both ops as deliberately ungated for exactly this reason.

     publishedcase answers by BUNDLE ID (with an optional edition, latest by
     default) or by BUNDLE SHA, which resolves to ITS OWN edition — DEC-12's
     "edition 1 still answers after edition 2 lands", checkable rather than
     stated. publishedbytes answers BY HASH AND NEVER BY PATH, so the published
     corpus cannot be walked: a sha with no published_shas row 404s, and it 404s
     identically whether it was never ratified or never existed. */
  publishedcase:  { classes: null,                                 mutating: false },
  publishedbytes: { classes: null,                                 mutating: false },
  /* CASE-4 / DEC-72: THE REVISION FLAGS ON A PUBLISHED CASE. A case is a frozen,
     signed edition honest as of its date; when a member finding is later revised
     the containing cases are FLAGGED, set-but-never-clear until each owning
     project acts. This is where a reader — a member deciding whether to publish
     a new edition, or a stranger weighing how current a case is — sees which
     flags stand and which were discharged.

     `classes: null` — UNGATED, on publishedcase's own reasoning above and not on
     a new one. Every fact in the answer is already public: the case editions and
     their rosters come out of op=publishedcase, the pinned hash is in the
     container manifest a stranger verifies against, and the revised hash is a
     published version's own. Nothing here reads working material, so there is no
     working material for a missing predicate to leak — and gating it would
     withhold from a member exactly what the published record already tells
     anybody. NO `NEEDS` ENTRY, on op=reevaluations' precedent: a read carries no
     working capability, so REC-19's NEEDS/NON_ACTS totality neither gains nor
     loses a row. */
  caseflags:      { classes: null,                                 mutating: false },
  /* CASE-5b / DEC-72: THE CASE-LEVEL SIGNING CEREMONY, and it is two ops
     because reviewing and signing are two acts.

     `casedocument` is UNGATED (`classes: null`) on op=publishedcase's own
     reasoning and not a new one. A RATIFIED case document is signed published
     bytes a stranger is entitled to check — it is the artifact the container
     carries, and gating it would make the stranger-verification path depend on
     this instance's goodwill, which is the one thing that path exists to refute.
     AN UNRATIFIED one is working material and — CORRECTED by REC-130 / IC-141,
     2026-09-18 — it answers ONLY to standing in the owning project. This comment
     used to say it was answered to anybody, "deliberately", because the answer
     says `ratified: false`; that was a mechanism choice with no ruling behind it,
     and it handed a stranger the group's scope, roster, exclusions and bias
     acknowledgement before any member had signed them, over ids that come off a
     sequence. BOB #14 ruled it as the publication fence applied: every caller
     without standing is answered EXACTLY as for a case that does not exist, so
     enumeration learns nothing. The op stays `classes: null` because the signed
     half must stay public; `caseReader` resolves who is asking without refusing
     anybody, and the store's `caseDocumentFacts` decides.

     `caseratify` is GATED like `ratify`, and to the same classes: it is the
     publication surface, and the registered signing key governs the authority on
     top of the capability. No fifth capability token is minted. */
  casedocument:   { classes: null,                                 mutating: false },
  caseratify:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-126 / DEC-31 / IC-145: THE REVIEW COPY (`BIO_Publication_v0_1.md` §6A),
     an addressed act BESIDE publish that never leaves the instance.

     `casedraft`, `reviewgrant` and `reviewrevoke` are GATED to the classes that
     reach `publish`. Their capabilities and authority are §6A.2's (BOB #15, built
     by REC-133; the NEEDS rows carry the reasoning): AUTHOR = the project's edit
     permission (`contribute` in NEEDS, owner-or-joined in the store); ISSUE = the
     project OWNER (`publish` in NEEDS, `publishCase`'s owner predicate in the
     store, no administrator bypass); REVOKE = the same, unchanged (§6A.2 as
     corrected: administrators direct nothing). The store refuses a machine by name,
     so a machine class reaching the op is refused at the act rather than here.

     `reviewcopy` and `reviewcomment` are UNGATED (`classes: null`) on
     `casedocument`'s reasoning, because their whole point is a RECIPIENT who
     holds no credential of this instance — only the grant's read SECRET, which is
     not a token, is never classified, and cannot reach any other op. A member
     reaches both with an ordinary session through the same `caseReader` the
     unsigned case document uses. Both answer every caller without a live grant or
     standing with ONE set of bytes. `reviewcomment` is `mutating: true` because it
     writes a row; its NEEDS entry is below with its reason. */
  casedraft:      { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewgrant:    { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewrevoke:   { classes: ["admin", "member", "probe"],           mutating: true  },
  reviewcopy:     { classes: null,                                   mutating: false },
  reviewcomment:  { classes: null,                                   mutating: true  },
  /* D-150 / BIO_Publication_v0_1.md §3 rule 11: THE EXCLUSION STATEMENT'S ACKNOWLEDGEMENT.
     UNGATED on `reviewcomment`'s reasoning and through its two doors, because one of the two
     people rule 11 names — a review-copy recipient — holds no credential of this instance, only
     the grant's read secret. A member acknowledges with an ordinary session, of a draft or of an
     unsigned case document; the store asks the POSITION (a joined participant, not the author).
     `mutating: true`: it writes a row. It gates nothing, and nothing gates on it. */
  statementack:   { classes: null,                                   mutating: true  },
  /* REC-198 / BOB #32 (2026-09-23 23:08Z; BIO_Publication §3 rule 15 (a)): the LIST of a project's drafts, fenced exactly
     like reading one draft. GATED, unlike `reviewcopy`: the list has no recipient door — a grant reads ONE
     draft and names it — so only the member door exists here, and a caller holding no credential of this
     instance has no business at it. The fence is the store's `#seesProjectDrafts`, the very predicate the
     single read's member door calls, fed the same server-stamped `viewer`. */
  casedrafts:     { classes: ["admin", "member", "probe"],           mutating: false },
  excludedby:   { classes: ["admin", "member", "probe"],           mutating: false },
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  /* REC-159 (Membership v2 §4.9: each custodial act is EVERY administrator's): `member` joins
     the four rows below so an ENROLLED administrator's session, whose `kind` is `member`,
     passes this table; the roster then decides (`CUSTODIAL_ACTIONS`). `machineClasses` is
     what keeps that from being a widening for anybody else: a caller that did NOT arrive by
     a session is judged against it instead of `classes`, so the MEMBER_TOKEN bearer and an
     `ai` credential stay refused exactly as they were, and the operator's `admin` and
     `probe` bearers keep the reach BOB #22 ruled they keep. */
  memberadd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  /* The membership model's member half. `memberadd`, `memberset`, `membercaps`,
     `adminendorse` and `adminremove` are ADMINISTRATOR acts: section 4 governance,
     decided by the roster (REC-159 moved the first two, with `signeradd` and
     `signerset`, onto D-136's footing below).
     D-136: the last three gain `member` and a server-stamped `by`
     (`GOVERNANCE_ACTIONS` below), and the grant is `expertiseconfirm`'s six
     rows up rather than a new idea — an ADMINISTRATOR-ONLY act carrying
     `["admin","member","probe"]` because `kind` for every signed-in person but
     the founder is `member`, so a class list without it refuses every real
     administrator's browser with CLASS_FORBIDDEN before the session gate is
     ever reached. MEASURED, not reasoned: the first draft of this item left
     these three lists alone and ruth, an enrolled administrator, was refused
     CLASS_FORBIDDEN at her own endorsement.
     **THE GRANT IS NOT A WIDENING OF WHO MAY GOVERN.** What decides these acts
     is the ROSTER: the `by` stamp names whoever is signed in and the store
     refuses a `by` that is not an active administrator, by name. An ordinary
     member reaching them is told NOT_AN_ADMIN — the thing that is true — which
     is `expertiseconfirm`'s ADMIN_ONLY and `conclude`'s fail-closed posture. The
     `member` CLASS also admits the MEMBER_TOKEN bearer, which
     `is-operator-governance-act` refuses along with every other bearer, keyed on
     how the caller arrived rather than on a class list that would go stale.
     `memberlist` is NOT, and this comment used to say it was — the second of
     D-157's three self-contradicting sites, sitting two lines under the entry
     that is the first: a grant of admin, member AND probe, which was the
     TRUTHFUL one. Section 3 gives members and the public the
     HANDLE roster ("Members and the public see handles"); what only
     administrators see is the cover↔handle PAIRING ("Pairing. Only
     administrators see cover and handle together"). That distinction cannot be
     expressed by a class ACL — the op must stay reachable by the callers who
     must not see the pairing — so it is a PROJECTION in Store.memberList(),
     driven by the `administer` stamp set beside the D-15 viewer stamp below.
     `adminarith` is a read of the rule itself, so a UI can tell a group what a
     removal would take before they begin one. */
  membercaps:   { classes: ["admin", "member", "probe"],           mutating: true  },
  adminendorse: { classes: ["admin", "member", "probe"],           mutating: true  },
  adminremove:  { classes: ["admin", "member", "probe"],           mutating: true  },
  adminarith:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* N43 (T4): membership's three rules built in T3 (N18) — an administrator's resignation (R10), the record of who
     holds hosting access (R11) and a member's published cover-and-handle pairing (R19). They were routed in the
     store and absent HERE, so every caller got "unknown op": this file's own standing lesson 5 again. The three
     acts are `ROSTER_SELF_ACTIONS` below: both session sets and a server-stamped `by`, and the ROSTER decides
     (the store refuses a `by` that may not act, by name). `member` in `classes` for `memberadd`'s reason — an
     enrolled administrator's session is a `member` kind — and `machineClasses` keeps the MEMBER_TOKEN bearer and
     an `ai` credential out as REC-159 does. The two reads serve the record as membership answers it. */
  adminresign:      { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccessset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  hostingaccess:    { classes: ["admin", "member", "probe"],           mutating: false },
  memberpairingset: { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  memberpairings:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* D-9: why a register row is unreferenced. A read that classifies every row
     against what the store actually holds, so the 20 unexplained rows on the
     live instance stop being a plausible story and become a measured one.
     Admin, because the register is intake provenance for the working corpus. */
  registeraudit:{ classes: ["admin", "probe"],                     mutating: false },
  /* REC-175: the digest census — every row already held (the live image and the history) whose stored sha256
     disagrees with its own stored bytes, counted and listed, NEVER rewritten. The method a deployed instance runs
     to learn whether `op=promote`'s old unchecked digest left a false one behind. Admin and probe, as
     `registeraudit` beside it: it is an audit of the working corpus, and it lists paths. */
  digestcensus: { classes: ["admin", "probe"],                     mutating: false },
  /* REC-190: the census of displaced homes — every `files` / `history` row whose sha the register assigns to a
     DIFFERENT bundle that still exists (D-179's residue: the pre-fence promote MOVED a register row), both bundles
     named, NEVER repaired; which bundle held it first is undetermined and the answer says so. Admin and probe, as
     `digestcensus` beside it: an audit of the working corpus that lists bundle ids and paths. */
  homecensus:   { classes: ["admin", "probe"],                     mutating: false },
  /* CONSTRUCTS Step 3 (FW-5): the reading persisted at promote. `reading` reads
     one captured document's reading (entities + document facts) by its capture
     sha; `readingref` is the reverse index — which documents' readings carry a
     raw entity reference (kind:key, as it appears, unresolved). Both read-only:
     a member watching the record may see what kind of thing the plane read out of
     a document and which other documents mention the same reference. */
  reading:      { classes: ["admin", "member", "probe"],           mutating: false },
  readingref:   { classes: ["admin", "member", "probe"],           mutating: false },
  /* REC-36: the same reverse question asked by NAME. Entity-driven and not
     name-driven on purpose: the measurement (MEASUREMENTS.md 2026-08-04) found
     abbreviations in the corpus whose full names appear in no label, and only a
     name somebody registered reaches those. Read-only, and it establishes nothing:
     it offers CANDIDATES for a member to confirm, and op=resolve is still the only
     thing that grades.

     REC-40 WIDENED IT TO EVERY TIER, and the two ops are no longer split by which
     tier they can reach. As REC-36 shipped, `readingname` answered on the NAME a
     reading recorded (8.1's grade C) and `readingref` on the REFERENCE STRING, so
     the A and B tiers — a document whose reference, or whose reference key, is
     spelled like one of the subject's registered names — were proposable only by a
     caller who already knew the exact string to ask for, and after UI-26 traded the
     per-name loop away they were proposable from no surface at all. The term index
     now carries all three of the strings `#recognise` grades on, each under its own
     source, so ONE `readingname` call answers every tier at one indexed lookup,
     gated identically, and each candidate says which string carried the name and
     what op=resolve WOULD mint for it.

     THE TWO OPS ANSWER DIFFERENT QUESTIONS AND ARE DELIBERATELY NOT COLLAPSED.
     `readingref` takes a raw reference string FROM THE CALLER and answers which
     documents carry exactly it, knowing nothing about the registry; `readingname`
     takes a REGISTERED SUBJECT and walks its own aliases into the index. A caller
     holding a reference string and no entity still has only the first, and one
     answering on behalf of a subject wants the second. `readingref` is unchanged. */
  readingname:  { classes: ["admin", "member", "probe"],           mutating: false },
  /* CPDF-10 — THE TRANSCRIPTION PROVENANCE SURFACE, and the three-way split is
     the item's doctrine expressed as a capability boundary rather than as a
     comment.

     `textprovenance` and `textattest` are READS on the same terms every other
     reading read is on: what a document's text was produced BY is a fact about
     the record, and a view-only member weighing a case needs it precisely as a
     contributor does — op=earnedbasis' reasoning, one axis over. A probe may
     ask, because "is anything in this store OCR'd" is exactly the question an
     operator should be able to answer without a session.

     `attesttext` IS DIFFERENT IN KIND, and the difference is the whole item.
     Attesting is a person saying they compared this text against the image of
     the page — it is testimony, it carries their name for as long as the record
     lasts, and there is no version of it a token can perform. So it is
     `mutating: true` (SESSION_OPS therefore keeps a machine credential off the
     session route) AND `checkAttestation` refuses a machine stamp at the store.
     TWO FENCES ON PURPOSE: REC-45 measured that the gate accepted
     `asserted_by: token:member` while eleven hand-typed copies of the same
     question disagreed, so an act this consequential is refused at the door it
     is asked at and again at the door it is written through. */
  textprovenance: { classes: ["admin", "member", "probe"],         mutating: false },
  textattest:   { classes: ["admin", "member", "probe"],           mutating: false },
  attesttext:   { classes: ["admin", "member"],                    mutating: true  },
  /* REC-87 / IC-128 — TRANSCRIBE (Bob's 5.2), and the class cut is `attesttext`'s
     one row up for `attesttext`'s reason: typing what a page says, and attesting
     somebody else's typing, are both a person's word carrying their name for as
     long as the record lasts. `mutating: true` keeps a machine credential off
     the session route, and the store refuses a machine stamp BY NAME again
     (C-52.1 for the typist, C-35.10 for the attestor) — two fences on purpose.
     The READ is open to every class that may read, on `op=content`'s terms. */
  transcribe:          { classes: ["admin", "member"],             mutating: true  },
  transcriptionattest: { classes: ["admin", "member"],             mutating: true  },
  transcription:       { classes: ["admin", "member", "probe"],    mutating: false },
  /* MK-1 / D-184 / IC-133 — TESTIFY: a member records a firsthand observation,
     which becomes an authored INFO bundle whose bytes are their words
     (MEMBER-KNOWLEDGE-DESIGN.md section 2). The class cut is `transcribe`'s one
     row up and for its reason: a person's word in their own name. NAMED `testify`
     because `op=claim` is the instance-claim op and the design's own word for
     the route is "the testimony path"; `resolvetestify` is a DIFFERENT act (a
     member's grade-D testimony that a document concerns a subject), and the two
     share the verb because both are a member's word standing on their trust. The
     store refuses a machine stamp BY NAME (C-53.1) — two fences, `transcribe`'s. */
  testify:             { classes: ["admin", "member"],             mutating: true  },
  /* MK-4 / IC-136 — THE LEAD (D-194, MEMBER-KNOWLEDGE-DESIGN.md §5). Writing a
     lead and recording that you followed it are a PERSON's acts in their own
     name — what they were told, where they looked — so both are `transcribe`'s
     class cut: `mutating: true` keeps a machine credential off the session route
     and the store refuses a machine stamp BY NAME again (C-54.2, C-54.8). The
     READ is open to every class that may read; the store answers a lead the
     viewer may not read exactly as one that does not exist (C-54.5). */
  lead:                { classes: ["admin", "member"],             mutating: true  },
  leadlook:            { classes: ["admin", "member"],             mutating: true  },
  /* BOB #14's ruling (2026-09-18): the AUTHOR shares a lead to a project, an
     authored dated act — `lead`'s class cut and reason. */
  leadshare:           { classes: ["admin", "member"],             mutating: true  },
  /* MK-7 — THE ATTRIBUTION ACT (MEMBER-KNOWLEDGE-DESIGN.md §4.2–§4.6): an observation's AUTHOR chooses
     what one case edition publishes of who said it. A person's decision about their own words, in their
     own name — `testify`'s class cut and reason; the store refuses a machine stamp BY NAME (C-92.1). */
  attribute:           { classes: ["admin", "member"],             mutating: true  },
  leadread:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-681 (T5-11, observation-log R20): the leads THIS viewer may read, each once — `leadread`'s class cut and fence. */
  leadlist:            { classes: ["admin", "member", "probe"],    mutating: false },
  /* D-162 / IC-241 — THE THEME (BIO_Content_Framework_v0_10.md §8.4, Bob's ruling of 2026-09-21).
     DECLARING a theme and PLACING a document in one are a PERSON's acts in their own name — a lens
     and a judgement against its test — so both take `lead`'s class cut: `mutating: true` keeps a
     machine credential off the session route, and the store refuses a machine stamp BY NAME again
     (C-81.2, C-81.7). PROPOSING is the machine's half of fence 3 and takes `contentmint`'s cut
     instead: admin, member and probe, and the `ai` class through the DEC-55 floor when its minted
     `writes` name it — the proposal is a HUNCH, never membership, whoever proposes it. The READ is
     open to every class that may read; placements are gated per document by the viewer stamp. */
  themedeclare:        { classes: ["admin", "member"],             mutating: true  },
  themeplace:          { classes: ["admin", "member"],             mutating: true  },
  themepropose:        { classes: ["admin", "member", "probe"],    mutating: true  },
  themeread:           { classes: ["admin", "member", "probe"],    mutating: false },
  /* T5-11 (connections R43): WITHDRAWING a membership or REJECTING a hunch is a person's act in their own name, with a
     reason, so it takes `themeplace`'s class cut; the store refuses a machine actor by name (C-81.11). */
  themewithdraw:       { classes: ["admin", "member"],             mutating: true  },
  /* REC-203: the identifier-space judgement (Framework §8.3). A READ: it writes nothing, and a pair's two
     captures are gated by the viewer stamp, `themeread`'s posture. */
  idmatch:             { classes: ["admin", "member", "probe"],    mutating: false },
  /* CPDF-13 — THE CALIBRATION SURFACE (D-183, D-253), and the class split is a
     different cut from CPDF-10's above because a different thing is at stake.

     THE TWO READS are on the same terms every reading read is: what an engine
     was measured at, and which transcriptions rest on a measurement that has
     since moved, are facts about the record. `calibrationdrift` in particular
     is the answer to "is anything in this store graded against a number nobody
     stands behind any more", and withholding that from a view-only member
     weighing a case would be the record knowing something about its own
     reliability that the person relying on it may not ask.

     `calibrate` IS THE CONSEQUENTIAL WRITE and is nonetheless open to `probe`,
     which is the opposite of `attesttext` beside it — so the reasoning is
     written out rather than assumed. ATTESTING IS TESTIMONY: a person says they
     compared this text against the image, it carries their name for as long as
     the record lasts, and there is no version of it a token can perform.
     CALIBRATING IS MEASURING: a probe ran, over stated inputs, and produced
     stated scores, and a machine is exactly the right thing to do that — the
     scheduled re-probe this item builds is a machine act by construction. The
     fence that matters here is therefore NOT about who may measure; it is that
     a measurement may never move a GRADE, and that is enforced structurally at
     the store (`CAL_CANNOT_REGRADE`) and by the drift handler writing nothing.
     Admitting `probe` and then refusing the grade move is the honest shape;
     refusing the machine and letting the grade move would be the fence in the
     wrong place, which is the defect this project meets most.

     `calibrationsignal` is the WEAKEST act in the plane and is open for the
     same reason: it records that a vendor announced something, carries no
     fidelity, and can only ever pull the next probe EARLIER. */
  calibrations: { classes: ["admin", "member", "probe"],           mutating: false },
  calibrationdrift: { classes: ["admin", "member", "probe"],       mutating: false },
  calibrate:    { classes: ["admin", "member", "probe"],           mutating: true  },
  calibrationsubject: { classes: ["admin", "member", "probe"],     mutating: true  },
  calibrationsignal: { classes: ["admin", "member", "probe"],      mutating: true  },
  /* CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY / entity axis (D-83 —
     the framework's entity axis and the bias doctrine's safeguard-4 subject registry
     are ONE construct). Members BUILD the registry: entitycreate registers a subject
     (with inline aliases), entityalias attaches an alias, relationdeclare declares a
     CONSTITUTIVE relation (proxy_for/member_of/overlaps) carrying a justification +
     citation and NO connection grade (a declared relation is not on the §8.1 grade
     axis; grading it Grade D is the category error D-83 names). The three writes
     stamp declared_by from the session, like expertisedeclare. The reads (entity by
     key, entitybyalias, relation by id) are read-only. Members author and read the
     registry; probe is admitted so the surface is exercisable. */
  entitycreate: { classes: ["admin", "member", "probe"],           mutating: true  },
  entityalias:  { classes: ["admin", "member", "probe"],           mutating: true  },
  relationdeclare:{ classes: ["admin", "member", "probe"],         mutating: true  },
  /* T5-11 (entities R8, K106): the registry CORRECTED without being erased — an alias or a relation withdrawn with a
     reason, kept and shown as withdrawn. A registry write on the three writes' class cut, stamped below with the
     withdrawing member as they are with the declaring one. */
  aliaswithdraw:  { classes: ["admin", "member", "probe"],         mutating: true  },
  relationwithdraw:{ classes: ["admin", "member", "probe"],        mutating: true  },
  entity:       { classes: ["admin", "member", "probe"],           mutating: false },
  entitybyalias:{ classes: ["admin", "member", "probe"],           mutating: false },
  relation:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISERS. `resolve` runs the recogniser
     over a captured document's reading references and stores each resolution with its
     §8.1 connection grade (A source's own composite identifier, B the source's bare
     identifier in content, C name correspondence — never D, which the machine never
     mints); `resolvetestify` is the member's grade-D TESTIMONY path (an author and a
     date, the member's stated basis, no captured document). Both mutate and stamp
     resolved_by from the session below.
     `resolutions` reads a document's resolutions; `concerns` is the REVERSE INDEX —
     every document that concerns an entity, joined on entity_id, never through a
     declared relation. Both read-only; probe admitted so the surface is exercisable. */
  resolve:        { classes: ["admin", "member", "probe"],         mutating: true  },
  resolvetestify: { classes: ["admin", "member", "probe"],         mutating: true  },
  resolutions:    { classes: ["admin", "member", "probe"],         mutating: false },
  concerns:       { classes: ["admin", "member", "probe"],         mutating: false },
  /* CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA and the PROGRESSION
     DEFINITION as data (framework §8/§8.1/§8.2 — absorbs D-67 storage + D-72 grade).
     `connect` DERIVES and persists the connections among the documents that concern one
     entity, each carrying the §8.1 grade of its WEAKER end (the two-node base case of a
     progression); `connections` reads them by entity or by capture; `progressiondefine`
     authors a progression's ordered stages as data (both example progressions expressible
     as rows), stamping the declaring member below; `progression` reads one. The two writes
     mutate; the two reads are ungated like the FW-7 reads. Probe admitted so the surface is
     exercisable. */
  connect:          { classes: ["admin", "member", "probe"],       mutating: true  },
  connections:      { classes: ["admin", "member", "probe"],       mutating: false },
  progressiondefine:{ classes: ["admin", "member", "probe"],       mutating: true  },
  progression:      { classes: ["admin", "member", "probe"],       mutating: false },
  /* CONSTRUCTS Step 5, SLICE B (FW-9): PROGRESSION INSTANCES and the MISSING-PREDECESSOR
     finding (M4's acceptance). `thread` threads REAL captured documents through a definition's
     stages by a threading entity — only documents that RESOLVE to it (FW-7) — and stamps the
     threading member below; `instance` reads the instance with its grade (the WEAKEST
     connection along the N-stage chain, D-73 pair→chain) and its missing-predecessor findings,
     both DERIVED on read. `thread` mutates; `instance` is ungated like the other reads. */
  thread:           { classes: ["admin", "member", "probe"],       mutating: true  },
  instance:         { classes: ["admin", "member", "probe"],       mutating: false },
  /* CONSTRUCTS Step 5, SLICE C (FW-10): EXCEPTION DOCUMENTS that discharge a lawful skip
     (framework §8.2). `discharge` records an exception document against an instance's stage — a
     real captured document that RESOLVES to the threading entity (FW-7) and NAMES a real stage,
     carrying reason + citation — and stamps the declaring member below; op=instance then renders
     that missing required stage as a "discharged" state, not a missing-predecessor finding.
     `exceptions` reads the raw discharge rows. `discharge` mutates; `exceptions` is ungated like
     the other progression reads. */
  discharge:        { classes: ["admin", "member", "probe"],       mutating: true  },
  exceptions:       { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-6: the DISCOVERY feed for DERIVED findings (UI-5's delegation). `proposals` walks every
     progression instance at READ time for its missing-predecessor findings and returns them BOTH
     raw-per-instance (the shape UI-5's loadProposals already consumes) and D-79-aggregated (one
     proposal per (progression_key, stage_key), N instances, weakest grade, surfaced_by machine).
     It REPORTS and never mutates — derived things inform — and is ungated like the other
     progression reads (op=instance / op=exceptions): a member session reads the record's own
     questions. It needs no scheduled alarm; the PUSH walking-task is a separate later item. */
  proposals:        { classes: ["admin", "member", "probe"],       mutating: false },
  /* REC-7: record a member's DEFER/DISMISS of a derived proposal WITHOUT minting a bundle (UI-5's
     second delegation). op=dispose disposes a focus BUNDLE; a proposal is not a bundle, and D-79
     settles that declining ages a finding with a recorded reason — it does not author. So this
     MUTATES (it writes one disposition row) but mints no bundle, opens no focus, attributes nothing
     beyond the disposition. Contribute-gated like the other progression writes; the deciding member
     is stamped server-side below, and op=proposals then ages the disposed proposal out of open. */
  proposedispose:   { classes: ["admin", "member", "probe"],       mutating: true  },
  /* REC-9: the per-document progression lookup (UI-9's delegation). `captureprogressions` maps a
     CAPTURE back to the progression instances it is threaded into, its stage in each, and each
     instance's missing_predecessor + overdue_successor findings — the ONE derivation point
     (#assembleInstance + REC-8's #overdueFindings), keyed by capture instead of by (progression,
     entity). No existing op answers it: op=instance needs BOTH (progression_key, entity_id), and
     op=proposals walks every instance but carries no capture_sha. It REPORTS and never mutates —
     derived things inform — and is ungated like the other progression reads (op=instance /
     op=proposals): a member session reads this document's place in the record's processes. Takes the
     same optional `now` as-of clock op=proposals takes. */
  captureprogressions:{ classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-20 / DEC-16: the member's ONE queue. OBLIGATIONs (from `tasks`) and
     FINDINGs (from the proposals derivation) in ONE contract, each carrying its
     `class`, its `options[]` (REC-19's derivation, never a surface's copy) and
     its `case` — EVERY ancestor over a bounded walk of the basis and citation
     edges. It REPORTS and never mutates. Member class and above and never
     public: a queue names what the group is working on and who owes what, which
     is the working corpus. `member` AND `viewer` are stamped server-side below
     — whose queue this is, and whose view its case names are compiled for, are
     server decisions or they are not decisions at all (D-15 §7.9: the queue is
     the one surface every member opens by habit, so it is the one that must not
     leak a project identity). */
  queue:              { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-21 / D-125: the queue's PERSONAL half, and NO PROBE CLASS on either —
     which is the deliberate part. A machine credential has no member behind it,
     so there is no attention for it to be a preference ABOUT; admitting probe
     and refusing inside would be inventing a member in order to refuse them.
     This is not the D-151 fence-versus-act question (an unassigned task is a
     real object a machine could reach and must not resolve); it is that a mute
     with no member is not a thing that exists. The store refuses NO_MEMBER too,
     so a bypass fails closed rather than writing a row keyed on nothing.
     BOTH MUTATE, and they mutate ONE table: `queue_state`. Neither writes to
     `tasks` or `proposal_dispositions` and neither mints a bundle — the
     op=proposedispose precedent carried one step on. Declining is not
     authoring; a preference is not even a disposition. */
  queuemute:          { classes: ["admin", "member"],               mutating: true  },
  queuesnooze:        { classes: ["admin", "member"],               mutating: true  },
  /* T6-13 (intent R2–R18, K207; INTENT #1 REPORT J4.2): INTENT's seventeen ops — the objective's condition, progress
     and gaps; goals; aspirations; the discovery loop's proposals and triage; working an objective.
     THE TEN ACTS take `conclude`'s cut for `conclude`'s reason: a machine REACHES each and the store refuses it BY
     NAME on the `author` stamped into the body below (MACHINE_CANNOT_SET_OBJECTIVE, MACHINE_CANNOT_DECLARE_GOAL,
     MACHINE_CANNOT_DECLARE_ASPIRATION, MACHINE_CANNOT_TRIAGE, MACHINE_CANNOT_CHOOSE_THE_QUESTION) — except
     `triage`'s `question`, the one act R16 gives a machine, which is why the cut must admit one. Each rides
     `contribute` (a revision of a project document, a record document, an adoption, a question or a run) and is a
     session op in both sets (INTENT_ACTIONS). THE SEVEN READS are open to every class that reads the record, and
     what a caller may see is the store's, on the viewer stamped below (intent R23); each carries a NEEDS entry of
     null, op=queue's precedent (B3). */
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
  /* T8–T9 (layer 9, K248, K250, K263): THE ACTION LAYER'S OPS — standards (R1–R10), conformance (R1–R12), consequences (R1–R9),
     filings (R1–R11) and escalation (R1–R16). THE ACTS take `conclude`'s cut for `conclude`'s reason: a machine REACHES
     each and the module refuses it BY NAME on the author stamped below (MACHINE_CANNOT_DECLARE_STANDARD,
     MACHINE_CANNOT_DETERMINE, MACHINE_CANNOT_APPROVE, MACHINE_CANNOT_OPEN, …) — except the PROPOSALS (`standardpropose`,
     `comparisonpropose`, `filingprepare`, `theorypropose`), which any credential may make, each labelled with who made
     it and whether it is machine work; the cut must admit a machine for those. Each act rides `contribute` and is a
     session op in both sets. THE READS are open to every class that reads the record, and what a caller may see is the
     module's, on the viewer stamped below. The durable object constructs the modules and dispatches each of
     these through its module's op map (N216, T9; escalation's ten named in the store's map). */
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
  /* IS-6 / INVESTIGATIVE-SESSION.md §11: THE INVESTIGATIVE RUN. Three writes
     and two reads, and the class lists say two things worth stating.

     PROBE IS ADMITTED on all five, unlike the queue pair above, and the
     distinction is the same one D-151 drew: a mute with no member behind it is
     not a thing that exists, whereas a RUN is a real object with a real subject
     that a machine credential legitimately drives — the whole design has the run
     executing in a FLEET MEMBER (§14a), which is a machine. What bounds it is
     not the class list but `scopeFor`, which confines probe to the scratch
     namespace, and the store's own two-principal requirement.

     NO `ai` CLASS IS MINTED HERE. D-199's `ai` credential class is IS-5's, and
     inventing one now would be choosing its shape before the item that owns it
     measures anything. These ops ride the existing classes and IS-5 narrows
     them; that direction is safe and the other is not.

     THE TWO READS ARE GATED (D-15) on the run's context, which is an inquiry or
     a project bundle — classified in test/gate-reads.test.mjs, where every read
     op must be. `viewer` is stamped server-side below. */
  airunopen:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airuntick:          { classes: ["admin", "member", "probe"],      mutating: true  },
  airunclose:         { classes: ["admin", "member", "probe"],      mutating: true  },
  airun:              { classes: ["admin", "member", "probe"],      mutating: false },
  airunlog:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-207 (BOB #32, 2026-09-23 23:42Z): the two doors that settle a bias-debt obligation and read what
     settled it.

     `biasdebtresolve` HAS NO PROBE CLASS, and the reason is the one `queuemute` records two blocks up
     rather than a new one: settling a bias debt is a member's judgement that a lens change does not bear
     on a finding, so a credential with no person behind it has no judgement to record. The store refuses
     a machine BY SHAPE as well (BIAS_DEBT_MACHINE_CANNOT_RESOLVE, `taskResolve`'s precedent), so a bypass
     of this list fails closed rather than writing a row attributed to a token.

     `biasdebt` IS a read and carries the run reads' classes: it names a RUN and answers about the
     obligation on it, so it is gated on the run's context exactly as op=airun and op=airunlog are, and a
     debt on a run the caller cannot open answers byte-identically to a run that never carried one. It is
     classified in test/gate-reads.test.mjs, where every read op must be. */
  biasdebtresolve:    { classes: ["admin", "member"],               mutating: true  },
  biasdebt:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-93 / IC-92 — THE FRONTIER READ (`OBSERVATION-LOG-DESIGN.md` §6 row 1):
     *what have we looked for at this level, and what came of it* — the candidate
     list for FETCH / EXTRACT / DERIVE. A READ, so `mutating: false`.
     THE CLASSES ARE THE RUN LOG'S, and that is deliberate rather than copied: §6
     says *"a subject discloses a project's interest, so REC-36's withholding
     applies row-whole across the fence"*. What a caller may SEE is decided by
     the D-15 viewer stamp in the store, never by the class here — the same line
     `airuns` draws two rows down. */
  frontier:           { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-525 — THE DRIVE SHELL SWEEP: which Drive-linked bundles hold a baseline
     captured from Google's application page rather than the export (a pre-CAP-8
     acquire), so their monitor reads `modified` on every tick. A READ that lists
     and names the remedy; it never re-acquires. Classes and the D-15 stamp are
     op=index's, because it walks the same working corpus and names bundle ids. */
  driveshells:        { classes: ["admin", "member", "probe"],      mutating: false },
  /* T8 (monitoring R32, MONITORING #1 J3.6): what the group monitors and how each watch stands, the DO route
     `monitoring`. A READ on `driveshells`' cut and for its reason — it walks the working corpus and names bundle ids —
     so the viewer is stamped below and the store answers only what the viewer may see. */
  monitoring:         { classes: ["admin", "member", "probe"],      mutating: false },
  /* K372 (monitoring R30): the administrator's PAUSE of the daemon, the DO route `monitorpause` — `paused: true` or
     `false` in the POST body, and who set it the control plane's `actor` stamp below, never the caller's. The root of
     trust's act and an administrator's (N314, T12): the ADMIN_TOKEN bearer (`machineClasses`, so no other bearer) and
     EVERY member session (both `SESSION_OPS` sets), and monitoring R30 refuses a stamp that is not an administrator
     (membership R64) NOT_AN_ADMIN at its own site; the control plane only stamps who asked.
     The DUE SLATE (`monitorslate`) is a READ on `monitoring`'s cut and for its reason: it names bundles, so the viewer
     is stamped below and the store answers only what the viewer may see. */
  monitorpause:       { classes: ["admin", "member"], machineClasses: ["admin"], mutating: true  },
  /* K407 (INSTANCE-SETUP #1 J2): the instance's active jurisdiction profiles (instance-setup R12–R15). `profiles` is a
     READ open to the admin bearer and every session; `profilesset` is an administrator's own session act: every session
     reaches it (both sets) and `machineClasses: []` refuses every bearer CLASS_FORBIDDEN, `by` stamped below from the
     session, and instance-setup refuses a `by` that is not an administrator. */
  profiles:           { classes: ["admin", "member"],               mutating: false },
  profilesset:        { classes: ["admin", "member"], machineClasses: [], mutating: true  },
  monitorslate:       { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-94 / IC-95 — THE PER-CAPTURE CONTENT-AXIS READ (`OBSERVATION-LOG-DESIGN.md`
     section 4.2, section 6 row 2): *which of the four content-axis states is this
     capture in, and why*. A READ, so `mutating: false`.
     THE CLASSES AND THE GATE ARE `frontier`'S, for the reason section 6 gives one
     row up: this answers whether a particular document's text was ever extracted,
     which discloses that this project holds that document at all — the same
     disclosure a frontier subject makes, one capture at a time. The viewer stamp
     below decides what a caller may see; the class list here never does. */
  contentaxis:        { classes: ["admin", "member", "probe"],      mutating: false },
  /* REC-69 / UI-49's delegation: the CONTEXT-keyed read. Same classes as its
     three run-id-keyed siblings, because what a caller may see is decided by
     the D-15 viewer stamp in the store and never by the class here. */
  airuns:             { classes: ["admin", "member", "probe"],      mutating: false },
  /* PL-3 / IS-4 — THE SUGGEST ENDPOINT, the ONE write the investigative
     session holds (§4 group 2: it REQUESTS acquisition, it SUGGESTS, and it
     ACCEPTS nothing). It rides the SAME classes as the run ops above and for
     the same recorded reason: PL-11 mints the `ai` class and NARROWS these, and
     widening later is the safe direction while shipping a class nothing
     measures is not. Its own fence is not the class list — it is that the sole
     state it can write is `suggested`, written as a literal with no parameter
     behind it, and that the six pre-write checks run PLANE-SIDE. */
  suggest:            { classes: ["admin", "member", "probe"],      mutating: true  },
  /* PL-4 / IS-4 / SWEEP 4b.1 — THE CAPTURE-REQUEST DOOR, and the split between
     the rows below IS the item.

     `capturerequest` is §4 group 1: *"It REQUESTS acquisition — it does not
     perform it."* It writes a row and holds no fetch, so it rides the same
     classes as the run ops and PL-11 narrows them.

     `capturerequestdrain` is the DAEMON'S verb and carries NO MEMBER CLASS. It
     is the one thing in this plane that turns a request into a fetch, and a
     member reaching for it by hand would be a person doing the daemon's job with
     the daemon's conduct rules applied to them — the same line op=taskdrain
     draws between a producer and a consumer, one door over. `daemon` is here
     BY DECISION: SWEEP 4b item 1 is the decision DEC-37 required for widening
     the class *"by decision, not by drift"*, and test/daemon-token.test.mjs's
     totality assertion is corrected in the same turn rather than exempted.

     `capturerequests` is a READ, and it DOES NOT ADMIT THE DAEMON CLASS. That
     is deliberate and it is the narrower half of the widening: op=acquire's
     capture-request arm asks the DURABLE OBJECT directly, not through this
     table, so the daemon needs no read here — and a credential that sits
     unattended in a config file has no business enumerating the queue of
     addresses this group is about to fetch. The class therefore reaches exactly
     THREE ops here, one more than DEC-37 scoped it to and that one by decision
     (and `reevaluationraise` below, by K199's).
     T6-13 (K181 (6)): `capturerequestdraining` is RETIRED — capture-requests
     removed its function and its store route (its R16), so its row went with
     them rather than answering admin and probe an `unknown op` from the store. */
  capturerequest:      { classes: ["admin", "member", "probe"],           mutating: true  },
  capturerequestdrain: { classes: ["admin", "probe", "daemon"],           mutating: true  },
  capturerequests:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* T6-13 (capture-requests R42, K181 (6)): RETRYING a request the SOURCE refused, once a member has supplied what it
     asked for. A member's act on the group's queue: admin and member, `contribute` in NEEDS, a session op; the store
     asks the stamped viewer's sight of the request's question and relays the stamped principal as the caller. */
  capturerequestretry: { classes: ["admin", "member"],                    mutating: true  },
  /* PL-11 / IS-5 / D-199 — MINTING AN AI CREDENTIAL, AND THE CLASS LIST IS THE
     ENFORCEMENT RATHER THAN A NOTE ON IT.

     NO `ai` CLASS APPEARS IN ANY ROW OF THIS TABLE, INCLUDING THESE. That is
     not an omission and it is asserted structurally in
     test/aicredential.test.mjs: the `ai` class is admitted by a SHAPE over this
     table (`aiTaskScope` below), never by being named in it, so adding "ai" to
     a row would grant nothing and removing one would take nothing away. PL-4
     delegated exactly this constraint — op=capturerequestdrain must never gain
     the class — and this is how it is made structurally true rather than
     remembered.

     `probe` IS ABSENT FROM ALL THREE, unlike almost everything around them, and
     the reason is D-199 (3). A probe credential is a MACHINE, and minting is a
     member act; admitting probe here so the surface were exercisable would be
     the `index.mjs:668` hole DEC-52 measured — *"probe is admitted so the
     surface is exercisable"* — arriving at the one act that decides what
     machines may do. The store refuses a machine stamp anyway (C-29.1), so this
     is the second of two fences and neither is load-bearing alone; what it buys
     is that the refusal a probe gets says the true thing.

     THE READ IS WIDER THAN THE WRITES ON PURPOSE. What agents this group has
     running, under whose name, and what they may touch is exactly the sort of
     thing a member should not have to ask an administrator for. It carries no
     value and no hash. */
  aicredentialmint:    { classes: ["admin", "member"],                    mutating: true  },
  aicredentialrevoke:  { classes: ["admin", "member"],                    mutating: true  },
  aicredentials:       { classes: ["admin", "member"],                    mutating: false },
  /* PL-12 / §14: THE FENCE, and it is an op so that it can be POINTED AT. The
     spawn contract for a search sub-session omits the bias manifest BY
     CONSTRUCTION; before this it existed only as a sentence in a design
     document, where no assertion could read it and no negative control could
     break it. A THIRD gated read on the run's context, like its two siblings. */
  airunspawn:         { classes: ["admin", "member", "probe"],      mutating: false },
  /* D-103: the per-host governor's operator surface. governorstate is a read of
     which hosts are held and why (admin and member: a member watching a capture
     stall deserves to see the governor is the reason, not a broken source);
     governorconfig sets a host's appetite and is admin/probe because tuning how
     hard we lean on a counterparty is an operator decision, not a member one —
     and not an administrator's either (§4.9, RULED by BOB #23). CORRECTED
     2026-09-23 by REC-159: this ended "the same line memberset and signerset
     draw", which that landing made false — both are EVERY administrator's now,
     and governorconfig is the one op the founder's session alone reaches. Neither is a capacity FINDING:
     a refusal still teaches capacity through governorReport on the fetch path.
     This only exposes what the DO already tracks; it discovers nothing new. */
  governorstate:  { classes: ["admin", "member", "probe"],           mutating: false },
  governorconfig: { classes: ["admin", "probe"],                     mutating: true  },
  /* REC-159: `member` and `machineClasses` for the reason written at `memberadd`. */
  signeradd:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  signerlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  signerset:    { classes: ["admin", "member", "probe"], machineClasses: ["admin", "probe"], mutating: true  },
  /* The bootstrap trio and the doorbell are the unauthenticated surface.
     Each enforces its own gate: bootstrap reveals nothing but
     claimed/unclaimed, claim requires the bootstrap secret and refuses once
     spent, login requires the password, enroll requires a live one-time
     invite. verify answers only from the published projection, which has
     never seen unratified material, so there is nothing to leak. knock
     lands in a quarantined inbox, size-capped and rate-limited; the worst
     case under attack is a full inbox. */
  bootstrap:  { classes: null,                                   mutating: false },
  claim:      { classes: null,                                   mutating: true  },
  login:      { classes: null,                                   mutating: false },
  enroll:     { classes: null,                                   mutating: true  },
  /* What a burner URL resolves to. Unauthenticated by necessity: the invitee
     holds no credential yet, which is the whole point of an invitation. It
     answers only for a LIVE invitation, and a spent token is indistinguishable
     from one that never existed, so it leaks nothing about who was invited. */
  invitelook: { classes: null,                                   mutating: false },
  verify:     { classes: null,                                   mutating: false },
  knock:      { classes: null,                                   mutating: true  },
};

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
const RETRIEVAL_READS = ["search", "searchfields", "searchindexcheck", "selection", "selectionlist",
                         "meaningrows"];
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
const READING_READS = ["reading", "readingref", "readingname", "textprovenance", "textattest"];
/* The selection-backed actions on a Project's citation edges. Named as a set
   rather than listed twice, because the member and admin session lists drifting
   apart is exactly the class of defect this repository keeps finding. */
/* `linkproject` belongs here rather than beside acquire: it creates EDGES, which
   is what these actions do, and it is a member's contribution even though the
   edge it creates records the SOURCE's assertion rather than the member's. The
   member's act is deciding to admit the observed connection into the graph; the
   edge itself says asserted_by: source. */
const EDGE_ACTIONS = ["cite", "sever", "reinstate", "linkproject"];
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
const STATE_ACTIONS = ["dispose", "retire", "release", "conclude", "reopen", "publish", "inquirydivide",
                       "withdrawconclusion"];
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
const ACTION_ACTIONS = ["actionmove", "actioncorrespond", "actionlaws", "actionrisktier"];
/* REC-14 / DEC-17: declaring the group's default required strength is a
   session act whose AUTHOR is part of the declaration — "you can lower your own
   bar; you cannot do it quietly" — so it takes the author stamp without being a
   state action on any object. */
const DECLARATION_ACTIONS = ["strengthbar"];
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
const STRUCTURE_ACTIONS = ["inquiryground"];
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

   Each layer absorbs the others when it is whole, which is exactly why
   VERIFICATION rule 3a requires the control to break EACH ONE with the other two
   HELD OPEN; `test/versionstate.control.mjs` does that and nothing less would
   prove any of the three is doing anything.

   Machine classes REACH all six and are refused by the store rather than being
   absent from the table — conclude's posture, fail closed, so the refusal says
   what is wrong instead of "requires a credential you have". */
const VERSION_ACTIONS = ["versionaccept", "versionreject", "versionconsider",
                         "versionrevert", "versioncurrent", "versionhide"];
const PROJECT_ACTIONS = ["projectinvite", "projectjoin", "projectleave", "projectremove",
                         "projectowneradd", "projectownerremove", "projectfork",
                         "projectownerrescue",
                         /* REC-149: the owner's §7.14 setting — `by` and `viewer` stamped like every roster act. */
                         "projectvisibilityset",
                         /* REC-150: §7.14's request to join — the requester's two acts and the owner's answer,
                            each needing the SERVER's `by` (who asks, who answers) and `viewer` (at what sight). */
                         "projectrequest", "projectrequestwithdraw", "projectrequestanswer"];
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
const GOVERNANCE_ACTIONS = ["adminendorse", "adminremove", "membercaps"];
/* REC-164 / Publication §7 points 2 and 3: the group's display name and its domain claim are set by an
   administrator's session, with `by` stamped by the server "as for the Membership v2 §4 governance acts". A SET OF
   ITS OWN rather than three more names in `GOVERNANCE_ACTIONS`, because that array's fence carries C-32.17, whose
   canned sentence names the §4 votes and the capability edit — it would be FALSE here (D-270's class). Same shape:
   both session sets (an enrolled administrator holds `member:<id>`, so the admin set alone is the founder alone),
   a fence that refuses any caller who did not arrive by a session, and a `by` stamp the store asks the roster. */
const IDENTITY_ACTIONS = ["groupnameset", "groupdomainset"];
/* REC-159 — §4.9's CUSTODIAL ACTS, AND EACH IS EVERY ADMINISTRATOR'S. `BIO_Membership_Architecture_v2.md`
   §4.7's block *"WHAT IS STILL NOT CLOSED"* named this fix and REC-156 measured the defect: the four sat in
   `SESSION_OPS.admin` alone — the FOUNDER'S password session — so an enrolled administrator was refused
   them with a sentence calling the op an administrator's, which she IS. D-136's call, applied again, in
   three halves that ship together or not at all:
     (1) REACH — spread into BOTH `SESSION_OPS` sets, and `member` in each OPS row's `classes`, because an
         enrolled administrator's `kind` is `member` however her roster row reads;
     (2) THE STAMP — a disjunct of the `by` stamp, so the SERVER names who acted, and the store's relays
         read `by` from the query over anything in the body;
     (3) THE ROSTER — each store method refuses a member-named `by` that is not an ACTIVE administrator,
         NOT_AN_ADMIN, before it looks anything up (`Store#custodialBar`).
   Reach without the roster would hand an ordinary member the roster; the roster without the stamp would
   let a caller name somebody who passes it.
   **NOT `GOVERNANCE_ACTIONS`, and that is the one call this array exists to make.** That array also
   carries the operator fence (C-32.17), and BOB #22 RULED that an operator's bearer keeps reaching these
   four, its `by` stamped `class:<cls>` and naming no person. So the bearer route is bounded by each row's
   `machineClasses` instead — `admin` and `probe`, the classes it held before — which keeps the
   MEMBER_TOKEN bearer and an `ai` credential out exactly as they were. */
const CUSTODIAL_ACTIONS = ["memberadd", "memberset", "signeradd", "signerset"];
/* N43 (T4) — membership's R10, R11 and R19, each a named person's own act on the roster: an administrator resigning
   (never the founder, whom the store answers ROOT_OF_TRUST), an administrator recording who holds hosting access,
   and a member (or an administrator) choosing whether a pairing is published. REC-159's three halves: REACH in both
   `SESSION_OPS` sets, THE STAMP (`by` set by the server, read by the store from the query after the body), and THE
   ROSTER (the store refuses NOT_AN_ADMIN or PAIRING_NOT_YOURS). A SET OF ITS OWN rather than more names in
   `GOVERNANCE_ACTIONS` or `CUSTODIAL_ACTIONS`: the first carries the operator fence, whose C-32.17 sentence names
   the §4.7 votes and would be false here (D-270's class), and the second's `by` condition is pinned as one
   expression by the old battery. A bearer stamps `class:<cls>`, which is on no roster, so the store refuses it. */
const ROSTER_SELF_ACTIONS = ["adminresign", "hostingaccessset", "memberpairingset"];
/* REC-155 — `BIO_Membership_Architecture_v2.md` §4.10 (RULED by BOB #19, 2026-09-21): five of the seven ops
   that no session reached and no decision explained JOIN BOTH SESSION SETS. Both sets for D-136's reason at
   the spread below: `SESSION_OPS.admin` is the FOUNDER'S session alone, and none of the five is the founder's.
   THE PROVENANCE PAIR: their OPS rows call the act *"a named member's judgement"*, and a signed-in session is
   the one caller that carries a name — the `author` stamp already names `sessMember` on the session route.
   The bearer WRITE route closes in §4.10's SECOND landing (REC-158), not here: this one refuses nobody. */
const PROVENANCE_JUDGEMENT_ACTIONS = ["provenancechain", "provenanceroute"];
/* THE CALIBRATION WRITES: their OPS row rules that the fence is NOT who may measure but that a measurement
   never moves a GRADE (`CAL_CANNOT_REGRADE`), so a person measures on the same terms as a probe, and the
   bearer route stays — a scheduled re-probe is a machine act by construction. */
const CALIBRATION_WRITE_ACTIONS = ["calibrate", "calibrationsubject", "calibrationsignal"];
/* Section 1.3. Both are in the MEMBER set: a member declares their own, and a
   member reaching confirm is refused by the store with ADMIN_ONLY, which says
   what is wrong. Putting confirm in the admin set alone would answer "requires a
   machine credential", which is true of neither the caller nor the rule. */
const EXPERTISE_ACTIONS = ["expertisedeclare", "expertiseconfirm"];
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
const REGISTRY_ACTIONS = ["entitycreate", "entityalias", "relationdeclare", "aliaswithdraw", "relationwithdraw",
                          "entity", "entitybyalias", "relation"];
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
const TASK_ACTIONS = ["taskforward", "taskresolve"];
/* REC-21: the queue's PERSONAL writes. They are MUTATING, so SESSION_OPS is what
   actually lets a member session reach them, and they are in BOTH lists for the
   same reason every other member surface is: an administrator is a member too.
   Kept as their own array rather than folded into TASK_ACTIONS because they are
   the OTHER doctrine — a task act changes the record for everyone, and these
   change nothing for anyone but the member who made them. Naming them together
   would be the first step toward one control. */
const QUEUE_ACTIONS = ["queuemute", "queuesnooze"];
/* IS-6: the investigative run's three WRITES. Its two reads are not here, for
   the reason stated on QUEUE_ACTIONS above and restated by capability.test.mjs:
   SESSION_OPS gates MUTATING ops alone, so a read appears in it nowhere.
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
const AI_RUN_ACTIONS = ["airunopen", "airuntick", "airunclose", "suggest", "capturerequest",
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
                        "contradictionpropose"];
/* PL-18 / DEC-63 — THE THREE RUN VERBS, AS THEIR OWN LIST, because Bob's
   ruling is about exactly these three and not about the array above them.
   `AI_RUN_ACTIONS` also carries `suggest` and `capturerequest`, which are acts
   a run performs rather than the act of running, and neither is gated on
   project participation: PL-3 and PL-4 settled their capabilities on their own
   grounds and DEC-63 does not reach them. Writing the three as one named list
   rather than as three literals at the stamp site is the same discipline
   `QUEUE_ACTIONS` and `PROJECT_ACTIONS` keep — a fourth run verb should join
   the gate by being added here, not by somebody remembering. */
const RUN_VERB_ACTIONS = ["airunopen", "airuntick", "airunclose"];
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
const RUN_PRODUCTION_ACTIONS = ["suggest", "extractpropose", "capturerequest", "contradictionpropose"];
/* REC-134 / C-56: the acts that change a project and read the POSITIONAL `identity` stamp for
   the store's `#projectAuthority` check (SIGHT IS NOT AUTHORITY, Membership v2 §7). `op=promote`
   carries the same stamp in its body as `actorIdentity`. The stamp site says why. */
/* REC-136 adds `withdrawconclusion`: it writes the project's own conclusion record, so it is conclude's position. */
/* D-722 (T5-11, connections R27) adds `linkproject`: edges it hangs on a PROJECT's source bundle are that project's,
   so it is cite's position. Its handler stamps the identity itself (it returns above the stamp site); listed here so the
   set of positional acts is read in one place. */
const POSITIONAL_ACTS = ["cite", "sever", "reinstate", "versioncurrent", "proposedispose", "biasadopt", "conclude",
                         "withdrawconclusion", "linkproject"];
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
const BIAS_ACTIONS = ["biasadopt"];
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
const BIAS_DEBT_ACTIONS = ["biasdebtresolve"];
/* T6-13 (intent R2, R8–R11, R16, R18): INTENT's ten acts, as ONE array for the reason every array here is one — they
   share a stamp (`author`, in the body), a capability (`contribute`) and both session sets, and a list written out in
   four places is the drift that made DISPOSITIONS one array. Its own array and not STATE_ACTIONS: they move no bundle
   state through the selection path and would inherit an `owner` stamp and a viewer-gated set shape they do not have. */
const INTENT_ACTIONS = ["objectivecondition", "goaldeclare", "goallink", "goalclose", "aspirationdeclare",
                        "aspirationdepart", "aspirationdeadend", "aspirationretire", "triage", "workobjective"];
/* T6-13 (intent R3–R6, R12–R15): its seven reads, every one stamped with the viewer (intent R23). */
const INTENT_READS = ["objectiveprogress", "objectivegaps", "goal", "aspirations", "aspirationcontacts", "pursuit",
                      "intentproposals"];
/* T6-13 (reevaluation R15, R16): a member's three acts on a reference they hold, stamped `author` in the query, where
   reevaluation reads it after the body. */
const REEVALUATION_ACTIONS = ["versionadopt", "versionkeep", "reevaluationrecord"];
/* T8 (layer 9, K248, K250): the action layer's acts and reads, one array each per module, for the reason every array
   here is one — they share a stamp, a capability and both session sets. `STANDARDS_ACTIONS` take their stamp in the BODY
   (`author`, or `proposer` for the proposal), where standards reads it; the others read `author` from the QUERY, after
   the body. Every read is stamped with the viewer. */
const STANDARDS_ACTIONS = ["standarddeclare", "standardpropose", "standardadopt"];
const STANDARDS_READS = ["standard", "standards", "standardinforce"];
const CONFORMANCE_ACTIONS = ["determine", "comparisonpropose"];
const CONFORMANCE_READS = ["determination", "determinations", "comparison"];
const CONSEQUENCES_ACTIONS = ["consequencerecord", "consequencerevise", "addressedrecord"];
const CONSEQUENCES_READS = ["consequence", "consequencesof", "addressed"];
const FILINGS_ACTIONS = ["filingprepare", "filingapprove", "filingsent", "counselpacket", "counselpacketexport",
                         "theorypropose"];
const FILINGS_READS = ["counselpacketread", "filingsfor", "availableactions"];
const ESCALATION_ACTIONS = ["escalationopen", "escalationattach", "escalationevaluate", "escalationadvance",
                            "escalationdecline", "escalationend", "escalationsuspend", "escalationresume"];
const ESCALATION_READS = ["escalation", "escalationsdue"];
/* The four whose modules read `author` from the query. */
const QUERY_AUTHOR_ACTIONS = [...CONFORMANCE_ACTIONS, ...CONSEQUENCES_ACTIONS, ...FILINGS_ACTIONS, ...ESCALATION_ACTIONS];
const ACTION_LAYER_ACTIONS = [...STANDARDS_ACTIONS, ...QUERY_AUTHOR_ACTIONS];
const ACTION_LAYER_READS = [...STANDARDS_READS, ...CONFORMANCE_READS, ...CONSEQUENCES_READS, ...FILINGS_READS,
                            ...ESCALATION_READS];
/* CONSTRUCTS Step 4, SLICE B (FW-7): the RECOGNISER actions. A member RESOLVES a
   captured document's references to registry entities (resolve), TESTIFIES a grade-D
   connection (resolvetestify), and READS the resolutions of a document (resolutions)
   and the reverse index for an entity (concerns). Named as one set in both the member
   and admin lists so the two cannot drift apart. The two WRITES are stamped with the
   resolving member below, like the registry writes: who resolved or testified is part
   of the record. The reads take no viewer stamp — they key on a capture sha and an
   entity id, not on the corpus view. */
const RECOGNISER_ACTIONS = ["resolve", "resolvetestify", "resolutions", "concerns"];
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
const PROGRESSION_ACTIONS = ["connect", "connections", "progressiondefine", "progression",
                             "thread", "instance", "discharge", "exceptions", "proposals",
                             "proposedispose", "captureprogressions"];
const SESSION_OPS = {
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   /* CASE-5b: signing the CASE DOCUMENT, beside signing a finding.
                      A session op for `ratify`'s own reason — the attestation carries
                      a member's name for as long as the record lasts. */
                   "caseratify",
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
                      `member:<id>` however their roster row reads —
                      `d270-refusal-truth.test.mjs` records two separate harnesses making
                      exactly that mistake and measuring a split of zero over a plane that
                      had one. So `...GOVERNANCE_ACTIONS` in the ADMIN SET ALONE would have
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
                   /* REC-126 / DEC-31: THE REVIEW COPY's three authoring acts. A
                      session op before anything else, on `aicredentialmint`'s
                      reasoning: each is attributed to the person who performed it,
                      and the store refuses every machine shape by name. */
                   "casedraft", "reviewgrant", "reviewrevoke"]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "caseratify",
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
                   ...IDENTITY_ACTIONS,
                   ...GOVERNANCE_ACTIONS,
                   ...CUSTODIAL_ACTIONS,
                   ...ROSTER_SELF_ACTIONS,
                   ...PROVENANCE_JUDGEMENT_ACTIONS, ...CALIBRATION_WRITE_ACTIONS,
                   "governorstate", "governorconfig",
                   /* K372 (monitoring R30): the daemon's pause, `governorconfig`'s route — the founder's session. */
                   "monitorpause",
                   "profilesset",
                   "aicredentialmint", "aicredentialrevoke",
                   "casedraft", "reviewgrant", "reviewrevoke"]),
};

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
 * with the reason. test/capability.test.mjs reads SESSION_OPS and this table out
 * of the source and fails on any session-reachable mutating op that is missing,
 * AND on anything named here that no session can reach, so the table cannot rot
 * in either direction. Standing lesson 2: a later addition must not pass by not
 * being mentioned.
 */
const NEEDS = {
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
  /* publish: ratify. The capability governs the SURFACE and the registered
     signing key governs the authority (5). Both exist because before this the
     key was doing the capability's job: a member with no publish reached
     op=ratify and was stopped only by not having a key. */
  ratify:           "publish",
  /* CASE-5b: ratifying the CASE DOCUMENT is the same surface as ratifying a
     finding — it is the act that commits what the group is publishing, one
     altitude up. A member who may not publish may not sign a case either. */
  caseratify:       "publish",
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
     PRESENT rather than absent because both totality guards must SEE them: the
     capability suite fails on a session-reachable mutating op that is missing
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
};

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
const UNATTENDED_BY_DECISION = {
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
  reproject: "BIO_Membership_Architecture_v2.md §4.10 (BOB #19), citing src/store.mjs, reproject: 'Exposed "
           + "because a deploy runs the bounded pass once at construction and a large store may need more than "
           + "one' — a deploy's maintenance pass, addressed to the operator's credential.",
};

export { OPS, RETRIEVAL_READS, READING_READS, EDGE_ACTIONS, STATE_ACTIONS, ACTION_ACTIONS, DECLARATION_ACTIONS, STRUCTURE_ACTIONS, VERSION_ACTIONS, PROJECT_ACTIONS, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS, CUSTODIAL_ACTIONS, ROSTER_SELF_ACTIONS, PROVENANCE_JUDGEMENT_ACTIONS, CALIBRATION_WRITE_ACTIONS, EXPERTISE_ACTIONS, REGISTRY_ACTIONS, TASK_ACTIONS, QUEUE_ACTIONS, AI_RUN_ACTIONS, RUN_VERB_ACTIONS, RUN_PRODUCTION_ACTIONS, POSITIONAL_ACTS, BIAS_ACTIONS, BIAS_DEBT_ACTIONS, INTENT_ACTIONS, INTENT_READS, REEVALUATION_ACTIONS, STANDARDS_ACTIONS, STANDARDS_READS, CONFORMANCE_ACTIONS, CONFORMANCE_READS, CONSEQUENCES_ACTIONS, CONSEQUENCES_READS, FILINGS_ACTIONS, FILINGS_READS, ESCALATION_ACTIONS, ESCALATION_READS, QUERY_AUTHOR_ACTIONS, ACTION_LAYER_ACTIONS, ACTION_LAYER_READS, RECOGNISER_ACTIONS, PROGRESSION_ACTIONS, SESSION_OPS, NEEDS, decorateAct, ACT_GATE, UNATTENDED_BY_DECISION };
