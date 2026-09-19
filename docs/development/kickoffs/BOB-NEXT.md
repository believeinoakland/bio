# BOB — resume here. Written 2026-09-19 by BOB #16 (session "Start BOB #16 — architecture lane (standing)", worktree `modest-bartik-920017`).

Read `CLAUDE.md`, then `kickoffs/BOB.md`, then `docs/architecture/BIO_System_Design.md` (once readbudget's map change
lands; see §2), then this. **Everything below is a POINTER measured at writing; re-measure before you act on it.**

## 0. YOUR FIRST ACTS

1. **Archive BOB #16** under D-398's three conditions checked at the moment you act (not running; its worktree
   `modest-bartik-920017` porcelain EMPTY; its tip an ANCESTOR of `origin/main`), then `git worktree remove`, and report
   the disk measured before and after. The volume was at **2.2–2.9 GiB free** during this session. Watch it.
2. **Measure every live session's context** (`get_usage`); over 60% → it writes its handoff and you file its successor.
3. `node tools/owed.mjs BOB`, `node tools/plancheck.mjs`, `node tools/status.mjs --check`; tell CONDUCT, SCHEDULER,
   DIST and FLEET you are up.

## 1. WHAT THIS SESSION LANDED (each on `main`; `git log --oneline --grep "bob #16"`)

- **D-431 RULED** and folded into `BIO_Publication_v0_1.md` §3 rule 2 (second note): `op=ratify` publishes a FINDING only at
  a sha a RATIFIED case pins; any other bundle only as EVIDENCE a pinned finding rests on; what crossed stays, COUNTED.
- **FLEET's scratch questions**: a scratch purge takes scratch IDENTITY, a record purge never does — home
  `BIO_Distribution_v0_1.md` §6 rung 6 (M0-69); a refused `memberadd`'s `proposed` row is §4.7's design (M0-70 states it).
- **Membership v2 §7 item 7.14 — DISCOVERABLE or HIDDEN and the request to join**, designed: owner's recorded act, not a
  document field; every existing project HIDDEN; creator ASKED with nothing preselected (this supersedes BOB #15's
  recommended DISCOVERABLE default — told to Bob as his to overrule); plane fails closed to HIDDEN; three sight levels at
  the ONE predicate; a DIRECTORY read; grant = invitation, the requester joins by checkbox.
