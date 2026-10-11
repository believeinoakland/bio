# actions (T45)

**Status** · session_01WosqkVPWcWM1u4LjrLwHUN · depth 2 · WAITING ON BOB (J3) · handled B7

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
