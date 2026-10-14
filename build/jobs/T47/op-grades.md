# op-grades (T47)

**Status** · session_01JUGvXiy9wCt6uvuqTS5HEj · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Five readings of R36/R37 where the text meets another requirement or the owner's code. I am building on each best reading now; only (1) and (2) change a grade or a row.

(1) `passwordresetlink`: R37 grades it `reasoned`, but credentials R69 (and `passwordResetLinkMake({member, by})` as merged) asks no reason, so no code in JUSTIFICATION_REFUSALS backs it and affordances R19's drive would fail. Best reading: `RUNG_ABSENT`, ground `credential` (who may sign in), as `recover` and `passwordreset`; phone false by R18. If `reasoned` is meant, credentials must first ask a reason with its own code (not mine).

(2) `sever`, `reinstate` (R36): they are affordances `ACTS` rows, so they carry no `NON_ACTS` row (an op is an act or a non-act, never both; affordances R1, R12). Best reading: their rung stays `reasoned` and the sentence beside the rung (its backing note) names a question's own legs beside a project's `cites` (citation R15); no `NON_ACTS` row is added.

(3) `publish` (R37, K3100 doubt 9 as ruled: `terminal`): `publishcheck`, graded "as publish" (K2883 (2)), follows it to `terminal`; both leave `IRREVERSIBLE_WEIGHT` (derived from RUNGS, R21), which keeps `publishat`, `publishatmove`, `personexpunge`, `standardrelease`; `MACHINE_REFUSALS.publish` stays; no `CONSEQUENCE_STATEMENTS` entry (the dialog's words are the shell's `act.publish.does`, interface-shell R11); `phoneOf` answers false by R18 for a terminal rung (advisory; the shell sends a terminal act at phone width by its own R11). R1's "irreversible publish" and R14's "as publish" are read as R37 amends them: R14's two keep `irreversible` on their own weight.

