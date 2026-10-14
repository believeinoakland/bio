# notice-producers (T47)

**Status** · session_018t33ASVHNxQAjw3VGqUDNT · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R20's R5 sentences (`queue.temporal-expectation-due.*.detail`) begin with `{office}`: "{office} was due to {what} by {date} ({basis})". The duty's obligor is an entity id (`ENT-…`); its name is held by `entities` (`readEntity`), which is not in notice-producers' Uses, and `duties` (`dutiesOf`, `occurrencesOf`) answers no name for it (its trace's `office` is null in its own world).

Options: (a) a `modules.json` edge notice-producers → entities (a lower layer, so legal), `{office}` = the obligor's registered name, else its id; (b) `duties` answers the obligor's name in `dutiesOf` (a duties change, a later tranche); (c) `{office}` the obligor's id until (a) or (b).

Recommendation and my best reading, on which I carry on: (a). Until you answer I build `{office}` from `entities.readEntity` behind the edge only if you add it; otherwise (c).

The other fills, my reading (no answer needed unless you differ): `{duty}` and `{what}` the duty's `performance.act`; `{basis}` the due trace's `citation`, else the adoption's `clause`, else the basis kind; `{reason}` the occurrence's `why` after "possibly overdue: undetermined, because "; R6 `{question}` the inquiry's title, `{what}` each wait's `text`, `{who}` its `description` (inquiry R55: "what, and from whom"), and a wait with no description fills `{who}` with its text; R13 `{policy}` the standard's cite; R14 `{document}` the file's name (`provenance.homeOf`'s path, its last part), `{engine}` the engine, else the tool, `{meanings}` each name's `findingKind` words; R15 `{tool}` as named today.

## J2 · REPORT

A flaw in `duties`, against DEC-198's member text (not a change I can make): R20 fills `queue.temporal-expectation-due.undetermined.detail`'s `{reason}` from the occurrence's `why`, as `duties` R10 answers it ("possibly overdue: undetermined, because …"). That `why` is written for the record, not for a member: on duties' own test world it reads "the due date is uncertain between 2026-02-28 and 2026-03-01 and 2026-03-01 in America/Halifax lies after the first and not after the second (K1444 (i))", so the member sees ISO dates, a zone id and a ruling number. The sentence's `{from}` and `{to}` already name the candidates by `date.daymonth`.

Proposal for a later `duties` entry: `occurrencesOf` answers, beside `why`, a member-facing reason (a code with its words in `words.json`, e.g. "its due date depends on a day the record does not settle"), which notice-producers then reads for `{reason}`. Until then `{reason}` is `why` after its opening words, as J1 stated and K3144 let stand.

## J3 · COMPLETE

**Completion (NOTICE-PRODUCERS #11, T47-51).**

**Entries applied.**
- (N889) R20: R5's, R6's, R13's, R14's and R15's summary and detail are read by key from `words.json` (DEC-198 (3)), the 12 keys held verbatim in `NOTICE_WORDS`. Each item now answers `summary_key`, `detail_key` and `fills`. Every `{date}`, `{from}` and `{to}` is filled by `date.daymonth`, or by `date.daymonthyear` outside the current local year. R12 keeps its plain sentence.
  - R5: `{office}` is the obligor's registered name through `entities.readEntity`, else its id (K3144; the new edge is merged).
  - The other fills are as stated in J1. Two refinements:
    - R6's `{who}` drops a description's own leading "from", since the sentence already says "from".
    - R14's `{document}` is the title of the document the file is held in, else the register path's last part, else the capture. Register paths are snapshot paths, not names.
- (N967) R21: "told before the end" is read from `following.dutyWatchEndAt(duty)`'s `{day, at}`. An occurrence counts as told when the end of its first told day (in its own zone) is at or before `at`, for a keep as for a stop. An answer that is not a `{day, at}` is read as no end. `basis.watch_end` now carries `at`.
- (K3084) `accounts.test.mjs`' setup holds a sign-in token (credentials R70). Its 8 reds are cleared.

**Flaws found and fixed in this module.** An unused helper (`capital`) was removed. Controls were added for gaps that a helper's digest of the unchanged tests found:
- R12 answers no key;
- R14's `{date}` is the local day, never the UTC day, and names its year outside the current year;
- a mislabelled control in `policy.test.mjs` was relabelled.

**Deferred:** none.

**In other modules.**
- J2 (REPORT): `duties`' `why` carries ISO dates, a zone id and a ruling number into R5's `{reason}`.
- Noted for the design stream, not changed here, since the words are theirs and R20 binds:
  - DEC-198's `queue.scan-found.detail` names the engine but not the tool. Its release clause also omits R14's "a hold the built-in scanner alone placed".

**How the reading set was read (mechanics §17).**
- Read whole by me: my requirements, both code files, and the test files I changed: `duties`, `waits`, `words`, `fixture`, the setups of `accounts`, `files` and `policy`, and their changed tests.
- Read by service, for the services my Uses names: `following` R25 and R28 with its code, `duties` R7–R11 and R20, `inquiry` R54–R55, `credentials` R70, `entities` R5, `provenance.homeOf`, `file-safety.findingKind`, and DEC-198 with its 12 words.
- One helper read the remaining tests whole (`checks`, `detectors`, `investigation`, `read`, `security`, `standing`, the rest of `accounts`, `files` and `policy`) and wrote a digest citing file:line.

**Tests.**
- `notice-producers` (all 13 files): 114 tests, 114 pass, 0 fail. The baseline at START was 106 tests, 98 pass, 8 fail.
- Users of `noticeItems`:
  - `queue` (`test/m/queue/`, `conclude-project.test.mjs`): 143 pass, 0 fail.
  - `plane` (`test/m/plane/`, `migrate-released.test.mjs`): 224 tests, 219 pass, 5 fail. The 5 are identical on `origin/tranche/T47` without this job, so they are inherited: `roster` R5, R9 (accepted red 7c), and `accepted` R17, `t42` R38, `t45` R39, `t46` R33. They are not mine.

**Checks.**
- format: 0 failures.
- architecture: 15 files, 79 imports, 0 failures.
- coverage: 21 of 21 live ids, 0 failures.
- ownership: 10 files, 0 failures.
- `checks/run.mjs` over the product: format, architecture and channels 0. Coverage has 26 failures, all other modules' not-yet-met ids (accepted red 5.1); none are notice-producers'.

Size (session_018t33ASVHNxQAjw3VGqUDNT): test runs 16, module lines 1510
