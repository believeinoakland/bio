# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #231 (`session_01BPMDpdbR783Mu1VZPQPjjR`, depth 1, parent ROOT #7, **primary** account), 2026-10-20 ~13:15 UTC. **T51 is OPEN** on `tranche/T51`, its fix round **paused by Bob** (K4211): "57 jobs at once was just too much! … They need to all be killed. But save this plan, we can run them later this morning under the secondary account that refreshes at 11am." Every wave-2 session is archived; no job, timer or WATCH is live. The work resumes on the **secondary account** (rulings-active §1, account switch). Read `build/rulings-active.md` whole, then **K4200–K4211** whole (the last lines of `build/rulings.md`), then `build/plan/fix-round-T51.md` and `fix-round-T51-pass.md`.

## NEEDS BOB (only Bob can do this)

On the **secondary** account, once it has refreshed (11:00 local): open claude.ai/code, start a new session on repository `believeinoakland/bio`, branch `tranche/T51`, and paste:
"You are ROOT #8, the session that starts every BOB for BIO/CivicOS on this account. Attach believeinoakland/civicos-process and read roles/ROOT.md whole, then act on this request: START BOB #232: tranche/T51 @ <the commit of this handoff>."
(ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1` on that account may be used instead if it is still alive and under 55%.)

## Where the round stands

- **Wave 1 merged** (six jobs) and **the declaration pass committed** (K4203–K4206; census `declared 162 of 299`).
- **Wave 2 started and stopped** (K4207, K4211): 57 STARTs posted, every job branch at the tranche tip at start. Work each session pushed before it was archived is on `job/T51/<module>` and in its record; a restarted session reads its record and mailbox and continues (§5.4 restart). **Merged since:** journey-check (FR-34, R30 written) and answer-envelope (FR-51) (K4210).
- **Reported COMPLETE, not yet merged** (check `mail check` and ownership first): agent-runner, connections, affordances, inquiry-grammar, capture-requests, strength, capture, promotion, ai-accounts, file-safety, interface-shell (J9, CHANGE B19 done). Many of these put their requirement lines in their records: write each at the merge.
- **Partly done** (restart): file-scanner, credentials, provenance, capture-sources, investigation, case-import, case-inputs, case-authoring, review, filings, tasks, queue-producers, queue, screens-entry, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, plane, installer, citation, monitoring, link-sweep, installer-steps, instance-setup, pdf-pixels, acquisition, inquiry, screens-wizards, wizard-scripts, member-roster, project-roster.
- **Never started** (session created and archived at once): sources, ratification, run-productions, action-plans, explore, action-holds, store-door, control-plane, op-grades.
- **text-chain** (FR-41): its entry L6 is `reading-pipeline`'s (R32, `visibleTextOfHtml`), so text-chain has nothing to do: write a reading-pipeline START (sonnet, the four tests text-chain's J3 lists) and don't restart text-chain.

## Next, in order (secondary account)

1. Take over (§5.1). BOB #231 is on the other account and cannot be archived from there: leave it, no BOB-final row (K1428). The channel's `BOB` row stays until the tranche close (K1897); write your Writer line as usual.
2. Post the CHANGEs BOB #231 drafted but never sent (K4210): **control-plane** also declares `subscriptionsignin`; **op-grades** drops `RUNG_ABSENT.securitymap`; **tasks** and **queue-producers** mint an optional `door` (and queue-producers `facts.ms` per feed); and to every wave-2 job not yet answered: write your own requirement lines in `build/requirements/<module>.md`, the ownership listing of that one file accepted at the merge (K4210). Answers already posted (B-entries, K4209–K4210) stand.
3. **Merge the COMPLETE jobs first** (they cost nothing to finish), in `modules.json` order.
4. **Restart the rest in batches of at most 10 concurrent jobs** (K4211), providers before the screens that use them: owners first (member-roster, credentials, provenance, capture-sources, investigation, case-import, case-inputs, case-authoring, review, filings), then tasks, queue-producers, queue, citation, monitoring, link-sweep, instance-setup, the not-started haiku jobs, then the nine screen modules, plane last, installer-steps then installer. A restart is a new session `<MODULE> #<k+1>` with the fixed prompt on the same branch (merge the tranche into the job branch first if it is behind).
5. Then the round's second pass (plan §7: the mark and the asking; the words check's two arms, K4208; hand-row deletion; bundler's split, 4,205 lines by K2513's rule), one check pass, the redeploy of biosmoke8 (handoff of BOB #230's step 6 stands: deploys are approved by Bob in the refused session, K4177), the targeted re-walk, the alpha cut, T51's close (§5.7).

## Helpers

- `mt.mjs`: a copy of `.github/scripts/module-tests.mjs` filtering modules by argv, with `--test-force-exit`, excluding `journey-check/journey.test.mjs` (the local walk, K4111). **Run long commands as session-tracked background tasks** (K4207): an idle container is replaced.
- Packages before any test run (K4113).

## Open with Bob

- The secondary-account ROOT start above (NEEDS BOB).
