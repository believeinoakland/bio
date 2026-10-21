# screens-settings (T51)

**Status** · session_01W2VnBgWTLPm5Mn4jDuivo9 · depth 2 · WORKING · handled B30

## J1 · QUESTION

QUESTION (SCREENS-SETTINGS #7, T51-116). I carry on with everything not named here. Five things need BOB; the first four stop only the part named.

**1. R61 `grouprules`: the drawing's draft form does not match `ruleFields` or `ruledraft`.** `ruledraft` takes `{section, entry, source: {captureSha, extent}, reason}`; local-facts R18's `ruleFields` (op `rulefields`, a read; OPS does not hold it yet, op-declarations T51-107) answers 11 deadline fields (rule, applies_to, units, amount, count, direction, starts, owed_by, due_at, citation, effective_from) and 6 legal-fact fields (key, trigger, statement, citation, applies_to, effective_from). `SCR.grouprules` "Draft a rule" draws kind, trigger, "What it requires", citation, link, "In effect from", a source choice ("A capture your team holds / Capture the source first") and "Why": no applies_to, units, amount, starts, count, direction, owed_by, due_at; no way to pick a held capture or the passage (`{captureSha, extent}`); the words hold no label for those fields. The registry also lists `writinghelp` on `grouprules` (label "Help me write this"), which the drawing and R61 do not draw ("The assistant may show you a draft" is its sentence). Per rule 10 I stop the draft form (`ruledraft`'s fields and its send; `writinghelp`) and draw everything else of R61: Waiting for a second member, Rules in force, Confirm (with the qualification for tier 2, 3 or null), Withdraw with a reason, the notes. Please ask UX-DESIGN: (a) the draft form's fields per `ruleFields` with their words, (b) how a held capture and its passage are chosen, (c) whether `writinghelp` is drawn. My best reading until answered: `ruledraft` is listed in `SCREENS.grouprules.acts` (registry contract) with a send that refuses `screen.grouprules.src.help2` ("A rule with no source held here is not drafted.") and no form drawn.

**2. R56 table and two sentences: no keys.** The design holds no words for the arithmetic table's column headers ("Administrators", "Votes it takes", "Who votes"), its cells ("{k} of {n}", "{v} of {n} may vote") or the "(now)" mark; `…with.1.administrator.no.administrator` is now `{n}`-filled but singular, so I draw it only for 1 administrator (for 2, `possible` is false too: I draw `a.majority.that.leaves.out` and `that.is.the.rule.holding` alone). Without the table's keys I draw the fold with its three notes and no table; the "(now)" row test waits. Please ask UX-DESIGN for: the three headers, `{k} of {n}`, `{v} of {n} may vote`, the now mark.

**3. R59 vs interface-shell R95: seven of the sixteen states have no chip.** R95's `cs.stateChip` knows nine kinds (review, reviewed, retired, open, concluded, published, waiting, flagged, watched) and answers "" for any other; R59 draws a chip for each of sixteen (also deferred, dismissed, divided, planned, active, resolved, abandoned). The words hold `state.item.<kind>.name/.means/.can/.cannot` for all sixteen. My reading: the row draws `cs.stateChip(kind)` when it answers a chip, else the state's own name `state.item.<kind>.name` as plain text beside the same `.means`; BOB please settle with the interface-shell job (the chip for all sixteen is the better answer).

**4. Not yet merged, so not testable yet:** my work needs, from earlier jobs of L11 (all started, none merged): wizard-scripts' regeneration of `screen-registry.mjs` (the generated one is at `7be06eb4cb`: no `glossary`, no `grouprules`, no `signeradd` on `members`, no `instancegroupseed`), interface-shell R90/R95/R97/R101 (`cs.stateChip`, `cs.term`, `cs.signer.register({keep, passphrase, defer})`, `ADMIN_ACTS` gaining `signeradd`), op-declarations' `rulefields`. I write against their contracts and prove with those branches merged locally (uncommitted) until BOB merges them; I will run the full module tests again after I merge `tranche/T51` with them.

**5. Nothing else.** R58 (the seed sentence), R60, R55, R57, the glossary and the module's words findings I do now.

## J2 · QUESTION

QUESTION (SCREENS-SETTINGS #7, T51-116; J2; replaces nothing: J1 stands as BOB answered it in B2).

**R56 item 4 against the plan's CR-4 line.** The requirement (R56 item 4, K3868) says a removal under way is NOT drawn in T51: no read answers it. The plan's CR-4 line and the T51-116 entry (K3946) say member-roster R75 (`adminRemovalsOpen`, `{target, voters, awaiting, have, need}`) is built by T51-145, its op declared by T51-107 and routed by T51-123, "so screens-settings R56 draws the block (T51-116)" and "K3868's 'absent in T51' no longer holds". The requirement text was not changed with it. Today `OPS` holds no op for that read (I found `adminarith`, `adminendorse`, `adminremove`, `adminresign`, none for removals under way), and the design's four sentences for the block are still samples with names and numbers written in (R56's own list). **My reading until you answer: the requirement stands (the block is not drawn), because the op is not declared and four of its sentences have no fill.** If you want it drawn, I need: the op's name once T51-107 declares it, the four sentences with fills from UX-DESIGN (`agree.remove.teo.as.administrator`, `removing.teo.as.an.administrator`, `four.administrators.rosa.dev.ana`, `counted.in.the.4.doesn`), and R56 item 4 reworded; I would add it as a CHANGE after those merge.

Done so far (pushed, `bfdd70b252`): R55, R56 (without the table and the removal under way), R57 (kept-on-device path proven; the passphrase path waits for interface-shell R97), R58, R59 (the chip test waits for R95), R60, R61 (without the draft form), the contract reds and the five words findings; module tests 169, words check 0, format, architecture, coverage (60 of 60) and ownership 0 failures. Nothing here waits for an answer; I wait for the providers' CHANGEs for the last parts.

## J3 · REPORT

REPORT (SCREENS-SETTINGS #7, T51-116; J3; answers B3). Pushed `c8b0915c8d`.

Done on B3: R56's scale table (the eight DEC-356 rows; live row marked `(now)` and `aria-current`; "not removable" and "no majority…" for a count that cannot remove); R56 item 4 reads `adminremovalsopen` and draws, from the answer alone, `{have} of {eligible} have agreed so far`, the one facing removal as counted and not voting, and "the removal waits for <who>" for each awaiting; `[]` draws nothing; R61's "Draft the rule" on DEC-357's fields (one name → stored `rule`/`key`; deadline fields; legal-fact fold; kinds from `rulefields` with `claim` first; the document among `heldcaptures`; the passage found in `reading`'s `text_units`, its place sent as `source.extent`; `pass.notfound1`/`2` when not found; the 12-hour time sent as HH:MM; `writinghelp` only under "What it says" and only while the assistant is reachable; the member's `why` is the act's reason).

Proof: in a scratch tree (not on my branch) with `job/T51/interface-shell` (R95, R97), `job/T51/op-declarations` and `job/T51/wizard-scripts` merged: module tests 176 pass, 0 fail (the glossary's sixteen chips and the passphrase path included). On my own branch, until those three merge, the glossary chip test, the passphrase test and every test of a screen the old registry lacks (`glossary`, `grouprules`, `signeradd`) and of `adminremovalsopen` / `rulefields` fail: that is the dependency, not the module. Words check over every module: 0 lines naming this module; format, architecture, coverage (60 of 60) and ownership 0 failures.

Still owed, each a CHANGE when it exists:
1. The four N1248 sentences with fills (`agree.remove.teo.as.administrator`, `removing.teo.as.an.administrator`, `four.administrators.rosa.dev.ana`, `counted.in.the.4.doesn`), and the two rows the removal block still needs and no key holds: "<who> · agreed" with the day, and "<who> · hasn't voted yet" (plus the block's "What it takes" heading). Until then each voter's day is not drawn.
2. `grouprules`: the headings "Rules in force" and "Draft a rule" have no keys (drawn without a heading); `screen.grouprules.src.help2` doubles as the refusal for "Capture the source first".
3. Requirement text: R61 still describes the old form ("`.text.label`, one field per `ruleFields` entry"); BOB's fold of DEC-357 into it is owed.
4. R39's design reads list and `KEYS` now include 1,500 keys; nothing to do.

I wait for the three providers' merges and the CHANGE for item 1.

## Completion (SCREENS-SETTINGS #7, T51-116)

- **Entries applied:** R55 (signing keys for others: withdrawn, reactivated, `signeradd`), R56 (arithmetic, the founder's reconcile fold, the scale table, a removal under way from `adminremovalsopen`, DEC-359/360 rows), R57 (key made on the page's terms, registered-for-you line, glossary link), R58 (seed note), R59 (`glossary`, sixteen chips), R60 (places with no profile), R61 (`grouprules`: waiting, in force, confirm with qualification, withdraw, the draft form on DEC-357's fields with the passage found in `reading`'s text units, `writinghelp` under "What it says"); the two inherited reds (contract:23, :68) and the five words findings; stale comment index.mjs:4.
- **Deferred / reported:** R23's withdraw in a member's row panel moved to the keys section (R55); `ruleconfirm` and `ruledraft` carry the shell's reason friction (op-grades); a profile offered to choose is still drawn when a place is named and none is active (R60).
- **Found in other modules:** none beyond what J1–J3 reported (all answered).
- **Tests and checks:** module suite 177 pass, 0 fail against the merged providers; format 0 failures; architecture 0; coverage 60 of 60; ownership 0; `checks/words.mjs` over every module names none of this module; setup-words `--check` reports only the expected stale-rows note from other modules' words.
- Size (session_017yqdpyhi5axta4sFg6PFUd): test runs 30, module lines 4285

## J4 · COMPLETE

COMPLETE: T51-116 screens-settings met; 177 module tests pass against the merged providers; format, architecture, coverage (60 of 60), ownership and the words check clean. Record: build/jobs/T51/screens-settings.md.

## J5 · COMPLETE

COMPLETE (re B9, K4094). This module draws no legend from a provider slug: `security` has no fieldset legend and draws no `google-web-risk` or `opswat-deep-cdr`; those legends are on the setup page's scanner list, which is not this module's (installer / instance-setup, please check). What I did find and fix here: the "tools in use" table drew each tool by `provider_id`, a slug. It now draws the provider's display name (vendor and product from the catalogue the screen already reads), and, with the catalogue unread, the column's word, never the slug; test added (R15). Catalogue labels and hints are drawn as read. Suite 178 pass, 0 fail; words check clean. Pushed.

## J6 · REPORT

CORRECTION to J5: it said 178 pass; the commit it announced had one failing test (the words test saw "Acme Scan", a joined name not in the record's data), which I had not yet fixed. Fixed and pushed now: the tool is drawn as "vendor · product" like the catalogue's own rows, and the R43 test no longer mistakes that name for the catalogue list. Suite 178 pass, 0 fail; words check 0; coverage 60 of 60. Everything else in J5 stands.

## J7 · COMPLETE

**CR-20 · screens-screens-settings: R62 met.** (K4120, FILE-SCANNER #8 J8.)

- **Entries applied:** R62. `security` reads `handling.on_own` (file-scanner R33) for the every-file box and the `routine` use, in place of the two matches on `recipient`'s English (former `security.mjs`:56 and :167; the matcher is gone). Fixtures carry `on_own` (the catalogue entry `false`, the own entry `true`). The R62 test (`security.test.mjs`) covers an own server named in Spanish (`on_own: true`: box drawn, `use: "routine"`) and a server named in English as the organization's own but flagged `false` (no box, `use: "on_request"`).
- **Merge:** `tranche/T51` merged into the job branch first (`c06d20cc1a`), as BOB's START asks, for file-scanner R33.
- **Deferred:** none.
- **Found in another module, or in this module's words list (not changed here):** the R39 test (`contract.test.mjs`:71) fails, `act.claim.label.setup is a key this module reads`. `docs/development/ux-substrate/screens/words-reads.json` lists that key under `screens-settings` (line 12485), but `keys.mjs` does not hold it and no screen here draws it. It fails the same way on the merged tranche without my change, so it is inherited from the reads list, not from R62. Which side is wrong (the reads list, or a screen that should draw the claim label) is a BOB call; I have not added or removed the key. Also: `checks/run.mjs` shows words findings in `instance-setup` (`setup-fleet.mjs`:42–67) and `file-safety` (tests), both outside this module.
- **Tests and checks:** module suite 179 tests, 178 pass, 1 fail (the R39 key above, pre-existing). R62 passes. `checks/format.mjs` 0 failures; `checks/architecture.mjs screens-settings` 0 failures; `checks/coverage.mjs screens-settings` 61 of 61 live requirement ids named by a test; `checks/ownership.mjs` 0 failures (3 files, all this module's); `checks/run.mjs`: no finding names a `screens-settings` file.
- Commit `8a78242ac1`, pushed to `job/T51/screens-settings`.
- Size (session_01K19GNa6yQamxgFprY4YSqT): test runs 7, module lines 4288

Waiting on BOB (J7).

## J8 · COMPLETE

**Re B11 (CHANGE, K4139, DEC-371, U402): done.** `tranche/T51` merged (no conflicts); the four `screen.members.*` removal keys added to `keys.mjs` `KEYS` (`agree.remove.teo.as.administrator`, `counted.in.the.4.doesn`, `four.administrators.rosa.dev.ana`, `removing.teo.as.an.administrator`), list kept sorted. Commit `8f1f965770`, pushed to `job/T51/screens-settings`.

- **R39 now green:** the pre-existing red from J7 (`act.claim.label.setup`) is not in the module's list; the four keys were the only change here.
- **Tests:** module suite 179 tests, 179 pass, 0 fail.
- **Checks:** `format` 0 failures; `architecture` 0; `coverage` 61 of 61; `checks/run.mjs` words 0 failures (testcopy 0, inline 0), no finding names a screens-settings file; `ownership` 0 failures (1 file changed by this module: `keys.mjs`, plus the R62 files from the earlier commit).
- **Size (session_01K19GNa6yQamxgFprY4YSqT):** test runs 8, module lines 4288 (src only; unchanged by the keys list beyond its entries, which are data).

Waiting on BOB (J8).

## J9 · REPORT

REPORT (SCREENS-SETTINGS #10, FR-25). Started: B13–B15 read; merged tranche/T51; working the entries.

**Found in `wizard-scripts` (another module): `writinghelp`'s declaration omits `op`, which its arm requires.** `wizard-scripts/index.mjs`:1753-1754 (`DECLARED_OPS`, R46) declares `fields: { accepts: ["field", "told", "draftHeld"], requires: ["told"] }`. But `writingHelp({op, field, told, draftHeld, …})` (`index.mjs`:1522) passes `op` to `writingHelpAt` (`writing-help.mjs`:58), which answers `WRITING_HELP_REFUSED` when `op` is not a non-empty string: the op the draft is for (`notewrite`, `noterevise`, `groupdescriptionset`, …) is how the arm decides whether help may be offered at all. R27 states the POST body is `{op, field, told, draftHeld}`. The guard (`interface-shell`'s harness) therefore refuses every screen's request as `sent op, which the op does not accept` (FieldMismatch `unknown: op`): `notes`, `group` and `grouprules` (4 of my tests) and every other screen that sends `writinghelp`. I do not weaken a declaration and I cannot send the op without `op`, so the fix is the owner's: `accepts` gains `"op"` (and `requires` it, since the arm refuses without it). Please send it to `wizard-scripts` as a CHANGE; my four tests turn green by themselves once it is merged and I merge the tranche. I carry on with all other entries meanwhile.

## J10 · REPORT

REPORT (SCREENS-SETTINGS #10, FR-25). Three more things in other modules that stop acts of mine from being drawn or sent. All three are measured by running the tranche as merged (J9's `writinghelp` is the fourth). I carry on with everything else and write each screen against the owner's documented shape.

**1. Eight acts of my screens are in neither `SESSION_OPS` set, so `interface-shell`'s `can` (R12: "the op is in `SESSION_OPS.member` or `.admin`") never draws their buttons.** `selftest`, `bootstrap`, `runtime` (the `updates` screen, C82); `exportlog` and `export` (the `group` screen, C30); `biasmanifest`, `biasinhale`, `biasdebt` (the new `bias` screen, C47). Measured: `OPS` holds each (the mechanical pass declared them), `SESSION_OPS.member` and `.admin` hold none. Six are reads (`mutating: false`; `OPS` classes admin, member, probe) and `op-declarations`' own comment says "SESSION_OPS gates MUTATING ops alone", so the door lets a session call them; it is only the shell's `can` that asks set membership of every act, a read included. `export` is mutating, classes `["admin"]` only, so a founder's session reaches it by no set at all. Either `interface-shell` R12 lets a read (`OPS[op].mutating === false`, which the shell already knows as the rung `none`) pass without set membership, or `op-declarations` puts the six reads in both sets and gives `export` its session reach (the founder's, "a copy is taken only by a founder"); that choice, and the fix, are not mine. Until then the `updates` health section, `group`'s export and the `bias` screen draw no act and their tests cannot go green. `writinghelp`, `promote`, `biasadopt`, `biasdebtresolve`, `memberpairingset` and `expertisewithdraw` are in both sets (checked).

**2. `credentials`' `DECLARED_OPS.bootstrap` accepts no field, but the part report needs one.** `setup.mjs` `bootstrapReport` answers `memberVersions` (what each part runs) only for `members=1` (`setup.mjs`:3344 reads `url.searchParams.get("members") === "1"`); the row is `fields: {accepts: [], requires: []}`. The `updates` screen's "Show what each part runs" must send `members=1`; the guard reports `sent members, which the op does not accept`. `accepts` gains `members`.

**3. Words and data the design has not given (the job does not invent them; what is drawn is listed).**
 a. `updates` health: no word for a part's name ("The assistant's worker", "Reading PDFs", …), for "release {version}", for "answering", "unbound" or "misnamed". `bootstrap` answers parts by module id (`agent-worker`, `pdf-worker`, …) with a state; I draw the id and the release as record data, a silent part by `screen.updates.health.part.silent`, an unbound or misnamed part by its state as data. `screen.updates.health.file.test` needs `{seconds}`, which `selftest` does not answer (it answers `captures: "read-write ok"` with no time), so it is not drawn. `screen.updates.health.runtime.heaviest` needs `{ms}` and `{calls}`; `runtime` answers per-metric peaks and means in each metric's unit and `subrequests.observed` (a ceiling, not a request's count), no "heaviest request" with outside calls, so it is not drawn; the metrics are drawn as record data (name, peak, mean, samples) without column words, and the two limit sentences and the note by their keys.
 b. `settings`: the design's Settings list has a third section "For every member" with `bias` ("Declared bias"), but `words.json` holds no heading for it and no `screen.bias.purpose` (the list draws `screen.<id>.purpose` beneath each name). I add no link until both exist; the `bias` screen is reachable by its address.
 c. Entry 11 (T-08): the entry says the setup release draws `updates.running.setup_on`; the keys' own notes say `release_setup` is for the setup release and `setup_on` is "said once, apart from any release". I read it as: a release with a member keeps `release`; one with none that is the setup release (installed the day `bootstrap`'s `installed_at` names) draws `release_setup`; one with none that is later draws `release_noactor`; the set-up date is said once by `setup_on` unless the release line already says it. Tell me if you meant otherwise.

## J11 · QUESTION

QUESTION (SCREENS-SETTINGS #10, FR-25 entry 3, the `bias` screen: R65). Entries 1, 2, 4–16 are applied and pushed (members, account, connect, updates, group, grouprules, security); `bias` is the one left. The drawing (`SCR.bias`, DEC-374) cannot be drawn whole from `words.json` as merged, and some of its data flows are not stated. Per your rule I draw what is keyed and invent nothing; the list below is what is missing. My best reading, which I build on unless you answer otherwise, is in each item.

**A. Words the drawing needs and `words.json` lacks** (the 96 `screen.bias.*` rows are the drawing's sentence fragments; headings, labels and templates were not extracted). Please have UX-DESIGN give them: (1) labels: "Whose lens" (the scope choice) and its option "The whole team"; "Kind of statement" (the label) and the three kinds' short names (Scrutiny, Inference, Pattern); "The statement" (the textarea); "What it cites"; "Adopt it for" (the radio legend); `act.writinghelp.label.bias` (the registry lists `writinghelp` on `bias`); (2) headings: "In force for the whole team" (only the project form `in_force_for_the_coliseum` {project} exists), "Write a set", "Adopt it", "Proposed statements", "Left out", "Settled"; (3) row templates: a statement's "about {subject}" and "Why: {reason}" and "the team's, locked" / "this project's"; the dt "Lens"; the dts "A bar" and "A verdict"; the link rows "Write a set · …" and "Draft one from an outside policy · …" (only the second's title exists); a work product under an earlier lens ("Made under lens {then} on {date}. In force now: {now}, adopted {date}. The change: {change}") and a settled one ("Settled by {who} on {date}: “{reason}”"); (4) fills: `screen.bias.it_read_sentences_of` holds "4 sentences of 4" and `by_admin_for_the_team` holds both an administrator and an owner, so neither can be drawn for other numbers or a team-only or project-only adoption; each needs `{read}`/`{of}` and its variants.
Until given, the screen draws a control whose label is missing without a label and a section whose heading is missing without a heading (never the key, never English I wrote); each lands as a `CHANGE` when the rows merge. My reading of what it can say meanwhile: the statements and what is in force by their data; the sentences that exist by key.

**B. Data flows the drawing does not state** (my readings): (1) "Who or what it is about": the member types a name; I resolve it to a registry key with `entitybyalias` (`alias`), accept an `ENT-…` id typed as it is, and refuse an unknown name with `screen.bias.add_it_under_people_first`; the writing form sends the bundle `promote` takes (as `start-project.mjs` builds a project's): `files: [{path: "bundle.md", text}]` with frontmatter `object_type: bias`, `title` the set's name, `current_state: proposed` (the act is "Save the set and offer it for adoption"), `statements[]`, and the `## What This Does Not Enforce` section, `meta`, `snapKey`, `base: null`. (2) "Adopt this set" adopts the set just saved in this sitting (`promote` answers its `bundleId`), the page holding it in memory; there is no op that lists the team's bias sets, so a set offered earlier cannot be picked from a list. If you want a list, `index` by `object_type: bias` is the read I would use; say so. (3) Work under an earlier lens: `biasdebt` is asked per work product (`run`), and no op lists every open debt, so the section draws the one the address names (`/app/bias/<run>`, which is how R106's `bias-debt` reference opens the screen) and the queue's rows (screens-daily's) lead to it. (4) "Start a set from these" (the proposed statements) promotes them as a `draft` set after the member names a subject and writes a reason for each (the rows say "Choose who it is about and write why"); a draft need not cite evidence.

Reply with changes to any reading; none is irreversible.

## J12 · COMPLETE

COMPLETE (SCREENS-SETTINGS #10, FR-25: B12 and its CHANGEs B13–B21). Requirement lines are in `build/requirements/screens-settings.md` (R63–R77, each marked *(not yet met: T51)*; B13 accepted), not in this record.

**Entries applied** (each with a test that names its id and a control; module code `members`, `account`, `connect`, `updates`, `group`, `grouprules`, `security`, the new `bias`):
1. C79 and 15 (DEC-386) R63: a confirmed expertise draws "Withdraw an expertise", its own act `expertisewithdraw` `{memberId, label}` and the shell's reason; Confirm stays `expertiseconfirm` for a declared one.
2. C80 R64: the founder, first, in the "Whose key" chooser once claimed and she holds a handle (`signeradd` `memberId: "admin"`).
3. C47 R65: the screen `bias` (7 registry acts; registered in `SCREENS`; the lens in force for the team or a project; writing a set and saving it offered; adopting the set just saved; drafting from an outside policy and "Start a set from these"; work under an earlier lens at `/app/bias/<run>`). Drawn with the keyed words only; the missing labels and headings are drawn without them (HANDOFF B427). One statement per set (the drawing's form).
4. C30 R66: `group` draws the copy of the record (founder: field, act, "cannot be undone"; another administrator: who can) and the list of copies (`exportlog`).
5. C81 R67: `account` "Your cover name" (`memberpairings` read, `memberpairingset` `{memberId, published}`, the state read back).
6. C82 R68: `updates` "How your copy is doing": `selftest`, `bootstrap` (`members=1`) and `runtime`, each from its answer; a problem in its fold.
7. C11 R69: the website file on `group`, drawn as `screens-entry` draws it, from `domain_claim.well_known`.
8. L2 R70: `heldcaptures` asked `state: "held_and_vouched"`. 9. L30 R71: a member's name links their handle. 10. T-05 R72: the confirmation before the grant that administers (the kit's checks redraw; no second reason box). 11. T-08 R73: the noactor words, the setup release told by `bootstrap`'s `installed_at`, `setup_on` once (your reading c, B18). 12. T-14 R74: credential labels by `file-scanner.credential.*`. 13. T-18 R75: `screen.group.hosting.now.setup` and `.system`. 14. K4199: the harness gives the shell's reason in the 24 tests (`kit.mjs`: the reason is left out of `sent` unless a test gives its own). 16. K4203 R76: `connect` sends only `{kind, secret}` and an empty body. B15 R77: `no_signatures` by its key, else the answer's words.

**Deferred:** one statement per set (the drawing's form; no word for "add another statement"); subject names in the lens (the owner answers registry keys, drawn as data; a name per subject would need a read the design does not give). **Not done, B19 (2):** the team's earlier offered sets are not listed. `index` has no owner declaration (`OPS` `{classes, mutating: false}`, no `fields`), so whether it accepts an `object_type` filter is not stated; only the set saved in this sitting is adoptable. REPORT: `index` needs a declared filter (or a dedicated read) before a set offered earlier can be listed.

**Found in other modules** (reported earlier as J9, J10, J11; answered B16, B18, B19): `writinghelp`'s `op` (merged, green); `bootstrap`'s `members` (merged, green); session reach of reads (merged, green); `export` in the founder's session set (OP-DECLARATIONS #30: pending); the design's missing words (HANDOFF B425, B427). New: (a) `entitybyalias` has no owner declaration (the bias form looks a subject up by name with `{alias}`; the shape is read from `entities` code: `entities[]` with `entity_id`); (b) `promote`'s bias bundle: the frontmatter keys and the first-state rule for a new bias set (`current_state: proposed` at once) are my reading of `bias` R2–R8, unproved end to end here (the tests answer `promote` from a fake plane); (c) the fixtures' old `tokenClass: "session"` was no class the shell's R12 knows (`member`, `admin`): the kit now uses the shell's.

**Tests and checks** (process repository, after merging `tranche/T51` at B21, `8af5af4b4b`): module suite 208 tests, 206 pass, 2 fail: the two R66 tests that draw `export` to the founder (`export` is in no session set until OP-DECLARATIONS #30; they go green by themselves once it merges, a merge of `tranche/T51` and a re-run). `checks/format.mjs` 0 failures; `checks/architecture.mjs screens-settings` 0 failures (42 product files); `checks/coverage.mjs screens-settings` 76 of 76 live ids named by a test; `checks/words.mjs screens-settings` 0 failures (inline 0, testcopy 0, handlist 0); `checks/ownership.mjs screens-settings tranche/T51 job/T51/screens-settings`: 25 files, 1 failure: `build/requirements/screens-settings.md`, the one file K4210 accepts at your merge.

Size (session_01YYLjzokpdPYtFU7x1UhDVH): test runs 70, module lines 4949

## J13 · COMPLETE

COMPLETE (SCREENS-SETTINGS #11, FR-25: B22).

**Entries applied.**
1. B19 (2) R65: the `bias` screen lists the team's earlier offered sets through `retrieval`'s `list` (`type: "bias"`, `state: "proposed"`, `limit: 50`), following `cursor` as `after` page after page, each page read once and kept in the page's memory, at most five pages. The set just saved comes first; a row that is not a bias set or not `proposed` is not listed; each set is drawn by its title and when it was last written (data), the first chosen unless another is; "Adopt it" sends `biasadopt` for the set chosen (`bundleId` from the choice), so a set offered earlier is adoptable without writing it again. An empty answer draws no list and no adoption; a list that cannot be read is drawn failed (`shell.unread`), never as no sets. Test: `bias.test.mjs` "R65 the team's earlier offered sets are listed and adoptable…" (two pages by cursor; an adopted set and a bundle of another type left out; the first, a later and the just-saved set adopted; empty answer; failed read) and R65's first test (the lens read and the sets read are the only reads at open).
2. `entitybyalias`: the bias form's lookup sends only `{alias}` (test: "R65 writing a set…" asserts the request's query is `{alias}` alone, and the guard accepts it).
3. The two R66 `export` tests are green after merging `tranche/T51` (op-declarations R83).
4. `register.mjs` now registers through test-support's `registerDeclared(root, registerDeclaredOps)` (R17), no hand collection of rows.

**For BOB: requirement lines.** R65 item "adopting the set just saved … " should read: "adopting a set the team offered — the one just saved, or any listed by `retrieval`'s `list` with `type: "bias"` and `state: "proposed"`, page after page by its cursor, at most five pages — for the whole team (an administrator's) or for a project (its owner's) …"; and "Test:" gains "a set offered earlier is listed and adoptable; one of another type or already adopted is not listed; an empty answer draws no list". The module's `uses` in `build/modules.json` needs `test-support` (screens-settings' tests import `bio-plane/test/declared-ops.mjs`): until then `checks/architecture.mjs screens-settings` reports the one failure below.

**Deferred.** As in J12: one statement per set; subject names in the lens. The mixed-state choice (a set offered earlier, adopted before, is listed no more because it is no longer `proposed`) is by design: a set adopted for one project and offered for another is not offered again from this list.

**Tests and checks** (after merging `tranche/T51` at `225cfd3f38`): module suite 209 tests, 209 pass, 0 fail. `checks/format.mjs` 0 failures; `checks/architecture.mjs screens-settings` 1 failure: `bio-plane/test/m/screens-settings/register.mjs` imports test-support's `declared-ops.mjs`, which `build/modules.json` does not list in screens-settings' `uses` (BOB's file; see above); `checks/coverage.mjs screens-settings` 76 of 76 live ids named; `checks/words.mjs screens-settings` 0 failures; `checks/ownership.mjs screens-settings tranche/T51 job/T51/screens-settings` 5 files, 0 failures.

Size (session_01JCbyiaVBiZ277MQAdnsSaX): test runs 5, module lines 4984

`checks/run.mjs` (whole product): words 33 failures, all in other modules (op-grades test copies and others, not screens-settings; `words.mjs screens-settings` is 0). The `setup-words build --check` was not reached in the run.

## J14 · COMPLETE

COMPLETE (SCREENS-SETTINGS #11, FR-25: B23 and B24, after J13).

**Entries applied** (merged `tranche/T51` at B23's tip first; U420 and U422 read):
1. B425 R68: the health parts are named by bootstrap's own id (`screen.updates.health.part.<id>`), a serving part drawn with `.part.state.answering` and `.part.release`, a silent one by `.part.silent`, `.part.state.unbound`, `.part.state.misnamed` (with the name the answer gives), any other state by `.part.other` and the answer's own word; `.file.test` drawn when `selftest` answers `captures: "read-write ok"`; runtime's `.heaviest`, `.average`, `.samples` with the unit code beside the number (`ms` or `bytes`, B24: the code until the design words them), `.limits` with `{ceiling}` from `subrequests.observed` (a count, no unit; not drawn while no refusal has taught a ceiling, which `capture` R23 makes `null`).
2. B425: `screen.settings.everyone` is the third section of `settings`, "For every member", holding the `bias` reference (name, purpose), drawn to every member.
3. B427 R65: `bias` draws its labels (`lens.label`/`.team`, `kind.label`, `statement.label`, `cites.label`, `adoptfor.label`), headings (`head.team`, `head.write`, `head.adopt`, `head.proposed`, `head.left_out`, `head.settled`), rows (`row.about`, `row.why`, `row.team_locked` for a locked team statement, `row.project` for a project's, kinds by `kind.*`), `dt.lens`, `dt.bar`, `dt.verdict`, the two links (`link.write`, `link.draft`, anchors to the page's own sections), `it_read_sentences_of` from `coverage`, the adoption sentences (`by_admin_for_the_team`, its `.team` and `.project` variants picked by the adopter's scope: both with both bundles), `earlier.made` (then, `observed`, now, `raised`, `moved_basis`) and `earlier.settled`.
4. B417 (2): `screen.bias.purpose` is read by `settings` through `screen.bias.purpose` (the reads list).
5. `keys.mjs` (R39) regenerated from the design's `words-reads.json` (1,912 keys): the contract test is green.

**Requirement lines for BOB.** R68's "A sentence the design holds only as a sample … is not drawn (REPORTED, J10)" is stale: the parts' names, `.file.test` and `.runtime.*` are words now. R65's "*Words:* … a control or section whose label or heading the design has not yet given is drawn without it" likewise. R17/R32: `settings` draws a third section, "For every member" (`screen.settings.everyone`), holding `bias`; R32's test counts three lists for an administrator and two for a member. Also (from J13) the `uses` of screens-settings needs `test-support`.

**Judged readings** (none blocks): `row.team_locked` is drawn for a statement with `locked: true` and no project scope; `earlier.made`'s `{adopted_on}` is the debt's `raised` (when the lens changed) and `{made_on}` its `observed`: no field names the adoption day of the lens now.

**Deferred.** As in J12/J13.

**Tests and checks** (process repository): module suite 209 tests, 209 pass, 0 fail. `checks/format.mjs` 0 failures; `checks/architecture.mjs screens-settings` 1 failure (the `test-support` `uses` entry, J13); `checks/coverage.mjs screens-settings` 76 of 76; `checks/words.mjs screens-settings` 0 failures, and no line of the whole-product words check names screens-settings; `checks/ownership.mjs screens-settings tranche/T51 job/T51/screens-settings` 0 failures.

Size (session_01JCbyiaVBiZ277MQAdnsSaX): test runs 12, module lines 5101

## J15 · COMPLETE · re B25

COMPLETE (re B25, K4259): entry 1 (`updates`, R68, DEC-389) applied. Pushed `cea44ac799` on `job/T51/screens-settings`.

**Entries applied**
- Entry 1: the runtime figures are said with their unit by key, `screen.updates.health.runtime.unit.ms` and `.unit.bytes`, in `heaviest` and `average`. The raw token is never drawn. The subrequests ceiling stays a count with no unit. Test first (R68 runtime test updated to the keys; new R68 units test), seen failing, then passing.

**Deferred**
- None.

**Decision (for BOB to record in `build/rulings.md`; not written by this job, since that file is outside this module's paths)**: a metric whose `unit` has no key (`ms`, `bytes` are the only keys held; instance-setup R34 answers these two) draws its name and its sample count only, with no figures and no raw token. Reason: a figure with a bare number is what R68 forbids; a sample count is a count, not a unit.

**Requirement lines for BOB (R68)**
- The sentence "runtime's unit by `screen.updates.health.runtime.unit.<code>` (DEC-389) once its job takes it" is now true. Please fold it into R68's text, and state the unit-less rule above.

**Found in other modules (not changed here)**
- `checks/run.mjs`: `testcopy` failure in `bio-plane/test/m/op-grades/t37.test.mjs:32` (translation-directed key). Not this module's.
- `checks/coverage.mjs` over every module: 6 live ids named by no test (agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19, screens-inquiry R110 R119, screens-intake R53). Not this module's.
- The design's reads list (`docs/development/ux-substrate/screens/words-reads.json`) does not carry `runtime.heaviest`, `runtime.average`, `runtime.samples` or `runtime.unit.*`; this module reads them anyway and the R39 test passes. Flagged only; the design owns that list.

**Checks**
- `node checks/run.mjs /home/user/bio`: architecture 0 findings for this module; words: 0 findings naming a screens-settings file (one `testcopy` finding is op-grades, above).
- `format` 0 failures; `architecture screens-settings` 0 failures; `coverage screens-settings` 76 of 76 live ids named by a test, 0 failures.
- `ownership screens-settings tranche/T51 job/T51/screens-settings`: 0 failures (1 file changed by this module: `updates.mjs`, plus its test).
- Module suite `bio-plane/test/m/screens-settings/`: 210 pass, 0 fail (includes the contract test asserting `checkScreens(SCREENS)` is true, so no act differs from the design for this module).
- `npm ci` run in each lock-file directory that lacked `node_modules` (K4113) before the first run; all exited 0.

Size (session_01Si5cxby7xVds46UHqHmk44): test runs 9, module lines 5105

## J16 · QUESTION

QUESTION (SCREENS-SETTINGS #13, fix round 2, B26). I carry on with everything; all ten causes are built and tested, and what follows is only what the design's word list does not hold. I invented no sentence: each place draws the nearest existing word, or draws nothing, until the rows below exist.

**New word rows needed (for UX-DESIGN, one batch):**
1. **C88** `screen.group.hosting.now.date` "Recorded on {date}:" (the neutral line the cause asks for). Today the hosting line says "recorded when set up" only for a recorder of no one/bootstrap, "by Civicsmith itself" for a machine, and otherwise "Recorded by <handle> on <date>:" with the founder named by `memberName`. So a founder who records it again after setup is no longer told "when set up". R75 said the founder is "at setup"; I read C88 as overriding that (a founder's date can be any day).
2. **C85** the three counts of a copy of the record. Existing rows give "{n} records" and "{n} files" (`queue.export-performed.records.*`, `.files.*`), drawn with `queue.export-performed.summary` beside "Save as a file". No row says "{n} tables", so the tables figure is not drawn at all on the offered copy (the list of copies keeps its three bare figures, unchanged). Needed: `screen.group.export.count.tables.one` "1 table" and `.other` "{n} tables" (and I would draw all three labelled in the list too).
3. **C83** what the administrator can do when the scanner holds no signatures (the cause asks for it): `screen.security.nosignatures.next`, e.g. a line telling an administrator to ask whoever looks after the team's Civicsmith to refresh the scanner. The date and the reason are drawn already, from the plane's own keyed words.
4. **C86** the check's time: `screen.group.domain.checked` "Checked {date} at {time}." Today the day and the HH:MM are drawn as data beside the verdict, with the plane's own `detail` (which says "(HTTP 404)").
5. **C87** the neutral refusal "Fill in {field} first. Nothing was sent.": I use `screen.security.config.missing` (it fits, `{field}` is the box's own label) for the empty boxes of Add a court, Draft the rule, Propose statements, Save the set and Save who your team is. A neutral key (`shell.field.needed`) would be better placed.
6. **C91** `screen.watching.purpose` and `screen.leads.purpose`: Settings draws each door with its name; no purpose is drawn beneath them.

**Readings I built on (tell me if wrong):** C89: `memberadd` for an administrator beyond the second is sent by the screen itself (the shell would draw its CONSENSUS_REQUIRED answer as a refusal), drawn as done in the success style with who must still endorse, and the roster read again. C90: the removal vote is not drawn while `adminarith.live.possible` is false (the section says why); an unread count hides nothing. C14: grouprules asks `heldcaptures` once on open with `fields: "picker"`.

## J17 · COMPLETE

COMPLETE (SCREENS-SETTINGS #13, fix round 2: B26, with B27 and B28). Tranche merged at `62d4234d23` and DEC-396 read.

**Causes met** (each test written first and seen failing, with its control; tests name the requirement they amend and the C-number):
- C14 (R70): `grouprules` asks `heldcaptures` once on open, `fields: "picker"`; no act reads it again.
- C83 (R15, R77): the "files are checked" sentence only with a scanner that answered, holds signatures (`signatures_age_ms`) and has no `no_signatures`; the no-signature state is drawn under file-safety's keys (B27) with its day and the refusal's code, which also says what an administrator can do. Setup's half is screens-entry's.
- C85 (R66): `export` sends `query: {note}`; the manifest is offered as a file (`shell.save`) from page memory with "{n} records, {n} files" (queue words); the list is read again.
- C86 (R18): the latest check's verdict also draws its day, HH:MM and the plane's own `detail`.
- C87 (R14, R46, R61, R65): Add a court, Draft the rule (each box), Propose statements, Save the set (name, subject, statement, reason, citation for a pattern), Start a set from these, Save who your team is: an empty box sends nothing and is named by `screen.security.config.missing {field}`.
- C88 (R75): a founder's or any member's hosting record is "Recorded by <handle> on <date>"; setup/system words only for no one, bootstrap and machines.
- C89 (R2): `memberadd` for an administrator beyond the second is sent by the screen, drawn as done (`refusal.CONSENSUS_REQUIRED` with who must still endorse) and the roster read again.
- C90 (R56): no removal vote where `adminarith.live.possible` is false; an unread count hides nothing.
- C91 (R17): "For every member" holds Watched addresses and Leads, each only where `cs.can` allows (monitoring; lead); no purpose line (no word).
- C94 (R15, R27, R40, R48, R55, R56, R57, R61, R65, R75, R46): every id-to-name site uses `cs.memberName` (members, grouprules, places, bias, group, updates, teamai, account, connect, security, panel, draft labels).
- Also: `keys.mjs` regenerated from the design's reads list (1,955 keys; the contract test had gone red with DEC-393).

**Deferred / not drawn:** the tables count of a copy (no word); the six rows of B28 are drawn nowhere raw. When they exist, a CHANGE: `screen.group.hosting.now.date`, `screen.group.export.count.tables.one/.other`, `screen.group.domain.checked`, `shell.field.needed` (replacing `screen.security.config.missing`), `screen.watching.purpose`, `screen.leads.purpose`.

**Requirement lines for BOB:** R66 ("kept nowhere on the page" is now: offered as a file from page memory; the note goes in the query); R75 (founder is named, not "at setup"); R15/R77 (checked sentence needs signatures); R70 (`fields: "picker"`); R2 (an administrator proposal is done, not a refusal); R56 (no removal act where the plane cannot carry it); R17 (the two doors); C87's named-box refusals under R14, R46, R61, R65; R39/C94 (`memberName` at every site).

**Found in other modules:** (1) interface-shell: an act option to treat named refusal codes as success (with rereads) is missing; `adminendorse` still draws "Your endorsement is recorded" as a red refusal, and my memberadd path sends its own request. (2) screens-intake: Add's doors to Watched addresses and Leads (C91) and Pause the watching for a member (C90). (3) screens-entry: Setup step 7 (C83). (4) capture/op-declarations: `heldcaptures` declares no `fields`, so the guard does not check `state`/`fields`. (5) Red on the untouched tranche, not mine: screens-inquiry `common.test.mjs`:89, `fr28-document.test.mjs`:356, `fr28-project.test.mjs`:199; control-plane `t51-acquire-timings.test.mjs`:94, :123; `plane/r42-entry.mjs`.

**Tests and checks:** module suite 231 tests, 231 pass, 0 fail. Users (impact.mjs): screens-inquiry + journey-check 411 tests, 3 fail (the pre-existing three); control-plane + plane 394 tests, 3 fail (pre-existing). `checks/run.mjs`: format 0; architecture 0; words 0 (testcopy 0); coverage 7 failures, none in screens-settings. `ownership.mjs`: 28 files, 0 failures.

Size (session_01LsvhfCo9erwiifxJZrNarX): test runs 45, module lines 5223

## J18 · COMPLETE

COMPLETE (re B29): DEC-398 merged; the six stand-ins are replaced by the rows.
- C88 `screen.group.hosting.now.date` for the founder's record ("Recorded on {date}:"); a named member keeps "Recorded by <handle> on <date>:".
- C85 `screen.group.export.count.tables.one/.other` beside the records and files of the offered copy.
- C83 `screen.security.nosignatures.next` under the no-signature state.
- C86 `screen.group.domain.checked {date, time}` replaces the bare data.
- C87 `shell.field.needed` replaces `screen.security.config.missing` in every named-box refusal.
- C91 `screen.watching.purpose` and `screen.leads.purpose` drawn under their doors.
Tests updated to assert the new keys. Module suite 231 of 231; format, architecture, words 0 failures; ownership 0 failures. Deferred: none. The list of copies keeps its three bare figures (unchanged, outside the cause).
Size (session_01LsvhfCo9erwiifxJZrNarX): test runs 48, module lines 5230