- **DEC-63 as amended** (BOB #15 recorded it and never rowed it): over an INQUIRY the run verdict consults no project; a
  PROJECT context keeps its gate. Home: Membership v2 §7, the ruling bullet.
- **A MINTED ID CARRIES NO COUNT** (REC-141's §7.9 gap, `d7ce3f86`, Membership v2 §7): gated prefixes (PROJ, CASE, DRAFT,
  RVG) minted opaque from a CSPRNG; `op=allocid` refuses them; the legacy `EXISTS` residue is a stated limitation. The PROJ
  half is an act owed at REC-141's integration, recorded on its row (`a8854129`) and sent back to its worker; the rest is
  SCHEDULER's item.
- **The review-copy surface VERIFIED** (not Program B's): rowable now WITHOUT export; export waits on DEC-31's in-band
  quartet on `op=reviewcopy` (measured absent: no hash, no floors). Publication §6A.3.
- **The question page's no-project conclusion**: `op=projection`'s single-bundle form publishes it via the one reader
  (`INVESTIGATIVE-SESSION.md` §7.1).
- **CONTRADICTION's IDENTIFY** designed at level 2: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` (governed) —
  pairing in the plane by four keys, judgement as labelled machine work, the false-conflict rate over a fixture as the
  gate. PRESENT and RESOLVE are the NEXT design act, after its item 2's first measurement.
- **Reading budget:** `kickoffs/CONDUCT.md` 96,800 → 21,064 B (M-63: NEW 42 · OLD 42 · control 27 of 42; reviewed by
  CONDUCT #6); `ORCHESTRATION.md` 35,375 → 15,540 B and brought current, read whole and armed; `BOB.md` armed.
  M-64: SCHEDULER exam NEW 39/40 · control 28/40 (its gap is now in SCHEDULER.md step 5). M-65: DIST, FLEET, WORKER each
  40/40 · controls 23–24; and the instrument's own defect (`--allowedTools Read` does not confine an arm), checked back.
- **BOB INBOX — every entry DRAINED by SCHEDULER (0afa7f61)** into rows: D-431 (at 2, spawnable); M0-69/M0-70; the
  no-project conclusion; REC-149/REC-150/UI-70/UI-71 (7.14); REC-145 (DEC-63); UI-68/REC-148/UI-69 (review copy, export last);
  REC-146 → M0-71 → REC-147 (IDENTIFY); M0-72 (mergecarry control arm 5's stale name).

## 2. IN FLIGHT AT WRITING — verify each at the artifact

- **LANDED 2026-09-19: `bob16-verif`**, merged by CONDUCT #6 at `0a4ef56d` (on main at `111f4027`; gate 255/255 · 15665,
  `--strict` 0, UI green, plancheck 0; `register-grammar.control` 11/11 on its tree; both `bob16-*` branches deleted). So
  VERIFICATION.md (24,309 B) and the construct map (48 KB budget) are now READ WHOLE and armed; readbudget reads 24 files.
- **DIST and FLEET corrected** their kickoffs' stale lines (FLEET `8a585611`; DIST on its 0.64.0 cut branch).

## 3. THIS LANE'S OWED WORK, in order

1. **Field counts** of process failures per lane against the 2026-09-18 baseline (M-60's "owed"). No baseline is defined
   anywhere I found; defining it (which failures count, read from which ledgers) is the first act.
2. **Use the corrected exam instrument from now on** (`--disallowedTools Bash Glob Grep`, arms in sibling directories,
   M-65). M-60, M-63 and M-64 were checked back at their transcripts and stand.
3. **PRESENT and RESOLVE** for contradiction, after IDENTIFY's M0-71 measures (SCHEDULER: REC-146 → M0-71 → REC-147; a
   missed threshold comes back here).
4. **RECORD.md (32 KB) and CONTENT-PDF.md (26 KB)** are over budget; their owners cut them. Route via SCHEDULER when those
   areas next wake.
5. **Checks that suites read by NAME**: `skilldoctrine` E3 and `skillpack` F3/F4 quote CLAUDE.md's four-level sentences
   verbatim; `surface-registry` L0 and `corpuscheck` also read it. CONDUCT.md's phrases (mintid, strandedwork, mergecarry
   test and control arm 7) are listed in M-63; VERIFICATION.md's (the D-263 block, `register-grammar` B1–B6, the control's
   anchors) are in `bob16-verif`'s commit.

## 4. DECIDED THIS SESSION, told to Bob as his to overrule

- A new project's creator CHOOSES discoverable or hidden, with neither preselected (supersedes BOB #15's recommended default).
- Every project existing today stays HIDDEN until its owner changes it (§7.9's promise to the people who created them).

## 5. HOW I WAS WRONG — so you are not

1. **My inbox entry named D-431 before its register row reached main**, which drove mintid's D floor off prose and turned
   `main` red until REC-140 landed. Exactly the trap the old CONDUCT.md recorded. Name a new D- id in the inbox only once
   its row is on main, or mint it and write the row in the same commit.
2. **`retirable.mjs` reads STDIN**, not a path argument; my first call hung for two minutes.
3. **A wrapped line defeats an exact string replace** (Membership v2's ruling bullet); use a whitespace-tolerant match
   and assert the count.
4. **I wrote "below" about an inbox entry SCHEDULER had already drained** — caught before the push by checking. A pointer
   to the inbox is a pointer to a moving file.
5. **The push guard fired three times on a stale `DECIDED.md`**: CLAIMS.md and QUEUE.md are in the ruling corpus.
   Regenerate immediately before every push, after the last rebase.
