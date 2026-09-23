# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### REC-159 · running — APPROVED by Bob ~21:08Z (BOB #31); CONDUCT #17 re-spawns it 2026-09-23 (the earlier worker's permission check refused the membership-op authority change; code only, no live instance). **AN ENROLLED ADMINISTRATOR IS REFUSED §4.9's CUSTODIAL ACTS FROM THEIR OWN SESSION, WITH A SENTENCE THAT IS FALSE OF THEM.** … (whole text: the cut archive)
order: directly before REC-155, on the same `SESSION_OPS` sets and `d270-refusal-truth`'s ROLE literal: a false refusal shipping to a real administrator outranks a determination owed (SCHEDULER #7, 2026-09-21; REC-156's DELEGATION via CONDUCT #10)
milestone: M8
interface: I3 — four ops gain session reach and three a stamped `by`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each act is EVERY administrator's) and … (whole text: the cut archive)
depends-on: none. D-136 and REC-156 are on `main`.
accepts-when: an enrolled administrator performs all four from their session, attributed to them; a member is refused by name. How a liar passes it: widening the class without the roster … (whole text: the cut archive)
scope-amended: + memberset/signeradd/signerset record the server-stamped actor in a new `by` column; existing rows read `not recorded` (BOB #31 21:08Z; attribution lives in the record). The accepts-when gains an arm per op through the op, and its NEGATIVE CONTROL drops one op's stamp.
added: 2026-09-21 · SCHEDULER #7 (REC-156's DELEGATION; `node tools/mintid.mjs REC`).

### REC-162 · queued — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### CPDF-22 · queued — **ONE SHAPE FOR "ADMITTED, BOUND NOT HELD": D-440 (IC-198) answers `undetermined: {level, why}` for an image `{part}`, while D-420 (IC-203/IC-204) answers `image_bound: {determined:false, empty_level, why}` for an image `{page, rect}` — two shapes for one statement on I5 mint answers.** `image_bound` is withdrawn before any client reads it. — owner CONTENT-PDF (D-420's paths).
order: directly after M0-138, first of the product rows, as BOB #31 placed it: no client may read `image_bound` before it goes; after M0-138 because every train pays that tax (SCHEDULER #16, 2026-09-23; BOB #31's inbox entry, drained this commit)
milestone: M4
interface: I5 — `image_bound` withdrawn for `undetermined: {level, why}`, through ONE IC; the integrator mints and classifies it.
design: `docs/architecture/BIO_System_Design.md` §3, construct 12 (UNDETERMINED as a display primitive; D-440's `undetermined` is the record's shape), with BOB #31's ruling of 2026-09-23 (the drained inbox entry).
depends-on: D-420, D-440 (both on `land/conduct/c17-batch1`; the train that lands it).
scope: every "admitted, bound not held" mint answer carries `undetermined: {level, why}`; `image_bound` is removed at every producer and reader.
accepts-when: `bio-plane/test/d420-image-page.test.mjs` reads `undetermined.level` and `undetermined.why` for a `{page, rect}` on a pre-change PDF, `d440-image-part.test.mjs` green, and `git grep -n image_bound -- bio-plane civicos-ui` returns nothing. NEGATIVE CONTROL (`nc-d420.mjs`, a new arm): restore the `image_bound` key, and D-420's suite fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's inbox entry, drained this commit; `node tools/mintid.mjs CPDF`).

### REC-182 · queued — **TWO MANIFEST READS ORDER BY `created` ALONE, SO TIED ROWS COME BACK IN AN UNDEFINED ORDER: `op=export`'s `promotions` and `gateFacts`' `manifest`.** Re-read on `91bcea6b`: `store.mjs` lines 30093 and 31072 end `ORDER BY created`; D-171 made `#revisionKind` `created DESC, rowid DESC` and REC-32 the same. Harm UNDETERMINED: no consumer found that picks by position. And State Rules §6 I-20's *"immediately prior recorded snapshot"* does not say what prior means on a `created` tie. — owner RECORD.
order: directly after CPDF-22 (REC-181 is in the cache): the same class D-171 just closed (a correction to just-landed work), the record's own order undefined on a tie; below the promote-integrity rows because no consumer is known to be harmed (SCHEDULER #16, 2026-09-23; D-171's worker via CONDUCT #17)
milestone: M6
interface: none (an order made total, as written); the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6, I-20 (mechanical-writer conformance: the immediately prior recorded snapshot), with D-171's landed `created DESC, rowid DESC` as the precedent.
depends-on: D-171 (its order is the precedent; on `land/conduct/c17-batch2`).
scope: (1) both ORDER BYs gain `, rowid` (write order on a tie); a sweep of `store.mjs` manifest reads for any other untied `created` order, each tied or listed; (2) I-20's text states that on a `created` tie, prior means write order.
accepts-when: in a NEW suite `bio-plane/test/rec-182-created-tie.test.mjs`, through the ops: two manifest rows with an equal `created` come back from `op=export` and the gate in write order on every run; I-20 names the tie rule. NEGATIVE CONTROL (`rec-182-created-tie.control.mjs`): drop `, rowid` from one read, and its arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-171's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs REC`).

