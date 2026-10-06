# strength (T33)

**Status** · session_013Dwo1L1oxme2GUvmjX5QwC · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings for T33-47; I carry on with each unless you answer otherwise. Only (5) needs a choice outside this module.

(1) R12, a document's issuer. No module records "issued by". Reading: a document's issuers are the entities of kind office or body that take part, in any role but `subject`, in an `issuance` or `publication` event one of its captures attests (events R37: `event_attestations`, `event_participants`). "Same issuing source" is one such entity, or two whose `part_of` lines (lines R10, `structureAt`) reach one body at the documents' dates.

(2) R12, dates. A document's dates are the `when` of the events its captures attest. A `part_of` or `acts_for` line judged `undetermined` at either document's date, or a document with no date, makes that tie `undetermined`, which is named in `shared` and never counted as independence. The same holds for a `within` relation whose event has no `when`.

(3) R12, shared person. The persons (entity kind person) taking part in an event a capture attests, in any role (author, signatory and the participant roles), are folded to their identity cluster (`people.identityOf`). An `undetermined` cluster joins only the same entity.

(4) R12, shape. `independence` keeps `{checked, parts, shared, complete, limit}` and each shared entry keeps `{a, b, through}`. The new origins are strings like the old ones: `issuer:<ENT>`, `person:<ENT>`, `event:<EVT>`, `table:<sha>`, and for a pairwise tie `acts_for:<LIN>` or `within:<EVT>`. Each names its line, event or table in words after a space ("issuer:ENT-… part_of LIN-…"). An undetermined tie is spelled `undetermined:<origin>`. R30 and R34's corroboration keep R12's first three origins (same document, capture, address), as R30 states.

(5) R36, a cross-module flaw. `calculations.read` is `async`, but strength's walk is synchronous and is called synchronously by inquiry's grouping act (R17), case-checker and the others. I code against an injected `calculations.gradeFactsOf({calcId, viewer})` that answers calculations R9's grade facts (`{found, accepted, capture: {grade, why}, inputs, method}`) synchronously. Until calculations offers it, the default adapter answers the leg `undetermined` ("its grade facts cannot be read here"). I will REPORT this to you. Your choice: a sync `gradeFactsOf` from the calculations job (N-entry), or a read contract on `calculations` and `calc_inputs` that I read in SQL.

(6) R38. The trigger date's attestation grade is the grade of the governing attestation of the triggering event (`events.readEvent`), and the source text's grade is the capture ceiling `leg-earning` R8/R9 earns. The occurrence is read through `duties.occurrencesOf` (one-day window at the trigger, `asOf` = the read's day), keyed by inquiry-grammar R15's `occurrence:<DUT>/<key>`. I code the spelling to that requirement until inquiry-grammar merges, then re-point to its `parseOccurrenceRef`.

(7) R37. A standard's undetermined ceiling (STANDARD_NO_TEXT) makes the leg `undetermined`, named with why. This is unlike a document leg, which is inert.

(8) R31. GRADING_METHOD_VERSION becomes `bio-grading/2` with its own words. `bio-grading/1` still answers byte for byte and `recomputePair` answers both. A case file states a calculation, standard or occurrence leg as kind `calculation` / `standard` / `occurrence`, with its resolved capture `grade` or an `undetermined` reason.

(9) R39. `strength_cache` is declared derived-rebuildable (key bundle_id, sight bundle, rebuild = R13 over the inquiries in scope). writeProjection goes through `rebuildDerived`, and `cachedOf` through `readDerived`. A promotion marks stale the cached rows of the inquiries resting on the promoted bundle, up to the depth bound. `group_strength_bar` is exempt, sight group. The rest takes declarePurge's defaults.
