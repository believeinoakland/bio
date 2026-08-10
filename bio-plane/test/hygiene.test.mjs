/* NEGATIVE CONTROL: (run 2026-07-31) remove the `.dispose()` calls from a scanned suite (scheduler.test.mjs, temporarily) so a Miniflare is built but never shut down -> 1 assertion fails ("scheduler.test.mjs disposes all 1 of its Miniflare instances"); restored, 144 pass. (An unescaped backtick in setup.mjs's SETUP_HTML template is the other subject this suite guards; the dispose scan is exercised here.) (run 2026-08-03, REC-27/D-137) remove the project_participants DELETEs from store.mjs's purge (both arms) -> 1 assertion fails naming it: "51 of 52 tables covered by purge or a stated exemption (uncovered: [\"project_participants\"])"; restored, 199 pass. (run 2026-08-04, M0-8/D-186) strip the `import "./sandbox.mjs"` line from a scanned suite (purge.test.mjs, temporarily) so it mints temp files with nothing owning them -> 1 assertion fails naming it ("purge.test.mjs imports test/sandbox.mjs"), 342 pass; restored byte-identical (sha256 f2ee2192…). The SUBJECT's own control is in scripts/battery.mjs, not here: comment out `process.on("exit", sweepSandbox)` in test/sandbox.mjs and the battery exits 1 with "LEAKING 84 miniflare sandbox(es) in 84 director(ies)" while all 95 suites still report green — which is the pre-fix state, and the reason the leak went unnoticed for weeks. (run 2026-08-04, REC-48) hand-type a capture grade letter back into any module of src/ — op=acquire's note, op=earnedbasis's ceiling sentence, or a new statement in a module nothing else guards -> the sweep FAILS naming the file, the line and the string, while the suite that OWNS that sentence stays green. The three arms are below IN THIS SAME DECLARATION, each RUN. (run 2026-08-08, M0-10/D-235) restore the shared literal to a scanned suite, putting `const ROOT = "/tmp/civicos-fixture";` back into migrate.test.mjs -> the containment arm FAILS naming the file and the path, 487 pass 1 fail ("no suite roots a filesystem ground at an absolute literal (1 found: [\"migrate.test.mjs: /tmp/civicos-fixture\"])"); restored byte-identical, verified by sha256 AND by cmp. (b) neuter the ground detector itself, so its pattern matches nothing -> the REACH arm fails ("the ground detector catches all 3 planted literals"), 487 pass 1 fail, WHILE the corpus arm above still passes over a clean estate — which is the whole reason the reach arm exists, since a detector that finds nothing passes everything. (c) widen the detector to any quoted absolute literal, the over-strictness direction -> "and flags none of the 5 derived forms" FAILS and the corpus arm reports 687 false findings from URL pathnames, 486 pass 2 fail. (run 2026-08-09, M0-21/D-268) THE CROSS-FILE WALK->FLOOR BLOCK AT THE FOOT OF THE CLASS CENSUS: its eight arms live in `test/walkfloor.control.mjs` and are re-run in one step with `node test/walkfloor.control.mjs [arm]`. The three that move THIS suite are (a) `hop` — stop seeding a binding from an imported walk-derived export -> 567 pass 3 fail, the split, the self-application and the guarded/named arms all falling together; (b) `modulegrain` — grade at MODULE granularity instead of BINDING granularity -> 569 pass 1 fail, the FALSE-POSITIVE arm alone, because `LEDGER.length >= 20` starts being reported and that is the shape which gets a check switched off; (c) `ratchet` — add a NEW consumer that floors on a walk one import away with no provenance guard -> 569 pass 1 fail NAMING the new file, which is the ratchet firing on a new instance rather than being believed on its existence. The OVER-STRICTNESS arm is `overstrict` (a new consumer that floors AND asks provenance.mjs) and it must stay GREEN at 570 pass 0 fail. **The BASELINE arm went RED on its first run and the failure was this item's own new suite, not the arm** — `walkfloor.test.mjs` minted temp directories without `import "./sandbox.mjs"` and the D-186 rule above caught it; without a baseline row that reading was not available. (run 2026-08-09, D-249) THE PORT PIN — five arms, declared here and run in one step by `node test/d249-port.control.mjs [arm]`, deliberately NOT a `.test.mjs` because it EDITS REAL SOURCES. Each armed ALONE, others held open, every restore verified by sha256 AND `cmp` against a UNIQUELY-NAMED per-arm pristine copy with a byte count printed and a 1,000-byte minimum guarded. (a) `baseline` — nothing armed, 594 pass 0 fail, and it is not decoration: it is what distinguishes five-arms-working from five-arms-broken. (b) `plant` — put a real `port: 8787` into `bootstrap.test.mjs`'s Miniflare options, where a real one would actually be written rather than in a comment where it would prove less -> 593 pass 1 fail, the CORPUS arm naming the file and the number. (c) `neuter` — make `PORT_PIN` match nothing -> 593 pass 1 fail on the REACH arm WHILE THE CORPUS ARM STAYS GREEN, which is the whole reason a reach arm exists, since a detector that finds nothing passes every clean corpus. (d) `widen` — grade any 4-digit number as a port, the OVER-STRICTNESS direction -> 592 pass 2 fail with **5,158 false findings** from dates and ids over the real corpus. (e) `zero` — remove the `port 0 is derived` exclusion -> 592 pass 2 fail, and it FALSE-POSITIVES ON REAL CORRECT CODE (`migrate.test.mjs:147` genuinely writes `port: 0`), which is what makes that one predicate load-bearing rather than theoretical. **THE `widen` ARM CAME BACK NOT-AS-DECLARED ON ITS FIRST RUN AND THE HARNESS WAS WRONG, NOT THE ARM** — the tally read `-1` because this suite's `process.exit()` discards unflushed PIPE writes (191,434 bytes reached a file, 89,329 reached a pipe; not `maxBuffer`, which was raised to 64 MB and changed nothing). The control now captures to a FILE. That is D-282 and it reaches the whole battery, which spawns every suite on a pipe.
   (run 2026-08-04, M0-9) FOUR ARMS ON THE REGISTER ITSELF, each broken ALONE, every file restored BYTE-IDENTICALLY with sha256 compared before and after (scripts/control-register.mjs caeac36b…, scripts/coverage.mjs a5df1b87…, test/acquire.test.mjs e065c8e0…, test/hygiene.test.mjs f66974ac…, test/capture.test.mjs e71bf8b8…); whole = this suite 384 pass, register 98 of 98 at 246 arms. (a) HIDE A SUITE'S DECLARATION ENTIRELY — replace every control marker in acquire.test.mjs -> `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` read unpiped EXITS 1, reports 97 of 98 and NAMES acquire.test.mjs under "No declared control"; arms 246 -> 241, exactly that suite's five. (b) TRUNCATE A MULTI-ARM BLOCK — cut this suite's own declaration from 8 lines to 5 by dropping arms (i), (ii) and (iii) -> the register reports this declaration at 6 arms instead of 9 and the total at 243 instead of 246, while --strict STAYS exit 0. That is the design and not a miss: arms are REPORTED and never gated, so the visible drop is the whole mechanism by which a shrinking control gets noticed. (c) PUT THE 60-LINE HEAD WINDOW BACK into scripts/control-register.mjs -> this suite 381 pass, 3 FAIL, and the three are exactly the window arms ("a control declared past line 60 is found", "...on the line it was actually written on", "a declaration straddling line 60 is read WHOLE"). (d) MAKE THE DETECTOR FIRST-LINE-ONLY -> this suite 377 pass, 7 FAIL, and the REAL-CORPUS arm bites alongside the fixtures: "the tree itself declares at least one MULTI-LINE control" reports []. The register's total falls to 234 arms, which is EXACTLY what the old detector reported over this same tree — so (d) reproduces the defect this item closed rather than merely resembling it. ONE PROPERTY WORTH KNOWING BEFORE THE NEXT SESSION RE-RUNS THESE: the register's arm TOTAL is a function of the declarations' own prose, so writing this record into a declaration moves the total upward — the four totals above are as measured at the moment each arm ran, and it is the DELTAS that the controls establish. Never compare an absolute total across two edits of the register's own text.
   (run 2026-08-08, M0-14/D-233) SIX ARMS ON THE ARM MATCHER, DECLARED HERE AND RUN BY `test/register.control.mjs` — deliberately NOT a `.test.mjs` because it EDITS REAL SOURCES while it runs, so the battery must not discover it (`suggest.control.mjs`'s precedent). Re-run in one step: `node test/register.control.mjs` from bio-plane/. Each arm is armed ALONE with the others held open, each DECLARES BEFORE IT RUNS what must fail AND what must not, and every restore is verified against a PRISTINE pre-arm copy by sha256 AND by content. Baseline at the moment they ran: `--strict` exit 0, 470 arms, 119 classified, corpus 120, 1 unclassified; this suite 503 pass. (1) THREE REAL ARMS DELETED — strip the ordinals from suggest.test.mjs's arms (6), (7) and (8) -> `--strict` EXITS 1, the REGISTER FLOOR fires at "467 arms stated, floor is 470", and suggest still declares a control with classified and corpus unmoved. (2) THE ARM THIS ITEM EXISTS FOR — rewrite capture.test.mjs's single transition in a marking the matcher was never taught (` ==> `) -> `--strict` EXITS 1 and NAMES capture.test.mjs as UNCLASSIFIED, unclassified 1 -> 2, and it is NOT scored zero and NOT reported as declaring no control. (2b) THE POSITIVE HALF, because naming alone would be a walk that never counts anything new — add two arms to capture.test.mjs as an ordinal list with NO arrow anywhere -> `--strict` STAYS exit 0 and the tally RISES 470 -> 472. (3) NEUTER THE WALK — make the ordinal matcher unmatchable in scripts/control-register.mjs -> this suite 499 pass, 4 FAIL naming the arrowless-corpus arm, the arrowless fixture, its delta and the max-not-sum arm; `--strict` EXITS 1 on the floor (416 arms, 117 classified) AND on newly-unclassified suites (strengthpair, suggest) — while the register still READS 120 suites, because a matcher narrowed to nothing must not report a triumphant figure over an empty corpus. (4) OVER-STRICTNESS — put prose into capture.test.mjs's declaration that MENTIONS an arm ("see (b) of the block...") without declaring one -> nothing fails and the tally does NOT move, 470 before and 470 after. (5) THE FLOOR HAS NO SLACK — remove EXACTLY ONE arm from strengthpair.test.mjs -> `--strict` EXITS 1 at 469 against a floor of 470. SIX ARMS RUN, ZERO behaved other than declared; all four touched files restored sha256 EQUAL and content IDENTICAL. THE SAME PROPERTY M0-9 RECORDED APPLIES HERE AND IS WHY THESE ARE DELTAS: writing this record into a declaration moves the total upward, so never compare an absolute total across two edits of the register's own text.
   (run 2026-08-08, REC-68) THE SCHEMA-COMMENT / VOCABULARY CORRESPONDENCE ARM, the rider D-228 came in with. It exists because CORRECTING the stale comment once is worth almost nothing: nothing stopped `inquiry_basis.grade_source` naming three sources while GRADE_SOURCES carried five, so nothing would stop the sixth. Armed ALONE, restored against a pristine pre-arm copy verified by sha256 AND `cmp`. (1) DROP A SOURCE FROM THE COMMENT — delete `| 'capture'` from schema.mjs's grade_source line -> this suite FAILS 2 naming it ("the comment names every grade source the catalogue carries" reports ["capture"], and the REACH delta reports 4 against 5); restored. (2) INVENT ONE — add `| 'guess'` -> FAILS 2 in the other direction, the invention arm reporting ["guess"], because a comment that can omit a value can also make one up. (3) NEUTER THE ARM — make the column matcher unmatchable -> the REACH delta FAILS at 0 against 5 rather than passing triumphantly over an empty list, which is the whole reason it is a delta. (4) THE `#migrate` TRAP, and it CAUGHT THE AUTHOR IN THE SAME TURN: put a semicolon back inside the comment -> FAILS naming it. This is not hypothetical — REC-68's own first draft of the comment contained `(REC-68);` and this arm is what found it, before `node --check` or the backtick scan could have.
   SHAPE RESTORED BY M0-9 (2026-08-04), and it is the point rather than tidying. REC-48 wrote the arms as a continuation of this block, `coverage.mjs` then reported BOTH this suite and acquire.test.mjs as declaring NO CONTROL — its detector could not read past the marker's own line — and the arms were moved into a second comment the register never saw, so the register quoted a summary while the evidence sat outside it. The detector now reads the whole block (scripts/control-register.mjs) and is itself asserted at the foot of this suite; the arms are back where they belong. A declaration ends at its comment's close or at a blank line, so keep this paragraph unbroken and it stays one declaration.
   REC-48's THREE ARMS, in full:
   (run 2026-08-04, REC-48) THE SWEEP THAT SAYS NO SURFACE SPELLS A CAPTURE GRADE LETTER, three arms, each broken ALONE, every file restored BYTE-IDENTICALLY with sha256 compared before and after (src/index.mjs 16cf4e2f..., src/store.mjs 7c1ed3aa..., src/cdx.mjs a9e5912c..., checks/bio-checks.mjs d8da7b9d...); whole = 369 pass. Each arm ALSO reports what the suite that OWNS the mutated sentence did, because that contrast is the point.
   (i) THE THIRD STATEMENT PUT BACK — replace `note: ACQUIRE_GRADE_NOTE,` in src/index.mjs with the sentence hand-typed -> 367 pass, 2 FAIL, detector (A) and detector (B) both naming `index.mjs:1822 "Grade B"` and `"Grade A"`, WHILE acquire.test.mjs STAYS 79/79 GREEN. A copy identical to the composition satisfies every behavioural and wire assertion at zero cost; only this sweep can see it, which is why it exists one altitude above the three suites that own the sentences.
   (ii) THE FOURTH STATEMENT PUT BACK — hand-type `Grade A` into op=earnedbasis's `ceiling:` sentence in src/store.mjs -> 367 pass, 2 FAIL naming `store.mjs:5191 "Grade A"`, WHILE earnedbasis.test.mjs STAYS 54/54 GREEN. Same shape on the sentence REC-48's own scope had not counted, which is how it was found.
   (iii) A FIFTH STATEMENT, WRITTEN LOWERCASE, IN A MODULE NOTHING ELSE GUARDS — append `export const __FIFTH = "a replay capture is grade b: bytes as the archive served them.";` to src/cdx.mjs -> 368 pass, 1 FAIL, and it is detector (B) alone: `cdx.mjs:121 "grade b"`. DETECTOR (A) IS SILENT. That is the arm that earns (B) its existence rather than arguing for it — (A) matches the doctrine's capitalised term and a new statement need not use it. Ran under the ceiling-moved-to-C arm too, where (B) additionally reports `store.mjs:4587 "grade C"`: predicted in the block's own comment, and correct rather than noise — a tree in which one letter carries two doctrines has become ambiguous to a reader.
   REC-51's FIVE ARMS, FOLDED IN HERE 2026-08-04 BY REC-46 on REC-51's own written instruction. They were recorded at the assertion site because M0-9 held this block at the time and not one byte of it could be touched; M0-9 has landed, so they are back where the register reads them. Verbatim as run, whole suite 378 pass, every file restored BYTE-IDENTICALLY with sha256 compared before and after (src/store.mjs 6bd3c5fc…, checks/bio-checks.mjs d8da7b9d…), all arms re-run against the final file.
   (a) THE FOURTH MEASUREMENT OF THE ZERO-COST COPY, on a fourth subject — hand-type `{ A: 4, B: 3, C: 2, D: 1 }` back over the derived rank map -> hygiene 376/2, (C) naming `store.mjs:4776` and the derivation pin failing beside it, WHILE resolution 39/0, connection 41/0, strength 42/0, publish 77/0, search 164/0 and earnedbasis 54/0 ALL STAY GREEN. An identical copy satisfies every behavioural assertion in the battery at zero cost; only the structural pin bites.
   (b) THE ACCEPTS-WHEN'S OWN, against the PRE-FIX tree with 'E' added to BASIS_GRADES in the catalog ALONE -> hygiene 376/2 and (C) NAMES ALL FOUR that did not follow, by file and line: store.mjs:3185, :3200, :3236 and :4775. THE REST OF THE ARM IS THE POINT: with the catalog moved and all four copies stale, publish 77/0, resolution 39/0, strength 42/0, basis 29/0 and earnedbasis 54/0 ARE ALL STILL GREEN — the drift is completely silent behaviourally. (C) named them WITH the catalog already moved, which a value-comparing detector could not have done.
   (c) the same letter added to the catalog ALONE against the FIXED tree -> hygiene 378/0, the rank deriving to {A:5,B:4,C:3,D:2,E:1} and op=strengthbar's refusal composing to "…A, B, C, D, E, or null" with nothing edited. THE DIFFERENCE BETWEEN (b) AND (c) IS THE ITEM.
   (d) the stated limit's own literal deleted from store.mjs -> hygiene 376/2: the load-bearing (C) assertion fails on an EMPTY found set and the prefix pin fails on its length guard, so the limit cannot rot away unnoticed either.
   (e) REACH C0's own, and it guards all three detectors: `mkdir src/subdir-probe` -> hygiene 377/1, the flat-directory assertion failing and NAMING the directory while every other assertion stays green — precisely the danger, since a module in that directory would be swept by nothing at all. `rmdir` restored it and `git status src/` confirmed nothing stray.
   (run 2026-08-04, REC-46) ONE MACHINE-IDENTITY PREDICATE — SIX ARMS, each broken ALONE, every file restored BYTE-IDENTICALLY with sha256 compared before and after (checks/bio-checks.mjs df71cf18…, src/store.mjs 5163d61b…, src/index.mjs 3d3aa9dd…, src/query.mjs 208e8aa4…); whole = this suite 417 pass. THE DEFECT MEASURED FIRST, THROUGH THE OP, before anything was written: `asserted_by: token:member`, `class:member` and `TOKEN:member` all PASSED op=promote's gate — grounds.test.mjs 65 pass, 3 FAIL — because `checkGrounds` asked a WORD LIST that knew nothing of the two spellings index.mjs itself stamps.
   (a) THE ITEM'S OWN — restore the local word list at ONE site, `checkGrounds`' `asserted_by` guard back to `NON_MEMBER_AUTHORS.includes(String(r.asserted_by).toLowerCase())` -> hygiene 414/3, and ALL THREE detectors name it: (D1a) and (D1b) report `checks/bio-checks.mjs:1721` with the offending guard quoted in full, and (D2b) reports `NON_MEMBER_AUTHORS: 3 total` against the expected 2. Behaviourally only grounds.test.mjs moves (65/3, the three minted spellings walking back through), while inquiryground 81/0, publish 77/0, divide 82/0 and release 31/0 stay GREEN — a site that consults the vocabulary directly is invisible everywhere except here.
   (b) THE ZERO-COST COPY, MEASURED A FIFTH TIME ON A FIFTH SUBJECT — restore the pre-fix guard `if (!who || who === "member" || /^token:/.test(who))` at ONE store site (groundInquiry) -> hygiene 415/2 naming `src/store.mjs:2908` under both (D1a) and (D1b), WHILE grounds 68/0, inquiryground 81/0 and affordances 78/0 ARE ALL GREEN. The hand-typed guard agrees with the predicate exactly today, so no behavioural assertion in the battery can see it; only the structural pin bites. That is the fifth independent measurement of REC-43's finding and the reason the drift assertion is structural.
   (c) WIDEN THE PREDICATE IN ITS ONE HOME AND WATCH EVERY SITE FOLLOW — add `'butler'` to `NON_MEMBER_AUTHORS` in checks/bio-checks.mjs ALONE, no other edit anywhere. BEFORE: an actor named `butler` gets PAST all eleven store guards (each op then refuses on its own missing argument — NO_ACKNOWLEDGMENT, NO_CONCLUSION, BAD_DIRECTION, NO_REASON, NO_REASON, NO_STATEMENT, NO_REASON, NO_PARTITION, ACCEPTED, NO_SUCH_TASK, NO_SUCH_TASK). AFTER: NINE of them refuse it BY NAME — MACHINE_CANNOT_RELEASE / _CONCLUDE / _CORRESPOND / _MOVE_ACTION / _REOPEN / _PUBLISH / _DIVIDE / _GROUND / _DECLARE — and the gate refuses `asserted_by: butler` too, with nothing edited outside the catalog. The two task verbs deliberately do NOT move, because they take the NARROW predicate for ROOT_ADMIN's sake, and that documented difference is visible in the same measurement rather than argued about. hygiene 417/0 and grounds 68/0 throughout: the detectors do not care what counts as a machine, which is the property (d) then depends on.
   (d) MOVE THE MINTED PREFIX ITSELF — `MACHINE_AUTHOR_PREFIX` from `token:` to `bot:` in the catalog ALONE. The whole plane follows in one instant: `bot:member` is refused BY NAME at all ELEVEN guards including both task verbs, and `token:member` walks past all eleven — the mint, the eleven refusals, the D-61 unattended-writer GLOB and the gate all moved together because they are now one string. hygiene STAYS 417/0, which is the proof the detectors are blind to the value the control moves (REC-51's REACH C3, reproduced on this subject). What DOES fail is exactly what should: queue-conditions 49/2 (the D-61 basis reads `bot:member` where it pins `token:member`, and "the machine writer is NAMED" reports the stamp moved), unattended-lease 19/3, task-machine 23/9 and grounds 66/2 — every one of them a suite pinning the wire VALUE, which is MEANT to fail on a doctrine move so a session corrects it deliberately (REC-50's pattern).
   (e) THE DIFFERENCE BETWEEN (b) AND (d), WHICH IS THE ITEM — the pre-fix guard restored at groundInquiry AND the prefix moved to `bot:` -> `bot:member`, a real minted machine credential, GROUNDS AN INQUIRY: ten sites refuse it by name and `inquiryground` answers NO_PARTITION, i.e. it got past the machine guard entirely. hygiene 415/2 names the site; inquiryground 79/2. A copy that is free in (b) is a hole in (e), and nothing but the structural pin stands between the two.
   (f) REACH R0's own, extended to the SECOND tree this sweep walks: `mkdir checks/subdir-probe` -> hygiene 416/1, the flat-directory assertion failing and NAMING the directory. REC-51 closed this gap for `src/`; the walk written here is a second walk and would have reopened it, so it is asserted for both roots. `rmdir` restored it, 417 pass, `git status` clean.
   (run 2026-08-08, M0-16/D-238) FIVE ARMS ON THIS FILE'S OWN CORPUS WALKS — three over `test/` and five over `src/` + `checks/`, all of them directories this suite does not control. Re-run in one step: `sh test/coverage-provenance.control.sh arm1|arm2|arm3|arm4|arm5` from bio-plane/. Each arm armed ALONE with the others held open, each DECLARING BEFORE IT RAN what must fire and what must not, every restore verified by sha256 AND by `cmp` against a UNIQUELY NAMED per-arm pristine copy, the tracked-estate snapshot PRINTED (185 files) and floored at 50 so the restore check cannot pass over an empty manifest. Baseline at the moment they ran: this suite 533 pass, `coverage-provenance` 28, `battery-provenance` 23.
   (1) PLANT AN UNTRACKED SUITE in the real tree -> coverage NAMES `m016-arm1-phantom.test.mjs` as UNTRACKED and prints corpus 129 contaminated against 128 reproducible; this suite names it too; the untracked `.md` beside it produces NO word, and every committed suite stays unnamed. Worth recording exactly: the ARMS figure did NOT move (534 both ways) because the planted phantom declares no control, while the CORPUS figure did — the two are different claims and the report keeps them apart. Restore byte-identical by `cmp`.
   (2) PLANT AN UNTRACKED FLEET MANIFEST, the larger hole because it enrols a DIRECTORY -> the FLEET count rises 2 -> 3, the manifest is NAMED and identified as a manifest ("enrols a whole directory — 1 surface op(s), 1 suite(s)"), and the suite it ADMITTED is named beside it. Nothing in `bio-plane/test/` is named. Restore byte-identical, ghost directory gone.
   (3) THE ARM THAT PROVES `ls-tree` AND NOT `git status`, and the one that would have caught the original defect — the same phantom merely IGNORED, by an untracked `.gitignore` listing itself. `git status --porcelain` printed NOTHING AT ALL and both instruments STILL named the file as UNTRACKED. PASSED FIRST TIME on the mechanism; the HARNESS did not — see (3b).
   (3b) AN ARM THAT NEVER ARMED, RECORDED RATHER THAN QUIETLY REWRITTEN. Arm (3) first ignored the phantom via `.git/info/exclude`; in a worktree `.git` is a FILE pointing at `<common>/worktrees/<id>`, which has no `info/` directory, so the append ENOENTed, nothing was ignored, `git status` was NOT empty, and the arm silently re-measured arm (1). It was caught by the printed pristine digest reading `e3b0c442…` — the sha256 of the EMPTY STRING, the identical instrument failure M0-15's own harness had, in the same place, for a different reason.
   (4) NEUTER THE ONE CHECK — delete `reportProvenance`'s naming branch in `scripts/provenance.mjs`, ONE edit in ONE module -> `coverage-provenance` 28 -> 17 pass/11 fail, `battery-provenance` 23 -> 14/9, this suite 533 -> 531/2, every corpus still PRINTED. Three callers moving on one edit is the evidence that this is ONE mechanism and not three copies. Restored, `cmp` byte-identical, sha256 acec3087…, all three back to 28/23/533.
   (4b) THE SURPRISING GREEN THAT WAS A FINDING ABOUT THE ARM. On its first run arm (4) left this suite at 533 pass, 0 fail — because arms (1)-(4) of the block below all read `classifyDiscovered`'s RETURN and none read a printed WORD, and on an honest tree the naming branch never runs, so it could have gone dark here in silence. Arm (5) of that block was added to drive the printer over a synthetic off-commit item into a captured sink; only then did this suite move.
   (5) OVER-STRICTNESS, on the real tree with NOTHING planted -> coverage 137 of 137 and this suite 154 of 154 in the commit, no NOT-IN-ANY-COMMIT block from either walk, no floor described as contaminated. Silence is the result here, not the absence of one. */
