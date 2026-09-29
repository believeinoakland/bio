# Plan: tranche T14

**Status** · OPEN · BOB #67 · session_019iV4d3YVE4NGg67gtwYeAT · depth 1

Opened by BOB #66, 2026-09-29 (PROCESS-MECHANICS §5), at `main` @ 5bb688333c, T13 closed (K449). Cut from `draft-T14.md`, re-read against T13's close (K451); its wordings folded before opening (K452). Bob's weekly meter at the opening: 22% (given ~18:55 UTC, T13's last stage). An `N` entry's text is in `build/plan/next.md`.

**Jobs** · legacy-checks: LEGACY-CHECKS #8 session_01NWS1PUu3dajfGZfz3TptN7; record-core: RECORD-CORE #8 session_016yKhRLi47N7TnetztZ9wyP; membership: MEMBERSHIP #7 session_018enJcPLdFUzkqbmn9nSNdx; promotion: PROMOTION #15 session_0133sVWEYMsdWzBRbtncwygV; host-governor: HOST-GOVERNOR #3 session_013JNFsyhP13DN7TavJx3aJp; capture: CAPTURE #7 session_01JeqPFLgSenZTbeFG1Gi4Wo; extraction: EXTRACTION #6 session_019uPfohVPcH6PyD4QySrBc3; progressions: PROGRESSIONS #4 session_01TuM9BqWVJmKhPaVJPp6FHs; bias: BIAS #3 session_01FxFMrSi4LKTy8hY2B34bNu; intent: INTENT #6 session_01FqpsV7C2NPXUooqgeT942u; publication: PUBLICATION #4 session_01DzEFa2jXcS7Vn9phBtGPyZ; ratification: RATIFICATION #6 session_01NkDk1W39kfk9zvHVf1PF48

**Rules at the opening.** T13's rules hold (`archive/T13.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); legacy-tests runs alone, last (K420, K427); after each extraction merge BOB runs `test/m/` whole on the tranche.

## Layer 1

- **legacy-checks** · N325's share: `checkBundle` stops calling `checkInboxGrammar` (the export stays one tranche). N212's remainder (the empty `CASE_DERIVATION_CHECKS` export with its header; the `where`s were fixed in T9). N214's remainder (the stale headers above `INSTALLATION_CHECKS` and `ATTRIBUTION_CHECKS`; `ATTRIBUTION_CHECKS` with its header; both rows exist: C-102.10, C-59.6). N334's header share. N251's share: the two empty exports go (their readers stopped in T13). K408 (4): C-96.1's catalogue copy goes (membership holds it since T13).

## Layer 2

- **record-core** · N342 (R63 `registerCounts`; C-102.13, C-102.14). Merged early for promotion (K425).
- **membership** · N128 (R81: C-102.11, C-102.12 in its table). N329 (R86 `activeAdmins` ordered). N335 (R87 `notAParticipant`; C-56.3–.5, C-96.14). N327 (R84 with DEC-83's `remedy` after the translation; R22, R41, R75, R62). K408 (4)'s follow-through: R84's "held twice" sentence goes, and `not-an-admin-visibility.test.mjs`:66–72 stops comparing the catalogue copy (merged early, so legacy-checks' layer-1 removal leaves no red). Merged early for promotion (K425).
- **promotion** · N335 (R43 through membership R87). N340 (R51 `DISPOSITIONS`, frozen). N341 (`gate.mjs` comments). N350 (R50's wording: the tie by line; the excluded scripts). The stamp, last (K425): every row change since 1.43.0 (T13's C-87.12 retirement (K434) and C-69.4 (K442), then T14's layer-1 and layer-2 rows, N342's among them), with `ROW_CENSUS` (R50) re-pinned.

## Layer 3

- **host-governor** · N339 widened (R27, K445).
- **capture** · N339 (R64: relays answer a store refusal with its status, with the correlation, N349). N347 (`EVIDENCE_NOT_HELD`).

## Layer 4

- **extraction** · N347 (R31 and two test lines). N339 widened (R64, K445).

## Layer 5

- **progressions** · N340 (R35 re-exports promotion's list; `uses` gains promotion).
- **bias** · N326 (R44 `settled`). N327 (R11 through membership R84, with its remedy). N343 (owns `settled_kind`).

## Layer 7

- **intent** · N327 (R9 through membership R84, with its remedy).

## Layer 8

- **publication** · N339 (R48). N346 (R44, R45, R47, new R49: each stage not reached states what it needs; `since`; `closed` with its reason; K448).
- **ratification** · N339 (R17).

## Layer 9

- **filings** · N331 (R3 reads `producingGroup`; `uses` gains promotion).

## Layer 10

- **monitoring** · N330 (R47 `archiveEligible`, R48 `flagged`). N339 (R49).
- **legacy-store** · N331's line (`store.mjs` drops the argument). N342's share (spreads record-core's `counts`; its own four reads and `TASK` row stay until T15). N343 (calls bias `migrate()`, drops its column line).

## Layer 11

- **queue** · N325 (R41, C-19.2). N326 (R39's bias half). N329 (R23's wording). N330 (R9, R10 through monitoring). N342 (R42: registers its four figures, seeds its `TASK` row).
- **instance-setup** · N339 (R43).
- **control-plane** · N339 (R23's sentence). N347 (R22 reads capture's table; `uses` edge). N348 (R35: the DO class, instance-setup's routes in the one frame). N349 (its own silences carry the correlation). Optional (K458): restore the gate's account (the fence as a member-reach property of `OPS`; one code at the gate, two at the mint) beside `AI_SCOPE_CHECKS`' header, from git history before 0ae4706953.
- **legacy-index** · N339's ten relays. N348 (exports control-plane's `Store`). N349 (`out.correlation`; the dead imports as wordings 2 lists).

## Last: legacy-tests (K420, K427)

- **legacy-tests** · LEGACY-CHECKS #8's re-pins (K458): the DEC-49 guard's four (families 109, rows 789, governed sites 498, the HELD TWICE acceptance retired), `d470-catalog-census` A1/A3/A9 after promotion's stamp, `d134-custodial-refusals`' C-96.1 arms, and `civicos-ui/test/custodial-acts.test.mjs`:381, 400 (read membership's `MEMBERSHIP_CHECKS`). K457 first: retire each old suite whose subject is extracted and covered by its module's tests, re-anchoring only what no module test guards; then the re-anchors each wording names and the re-read widened (`t14-reread.md`: N327's eight suites; N325's two; N335's `projects.test.mjs`:193; C-96.1's `d134-custodial-refusals.test.mjs`; C-29.12 accepted by name while nothing mints it; N347's `pdfstructure-op.test.mjs`:126 and the `check-refusal-codes` re-pin); N353 (REC-171's fixture); the d470 re-pin after legacy-checks' removals, the census suite over promotion's new stamp, and whatever T14's layers break, each named with its owner.

## Not in T14

Bob's first: N344 (the PRESENT/RESOLVE design, BOB's to write), N345 (requirement changes for Bob's approval), N317, N303's remainder, N320. T15 owes: legacy-checks C-29.12 (N327) and N325's export; legacy-store N342's drop; instance-setup N348's wrapper; promotion's stamp of C-118.1's key, C-19.2, the C-26.20 and C-111.16 retirements and `checkBundle`'s change; legacy-ui's optional N347 fixtures. Not in T14 for want of a job: N351 (entities), N352 (BOB words the helper first; retrieval has no T14 job). Waiting as in T13's plan.
