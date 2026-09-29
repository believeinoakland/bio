/* control-plane's own refusal rows (R32; K6: each check moves as an invariant with its test). DEC-49: every refusal the
 * doors answer carries its code, its row's check id and the member's translation, read from the one row here.
 *
 * Moved from the check catalogue (`checks/bio-checks.mjs`) at control-plane's extraction (T12, K6, K64's pattern), each
 * row keeping its check id and its words, and each `where` now naming its site in `src/control-plane/index.mjs`: the
 * admission gate C-38 whole, the namespaces C-78 whole and the dispatch rows C-69.1–.2 whole; and single rows split
 * out of the families that held them — the bootstrap claim's C-68.2–.4 (`INSTALLATION_CHECKS` keeps C-68.1, whose
 * raiser is capture's), the agent credential's gate and declaration C-29.6–.10 (`AI_CREDENTIAL_CHECKS` keeps the
 * mint's and the revocation's rows, membership's), the operator fence C-32.17 (`MACHINE_FENCE_CHECKS`), the group
 * identity fence C-64.4 (`INSTANCE_GROUP_CHECKS`) and the unverified replay C-66.6 (`SURFACE_CHECKS`). */

/* ============================================================================
 * C-38 · THE ADMISSION GATE — every refusal a caller meets BEFORE their op runs.
 * ============================================================================
 *
 * REC-79, 2026-08-09, and it is DEC-49's rule arriving at the one place every
 * single caller passes through.
 *
 * **FOUR OF THE SIX REFUSALS IN THIS GATE CARRIED NO CODE AT ALL** — they
 * answered with a bare `error:` sentence and nothing a surface could key on.
 * They were invisible to DEC-49's guard, invisible to its 427-code census, and
 * invisible to the sweep that produced the "248 untranslated" figure, because a
 * census of CODES cannot count a refusal that has none. So the gate the whole
 * system starts at was outside the rule that governs everything behind it.
 *
 * THEY WERE FOUND BY TRYING TO GOVERN THE SITE, not by reading it. A region
 * placed here reported nothing to judge, because `civicos-ui/check-refusal-codes.mjs`
 * could not see `return json({ … }, 403)` — the control plane's universal
 * refusal spelling, 77 of them in `index.mjs` alone. REC-79 widened that reader
 * first; the four codeless refusals fell out of the guard the moment it could
 * see them. **A mechanism believed on the strength of its existence rather than
 * its behaviour is the defect this project meets most**, and the DEC-49 guard
 * had never once been pointed at the control plane.
 *
 * WHY THIS FAMILY AND NOT ANOTHER, since REC-79 was explicitly told not to try
 * to translate 248 codes. It is the family most in reach of a real surface: not
 * "a surface could render this one day" but "every caller, signed in or not,
 * meets one of these before anything else can happen". `NOT_CAPABLE` is already
 * being rendered today — and rendered WRONG (see its row).
 *
 * ADDITIVE ON THE WIRE, DELIBERATELY. The `error` field of all four codeless
 * refusals is kept BYTE-IDENTICAL; the code, the C-number and the canned
 * translation are added beside it. 28 suites assert on those sentences and none
 * of them had to move, which is the point: a rule this project adopted late must
 * be arrivable at without breaking what already reads the old shape. IC-REC-79
 * registers the addition.
 *
 * ONE NAMING NOTE, WRITTEN BECAUSE THE NEXT READER WILL WONDER.
 * `MACHINE_CREDENTIAL_REQUIRED` is NOT a machine fence and the doctrine pack
 * must never render it as one: `skillpack.mjs` harvests on the prefix
 * `MACHINE_CANNOT_`, which this does not match. It is named for what it
 * requires, not for what it forbids. If anyone ever shortens that prefix to
 * `MACHINE_`, this row is what will break, and this sentence is where they
 * should find out. */
