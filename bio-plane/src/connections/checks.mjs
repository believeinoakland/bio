/* connections' own refusal rows (requirements: `build/requirements/connections.md` R35). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever
 * the act is reached. Each row's `where` names the site in this module that answers it.
 *
 * C-74, the member's choice of the on-point mention (R14), moved here from the catalogue in T18
 * (`CONNECTION_CHOICE_CHECKS`; K585 (3)), the catalogue's copy deleted in the same job (✱, K586): no product module but
 * this one reads it. Rows, codes, `where`s and translations unchanged.
 *
 * C-49 (`CONNECTION_PAIR_CHECKS`) and C-81 (`THEME_CHECKS`, with `THEME_ID_RE`, `THEME_REF_RE`, `THEME_LEG_KEYS` and
 * `themeLegFindings`, C-81.1's one site) are COPIED here in T19 (R35, R46; plan T19 layer 5, K585 (5)), below: codes,
 * numbers and translations unchanged, each `where` naming the site in this module that answers it (C-81.1's now this
 * file's `themeLegFindings`). The catalogue's copy was deleted with the catalogue at T19's close (K855), so these rows
 * are the only ones; the leg grammars read `themeLegFindings` from here. */

import { idPattern } from "../record-grammar/index.mjs";

/* The catalogue's finding shape (`f`, legacy-checks), copied for `themeLegFindings`: a finding is
   `{check, severity, message}`, with `repairable` and `repairs` when repairs are named and `code` when one is. */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}

/* REC-122 / D-161 act (3) / IC-232 — THE MEMBER'S CHOICE OF THE ON-POINT PAIR, C-74
 * (minted with the old process's `node tools/mintid.mjs C` (that tool was retired in T19); C-68
 * was minted first and found TAKEN on an in-flight landing branch, so it was abandoned — gaps
 * cost nothing).
 *
 * ITS OWN FAMILY AND NOT A SUB-NUMBER OF C-49, because C-49 is a READ's answer about
 * what a portion may earn and this is an ACT's refusal: the three ways a member's
 * choice could record something that was not established — a choice nobody made
 * (a machine credential, or no name at all), a choice about a connection the record
 * does not hold (or holds out of the chooser's sight, answered identically), and a
 * choice of a mention the document does not carry. REC-86's C-50.5 is the leg-side
 * twin of the first and its wording is mirrored on purpose.
 *
 * ONE REGION, `is-connection-choice`, written in `Store#chooseConnectionPair` and moved with its
 * markers to connections' `choose` (`src/connections/index.mjs`, T5; re-pointed T6); one helper
 * named `refusal`; every code a literal at its site. */
export const CONNECTION_CHOICE_CHECKS = {
  CONNECTION_CHOICE_NOT_A_MEMBER: {
    check: 'C-74.1',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'Choosing which mention of a subject is the one on point for a connection is a '
      + 'member\'s own act, done in their name. A machine may point out the mentions a document '
      + 'holds, but deciding which one a connection rests on is a judgment a person signs for.',
  },
  CONNECTION_CHOICE_NO_CONNECTION: {
    check: 'C-74.2',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'That request does not name a connection this record holds and you can see. A '
      + 'connection is named by the two documents it joins and the subject that joins them, and '
      + 'it exists once the record has derived it — choose after it appears among the document\'s '
      + 'connections.',
  },
  CONNECTION_CHOICE_NOT_A_MENTION: {
    check: 'C-74.3',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'The mention named is not one this document carries for that subject. The choice '
      + 'is among the places the record actually read the subject in this document, by the '
      + 'reference as the reading recorded it; a mention the record never read cannot be the one '
      + 'a connection rests on.',
  },
  /* D-454: the reference named was read at MORE THAN ONE place in this document, so naming the
     string is not yet a choice between its mentions. Refused rather than defaulted: a default
     (the first read, say) would be REC-122's own liar — the machine's selection wearing a
     member's name. The refusal lists the occurrences so the member can name one. */
  CONNECTION_CHOICE_OCCURRENCE_UNNAMED: {
    check: 'C-74.4',
    where: 'src/connections/index.mjs choose > is-connection-choice',
    translation: 'That reference was read at more than one place in this document, and each place is '
      + 'its own mention. Say which one is on point — by the occurrence the record lists for it, or by '
      + 'the place as the record names it — and the choice will rest on that place alone.',
  },
};

