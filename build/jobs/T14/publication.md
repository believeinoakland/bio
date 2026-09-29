# publication (T14)

**Status** · session_01DzEFa2jXcS7Vn9phBtGPyZ · depth 2 · WORKING · handled B2

## Completion

**Applied** (on `tranche/T14`, merged in at 96d557c7d3):
- **N339 with N349, R48** (K421, K444, K445). The four relays in `src/publication/worker.mjs` go through one helper, `relayUnanswered`: `publishedbytes`' `verify` read and its `publishedcasedoctext` read, `publishedcase`'s read, and the `publishedtargets` read inside the per-finding renderer.
  - A store refusal (`doAnswer`'s `refused`, below 500) is answered with the store's own status, code and sentence. It goes through the plane's `storeRefusal` when that is bound, else as `json(reply.body, reply.status)`, which is the same answer.
  - A reply that is no answer is `storeSilent(op, out.correlation)`.
  - The renderer's relay is now thrown as a local `Unanswered`, which carries the reply. The whole read still answers it.
  - The post-commit report in `assembleCaseContainer` (the `recordcasemanifest` exchange) is a report, not a relay, so it is unchanged. So is the answered-but-empty `!c` read, which has no correlation to carry.
  - The plane's `StoreSilent` is no longer thrown or caught here, so it left the required bindings. legacy-index still hands it, which is harmless.
- **What legacy-index must hand me at layer 11** (`src/index.mjs`:172, `bindPublishedPlane`). All four relays read the same bag, so one addition covers them: add `storeRefusal` (control-plane already exports it, `control-plane/index.mjs`:3510). `doAnswer` (with `refused` and `correlation`) and `storeSilent(op, correlation)` are already control-plane's and already bound. Until then each relay gives the same answer through the fallback.
  - `publishedbytes` → `verify`: `storeRefusal`
  - `publishedbytes` → `publishedcasedoctext`: `storeRefusal`
  - `publishedcase` → `publishedcase`: `storeRefusal`
  - `publishedcase` → `publishedtargets` (thrown): `storeRefusal`
- **N346, R44, R45, R47 and R49** (DEC-79; K448, K452, K469). `projectStage` now answers `stages`: the four stages in order, each `{stage, reached, earned, since, needs, why}`. `#stages` builds them from the same single evaluation that decides `stage`, through `#readHeld`, the one bounded read.
  - **R45's defect is fixed.** A failed question read now asks rule 2's ratified half first: a project owning a ratified case edition is `matured`, with that edition as `basis`. Only with none is it `undetermined` with `at_least`.
  - **A closed project still evaluates rules 2–3.** Its `questions` counts are filled, the computed stages are stated, and every `needs` is null with the closed sentence.
  - **`since` is read as follows** (K469):
    - `investigating`: the earliest leg `at` among the legs of the held questions read that have a leg.
    - `matured`: the instant of the evidence `earned` names, and only that. For a question, the `at` of its current conclusion (basis-versions R22 `conclusionOf`). For a case edition, its `ratified_at`.
    - `forming` and any skipped stage: null.
    - `closed`: the timestamp of the newest `state_history` entry with `to_state: closed`.
    - An instant the record does not hold is stated as null.
  - **`needs` and `why`.** `STAGE_NEEDS` holds the conditions `needs` may list, and `STAGE_SENTENCES` holds every fixed `why`, filled with counts only. An undetermined stage's `why` is the answer's `detail`.
  - **An unrecognised close.** `closed.recorded` holds the reason as written, cut to `CLOSED_RECORDED_MAX` (40), or null when absent.
  - **Reading on the undetermined case:** each stage above `at_least`, `closed` included, is `reached: null` with the detail as its `why`. `recorded` is still stated when the document records an unrecognised close.
  - Nothing is stored. The only reads added are `inquiry.basisFor` for each legged question read, `conclusionOf` for the earning question, and the earning edition's `ratified_at`. `inquiry` and `basis-versions` are both in publication's `uses`.

**Tests** (`bio-plane/test/m/publication/`)
- `relay.test.mjs` (new; R48). The plane is bound as control-plane R23 and R25 state it, and a stub store sits behind each of the four relays.
  - A 400 `BAD_JSON` refusal answers 400 with the store's body, both with `storeRefusal` bound and with it absent.
  - A 500 `{ok: false, error}` (a stack) answers 502 `STORE_DID_NOT_ANSWER` with no stack text and no `correlation` key.
  - A 500 `STORE_INTERNAL_ERROR` with an id answers 502 carrying that id. One without an id answers with no `correlation` key.
- `stage.test.mjs` (R49 with R44, R45 and R47): the twelve of `draft-T14-wordings-3.md`, plus K448 and K469.
  - One rule, asserted at every step of the walk.
  - No promise: each listed input added alone.
  - Uncounted inputs leave `stage` and `stages` byte-identical.
  - The investigating need.
  - A skipped stage.
  - The cap.
  - A failed question read, with and without a ratified edition.
  - Closed, under each of the three reasons, then reopened.
  - A close without a recognised reason: absent, `finished`, and a 60-character reason.
  - An unread document.
  - Fixed text: no handle, question text or place in any `why`.
  - Nothing written, closed and undetermined included.
  - Withdrawing the earning conclusion moves `since` with `earned`, or unreaches the stage. An earlier conclusion elsewhere never lends its instant.
  - The fixture's `inquiryMd` writes a leg's `date` when one is given.
- **Negative controls:** against the pre-change `worker.mjs`, `relay.test.mjs` fails 3 of 3. Against the pre-change `index.mjs`, `stage.test.mjs` fails. Both were restored.

**Please strike** (my work meets these marks):
- R44, R45, R47 and R49: `*(not yet met: N346)*`
- R48: `*(not yet met: N339, N349)*`
- In the Status line: "…N339 (with N349) R48; N346 R49 (`stages`, with `since`), R44, R45 (…), R47; not yet met".

**Check rows:** none added, moved or retired. `CATALOG_VERSION` does not move, and nothing is awaiting stamp.

**Deferred:** nothing.

**Found in other modules** (REPORT J3):
1. **Stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (not_product) bundles `src/publication/`. It is regenerated at the layer close.
2. **legacy-index (layer 11):** add `storeRefusal` to the `bindPublishedPlane` call (`src/index.mjs`:172), as above. It may also stop handing `StoreSilent`, which publication no longer reads.
3. **Grep:** there is no hit in `civicos-ui/` or affordances' lists for any name added (`stages`, `STAGE_NEEDS`, `STAGE_SENTENCES`, `CLOSED_RECORDED_MAX`, `relayUnanswered`) or for `projectstage`. The UI's `stages` hits are progressions' own.

**Tests and checks run**
- `node --test bio-plane/test/m/publication/`: tests 93, pass 91, fail 0, todo 2 (R30 and R32, the standing ones).
- Modules using publication, all 0 fail:
  - ratification: 70/70
  - case-authoring: 39/39
  - review: 30/30
  - conformance: 36/36
  - filings: 34/34
  - monitoring: 58 tests, 52 pass, 6 todo
  - affordances: 76/76
  - queue: 61 tests, 60 pass, 1 todo
  - control-plane: 45/45
- The old battery's suites naming these ops (`bounds`, `gate-reads`, `frontier-chunk`, `plane-envelope`): 4 pass, 0 fail.
- `build/manifest.md` names no layer tests.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture publication`: 18 product files, 60 relative imports; 0 failures.
- `coverage publication`: 49 of 49 live requirement ids named by a test; 0 failures.
- `ownership publication tranche/T14`: 0 failures. legacy-store, legacy-checks and legacy-index each have 0 lines added and 0 removed.
- **Ringing:** J1 rang BOB (trigger `trig_01P4jKCcxEJgtnSLKdvGSSAT`).

Size (session_01DzEFa2jXcS7Vn9phBtGPyZ): test runs 21, module lines 5708

## J1 · QUESTION

R49's `since`: where each instant is read. My best reading, which I am building now; nothing else waits on the answer.

1. `investigating.since`: the earliest recorded instant among the legs of the held questions read that have a leg (inquiry R16 `basisFor`, each leg's `at`, the leg's authored date as `inquiry_basis` projects it). A leg with no instant does not count; with none, `since` is null (R28: stated, never filled). The read is R45's bounded one, so it is "earliest among those read".
2. `matured.since`: the earliest of (a) the `at` of each held question read that the project has concluded (basis-versions R22 `conclusionOf`, the current conclusion, so a withdrawal moves it to the conclusion that earns the stage then) and (b) the earliest `published_cases.ratified_at` of the project's ratified case editions. `earned` still names R45's `basis` evidence (the first concluded question read, else the first ratified case edition by id), so `since` may come from the other half when it is earlier.
3. `forming`: reached whenever the stage is computed, `earned: null`, `since: null` (no evidence earns the ground stage; it is not "skipped").
4. `closed.since` ("the instant the close was recorded, as the store holds it", K452): the `timestamp` of the newest `state_history` entry with `to_state: closed` in the project's stored document; null when there is none or it is not an instant. The alternative is the `manifest.created` of the commit that first wrote the close, which needs a walk of the document's history; I did not take it.
5. Reached stages also carry a `why` (every entry has one): a fixed sentence with counts, e.g. "N held questions read have a leg in their basis."
