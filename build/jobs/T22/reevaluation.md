# reevaluation (T22)

**Status** · session_01Q1RgBhiWfGKr5JjiSzSa23 · depth 2 · WORKING · handled B1

## J1 · REPORT

Before my merge (START (1)–(3)). Branch `job/T22/reevaluation`.

1. **DEC-88 callers** (grep `adoptVersion(`, `versionadopt` over `bio-plane/`, `agent-worker/`, `civicos-ui/`, on my branch). No other module calls `adoptVersion`. Mine: `test/m/reevaluation/` (`pushed`, `sweep`, `caseparts`) now send a why, except where a test proves the refusal. Not mine, for routing:
   - **queue** (L11): `src/queue/index.mjs`:599–:606. The `newer-capture-affects-reference` door names `versionadopt` with `requires: ["notice"]`, and its detail says only the keep takes a why. Adopting now also requires `why` (R15, C-110.29 `VERSION_ADOPT_NO_REASON`, 1–2,000 characters after trimming).
   - **affordances** (L11): `src/affordances.mjs`:1184 and :2642 describe `versionadopt` without its required why (it sits in `RUNG_ABSENT`).
   - **civicos-ui**: `app.html`:15752 is a comment only; no call sends `versionadopt`.
   - agent-worker: none.
2. **Conformance and an `attribution` event** (R8; `conformance/index.mjs`:1049–:1060, not mine). `basisChanged` reads every kind but `passage` as `finding`. So an `attribution` event looks up `determination_findings` with `finding_id` = the observation id, and flags only the determinations that pin that observation itself as a finding, with source `attribution`. A determination pinning a finding that rests on the observation is not flagged. Today that usually means nothing is flagged. `test/m/conformance/` is green (54/0); no conformance test sends an `attribution` event.
3. **Suites run, each red named.** All are reds already accepted by name, and none is new.
   - publication 94/0, ratification 181/0, conformance 54/0, monitoring 73/0, queue 80/0.
   - case-authoring 79/1: `members.test.mjs`:129 (K1065).
   - scheduler 50/1: `plane.test.mjs`:85 (L10).
   - queue-producers 45/4: `proposals.test.mjs` tests at :78, :124, :153, :167, all failing in `seeded` (:58). This is the accepted :39 fixture red (L11).
   - control-plane 100/2: `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310 (L11).
   - Whole `bio-plane/test/m`: 4874 tests, 4816 pass, 39 fail. The failing tests are a subset of `tranche/T22`'s run on the same machine (4855 tests, 4795 pass, 41 fail; its two extra failures are extraction's `convert-tiers` and `staffdirectory` in that bare worktree). Mine are actions `t18.test.mjs`:299; affordances `backing.test.mjs`:27; intent's fixture (29 tests); the four above; scheduler :85; control-plane's two. `test/system/row-census.test.mjs` is red with C-110.29 among the rows awaiting stamp (accepted red 3).
4. **Bundle.** `src/reevaluation/` changed, so `bio-plane/dist/bio-plane.bundled.mjs` is stale. I regenerated nothing.
