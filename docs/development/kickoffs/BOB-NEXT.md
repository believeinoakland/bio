# BOB — resume here. Written 2026-09-15 by the outgoing BOB, replaced at Bob's direction on context budget (78%), not on saturation.

Read `kickoffs/BOB.md` (the role, the closing protocol, the SPAWN-CHIP mechanism), then this.
Every figure below is named to a sha and was measured. **Trust `origin/main` over anything here.**

## State at handoff — GREEN, PUBLISHED, SUPERVISED

`origin/main` carries the Content Framework v0.11 landing (`bbfffdf`, "content: the Content
Framework is the authority") on `069365e`, plus this handoff commit. `node tools/plancheck.mjs`
0 fail / 0 warn at writing. Worktree `bio-worktrees/BOB` left clean on branch `bob-audit` at
the tip. No claims held. Decisions: DEC-74 open (escalation-only, blocks nothing); DEC-33's
re-entry put to Bob 2026-09-14 and UNANSWERED (see below).

**You are the LEADING session** (Bob, 2026-09-10) and ORCHESTRATION.md's LIVENESS section
(rules 1–6) makes the reconciliation tick your DUTY. The IS build plan is COMPLETE (VF-4
landed 2026-09-13, `cd11250`; 43/43 rows); the CASE arc is DONE; DIST's backlog is EMPTY and
DIST #2 holds its lane on instruction. There is no critical-path build running. The work is
now two DESIGN programs Bob is driving with this session, below.

## THE BOARD

| lane | state |
| --- | --- |
| CONDUCT #9 | active; integrates continuously; owes the drain of BOB INBOX acts 1–8 (QUEUE.md, entry 2026-09-15) incl. act 7 = the `CLAUDE.md` content-section pointer to Part II (patch text is IN the act) and act 8 = mergecarry, now CLEARED (`66e3191`) with D-335 filed |
| DIST #2 (visible, chip-born) | lane empty; HOLDING for the isolation plan — do not start it until the member surfaces are designed (Bob) |
| FLEET #1 (headless, INVISIBLE to Bob) | plan share complete; watcher armed on new FLEET work; give it a VISIBLE chip-born successor at its next boundary (rule 6) |
| queued, deliberately | D-329+D-331+D-333 (parked, diminishing returns); VF-7 (waits on the next DIST deploy); SK-5 (blocked on a surface registry) |

## PROGRAM A — CONTENT (Bob: "content is at the very heart of the system")

Bob's direction, 2026-09-15, verbatim in spirit: understand content's ROLE first, then the
FORMS/TYPES it supports, then what is already DESIGNED to support them, then how it is
ORGANIZED and ACCESSED — and only once "fully understood, architected, inventoried, and the
missing pieces designed" can there be a complete build plan. He also directed that the
Content Framework be UPDATED as the construct develops and FOLDED CENTRALLY into the
documents that define the system. That direction REOPENS D-164 (the record showed it parked
on him) — recorded on DEBT D-164, MILESTONES, kickoffs/BOB.md.

Landed: `docs/architecture/BIO_Content_Framework_v0_10.md` extended IN PLACE to **v0.11** —
Part I unchanged line for line (file keeps its `v0_10` name so every `framework:LINE`
citation stays exact); **Part II (§§14–19)** is the single authoritative content design:
§14 role and model, §15 forms inventory (16 forms, build status), §16 extraction as built
(tier-3 VERIFIED connected and taken on the project instance; the `index.mjs:5055-5063`
comments are stale — inbox act 1), §17 access inventory (add/search/refer/consume ×
document/reference/content grain), §18 the central gap stated once — *the address exists
(IC-1's `source` union, emitted); no edge carries it* — and the SIX pieces to design, §19
who defers to it. Pointers landed everywhere except `CLAUDE.md` (act 7). **Part II is
marked DRAFT AWAITING BOB'S REVIEW; the file was sent to him 2026-09-15. Ask whether he has
reviewed it before designing on it.**

Next, in his order: (1) Bob reviews Part II; (2) the DOCTRINE items in
`docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §3 go to him (whether a content-grain leg
may claim more on the CONNECTION axis; member transcription = derivation or verification;
`unstated` as a legal extent; D-161 determining pair; the CLAIM object's standard of proof;
D-184 firsthand observation; DEC-24's boundary for an AI extractor writer); (3) YOU decide
the MECHANISM — the outgoing BOB's lean, not ruled: **option (c), the hybrid: a content row
minted lazily on first edge, content-addressed `hash(capture_sha, canonical extent, chain)`**,
one target vocabulary for every leg, dedup by construction, no allocator; (4) then ICs on
I5 and I3 (I2 only if readings gain position), items on RECORD's ground, through the inbox;
(5) the remaining §18 pieces — content-grain search (D-222 C after D-225 caps), the general
observation log, extraction breadth (readers beyond three; tables/images; AI EXTRACT), the
D-194 lead — decomposed; (6) THEN the build plan. Hard dependency to carry: content-grain
CONNECTIONS are impossible under any option until `reading_refs` carries WHERE a reference
was read (FRAMEWORK's `docprofile/`, I2). Keep folding what is decided into the framework
(v0.12…) — that is Bob's standing instruction, not a one-off.

## PROGRAM B — THE MEMBER SURFACES (interactive with Bob; UX is paramount)

The working model is published: **The Iterative Case Journey**,
https://claude.ai/code/artifact/113318ef-4539-49c0-9250-0c2c90ba1a32 (favicon 🔁, keep it;
republish by passing `url:`). Rulings Bob made in this session, all his, none in DECISIONS.md
because they are design vocabulary, so they are recorded HERE:

- **Roles** = professional roles (reporter, activist, city auditor, lawyer…) = the record's
  eight AUDIENCES; **functions** = investigate → make the case → report, progressed as an
  ITERATIVE loop — forward by default, able to return to an earlier phase when a development
  demands it. Nothing new: "as you found in your research."
- **Members read "investigation" and "focus"; the record keeps its nouns:** investigation =
  `project`; focus = the project's `objective` (REVISABLE — a project is a promote, revising
  it is a normal act); question = `inquiry` (nests); finding = a concluded inquiry; case = a
  production of the investigation (DEC-72). These are LABELS over settled structure, never
  new objects ("focus" is also the RETIRED middle name of inquiry — never reuse it near one).
- **One shared archive per group** (doctrine, Membership v2 §2): an investigation is a
  focus-driven LENS over it, not a container; evidence is shared, only thinking is scoped.
- **Focus is a property, not a phase.** The loop is harvest → inquiry → conclude → check →
  publish, run INSIDE the investigation. **Harvest is right-sized:** a light, recurring,
  mostly-machine act of getting a document in ("a search that returns documents has not
  finished" — one process at four altitudes); the gravity is on the member's AUTHORED acts.
- **The seam:** published is one-way (DEC-19); "return" after publish = a new numbered
  edition (DEC-12). Confirmed by Bob.
- **The design thesis (Bob accepted the direction):** the journey is a LADDER OF AUTHORED
  ACTS of "standing behind" — release a document (collected→verified, `MACHINE_CANNOT_RELEASE`),
  stand behind extracted content (`attesttext`, `resolve`), ground a question (legs, earned
  grades, no AND/OR vocabulary reaches a member), conclude (finding + REQUIRED falsifier,
  never prefilled), accept what CHECK raises (the affirm-each-branch ceremony), ratify (the
  irreversible attestation). Everything the machine/daemon does is the LOOKING that feeds a
  rung. The established harvest division (researched, not designed): assistant may FIND /
  PURSUE / EXTRACT and request capture; in the built path the DAEMON fetches (the AI never
  touches the provenance chain); everything lands `collected`; the member's non-delegable
  act is the release; co-attestation is a LATER member act; `contribute` gates capture, a
  RUN additionally needs project participation (DEC-63); attribution names both actors.
- **Provenance doctrine, restated by Bob and confirmed:** a hop attests "these bytes, this
  URL, this time" and no more; a document is confirmable AS what its chain reaches (the
  city's site → the city's agenda); a reporter's note is the reporter's only if the chain
  reaches the reporter or publication X; undetermined content-authority is STATED, never
  invented; extracted evidence inherits its document's chain and no more.

Design work done and where it lives: the surfaces are built from the M8 construct kit
(T/B/P/J/A/S/U + the assistant); the guiding voice is one rule set (undetermined stated;
sparse says WHICH; inform once at the act, never nag — DEC-69; capability absent, never
greyed; machine proposes, member authors; nothing prefilled). **Honest constraints a guiding
UX must not guide toward:** D-164 (document-grain today), D-184 (firsthand observation has
no home — Bob's reporter-who-attended case), DEC-33 (the publish CEREMONY is deferred on
Bob's own trigger; publication is a bare statement; PL-16 blocked), the public/verify surface
is a stub, the three output-act divergences (certification; persistence of a served
rendering; addressed non-public delivery incl. a named subject contesting — AUDIENCES §10.10,
row 14 = Bob's UNMADE choice). **The virtual shakedown (code map, 2026-09-14) found:** the
member CANNOT complete the journey today — publishing dead-ends in prose, `op=airunopen` is
never called by the app (CHECK is op-only), `civicos-ui/app.html` is dev scaffolding
hard-proxied to `biosmoke7`; the installer front page says "free, no card" while the flow
refuses Free (Paid + card); enroll (plane `setup.mjs`) and sign-in (`app.html`) are different
surfaces; fleet is installed but never read back; sparse states rendered unevenly; a read-only
token silently removes acts; lost-password is a raw dashboard act. These are the UX change
list Bob predicted; none are items yet — they become the decomposition once the design is
agreed.

**Where the design paused:** Bob confirmed the frame and the seam; the next rung to design is
the first authored act (standing behind a document), then rung by rung — but Bob redirected
to PROGRAM A first because content is the heart. Resume B after A's understanding is
reviewed. **The shakedown group:** Bob's own account (Paid), a "shakedown cruise" likely
disposed of later, subject = an Oakland general-obligation bond measure certified as approved
on a 62% vote; it waits on PROGRAM C.

## PROGRAM C — MULTI-INSTANCE ISOLATION (planned, NOT built)

`docs/development/MULTI-INSTANCE-ISOLATION.md`: the collision table (buckets, fleet names,
the member R2 gap, the fresh-check), the verdict (clean via slug substitution; grandfather
`biosmoke7`; no R2 copy of the live instance), lanes, ordering. **Bob's steer:** shared
stateless workers are fine if results are STRUCTURALLY partitioned by instance (a worker
incapable of writing the wrong partition); `agent-worker` is the hard case. Sequence: design
the member surfaces first, THEN engage DIST/FLEET on this. DIST #2 knows and holds.

## LEADERSHIP MECHANICS — measured 2026-09-15

- **Session ids** (re-list before trusting): CONDUCT #9 `local_27d4b56c-77f8-40d6-943f-f6ac0d2d1cd4`
  · DIST #2 `local_4c19f0d1-dd7c-4248-84bf-20fffac0e864` (visible; chip-born 2026-09-13) ·
  FLEET #1 `local_29026fd5-dc77-4bfc-b9c4-476b558e24b8` (headless). Retired, stand-down
  verified: the old DIST `local_8675a228…` (2026-09-13), BOB #8 `local_1c8b1db3…`.
- **VISIBILITY IS A LIVENESS PROPERTY (rule 6, `a7ffe90`):** the desktop app deliberately
  hides programmatically-created sessions; Bob cannot see or interrupt them; a wedged headless
  turn is unrecoverable by anyone. Spawn every session Bob might need to reach through a
  chip he clicks. The chip appears in THIS session's view on THIS machine (Bob once looked on
  the wrong computer).
- **RE-ARM THREE WATCHES FIRST — they die with the session:** (1) push-watch: `git fetch` +
  `rev-parse origin/main` every 60s, emit new commits, VERIFY every landing from the remote
  (plancheck + the row); (2) liveness tick: every 20 min, EDGE-TRIGGERED, emit only on the
  dead-wait signature (wait-shaped `bio` processes with zero battery/workerd/miniflare); (3)
  **stall alarm: `origin/main` unmoved >3h → one alert** — it caught two real hangs this week
  (a 31-hour headless DIST hang; a 3-hour DIST #2 hang) that the tick could not see. Before
  calling a session hung, check the PROCESS TABLE for a live deploy/battery (the outgoing BOB
  once misread a running deploy as a hang). Interrupt protocol: QUEUE the re-drive message
  first, THEN ask Bob for the one click.
- **Rate limits:** Opus 5 weekly resets Fri 04:00 PT; Fable 5 hit the account MONTHLY SPEND
  cap once (only Bob can raise it, claude.ai/settings/usage); sessions kept running, only
  worker SPAWNS died — CONDUCT recorded the deviations.
- **mergecarry:** its corpus arm grades ALL of origin/main's history; an unregistered drop
  reds EVERY gated landing (it is in the DOCS profile too, via `kickoffs/CONDUCT.md`).
  Register rows live in `tools/mergecarry.mjs` `KNOWN_HISTORICAL_DROPS` — CONDUCT's act.
  D-335: the two carry instruments disagree about a same-end drop on a generated file.
- **Gates:** `CLAUDE.md` is outside `docs/`, so touching it makes a landing FULL-class
  (~25 min battery); route a one-line pointer through the inbox instead. This worktree HAS
  `bio-plane/node_modules`; `ocr-worker/` does not (its suite SKIPS, named).
- **Credentials:** GitHub push token minted 2026-09-10, ~90-day expiry (early December);
  stranded local commits are the symptom to look for first.

## THE HEALTH ACCOUNT — the outgoing session's errors, so you inherit the lessons

1. I asked Bob two SETTLED questions (the roles axis; the member/assistant harvest division)
   before researching — run `decided.mjs` and grep BEFORE any design question to him.
2. I over-weighted "harvest" into a heavy phase; the gravity belongs on the authored acts.
3. I treated the content-grain gap as a side constraint until Bob corrected me: content is
   the heart. Read Part II §18 before any design that points at a document.
4. I misread DIST #2's running deploy as a hang (six deploy processes were alive) and I
   twice declared the liveness tick "died" on a bad grep. Measure the process table.
5. I attributed the wasm-loader fix to DIST #2; it was the outgoing DIST's final act. Read
   the author of a commit before crediting it.
6. A study carried a stale D-310 flag from `BIO_DATAPLANE_STATE.md` (written at 0.56.0);
   verify a study's open-item flags against the QUEUE rows before routing them.
7. Bob's structural instincts about the record's lifetime value beat this desk's
   local-consistency instincts every time this week too. When he pushes back, research
   first, then agree or bring evidence.

## Standing authorizations, unchanged and binding

Tactical calls, sequencing, activation, mechanism, spawning and routing are YOURS — never
block on Bob, never report tactical state (fix it or route it). Bring him only doctrine,
his-name risk, outside effects. `node tools/decided.mjs "<subject>"` before raising anything.
Gate with `node tools/gates.mjs`; publish and VERIFY FROM THE REMOTE; the repository is the
channel. Report what was DONE and what was DECIDED. When Bob hands a determination back,
decide it, implement it, record it, tell him what you chose.