(4) Public or session-own ops (`grouplanguages`, `passwordresetlook`, `passwordreset`, `signintrace`, `unlock`, `reauth`) each get a `NON_ACTS` row, and op-declarations gives each a present `null` NEEDS row (K516's precedent, as `recover` and `credit`).

(5) `unlock`, `reauth` at R37's `credential` ground answer `phoneOf` false by R18 (advisory only; nothing refuses by device).

## J2 · REPORT

Users' tests my merge turns red, each closed by that user's own T47 job (all others unchanged against an unmodified tranche/T47 run side by side: affordances 10 → 12, control-plane 7 → 8, plane 5 → 6; op-declarations 12, membership 6, interface-shell 0, screens-daily 0, screens-settings 0, screens-inquiry 1, wizard-scripts 0, each as before):

(1) affordances (T47-49) `backing.test.mjs`-family 'R19: `terminal` is given only while STATES.information.edges.retired is empty … and `irreversible` only to publish, … publishat and publishatmove, and case-check's publishcheck': R37 moves `publish` and `publishcheck` to `terminal` (K3100 doubt 9, K3144 (3)); its pin of the terminal and irreversible sets needs re-pinning.
(2) affordances (T47-49) 'R19: together the two drives reach every op RUNGS grades `reasoned`': `projectbarset` (R36, PROJECT_BAR_NO_REASON, strength R40) is reasoned and not yet driven.
(3) control-plane `totality.test.mjs` 'R2, R41 … unaccounted over the door's op table': stale only T47's sixteen ops (drawquestion, grouplanguages, grouplanguagesset, grouplogoset, monitorset, passwordreset, passwordresetlink, passwordresetlook, peopledirectory, projectbarset, projectlist, projectquestions, reauth, signintrace, signrequest, unlock) until op-declarations declares them (T47-53: R55, R57, R59, R61, each with a NEEDS row, a present null for the public and session-own ones, K3144 (4)); this also clears affordances' K3112 R12 red with op-declarations.
(4) plane (T47-66) `wizards.test.mjs` 'R19 (T34 …) … the irreversible acts': it asserts `publish` is among RUNGS' irreversible acts; since R37 they are publishat and publishatmove.

Requirement wording (BOB's): op-grades R1 ("irreversible publish"), R14 ("as publish") and R21 (IRREVERSIBLE_WEIGHT "(`publish`, `publishat`, `publishatmove`; R1, R14)") still name publish as irreversible; read as R37 amends them (K3144 (3)), worth re-wording at the next fold. R36's "their NON_ACTS sentences" for sever/reinstate is read as their backing note (K3144 (2)).

## J3 · COMPLETE

T47-48 done on job/T47/op-grades (tranche/T47 merged after B2).

Read whole: the requirements (public and private), layer 11's contract, every file of src/op-grades/ and test/m/op-grades/, the plan entry, the L11 fold's §B and doubts, DEC-207/DEC-208, and the owners' requirements for each op graded (credentials R65–R71, instance-setup R84–R85, tasks R19, control-plane R85–R87, people R37, citation R4/R14/R15, strength R40, monitoring R74, capture-requests R56, case-authoring R14/R34/R76, publication R21). No flaw found in my own module beyond what the entry changes.

Applied:
- R35: `deepercheck` → RUNG_ABSENT `observational` (as deeperbatch; sentence names file-safety R3, R10, R13); `inboxpull` → RUNGS `reversible` (heldsetaside takes the filed document out); R3's tally re-pinned 21 → 20 (24 with R7/R9/R10's); controls: safecopyrequest stays undetermined.
- R36 (new `t47.mjs`): projectlist, projectquestions reads; drawquestion reversible (as cite); projectbarset reasoned, PROJECT_BAR_NO_REASON joins JUSTIFICATION_REFUSALS; monitorset reversible; sever/reinstate's backing note names a question's own legs (no NON_ACTS row: ACTS rows, K3144 (2)); capturerequest's two sentences name a member's own request (capture-requests R56).
- R37: unlock, reauth, passwordresetlink (K3144 (1)), passwordreset on the credential ground; passwordresetlook, grouplanguages, signintrace reads; grouplogoset, grouplanguagesset, signrequest reversible; `publish` re-graded `terminal` (K3100 doubt 9), `publishcheck` with it (K2883); both leave IRREVERSIBLE_WEIGHT (now publishat, publishatmove, personexpunge, standardrelease); MACHINE_CANNOT_PUBLISH stays; no consequence statement.
- K3104: peopledirectory a read.
- Census: every op an owner's merged map serves with no grade, against my tables — the T47 ones are exactly R36's, R37's and peopledirectory; the rest are older store-internal routes with no spec.
Every op above has a NON_ACTS row, so op-declarations gives each a NEEDS row (K3144 (4)). None is in MACHINE_REFUSALS. New tests: t47.test.mjs (15 tests naming R35, R36, R37, each with a control, and the totality over a stand-in of op-declarations' T47 rows); re-pinned to R35/R37: ladder (R1, R2, R3), pins (partition, terminal/irreversible, undetermined), t35 (R21, R22), t36 (R24), t37 (R18), t42 (R1), t45 (R32), owners (R14).

Deferred: none.

Other modules: REPORT J2 (affordances ×2, control-plane totality, plane wizards R19; R1/R14/R21's wording).

Tests and checks: op-grades 94/94 pass. Users against an unmodified tranche/T47 run: affordances 233/12 (was 10), control-plane 234/8 (was 7), plane 217/6 (was 5), op-declarations 144/12 (unchanged), membership, interface-shell, screens-daily, screens-settings, screens-inquiry, wizard-scripts unchanged. format 0 failures; architecture 0 failures (24 product files); coverage 37 of 37 live ids, 0 failures; ownership 14 files, 0 failures; checks/run.mjs: my files 0 failures (its coverage failures are the unbuilt L11 screens' and others', none op-grades').

Size (session_01JUGvXiy9wCt6uvuqTS5HEj): test runs 7, module lines 3028

## J4 · COMPLETE

B3 (K3164) done: tranche/T47 merged first (da7fd0092b); `NON_ACTS` gains `statementack` ("case-directed: keyed by a case edition; a member acknowledges what the case does not cover") and `reviewcomment` ("review-directed: keyed by a review copy; a reader's comment for the case's owner") in t47.mjs, grades unchanged (reasoned, reversible); tested by name with a control (t47.test.mjs, R5 R1 K3164).

Tests: op-grades 95/95. control-plane `totality.test.mjs` now green (its R2/R41 red cleared). affordances: one test turns red from these rows, 'R1 R12 R19 R24: case-inputs' ops … with the control plane's rows nothing is unaccounted', whose stand-in carries no NEEDS row for statementack, so it reads `stale: ['statementack']` (green without my change); affordances' own re-pin, the re-run K3164 names. format, architecture, coverage 37/37, ownership (3 files) 0 failures.

Size (session_01JUGvXiy9wCt6uvuqTS5HEj): test runs 3, module lines 3033
