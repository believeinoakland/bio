# SCHEDULER-NEXT — the resume for SCHEDULER #13 (written 2026-09-22 by SCHEDULER #12 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below was
MEASURED at this landing (2026-09-22 ~15:30Z). It is a POINTER: re-measure before you rest anything on it. I refreshed at
~68% (the line is 70%, `CLAUDE.md` §4). **WRITTEN FOR A SUCCESSOR WITH NO MEMORY, POSSIBLY IN THE CLOUD:** Bob ordered a
move to cloud-based Claude Code and a second account on 2026-09-22 (BOB #27). What this file says about "the Mac" — the
machine check, `ps`, `npm ci` sizes, local worktrees — applies only if you run there; everything else is in the repository.

## The plan, as I left it

- **THE ORDERING LAW** (Bob, 2026-09-22, `CLAUDE.md` §2; `kickoffs/SCHEDULER.md` step 3): product rows before process
  tooling; a process row is placed only if it CUTS GATE TIME or UNBLOCKS PRODUCT, and may then sit near the head; every
  other process row goes behind the product rows; landings are batched. Within product: a record over-claim before a
  feature (`CLAUDE.md` §2), corrections to just-landed work before new work. BOB #26 confirmed both (keep this order).
- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · M0-99 (`running`) · M0-109 (`running`: the ledger.test
  floor, below) · REC-163 (`running`; CONDUCT's batch 3 was landing it) · M0-106 (DIST's own act, NARROWED to its witness at
  the 0.72.0 cut) · M0-107 · REC-166 · REC-165.
- **Backlog (113), top:** M0-110 (`coord`, TREE-SHARING §1, `depends-on` M0-99) · M0-111 (landing in batches, §2,
  `depends-on` M0-110) · M0-100 (NARROWED by BOB #27 to `MEASUREMENTS.md` and `INTERFACE-CHANGES.md`, `depends-on` M0-111)
  · REC-167 (ratify after a withdrawal commits a stale claim; M10, first product row) · UI-77 · D-85 · the M1-M7
  corrections · the M8 corrections · COFF-13 … D-178 · the features (UI-74 first; D-148/D-149 will join after UI-69) · then,
  BEHIND THE PRODUCT ROWS, M0-104, M0-105, the process rows in their prior order, the older M0 rows, the four blocked rows.
- **`BACKLOG.md` is ~153,550 B of 153,600** (budget 150 KiB KEPT, BOB #26: revisit only with an instance of a spawn delayed
  or misbriefed by a cut row). Every process row at the foot is cut; EVERY PLACEMENT NOW CUTS PRODUCT ROWS from the foot.
- **DEBT.md: 101 open rows. NO DEBT ROW MAY LEAVE UNTIL M0-109 IS ON `main`:** `bio-plane/test/ledger.test.mjs` floors the
  live ledger at `rows.length > 100`, so at 100 every gate reads RED (it did: tree `635ded3c`, 42/43).
- **BOB INBOX — three entries, none drained:** (1) TREE-SHARING (Bob's *"Yes to all 3"*): items 1 and 3 PLACED as M0-110
  and M0-111; item 2 (gates on GitHub's machines) WAITS for BOB #27's `TREE-SHARING.md` §4 (the cloud removes its
  Mac-memory premise); drain the entry once item 2 is placed. (2) D-278 RULED per group. (3) D-148/D-149 RULED.

## Owed acts, in order

1. **CONDUCT's completions** (REC-163; M0-109 if it rode in batch 3; M0-99): ONE commit per batch — the landing sha an
   ancestor of `origin/main` AND the row's work read at the code, `done`, `node tools/ledger.mjs archive <ID>`,
   `node tools/ledger.mjs refill`, `node tools/ledger.mjs invariants`; tell CONDUCT what entered.
2. **Once M0-109 is on `main`, drain both held entries in ONE landing:**
   - **D-148/D-149:** its drain is `origin/scheduler12/row-drafts:held/d148-d149-drain.patch` (a `format-patch` of my
     commit `fe7be641`, which the push guard refuses on any ref because its tree carries that RED record). Regenerate it
     on the current tree rather than applying the stale patch: `lane-scripts/place2.mjs` (D-148 after UI-69, D-149 after
     D-148; the drafts are in the patch), `lane-scripts/drain2.mjs` (the entry to `BOB-INBOX-drained.md`, both DEBT
     dispositions, MILESTONES), then `ledger.mjs archive D-148` and `D-149`.
   - **D-278:** BOB #26's entry: group (1) `unauthenticated` CLOSES IN FACT (REC-79's `NOT_AUTHENTICATED`, C-38.1) — MY
     carry note on its DEBT row says *all five groups stand*, which was WRONG for (1) (I grepped single-line refusals and
     took (1) from the row): correct it in the archived disposition; group (3) the 405s is a stated design exception;
     place ONE row, RECORD M9, keeping D-278's id, as the entry's item 1 states it (before COFF-13, with the refusal
     class), then archive its DEBT row as placed.
3. **TREE-SHARING item 2** when §4 is on `main`: place it as its design then says, and drain the entry.
4. **M0-106:** close when DIST reports the 0.72.0 cut commit and its step-1 line naming the GREEN FULL record it relied on.
5. **THE INTENT LAYER'S TRIGGER** (BOB #25; the Framework's front matter, §12): send its DESIGN act to BOB when
   `node tools/status.mjs 12` reads `12.publish` and `12.accept` BUILT. Unmet at this landing.
6. **LED-7, one landing per wake, batched, after M0-109:** oldest first after the defects — D-175, D-128, D-129, D-134,
   D-147 (the request lifecycle, a design row beside D-148/D-149), D-150, D-153, D-156, D-159, D-165. D-121 and D-124 are
   COLLIDED ids (LED-8); D-64's four questions are BOB's; D-53 is with Bob.
7. **HELD under the law (process rows that pay nothing), not placed:** the retirable control's head declares fourteen arms
   where `ARMS` runs fifteen (the one drafted row in `row-drafts/` on the drafts branch; its id is minted — keep it out of
   the corpus unless you place it); D-441 (`decided.mjs` blind to title-case ruling markers; in `DEBT.md`, fix named).
8. **Not rowed, SCHEDULER's call (BOB #26):** a DIGEST-level duplicate across bundles, `LINK-FIDELITY.md` "The work, in
   order" step 5's cross-bundle check in `op=audit`; place it beside D-179 when its turn comes.

## Mechanics this session paid for — none of them live anywhere but here and the drafts branch

1. **The push guard refuses a commit whose tree carries a RED gate record, on ANY ref**, and reads the working tree's
   `DECIDED.md` even for a drafts-branch push. Park work from a RED tree as a patch on a drafts branch; check a push's
   result before any reset (I chained one and recovered the commit only from the reflog).
2. **`mintid.test` fails when a corpus file names an id above the namespace's highest allocation site** (a `### <ID> ·`
   heading, a `| D-n |` row, a `## M-n ·` entry). Mint only what you place in the same landing.
3. **Cutting to fields is scripted:** `lane-scripts/place.mjs` inserts drafted rows after anchors and cuts from the foot to
   the budget, keeping backticks, quotes and §"anchors" balanced and closing an open bold (a cut inside a quoted section
   name once broke an anchor). The other scripts: `reorder.mjs`, `debtclose.mjs` (door 1 or 2, the prior disposition moved
   verbatim, the read-back checked with `owed.mjs`'s `isClosedDebtRow`), `drain.mjs`, `swap.mjs`, `carryclaims.mjs`
   (both sides of a tail-append conflict in `CLAIMS.md` or `MEASUREMENTS.md`, upstream first), `resolvedone.mjs`.
4. **Every rebase of `QUEUE.md` carries CONDUCT's `running` words**: compare the `running` rows with `origin/main` before
   you push. A row archived on your side and flipped upstream keeps your removal and takes the flip on the next row.
5. **A row cited on `main` can live only on an unmerged branch** (D-278 did): `ledger.mjs find` says "not found"; carry it
   verbatim and route what it needs.
6. **Read a gate only from its completion line** (`N/N suites green · M assertions passing`, then `gates: GREEN|RED`);
   the wrapper's exit status is not the gate's.

## Done this session (verified on the remote)

Archived SCHEDULER #11 (D-398's three conditions, its CronList empty by its own reply). THE RE-ORDER (24 process rows
behind the product rows; M-94). D-278 carried. CONDUCT #12's batch 2 closed (REC-157, M0-97, D-341, M0-81). BOB #26's
group of four drained (D-152, D-164 closed in fact; D-179, D-125 placed); seven LED-7 rows placed; REC-167 placed. M0-109
placed for the floor. TREE-SHARING items 1 and 3 placed as M0-110 and M0-111; M0-101 SUPERSEDED and M0-100 NARROWED (BOB
#27); M0-106 NARROWED to its witness.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. On the Mac: `scutil --get LocalHostName` must print
Sparky-Air, and `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` (check `df -h`); in the cloud, the same `npm ci`.
Arm the self-wake (every 30 minutes, off :00/:30) and its 5-day renewal. SCHEDULER #12 (session
`local_af0e4d84-b9d6-4f2d-95db-3a08c8da97ba`, worktree `.claude/worktrees/festive-agnesi-eb5410`, branch
`claude/festive-agnesi-eb5410`) deletes both its crons before stopping: archive it under D-398's three conditions
re-checked at the moment you act, after its own CronList reads empty by message — or, if you cannot reach the Mac's
sessions, say so to BOB, who can. Then `node tools/ledger.mjs invariants`, then the owed acts.
