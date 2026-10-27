# Requirement-line draft: A5 ungraded passages at signing (DEC-461) and A6 signing keys in the Queue (DEC-462)

**Status** · DRAFT for BOB · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from ratification, case-authoring, queue-producers and credentials read whole; reviewed by PLANNING. Layer order holds (case-authoring and ratification L8 use case-grammar, case-catalogue, publication, all earlier in L8; queue-producers L11 uses credentials L2 and civil-time L1). PLANNING's notes: (1) A5 changes the signed case document's format (a new block in case-grammar, a new C-41 check in case-catalogue, the statement recorded by publication and carried by public-read and case-import): six layer-8 modules, plus screens-publish and screens-inquiry; the plan carries it as one capability file read at each START (K5434 (4)); (2) A6 also needs one-line amendments to queue R96 and screens-daily R79(e)/R107 (an act per listed key), not drafted here. Bob's open points: none new (A6 §6.1 confirms the reading "one item per member holding new keys").


Read whole (P20): dec457-464.md, brief, README.md, ratification, case-authoring, queue-producers, credentials. Single lines only of queue, screens-daily, screens-settings, interface-shell R40, case-grammar R16-R17, case-disclosures R15, strength. Unread modules are only named for their need. No repo file edited.

---------------------------------------------------------------------
## A5 (DEC-461): ungraded passages at signing; the edition says so; the two "Capture" names

**Reading.** A passage is a `passages:` row (`case-grammar` R17), one per (finding, ord); its grade is in the matching `grading_facts:` row (`strength.gradingFacts`, its R35). Ungraded = `strength` R3's inert member: no member-authored grade. Nothing in force requires grading before signing, so A5 adds no gate (Bob rejected C): it adds a list and a statement. The statement must be in the signed bytes (`ratification` R13: a commit records only what the signed bytes state; `case-authoring` R22), derived from the same rows as `passages:` (`case-disclosures` R15), so `case-authoring` needs only the block's spelling from `case-grammar`.

