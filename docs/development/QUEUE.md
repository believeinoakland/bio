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
- **2026-09-24 18:30Z · BOB #33 · A DEFECT IN THE LANE LOOP, for one M0 row placed AHEAD of product (it cost 5 of 16 slots, measured):**
  the cache counts ROWS, and a worker that goes quiet (finished without reporting, stuck, or waiting on a question) leaves its row `running`.
  Nothing wakes CONDUCT, so the slot is held with nobody working. Measured at 18:22Z: 9 worker sessions RUNNING against 14 rows marked
  running (D-492, M0-173 and REC-212 idle; D-510 queued with no worker). The rule is now in the kickoffs (CONDUCT.md step 4, BOB.md's stall
  probe; land/bob/batch-0924c). **The row builds the instrument, so it does not rest on a lane remembering:** `tools/slots.mjs` reads a
  `list_sessions` listing on stdin (as `occupancy.mjs` does, in both the cloud's `{ccr:{data}}` shape and the bare array) plus coord's
  QUEUE.md. It prints each row marked `running` with its worker's session status, and names every idle-worker row, every queued row with no
  worker, and the count of RUNNING workers against CACHE_ROWS. Exit 1 when any slot is unworked. Accepts when it names D-492, M0-173 and
  REC-212 on a listing and coord of 18:22Z. NEGATIVE CONTROL: match titles loosely, and a `WORKER D-49` session satisfies D-492, failing
  by name.
- **2026-09-24 18:33Z · BOB #33 · CORRECTION to the 18:30Z idle-slot entry, before it is rowed:** CONDUCT #20 read the three sessions that entry
  names (D-492, M0-173, REC-212). None was stalled: each was waiting on its own background gate, which `list_sessions` reports as IDLE. The
  measured gaps were only D-510 (queued, no worker) and one cache slot unfilled. So `tools/slots.mjs` must NOT treat an IDLE status as a stall.
  It names (a) queued rows with no worker session, (b) an open cache slot, and (c) rows marked `running` whose worker has had no update for
  45+ minutes (the listing's `updated_at`), which are REPORTED for a lane to read, never flipped. Accepts when D-510 and the open slot of 18:22Z are
  named, and the three gating sessions are not. Place it after product, not ahead: the cost measured was 2 slots, not 5.
- **2026-09-24 19:14Z · BOB #33 · REC-194's design gap RULED — one RECORD row after REC-194; rule 11's recipient half depends on it:** **`op=publish` names
  the draft it publishes (`draft=`, optional, additive), and at that act the readings taken through that draft BIND to the case it produced.**
  The link is an ACT, recorded with who made it (the publisher) and when, and the case document states it in words ("readings given on draft
  <id>, which <publisher> named as this case's draft at publication"). So a signature covers a link whose author is named, not an inference.
  The owner who signs is signing that stated link. Without `draft=`, REC-194's provisional STANDS: an unbindable reading is counted and
  stated as UNDETERMINED, never named. The row folds this into BIO_Publication_v0_1.md §3 rules 11 and 13, and closes the §9 frontier row
  "a draft bound to the case it produced". Accepts when a recipient's reading on a new case's draft appears in the published case's signed
  list with the link stated, and a publish without `draft=` still reads undetermined. NEGATIVE CONTROL: bind by statement bytes instead of
  the named draft, and a twin case with the same sentence lists the reader, failing by name. I3 additive; the integrator classifies.
  Also: C-82.1 (STATEMENT_ACK_DOCUMENTS_OVER_BOUND) is unreachable after REC-194. Place its retirement as a small row after this one, not in
  REC-194's landing (it moves six DEC-49 floors).
- **2026-09-24 21:05Z · BOB #33 · SUPERSEDES the 18:30Z and 18:33Z idle-slot entries (M0 row `tools/slots.mjs`, now placed AHEAD of product: it cost 7+ of 16 workers at 21:03Z):**
  the signal is `list_sessions`' **status_bucket**, not session status. A row marked `running` whose worker reads COMPLETED or REVIEW_READY is
  FINISHED, so it is FLIPPED. BLOCKED means the worker needs an answer. A row with no live session is read and then flipped or respawned. A queued
  row with no worker is SPAWNED. The tool reads a saved listing (the cloud's `{ccr:{data}}` shape) plus coord's cache, prints those lists and the
  WORKING count, and exits 1 when anything is owed. BOB's prototype is `slots.py` (in the plan-page artifact's files, builder/slots.py.txt);
  port it to node. Accepts when, on the 21:03Z listing, it names D-476, D-518, UI-93, REC-199, REC-200, UI-102 and D-519 as FLIP, UI-99 as ANSWER, and
  D-516 as SPAWN. NEGATIVE CONTROL: read session status in place of the bucket, and the seven FLIPs vanish, failing by name.
- **2026-09-24 21:55Z · BOB #33 · THE RECORD OF RULINGS SENT ONLY BY MESSAGE TODAY, so `decided.mjs` finds them (REC-216's worker caught that two rows cite a ruling of 21:21Z that nobody can look up). Each row folds its ruling into the named home document when it lands:**
  - **REC-212 determinations (18:44Z):** no-draft publish credits the publisher as writer, and the document says so; with the writer undetermined, participant acks are withheld and COUNTED; C-41.10 keeps both exclusions → Publication §3 rule 13 (folded by REC-212).
  - **C-82.6/C-82.7 words (19:04Z):** CONDUCT's generalised sentences accepted; one code each.
  - **Review copy (19:06Z):** the writer's own ack is withheld from the second-reader list AND counted beside it → Publication §6A (REC-213).
  - **Render throttle (19:10Z):** measure the navigation bound; a concurrency cap from the vendor's stated limit, labelled; over-cap renders wait → CLIENT-RENDERED (D-520).
  - **D-491 (19:54Z):** a held render expires to UNDETERMINED with its reason; op=queue shows a waiting render → CLIENT-RENDERED (D-523).
  - **D-490 (21:05Z):** a per-subresource SHA-256 on rendered captures, undetermined where the bytes were not kept; no puppeteer → CLIENT-RENDERED (D-529).
  - **registeraudit (21:17Z):** `sound` is true for a row held in parts with every named part present and verified; fourth state "held in parts, all present"; unresolvable rows are UNDETERMINED, outside `sound` → Intake Doctrine §8 (D-533). D-518's mixed-tick epoch is confirmed.
  - **Risk-tier revision (the "21:21Z" ruling, sent 21:18Z):** a new member-class act `actionrisktier` (NOT BUILT); a revision is an authored, append-only act with a REQUIRED reason, the prior tier and author stay readable, and machines are refused → Case Making §2 (REC-214, UI-104); a labelled machine proposal (REC-215).
  - **Reading provenance (21:25Z):** a reading carries tier, member, pages and a text SHA-256; re-read disagreements are attributed; both readings are kept → Framework §16 (D-536).
  - **REC-216 (21:55Z): DO NOT publish `actionlawspropose` in ACTS.** REC-195's NON_ACTS reasoning stands: every `*propose` op is NON_ACTS, and a member states the list with `actionlaws`. What D-149 owes is a surface that SHOWS the machine proposal beside the member's list. REC-216 is SUPERSEDED (close it with this reason). UI-105 is rewritten to SHOW the proposal, with no member "propose" act.
  - **FW-23 dialect (21:55Z): (b), a `reading.dialect` key of its own** (delimiter, encoding), persisted on the acquire document; not `container_extent`. It suits other text formats with a decoding choice. One RECORD I1 row.
  - **FROM NOW ON, BOB writes each ruling to this INBOX in the same act as its message**, so no row cites a ruling the record cannot find.


## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### FW-23 · running — **CSV HAS NO FORMAT-REGISTRY ENTRY, so the corpus's CSV files are held and never read.** BOB #32 DESIGNED it (2026-09-24 02:30Z): delimiter and encoding found by signature and RECORDED on the reading, undetermined when they cannot be told; one sheet; row 1 is row 1, a header being a reading, never assumed; cells addressed sheet-cell/sheet-range, 1-based; the capture's grade. Legacy `.xls` (50 keys) stays waiting under OFFICE-FORMATS's legacy ruling. — owner FRAMEWORK.
order: behind D-66, per BOB #32's ruling (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: I2 additive — a `csv` format entry.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (folded at 16fe1e7f), on "The architectural answer: a FORMAT axis".
depends-on: D-66.
scope: the `csv` entry and its reader on the format axis; extend the office-format suites.
accepts-when: a CSV reads as addressed cells with delimiter and encoding recorded. NEGATIVE CONTROL: guess a delimiter where none is determined and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### D-463 · running — **NO CREDENTIAL IS CONFINED TO SCRATCH FOR LIFE: the namespace binds per CALL, so an instrument that omits `store=scratch` addresses the real record (CLAUDE.md §5's stated residue: *a sticky confinement is RECORD's and is NOT built*).** — owner RECORD.
order: after D-462, the last of the namespace guards (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a guard)
interface: I3/I5 — a per-credential confinement; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325's residue).
depends-on: D-456, D-461.
scope: a credential may be minted confined to `scratch`; every call it makes resolves to scratch whatever it names, and a `store=bio` from it is refused by name.
accepts-when: a confined credential writing without `store=` lands in scratch, and `bio`'s counters are unchanged. NEGATIVE CONTROL: drop the confinement, and that arm moves `bio` and fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-478 · integrated — **`pdf-worker` AND `ocr-worker` ACCEPT ANY `store` TOKEN AND ANSWER AN UNKNOWN NAMESPACE WITH NOT_FOUND: nothing is written (IC-237 measured it), but "not found" reads as the capture's ABSENCE when the truth is that the namespace does not exist.** Found by D-462's worker. — owner CONTENT-PDF.
status: integrated — CONDUCT #20 verified 21:49Z: c5c42044, full battery 354/354, N1/N2 AS DECLARED; into c20-batch26; a DIST deploy of pdf-worker and ocr-worker after landing.
order: last of the namespace guards, low: read-only, no write; placed because *not found* is not *absent* (CLAUDE.md §1) (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M0 (the members' side of the guard)
interface: I6 — a named refusal on the members' routes; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325).
depends-on: D-462 (finished; rides the train after c19-batch9).
scope: the same NAMESPACES set and a NAMESPACE_UNKNOWN refusal in `pdf-worker/src` and `ocr-worker/src`.
accepts-when: `store=biosmoke` is refused NAMESPACE_UNKNOWN by name by both members. NEGATIVE CONTROL: accept the token again, and the arm reads NOT_FOUND and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-99 · integrated — **A DEFINITION REVISION'S BASIS AND A DISPOSITION'S VERSION HAVE A PLANE AND NO SURFACE: D-128's revision basis and REC-184's `definition_version` (and its `not recorded`) reach no page.** Found by REC-184's worker. — owner UI.
status: integrated — worker reported finished 21:45Z: land/worker/UI-99 @ 38af046d, gate GREEN class FULLREUSE; for CONDUCT to verify and integrate (SCHEDULER #19 dispatch).
order: after UI-89, with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M4
interface: I3 consumer.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (front matter: NOT BUILT, a member surface for a revision's basis).
depends-on: REC-184.
scope: show a revision's basis beside its version, and on a disposition the version it judged, `not recorded` stated as such.
accepts-when: both render against a real-plane suite. NEGATIVE CONTROL: hide `not recorded` and its arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### M0-187 · running — **`surfacing-run.mjs` CANNOT SUPPLY A SURFACING RUN FOR A SECOND DEPLOY TOKEN IN ONE STORE: `openRun` creates its fixture project BY TITLE, so the second token is refused NAME_TAKEN, the wrapper's `.catch(() => null)` swallows it, and the suite reads SURFACE_NO_RUN with the real cause unnamed.** Found by D-511's worker (F1). — owner RECORD (the shared test helper).
order: after M0-181, AHEAD of the product rows: a fixture that hides the cause of a red costs a diagnosis round in every suite that imports it (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:47Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a refusal is reported by name, never swallowed).
depends-on: none.
scope: make the fixture project's title unique per (token, store), and let the wrapper rethrow any refusal that is not the expected one.
accepts-when: two deploy tokens in one store each get a surfacing run (the measured failure it moves: NAME_TAKEN read as SURFACE_NO_RUN). NEGATIVE CONTROL: restore the shared title and the second-token arm fails naming NAME_TAKEN.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### UI-101 · integrated — **THE APP OFFERS NO RISK-TIER CONTROL: `civicos-ui/app.html`'s action intake cannot state 1, 2 or 3, while D-483 gave the setup page a chooser (the BOTH-INTAKE-SURFACES convention).** Found by D-483's worker. — owner UI.
status: integrated — worker session COMPLETED, land/worker/UI-101 @ 61532670 pushed; CONDUCT integrates into c20-batch26 (SCHEDULER #19 dispatch 21:30Z).
order: after UI-99 (UI-100 is cached), with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z)
milestone: M4
interface: I3 consumer (`vocabularies.risk_tiers`).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`: the words are the plane's; only a member's authored act sets a tier).
depends-on: D-483.
scope: a choice over `vocabularies.risk_tiers` in the app's action intake, unset by default, unset writing undetermined, words taken from the plane.
accepts-when: a chosen tier is written and none chosen writes undetermined, against a real-plane suite. NEGATIVE CONTROL: default the choice to 1 and the unset arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### UI-102 · integrated — **A GOVERNING-LAWS PROPOSAL HAS A PLANE AND NO SURFACE: REC-195's the `actionlawspropose` op (not yet on main) and `action.governing_laws_proposals` reach no page (`8.governing-laws`: NOT BUILT, a MEMBER SURFACE for the proposal).** — owner UI.
status: integrated — worker session COMPLETED, land/worker/UI-102 @ a2d974aa pushed; CONDUCT integrates into c20-batch26 (SCHEDULER #19 dispatch 21:30Z).
order: after UI-101, with the surfaces owed to landed plane rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:11Z)
milestone: M4
interface: I3 consumer (IC-267).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (the governing laws of a records request, D-149).
depends-on: REC-195.
scope: the action page renders each proposal beside the governing-laws list under the plane's OWN `says`; it NEVER offers a proposal as a way to set the list.
accepts-when: proposals render beside the list against a real-plane suite, and no control on the page sets the list from one. NEGATIVE CONTROL: add a "use this" control and the no-setter arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### REC-199 · integrated — **`op=reviewcopy` DOES NOT ANSWER `newCase`, SO AN EDIT THAT WRITES THE READ BACK LOSES IT.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *op=reviewcopy answers `newCase`.* — owner RECORD.
status: integrated — CONDUCT #20 verified 21:43Z: 83b73c91, full battery 354/354, control 14 AS DECLARED; into c20-batch26.
order: after UI-92 (SCHEDULER #17, 2026-09-23; UI-68's worker)
milestone: M10
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the field in the answer. Extend the review-copy suite.
accepts-when: a read-then-write round trip keeps `newCase`. NEGATIVE CONTROL: drop the field, and the round-trip arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-200 · integrated — **A REVIEW COPY'S DATE DOES NOT MOVE WHEN A COMMENT MOVES ITS HASH, AND ITS CONTAINER-SIDE STAMP IS UNRULED.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *the container side is stamped by `attestor.member` and `ratified_at`; the copy carries the date of its LAST change, so a comment that moves the hash moves the date.* — owner RECORD.
status: integrated — flipped 21:12Z by SCHEDULER #19 on a pushed branch BEFORE its gate reported (BOB #33 21:17Z corrected the rule: flip only on a reported finish or a recorded GREEN); its gate bw0yww7ft was still running at 21:15Z; CONDUCT merges only on its green.
order: after REC-199 (SCHEDULER #17, 2026-09-23; REC-148's worker)
milestone: M10
interface: I3 — the copy's date; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the date is the last change's; the container stamp as ruled. Extend the review-copy suite.
accepts-when: a comment moves both the hash and the date. NEGATIVE CONTROL: keep the old date, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-181 · integrated — **`status.mjs`'s `table` PROBE HAS THE AMBIGUITY HOLE M0-160 CLOSED FOR `hit`, AND IT IS LIVE: `content` matches the declaration (schema.mjs ~3273) AND a string argument in store.mjs ~1237 (`.find((x) => x.startsWith("CREATE TABLE IF NOT EXISTS content ("))`), so deleting the declaration would still read BUILT.** Found by M0-160's worker (F2). — owner M0.
status: integrated — CONDUCT #20 verified 21:43Z: 07ca2593, 80/80 GREEN, control 16 arms 89/0 AS DECLARED; into c20-batch26.
order: after M0-180, AHEAD of the product rows: a construct probe that reads BUILT on a string is a false green in the record of what is built (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:03Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a check that cannot fail is worse than none), with M0-160's ambiguity arm.
depends-on: M0-160.
scope: anchor a table declaration at line start OR immediately after a template backtick (measured: 114 matches over 114 distinct names; a bare `^` loses 9 real declarations); fail any `table` probe matching more than once.
accepts-when: `content` matches once, and 114 declarations still read (the measured failure it moves: a second, string match that would keep a deleted table BUILT). NEGATIVE CONTROL: delete `content`'s declaration in a fixture and the probe reads NOT BUILT by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-182 · running — **47 OF 80 `bio-plane/test/nc-*.mjs` HARNESSES STILL WRITE THEIR PRISTINE COPY INSIDE THE WORKTREE, AND NOTHING GRADES THE CLASS (23 more unclassified, named not scored).** BOB #32 ruled a harness's pristine copy lives outside the worktree. Found by D-492's worker (F2). — owner M0.
order: after M0-188, AHEAD of the product rows (moved 2026-09-24 20:25Z by SCHEDULER #19): 7 in-worktree pens are NOT gitignored (.m0110-harness, .m0109-harness, .m037-harness, .m0100-harness, .m0107-harness, .vf1-control-pristine, .m0111-harness), so the tree is DIRTY while those controls run and a gate on it records nothing (Bob's 17:41Z rule; M0-179's sweep via CONDUCT #20)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control breaks only the thing), with BOB #32's and BOB #33's pen rulings (M0-172).
depends-on: none.
scope: one helper `controlPen(item)` (`mkdtempSync(join(tmpdir(), "nc-<item>-"))`) beside `test/budget.mjs`; a sweep suite shaped like `budget-sweep.test.mjs` grading each harness IN-WORKTREE, TEMP or MEMORY with a floor; move the 47 to the helper; then drop .gitignore's in-worktree pen lines. M0-172's driver list rides the same helper. FIRST the 7 unignored pens above; M0-179's sweep counts 24 drivers still in-worktree.
accepts-when: the sweep reads 0 IN-WORKTREE (the measured failure it moves: 47 of 80). NEGATIVE CONTROL: point one harness back into the worktree and the sweep names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### D-513 · running — **`op=knock`'s TOO_LARGE (two sites) and EMPTY STILL REACH A KNOCKER UNTRANSLATED at the door D-508 catalogued, and `d278-codeless-refusals.test.mjs`'s header calls them "coded already" (true of `reason`, false of the translation).** Found by D-508's worker. — owner RECORD.
order: after D-510, with the product corrections: refusals a member cannot read at a public door, D-507's and D-508's class (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:47Z)
milestone: M2
interface: I3 additive — three catalogued codes; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following D-484's single-site shape.
depends-on: D-508.
scope: consolidate each code behind one governed helper (arm F reads them F4 multi-site), then rows in KNOCK_CHECKS; correct the d278 header clause; restate the Roles doc's D-484 F4 figure from this landing's census print (it records "102 -> 100" on its own tree; main read 102 before D-508).
accepts-when: each of the three arrives with its translation, and arm F reads each single-site. NEGATIVE CONTROL: return one code outside the helper and arm F names it multi-site (a behavioural arm cannot see it: `dec49Decorate` translates from the catalogue alone).
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-514 · integrated — **THREE MORE READER SITES MEASURE RAW LENGTH WHERE D-501 RULED GLYPHS: `index.mjs` ~4519 attributes a whitespace-only page to the `layer` part on `p.text.length` (legistar-73550 p1: 39 characters, 0 glyphs); `mergeTier2Text` (textchain ~1365) and `mergeTier3Text` (index ~4313) refuse a whitespace-only base SAYING "it already holds N decoded character(s)", which is false; `needsTier2` (index ~4086) escalates on raw `counts.chars`.** Found by D-501's worker (F5, F3, F2). — owner CONTENT-PDF.
status: integrated — CONDUCT #20 verified 21:46Z: e03816d7, full battery 354/354, nc-rec102 8/8 AS DECLARED; into c20-batch26.
order: after D-513, with the extraction corrections: two of the three make the record claim what it does not hold, CLAUDE.md §2's worst class (SCHEDULER #19, 2026-09-24; via CONDUCT #20 17:51Z)
milestone: M2
interface: none (`counts.chars` unchanged).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-501's glyph award (M-140).
depends-on: D-501.
scope: count glyphs (non-whitespace code points) at all three sites through D-501's counter. F3 CHANGES BEHAVIOUR, RULED by SCHEDULER #19 as mechanical: a whitespace-only base holds no decoded text, so it takes the tier wholesale and its refusal sentence can no longer be false; BOB #33 was told.
accepts-when: legistar-73550 p1 is not attributed to `layer`; a whitespace-only base takes tier 2 and tier 3; `needsTier2` reads glyphs. NEGATIVE CONTROL: restore raw length at the layer filter and the whitespace-page arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-516 · running — **INSIDE THE ONE-SECOND BAND THE OBSERVATION-LOG READERS PICK A CLASS THEY CANNOT TELL: a subject entering 1-2 s before a level's first row reads `never_looked` or `purged` depending on where the clock second fell (D-500's arm M3).** BOB #33 RULED 2026-09-24 17:58Z (drained to `BOB-INBOX-drained.md`; cite until folded): `observation_log.at` STAYS whole-second; within the band the reader states undetermined. — owner RECORD.
order: after D-514, with the corrections to just-landed work: the record choosing between two claims it cannot tell apart (CLAUDE.md §2) (BOB #33, 17:58Z; SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 additive — a published state on a new path; the integrator classifies.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §6 "The readers", with BOB #33's ruling of 17:58Z, which this row FOLDS into §6 beside D-500's named ceiling in the same landing.
depends-on: D-500.
scope: `enteredAfterFirstRow` returns three ways (after, before, within the band); within it the content axis reads `CONTENT_AXIS_UNDETERMINED`, its `why` naming the stored watermark's one-second precision; no column change, no migration.
accepts-when: arm M3's band pair reads undetermined in both readers, and pairs outside the band are unmoved (the measured failure this moves: M3's pair flipping class on the clock second). NEGATIVE CONTROL: collapse the band into a two-way comparison and the band arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:58Z; `node tools/mintid.mjs D`).

### D-517 · running — **ONE READER, TWO WORD-GAP RULES: tier 1's TJ word gap is a hand-picked -100 (0.1 em) while D-502 set the run gap at a measured 0.25 em, a 2.5x disagreement inside one reader.** Found by D-502's worker (M-141). — owner CONTENT-PDF.
order: after D-516, with the extraction corrections: two rules of one reader disagreeing on what a word gap is (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:04Z)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-502's measured threshold (M-141).
depends-on: D-502.
scope: measure the TJ displacement distribution over M-141's corpus; re-set the constant from it, or unify the two rules; record the measurement with date and instrument.
accepts-when: the TJ threshold is the measured one, and M-133's agenda glue stays at 5 or below with no word lost (the measured failure it moves: the unmeasured 0.1 em constant). NEGATIVE CONTROL: restore -100 and the measured-threshold arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-213 · running — **`op=reviewcopy`'s LIVE STATEMENT LIST CAN SHOW THE WRITER'S OWN ACKNOWLEDGEMENT AMONG THE SECOND READERS, while the case document now withholds it: a row by its own writer is not a second reading (rule 11), so listing it overclaims.** REC-212's worker (F2). BOB #33 RULED YES, 2026-09-24 19:06Z (cite until folded): withheld AND COUNTED, with the count and its reason ("by the statement's writer") stated beside the list, as the case document does; §6A's "show everything recorded" holds, since nothing recorded is hidden. — owner RECORD.
order: after D-517, with the corrections to just-landed work: a review copy claiming a second reading that is not one (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:57Z and BOB #33 19:06Z)
milestone: M10
interface: I3 — the review copy's list narrows and gains the count; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A with BOB #33's ruling of 19:06Z, which this row FOLDS into §6A in the same landing.
depends-on: REC-212.
scope: pass the draft's `statement_by` as `writer` at reviewCopy's one `#statementAcknowledgements` call; state the withheld count and its reason beside the list.
accepts-when: a writer's own row is absent from the review copy's list and counted beside it (the measured failure it moves: the writer's row listed among second readers). NEGATIVE CONTROL: drop the `writer` argument and the list names the writer, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-176 · running — **`gates.mjs` §2's DOC-FACING DOOR IS NOT PATH-GRANULAR: every doc-facing unit takes ANY `docs/` change, so `calibration.test.mjs` (which genuinely reads `kickoffs/SCHEDULER.md`) still runs on a MEASUREMENTS-only diff after M0-165 removed its false reader edge.** Found by M0-165's worker (M0-165 NARROWED to this). — owner M0.
order: after M0-170, AHEAD of the product rows by Bob's 17:41Z rule: every `docs/` diff runs doc-facing units it does not touch (gate time) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-165.
scope: a doc-facing unit takes only the `docs/` paths it, or a tool it runs, names; this changes selection estate-wide, so print each unit's before/after on a MEASUREMENTS-only and a kickoff-only diff.
accepts-when: a MEASUREMENTS-only diff no longer selects calibration, and a kickoff diff still does. NEGATIVE CONTROL: restore the whole-`docs/` door and calibration is selected again, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### UI-103 · running — **THE PUBLISHED CASE PAGE NAMES THE PUBLISHER AS THE STATEMENT'S WRITER: `app.html` ~20591 (page 2) renders "Written by ${c.completeness.author}", while REC-212 split the two acts (`statement_by` wrote it, `author` published it).** The delegation RECORD (REC-212) → UI is on coord `CLAIMS.md`. — owner UI.
order: after UI-102, with the surfaces owed to landed plane rows: a surface that attributes an act to the wrong member (SCHEDULER #19, 2026-09-24; REC-212's worker via CONDUCT #20 18:57Z)
milestone: M10
interface: I3 consumer (REC-212's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (two acts, two names), with UI-89's three-state render as the precedent.
depends-on: REC-212.
scope: read `statement_by` for who wrote the statement and `author` for who published it; render the three states (list / [] / null) through `completeness.statement_by_stated`.
accepts-when: a case whose statement one member wrote and another published names each for its act, against a real-plane suite (the measured failure it moves: the publisher named as writer). NEGATIVE CONTROL: render `author` as the writer again and the two-acts arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### UI-97 · integrated — **A MEMBER CANNOT UNDO A MUTE FROM THE APP: `op=queuemute` takes `unmute:true` for `{item}` and for `{case, kinds}`, and no client sends it.** Found by UI-86's worker. — owner UI.
status: integrated — worker reported finished 21:55Z: land/worker/UI-97 @ 412e917c, gate GREEN; for CONDUCT to verify and integrate (SCHEDULER #19 dispatch).
order: after UI-86's row, the same queue control: a member door the plane already opens (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: I3 consumer.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: UI-86.
scope: in `queueMuteReportHtml`, a per-muted-item "Let this reach me again" sending `{item, unmute:true}`, and a per-case "Unmute" sending `{case, kinds, unmute:true}`; register the repeated control in `member-respect` SETS. Extend `civicos-ui/test/notifications.test.mjs`.
accepts-when: a muted item unmuted from the report reaches the member again. NEGATIVE CONTROL: omit `unmute:true`, and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-207 · running — **NOTHING SETTLES A BIAS-DEBT OBLIGATION BUT THE LENS MOVING BACK: a re-run under the current lens is not recognised, and `op=taskresolve` addresses tasks, not runs.** BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS): *BOTH acts settle it, each RECORDED, never cleared silently — (1) a re-run under the CURRENT lens discharges the debt of the run it re-runs, closed with the discharging run's id and lens pins (any other lens discharges nothing); (2) a member's resolve with a REQUIRED stated reason, authored, attributed, dated, append-only, riding the task-resolve path or its equivalent.* — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:30Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER REC-207 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/REC-207; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: behind D-86's train, as ruled; with the M4 bias rows (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3 — the discharge on the obligation and the resolve act; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt), with BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS); DEC-24 (derived informs, authored binds) and DEC-69 (a member is never forced).
depends-on: D-86 (`integrated` on c17-batch7).
scope: the re-run discharge recording the discharging run's id and lens pins; the member's resolve with a required reason; the lens moving back stays a third discharge.
accepts-when: a re-run under the current lens closes the obligation naming that run; one under another lens leaves it open; a resolve without a reason is refused by name. NEGATIVE CONTROL: discharge on any re-run, and the other-lens arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-468 · running — **A BIAS SET ACCEPTS `adopted` → `proposed`: promote does not enforce the STATES edges against the head, so a revision can move backwards.** Found by REC-187's worker (F4). — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:30Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER D-468 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/D-468; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after REC-207, with the bias rows: a correction to a built state machine (SCHEDULER #17, 2026-09-24; REC-187's worker via CONDUCT #19)
milestone: M4
interface: I3 — one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption".
depends-on: REC-187 (`integrated` on c19-batch9).
scope: promote checks each bias-set transition against the declared STATES edges from the current head and refuses any other by name.
accepts-when: `adopted` → `proposed` is refused by name; every declared edge still passes. NEGATIVE CONTROL: drop the edge check, and the backwards arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-210 · running — **ADOPTING A PROPOSED BIAS REVISION DOES NOT SAY SO: REC-187 re-pins the adoption to the adopted sha, but an adoption that pins a proposed, not-yet-accepted revision reads like any other.** BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias): *adopting a PROPOSED revision is a REPLACEMENT; the adoption must SAY it pins a proposed revision, and `op=biasadopt`'s answer and the adoption's read state that marker.* — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:32Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER REC-210 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/REC-210; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after D-468, with the bias rows (SCHEDULER #17, 2026-09-24; REC-187's worker F1)
milestone: M4
interface: I3 additive — a marker on the adoption's answer and read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption", with BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias).
depends-on: REC-187 (`integrated` on c19-batch9).
scope: record and publish the marker when the adopted revision is still proposed; the re-pin itself is built.
accepts-when: adopting a proposed revision answers and reads the marker; adopting an accepted one does not. NEGATIVE CONTROL: drop the marker, and the proposed-adoption arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-94 · running — **THE QUEUE CANNOT FORWARD A SELECTION: D-126 lets the plane take the set, and the member picker is per item.** — owner UI.
status: running — SPAWNED 2026-09-24 ~21:32Z by SCHEDULER #19 (dispatch, BOB #33 21:10Z) as a SEPARATE CLOUD SESSION titled WORKER UI-94 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/UI-94; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after D-176 (SCHEDULER #17, 2026-09-23; D-126's worker via CONDUCT #18 23:47Z)
milestone: M8
interface: I3 consumer (IC-235).
design: `docs/development/NOTIFICATIONS.md` (its Incomplete section names it), with D-126's per-item weight.
depends-on: D-126 (`integrated` on c17-batch7).
scope: a bulk forward over the queue's selection, sent as the set.
accepts-when: a selection of three forwards in one act. NEGATIVE CONTROL: loop per item, and the one-act arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-216 · running — **NO MEMBER CAN MAKE A GOVERNING-LAWS PROPOSAL FROM ANY SURFACE: `actionlawspropose` is absent from the member-facing ACTS catalogue in `bio-plane/src/affordances.mjs`, so no page is ever offered it.** UI-102's worker (finding 3, via CONDUCT #20 21:26Z): unbuilt capability, not a defect. — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:48Z by SCHEDULER #19 (dispatch) as a SEPARATE CLOUD SESSION titled WORKER REC-216 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/REC-216; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after REC-215, in product order: the plane half of REC-195's proposal becoming reachable (SCHEDULER #19, 2026-09-24)
milestone: M10
interface: I3 additive — one ACTS entry; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*: a machine proposal, if built, is labelled machine work), with REC-195's op.
depends-on: REC-195.
scope: publish `actionlawspropose` in ACTS with its label, weight and prompt, after which the UI's surface registry lists it in ACTS_AWAITING_SURFACE until UI-105 hosts it.
accepts-when: `op=affordances` offers the act on an action where it applies (the measured failure it moves: the act absent from ACTS). NEGATIVE CONTROL: drop the ACTS entry and the offered-act arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### REC-205 · running — **A PROJECT-SCOPED FINDING CANNOT JOIN A QUEUE SELECTION: its act names a project per item, so D-126's set has no way to carry one.** — owner RECORD, then UI.
status: running — SPAWNED 2026-09-24 ~21:48Z by SCHEDULER #19 (dispatch) as a SEPARATE CLOUD SESSION titled WORKER REC-205 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/REC-205; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after UI-94 (SCHEDULER #17, 2026-09-23; D-126's worker)
milestone: M8
interface: I3 — the set act carries each item's project; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-126 (`integrated` on c17-batch7).
scope: the set act admits project-scoped items, each resolved against its own project.
accepts-when: a selection mixing a project-scoped finding and a condition is handled in one act. NEGATIVE CONTROL: drop the per-item project, and the mixed-selection arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-527 · running — **A REOPENED PROPOSAL'S EARLIER DECISION REACHES NO PAGE: `op=proposals` publishes `prior_disposition` (proposalsFeed, REC-184) but no surface reads that op (UI-14 retired it for `op=queue`), and `op=queue`'s FINDING items carry `subject.definition_version` but not `prior_disposition`, so a member meeting the reopened question is shown one nobody has answered.** Found by UI-99's worker (id minted by it; stated in Framework §8.2's As-built paragraph). — owner RECORD, then UI.
status: running — SPAWNED 2026-09-24 ~21:52Z by SCHEDULER #19 (dispatch) as a SEPARATE CLOUD SESSION titled WORKER D-527 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/D-527; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after UI-106, with the corrections: the record holding a decision the one op a surface reads does not carry (SCHEDULER #19, 2026-09-24; UI-99's worker 21:45Z)
milestone: M4
interface: I3 additive — `prior_disposition` on the queue's FINDING item; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (a reopened proposal carries the earlier decision as `prior_disposition`).
depends-on: REC-184.
scope: `op=queue`'s FINDING item publishes the proposal's `prior_disposition` (the object proposalsFeed already builds; no new derivation or table); a UI follow-on renders it and is rowed once this lands.
accepts-when: a revision-reopened finding on `op=queue` carries its prior disposition with state, reason, author, instant and `definition_version` (the measured failure it moves: the field absent from every surface-read op). NEGATIVE CONTROL: drop the field from the queue item and the reopened-item arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-527` minted by UI-99's worker).

### D-444 · running — **THE PROJECT OFFERS `reinstate` THAT THE STORE WILL REFUSE: the reinstate affordance's PROJECT arm keys on the count `cites_out.severed`, so a project whose only severed edges point at RETIRED items is offered the act, and REC-183's `#edgeTransition` refuses it RETIRED_NOT_CITABLE.** The worker states it at `affordances.mjs` beside the rule (*"The PROJECT arm is not narrowed"*). — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:55Z by SCHEDULER #19 (dispatch) as a SEPARATE CLOUD SESSION titled WORKER D-444 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/D-444; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after UI-86: a correction to just-landed work (REC-183), an affordance that promises an act the record refuses; directly ahead of the census rows (SCHEDULER #17, 2026-09-23, REC-183's worker via CONDUCT #17, 22:09Z; verified at land/worker/REC-183 @ 27905f5d)
milestone: M8
interface: I3 additive — one new fact in `affordanceFacts`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is not citable; BOB #30), with the affordance contract that an offered act is one the store accepts.
depends-on: REC-183 (finished, awaiting integration).
scope: `affordanceFacts` gains a fact counting severed out-edges whose target is NOT retired (e.g. `cites_out.severed_reinstatable`), read by the same predicate `#edgeTransition` runs; the PROJECT arm keys on it. Extend `bio-plane/test/affordances.test.mjs`.
accepts-when: a project whose only severed edge targets a retired item is not offered reinstate; one with a severed edge to a live item is, and the store accepts it. How a liar passes it: dropping reinstate from projects entirely, so the live-target arm must be offered. NEGATIVE CONTROL: key the arm back on `cites_out.severed`, and the retired-only arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`; placed directly as a plan row, never a DEBT row — BOB #31, 2026-09-23 22:09Z).

### D-445 · running — **D-443's CAP ON `publishedCaseRegistryFor` IS PINNED BY SHAPE ONLY: it binds one `json_each` value, and `frontier-chunk.test.mjs` D443-7 asserts that structurally; its own header says it was never driven past 100 ids.** D-443 is NARROWED to this one trace, not closed. — owner RECORD.
status: running — SPAWNED 2026-09-24 ~21:58Z by SCHEDULER #19 (dispatch) as a SEPARATE CLOUD SESSION titled WORKER D-445 (SCHEDULER #19), base origin/main 1a7f0bcc0. Falsify rather than believe: a live worker holds the branch land/worker/D-445; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone.
order: after D-444: a correction to just-landed work (D-443), a guarantee the suite does not yet exercise (SCHEDULER #17, 2026-09-23; D-443's worker via CONDUCT #18 22:27Z (4), verified at c17-batch7 @ f32fe714)
milestone: M0 (a behavioural arm over M4 code)
interface: none — a behavioural arm.
design: `docs/development/VERIFICATION.md` (test through the op), with D-36's bound on bound variables.
depends-on: D-443 (`integrated` on c17-batch6).
scope: arm D443-7b seeds 120 ratified published cases pinning one finding sha and gates that finding through the op that reaches `gateFacts`. In `bio-plane/test/frontier-chunk.test.mjs`.
accepts-when: D443-7b is green through the op. NEGATIVE CONTROL: the existing `casereg` arm of `frontier-chunk.control.mjs` fails D443-7b by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-448 · running — **ELEVEN REVIEW-COPY REFUSAL CODES REACH A MEMBER WITH NO CANNED TRANSLATION: UI-68's surface now shows `REVIEW_NOT_PROJECT_OWNER`, `REVIEW_NO_PROJECT`, `REVIEW_DRAFT_CHANGES_PROJECT`, `REVIEW_NO_SUCH_CASE`, `REVIEW_DRAFT_TOO_LARGE`, `REVIEW_NO_RECIPIENT`, `REVIEW_NO_SECRET`, `REVIEW_NO_GRANT`, `REVIEW_NO_COMMENT_TEXT`, `REVIEW_UNKNOWN_ACT` and `NO_REVIEW_COPY`, and none has a DEC-49 row.** — owner RECORD.
status: running — SPAWNED 2026-09-24 by SCHEDULER #19 as WORKER D-448 (SCHEDULER #19), base origin/main 9f8b69e6. Falsify rather than believe: the census must read all eleven translated.
order: after D-445: a correction to just-landed work (UI-68) that shows members untranslated codes (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M10
interface: none — a check family and its translations.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with DEC-49's translation rule.
depends-on: UI-68 (`integrated` on c17-batch7).
scope: a review-copy `*_CHECKS` family in `bio-checks.mjs` with DEC-49 regions and one canned sentence per code. Separately worth weighing: `check-refusal-codes.mjs` learning reach-by-op, since its R2 cannot see a code no surface names.
accepts-when: the refusal-code census reads every one of the eleven as translated. NEGATIVE CONTROL: drop one code's region, and the census arm names it.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
