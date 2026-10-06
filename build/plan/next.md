# Plan: next (T34)

**Status** · Entries for the tranche after T33, written as T33 runs (P18). Started at T33's opening by BOB #114, 2026-10-05.

## Entries

- N549 · `docprofile` · delete its seven copied doctypes and their default registration once `plane` registers `doctypes`' types (T33-90 merged), re-pointing its own tests to the seam's stubs (K1513). **Hard reason it is not in T33:** the order: plane (L11) registers after docprofile's one T33 job (L1), P4, P8.

- N550 · `queue`, `queue-producers`, and each module that shows a K1473 signal or a K1491 machine check to a member · DEC-131 (UX-DESIGN U48; K1536): queue R48 `QUEUE_CLASS_LABELS` CONDITION "Signal" becomes "Status"; queue-producers R24's member-facing word "signal" becomes "status"; the "Hint" label (K1473 signals, "Hint · machine work" on K1491's items) wherever they reach a member; codes and the canon's word "signal" unchanged. **Hard reason it is not in T33:** DEC-131 is not on `main` until PR #11 merges at T33's close (§13.1 item 5: a DEC is folded once it is on `main`).

- N551 · the module that holds the group's own settings (BOB names it at T34's opening), `publication`, the welcome and first-question wizards, `bias` · DEC-132 (UX-DESIGN U51; K1541): the group's optional self-description (kinds from a closed list plus "other", focus, purpose, visibility members or public, change history, an administrator's act); shown on the public page and directory only when chosen, behind the outward-act warning; orders what the wizards offer first; offered as the declared bias's starting draft. **Hard reason it is not in T33:** DEC-132 is not on `main` until PR #11 merges at T33's close (§13.1 item 5).
- N552 · `membership` (invitations), `admission`, `control-plane` · DEC-133 (UX-DESIGN U52; K1541): the website key (create, scope, daily cap, revoke; the call returning a one-time invitation for a cover name and optional approver name; recorded "through the website"); invitation expiry (seven days by default) and withdrawal of an unused one; the optional reusable join link (enable, replace, switch off; the join page asks the cover name; recorded "through the join link"); ordinary members only, with the capabilities the administrator chose; the one-time warning. **Hard reason it is not in T33:** DEC-133 is not on `main` until PR #11 merges at T33's close.

- N553 · `promotion` · stamp record-core's 9 new check rows (C-102.21–C-102.25, C-132.1–C-132.4; K1542, K1545) so `test/system/row-census.test.mjs` is green again. **Hard reason it is not in T33:** promotion has no T33 job and its layer (2) is open now; a later entry in this layer would be a second job for a module with no entries (P8, P10).

- N554 · `record-core`, `case-carriage`, `corpus-export` · give `TABLE_DECLARED` and `TABLE_NAME_INVALID` their check rows (DEC-49; K1545): record-core adds `code`, `check`, `translation`, `detail` to the two refusals; case-carriage R6's and corpus-export R4's tests, which `deepEqual` the old refusal shape, follow; then promotion stamps the two rows. **Hard reason it is not in T33:** record-core's one T33 job is merged and its layer closing (P8, P10); the three change together.

- N556 · `membership`, `instance-setup` · DEC-134 (UX-DESIGN U53; K1547): `ADMINS_FIRST` removed (R12), so R13 invites an ordinary member while one administrator exists; resignation refused only for the last administrator (R10); the hosting-access record asked at setup (R11, with instance-setup); setup's one-time recommendation of a second administrator and its statement of dependence. **Hard reason:** DEC-134 is not on `main` until PR #11 merges at T33's close; membership's T33 job is merged.
- N557 · `tasks`, `membership`, the check record's module (BOB names it at T34's opening) · DEC-135 (UX-DESIGN U54; K1547): "Ask for a check" by expertise label (and an optional note); a task kind addressed by expertise and sight, taken by the first who accepts, the others' To do closed naming who took it; the check carries the checker's declared expertise and whether an administrator confirmed it; the owner reads an untaken request; it gates nothing. **Hard reason:** DEC-135 is not on `main` until PR #11 merges.