/* Suite hygiene: the guard against a battery that wastes hours.
 *
 * Negative-control detail: remove the `.dispose()` calls from a scanned suite (scheduler.test.mjs, temporarily) so a Miniflare is built but never shut down -> 1 assertion fails ("scheduler.test.mjs disposes all 1 of its Miniflare instances"); restored, 144 pass. (An unescaped backtick in setup.mjs's SETUP_HTML template is the other subject this suite guards; the dispose scan is exercised here.)
 * (run 2026-08-03, REC-27/D-137) remove the project_participants DELETEs from store.mjs's purge (both arms) -> 1 assertion fails naming it: "51 of 52 tables covered by purge or a stated exemption (uncovered: [\"project_participants\"])"; restored, 199 pass.
 *
 * Miniflare runs a real workerd child process. A suite that builds one and
 * never disposes it finishes its assertions in about a second, prints its
 * result, and then hangs until something kills it. Nothing fails, nothing
 * is reported, and the only symptom is that the battery takes minutes
 * instead of seconds. That defect shipped in three suites written on July
 * 24, 2026 and cost roughly 150 seconds per suite per run before anyone
 * measured it rather than assuming.
 *
 * The rules below are the two that make a hang impossible:
 *   1. Every Miniflare a suite constructs, it disposes.
 *   2. Every suite ends by exiting on its own result, so a lingering
 *      handle can never turn a green run into a hang.
 *
 * This suite reads its siblings as text on purpose. It is cheap, it needs
 * no runtime, and it catches the mistake at the moment it is made rather
 * than the next time somebody wonders why the battery is slow.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
/* REC-48: the capture rule's two letters, from the enforcement point that
   refuses a leg claiming more than the ceiling. This suite states them no more
   than the plane does — the sweep below is narrowed BY the rule, not beside it. */
/* REC-51: `BASIS_GRADES` joins the two letters above for detector (C)'s
   stated-limit pin only. It is the SUBJECT of a relation assertion, never of a
   value comparison — (C) matches a SHAPE and is deliberately blind to what this
   array currently holds, so the control (which moves the catalog) cannot deafen
   it. Merged with M0-9's import by CONDUCT at integration 2026-08-04: both
   items landed in this file in the same hour and both imports are load-bearing. */
/* REC-46 (2026-08-04): the ONE machine-identity predicate and the vocabularies
   it owns. Imported for the ANSWER-SET assertions, which are value-based ON
   PURPOSE and are the "every existing machine refusal unchanged" half of that
   item. The two SOURCE detectors below are deliberately blind to every one of
   these values — see the block comment at the sweep. */
import { BASIS_GRADES, EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE, GRADE_SOURCES,
         isMachineIdentity, isMachineStamp, NON_MEMBER_AUTHORS, ACTOR_CLASSES,
         MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX,
         MACHINE_STAMP_PREFIXES } from "../checks/bio-checks.mjs";
/* REC-46: the viewer compiler, so the STATED LIMIT below can pin what the
   function ANSWERS rather than what its source says. */
import { viewerPredicate } from "../src/query.mjs";
/* M0-9: the negative-control register's detector, imported from the instrument
   itself rather than reimplemented here — a second copy would agree with the
   first at zero cost and prove nothing about what coverage.mjs actually reads. */
import { readControl, CONTROL_MARKER, MARKER_PHRASE, MARKER_SEPARATORS,
         countArms, countEnumerations, countTransitions } from "../scripts/control-register.mjs";
/* M0-16 / D-238: the ONE provenance check, imported from the instrument for the
   same reason `readControl` is — a second copy of the rule would agree with the
   first at zero cost and prove nothing about what `battery.mjs` and
   `coverage.mjs` actually ask. This file's three corpus walks discover over
   `test/`, a directory it does not control; see the block at the foot. */
import { readGitProvenance, reportProvenance, stateOf, repoPath } from "../scripts/provenance.mjs";
/* M0-21 / D-268: the census below grades a file by whether THAT FILE walks, so a
   floor standing one import away from its walk is invisible to it. This module
   answers the question by DATA FLOW instead. Imported, never restated. */
import { sweepWalkFloors } from "../scripts/walkfloor.mjs";

