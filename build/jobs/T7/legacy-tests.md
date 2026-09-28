# legacy-tests (T7)

**Status** · session_01EbJbvw2MqsPnPv5f2PjGVo · depth 2 · NEEDS BOB · handled B4

**Contract** (legacy module, no requirements file; `build/modules.json`): paths `civicos-ui/check-refusal-codes.mjs`, `civicos-ui/check-semantics.mjs`; tests `bio-plane/test/`, `civicos-ui/test/` (except `bio-plane/test/m/<module>/`, each module's own). Entries: layer 11's legacy-tests line in `build/plan/current.md` and every forwarded item naming legacy-tests (B1).

NEEDS BOB: delete `bio-plane/test/skilldoctrine.test.mjs`, `skillprohibitions.test.mjs` and their two drivers `skilldoctrine.control.mjs`, `skillprohibitions.control.mjs` (SKILLS #1 J4, N53: both suites no longer load, since strength took `VERSION_STRENGTH_*` out of the catalogue, and `test/m/skills/` supersedes them). My session's permission check refuses removing test files ("Security Test Removal"); the release needs Bob's approval here, or BOB does it on the tranche branch.

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: delete `bio-plane/test/skilldoctrine.test.mjs`, `skillprohibitions.test.mjs` and their drivers `skilldoctrine.control.mjs`, `skillprohibitions.control.mjs` (SKILLS #1 J4, N53: both no longer load since strength took `VERSION_STRENGTH_*` from the catalogue; `test/m/skills/` supersedes them). My permission check refuses removing test files. Either Bob approves the removal in my session, or you remove the four files on `tranche/T7`. I carry on with everything else meanwhile.

## Progress (working notes; the COMPLETE entry supersedes)

- Baseline: all 371 `bio-plane/test/*.test.mjs` on the merged tranche (9b547193e9, a git-less copy): 187 red. Re-run in the checkout after the objective fixtures: 98 red.
- INTENT J4.1: 83 of 84 suites green with `objective:` in their fixture project documents (`b81f26e151`); `overdue-successor` red on another arm (worked below). QUEUE J2.6 (`surfacing-run.mjs`, `queue.test.mjs`) is in the same commit. N124 prose: done.
- The DEC-49 guard (`89b9727dbe`): 145 → 119 failures, every one another module's (REPORT, at COMPLETE). `verdict-reader.mjs` reads the route answer `{status, body}` and `answer(<status>, {…})` (T4/T5's deferral with N87); MULTI_SITE_CLOSED loses `CAPTURE_NOT_DRAINING`, `VERSION_NOTICE_NO_CONTENT` and gains `NO_BUNDLE`, `NOT_A_DOCUMENT`, `NO_BYTES_HELD`, `FACT_UNAVAILABLE`, `NO_OBJECTIVE`, `VERSION_ADOPT_UNWRITABLE`, `CAPTURE_CREDENTIAL_NOT_PERMITTED`; floors families 70→82, rows 551→633, census 866→919, reach 596→668, governedSites 288→334, regions 246→256 (N158's `is-airun-open-mode` among them), refusalsJudged 549→552, vocabularyTerms 113→114 (QUEUE J2.2), r3Fed 91→92; ceilings untranslated 302→283, unclassifiedOutcomes 1→0. Not moved (product-caused): regionLines, codesChecked, outcomeReturns, inheritedVerdicts, multiSiteCodes. `provenanceAudit` prose in seven suites. refusal-codes 158 green; plane-envelope green.
- Next: the five family workers' results (bounds; ai-runs; citation/strength/inquiry; basis-versions/reevaluation; run-productions/capture-requests), then N57/N31 notes, checks, COMPLETE.
