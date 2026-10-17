# screens-publish (T50)

**Status** · session_012WaKzFosNcsr8EvNnZ3p4h · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings I am building on; tell me if any is wrong (J1 — QUESTION).

1. R27, the zone at the first share. `review` R35 puts `zone` on each roster row (member door) and on the recipient's own grant; a draft with no grant yet has no row, so the member's first share has no zone to read. My reading: `reviewgrant` takes the zone from the copy answer (a top-level `zone` if `review` adds one, else any roster row's), and only when neither exists (no row yet) falls back to the `publishpreflight` zone as today, so the first share is not refused for good. With a zone of `null` on a row, or none anywhere, the share is refused with `screen.review-copy.until.nozone` / `.member` in the fold. Better: `review` R35 also answers `zone` at the member copy's top level — a REPORT to you for that module.
2. R35, "Draft the account with the assistant" (`accountpropose`). The op stores a draft and needs a `run` and a non-blank `text` (case-account R1); the screen can supply neither, since the text is the assistant's. My reading: the act sends `{kind: "case_account", framing}` for the case, drawn only when the assistant may run, and every refusal (`BAD_ACCOUNT_DRAFT`, `BAD_ACCOUNT_FRAMING`, `NO_SUCH_ACCOUNT_DRAFT`) is drawn by its key; the draft's text reaches the screen through `accountdrafts` once the assistant has produced it (the remote proof, unbuilt: K3717).
3. R30, the confirmation's explanation. The kit's `cs.act` has no way to name an act's in-place explanation (`act.publish.here.ceremony` in place of `act.publish.does`); nothing in interface-shell R73–R88 adds one. I will swap the two keys' words inside the button's explanation from the screen (a part helper), so the explanation equals the key's word today; if interface-shell later adds an option, the helper becomes a one-line call.

## Completion (T50-34)

**Entries applied** (requirements `build/requirements/screens-publish.md`, K3742; BOB's answer B2 accepted my three readings, K3765):
- **R25** `imported` with no subject is the list: `screen.imported.list` under its `.says`, a row per import from `importedcases` alone (no read per case): the case a reference to its own page, `screen.imported.list.row` with the group, `latest_edition`, the importer's handle (the founder by her handle, never `admin`), the date and the counts, `.row.part` when some recreated in part; a count of `null` is drawn "–", never zero; `screen.imported.list.none` when none; one case's page draws `screen.imported.band` and `screen.imported.from`. `IMPORTED` lists `IMPORT_NO_SUCH_EDITION` as its absence code, so an unknown import is "Nothing is here".
- **R26** one case's page draws "Whose stake this states" (`caseimport.stake.heading`): `case-import.group_fields_label`, the source's identity, stake and `matter_stake` as data (`stake.inmatter`, `stake.set`; an unreadable matter stake `stake.unreadable`); `case-import.group_fields_none` in the fold `caseimport.notrecorded.summary`; `caseimport.stake.unreadable` in the fold `caseimport.unreadable.summary` with the other fields still drawn.
- **R27** `reviewgrant` takes the zone from the copy answer (`review` R35: a top-level `zone`, else a roster row's) and sends `until`; each reader's row and `review-outside` draw the end as `screen.review-outside.until.zone` (date, time and zone as the browser names it: generic name and city); no `publishpreflight` read except for a first share with no row yet (B2); with no zone held the share is refused in the fold `screen.review-copy.until.nozone.summary` (`.nozone` to an administrator, `.nozone.member` to a member), no UTC drawn, nothing shared; a zone-less grant at the reader's door states no end.
- **R28** the ceremony's gates under `ceremony.gate.heading`, one line each: `ceremony.gate.notargets` (a draft naming no finding, said once), else `ceremony.gate.other` with the departure's `says` read by key, never a code or developer text; a draft naming no case is titled `case.draft.untitled`; its line `screen.case-editor.preparedby` with the handle; the rungs read `case.ladder.notyet`; `screen.case-editor.tip.distributed` beneath the ladder.
- **R29** the check's third answer, `published.check.elsewhere` (tested explicitly with its controls).
- **R30** the confirmation before signing is explained by `act.publish.here.ceremony` (a part helper `explained` swaps the two keys' words in the button's explanation: the kit has no option for it; B2); the photo line stays `screen.ceremony.photo.facts`, `.dated` only with a date.
- **R31** a project with no draft draws "What goes in" (`cs.checks` over record data: title, date, finding count), all ticked; `casedraft` sends the project, the ticked ids as `targets`, the scope, no `caseId`/`newCase`; none ticked sends nothing and says `capture.fieldneeded` in place; none concluded draws the fold of R34; a failed `casedrafts` read is drawn failed.
- **R32** `ceremony` opened for a project alone reads `casedrafts`: none draws `screen.ceremony.nothing` and the one door to the case being prepared (`case.links.editor`, kind `case-editor`), sending none of R3's reads; with a draft it draws the newest one's ceremony; a failed read is drawn failed.
- **R33, R34** `published` draws "Corrections and orders" (`screen.published.corrections.heading`) after the timeline and before the people: `.none`, `.some.one`, `.some` with the kind key, undetermined draws only `screen.published.corrections`; "its docket" is the door to the new screen `docket-public` (published frame, no session, `docketpublic` only, no act, `screen.docket-public.back` to the case). `screen.case-editor.noconcluded` is drawn in its fold.
- **R35** "The account" on a drafted case: with the assistant reachable the three framings (time order first) and `accountpropose` (sending `{kind: "case_account", framing}`), its draft as machine work with `.use`/`.notasis`, the flags with `screen.case-editor.account.flagged` and their reason; with or without it the member's own field, `accountdrafts` and a second "Prepare the draft" that saves the account a sentence a line and names the assistant's draft it began as; `refusal.BAD_ACCOUNT` in the fold `screen.case-editor.account.refused.summary`; no act sends the machine draft as the account.
- **R36** `publishedcase` is waited for: the page and its corrections line appear only with the answer; "Check a file you hold" waits for its read by hash and a read that failed or went unanswered is drawn failed (`shell.unread`), never "no" or "elsewhere" (`NOT_PUBLISHED` is still the answer for a file the findings rest on).
- **Plan rule 6**: every sentence by key; the new keys are listed per screen in `keys.mjs` and asserted by the last test of `t50.test.mjs`.

**Fixed in my own module (P8)**: a `publishedcase` read by hash that failed was drawn as the fingerprint being "elsewhere" or absent (R36); an unknown import was not "Nothing is here" (`ABSENT_CODES`); the review copy's roster no longer reads `publishpreflight` for every list.

**Accepted red, by name, until `interface-shell` (T50-27) merges** (seven of my tests: five in `t50.test.mjs`, two in `common.test.mjs`): R88 (the public frame serving `docket-public`; the shell draws it in the working frame today) and R80 (`cs.checks` over `{value, text, on}` options): R31 ×3, R34 ×2, R10 `docket-public` ×2. With the registry as `tranche/T50` now holds it (wizard-scripts merged: `docket-public`, `accountpropose`, `accountdrafts`) and the shell's two features applied locally as stand-ins (not committed), all 112 module tests pass.

**Deferred**: none.

**Reported to BOB (for the design lane and other modules)**: (1) no key holds the findings-count words beside a concluded question in "What goes in"; the row draws title · date · the bare number; (2) no key holds the words "its docket" alone, so `published` links them by matching that English token in `screen.published.corrections` (the whole sentence is the link when the word is translated away): a key for the link text would remove the match; (3) `words-reads.json` for `screens-publish` does not yet list the T50 keys (this module lists them in `keys.mjs`); (4) `casedrafts` rows carry member ids only: the screen reads `updated_by_handle`/`created_by_handle` if the owner adds them, else the viewer's own handle for her own id, else the id (`review`); (5) `reviewcopy`'s top-level `zone` is N1229 (T51) per B2; (6) the placeholder for a count `null` in the imported list is a bare dash glyph.

**Found in other modules**: none beyond (4).

**Tests and checks run** (at the commit below, after merging `tranche/T50` @ 67c0c1fe04):
- `node --test bio-plane/test/m/screens-publish/`: tests 112, pass 112, fail 0 with the shell's two features applied locally; without them 105 pass and the seven named above fail.
- `node checks/format.mjs /home/user/bio`: 171 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio screens-publish`: 20 product files, 37 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio screens-publish`: 36 of 36 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio screens-publish tranche/T50`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0 (3,488 files), channels 0; coverage 25 failures on other modules, none on `screens-publish`.

Size (session_012WaKzFosNcsr8EvNnZ3p4h): test runs 16, module lines 1948

## J2 · COMPLETE

T50-34 is applied: R25–R36 (the imported list and whose stake a case states; the review link's end in the team's zone; plain ceremony and draft words; the check's third answer; the confirmation's own explanation; a project's first case; publish with nothing prepared; "Corrections and orders" and the new `docket-public` screen; "The account"; `publishedcase` awaited), plan rule 6 throughout. Three flaws of my own fixed (a failed hash read drew "no"/"elsewhere"; an unknown import was not "Nothing is here"; the roster read a preflight per list).

Module tests: 112 of 112 with interface-shell's two features applied locally as stand-ins (not committed); without them seven of my tests are red, by name: R88 (`docket-public` in the public frame) and R80 (`cs.checks` over record data), both interface-shell's, red until it merges. The registry from wizard-scripts (merged) already serves `docket-public` and the account acts. Format, architecture, coverage (36 of 36) and ownership: 0 failures; `checks/run.mjs`: none on this module.

For the design lane and others (details in my record): no key for the findings count beside a concluded question or for the link words "its docket"; `words-reads.json` lacks the T50 keys for this module; `casedrafts` rows carry member ids only (I read `*_handle` if added).

## J3 · REPORT

Merged tranche/T50 (wizard-scripts registry) and re-ran: 112 tests, 105 pass; the same seven fail, all on interface-shell not yet merged (R88 docket-public in the public frame, R80 cs.checks over record data), as named in my completion record. Nothing else changed.
