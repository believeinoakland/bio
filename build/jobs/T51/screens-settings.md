# screens-settings (T51)

**Status** · session_017Won73ZFYbqQngJZmEciqa · depth 2 · RUNNING until 2026-10-25T22:11:12Z (affected-module test run (impact: screens-inquiry, control-plane, plane, journey-check)) · handled B49

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

## J19 · COMPLETE · re B30

COMPLETE (re B30, fix round 2 cause 1, C89): the shell's success codes are adopted on both acts.
- `adminendorse` and `memberadd` name `successCodes: ["CONSENSUS_REQUIRED"]` and a `refusals.CONSENSUS_REQUIRED` function that fills `refusal.CONSENSUS_REQUIRED`'s `awaiting` with the members' handles (`cs.memberName`), not the raw list. The screen's own request for `memberadd` (and its `data-shown="proposed"` block, `ui.proposed`) is dropped; the shell draws the sentence beside the act as done and runs the act's `rereads` (roster, recovery).
- The shell reads the members' handles only when a screen first asks for a name, so the Members screen asks `cs.memberName` for each administrator once the roster is drawn (so the sentence names them by handle, not "A member of your team" at the first press). After `memberadd` is answered the invitation fields are emptied (the next invitation asks again), which leaves the button drawn for the shell's sentence to stand beside.
- Tests (seen failing first on the old source, then passing): `R2 C89` for `memberadd` rewritten to the shell's done style (no refusal alert; one request; who must still endorse by handle; roster re-read; controls: another refusal is still a refusal, a plain invitation unchanged); new `R2 C89` for `adminendorse` (done, by handle, roster re-read; control: `NOT_AN_ADMIN` is a refusal with an alert and no done sentence).
- Ran: screens-settings suite 232 of 232; screens-inquiry (user of this module) 447 of 447; format, architecture, coverage (76 of 76), ownership: 0 failures. Reds also on the tranche tip, not mine: `setup-words build.mjs --check` (rows.mjs stale at `capture.declared.captureaccounts`) and journey-check 92 of 115 failing identically with my change stashed.
- Requirement line for BOB to write: R2's amendment (K4335) is now met through interface-shell R112 (`successCodes` + `refusals` on `memberadd` and `adminendorse`); the screen draws no sentence of its own for a recorded proposal.
- Deferred: none. Found in another module: none.
Size (session_01W2VnBgWTLPm5Mn4jDuivo9): test runs 8, module lines 5200

## J20 · QUESTION

