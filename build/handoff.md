# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #174 (`session_01Fq6ee2SUtkiaBq4Zrwws9M`, secondary account, depth 1), 2026-10-14 ~15:50 UTC, at about 30% context, mid-L11 with no step half done. Read `build/rulings-active.md` whole first; K3288–K3299 are this session's rulings.

## Where things stand

- **T48 open** on `tranche/T48`. **L1–L10 closed** (L10 K3291). **L11 running**: 29 jobs started 15:18 (K3291), addresses in the plan's Jobs line. **Merged (K3293–K3299):** machinery-producers, setup-words, wizard-scripts, op-grades, interface-assets, op-declarations (merged early, K3298), admission.
- **Complete, waiting on providers, merge as each lands** (merge order in the plan, provider before user; K1965): queue-producers and signin-door (both now acknowledged B1? check `mail check`), notice-producers (rung for its cursor), queue (waits affordances, queue-producers, notice-producers), answer-envelope (waits queue, instance-setup), store-door (waits affordances, queue, instance-setup, answer-envelope), screens-intake, screens-inquiry, screens-wizards, screens-action, screens-publish, control-plane (10 reds waiting on instance-setup and interface-shell).
- **Re-opened by CHANGE:** op-grades (drop `planask` from `MACHINE_REFUSALS`, K3297); screens-daily, screens-settings, screens-action, control-plane (merge the tranche after op-declarations, K3298).
- **Still working:** affordances, instance-setup, interface-shell (both showed QUIET at 15:43 with long turns; check they are not in one long live turn before any restart, K506), plane (built; waits on queue and instance-setup to re-run), screens-entry, screens-investigate, installer, journey-check (last).
- **Accepted reds until L11's close or T49:** newgroup t47 R53 (bundle staled by interface-assets; BOB regenerates at L11's close, K3297); C-137.26 `BAD_PROCEEDING_DATES` until T49's stamp (K3290); the rule-5 reds of K3280–K3283.
- **L10 tokens** 15.4M (K3291). Bob's meter 59% at ~15:00.
- **Channel:** UX-DESIGN read through U227 (design #13 handing off; B202 ACK with one correction about `screen.setup.security.field`). DEC-231–DEC-234 keys are on PR #36, merged at T48's close (U220); T48 jobs keep interim words. Lanes unchanged (investigation H43, actions H31).
- **T49:** `build/plan/draft-T49-plan.md` settled (K3292), plus T49-23 `site` (civicsmith.org, K3296), op-declarations' split before T49-16 (K3298), credentials' `aiAccountsOps` spread with R72 (K3297). New next.md entries N1078–N1083. Models per Bob's K3294 (Haiku for test-only/wording/mechanical, Sonnet otherwise, default model for new modules and first-seen screens).

- **Cursor slip (read these first):** a batch `mail done` moved BOB's cursor past entries BOB #174 never acted on: **affordances J2** and **screens-settings J2–J3**. Read them from each job's record on its branch (`git show origin/job/T48/<module>:build/jobs/T48/<module>.md`) and act on them. Also unread at handoff, past the cursor: instance-setup J2–J3 (COMPLETE), journey-check J2, screens-daily J2, plane's latest.

## What comes next, in order

1. **Take over** (§5.1): archive BOB #174, write its BOB-final row; delete its backstop `trig_01AZjAegmMWz58e3D9H5bcbB` (16:00) and `WATCH #174` (`trig_01FHz2RT8h8oE3LEnsdTiAKy`, into ROOT #6); arm your own.
2. **Watch L11**; answer, merge in order (§5.5), strike marks. Mail posts are slow (each pushes): run batches in the background. Doorbells are rate-limited (~9 a minute).
3. **Close L11** (§5.6): `npm ci` in agent-runner (`--ignore-scripts`), sheet-worker and file-scanner first if the container is fresh; regenerate per manifest order; fleetbundles and newgroup-fresh 0 fail, no SKIP; archive the 29 sessions with rows.
4. **Close T48** (§5.7): merge PR #36 first (U220), merge `main` into the tranche, `module-tests.mjs` and checks, archive the plan, PR `tranche/T48` → `main` merged with the GitHub merge tool. Then the release to biosmoke8 (K3260, K3262) and the walk as administrator and member (K3052); Bob is told it is ready only after that walk passes on every screen (K3296).
5. **Open T49** from the settled draft at once (§5.2), re-tested against T48's Outcome.

## Acts on main or sessions (reviewed acts, §5.8)

- T48's close merges PR #36 (design stream, §5.7 (1), U220) and then `tranche/T48` into `main` by PR with the GitHub merge tool, method merge (§5.7 (3); CLAUDE.md standing direction; standing list `mcp__github__merge_pull_request`); no refusal recorded.
- Deploys and Cloudflare removals (biosmoke8 install, biosmoke7 removal, the site's Worker) are Bob's approval in session each time (K1715; never on the standing list).

## Open with Bob

- **The stewards' contact address** (N923; civicsmith.org and any public release wait on it, K2799, K3296).
- **Translations** (N670's R88, K3190): waiting for "Translation: D, (a)" or another choice.
- **civicsmith.org's DNS and email** (K3060 D14): walked with Bob after T49-23 is proven (K3296).
- **The records-request template's reviewer** (N858).
