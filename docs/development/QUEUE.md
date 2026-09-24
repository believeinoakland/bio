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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### FW-23 · integrated — **CSV HAS NO FORMAT-REGISTRY ENTRY, so the corpus's CSV files are held and never read.** BOB #32 DESIGNED it (2026-09-24 02:30Z): delimiter and encoding found by signature and RECORDED on the reading, undetermined when they cannot be told; one sheet; row 1 is row 1, a header being a reading, never assumed; cells addressed sheet-cell/sheet-range, 1-based; the capture's grade. Legacy `.xls` (50 keys) stays waiting under OFFICE-FORMATS's legacy ruling. — owner FRAMEWORK.
status: integrated — integrated — flipped 2026-09-24 ~22:40Z by SCHEDULER #20 on CONDUCT #20's verification (22:37Z): eaeeb3e0 rebased onto 1a7f0bcc, 355/355 · 20462 GREEN; nc-fw23 4 arms AS DECLARED; rides c20-batch27; CONDUCT resolves IC-283 (I2) there. Findings 2 and 3 are REC-218 and DIST-14.
order: behind D-66, per BOB #32's ruling (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: I2 additive — a `csv` format entry.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (folded at 16fe1e7f), on "The architectural answer: a FORMAT axis".
depends-on: D-66.
scope: the `csv` entry and its reader on the format axis; extend the office-format suites.
accepts-when: a CSV reads as addressed cells with delimiter and encoding recorded. NEGATIVE CONTROL: guess a delimiter where none is determined and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### D-463 · integrated — **NO CREDENTIAL IS CONFINED TO SCRATCH FOR LIFE: the namespace binds per CALL, so an instrument that omits `store=scratch` addresses the real record (CLAUDE.md §5's stated residue: *a sticky confinement is RECORD's and is NOT built*).** — owner RECORD.
status: integrated — VERIFIED by CONDUCT #20 22:09Z: 96d2dd60, full battery 355/355 · 20446, nc-d463 8/8 AS DECLARED; rides c20-batch27.
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

### M0-187 · integrated — **`surfacing-run.mjs` CANNOT SUPPLY A SURFACING RUN FOR A SECOND DEPLOY TOKEN IN ONE STORE: `openRun` creates its fixture project BY TITLE, so the second token is refused NAME_TAKEN, the wrapper's `.catch(() => null)` swallows it, and the suite reads SURFACE_NO_RUN with the real cause unnamed.** Found by D-511's worker (F1). — owner RECORD (the shared test helper).
status: integrated — integrated — flipped 2026-09-24 ~22:20Z by SCHEDULER #20 on CONDUCT #20's verification (22:15Z): land/worker/M0-187 @ 3ef3c6b9, whole battery 355/355 · 20403, control 7 arms AS DECLARED re-run after its rebase; rides c20-batch27.
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

