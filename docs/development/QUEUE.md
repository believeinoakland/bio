# The work queue

**The cache of the build plan** (`docs/development/WORK-PIPELINE.md`): the BOB INBOX's undrained entries, then the open
rows IN ORDER. **SCHEDULER owns this file** (`kickoffs/SCHEDULER.md`): it drains the inbox, orders the rows, and marks,
archives and replenishes; **CONDUCT writes one word — a row's `queued` → `running`**, pushed before its worker spawns.
READ WHOLE by every session.

**Statuses.** `queued`: runnable and unclaimed. `running`: a live worker holds an `agent-*` worktree with a claim on the
row's paths — and when none does, the row is UNDETERMINED between `queued` and done-awaiting-integration: read (1) a
`worktree-agent-*` branch whose commits name the item, then (2) the item's block in `CLAIMS.md` (`released:` means it
finished on purpose); only with neither does it fall back to `queued`. `blocked`: cannot run until something outside the
queue moves, and says what. `done` and `superseded` leave for the archive (`node tools/ledger.mjs archive <ID>`). **A
worker reads its own row from `coord` (`node tools/coord.mjs read docs/development/QUEUE.md`; M0-110, corrected by SCHEDULER #14) before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### REC-175 · running — op=promote stores a caller-supplied sha256 unchecked. SPAWNED 2026-09-23 by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 14faa089: store.mjs writes INSERT INTO files (...sha256) with f.sha256 as given and reads newSha from it, no digest computed. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: FIRST of the backlog: a record stating a false digest of its own bytes is CLAUDE.md §2's worst class (the whole product is the trustworthiness of the record), above M0-134's gate honesty (SCHEDULER #15, 2026-09-23; REC-173's worker via CONDUCT #15)
milestone: M6
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (the bundle's anatomy and the Mechanical Verification Law: a stored digest is of the stored bytes), with `CLAUDE.md` §5 (*an equality that costs nothing to produce is not evidence*).
depends-on: none.
scope: promote computes the SHA-256 of every inline text file's bytes and refuses a supplied value that differs, by a new refusal code with its canned translation, before any write; a file with no supplied sha stores the computed one; blob-backed files state what is checked; a census of rows already stored whose digest disagrees with their content is measured and stated, never silently rewritten.
accepts-when: through the op, a mismatched `sha256` is refused by name with the bundle byte-identical after; a matching one lands; the census is in the landing. NEGATIVE CONTROL: drop the comparison, and the `fff…` arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #15 (REC-173's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### REC-176 · running — promote's INSERT OR REPLACE overwrites a repeated snap key. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: store.mjs carries INSERT OR REPLACE INTO manifest twice. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-175 (in the cache), the same op writing what the record cannot support: history the law calls append-only is rewritten in place, CLAUDE.md §2's worst class (SCHEDULER #15, 2026-09-23; M0-132's worker via CONDUCT #15)
milestone: M6
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`, the history law (*"History is append-only; nothing in `_history/` is ever modified"*), with REC-173's migration replay (INVESTIGATIVE-SESSION §11 item 5) as the one ruled replay.
depends-on: none. **If the builder finds a replay other than REC-173's that must re-write a key, that is BOB's to rule before building it.**
scope: promote refuses a `snap_key` already present for the bundle by a new refusal code with its canned translation, before any write; a byte-identical re-send (same files and base) answers idempotently rather than writing; a census of any manifest row already overwritten is stated where measurable, never guessed.
accepts-when: through the op, a second promote reusing a snap key with different content is refused by name and the first version's row is byte-identical after; an identical re-send is a no-op. NEGATIVE CONTROL: restore `INSERT OR REPLACE`, and the collision arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-132's worker's finding via CONDUCT #15, verified at the code; `node tools/mintid.mjs REC`).

### REC-179 · running — a revision can rewrite an inquiry's surfaced_by. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: no refusal comparing a revision's surfaced_by exists in store.mjs; D-78's restamp is gated on base === null. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-178: an attribution the record states falsely is authority-class (SCHEDULER.md step 3), and the rule-2 surfacing row REC-171 writes would then contradict the bundle it describes (SCHEDULER #16, 2026-09-23; DEBT D-121's defect row, placed by LED-7 batch S16-2)
milestone: M7
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 2's reach (the SURFACING ACT is what `surfaced_by` records, decided at the trust boundary), with the D-78 restamp's own stated intent that a revision carries the value forward.
depends-on: none. A replay under §11 item 5's migration paragraph (REC-173) is stated by the builder; anything it does not cover goes to BOB before building.
scope: promote refuses a revision whose `surfaced_by` differs from the current version's by a new refusal code with its canned translation, before any write.
accepts-when: through the op, a revision flipping `agent` to `human`, and one flipping `human` to `agent`, are each refused by name with the bundle byte-identical after; a revision keeping the value lands. NEGATIVE CONTROL: drop the comparison, and the flip arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (DEBT D-121, the defect row of the two sharing that id, verified at the code; `node tools/mintid.mjs REC`).

### REC-177 · running — airunopen accepts a declared bound with no positive allowed. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: no allowance-required refusal in bio-checks.mjs. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-172 (in the cache) as BOB #30 placed it, the same bound fence; below the record-integrity rows REC-175 and REC-176 (SCHEDULER #15, 2026-09-23; BOB #30's inbox entry)
milestone: M9
interface: I3 — a new refusal on `op=airunopen`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *"A declared bound STATES its allowance"* (BOB #30, 2026-09-23; on `main` since `aaf19287`, landed by train `0e7cc03e`).
depends-on: REC-172 (done, `0e7cc03e`).
accepts-when: as the paragraph states it, with its NEGATIVE CONTROL.
added: 2026-09-23 · SCHEDULER #15 (BOB #30's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### M0-136 · running — the eleven never-cache history readers' verdicts vs a live ref. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: only mergecarry carries a REGISTER_PIN (M0-130). Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after M0-135, the same class: a gate test depends only on the code (Bob, 2026-09-23); below M0-135 because no red has been traced to any of the eleven (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*) and §3a condition 1, with `docs/development/VERIFICATION.md` (admitted for M0 by name); M0-130's pin is the precedent.
depends-on: M0-130 (its planted-ref arm and pin are the pattern).
scope: examine each of the eleven for any read of a live ref (`origin/*`, `coord`, `ls-remote`, `FETCH_HEAD`, the current date); each that has one reads a pinned range or HEAD's own history, with a planted-ref arm; each that has none is stated as tree-and-history-only at its site; the table of eleven is in the landing. M0-130's known cost (a drop past the pin is graded by no gate unit) is stated where each pin sits.
accepts-when: every one of the eleven either carries a planted-ref arm proving its verdict identical whatever the live ref holds, or a dated line saying it reads none. NEGATIVE CONTROL: point one pinned unit back at the live ref, and its planted-ref arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-130's worker's class sweep via CONDUCT #16; `node tools/mintid.mjs M0`).

### D-57 · running — resolveLinks tells a self-linked page's target CHANGED. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: store.mjs still states 'the target changed somewhere between the captures bracketing' with no self-reference basis. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: after REC-160, with the read-time claims the record cannot support (CLAUDE.md §2's class): a fabricated sentence about a source, on every self-linking municipal page; below REC-160 because the verdict it carries is right (SCHEDULER #8, 2026-09-21, LED-7 batch S8-2)
milestone: M3
interface: I3 — a fourth BASIS on `op=links&capture=`, never a fourth verdict; the integrator mints and classifies the IC.
design: `docs/development/LINK-FIDELITY.md`, which defines the verdicts and what each basis may claim, with `BIO_Intake_Doctrine_v1_1.md` (link fidelity is construct 2's).
depends-on: none.
scope: the row's fix — `resolveLinks` recognises a pick whose `capture_sha` is `sourceCapture` and states a SELF-REFERENCE basis; and, the same defect one step wider, a `before` and `after` that are ONE capture never read as *changed*. The UI keeps rendering the plane's words.
accepts-when: a self-linking page's self-link reads the self-reference basis, with no *changed* sentence and no doubled hash; a genuine two-capture bracket still reads *changed*. How a liar passes it: dropping the self-link from the answer, so the arm asserts it is still listed and counted. NEGATIVE CONTROL: remove the self-reference test, and the self-link arm fails by name at the *changed* sentence.
added: 2026-09-21 · SCHEDULER #8 (LED-7 batch S8-2; D-57's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).

uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-57» on entering the cache; re-read on `0e7cc03e`: still open.

### D-168 · running — op=cite admits a retired Information bundle. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: no retired-citation refusal in bio-checks.mjs. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: with the claims the record cannot support, directly after D-57 and above D-440: support the record's own judgment withdrew, CLAUDE.md §2's class, a correction to the built cite path (SCHEDULER #15, 2026-09-23, LED-7; BOB #30's ruling)
milestone: M9
interface: I3 — a new refusal on `op=cite`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1, *"A RETIRED ITEM IS NOT CITABLE"* (BOB #30, 2026-09-23, landed at `4355bfda`).
depends-on: none — its design is on `main` (`4355bfda`).
scope: `op=cite` onto a `retired` bundle is refused with a stated code naming the door (cite what superseded it, or re-collect the source); a `source_status: removed` bundle stays citable; a confirmed leg predating the retirement is untouched.
accepts-when: a cite onto a retired Information bundle is refused by name for a member and a machine credential alike; one onto a `source_status: removed` bundle lands; an older leg is byte-identical. NEGATIVE CONTROL: drop the retired check from `op=cite`, and the member arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-168's DEBT row of 2026-08-03; keeps its `D-` id).

### D-440 · running — the image arm's {part} mints on any non-container capture. SPAWNED 2026-09-23 16:31Z by CONDUCT #16 as a local worker (a cloud-session attempt at 16:27Z was stopped and archived before writing anything, per BOB #30's correction). NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: bio-checks.mjs has no office-container gate on the image arm's {part}. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: with the claims the record cannot support, after D-57 and above D-390: a content row naming bytes its document does not hold, minted silently, CLAUDE.md §2's class; D-420 directly after it, the same function (BOB #24: *"one worker can take both"*) (SCHEDULER #9, 2026-09-21)
milestone: M4
interface: I3 — a new refusal on the image arm; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 (*"`{part}` is a member of a CONTAINER's own bytes, and nothing else"*, which names this fence) and §3.4, with `docs/development/CLIENT-RENDERED.md` "DESIGNED 2026-09-21" (an image served beside a page is its own document).
depends-on: none.
scope: the row's named fix: `contentContextFor` tells the checker whether the capture is an office container, from its content type; the image arm refuses a `{part}` on any other capture BY NAME, saying an image served beside a page is its own document to acquire and cite whole; an office capture with no persisted image list keeps its undetermined admission, stated.
accepts-when: a `{part}` on an HTML capture is refused by name, pointing at acquiring the image; a container capture still mints; an office capture with no persisted list is admitted as undetermined, stated. How a liar passes it: refusing every `{part}`, so the container arm must mint. NEGATIVE CONTROL: remove the refusal, and the HTML arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, drained this commit; D-440's DEBT row; keeps its `D-` id).

uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-440» on entering the cache; re-read on `0e7cc03e`: still open.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
