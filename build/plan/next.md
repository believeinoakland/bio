# Plan: next (T34)

**Status** · Entries for the tranche after T33, written as T33 runs (P18). Started at T33's opening by BOB #114, 2026-10-05.

## Entries

- N549 · `docprofile` · delete its seven copied doctypes and their default registration once `plane` registers `doctypes`' types (T33-90 merged), re-pointing its own tests to the seam's stubs (K1513). **Hard reason it is not in T33:** the order: plane (L11) registers after docprofile's one T33 job (L1), P4, P8.

- N550 · `queue`, `queue-producers`, and each module that shows a K1473 signal or a K1491 machine check to a member · DEC-131 (UX-DESIGN U48; K1536): queue R48 `QUEUE_CLASS_LABELS` CONDITION "Signal" becomes "Status"; queue-producers R24's member-facing word "signal" becomes "status"; the "Hint" label (K1473 signals, "Hint · machine work" on K1491's items) wherever they reach a member; codes and the canon's word "signal" unchanged. **Hard reason it is not in T33:** DEC-131 is not on `main` until PR #11 merges at T33's close (§13.1 item 5: a DEC is folded once it is on `main`).

- N551 · the module that holds the group's own settings (BOB names it at T34's opening), `publication`, the welcome and first-question wizards, `bias` · DEC-132 (UX-DESIGN U51; K1541): the group's optional self-description (kinds from a closed list plus "other", focus, purpose, visibility members or public, change history, an administrator's act); shown on the public page and directory only when chosen, behind the outward-act warning; orders what the wizards offer first; offered as the declared bias's starting draft. **Hard reason it is not in T33:** DEC-132 is not on `main` until PR #11 merges at T33's close (§13.1 item 5).
- N552 · `membership` (invitations), `admission`, `control-plane` · DEC-133 (UX-DESIGN U52; K1541): the website key (create, scope, daily cap, revoke; the call returning a one-time invitation for a cover name and optional approver name; recorded "through the website"); invitation expiry (seven days by default) and withdrawal of an unused one; the optional reusable join link (enable, replace, switch off; the join page asks the cover name; recorded "through the join link"); ordinary members only, with the capabilities the administrator chose; the one-time warning. **Hard reason it is not in T33:** DEC-133 is not on `main` until PR #11 merges at T33's close.

- N553 · `promotion` · stamp record-core's 9 new check rows (C-102.21–C-102.25, C-132.1–C-132.4; K1542, K1545) so `test/system/row-census.test.mjs` is green again. **Hard reason it is not in T33:** promotion has no T33 job and its layer (2) is open now; a later entry in this layer would be a second job for a module with no entries (P8, P10).

- N554 · `record-core`, `case-carriage`, `corpus-export` · give `TABLE_DECLARED` and `TABLE_NAME_INVALID` their check rows (DEC-49; K1545): record-core adds `code`, `check`, `translation`, `detail` to the two refusals; case-carriage R6's and corpus-export R4's tests, which `deepEqual` the old refusal shape, follow; then promotion stamps the two rows. **Hard reason it is not in T33:** record-core's one T33 job is merged and its layer closing (P8, P10); the three change together.

- N555 · `credentials` · K1547 (Bob): R22's subscription arm, held by K1537, is built: `kind: "subscription"` holds the member's own subscription token (`claude setup-token`), sealed at rest under that member (R23, R29), never shown or exported, used only for that member's own asks, runs and standing questions; `ACCOUNT_KINDS` becomes `["apikey", "subscription"]`; the refusal `ACCOUNT_KIND_NOT_OFFERED` is retired. Then agent-model, ai-runs and agent-worker read either kind through `accountReferenceFor`. **Hard reason it is not in T33:** credentials' one T33 job is merged and layer 2 is closed (P8, P10).
- N556 · `membership`, `instance-setup` · DEC-134 (UX-DESIGN U53; K1547): `ADMINS_FIRST` removed (R12), so R13 invites an ordinary member while one administrator exists; resignation refused only for the last administrator (R10); the hosting-access record asked at setup (R11, with instance-setup); setup's one-time recommendation of a second administrator and its statement of dependence. **Hard reason:** DEC-134 is not on `main` until PR #11 merges at T33's close; membership's T33 job is merged.
- N557 · `tasks`, `membership`, the check record's module (BOB names it at T34's opening) · DEC-135 (UX-DESIGN U54; K1547): "Ask for a check" by expertise label (and an optional note); a task kind addressed by expertise and sight, taken by the first who accepts, the others' To do closed naming who took it; the check carries the checker's declared expertise and whether an administrator confirmed it; the owner reads an untaken request; it gates nothing. **Hard reason:** DEC-135 is not on `main` until PR #11 merges.

Otherwise none yet. T33's release at its close (K1501) runs the deployment-gated measurements; the work they unlock is written here then.

## Carried from T33

The left-out table of `current.md` (T33), unchanged until re-read at T34's opening.
