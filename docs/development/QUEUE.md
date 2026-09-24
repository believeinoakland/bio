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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 12 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### CPDF-22 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d (IC-220 renumbered IC-222, I3 MAJOR 73.0.0), waiting for its train — flipped by SCHEDULER #17
order: directly after M0-138, first of the product rows, as BOB #31 placed it: no client may read `image_bound` before it goes; after M0-138 because every train pays that tax (SCHEDULER #16, 2026-09-23; BOB #31's inbox entry, drained this commit)
milestone: M4
interface: I5 — `image_bound` withdrawn for `undetermined: {level, why}`, through ONE IC; the integrator mints and classifies it.
design: `docs/architecture/BIO_System_Design.md` §3, construct 12 (UNDETERMINED as a display primitive; D-440's `undetermined` is the record's shape), with BOB #31's ruling of 2026-09-23 (the drained inbox entry).
depends-on: D-420, D-440 (both on `land/conduct/c17-batch1`; the train that lands it).
scope: every "admitted, bound not held" mint answer carries `undetermined: {level, why}`; `image_bound` is removed at every producer and reader.
accepts-when: `bio-plane/test/d420-image-page.test.mjs` reads `undetermined.level` and `undetermined.why` for a `{page, rect}` on a pre-change PDF, `d440-image-part.test.mjs` green, and `git grep -n image_bound -- bio-plane civicos-ui` returns nothing. NEGATIVE CONTROL (`nc-d420.mjs`, a new arm): restore the `image_bound` key, and D-420's suite fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's inbox entry, drained this commit; `node tools/mintid.mjs CPDF`).

### REC-182 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d, waiting for its train — flipped by SCHEDULER #17
order: directly after CPDF-22 (REC-181 is in the cache): the same class D-171 just closed (a correction to just-landed work), the record's own order undefined on a tie; below the promote-integrity rows because no consumer is known to be harmed (SCHEDULER #16, 2026-09-23; D-171's worker via CONDUCT #17)
milestone: M6
interface: none (an order made total, as written); the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6, I-20 (mechanical-writer conformance: the immediately prior recorded snapshot), with D-171's landed `created DESC, rowid DESC` as the precedent.
depends-on: D-171 (its order is the precedent; on `land/conduct/c17-batch2`).
scope: (1) both ORDER BYs gain `, rowid` (write order on a tie); a sweep of `store.mjs` manifest reads for any other untied `created` order, each tied or listed; (2) I-20's text states that on a `created` tie, prior means write order.
accepts-when: in a NEW suite `bio-plane/test/rec-182-created-tie.test.mjs`, through the ops: two manifest rows with an equal `created` come back from `op=export` and the gate in write order on every run; I-20 names the tie rule. NEGATIVE CONTROL (`rec-182-created-tie.control.mjs`): drop `, rowid` from one read, and its arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-171's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs REC`).