/* =========================================================================
 * FW-17 · THE DETERMINING REFERENCE PAIR, AND WHAT A PORTION MAY EARN FROM IT
 * (D-161; Bob's rulings of 2026-09-14, CONTENT-EXTENT-DESIGN-SPACE.md 5.1
 * and 5.4; framework Part I 8.1 for the grade itself)
 * =========================================================================
 *
 * Bob ruled that a citation pointing at a portion refers ONLY to that portion —
 * "just as an HTML highlight link refers to specific content in that document" —
 * so a content-grain leg earns, on every axis, only from what is IN its portion.
 * On the CONNECTION axis that makes one question decidable that was not: does a
 * connection between two documents belong to this PART of one of them?
 *
 * It belongs iff the reference that DETERMINED the connection was read inside
 * the part. That is what the pair on a `connections` row is for, and it is why
 * the two refusals below exist rather than a silent "no".
 *
 * WHY REFUSALS AND NOT AN EMPTY ANSWER, which is the judgement this family turns
 * on. An empty answer and a refusal say different things to a member, and the
 * difference is the whole product: "this connection does not reach your
 * citation" is a FINDING about their case that they can act on by narrowing or
 * widening the citation, while a silently dropped connection is a case that got
 * weaker for a reason nobody stated. Undetermined is first-class and must be
 * STATED — so it is stated, with a code and a sentence. */
export const CONNECTION_PAIR_CHECKS = {
  /* THE FORGED PAIR. A pair whose recorded position is NOT inside the extent
     being graded may not grade it — which sounds obvious and is exactly the
     shortcut this record would otherwise take, because the pair is right there
     on the row and its grade is already computed. Taking it would let a leg
     citing page 3 earn a connection established on page 300 of the same
     document, which is Bob's 5.1 ruling inverted. */
  CONNECTION_PAIR_OUTSIDE_EXTENT: {
    check: 'C-49.1',
    where: 'src/connections/pair.mjs checkConnectionPairCovers > is-connection-pair-covering',
    translation: 'This connection was established by a reference somewhere else in the document, '
      + 'not in the part you cited. A citation that points at a passage stands on what is IN that '
      + 'passage, so it cannot borrow a link the record found elsewhere in the same file. Cite the '
      + 'part where the reference actually appears, or cite the document as a whole and say so.',
  },
  /* THE UNPLACEABLE PAIR. The connection has its two references and neither
     reading recorded WHERE it read one, so whether the reference is inside the
     cited part is not a hard question — it is an unanswerable one. This is the
     state IC-86 exists to shrink and it will be the common state until every
     producer itemises its text; it is a STATEMENT, and the closing is per pair
     and never assumed for the connection as a whole. */
  CONNECTION_PAIR_UNPLACED: {
    check: 'C-49.2',
    where: 'src/connections/pair.mjs checkConnectionPairCovers > is-connection-pair-covering',
    translation: 'The record knows which reference links these two documents but not where in '
      + 'either document it was read, so it cannot say whether that reference falls inside the part '
      + 'you cited. This is stated rather than assumed either way: the connection is real and its '
      + 'reach into your citation is undetermined until the document is read with positions.',
  },
  /* THE ABSENT ROW. Asked to grade a portion the record does not hold. Refused
     rather than answered UNDETERMINED, because those are opposite findings: an
     undetermined grade says the portion exists and its connections cannot be
     placed, and answering that for an id nothing minted would confirm a passage
     that was never addressed. */
  CONNECTION_PAIR_NO_CONTENT: {
    check: 'C-49.3',
    /* A REGION and not the whole function, which is DEC-49's own rule (a row's
       `where` names the SMALLEST SPAN) and is also what the harness demanded:
       the function's other early return, `NO_CONTENT`, is a caller who named no
       key rather than a member who was refused, and a whole-function `where`
       made this row appear to govern it — so the guard asked for either a
       translation for "you passed no parameter" or a narrower span. The span is
       the honest answer. */
    where: 'src/connections/index.mjs portionGrade > pair-content-row-present',
    translation: 'This record holds no passage with that address, so there is no part of a '
      + 'document whose connections could be weighed. A content address is minted when a citation '
      + 'first points at a passage — if you expected one here, the citation that would have made it '
      + 'has not been written yet.',
  },
  /* REC-120 / D-161 act (1) / M-51 — THE UNCHOSEN MENTION. The pair is the
     STRONGEST-GRADED mention of the subject in each document (FW-17's collapse),
     never a mention anybody chose as ON POINT (Bob's 5.4 second pass). So when
     the document holds MORE THAN ONE mention of the subject, the pair's place is
     a machine selection and two answers built on it would claim more than the
     record holds: a definite "outside" for a part where ANOTHER mention of the
     subject was read (FW-21 drove it: page 9 of a document mentioning the
     ordinance on 2 and 9 answered exactly as page 7, which never mentions it),
     and a "reaches" for a part the pair won only on a TIE-BREAK against an
     equal-grade mention read elsewhere (the tie-break is sort order, which says
     nothing about relevance — flip it and the answer flips). Both are
     UNDETERMINED, stated, with the mentions named. A mention the reading could
     not place counts as possibly-inside and possibly-outside, for the same
     reason C-49.2 exists. A WEAKER mention outside does not unsettle a reach:
     grade decided that pair, and grade is a stated basis. */
  CONNECTION_PAIR_MENTION_UNCHOSEN: {
    check: 'C-49.4',
    where: 'src/connections/pair.mjs checkConnectionMentionUnchosen > is-mention-unchosen',
    translation: 'This document mentions the same subject in more than one place, and the record '
      + 'linked the two documents through the strongest-graded mention without anyone choosing '
      + 'which mention is the one on point. Because another mention bears on the part you cited, '
      + 'whether this connection reaches your citation is undetermined rather than yes or no. A '
      + 'citation of the document as a whole is answered today; a member may also choose which '
      + 'mention is the on-point one for this connection, and the answer then follows that choice.',
  },
};


