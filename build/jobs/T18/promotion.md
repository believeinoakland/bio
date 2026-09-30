# promotion (T18)

**Status** · session_01PiA7Pm8z9ZBEbegmLgjQAx · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

C-77 (K586 BOB-4): does promotion's write already enforce the rule, and is `checkProjectNameUniqueness` moved or retired?

Finding: yes, the write enforces it. `promote` (R19) and `forkProject` (R43) refuse NAME_TAKEN through `#nameTaken`, which pages every `project` bundle (`record.listByType`, no state filter, so deactivated projects count) and compares `projectNameKey(title)`. That is §7.1's three consequences in full: the key, every lifecycle state, project objects only. `checkProjectNameUniqueness(corpus)` (catalogue 3796, C-77.1 error per colliding pair, C-77.2 warning per bundle it cannot judge) is a corpus-level check with no product caller. Its one test importer, `d50-project-names.test.mjs`, is gone from the tree. Its C-77.1/.2 ids are findings, not table rows, so ROW_CENSUS does not count them.

My best reading, which I am building now: move it, not retire it. `projectNameKey` and `checkProjectNameUniqueness` move whole to `src/promotion/names.mjs` and are re-exported from `promotion/index.mjs` (✱: the catalogue's copy is deleted). R38 already covers them ("a rule enforced both at this module's doors and in the catalogue is one catalogue function run at both"), so they are tested under R38 and R19: the door and the corpus check share one key function, with C-77.1/.2's full contract. `Store.projectNameKey` (store.mjs 2567) has no reader left, so it goes with its import (a pure removal, §12.2). No requirement text changes unless you want one. If you rule retire (K6), I delete `names.mjs`'s check and keep `projectNameKey` for R19.

## J2 · REPORT

Progress, then proposals and findings for you. Done and pushed (95a9bd98d4, then the converts): the ✱ moves C-86 `PROMOTED_TYPE_CHECKS` and C-97 `PROJECT_CREATION_VISIBILITY_CHECKS` (into `src/promotion/checks.mjs`), `withProducingGroup` (`text.mjs`), and `projectNameKey` with `checkProjectNameUniqueness` (`names.mjs`, on J1's best reading). The catalogue's copies are deleted (202 lines). `MECHANICAL_FIELD_SETS` is copied, frozen, into `history.mjs`; the catalogue keeps its copy for monitoring's tests. `store.mjs` loses only unused imports and `Store.projectNameKey` (15 lines removed, 0 added). All four checks pass. Module tests: 84 pass, 1 fail. The one failure is R39/R45/R46's `MODULE_ORDER` test, red on the tranche base too, which membership's N415 turns green.

Proposed requirement wordings (converts):
1. d470 (R34): add "`GATE_VERSION` is exactly `plane-gate/1.0 (bio-checks <CATALOG_VERSION>)`." It is tested under R34 in `converts.test.mjs`.
2. inquiry (R9): promotion's code sets the title. `promote` records an inquiry's title as `deriveInquiryTitle` of its `## Question`, else the document's `title`, even over a differing document title. I propose adding to R9: "An inquiry's recorded title is the one its `## Question` derives; with none, the document's `title`." Tested under R9.
3. Uses (promotion.md:119) needs re-wording: C-86, C-97, `withProducingGroup`, `projectNameKey` and C-77 are now this module's own, and `MECHANICAL_FIELD_SETS` is this module's, with the catalogue's copy held until T19.

Converts, promotion's shares (`converts.test.mjs`, plus one write-path arm): d470 (R34), d526 (R39: ENVELOPE_TYPE_DISAGREES before every registered fence; R19: the creator owns the project, NAME_TAKEN with or without an envelope type), project-disclosure (R19: NAME_TAKEN byte-identical whether the colliding project is visible or hidden, and the fork's answer identical too), project-mint (R19/R38: PROJECT_ID_SUPPLIED and PROJECT_ID_IN_BYTES identical for a held and a never-minted id; C-59.2/C-59.4; a nested or body `id:` is not an id), rec-181 (R16 at the module and end to end through the Store: cite, then citedBy, then CITED with `to: retired`), inquiry (R9), subresources (R30: C-20.1 admits `data/snapshot-manifest.json`), ratify-envelope (R27: a dangling reference is C-6.2 at the gate). None of the eight was left undone.

Found in other modules:
- ratification (layer 8): `src/ratification/ops.mjs:16,423` calls the module-level `runGate` from `gate.mjs`. When the gate seam lands, only promotion's instance can pass `record.grammars()`, so the ratification gate should call `promotionOf(host).runGate(...)`. Until it does, a registered grammar (capture's C-2.7, layer 3) reaches the promote gate but not the ratify gate. The catalogue's built-in C-2.7 still runs there, so no check is lost this tranche.
- Generated artifacts (§14): `bio-checks.mjs` changed, which stales the agent-worker bundle (its input) and the plane bundle. Yours to regenerate at the close.
- legacy-tests / legacy-ui (not run per tranche, K619): these import names now gone from the catalogue and will fail to load until deleted or re-pointed at the release: `bio-plane/test/inquiry.test.mjs` and `test/system/conformance.test.mjs` (`withProducingGroup`); `civicos-ui/test/project-visibility-surface.test.mjs` (`PROJECT_CREATION_VISIBILITY_CHECKS`); `project-id-surface.test.mjs` and `add-surface.test.mjs` (`withProducingGroup`). The same goes for monitoring's two tests on `MECHANICAL_FIELD_SETS` once T19 deletes the catalogue's copy (the layer-10 re-point is planned).

Next: waiting for your CHANGE that record-core has merged (the gate's `record.grammars()`), then for record-core and membership both merged, for the stamp.