**Does the statement change what a reader sees? YES.** It is in the signed document, hence the published edition and case file; `public-read` R23 already carries per-finding grading facts and passages. A reader must see which passages were published ungraded. Needs by module (named from neighbours, not read):
- `case-grammar`: a new block (name BOB's, e.g. `ungraded_passages:`), writer and reader as `passagesLines`/`passagesOf`, rows `{finding, ord, content_id}`; a format number or rule via `caseDocumentFormatFor` so an earlier-format document answers `null` ("not stated"), never "none".
- `case-catalogue` (registered by `ratification` R8): a new C-41 check and row: a document whose rows hold an ungraded leg and whose block does not list exactly those passages is refused at the case gate. Row number BOB's; translation BOB's draft, words the UX stream's.
- `publication`: `commitCaseEdition` records the statement with the edition, from the signed bytes; an edition read answers it (name BOB's).
- `public-read`, `case-import` and any reader of case-document formats: carry the rows, accept the new format. `screens-publish` (published page, signing step) and `screens-inquiry` (the question points to the grading fold): draw it.

**The two "Capture" names: words only; no requirement line.** Neither file holds a member-facing label "Capture"; axis ids (`capture`, `connection`, `testimony`) and "capture grade / ceiling" are technical and stay. Member words are word-list keys (`strength`'s axis words, used by `case-authoring` R6, R14). Two consequences: (1) R14 prints "no bar set on the <axis> axis" into signed bytes and R6's `BELOW_PROJECT_STRENGTH` names the axis, so the new word reaches new editions (old ones are immutable); tests read these by key, never hold English. (2) "How well it could be captured" is the record's ceiling, "Your team's grade for the copy" the member's grade (`strength` R9); the design should check the grading fold uses them for those two facts.

### 1. Existing lines touched
- `case-authoring` **R34**: the sign step already carries `publish_at` (R75), `open_requests`, `minutes` (R77), each "never a blocker, never `first`, never changes `ready`"; it gains `ungraded_passages` alike. **R14** gains the block. **R55**'s last bullet ("Never refused because it exists") gains "a passage with no grade". R22, R25, R26 stand; R65 unchanged (no authored field); R6 and `strength` R3 stand (an ungraded passage still adds nothing to a pair).
- `ratification` R2/R3/R40/R42/R18: order unchanged; no refusal for ungraded passages (contrast `PHOTO_UNCHECKED`, which does refuse). R8 carries the new check; R13 is the rule used. Nothing is superseded or contradicted.

### 2. Highest ids
`ratification` **R61** (retired: R38). `case-authoring` **R87** (retired: R12, R19-R21, R28, R31, R35-R37, R39, R43-R52, R54, R59, R62, R64, R66, R70, R71, R73).

### 3. Draft lines

**case-authoring** (after R87):
- **R88** NEW (amends R34; DEC-461) **The sign step lists every passage still ungraded.** R34's `steps` carries `ungraded_passages: {rows, count}` in the sign step only: one row for each `passages:` row of the document `publishCase` built in its rolled-back run whose `grading_facts:` row (same `finding`, `ord`) holds no member-authored grade, for every member (load-bearing and supporting), in roster then `ord` order, each `{finding, ord, title, role}`, `title` the passage's document title or `null` (never an id as the only name, as `screens-inquiry` R116). A hunch leg is not listed (hunch debt refuses publication, `case-disclosures` R16). A leg of a finding the publisher cannot see is neither listed nor counted (R33). Never a blocker, never `first`, never changes `ready`, writes nothing. After the member grades a passage the next pre-flight no longer lists it (it re-reads current bytes). Test: three ungraded passages over two findings answer three rows, `count` 3; grading one and calling again answers two; `ready` and `first` equal with and without rows. Control: all graded answers `{rows: [], count: 0}`; a hunch leg is not listed; an unseen finding adds no row or count.
- **R89** NEW (amends R14; DEC-461) **The edition states it was published with them ungraded.** `publishCase` writes `case-grammar`'s new block with R88's rows (`{finding, ord, content_id}`), computed from the rows it writes into `grading_facts:` and `passages:` (one read), and one fixed body sentence (words the UX stream's; until given, one plain sentence that the edition was published with these passages not graded by the team). With none ungraded, no block and no sentence. It is in the bytes the owner signs. Test: two ungraded passages store a block listing exactly them and the sentence, equal to R88's rows. Control: all graded writes neither; grading one of two and preparing again lists the other; a replaced preparation (R8) keeps no stale list.
- **R90** NEW (amends R55; DEC-461) **An ungraded passage never refuses the act.** `publishCase`, its pre-flight and the ceremony refuse nothing because a passage is ungraded, provided R89's block states it (the missing statement is `ratification` R62's refusal). Test: a case with an ungraded load-bearing passage prepares; control: the same fully graded prepares and writes no block.

**ratification** (after R61):
- **R62** NEW (DEC-461) **Ungraded passages: never refused when stated, refused when not.** `op=caseratify` (R2), `op=publishat` (R40), the pre-flight (R18) and the scheduled publisher (R42) refuse `GATE_REFUSED` with `case-catalogue`'s new C-41 finding when the document's ungraded-passages block does not list exactly the passages whose `grading_facts:` row holds no grade, and refuse nothing else because a passage is ungraded. A document of an earlier format is not asked. Test: a document with one ungraded passage and its block signs; the same without the block is `GATE_REFUSED` with that finding, identical from the pre-flight; a block naming a graded passage is refused likewise. Control: all graded, no block, signs; a pre-format document signs.
- **R63** NEW (DEC-461; amends R3, R13) **The commit records the statement from the signed bytes.** R3's commit (and `op=publishat`'s / R42's) hands `publication.commitCaseEdition` the statement as the bytes state it; the edition records the rows, or null for an earlier format, never filled. A passage graded after signing (a later version of the finding) changes neither the signed list nor a waiting edition's `checked` (R41). Test: sign with two ungraded, grade one afterwards, run `publishDue`: the edition publishes with the two rows as signed. Control: a pre-format document's edition records null.

### 4. Uses / placement
`case-authoring` uses `case-grammar` (block writer); `ratification` uses `case-catalogue` and `publication.commitCaseEdition` (existing edges, new items). Placement: the check and block belong to `case-catalogue` and `case-grammar`, the record to `publication`. If BOB refuses a C-41 row, R62's check becomes a new C-58 row of `ratification`; recommend `case-catalogue` (where C-41.16 sits).

### 5. What screens need
Signing step: the R88 list (title, role), a way from each row to that finding's grading fold, "sign anyway", the count. Published page and case file: the statement and passages. Words: the two names, the statement sentence, the C-41 translation.

### 6. Open points
1. (technical, BOB's) Predicate: recommend "no member-authored grade", not "any inert leg" (which would list passages the team graded but whose ceiling is undetermined, against the name "Your team's grade for the copy").
2. (technical) Grading creates a new version of the finding, so an already-prepared unsigned edition is out of date; the screen re-prepares before signing (R8 replaces it). R88 reads current bytes so the list is right.
3. (technical) No extra "sign anyway" field: the signature over bytes carrying the statement is the consent. A recorded confirmation would be a meaning question and a field on `caseratify` (R54).
4. (technical) Accepted work and imported findings (another group's pair): recommend not listed.
5. (meaning, only if Bob wants more) Earlier editions are not back-filled (R13).

---------------------------------------------------------------------
## A6 (DEC-462): one Queue item per member for new signing keys; the box

**Which module.** `credentials` mints keys (R6 admin-registered; **R9 `signerRegisterOwn`**, `origin: "self"`; R81 the founder's own); it raises no item itself. `queue-producers` **R14** raises the item (`signer-self-registered`, one per active self-registered key, to administrators and the `admin` credential, not the registrant; feed `signing-keys`, R45); R55 ends it on `credentials` R83 `signerKnown`. `queue` (R96, R12) and `screens-daily` (R79(e), R107) home and draw its acts. `membership` and `signatures` raise no key item (grep). The box is `interface-shell` R40 (kept only when `signing.ceremony.keepkey` is ticked; unticked a key file is offered and nothing is kept) and `screens-settings`: unticked is already in force, so only a sentence is new; no requirement.

### 1. Existing lines touched
- **queue-producers R14**: "one per key ... keyed `OBLIGATION::signer-self-registered::<key>`" is **superseded as to grain** (one item per member). Kept per key inside the item: recipients, `age` from `added`, the revoke offer, leaving when the key is not `active`. **R55**: kept per key. **R43**: the `signer-self-registered` keys (`.summary`, `.summary.comment`, `.summary.unnamed(.comment)`, `.detail`) are amended by R57. R8, R45, R49 (one `signerList` read serves all), R52 (the matter is now the member), R24, R11, R13 hold; R36 applies to the dates.
- **credentials** R8/R9/R83/R19 unchanged (`signerList` gives `member_id`, `added`, `status`, `origin`, `registered_by`, `known_by`). "Nothing replaces an earlier key" stays: R9 adds a key beside any earlier one; both are listed while unknown.

### 2. Highest ids
`queue-producers` **R55** (retired below: R3, R15-R22, R26, R27, R29). `credentials` **R83** (retired: R22-R26, R33-R37, R43, R51, R52, R54-R62, R64, R70).

### 3. Draft lines

**queue-producers** (after R55):
- **R56** NEW (amends R14, R55; DEC-462) **One to do for each member, listing each new key.** For each member holding at least one key `credentials.signerList` answers `active`, `origin: "self"` and with no `known_by`, at most 50 members in id order (R4's bound), the founder counting as `admin`: one OBLIGATION `signer-self-registered`, keyed `OBLIGATION::signer-self-registered::<member>`, to the recipients R14 states and nobody else (not the member herself). `basis.keys` lists each such key `{key_b64, comment, added}`, earliest `added` first, at most 20 (`basis.keys_more` the rest); `age` is from the earliest `added`. For each listed key it offers the two acts R14 and R55 name (revoke, `signerset`; "I know about this key", `signerknown`), each carrying its key (option shape BOB's). Each key leaves the list when revoked, not `active` or known (R55); the item leaves when none remains; a key registered later by a member whose item exists joins it; a key registered after all were known raises the item again. Test: a member registers two keys: one item for each of two administrators listing both with their `added`; one `signerKnown` removes that key from both and leaves the other; the last clears it for all. Control: a third key joins the same item (same key id); an `origin: "admin"` key, a revoked key and the registrant's own feed raise nothing; two members make two items; the founder's key makes an item for the other administrators.
- **R57** NEW (amends R43, R36; DEC-462) **Each key is listed with when it was made, by key words.** The `summary` states the member and, `.one`/`.other`, how many new keys; each key's line is a keyed sentence (names BOB's: `queue.signer-self-registered.key`, the comment as its own optional sentence, R43's rule) filled with the comment and `added` as a local day in the group's zone (`civil-time.localDay`, `date.daymonth`/`date.daymonthyear`), never UTC; with no zone held the day is undetermined and the line says so without a date (R36). No sentence is composed here (R43). Test: a key added 23:30 local on the 4th, zone known, reads the 4th; with no zone, no date. Control: a key with no comment reads the base line with no blank.

**credentials**: no line needed. (Optional, only if BOB wants one-click "I know about all of these": R84, `signerKnown` also takes `keysB64`, at most 20, answered per key.)

### 4. Uses / placement
queue-producers needs nothing new (`signerList` with `known_by` as R83 states; `civil-time.localDay`); no new edge. Placement doubt (BOB): `queue` R96 gives the item `acts: [signerknown]` for one key; with several keys per item `queue` must pass per-key act choices through (its R12 options) and `screens-daily` R79(e)/R107 must draw an act for each listed key. The decision names only queue-producers; these two need one-line amendments, not drafted.

### 5. What screens need
The item: member's name, number of new keys, a line for each key (comment, day made), two acts for each key, the existing "Open Members"; it shrinks as keys are known. The key-making step: box unticked, with a sentence that a key not kept is gone when the browser closes; check against `interface-shell` R40 (unticked offers a key file), so the sentence must not say "gone" to a member who saved the file.

### 6. Open points
1. (meaning, small) "One item per member" = per member holding the new keys, not per recipient administrator; the owed line ("grouping a member's key items into one") fixes it. Confirm only if Bob meant the other.
2. (technical, BOB's) The item key changes `::<key>` to `::<member>`; items are derived on read, so no migration; a stored decision on an old key id would be orphaned and harmless.
3. (technical) "When it was made": the only recorded instant is `added`, the registration. The plane cannot know when the browser made the key (the step defers sending, `defer: true`). Recommend `added`; the design words it "added" or "registered".
4. (technical) Bounds (50 members, 20 keys) are BOB's to set.
