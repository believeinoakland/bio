# ai-runs (T35)

**Status** · session_01XxNwYuEb8ARYBUtJemtX7H · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T35-44 applied on `job/T35/ai-runs` (code `fc04e2e3f4`), on `tranche/T35` as of START; run-rules (T35-43) has not merged yet and nothing here needs its new code: ai-runs names the mode `draft` as a word, as run-rules R21 and R16 do.

**Entries applied**
- R48 (N686, K1837): `countAskUsage` counts a draft's conversation with `mode: "draft"` to the member who asked for it, under mode `draft` in `ai_usage`, so `aiUsage` and `aiUsageMine` answer drafts as a mode of their own. A `mode` other than `ask` or `draft` is refused `AI_RUN_CONSUME_INVALID` (C-22.13), counting nothing (`AiRuns.ASK_USAGE_MODES`). A tick's entries are untouched: a run's use still arrives under its own mode.
- R52 (DEC-152, DEC-153): `aiUseCheck({member, at, mode})` holds a draft back before its first model call exactly as that member's ask (an account serving them, their own or the group's key; then the ceiling in force for them, the copy's included); `mode: "draft"` only changes `AI_NO_ACCOUNT`'s words to "A draft needs …". The account itself is fetched by whoever serves the draft (control-plane / agent-worker), as for an ask.
- R54 (DEC-149, BOB's review (1)), worded under the sweep's M rule: `index.mjs`:895 "the mode '…' is not deployed in your group's Civicsmith: …"; :1688 "Resumption: handed to agent-worker under the organisation credential '<tokenId>' of your group's Civicsmith, which opened this run."; :1694 "… a member's credential opened it, and your group's Civicsmith resumes only runs its own organisation credential opened (…)"; :1698 "… another principal opened it, and the organisation credential of your group's Civicsmith resumes only the runs it opened."; :1699 "… your group's Civicsmith cannot resume anything here (<code>)." The `withheld` codes, field names, the operator note (:867) and comments stay.

**Deferred:** nothing.

**Found in other modules (for BOB):**
1. control-plane (its T35-72 share, already named): `askusage` (`dispatch.mjs`:316) hard-codes `mode: "ask"`; a draft's usage needs `mode: "draft"` passed through, and `askceiling` (`:314`) can pass `mode: "draft"` to `aiUseCheck` for the draft's own words (optional; the verdict is the same).
2. Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, and `release/`, `newgroup/src/release.mjs` copies) embeds ai-runs' old strings; stale until the layer close regenerates it (§14). I wrote none.

**Tests and checks**
- ai-runs: 74 pass, 0 fail (`converts.test.mjs`: R54's test naming the five rows, old pins re-worded; `usage.test.mjs`: two T35 tests for R48/R52's draft; the R49 and R51 tests now count `draft` where they counted `check` through `countAskUsage`).
- Users of ai-runs, against the same suites with my change stashed: identical failures, all named reds — affordances 201/2 (red 29), op-declarations 81/3 (reds 9, 23), control-plane 179/3 (reds 19, 7, 26), plane 109/6 (red 22); run-productions 39/0, capture-requests 86/0, skills 67/0, intent 73/0, action-plans 63/0, scheduler 95/0, queue-producers 80/0. agent-worker not run (no `node_modules` in this container); it calls `askusage` with `mode: "ask"` only.
- `format`: 130 modules, 0 failures. `architecture ai-runs`: 0 failures. `coverage ai-runs`: 45 of 45, 0 failures. `ownership ai-runs tranche/T35`: 4 files, 0 failures.
- The marks "not yet met: T35" on R48, R52 and R54 can be struck at the merge.

Size (session_01XxNwYuEb8ARYBUtJemtX7H): test runs 8, module lines 3286