export const ADMISSION_CHECKS = {
  /* Absent identity, and it is the FIRST thing a stranger meets. It says what to
     do rather than what happened, because a person reading this has not yet done
     anything wrong — they have simply not said who they are. */
  NOT_AUTHENTICATED: {
    check: 'C-38.1',
    where: 'src/control-plane/index.mjs fetch > is-admission',
    translation: 'Nothing in this request said who you are. Sign in, or send a credential this '
      + 'instance issued, and try again.',
  },
  /* WRONG CREDENTIAL, NOT INSUFFICIENT CREDENTIAL, and the difference is worth a
     sentence: this is not a rung on a ladder the caller can climb. A credential
     is issued for a purpose and this is not that purpose, so the honest advice
     is to use the right one rather than to ask for this one to be widened. */
  CLASS_FORBIDDEN: {
    check: 'C-38.2',
    where: 'src/control-plane/index.mjs fetch > is-admission',
    translation: 'The credential you sent is not one this operation accepts. Credentials here are '
      + 'issued for a particular purpose, and widening this one is not the way through: use the '
      + 'credential meant for this work.',
  },
  /* The mirror of the row above, and it exists separately because the two are
     opposite facts about the caller. This one is a PERSON asking for something
     only an unattended writer does; the row above is a credential of the wrong
     kind entirely. One refusal covering both would tell neither caller anything
     they could act on — DEC-49's own argument, and PL-18's.

     **NARROWED 2026-09-19 BY D-270, AND THE `where` MOVED WITH THE SITE.** This
     row is a DESIGN CLAIM — it tells a person that a verb is not for people —
     and BOB #17 ruled that the plane may make it ONLY where such a decision is
     recorded. Until D-270 this one sentence answered THREE different facts and
     was FALSE for two of them: it went to five ops an administrator's own
     browser performs, and to ops whose OPS rows say in as many words that they
     are a named member's judgement. The site is now `sessionOpGate`, which
     sends this row only for an op named in `UNATTENDED_BY_DECISION`, and the
     refusal carries the citation in `recorded`, so the claim and its warrant
     travel together. The rule's home is
     `docs/architecture/BIO_Membership_Architecture_v2.md` §4 (the §4.7 block). */
  MACHINE_CREDENTIAL_REQUIRED: {
    check: 'C-38.3',
    where: 'src/control-plane/index.mjs sessionOpGate > is-session-op-gate',
    translation: 'This operation is performed by an unattended writer, not by a person at a '
      + 'browser. A signed-in session cannot do it; it needs a machine credential an administrator '
      + 'has issued. This instance holds a recorded decision to that effect and names it beside '
      + 'this message.',
  },
  /* D-270 / BOB #17, 2026-09-19. THE SECOND OF THE SESSION GATE'S THREE
     OUTCOMES, and the one the plane could ALWAYS have said: it is about the
     CALLER rather than about the design, so it needs no recorded decision to be
     sayable. Five ops — `governorconfig`, `memberadd`, `memberset`, `signeradd`,
     `signerset` — were answered with the row above, which told a member to go
     and find a machine credential for an act an administrator performs from
     their own browser. There is no such credential to find. This sentence names
     the person to ask instead, because that is the action actually available.
     CORRECTED 2026-09-25 by REC-162 (Membership v2 §4.9, BOB #23): it read "but an
     administrator of this group, and this session is not one … ask an administrator".
     After REC-159 the one op it answers is `governorconfig`, which the FOUNDER'S session
     alone reaches — an enrolled administrator holds a member's session and was told they
     were not an administrator. The sentence now names the SESSION, as the refusal's own
     `reachedBy` does. */
  SESSION_ROLE_CANNOT_REACH_OP: {
    check: 'C-38.7',
    where: 'src/control-plane/index.mjs sessionOpGate > is-session-op-gate',
    translation: 'A signed-in person does perform this operation, but from a different session than '
      + 'this one, and this refusal names which. Where it names the founder\'s session, being an '
      + 'administrator of this group does not reach it: every enrolled member, an administrator '
      + 'included, signs in with a member\'s session. No machine credential is needed and finding '
      + 'one is not the way through: ask the person who holds the session it names.',
  },
  /* D-270 / BOB #17's THIRD SENTENCE, and it exists because the other two would
     otherwise have to cover a case neither is true of.

     **THE ARGUMENT, AND IT IS THIS ROW'S WHOLE REASON.** A false rationale
     SUPPRESSES ITS OWN BUG REPORT: a member told that an absence is a DECISION
     will not report it as a gap, so the sentence recruits the one person who
     could have caught it into believing there is nothing to catch. The measured
     case is D-136's — `adminendorse`, `adminremove` and `membercaps` WERE
     reachable by no session, and Membership Architecture §4.7 assigns that very
     vote to a person. **D-136 LANDED 2026-09-19 and discharged that case**: the
     three now hold `SESSION_OPS.admin` reach and a server-stamped `by`, so an
     administrator's session reaches them and a member's gets the ROLE sentence,
     not this one. The receipt stays in the past tense because it is the ARGUMENT
     for this row rather than a roster of its members — the gap was reported only
     because the plane declined to call it a decision, and deleting the evidence
     once the gap closes is how a rule outlives the reason it was made. `docs/archive/research/CAPABILITIES.md` (F-4) recorded
     independently that the old sentence told an administrator the act §4.9
     assigns them needs a credential §4.8 says somebody else holds, and that
     there is no action a member can take from it.

     SO THIS ROW STATES THE FACT AND INVENTS NO RATIONALE. It says what is true
     — no session route exists — and says plainly that the record holds no
     decision explaining it, which is an INVITATION to report the gap rather
     than a wall in front of it. A refusal may state only what the system can
     support. */
  SESSION_ROUTE_NOT_RECORDED: {
    check: 'C-38.8',
    where: 'src/control-plane/index.mjs sessionOpGate > is-session-op-gate',
    translation: 'No signed-in session reaches this operation, and this instance holds no recorded '
      + 'decision saying it is not meant for a person. That is a gap in the record rather than a '
      + 'rule you have run into, and it is worth reporting as one.',
  },
  /* Section 8.1. THE ONE PLACE IN THIS SYSTEM WHERE BEING THE FOUNDER IS NOT
     ENOUGH, and the translation says so, because a member refused here will
     otherwise read it as a bug in their own permissions. The security property
     is the point and a person who cannot get in deserves to know it is
     deliberate. */
  ROOT_OF_TRUST_REQUIRED: {
    check: 'C-38.4',
    where: 'src/control-plane/index.mjs fetch > is-admission',
    translation: 'This needs the administrator token itself, not a signed-in session — and that '
      + 'includes the founder\'s own browser. A session is derived from a password; the root of '
      + 'trust is the token held in the hosting account. The published record needs no credential '
      + 'at all.',
  },
  /* **THE LIVE DEFECT THIS ROW CLOSES, and it is why REC-79 chose this family.**
     `civicos-ui/app.html` hand-authored a sentence for this code:
     *"This credential cannot write to the record. Capturing needs a member
     holding contribute."* But this refusal is PLANE-WIDE — it is minted for
     whatever capability the op needed, and `create_projects` and `publish` are
     not `contribute`. So a surface had invented capture-specific wording for a
     refusal that is not about capture, and a member denied for `create_projects`
     was told about contributing. **That is precisely the drift a canned
     translation exists to stop** (found by PL-18; DEC-49's own argument for
     option (b) is that thirteen surfaces would otherwise each invent wording).
     The sentence here names no capability, because the plane already sends the
     one that was needed in `needs` and the surface renders that. */
  NOT_CAPABLE: {
    check: 'C-38.5',
    where: 'src/control-plane/index.mjs fetch > is-admission',
    translation: 'Your account does not hold the capability this needs. Capabilities are granted '
      + 'by an administrator, so ask one rather than looking for another route to the same thing.',
  },
  /* A credential that MAY act, but not HERE. Distinct from every row above,
     which are all about whether the caller may act at all. */
  SCOPE_REFUSED: {
    check: 'C-38.6',
    where: 'src/control-plane/index.mjs fetch > is-admission',
    translation: 'That credential is allowed to act, but not on the part of the record this '
      + 'request named. It is confined to its own namespace and this request reached outside it.',
  },
};

