# CONDUCT-NEXT — the resume prompt for CONDUCT #11

**Written 2026-09-14 by CONDUCT #10, replaced at Bob's direction on context budget (70%).**

Read `CLAUDE.md`, then `kickoffs/CONDUCT.md` (your loop — it gained two rules from this
session: "A ROW NAMES THE DESIGN IT BUILDS FROM" (BOB's, with `plancheck` now enforcing it)
and "AN ISOLATED WORKER BRANCHES FROM `origin/main`, NOT FROM THE MAIN CHECKOUT'S HEAD"),
then this. **Then `git fetch origin` and verify every figure below from `origin/main` and the
branches yourself.** This session was replaced WITH SIX WORKERS LIVE, so this file carries
them AS STATE (ORCHESTRATION's LIVENESS rule 1): you re-derive readiness from the branches
and the claims register, never from this file's memory of them.

---

## 1. THE MEASURED STATE, at the handoff commit on `origin/main`, 2026-09-14

| gate | figure | how |
| --- | --- | --- |
| battery | **189/189 suites · 11,629 assertions, exit 0** at `eb4f39a` (the last FULL gate this session ran; `6a093bf` and the handoff commit are docs-only on top of it, gated DOCS) | `cd bio-plane && npm run test:battery`, exit read unpiped |
| coverage | **`--strict` exit 0**, REGISTER FLOOR **974/180/181 EXACT** (read from the merged run's print after each merge — moved 949 → 958 → 959 → 967 → 972 → 974 today), FLEET FLOOR 3/6/8/73 unmoved | `node scripts/coverage.mjs --strict` from `bio-plane/`, `$?` unpiped |
| UI harness | **exit 0** | `node civicos-ui/test/run.mjs` from the REPO ROOT |
| plancheck | **0 fail, 0 warn**, publication half included; **it now FAILS an open row whose scope names no governed design document or IC** (M0-30's arm, `tools/rowdesign.mjs`) | `node tools/plancheck.mjs` bare, after the push |
| corpuscheck | **44 governed documents, 0 fail** — the design corpus frontier is CLOSED (every design under `docs/development/` retrofitted or archived today) | `node tools/corpuscheck.mjs` |
| mergecarry | register pinned at 4 rows; every merge today carried whole or declared with a `Dropped-from-branch:` trailer (two such: `b7f5797`, `ff26024`, both the superseded coverage floor block) | `node tools/mergecarry.mjs` |
| decisions | **1 open (DEC-74, Bob's, escalation-only; provisional running), 0 awaiting enactment** | plancheck |
| id ledger | `mintid --audit --base origin/main` 0 breaks; **two D ids burned today** (D-336 by the driver-estate worker, the one after D-346 by COFF-10) and recorded WITHOUT their tokens in the queue — a queue line naming a register id with no row drives the D floor off prose (the D-277 shape; it bit this session once and `mintid.test.mjs` caught it) | `node tools/mintid.mjs --audit --base origin/main` |
| my own tasks | **ZERO alive — VERIFIED at stand-down**: the ten Monitor watches this session armed were listed and TaskStopped; the six WORKERS are NOT this session's to stop (Bob's direction) and are left running on their branches | TaskStop + re-list |

**Fresh-worktree traps, all loud, none damage:** `npm ci` in `bio-plane/`, `pdf-worker/` AND
`ocr-worker/` (else ~28/189 with `ERR_MODULE_NOT_FOUND`, or `fleetbundles`/`ocr-worker` SKIP by
name and the battery reads low); `agent-worker` needs nothing. Measure your baseline in a
pristine scratch `git worktree add`, never `git stash`.

---

## 2. THE SIX LIVE WORKERS — state, not belief. Verify each from the branch.

Every worker was spawned through the Agent tool with worktree isolation, Opus 5, and a brief
that ends with: commit on the branch, do NOT push, do NOT merge; release the claim INSIDE its
block with a `released: 2026-09-14 …` line carrying the gate figures (D-342's grammar). **THE
CLAIM'S RELEASE NOTE IN `CLAIMS.md` IS THE DURABLE REPORT** — each worker's chat report lands in
CONDUCT #10's transcript, which you cannot read, so integrate from the branch, its commit
message and its released claim. At the handoff every branch head EQUALS the `origin/main` it was
cut from (zero commits) with a dirty tree: **no worker has committed or reported; all six reports
are owed to this file's successor.**

| row | branch | cut from | dirty files at handoff | what it lands |
| --- | --- | --- | --- | --- |
| **REC-83** (RECORD slot) | `worktree-agent-ab4376cc9dd8e78b9` | `8f2023f` | 13 | act 6 item 2: `earnedBasisRegistry` keyed by content row, `op=earnedbasis` per extent stating UNDETERMINED for a portion leg's connection axis, the NEW fixed-key `content` read (it REMOVES `content` from `PLANNED_OPS` in `bio-plane/scripts/op-claims.mjs` — the ledger's arm fails on a PLANNED op that got built), wires `ensureLegContent` (landed uncalled by REC-82); FULL class |
| **REC-84** (RECORD slot, parallel — disjoint regions claimed) | `worktree-agent-ae95c3be71f5bd167` | `9a713f1` | 9 | act 6 item 3: the `extent` frontmatter grammar in C-2.8/C-25.10, the version-leg `content_id` WRITER (REC-82 landed the column without it, deliberately), suggested legs default to `document`; FULL class |
| **CAP-8** (CAPTURE slot) | `worktree-agent-ac12c46e7df4b4d96` | `87f263a` | 8 | the Google Drive host-stack handler (keep the link, acquire the OpenDocument export, refuse the shell BY NAME); **it minted IC-85** (I1, the hop's three facts) — expect it PROPOSED in `INTERFACE-CHANGES.md` for YOU to resolve; a live probe in `biosmoke7`'s scratch was briefed if reachable; FULL class |
| **FW-17** (FRAMEWORK, re-activated as a THIRD dev area) | `worktree-agent-a531b903306a7ed5d` | `6a093bf` | 3 | act 6 item 9: readings carry position (I2 bump — **IC-86 pre-minted on its row**, the worker writes the PROPOSED text; you RESOLVE it, answering for CONTENT-PDF/OFFICE/HTML in writing), then `connections` carry the determining reference pair (D-161) so a portion leg's connection grade is computable; FULL class |
| **M0-27** (background lane) | `worktree-agent-aa79a87a6668b92b0` | `6a093bf` | 0 | the stale BODY sentences the retrofits marked but could not correct, in ten design documents; DOCS class; overlaps M0-28 on three files' Status lines (trivial merge expected) |
| **M0-28** (background lane) | `worktree-agent-a835afee6c274d911` | `6a093bf` | 8 | corpuscheck refuses a Status with more than one `as of` (SK-6's delegation, decided YES), the §3 grammar line, the three benign doubles corrected; FULL class (a tool and a suite move) |

**How to integrate each, the order that worked eleven times today:** `git fetch`; verify the
branch has commits beyond its base and a released claim; `git merge --no-ff --no-edit <branch>`;
resolve keep-both on `CLAIMS.md`/`MEASUREMENTS.md`/`DEBT.md`/`.gitignore`, REGENERATE
`docs/DECIDED.md` (`node tools/decided.mjs` — never hand-resolve it), take MAIN's side of
`REGISTER_FLOOR` in `coverage.mjs` and declare it in the merge message with a
`Dropped-from-branch:` trailer, REBUILD `bio-plane/dist/` (`npm run build` in `bio-plane/`)
whenever a bundled source or the bundle manifest conflicted; commit the merge; bookkeeping
(flip the row `done` with the report's findings on it; convert every owed act in the released
claim to a row/DEBT row/IC amendment in the same turn); `node tools/gates.mjs --full` with the
exit read unpiped; **collapse `REGISTER_FLOOR` to the merged run's OWN print** and re-run
`coverage.mjs --strict` + `test/coverage-provenance.test.mjs` unpiped; `mintid --audit --base
origin/main`; push; `plancheck` bare. Then `git worktree remove --force` the merged worktree.

**Sequencing after they land:** REC-85 (other three arms' `covers`) after REC-83; UI-61 after
REC-83 + REC-84; REC-86/REC-87 after UI-61 (their own ICs minted at spawn); SK-7 after REC-83
and the assistant pilot's EXTRACT scope (SK-6's front matter says [DESIGNED-not-built] in parts
— scope to what exists); CAP-9 after CAP-8 (same capture path); M0-29 (D-343's tally decays)
whenever. **Push BEFORE spawning any dependent item** — the worktree is cut from the REMOTE.

---

## 3. THE INTERFACES — three CHANGING, one PROPOSED, all yours to settle

- **I5 1.11.0 CHANGING** (IC-83 ACCEPTED, AMENDED at REC-82's landing: `page_count` is a
  column; a leg naming a PART of an inquiry is refused and `content_id` is legitimately NULL for
  an inquiry target or a byteless target, STATED which). SETTLED when REC-83 lands and the two
  `content_id` columns go NOT NULL — that NOT NULL move is NOT rowed yet; row it when REC-83 and
  REC-84 have landed and the backfill has run.
- **I3 14.1.0 CHANGING** (IC-84 ACCEPTED). SETTLED when REC-83 and REC-84 land and UI-61
  confirms the composer emits `extent`.
- **IC-86 (I2, FW-17)** — minted, the worker writes the PROPOSED text; RESOLUTION and the I2
  bump are yours; FRAMEWORK is the owner and is active for this one item.
- **IC-85 (I1, CAP-8)** — minted by the worker; expect PROPOSED; RESOLUTION yours.

---

## 4. THE BOARD BEYOND THE SIX

- **Queued and runnable when their dependency lands:** REC-85, UI-61, REC-86, REC-87, SK-7,
  CAP-9, M0-29 (see §2's sequencing). Every one carries its design pointer (M0-30's sweep).
- **UI-60 is a POINTER row** (UI-PLAN's residue, decomposed at UI's next activation — not
  slot-eligible while content is the priority). **UI-59** (the surface ledger 45 days behind)
  is real and small.
- **VF-7** cannot run until the next `deploy.mjs` deploy (DIST's). **SK-5**, **REC-15/UI-17**
  (DEC-33), **CPDF-3** (a DIST deploy) blocked as recorded.
- **DEC-74 open with Bob** — escalation-only, provisional running; never block on it.
- **CAP-7's priority ruling** is on its row: hundreds of the city's documents point at Drive
  files (50 links in a 3.6% PDF sample, ~333 PDFs corpus-wide) — material enough to keep CAP-8
  in its slot, not enough to preempt the D-164 content track.
- **DIST #2 and FLEET #1** are idle standing sessions; nothing of theirs moved today.
  **BOB #10 leads** and re-drives on state; it edited Part II of the framework all day.

---

## 5. THE HEALTH ACCOUNT — this session's own errors, so you inherit lessons not beliefs

- **I spawned two dependent workers from an UNPUSHED merge** (REC-81, COFF-10's first
  spawn). The worktree is cut from `origin/main`, not the local HEAD; REC-81 recovered by
  re-measuring, COFF-10's first worker STOPPED at its premise check (correctly) and had to be
  respawned. The rule is now in `kickoffs/CONDUCT.md`. Merge → gate → PUSH → spawn.
- **An unquoted heredoc mangled a DEBT row and a queue heading** — the shell ate every
  backticked file name; the only symptom was "command not found: formats.mjs" above a
  successful "row written". Quote the delimiter (`<<'EOF'`) and pass variables via `os.environ`.
- **I wrote a burned id's token into a queue line** and `mintid.test.mjs` went red on the D
  floor driven off prose (the D-277 shape) — caught at the gate, never pushed. Name a burned id
  without its token.
- **I resolved REC-81's citation targets from the CURRENT framework file, not the pre-shift
  one** — the row's mapping (§5/§6/"Two directions") was what the stale pointers point at
  today, and its offset (84) was copied from the inbox entry; the worker measured 89 and
  §3/§7/§8.1. An equality that costs nothing arrived in a ROW I wrote.
- **A row helper's accepts-when boilerplate reached REC-81's row** (front-matter arms on an
  item that touches no front matter). The worker ran the controls the SCOPE line named and said
  so. Read every generated row before pushing it.
- **I inserted the SK-6 row INSIDE a prose line** by matching a literal `### ` in a sentence;
  plancheck could not see it. Insert before `\n### `, then grep the heading at line start.
- **I edited a coverage floor by regex and hit a COMMENT's 957 first** — the real key is a
  separate block. `grep -n '^  arms:'` before and after; the strict print is the proof.
- **Two spawns were briefed with stale figures** (a baseline of ~11,284 that had moved; a
  `page_count` column IC-83's prose required but its list omitted); both workers measured and
  reported rather than trusting the brief — the practice held.
- **What the instruments caught for me:** `op-claims` (a DO-internal path written as an op —
  twice, once in my own landed line), `mergecarry` (a floor block taken whole without its
  trailer), `mintid` (the burned token), `corpuscheck`'s not-yet arm (BOB's), FL-10 (every
  bundled edit), the mintid ledger (IC-85/IC-86 minted by two parties an hour apart, no
  collision). Read WHICH arm before you act.
- **Rate limits:** none hit this session (six Opus 5 workers concurrently at peak); the Opus 5
  weekly window resets 04:00 PT and the Fable 5 monthly spend limit is operator-only to raise
  (CONDUCT #9's two dead spawns) — a spawn that dies returns its row to `queued` with the reason.

---

## 6. WHAT LANDED TODAY, for orientation only (verify from the log)

CPDF-17 · CAP-6 · REC-80 · FW-16 · COFF-8 · UI-58 · M0-26 · SK-6 · REC-81 · D-329+D-331+D-333 ·
COFF-9 · REC-82 · COFF-10 · CAP-7 · M0-30 — fifteen items, the design corpus governed end to
end (44 documents), the content row real on two arms, OpenDocument read, the Drive count taken,
and the loop now refusing a row with no design pointer. Four inbox entries drained act by act
(the corpus standard, the two small acts, the Drive ruling, act 6 with its nine rows, the
row-design rule). Two loop rules written where the loop runs.
