# Plan: tranche T5

**Status** · OPEN. Opened by BOB #45, 2026-09-27 ~05:40 UTC (PROCESS-MECHANICS §5), from the plan BOB #43 prepared (P18) and BOB #44's handoff; every module's requirements approved by Bob (layer 2 on 2026-09-26, layers 4 and 5 by K102). One tranche, not split by layer (K126). Branch `tranche/T5` starts at the commit that opened this plan. Bob's meter at the opening: not given (asked). BOB's session: `session_01XMEw4Evvi4UHjyRFmaUvvr`

Four layers, lowest first (P10): layer 2 (record-core, membership, promotion), layer 4, layer 5, layer 11. Each extraction is done by its target module's job (mechanics §12.2), from the legacy modules its `from` names, per its map (`build/extraction/<module>.md`) and its requirements. Every job writes requirement-named tests for every live id at its interface (P7), applies every carried row its requirements mark *not yet met*, and judges built work on the snapshot against its requirements (§12.5). A layer's jobs run concurrently; a user builds against its provider's Provides, and BOB merges a provider early once its Provides are final (mechanics §4), sending its users a CHANGE.

## Layer 2

**record-core**
- N40 · R56–R58: `digestCensus`, `snapKeyCensus` (`op=digestcensus`, `op=snapkeycensus`, from `store.mjs` ~34223–34300), and the shared digest and size computation (`fileDigestOf`, the empty-string marker).
- N51 · `auditPass` offers a registration for later modules' audit checks (the K31 pattern).
- N58 · R47–R48: `stampInstant` and `instantOrder`.
- N64 · its share: `PER_ITEM_MAX` and `perItem` (R49–R55, C-75), `manifestByAuthor`, R37's widened read contract.
- N66 · its share: `isFirstBoot`.
- N74 · mark the `is-allocid-prefix-gated` region in `allocIdOp`.
- N83 · R37's read contract gains the `files`, `history` and `bundles` columns provenance reads.

**membership**
- N73 · `#ownRefusal` builds R29 and R62 from `AI_CREDENTIAL_CHECKS` (C-29.11, C-29.12); mark its three DEC-49 regions; `PROJECT_SEEN_NOT_A_PARTICIPANT` minted once here (R77).
- N76 · `existenceAct` in Provides (R77, K127), met and tested at the interface.
- N85 · `memberpairings` answers each viewer only the pairings R19 lets it see (K124), tested at the interface.
- N64 · its share: `rescueRefusal` and `positionalMember` (R75–R76) in Provides, met and tested.

**promotion**
- N56 · `fact(name, ...args)` of facts registered with it (R40); D-592 (`reopen`).
- R58 · drop its own `fileDigestOf`, `inlineBytesOf` and `EMPTY_STRING_SHA` for record-core's (a user of record-core's CHANGE).
- N73 · its share: call membership's `existenceAct` (R77) instead of its copy (after membership's CHANGE).
- N86 · `CATALOG_VERSION` 1.34.0 (R34); `d470` A3/A9 re-pinned after it.
- N63 · its share: the post-commit notice beside R39's in-transaction projections, as its requirements state.

## Layer 4 (order: `calibration`, `extraction`, `content`)

- **calibration** · T5-1 · Extract per map and requirements (K73, K74); D-587, D-668.
- **extraction** · T5-2 · Extract per map and requirements (K49, K73); D-593, D-694, D-724 (K49), D-614, D-616, D-684; D-635, D-665, D-697, D-713, D-685 as its R8, R9 and map (K126); N21 (the view to `docprofile`), N28 (`chainKindFor`), N48 (REC-206's derivation). A fault it finds in `text-chain`, `pdf-reader` or `legacy-checks` is reported (P9).
- **content** · T5-3 · Extract per map and requirements; D-374, D-419, D-580, D-670, D-675, D-686, REC-204.

## Layer 5 (order: `entities`, `connections`, `progressions`, `bias`, `observation-log`, `query-language`, `retrieval`)

- **entities** · T5-4 · N4, N6 (with `id-spaces` retiring its legacy adapter, R26, K35), REC-225.
- **connections** · T5-5 · themes included (K79); D-575, D-625, D-706, D-722, REC-206.
- **progressions** · T5-6 · as its requirements.
- **bias** · T5-7 · the debt mechanism with it (K82 (3), K87), reading work products `ai-runs` registers in T6 (until then the store's arm registers them).
- **observation-log** · T5-8 · D-681, D-682; N39 (its share).
- **query-language** · T5-9 · N37 (`viewerPredicate`, `GATE_MARK` re-exported from membership).
- **retrieval** · T5-10 · the frontier included (K80); D-672, D-682, D-724.

## Layer 11

- **legacy-index** · T5-11 · the routes of the ops layers 4–5 move (N43's pattern); N21's view passed to `docprofile`; N88 (`scripts/coverage.mjs --strict` stops gating on FLEET CONTROL, FLEET FLOOR and REGISTER FLOOR; `owed-controls` A13b then passes).
- **legacy-tests** · T5-12 · re-anchor or retire what layers 2–5 break (d470 A3/A9 re-pinned for `CATALOG_VERSION` 1.34.0 and A5's literal: the row is in PROMOTION #3's record); N46 with N37; N57's remainder.

## Jobs

Layer 2, started 2026-09-27 ~05:44 UTC: RECORD-CORE #2 `session_014SH9wUytqUzw3oKoJhPj7C`, MEMBERSHIP #2 `session_01WvJLh3JQvPkdtZptfwXdqf`, PROMOTION #3 `session_01CBqvRerSWp68oj6TfvGgfi`.

**Size.** Fifteen jobs. T4: 13 jobs, 703.6M tokens, half of it legacy-tests (K126).
