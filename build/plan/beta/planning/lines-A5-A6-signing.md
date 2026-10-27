# Requirement-line draft: A5 ungraded passages at signing (DEC-461) and A6 signing keys in the Queue (DEC-462)

**Status** · DRAFT for BOB · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from ratification, case-authoring, queue-producers and credentials read whole; reviewed by PLANNING. Layer order holds (case-authoring and ratification L8 use case-grammar, case-catalogue, publication, all earlier in L8; queue-producers L11 uses credentials L2 and civil-time L1). PLANNING's notes: (1) A5 changes the signed case document's format (a new block in case-grammar, a new C-41 check in case-catalogue, the statement recorded by publication and carried by public-read and case-import): six layer-8 modules, plus screens-publish and screens-inquiry; the plan carries it as one capability file read at each START (K5434 (4)); (2) A6 also needs one-line amendments to queue R96 and screens-daily R79(e)/R107 (an act per listed key), not drafted here. Bob's open points: none new (A6 §6.1 confirms the reading "one item per member holding new keys").

Fixed for BOB #321's review (L4).


Read whole (P20): dec457-464.md, brief, README.md, ratification, case-authoring, queue-producers, credentials. Single lines only of queue, screens-daily, case-grammar R16-R17, case-disclosures R15, strength. At L4 also read: interface-shell R40 and R97 and all of screens-settings (in parts). Unread modules are only named for their need. No repo file edited.

---------------------------------------------------------------------
## A5 (DEC-461): ungraded passages at signing; the edition says so; the two "Capture" names

**Reading.** A passage is a row of the signed document, one per (finding, ord); its grade is in the matching grading-facts row (`strength` R35). Ungraded = `strength` R3's inert member: no member-authored grade. Nothing in force requires grading before signing, so A5 adds no gate (Bob rejected C): it adds a list and a statement. The statement must be in the signed bytes (`ratification` R13: a commit records only what the signed bytes state; `case-authoring` R22), derived from the same rows as the passages (`case-disclosures` R15).

