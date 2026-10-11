# actions (T45)

**Status** · session_01WosqkVPWcWM1u4LjrLwHUN · depth 2 · COMPLETE · handled B10

## J1 · QUESTION

Open points from the reading (my reading is given for each; I am building on it now and will bring the work in line with your answer). None of conformance's, consequences' or action-grammar's T45 code exists on any branch yet; I build against their folded requirements and reach the new names through namespace imports, so nothing fails at load before they merge.

1. **R8 order (a) vs (b).** Under conformance R33 a void determination's outcomes all read `undetermined`, so asking (a) first would answer a void noncompliant determination `DETERMINATION_NOT_NONCOMPLIANT`. Reading: per leg, superseded → void → not noncompliant; the act passes on any leg live, not void, with a `noncompliant` outcome; else the first of `DETERMINATION_SUPERSEDED`, `DETERMINATION_VOID` (through `conformance.determinationVoided`), `DETERMINATION_NOT_NONCOMPLIANT`, `ACTION_NO_DETERMINATION` found in that order.

2. **Row `where`s for codes this module mints** (for ACTION-GRAMMAR's C-117.30+ rows; grammar-found codes keep the grammar's own region, seeksFindings' precedent). Proposed, all `src/actions/index.mjs`:
   - `DETERMINATION_NOT_NONCOMPLIANT` `#breachRefusal > is-breach-not-noncompliant`
   - `OVERRIDE_NO_GROUND`, `OVERRIDE_GROUND_REFUSED` `#overrideAndAddressee > is-override-ground` (minted from R15's finding, with `grounds` and `quick_route`)
   - `MACHINE_CANNOT_SET_PARTNERS` `#t45Fields > is-machine-set-partners`; `MACHINE_CANNOT_SET_PRESS_TERMS` `#t45Fields > is-machine-set-press-terms`; `MACHINE_CANNOT_SET_REPLY_OWED` `#t45Fields > is-machine-set-reply-owed`
   - `PARTNERS_REFUSED` where an `entity_id` names no organisation (`entities`): `#t45Fields > is-partners-entity` (the shape arm stays the grammar's)
   - `FOLLOWS_ACTION_REWRITTEN` `#t45Fields > is-follows-action-rewritten`
   - `RECEIPT_NOT_ON_SENT` `actionReceipt > is-receipt-on-sent`
   - `NO_REPLY_OWED` `actionCorrespond > is-no-reply-owed`; `STAGE_NOT_IN_LAW` `actionCorrespond > is-stage-in-law`
   - `MACHINE_CANNOT_SET_SCOPE`, `SCOPE_NO_REASON`, `SCOPE_UNCHANGED` `actionScope > is-scope`
   - `MACHINE_CANNOT_RECORD_PROMISE`, `PROMISE_REFUSED` `actionPromise > is-promise`
   Please pass these to ACTION-GRAMMAR, or tell me its names and I use them.

3. **R33's machine fence for `copied`** names no code (partners, press terms and `reply_owed` have one). Reading: a new row `MACHINE_CANNOT_SET_COPIED` (`#t45Fields > is-machine-set-copied`). `speaker` uses `MACHINE_CANNOT_SET_CONTACT` as R94 says (at the write, when a machine's revision changes an entry's speaker; at the act `MACHINE_CANNOT_CORRESPOND` comes first).

4. **C-117.19's translation** ("a premise override carries one thing, the reason") is untrue of `{ground, reason}`. Reading: the row is the grammar's to re-word; `PREMISE_OVERRIDE_REFUSED` stays the reason's refusal, the ground's are R15's codes.

5. **Success record ids (R8 (e), R93).** No id prefix or object type for a success record is named anywhere, and consequences' factory is `consequencesModule`. Reading: a `rests_on` target that is not a held bundle is asked of `consequences.successRecordRead({id, viewer})`; found → a success leg; else `ACTION_BASIS_REFUSED` as for any unheld target. This also needs action-grammar's basis grammar (R6) to accept the target's prefix: which prefix will it be?

6. **consequences R19's signature.** Written `registerOwnActReader(fn)` (one argument) though it cites `listenerRefusal`, which needs a module. Reading: I call `registerOwnActReader("actions", fn)` if it takes two, else `(fn)`; the reader answers an array of the ids given, synchronously.

7. **R85: which records law is "its `law`".** `fm.law` is a citation string; profile entries carry `name` and `citation`. Reading: the entry whose `citation` equals it, else whose `name` equals it; none → `undetermined`.

8. **R75 disclosures** are read as the viewer reads each determination (an unseen held or accepted finding is withheld whole, conformance R24); an accepted source edition is distinct by (group, case, edition).

9. **R66 under `audience: "public"`.** Reading: the group's outward acts are its `sent` entries and its moves after the first `sent`; `received` and `no_response` entries are left out.

10. **Deleting the moved code breaks more than rule 4 (6) names.** The plane's `purgeHeld` (store.mjs:554, every purge in `bio` then refused, fail closed) and queue-producers' `holdsDue`/`holdsReleased` (index.mjs:2124, 2179: a TypeError, no try) call `actions` directly. Reading: I delete as B1 says when you announce action-holds' merge; these callers' re-pointing is theirs (plane T45-47, queue-producers/action-producers L11) and I report them; please extend the accepted reds, or tell me to keep `purgeHeld`, `holdsDue` and `holdsReleased` until then.

11. **The view (R10).** `local-facts.governingView()` answers a non-null empty view with no profile active, where `#view()` answers null. Reading: kinds, counterparties, venues, records laws and statuses read `governingView`; `place()` and `zoneOf` (R68, explicitly combine's) keep combine's view and null.

## J2 · QUESTION

Adds to J1 (it replaces nothing there); it touches ACTION-GRAMMAR's R22, which is being built now.

**R22's entry objects cannot be written in the record's bytes.** `office_status: {words, status?}` and `found_elsewhere: {kind, note?}` are maps inside a correspondence list item. The restricted front-matter parser (record-grammar R6–R11) reads neither form: a nested block map inside a list item is mis-read (its keys escape to the top level of the document, silently), and an inline `{…}` map is read as a string. Verified on the tranche's `parseFrontmatter`.

Reading (the quote's precedent, `quote_amount` … `quote_revises`, flat keys on the entry): the bytes hold flat tokens and text on the entry, `office_words: "…"` (1–500, R22's text rule), `office_status: <token>`, `found_elsewhere: <kind token>`, `found_elsewhere_note: "…"`; `speaker: <member id>` is already flat. The act (`actionCorrespond`'s `officeStatus: {words, status?}`, `foundElsewhere: {kind, note?}`) and the read (R25) present them as the objects R22 and R81/R83 name. `entryFieldFindings` reads the flat keys. Please confirm to ACTION-GRAMMAR before it codes R22, or give me its key names.

Same for the action-level fields. `press_terms: {…}` (a top-level map) and `copied:`/`partners:` (lists of flat maps) parse. **`premise_override: {ground: {kind, …}, reason}` does not**: verified, `ground` reads as an empty string and its keys are dropped. Reading: the bytes hold `premise_override:` with flat keys `reason`, `ground_kind`, `ground_citation`, `ground_date` (legal_deadline) or `ground_what`, `ground_when` (irreversible_act); `Actions.overrideOf` and the read present `{ground: {kind, citation, date} | {kind, what, when}, reason}`, and `overrideGroundFindings` is handed that presented object (R15's signature unchanged). A pre-T45 override (`reason` alone) reads `ground: null`.

## J3 · QUESTION

Adds to J2 (same cause): R9's press `holder: {name}` (action-grammar R8) is a map inside the top-level `counterparty` map, and the parser reads it as an empty string, dropping `name` (verified). Reading: the bytes hold `holder: "<name>"` (1–200 characters, R8's text rule) on the press arm; the read and `actionsFor` present `holder: {name}`. `counterpartyFindings` reads that string. Please pass to ACTION-GRAMMAR with J2.

## Completion (ACTIONS #16)

**Reading.** Read whole: `roles/JOB.md`; `build/requirements/actions.md`; the plan's T45 entry, rules at the opening and reconciliation R1–R21; `draft-T45-l9a.md` "actions"; K2780, K2781, K2787; `BIO_Action_v0_2.md`; this module's code and tests (P20). The used modules' public parts (over the 600 KB limit) were read whole by two helpers in this session, who wrote digests citing each section (action-grammar; conformance, consequences, standards, project-roster, local-facts, jurisdictions, events, membership, entities, action-holds, duties, intent); the sources stayed binding and were checked at each merge.

**Entries applied (T45-27).** R8 amended (a) live *noncompliant*, `DETERMINATION_NOT_NONCOMPLIANT`; (b) void through `conformance.determinationVoided`, per leg superseded → void → not noncompliant (J1 1, K2849); (c) `{ground, reason}`; (d) an override plus a later determination, both read (`breach_rests_on`); (e) `rests_on` a `SUC-` success record through `consequences.successRecordRead`. R9 (press `holder` as text, read and `actionsFor` only; venue `delivery_point`). R10 (`local-facts.governingView`; `place()`/`zoneOf` stay combine's). R33, R36 (tables `action_receipts`, `action_scopes`, `action_promises`, `action_field_history`). R66 (confidential, counsel matter, never sent, moves before the first sending; `audience: "public"` sent entries and later moves, `public: true`). R74–R83, R85–R88, R92–R95, R97 as worded with K2845, K2848–K2850 and the flat byte keys of K2849. The moved code (R48, R52, R54–R60, R69) deleted with its tables, ops, registrations (doorbell, ratification) and tests (t20, t22, t27; t34's R69; t41's holds); a `pressure` key stated at `actionCorrespond` stays on the entry, flat (`pressure_kind`, `pressure_note`; action-holds R1).

**Deferred / readings recorded.** New acts answer a few generic, uncatalogued codes as the existing acts do (`BAD_SCOPE`, `BAD_HOW`, `BAD_PARTY`, `BAD_ACCOUNT`, `BAD_SHA`). `REPLY_OWED_REFUSED` is also minted here for a missing `reply_owed_reason` (region `is-reply-owed-reason`), and region `is-entry-writable` mints R22's `SPEAKER_REFUSED`/`OFFICE_STATUS_WITHOUT_OUTCOME`/`FOUND_ELSEWHERE_REFUSED` for text the bytes cannot hold (a quote or backslash), since R22's rule lets them through (reported).

**Found in other modules (REPORT).**
1. action-grammar: C-117.17, .18, .20, .21, .23–.25 still name `src/actions/index.mjs` regions that moved to action-holds (re-point); R22's text rule should refuse a quote or backslash in `office_words` and `found_elsewhere_note` (then `is-entry-writable` goes); `REPLY_OWED_REFUSED` has a second site here for the reason.
2. action-holds vs its R1: its `pressure.test.mjs` R1 expects a mark stated at `actions.actionCorrespond` to land in its `action_pressure` table, never in the bytes; its R1 says the key "stays on the entry and is read here through `actionRead`", which this job built. Its readers do not read the entry key. Needs BOB's call. Its `readers.test.mjs` "R4 R10 the copy window" is red now that the copy window has ended (expected).
3. Ground-less overrides (R74) in other modules' tests: action-plans `start.test` R18, `preview.test` R37; escalation `real.test` R23; filings `premise.test` R8, `chronology.test` R33 (their T45 jobs).
4. Op maps: new ops `actionreceipt`, `actionscope`, `actionpromise`, `openitemswith`; hold ops removed: affordances `catalogue.test` (actionhold, actionholdrelease), `backing.test` R19 ×2; control-plane `r48-routes.test` R47/R48; op-declarations, op-grades, plane composition (T45-45, T45-38, T45-39, T45-47).
5. Accepted red by name (rule 4 (6), K2849): queue-producers' `holdsDue`/`holdsReleased` (plane `compose.test` R11, `docket.test` R15, `door.test` R2/R5, `watch.test` R20, `t33.test` R21, `worker.test` R6) and the plane's `purgeHeld`.
6. modules.json: `doorbell` and `ratification` can leave actions' uses (no import remains); `docket`, `publication` are not needed.
7. actionsOf with `env` now reaches consequences, standards (R97), local-facts, project-roster on the host at start: the same one-per-host instances the plane builds.

**Tests and checks.** `node --test bio-plane/test/m/actions/*.test.mjs`: 110 pass, 0 fail. action-clocks 55 pass. Full `test/m/**` against `tranche/T45`: 18 new reds, all listed above (none in this module); 5 gone. `checks/format.mjs`: 0 failures; `architecture.mjs bio actions`: 0 failures; `coverage.mjs bio actions`: 70 of 70 ids named, 0 failures; `ownership.mjs bio actions tranche/T45`: 0 failures. The plane bundle is staled (rule 4 (5)).

Size (session_01WosqkVPWcWM1u4LjrLwHUN): test runs 30, module lines 3967
