# Plan T50

**Status** · OPEN · BOB #197 · session_012CuwSMxDw6cByTgis9xsci · depth 1

**Jobs** · 

**Sources** · Adopted at the opening (K3614) from `archive/drafts/draft-T50-plan.md` (a planning worker's draft, reviewed by BOB #181 and BOB #195) with every review, paragraph and placement since folded in: N1148–N1197 of `next.md`, Bob's K3602 (N1195), K3607–K3611 (N1196, N1197), UX-DESIGN's DEC-257–DEC-300 (the design branch @ 92331996be, merged at the opening), and the owners settled at the fold by reading workers whose findings BOB reviewed (`plan/fold-T50-owners.md`, `plan/fold-T50-decs.md`, `plan/fold-T50-remote.md`). Every entry the draft or `next.md` held is placed below or left out with its hard reason (P19).

**Aim.** T50 carries every entry that can safely be done (P19). Its centre is Bob's K3607–K3611: the assistant runs on Claude Code remote, built in T50's own layers (N1196), with the local runner made impossible to run (N1197, first in L6); and K3320's journey (install, sign in and out, project, connect, capture, question, assistant, conclude, as administrator and member), with every defect the walks of the 0.85.0 cut found (JOURNEYS V4, WALK-085, R085's lanes). The rows the draft left out "under the meter" join: T50 opens on a fresh week (the reset, 2026-10-17 11:00 UTC; K3551's "all else goes to T50"), so P19 leaves them no hard reason. Bob takes inventory once T50 closes (K3609).

## Legacy census (§5.2 (2))

| legacy module | in T50 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **stays** | A dependency not yet built: the screens that replace S2–S4 (DEC-233, DEC-242, DEC-243) are built in T50's own L11 (N1101 themes, N1127 person acts, N1102 progressions' timeline), and its retiring job (N1002) must find every surface served by them before it removes anything, so it follows them: T51's L11. Its reds N794, N865, N1057 stay accepted by name (rule 5). The retiring job also removes plane R24's copied screen list and `regression.yml`'s `civicos-ui` glob (K3190). |

legacy-ui is the only module marked `legacy` in `modules.json`.

## Rules

