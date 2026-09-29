# Plan: tranche T13

**Status** · OPEN · BOB #65 · session_016zEDcomCDUHSGu1SA7kzqo · depth 1

Opened by BOB #65, 2026-09-29 (PROCESS-MECHANICS §5), at `main` @ 8dfc4fb5ca, T12 closed (K423). Cut from `draft-T13.md` re-read against T12's close (K424); its wordings folded before opening (K408, commit 59463bf73d; N332 worded as membership R85). Bob's weekly meter at the opening: asked (18% at T12's close). An `N` entry's text is in `build/plan/next.md`.

**Jobs** · odf-reader: ODF-READER #3 session_012x3jt5MEsquz9cY3RyQESF; record-core: RECORD-CORE #7 session_01GSoeuDnnp3sumTtZuq2WZq; membership: MEMBERSHIP #6 session_01Hc7NnTW3bKEQ3syEqYwTB7; promotion: PROMOTION #14 session_01JwRGiAAQuCSCteSnVJeMBi; intent: INTENT #5 session_01NeUjSARtJrUvGsQ3fY9FRB; case-authoring: CASE-AUTHORING #3 session_01UycqMHEcrUKuRXZ9RLdPm5; review: REVIEW #4 session_01P7YNYC4HwY5uqrXFyjyZpM; ratification: RATIFICATION #5 session_01FW1o1n2eXe6NEXbNnBRoE6; monitoring: MONITORING #5 session_012PquHVC9k9aMw1YH8G1kq4; legacy-store: LEGACY-STORE #5 session_01L19DRu2cbWBiRXm4jADFGU; affordances: AFFORDANCES #6 session_01NhLZHCLTs7E1w8EfnWcDnJ; queue: QUEUE #3 session_01PQNFqfP7kPh56cqLi4WAzf; instance-setup: INSTANCE-SETUP #2 session_01TEPER5SDgX1CbFrmvYAxBe; control-plane: CONTROL-PLANE #4 session_01V4YD1GggxTVp7D89Qjz5po; legacy-index: LEGACY-INDEX #9 session_01SbWMHYtC23oJPnXnB8WhqY; legacy-tests: LEGACY-TESTS #11 session_014vwpwAxsSWt48tTDFnEJoS

**Rules at the opening.** T12's rules hold (`archive/T12.md`): every job with a long battery runs it in the foreground, in chunks under ten minutes, pushing its record after each. A provider a later job of the same layer needs merges early as it completes (§4). **legacy-tests runs alone, last, after every other job has merged (K420, K427).** After each extraction merge BOB runs `test/m/` whole on the tranche (BOB #64's lesson).

## Layer 1

- **odf-reader** · N30: R45 `ODF_REPEAT_EXPANSION_MAX` (262,144 units), R16 hidden rows as ranges, R41's new branch.

## Layer 2

- **record-core** · N322 (with N250): R62 `mintExhausted`, row C-59.6 in its own table. Merged early for promotion (K425).
- **membership** · N324: R84 `notAnAdmin`, C-96.1 into its table (the catalogue's copy stays one tranche, K408 (4)); R6, R7, R9, R12, R20, R25, R26 through it. N332: R85 `visibilityOf` tested at the interface. Merged early for promotion (K425).
- **promotion** · N318: `CATALOG_VERSION` stamps every row change since 1.42.0: T12's after its layer 2 (the list in `build/plan/t13-stamp-list.md`), C-96.13, and T13's layer-2 rows (C-59.6, C-96.1's move). N319: R50 `ROW_CENSUS` pinned at that stamp. N322: R19's site through record-core R62. It merges record-core and membership as they merge, and stamps last (K425).

## Layer 7

- **intent** · N323: R12–R14, R27 and the Bounds paragraph (1,000 with `truncated`), with interface tests at each bound.

## Layer 8

- **case-authoring** · N322: R7's mint through record-core R62. N251 (its share): `test/m/case-authoring/invariants.test.mjs` stops importing the emptied `CASE_DERIVATION_CHECKS` (lines 9, 88), asserting the codes' absence another way.
- **review** · N322: R27 through record-core R62; C-87.12 retires (awaiting stamp, R50).
- **ratification** · N251 (its share): `test/m/ratification/checks.test.mjs`:249 stops reading the catalogue's `ATTRIBUTION_CHECKS`, asserting the absence another way.

## Layer 10

- **monitoring** · N324: R30 through membership R84, its own site retired. Strikes its stale N65 and N166 marks (draft's "Stale marks").
- **legacy-store** · N328 (closes N112's and N171's remainder): `#counts`' bias half reads bias `counts(hid)`; `#MINT_LEDGER_LIVE`'s `TASK` row and the purge's `tasks` read re-homed with `op=stats`.

## Layer 11

- **affordances** · N321's share: `op=projectstage` accounted as every op is (class and grade), as `profilesset` was (K416).
- **queue** · N322: R23's task mint carries record-core R62's `code`, `check` and `detail`.
- **instance-setup** · N10's remainder: R15's end-to-end half (the `test.todo` at `test/m/instance-setup/profiles.test.mjs`:92), now that control-plane's `profiles`/`profilesset` rows have merged.
- **control-plane** · N321 first: the Worker routes `op=projectstage` to publication R44, stamping `viewer`; pushed and reported before N333. N333: the store's door moves to `src/control-plane/dispatch.mjs` as built in T12 (commit d2bbae2f75, K412), its error row renumbered where it collides, R25–R27's store-half todos made tests (K426).
- **legacy-index** · N338: `bio-plane/scripts/coverage.mjs` reads control-plane's `OPS`. N334's legacy-index share: the dead catalogue imports go.

## Last: legacy-tests (K420, K427)

- **legacy-tests** · N318's d470 re-pin; N319's census suite (R50) with its negative control, listing `awaiting stamp` rows (review's C-87.12 retirement, control-plane's row) and accepting C-96.1 held twice by name; N238 with N277 (meaning-bounds follows publication's held `commitCaseEdition`); N333's re-anchors (`project-sight`); N338's `owed-controls` A1 and Part B; the DEC-49 guard's floors and arm G; and whatever T13's layers break, each named with its owner.

## Not in T13 (stay in `next.md`)

Worded during T13 for T14 (P18): N325, N326, N327, N329, N330, N331, N335, N339, N340, N128 (with N202), N242. Legacy-checks' next job (T14): N212, N214, N334's header share, N251's removal of the two empty exports, and C-96.1's catalogue copy (K408 (4)). Waiting: N13, N21, N22, N26, N31, N34, N57, N68, N70, N71, N75, N136, N137, N144, N155, N157, N175, N211, N221, N225, N232, N241, N245, N248, N249, N272, N279, N336, N337, DIST-14; Bob's: N317, N303's remainder and N320.
