# Draft: T36 L8–L10 requirement wordings (T36-25 … T36-29, T36-43, T36-44) and F1's tail in L11

Drafted for BOB #136 from `plan/current.md` L8–L10 (T36-25, T36-26, T36-27, T36-28, T36-43, T36-44, T36-29), its rule 7 (b) (F1's tail met, K2111) and rule 4, and their sources: N717, N597, N707 (rev. 2 §4), N736, N741, F1 (`plan/draft-T35-security-review.md`, K1874); rulings K1643, K1723, K1739, K1874, K1913, K1929, K1941, K2002, K2004, K2021, K2038, K2111, K231; CASE-CARRIAGE #3's record (`jobs/T35/case-carriage.md`, "Does case-grammar R13 need…"), CASE-CHECKER #6 J2. Each line is ready to paste; ids continue after each file's highest. Measured on `tranche/T36` @ `2a200f7f4b`.

## case-grammar (T36-25) — highest today R21

**R13, amended** (replaces its first line and adds three kinds; the rest of R13 stands):

- **R13** `CASE_FILE_FORMAT` is `bio-case-file/2` (T36; N717, K2004); a `bio-case-file/1` case file is read as written: its manifest names none of the kinds `/2` adds, and a `/1` manifest naming one is a departure. *(not yet met: T36)*
  - **The kinds**, after `calculation`, add:
    - `archive` (the captured bytes, whole, of the archive a carried member document was unpacked from, `case-carriage` R8) and `container` (that member's `container` record as `case-carriage` R8 holds it, `record-grammar`'s canonical JSON naming the member and its archive by SHA-256); each under the ref of the material whose chain it belongs to, the same pair again for that archive's own archive, outward to the outermost; an `archive` or `container` file under a ref that carries no `document` is a departure. The archive's timestamp tokens stay `attestation`. (CASE-CARRIAGE #3; K2004)
    - `criteria` (the edition's criteria rows, as `publication` R72 froze them and its R53 answers them, in canonical JSON), at most once in a case file; absent for an edition whose criteria were not recorded (committed before T35). It lets the rows a case measures against be read offline. (N717; K1941)
  - `caseFileManifestCheck` names each departure from the above as from the rest of R13.

New heading after R21:

*A member's subject* (T36; N717; K2002, K2004)
- **R22** Each `case_roles:` row (one per member finding, `case-authoring` R14) may state `subject_entity`: the entity id the member's pinned bytes state as their own `subject_entity`, or null when they state none. `memberSubjectOf(fm, finding)` answers it from that member's `case_roles:` row, else from its `case_conclusions:` row, else null. It is an optional field of the current case document format, with no new format version, as R10's `working_on` is: a document that states no member's subject answers null for each, and `case-checker` R21 then reads every body's rows of that member's standards (K2002). Pure; never throws. (N717; K2002, K2004) *(not yet met: T36)*

**Uses changes.** None.

**Suggestions.**
- Paths in `caseFilePath`, one spelling (the job's): for instance `materials/<ref>/archives/<archive_sha256>` (kind `archive`), `materials/<ref>/containers/<member_sha256>.json` (kind `container`), `criteria.json` (kind `criteria`). The complete edition (R14) is unchanged: it renders from `materials:`, not from the new kinds, so a test proves a case file with no member and no criteria renders byte-identical.
- A standalone checker handed out before T36 does not know `/2` and reports a `/2` case file as an unknown format, never as recreated; the matching program is the publishing copy's `casechecker` read (`case-checker` R15), as R10's note on `/7` states. `program.mjs` is regenerated at the layer's close (manifest "Generated artifacts").
- Tests: R13 a `/2` manifest with each new kind round-trips; an `archive` under a ref with no `document`, and two `criteria` files, are departures; a `/1` manifest naming `archive` is a departure, and an older `/1` one still passes. R22 a document with `subject_entity` on a `case_roles:` row, one with it only on `case_conclusions:`, one with neither (null).
- **P6:** 2,148 lines (`bio-plane/src/case-grammar/`). R13 and R22 add perhaps +40 to +80.

## publication (T36-26) — highest today R74

**R73, re-worded** (replaces it whole):

- **R73** (F1; K1874; K2111) The door of `op=casedocument` (`publicationDoorOp`) reads a review grant's secret only from the request body's `secret` field (a POST with a JSON body) and never reads the address: a `secret` in the address is not read, compared or hashed, and admits nothing (R1 then answers as with no secret). A request whose address names `secret` or `token` is refused `CREDENTIAL_IN_ADDRESS` before this door runs, by `admission`'s gate (its R20; one site, K231), which the control plane runs first (its R28, R59); this module holds no row for the code and answers no `deprecated` key. As today the door hashes the body's secret, and only its SHA-256 reaches the store as R1's `secretSha`, in the store request's body or a header, never its address; with no secret R1's answer is unchanged. No answer, log line or address this module writes holds a secret or its digest. *(not yet met: T36)*

**R61, its last sentence re-worded** (N597):

- (T36, N597; K1643) `caseRelation` is gone too: this module serves none of `case-tensions`' services and re-exports none of its names, and every reader of a case relation (`affordances`, `case-authoring`, `ratification`) reads `case-tensions.caseRelation` (its R1); the `case-grammar` re-exports are unchanged. *(not yet met: T36)*

**Only if BOB takes choice 2 below** (the criteria read for `case-authoring` R61), a new heading after R74:

*The criteria a preparation would record* (T36; N717; for `case-authoring` R61)
- **R75** `criteriaFor({members, signer, at})` answers `{rows}`, the criteria R72 would record for those members at a commit by `signer` on the UTC day of `at`: `members` each `{bundle_id, version_sha}`, read at those bytes; each row exactly as R72 composes it (one per distinct `(standard, portion, body)`, `binds` from `standards`' bindingness read at that day, `access`, `passages`, the label and access words; a standard `standards` no longer answers stated `"not held"`), with R72's reads made as `signer` (K2002 (2)). R72's commit records the rows this read answers for the edition's roster, so a preparation and its commit cannot disagree but by a change in the record between them. It writes nothing, is no op, and never throws: a member whose bytes cannot be read contributes no row. (N717; K2002) *(not yet met: T36)*

**Uses changes.** `case-tensions`: (T36, N597) `caseRelation` is no longer delegated (R61); `attributionFacts`, `dischargeCaseFlags` and the provider registration stand.

**Suggestions.**
- Found against R73 as it stands: `publication/door.mjs`:91 places `secretSha` in the address of the store's internal request (`http://do/casedocument?…&secretSha=`); the re-worded R73 (and control-plane R59 already) forbid it. The store op (`publication/index.mjs`:2504, `q("secretSha")`) then reads it from the body or a header.
- Expected red from this merge until T36-37: control-plane `converts.test.mjs`:145 (an address secret answering the document with `deprecated`) and the address arms of `t35-door.test.mjs`; publication's own `door.test.mjs`:175–208 arms re-pin to "an address secret admits nothing". Name them as accepted reds at the START.
- Tests: a body secret admits a live grant's reader; an address secret alone answers `NO_CASE_DOCUMENT` for an unsigned edition, carries no `deprecated`, and makes no store request carrying it; the store request carries no `secretSha` in its address; `caseRelation` absent from the module's exports. With R75: the rows equal R72's rows committed for the same roster on the same day, and a member's unreadable bytes give no row.
- **P6:** 3,717 lines (paths `bio-plane/src/deliverer.mjs`, `bio-plane/src/publication/` less `worker.mjs`, which is `public-read`'s). R73 and R61 lower it; R75 is a read over R72's composition, about +20 to +40.

## public-read (T36-27) — highest today R31

New lines after R31:

*What a carried archive member brings with it* (T36; N717; K2004; CASE-CARRIAGE #3)
- **R32** The case file (R23) also carries, for each material it carries whole that is an archive member, the files `publication`'s commit registered for it (its R57, through `case-carriage` R8): its `container` record (kind `container`) and its archive's bytes (kind `archive`), and the same for that archive's archive, outward to the outermost, each read from the published projection only, at the path `case-grammar.caseFilePath` gives it under that material's ref (`case-grammar` R13 as amended). Bytes that do not hash to the digest registered are not carried and are named in `unheld`, as R23's materials are. The archive's timestamp tokens travel as today, as `attestation`. A material that is not a member carries neither file. *(not yet met: T36)*

**Only if BOB adds it to T36-27** (choice 4 below):
- **R33** The case file also carries the edition's criteria as one file of kind `criteria` (`case-grammar` R13): exactly the rows R31 answers as `criteria` for the edition, in `record-grammar`'s canonical JSON, read from the published projection; an edition whose `criteria` is `null` (committed before T35) carries none. *(not yet met: T36)*

**Uses changes.** `case-grammar`: `caseFilePath` and the `/2` format token (its R13), an existing edge.

**Suggestions.**
- `public-read/casefile.mjs`:105–113 carries only a material's document, extracted text and observation; the archive and record are already in `published_shas` (so `op=verify` and the published bytes answer them) and are read from there by kind (CASE-CARRIAGE #3's record). The case file is assembled once, at the edition's last member (R6), so no published case file changes.
- Tests: a case resting on an archive member's document carries its record and archive, and outward for a nested archive; an outsider's three steps (`case-carriage` R8: the manifest, `unzip -p` of the archive at `container.path` against the member's SHA-256, `openssl ts -verify` of the archive's token) run on the built case file; a case with no member gives the same files as before, under `/2`; `case-checker` recreates it (its R2 checks every file).
- **P6:** 3,345 lines (`bio-plane/src/public-read/`, `publication/worker.mjs`, `container.mjs`, `inband.mjs`); +40 to +80.

## case-authoring (T36-28) — highest today R59

New heading after R59:

*The standards a case measures against, judged before it is prepared* (T36; N717; K1723, K1739, K2002, K2004)
- **R60** R14's document states each member's `subject_entity` on its `case_roles:` row (`case-grammar` R22): the `subject_entity` the member's pinned bytes state (the front matter `publication` R72 reads as a criteria row's `body`), or null when they state none; never the inquiry's current subject, another member's, or a value the act's caller sends. (N717; K2002, K2004) *(not yet met: T36)*
- **R61** When R14's text is complete and before it is stored, `publishCase` asks `case-checker.checkStandardsUse` (its R21) over: `text`, that text; `criteria`, the rows `publication.criteriaFor` (its R75) answers for the members at the bytes R13 pins, with the publisher as signer and the act's instant, each row also carrying `captures`, the captures holding its passages (`content`'s read contract, its R45); `materials`, the document's `materials:` rows (`case-grammar` R12); `passages`, its `passages:` rows (`case-grammar` R17), each with the finding that relies on it. An answer `{ok: false}` is refused `STANDARDS_USE_REFUSED` (a new row of this module's table, below), carrying R21's `refusals` as R21 names them (`COPYRIGHTED_TEXT_CARRIED`, `COPYRIGHTED_PASSAGE_UNRELIED`, `BENCHMARK_CALLED_NONCONFORMING`, `MALFORMED`) and its `unjudged`, and nothing is written (R18). A row stated "not held" never refuses; it is answered in `unjudged` beside an act that succeeds. R34's pre-flight answers the refusal as `first` when it is the first `op=publish` would give, else among `blockers`, with each of R21's refusals named to the publisher. (N717, N648; K1723, K1739, K2002) *(not yet met: T36)*

**R29, appended:** (T36; R61) `STANDARDS_USE_REFUSED`, the next free number of the C-136 family (`PUBLISH_ACT_CHECKS`; C-136.2 if free at the START), awaiting promotion's stamp. Its translation is BOB's draft, its member words the UX stream's to revise:

| row | code | translation |
|---|---|---|
| C-136.2 | `STANDARDS_USE_REFUSED` | "This case uses a standard as a published case may not: it would carry the whole text of a standard that is not free to read, quote a passage of one that no finding relies on, or call a finding that rests only on benchmarks \"violated\" or \"nonconforming\". Each is named below. Change the case and prepare it again. Nothing was prepared." |

**Uses changes.** **New edge (rule 4):** `case-checker`: `checkStandardsUse` (its R21), imported from its pure `standards.mjs` (case-checker 99 precedes case-authoring 102 in `modules.json`). `publication`: `criteriaFor` (its R75), an existing edge. `content`: the read contract (its R45) for `captures`, an existing edge. `case-grammar`: `memberSubjectOf` (its R22) for tests, an existing edge.

**Suggestions.**
- `case_roles:` rows are this module's own writer (`document.mjs`:254); `case_conclusions:` rows are `ratification`'s one writer (`caseConclusionRowLines`), so R60 writes the subject on `case_roles:` and touches no `ratification` code.
- R21's codes travel nested under `refusals`; the envelope decorates the top-level `reason` only (`answer-envelope`'s `dec49Decorate`), so the nested `BENCHMARK_CALLED_NONCONFORMING` is never decorated with `conformance`'s C-113.33 row (a distinct condition).
- Tests (CASE-CHECKER #6 J2's case): a benchmark row beside another body's binding row of the same standard, the member's subject stated, and "violated" in its claim: refused, naming the finding and the standard; the same with the subject absent from the document is not refused (every row read, one binds) — the defect R60 closes; a paywalled standard's capture listed `included: true` refused `COPYRIGHTED_TEXT_CARRIED`; a standard not held answered in `unjudged` and published; the pre-flight answering the refusal `first`; nothing written on refusal (R18's rollback arm).
- **P6:** 3,365 lines (`bio-plane/src/case-authoring/`); +80 to +150.

## conformance (T36-43, test only) — highest today R29

**No wording.** R27 reads `standards.bindsAt` "at the act's `when`", and `bindsAt` reads R20 as `standards` R51 amends it (`binds` up to `through` where its answer rests on R20). R27 states no end of a standard's period of its own and implies none, so a determination within a recorded `through` reads `binds` and is accepted, and one after it reads `undetermined` and is refused `STANDARD_NOT_BINDING` as R27 already says ("an `undetermined` bindingness is refused the same"). R3 is untouched: a date after `through` is `undetermined` in force, accepted and stated. The refusal already carries `bindsAt`'s `why` (`conformance/index.mjs`:950), so a member reads "known in force through <date>" or "no end is stated".

**Suggestions.** Tests naming R27 (and R3): a standard with a null `to`, adopted by the body, an `inForceThroughRecord` through D; `determine` `noncompliant` on an act at D accepted (`binds: true`, basis naming the record); at D + 1 refused `STANDARD_NOT_BINDING`, its sentence naming no end stated; the record withdrawn, the act at D refused again; R3 stating `undetermined` beside the standard on the act at D + 1 for a `compliant` outcome. **P6:** 2,083 lines; tests only.

## following (T36-44) — highest today R21

**R21, re-worded** (its signature and first sentence; the rest stands):

- **R21** (K1727; DEC-145 (5); T36, N741, K2038) `policyChanges({after?, since?, limit?, viewer})` answers `{changes: [{watch, standard, address, before: {capture, at}, after: {capture, at}, amendment_held}], cursor}`: one entry per kept capture of R20 whose bytes differ from the capture before it, in order of the later capture's instant after `after`, at most `limit` (default 200, clamped to 1–200), `cursor` the last answered when more follow, else null. With `since` (an instant), only changes whose later capture's instant is at or after `since` are answered, the order, `after`, `limit` and `cursor` unchanged, so a reader reads a window from its start rather than from the oldest change kept; a `since` that is not an instant answers no change and says so (`since_invalid: true`, as `bias` R44's). [Then unchanged: "`amendment_held` is `true` when … in DEC-145 (5)'s words."] *(not yet met: T36)*

**Uses changes.** None.

**Suggestions.** `notice-producers` R13 passes `since` = now less 90 days (T36-32, L11; its wording is that entry's). Tests: 1,200 changes of which the newest 300 fall in the window: with `since`, the 300 are answered across pages and none older; without it, the order as today; an invalid `since` answering none with `since_invalid`. **P6:** 1,320 lines; +10 to +20.

## scheduler (T36-29) — highest today R23

R7 says every cadence is its owner's and this module holds no interval. `file-safety` (L3, merged) offers the four batch services and their stated cadences in words only (its R4 "daily", R35 "hourly", R36 "every few minutes while checks are queued or running"), but no `due`, `wake` or arming notice, and no service at all for the reputation list refresh. BOB chooses (choice 6 below); option B is worded ready to paste, option A is what R7 asks once `file-safety` offers its own.

**Option B (recommended for T36), new heading after R23:**

*The file-safety consumers* (T36; N707, rev. 2 §4; K1913, K1929)
- **R24** Four consumers join the registry (R5) after `dated-waits`, each calling `file-safety` and holding R1–R4, their answers under the keys `filescan`, `filerender`, `filedeeper` and `fileforward` (R2):
  - `file-scan`: `tick(now)` is `scanBatch({at: now})` (its R4). Due at its first firing, then once a day from its last tick (`FILE_SCAN_EVERY_MS` 86,400,000, R4's "daily"), and again at the next firing while its last answer stated `remaining` above 0.
  - `file-render`: `renderBatch({})` (its R12); `file-deeper`: `deeperBatch({})` (its R36). Each is due at every firing, as R6's consumers are, and wants a wake `FILE_SAFETY_POLL_MS` (300,000, R36's "every few minutes") after its tick while its last answer stated work left (`file-render`: `remaining` above 0 or a safe copy queued; `file-deeper`: `queued` or `running` above 0, or either null), else no wake of its own.
  - `file-forward`: `forwardSecurityCounts({from, to})` (its R35), at the first firing at or after each whole UTC hour, `to` the start of that hour and `from` the `to` of its last call that answered `ok` (at its first, and never more than 24 hours back, the start of the hour before), so no period is sent twice; its wake is the next whole UTC hour while its last answer named a log tool (`sent` or `failed` not empty), else none of its own (it is then due at the first firing after the next whole hour, at worst `file-scan`'s daily one).
  A refusal `file-safety` answers (`SCANNER_ABSENT`, `RENDERER_ABSENT`, `FORWARD_PERIOD_INVALID`) is the tick's answer and the consumer keeps its cadence. The instants each consumer keeps (its last tick, its last `to`) survive a restart (R11); with none kept it is due at once. The two intervals are `file-safety`'s stated cadences, carried here by BOB's ruling against R7 until `file-safety` offers its own due and wake (then these read them, and the constants leave). No consumer passes a viewer, a file name or a member to `file-safety`, and none keeps or answers who opened a file (K1892, K1929). (N707; K1913, K1929) *(not yet met: T36)*

**Option A (what R7 asks; needs a `file-safety` share first):**
- **R24** Four consumers join the registry (R5) after `dated-waits`, each calling `file-safety` and holding R1–R4 and R7: `file-scan` (`scanBatch`, its R4, with `scanDue`, `scanWake`), `file-render` (`renderBatch`, its R12, with `renderDue`, `renderWake`), `file-deeper` (`deeperBatch`, its R36, with `deeperDue`, `deeperWake`), `file-forward` (`forwardSecurityCounts`, its R35, with `forwardDue`, `forwardWake`, the owner naming the period), and `reputation-refresh` (`file-safety`'s refresh of each `on` hash-prefix tool's list through `file-scanner` R26, with its due and wake); registered with `file-safety`'s arming notice (R9) so a receipt or a requested check wakes an idle instance. *(not yet met: T37)*

**Left out under either option:** the reputation list refresh (`file-scanner` R26 through `file-safety`). Hard reason: `file-safety` offers no refresh service, and `/provider/refresh` needs the tool spec with credentials, which only `file-safety` holds (its R34's `reputationTool()` is the lookup's, not the refresh's); `file-scanner`'s own daily trigger mirrors ClamAV only (its R6). Until then a hash-prefix tool's list ages to `REPUTATION_LIST_STALE` (24 h, `file-scanner` R16) and `scanStatus` states `reputation_list_age_ms` (`file-safety` R5).

**Uses changes.** `file-safety` (rule 4's edge): `scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts` (its R4, R12, R36, R35); under option A also their due, wake and arming notice. `plane` hands the batch owner (T36-49, "R21's pattern").

**Suggestions.** Under option B a deeper check or safe copy asked on an idle instance waits for the next firing (any consumer's: a capture's `task-drain` arms at once, `capture` R44; at worst `file-scan`'s daily wake); to wake it at once, `control-plane` (T36-37), which routes `deepercheck` and `safecopy`, calls `arm` (R4) after an answer `queued` or `running`, as R9 lets a later producer — a share T36-37 does not name. Tests: the probe seam with a stub `file-safety`: `file-scan` once a day and again while `remaining`; `file-deeper` polling every 5 minutes while `running` and stopping when none; `file-forward` sending each hour once, no period twice after a refused call, nothing older than 24 hours; R15 holding when every consumer answers no work and no log tool is on (only `file-scan`'s daily wake stays). **P6:** 657 lines; +80 to +150.

## F1's tail in L11 (rule 7 (b); K2111)

One code, one site (K231): admission's gate refuses the query form for every op; control-plane runs it first; publication's door no longer reads the address (its R73 above). Admission R20 already names the code as the deprecation; it becomes a refusal row in admission's own C-38 family.

### admission (T36-36's share) — highest today R22

**R20, re-worded** (replaces it whole):

- **R20** (F1; K1874; K2111) A credential travels in a request's header or body, never in an address. `presentedCredential({req, url, body})` answers `{token, secret, inAddress}` and never throws:
  - `token` (a session token, an `aik-` credential, an ask's grant or a binding token) is read from the `Authorization` header when it is exactly `Bearer <value>` (the scheme in any case, one space, a value of printable characters with no space); else, for a request with a JSON object body, from its `token` field when that is a non-empty string; never from the address. An `Authorization` header in any other form presents no `token`.
  - `secret` (a review grant's or a template grant's secret, `control-plane` R20, R44) is read from the JSON body's `secret` field; never from the address.
  - `inAddress` is `true` exactly when the request's address names a `token` or a `secret` parameter, whatever its value and whether or not the header or body carries one too.

  A request whose `inAddress` is `true` is refused 400 `CREDENTIAL_IN_ADDRESS` (C-38.10) by this module's gate, which `control-plane` runs directly after R1 (its R28), before any credential is judged, any public op runs or the store is asked: the value is never compared, looked up, passed on or logged, and the refusal names neither it nor its digest (R15). It is the code's one site (K231): `publication`'s door does not answer it (its R73), and no answer carries `deprecated`. Every gate of this module (R5–R13, R16, R19, R21) judges the credential `presentedCredential` answers and no other, and this module places no credential, secret or digest of either in the address of any request it makes, the store's internal requests included. A test sends a sentinel credential by header and by body to one op of each kind (a session's, an `ai` credential's, a binding class's, a grant's door, a review door, a public op) and finds the same admission as before; by the address, alone and beside a header, it finds C-38.10, no request to the store, and the sentinel in no answer and no address of any request the plane makes. *(not yet met: T36)*

**R14, appended:** (T36; F1, K2111) It also holds `CREDENTIAL_IN_ADDRESS` (R20; C-38.10, the next free C-38 number), with its test, awaiting promotion's stamp. Its translation is BOB's draft, its member words the UX stream's to revise:

| row | code | translation |
|---|---|---|
| C-38.10 | `CREDENTIAL_IN_ADDRESS` | "A sign-in credential or a secret was sent in the web address, where it can be kept in logs and browser history. Send it in the request's Authorization header or in its body instead. Nothing was done." |

**Uses changes.** None.

**Suggestions.** `presentedCredential` keeps its shape, so `control-plane`'s and `plane`'s callers are unchanged; `CREDENTIAL_IN_ADDRESS` stays exported as the row's code. C-38.10 is not among R22's counted kinds (a malformed request, not a refused key, link or limit); counting it would be a change of R22. Tests re-pin `t35.test.mjs`:56 and every arm that expects `deprecated`. **P6:** 1,260 lines; small.

### control-plane (T36-37's share) — highest today R59

**R59, re-worded** (replaces it whole):

- **R59** (F1; K1874; N703; K2111) The door reads every credential it uses through `admission.presentedCredential` (its R20), from the request's header or body and never from its address: the session a group read is asked under (`groupRead`), an ask's grant (the grant's admission), the session the door stamps `session` (R17), and a review grant's or a template grant's secret (R20, R44: from the request body's `secret`, so the review and template doors take a POST with a JSON body). A request whose address names `token` or `secret` is refused 400 `CREDENTIAL_IN_ADDRESS` by `admission`'s gate (its R20, C-38.10), which the door runs directly after `admission` R1 (R28), before any other gate, public op, owner's door or store request, and relays as given; no answer carries `deprecated`. It places no credential, secret or digest of either in the address of any request it makes, the store's internal requests included: a stamped `session`, an ask's `grant` (`store-door` R11's read log) and a review or template grant's `secretSha` reach the store in the request's body or a header, never its query (the store's read of them is `store-door` R9; K1943, K1974). The minting answers of a review grant and a template grant (R20, R44) say the secret is sent in the body of a POST to `op=reviewcopy` or `op=templateread`, never as `&secret=` in an address. For every refusal the door answers a caller, its own, a gate's or an owner's relayed, it calls `admission.securityTally` (its R22) once, after the answer is composed; a tally that fails never changes the answer. A test drives each op the door reads a credential for with a sentinel credential in the header or body, and finds it admitted as before and in no address of any request the plane makes; with the sentinel in the address it finds C-38.10 and no store request. *(not yet met: T36)*

**R28, amended:** "The gates run in one order, which the tests pin: `admission` R1, `admission` R20's refusal of a credential in the address, `admission` R2, R3, then the public ops (R15 among them), …" (the rest unchanged). *(not yet met: T36)*

**Uses changes.** None.

**Suggestions.** Found against R59 as it stands (marked met, K2065): `control-plane/index.mjs`:209 and :645 set `secretSha` in the query of the store's internal request (`inner.searchParams.set("secretSha", …)`, `q.set("secretSha", …)`); R59 already forbids a digest in that address, so the job moves it to a header or the body, read by each owner's store map (see For BOB (6)). `index.mjs`:111–126's `deprecated` wrapper and :671's are deleted. Tests re-pinned: `t35-door.test.mjs`:29, :43; `converts.test.mjs`:145; `plane/body.test.mjs`:39 (plane's, T36-49). **P6:** 3,025 lines; this lowers it slightly.

## The check catalogue (K231)

- `CREDENTIAL_IN_ADDRESS`: no catalogue row holds it today. `publication/door.mjs`:16 and `admission/index.mjs`:202 export it as the deprecation's value, not a refusal; `control-plane` imports admission's. One new row, admission's C-38.10 (C-38.1–C-38.9 are held; C-38.10 is free). `file-scanner/src/providers/net.mjs`:67 uses the same string as a tool-call failure code (an outside tool's address carrying a user name or password), which becomes a verdict's or a tool test's `reason`; it is no catalogue row and a different condition. No collision in the catalogue; see For BOB (4).
- `STANDARDS_USE_REFUSED`: held nowhere. C-136.2: no row anywhere (C-136.1 is case-authoring's `CALCULATION_NOT_DISCLOSED`).
- R21's nested codes: `BENCHMARK_CALLED_NONCONFORMING` is also `conformance`'s row C-113.33 (a determination's words). Case-checker's is no row and travels nested (not decorated); no collision while it stays so.
- `since_invalid` (following) is an answer field, no code.

## Choices made

1. **One site for the address refusal** (K231): admission's gate, run first by control-plane; publication's door stops reading the address rather than refusing by a second row (it cannot import admission, a later module). The entry's "refused by name (R73)" is met by R73 stating the refusal and its site.
2. **The criteria at preparation** come from a new `publication` R75 composing exactly what R72 records, so the pre-flight and the commit read one composition. The other way is `case-authoring` reading `standards` itself (a new edge) and repeating R72's composition.
3. **`subject_entity` on `case_roles:`**, case-authoring's own rows; `case-checker` R21 already reads either row; no format version (R10's precedent for an optional field).
4. **`bio-case-file/2`** for the three kinds, `/1` read as written (stored case files are `/1`; R1's precedent of not changing a stored format's meaning). Keeping `/1` and adding kinds is the other way; an older checker fails on new case files either way.
5. **`STANDARDS_USE_REFUSED` refuses `op=publish`**, not only the pre-flight: DEC-8 (the pre-flight's `first` is exactly `op=publish`'s refusal) and the ladders §6C.4 L2 ("case-checker refuses a publication…") need the act itself to refuse.
6. **Scheduler option B** for T36 (the package's re-scan, safe views and deeper checks otherwise never run unattended in T36's release); option A in T37 with a `file-safety` N-entry.
7. Conformance R27: no wording.

## For BOB

1. **T36-26's "req: none" no longer holds** if you take choice 2 (R75) and R73's re-wording (it changes what the door reads, which was the plan's intent). Both are BOB's (P17); neither changes meaning Bob ruled (F1, K1874, is his: "should NOT travel in web addresses").
2. **`criteria` kind: carried by nobody and checked by nobody in T36.** N717 adds the kind "for offline checking", but T36-27's entry carries only `archive` and `container`, and no T36 entry has `case-checker` run R21 over a case file (its Suggestions: "`checkCaseFile` does not run R21 until the case file carries the criteria rows"). Also R21 needs each row's `captures`, which R72 does not freeze, so even a carried `criteria` file cannot judge `COPYRIGHTED_TEXT_CARRIED` offline unless R72 also freezes `captures` (a publication change; captures' digests would then be public beside the rows). Recommendation: add R33 to T36-27 (small), and file an N-entry for case-checker (R1 runs R21 over `criteria`) with R72 freezing `captures`, for T37.
3. **case-checker's readable specification (its R14) of `/2`** is a held document of `case-checker`'s, which has no T36 entry; the program regenerates by itself at the close, the specification does not. Either a small case-checker entry in L8 or an N-entry; until then `casefilespec` answers `/1` only.
4. **file-scanner's `CREDENTIAL_IN_ADDRESS`** (a tool address with a user name or password) shares the string with the new row; a member could see it as a tool test's `detail`. Distinct conditions want distinct codes (K231); renaming it (`TOOL_ADDRESS_HAS_CREDENTIAL`) at file-scanner's next job is the clean way. BOB's detail.
5. **Scheduler (T36-29) gap, and R7.** `file-safety` offers no due, wake, arming notice or refresh service; option B carries two intervals in `scheduler` against R7 (a ruling, as T33-80's Suggestions foresaw), and the reputation refresh is left out with its hard reason. Recommend option B now and an N-entry for `file-safety` (due, wake, an `onQueued` notice, a reputation refresh service) with `scheduler` re-pointed in T37. An `arm` call from `control-plane` after `deepercheck`/`safecopy` (T36-37) would make a deeper check start within minutes on an idle instance; not in that entry.
6. **F1's tail: found defects in work marked met.** `control-plane/index.mjs`:209, :645 and `publication/door.mjs`:91 put `secretSha` (a secret's digest) in the store's internal request address, which control-plane R59 and publication R73 already forbid. `plane/ask.mjs`:24 still reads a query `token` (unreachable once admission refuses first, but plane's T36-49 entry should drop it). The owners' store maps read `secretSha` with their `q(…)` helper (`publication/index.mjs`:2504, `review`:778–782, `case-authoring`:2355, `filing-templates`:1319–1330, `ratification`:1475, `credentials`:2030); unless `q` already reads the body or a header (to check at the START), moving the digest out of the address touches modules with no T36 entry (review, filing-templates, ratification), so BOB may prefer to keep the digest's move to control-plane's and publication's halves and file an N-entry for the readers.
7. **Possibly Bob's (UX/policy):** (a) whether the refusal should also tell the member that a credential sent in an address may have been recorded and should be replaced (sign out everywhere, a new grant): a member-facing safety message, so the design stream's or Bob's; the drafted translation does not say it. (b) Refusing when `key` or `link` (the website key, join link, group key) sits in an address: admission R17 and R19 today simply do not read them there; extending the refusal to them follows F1's "every credential" but changes those public doors' answers. Not drafted.
8. **Overlap:** `build/plan/draft-T36-L11-reqs.md` (another worker's, in progress) covers T36-36 and T36-37; its admission R20 and control-plane R59 wordings should be this file's or reconciled with it.
9. **Merge-order effect:** publication (L8) stops reading an address secret before control-plane (L11) refuses it; between the two merges an address secret simply admits nothing at the review door (no release is cut between, K2063's reading). Accepted reds named in publication's Suggestions.

Reading not finished: none of the listed sources was skipped; `notice-producers` R13's `since` wording (T36-32, L11) is left to that entry's drafter.

## BOB's review (BOB #136, K2129)

Applied as drafted, with these decisions (BOB's, P17):
1. Choices 1–7 taken: one site for `CREDENTIAL_IN_ADDRESS` (admission C-38.10); publication R75 `criteriaFor`; `subject_entity` on `case_roles:`; `bio-case-file/2`; `STANDARDS_USE_REFUSED` refuses `op=publish`; scheduler **option B** (two intervals carried in scheduler R24 against R7 by this ruling until `file-safety` offers its own due and wake, N762); conformance R27 no wording.
2. public-read R33 (the `criteria` file) joins T36-27. A new entry **T36-51 · case-checker** (L8) joins: R14's specification gains `/2`, and a new R22 runs R21 offline over a carried `criteria` file, a check needing `captures` (which R72 does not freeze) stated unjudged. R72 freezing `captures` is N763 (T37: it changes what a published edition states, weighed at T37's plan with publication's next job; the order, publication's L8 job is already scoped).
3. The secret digest in the store's internal request address (control-plane `index.mjs`:209, :645): moved out of R59 (it is no credential: nothing outside can present it) into N761 for T37, whose readers include `credentials` (L2, closed: the order). Publication's own door and reader (both its module) are fixed in T36 by R73.
4. file-scanner's `CREDENTIAL_IN_ADDRESS` string (a different condition) renamed at its next job: N764 (L1 closed: the order).
5. For BOB 7 (a): the C-38.10 translation gains a protective sentence (K1881), the UX stream free to revise: "If it was sent in a link, treat it as seen by others: sign out everywhere, or ask for a new link." (b) `key` and `link` stay readable in an address: a join link and the website key are made to travel as addresses; F1 named credentials that admit a member or a grant.
6. The L11 worker's admission R20 and control-plane R59 are superseded by this file's.
