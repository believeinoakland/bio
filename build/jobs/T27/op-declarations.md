# op-declarations (T27)

**Status** · session_01FsRcQFZFMkEu8cvL4g6tgh · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** L11, N518 (R12) and N520 (R13), in `bio-plane/src/op-declarations/index.mjs`:
- R12: `actionholdrelease` (mutating, `admin`/`member`/`probe`, `actionhold`'s spec) joins `ACTIONS_ACTIONS` beside `actionhold`, so `QUERY_AUTHOR_ACTIONS` gives it `author` and `ACTION_LAYER_ACTIONS` gives it `viewer`; NEEDS `contribute`. `actionholdpreview` and `projectholds` (reads, `admin`/`member`/`probe`) join `ACTIONS_READS`, so `viewer` through `ACTION_LAYER_READS`; NEEDS present `null`. All three in both session sets.
- R13: the docket's seven member ops, each `{classes: [admin, member], machineClasses: []}` (`knocksof`'s fence), in both session sets: `docketfile`, `docketpressure`, `docketdecline`, `docketpost` mutating (NEEDS `contribute`); `docket`, `docketprepare`, `docketinvitation` reads (NEEDS present `null`). `docketpublic` and `docketfeed` are `classes: null`, not mutating, in no session set, NEEDS present `null` (affordances R34 names them in NON_ACTS). New exported lists, the network notices' shape: `DOCKET_ACTIONS` and `DOCKET_READS` (viewer), `DOCKET_AUTHOR` (`docketfile`, `docketpressure`: author), `DOCKET_BY` (`docketprepare`, `docketdecline`, `docketpost`: by), `DOCKET_PUBLIC_READS` (nothing stamped). control-plane R48 reads these to stamp.
- `viewer` is stamped on all seven docket member ops (my J1 QUESTION's reading, confirmed by B2, K1286).
- No `uses` edge to `docket`: nothing here imports docket's op names; the tests name them literally.

**Deferred.** Nothing.

**Found in other modules.**
- `control-plane` test R2, R41 ("affordances' unaccounted over the door's op table") is red on this branch with exactly my 12 new ops (unpublished: all 12; unranked: the 5 new mutating ops). It goes green once affordances' L11 work (its R33, R34: RUNGS, RUNG_ABSENT, NON_ACTS) is on the tranche; affordances merges before this module, so it should clear at my merge. Conversely, affordances' own R12 totality (a NON_ACTS key NEEDS lacks reads as stale) may be red on its branch until this module merges.
- Accepted reds seen, unchanged by this job: control-plane R22 (accepted red 4), affordances R19 `actionhold` (accepted red 5).

**Catalogue rows added.** None (no `awaiting stamp` rows).

**Tests.** New `t27.test.mjs` (8 tests naming R12 and R13 with R2, R3, R4, R6: whole-spec comparison, bearer fence, session sets, NEEDS rows, stamps through the lists, the served names, each with a negative control). `tables.test.mjs` updated to the amended lists (public surface gains `docketfeed`, `docketpublic`; `ACTIONS_ACTIONS`, `ACTIONS_READS` and their NEEDS rows).
- `node --test test/m/op-declarations/`: tests 43, pass 43, fail 0.
- Users: admission pass 19 fail 0; plane pass 55 fail 0; control-plane pass 126 fail 2 (R22, accepted red 4; R2/R41, above; base had pass 127 fail 1); affordances (checked for R12's totality) pass 147 fail 1 (R19, accepted red 5, same as base).

**Checks** (process repository):
- format: 92 modules, 91 requirements files; 0 failures
- architecture: 6 product files, 10 relative imports (1 naming no tracked file, not judged); 0 failures
- coverage: 13 of 13 live requirement ids named by a test; 0 failures
- ownership: 4 files changed by op-declarations between tranche/T27 and HEAD; 0 failures

Size (session_01FsRcQFZFMkEu8cvL4g6tgh): test runs 6, module lines 2553

## J1 · QUESTION

R13 says docketdecline and docketpost are stamped `by`, and that each docket member op is `viewer` (or `author`, `by`) stamped. My reading, built: `viewer` is stamped on all seven member ops, docketpost and docketdecline included (docket's own map passes viewer to each; fail closed), with `by` on docketprepare/docketpost/docketdecline and `author` on docketfile/docketpressure. If you mean `by` only for those two, say so and I move them to a list of their own. Not blocking: I have completed on this reading.

## J2 · COMPLETE

N518 R12 and N520 R13 applied on job/T27/op-declarations: actionholdrelease (ACTIONS_ACTIONS, contribute), actionholdpreview and projectholds (ACTIONS_READS, null rows); the docket's 7 member ops (admin/member, machineClasses [], both session sets; contribute for the 4 mutating, null for the 3 reads) and docketpublic/docketfeed (classes null, null rows); new lists DOCKET_ACTIONS, DOCKET_READS, DOCKET_AUTHOR, DOCKET_BY, DOCKET_PUBLIC_READS for control-plane R48. op-declarations 43/43; admission, plane green. control-plane R2/R41 is red with exactly my 12 new ops until affordances' R33/R34 land (affordances merges first, so it clears at my merge); affordances' R12 totality may be red on its branch until mine merges. Accepted reds 4 and 5 unchanged. No uses edge to docket. No catalogue rows. format, architecture, coverage (13/13), ownership: 0 failures. Details in the record's Completion section.

## B2 · CHANGE processed

K1286: the lists under exactly the names and order BOB gave. Already built as named; `DOCKET_BY` reordered to `docketprepare`, `docketdecline`, `docketpost` (test follows). B2 also answers J1: `viewer` on all seven docket member ops, as built. Merged `tranche/T27`. Re-run: op-declarations pass 43 fail 0; admission 19/0; plane 55/0; control-plane pass 126 fail 2 (R22, accepted red 4; R2/R41, the 12 new ops, until affordances R33, R34 land), unchanged. Checks below re-run: 0 failures each. Size (session_01FsRcQFZFMkEu8cvL4g6tgh): test runs 7, module lines 2553
