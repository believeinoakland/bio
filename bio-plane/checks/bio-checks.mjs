// @ts-check
// bio-checks 1.16.6. See checks/README.md for the divergence from the 1.16.4
// bytes the retired Apps Script pinned.
// bio-checks: the one check codebase (BIO_State_Rules_Consistency v1.1, Mechanical Verification Law).
// Plain JavaScript, ES modules, zero dependencies, no build step.
// Runs identically at the bundle skill's pre-write gate (node) and in the client scan (browser import).
// Filesystem access is injected so the browser call site can supply its own file map.

// ---------------------------------------------------------------------------
// Constants (spec v1.1)
// ---------------------------------------------------------------------------

/* PL-12 / D-84 adds BIAS to both alternations. A bias SET is a bundle
   (`BIO_Declared_Bias_v0_1.md`, "Bias bundles and adoption") precisely so it
   inherits append-only history, member-authored transitions, convergent
   promotion, conformance checks and the store — "nothing new is invented for
   governance". A bundle is addressed by an id, so the id pattern is the first
   thing that has to know the type exists; before this, a BIAS- id read as
   malformed and C-2.5 refused the document before any bias rule could run,
   which is the literal sense of D-84's "a bias bundle cannot be written at
   all". Both regexes move together: an annotation on a bias bundle is an
   annotation like any other. */
export const BUNDLE_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
export const ANN_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*\.ann-\d{8}T\d{6}Z-[a-z0-9]+(-[a-z0-9]+)*$/;
export const FILENAME_RE = /^[A-Za-z0-9._-]+$/;
export const ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/* The construct formerly named Problem, then FOCUS, is the INQUIRY (REC-10;
   RECONCILED.md is the design). History is append-only and is not rewritten,
   so `problem` and `focus` and their literals remain LEGAL LEGACY ALIASES
   wherever they already exist, and the catalog judges a document by its
   NORMALIZED type. PROB-/FOCUS- ids may carry any spelling, because a
   bundle's id is immutable while its frontmatter modernizes on promotion.
   The alias map is FLATTENED, never chained: normalizeType is a single
   lookup, so problem points straight at inquiry rather than at focus. */
/* PL-12 / D-84: `bias` joins as a SIXTH prefix and a FIFTH canonical type. It
   has no legacy spelling and never will — it is born under the collapse rather
   than before it — so it appears exactly once here and needs no entry in
   LEGACY_TYPE_ALIASES. */
export const OBJECT_TYPES = { INFO: 'information', PROB: 'inquiry', FOCUS: 'inquiry', INQ: 'inquiry', PROJ: 'project', ACTN: 'action', BIAS: 'bias' };
export const LEGACY_TYPE_ALIASES = { problem: 'inquiry', focus: 'inquiry' };
export const normalizeType = (t) => LEGACY_TYPE_ALIASES[t] || t;

/* C-16 (RECONCILED §2.2): an inquiry has ONE authored field, the question;
   a title is a RENDERING of it and is never separately authored. THE
   DERIVATION RULE, stated once so every writer and the projection produce
   the same bytes: the title is the FIRST NON-EMPTY LINE of the question,
   whitespace-collapsed; beyond 120 characters it is cut at the last word
   boundary before 120 and an ellipsis is appended, so a cut is visible as
   a cut rather than reading as a silently different sentence. The first
   line, because a question is authored as one line and elaboration under
   it must not retitle the record. Pure and closure-free on purpose: the
   setup page embeds this function's source verbatim, so the client and
   the store cannot drift. */
export const INQUIRY_TITLE_MAX = 120;
export const deriveInquiryTitle = (question) => {
  const line = String(question == null ? '' : question)
    .split('\n').map((s) => s.trim()).find((s) => s !== '') || '';
  const flat = line.replace(/\s+/g, ' ');
  if (flat === '') return null;
  if (flat.length <= 120) return flat;
  const cut = flat.slice(0, 120);
  const at = cut.lastIndexOf(' ');
  return (at > 0 ? cut.slice(0, at) : cut) + '…';
};
/* The `## Question` section of an inquiry's bundle.md, for the projection's
   use of the rule above. Returns '' when the document has no such section
   (every legacy focus/problem document), so callers fall back to the title
   the document already carries instead of inventing one. */
export const inquiryQuestionOf = (markdown) => {
  const m = /\n## Question[^\S\n]*\n([\s\S]*?)(?=\n## |$)/.exec('\n' + String(markdown == null ? '' : markdown));
  return m ? m[1] : '';
};

/** Universal core fields (spec 3.1). */
export const CORE_FIELDS = [
  'id', 'object_type', 'schema', 'title', 'current_state', 'prior_state',
  'created', 'last_updated', 'produced_by', 'group', 'references',
  'state_history', 'annotations_open', 'reeval_pending', 'visuals'
];

/** Forbidden alias -> canonical (spec 3.3). */
export const FORBIDDEN_ALIASES = {
  status: 'current_state', state: 'current_state', pipeline_state: 'current_state',
  verdict: 'current_state', type: 'object_type', updated: 'last_updated', modified: 'last_updated'
};

/** Literal heading constants per type (spec Section 4).
 *
 * The inquiry collapse CHANGED this vocabulary, unlike the problem→focus
 * rename which kept it: a legacy focus/problem document carries the heading
 * set it was authored under, and append-only means it keeps validating
 * against that set forever (a rename that invalidated the past would be a
 * purge wearing a new name — focus.test.mjs's own words). So the legacy
 * spellings keep their own entries HERE as the record of the old contract,
 * `problem` pointing at the SAME array as `focus` so the two cannot drift,
 * and vocabFor below judges a document by its DECLARED spelling first with
 * the NORMALIZED type as the fallback. */
export const HEADINGS = {
  information: ['## Summary', '## Provenance Notes', '## Session Log', '## Review Notes'],
  inquiry: ['## Question', '## What It Rests On', '## Conclusion', '## What Would Falsify This', '## Session Log', '## Review Notes'],
  focus: ['## Statement', '## Why It Matters', '## Open Questions', '## Session Log', '## Review Notes'],
  project: ['## Thesis Summary', '## Open Questions', '## Ruled Out', '## Session Log', '## Review Notes'],
  action: ['## Plan', '## Status', '## Correspondence', '## Session Log', '## Review Notes'],
  /* PL-12 / D-84 — THE BIAS BUNDLE'S HEADING SET, and the third heading is the
     one that is not decoration.
     `## Statements` is the prose the members read; the STATEMENTS THEMSELVES
     live in frontmatter as `statements[]`, exactly as an inquiry's legs live in
     `basis[]`, because D-21 forbids a second place to state a fact and the
     projection below is a projection of the DOCUMENT.
     `## Adoption` is where the group records the process by which it adopted
     this set. The doctrine deliberately does not define that process — "defined
     and documented by that group, in the group's own process document" — and
     requires only that adoption is a recorded, member-authored transition. So
     the heading is where the group's own account of it lands, and it is what
     makes `op=biasadopt`'s row point at something a reader can check.
     `## What This Does Not Enforce` IS DEC-54 (b) IN THE DOCUMENT'S OWN BYTES.
     The ruling is that the unenforceable residue is "a first-class published
     output, not a log line": a case saying "held to AP's standards" must also
     say which of AP's standards this system does not check, because in four of
     five documented verification failures the countable rules were formally
     satisfied while the uncountable properties failed. A residue that lived
     only in an op's answer would be exactly the log line the ruling refuses —
     it would not travel with the bundle, and a stranger reading the bytes after
     this instance is gone would meet the enforcement without the caveat. It is
     REQUIRED IN EVERY STATE rather than only in `adopted`, and C-26.7 refuses
     it EMPTY on an adopted bundle, because a heading nobody filled is the
     checkbox C-21.1 exists to refuse arriving one layer down. */
  bias: ['## Statements', '## Adoption', '## What This Does Not Enforce', '## Session Log', '## Review Notes']
};
/* One legacy vocabulary, two spellings: same object, so no drift. */
HEADINGS.problem = HEADINGS.focus;

/* REC-14: headings that are CANONICAL for a type but required only in a
 * particular STATE. `## What This Excludes` is the completeness assertion's
 * home in the body, and C-3.1 refuses BOTH a missing required heading AND an
 * unexpected one — so until it is in the canonical set the exclusion cannot be
 * written at all, and once it is REQUIRED everywhere every open inquiry in the
 * corpus would carry an empty one.
 *
 * An empty heading on a question nobody has published is exactly the checkbox
 * C-21.1 exists to refuse, one layer down: it would make the canonical shape of
 * an inquiry include a promise it has not made. So the heading is PERMITTED in
 * every state (it can be drafted before publication, which is what the
 * ceremony's ordering needs — authoring the exclusion changes the sha, so it
 * cannot be written after the signature) and REQUIRED in `published`. */
export const HEADINGS_WHEN = {
  inquiry: [{ heading: '## What This Excludes', states: ['published'] }]
};
HEADINGS_WHEN.problem = HEADINGS_WHEN.focus = [];

/* THE type-keyed vocabulary lookup (REC-10, normalisation site 1 of 4).
 * Membership questions go through normalizeType (C-2.5); vocabulary
 * questions — which heading set, which state machine — resolve the
 * DECLARED spelling first, because the collapse changed those vocabularies
 * and a legacy document is judged by the contract it was written under,
 * then fall back to the normalized type, so a canonical document and any
 * future alias whose vocabulary did not change need no duplicate keys.
 * checkHeadings and checkStateLegality MUST look up through this rather
 * than raw table[ot]: the second rename left them un-normalized and
 * patched with duplicate keys, and DATA-MODEL.md §2.7 measured what that
 * costs a third name. */
export const vocabFor = (table, t) => table[t] !== undefined ? table[t] : table[normalizeType(t)];

/** Legal states and transition edges per type (spec Section 4; edge set is catalog-versioned). */
export const STATES = {
  information: {
    legal: ['collected', 'verified', 'retired'],
    edges: { collected: ['verified'], verified: ['retired'], retired: [] }
  },
  /* The INQUIRY machine (REC-10, extended by REC-13). `published` and
     `divided` still wait for REC-14/16, and they arrive TOGETHER WITH their
     entry requirements, so no state is ever legal before its gate exists —
     which is why `concluded` lands here in the same turn as
     checkInquiryExtension's concluded arm below and op=conclude in the store.
     `surfaced` is a LEGAL ALIAS of `open` (DATA-MODEL §2.7's recommendation):
     rewriting it would invent an authored fact and set current_state
     disagreeing with the document's own state_history (C-4.2), so it stays
     legal, appears wherever `open` appears — INCLUDING the new conclude edge,
     because refusing to conclude an inquiry merely because it spells its open
     state the old way would be the trap the alias exists to avoid — and the
     drift stays visible. `open` is legal[0] deliberately — setup.mjs derives
     FIRST_STATE from it.

     REC-13's edges, and only these: `open <-> concluded` both ways (a
     conclusion is revisable — reopening is how a group says the answer did
     not hold), and `concluded -> deferred|dismissed`, because a conclusion
     nobody publishes STILL AGES (D-79: a finding that silently stops being
     worked on is indistinguishable from one never made). Deliberately NOT
     added: `deferred -> concluded` and `dismissed -> concluded`. Concluding
     something the group set down means picking it back up first, and the
     machine already carries deferred/dismissed -> open for exactly that.
     `concluded -> surfaced` follows the table's own convention, where every
     existing edge into `open` names the alias beside it. */
  /* REC-14 / DEC-12: `published` joins, and it is NOT TERMINAL. It is
     reachable ONLY from `concluded` — a material set cannot be asserted over a
     question with no conclusion — and it leaves ONLY to `open` (and its
     `surfaced` alias), which is DEC-12's reopening: *"A closed finding can be
     reopened, and a published case can be revised, though when republished,
     the edition number must be incremented and the case treated as a separate
     document."*

     REOPENING DOES NOT UNPUBLISH, and this table is where that survives. The
     inquiry's STATE and its PUBLICATION HISTORY are two different records: the
     edges here move the working document, and published_bundles keeps every
     edition with its own signature, attestor, time and gate version forever.
     A revision therefore costs the full ceremony — published -> open ->
     concluded -> published at edition 2 — because each edition is a separate
     document that carries its own conclusion, its own falsifier and its own
     freshly authored completeness (C-21.1).

     DELIBERATELY NOT ADDED: `published -> deferred|dismissed`. Ageing is what
     happens to a finding NOBODY published (D-79); a published case cannot
     quietly stop being worked on, because it is already out in the world.
     `published -> published` is not an edge either: a new edition is entered
     through `open`, so the state_history a reader checks shows the reopening
     that produced it rather than a case that mutated in place. */
  /* REC-16 / DEC-28: `divided` joins, and it IS TERMINAL. It is a STATE and not
     a disposition, and the line between the two families is not terminality —
     `deferred` and `dismissed` are terminal-ish too — it is WHAT THE WORD
     CLAIMS ABOUT THE QUESTION. A disposition is a member's judgment about a
     well-formed question and the question survives it unchanged; `divided` says
     the QUESTION ITSELF was malformed, it was two questions, and the parent is
     corrected FORWARD into its children. That is DEC-19's shape and the
     supersession family, not the declination family. Its reason belongs to the
     ACT and `disposition_reason` is untouched.

     ENTERED FROM `open` (and its `surfaced` alias) AND FROM `concluded`, and
     NOT FROM `published` — the store refuses that one BY NAME
     (PUBLISHED_CANNOT_DIVIDE) rather than as a generic illegal move, because
     the two are different statements: an EDITION says the case continues, a
     DIVISION says the parent was malformed, and a signed edition cannot be
     retroactively declared malformed without erasing what a reader relied on.
     DEC-12 changed publishing; it did not change this.

     DELIBERATELY NOT ADDED: `deferred|dismissed -> divided`. A question the
     group set DOWN is picked back up first (op=reopen), exactly as concluding
     one is — the machine already carries those edges, and dividing something
     nobody is working on would make the disposition a state nothing can be
     reasoned about from.

     TERMINAL, and structurally so rather than by policy: the parent's legs are
     OWNED by its children now, and un-dividing would be the record changing its
     mind in silence. `divided: []` is that fact, and it is what makes the
     children's `supersedes` edges the only forward path. */
  inquiry: {
    legal: ['open', 'deferred', 'dismissed', 'surfaced', 'concluded', 'published', 'divided'],
    edges: {
      open: ['deferred', 'dismissed', 'concluded', 'divided'],
      surfaced: ['deferred', 'dismissed', 'concluded', 'divided'],
      deferred: ['open', 'surfaced', 'dismissed'],
      dismissed: ['open', 'surfaced', 'deferred'],
      concluded: ['open', 'surfaced', 'deferred', 'dismissed', 'published', 'divided'],
      published: ['open', 'surfaced'],
      divided: []
    }
  },
  /* The LEGACY focus machine, kept whole (elevated included) because a
     legacy focus/problem document validates against the vocabulary it was
     authored under — see the HEADINGS note. Nothing produces these states
     anymore; op=dispose runs on the inquiry machine above. */
  focus: {
    legal: ['surfaced', 'elevated', 'deferred', 'dismissed'],
    edges: {
      surfaced: ['elevated', 'deferred', 'dismissed'],
      deferred: ['surfaced', 'elevated', 'dismissed'],
      dismissed: ['surfaced', 'elevated', 'deferred'],
      elevated: []
    }
  },
  project: {
    legal: ['forming', 'investigating', 'matured', 'closed'],
    edges: {
      forming: ['investigating', 'closed'],
      investigating: ['matured', 'closed'],
      matured: ['closed'],
      closed: ['investigating']
    }
  },
  action: {
    legal: ['planned', 'active', 'awaiting_response', 'resolved', 'abandoned'],
    edges: {
      planned: ['active', 'abandoned'],
      active: ['awaiting_response', 'resolved', 'abandoned'],
      awaiting_response: ['active', 'resolved', 'abandoned'],
      resolved: [], abandoned: []
    }
  },
  /* PL-12 / D-84 — THE BIAS MACHINE, and `proposed` is DEC-54 (c) made
     structural rather than documented.
     `draft` is where a set is written. The doctrine already puts one rule on
     it — "a pattern statement without at least one citation cannot leave
     draft" — and C-26.4 is that rule, which is why it fires on the way OUT of
     draft rather than on the way in.
     `proposed` is the ONLY state an INHALE could ever reach, and the reason it
     exists as a state of its own. DEC-54 (c): "INHALE MEANS PROPOSE FOR
     ADOPTION, NEVER INSTALL. Adoption is an authored, attributed act (DEC-46,
     D-90, D-82). Otherwise adopting a policy becomes a way to LAUNDER a
     standard — 'we follow BBC standards' with nobody in the group having
     authored anything, which is the never-prefill violation wearing a
     compliance badge." A machine that could write `adopted` directly would BE
     that laundering, so the machine's ceiling is a state and not a convention.
     `adopted` is entered ONLY from `proposed`, and entering it is what
     `op=biasadopt` records with an author and a date.
     NO EDGE OUT OF `adopted` EXCEPT `retired`, and that is deliberate. An
     adopted set is PINNED (DEC-54 (d)) and a published case names the version
     it was held to; a set that could slide back to draft in place would make
     "the lens this case was produced under" unresolvable after the fact.
     Amending an adopted set is a NEW REVISION of the same bundle under
     append-only history — which re-pins — or a retirement and a successor.
     DELIBERATELY NOT ADDED: `draft -> adopted`. It is the only edge that could
     let a set become binding without ever having been proposed, and closing it
     is what makes the proposed state load-bearing rather than ceremonial. */
  bias: {
    legal: ['draft', 'proposed', 'adopted', 'retired'],
    edges: {
      draft: ['proposed', 'retired'],
      proposed: ['draft', 'adopted', 'retired'],
      adopted: ['retired'],
      retired: []
    }
  }
};
/* One machine, two spellings: the legacy alias points at the SAME object, so
   the tables cannot drift apart. */
STATES.problem = STATES.focus;

/** The ACTION vocabulary (C-2.10's suite). EXPORTED for op=affordances
 *  (REC-19): the plane publishes these so a surface never keeps a copy, and
 *  checkActionExtension consumes this same array, so the gate and the
 *  publication cannot drift apart. */
/* DEC-13 adds `request_for_comment` as the EIGHTH kind, and it is the one kind
 * in this array with an extra entry requirement attached (below). Bob's ruling
 * is that what is required is not the contact but the group's DECLARED,
 * JUSTIFIED POSITION on it — so this kind is never forced on anybody. What it
 * is forced to do is CARRY SPECIFICS when it is used: the Columbia Journalism
 * School review of Rolling Stone identified a comment request made WITHOUT
 * SPECIFICS as the central failure, so "we contacted them" and "we put these
 * four claims to them" must be different rows in this record. */
export const ACTION_KINDS = ['cpra_request', 'grand_jury', 'controller_referral', 'public_comment', 'media', 'litigation_support', 'request_for_comment', 'other'];

/* REC-24 (a): the two kinds a leg of an action's basis may carry. Exported for
 * the same reason ACTION_KINDS is — op=affordances publishes it and the store
 * projects against it, so the gate and the publication read ONE array. */
export const ACTION_BASIS_KINDS = ['rests_on', 'advances'];

/* REC-24 (b): the three directions a correspondence entry may carry.
 * `no_response` is the one that is easy to leave out and must not be: DEC-13
 * rules a refusal to reply a dated first-party fact about the body, and
 * frequently the more useful one. */
export const CORRESPONDENCE_DIRECTIONS = ['sent', 'received', 'no_response'];

/* REC-39: THE FOUR RESOLUTIONS — how an action ENDED, required by C-2.10 the
 * moment its state is `resolved`. Exported for the reason every array above it
 * is, and it is the LAST of the action loop's closed sets to get a home.
 *
 * WHAT IT COST TO HAVE NO HOME, measured by UI-24 rather than argued: these
 * four words were written out TWICE — inline in `checkActionExtension` below,
 * and again as a local `const RESOLUTIONS` inside `store.mjs actionMove()` —
 * and published NOWHERE, so `op=affordances` could not answer what a resolution
 * may be. A surface could therefore learn them only by asking `op=actionmove`
 * for a move it knew would be refused and reading the words out of the
 * `NO_RESOLUTION` refusal's `legal` list. That is a legitimate DEC-8 reading and
 * it is not a publication: it made the option set a property of a REFUSAL, so
 * the words could not be offered until the member had already been told no.
 *
 * THE DIRECTION IS THE ONE `ACTION_KINDS` ALREADY TAKES and is not a choice
 * between equals (REC-35's finding, restated): the vocabulary lives where its
 * CHECK runs, `affordances.mjs` imports it into `VOCABULARIES`, and `store.mjs`
 * imports it for the act's own pre-flight refusal. Exporting it from the store
 * instead would close an import cycle — `store.mjs` already imports
 * `affordances.mjs` — and crash at load in the temporal dead zone.
 *
 * ONE ARRAY, THREE READERS. Change a word here and C-2.10's finding, the act's
 * `NO_RESOLUTION` refusal and the published vocabulary all move together; the
 * affordances suite pins the publication equal-by-import in both directions so
 * a literal copy cannot be reintroduced quietly. */
export const RESOLUTIONS = ['complied', 'denied', 'escalated', 'withdrawn'];

/* PL-12 / D-84 — THE CLOSED SET OF THREE BIAS STATEMENT KINDS. Exported for
 * the reason ACTION_KINDS and RESOLUTIONS are: the check that judges a
 * statement, the store's own pre-flight refusal, and `op=affordances`'
 * publication must read ONE array, and a vocabulary written out twice is a
 * vocabulary that goes stale — measured on this project five times, most
 * recently as a hand-typed list two members short of the catalogue.
 *
 * WHY IT IS CLOSED, and why a fourth member is not a small addition. DEC-54:
 * "A standard of evidence is NOT one of the three bias kinds… A standard of
 * evidence is a BAR — how strong support must be before you assert — and BIO
 * already has that construct: DEC-17's required_strength." The two have
 * OPPOSITE mechanics: bias is DISCLOSED and refuses nothing (DEC-20), a bar
 * GATES and refuses at pre-flight. So the fourth kind anybody will reach for is
 * the one that breaks the gate/disclose distinction the whole doctrine rests
 * on, and C-26.6 exists because it will be reached for in a statement's TEXT
 * even when it is not reached for here. */
export const BIAS_STATEMENT_KINDS = ['scrutiny', 'inference', 'pattern'];

/* DEC-13's SOURCED PRECEDENT for a response window, carried as a citation and
 * NOT as an enforced range. GAO's own protocols under GAGAS/Yellow Book give an
 * audited agency 7 to 30 calendar days on a draft. What this catalog enforces is
 * that the window is AUTHORED by the group with a basis — the same shape a
 * progression's declared due-by takes — because a constant this project invented
 * would be this project asserting a deadline nobody agreed to. The numbers are
 * here so a surface can SHOW the precedent while the member chooses. */
export const RFC_RESPONSE_WINDOW_PRECEDENT = {
  min_days: 7, max_days: 30,
  source: 'GAGAS / GAO agency-comment protocol (7-30 calendar days on a draft)',
  enforced: false,
};

/** D-130 / REC-23: the counterparty is THREE-VALUED, and the shape is `source`'s.
 *
 *  WHAT WAS WRONG. C-2.10 refused an EMPTY counterparty and accepted any
 *  non-empty string, so the intake surfaces' literal `to be named` satisfied
 *  the check by being a string and the record asserted a counterparty it did
 *  not have. That is the overclaiming class, in the one construct that reaches
 *  outside the system — and it is the same pressure D-97 removed at the intake
 *  gate when it made authority three-valued rather than forcing a caller to
 *  invent one. `undetermined` is first-class and must be STATED.
 *
 *  THE SHAPE, and why it is this one. `counterparty` becomes a MAP:
 *
 *      counterparty:
 *        state: named | undetermined
 *        name: City Clerk                 # required under `named`
 *        entity_id: ENT-2026-0007         # OPTIONAL, under `named` only
 *        basis: <why it is not determined> # required under `undetermined`
 *
 *  A one-level map of scalars at two spaces is exactly what the restricted
 *  frontmatter grammar admits (spec 2.2/3.3) and exactly what `source:
 *  {locator, authority, retrieved}` already is. Nothing here nests further:
 *  where a block needed a map AND a list, REC-14 and REC-16 split it into two
 *  TOP-LEVEL keys (`completeness` / `completeness_excluded`, `division` /
 *  `division_apportionment`) because the grammar cannot carry a map holding an
 *  array of objects. The counterparty needs no such split — it is one party,
 *  four scalars — so it is one block and the precedent is untouched.
 *
 *  NO COUNTERPARTY TABLE, and `entity_id` is why the temptation exists. A
 *  separate counterparty registry would be a second subject registry with a
 *  different doctrine attached, and that is exactly where a structural prior by
 *  ROLE would eventually be added — which this project's stance forbids
 *  outright (bad actors are identified BY EVIDENCE, never assumed by role). So
 *  a counterparty that is a known subject POINTS INTO the one registry and the
 *  registry stays the only place a party is described.
 *
 *  WHAT THIS CHECK CANNOT DO, stated rather than implied. (a) It cannot resolve
 *  `entity_id`: the catalog is a pure function over an injected filesystem and
 *  its only resolver seam is `resolveTarget`, which answers for BUNDLE ids.
 *  The shape is checked here; resolution would need a new seam threaded from
 *  the store's gateFacts, and no caller needs it yet. (b) It cannot detect
 *  invention in general — a member who types "the relevant department" gets
 *  past every rule below. The check is a BOUNDARY, not a prose judge; the
 *  control that stops the invention is the surface's radio pair with no third
 *  option and no default (UI-19), and a check that permits `undetermined`
 *  without a control that OFFERS it just moves the invention one field over.
 *  So exactly ONE placeholder is named here, and it is named because it was
 *  MACHINE-WRITTEN on every action by two intake surfaces rather than typed by
 *  anyone. */
const COUNTERPARTY_STATES = ['named', 'undetermined'];
/* The subject registry's own key shape: `allocId("ENT", year)` in store.mjs
   yields ENT-<4-digit year>-<4-digit sequence>, with no slug (unlike a bundle
   id). Shape only — see (a) above. */
const ENTITY_ID_RE = /^ENT-\d{4}-\d{4}$/;
/* The one placeholder, compared case-folded and trimmed. It is the exact string
   `mdFor` wrote in `civicos-ui/app.html` and `src/setup.mjs` until this item
   deleted it, so a bundle carrying it was written by a machine that had no
   counterparty and said one anyway. */
const COUNTERPARTY_PLACEHOLDER = 'to be named';


// ---------------------------------------------------------------------------
// Finding helper
// ---------------------------------------------------------------------------

/**
 * @typedef {{check: string, severity: 'error'|'warn'|'info', message: string, repairable?: boolean, repairs?: string[], code?: string}} Finding
 */

/** REC-56 / D-206, 2026-08-05: THE OPTIONAL `code`, and why it exists.
 *
 *  REC-54 split C-18.9's chain arm into three findings because *no chain
 *  recorded*, *a chain recorded and empty* and *a chain field that is not a
 *  chain* are three different facts about the record with three different
 *  repairs — a gap in what was captured, a derivation that RAN and FOUND
 *  NOTHING, and a writer producing malformed output. It then stated the
 *  residual rather than hiding it: `op=audit`'s TALLY is keyed by CHECK ID, so
 *  all three land on `C-18.9` and the distinction reaches a reader only through
 *  the offender detail, which is bounded at 20 bundles per page against a page
 *  of up to 1,000. **A tally that collapses them re-creates in the REPORT the
 *  conflation the check just removed from the DATA**, which is the whole of
 *  D-206 and it is a real defect rather than a tidiness note.
 *
 *  IT IS DECIDED HERE AND THE TALLY CHANGES. CLAUDE.md is not ambiguous about
 *  which way: *"Absence at one level is not evidence of absence at the next …
 *  Saying which of those is true is a first-class obligation, not a diagnostic
 *  detail."* An audit answer that can only say "thirty C-18.9 errors" is
 *  refusing that obligation at exactly the surface an operator reads before
 *  calling anything done.
 *
 *  WHY A CODE ON THE FINDING RATHER THAN A SECOND CHECK ID: a check id is a
 *  RULE, versioned and registered, and three ids for one rule would be the
 *  vocabulary drifting to serve a report. A code is a discriminator WITHIN a
 *  rule, and it is minted at the same call site as the finding it describes.
 *
 *  WHY THIS IS NOT THE D-113 CLASS (a parallel list that falls out of step):
 *  the tally is DERIVED from the findings the checks actually produced, not
 *  from a hand-kept register beside them. A code cannot go stale, because there
 *  is nowhere for it to go stale relative to. `test/repair-reachability.test.mjs`
 *  holds the one property that could drift — a code is stable-shaped and unique
 *  within its check — so a second arm cannot quietly reuse a first arm's code.
 *
 *  OPTIONAL AND ADDITIVE. 142 of the catalogue's 145 repairable findings pass
 *  none, the property is then absent, and `op=audit`'s `tallyDetail` key is
 *  absent when nothing on the page carried a code.
 *
 * @returns {Finding} */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}

// ---------------------------------------------------------------------------
// Restricted-grammar frontmatter parser (spec 2.2, 3.3)
// Grammar: '---' fences; top-level keys at column 0; one-level maps at 2 spaces;
// arrays of scalars or of objects ('- ' at 2 spaces, object props at 4 spaces);
// inline [] arrays; optional '# ' comments after values; double or single quotes.
// ---------------------------------------------------------------------------

function stripComment(raw) {
  let inS = false, inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === '#' && !inS && !inD && (i === 0 || raw[i - 1] === ' ')) return raw.slice(0, i);
  }
  return raw;
}

function parseScalar(raw) {
  let v = stripComment(raw).trim();
  if (v === '') return '';
  if (v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map(s => parseScalar(s));
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

/**
 * Parse bundle.md frontmatter under the restricted grammar.
 * @param {string} text full bundle.md content
 * @returns {{data: Record<string, any>|null, findings: Finding[], body: string}}
 */
export function parseFrontmatter(text) {
  /** @type {Finding[]} */
  const findings = [];
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') {
    findings.push(f('C-2.1', 'error', 'bundle.md does not begin with a --- frontmatter fence'));
    return { data: null, findings, body: text };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { end = i; break; }
  if (end === -1) {
    findings.push(f('C-2.1', 'error', 'frontmatter fence is never closed'));
    return { data: null, findings, body: text };
  }

  /** @type {Record<string, any>} */
  const data = {};
  let topKey = null;          // current open block key ('key:' with no value)
  let topMode = null;         // 'map' | 'array' | null (undecided)
  let curElem = null;         // current array element object

  const keyLine = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const indKeyLine = /^( +)([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const itemLine = /^( +)- (.*)$/;

  for (let n = 1; n < end; n++) {
    const line = lines[n];
    const stripped = stripComment(line);
    if (stripped.trim() === '') continue;

    let m;
    if ((m = keyLine.exec(line))) {                     // column-0 key
      const key = m[1];
      const rest = m[2];
      topKey = null; topMode = null; curElem = null;
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        findings.push(f('C-2.1', 'error', `duplicate top-level key '${key}' at line ${n + 1}`));
      }
      if (stripComment(rest).trim() === '') {           // block start
        topKey = key; data[key] = undefined;            // decided by first child
      } else {
        data[key] = parseScalar(rest);
      }
    } else if ((m = itemLine.exec(line))) {             // '- ' array item
      const indent = m[1].length;
      const rest = m[2];
      if (!topKey) {
        findings.push(f('C-2.1', 'error', `array item outside any block at line ${n + 1}`));
        continue;
      }
      if (indent !== 2) findings.push(f('C-2.1', 'error', `array item indented ${indent} (expected 2) at line ${n + 1}`));
      if (topMode === null) { topMode = 'array'; data[topKey] = []; }
      if (topMode !== 'array') { findings.push(f('C-2.1', 'error', `array item inside a map block '${topKey}' at line ${n + 1}`)); continue; }
      const km = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(rest);
      if (km && stripComment(km[2]).trim() !== '') {    // object element: '- key: value'
        curElem = {}; curElem[km[1]] = parseScalar(km[2]);
        data[topKey].push(curElem);
      } else {                                          // scalar element
        curElem = null;
        data[topKey].push(parseScalar(rest));
      }
    } else if ((m = indKeyLine.exec(line))) {           // indented key
      const indent = m[1].length;
      const key = m[2];
      const rest = m[3];
      const isCore = CORE_FIELDS.includes(key) || key in FORBIDDEN_ALIASES;
      if (topKey && topMode === null && indent === 2) { // first child decides: map
        topMode = 'map'; data[topKey] = {};
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === 'map' && indent === 2) {
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === 'array' && curElem && indent === 4) {
        curElem[key] = parseScalar(rest);
      } else {
        // A key indented where the grammar has no slot for it: the Alpha buried-key failure mode.
        if (isCore) {
          findings.push(f('C-2.4', 'error',
            `top-level key '${key}' is buried by stray indentation at line ${n + 1} and will not register`,
            [`re-indent '${key}' to column 0`]));
          data[key] = parseScalar(rest);                // recover for downstream checks
        } else {
          findings.push(f('C-2.1', 'error', `key '${key}' indented ${indent} does not fit the restricted grammar at line ${n + 1}`));
        }
      }
    } else {
      findings.push(f('C-2.1', 'error', `line ${n + 1} does not fit the restricted grammar: ${line.slice(0, 60)}`));
    }
  }

  // undecided empty blocks become empty arrays
  for (const k of Object.keys(data)) if (data[k] === undefined) data[k] = [];

  return { data, findings, body: lines.slice(end + 1).join('\n') };
}

// ---------------------------------------------------------------------------
// Bundle context: injected file access so both call sites share one codebase.
// files: Map<relativePath, Uint8Array|string>. sha256: async (bytes) => hex.
// ---------------------------------------------------------------------------

/**
 * @typedef {{folderName: string, files: Map<string, Uint8Array|string>, sha256: (bytes: Uint8Array|string) => Promise<string>, nowMs?: number, maxPackageAgeDays?: number}} BundleInput
 */

function asText(v) {
  if (typeof v === 'string') return v;
  return new TextDecoder().decode(v);
}

/** Presence semantics (1.13.0): a path exists if its bytes are in files OR
 *  it is declared elided (present in the store, deliberately not carried).
 *  Used ONLY by existence assertions; byte checks read ctx.files directly. */
function hasFile_(ctx, path) {
  return ctx.files.has(path) || (ctx.elided && ctx.elided.has(path));
}

// ---------------------------------------------------------------------------
// Check families
// ---------------------------------------------------------------------------

function checkIdentity(ctx, findings) {
  const id = ctx.fm?.id;
  if (typeof id !== 'string' || !BUNDLE_ID_RE.test(id)) {
    findings.push(f('C-1.2', 'error', `frontmatter id '${id}' does not match the canonical ID grammar`));
  }
  if (typeof id === 'string' && id !== ctx.folderName) {
    findings.push(f('C-1.1', 'error', `folder name '${ctx.folderName}' does not equal frontmatter id '${id}'`,
      ['restore folder name from frontmatter id', 'restore frontmatter id from folder name if history confirms it']));
  }
  // annotation records
  const seen = new Set();
  for (const path of ctx.files.keys()) {
    if (!path.startsWith('annotations/')) continue;
    const name = path.slice('annotations/'.length);
    if (!name.endsWith('.json')) { findings.push(f('C-1.3', 'error', `annotation file '${name}' is not a .json record`)); continue; }
    let rec;
    try { rec = JSON.parse(asText(ctx.files.get(path))); }
    catch { findings.push(f('C-1.3', 'error', `annotation record '${name}' does not parse`)); continue; }
    const rid = rec.id;
    if (typeof rid !== 'string' || !ANN_ID_RE.test(rid)) {
      findings.push(f('C-1.3', 'error', `annotation id '${rid}' does not match the v1.1 timestamp-author grammar`));
      continue;
    }
    if (!rid.startsWith(ctx.folderName + '.ann-')) {
      findings.push(f('C-1.3', 'error', `annotation '${rid}' does not belong to parent '${ctx.folderName}'`));
    }
    const expectedFile = rid.slice(ctx.folderName.length + 1) + '.json'; // ann-<ts>-<author>.json
    if (name !== expectedFile) {
      findings.push(f('C-1.3', 'error', `annotation file '${name}' does not match its id (expected '${expectedFile}')`));
    }
    if (seen.has(rid)) {
      findings.push(f('C-1.3', 'error', `duplicate annotation id '${rid}'`, ['adjust the later record timestamp suffix by one second, logged']));
    }
    seen.add(rid);
  }
  // annotations_open is a derived convenience, checker-verified (spec 3.1)
  let pending = 0;
  for (const path of ctx.files.keys()) {
    if (!path.startsWith('annotations/') || !path.endsWith('.json')) continue;
    try { if (JSON.parse(asText(ctx.files.get(path))).state === 'pending') pending++; } catch { /* reported above */ }
  }
  if (ctx.fm && typeof ctx.fm.annotations_open === 'number' && ctx.fm.annotations_open !== pending) {
    findings.push(f('C-1.3', 'warn', `annotations_open is ${ctx.fm.annotations_open} but ${pending} annotation record(s) are pending`, ['refresh annotations_open on the next write']));
  }
}

function checkFrontmatterContract(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  for (const key of CORE_FIELDS) {
    if (!(key in fm)) findings.push(f('C-2.2', 'error', `required core field '${key}' is missing`));
  }
  for (const [alias, canonical] of Object.entries(FORBIDDEN_ALIASES)) {
    if (alias in fm) findings.push(f('C-2.3', 'error', `forbidden alias '${alias}' present (canonical name is '${canonical}')`, [`rename '${alias}' to '${canonical}'`]));
  }
  const ot = fm.object_type;
  if (!Object.values(OBJECT_TYPES).includes(normalizeType(ot))) {
    findings.push(f('C-2.5', 'error', `object_type '${ot}' is not a known type`));
  } else {
    const prefix = fm.id && String(fm.id).split('-')[0];
    const wantType = OBJECT_TYPES[prefix];
    if (wantType && wantType !== normalizeType(ot)) findings.push(f('C-2.5', 'error', `id prefix '${prefix}' implies '${wantType}' but object_type is '${ot}'`));
    const schema = fm.schema;
    const sm = typeof schema === 'string' && /^([a-z]+)@(\d+)$/.exec(schema);
    if (!sm) findings.push(f('C-2.5', 'error', `schema stamp '${schema}' is not of the form <type>@<n>`));
    else {
      if (normalizeType(sm[1]) !== normalizeType(ot)) findings.push(f('C-2.5', 'error', `schema stamp '${schema}' does not match object_type '${ot}'`));
      if (!ctx.knownSchemas.includes(schema)) findings.push(f('C-2.5', 'error', `schema version '${schema}' is not known to this check catalog`));
    }
  }
  for (const key of ['created', 'last_updated']) {
    if (typeof fm[key] === 'string' && !ISO_TS_RE.test(fm[key])) {
      findings.push(f('C-2.6', 'error', `${key} '${fm[key]}' is not ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ)`));
    }
  }
  if (fm.produced_by && typeof fm.produced_by === 'object') {
    if (!fm.produced_by.mode) findings.push(f('C-2.2', 'error', 'produced_by.mode is missing'));
    if (!fm.produced_by.capability_tier) findings.push(f('C-2.2', 'error', 'produced_by.capability_tier is missing'));
  }
  checkReevalPending(ctx, findings);
}

/**
 * C-10 cascade hygiene (spec v1.2). reeval_pending is a {flag, since, source}
 * record. A legacy bare boolean is accepted (old bundles validate against the
 * contract they declared) but a true flag with no `since` cannot be staleness-
 * checked, so it is surfaced. When `since` is present and the flag is true, a
 * `since` older than the policy age is a surfaced finding (info, not load-bearing).
 */
const REEVAL_SOURCES = ['deletion', 'source_status', 'wp_retraction', 'annotation'];
function checkReevalPending(ctx, findings) {
  const rp = ctx.fm?.reeval_pending;
  if (rp === undefined) return; // C-2 core-field presence handles absence
  const ageDays = ctx.maxReevalAgeDays ?? 30;
  if (typeof rp === 'boolean') {
    if (rp === true) {
      findings.push(f('C-10.1', 'warn', 'reeval_pending is a legacy boolean true with no since/source; staleness cannot be checked',
        ['migrate reeval_pending to {flag, since, source}']));
    }
    return;
  }
  if (typeof rp !== 'object') {
    findings.push(f('C-10.1', 'error', `reeval_pending must be a {flag, since, source} record or boolean, got ${typeof rp}`));
    return;
  }
  if (typeof rp.flag !== 'boolean') {
    findings.push(f('C-10.1', 'error', 'reeval_pending.flag must be boolean'));
    return;
  }
  if (rp.flag === false) {
    if (rp.since != null || rp.source != null) {
      findings.push(f('C-10.1', 'warn', 'reeval_pending.flag is false but since/source are not null',
        ['reset since and source to null when clearing the flag']));
    }
    return;
  }
  // flag is true: since and source are required and meaningful
  if (!ISO_TS_RE.test(rp.since || '')) {
    findings.push(f('C-10.1', 'error', 'reeval_pending.flag is true but since is not an ISO-8601 UTC instant',
      ['stamp since with the cascade event time']));
  } else {
    const ageMs = (ctx.nowMs ?? Date.now()) - Date.parse(rp.since);
    if (ageMs > ageDays * 86400000) {
      findings.push(f('C-10.1', 'info', `reeval_pending set ${Math.floor(ageMs / 86400000)}d ago (policy age ${ageDays}d) with no recorded re-evaluation`,
        ['perform and record the re-evaluation', 'record an explicit accept-risk note (policy permitting)']));
    }
  }
  if (!REEVAL_SOURCES.includes(rp.source)) {
    findings.push(f('C-10.1', 'error', `reeval_pending.source '${rp.source}' is not one of: ${REEVAL_SOURCES.join(', ')}`));
  }
}

function checkHeadings(ctx, findings) {
  const ot = ctx.fm?.object_type;
  /* Normalisation site 1 (REC-10): through the catalog's own alias
     machinery, never a raw table lookup patched with duplicate keys. */
  const required = vocabFor(HEADINGS, ot);
  if (!required) return; // type invalid; C-2.5 already fired
  /* REC-14: the state-conditional canon. Permitted in every state, required in
     the states that name it — read through vocabFor like the base set, so a
     legacy focus/problem document is judged by its own contract here too. */
  const conditional = vocabFor(HEADINGS_WHEN, ot) || [];
  const canonical = [...required, ...conditional.map(c => c.heading)];
  const present = (ctx.body.match(/^## .*$/gm) || []).map(h => h.trimEnd());
  for (const h of required) {
    if (!present.includes(h)) findings.push(f('C-3.1', 'error', `required heading '${h}' is missing`, [`insert canonical heading '${h}' with empty body`]));
  }
  for (const c of conditional) {
    if (c.states.includes(ctx.fm?.current_state) && !present.includes(c.heading))
      findings.push(f('C-3.1', 'error', `required heading '${c.heading}' is missing: the ${ctx.fm?.current_state} state carries it`, [`insert canonical heading '${c.heading}' with the assertion in it`]));
  }
  for (const h of present) {
    if (!canonical.includes(h)) findings.push(f('C-3.1', 'error', `heading '${h}' is not in the canonical set for ${ot}`, ['rename to the canonical heading, preserving body']));
  }
}

function checkStateLegality(ctx, findings) {
  const ot = ctx.fm?.object_type;
  /* Normalisation site 1 (REC-10), same as checkHeadings: the second rename
     patched this lookup with STATES.problem = STATES.focus instead of
     normalising, and DATA-MODEL.md §2.7 measured what that costs. */
  const spec = vocabFor(STATES, ot);
  if (!spec) return;
  const cur = ctx.fm.current_state;
  if (!spec.legal.includes(cur)) {
    findings.push(f('C-4.1', 'error', `current_state '${cur}' is not legal for ${ot} (legal: ${spec.legal.join(', ')})`));
  }
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  let prevTs = null;
  for (let i = 0; i < hist.length; i++) {
    const e = hist[i];
    if (typeof e !== 'object' || e === null) { findings.push(f('C-4.2', 'error', `state_history[${i}] is not an object`)); continue; }
    for (const k of ['timestamp', 'from_state', 'to_state', 'blurb', 'author']) {
      if (!(k in e)) findings.push(f('C-4.2', 'error', `state_history[${i}] missing '${k}'`));
    }
    if (typeof e.timestamp === 'string' && !ISO_TS_RE.test(e.timestamp)) {
      findings.push(f('C-2.6', 'error', `state_history[${i}].timestamp '${e.timestamp}' is not ISO 8601 UTC`));
    }
    if (prevTs && e.timestamp && e.timestamp < prevTs) {
      findings.push(f('C-4.2', 'error', `state_history[${i}] is out of chronological order`));
    }
    prevTs = e.timestamp || prevTs;
    const edges = spec.edges[e.from_state];
    if (edges && !edges.includes(e.to_state)) {
      findings.push(f('C-4.2', 'error', `transition ${e.from_state} -> ${e.to_state} is not a legal ${ot} edge`));
    }
  }
  if (hist.length > 0) {
    const last = hist[hist.length - 1];
    if (last.to_state !== cur) findings.push(f('C-4.2', 'error', `current_state '${cur}' disagrees with last transition to '${last.to_state}'`));
    if (ctx.fm.prior_state !== last.from_state) findings.push(f('C-4.2', 'error', `prior_state '${ctx.fm.prior_state}' disagrees with last transition from '${last.from_state}'`));
  } else if (ctx.fm.prior_state !== null && ctx.fm.prior_state !== undefined) {
    findings.push(f('C-4.2', 'error', `prior_state is '${ctx.fm.prior_state}' but state_history is empty (expected null)`));
  }
}

function checkWriteCompleteness(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  if (typeof fm.created === 'string' && typeof fm.last_updated === 'string' && fm.last_updated < fm.created) {
    findings.push(f('C-13.1', 'error', `last_updated '${fm.last_updated}' precedes created '${fm.created}'`));
  }
  const hist = Array.isArray(fm.state_history) ? fm.state_history : [];
  if (hist.length > 0) {
    const newest = hist[hist.length - 1].timestamp;
    if (typeof newest === 'string' && typeof fm.last_updated === 'string' && fm.last_updated < newest) {
      findings.push(f('C-13.1', 'error', `last_updated precedes the newest state_history timestamp '${newest}'`));
    }
  }
  if (typeof fm.created === 'string' && typeof fm.last_updated === 'string' && fm.last_updated > fm.created) {
    const idx = ctx.body.indexOf('## Session Log');
    const section = idx >= 0 ? ctx.body.slice(idx, ctx.body.indexOf('\n## ', idx + 1) === -1 ? undefined : ctx.body.indexOf('\n## ', idx + 1)) : '';
    if (!/^### Session /m.test(section)) {
      findings.push(f('C-13.2', 'error', 'bundle has been updated but carries no Session Log entry', ['append the missing Session Log entry naming the gap']));
    }
  }
}

function checkFormatHygiene(ctx, findings) {
  const escapeRe = /\\[#*_\-\[\]!~&]/;
  for (const [path, content] of ctx.files) {
    const name = path.split('/').pop() || path;
    if (!FILENAME_RE.test(name) || name.includes(' ') || !name.includes('.') || !/\.[a-z0-9]+$/.test(name)) {
      findings.push(f('C-14.2', 'error', `filename '${path}' violates the naming rule`, ['rename file and update references']));
    }
    if (name.endsWith('.md')) {
      const text = asText(content);
      const m = escapeRe.exec(text);
      if (m) findings.push(f('C-14.1', 'error', `escaped markdown character '${m[0]}' in ${path}`, ['normalize to clean markdown']));
    }
    if (name.endsWith('.json')) {
      try { JSON.parse(asText(content)); }
      catch { findings.push(f('C-14.3', 'error', `${path} does not parse as JSON`, ['restore from history'])); }
    }
  }
  const visuals = Array.isArray(ctx.fm?.visuals) ? ctx.fm.visuals : [];
  const svgOnDisk = [...ctx.files.keys()].filter(p => !p.includes('/') && p.endsWith('.svg'));
  for (const v of visuals) {
    if (typeof v !== 'object' || !v.file || !v.description) {
      findings.push(f('C-14.4', 'error', `visuals entry ${JSON.stringify(v).slice(0, 50)} lacks file+description`));
      continue;
    }
    if (!ctx.files.has(v.file)) findings.push(f('C-14.4', 'error', `visuals entry '${v.file}' has no file on disk`));
  }
  for (const svg of svgOnDisk) {
    if (!visuals.some(v => v && v.file === svg)) {
      findings.push(f('C-14.4', 'error', `svg '${svg}' on disk is absent from the visuals array`));
    }
  }
}

async function checkQueueAndBase(ctx, findings) {
  // C-16.5: stale advisory artifacts (claims, presence markers, and, at
  // 1.12.0, checkpointed-promotion gate verdicts) never lie around.
  // PROMOTING/PRESENCE are execution-scoped: stale at 10 minutes.
  // GATE_PASSED-<hash8> is a promotion checkpoint (KICKOFF-P2M6 4a item 2):
  // it must survive retry cadences across executions, so its window is 48
  // hours; it is hash-bound to one manifest, honored only fresh, and the
  // promoter removes it on successful consumption, so a survivor here is a
  // crashed or superseded promotion worth surfacing.
  // LEASE-<actor> (1.14.0, P2M8 A2) is the edit lease's marker: it carries
  // its OWN expiry ({acquired, expires}, ten-minute TTL renewed at five),
  // so it is stale exactly when past its self-declared expires; the
  // endpoint sweeps expired leases on sight and a survivor here is a
  // crashed holder, the same failure class as a crashed promoter.
  const staleMs = 10 * 60 * 1000;
  const gateMarkerStaleMs = 48 * 60 * 60 * 1000;
  for (const p of ctx.files.keys()) {
    const gm = /^GATE_PASSED-[0-9a-f]{8}\.json$/.exec(p);
    const lm = gm ? null : /^LEASE-[A-Za-z0-9][A-Za-z0-9-]{0,63}\.json$/.exec(p);
    const m = (gm || lm) ? null : /^(PROMOTING|PRESENCE)-.+\.json$/.exec(p);
    if (!gm && !lm && !m) continue;
    let stale;
    if (lm) {
      let expires = null;
      try { expires = Date.parse(JSON.parse(asText(ctx.files.get(p))).expires || ''); } catch { /* fallthrough */ }
      stale = expires === null || Number.isNaN(expires) || (ctx.nowMs ?? Date.now()) > expires;
    } else {
      const windowMs = gm ? gateMarkerStaleMs : staleMs;
      let ts = null;
      try { const rec = JSON.parse(asText(ctx.files.get(p))); ts = Date.parse(rec.ts || rec['started-at'] || rec.started_at || ''); } catch { /* fallthrough */ }
      stale = ts === null || Number.isNaN(ts) || (ctx.nowMs ?? Date.now()) - ts > windowMs;
    }
    if (stale) {
      findings.push(f('C-16.5', 'info', `stale advisory artifact '${p}' (crashed or ended actor)`, ['delete the stale claim or presence marker']));
    }
  }
  const manifestRaw = ctx.files.get('PENDING_PROMOTION.json');
  const pendingFiles = [...ctx.files.keys()].filter(p => p.endsWith('.pending'));

  if (!manifestRaw) {
    for (const p of pendingFiles) {
      findings.push(f('C-16.4', 'error', `orphaned pending file '${p}' with no manifest`, ['complete consumption: archive manifest, delete consumed files (idempotent)']));
    }
    return;
  }
  let man;
  try { man = JSON.parse(asText(manifestRaw)); }
  catch { findings.push(f('C-16.1', 'error', 'PENDING_PROMOTION.json does not parse')); return; }

  for (const k of ['target', 'base', 'files', 'created', 'author', 'skill_version']) {
    if (!(k in man)) findings.push(f('C-16.1', 'error', `manifest missing '${k}'`));
  }
  if (man.target && man.target !== ctx.folderName) {
    findings.push(f('C-16.1', 'error', `manifest target '${man.target}' does not match bundle '${ctx.folderName}'`));
  }
  const listed = new Set();
  if (Array.isArray(man.files)) {
    for (const entry of man.files) {
      if (!entry || !entry.name || !entry.sha256) {
        findings.push(f('C-16.1', 'error', `manifest files entry ${JSON.stringify(entry)} lacks name+sha256`));
        continue;
      }
      listed.add(entry.name + '.pending');
      const pending = ctx.files.get(entry.name + '.pending');
      if (!pending) {
        findings.push(f('C-16.2', 'error', `package file '${entry.name}.pending' listed in manifest is missing`, ['discard the package with a finding to the producing author', 're-produce the package from the originating session outputs']));
        continue;
      }
      const hash = await ctx.sha256(pending);
      if (hash !== entry.sha256) {
        findings.push(f('C-16.2', 'error', `hash mismatch on '${entry.name}.pending' (manifest ${String(entry.sha256).slice(0, 12)}…, actual ${hash.slice(0, 12)}…)`, ['discard the package (never promote)', 're-produce the package']));
      }
    }
  }
  for (const p of pendingFiles) {
    if (!listed.has(p)) findings.push(f('C-16.4', 'error', `pending file '${p}' is not listed in the manifest`, ['complete consumption or discard with reason']));
  }
  // staleness
  if (typeof man.created === 'string' && ISO_TS_RE.test(man.created)) {
    const ageDays = ((ctx.nowMs ?? Date.now()) - Date.parse(man.created)) / 86400000;
    if (ageDays > ctx.maxPackageAgeDays) {
      findings.push(f('C-16.3', 'warn', `pending package is ${Math.floor(ageDays)} days old (policy ${ctx.maxPackageAgeDays})`, ['promote now', 'discard with reason if superseded, preserving the manifest as a record']));
    }
  } else {
    findings.push(f('C-16.1', 'error', `manifest created '${man.created}' is not ISO 8601 UTC`));
  }
  // (base coherence follows below)
  const live = ctx.files.get('bundle.md');
  if (live && typeof man.base === 'string') {
    const liveHash = await ctx.sha256(live);
    if (liveHash === man.base) {
      findings.push(f('C-17.1', 'info', 'pending package base matches live bundle.md: fast-forward eligible'));
    } else {
      findings.push(f('C-17.1', 'warn', `pending package base ${String(man.base).slice(0, 12)}… does not match live bundle.md ${liveHash.slice(0, 12)}…: divergence`, ['rebase via a reconciliation session', 'supersede: human selects one, the other preserved as a diverged branch in _history', 'apply-disjoint if file sets prove disjoint (requires history manifests)']));
      // C-17.2 (v1.7.0): disjointness auto-classification, the I-17 ladder's
      // mechanical rung. Same classifier the client promoter uses.
      const cls = classifyDivergence(man, ctx.files);
      if (cls.rung === 'disjoint-auto') {
        findings.push(f('C-17.2', 'info', `divergence classified disjoint-auto: base found in history at ${cls.baseKey}; intervening promotion(s) [${cls.intervening.join(', ')}] touched {${[...cls.interveningFiles].join(', ')}}, package touches {${man.files.map(e => e.name).join(', ')}}, sets disjoint; apply in sequence recording both bases`, ['apply-disjoint: promote in sequence, recording base and applied-over in the history manifest entry']));
      } else {
        findings.push(f('C-17.2', 'warn', `divergence classified adjudicated: ${cls.reason}`, ['rebase via a reconciliation session', 'supersede: human selects one, the other preserved as a diverged branch in _history', 'apply-disjoint only if re-examination shows the overlap illusory']));
      }
    }
  }
}

/**
 * The I-17 divergence ladder's mechanical classifier (State Rules 5.5).
 * Given a pending manifest whose base does NOT match live bundle.md, decide
 * between disjoint-auto and adjudicated using only store state:
 * _history/manifest.json entries plus the verbatim promotion_<key>.json
 * records, whose per-file sha256 lists let the bundle.md hash chain be
 * reconstructed. disjoint-auto requires BOTH: the base resolves to a point
 * in recorded history, and the package's file set is disjoint from the
 * union of files touched by every intervening promotion (file granularity;
 * sub-file merge is a sync-engine concern, never the kernel's).
 * Pure and shared: the gate's C-17.2 and the client promoter both call it.
 */
export function classifyDivergence(man, files) {
  const histRaw = files.get('_history/manifest.json');
  if (histRaw == null) return { rung: 'adjudicated', reason: 'no history manifest: disjointness unverifiable' };
  let hist;
  try { hist = JSON.parse(typeof histRaw === 'string' ? histRaw : new TextDecoder().decode(histRaw)); } catch { return { rung: 'adjudicated', reason: 'history manifest unreadable' }; }
  const entries = Array.isArray(hist.entries) ? [...hist.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];
  if (entries.length === 0) return { rung: 'adjudicated', reason: 'history manifest has no entries' };
  // Anchor man.base in the chain. Two legitimate anchor forms, and we take
  // the LATEST match to minimize the intervening set:
  //   (a) man.base === entries[i].base: the base was live immediately
  //       before promotion i ran; intervening = entries[i..].
  //   (b) man.base === bundle.md hash AFTER promotion i (from the verbatim
  //       promotion record); intervening = entries[i+1..].
  let start = -1; // index into entries where "intervening" begins
  let anchor = null;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].base === man.base) { start = i; anchor = `before ${entries[i].key}`; }
  }
  let recordGap = false;
  for (let i = 0; i < entries.length; i++) {
    const recRaw = files.get(`_history/promotion_${entries[i].key}.json`);
    if (recRaw == null) { recordGap = true; continue; }
    try {
      const rec = JSON.parse(typeof recRaw === 'string' ? recRaw : new TextDecoder().decode(recRaw));
      const b = Array.isArray(rec.files) ? rec.files.find(x => x.name === 'bundle.md') : null;
      if (b && b.sha256 === man.base && i + 1 > start) { start = i + 1; anchor = `after ${entries[i].key}`; }
    } catch { recordGap = true; }
  }
  if (start === -1) {
    return { rung: 'adjudicated', reason: recordGap ? 'package base not found in recorded history (and some promotion records are missing or unreadable: chain incomplete)' : 'package base not found anywhere in recorded history' };
  }
  const intervening = entries.slice(start);
  if (intervening.length === 0) return { rung: 'adjudicated', reason: 'base resolves to the chain tail yet live differs: unrecorded live edit' };
  const interveningFiles = new Set();
  for (const e of intervening) for (const n of (e.files || [])) interveningFiles.add(n);
  const overlap = man.files.map(e => e.name).filter(n => interveningFiles.has(n));
  if (overlap.length > 0) return { rung: 'adjudicated', reason: `overlapping substantive divergence on {${overlap.join(', ')}}` , interveningFiles };
  return { rung: 'disjoint-auto', baseKey: anchor, intervening: intervening.map(e => e.key), interveningFiles };
}

// ---------------------------------------------------------------------------
// Per-type extension checks (I-2 family). information@1: C-2.7.
// ---------------------------------------------------------------------------

/** Canonicalize a parsed JSON value: recursively sorted keys, compact output. */
export function canonicalJson(v) {
  if (Array.isArray(v)) return '[' + v.map(canonicalJson).join(',') + ']';
  if (v !== null && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

const INFO_ENUMS = {
  criticality: ['crucial', 'supporting'],
  source_status: ['unchanged', 'modified', 'removed']
};
/* EXPORTED for REC-26 (the `export` keyword is the whole change — sectionText's
   precedent). The monitor-cadence consumer's interval table is keyed off THIS
   array rather than a local copy of the words, so a frequency the catalog gains
   cannot silently fall through to a default interval: the MAP RULE, applied to a
   vocabulary the scheduler now reads. */
export const MONITOR_FREQ = ['hourly', 'daily', 'weekly', 'monthly', 'per_meeting', 'none'];
const CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;

async function checkInformationExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const fm = ctx.fm;
  for (const [field, legal] of Object.entries(INFO_ENUMS)) {
    if (!legal.includes(fm[field])) {
      findings.push(f('C-2.7', 'error', `${field} '${fm[field]}' is not one of: ${legal.join(', ')}`));
    }
  }
  const src = fm.source;
  if (!src || typeof src !== 'object') findings.push(f('C-2.7', 'error', 'source block is missing'));
  else for (const k of ['locator', 'authority', 'retrieved']) {
    if (!src[k]) findings.push(f('C-2.7', 'error', `source.${k} is missing`));
  }
  const mon = fm.monitoring;
  if (!mon || typeof mon !== 'object') findings.push(f('C-2.7', 'error', 'monitoring block is missing'));
  else {
    if (typeof mon.enabled !== 'boolean') findings.push(f('C-2.7', 'error', `monitoring.enabled '${mon.enabled}' is not boolean`));
    if (!MONITOR_FREQ.includes(mon.frequency)) findings.push(f('C-2.7', 'error', `monitoring.frequency '${mon.frequency}' is not one of: ${MONITOR_FREQ.join(', ')}`));
  }
  const ch = fm.content_hash;
  const chOk = typeof ch === 'string' && CONTENT_HASH_RE.test(ch);
  if (ch !== undefined && ch !== null && ch !== '' && !chOk) {
    findings.push(f('C-2.7', 'error', `content_hash '${String(ch).slice(0, 24)}…' is not sha256:<64 hex>`));
  }
  // Recompute the hash from the canonical dataset when both exist.
  const dsRaw = ctx.files.get('data/dataset.json');
  if (dsRaw && chOk) {
    try {
      const canon = canonicalJson(JSON.parse(asText(dsRaw)));
      const actual = 'sha256:' + await ctx.sha256(canon);
      if (actual !== ch) {
        findings.push(f('C-2.7', 'error', `content_hash does not match the canonicalized data/dataset.json (declared ${ch.slice(7, 19)}…, actual ${actual.slice(7, 19)}…)`,
          ['refresh content_hash and append a change record', 'restore data/dataset.json from history']));
      }
    } catch { /* C-14.3 already reports unparsable JSON */ }
  }
  // verified-state entry requirements
  if (fm.current_state === 'verified') {
    if (!chOk) findings.push(f('C-2.7', 'error', 'verified state requires a well-formed content_hash'));
    if (!dsRaw) findings.push(f('C-2.7', 'error', 'verified state requires data/dataset.json'));
    const hasSnap = [...ctx.files.keys()].some(p => p.startsWith('snapshots/'))
      || (ctx.elided && [...ctx.elided].some(p => p.startsWith('snapshots/')));
    if (!hasSnap) findings.push(f('C-2.7', 'error', 'verified state requires at least one file in snapshots/'));
  }
  // change records, when present
  const chRaw = ctx.files.get('data/changes.json');
  if (chRaw) {
    try {
      const recs = JSON.parse(asText(chRaw));
      const arr = recs && Array.isArray(recs.records) ? recs.records : null;
      if (!arr) findings.push(f('C-2.7', 'error', 'data/changes.json must be {"records": [...]}'));
      else for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        if (!r || !ISO_TS_RE.test(r.detected || '') || !['modified', 'removed', 'corrected'].includes(r.kind) || !r.summary) {
          findings.push(f('C-2.7', 'error', `changes.json records[${i}] lacks detected/kind/summary in the required shape`));
        }
      }
    } catch { /* C-14.3 reports */ }
  }
}

// ---------------------------------------------------------------------------
// Step-4 families: C-5 append-only, C-6 references, C-12 history, C-15 recheck.
// ---------------------------------------------------------------------------

/* `links_to` joined the vocabulary with 0.45.0, and it is the only value here
   that is NOT a member's act. Every other relation is something a member
   decided: this document cites that one, supersedes it, was elevated into it.
   `links_to` is something the SOURCE asserted and BIO observed, and in a system
   whose subject is who claimed what, "we say these are connected" and "the
   City's page carried an anchor tag" cannot be the same edge.
   *
   * It also differs in what it claims about VERSION. A member citing declares
   which thing they mean. An observed link declares nothing: the page's author
   did not say which edition of the target they intended and usually did not
   think about it. So a links_to edge carries a contemporaneity verdict, and
   `undetermined` is its resting state.
   *
   * A member may PROMOTE an observed links_to into a cites, which is a member's
   act and is recorded as one. That promotion is the point of holding it. */
/* REC-24 (g) adds `responds_to`, and it arrives WITH A PRODUCER AND A CONSUMER
   because REC-16 already paid for the alternative: `supersedes` sat in this
   array for weeks with zero occurrences in store.mjs, and membership of the
   vocabulary meant only that C-6.1 would not refuse the string. So the edge
   arrives governed. It is written by op=actioncorrespond onto the CAPTURED
   REPLY — the response document points back at the action, which is the
   direction SB-OUTPUT's A10 row names — and it is read by op=projection's
   derived action block, which answers "what responded to this action" as one
   indexed lookup over refs_target. Its requirement (below) is that the target
   is an ACTION: an edge saying "this is a response" that points at a question
   or a document asserts a correspondence that never happened. */
const REL_VOCAB = ['cites', 'relates_to', 'elevated_into', 'initiates', 'derived_from', 'supersedes', 'corroborates', 'links_to', 'responds_to'];
/* Source-asserted relations. Not a member's claim, so surfaces that count what a
   group has said about its material must exclude them, and a corroboration count
   that included them would be counting the source agreeing with itself. */
const SOURCE_ASSERTED_RELS = ['links_to'];
const EDGE_STATUS = ['proposed', 'confirmed', 'severed'];

/* Exported for REC-22: the public read path renders `## Conclusion`,
   `## What Would Falsify This` and `## What This Excludes` out of the published
   bytes, and it must slice them exactly the way the catalog does. One parser,
   because a reader and a gate disagreeing about where a section ends is a
   disagreement about what the group published. */
export function sectionText(body, heading) {
  const idx = body.indexOf(heading);
  if (idx < 0) return null;
  const next = body.indexOf('\n## ', idx + 1);
  return body.slice(idx, next === -1 ? undefined : next);
}

// ---------------------------------------------------------------------------
// C-18: the release-authority family (I-18 candidate, State Rules v1.5 draft;
// intake doctrine Sections 2, 4, 4a). Scoped by declared contract: enforced
// only on information bundles carrying the intake provenance register
// (data/provenance.json), the artifact whose presence declares the intake
// contract. Pre-contract bundles keep validating against what they declared
// (spec Section 8 check versioning); store-wide bindingness arrives with the
// schema bump that makes the register mandatory.
// ---------------------------------------------------------------------------

/** Surface and AI identities, never release authors. Staged named-member-now:
 *  a member identity is any named identity outside this closed set, until the
 *  engagement layer adds per-member credentials (intake doctrine 4a). */
export const NON_MEMBER_AUTHORS = ['claude', 'pwa-client', 'daemon', 'sweep', 'session', 'accelerator', 'apps-script', 'system', 'agent', 'ai'];
const CAPTURE_GRADES = ['A', 'B', 'C'];
/** The three actor classes a capture may DECLARE (C-18.1). Exported since
 *  REC-46 because a bare class word standing where a person's name belongs is
 *  one of the three ways this plane used to ask "is this a machine" — see
 *  `isMachineIdentity` below. The CHECK that reads it is still asking a
 *  different question (is this a legal value of a declared field), and that
 *  difference is stated at the site. */
export const ACTOR_CLASSES = ['daemon', 'session', 'member'];
const ORIGIN_KINDS = ['named_request', 'sweep', 'member'];

/* ===================================================================== *
 * THE MACHINE-IDENTITY PREDICATE (REC-46, out of REC-45's measurement).
 *
 * THE DEFECT THIS CLOSES, measured through op=promote before it was written:
 * this plane had THREE unrelated ways of asking "is this a person" — the word
 * list above, the `token:` prefix `store.mjs` refused BY SHAPE, and
 * `ACTOR_CLASSES` — and NONE of them knew the whole answer. `checkGrounds`
 * asked only the word list, so `asserted_by: token:member` PASSED the
 * hand-written door while the identical claim was refused for saying `agent`.
 * A word list that a new class silently escapes is the shape to remove, not to
 * extend, so there is now ONE predicate and every asking site reads it.
 *
 * A SECOND MINTED SPELLING, found by sweeping for the class rather than
 * trusting the routed count of three: `index.mjs` stamps `token:<class>` on
 * AUTHORSHIP fields (author, actor, by) and `class:<class>` on OWNERSHIP and
 * viewer fields, at twenty sites between them. The word list knew neither.
 * Closing only the routed one would have left the same hole one spelling over.
 *
 * WHY THE MINT COMPOSES FROM HERE TOO. The prefixes are the CONTROL PLANE's
 * own vocabulary, and a refusal that reads one literal while the stamp writes
 * another is precisely the drift D-164 exists to stop. index.mjs, store.mjs and
 * query.mjs all already import this module, so the stamp and the refusal are
 * now the same two strings and cannot disagree at all.
 *
 * TWO PREDICATES, AT TWO STRENGTHS, AND THE NARROWER ONE IS NOT AN OVERSIGHT.
 * `isMachineStamp` answers "did the control plane mint this identity", by
 * SHAPE. `isMachineIdentity` answers the full question and is `isMachineStamp`
 * OR a bare class word OR a surface/AI identity. `taskForward`/`taskResolve`
 * (REC-28, D-151) deliberately take the NARROW one: on those two verbs the
 * bare string "admin" is a LEGITIMATE actor — it is ROOT_ADMIN's own session —
 * so the bare-class arm would refuse the root administrator's browser. That
 * difference is real, it is documented at those two sites, and it is not
 * collapsed. Both still derive from the ONE set of prefixes, so moving what
 * counts as a minted machine identity moves those two sites as well.
 *
 * ABSENT IS NOT MACHINE. An empty or missing identity answers FALSE here and
 * every caller keeps its own `!who` arm, because "nobody said" and "a machine
 * said" are different findings and undetermined is first-class (CLAUDE.md).
 * ===================================================================== */

/** The prefix the control plane stamps on an AUTHORSHIP field (author, actor,
 *  `by`) for a machine credential — a NAMED machine identity rather than an
 *  anonymous one, which is what lets an unattended writer act at all (D-61). */
export const MACHINE_AUTHOR_PREFIX = 'token:';
/** The prefix it stamps on an OWNERSHIP or VIEWER field (viewer, owner, by,
 *  declaredBy, resolvedBy, threadedBy, memberId, decidedBy). */
export const MACHINE_CLASS_PREFIX = 'class:';
/** Every spelling this plane mints for a machine. A new one is added HERE and
 *  every refusal, every stamp and every sweep follows it. */
export const MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX];

/** Did the CONTROL PLANE mint this identity? Case-folded deliberately: at the
 *  store the value is server-stamped and the fold changes nothing, while at the
 *  gate the value is hand-written by a caller and `Token:member` is the same
 *  claim as `token:member`. */
export function isMachineStamp(who) {
  const s = String(who ?? '').trim().toLowerCase();
  return s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));
}

/** Is this identity a machine rather than a named person? The whole question,
 *  in one place. Returns FALSE for an absent identity — see the block above. */
export function isMachineIdentity(who) {
  const s = String(who ?? '').trim().toLowerCase();
  if (s === '') return false;
  return isMachineStamp(s) || ACTOR_CLASSES.includes(s) || NON_MEMBER_AUTHORS.includes(s);
}

/** C-18.1: intake provenance register shape, release authority, and the
 *  ratification fence (sweep intake lands at collected, never higher). */
/** C-18.9: what a capture must establish before it may be PUBLISHED.
 *
 * REVISED 2026-07-31, and the revision is a correction of a conflation rather
 * than a loosening. Two different things were being called "authority":
 *
 *   PROVENANCE authority  who served us the bytes at each hop. We always know
 *                         our own leg, and an archive hop names the archive.
 *                         This is what a published hash actually attests.
 *   CONTENT authority     who ISSUED the document. Frequently unknown, and
 *                         legitimately so.
 *
 * The old rule refused publication whenever the CONTENT authority was
 * undetermined. That recreated, at the publication gate, exactly the failure
 * D-97 removed at the intake gate: a hard refusal on a missing attribution
 * pressures whoever wants to publish into INVENTING one, which is the false
 * assertion the three-valued ruling exists to prevent. Moving the pressure
 * later in the pipeline does not make it less corrupting; it makes it worse,
 * because by then a member has done the work and wants it out.
 *
 * What a published hash claims is: these bytes, this address, this date, this
 * chain of custody. It does not claim the document is authentic municipal
 * record. So the gate belongs on the CHAIN:
 *
 *   1. A bundle at or past verified must carry a provenance chain for every
 *      captured document. No chain is not "we fetched it ourselves"; it is a
 *      claim with nothing behind it.
 *   2. Every hop must name WHO. An unattributed hop cannot support the only
 *      claim publication makes.
 *   3. Content authority MAY be undetermined, but it must be STATED, dated,
 *      and carried into what the public reads. Silence is refused. Publishing
 *      "we do not know who issued this, and here is when we recorded that" is
 *      honest; publishing it with the question quietly absent is not.
 *
 * Ratification remains a member's signed act, so nothing here publishes
 * anything by itself: this decides what a member is ALLOWED to sign for. */
function checkAuthorityPublishable(ctx, findings) {
  const hist = Array.isArray(ctx.fm?.state_history) ? ctx.fm.state_history : [];
  const atFence = ctx.fm?.current_state === 'verified' || hist.some(e => e && e.to_state === 'verified');
  if (!atFence) return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return; // pre-contract bundle; C-18.1 governs register presence
  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports unparsable JSON */ }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : [];
  docs.forEach((d, i) => {
    if (!d || typeof d !== 'object') return; // C-18.1 reports the shape
    const chain = d.provenance_chain;
    /* REC-54 / D-200, 2026-08-05: THESE WERE ONE FINDING AND THEY ARE THREE
       DIFFERENT FACTS ABOUT THE RECORD. `!Array.isArray(chain) || chain.length
       === 0` collapsed "nobody ever recorded a chain here", "something wrote a
       chain field that is not a chain" and "somebody recorded a chain and it
       came out empty" into one message reading "with no provenance_chain".
       They are not the same claim and they do not have the same repair: the
       first is a gap in what was captured, the second is a writer producing
       malformed output, and the third is a derivation that RAN and FOUND
       NOTHING — which is a statement about the route, not an absence of one.
       An operator reading the audit could not tell which they had, and the ten
       live bundles D-200 names are ALL the first kind (measured 2026-08-05:
       every one has the key ABSENT, not empty), a fact the old message could
       not express. Nothing is weakened: every input that produced an error
       before produces an error now, which `provenance-chain.test.mjs` asserts
       arm by arm rather than leaving to inspection. */
    if (!('provenance_chain' in d)) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and records no provenance_chain at all: a published hash claims these bytes came from somewhere by some route, and this document names none`,
        ['record the chain of custody for this capture, one hop per party, from us back to the source',
         'or, where the capture record already holds the route, derive it from that evidence with op=provenancechain'],
        /* REC-56 / D-206: the codes REC-54's three findings needed to reach a
           reader through the TALLY and not only through the bounded offender
           sample. One per arm, and they are the three facts in the comment
           above in the order it states them. */
        'chain-absent'));
    } else if (!Array.isArray(chain)) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and its provenance_chain is ${chain === null ? 'null' : typeof chain}, not an array of hops: whatever wrote this did not write a chain`,
        ['record the chain of custody as an array of hops, one per party, from us back to the source'],
        'chain-not-an-array'));
    } else if (chain.length === 0) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] is at or past verified and records an EMPTY provenance_chain: a chain was recorded for this document and it names no party, which is a different fact from never having recorded one and must not be repaired by assuming a route`,
        ['name the parties that actually served these bytes, one hop each',
         'or state plainly that the route is undetermined rather than leaving an empty chain standing at verified'],
        'chain-empty'));
    } else {
      chain.forEach((hop, h) => {
        if (!hop || typeof hop !== 'object' || typeof hop.who !== 'string' || hop.who.trim() === '') {
          findings.push(f('C-18.9', 'error', `provenance documents[${i}].provenance_chain[${h}] names no attestor: an unattributed hop cannot support the claim a published hash makes`,
            ['name the party that served these bytes at this hop', 'or remove the hop if it did not happen']));
        }
      });
    }
    /* Undetermined content authority does NOT block publication, and this is
       the deliberate change. What blocks it is undetermined and SILENT: a
       reader of the published record must be able to see that the question was
       asked and not answered, and when. */
    if (d.authority_state === 'undetermined') {
      const basis = d.authority_basis;
      if (typeof basis !== 'string' || basis.trim() === '') {
        findings.push(f('C-18.9', 'error', `provenance documents[${i}] is content-authority undetermined and this bundle is at or past verified, but states no authority_basis: publishing an unanswered question is honest only when the record says it is unanswered and since when`,
          ['record a dated authority_basis saying what was tried and what it established',
           'or determine the authority through the task list and record the determination']));
      }
    } else if (d.authority_state === 'determined' && (typeof d.authority !== 'string' || d.authority.trim() === '')) {
      findings.push(f('C-18.9', 'error', `provenance documents[${i}] declares authority_state 'determined' with no authority named, and this bundle is at or past verified`,
        ['name the issuing party', "or correct authority_state to 'undetermined' with a dated basis"]));
    }
  });
}

function checkReleaseAuthority(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return; // pre-contract bundle: the register is the declaration
  let reg;
  try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports unparsable JSON */ }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) {
    findings.push(f('C-18.1', 'error', 'data/provenance.json must be {"documents": [...]} (the intake provenance register)'));
    return;
  }
  let sweepOrigin = false;
  docs.forEach((d, i) => {
    if (!d || typeof d !== 'object') { findings.push(f('C-18.1', 'error', `provenance documents[${i}] is not an object`)); return; }
    /* D-97: authority is THREE-VALUED (RULED, AUTHORITY-AND-TRUST.md). A
       document either carries an authority, or carries
       authority_state 'undetermined' with a basis saying why the
       determination could not be made. Undetermined must be STATED, never
       inferred from absence; a document with neither is missing its source
       axis, exactly as before the ruling. Documents from before the ruling
       carry authority with no authority_state and remain conformant: the
       corpus is non-uniform by design and provenance is never reshaped. */
    for (const k of ['file', 'locator', 'retrieved']) {
      if (!d[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing '${k}'`));
    }
    const aState = d.authority_state;
    if (aState !== undefined && !['determined', 'undetermined'].includes(aState)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].authority_state '${aState}' is not 'determined' or 'undetermined'`));
    }
    if (aState === 'undetermined') {
      if (!d.authority_basis) findings.push(f('C-18.1', 'error', `provenance documents[${i}] is authority-undetermined but names no authority_basis: why it could not be established is itself a recorded fact`));
    } else if (!d.authority) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing 'authority' and does not state authority_state 'undetermined': the source axis is named or its absence is declared, never left blank`));
    }
    if (aState === 'determined' && !d.authority_basis) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] is authority-determined but names no authority_basis: how it was reached is recorded in BOTH cases`));
    }
    if (d.file && !hasFile_(ctx, String(d.file)) && !Array.isArray(d.parts)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}] names '${d.file}' which does not exist in the bundle`));
    }
    const cap = d.capture;
    if (!cap || typeof cap !== 'object') findings.push(f('C-18.1', 'error', `provenance documents[${i}] missing capture block`));
    else {
      if (!cap.method) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture missing 'method'`));
      if (!CAPTURE_GRADES.includes(cap.grade)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.grade '${cap.grade}' is not one of: ${CAPTURE_GRADES.join(', ')}`));
      if (!ACTOR_CLASSES.includes(cap.actor_class)) findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.actor_class '${cap.actor_class}' is not one of: ${ACTOR_CLASSES.join(', ')}`));
    }
    const or = d.origin;
    if (!or || typeof or !== 'object' || !ORIGIN_KINDS.includes(or.kind)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin.kind must be one of: ${ORIGIN_KINDS.join(', ')}`));
    } else if (or.kind === 'sweep') {
      sweepOrigin = true;
      if (!or.matched_sweep) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'matched_sweep'`));
      if (!or.deeming_actor) findings.push(f('C-18.1', 'error', `provenance documents[${i}].origin (sweep) missing 'deeming_actor'`));
    }
  });
  /* Release authority: the collected -> verified transition is a named
     member's decision, AI-assisted but member-made (doctrine 4a).

     REC-56 / D-203, 2026-08-05: BOTH ARMS BELOW ADVISED ACTS NOBODY CAN
     PERFORM, and it was not only the `collected` half the item was routed for.

       - `return the bundle to collected` / `set current_state to collected`.
         `STATES.information.edges` carries no `verified -> collected`, so
         appending that transition fires C-4.2 (`transition verified ->
         collected is not a legal information edge`) and setting `current_state`
         WITHOUT appending fires C-4.2's other arm (`current_state 'collected'
         disagrees with last transition to 'verified'`). MEASURED here rather
         than assumed: the advice produces a second error in BOTH readings, so
         there was no careful way to follow it.
       - `a named member re-makes the release decision` and `a named member
         ratifies and records the collected -> verified transition`. Both arms
         only fire on a bundle that is AT OR PAST `verified`, and `op=release`
         — the one act that writes that edge — refuses anything already there
         (ILLEGAL_TRANSITION, "release is not repeatable"). So the FIRST repair
         in each array was as unreachable as the second, which is the part the
         routing did not predict.

     What replaces them names acts the plane actually offers, and nothing here
     rules on DEC-56. `op=retire` is real, reachable from `verified`, and
     terminal, and it is named with its edge; recording the defect and raising
     it is always followable. The third line states the FENCE rather than a
     destination — an operator who edits `current_state` by hand gets C-4.2
     whatever DEC-56 decides, because C-4.2 checks the transition against
     whatever the machine carries at the time. If Bob rules a retraction edge,
     these strings do not become false; they become incomplete, and the
     source-level walk in `test/repair-reachability.test.mjs` re-derives what is
     reachable from `STATES` and `deriveActs` rather than from a list here. */
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const releases = hist.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified');
  for (const e of releases) {
    const a = String(e.author || '').toLowerCase();
    /* REC-46: one predicate. The word list was one of three answers to this
       question and knew nothing of the two spellings the control plane mints. */
    if (!a || isMachineIdentity(a)) {
      findings.push(f('C-18.1', 'error', `collected -> verified transition authored by '${e.author}': release is a named member's decision, never a surface or AI identity (intake doctrine 4a)`,
        ['retire this bundle with the reason recorded (verified -> retired, op=retire), if the release cannot stand as it is',
         'or record the defect against this release in Review Notes and raise it, so the record carries the doubt rather than a repair nobody can perform',
         'the state is not moved back by hand: C-4.2 refuses any transition that is not an edge in this machine, so hand-editing current_state or state_history produces a second error on top of this one']));
    }
  }
  // The ratification fence: sweep intake lands at collected, never higher
  // (doctrine Section 4). Verified, now or ever, requires a member-authored
  // release transition.
  const everVerified = ctx.fm.current_state === 'verified' || hist.some(e => e && e.to_state === 'verified');
  /* REC-46: the same predicate NEGATED — the one site in this family that asks
     whether a person DID act rather than whether a machine did. It must move
     with its complement above or the fence and the refusal disagree. */
  const memberRelease = releases.some(e => { const a = String(e.author || '').toLowerCase(); return a && !isMachineIdentity(a); });
  if (sweepOrigin && everVerified && !memberRelease) {
    findings.push(f('C-18.1', 'error', 'sweep-origin intake lands at collected, never higher: verified requires per-document human ratification, a member-authored collected -> verified transition (intake doctrine Section 4)',
      ['retire this bundle with the reason recorded (verified -> retired, op=retire), if this intake cannot be ratified as it stands',
       'or record in Review Notes that it reached verified without the per-document ratification the doctrine requires, and raise it: op=release writes the collected -> verified edge and refuses a bundle already at verified, so the ratification cannot be re-made in place',
       'the state is not moved back by hand: C-4.2 refuses any transition that is not an edge in this machine']));
  }
}

function latestHistorySnapshot(ctx) {
  const snaps = [...ctx.files.keys()].filter(p => /^_history\/bundle_.*\.md$/.test(p)).sort();
  return snaps.length ? snaps[snaps.length - 1] : null;
}

/** C-5: append-only surfaces never mutated, verified against the latest history snapshot. */
function checkAppendOnly(ctx, findings) {
  const snapPath = latestHistorySnapshot(ctx);
  if (!snapPath || !ctx.fm) return; // nothing to compare against yet
  const snap = parseFrontmatter(asText(ctx.files.get(snapPath)));
  if (!snap.data) return; // a malformed snapshot is C-12's problem
  const prior = Array.isArray(snap.data.state_history) ? snap.data.state_history : [];
  const live = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  if (live.length < prior.length) {
    findings.push(f('C-5.1', 'error', `state_history shrank from ${prior.length} to ${live.length} entries vs. the latest snapshot`, ['restore from _history and re-append new material']));
  } else {
    for (let i = 0; i < prior.length; i++) {
      if (JSON.stringify(prior[i]) !== JSON.stringify(live[i])) {
        findings.push(f('C-5.1', 'error', `state_history[${i}] was modified retroactively (append-only surface)`, ['restore from _history and re-append new material']));
        break;
      }
    }
  }
  const rn = sectionText(snap.body, '## Review Notes');
  if (rn && rn.trim() !== '## Review Notes' && !ctx.body.includes(rn.trimEnd())) {
    findings.push(f('C-5.1', 'error', 'Review Notes content from the prior version is missing or altered (verbatim-immutable)', ['restore from _history and re-append new material', 'record a tamper finding if history lacks the original']));
  }
  const priorLog = sectionText(snap.body, '## Session Log') || '';
  for (const header of priorLog.match(/^### Session .*$/gm) || []) {
    if (!ctx.body.includes(header)) {
      findings.push(f('C-5.1', 'error', `Session Log entry '${header.slice(0, 60)}' from the prior version is missing (append-only surface)`, ['restore from _history and re-append new material']));
    }
  }
  // changes.json prefix, when a prior snapshot of it exists
  const chSnaps = [...ctx.files.keys()].filter(p => /^_history\/data\/changes_.*\.json$/.test(p)).sort();
  const liveCh = ctx.files.get('data/changes.json');
  if (chSnaps.length && liveCh) {
    try {
      const priorRecs = JSON.parse(asText(ctx.files.get(chSnaps[chSnaps.length - 1]))).records || [];
      const liveRecs = JSON.parse(asText(liveCh)).records || [];
      if (liveRecs.length < priorRecs.length || JSON.stringify(liveRecs.slice(0, priorRecs.length)) !== JSON.stringify(priorRecs)) {
        findings.push(f('C-5.1', 'error', 'data/changes.json records were mutated or removed (append-only surface)', ['restore from _history and re-append new material']));
      }
    } catch { /* parse findings elsewhere */ }
  }
}

/** C-6: reference shape, substrate independence, required edges, and (when a resolver is injected) target resolution. */
function checkReferences(ctx, findings) {
  const refs = Array.isArray(ctx.fm?.references) ? ctx.fm.references : [];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    if (typeof r !== 'object' || r === null) { findings.push(f('C-6.1', 'error', `references[${i}] is not an object`)); continue; }
    if (!REL_VOCAB.includes(r.rel)) findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' is not in the closed vocabulary`, ['map to the nearest vocabulary value', 'sever with reason']));
    /* A source-asserted edge has to say so on its face and carry the two things
       that distinguish it from a member's citation: the address the source
       actually wrote, and a verdict about which version it pointed at. Without
       the address it is unattributable; without the verdict it reads as a
       settled connection when the usual answer is that nothing established it. */
    if (SOURCE_ASSERTED_RELS.includes(r.rel)) {
      if (r.asserted_by !== 'source')
        findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' is source-asserted and must carry asserted_by: 'source', so it is never read as a member's claim`));
      if (typeof r.address !== 'string' || !r.address)
        findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' must carry the address the source wrote, as a comment string beside the canonical target`));
      if (!['contemporaneous', 'superseded', 'undetermined'].includes(r.verdict))
        findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' must carry a contemporaneity verdict of contemporaneous, superseded or undetermined; undetermined is the resting state and must be stated rather than omitted`));
    } else if (r.asserted_by === 'source') {
      findings.push(f('C-6.1', 'error', `references[${i}].rel '${r.rel}' is a member's relation and cannot be asserted_by 'source'`));
    }
    if (!EDGE_STATUS.includes(r.status)) findings.push(f('C-6.1', 'error', `references[${i}].status '${r.status}' is not one of: ${EDGE_STATUS.join(', ')}`));
    const t = r.target;
    if (typeof t !== 'string' || /:\/\/|[/\\]|drive\.google/i.test(t)) {
      findings.push(f('C-6.1', 'error', `references[${i}].target '${String(t).slice(0, 40)}' looks like a substrate locator; targets are canonical IDs only`));
    } else if (!BUNDLE_ID_RE.test(t)) {
      findings.push(f('C-6.1', 'error', `references[${i}].target '${t}' does not match the canonical ID grammar`));
    } else if (ctx.resolveTarget) {
      if (!ctx.resolveTarget(t)) {
        findings.push(f('C-6.2', 'error', `references[${i}].target '${t}' does not resolve in the store`, ['restore target from history', 're-point to the successor object (derived_from chain)', 'sever the edge with a reason note']));
      }
    }
  }
  /* C-6.3, REPLACED by REC-11 (QUEUE.md carries the ruling). The old arm
     required an elevated Problem to carry an 'elevated_into' reference; it was
     wrong to keep because elevation is not a state in the inquiry machine at
     all (the REC-10 collapse removed it — only legacy history carries it, and
     a legacy document is judged by its own contract, which never enforced the
     edge at write). Its successor discipline is the basis arm: an inquiry
     carrying a basis leg must carry the same target in references[], so refs
     and inquiry_basis — both projections of this one document — cannot
     disagree. That arm lives in checkInquiryBasis (C-2.8's family) so the
     store's write path and this checker run the SAME rule. */
  if (ctx.fm?.workproduct_state === 'distributed') {
    const hasDist = [...ctx.files.keys()].some(p => p.startsWith('distributions/'));
    if (!hasDist) findings.push(f('C-6.3', 'error', 'workproduct_state is distributed but distributions/ is empty'));
  }
  /* REC-16: `supersedes` gains requirements, the way `links_to` has them. Both
     arms are consulted HERE and by the store's promote write path, the
     checkInquiryBasis precedent, so a malformed supersession never lands and
     cannot audit clean either. */
  supersedesEdgeFindings(ctx.fm, findings);
  /* REC-24 (g): the new relation is governed at the same seam as the last one,
     so a responds_to edge neither lands nor audits clean when it points at
     something that cannot have been asked. */
  respondsToEdgeFindings(ctx.fm, findings);
  divisionDisclosureFindings(ctx.fm, findings);
}

/** REC-16: WHAT A `supersedes` EDGE MUST CARRY.
 *
 *  Verified this pass and it is the reason this arm exists: before this item
 *  `supersedes` had ZERO occurrences in `store.mjs` and no producer at all.
 *  Membership of REL_VOCAB meant only that C-6.1 would not refuse the string —
 *  it never meant the edge was governed. So the first producer arrives together
 *  with the requirements, the way every state in the inquiry machine has
 *  arrived together with its entry requirements.
 *
 *  A REASON, because supersession is the heaviest member relation in the
 *  vocabulary: it says *this question replaced that one*, and an unexplained
 *  replacement is a change nobody can check. `links_to` is the precedent for
 *  requirements riding a rel; `sever with reason` is the precedent for the
 *  reason itself — the catalog already refuses moving an edge with no account.
 *
 *  A RESOLVABLE TARGET is the other half and is enforced in two places by
 *  construction rather than by agreement: C-6.2's resolver arm above catches it
 *  wherever a resolver is injected, and the store resolves it directly at the
 *  write. A supersedes edge to nothing points a reader at a question that does
 *  not exist, which is worse than no edge — it asserts a lineage. */
export function supersedesEdgeFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== 'object' || r.rel !== 'supersedes') return;
    if (typeof r.reason !== 'string' || r.reason.trim() === '') {
      findings.push(f('C-6.1', 'error', `references[${i}] is a supersedes edge with no reason: supersession says this question replaced that one, and a replacement with no account of why cannot be checked by anyone`,
        ['author the reason this supersedes its target', 'or use relates_to, which claims nothing about replacement']));
    }
    if (typeof r.target !== 'string' || !BUNDLE_ID_RE.test(r.target)) {
      findings.push(f('C-6.1', 'error', `references[${i}] is a supersedes edge whose target '${String(r.target).slice(0, 40)}' is not a canonical bundle id: an edge that asserts a lineage must name the thing it came from`));
    }
  });
}

/** REC-24 (g): WHAT A `responds_to` EDGE MUST CARRY, written as
 *  supersedesEdgeFindings' twin and for its stated reason — the first PRODUCER
 *  of a relation arrives together with the relation's requirements, so the
 *  vocabulary never holds a member that means nothing.
 *
 *  ONE requirement, and it is the only one that is a fact about the bytes: the
 *  target is an ACTION id. The edge asserts "this document is what came back
 *  when we asked", and an edge of that name pointing at a question or at
 *  another document asserts a correspondence that never happened — the same
 *  class as a supersedes edge to nothing, which asserts a lineage. Resolution
 *  of the target in the store is enforced at the write, where a resolver exists
 *  (the supersedes precedent, for the same reason).
 *
 *  NO REASON IS REQUIRED, deliberately, and the asymmetry with `supersedes` is
 *  the point rather than an omission. Supersession is a member's JUDGEMENT that
 *  one question replaced another, and an unexplained replacement cannot be
 *  checked. A responds_to edge is not a judgement at all: it records that a
 *  document arrived in answer to an ask, and op=actioncorrespond writes it from
 *  a correspondence entry that already carries the date, the medium, the party
 *  and either the hash or the named account. Demanding prose on top of that
 *  would be asking a member to justify a fact the ledger already holds. */
export function respondsToEdgeFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== 'object' || r.rel !== 'responds_to') return;
    const target = typeof r.target === 'string' ? r.target : '';
    if (!BUNDLE_ID_RE.test(target) || OBJECT_TYPES[target.split('-')[0]] !== 'action') {
      findings.push(f('C-6.1', 'error',
        `references[${i}] is a responds_to edge whose target '${String(r.target).slice(0, 40)}' is not an ACTION: `
        + `this edge says "this is what came back when we asked", so it points at the ask`,
        ['point the edge at the ACTN- bundle whose correspondence this answers',
         'or use relates_to, which claims nothing about an exchange']));
    }
  });
}

/** REC-16 / R4: THE DISCLOSURE, and it is this item's point rather than a
 *  detail.
 *
 *  A child of a division records its PARENT id AND its SIBLING ids, authored in
 *  `bundle.md` and projected through the ordinary promote path — the frontmatter
 *  keys REC-14 RESERVED (`division_parent`, `division_siblings`) with no
 *  producer, so the published shape would not change under readers once cases
 *  existed. This item is the producer.
 *
 *  THE REASONING INVERTS THE ARGUMENT FOR DIVISION. Division was justified as
 *  the mechanism that stops weakest-link composition forcing a member to
 *  overclaim or stay silent. The abuse is the SAME mechanism: dividing is a
 *  cheaper way to shed a finding that cuts against you than severing it, and a
 *  published child that discloses neither parent nor siblings defeats invariant
 *  7 with a housekeeping operation. A reader who can see one half of a divided
 *  inquiry must be able to see that the other half EXISTS.
 *
 *  WHAT THIS FUNCTION CAN AND CANNOT SEE. It is pure over one document, so it
 *  holds the disclosure's SHAPE: a supersedes edge and the division keys agree
 *  with each other, the sibling list is present and non-empty, and it names
 *  neither the child itself nor its parent. Whether the list is COMPLETE — every
 *  sibling of that division and not merely one — cannot be answered from the
 *  child alone; the store answers it at the write against the parent's own
 *  `division.into`, and refuses NO_SIBLING_DISCLOSURE. Both halves are needed:
 *  this one makes an incoherent child impossible to author, and that one makes a
 *  quietly incomplete one impossible to land. */
export function divisionDisclosureFindings(fm, findings) {
  /* SCOPED TO AN INQUIRY SUPERSEDING AN INQUIRY, which is the division shape and
     today the only shape supersession has: this item is `supersedes`'s first
     producer, and division is what it produces. An information object
     superseding another information object is a different claim about a
     different kind of thing, and it is governed by the edge requirements above
     (a reason and a resolvable target) without a disclosure it has nothing to
     disclose. If a later item gives INQUIRY supersession a second producer, this
     is the arm it has to argue with rather than route around — and the escape
     that already exists is `relates_to`, which claims no replacement at all. */
  if (normalizeType(fm?.object_type) !== 'inquiry') return;
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  const supers = refs.filter((r) => r && typeof r === 'object' && r.rel === 'supersedes'
    && typeof r.target === 'string'
    && normalizeType(OBJECT_TYPES[r.target.split('-')[0]]) === 'inquiry');
  const parent = typeof fm?.division_parent === 'string' && fm.division_parent !== 'null' ? fm.division_parent : null;
  const sibsRaw = fm?.division_siblings;
  const sibs = Array.isArray(sibsRaw) ? sibsRaw.filter((x) => typeof x === 'string' && x !== '') : null;

  if (!parent && supers.length === 0) return;   // nothing to disclose, nothing claimed

  if (supers.length && !parent) {
    findings.push(f('C-6.1', 'error', `this document carries a supersedes edge to ${supers[0].target} and declares no division_parent: a question that superseded another discloses which division it came out of, so a reader who can see one half can see that the other half exists (R4)`,
      ['set division_parent to the inquiry this was divided out of', 'or sever the supersedes edge']));
  }
  if (parent && !supers.some((r) => r.target === parent)) {
    findings.push(f('C-6.1', 'error', `division_parent names ${parent} with no supersedes edge to it: the disclosure and the edge are two views of one fact and cannot disagree`,
      [`add a references[] entry {rel: supersedes, target: ${parent}} with its reason`]));
  }
  if (!parent) return;
  if (sibs === null || sibs.length === 0) {
    findings.push(f('C-6.1', 'error', `division_parent names ${parent} and division_siblings is ${sibs === null ? 'absent' : 'empty'}: a division produces at least two questions, so a child of one always has at least one sibling to name — NO_SIBLING_DISCLOSURE`,
      ['name every OTHER child of this division in division_siblings']));
    return;
  }
  for (const s of sibs) {
    if (!BUNDLE_ID_RE.test(s)) findings.push(f('C-6.1', 'error', `division_siblings names '${String(s).slice(0, 40)}', which is not a canonical bundle id`));
    if (s === parent) findings.push(f('C-6.1', 'error', `division_siblings names ${s}, which is this document's division_parent: the parent is disclosed as the parent, and listing it as a sibling would hide that one of the halves is missing`));
    if (typeof fm.id === 'string' && s === fm.id) findings.push(f('C-6.1', 'error', `division_siblings names this document itself: a sibling set that counts the child is a set that can look complete while a real sibling is absent`));
  }
}

/** C-12: history manifest coherence and snapshot accounting. */
function checkHistoryCoherence(ctx, findings) {
  const histFiles = [...ctx.files.keys()].filter(p => p.startsWith('_history/'));
  const manRaw = ctx.files.get('_history/manifest.json');
  if (!manRaw) {
    if (histFiles.length) findings.push(f('C-12.1', 'error', '_history contains files but no manifest.json', ['rebuild manifest entry from surviving files']));
    return;
  }
  let man;
  try { man = JSON.parse(asText(manRaw)); }
  catch { findings.push(f('C-12.1', 'error', '_history/manifest.json does not parse', ['rebuild manifest entry from surviving files'])); return; }
  const entries = Array.isArray(man.entries) ? man.entries : [];
  const keys = new Set();
  let prevKey = '';
  const bundleMdCreated = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    for (const k of ['key', 'kind', 'created', 'files']) if (!(k in (e || {}))) findings.push(f('C-12.1', 'error', `manifest entry[${i}] missing '${k}'`));
    if (e?.key) {
      if (keys.has(e.key)) findings.push(f('C-12.1', 'error', `duplicate manifest key '${e.key}'`));
      if (e.key < prevKey) findings.push(f('C-12.1', 'error', `manifest keys out of order at '${e.key}'`));
      keys.add(e.key); prevKey = e.key;
    }
    // Collected, not maxed, because the newest bundle.md-changing entry has to
    // be excluded below. See the C-12.1 note at the comparison.
    if (typeof e?.created === 'string' && Array.isArray(e?.snapshotted) && e.snapshotted.includes('bundle.md')) {
      bundleMdCreated.push(e.created);
    }
    if (e?.kind === 'promotion' && e.key && !ctx.files.has(`_history/promotion_${e.key}.json`)) {
      findings.push(f('C-12.2', 'error', `promotion record for '${e.key}' is missing`, ['rebuild manifest entry from surviving files', 'record a history-loss finding and re-snapshot current state']));
    }
    if (Array.isArray(e?.snapshotted)) {
      for (const name of e.snapshotted) {
        const dot = name.lastIndexOf('.');
        const snapPath = `_history/${name.slice(0, dot)}_${e.key}${name.slice(dot)}`;
        // 1.16.5: hasFile_, not files.has. This is an EXISTENCE assertion, and
        // the 1.13.0 presence rule above says existence assertions consult
        // files UNION elided. Using files.has here made every tier-scoped read
        // report its history snapshots as lost: 71 phantom findings across a
        // 30-bundle store, and it forced a byte-complete image on any caller
        // that wanted to gate, which for a bundle carrying a 39.6MB capture
        // means pulling that capture and its history copies into memory to
        // answer a question about whether a file exists. Byte checks below are
        // unchanged and still read ctx.files directly.
        if (!hasFile_(ctx, snapPath)) {
          findings.push(f('C-12.2', 'error', `snapshot '${snapPath}' recorded in manifest entry '${e.key}' is missing`, ['record a history-loss finding and re-snapshot current state']));
        }
      }
    }
  }
  // The REFUSAL class (accelerator 0.12.8) is accounted for on its own terms,
  // not through the version manifest.
  //
  // A terminal refusal writes `_history/refused_<stamp>_<hash>.json` naming the
  // outcome, plus the preserved payload under `_history/refused_<stamp>_<hash>/`.
  // None of that is part of the version chain: it records material that never
  // entered history, so the manifest, which indexes promotions and the snapshots
  // they took, has nothing to say about it.
  //
  // Requiring a manifest entry anyway is what the first version of this check
  // did, and the consequence was severe: every terminal refusal permanently
  // froze the bundle it happened in, because the orphan finding is an error and
  // the gate judges the post-promotion image, so no later package could ever
  // pass. Observed live on INFO-2026-5460 on 2026-07-22, which is the bundle
  // holding migration_instant, so a single refused fence edit made the fence
  // itself unchangeable. Exactly the C-12.1 failure shape, by a second route.
  //
  // Accounting is not abandoned, only re-seated: a preserved payload must carry
  // its sibling record, and the record must parse and name an outcome, so
  // nothing sits in _history unexplained. The hash length is not constrained
  // here, because records written before the twins agreed on slice(0, 8) carry
  // the full digest and are honest history that must not go red retroactively.
  const REFUSAL_RECORD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\.json$/;
  const REFUSAL_PAYLOAD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\//;
  for (const p of histFiles) {
    if (p === '_history/manifest.json') continue;
    const rec = REFUSAL_RECORD.exec(p);
    if (rec) {
      let parsed = null;
      try { parsed = JSON.parse(asText(ctx.files.get(p))); } catch { /* reported below */ }
      if (!parsed || !parsed.outcome) {
        findings.push(f('C-12.2', 'error', `refusal record '${p}' does not parse or names no outcome`,
          ['restore the refusal record from history', 'remove the unexplained refusal artifacts']));
      }
      continue;
    }
    const pay = REFUSAL_PAYLOAD.exec(p);
    if (pay) {
      const sibling = `_history/refused_${pay[1]}.json`;
      if (!ctx.files.has(sibling)) {
        findings.push(f('C-12.2', 'error', `preserved refusal payload '${p}' has no refusal record at '${sibling}'`,
          ['restore the refusal record', 'remove the orphaned preserved payload']));
      }
      continue;
    }
    const m = /_((?:\d{8}T\d{6}Z)_[0-9a-f]{8})\./.exec(p) || /^_history\/promotion_(.+)\.json$/.exec(p);
    const key = m ? m[1] : null;
    if (!key || !keys.has(key)) {
      findings.push(f('C-12.2', 'error', `history file '${p}' maps to no manifest entry`, ['rebuild manifest entry from surviving files']));
    }
  }
  // C-12.1 staleness: live bundle.md must not predate history.
  //
  // Two narrowings, both learned the hard way on 2026-07-22.
  //
  // 1. Only entries that CHANGED bundle.md count. last_updated is a field in
  //    bundle.md describing bundle.md; a promotion that touched only data/
  //    files has no business advancing it.
  //
  // 2. The newest such entry is excluded, because it is the promotion that
  //    WROTE the live bytes. Comparing a document against the moment its own
  //    package was assembled is circular, and `created` is assembly time, not
  //    content time. A document may legitimately carry an earlier semantic
  //    timestamp: a signed ratification records the transition INSTANT, which
  //    always precedes the packaging that delivers it.
  //
  // Without narrowing 2 a ratified bundle was permanently frozen. Its
  // last_updated is pinned by the release signature, which binds bundle.md's
  // bytes, so satisfying C-12.1 meant editing bundle.md and destroying the
  // ratification, while not editing it meant no further promotion could ever
  // gate. The registry bundle holds migration_instant, so that deadlock made
  // the fence itself unchangeable.
  //
  // What survives: a genuine revert still fails, because live is still
  // compared against every EARLIER bundle.md-changing promotion.
  const sorted = bundleMdCreated.slice().sort();
  sorted.pop();                                   // the promotion that wrote live
  const newestPrior = sorted.length ? sorted[sorted.length - 1] : '';
  if (typeof ctx.fm?.last_updated === 'string' && newestPrior && ctx.fm.last_updated < newestPrior) {
    findings.push(f('C-12.1', 'error', `live last_updated '${ctx.fm.last_updated}' precedes an earlier history entry '${newestPrior}': the live bundle.md is older than a version already superseded`,
      ['restore the newer bundle.md from history', 'correct last_updated to reflect the live content']));
  }
}

/** C-15: recheck coverage on inquiries (né Focuses), all dispositions.
 *  The comparison is against 'inquiry' because normalizeType now maps both
 *  legacy spellings there — left at 'focus' this check would silently stop
 *  firing for every document, old and new. */
function checkRecheckCoverage(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== 'inquiry') return;
  const rts = Array.isArray(ctx.fm.recheck_triggers) ? ctx.fm.recheck_triggers : [];
  if (rts.length === 0) {
    findings.push(f('C-15.1', 'error', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound']));
    return;
  }
  for (let i = 0; i < rts.length; i++) {
    const t = rts[i];
    if (typeof t !== 'object' || !t?.text || !t?.description) {
      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}] lacks the dual-audience {text, description} shape`));
    } else if (t.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) {
      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}].date '${t.date}' is not YYYY-MM-DD`));
    }
  }
}

// ---------------------------------------------------------------------------
// Step-5 families: per-type extensions (C-2.8/9/10), C-8 citations, C-9 gates,
// C-11 clock, C-7 deletion records.
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* C-2.8, renamed from checkFocusExtension by REC-10. Keeps surfaced_by and
   disposition_reason exactly as the focus contract had them; REC-11 adds the
   basis[] leg grammar via checkInquiryBasis below, and REC-13 the CONCLUDED
   entry requirements. `completeness` (published) and the division fields
   arrive with REC-14/16, each with its state. */
function checkInquiryExtension(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== 'inquiry') return;
  const fm = ctx.fm;
  if (!['agent', 'human'].includes(fm.surfaced_by)) {
    findings.push(f('C-2.8', 'error', `surfaced_by '${fm.surfaced_by}' is not one of: agent, human`));
  }
  if (['deferred', 'dismissed'].includes(fm.current_state)) {
    if (typeof fm.disposition_reason !== 'string' || fm.disposition_reason.trim() === '') {
      findings.push(f('C-2.8', 'error', `${fm.current_state} state requires a non-empty disposition_reason`));
    }
  }
  /* REC-13: the `concluded` ENTRY REQUIREMENTS, modelled on C-2.7's `verified`
     arm above — the state is not a label a document may simply wear, it is a
     claim the document has to be able to carry.
     - a CONCLUSION, because `concluded` with nothing concluded is a state
       change wearing an answer's clothes;
     - a FALSIFIER, because a finding that names nothing which would overturn
       it is a narrative rather than a result, and "less narrative" is a
       constraint on US (CLAUDE.md's stance). This is the requirement the
       item's negative control removes;
     - AT LEAST ONE BASIS LEG. DEC-22 is exactly what bounds this: an `open`
       inquiry may hold a claim with ZERO legs — a STANDING OBJECTIVE, legal
       and readable and never auto-anything — so the requirement fires HERE
       and only here. A conclusion resting on nothing is the overclaim this
       repository's primary threat model is about.
     An UNDETERMINED conclusion is stated as such in the prose, never faked to
     pass this gate; what is refused is silence, not uncertainty. */
  if (fm.current_state === 'concluded') {
    if (typeof fm.conclusion !== 'string' || fm.conclusion.trim() === '') {
      /* REC-56 / D-203's SWEEP, and this one is the HARDER half of the class:
         `concluded -> open` IS a legal edge (REC-13 added it — a conclusion is
         revisable), so the state machine does not refuse this advice. THE OP
         SURFACE DOES. `REOPENABLE_FROM` is `[...DISPOSITIONS, "published"]` and
         excludes `concluded` DELIBERATELY and BY NAME: `deriveActs` does not
         publish `reopen` on a concluded inquiry, and `store.reopen()` answers
         NOT_SET_DOWN with the reason — a conclusion quietly reverting to open
         still wearing its conclusion records nothing, and the edition machinery
         is where that move belongs. So the old repair told an operator to do
         exactly what the plane refuses, on an edge that looks legal, which is
         why reading repair strings against `STATES` alone would not have found
         it. affordances.mjs states the principle in its own words on
         REOPENABLE_FROM: *an act the catalog permits that no caller can perform
         is the state machine lying.* This is that sentence read backwards — a
         repair the catalog advises that no caller can perform.
         The replacement names no destination, so it cannot go stale if the FROM
         set changes; the source-level walk re-derives reachability from
         `deriveActs` rather than from anything written here. */
      findings.push(f('C-2.8', 'error', 'concluded state requires a non-empty conclusion',
        ['author the conclusion where the document stands: reopening does not pick a concluded inquiry back up (op=reopen answers NOT_SET_DOWN), so there is no act that undoes the conclusion and the repair is made in place']));
    }
    if (typeof fm.falsifier !== 'string' || fm.falsifier.trim() === '') {
      findings.push(f('C-2.8', 'error', 'concluded state requires a non-empty falsifier: a conclusion that names nothing which would overturn it cannot be checked by anyone, including its author',
        ['state what evidence would falsify this conclusion']));
    }
    if (!Array.isArray(fm.basis) || fm.basis.length < 1) {
      findings.push(f('C-2.8', 'error', 'concluded state requires at least one basis leg: an open inquiry may rest on nothing (a standing objective), a conclusion may not',
        ['add a basis[] leg naming what the conclusion rests on, and the same target in references[]']));
    }
  }
  /* REC-14: the `published` ENTRY REQUIREMENTS, on the same principle as
     `concluded` above — a state is not a label a document may wear, it is a
     claim the document has to be able to carry. Everything here is authored by
     the group and stamped INTO the bytes that get signed, so what the case says
     about its own limits is inside the hash forever.

     THE COMPLETENESS BLOCK (C-9, DEC-13). A statement of what the case does not
     cover; an EXCLUSION LIST that may legitimately be EMPTY but whose FIELD may
     not be ABSENT (an empty list is a claim — we left nothing out — and silence
     is not); and the group's POSITION ON PUTTING THE CASE TO ITS SUBJECT with
     its JUSTIFICATION. DEC-13 is exact about what that last one gates: the
     position must be DECLARED AND JUSTIFIED, NEVER that contact happened and
     NEVER that the answer was favourable. So all three positions below pass
     identically and nothing anywhere reads which one it is.

     THE FROZEN PAIR (DEC-21/R2) and THE DECLARED BAR (DEC-17 as amended), side
     by side and never composed: what this case reached on each axis, beside
     what the group said in advance it required. An ABSENT bar gates nothing and
     is STATED as absent — an absent bar is not a bar of zero.

     THE EDITION (DEC-12) is what makes the whole thing safe: edition 2 does not
     overwrite edition 1, it joins it. */
  if (fm.current_state === 'published') checkPublishedExtension(fm, findings);
  /* REC-16: the `divided` ENTRY REQUIREMENTS, on the same principle again — a
     state is not a label a document may wear. What `divided` claims is that
     this question was two questions and that every leg it rested on now lives
     on a child, so the document has to be able to carry BOTH halves of that:
     the division itself, and the account of where every leg went. */
  if (fm.current_state === 'divided') checkDividedExtension(fm, findings);
  /* REC-18 / DATA-MODEL D1(b): THE SUBJECT ENTITY, and it is one OPTIONAL
     scalar rather than a block, a list or a table.
     - OPTIONAL because DEC-15 rules exactly what its absence costs: "an inquiry
       with no subject entity simply has no A/B/C available to it, which is
       honest." Requiring it would make the price a GATE, and a gate that
       pressures a member into naming a subject they have not established is the
       bug CLAUDE.md names about the publication fence.
     - A SCALAR, singular, because the earned grade is "the strongest resolution
       of that document's captures to THE inquiry's subject entity". With a list,
       "strongest across all subjects" would let an A earned about a tangential
       subject be laundered into a leg about the question's real one. A question
       with two subjects is two questions, and the record already has an act for
       that (op=inquirydivide, REC-16).
     - NO JUSTIFICATION FIELD, unlike entity_relations. A declared relation is
       CONSTITUTIVE — the group fixing what its own statements mean — and D-83
       requires it justified and cited. Naming what a question is about asserts
       nothing about the world and carries no grade; it is addressing. */
  if (fm.subject_entity !== undefined && fm.subject_entity !== null && fm.subject_entity !== '') {
    if (typeof fm.subject_entity !== 'string' || !ENTITY_ID_RE.test(fm.subject_entity)) {
      findings.push(f('C-2.8', 'error', `subject_entity '${String(fm.subject_entity).slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ['point subject_entity at an entry in the subject registry (op=entitycreate / op=entitybyalias), or omit it — an inquiry may name no subject, and then no leg of it earns an A/B/C connection grade (DEC-15)']));
    }
  }
  checkInquiryBasis(fm, findings, ctx.publishedRegistry, ctx.earnedRegistry);
}

/** REC-16 / DEC-28 / R4: what a `divided` parent must be able to say.
 *
 *  TWO TOP-LEVEL KEYS, and the split is forced by the restricted frontmatter
 *  grammar rather than chosen: a block is a map of scalars or an array of
 *  objects, never a map holding an array of objects. So `division` is the map
 *  (the act: into, apportioned_by, at, reason) and `division_apportionment` is
 *  the array (the account: one row per leg, naming the child it went to) —
 *  exactly the shape REC-14's `completeness` / `completeness_excluded` pair
 *  takes, for exactly the same reason.
 *
 *  WHY THE APPORTIONMENT IS A GATE AND NOT MERELY AN OP BEHAVIOUR. R4's whole
 *  argument is that division and severance do not substitute, because
 *  *"every leg gets a home… Neither is not"*: severance REMOVES material from a
 *  question, division only RE-HOMES all of it. The abuse it blocks is that
 *  dividing would otherwise be a cheaper way to shed a finding that CUTS
 *  AGAINST you than severing it. That protection is worth nothing if it lives
 *  only in the op — a hand-written document could then wear `divided` while
 *  quietly dropping the inconvenient leg — so the requirement is that EVERY
 *  ORD in basis[] is accounted for. Ord, not target: duplicate targets are
 *  legal by design (D4 — one document, two legs), and keying on the target
 *  would let one row discharge two legs.
 *
 *  NO PER-LEG REASON (DEC-29). One authored reason for the whole division; the
 *  per-leg judgment is recorded per leg IN THE APPORTIONMENT ITSELF, and the
 *  counterweight to the friction asymmetry with severance is DISCLOSURE, not
 *  ceremony. Nothing here should be read as an invitation to add one. */
function checkDividedExtension(fm, findings) {
  const d = (typeof fm.division === 'object' && fm.division && !Array.isArray(fm.division)) ? fm.division : null;
  if (!d) {
    findings.push(f('C-2.8', 'error', 'divided state requires a division block: a question recorded as divided with no account of the division is a state change wearing a correction\'s clothes',
      /* REC-56 / D-203's sweep, third site: `divided` is TERMINAL — `divided:
         []` — so `divided -> open` is not an edge and C-4.2 refuses it by name,
         the same shape as `verified -> collected`. It is terminal
         STRUCTURALLY rather than by policy (the parent's legs are owned by its
         children now), so this is the one arm in the family where no state move
         exists in either direction and the honest advice says so.
         The first repair is UNCHANGED and is not a directive to run the op now
         — `op=inquirydivide` does not apply at `divided` either — it states
         where a division block legitimately comes from, which is C-20.1's
         `re-produce the creation at collected` shape exactly. */
      ['divide through op=inquirydivide, which authors the block and stamps who apportioned and when',
       'restore the division block from _history if the division was made and the block was lost',
       'otherwise raise it: the repair here is not a state move, and C-4.2 refuses any transition this machine does not carry']));
    return;
  }
  const into = Array.isArray(d.into) ? d.into.filter((x) => typeof x === 'string') : [];
  if (into.length < 2) {
    findings.push(f('C-2.8', 'error', `division.into names ${into.length} child inquir${into.length === 1 ? 'y' : 'ies'}: a division produces at least TWO questions, because one is a rename and zero is a deletion`,
      ['name every child the question was divided into']));
  }
  for (const id of into) {
    if (!BUNDLE_ID_RE.test(id)) findings.push(f('C-2.8', 'error', `division.into names '${String(id).slice(0, 40)}', which is not a canonical bundle id`));
  }
  if (new Set(into).size !== into.length) {
    findings.push(f('C-2.8', 'error', 'division.into names the same child twice: a leg apportioned to a child named twice has one home, not two'));
  }
  if (typeof d.reason !== 'string' || d.reason.trim() === '') {
    findings.push(f('C-2.8', 'error', 'division requires a non-empty reason: the reason belongs to the ACT (DEC-28), and a restructuring nobody accounted for is indistinguishable from one nobody should have made',
      ['author the reason the question was two questions']));
  }
  /* REC-46: one predicate, and the blank arm stays its own — absent is not
     machine, and "nobody apportioned" is a different finding from "a machine
     did". `isMachineIdentity` answers false for blank precisely so this reads
     as it always has. */
  if (typeof d.apportioned_by !== 'string' || d.apportioned_by.trim() === '' || isMachineIdentity(d.apportioned_by)) {
    findings.push(f('C-2.8', 'error', `division.apportioned_by '${d.apportioned_by}' is not a named member: apportionment is AUTHORED and never automatic, so the record carries the name of whoever decided where each leg went`));
  }
  if (!ISO_TS_RE.test(String(d.at || ''))) {
    findings.push(f('C-2.8', 'error', `division requires 'at' as an ISO timestamp (got '${d.at}')`));
  }
  /* THE ACCOUNT. Every leg the parent rested on, including — and this is the
     abuse R4 blocks — every leg whose role is `cuts_against`. */
  const legs = Array.isArray(fm.basis) ? fm.basis : [];
  const rows = Array.isArray(fm.division_apportionment) ? fm.division_apportionment : null;
  if (!rows) {
    findings.push(f('C-2.8', 'error', 'divided state requires a division_apportionment field: the parent records WHERE EVERY LEG WENT, because dividing must not be a cheaper way to shed a finding that cuts against you than severing it (R4)',
      ['author one apportionment row per basis leg, naming the child it went to']));
    return;
  }
  const homes = new Map();            // ord -> Set(child)
  rows.forEach((r, i) => {
    if (!r || typeof r !== 'object') { findings.push(f('C-2.8', 'error', `division_apportionment[${i}] is not an object`)); return; }
    if (!Number.isInteger(r.ord) || r.ord < 0 || r.ord >= legs.length) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}].ord '${r.ord}' does not name a leg of this inquiry's basis (0..${legs.length - 1}): a leg is addressed by its ORDINAL, because one document legitimately carries two legs (D4)`));
      return;
    }
    if (typeof r.to !== 'string' || !into.includes(r.to)) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}].to '${r.to}' is not one of the children named in division.into: a leg's home is a child of THIS division`));
      return;
    }
    const leg = legs[r.ord];
    if (leg && typeof leg === 'object' && typeof r.target === 'string' && r.target !== leg.target) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}] names target '${r.target}' at ord ${r.ord}, where the basis carries '${leg.target}': the account and the basis are two views of one document and cannot disagree`));
    }
    if (!homes.has(r.ord)) homes.set(r.ord, new Set());
    homes.get(r.ord).add(r.to);
  });
  const orphans = [];
  for (let i = 0; i < legs.length; i++) if (!homes.has(i)) orphans.push(i);
  if (orphans.length) {
    const cutting = orphans.filter((i) => legs[i] && legs[i].role === 'cuts_against');
    findings.push(f('C-2.8', 'error', `basis leg${orphans.length === 1 ? '' : 's'} ${orphans.join(', ')} ${orphans.length === 1 ? 'has' : 'have'} no home in the apportionment${cutting.length ? ` (including ${cutting.length} that cut${cutting.length === 1 ? 's' : ''} AGAINST this inquiry)` : ''}: every leg gets a home on a child, because division RE-HOMES material and only severance REMOVES it (R4)`,
      ['apportion the remaining leg(s) to a child', 'or sever them with a reason, which is the act that removes material']));
  }
  const empty = into.filter((c) => ![...homes.values()].some((s) => s.has(c)));
  if (empty.length) {
    findings.push(f('C-2.8', 'error', `division.into names ${empty.join(', ')}, which received no leg of the parent's basis: a child that inherits nothing is a new question, not a half of this one`));
  }
}

/** REC-14 / DEC-13: the group's position on putting the case to its subject.
 *  EXPORTED so op=affordances publishes it and no surface keeps a copy.
 *  The gate is that the position is declared and justified; WHICH position it
 *  is gates nothing, here or anywhere — a group facing a non-supportive body
 *  may have real cause not to give notice, and what is refused is being silent
 *  about having chosen. */
export const SUBJECT_POSITIONS = ['sought_and_answered', 'sought_no_answer', 'not_sought'];
export const STRENGTH_STATES = ['graded', 'unrated', 'undetermined'];

/** REC-14: the three ASSERTED fields of a completeness block, in one place so
 *  the gate (C-21.1), the store's own pre-flight and the frozen projection all
 *  compare the same thing.
 *
 *  `author` and `at` are deliberately NOT here. They are STAMPS: `at` is the
 *  server's clock and always differs, so comparing it is an equality that costs
 *  nothing to produce, and `author` may legitimately be the same member twice —
 *  requiring it to change would be requiring a different person to sign the
 *  next edition. `subject_position` is not here either: it is a vocabulary
 *  choice, and a group whose position has not changed must not be pushed into
 *  changing it. What must be authored FRESH is what is ASSERTED — the
 *  statement, the justification for the position, and the exclusion list. */
/** REC-47 / DEC-46 (a): the AUTHORED bias acknowledgement, read off the
 *  frontmatter exactly as completenessFields reads its three. Named once and
 *  exported so the store's pre-flight, the gate and the ratify-commit path
 *  cannot drift about which bytes are being compared — the drift hazard REC-44
 *  measured five times over. */
export function biasAcknowledgementOf(fm) {
  const v = fm && typeof fm.bias_acknowledgement === 'string' ? fm.bias_acknowledgement : null;
  return v === null || v === 'null' ? null : v;
}

export function completenessFields(fm) {
  const c = (fm && typeof fm.completeness === 'object' && fm.completeness) || {};
  const rows = Array.isArray(fm?.completeness_excluded) ? fm.completeness_excluded : [];
  return {
    statement: typeof c.statement === 'string' ? c.statement : null,
    subject_justification: typeof c.subject_justification === 'string' ? c.subject_justification : null,
    excluded: JSON.stringify(rows.map((r) => [
      r && typeof r.target === 'string' ? r.target : null,
      r && typeof r.description === 'string' ? r.description : '',
      r && typeof r.reason === 'string' ? r.reason : ''])),
  };
}

function checkPublishedExtension(fm, findings) {
  const e = fm.edition;
  if (!Number.isInteger(e) || e < 1) {
    findings.push(f('C-2.8', 'error', `published state requires an integer edition of 1 or more (got '${e}'): an edition is what makes a revision safe — edition 2 does not overwrite edition 1, it joins it (DEC-12)`,
      ['publish through op=publish, which stamps the edition from the published record']));
  }
  const c = (typeof fm.completeness === 'object' && fm.completeness) || null;
  if (!c) {
    findings.push(f('C-2.8', 'error', 'published state requires a completeness block: a case that says nothing about what it does not cover is claiming to cover everything',
      /* REC-56 / D-203's sweep, fourth site, and this one had a REACHABLE act
         available that the old string did not name. `published: ['open',
         'surfaced']` — `published -> concluded` is NOT an edge, so "move the
         inquiry back to concluded" fires C-4.2. What IS reachable is the full
         ceremony the STATES table's own comment describes: `published -> open
         -> concluded -> published` at edition 2, and `op=reopen` DOES apply at
         `published` (REOPENABLE_FROM carries it, precisely so a legal edge is
         not left with no caller). So the correction here names an act rather
         than only refusing one. */
      ['author completeness.statement and the exclusion list',
       'or reopen this case for a second edition (published -> open, op=reopen) and carry it back through conclude and publish: an edition is not edited back into concluded, and reopening does not unpublish edition 1 (DEC-12)']));
  } else {
    if (typeof c.statement !== 'string' || c.statement.trim() === '') {
      findings.push(f('C-2.8', 'error', 'published state requires a non-empty completeness.statement'));
    }
    if (typeof c.author !== 'string' || c.author.trim() === '') {
      findings.push(f('C-2.8', 'error', 'published state requires completeness.author: the completeness assertion is a named member\'s claim about the limits of this case'));
    }
    if (!ISO_TS_RE.test(String(c.at || ''))) {
      findings.push(f('C-2.8', 'error', `published state requires completeness.at as an ISO timestamp (got '${c.at}')`));
    }
    /* DEC-13. The gate is the DECLARATION, never the act: every position below
       passes, and nothing reads which one it is. */
    if (!SUBJECT_POSITIONS.includes(c.subject_position)) {
      findings.push(f('C-2.8', 'error', `published state requires completeness.subject_position, one of: ${SUBJECT_POSITIONS.join(', ')} (got '${c.subject_position}'). The gate is that the position is declared and justified — never that contact happened, and never that the answer was favourable (DEC-13)`,
        ['declare the group\'s position on putting this case to its subject']));
    }
    if (typeof c.subject_justification !== 'string' || c.subject_justification.trim() === '') {
      findings.push(f('C-2.8', 'error', 'published state requires completeness.subject_justification: a declared position with no reasoning behind it is the checkbox this gate exists to refuse. A group that sought comment says so and prints what came back; a group that deliberately did not says so and says why, and a reader weighs that justification exactly as they weigh any other declared bias (DEC-13)',
        ['justify the position — including a deliberate decision not to give notice']));
    }
  }
  /* REC-44 / DEC-44: THE CASE THIS FINDING WAS PUBLISHED IN, in the bytes the
     member signs. All three are required on `published`, and each closes a
     different hole:
       case_id        without it a published finding names no case, so C-21.1
                      has nothing to be fresh against and the container has no
                      identity to be an edition OF.
       case_scope     DEC-44 determination 2. AUTHORED and never prefilled —
                      this is the arm that fits the claim, since a scope may
                      legitimately be unchanged between editions and a
                      byte-check on it would pressure a member into inventing a
                      difference (see checkCompletenessFreshness).
       case_findings  DEC-44 determination 3. The roster is inside every
                      member's own signed bytes, so a stranger holding ONE
                      finding can see what else the case rests on, and the
                      ratify committer can refuse two members who disagree
                      about the set instead of silently reconciling them.

     REC-47 / DEC-46 (a) adds a FOURTH, `bias_acknowledgement`, and it is the
     one whose arm differs from case_scope's: it is required here AND it is
     under C-21.1's byte-check. Why, when scope beside it is not, is recorded
     once at checkCompletenessFreshness rather than twice. */
  if (typeof fm.case_id !== 'string' || fm.case_id.trim() === '' || fm.case_id === 'null') {
    findings.push(f('C-2.8', 'error', 'published state requires case_id: a published case is a CONTAINER over one or more findings (DEC-44), and a finding published into no case has no edition, no scope and nothing for C-21.1 to hold it to',
      ['publish through op=publish, which mints or carries the case identity and stamps it into the bytes']));
  }
  if (typeof fm.case_scope !== 'string' || fm.case_scope.trim() === '') {
    findings.push(f('C-2.8', 'error', 'published state requires case_scope: the case states what brought these findings together and what question it answers as a whole. It is AUTHORED by the group and never derived from the findings\' titles — a scope this plane wrote is not a scope the group made (DEC-44)',
      ['author the case scope on op=publish']));
  }
  /* REC-47 / DEC-46 (a). DEC-20 is the doctrine and it is worth stating at the
     gate rather than only in the register: a published case CARRIES the bias it
     was produced under, as a fact a reader weighs. This field is a DISCLOSURE,
     never a bar — nothing here reads WHICH bias it names, and nothing anywhere
     refuses a case for having one. The only bias that disqualifies is an
     uncleared HUNCH (HUNCH DEBT, D-188), and that refusal is
     op=publishpreflight's by name. */
  if (biasAcknowledgementOf(fm) === null || fm.bias_acknowledgement.trim() === '') {
    findings.push(f('C-2.8', 'error', 'published state requires bias_acknowledgement: a published case carries the bias it was produced under as a fact the reader weighs, and the publisher ACKNOWLEDGES it at the moment of export rather than passing a pre-flight checkbox (DEC-46). Ordinary declared bias never blocks publication and is disclosed precisely so a reader can apply or discount it (DEC-20) — what is refused here is publishing SILENTLY about the lens, not publishing under one',
      ['author the bias acknowledgement on op=publish, fresh for this edition']));
  }
  if (!Array.isArray(fm.case_findings) || !fm.case_findings.length) {
    findings.push(f('C-2.8', 'error', 'published state requires case_findings naming every finding in this case: a stranger holding this document must be able to see what else the case rests on without contacting this instance, which is the premise the portable container exists for (DEC-44 determination 3)',
      ['publish through op=publish, which writes the roster into every member\'s bytes']));
  } else if (typeof fm.id === 'string' && !fm.case_findings.includes(fm.id)) {
    findings.push(f('C-2.8', 'error', `case_findings does not include this document (${fm.id}): a finding that is not a member of the case it names cannot be published into it`));
  }
  /* C-9. The FIELD may not be absent; the LIST may legitimately be empty. */
  if (!Array.isArray(fm.completeness_excluded)) {
    findings.push(f('C-2.8', 'error', 'published state requires a completeness_excluded field: an EMPTY list is a claim (this case left nothing out) and is legal — an ABSENT field is silence, and silence about what a case excludes is what the completeness assertion exists to refuse',
      ['author completeness_excluded, empty if nothing was excluded']));
  } else {
    fm.completeness_excluded.forEach((r, i) => {
      if (!r || typeof r !== 'object') {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] is not an object`));
        return;
      }
      const named = typeof r.target === 'string' && BUNDLE_ID_RE.test(r.target);
      const prose = typeof r.description === 'string' && r.description.trim() !== '';
      /* RECONCILED C-9: target OR prose, NEVER NEITHER. An exclusion may
         legitimately name something not in the record — an outstanding records
         request has no id to point at — so a required target would force the
         member to invent a referent or to say nothing. */
      if (!named && !prose) {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] names neither a target nor a description: every exclusion row carries a target id OR prose, never neither`,
          ['name the excluded bundle by id', 'or describe what was excluded in prose']));
      }
      if (typeof r.reason !== 'string' || r.reason.trim() === '') {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] carries no reason: WHAT was left out and WHY are two statements and one does not stand in for the other`));
      }
    });
  }
  /* R2/DEC-21: BOTH axis objects, frozen, and never composed into one letter.
     The STATE is what keeps `unrated` (nothing on this axis is graded)
     distinguishable from `undetermined` (the walk hit its depth bound) — two
     different frozen facts that a single nullable grade could not tell apart,
     and C-21.2 compares against the right one. */
  const axes = Array.isArray(fm.published_strength) ? fm.published_strength : null;
  if (!axes || axes.length !== 2 || !['capture', 'connection'].every((a) => axes.some((x) => x && x.axis === a))) {
    findings.push(f('C-2.8', 'error', 'published state requires published_strength carrying BOTH axes, capture and connection: a case does not have "a strength", it has two, and composing them into one letter is the substitution R2 forbids',
      ['publish through op=publish, which stamps both frozen axis objects into the bytes']));
  } else {
    for (const a of axes) {
      if (!STRENGTH_STATES.includes(a.state)) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} state '${a.state}' is not one of: ${STRENGTH_STATES.join(', ')}`));
      } else if (a.state === 'graded' && !BASIS_GRADES.includes(a.grade)) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} is graded but carries no grade`));
      } else if (a.state !== 'graded' && a.grade != null) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} is ${a.state} and still carries grade '${a.grade}': ${a.state === 'unrated' ? 'UNRATED is not a low score, it is nothing established on this axis' : 'undetermined is what we do not know, not a grade'}`));
      }
    }
  }
  /* REC-42 / DEC-32 clause (e): IF THE BASIS WAS STRUCTURED, THE FROZEN RESULT
     IS THE STRUCTURED ONE. A published case whose legs name grounds took a
     MAXIMUM over branches to reach the grade above, and that claim is only
     checkable by a reader if the bytes say which branch reached what. Absent
     here is not silence, it is the structure being invisible under a grade the
     structure produced — so it is refused, with the same reasoning that makes
     completeness_excluded's FIELD required even when the list is empty.
     Not required when nothing was grouped: an unstructured case's two axis
     objects already are the whole truth, and a one-row restatement would be a
     second place to state one fact (D-21). */
  const grouped = Array.isArray(fm.basis)
    && fm.basis.some((l) => l && typeof l === 'object' && typeof l.ground === 'string' && l.ground !== '');
  const frozenGrounds = Array.isArray(fm.published_strength_grounds) ? fm.published_strength_grounds : null;
  if (grouped && !frozenGrounds) {
    findings.push(f('C-2.8', 'error', 'published state requires published_strength_grounds when the basis names grounds: the grade above is the STRONGEST ground rather than the weakest leg, and "these grounds were each independently sufficient" is a claim a reader can only test if the case says which legs were in which branch and what each branch reached',
      ['publish through op=publish, which freezes the per-ground breakdown beside the pair']));
  } else if (grouped) {
    for (let i = 0; i < frozenGrounds.length; i++) {
      const g = frozenGrounds[i];
      if (!g || typeof g !== 'object') {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is not an object`));
        continue;
      }
      if (!GRADE_AXES.includes(g.axis)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}].axis '${g.axis}' is not one of: ${GRADE_AXES.join(', ')} — the branches are composed PER AXIS and both axes are frozen separately (DEC-21)`));
      }
      if (!STRENGTH_STATES.includes(g.state)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}].state '${g.state}' is not one of: ${STRENGTH_STATES.join(', ')}`));
      } else if (g.state === 'graded' && !BASIS_GRADES.includes(g.grade)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is graded but carries no grade`));
      } else if (g.state !== 'graded' && g.grade != null) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is ${g.state} and still carries grade '${g.grade}': a suspended ground states what is unknown, and an unrated one states that nothing on it is established — neither is a grade`));
      }
    }
    for (const label of new Set(fm.basis.filter((l) => l && typeof l.ground === 'string' && l.ground).map((l) => l.ground))) {
      if (!frozenGrounds.some((g) => g && g.ground === label)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds names no row for ground '${label}': every branch the basis carries is frozen on every axis, because a branch missing from the frozen result is one no reader can check`));
      }
    }
  }
  /* DEC-17 as amended. The bar the GROUP set for its own work, stamped beside
     what the case reached. Absent gates nothing and must SAY so. */
  const rq = (typeof fm.required_strength === 'object' && fm.required_strength) || null;
  if (!rq || typeof rq.declared !== 'boolean') {
    findings.push(f('C-2.8', 'error', 'published state requires required_strength with a declared flag: a case publishes the bar the group set for itself beside the strength it reached, and an ABSENT bar is STATED as absent rather than shown as blank (DEC-17)',
      ['declare the group default with op=strengthbar, or publish with the bar stated absent']));
  } else if (rq.declared) {
    for (const axis of ['capture', 'connection']) {
      if (!BASIS_GRADES.includes(rq[axis])) {
        findings.push(f('C-2.8', 'error', `required_strength.${axis} '${rq[axis]}' is not one of: ${BASIS_GRADES.join(', ')} — the declared bar is a PAIR per R2, because a scalar would re-collapse the two axes in the one field a reader is most likely to quote`));
      }
    }
  }
}

/** REC-14 / C-21.1: THE COMPLETENESS GATE. On `published`, no ASSERTED field of
 *  the completeness block was carried forward byte-identical from the PREVIOUS
 *  EDITION — because a gate that only checks PRESENCE is a checkbox, and a
 *  completeness claim carried forward unchanged is exactly the checkbox this
 *  gate exists to refuse (DEC-12: *"the exclusion statement is authored fresh
 *  per edition under C-21.1's byte-check"*).
 *
 *  Compared against HISTORY the way C-5 and C-12 compare live against history —
 *  but against the previous RATIFIED EDITION rather than the previous snapshot,
 *  which is the only comparison DEC-12 makes meaningful: a document may be
 *  promoted twenty times between editions, and what the reader was given is the
 *  edition, not the twentieth promotion.
 *
 *  The prior edition arrives INJECTED (the releaseRegistry precedent), because
 *  the checker is a pure function over a filesystem and the published
 *  projection is not in the bundle. An absent registry means the caller cannot
 *  see the published record — the migrate tool and the cli — and this cannot
 *  fire; the gate and the store's write path both inject it, so on every path a
 *  real caller has, it does. */
function checkCompletenessFreshness(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== 'inquiry') return;
  if (ctx.fm?.current_state !== 'published') return;
  /* REC-44 / DEC-44: PER CASE PER EDITION, and the altitude is the correction.
     The completeness assertion belongs to the CASE — the container over one or
     more findings — so the comparison is against the previous edition of THAT
     CASE, read from a registry of its own. Reading it off the finding was right
     while a case WAS one inquiry and is wrong now: two findings published in
     one edition state ONE completeness claim between them, so a per-finding
     comparison would ask the same question twice and, worse, would let a case
     reprint edition 1's limits under a finding that had not published before.
     C-21.2's per-axis inheritance stays PER FINDING (checkInheritedLeg, over
     ctx.publishedRegistry, untouched): the two live at different altitudes and
     collapsing them is the mistake this whole item exists to undo.

     THE SCOPE STATEMENT IS DELIBERATELY NOT UNDER THIS BYTE-CHECK, and that is
     a judgement rather than an omission. Completeness is edition-specific by
     nature — what this edition left out, as of its date — so reprinting it is
     evidence nobody looked. A case's SCOPE is the project's question, and it
     legitimately does not move between editions when a finding is revised;
     requiring it to change every edition would pressure a member into inventing
     a difference, and "a gate that pressures someone into inventing one is a
     bug in the gate" is CLAUDE.md's sentence about exactly this shape. It is
     REQUIRED and never prefilled (checkPublishedExtension), which is the arm
     that fits the claim it makes.

     ===================================================================
     REC-47 / DEC-46 (a): THE BIAS ACKNOWLEDGEMENT *IS* UNDER THIS CHECK,
     AND IT SITS BESIDE A FIELD THAT IS NOT. THE DISCRIMINATOR, ONCE.
     ===================================================================
     Three authored fields now travel on the publish block under TWO rules, so
     the rule is stated rather than left to be inferred from which arms exist:

       BYTE-CHECKED   completeness.statement, completeness.subject_justification,
                      completeness_excluded, bias_acknowledgement
       REQUIRED ONLY  case_scope

     THE TEST IS NOT "could this legitimately stay the same". It is WHAT THE
     FIELD IS A CLAIM ABOUT. A field that states a FACT ABOUT THE CASE — the
     question it answers — is one editions do not move, and holding it to a
     difference manufactures one. A field that states AN AUTHOR'S CLAIM ABOUT
     THIS EDITION'S MATERIAL is a fresh act each time, because the material is
     what changed.

     Bias is not scope, and the reason is DEC-46's own distinction rather than a
     new one. DEC-46 separates two things that travel together: the bias
     MANIFEST is *computed and stamped*, and the ACKNOWLEDGEMENT is *authored*.
     The manifest is the constant — the lens itself, which may sit unchanged for
     years and SHOULD, and which nothing here compares because a derived
     equality costs nothing to produce (CLAUDE.md). The acknowledgement is not
     the lens; it is the publisher saying what that lens did TO THIS EDITION'S
     FINDINGS. Edition 2 revises, adds or drops findings, so what the bias
     shaped is different material even when the bias itself is byte-identical.

     SO THE PRESSURE-TO-INVENT TEST DOES NOT FIRE HERE, and that is the whole
     of why the answer differs from scope's. Nobody is asked to invent a change
     IN THE BIAS. They are asked to state, as of this edition, how this case
     stands under it — and "the lens is unchanged, and here is what it means for
     the two findings added since edition 1" is a true sentence a publisher can
     write without inventing anything. It is the same escape the completeness
     arm already offers in its own remedy line: if nothing changed, say THAT, as
     of this edition.

     AND THE FAILURE MODES ARE NOT SYMMETRIC, which settles it. A stale SCOPE
     misdescribes the question, and a reader holding the container can see the
     findings and judge for themselves. A stale ACKNOWLEDGEMENT asserts that the
     publisher weighed their own bias against material they never looked at —
     a claim about an act that did not happen, which is the overclaiming half of
     this project's threat model and the defect class it holds worse than a
     missing feature. DEC-46's own sentence for it: a pre-flight checkbox would
     be the checkbox these gates exist to refuse, and a gate that only checks
     PRESENCE *is* a checkbox.

     WHAT THIS ARM IS NOT. It never reads WHICH bias is named and never refuses
     a case for carrying one — DEC-20: ordinary declared bias is DISCLOSED and
     travels with every published case. The only bias that disqualifies is an
     uncleared HUNCH (HUNCH DEBT, D-188), refused by name and elsewhere. This
     arm refuses one thing only: reprinting last edition's sentence, which is
     evidence nobody looked. */
  const reg = ctx.publishedCaseRegistry;
  if (!reg) return;
  const cid = typeof ctx.fm.case_id === 'string' && ctx.fm.case_id !== 'null' ? ctx.fm.case_id : null;
  if (!cid) return;
  const mine = reg[cid];
  if (!mine || !mine.editions) return;
  /* The previous edition is the highest ratified one BELOW this document's own
     edition: this edition is not in the projection until it is ratified, and a
     re-ratification of the same edition is refused elsewhere by name. */
  const prior = Object.values(mine.editions)
    .filter((x) => Number(x.edition) < Number(ctx.fm.edition))
    .sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  if (!prior || !prior.completeness) return;   // edition 1 has nothing to be fresh against
  /* REC-47: the acknowledgement joins the compared set here rather than in a
     second loop with a second refusal, because it is the SAME gate for the SAME
     reason and a second one would be a second place to state one rule (D-21).
     It is carried on the registry row beside `completeness`, not inside it: the
     two are different claims (DEC-46 — the lens versus the limits), and folding
     one into the other's blob is the collapse REC-44 spent an item undoing one
     altitude down. */
  const now = { ...completenessFields(ctx.fm), bias_acknowledgement: biasAcknowledgementOf(ctx.fm) };
  const was = { ...prior.completeness, bias_acknowledgement: prior.bias_acknowledgement ?? null };
  const LABEL = {
    statement: 'completeness.statement',
    subject_justification: 'completeness.subject_justification',
    excluded: 'completeness_excluded',
    bias_acknowledgement: 'bias_acknowledgement',
  };
  /* One loop, one refusal, TWO sentences — because the two claims are refused
     for the same reason and about different things, and a message that called
     the acknowledgement "a completeness claim" would teach the next reader the
     conflation this item exists to keep out of the record. */
  const WHY = {
    bias_acknowledgement:
      `an acknowledgement of the bias a case was produced under is AUTHORED at the moment of export, not carried forward (DEC-46): reprinting the last edition's sentence is evidence nobody looked at what this edition actually says. The lens itself may be unchanged and usually is — what must be fresh is the publisher's account of what it means for THIS edition's findings`,
  };
  const REMEDY = {
    bias_acknowledgement:
      'if the bias itself has not moved, say THAT as of this edition and say what it means for the findings this edition adds or revises — the bias is disclosed, never disqualifying (DEC-20)',
  };
  for (const k of Object.keys(LABEL)) {
    if (now[k] != null && was[k] != null && now[k] === was[k]) {
      findings.push(f('C-21.1', 'error',
        `${LABEL[k]} is byte-identical to edition ${prior.edition}'s: ${WHY[k] || 'a completeness claim carried forward unchanged is a checkbox, and this gate exists to refuse it'}. Every edition is a SEPARATE DOCUMENT and states its own claims in its own words, as of its own date (DEC-12, C-21.1)`,
        [`author ${LABEL[k]} fresh for edition ${ctx.fm.edition}`,
         REMEDY[k] || 'if nothing about the limits changed, say that AS OF THIS EDITION rather than reprinting the last one']));
    }
  }
}

/* REC-11: the basis leg vocabularies, exported so op=affordances can publish
   them the way it publishes the disposition set, and so no surface keeps a
   copy. GRADE_AXES is single-column by RECONCILED R2's own reasoning: a leg
   asserts ONE grade for ONE reason, and two grade columns would create a place
   to state two. GRADE_SOURCES carries 'hunch' per DEC-15: an authored
   connection grade with an author and a date, the only authored grade
   permitted above D, HUNCH DEBT until cleared (BIO_Declared_Bias_v0_1.md).
   D-188 / DEC-46 (d): HUNCH debt, not "bias debt" — the hunch is the ONE kind
   of declared bias that DISQUALIFIES publication (DEC-20); ordinary bias debt
   is DISCLOSED and travels with every published case. */
export const BASIS_ROLES = ['supports', 'cuts_against'];
export const BASIS_GRADES = ['A', 'B', 'C', 'D'];
export const GRADE_AXES = ['capture', 'connection'];
/* 'inherited' joins with REC-14: a leg resting on a PUBLISHED case does not
   earn its grade and does not author it — it takes the grade that case froze
   when the group signed it, on the same axis, and says so.

   'capture' joins with REC-18, and it is the CAPTURE-axis twin of 'resolution'.
   Before it, the four sources above were all sources for a CONNECTION grade and
   the capture axis had no honest name to give — so a capture-axis grade on an
   INFO- leg was AUTHORED outright, with nothing between a member and typing A
   for bytes that arrived like any other. R2-g is the landed doctrine it now
   enforces: "Grade B is what a direct capture by this instance is worth; it is
   not Grade A and this surface will not say it is". Both EARNED sources are
   computed server-side and REFUSED when a caller's value differs from what the
   record holds — an equality a caller can hand us is one a caller can invent
   (CLAUDE.md). */
export const GRADE_SOURCES = ['resolution', 'testimony', 'hunch', 'inherited', 'capture'];

/* REC-18: the two EARNED sources, named once so no arm below spells them and
   the store's registry builder and this grammar cannot drift about which is
   which. A caller may WRITE either — what a caller may not do is write a VALUE
   the record did not earn, which is what the arms in checkEarnedLeg enforce. */
export const EARNED_GRADE_SOURCES = ['resolution', 'capture'];

/* REC-43 / DEC-39: THE CAPTURE-AXIS CEILING, AND THE LETTER ABOVE IT.
 *
 * MOVED HERE from `Store.EARNED_CAPTURE_CEILING` (src/store.mjs), and the move
 * is the only interesting thing about this item, so it is stated rather than
 * left to be inferred. The DOCTRINE is unchanged and is R2-g's: "Grade B is
 * what a direct capture by this instance is worth; it is not Grade A and this
 * surface will not say it is" (SB-EVIDENCE 908-910). Grade A needs a
 * chain-of-custody web archive, which CAPTURE-FIDELITY.md states plainly is out
 * of a Worker's reach and is NOT CLAIMED. The day a group can produce a WACZ
 * this is one arm, not a redesign.
 *
 * WHY IT LIVES HERE NOW, and the direction is the whole of REC-43's design.
 * DEC-39 rules that the plane publishes the co-attestation honesty fence with
 * the act, and that fence's two grade letters ARE this rule — so the wording
 * must be composed from this value rather than typed beside it, or the sentence
 * a member reads and the rule the gate runs can drift apart silently. The
 * wording is published from `src/affordances.mjs` (DEC-8: a surface renders
 * what it received and never composes a prompt of its own), and that module
 * CANNOT import `store.mjs` — `store.mjs` already imports IT (DISPOSITIONS,
 * REOPENABLE_FROM, deriveActs), so the import would close a cycle and evaluate
 * a top-level object literal against bindings still in the temporal dead zone.
 * That is the same wall REC-35 hit and wrote up on VOCABULARIES.
 *
 * SO THE CONSTANT MOVES TO THE LOWEST LAYER BOTH SIDES ALREADY IMPORT, which is
 * this file — and this is not a demotion of the store's authority but a
 * promotion to where the REFUSAL is actually computed. `checkEarnedLeg` below
 * is the arm that refuses a leg claiming MORE than the ceiling, and
 * earnedbasis.test.mjs arm (c) measured that it is the ONLY thing in the battery
 * standing between the record and a capture grade the record cannot support.
 * `Store.earnedBasisRegistry` now IMPORTS this value to build the registry that
 * arm reads. One value, three readers (the registry, the refusal, the published
 * fence), no copy — the DISPOSITIONS/REC-11 arrangement exactly.
 *
 * AND THE LETTER ABOVE IT IS DERIVED, NOT TYPED. "It never reaches Grade A" is
 * true because A is one rank stronger than the ceiling in the SAME array
 * `checkEarnedLeg` compares against — so it is read out of that array rather
 * than written down a second time. If a future ceiling were the strongest grade
 * there would BE no unreachable letter, and this is null rather than a lie; the
 * fence composer refuses to compose a sentence it cannot make true. */
export const EARNED_CAPTURE_CEILING = 'B';
export const UNREACHABLE_CAPTURE_GRADE =
  BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1] ?? null;
/* Which axis each earned source is a source FOR. A resolution is the framework's
   §8.1 CONNECTION grade and nothing else; a capture grade is a property of an
   INFORMATION object (DEC-21) and nothing else. Stated as data rather than as
   two hand-written conditionals so the pairing has one home. */
export const EARNED_SOURCE_AXIS = { resolution: 'connection', capture: 'capture' };

/* REC-42 / DEC-32: a ground LABEL. Deliberately narrow — it is an identifier a
   member picks so two legs can say they belong together, not prose, and it
   appears inside derived sentences and inside frontmatter scalars. No quotes,
   no colons, no newlines, so nothing it names can break the block it is written
   in or smuggle punctuation into a sentence a reader trusts. */
export const GROUND_LABEL_RE = /^[a-z0-9][a-z0-9 _-]{0,47}$/i;

/* REC-11: the basis[] leg grammar, ONE function consulted by BOTH the checker
 * (via checkInquiryExtension above) and the store's op=promote write path —
 * the checkGatheringGrammar precedent — so a malformed leg never lands and the
 * two views cannot drift. Shape findings are C-2.8 (the inquiry extension);
 * the references[] subset arm is C-6.3, the rule that REPLACED the
 * elevated_into requirement (see checkReferences).
 *
 * The leg: {target, role, grade, grade_axis, grade_source, note, author, date}.
 * target is an INFO- or an inquiry-prefixed id — the inquiry target IS basis
 * recursion. role is invariant 7's storage: cuts_against is first-class. An
 * ABSENT or null grade is legal and means undetermined, STATED — never
 * invented to pass a gate. A PRESENT grade must say which axis it is on
 * (not derivable from target_type: connection grades legitimately sit on
 * INFO- legs — SB-OUTPUT 432-435) and where it came from. A hunch requires
 * its author and its date, refused BY NAME, because a hunch is only honest
 * while it announces itself; testimony is a member's signed account and is
 * grade D at no other value (DEC-15: hunch is the only authored grade
 * permitted above D). Duplicate targets are LEGAL by design — D4: a basis
 * legitimately cites one document for two legs, which is why this table has
 * an ordinal and refs could not carry it. */
export function checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry) {
  const legs = fm?.basis;
  /* PL-1 / IS-1: the VERSION block is checked FIRST and unconditionally, on
     checkGrounds' own precedent below — an inquiry may carry versions with no
     `basis[]` at all (a run proposing alternatives before any has been accepted
     is exactly that case, and it is the normal one), so hanging the version
     grammar off the no-basis early return would leave the whole block
     unenforced in the state it will most often be in. This one call is what
     makes the version rules run at BOTH gates: `checkBundle` reaches it through
     the catalog, and `store.mjs`'s op=promote path calls the same export. */
  basisVersionFindings(fm, findings);
  /* REC-42: the grounds block is checked EVEN WITH NO BASIS. No basis is a
     legal open inquiry (DEC-22's standing objective), but a grounds[] block
     over no legs asserts independent sufficiency for nothing, and leaving it
     unchecked here would make "author the structure first" a way to leave an
     assertion in the record with nothing under it. */
  if (legs === undefined || legs === null) { checkGrounds(fm, [], findings); return; }
  if (!Array.isArray(legs)) {
    findings.push(f('C-2.8', 'error', `basis is not an array`));
    return;
  }
  const refTargets = new Set((Array.isArray(fm.references) ? fm.references : [])
    .filter((r) => r && typeof r === 'object' && typeof r.target === 'string')
    .map((r) => r.target));
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (typeof leg !== 'object' || leg === null) {
      findings.push(f('C-2.8', 'error', `basis[${i}] is not an object`));
      continue;
    }
    const t = leg.target;
    /* Hoisted out of the else below by REC-31: the capture-axis arm at the end
       of this loop asks the SAME question (what does this leg rest on), and a
       second derivation of it here would be a second answer waiting to
       disagree. Null while the target is unusable, so the arm below stays
       silent rather than adding a second complaint about one broken leg. */
    let targetType = null;
    if (typeof t !== 'string' || !BUNDLE_ID_RE.test(t)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].target '${String(t).slice(0, 40)}' is not a canonical bundle id`));
    } else {
      const tt = targetType = normalizeType(OBJECT_TYPES[t.split('-')[0]]);
      if (tt !== 'information' && tt !== 'inquiry') {
        findings.push(f('C-2.8', 'error', `basis[${i}].target '${t}' is a ${tt}: a leg rests on information or on another inquiry, nothing else`));
      } else if (!refTargets.has(t)) {
        /* C-6.3 (the arm that replaced elevated_into): refs and inquiry_basis
           are projections of this one document and must not disagree. */
        findings.push(f('C-6.3', 'error', `basis[${i}].target '${t}' is not in references[]: an inquiry carrying a basis leg carries the same target as a reference, so the two projections cannot disagree`,
          [`add a references[] entry for '${t}'`, 'remove the basis leg']));
      }
    }
    if (!BASIS_ROLES.includes(leg.role)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].role '${leg.role}' is not one of: ${BASIS_ROLES.join(', ')}`));
    }
    const graded = leg.grade !== undefined && leg.grade !== null;
    if (graded && !BASIS_GRADES.includes(leg.grade)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade '${leg.grade}' is not one of: ${BASIS_GRADES.join(', ')} (absent or null means undetermined, and is stated as such)`));
    }
    if (leg.grade_axis !== undefined && leg.grade_axis !== null && !GRADE_AXES.includes(leg.grade_axis)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade_axis '${leg.grade_axis}' is not one of: ${GRADE_AXES.join(', ')}`));
    }
    if (leg.grade_source !== undefined && leg.grade_source !== null && !GRADE_SOURCES.includes(leg.grade_source)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade_source '${leg.grade_source}' is not one of: ${GRADE_SOURCES.join(', ')}`));
    }
    if (graded) {
      if (!GRADE_AXES.includes(leg.grade_axis)) {
        findings.push(f('C-2.8', 'error', `basis[${i}] carries a grade with no grade_axis: the axis is not derivable from the target, so a graded leg states whether its grade is capture or connection`));
      }
      if (!GRADE_SOURCES.includes(leg.grade_source)) {
        findings.push(f('C-2.8', 'error', `basis[${i}] carries a grade with no grade_source: a grade with no account of where it came from is an invented one (${GRADE_SOURCES.join(', ')})`));
      }
    }
    /* REC-31, from REC-12's landing. CAPTURE RANGES OVER DOCUMENTS (DEC-21):
       it measures how directly the record holds the bytes of an information
       object. An inquiry is not a document — it has no capture, no fidelity
       and nothing to have been captured FROM — so a capture-axis grade
       authored on an INQ- leg is a grade about no referent, and the record
       must not hold a strength claim about a thing that cannot have one.
       REFUSED HERE, at the leg's own grammar, which is BOTH gates at once:
       this one function is consulted by the catalog (checkInquiryExtension)
       and by the store's op=promote write path, so a leg like this cannot
       land and cannot audit clean either. Stated as the axis being wrong
       rather than the target: a leg to another inquiry is perfectly gradable
       — on CONNECTION, which is what a leg to an inquiry is an edge of.
       Why refuse rather than derive around it: REC-12's #strengthWalk names
       such a leg not load-bearing on capture, which was the honest reading
       while nothing refused the combination, but the axis was still AUTHORED
       and the derivation was quietly deciding it meant nothing. The
       derivation KEEPS that arm (history is append-only and a replayed
       revision may carry such a row), and this refusal is what stops new
       ones. */
    /* AMENDED AT THE REC-14 MERGE, and it narrows the arm by exactly one case
       rather than softening it. REC-31 wrote this rule when every grade_source
       was an AUTHORED one (resolution, testimony, hunch), and for all three it
       is unconditional: a member asserting a capture grade about an inquiry is
       asserting fidelity for bytes that do not exist. `inherited` did not exist
       then. An INHERITED capture grade is not a claim about the inquiry at all
       — it is the capture axis THAT CASE FROZE over ITS OWN documents when the
       group signed the edition being cited, which ranges over documents exactly
       as DEC-21 requires, and C-21.2 refuses it if it is stronger than the
       frozen value. It is carried on the leg rather than re-derived because a
       leg citing edition 1 must not silently follow edition 2 (DEC-12). So the
       one case where the axis HAS a referent is admitted, and every authored
       one is refused as before. */
    if (leg.grade_axis === 'capture' && targetType === 'inquiry' && leg.grade_source !== 'inherited') {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture-axis grade on an inquiry leg: capture is a property of an information object (DEC-21) and an inquiry is not one, so this grade has no referent`,
        ['grade this leg on the connection axis — a leg to another inquiry is a connection',
         'move the capture grade onto the INFO- leg it is actually about']));
    }
    /* REC-18: THE CAPTURE AXIS IS NEVER AUTHORED, and this arm is what closes
       it. Together with checkEarnedLeg's axis pairing (which refuses
       `resolution` here, because a resolution is a §8.1 CONNECTION grade), the
       capture axis now admits exactly two sources: `capture`, EARNED from the
       capture record, and `inherited`, taken from a published case's frozen
       capture axis. Neither is a member's assertion.
       WHY THE AUTHORED SOURCES ARE REFUSED RATHER THAN TOLERATED. A capture
       grade states HOW THE BYTES REACHED US (SB-EVIDENCE 602-607) — a fact
       about this record's own machinery, which the record holds and a member
       does not. Testimony is a member's account of a CONNECTION they can vouch
       for; a hunch is a member's provisional CONNECTION. Neither can be an
       account of a fetch. Left tolerated, the one thing this record must never
       do — claim more than it can support — was a member typing `A` beside a
       document, against the landed doctrine that grade A is not reachable at
       all here (CAPTURE-FIDELITY.md; index.mjs's own capture note). */
    if (leg.grade_axis === 'capture' && graded
        && (leg.grade_source === 'testimony' || leg.grade_source === 'hunch')) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture-axis grade with grade_source '${leg.grade_source}': a capture grade says how the BYTES REACHED US, which is a fact this record holds about its own machinery and not one a member can assert. ${leg.grade_source === 'testimony' ? 'Testimony is a member\'s account of a connection' : 'A hunch is a member\'s provisional connection'}, and neither is an account of a fetch`,
        ['use grade_source: capture — the capture axis is EARNED from the capture record, and op=earnedbasis says what it earns',
         'or move this grade onto the connection axis, where testimony and hunches belong']));
    }
    if (leg.grade_source === 'hunch') {
      if (typeof leg.author !== 'string' || leg.author.trim() === '') {
        findings.push(f('C-2.8', 'error', `basis[${i}] is a hunch with no author: a hunch is declared bias and carries the name of the member declaring it (DEC-15)`));
      }
      if (!DATE_RE.test(String(leg.date ?? ''))) {
        findings.push(f('C-2.8', 'error', `basis[${i}] is a hunch with no date: a hunch is temporary by construction and carries the date it was declared, YYYY-MM-DD (DEC-15)`));
      }
    }
    if (leg.grade_source === 'testimony' && graded && leg.grade !== 'D') {
      findings.push(f('C-2.8', 'error', `basis[${i}] states testimony at grade ${leg.grade}: a member's testimony is grade D at no other value — a hunch is the only authored grade permitted above D (DEC-15)`));
    }
    /* REC-18, the OTHER half of the same rule and it is what makes "always D"
       mean something. The arm above refuses a testimony leg that states A/B/C;
       this one refuses a testimony leg that states NOTHING. A grade_source with
       no grade claims to account for a grade that is not there, and for
       testimony it is worse than incoherent: the leg would sit in the record
       carrying a member's name and date beside no assertion, which reads as an
       ungraded (INERT, DEC-18) leg while looking like an act. `inherited` has
       been refused for exactly this since REC-14 (checkInheritedLeg below);
       this extends the same refusal to the two sources that can stand alone.
       An honestly undetermined leg states NO grade AND NO grade_source. */
    if ((leg.grade_source === 'testimony' || EARNED_GRADE_SOURCES.includes(leg.grade_source)) && !graded) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${leg.grade_source}' with no grade: a source is an account of where a grade came from, and there is no grade here to account for`,
        ['state the grade this source produced', `or drop grade_source — an undetermined leg states neither, and is read as present and not yet load-bearing (DEC-18)`]));
    }
    if (leg.note !== undefined && leg.note !== null && typeof leg.note !== 'string') {
      findings.push(f('C-2.8', 'error', `basis[${i}].note is not a string`));
    }
    checkEarnedLeg(leg, i, graded, targetType, earnedRegistry, findings);
    checkInheritedLeg(leg, i, graded, publishedRegistry, findings);
  }
  checkGrounds(fm, legs, findings);
}

/** REC-42 / DEC-32: THE RELATIONSHIP BETWEEN LEGS, and the act that asserts it.
 *
 *  Bob ruled the arithmetic: *"sometimes the weakest is the claim's strength,
 *  and other times it's not. The difference is really whether the relationship
 *  between legs is AND or OR."* So a leg may name a GROUND, legs sharing a
 *  ground are AND-related (the ground is no stronger than its weakest leg), and
 *  the grounds are OR-related (the finding is as strong as its STRONGEST
 *  ground, because each is independently sufficient for the same conclusion).
 *
 *  THIS FUNCTION EXISTS BECAUSE OR TAKES THE MAXIMUM. Every other grammar arm
 *  in this file guards a claim that can only be as strong as what it rests on;
 *  a ground label is the one thing a member can write that makes a finding
 *  STRONGER. DEC-32's anti-gaming keystone is therefore a correctness
 *  requirement rather than a preference: **an unstructured basis stays
 *  weakest-leg, and independent sufficiency is only ever reached by an
 *  AFFIRMATIVE, ATTRIBUTED act.** Hence the `grounds[]` block — one row per
 *  label, carrying the NAME of the member who asserts that ground stands on its
 *  own and the DATE they asserted it, which is the same accountability shape as
 *  the conclusion itself. A label with no row is refused: strengthening by
 *  omission, by default, or by a member not understanding a question is exactly
 *  what must be impossible.
 *
 *  TWO TOP-LEVEL KEYS, forced by the restricted frontmatter grammar rather than
 *  chosen: `ground` is a scalar ON THE LEG (the partition) and `grounds` is an
 *  array of objects (the act), because the grammar cannot carry a map holding an
 *  array of objects. Exactly REC-14's `completeness`/`completeness_excluded` and
 *  REC-16's `division`/`division_apportionment` split, for the same reason.
 *
 *  THE PARTITION IS TOTAL OR ABSENT. If ANY leg names a ground, EVERY leg
 *  must. A half-labelled basis would leave legs nobody grouped sitting beside
 *  branches somebody did, and the honest reading of an unlabelled leg —
 *  necessary, so binding on every branch — is not what a member who labelled
 *  half a basis is likely to have meant. Refused here rather than guessed. (The
 *  derivation still treats an unlabelled leg as NECESSARY if one ever reaches it
 *  around this gate; the arithmetic's default is AND too, and the two defences
 *  are separate on purpose.)
 *
 *  WHAT IS DELIBERATELY NOT HERE. No per-ground FALSIFIER: DEC-32 is explicit
 *  that minting one per ground reads as more honest and is less — it converts
 *  one checkable compound falsifier (*every ground fails*) into several partial
 *  ones, none of which refutes the finding. No per-ground grade: a ground's
 *  strength is DERIVED from its legs and never authored. And no AND/OR
 *  vocabulary reaches any member-facing surface — that is UI-27's elicitation
 *  half, which asks the member about CONSEQUENCES and derives this structure
 *  from their answers.
 *
 *  Q14's contradiction case stays SEPARATE and UNDESIGNED: grounds AGREE on the
 *  conclusion, and two conclusions disagreeing is a different thing entirely.
 *  Nothing here should be read as modelling it. */
function checkGrounds(fm, legs, findings) {
  const rows = fm?.grounds;
  const labelled = [];        // [i, label] for every leg that names a ground
  let unlabelled = 0;
  legs.forEach((leg, i) => {
    if (!leg || typeof leg !== 'object') return;
    const g = leg.ground;
    if (g === undefined || g === null || g === '') { unlabelled++; return; }
    if (typeof g !== 'string' || !GROUND_LABEL_RE.test(g)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].ground '${String(g).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_', naming the branch of the argument this leg belongs to`));
      return;
    }
    labelled.push([i, g]);
  });
  if (rows === undefined || rows === null) {
    if (labelled.length) {
      findings.push(f('C-2.8', 'error', `basis leg${labelled.length === 1 ? '' : 's'} ${labelled.map(([i]) => i).join(', ')} name${labelled.length === 1 ? 's' : ''} a ground with no grounds[] block: grounds compose DISJUNCTIVELY, so a finding takes its STRONGEST ground rather than its weakest leg — and that is only ever reached by an affirmative, attributed act. Nothing may become stronger because a field was written and nobody signed for it`,
        ['author a grounds[] row per label, naming the member who asserts that ground is independently sufficient and the date',
         'or drop the ground labels — an unstructured basis is no stronger than its weakest leg, which is the conservative reading']));
    }
    return;
  }
  if (!Array.isArray(rows)) {
    findings.push(f('C-2.8', 'error', 'grounds is not an array'));
    return;
  }
  const declared = new Map();          // label -> row index
  rows.forEach((r, i) => {
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] is not an object`));
      return;
    }
    const label = r.ground;
    if (typeof label !== 'string' || !GROUND_LABEL_RE.test(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}].ground '${String(label).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_'`));
      return;
    }
    if (declared.has(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] declares '${label}' a second time: one ground, one assertion, one member answering for it`));
      return;
    }
    declared.set(label, i);
    /* REC-46 — THE SITE THE ITEM WAS ROUTED FOR. This asked the word list
       alone, so `token:member` (and `class:member`) reached the record here
       while `agent` was refused. It now asks the one predicate, and so does
       every other site that asks the same question. */
    if (typeof r.asserted_by !== 'string' || r.asserted_by.trim() === ''
        || isMachineIdentity(r.asserted_by)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}].asserted_by '${r.asserted_by}' is not a named member: "these legs are enough on their own" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it — never a machine's`,
        ['name the member asserting that this ground is independently sufficient']));
    }
    if (!ISO_TS_RE.test(String(r.at || ''))) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] requires 'at' as an ISO timestamp (got '${r.at}'): the assertion is dated because a structure authored after a strength was seen is a different act from one authored before it (DEC-32), and only a date lets a reader tell`));
    }
    if (r.statement !== undefined && r.statement !== null && typeof r.statement !== 'string') {
      findings.push(f('C-2.8', 'error', `grounds[${i}].statement is not a string`));
    }
  });
  /* THE PARTITION IS TOTAL OR ABSENT. */
  if (labelled.length && unlabelled) {
    findings.push(f('C-2.8', 'error', `${unlabelled} basis leg${unlabelled === 1 ? '' : 's'} carr${unlabelled === 1 ? 'ies' : 'y'} no ground while ${labelled.length} do: a basis is grouped WHOLE or not at all, because a leg nobody grouped sitting beside branches somebody did is a relationship the record would have to guess at`,
      ['give every leg a ground — a leg that is needed whatever else holds belongs in every ground, so it is its own single-leg ground only if it alone can carry the conclusion',
       'or remove the grounds and let the basis read as its weakest leg']));
  }
  /* A LABEL WITH NO ASSERTION, and its mirror. */
  for (const [i, label] of labelled) {
    if (!declared.has(label)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].ground '${label}' is not declared in grounds[]: a ground that nobody asserted is independently sufficient cannot be one, and the finding must not take a maximum over a branch no member signed for`,
        [`add a grounds[] row for '${label}' with asserted_by and at`]));
    }
  }
  const carried = new Set(labelled.map(([, l]) => l));
  for (const [label, i] of declared) {
    if (!carried.has(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] declares '${label}', which no basis leg belongs to: a ground is a partition OF THE LEGS, and an empty one asserts that nothing is sufficient on its own`,
        [`give at least one basis leg 'ground: ${label}'`, 'or remove the row']));
    }
  }
}

/** REC-18 / DATA-MODEL D1(b) / DEC-15: THE EARNED RULE, PER AXIS.
 *
 *  A grade a caller can hand us is a grade a caller can invent, and CLAUDE.md
 *  is explicit that such a thing is not evidence. So the two grades the RECORD
 *  can compute for itself are computed by the record, and a leg claiming one
 *  must state the value the record actually holds — refused otherwise, in
 *  EITHER direction. Not "no stronger than", which is `inherited`'s rule and is
 *  right there because DEC-12 gives the member a real choice (which edition to
 *  rest on) and a weaker grade can be an honest consequence of it. There is no
 *  such choice here: an earned grade is a FACT about the record at the moment
 *  of the write, and a leg stating anything else states a non-fact about how it
 *  was established, which is precisely what grade means (SB-EVIDENCE 602-607:
 *  "grade tracks how the bytes reached us, never how credible the document is").
 *
 *  THE SPLIT THIS ENFORCES, and it is the recogniser precedent moved up one
 *  layer (schema.mjs:739-743 — "the RECOGNISER never mints a D; the model holds
 *  it so a member can testify, never the machine"):
 *    - `resolution`  EARNED, connection axis, A/B/C — the strongest resolution
 *                    of that document's captures to the inquiry's SUBJECT
 *                    ENTITY. Never D: a D resolution is itself a member's
 *                    testimony (op=resolvetestify), so a leg resting on one is
 *                    testimony and says so, with its own author and date.
 *    - `capture`     EARNED, capture axis — what the record holds about how the
 *                    bytes arrived. B for a document this instance captured;
 *                    A is not reachable and is refused by name, because a
 *                    chain-of-custody web archive is out of a Worker's reach
 *                    and is not claimed (CAPTURE-FIDELITY.md, R2-e/R2-g).
 *    - `testimony`   a MEMBER'S act, always D, author and date carried.
 *    - `hunch`       a member's act, authored above D, HUNCH DEBT until cleared
 *                    (DEC-15) — and the earned path is what it is cleared INTO.
 *                    D-188: HUNCH debt, not "bias debt". Ordinary bias debt is
 *                    DISCLOSED and travels; the hunch is the kind that refuses
 *                    publication (DEC-20).
 *
 *  THE SUBJECT-ENTITY PRICE IS REAL AND IS STATED (DEC-15). An inquiry that
 *  names no subject entity has no A/B/C available to it on the connection axis.
 *  That is not a gate to be got past by inventing one: the leg states no grade,
 *  the axis suspends and names it (R1), and the case reads as what it is.
 *
 *  AN ABSENT REGISTRY IS NOT A WAY THROUGH, and the posture is checkInheritedLeg's
 *  exactly: the pure checker over a filesystem cannot see `resolutions` or
 *  `register`, so it says so rather than passing the leg. Every path a real
 *  caller has — the ratification gate and the store's own write path — injects
 *  the registry. */
function checkEarnedLeg(leg, i, graded, targetType, registry, findings) {
  const src = leg.grade_source;
  if (!EARNED_GRADE_SOURCES.includes(src)) return;
  /* The no-grade case already produced its own finding in the loop above; a
     second complaint about one broken leg helps nobody. */
  if (!graded) return;
  if (!registry) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${src}' but the record it would be earned from cannot be read here: an earned grade is computed by the record and is never taken from a caller, so it cannot be confirmed by a checker that can only see this bundle`,
      ['run this through the ratification gate or op=promote, which read the record',
       'or state the grade as testimony (grade D, with an author and a date) if it is a member\'s account']));
    return;
  }
  const wantAxis = EARNED_SOURCE_AXIS[src];
  /* REC-31's arm already refuses a capture-axis grade on an inquiry leg and says
     it better (the axis has no referent, which is the deeper fault). Silent here
     rather than adding a second complaint about one broken leg — the same
     discipline the loop above takes with an unusable target. */
  if (leg.grade_axis === 'capture' && targetType === 'inquiry' && src !== 'capture') return;
  if (leg.grade_axis !== wantAxis) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${src}' on the ${leg.grade_axis} axis: ${src === 'resolution' ? 'a resolution IS the framework\'s §8.1 connection grade and grades nothing else' : 'a capture grade is a property of an information object and measures how the bytes arrived (DEC-21)'}, so it can only be a source for a ${wantAxis} grade`,
      [`set grade_axis: ${wantAxis} on basis[${i}]`,
       `or state where this ${leg.grade_axis}-axis grade actually came from`]));
    return;
  }
  /* A leg to another INQUIRY earns nothing: an inquiry has no captures and no
     resolutions, so there is no record fact to compute from. Stated for
     `resolution` only — the capture-axis-on-an-inquiry case already has its own
     finding above (REC-31's arm), and it says the same thing better. */
  if (src === 'resolution' && targetType === 'inquiry') {
    findings.push(f('C-2.8', 'error', `basis[${i}] claims an EARNED resolution grade on an inquiry leg: a resolution matches a captured document's reading to a registry entity, and an inquiry is not a captured document — there is nothing here for the recogniser to have graded`,
      ['rest this leg on the INFO- document that carries the reference',
       'or, if the target is a published case, inherit its frozen connection grade (grade_source: inherited)']));
    return;
  }
  if (src === 'resolution' && !registry.subject_entity) {
    findings.push(f('C-2.8', 'error', `basis[${i}] claims an EARNED resolution grade, but this inquiry names no subject_entity: an earned connection grade is the strongest resolution of the target's captures TO THE INQUIRY'S SUBJECT, and with no subject named there is nothing to have resolved to (DATA-MODEL D1(b))`,
      ['add subject_entity: ENT-YYYY-NNNN naming the registry entry this question is about',
       'or state no grade at all — an inquiry with no subject entity has no A/B/C available to it, and that is honest (DEC-15)']));
    return;
  }
  const earned = registry.earned && registry.earned[wantAxis]
    ? registry.earned[wantAxis][leg.target] : null;
  if (!earned || !earned.grade) {
    findings.push(f('C-2.8', 'error', src === 'resolution'
      ? `basis[${i}] states an EARNED resolution grade of ${leg.grade} for ${leg.target}, but the record holds no A/B/C resolution of that document to ${registry.subject_entity}: nothing was earned here. The recogniser never mints a D, so a document known to concern the subject only by a member's testimony earns nothing either — that leg is testimony and says so`
      : `basis[${i}] states an EARNED capture grade of ${leg.grade} for ${leg.target}, but the record holds no registered capture for that document: there are no bytes here whose arrival this grade could be measuring`,
      src === 'resolution'
        ? ['resolve the document to the subject with op=resolve, then state the grade it earned',
           'or state this leg as testimony (grade D, with an author and a date)']
        : ['state no capture grade — an uncaptured document is undetermined on the capture axis, and undetermined is stated (CLAUDE.md)']));
    return;
  }
  /* TWO COMPARISONS, because the record holds two DIFFERENT KINDS OF FACT and
     pretending otherwise would be the laundering this rule exists to stop.
     - mode 'value' (the CONNECTION axis): `resolutions` holds the grade itself,
       so the leg must state THAT VALUE and nothing else, in either direction. A
       weaker letter is not modesty, it is a false statement about how the leg
       was established, which is exactly what a grade means.
     - mode 'ceiling' (the CAPTURE axis): the record holds whether it has bytes
       for this document and what the STRONGEST capture this plane can produce is
       worth — it does NOT hold a per-document capture grade, because no such
       column exists. So the rule is the honest half: no leg may claim MORE than
       the ceiling (which makes grade A structurally unreachable, per the
       doctrine), and a weaker grade is admitted as the member's account of a
       poorer route. The residual — that B-or-weaker is still authored — is
       stated as debt rather than hidden behind a comparison that looks stricter
       than the record can support. */
  if (earned.mode === 'ceiling') {
    if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(earned.grade)) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture grade of ${leg.grade} for ${leg.target}, which is STRONGER than the ${earned.grade} the record can earn for it. ${earned.why} ${earned.ceiling ?? ''}`,
        [`state grade: ${earned.grade} or weaker on basis[${i}] — op=earnedbasis answers what each target earns before you write it`]));
    }
    return;
  }
  if (earned.grade !== leg.grade) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states an EARNED ${wantAxis} grade of ${leg.grade} for ${leg.target}, but the record earns ${earned.grade}: an earned grade is computed by the record and a caller does not hand it to us in either direction. ${earned.why}`,
      [`state grade: ${earned.grade} on basis[${i}] — op=earnedbasis answers what each target earns before you write it`]));
  }
}

/** REC-14 / C-21.2: THE INHERITANCE RULE, PER AXIS.
 *
 *  A case built on a case cannot be stronger than the case beneath it. So a
 *  basis leg whose target is a PUBLISHED inquiry carries grade_source
 *  'inherited', NAMES THE EDITION it rests on, and carries a grade no stronger
 *  than that edition's FROZEN strength ON THE SAME AXIS — refused if stronger
 *  on either axis, and the two are compared independently.
 *
 *  PER AXIS IS THE WHOLE OF IT (RECONCILED R2-j). A single scalar comparison
 *  would let a case inherit an A CONNECTION grade from a case whose A was a
 *  CAPTURE grade — two incommensurable measurements over two different
 *  populations, laundered through one letter. The frozen pair is stamped in the
 *  published bytes as two axis OBJECTS for exactly this reason, and the axis
 *  the leg selects is its own recorded grade_axis.
 *
 *  AN UNRATED OR UNDETERMINED AXIS ADMITS NO GRADE AT ALL, and the two say
 *  different things. UNRATED means nothing on that axis was ever established —
 *  a grade inherited from it would be invented outright. UNDETERMINED means the
 *  walk could not finish, so what lies beneath is UNKNOWN rather than absent,
 *  and a grade taken from it would be a claim about material nobody has seen.
 *
 *  THE EDITION DOES NOT SILENTLY FOLLOW (DEC-12). A leg citing edition 1 keeps
 *  citing edition 1 when edition 2 appears; REC-17's re-evaluation obligation
 *  surfaces the newer edition and the MEMBER decides. Nothing recomputes a
 *  strength on their behalf, because the strength was not changed for them. */
function checkInheritedLeg(leg, i, graded, registry, findings) {
  const target = typeof leg.target === 'string' ? leg.target : null;
  const pub = registry && target ? registry[target] : null;
  if (leg.grade_source === 'inherited' && !pub) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source 'inherited' but its target ${registry ? 'is not a published case' : 'cannot be checked against the published record here'}: a grade is inherited from a case the group SIGNED, at a stated edition, and from nothing else`,
      ['cite a published case and name its edition', 'or state where this grade actually came from']));
    return;
  }
  if (!pub) return;                       // not a published target: nothing to inherit
  if (!graded) {
    /* Legal and deliberately so: an ungraded leg is INERT (DEC-18) — present,
       named, not yet load-bearing. What it may not do is CLAIM inheritance,
       because inheriting nothing is not inheritance. */
    if (leg.grade_source === 'inherited') {
      findings.push(f('C-2.8', 'error', `basis[${i}] claims 'inherited' with no grade: a leg resting on a published case may state no grade at all — undetermined, stated — but it may not claim to have inherited one`));
    }
    return;
  }
  if (leg.grade_source !== 'inherited') {
    findings.push(f('C-21.2', 'error', `basis[${i}] carries a grade of its own on a PUBLISHED case (${target}): a leg resting on a published case inherits that case's frozen strength and says so with grade_source 'inherited'. A case built on a case cannot be stronger than the case beneath it`,
      [`set grade_source: inherited and target_edition on basis[${i}]`]));
    return;
  }
  const ed = leg.target_edition;
  if (!Number.isInteger(ed)) {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits from ${target} without naming an edition: every edition is a SEPARATE DOCUMENT with its own frozen strength, so an unnamed edition leaves the inheritance rule nothing fixed to compare against (DEC-12)`,
      [`add target_edition to basis[${i}]`]));
    return;
  }
  const frozen = pub.editions ? pub.editions[String(ed)] : null;
  if (!frozen) {
    findings.push(f('C-21.2', 'error', `basis[${i}] names edition ${ed} of ${target}, which is not in the published record (published editions: ${pub.editions ? Object.keys(pub.editions).join(', ') || 'none' : 'none'})`));
    return;
  }
  const axis = leg.grade_axis;
  if (axis !== 'capture' && axis !== 'connection') return;   // C-2.8 named it already
  const on = frozen[axis];
  if (!on || on.state !== 'graded') {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose ${axis} axis is ${on ? on.state.toUpperCase() : 'ABSENT'}: ${on && on.state === 'unrated' ? 'nothing on that axis was ever established there, so a grade taken from it would be invented outright' : 'what lies beneath is unknown rather than absent, so a grade taken from it would be a claim about material nobody has seen'}`,
      [`state no grade on basis[${i}] — undetermined, stated, is the honest answer`]));
    return;
  }
  if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(on.grade)) {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose frozen ${axis} strength is ${on.grade}: a case built on a case cannot be stronger than the case beneath it, and the comparison is PER AXIS — this leg's ${axis} grade against that edition's ${axis} grade, never against a composed letter`,
      [`set basis[${i}].grade to ${on.grade}, the frozen ${axis} strength of that edition`]));
  }
}

function checkProjectExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'project') return;
  const fm = ctx.fm;
  if (typeof fm.objective !== 'string' || fm.objective.trim() === '') {
    findings.push(f('C-2.9', 'error', 'objective is missing or empty'));
  }
  const WS = ['draft', 'internally_checked', 'externally_compliant', 'distributed'];
  if (fm.workproduct_state !== undefined && fm.workproduct_state !== null && !WS.includes(fm.workproduct_state)) {
    findings.push(f('C-2.9', 'error', `workproduct_state '${fm.workproduct_state}' is not one of: ${WS.join(', ')}`));
  }
  const evals = Array.isArray(fm.evaluations) ? fm.evaluations : [];
  for (let i = 0; i < evals.length; i++) {
    const e = evals[i];
    if (!e || !['compliance', 'argument'].includes(e.kind) || !['internal', 'external'].includes(e.strictness)
        || !['pass', 'findings'].includes(e.result) || !ISO_TS_RE.test(e.timestamp || '')) {
      findings.push(f('C-2.9', 'error', `evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`));
    } else if (e.result === 'findings' && !e.findings_ref) {
      findings.push(f('C-2.9', 'error', `evaluations[${i}] result is findings but findings_ref is empty`));
    }
  }
  if (fm.current_state === 'closed' && !['resolved', 'superseded', 'abandoned'].includes(fm.closed_reason)) {
    findings.push(f('C-2.9', 'error', `closed state requires closed_reason in: resolved, superseded, abandoned`));
  }
  // C-9: the readiness ladder advances only on recorded evaluations
  const ws = fm.workproduct_state;
  const passed = (kind, stricts) => evals.some(e => e && e.kind === kind && e.result === 'pass' && stricts.includes(e.strictness));
  if (['internally_checked', 'externally_compliant', 'distributed'].includes(ws)) {
    for (const kind of ['compliance', 'argument']) {
      if (!passed(kind, ['internal', 'external'])) {
        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`,
          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));
      }
    }
  }
  if (['externally_compliant', 'distributed'].includes(ws)) {
    for (const kind of ['compliance', 'argument']) {
      if (!passed(kind, ['external'])) {
        findings.push(f('C-9.1', 'error', `workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`,
          ['run the missing evaluation', 'demote workproduct_state to the highest earned rung']));
      }
    }
  }
}

/** C-8: citation register shape, hash format, and cite resolution. */
function checkCitationRegister(ctx, findings) {
  const raw = ctx.files.get('data/citations.json');
  if (!raw) return;
  let reg;
  try { reg = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports */ }
  const claims = Array.isArray(reg?.claims) ? reg.claims : null;
  if (!claims) { findings.push(f('C-8.1', 'error', 'data/citations.json must be {"claims": [...]}')); return; }
  for (let i = 0; i < claims.length; i++) {
    const c = claims[i];
    if (!c || !c.claim_id || !c.claim || !Array.isArray(c.cites) || c.cites.length === 0 || !c.snapshot || !DATE_RE.test(c.as_of || '')) {
      findings.push(f('C-8.1', 'error', `citations claims[${i}] lacks claim_id/claim/cites[]/snapshot/as_of`,
        ['supply keys resolving to an Information object', 'demote claim to commentary', 'move claim to Open Questions']));
      continue;
    }
    if (!CONTENT_HASH_RE.test(c.hash || '')) {
      findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: hash '${String(c.hash).slice(0, 20)}' is not sha256:<64 hex>`));
    }
    for (const t of c.cites) {
      if (!BUNDLE_ID_RE.test(t)) {
        findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: cite '${t}' is not a canonical ID`));
      } else if (ctx.resolveTarget && !ctx.resolveTarget(t)) {
        findings.push(f('C-8.1', 'error', `citations ${c.claim_id}: cite '${t}' does not resolve in the store`,
          ['supply keys resolving to an Information object', 'demote claim to commentary', 'move claim to Open Questions']));
      }
    }
  }
}

/** C-2.10's counterparty arm (D-130 / REC-23). See COUNTERPARTY_STATES above for
 *  the shape, why it is `source`'s, why there is no counterparty table, and the
 *  two things this check deliberately cannot do.
 *
 *  THE COHERENCE RULE, which is the half the item's four refusals imply rather
 *  than list: the STATE and the CONTENT must say the same thing. A `named`
 *  counterparty with no name asserts an addressee that is not there; an
 *  `undetermined` counterparty carrying a name (or an `entity_id`, which names
 *  harder — it points at a registry subject) asserts one while wearing the
 *  label that says it does not. Both are the D-130 move in a different field,
 *  so both are refused here rather than left for a reader to notice. */
function checkCounterparty(fm, findings) {
  const isPlaceholder = (v) =>
    typeof v === 'string' && v.trim().toLowerCase() === COUNTERPARTY_PLACEHOLDER;
  const REPAIRS = [
    'name the counterparty: counterparty.state = named with counterparty.name',
    'or state that it is undetermined: counterparty.state = undetermined with an authored counterparty.basis saying why',
  ];
  const cp = fm.counterparty;

  /* The pre-REC-23 flat shape, and the one every action written before this
     item carries. Named separately from a missing block because the repair is
     different: the fact is present and its shape is wrong, except when the
     "fact" is the machine's own placeholder, which has no fact under it. */
  if (typeof cp === 'string') {
    findings.push(f('C-2.10', 'error', isPlaceholder(cp)
      ? `counterparty is the placeholder '${cp.trim()}', which asserts a counterparty this action does not have (D-130). It is not a name and it is not an honest undetermined`
      : `counterparty '${cp.trim().slice(0, 40)}' is a bare string; it is a block of {state, name, basis} so that "we do not know yet" can be STATED rather than invented`,
      REPAIRS));
    return;
  }
  if (!cp || typeof cp !== 'object' || Array.isArray(cp)) {
    findings.push(f('C-2.10', 'error',
      'counterparty block is missing: an action names who it is addressed to, or states that it is undetermined and why',
      REPAIRS));
    return;
  }

  if (!COUNTERPARTY_STATES.includes(cp.state)) {
    findings.push(f('C-2.10', 'error',
      `counterparty.state '${cp.state}' is not one of: ${COUNTERPARTY_STATES.join(', ')}`, REPAIRS));
    return;
  }

  const name = typeof cp.name === 'string' ? cp.name.trim() : '';
  const basis = typeof cp.basis === 'string' ? cp.basis.trim() : '';
  const entityId = cp.entity_id === undefined || cp.entity_id === null ? '' : String(cp.entity_id).trim();

  /* The placeholder refused wherever it is written, not only in the shape the
     machine used to write it: moving the same string one field down would
     otherwise pass. */
  if (isPlaceholder(name)) {
    findings.push(f('C-2.10', 'error',
      `counterparty.name is the placeholder '${COUNTERPARTY_PLACEHOLDER}', which is not a name (D-130)`, REPAIRS));
  }
  if (isPlaceholder(basis)) {
    findings.push(f('C-2.10', 'error',
      `counterparty.basis is the placeholder '${COUNTERPARTY_PLACEHOLDER}', which says nothing about WHY the counterparty is undetermined`,
      ['author counterparty.basis: what has been established so far, and what would settle it']));
  }

  if (cp.state === 'named') {
    /* The placeholder arm above has already fired if the name IS the
       placeholder; it is non-empty, so this arm correctly does not fire twice
       on one fact. */
    if (!name) {
      findings.push(f('C-2.10', 'error',
        'counterparty.state is named and counterparty.name is empty: the state asserts an addressee the document does not carry', REPAIRS));
    }
    if (entityId && !ENTITY_ID_RE.test(entityId)) {
      findings.push(f('C-2.10', 'error',
        `counterparty.entity_id '${entityId.slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ['point entity_id at an entry in the subject registry (op=entitycreate / op=entitybyalias), or omit it — it is optional']));
    }
  } else {
    if (!basis) {
      findings.push(f('C-2.10', 'error',
        'counterparty.state is undetermined and counterparty.basis is empty: undetermined is first-class and must be STATED, so an action that does not know who it is addressed to says what it does know',
        ['author counterparty.basis: what has been established so far, and what would settle it']));
    }
    /* The coherence rule, both halves. */
    if (name) {
      findings.push(f('C-2.10', 'error',
        `counterparty.state is undetermined and counterparty.name is '${name.slice(0, 40)}': the block asserts a counterparty and denies having one in the same breath`,
        ['set state: named if the name is the counterparty', 'or clear name and leave the basis to say what is known']));
    }
    if (entityId) {
      findings.push(f('C-2.10', 'error',
        `counterparty.state is undetermined and counterparty.entity_id is '${entityId.slice(0, 40)}': an entity_id names a subject in the registry, which is a determination`,
        ['set state: named', 'or clear entity_id']));
    }
  }
}

/** REC-24 (a): the action's basis legs, and DEC-13's specificity requirement.
 *
 *  Exported so the STORE runs this same function at the write (the
 *  checkInquiryBasis precedent), which is what stops a malformed basis landing
 *  and auditing clean at the same time.
 *
 *  WHAT IT HOLDS. A leg names a target that is a canonical id, and a kind from
 *  the closed pair. A leg may NOT point at an action: an action resting on an
 *  action is our own work cited as the reason for our own work, which is the
 *  circularity DEC-14 spends its whole ruling refusing, and it is cheaper to
 *  refuse the shape than to detect the claim later.
 *
 *  AND DEC-13'S ONE HARD REQUIREMENT: a `request_for_comment` NAMES THE
 *  SPECIFIC INQUIRIES IT DISCLOSED, as `advances` legs. Zero inquiries is
 *  refused BY NAME, because that is exactly the ask the Columbia review found
 *  at the centre of the Rolling Stone failure — a comment request with no
 *  specifics, which looks like diligence in the record and gave the subject
 *  nothing to answer. The kind is `advances` and not `rests_on` on purpose:
 *  putting a claim to its subject PURSUES that question, and the reply may
 *  change the answer (DEC-13: "the response may change the case, and that is
 *  the point"). A finding the request is BUILT ON is a rests_on leg and may sit
 *  beside it; it is not what was disclosed.
 *
 *  THE WINDOW IS AUTHORED, AND ITS RANGE IS NOT ENFORCED. A request_for_comment
 *  carries at least one clock[] entry — the response window — and C-11.1
 *  already requires every clock entry to carry a basis (the statute, order or
 *  commitment the date derives from). RFC_RESPONSE_WINDOW_PRECEDENT carries
 *  GAO's 7-30 days as a CITATION for a surface to show; nothing here compares a
 *  date against it, because a window this project invented would be this
 *  project asserting a deadline nobody agreed to. */
export function actionBasisFindings(fm, findings) {
  const legs = Array.isArray(fm?.action_basis) ? fm.action_basis : [];
  const REPAIRS = ['point the leg at the finding this rests on (kind: rests_on) or the question it advances (kind: advances)'];
  legs.forEach((l, i) => {
    if (!l || typeof l !== 'object' || Array.isArray(l)) {
      findings.push(f('C-2.10', 'error', `action_basis[${i}] is not a leg block of {target, kind}`, REPAIRS));
      return;
    }
    const target = typeof l.target === 'string' ? l.target : '';
    if (!BUNDLE_ID_RE.test(target)) {
      findings.push(f('C-2.10', 'error',
        `action_basis[${i}].target '${String(l.target).slice(0, 40)}' is not a canonical bundle id`, REPAIRS));
    } else if (OBJECT_TYPES[target.split('-')[0]] === 'action') {
      findings.push(f('C-2.10', 'error',
        `action_basis[${i}].target '${target}' is an ACTION: an action does not rest on our own action. `
        + `Evidence for what we did is evidence somebody else produced (DEC-14)`,
        ['point the leg at the finding or the question, not at another action']));
    }
    if (!ACTION_BASIS_KINDS.includes(l.kind)) {
      findings.push(f('C-2.10', 'error',
        `action_basis[${i}].kind '${l.kind}' is not one of: ${ACTION_BASIS_KINDS.join(', ')}`, REPAIRS));
    }
  });

  if (fm?.action_kind === 'request_for_comment') {
    const disclosed = legs.filter((l) => l && typeof l === 'object' && l.kind === 'advances'
      && typeof l.target === 'string' && BUNDLE_ID_RE.test(l.target)
      && OBJECT_TYPES[l.target.split('-')[0]] === 'inquiry');
    if (!disclosed.length) {
      findings.push(f('C-2.10', 'error',
        'a request_for_comment names ZERO inquiries: it must name the SPECIFIC questions it put to the subject, '
        + 'as action_basis legs of kind advances. "We contacted them" and "we put these four claims to them" are '
        + 'different facts, and a comment request without specifics gives the subject nothing to answer (DEC-13)',
        ['add an action_basis leg with kind: advances for each inquiry disclosed in the request']));
    }
    const clock = Array.isArray(fm.clock) ? fm.clock : [];
    if (!clock.length) {
      findings.push(f('C-2.10', 'error',
        'a request_for_comment states the response window it gave, as a clock[] entry with its own basis. '
        + `The window is AUTHORED by the group; ${RFC_RESPONSE_WINDOW_PRECEDENT.source} is the precedent to `
        + 'reason from and is not a constant this record enforces (DEC-13)',
        ['add a clock[] entry: the date the response was due, and the basis it derives from']));
    }
  }
}

/** REC-24 (b): the correspondence ledger, and the CAPTURE-OR-TESTIFY choice
 *  made structural.
 *
 *  Exported and run by the store at the write, like actionBasisFindings above.
 *
 *  THE RULE, and why NEITHER and BOTH are both refused. An entry carries either
 *  an `artifact_sha` — bytes we hashed and can produce later — or an `account`
 *  with an `author`, a named member's dated testimony that the exchange
 *  happened. NEITHER is an entry that stands for nothing: it asserts a
 *  correspondence and offers no way to check it, which is the overclaiming
 *  class this record exists to catch. BOTH is the subtler one and DEC-13 rules
 *  it directly — what comes back is CAPTURED, not summarised — so an entry may
 *  not carry the bytes AND a paraphrase of them, because the paraphrase is what
 *  a reader would quote and the bytes are what the group can defend.
 *
 *  THE SHA'S SHAPE IS CHECKED HERE AND ITS RESOLUTION IS NOT, stated rather
 *  than implied: this catalog is a pure function over one document, and the
 *  only resolver injected into it answers for BUNDLE ids. Whether the hash
 *  names a real capture is a fact about the `register` table, so promote
 *  enforces it — the REC-23 entity_id precedent, one construct over.
 *
 *  `author` IS SERVER-STAMPED and this check only requires its PRESENCE. A
 *  document carrying an account with no author is refused; a document carrying
 *  a FALSE author is not something a pure check can see, and index.mjs
 *  overwriting the field is what makes it true. */
export function correspondenceFindings(fm, findings) {
  const entries = Array.isArray(fm?.correspondence) ? fm.correspondence : [];
  entries.forEach((e, i) => {
    if (!e || typeof e !== 'object' || Array.isArray(e)) {
      findings.push(f('C-2.10', 'error', `correspondence[${i}] is not an entry block`));
      return;
    }
    if (!CORRESPONDENCE_DIRECTIONS.includes(e.direction)) {
      findings.push(f('C-2.10', 'error',
        `correspondence[${i}].direction '${e.direction}' is not one of: ${CORRESPONDENCE_DIRECTIONS.join(', ')}`,
        ['record a non-response as direction: no_response with the date it was due (DEC-13)']));
    }
    if (!DATE_RE.test(String(e.at ?? '').slice(0, 10))) {
      findings.push(f('C-2.10', 'error',
        `correspondence[${i}].at '${String(e.at).slice(0, 40)}' is not a date: an entry in this ledger is `
        + 'dated, including a non-response, which is dated by when the reply was due'));
    }
    const sha = typeof e.artifact_sha === 'string' ? e.artifact_sha.trim() : '';
    const account = typeof e.account === 'string' ? e.account.trim() : '';
    const author = typeof e.author === 'string' ? e.author.trim() : '';
    const CHOICE = [
      'capture the artifact and record its sha256 (op=capture), or',
      'record a named account: account with the member who is testifying to it',
    ];
    if (sha && account) {
      findings.push(f('C-2.10', 'error',
        `correspondence[${i}] carries BOTH an artifact_sha and an account: what came back is CAPTURED, not `
        + 'summarised (DEC-13). The bytes are what the group can defend; a paraphrase beside them is what a '
        + 'reader would quote instead', CHOICE));
    } else if (!sha && !account) {
      findings.push(f('C-2.10', 'error',
        `correspondence[${i}] carries NEITHER an artifact_sha nor an account: it asserts an exchange and `
        + 'offers no way to check that it happened', CHOICE));
    } else if (sha) {
      if (!CONTENT_HASH_RE.test(sha) && !/^[0-9a-f]{64}$/i.test(sha)) {
        findings.push(f('C-2.10', 'error',
          `correspondence[${i}].artifact_sha '${sha.slice(0, 24)}' is not a sha256 hash`));
      }
      if (e.direction === 'no_response') {
        findings.push(f('C-2.10', 'error',
          `correspondence[${i}] is a no_response carrying an artifact_sha: nothing arrived, so there are no `
          + 'bytes to hash. A non-response is recorded as a named account with its date (DEC-13)',
          ['record the non-response as an account: what was due, when, and that nothing came']));
      }
    } else if (!author) {
      findings.push(f('C-2.10', 'error',
        `correspondence[${i}] carries an account with no author: testimony is somebody's, and an unattributed `
        + 'account is a claim nobody stands behind'));
    }
  });
}

/** DEC-14: what an action's recorded consequence CLAIMS, derived rather than
 *  asserted — a pure function over one document, so the store, the catalog and
 *  any read agree by construction instead of by convention.
 *
 *  THE LINE IS STRUCTURAL AND AT THE WRITE PATH, which is the ruling's own
 *  wording. An action's recorded consequence is an OUTCOME by default: a dated,
 *  capturable, first-party fact about the body — a hearing convened, a study
 *  commissioned — that requires no causal claim at all and is carried at full
 *  strength. Promoting it to an IMPACT claim requires a `rests_on` leg pointing
 *  at evidence that is NOT OUR OWN ACTION: a council member's statement naming
 *  the report, a staff memo referencing it, a hearing record. What is refused
 *  is impact asserted from SEQUENCE ALONE, which is precisely the claim this
 *  record would refuse from a public body.
 *
 *  AND IT IS NOT A REFUSAL. `unproven` is a STATED STATE on R1's shape — no
 *  computed strength on this axis, and it names why — never a fifth grade and
 *  never a low one, because a low grade would say we established it weakly.
 *  So an impact claim with no outside evidence LANDS, and lands saying what it
 *  is. The machine never mints the stronger one (grade_source's discipline).
 *
 *  WHY A DOCUMENT THIS ACTION'S OWN CORRESPONDENCE PRODUCED DOES NOT COUNT: a
 *  reply we elicited is our own action's output. It is excellent evidence about
 *  the BODY (its non-response is fully claimable, DEC-13) and it is no evidence
 *  at all that our asking CAUSED anything — those are different claims and only
 *  one of them is about us. */
export function consequenceState(fm) {
  const c = fm?.consequence;
  if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
  const claim = c.claim === 'impact' ? 'impact' : 'outcome';
  const description = typeof c.description === 'string' ? c.description.trim() : '';
  const at = typeof c.at === 'string' ? c.at.trim() : '';
  if (claim === 'outcome') {
    return { claim, state: 'recorded', determined: true, grade: null, evidence: [],
             description, at,
             detail: 'OUTCOME: a dated first-party fact about the body, carried at full strength. It makes no '
                   + 'causal claim, so there is nothing here to establish (DEC-14).' };
  }
  /* Our own correspondence's artifacts: elicited by this action, so they are its
     output and not outside evidence for it. */
  const ownArtifacts = new Set((Array.isArray(fm.correspondence) ? fm.correspondence : [])
    .map((e) => (e && typeof e === 'object' && typeof e.artifact_bundle_id === 'string') ? e.artifact_bundle_id : null)
    .filter(Boolean));
  const evidence = (Array.isArray(fm.action_basis) ? fm.action_basis : [])
    .filter((l) => l && typeof l === 'object' && l.kind === 'rests_on'
                && typeof l.target === 'string' && BUNDLE_ID_RE.test(l.target)
                && OBJECT_TYPES[l.target.split('-')[0]] !== 'action'
                && !ownArtifacts.has(l.target))
    .map((l) => l.target);
  if (!evidence.length) {
    return { claim, state: 'unproven', determined: false, grade: null, evidence: [],
             description, at,
             detail: 'UNPROVEN: this action claims IMPACT and rests on no evidence outside our own action, so '
                   + 'the causal link is asserted from sequence alone. That is not a low score and not a '
                   + 'failure — it is what we have not established. Cite something outside us (a statement '
                   + 'naming the report, a staff memo, a hearing record) and it becomes a claim like any '
                   + 'other (DEC-14).' };
  }
  return { claim, state: 'established', determined: true, grade: null, evidence,
           description, at,
           detail: `IMPACT rests on evidence that is not our own action: ${evidence.join(', ')}.` };
}

function checkActionExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'action') return;
  const fm = ctx.fm;
  actionBasisFindings(fm, findings);
  correspondenceFindings(fm, findings);
  /* The suite lives at module level as ACTION_KINDS (exported for REC-19's
     op=affordances) so the gate and the publication read one array. */
  if (!ACTION_KINDS.includes(fm.action_kind)) findings.push(f('C-2.10', 'error', `action_kind '${fm.action_kind}' is not in the suite`));
  if (![1, 2, 3].includes(fm.risk_tier)) findings.push(f('C-2.10', 'error', `risk_tier '${fm.risk_tier}' is not 1, 2, or 3`));
  checkCounterparty(fm, findings);
  /* REC-39: the four words are RESOLUTIONS at module level (exported for
     op=affordances) so this finding, op=actionmove's own refusal and the
     published vocabulary read one array — the ACTION_KINDS line above exactly.
     The SENTENCE is derived from the array too: it used to transcribe the four
     words a second time inside the same statement that tested them, which is a
     copy at a distance of ten characters and is how a list and its own
     description come to disagree. */
  if (fm.current_state === 'resolved' && !RESOLUTIONS.includes(fm.resolution)) {
    findings.push(f('C-2.10', 'error', `resolved state requires resolution in: ${RESOLUTIONS.join(', ')}`));
  }
  // C-11: clock discipline
  const clock = Array.isArray(fm.clock) ? fm.clock : [];
  const today = new Date(ctx.nowMs ?? Date.now()).toISOString().slice(0, 10);
  const STATUSES = ['pending', 'met', 'overdue', 'waived'];
  for (let i = 0; i < clock.length; i++) {
    const e = clock[i];
    if (!e || !e.text || !e.description) {
      findings.push(f('C-11.1', 'error', `clock[${i}] lacks the dual-audience {text, description} shape`)); continue;
    }
    if (!DATE_RE.test(e.date || '')) findings.push(f('C-11.1', 'error', `clock[${i}].date '${e.date}' is not YYYY-MM-DD`));
    if (typeof e.basis !== 'string' || e.basis.trim() === '') {
      findings.push(f('C-11.1', 'error', `clock[${i}] has no basis (the statute, order, or commitment the date derives from)`, ['supply basis']));
    }
    if (!STATUSES.includes(e.status)) findings.push(f('C-11.1', 'error', `clock[${i}].status '${e.status}' is not one of: ${STATUSES.join(', ')}`));
    if (DATE_RE.test(e.date || '') && e.date < today && e.status === 'pending') {
      findings.push(f('C-11.1', 'error', `clock[${i}] '${e.text}' is silently past-due (${e.date} < today, status still pending)`,
        ['mark overdue', 'mark met', 'mark waived with reason']));
    }
  }
}

/* ===========================================================================
 * PL-12 / D-84 — THE BIAS BUNDLE'S STATEMENT ANATOMY, and DEC-54 (a) and (b)
 * where they bite on a DOCUMENT.
 *
 * `BIO_Declared_Bias_v0_1.md`, "Statement anatomy": each statement carries a
 * stable id within its bundle; its kind; its subject; the declarative text; a
 * REQUIRED justification; citations (required for kind=pattern); and, on
 * instance-level statements only, a lock flag.
 *
 * THE STATEMENTS LIVE IN FRONTMATTER (`statements[]`), not in the prose under
 * `## Statements`. That is D-21's rule — one place to state a fact — and it is
 * the same shape an inquiry's `basis[]` already takes, which is what lets the
 * store project them without inventing a second authority. The prose heading is
 * where a member writes for other members; the array is what the record checks
 * and what a manifest is computed from.
 *
 * WHAT THIS FUNCTION CANNOT DO, STATED RATHER THAN QUIETLY APPROXIMATED. The
 * doctrine's own safeguard 5 says it: "effect comparison is mechanical for
 * inference statements and largely mechanical for scrutiny statements; pattern
 * statements and artful language are not fully machine-judgeable, and the
 * design does not pretend otherwise. What the machine guarantees is that
 * nothing on a shared subject is QUIET." So the malformedness arms below are
 * NARROW ON PURPOSE — they catch the wholesale verdict the rule names in its
 * own words ("X lies", "everything from Y is false") and they let a strongly
 * worded, evidenced, justified statement through, because the ratification
 * review is where human judgment finishes the job. A wider predicate here would
 * refuse honest disclosures, and refusing a disclosure does not remove the
 * bias — it removes the declaration of it and pushes it into the unstated
 * priors, which is exactly the masking the five safeguards exist to defeat.
 * ======================================================================== */

/* The malformedness rule's two mechanical arms. ARM 1 is the wholesale-falsity
   form; ARM 2 is the speaker-as-liar form. Both are written to require a TRUTH
   VERDICT and not merely strong language, so that a scrutiny statement about a
   source's reliability — which is what this construct is FOR — passes. */
/* EXPORTED, and that is the whole point of them being here rather than beside
   the inhale that also uses them. DEC-54's constraint 2: "the malformedness rule
   binds the machine exactly as it binds a member" — so the predicate that
   refuses a member's statement and the predicate that keeps a machine's
   candidate out of a proposal must be ONE predicate. A second copy would agree
   at zero cost and then drift, which this project has measured five times; the
   suite pins the store's use as an IMPORT rather than a literal. */
export const BIAS_VERDICT_WHOLESALE =
  /\b(everything|anything|all|every|each|nothing|none)\b[^.]{0,60}?\b(is|are)\b[^.]{0,30}?\b(false|untrue|lies|a lie|fabricated|fabrications?|invented|made up|propaganda|disinformation)\b/i;
export const BIAS_VERDICT_SPEAKER = [
  /\b(is|are)\s+(a\s+)?(liars?|dishonest|untrustworthy|not\s+credible|never\s+credible|not\s+to\s+be\s+believed)\b/i,
  /\b(always|habitually|invariably|systematically)\s+lies\b/i,
  /\bnever\s+tells\s+the\s+truth\b/i,
];

/* DEC-54 (a)'s textual arm: the BAR phrasings a newsroom policy actually uses.
   The ruling names AP's "more than one source" as the canonical example of a
   sentence that belongs in `required_strength` and NOT in a bias set, because
   "file a bar as bias and it stops gating; file bias as a bar and it starts
   refusing". These patterns require a THRESHOLD — a count of sources, or a
   named grade floor — so a statement that merely talks about sources without
   setting one is untouched. Reuters' "weigh the source's track record, position
   and motive" contains no threshold and is a clean kind=scrutiny statement; it
   is pinned as an over-strictness arm in test/bias.test.mjs. */
export const BIAS_BAR_PHRASING = [
  /\b(more than one|at least (one|two|three|\d+)|two or more|\d+\s+or\s+more)\s+(independent\s+)?sources?\b/i,
  /\b(requires?|must (reach|be at|meet)|no (lower|less) than)\b[^.]{0,30}\bgrade\s*[A-D]\b/i,
  /\brequired_strength\b/i,
];

/** PL-12 / D-84: the bias bundle's own checks. C-26.1 to C-26.7 fire here;
 *  C-26.8 fires in the store, where the inhale is. */
export function checkBiasExtension(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== 'bias') return;
  const fm = ctx.fm;
  const state = fm.current_state;
  const statements = Array.isArray(fm.statements) ? fm.statements : null;

  if (statements === null) {
    findings.push(f('C-26.1', 'error',
      'a bias bundle carries its statements in frontmatter as statements[], and this one has none',
      ['add statements[] to bundle.md frontmatter, each with id, kind, subject, text and justification']));
    return;
  }

  const seen = new Set();
  for (let i = 0; i < statements.length; i++) {
    const s = statements[i];
    const at = `statements[${i}]`;
    if (!s || typeof s !== 'object') {
      findings.push(f('C-26.1', 'error', `${at} is not a statement object`));
      continue;
    }
    const id = typeof s.id === 'string' ? s.id.trim() : '';
    const text = typeof s.text === 'string' ? s.text.trim() : '';
    const kind = typeof s.kind === 'string' ? s.kind.trim() : '';

    /* A stable id WITHIN ITS BUNDLE is what an override names, and a project
       override "must name the instance statement id it nullifies" — so a
       missing or duplicated id makes safeguard 1 unenforceable rather than
       merely untidy. */
    if (!id) findings.push(f('C-26.1', 'error', `${at} has no id, and an id is what an override names`));
    else if (seen.has(id)) findings.push(f('C-26.1', 'error', `${at} repeats the statement id '${id}'; ids are stable and unique within a bundle`));
    else seen.add(id);

    /* THE CLOSED SET OF THREE. "Declared bias is a CLOSED SET: scrutiny,
       inference, pattern. All three govern HOW YOU REASON over what you hold"
       (DEC-54). A fourth kind is not a weaker statement; it is an ungoverned
       one, and it would be the door a bar walks through. */
    if (!BIAS_STATEMENT_KINDS.includes(kind)) {
      findings.push(f('C-26.1', 'error',
        `${at} kind '${kind || '(absent)'}' is not one of: ${BIAS_STATEMENT_KINDS.join(', ')}`,
        ['a standard of evidence is a BAR, not a bias kind — declare it as the project\'s required_strength (DEC-17, DEC-54 a)']));
    }

    /* SUBJECTS ARE REGISTRY ENTRIES, NOT FREE TEXT (safeguard 4). The registry
       is the same one the content framework's entity axis uses (D-83), and
       every kind it carries is a legal subject (DEC-6, 2026-08-01) — so there
       is NO kind whitelist here, deliberately, and the ruling says why: a
       narrow list "admits the doctrinally riskiest kind and refuses the safest.
       It protects nothing." What is checked is that the subject is a REGISTRY
       KEY at all, because prose subjects are what make a collision undetectable. */
    const subject = s.subject === undefined || s.subject === null ? '' : String(s.subject).trim();
    if (!subject || !ENTITY_ID_RE.test(subject)) {
      findings.push(f('C-26.2', 'error',
        `${at} subject '${subject.slice(0, 40) || '(absent)'}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ['point subject at an entry in the subject registry (op=entitycreate / op=entitybyalias)']));
    }

    /* A DECLARATIVE, unless this statement is a PURE NULLIFICATION.
       CORRECTED ON FIRST RUN and stated rather than quietly relaxed: the first
       version required text unconditionally, which made an override that only
       REMOVES an instance statement unwritable — and safeguard 1's whole
       mechanism is that such an override must exist, be named, and be visible
       as a diff. An override carrying `nullifies` AND text is a REPLACEMENT
       (the doctrine's word); carrying `nullifies` and no text it is a
       nullification. Both still need a JUSTIFICATION below, which is the arm
       that matters here — loosening an instance statement without saying why is
       exactly the masking safeguard 3 requires be loud. */
    const nullifies = typeof s.nullifies === 'string' ? s.nullifies.trim() : '';
    if (!text && !nullifies)
      findings.push(f('C-26.1', 'error', `${at} has no declarative text and nullifies nothing, so it says nothing at all`));

    /* A REQUIRED JUSTIFICATION, on every kind. This is the disclosure's whole
       point — "the author must declare and JUSTIFY their bias for the system to
       honor it" — and an unjustified statement is an undeclared prior with a
       form field around it. */
    const justification = typeof s.justification === 'string' ? s.justification.trim() : '';
    if (!justification) {
      findings.push(f('C-26.3', 'error', `${at} has no justification`,
        ['say why this lens is held; a bias the system honours is one its author justified']));
    }

    /* kind=pattern IS ANALYSIS by the epistemics ladder, so it must cite
       evidence in the record: "a pattern statement without at least one
       citation cannot leave draft". The gate is on LEAVING draft, exactly as
       the doctrine words it, so a set can be written before its citations are
       anchored and cannot become binding without them. */
    const citations = Array.isArray(s.citations) ? s.citations.filter((c) => c != null && String(c).trim() !== '') : [];
    if (kind === 'pattern' && citations.length === 0 && state !== 'draft') {
      findings.push(f('C-26.4', 'error',
        `${at} is a pattern statement with no citation, and a pattern statement cannot leave draft without one`,
        /* CORRECTED TWICE ON FIRST RUN, and `repair-reachability.test.mjs` is
           what corrected it, which is the instrument working. The first version
           said "or return the bundle to draft" — a MOVE DIRECTIVE naming no
           edge (A2). The second named the edge as `proposed -> draft,
           op=promote` — legal, but A3 then measured that the plane offers NO
           ACT at `proposed` for a bias set, because the bias machine's
           transitions are ordinary promotions and this file's act registry has
           none for them. Both refusals are right. So this repair no longer
           directs a MOVE at all: it states the condition, which is what the
           doctrine actually says ("cannot leave draft without one"), and leaves
           the member's own write path to do what it already does. */
        ['cite the evidence in the record this pattern rests on',
         'or leave the set in draft until it can be cited — a pattern statement cannot leave draft without one']));
    }

    /* THE MALFORMEDNESS REFUSAL — DEC-54's fourth scope, and the doctrine's own
       words: "Declared bias may raise scrutiny, constrain inference, and assert
       evidenced patterns. It may never issue verdicts… The construct that
       fights undeclared distortion is held to a higher standard than the
       distortion." Refused no matter who declares it, and the same predicate
       runs over a MACHINE-PROPOSED statement (DEC-54's constraint 2: "the
       malformedness rule binds the machine exactly as it binds a member"). */
    if (text && (BIAS_VERDICT_WHOLESALE.test(text) || BIAS_VERDICT_SPEAKER.some((re) => re.test(text)))) {
      findings.push(f('C-26.5', 'error',
        `${at} pre-assigns a truth value wholesale to its subject, which is MALFORMED whoever declares it`,
        ['raise scrutiny on the source instead — say what checking its claims need before they bear load',
         'or block a named inference instead of issuing a verdict']));
    }

    /* DEC-54 (a) — SPLIT BARS FROM BIAS. Two arms, structural first: a
       statement carrying a required_strength field IS a bar wearing a
       statement's clothes, whatever its text says. The textual arm catches the
       phrasing the ruling names by example. Either way the refusal points at
       where the sentence BELONGS rather than merely refusing it, because the
       policy sentence is legitimate — it is filed in the wrong construct. */
    const carriesBar = s.required_strength !== undefined
      || (s.bar !== undefined && s.bar !== null)
      || (text && BIAS_BAR_PHRASING.some((re) => re.test(text)));
    if (carriesBar) {
      findings.push(f('C-26.6', 'error',
        `${at} states a BAR — how strong support must be before you assert — and a bar is not a lens`,
        ['declare it as the project\'s required_strength{capture, connection} (DEC-17)',
         'bias is DISCLOSED and refuses nothing; a bar GATES at pre-flight, and merging them breaks both']));
    }
  }

  /* DEC-54 (b) — THE UNENFORCEABLE RESIDUE IS A PUBLISHED OUTPUT. The heading
     is canonical for the type (see HEADINGS.bias), so C-3.1 already refuses a
     bundle that omits it. What THIS refuses is an ADOPTED bundle whose residue
     section is EMPTY: an empty heading is the checkbox, and the ruling's whole
     point is that "a case saying 'held to AP's standards' must ALSO say which
     of those standards this system does not check". A set that enforces its
     countable half while saying nothing about the rest delivers "enforcement of
     precisely the part that does not protect, wearing the authority of the
     whole policy". Draft and proposed sets are exempt, because the residue is
     authored as part of proposing rather than before it. */
  if (state === 'adopted') {
    const body = ctx.files.get('bundle.md');
    const md = body === undefined ? '' : asText(body);
    const m = /\n## What This Does Not Enforce[^\S\n]*\n([\s\S]*?)(?=\n## |$)/.exec('\n' + md);
    if (!m || m[1].trim() === '') {
      findings.push(f('C-26.7', 'error',
        'this bias set is adopted and says nothing under "## What This Does Not Enforce"',
        ['name what this lens does NOT check — the residue is a published output, not a log line (DEC-54 b)',
         'if every statement here is fully enforced, say that, and say it in the record']));
    }
  }
}

/** C-7: deletion records, when present. */
function checkDeletionRecords(ctx, findings) {
  const raw = ctx.files.get('data/deletions.json');
  if (!raw) return;
  let del;
  try { del = JSON.parse(asText(raw)); } catch { return; /* C-14.3 reports */ }
  const recs = Array.isArray(del?.records) ? del.records : null;
  if (!recs) { findings.push(f('C-7.1', 'error', 'data/deletions.json must be {"records": [...]}')); return; }
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    if (!r || !ISO_TS_RE.test(r.timestamp || '') || typeof r.reason !== 'string' || r.reason.trim() === ''
        || !Array.isArray(r.items) || r.items.length === 0 || !r.preserved_to) {
      findings.push(f('C-7.1', 'error', `deletions records[${i}] lacks timestamp/reason/items[]/preserved_to`,
        ['restore removed material', 'convert to a gated deletion retroactively: reason, preservation, cascade']));
    }
  }
}

// ---------------------------------------------------------------------------
// C-18.3/4/5: intake register integrity and the gathering-request grammar
// (State Rules v1.5 draft; adversarial review F4, F5). C-18.3 folds duplicate
// captures into corroboration; C-18.4 is the F4 provenance-forgery advisory;
// C-18.5 is the F5 injection-posture gathering.json field grammar.
// ---------------------------------------------------------------------------

/** https-only, public hosts only (intake doctrine 0.7): forecloses lookalike
 *  origins and SSRF-shaped locators alike. The one canonical implementation;
 *  the accelerator's daemon delegates to this through the embedded gate. */
export function isPublicHttpsLocator(url) {
  if (typeof url !== 'string' || !/^https:\/\//.test(url)) return false;
  const m = /^https:\/\/([^/?#]+)/.exec(url);
  if (!m) return false;
  const hostport = m[1];
  if (hostport.indexOf('@') !== -1) return false;
  const host = hostport.split(':')[0].toLowerCase();
  if (host === 'localhost' || host.charAt(0) === '[') return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (host.indexOf('.') === -1) return false;
  return true;
}

const GATH_ID_RE = /^GATH-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
const CRITICALITY_ENUM = ['crucial', 'supporting'];
const CADENCE_ENUM = ['hourly', 'daily', 'weekly', 'monthly', 'none'];
const GATH_STATUS_ENUM = ['open', 'captured', 'retired'];

/** C-18.3 (error): a missed corroboration under the ring-once rule (identical
 *  content is corroboration on one entry, never two review items). TWO arms:
 *  the RAW arm folds captures with the same capture.sha256; the NORMALISED arm
 *  (CONSTRUCTS Step 2 / FW-4) folds captures whose determined evidentiary digest
 *  matches though their raw bytes differ — the same document served with a
 *  different __VIEWSTATE or furniture, which raw byte comparison cannot see. An
 *  undetermined (null) evidentiary digest is never bucketed. C-18.4 (warn, F4):
 *  crucial-criticality material whose register entries lack both co_archive
 *  and timestamp. Both scoped by declared contract (register present). */
function checkRegisterIntegrity(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) return;
  let reg;
  try { reg = JSON.parse(asText(raw)); } catch { return; }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return; // C-18.1 reports shape
  const byHash = {};
  /* The NORMALISED bucket (CONSTRUCTS Step 2 / FW-4). Keyed by the evidentiary
     digest — presentational and mechanical normalised — so two captures of the
     SAME document that differ only in per-render machinery (an ASP.NET __VIEWSTATE)
     or furniture fold into ONE corroboration, which the raw-hash bucket above
     cannot see because their raw bytes differ. Only a DETERMINED digest is bucketed:
     an undetermined capture records `evidentiary: null` and two of those must never
     be treated as equal (an equality that costs nothing to produce is not evidence),
     so nulls are skipped rather than collated. */
  const byEvid = {};
  for (let i = 0; i < docs.length; i++) {
    const h = docs[i] && docs[i].capture && docs[i].capture.sha256;
    if (h) (byHash[h] = byHash[h] || []).push(i);
    const dg = docs[i] && docs[i].profile && docs[i].profile.digests;
    if (dg && dg.determined === true && typeof dg.evidentiary === 'string')
      (byEvid[dg.evidentiary] = byEvid[dg.evidentiary] || []).push(i);
  }
  for (const h of Object.keys(byHash)) {
    if (byHash[h].length > 1) {
      findings.push(f('C-18.3', 'error', `capture hash ${h.slice(0, 16)}… appears in ${byHash[h].length} register documents (indices ${byHash[h].join(', ')}); identical content is corroboration on one entry, never duplicate review items`,
        ['fold the duplicates into corroborations[] on the earliest entry', 'if the captures genuinely differ, correct the recorded hashes']));
    }
  }
  for (const e of Object.keys(byEvid)) {
    const idx = byEvid[e];
    if (idx.length < 2) continue;
    /* Fire ONLY when at least two DIFFERENT raw captures share the evidentiary
       digest: a bucket whose members are all one raw sha is identical bytes and is
       already reported by the raw arm above, so reporting it again would double-count
       the same corroboration. This arm is exactly the duplicate the raw arm cannot
       see — same substance, different viewstate/boilerplate. */
    const rawShas = new Set(idx.map((i) => docs[i] && docs[i].capture && docs[i].capture.sha256).filter(Boolean));
    if (rawShas.size < 2) continue;
    findings.push(f('C-18.3', 'error', `${idx.length} register documents (indices ${idx.join(', ')}) share the evidentiary digest ${e.slice(0, 16)}… but differ in raw bytes; the substance is identical and only per-render machinery or furniture differs — corroboration on one entry, never duplicate review items`,
      ['fold the duplicates into corroborations[] on the earliest entry', 'if the substance genuinely differs the normalisation is wrong — correct the handler']));
  }
  if (ctx.fm.criticality === 'crucial') {
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (!d || typeof d !== 'object') continue;
      if (!d.co_archive && !d.timestamp) {
        findings.push(f('C-18.4', 'warn', `crucial-criticality document[${i}] (${d.file || '?'}) carries neither co_archive nor timestamp; a reviewing member must verify co-attestation before release (F4)`,
          ['attach a co-archive or trusted timestamp', 'record the verified provenance in Review Notes at ratification']));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// information@2 (M3' member submissions): the register contract extended by
// the schema bump taken once. C-18.1 gains the @2 shapes (mandatory register,
// capture encoding, custody for member-origin documents, attestation_attempts,
// parts, derived, releases); C-18.6 verifies registered capture hashes against
// stored bytes (decode-at-promotion means bytes at rest hash directly; legacy
// base64 decodes first); C-18.7 stages the doctrine 4a release signature
// (detached SSH signature, ssh-keygen -Y, namespace bio-release) as a warning
// until member keys are distributed. Scoped by schema stamp: information@1
// bundles keep the v1 contract per spec Section 8 check versioning.
// ---------------------------------------------------------------------------

const CAPTURE_ENCODINGS = ['utf8', 'base64', 'binary'];
const HIST_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const RAW_SHA_RE = /^[0-9a-f]{64}$/;

/** Portable base64 decode (no Buffer, no atob): verifies legacy .b64 files
 *  in Node, the browser, and the Apps Script embed alike. */
export function b64ToBytes(s) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = String(s).replace(/[\s=]+/g, '');
  const out = new Uint8Array(Math.floor(clean.length * 3 / 4));
  let o = 0, buf = 0, bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const v = A.indexOf(clean[i]);
    if (v === -1) throw new Error('invalid base64 at position ' + i);
    buf = (buf << 6) | v; bits += 6;
    if (bits >= 8) { bits -= 8; out[o++] = (buf >> bits) & 0xff; }
  }
  return out.subarray(0, o);
}

/** Incremental SHA-256 (FIPS 180-4), pure JS, Uint8Array-native, zero
 *  dependencies: one byte per element end to end, no platform digest, no
 *  signed-byte conversion. Exists so oversize multi-part captures stream
 *  through the hash one part at a time (KICKOFF-P2M6 4a: the whole-file
 *  reassembly plus Apps Script's number-array digest input materialized
 *  ~8 bytes per content byte and OOMed the promotion of the 39.6MB budget
 *  book). update() accepts Uint8Array or any byte array-like (values are
 *  coerced mod 256, so Apps Script signed bytes agree); hex() finalizes.
 *  Battery-cross-validated against WebCrypto on multiple sizes and chunk
 *  boundary offsets: a wrong hash here would silently corrupt every gate
 *  verdict, so the battery is load-bearing, not decorative. */
export function createSha256() {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let h0 = 0x6a09e667 | 0, h1 = 0xbb67ae85 | 0, h2 = 0x3c6ef372 | 0, h3 = 0xa54ff53a | 0;
  let h4 = 0x510e527f | 0, h5 = 0x9b05688c | 0, h6 = 0x1f83d9ab | 0, h7 = 0x5be0cd19 | 0;
  const buf = new Uint8Array(64);
  const w = new Int32Array(64);
  let bufLen = 0;
  let total = 0;       // message length in bytes (< 2^53, ample for the store)
  let finalized = false;

  function compress(bytes, off) {
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
      off += 4;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f2 = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f2) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f2; f2 = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f2) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  return {
    /** Feed a chunk of bytes. Chainable. */
    update(chunk) {
      if (finalized) throw new Error('sha256 stream already finalized');
      let c = chunk;
      if (!(c instanceof Uint8Array)) c = Uint8Array.from(c);   // signed bytes coerce mod 256
      let i = 0;
      const n = c.length;
      total += n;
      if (bufLen > 0) {                                          // top up a partial block
        while (bufLen < 64 && i < n) buf[bufLen++] = c[i++];
        if (bufLen === 64) { compress(buf, 0); bufLen = 0; }
      }
      while (n - i >= 64) { compress(c, i); i += 64; }           // full blocks, no copy
      while (i < n) buf[bufLen++] = c[i++];                      // tail into the buffer
      return this;
    },
    /** Finalize and return the lowercase hex digest. */
    hex() {
      if (finalized) throw new Error('sha256 stream already finalized');
      finalized = true;
      const bitHi = Math.floor(total / 0x20000000);              // total*8 >>> 32
      const bitLo = (total % 0x20000000) * 8;                    // low 32 bits of total*8
      buf[bufLen++] = 0x80;
      if (bufLen > 56) { while (bufLen < 64) buf[bufLen++] = 0; compress(buf, 0); bufLen = 0; }
      while (bufLen < 56) buf[bufLen++] = 0;
      buf[56] = (bitHi >>> 24) & 0xff; buf[57] = (bitHi >>> 16) & 0xff;
      buf[58] = (bitHi >>> 8) & 0xff; buf[59] = bitHi & 0xff;
      buf[60] = (bitLo >>> 24) & 0xff; buf[61] = (bitLo >>> 16) & 0xff;
      buf[62] = (bitLo >>> 8) & 0xff; buf[63] = bitLo & 0xff;
      compress(buf, 0);
      let out = '';
      const H = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let i = 0; i < 8; i++) {
        const v = H[i] >>> 0;
        out += ('00000000' + v.toString(16)).slice(-8);
      }
      return out;
    }
  };
}

/** Stored value to hashable input: base64 decodes to raw bytes; utf8 and
 *  binary hash as stored (ctx.sha256 accepts string or bytes, so the Apps
 *  Script embed, which reads text files as strings, needs no TextEncoder). */
function storedToHashable(v, encoding) {
  if (encoding === 'base64') return b64ToBytes(asText(v));
  return v;
}

async function checkInfo2Contract(ctx, findings) {
  if (ctx.fm?.object_type !== 'information' || ctx.fm?.schema !== 'information@2') return;
  const raw = ctx.files.get('data/provenance.json');
  if (!raw) {
    findings.push(f('C-18.1', 'error', 'information@2 requires data/provenance.json: the schema bump makes the intake provenance register mandatory'));
    return;
  }
  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return; // C-18.1 v1 shape check reports
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i]; if (!d || typeof d !== 'object') continue;
    const cap = d.capture && typeof d.capture === 'object' ? d.capture : {};
    if (!CAPTURE_ENCODINGS.includes(cap.encoding)) {
      findings.push(f('C-18.1', 'error', `provenance documents[${i}].capture.encoding '${cap.encoding}' is not one of: ${CAPTURE_ENCODINGS.join(', ')} (@2)`));
    }
    const or = d.origin && typeof d.origin === 'object' ? d.origin : {};
    if (or.kind === 'member') {
      if (cap.actor_class !== 'member') {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin capture must record actor_class 'member' (@2)`));
      }
      const c = d.custody;
      if (!c || typeof c !== 'object') {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing custody block {holder, obtained, setting, attestation} (doctrine 3a) (@2)`));
      } else {
        for (const k of ['holder', 'setting', 'attestation']) {
          if (!c[k]) findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody missing '${k}' (@2)`));
        }
        if (!HIST_TS_RE.test(c.obtained || '')) {
          findings.push(f('C-18.1', 'error', `provenance documents[${i}].custody.obtained '${c.obtained}' is not YYYY-MM-DDTHH:MM:SSZ (@2)`));
        }
      }
      if (d.attestation_attempts === undefined) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}]: member-origin document missing attestation_attempts; the 7.7 asymmetry is recorded honestly, attempted false with the reason in note (@2)`));
      }
    }
    if (d.attestation_attempts !== undefined) {
      if (!Array.isArray(d.attestation_attempts)) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts must be an array (@2)`));
      } else {
        d.attestation_attempts.forEach((a, j) => {
          if (!a || typeof a !== 'object' || !a.service || typeof a.attempted !== 'boolean' || typeof a.ok !== 'boolean') {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].attestation_attempts[${j}] lacks the {service, attempted, ok} shape (@2)`));
          }
        });
      }
    }
    if (d.parts !== undefined) {
      if (!Array.isArray(d.parts) || !d.parts.length) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts must be a nonempty array (@2)`));
      } else {
        if (!RAW_SHA_RE.test(cap.sha256 || '')) {
          findings.push(f('C-18.1', 'error', `provenance documents[${i}]: parts require capture.sha256 over the reassembled whole (@2)`));
        }
        d.parts.forEach((p, j) => {
          if (!p || typeof p !== 'object' || !p.file || !RAW_SHA_RE.test(p.sha256 || '') || !(Number.isInteger(p.bytes) && p.bytes > 0)) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] lacks the {file, sha256, bytes} shape (@2)`));
          } else if (!hasFile_(ctx, String(p.file))) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].parts[${j}] names '${p.file}' which does not exist in the bundle (@2)`));
          }
        });
      }
    }
    if (d.derived !== undefined) {
      const dv = d.derived;
      const shapeOk = dv && typeof dv === 'object' && dv.transform && dv.reason && (dv.from_file || dv.from_ref);
      if (!shapeOk) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived lacks the {transform, reason, from_file|from_ref} shape (doctrine 4a) (@2)`));
      } else if (dv.from_file && !hasFile_(ctx, String(dv.from_file))) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].derived.from_file '${dv.from_file}' does not exist in the bundle (@2)`));
      }
    }
    /* Renditions: artifacts derived FROM this document, which is the opposite
       direction from `derived` above and needs saying separately. Capture
       fidelity (0.36.0) introduces two, the script-stripped render companion
       and the snapshot manifest that resolves its placeholders.
       *
       * The shape is enforced rather than advisory for one reason: a rendition
       * is a file that LOOKS like the source and is not the source. If it can
       * sit in a bundle without naming what was done to it, what it was made
       * from, and its own hash, then a rendering and a capture become
       * indistinguishable inside the record, which is the single thing the
       * grading scheme exists to prevent. */
    if (d.renditions !== undefined) {
      if (!Array.isArray(d.renditions)) {
        findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions must be an array (@2)`));
      } else {
        d.renditions.forEach((r, j) => {
          if (!r || typeof r !== 'object' || !r.file || !RAW_SHA_RE.test(r.sha256 || '') || !r.transform || !r.reason || !r.from_file) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] lacks the {file, sha256, transform, reason, from_file} shape: a derived artifact must say what was done to it, why, and what it was made from (@2)`));
            return;
          }
          if (!hasFile_(ctx, String(r.file))) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] names '${r.file}' which does not exist in the bundle (@2)`));
          }
          if (!hasFile_(ctx, String(r.from_file)) && !Array.isArray(d.parts)) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}].from_file '${r.from_file}' does not exist in the bundle (@2)`));
          }
          if (r.sha256 === cap?.sha256) {
            findings.push(f('C-18.1', 'error', `provenance documents[${i}].renditions[${j}] has the same hash as the capture it claims to be derived from, so one of the two is mislabelled (@2)`));
          }
        });
      }
    }
  }
  if (reg.releases !== undefined) {
    if (!Array.isArray(reg.releases)) {
      findings.push(f('C-18.1', 'error', 'provenance releases must be an array (@2)'));
    } else {
      reg.releases.forEach((r, i) => {
        if (!r || typeof r !== 'object' || !HIST_TS_RE.test(r.transition || '') || !r.author) {
          findings.push(f('C-18.1', 'error', `provenance releases[${i}] lacks the {transition, author} shape (@2)`));
          return;
        }
        if (r.signature_file) {
          if (!hasFile_(ctx, String(r.signature_file))) {
            findings.push(f('C-18.1', 'error', `provenance releases[${i}].signature_file '${r.signature_file}' does not exist in the bundle (@2)`));
          }
          if (!r.signer) findings.push(f('C-18.1', 'error', `provenance releases[${i}] carries a signature_file but no signer (@2)`));
          if (r.namespace !== 'bio-release') {
            findings.push(f('C-18.1', 'error', `provenance releases[${i}].namespace '${r.namespace}' must be 'bio-release' (ssh-keygen -Y namespace discipline) (@2)`));
          }
        }
      });
    }
  }
  // C-18.7 (warn): the staged posture until member keys are distributed.
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const rels = Array.isArray(reg.releases) ? reg.releases : [];
  for (const e of hist) {
    if (!e || e.from_state !== 'collected' || e.to_state !== 'verified') continue;
    const signed = rels.some(r => r && r.transition === e.timestamp && r.signature_file);
    if (!signed) {
      findings.push(f('C-18.7', 'warn', `collected -> verified transition at ${e.timestamp} has no signed release record; the target mechanism is a detached SSH signature over the transition record (ssh-keygen -Y sign, namespace bio-release; doctrine 4a)`,
        ['sign the transition record and add the releases[] entry with signature_file, signer, namespace', 'record the interim member review of the release log in Review Notes']));
    }
  }
  // C-18.6 (error): registered capture hashes verify against stored bytes.
  // 1.11.0 (KICKOFF-P2M6 4a): byte-stored parts stream through the
  // incremental SHA-256 one part at a time, decoded per part for legacy
  // base64, so peak residency is a single part, never the reassembled
  // whole. Text-stored parts keep the join path (Apps Script text reads
  // are strings and hash natively over UTF-8; no TextEncoder dependency).
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i]; if (!d || typeof d !== 'object') continue;
    const cap = d.capture && typeof d.capture === 'object' ? d.capture : {};
    if (!RAW_SHA_RE.test(cap.sha256 || '') || !CAPTURE_ENCODINGS.includes(cap.encoding)) continue;
    let hashable = null;
    let actual = null;
    try {
      if (Array.isArray(d.parts) && d.parts.length && d.parts.every(p => p && p.file && ctx.files.has(String(p.file)))) {
        const stored = d.parts.map(p => ctx.files.get(String(p.file)));
        const textStored = v => cap.encoding !== 'base64' && typeof v === 'string';
        if (stored.every(v => textStored(v))) {
          hashable = stored.join('');
        } else if (stored.every(v => !textStored(v))) {
          const h = createSha256();
          for (const v of stored) h.update(cap.encoding === 'base64' ? b64ToBytes(asText(v)) : v);
          actual = h.hex();
        } else {
          throw new Error('parts mix text and binary storage');
        }
      } else if (d.file && ctx.files.has(String(d.file))) {
        hashable = storedToHashable(ctx.files.get(String(d.file)), cap.encoding);
      }
    } catch (err) {
      findings.push(f('C-18.6', 'error', `provenance documents[${i}]: stored content could not be decoded for hash verification (${err && err.message}) (@2)`));
      continue;
    }
    if (actual === null) {
      if (hashable === null) continue;
      actual = await ctx.sha256(hashable);
    }
    if (actual !== cap.sha256) {
      findings.push(f('C-18.6', 'error', `provenance documents[${i}]: stored bytes hash ${actual.slice(0, 12)}… but the register records ${String(cap.sha256).slice(0, 12)}…; silent content mutation fails the gate (@2)`,
        ['restore the capture from history', 'correct the register only if the recorded hash was wrong at intake, with a Session Log entry']));
    }
  }
}

/** C-18.5 (error): data/gathering.json field grammar. A leaked write token can
 *  litter the queue but never steer a member's session: the exporter renders
 *  these fields as quoted data, and this grammar bounds what they can carry
 *  (F5, doctrine 0.7). Scoped by declared contract: enforced only where the
 *  file is present. */
/* 1.16.6: exported. The gate already ran this at ratification, but a queue
   entry that cannot steer a session can still waste a member's attention, and a
   request refused at the WRITE never lands at all. Exporting the existing
   function is how the plane refuses at write without reimplementing the grammar,
   which would be a second grammar pretending to be the same one. */
export function checkGatheringGrammar(ctx, findings) {
  const raw = ctx.files.get('data/gathering.json');
  if (!raw) return;
  let g;
  try { g = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  if (typeof g !== 'object' || g === null || Array.isArray(g)) {
    findings.push(f('C-18.5', 'error', 'data/gathering.json must be a JSON object'));
    return;
  }
  if (g.daemon !== undefined) {
    const dmn = g.daemon;
    if (typeof dmn !== 'object' || dmn === null || Array.isArray(dmn)) {
      findings.push(f('C-18.5', 'error', 'gathering.json daemon block must be an object'));
    } else {
      if (typeof dmn.enabled !== 'boolean') findings.push(f('C-18.5', 'error', 'gathering.json daemon.enabled must be boolean'));
      for (const bk of ['tick_budget', 'sweep_budget']) {
        if (dmn[bk] !== undefined && !(Number.isInteger(dmn[bk]) && dmn[bk] >= 0)) {
          findings.push(f('C-18.5', 'error', `gathering.json daemon.${bk} must be a non-negative integer`));
        }
      }
    }
  }
  const reqs = Array.isArray(g.requests) ? g.requests : [];
  for (let i = 0; i < reqs.length; i++) {
    const r = reqs[i];
    if (typeof r !== 'object' || r === null) { findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] is not an object`)); continue; }
    if (!GATH_ID_RE.test(r.id || '')) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].id '${r.id}' does not match the GATH grammar`));
    const tgt = r.target;
    if (!tgt || typeof tgt !== 'object') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] missing target block`));
    else {
      if (typeof tgt.text !== 'string' || tgt.text.length === 0 || tgt.text.length > 200 || /[\r\n]/.test(tgt.text)) {
        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.text must be a nonempty single-line string under 200 chars`));
      }
      if (tgt.description !== undefined && (typeof tgt.description !== 'string' || tgt.description.length > 2000)) {
        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.description must be a string under 2000 chars`));
      }
    }
    const locs = Array.isArray(r.locators) ? r.locators : null;
    if (!locs || locs.length === 0) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators must be a nonempty array`));
    else for (let L = 0; L < locs.length; L++) {
      if (!isPublicHttpsLocator(locs[L])) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators[${L}] '${String(locs[L]).slice(0, 40)}' is not an https public-host locator`));
    }
    if (typeof r.authority !== 'string' || r.authority.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].authority must be a nonempty string`));
    if (!CRITICALITY_ENUM.includes(r.criticality)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].criticality must be one of: ${CRITICALITY_ENUM.join(', ')}`));
    if (r.cadence !== undefined && !CADENCE_ENUM.includes(r.cadence)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].cadence must be one of: ${CADENCE_ENUM.join(', ')}`));
    if (!GATH_STATUS_ENUM.includes(r.status)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].status must be one of: ${GATH_STATUS_ENUM.join(', ')}`));
    if (r.planted !== undefined && !ISO_TS_RE.test(r.planted)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].planted must be an ISO 8601 UTC instant`));
  }
  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
  for (let i = 0; i < sweeps.length; i++) {
    const s = sweeps[i];
    if (typeof s !== 'object' || s === null) { findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}] is not an object`)); continue; }
    if (typeof s.id !== 'string' || s.id.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].id must be a nonempty string`));
    if (s.ratified !== undefined && typeof s.ratified !== 'boolean') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].ratified must be boolean`));
    if (s.sources !== undefined) {
      if (!Array.isArray(s.sources)) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources must be an array`));
      else for (let L = 0; L < s.sources.length; L++) if (!isPublicHttpsLocator(s.sources[L])) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources[${L}] is not an https public-host locator`));
    }
  }
}

const TASK_ID_RE = /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
const TASK_KIND_ENUM = ['authority-undetermined'];
const TASK_ROLE_ENUM = ['project-manager', 'group-admin', 'member'];
const TASK_STATUS_ENUM = ['open', 'resolved', 'forwarded'];
const TASK_EVENT_ENUM = ['created', 'forwarded', 'resolved', 'folded'];
const MEMBER_ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** C-19.1 (error): data/inbox.json task grammar (D-98, INBOX-GRAMMAR.md).
 *
 *  A SIBLING of C-18.5, not a new kind of thing. Bob's ruling puts an
 *  undetermined-authority capture in front of a member, and says the transport
 *  MIGHT ONE DAY BE EMAIL. That clause is the whole reason this is a grammar
 *  and not a table: an email renders in a client we do not control, where a
 *  plausible-looking instruction is exactly what phishing is. So the F5 split
 *  that governs the gathering queue governs this file unchanged: fields a
 *  member READS are length-bounded and newline-free so the exporter renders
 *  them as inert quoted data, and fields a MACHINE acts on are enum- or
 *  pattern-bounded so a malformed value is refused rather than obeyed.
 *
 *  Every bound below copies the C-18.5 pattern for the same kind of field
 *  rather than a similar one, and `refers_to` reuses BUNDLE_ID_RE, the C-1.2
 *  validator, rather than restating the canonical ID grammar. A second grammar
 *  pretending to be the same one is the mistake checkGatheringGrammar's own
 *  comment warns against.
 *
 *  Scoped by declared contract: enforced only where the file is present.
 *  Exported for the same reason checkGatheringGrammar is: the gate runs it at
 *  ratification, and the plane runs THIS function at the write, so a malformed
 *  task never lands and never costs a member the attention of reading it. */
export function checkInboxGrammar(ctx, findings) {
  const raw = ctx.files.get('data/inbox.json');
  if (!raw) return;
  let g;
  try { g = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  if (typeof g !== 'object' || g === null || Array.isArray(g)) {
    findings.push(f('C-19.1', 'error', 'data/inbox.json must be a JSON object'));
    return;
  }
  const tasks = Array.isArray(g.tasks) ? g.tasks : null;
  if (g.tasks !== undefined && !tasks) {
    findings.push(f('C-19.1', 'error', 'inbox.json tasks must be an array'));
    return;
  }
  const seen = new Set();
  for (let i = 0; i < (tasks || []).length; i++) {
    const tk = tasks[i];
    if (typeof tk !== 'object' || tk === null) { findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] is not an object`)); continue; }

    if (!TASK_ID_RE.test(tk.id || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].id '${tk.id}' does not match the TASK grammar`));
    else if (seen.has(tk.id)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] repeats id '${tk.id}'`));
    else seen.add(tk.id);

    if (!TASK_KIND_ENUM.includes(tk.kind)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].kind '${tk.kind}' must be one of: ${TASK_KIND_ENUM.join(', ')}`));

    /* The two fields a member actually reads. Bounded exactly as C-18.5 bounds
       target.text and target.description, character for character. */
    const sub = tk.subject;
    if (!sub || typeof sub !== 'object') findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] missing subject block`));
    else {
      if (typeof sub.text !== 'string' || sub.text.length === 0 || sub.text.length > 200 || /[\r\n]/.test(sub.text)) {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].subject.text must be a nonempty single-line string under 200 chars`));
      }
      if (sub.description !== undefined && (typeof sub.description !== 'string' || sub.description.length > 2000)) {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].subject.description must be a string under 2000 chars`));
      }
    }

    /* The task points AT a bundle, so this is the canonical ID grammar and not
       a locator. A substrate path here would be the C-6.1 mistake. */
    if (!BUNDLE_ID_RE.test(tk.refers_to || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].refers_to '${String(tk.refers_to).slice(0, 40)}' is not a canonical bundle ID`));
    } else if (ctx.resolveTarget && !ctx.resolveTarget(tk.refers_to)) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].refers_to '${tk.refers_to}' does not resolve in the store`,
        ['re-point the task at the successor bundle', 'resolve the task with a reason if its subject is gone']));
    }

    if (tk.locators !== undefined) {
      if (!Array.isArray(tk.locators)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].locators must be an array`));
      else for (let L = 0; L < tk.locators.length; L++) {
        if (!isPublicHttpsLocator(tk.locators[L])) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].locators[${L}] '${String(tk.locators[L]).slice(0, 40)}' is not an https public-host locator`));
      }
    }

    if (tk.assignee !== 'unassigned' && !MEMBER_ID_RE.test(tk.assignee || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].assignee '${tk.assignee}' must be a member_id or the literal 'unassigned'`));
    }
    if (!TASK_ROLE_ENUM.includes(tk.assignee_role)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].assignee_role '${tk.assignee_role}' must be one of: ${TASK_ROLE_ENUM.join(', ')}`));
    if (!TASK_STATUS_ENUM.includes(tk.status)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].status '${tk.status}' must be one of: ${TASK_STATUS_ENUM.join(', ')}`));

    if (!ISO_TS_RE.test(tk.created || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].created must be an ISO 8601 UTC instant`));
    if (tk.resolved_at !== undefined && tk.resolved_at !== null && !ISO_TS_RE.test(tk.resolved_at)) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].resolved_at must be an ISO 8601 UTC instant`));
    }
    /* A resolved task without the instant it resolved at is a status nobody can
       audit, which is the same class of defect as a clock entry silently past
       due (C-11.1). */
    if (tk.status === 'resolved' && !ISO_TS_RE.test(tk.resolved_at || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] is resolved but carries no resolved_at instant`));
    }

    /* Append-only, and shaped exactly like a member_expertise row: what
       happened, who did it, when. Who a task was taken FROM is as much a fact
       as who holds it now, so a forward ADDS here and never rewrites. */
    const hist = tk.history;
    if (!Array.isArray(hist) || hist.length === 0) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history must be a nonempty append-only array`));
    } else {
      let prev = '';
      for (let h = 0; h < hist.length; h++) {
        const e = hist[h];
        if (typeof e !== 'object' || e === null) { findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}] is not an object`)); continue; }
        if (!ISO_TS_RE.test(e.at || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].at must be an ISO 8601 UTC instant`));
        else { if (prev && e.at < prev) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}] is out of chronological order`)); prev = e.at; }
        if (!TASK_EVENT_ENUM.includes(e.event)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].event '${e.event}' must be one of: ${TASK_EVENT_ENUM.join(', ')}`));
        /* The actor is a name a member reads beside an event, so it is bounded
           like one rather than left free. */
        if (typeof e.actor !== 'string' || e.actor.length === 0 || e.actor.length > 64 || /[\r\n]/.test(e.actor)) {
          findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].actor must be a nonempty single-line string under 64 chars`));
        }
      }
      if (hist[0] && hist[0].event !== 'created') {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history does not begin with its creation`));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// C-20.1: the mechanical-writer diff-conformance auditor (I-20, State Rules
// v1.5 draft; daemon slate Section 0). For any history promotion record marked
// writer 'mechanical', the promoted diff (decidable from the history snapshots)
// must stay within the operation's declared field set plus append-only
// surfaces; the body change must be confined to the Session Log; and the files
// touched must be a subset of the mechanical envelope. The field-set tables
// live here (the registry), amended only by revision, never by code change.
// ---------------------------------------------------------------------------

/** Per-operation closed field sets (daemon slate Section 0). last_updated
 *  rides every mutating set: write-completeness law (C-12.1, C-13.2) makes it
 *  inseparable from any update. Frontmatter paths in dotted form; 'clock[]'
 *  denotes clock entry fields. */
export const MECHANICAL_FIELD_SETS = {
  'monitor-tick': ['source_status', 'monitoring.last_checked', 'reeval_pending.flag', 'reeval_pending.since', 'reeval_pending.source', 'last_updated'],
  'sweep': [],
  'deadline-recheck': ['clock[].status', 'last_updated'],
  'member-attest': ['last_updated']
};
/** Append-only file surfaces a mechanical writer may add to (beyond bundle.md
 *  and the history/snapshot machinery the promoter itself writes). */
/* data/snapshot-manifest.json joins the envelope with capture fidelity (0.36.0).
   It is generated by the same act that writes the snapshot itself: a derived,
   content-addressed index mapping the render companion's placeholders to
   captures. A sweeping daemon that may write snapshots/ but not the manifest
   could capture a page's stylesheets and then not be able to say which bytes
   were which, so the fidelity work would be reachable only by hand. It carries
   no judgement and no prose, which is the property that keeps the mechanical
   envelope meaningful. */
const MECHANICAL_APPEND_FILES = ['data/changes.json', 'data/provenance.json', 'data/snapshot-manifest.json'];

/** Flatten frontmatter to dotted scalar paths for diffing. Arrays that carry
 *  objects with a status field (clock) get 'key[].field' treatment; other
 *  arrays and maps compare by canonical JSON at the top key. */
function flattenFm(fm) {
  const out = {};
  if (!fm || typeof fm !== 'object') return out;
  for (const k of Object.keys(fm)) {
    const v = fm[k];
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      for (const c of Object.keys(v)) out[k + '.' + c] = canonicalJson(v[c]);
    } else {
      out[k] = canonicalJson(v);
    }
  }
  return out;
}

/** The set of dotted frontmatter paths whose values differ between two
 *  snapshots. clock arrays are compared elementwise on status. */
function fmDiffPaths(prevFm, nextFm) {
  const changed = new Set();
  const a = flattenFm(prevFm), b = flattenFm(nextFm);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (k === 'clock') {
      const pc = Array.isArray(prevFm.clock) ? prevFm.clock : [];
      const nc = Array.isArray(nextFm.clock) ? nextFm.clock : [];
      const n = Math.max(pc.length, nc.length);
      for (let i = 0; i < n; i++) {
        const pe = pc[i] || {}, ne = nc[i] || {};
        for (const field of new Set([...Object.keys(pe), ...Object.keys(ne)])) {
          if (canonicalJson(pe[field]) !== canonicalJson(ne[field])) changed.add('clock[].' + field);
        }
      }
      continue;
    }
    if (a[k] !== b[k]) changed.add(k);
  }
  return changed;
}

/** Section bodies keyed by heading, for confinement of the body change. */
function bodySections(body) {
  const out = {};
  const re = /^## .*$/gm;
  let m, starts = [];
  while ((m = re.exec(body)) !== null) starts.push({ h: m[0].trimEnd(), i: m.index });
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1].i : body.length;
    out[starts[i].h] = body.slice(starts[i].i, end);
  }
  return out;
}

/** C-20.1 (error): mechanical-writer diff conformance. Reads the history
 *  manifest and the verbatim promotion records; for each mechanical entry with
 *  a recoverable pre-snapshot, asserts the diff against the declared envelope. */
async function checkMechanicalConformance(ctx, findings) {
  const manRaw = ctx.files.get('_history/manifest.json');
  if (!manRaw) return;
  let man;
  try { man = JSON.parse(asText(manRaw)); } catch { return; } // C-12 reports
  const entries = Array.isArray(man.entries) ? [...man.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e.kind !== 'promotion' || !e.key) continue;
    const recRaw = ctx.files.get(`_history/promotion_${e.key}.json`);
    if (!recRaw) continue; // C-12.2 reports the missing record
    let rec;
    try { rec = JSON.parse(asText(recRaw)); } catch { continue; }
    const man2 = rec.manifest || rec;
    const writer = man2.writer || rec.writer;
    if (writer !== 'mechanical') continue;
    const op = man2.operation || rec.operation;
    if (!op || !(op in MECHANICAL_FIELD_SETS)) {
      findings.push(f('C-20.1', 'error', `history entry '${e.key}' is marked mechanical but names undeclared operation '${op}'`,
        ['a mechanical promotion must name a registered operation', 'if hand-authored, remove the mechanical marker']));
      continue;
    }
    // Snapshot convention (the promoter, step 4): `bundle_<key>.md` is the
    // PRE-image the promotion keyed <key> took before writing. The state
    // BEFORE e is therefore e's OWN snapshot (absent for a creation), and
    // the state AFTER e is the pre-snapshot of the next promotion that
    // touched bundle.md, or live when no later promotion touched it. A gap
    // (a later bundle.md-touching promotion whose snapshot is missing)
    // makes e's post state unknowable: skip rather than blame live state.
    // (1.10.1: the prior indexing read shifted snapshots and fell back to
    // live unconditionally, misattributing later member elevations to
    // mechanical creations and refusing valid packages.)
    const preSnapPath = `_history/bundle_${e.key}.md`;
    const preSnap = ctx.files.has(preSnapPath) ? ctx.files.get(preSnapPath) : null;
    const base = man2.base;
    const isCreation = base === EMPTY_STRING_SHA || preSnap === null;
    let postRaw = null, postUnknowable = false;
    for (let j = i + 1; j < entries.length; j++) {
      const p = `_history/bundle_${entries[j].key}.md`;
      if (ctx.files.has(p)) { postRaw = ctx.files.get(p); break; }
      if ((entries[j].files || []).includes('bundle.md')) { postUnknowable = true; break; }
    }
    if (postRaw === null && !postUnknowable) {
      // Tail (1.12.0): live is e's post state ONLY while live still hashes
      // to the bundle.md sha e's own verbatim record wrote. A live file
      // that has moved past e (a pending member edit entering the gate
      // image, an unrecorded change) is NOT e's doing: skip rather than
      // blame, the 1.10.1 principle. Without this, the first member edit
      // gated over a tail mechanical promotion is misattributed to it and
      // refused. The recorded sha is the same evidence classifyDivergence
      // anchor form (b) already trusts.
      const liveRaw = ctx.files.get('bundle.md');
      if (liveRaw) {
        const rb = Array.isArray(man2.files) ? man2.files.find(x => x.name === 'bundle.md') : null;
        if (rb && rb.sha256) {
          const liveHash = await ctx.sha256(liveRaw);
          if (liveHash === rb.sha256) postRaw = liveRaw; else postUnknowable = true;
        } else {
          postRaw = liveRaw;
        }
      }
    }
    if (!postRaw) continue;
    const post = parseFrontmatter(asText(postRaw));
    if (isCreation) {
      if (post.data && post.data.current_state && post.data.current_state !== 'collected' && post.data.object_type === 'information') {
        findings.push(f('C-20.1', 'error', `mechanical creation '${e.key}' lands at '${post.data.current_state}', not collected (daemon creations never elevate)`,
          ['re-produce the creation at collected', 'if a member released it, the release transition must be a separate member-authored promotion']));
      }
      continue;
    }
    const prev = parseFrontmatter(asText(preSnap));
    const allowed = new Set(MECHANICAL_FIELD_SETS[op]);
    const changed = fmDiffPaths(prev.data || {}, post.data || {});
    for (const path of changed) {
      if (!allowed.has(path)) {
        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' changed frontmatter '${path}', outside its declared field set {${[...allowed].join(', ')}}`,
          ['revert the out-of-envelope change', 'if the change is legitimate, it belongs to a member-authored promotion, not a mechanical one']));
      }
    }
    // Body change confined to the Session Log section.
    const prevSec = bodySections(prev.body || ''), postSec = bodySections(post.body || '');
    for (const h of new Set([...Object.keys(prevSec), ...Object.keys(postSec)])) {
      if (h === '## Session Log') continue;
      if ((prevSec[h] || '') !== (postSec[h] || '')) {
        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' changed body section '${h}'; a mechanical writer touches only the Session Log`,
          ['revert the body change outside the Session Log']));
      }
    }
    // Files touched: subset of the mechanical envelope.
    const touched = Array.isArray(man2.files) ? man2.files.map(x => x.name) : [];
    for (const name of touched) {
      const ok = name === 'bundle.md' || name.startsWith('snapshots/') || MECHANICAL_APPEND_FILES.includes(name);
      if (!ok) {
        findings.push(f('C-20.1', 'error', `mechanical '${op}' promotion '${e.key}' wrote '${name}', outside the mechanical envelope (bundle.md, snapshots/, ${MECHANICAL_APPEND_FILES.join(', ')})`,
          ['revert the out-of-envelope write']));
      }
    }
  }
}

const EMPTY_STRING_SHA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// ---------------------------------------------------------------------------
// Release-signature primitives (D2.1). Ed25519 verification, SSHSIG parsing,
// and allowed_signers parsing, for the C-18.8 release check.
//
// Why these are hand-written here rather than called from a platform API:
// the gate runs from ONE source in three environments (node, the browser,
// and the Apps Script embed), and Apps Script has no Ed25519 anywhere. Its
// entire cryptographic surface is Utilities.computeDigest,
// computeHmacSha256Signature, and computeRsaSha256Signature, the last of
// which signs rather than verifies. createSha256 above is the precedent and
// the template, including its battery discipline.
//
// Why NO BigInt: field arithmetic here uses Float64Array limbs, not BigInt,
// deliberately. BigInt is ES2020 and Apps Script's V8 nominally supports
// modern ECMAScript, but its BigInt behavior has been reported unreliable in
// that environment and we could not confirm it. A verifier that silently
// misbehaves in one runtime is worse than no verifier, because it converts a
// refusal into a false assurance. Float64Array with 16-bit limbs is the
// portable, long-proven representation and depends on nothing past ES5.
//
// SHA-512 is INJECTED, never implemented: it exists natively everywhere the
// gate runs (node crypto, WebCrypto, and Utilities.DigestAlgorithm.SHA_512),
// so porting it would add risk for no gain. Same pattern as ctx.sha256.
// ---------------------------------------------------------------------------

const D2 = new Float64Array([
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
]);
const DD = new Float64Array([
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
]);
const GF0 = new Float64Array(16);
const GF1 = (() => { const g = new Float64Array(16); g[0] = 1; return g; })();
const I25 = new Float64Array([
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
]);
/** The curve base point, as (X, Y). */
const BX = new Float64Array([
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
]);
const BY = new Float64Array([
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
]);
/** The group order L, little-endian bytes. */
const ORDER_L = new Float64Array([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,
  0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0x10
]);

function gf(init) {
  const r = new Float64Array(16);
  if (init) for (let i = 0; i < init.length; i++) r[i] = init[i];
  return r;
}
function fAdd(o, a, b) { for (let i = 0; i < 16; i++) o[i] = a[i] + b[i]; }
function fSub(o, a, b) { for (let i = 0; i < 16; i++) o[i] = a[i] - b[i]; }
function car25519(o) {
  let c = 1, v;
  for (let i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c - 1 + 37 * (c - 1);
}
function fMul(o, a, b) {
  const t = new Float64Array(31);
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) t[i + j] += a[i] * b[j];
  for (let i = 0; i < 15; i++) t[i] += 38 * t[i + 16];
  for (let i = 0; i < 16; i++) o[i] = t[i];
  car25519(o); car25519(o);
}
function fSq(o, a) { fMul(o, a, a); }
function sel25519(p, q, b) {
  const c = ~(b - 1);
  for (let i = 0; i < 16; i++) { const t = c & (p[i] ^ q[i]); p[i] ^= t; q[i] ^= t; }
}
function pack25519(o, n) {
  const m = gf(), t = gf();
  for (let i = 0; i < 16; i++) t[i] = n[i];
  car25519(t); car25519(t); car25519(t);
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed;
    for (let i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1);
      m[i - 1] &= 0xffff;
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1);
    const b = (m[15] >> 16) & 1;
    m[14] &= 0xffff;
    sel25519(t, m, 1 - b);
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff;
    o[2 * i + 1] = t[i] >> 8;
  }
}
function neq25519(a, b) {
  const c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a); pack25519(d, b);
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= c[i] ^ d[i];
  return (1 & ((diff - 1) >>> 8)) - 1;   // 0 when equal
}
function par25519(a) { const d = new Uint8Array(32); pack25519(d, a); return d[0] & 1; }
function unpack25519(o, n) {
  for (let i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
  o[15] &= 0x7fff;
}
function inv25519(o, i) {
  const c = gf();
  for (let a = 0; a < 16; a++) c[a] = i[a];
  for (let a = 253; a >= 0; a--) { fSq(c, c); if (a !== 2 && a !== 4) fMul(c, c, i); }
  for (let a = 0; a < 16; a++) o[a] = c[a];
}
function pow2523(o, i) {
  const c = gf();
  for (let a = 0; a < 16; a++) c[a] = i[a];
  for (let a = 250; a >= 0; a--) { fSq(c, c); if (a !== 1) fMul(c, c, i); }
  for (let a = 0; a < 16; a++) o[a] = c[a];
}
/** Extended twisted Edwards point addition, p and q as [X, Y, Z, T]. */
function edAdd(p, q) {
  const a = gf(), b = gf(), c = gf(), d = gf(), e = gf(),
        f = gf(), g = gf(), h = gf(), t = gf();
  fSub(a, p[1], p[0]); fSub(t, q[1], q[0]); fMul(a, a, t);
  fAdd(b, p[0], p[1]); fAdd(t, q[0], q[1]); fMul(b, b, t);
  fMul(c, p[3], q[3]); fMul(c, c, D2);
  fMul(d, p[2], q[2]); fAdd(d, d, d);
  fSub(e, b, a); fSub(f, d, c); fAdd(g, d, c); fAdd(h, b, a);
  fMul(p[0], e, f); fMul(p[1], h, g); fMul(p[2], g, f); fMul(p[3], e, h);
}
function cswap(p, q, b) { for (let i = 0; i < 4; i++) sel25519(p[i], q[i], b); }
function scalarmult(p, q, s) {
  for (let i = 0; i < 16; i++) { p[0][i] = GF0[i]; p[1][i] = GF1[i]; p[2][i] = GF1[i]; p[3][i] = GF0[i]; }
  for (let i = 255; i >= 0; --i) {
    const b = (s[(i / 8) | 0] >> (i & 7)) & 1;
    cswap(p, q, b); edAdd(q, p); edAdd(p, p); cswap(p, q, b);
  }
}
function scalarbase(p, s) {
  const q = [gf(), gf(), gf(), gf()];
  for (let i = 0; i < 16; i++) { q[0][i] = BX[i]; q[1][i] = BY[i]; q[2][i] = GF1[i]; }
  fMul(q[3], BX, BY);
  scalarmult(p, q, s);
}
/** Decompress a packed public key to -P (the negated point verify needs). */
function unpackneg(r, p) {
  const t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
  for (let i = 0; i < 16; i++) { r[2][i] = GF1[i]; }
  unpack25519(r[1], p);
  fSq(num, r[1]); fMul(den, num, DD);
  fSub(num, num, r[2]); fAdd(den, r[2], den);
  fSq(den2, den); fSq(den4, den2); fMul(den6, den4, den2);
  fMul(t, den6, num); fMul(t, t, den);
  pow2523(t, t);
  fMul(t, t, num); fMul(t, t, den); fMul(t, t, den); fMul(r[0], t, den);
  fSq(chk, r[0]); fMul(chk, chk, den);
  if (neq25519(chk, num)) fMul(r[0], r[0], I25);
  fSq(chk, r[0]); fMul(chk, chk, den);
  if (neq25519(chk, num)) return -1;
  if (par25519(r[0]) === (p[31] >> 7)) fSub(r[0], GF0, r[0]);
  fMul(r[3], r[0], r[1]);
  return 0;
}
function modL(r, x) {
  let carry;
  for (let i = 63; i >= 32; --i) {
    carry = 0;
    let j = i - 32;
    for (; j < i - 12; ++j) {
      x[j] += carry - 16 * x[i] * ORDER_L[j - (i - 32)];
      carry = Math.floor((x[j] + 128) / 256);
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (let j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * ORDER_L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (let j = 0; j < 32; j++) x[j] -= carry * ORDER_L[j];
  for (let i = 0; i < 32; i++) { x[i + 1] += x[i] >> 8; r[i] = x[i] & 255; }
}
function reduce(r) {
  const x = new Float64Array(64);
  for (let i = 0; i < 64; i++) x[i] = r[i];
  for (let i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}

/**
 * Verify an Ed25519 signature (RFC 8032, verify only; no signing primitive
 * exists in this module and none should, since nothing in the store ever
 * signs server-side).
 * @param {Uint8Array} sig 64 bytes
 * @param {Uint8Array} msg the signed message
 * @param {Uint8Array} pub 32 bytes
 * @param {(b: Uint8Array) => Promise<Uint8Array>} sha512 injected, see header
 * @returns {Promise<boolean>}
 */
export async function ed25519Verify(sig, msg, pub, sha512) {
  if (!(sig && sig.length === 64) || !(pub && pub.length === 32)) return false;
  const p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
  if (unpackneg(q, pub)) return false;
  // Reject a non-canonical scalar S (signature malleability): S must be
  // strictly less than the group order L, compared big-endian from the top.
  for (let i = 31; i >= 0; i--) {
    if (sig[32 + i] > ORDER_L[i]) return false;
    if (sig[32 + i] < ORDER_L[i]) break;
    if (i === 0) return false;                 // S === L exactly
  }
  const pre = new Uint8Array(64 + msg.length);
  pre.set(sig.subarray(0, 32), 0);
  pre.set(pub, 32);
  pre.set(msg, 64);
  const h = await sha512(pre);
  const k = new Uint8Array(64);
  k.set(h);
  reduce(k);
  scalarmult(p, q, k);
  const s = new Uint8Array(32);
  s.set(sig.subarray(32, 64));
  const t = [gf(), gf(), gf(), gf()];
  scalarbase(t, s);
  edAdd(p, t);
  const packed = new Uint8Array(32);
  packEdwards(packed, p);
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= packed[i] ^ sig[i];
  return diff === 0;
}
function packEdwards(r, p) {
  const tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  fMul(tx, p[0], zi); fMul(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}

// --------------------------------------------------------------- SSHSIG ---

function be32(b, o) { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }

/** Read an ssh string (uint32 length then bytes). */
function sshStr(b, o) {
  if (o + 4 > b.length) throw new Error('sshsig: truncated length prefix');
  const n = be32(b, o);
  if (o + 4 + n > b.length) throw new Error('sshsig: string overruns buffer');
  return [b.subarray(o + 4, o + 4 + n), o + 4 + n];
}
function encStr(bytes) {
  const out = new Uint8Array(4 + bytes.length);
  out[0] = (bytes.length >>> 24) & 0xff; out[1] = (bytes.length >>> 16) & 0xff;
  out[2] = (bytes.length >>> 8) & 0xff;  out[3] = bytes.length & 0xff;
  out.set(bytes, 4);
  return out;
}
function ascii(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; }

const SSHSIG_BEGIN = '-----BEGIN SSH SIGNATURE-----';
const SSHSIG_END = '-----END SSH SIGNATURE-----';

/**
 * Parse an armored SSHSIG blob (OpenSSH PROTOCOL.sshsig).
 * Returns {keyType, publicKey, namespace, reserved, hashAlgorithm, sigType,
 * signature}. Throws on any structural defect; the caller treats a throw as
 * a refusal, never as a skip.
 */
export function parseSshSig(armored) {
  const text = String(armored || '').trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  if (lines.length < 3 || lines[0] !== SSHSIG_BEGIN || lines[lines.length - 1] !== SSHSIG_END) {
    throw new Error('sshsig: missing or malformed PEM armor');
  }
  const b64 = lines.slice(1, -1).join('');
  const blob = b64ToBytes(b64);
  if (blob.length < 10) throw new Error('sshsig: blob too short');
  if (ascii(blob.subarray(0, 6)) !== 'SSHSIG') throw new Error('sshsig: bad magic preamble');
  let o = 6;
  const version = be32(blob, o); o += 4;
  if (version !== 1) throw new Error('sshsig: unsupported version ' + version);
  let pkField, nsField, rsvField, haField, sigField;
  [pkField, o] = sshStr(blob, o);
  [nsField, o] = sshStr(blob, o);
  [rsvField, o] = sshStr(blob, o);
  [haField, o] = sshStr(blob, o);
  [sigField, o] = sshStr(blob, o);
  if (o !== blob.length) throw new Error('sshsig: trailing bytes after signature field');
  let kt, publicKey, p = 0;
  [kt, p] = sshStr(pkField, 0);
  [publicKey] = sshStr(pkField, p);
  let st, signature; p = 0;
  [st, p] = sshStr(sigField, 0);
  [signature] = sshStr(sigField, p);
  return {
    keyType: ascii(kt), publicKey,
    namespace: ascii(nsField), reserved: rsvField,
    hashAlgorithm: ascii(haField),
    sigType: ascii(st), signature
  };
}

/**
 * The exact byte sequence ssh-keygen signs:
 *   "SSHSIG" || string(namespace) || string(reserved)
 *            || string(hash_algorithm) || string(H(message))
 * Confirmed byte-for-byte against real ssh-keygen output before this was
 * written, not inferred from the spec alone.
 */
export function sshsigSignedBlob(namespace, reserved, hashAlgorithm, messageHash) {
  const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };
  const parts = [enc('SSHSIG'), encStr(enc(namespace)), encStr(reserved),
                 encStr(enc(hashAlgorithm)), encStr(messageHash)];
  let n = 0; for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ------------------------------------------------------- allowed_signers ---

const SIGNER_TS_RE = /^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(?:(\d{2}))?)?Z?$/;

/** OpenSSH validity timestamps: YYYYMMDD[HHMM[SS]] with an optional Z. */
export function parseSignerTimestamp(v) {
  const m = SIGNER_TS_RE.exec(String(v || '').replace(/^"|"$/g, ''));
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}Z`;
}

/**
 * Parse an OpenSSH allowed_signers file. Unknown options are preserved and
 * ignored rather than treated as errors, so a file OpenSSH accepts is never
 * refused here for carrying an option this check does not consult.
 */
export function parseAllowedSigners(text) {
  const entries = [];
  const lines = String(text || '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '' || line.charAt(0) === '#') continue;
    const toks = line.split(/\s+/);
    if (toks.length < 3) { entries.push({ line: i + 1, error: 'too few fields' }); continue; }
    const principals = toks[0].split(',').filter(Boolean);
    let ki = 1;
    const options = {};
    while (ki < toks.length && !/^(ssh-|ecdsa-|sk-)/.test(toks[ki])) {
      const t = toks[ki];
      const eq = t.indexOf('=');
      if (eq === -1) options[t.toLowerCase()] = true;
      else options[t.slice(0, eq).toLowerCase()] = t.slice(eq + 1).replace(/^"|"$/g, '');
      ki++;
    }
    if (ki + 1 >= toks.length) { entries.push({ line: i + 1, error: 'no key found' }); continue; }
    const keyType = toks[ki];
    const keyB64 = toks[ki + 1];
    const comment = toks.slice(ki + 2).join(' ');
    let keyBytes = null, err = null;
    try {
      const blob = b64ToBytes(keyB64);
      let t2, p = 0;
      [t2, p] = sshStr(blob, 0);
      if (ascii(t2) !== keyType) throw new Error('key type mismatch inside blob');
      [keyBytes] = sshStr(blob, p);
    } catch (e) { err = 'unparsable key: ' + (e && e.message); }
    entries.push({
      line: i + 1, principals, options, keyType, keyB64, comment,
      keyBytes, error: err,
      validAfter: options['valid-after'] ? parseSignerTimestamp(options['valid-after']) : null,
      validBefore: options['valid-before'] ? parseSignerTimestamp(options['valid-before']) : null
    });
  }
  return entries;
}

/** Keys admitted for a principal at an instant, honoring valid-after/before. */
export function signerKeysAt(entries, principal, atIso) {
  const out = [];
  for (const e of entries) {
    if (e.error || !e.principals) continue;
    if (e.principals.indexOf(principal) === -1) continue;
    if (e.validAfter && atIso < e.validAfter) continue;
    if (e.validBefore && atIso >= e.validBefore) continue;
    out.push(e);
  }
  return out;
}

/**
 * The composite the check calls: parse, resolve the principal against the
 * registry at the transition instant, and verify. Returns a structured
 * verdict rather than a boolean so findings can say WHY.
 */
export async function verifyReleaseSignature(opts) {
  const { armored, message, signersText, namespace, at, sha512 } = opts;
  let sig;
  try { sig = parseSshSig(armored); }
  catch (e) { return { ok: false, reason: 'unparsable', detail: e && e.message }; }
  if (sig.keyType !== 'ssh-ed25519' || sig.sigType !== 'ssh-ed25519') {
    return { ok: false, reason: 'unsupported_key_type', detail: sig.keyType };
  }
  if (sig.namespace !== namespace) {
    return { ok: false, reason: 'namespace_mismatch', detail: sig.namespace };
  }
  if (sig.hashAlgorithm !== 'sha512') {
    return { ok: false, reason: 'unsupported_hash', detail: sig.hashAlgorithm };
  }
  const entries = parseAllowedSigners(signersText);
  const candidates = signerKeysAt(entries, opts.principal, at);
  if (candidates.length === 0) {
    return { ok: false, reason: 'no_valid_key_for_principal', detail: opts.principal };
  }
  let matched = null;
  for (const c of candidates) {
    if (!c.keyBytes || c.keyBytes.length !== sig.publicKey.length) continue;
    let same = true;
    for (let i = 0; i < c.keyBytes.length; i++) if (c.keyBytes[i] !== sig.publicKey[i]) { same = false; break; }
    if (same) { matched = c; break; }
  }
  if (!matched) return { ok: false, reason: 'key_not_registered_for_principal', detail: opts.principal };
  const mh = await sha512(message);
  const signed = sshsigSignedBlob(sig.namespace, sig.reserved, sig.hashAlgorithm, mh);
  const good = await ed25519Verify(sig.signature, signed, sig.publicKey, sha512);
  return good ? { ok: true, principal: opts.principal, line: matched.line }
              : { ok: false, reason: 'bad_signature' };
}


// ---------------------------------------------------------------------------
// C-18.8: the enforced release signature (D2.3; design Section 5.3).
//
// C-18.7 stages the posture as a warning; this is the enforced form, split
// into its own check id rather than a tightening of C-18.7 so that findings
// distinguish "not yet required" from "required and missing", and so
// C-18.7's message stays accurate for pre-migration material.
//
// The registry arrives by INJECTION (input.releaseRegistry), following the
// resolveTarget precedent exactly: a single-bundle check context needing one
// fact from the rest of the store. checks.js therefore carries no
// store-specific knowledge; the registry bundle id is configuration at each
// of the three call sites.
//
// Fail-closed is the rule throughout. A registry that cannot prove itself is
// treated as ABSENT, and an absent registry with a post-migration release is
// an error naming the gap, never a silent skip. A verifier that passes when
// it cannot check is worse than no verifier.
// ---------------------------------------------------------------------------

/** The exact message a release signature covers (design 5.1). Built from
 *  canonicalJson, which is already exported and battery-proven, so the
 *  signer and the verifier cannot disagree about key order or spacing. */
export function releaseMessage(fields) {
  return canonicalJson({
    v: 'bio-release/1',
    bundle: fields.bundle,
    transition: fields.transition,
    from_state: fields.from_state,
    to_state: fields.to_state,
    signer: fields.signer,
    bundle_md_sha256: fields.bundle_md_sha256,
    registry_sha256: fields.registry_sha256
  });
}

/** Accept a pinned root key in either form an operator will plausibly paste:
 *  the full public-key line (`ssh-ed25519 AAAA... comment`) or the bare
 *  base64 body. Tolerance is deliberate. The bare form is the natural thing
 *  to copy out of a fingerprint listing, and without this it fails as
 *  `no_valid_key_for_principal`, which reads as a registry problem rather
 *  than a configuration typo, on a value that is only exercised once the
 *  root fence is enforced and every release depends on it. */
export function normalizeRootKey(k) {
  const v = String(k || '').trim();
  if (v === '') return v;
  if (/^(ssh-|ecdsa-|sk-)/.test(v)) return v;
  return 'ssh-ed25519 ' + v.split(/\s+/)[0];
}

/** Verify the registry against its own root before trusting any principal in
 *  it (design 3.4.5). Returns {trusted, reason}. The root public keys come
 *  from the CALL SITE, never from the registry bundle: pinning them inside
 *  the artifact they protect would let an adversary swap key and signature
 *  together and pass every check, which is ceremony rather than security. */
export async function verifyRegistryRoot(reg, sha512) {
  if (!reg) return { trusted: false, reason: 'registry_absent' };
  const enforce = reg.rootEnforceFrom || null;
  if (!reg.rootSignature) {
    return enforce ? { trusted: false, reason: 'root_signature_missing' }
                   : { trusted: true, reason: 'root_not_enforced' };
  }
  const keys = Array.isArray(reg.rootKeys) ? reg.rootKeys : [];
  if (keys.length === 0) {
    return enforce ? { trusted: false, reason: 'no_pinned_root_keys' }
                   : { trusted: true, reason: 'root_not_enforced' };
  }
  const signersText = keys.map(k => `operator ${normalizeRootKey(k)}`).join('\n');
  const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };
  const r = await verifyReleaseSignature({
    armored: reg.rootSignature, message: enc(reg.signers), signersText,
    namespace: reg.rootNamespace || 'bio-registry', principal: 'operator',
    at: enforce || '9999-12-31T23:59:59Z', sha512
  });
  if (r.ok) return { trusted: true, reason: 'root_verified' };
  return enforce ? { trusted: false, reason: 'root_signature_invalid:' + r.reason }
                 : { trusted: true, reason: 'root_invalid_but_not_enforced:' + r.reason };
}

async function checkReleaseSignature(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;

  // Hoisted above the schema branch on purpose. An unreadable registry must
  // refuse at EVERY schema; routing it through a pre-contract early return
  // would turn "cannot check" into "passed", which is the one outcome this
  // check exists to prevent.
  const regAny = ctx.releaseRegistry || null;
  if (regAny && regAny.unavailable) {
    findings.push(f('C-18.8', 'error', `the key registry is declared present but unreadable at this call site (${regAny.reason || 'no reason given'}); the gate cannot check signatures and will not pass them`,
      ['restore access to the registry bundle', 'do not promote until the registry reads']));
    return;
  }

  // Pre-contract schemas have no mandatory intake register, so there is
  // nowhere to record a signature and nothing here can check one. While the
  // fence is OFF that silence is honest: those bundles are pre-migration
  // material and C-18.7 stages the posture for @2.
  //
  // Once the fence is ON, silence becomes a lie. An information@1 bundle would
  // walk collected -> verified with no signature, no error, and not even a
  // warning, while the operator believes signatures are mandatory store-wide.
  // Measured 2026-07-22: 26 of 28 information bundles in the store were @1, so
  // setting the instant would have enforced signatures on two of them and
  // waved through the rest in silence. A fence that quietly passes most of what
  // it fences is worse than no fence, because it stops anyone looking.
  //
  // So: at any schema below @2, a post-instant ratification is refused, and the
  // refusal names the real repair rather than pretending a signature could have
  // been recorded.
  if (ctx.fm?.schema !== 'information@2') {
    const migration0 = regAny && regAny.migrationInstant ? regAny.migrationInstant : null;
    if (!migration0) return;
    const hist0 = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
    const post0 = hist0.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified'
      && e.timestamp && e.timestamp >= migration0);
    for (const e of post0) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is at or after the migration instant ${migration0}, but this bundle is ${ctx.fm.schema || 'a pre-contract schema'}: the signed release register exists only at information@2, so this ratification cannot carry a signature the gate can check`,
        /* REC-56 / D-203: `return the bundle to collected pending a signed
           ratification` was the second of the four sites the item was routed
           for. The migration repair above it is genuine and REACHABLE — it is
           an edit to the bundle where it stands and needs no state move — so
           it is unchanged; what is replaced is the alternative that had no
           route. See checkReleaseAuthority for the measurement. */
        ['migrate the bundle to information@2, then sign the transition and add the releases[] entry',
         'or retire it with the reason recorded (verified -> retired, op=retire), if the release cannot be signed',
         'either way the repair is made where the bundle stands: C-4.2 refuses any transition that is not an edge in this machine']));
    }
    return;
  }

  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const releases = hist.filter(e => e && e.from_state === 'collected' && e.to_state === 'verified');
  if (releases.length === 0) return;

  const reg = ctx.releaseRegistry || null;

  // The fence lives IN the registry, so with no registry the gate cannot
  // know whether a release is post-migration. That makes the absent case a
  // contract question rather than a computation, and the contract is
  // explicit: supplying nothing ASSERTS the pre-migration world, which is
  // the only honest reading while no registry bundle exists in the store.
  // A call site that CAN see a registry bundle but cannot read it must say
  // so with {unavailable: true} rather than omitting the argument, because
  // silently omitting it would turn an unreadable registry into a pass.
  const migration = reg && reg.migrationInstant ? reg.migrationInstant : null;
  const post = releases.filter(e => migration && e.timestamp >= migration);
  // Pre-migration releases are C-18.7's business and stay there, even if a
  // signature is present: the registry may not have held that key then, and
  // verifying against today's registry would be a different claim.
  if (post.length === 0) return;
  const root = await verifyRegistryRoot(reg, ctx.sha512);
  if (!root.trusted) {
    findings.push(f('C-18.8', 'error', `the key registry does not prove itself (${root.reason}); it is treated as absent, so no principal in it resolves`,
      ['restore the registry root signature', 'sign the registry with a pinned root key', 'clear root.enforce_from only with a recorded reason']));
    return;
  }

  const rawReg = ctx.files.get('data/provenance.json');
  let rels = [];
  if (rawReg) { try { const p = JSON.parse(asText(rawReg)); rels = Array.isArray(p.releases) ? p.releases : []; } catch { /* C-14.3 */ } }
  const bundleMd = ctx.files.get('bundle.md');
  const bundleSha = bundleMd ? await ctx.sha256(bundleMd) : null;

  for (const e of post) {
    const rec = rels.find(r => r && r.transition === e.timestamp);
    if (!rec || !rec.signature_file) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is at or after the migration instant ${migration} and carries no signed release record`,
        /* REC-56 / D-203, the fourth site. Same correction as the pre-contract
           arm above: signing in place is reachable and stays; the alternative
           named an edge the machine does not carry. */
        ['sign the transition and add the releases[] entry',
         'or retire it with the reason recorded (verified -> retired, op=retire), if the release cannot be signed',
         'either way the repair is made where the bundle stands: C-4.2 refuses any transition that is not an edge in this machine']));
      continue;
    }
    const author = String(e.author || '');
    if (String(rec.signer || '') !== author) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: signer '${rec.signer}' does not equal transition author '${author}'`,
        ['record the release under one identity']));
      continue;
    }
    /* REC-46: one predicate. A signed release is the strongest attribution
       this record holds, so it is the last place a minted spelling should have
       been able to stand in for a person. */
    if (isMachineIdentity(author)) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} is authored by '${author}', a surface or AI identity, never a release author`));
      continue;
    }
    const wantNs = reg.namespace || 'bio-release';
    if (rec.namespace !== wantNs) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: namespace '${rec.namespace}' is not the registry namespace '${wantNs}'`));
      continue;
    }
    const armored = ctx.files.get(String(rec.signature_file));
    if (armored == null) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp}: signature file '${rec.signature_file}' holds no bytes at the gate`));
      continue;
    }
    if (rec.registry_sha256 && reg.sha256 && rec.registry_sha256 !== reg.sha256) {
      findings.push(f('C-18.8', 'warn', `release at ${e.timestamp} records registry ${String(rec.registry_sha256).slice(0, 12)}… but the registry in force is ${String(reg.sha256).slice(0, 12)}…; the usual cause is signing against a stale mirror`,
        ['re-verify against the recorded registry version out of the registry bundle history']));
    }
    const msg = releaseMessage({
      bundle: ctx.folderName, transition: e.timestamp,
      from_state: e.from_state, to_state: e.to_state, signer: rec.signer,
      bundle_md_sha256: bundleSha, registry_sha256: rec.registry_sha256 || reg.sha256
    });
    const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff; return u; };
    const v = await verifyReleaseSignature({
      armored: asText(armored), message: enc(msg), signersText: reg.signers,
      namespace: wantNs, principal: rec.signer, at: e.timestamp, sha512: ctx.sha512
    });
    if (!v.ok) {
      findings.push(f('C-18.8', 'error', `release at ${e.timestamp} does not verify (${v.reason}) for signer '${rec.signer}'`,
        ['re-sign the transition over the exact released bundle.md', 'confirm the signer key is registered and valid at the transition instant']));
    }
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run all applicable checks over one bundle.
 * @param {BundleInput} input
 * @param {{knownSchemas?: string[]}} [opts]
 * @returns {Promise<{pass: boolean, findings: Finding[]}>}
 */
export async function checkBundle(input, opts = {}) {
  /** @type {Finding[]} */
  const findings = [];
  const bundleRaw = input.files.get('bundle.md');
  const ctx = {
    folderName: input.folderName,
    files: input.files,
    // 1.13.0 (three-tier read model): paths known to exist in the
    // authoritative store but whose bytes the caller deliberately did not
    // carry (a tier-scoped client mirror eliding snapshots/ and _history/).
    // Presence assertions ("this registered path must exist") consult
    // files UNION elided via hasFile_; byte checks (hashing, parsing,
    // history audits) stay files-only and skip elided content exactly as
    // they skip absent content, so nothing is ever verified against bytes
    // the caller does not hold. The gate and cli pass nothing here and are
    // byte-complete as before.
    elided: input.elidedPaths instanceof Set ? input.elidedPaths
      : new Set(Array.isArray(input.elidedPaths) ? input.elidedPaths : []),
    sha256: input.sha256,
    nowMs: input.nowMs,
    maxPackageAgeDays: input.maxPackageAgeDays ?? 14,
    maxReevalAgeDays: input.maxReevalAgeDays ?? 30,
    /* inquiry@1 joins; focus@1 and problem@1 STAY KNOWN forever — schema
       stamps are document truth in append-only history (REC-10). */
    /* PL-12 / D-84: `bias@1`. A type whose schema stamp the catalog does not
       know is refused by C-2.5 before any type-specific check runs, so the
       stamp has to be admitted in the same turn as the type. */
    knownSchemas: opts.knownSchemas ?? ['information@1', 'information@2', 'inquiry@1', 'focus@1', 'problem@1', 'project@1', 'action@1', 'bias@1'],
    resolveTarget: input.resolveTarget,
    // D2.3: the key registry, injected exactly like resolveTarget. Absent
    // is legal and means pre-migration behavior; absent WITH a
    // post-migration release is an error, never a skip.
    releaseRegistry: input.releaseRegistry || null,
    /* REC-14: the published projection, injected exactly like releaseRegistry
       and for the same reason — the checker is a pure function over a
       filesystem, and what OTHER cases were published (and at which editions,
       with which frozen pair) is not in this bundle. Shape:
         { <bundleId>: { latest: n, editions: { "1": {edition, completeness,
             capture: {state, grade}, connection: {state, grade}} } } }
       Absent means the caller cannot see the published record (the cli, the
       migrate tool) and C-21.1/C-21.2 cannot fire. Every path a real caller
       has — the ratification gate and the store's own write path — injects it,
       which is what keeps the absence from being a way through. */
    publishedRegistry: input.publishedRegistry || null,
    /* REC-44 / DEC-44: the CASE-altitude half of the same fact, injected on the
       same terms and separated for the reason DEC-44 gives — a case is a
       CONTAINER over one or more findings, so what the previous edition of THIS
       CASE asserted about its limits is not a fact about any one finding.
       Shape:
         { <caseId>: { latest: n, editions: { "1": {edition, scope,
             completeness, ratified_at} } } }
       Absent means the caller cannot see the published record (the cli, the
       migrate tool) and C-21.1 cannot fire; every path a real caller has
       injects it. Kept SEPARATE from publishedRegistry deliberately: one
       registry serving both altitudes is how the collapse this item corrects
       happened in the first place. */
    publishedCaseRegistry: input.publishedCaseRegistry || null,
    /* REC-18: the second fact the catalog cannot get from the bundle, and it is
       injected on exactly the same terms and for the same reason. What
       `resolutions` holds about this bundle's basis targets, and what `register`
       holds about their captures, is the record — not this document — so a
       checker over a filesystem has no way to compute an earned grade and says
       so rather than passing the leg (checkEarnedLeg). Shape:
         { subject_entity, subject_label, earned: {
             connection: { <target>: {grade, why, ...} },
             capture:    { <target>: {grade, why, ceiling?} } } }
       Absent means the caller cannot see the record (the cli, the migrate tool).
       Every path a real caller has injects it. */
    earnedRegistry: input.earnedRegistry || null,
    sha512: input.sha512 || null,
    fm: null,
    body: ''
  };

  if (!bundleRaw) {
    findings.push(f('C-13.1', 'error', 'bundle.md is missing'));
  } else {
    const parsed = parseFrontmatter(asText(bundleRaw));
    findings.push(...parsed.findings);
    ctx.fm = parsed.data;
    ctx.body = parsed.body;
    checkIdentity(ctx, findings);
    checkFrontmatterContract(ctx, findings);
    checkHeadings(ctx, findings);
    checkStateLegality(ctx, findings);
    checkWriteCompleteness(ctx, findings);
    await checkInformationExtension(ctx, findings);
    checkReleaseAuthority(ctx, findings);
    checkAuthorityPublishable(ctx, findings);
    checkRegisterIntegrity(ctx, findings);
    await checkInfo2Contract(ctx, findings);
    await checkReleaseSignature(ctx, findings);
    checkGatheringGrammar(ctx, findings);
    checkInboxGrammar(ctx, findings);
    await checkMechanicalConformance(ctx, findings);
    checkReferences(ctx, findings);
    checkRecheckCoverage(ctx, findings);
    checkInquiryExtension(ctx, findings);
    checkCompletenessFreshness(ctx, findings);
    checkProjectExtension(ctx, findings);
    checkActionExtension(ctx, findings);
    /* PL-12 / D-84: the bias bundle's own arm, beside its four siblings. It
       returns immediately for every other type, exactly as they do. */
    checkBiasExtension(ctx, findings);
    checkCitationRegister(ctx, findings);
    checkDeletionRecords(ctx, findings);
    checkAppendOnly(ctx, findings);
    checkHistoryCoherence(ctx, findings);
  }
  checkFormatHygiene(ctx, findings);
  await checkQueueAndBase(ctx, findings);

  const pass = !findings.some(x => x.severity === 'error');
  return { pass, findings };
}

/* ===========================================================================
 * WHAT A `where` MEANS — READ THIS BEFORE WRITING ONE (REC-71, 2026-08-08).
 *
 * Every DEC-49 row below carries a `where`. It is NOT prose and NOT a comment:
 * `civicos-ui/check-refusal-codes.mjs` arm C OPENS it and reads the source it
 * names, and every refusal it finds there must carry a code this family holds.
 *
 * **A `where` NAMES THE SMALLEST SPAN IN WHICH THIS ROW'S REFUSAL IS ENFORCED,
 * AND THE GUARD JUDGES EXACTLY THAT SPAN AND NOTHING ELSE.** Two spellings:
 *
 *   `<file> <fn>`              — THE WHOLE FUNCTION BODY is the governed site.
 *                                Correct only when EVERY refusal that function
 *                                makes is this family's business.
 *   `<file> <fn> > <region>`   — A NAMED REGION INSIDE that function is the
 *                                governed site. The span is delimited in the
 *                                source by a matching pair of BLOCK COMMENTS,
 *                                the first opening with `DEC-49 REGION <region>`
 *                                and the second with `END DEC-49 REGION
 *                                <region>` (see `src/store.mjs`'s
 *                                `basis-version-freeze` for the live example),
 *                                so it is DECLARED where the code is edited,
 *                                rather than inferred from a signature or a
 *                                line number. Both go stale silently; a marker
 *                                sits in front of the person moving the code.
 *
 * **A GOVERNED SITE AND A GOVERNED FUNCTION ARE DIFFERENT CLAIMS, and naming the
 * function when you meant a region CONSCRIPTS EVERY UNRELATED REFUSAL IN IT.**
 * That is not hypothetical and it is why this block exists. PL-1's two store-side
 * rows carried `where: 'src/store.mjs promote (the basis-version freeze arm)'`.
 * The parenthesis said "a region" to a human and nothing at all to the guard,
 * which read `promote` — 870 lines, the largest function in the plane, ~34
 * refusals — as the governed site. **32 long-standing refusals that pre-dated the
 * row instantly owed canned translations they were never in scope for, and the
 * UI harness went red on `main`.** Three workers (PL-2, PL-12, UI-51) measured it
 * independently and each correctly declined to silence another item's guard.
 * UI-51 put the general lesson best: *function-granularity `where` makes a
 * governed site as wide as its widest function.*
 *
 * SO, WHEN YOU ALLOCATE A ROW:
 *   - Name the region if the refusal lives in an arm of a bigger function. The
 *     guard FAILS if the marker is missing, unclosed, duplicated, outside the
 *     named function, trivially short, or judges no refusal at all — a `where`
 *     that quietly stops resolving is an arm that stopped running while still
 *     reporting green, and that failure mode is what arm C is for.
 *   - Name the function ONLY when the whole body is yours. `checkObservation`,
 *     `checkCondition` and `checkBound` in `src/airun.mjs` are the model: small,
 *     single-purpose, and every refusal in them is an AI_RUN row.
 *   - **Widening a `where` widens what must be translated TODAY.** If you find
 *     yourself widening one to cover a refusal, you are doing REC-64's sweep, in
 *     the worst possible place. Add the row, or narrow the `where`.
 *
 * THE GUARD PRINTS, EVERY RUN, the span of every governed site and how many
 * refusals it judged, so a `where` that has quietly stopped meaning anything is
 * visible rather than inferred from a green run.
 * ===========================================================================
 *
 * C-22 — THE INVESTIGATIVE RUN'S REFUSALS (IS-6, INVESTIGATIVE-SESSION.md §11
 * and §14b.6). SEVEN C-NUMBERS ALLOCATED HERE AND NOWHERE ELSE.
 *
 * SIX UNTIL 2026-08-08, when SK-1 added C-22.7 — the run's THIRD condition,
 * the skill version, refused at the open where the two principals already are.
 * The count is corrected in place rather than left standing: a header carrying
 * a number nobody re-measures is this repository's most-repeated finding, and
 * this file is where a reader comes to learn how many the family holds. C-22.7
 * is in THIS family rather than a new one on purpose — it is a fact about the
 * run object, and a new `*_CHECKS` family is a floor in
 * `civicos-ui/check-refusal-codes.mjs` that buys slack for everybody else's
 * walk unless it is moved in the same turn.
 *
 * WHY THEY ARE IN THIS FILE AT ALL, since none of them judges a bundle
 * document. §14b.4 is explicit: *every refusal this design promises "BY NAME"
 * is a C-number in the check catalogue* — "the IS work allocated none in v2,
 * and each IS item now allocates its C-numbers at build, same as every other
 * gate". The catalogue is where a C-number is MINTED; where the refusal FIRES
 * is a separate question, and these fire in the plane (`src/airun.mjs`, called
 * from `store.mjs`), because §14b.5's rule is that the checks are the PLANE'S
 * and never the model's. They are therefore ALLOCATIONS carrying their
 * enforcement site, not `checkX(ctx, findings)` functions, and `checkBundle`
 * does not call them — a bundle document has no run object in it, and inventing
 * a document arm so the shape matched would be a check over an empty
 * population, which is a defect this repository has already measured twice.
 *
 * WHY THE ALLOCATION AND THE TRANSLATION ARE ONE ROW. DEC-49 (Bob, 2026-08-06;
 * QUEUE.md REC-64) rules that every refusable condition carries an ERROR CODE
 * with a CANNED TRANSLATION and that an untranslated code FAILS THE HARNESS
 * rather than reaching a member. Its acceptance also requires the
 * code-to-translation map to be read from ONE place rather than copied — "a
 * hand copy agrees at zero cost — measured five times". So the C-number, the
 * wire code and the translation are ONE ROW here; `src/airun.mjs` imports this
 * and holds no second copy, and REC-64 can absorb the family whole when it
 * builds the general map. LOOKUP IS AT RUNTIME rather than at build, which
 * REC-64 explicitly leaves open: the refusal's `detail` names the offending
 * value and the run it came from, so a build-time table would have to carry
 * either a template language or a sentence with the facts taken out of it.
 * ========================================================================= */
export const AI_RUN_CHECKS = {
  /* §11: "Absence uses D-129's vocabulary — NEVER_LOOKED / LOOKED_ABSENT /
     LOOKED_INDETERMINATE / PRESENT, plus `partial`. Which absence is a stated
     fact, never a diagnostic detail." An entry outside the vocabulary is not a
     weaker statement of absence; it is an ungoverned one. */
  AI_LOG_STATE_UNKNOWN: {
    check: 'C-22.1',
    where: 'src/airun.mjs checkObservation, called from store.mjs #aiRunAppend',
    translation: 'That observation does not say which kind of absence it found. '
      + 'The record distinguishes never having looked, having looked and found nothing, '
      + 'having looked and being unable to tell, having found it, and having found part of it.',
  },
  /* D-104, and CLAUDE.md states the general rule it instantiates: "our governor
     refusing is not the source failing". An entry recording LOOKED_ABSENT when
     it was OUR pacing that stopped the fetch MANUFACTURES a false absence —
     §11's own word. The governed flag is the fact; a governed observation can
     only be LOOKED_INDETERMINATE, and either definitive claim is refused. */
  AI_LOG_GOVERNED_ABSENCE: {
    check: 'C-22.2',
    where: 'src/airun.mjs checkObservation, called from store.mjs #aiRunAppend',
    translation: 'That observation was stopped by our own pacing of the source, not by the source. '
      + 'It can only record that we could not tell — recording an absence there would be a claim '
      + 'about the world made from a fact about us.',
  },
  /* §11's third rule, SWEEP §3's false-coverage hazard: "A client-rendered
     shell capture is LOOKED_INDETERMINATE, never PRESENT". `client-rendered-shell`
     is catalogued with no producer, and an evidentially empty capture that reads
     as coverage is the defect the whole absence vocabulary exists to prevent. */
  AI_LOG_SHELL_PRESENT: {
    check: 'C-22.3',
    where: 'src/airun.mjs checkObservation, called from store.mjs #aiRunAppend',
    translation: 'That capture is a page shell with nothing evidential in it, so it cannot be '
      + 'recorded as having found the material. It records that we could not tell.',
  },
  /* DEC-8 as amended by DEC-49: a surface may render a translation keyed on a
     code the plane SENT, which only holds if the plane never sends a condition
     nobody has translated. The condition vocabulary is `queuestate.mjs`'s, read
     LIVE rather than copied, and a run naming a kind outside it is a loud
     refusal instead of a silent new vocabulary — queuestate.mjs's own words for
     the same fence one surface over. */
  AI_RUN_CONDITION_UNKNOWN: {
    check: 'C-22.4',
    where: 'src/airun.mjs checkCondition, called from store.mjs #aiRunTerminate',
    translation: 'The run tried to end on a condition the record has no name for. '
      + 'A condition nobody can read is not an explanation.',
  },
  /* §14b.6 IS THIS ITEM: "when a bound stops a run, the observation log says
     which bound and where it stopped". A close with no bound named is the
     `heldMatch` defect exactly — not found and did not finish looking made
     indistinguishable — so the terminate path REFUSES it rather than writing an
     unattributed ending. This is what makes "names the bound" a mechanism
     rather than an intention. */
  AI_RUN_BOUND_UNNAMED: {
    check: 'C-22.5',
    where: 'src/airun.mjs checkBound, called from store.mjs #aiRunTerminate',
    translation: 'The run stopped without saying what stopped it. '
      + 'Not finding something and not finishing the search are different facts, '
      + 'and only one of them licenses a conclusion.',
  },
  /* §11: "the observation log cannot live in bundle.md, which is written only on
     success — the log's whole value is the failure path." The log is a different
     object from the record, and a different object again from a TRANSCRIPT,
     which DEC-61 puts device-local with a TTL and out of the record store
     altogether. This refusal is the fence AT THE APPEND: an entry offered for a
     bundle is refused, so the separation is enforced at the one write rather
     than asserted about every reader. */
  AI_LOG_NOT_A_BUNDLE: {
    check: 'C-22.6',
    where: 'src/airun.mjs checkObservation, called from store.mjs #aiRunAppend',
    translation: 'The observation log is not part of any published document and cannot be filed into one.',
  },
  /* SK-1, 2026-08-08. §11 lists THREE conditions a run is formed under — the
     bias manifest in force, the launching project's standard pair, and THE
     SKILL VERSION IT RAN UNDER — because "everything can change at the drop of
     a hat" and a version is only interpretable against them. SK-1's row makes
     the recording a REQUIREMENT and not an analogy (the Cerebras/Schulte
     disclosure standard), and a condition that may be omitted is not recorded:
     it is recorded by the runs that felt like it.

     REFUSED AT THE OPEN, beside the two principals, for the same reason those
     are: refusing later would mean a run had already searched under
     instructions nobody can name. Two ways to fail and ONE code, because they
     are one fact — the run object cannot say what it ran under. The worse of
     the two is a version that names no pack: `3` reads as an answer and
     identifies nothing, which is the blank-principal shape PL-4 measured one
     field over, arriving on a condition instead of an identity.

     A WHOLE-FUNCTION `where`, and it is the case the convention above blesses:
     `checkSkillVersion` is small, single-purpose, and the only refusal it makes
     is this one — `src/airun.mjs`'s three check functions are the named model. */
  AI_RUN_SKILL_VERSION_UNNAMED: {
    check: 'C-22.7',
    where: 'src/skillpack.mjs checkSkillVersion, called from store.mjs aiRunOpen',
    translation: 'This run did not say which version of its instructions it was working under. '
      + 'What a run found can only be read against the instructions it was given, so the record '
      + 'asks for that version before the run starts rather than guessing at it afterwards.',
  },
};

/* ===========================================================================
 * PL-9 / D-222 OPTION C — THE MEANING-GRAIN READ'S REFUSALS.
 *
 * `op=meaningrows` is a SEVENTH STATEMENT SHAPE on the query compiler, not a
 * second query path (D-15, and `query.mjs`'s own note at the `ids` arm). Its
 * selector vocabulary is PL-8's and needs no refusals of its own — an unknown
 * sub-field there is DROPPED with a warning, because a dropped arm WIDENS the
 * answer and on a debt question narrowing silently is the sentence "you have
 * none". What this op adds is one genuinely new argument, `rows=<arm>`, which
 * names WHICH meaning table to answer at grain from, and that one cannot be
 * widened away: there is no honest default, because answering with legs when a
 * caller asked for resolutions is a confidently wrong answer about a different
 * table. So it is REFUSED, twice, for the two ways it can be wrong.
 *
 * DEC-49's shape, on AI_RUN_CHECKS' precedent above: the C-number, the wire code
 * and the CANNED TRANSLATION are ONE ROW, read from one place rather than
 * copied, so a surface rendering a translation keyed on a code the plane sent
 * cannot drift from what the plane refuses. The refusal's own `detail` names the
 * offending value and the arms that DO exist — derived from the compiler's
 * registry at the refusal site, never listed here, because a hand copy agrees at
 * zero cost and this project has measured that five times.
 * ========================================================================= */
export const MEANING_READ_CHECKS = {
  /* No grain was named at all. The op cannot fall back to a default arm: `leg`
     and `resolves` read different tables and answer different questions, and
     picking one would answer a question the caller did not ask. */
  MEANING_ROWS_NO_ARM: {
    check: 'C-23.1',
    where: 'src/store.mjs meaningRows, reached from op=meaningrows',
    translation: 'That request did not say which kind of meaning to read. '
      + 'The record holds the legs a claim rests on and the resolutions a document carries, '
      + 'and they are different things — so it asks rather than choosing one for you.',
  },
  /* A grain was named and the record has no such thing. Refused rather than read
     as free text: this argument selects a TABLE, and a mistyped table name that
     silently answered from another one would be the false-coverage failure the
     whole meaning-layer surface exists to remove. */
  MEANING_ROWS_UNKNOWN_ARM: {
    check: 'C-23.2',
    where: 'src/store.mjs meaningRows, reached from op=meaningrows',
    translation: 'The record has no meaning of that kind to read. '
      + 'Rather than answer from a different one and let the answer look complete, '
      + 'it says so and names the kinds it does hold.',
  },
};

/* =========================================================================
 * PL-10 / D-220 — THE DOCUMENT-VERSION CHAIN'S REFUSALS.
 *
 * The chain is a JOIN over two tables the record already holds, keyed on an
 * ADDRESS. Both ways of asking it wrong are ways of being told something about
 * a document other than the one asked about, which on this surface is the whole
 * hazard: sixty versions of one calendar reading as sixty documents is the
 * false-coverage failure D-220 exists to remove, and answering the wrong
 * address is the same failure arriving by the front door.
 *
 * D-221's mechanism is why the FIRST of these is a refusal rather than a
 * fallback. `heldMatch` reached for prior versions with a full-text query on a
 * text-indexed field, so a near-miss on the address still ANSWERED — with the
 * wrong document, ranked by relevance. An address that cannot be resolved must
 * therefore stop, not soften into a search.
 *
 * DEC-49's shape, on MEANING_READ_CHECKS' precedent above: the C-number, the
 * wire code and the CANNED TRANSLATION are ONE ROW, read from one place rather
 * than copied.
 * ========================================================================= */
export const VERSION_CHAIN_CHECKS = {
  /* No address at all. There is no default document and there must not be one:
     the chain's entire subject is "at THIS address", and a chain answered for
     an unnamed address is a list of unrelated bundles wearing the word
     "versions". */
  VERSION_CHAIN_NO_ADDRESS: {
    check: 'C-24.1',
    where: 'src/store.mjs versionChain, reached from op=versionchain',
    translation: 'That request did not say which document address to read the versions of. '
      + 'Versions are versions OF something, so it asks rather than answering '
      + 'for a document you did not name.',
  },
  /* An anchor was given and it is not a version at this address. Refused rather
     than matched approximately — that approximation IS D-221 — and refused
     IDENTICALLY whether the capture is absent, filed at a different address, or
     in a project this viewer was never invited to. Hidden and absent are one
     answer here, as they are on every gated read in this plane. */
  VERSION_CHAIN_NO_SUCH_VERSION: {
    check: 'C-24.2',
    where: 'src/store.mjs versionChain, reached from op=versionchain with at=<capture sha>',
    translation: 'The record holds no version of that document with those bytes. '
      + 'Rather than pick the closest-looking one and call it the version before this, '
      + 'it says so — naming the wrong predecessor is the defect this read was built to end.',
  },
  /* The anchor is not the shape a capture identity has. A separate refusal from
     the one above because it is a different fact about the world: "you typed
     something that is not a capture" is the caller's, and "no such version" is
     the record's. Collapsing them would make a typo indistinguishable from an
     absence, which is the distinction CLAUDE.md requires be stated. */
  VERSION_CHAIN_BAD_ANCHOR: {
    check: 'C-24.3',
    where: 'src/store.mjs versionChain, reached from op=versionchain with at=<capture sha>',
    translation: 'That is not the shape a capture identity has, so nothing was looked up. '
      + 'A capture is named by the sha256 of its bytes; this says the request was malformed '
      + 'rather than letting it read as a document the record does not hold.',
  },
};

/* =========================================================================
 * PL-1 / IS-1 — BASIS VERSIONS. THE REFUSALS.
 *
 * An inquiry's basis supports many VERSIONS (INVESTIGATIVE-SESSION.md §6), each
 * a complete alternative account of the support for the inquiry's claim. The
 * version block is authored in `bundle.md` and projected inside op=promote's one
 * transaction, so these checks run at BOTH gates through one function —
 * `checkInquiryBasis` calls `basisVersionFindings`, and the store's write path
 * calls the same export. A version that cannot land cannot audit clean either.
 *
 * DEC-49's SHAPE, on VERSION_CHAIN_CHECKS' precedent above: the C-number, the
 * wire code and the CANNED TRANSLATION are ONE ROW, read from one place rather
 * than copied. `basisVersionFindings` reads the C-number OUT of this map at every
 * push site and passes the key as the finding's `code`, so there is no second
 * list of C-numbers anywhere and a row added here is enforced the moment it is
 * used. LOOKUP IS AT RUNTIME for AI_RUN_CHECKS' stated reason: the `message`
 * names the offending version and value, so a build-time table would carry
 * either a template language or a sentence with the facts taken out of it.
 *
 * WHY THE RELATIONSHIP IS A FIELD AND NOT DERIVED FROM THE PARTITION, which is
 * the one design choice here a reader will challenge. The partition alone
 * *implies* the arithmetic — legs sharing a ground are AND, grounds are OR
 * (DEC-32) — so a `relationship` that could only ever agree with it would be a
 * checkbox and D-21's second-place-to-state-a-fact. It is here because it CAN
 * disagree, and because of DEC-32's anti-gaming keystone: the structure is
 * authored BEFORE the strength is shown, and an AI-composed version arrives
 * structure-and-strength together (§12(b)). So the version states, in one word a
 * member affirms at the accept ceremony, what it claims its composition is — and
 * the record checks that word against the structure and REFUSES the disagreement
 * (C-25.4). A version whose partition says OR while its author wrote AND is a
 * version whose accepter would be signing for a claim they did not read. This is
 * the NO_SIBLING_DISCLOSURE posture applied inside one document: a disclosure
 * nobody can check is not a disclosure.
 *
 * AND THE ABSENCE IS REFUSED OUTRIGHT (C-25.3) rather than defaulted to `and`.
 * `inquiry_basis` defaults an unlabelled leg to the implicit single ground on
 * purpose — every leg written before REC-42 reads NULL and derives the
 * weakest-leg answer it always derived. A VERSION has no such history and gets
 * no such default: §3 is explicit that "a version with no relationship field
 * would re-ship the flat-AND basis REC-42 corrected".
 * ========================================================================= */
export const BASIS_VERSION_CHECKS = {
  /* §6 rule 1. The description is load-bearing rather than a courtesy: §10 makes
     it what survives a conversation that is deliberately not kept, and under §5
     it carries the naming of every ungraded leg. A version with none is an
     alternative account of the evidence with no account of itself. */
  VERSION_NO_DESCRIPTION: {
    check: 'C-25.1',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version does not say what it is or why it differs. '
      + 'A version is a whole alternative reading of the evidence, and the description is '
      + 'what a member has left to compare it by once the conversation that produced it is gone.',
  },
  /* §6 rule 2. Unique PER INQUIRY, never globally — "global uniqueness would
     make naming absurd". Two versions of one inquiry sharing a name makes every
     later reference to that name ambiguous, including `derived_from`, which is
     how the derivation tree is read. */
  VERSION_NAME_NOT_UNIQUE: {
    check: 'C-25.2',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'Two versions of this inquiry have the same name. '
      + 'Names are how versions are compared and how one records what it was derived from, '
      + 'so within one inquiry a name means exactly one version.',
  },
  /* §3 / SWEEP C5. See the block comment above for why this is a field. */
  VERSION_NO_RELATIONSHIP: {
    check: 'C-25.3',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version does not say how its evidence fits together — whether every part is needed, '
      + 'or whether any one of its parts would carry the answer on its own. '
      + 'Those two readings give different answers about how strong the finding is, '
      + 'so the version says which one it is rather than letting the record assume.',
  },
  /* The field is only a claim because it can be wrong. */
  VERSION_RELATIONSHIP_DISAGREES: {
    check: 'C-25.4',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version says its evidence fits together one way and is grouped the other way. '
      + 'The two cannot both be true, and a member accepting it would be signing for a reading '
      + 'that is not the one written down.',
  },
  /* §3: "A version that is a flat leg set cannot express plurality — the version
     IS the composition, and the partition is part of the composition." The
     partition is TOTAL on a version: checkGrounds' whole-or-not-at-all rule with
     the not-at-all arm removed, because the version must carry it. */
  VERSION_PARTITION_INCOMPLETE: {
    check: 'C-25.5',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'Some of that version\'s evidence has not been placed in the argument. '
      + 'A part nobody placed sitting beside parts somebody did is a relationship the record '
      + 'would have to guess at, and it would have to guess in the direction that makes the finding stronger.',
  },
  /* REC-45 / DEC-32's attributed act, at the version's own grain. "These legs
     are enough on their own" is the one thing that makes a finding STRONGER, so
     it carries a named member and a date and a machine credential cannot assert
     it — `isMachineIdentity` is the one predicate, never a word list (REC-46). */
  VERSION_GROUND_UNASSERTED: {
    check: 'C-25.6',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version claims one part of its argument would carry the answer on its own, '
      + 'and no member has said so. That claim is the one thing that makes a finding stronger, '
      + 'so it carries the name of the person making it and the date they made it — never a machine\'s.',
  },
  /* §6 rule 3a: "Each version records what it was derived from, null where a run
     composed it fresh." An edge naming a version that is not here points the
     derivation tree at nothing. */
  VERSION_DERIVED_FROM_UNKNOWN: {
    check: 'C-25.7',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version says it came from a version this inquiry does not have. '
      + 'Where a version came from is how the alternatives are read as a tree rather than a pile, '
      + 'so it names one that exists or it names none.',
  },
  /* A derivation tree is a TREE. A cycle makes "what was this derived from"
     unanswerable and the prune walk non-terminating. */
  VERSION_DERIVATION_CYCLE: {
    check: 'C-25.8',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'These versions say they were derived from each other in a loop, '
      + 'so there is no answer to which came first. Versions form a tree, and a tree has a root.',
  },
  /* DEC-50 / §6.7 — the clause the sweep added and the reason this is not merely
     a data check. "An edit that regroups the ground partition is the attributed
     regroup act REC-45 built — ungroup with a reason, cite, regroup — surfacing
     through the derived version's record of who and why. §6.7 licenses no
     unattributed structural edit." So a version whose partition DIFFERS from its
     parent's carries the act: a named member, a date, a reason. */
  VERSION_REGROUP_UNATTRIBUTED: {
    check: 'C-25.9',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version rearranges the argument it was derived from, and nobody has said who did it or why. '
      + 'Rearranging which evidence is grouped with which changes how strong the finding reads, '
      + 'so it is an act with a name on it rather than an edit.',
  },
  /* D-184 / C-2.8, restated at the version's grain because a version's legs do
     not pass through checkInquiryBasis's own loop: a leg rests on information or
     on another inquiry and NOTHING ELSE. Stated as a standing bound of this item
     rather than discovered later. */
  VERSION_LEG_NOT_CITABLE: {
    check: 'C-25.10',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'One part of that version rests on something that cannot be evidence for a question — '
      + 'the record admits a document or another question, and nothing else.',
  },
  /* §6 rule 3, AND IT IS THE ONE REFUSAL THIS FILE CANNOT REACH ON ITS OWN. A
     pure check over one document cannot see what the record already holds under
     that name, so the comparison is the store's — `store.mjs`'s promote path
     computes the composition digest of every offered version and compares it to
     the stored one BEFORE anything lands. The row lives here so the C-number,
     the code and the translation stay in one place with its siblings; the
     enforcement site says where it actually fires, which is not this file. */
  VERSION_FROZEN: {
    check: 'C-25.11',
    /* A REGION `where`, NOT a function `where` — see this file's "WHAT A `where`
       MEANS" block above. `promote` is 870 lines and refuses ~34 things; this row
       governs the freeze arm and nothing else. The prose `(the basis-version
       freeze arm)` said exactly this before REC-71 and no instrument could read
       it, so the guard widened the claim to the whole function and conscripted 32
       unrelated refusals. The span is now DECLARED at the site. */
    where: 'src/store.mjs promote > basis-version-freeze, NOT reachable from a pure document check',
    translation: 'That version already exists and has been changed in place. '
      + 'A version is frozen once written, because two people comparing it must be comparing the same thing — '
      + 'so an edit becomes a NEW version derived from this one, and the original stays exactly as it was.',
  },
  /* §6 rule 4's vocabulary. This is the SIXTH state machine and IS-2 owns its
     transitions; PL-1 owns only that the word written is one of the four. An
     unknown state is refused rather than tolerated for DEC-8's reason: a surface
     rendering a state it has no translation for is the drift DEC-49 closed. */
  VERSION_STATE_UNKNOWN: {
    check: 'C-25.12',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version is in a state the record has no name for. '
      + 'A version is suggested, being considered, accepted, or rejected — and nothing else.',
  },
  /* §6 rule 3a, DEC-29(b), D-214. PRUNE HIDES AND NEVER DELETES. The flag is a
     boolean and the refusal exists so that no caller can smuggle a third value
     ("archived", "deleted") into a field whose entire meaning is that the row
     stays in the record and stays queryable. */
  VERSION_HIDDEN_NOT_BOOLEAN: {
    check: 'C-25.13',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'The setting that hides a version from the display is not a yes-or-no answer here. '
      + 'Hiding a version removes it from view and nothing else — it stays in the record and stays '
      + 'answerable — so there is no third thing for this to say.',
  },
  /* A leg naming its own inquiry. checkInquiryBasis refuses the same thing on
     `basis[]` as SELF_BASIS at the store; a version is an account OF the
     question and cannot rest on it. The transitive cycle check is NOT done here
     and that bound is stated in `basisVersionFindings`' own comment. */
  VERSION_LEG_SELF: {
    check: 'C-25.14',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'That version rests on the question it is an answer to. '
      + 'A question is not evidence for its own answer.',
  },
  /* A leg or a ground row that belongs to no version in the block — the mirror
     of DERIVED_FROM_UNKNOWN, one grain down. Three sibling arrays joined by name
     is the shape `basis[]`/`grounds[]` already uses; an orphan in either of the
     two joined arrays is material the record would hold and never read. */
  VERSION_ORPHAN_ROW: {
    check: 'C-25.15',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'Part of the version block names a version that is not there. '
      + 'It would be material the record holds and never shows anybody, which is worse than not holding it.',
  },
  /* THE SECOND REFUSAL A PURE CHECK CANNOT REACH. C-25.10 asks whether the leg
     COULD be evidence — a fact about the id's shape, which one document answers.
     This asks whether the thing is HERE, which only the store can see, and it is
     the same half `action_basis` and `supersedes` already split off from their
     shape arms. Kept separate from C-25.10 for the reason every split refusal in
     this file is kept separate: "you cited something that cannot be evidence"
     and "you cited something we do not hold" are different facts and a member
     told the wrong one is worse off than one told nothing. */
  VERSION_LEG_UNRESOLVED: {
    check: 'C-25.16',
    /* A REGION `where` — see VERSION_FROZEN above and the "WHAT A `where` MEANS"
       block at the head of this file. */
    where: 'src/store.mjs promote > basis-version-resolve, NOT reachable from a pure document check',
    translation: 'One part of that version rests on something this record does not hold. '
      + 'A reading of the evidence that points at a document nobody can open is a reading nobody can check.',
  },
  /* THE READ'S TWO REFUSALS. Versions are versions OF an inquiry, so there is no
     default subject and there must not be one — VERSION_CHAIN_NO_ADDRESS'
     reasoning one construct over: an answer for an unnamed subject is a list of
     unrelated compositions wearing the word "versions". */
  BASIS_VERSIONS_NO_INQUIRY: {
    check: 'C-25.17',
    where: 'src/store.mjs basisVersions, reached from op=basisversions',
    translation: 'That request did not say which question to read the versions of. '
      + 'A version is one reading of the evidence for one question, so it asks '
      + 'rather than answering for a question you did not name.',
  },
  /* And an id of the wrong CLASS is refused rather than answered with an empty
     list. "This project has no versions of its basis" is a confidently wrong
     sentence about a thing that has no basis at all, and an empty answer is the
     most misleading form a wrong answer takes. */
  BASIS_VERSIONS_NOT_AN_INQUIRY: {
    check: 'C-25.18',
    where: 'src/store.mjs basisVersions, reached from op=basisversions',
    translation: 'Only a question carries versions of its evidence, and that is not a question. '
      + 'Answering with an empty list would say this thing has no readings of its evidence, '
      + 'when the truth is that it could not have any.',
  },
  /* PL-2 / IS-2 — THE SECOND ENFORCEMENT LAYER of §6 rule 4's reason rule, and
     it is here rather than only at the write op because VERIFICATION rule 3a
     requires an assertion at EACH place a rule is enforced, and because the two
     layers answer different questions. The write op refuses an ACT that carries
     no reason. This refuses a DOCUMENT that arrives already claiming a
     reason-bearing state with nothing behind it — which is the shape a hand-
     authored `bundle.md`, a replayed history, or a future writer would take, and
     none of those go through the op.

     BOTH LAYERS CALL `versionNeedsReason` AND NEITHER RE-TYPES THE SET. Two
     enforcement layers are what the rule requires; two IMPLEMENTATIONS of the
     membership test are what IS-6's C-22.4 control was absorbed by, so there is
     one predicate and the suite pins the count. */
  VERSION_DISPOSITION_UNATTRIBUTED: {
    check: 'C-25.19',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'This reading of the evidence was set aside or turned down with no reason recorded, '
      + 'or with a machine\'s name against it. What a member decided about a reading, and why, is '
      + 'the record itself — a decision nobody signed and nobody explained leaves nothing to answer to.',
  },
};

/* §6 rule 4's four states. Exported so IS-2's six member ops read the vocabulary
   from here rather than holding a second copy of it — the drift DEC-8 closed. */
export const VERSION_STATES = ['suggested', 'considering', 'accepted', 'rejected'];

/* ===================================================================
 * PL-2 / IS-2 — **THIS IS THE SIXTH STATE MACHINE IN THIS PLANE**, and
 * INVESTIGATIVE-SESSION.md §6 rule 4 says so in those words: *"This is a SIXTH
 * state machine and the design says so."* The five that already exist are the
 * five keys of `STATES` above (information, inquiry and its two legacy
 * spellings, action, project); task states and proposal dispositions are
 * DIFFERENT vocabularies belonging to different objects, and nothing existing is
 * this machine (SWEEP §1.4). It is stated here, in the file that defines the
 * other five, so a reader counting state machines counts six.
 *
 * IT IS DELIBERATELY NOT A SIXTH KEY OF `STATES`. `STATES` is keyed by
 * OBJECT_TYPE and consulted through `vocabFor` over a document's DECLARED type;
 * a basis version is not an object type, has no bundle id, and is never the
 * subject of `checkStateLegality`. Adding it there would make `vocabFor` answer
 * this machine for a document whose type happened to collide, and would put a
 * version's states into every sweep that enumerates the object machines. One
 * table, its own name, imported by everything that needs it.
 *
 * THE EDGES, and each one is a member act (§6 rule 4, second bullet):
 *
 *   suggested   -> considering | accepted | rejected
 *   considering -> suggested   | accepted | rejected
 *   accepted    -> considering | rejected
 *   rejected    -> suggested   | considering | accepted
 *
 * WHY `accepted -> suggested` IS ABSENT while every other reversal is present.
 * §6 rule 4 is explicit that *"`considering` and `rejected` are reversible, the
 * states are not a one-way ladder"*, and rule 5 is equally explicit that
 * *"accepted is a HISTORICAL FACT — this version was accepted, on this date, by
 * this member"* and that *"a version accepted in error is REJECTED, which is a
 * different and rarer act than being superseded"*. Returning an accepted version
 * to `suggested` would say nobody had ever acted on it, which is the one thing
 * the record knows to be false. So the way back from `accepted` is through an
 * act that is itself recorded — rejecting it, or putting it back under
 * consideration — and never through an erasure.
 *
 * A version that stops being CURRENT does not move in this machine at all: it
 * stays accepted, because it honestly was (§6 rule 5). Current is a property of
 * the PROJECT's relationship to the inquiry (§7) and is not a state here.
 */
export const VERSION_MACHINE = {
  legal: VERSION_STATES,
  edges: {
    suggested:   ['considering', 'accepted', 'rejected'],
    considering: ['suggested', 'accepted', 'rejected'],
    accepted:    ['considering', 'rejected'],
    rejected:    ['suggested', 'considering', 'accepted'],
  },
};

/* §6 rule 4, first bullet: a machine-written version is a PROPOSAL and inherits
   the interaction-construct's proposal rules — *"it is adopted, deferred WITH a
   recorded reason, or dismissed WITH a recorded reason"*. The three constructs
   map onto three of the six ops and the mapping is stated rather than implied:
   ADOPT is `accept`, DEFER is `consider` (the member has not decided and is
   saying so on the record), DISMISS is `reject`. So the two reason-bearing
   target states are `considering` and `rejected`, and this array is the ONE
   place that says which they are.

   Rule 4's second bullet raises `rejected` above the construct's floor —
   *"rejection at minimum carries an authored reason — the rejection record is
   the anti-omission instrument, and it is worthless without one"* — which is why
   the requirement is enforced at two layers (the write op and the catalog) and
   why VERIFICATION rule 3a then owes an assertion at EACH of them.

   ONE PREDICATE AND ONE ARRAY, never a second copy of the membership test: IS-6's
   C-22.4 control left its suite green at 98/98 because a rule had two
   implementations and removing either left the other absorbing the control. The
   store imports `versionNeedsReason`; the catalog below calls it; there is no
   third spelling and `test/versionstate.test.mjs` pins the count. */
export const VERSION_REASON_REQUIRED = ['considering', 'rejected'];
export const versionNeedsReason = (to) => VERSION_REASON_REQUIRED.includes(to);

/* PL-2 / IS-2 — THE SIX MEMBER OPS' REFUSALS, each with its C-number, its
 * DEC-49 wire code and the canned translation a surface renders. A surface may
 * RENDER a refusal it received and may never compute one (DEC-8), so every
 * refusal the six ops can return is a row here and the store returns the row's
 * own translation rather than composing a second sentence.
 *
 * NO MEMBER-FACING STRING BELOW SAYS "ground", "partition", "AND" or "OR" as a
 * member-facing word — DEC-32's elicitation clause 1 and D-226, the same bound
 * BASIS_VERSION_CHECKS respects one item down, and the suite asserts it of every
 * translation rather than trusting this paragraph. */
export const VERSION_ACT_CHECKS = {
  VERSION_ACT_NO_INQUIRY: {
    check: 'C-25.20',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'That request did not say which question the reading belongs to. '
      + 'A reading of the evidence always belongs to one question, so it asks rather than guessing.',
  },
  VERSION_ACT_NOT_AN_INQUIRY: {
    check: 'C-25.21',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'Only a question carries readings of its evidence, and that is not a question. '
      + 'There is nothing here to accept, set aside or turn down.',
  },
  VERSION_ACT_NO_VERSION: {
    check: 'C-25.22',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'That request did not name which reading to act on. '
      + 'A question can hold several readings of its evidence, and acting on the wrong one is '
      + 'worse than being asked which you meant.',
  },
  VERSION_ACT_NO_SUCH_VERSION: {
    check: 'C-25.23',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'This question holds no reading by that name. '
      + 'Readings are named so a member can ask for one by name, and a name nobody wrote is '
      + 'refused rather than matched to whatever is nearest.',
  },
  /* REC-46's ONE predicate, at the ONE transition site. §4: THE AI HOLDS NO OP
     THAT ACCEPTS. A machine may compose an account of the evidence and propose
     it; deciding what the record stands on is a named member's act, and this is
     the refusal that says so for all six. */
  MACHINE_CANNOT_MOVE_VERSION: {
    check: 'C-25.24',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'Deciding what to do with a reading of the evidence is a named member\'s call, '
      + 'and this request came from an automated credential. A machine may put a reading forward '
      + 'and may never settle it. Sign in as a member.',
  },
  VERSION_ILLEGAL_TRANSITION: {
    check: 'C-25.25',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'That is not a move this reading can make from where it stands. '
      + 'A reading a member has already accepted is corrected by turning it down or by putting it '
      + 'back under consideration, never by returning it to something nobody had acted on.',
  },
  VERSION_NO_REASON: {
    check: 'C-25.26',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'Setting a reading aside or turning it down carries the reason in the member\'s own '
      + 'words. The record of what was turned down is the instrument that makes a pattern of '
      + 'turning things down visible at all, and it is worth nothing without the reason.',
  },
  /* THE CHECK PL-1 RECORDED RATHER THAN HALF-BUILT. A version leg naming THIS
     inquiry is a fact about one document and C-25.14 refuses it there. A leg
     naming an inquiry that TRANSITIVELY rests on this one is a fact about the
     stored graph, and it becomes a defect at exactly one moment: when a member
     accepts the version and its legs become what the answer rests on. Wired to
     `#basisCyclePath`, the walk `promote` already runs — never a second one. */
  VERSION_BASIS_CYCLE: {
    check: 'C-25.27',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'Accepting this reading would make the question rest, through a chain of other '
      + 'questions, on itself. The answer would then be its own support, which is a circle rather '
      + 'than a case, and the chain that closes it is named above.',
  },
  VERSION_NOT_ACCEPTED: {
    check: 'C-25.28',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'A project can only stand on a reading its members have accepted, and this one has '
      + 'not been accepted. Exploring an unsettled reading is done by calculating over it, which '
      + 'moves nobody\'s stance.',
  },
  VERSION_CURRENT_NO_PROJECT: {
    check: 'C-25.29',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'Standing on a reading is something a PROJECT does, so this request has to name '
      + 'which project. A question can be shared by several teams, and one team\'s decision must '
      + 'never quietly move another team\'s.',
  },
  VERSION_CURRENT_UNRELATED: {
    check: 'C-25.30',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'That project does not draw on this question, so it has no stance here to move. '
      + 'Add the question to the project first, and then choose what the project stands on.',
  },
  VERSION_ACT_UNWRITABLE: {
    check: 'C-25.31',
    where: 'src/store.mjs #moveVersionState, reached from the six version acts',
    translation: 'This question\'s own file could not be rewritten in place, so nothing was changed. '
      + 'Acting on a reading edits the record the reading lives in, and a half-written record is '
      + 'worse than an unchanged one.',
  },
};
/* The two ways a composition can compose, and DEC-32's own words for them. NOT a
   surface vocabulary: DEC-32's elicitation clause 1 bans "ground partition" and
   the AND/OR words from every member-facing screen (D-226), which is why every
   translation in BASIS_VERSION_CHECKS above says "every part is needed" and
   "would carry the answer on its own" instead. */
export const VERSION_RELATIONSHIPS = ['and', 'or'];
/* Wider than GROUND_LABEL_RE by design: a member names a version and will use a
   full stop. Still bounded, still a single line, still no leading space. */
export const VERSION_NAME_RE = /^[a-z0-9][a-z0-9 ._-]{0,63}$/i;

/** PL-1 / IS-1 — the version block's grammar, at BOTH gates through one function.
 *
 *  THE AUTHORED SHAPE IS THREE SIBLING ARRAYS joined by the version's NAME:
 *
 *      basis_versions[]        one row per version  (name, description,
 *                              relationship, state, derived_from, hidden,
 *                              claim, run, author, at, regroup_*)
 *      basis_version_grounds[] one row per (version, ground) with its
 *                              attribution — REC-45's act at the version's grain
 *      basis_version_legs[]    one row per leg, carrying `version` and `ground`
 *
 *  and that is `basis[]`/`grounds[]`'s own idiom one level up rather than a new
 *  one. It is also what the restricted frontmatter grammar can actually express:
 *  the parser reads arrays of objects with SCALAR properties, so a version
 *  carrying its legs as a nested array would not parse at all — measured against
 *  `parseFrontmatter` before the shape was chosen, not assumed.
 *
 *  TWO BOUNDS STATED RATHER THAN SILENTLY VIOLATED, both standing decisions of
 *  the record this item does not get to move:
 *
 *  1. **D-164 IS UNLANDED, so a version's legs address WHOLE BUNDLES.** There is
 *     no extent, no offset and no extraction method on a version leg, because the
 *     record cannot express one yet. A version therefore composes DOCUMENT-GRAIN
 *     legs and this comment is where it says so; when D-164 lands, the field
 *     arrives here with a writer rather than as a nullable column that reads like
 *     a precision the record never had.
 *  2. **D-184 / C-2.8 bound the leg vocabulary to information or inquiry.** Not
 *     projects, not actions, not entities — C-25.10 refuses everything else by
 *     name, at the version's own grain, because a version's legs do not pass
 *     through `checkInquiryBasis`'s loop over `basis[]`.
 *
 *  AND A THIRD BOUND, on what is NOT checked here: the transitive basis DAG. A
 *  version leg naming this inquiry is refused (C-25.14) because that is a fact
 *  about one document, but a leg naming an inquiry that transitively rests on
 *  this one is a cycle only the STORE can see, and it is refused at `basis[]` by
 *  `#basisCyclePath` at the moment a version's legs become the basis. That is
 *  IS-2's accept path and it is not built; PL-1 records the edge rather than
 *  half-building a second cycle walk that would drift from the first.
 *
 *  VERSION LEGS ARE DELIBERATELY *NOT* REQUIRED IN `references[]`, which is the
 *  one place this diverges from `basis[]`'s rules (C-6.3). `references[]` is what
 *  the INQUIRY points at; `refs` is its projection and the re-evaluation walk
 *  reads it. A SUGGESTED alternative account is not the inquiry's stance, and
 *  requiring its legs in `references[]` would let any machine suggestion silently
 *  expand the inquiry's own edge set — and with it the reverse index, the
 *  re-evaluation obligation and the cycle surface — before a member had accepted
 *  anything. The protection a reader actually needs is that the target EXISTS,
 *  and the store supplies it: promote resolves every version leg against
 *  `bundles` and refuses one that points at nothing, which is the resolve-or-refuse
 *  posture `action_basis` and `supersedes` already take.
 */
export function basisVersionFindings(fm, findings) {
  const rows = fm?.basis_versions;
  const legRows = Array.isArray(fm?.basis_version_legs) ? fm.basis_version_legs : [];
  const groundRows = Array.isArray(fm?.basis_version_grounds) ? fm.basis_version_grounds : [];
  const push = (key, message, repairs) => {
    const row = BASIS_VERSION_CHECKS[key];
    findings.push(f(row.check, 'error', message, repairs, key));
  };
  /* PL-3 / IS-4 — the same shape reading the SUGGEST family's registry. A second
     REGISTRY, deliberately not a second membership test: the kind vocabulary is
     `SUGGEST_KINDS` and this arm calls it rather than re-typing the five. */
  const pushSuggest = (key, message, repairs) => {
    const row = SUGGEST_CHECKS[key];
    findings.push(f(row.check, 'error', message, repairs, key));
  };

  if (rows === undefined || rows === null) {
    /* NO VERSION BLOCK IS LEGAL and always will be: every inquiry in the record
       today has none, and IS-1 adds an alternative to `basis[]` rather than
       replacing it. But an ORPHANED joined row is not "no block" — it is a
       version's legs with no version, which is the checkGrounds precedent for
       checking the attached arrays even when the anchor is absent. */
    for (let i = 0; i < legRows.length; i++)
      push('VERSION_ORPHAN_ROW', `basis_version_legs[${i}] names version '${String(legRows[i]?.version).slice(0, 48)}' and there is no basis_versions[] block`);
    for (let i = 0; i < groundRows.length; i++)
      push('VERSION_ORPHAN_ROW', `basis_version_grounds[${i}] names version '${String(groundRows[i]?.version).slice(0, 48)}' and there is no basis_versions[] block`);
    return;
  }
  if (!Array.isArray(rows)) {
    push('VERSION_ORPHAN_ROW', 'basis_versions is not an array');
    return;
  }

  const byName = new Map();               // name -> index in basis_versions[]
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i];
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      push('VERSION_ORPHAN_ROW', `basis_versions[${i}] is not an object`);
      continue;
    }
    const name = typeof v.name === 'string' ? v.name.trim() : '';
    if (!name || !VERSION_NAME_RE.test(name)) {
      push('VERSION_NAME_NOT_UNIQUE', `basis_versions[${i}].name '${String(v.name).slice(0, 60)}' is not a version name: 1 to 64 characters of letters, digits, spaces, '-', '_' and '.', naming this account of the evidence so a member can ask for it by name`);
      continue;
    }
    if (byName.has(name)) {
      push('VERSION_NAME_NOT_UNIQUE', `basis_versions[${i}] names '${name}', which basis_versions[${byName.get(name)}] already names: a version name is unique WITHIN ITS INQUIRY (global uniqueness would make naming absurd), and derived_from reads by name`,
        ['rename this version', 'or, if this is an edit of the other, derive it: give it its own name and derived_from the original']);
      continue;
    }
    byName.set(name, i);

    if (typeof v.description !== 'string' || v.description.trim().length < 12) {
      push('VERSION_NO_DESCRIPTION', `basis_versions[${i}] ('${name}') carries no description: every version carries a textual description of the composition, held to a commit message's standard — what changed and why — because it is what survives a conversation that was deliberately not kept`,
        ['describe what this reading of the evidence is and why it differs from the others']);
    }
    if (!VERSION_STATES.includes(v.state)) {
      push('VERSION_STATE_UNKNOWN', `basis_versions[${i}] ('${name}') is in state '${String(v.state).slice(0, 40)}': a version is one of ${VERSION_STATES.join(', ')}`);
    }
    /* PL-3 / IS-4 — THE SUGGESTION KIND, checked at the DOCUMENT gate as well as
       at the endpoint. ABSENT IS LEGAL and always will be: every version a
       member composes by hand carries no kind, and IS-4 adds a machine writer
       rather than replacing the authored path. A kind that is PRESENT and
       outside section 9's five is refused, because what a suggestion claims to
       be decides how it is read. */
    if (v.kind !== undefined && v.kind !== null && v.kind !== ''
        && !Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, String(v.kind).trim())) {
      pushSuggest('VERSION_KIND_UNKNOWN', `basis_versions[${i}] ('${name}').kind is '${String(v.kind).slice(0, 40)}': a suggestion is one of ${Object.keys(SUGGEST_KINDS).join(', ')} (section 9), and the set is closed so that a run reporting an empty search is distinguishable from a run that reported nothing`,
        ['name one of the five kinds', 'or leave kind out entirely — a version a member composed is not a suggestion of any kind']);
    }
    if (v.hidden !== undefined && v.hidden !== null && typeof v.hidden !== 'boolean') {
      push('VERSION_HIDDEN_NOT_BOOLEAN', `basis_versions[${i}] ('${name}').hidden is '${String(v.hidden).slice(0, 40)}': hiding a version is a boolean, because hiding it is ALL it does — the version stays in the record and stays queryable (DEC-29(b), D-214), so there is no third value for this field to hold`);
    }
    /* PL-2 / IS-2, layer 2 of the reason rule. `versionNeedsReason` is the ONE
       predicate — imported by store.mjs's transition and called here — so the
       two layers cannot come to disagree about which states carry a reason. */
    if (versionNeedsReason(v.state)) {
      const why = typeof v.state_reason === 'string' ? v.state_reason.trim() : '';
      const by = typeof v.state_by === 'string' ? v.state_by.trim() : '';
      if (why.length < 8 || !by || isMachineIdentity(by))
        push('VERSION_DISPOSITION_UNATTRIBUTED', `basis_versions[${i}] ('${name}') is in state '${v.state}' and carries state_by '${String(v.state_by).slice(0, 40)}' with state_reason '${why.slice(0, 40)}': ${VERSION_REASON_REQUIRED.join(' and ')} are the two states a member enters WITH a recorded reason (§6 rule 4), and the reason carries the name of the member who authored it — never a machine's, because a machine may propose an account of the evidence and may never settle one`,
          ['record state_by (a named member), state_at (an ISO timestamp) and state_reason on this version',
           'or leave the version suggested — a state nobody has moved it into needs no reason']);
      if (!ISO_TS_RE.test(String(v.state_at || '')))
        push('VERSION_DISPOSITION_UNATTRIBUTED', `basis_versions[${i}] ('${name}') is in state '${v.state}' and requires 'state_at' as an ISO timestamp (got '${String(v.state_at).slice(0, 40)}'): a decision made before a strength was seen is a different act from one made after it, and only a date lets a reader tell`);
    }
  }

  /* THE DERIVATION EDGE, and the tree it has to be. */
  for (const [name, i] of byName) {
    const df = rows[i].derived_from;
    if (df === undefined || df === null || df === '' || df === 'null') continue;
    if (typeof df !== 'string' || !byName.has(df.trim())) {
      push('VERSION_DERIVED_FROM_UNKNOWN', `basis_versions[${i}] ('${name}') is derived_from '${String(df).slice(0, 60)}', which is not a version of this inquiry: the derivation edge is how alternatives read as a tree rather than a pile`,
        ['name a version that exists in basis_versions[]', 'or set derived_from: null — a version a run composed fresh has no parent']);
    }
  }
  for (const [name, i] of byName) {
    const seen = new Set([name]);
    let cur = rows[i].derived_from;
    while (typeof cur === 'string' && byName.has(cur.trim())) {
      const p = cur.trim();
      if (seen.has(p)) {
        push('VERSION_DERIVATION_CYCLE', `basis_versions[${i}] ('${name}') sits in a derived_from cycle through '${p}': versions form a TREE, and a tree has a root — a cycle leaves no answer to which of these came first`);
        break;
      }
      seen.add(p);
      cur = rows[byName.get(p)].derived_from;
    }
  }

  /* THE JOINED ARRAYS. Orphans first, so a typo in `version` is named as a typo
     rather than surfacing three checks later as a version with no legs. */
  const legsOf = new Map();               // version name -> [ [index, leg] ]
  for (let i = 0; i < legRows.length; i++) {
    const l = legRows[i];
    const vn = l && typeof l.version === 'string' ? l.version.trim() : '';
    if (!byName.has(vn)) {
      push('VERSION_ORPHAN_ROW', `basis_version_legs[${i}] names version '${String(l?.version).slice(0, 60)}', which is not in basis_versions[]`);
      continue;
    }
    if (!legsOf.has(vn)) legsOf.set(vn, []);
    legsOf.get(vn).push([i, l]);
  }
  const groundsOf = new Map();            // version name -> Map(label -> row index)
  for (let i = 0; i < groundRows.length; i++) {
    const g = groundRows[i];
    const vn = g && typeof g.version === 'string' ? g.version.trim() : '';
    if (!byName.has(vn)) {
      push('VERSION_ORPHAN_ROW', `basis_version_grounds[${i}] names version '${String(g?.version).slice(0, 60)}', which is not in basis_versions[]`);
      continue;
    }
    const label = typeof g.ground === 'string' ? g.ground.trim() : '';
    if (!label || !GROUND_LABEL_RE.test(label)) {
      push('VERSION_GROUND_UNASSERTED', `basis_version_grounds[${i}].ground '${String(g.ground).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_'`);
      continue;
    }
    if (!groundsOf.has(vn)) groundsOf.set(vn, new Map());
    if (groundsOf.get(vn).has(label)) {
      push('VERSION_GROUND_UNASSERTED', `basis_version_grounds[${i}] declares '${label}' a second time for version '${vn}': one ground, one assertion, one member answering for it`);
      continue;
    }
    groundsOf.get(vn).set(label, i);
    /* REC-46's one predicate, never a word list: `token:member` and `class:member`
       reached the record here when this was asked as a word list. */
    if (typeof g.asserted_by !== 'string' || g.asserted_by.trim() === '' || isMachineIdentity(g.asserted_by)) {
      push('VERSION_GROUND_UNASSERTED', `basis_version_grounds[${i}].asserted_by '${String(g.asserted_by).slice(0, 40)}' is not a named member: "these legs are enough on their own" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it — never a machine's, and a machine-composed version PROPOSES the structure rather than asserting it`,
        ['name the member asserting that this ground is independently sufficient']);
    }
    if (!ISO_TS_RE.test(String(g.at || ''))) {
      push('VERSION_GROUND_UNASSERTED', `basis_version_grounds[${i}] requires 'at' as an ISO timestamp (got '${String(g.at).slice(0, 40)}'): a structure authored after a strength was seen is a different act from one authored before it (DEC-32), and only a date lets a reader tell`);
    }
  }

  /* PER VERSION: the legs, the partition, and the relationship it claims. */
  for (const [name, i] of byName) {
    const legs = legsOf.get(name) || [];
    const declared = groundsOf.get(name) || new Map();
    const labels = new Set();
    let unlabelled = 0;

    for (const [li, leg] of legs) {
      const t = leg.target;
      if (typeof t !== 'string' || !BUNDLE_ID_RE.test(t)) {
        push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').target '${String(t).slice(0, 40)}' is not a canonical bundle id`);
      } else if (typeof fm?.id === 'string' && t === fm.id) {
        push('VERSION_LEG_SELF', `basis_version_legs[${li}] (version '${name}') rests on ${t}, which is this inquiry: a question is not evidence for its own answer, in any account of it`);
      } else {
        const tt = normalizeType(OBJECT_TYPES[t.split('-')[0]]);
        if (tt !== 'information' && tt !== 'inquiry')
          push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').target '${t}' is a ${tt}: a leg rests on information or on another inquiry, nothing else (D-184)`);
      }
      if (!BASIS_ROLES.includes(leg.role))
        push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').role '${String(leg.role).slice(0, 40)}' is not one of: ${BASIS_ROLES.join(', ')}`);
      if (leg.grade !== undefined && leg.grade !== null && !BASIS_GRADES.includes(leg.grade))
        push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').grade '${String(leg.grade).slice(0, 40)}' is not one of: ${BASIS_GRADES.join(', ')} (absent or null means undetermined, and is STATED as such)`);
      if (leg.grade_axis !== undefined && leg.grade_axis !== null && !GRADE_AXES.includes(leg.grade_axis))
        push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').grade_axis '${String(leg.grade_axis).slice(0, 40)}' is not one of: ${GRADE_AXES.join(', ')}`);
      if (leg.grade_source !== undefined && leg.grade_source !== null && !GRADE_SOURCES.includes(leg.grade_source))
        push('VERSION_LEG_NOT_CITABLE', `basis_version_legs[${li}] (version '${name}').grade_source '${String(leg.grade_source).slice(0, 40)}' is not one of: ${GRADE_SOURCES.join(', ')}`);

      const g = typeof leg.ground === 'string' ? leg.ground.trim() : '';
      if (!g) { unlabelled++; continue; }
      if (!GROUND_LABEL_RE.test(g)) {
        push('VERSION_GROUND_UNASSERTED', `basis_version_legs[${li}] (version '${name}').ground '${g.slice(0, 60)}' is not a ground label`);
        continue;
      }
      labels.add(g);
      if (!declared.has(g))
        push('VERSION_GROUND_UNASSERTED', `basis_version_legs[${li}] (version '${name}') names ground '${g}', which no basis_version_grounds[] row declares: a ground that nobody asserted is independently sufficient cannot be one, and the finding must not take a maximum over a branch no member signed for`,
          [`add a basis_version_grounds[] row for version '${name}', ground '${g}', with asserted_by and at`]);
    }
    for (const [label, gi] of declared) {
      if (!labels.has(label))
        push('VERSION_ORPHAN_ROW', `basis_version_grounds[${gi}] declares '${label}' for version '${name}', which no leg of that version belongs to: a ground is a partition OF THE LEGS, and an empty one asserts that nothing is sufficient on its own`);
    }
    /* THE PARTITION IS TOTAL. Not checkGrounds' whole-or-not-at-all — a version
       does not get the not-at-all arm, because §3 requires it to CARRY the
       partition. An empty version (no legs at all) is legal and is NOT this
       finding: §9 lists "this level is empty" among the kinds a run may report,
       and a version saying the evidence is not there is a real answer. */
    if (legs.length && unlabelled)
      push('VERSION_PARTITION_INCOMPLETE', `version '${name}' has ${unlabelled} leg${unlabelled === 1 ? '' : 's'} with no ground while ${labels.size} ground${labels.size === 1 ? ' is' : 's are'} named: a version CARRIES its ground partition, so the partition is total — a leg nobody placed sitting beside branches somebody did is a relationship the record would have to guess at, and the guess that makes a finding stronger is the one it must never make`,
        ['give every leg of this version a ground — a leg needed whatever else holds belongs in every ground',
         'or put every leg in one ground and say relationship: and']);

    /* THE RELATIONSHIP: required, and checked AGAINST the partition. */
    const rel = typeof rows[i].relationship === 'string' ? rows[i].relationship.trim().toLowerCase() : '';
    if (!VERSION_RELATIONSHIPS.includes(rel)) {
      push('VERSION_NO_RELATIONSHIP', `basis_versions[${i}] ('${name}').relationship is '${String(rows[i].relationship).slice(0, 40)}': every version states how its legs compose — ${VERSION_RELATIONSHIPS.join(' or ')} — because a version with no relationship field re-ships the flat implicit-AND basis REC-42 corrected, and the two readings give different strengths`,
        ['relationship: and — every ground is necessary and the finding is no stronger than its weakest leg',
         'relationship: or — the grounds are alternatives, each claimed sufficient on its own by a named member']);
    } else if (labels.size) {
      const implied = labels.size > 1 ? 'or' : 'and';
      if (implied !== rel)
        push('VERSION_RELATIONSHIP_DISAGREES', `basis_versions[${i}] ('${name}') states relationship '${rel}' and is grouped into ${labels.size} ground${labels.size === 1 ? '' : 's'}, which composes as '${implied}': the stated relationship is what a member affirms at the accept ceremony, so it must be the one the structure actually has — otherwise an accepter signs for a reading that is not written down`,
          [`state relationship: ${implied}`,
           rel === 'or' ? 'or split the legs into the grounds you meant to be alternatives'
                        : 'or merge the grounds into one — legs in one ground are all necessary']);
    }

    /* DEC-50 / §6.7: THE ATTRIBUTED REGROUP. */
    const parent = typeof rows[i].derived_from === 'string' ? rows[i].derived_from.trim() : '';
    if (parent && byName.has(parent)) {
      const parentLabels = new Set();
      for (const [, l] of (legsOf.get(parent) || []))
        if (typeof l.ground === 'string' && l.ground.trim()) parentLabels.add(l.ground.trim());
      const sameShape = parentLabels.size === labels.size
        && [...labels].every((x) => parentLabels.has(x));
      const parentRel = typeof rows[byName.get(parent)].relationship === 'string'
        ? rows[byName.get(parent)].relationship.trim().toLowerCase() : '';
      if ((!sameShape || parentRel !== rel) && (labels.size || parentLabels.size)) {
        const by = rows[i].regroup_by;
        const note = rows[i].regroup_note;
        if (typeof by !== 'string' || by.trim() === '' || isMachineIdentity(by)
            || !ISO_TS_RE.test(String(rows[i].regroup_at || ''))
            || typeof note !== 'string' || note.trim().length < 8)
          push('VERSION_REGROUP_UNATTRIBUTED', `basis_versions[${i}] ('${name}') regroups the partition it inherited from '${parent}' and carries no attributed regroup act: DEC-50 licenses no unattributed structural edit, so the version records regroup_by (a named member, never a machine), regroup_at (an ISO timestamp) and regroup_note (the reason)`,
            ['record regroup_by, regroup_at and regroup_note on this version',
             'or leave the partition as it was inherited — an edit that only changes the evidence is not a regroup']);
      }
    }
  }
}

/* =========================================================================
 * PL-3 / IS-4 — THE SUGGEST ENDPOINT'S VOCABULARY AND ITS REFUSALS.
 *
 * THE FAMILY IS C-27. C-25 is PL-1's and PL-2's (basis versions and the sixth
 * state machine, C-25.1 to C-25.31) and C-26 is PL-12's (the bias object,
 * C-26.1 to C-26.11). Both were verified taken on this base before the number
 * was allocated, which is the check PL-12 recorded having skipped and paid for
 * with 102 moved references.
 *
 * WHAT THIS FAMILY IS FOR, and it is the whole acceptance of the item.
 * INVESTIGATIVE-SESSION.md section 14b.5 rules that the run VERIFIES ITS OWN
 * WORK BEFORE PROPOSING and that *"the checks run PLANE-SIDE"* (SWEEP C11): if
 * the fleet member computed them it would hold a copy of the plane's rules,
 * which is the drift class DEC-8 closed. So the six checks live in code beside
 * the endpoint, the fleet member receives their VERDICTS, and each one is a
 * C-number with a DEC-49 wire code and a canned translation.
 * ========================================================================= */

/* Section 9's five kinds. A suggestion is one of these and nothing else, and
   the table is here rather than in the store because two things read it: the
   endpoint, which refuses an unknown kind, and `basisVersionFindings`, which
   refuses a DOCUMENT carrying one. One table, no second spelling.

   EVERY KIND WRITES THE SAME OBJECT — a version in state `suggested` carrying
   its run — and that is section 10's ruling rather than a simplification here:
   *"Export means the AI adds a new version to the inquiry being investigated"*,
   so both modes use ONE write path and the fence needs no second design. What
   differs between the kinds is what the version SAYS, which is why the kind is
   a field on the version and not a second endpoint. */
export const SUGGEST_KINDS = {
  'basis-version': 'a new version of the inquiry\'s basis — the main output: a complete alternative '
    + 'composition with its legs, its branches and its description (section 6)',
  'sharpen-question': 'the inquiry asks two questions that need different evidence; here they are '
    + 'separated (section 8). The separation is carried as the version\'s claim',
  'new-inquiry': 'a proposition answering the question, with the first version of its basis '
    + '(section 8, under section 3\'s basis ruling)',
  'level-empty': 'we looked at this level — meaning, content, documents, or the open internet — and it '
    + 'is empty, with the observation-log address of the search that establishes it. Without this kind '
    + 'a run that honestly found nothing supportable is indistinguishable from a run that emitted '
    + 'nothing (SWEEP section 6), and section 15\'s empty-run instrument has no object to count',
  'new-edition': 'evidence bearing on a PUBLISHED finding. A published case cannot be changed, so the '
    + 'only act available is a new edition, and it is the member\'s',
};

/* The four levels `level-empty` may report on. CLAUDE.md's "NEVER ASSUME THE
   LOWER LEVELS ARE COMPLETE" names exactly these four, and saying WHICH absence
   is a first-class obligation there. */
export const SUGGEST_LEVELS = ['meaning', 'content', 'documents', 'internet'];

/* THE BOILERPLATE ROSTER, AND WHAT IT IS NOT.
 *
 * Section 14b.5: *"nothing in it is boilerplate — a version whose description or
 * reason field is placeholder text is not proposed. The placeholder defect is
 * already measured at human speed (`counterparty: to be named` satisfying a
 * non-empty check, PROCESS-INVENTORY); an AI filling required fields to clear a
 * gate is the same defect at machine scale."*
 *
 * THIS IS A BOUNDARY, NOT A PROSE JUDGE, and that limit is stated here for the
 * same reason D-130's counterparty check states its own: a machine that writes
 * "the relevant department" gets past every rule below, and a check that
 * pretended otherwise would be claiming a competence it does not have. What it
 * DOES catch is the machine-scale shape — a required field filled with a token
 * whose only job is to be non-empty.
 *
 * MATCHED AGAINST THE WHOLE FIELD, case-folded and trimmed, NEVER as a
 * substring. A substring rule would refuse a real sentence that quotes a
 * placeholder — *"the contract names the counterparty as 'to be named', which is
 * the defect"* is a perfectly good description of a finding, and refusing it
 * would be the over-strictness arm this item's suite runs. */
export const BOILERPLATE_FORMS = [
  'to be named', 'tbd', 'to be determined', 'n/a', 'na', 'none', 'null', 'undefined',
  'placeholder', 'todo', 'to do', 'tba', 'xxx', 'text', 'description', 'description here',
  'lorem ipsum', 'sample text', 'no description', 'see above', 'as above', 'same', 'ditto',
];
/* ONE PREDICATE, never a second copy of the membership test — IS-6's C-22.4
   control left its suite green at 98 of 98 because a rule had two
   implementations and either one absorbed the control. The endpoint imports
   this; nothing re-types the roster. */
export function isBoilerplate(s) {
  if (typeof s !== 'string') return true;
  const v = s.trim().toLowerCase().replace(/[.!?]+$/, '').trim();
  if (v === '') return true;
  /* Only punctuation, ellipsis, or an unfilled angle-bracket slot. */
  if (/^[\s.\-_*#'"`~<>[\]()]+$/.test(v)) return true;
  if (/^<[^>]*>$/.test(v)) return true;
  return BOILERPLATE_FORMS.includes(v);
}

/* PL-3 / IS-4 — THE SUGGEST ENDPOINT'S REFUSALS. Every row carries its
 * C-number, its DEC-49 wire code and the canned translation a surface renders;
 * a surface may RENDER a refusal it received and may never compute one (DEC-8).
 *
 * EVERY `where` NAMES A REGION AND NOT THE WHOLE FUNCTION (REC-71). A `where`
 * names THE SMALLEST SPAN IN WHICH THE ROW'S REFUSAL IS ENFORCED; a
 * whole-function `where` conscripts every refusal that arrives in that function
 * AFTER the row is written, which is how PL-1's two rows turned 32 unrelated
 * refusals into DEC-49's business and put `main`'s UI harness at exit 1.
 *
 * NO MEMBER-FACING STRING BELOW SAYS "ground", "partition", "AND" or "OR" as a
 * member-facing word — DEC-32's elicitation clause 1 and D-226, the same bound
 * VERSION_ACT_CHECKS and BASIS_VERSION_CHECKS respect, and the suite asserts it
 * of every translation rather than trusting this paragraph. */
export const SUGGEST_CHECKS = {
  /* ---- the shape of the request. Refused before anything is composed. ---- */
  SUGGEST_NO_TARGET: {
    check: 'C-27.1',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'That request did not say which question the suggestion is about. '
      + 'A reading of the evidence always belongs to one question, so it asks rather than guessing.',
  },
  SUGGEST_NOT_AN_INQUIRY: {
    check: 'C-27.2',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'Only a question carries readings of its evidence, and the thing named here is not a '
      + 'question. There is nothing under it for a suggestion to be a reading of.',
  },
  SUGGEST_UNKNOWN_KIND: {
    check: 'C-27.3',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'A suggestion is one of five kinds and this one names none of them. The kinds are a '
      + 'closed set so that a run reporting an empty search is told apart from a run that reported '
      + 'nothing at all, which no other field can distinguish.',
  },
  SUGGEST_NO_RUN: {
    check: 'C-27.4',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'Every suggestion names the piece of work that produced it, and this one named none '
      + 'that can be read here. What was searched, under which declared conditions, and where it '
      + 'stopped is what lets anyone else check a reading rather than take it on trust.',
  },
  SUGGEST_NAME_TAKEN: {
    check: 'C-27.5',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'This question already holds a reading by that name. Names are unique within one '
      + 'question so a member can ask for a reading by name, and a second one wearing the same name '
      + 'would make every later reference ambiguous.',
  },
  SUGGEST_EMPTY_LEVEL_UNSTATED: {
    check: 'C-27.6',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'Reporting that a level of the search is empty means saying WHICH level was searched '
      + 'and where the log of that search can be read. Absence at one level is not absence at the '
      + 'next, and an unattributed empty answer is the one shape nobody can check.',
  },
  /* SEPARATE FROM SUGGEST_UNWRITABLE_DOCUMENT, and the DEC-49 GUARD IS WHAT
     FORCED THE DISTINCTION rather than a design instinct. One code was written
     for both, and arm C failed the harness naming the file, the line, the region
     and the code: a `where` names ONE span, and a code minted in two regions
     cannot have one. Reading the row again with that in hand, they ARE two
     conditions — this one is "there is no file here to read", which is a fact
     about the question and is knowable before anything is composed; the other is
     "the file is in a shape this restricted grammar cannot be extended in
     place", which is a fact about the bytes and is only knowable at the write. */
  SUGGEST_NO_DOCUMENT: {
    check: 'C-27.17',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'This question has no readable file behind it, so there is nothing for a reading of its '
      + 'evidence to be added to. That is a fact about the question rather than about the reading, and '
      + 'nothing was composed.',
  },
  SUGGEST_TOO_MANY_LEGS: {
    check: 'C-27.7',
    where: 'src/store.mjs suggestVersion > is-suggest-shape',
    translation: 'This suggestion rests on more pieces of evidence than one reading may carry. The '
      + 'limit is published in the refusal so a caller can split the reading rather than guess at '
      + 'what would have fitted.',
  },

  /* ---- THE SIX PRE-WRITE CHECKS (section 14b.5). Each is its own C-number and
     each is removable ON ITS OWN, which is the owed control this item carries
     (VF-1 control 6): a control that removes them all together proves only that
     the block exists. ---- */

  /* CHECK 1. D-168 is the whole reason this is not a type check: `op=cite` is
     TYPE-ONLY today, so a naive reachability check would PASS RETIRED
     INFORMATION — a leg resting on a document the record has itself retired,
     reading to every later reader as live support. */
  SUGGEST_LEG_UNREACHABLE: {
    check: 'C-27.8',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'One of the pieces of evidence this reading rests on cannot be reached where it says '
      + 'it is: it is not in the record, it cannot be read from here, or the record has retired it. '
      + 'A reading resting on something retired reads to a later member as live support for the answer.',
  },
  /* CHECK 2. The pair, PER AXIS, over the version's own declared structure —
     DEC-21/DEC-44 refuse a single composed number four ways, so what has to
     compute is two answers and never one. */
  SUGGEST_PAIR_DOES_NOT_COMPUTE: {
    check: 'C-27.9',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'The strength of this reading does not work out over the structure it declares, on '
      + 'one or both of the two things strength is measured on. A reading whose arithmetic cannot be '
      + 'run is a reading nobody can check, and it is not put forward.',
  },
  /* CHECK 3. Section 6 rule 8, Bob's own words: a background run adds its output
     as a new version ONLY IF IT DIFFERS IN SUBSTANCE from every existing one.
     Compared over PL-1's CANONICAL COMPOSITION, byte for byte, which is the same
     bytes the freeze compares — so "the same reading" means one thing here. */
  SUGGEST_NOT_DIFFERENT: {
    check: 'C-27.10',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'This reading of the evidence is the same in substance as one this question already '
      + 'holds, so it is not put forward a second time. The reading it matches is named, and adding a '
      + 'duplicate would grow the review pile without adding anything to review.',
  },
  /* CHECK 4. D-195, and *"the Judith Miller error with arithmetic behind it"* is
     what the sweep called an AI composing alternatives at volume. The arithmetic
     takes a MAXIMUM across independently sufficient branches, so two branches
     that trace to one upstream origin make a finding look stronger for a reason
     that is not there. Content-addressed provenance lets the plane DERIVE it. */
  SUGGEST_BRANCHES_NOT_INDEPENDENT: {
    check: 'C-27.11',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'Two parts of this reading are offered as separate routes to the same answer, and the '
      + 'record can show they trace back to the same original material. Treating them as separate '
      + 'makes the answer look better supported than it is, so a machine may not put it forward that '
      + 'way; a member may still say they are genuinely separate, and that is their call to sign for.',
  },
  /* CHECK 5. The placeholder defect at machine scale. */
  SUGGEST_BOILERPLATE: {
    check: 'C-27.12',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'A field this reading has to fill in carries filler text rather than an account of '
      + 'anything. A required field filled to get past a check is worse than an empty one, because it '
      + 'reads to the next member as something somebody wrote.',
  },
  /* CHECK 6. Section 4: THE AI HOLDS NO OP THAT ACCEPTS. The sole possible
     output of this endpoint is a version in state `suggested`, so anything the
     caller says about state, about hiding, about who decided and why, or about
     what a project stands on is refused rather than ignored. */
  SUGGEST_UNWRITABLE_STATE: {
    check: 'C-27.13',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'This suggestion tries to arrive already decided — settled, set aside, hidden, or '
      + 'signed by somebody. A suggestion may only ever arrive as something put forward; deciding '
      + 'what to do with it is a named member\'s act and no automated caller can reach it.',
  },

  /* THE CHECK THAT DID NOT FINISH, and it is its own condition rather than a
     verdict borrowed from one of the two checks that can hit it. `heldMatch`
     learned this the hard way and D-129 wrote it down: NOT FOUND and DID NOT
     FINISH LOOKING are different facts, and only one of them licenses a
     conclusion. Both check 3 and check 4 read row sources whose size is a
     property of the record rather than of the submission, so both publish a
     bound and both FAIL CLOSED when they reach it — a duplicate the comparison
     never got to, or a shared origin the trace never reached, would otherwise be
     a silent pass on the safe-looking side. */
  SUGGEST_COMPARISON_INCOMPLETE: {
    check: 'C-27.16',
    where: 'src/store.mjs suggestVersion > is-suggest-checks',
    translation: 'The record holds more material behind this question than could be checked in one '
      + 'pass, so whether this reading is genuinely new, or genuinely made of separate parts, was not '
      + 'settled either way. Not finishing the check is a different fact from passing it, and this '
      + 'record does not let the two read the same.',
  },

  /* ---- the write itself. Separate from check 6 on purpose: that one is about
     the STATE the caller asked for, this one is about the DOCUMENT. ---- */
  SUGGEST_UNWRITABLE_DOCUMENT: {
    check: 'C-27.14',
    where: 'src/store.mjs suggestVersion > is-suggest-write',
    translation: 'This question\'s own file could not be extended in place, so nothing was written. '
      + 'Adding a reading edits the record the reading lives in, and a half-written record is worse '
      + 'than an unchanged one.',
  },

  /* ---- the catalog's own row, fired from `basisVersionFindings` above at both
     gates. A DOCUMENT can carry a kind without ever passing through the
     endpoint — a hand-authored file, a replayed revision, a future writer — and
     none of those go through the op, which is the same two-layer reasoning
     C-25.19 records one family up. ---- */
  VERSION_KIND_UNKNOWN: {
    check: 'C-27.15',
    where: 'checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote',
    translation: 'This reading says it is a kind of suggestion nobody recognises. The kinds are a '
      + 'closed set because what a suggestion CLAIMS to be decides how it is read, and a kind outside '
      + 'the set is a claim with nothing behind it.',
  },
};

/* =========================================================================
 * PL-12 / D-84 — THE BIAS OBJECT'S REFUSALS, and DEC-54's four scopes given
 * C-NUMBERS so that each is a MECHANISM rather than a paragraph.
 *
 * THE FAMILY IS C-26 AND NOT C-25, AND THE REASON IS RECORDED HERE RATHER THAN
 * ONLY IN A COMMIT MESSAGE, because a renumbering that leaves no note reads to
 * the next allocator as a family somebody skipped. This item allocated C-25.1
 * to C-25.10; **PL-1 (basis versions) landed on `main` while it was running and
 * allocated C-25.1 to C-25.18** for an entirely different family. Neither
 * session could see the other — they ran in separate worktrees off one base —
 * and CONDUCT found the collision at integration. Under the collision protocol
 * the EARLIER MERGE keeps its numbers, so this allocation moved wholesale to
 * C-26, verified free on `main` first (the only `C-26` strings anywhere in the
 * plane name item REC-26, which is not a check). 102 references moved by regex
 * on the NUMBER, so C-25.10 could not be mangled by a C-25.1 rule.
 *
 * WHAT THIS COSTS A READER OF OLD BYTES: nothing. No bias bundle has ever been
 * written under a C-25 number — the family had not left this branch — so there
 * is no history carrying the old spelling and no alias is owed. That is the one
 * question worth asking before renumbering anything in this repository, and it
 * is answered rather than assumed.
 *
 * SEVEN OF THESE JUDGE A DOCUMENT and fire in `checkBiasExtension` above;
 * three fire in the plane, at the two write paths a document cannot reach —
 * the adoption and the inhale. The split follows AI_RUN_CHECKS' precedent
 * exactly: the catalogue is where a C-number is MINTED, and where the refusal
 * FIRES is a separate question.
 *
 * WHY THE ALLOCATION AND THE TRANSLATION ARE ONE ROW: DEC-49 (Bob, 2026-08-06;
 * QUEUE.md REC-64). Every refusable condition carries an error code with a
 * canned translation, the map is read from ONE place rather than copied, and an
 * untranslated code FAILS THE HARNESS rather than reaching a member.
 *
 * A NOTE ON TONE THAT IS NOT A NOTE ON TONE. Every translation here names
 * WHERE THE SENTENCE BELONGS rather than only refusing it. That is DEC-54 (a)'s
 * requirement, not politeness: a newsroom's "more than one source" is a
 * legitimate rule filed in the wrong construct, and a refusal that does not say
 * "declare it as your project's required_strength" leaves a member believing
 * BIO cannot express their standard — which is the failure that ends with the
 * standard being claimed and not followed, the exact gap Bob named when he
 * ruled the inhale ("claiming a standard you don't follow, and denying a bias
 * that you do have").
 * ========================================================================= */
export const BIAS_CHECKS = {
  /* Statement anatomy, the shape half: an id that an override can name, a kind
     in the closed set of three, and a declarative to apply. */
  BIAS_STATEMENT_MALFORMED_SHAPE: {
    check: 'C-26.1',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'One of these bias statements is missing something the record needs to apply it: '
      + 'a stable name, one of the three kinds it can be, or the sentence itself. '
      + 'The three kinds are raising scrutiny on a source, blocking or licensing an inference, '
      + 'and asserting an evidenced pattern — a standard of evidence is not one of them; that is a bar.',
  },
  /* Safeguard 4: subjects are registry entries, not free text. */
  BIAS_STATEMENT_SUBJECT_NOT_REGISTERED: {
    check: 'C-26.2',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'That statement names its subject in prose rather than pointing at the subject registry. '
      + 'Registry entries are what let the record notice when a project statement and an instance '
      + 'statement are about the same thing — in prose, nothing can tell, and a collision that is '
      + 'quiet is the one this construct exists to prevent.',
  },
  /* The justification requirement, on every kind. */
  BIAS_STATEMENT_NO_JUSTIFICATION: {
    check: 'C-26.3',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'That statement does not say why the lens is held. '
      + 'A declared bias the system honours is one its author justified; without that it is an '
      + 'unstated prior with a form around it.',
  },
  /* kind=pattern IS analysis, so it cites or it stays in draft. */
  BIAS_PATTERN_UNCITED: {
    check: 'C-26.4',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'A pattern statement is a claim about how an institution actually behaves, so it is '
      + 'analysis and needs evidence in the record. It can be written in draft without one; '
      + 'it cannot leave draft without one.',
  },
  /* DEC-54 scope FOUR: the malformedness refusal. */
  BIAS_STATEMENT_ISSUES_A_VERDICT: {
    check: 'C-26.5',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'That statement assigns a truth value to a source wholesale, and declared bias may '
      + 'never issue verdicts. It may raise scrutiny, it may block an inference, and it may assert '
      + 'a pattern it can evidence. The construct that fights undeclared distortion is held to a '
      + 'higher standard than the distortion, so this is refused whoever declares it.',
  },
  /* DEC-54 scope ONE: split bars from bias. */
  BIAS_STATEMENT_IS_A_BAR: {
    check: 'C-26.6',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate; '
         + 'and src/store.mjs biasInhale, which routes the same sentences into bars[] instead',
    translation: 'That is a standard of evidence — how strong support must be before you assert it — '
      + 'and a standard is a BAR rather than a lens. Declare it as your project\'s required strength, '
      + 'where it will actually refuse work that falls short. Filed here it would refuse nothing, '
      + 'because a declared bias is disclosed and never gates.',
  },
  /* DEC-54 scope TWO: the unenforceable residue is a published output. */
  BIAS_RESIDUE_UNSTATED: {
    check: 'C-26.7',
    where: 'checks/bio-checks.mjs checkBiasExtension, run at op=promote and at the gate',
    translation: 'This bias set is adopted and does not say what it does NOT check. '
      + 'A case held to a standard has to say which parts of that standard this system verifies and '
      + 'which it does not — the parts that can be counted are rarely the parts that protect, and '
      + 'enforcing only the countable half while staying silent would carry the authority of the '
      + 'whole policy without its substance.',
  },
  /* DEC-54 scope THREE: inhale proposes, never installs. */
  BIAS_INHALE_CANNOT_ADOPT: {
    check: 'C-26.8',
    where: 'src/store.mjs biasInhale, reached from op=biasinhale',
    translation: 'Reading a policy proposes a bias set; it never adopts one. '
      + 'Adopting is something a member does with their name on it, because otherwise a group could '
      + 'say it follows an organisation\'s standards without anybody in the group having agreed to '
      + 'anything.',
  },
  /* The adoption's own two. A machine credential holds no name to put on an
     authored act (DEC-46, D-90, D-82), and an adoption of a set that was never
     proposed would reach `adopted` around the state machine. */
  BIAS_ADOPTION_NOT_AUTHORED: {
    check: 'C-26.9',
    where: 'src/store.mjs biasAdopt, reached from op=biasadopt',
    translation: 'Adopting a bias set is an authored, attributed act and an automated credential '
      + 'has no name to put on it. Sign in as a member.',
  },
  /* THE WRITE PATH'S OWN REFUSAL, and it is here because VF-2's DEC-49 guard
     found it missing — which is the guard working exactly as its ruling
     intends. `promote` refuses a malformed bias set with `reason:
     "BIAS_REFUSED"` and a `findings[]` array in which EVERY entry already
     carries its own C-number, code and canned translation. That looked
     complete and was not: a surface renders a translation keyed on the code the
     plane SENT, and the code it sends FIRST — the one on the envelope — had no
     row at all. A member meeting it would meet machine vocabulary while the
     translations sat one level down in a list the surface had no reason to
     open. So the container gets a translation of its own, and it says the one
     thing the per-finding translations cannot: that NOTHING LANDED.
     ITS `where` NAMES `store.mjs` RATHER THAN THE CATALOGUE, unlike its ten
     siblings, because that is where it FIRES — and naming the site is what puts
     this code inside the guard's governed set. The ten above fire in
     `checkBiasExtension` and say so.
     NARROWED TO A REGION 2026-08-08 BY REC-71, AND PL-12'S REASONING ABOVE IS
     PRESERVED RATHER THAN OVERTURNED — only the GRAIN was wrong. This read
     `src/store.mjs promote`, and at whole-function granularity that claimed all
     ~960 other lines of `promote` for BIAS_CHECKS: **34 long-standing refusals
     were conscripted and the UI harness went red a second time within hours of
     the first, in the family next door.** BEING AN ENVELOPE IS A FACT ABOUT THE
     REFUSAL'S SHAPE — it wraps per-finding codes — AND SAYS NOTHING ABOUT ITS
     SPAN. This one fires at a single statement inside a single `if`. The reasoning
     in full, including what WOULD justify the wider spelling, is at the marker in
     `store.mjs`; see also the "WHAT A `where` MEANS" block at the head of this
     file. */
  BIAS_REFUSED: {
    check: 'C-26.11',
    where: 'src/store.mjs promote > bias-set-refusal, reached from op=promote',
    translation: 'That bias set was not written. One or more of its statements is not something the '
      + 'record can honour, and each one is named below with what is wrong with it. '
      + 'Nothing was saved, so nothing needs undoing — correct the statements and write it again.',
  },
  BIAS_ADOPTION_NOT_PROPOSED: {
    check: 'C-26.10',
    where: 'src/store.mjs biasAdopt, reached from op=biasadopt',
    translation: 'That bias set has not been proposed for adoption, so there is nothing to adopt yet. '
      + 'A set is written, then proposed, then adopted — and the middle step is what stops a set '
      + 'becoming binding without anybody having offered it.',
  },
};

/* =========================================================================
 * PL-4 / IS-4 / SWEEP 4b.1 — THE CAPTURE-REQUEST DOOR AND DEC-47's CONDUCT.
 *
 * DEC-47 CLOSED THE AUTHORISATION QUESTION AND LEFT CONDUCT OPEN. Bob,
 * 2026-08-06: *"the user has already said, in effect, I (we) have opened this
 * inquiry, which we're using this investigation session to answer. That's your
 * authorization."* A member asked to approve forty URLs *"has not done the
 * research and cannot judge them"*, so a per-fetch dialog adds paperwork without
 * judgement — the empty gate this project refuses everywhere else. NOTHING IN
 * THIS FAMILY ASKS PERMISSION. EVERY ROW IS ABOUT BEHAVIOUR.
 *
 * AND THE CONDUCT IS ENFORCED ONCE, AT THE DRAIN. Not at the request, not at
 * op=acquire, not in the fleet member. One point, so the rules cannot be half
 * applied by a caller that reached the store another way, and so a reader
 * looking for "how does this instance behave out there" finds one span.
 *
 * THE THREE CONDUCT RULES, and each is MEASURED rather than stylistic:
 *   1. A UA WITH A CONTACT URL. D-94's nine-rung ladder, second-path confirmed:
 *      removing the contact component flips admission 200 -> 403 UNIFORMLY. So
 *      this is not politeness, it is the thing that decides whether the fetch
 *      happens at all — and SOURCE-ACCESS.md's standing position is that BIO
 *      does not disguise its requests. BOB-3 permits the MEMBER'S OWN browser UA
 *      for publicly available documents, which is delegation rather than
 *      disguise (authorship is the distinction), and this family admits it as a
 *      SECOND LEGIBLE FORM rather than as an exemption from legibility.
 *   2. A PURPOSE TOKEN. The UA's `purpose` component is what lets a source tell
 *      a capture from a monitoring re-check, so an investigation fetch names
 *      itself rather than borrowing a word that means something else.
 *   3. RATE. The per-host governor already paces every outbound fetch; what the
 *      drain adds is that a host in COOL-OFF is not drained at all, and that one
 *      tick fetches at most once per host. DEC-47: a stranger's server has no
 *      relationship with this instance.
 *
 * WHAT IS DELIBERATELY NOT A RULE HERE, and it is a RULING rather than an
 * omission: `robots.txt` DISALLOWS DO NOT BAR CAPTURE OF PUBLICLY AVAILABLE
 * DOCUMENTS (BOB-3, RULED 2026-08-07, DEC-47's access-parity amendment —
 * *"members of this workflow should/must have rightful access to the same public
 * documents any manual user has access to"*). There is no robots row in this
 * family and the drain fetches no `robots.txt`. The suite drives a document
 * under a `Disallow` path and asserts it CAPTURES, because a rule that is absent
 * BY DECISION needs an arm proving the absence is real.
 * ========================================================================= */

/** The UA `purpose` component this door may name. A CLOSED set: an unknown
 *  purpose is not a harmless label, it is this instance telling a source
 *  something false about why it is asking. `investigate` is the token DEC-47
 *  said an investigation fetch *"introduces or reuses deliberately"*; `acquire`
 *  is the existing one and is admitted so a run re-fetching a source a member
 *  already named does not have to misdescribe that either. */
export const CAPTURE_PURPOSES = ['investigate', 'acquire'];

/** The two LEGIBLE user-agent forms, and there is no third. `civicos` is the
 *  honest product string with its contact URL (`userAgent()` in index.mjs);
 *  `member-browser` is BOB-3's delegation of the member's OWN browser UA, which
 *  is permitted for publicly available documents and is a member speaking as
 *  themselves through a tool they run. A fabricated string is neither, and this
 *  door cannot express one. */
export const CAPTURE_UA_MODES = ['civicos', 'member-browser'];

/** Is this user-agent LEGIBLE — does it name a contact a third party can reach?
 *  ONE predicate, used by the drain's conduct check and by the suite, so the
 *  rule and its test cannot disagree. It matches the `(+<url>)` component
 *  D-94's ladder measured, and it is deliberately a SHAPE test rather than a
 *  reachability test: whether the URL resolves is SOURCE-ACCESS.md's own open
 *  item, and a conduct check that fetches would be a conduct check that can fail
 *  for the network's reasons. */
export function userAgentIsLegible(ua) {
  if (typeof ua !== 'string' || ua.trim() === '') return false;
  return /\(\+https?:\/\/[^\s)]+/.test(ua);
}

/** THE ONE COMPOSER FOR THE HONEST CIVICOS AGENT, and it is HERE rather than in
 *  `index.mjs` so that the Durable Object can read the string it is about to
 *  cause to be sent. `index.mjs`'s `userAgent(env, purpose)` now delegates to
 *  this and keeps its own name and every call site, so `subresources.test.mjs`'s
 *  pin — every outbound `"user-agent":` in the control plane goes through
 *  `userAgent(env, …)` — is untouched.
 *
 *  WHY THE MOVE RATHER THAN A SECOND COPY. SOURCE-ACCESS.md records that this
 *  string replaced *"two bare tokens spread across three call sites that did not
 *  agree with each other"*, and the 403 that cost three sessions of wrong
 *  reasoning was the consequence. A conduct check reading a copy would be that
 *  defect rebuilt one layer down: the drain would approve a string nobody sends.
 *
 *  The components are D-94's, and the contact URL is the LOAD-BEARING one:
 *  removing it flips admission 200 -> 403 uniformly (MEASURED 2026-07-30, nine
 *  rungs, second path confirmed). */
export const CIVICOS_CONTACT_URL = 'https://github.com/believeinoakland/bio';
export function civicosUserAgent(version, instance, purpose) {
  return `CivicOS/${version || '0.0.0'} (+${CIVICOS_CONTACT_URL}; instance ${instance || 'unnamed'}; ${purpose})`;
}

export const CAPTURE_REQUEST_CHECKS = {
  /* ---- THE DOOR. Refused at the request, before any row exists. These are
     SHAPE rules and NOT conduct: conduct is enforced once, at the drain. ---- */
  CAPTURE_REQUEST_NO_RUN: {
    check: 'C-28.1',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'This request did not name the piece of work asking for it, or named one that is not '
      + 'running here. Every fetch this instance makes on its own is traceable to a session somebody '
      + 'opened, because that opening is what authorises it.',
  },
  CAPTURE_REQUEST_NOT_PUBLIC: {
    check: 'C-28.2',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'What was asked for is not a public web address. What an investigation session may '
      + 'reach is what anybody could reach by typing it into a browser, so an address that is not '
      + 'public on its face is not asked for at all.',
  },
  CAPTURE_REQUEST_NOT_AN_INQUIRY: {
    check: 'C-28.3',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'A capture is requested under a question, and the thing named here is not one. '
      + 'The question is what the request is accountable to, and a fetch belonging to nothing is a '
      + 'fetch nobody can later account for.',
  },
  /* THE SPINE, AT THE DOOR. Section 4: *"capturing a document (with provenance
     preserved) is something the daemon does (sometimes at the suggestion of an
     AI)"* — so the requester holds no capture write at all and never touches the
     provenance chain, which is the foundation the trust model rests on. A
     request arriving WITH bytes, a sha or a provenance hop is a caller trying to
     be the fetcher, and it is refused by name rather than having its fields
     quietly dropped: a caller told nothing learns nothing. */
  CAPTURE_REQUEST_CARRIES_A_CAPTURE: {
    check: 'C-28.4',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'A request asks for a document; it never brings one. The fetch is performed by this '
      + 'instance itself so that where the bytes came from is something the record established rather '
      + 'than something it was told, and a provenance chain anybody could hand us is one anybody could '
      + 'invent.',
  },
  /* WHAT IS NOT HERE, AND WHY IT WAS REMOVED RATHER THAN KEPT FOR SYMMETRY.
     The door also refused an incomplete attribution at one point in this item's
     construction (C-28.5). DRIVING THE FAMILY EXPOSED IT AS A DEFECT: with the
     same predicate at the door and at the drain, the door's refusal makes the
     DRAIN'S unreachable, so one of the two codes could never be driven — and a
     refusal nobody can drive is a refusal nobody can prove fires, which is
     DEC-49's floor failing in the same way a control that asserts nothing does.
     Attribution is judged ONCE, at the drain, for the same reason conduct is:
     the drain is the last point before anything leaves, and a row can outlive
     the rules the door applied to it. C-28.5 is therefore UNALLOCATED. */

  /* ---- DEC-47's CONDUCT. ALL OF IT FIRES AT THE DRAIN AND NOWHERE ELSE. ---- */

  /* CONDUCT 1: legibility. */
  CAPTURE_CONDUCT_UA_ILLEGIBLE: {
    check: 'C-28.6',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'This instance will not fetch without saying who is asking and how to reach whoever '
      + 'is running it. Being refused honestly is a fact that can be recorded; being admitted by '
      + 'disguise is a claim that could not be defended later.',
  },
  /* CONDUCT 1b: the member-browser form, which is DELEGATION and not disguise —
     but only if the member's own agent was actually RECORDED. Inventing one
     would be the fabricated-Mozilla case wearing BOB-3's clothes, so an
     unrecorded member agent is refused rather than substituted. */
  CAPTURE_CONDUCT_UA_UNRECORDED: {
    check: 'C-28.7',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'This request asked to fetch as the member\'s own browser, and the record does not '
      + 'hold what that browser is. Presenting an agent nobody actually used would be inventing a '
      + 'client rather than speaking as one, so it asks rather than guessing.',
  },
  /* CONDUCT 2: the purpose token. */
  CAPTURE_CONDUCT_NO_PURPOSE: {
    check: 'C-28.8',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'Every request this instance makes says what it is for, so a source can tell a first '
      + 'capture from a routine re-check and throttle one without blocking the other. This one names '
      + 'a purpose that is not one of the things it could truthfully be doing.',
  },
  /* CONDUCT 3: rate. */
  CAPTURE_CONDUCT_HOST_HELD: {
    check: 'C-28.9',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'The site this would fetch from has asked us to slow down, or has refused us recently, '
      + 'and we are waiting the interval it named. The request is still queued and will be made when '
      + 'the wait is over — nothing has been lost and nothing needs re-asking.',
  },
  CAPTURE_CONDUCT_TICK_SPENT: {
    check: 'C-28.10',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'This round of fetching has already been to that site once. Requests are spread out '
      + 'rather than sent in a burst, so this one waits for the next round. It is still queued.',
  },

  /* ---- THE ATTRIBUTION, composed at the drain, and its own two refusals. ---- */
  /* DEC-27(b) IS EXPLICIT THAT THE RECORD STATES BOTH — *"the assistant captured
     this, at Anna's request"* — and this design adds one distinction: the
     Claude-account principal (WHICH LEVEL of the cascade paid for the reasoning)
     and the plane-credential principal (whose scope the writes ran under) are
     DIFFERENT principals. A record naming only one of them is the defect, so the
     composer REFUSES rather than composing half an attribution, and no capture
     is performed on a request it cannot account for. */
  CAPTURE_ATTRIBUTION_ONE_PRINCIPAL: {
    check: 'C-28.11',
    where: 'src/store.mjs #captureRequestConduct > is-capture-conduct',
    translation: 'This capture could not be recorded as belonging to anybody in particular, so it was '
      + 'not made. An act that names one party where two acted reads as though a person did something '
      + 'a machine did, or the other way round, and that is worse than a missing document.',
  },
  /* THE ACT IS VISIBLY THE MACHINE'S BY CONSTRUCTION AND HAS NO CODE, which is
     the second thing driving this family corrected. REC-2's `token:<class>`
     stamp is the record's only durable trace of an unattended write, and a
     capture attributed to a person's name would be this record claiming a member
     fetched something they never touched. But the composer builds the actor from
     `MACHINE_AUTHOR_PREFIX` and a literal, so it CANNOT be a person's name: a
     refusal for that condition would be a gate for something the code cannot
     produce — the empty gate this project refuses everywhere else — and it would
     mint a code nobody could ever drive. The property is ASSERTED over the
     composer's output instead. C-28.12 is therefore UNALLOCATED.

     THE DRAIN IS THE SOLE FETCHER. op=acquire's capture-request arm admits a row
     in `draining` and nothing else, and `draining` is set by the drain inside
     the tick that then fetches. So a caller holding a real request id still
     cannot make the plane fetch for it. This is the AI-does-not-capture gate
     expressed as a SHAPE rather than as a class list, which is what makes it
     hold for a credential class that does not exist yet (PL-11). */
  CAPTURE_NOT_DRAINING: {
    check: 'C-28.13',
    where: 'src/index.mjs captureRequestArm > is-capture-request-arm',
    translation: 'Only this instance\'s own background worker fetches documents, and it does so from '
      + 'its own queue. Nothing else can ask it to fetch something right now — including the assistant '
      + 'that asked for the document in the first place.',
  },
  /* PL-15 / D-213 — THE LEAD'S TWO DOOR REFUSALS, ADDED TO THIS FAMILY RATHER
     THAN TO A NEW ONE. They are enforced inside `is-capture-request`, which is
     THIS family's governed span, so a row anywhere else would leave two codes
     in a region whose rows do not name them and arm C would report a site it
     could not judge. SK-1's rule applies with it: a family is a FLOOR, and
     minting one for two rows on somebody else's door buys slack for everybody
     else's walk. C-28.14 and C-28.15 — C-28.12 stays UNALLOCATED (see above),
     because reusing a number this file records as deleted would make its own
     history unreadable.

     WHY THE DOOR AND NOT THE DRAIN. PL-4 moved attribution to the drain because
     identical predicates at both points made one of two codes undrivable. That
     reasoning does not reach these: the lead is a claim about the RECORD's own
     shape, checkable the instant it arrives and never again — the drain has no
     second opinion about whether a bundle is a question — so checking it at the
     door refuses the row before it is stored rather than after it was fetched
     for. Nothing downstream re-checks it, so neither code is shadowed. */
  CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY: {
    check: 'C-28.14',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'This says the document bears on another question, but what it names is not a '
      + 'question. The whole point of noting a lead is that somebody working that question will be '
      + 'told about it, and there is nobody to tell if it does not name one.',
  },
  CAPTURE_REQUEST_LEAD_IS_THE_TARGET: {
    check: 'C-28.15',
    where: 'src/store.mjs captureRequest > is-capture-request',
    translation: 'This names the same question twice — the one being worked, and the one the '
      + 'document supposedly bears on. Evidence for the question you are already working is just '
      + 'evidence for it, and flagging it as belonging somewhere else would put a note in front of '
      + 'you saying a document you just asked for is about something other than what you asked.',
  },
};

/* =========================================================================
 * C-29 — THE `ai` CREDENTIAL CLASS AND ITS DECLARED TASK SCOPE (PL-11 / IS-5,
 * D-199's five determinations). NINE C-NUMBERS ALLOCATED HERE AND NOWHERE ELSE,
 * and every one of them is DRIVEN in test/aicredential.test.mjs — PL-4's rule,
 * paid at allocation rather than discovered later: an undrivable code is a
 * refusal nobody can prove fires.
 *
 * THE FAMILY SPANS TWO FILES, AND THE SPLIT IS THE ITEM'S SHAPE RATHER THAN AN
 * ACCIDENT OF WHERE THE CODE FELL.
 *
 *   src/store.mjs   — WHO MAY MINT, and WHAT THE RECORD MUST SAY. Minting is a
 *                     MEMBER act (D-199 (3)) and the record names the token
 *                     IDENTITY and the PRINCIPAL behind it (D-199 (4)). Both
 *                     are facts about the record, so they are judged where the
 *                     record is written.
 *   src/index.mjs   — WHAT A SCOPE MAY REACH. The reach question is the CONTROL
 *                     PLANE's, because the OPS table is the only thing that
 *                     knows what an op is and which classes may call it. The
 *                     store cannot see it and must not keep a copy.
 *
 * THE FENCE IS A SHAPE, NOT A CLASS LIST, AND THAT IS PL-4'S DELEGATED
 * CONSTRAINT DISCHARGED. `AI_SCOPE_BEYOND_MEMBER_REACH` compares the op against
 * ONE property of the OPS table — does a MEMBER class reach it — and nothing
 * else. op=capturerequestdrain carries no member class BY CONSTRUCTION (PL-4:
 * "a member reaching for it by hand would be a person doing the daemon's job"),
 * so no authored scope can ever name it, and adding "ai" to its class list
 * would admit nothing either, because no op's class list is consulted for this
 * class at all. Two independent proofs, both driven.
 *
 * WHY THE GATE REFUSES WITH ONE CODE AND THE MINT WITH TWO. The mint judges the
 * DECLARATION -- may this sentence be written into the record at all -- and the
 * gate judges the CALL against a declaration already judged. PL-4 measured what
 * happens when the same predicate sits at two points: one of them becomes
 * unreachable and its code cannot be driven. So the floor is re-evaluated at the
 * gate on every call (a row can outlive the rule that admitted it) but it
 * answers with the gate's own code, and the mint's two codes are about the act
 * of authoring rather than about the act of calling.
 *
 * WHAT IS NOT HERE. There is no `AI_CREDENTIAL_SCOPE_NOT_ON_THE_RECORD`. A scope
 * that is not on the record is not a narrower scope; it is NO CREDENTIAL, and
 * the caller is unauthenticated by the ordinary route. Minting a code for a
 * state the code cannot produce is the empty gate this repository refuses
 * everywhere else — C-28.12's reasoning, one item on.
 * ========================================================================= */
export const AI_CREDENTIAL_CHECKS = {
  /* ---- THE MINT. A MEMBER ACT, AND WHAT THE RECORD MUST SAY. ---- */

  /* D-199 (3), and it is the determination with the sharpest consequence: *"If
     an agent can request a broader token, the scoping is theatre."* This rides
     REC-46's ONE machine-identity predicate, which means it fires for
     `token:ai` without this site knowing that class exists — the same
     generalisation D-199 (5) claims for the MACHINE_CANNOT_* family, arriving
     at the one act that could undo all of them.

     IT IS DRIVEN FROM BOTH SIDES, and the second side is the one that matters:
     a member may legitimately author a scope naming op=aicredentialmint (a
     member CAN reach it, so the floor admits it), and the agent holding that
     credential is STILL refused here. The credential layer and the identity
     layer are independent, and neither absorbs the other. */
  AI_CREDENTIAL_MINT_NOT_A_MEMBER: {
    check: 'C-29.1',
    where: 'src/store.mjs aiCredentialMint > is-ai-credential-mint',
    translation: 'Only a named person signed in to this instance can create an agent credential. '
      + 'Deciding what an automated worker is allowed to reach is a judgement somebody has to be '
      + 'accountable for, so an automated worker cannot make it — not even about itself.',
  },
  /* D-199 (4) / DEC-55 det 4. An organisation-scoped key acts for the group with
     nobody individual behind it; a member-scoped key is attributable to that
     member. Both are legitimate and they carry DIFFERENT accountability, so an
     act must say which. The principal is not a label: it is the VIEWER this
     credential's reads compile under, so an unstated principal is also a
     credential nobody can decide what to show. */
  AI_CREDENTIAL_PRINCIPAL_UNSTATED: {
    check: 'C-29.2',
    where: 'src/store.mjs aiCredentialMint > is-ai-credential-mint',
    translation: 'An agent credential has to say who stands behind it: the organisation as a whole, '
      + 'or one named member. The two carry different accountability and they see different things, '
      + 'so the record will not hold one that says neither.',
  },
  /* THE IDENTITY IS WHAT ACTS CITE, so rebinding it would rewrite history from
     the side nobody watches: every act already attributed to that name would
     silently belong to whatever secret was bound most recently. Refused rather
     than upserted. */
  AI_CREDENTIAL_IDENTITY_TAKEN: {
    check: 'C-29.3',
    where: 'src/store.mjs aiCredentialMint > is-ai-credential-mint',
    translation: 'That name already belongs to an agent credential on this instance. Acts in the '
      + 'record cite the name, so binding it to something new would quietly change who did work that '
      + 'has already been done. Retire the old one or choose another name.',
  },

  /* ---- REVOKING. ALSO A MEMBER ACT, FOR A DIFFERENT REASON. ---- */

  /* Narrowing rather than widening, so D-199 (3)'s own argument does not reach
     it — an agent revoking itself is not an agent requesting more. It is a
     member act anyway, and the reason is the record rather than the risk: the
     row carries `revoked_by`, and a machine name there would say the group
     withdrew an authority when nobody in the group decided anything. */
  AI_CREDENTIAL_REVOKE_NOT_A_MEMBER: {
    check: 'C-29.4',
    where: 'src/store.mjs aiCredentialRevoke > is-ai-credential-revoke',
    translation: 'Withdrawing an agent credential is recorded against the person who withdrew it, so '
      + 'a named member has to be the one doing it. An automated caller has no name to put there and '
      + 'the record would then show a decision nobody made.',
  },
  /* A member who believes they revoked something and did not is worse off than
     one who was told plainly. */
  AI_CREDENTIAL_UNKNOWN: {
    check: 'C-29.5',
    where: 'src/store.mjs aiCredentialRevoke > is-ai-credential-revoke',
    translation: 'There is no agent credential by that name on this instance, so nothing was '
      + 'withdrawn. Being told that plainly matters more than it looks: believing you have taken an '
      + 'authority away when you have not is the worse of the two outcomes.',
  },

  /* ---- THE GATE. WHAT A DECLARED SCOPE ADMITS, ON EVERY CALL. ---- */

  /* D-199 (1)'s shape, reused from `scopeFor`: CLASS plus SCOPE, enforced at the
     gate BY REFUSING. It is one code because it answers one question — is this
     op within what the record declared for this credential — and the two ways
     of failing it (outside the member-reach floor, or not among the declared
     writes) are the same answer to the caller. */
  AI_BEYOND_TASK_SCOPE: {
    check: 'C-29.6',
    where: 'src/index.mjs aiTaskScope > is-ai-task-scope',
    translation: 'This credential was created for a particular piece of work and that is not part of '
      + 'it. What an agent may do here is written down on the record by the member who set it up, so '
      + 'widening it means somebody amending that entry, not the agent asking again.',
  },
  AI_CREDENTIAL_REVOKED: {
    check: 'C-29.7',
    where: 'src/index.mjs aiTaskScope > is-ai-task-scope',
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
    where: 'src/index.mjs aiScopeDeclaration > is-ai-scope-declaration',
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
    where: 'src/index.mjs aiScopeDeclaration > is-ai-scope-declaration',
    translation: 'An agent may only be given things a member of this group could do themselves, and '
      + 'this is not one of them. The background worker\'s own jobs are outside what anybody can hand '
      + 'to an agent, so this cannot be written into a credential at all.',
  },
};

/* TWO FAMILIES COLLIDED ON C-29 AND PL-14's WAS RENUMBERED TO C-30 AT
   INTEGRATION, 2026-08-08 by CONDUCT. PL-11 and PL-14 ran in parallel; each
   MEASURED C-29 as free over this file and each was right when it looked, and
   each allocated exactly nine numbers in it. PL-11 merged first, so its numbers
   stand and PL-14's move — the same rule and the same direction as PL-1/PL-12's
   C-25 collision one week earlier, and the note is here rather than in a commit
   message because THE NEXT ALLOCATOR READS THIS FILE. A renumbering with no
   note at the catalogue reads as a family somebody skipped. Renumbered BY THE
   NUMBER, never by prefix: a prefix rule rewriting the FIRST dotted segment
   mangles a two-digit suffix, which is how PL-12's renumbering of C-25 nearly
   lost a reference. PL-14's report, claim and suite header all name the old
   family, and that is recorded rather than silently corrected.

   AND THIS COMMENT PAID FOR ITS OWN LESSON, WHICH IS WHY IT NO LONGER SPELLS
   THE NUMBERS OUT. Its first draft wrote the warning as a worked example with
   real C-numbers in it, the integration's own sweep renumbered THE EXAMPLE
   along with the code, and `scripts/coverage.mjs` — which harvests C-numbers
   out of this file by pattern, comments included — then reported a check in
   the catalog that no assertion names. Exit 1 on a family that was complete.
   The instrument was right: it cannot tell a number in a sentence from a
   number in a row, and neither can the sweep. So the rule is stated in words
   and the example is gone. */

/* ===========================================================================
 * C-29 — THE STRENGTH PAIR OVER A VERSION (PL-14 / IS-7,
 * INVESTIGATIVE-SESSION.md §12). NINE C-NUMBERS ALLOCATED HERE AND NOWHERE
 * ELSE. C-25 is PL-1/PL-2's, C-26 is PL-12's, C-27 is PL-3's and C-28 is
 * PL-4's — all four MEASURED as taken over this file before C-29 was claimed,
 * and C-29 measured as free.
 *
 * WHY A FAMILY AT ALL FOR A PURE READ. §14b.4's rule is that every refusal a
 * design promises BY NAME is a C-number in this catalogue, and this read
 * refuses six things a caller can actually do wrong — most importantly asking
 * for a pair over a reading NOBODY HAS ADOPTED, which §6.6 makes legal only by
 * WIDENING THE STATE SET rather than by making the reading current.
 *
 * TWO OF THE NINE ARE SELF-GUARDS AND THAT IS DELIBERATE (C-30.7, C-30.8).
 * PL-4 DELETED C-28.12 because the composer could not produce the condition at
 * all — an empty gate, a code nobody could ever drive. These two are the other
 * case and the difference is worth stating so the next allocator does not read
 * one as the other: **the builder CAN produce both conditions the moment an
 * edit composes the two axes or drops the state-set line**, which is precisely
 * what R2's forbidden composition and DEC-40's stripped filter line are. They
 * are DRIVEN — `test/strengthpair.control.mjs` arms each one and records what
 * failed — so neither is a refusal nobody can prove fires.
 *
 * NO MEMBER-FACING TRANSLATION BELOW SAYS "ground", "partition", "AND" or "OR"
 * as a member-facing word (DEC-32's elicitation clause 1, D-226). The
 * vocabulary is the analyst's and a member who must learn it to read a strength
 * will read a worse strength.
 * ========================================================================= */
export const VERSION_STRENGTH_CHECKS = {
  VERSION_STRENGTH_NO_INQUIRY: {
    check: 'C-30.1',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'This asks how strongly one question is answered, and no question was named. '
      + 'There is no default question here and there must not be one.',
  },
  VERSION_STRENGTH_NOT_AN_INQUIRY: {
    check: 'C-30.2',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'That is not a question, so there is nothing here to say how strongly it is answered. '
      + 'Only a question carries readings of the evidence, and only a reading has a strength.',
  },
  /* THE FOUR BEATS' FIRST BEAT, one altitude down from PL-2's acts and for the
     same reason: there is no "the latest reading" and no default. A strength
     computed over a reading the caller did not mean is a number about the wrong
     thing, which is worse than being asked which was meant. */
  VERSION_STRENGTH_NO_VERSION: {
    check: 'C-30.3',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'Say which reading of the evidence to measure, or say which project is asking so '
      + 'that the reading it stands on can be used. There is no default reading, because a strength '
      + 'reported for a reading nobody meant is a number about something else.',
  },
  VERSION_STRENGTH_NO_SUCH_VERSION: {
    check: 'C-30.4',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'No reading by that name belongs to this question, or this project has not said '
      + 'which reading it stands on. An empty answer here would say the question rests on nothing '
      + 'when the truth is that nobody has pointed at anything yet.',
  },
  VERSION_STRENGTH_UNKNOWN_STATE: {
    check: 'C-30.5',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'One of the words used to say which readings to count is not one this record knows. '
      + 'The set is closed on purpose: a strength that quietly counted readings nobody recognises '
      + 'would be a number no reader could check.',
  },
  /* §6 rule 6, and it is the mechanism rather than a nicety: *"Exploring an
     unaccepted version is done by CALCULATING OVER IT, never by making it
     current."* So this is not a dead end — it names the widening that turns the
     request into an honest WHAT-IF, and the what-if answer then carries its own
     state-set line (DEC-40) wherever it renders. */
  VERSION_STRENGTH_STATE_EXCLUDED: {
    check: 'C-30.6',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'Nobody has adopted that reading, so it is not what this record answers with. '
      + 'You can still see what it would come to — ask for it as a what-if by saying which kinds of '
      + 'reading to count — and the answer will say on its face that that is what it is.',
  },
  /* DEC-44 determination 1, at the version altitude: *"A case does NOT compose a
     super-conclusion over them and MUST NOT derive a single case-level
     strength — that would be R2's forbidden composition at a new altitude, and
     it is exactly the 'one letter' the project has refused four times."* The
     same refusal one altitude DOWN, because the temptation is identical and the
     harm is identical: two measurements over two populations reported as one
     number is the record claiming something neither population supports. */
  VERSION_STRENGTH_COMPOSED: {
    check: 'C-30.7',
    where: 'src/store.mjs #refusePairComposed > is-pair-composed',
    translation: 'This answer tried to report one overall figure for a question, and there is no such '
      + 'figure. How well the documents were captured and how firmly they connect to the subject are '
      + 'two separate measurements over two separate things, and averaging them or picking one would '
      + 'state something neither of them says.',
  },
  /* DEC-40 determination 2, and its own negative control: *"a filtered
     rendering states its filter IN DEC-34's per-page header … An unfiltered
     rendering says so too, or absence of the line becomes the ambiguity."* §12
     transplants it verbatim: *"A what-if pair carries its state-set line
     wherever it renders."* So EVERY answer carries the line, including the
     default one — an answer with no line is the shape a reader cannot tell from
     the record's own. */
  VERSION_STRENGTH_UNFILTERED: {
    check: 'C-30.8',
    where: 'src/store.mjs #refusePairComposed > is-pair-composed',
    translation: 'This answer did not say which readings it counted, and a strength separated from '
      + 'that is a misreading waiting to happen. Every answer here says on its face whether it is '
      + 'the record\'s own or a view somebody constructed.',
  },
  VERSION_STRENGTH_TOO_MANY_STATES: {
    check: 'C-30.9',
    where: 'src/store.mjs versionStrength > is-version-strength',
    translation: 'More kinds of reading were named than this record has. The bound is said here '
      + 'rather than applied quietly, so nothing is dropped without you being told.',
  },
};

/* The state set the pair is computed over WHEN NOBODY SAYS OTHERWISE, and it is
   `accepted` alone. §12: *"The strength function takes an argument naming which
   states to factor in, defaulting to accepted. Safe by default, and it is also
   how §6.6's exploration works."* SAFE BY DEFAULT is the load-bearing half: a
   caller who says nothing gets the record's own answer over the reading a
   member adopted, never a number a machine proposed and nobody stood behind.
   DERIVED from `VERSION_STATES` rather than typed beside it, so a vocabulary
   that moves cannot leave this naming a state that no longer exists. */
export const VERSION_STRENGTH_DEFAULT_STATES =
  VERSION_STATES.filter((s) => s === 'accepted');

/* THE HUNCH RULE, AT THIS ALTITUDE ONLY, and it is named here rather than
   inlined because it DIVERGES from the finding layer and a silent divergence is
   the drift this catalogue exists to prevent.

   §12: *"A leg marked as a HUNCH (§6.7 — a member marking, always) is visible
   as such and does not count as evidence."* So a hunch leg is INERT in this
   arithmetic and NAMED as a hunch in the answer.

   AND `store.mjs`'s `strengthOf()` SAYS THE OPPOSITE ONE ALTITUDE DOWN — *"A
   HUNCH COMPOSES NORMALLY (DEC-15)"* — which is not a defect in either and is
   not resolved by this item. DEC-15 is Bob's: a hunch is *"temporary bias"*
   given *"a temporary high enough grade that otherwise disconnected evidence
   can be brought together"*, cleared before publication. That licenses a hunch
   to make the graph TRAVERSABLE; §12 declines to let it make a READING look
   supported. The two are consistent under that split and they are stated
   differently, so PL-14 implements §12 HERE, leaves `strengthOf()` untouched,
   and RAISES the difference rather than settling doctrine from a build item. */
export const VERSION_STRENGTH_INERT_SOURCES = ['hunch'];

/* ===========================================================================
 * C-31 — THE QUEUE MINT: EVERY ITEM CARRIES A CLASS, AND A KIND THE CATALOGUE
 * NAMES UNDER THAT CLASS (PL-15 / D-213, NOTIFICATIONS.md).
 *
 * THREE C-NUMBERS ALLOCATED HERE AND NOWHERE ELSE. C-25 is PL-1/PL-2's, C-26
 * PL-12's, C-27 PL-3's, C-28 PL-4's, C-29 PL-11's and C-30 PL-14's — all six
 * MEASURED as taken over this file before C-31 was claimed, and C-31 measured
 * as free. If a parallel slot measured the same family free at the same moment,
 * CONDUCT renumbers the later merge and the note above C-30 says why that is
 * not the worker's error.
 *
 * WHY IT IS A FAMILY AND NOT AN EXTRA ROW ON SOMEBODY ELSE'S. SK-1 recorded
 * that a new family is a FLOOR and that adding one buys slack for everybody
 * else's walk, which is a real cost and the reason it declined to mint one.
 * This is the case that earns it anyway: `op=queue` had TWO refusals with no
 * translations at all (`NO_CLASS` sat inside REC-64's named reach gap, and
 * `NO_CONDITION_KIND` never reached a surface), and the item that swept the
 * fence for the class is the item that owes them their member-facing words.
 * Three codes, three rows, and the reach gap FALLS by one because NO_CLASS is
 * now translated — a family that pays for itself on the ceiling as well as
 * costing a floor.
 *
 * THE SWEEP THIS FAMILY RECORDS. REC-32 fenced the mint for CONDITION items
 * ONLY. Its reason — an uncatalogued condition kind is one no member could ever
 * mute — was true and partial: a kind is what a surface renders and what
 * `op=affordances` publishes, so an OBLIGATION or a FINDING minted under an
 * unnamed kind was exactly as unrenderable and was not refused. PL-15 needed
 * one new FINDING slug fenced and swept the class rather than fixing its own
 * instance.
 *
 * TWO CODES WHERE REC-32 HAD ONE, and the split is the difference between
 * UNKNOWN and WRONG that `classOfKind` was built three-valued to express.
 * NO_SUCH_KIND is a typo, an invented slug, or an `N-<n>` id copied out of a
 * design document — the catalogue does not name it at all. KIND_MISCLASSED is
 * the sharper one: the kind is real and filed under a DIFFERENT class, and
 * class is what decides whether leaving a member's list is a personal mute or
 * an authored record act (D-125, DEC-16). A refusal that said only "no" to both
 * would be the gate that pressures somebody into inventing a way past it.
 *
 * NO MEMBER-FACING TRANSLATION BELOW USES THE WORD `kind`, `class`, `mint`,
 * `producer` or `catalogue` as the thing the member is asked to understand.
 * These sentences are read by somebody whose queue just failed to load, and the
 * only useful thing to tell them is that the list is incomplete, that nothing
 * was lost, and that this is ours to fix rather than theirs.
 * ========================================================================= */
export const QUEUE_MINT_CHECKS = {
  NO_CLASS: {
    check: 'C-31.1',
    where: 'src/store.mjs queueFeed > is-queue-mint',
    translation: 'Your list could not be assembled: something on it does not say what sort of item '
      + 'it is, and showing it without that would put an entry in front of you that nobody can act '
      + 'on. Nothing has been lost and nothing about the record has changed — this is a fault on '
      + 'our side, not something you did.',
  },
  NO_SUCH_KIND: {
    check: 'C-31.2',
    where: 'src/store.mjs queueFeed > is-queue-mint',
    translation: 'Your list could not be assembled: something on it is described in a word this '
      + 'record does not know, so there is no sentence to show you in place of it. Rather than '
      + 'showing you a line you could not read, the list refuses whole. Nothing has been lost.',
  },
  KIND_MISCLASSED: {
    check: 'C-31.3',
    where: 'src/store.mjs queueFeed > is-queue-mint',
    translation: 'Your list could not be assembled: something on it is filed one way and described '
      + 'another, and the difference decides whether setting it aside is a private choice of yours '
      + 'or a change to the record everyone shares. That is not a difference to guess at, so the '
      + 'list refuses until it is right. Nothing has been lost.',
  },
};
