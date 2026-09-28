/* actions — its checks (requirements: `build/requirements/actions.md`, R1, R4–R10, R20–R22, R33, R37, R38; K6, K64).
 *
 * Moved from `legacy-checks` (`checks/bio-checks.mjs`) in T8 with their comments: the tier history's reader and arm,
 * the governing-laws reader and arm, the counterparty arm, `respondsToEdgeFindings` (C-6.1's `responds_to` arm), the
 * records-request lifecycle's reader, `consequenceState` (DEC-14), `checkActionExtension` (C-2.10's action arms and
 * C-11.1), and the catalogue rows C-32.3, C-32.4, C-32.18, C-32.19, C-33.3–C-33.9, C-72, C-73, C-90 and C-94. New
 * here: C-32.20 (R5), C-73.6 (R6), C-101 (R7), C-90.6 (R28), C-94.12 (R22) and R33's mechanical clock rule.
 *
 * WHAT STAYS IN `legacy-checks` FOR NOW, and why: the vocabularies and grammar functions a module later than this one
 * still imports from there (`affordances`: `ACTION_KINDS`, `RISK_TIERS`, `riskTierState`, `LAW_LEVELS`,
 * `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RESOLUTIONS`, `actionBasisFindings`, `correspondenceFindings`,
 * `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`; `instance-setup`: `RISK_TIERS`, `riskTierState`), with the
 * quote and lifecycle grammars `correspondenceFindings` runs. This module imports each from there and re-exports it
 * (R40), so every reader can take it from here; they leave `legacy-checks` once their last reader there re-points
 * (N65 (3), layer 11). `legacy-checks` cannot import this module, so its `checkBundle` no longer runs the action arm:
 * this module registers it with record-core's audit and with promotion (R37). */

import { isMachineIdentity, BUNDLE_ID_RE, OBJECT_TYPES, RISK_TIERS, riskTierState, RESOLUTIONS, ACTION_KINDS,
         ACTION_BASIS_KINDS, CORRESPONDENCE_DIRECTIONS, actionBasisFindings, correspondenceFindings, isQuoteEntry,
         quoteValue, quoteFindings, QUOTE_KEYS, lifecycleFindings, CORRESPONDENCE_STAGES, CORRESPONDENCE_OUTCOMES,
         DECISION_STAGES, LIFECYCLE_KEYS, lawProposalLabel, proposalLabel } from "../../checks/bio-checks.mjs";
import { LAW_LEVELS } from "../../../jurisdictions/index.mjs";

export { RISK_TIERS, riskTierState, RESOLUTIONS, ACTION_BASIS_KINDS, CORRESPONDENCE_DIRECTIONS, actionBasisFindings,
         correspondenceFindings, isQuoteEntry, quoteValue, quoteFindings, QUOTE_KEYS, lifecycleFindings,
         CORRESPONDENCE_STAGES, CORRESPONDENCE_OUTCOMES, DECISION_STAGES, LIFECYCLE_KEYS, lawProposalLabel, LAW_LEVELS };