const DIR = fileURLToPath(new URL(".", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const suites = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs") && f !== "hygiene.test.mjs");
t("there are suites to check", suites.length > 0, true);

console.log("\n--- every workerd instance is shut down ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const built = (src.match(/new Miniflare\(/g) || []).length;
  if (!built) continue;
  const disposed = (src.match(/\.dispose\(\)/g) || []).length;
  t(`${f} disposes all ${built} of its Miniflare instances`, disposed >= built, true);
}

console.log("\n--- every suite ends on its own result ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const tail = src.slice(-400);
  t(`${f} exits deterministically`, /process\.exit\((?!1\))/.test(tail) || /process\.exit\(fail/.test(tail), true);
}

/* ---- and that exit does not throw the suite's own result away --------------
 * D-282, and it is the rule DIRECTLY ABOVE this one that makes it necessary
 * rather than being in tension with it — exactly as D-186's sandbox rule is.
 * Every suite must end `process.exit(…)` so a lingering workerd handle can never
 * turn a green run into a hang. `scripts/battery.mjs` spawns every suite with
 * default stdio, which is a PIPE, and on darwin node's writes to a pipe are
 * ASYNCHRONOUS — so `process.exit` returns to the OS with the tail still queued,
 * and the tail is where the TALLY lives. D-93 exists precisely because a suite
 * that reports no tally reads as a suite that was never run.
 *
 * MEASURED 2026-08-10, one child, two captures of the same run: 200,093 bytes
 * reached a FILE and 131,099 reached a PIPE. The threshold, which D-282's row
 * named UNDETERMINED, bisects at the pipe buffer — 65,573 bytes survive and
 * 65,580 do not — and at higher volumes the loss is NONDETERMINISTIC.
 *
 * `test/stdio.mjs` is the fix and carries the argument for it; it is imported
 * for its SIDE EFFECT, so this check is a spelling check and says so. WHAT IT
 * CANNOT SEE, stated rather than implied: a suite that takes the fix through
 * some other module, a suite that spells the specifier differently, and any
 * `.mjs` in this directory that is not a `.test.mjs` — the controls and probes
 * get it through `sandbox.mjs` and nothing here asserts that they do. The
 * BEHAVIOUR is driven end to end by `test/tally-through-pipe.test.mjs`; this is
 * the census that stops the 153rd suite being written without it. */
console.log("\n--- every suite flushes before it exits (takes the D-282 fix) ---");
{
  const missing = suites.filter((f) => !readFileSync(join(DIR, f), "utf8").includes('"./stdio.mjs"'));
  t(`all ${suites.length} suites import test/stdio.mjs${missing.length ? ` (missing: ${JSON.stringify(missing.slice(0, 8))}${missing.length > 8 ? ` … and ${missing.length - 8} more` : ""})` : ""}`,
    missing.length, 0);
  /* The REACH half. A census that looked at nothing would report zero missing
     and pass a tree in which no suite had the fix at all, which is the failure
     mode D-282 was found in — an instrument that was wrong while the arm was
     right. So the corpus size is asserted and PRINTED. */
  t(`the census actually read a corpus (${suites.length} suites)`, suites.length >= 100, true);
}

/* ---- every suite that makes temp files owns a sandbox that outlives it ------
 * D-186. The rule above ("every suite ends on its own result") is what MAKES
 * this necessary rather than being in tension with it: a suite ends
 * `await mf.dispose(); process.exit(…)`, and miniflare's dispose() disarms its
 * own synchronous exit hook and then starts removing the sandbox WITHOUT
 * awaiting it — so process.exit() beats the removal and the directory survives.
 * 23,263 of them accumulated in days and filled the disk to zero.
 *
 * `test/sandbox.mjs` fixes it by owning the ground: it points $TMPDIR at one
 * directory and removes that synchronously on exit. A suite gets the guarantee
 * by importing it, and that is the whole contract — which is exactly the kind of
 * requirement a hand-kept list falls behind (D-93's chain of 38 files while the
 * directory held 41). So the list is derived from the source instead: build a
 * Miniflare or mkdtemp, and this assertion requires the import. */
console.log("\n--- every suite that makes temp files owns a sandbox ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  if (!/new Miniflare\(|mkdtempSync\(/.test(src)) continue;
  t(`${f} imports test/sandbox.mjs`, /^import ["']\.\/sandbox\.mjs["'];/m.test(src), true);
}

/* ---- and the import is NOT the guarantee: the ground must be CONTAINED ------
 * M0-10/D-235, and this is the correction rather than a new rule. The assertion
 * above certified that a suite IMPORTS the sandbox. It cannot see whether the
 * suite then USES it, and two suites did not: `migrate.test.mjs` built and WIPED
 * its whole fixture tree at the literal `/tmp/civicos-fixture`, and
 * `bootstrap.test.mjs` persisted Durable Object and R2 SQLite to `/tmp/mfp`.
 * Both imported sandbox.mjs. Both satisfied the check. Both were shared by every
 * process on the machine, and both were MEASURED red under two and three
 * concurrent runs — the cause of M0-10's "fails under concurrency, passes
 * alone", which nothing in the estate could see.
 *
 * IT WAS INVISIBLE IN THE GENEROUS DIRECTION, which is the direction this
 * project treats as worst. `scripts/battery.mjs` accounts for temp residue by
 * counting inside `$TMPDIR`, so a suite that writes OUTSIDE it is not
 * under-reported — it is not reported at all. The battery printed `0 directories,
 * 0 miniflare sandboxes` while 12 MB of SQLite sat in /tmp/mfp accumulating since
 * 2026-07-31. A true sentence about the fence, and a false impression of the
 * estate.
 *
 * THE RULE IS THE PRINCIPLE, NOT A LIST OF PATHS (REC-70's lesson: a list of
 * spellings goes stale the moment a new one is written). What makes a temp ground
 * safe under concurrency is not that it avoids `/tmp` — it is that it is DERIVED
 * at runtime rather than fixed in the source. `mkdtempSync` mints a name no other
 * process can hold; a string literal names the same directory for everybody. So
 * the check is: no suite may pass an absolute-path LITERAL to anything that roots
 * a filesystem ground. A path derived from `tmpdir()`, from `import.meta.url`, or
 * from `mkdtempSync` is fine by construction and needs no allowlist.
 *
 * WHAT THIS CANNOT SEE, stated rather than left to be discovered: a literal built
 * by concatenation or held in a variable this walk does not follow, a path handed
 * in through an environment variable, and a shared resource that is not a
 * filesystem path at all — a fixed PORT is the same class and this check is blind
 * to it (no suite pins one today; `migrate/local-plane.mjs` does, deliberately,
 * and is not a suite). It reads the source; it does not run it. */
console.log("\n--- and a temp ground is DERIVED, never a shared literal ---");
/* `[^"'\n]*` and not `[^"']*`: a filesystem path literal never spans a newline,
   and letting it do so made a single match swallow kilobytes of unrelated source.
   That is not cosmetic — it was measured. Under the over-strictness control arm
   the unbounded form produced a findings list so large that the suite never
   printed its tally, which is precisely the unreadable-failure mode D-93 exists
   to prevent, arriving inside a check written to prevent a different one. */
const GROUND = /(?:defaultPersistRoot|persistTo|const\s+ROOT|const\s+PERSIST)\s*[:=]\s*(["'])(\/[^"'\n]*)\1|(?:mkdirSync|writeFileSync|rmSync|readFileSync|mkdtempSync)\(\s*(["'])(\/[^"'\n]*)\3/g;
const strayGround = [];
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  for (const m of src.matchAll(GROUND)) strayGround.push(`${f}: ${m[2] ?? m[4]}`);
}
/* The message is CAPPED and says so when it truncates. A failure nobody can read
   is a failure nobody acts on; the count is the part that must always survive. */
const groundShown = strayGround.length > 8
  ? `${JSON.stringify(strayGround.slice(0, 8))} … and ${strayGround.length - 8} more`
  : JSON.stringify(strayGround);
t(`no suite roots a filesystem ground at an absolute literal (${strayGround.length} found: ${groundShown})`, strayGround, []);
/* A detector that finds nothing passes everything, so its REACH is asserted on a
   fixture rather than assumed — the same delta discipline the D-113 walk uses. */
const GROUND_FIXTURE = [
  `const ROOT = "/tmp/civicos-fixture";`,          // migrate's original defect
  `  defaultPersistRoot: "/tmp/mfp",`,             // bootstrap's original defect
  `rmSync("/tmp/somewhere", { recursive: true });`, // a direct call
].join("\n");
t("the ground detector catches all 3 planted literals",
  [...GROUND_FIXTURE.matchAll(GROUND)].map((m) => m[2] ?? m[4]),
  ["/tmp/civicos-fixture", "/tmp/mfp", "/tmp/somewhere"]);
/* Over-strictness: the DERIVED forms the estate actually uses must NOT match. */
const GROUND_CLEAN = [
  `const ROOT = mkdtempSync(join(tmpdir(), "civicos-fixture-"));`,
  `  defaultPersistRoot: PERSIST,`,
  `const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));`,
  `if (u.pathname === "/report.pdf") return html(PAGE);`,
  `readFileSync(join(ROOT, "index/index.json"), "utf8")`,
].join("\n");
t("and flags none of the 5 derived forms", [...GROUND_CLEAN.matchAll(GROUND)].map((m) => m[2] ?? m[4]), []);


/* ---- and a PORT is DERIVED too, never a fixed number (D-249) ----
 * THE SAME CLASS AS THE GROUND CHECK ABOVE, AND THE BLOCK ABOVE SAYS SO: "a
 * fixed PORT is the same class and this check is blind to it". D-249 carried
 * that blind spot as an OPEN row. This is the half that closes it.
 *
 * WHY A SEPARATE MATCHER RATHER THAN A WIDER `GROUND`: a port is not a path and
 * shares none of its spellings, and widening `GROUND` to numbers would have
 * made its 687-false-positive over-strictness arm meaningless. Same principle,
 * different alphabet.
 *
 * THE PRINCIPLE, NOT A LIST (REC-70 again): what makes a port safe under
 * concurrency is not which number it is — it is that the process ASKS THE
 * KERNEL for one instead of naming one. `port: 0` means "any free port" and is
 * safe by construction; a variable or an env read is safe because the source
 * does not decide. A literal names the same socket for every process on the
 * machine, and two suites holding it fail with different signatures on every
 * run, kill each other rather than failing an assertion, and read as flake —
 * D-237's shape exactly, which cost a diagnosis twice (D-231, D-237).
 *
 * WHAT THIS CANNOT SEE, and it is the same list as the ground check plus one
 * that matters more here: a port built by concatenation or held in a variable
 * this walk does not follow, a port from an environment variable, a port a
 * DEPENDENCY chooses, and a port passed as a bare positional argument to a
 * helper. THE DEPENDENCY CASE IS NOT HYPOTHETICAL — 131 of these suites
 * construct a Miniflare and every one of them binds, so this check reading
 * CLEAN is a statement about the SOURCE and never about what the estate binds.
 * That question was answered by measurement instead, at runtime, and the
 * instrument is `test/d249-port.probe.mjs`: three runs of a real suite share
 * ZERO ports, eight concurrent copies are 8 of 8 green on one signature, and
 * every socket observed sat in the ephemeral range. It reads the source; it
 * does not run it. */
console.log("\n--- and a port is DERIVED, never a fixed number ---");
/* `\b` before the digits and a `(?!\d)` after: `port: 8787` must match but
   `port: 87870` must match as 87870 and not as 8787, and a truncated read is
   how a matcher silently agrees with itself. Zero is EXCLUDED in the predicate
   below rather than in the pattern, so the pattern stays readable and the
   exclusion stays visible to the reader who asks "what about port 0?". */
const PORT_PIN = /(?:\bport|\bPort|inspectorPort)\s*[:=]\s*(\d{1,5})(?!\d)|\.listen\(\s*(\d{1,5})(?!\d)|(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{2,5})(?!\d)/g;
const pinnedPort = [];
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  for (const m of src.matchAll(PORT_PIN)) {
    const n = m[1] ?? m[2] ?? m[3];
    /* `0` is the DERIVED form — it asks the kernel for whatever is free — so it
       is the one number that is never a pin. Excluding it is the whole reason
       this check can be strict about every other number. */
    if (n !== "0") pinnedPort.push(`${f}: ${n}`);
  }
}
const portShown = pinnedPort.length > 8
  ? `${JSON.stringify(pinnedPort.slice(0, 8))} … and ${pinnedPort.length - 8} more`
  : JSON.stringify(pinnedPort);
t(`no suite pins a fixed port (${pinnedPort.length} found: ${portShown})`, pinnedPort, []);
/* REACH. A detector that reads nothing passes every corpus, and this project has
   shipped three headline assertions that passed over an empty one. */
const PORT_FIXTURE = [
  `  port: 8787, defaultPersistRoot: "/tmp/plane-persist",`,   // migrate/local-plane.mjs's real shape
  `server.listen(3000, "127.0.0.1");`,                         // a direct listen
  `const base = "http://localhost:9229/json";`,                // an inspector URL
  `  inspectorPort: 9230,`,                                    // miniflare's own option
].join("\n");
t("the port detector catches all 4 planted pins",
  [...PORT_FIXTURE.matchAll(PORT_PIN)].map((m) => m[1] ?? m[2] ?? m[3]),
  ["8787", "3000", "9229", "9230"]);
/* OVER-STRICTNESS, and it is the arm that decides whether this check is usable:
   correct work in a spelling nobody anticipated must PASS. Every form below is
   how this estate ACTUALLY asks for a port today, and one of them (`port: 0`)
   is the single number the predicate above has to treat as safe. */
const PORT_CLEAN = [
  `  const sink = net.createServer(); sink.listen(0, "127.0.0.1");`,   // ask the kernel
  `  port: 0,`,                                                        // the ephemeral request
  `  const PORT = sink.address().port;`,                               // derived at runtime
  `  port: PORT,`,                                                     // a variable
  `  port: Number(process.env.PLANE_PORT),`,                           // from the environment
  `  const url = \`http://localhost:\${PORT}/op\`;`,                    // interpolated
  `  retrieved: "2026-07-01", authority: "Oakland OpenGov portal"`,     // a date and a word containing "port"
  `  transported: 42, reported: 7,`,                                    // words ENDING in "port"
].join("\n");
const portClean = [...PORT_CLEAN.matchAll(PORT_PIN)].map((m) => m[1] ?? m[2] ?? m[3]).filter((n) => n !== "0");
t("and flags none of the 8 derived or innocent forms", portClean, []);


/* ---- the generated page cannot be broken by its own comments ----
 * setup.mjs is one enormous template literal. An unescaped backtick inside it
 * TERMINATES the literal, and a ${ starts an interpolation, so a comment
 * written in ordinary prose can silently destroy the module or the served
 * script. This has now happened twice: the 0.3.8 hang, where escapes were eaten
 * and the browser received a dead script, and again on 2026-07-24, where a
 * comment quoting two field names in backticks made the module unparseable.
 *
 * Both were found by accident. This finds them on purpose.
 */
console.log("\n--- the served page template is intact ---");
{
  const src = readFileSync(join(DIR, "..", "src", "setup.mjs"), "utf8");
  const open = src.indexOf("export const SETUP_HTML = `");
  t("setup.mjs still exports one template literal", open > -1, true);
  const body = src.slice(open + "export const SETUP_HTML = `".length, src.lastIndexOf("`;"));
  let ticks = 0, interps = 0, i = 0;
  while (i < body.length) {
    if (body[i] === "\\") { i += 2; continue; }
    if (body[i] === "`") ticks++;
    if (body[i] === "$" && body[i + 1] === "{") interps++;
    i += 1;
  }
  t("no unescaped backtick inside it", ticks, 0);
  /* Interpolations are legitimate: the page injects the catalog's tables. They
     are counted so a surprising jump is visible in a diff rather than silent. */
  t("interpolations are few and deliberate", interps <= 4, true);

  /* The strongest check available without a browser: the module loads, and the
     script it serves parses as JavaScript. */
  let loaded = null;
  try { loaded = (await import("../src/setup.mjs")).SETUP_HTML; } catch (e) {
    console.log("    load error:", e.message);
  }
  t("the module loads", typeof loaded, "string");
  if (typeof loaded === "string") {
    const script = loaded.slice(loaded.lastIndexOf("<script>") + 8, loaded.lastIndexOf("</script>"));
    let parses = true;
    try { new Function(script); } catch (e) { parses = false; console.log("    parse error:", e.message); }
    t("the script it serves parses", parses, true);
  }
}

/* schema.mjs is the same shape and met the same fate on 2026-07-30: a comment
 * quoting a column name in backticks terminated the SCHEMA literal, node
 * --check still passed because the stray pair happened to re-balance, and only
 * miniflare's parser refused it. Same class, third strike, so the guard covers
 * it now. SQL comments quote nothing in backticks. */
console.log("\n--- the schema template is intact ---");
{
  const src = readFileSync(join(DIR, "..", "src", "schema.mjs"), "utf8");
  const open = src.indexOf("export const SCHEMA = `");
  t("schema.mjs still exports one template literal", open > -1, true);
  const body = src.slice(open + "export const SCHEMA = `".length, src.lastIndexOf("`;"));
  let ticks = 0, interps = 0, i = 0;
  while (i < body.length) {
    if (body[i] === "\\") { i += 2; continue; }
    if (body[i] === "`") ticks++;
    if (body[i] === "$" && body[i + 1] === "{") interps++;
    i += 1;
  }
  t("no unescaped backtick inside it", ticks, 0);
  t("and no interpolation at all: the schema is static text", interps, 0);
  let loaded = null;
  try { loaded = (await import("../src/schema.mjs")).SCHEMA; } catch (e) {
    console.log("    load error:", e.message);
  }
  t("the module loads", typeof loaded, "string");
  t("and the literal ends where the file says it does", typeof loaded === "string" && loaded.trimEnd().endsWith(");"), true);

  /* REC-68's rider, and it is the same finding as the item it rode in on: a
     HAND-TYPED LIST IN A COMMENT GOES STALE SILENTLY. `inquiry_basis.grade_source`
     named THREE sources — 'resolution' | 'testimony' | 'hunch' — while
     GRADE_SOURCES has carried FIVE since REC-31/DEC-21 added 'inherited' and
     'capture'. PL-8 found it and left it (another item's blast radius); REC-68
     corrected it. Correcting it once is worth almost nothing, because nothing
     stopped it drifting the first time. This arm is what makes it not drift
     again: the comment is DRIVEN against the exported vocabulary rather than
     read, so adding a sixth source without touching the comment fails here.

     Written as a CONTAINMENT test in both directions rather than a string
     equality, so the comment may keep its prose and its DEC reference while
     still being unable to omit a member or invent one. */
  {
    const lines = src.split("\n");
    const at = lines.findIndex((l) => /^\s*grade_source\s+TEXT/.test(l));
    t("the grade_source column is still where this arm looks for it", at > -1, true);
    /* The block is the column's own line plus the CONTINUATION comment lines
       under it — lines that are nothing but an SQL comment. It stops at the
       next column, which is what keeps a neighbour's vocabulary out of it. */
    const block = [lines[at]];
    for (let n = at + 1; n < lines.length && /^\s*--/.test(lines[n]); n++) block.push(lines[n]);
    const text = block.join("\n");
    const named = [...text.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    t(`the comment names every grade source the catalogue carries (${JSON.stringify(GRADE_SOURCES)})`,
      GRADE_SOURCES.filter((s) => !named.includes(s)), []);
    t("and names no source the catalogue does not — a comment cannot invent a value either",
      named.filter((s) => !GRADE_SOURCES.includes(s)), []);
    /* REACH, as a delta: a matcher that found nothing would pass both arms
       above triumphantly over an empty list. */
    t("and the arm actually read a list rather than passing over nothing",
      named.length, GRADE_SOURCES.length);
    /* CLAUDE.md's `#migrate` trap: a semicolon inside an inline `--` comment
       TRUNCATES the statement, and neither `node --check` nor a balanced-tick
       scan catches it. This comment grew by five lines in REC-68, so the trap
       is asserted at the site rather than remembered. */
    t("and no semicolon hides in it, which would truncate the CREATE TABLE",
      text.includes(";"), false);
  }
}

/* D-106. The installer embedded 0.35.0 while the plane ran 0.48.0 for thirteen
   releases. `newgroup/scripts/embed-release.mjs` now refuses on a mismatch, but
   that refusal fires when somebody builds the INSTALLER, which may be weeks
   after the drift was introduced and in a different thread. This fires at the
   moment the drift is created: whoever bumps package.json to cut a release runs
   this suite, and a wrangler.jsonc left behind fails here immediately.

   Two checks in two places for one invariant is not duplication. The embed
   refusal is the one that cannot be bypassed; this one is the one that is
   cheap and early. */
console.log("\n--- the version sources agree (D-106) ---");
{
  const root = fileURLToPath(new URL("..", import.meta.url));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const declared = /"VERSION":\s*"([^"]*)"/.exec(readFileSync(join(root, "wrangler.jsonc"), "utf8"));
  t("package.json declares a semver version",
    typeof pkg.version === "string" && /^\d+\.\d+\.\d+/.test(pkg.version), true);
  t("wrangler.jsonc declares a VERSION var", !!declared, true);
  t(`wrangler.jsonc VERSION equals package.json (${pkg.version}), the authority`,
    declared ? declared[1] : null, pkg.version);
}

/* D-112. The archive leg of a provenance chain must be built by the call that
   fetched the CDX record, never handed in by a caller: a chain hop a caller can
   supply is a chain hop a caller can invent, and the entire value of a disclosed
   transitive-trust chain is that the disclosure is ours. This is a SOURCE check
   because it is a property of what the code may read, and a runtime test can
   only ever show that one particular forged request was ignored. */
console.log("\n--- no caller-supplied provenance (D-112) ---");
{
  const idx = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "index.mjs"), "utf8");
  const reads = (re) => (idx.match(re) || []).length;
  t("nothing reads a documentAddress off the request body",
    reads(/body\??\.\s*documentAddress/g), 0);
  t("nothing reads a provenance hop or chain off the request body",
    reads(/body\??\.\s*(provenance_chain|provenanceHop|archiveHop|hop)\b/g), 0);
  t("nothing reads a capture grade off the request body",
    reads(/body\??\.\s*grade\b/g), 0);
  t("the archive hop is built from archiveSelect's own result",
    /archiveHopRecorded = sel\.hop/.test(idx), true);
  t("and the document address comes from the CDX record, not the request",
    /documentAddress = via === "archive\.org" && archiveAddress/.test(idx), true);
}

/* D-113 as a CLASS. op=purge's whole-store branch clears the corpus and every
   table DERIVED from it, and that list is maintained by hand. Nothing failed
   when a new derived table was added to schema.mjs and forgotten: D-98's tables
   were three releases old before anyone noticed, and only during a tidy-up. A
   whole-store purge that then reports scope "ALL" while leaving rows behind is
   worse than one that reports a narrower scope, because the caller believes the
   store is empty.

   This closes the class the same way the template checks above close theirs: at
   the moment the mistake is made. Every `CREATE TABLE` in schema.mjs AND every
   one written by hand in store.mjs's DO constructor (D-137: eight tables lived
   outside the schema literal and were invisible to this check for three
   releases) must be either cleared by the whole-store purge or named in the
   exemption allowlist below with a one-line reason. A new derived table added
   to EITHER file and not to purge fails here immediately.

   The exemptions are the tables a whole-store purge MUST NOT clear, each because
   it is not derived from the corpus: identity, auth, measured runtime capability,
   transient rate/governor state, inbound intake, or the deliberately-durable
   published projection. If you are adding a DERIVED table, it does not belong
   here; add it to purge. */
console.log("\n--- every table is purged or explicitly exempt (D-113 / D-137) ---");
{
  const schema = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "schema.mjs"), "utf8");
  const store = readFileSync(join(fileURLToPath(new URL("../src", import.meta.url)), "store.mjs"), "utf8");

  const schemaTables = [...schema.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/g)].map((m) => m[1]);
  t("schema.mjs declares tables to check", schemaTables.length > 0, true);

  /* D-137. Eight tables are created BY HAND in the DO constructor rather than in
     the schema literal, so a check that read only schema.mjs had a blind spot
     the size of eight tables — four of them neither purged nor exempt, and one
     (project_participants) keyed on a bundle id, the exact D-113 silent-leftover
     in a table the D-113 check could not see. Closing a class by parsing one
     file closes it only for that file, so the check now parses BOTH. The name is
     anchored to the opening paren (or USING, for the FTS5 virtual table) so the
     PROSE "CREATE TABLE IF NOT EXISTS does nothing to a table that already
     exists" in a constructor comment cannot mint a phantom table — D-137's own
     first enumeration listed a table named "does" for exactly that reason. */
  const storeTables = [...new Set(
    [...store.matchAll(/CREATE (?:VIRTUAL )?TABLE IF NOT EXISTS\s+(\w+)\s*(?:\(|USING\s)/g)].map((m) => m[1]))];
  t("store.mjs's hand-created tables are seen too (D-137)", storeTables.length >= 8, true);
  const allTables = [...new Set([...schemaTables, ...storeTables])];

  /* What the WHOLE-STORE purge clears. Sliced from the purge method's source so
     the check reads the real deletion list rather than a copy of it: the TABLES
     array it deletes WHERE bundle_id IN both branches, plus every `DELETE FROM`
     in the purge method (the per-bundle arm's project_id-keyed DELETEs included,
     since those tables clear in both arms). */
  const pStart = store.indexOf("purge({ bundleId");
  const pEnd = store.indexOf("---- credentials ----", pStart);
  t("the purge method is locatable in store.mjs", pStart > -1 && pEnd > pStart, true);
  const purgeSrc = store.slice(pStart, pEnd);
  const tablesArr = /const TABLES\s*=\s*\[([^\]]*)\]/.exec(purgeSrc);
  const fromArray = tablesArr ? [...tablesArr[1].matchAll(/"(\w+)"/g)].map((m) => m[1]) : [];
  const fromDeletes = [...purgeSrc.matchAll(/DELETE FROM\s+(\w+)/g)].map((m) => m[1]);
  const purged = new Set([...fromArray, ...fromDeletes]);
  t("purge clears a non-trivial set of tables", purged.size >= 10, true);

  /* Tables a whole-store purge MUST NOT clear. Each is not derived from the
     corpus; the reason is stated so the exemption can be audited rather than
     trusted. */
  const EXEMPT = {
    seq:                  "monotonic id counter; must survive so allocid never reissues an identifier (see purge comment)",
    credentials:          "operator/member auth; a data purge must not delete logins and lock the instance out",
    sessions:             "bearer login sessions; auth state, not corpus-derived",
    bootstrap:            "one-row claim state; whether the instance has been claimed, not corpus data",
    members:              "the roster; membership is identity, not derived from captured documents",
    signers:              "registered signing keys; identity, not corpus-derived",
    /* PL-11 / IS-5 / D-199 (2). The `ai` credential's DECLARED TASK SCOPE, and
       the exemption is the same judgement `credentials`, `members` and `signers`
       above already carry rather than a new one: it is IDENTITY and a standing
       authored grant, not something derived from a captured document. No bundle
       id appears in it. A whole-store purge that cleared it would REVOKE every
       agent this group runs as a side effect of resetting the corpus — the
       instance would then look correct and every automated worker would 401
       forever, which is DIST-1's armed-alarm trap arriving through the reaper.
       And the grant is precisely the thing D-199 (2) moved out of a settings row
       so it could only be amended as an authored, dated act; deleting it as a
       side effect of a different operation is that rule failing quietly. */
    ai_credentials:       "the ai class's declared task scopes (D-199): a standing, authored, dated grant naming who minted it and for whom, in credentials' and members' family; a purge that cleared it would withdraw every agent's authority with nobody having decided to",
    /* REC-14 / DEC-17. The GROUP's declared default required strength: a
       standing declaration about the standard the group holds its own work to,
       authored before the work and dated, exactly like the roster and the
       signing keys beside it. It is not derived from any captured document and
       no bundle_id appears in it, so a whole-store purge that cleared it would
       silently lower the bar on everything published afterwards. A project's
       OWN bar is not here at all: it is authored frontmatter on the project's
       bundle.md and is purged with that bundle, which is correct — the project
       is gone, and so is the standard it set for itself. */
    group_strength_bar:   "the group's declared default required evidentiary strength (DEC-17); a standing governance declaration about the group's own work, authored and dated like the roster, not derived from any document",
    published_bundles:    "public ratified projection; kept verifiable forever by doctrine, not torn down with the working store",
    published_shas:       "append-only published hashes; a hash once published stays verifiable forever (schema doctrine)",
    /* REC-44 / DEC-44, and the exemption is the SAME judgement its two siblings
       above already carry rather than a new one. published_cases holds what
       nothing else holds — the authored scope, the completeness assertion and
       the container's manifest for each edition of each published case — and
       published_case_members holds the declared roster, which is the only thing
       that can say a case edition was INCOMPLETE (published_bundles holds the
       ratified subset and cannot). Both are the published projection, so a
       purge of the working corpus must leave them standing for the same reason
       it leaves published_bundles standing: a case once published answers
       forever. published_edges is the counter-example that keeps this honest —
       it IS purged, because every row of it is recomputable from bytes that
       answer forever, and neither of these is. */
    published_cases:      "published case projection (DEC-44): the authored scope, the completeness assertion and the container manifest per case per edition; nothing else holds them, and a case once published answers forever",
    published_case_members: "the DECLARED case->findings roster per edition, from the members' own signed bytes; it is what says a case edition is incomplete, which published_bundles (the ratified subset) cannot",
    inbox:                "quarantined public intake; inbound submissions awaiting review, explicitly not the record and not corpus-derived",
    knock_rate:           "fixed-window knock rate accounting; transient, self-pruning as windows pass",
    capture_limits:       "measured per-runtime subrequest ceiling; a capability fact, relearned by being refused, not corpus-derived",
    runtime_observations: "measured CPU cost; a capability fact, not corpus-derived",
    cpu_probe:            "stepped CPU-probe checkpoints; transient instrumentation, not corpus-derived",
    host_governor:        "per-host token-bucket governor state; transient pacing, not corpus-derived",
    /* The three DO-constructor tables a purge must not touch (D-137). The other
       five hand-created tables are PURGED: bundles_fts, selections and
       selection_items always were, and project_participants / project_owner_votes
       are keyed on project_id — a bundle id — so REC-27 added them to both arms. */
    member_expertise:     "roster state: an append-only event log of declared and confirmed expertise per member; identity like members, not corpus-derived (D-137)",
    admin_votes:          "administrator governance record, append-only by doctrine so an ejection can be audited by the people it was done to; membership, not corpus-derived (D-137)",
    export_log:           "the record that an export happened, kept so an export can never happen SILENTLY; a purge that erased the evidence of a pre-purge export would defeat it (D-137)",
  };

  /* An exemption for a table that IS purged, or for a table that does not exist,
     is stale and misleading; catch it so the allowlist stays honest. */
  for (const name of Object.keys(EXEMPT)) {
    t(`exemption "${name}" names a real table`, allTables.includes(name), true);
    t(`exemption "${name}" is not also purged (a stale exemption)`, purged.has(name), false);
  }

  /* The load-bearing assertion: nothing falls through the crack, in EITHER file. */
  const uncovered = allTables.filter((tbl) => !purged.has(tbl) && !(tbl in EXEMPT));
  t(`${allTables.length - uncovered.length} of ${allTables.length} tables covered by purge or a stated exemption (uncovered: ${JSON.stringify(uncovered)})`,
    uncovered, []);
}

