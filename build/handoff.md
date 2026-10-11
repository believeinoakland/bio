# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #151 (`session_01TNKsMjSu49MiEhsdjBhpvT`, primary account, depth 1), 2026-10-11 ~01:57 UTC, refreshing at 55% of its window (~545k of 1M) with T42's L5 just started and no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2607–K2639.

## Where things stand

- **T42 is open** on `tranche/T42` (opened K2607 from `main` @ 65490c5e33; plan `build/plan/current.md`, its rules 3 and 4 and every entry's text). Bob's meter 18% weekly at the opening (K2615). Development runs (K2605); the 80% pause (K2341) stands.
- **L1–L4 closed and merged** (K2619, K2626, K2632, K2638): record-grammar, bundler; record-core, membership, credentials, promotion (stamp 1.69.0); doorbell (new, by copy), capture (retired ids, keeps its doorbell copy to T43), sources; reading-pipeline, extraction. Artifacts regenerated at each close (the plane 15.2 MiB, ~480 ms start here).
- **L5 running** (STARTed 01:55 UTC, sessions created, addresses written): RETRIEVAL #17 `session_019vnhhXM8NuoLEZ5m4aXXJA`, LINES #3 `session_0163snLavE1iNycSFMG4uPJy`, MONEY #4 `session_01Ux9Ca6B1viDvKwTEe8rhGB`. Independent; merge in `modules.json` order.
- **Requirement text is written for every remaining layer** (L6–L9, L11; K2613, K2614, K2620, K2629, K2633): STARTs for L6 onward are not yet written. Inputs: `plan/draft-T42-reqs.md`, `plan/draft-T42-transcribe.md`, `extraction/case-account-split.md`, the plan's entries (each names its notes: e.g. T42-17 reads `held`, T42-22 mints `ACD` through `allocId`, T42-29's `owner-ops.mjs` finding, T42-30 carries `capture/plane.test.mjs`:66–75 and wires `pageTranscribeOp`; `EXTRACTION_OPS` stays unchanged until L11, K2635).
- **Timers:** backstop `BOB #151 backstop` (next ~01:54, re-armed each check) and `WATCH #151: tranche/T42` (`trig_01SG4NR5544BemJmRdB9NqmM`, into ROOT #5). Delete both at takeover (§5.1 (5)).

## Open with Bob

- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page; the channel's B123–B129 are unread by it (B128–B129: the `pagetranscribe` notice).
- ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`): twelve decisions open on https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d; HANDOFF read to H10. INVESTIGATION-DESIGN: HANDOFF read to H43 (done).
- Reported to Bob, no decision asked: the plane's start in Node ~0.4–1.4 s (K2612); a split of the plane is his (K2547), brought with the next release's real measure.

## Next steps, in order

1. Take over (§5.1): archive BOB #151 once idle and write its `BOB-final` row under T42 (`build/metrics/T42.csv`); delete its backstop and its `WATCH`; arm your own (into the ROOT that started you).
2. Watch L5 (§5.4); merge each job (§5.5; strike marks: retrieval R78/R58, lines R22, money R26); close L5 (§5.6: regenerate in K1540's order after `npm ci` in agent-runner `--ignore-scripts`, sheet-worker, file-scanner if the container restarted; archive; rows).
3. Write L6's STARTs (inquiry, hypotheses, steps, citation, basis-versions, ai-use, run-productions, question-explorer, agent-model, agent-worker; T42-12…T42-20, T42-19a) in the form of `plan/starts-T42/*.txt` (measure each with `plan/reading-sets.py`; explicit tests for ids whose string already appears, K874), then L7 (investigation), L8 (case-account first, case-authoring, review), L9 (conformance, actions), L11 (op-grades, affordances, op-declarations, answer-envelope, store-door, control-plane, plane last). L10 has no entry.
4. Close T42 (§5.7) and open T43 at once from `next.md` (N751…N854; N849–N851 capture and answer-envelope deletes, N850 case-authoring's pass-throughs, N852, N853, N854).
5. Commit build state only to `tranche/T42`; `main` moves only by §5.7.

NEEDS BOB: start ROOT. ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`) is at ~291k tokens and passes 300k with this start, so Bob replaces it (mechanics §2). In plain steps: (1) open claude.ai/code on your primary account; (2) start a new session on the repository `believeinoakland/bio`; (3) paste this prompt: "You are ROOT #7, the session that starts every BOB for BIO/CivicOS, on Bob's primary account. Attach believeinoakland/civicos-process, read roles/ROOT.md in it whole, and follow it. The current BOB is BOB #152; it will move its WATCH to you." (4) Tell BOB #152 the new session's link; it records the id in `build/manifest.md` and re-points its WATCH there.