/* ===========================================================================
   D-456 (C-78) — A NAMESPACE THAT DOES NOT EXIST.

   An instance has exactly two namespaces, `bio` (the record) and `scratch` (the
   place a live verification writes instead of it). `scopeFor` used to answer
   `bio` for any other `store=` value, so a caller naming a namespace that does
   not exist — a typo, a case variant, an empty value, a brief naming one that
   never existed — addressed THE REAL RECORD while believing it was elsewhere.
   That is the one refusal a live verification most needs, because naming its
   namespace is its whole no-write guarantee (D-325). ONE row, minted in ONE
   governed span (`namespaceGate`), met before any credential is read, so every
   class and the no-credential path meet the same sentence.

   The sentence says NOTHING WAS CHANGED first, and does not guess which
   namespace was meant: `Scratch` is refused, not folded, because a namespace
   name is an exact string.
   =========================================================================== */
export const NAMESPACE_CHECKS = {
  NAMESPACE_UNKNOWN: {
    check: 'C-78.1',
    where: 'src/control-plane/index.mjs namespaceGate > is-namespace-gate',
    translation: 'This request named a part of the record that does not exist on this copy, so nothing was '
      + 'read or changed. A copy has two: the record itself, and a scratch area kept apart for testing. The '
      + 'name must match one of them exactly; the names are listed beside this message.',
  },
  /* D-461 (C-78.2): the scratch area named on a public operation that only ever answers from the record itself.
     Twelve such operations used to answer from the record while the caller believed it was in scratch — one of
     them, a knock, WROTE there. The sentence says nothing happened first and names no remedy but the true one. */
  NAMESPACE_PINNED: {
    check: 'C-78.2',
    where: 'src/control-plane/index.mjs pinnedNamespaceGate > is-pinned-namespace-gate',
    translation: 'This request asked for the scratch area, but this operation only ever answers from the record '
      + 'itself and has no scratch version, so nothing was read or changed. To use it, leave the scratch area '
      + 'out of the request, knowing it then reaches the real record.',
  },
  /* D-463 (C-78.3): the credential itself is confined to the scratch area for its whole life, and this request
     named a different part of the record. C-78.1 and C-78.2 are both properties of the REQUEST — a name that
     does not exist, an operation that has no scratch version; this one is a property of the CALLER, which is
     why it is a third row and not a widening of either. Confinement is by REFUSAL and never by silent
     redirection when a store is NAMED (`scopeFor`'s rule for the probe class, and D-456's for everyone): a
     caller who believes it addressed the record must be told it did not. An ABSENT `store=` is not a refusal —
     the credential's own confinement is its default, which is the whole point of minting one. */
  NAMESPACE_CONFINED: {
    check: 'C-78.3',
    where: 'src/control-plane/index.mjs confinedNamespaceGate > is-confined-namespace-gate',
    translation: 'The credential used for this request can only ever reach the scratch area kept apart for '
      + 'testing, and this request asked for a different part of the record, so nothing was read or changed. '
      + 'Leave the part out of the request and it reaches scratch, which is the only place this credential goes.',
  },
};

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
     C-69.3 being PLANE_INTERNAL_ERROR's since T12, it takes the next free number (awaiting stamp, N318). Same posture:
     the stack is logged under a CORRELATION id, the caller receives the code, this sentence and the id. */
  STORE_INTERNAL_ERROR: {
    check: 'C-69.4',
    where: 'src/control-plane/dispatch.mjs internalAnswer > is-store-internal-error',
    translation: 'This copy failed inside its own record while carrying out the request, so no answer was produced. '
      + 'That is a fault in this copy, not a statement about what the record holds or about your request; whether '
      + 'any part of it took effect is not known from here. The administrator can find the details in this copy\'s '
      + 'logs under the reference given with this answer.',
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

/* C-29.6–.10 — AN AGENT CREDENTIAL'S REACH (PL-11 / IS-5, D-199): the gate on every call (C-29.6, .7) and the
   declaration judged when a member mints one (C-29.8–.10). The reach question is the control plane's, because the op
   table is the only thing that knows what an op is and which classes may call it. Split from `AI_CREDENTIAL_CHECKS`,
   whose mint and revocation rows are membership's. */
export const AI_SCOPE_CHECKS = {
  /* ---- THE GATE. WHAT A DECLARED SCOPE ADMITS, ON EVERY CALL. ---- */

  /* D-199 (1)'s shape, reused from `scopeFor`: CLASS plus SCOPE, enforced at the
     gate BY REFUSING. It is one code because it answers one question — is this
     op within what the record declared for this credential — and the two ways
     of failing it (outside the member-reach floor, or not among the declared
     writes) are the same answer to the caller. */
  AI_BEYOND_TASK_SCOPE: {
    check: 'C-29.6',
    where: 'src/control-plane/index.mjs aiTaskScope > is-ai-task-scope',
    translation: 'This credential was created for a particular piece of work and that is not part of '
      + 'it. What an agent may do here is written down on the record by the member who set it up, so '
      + 'widening it means somebody amending that entry, not the agent asking again.',
  },
  AI_CREDENTIAL_REVOKED: {
    check: 'C-29.7',
    where: 'src/control-plane/index.mjs aiTaskScope > is-ai-task-scope',
    translation: 'This agent credential has been withdrawn by a member of the group, so it no longer '
      + 'reaches anything here. The record keeps the entry and the date rather than deleting it, so '
      + 'what it did while it was live remains readable.',
  },

  /* ---- THE DECLARATION. WHAT MAY BE AUTHORED IN THE FIRST PLACE. ---- */

  /* A scope naming something that is not an op is not a narrower scope: it is a
     sentence in the record that nothing enforces, which is precisely what
     D-199 (2) moved the scope out of a settings row to avoid. */
  AI_SCOPE_UNKNOWN_OP: {
    check: 'C-29.8',
    where: 'src/control-plane/index.mjs aiScopeDeclaration > is-ai-scope-declaration',
    translation: 'The list of things this credential may change names something this instance does '
      + 'not do. An entry nothing recognises would sit in the record looking like a permission while '
      + 'meaning nothing, so it is refused rather than stored.',
  },
  /* THE SHAPE FENCE, AND PL-4'S DELEGATED CONSTRAINT DISCHARGED. Not a list of
     forbidden ops — a property of the op: can a MEMBER reach it. The unattended
     verbs carry no member class by construction, so they are outside every
     scope anybody can write, today and after the next op lands. */
  AI_SCOPE_BEYOND_MEMBER_REACH: {
    check: 'C-29.9',
    where: 'src/control-plane/index.mjs aiScopeDeclaration > is-ai-scope-declaration',
    translation: 'An agent may only be given things a member of this group could hand to it, and '
      + 'this is not one of them. The background worker\'s own jobs, and the acts a member performs '
      + 'only from their own signed-in session, are outside what anybody can hand to an agent, so '
      + 'this cannot be written into a credential at all.',
  },
  /* D-463 (C-29.10) — THE CONFINEMENT, JUDGED BEFORE IT ENTERS THE RECORD.
     A credential may be minted confined to the scratch namespace for its whole life, and to NOTHING ELSE.
     `bio` is refused with the rest, and that is the decision rather than an omission: `bio` is where every
     unconfined credential already lands, so a row saying "confined to bio" would be a sentence in the record
     that reads like a fence and constrains nothing — D-199 (2)'s complaint about a settings row, arriving as
     a column. The value is matched EXACTLY — nothing trimmed, nothing case-folded — on D-456's rule one layer in,
     because a Durable Object name is an exact string and folding it would be the code guessing what a member meant.
     ABSENT (the field omitted, or null) is the ONLY silence, and it is the case every caller written before this item
     is in; a PRESENT empty string is a value and is refused with the rest, because an empty `store=` is one of the
     values D-456 measured addressing the real record. */
  AI_CONFINEMENT_NOT_SCRATCH: {
    check: 'C-29.10',
    where: 'src/control-plane/index.mjs aiConfinementDeclaration > is-ai-confinement-declaration',
    translation: 'A credential can be confined to the scratch area and to nothing else, spelt exactly. '
      + 'Leaving the confinement out altogether makes an ordinary credential that reaches the record itself; '
      + 'naming the record itself is not a confinement, so it is refused rather than written down as one. '
      + 'Nothing was created.',
  },
};

/* C-32.17 — THE OPERATOR FENCE ON SECTION 4 GOVERNANCE (D-136). Split from `MACHINE_FENCE_CHECKS`. */
export const OPERATOR_FENCE_CHECKS = {
  /* D-136 / C-32.17 — D-421's RULING APPLIED TO SECTION 4 GOVERNANCE, and it is
     the same doctrine rather than a new one: *the credential that delivers an
     act decides when the record changes, and the record names the actor.* A
     §4.7 vote is C-32.14's shape with the member's signature replaced by a
     roster position — an act the record attributes to a named administrator,
     which a bearer token held in the hosting account cannot be.
     ONE ROW FOR THE THREE OPS, on C-32.16's precedent rather than C-32.14's: the
     endorsement, the removal vote and the capability edit enter through ONE
     region and are refused by ONE predicate, so three rows would be one rule with
     three homes. The op is named in the answer, so a caller still learns which
     verb was refused, and the class is named in `tokenClass`, so an operator
     learns which of its credentials asked.
     THE PREDICATE IS `!viaSession` — how the caller ARRIVED, not which token it
     held — so it covers ADMIN, MEMBER and PROBE today and any binding added
     tomorrow, and no class list appears at the site to go stale. */
  OPERATOR_TOKEN_CANNOT_GOVERN: {
    check: 'C-32.17',
    where: 'src/control-plane/index.mjs fetch > is-operator-governance-act',
    translation: 'Endorsing an administrator, voting to remove one, and setting what a member may do '
      + 'are things the group holds a named administrator answerable for, and the record names who did '
      + 'them. The credential that asked here is one of the operator\'s access tokens for this copy, '
      + 'not a person: it holds no place on the roster, so it cannot be one of the administrators whose '
      + 'agreement the rule requires. Sign in as that administrator and do it from there.',
  },
};

/* C-64.4 — THE SAME FENCE FOR THE GROUP'S PUBLIC IDENTITY (REC-164). Split from `INSTANCE_GROUP_CHECKS`. */
export const GROUP_IDENTITY_FENCE_CHECKS = {
  /* REC-164 — BIO_Publication_v0_1.md §7 points 2 and 3: the display name and the domain are set by an
     administrator's own signed-in session, and the record names who set each one. */
  GROUP_IDENTITY_NEEDS_SESSION: {
    check: 'C-64.4',
    where: 'src/control-plane/index.mjs fetch > is-group-identity-session',
    translation: 'The name this group shows the public, and the web address it claims, are set by one of its '
      + 'administrators, and the record names who set each one. The credential that asked here is one of the '
      + 'operator\'s access tokens for this copy, not a person, so it cannot be that administrator. Sign in as '
      + 'the administrator and set it from there. Nothing was changed.',
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
     listing this revision's `bundle.md` SHA-256 — never against the request's own claim (CLAUDE.md §5). Measured
     before this existed (`9f8b69e6`, `risk-tier.test.mjs` §8 arm (δ)): the admin deploy token sending `replay: true`
     with no provenance landed `risk_tier: 1` on an action nobody assessed. Asked in `op=promote`'s stamp block
     BEFORE the store is called, so nothing is written. The admin is refused rather than downgraded to an ordinary
     promotion, because the one honest sender (`migrate.mjs`) carries the past verbatim and an ordinary creation is
     rewritten on the way in. */
  REPLAY_UNVERIFIED: {
    check: 'C-66.6',
    where: 'src/control-plane/index.mjs fetch > is-promote-replay-verified',
    translation: 'This save says it is a replay of the record\'s own history, and the plane could not check that '
      + 'against the history it holds: the replay must name the provenance file for this document, already '
      + 'uploaded, whose records list this document and exactly this version of it. A replay is excused from '
      + 'the rules a new save must meet only when that check succeeds. Nothing was saved.',
  },
};