/* =====================================================================
 * D-162 / IC-241 — THE THEME (`BIO_Content_Framework_v0_10.md` §8.4, Bob's
 * ruling of 2026-09-21 and its four fences): a connection through an IDEA.
 * C-81, minted with the old process's `node tools/mintid.mjs C` (that tool was retired in T19).
 *
 * ITS OWN FAMILY because its subject is its own: the ways a member's declared
 * LENS could come to claim more than it is. Bob: *"these fuzzy ideas could
 * become a narrative without basis"*. The fences, and where each is held:
 *
 *   1. declared by a MEMBER, attributed on every reading   is-theme-declare
 *   2. it carries its TEST, or it is not declared           is-theme-declare
 *   3. membership is a member's act; a machine's proposal   is-theme-place,
 *      is a HUNCH (grade C) and never membership            is-theme-propose
 *   4. NEVER THE BASIS OF A CLAIM: no basis, version or     is-theme-not-evidence
 *      action-basis leg rests on a theme or on membership
 *      in one, refused BY NAME as a lead is (C-54.1)
 *   5. a placement is taken back, or a proposal turned      is-theme-withdraw,
 *      down, by a member, with a reason (C-81.11-C-81.14,   is-theme-withdraw-standing
 *      connections R43, T6)
 *
 * THE LIAR THIS FAMILY REFUSES is a theme as an ELEVENTH ENTITY KIND — a named,
 * citable thing — so that two documents "about deferred maintenance" would read
 * as connected through a subject the record holds rather than through one
 * member's declared lens. The first fence is STRUCTURAL: a theme lives in
 * `themes` under a `THEME-` id that no leg grammar accepts, and `ENTITY_KINDS`
 * does not contain it. The second is C-81.1, which names the theme instead of
 * answering "not a canonical bundle id" — a member told their theme is a
 * malformed id would go looking for a way to make it citable.
 * ===================================================================== */
/* R66 (T33-29; S0-7, B0.4): the id core is `record-grammar`'s `idPattern("THEME")` (`ID_TABLE`), so a counter of five
   or more digits is accepted wherever one of four is; the slug after the core, and the membership address below, are
   this module's own rules. No copy of the counter's width is held here. */
const THEME_CORE = idPattern("THEME").source.slice(1, -1);
export const THEME_ID_RE = new RegExp(`^${THEME_CORE}-[a-z0-9]+$`);
/* A leg can name a theme BARE, or name a MEMBERSHIP in one by the theme's id with
   an address after it (`THEME-…#INFO-…`, `THEME-…/…`, `THEME-…:…`) — resting on
   membership is still resting on the theme, so both are the same refusal. */
