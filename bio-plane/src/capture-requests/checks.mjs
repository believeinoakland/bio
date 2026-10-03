/* capture-requests' refusal rows and the conduct vocabulary its drain judges (requirements:
 * `build/requirements/capture-requests.md`, R14, R19, R34, R40; K181 (2), K649).
 *
 * C-28, the capture-request family, less C-28.13 (the capture-request arm's row, `acquisition`'s: its R1, R29), COPIED
 * from the check catalogue (`bio-plane/checks/bio-checks.mjs`) in T18: each row's code, number and translation are
 * unchanged and its `where` names this module's site, taken by 1.49.0 (promotion's T19 job). The catalogue's copy
 * was deleted by this module in T19 (rule 1, K816; 1.50.0 records it): this table is now the only one.
 * `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES` and `userAgentIsLegible` MOVED here (K586 BOB-1: this module was their only
 * product importer).
 * The Civicsmith agent's one composer, `civicsmithUserAgent`, is `acquisition`'s (its R24), read from there so the
 * drain judges the string `acquisition` sends. C-108 is this module's own family (K181 (2); K174's pattern).
 *
 * The catalogue's comments are carried with each row, so the reasoning stays beside it. */

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
 * family and the drain fetches no `robots.txt`. The module's R14 test
 * (`test/m/capture-requests/drain.test.mjs`) drives a document under a
 * `Disallow` path and asserts it CAPTURES, because a rule that is absent BY
 * DECISION needs an arm proving the absence is real.
 * ========================================================================= */

/** The UA `purpose` component this door may name. A CLOSED set: an unknown
 *  purpose is not a harmless label, it is this instance telling a source
 *  something false about why it is asking. `investigate` is the token DEC-47
 *  said an investigation fetch *"introduces or reuses deliberately"*; `acquire`
 *  is the existing one and is admitted so a run re-fetching a source a member
 *  already named does not have to misdescribe that either. */
export const CAPTURE_PURPOSES = Object.freeze(['investigate', 'acquire']);

/** The two LEGIBLE user-agent forms, and there is no third. `civicsmith` is the
 *  honest product string with its contact URL (`acquisition`'s `civicsmithUserAgent`);
 *  `member-browser` is BOB-3's delegation of the member's OWN browser UA, which
 *  is permitted for publicly available documents and is a member speaking as
 *  themselves through a tool they run. A fabricated string is neither, and this
 *  door cannot express one. */
export const CAPTURE_UA_MODES = Object.freeze(['civicsmith', 'member-browser']);

/** R14 (DEC-124, K1365 (4)): the names a mode was written under before, each read as the mode it names now. `civicos`
 *  is the product's name before T31: accepted on input, read in a stored row as `civicsmith`, never written. An alias
 *  is not a third form: it names one of the two. */
export const CAPTURE_UA_MODE_ALIASES = Object.freeze({ civicos: 'civicsmith' });

/** R14: a mode as this module answers and judges it, an alias read as the mode it names; any other value as it is. */
export function uaModeOf(mode) {
  return typeof mode === 'string' && Object.prototype.hasOwnProperty.call(CAPTURE_UA_MODE_ALIASES, mode)
    ? CAPTURE_UA_MODE_ALIASES[mode] : mode;
}

/** Is this user-agent LEGIBLE — does it name a contact a third party can reach?
 *  ONE predicate, used by the drain's conduct check and by its R14 tests, so
 *  the rule and its test cannot disagree. It matches the `(+<url>)` component
 *  D-94's ladder measured, and it is deliberately a SHAPE test rather than a
 *  reachability test: whether the URL resolves is SOURCE-ACCESS.md's own open
 *  item, and a conduct check that fetches would be a conduct check that can fail
 *  for the network's reasons. */