/* The catalogue's finding shape (legacy-checks' private `f`), for the arms that moved here. */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;
/* The subject registry's key shape (legacy-checks keeps its own for C-2.8's subject arm; bias has a private one). */
const ENTITY_ID_RE = /^ENT-\d{4}-\d{4}$/;
const UNWRITABLE = /["\\\r\n]/;

/* ---------------------------------------------------------------------------------------------- R10: the kinds */

/** R10: the kinds this module's own rules are written for, offered on every instance. Every other kind comes from the
 *  active profiles' combined view (`jurisdictions` R25); no kind, law, office or deadline is written here. */
export const PRODUCT_KINDS = Object.freeze(["records_request", "request_for_comment", "other"]);

/** R10, R40: the kinds this instance accepts on a creation: the product's own, then the view's `action_kinds`. */
export function actionKinds(view) {
  const out = [...PRODUCT_KINDS];
  for (const k of (view && Array.isArray(view.action_kinds) ? view.action_kinds : []))
    if (k && typeof k.kind === "string" && !out.includes(k.kind)) out.push(k.kind);
  return out;
}

/** R4, R41: a kind an action was written with before R10 (the legacy suite, `cpra_request` among them) reads as
 *  written: the audit does not flag it and a revision may carry it forward. Only a creation is asked R10. */
export function kindReadsAsWritten(kind) { return typeof kind === "string" && ACTION_KINDS.includes(kind); }

/* ---------------------------------------------------------------------------------------------- R4–R6: the records law */

/** R4: the longest `law` a records request carries: a citation, never the law's text. */
export const RECORDS_LAW_MAX = 200;

/** R4, R6: C-2.10's law arm. `law` is stated only on a `records_request`, as a string of at most `RECORDS_LAW_MAX`
 *  characters with no quote, backslash or line break; absent reads undetermined. */
export function recordsLawFindings(fm, findings) {
  if (!fm || typeof fm !== "object" || !Object.prototype.hasOwnProperty.call(fm, "law")) return;
  const law = fm.law;
  if (law === null || law === undefined || law === "") return;
  if (fm.action_kind !== "records_request") {
    findings.push(f("C-2.10", "error", `law is stated on a '${String(fm.action_kind).slice(0, 40)}' action: only a `
      + "records_request carries the law it is made under (R4)", ["remove law, or make the kind records_request"],
      "RECORDS_LAW_REFUSED"));
    return;
  }
  if (typeof law !== "string" || !law.trim() || law.length > RECORDS_LAW_MAX || UNWRITABLE.test(law))
    findings.push(f("C-2.10", "error", `law is not a citation of 1 to ${RECORDS_LAW_MAX} characters with no quote, `
      + "backslash or line break (R4)", ["state the law by its citation"], "RECORDS_LAW_REFUSED"));
}

/** R5: the records law's state as the record can support it: `stated` by a member, `machine_stated` (written by a
 *  machine credential before C-32.20's fence, read from its recorded author class and never rewritten), or
 *  `undetermined`. `author` is the recorded author of the version that first stated it, when the caller has it. */
export function recordsLawOf(fm, author = null) {
  const law = fm && typeof fm.law === "string" && fm.law.trim() ? fm.law.trim() : null;
  if (!fm || fm.action_kind !== "records_request" || !law)
    return { state: "undetermined", law: null,
             says: "UNDETERMINED: no member has stated the records law this request is made under." };
  if (author && isMachineIdentity(author))
    return { state: "machine_stated", law, by: author,
             says: "MACHINE-STATED: a machine credential wrote this law before only a member could state one. It "
                 + "is read as written and is not a member's statement." };
  return { state: "stated", law, ...(author ? { by: author } : {}), says: "Stated by a member." };
}

/* ---------------------------------------------------------------------------------------------- R9: the counterparty */

/** R9: the counterparty as an office, `{role, body}`, from either shape: the office shape as written, or the earlier
 *  `{state: named, name}` read with its name as the office's role and no body. Null for an undetermined or absent one. */
export function counterpartyOffice(cp) {
  if (!cp || typeof cp !== "object" || Array.isArray(cp) || cp.state !== "named") return null;
  const role = typeof cp.role === "string" && cp.role.trim() ? cp.role.trim() : null;
  const body = typeof cp.body === "string" && cp.body.trim() ? cp.body.trim() : null;
  if (role || body) return { role, body, level: typeof cp.level === "string" ? cp.level : null,
                             entity_id: typeof cp.entity_id === "string" ? cp.entity_id : null, legacy: false };
  const name = typeof cp.name === "string" && cp.name.trim() ? cp.name.trim() : null;
  return name ? { role: name, body: null, level: null, entity_id: typeof cp.entity_id === "string" ? cp.entity_id : null,
                  legacy: true } : null;
}

/** R3, R27: the name a quote's counterparty is matched by: an office as "role, body", an earlier name as written. */
export function counterpartyName(cp) {
  const o = counterpartyOffice(cp);
  if (!o) return null;
  return o.legacy || !o.body ? o.role : o.role ? `${o.role}, ${o.body}` : o.body;
}

/* ---------------------------------------------------------------------------------------------- R33: the clock's mechanical write */

/** R33 (I-11): the one machine write to a clock is `deadline-recheck`, which may move a `pending` entry whose date has
 *  passed to `overdue`, and nothing else. Answers the entries whose status moved otherwise, compared by position. */
export function clockMovesNotMechanical(heldClock, nextClock, todayIso) {
  const held = Array.isArray(heldClock) ? heldClock : [];
  const next = Array.isArray(nextClock) ? nextClock : [];
  const bad = [];
  for (let i = 0; i < Math.max(held.length, next.length); i++) {
    const a = held[i], b = next[i];
    const sa = a && typeof a === "object" ? a.status : undefined;
    const sb = b && typeof b === "object" ? b.status : undefined;
    if (sa === sb) continue;
    const passed = a && typeof a.date === "string" && DATE_RE.test(a.date) && a.date < String(todayIso).slice(0, 10);
    if (sa === "pending" && sb === "overdue" && passed) continue;
    bad.push({ ord: i, from: sa ?? null, to: sb ?? null });
  }
  return bad;
}

/* REC-214 (BOB #33, 2026-09-24, "Risk-tier revision"; BIO_Case_Making_v0_1.md §2, `risk_tier`): A MEMBER'S
 * REVISION OF A TIER IS AN AUTHORED, APPEND-ONLY ACT. `op=actionrisktier` is the one writer of
 * `risk_tier_history[]`; each entry is one revision — the tier it set, the tier it replaced (`prior`), who, when,
 * and the REQUIRED reason — and the act appends, never edits. The reason is stored as the member wrote it; the
 * restricted frontmatter grammar has no escapes, so a quote, backslash or line break is refused, not rewritten. */
export const RISK_TIER_REASON_MAX = 500;
export const RISK_TIER_HISTORY_MAX = 200;

/** REC-214: THE ONE READER OF AN ACTION'S TIER HISTORY. The action's read (`op=projection`'s action block), the
 *  act's own answer and the suite read this, so what a surface is shown and what the bytes hold cannot come
 *  apart (UI-104 renders it; REC-215's labelled machine proposal is read BESIDE it and never inside it).
 *
 *  `revisions` is oldest first, exactly as the act appended them. `intake` is the tier the action held before its
 *  first revision — the tier it was created with — and its author is UNDETERMINED IN WORDS: an intake writes
 *  `risk_tier` with no attribution of its own (UI-85, D-483), so the record cannot say which member stated it,
 *  and saying the action's creator did would be an inference it cannot support. With no revision, `intake` is
 *  the current tier. An entry the grammar cannot read is returned with `readable: false`, never dropped: an
 *  append-only history that silently loses a row is the overwrite this act exists to refuse. */
export function riskTierHistoryOf(fm) {
  const raw = fm && Array.isArray(fm.risk_tier_history) ? fm.risk_tier_history : [];
  const revisions = raw.map((e, i) => {
    if (!e || typeof e !== 'object' || Array.isArray(e)) return { ord: i, readable: false };
    const tier = riskTierState(e.tier);
    const prior = riskTierState(e.prior);
    const by = typeof e.by === 'string' && e.by.trim() ? e.by.trim() : null;
    const at = typeof e.at === 'string' && e.at.trim() ? e.at.trim() : null;
    const reason = typeof e.reason === 'string' && e.reason.trim() ? e.reason.trim() : null;
    return { ord: i, readable: tier !== null && tier !== 'undetermined' && prior !== null && !!by && !!at && !!reason,
             tier, tier_words: RISK_TIERS[tier] ?? null, prior, prior_words: RISK_TIERS[prior] ?? null,
             by, at, reason };
  });
  const current = riskTierState(fm ? fm.risk_tier : undefined);
  const intakeTier = revisions.length ? revisions[0].prior : current;
  return {
    current, current_words: RISK_TIERS[current] ?? null,
    intake: { tier: intakeTier, tier_words: RISK_TIERS[intakeTier] ?? null, by: null,
              stated: intakeTier === 'undetermined'
                ? 'No member stated a tier when this action was created.'
                : 'Stated when this action was created. UNDETERMINED who stated it: an intake tier carries no '
                  + 'author of its own in the record.' },
    revisions,
    stated: revisions.length
      ? `${revisions.length} revision${revisions.length === 1 ? '' : 's'} by a member, each with its reason; `
        + 'every earlier tier stays in this history'
      : 'Never revised: the tier is the one the action was created with.',
  };
}

/** REC-214: C-2.10's tier-history arm. Judges the SHAPE and the CHAIN — each entry names a member, a time, a
 *  reason, a tier of 1, 2 or 3 and the tier it replaced; each `prior` is the tier the entry before it set; and
 *  the last entry's tier is the tier the document states. A chain that does not close is the record claiming a
 *  history its bytes do not carry. It cannot judge whether a reason is a good one, and does not try. */
function riskTierHistoryFindings(fm, findings) {
  if (!Object.prototype.hasOwnProperty.call(fm, 'risk_tier_history') || fm.risk_tier_history === null
      || (Array.isArray(fm.risk_tier_history) && !fm.risk_tier_history.length)) return;
  if (!Array.isArray(fm.risk_tier_history)) {
    findings.push(f('C-2.10', 'error', 'risk_tier_history is not a list of revisions (REC-214)'));
    return;
  }
  if (fm.risk_tier_history.length > RISK_TIER_HISTORY_MAX)
    findings.push(f('C-2.10', 'error', `risk_tier_history holds ${fm.risk_tier_history.length} entries; at most ${RISK_TIER_HISTORY_MAX}`));
  const h = riskTierHistoryOf(fm);
  let prev = null;
  for (const e of h.revisions) {
    if (!e.readable) {
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}] is not a revision: each names tier (1, 2 or 3), `
        + 'prior, by, at and a reason (REC-214)', ['revise the tier with op=actionrisktier']));
      prev = null; continue;
    }
    if (isMachineIdentity(e.by))
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}].by '${e.by.slice(0, 40)}' is a machine identity: `
        + 'a risk tier is revised by a member\'s authored act (REC-214)'));
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(e.at))
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}].at '${e.at}' is not a timestamp`));
    if (e.reason.length > RISK_TIER_REASON_MAX)
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}].reason is longer than ${RISK_TIER_REASON_MAX} characters`));
    if (e.prior === e.tier)
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}] replaces tier ${e.tier} with itself: a revision changes the tier`));
    if (prev && e.prior !== prev.tier)
      findings.push(f('C-2.10', 'error', `risk_tier_history[${e.ord}].prior is ${e.prior}, and the revision before it `
        + `set ${prev.tier}: the history does not close (REC-214)`));
    prev = e;
  }
  const last = h.revisions[h.revisions.length - 1];
  if (last && last.readable && last.tier !== h.current)
    findings.push(f('C-2.10', 'error', `risk_tier is ${h.current} and the last revision in risk_tier_history set `
      + `${last.tier}: the tier stated is not the tier the history ends on (REC-214)`,
      ['revise the tier with op=actionrisktier']));
}
/* The most citations one act may set. Not a legal bound — a request under three levels names a handful — but
   a statement bound: every entry lands in the document's frontmatter and on every read of the action. */
export const GOVERNING_LAWS_MAX = 12;
/* The longest citation, in characters: a citation names a law ("Cal. Gov. Code § 7920.000 et seq."), it does
   not quote one. */
export const CITATION_MAX = 200;

/** D-149: WHICH LAWS GOVERN THIS ACTION, AS THE RECORD CAN SUPPORT IT. The one reader: the action's own read
 *  (`op=projection`'s action block) and the suite read this function, so the sentence a reader is shown and
 *  the state it describes cannot come apart.
 *
 *  TWO STATES, AND THE SECOND IS THE ITEM. `stated` — a member set the list, and it is returned exactly as
 *  authored with who set it and when. `undetermined` — no member has stated which laws govern this action, and
 *  the answer SAYS SO IN WORDS rather than returning an empty list a reader would take as "none apply" or,
 *  worse, as the federal default the design's earlier drafts assumed (wrong for Oakland on every axis D-149
 *  lists). Nothing is inferred from the counterparty, the kind or the group.
 *
 *  `cpra_request` IS THE ONE KIND THAT NAMES A LAW, and it is read as exactly that and nothing more: the kind
 *  is its member's statement that the CPRA governs (D-149), so the undetermined sentence names it — and the
 *  LIST stays undetermined, because whether a federal law or a local ordinance also governs is not in the
 *  kind. The document is not rewritten and no citation is synthesised from the kind. */
export function governingLawsOf(fm) {
  const raw = fm && Array.isArray(fm.governing_laws) ? fm.governing_laws : [];
  const laws = raw.filter((l) => l && typeof l === 'object' && !Array.isArray(l))
    .map((l) => ({ level: String(l.level ?? ''), citation: String(l.citation ?? '') }));
  if (laws.length) {
    return { state: 'stated', laws,
             by: typeof fm.governing_laws_by === 'string' && fm.governing_laws_by ? fm.governing_laws_by : null,
             at: typeof fm.governing_laws_at === 'string' && fm.governing_laws_at ? fm.governing_laws_at : null,
             stated: `${laws.length} governing law${laws.length === 1 ? '' : 's'}, stated by a member` };
  }
  /* R41: an action written with an old kind that named a records law reads as written; the sentence says so and
     names no law itself (no outward text of this module names one). */
  const kindNames = fm && fm.action_kind === 'cpra_request';
  return { state: 'undetermined', laws: [], by: null, at: null,
           stated: 'UNDETERMINED: no member has stated which laws govern this action. The record assumes none. '
                 + 'Which laws apply follows the office asked, and a member states them, each by citation.'
                 + (kindNames ? ' This action\'s kind, as written, named the records law it was made under; the '
                              + 'record names no law from it, and nothing else is inferred from the kind.' : '') };
}

/** D-149: C-2.10's governing-law arm. Judges the SHAPE of `governing_laws[]` and the coherence of its
 *  attribution; it cannot judge whether a citation is the right law, and says so by not trying — a member
 *  reads the law. Absent or `[]` is the honest undetermined and passes; a list is attributed or it is refused,
 *  because a citation nobody stated is the record asserting a legal frame no member chose. */
function governingLawsFindings(fm, findings) {
  const has = Object.prototype.hasOwnProperty.call(fm, 'governing_laws');
  const by = typeof fm.governing_laws_by === 'string' ? fm.governing_laws_by.trim() : '';
  const at = typeof fm.governing_laws_at === 'string' ? fm.governing_laws_at.trim() : '';
  if (!has || fm.governing_laws === null || (Array.isArray(fm.governing_laws) && !fm.governing_laws.length)) {
    if (by || at)
      findings.push(f('C-2.10', 'error',
        'governing_laws is empty and governing_laws_by/_at name an act that set it: an attribution with no '
        + 'list asserts a statement the document does not carry (D-149)',
        ['set the list with op=actionlaws', 'or remove governing_laws_by and governing_laws_at']));
    return;
  }
  if (!Array.isArray(fm.governing_laws)) {
    findings.push(f('C-2.10', 'error', 'governing_laws is not a list of {level, citation} entries (D-149)'));
    return;
  }
  if (fm.governing_laws.length > GOVERNING_LAWS_MAX)
    findings.push(f('C-2.10', 'error', `governing_laws holds ${fm.governing_laws.length} entries; at most ${GOVERNING_LAWS_MAX}`));
  fm.governing_laws.forEach((l, i) => {
    if (!l || typeof l !== 'object' || Array.isArray(l)) {
      findings.push(f('C-2.10', 'error', `governing_laws[${i}] is not a {level, citation} entry`)); return;
    }
    /* R31 (`jurisdictions`): the profile's law levels; D-149's `local`, on an action recorded before, reads as written. */
    if (!LAW_LEVELS.includes(l.level) && l.level !== 'local')
      findings.push(f('C-2.10', 'error', `governing_laws[${i}].level '${l.level}' is not one of: ${LAW_LEVELS.join(', ')}`));
    const c = typeof l.citation === 'string' ? l.citation.trim() : '';
    if (!c) findings.push(f('C-2.10', 'error', `governing_laws[${i}].citation is empty: a law is named by its citation`));
    else if (c.length > CITATION_MAX)
      findings.push(f('C-2.10', 'error', `governing_laws[${i}].citation is longer than ${CITATION_MAX} characters`));
  });
  if (!by || isMachineIdentity(by))
    findings.push(f('C-2.10', 'error',
      by ? `governing_laws_by '${by.slice(0, 40)}' is a machine identity: the laws governing a request are a member's authored statement (D-149)`
         : 'governing_laws carries no governing_laws_by: a list of governing laws is a member\'s authored statement and names who made it (D-149)',
      ['set the list with op=actionlaws, signed in as a member']));
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(at))
    findings.push(f('C-2.10', 'error', `governing_laws_at '${at}' is not a timestamp: the act that set the list is dated`));
}
/* The longest `why` a proposal may carry against one citation, in characters. A why says what the proposer
   read the citation off — "the counterparty is a California city agency" — and is never the law's text. */
