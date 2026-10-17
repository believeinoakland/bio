# DRAFT · T47: the member interface's second part (N897 (1))

**Status** · DRAFT for BOB, written 2026-10-12 by a drafting worker of BOB #164 on `tranche/T47` (P18), with L11's fold. It rules nothing. The requirements it summarises are worded in `build/requirements/screens-wizards.md`, `screens-investigate.md`, `screens-publish.md` and `screens-action.md` (each not yet met, T47); the kit, routing and re-points they need are `interface-shell` R27–R31 and `control-plane` R81. §6's first part is Bob's (UX, P17); the rest is BOB's.

**Sources** · `build/plan/current.md` T47-56…T47-66 and "Settled at the opening" (K3027 doubt 2); `draft-T46-interface.md` (its §2–§5, the form followed here); the design stream's files on `main` at PR #31's merge (`a0fab7abf0`, DEC-198, DEC-199): `docs/development/ux-substrate/screens/registry.json` (48 screens, 276 acts), `library.json` (22 scripts, 5 front doors), `mock-acts.js` (261 entries), `words.json` (1,608 words), `mock-screens.js`, `mock-shell.js` (`PATH`, `wizardGuide`, `ring`), `layouts.html` §2–§3, `views/plan-page.html`, `views/start-and-send.html`, `views/matter-page.html`; `bio-plane/src/op-declarations/index.mjs` (`OPS`, `OP_ALIASES`, `SESSION_OPS`).

---

## 1. Packaging (K3027 doubt 2, as drafted)

| module | place (layer 11) | screens | registry acts | est. lines |
|---|---|---|---|---|
| `screens-wizards` | after `interface-shell`, before `screens-settings` | `wizards`, and the runner (the dock's wizard guide) | 6 | 1,800–2,400 |
| `screens-investigate` | after `screens-inquiry` | `person`, `explore`, `timeline`, `money`, `calculation`, `proceeding`, `due-date`, `standard`, `ties` | 52 | 2,600–3,200 |
| `screens-publish` | after `screens-investigate` | `case-editor`, `review-copy`, `ceremony`, `published`, `imported`, `docket`, `doorbell` | 24 | 2,600–3,200 |
| `screens-action` | after `screens-publish`, before `control-plane` | `plan`, `start-send`, `request`, `action`, `matter` | 35 | 2,400–3,000 |

Each uses `interface-shell` and `setup-words`, and `op-declarations` and `wizard-scripts` in tests only; `control-plane` gains the four as edges (T47-65, R81). Screens the existing modules gain in T47: `group-identity`, `security`, `translations` (`screens-settings` R14–R16), `archive` (`screens-intake` R15), `projectai` (`screens-inquiry` R14).

## 2. The screens, their reads and acts

### 2.1 screens-wizards (R1–R9)
- **wizards** (Settings › Wizards): reads `wizards`, `wizardread`, `baseupdates`; acts `wizards`, `wizarddraft` (record, or copy), `wizardrevise`, `wizardsubmit`, `wizardapprove` (with `widen`), `wizardretire`. A Civicsmith script offers only its copy.
- **The runner**: starts from `wizardsat` marks on any screen, Home's front doors (`startfrom`, via `cs.wizard`) or the library; the guide in the dock (step i of n, what and why by `wizard.<id>.step<n>.*` keys for Civicsmith's, Back, Next, Stop, "Show me where" / Alt+Shift+W through `cs.ring`); recording a new wizard through the shell's act hook (op and screen only); drafts placed by `cs.fill`, labelled by kind, machine drafts only while the assistant is reachable; side trips return to the step left; progress only through `wizardprogress`; the welcome and first-question wizards offered first on Home (R7: Bob's Q1 below).

### 2.2 screens-investigate (R1–R10)
- **person**: `person`, `samepersoncandidates`; acts `person`, `recordpersonfact`, `identityclaim`, `withdrawidentityclaim`, `followregister`, `personexpunge` (Irreversible weight, its consequence dialog; read-only at phone width).
- **explore**: `explore`, `explorepreset`, `exploreverify`, `connectionassert`, `promote`; chains by the weakest hop, no score.
- **timeline**: `timeline` in two lanes; `createevent`, `addparticipant`, `relate`, `recorddatedfact`, `hypothesishold`, `findin`.
- **money**: `moneyset`, `moneyof` as rows with panels (DEC-176); 14 acts, the hold strip's four.
- **calculation**: `calculation`, `spotcheck`; 8 acts; a visit recorded as `testify` then `spotcheckvisit` (a re-point, §3).
- **proceeding**: `entity`, `partiesof`, `follows`, `dutiesof`; 5 acts.
- **due-date**: `action`, `clockproposals`, `clocksics` (download); `clockpropose`, `clockadopt`, `reminderset`.
- **standard**: `standard`, `lawrelations`, `proposals`; `standarddeclare`, `standardadopt`, `lawrelate`.
- **ties**: `memberties`; `declaretie`, `withdrawtie`.