### REC-183 · queued — **`op=reinstate` CAN CONFIRM AN EDGE ONTO A RETIRED ITEM: `#edgeTransition` never reads the target's state, so cite, sever, retire, reinstate leaves a CONFIRMED edge on what State Rules §4.1 (D-168) makes uncitable.** Re-read on `91bcea6b`: `store.mjs` `#edgeTransition` (the reinstate/sever door) names no `current_state` and no `RETIRED_NOT_CITABLE`. — owner RECORD.
order: directly after REC-182: the retired-not-citable fence D-168 built and REC-181 closed at promote, one door further, the record claiming what §4.1 forbids (CLAUDE.md §2); a correction to just-landed work (SCHEDULER #16, 2026-09-23; REC-181's worker via CONDUCT #17)
milestone: M9
interface: I3 — `op=reinstate` gains the `RETIRED_NOT_CITABLE` refusal (C-33.39); the integrator classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is NOT citable, for every caller; BOB #30), with D-168's `RETIRED_NOT_CITABLE` (C-33.39) as the one refusal.
depends-on: REC-181 (on `land/conduct/c17-batch2`).
scope: in `#edgeTransition`, when `to === "confirmed"`, refuse `RETIRED_NOT_CITABLE` for any selected member whose `current_state` is `retired`, before any write.
accepts-when: in a NEW suite `bio-plane/test/rec-183-reinstate-retired.test.mjs`, through `op=reinstate`: cite, sever, retire, reinstate is refused `RETIRED_NOT_CITABLE` with the edge still severed; a live target reinstates. NEGATIVE CONTROL (`rec-183-reinstate-retired.control.mjs`): drop the check, and the retired arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (REC-181's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs REC`).

### D-443 · queued — **SEVEN `IN` LISTS IN `store.mjs` CAN STILL BIND MORE THAN D-36's ~100 VARIABLES, AND workerd REFUSES THE WHOLE READ WHEN ONE DOES.** `#contentEarned` binds up to 201 (`CONTENT_EARNED_MAX`) and feeds up to 200 ids to `#attestationsOver` and `#transcriptionsOver`; `#contentStandings`, `earnedBasisRegistry`'s union (binds twice, fails from ~50), `publishedCaseRegistryFor` and the superseded-by `MAX(last_updated)` read have no cap. Found by D-390's sweep (verdict list in `frontier-chunk.test.mjs`'s head). — owner RECORD.
order: directly after REC-183: a read that fails outright past ~100 ids refuses loudly rather than claiming what it cannot support, so it sits below the rows where the record claims too much; D-390's own precedent and suite make it one worker's afternoon (SCHEDULER #16, 2026-09-23; D-390's worker via CONDUCT #17)
milestone: M3
interface: none (the reads answer as before, now at any size); the integrator classifies.
design: `docs/development/RETRIEVAL-SUBSTRATE.md` (reads over the record), with D-36's measured ~100-variable limit and D-390's `IN (SELECT value FROM json_each(?))` as the precedent.
depends-on: D-390 (its binding and its suite are reused; on `land/conduct/c17-batch2`).
scope: each list above binds ONE value, `IN (SELECT value FROM json_each(?))` with `JSON.stringify(ids)`, keeping each read's row source visible to `derivation-bounds.test.mjs`.
accepts-when: `bio-plane/test/frontier-chunk.test.mjs` gains an arm per read, each driven through its op past 100 ids and green; `derivation-bounds.test.mjs` green. NEGATIVE CONTROL (`frontier-chunk.control.mjs`, a new arm): restore one spread `IN (?, …)`, and that read's arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (DEBT D-443, minted by D-390's worker on coord `3c0f5092`; placed by door 2, keeping its `D-` id).

### M0-106 · blocked — **RE-NARROWED 2026-09-23 by SCHEDULER #15 on BOB #30's ruling (`TREE-SHARING.md` §3a condition 3, "What the cut's run is", landed at `4355bfda`): a cut may rely on a GREEN FULL record for its EXACT tree only when that record's run REUSED NOTHING (M0-126 marks such a record a backstop); the `--since` arm is WITHDRAWN.** So `kickoffs/DIST.md` gate step 1 (landed `4f7efed0`) is corrected, and the witness moves to the first cut from a tree holding a backstop record. 0.73.0 and 0.74.0 held none and ran the battery, as the ruling requires. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2), DIST's own act and never a worker slot (SCHEDULER #11 on BOB #25's word, 2026-09-22); re-narrowed by SCHEDULER #15
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 3 (BOB #30, 2026-09-23), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-126 (the backstop mark); then DIST's first cut from a tree carrying a backstop record.
scope: DIST.md step 1 reads: `gates.mjs --full --no-reuse` on the exact tree, or a record for which pushguard's `isBackstop()` (M0-126) is true, NAMED in the cut commit, else the whole battery; `--since` removed (M0-126's worker found step 1 still naming it, via CONDUCT #15); the bumped tree's own gate stays.
accepts-when: a cut from a tree with a backstop record runs no battery and names it; a record whose run printed any REUSED unit, or a `--since`, never satisfies a cut and the battery runs.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1; `node tools/mintid.mjs M0`); re-narrowed 2026-09-23 by SCHEDULER #15 (BOB #30's ruling).

### D-65 · queued — **MONITORING NEVER CALLS THE MONITORING CONTRACTS: `op=monitor` compares raw SHA-256 on every kind of document alike and keeps no** … (whole text: the cut archive)
order: directly after D-60, the same op: D-60 stops the raw-byte noise, this makes monitoring say WHAT changed for the type and keep the negative result; a gap, not an over-claim (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M3
interface: I3 — `op=monitor` answers with the layer it stopped at and graded events; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (*"One public function"*; identical bytes are … (whole text: the cut archive)
depends-on: D-60 (the comparison this extends).
accepts-when: a calendar that lost a meeting inside its window reads `removed` as an `event`, a moved window reads `routine`, and an unchanged tick writes a dated `PRESENT unchanged` … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-65's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-65» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-178 · queued — **`op=audit`'S SWEEP HANDS `checkBundle` NO PUBLISHED REGISTRY: C-21.1 AND C-21.2 NEVER FIRE IN AN AUDIT, AND EVERY CORRECTLY** … (whole text: the cut archive)
order: with the M10 corrections, after D-182 and above the features: the audit DIST's ladder needs clean before a version serves reports correct legs as offenders and skips the checks it exists to run, CLAUDE.md §2's class; last of them because no member reads it (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M10
interface: I3 — `op=audit`'s tallies move; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 5 (*Inheritance is per axis*, C-21.2), with … (whole text: the cut archive)
depends-on: none — `publishedRegistryFor` is built, and the write path's gate facts already pass it.
accepts-when: an audit over a fixture reads a correctly inherited leg clean and an own grade on a published case as C-21.2; the count is recorded before the landing. How a liar passes it: an … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-178's DEBT row of 2026-08-04, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-178» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-74 · queued — **THE ACCEPT CEREMONY IS NOT ON `main`, SO NO SURFACE LETS A MEMBER ACCEPT A MACHINE-PROPOSED READING.** The IS plan's UI-43 … (whole text: the cut archive)
order: the first feature, after D-52: DEC-24's member half — the machine proposes, the member concludes — has no door, and the IS plan recorded it done at 43/43; below the corrections because the status authority claims no ceremony (SCHEDULER #5, 2026-09-21)
milestone: M9
interface: I3 consumer (`op=versionaccept`; `op=versionstrength`'s `independence`) — both built.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (a)–(b), with `docs/archive/IS-BUILD-PLAN.md`'s UI-43 row as … (whole text: the cut archive)
depends-on: none; both ops are built — CHECK AT THE CODE at spawn.
accepts-when: an OR accept requires the per-branch affirmation; a fixture whose two parts share a capture shows that origin before it, and one with independent parts shows NONE; driven against the real … (whole text: the cut archive)
reference: UI-43's original build survives only on `origin/worktree-agent-a9e7e017d06799858` (tip `9706d19e`, 2026-08-09: 2 commits, 9 files, +2,338 lines; `acerRead`, `acerList`, `acerVersion`, `acerSets`, `aiSessionConditions`), six weeks stale and not mergeable; read it as a reference and rebuild on today's `app.html` (CONDUCT #16's measurement on `a13667ee`, 2026-09-23: `versionaccept` 0 times in `app.html`; D-271's plane half requires the affirmation).
added: 2026-09-21 · SCHEDULER #5 (D-397's third branch and D-195, verified at the code; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-74» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-161 · queued — **NOTHING COMPUTES INDEPENDENCE OVER A PARTITION A MEMBER IS STILL PROPOSING, SO D-195's SHARED ORIGIN CANNOT BE SHOWN AT THEIR** … (whole text: the cut archive)
order: 1 of 2, directly after UI-74, which shows the same fact at the accept ceremony (BOB #22, 2026-09-21: SCHEDULER #5's Q1, RULED)
milestone: M9
interface: I3 additive — an IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c) (BOB #22, 2026-09-21).
depends-on: none — `#independenceOf` is built.
accepts-when: two parts sharing a capture read as sharing an origin, independent parts read clean, a one-part partition reads `checked: false`, and the answer equals `op=versionstrength`'s once the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-161» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-75 · queued — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two** … (whole text: the cut archive)
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-164 · queued — **A GROUP CANNOT SAY WHO IT IS BEYOND ITS SLUG: NO DISPLAY NAME AND NO VERIFIED DOMAIN ARE RECORDED OR READ.** … (whole text: the cut archive)
order: the first feature after UI-75 (DEC-24's member half first): the group's public identity, resting on REC-163's public slug read (BOB #24: *"after REC-163"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 additive (the two set acts and the public read) and I5 (two durable values with dated histories); the … (whole text: the cut archive)
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the publishing group's public identity).
depends-on: REC-163.
accepts-when: a bearer and a caller-supplied `by` are refused; an unverified domain never appears in a public read; a well-known file naming another instance reads `mismatched`; the display name appears … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 2, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-164» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-78 · queued — **THE PUBLIC HEADER CANNOT SHOW A GROUP'S DISPLAY NAME OR VERIFIED DOMAIN, AND MEMBERS CANNOT SEE A DOMAIN CLAIM'S VERDICT.** … (whole text: the cut archive)
order: directly after REC-164, which it consumes (BOB #24: *"UI (M7), after 2"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (REC-164's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (a display name shown WITH the slug, never instead of it; a … (whole text: the cut archive)
depends-on: REC-164, UI-77.
accepts-when: against the real plane, a group with a display name shows it beside the slug; an unverified or mismatched domain never appears on the public header, and members see its verdict. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 3, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-78» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-6 · queued — **THE AUTHORED BUNDLE NAMES NO AUTHOR** (MK-3's replacement (i), `MEMBER-KNOWLEDGE-DESIGN.md` §4.1). Today `testify` writes the … (whole text: the cut archive)
order: replaces MK-3 (superseded 2026-09-21), directly above MK-7 and MK-5, which rest on it; BOB #19: *"Build (i) regardless"* — no published byte moves, since MK-1's fence still stands (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 and I5 (the authored provenance document's shape); the builder states additive or breaking, and the … (whole text: the cut archive)
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.1 (the bundle never names its author) and §8's row for … (whole text: the cut archive)
depends-on: MK-1 (built).
accepts-when: a fixture case publishes an observation at `group` level and NO published part — no file, no manifest entry — contains the author's member id, handle or cover: a POPULATION arm over every … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-6» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-7 · queued — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-71 · queued — **CONTRADICTION'S IDENTIFY, 2 of 3: THE FIXTURE AND THE FIRST MEASUREMENT, BEFORE ANYTHING A MEMBER SEES — §7's corpus, the** … (whole text: the cut archive)
order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19); a process row that stays among the product rows because it unblocks REC-147 (Bob, 2026-09-22: no process row unless it cuts gate time or unblocks product — SCHEDULER #12)
milestone: M0 (VERIFY; the acceptance test of item 3 is this item's over-strictness arm)
interface: none — a fixture, a harness and a measurement
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §7 (the over-strictness arm, its corpus and its three negative controls) and §9 item 2.
depends-on: REC-146.
accepts-when: `MEASUREMENTS.md` carries the figures with date, instrument and corpus size; §7's three negative controls run and recorded (a disabled or always-`world` judgement FAILS the … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### REC-147 · blocked — **CONTRADICTION'S IDENTIFY, 3 of 3: THE JUDGEMENT AND THE CANDIDATE TABLE — §5's five labels as labelled machine work through** … (whole text: the cut archive)
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-68 · queued — **THE REVIEW-COPY SURFACES, WITHOUT EXPORT: draft (the project's editors), read (owner/participants, and recipients by secret)** … (whole text: the cut archive)
order: BOB #14's item 8 (13.review-copy), its in-instance surfaces; the plane half is built (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-126's IC-145/IC-146)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (front matter and §6A.3), with the REC-126 → UI … (whole text: the cut archive)
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
accepts-when: the harness drafts, grants, reads by secret, comments and revokes against the real plane, and a revoked secret reads nothing. How a liar passes it: a hidden export path (a … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16 inbox "THREE DESIGNS AT THEIR HOMES", item 6).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-68» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### REC-148 · queued — **`op=reviewcopy` CARRIES DEC-31's IN-BAND QUARTET: a SHA-256 over the canonical bytes it answers, its date, its author, and** … (whole text: the cut archive)
order: DEC-31's in-band quartet, before any review copy leaves the instance (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 additive (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (§6A.3 point 2 and the DEC-31 in-band rule), and … (whole text: the cut archive)
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
accepts-when: for one case edition, the review copy's quartet and the published container's header agree field for field, proved by the SAME function; the hash changes when one byte of the … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 7).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-148» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 8).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-150 · queued — **THE EXCLUSION STATEMENT IS CHECKED BY NOBODY BUT ITS AUTHOR, AND THE SIGNED CASE DOCUMENT DOES NOT SAY SO.** REC-14 built the … (whole text: the cut archive)
order: with the M10 publication path, directly after UI-69 and before D-148: what a published case says about its own completeness, disclosed; designed and NOT BUILT, so a feature below the corrections (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 1)
milestone: M10
interface: I3 — the acknowledgement act and the completeness block's list; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4 (BOB #27, 2026-09-22).
depends-on: none — REC-14's statement and REC-126's review-copy grant are built.
accepts-when: a second participant's acknowledgement lands and is listed in the signed completeness block; a case with none publishes and says so; the author's own acknowledgement is refused … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 1, drained this commit; D-150's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-148 · queued — **A FEE QUOTE IS EVIDENCE, AND THE RECORD HOLDS ONE ONLY AS PROSE: a `received` correspondence entry cannot carry the amount, the** … (whole text: the cut archive)
order: with the M10 case path, after UI-69: the action a case justifies, CivicOS's fourth verb, a feature over built substrate; D-149 directly after it, both beside D-147 as BOB #26 placed them (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 1)
milestone: M10
interface: I3 and I5 — a quote grammar on correspondence and an indexed table; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A FEE QUOTE IS EVIDENCE*, Bob's ruling of 2026-09-22).
depends-on: none — `action` and its correspondence are built.
accepts-when: a quote projects and reads back by counterparty and by request; a revision to zero keeps both entries; a quote answering no `sent` entry, or whose amount is not a number, is … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 drafted it; SCHEDULER #13 placed it, re-verified on `8e2c146c` (BOB #26's inbox entry, item 1; D-148's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-148» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-149 · queued — **A RECORDS REQUEST CANNOT SAY WHICH LAWS GOVERN IT: the action carries no citation of the federal, state or local records laws** … (whole text: the cut archive)
order: directly after D-148, its sibling at M10 beside D-147 (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — the action's citation list; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: none — `action` is built.
accepts-when: a member's list lands and reads back; an action with none reads undetermined, never federal; a machine credential's list is refused by name. How a liar passes it: a citation … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 drafted it; SCHEDULER #13 placed it, re-verified on `8e2c146c` (BOB #26's inbox entry, item 2; D-149's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-149» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-147 · queued — **A RECORDS REQUEST IS ONE ROUND TRIP: `awaiting_response` HIDES THE FEE ESTIMATE, THE WAIVER DECISION, A PARTIAL PRODUCTION AND** … (whole text: the cut archive)
order: directly after D-149, on D-148's entry grammar, which it extends (BOB #27: *"depends-on D-148"*), the M10 action path (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — correspondence entry kinds, a closed outcome vocabulary and a stated due date; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *THE RECORDS-REQUEST LIFECYCLE* (BOB #27, 2026-09-22), bound by D-149.
depends-on: D-148 (the entry grammar it extends); D-149 (a stated due date names one of the action's citations).
accepts-when: a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one dated chain; an entry with no stated due date reads UNDETERMINED; a stated … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 2, drained this commit; D-147's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-149 · queued — **DISCOVERABLE OR HIDDEN (Membership v2 §7 item 7.14), 1 of 4: the OWNER's recorded setting (append-only, latest wins, no** … (whole text: the cut archive)
order: Bob's 2026-09-18 ruling (DISCOVERABLE/HIDDEN), after BOB #14's listed items; the plane half first (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`), I5 for the setting's table
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 (Bob's ruling of 2026-09-18; decided by BOB #16, 2026-09-19).
depends-on: REC-138 (done; `Store#inSight`) — CHECK AT THE CODE at spawn.
accepts-when: through the ops, a hidden project is byte-identical to a nonexistent one at the directory, the request and every act (REC-138's suites green UNEDITED); an uninvited member's … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 1).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-149» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw** … (whole text: the cut archive)
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation … (whole text: the cut archive)
depends-on: REC-149.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### FL-11 · queued — **`agent-worker` NEVER SETS `state.target`, SO ONCE REC-165 LANDED EVERY SUGGESTION IT SUBMITS IS REFUSED `SUGGEST_OUTSIDE_RUN_CONTEXT`.** `submit` sends whatever target the model wrote; `emptyLevelCandidates` gets a null target and the dedup reads `basisversions` with id `""` (`agent-worker/src/index.mjs`, re-read on `df9eb9f9`); the mock `test/plane-suggest.mjs` models neither the context rule nor the principal gate. REC-165's worker's finding, fix named by FLEET #4 (`FLEET-NEXT.md` on `coord`, "The one open FLEET defect"). — owner FLEET.
order: directly before D-260: inert until D-260 dispatches runs, and D-260 would dispatch runs whose every suggestion is refused (FLEET #4: *"place it with D-260 or ahead of it"*) (SCHEDULER #14, 2026-09-23)
milestone: M9
interface: none on the plane — the fleet member's behaviour and its mock; the committed `agent-worker` bundle rebuilds and member bytes move at the next release (DIST's).
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, *Rule 1's target* (a suggestion lands only inside its run's context), with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the credential cascade's member).
depends-on: none — REC-165's refusal is on `main`; `op=airun`'s read returns the run's context.
scope: FLEET #4's four: seed `state.target` at run open from the run's context id (for a PROJECT run, a question the project confirmed-cites, never the project id); `submit` defaults a candidate's target to it; the mock gains the context rule, `SUGGEST_OUTSIDE_RUN_CONTEXT` and the principal gate; a negative control.
accepts-when: against the mock, a run's suggestions land inside its context and one aimed outside is refused by name; the dedup and empty-level readers receive the run's target. NEGATIVE CONTROL: drop the seeding, and the harness suite fails by name.
added: 2026-09-23 · SCHEDULER #14 (FLEET #4's trigger; `node tools/mintid.mjs FL`).

### FL-12 · queued — **`agent-worker` SENDS `op=capturerequest`'s LOCATOR AS `url`, BUT THE PLANE READS ONLY `address`, SO EVERY FLEET INTERNET-LEVEL CAPTURE REQUEST IS REFUSED `CAPTURE_REQUEST_NOT_PUBLIC`.** `agent-worker/src/index.mjs` calls it with `{ run, target, url: t.url }` (re-read on `c5c83dc4`); the fleet mock does not model `address`. REC-168's worker's finding, fix named. — owner FLEET.
order: directly after FL-11, before D-260: inert until D-260 dispatches runs, and every internet-level look a dispatched run asks for would be refused ; ONE WORKER TAKES FL-11 AND FL-12 TOGETHER, one `agent-worker` bundle rebuild, so member bytes move once (FLEET #4, 2026-09-23) (SCHEDULER #14, 2026-09-23; REC-168's finding via CONDUCT #14)
milestone: M9
interface: none on the plane — the fleet member's call and its mock; the `agent-worker` bundle rebuilds at the next release (DIST's).
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5 (`op=capturerequest` takes rule 1; a request names an address), with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6.
depends-on: none — REC-168's gate is on `main` or lands before this reaches the cache.
scope: send `address: t.url` in `agent-worker/src/index.mjs`; the mocks (`harness.test.mjs` and `fanout.test.mjs`) read `address` and refuse a request without a public https address, as the plane does (FLEET #4).
accepts-when: against the mock, a run's internet-level target files a request naming its address; one sent with only `url` is refused by name. NEGATIVE CONTROL: send `url` again, and the address arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (REC-168's finding via CONDUCT #14; `node tools/mintid.mjs FL`).

### D-260 · queued — **A WOKEN RUN IS NOT RE-ENTERED: FL-4's wake has nothing to consume it.** When the daemon completes a capture a run waited on … (whole text: the cut archive)
order: a feature after the rows Bob's priorities ordered (UI-71), above D-126: FL-4's wake and DS-3's and FL-6's halves are BUILT and inert until this caller exists, and I8 leaves PROVISIONAL when it lands (SCHEDULER #7, 2026-09-21)
milestone: M9
interface: I8 (leaves PROVISIONAL); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260 paragraph; the deploy half … (whole text: the cut archive)
depends-on: none — FL-4, `instanceClaudeToken` (`src/tokens.mjs`, DS-3 `2de6f25f`) and FL-6's member half are on `main`.
accepts-when: a run the instance credential opened resumes after its capture completes; a member's run is not dispatched and says so. How a liar passes it: dispatching every woken run and … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; BOB #22's ruling, drained this commit; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-260» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-126 · queued — **THE `per-item` WEIGHT IS DESIGNED AND UNBUILT, SO A QUEUE SELECTION CANNOT BE HANDLED AS A SET.** … (whole text: the cut archive)
order: a feature, after the rows Bob's priorities ordered (UI-71 closes his 2026-09-18 ruling), before the M4/M2 product rows because the queue surface is built and UI-55's ARM 4d already watches for it (SCHEDULER #5, 2026-09-21)
milestone: M4; the surface half M8
interface: I3 — the weight vocabulary and the acts' set form; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §Applying a handler to a selection … (whole text: the cut archive)
depends-on: none.
accepts-when: a selection of three where one item drifted leaves exactly that one listed with its reason and clears the other two, through the ops and on the surface. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-126» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · queued — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-74 · queued — **OAKLAND'S SHARED IDENTIFIER SPACES HAVE NEVER BEEN MEASURED, SO EVERY PROGRESSION CROSSING ITS SYSTEMS COLLAPSES TO GRADE C.** … (whole text: the cut archive)
order: first of the M4 product rows, after D-126: a MEASUREMENT comes before anything built on it, and §8.3 calls it *"one of the highest-value pieces of measurement this project can do"*; a gap, not an over-claim (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M4
interface: none — a measurement; a shared identifier it finds is built under its own row.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries a per-class table — the systems read, N per system, and found in two, found in one or not found, with an example pair where found. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-74's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-74» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-122 · queued — D-161's LAST ACT: A MEMBER CHOOSES THE ON-POINT PAIR OF A CONNECTION (Bob's 2026-09-14 refinement, §5.4) — the act that turns REC-120's honest UNDETERMINED into a definite answer where a member has established which mention is to the point.
order: runnable product work (M4, D-161's last act); REC-120 is done; not on BOB #14's list, which governs only rows added after it (SCHEDULER, first order audit, 2026-09-18)
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5 and I3 — its OWN IC, minted with `node tools/mintid.mjs IC` BEFORE building, against the bases as read at resolution (I5 1.18.0, I3 23.5.0 on `main` when rowed)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT, as corrected 2026-09-18) read with `DEBT.md` D-161 (act 3) and REC-86's NARROW (`op=narrow`, IC-123) — the LEG-side analogue whose rules (member-only, machine proposals labelled, the old retained, nothing claimed that was not established) this act should mirror unless the design says otherwise.
depends-on: REC-120 (DONE — `determining_pair.selection`, `pair_rule` and C-49.4 present on `main`; verify before building).
accepts-when: in M-51's fixture a member choosing the p.9 mention makes a p.9 citation answer REACHED with that grade and a p.2 citation answer outside, through the ops; with no choice made every REC-120 answer is byte-identical; a machine credential cannot choose (refused by name); a choice cannot name a mention the document does not carry; `DEBT.md` D-161 CLOSED; construct-status updated if a claim moves (`node tools/status.mjs --check` then … (whole text: the cut archive)
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «REC-122». A worker READS IT before building.

### D-394 · queued — **A MEMBER WHOSE CASE RESTS ON A PASSAGE IS NEVER TOLD A NEWER VERSION OF ITS DOCUMENT EXISTS.** A refreshed capture's content … (whole text: the cut archive)
order: with the M4 product rows, after REC-122: a gap and not an over-claim (§18.1 says so, which is why no instrument catches it), resting on built substrate — the chain (PL-10) and REC-82's carry (SCHEDULER #6, 2026-09-21, LED-7 batch 12)
milestone: M4
interface: I3 — a read-time answer the builder names; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 — lazily at READ, never at capture; an answer … (whole text: the cut archive)
depends-on: none — `op=versionchain` and REC-82 are built.
accepts-when: a leg citing a passage whose address gained a newer capture reads *a newer version exists* with its candidate or UNDETERMINED; leg, content row and edge are byte-identical … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 12; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-394» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-86 · queued — **A LENS CHANGE LEAVES BIAS DEBT THAT NOTHING RAISES: the comparison is built, its producer is not.** A run records its lens at … (whole text: the cut archive)
order: with the M4 product rows, after D-394 and before D-162: it completes a built construct's half, and a new construct follows the rows completing built ones, as D-162's order line says (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M4
interface: I3 additive — a queue item kind gains its producer; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §The catalogue … (whole text: the cut archive)
depends-on: none — `aiRunRead`'s comparison and REC-8's `overdue-scan` shape are built.
accepts-when: adopting a new revision after a run opened raises one item naming both hashes; an unmoved lens raises none. How a liar passes it: a second comparison in the sweep that agrees … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-86's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-86» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-162 · queued — **A CONNECTION RUNS ONLY THROUGH A NAMED THING, SO TWO DOCUMENTS ABOUT ONE IDEA CANNOT BE CONNECTED. RULED BY BOB (2026-09-21)** … (whole text: the cut archive)
order: with the meaning-layer features (M4), where BOB #23 placed it (after the instrument cluster, which Bob's ruling of 2026-09-22 moved behind the product rows — SCHEDULER #12); after D-394, since a NEW construct follows the rows completing built ones (REC-122 finishes D-161; D-394 reads the built chain) (SCHEDULER #9, 2026-09-21)
milestone: M4
interface: I3 additive, and I5 for the theme's tables; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4 (Bob's ruling of 2026-09-21, its four … (whole text: the cut archive)
depends-on: none — the entity registry, member sessions and covers, and C-54.1's refusal are built.
accepts-when: a member declares a theme with a test and places two documents sharing no entity in it; a declaration without a test is refused; a proposal reads as a hunch; a leg citing the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, drained this commit; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-162» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-76 · queued — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### CAP-11 · queued — DEC-75 ENACTED, act 3 — the export step's CALIBRATION:
order: runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — a measurement before a letter (CLAUDE.md: measure, do not assume)
interface: none — a measurement; if the calibration record needs a home in the chain, that is CPDF-13's calibration shape, reused
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the content-axis staleness rule … (whole text: the cut archive)
depends-on: CAP-10
accepts-when: MEASUREMENTS.md carries the per-format table with N, instrument, command and blind spots; the row records the proposed cap per format with its evidence; `node tools/gates.mjs` … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CAP-11» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-351 · queued — **A GOOGLE DRIVE EXPORT IS NOT BYTE-STABLE, SO ITS `capture_sha` DIFFERS ON EVERY RE-FETCH OF AN UNCHANGED DOCUMENT, AND THREE** … (whole text: the cut archive)
order: after CAP-11, which calibrates the same export step and cites this measurement: the record says LESS than it could, never more, and CAP-7 counted the population small — 22 distinct Drive targets in COFF-6's whole census (M-13) (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M2
interface: I1 — §4c's `digests.determined`, gated today on `profiled_from_text`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §5 (a document's anatomy: regions and digests) … (whole text: the cut archive)
depends-on: none — CAP-8's Drive capture is built.
accepts-when: three exports of one unchanged `.ods` agree on the evidentiary digest while their `capture_sha` differ, and C-18.3 folds them; a changed cell moves the digest. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-351» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### FW-20 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-18, by CONDUCT #4, BEFORE ANY SPAWN — recorded rather than silently undone.
order: runnable since CPDF-19 landed (M2 breadth); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — one content type per measured class (BREADTH §7 row 2), completed
interface: none expected — a content type and its registration; if a reference shape moves it is I2 and the IC is minted before building
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 and its §7 row 2, with §8's controls; M0-32's … (whole text: the cut archive)
depends-on: CPDF-19 (BREADTH §7 row 5 — read-time re-extraction to tier 3; until a directory decodes at all … (whole text: the cut archive)
accepts-when: a staff-directory page FETCHED AND READ yields a type that recognises it, driven end to end through `identify`; **the re-taken decode census is recorded in `MEASUREMENTS.md`** … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «FW-20» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-66 · queued — **A BUDGET OR DATASET HAS NO CONTENT TYPE, AND THE CLASS HAS NEVER BEEN COUNTED.** Bob named it beside four types now built or … (whole text: the cut archive)
order: directly after FW-20, §2's order: row 5 after row 4, a count before any reader (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M2
interface: none — a census class and a read sample; a reader they justify is its own row.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2, row 5 (BOB #24, 2026-09-21) … (whole text: the cut archive)
depends-on: none. Sequence after FW-20 (§2's order).
accepts-when: `MEASUREMENTS.md` carries the class's count with its interval beside the four measured classes, and the read sample with N and what each held, dated with the instrument. How a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-66's DEBT row, narrowed by BOB #24 on SCHEDULER #9's Q3; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### CPDF-3 · queued — **UNBLOCKED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18): its stated blocker, *a DIST deploy*, is false at the artifact** … (whole text: the cut archive)
order: unblocked at this audit (its deploy blocker is false); an M2 live verification, after the product rows above (SCHEDULER, first order audit, 2026-09-18)
milestone: M2
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 "How content is extracted today" (the I2 … (whole text: the cut archive)
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CPDF-3» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-50 · queued — **PROJECT NAME UNIQUENESS IS ENFORCED AT THE WRITE PATH AND NOT IN THE CHECK CATALOG, SO A CORPUS HANDED IN FROM ELSEWHERE CANNOT** … (whole text: the cut archive)
order: with the lower product rows, after CPDF-3: nothing can be WRITTEN wrong, because the write path refuses; this is the conformance half, lower than the write path by the row's own words (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M7
interface: I3 — a catalog check; the integrator classifies any IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §11 item 8, *"Project name uniqueness enforced in the check catalog and at the write path" … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture corpus with two projects differing only in case and spacing is reported by name; distinct names pass; a deactivated collider is still reported. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-50's DEBT row of 2026-07-26; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-50» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-135 · queued — **A LANE'S OWN `gates.mjs` ON A TREE ALREADY RECORDED GREEN TAKES §2d's TREE-KEYED SHORTCUT AND RUNS NO NEVER-CACHED UNIT (with `BIO_GATE_RESULTS=off`), SO A HISTORY- OR REF-READING CHECK IS SKIPPED ON A LANE'S PUSH.** M0-131 closed this for the TRAIN (`gates.mjs --never-cached` on a reused tree, so `main` is covered); a lane's gate is not. M0-131's worker's finding, verified in its report (CONDUCT #16); RE-READ 2026-09-23 by SCHEDULER #16 on `0e7cc03e` (M0-131 landed): NARROWED — with the per-unit record on (the default) §2d does not take the shortcut and the never-cached units run; the bare shortcut stands only with `BIO_GATE_RESULTS=off` (or no `tools/gateresults.mjs`) and no `--with-never-cached`. — owner M0.
order: behind the product rows, first of the process block (moved 2026-09-23 by SCHEDULER #16): re-read at the code, the default path already runs the never-cached units, so this closes a non-default mode, neither cutting gate time nor unblocking product — Bob, 2026-09-22: *"The goal is BIO work; process is overhead"* (was: directly after REC-176, SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 1 (never-cached units always run) and §2 (M0-122's reuse), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-131 (its derived never-cached set and `--never-cached` run are reused).
scope: with the per-unit record off, §2d's shortcut on a recorded-GREEN tree behaves as `--with-never-cached`: it runs the derived never-cached set and records the tree GREEN only when they pass; the printed line says which units ran.
accepts-when: `gates.mjs` on a recorded-GREEN tree with a planted history defect reads RED naming the never-cached unit. NEGATIVE CONTROL: restore the bare shortcut, and the planted arm reads GREEN and fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-131's worker's finding via CONDUCT #16; `node tools/mintid.mjs M0`).

### M0-137 · queued — **SUITES PASS ABBREVIATED COMMIT IDS TO GIT, SO A FETCH THAT BRINGS A COLLIDING PREFIX TURNS A GREEN SUITE RED WITH NO CODE CHANGE.** Re-read on `origin/main` @ `38b49c50`: `bio-plane/test/ledger.test.mjs` `PRE_MIGRATION = "9ea2eb02"` and `STATE_PIN = "de40aa56"`; `bio-plane/test/mergecarry.test.mjs` passes `"e241672"` to `git cat-file`, `auditMerge`, `git show` and the `tools/mergecarry.mjs --commit` CLI. — owner M0.
order: first of the process block, directly after M0-135: a red on `main` from a git object, not the code, is TREE-SHARING §3's alarm to Bob, but no collision has happened, so it sits behind the product rows (SCHEDULER #16, 2026-09-23; M0-136's worker via CONDUCT #16)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-136 (touches the same history readers; on `land/conduct/c16-batch6`).
scope: every commit id a suite passes to git in CODE is the full 40-hex id (`9ea2eb022b5d6490c9e9e96b93037040193084d3`, `de40aa56f5d397666228502132d56756f51ff6b9`, `e2416725d2504485443ea24bb68a00009e886570`); a sweep of `bio-plane/test/` and `tools/` for other short ids passed to git, each lengthened or listed. Prose citations may stay short.
accepts-when: `ledger.test.mjs` and `mergecarry.test.mjs` green with only 40-hex ids in their git calls, and a hygiene arm in `mergecarry.test.mjs` that fails by name on a short id passed to git. NEGATIVE CONTROL: shorten one id back, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (M0-136's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs M0`).

### M0-104 · queued — **A GATE RUN ON A DIRTY TREE RECORDS NOTHING, SO D-293's OWN SHAPE — A RED GATE, THEN `git add -A && git commit && git push`** … (whole text: the cut archive)
order: behind the product rows, the first process row after D-50 (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; it neither cuts gate time nor unblocks product, as a commit-then-gate is recorded already); a correction to D-293 (SCHEDULER #11 on BOB #25's word)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its push-guard section; the dirty-tree … (whole text: the cut archive)
depends-on: none — D-293 is on `main`.
accepts-when: a RED gate on a dirty tree, then `git add -A && git commit` and a push, is refused by name; a dirty run whose tree changes mid-run records nothing and says so; a GREEN dirty … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-104» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-105 · queued — **`docs/development/VERIFICATION.md` STANDS AT 24,572 OF ITS 24,576 B, SO A RULING ABOUT VERIFICATION CANNOT BE FOLDED INTO IT** … (whole text: the cut archive)
order: directly after M0-104, whose line it folds, behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; SCHEDULER #11 on BOB #25's word); RETURNED here by SCHEDULER #14 after M0-107 folded its ruling within budget (`VERIFICATION.md` 24,319 B at `14f1b75e`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §1's reading budget and … (whole text: the cut archive)
depends-on: M0-97 (on CONDUCT #12's batch), whose second specimen this cut folds (BOB #25, 2026-09-22).
accepts-when: the file is at most 22,528 B; every sentence the cut removes is in the archive file verbatim (moved, never lost); the register-grammar suite and its control pass. How a liar … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-105» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-84 · queued — **NOTHING NOTICES WHEN A RETIRED INSTANCE OF A LANE LANDS AFTER ITS SUCCESSOR.** BOB #17 landed `aa5cc98d` (00:48) after BOB #18 … (whole text: the cut archive)
order: behind the product rows, first of the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: a detector neither cuts gate time nor unblocks product; SCHEDULER #12); after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting `kickoffs/BOB.md` rules 4 and 12.
depends-on: none.
accepts-when: a fixture log with an older instance landing after a newer one WARNs naming both; the same log whose late commit touches only the `-NEXT` file does not. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-84» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-85 · blocked — **THE HEARTBEAT MEASURES A STALE TREE.** `conduct-heartbeat` STEP 3 greps `QUEUE.md` in the MAIN CHECKOUT's working tree and … (whole text: the cut archive)
order: behind the product rows with the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*; SCHEDULER #12), M0-81's class (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the heartbeat's own STEP 3 warning … (whole text: the cut archive)
depends-on: Bob's approval of the definition edit (BOB #19 took it to him, 2026-09-21).
accepts-when: a heartbeat run's `queued`/`running` counts equal those of `git show origin/main:docs/development/QUEUE.md` read at that run, and its sweep names the tip it judged.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-85» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-412 · queued — **THE ESTATE AUDITS EXPOSURE AND NOBODY AUDITS RESIDUE: a worktree that is registered, clean, merged and owned by no live session** … (whole text: the cut archive)
order: with the session-hygiene instruments, after M0-84: disk is CONDUCT's binding constraint (M-80 and M-81 each measure ~286 MiB per retired tree) and this names the residue nothing reclaims; below M0-81 and M0-84, which prevent and detect a lane fault rather than a cost (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-398's three conditions asked of a TREE rather than a session.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT in the repo where a suite drives it, the ACT in the harness.
accepts-when: a fixture tree registered, clean, merged and unowned is named RECLAIMABLE with its size; **one a live worker is using is NEVER named** — the over-strictness arm IS the item. … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-412» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-154 · queued — **`kickoffs/RECORD.md` IS 36,709 B AGAINST THE 24,576 B READING BUDGET**, so the lane whose kickoff it is cannot read its own … (whole text: the cut archive)
order: behind the product rows, first of the reading-budget rows (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: an over-budget kickoff costs every RECORD spawn context, not gate time, and blocks no product; SCHEDULER #12); not a defect in the product, cheap and mechanical (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` with CLAUDE.md §1's reading budget — *a file is either READ WHOLE … (whole text: the cut archive)
depends-on: none.
accepts-when: `node tools/readbudget.mjs` no longer warns on RECORD.md; the archived text is byte-identical to what left the live file; no RECORD worker was live during the cut. How a liar … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-154» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### CPDF-21 · queued — **`kickoffs/CONTENT-PDF.md` IS 25,863 B AGAINST THE 24,576 B READING BUDGET**, so the lane cannot read its own instructions … (whole text: the cut archive)
order: directly after REC-154, its class and its precedent: it breaks CLAUDE.md §1's reading budget for a build lane, every CONTENT-PDF worker pays it on every spawn, and it is cheap and mechanical (SCHEDULER #6, 2026-09-21; SCHEDULER #5's handoff)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a … (whole text: the cut archive)
depends-on: none. **Same line as REC-154** (`CUT` in `tools/readbudget.mjs`): whichever lands second re-reads the first.
accepts-when: `node tools/readbudget.mjs` no longer warns on CONTENT-PDF.md and lists it in `CUT`; the archived text is byte-identical to what left the live file. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CPDF`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CPDF-21» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-82 · queued — **NARROWED TWICE ON 2026-09-21: WHAT IS LEFT IS THE OCCUPANCY RULE AT THE INTEGRATOR'S NO-BOB FALLBACK START.** The … (whole text: the cut archive)
order: beside REC-154, the reading-budget class, and after M0-81, which builds the occupancy judgement this rule points at (SCHEDULER #4, 2026-09-21, re-measured; placed by SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget … (whole text: the cut archive)
depends-on: none. Sequence after M0-81.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; the kickoff states the check at the fallback start and cites BOB.md; anything cut is byte-identical in the archive.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry); narrowed 2026-09-21 by BOB #19 and SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-82» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-120 · queued — **`mintid --audit --base` DIFFS `main` ONLY, SO AN ID ALLOCATED ON `coord` IS INVISIBLE TO THE INTEGRATION-SIDE CHECK.** `audit()` (`tools/mintid.mjs`) reads `git diff <base>...HEAD`; since M0-110's cutover every DEBT row, plan heading and ledger archive — the allocation sites — lands on `coord`. Found by M0-110's worker (CONDUCT #14). — owner M0.
order: first of the ledger tooling, before LED-8: an id collision check blind to where ids are now minted is the costs-nothing green, latent until two lanes mint the same id on `coord`; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23; M0-110's finding)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §1 (the state moves to `coord`; every reader follows it), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-110 is done.
scope: the audit also diffs the `origin/coord` range (the ids a branch's coord writes added since its base), reading through `tools/coord.mjs`, and says which side each allocation came from.
accepts-when: an id allocated twice, once on `main` and once on `coord`, is reported as a collision by name. NEGATIVE CONTROL: drop the coord range, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-110's finding, via CONDUCT #14; `node tools/mintid.mjs M0`).

### M0-128 · queued — **`coord.mjs write` REBALANCES THE BACKLOG AFTER EVERY WRITE, A CLAIM OR A STATUS WORD INCLUDED, WHERE BOB #29 RULED THAT ONLY A WRITE CHANGING THE PLAN'S MEMBERSHIP OR SIZE MAY.** `write()` (`tools/coord.mjs`, re-read on `619dfa65`) runs `applyIntent(dir, { op: "rebalance", auto: true })` whenever its `rebalance` option is true, which is the default, whatever the intents; `WORK-PIPELINE.md` §2 names this *"the correction owed (M0)"*. Harmless today (a rebalance conserves every row verbatim), so it breaks M0-110's partition of writers only in principle: a lane's claim can move a plan row it never read. — owner M0.
order: with the ledger tooling, directly after M0-120 and before LED-8: a ruled correction to a landed tool, but WORK-PIPELINE §2 itself says a stray rebalance is harmless, so it neither cuts gate time nor unblocks product and sits behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23; BOB #29's ruling of the same day)
milestone: M0
interface: none
design: `docs/development/WORK-PIPELINE.md` §2, *"WHICH WRITES REBALANCE — RULED 2026-09-23 by BOB #29"*, with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-119 is on `main`.
scope: `write()` adds its automatic rebalance only when an intent changes a plan file's membership or size: `insert`, `row`, `refill`, `archive`, or an `append`, `line` or `replace` whose file is `QUEUE.md`, `BACKLOG.md` or `BACKLOG-LATER.md`; a `status` word, a claim, a handoff or a DELEGATION does not. The explicit `rebalance` intent is unchanged; `coord.test.mjs` gains the arms.
accepts-when: a write of only a `CLAIMS.md` append or a `-NEXT.md` replace leaves both plan files byte-identical even when the backlog is over budget; an `insert` over budget still moves the tail. NEGATIVE CONTROL: rebalance on every write again, and the claim-only arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (BOB #29's ruling in WORK-PIPELINE §2; `node tools/mintid.mjs M0`).

### LED-8 · queued — **SIX REGISTERED ID COLLISIONS: `ledger.mjs find` ANSWERS TWO DIFFERENT ROWS FOR ONE ID.** D-121 and D-124 each name two … (whole text: the cut archive)
order: behind the product rows, first of the ledger tooling (Bob, 2026-09-22: *process is overhead*; SCHEDULER #12): AMBIGUITY STATED, not the record over-claiming — the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), and LED-7 folds around the two rows (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet "The legacy residue" … (whole text: the cut archive)
depends-on: none.
accepts-when: `find` returns BOTH rows for a collided id and SAYS it collided; `mintid --audit` still reads 0 breaks; every existing citation of the four still resolves. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (batch 4; found by CONDUCT #7; no-renumber ruling by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-8» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### LED-9 · queued — **A PIPELINE INVARIANT READS `status.mjs`, SO A DEPENDENT CANNOT BE SEQUENCED ABOVE UNBUILT SUBSTRATE.** P4 fails the plan when a … (whole text: the cut archive)
order: with LED-8, the ledger tooling: preventive, not a live defect — no row is mis-sequenced today, checked by hand. Earned by THREE catches in one day (D-60, D-115, D-116): a row read as done because the thing underneath it was (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`, the law this gate is an arm of, with `WORK-PIPELINE.md`'s P1–P5 … (whole text: the cut archive)
depends-on: none.
accepts-when: a row depending on a construct `status.mjs` reads ABSENT fails the plan NAMING both; one whose substrate is BUILT passes; **a row naming substrate only in prose is UNJUDGED** … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (D-404's fix, ruled by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-9» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-115 · queued — **`corpuscheck.test.mjs` §5 REQUIRES THE LINE `| D-388 |` IN THE LIVE `DEBT.md`, SO THE LED-7 BATCH THAT MOVES D-388, BY ANY** … (whole text: the cut archive)
order: behind the product rows, with the ledger tooling after LED-9 (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*): it unblocks one fold move, D-388's, a question with BOB, so nothing runnable waits on it; it MUST land before the batch that moves D-388 (SCHEDULER #13, 2026-09-22; M0-109's DELEGATION, item 1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none.
accepts-when: the arm passes with D-388 open in DEBT and with D-388 moved to the backlog under its own id, and fails by name with D-388 archived closed while the UNDECIDED set is non-empty. … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (M0-109's DELEGATION to SCHEDULER, item 1; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-115» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-107 · queued — **THE INSTALLER HAS NO SCRIPTED DEPLOY.** `newgroup/DEPLOY.md` documents a dashboard paste of the bundled module, which records … (whole text: the cut archive)
order: with the preventive instruments, after LED-9: DIST's law reads the installer back BY HAND at every cut (`kickoffs/DIST.md` step 9: the embedded version, and `bindings: []` still empty), so nothing ships unverified today; the script moves it from discipline to instrument (SCHEDULER #6, 2026-09-21, LED-7 batch 15)
milestone: M7
interface: I4 — the release artifact's deploy path; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder — *every rung read back … (whole text: the cut archive)
depends-on: none.
accepts-when: a deploy whose read-back differs from the signed bytes, carries another version or shows any binding reports FAILURE by name; a clean one reports the hash it read. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 15; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-107» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-211 · queued — **DIST's GATE STEP 8 SAYS `op=audit` CLEAN, AND ON A RECORD PAST 200 DOCUMENTS A CLEAN FIRST PAGE SATISFIES THAT WORDING.** `op=audit` answers one page (`checked` is the page size, `cursor` non-null means more; REC-57); `kickoffs/DIST.md` step 8 (re-read on `b5ce975a`) reads only *"`op=audit` clean."* Latent until an instance passes 200 documents. — owner DIST (its own kickoff).
order: behind the product rows with DIST's instruments, directly after D-107: preventive wording, latent today (biosmoke7 holds fewer than 200 documents), so it neither cuts gate time nor unblocks product (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact — a clean audit is every page clean, not the first.
depends-on: none — REC-57's `cursor` and `total` are on `main`.
scope: step 8 reads: `op=audit` walked to a null `cursor`, every page clean (D-200's known findings named), with the pages and `total` stated in the report. DIST's own act; CONDUCT routes it to DIST and briefs no worker.
accepts-when: DIST's next cut report states the audit's pages and `total` and a null final cursor.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-211's DEBT row of 2026-08-05; keeps its `D-` id).

### D-438 · queued — **THE DEC-49 GUARD'S REAL-TREE CONTROL HARNESS `civicos-ui/test/refusal-codes.control.mjs` IS RED: FOUR ARMS FAIL THAT ARE NOT** … (whole text: the cut archive)
order: behind the product rows, FIRST of the instrument cluster, which follows in its prior order (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: no battery runs a `.control.mjs`, so repairing one cuts no gate time and unblocks no product; SCHEDULER #12); with M0-93: a control red on a green `main` measures nothing, D-355's class (SCHEDULER #7, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. D-254 corrected (n2) at `cac06ae7`.
accepts-when: the harness runs to its foot with every arm AS DECLARED, each re-declaration dated at its site. How a liar passes it: re-pinning (r2)/(r6) to whatever prints, so the two … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-438» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-102 · queued — **THREE INSTRUMENTS PASS WHERE THEY SHOULD FAIL.** (1) `bio-plane/scripts/coverage.mjs`: `REGISTER_FLOOR` and `FLEET_FLOOR` … (whole text: the cut archive)
order: directly after D-438, the DEC-49 guard's controls: (3) is a control measuring nothing, D-438's class; (1) and (2) are M0-79's doctrine one file over (SCHEDULER #8, 2026-09-21; CONDUCT #10's routes)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with M0-79's `SLACK` table in the guard … (whole text: the cut archive)
depends-on: none — M0-79 is on `main`.
accepts-when: slack in a coverage floor exits non-zero naming it; an untracked file cannot hide a fall of `r3Fed`; `nc-rec64.mjs` runs every arm AS DECLARED. How a liar passes it: gating … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (verified at the code; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-102» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-93 · queued — **`bio-plane/test/delegations.control.mjs` IS RED ON `main`: ITS A1 AND A6 ASSUME ONE AFFIRMATION LINE PER DELEGATION BLOCK, AND** … (whole text: the cut archive)
order: with D-438, first of the instrument cluster: a control red on a green `main` (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with its M0-51 rule: *never rename a … (whole text: the cut archive)
depends-on: none.
accepts-when: the control reads every arm AS DECLARED on `main` with the two-line block in place, and leaves the tree byte-identical. How a liar passes it: deleting the older line, so the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-93» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-123 · queued — **`pipeline-readers.control.mjs`'S PLANT ARMS WRITE INTO A POINTER, SO THEIR PLANTED ROWS ARE INVISIBLE AND THE CONTROL MEASURES NOTHING.** Since M0-110 `docs/development/BACKLOG.md` on `main` is a 219 B `COORD-POINTER:` line; the control appends ZZ-41..ZZ-45 to it (its 200 B floor passes), and `readState` follows any file that BEGINS with the tag (`isPointer`, `tools/coord.mjs`) to `origin/coord`, so no reader sees a plant (verified at the code on `c5c83dc4`; M0-119's worker's finding). — owner M0.
order: with the instrument cluster, directly after M0-93: a control that cannot fail, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; with `TREE-SHARING.md` §1's reading layer (`BIO_COORD_REF` names a planted ref).
depends-on: none — M0-110 is done.
scope: the control plants through a local ref named by `BIO_COORD_REF` (as `coord.test.mjs` does), never the working tree's pointer, and asserts before arming that the file it plants into is not a pointer.
accepts-when: every PLANT arm reads AS DECLARED, each failing by name with its plant in place, and the tree is byte-identical after. NEGATIVE CONTROL: plant into the pointer again, and the new not-a-pointer assertion fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-119's worker's finding via CONDUCT #14, verified at the code; `node tools/mintid.mjs M0`).

### M0-124 · queued — **THREE CONTROL ARMS DIE ON THE BASE ITSELF SINCE REC-167: `case-edition-conclusion.control.mjs` (d) and (e) and `caselifecycle.control.mjs` (c).** C-65.1 (`CASE_CONCLUSION_MOVED`) now refuses each fixture's ratification before the arm's break is reached, so the arms fail for a reason unrelated to what they declare. D-442's worker's finding, fix named (CONDUCT #14). — owner M0.
order: with the instrument cluster, directly after M0-123: controls that fail on an unbroken subject measure nothing, D-438's class; behind the product rows (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *break only the thing* — a control that moves a second variable refutes nothing.
depends-on: none — REC-167 is on `main`.
scope: re-aim each arm to break only `op=publish`'s use of the conclusion reader, with a fixture whose ratification C-65.1 admits.
accepts-when: each of the three arms reads AS DECLARED: green unbroken, failing by name when armed; the files byte-identical after. NEGATIVE CONTROL: arm each against the unbroken base, and it stays green.
added: 2026-09-23 · SCHEDULER #14 (D-442's worker's finding via CONDUCT #14; `node tools/mintid.mjs M0`).

### D-424 · queued — **`nc-mk4.mjs`'S `machinewide` ARM ANCHORS ON `gate.member == null) return false;`, WHICH NO LONGER EXISTS IN `src/`, SO BOB #14'S VISIBILITY RULING HAS NO LIVE CONTROL.** The rule moved into `Store#leadReach` at REC-129 and REC-132 (`#positionalMember`; `who == null` returns null); the arm's anchor (`bio-plane/test/nc-mk4.mjs`, re-read on `619dfa65`) matches 0 times in `bio-plane/src/`, so the arm cannot arm, and `lead.test.mjs`'s `NEGATIVE CONTROL:` line still records it as run AS DECLARED on 2026-09-18. — owner M0 with RECORD.
order: with the instrument cluster, directly after M0-124: a control that cannot arm measures nothing, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; *break only the thing*.
depends-on: none — REC-129 and REC-132 are on `main`.
scope: re-point the arm at `#leadReach`'s rule (widen the machine read to unfiltered where `who == null`), assert each anchor matches exactly once before arming, re-run the arm, and re-date `lead.test.mjs`'s `NEGATIVE CONTROL:` line with the result.
accepts-when: the `machinewide` arm reads AS DECLARED, failing by name on the member-token and organisation-key arms; the tree is byte-identical after. NEGATIVE CONTROL: restore the stale anchor, and the match-once assertion fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-424's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-94 · queued — **`bio-plane/test/m025-arm-census.mjs` PRINTS AN `UNCLASSIFIED` DRIVER, ONE EXITING NON-ZERO WITH NO PHRASE ITS MATCHER KNOWS** … (whole text: the cut archive)
order: directly after M0-93 and D-438, the two drivers it would turn red on landing: a gate that reports where it should fail cannot fail, M0-79's doctrine on the census side (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the census's own D-333 and M0-78 … (whole text: the cut archive)
depends-on: M0-93, D-438.
accepts-when: a fixture driver exiting 1 with an unknown phrase turns the census exit 1, naming it; the population is stated. How a liar passes it: teaching the matcher the fixture's phrase … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-94» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-380 · queued — **ON A FRESH WORKTREE `ocr-worker`'S SUITE IS SILENTLY UNRUN WHILE THE BATTERY READS GREEN, AND ITS SKIP GIVES A REMEDY THAT** … (whole text: the cut archive)
order: with the instrument cluster, directly after M0-94: a gate reading green over a suite that did not run, M0-79's doctrine on the fleet side; below M0-94 because the `fleet:` line names the dark member on every run (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `MEASUREMENTS.md` M-31 §6: the … (whole text: the cut archive)
depends-on: none.
accepts-when: with only `bio-plane/` installed, the battery runs every fleet suite and names no member dark; a member that truly cannot resolve is told a remedy that works for it. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-380's DEBT row of 2026-09-16, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-380» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-427 · queued — **THE UI HARNESS RUNNER JUDGES A SUITE BY ITS EXIT STATUS ALONE, SO A UI SUITE THAT PRINTS A FAILURE AND EXITS 0 READS `PASS`.** `civicos-ui/test/run.mjs` (re-read on `619dfa65`) prints `PASS` whenever `execFileSync` returns; M0-67's cross-check in `bio-plane/scripts/battery.mjs` (a printed failure with exit 0 is RED, `EXIT/TALLY DISAGREE`) never reached the UI estate. Latent (no UI suite is known to do it), but M0-126 will cache a unit's PASS, so a false one would stop re-running. — owner M0 with UI.
order: with the instrument cluster, directly after D-380: a gate reading green over a suite that failed, M0-79's doctrine on the UI side; below D-380 because no UI suite is known to print a failure and exit 0 (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact, never the absence of an error.
depends-on: none — M0-67's cross-check is on `main`.
scope: `run.mjs` reads each suite's printed tally and fails a suite whose tally reports a failure while it exits 0, naming it `EXIT/TALLY DISAGREE` as `battery.mjs` does, through ONE shared reader rather than a copy.
accepts-when: a planted UI suite printing one failure and exiting 0 turns the harness red naming it; every real suite still reads as today. NEGATIVE CONTROL: drop the tally read, and the planted arm reads PASS and fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-427's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-129 · queued — **`civicos-ui/test/bound-sweep.test.mjs`'S METHOD-HEAD PATTERN SKIPS `async` METHODS, SO AN ASYNC OP'S BOUND IS NEVER SWEPT.** `methodBodies` matches `^ {2}(?:static\s+)?name(` (re-read on `cdfaea39`); an `async` method has no head, so its body is folded into the method above it. Found by D-85's worker (CONDUCT #15). — owner M0 with UI.
order: with the instrument cluster, directly after D-427: a sweep blind to a class of method, M0-79's doctrine; latent, since no swept op is known to be missed today (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a check is evidence only where it can fail.
depends-on: none.
scope: admit `async\s+` (and `static async`) in the head pattern; state which ops, if any, newly enter the sweep and their verdicts.
accepts-when: a planted `async` method with an unbounded read is found and fails by name; every existing verdict unchanged or its move attributed. NEGATIVE CONTROL: drop the `async` alternative, and the planted arm reads clean and fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-85's worker's finding via CONDUCT #15; `node tools/mintid.mjs M0`).

### M0-80 · queued — **FOUR REFUSAL CODES ARE PINNED GREEN BY ABSENCE RATHER THAN BY AGREEMENT** — the plane sends a canned `translation` for … (whole text: the cut archive)
order: with the instrument cluster and NOT beside UI-73, though they were routed together. A fixture narrower than the wire is a check that cannot fail — M0-78's doctrine exactly — whereas UI-73 is a surface correction. CLAUDE.md §5: an equality that costs nothing to produce is not evidence (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none. Measured in `docs/development/MEASUREMENTS.md` M-72 (UI-72, 2026-09-19).
accepts-when: each of the four pins DISAGREES with the plane when the translation is wrong, proved by feeding a wrong one; the narrower-than-wire count is printed per suite and floored. How … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's routed item 4; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-80» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-92 · queued — **`tools/rowdesign.mjs` PASSES A DESIGN POINTER TO A FILE THAT DOES NOT EXIST.** `citations()` drops a full `docs/…md` path … (whole text: the cut archive)
order: with the instrument cluster, after M0-80 and above M0-87: a check that PASSES where it should fail — CLAUDE.md §5's costs-nothing green — where M0-87 is a false WARN; latent today (0 dead paths across `QUEUE.md` and `BACKLOG.md`, measured 2026-09-21) (SCHEDULER #6, 2026-09-21; the D-339 worker's DELEGATION item 4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header: it cannot … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row citing a wrong directory is reported dead by name; the right full path still passes; a bare unique basename still resolves. How a liar passes it: dropping the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-437 · queued — **REC-76's VERDICT READER SAYS IT READS EVERY BOOLEAN-PRODUCING OPERATOR, AND READS SIX: `<=`, `>=`, `instanceof` and `in` are** … (whole text: the cut archive)
order: with the instrument cluster, after M0-92: a reader blind to an operator class but latent, a `gap` as its row classifies it (D-378's precedent), so below the controls red today (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. **Sequence after D-438**: the guard's harness reads the reader's figures.
accepts-when: each operator's reading passes; each moved figure is attributed to the print it came from. How a liar passes it: a floor nudged to fit, so every move cites its print. NEGATIVE … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-437» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-87 · queued — **`tools/rowsubstrate.mjs` SCORES A ROW WHOSE EVERY CITED ANCHOR IS UNRESOLVABLE AS UNCOVERED, so `plancheck` prints a false** … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: an instrument claiming about what it cannot see, the class the cluster closed three of (CONDUCT #8's DELEGATION 2026-09-20 item 2); a WARN, and latent, so below the rows that hide a failure (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row whose only anchor is a bold paragraph is UNJUDGED or judged at document level, never a finding; a row whose resolved section lacks every symbol still is one. How … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-87» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-88 · queued — **`caseproduction.control.mjs` ARM (H) NOW DRIVES THE PARTICIPATION FENCE, NOT THE COMMIT IT DECLARES.** It forges the committed … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: a control proving less than it declares — a second defect in a control the cluster repaired (CONDUCT #8's DELEGATION 2026-09-20 item 3; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a control is evidence only when it FAILS at a … (whole text: the cut archive)
depends-on: none.
accepts-when: the arm reaches the commit; §8's arm fails BY NAME while the four named act-side refusal arms stay green; the control leaves the tree byte-identical. How a liar passes it: a joined project … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-88» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-89 · queued — **`D384_STAYS` WAS MEASURED WHILE `*eachImage` WAS INVISIBLE, so the hand-admitted compensation for the walk's helper blind spot*** … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: D-414's named residue (*"a row of its own and is reported rather than taken here"*, at the census in `derivation-bounds.test.mjs`); an undercount a ratchet cannot catch (CONDUCT #8's DELEGATION 2026-09-20 item 4; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-384 (`node tools/ledger.mjs find` … (whole text: the cut archive)
depends-on: none. **Same file as M0-44** — one worker at a time.
accepts-when: `eachImage` carries a verdict in `D384_STAYS` or `D384_LEAVES` with its reason; the class figure is taken from a printed run, its delta attributed. How a liar passes it: a verdict with no … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-89» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-439 · queued — **TWO MORE SHARED MECHANISMS ARE HAND-KEPT COPIES, NEITHER PINNED.** (1) A READER: `stripComments`, `quotedIn`, `literalsOf`, … (whole text: the cut archive)
order: after M0-89, the instrument cluster's end: copies that agree today, the drift a pin would catch, so debt and not a live defect (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-254's single-homed verdict reader … (whole text: the cut archive)
depends-on: none.
accepts-when: four suites import one reader, three derive their list, every suite's tally unchanged. How a liar passes it: a renamed second copy, so the pin extracts by behaviour. NEGATIVE CONTROL: add a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-439» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-95 · queued — **34 CONTROL DRIVERS LEAVE THEIR PEN IN THE TREE WHEN A RUN FAILS: `nc-rec95.mjs` and `nc-rec129.mjs` never remove theirs, and 32** … (whole text: the cut archive)
order: after D-439, closing the instrument cluster: residue a failed control leaves, a second variable in the next run (CLAUDE.md §5: *break only the thing*), not a false measurement (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its driver law (the D-331 section): … (whole text: the cut archive)
depends-on: none. Sequence with M0-96: whichever lands second re-reads the first.
accepts-when: each fixed driver, forced to exit non-zero, leaves no pen and a clean `git status`. How a liar passes it: removing on exit 0 only, so the forced-red arm is required. NEGATIVE CONTROL: drop … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-95» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-96 · queued — **TWO CONTROL DRIVERS INSTALL SIGINT/SIGTERM/SIGHUP HANDLERS OVER SYNCHRONOUS CHILDREN, SO A STOP SIGNAL WAITS FOR THE END OF THE** … (whole text: the cut archive)
order: directly after M0-95, the same class, a driver's behaviour on an abnormal exit; last of the cluster, because the run still restores, late (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its driver law (the D-331 section): … (whole text: the cut archive)
depends-on: none. Sequence with M0-95.
accepts-when: each driver SIGTERMed mid-arm exits promptly with its subjects byte-identical by sha256 and `cmp`. How a liar passes it: removing the handlers, so the SIGTERM arm asserts the restore. … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-96» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-77 · queued — **`tools/mintid.mjs`' MAIN-GUARD COMPARES `resolve(process.argv[1])` WITH `import.meta.url`, WHICH NODE REALPATHS — so `mintid`** … (whole text: the cut archive)
order: first of the queued M0 rows: a silent exit 0 in the id allocator every lane uses is a costs-nothing green (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — tools' entry guards
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *verify by the positive artifact, never … (whole text: the cut archive)
depends-on: none.
accepts-when: `mintid` run through a symlinked path prints its MINTED line and exits 0, and one run through a path that is not the script exits non-zero or prints nothing BY DESIGN, stated … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (M0-73's worker's finding via CONDUCT #6; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-77» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-118 · queued — **SIX LIVE-VERIFICATION HELPERS READ THE KEYS ONLY FROM A `.env` FILE, SO IN THE CLOUD, WHERE THE KEYS ARE ENVIRONMENT VARIABLES** … (whole text: the cut archive)
order: first of the live verifications, directly before M0-68, M0-69 and M0-70, which run through `vf4-call.mjs`' loader; it pays only once the cloud's network admits `*.workers.dev` (M-99), so it neither cuts gate time nor unblocks product today and sits behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-22; BOB #28's inbox entry, item 2)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `CLAUDE.md` §8: secrets are the … (whole text: the cut archive)
depends-on: none — `loadEnv()` in `fl1-billing-surface-check.mjs` reads `process.env` first and a `.env` found upward second.
accepts-when: each helper, run with the keys in the environment and no `.env`, reaches its first call. NEGATIVE CONTROL: restore `vf4-call.mjs`' file-only read, and that arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #28's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-118» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-68 · queued — **`bio-plane/test/vf4-live-scratch.mjs` ARM 4b-ii STILL ASSERTS D-323's REFUSAL, and D-323 is CLOSED: against any current plane** … (whole text: the cut archive)
order: M0, right after the battery tally: an instrument asserting a closed defect fails against every current plane — a correction to a superseded test (SCHEDULER, 2026-09-18)
milestone: M0 (background lane, holds no slot)
interface: none — a live-scratch instrument's arm; no plane source moves
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the file's own DATED NOTE of … (whole text: the cut archive)
depends-on: none (D-323 done).
accepts-when: arm 4b-ii passes against the current plane with the new spelling asserted and NO refusal, or is retired with W8 named as its successor; the dated note records which, and why … (whole text: the cut archive)
added: 2026-09-18 · SCHEDULER (FLEET's measurement of 2026-09-19, routed by CONDUCT #5; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-68» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-72 · queued — **`mergecarry.control.mjs` ARM 5 REPORTS A FALSE FAIL: its declared mustFail name "the register is the three the sweep found" no** … (whole text: the cut archive)
order: M0; a negative control reporting a false FAIL, with M0-68's class of test corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver
design: `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
accepts-when: `node bio-plane/test/mergecarry.control.mjs` reads all 7 arms AS DECLARED; the control leaves the tree byte-identical; `node tools/plancheck.mjs --local` then BARE. How a liar … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16's message; the fix was named).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-72» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-74 · queued — **`bio-plane/test/curated-producer.probe.mjs` FAILS 9/1 ON `main`: it reads the severance check from `#restsOnLive`'s** … (whole text: the cut archive)
order: M0; a probe failing on main for a moved check, with the other instrument corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a probe's source read
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-267 (`node tools/ledger.mjs` … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/curated-producer.probe.mjs` from `bio-plane/` reads 10 pass, 0 fail; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: widening the read … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (CONDUCT #6's report; fix named; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-74» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-133 · queued — **`tools/fw21-onpoint-probe.mjs` EXITS 2 (`GROUND BROKEN`) ON `main`: ITS OWN CHECK STILL EXPECTS PAGE 2 TO READ GRADE A AND REACHING, WHICH REC-120's RULE NO LONGER GIVES.** Reproduced by SCHEDULER #15 on `91913d6b` (local, no network): page 2 reads `{"grade":null,"reaching":0,"undetermined":1}` — UNDETERMINED until a member chooses the on-point mention (REC-120; REC-122 is that choice) — so the probe's ground check fails before anything it measures counts. Already so on `4355bfda`. Found by REC-171's worker (CONDUCT #15). — owner M0 with CONTENT.
order: with the probe corrections, directly after M0-74 (a probe failing on `main` for a moved rule, its class): a probe, never a gate unit, so it cuts no gate time and sits behind the product rows (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair; REC-120's undetermined answer until a member chooses).
depends-on: none — REC-120 is on `main`.
scope: re-base the probe's ground check on REC-120's rule: page 2 reads UNDETERMINED with no choice made, and reaches only after the probe makes the member's on-point choice (when REC-122 exists) or states that it cannot; page 7 stays `outside`; a dated note at the site.
accepts-when: `node tools/fw21-onpoint-probe.mjs` exits 0 on `main` with page 2 read as UNDETERMINED and page 7 `outside`, and exits 2 if page 7 is ever reached. NEGATIVE CONTROL: restore the grade-A ground check, and the probe exits 2 by name.
added: 2026-09-23 · SCHEDULER #15 (REC-171's worker's finding via CONDUCT #15, reproduced; `node tools/mintid.mjs M0`).

### M0-90 · queued — **MK-1's PUBLISH PROBE CANNOT DRIVE ITS PATH 3, the `op=caseratify` route C-53.12 fences.** Its fixture concludes without naming … (whole text: the cut archive)
order: with M0-74, the probe corrections: a probe path that cannot run, now stated rather than hidden; the measurement a lifted fence will need (SCHEDULER #4, 2026-09-21; MK-3's report, CONDUCT-NEXT §4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/mk1-publish-probe.mjs` prints PATH 3 driven, with C-53.12's refusal code, and no DEAD ARM line for it. How a liar passes it: a path reported driven that … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-90» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-91 · queued — **NO SUITE FEEDS C-2.8 A NON-STRING `content_id`, SO THE ARM THAT CLOSED D-362 HAS NEVER BEEN DRIVEN.** `checkLegExtentGrammar` … (whole text: the cut archive)
order: with the M0 instrument corrections (M0-74, M0-90): a fix with no arm is one refactor from being undone, and what it guards is a SILENT drop (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a check is evidence only where a suite … (whole text: the cut archive)
depends-on: none.
accepts-when: the leg is refused BY NAME at C-2.8 with the parse in the path, and the existing string arms stay green. How a liar passes it: a hand-built leg whose `content_id` is already a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10, D-362's instrument; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-91» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-40 · queued — **AN INFORMATION FIXTURE STILL WRITES `criticality: "notable"`, WHICH C-2.7 REFUSES, THOUGH ITS ROW SAID IT WAS FIXED.** … (whole text: the cut archive)
order: with the probe corrections, after M0-91: a fixture non-conformant for a reason unrelated to what it measures, and a template a later session can copy; no suite is wrong today (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5's *break only the … (whole text: the cut archive)
depends-on: none.
accepts-when: `cite-scale.mjs` builds only conformant Information (C-2.7 passes over its bundles), and each of the three data sites carries its comment. How a liar passes it: changing the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-40's DEBT row of 2026-07-25, re-measured; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-40» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-75 · queued — **`bundle.test.mjs` AND `livefire.test.mjs` PRINT NO TALLY LINE, so every battery headline carries M0-65's "EXCLUDES 2 untallied suite(s)"** … (whole text: the cut archive)
order: M0; M0-65 is ON MAIN (5a6d5913), so runnable: retires its EXCLUDES segment (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — two suites' report lines
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-413 (closed by M0-65) and … (whole text: the cut archive)
depends-on: M0-65 (its EXCLUDES segment and widened tally reader; in CONDUCT #6's gate).
accepts-when: a full battery's headline carries no EXCLUDES segment, and its assertion total rises by exactly the two suites' printed tallies, stated in the landing; `cd bio-plane && npm` … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (M0-65's worker's suggestion, routed by CONDUCT #6; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-76 · queued — `d280-strengthbar.control.mjs` READS NOT AS DECLARED ON EVERY RUN (arm C2 and the severedhomes arms), and D-280's site (a) — the … (whole text: the cut archive)
order: M0, with the instrument corrections; ruled by BOB #16 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver and one suite's arm
design: `docs/development/VERIFICATION.md` (admitted for M0 by name; its one-copy rule), with D-267 and D-280 … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/d280-strengthbar.control.mjs` reads EVERY arm AS DECLARED and the site-(a) arm fails by name; the control leaves the tree byte-identical; the C-6.1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-69 · queued — A WHOLE-STORE PURGE OF THE SCRATCH STORE CLEARS THE IDENTITY TABLES; A PURGE OF THE RECORD STORE NEVER DOES, structurally (BOB … (whole text: the cut archive)
order: M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice (SCHEDULER, 2026-09-19)
milestone: M0 (a live verification that stops measuring the same subject twice is the verification defect)
interface: I3 — behaviour at scratch only; an IC if the op's published answer changes (the integrator classifies)
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6, "What 'swept after' means" (BOB #16, folded … (whole text: the cut archive)
depends-on: none in code.
accepts-when: a scratch purge leaves every enumerated identity table empty; a record-store purge driven through the op leaves `members` byte-identical; a new member-keyed table added to the … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-70 · queued — **VF-4's LIVE-SCRATCH INSTRUMENT STATES ON ITS OWN OUTPUT THAT ARM 2a LEAVES A `proposed` MEMBER BY DESIGN (Membership v2 §4.7)** … (whole text: the cut archive)
order: M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — the instrument `bio-plane/test/vf4-live-scratch.mjs`
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (administrator consensus) and … (whole text: the cut archive)
depends-on: M0-69 (the purge must take scratch identity) and M0-68 (SAME FILE — one worker at a time in `vf4-live-scratch.mjs`).
accepts-when: a run's output carries the statement at arm 2a; after the run, scratch `members` reads empty; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a purge call … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry, item 3; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### VF-7 · queued — CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a … (whole text: the cut archive)
order: M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the … (whole text: the cut archive)
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «VF-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-92 · queued — **`op=file` WITH A MEMBER TOKEN RETURNED AN INTERMITTENT 403 UNDER SEQUENTIAL LOAD** (the live instance, July): a different … (whole text: the cut archive)
order: last of the live verifications, after D-207: a July observation on a plane rebuilt many times since, with no report of recurrence; a bounded measurement that names a cause or retires the claim (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M0
interface: none — a probe; a fix it finds is its own row
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5: *a blocker is a … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the probe with its load, its count and the build; the row closes either way. How a liar passes it: a probe lighter than July's, so the load is stated beside the row's.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-59 · queued — **`contemporaneous`, THE STRONGEST LINK-FIDELITY VERDICT, HAS NEVER BEEN OBSERVED ON REAL DATA, AND MAY BE UNREACHABLE FOR MOST** … (whole text: the cut archive)
order: with the live verifications, after D-92: a measurement deciding whether a verdict arm earns its complexity, not a defect shipping, since `undetermined` is honest meanwhile (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M3
interface: none — a probe
design: `docs/development/LINK-FIDELITY.md`, which defines the verdict and names the establishing routes that … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the per-host table with N, the interval and the build; the row closes either way. How a liar passes it: hosts chosen for static bytes, so the list … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-59's DEBT row of 2026-07-30; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-59» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-66 · queued — `m025-arm-anchor-witness.test.mjs` CLOSES THE COMMENTARY CLASS ON ITS LABEL HALF AND NOT ON ITS ANCHOR HALF — prose in a … (whole text: the cut archive)
order: M0; an instrument producing false findings (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an instrument that penalises a driver for documenting how it … (whole text: the cut archive)
interface: none — `bio-plane/test/m025-arm-anchor-witness.test.mjs`
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: prose in a block comment naming an anchor-bearing shape is NOT read as an anchor; a live anchor in code still is; the reach figures before and after are stated with any … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-64 · queued — M0-41's CONTROL ARM 3 NO LONGER HAS A SUBJECT:
order: M0; a control arm proving less than it declares (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an arm that measures something other than what it declares … (whole text: the cut archive)
interface: none — `bio-plane/test/m041-instrument-census.control.mjs` (a `.control.mjs`, not discovered by the battery)
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: the control's run reports every arm AS DECLARED, or arm 3 is RETIRED with the falsifier's measurement at the site; the planted id uses the target's real heading shape; arms 1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-64» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-44 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-17, by CONDUCT #1, and the reversal is recorded rather than silently undone.
order: M0; seven truncated claims invisible to the bounds instrument (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot)
interface: none — a reader's pattern and the rosters derived from it; no plane source moves
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none (M0-38 landed the grading and pinned the blind spot rather than fixing it)
accepts-when: each of the seven previously-invisible claims appears in a roster the instrument prints, or is named as out of reach with its reason; **every roster the widened pattern feeds** … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-44» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-33 · queued — D-353 RULED at M0-29's integration (CONDUCT #11, mechanism):
order: M0; a third census shape (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — the test estate's own instrument
interface: none — control drivers and the census only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" … (whole text: the cut archive)
depends-on: none (M0-29 landed the sweep and its adjudication table)
accepts-when: the census reports the sweep's tally section (0 open candidates on the estate as landed, the three retired instances listed as adjudicated); one unadjudicated candidate … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-33» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### SK-5 · blocked — RE-STATED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: no plane op publishes the surface registry (SCHEDULER, first order audit, 2026-09-18)
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the** … (whole text: the cut archive)
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this … (whole text: the cut archive)
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the … (whole text: the cut archive)
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «SK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-60 · blocked — RESTORED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: waits on Bob's re-prioritisation of UI (SCHEDULER, first order audit, 2026-09-18)
milestone: M8
interface: none
depends-on: Bob's re-prioritisation of UI (DEC-33's deferral and the 2026-09-15 content direction stand)
accepts-when: the decomposition exists as rows and this pointer is marked superseded naming them.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «UI-60». A worker READS IT before building.

### REC-15 · blocked
order: blocked: DEC-33's deferral stands (the live publishing route is a human's own session); BOB #14's item 11 also places it after items 2, 5 and 6 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «REC-15». A worker READS IT before building.

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «UI-17». A worker READS IT before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: MOVED OUT OF THE CACHE to the foot of the plan by SCHEDULER #15, 2026-09-23: it is SCHEDULER's own continuous act and never a worker slot, but P3 counts every cache row, so holding it cached cost CONDUCT one worker (CONDUCT #15's report). It has no build position; the fold runs from here, batch by batch. (Placed first by SCHEDULER, first order audit, 2026-09-18.)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 driven by SCHEDULER ITSELF (Bob, 2026-09-19), never a development slot; a row needing a build goes to CONDUCT under its OWN id. The batch that moves D-388 waits on M0-115 (M0-109's DELEGATION).
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).
