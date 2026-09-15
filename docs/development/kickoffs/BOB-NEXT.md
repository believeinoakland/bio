# BOB — resume here. Written 2026-09-14 by BOB #10, replaced at Bob's direction on context budget, not on saturation.

Read `kickoffs/BOB.md` (the role, the closing protocol, the SPAWN-CHIP mechanism), then this.
Every figure below is named to a sha and was measured. **Trust `origin/main` over anything here.**
`docs/architecture/CORPUS-STANDARD.md` governs every design document you touch; `BIO_System_Design.md`
is the level-0 map; read both before any design.

## State at handoff — GREEN, PUBLISHED, SUPERVISED, BUILDING

`origin/main` is `6a093bf`, plancheck 0 fail / 0 warn (44 governed design documents, 0 front-matter
failures; every open row names the design it builds from). Worktree `bio-worktrees/BOB` clean on
`bob-audit` at the tip. No claims held. Decisions: DEC-74 open (escalation-only, blocks nothing).
Running rows at writing: M0-27, M0-28, REC-83, REC-84, CAP-8, FW-17. Queued: M0-29, REC-85, REC-86, REC-87, VF-7, CAP-9, SK-7, SK-5, UI-61, UI-59.

## THE BOARD

| lane | state |
| --- | --- |
| CONDUCT #10 `local_3d50e0be-0359-43dc-9e9d-dc74681a9928` | REPLACING at Bob's direction (70%): told to write CONDUCT-NEXT.md with the head line "Written 2026-09-14 by CONDUCT #10, replaced at Bob's direction on context budget (70%)", carrying live workers AS BRANCH STATE, then stand down verified. **The CONDUCT #11 chip is filed in BOB #10's view (`task_88a19fa7`); Bob clicks it.** If CONDUCT #11 exists and holds at its gate, re-drive it when the head line is on origin/main and CONDUCT #10 is idle. |
| CONDUCT's workers | separate sessions on their own branches — REC-83 (content reads), REC-84 (frontmatter + version legs), CAP-8 (Drive handler), FW-17 (reading position, IC-86 on I2), M0-27, M0-28. They are nobody's to stop; CONDUCT #11 integrates their reports from the branches. |
| DIST #2 `local_4c19f0d1-dd7c-4248-84bf-20fffac0e864` (visible, chip-born) | idle; HOLDING for the isolation plan until the member surfaces are designed (Bob's sequencing). |
| FLEET #1 `local_29026fd5-dc77-4bfc-b9c4-476b558e24b8` (headless, INVISIBLE to Bob) | idle; give it a VISIBLE chip-born successor at its next boundary (LIVENESS rule 6). |
| retired, stand-down verified | BOB #9 `local_c0fea7d6…` · CONDUCT #9 `local_27d4b56c…` · old DIST `local_8675a228…` · BOB #8. |

## WHAT HAPPENED ON 2026-09-14 (this session), so you do not re-derive it

1. **Bob's corpus ruling.** The Content Framework had sat 46 days approved, unreferenced by the
   orientation set, never saying what it lacked, while its construct went undesigned. Bob ruled:
   the design corpus describes the system across levels; every design document carries front
   matter — completeness, place in the system, an EXPLICIT incomplete-sections list, a generated
   Contents — always current. Landed: `CORPUS-STANDARD.md` (the standard, §4 rules 1–7),
   `tools/corpuscheck.mjs` inside plancheck, `BIO_System_Design.md` v0.1 DRAFT (15 constructs;
   three homeless: the assistant, publication, distribution — BOB's to write), front matter on all
   44 governed documents (CONDUCT's workers did the owners' groups), and — after Bob asked for
   confirmation the PROCESS was updated too — §4.7 + `kickoffs/CONDUCT.md` "A ROW NAMES THE DESIGN
   IT BUILDS FROM" + `kickoffs/WORKER.md` "Read the design before the code" + M0-30's plancheck arm.
2. **Part II of the Content Framework** was rewritten as a readable design (v0.12) after Bob found
   v0.11 "a changelog", REVIEWED by Bob the same day, and is at v0.13 with his comments folded.
   His comments and where they live: fidelity rises through a person's act (§14.2); an explicit
   link is an earned connection, not a hunch (§14.4); the office formats and Google Drive named
   (§16); every ruling below folded into §14.4 and §18.
3. **Bob's rulings, all 2026-09-14, all indexed** (`node tools/decided.mjs "<words>"`): an
   authored edge is never re-pointed without a member's act, even byte-identical (5.8); a portion
   citation refers only to its portion (5.1); a member may select a portion and type a
   transcription (5.2); a citation naming no part means the whole document, narrowable by a member
   (5.3 — `unstated` withdrawn); a connection points at the specific reference in each document
   and SPECIFICITY IS WORKED FOR — on-point passages only (5.4, two passes); the standard of proof
   attaches to the production, set by the project's bar and the audience — no claim object (5.5,
   Bob "Okay"); eyewitness knowledge is evidence on the member's trust, and ATTRIBUTION at
   publication is the attesting member's choice among group / project / cover / name, anonymity
   valid (5.6, amended); the assistant may mark passages citable (5.7); a Drive link keeps the link
   and the harvest is the OpenDocument export (§16). Full text: `CONTENT-EXTENT-DESIGN-SPACE.md` §5.
4. **Act 6 delivered.** Mechanism option (c); IC-83 (I5, the `content` table) and IC-84 (I3, the
   leg names its extent) ACCEPTED and CHANGING; nine rows in dependency order; REC-82 LANDED — the
   content table exists on the pdf-page and document arms, content-addressed, `stale` one-way, and
   it caught 5.8's forbidden move one level down (re-projection would have re-pointed authored
   citations; the writer now carries the referent forward). COFF-9/COFF-10 landed the OpenDocument
   readers; CAP-7 counted 50 Drive links (a floor); CAP-8 is building the handler.