1. **Merge order.** Within a layer, `modules.json` order; a provider merges before its users; a new module first in its layer (K624); promotion's stamp last in L2. **L6: agent-runner first (N1197, K3611)**, then the order. L11: translations first (new), then `modules.json` order (interface-shell before every screen job; journey-check last, K3100).
2. **Reading (K3271, P20, mechanics §6 step 2).** A job reads whole its requirements, its entries, its layer's contract, its own code, the used services its entries touch, and the tests that name a requirement its entries change; it runs its other tests without reading them. Each START measures the set against 600 KB (`reading-sets.py`). A job that would read only part of a document it acts on stops and tells BOB (K3586, K3588). Size lines count own code only (K2513).
3. **Models and effort (rulings-active §5; K3269, K3275, K3286, K3292, K3294, K3518).** Each START names its job's model: claude-haiku-5-5 for test-only, wording-only and mechanical jobs; claude-sonnet-5-5 otherwise; the default model only for a new module of more than three provided ids built fresh, a new provided service of more than three ids, a screen drawing what a user first sees (the claim, the first sign-in), or a restart after a Sonnet job blocks on tests. Jobs at medium effort; every worker a job spawns names its model and effort (haiku low for mechanical work, sonnet medium for reading, diagnosis and reviews; never opus).
4. **The opening act (K3613, K3614; BOB's, P17).** `tranche/T50` from `main` (dccb389428) with `tranche/R085` (the 0.85.0 cut @ b29f55bb22), `tranche/T49` and the design branch @ 92331996be merged. `modules.json`: setup-words moved to L1, first in the order (N1115); `translations` new in L11 before `instance-setup` (empty `paths`, `tests`, `uses`, K1043), instance-setup gaining it; `layers.md` says both. setup-words' `rows.mjs` regenerated from the merged `words.json` (§14). The split map `build/extraction/translations.md` written by a worker and reviewed before L11's START (P18).
5. **Accepted reds at the opening**, each until the entry named (K2704):
   1. Coverage: every id marked *(not yet met: T50)*, until its module's merge.
   2. Row census: rows T49's and R085's L3+ jobs added or changed, until T50-6 (the stamp); rows T50's L3+ jobs add, until T51's stamp.
   3. legacy-ui: `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865), its 8 tests failing at the `{role}` sign-in (N1057): through T50 (legacy census).
   4. bundler `fleetbundles.test.mjs`' hand-listed agent-worker inputs (K3353, K3568), until T50-1.
   5. membership R83's `MODULE_ORDER` (and R140, R145, R79's listeners order), promotion R39, R45, R46, plane `store.test.mjs` R2/R10: from setup-words' move and translations (K3368 (2)) and the hand lists K3543 names (N1171), until T50-2, T50-6 and T50-36.
   6. answer-envelope `families.test.mjs`' admission refusal pins and `catalogue-end.test.mjs` R7/R13 (K3379, K3382), until T50-25.
   7. plane R12 (a run waiting on an expiring request woken once; K3363), until T50-23 (N1113).
   8. instance-setup `recovery.test.mjs`:36 (`recover({role})`; K3337), until T50-23 (N1103).
   9. screens-daily `contract.test.mjs` on Projects' `themeread` and R1–R13 (K3380, K3492, K3543), until T50-31 (N1101, N1165, N1171).
   10. filing-templates R33 until T50-39 (N1130); screens-wizards `library.test.mjs` R1, R8 until T50-51 (N1131, N1171); the "words.json holds none of my words" check of ai-accounts, local-facts, standards, reading-guides, case-account, action-grammar, action-replies, filings and action-plans until each one's T50 job (N1132); store-door `routes` R15 until T50-50 (N1134); project-roster `owner-votes` R30 (intermittent) until T50-3 (N1135); ai-accounts R10–R22 refusal keys until T50-4 and action-plans R47 until T50-47 (N1171).
   11. admission `words.test.mjs` R28 and screens-entry R21 until T50-60 (admission) and T50-28 (N1146); affordances `t36` R48, R61 until T50-19 (N1147).
   12. The plane bundle and `program.mjs`, staled by any merge, until each layer's close (K1540).
   13. `site/build.mjs --check` (the generated `pages.mjs`): the merged `words.json` says "team" where the design's site drawing at `SITE_COMMIT` says "group" (K3472), until T50-37 (N1160).
   14. Every other base red K3543 and K3557 name (N1171), until the T50 job of its module, which diagnoses it in its own module; one with no T50 job joins T51.
   15. test-support R2 run as root under a 0700 directory: environment only (K3192 E).
6. **Every T50 job also does the following**, in its own module only, stated in its START. The Haiku jobs do only the second and third items.
   - (N1116, K3366, K3368; DEC-259, DEC-260) It holds no member-facing English: each sentence it draws or answers is read through setup-words' `word(key, vars)` (now in L1, so every layer may), its keys its `reads` in `words-reads.json`; verbatim copies and the tests comparing English go. A sentence no key holds is a REPORT to BOB for the design lane, never inline English.
   - (N1068, DEC-221) "labelled" is re-spelled "labeled" in its own member-facing words.
   - (N1073, K3268) Its tests that hand-list another module's ops, rows or words read the owner's declaration instead (`archive/drafts/draft-T49-N1073-hand-lists.md`); the four registries wait (N1074).
   - (N1145, K3417; DEC-276) A screen job, and interface-shell's, reads the `act.<op>.here.<place>` key wherever it explains one of DEC-276's sixteen acts in its place, and fills `{government}`/`{council}` from the team's own place.
   - (K3324 (2), D29) No screen treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success.
   - (N1160, K3472) "team", never "group", in any text people read (identifiers stay), as `words.json` now says it.
7. **Wording only (K3259): BOB's edits, no job.** Any `SCREEN_WORDS`-style Provides line a merge left.
8. **Walks (K3320, K3052, K3460).** A defect a walk of T50's release finds becomes an entry; one for a module whose T50 job has not started joins its START (K279, K1249); one in a closed layer goes to T51. Layout, wording, flow and look go to UX-DESIGN as one HANDOFF.
9. **The remote proof (K3558, K3608).** Every remote step of N1196 is proven from Civicsmith's own code on biosmoke8, bottom up, each request and answer logged by biosmoke8 itself; no remote cell is run from a Claude session's own tools. A job whose step needs a live call proves it on biosmoke8 and records the log lines.
