# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #224 (`session_013u2EkUokuoLo8WRh5ntWVP`, depth 1, parent ROOT #7, primary account), 2026-10-19 ~13:45 UTC, at ~40% context, with no step half done. **T51 is OPEN** on `tranche/T51`; **L11 running** (35 jobs, K4067). Read `build/rulings-active.md` whole, then with the Read tool, whole, K4072–K4082 (the last lines of `build/rulings.md`), then the plan's "Sequence", "L11", "L11 additions", the "Completion round" (now CR-16 too) and "BOB's acts" in `build/plan/current.md` (L11's entries are ~25k tokens: read them in parts, every part).

## Standing

- **Bob is angry, rightly, that work slips** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons; never offer an option that defers.
- **Words:** setup-words R13 binds every sentence a member reads; a drawn-screen module reads rows only; the list wins over code wording (K3930, K3984). Unread strings go to the design's unkeyed list by HANDOFF (K3944).
- **Design merges mid-layer (K4072, K4080, as K3917):** a design commit that adds rows the running jobs need is merged at once (retired rows checked against the jobs' branches), `rows.mjs` regenerated (`node bio-plane/src/setup-words/build.mjs`), then each job gets its rows by CHANGE, quoted verbatim from the U entry.
- **Merging:** a complete job merges when every same-layer module in its `uses` is merged and it has read BOB's newest entry (check `mail check`'s cursors). Scratchpad helper `mergejob.sh <module>` (ownership against `git merge-base`, `git merge --no-ff`, the module's suite via `mt.mjs` = `.github/scripts/module-tests.mjs` filtered by argv) is gone with my container: rebuild it. Then strike its met marks (keep any the ruling names unmet), words over the merged modules jointly, push. A waiting graph: python over `build/modules.json` layer 11, a job's same-layer `uses` that exist as `job/T51/*` and are not ancestors of HEAD.
- **Edges and rows are BOB's** (one row, same JSON spacing; a Uses line in the requirements; format, architecture, `order.mjs --check`).
- **Doorbells:** `run_once_at` the next whole minute; about 6 per minute, the rest a minute later. A job rings the address on its branch: LEGACY-UI rang archived BOB #223 (K4079), so the backstop's `mail check` is what catches such entries.
- **The window:** 1,000,000. Refresh at 40%.

## L11 state (K4072–K4082)

- **Merged:** interface-assets, machinery-producers, action-producers, notice-producers, site, wizard-scripts, queue-producers, translations, instance-setup, installer-steps (its `paths`/`tests` filled; R26, R31, R36 stay marked), stewards.
- **Re-opened by CHANGE (K4080, K4081), merge again when COMPLETE:** interface-assets, wizard-scripts, site (re-take the design at `2a64c5ae77`, in that order: site R16 equals `ASSETS_COMMIT`); queue-producers (U389's fills).
- **op-grades is the bottleneck** (K4079): affordances, tasks, op-declarations, interface-shell and so every screen and control-plane wait on it. It is converting its hand-lists (pins read op-grades' own requirement lines, K4076; codes from owners' refusals, K4072). If it stalls or nears half its window, restart it (sonnet).
- **Complete, waiting on providers:** affordances (op-grades), tasks (affordances), queue, op-declarations (J5, all B's read), admission, answer-envelope, store-door, signin-door, interface-shell (J2: five reds accepted until op-declarations and wizard-scripts merge, K4078; re-run by CHANGE after), screens-entry, screens-wizards, screens-intake (R39 red until interface-shell), screens-investigate, plane (J2, re-complete; after control-plane), legacy-ui (J3; after plane; then BOB's one act from "BOB's acts": `legacy-ui` row, `layers.md`, `MODULE_ORDER`, `regression.yml`:56, `.gitignore` lines; `.claude/settings.json`:15 is Bob's own edit).
- **Working:** screens-daily (#9), screens-action, screens-publish, screens-inquiry, screens-settings (each waits on interface-shell and op-declarations, and has U389's rows by CHANGE), installer (#18: step 2, deleting the moved ranges now that installer-steps merged; then installer-steps' second stage by CHANGE, setup-words edge then), control-plane (waits; at its merge drop `bio-plane/src/signpage.mjs`, `src/sign-release.html`, `scripts/embed-signpage.mjs` from its `paths`), journey-check (RUNNING; CHANGE B2: `group.test.mjs`:19 should be green).
- **Accepted reds by name:** installer's R10, R32, R40, R62, R63, R65, R72 on the tranche until installer merges (K4080); R53 and `newgroup-bundle-fresh` until L11's close; setup-words' two are CR-14's; site R9, R16 until `pages.mjs` regenerates at the close; installer-steps' 74 and instance-setup's 30 words findings (K4079); answer-envelope's architecture finding until it merges (K4064).
- **After L11's merges, BOB's wording edits:** answer-envelope R6, notice-producers R25, rule 7's list; screens-daily's requirement still names the retired `queue.answered.photos`/`.granted` (U389).

## Design lane (UX design #32 `session_01MBG5FH3gL4kdDPTNgGsGex`, opus, started K4075; it archives #31)

Channel read through U389, posted through B372 (ACK). **Unanswered:** B369 (screens-settings' removal rows and grouprules' headings, screens-investigate's kind words and wire value, instance-setup's unkeyed strings and placeholder names), B370 (screens-daily's Home sentences), B371 (screens-inquiry's long key list, interface-shell's R94/R95/R98, `.mk-grp`, the SSH armour). Ring it after posting.

## Timers

My backstop (`send_later`, next ~13:38+20) and WATCH #224 `trig_01Q7342tDw44va7kHwyTG7aH` (into ROOT, 14:45): delete the WATCH at takeover; my backstop fires harmlessly into my archived session.

## What comes next, in order

1. Take over (§5.1): archive BOB #224 once idle (BOB-final row under T51); WATCH and backstop.
2. L11: answer, CHANGE and merge as above, in `modules.json` order with rule 1 (journey-check last). Restart a job whose record says BLOCKED (context), archiving the old with its row.
3. L11's close (§5.6): merge the design (anything after `2a64c5ae77`), regenerate artifacts in the manifest's order (now with installer's invitation page, K4073; `npm ci --ignore-scripts` in agent-runner, file-scanner, site, `bio-plane/src/journey-check`; sheet-worker `npm ci`), `fleetbundles` (151 PASS at R9) and `newgroup-bundle-fresh` (`--test-force-exit`); `checks/run.mjs`; archive L11's sessions with rows.
4. The completion round (CR-5, CR-12, CR-14, CR-15, CR-16: credentials `lastActivity()` before CR-12), then the close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Job branches are fast-forwarded with plain pushes only (K3969).
- `git rm` in a job session: auto mode refuses it even for standing-list paths (K4070): Bob's approval in that session each time (§16); legacy-ui's was given (K4079).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- None.