### 2.3 screens-publish (R1–R11)
- **case-editor**: `casedrafts`, `casedocument`, `casecheck`, `whatchangeddrafts`; `casedraft`, `whatchangedpropose`, `statementack`, `attribute`, `writinghelp`.
- **review-copy**: `reviewcomments`; `reviewgrant` (secret shown once, outward), `reviewrevoke`, `reviewcomment`.
- **ceremony**: `publishpreflight`, `publishtensions`, `photomarks`, `publishschedule`; the Photos step (`obscuremark`, `obscuremarkwithdraw`), Ties, Sign (`caseratify`, `publishat` "Publish at…").
- **published** (public frame, no session): `publishedcase`, `publishededitions`; `verify`, `publishedcase`.
- **imported**: `importedcases`, `importedcase`; `caseimport`, `importaccept`, `importflag`, `importwatch`.
- **docket**: `docket`, `docketprepare`; `docketfile`, `docketpost` (signed).
- **doorbell** (public frame, no session): `groupidentity`; `knock`.

### 2.4 screens-action (R1–R7)
- **plan**: `plan`, `planproposals`; 10 acts (`itemtakeup` among them, take-up never assignment).
- **start-send**: `optionstartpreview`, `optionstart`; `communicationprepare`, `filingprepare`, `filingapprove`, `filingsecondapprove`, `filingrecordsent`.
- **request**: `addresseesuggest`, `actioncreate`, `actionlaws`, `communicationprepare`, `filingapprove`, `filingrecordsent`.
- **action**: `action`; `actioncorrespond`, `actionpressure`, `actionmove`, `reminderset`, `actionhold`, `actionscope`.
- **matter**: `determination`, `consequencesof`, `escalation`, `escalationstatus`; the six escalation acts.

## 3. The screen set against the registry

Every act of the 22 screens names an op `OPS` holds (aliases through `OP_ALIASES`: `declaretie`, `withdrawtie`, `recordpersonfact`, `withdrawidentityclaim`, `createevent`, `addparticipant`, `relate`, `recorddatedfact`, `recordfact`, `createset`, `include`, `exclude`, `reconcile`, `addworkbook`, `bind`, `recordcheck`, `recordline`, `declare`, `filingrecordsent`). No act of these screens is owed. The registry's one owed act, `owed:projectaikeepaway DEC-188` (`projectai`), names a declared op.

**Re-points (`interface-shell` R28), each a registry correction for the design stream (BOB's channel act):** `capture` "Watch this address" also sends `monitorset` (N969); `project` "Set the project's bar" is `projectbarset`, not `strengthbarset` (N976); `project` "Open a question" also sends `drawquestion` (N975); `calculation` "Record what you found at a report" also sends `spotcheckvisit`. The `views/*.html` pages draw a few acts the registry does not list (a plan's "Decline with reason" on picked options, a pressure record's "Open an inquiry"); only the registry's are drawn.

**Words:** every screen has `screen.<id>.name` and `.purpose` and every act `act.<op>.label.<screen>` in `words.json`; the screens' other sentences are each module's `SCREEN_WORDS`, adopted by the design stream once on `main` (DEC-198 (6)).

## 4. How it is tested (as `draft-T46-interface.md` §4)

One table per screen of its registry acts (a test fails if a screen draws an act not listed, or a listed act is not drawn in the state where it applies); each act driven over a fake plane with its owner's documented answer and each kind of refusal; R10's four read states; the runner walking a two-screen script with a side trip and recording; the public frame's two screens with no session record and no header; the end-to-end suite's additions in `control-plane` R81.

## 5. Gaps found

1. **Acts `SESSION_OPS.member` does not hold.** `statementack`, `reviewcomment` (`classes: null`, reached by a session or a grant's secret), `publishpreflight` and `publishtensions` are in neither session set, so `interface-shell` R12 draws none of them. Placing them in `SESSION_OPS.member` and `.admin` (specs unchanged) is an `op-declarations` change BOB rules (it also changes `ACT_GATE`'s `mode` for them in `op=affordances` and `op=queue`).
2. **Signing in the browser.** `caseratify`, `publishat` and `docketpost` need the member's signature with her browser-held key; the signing page (`/sign`, `signatures` R31) makes it, and the shell has no hand-over. BOB's (technical): (a) the ceremony opens `/sign` with the statement in a new browsing context and the member pastes the signature back (works today); (b) an in-shell signer over the same key (a new `interface-shell` service, larger).
3. **The signer's tie confirmation.** The registry labels `publish` "with your confirmation of no undeclared tie"; no requirement takes that confirmation.
4. **`help`** ("How spot-checks work") is a registry screen with no act and no module.
5. **Places and offices, and recovery codes,** have no working-frame registry screen; they stay on the setup page (`interface-shell` R28).
6. **The People place** has no registry screen of its own (R29 opens Find over people: Bob's Q2).
7. **The public case page** (`published`) is also `legacy-ui`'s today (K633): Bob's Q3.

## 6. Open points

### For Bob (UX; P17)
- **Q1 · How a new member meets the welcome wizard.** A: offered at the top of Home until she finishes it or stops it on that device (recommended; never forced, nothing recorded about her). B: started by itself at her first sign-in. C: only from Settings › Wizards and the front door.
- **Q2 · What the People place opens.** A: Find, limited to the people and organisations the record follows, each opening its person page (recommended; no new screen). B: the design stream draws a People list first, and People says "comes later" until then.
- **Q3 · Where readers see a published case.** A: the new page at `/app/published/<case>` beside `legacy-ui`'s until you decide `legacy-ui`'s future at T47's close (recommended). B: the new page replaces `legacy-ui`'s public case page now. C: no new public page in T47.

### For BOB (technical)
- §5 items 1 and 2 at T47-63's START; whether `screens-inquiry` reuses `screens-settings`' AI account panel by import (an edge, recommended) or by copy.
