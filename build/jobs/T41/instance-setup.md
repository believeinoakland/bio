# instance-setup (T41)

**Status** · session_01WzRrJhZTNftXXEJ9mUKi9Q · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R65/R67 "a draft carries no project" (T40: N812, K2373), at this module's interface. My best reading, built and tested (`t41.test.mjs`); I carry on with it:
- The door resolves a draft's account with no project (credentials R56, store-door R10), so this module never reads a project. Its share is to hand on and answer none: `groupDescriptionDraft` hands its turn the door's `{kind, level}` with any `project` key dropped; and an account handed in that is a project's (`level: "project"`, or naming a non-null `project`) serves no draft: `ASSISTANT_DRAFT_UNAVAILABLE` (wizard-scripts' row), the turn never asked, nothing written; for `translationDraft` the same answer with no `words`, so the door has nothing to send. Its place: after NOT_AN_ADMIN / R67's first refusals and AI_KEPT_AWAY, before the answers' checks (beside the existing "door resolved no assistant" case).
- The door's AI_NO_ACCOUNT, AI_USE_SWITCHED_OFF, AI_LIMIT_REACHED (and the retired ceiling codes) are minted nowhere here; tested as never answered by any of the three draft entry points.
Wording point for BOB (no build change): R65's refusal list still names `ASSISTANT_OFF` (R55), which R55's T37 text retired for credentials' `AI_KEPT_AWAY`; the code and tests answer `AI_KEPT_AWAY`.

## J2 · COMPLETE

COMPLETE · T41-57 (was T40-22): R65, R67. Head of `job/T41/instance-setup` with `tranche/T41` @ 1b60598936 merged (B3).

**Entries applied**
- R65, R67 (T40: N812, K2373; K2577, K2581): a draft carries no project. `groupDescriptionDraft` hands its turn the door's account with any `project` dropped; a project's account handed in (`level: "project"` or a non-null `project`) serves no draft: `ASSISTANT_DRAFT_UNAVAILABLE`, the turn never asked, nothing written; `translationDraft` the same with no `words`. Placed after NOT_AN_ADMIN / R67's first refusals and AI_KEPT_AWAY (J1, confirmed B2). The door's codes (credentials' `NO_ACCOUNT`, `AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`) and the retired ceiling codes are minted nowhere here; comments re-pointed (`setup.mjs`).
- R65 flaw fixed: the draft's label said `asked_by: <id>`; R65 says `<handle>`. It now reads membership's handle (`#nameOf`, as R67's readings do), the founder's id where no handle is held.
- Module header's id list brought up to R75.
- B3 (K2587): `translations.test.mjs`:469 counts `missing` from the merged list (`INTERFACE_WORDS.length - 2`), no literal.

**Tests** (`t41.test.mjs`, 5 new, each with a negative control): R65 door codes never answered at any stage, own order kept; R65 no project (four project-account shapes refused, group/member accounts and `project: null` drafted, the turn's account carries no project); R67 door codes never answered by the three entry points; R67 no project (no words sent; group/member accounts answer words; answers, records and tables name no project); R65 label by handle (founder by id).
- instance-setup suite: 130/130 at START (no rule 4 (10) red: no file names the ceiling codes or ops); 135/135 on the merged head.
- Users (op-declarations, answer-envelope, store-door, control-plane, plane, `migrate-released`), tranche head vs my head in separate worktrees: 537 tests each side, 32 red each side, no difference (the inherited reds of rule 4). Layer tests: none in the manifest.
- Checks: format 0 failures; architecture 0; coverage 57/57, 0; ownership 4 files, 0.

**Deferred:** none.
**Other modules:** none found beyond J1's wording point (applied by BOB, K2581). Generated artifacts: none staled by this module's change beyond the plane bundle, which every merge stales (rule 4 (14)).
**Final uses:** unchanged (no new import).
**Reading set:** over 300 KB (code 215 KB, tests 279 KB, requirements 56 KB), so §17 (3): I read whole my requirements, layer 11's row (and the control-plane split section), K2373/K2400/K2489 and the plan's rule 4, `draft.test.mjs`, `translations.test.mjs`, the R65/R67 code (`setup.mjs` helpers 328–353, 1936–2010, 2180–2350), and the Uses' services this change touches (credentials R24, R25, R27, R35, R56; wizard-scripts R24, R25, R27; store-door R10; ai-use R3). Two workers read the rest in full: `setup.mjs`/`setup-fleet.mjs`/`livefire.mjs` (~14 KB summary, cited by file:line), and the other 17 test files (~12 KB, cited). Their findings that mattered: the one stale "ceiling codes" comment, the `asked_by` id-vs-handle flaw, the fixture's lack of an `accountFor` double (my tests need none: the door's resolution is store-door's). Nothing they left out mattered to this change.
Size (session_01WzRrJhZTNftXXEJ9mUKi9Q): test runs 9 (own suite 5; users' 4, of which 2 aborted by me and re-run), module lines 3320