export const THEME_REF_RE = new RegExp(`^${THEME_CORE}-[a-z0-9]+(?:[#/:?].*)?$`);
/* The leg keys that can only mean "this leg counts BECAUSE of a theme". No leg
   grammar reads either; a leg carrying one is claiming membership as a reason. */
export const THEME_LEG_KEYS = ["theme", "themes"];


export const THEME_CHECKS = {
  THEME_NOT_EVIDENCE: {
    check: 'C-81.1',
    where: 'src/connections/checks.mjs themeLegFindings > is-theme-not-evidence',
    translation: 'That leg rests on a THEME. A theme is one member\'s declared lens — an idea they use to '
      + 'gather material — and it is never the basis of a claim, so nothing can rest on it or on a '
      + 'document\'s membership in it. Cite the document or the passage itself: what a finding rests on '
      + 'is content, whatever theme led you to it.',
  },
  THEME_NOT_A_MEMBER: {
    check: 'C-81.2',
    where: 'src/connections/themes.mjs declare > is-theme-declare',
    translation: 'A theme is declared by a person, in their own name, and every reading of it shows whose '
      + 'lens it is. The credential that asked is an automated one, which has nobody behind it to hold '
      + 'the idea. Sign in and declare it yourself.',
  },
  THEME_NO_TEST: {
    check: 'C-81.3',
    where: 'src/connections/themes.mjs declare > is-theme-declare',
    translation: 'A theme needs its TEST: one sentence a document or a passage either passes or fails, so '
      + 'any member can check a placement against it. Without one the theme is a label anything could '
      + 'wear, and it cannot be declared.',
  },
  THEME_NO_NAME: {
    check: 'C-81.4',
    where: 'src/connections/themes.mjs declare > is-theme-declare',
    translation: 'A theme needs its idea in a few words — what you are calling it, such as "deferred '
      + 'maintenance" — as well as its test. Nothing was declared.',
  },
  THEME_TOO_LONG: {
    check: 'C-81.5',
    where: 'src/connections/themes.mjs declare > is-theme-declare',
    translation: 'The theme\'s name or its test is longer than the record stores in one passage. It was '
      + 'refused rather than cut, so nothing you wrote is silently lost. Shorten it and declare it again.',
  },
  THEME_NOT_FOUND: {
    check: 'C-81.6',
    where: 'src/connections/themes.mjs #themeFor > is-theme-source',
    translation: 'No theme is recorded under that id. Use the id the declaration returned, or list the '
      + 'themes to find it.',
  },
  THEME_PLACEMENT_NOT_A_MEMBER: {
    check: 'C-81.7',
    where: 'src/connections/themes.mjs place > is-theme-place',
    translation: 'Placing a document in a theme is a member\'s judgement that it passes the theme\'s test, '
      + 'recorded in their name. An automated credential may only PROPOSE a placement, which stays a hunch '
      + 'until a member confirms it. Sign in to place it, or propose it instead.',
  },
  THEME_TARGET_NOT_FOUND: {
    check: 'C-81.8',
    where: 'src/connections/themes.mjs #targetFor > is-theme-target',
    translation: 'Nothing you can see in the record answers to that document or passage id, so it cannot be '
      + 'placed in a theme. Name a document by its id, or a passage by the content id it was minted under.',
  },
  THEME_REASON_TOO_LONG: {
    check: 'C-81.9',
    where: 'src/connections/themes.mjs #targetFor > is-theme-target',
    translation: 'The note on this placement is longer than the record stores in one passage. It was '
      + 'refused rather than cut. Shorten it and try again.',
  },
  THEME_NO_PROPOSER: {
    check: 'C-81.10',
    where: 'src/connections/themes.mjs propose > is-theme-propose',
    translation: 'A proposal must say who proposed it, and this one arrived carrying nobody. The record '
      + 'stamps the proposer from the credential that asked; nothing was written.',
  },  /* connections R43, R62 (K152; T6, legacy-checks): TAKING A PLACEMENT BACK, OR TURNING A PROPOSAL DOWN
     (`op=themewithdraw`). CONNECTIONS #1 (T5) minted these four in `src/connections/themes.mjs`, in this family's
     shape; they are here word for word, and `THEME_WITHDRAW_CHECKS` there is a view of these four rows. The order
     at the act: the actor (C-81.11), then C-81.6, C-81.8 and C-81.9, then no reason, nothing standing, not the
     placer. */
  THEME_WITHDRAW_NOT_A_MEMBER: {
    check: 'C-81.11',
    where: 'src/connections/themes.mjs withdraw > is-theme-withdraw',
    translation: 'Taking a document or a passage out of a theme, or turning down a proposal, is a member\'s own '
      + 'judgement, done in their name. A machine may propose a placement; it cannot take one back.',
  },
  THEME_WITHDRAW_NO_REASON: {
    check: 'C-81.12',
    where: 'src/connections/themes.mjs withdraw > is-theme-withdraw-standing',
    translation: 'Say why. A placement taken back or a proposal turned down keeps its reason beside it, so the next '
      + 'reader of the theme can see what was judged and on what ground.',
  },
  THEME_WITHDRAW_NOTHING_STANDING: {
    check: 'C-81.13',
    where: 'src/connections/themes.mjs withdraw > is-theme-withdraw-standing',
    translation: 'Nothing stands in this theme at that document or passage: it was never placed or proposed there, '
      + 'or it has already been taken back. There is nothing to withdraw.',
  },
  THEME_WITHDRAW_NOT_THE_PLACER: {
    check: 'C-81.14',
    where: 'src/connections/themes.mjs withdraw > is-theme-withdraw-standing',
    translation: 'A membership is taken back by the member who placed it, or by an administrator. Any member may turn '
      + 'down a proposal, but another member\'s placement stands on their judgement until they withdraw it.',
  },
};