### M0-182 · integrated — **7 CONTROL-DRIVER PENS INSIDE THE WORKTREE ARE NOT GITIGNORED (.m0110-harness, .m0109-harness, .m037-harness, .m0100-harness, .m0107-harness, .vf1-control-pristine, .m0111-harness), so the tree is DIRTY while those controls run and a gate on it records nothing; and nothing grades the pen class.** Found by D-492's worker (F2) and M0-179's sweep. RESTATED 2026-09-24 ~22:28Z by SCHEDULER #20 to BOB #33's ruling of 17:12Z (BOB-INBOX-drained.md, the M0-155 finding-5 entry): *a control driver's PEN is not a session's SCRATCH … in-worktree, gitignored, item-named pens STAND*. The earlier text called the in-worktree pen itself the violation; that was wrong (CONDUCT #20 22:25Z, who has corrected the worker). — owner M0.
status: integrated — integrated — flipped ~23:06Z by SCHEDULER #20 on CONDUCT #20's verification (23:00Z): 413e894d, 98/98 · 7392 RECORDED GREEN; nc-m0182 5/5 AS DECLARED; class (a) only (an unignored pen), as BOB #33's ruling leaves; rides c20-batch27. RESIDUE: 16 of 74 moved drivers' controls re-run, the rest rest on the static sweep. Findings: D-537, D-559.
order: after M0-188, AHEAD of the product rows (moved 2026-09-24 20:25Z by SCHEDULER #19): an unignored pen dirties the tree during a control, so a gate records nothing (Bob's 17:41Z rule; M0-179's sweep via CONDUCT #20)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control breaks only the thing), with BOB #33's pen ruling of 17:12Z (M0-155 finding 5; M0-172).
depends-on: none.
scope: the three defects the ruling leaves, and only those: (1) a pen NOT listed in `.gitignore` (the 7 above) is listed; (2) a pen that is not item-named is renamed to its item; (3) a pen left behind on a clean run is removed by its driver (M0-172's class). A sweep suite shaped like `budget-sweep.test.mjs` grades every `nc-*.mjs` harness and `*.control.mjs` driver as GITIGNORED-ITEM-NAMED, TEMP or MEMORY against a floor, and names each that is none of these. Moving an in-worktree, gitignored, item-named pen out of the worktree is NOT this row's act.
accepts-when: the sweep names 0 unignored and 0 un-item-named pens (the measured failure it moves: 7 unignored pens dirtying the tree during a control). NEGATIVE CONTROL: remove one pen's `.gitignore` line and the sweep names it.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`); restated by SCHEDULER #20.

### D-513 · integrated — **`op=knock`'s TOO_LARGE (two sites) and EMPTY STILL REACH A KNOCKER UNTRANSLATED at the door D-508 catalogued, and `d278-codeless-refusals.test.mjs`'s header calls them "coded already" (true of `reason`, false of the translation).** Found by D-508's worker. — owner RECORD.
status: integrated — integrated — flipped ~23:03Z by SCHEDULER #20 on CONDUCT #20's verification (22:59Z): fe786466, whole battery unreused 354/354 · 20400; nc-d513 4/4 AS DECLARED (one declaration corrected from its first run); rides c20-batch27; CONDUCT classifies IC-286 MAJOR (the reason token moves on the PUBLIC op=knock). Findings placed as D-549 and D-550.
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

### D-516 · integrated — **INSIDE THE ONE-SECOND BAND THE OBSERVATION-LOG READERS PICK A CLASS THEY CANNOT TELL: a subject entering 1-2 s before a level's first row reads `never_looked` or `purged` depending on where the clock second fell (D-500's arm M3).** BOB #33 RULED 2026-09-24 17:58Z (drained to `BOB-INBOX-drained.md`; cite until folded): `observation_log.at` STAYS whole-second; within the band the reader states undetermined. — owner RECORD.
status: integrated — integrated — flipped ~23:01Z by SCHEDULER #20 on CONDUCT #20's verification (22:58Z): e5775cb9 merged with 9f8b69e6, FULL 360/360 · 20680 RECORDED GREEN; collapse control failed 5 more arms than declared (none that must not), each explained on the suite's line; rides c20-batch27; CONDUCT resolves IC-288 there. No new row.
order: after D-514, with the corrections to just-landed work: the record choosing between two claims it cannot tell apart (CLAUDE.md §2) (BOB #33, 17:58Z; SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 additive — a published state on a new path; the integrator classifies.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §6 "The readers", with BOB #33's ruling of 17:58Z, which this row FOLDS into §6 beside D-500's named ceiling in the same landing.
depends-on: D-500.
scope: `enteredAfterFirstRow` returns three ways (after, before, within the band); within it the content axis reads `CONTENT_AXIS_UNDETERMINED`, its `why` naming the stored watermark's one-second precision; no column change, no migration.
accepts-when: arm M3's band pair reads undetermined in both readers, and pairs outside the band are unmoved (the measured failure this moves: M3's pair flipping class on the clock second). NEGATIVE CONTROL: collapse the band into a two-way comparison and the band arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:58Z; `node tools/mintid.mjs D`).

### D-517 · integrated — **ONE READER, TWO WORD-GAP RULES: tier 1's TJ word gap is a hand-picked -100 (0.1 em) while D-502 set the run gap at a measured 0.25 em, a 2.5x disagreement inside one reader.** Found by D-502's worker (M-141). — owner CONTENT-PDF.
status: integrated — integrated — flipped ~22:44Z by SCHEDULER #20 on CONDUCT #20's verification (22:41Z): 99065b61 on 9f8b69e6, FULL 360/360 · 20696 RECORDED GREEN; a substitute three-arm control is on the suite's NEGATIVE CONTROL line (M-145 measured -100 = 0.1 em exactly, confirming D-481). Rides c20-batch27. The declined downward unification is in M-145 with its reversal price; not rowed (no measured failure).
order: after D-516, with the extraction corrections: two rules of one reader disagreeing on what a word gap is (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:04Z)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-502's measured threshold (M-141).
depends-on: D-502.
scope: measure the TJ displacement distribution over M-141's corpus; re-set the constant from it, or unify the two rules; record the measurement with date and instrument.
accepts-when: the TJ threshold is the measured one, and M-133's agenda glue stays at 5 or below with no word lost (the measured failure it moves: the unmeasured 0.1 em constant). NEGATIVE CONTROL: restore -100 and the measured-threshold arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-213 · integrated — **`op=reviewcopy`'s LIVE STATEMENT LIST CAN SHOW THE WRITER'S OWN ACKNOWLEDGEMENT AMONG THE SECOND READERS, while the case document now withholds it: a row by its own writer is not a second reading (rule 11), so listing it overclaims.** REC-212's worker (F2). BOB #33 RULED YES, 2026-09-24 19:06Z (cite until folded): withheld AND COUNTED, with the count and its reason ("by the statement's writer") stated beside the list, as the case document does; §6A's "show everything recorded" holds, since nothing recorded is hidden. — owner RECORD.
status: integrated — integrated — flipped 2026-09-24 ~22:20Z by SCHEDULER #20: WORKER REC-213 (session_01JJwYaKs8chrSDYbEwxuZ3W) COMPLETED and reported to CONDUCT #20 (D-540, D-541 minted and routed); land/worker/REC-213 @ 3e7ac340 pushed. CONDUCT merges only on its green; its floors are the branch's, re-read on the union.
order: after D-517, with the corrections to just-landed work: a review copy claiming a second reading that is not one (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:57Z and BOB #33 19:06Z)
milestone: M10
interface: I3 — the review copy's list narrows and gains the count; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A with BOB #33's ruling of 19:06Z, which this row FOLDS into §6A in the same landing.
depends-on: REC-212.
scope: pass the draft's `statement_by` as `writer` at reviewCopy's one `#statementAcknowledgements` call; state the withheld count and its reason beside the list.
accepts-when: a writer's own row is absent from the review copy's list and counted beside it (the measured failure it moves: the writer's row listed among second readers). NEGATIVE CONTROL: drop the `writer` argument and the list names the writer, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-176 · integrated — **`gates.mjs` §2's DOC-FACING DOOR IS NOT PATH-GRANULAR: every doc-facing unit takes ANY `docs/` change, so `calibration.test.mjs` (which genuinely reads `kickoffs/SCHEDULER.md`) still runs on a MEASUREMENTS-only diff after M0-165 removed its false reader edge.** Found by M0-165's worker (M0-165 NARROWED to this). — owner M0.
status: integrated — integrated — RECORDED GREEN (worker's report to SCHEDULER #20, 22:39Z): land/worker/M0-176 @ 17f90f31, class FULL 360/360 suites green · 20682 assertions, `gates: RECORDED GREEN for tree 519dd211 (class FULLREUSE)`, exit 0 read unpiped; coverage --strict floors unmoved; control G23-G25 55/0 AS DECLARED (G24's empty-diff declaration corrected at its site). NARROWED, not done: its accepts-when waits on D-535 (placed after M0-193). FINDING 2, stated and NOT a row (no fix diagnosed; SCHEDULER #20's decision): this row's headline premise is wrong. `calibration.test.mjs` reads `docs/development/SCHEDULER.md` (line 542), NOT `kickoffs/SCHEDULER.md`. The kickoff edge exists only through gates.mjs §2b's basename probe, which cannot tell two files sharing a basename apart. Tightening it risks false greens, so it waits until someone measures over-selection on this estate.
order: after M0-170, AHEAD of the product rows by Bob's 17:41Z rule: every `docs/` diff runs doc-facing units it does not touch (gate time) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 18:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-165.
scope: a doc-facing unit takes only the `docs/` paths it, or a tool it runs, names; this changes selection estate-wide, so print each unit's before/after on a MEASUREMENTS-only and a kickoff-only diff.
accepts-when: a MEASUREMENTS-only diff no longer selects calibration, and a kickoff diff still does. NEGATIVE CONTROL: restore the whole-`docs/` door and calibration is selected again, by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### UI-103 · integrated — **THE PUBLISHED CASE PAGE NAMES THE PUBLISHER AS THE STATEMENT'S WRITER: `app.html` ~20591 (page 2) renders "Written by ${c.completeness.author}", while REC-212 split the two acts (`statement_by` wrote it, `author` published it).** The delegation RECORD (REC-212) → UI is on coord `CLAIMS.md`. — owner UI.
status: integrated — integrated — flipped 2026-09-24 ~22:28Z by SCHEDULER #20 on CONDUCT #20's verification (22:25Z): 5e6fe8a2, 297/297 · 17419 FULL, then 69/69 on its comment commit; UI harness 73/73; control 7/7 AS DECLARED; rides c20-batch27; it discharged the REC-212 → UI delegation itself.
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

### REC-210 · integrated — **ADOPTING A PROPOSED BIAS REVISION DOES NOT SAY SO: REC-187 re-pins the adoption to the adopted sha, but an adoption that pins a proposed, not-yet-accepted revision reads like any other.** BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias): *adopting a PROPOSED revision is a REPLACEMENT; the adoption must SAY it pins a proposed revision, and `op=biasadopt`'s answer and the adoption's read state that marker.* — owner RECORD.
status: integrated — integrated — flipped ~22:59Z by SCHEDULER #20 on CONDUCT #20's verification (22:57Z): 5cd28164 merged with 9f8b69e6, 360/360 · 20678 RECORDED GREEN; control A/B/C AS DECLARED; rides c20-batch27; CONDUCT mints its IC (I3 additive). Its case-document finding (the frozen bias_manifest has no pins_proposed field) went to BOB #34 for a /4 ruling; not rowed until ruled.
order: after D-468, with the bias rows (SCHEDULER #17, 2026-09-24; REC-187's worker F1)
milestone: M4
interface: I3 additive — a marker on the adoption's answer and read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption", with BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias).
depends-on: REC-187 (`integrated` on c19-batch9).
scope: record and publish the marker when the adopted revision is still proposed; the re-pin itself is built.
accepts-when: adopting a proposed revision answers and reads the marker; adopting an accepted one does not. NEGATIVE CONTROL: drop the marker, and the proposed-adoption arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-94 · integrated — **THE QUEUE CANNOT FORWARD A SELECTION: D-126 lets the plane take the set, and the member picker is per item.** — owner UI.
status: integrated — integrated — flipped 2026-09-24 ~22:20Z by SCHEDULER #20: WORKER UI-94 (session_0112MpTkDhs8e6RixvACKbTy) reported COMPLETE (queueSetOpsFor, 7 arms verified, 3 flags to CONDUCT #20); land/worker/UI-94 @ a3b8509c pushed. CONDUCT merges only on its green.
order: after D-176 (SCHEDULER #17, 2026-09-23; D-126's worker via CONDUCT #18 23:47Z)
milestone: M8
interface: I3 consumer (IC-235).
design: `docs/development/NOTIFICATIONS.md` (its Incomplete section names it), with D-126's per-item weight.
depends-on: D-126 (`integrated` on c17-batch7).
scope: a bulk forward over the queue's selection, sent as the set.
accepts-when: a selection of three forwards in one act. NEGATIVE CONTROL: loop per item, and the one-act arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

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

### D-527 · integrated — **A REOPENED PROPOSAL'S EARLIER DECISION REACHES NO PAGE: `op=proposals` publishes `prior_disposition` (proposalsFeed, REC-184) but no surface reads that op (UI-14 retired it for `op=queue`), and `op=queue`'s FINDING items carry `subject.definition_version` but not `prior_disposition`, so a member meeting the reopened question is shown one nobody has answered.** Found by UI-99's worker (id minted by it; stated in Framework §8.2's As-built paragraph). — owner RECORD, then UI.
status: integrated — integrated — flipped 2026-09-24 ~22:37Z by SCHEDULER #20 on CONDUCT #20's verification (22:34Z): d72e0a2b, full 354/354 · 20388; control (A) 55/3 AS DECLARED by name, (B) over-strictness 58/0; rides c20-batch27; CONDUCT mints and classifies its IC (I3 additive). Its UI follow-on is UI-109.
order: after UI-106, with the corrections: the record holding a decision the one op a surface reads does not carry (SCHEDULER #19, 2026-09-24; UI-99's worker 21:45Z)
milestone: M4
interface: I3 additive — `prior_disposition` on the queue's FINDING item; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions" (a reopened proposal carries the earlier decision as `prior_disposition`).
depends-on: REC-184.
scope: `op=queue`'s FINDING item publishes the proposal's `prior_disposition` (the object proposalsFeed already builds; no new derivation or table); a UI follow-on renders it and is rowed once this lands.
accepts-when: a revision-reopened finding on `op=queue` carries its prior disposition with state, reason, author, instant and `definition_version` (the measured failure it moves: the field absent from every surface-read op). NEGATIVE CONTROL: drop the field from the queue item and the reopened-item arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-527` minted by UI-99's worker).

### D-444 · integrated — **THE PROJECT OFFERS `reinstate` THAT THE STORE WILL REFUSE: the reinstate affordance's PROJECT arm keys on the count `cites_out.severed`, so a project whose only severed edges point at RETIRED items is offered the act, and REC-183's `#edgeTransition` refuses it RETIRED_NOT_CITABLE.** The worker states it at `affordances.mjs` beside the rule (*"The PROJECT arm is not narrowed"*). — owner RECORD.
status: integrated — integrated — flipped 2026-09-24 ~22:40Z by SCHEDULER #20 on WORKER D-444's own report (22:34Z): land/worker/D-444 @ 92ac43b5 (verified by ls-remote), gate GREEN 354/354 · 20393; affordances.test.mjs §0 pins the retired-target spelling count at two. Its finding D-553 is placed after UI-107. CONDUCT merges only on its own verification.
order: after UI-86: a correction to just-landed work (REC-183), an affordance that promises an act the record refuses; directly ahead of the census rows (SCHEDULER #17, 2026-09-23, REC-183's worker via CONDUCT #17, 22:09Z; verified at land/worker/REC-183 @ 27905f5d)
milestone: M8
interface: I3 additive — one new fact in `affordanceFacts`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is not citable; BOB #30), with the affordance contract that an offered act is one the store accepts.
depends-on: REC-183 (finished, awaiting integration).
scope: `affordanceFacts` gains a fact counting severed out-edges whose target is NOT retired (e.g. `cites_out.severed_reinstatable`), read by the same predicate `#edgeTransition` runs; the PROJECT arm keys on it. Extend `bio-plane/test/affordances.test.mjs`.
accepts-when: a project whose only severed edge targets a retired item is not offered reinstate; one with a severed edge to a live item is, and the store accepts it. How a liar passes it: dropping reinstate from projects entirely, so the live-target arm must be offered. NEGATIVE CONTROL: key the arm back on `cites_out.severed`, and the retired-only arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`; placed directly as a plan row, never a DEBT row — BOB #31, 2026-09-23 22:09Z).

### D-445 · integrated — **D-443's CAP ON `publishedCaseRegistryFor` IS PINNED BY SHAPE ONLY: it binds one `json_each` value, and `frontier-chunk.test.mjs` D443-7 asserts that structurally; its own header says it was never driven past 100 ids.** D-443 is NARROWED to this one trace, not closed. — owner RECORD.
status: integrated — integrated — flipped 2026-09-24 ~22:31Z by SCHEDULER #20 on CONDUCT #20's verification (22:28Z): 330dc978, 75/75 · 6138 GREEN, control 10/10 AS DECLARED incl. the casereg arm; rides c20-batch27; its accepts-when is met, so D-443's NARROWED trace closes when it lands. D-551 (minted by this worker: move every gitignored in-worktree pen to mkdtemp) is NOT PLACED, by SCHEDULER #20's decision: it contradicts BOB #33's 17:12Z ruling (in-worktree, gitignored, item-named pens STAND), and its narrow classes (an unignored, un-item-named or left-behind pen) are M0-182's and M0-172's ground.
order: after D-444: a correction to just-landed work (D-443), a guarantee the suite does not yet exercise (SCHEDULER #17, 2026-09-23; D-443's worker via CONDUCT #18 22:27Z (4), verified at c17-batch7 @ f32fe714)
milestone: M0 (a behavioural arm over M4 code)
interface: none — a behavioural arm.
design: `docs/development/VERIFICATION.md` (test through the op), with D-36's bound on bound variables.
depends-on: D-443 (`integrated` on c17-batch6).
scope: arm D443-7b seeds 120 ratified published cases pinning one finding sha and gates that finding through the op that reaches `gateFacts`. In `bio-plane/test/frontier-chunk.test.mjs`.
accepts-when: D443-7b is green through the op. NEGATIVE CONTROL: the existing `casereg` arm of `frontier-chunk.control.mjs` fails D443-7b by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-448 · integrated — **ELEVEN REVIEW-COPY REFUSAL CODES REACH A MEMBER WITH NO CANNED TRANSLATION: UI-68's surface now shows `REVIEW_NOT_PROJECT_OWNER`, `REVIEW_NO_PROJECT`, `REVIEW_DRAFT_CHANGES_PROJECT`, `REVIEW_NO_SUCH_CASE`, `REVIEW_DRAFT_TOO_LARGE`, `REVIEW_NO_RECIPIENT`, `REVIEW_NO_SECRET`, `REVIEW_NO_GRANT`, `REVIEW_NO_COMMENT_TEXT`, `REVIEW_UNKNOWN_ACT` and `NO_REVIEW_COPY`, and none has a DEC-49 row.** — owner RECORD.
status: integrated — SCHEDULER #21 23:45Z: tip 5eadd905; first gate RED then fixed, NO recorded GREEN; D-542 placed from it
order: after D-445: a correction to just-landed work (UI-68) that shows members untranslated codes (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M10
interface: none — a check family and its translations.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with DEC-49's translation rule.
depends-on: UI-68 (`integrated` on c17-batch7).
scope: a review-copy `*_CHECKS` family in `bio-checks.mjs` with DEC-49 regions and one canned sentence per code. Separately worth weighing: `check-refusal-codes.mjs` learning reach-by-op, since its R2 cannot see a code no surface names.
accepts-when: the refusal-code census reads every one of the eleven as translated. NEGATIVE CONTROL: drop one code's region, and the census arm names it.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### M0-188 · running — **THE GATE'S OWN REMEDY NAMES THE ONE-BUNDLE COMMAND: `verifyStatic` in `bio-plane/scripts/fleet-bundle.mjs` ends its staleness findings with "Run `npm run build` in <dir>/." at nine sites, so a worker following it rebuilds one bundle and meets the next stale one in the next gate.** Found by M0-178's worker (F1; with F2 and A6). — owner FLEET (the path), M0.
status: running — SPAWNED 2026-09-24 ~22:05Z by SCHEDULER #19 (dispatch) as WORKER M0-188 (SCHEDULER #19), base origin/main 9f8b69e6. Falsify rather than believe: a gate must actually PRINT the new remedy for a staled bundle, not merely lose the old string.
order: at the backlog head before D-512, AHEAD of the product rows: a wrong remedy in a gate message costs a red round per stale member (Bob's 17:41Z rule) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate's message names the act that fixes it), with M0-178's `tools/bundles.mjs`.
depends-on: M0-178.
scope: replace the nine sentences with "Run `node tools/bundles.mjs`, which rebuilds every bundle this change staled."; re-read `fleetbundles.test.mjs`'s quoted assertions; point FRAMEWORK.md's docprofile line at the same command (F2); add `tools/bundles.mjs` to `m041-instrument-census.mjs`'s INSTRUMENTS (A6).
accepts-when: no staleness finding names `npm run build` (the measured failure it moves: nine sites naming the one-bundle command). NEGATIVE CONTROL: restore one site's old sentence and the fleetbundles quoted-remedy arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-191 · integrated — **NOTHING READS THE SLOTS: a `running` row whose worker FINISHED, went BLOCKED or has no session holds a slot until a lane happens to look, and a `queued` row waits with nobody spawning it.** BOB #33 21:05Z (supersedes his 18:30Z and 18:33Z entries): measured 7+ of 16 workers idle at 21:03Z. — owner M0.
status: integrated — integrated — flipped ~23:06Z by SCHEDULER #20 on its worker's finish (session COMPLETED 22:51Z, 'slots audit passed') with land/worker/M0-191 @ ff3c7b9c pushed; NO gate line is stated anywhere, so it has NO recorded GREEN and CONDUCT merges only after verifying one.
order: at the head of the backlog, AHEAD of product (BOB #33 21:05Z: *now placed AHEAD of product: it cost 7+ of 16 workers*); SCHEDULER #20 dispatches by a scratch script until it lands (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none (a lane tool).
design: `docs/development/VERIFICATION.md` (an instrument states what it reads, never infers it), with `docs/development/WORK-PIPELINE.md` §1's cache states beside it, and BOB #33's ruling of 21:05Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: none.
scope: `tools/slots.mjs` reads a saved `list_sessions` listing on stdin (the cloud's `{ccr:{data}}` shape and the bare array) plus coord's QUEUE.md; matches `WORKER <ID> (` titles EXACTLY; prints FLIP (bucket COMPLETED with a pushed `land/worker/<ID>`), ANSWER (BLOCKED), RESPAWN-OR-READ (no session), SPAWN (queued, no worker) and the WORKING count (WORKING + REVIEW_READY, since gating reads REVIEW_READY); exit 1 when anything is owed. Port of BOB's `builder/slots.py`. Correction since the ruling (BOB #33 21:17Z): REVIEW_READY is NOT finished, and COMPLETED is a candidate the lane confirms by the worker's report, never a flip by itself.
accepts-when: on the 21:03Z listing it names D-476, D-518, UI-93, REC-199, REC-200, UI-102 and D-519 as FLIP candidates, UI-99 as ANSWER and D-516 as SPAWN (the measured failure it moves: 7+ idle slots nobody named). NEGATIVE CONTROL: match titles loosely and a `WORKER D-49` session satisfies D-492, failing by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-544 · integrated — **`13.statement-ack` PINS `CATALOG_VERSION`, so EVERY catalogue bump turns four gate checks red for a claim that says nothing about the version: construct-status's probe `export const CATALOG_VERSION = "1.28.0"` in `bio-plane/src/gate.mjs` (measured on main 9f8b69e6).** Found by D-463's worker: its bump made the probe MISS, and `status.mjs --check`, `status.test.mjs`'s zero-drift arm, plancheck's CONSTRUCT STATUS arm and `strandedwork`'s two plancheck-exit arms all followed — one cause, four failures. — owner M0.
status: integrated — integrated — flipped ~23:06Z by SCHEDULER #20 on its worker's finish (session summary 22:51Z: gate 87/87 suites green) with land/worker/D-544 @ 32ec64b8 pushed (BOB #34 22:59Z: do not wait for reports). CONDUCT verifies before merging. Finding: D-558.
order: after M0-191, AHEAD of product: it costs a diagnosis round in the gate of every row that moves the catalogue (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24; D-463's worker)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a probe pins what its claim asserts), with `docs/architecture/CORPUS-STANDARD.md` (construct-status is checked against the code at every push).
depends-on: none.
scope: drop the `CATALOG_VERSION` probe from `13.statement-ack`; its C-82.6 and C-82.7 probes already pin what it asserts. Sweep construct-status for any other claim probing a version constant and state each.
accepts-when: a catalogue bump leaves `status.mjs --check` at 0 drift (the measured failure it moves: 1 drift and four red checks on D-463's bump). NEGATIVE CONTROL: restore the version probe, bump the constant, and the zero-drift arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-512 · running — **`replay` IS HONOURED WITHOUT SERVER VERIFICATION: the end state BOB #33 ruled is that a replayed promotion of any type or revision names its drive-provenance capture, whose held bytes' preserved promotion record lists this bundle and this revision's `bundle.md` SHA-256.** — owner RECORD.
status: running — running — spawned 22:14Z 2026-09-24 by SCHEDULER #20 as WORKER D-512 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-512 and the session; never conclude queued from absence.
order: after D-511, which it builds on (BOB #33, 17:05Z: *the end state, a build that depends on (1)*; SCHEDULER #18)
milestone: M7
interface: I3 — the integrator classifies.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 "The RUN is an object", item 5 as BOB #33's ruling states it (folded on main e9b21be6), with REC-173's `migrationReplayOf`.
depends-on: D-511.
scope: generalise `migrationReplayOf` to every replayed promotion; keep D-511's class test as a second condition.
accepts-when: a replay whose capture does not list the bundle and SHA-256 is refused by name; a verified one is admitted. NEGATIVE CONTROL: skip the verification and the unverified arm is admitted, failing by name. AND INVERT §8 arm (δ), which D-511 pinned as the gap (admin-class replay still caller-asserted; via CONDUCT #20 19:47Z).
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:05Z; `node tools/mintid.mjs D`).

### M0-192 · integrated — **`d470-catalog-census.control.mjs` QUOTES `CATALOG_VERSION` AS A LITERAL NEEDLE, so every catalogue bump silently disarms its arm (d), MOVE THE VERSION: line 67 holds `'export const CATALOG_VERSION = "1.28.0";'`, hand-moved at c20-batch25 after it sat at 1.24.0 through four bumps (it would have thrown NOT ARMED).** Found by CONDUCT #20 (22:09Z). — owner M0.
status: integrated — integrated — flipped ~23:06Z by SCHEDULER #20 on its worker's finish (session summary 22:51Z: control reads CATALOG_VERSION from gate.mjs, 73/73 suites green, acceptance met) with land/worker/M0-192 @ e5aa15f3 pushed. CONDUCT verifies before merging. Finding: D-558.
order: after D-544, AHEAD of product: a control disarmed by an unrelated bump is a false gate result, and it recurs on every catalogue move (Bob's 17:41Z rule). Not merged with D-544: a different file and a different fix (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (a control breaks only the thing, and must arm on the tree it runs on).
depends-on: none.
scope: read the needle from `bio-plane/src/gate.mjs`'s own `CATALOG_VERSION` line at run time, never a literal; sweep the other `*.control.mjs` for a quoted version constant and state each.
accepts-when: with the constant bumped to a new value, arm (d) still arms and fails as designed (the measured failure it moves: NOT ARMED after a bump). NEGATIVE CONTROL: restore the literal needle, bump the constant, and the control reports NOT ARMED by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-528 · integrated — **THE QUEUE TELLS EACH NAMED RECIPIENT OF A BIAS-DEBT OBLIGATION "This is not addressed to anybody": `app.html` `queueAssigneeHtml` reads `assignee == null` and never `recipients`, so the surface states something it can see is false.** Found by UI-93's worker (id minted by it). The DELEGATION RECORD (D-86) → UI on coord `CLAIMS.md` is dischargeable by this row. — owner UI.
status: integrated — SCHEDULER #21 23:45Z: tip 85eb32dc; idle since 22:55 'verifying control driver placement', NO recorded GREEN
order: after D-512, with the corrections: a surface stating a falsehood about the record is worse than a missing feature (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:06Z)
milestone: M8
interface: I3 consumer (IC-234).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt).
depends-on: UI-93.
scope: when `recipients` is non-empty, render the members the record named; keep "not addressed to anybody" only when both are empty; discharge the D-86 → UI delegation.
accepts-when: an obligation with named recipients shows them, against a real-plane suite (the measured failure it moves: "not addressed to anybody" to a named recipient). NEGATIVE CONTROL: read `assignee` alone again and the named-recipient arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (placed; `D-528` minted by UI-93's worker).

### D-530 · running — **`op=attest` REFUSES A PARTED CAPTURE NO_SUCH_CAPTURE, a false statement that tells a member to re-capture a document the record holds: its pre-flight (index.mjs ~9194) heads only `captures/<whole sha>`.** The ratify gate's `hasCapture(sha)` may answer `{present:false}` off the same whole-key head (not yet driven). Found by D-476's worker (B, C). — owner RECORD.
status: running — running — spawned 22:27Z 2026-09-24 by SCHEDULER #20 as WORKER D-530 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-530 and the session; never conclude queued from absence.
order: after D-528, with the corrections: a refusal that says a held document is absent (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 21:06Z)
milestone: M2
interface: I3 — the refusal changes, or attest succeeds; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with D-476's whole-document lookup (`registerholds`).
depends-on: D-476.
scope: attest asks the whole-document question (`registerholds`) and attests the hash, or refuses by a code that says why (CAPTURE_HELD_IN_PARTS); FIRST drive the ratify gate's `hasCapture` on a parted capture and fix it the same way if it reads absent, stating the result either way.
accepts-when: attesting a held parted capture succeeds or is refused CAPTURE_HELD_IN_PARTS, never NO_SUCH_CAPTURE, and the ratify gate's reading is recorded (the measured failure it moves: NO_SUCH_CAPTURE for held bytes). NEGATIVE CONTROL: restore the whole-key head and the parted-attest arm reads NO_SUCH_CAPTURE by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-217 · integrated — **A RECIPIENT'S READING ON A NEW CASE'S DRAFT CANNOT BIND TO THE CASE IT PRODUCED: nothing links a draft to its published case, so REC-194's provisional counts such a reading UNDETERMINED.** BOB #33 RULED 2026-09-24 19:14Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20): `op=publish` names the draft it publishes (`draft=`, optional, additive), and at that act the readings taken through that draft BIND to the case it produced — an ACT, recorded with the publisher and the time, stated in words in the case document. — owner RECORD.
status: integrated — SCHEDULER #21 23:45Z: tip 727a1d85; BLOCKED only on reporting (depth 8), NO recorded GREEN
order: after UI-106 and before D-521, as BOB ruled: *one RECORD row after REC-194 … place C-82.1's retirement as a small row after this one* (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 additive — `draft=` on `op=publish`, the stated link on the case document; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rules 11 and 13 and the §9 frontier row "a draft bound to the case it produced", with BOB #33's ruling of 19:14Z, which this row FOLDS into §3 and closes in §9 in the same landing.
depends-on: REC-194.
scope: `draft=` on `op=publish`; the bind recorded with who and when; the case document states "readings given on draft <id>, which <publisher> named as this case's draft at publication"; the signed list carries those readings; without `draft=` REC-194's undetermined count stands.
accepts-when: a recipient's reading on a new case's draft appears in the published case's signed list with the link stated, and a publish without `draft=` still reads undetermined (the measured failure it moves: every such reading undetermined). NEGATIVE CONTROL: bind by statement bytes instead of the named draft, and a twin case with the same sentence lists the reader, failing by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs REC`).

### D-552 · integrated — **`op=instance` RENDERS A FINDING A MEMBER ALREADY DISMISSED AND SAYS NOTHING ABOUT THE DECISION: `#assembleInstance` (store.mjs ~25693) never consults `proposal_dispositions` (the disposition read lives in `proposalsFeed`), and civicos-ui `progPaintInstance()` renders `inst.findings` verbatim, so a dismissed finding reads as an open question on the progression page.** Against D-79 (a decision AGES a finding and is never silently absent). Found via D-527's integration (CONDUCT #20 22:34Z). — owner RECORD, then UI (UI-108).
status: integrated — SCHEDULER #21 23:45Z: tip da6fdb8a; suite 5/5 and control stated, NO recorded battery GREEN; no report (depth 8)
order: after D-540, with the corrections: a live surface stating an answered question as open (CLAUDE.md §2) (SCHEDULER #20, 2026-09-24; via CONDUCT #20 22:34Z)
milestone: M4
interface: I3 additive — a per-finding disposition view on two ops; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 (a decided proposal carries its decision) and §12 "age rather than vanish" (D-79).
depends-on: REC-184.
scope: `op=instance` and `op=captureprogressions` publish, per finding, the view `#dispositionVersionView` already computes (state, reason, author, instant, definition_version, applies). It is PUBLISHED, never used to hide a finding.
accepts-when: a dismissed finding on `op=instance` carries its disposition view with author and reason, and is still listed (the measured failure it moves: the decision absent from the instance read). NEGATIVE CONTROL: drop the view from `#assembleInstance` and the dismissed-finding arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by CONDUCT #20).

### D-533 · running — **`op=registeraudit` CALLS A PARTED CAPTURE'S BYTES MISSING AND THE RECORD UNSOUND: it heads only `captures/<whole sha>` (measured `unbacked: 1, sound: false`).** Found by D-476's worker (A). BOB #33 RULED 2026-09-24 21:17Z (cite until folded): YES — `sound` reads true for a row held IN PARTS when every part the record names is present, each part's digest verified; a fourth state "held in parts, all present"; a missing part is named; a row resolving neither way reads UNDETERMINED, counted OUTSIDE `sound`, never inside it. — owner RECORD.
status: running — running — spawned 22:37Z 2026-09-24 by SCHEDULER #20 as WORKER D-533 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-533 and the session; never conclude queued from absence.
order: after D-530, with the corrections: an audit calling held bytes missing (CLAUDE.md §2) (BOB #33, 21:17Z; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I3 — a fourth audit state; the integrator classifies.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home), with BOB #33's ruling of 21:17Z, which this row FOLDS into §8 in the same landing.
depends-on: D-476.
scope: head each part the record names and verify each part's digest; the fourth state; a missing part named; unresolvable rows UNDETERMINED outside `sound`.
accepts-when: a fully held parted capture audits "held in parts, all present" with `sound: true`, one missing part is named and makes `sound` false, and an unresolvable row is counted outside `sound` (the measured failure it moves: `unbacked: 1, sound: false` for held bytes). NEGATIVE CONTROL: head the whole key only and the parted arm reads unbacked, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-536 · running — **A READING DOES NOT CARRY ITS OWN PROVENANCE, so a re-read that returns different text is silent: nothing records the tier, the member that produced it, the pages transcribed, or a digest of the exact text classified.** FW-22's worker (finding 2, via CONDUCT #20). BOB #33 RULED YES 2026-09-24 21:25Z (cite until folded): a reading carries tier, producing member, pages transcribed and a SHA-256 of the exact text it classified; a re-read is compared to the earlier one and a disagreement is ATTRIBUTED ("tier 2 on ocr-worker returned different text for pages 3-4"); both readings are kept, neither overwrites; a reading from before this lands reads provenance UNDETERMINED, never inferred. Until it lands, M-143's rule stands (compare census runs only on tier 1 or on named documents). — owner CONTENT-PDF, then RECORD.
status: running — running — spawned 22:38Z 2026-09-24 by SCHEDULER #20 as WORKER D-536 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-536 and the session; never conclude queued from absence.
order: after D-533, in product order (BOB #33, 21:25Z: *after D-533*); the record's readings becoming attributable ahead of the risk-tier feature trio (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: I5 — the reading's provenance columns; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #33's ruling of 21:25Z, which this row FOLDS into §16 in the same landing.
depends-on: FW-22.
scope: record tier, producing member, pages transcribed and the text's SHA-256 on each reading; compare a re-read and attribute any disagreement; keep both; legacy readings read provenance undetermined.
accepts-when: a re-walk of D-66's sample reports, for each document whose class moved, which tier's text changed (the measured failure it moves: a silent re-read). NEGATIVE CONTROL: drop the text digest and the attribution arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### REC-214 · running — **NO MEMBER CAN SET OR REVISE AN ACTION'S RISK TIER AFTER INTAKE, AND A REVISION WOULD LEAVE NO TRACE.** BOB #33 RULED 2026-09-24 (sent 21:18Z; recorded in the inbox entry of 21:55Z) (UI-101's design gap; cite until folded): the `actionrisktier` op, not yet on main (member class, `contribute`), writing through the one front-matter path every reader derives the tier from; a machine credential is refused with the existing MACHINE_CANNOT_SET_RISK_TIER; a member MAY revise any tier, up or down, as an AUTHORED act recording who, when and a REQUIRED reason; APPEND-ONLY — the prior tier, its author and reason stay readable in the action's tier history; never a silent overwrite. — owner RECORD.
status: running — running — spawned 22:45Z 2026-09-24 by SCHEDULER #20 as WORKER REC-214 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/REC-214 and the session; never conclude queued from absence.
order: after D-533, first of the risk-tier trio in product order (plane, then UI-104, then REC-215), as BOB ruled; the field carries legal exposure, so the record must show a "do not file without counsel" was changed and by whom (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a new op and a tier history; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate; `risk_tier`), with BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20), which this row FOLDS into §2 in the same landing.
depends-on: D-510.
scope: the op; the append-only tier history on the action's read; "revised from 3 (by X) to 1 (by Y): <reason>" readable; a revision with no reason refused by name (catalogued, DEC-49).
accepts-when: a member's revision appends history naming both authors and the reason; a reasonless revision is refused by name; a machine is refused MACHINE_CANNOT_SET_RISK_TIER (the measured failure it moves: no revision path at all). NEGATIVE CONTROL: let a revision overwrite without history and the history arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-194 · integrated — **`kickoffs/WORKER.md`, READ BY EVERY WORKER, CARRIES EACH RULE'S HISTORY INLINE (3,959 words), so the current rule is buried and a ruling can go unread: tonight three workers were misled, and BOB #33's 17:12Z pen ruling never reached the file.** BOB #34 22:50Z. — owner M0 (BOB drafts; any worker may land it).
status: integrated — SCHEDULER #21 23:45Z: tip 3325a474 (merges land/bob/batch-0924f); summary 'checks pass', NO recorded N/N GREEN; no report (depth 8)
order: at the head of the backlog, AHEAD of product (BOB #34 22:50Z: *it appreciably cuts wasted worker rounds: three sessions were misled tonight*) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the reading budget: a file read whole is sized to be read whole), with CLAUDE.md §1's READING BUDGET and BOB #34's ruling of 22:50Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: none.
scope: rewrite WORKER.md so each rule is one or two lines naming its ruling id; move the receipts and narratives VERBATIM to `docs/archive/WORKER-kickoff-2026-09-24.md`, where `decided.mjs` finds them; nothing deleted; set its readbudget to half of 3,959 words. The current pen rule (BOB #33 17:12Z: a driver's gitignored, item-named pen is not scratch) and `store=scratch` (BOB #34 22:22Z: redundant, not optional) must be stated. Other kickoffs follow one at a time only if this measurably cuts misreads.
accepts-when: `readbudget` shows WORKER.md at or under the new budget, `decided.mjs` still finds every ruling it cited, and every old rule maps to a new line (a table in the row's measurement) (the measured failure it moves: a 3,959-word file burying current rules). NEGATIVE CONTROL: drop one mapped rule and the mapping table names it.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs M0`).

### D-545 · integrated — **`civicos-ui/check-semantics.mjs` (~352) HARVESTS PLANE STATES OVER THE RAW STORE FILE, COMMENTS INCLUDED, with `/current_state\s*[!=]==?\s*"([a-z_]+)"/`, so a `typeof` guard on that field is read as a state named after the typeof string, and the gate goes RED with "states the store writes with no semantics row" naming a state nobody wrote.** It cost REC-210 two full gate rounds, the second from a comment quoting the pattern (CONDUCT #20 22:57Z). — owner UI (the check), M0.
status: integrated — SCHEDULER #21 23:45Z: tip a812be34, summary states 71/71 green; no report (depth 8)
order: after M0-194, AHEAD of product: a false RED that has already cost two full gate rounds (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument names what it read, and a false red is a defect in the instrument).
depends-on: none.
scope: blank comments before harvesting; refuse a match preceded by `typeof` or whose right-hand side is not a catalogue state, and report it as an UNRECOGNISED MATCH, never as a state. Apply the same two guards to the `#setScalar` harvest beside it.
accepts-when: a planted `typeof x.current_state === "string"` guard and a commented-out quote of the pattern leave the state set unchanged and are reported as unrecognised matches (the measured failure it moves: a RED naming a state nobody wrote). NEGATIVE CONTROL: harvest the raw file again and the planted guard is read as a state, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by CONDUCT #20).

### D-549 · running — **NO_PUBLISHED_STORE ON THE PUBLIC `op=publishedbytes` AND `op=publishedcase` REACHES AN ANONYMOUS CALLER UNTRANSLATED: it is minted at two sites (`index.mjs` ~5747 a literal, ~5900 a ternary shared with OBJECT_MISSING; main 9f8b69e6), has no DEC-49 translation, and `app.html` names it 0 times, so the public reads a machine token.** Found by D-513's worker (via CONDUCT #20 22:59Z). — owner RECORD.
status: running — running — spawned 23:03Z 2026-09-24 by SCHEDULER #20 as WORKER D-549 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-549 and the session; never conclude queued from absence.
order: after D-540, with the corrections: a public door answering in machine vocabulary (D-484's settled shape; CLAUDE.md §2) (SCHEDULER #20, 2026-09-24)
milestone: M10
interface: I3 — a translation added and a mint site consolidated; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: none.
scope: one governed helper and DEC-49 region minting NO_PUBLISHED_STORE for ONE condition, with its canned translation; the ~5900 ternary says which code it mints under which condition. Move each refusal-code floor to its printed figure.
accepts-when: both public ops answer NO_PUBLISHED_STORE with its translation from one site (the measured failure it moves: an untranslated code at two sites). NEGATIVE CONTROL: restore the literal at ~5747 and check-refusal-codes names the second site.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-513's worker).

### D-558 · integrated — **`bio-plane/test/ratify.test.mjs` (~240) PINS THE CATALOGUE VERSION AS A LITERAL, `"plane-gate/1.0 (bio-checks 1.28.0)"`, so every catalogue bump turns it red and it has been hand-corrected at each (five CORRECTED notes above it).** Found by D-544's and M0-192's workers independently. — owner M0.
status: integrated — SCHEDULER #21 23:45Z: tip d614da45, commit states GATE 74/74 GREEN (TARGETED); worker could not report (depth 8)
order: after D-545, AHEAD of product: the same bump-cost class as D-544 and M0-192, a red round on every catalogue move (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite pins what its claim asserts, read from the source, never a literal).
depends-on: none.
scope: build the expected string from `CATALOG_VERSION` imported from `bio-plane/src/gate.mjs`; keep the arm's point (the ratification records the CATALOGUE's version, not the gate's own) with a second arm that fails if the gate's own version is recorded instead; sweep `bio-plane/test/` for any other literal catalogue version and state each.
accepts-when: a catalogue bump leaves the suite green, and recording the gate's own version fails by name (the measured failure it moves: a red on every bump). NEGATIVE CONTROL: record `plane-gate/1.0` alone and the catalogue-version arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-521 · running — **IC-246's STATEMENT_ACK_DOCUMENTS_OVER_BOUND (C-82.1) IS UNREACHABLE BY CONSTRUCTION: after REC-194 its read names (case_id, edition), `case_documents`' primary key, so at most one row returns and the bound can never fire.** Found by REC-194's worker (F1). — owner RECORD.
status: running — running — spawned 23:07Z 2026-09-24 by SCHEDULER #20 as WORKER D-521 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-521 and the session; never conclude queued from absence.
order: after REC-213, with the corrections to just-landed work: a catalogued refusal that cannot occur is a claim the record makes about itself (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M10
interface: I3 — a catalogued code retired; the catalogue version moves; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13.
depends-on: REC-194.
scope: collapse the read to `#one`; remove the bound, C-82.1, its DEC-49 region `is-statement-ack-documents-bound` and block 8's bound arms; move each refusal-code floor to its printed figure.
accepts-when: C-82.1 and its region are gone and the census floors read their printed figures (the measured failure it moves: a code no input can reach). NEGATIVE CONTROL: restore the region without its reachable site and check-refusal-codes names the orphan.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-524 · running — **A MONITORED BUNDLE WITH AN ARCHIVE-SOURCED BASELINE READS "no captured baseline" FOREVER: `op=acquire` sets `body.locator = sel.replay`, so the register row names the Wayback replay URL while the capture files under the CDX original, and op=monitor's register lookup never finds it.** D-472's defect surviving on the ARCHIVE arm; found by D-472's worker (F1). — owner CAPTURE.
status: running — running — spawned 23:07Z 2026-09-24 by SCHEDULER #20 as WORKER D-524 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-524 and the session; never conclude queued from absence.
order: after D-521, with the corrections to just-landed work: a monitor that reads no baseline where one is held (CLAUDE.md §2) (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: I5 additive — `archiveHop` gains `document_address`; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-472's Drive arm as the precedent.
depends-on: D-472.
scope: give `src/cdx.mjs` `archiveHop` a `document_address` key as `driveHop` has; op=monitor's register lookup prefers the row whose hop names the bundle's locator.
accepts-when: an archive-sourced baseline is found by op=monitor and two unchanged ticks read `unchanged` (the measured failure it moves: "no captured baseline" on every tick). NEGATIVE CONTROL: drop the hop key and the archive-baseline arm reads no baseline, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-525 · running — **A PRE-CAP-8 DRIVE BASELINE IS A CAPTURE OF GOOGLE'S SHELL, so its monitor reads `modified` on every tick permanently, and nothing lists which bundles carry one.** Found by D-472's worker (F3). — owner CAPTURE.
status: running — running — spawned 23:07Z 2026-09-24 by SCHEDULER #20 as WORKER D-525 (SCHEDULER #20), base 9f8b69e6. Falsify: with no live worker, read land/worker/D-525 and the session; never conclude queued from absence.
order: after D-524, the same monitor path; low: the fix is a re-acquire (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:14Z)
milestone: M3
interface: none unless a read is added (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6, with CAP-8's Drive export arm.
depends-on: D-472.
scope: a sweep listing Drive-address bundles whose baseline capture's handler is an HTML stack (a shell); re-acquire each through the export address, recorded as a new capture, never overwriting the old.
accepts-when: the sweep names every shell baseline and a re-acquired one reads `unchanged` across two ticks (the measured failure it moves: a permanent `modified`). NEGATIVE CONTROL: skip the re-acquire and the two-tick arm reads `modified` by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### D-526 · queued — **WHICH REFUSAL A CALLER MEETS ON `op=promote` STILL DEPENDS ON THE ENVELOPE: the fences above bundle.md's parse (NAME_TAKEN, CITED retirement, LAWS_ACT carry-forward) read the envelope's type, and `#projectRow`'s action columns compare `fm.object_type === "action"` raw, not through `normalizeType`. Nothing wrong can land (D-510's fence refuses it).** Found by D-510's worker (F1, F3). — owner RECORD.
order: after D-525, with the promote corrections: the answer a caller meets should not depend on a label D-510 ruled untrusted (SCHEDULER #19, 2026-09-24; via CONDUCT #20 20:25Z)
milestone: M7
interface: none unless a refusal's order changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510's derivation.
depends-on: D-510.
scope: parse bundle.md at the top of promote's `act` and derive the type there for every fence; route `#projectRow`'s comparison through `normalizeType`.
accepts-when: an envelope-mislabelled action meets the same refusal as a correctly labelled one (the measured failure it moves: fences reading the envelope's type). NEGATIVE CONTROL: read the envelope's type in one fence again and that arm's refusal differs, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

### M0-170 · queued — **THREE MORE FIXTURES KEEP HAND-KEPT TOOL COPY LISTS: `pushguard.test.mjs` scratchRepo, `pushguard-check.test.mjs` and `retirable.test.mjs` (measured correct today).** Found by M0-154's worker. — owner M0.
order: after M0-169, whose static mode it wires (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:50Z) AHEAD of the product rows by Bob's 17:41Z rule: a new import in gates.mjs breaks a hand-copied fixture with a false red (a false gate result costs a round) (SCHEDULER #19, 2026-09-24).
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-169.
scope: wire the three to M0-169's static-only mode; delete the hand lists. ALSO (M0-169's F3, via CONDUCT #20 19:37Z): `bio-plane/test/instrument-deps.mjs` (D-265) calls `moduleClosure({ dynamic: false })` and maps to basenames, keeping its `outside` check (coverage-provenance, owed-controls, m051-driver-census).
accepts-when: an import added to the subject leaves all three green. NEGATIVE CONTROL: restore one hand list, add an import, and that suite fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-541 · queued — **`tools/rowsubstrate.mjs` `anchorPairs` CAPTURES DIGITS AND DOTS ONLY (`§\s*(\d+(?:\.\d+)*)`), so `§6A` reads as `6`, and D-404's design-coverage arm falsely notes "substrate not evident" for REC-213, REC-199 and D-448.** Found by REC-213's worker (via CONDUCT #20 22:11Z). A false NOTE, not a failure. — owner M0.
order: after M0-142, with the process rows behind the product rows ahead of them: it prints a false note but fails nothing, so it does not cut gate time (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads, never a neighbour of it).
depends-on: none.
scope: capture `(\d+(?:\.\d+)*[A-Za-z]?)`, compute depth from the dotted part, and escape the letter in `sectionText`.
accepts-when: rowsubstrate reads REC-213's `§6A` as §6A and the three false notes are gone (the measured failure it moves: three rows noted "substrate not evident"). NEGATIVE CONTROL: restore the digits-only capture and the §6A arm reads §6, failing by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by REC-213's worker).

### D-550 · queued — **NO GATED INSTRUMENT HOLDS A CATALOGUED REFUSAL CODE TO ONE MINT SITE: `bio-plane/test/dec49-onecode-twoconditions.sweep.mjs` measures it (60 multi-site candidates today) but has no floor, ceiling or gate, so a new second site passes silently.** Found by D-513's worker (via CONDUCT #20 22:59Z). — owner M0 (the instrument).
order: after D-535, with the process rows behind the product rows: it prevents a regression and does not cut gate time (Bob's 17:41Z rule) (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a measurement that gates nothing is not an instrument), with DEC-49's one-code-one-condition rule as D-484 settled it.
depends-on: none.
scope: a gated CEILING arm in check-refusal-codes' ratchet shape at the printed count of multi-site codes, with the deliberate closures declared BY NAME (RATE_IP and RATE_GLOBAL, VERSION_ACT_UNWRITABLE); the ceiling only moves down.
accepts-when: the gate reads the ceiling at its printed figure, and a planted second mint site of a single-site code fails by name (the measured failure it moves: 60 candidates, none gated). NEGATIVE CONTROL: plant the second site, and the ceiling arm fails naming the code.
added: 2026-09-24 · SCHEDULER #20 (id minted by D-513's worker).

### D-559 · queued — **TWO NEGATIVE-CONTROL HARNESSES HAVE DECAYED (D-353 decay mode c), on origin/main as on the branches: `nc-rec66.mjs` ARM 1 throws "anchor is not unique" on `const scan = this.#rows(` (store.mjs now holds more than one such line), and `nc-rec129.mjs` reports 10 of 19 arms "DID NOT ARM" with every restore byte-identical.** Found by M0-182's worker (via CONDUCT #20 23:00Z). — owner M0.
order: after D-550, with the process rows behind the product rows: the controls fail loudly rather than pass falsely, so no gate result is wrong today (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (a control must arm on the tree it runs on).
depends-on: none.
scope: re-anchor each arm on the current source, one unique anchor per arm, then run each control AS DECLARED and record it on its suite's NEGATIVE CONTROL line.
accepts-when: `nc-rec66` arms all arms and `nc-rec129` arms 19 of 19 AS DECLARED (the measured failure it moves: one throw and 10 unarmed arms). NEGATIVE CONTROL: the harnesses are the controls; re-run each whole and record the counts.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs D`).

### D-537 · queued — **M0-37'S CONTROL HAS NOT RUN SINCE THE COORD CUTOVER: `bio-plane/test/delegations.control.mjs` reads and writes `docs/development/CLAIMS.md` FROM THE WORKTREE, which since M0-110 is a 218-byte coord-pointer stub, so its byte floor refuses at the first arm (on origin/main too).** Found by M0-182's worker (via CONDUCT #20 23:00Z). — owner M0.
order: after D-559, with the process rows behind the product rows: a control that cannot run is loud, not a false green (SCHEDULER #20, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register", with TREE-SHARING.md §1's coord files (M0-110).
depends-on: none.
scope: read and write CLAIMS.md through `tools/coord.mjs` readState/writeState, as `tools/delegations.mjs` already does, on a planted local coord ref, and floor the byte count on the coord content.
accepts-when: the control runs every arm AS DECLARED against the coord content (the measured failure it moves: refused at the first arm by the stub's byte floor). NEGATIVE CONTROL: point the read back at the worktree path and the byte-floor arm refuses by name.
added: 2026-09-24 · SCHEDULER #20 (id minted by M0-182's worker).

### D-520 · queued — **THE RENDER RESERVATION'S 30,000 ms NAVIGATION BOUND IS CHOSEN, NOT MEASURED, AND NOTHING CAPS CONCURRENT RENDERS: D-492 made the allowance an honest account, not a throttle.** BOB #33 RULED YES to both, 2026-09-24 19:11Z (cite until folded). — owner CAPTURE.
order: after D-478, in normal product order behind D-64's render rows (BOB #33, 19:11Z: *product, not ahead of it*; SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the waiting render's state is published (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` "What Workers Paid actually buys, for this project" (DEC-42; re-pointed 2026-09-24 by SCHEDULER #19 from §"There is no collision", which the document marks SUPERSEDED — D-490's finding) and "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep", with BOB #33's ruling of 19:11Z, which this row FOLDS into CLIENT-RENDERED as a RULED line in the same landing.
depends-on: D-492, D-490.
scope: (1) measure navigation times over the client-rendered sources already captured, recorded in `measurements/<id>.md` with date and instrument, and set the reservation's bound from the measured tail, stating the figure and its source at the site; (2) a concurrency cap from the platform's stated concurrent-browser limit, labelled the vendor's claim until measured; a render over the cap WAITS in the reconciling alarm, never dropped; a render that cannot run is recorded undetermined with its reason, never as a capture that found nothing.
accepts-when: the bound reads from a measurement id, and a burst above the cap renders no more than the cap at once with the rest completing later (the measured failure it moves: an unmeasured 30,000 ms and an uncapped burst). NEGATIVE CONTROL: remove the cap and the burst arm counts more concurrent renders than the cap, failing by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs D`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