**Does the statement change what a reader sees? YES.** It is in the signed document, hence the published edition and case file; `public-read` R23 already carries per-finding grading facts and passages. A reader must see which passages were published ungraded. Modules touched, named from neighbours, not read whole: `case-grammar` (the block's spelling and format), `case-catalogue` (a check), `publication` (records the statement), `public-read`, `case-import` (carry it), `screens-publish`, `screens-inquiry` (draw it). The plan carries it as one capability file (Status note 1).

**Why accepted and imported passages are not listed (BOB #321 A5 (5)).** A leg on an accepted or imported finding is another group's finding, graded by that group and published with that edition's frozen grade (`strength` R33). This team has no passage of its own there to grade, so signing cannot ask it to; listing it would offer an act the member cannot do. The edition's statement is therefore about this team's own passages only. Bob has not said otherwise.

**The two "Capture" names.** Neither requirement file holds a member-facing label "Capture"; axis ids (`capture`, `connection`, `testimony`) and "capture grade / ceiling" are technical and stay. Member words are word-list keys (`strength`'s axis words, used by `case-authoring` R6, R14). Two consequences: (1) R14 prints "no bar set on the <axis> axis" into signed bytes and R6's `BELOW_PROJECT_STRENGTH` names the axis, so the new word reaches new editions (old ones are immutable); tests read these by key, never hold English. (2) "How well it could be captured" is the record's ceiling, "Your team's grade for the copy" the member's grade (`strength` R9). A5-R48 below makes this a line, so it is tested and not left to the design.

### 1. Existing lines touched
- `case-authoring` **R34**: the sign step already carries `publish_at` (R75), `open_requests`, `minutes` (R77), each "never a blocker, never `first`, never changes `ready`"; it gains the list of ungraded passages alike. **R14** gains the statement. **R55**'s last bullet ("Never refused because it exists") gains "a passage with no grade". R22, R25, R26 stand; R65 unchanged (no authored field); R6 and `strength` R3 stand (an ungraded passage still adds nothing to a pair).
- `ratification` R2/R3/R40/R42/R18: order unchanged; no refusal because a passage is ungraded (contrast `PHOTO_UNCHECKED`, which does refuse). R8 carries the new check; R13 is the rule used. Nothing is superseded or contradicted.

### 2. Highest ids
`ratification` **R61** (retired: R38). `case-authoring` **R87** (retired: R12, R19-R21, R28, R31, R35-R37, R39, R43-R52, R54, R59, R62, R64, R66, R70, R71, R73). `strength` **R45** (A8's draft adds R46-R47; A5's line is numbered after them, BOB numbers at writing, K5448).

### 3. Draft lines

**case-authoring** (after R87):
- **A5-R88** (T53; DEC-461; amends case-authoring R34) **The signing step lists every passage still ungraded.** [depends on Q-A5-1: as written if Bob says as recommended; else the list also holds a passage the team graded but whose ceiling the record cannot determine.] Before signing, the member is shown the list of every passage of the case, as it would be signed, that the team has not graded: for every member of each finding the publisher can see (load-bearing and supporting), in roster then passage order, the finding, the passage's number, its document title (or null, never an id as its only name, as `screens-inquiry` R116) and its role, with the count. A hunch leg is not listed (hunch debt refuses publication, `case-disclosures` R16). A finding the publisher cannot see adds no row and no count (R33). An accepted or imported finding is not listed (see Reading). The list never blocks, never becomes `first`, never changes `ready` and writes nothing. After a passage is graded the next look no longer lists it. *(not yet met: T53)* Test: three ungraded passages over two findings answer three rows, count 3; grading one and looking again answers two; `ready` and `first` equal with and without rows. Control: all graded answers no rows and count 0; a hunch leg is not listed; an unseen finding adds no row or count; an imported finding adds none.
- **A5-R89** (T53; DEC-461; amends case-authoring R14) **The edition states it was published with them ungraded.** [depends on Q-A5-1, as A5-R88.] The document the owner signs states, from the same rows as A5-R88's list, exactly which passages are ungraded, and carries one fixed plain sentence that the edition was published with these passages not graded by the team (words the UX stream's). With none ungraded, no statement and no sentence. Preparing again after grading one of two lists the other; a replaced preparation (R8) keeps no stale list. *(not yet met: T53)* Test: two ungraded passages store a statement listing exactly them and the sentence, equal to A5-R88's rows. Control: all graded writes neither; a replaced preparation keeps no old list.
- **A5-R90** (T53; DEC-461; amends case-authoring R55) **An ungraded passage never refuses the act.** Preparing, the pre-flight and the ceremony refuse nothing because a passage is ungraded, provided the statement of A5-R89 is in the document. "Sign anyway" is therefore always open. *(not yet met: T53)* Test: a case with an ungraded load-bearing passage prepares and signs. Control: the same fully graded prepares and writes no statement.

**ratification** (after R61):
- **A5-R62** (T53; DEC-461; amends ratification R2, R18, R40, R42) **A signed statement of ungraded passages must be true; a true one is never refused.** Signing, the pre-flight and the scheduled publisher refuse, by the case gate's finding, a document whose statement of ungraded passages disagrees with its own passages and grades (it names a graded passage, or leaves out an ungraded one). This is an integrity check on the document, not a gate on grading: a document whose statement is true is never refused, no passage's being ungraded is by itself a reason to refuse, and a refusal is mended by preparing again, never by grading. A document of an earlier format is not asked. *(not yet met: T53)* Test: a document with one ungraded passage and a statement naming it signs; the same with the statement removed is refused with that finding, identical from the pre-flight; a statement naming a graded passage is refused likewise; preparing again then signs. Control: all graded, no statement, signs; a pre-format document signs; no case is refused for being ungraded alone.
- **A5-R63** (T53; DEC-461; amends ratification R3, R13) **The edition records the statement from the signed bytes.** The edition records the statement as the signed document states it, or "not stated" for an earlier format, never filled in. A passage graded after signing changes neither the signed statement nor a waiting edition's `checked` (R41). *(not yet met: T53)* Test: sign with two ungraded, grade one afterwards, run the scheduled publisher: the edition publishes with the two as signed. Control: a pre-format document's edition records "not stated", not "none".

**strength** (after A8's R46-R47):
- **A5-R48** (T53; DEC-461; amends strength R9, R14, R35) **The two measures carry distinct word keys.** The record's ceiling for a copy ("How well it could be captured") and the team's grade for it ("Your team's grade for the copy") are each read by their own word key everywhere a member is shown, in the answers of this module and in the words `case-authoring` R6 and R14 write into signed bytes; no key serves both and no member-facing key names both "Capture". The English is the design's (Bob's two names until given). Axis ids and "capture grade / ceiling" in requirements and code stay. *(not yet met: T53)* Test: both keys exist and differ (`hasWord`); a pair's answer, R6's refusal and R14's "no bar set" sentence each read the key for the measure they name; no test holds English. Control: an old edition's stored words are unchanged.

### 4. Uses / placement
`case-authoring` uses `case-grammar` (statement writer); `ratification` uses `case-catalogue` and `publication` (existing edges, new items). The check and statement belong to `case-catalogue` and `case-grammar`, the record to `publication`. If BOB refuses a row in `case-catalogue`, A5-R62's check becomes a new row of `ratification`; recommend `case-catalogue`.

### 5. What screens need
Signing step: the A5-R88 list (title, role), a way from each row to that finding's grading fold, "sign anyway", the count. The question points to the grading fold (design). Published page and case file: the statement and the passages. Words: the two names, the statement sentence, the check's translation. The grading fold uses the two names for the two facts (design check).

### Suggestions (how, not requirements)
- **case-authoring**: the list is the sign step's field `ungraded_passages: {rows, count}` in `steps`, built from the rolled-back run of `publishCase` (it reads current bytes); the rows are computed from the `passages:` and `grading_facts:` rows in one read; a row is a passage whose grading-facts row (same finding, ord) holds no member-authored grade (recommended predicate; see Q-A5-1). The pre-flight is one call, not one per finding.
- **case-grammar**: a new block (e.g. `ungraded_passages:`), writer and reader as `passagesLines`/`passagesOf`, rows `{finding, ord, content_id}`; a format number or rule via `caseDocumentFormatFor` so an earlier-format document answers `null` ("not stated"), never "none".
- **case-catalogue**: a new C-41 row (number BOB's; recommended where C-41.16 sits); `ratification` R8 registers it. The refusal code is `GATE_REFUSED` carrying that finding.
- **publication**: `commitCaseEdition` takes the statement as the bytes state it; an edition read answers it (name BOB's).
- **public-read, case-import, screens-publish, screens-inquiry**: carry the rows, accept the new format, draw it.
- A grade changes the finding's version, so an already-prepared unsigned edition is out of date; the screen prepares again before signing.

### 6. Notes (technical, no question)
- No separate "sign anyway" field: the signature over bytes carrying the statement is the consent; a recorded confirmation would be a meaning question and a field on the signing act.
- Accepted work and imported findings are not listed (Reading).

---------------------------------------------------------------------
## A6 (DEC-462): one Queue item per member for new signing keys; the box

**Which module.** `credentials` mints keys (R6 admin-registered; **R9** `signerRegisterOwn`, origin self; R81 the founder's own); it raises no item itself. `queue-producers` **R14** raises the item (`signer-self-registered`, one per active self-registered key, to administrators, not the registrant; feed `signing-keys`, R45); R55 ends it on `credentials` R83 `signerKnown`. `queue` (R96, R12) and `screens-daily` (R79(e), R107) home and draw its acts: drafted separately (see the placeholder below). `membership` and `signatures` raise no key item. The box is `interface-shell` R40 (kept only when the tick `signing.ceremony.keepkey` is ticked; unticked a key file is offered and nothing is kept) and `screens-settings` R57 (1): unticked is already in force; only the sentence is new.

### 1. Existing lines touched
- **queue-producers R14**: "one per key ... keyed `OBLIGATION::signer-self-registered::<key>`" is **superseded as to grain** (one item per member). Kept per key inside the item: recipients, `age` from `added`, the revoke offer, leaving when the key is not `active`. **R55**: kept per key. **R43**: the `signer-self-registered` keys are amended by A6-R57. R8, R45, R49, R52 (the matter is now the member), R24, R11, R13 hold; R36 applies to the dates.
- **credentials** R8/R9/R83/R19 unchanged. "Nothing replaces an earlier key" stays: R9 adds a key beside any earlier one; both are listed while unknown.
- **screens-settings** R57 (1) (the key-making step) gains A6-R82; interface-shell R40 and R97 are unchanged (the unticked behaviour is theirs and is what A6-R82 relies on).

### 2. Highest ids
`queue-producers` **R55** (retired: R3, R15-R22, R26, R27, R29). `credentials` **R83**. `screens-settings` **R81** (R80 also exists).

### 3. Draft lines

**queue-producers** (after R55):
- **A6-R56** (T53; DEC-462; amends queue-producers R14, R55) **One to do for each member, listing each new key.** For each member holding at least one key that is active, self-registered and not yet known, at most 50 members in id order (R4's bound, Bob's), the founder included: one OBLIGATION `signer-self-registered`, keyed by the member (`OBLIGATION::signer-self-registered::<member>`), to the recipients R14 states and nobody else (not the member herself). It lists each such key with its comment and the day it was added, earliest first, at most 20 (Bob's); `basis.keys_more` is the number of such keys beyond the 20 listed (0 when none, never absent), and `age` is from the earliest `added`. For each listed key it offers two options in `queue` R12's option shape, each carrying that key and no other: revoke it, and "I know about this key" (the two acts R14 and R55 name). A key counted only in `keys_more` has no option until acts on the listed ones let it into the list. A key leaves the list when revoked, not active or known (R55); the item leaves when none remains; a key registered later by a member whose item exists joins it; a key registered after all were known raises the item again. *(not yet met: T53)* Test: a member registers two keys: one item for each of two administrators listing both with their `added`, four options; one "I know" removes that key from both and leaves the other (two options); the last clears it for all. Control: a third key joins the same item (same id); an administrator-registered key, a revoked key and the registrant's own feed raise nothing; two members make two items; the founder's key makes an item for the other administrators; 21 keys list 20, `keys_more` is 1 and the 21st has no option; after one of the 20 is known the 21st is listed and `keys_more` is 0.
- **A6-R57** (T53; DEC-462; amends queue-producers R43, R36) **Each key is listed with when it was added, by key words.** The item's summary states the member and how many new keys (one or other form); each key's line is a keyed sentence filled with the comment (its own optional sentence, R43's rule) and `added` as a local day in the group's zone, never UTC; with no zone held the day is undetermined and the line says so without a date (R36). No sentence is composed here (R43). The word is "added" or "registered", not "made" (see Q-A6-2). *(not yet met: T53)* Test: a key added 23:30 local on the 4th, zone known, reads the 4th; with no zone, no date. Control: a key with no comment reads the base line with no blank.

**credentials**: no line needed.

**screens-settings** (after R81):
- **A6-R82** (T53; DEC-462; amends screens-settings R57 (1); relies on interface-shell R40) **The box that keeps the key on this device starts unticked and says what a key not kept comes to.** [depends on Q-A6-1: as written if Bob says as recommended; else the sentence is Bob's exactly and the file is mentioned in a second sentence.] In the key-making step the tick that keeps the key on this device is drawn unticked every time the step opens, never ticked for the member and never remembered; beside it a sentence, read by key, says that a key not kept on this device is gone when the browser closes unless its key file was saved. Making a key with the tick unticked keeps nothing on the device (interface-shell R40). The same box in the signing ceremony carries the same sentence (screens-publish, not read here). *(not yet met: T53)* Test: the key-making step opens with the box unticked and the sentence drawn; ticking it and making a key keeps the key on the device, unticked keeps nothing (storage holds nothing); a member who saved the file is not told her key is gone. Control: reopening the step after ticking draws it unticked again; no test holds the English of the sentence.

**Owed lines (item 3 of the review):** § owed lines: added by PLANNING from a separate draft

### 4. Uses / placement
queue-producers needs nothing new (`signerList` with `known_by` as R83 states; `civil-time.localDay`); no new edge. `queue` R96 and `screens-daily` R79(e)/R107 are amended in the separate draft (it states how the per-key options pass through and are drawn).

### 5. What screens need
The item: member's name, number of new keys, a line for each key (comment, day added), two acts for each key, the existing "Open Members"; it shrinks as keys are known. The key-making step: the box and its sentence (A6-R82).

### Suggestions (how, not requirements)
- **queue-producers**: one `signerList` read serves all members (R49); the founder counts as `admin`; the two acts are `signerset` (to revoked) and `signerknown`, each option carrying `key_b64`; the key list is `basis.keys` entries `{key_b64, comment, added}`; line keys such as `queue.signer-self-registered.key` with `date.daymonth`/`date.daymonthyear` and `civil-time.localDay`. Optional: a `credentials` R84, `signerKnown` taking up to 20 keys at once, if Bob wants one-click "I know about all of these".
- **screens-settings**: the tick is `signing.ceremony.keepkey`, passed as `keep` to `cs.signer.register`; the sentence is a new `screen.account.key.*` key (the design's).
- The item key changes `::<key>` to `::<member>`; items are derived on read, so no migration; a stored decision on an old key id would be orphaned and harmless.

### 6. Notes (technical)
- "One item per member" = per member holding the new keys, for each recipient administrator; the owed line fixes it.
- The only recorded instant is `added`, the registration; the plane cannot know when the browser made the key (the step defers sending). Bounds 50 and 20 are Bob's and kept.

---------------------------------------------------------------------
## Questions for Bob raised in L4

**Q-A5-1. What counts as "still ungraded" at signing?** (meaning, small) Options: A, a passage the team has not graded at all (recommended: it matches the name "Your team's grade for the copy"); B, also a passage the team graded but whose ceiling the record cannot work out. Recommendation: A, because B would list passages the team has graded and tell it to grade again. A5-R88, A5-R89 depend on it.

**Q-A5-2. Should earlier editions be marked retroactively?** Options: A, no; an edition already published stays as signed, and shows "not stated" (recommended, because signed editions never change); B, add a note to older editions saying whether they had ungraded passages. Recommendation: A.

**Q-A6-1. The sentence beside the box.** You asked for "a key not kept is gone when the browser closes". But when the box is unticked the page also offers the member a key file to save, and a member who saves it has not lost the key. Options: A, the sentence says it is gone unless the key file was saved (recommended, so it is never false); B, your sentence exactly, with the key file mentioned in a second sentence. Recommendation: A. A6-R82 depends on it.

**Q-A6-2. What does "when it was made" mean?** (small) The record knows only when the key was added to Civicsmith, not when the browser made it. Options: A, show "added" with that day (recommended); B, have the browser report a making time (a member's claim, not a fact the record can check). Recommendation: A. A6-R57 depends on it.