/* D-131. A single raw NUL in store.mjs — a string separator written as the byte
   rather than the escape — made ugrep-backed `grep` classify the repo's largest
   source file as BINARY, so every plain grep against it returned exit 1, no
   output, no warning: a false negative indistinguishable from "no matches",
   which nearly got a correct research finding discarded. Same defect class as
   the unescaped-backtick guards above — every test passes while a verification
   instrument silently stops verifying — so it gets the same treatment: caught
   at the moment the byte is written. Tab, LF and CR are the only control bytes
   a source file may carry. */
console.log("\n--- no source file carries a raw control byte (D-131) ---");
{
  const srcDir = join(DIR, "..", "src");
  for (const f of readdirSync(srcDir).filter((n) => n.endsWith(".mjs"))) {
    const buf = readFileSync(join(srcDir, f));
    let badAt = -1;
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i];
      if (b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) { badAt = i; break; }
    }
    t(`${f} carries no raw control byte`, badAt, -1);
  }
}

/* REC-48 (2026-08-04). NO SURFACE SPELLS A CAPTURE GRADE LETTER.
 *
 * The capture-grade doctrine — what a direct capture by this instance earns,
 * and which letter above it this plane cannot produce — was written out in its
 * own letters in FOUR places: the surface's `ATTEST_YIELDS_GRADE` (REC-43/DEC-39
 * moved it to a composed publication), `op=acquire`'s `note`, `op=earnedbasis`'s
 * `ceiling` sentence, and the one enforcement point that is allowed to hold the
 * value. Each copy agreed with the rule ON THE DAY IT WAS TYPED and would go on
 * agreeing at zero cost until the day the rule moved, which is the one day the
 * agreement mattered. REC-43 measured exactly that: a hand-typed copy identical
 * to the composition left every behavioural and wire assertion in the
 * affordances suite green, and only a structural pin could see it.
 *
 * So this is the structural pin, one altitude up from the three suites that own
 * the individual sentences: the LETTER may not appear beside the word in any
 * module of the plane. A fifth statement is then not something a reviewer has to
 * notice — it fails here, by file and by line, at the moment it is written.
 *
 * WHAT IT SWEEPS AND WHAT IT DOES NOT. Comments are excluded, in the three
 * comment forms this tree writes: JS block comments (the overwhelming majority
 * here), JS line comments and the `--` lines inside schema.mjs's SQL literal.
 * A comment reaches no reader — it cannot overclaim to a member, which is the
 * subject — and several comments must go on quoting the doctrine and the old
 * wording verbatim in order to explain why the letters are composed at all;
 * excluding them is the difference between a rule and an exemption list. The
 * line-comment strips are anchored to the START of a line ON PURPOSE: an
 * unanchored `//` strip would eat everything after `https:` inside a string
 * literal, which would make this sweep quietly reach LESS than it claims, and a
 * sweep that reaches less than it claims is the failure UI-30 found in an
 * instrument and REC-49 found in an arm that first fired zero.
 *
 * TWO DETECTORS, AND THE SECOND EXISTS BECAUSE THE FIRST HAS A LOOPHOLE.
 * (A) `Grade <LETTER>` with a capital G — the doctrine's own capitalised term,
 * which is how every capture-grade statement in this tree has ever written it.
 * That is the sweep REC-48's accepts-when names, and it must read ZERO.
 * (B) the same match CASE-INSENSITIVELY, restricted to the two letters the
 * capture rule actually owns — `EARNED_CAPTURE_CEILING` and the derived
 * `UNREACHABLE_CAPTURE_GRADE`, imported, never typed here either. (A) alone
 * would let a new statement through as lowercase `grade b`; (B) closes that for
 * exactly the letters that can overclaim, and takes its subject FROM the rule so
 * it cannot drift from it.
 *
 * WHY (B) IS NOT SIMPLY (A) CASE-INSENSITIVE, measured rather than assumed. Five
 * sentences in store.mjs spell a lowercase connection-axis letter — "section
 * 8.1's grade C", "grade D is recorded testimony", "testimony at grade D". Those
 * are a DIFFERENT doctrine on a different axis, they have no exported constant
 * to compose from (checkEarnedLeg types testimony's 'D' at the enforcement point
 * itself), and giving them one is a doctrine act rather than a sweep. They are
 * therefore OUT OF THIS SWEEP'S SUBJECT and are NOT exempted from it — a stated
 * limit rather than an allowlist, and it is routed rather than buried. The same
 * block also shows why no letter-near-the-word rule can ever be complete for all
 * axes: it says "no leg of it earns an A/B/C connection grade", with the letters
 * on the wrong side of the word, and matching prose in both directions is
 * unbounded. The capture axis CAN be complete, because it owns exactly two
 * letters and both are exported.
 * One consequence of (B) taking its letters from the rule, stated so it is not
 * read later as a defect: if the capture ceiling were ever MOVED onto a letter
 * the connection-axis prose also spells, (B) fires on that prose. That is the
 * correct answer, not noise — a tree where one letter means two doctrines has
 * become ambiguous to a reader and somebody should look at it.
 *
 * (C) IS A THIRD DETECTOR AND NOT A TWEAK TO EITHER OF THE OTHER TWO, and this
 * paragraph exists so the next reader does not "simplify" three detectors into
 * one that catches less. REC-51 (2026-08-04). (A) and (B) look for a LETTER
 * BESIDE THE WORD — statements ABOUT the vocabulary, addressed to a reader.
 * `store.mjs` also held four copies OF the vocabulary: `["A","B","C","D"]` three
 * times and `static #GRADE_RANK = { A: 4, B: 3, C: 2, D: 1 }`, which restates
 * the letters AND their ordering. NONE of them spells a word, so (A) and (B) are
 * SILENT ON ALL FOUR BY DESIGN — correctly silent, since their subject is prose
 * a member can be told, and this class never reaches a member at all. It is the
 * same defect one level down: the copies agreed with the catalog at zero cost
 * and would have disagreed with it silently the day `BASIS_GRADES` changed.
 * Widening (A) or (B) to reach them cannot work, because their whole precision
 * comes from the word they are anchored to; drop the anchor and "Grade" matches
 * every capital letter in the tree. So (C) has its OWN subject and its OWN
 * shape: a literal DATA STRUCTURE spelling a grade vocabulary — an array of
 * three or more quoted single capitals, or an object keyed by three or more of
 * them.
 *
 * (C) IS DELIBERATELY BLIND TO THE CATALOG'S CURRENT VALUE, and that is the
 * property that makes its negative control mean anything. A detector that
 * compared a literal against `BASIS_GRADES` would go SILENT at exactly the
 * moment it is needed: the control ADDS A LETTER to the catalog, and a
 * value-comparing detector would then stop recognising the four-letter copies
 * that just fell out of step. (C) matches the SHAPE, so it names a copy whether
 * the catalog has moved under it or not. It is asserted below that (C) fires on
 * a five-letter copy as readily as on a four-letter one, so this is measured
 * rather than argued.
 *
 * ONE STATED LIMIT, AND IT IS A FINDING RATHER THAN AN EXEMPTION. A fifth
 * literal in store.mjs is NOT a copy of the vocabulary: `["A","B","C"]` inside
 * the earned-connection walk is a strict SUBSET of it carrying its own doctrine
 * — the grades a MACHINE may mint, grade D being a member's testimony, which
 * `checkEarnedLeg` types at the enforcement point itself. There is no exported
 * constant to compose from and minting one would ASSERT what a machine earns and
 * whether that set follows the catalog when the catalog moves: a ruling, and no
 * DEC is open in it. So it is left standing, exactly as REC-48 recorded the
 * lowercase connection-axis spellings as a stated limit rather than an allowlist
 * — and it is not skipped by a pattern. (C)'s load-bearing assertion pins the
 * found set to EXACTLY that one site, named and reasoned, so a sixth literal
 * fails here the moment it is written and this one cannot quietly change either.
 * Beside it, and following REC-50's way of holding an open decision without
 * leaving it unguarded, a second assertion reads that subset OUT OF the source
 * and pins that it stays a contiguous STRONGEST-FIRST PREFIX of `BASIS_GRADES`.
 * Pinning a relation asserts no VALUE, so it is not a ruling; what it buys is
 * that a catalog change which REORDERS or RENAMES the vocabulary fails here by
 * name, while a catalog change that merely APPENDS a letter leaves it green —
 * which is the honest answer, because whether a machine may mint a new letter is
 * the undetermined question and must not be answered by a silent derivation.
 *
 * PROSE ENUMERATIONS ARE NOT IN (C)'s SUBJECT, stated so its silence is not
 * misread. `must be one of A, B, C, D` in an emitted sentence is a copy of the
 * vocabulary too, and REC-51 composed the one instance of it in store.mjs from
 * `BASIS_GRADES.join(", ")` — but (C) does not attempt to police prose, for
 * REC-48's own measured reason one paragraph up: matching letters against words
 * in both directions is unbounded, and two emitted connection-axis sentences in
 * this tree spell "A/B/C" on the wrong side of the word as a stated limit
 * already. (C) is COMPLETE for literal data structures, which is the class
 * REC-51 names, and claims nothing beyond it.
 *
 * ITS OWN REACH IS ASSERTED BELOW FOUR WAYS, because a walk that covers nothing
 * passes everything: the file list is non-trivial and names the modules that
 * carry the doctrine; the detector fires on a planted control IN EVERY FILE'S
 * OWN STRIPPED TEXT, so no file is silently skipped; the same detector over the
 * RAW sources DOES find matches, proving the walk reaches the very lines where
 * the doctrine is discussed and that only the comment strip stands between it
 * and a hit; and the two emitted doctrine SENTENCES survive the strip intact, so
 * the strip cannot have swallowed the region a spelled letter would appear in. */
