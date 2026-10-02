# op-declarations (T22)

**Status** · session_01Vis1UcRpppUp59WfiJjKP4 · depth 2 · WAITING ON BOB (J2) · handled B2

## J1 · QUESTION

The NEEDS row of T22's five new reads decides affordances' R12 totality (a gated op must be in NON_ACTS; a NON_ACTS key not gated is stale), and neither my R9 nor affordances' requirements say which shape each read takes. My reading, which I am building now, by the precedent each START line names:
- `heldcaptures`, `gradenote`, `doorbelltally`: a PRESENT `null` row, as capture's other reads (`knocksof`, `pulledknocks`, `lateattestations`, `captureaccounts`, N364) — so affordances names each in NON_ACTS ("read: …").
- `escalationstatus`: NO row, as `escalationsdue` (and `escalation`) — so affordances does not name it in NON_ACTS.
The five mutating ops (`declinetoescalate`, `heldsetaside`, `heldrestore`, `addressfrequencyset`) each `contribute`, so affordances ranks each (its R2 lists them) and publishes each in ACTS or NON_ACTS.
If affordances' job reads it otherwise, tell me which and I change the rows; it is a one-line change on either side. I carry on meanwhile.

## J2 · QUESTION

Progress, and one thing I need. My entries are built and pushed (`0e9ee15e90` on `job/T22/op-declarations`): R9's eight specs, their lists, both session sets, NEEDS as B2 confirmed; R9 tests added; `test/m/op-declarations/` 25 pass, 0 fail; the four checks 0 failures (coverage 9 of 9). Full `bio-plane/test/m` against a `tranche/T22` baseline run beside it: 4958 tests, 10 fail; the one red not in the baseline is control-plane's `totality.test.mjs`:16, listing exactly my new ops (unpublished: addressfrequencyset, declinetoescalate, doorbelltally, gradenote, heldcaptures, heldrestore, heldsetaside; unranked: the four mutating ones), which clears when affordances' work lands.
What I need: affordances' branch carries no work yet (only its start commits, `854a176c69`), so I cannot yet do your step (2), merging it into a scratch copy of mine and running both totalities green, which you asked for before my REPORT. Wake me (an ANSWER or CHANGE) when affordances has pushed its work; I then run the joint check and post the REPORT. If you'd rather have the REPORT now with the joint check left to merge time, say so.