- N558 · the group's settings module, `membership` (joining), the module that holds members' own notes (BOB names it at T34's opening), the list of terms · DEC-136 (UX-DESIGN U56; K1554): the administrator's setting "tell our members what a court can reach" (chosen at setup or in settings, nothing preselected) and the first-time statements it drives (once at joining, once at the first non-public act of each kind); a member's own notes, member-private, never cited, published, counted or shared, convertible by the member's act to an observation, hunch or question; the explanation of protection in the list of terms. **Hard reason it is not in T33:** DEC-136 is not on `main` until PR #11 merges at T33's close.

- N559 · the UI's module that serves the member screens (BOB names it and the placement when those screens are built) · DEC-138 (UX-DESIGN U58; K1559): `visual-language/civicsmith.css`, `faces.css`, `fonts/` (with their OFL licences) and `icons.svg` replace `civicos-ui/tokens.css` as the screens' one stylesheet, served from the group's copy, never from outside (principle 9.6); `check_contrast.py` runs whenever a colour changes. **Hard reason it is not in T33:** DEC-138 is not on `main` until PR #11 merges at T33's close, and the new member screens are not yet built (the UX stream's step 5).

- N560 · `connection-grammar` · R9's `ownerConformance` takes the owner's declaration that its kinds are undated (no `valid` stated, so `at` is inapplicable) or group-wide (no fenced item, so `sight` is inapplicable) and reports those checks `inapplicable` instead of failing; the `neighbours` contract states the optional `unread: [{what, why}]` an owner may add (explore R8). Owners' tests then assert `ok` whole. (ENTITIES #9 J1, CONNECTIONS #12 J1, EXPLORE #1 J1; K1563.) **Hard reason it is not in T33:** the order: connection-grammar (L1) is closed.

- N561 · `jurisdictions` · two profile vocabulary keys with validate and combine: `vote_values` (`[{value, label, citation}]`, events R11) and `response_statuses` (`[{status, label, citation, basis}]`, duties R1, R4); never a default list. (EVENTS #1 J1, DUTIES #1 J1; K1563.) **Hard reason:** the order: jurisdictions (L1) is closed.

- N562 · `local-facts`, `action-clocks` · R6 names a profile's named closure-list holiday entries (`list=<name>`), so members can confirm a court's judicial holidays; action-clocks' `factOf` per calendar entry uses it. (LOCAL-FACTS #3 J2 (6); K1563.) **Hard reason:** a requirement change for both modules; action-clocks (L9) reads it, and local-facts' T33 job is past its plan.

- N563 · `money-checks` · M-C8, the shipped detectors' measurement, on a gold set of payments. **Hard reason:** no gold set exists (K1506: no Oakland payment ledger); runs when one is captured.

- N564 · `wizard-scripts`, `op-declarations`, `answers` (BOB names the module that holds the screen registry at T34's opening) · DEC-139 (UX-DESIGN U59; K1565), folded once PR #11 is on `main`: the screen registry `docs/development/ux-substrate/screens/registry.json` registered (42 screens, 192 acts), its 69 requirement functions' ops declared by lowercased name; wizard-scripts R2 gains an optional `via` (a side trip into another wizard, returning to the step left); answers' standing question runs for a member with no account of their own, its matches arriving unread; the Civicsmith library as its data file only once Bob approves it (S2). **Hard reason it is not in T33:** DEC-139 is not on `main` until T33's close (§13.1 (5)), and the library waits on Bob.

- N565 · `civil-time` · cache `offsetAt`'s zone offsets (per zone, keyed by its transitions or the hour): `formatToParts` per call is most of an explore walk's time, every item judged twice (EXPLORE #1 J2 (1); K1566). **Hard reason:** the order: civil-time (L1) is closed.

- N566 · `connection-grammar`, `explore` · M-X1a's hub bound: a period walk over a council member with more than 1,000 votes in the window is cut at the hub (`LOOKED_INDETERMINATE`); a bound per kind or a narrower window is decided on real council volumes measured at T33's release (EXPLORE #1 J2 (2); K1566). **Hard reason:** a deployment measurement.

- N567 · `calc-grammar` · export `relate` (R10's comparison of two figures) from its index, so `duties` imports it there and not from `decimal.mjs` (DUTIES #1 J2 (1); K1569). **Hard reason:** the order: calc-grammar (L1) is closed.

- N568 · `record-grammar` · a `law_relation` subject in `PROPOSAL_STATES` (law relations, court links, treatments), so `standards`' `lawPropose` labels through it instead of the `standard` subject (STANDARDS #7 J2 (4); K1571). **Hard reason:** the order: record-grammar (L1) is closed.

- N569 · `id-spaces`, `jurisdictions` · a `body` id space, and the Oakland profile's Legistar `PersonId` and `BodyId` schemes (numeric forms), so events R22's Legistar following resolves rows in a deployed copy; today no profile holds either scheme and `SPACE_NAMES` has no `body` (EVENTS #1 J3 (2); K1574). **Hard reason:** the order: id-spaces and jurisdictions (L1) are closed.

Otherwise none yet. T33's release at its close (K1501) runs the deployment-gated measurements; the work they unlock is written here then.

## Carried from T33

The left-out table of `current.md` (T33), unchanged until re-read at T34's opening.