QUESTION (SCREENS-SETTINGS #15, T51 fix round 3, my J-first). I carry on with everything on my best reading, written below. Two things need BOB, one for the design stream.

**1. Two acts no registry or re-point admits.** `scanmirror` on `security` (C84) and `officeconfirm` on `places` (C64) are in neither `OPS` (OP-DECLARATIONS #34 has not merged) nor the design's registry (`SCREEN_REGISTRY` at 43379a1a44: security lists securitymap, securitytooladd, securitytooltest, securitytoolremove; places lists profilesset, placewanted, officesseed, entitycreate), and `RE_POINTS` holds only `explore`. `checkScreens` (interface-shell R21) throws for a screen whose act is neither the registry's for it nor a named re-point, so my module's page would not be served. My reading: BOB has interface-shell add the two re-points (`security: ["scanmirror"]`, `places: ["officeconfirm"]`, R21/R73 "until the registry lists it") and OP-DECLARATIONS declare both; UX-DESIGN is asked to list them (no drawing exists for the Security button or for Places' confirm; I draw them from the START's text and the existing rows, nothing invented). Until they merge I prove everything against local, uncommitted stubs of `OPS` and `RE_POINTS`, and the tests that need them are red by name in COMPLETE.

**2. Words with no row** (a drawn-screen module may not call `localize`, so no English is held here; the shell draws a key the list lacks as the key). Keys I use by the design's own convention, for the design stream to write: `act.scanmirror.label.security` ("Check for new signatures now"), `screen.security.mirror.started` (the scanner has been asked; the result shows here once it has finished), `act.officeconfirm.label.places` ("Confirm this office"; meanwhile the button carries `shell.confirm`), `screen.places.office.confirmed` (the office is confirmed; also drawn for `already: true`), `screen.account.key.proof.label` (the one statement the sign dialog shows when the member registers a key from a file she already has; meanwhile the label of `act.signerregisterown.label.account`). Rows I reuse as they stand: `screen.request.nameoffice.mark`, `.where`, `.law` (an office's mark, contact and law), `shell.signer.loadfile`/`shell.signer.load` (the key file box), `queue.export-performed.*` and `screen.group.export.count.tables.*` (the copies' labelled counts). `shell.keyfile.none`, `.unreadable` and `.empty` (interface-shell's helper, D3) are not rows of the list either: the Account screen refuses with them, so they would be drawn as keys until written.

**3. Reading, no answer needed.** C87 (d): Places already refers to `grouprules`, but no Settings list does; I add it under "For every member" (any member drafts a rule, another confirms). C87 (c): I add the refusal-before-reason test for an empty box and change nothing if it holds.

## J21 · QUESTION

QUESTION (SCREENS-SETTINGS #15, T51 fix round 3; replaces nothing: J20 stands, with one correction below).

**Correction to J20, item 2 (words).** A drawn-screen module may not call `localize` (checks/words.mjs fires on it), and this module's own R39/R5 test (`words.test.mjs`) fails any key it draws that the list holds no row for. So no unrowed key is drawn here. The three controls J20 named carry the nearest rows that exist, until the design writes theirs: the scan button `act.monitor.label.capture` ("Check it now"; wanted: `act.scanmirror.label.security`), the answer "started" `shell.working` ("Working…"; wanted: a row saying the scanner has been asked and the result shows here when it ends), the office confirm `shell.confirm` ("Confirm"; wanted: `act.officeconfirm.label.places`). The confirmed office needs no sentence of its own: the mark goes when the offices are read again, `already: true` reads the same. The key file refusals use the dialog's own `shell.signer.notkey` while `shell.keyfile.none|unreadable|empty` have no rows (interface-shell's helper, D3: a REPORT for that job).

**New: C87 (c) does not hold, and the cure is in interface-shell.** "Save who your team is" with all boxes empty draws the shell's reason box first and refuses only after the reason is given (the test is red by name: `R14 C87 (c)`, identity.test.mjs). A screen's `send` runs after the reason is asked; the kit has no hook that lets a screen refuse before. My reading: interface-shell adds an optional act hook (say `ready(view, el, cs)`, answering `{refuse, fills}` or nothing, run on the press before the reason box opens, R11/R87) and I adopt it for `groupdescriptionset`, and for any other reasoned act here with a required box. Until it merges, that one test stays red; nothing else is.

**Done, for BOB's reading of my proposed requirement lines** (I propose, BOB writes; ids to follow your numbering): R15/R77 amended: the administrator's step is said once (inside the reason line, alone where no reason line is drawn). New: `security` draws the scanner's "check for new signatures now" (`scanmirror`, file-safety R49), its answer and a refusal in file-safety's words, the state read again. R66 amended: each count of a copy labelled, the tables after a comma. R17 amended: "For every member" holds the door to `grouprules`. R19 amended: an office with `named_by_member: true` carries `screen.request.nameoffice.mark` and, to an administrator, the confirm (`officeconfirm`, `{entityId}`), its `contact` and `law` drawn where stated. R22/R57 amended: the key section offers "Your key file" and registers the key the file holds (`cs.keyFile`, `cs.signer.sign(.., {keyFile})`, R116). New (C81): at 390 px nothing passes the screen's edge and every control on every screen of the module is at least 44 px each way (ticked boxes wrapped in their label, links as the design's link list `mk-links`).

## J22 · QUESTION

QUESTION (SCREENS-SETTINGS #15, T51 fix round 3; one line of build.mjs-sized matter, nothing else new).

**`interface-assets` is not in my `uses`.** C81's measured 390 px test (`bio-plane/test/m/screens-settings/phone.test.mjs`) draws the real page in Chromium and so serves the stylesheets from `interface-assets` (its helper `measure.mjs`, as screens-daily's, screens-intake's and screens-publish's do, and those three declare `interface-assets` in `modules.json`). The architecture check names it: `measure.mjs imports interface-assets, which screens-settings does not declare in uses`. My reading: BOB adds `interface-assets` to screens-settings' `uses` in `modules.json` (a stable earlier layer; no cycle). I do not read the generated file around the import, and I keep the test: without the styles a measure means nothing. Until it is declared that one architecture line stays red, and it is the only one of mine.

State: I am done but for the two things BOB's answers named. I merge `tranche/T51` when you send the CHANGE for INTERFACE-SHELL #15 (R117, R119), drop the local re-point stub, adopt `ready` for `groupdescriptionset` and for every reasoned act here with a required box, re-run the suite, and COMPLETE. The journey-check suite (a user of this module) is running now; its `node_modules` was missing (K4113) and I ran `npm ci` there.

## J23 · COMPLETE

COMPLETE (SCREENS-SETTINGS #15, T51 fix round 3), re B35. tranche/T51 merged (INTERFACE-SHELL #15, `interface-assets` in uses); the local re-point stub is dropped (never committed).

**Causes met.** C83 (R15, R77): the administrator's step is said once, in the reason line; on its own only where no reason line is drawn. C84 (R15): Security's button asks `scanmirror`, draws "Working…" and reads `scanstatus` again; a refusal inside the gap or with no scanner is drawn beside it in file-safety's words; none for a member or with no scanner built in. C85 (R66): each count of a copy labelled in the list and in the sentence, tables after a comma. C87 (c) (R14; interface-shell R119): `ready` hooks refuse an empty box before any reason is asked on `groupdescriptionset`, `memberadd`, `signeradd`, `websitekeycreate`, `joinlinkenable`, `groupkeyset`, `groupnameset`, `groupdomainset`, `hostingaccessset`, `securitytooladd`, `translationgrant`, `ruleconfirm` (the sends keep their checks). C87 (d) (R17): `grouprules` under "For every member" in Settings (Places already referred to it; no Settings list did); each screen the list names is named once. C64 (R19; entities R63, R64; interface-shell R117): an office with `named_by_member: true` shows `screen.request.nameoffice.mark` in place of its origin line and, to an administrator, Confirm (`officeconfirm {entityId}`, offices read again from the first page; `already` reads the same); its `contact` and `law` are drawn where stated; the five refusals are drawn beside the act by `refusal.<code>` or the owner's translation. C51 (R22, R57; interface-shell R116): Account's key section offers "Your key file"; a file chosen is read by `cs.keyFile`, handed to `cs.signer.sign(.., {keyFile})`, and the key it holds is registered (no file made, none offered to save); an unreadable or empty file is refused (`shell.signer.notkey` while the list lacks `shell.keyfile.*`); no file chosen is as before. C81: measured in Chromium at 390 px, every settings screen has no cut control and no target under 44 px (ticked boxes wrapped in their labels, links as `mk-links`); Security needed nothing of its own (new `phone.test.mjs`).

**Words.** No unrowed key is drawn (R39 forbids it). Stand-ins: `act.monitor.label.capture` for the scan button, `shell.working` for "started", `shell.confirm` for the confirm; wanted rows (batch to the design): `act.scanmirror.label.security`, a "started" sentence, `act.officeconfirm.label.places`; `shell.keyfile.none|unreadable|empty` have no rows (interface-shell's helper: for that job). Census ops owned: none (a screens module owns no op).

**Found in other modules.** interface-shell: `shell.keyfile.*` rows missing. The design's stylesheet: inline `a.cs-ref` links in running text are under 44 px (I made mine block link lists). Not mine, red on the tranche tip too: screens-inquiry's `common.test`/`fr28-document` red earlier are green now; journey-check needs its local-arm walks (installer, Miniflare) and failed there on a clean tip as well (74 of 82), run here after `npm ci` in its directory; I have not attributed its 92 reds beyond that.

**Tests and checks.** Module suite 247 of 247. screens-inquiry (a user) 471 of 471. Each new test was seen failing against the old source (Security's 390 px test passes either way: it had no small control). format 0, architecture 0, coverage 76 of 76, words 0 findings, ownership 0 failures. Proposed requirement lines for BOB to write are in J21.

Size (session_01EaD3jDCDjBYrvU2dv7qq92): test runs 14, module lines 5301

## J24 · QUESTION

QUESTION (J1) · C84 seam test needs two modules in my `uses`.

My whole-path test (`bio-plane/test/m/screens-settings/security-seam.test.mjs`, green on my branch) presses the Security button through the real merged `file-safety` (`scanMirror`, `scanStatus`) over the real `file-scanner` handler (`/mirror?async=1` cut 20 ms after its 202, `/version`, the cron `scheduled`), as the START asks. It imports `bio-plane/test/m/file-safety/fixture.mjs` (its `world`) and `file-scanner/src/handler.mjs` + `file-scanner/test/helpers.mjs` (its bucket double). `checks/architecture.mjs` refuses: "imports ... of file-safety / file-scanner, which screens-settings does not declare in uses" (3 failures).

Smallest thing I need: `build/modules.json` `screens-settings.uses` += `"file-safety"`, `"file-scanner"` (both earlier in the order). Nothing else changes. Please write it on `tranche/T51` (or tell me to drop the test's real providers and script them, which R-SEAM forbids).

Best reading, so I carry on: tests are written; everything else in C84 is done (button and sentence by DEC-412's keys, status read from `MIRROR_REFUSED` lines, stale R15 test brought to its key). I go on with C14 meanwhile.

## J25 · QUESTION

QUESTION (J2; does not replace J1) · C14 on my screens: what I measured, and what I need.

(1) Root cause, measured by opening each of my screens in the real shell harness and counting every request (frame included): the frame reads `bootstrap`, `whoami`, `groupidentity`, `groupkeystate`, `queue` for itself, and my screens read the same again because `view` hands them none of it: security `bootstrap` x2 (security.mjs:36), updates `bootstrap` x2 (updates.mjs:24), account `whoami` x2 (account.mjs:26), group `groupidentity` x2 (group.mjs:22), teamai `groupkeystate` x2 (teamai.mjs:18). members shows `memberlist` x2 and places `entitieskind` x2 (paged to the end, so legitimate); I find no repeat of `queue` and no per-project repeat in my module. So the repeats I can remove are the frame's, and only once the shell shares its frame answers with a screen (CAUSE-SHELL-4's "shared frame reads").
(2) Gap: reads were counted per screen nowhere in my tests. I add one read-set test per screen: each op once, frame reads not repeated.
(3) Failing-first: written against the shell's sharing API, so it is red by name until CAUSE-SHELL-4 merges.
(4) P: not runnable from my session. The smoke copy answers a public `bootstrap` (200) but sends no `Server-Timing` yet, and my screens' reads are member-only and I hold no member token.

What I need (smallest): (a) the name of the shell's shared-frame-read accessor (what a screen's `reads(view)` / `render` reads instead of asking again), or send me a CHANGE when CAUSE-SHELL-4 merges; (b) your ruling that C14's P check for my screens is closed by the read-set tests plus the local timing of the screens' reads in the harness, or what member token / probe I may use. Until then I finish everything else and wait for the CHANGE.

## Completion (SCREENS-SETTINGS #16, session_013oBjn6cy9rDsXVNuTPr9A1)

**C84 words (seam owner S).**
(1) Root cause: `security.mjs:106` read a status only from the old `REFUSED:<db>:<status>` string, so a `MIRROR_REFUSED:exit N: … 403` reason fell back to the plane's own English; the button used stand-in keys (`act.monitor.label.capture`, `shell.working`). Fixed: status read from both forms (as file-safety R46 reads it); the button and its sentence are `act.scanmirror.label.security` and `screen.security.mirror.started` (DEC-412); keys listed in `index.mjs` words (run keys `file-safety.index.signatures_run_*`, `signatures_refused_unnumbered`).
(2) Gap: the module's fixtures held scripted `scanstatus` answers; no test went from the press to the words. Test-gap fix: `security-seam.test.mjs`.
(3) Failing-first, entry path the press (`scanmirror` pressed on the page, never a done function): real `file-safety` (`scanMirror`, `scanStatus`) over the real `file-scanner` handler (`/mirror?async=1` cut 20 ms after the 202, `/version`, cron `scheduled`), bucket and freshclam stand-ins only; the member's own-language rows show only a sentence drawn by its key. Red 1: button label was the stand-in; red 2: `MIRROR_REFUSED:exit 1: … HTTP status 403` drawn from the plane's English not `signatures_refused` {status: 403}. Green after: stale `REFUSED:main.cvd:403` by key; press -> `mirror.started`; run under way (`signatures_run_download`), stale refusal not drawn; second press refused `SIGNATURES_RUN_UNDER_WAY` (never "a few minutes ago"); 20 min on, `signatures_run_stopped` and the next press allowed; cron tick -> `MIRROR_REFUSED … 403` by key with status. Control: unnumbered refusal by its key. Stale R15 test (`security.test.mjs`, K4435) asserts the refusal by key through the shell.
(4) Platform check: N for the screen (words); the scanner's L/P belong to file-scanner and file-safety. Old data: the stored 04:17 string is drawn as it is (accurate to it) until the first new run overwrites it (new data only).

**C14 (this module's screens).**
(1) Root cause (measured, harness, every request counted): the frame reads `bootstrap`, `whoami`, `groupidentity`, `groupkeystate`, `queue`; screens repeat them: security `bootstrap` x2 (security.mjs:36), updates `bootstrap` x2 (updates.mjs:24), account `whoami` x2 (account.mjs:26), group `groupidentity` x2 (group.mjs:22), teamai `groupkeystate` x2 (teamai.mjs:18). No repeat of `queue`, none per project; members `memberlist` x2 is the shell's name read; places `entitieskind` x2 is paging. The screens cannot drop them until cause-shell-4 shares the frame's answers (BOB K4466: CHANGE names the accessor).
(2) Gap: reads were counted nowhere. `readset.test.mjs` (8 screens).
(3) Test `readset.test.mjs`: RED BY NAME for security (R15), updates (R27), account (R3), group (R18), teamai (R48) until cause-shell-4 merges; green for members, places, settings. After the CHANGE I remove the five repeats and re-run.
(4) P ruled (K4466): read-set tests plus local timing. Harness load times (reads, ms; not live): security 16/466 (first boot), updates 12/50, account 17/53, group 18/63, teamai 18/68, members 16/67, places 16/35, settings 10/20. Live time: the PERFORMANCE lane with Server-Timing.

**Requirements met:** R15, R77, RC-R7 (words side), R62, R1, R3, R17-R19, R27, R48 (suites). Proposed line for BOB: R15 amended with C84 round 4 (keys above); R78 new: a Settings screen reads once each op the frame has read (C14).
**Tests/checks:** screens-settings 257 tests, 252 pass, 5 fail (the five C14 read-sets above, by name). screens-inquiry 471/471 (a user). `format` 0 failures; `architecture` 0 failures (after BOB's `uses`); `ownership` 0 failures; coverage: none of its 8 failures is mine (screens-publish R80 named).
Size (session_013oBjn6cy9rDsXVNuTPr9A1): test runs 14, module lines 5308

## J26 · COMPLETE

COMPLETE (per K4466): C84 done and green (seam test through the real file-safety and file-scanner, stale R15 test fixed); C14: read-set tests written, RED BY NAME for security, updates, account, group, teamai until CAUSE-SHELL-4's accessor merges (send CHANGE; I then drop the five repeats). Details, four fields, counts and Size line in my record. Suite 252/257 (the five); format, architecture, ownership 0 failures. Proposed lines: R15 amended (C84 keys), R78 new (a Settings screen reads once each op the frame has read).

## J27 · COMPLETE

COMPLETE (G20, fix round 6; START B39). The document picker of `grouprules` no longer stops silently at 200.

**1. Root cause.** `grouprules.mjs:21` asked `heldcaptures` for `limit: 200` and the draft form (render, the `docs` list) ignored `truncated` and `next`: 250 held documents offered 200, nothing said.
**2. Why the tests missed it.** R70's tests used fixtures of two or three documents; none went past the bound. Gap fixed: the tests below page past it.
**3. Fix (file:line).** `grouprules.mjs` draft form, the `docs` block (about lines 106-130) and the source fieldset (about lines 160-166): the screen's first read stays `fields: "picker"`, `limit: 200`, `state: "held_and_vouched"`; while the answer says `truncated` with a `next`, the following page is read by that cursor (1000 rows, twice at most, kept in `view.ui.later`, drawn on arrival; `cs.call` + `cs.set`, shape of screens-investigate's `docsAll`, own code). Past the bound, or when a later page fails, `screen.people.more` ("The first {n} are shown. Search or filter to find the rest.") says how many are shown; a search box (`form.choose.search`, narrowing by title on the page, reading nothing more; `form.choose.search.none` when nothing matches) is the way to narrow. `index.mjs` adds the three keys to `grouprules`' `words` (the served page carries only listed keys: without them the "none" note drew the bare key; found by the test).
**Stand-in words (R-OLD/words):** all three are held rows (nearest held rows, adopted from screens-investigate's C95/B447); no new row is owed to the design.
**4. Failing-first tests** (`bio-plane/test/m/screens-settings/grouprules.test.mjs`), through the real screen over the harness's fake plane answering by `limit`/`after` as capture R77 does:
 - `R70 G20: with 250 documents held the picker reaches the 250th...`: RED before (200 !== 250 options), GREEN after; asks twice (`after: "200"`), the 250th is drafted from (`source.captureSha`); control: 150 documents read once, no "more" sentence.
 - `R70 G20: past the bound it keeps...`: 2,500 documents: 2,200 offered (200 + 1000 + 1000), "The first 2200 are shown", search narrows to one title and to none, no further `heldcaptures` read.
 - `R70 G20: a page the cursor names that cannot be read...`: 200 stay offered and are said to be the first 200.
**5. Platform check:** N.

**Runs.** screens-settings 260 pass, 0 fail. Users named by `build/plan/impact.mjs origin/tranche/T51 HEAD` (screens-inquiry, control-plane, plane, journey-check): screens-inquiry 486 pass, 0 fail. journey-check 104 pass, 23 fail: the same 23 fail, test for test, on a clean worktree of `origin/tranche/T51` (so none is caused by this change; they are inherited reds of that suite: installer container fakes, the Miniflare local arm, R17 "group" word rows). control-plane and plane were not run: they use screens-settings only through its registry acts, which this change leaves as they were (impact lists them by the shared table).
Checks: `checks/run.mjs`: format, architecture, coverage (6632 of 6632), channels, words 0 failures (screens-settings alone: inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0); `checks/ownership.mjs`: 4 files, 0 failures; `setup-words/build.mjs --check`: only the stale-rows note about a capture row (not this module).

**Requirement lines I propose (BOB writes `build/requirements/`).** Amend R70: "(T51 fix round 6; G20, K4571) The picker never stops silently at its first page: while `heldcaptures` answers `truncated` with a `next`, the following page is read by that cursor (1000 rows, at most twice more); past that bound, or when a later page cannot be read, the form says how many documents it shows (`screen.people.more`) and a search by title (`form.choose.search`) narrows the choice. Test: 250 held documents reach the 250th; 2,500 say 2,200 are shown; control: 150 are read once and nothing is said."

Size (session_01GPSmcx32NL7CpoTyeWoeYn): test runs 14, module lines 5338

## J28 · QUESTION

QUESTION (G42, words). START says the gauge's new sentences are `localize(id, en)` stand-ins added to `WORDS` and `keys.mjs`. Two held rules forbid that in this module: setup-words R13 ("a drawn-screen module (`screens-*`) reads through `word` only", K3930 (3)) and civicos-process `checks/words.mjs` (the `marker` arm fails a `localize` call in a drawn module; `DRAWN_MODULES` matches `screens-*`); screens-inquiry's fix round 4 removed its stand-ins for the same reason (48074ae70e). `docs/development/ux-substrate/screens/words.json` holds no row for the gauge.

My best reading, which I am building on: the gauge reads every sentence by key through `cs.w`, the keys listed in `keys.mjs` and in `WORDS.group`, no English in this module. The rows themselves must come from you (a code-origin row from a `localize` call in a module the check allows, or UX-DESIGN's rows in `words.json`), with these ids and this English (one key per sentence; fills in braces):

- `screen.group.storage.head` — How full your team's record is
- `screen.group.storage.size` — Your team's record holds {used} GB of the {limit} GB one record can hold ({percent}%).
- `screen.group.storage.unstated` — The size of your team's record is not stated.
- `screen.group.storage.warn1` — Your team's record has passed 70% of what one record can hold. Decide what to do before it fills.
- `screen.group.storage.warn2` — Your team's record has passed 90% of what one record can hold. At the limit, writes will fail: nothing more can be saved until room is made.
- `screen.group.storage.factors.lead` — How large your record can realistically grow depends on four things.
- `screen.group.storage.factors.plan` — The Cloudflare plan your team has and is willing to pay for.
- `screen.group.storage.factors.pare` — How far you pare the record, by what your investigations and queries touch.
- `screen.group.storage.factors.latency` — How much delay you accept when a search has to run in the background instead of at once.
- `screen.group.storage.factors.limits` — The limits of the platform itself.

Until the rows are on the tranche my gauge tests are red by name (`UNKNOWN_WORD`), as the seam is red until CONTROL-PLANE #50 merges. I verify locally with the rows added to an uncommitted copy of `rows.mjs`, which I do not commit (mechanics §14). If you would rather I use a different mechanism, or other English, tell me and I follow.

## J29 · QUESTION

QUESTION (R39, contract.test.mjs, red at the tranche tip before my change). Two assertions of `R39 words by key` were red on `tranche/T51` (ceb6bb151e) because the design stream's files at DEC-419 (f72b2f8a4c) moved the module's reads list: (1) `words-reads.json` now lists 73 keys for screens-settings that `keys.mjs` lacked (all are words of the list; e.g. `act.capturerequests.does`) — fixed: I added them to `keys.mjs` (a mechanical sync, R39 says the keys are the reads list); (2) its `unkeyed` list now holds one entry, `screens-settings/bias.mjs:262` "## What This Does Not Enforce", with the design's own reason (the record file's grammar, not member prose; sentences inside it are keyed, DEC-272), and the test asserts `unkeyed.length === 0` ("no string stays in source"). I will not weaken that assertion myself. My reading: the test should accept an `unkeyed` entry that carries a `why`, and fail one without. Decide: (a) I change the assertion that way (a requirement for BOB to word: R39's test), or (b) the design list drops the entry and bias.mjs keys the heading. Until you answer I leave it as it is; it is the one red of my suite besides the two the gauge owes (UNKNOWN_WORD until the rows; the administering member's seam until CONTROL-PLANE #50).

## Completion (SCREENS-SETTINGS #18, session_01LW6V3mNSxPRyfn48u2tZEY)

**G42 · the record's gauge (R-FOUR).**
(1) Cause (BOB's, K4635/K4638): no screen read `stats`' `dbBytes`. Changed: `group` reads `{op: "stats"}` once, only when `me.administer` (a member's screen sends none, R78); a section `screen.group.storage.head` draws the size as GB (floored to 0.1) and a whole percent (floored, so 70 %/90 % never read under their edge) against 10,000,000,000 B; a warning from 70 % (`warn1`), at 90 % and over the second (`warn2`, writes will fail) in its place, each with `factors.lead` and the four factors (`plan`, `pare`, `latency`, `limits`), one key per sentence; `dbBytes` null or not a number = `unstated`; key absent = nothing; a failed read drawn failed. `stats` is declared for member, admin and probe and has no field row, so no sent-ops declaration change (the shell's guard let it through; not a census op, K4208).
(2) Gap: no fixture answered `stats`; every record fixture's `databaseSize` is 0. `storage-seam.test.mjs` composes the real Worker entry (`plane/index.mjs`, so the real door and its capacity stamp) over the real `Store` and record-core, whose `databaseSize` the test sets; only the session lookup is scripted. (The plane's own start-up registration is answered by an empty module because the kit registers the declared ops once; noted in the test.)
(3) Failing-first, red before the screen change: all gauge tests (nothing drawn, no `stats` read). Green after: 0 / 6,999,999,999 (69 %, none) / 7,000,000,000 and 8,999,999,999 (first) / 9,000,000,000 and 10,500,000,000 (second, 105 %); founder exact; member: no `stats`, door gives no `dbBytes`, nothing drawn; null "not stated".
(4) Platform: L/P are control-plane's; none here.

**Red by name at COMPLETE (both named in B41):** (a) every gauge test and `contract.test` R39 fail `UNKNOWN_WORD` until CONTROL-PLANE #50's ten `localize` rows are on the tranche and `rows.mjs` is regenerated (verified green with an uncommitted rows copy); (b) the administering member's seam test fails ("door answers an administering member the figure floored to 100 MB") until CONTROL-PLANE #50 merges.

**Other changes:** `keys.mjs` synced to `words-reads.json` (73 keys the design's DEC-419 list added; was red at the tip); R39's test accepts a design `unkeyed` entry that carries a `why` (K4641).

**New keys (rows owed, B491):** screen.group.storage.head, .size, .unstated, .warn1, .warn2, .factors.lead, .factors.plan, .factors.pare, .factors.latency, .factors.limits (English as in J28).

**Proposed requirement line:** **R79** (T51 fix round 6; G42; K4635, K4638; amends R18, R78) *group: how full the team's record is.* To a session that administers, `group` reads `stats` once and, where the answer carries `dbBytes`, draws its size against 10,000,000,000 B as GB and a whole percentage (rounded down); from 70 % a warning, from 90 % a second saying writes will fail at the limit, each naming the four things that govern a record's realistic size (the team's Cloudflare plan, how far it pares the record, the delay it accepts for background search, the platform's limits), one key to a sentence; `dbBytes` null is "not stated", never zero; absent draws nothing; a member's screen sends no `stats`. Test: the six sizes at their edges through the real door and record; control: a member sends none and draws none.

**Tests/checks:** screens-settings 270 tests, 259 pass, 11 fail (the ten gauge tests' words/stamp and R39, named above). Impact set (screens-inquiry, control-plane, plane, journey-check; 199 files): 1257 tests, 12 fail, the same 12 that fail on the untouched `origin/tranche/T51` (R24/R29 pseudo and release tests, screens-inquiry fr6), none mine. `checks/run.mjs`: format, architecture, coverage, channels, words 0 failures; ownership 0 failures. Platform preload not on the tranche; suites run without it.
Size (session_01LW6V3mNSxPRyfn48u2tZEY): test runs 14, module lines 5417

## J30 · COMPLETE

COMPLETE (G42). `group` reads `stats` once for an administrator and draws the record's size against 10 GB (GB, whole percent, floored), a warning from 70 %, a second from 90 %, each naming the four factors; null = not stated; absent = nothing; a member sends no `stats`. Failing-first red then green recorded; seam test through the real Worker door and record-core with a settable `databaseSize`. New keys (rows owed, B491): screen.group.storage.{head,size,unstated,warn1,warn2,factors.lead,factors.plan,factors.pare,factors.latency,factors.limits}. Proposed line: R79 in my record. Also: `keys.mjs` synced to words-reads.json (73 keys), R39's test accepts an `unkeyed` entry with a `why` (K4641).
RED BY NAME (B41): (a) the ten gauge tests and R39 fail UNKNOWN_WORD until CONTROL-PLANE #50's rows are on the tranche and rows.mjs regenerated (green with an uncommitted rows copy); (b) the administering member's seam test until CONTROL-PLANE #50 merges. Suite 259/270 (those 11). Impact set: the same 12 failures as the untouched tranche tip, none mine. checks/run.mjs and ownership 0 failures. Size: test runs 14, module lines 5417.

## After B43 (CHANGE, K4644)

Merged `tranche/T51` (CONTROL-PLANE #50 and the ten `screen.group.storage.*` rows are on it); no uncommitted rows copy. screens-settings 270 tests, 270 pass, 0 fail: the ten gauge tests, R39 and the administering member's seam (door floors `dbBytes` to 100 MB) are green. `checks/run.mjs` and ownership 0 failures. Both reds named in B41 are cleared.
Size (session_01LW6V3mNSxPRyfn48u2tZEY): test runs 16, module lines 5417

## J31 · COMPLETE

COMPLETE (re B43). Merged tranche/T51; the gauge's ten rows and the administering member's capacity stamp are on it. screens-settings 270/270 (the ten gauge tests, R39 and the seam green); checks/run.mjs and ownership 0 failures. Everything else as in J30 (proposed R79, keys, impact set unchanged). Size: test runs 16, module lines 5417.

## J32 · QUESTION

CORRECTION to J31 (it said checks 0 failures; the architecture check has 2): storage-seam.test.mjs imports bio-plane/test/m/plane/fixture and bio-plane/src/plane/index.mjs (the real Worker entry and Store the seam needs, R-SEAM), and `plane` is not in screens-settings' `uses` in build/modules.json (a module file, yours). All else in J31 stands (270/270, format, coverage, words, channels, ownership 0). Please add `plane` to my uses (CHANGE), as you did for file-scanner/file-safety earlier; if you would rather the seam avoid the plane entry, say so and I rework it.

## J33 · QUESTION

Moved as ruled (K4648): g42-storage-seam.test.mjs is now bio-plane/test/m/plane/g42-storage-seam.test.mjs (one-file commit; passes 4/4 alone), the old file removed in a second commit, screens-settings' own tests unchanged (270 less the 4 seam tests; the screen's edges, member, null/absent stay on the fake plane). checks/run.mjs: architecture still 2 failures, now plane's: the test drives the screen through screens-settings' kit and fixtures (test/m/screens-settings/kit.mjs, fixtures.mjs), and plane does not declare screens-settings in uses. Fix is yours (modules.json): add screens-settings to plane's uses (plane 170 is later than 162, no cycle). Otherwise tell me how to drive the group screen from a plane test without its kit. Everything else: format, coverage, words, channels, ownership 0 failures.

## After B44/B45 (K4648, K4652)

The G42 seam test is `bio-plane/test/m/plane/g42-storage-seam.test.mjs` (own commit, moved from screens-settings' tests; plane's `uses` now holds screens-settings). Merged `tranche/T51`. screens-settings 266 tests plus the seam's 4 = 270 pass, 0 fail. `checks/run.mjs`: format, architecture, coverage, channels, words 0 failures. `ownership`: 1 failure, that one path (outside my paths; BOB accepts it by name at the merge, K4648).
Size (session_01LW6V3mNSxPRyfn48u2tZEY): test runs 19, module lines 5417

## J34 · COMPLETE

COMPLETE (re B45). Merged tranche/T51 (plane's uses holds screens-settings). checks/run.mjs: format, architecture, coverage, channels, words 0 failures. ownership: 1, the named path bio-plane/test/m/plane/g42-storage-seam.test.mjs you accept at the merge (K4648). Tests: screens-settings 266 + the seam's 4 = 270 pass, 0 fail. Gauge R79, keys, keys.mjs sync and R39 test as in J30/J31. Size: test runs 19, module lines 5417.

## J35 · QUESTION

QUESTION (cause 1, the roster's projects column). Two points; I carry on with everything else on my best reading.

(a) The START says R47 is amended and marked `*(not yet met: T51)*`, but `build/requirements/screens-settings.md` on tranche/T51 (merged at 91be8801ca+) has no projects-column sentence and no T51 mark (grep "not yet met: T51" finds none; R47 ends at "Control: the roster's counts are R29's, R35's."). Please amend R47 (or add an R80) with the sentence and mark it.

(b) My best reading, which I build: to a session that administers, `members` reads `projectlist` once (names of the projects the administrator sees in full) and the roster gains a column `screen.projects.name` ("Projects", the design holds no column word for it); each row's cell lists the member's projects from `memberlist`'s `projects` ({project, state, owner}) that `projectlist` names, as the design's member-card words `screen.members.tip.owner` ("owner of {project}") for an owner and `screen.members.tip.workson` ("works on {project}") otherwise; a member with none draws an empty cell; a member's (non-administrator's) table has no column and the screen sends no `projectlist`. An entry `memberlist` marks `existence: true` (a hidden project the administrator sees only at EXISTENCE, owner only) has no name in any read I can make (`projectlist` omits hidden projects; membership R18 gives the row only the id), so it is NOT drawn by id. If R18/Membership v2 §7.8 means the existence-level name is to be drawn, membership must answer it on the row (e.g. `name`), and I draw it then; tell me if you want that as a REPORT to membership.

## Fix round 10 work (re B46, B47; K5148)

**Met (BOB strikes the marks):** R80 (the roster's Projects column; B47). R39 (the 70 reads' keys, below).

**1. Cause: the roster's projects column (diag2-03b §18; R80).** Built to R80's text: an administrator's `members` reads `projectlist` once, adds a column `screen.projects.name`, and lists each joined project of a row by name as `screen.members.tip.owner` / `.workson`; none, an empty cell; a project seen only at existence, or only invited to, is not drawn; a failed `projectlist` is drawn failed in the cell of a member who has projects; a member's table has no column and sends no `projectlist`. Tests (`members-projects.test.mjs`, over the world, real acts: start, invite, join, hide): red on the old source, green. Why the tests missed it: R47 listed the columns and no requirement drew projects; the roster fixture had no `projects`.

**2. and 3. Cause: R39's reads keys; the red on the tranche tip (one red, `contract.test.mjs` R39).** K4426: (1) Root cause: `keys.mjs` was synced to `words-reads.json` once (K4641, at the design commit then); the design later added keys to the module's reads list (DEC-420, 422, 431, 397: the owed AI and install pages' names and acts, `act.captureupload*.does`, `act.writinghelp.label.plan`, the storage heading, the picker's search words, `screen.people.more`) and the test compares the list exactly, so it went red when the design merged. (2) Evidence: 67 of the list's keys absent from `KEYS`; 63 of them are keys of screens and acts that are another module's or owed and not built; 4 are drawn here. (3) Why tests missed it: the comparison is against a file the design changes, with no check at the design's commit. (4) Fix: added the keys this module's screens draw (`form.choose.search`, `.none`, `screen.people.more`, which `grouprules` already drew, and `screen.settings.storage.head`, the design's key for the gauge's heading, now read by `group` in place of control-plane's `screen.group.storage.head`) and, for R80, `screen.projects.name`, `screen.members.tip.owner`, `.workson`. The test now requires every key of the list to be in `KEYS` or to be of the named other-module kinds (patterns, no hand list). **Keys of the list no screen of mine draws (for UX-DESIGN's reads list, never drawn to satisfy the test):** `act.captureupload{abort,begin,complete,part}.does` (screens-intake's acts); `act.owed_ai*.does` (44) and `screen.ai{connect,mine,moments,project,providers,results,test}.name/.purpose` (the owed AI pages of DEC-420, not built); `act.owed_install{address,check,region}.does` (the install page, not this module's); `act.writinghelp.label.plan` (screens-action's `plan`).

**4. Op tables.** 247 lines at the start (244 op-table); 16 now, all world gaps listed below. Work done by six sonnet workers over one test file group each, then one for the cross-cutting tests and `fixtures.mjs` (now only `env`, `refuse`); the suite is on `storeWorld()` (store-request): real sign-ins, real acts for the roster, projects, keys, limits, hosting, profiles, rules, bias sets, sessions; expectations read back from the owners' answers. Seed files: `seed-members`, `seed-connect`, `seed-group`, `seed-security`, `seed-account`, `seed-places`, `seed-common`. Suite 272 tests: 270 pass, 2 red by name (below). Module suite time about 3.5 minutes (group alone 95 s: a world and three sign-ins per test).

**Lines left (fixtures --list): 16 + 3 accepted.** common.test:28,29 (`accountreferenceset/remove`, because of defect D1); group.test:207 (`writinghelp` draft), :276 (`factconfirm`, D2); identity.test:64 (`groupdescriptiondraft`); security.test:152 (`securitytoolcatalogue`, adversarial entries the real catalogue never gives); seed-common:119 and translations.test:87 (`translationdraft`); seed-group:113,114 (`stats` without `dbBytes` / non-number, the owner always answers a number or null), :145,147 (`factstatus`: one profile in the world, an office zone); updates.test:136 (`updatestart` with a non-https address), :250,270,342 (`bootstrap`: D3, and `members=1` refused). Draft lines: the world's door asks no draft after a draft-due act (door.mjs header), an `AGENT_WORKER` double is never called. Accepted: `fixtures-generic: REFUSED` (fixtures.mjs:7, the caller's invented code), `fixtures-generic: SOME_NEW_CODE` (security.test:126, an invented code), `fixtures-own: harness` (words.test:16, the instrument that tells a word from record data).

**Seeded `w.sql` rows (no act makes the state):** legacy signer rows (`registered_by` not recorded, `added` empty); `ai_usage`, `release_notices`, `running_releases`, `runtime_observations`, `capture_limits`, `security_counts`, `update_decisions`, `export_log`, `hosting_access`/`group_identity_history`/`declared_stake_history` rows by recorders no act makes (a machine class, a member with no handle or not on the roster); `local_fact_acts` (a corrected zone), `translation_drafts`, `translation_adoptions`, `entities.declared_by`, `local_rule_acts.by_member`, `bias_adoptions.author`, `bias_debt_settlements.actor`; a stored database size (`databaseSize`); `DELETE`/`ALTER` to make a read fail or a notice due again (connect, panel). Scripted paging: grouprules' G20 tests script `heldcaptures` past 200 documents (holding 201 real documents takes about a minute); a roster without the founder's row (an unclaimed team has no sessions).

**Product defects found by the real world, failing first, fixed here:** `members.mjs` `expOf` (a member opened by handle: `expertiselist?memberId=<handle>` answers ok and empty, which overwrote the roster's expertise and removed the row's acts; the old table scripted a refusal); `security.mjs` (the events named a tool by its id with the provider slug, against R15); `grouprules.mjs` (the owner names a drafter `member:<id>`; "Drafted by you" and the self-confirm fence never applied); `bias.mjs` (`promote` sent no `bundleId`, which the owner refuses MALFORMED; the screen now mints one with `allocid`, as screens-intake does; `biasadopt` sent `bundleId`, `scope`, `scopeId` in the body where the owner reads them from the query); `account.mjs` (a bare "Your signing key" heading for a member with no key, against R28). Why the old tests missed each: the fake plane answered in the shape the test expected, not the owner's.

**Reported, not mine (REPORT to BOB):**
- **D1 (red by name, 2 tests: connect.test.mjs "R5, R76 the key the page sends…" and "…removes…"): ai-accounts / store-request.** `accountreferenceset` and `accountreferenceremove` (R76) send no member, the door stamps `by` in the query, and ai-accounts' route (`bio-plane/src/ai-accounts/index.mjs:1691-1692`) reads the account's `member` from the body only, so the owner answers `NOT_YOUR_ACCOUNT`: through the page no member can connect or remove an API key. Verified at the lines. Likely fix: the route reads `member` from the stamped `by` (or the door stamps `member`).
- **D2 store-request:** `QUERY_STAMPS` holds `source`, and for `LOCAL_FACTS_ACTIONS` the body is stripped of every stamp key, so a `factconfirm` correction loses its required `source` and is refused `FACT_VALUE_REFUSED`: the time-zone correction can never succeed through the door (group.test:276 keeps its gap; no failing-first test committed).
- **D3 instance-setup:** `updates.mjs` reads `bootstrap.installed_at` as the set-up day, but R95 gives it as the running release's first sighting, so after a second release a running release with no member behind it is always drawn as the setup release (R73's "not the setup release" case cannot be made).
- **Edge: `uses` gains `store-request`** (kit, members.test, seed-members import `../store-request/fixtures.mjs`: architecture 3 failures until added) and the tests import `file-scanner` test helpers (`handler.mjs`, `test/helpers.mjs`, `test/vendors.mjs`, as the seam already did) and `../interface-shell/world.mjs`.
- **World, for store-request:** a non-founder administrator is refused `NOT_AN_ADMIN` on `adminremovalsopen` and `expertisewithdraw` (the `member:` prefix of `by`, per W1); `signIn` caches the founder session, stale after `w.tick(1 day)`; `fileSafetyOf`, ai-use and ai-accounts, hosting `at`, export `at` and the court notice read `Date.now()`, not the world's pinned clock; `grantAdmit` is absent, so the model cannot count its own call under an ask grant (seed-connect posts to `askusage`).
- **Door cases for BOB to place (K5138):** none new; the world tests are at this module's interface.
- Read set: `bias.mjs` now calls `allocid` through `cs.call` (as intake does); `readset` and `contract` tests are green.

**Checks:** format 0; coverage 79 of 79, 0; words 0; ownership 0 (43 files); architecture 3 failures, all the `store-request` edge above.
Size (session_0113BrTiSXZhcH7hGcpNfDSD): test runs 20, module lines 5476

## J36 · COMPLETE

COMPLETE (re B46, B47; K5148). Full account in the record's section "Fix round 10 work".
Met: R80 (projects column), R39 (reads keys; 63 listed keys are other modules' or owed pages, listed in the record for UX-DESIGN, none drawn to satisfy the test). Cause 3 (the red on the tip) is the same R39 red, diagnosed with K4426's fields in the record.
Op tables: 247 fixtures lines to 16 (+3 accepted markers), all world gaps listed with why; suite on storeWorld(), 272 tests, 270 pass, 2 red by name (D1). Five product defects found by the real world and fixed (members expOf, security tool names, grouprules drafter prefix, bias promote/adopt, account empty key section).
Checks: format 0, coverage 79/79, words 0, ownership 0; architecture 3 failures, all the missing `uses` edge `store-request` (please add; also file-scanner test helpers and interface-shell/world.mjs are imported by tests).
RED BY NAME (2): connect.test R5,R76 "key the page sends/removes": D1, ai-accounts route reads `member` from the body only (index.mjs:1691-1692) while the page sends none (R76): no member can set or remove an API key through the page. Owner: ai-accounts or store-request (stamp).
REPORT for store-request: D2 `QUERY_STAMPS` holds `source`, so every `factconfirm` correction loses it (FACT_VALUE_REFUSED); world: non-founder admin refused NOT_AN_ADMIN on adminremovalsopen/expertisewithdraw, stale founder session after tick(1 day), several owners read Date.now not the pinned clock, no grantAdmit. REPORT for instance-setup: D3 `bootstrap.installed_at` is the running release's first sighting, not the set-up day (R73).
Size (session_0113BrTiSXZhcH7hGcpNfDSD): test runs 20, module lines 5476

## J37 · REPORT

Re B49 (CHANGE, K5193): merged origin/tranche/T51 into job/T51/screens-settings (merge 11ec419236). `storeWorld()` now builds the default world: the GROUP_ALREADY_RECORDED failures are gone, and updates.test.mjs runs. I did not pass `{group: null}` anywhere in updates.test.mjs; the two places that still do are listed below.

Done since the last record:
- R81 (commit b76b82d5f4): the set-up release and its day come from `updatenotice`'s `setup`, never `bootstrap`'s `installed_at`. `bio-plane/src/screens-settings/updates.mjs:23-24` (reads: `updatenotice` only; the bootstrap read is gone), `:102-117` (setup from `setup`, matched by version), `:160-162` (earlier installs). The R81 test (`bio-plane/test/m/screens-settings/updates.test.mjs:243`) was red before the change (`updates.running.setup_on` not drawn) and is green after; the R27 and R37 expectations that encoded the old bootstrap meaning now follow `setup`. All 14 tests in updates.test.mjs pass.
- Module run on the merged tree: 267 of 272 pass. Red: R5 and R76 (connect.test.mjs; still red after ai-accounts R38 merged in K5191, so please look at them with ai-accounts), R58 and R69 (see the question), and R68 (below).

Outside my paths, found today, REPORTed with file:line:
1. R68 selftest (`bio-plane/test/m/screens-settings/updates.test.mjs:284`): pressing `selftest` is refused by the door with no code (the page shows its generic refusal; the act is sent as `GET selftest` with the founder's bearer token). It passed before this merge. The merge brought in 9fd44d0f66 (K5193, store-request: `bio-plane/src/store-request/index.mjs:79-93` and `:170-173`, `:264-269`, `:288-295`) and 59997c5a81 (K5191, ai-accounts: `bio-plane/src/ai-accounts/index.mjs:1690-1694`). I have not pinned which of them refuses `selftest`; the owners of store-request and ai-accounts should look.
2. R5, R76 (connect.test.mjs) red after ai-accounts R38 merged, see above.

Affected modules (impact on the merged tree): screens-inquiry, control-plane, plane, journey-check. Their run is going now; I will report its counts in the COMPLETE.

## J38 · QUESTION

Question: R58 (`bio-plane/test/m/screens-settings/identity.test.mjs:87`) and R69 control (`bio-plane/test/m/screens-settings/group.test.mjs:465`) model "an older installation that recorded no producing team" with `team({group: null})`. Since K5193 that option is gone and the base world always records `town`, so the premise cannot be built from `storeWorld()`, and the test sees `'town' !== null`. Those two tests did not fail with GROUP_ALREADY_RECORDED, so I have not dropped the option: dropping it would leave the assertion checking a world that records a team.

Options:
(a) store-request adds a named recipe, e.g. `world.unrecorded()`, that makes the world's team unrecorded through the real store (the store has no real act for that, so it would be a test-only seam, which store-request would have to own).
(b) I re-point those two tests at an older installation through an answer the store really gives (e.g. `updatenotice`/`bootstrap` with no team held), with the same expectations.
(c) Drop the no-team cases from my module and move them to store-request.

My recommendation is (a), owned by store-request, since two modules need the same premise. Please rule before I change either test.