/** C-81.1 — ONE LEG, ASKED WHETHER IT RESTS ON A THEME OR ON MEMBERSHIP IN ONE.
 *  C-54.1's shape exactly, consulted at the same three doors (`checkInquiryBasis`'
 *  basis[], the version legs, the action basis), so fence 4 has one spelling. It
 *  asks the two fields a leg names a referent through — the target and the REC-82
 *  content id — and the leg keys that could only mean "counts because it is in a
 *  theme". A leg citing a DOCUMENT that happens to be in a theme is NOT refused:
 *  what a finding rests on stays content (§8.4 fence 4), and the document is
 *  content. Returns true when it pushed a finding, so the caller skips its own
 *  target complaint about the same leg rather than answering with the wrong name. */
export function themeLegFindings(label, leg, findings) {
  const l = leg && typeof leg === 'object' ? leg : {};
  /* The family helper, by name: DEC-49's form, `refusal("CODE"` at the site. */
  const refusal = (code, message, repairs) => f(THEME_CHECKS[code].check, 'error', message, repairs, code);
  const REPAIRS = ['cite the document or the passage itself — the theme is how you found it, not what it shows',
                   'or leave the theme out of the leg: membership in a theme is never a reason a leg counts'];
  /* DEC-49 REGION is-theme-not-evidence */
  for (const field of ['target', 'content_id']) {
    const v = typeof l[field] === 'string' ? l[field].trim() : '';
    if (v && THEME_REF_RE.test(v)) {
      findings.push(refusal("THEME_NOT_EVIDENCE",
        `${label}.${field} '${v.slice(0, 80)}' names a THEME${THEME_ID_RE.test(v) ? '' : ' membership'}, and a theme `
        + `is never the basis of a claim (BIO_Content_Framework_v0_10.md §8.4, fence 4): it is a member's `
        + `declared lens, not evidence, so no leg can rest on it or on membership in it`, REPAIRS));
      return true;
    }
  }
  for (const key of THEME_LEG_KEYS) {
    const v = l[key];
    const named = typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) ? v.length > 0 : v != null && v !== false;
    if (named) {
      findings.push(refusal("THEME_NOT_EVIDENCE",
        `${label}.${key} claims the leg through a THEME, and membership in a theme is never a reason a leg `
        + `counts (BIO_Content_Framework_v0_10.md §8.4, fence 4): the leg rests on its target or on nothing`,
        REPAIRS));
      return true;
    }
  }
  /* END DEC-49 REGION is-theme-not-evidence */
  return false;
}