export function userAgentIsLegible(ua) {
  if (typeof ua !== 'string' || ua.trim() === '') return false;
  return /\(\+https?:\/\/[^\s)]+/.test(ua);
}
export const CAPTURE_REQUEST_CHECKS = Object.freeze({
  /* ---- THE DOOR. Refused at the request, before any row exists. These are
     SHAPE rules and NOT conduct: conduct is enforced once, at the drain. ---- */
  CAPTURE_REQUEST_NO_RUN: {
    check: 'C-28.1',
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
    translation: 'This request did not name the piece of work asking for it, or named one that is not '
      + 'running here. Every fetch this instance makes on its own is traceable to a session somebody '
      + 'opened, because that opening is what authorises it.',
  },
  CAPTURE_REQUEST_NOT_PUBLIC: {
    check: 'C-28.2',
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
    translation: 'What was asked for is not a public web address. What an investigation session may '
      + 'reach is what anybody could reach by typing it into a browser, so an address that is not '
      + 'public on its face is not asked for at all.',
  },
  CAPTURE_REQUEST_NOT_AN_INQUIRY: {
    check: 'C-28.3',
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
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
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
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
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
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
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
    translation: 'This request asked to fetch as the member\'s own browser, and the record does not '
      + 'hold what that browser is. Presenting an agent nobody actually used would be inventing a '
      + 'client rather than speaking as one, so it asks rather than guessing.',
  },
  /* CONDUCT 2: the purpose token. */
  CAPTURE_CONDUCT_NO_PURPOSE: {
    check: 'C-28.8',
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
    translation: 'Every request this instance makes says what it is for, so a source can tell a first '
      + 'capture from a routine re-check and throttle one without blocking the other. This one names '
      + 'a purpose that is not one of the things it could truthfully be doing.',
  },
  /* CONDUCT 3: rate. */
  CAPTURE_CONDUCT_HOST_HELD: {
    check: 'C-28.9',
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
    translation: 'The site this would fetch from has asked us to slow down, or has refused us recently, '
      + 'and we are waiting the interval it named. The request is still queued and will be made when '
      + 'the wait is over — nothing has been lost and nothing needs re-asking.',
  },
  CAPTURE_CONDUCT_TICK_SPENT: {
    check: 'C-28.10',
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
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
    where: 'src/capture-requests/index.mjs #conduct > is-capture-conduct',
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
     composer's output instead. C-28.12 is therefore UNALLOCATED. */
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
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
    translation: 'This says the document bears on another question, but what it names is not a '
      + 'question. The whole point of noting a lead is that somebody working that question will be '
      + 'told about it, and there is nobody to tell if it does not name one.',
  },
  CAPTURE_REQUEST_LEAD_IS_THE_TARGET: {
    check: 'C-28.15',
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
    translation: 'This names the same question twice — the one being worked, and the one the '
      + 'document supposedly bears on. Evidence for the question you are already working is just '
      + 'evidence for it, and flagging it as belonging somewhere else would put a note in front of '
      + 'you saying a document you just asked for is about something other than what you asked.',
  },
  /* D-491 / IC-276 — THE RENDER FLAG AT THE DOOR, AND IT IS C-83.1's ARGUMENT
     ONE LAYER UP. op=acquire refuses a `render` that is present and not `true`
     rather than reading it as absent, because a `render: "yes"` answered with the
     plain capture files the served shell as the content — the one outcome the
     whole C-83 family exists to prevent. The same value arriving at THIS door is
     the same defect with a delay on it, and worse in one respect: the row
     outlives the call, so the drain fetches under a flag nobody can see was
     dropped and the request reads afterwards as one that never asked.

     IN THIS FAMILY AND NOT IN C-83, on PL-15's precedent (its two lead rows) and
     for PL-15's reason: it is enforced inside `is-capture-request`, which is THIS
     family's governed span, so a row filed under C-83 would leave a code in a
     region whose rows do not name it and arm C would report a site it could not
     judge. C-28.16 — C-28.5 and C-28.12 stay UNALLOCATED, because reusing a
     number this file records as deleted would make its own history unreadable. */
  CAPTURE_REQUEST_RENDER_MALFORMED: {
    check: 'C-28.16',
    where: 'src/capture-requests/index.mjs captureRequest > is-capture-request',
    translation: 'This asked for the page as a visitor would see it in a form this instance does not '
      + 'recognise. It reads render: true, or nothing at all for the document as the site serves it, so a '
      + 'request for the rendered page is never quietly turned into a request for the page\'s empty frame. '
      + 'Nothing was queued.',
  },
  /* D-584 (capture-requests R19; T6, legacy-checks) — THE DRAIN'S OWN HOLD WHEN A FETCH DOES NOT LAND.
     Every other failure of a fire (not captured, not refused by the source, not a render op=acquire could
     not do) holds the row `requested` under this code, appends a LOOKED_INDETERMINATE look that is NOT
     governed, and answers the row in `held`. The code was written to the row and catalogued nowhere, so
     `renderHoldReason` answered it with no check and no sentence (it reads this family, so the row reaches the held row at once). It is the drain's condition, so it is
     this family's (R19: every code the module writes to a row is in C-28 or C-83). The `where` names a
     region, not the drain whole: the drain's other outcomes are other families' codes read from rows, and a
     whole-function `where` would conscript them. capture-requests marks it in its `drain` (T6; re-pointed T8,
     N154). */
  CAPTURE_FETCH_FAILED: {
    check: 'C-28.17',
    where: 'src/capture-requests/index.mjs drain > is-capture-fetch-failed',
    translation: 'This instance tried to fetch the document and the fetch did not land, so nothing was '
      + 'captured. That says nothing about the document or the site beyond this one attempt, and it is '
      + 'recorded as a look that could not tell. The request is still queued and is tried again on a later '
      + 'round, until it expires.',
  },
  /* K109 (3), capture-requests R42 (T6, legacy-checks) — THE RETRY'S ONE REFUSAL. `captureRequestRetry`
     (op=capturerequestretry) returns a request to the queue only when it was refused for the SOURCE's reason
     (R40) and its target is one the caller can see; every other request is refused by this code and nothing
     is written. `captureRequestRetry` mints it, and the `where` names that site, a region on this family's REC-71
     rule. The sentence claims
     nothing about which state the request is in, because an invisible target answers alike. */
  CAPTURE_REQUEST_NOT_RETRYABLE: {
    check: 'C-28.18',
    where: 'src/capture-requests/index.mjs captureRequestRetry > is-capture-request-retry',
    translation: 'This request cannot be asked again. Only a request the source itself turned away, under a '
      + 'question you can see, goes back into the queue; a request that is still waiting, was captured, has '
      + 'expired, or was refused for any other reason does not. Nothing was changed.',
  },
  /* R45 (T23; Intake Doctrine §4, the AI's "relevant nearby" arm; K1036, K1099) — A RUN'S REQUEST NAMING A SWEEP IS
     FILED UNDER THAT SWEEP ONLY WHEN THE SWEEP'S SCOPE ADMITS IT. A sweep names a query members ratified up front, and
     a request filed under it inherits that ratification, so the fence is the sweep's own: ratified, not held, and every
     locator of the request (the address, and any redirect the fetch meets) inside its scope. The scope check is
     `link-sweep`'s (its R12), registered at start; with none registered nothing can say the sweep admits the request, so it is
     refused. Terminal: the request is not fetched under a sweep that does not admit it, and nothing is filed. Minted at
     one region (`sweepOutOfScope`), which the drain's conduct and its fire both answer through. New at T23,
     taken by 1.54.0 (promotion's T24 job). */
  CAPTURE_SWEEP_OUT_OF_SCOPE: {
    check: 'C-28.19',
    where: 'src/capture-requests/index.mjs sweepOutOfScope > is-capture-sweep-scope',
    translation: 'This request asked to be filed under a sweep, and that sweep does not take it: the sweep is not '
      + 'ratified, is held, or does not reach this address. Nothing was fetched or filed under it. A request filed '
      + 'under a sweep answers to what members ratified for that sweep, so it is never stretched to fit.',
  },
});

for (const row of Object.values(CAPTURE_REQUEST_CHECKS)) Object.freeze(row);

/* C-108: capture-requests' own refusal family (K181 (2); K174's pattern: a new family is held in its module, the
 * catalogue untouched). One row: the source's own refusal of a request (R40, K103 (3)). */
export const CAPTURE_SOURCE_CHECKS = Object.freeze({
  /* R40, R42: THE SOURCE TURNED THE REQUEST AWAY and said why (401/407 a login, 402 a payment, 403/406 an agent it will
     not admit, 451 another reason). Terminal, and the one refusal a member can answer: supply what the source asked
     for (capture-sources R55) and ask again (op=capturerequestretry). */
  CAPTURE_SOURCE_REFUSED: {
    check: "C-108.1",
    where: "src/capture-requests/index.mjs drain > is-capture-source-refused",
    translation: "The site turned this request away: it asked for a login, a payment or a different browser, or refused "
      + "for another reason it gave. Nothing was captured. A member who can see the question may supply what the site "
      + "asked for and ask again.",
  },
});