### REC-183 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d, waiting for its train — flipped by SCHEDULER #17
order: directly after REC-182: the retired-not-citable fence D-168 built and REC-181 closed at promote, one door further, the record claiming what §4.1 forbids (CLAUDE.md §2); a correction to just-landed work (SCHEDULER #16, 2026-09-23; REC-181's worker via CONDUCT #17)
milestone: M9
interface: I3 — `op=reinstate` gains the `RETIRED_NOT_CITABLE` refusal (C-33.39); the integrator classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is NOT citable, for every caller; BOB #30), with D-168's `RETIRED_NOT_CITABLE` (C-33.39) as the one refusal.
depends-on: REC-181 (on `land/conduct/c17-batch2`).
scope: in `#edgeTransition`, when `to === "confirmed"`, refuse `RETIRED_NOT_CITABLE` for any selected member whose `current_state` is `retired`, before any write.
accepts-when: in a NEW suite `bio-plane/test/rec-183-reinstate-retired.test.mjs`, through `op=reinstate`: cite, sever, retire, reinstate is refused `RETIRED_NOT_CITABLE` with the edge still severed; a live target reinstates. NEGATIVE CONTROL (`rec-183-reinstate-retired.control.mjs`): drop the check, and the retired arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (REC-181's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs REC`).

### D-443 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d, waiting for its train — flipped by SCHEDULER #17
order: directly after REC-183: a read that fails outright past ~100 ids refuses loudly rather than claiming what it cannot support, so it sits below the rows where the record claims too much; D-390's own precedent and suite make it one worker's afternoon (SCHEDULER #16, 2026-09-23; D-390's worker via CONDUCT #17)
milestone: M3
interface: none (the reads answer as before, now at any size); the integrator classifies.
design: `docs/development/RETRIEVAL-SUBSTRATE.md` (reads over the record), with D-36's measured ~100-variable limit and D-390's `IN (SELECT value FROM json_each(?))` as the precedent.
depends-on: D-390 (its binding and its suite are reused; on `land/conduct/c17-batch2`).
scope: each list above binds ONE value, `IN (SELECT value FROM json_each(?))` with `JSON.stringify(ids)`, keeping each read's row source visible to `derivation-bounds.test.mjs`.
accepts-when: `bio-plane/test/frontier-chunk.test.mjs` gains an arm per read, each driven through its op past 100 ids and green; `derivation-bounds.test.mjs` green. NEGATIVE CONTROL (`frontier-chunk.control.mjs`, a new arm): restore one spread `IN (?, …)`, and that read's arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (DEBT D-443, minted by D-390's worker on coord `3c0f5092`; placed by door 2, keeping its `D-` id).

### D-65 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d, waiting for its train — flipped by SCHEDULER #17
order: directly after D-60, the same op: D-60 stops the raw-byte noise, this makes monitoring say WHAT changed for the type and keep the negative result; a gap, not an over-claim (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M3
interface: I3 — `op=monitor` answers with the layer it stopped at and graded events; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (*"One public function"*; identical bytes are *"a CONFIRMATION, stored as evidence"*; the contract *"sets the expected check frequency"*), with `docs/architecture/CONSTRUCTS.md` Step 6 and `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1 (the monitor's sweep).
depends-on: D-60 (the comparison this extends).
scope: `op=monitor` asks `assess` through the capture's handler and content type, answers with its trail and graded events, and writes each look to the observation log as §4.1 states. REC-26's per-document `monitor_frequency` stays the authored choice; a document stating none takes its type's contract, and the answer says which.
accepts-when: a calendar that lost a meeting inside its window reads `removed` as an `event`, a moved window reads `routine`, and an unchanged tick writes a dated `PRESENT unchanged` observation. How a liar passes it: grading every change an `event`, so the moved-window arm must read `routine`. NEGATIVE CONTROL: bypass `assess`, and the removed-meeting arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-65's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
uncut: restored whole from «D-65» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### REC-164 · integrated — finished; integrated on land/conduct/c17-batch7 @ 66a6a990 (IC-223, I3 73.1.0, I5 1.32.0), waiting for its train — flipped by SCHEDULER #17
order: the first feature after UI-75 (DEC-24's member half first): the group's public identity, resting on REC-163's public slug read (BOB #24: *"after REC-163"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 additive (the two set acts and the public read) and I5 (two durable values with dated histories); the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the publishing group's public identity).
depends-on: REC-163.
scope: two values in the store's durable state, each set by an administrator's session act with `by` stamped by the server and a dated history; a verifier that fetches a well-known file on the claimed domain through the per-host governor, naming this instance's address and slug, and records `verified`, `absent` or `mismatched` with a date, re-checked on the reconciling alarm; a public read returning the display name, and a domain only while it is verified.
accepts-when: a bearer and a caller-supplied `by` are refused; an unverified domain never appears in a public read; a well-known file naming another instance reads `mismatched`; the display name appears in no signed bytes. How a liar passes it: verifying once at set time, so the arm changes the file and the alarm's re-check moves the verdict. NEGATIVE CONTROL: skip the verdict gate on the public read, and the unverified-domain arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 2, drained this commit; `node tools/mintid.mjs REC`).
uncut: restored whole from «REC-164» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### MK-6 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d (disclosure fix: the member id is no longer published in observations), waiting for its train — flipped by SCHEDULER #17
order: replaces MK-3 (superseded 2026-09-21), directly above MK-7 and MK-5, which rest on it; BOB #19: *"Build (i) regardless"* — no published byte moves, since MK-1's fence still stands (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 and I5 (the authored provenance document's shape); the builder states additive or breaking, and the integrator mints the IC.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.1 (the bundle never names its author) and §8's row for replacement (i).
depends-on: MK-1 (built).
scope: as §4.1 — every file and manifest record an authored bundle can publish carries `observer:<testimony id>` in place of the member id, and the register alone resolves it. Existing authored bundles stay fenced.
accepts-when: a fixture case publishes an observation at `group` level and NO published part — no file, no manifest entry — contains the author's member id, handle or cover: a POPULATION arm over every published part, never a list of sites. NEGATIVE CONTROL: restore the member id in the Session Log, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
uncut: restored whole from «MK-6» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### M0-71 · integrated — finished; integrated on land/conduct/c17-batch6 @ cd85c22d, waiting for its train — flipped by SCHEDULER #17
order: the measurement IDENTIFY's judgement must pass, BEFORE anything a member sees; after REC-146 (SCHEDULER, 2026-09-19); a process row that stays among the product rows because it unblocks REC-147 (Bob, 2026-09-22: no process row unless it cuts gate time or unblocks product — SCHEDULER #12)
milestone: M0 (VERIFY; the acceptance test of item 3 is this item's over-strictness arm)
interface: none — a fixture, a harness and a measurement
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §7 (the over-strictness arm, its corpus and its three negative controls) and §9 item 2.
depends-on: REC-146.
scope: build §7's labelled corpus (precision, world in both of Bob's shapes, record, unrelated) and the harness over REC-146's pairs; measure a candidate judgement off-record; record the false-conflict rate, recall and the THRESHOLD in `MEASUREMENTS.md` with the corpus size.
accepts-when: `MEASUREMENTS.md` carries the figures with date, instrument and corpus size; §7's three negative controls run and recorded (a disabled or always-`world` judgement FAILS the gate by name; an empty record returns case (a)); `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 2).
uncut: restored whole from «M0-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### UI-68 · integrated — finished; integrated on land/conduct/c17-batch7 @ eb96b1fa (met UI-74's routers and REC-148's 13.review-copy), waiting for its train — flipped by SCHEDULER #17
order: BOB #14's item 8 (13.review-copy), its in-instance surfaces; the plane half is built (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-126's IC-145/IC-146)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (front matter and §6A.3), with the REC-126 → UI DELEGATION in `CLAIMS.md` and its REC-133 addendum, which specify the four surfaces. Verified by BOB #16 (2026-09-19): not Program B's.
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: the delegation's four surfaces; nothing leaves the instance from the UI.
accepts-when: the harness drafts, grants, reads by secret, comments and revokes against the real plane, and a revoked secret reads nothing. How a liar passes it: a hidden export path (a print stylesheet, a blob link), so the harness asserts NO such affordance exists. NEGATIVE CONTROL: add a download link, and the no-export arm fails by name. `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (BOB #16 inbox "THREE DESIGNS AT THEIR HOMES", item 6).
uncut: restored whole from «UI-68» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### REC-148 · integrated — finished; integrated on land/conduct/c17-batch7 @ e4dedb2c (IC-222 renumbered IC-229, I3 75.3.0), waiting for its train — flipped by SCHEDULER #17
order: DEC-31's in-band quartet, before any review copy leaves the instance (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 additive (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A (§6A.3 point 2 and the DEC-31 in-band rule), and BOB.md rule 7 (a comparison names its quantity).
depends-on: REC-126 (done) — CHECK AT THE CODE at spawn.
scope: add the hash and both floors beside the date and author, computed by the one function the published header uses.
accepts-when: for one case edition, the review copy's quartet and the published container's header agree field for field, proved by the SAME function; the hash changes when one byte of the answer does. How a liar passes it: a second hasher over a differently-canonicalised body agrees on the fixture and drifts, so the suite asserts ONE function. NEGATIVE CONTROL: canonicalise differently in one place, and the agreement arm fails. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 7).
uncut: restored whole from «REC-148» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-150 · integrated — finished; integrated on land/conduct/c17-batch7 @ 582f414f (IC-227, I3 75.1.0, I5 2.1.0), waiting for its train — flipped by SCHEDULER #17
order: with the M10 publication path, directly after UI-69 and before D-148: what a published case says about its own completeness, disclosed; designed and NOT BUILT, so a feature below the corrections (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 1)
milestone: M10
interface: I3 — the acknowledgement act and the completeness block's list; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4 (BOB #27, 2026-09-22).
depends-on: none — REC-14's statement and REC-126's review-copy grant are built.
scope: an acknowledgement is an authored, attributed, dated act by a joined participant of the publishing project other than the statement's author, or by a review-copy recipient through their grant; the signed completeness block lists them, or states that nobody but its author acknowledged it; publication is never refused for want of one. The UI half (the review copy leads with the statement, §6A.4) is UI-68's surface: a DELEGATION to UI at integration.
accepts-when: a second participant's acknowledgement lands and is listed in the signed completeness block; a case with none publishes and says so; the author's own acknowledgement is refused by name. NEGATIVE CONTROL: refuse publication for want of one, and the one-member arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 1, drained this commit; D-150's DEBT row of 2026-08-01; keeps its `D-` id).
uncut: restored whole from «D-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-148 · integrated — finished; integrated on land/conduct/c17-batch7 @ 9e2f6e55 (IC-228, I3 75.2.0, I5 2.2.0), waiting for its train — flipped by SCHEDULER #17
order: with the M10 case path, after UI-69: the action a case justifies, CivicOS's fourth verb, a feature over built substrate; D-149 directly after it, both beside D-147 as BOB #26 placed them (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 1)
milestone: M10
interface: I3 and I5 — a quote grammar on correspondence and an indexed table; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A FEE QUOTE IS EVIDENCE*, Bob's ruling of 2026-09-22).
depends-on: none — `action` and its correspondence are built.
scope: a `received` entry may carry a QUOTE — amount and currency as quoted, the stated basis verbatim, and the `sent` entry it answers; a later entry may name the quote it revises (a waiver is a revision to zero, both entries standing). Its grammar sits at C-2.10 beside the correspondence arms; `promote` projects it into an indexed table `purge` clears in both arms; a read returns quotes by counterparty and by request. The record states no finding about a quote.
accepts-when: a quote projects and reads back by counterparty and by request; a revision to zero keeps both entries; a quote answering no `sent` entry, or whose amount is not a number, is refused by name; an action with no quote reads byte-identical. NEGATIVE CONTROL: drop the projection from the per-bundle purge, and the purge arm fails by name.
added: 2026-09-22 · SCHEDULER #12 drafted it; SCHEDULER #13 placed it, re-verified on `8e2c146c` (BOB #26's inbox entry, item 1; D-148's DEBT row; keeps its `D-` id).
uncut: restored whole from «D-148» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-149 · integrated — finished; integrated on land/conduct/c17-batch7 @ f32fe714 (IC-230, I3 75.4.0; I5 3.0.0 MAJOR), waiting for its train — flipped by SCHEDULER #17
order: directly after D-148, its sibling at M10 beside D-147 (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — the action's citation list; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: none — `action` is built.
scope: a records-request action carries a list of citations, each with its level (federal, state or local), set by a member's authored act; a machine credential is refused by name, and a machine PROPOSAL, if built, is labelled machine work. An empty list reads UNDETERMINED with its sentence, never a default; the plane encodes no law's rules; `cpra_request` actions read unchanged.
accepts-when: a member's list lands and reads back; an action with none reads undetermined, never federal; a machine credential's list is refused by name. How a liar passes it: a citation filled in at creation, so the empty-list arm reads the bytes. NEGATIVE CONTROL: default an empty list to a federal citation, and the undetermined arm fails by name.
added: 2026-09-22 · SCHEDULER #12 drafted it; SCHEDULER #13 placed it, re-verified on `8e2c146c` (BOB #26's inbox entry, item 2; D-149's DEBT row; keeps its `D-` id).
uncut: restored whole from «D-149» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### REC-149 · integrated — finished; integrated on land/conduct/c17-batch7 @ 55805a82 (IC-231 re-resolved: I3 76.0.0 MAJOR, I5 3.2.0), waiting for its train — flipped by SCHEDULER #17
order: Bob's 2026-09-18 ruling (DISCOVERABLE/HIDDEN), after BOB #14's listed items; the plane half first (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`), I5 for the setting's table
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 (Bob's ruling of 2026-09-18; decided by BOB #16, 2026-09-19).
depends-on: REC-138 (done; `Store#inSight`) — CHECK AT THE CODE at spawn.
scope: as item 7.14: at EXISTENCE every act but the request is refused POSITIONALLY with a new code carrying id and name only; every existing project boots HIDDEN.
accepts-when: through the ops, a hidden project is byte-identical to a nonexistent one at the directory, the request and every act (REC-138's suites green UNEDITED); an uninvited member's record reads, search, backlinks and run reports never show a discoverable project's contents; a predecessor's store boots with every project HIDDEN. How a liar passes it: widening `viewerPredicate` passes the directory arm and leaks contents. NEGATIVE CONTROL: widen it, and a contents arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (same entry, item 1).
uncut: restored whole from «REC-149» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### FL-11 · integrated — finished; integrated on land/conduct/c17-batch7 @ 162e6c37 (no IC; I8 PROVISIONAL), waiting for its train — flipped by SCHEDULER #17
order: directly before D-260: inert until D-260 dispatches runs, and D-260 would dispatch runs whose every suggestion is refused (FLEET #4: *"place it with D-260 or ahead of it"*) (SCHEDULER #14, 2026-09-23)
milestone: M9
interface: none on the plane — the fleet member's behaviour and its mock; the committed `agent-worker` bundle rebuilds and member bytes move at the next release (DIST's).
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, *Rule 1's target* (a suggestion lands only inside its run's context), with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the credential cascade's member).
depends-on: none — REC-165's refusal is on `main`; `op=airun`'s read returns the run's context.
scope: FLEET #4's four: seed `state.target` at run open from the run's context id (for a PROJECT run, a question the project confirmed-cites, never the project id); `submit` defaults a candidate's target to it; the mock gains the context rule, `SUGGEST_OUTSIDE_RUN_CONTEXT` and the principal gate; a negative control.
accepts-when: against the mock, a run's suggestions land inside its context and one aimed outside is refused by name; the dedup and empty-level readers receive the run's target. NEGATIVE CONTROL: drop the seeding, and the harness suite fails by name.
added: 2026-09-23 · SCHEDULER #14 (FLEET #4's trigger; `node tools/mintid.mjs FL`).

### FL-12 · integrated — finished; integrated on land/conduct/c17-batch7 @ 162e6c37 (no IC), waiting for its train — flipped by SCHEDULER #17
order: directly after FL-11, before D-260: inert until D-260 dispatches runs, and every internet-level look a dispatched run asks for would be refused ; ONE WORKER TAKES FL-11 AND FL-12 TOGETHER, one `agent-worker` bundle rebuild, so member bytes move once (FLEET #4, 2026-09-23) (SCHEDULER #14, 2026-09-23; REC-168's finding via CONDUCT #14)
milestone: M9
interface: none on the plane — the fleet member's call and its mock; the `agent-worker` bundle rebuilds at the next release (DIST's).
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5 (`op=capturerequest` takes rule 1; a request names an address), with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6.
depends-on: none — REC-168's gate is on `main` or lands before this reaches the cache.
scope: send `address: t.url` in `agent-worker/src/index.mjs`; the mocks (`harness.test.mjs` and `fanout.test.mjs`) read `address` and refuse a request without a public https address, as the plane does (FLEET #4).
accepts-when: against the mock, a run's internet-level target files a request naming its address; one sent with only `url` is refused by name. NEGATIVE CONTROL: send `url` again, and the address arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (REC-168's finding via CONDUCT #14; `node tools/mintid.mjs FL`).

### D-192 · integrated — finished; integrated on land/conduct/c17-batch7 @ eb96b1fa, waiting for its train — flipped by SCHEDULER #17
order: after REC-191: a security pin on a built guarantee, small, ahead of the process rows (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1; narrowed at the code on `02603e88`)
milestone: M2
interface: none — an assertion and one sentence of design.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §15 (the subresources and render-companion row), which gains one sentence stating the view-time guarantee.
depends-on: none.
scope: an arm in `civicos-ui/test/artifact-fetch.test.mjs` asserting the capture frame's `sandbox` attribute is present and empty; the sentence in §15.
accepts-when: the arm reads the frame's attribute from the page and is green. NEGATIVE CONTROL: change it to `sandbox="allow-scripts"`, and the new arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; D-192's DEBT row of 2026-08-04, verified at the code; keeps its `D-` id).

### D-260 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (IC-237 renumbered IC-242; I8 1.0.0 STABLE), waiting for its train — flipped by SCHEDULER #17
order: a feature after the rows Bob's priorities ordered (UI-71), above D-126: FL-4's wake and DS-3's and FL-6's halves are BUILT and inert until this caller exists, and I8 leaves PROVISIONAL when it lands (SCHEDULER #7, 2026-09-21)
milestone: M9
interface: I8 (leaves PROVISIONAL); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260 paragraph; the deploy half, `docs/architecture/BIO_Distribution_v0_1.md` §6's bullet. A member-principal run's non-resumption is the stated limitation there.
depends-on: none — FL-4, `instanceClaudeToken` (`src/tokens.mjs`, DS-3 `2de6f25f`) and FL-6's member half are on `main`.
scope: (1) RECORD with FLEET: FL-4's wake dispatches a woken run to `agent-worker` with the organisation credential ONLY when its stamped principal equals the run's `principal_plane`, and otherwise logs that it did not; the dispatch hands `claude_accounts` its instance level. (2) DIST, after 1: install and update carry that credential as a secret, as `DAEMON_TOKEN` is, never in the record, denylisted by `tokens.mjs` on publication.
accepts-when: a run the instance credential opened resumes after its capture completes; a member's run is not dispatched and says so. How a liar passes it: dispatching every woken run and leaning on REC-152 to refuse the tick, so the arm asserts the member's run is never DISPATCHED.
added: 2026-09-21 · SCHEDULER #7 (LED-7; BOB #22's ruling, drained this commit; keeps its `D-` id).
uncut: restored whole from «D-260» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-126 · integrated — finished; integrated on land/conduct/c17-batch7 (merge 6ab139df; C-68/69 renumbered C-75/76; IC-224 renumbered IC-235, I3 76.3.0; UI state v106), waiting for its train — flipped by SCHEDULER #17
order: a feature, after the rows Bob's priorities ordered (UI-71 closes his 2026-09-18 ruling), before the M4/M2 product rows because the queue surface is built and UI-55's ARM 4d already watches for it (SCHEDULER #5, 2026-09-21)
milestone: M4; the surface half M8
interface: I3 — the weight vocabulary and the acts' set form; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §Applying a handler to a selection: *"each item independently succeeds or is RETAINED WITH A REASON"*, the reasons being named refusals in the plane's own words.
depends-on: none.
scope: ONE row in two halves, BOB #19's decomposition. RECORD publishes `per-item` and lets `op=proposedispose`, `op=taskresolve` and `op=taskforward` take a set, each item succeeding or retained with its reason; then UI applies a handler to a selection and keeps each retained item listed with that reason. **UI-55's ARM 4d (`civicos-ui/test/member-respect.test.mjs`) goes RED the day an act takes a set, BY DESIGN:** correct it with a dated reason, never exempt it. The 26 unbuilt generators stay under their own rows.
accepts-when: a selection of three where one item drifted leaves exactly that one listed with its reason and clears the other two, through the ops and on the surface. How a liar passes it: all-or-nothing relabelled, so the mixed-outcome arm is required. NEGATIVE CONTROL: refuse the whole set on one failure, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).
uncut: restored whole from «D-126» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-74 · integrated — finished; integrated on land/conduct/c17-batch7 @ 6ff3cf56 (measurement renumbered M-119, tool tools/m119-idspace.py; 6.identifier-spaces stays ABSENT), waiting for its train — flipped by SCHEDULER #17
order: first of the M4 product rows, after D-126: a MEASUREMENT comes before anything built on it, and §8.3 calls it *"one of the highest-value pieces of measurement this project can do"*; a gap, not an over-claim (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M4
interface: none — a measurement; a shared identifier it finds is built under its own row.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 (*"recorded per institution the way stack measurements are recorded per host. Oakland's shared identifiers have not been measured."*), with `docs/architecture/CONSTRUCTS.md` Step 5a.
depends-on: none.
scope: for each of §8.3's five identifier classes, sample the Oakland systems that publish it and record whether one identifier value appears in two systems, with N per system, the instrument and the date, per institution as a host stack is recorded. Nothing is built: a found identifier becomes its own row, designed by BOB.
accepts-when: `MEASUREMENTS.md` carries a per-class table — the systems read, N per system, and found in two, found in one or not found, with an example pair where found. How a liar passes it: reading one system and calling a class absent, so every row names the systems read and an absence names what was not sampled.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-74's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
uncut: restored whole from «D-74» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### REC-122 · integrated — finished; integrated on land/conduct/c17-batch7 @ e7bcdc23 (IC-228 renumbered IC-232, I3 75.5.0, I5 3.1.0), waiting for its train — flipped by SCHEDULER #17
order: runnable product work (M4, D-161's last act); REC-120 is done; not on BOB #14's list, which governs only rows added after it (SCHEDULER, first order audit, 2026-09-18)
milestone: M4 — D-164, the content-extent primitive (RECORD)
interface: I5 and I3 — its OWN IC, minted with `node tools/mintid.mjs IC` BEFORE building, against the bases as read at resolution (I5 1.18.0, I3 23.5.0 on `main` when rowed)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT, as corrected 2026-09-18) read with `DEBT.md` D-161 (act 3) and REC-86's NARROW (`op=narrow`, IC-123) — the LEG-side analogue whose rules (member-only, machine proposals labelled, the old retained, nothing claimed that was not established) this act should mirror unless the design says otherwise.
depends-on: REC-120 (DONE — `determining_pair.selection`, `pair_rule` and C-49.4 present on `main`; verify before building).
accepts-when: in M-51's fixture a member choosing the p.9 mention makes a p.9 citation answer REACHED with that grade and a p.2 citation answer outside, through the ops; with no choice made every REC-120 answer is byte-identical; a machine credential cannot choose (refused by name); a choice cannot name a mention the document does not carry; `DEBT.md` D-161 CLOSED; construct-status updated if a claim moves (`node tools/status.mjs --check` then … (whole text: the cut archive)
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «REC-122». A worker READS IT before building.

### D-394 · integrated — finished; integrated on land/conduct/c18-batch8 @ a8944e1d (IC-231 renumbered IC-239, I3 76.5.0; C-80), waiting for its train — flipped by SCHEDULER #17
order: with the M4 product rows, after REC-122: a gap and not an over-claim (§18.1 says so, which is why no instrument catches it), resting on built substrate — the chain (PL-10) and REC-82's carry (SCHEDULER #6, 2026-09-21, LED-7 batch 12)
milestone: M4
interface: I3 — a read-time answer the builder names; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 — lazily at READ, never at capture; an answer about a PAIR attached to nothing persistent; extent-match *"a SUFFICIENT signal for a candidate and never as evidence of identity"*, UNDETERMINED where it fails.
depends-on: none — `op=versionchain` and REC-82 are built.
scope: as §18.1 — where a cited content row's document has a newer capture at its address, the read says so with certainty and offers the extent-match candidate or UNDETERMINED; NOTHING is written, so a proposal cannot be mistaken for a re-pointing.
accepts-when: a leg citing a passage whose address gained a newer capture reads *a newer version exists* with its candidate or UNDETERMINED; leg, content row and edge are byte-identical before and after; a single-version document says nothing. How a liar passes it: persisting the candidate, so an arm asserts no table grew. NEGATIVE CONTROL: drop the chain lookup, and the newer-version arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 12; keeps its `D-` id).
uncut: restored whole from «D-394» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-86 · integrated — finished; integrated on land/conduct/c17-batch7 @ ec330436 (IC-231 renumbered IC-234, I3 76.2.0, I5 3.3.0), waiting for its train — flipped by SCHEDULER #17
order: with the M4 product rows, after D-394 and before D-162: it completes a built construct's half, and a new construct follows the rows completing built ones, as D-162's order line says (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M4
interface: I3 additive — a queue item kind gains its producer; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §The catalogue (*"a re-run owed after a lens change `[OBLIGATION]`"*, DISCLOSED, never blocking) and §The item contract, with `docs/architecture/BIO_Content_Framework_v0_10.md` §13 (bias debt and ageing are one mechanism).
depends-on: none — `aiRunRead`'s comparison and REC-8's `overdue-scan` shape are built.
scope: a `bias-debt` sweep beside `overdue-scan` on the one alarm raises ONE item per run whose recorded lens `moved`, through `aiRunRead`'s comparison and never a copy, its basis naming both hashes, to recipients the builder names within the run's read gate. `moved: null` raises nothing; nothing is refused (DEC-20). The comment is corrected, dated.
accepts-when: adopting a new revision after a run opened raises one item naming both hashes; an unmoved lens raises none. How a liar passes it: a second comparison in the sweep that agrees today, so a control changes the one function and the item must follow. NEGATIVE CONTROL: drop the sweep's registration, and the moved-lens arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-86's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
uncut: restored whole from «D-86» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-162 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (IC-231 renumbered IC-241, I3 81.0.0 MAJOR, I5 3.5.0; C-74 renumbered C-81), waiting for its train — flipped by SCHEDULER #17
order: with the meaning-layer features (M4), where BOB #23 placed it (after the instrument cluster, which Bob's ruling of 2026-09-22 moved behind the product rows — SCHEDULER #12); after D-394, since a NEW construct follows the rows completing built ones (REC-122 finishes D-161; D-394 reads the built chain) (SCHEDULER #9, 2026-09-21)
milestone: M4
interface: I3 additive, and I5 for the theme's tables; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4 (Bob's ruling of 2026-09-21, its four fences), with §8.1 (membership graded as a connection is) and `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (a lead refused BY NAME as a leg, `LEAD_NOT_EVIDENCE`, C-54.1: the pattern fence 4 reuses).
depends-on: none — the entity registry, member sessions and covers, and C-54.1's refusal are built.
scope: a theme object a member session declares under its cover, with a required TEST; an attributed act placing a document or content row in it; a machine proposal stored as a HUNCH that never counts as membership until a member confirms; every basis, version and action-basis leg resting on a theme, or on membership in one, refused BY NAME.
accepts-when: a member declares a theme with a test and places two documents sharing no entity in it; a declaration without a test is refused; a proposal reads as a hunch; a leg citing the theme is refused by name. How a liar passes it: a theme as an eleventh entity kind, a named and citable thing, so an arm asserts it is not in `ENTITY_KINDS` and cannot be a leg. NEGATIVE CONTROL: drop the leg refusal, and the theme-leg arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, drained this commit; keeps its `D-` id).
uncut: restored whole from «D-162» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### CAP-11 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (M-121 renumbered M-123), waiting for its train — flipped by SCHEDULER #17
order: runnable since CAP-10 landed (M2 measurement); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — a measurement before a letter (CLAUDE.md: measure, do not assume)
interface: none — a measurement; if the calibration record needs a home in the chain, that is CPDF-13's calibration shape, reused
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the content-axis staleness rule — when a calibration goes stale) and §16 (the Drive paragraph DEC-75 was folded into); DEC-75's answer is what makes the calibration the act that raises the cap; D-351 (the byte-instability half already taken: `.ods` `content.xml` byte-identical across three exports, `.odt` differing by one style name)
depends-on: CAP-10
accepts-when: MEASUREMENTS.md carries the per-format table with N, instrument, command and blind spots; the row records the proposed cap per format with its evidence; `node tools/gates.mjs` green (class DOCS unless a script lands); plancheck --local 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «CAP-11». A worker READS IT before building.
uncut: restored whole from «CAP-11» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-351 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-351 (CONDUCT #19), base origin/main (CAP-11's export-step findings on land/worker/CAP-11 @ 0b44e652); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-351 and that session; never conclude queued from the absence alone.
order: after CAP-11, which calibrates the same export step and cites this measurement: the record says LESS than it could, never more, and CAP-7 counted the population small — 22 distinct Drive targets in COFF-6's whole census (M-13) (SCHEDULER #6, 2026-09-21, LED-7 batch 13)
milestone: M2
interface: I1 — §4c's `digests.determined`, gated today on `profiled_from_text`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §5 (a document's anatomy: regions and digests), with `docs/development/DOCUMENT-PROFILES.md` §"Three digests, not one".
depends-on: none — CAP-8's Drive capture is built.
scope: an EVIDENTIARY digest for the office/ODF path, normalised over the CONTAINER and not decoded text — `content.xml`, which the `.ods` measurement shows stable — produced in the acquire path; `capture_sha` stays the envelope's, the trust root. `.odt`'s per-request style names must be normalised out, and that is a MEASUREMENT before a build: state it, or split `.odt` out.
accepts-when: three exports of one unchanged `.ods` agree on the evidentiary digest while their `capture_sha` differ, and C-18.3 folds them; a changed cell moves the digest. How a liar passes it: an envelope digest with timestamps stripped, which agrees for free — so a real content change must move it. NEGATIVE CONTROL: digest the envelope again, and the three-exports arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 13; keeps its `D-` id).
uncut: restored whole from «D-351» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### FW-20 · integrated — finished; integrated on land/conduct/c18-batch8 @ b0962be0 (M-120 renumbered M-121; no IC; D-376's premise re-taken: the directories are tier-2), waiting for its train — flipped by SCHEDULER #17
order: runnable since CPDF-19 landed (M2 breadth); placement CONFIRMED as SCHEDULER's by BOB #15 (BOB #14's list governed rows added after it) (SCHEDULER, first order audit, 2026-09-18)
milestone: M2 — one content type per measured class (BREADTH §7 row 2), completed
interface: none expected — a content type and its registration; if a reference shape moves it is I2 and the IC is minted before building
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2 and its §7 row 2, with §8's controls; M0-32's census in `MEASUREMENTS.md` sets the order and this is its fourth and last class; D-376 in `DEBT.md` carries the measurement
depends-on: CPDF-19 (BREADTH §7 row 5 — read-time re-extraction to tier 3; until a directory decodes at all, a type for it is unreachable code)
accepts-when: a staff-directory page FETCHED AND READ yields a type that recognises it, driven end to end through `identify`; **the re-taken decode census is recorded in `MEASUREMENTS.md` whichever way it comes out**; the `also` pass answers a directory that also satisfies another class; D-376's disposition moves with the commit; **the `docprofile/` change carries BOTH regenerations — `node tools/bundle-docprofile.mjs` for the UI embed AND `cd bio-plane && npm run build` for the plane bundle (D-377, and the second one is the half nobody had written down)**; `cd bio-plane && npm run test:battery` green own-baseline; `node scripts/coverage.mjs --strict` DIRECTLY, `$?` unpiped, exit 0; `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` 0 fail.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «FW-20». A worker READS IT before building.
uncut: restored whole from «FW-20» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-256 · integrated — finished; integrated on land/conduct/c17-batch7 @ daf0c729 (IC-231 renumbered IC-233, I3 76.1.0); DIST runs its changedfromaudit read with store=bio on the deploy that carries it — deployed figures UNDETERMINED until then; waiting for its train — flipped by SCHEDULER #17
order: after D-444, before the census rows: it measures an over-claim already in the record, the class CLAUDE.md §2 ranks worst (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one admin/probe read op, `mutating:false`, `registeraudit`'s shape (proposed name changedfromaudit); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the version chain), with BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded) (D-219's precedent: *a stored string is a fact about when it was written*).
depends-on: none — `op=versionchain` (PL-10) and the history append are built.
scope: scan bundle bodies for the sentence, resolve each named bundle through the version-chain logic, return per bundle the named id, the true predecessor and a verdict: wrong (a different predecessor), right (exactly one prior version) or undetermined (no such version); the three totals apart. Writes nothing. Extend `bio-plane/test/versionchain.test.mjs`.
accepts-when: every affected bundle lands in exactly one class with separate totals, and every body is byte-unchanged. NEGATIVE CONTROL: resolve through the ranked search instead of the chain, and the "provably wrong" arm (a sixty-version fixture naming the oldest) fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-256's DEBT row of 2026-08-08, keeps its `D-` id).

### D-66 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-66 (CONDUCT #19), BRANCHED FROM land/conduct/c18-batch8 (carries FW-20); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-66 and that session; never conclude queued from the absence alone.
order: directly after FW-20, §2's order: row 5 after row 4, a count before any reader (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M2
interface: none — a census class and a read sample; a reader they justify is its own row.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2, row 5 (BOB #24, 2026-09-21): *"Its count and a read sample come first, with the census instrument gaining the class, and no reader is written from what a budget probably looks like."*
depends-on: none. Sequence after FW-20 (§2's order).
scope: the census instrument gains a budget-or-dataset class judged from BODIES, re-run over COFF-6's corpus with its stratum and seed stated; a fixed-seed read sample records what each document holds and whether a spreadsheet is already read by the office entries. No content type is written here. **FULL GATE PROFILE** (`tools/`).
accepts-when: `MEASUREMENTS.md` carries the class's count with its interval beside the four measured classes, and the read sample with N and what each held, dated with the instrument. How a liar passes it: counting by filename, which §2 measured recovering 13% of staff reports, so the class is judged from bodies.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-66's DEBT row, narrowed by BOB #24 on SCHEDULER #9's Q3; keeps its `D-` id).
uncut: restored whole from «D-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### CPDF-3 · integrated — finished; integrated on land/conduct/c17-batch7 @ 1be3be37 (M-120: op=pdfstructure WORKS live; a fresh Oakland fetch UNDETERMINED, egress refused), waiting for its train — flipped by SCHEDULER #17
order: unblocked at this audit (its deploy blocker is false); an M2 live verification, after the product rows above (SCHEDULER, first order audit, 2026-09-18)
milestone: M2
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 "How content is extracted today" (the I2 structure shape `op=pdfstructure` answers), with `docs/development/INTERFACES.md` I1/I2.
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:
uncut: restored whole from «CPDF-3» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-50 · integrated — finished; integrated on land/conduct/c18-batch8 @ 624c1b7d (C-77, no IC), waiting for its train — flipped by SCHEDULER #17
order: with the lower product rows, after CPDF-3: nothing can be WRITTEN wrong, because the write path refuses; this is the conformance half, lower than the write path by the row's own words (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M7
interface: I3 — a catalog check; the integrator classifies any IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §11 item 8, *"Project name uniqueness enforced in the check catalog and at the write path"*, with §7.1's rule: case-insensitive, whitespace-collapsed, across deactivated projects.
depends-on: none.
scope: a catalog check over a handed corpus naming every pair of projects whose `Store.projectNameKey` collide, deactivated ones included, IMPORTING that key function rather than copying it.
accepts-when: a fixture corpus with two projects differing only in case and spacing is reported by name; distinct names pass; a deactivated collider is still reported. How a liar passes it: a second normaliser that agrees on the fixture, so the check imports `projectNameKey`. NEGATIVE CONTROL: compare raw titles instead of the key, and the case-and-spacing arm fails by name.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-50's DEBT row of 2026-07-26; keeps its `D-` id).
uncut: restored whole from «D-50» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` as it entered the cache (SCHEDULER #17, 2026-09-23); its current `order:` kept.

### D-452 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52, waiting for its train — flipped by SCHEDULER #17
order: after D-451, the same run's output (SCHEDULER #17, 2026-09-23; FL-11/12's worker via CONDUCT #18 22:51Z)
milestone: M9
interface: none
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b (the run's architecture).
depends-on: none.
scope: in `harness.mjs` `nextStep`, `adjust` with nothing adjusted and a non-empty queue goes to `submit` (the edge is already declared); re-run H3. Extend `agent-worker/test/harness.test.mjs`.
accepts-when: a pass whose first candidate is dropped still writes the candidates behind it. NEGATIVE CONTROL: route the edge back to `next-pass`, and the "the rest of the pass is written" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-241 · integrated — finished; integrated on land/conduct/c18-batch8 @ 06df869e (IC-235 renumbered IC-236, I3 76.4.0), waiting for its train — flipped by SCHEDULER #17
order: after D-50, the last of the product rows before the M0 group: a read that says less than the record knows (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — a `derivation` field on the entity arm; the integrator mints and classifies the IC.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.3 (the cap, and truncation stated).
depends-on: none — REC-95's observation is built.
scope: the entity arm reads the latest derivation observation for that entity and publishes `derivation {state, at, documents}`, `null` stated as never derived; no schema column (supersedes the row's first proposal).
accepts-when: op=connect over more than 32 documents, then op=connections, says the derivation was cut. NEGATIVE CONTROL: remove the observation read, and that arm fails by name. New suite `bio-plane/test/d241-derivation-stated.test.mjs`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-241's DEBT row of 2026-08-08, verified at the code on `02603e88`; keeps its `D-` id).

### REC-198 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (IC-237 renumbered IC-243, I3 80.1.0), waiting for its train — flipped by SCHEDULER #17
order: after REC-195, the review-copy block (SCHEDULER #17, 2026-09-23; UI-68's worker)
milestone: M10
interface: I3 additive — one read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none.
scope: the list read, joined participants only. Extend the review-copy suite (`bio-plane/test/reviewcopy*.test.mjs`).
accepts-when: a joined participant lists every draft of the project; an uninvited caller reads the fence's answer. NEGATIVE CONTROL: drop the fence, and the uninvited arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-242 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (no IC), waiting for its train — flipped by SCHEDULER #17
order: MOVED UP 2026-09-23 by SCHEDULER #17 to follow the corrections at the head: it now costs product cycles (3 IC-222s, IC-228, IC-224, C-68, 2 M-117s burned in one day across cloud workers), so it cuts integration time; M0-120, its audit half, follows later (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (an instrument states its scope), with `docs/development/ORCHESTRATION.md` §"TAKING AN ID" corrected in the same landing.
depends-on: none.
scope: move the take to one writer: a compare-and-swap push to `origin/coord` (a remote ref refuses a non-fast-forward) or the plane's `Store.allocId`.
accepts-when: two clones minting one namespace at once receive distinct ids. NEGATIVE CONTROL: bypass the single writer, and the "distinct ids" arm fails by name. Whether a collision has happened since the move is UNDETERMINED (not measured).
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).
note: 2026-09-23 by SCHEDULER #17 (D-148's and D-149's workers via CONDUCT #18): measured harm — the C floor reads `origin/main` only, so mintid handed out C-68..C-72 while live on `land/*` branches and both workers burned several. The single writer closes it; until then the C floor also reads every `land/*` tip.

### REC-187 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (IC-240, I3 80.0.0 MAJOR), waiting for its train — flipped by SCHEDULER #17
order: FIRST in the backlog, by BOB #31's ruling of 2026-09-23 (*"Place ONE row FIRST in the backlog"*): a correction to just-landed work (D-84's stamp) outranks new work; it waits only on D-84's train (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the stamped sha and `op=biasmanifest`'s statements hash change meaning together; ONE IC, minted and classified by the integrator.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export" — BOB #31's ruling *"WHICH REVISION THE ACKNOWLEDGEMENT NAMES (D-84 / PL-12). The ADOPTED one."* (on `land/bob/message-driven` @ 58f6d4ed, riding the current train; a worker reads it there until it is on `main`).
depends-on: D-84 (its case stamp; `integrated` on c17-batch4, done when that train lands).
scope: re-pin at promotion to `adopted`; the case document stamps the adopted bundle_sha; `op=biasmanifest` computes `statements_sha` from exactly that revision's statements. Extend `bio-plane/test/d84-case-manifest.test.mjs` (or `bias.test.mjs`).
accepts-when: the stamped statements hash equals a hash recomputed from exactly the stamped sha's bytes, across a propose → adopt → later-propose sequence. How a liar passes it: hashing the latest projection, so the arm proposes a newer revision after adoption and recomputes from the stamped sha alone. NEGATIVE CONTROL: pin the proposed sha, and the equality arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #31's ruling, 21:43Z/21:48Z; `node tools/mintid.mjs REC`).

### REC-188 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-188 (CONDUCT #19), BRANCHED FROM land/conduct/c18-batch8 (carries D-150); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-188 and that session; never conclude queued from the absence alone.
order: directly after REC-187: a correction to just-landed work (D-84, D-150); DEC-20's *disclosed* holds only if the gate refuses the absence (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the case document format becomes `bio-case-document/3` (additive, a newly REQUIRED key); /2 and /1 stay accepted; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export", with `docs/architecture/BIO_Publication_v0_1.md` §3 rules 11 and 12; the bump CONFIRMED by BOB #31 (22:03Z) and widened by BOB #32 (22:26Z): *ONE format bump carries both requirements.*
depends-on: D-84 (c17-batch4), D-150 (c17-batch7), both `integrated`.
scope: `op=publish` writes `bio-case-document/3`; a new C-41 check (mint its C-number) refuses a /3 document without the `bias_manifest` map or without `completeness.acknowledged` and its list; /2 and /1 keep ratifying as written. Extend `bio-plane/test/d84-case-manifest.test.mjs`.
accepts-when: a /3 document lacking `bias_manifest`, and one lacking the acknowledgement list, is each refused by the new C-41 check by name; a /2 document without it still ratifies; a published case reads /3. NEGATIVE CONTROL: drop the new check's push, and the "/3 without a manifest is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### REC-189 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-189 (CONDUCT #19), base origin/main (D-182 is on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-189 and that session; never conclude queued from the absence alone.
order: after REC-188, ahead of the features: a correction to just-landed work (D-182) on the field BOB #21 ruled carries legal exposure; UI-85's chooser follows it so the fence and the member path arrive together (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (1), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 additive — a new refusal code, registered in `affordances.mjs`'s refusal table beside `actionmove`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"Only a member's authored act sets 1, 2 or 3"*); the MACHINE_CANNOT_* precedent at `actionMove`.
depends-on: D-182 (the undetermined tier; `integrated` on c17-batch5).
scope: in promote's action block (not on replay), refuse MACHINE_CANNOT_SET_RISK_TIER when the author is a machine identity and the new tier is 1, 2 or 3 and differs from the previous version's; an unchanged carry-forward passes. Inside a DEC-49 region; a bio-checks entry beside the actionmove one. Extend `bio-plane/test/machine-fences.test.mjs`.
accepts-when: a machine credential's promote changing a tier to 2 is refused by name; a member's promote setting 2 and a machine's unchanged carry-forward are accepted. How a liar passes it: refusing every machine promote of an action, so the carry-forward arm must pass. NEGATIVE CONTROL: drop the machine-identity clause, and the "a machine credential cannot set risk_tier" arm fails by name while the member arm stays green.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### REC-159 · integrated — finished; integrated on land/conduct/c19-batch9 @ 1f1dcb52 (IC-244: I3 79.0.0 MAJOR, I5 3.4.0), waiting for its train — flipped by SCHEDULER #17
order: directly before REC-155, on the same `SESSION_OPS` sets and `d270-refusal-truth`'s ROLE literal: a false refusal shipping to a real administrator outranks a determination owed (SCHEDULER #7, 2026-09-21; REC-156's DELEGATION via CONDUCT #10)
milestone: M8
interface: I3 — four ops gain session reach and three a stamped `by`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each act is EVERY administrator's) and … (whole text: the cut archive)
depends-on: none. D-136 and REC-156 are on `main`.
accepts-when: an enrolled administrator performs all four from their session, attributed to them; a member is refused by name. How a liar passes it: widening the class without the roster … (whole text: the cut archive)
scope-amended: + memberset/signeradd/signerset record the server-stamped actor in a new `by` column; existing rows read `not recorded` (BOB #31 21:08Z; attribution lives in the record). The accepts-when gains an arm per op through the op, and its NEGATIVE CONTROL drops one op's stamp.
added: 2026-09-21 · SCHEDULER #7 (REC-156's DELEGATION; `node tools/mintid.mjs REC`).
unblocked: 2026-09-23 by SCHEDULER #17 — Bob ruled (~23:20Z) that starting plan entries is BOB's act; BOB #32 started WORKER REC-159 (session_01Kmhpfj3yoHZCRgNHbBXaTf, 23:20Z), reporting to CONDUCT #18, which writes `running`.

### UI-85 · running — SPAWNED 2026-09-24 ~01:32Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER UI-85 (CONDUCT #19), base origin/main 15b2a4c0 (D-182 on main; REC-189 finished at land/worker/REC-189 @ 9d9919dd, not yet trained); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-85 and that session; never conclude queued from the absence alone.
order: directly after REC-189, so the plane's fence and the member's only path to a tier land together; D-182's surface half (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (2), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 consumer (`op=affordances`'s `vocabularies.risk_tiers`); none new.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"A surface publishes those words … invents none"*).
depends-on: D-182 (`integrated` on c17-batch5); REC-189 placed earlier.
scope: a chooser in the action intake reading the published map, `undetermined` preselected and no numeric default; `mdFor` writes `risk_tier: <n>` only when the member chose one. Extend `civicos-ui/test/add-surface.test.mjs`.
accepts-when: a member picks tier 2 and `op=projection` reads 2 with the published words; an untouched chooser writes undetermined; the page shows only words the plane published. How a liar passes it: hard-coding the three words, so an identity arm swaps the published map and the page must follow. NEGATIVE CONTROL: default the chooser to 1, and the "an untouched chooser writes undetermined" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### UI-86 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER UI-86 (CONDUCT #19), base origin/main (D-125 is on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-86 and that session; never conclude queued from the absence alone.
order: after UI-85: a correction to just-landed work (D-125's plane half), a surface that now tells a member something untrue (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (4), verified at c17-batch4 @ 65205437)
milestone: M8
interface: I3 consumer (`op=queuemute`'s item form); none new.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (BOB #26, 2026-09-22; D-170).
depends-on: D-125 (`integrated` on c17-batch4).
scope: FINDING kinds in the per-case control; a per-item mute sending `{item}`; the copy and the report cover item mutes and read `mute.items`; the superseded pin corrected in place with a comment saying why. Suites: `civicos-ui/test/notifications.test.mjs`, `queue.test.mjs`, `member-respect.test.mjs`.
accepts-when: a feed holding only a lead draws a mute that reaches `op=queuemute` as `{item}` and the suppression reads under `mute.items`. How a liar passes it: offering the control without sending the item form, so the arm reads the request body. NEGATIVE CONTROL: restore the CONDITION-only filter, and the "a FINDING is offered a mute" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-176 · integrated — finished; integrated on land/conduct/c19-batch9 @ b23f5c94 (no IC), waiting for its train — flipped by SCHEDULER #17
order: with the UI state hygiene, after UI-93 (SCHEDULER #17, 2026-09-23; BOB #32: *CIVICOS_UI_STATE.md is UI's file — a DELEGATION to UI to state the limit beside v46's UI-14 entry*)
milestone: M8
interface: none
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: none.
scope: state the limit in `CIVICOS_UI_STATE.md` beside v46's UI-14 entry at UI's next landing (the build — a RECORD read of what left the queue since the last look — waits on map growth or the interpretation biting).
accepts-when: the statement is in `CIVICOS_UI_STATE.md` beside UI-14. NEGATIVE CONTROL: `corpuscheck` or a grep arm names the missing statement.
added: 2026-09-23 · SCHEDULER #17 (LED-7; D-176's DEBT row of 2026-08-04; keeps its `D-` id).

### D-291 · running — SPAWNED 2026-09-24 ~00:15Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-291 (CONDUCT #19), base origin/main; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-291 and that session; never conclude queued from the absence alone.
order: after REC-205, with the M8 selection rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M8
interface: I3 — a selection path per act; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §S "SELECTION-SCOPED ACTION — how any act goes bulk, safely" (named by BOB #32's ruling of 2026-09-23 23:30Z (cite until folded)).
depends-on: none.
scope: the plane's selection path for both acts under §S; the surfaces use it; strike the carry in ARM 4d.
accepts-when: bulk and single both reach the op in one motion, and ARM 4d's carry is struck. NEGATIVE CONTROL: a client-side loop, and the one-motion arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-461 · running — SPAWNED 2026-09-24 ~00:57Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-461 (CONDUCT #19), base origin/main 15b2a4c0 (D-456 on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-461 and that session; never conclude queued from the absence alone.
order: FIRST in the backlog, as D-456 was: a live verification that names scratch and writes the real record is a safety defect on the record itself (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a guard at the plane's front door)
interface: I3 — a second refusal on the pinned ops; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5: NAME `store=scratch` ON EVERY CALL; D-325).
depends-on: D-456 (`integrated` on c18-d456).
scope: every op pinned to `bio` refuses `store=scratch` by name (preferred), or answers `store:"bio"` on every reply; enumerate the pinned ops from the OPS table.
accepts-when: `op=knock&store=scratch` is refused by name and `bio`'s counters are unchanged. NEGATIVE CONTROL: accept and ignore the parameter again, and the pinned-op arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).
note: 2026-09-24 by SCHEDULER #17 (BOB #32, 00:02Z): the rule of record is CLAUDE.md §5 "NAME `store=scratch` ON EVERY CALL" (D-325, at `scopeFor`); `VERIFICATION.md` stays the cited governed path only because the design check admits it (it has no budget for the rule). On landing, the worker checks §5's wording against the new behaviour and tells BOB if it needs correcting.

### D-464 · running — SPAWNED 2026-09-24 ~01:00Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-464 (CONDUCT #19), base origin/main 15b2a4c0 (D-447 on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-464 and that session; never conclude queued from the absence alone.
order: directly after D-461: a disclosure defect, D-447's class, outranks every correction and feature (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M8
interface: I3 — counts computed through the viewer; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9: a project the caller cannot see answers exactly as one that does not exist).
depends-on: D-447 (`integrated` on c18-d456).
scope: every count served to a class other than the operator's is computed through the caller's `viewerPredicate`. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: creating and revising a hidden project leaves a member's `op=stats` and `op=searchindexcheck` answers byte-identical. NEGATIVE CONTROL: count over the whole store again, and the hidden-creation arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-469 · running — SPAWNED 2026-09-24 ~01:08Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-469 (CONDUCT #19), base origin/main 15b2a4c0; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-469 and that session; never conclude queued from the absence alone.
order: at the head, behind the safety and disclosure rows: an over-claim in the record's own provenance, the class CLAUDE.md §2 ranks worse than a missing feature (SCHEDULER #17, 2026-09-24; CAP-11's worker via CONDUCT #19, minted D-469 after a D-459 collision)
milestone: M2
interface: I3 — `existed` becomes truthful on first acquire; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with M-123 §"A defect found on the way".
depends-on: none.
scope: take the `head()` inside `flush()` before the part is written (it already runs there as the write guard) and carry its answer out for the single-part case. Extend `bio-plane/test/acquire.test.mjs` with a first-acquire arm.
accepts-when: a first acquire answers `existed: false` and a second `existed: true`. NEGATIVE CONTROL: move `head()` back after `flush()`, and the first-acquire arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (CONDUCT #19 minted it through the coord minter).

### D-462 · running — SPAWNED 2026-09-24 ~01:10Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-462 (CONDUCT #19), base origin/main 15b2a4c0 (D-456 on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-462 and that session; never conclude queued from the absence alone.
order: after D-464 (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (the fleet's side of the same guard)
interface: none — a fleet-side refusal.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5; D-325).
depends-on: D-456 (`integrated` on c18-d456).
scope: narrow `STORE_SHAPE` to `bio` or `scratch` with its own BAD_STORE refusal; correct the over-strictness arm.
accepts-when: `store=biosmoke` is refused by the worker by name. NEGATIVE CONTROL: widen the shape again, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-192 · running — SPAWNED 2026-09-24 ~01:16Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-192 (CONDUCT #19), base origin/main 15b2a4c0 (REC-161 on main); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-192 and that session; never conclude queued from the absence alone.
order: after D-256: a correction to just-landed work (UI-74, REC-161) that moves a doctrine from a page's choice into the wire (SCHEDULER #17, 2026-09-23)
milestone: M9
interface: I3 additive — `partitionindependence` (REC-161) takes `version=<id>` and reads that stored version's legs through the same `#independenceOf`, returning no strength field; versionstrength's gate and viewer stamp kept. The integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength, clauses (a)–(c)) with DEC-32 clause 5, and BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded).
depends-on: REC-161 (`integrated` on c17-batch5).
scope: the version arm on the independence read. Extend `bio-plane/test/partitionindependence.test.mjs`.
accepts-when: the version arm's answer carries no strength key and equals versionstrength's `independence` for the same version. NEGATIVE CONTROL: add a strength field to the version-arm answer, and the "no strength key" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (UI-74's worker finding via CONDUCT #17; `node tools/mintid.mjs REC`).

### REC-190 · running — SPAWNED 2026-09-24 ~01:43Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER REC-190 (CONDUCT #19), base origin/main 15b2a4c0 (D-179 on main), IC-251 pre-minted; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-190 and that session; never conclude queued from the absence alone.
order: after UI-86: the census that tells whether D-179's residue exists on a live record, before anything repairs it (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (6), verified at c17-batch4 @ 65205437)
milestone: M2
interface: I3 additive — one new admin/probe census op, `mutating:false`, REC-175's shape (proposed name homecensus); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (*"ONE CAPTURE, ONE HOME — the ORIGINAL's"*). REPAIR of what it finds, and the digest-level duplicate (the same content in different bytes, §8's Incomplete note), are NOT in scope, by BOB #31's ruling of 2026-09-23 22:03Z (cite it until folded): *the census's report STANDS ALONE*; which bundle held a capture first is UNDETERMINED and the report says so; the digest-level duplicate is named as out of reach.
depends-on: D-179 (the fence; `integrated` on c17-batch4).
scope: list every `files`/`history` row whose sha the register assigns to a DIFFERENT, still-existing bundle, with both bundles named; never write. New suite `bio-plane/test/homecensus.test.mjs`, seeding a moved row at the store.
accepts-when: a store seeded with one moved row lists that sha under both bundles; a clean store lists none; the record's counters read before and after the call are unchanged. How a liar passes it: listing every multi-bundle sha including legitimate shares, so the clean-store arm must read none. NEGATIVE CONTROL: remove the different-bundle predicate, and the "displaced row found" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-64 · running — SPAWNED 2026-09-24 ~01:45Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER D-64 (CONDUCT #19), base origin/main 15b2a4c0, IC pre-minted; gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-64 and that session; never conclude queued from the absence alone.
order: with the M2 capture rows, behind its substrate (BOB #31, 22:22Z: *place the capture row behind its substrate*) (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M2
interface: I3 — a render arm on capture producing the pair, and the `render` provenance block; the integrator mints and classifies the IC.
design: `docs/development/CLIENT-RENDERED.md` §"What must be recorded on a rendered capture"; scripts ALLOWED AND RECORDED (BOB #31, 22:22Z); and BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *method `rendered`; one capture holds BOTH artifacts with the RENDERED document PRIMARY and the shell beside it under its own digest; an unattended sweep MAY render within the daily render allowance and through the governor, recording DEFERRED (undetermined) when spent — never the shell as content.*
depends-on: 2.capture (BUILT); the Browser Rendering binding is NOT built and is this row's first act.
scope: the render arm writes one capture: the rendered document (method `rendered`, primary) and the shell (its method and digest), joined by `render.of`, with the `render.*` fields and `third_party_executed`; the sweep's deferral. New suite `bio-plane/test/rendered-capture.test.mjs`.
accepts-when: a rendered capture of a shell holds both artifacts and names every script origin executed, or says undetermined. NEGATIVE CONTROL: force `determined` on a page drawing data from a second origin, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-64's DEBT row of 2026-07-30; keeps its `D-` id).

### UI-83 · running — SPAWNED 2026-09-24 ~01:48Z by CONDUCT #19 as a SEPARATE CLOUD SESSION titled WORKER UI-83 (CONDUCT #19), base origin/main 15b2a4c0 (D-128 on main via c17-batch3); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-83 and that session; never conclude queued from the absence alone.
order: directly after D-443, first of the D-128 follow-ons: a surface that answers a member's act with a refusal it gives them no field to meet is a correction to just-landed work, which outranks new work (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M8
interface: I3 consumer (D-128's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27, 2026-09-22), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: the progression form offers, when revising an existing progression, a basis-statement field and a citation field, and sends both; a refusal still reads through `refusalWords(r)`.
accepts-when: `civicos-ui/test/` gains a suite arm driving a revision through the form with both fields to a landed version, and one without either reading the canned refusal; the UI harness green. NEGATIVE CONTROL: drop the citation field, and the revision arm reads `NO_CITATION` and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-184 · queued — **A PROPOSAL DISPOSITION DOES NOT RECORD THE DEFINITION VERSION IT WAS DECIDED AGAINST, SO ONE MADE UNDER VERSION 1 SILENTLY APPLIES UNDER VERSION 2.** `proposal_dispositions` is keyed `(progression_key, stage_key)` with no version (re-read on `land/conduct/c17-batch3` @ `419272eb`). Also, the stats counters beside `progressionDefs` / `progressionStages` (`store.mjs` ~26650) do not count D-128's version tables. — owner RECORD.
order: directly after UI-83, the same D-128 follow-on: a decision the record applies to a definition nobody judged is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M4
interface: I5 — a `definition_version` column on `proposal_dispositions`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: `op=proposedispose` writes `definition_version`; a read against a later version does not treat an earlier-version disposition as current, stated; rows written before read `not recorded`; the stats counters count the version tables.
accepts-when: `bio-plane/test/proposedispose.test.mjs` gains an arm: a disposition under version 1 does not apply under version 2, and the column reads back. NEGATIVE CONTROL: stop writing the version, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