export const LAW_PROPOSAL_WHY_MAX = 240;
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
/* The one placeholder, compared case-folded and trimmed. It is the exact string
   `mdFor` wrote in `civicos-ui/app.html` and `src/setup.mjs` until this item
   deleted it, so a bundle carrying it was written by a machine that had no
   counterparty and said one anyway. */
const COUNTERPARTY_PLACEHOLDER = 'to be named';
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
export function counterpartyFindings(fm, findings) {
  const isPlaceholder = (v) =>
    typeof v === 'string' && v.trim().toLowerCase() === COUNTERPARTY_PLACEHOLDER;
  const REPAIRS = [
    'name the office: counterparty.state = named with counterparty.role and counterparty.body',
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

  /* R9 (`jurisdictions` R24): a named counterparty is an OFFICE, `{role, body, level?, entity_id?}`, never a person.
     The earlier `{state: named, name}` reads as written, its name as the office's (`counterpartyOffice`), and is
     not refused by the audit; a WRITE that states a new counterparty in that shape is refused at the act (R7). */
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const name = str(cp.name), role = str(cp.role), body = str(cp.body), basis = str(cp.basis);
  const entityId = cp.entity_id === undefined || cp.entity_id === null ? '' : String(cp.entity_id).trim();
  for (const [k, v] of [['name', name], ['role', role], ['body', body], ['basis', basis]])
    if (isPlaceholder(v))
      findings.push(f('C-2.10', 'error', `counterparty.${k} is the placeholder '${COUNTERPARTY_PLACEHOLDER}', which is not `
        + 'an office or a reason (D-130)', REPAIRS));
  if (cp.state === 'named') {
    if (!name && (!role || !body))
      findings.push(f('C-2.10', 'error', 'counterparty.state is named and the office is not: a named counterparty is an '
        + 'office, stated by its official role and the body it belongs to (R9)', REPAIRS));
    if (entityId && !ENTITY_ID_RE.test(entityId))
      findings.push(f('C-2.10', 'error',
        `counterparty.entity_id '${entityId.slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ['point entity_id at the office in the subject registry, or omit it: it is optional']));
  } else {
    if (!basis)
      findings.push(f('C-2.10', 'error',
        'counterparty.state is undetermined and counterparty.basis is empty: undetermined is first-class and must be '
        + 'STATED, so an action that does not know who it is addressed to says what it does know',
        ['author counterparty.basis: what has been established so far, and what would settle it']));
    const asserted = [['name', name], ['role', role], ['body', body], ['entity_id', entityId]].filter(([, v]) => v);
    if (asserted.length)
      findings.push(f('C-2.10', 'error',
        `counterparty.state is undetermined and it carries ${asserted.map(([k]) => k).join(', ')}: the block asserts `
        + 'a counterparty and denies having one in the same breath',
        ['set state: named if that is the office', 'or clear them and leave the basis to say what is known']));
  }
}
/** D-147: THE LIFECYCLE, READ BACK AS ONE DATED CHAIN — a pure function over one document and a day, so
 *  the store's read and any other reader agree by construction. Every entry answers with its stage (or
 *  that none was stated), the entry it follows, the days elapsed since that entry, what followed it, and
 *  its due date: STATED with its citation and whether that citation is on the action's list now, or
 *  UNDETERMINED with the sentence saying so. `due.status` is DERIVED against `today` and nothing else:
 *  `open` (not yet passed, nothing followed), `passed_unanswered`, `followed_by_due`, `followed_after_due`.
 *  It never derives a due date, and it states no rate, pattern or judgement about the body. */
export const DUE_UNDETERMINED_SAYS = 'UNDETERMINED: no member has stated when the next stage is due. The record '
  + 'encodes no law\'s clock, so it computes none — not from the action\'s kind, not from a law, not from the '
  + 'stage. A member states a due date with the citation it comes from.';
const dayNumber = (d) => {
  const s = String(d ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const ms = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 86400000) : null;
};
export function requestLifecycleOf(fm, today) {
  const entries = Array.isArray(fm?.correspondence) ? fm.correspondence : [];
  const laws = governingLawsOf(fm).laws.map((l) => l.citation);
  const day = String(today ?? '').slice(0, 10);
  const todayN = dayNumber(day);
  const str = (v) => (v === null || v === undefined ? '' : String(v).trim());
  const ordOf = (v, i) => (/^\d+$/.test(str(v)) && Number(str(v)) < i ? Number(str(v)) : null);
  const followers = entries.map(() => []);
  entries.forEach((e, i) => {
    const p = e && typeof e === 'object' ? ordOf(e.follows, i) : null;
    if (p !== null) followers[p].push(i);
  });
  const chain = entries.map((e, i) => {
    if (!e || typeof e !== 'object' || Array.isArray(e)) return { ord: i, unreadable: true };
    const at = str(e.at).slice(0, 10);
    const follows = ordOf(e.follows, i);
    const prevAt = follows !== null && entries[follows] ? str(entries[follows].at).slice(0, 10) : '';
    const elapsed = follows !== null && dayNumber(at) !== null && dayNumber(prevAt) !== null
      ? dayNumber(at) - dayNumber(prevAt) : null;
    const next = followers[i];
    const dueBy = str(e.due_by), dueCite = str(e.due_cite);
    let due;
    if (dueBy && dueCite && dayNumber(dueBy) !== null) {
      const firstAt = next.length ? str(entries[next[0]].at).slice(0, 10) : '';
      const status = next.length
        ? (dayNumber(firstAt) !== null && dayNumber(firstAt) <= dayNumber(dueBy) ? 'followed_by_due' : 'followed_after_due')
        : (todayN !== null && dayNumber(dueBy) < todayN ? 'passed_unanswered' : 'open');
      due = { state: 'stated', by: dueBy, cite: dueCite, on_list: laws.includes(dueCite), status,
              ...(status === 'passed_unanswered' ? { days_past: todayN - dayNumber(dueBy) } : {}) };
    } else {
      due = { state: 'undetermined', says: DUE_UNDETERMINED_SAYS };
    }
    return {
      ord: i, direction: e.direction ?? null, at,
      stage: str(e.stage) || null, stage_stated: !!str(e.stage),
      follows, elapsed_days: elapsed,
      outcome: str(e.outcome) || null,
      ...(str(e.exemptions) ? { exemptions: str(e.exemptions) } : {}),
      ...(isQuoteEntry(e) ? { quote: { amount: str(e.quote_amount), currency: str(e.quote_currency) } } : {}),
      followed_by: next,
      ...(!next.length && todayN !== null && dayNumber(at) !== null ? { days_since: todayN - dayNumber(at) } : {}),
      due,
    };
  });
  return {
    entries: chain,
    passed_unanswered: chain.filter((c) => c.due && c.due.status === 'passed_unanswered').map((c) => c.ord),
    as_of: day,
    says: 'Each entry is dated as recorded and names the entry it follows. The plane derives only the days '
      + 'between entries and whether a STATED due date passed with nothing following it; it encodes no law\'s '
      + 'clock and states no judgement about the body.',
  };
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

/** R37: C-2.10's action arms and C-11.1 over one action's document, as the audit runs them (`ctx.fm`, `ctx.nowMs`;
 *  `ctx.actionKinds`, the instance's R10 set, when the caller has it). */
export function checkActionExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'action') return;
  const fm = ctx.fm;
  actionBasisFindings(fm, findings);
  correspondenceFindings(fm, findings);
  /* R10: a kind this instance offers; a kind an action was written with before reads as written (R4). */
  const kinds = Array.isArray(ctx.actionKinds) ? ctx.actionKinds : PRODUCT_KINDS;
  if (!kinds.includes(fm.action_kind) && !kindReadsAsWritten(fm.action_kind))
    findings.push(f('C-2.10', 'error', `action_kind '${fm.action_kind}' is not a kind this instance offers`));
  recordsLawFindings(fm, findings);
  /* D-182: 1, 2, 3 or undetermined (absent reads undetermined); the words are RISK_TIERS'. */
  if (riskTierState(fm.risk_tier) === null) findings.push(f('C-2.10', 'error', `risk_tier '${fm.risk_tier}' is not one of ${Object.keys(RISK_TIERS).join(', ')}`));
  counterpartyFindings(fm, findings);
  governingLawsFindings(fm, findings);
  riskTierHistoryFindings(fm, findings);
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

/* The action layer's machine fences (C-32.3, C-32.4, C-32.18, C-32.19), split out of legacy-checks' MACHINE_FENCE_CHECKS
   whole, as strength took C-32.9 (K181 (3)). */
export const ACTION_FENCE_CHECKS = {
  MACHINE_CANNOT_MOVE_ACTION: {
    check: 'C-32.3',
    where: 'src/actions/index.mjs actionMove > is-machine-move-action',
    translation: 'Advancing an action is a decision to reach outside this system, or to declare '
      + 'that reaching out is finished, and either way somebody is answerable for it. The '
      + 'credential that asked here is an automated one, so it can prepare the action and cannot '
      + 'move it. Sign in to move it yourself.',
  },
  /* REC-189 — D-182's ruling on the write side (BOB #21: *"Only a member's authored act sets 1, 2 or 3"*).
     Refuses a CHANGE of tier by a machine, never a presence: carrying a member's tier forward unchanged is
     not refused, nor is leaving undetermined a tier no member ever set. BOB #32 (2026-09-24 01:44Z): dropping a
     member's tier to undetermined IS a change and is refused. REC-214 (BOB #33, 2026-09-24): the same code refuses a
     machine at `op=actionrisktier`, the member's revision act, so the condition lives in ONE helper both `promote`'s
     action block and the act ask (`#machineRiskTierRefusal`) — one code, one site, one region. */
  MACHINE_CANNOT_SET_RISK_TIER: {
    check: 'C-32.19',
    where: 'src/actions/index.mjs #machineRiskTierRefusal > is-machine-set-risk-tier',
    translation: 'A risk tier tells whoever reads this action whether it is safe to file, needs caution, or '
      + 'must not be filed without a lawyer, and somebody has to be answerable for that judgement. The '
      + 'credential that asked here is an automated one: it can carry forward the tier a member set, and '
      + 'where no member has set one it can leave the tier unstated, but it cannot set, change or remove '
      + 'one. Sign in to state the tier yourself.',
  },
  MACHINE_CANNOT_CORRESPOND: {
    check: 'C-32.4',
    where: 'src/actions/index.mjs actionCorrespond > is-machine-correspond',
    translation: 'Recording that an exchange happened is testimony: on this path the entry itself '
      + 'is the evidence, so somebody has to be standing behind it. The credential that asked here '
      + 'is an automated one — it can capture bytes, and it cannot swear that a conversation took '
      + 'place. Sign in to record it.',
  },
  /* D-149 (BIO_Case_Making_v0_1.md §2): stating which laws govern a records request is a member's authored
     act — the design's words are *set by a member's authored act*, and a machine may PROPOSE a list, labelled
     as machine work, and never set it. No proposal is built; the fence is the half that is. */
  MACHINE_CANNOT_SET_LAWS: {
    check: 'C-32.18',
    where: 'src/actions/index.mjs actionLaws > is-machine-set-laws',
    translation: 'Which laws govern a request is a statement a member makes and is named beside: the laws '
      + 'follow the agency asked, and somebody has to have read them. The credential that asked here is an '
      + 'automated one, so it can gather what the agency is and cannot state which laws apply. Sign in to set '
      + 'the list yourself.',
  },
};

/* C-33.3–C-33.9, split out of legacy-checks' ACT_SHAPE_CHECKS the same way. */
export const ACTION_ACT_CHECKS = {
  NO_RESOLUTION: {
    check: 'C-33.3',
    where: 'src/actions/index.mjs actionMove > is-move-resolution',
    translation: 'An action that has ended says how it ended, and this move does not. The record '
      + 'keeps a closed set of endings so that a reader later can tell what actually happened '
      + 'rather than only that something stopped.',
  },
  RESOLUTION_WITHOUT_RESOLVING: {
    check: 'C-33.4',
    where: 'src/actions/index.mjs actionMove > is-move-resolution',
    translation: 'This move says how the action ended while moving it somewhere that is not an '
      + 'ending. Recording an outcome the action has not reached would put a result in the record '
      + 'before there is one.',
  },
  BAD_DIRECTION: {
    check: 'C-33.5',
    where: 'src/actions/index.mjs actionCorrespond > is-correspond-entry',
    translation: 'Every entry in this ledger says which way the exchange went, and this one names '
      + 'something the record does not use. A reply that never came is recorded as a non-response '
      + 'with the date it was due, rather than left out.',
  },
  BAD_DATE: {
    check: 'C-33.6',
    where: 'src/actions/index.mjs actionCorrespond > is-correspond-entry',
    translation: 'Every entry here carries a calendar date written as four digits, two digits and '
      + 'two digits. A non-response is dated too — by when the reply was due — because an undated '
      + 'exchange cannot be placed against anything else in the record.',
  },
  CAPTURE_AND_TESTIMONY: {
    check: 'C-33.7',
    where: 'src/actions/index.mjs actionCorrespond > is-correspond-entry',
    translation: 'An entry holds either the captured material or a named person who can speak to '
      + 'the exchange, and never both. A summary sitting beside the real thing is what a reader '
      + 'would quote instead of the thing the group can actually defend.',
  },
  NEITHER_CAPTURE_NOR_TESTIMONY: {
    check: 'C-33.8',
    where: 'src/actions/index.mjs actionCorrespond > is-correspond-entry',
    translation: 'This entry offers neither captured material nor a named person behind it, so '
      + 'there is no way for anyone to check that the exchange happened. An assertion with nothing '
      + 'to check it against is the one thing this ledger will not hold.',
  },
  UNREGISTERED_ARTIFACT: {
    check: 'C-33.9',
    where: 'src/actions/index.mjs actionCorrespond > is-correspond-artifact',
    translation: 'The material named here is not held in this store, so the entry would point at '
      + 'something nobody can open. Capture it first, or record a named person who can speak to '
      + 'the exchange instead — those are the two honest ways to hold one.',
  },
};

/* =========================================================================
 * D-149 — THE GOVERNING-LAW FAMILY (C-73). `BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES EVERY LAW
 * THAT GOVERNS IT* (Bob, 2026-09-22).
 *
 * The list is set by ONE act, `op=actionlaws`, and by nothing else — not at creation, not by a revision through
 * `op=promote`. That is what makes "an action with none reads undetermined" true of the BYTES and not only of a
 * read: a writer that filled a citation in at creation would pass every read-side assertion while the record
 * asserted a legal frame no member chose, so the creation arm is refused BY NAME (GOVERNING_LAWS_REWRITTEN).
 * The machine fence is C-32.18, in its own family.
 *
 * THE FOUR SHAPE ROWS MOVED THEIR `where` FROM `actionLaws` TO `#lawEntries` ON 2026-09-24 (REC-195), and the
 * move is the row's own rule working rather than a tidy-up: REC-195 adds a SECOND act that takes a list of
 * citations — `op=actionlawspropose`, the machine's PROPOSAL — and a `where` names THE SMALLEST SPAN IN WHICH
 * THE REFUSAL IS ENFORCED. Two acts each enforcing these four conditions in their own body would be two spans
 * for one row, which is the shape D-484 had to consolidate for `NO_BASIS`. So the grammar is one private helper
 * both acts ask, the region travelled with it unchanged, and the codes, the C-numbers and the translations are
 * the same four a member already meets.
 * ========================================================================= */
export const GOVERNING_LAW_CHECKS = {
  GOVERNING_LAWS_REWRITTEN: {
    check: 'C-73.1',
    where: 'src/actions/index.mjs #lawsFence > is-promote-governing-laws',
    translation: 'The laws that govern a request are set by a member with the governing-laws act, and a '
      + 'document created or revised any other way carries them unchanged. This write would have set or '
      + 'changed them without that act, so nothing was written. Use the governing-laws act to state them.',
  },
  NO_LAWS: {
    check: 'C-73.2',
    where: 'src/actions/index.mjs #lawEntries > is-laws-entry',
    translation: 'The act names at least one law, each by its citation and its level. With none named there is '
      + 'nothing to set: a request whose laws nobody has stated reads as undetermined on its own, and '
      + 'setting an empty list would not make that any truer.',
  },
  BAD_LAW_LEVEL: {
    check: 'C-73.3',
    where: 'src/actions/index.mjs #lawEntries > is-laws-entry',
    translation: 'Each law is stated at one of three levels: federal, state or local. One entry named a level '
      + 'outside those three, so nothing was written.',
  },
  BAD_CITATION: {
    check: 'C-73.4',
    where: 'src/actions/index.mjs #lawEntries > is-laws-entry',
    translation: 'Each law is named by its citation — a short reference such as a code section — and one entry '
      + 'was empty, too long, repeated, or held a quotation mark, backslash or line break, which this record '
      + 'cannot store. Nothing was written.',
  },
  TOO_MANY_LAWS: {
    check: 'C-73.5',
    where: 'src/actions/index.mjs #lawEntries > is-laws-entry',
    translation: 'One act states at most twelve governing laws. A request governed at the federal, state and '
      + 'local levels names a handful; a longer list is more likely a list of every law that might apply than '
      + 'of the ones that do. Nothing was written.',
  },
  /* D-695 (R6): C-2.10's records-law arm (R4) at the write, a member's and a machine's alike: C-32.20 asks WHO
     states a law, this asks whether what is stated is a citation on a records request at all. */
  RECORDS_LAW_REFUSED: {
    check: 'C-73.6',
    where: 'src/actions/index.mjs #writeArms > is-promote-records-law',
    translation: 'The law a records request is made under is named by its citation, a short reference such as a '
      + 'code section, and only a records request carries one. This write stated a law that was too long to be a '
      + 'citation, was not text, or sat on a kind of action that is not a records request. Nothing was written.',
  },
};

/* D-148 / C-72 — A FEE QUOTE IS EVIDENCE (`BIO_Case_Making_v0_1.md` §2). The refusals of the quote grammar
 * (`quoteFindings`, which C-2.10 also reports over the document, each finding carrying the same code) and of
 * its read. The rule lives in ONE pure function; op=actioncorrespond refuses by these names before anything is
 * written, and op=actionquotes refuses a read that names neither axis. None of them judges a quote. */
export const QUOTE_CHECKS = {
  QUOTE_NOT_ON_RECEIVED: {
    check: 'C-72.1',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-grammar',
    translation: 'A quote is what a body sent back, so it belongs on an entry recording something received. '
      + 'Record the reply as received and put the quote on it.',
  },
  QUOTE_AMOUNT_NOT_A_NUMBER: {
    check: 'C-72.2',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-grammar',
    translation: 'The amount is kept exactly as the body wrote it, but it has to read as a number — digits, '
      + 'with an optional decimal part and thousands separators. Otherwise it cannot be set beside another quote.',
  },
  QUOTE_NO_CURRENCY: {
    check: 'C-72.3',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-grammar',
    translation: 'A quote records the currency the body named. The record will not assume one, so say which '
      + 'currency the amount was quoted in.',
  },
  QUOTE_ANSWERS_NO_SENT: {
    check: 'C-72.4',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-grammar',
    translation: 'A quote answers a request, and this one names no earlier sent entry in this ledger. Record '
      + 'the request first, then name its position as the entry this quote answers.',
  },
  QUOTE_REVISES_NO_QUOTE: {
    check: 'C-72.5',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-grammar',
    translation: 'A revision names the earlier quote it changes, and the position given holds no quote. Both '
      + 'the original and the revision stay on the record, so the revision has to point at a real one.',
  },
  QUOTE_TEXT_UNWRITABLE: {
    check: 'C-72.6',
    where: 'src/actions/index.mjs actionCorrespond > is-quote-writable',
    translation: 'The currency or the stated basis is too long, or holds a quotation mark, a backslash or a '
      + 'line break, which the record cannot store. Shorten it or leave those characters out.',
  },
  QUOTE_READ_UNASKED: {
    check: 'C-72.7',
    where: 'src/actions/index.mjs actionQuotes > is-quote-read-axis',
    translation: 'Quotes are listed by the body that quoted them or by the request they answer. Name one of '
      + 'the two — not neither, and not both at once.',
  },
  QUOTE_ANSWERS_NOT_AN_ORD: {
    check: 'C-72.8',
    where: 'src/actions/index.mjs actionQuotes > is-quote-read-axis',
    translation: 'A request is named by its position in the action\'s correspondence, which is a whole number '
      + 'counted from zero. Give that number to see only the quotes answering that request.',
  },
};

/* D-147 / C-94 — THE RECORDS-REQUEST LIFECYCLE (`BIO_Case_Making_v0_1.md` §2). The refusals of the lifecycle
 * grammar (`lifecycleFindings`, which C-2.10 also reports over the document, each finding carrying the same code)
 * and the two the op alone can judge: a due date's citation against the action's governing laws as they stand
 * when it is stated, and the writability of the prose a stage carries. None of them encodes a law's clock. */
export const LIFECYCLE_CHECKS = {
  STAGE_NOT_OF_DIRECTION: {
    check: 'C-94.1',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'That stage does not belong to this kind of entry. A request, a fee-waiver request, an appeal or a '
      + 'court filing is something sent; an acknowledgement, a fee estimate, a decision, an extension notice, a '
      + 'production or a denial is something received. A non-response carries no stage.',
  },
  FOLLOWS_NO_ENTRY: {
    check: 'C-94.2',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'Every stage after the request names the earlier entry it answers or follows, by its position in '
      + 'the correspondence counted from zero. Give the position of an entry already recorded.',
  },
  APPEAL_NAMES_NO_DECISION: {
    check: 'C-94.3',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'An appeal names the decision it appeals. The entry named is not a decision: record the decision '
      + 'as received with its outcome, then name it.',
  },
  OUTCOME_NOT_ON_RECEIVED: {
    check: 'C-94.4',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'An outcome, and the exemptions a body cited, are what the body sent back, so they belong on an '
      + 'entry recording something received.',
  },
  OUTCOME_NOT_IN_VOCABULARY: {
    check: 'C-94.5',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'An outcome is one of granted, denied, partial, reversed, affirmed, or none_stated when the body '
      + 'stated none.',
  },
  DECISION_WITHOUT_OUTCOME: {
    check: 'C-94.6',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'A decision carries its outcome as the body gave it. If the body stated none, record none_stated '
      + 'so the record says so rather than leaving it blank.',
  },
  FEE_ESTIMATE_WITHOUT_QUOTE: {
    check: 'C-94.7',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'A fee estimate is a quote: record the amount and the currency as quoted, and the request it '
      + 'answers.',
  },
  DUE_HALF_STATED: {
    check: 'C-94.8',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'A due date is stated together with the citation it comes from, or not at all. With none stated '
      + 'the record reads it as undetermined, which is honest.',
  },
  DUE_NOT_A_DATE: {
    check: 'C-94.9',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-grammar',
    translation: 'A due date is written as a calendar date, YYYY-MM-DD.',
  },
  DUE_CITE_NOT_GOVERNING: {
    check: 'C-94.10',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-due-cite',
    translation: 'A due date names the law it comes from, and that law must be one of those a member has stated '
      + 'govern this action. State the governing laws first, then cite one of them exactly as listed.',
  },
  LIFECYCLE_TEXT_UNWRITABLE: {
    check: 'C-94.11',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-writable',
    translation: 'The exemptions or the citation is too long, or holds a quotation mark, a backslash or a line '
      + 'break, which the record cannot store. Shorten it or leave those characters out.',
  },
  /* D-688 (R22): the token case of C-94.11 split out, so each code's sentence is true of what it refuses. */
  LIFECYCLE_TOKEN_MALFORMED: {
    check: 'C-94.12',
    where: 'src/actions/index.mjs actionCorrespond > is-lifecycle-token',
    translation: 'A stage, the entry it follows, an outcome and a due date are each written as one short token of '
      + 'lower-case letters, digits, underscores or hyphens, at most forty characters. One of them was not, so '
      + 'nothing was written.',
  },
};

/* REC-214 / C-90 — A MEMBER REVISES AN ACTION'S RISK TIER BY AN AUTHORED, APPEND-ONLY ACT (BOB #33, 2026-09-24,
 * "Risk-tier revision"; `BIO_Case_Making_v0_1.md` §2, `risk_tier`). The field carries legal exposure: the record
 * must show that a "do not file without counsel" tier was changed, by whom, when and why.
 *
 * `op=actionrisktier` is the one act that changes a tier after intake, and it writes through the one front-matter
 * path every reader derives the tier from (`risk_tier`, read by `riskTierState`), appending one entry to
 * `risk_tier_history[]`. A machine is refused at the act by C-32.19's own code, MACHINE_CANNOT_SET_RISK_TIER — not a
 * second code for the same condition. Four rows are the act's own conditions; the fifth is `promote`'s: a
 * revision that changes the tier or edits the history WITHOUT the act is refused, because a member's plain
 * revision from 3 to 1 would otherwise overwrite "do not file without counsel" with nothing recording that it
 * was ever there but an older snapshot. A creation may state a tier (that is intake) and may not state a history. */
export const RISK_TIER_REVISION_CHECKS = {
  RISK_TIER_REWRITTEN: {
    check: 'C-90.1',
    where: 'src/actions/index.mjs #tierFence > is-promote-risk-tier',
    translation: 'After an action is created, its risk tier changes only through the risk-tier act, which records '
      + 'who changed it, when and why, and keeps every earlier tier readable. This write would have changed the '
      + 'tier, or the record of its earlier tiers, some other way, so nothing was written. Use the risk-tier act.',
  },
  BAD_RISK_TIER: {
    check: 'C-90.2',
    where: 'src/actions/index.mjs actionRiskTier > is-risk-tier-act',
    translation: 'A risk tier is 1 (file freely), 2 (file with caution) or 3 (do not file without counsel). The '
      + 'act states one of those three; "not assessed" is what an action reads when nobody has stated one, and '
      + 'is not something to set. Nothing was written.',
  },
  RISK_TIER_REASON_REFUSED: {
    check: 'C-90.3',
    where: 'src/actions/index.mjs actionRiskTier > is-risk-tier-act',
    translation: 'Changing a risk tier needs a reason, and it is kept beside the change for as long as the record '
      + 'lasts. The reason was missing, longer than 500 characters, or held a quotation mark, backslash or line '
      + 'break, which this record cannot store. Nothing was written.',
  },
  RISK_TIER_UNCHANGED: {
    check: 'C-90.4',
    where: 'src/actions/index.mjs actionRiskTier > is-risk-tier-act',
    translation: 'The action already has that risk tier, so there is nothing to revise. The history records '
      + 'changes; it has not been touched.',
  },
  RISK_TIER_HISTORY_UNSPLICEABLE: {
    check: 'C-90.5',
    where: 'src/actions/index.mjs actionRiskTier > is-risk-tier-act',
    translation: 'This action\'s record of earlier risk tiers is not in a shape the act can add to without '
      + 'rewriting it, and the act only ever adds. Nothing was written.',
  },
  /* REC-215 (R28): a proposed tier's basis, the proposal's own field. A proposed tier that is not 1, 2 or 3 meets
     C-90.2's own code (BAD_RISK_TIER), the same condition. */
  RISK_PROPOSAL_BASIS_REFUSED: {
    check: 'C-90.6',
    where: 'src/actions/index.mjs actionRiskPropose > is-risk-propose-basis',
    translation: 'A proposed risk tier carries its basis: what the proposer read the tier from, in its own words, '
      + 'kept beside the proposal. The basis was missing, longer than 500 characters, or held a quotation mark, '
      + 'backslash or line break, which this record cannot store. Nothing was written, and the action\'s tier '
      + 'was never going to change.',
  },
};

/* =========================================================================
 * D-689 / C-32.20 (R5): WHO STATES A RECORDS LAW. A machine credential may create a records_request stating no law
 * and propose one (R19's shape); it may not state, change or remove `law`. A law written before this fence by a
 * machine is read MACHINE-STATED from its recorded author and never rewritten (`recordsLawOf`).
 * ========================================================================= */
export const RECORDS_LAW_FENCE_CHECKS = {
  MACHINE_CANNOT_STATE_RECORDS_LAW: {
    check: 'C-32.20',
    where: 'src/actions/index.mjs #machineRecordsLawRefusal > is-machine-state-records-law',
    translation: 'Which law governs a records request is a judgement a member makes and answers for. The '
      + 'credential that asked here is an automated one: it can write the request as a records request that '
      + 'names no law, and it can propose the law for a member to consider, but it cannot state the law, and '
      + 'cannot change or remove one. Sign in to state the law yourself.',
  },
};

/* =========================================================================
 * D-717 / C-101 (R7): THE ACTION CATALOGUE AT THE ACT. Five arms of C-2.10 that ran only in the audit are enforced
 * at the write, each under its own name; `findings[]` carries the arm's own C-2.10 / C-11.1 sentences, so the act and
 * the audit say one thing. A MISSING counterparty and a pending entry PAST its date still land: the audit reports them
 * (R37). C-117.1 (K248's family for this module) is R33's direction rule for the one mechanical clock write.
 * ========================================================================= */
export const ACTION_CATALOGUE_CHECKS = {
  ACTION_KIND_UNKNOWN: {
    check: 'C-101.1',
    where: 'src/actions/index.mjs #writeArms > is-promote-action-kind',
    translation: 'An action is one of the kinds this instance offers: a records request, a request for comment, '
      + '"other", and the kinds the group\'s jurisdiction profile lists. This write named another kind, so nothing '
      + 'was written. Choose one of the listed kinds, or "other".',
  },
  RISK_TIER_REFUSED: {
    check: 'C-101.2',
    where: 'src/actions/index.mjs #writeArms > is-promote-tier-vocabulary',
    translation: 'A risk tier is 1 (file freely), 2 (file with caution) or 3 (do not file without counsel), or it '
      + 'is left unstated, which reads as not assessed. This write stated something else, so nothing was written.',
  },
  COUNTERPARTY_REFUSED: {
    check: 'C-101.3',
    where: 'src/actions/index.mjs #writeArms > is-promote-counterparty',
    translation: 'An action says who it is addressed to: an office named by its official role and the body it '
      + 'belongs to, or an undetermined counterparty with a few words on what is known and what would settle it. '
      + 'This write carried a placeholder, a bare name outside that shape, a person, or a counterparty that said '
      + 'both things at once, so nothing was written. Leaving the counterparty out is allowed while the action is '
      + 'a draft.',
  },
  ACTION_RESOLUTION_REFUSED: {
    check: 'C-101.4',
    where: 'src/actions/index.mjs #writeArms > is-promote-action-resolution',
    translation: 'A resolved action says how it ended: complied, denied, escalated or withdrawn. This write marked '
      + 'the action resolved without one of those, so nothing was written.',
  },
  CLOCK_REFUSED: {
    check: 'C-101.5',
    where: 'src/actions/index.mjs #writeArms > is-promote-clock',
    translation: 'Each deadline on an action carries a short label, a description, a date written year-month-day, '
      + 'the statute, order or commitment the date comes from, and a status: pending, met, overdue or waived. An '
      + 'entry in this write lacked one of those or held one in another form, so nothing was written.',
  },
  CLOCK_STATUS_NOT_MECHANICAL: {
    check: 'C-117.1',
    where: 'src/actions/index.mjs #writeArms > is-promote-clock-mechanical',
    translation: 'The one change an automatic re-check may make to an action\'s deadlines is to mark a pending '
      + 'deadline whose date has passed as overdue. This write changed a deadline\'s status in another way, so '
      + 'nothing was written. A member changes a deadline by revising the action.',
  },
};