console.log("\n--- no surface spells a capture grade letter (REC-48) ---");
{
  const srcDir = join(DIR, "..", "src");
  const files = readdirSync(srcDir).filter((n) => n.endsWith(".mjs")).sort();
  const raw = new Map(files.map((f) => [f, readFileSync(join(srcDir, f), "utf8")]));

  const uncomment = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, "")   /* JS block comment */
    .replace(/^[ \t]*\/\/.*$/gm, "")    /* JS line comment, ANCHORED — see above */
    .replace(/^[ \t]*--.*$/gm, "");     /* SQL line comment inside the schema literal */

  /* The word, then whitespace, then a lone capital letter. Deliberately wider
     than A-D: an invented "Grade E" is the same defect and must fail here too.
     `(?![A-Za-z0-9_])` keeps `#weakerGrade`, `instanceGrade` and "Grade states
     HOW it was matched" out of it — a letter that continues into a word is a
     word, not a grade. `only` narrows detector (B) to the rule's own letters. */
  const spelled = (text, { anyCase = false, only = null } = {}) => {
    const hits = [];
    const re = new RegExp("\\bGrade\\s+([A-Z])(?![A-Za-z0-9_])", anyCase ? "gi" : "g");
    let m;
    while ((m = re.exec(text)) !== null) {
      if (only && !only.includes(m[1].toUpperCase())) continue;
      hits.push({ line: text.slice(0, m.index).split("\n").length, what: m[0] });
    }
    return hits;
  };
  /* Taken from the enforcement point, never typed: this file states the rule's
     letters no more than the plane does. */
  const RULE_LETTERS = [EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE];

  /* REACH 1: the walk found the tree, and the modules that carry the doctrine
     are in it by name. A rename that moved one of them out would fail here
     rather than leaving this sweep quietly guarding a smaller tree. */
  t("the src walk reaches a whole tree, not a file or two", files.length >= 20, true);
  for (const named of ["affordances.mjs", "index.mjs", "store.mjs", "schema.mjs"])
    t(`the walk includes ${named}, which states or enforces the doctrine`, files.includes(named), true);
  t("every file walked was actually read", files.filter((f) => raw.get(f).length > 0).length, files.length);

  /* REACH 2: the detector fires, in EVERY file's own stripped text. Planting the
     control per file rather than once proves the per-file scan is executed —
     a loop that skipped a file would pass a single global control. It is
     measured as a DELTA against that file's own count, not against 1: an
     absolute count would conflate "the detector is deaf here" with "this file
     already has hits", which is the state every negative-control arm below puts
     one file into, and the reach assertion must go on saying only what it means. */
  const PLANT = '\nconst __reach = "Grade Z";\n';
  const deaf = files.filter((f) => {
    const stripped = uncomment(raw.get(f));
    return spelled(stripped + PLANT).length !== spelled(stripped).length + 1;
  });
  t(`the detector fires in all ${files.length} files' own stripped text (deaf: ${JSON.stringify(deaf)})`,
    deaf, []);

  /* REACH 3: over the RAW sources the same detector DOES match — so the walk
     reaches the very lines where the doctrine is written about, and the comment
     strip is the only thing between this sweep and a hit. If this ever goes to
     zero the sweep has stopped reading anything that mentions the subject, and
     its silence would mean nothing. */
  const rawHits = files.flatMap((f) => spelled(raw.get(f)).map((h) => `${f}:${h.line}`));
  t(`the same detector matches the doctrine's own prose in the raw sources (${rawHits.length} in ${new Set(rawHits.map((h) => h.split(":")[0])).size} files)`,
    rawHits.length >= 4 && new Set(rawHits.map((h) => h.split(":")[0])).size >= 2, true);

  /* REACH 4: the strip leaves the EMITTED doctrine sentences standing. These are
     the exact two strings a spelled letter would appear in, so if the stripper
     had swallowed them the sweep would be silent for the worst possible reason. */
  t("the strip leaves op=acquire's note in affordances.mjs standing",
    uncomment(raw.get("affordances.mjs")).includes("bytes as fetched, hashed at receipt"), true);
  t("the strip leaves op=earnedbasis's ceiling sentence in store.mjs standing",
    uncomment(raw.get("store.mjs")).includes("is not reachable on the capture axis at all"), true);

  /* REACH 5: the rule's own two letters are readable and distinct, so detector
     (B) is narrowed to something real. A `null` unreachable grade would make (B)
     silently look for one letter instead of two. */
  t("detector (B) takes two distinct letters from the enforced rule",
    [RULE_LETTERS.length, RULE_LETTERS.every((g) => /^[A-Z]$/.test(g || "")),
     EARNED_CAPTURE_CEILING !== UNREACHABLE_CAPTURE_GRADE],
    [2, true, true]);

  /* THE LOAD-BEARING ASSERTIONS. */
  const offendersA = files.flatMap((f) =>
    spelled(uncomment(raw.get(f))).map((h) => `${f}:${h.line} ${JSON.stringify(h.what)}`));
  t(`(A) no module of the plane spells "Grade <letter>" outside a comment (found: ${JSON.stringify(offendersA)})`,
    offendersA, []);

  const offendersB = files.flatMap((f) =>
    spelled(uncomment(raw.get(f)), { anyCase: true, only: RULE_LETTERS })
      .map((h) => `${f}:${h.line} ${JSON.stringify(h.what)}`));
  t(`(B) no module spells the capture rule's own letters (${RULE_LETTERS.join("/")}) beside "grade", in any case (found: ${JSON.stringify(offendersB)})`,
    offendersB, []);

  /* ------------------------------------------------------------------ *
   * DETECTOR (C), REC-51: a copy OF the vocabulary, not a statement
   * ABOUT it. The reasoning, the stated limit and the reason this is a
   * THIRD detector rather than a widening of (A) or (B) are in the block
   * comment above — read it before changing anything here.
   * ------------------------------------------------------------------ */
  console.log("\n--- no module restates the grade vocabulary (REC-51, detector C) ---");

  /* The SHAPE of a vocabulary restatement, never its current VALUE:
       - an array of >= 3 quoted single capitals   ["A", "B", "C", "D"]
       - an object keyed by >= 3 single capitals   { A: 4, B: 3, C: 2, D: 1 }
     Three is the floor because two letters are a pair, not a vocabulary, and
     the capture rule's own two letters are legitimately handled in pairs.
     Deliberately NOT compared against BASIS_GRADES: see the block comment. */
  const vocabLiterals = (text) => {
    const hits = [];
    const res = [
      /\[\s*(?:(['"])[A-Z]\1\s*,\s*){2,}(['"])[A-Z]\2\s*,?\s*\]/g,
      /\{\s*(?:[A-Z]\s*:\s*[^,{}]+,\s*){2,}[A-Z]\s*:\s*[^,{}]+\s*,?\s*\}/g,
    ];
    for (const re of res) {
      let m;
      while ((m = re.exec(text)) !== null)
        hits.push({ line: text.slice(0, m.index).split("\n").length,
                    what: m[0].replace(/\s+/g, " ").trim() });
    }
    return hits;
  };

  /* REACH C0, AND IT GUARDS ALL THREE DETECTORS, NOT ONLY (C). The walk the
     whole block shares is `readdirSync(srcDir)`, which does NOT descend. Today
     `src/` is flat — 23 modules, and `find src -name '*.mjs'` returns the same
     23 — so the sweep reaches everything it claims to. But nothing said so, and
     the day somebody adds `src/something/` the sweep would go on passing while
     quietly guarding a smaller tree: the covered-on-paper failure this project
     has now hit five times, arriving through the FILE LIST rather than through a
     detector. Asserting flatness is the honest fix at this altitude — it fails
     the moment the assumption stops holding, and whoever adds the directory then
     makes the walk recursive deliberately instead of never learning it mattered. */
  t("the src walk's flat-directory assumption still holds (no subdirectory escapes any detector)",
    readdirSync(srcDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name),
    []);

  /* REACH C1: (C) fires in EVERY file's own stripped text, measured as a DELTA
     against that file's own count — REC-48's arm-(i) correction, which first
     compared a planted count to 1 and so read a file that already had hits as
     deaf. store.mjs is exactly such a file (the stated limit lives there), so
     this suite would reproduce that defect verbatim if it compared to 1. */
  const PLANT_C = '\nconst __reachC = ["Q", "R", "S"];\n';
  const deafC = files.filter((f) => {
    const stripped = uncomment(raw.get(f));
    return vocabLiterals(stripped + PLANT_C).length !== vocabLiterals(stripped).length + 1;
  });
  t(`(C) fires in all ${files.length} files' own stripped text (deaf: ${JSON.stringify(deafC)})`,
    deafC, []);

  /* REACH C2: (C) recognises BOTH SHAPES REC-51 removed, and each specimen below
     is a verbatim transcription of a line that stood in store.mjs before this
     item — the array copy and the rank map. They are written out here rather
     than read back out of the source: the source no longer holds them, and
     reading them out of the COMMENTS that quote them would tie this assertion to
     the wording of a comment, which is not a thing to pin. So this says exactly
     what it is, a specimen test, and it earns its keep by covering both forms —
     a detector that found only arrays would be half a detector and would have
     left the rank map standing. THE EMPIRICAL PROOF THAT (C) CATCHES THE REAL
     DEFECT IS ARM (b), which runs it against the actual pre-fix tree and gets
     all four sites back by file and line; this assertion is the cheap standing
     guard that keeps both shapes covered between control runs. */
  const removedArray = vocabLiterals('const x = ["A","B","C","D"];');
  const removedObject = vocabLiterals("static R = { A: 4, B: 3, C: 2, D: 1 };");
  t("(C) recognises both shapes REC-51 removed — the array copy and the rank map",
    [removedArray.length, removedObject.length], [1, 1]);

  /* REACH C3: (C) is INDEPENDENT OF THE CATALOG'S CURRENT VALUE. This is the
     assertion that makes the negative control mean something: the control adds
     a letter to BASIS_GRADES, and a detector that compared literals against the
     catalog would go silent on the four-letter copies at exactly that moment.
     A five-letter copy and a four-letter copy must both be named. */
  t("(C) names a vocabulary copy whether or not it matches today's catalog",
    [vocabLiterals('const x = ["A","B","C","D"];').length,
     vocabLiterals('const x = ["A","B","C","D","E"];').length,
     vocabLiterals('const x = ["W","X","Y","Z"];').length],
    [1, 1, 1]);

  /* REACH C4: (C) is NARROW — it does not simply match every array or object in
     the tree, which would make its silence meaningless and its noise unusable.
     A two-letter pair, a word vocabulary and an ordinary options object are all
     legitimately NOT restatements of a grade vocabulary. */
  t("(C) does not fire on a pair, a word vocabulary or an ordinary object",
    [vocabLiterals('const x = ["A","B"];').length,
     vocabLiterals('const x = ["capture","connection"];').length,
     vocabLiterals("const x = { ok: 1, reason: 2, detail: 3 };").length],
    [0, 0, 0]);

  /* THE LOAD-BEARING ASSERTION. Line numbers are deliberately kept out of the
     compared value — they shift with any edit above and would turn this pin
     into a maintenance tax — while the label still reports them, so a failure
     names the place. */
  const hitsC = files.flatMap((f) =>
    vocabLiterals(uncomment(raw.get(f))).map((h) => ({ f, ...h })));
  const offendersC = hitsC.map((h) => `${h.f} ${h.what}`);
  t(`(C) the only grade-vocabulary literal left in src/ is the machine-mintable subset, OPEN BY DECISION and not by oversight — a sixth would fail here (found: ${JSON.stringify(hitsC.map((h) => `${h.f}:${h.line} ${h.what}`))})`,
    offendersC, ['store.mjs ["A", "B", "C"]']);

  /* THE STATED LIMIT, HELD RATHER THAN EXEMPTED (REC-50's pattern). The subset
     is read OUT OF the source above and never typed here, then pinned to a
     RELATION: a contiguous strongest-first prefix of the catalog, strictly
     shorter than it. That asserts no VALUE, so it is not a ruling. A catalog
     that REORDERS or RENAMES its letters fails here by name; a catalog that
     APPENDS one leaves it green, which is the honest answer — whether a machine
     may mint a new letter is the undetermined question, and a derivation that
     answered it silently is the thing this assertion exists to prevent. */
  const subsetLetters = (hitsC[0]?.what.match(/[A-Z](?=["'])/g)) || [];
  t(`the machine-mintable subset (${subsetLetters.join("/")}) is a strict, contiguous, strongest-first prefix of BASIS_GRADES (${BASIS_GRADES.join("/")})`,
    [subsetLetters.length >= 2,
     subsetLetters.length < BASIS_GRADES.length,
     subsetLetters.every((g, i) => g === BASIS_GRADES[i])],
    [true, true, true]);

  /* THE RANK IS DERIVED, AND THAT IS PINNED STRUCTURALLY. (C) stops the rank map
     from being written as a literal again; this says the thing that replaced it
     actually reads the catalog, rather than reaching the same numbers by some
     other private route. The match itself is asserted first — an extraction that
     silently yielded null would make every test below it trivially true, which
     is the instrument-level version of the very defect this suite guards. */
  const rankInit = uncomment(raw.get("store.mjs")).match(/#GRADE_RANK\s*=([\s\S]*?);/);
  t("store.mjs's grade rank initialiser is readable at all (the extraction is not silently null)",
    rankInit !== null, true);
  t("the grade rank map is DERIVED from BASIS_GRADES' own order, not restated",
    [/\bBASIS_GRADES\b/.test(rankInit?.[1] ?? ""),
     /['"][A-Z]['"]/.test(rankInit?.[1] ?? "")],
    [true, false]);

  /* REC-51'S CONTROL ARMS were recorded HERE, at the assertion site, because the
     concurrent item M0-9 held this file's `NEGATIVE CONTROL:` header at the time
     and not one byte of it could be touched. M0-9 has LANDED, so REC-46 FOLDED
     THEM INTO THAT HEADER on 2026-08-04 — verbatim as run, on the written
     instruction REC-51 left here for exactly this moment. They are deliberately
     NOT duplicated here: two copies of a control record drift apart, which is the
     defect this whole line of items exists to close, one altitude up. */
}

/* ==================================================================== *
 * ONE MACHINE-IDENTITY PREDICATE (REC-46, out of REC-45's measurement).
 *
 * WHAT WENT WRONG, AND IT IS THE MAP RULE AT AN ALTITUDE THE OTHER SWEEPS
 * DO NOT REACH. This plane had THREE unrelated answers to "is this a person":
 * the catalog's `NON_MEMBER_AUTHORS` word list, the `token:` prefix store.mjs
 * refused BY SHAPE at eleven guards, and `ACTOR_CLASSES`. None knew what the
 * others knew, so `checkGrounds` — which asked only the word list — accepted
 * `asserted_by: token:member`, THE VERY SPELLING index.mjs stamps, while
 * refusing the same claim for saying `agent`. Measured through op=promote
 * before the fix: three minted spellings, three passes.
 *
 * WHY THIS IS A NEW BLOCK AND NOT A FOURTH DETECTOR ON THE ONE ABOVE.
 * (A)/(B)/(C) all have a LEXICAL subject — a letter beside a word, or an array
 * of letters — and their precision comes from that anchor. A machine identity
 * has no such anchor: `word:${x}`, `/^word:/` and `["a","b"].includes(x)` are
 * ordinary constructs this tree writes 60-odd times for formats, part ids,
 * frontmatter keys and status vocabularies. MEASURED, not assumed: a
 * shape-only sweep for those three forms over src/ and checks/ returns 62 hits
 * and every one of them is innocent. A detector that noisy gets weakened until
 * it finds nothing, which is the failure mode UI-32 recorded one tree over.
 *
 * SO THE SUBJECT IS THE ASKING SITE, NOT THE VOCABULARY, and that is what
 * makes both detectors below BLIND TO THE CURRENT VALUE — REC-51's REACH C3,
 * one subject over, and it matters more here because the negative control MOVES
 * the prefix. A detector that looked for the string `token:` would go deaf at
 * exactly the moment a stale `/^token:/` copy became dangerous.
 *
 * (D1) EVERY MACHINE REFUSAL IS DECIDED BY THE PREDICATE. A site is found by
 * the refusal it EMITS — the one thing a site that has drifted still has — and
 * its GUARD is then required to call the predicate and to contain no local
 * identity decision of its own (no regex literal, no `.includes(`, no
 * `.startsWith(`, no string equality). Nothing in it names a prefix, a class
 * word or an AI identity.
 *
 * (D2) EACH IDENTITY VOCABULARY HAS EXACTLY ONE READER. `NON_MEMBER_AUTHORS`
 * and `ACTOR_CLASSES` may be read only inside the predicate that owns them. A
 * site that goes back to consulting a vocabulary directly fails here by name
 * even if its guard still looks tidy — and a site that hand-types the words
 * instead fails (D1)(b). The two arms are useless apart, which is why both run.
 *
 * A STATED LIMIT, HELD RATHER THAN EXEMPTED, and it is a finding rather than a
 * gap: `viewerPredicate` in src/query.mjs is NOT rewired and is NOT swept here.
 * It asks the same words of the same spelling and answers a DIFFERENT question
 * — not "is this a machine, and therefore refused" but "whose view does this
 * credential compile for", and its answer for a machine is a PERMISSION
 * (unfiltered scope), not a refusal. Widening it to `isMachineIdentity` would
 * change who may see the group's thinking, which is a ruling and not a sweep.
 * What it DOES share is the spelling, imported, and that is pinned below as a
 * RELATION — the parser recognises what the mint writes — which asserts no
 * value and so is not a ruling either (REC-50/REC-51's pattern).
 * ==================================================================== */
console.log("\n--- one machine-identity predicate, and every asking site reads it (REC-46) ---");
{
  const roots = ["src", "checks"];
  const files = roots.flatMap((r) => readdirSync(join(DIR, "..", r))
    .filter((n) => n.endsWith(".mjs")).sort().map((n) => `${r}/${n}`));
  const raw = new Map(files.map((f) => [f, readFileSync(join(DIR, "..", f), "utf8")]));
  const uncomment = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/^[ \t]*--.*$/gm, "");

  /* THE ANCHORS: what a machine-refusal site EMITS. The store names its
     refusals; the catalog states them in the finding's own sentence. Neither is
     a copy of the predicate, so a site that stopped calling the predicate is
     still in this set — which is the whole reason the anchor is the emitted
     refusal rather than the call. */
  const ANCHORS = [
    /reason:\s*"MACHINE_CANNOT_[A-Z_]+"/g,          /* store.mjs's eleven act guards */
    /is not a named member/g,                        /* the catalog's C-2.8 findings */
    /never a surface or AI identity/g,               /* C-18.1 release authority */
    /a surface or AI identity, never a release author/g,  /* C-18.8 signed release */
    /const memberRelease =/g,                        /* C-18.1's fence, the NEGATED ask */
  ];
  /* A LOCAL IDENTITY DECISION: the four shapes a guard would use if it decided
     for itself. None of them names a value, so moving the vocabulary or the
     prefix cannot deafen this.

     THE STRING-EQUALITY ARM IS NARROWED, and the narrowing is MEASURED rather
     than aesthetic — it fired on two correct guards before it was written.
     `typeof x !== 'string'` and `x.trim() === ''` are SHAPE tests (is there a
     value here at all), not identity tests, and they must stay: absent is not
     machine, so every asking site keeps its own blank arm. So the arm matches
     equality against a NON-EMPTY string literal that is not a `typeof` name —
     still blind to every identity value, since it names none of them. */
  const TYPEOF = "string|number|boolean|object|undefined|function|symbol|bigint";
  const LOCAL = [[/\/\^[^/\n]+\//, "a regex literal"], [/\.includes\s*\(/, "an .includes( test"],
                 [/\.startsWith\s*\(/, "a .startsWith( test"],
                 [new RegExp(`[!=]==\\s*(['"\`])(?!(?:${TYPEOF})\\1)(?:\\\\.|(?!\\1).)+\\1`),
                  "a string equality"]];
  const CALLS = /\bisMachine(Identity|Stamp)\s*\(/;

  /* The guard that produces an anchor: the nearest preceding line that OPENS a
     decision, within a short lookback. Deliberately short — a guard that is not
     within eight lines of the refusal it produces is a site this instrument
     cannot honestly speak about, and it is reported as unresolved rather than
     silently passed, because an anchor that resolved to nothing would make this
     whole sweep quieter the more it drifted. */
  const guardFor = (text, idx) => {
    const lines = text.split("\n");
    const at = text.slice(0, idx).split("\n").length - 1;      /* 0-based */
    for (let i = at; i >= Math.max(0, at - 8); i--) {
      if (!/^\s*(if\s*\(|const memberRelease\s*=)/.test(lines[i])) continue;
      /* Read the guard WHOLE. The one this item corrected at `checkGrounds` is
         written across two lines, and a one-line reader would have taken its
         first half — reporting the type test and never seeing the predicate
         call, which is an instrument that lies in the ACCUSING direction. It
         extends until the parens balance, and never more than six lines. */
      let depth = 0, src = "";
      for (let j = i; j <= Math.min(lines.length - 1, i + 6); j++) {
        src += (j === i ? lines[j] : " " + lines[j].trim());
        for (const c of lines[j]) { if (c === "(") depth++; else if (c === ")") depth--; }
        if (depth <= 0) break;
      }
      return { line: i + 1, src };
    }
    return null;
  };
  const sites = [];
  for (const f of files) {
    const text = uncomment(raw.get(f));
    for (const re of ANCHORS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const g = guardFor(text, m.index);
        sites.push({ f, at: text.slice(0, m.index).split("\n").length, what: m[0], guard: g });
      }
    }
  }

  /* REACH R0, and it guards BOTH detectors: the two walks do not descend, and
     `src/` and `checks/` are flat today. REC-51 found this gap in the sweep
     above and closed it there; the same walk written a second time would have
     reopened it, so it is asserted here too rather than assumed to be somebody
     else's problem. */
  for (const r of roots)
    t(`the ${r} walk's flat-directory assumption still holds (nothing escapes either detector)`,
      readdirSync(join(DIR, "..", r), { withFileTypes: true })
        .filter((e) => e.isDirectory()).map((e) => e.name), []);

  /* REACH R1: the walk found both trees, and by name the three modules that
     carry this question. A rename moving one out fails here rather than leaving
     the sweep quietly guarding less. */
  t("the walk reaches both trees, not one of them",
    [files.some((f) => f.startsWith("src/")), files.some((f) => f.startsWith("checks/")),
     files.length >= 20], [true, true, true]);
  for (const named of ["src/store.mjs", "src/index.mjs", "checks/bio-checks.mjs"])
    t(`the walk includes ${named}, which asks or answers the question`, files.includes(named), true);

  /* REACH R2: the anchors FOUND something, in BOTH trees, and every one of them
     resolved to a guard. An anchor set that matched nothing would make (D1)
     vacuously green — the covered-on-paper failure this project has hit six
     times — and an anchor that resolved to no guard would be silently dropped
     from the subject, which is the same failure one step in. */
  const unresolved = sites.filter((s) => !s.guard).map((s) => `${s.f}:${s.at} ${s.what}`);
  t(`every machine-refusal anchor resolves to the guard that produces it (unresolved: ${JSON.stringify(unresolved)})`,
    unresolved, []);
  t(`the anchors find refusal sites in BOTH trees (${sites.length} sites: ${
      JSON.stringify(Object.entries(sites.reduce((a, s) => ((a[s.f] = (a[s.f] || 0) + 1), a), {})))})`,
    [sites.length >= 12,
     sites.some((s) => s.f.startsWith("src/")), sites.some((s) => s.f.startsWith("checks/"))],
    [true, true, true]);

  /* REACH R3: the two halves of (D1) RECOGNISE what they claim to, on hand-
     written specimens — the guard as it stood before this item at both shapes,
     and the guard as it stands now. This is a specimen test and says so; the
     empirical proof is the negative control, which runs the real pre-fix guard
     back into the real tree and gets it named by file and line. */
  const before9 = `    if (!who || who === "member" || /^token:/.test(who))`;
  const before2 = `    if (/^token:/.test(String(actor)))`;
  const beforeC = `  if (!a || NON_MEMBER_AUTHORS.includes(a)) {`;
  const after9  = `    if (!who || isMachineIdentity(who))`;
  t("(D1) recognises all three pre-fix guard shapes as deciding locally, and the composed one as not",
    [LOCAL.some(([re]) => re.test(before9)), LOCAL.some(([re]) => re.test(before2)),
     LOCAL.some(([re]) => re.test(beforeC)), LOCAL.some(([re]) => re.test(after9)),
     CALLS.test(before9), CALLS.test(after9)],
    [true, true, true, false, false, true]);

  /* REACH R4: (D1) is BLIND to what counts as a machine today. The same guard
     written against a different prefix, a different class word and a different
     word list is caught identically — which is what makes the negative control
     that MOVES the vocabulary mean something. */
  t("(D1) names a locally-deciding guard whatever vocabulary it decides against",
    [LOCAL.some(([re]) => re.test(`if (!who || who === "bot" || /^bot:/.test(who))`)),
     LOCAL.some(([re]) => re.test(`if (["butler","valet"].includes(who))`)),
     LOCAL.some(([re]) => re.test(`if (String(who).startsWith(PREFIX))`))],
    [true, true, true]);

  /* THE LOAD-BEARING ASSERTIONS. */
  const notCalling = sites.filter((s) => s.guard && !CALLS.test(s.guard.src))
    .map((s) => `${s.f}:${s.guard.line} ${s.guard.src.trim()}`);
  t(`(D1a) every machine refusal in the plane is decided by the one predicate (found deciding otherwise: ${JSON.stringify(notCalling)})`,
    notCalling, []);

  const deciding = sites.filter((s) => s.guard)
    .flatMap((s) => LOCAL.filter(([re]) => re.test(s.guard.src))
      .map(([, name]) => `${s.f}:${s.guard.line} ${name}: ${s.guard.src.trim()}`));
  t(`(D1b) and no such guard decides identity locally (found: ${JSON.stringify(deciding)})`,
    deciding, []);

  /* (D2). The declaration line itself is excluded by matching only occurrences
     that are not preceded by `export const` — a vocabulary must be declarable
     where it lives. Everything else is a READER, and there may be exactly one
     region of readers: the predicate's own body. */
  const VOCABS = ["NON_MEMBER_AUTHORS", "ACTOR_CLASSES"];
  const outsiders = [];
  for (const f of files) {
    if (f === "checks/bio-checks.mjs") continue;
    const text = uncomment(raw.get(f));
    for (const v of VOCABS) if (new RegExp(`\\b${v}\\b`).test(text)) outsiders.push(`${f} reads ${v}`);
  }
  t(`(D2a) no module outside the catalog reads an identity vocabulary directly (found: ${JSON.stringify(outsiders)})`,
    outsiders, []);

  const cat = uncomment(raw.get("checks/bio-checks.mjs"));
  const predBody = cat.slice(cat.indexOf("export function isMachineStamp"));
  const predEnd = predBody.indexOf("\n}", predBody.indexOf("export function isMachineIdentity")) + 2;
  const inside = predBody.slice(0, predEnd);
  const insideOk = predEnd > 2;
  t("the predicate's own body is extractable at all (the extraction is not silently empty)",
    [insideOk, CALLS.test(inside) || /isMachineStamp/.test(inside)], [true, true]);
  const catReaders = VOCABS.map((v) => {
    const all = (cat.match(new RegExp(`\\b${v}\\b`, "g")) || []).length;
    const declared = (cat.match(new RegExp(`export const ${v}\\b`, "g")) || []).length;
    const inPredicate = (inside.match(new RegExp(`\\b${v}\\b`, "g")) || []).length;
    return `${v}: ${all} total, ${declared} declaration, ${inPredicate} in the predicate`;
  });
  /* (D2b), AND THE SECOND READER OF `ACTOR_CLASSES` IS A DIFFERENT QUESTION,
     LEFT ALONE WITH ITS DIFFERENCE STATED rather than collapsed into the
     predicate — the judgement REC-51 made about the machine-mintable subset,
     one subject over. C-18.1 reads that array to validate a DECLARED FIELD
     (`provenance.documents[].capture.actor_class`) against the closed set of
     values it may take. That is a vocabulary-membership question about a value
     the record CARRIES, not an identity question about who is ACTING, and its
     finding says so in its own words ("is not one of"). The overlap is real —
     the three class words are exactly the bare words the predicate refuses when
     one stands where a person's name belongs — and it is an overlap of VALUES,
     not of questions. Collapsing them would make the check refuse a legitimate
     declared `actor_class: daemon` on every sweep-origin capture in the record.
     So the count is pinned EXACTLY, with the second reader named: a THIRD
     reader fails here by name, and the second one cannot rot away either. */
  t(`(D2b) inside the catalog each identity vocabulary is DECLARED once and READ once by the predicate — ACTOR_CLASSES' second reader is C-18.1's DECLARED-FIELD check and is a different question, named here so a THIRD reader fails (${JSON.stringify(catReaders)})`,
    catReaders, ["NON_MEMBER_AUTHORS: 2 total, 1 declaration, 1 in the predicate",
                 "ACTOR_CLASSES: 4 total, 1 declaration, 1 in the predicate"]);
  t("and that second reader is still asking the DECLARED-FIELD question, not an identity one",
    [/actor_class '\$\{cap\.actor_class\}' is not one of/.test(cat),
     /!ACTOR_CLASSES\.includes\(cap\.actor_class\)/.test(cat)], [true, true]);

  /* THE ANSWER SET, AND IT IS THE "EVERY EXISTING MACHINE REFUSAL UNCHANGED"
     HALF OF THIS ITEM — asserted rather than assumed. Every value the three old
     ways refused is still refused, the two minted spellings that used to walk
     through are now refused too, and the things that were never machines are
     still not. A widening or a narrowing of the predicate fails HERE by name,
     which is what makes the second negative control (widen it in its one home)
     legible instead of merely green. */
  const REFUSED = [...NON_MEMBER_AUTHORS, ...ACTOR_CLASSES,
                   `${MACHINE_AUTHOR_PREFIX}member`, `${MACHINE_AUTHOR_PREFIX}probe`,
                   `${MACHINE_AUTHOR_PREFIX}admin`, `${MACHINE_AUTHOR_PREFIX}daemon`,
                   `${MACHINE_CLASS_PREFIX}member`, `${MACHINE_CLASS_PREFIX}daemon`,
                   `${MACHINE_AUTHOR_PREFIX}member`.toUpperCase(), ` ${MACHINE_CLASS_PREFIX}probe `];
  t(`every identity this plane treats as a machine is refused by the one predicate (${REFUSED.length} of them)`,
    REFUSED.filter((w) => !isMachineIdentity(w)), []);
  /* The complement, and it costs nothing to produce is exactly why it is here:
     a predicate that answered TRUE for everything would satisfy the line above
     perfectly. "admin" is in this list on purpose — it is ROOT_ADMIN's own
     session on the two task verbs, and refusing it would lock the root
     administrator out of forwarding and resolving. */
  const ADMITTED = ["carol", "dave", "mem-rec46", "admin", "Bob Krause", "member:carol", "", null];
  t("and a named person, an id, ROOT_ADMIN's bare session and an ABSENT identity are all NOT machines",
    ADMITTED.filter((w) => isMachineIdentity(w)), []);
  /* ABSENT IS NOT MACHINE, stated as its own assertion because it is a doctrine
     line and not an implementation detail: undetermined is first-class, so the
     predicate must not let a caller's silence be reported as a machine. Every
     asking site keeps its own `!who` arm for that reason. */
  t("an absent identity answers FALSE — nobody said and a machine said are different findings",
    [isMachineIdentity(null), isMachineIdentity(""), isMachineIdentity("   "),
     isMachineStamp(null), isMachineStamp("")], [false, false, false, false, false]);
  /* THE NARROW PREDICATE IS NARROWER, asserted so the two cannot be collapsed
     by a later reader who notices they overlap — REC-48's pin on op=acquire's
     note not being ATTEST_FENCE, at a different altitude. */
  t("the NARROW predicate is strictly narrower: it takes the minted stamps and nothing else",
    [isMachineStamp(`${MACHINE_AUTHOR_PREFIX}probe`), isMachineStamp(`${MACHINE_CLASS_PREFIX}probe`),
     isMachineStamp("daemon"), isMachineStamp("member"), isMachineStamp("claude"),
     MACHINE_STAMP_PREFIXES.every((p) => isMachineIdentity(`${p}x`))],
    [true, true, false, false, false, true]);

  /* THE STATED LIMIT, PINNED AS A RELATION AND NOT AS A VALUE (REC-50/REC-51's
     pattern). `viewerPredicate` is left asking its own question; what is pinned
     is that it still recognises WHAT THE MINT WRITES. That asserts no value —
     move the prefix and both sides move together — and it fails by name the day
     the parser and the stamp stop being the same string, which is the one way
     this deliberate difference could turn into a defect. */
  const QUERY_SRC = uncomment(raw.get("src/query.mjs"));
  t("viewerPredicate recognises the prefix the control plane MINTS, and takes it from the same place",
    [viewerPredicate(`${MACHINE_CLASS_PREFIX}daemon`).scope,
     viewerPredicate(`${MACHINE_CLASS_PREFIX}member`).scope,
     /MACHINE_CLASS_PREFIX/.test(QUERY_SRC),
     new RegExp(`["'\`]${MACHINE_CLASS_PREFIX}`).test(QUERY_SRC)],
    ["member", "member", true, false]);
  /* And that it is still DISCRIMINATING — a parser that answered `member` for
     everything would satisfy the two scopes above at zero cost. */
  t("and it still refuses what the mint does not write",
    [viewerPredicate(`${MACHINE_AUTHOR_PREFIX}member`).scope,
     viewerPredicate(`${MACHINE_CLASS_PREFIX}nobody`).scope,
     viewerPredicate("member:carol").scope],
    ["DENY", "DENY", "participant"]);

  /* REACH R5: BOTH detectors fire in EVERY file's own stripped text, as a DELTA
     against that file's own count and NEVER against an absolute. REC-48 shipped
     the absolute version of this assertion and had to correct it because the
     file already carried hits; REC-51 hit the same thing; UI-32 hit it a third
     time. store.mjs and bio-checks.mjs both already carry sites, so this suite
     would reproduce that defect verbatim if it compared to 1. */
  const PLANT_D1 = '\nif (String(who).startsWith("bot:")) return { ok: false, reason: "MACHINE_CANNOT_PLANT" };\n';
  const deafD1 = files.filter((f) => {
    const s = uncomment(raw.get(f));
    const count = (txt) => {
      let n = 0;
      const re = /reason:\s*"MACHINE_CANNOT_[A-Z_]+"/g;
      let m;
      while ((m = re.exec(txt)) !== null) {
        const g = guardFor(txt, m.index);
        if (g && LOCAL.some(([r]) => r.test(g.src))) n++;
      }
      return n;
    };
    return count(s + PLANT_D1) !== count(s) + 1;
  });
  t(`(D1) fires in all ${files.length} files' own stripped text (deaf: ${JSON.stringify(deafD1)})`,
    deafD1, []);

  const PLANT_D2 = "\nconst __reachD2 = NON_MEMBER_AUTHORS.length;\n";
  const deafD2 = files.filter((f) => {
    const s = uncomment(raw.get(f));
    const n = (txt) => (txt.match(/\bNON_MEMBER_AUTHORS\b/g) || []).length;
    return n(s + PLANT_D2) !== n(s) + 1;
  });
  t(`(D2) fires in all ${files.length} files' own stripped text (deaf: ${JSON.stringify(deafD2)})`,
    deafD2, []);

  /* REC-46'S CONTROL ARMS are recorded in this suite's own `NEGATIVE CONTROL:`
     header block at the top of the file, where the register reads them — M0-9
     has LANDED, so the block REC-50 and REC-51 could not write into is writable
     again, and REC-51's arms have been folded into it in this same turn on the
     written instruction it left. */
}

/* ---- the negative-control REGISTER's own detector, asserted (M0-9) ----------
 * `scripts/coverage.mjs` is the instrument CONDUCT verifies every landing with,
 * and the register is the part of it that answers "which suites have actually
 * been controlled". It was believed rather than tested, and it was wrong in the
 * generous direction twice over: a declaration whose arms continued onto a second
 * line matched NOTHING and the suite read as declaring NO CONTROL (REC-48 hit
 * exactly this and got past it by moving its arms into a second comment the
 * register never saw), and a declaration that did match was recorded first line
 * only, so a five-arm control entered the register as one arm — fully green while
 * quoting a fraction of what it checked.
 *
 * This suite is the right altitude for it for the same reason the sweep above is:
 * it reads its siblings as text, needs no runtime, and sits one level above the
 * thing it measures. It is here rather than in a suite of its own deliberately —
 * a 99th suite would move the register's own denominator, and an instrument whose
 * test changes the number it reports is the worst kind to reason about.
 *
 * ITS OWN REACH IS ASSERTED, because a detector that finds nothing passes
 * everything (UI-30 in an instrument, REC-49's arm that first fired zero, and
 * REC-48's reach assertion that was WRONG when first written because it compared
 * a planted count to 1 instead of to a delta). Every arm below is either a DELTA
 * against the same source with one thing changed, or a read of the REAL corpus —
 * never an absolute count that a deaf detector could also satisfy. */
console.log("\n--- the negative-control register's own detector (M0-9) ---");
{
  const lines = (n, what) => Array(n).fill(what).join("\n");
  const arm = (k) => `   (${k}) break ${k} -> ${k} fails`;
  /* EVERY fixture builds its marker from the instrument's OWN exported constant
     and never as a literal. A literal here would put real declarations into THIS
     suite's source, and a register that reads its own test's fixtures is how a
     number quietly stops meaning what it says — the same class of accident this
     item exists to close. It also keeps the marker spelled in exactly one place. */
  const decl = (rest) => `${CONTROL_MARKER} ${rest}`;

  /* PAST THE OLD 60-LINE HEAD WINDOW, and the delta that proves it was read. */
  const deep = lines(200, "/* header prose */") + "\n/* " + decl("break X -> Y fails") + " */\n";
  const deepFound = readControl(deep);
  t("a control declared past line 60 is found", deepFound != null, true);
  t("...on the line it was actually written on", deepFound && deepFound.line > 60, true);
  t("...and the same source with its marker hidden reads as NO control (the delta)",
    readControl(deep.replaceAll(CONTROL_MARKER, "NEGATIVE CONTROL(hidden):")), null);

  /* STRADDLING line 60: the window used to record whatever fell inside it and
     call the suite controlled — a fragment, silently. */
  const straddle = lines(58, "/* x */")
    + "\n/* " + decl("three arms") + "\n" + ["a", "b", "c"].map(arm).join("\n") + " */\n";
  const straddled = readControl(straddle);
  t("a declaration straddling line 60 is read WHOLE, not truncated at the window",
    [straddled.arms, straddled.text.includes("(c) break c")], [3, true]);

  /* EVERY ARM. The marker line here states no arm at all, so a first-line-only
     detector reports 0 and this is not satisfiable by accident. The truncation is
     a DELTA between two blocks, never a comparison against 1. */
  const five = "/* " + decl("five arms, each RUN") + "\n" + ["a", "b", "c", "d", "e"].map(arm).join("\n") + " */\n";
  const two = "/* " + decl("five arms, each RUN") + "\n" + ["a", "b"].map(arm).join("\n") + " */\n";
  t("every arm of a five-arm block is counted, though the marker line states none",
    readControl(five).arms, 5);
  t("truncating that block to two arms drops the count by exactly the three removed",
    readControl(five).arms - readControl(two).arms, 3);

  /* WHERE A DECLARATION ENDS, asserted in BOTH directions: it must reach past the
     marker's own line, and it must NOT swallow the paragraph after it. One
     without the other is half an answer. */
  const withProse = "/* Header.\n *\n * " + decl("break X -> Y fails")
    + "\n *   (b) break Z -> W fails\n *\n * UNRELATED PARAGRAPH, not part of the control.\n */\n";
  const extent = readControl(withProse);
  t("a declaration inside a header reaches its continuation lines",
    extent.text.includes("break Z"), true);
  t("...and stops at the blank comment line, before unrelated prose",
    extent.text.includes("UNRELATED PARAGRAPH"), false);

  /* The other comment form, and its end. */
  const slashes = "// " + decl("break X -> Y fails") + "\n//   (b) break Z -> W fails\nconst after = 1;\n";
  t("a declaration written as a // run is read to the end of the run and no further",
    [readControl(slashes).arms, readControl(slashes).text.includes("const after")], [2, false]);

  /* NEVER THE SUM. Most suites state their control twice — prose in the header and
     the one-line register entry — and they are the same control; crediting both
     would be the generous direction wearing a different hat. */
  const twice = "/* " + decl("break X -> Y fails") + "\n   (b) break Z -> W fails */\n"
    + "/* " + decl("break X -> Y fails") + " */\n";
  t("a control stated twice is recorded once at its fullest, never summed",
    readControl(twice).arms, 2);

  /* ---- and now on the REAL corpus, which is what the register actually reads. */
  const registry = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs"))
    .map((f) => ({ f, c: readControl(readFileSync(join(DIR, f), "utf8")) }));
  const read = registry.filter((r) => r.c);

  t(`the register scan reaches the whole battery, not a file or two (${registry.length} suites)`,
    registry.length >= 90, true);

  /* THE DELTA ON REAL DATA: hide the marker in one real suite's source and that
     suite alone leaves the register. An absolute count would be satisfied by a
     detector that had stopped reading. */
  const victimSrc = readFileSync(join(DIR, "capture.test.mjs"), "utf8");
  t("the register reads capture.test.mjs's declaration out of its real source",
    readControl(victimSrc) != null, true);
  t("...and reads none once its marker is hidden, so the read above is a measurement",
    readControl(victimSrc.replaceAll(CONTROL_MARKER, "NEGATIVE CONTROL(hidden):")), null);

  /* The corpus exercises the two capabilities this detector was fixed to have.
     If either of these ever goes to zero, the fix is still in the code but nothing
     in the tree proves it works — which is how the workaround got in. */
  /* CORRECTED BY M0-14: this summed `r.c.arms` straight, and an UNCLASSIFIED
     declaration now reports `null`. `n + null` is `n` in JavaScript, so the old
     expression would have folded an unreadable declaration in as a silent zero —
     which is the exact defect this item closes, reproduced inside the arm that
     measures it. Classified rows only, and the unclassified are counted apart. */
  const classified = read.filter((r) => typeof r.c.arms === "number");
  const arms = classified.reduce((n, r) => n + r.c.arms, 0);
  const multiLine = read.filter((r) => r.c.lines > 1).map((r) => r.f);
  t(`the register reads more arms than suites (${arms} arms across ${classified.length} classified of ${read.length} registered suites), so it is not stopping at one per suite`,
    arms > read.length, true);
  t(`the tree itself declares at least one MULTI-LINE control, so the block read is exercised by the corpus and not only by fixtures (${JSON.stringify(multiLine)})`,
    multiLine.length > 0, true);
}

/* ===========================================================================
   M0-14 / D-233 — THE ARM MATCHER, AND THE ONE THING IT MUST NEVER DO SILENTLY.

   The register's tally was blind to whole declaration styles and reported the
   blindness as ZERO. Four suites declaring 48 arms between them scored 0, a
   fifth scored 1 against a real 10, and NOTHING WAS RED — M0-13 found it only
   because it predicted a move of 388 -> 390 and the figure did not move at all.

   The arms below are in two families, and the second is the important one:
   the matcher must COUNT more styles, and — the half that lasts — it must NEVER
   report "I could not read this" as "there is nothing here". A count and the
   absence of a count are different claims (D-93's lesson; REC-70's receipt about
   a missing tally read as 0 recording "stayed GREEN").

   Every arm is a DELTA against the same source with one thing changed, or a read
   of the REAL corpus with its size printed. An absolute count would be satisfied
   by a matcher that had stopped reading — which is REC-48's reach assertion being
   wrong when first written, and it is not repeated here.
   =========================================================================== */
console.log("\n--- the register's arm matcher: what it counts, and what it says it cannot (M0-14) ---");
{
  const decl = (rest) => `${CONTROL_MARKER} ${rest}`;
  /* Built from the instrument's own constants, never as a literal — the same
     reason the M0-9 fixtures do it: a literal marker in this file would plant a
     real declaration in the corpus the register reads. */
  const dashDecl = (rest) => `${MARKER_PHRASE} ${MARKER_SEPARATORS[1]} ${rest}`;
  const item = (k, what) => `   (${k}) ${what}`;

  /* ---- (A) THE STYLE THE OLD MATCHER COULD NOT SEE: an enumerated list with no
     arrow anywhere in it. `strengthpair.test.mjs` declares seventeen arms this
     way and scored ZERO. Asserted as a DELTA, never against an absolute. */
  const nine = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const enumerated = (ks) => "/* " + decl("the arms, each RUN") + "\n"
    + ks.map((k) => item(k, `neuter check ${k} and its own assertion is the one that fails`)).join("\n") + " */\n";
  t("an ARROWLESS enumerated declaration is counted — the style that scored zero (D-233)",
    readControl(enumerated(nine)).arms, 9);
  t("...and dropping three of those items drops the count by exactly three (a delta, not an absolute)",
    readControl(enumerated(nine)).arms - readControl(enumerated(nine.slice(0, 6))).arms, 3);

  /* ---- (B) MAX, NEVER THE SUM. An arm usually carries both marks, and summing
     would credit it twice — `readControl`'s own "never the sum" rule one level
     down. Driven with three arms marked BOTH ways. */
  const both = "/* " + decl("three arms, marked both ways") + "\n"
    + ["a", "b", "c"].map((k) => item(k, `break ${k} -> ${k} fails`)).join("\n") + " */\n";
  t("an arm marked as BOTH an ordinal and a transition counts once, never twice",
    [countTransitions(readControl(both).text), countEnumerations(readControl(both).text), readControl(both).arms],
    [3, 3, 3]);

  /* ---- (C) THE INVERSION, AND IT IS THE ITEM. A declaration carrying no mark of
     either kind is UNCLASSIFIED — `null`, never `0`. This is the arm the item
     exists for: a style nobody has written yet must be NAMED, not scored zero. */
  const unmarked = "/* " + decl("the arms are stated and run in a sibling harness, and every restore is verified by content as well as by hash.") + " */\n";
  const unmarkedRead = readControl(unmarked);
  t("a declaration the matcher cannot read is FOUND, so the suite still counts as controlled",
    unmarkedRead != null, true);
  t("...and its arms read as UNCLASSIFIED (null), NOT as zero — the whole of D-233",
    [unmarkedRead.arms, unmarkedRead.arms === 0], [null, false]);

  /* A style genuinely not anticipated: arms marked with a leading bullet and a
     colon, no arrow and no ordinal anywhere. The matcher does not know it. The
     REQUIREMENT is not that it counts — it is that it does not lie about it. */
  const unanticipated = "/* " + decl("three arms, in a marking this instrument was never taught:") + "\n"
    + ["ARM ONE", "ARM TWO", "ARM THREE"].map((k) => `   * ${k}: break it, its own assertion fails`).join("\n") + " */\n";
  t("an arm style the matcher was never taught is UNCLASSIFIED rather than silently zero",
    [readControl(unanticipated) != null, readControl(unanticipated).arms], [true, null]);

  /* ---- (D) OVER-STRICTNESS. Prose that MENTIONS an arm, or reaches for a single
     bracketed letter mid-sentence, must NOT be counted as a list. A tally that
     over-counts is as useless as one that under-counts, and this one now carries
     a floor. */
  const mention = "/* " + decl("the arms are recorded in the block below; see (b) of that block for the one that matters, and note it fails at its own layer.") + " */\n";
  t("prose MENTIONING an arm is not a declaration of one — a lone bracketed letter is not a list",
    countEnumerations(readControl(mention).text), 0);
  const codey = "/* " + decl("replace the guard with `if (a) { return null; }` and the suite fails") + " */\n";
  t("...and a single parenthesised token quoted from CODE is not an enumeration either",
    countEnumerations(readControl(codey).text), 0);
  /* Stated rather than smoothed over: two bracketed single letters that ARE quoted
     code would be counted. The matcher is syntactic and says only what it means. */

  /* ---- (E) THE MARKER ITSELF. One character of punctuation hid the whole foot
     block of `case-opened.test.mjs`. A dash is not a different kind of
     declaration from a colon. Asserted as a delta against the same text with the
     phrase itself removed. */
  const dashed = "/* " + dashDecl("two arms") + "\n"
    + ["a", "b"].map((k) => item(k, `break ${k} -> ${k} fails`)).join("\n") + " */\n";
  t("a declaration whose marker is separated by a DASH is found, with its arms",
    [readControl(dashed) != null, readControl(dashed).arms], [true, 2]);
  t("...and the same text with the marker PHRASE removed reads as no control (the delta)",
    readControl(dashed.replaceAll(MARKER_PHRASE, "NEGATIVE-CTL(hidden)")), null);

  /* ---- (F) THE EXTENT. `bias.test.mjs` states thirteen arms in ARROW grammar,
     in enumerated paragraphs after the marker's own paragraph — every arrow
     legible, every one cut off by the paragraph rule. The list a marker opens
     belongs to it; unrelated prose still does not. BOTH directions, because one
     without the other is half an answer. */
  const acrossParagraphs = "/* Header.\n *\n * " + decl("the arms follow.")
    + "\n *\n * (1) break one -> one fails\n * (2) break two -> two fails\n *\n"
    + " * UNRELATED PARAGRAPH, not part of the control and not an arm of it.\n */\n";
  const across = readControl(acrossParagraphs);
  t("a declaration reaches the ENUMERATED paragraph that follows it (the bias.test.mjs shape)",
    [across.arms, across.text.includes("break two")], [2, true]);
  t("...and still stops before unrelated prose, which is not marked as a list item",
    across.text.includes("UNRELATED PARAGRAPH"), false);

  /* ---- (G) REACH, ON THE REAL CORPUS, AS A DELTA WITH THE CORPUS SIZE PRINTED.
     Narrowing or widening a matcher must not silently change what it can see.
     The control: strip every mark of both kinds from the real sources and the
     tally must COLLAPSE — a matcher that scores the same over marked and
     unmarked text is reading neither. */
  const corpus = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs"))
    .map((f) => ({ f, src: readFileSync(join(DIR, f), "utf8") }));
  const tally = (rows) => rows.reduce((acc, r) => {
    const c = readControl(r.src);
    if (!c) return acc;
    if (typeof c.arms === "number") { acc.arms += c.arms; acc.classified.push(r.f); }
    else acc.unclassified.push(r.f);
    return acc;
  }, { arms: 0, classified: [], unclassified: [] });

  const real = tally(corpus);
  const stripMarks = (s) => s.replace(/\s(?:->|→)\s/g, " then ")
                             .replace(/(^|\s)\((\d{1,2}[a-z]{0,2}|[a-z]{1,2}|[ivx]{1,4})\)(?=\s)/g, "$1item");
  const blinded = tally(corpus.map((r) => ({ f: r.f, src: stripMarks(r.src) })));

  t(`the register REACHES the whole battery — ${corpus.length} suite(s) read, ${real.classified.length} classified, ${real.unclassified.length} unclassified`,
    corpus.length >= 90 && real.classified.length >= 90, true);
  t(`stripping every arm mark from those ${corpus.length} sources collapses the tally (${real.arms} -> ${blinded.arms} arms, ${real.classified.length} -> ${blinded.classified.length} classified), so the count is a MEASUREMENT of the corpus`,
    [real.arms - blinded.arms > 0, blinded.classified.length < real.classified.length], [true, true]);
  t(`...and the declarations that lost their marks read as UNCLASSIFIED rather than as ZERO ARMS (${real.unclassified.length} -> ${blinded.unclassified.length}), which is the direction D-233 was wrong in — and the SAME declarations are still found either way (${real.classified.length + real.unclassified.length} both times)`,
    [blinded.unclassified.length > real.unclassified.length,
     blinded.classified.length + blinded.unclassified.length === real.classified.length + real.unclassified.length],
    [true, true]);

  /* The corpus must actually EXERCISE the arrowless style, or the fix is in the
     code and nothing in the tree proves it works — how the M0-9 workaround got in. */
  const arrowless = corpus.filter((r) => {
    const c = readControl(r.src);
    return c && typeof c.arms === "number" && countTransitions(c.text) === 0 && countEnumerations(c.text) > 0;
  }).map((r) => r.f);
  t(`the tree itself declares at least one ARROWLESS enumerated control, so the new marking is exercised by the corpus and not only by fixtures (${JSON.stringify(arrowless)})`,
    arrowless.length > 0, true);

  /* And the corpus must exercise the UNCLASSIFIED path too, for the same reason:
     an instrument whose "I cannot read this" branch never runs on real data has
     not been shown to have one. */
  t(`the register NAMES what it could not classify on the real corpus (${JSON.stringify(real.unclassified)}) rather than folding it in as zero`,
    real.unclassified.length > 0 && real.unclassified.every((f) => readControl(corpus.find((r) => r.f === f).src).arms === null), true);

  /* countArms is the exported leaf, and it must never answer 0. */
  t("countArms answers null for unmarked text and a number for marked text — never 0",
    [countArms("nothing marked here at all"), countArms("break x -> y fails")], [null, 1]);
}

/* ===========================================================================
   M0-16 / D-238 — THIS FILE'S OWN WALKS DISCOVER OVER A DIRECTORY IT DOES NOT
   CONTROL, AND UNTIL NOW REPORTED NUMBERS FROM IT IN SILENCE.

   THREE WALKS, all of them `readdirSync(DIR)` over `bio-plane/test/`: the suite
   scan at the head of this file (which decides who is held to the dispose, exit,
   sandbox and containment rules), the M0-9 register scan, and the M0-14 arm
   matcher's REAL-CORPUS scan. Every one of them prints a count that a reader
   quotes — `${N} suites`, `${N} arms across ${N} classified` — and two of them
   carry assertions with a hard floor (`>= 90`).

   WHY THAT MATTERS HERE SPECIFICALLY. `git stash` is REPOSITORY-WIDE across all
   sixty worktrees of this repository and `push -u` carries UNTRACKED files, so a
   `pop` deposits another worker's `.test.mjs` into this directory. It has
   HAPPENED: `machinefences-dec49.test.mjs`, 57 assertions, counted into a
   worker's baseline, in no commit, gone by the next run (D-238). A phantom in
   this directory inflates all three of these walks at once, and the inflated
   register figure is the one somebody moves `REGISTER_FLOOR` to — permanently
   too high, failing every honest run afterwards, until the gate is switched off.

   WHAT THIS BLOCK DOES, AND WHAT IT DELIBERATELY DOES NOT. It NAMES anything the
   walks counted that is in no commit, and prints the reproducible corpus beside
   the contaminated one. It does NOT fail on one: a worker writes a suite and runs
   the battery before committing it dozens of times an hour, and redding the whole
   estate for that would be worse than the condition it reports (M0-15's
   provisional, kept). THE RESIDUAL IS THEREFORE REAL AND IS STATED: a run holding
   a phantom is still green, and only this report says so.

   THE ASSERTIONS ARE ABOUT REACH, NOT ABOUT CLEANLINESS, and that is the whole
   design. A provenance check narrowed to nothing reports a spotless corpus of
   zero and passes — the failure this project keeps meeting, most recently in
   M0-15's OWN control harness, whose restore check used a BSD-absent `xargs`
   flag, compared two EMPTY files and reported them byte-identical (the sha256 of
   the empty string). So the corpus is PRINTED, guarded by a minimum count, and
   asserted to be exactly what the three walks read.
   =========================================================================== */
console.log("\n--- what these walks counted, and whether any of it is in no commit (M0-16) ---");
{
  const REPO = join(DIR, "..", "..");
  const prov = readGitProvenance(REPO);

  /* The UNION of the three walks, each re-read the way that walk reads it, so
     this block cannot drift from the walks it reports on. Walk 1 excludes this
     file; walks 2 and 3 include it. The union is what the file as a whole
     counted. */
  const walk1 = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs") && f !== "hygiene.test.mjs");
  const walk2 = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs"));
  const walk3 = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs"));
  const union = [...new Set([...walk1, ...walk2, ...walk3])].sort();

  /* AND THE OTHER TWO DIRECTORIES THIS FILE DISCOVERS OVER. The three walks above
     are the ones D-238 named, but this suite also walks `src/` and `checks/` —
     five more times, for the REC-46 predicate sweep, the REC-48/REC-51 grade-letter
     sweep and the flat-directory reach arms — and reports counts and findings from
     both. A `stash pop` deposits an untracked `src/*.mjs` exactly as readily as an
     untracked suite, and a planted module would be swept, counted, and reported as
     though it were the plane's. Same class, same directory-it-does-not-control,
     same report. */
  const srcRoots = ["src", "checks"];
  const srcFiles = srcRoots.flatMap((r) => readdirSync(join(DIR, "..", r))
    .filter((n) => n.endsWith(".mjs")).sort().map((n) => `${r}/${n}`));

  const items = [
    ...union.map((f) => ({
      path: repoPath(REPO, join(DIR, f)),
      what: f,
      counted: [walk1.includes(f) && "the suite-rule scan", walk2.includes(f) && "the register scan",
        walk3.includes(f) && "the arm matcher's corpus"].filter(Boolean).join(" + "),
    })),
    ...srcFiles.map((f) => ({
      path: repoPath(REPO, join(DIR, "..", f)),
      what: f,
      counted: "swept by the machine-identity and grade-letter source sweeps",
    })),
  ];

  const c = reportProvenance({
    prov, items, instrument: "this suite's corpus walks",
    corpus: `test/: walk 1 read ${walk1.length}, walk 2 read ${walk2.length}, walk 3 read ${walk3.length}`
      + ` — ${union.length} distinct suite(s) · src/ + checks/: ${srcFiles.length} module(s)`,
    totals: prov.inHead === null ? [] : [{ label: "files read by these walks",
      contaminated: items.length,
      reproducible: items.filter((i) => prov.inHead.has(i.path)).length, source: "files" }],
  });

  /* (1) THE REACH ARM. The corpus is printed above and pinned here. A provenance
     walk that stopped reading would report a clean tree over nothing at all and
     pass every other assertion in this block, so this is the one that has to bite
     first. `>= 90` is the same floor the two walks it reports on already carry. */
  t(`the provenance check accounted for every file these walks read (${c.accounted} of ${items.length}: ${union.length} suite(s) floor 90, ${srcFiles.length} module(s) floor 24)`,
    [c.accounted === items.length, union.length >= 90, srcFiles.length >= 24], [true, true, true]);

  /* (2) IT ANSWERED, OR IT SAID IT COULD NOT. Never a third, silent state. A
     check that reports "all good" when it could not look is D-233 exactly, and
     `verified` is a boolean here precisely so the two are told apart. */
  t("the walks state their provenance as VERIFIED or UNVERIFIED, never as a bare number",
    typeof c.verified === "boolean", true);

  /* (3) `ls-tree HEAD`, NOT `git status` — asserted through the instrument rather
     than read off its source, because an IGNORED file is invisible to
     `git status` and `.claude/worktrees/` is ignored in this repository, which is
     exactly how the original phantom stayed invisible. A path this tree does not
     have must come back UNTRACKED and must NOT come back "in the commit". */
  const invented = repoPath(REPO, join(DIR, "no-such-suite-m016.test.mjs"));
  t("a file that is in no commit is named UNTRACKED, from the COMMIT and not from `git status`",
    prov.inHead === null ? "UNVERIFIED" : stateOf(prov, invented),
    prov.inHead === null ? "UNVERIFIED" : "UNTRACKED");

  /* (4) OVER-STRICTNESS. On a clean tree the report must say nothing at all
     beyond its one summary line. An instrument that cries phantom on honest work
     gets ignored, which is the same end as one that never fires. */
  if (prov.inHead !== null)
    t(`every file these walks counted is in the commit at HEAD, or is NAMED above (${c.off.length} named)`,
      c.off.every((r) => r.state !== "in the commit"), true);

  /* (5) THE PRINTING ITSELF, DRIVEN — and this arm exists because the control
     found the other four blind to exactly the failure they were written for.
     Neutering `reportProvenance`'s naming branch moved `coverage-provenance`
     23 -> 14 and `battery-provenance` 28 -> 17, and left THIS suite at 531 pass,
     because arms (1)-(4) all read `classifyDiscovered`'s return and none of them
     read a printed WORD. On a clean tree the naming branch never runs, so it can
     go dark here in silence. So the printer is driven over a SYNTHETIC item that
     is certainly in no commit, into a captured sink, and the output is asserted to
     NAME it — a delta that costs nothing when the tree is honest and bites the
     moment the report stops reporting. A surprising green is a finding about the
     arm, not a pass. */
  const sink = [];
  const ghost = repoPath(REPO, join(DIR, "no-such-suite-m016.test.mjs"));
  reportProvenance({
    prov, items: [{ path: ghost, what: "a synthetic item", counted: "nothing — it does not exist" }],
    instrument: "the arm (5) probe", corpus: "1 synthetic item",
    totals: [{ label: "synthetic units", contaminated: 1, reproducible: 0, source: "nothing" }],
    log: (s) => sink.push(s),
  });
  const printed = sink.join("\n");
  t("(5) the report NAMES an item that is in no commit, rather than only classifying it",
    prov.inHead === null
      ? [/UNVERIFIED/.test(printed), true]
      : [printed.includes(ghost), /NOT IN ANY COMMIT/.test(printed)],
    [true, true]);
  t("(5) ...and states the reproducible total beside the contaminated one",
    prov.inHead === null ? true : /1 synthetic units were counted above; 0 of them come from nothing/.test(printed),
    true);

  /* ---- THE CLASS CENSUS, AND IT IS A RATCHET RATHER THAN A VERDICT ----------
   *
   * D-238's brief asked what ELSE in this repository walks a directory it does
   * not control and reports a number from it. The answer is: a great deal more
   * than the seven walks the item named, and guarding each one individually
   * would put twenty copies of one rule in the tree — the failure this item's
   * own fix exists to avoid. So the class is made VISIBLE and RATCHETED instead:
   * every `readdirSync` site in the estate is counted, the GUARDED ones are the
   * files that ask `provenance.mjs`, and every remaining one is on a NAMED list
   * with what it walks and what it reports. A NEW unguarded walk fails here by
   * name, which is the outcome worth having — the same shape M0-14 landed for
   * the register's unclassified declarations and CPDF-9 for the dark member.
   *
   * WHAT THIS MATCHER CAN SEE: a discovery primitive — `readdirSync(`,
   * `readdir(`, `opendirSync(`, `opendir(` or `globSync(` — in the CODE of a
   * tracked `.mjs` under `bio-plane/` or `civicos-ui/`.
   *
   * WIDENED AND MADE COMMENT-BLIND 2026-08-09 BY M0-18, AND BOTH HALVES WERE
   * MEASURED RATHER THAN TIDIED.
   *
   *   - COMMENT-BLIND, and it was THIS BLOCK'S OWN RECEIPT that forced it. M0-18
   *     wrote a sentence in `test/op-claims.test.mjs` explaining that this census
   *     grades a file by whether it contains a `readdirSync(` — and the census
   *     enumerated that file as a NEW UNGUARDED WALK, on the strength of the word
   *     inside the sentence describing the matcher. That is WORKER.md's named
   *     failure, *a check that caught its own correction because the correction
   *     quoted the token it was correcting*, arriving inside the check. The
   *     GUARDED half of this matcher was already corrected for the same reason
   *     (see the note at `guarded:` below, where a header mentioning
   *     `provenance.mjs` in prose read as an import); the WALK half was left
   *     un-corrected and this is that correction.
   *   - WIDENED from the single literal `readdirSync(`, because a classifier
   *     grading ONE spelling is what hid 27 ops from a sweep that read as
   *     complete. It found one file immediately: `test/query-reach.report.mjs`
   *     uses `fs/promises`' `readdir`, walks the `.query-reach-cov/` directory it
   *     creates itself, and had been invisible to every run of this census.
   *
   * WHAT IT STILL CANNOT SEE, stated because a matcher that hides its blind spots
   * is read as though it had none: a third-party glob library, a walk in a shell
   * script or in another language, a walk reached through an aliased or
   * destructured binding these regexes do not spell, and anything outside those
   * two directories (`newgroup/`, `tools/`, `agent-worker/`, `pdf-worker/`).
   * **AND THE ONE THAT MATTERED MOST, because M0-18 was bitten by it: this census
   * grades the file the WALK is in, and a walk's FLOOR can live in a DIFFERENT
   * FILE.** `scripts/op-claims.mjs` walks and `test/op-claims.test.mjs` floors on
   * what it found; the census named the first as merely "reports a claim census"
   * and never enumerated the second at all. A file that imports a corpus from a
   * walking module and floors on it is in this class and is invisible here.
   *
   * It also cannot tell a walk of a TEMP directory from a walk of a repository
   * directory — so the named list carries that judgement, made by reading each
   * site, and the list is what goes stale if somebody is wrong.
   *
   * NARROWED UNKNOWNS, measured 2026-08-09 by M0-18 so the blind spots above are
   * not read as unexplored: `tools/` was hand-read and holds no member of the
   * class (`mintid.mjs` walks its own id ledger under `.git/` and floors on
   * nothing from it; `plancheck.mjs` imports `readdirSync` and never calls it,
   * which M0-16 already measured). `newgroup/src/index.mjs` performs no directory
   * walk at all. Neither root is added to the census, because adding a root whose
   * every member is a non-instance buys a longer list and no enforcement.
   */
  /* Comment-blind, and blind in BOTH directions: the token must be CODE. The
     same reader `test/bounds.test.mjs` uses on the same problem, kept small
     because it only has to blank spans rather than preserve them. */
  const codeOnly = (text) => text
    .replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (s, p) => p + s.slice(p.length).replace(/[^\n]/g, " "));
  const DISCOVERY = /\b(?:readdirSync|readdir|opendirSync|opendir|globSync)\s*\(/g;
  const CENSUS_ROOTS = [["bio-plane", ["scripts", "test", "src", "checks", "migrate"]],
                        ["civicos-ui", [".", "test"]]];
  const census = [];
  for (const [top, subs] of CENSUS_ROOTS) {
    for (const sub of subs) {
      const d = join(REPO, top, sub);
      let names = [];
      try { names = readdirSync(d).filter((n) => n.endsWith(".mjs")); } catch { continue; }
      for (const n of names) {
        const rel = repoPath(REPO, join(d, n));
        let src = "";
        try { src = readFileSync(join(d, n), "utf8"); } catch { continue; }
        const walks = (codeOnly(src).match(DISCOVERY) || []).length;
        if (!walks) continue;
        /* GUARDED means it IMPORTS the check, and the import is what is matched.
           Written first as a bare mention of `scripts/provenance.mjs` anywhere in
           the file, which read `battery.mjs` as guarded because its HEADER names
           the module in prose and read `coverage.mjs` as unguarded because its
           import spells the path relatively — a detector grading a file by a word
           in its comments, which is the exact shape REC-70 and REC-64 have each
           been an item about. Corrected to the import statement, and the arms
           below are what caught it. */
        census.push({ file: rel, walks,
          guarded: /^\s*import\s[^\n]*["'][^"'\n]*provenance\.mjs["']/m.test(src) });
      }
    }
  }
  const guarded = census.filter((r) => r.guarded);
  const unguarded = census.filter((r) => !r.guarded).map((r) => r.file).sort();

  /* Each of these walks a directory another worker can deposit into and reports
     a number, a list or a floor from it. NAMED, not fixed: the number each one
     reports is a finding about the plane's own source or docs rather than a
     baseline anybody quotes into a floor, so the D-238 payload — a permanently
     too-high ratchet — does not reach them. A new entry here is a decision
     somebody has to make, which is the point. */
  const CLASS_NAMED_UNGUARDED = [
    "bio-plane/migrate/migrate.mjs",              // an OPERATOR-supplied fixture tree, not a repository directory
    "bio-plane/test/publishedcase.test.mjs",      // src/, reports emitted rendering modules
    /* D-257 CLOSED 2026-08-09, AND IT TOOK SEVEN ENTRIES OUT OF THIS LIST RATHER THAN ONE.
       The row routed `civicos-ui/test/version-predecessor.test.mjs`; the sweep asked of every
       entry here whether it FLOORS on what its walk found, because naming is defensible for a
       walk that only REPORTS and much weaker for one whose count feeds a ratchet. SEVEN
       civicos-ui walks floored, including the sibling this list justified the routed one by,
       and `check-refusal-codes.mjs` — whose `FLOOR` table is MOVED BY HAND to figures a green
       run printed, which is D-238's payload exactly. All seven now ask `provenance.mjs` and
       are GUARDED above; `civicos-ui/test/run.mjs`, the runner CLAIMS.md delegated, is guarded
       too. The measurements and what the sweep could not see are in the D-257 row. */
    /* MEASURED BY D-257'S SWEEP AND KEPT: it walks `civicos-ui/test/` and PRINTS a suite
       count, but nothing it prints is compared against a number — there is no floor here to
       raise, so the D-238 payload cannot reach it. WHAT IT DOES DO, named because it is a
       DIFFERENT exposure rather than a smaller one: it EXECUTES every suite it discovers,
       so a phantom deposited in that directory is RUN. That is the runner's exposure
       (`civicos-ui/test/run.mjs`, now guarded), and closing it here means failing on an
       uncommitted suite — a decision about how workers work rather than about this
       instrument, and the same residual M0-15 stated and kept. */
    "civicos-ui/check-mock-envelope.mjs",         // civicos-ui/test/, runs and counts suites, floors on none
    /* ADDED AT INTEGRATION 2026-08-08 by CONDUCT, AND THE RATCHET CAUGHT IT ON THE DAY IT
       LANDED — which is the whole reason M0-16 made this a census rather than a fix.
       M-4's measurement probe arrived in the SAME integration as M0-16's census, so
       neither worker could see the other: M0-16 enumerated 21 walks correctly on its own
       tree and M-4 added a 22nd. A NEW WALK IS A DECISION, NOT A SILENCE, and this is what
       that rule buys — the walk is named here rather than discovered later by someone
       wondering why a number moved.
       WHY IT IS NAMED AND NOT GUARDED: it walks `test/fixtures/` for ONE named PDF and
       reports no repository census. Nothing it prints is a figure a session quotes, so a
       phantom deposited beside it cannot inflate a baseline — which is the exposure the
       guarded walks carry and this one does not. */
    "bio-plane/test/ref-variance-probe.mjs",      // bio-plane/test/fixtures/, one named PDF, no census
    /* MEASURED BY D-257'S SWEEP AND KEPT, WHICH IS A DIFFERENT CLAIM FROM THE ONE THAT WAS
       HERE. This suite's walk feeds an assertion that the fixture directory holds NO residue
       — a CEILING AT ZERO — so an untracked file deposited beside it makes this suite go RED
       rather than quietly green. Provenance would tell it something true and useless, and the
       exposure the guarded walks carry (a phantom raising a figure somebody quotes into a
       floor) is absent because there is no floor here to raise. */
    "civicos-ui/test/refusal-codes.test.mjs",     // civicos-ui/test/, asserts NO fixture residue (a ceiling at zero)
    /* ADDED 2026-08-08 by D-243's item, AND THE RATCHET WORKED A THIRD TIME — the
       census named this walk on the first full battery, before anyone read the diff.
       WHY IT IS NAMED AND NOT GUARDED: it walks a `mkdtemp` SANDBOX THIS SUITE ITSELF
       CREATED, to assert that the D-242 exclusivity probe leaves no file behind — a
       probe that littered the ledger would be counted as a held id. It is not a
       repository directory at all, no other worker can deposit into it, it reports no
       census and nothing it prints is a figure anybody quotes. Provenance would tell
       it something true and useless, which is the same reason `ref-variance-probe.mjs`
       is named rather than guarded. */
    "bio-plane/test/mintid.test.mjs",             // its own mkdtemp sandbox, asserting the probe left nothing behind
    /* ADDED 2026-08-08 by D-237, AND THE RATCHET WORKED AGAIN — this walk was
       named by the census on its first full battery, before anyone read the diff.
       WHY IT IS NAMED AND NOT GUARDED, and this one is a CATEGORY difference
       rather than a judgement about exposure: `scripts/residue.mjs` walks the
       machine's SHARED TEMP ROOTS, which are not a repository directory and are
       in no commit BY CONSTRUCTION. `git ls-tree HEAD` would answer UNTRACKED
       for every single entry it finds, correctly and uselessly, and a report in
       which every row is flagged is a report with no signal in it. The exposure
       provenance defends against — a phantom inflating a number a session quotes
       into a floor — does not exist here: nothing this module prints is a
       baseline, and it is REPORT-ONLY by design (it cannot fail a run). Its own
       attribution discipline is stated in its header and driven by
       `test/battery-residue.test.mjs`. */
    "bio-plane/scripts/residue.mjs",              // the machine's shared TEMP roots, which are in no commit by construction
    /* FOUND 2026-08-09 BY M0-18'S WIDENING OF THIS MATCHER, and it had been
       invisible to every previous run because it walks with `fs/promises`'
       `readdir` rather than `readdirSync`. WHY IT IS NAMED AND NOT GUARDED: it
       walks `.query-reach-cov/`, a coverage directory IT CREATES ITSELF, reports
       no repository census, and exits 2 when it finds nothing rather than
       reporting clean over an empty corpus. No other worker can deposit into it
       and nothing it prints is a figure anybody quotes into a floor. */
    "bio-plane/test/query-reach.report.mjs",      // its own .query-reach-cov/, a coverage report, no census
    /* ADDED 2026-08-09 by D-249's item, AND THE RATCHET WORKED A FIFTH TIME — the
       census named this walk on the first full battery this worktree ran, before
       anyone read the diff, and it was the ONLY thing standing between a green
       battery and a red one. WHY IT IS NAMED AND NOT GUARDED: its `census` arm
       walks `bio-plane/test/` to count `new Miniflare(` constructions, and that
       count is printed as CONTEXT for a runtime measurement rather than as a
       floor — no assertion anywhere reads it, and the probe cannot fail a run
       because the battery does not discover it. A phantom `.test.mjs` deposited
       by a concurrent worktree would move the printed number and mislead nobody,
       because the number that carries this item's conclusion came from `lsof`
       and `netstat`, not from the directory. Guarding it would be true and
       useless, which is `ref-variance-probe.mjs`'s reason exactly. */
    "bio-plane/test/d249-port.probe.mjs",         // its own test/ census, printed as context, read by no assertion
  ];
  const newlyUnguarded = unguarded.filter((f) => !CLASS_NAMED_UNGUARDED.includes(f));
  const goneFromList = CLASS_NAMED_UNGUARDED.filter((f) => !unguarded.includes(f) && !guarded.some((g) => g.file === f));

  /* M0-18 measured the matcher change rather than asserting it: over this tree the
     widening ADDED `test/query-reach.report.mjs` (an `fs/promises` `readdir` that
     no run of this census had ever seen) and the comment-blinding DROPPED
     `test/op-claims.test.mjs` (matched only by a sentence describing this matcher).
     27 before, 27 after, and neither file is the one it was. */
  console.log(`  class census: ${census.length} file(s) in the estate walk a directory with a discovery`
    + ` primitive in CODE (readdirSync / readdir / opendirSync / opendir / globSync) ·`
    + ` ${guarded.length} GUARDED by scripts/provenance.mjs (${guarded.map((r) => r.file).join(", ")})`
    + ` · ${unguarded.length} named and not guarded`);
  t(`the census REACHES the estate rather than a corner of it (${census.length} walking file(s), floor 15)`,
    census.length >= 15, true);
  t(`every walk of this class is GUARDED or NAMED — a new one is a decision, not a silence (${JSON.stringify(newlyUnguarded)})`,
    newlyUnguarded, []);
  t(`and the named list has not gone stale — every entry still exists and still walks (${JSON.stringify(goneFromList)})`,
    goneFromList, []);

  /* ---- THE CROSS-FILE HALF, AND IT IS THE DETECTOR RATHER THAN AN INSTANCE ----
   *
   * M0-21 / D-268. EVERYTHING ABOVE GRADES A FILE BY WHETHER THAT FILE CONTAINS A
   * `readdirSync(`. So when the WALK and the FLOOR live in different files, the
   * census names the walking file and never enumerates the file carrying the
   * floors behind it. The measured instance is `scripts/op-claims.mjs` (walks,
   * NAMED above with the words "reports a claim census") and
   * `test/op-claims.test.mjs`, which contains NO `readdirSync` at all, appears in
   * no census row, and carries FIVE floors over what that walk found.
   *
   * WHY THIS IS A DIFFERENT KIND OF WORK FROM ADDING A ROW ABOVE. Guarding an
   * instance protects one floor; closing the detector protects every future one.
   * `scripts/walkfloor.mjs` asks the question the census could not: does a value
   * produced by a WALK reach a COMPARISON, across a module boundary. Its header
   * states in full what it can and cannot see; the short version is that it grades
   * at BINDING granularity rather than file granularity, because the benign shape
   * that kills a file-granularity detector is live one line away from the real one
   * — `LEDGER.length >= 20` in the very same suite, imported from the very same
   * walking module, and NOT walk-derived at all.
   *
   * A CHECK THAT CRIES WOLF GETS SWITCHED OFF. That is `VERIFICATION.md`'s own
   * stated reason for not making `--strict` the gate yet, so the arms below assert
   * the FALSE-POSITIVE direction as hard as the true-positive one. */
  const wf = sweepWalkFloors({ repo: REPO });
  const wfUnguarded = wf.sites.filter((s) => !s.guarded);

  /* NAMED, exactly as above: a cross-file floor that somebody has read and decided
     about. A NEW one fails by name, which is the outcome worth having. The entry
     is the file, because the five sites in it are one decision and not five. */
  const CROSS_FILE_NAMED = [
    /* THE MEASURED INSTANCE D-268 WAS RAISED FOR, AND IT IS NAMED HERE RATHER THAN
       GUARDED FOR A BOUNDARY REASON THAT IS WORTH STATING PLAINLY.
       `test/op-claims.test.mjs` floors FIVE times on `scripts/op-claims.mjs`'s
       whole-repository `corpus()`: `files >= 300`, `chars >= 10_000_000`,
       `mentions >= 5000`, `names.length >= 150` (all four found by this detector on
       its first real run) and `attributions.length >= 4` (a FIFTH that no census
       row, and no brief, had ever named — it is what the detector bought).
       By D-257's own ruling these should be GUARDED, not named: naming is
       defensible for a walk that only REPORTS and much weaker for one whose count
       feeds a ratchet, and all five feed ratchets. The guard is D-257's two-line
       pattern — keep the sweep over the working tree so a finding in uncommitted
       work is not hidden, and compute the FLOOR over `git ls-tree HEAD` alone.
       IT IS NOT DONE HERE because this item's claim does not name that suite and a
       sibling item was briefed to guard exactly these instances; doing it twice in
       two worktrees is a merge conflict in a file neither of us owns. THE POINT OF
       THE ENTRY IS THAT THE DECISION IS VISIBLE INSTEAD OF SILENT — which is the
       whole difference between this list and the blindness it replaces. */
    "bio-plane/test/op-claims.test.mjs",
  ];
  const wfNewly = wfUnguarded.map((s) => s.file)
    .filter((f, i, a) => a.indexOf(f) === i && !CROSS_FILE_NAMED.includes(f)).sort();
  const wfStale = CROSS_FILE_NAMED.filter((f) => !wfUnguarded.some((s) => s.file === f));

  console.log(`  cross-file walk->floor: ${wf.corpus.length} module(s) read · ${wf.walkModules.length} walk module(s) ·`
    + ` ${wf.sites.length} floor(s) whose value crosses a module boundary`
    + ` (${wf.sites.filter((s) => s.guarded).length} GUARDED, ${wfUnguarded.length} named)`
    + ` · ${wf.ceilings.length} ceiling-at-zero · ${wf.unknowns.length} UNCLASSIFIED · provenance ${wf.provenance}`);
  for (const s of wf.sites) console.log(`    ${s.guarded ? "GUARDED " : "NAMED   "}${s.file}:${s.line}  ${s.expr}   <- ${s.from.join(", ")} [${s.state}]`);
  /* PRINTED, NEVER SILENTLY SCORED ZERO. A comparison this matcher does not
     understand is a thing it must NAME — that is WORKER.md's rule and it is the
     difference between a narrowed unknown and a false clean. */
  for (const u of wf.unknowns) console.log(`    UNCLASSIFIED ${u.file}:${u.line}  ${u.expr}  — ${u.why}`);

  /* (1) REACH. A detector that reads nothing passes every absolute assertion, and
     three walks in this repository reported a spotless verdict over an empty
     corpus in one week. The corpus is PRINTED above and floored here. */
  t(`the cross-file detector REACHES the estate rather than a corner of it (${wf.corpus.length} module(s), floor 200)`,
    wf.corpus.length >= 200, true);
  t(`and it resolved a non-trivial set of WALK modules to flow from (${wf.walkModules.length}, floor 8)`,
    wf.walkModules.length >= 8, true);

  /* (2) THE TRUE POSITIVE, PINNED AS A DELTA RATHER THAN A COUNT. The real
     `op-claims` split must be FOUND. This is the arm that fails if the detector
     ever stops seeing across a module boundary — which BOTH of its own first-draft
     bugs did, each while reporting a clean estate. */
  const opClaimsFloors = wf.sites.filter((s) => s.file === "bio-plane/test/op-claims.test.mjs");
  t(`the REAL cross-file split is found: op-claims.test.mjs floors on op-claims.mjs's walk (${opClaimsFloors.length} site(s), floor 4)`,
    [opClaimsFloors.length >= 4,
     opClaimsFloors.every((s) => s.from.includes("bio-plane/scripts/op-claims.mjs"))],
    [true, true]);

  /* (3) THE FALSE-POSITIVE DIRECTION, ASSERTED OVER A REAL LINE AND NOT A FIXTURE.
     `LEDGER` is a STATIC exported array imported FROM THE SAME WALKING MODULE by
     THE SAME SUITE, and `LEDGER.length >= 20` is a floor on it. It is not
     walk-derived, no phantom in any directory can move it, and a detector that
     reports it is a detector somebody switches off. */
  t("a floor on a STATIC export of a walking module is NOT reported (the `LEDGER.length >= 20` shape)",
    wf.sites.some((s) => /LEDGER/.test(s.expr)), false);

  /* (4) GUARDED OR NAMED — the ratchet. A new cross-file floor is a DECISION, not
     a silence, exactly as a new walk is above. */
  t(`every cross-file walk-derived floor is GUARDED or NAMED (${JSON.stringify(wfNewly)})`,
    wfNewly, []);
  t(`and the cross-file named list has not gone stale (${JSON.stringify(wfStale)})`,
    wfStale, []);

  /* (5) THE DETECTOR APPLIED TO ITSELF, which is the cheapest evidence available
     that it reaches real code rather than only its own fixtures: THIS SUITE floors
     on `walkfloor.mjs`'s walk, one import away, and must therefore appear in its
     own output — as GUARDED, because this file asks `provenance.mjs`. */
  t("the detector finds THIS suite's own cross-file floors on it, and reads them as GUARDED",
    wf.sites.some((s) => s.file === "bio-plane/test/hygiene.test.mjs" && s.guarded), true);
}

console.log(`\nhygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