## PROGRAM A — CONTENT: where it is and what is next

Bob's order — understand → architect → inventory → design the missing pieces → build plan — is
satisfied through piece 1 of Part II §18. **Next for BOB:** (a) the remaining §18 pieces as design +
decomposition: content-grain SEARCH (D-222 stage C — after D-225's caps land; check DEBT), the
general OBSERVATION LOG (piece 3), EXTRACTION BREADTH (piece 4: tables and images as content, the
AI EXTRACT role's scope with SK-7, read-time re-extraction D-319); (b) write the three homeless
level-1 documents the system design names (the assistant and AI roles; publication, audiences and
communications — this one inherits Bob's attribution ruling and DEC-33's deferred ceremony;
distribution); (c) keep folding what lands into Part II (v0.14…) — Bob's standing instruction.
Doctrine still Bob's: DEC-74 (external OCR tier funding); the OpenDocument-vs-OOXML default is
RULED (ODF). Bring him consequences, never mechanism; `decided.mjs` and a grep BEFORE any question.

## PROGRAM B — THE MEMBER SURFACES (interactive with Bob; UX is paramount)

Unchanged from the previous handoff except for today's inputs: the Iterative Case Journey canvas
(`https://claude.ai/code/artifact/113318ef-4539-49c0-9250-0c2c90ba1a32`, favicon 🔁, republish with
`url:`); Bob's vocabulary rulings (investigation = project, focus = objective, question = inquiry,
finding, case = production); the ladder of authored acts; harvest right-sized. **New inputs from
today:** the four attribution levels at publication (member's choice), off-the-record sources
valid, the eyewitness observation as authored content (D-184 with D-194), NARROW and TRANSCRIBE as
member acts (REC-86/87 rowed, need the composer's selection surface UI-61 first), the on-point
refinement of references (machine proposes, member chooses). Where B paused: the first authored act
(standing behind a document), rung by rung. Resume when Bob turns to it. PROGRAM C (multi-instance
isolation) is planned, not built, sequenced after B; DIST #2 holds.

## LEADERSHIP MECHANICS — measured 2026-09-14

- **RE-ARM THREE WATCHES FIRST — they die with the session.** Scripts are in this session's
  scratchpad and are re-created in a minute: (1) push-watch — `git fetch` + `rev-parse origin/main`
  every 60s, emit each new commit, then VERIFY the landing (rebase your worktree, plancheck bare);
  (2) liveness tick — every 20 min, EDGE-TRIGGERED, emit only on WORKER-WAIT shapes (`waitquiet`,
  `until … battery|test|deploy`, `tail -f`) with zero battery/workerd/deploy alive — EXCLUDE
  `rev-parse`/`git fetch` pollers, which are other sessions' watches and fired a false positive
  today; (3) stall alarm — origin/main unmoved > 3 h → one alert. Before calling anything hung,
  read the PROCESS TABLE and its PARENTS (four "wait-shaped" processes today were CONDUCT's own
  branch pollers under its live session).
- **Gates:** `node tools/gates.mjs --explain` classifies; anything outside `docs/` (tools/,
  bio-plane/test/, CLAUDE.md) is FULL-class (~25 min). **Chain the push behind the gate with `&&`
  on a `grep -q '^gates: GREEN'` — a `;` let a RED docs gate through to main once today.** A
  `DECIDED.md` regeneration is owed in any commit that adds marker words (RULED, CORRECTED,
  SUPERSEDED…); `corpuscheck --write <file>` after any heading change; the Status `as of` date
  must not be behind the file's last commit.
- **Do not prefix a not-yet-built op as `op=<name>` in prose** — `op-claims.test.mjs` refuses it;
  the name enters `PLANNED_OPS` with the item that builds it.
- **Chips:** every session Bob might need to reach is spawned through a chip he clicks
  (`spawn_task`), gated on the predecessor's handoff head line on origin/main. The chip appears in
  THIS session's view on THIS machine.
- **Credentials:** GitHub push token minted 2026-09-10, ~90-day expiry (early December).

## THE HEALTH ACCOUNT — this session's errors, so you inherit the lessons

1. I pushed main RED once (f535291 → c4339de): a docs gate failed on op-claims and my command chain
   used `;` where `&&` belonged. Gate, then `grep -q GREEN`, then push — never otherwise.
2. I carried a hand-measured line offset (84) that was wrong (89) because my own later edits moved
   Part I again; CONDUCT's worker measured it. A number in prose is a measurement at a sha or it
   is not a number.
3. My liveness tick fired on another session's pollers; the signature was too broad. Measure the
   parents before calling a wait a hang.
4. I wrote CORPUS-STANDARD §4's rule 7 before rule 6; CONDUCT reordered it.
5. I recorded Bob's eyewitness rule as "actual name unless whistleblower" and he amended it within
   the hour to member-chosen attribution: record a ruling, then ASK if it is complete before
   building on it.
6. Everything right today came from measuring before answering Bob — the framework's 46 days, the
   office formats' status, "forgets" defined from the code. Keep doing that.

## Standing authorizations, unchanged and binding

Tactical calls, sequencing, activation, mechanism, spawning and routing are YOURS — never block on
Bob, never report tactical state (fix it or route it). Bring him only doctrine, his-name risk,
outside effects, in the shape `kickoffs/README.md` defines. `node tools/decided.mjs "<subject>"`
before raising anything. Gate; publish; VERIFY FROM THE REMOTE. Report what was DONE and what was
DECIDED. When Bob hands a determination back, decide it, implement it, record it, tell him.
