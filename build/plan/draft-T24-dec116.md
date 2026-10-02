# Draft: DEC-116's folds (with DEC-100): the docket, outside responses, withdrawal (T24)

**Status** · DRAFT by a worker for BOB #95, 2026-10-02, on `tranche/T23` @ c2b7341cd8, DEC text from `origin/claude/gallant-brown-zg0wc1` @ 132418b89a (PR #7, not yet on `main`); for BOB's review, then Bob's approval; nothing folded yet. Entry N491 and row B13 (N470) of `plan/next.md`; K943 (no withdrawal act until this work answers it). Canon: `BIO_Publication_v0_1.md` §5D on that branch (RULED 2026-10-01). Each fold restates a ruling Bob has made; only the wording is new. Nothing here is in `build/requirements/` yet, and nothing may be folded before PR #7 reaches `main` (manifest, "Parallel work").

Conventions. A new requirement takes its module's next free id (retired ids never reused). Every new or changed line ends `*(not yet met: T24)*` and cites its DEC. Line counts are of each module's `paths` in `build/modules.json` (the most specific path owns a file, K702), measured on `tranche/T23` @ c2b7341cd8. "Order" means a module uses only earlier modules (P4). Words members or readers see (the warning, labels, the invitation, the stamp's wording) are the UX design stream's and are cited here, never decided.

---

## The ruling

**Ruled (DEC-116, Bob, 2026-10-01: "Q#36: as recommended").**
1. "The docket: dated entries beside each case, each naming the edition it concerns, growing while the signed editions never change. Three shelves: what the group stands behind as accurately listed (vouching that each is what it says, not agreeing with it); "Reactions elsewhere", labelled "Listed by the group. Not evidence. Not endorsed."; and "In our record only", seen by members, never published. Checks are on form, never merit: every entry is dated, attributed, names its edition and has a captured copy with its origin. A docket entry never makes anything evidence: to affect a finding, material is captured, read, made to support it, and a new edition follows."
2. "The required core of the first shelf, each a To-do for the project's manager until done: every response the subject sends; any public statement by the subject the group has captured and linked to the case (a press release counts); a newer edition (quoting its "What changed" statement); a withdrawal; anything the case would have had to disclose at signing, such as an open conflict on a load-bearing finding. Outcomes are optional. Responses from those granted standing join the core."
3. "Outside responses: found by a member pasting a link, by standing watches over known sources, or by the assistant's labelled suggestion under the six guards (DEC-95 (3)); captured with grade and co-archive; linked as responding to a named edition; then a member chooses, with a reason, record only, public, or both. In the record, a contesting response prompts a re-evaluation notice, may become a plan checkpoint, and a threat takes a pressure mark. A public "Reactions elsewhere" entry shows date, source, links to the original and the independent archive's copy, and a short summary marked as the group's words, never the article whole."
4. "A subject's reply naming a private person is listed as received, by date, without its text and with the reason, and the subject is asked to resend it without the name; the resent version is listed whole (the redaction is the subject's own, which the group may accept or decline, DEC-100)."
5. "Standing granted to others is a signed docket entry with a reason, giving exactly the named subject's rights; it is permanent for what the holder has already submitted, and a later withdrawal of standing covers only future submissions."
6. "Any member files to the record; only the project's manager places an entry in public, signing with their registered key in a short step. An entry is taken back by a later entry with a reason, never deleted."
7. "Withdrawal (N470): the manager's signed docket entry naming one edition or all, with a published reason. The edition stays readable under a stamp linked to the notice; the withdrawal is never lifted, and standing behind the case again needs a new edition. It sends re-evaluation notices to everything resting on it (the trigger reevaluation R16 lacked since K943). It never erases: a legally compelled removal has no path here and would be a separate question."
8. "The docket travels by pull: the public page, a feed per case (a page at a fixed address that a reader's own software checks, with no list of readers kept), citing groups' copies turning entries into notices (DEC-101), and the directory reading feeds (DEC-111). Nothing is pushed; CivicOS sends no email. A citing copy that cannot reach the docket says "Could not read the publisher's docket", never that nothing changed. The docket shows its last entry's date."

**Ruled (DEC-100, Bob, 2026-10-01, items 1, 2, 4, 5 as amended).** "the subject named in a case has party-like standing (its responses that reach the group are listed on the public docket). Anyone else may still submit a response; whether it is added to the publicly visible docket is at the group's discretion." "The docket has no sealed entries and no redacted public versions: an entry is public whole, or it is not on the public docket (it may still be held in the group's record)." "a group may grant standing to others besides the named subject." "The group never redacts what others submit; a submitter may send its own redacted version; the group may decline to post any submission that contains redactions, even the named subject's." Item 3: "The group's contacts with the subject after publication are not required to be noted on the docket."

**Owed (DEC-116).** "the docket as a signed public object beside each case (shelves, entries naming an edition, form checks, take-back by a later entry); the required core as manager To-dos; the outside-response path (paste, watch, labelled suggestion; capture and co-archive; link to an edition; the reasoned record/public/both choice; re-evaluation, checkpoint and pressure prompts in the record); the private-name receipt entry and the resubmission invitation; the signed grant of standing; the manager's signing step for public entries; the withdrawal act (signed, final, naming one edition or all; the stamp; reevaluation R16's trigger; answers N470 and BOB's B2); the per-case feed and "Could not read the publisher's docket"; the UX page's question 36 marked ruled."

**Owed (DEC-100).** "nothing to build yet; the docket's design … awaits Bob's ruling." DEC-116 is that ruling, so DEC-100's points are folded with it below (row H5 of `next.md`).

---

## Where the docket goes (P6)

| module | index, layer | lines now (its `paths`) | this fold adds (estimate) |
|---|---|---|---|
| publication | 56, L8 | 3,643 | wording only (R40's reader list) |
| public-read | 57, L8 | 2,242 | ~150 |
| network-notices | 59, L8 | 0 (created by its T23 job; drafted at 1,300–1,900) | wording only (R21) |
| reevaluation | 53, L7 | 2,225 | ~150 |
| queue-producers | 78, L11 | 3,001 | ~150 |
| signatures | 4, L1 | 1,239 | ~20 |
| capture | 28, L3 | 3,448 | none |
| tasks | 77, L11 | 955 | none |
| monitoring | 74, L10 | 3,077 | none |
| ratification | 60, L8 | 3,936 | none |
| a docket home | — | — | ~1,600–2,400 (tables, two-step signing, take-back, withdrawal, standing, core read, public reads, feed, catalogue rows) |

No existing module holds the docket within P6: `publication` would pass 4,000 (3,643 + ~2,000; K1024 split it to keep it under); `ratification` (3,936) and `case-authoring` (3,289) are near the mark; `public-read` owns no table and writes nothing by its R16; `network-notices` would reach ~3,000–4,300 and its purpose (working-on notices) is another; `reevaluation` (layer 7) cannot read `publication`. The docket therefore needs a new product module, which is Bob's decision (last section). The text below drafts it as **`docket`**, layer 8, index 57: directly after `publication`, before `public-read` (Option A below). Every other module's fold is written so that it holds under Option A; Option B's differences are named there.

---

## 1. docket (new module; index 57, layer 8; next free id R1)

Paths `bio-plane/src/docket/`, tests `bio-plane/test/m/docket/`, added to its `modules.json` entry by its own job (K1043's form). No `from`.

**Purpose.** After a case is published, the world responds without changing the case. This module keeps each case's docket: dated entries beside the case, each naming the edition it concerns, on three shelves; any member files to the group's record, and only the case's manager places an entry in public, signed with their registered key. It holds the withdrawal of an edition, grants of standing, and the required core the manager is asked to list, and serves the public shelves and a feed per case for anybody to pull. It sends nothing anywhere, and no entry is ever evidence. (DEC-116; DEC-100; Publication §5D)

**Terms.** The **case** and its **editions** are `publication`'s; an edition named by an entry is a ratified edition number of that case. The **manager** of a case is an owner of its owning project (`membership.isProjectOwner`; DEC-72 clause 5). The **named subject** of an edition is each subject entity of its member findings (`inquiry.subjectEntityOf`, its R43). A **holder** is one to whom a live grant of standing (R10) was made. The shelves are `listed` ("what the group stands behind as accurately listed"), `reactions` ("Reactions elsewhere") and `record` ("In our record only"). A **record entry** is a member's filing on `record`; a **public entry** is a signed entry on `listed` or `reactions`.

**Filing to the record: docketFile({case, edition, kind, from, capture, contests?, proposed, reason, author, viewer})** (`op=docketfile`; member session; mutating)
- **R1** Any joined member of the case's project files a record entry. Refusals, in order, each writing nothing and carrying a catalogue row (DEC-49): a machine or AI credential is `MACHINE_CANNOT_FILE_DOCKET`; a case that is absent, has no ratified edition, or whose project is invisible to `viewer` is `NO_SUCH_CASE`, one answer; `author` not a joined participant (`membership.isJoinedParticipant`) is `DOCKET_NOT_A_PARTICIPANT`; then the form checks, never merit: `edition` not a ratified edition of the case is `DOCKET_NO_EDITION`; `from` absent is `DOCKET_NOT_ATTRIBUTED`; `from: {kind: "subject", entity}` naming no named subject of that edition is `DOCKET_NOT_THE_SUBJECT`; `from: {kind: "holder", grant}` naming no grant live at this instant (R10) is `DOCKET_NO_STANDING`; `capture` not a capture this record holds with its origin locator (`provenance`'s register) is `DOCKET_NO_CAPTURE`; `kind` not one of `response` (from the subject or a holder), `statement` (the subject's public statement elsewhere, a press release included), `reaction` (anyone else) or `outcome` is `DOCKET_KIND_UNKNOWN`; `proposed` not one of `record`, `public`, `both`, or `reason` absent, blank or over 2,000 characters, is `DOCKET_NO_REASON`. Otherwise it records the entry with its instant, `author`, `from`, `capture`, `proposed`, `reason`, `contests` (true only when the member says the response contests the edition) and `found_by`: `watch` when the capture's register origin names a sweep (`matched_sweep`), else `paste`. (DEC-116 items 1, 3, 6; DEC-100 items 1, 4) *(not yet met: T24)*
- **R2** `docketPressure({entry, pressure: {kind, note}, author, viewer})` (`op=docketpressure`) marks a record entry as a threat: `kind` one of `legal`, `retaliation`, `discrediting`, `other` (as `actions` R48's), `note` at most 500 characters. The mark is appended and never rewrites the entry. Refusals: `MACHINE_CANNOT_MARK_PRESSURE`; an entry absent or invisible (one answer); an entry already marked `PRESSURE_MARKED`; a bad kind or note `PRESSURE_REFUSED`. (DEC-116 item 3) *(not yet met: T24)*
- **R3** `docketOf({case, viewer})` (`op=docket`) answers a viewer who can see the project (`membership.sight`) every entry on all three shelves, oldest first: each record entry with its `proposed`, reason, `found_by`, `contests`, pressure mark, and its state (`placed` with the public entry, `declined` with its reason, `receipted`, or `pending`); each public entry as R14 serves it; the core still due (R9); and, for each contesting entry, its prompts: the re-evaluation cause it raised (R13) and the offer of a plan checkpoint (`action-plans`' own act, which this module never performs). A viewer who cannot see the project receives the answer an absent case receives. Writes nothing. (DEC-116 items 1, 3) *(not yet met: T24)*

**Placing in public, signed: docketPrepare({case, kind, shelf, edition, entry?, summary?, reason?, holder?, takesBack?, viewer, by}) → `{entry, statement, digest, warning, expires}`** (`op=docketprepare`; writes nothing) **and docketPost({digest, signature, acknowledged, by}) → `{ok, case, seq, published_at}`** (`op=docketpost`; mutating)
- **R4** Only the manager prepares. Refusals, in order, each writing nothing: a machine or AI credential, or an operator token, `MACHINE_CANNOT_PLACE_DOCKET`; `NO_SUCH_CASE` as R1; `by` not the manager `DOCKET_NOT_THE_MANAGER`; no group slug recorded (`promotion`'s `producingGroup`) `DOCKET_NO_GROUP_SLUG`; then R1's form checks on the entry it would sign, and the kind's own refusals (R7, R8, R10–R12). `shelf` is `listed` or `reactions`; a `reaction` record entry goes only to `reactions`, every other kind only to `listed`. A `reactions` entry requires `summary` (the group's words, one paragraph, at most 600 characters; `DOCKET_NO_SUMMARY`) and a capture whose co-archive succeeded (`DOCKET_NO_ARCHIVE_COPY`; the member may re-attest, `capture` R68). Otherwise it answers the entry that would be published (R6) as canonical JSON (`record-grammar`'s), its SHA-256 `digest`, `statement` = `signatures.docketStatement(case, seq, digest)`, the outward-act warning (the UX stream's words) and `expires` 60 minutes later; identical inputs on one UTC day answer identical bytes. (DEC-116 items 1, 6) *(not yet met: T24)*
- **R5** `docketPost` refuses: R4's caller refusals again at this instant; `acknowledged` not exactly `true` `DOCKET_WARNING_NOT_ACKNOWLEDGED`; no prepared answer from `by` with this `digest`, or one past `expires`, `DOCKET_STALE`; a signature `signatures.verifySshsig` rejects in namespace `NS_DOCKET` over exactly `statement`, against `credentials.attestingKeys()` restricted to keys registered to `by`, `DOCKET_SIGNATURE_REFUSED` with the verifier's reason. Otherwise the entry is stored with its armored signature and its first-published instant, and served by R14 and R15 from that instant on; a record entry it places reads `placed`. (DEC-116 item 6) *(not yet met: T24)*
- **R6** A public entry carries these fields and nothing else: `format` (`civicos-docket-entry/1`), `group`, `case`, `seq` (1, 2, … per case) and `previous` (the prior public entry's digest, or null); `shelf`; `kind` (`response`, `statement`, `reaction`, `outcome`, `edition`, `disclosure`, `withdrawal`, `standing-granted`, `standing-withdrawn`, `receipt`, `take-back`); `edition` (a number, or `all` for a withdrawal); `date` (the entry's date) and `received` (the record entry's date, when it places one); `from` (the subject entity's name as the record holds it, a holder's name as granted, or the source's name as filed); `capture` (`{sha256, origin, archived}`); and, by kind, `summary`, `what_changed`, `reason`, `holder`, `answers` or `takes_back`. No member's name, handle or id appears in it. (DEC-116 items 1, 3, 6) *(not yet met: T24)*

**What the group lists, and never trims**
- **R7** A `response` or `statement` placed on `listed` is listed whole: R14 serves its capture's bytes as captured, and nothing in this module alters, trims or redacts a submission's bytes. The manager may instead decline a submission that contains redactions: `docketDecline({entry, reason, by})` (`op=docketdecline`) records on the record entry, with a reason (`DOCKET_NO_REASON` as R1), that it was declined for containing redactions; nothing is published. Only the manager declines. A submission from anyone without standing (`reaction`, or `from: {kind: "other"}`) is listed only by the group's choice. (DEC-100 items 1, 2, 5) *(not yet met: T24)*
- **R8** A `receipt` entry lists a subject's or holder's reply that names a private person: its `received` date, `from`, and `reason` ("names a private person", with the manager's words), and neither its text nor its capture's bytes. `docketInvitation({entry, viewer})` (`op=docketinvitation`) answers the request to resend the reply without the name, prefilled for a member to send by their own means; this module sends nothing. A resent reply is filed (R1) naming the receipt it answers (`answers`) and placed whole (R7). (DEC-116 item 4) *(not yet met: T24)*

**The required core: coreDue({case?, viewer})**
- **R9** Answers, for each case the viewer manages (one case when `case` is given), each core item still due, with its `since`: (a) each record entry `from` the named subject or a holder whose grant was live at its filing, of kind `response`, or of kind `statement` from the subject, that is not yet `placed`, `declined` (R7) or `receipted` (R8); (b) each ratified edition above 1 with no `edition` entry naming it, whose entry quotes that edition's "What changed" statement (`case-grammar`'s `whatChangedOf`, its R8); (c) each tension `publication.caseTensions` (its R50) answers on a `load_bearing` member of the latest ratified edition with no `disclosure` entry naming it. A withdrawal is core by being itself a `listed` entry (R12). `outcome` entries are never core. Writes nothing; answers no case the viewer does not manage. (DEC-116 item 2; DEC-100 item 4) *(not yet met: T24)*

**Standing**
- **R10** A `standing-granted` entry, placed by the manager with a `reason` and the `holder`'s name, makes a grant: the holder's submissions filed while it is live carry exactly the named subject's rights (core, R9 (a); listed whole or declined only for redactions, R7). A `standing-withdrawn` entry with a reason ends it for submissions filed after its `date` only; those filed before keep the grant's rights. A grant is never deleted. (DEC-116 item 5; DEC-100 item 4) *(not yet met: T24)*

**Taking back, and withdrawal**
- **R11** A `take-back` entry names an earlier public entry of the case (`takes_back`, its `seq`) with a reason; both stay served, and reads mark the earlier one taken back. A record entry is taken back the same way, by a later record entry with a reason. Nothing in this module deletes an entry. Taking back a `withdrawal` or a `take-back` is refused `DOCKET_WITHDRAWAL_FINAL` and `DOCKET_TAKE_BACK_FINAL`. (DEC-116 items 6, 7) *(not yet met: T24)*
- **R12** A `withdrawal` entry, placed on `listed` by the manager, names one ratified edition or `all` (every edition ratified at its `date`; an edition ratified later is not withdrawn), with a published `reason` (`DOCKET_NO_REASON` as R1). An edition already withdrawn is refused `DOCKET_ALREADY_WITHDRAWN`. A withdrawal is never lifted (R11); standing behind the case again is a new edition. `withdrawalOf({case, edition})` answers the withdrawal entry naming that edition (its `seq`, `date`, `reason`, digest), or null; viewer-free, writes nothing. The edition itself is untouched and answers forever (`publication` R24). (DEC-116 item 7; N470) *(not yet met: T24)*
- **R13** At start this module fills `reevaluation`'s docket registration once (its R30), with `withdrawals({after, limit})` (each withdrawal: case, owning project, the editions it names, the signing instant, its `seq`) and `contested({after, limit})` (each record entry with `contests: true`: case, edition, the edition's member findings at their pins, the filing instant, the entry). (DEC-116 items 3, 7) *(not yet met: T24)*

**Public reads** (no credential; served through `public-read` R20)
- **R14** `docketPublic({case})` answers the case's public entries, oldest first, each with its JSON, armored signature and first-published instant, a taken-back entry marked so (R11), the bytes of each `listed` entry's capture by its hash (R7; never for `receipt` or `reactions`), and `last_entry`, the latest entry's date (null when none). A case with no ratified edition answers as an absent one. The `record` shelf never appears. (DEC-116 items 1, 8; DEC-100 item 2) *(not yet met: T24)*
- **R15** `docketFeed({case})` answers the same entries as an Atom 1.0 feed (RFC 4287), newest first, its `updated` the last entry's date, at a fixed address per case. Reading it writes nothing and records nothing about the reader. The module exports `DOCKET_UNREADABLE`, the sentence "Could not read the publisher's docket", for a citing copy to say when a docket cannot be read (DEC-101 (3)'s home, not yet built). (DEC-116 item 8) *(not yet met: T24)*

**Private: Uses** (all earlier: P4)
- `record-grammar` (0): canonical JSON, `createSha256`, the id grammar.
- `signatures` (4): `verifySshsig`; the new `NS_DOCKET` and `docketStatement` (its R39, R40).
- `record-core` (20): `transact`, `stampInstant`, `declarePurge`, `registerCounts`.
- `membership` (21): `isProjectOwner`, `isJoinedParticipant`, `sight`, `viewerPredicate`, `listenerRefusal`.
- `credentials` (22): `attestingKeys` (its R11).
- `promotion` (23): the `producingGroup` fact.
- `provenance` (25): the `register` read contract (capture, origin locator, `matched_sweep`), the co-archive outcome (its R33), the evidence store's bytes.
- `entities` (33): the subject entity's name (R6).
- `inquiry` (41): `subjectEntityOf` (its R43).
- `reevaluation` (53): the new docket registration (its R30).
- `case-grammar` (54): `whatChangedOf` (its R8).
- `publication` (56): `cases` and `published_cases` under its R40; `publishedEditionsOf` (its R37); `caseTensions` (its R50); `ratifiedCases` (its R43).

**Private: Invariants**
- **R16** One way: a public entry is never altered or deleted; only a whole-store purge clears this module's tables, and a bundle purge leaves the docket standing. (DEC-116 items 6, 7; DEC-12, DEC-19) *(not yet met: T24)*
- **R17** A docket entry is never evidence: nothing here writes a bundle, a basis leg, an edge, a state, a strength or a grade, and no answer here composes or changes one. (DEC-116 item 1) *(not yet met: T24)*
- **R18** Only a member files and only the manager places, declines or signs; no machine, AI run or administrator does any of these. (DEC-116 item 6) *(not yet met: T24)*
- **R19** No sealed, confidential or redacted public entry exists: an entry is public whole or not public (R7, R8). (DEC-100 item 2) *(not yet met: T24)*
- **R20** This module makes no outbound call and pushes nothing; no public answer names a member. (DEC-116 item 8) *(not yet met: T24)*
- **R21** No place is named in this module's behaviour or outward text. *(not yet met: T24)*
- **R22** Each refusal code above is a row of this module's own table (DEC-49), a new family numbered at its stamp; a change to any moves `CATALOG_VERSION`. *(not yet met: T24)*

**Satisfies.** `BIO_Publication_v0_1.md` §5D (all of it), §2 (one way), §3 rules 6 (right of reply), 10 (the credential-free read); DEC-116; DEC-100 items 1–5; DEC-72 clause 5 (the manager); DEC-12, DEC-19; DEC-49.

**Suggestions.** Tables `docket_entries` (public, with signatures), `docket_record` (record entries), `docket_marks` (pressure, declines, receipts, take-backs of record entries). The two-step signing is `network-notices`' and ratification's pattern. The paste path is the surface's: it calls `op=acquire` with the link (co-archive asked, `acquisition` R20), then `op=docketfile` with the capture. A watched source reaches the docket the same way, through a sweep's held capture (`monitoring` R29, `capture` R82's `matched_sweep`). Tests: each refusal with a negative control; a withdrawal of `all` then a new edition (not withdrawn); a take-back of a withdrawal refused; a holder's submission before and after `standing-withdrawn`; no member id in any public answer; the feed read leaves every table byte-identical.

---

## 2. reevaluation (index 53, layer 7; 2,225 lines; next free id R30)

- **R16 becomes:** … (its text to "never through a later module's service;" unchanged), then: "A target that is a project also carries `wp_retraction` when an edition of a case it owns is withdrawn, read through R30's registration (`withdrawals`), `since` the withdrawal's signing instant, its `detail` naming the case, the edition or editions withdrawn and the docket entry; with R30's registration absent that half is not raised and the answer says so (`docket_absent`)." The sentence "A withdrawn case edition has no record form (an edition answers forever, `publication` R24), so nothing raises the cause for one." is deleted. (DEC-116 item 7; answers N470, K943) *(not yet met: T24)*
- **R30 (new)** `registerDocket(module, {withdrawals, contested})` (K31's pattern; `docket`, later in the order, fills it): one registration, refused through `membership`'s `listenerRefusal` as R26's. R2 gains two cause arms, derived on read: (a) `withdrawal`: a dependent carries it when a live leg (R7) rests on a member finding of a withdrawn edition at the sha that edition pinned, `since` the withdrawal's instant, `detail` the case, edition and entry; (b) `contested`: each member finding of an edition a contesting record entry names carries it, `since` the filing instant, `detail` the case, edition and entry. `docketDependents({after, limit, viewer})` lists each (dependent, entry) so caused, in dependent then entry order after `after`, at most `limit` (1–200, default 200), with `cursor`; a dependent the viewer may not see is withheld and not counted (R20). Each is told once to R8's listeners as `kind: "withdrawal"` or `kind: "contested"` when first read after its instant. Both close as any cause does (R16); nothing regrades (R19). With none registered, neither arm is raised and the answer says so. (DEC-116 items 3, 7) *(not yet met: T24)*
- **R8 gains** the kinds `withdrawal` and `contested` (R30). *(not yet met: T24)*
- R18 is unchanged: both arms are derived on read and write no row. *(R18 needs no mark.)*
- Uses: `membership` (`listenerRefusal`, already a use). No new module. Order: `docket` (57) fills a registration of an earlier module (53), as `publication` fills R26.

## 3. queue-producers (index 78, layer 11; 3,001 lines; next free id R28)

- **R28 (new)** OBLIGATIONs `docket-core-due`: one per item `docket.coreDue` answers the viewer (its R9), keyed `OBLIGATION::docket-core-due::<case>::<kind>::<ref>`, to the case's manager (its project's owners, `membership` R65) and to nobody else; its subject the case, naming the item (a response, a statement, a newer edition, an undisclosed tension) and its edition; offering placement (`op=docketprepare`); its `age` from the item's `since`. It leaves when the item is done (placed, declined, receipted or disclosed). It is raised once and never repeated unless the member asks (DEC-69, DEC-94). (DEC-116 item 2) *(not yet met: T24)*
- **R29 (new)** FINDINGs `edition-withdrawn` and `edition-contested`: one per (dependent, entry) `reevaluation.docketDependents` answers (its R30), keyed `FINDING::<kind>::<dependent>::<case>#<seq>`, homed under the dependent's ancestors (`queue` R7); it leaves when the cause closes (as R5). (DEC-116 items 3, 7) *(not yet met: T24)*
- **R8 becomes:** … every item R1–R7, R9, R14, R15–R23, R26–R29 derive … *(not yet met: T24)*
- Uses gain `docket.coreDue` (57 < 78) and `reevaluation.docketDependents` (already a use).

## 4. public-read (index 57 → 58, layer 8; 2,242 lines; next free id R19)

- **R19 (new)** `publishedCase` (R3) also answers, for each edition a docket withdrawal names (`docket.withdrawalOf`, its R12), `withdrawn: {seq, date, reason, entry}`, the stamp linked to the withdrawal entry, at the top of the answer; the edition is answered whole as before. It also answers `docket_last_entry` (`docket` R14's `last_entry`). (DEC-116 items 7, 8) *(not yet met: T24)*
- **R20 (new)** Serves, with no credential, `docket` R14 (`docketPublic`) and R15 (`docketFeed`, at a fixed address per case, its media type `application/atom+xml`) under R10's terms. (DEC-116 item 8) *(not yet met: T24)*
- **R16 becomes:** … it reads `publication`'s tables only under `publication` R40 and reaches `publication` and `docket` only through the services named in Uses … *(not yet met: T24)*
- Uses gain `docket` (`withdrawalOf`, `docketPublic`, `docketFeed`): 57 < 58.

## 5. signatures (index 4, layer 1; 1,239 lines; next free id R39)

- **R1 becomes:** Five distinct compiled constants: `NS_RELEASE`, `NS_RATIFY`, `NS_FLEET`, `NS_NOTICE` and `NS_DOCKET` … (DEC-116) *(not yet met: T24)*
- **R39 (new)** `NS_DOCKET` is `"bio-docket"`, distinct from every other namespace (R1's rule). The offline signer page and the browser signer sign in it. (DEC-116 item 6) *(not yet met: T24)*
- **R40 (new)** `docketStatement(caseId, seq, sha)` returns exactly `` `bio-docket ${caseId} ${seq} ${sha}\n` ``; it throws when `caseId` is not an opaque id (record-core R6's shape), `seq` is not a whole number of at least 1, or `sha` is not 64 lowercase hex. (DEC-116 item 6) *(not yet met: T24)*

## 6. Wording only

- **publication R40:** "Read by …" gains `docket` (R1, R9, R12, R14). No change of meaning; publication's rows are untouched by a withdrawal (R24). *(not yet met: T24: its test)*
- **network-notices R21:** `owners` gains "or who signed a docket entry (`docket` R5)", so a key that signed a docket entry stays listed after its member stops owning a project. `network-notices` (59) gains a use of `docket` (57). *(not yet met: T24)*
- **affordances, op-declarations, control-plane, plane** (L11): no requirement text; their general rules cover the eight new ops (`docketfile`, `docketpressure`, `docket`, `docketprepare`, `docketpost`, `docketdecline`, `docketinvitation`, and the public reads). Their jobs add the specs, the routes, the `NON_ACTS` reads and the rungs (`docketprepare`/`docketpost`: signed; `docketfile`, `docketdecline`, `docketpressure`: reasoned). Accepted red from `docket`'s L8 merge to L11.
- No change: `capture` (the paste is `op=acquire`; co-archive is `acquisition` R20), `monitoring` (a watch is a sweep), `tasks` (a To-do is a queue OBLIGATION, `queue-producers` R24), `ratification`, `case-authoring`, `actions`, `action-plans`.

---

## BOB's decisions (made in this draft; to confirm or change)

1. The module's name `docket`, its paths, its place (index 57, layer 8, before `public-read`), its uses as listed.
2. Ids: docket R1–R22; reevaluation R30; queue-producers R28, R29; public-read R19, R20; signatures R39, R40.
3. The "named subject" is each subject entity of the edition's member findings (`inquiry` R43); the "manager" is a project owner (DEC-72 clause 5).
4. The namespace `"bio-docket"`, the statement's form, the entry format `civicos-docket-entry/1`, its fields; the feed is Atom 1.0.
5. Limits: reasons 2,000 characters (DEC-88's), pressure note 500 (`actions` R48's), a reaction's summary 600.
6. A `reactions` entry is refused without a co-archived copy (the ruling's "links to … the independent archive's copy").
7. The pressure mark is held by the docket, with `actions` R48's four kinds; `actions` is not changed.
8. "What rests on" a withdrawn edition, for the re-evaluation cause: R16's project arm plus every live leg on a member finding at that edition's pin (reevaluation R30 (a)); a contesting response flags the edition's own member findings (R30 (b)).
9. The core To-do goes to the case's manager only; no To-do for a reaction a member proposed for public (DEC-94: nothing nags unasked).
10. A decline (R7) and a receipt's invitation (R8) are record acts of the manager; the invitation is text the member sends, since CivicOS sends nothing.
11. Refusal codes as named; one new catalogue family, numbered at its stamp.

## Unresolved in the DEC text (quoted, with this draft's reading)

1. "anything the case would have had to disclose at signing, such as an open conflict on a load-bearing finding": only undisclosed tensions are derivable today (`publication` R50). R9 (c) covers those only; other disclosures (a source's consent withdrawn, `publication` R51) are not drafted.
2. "Outcomes are optional": no definition of an outcome. Drafted as a record kind a member may file and the manager may place, never core.
3. "by the assistant's labelled suggestion under the six guards (DEC-95 (3))": DEC-95 (3)'s suggestion has no home yet (T22's row of new-interface screens, Bob's: UX). Not drafted; `found_by` has no `suggestion` value until it does.
4. "may become a plan checkpoint": `action-plans`' checkpoints are scenario phases judged after a number of days (its R14); no link from a checkpoint to a docket entry is drafted. The docket read only offers the act.
5. "a threat takes a pressure mark": `actions` R48's mark lives on an action's received correspondence and can carry a litigation hold (R52, `queue-producers` R19). Whether a `legal` mark on a docket entry also asks for a hold is not ruled; not drafted.
6. "the subject is asked to resend it without the name": with "CivicOS sends no email", read as a prefilled request a member sends (R8).
7. "naming one edition or all": `all` read as every edition ratified when the withdrawal is signed, consistent with "standing behind the case again needs a new edition".
8. "its responses that reach the group" (DEC-100): a response reaches the docket only when a member files it (R1); a doorbell knock is pulled first (`capture` R65). The To-do starts at filing.
9. "listed whole": read as serving the response's captured bytes on the public docket. §5C's warning that the group judges whether it may republish (copyright included) is not repeated by the ruling for the docket.
10. "citing groups' copies turning entries into notices (DEC-101)" and "A citing copy that cannot reach the docket says …": the citing side is DEC-101 (3)'s, which waits on bringing another group's edition into a copy (`next.md` rows H1, H6b, J4). Only the sentence constant (R15) is drafted.
11. Whether a withdrawn edition stays in `network-notices`' attestation `cases` list (its R12): not ruled; unchanged.
12. "the UX page's question 36 marked ruled": the UX stream's file, not this process's.

---

## Questions for Bob (architecture: a new module carrying product capability)

**The docket needs a home.** Every case gains a second signed public object beside it: the docket, with its shelves, the manager's signed entries, withdrawal, standing, the core To-dos and a feed. It is about 1,600–2,400 lines. No existing module can take it without passing the 4,000-line mark or mixing two purposes.

- **A (recommended). A new module, `docket`, in layer 8 (Publication), directly after `publication` and before `public-read`.** It reads `publication`'s editions and `reevaluation`'s registration, both earlier. Because it comes before `public-read`, the public page can show a withdrawn edition's stamp and serve the docket and its feed directly. Later modules (`network-notices`, `queue-producers`, the interface) use it.
- **B. A new module, `docket`, in layer 8 after `network-notices`, before `ratification`.** The same capability, but `public-read` cannot read it. The docket would be served through `public-read`'s registration (its R18), and the stamp would need a second registration. That means more moving parts for the same result.
- **C. Inside `network-notices`.** Both are signed public statements served by pull. But the two would together reach about 3,000–4,300 lines, and a working-on notice and a case's docket are different things.

**Recommendation: A.** In plain terms: each published case gets its own public "docket" page and feed, run by a new part of the system that sits right after publishing. It holds the case's signed later entries, including a withdrawal. It never changes the case itself.

## Plain-language summary for Bob (one paragraph to approve)

**DEC-116 with DEC-100.** Each published case has a docket beside it. Members file responses into the group's record. Only the project's manager puts an entry in public, and signs it with their key. The named subject's replies, and those of anyone granted standing, are listed whole. The group never trims them, though it may decline one that contains redactions. A reply naming a private person is listed as received, without its text, and the subject is asked to resend it. Reactions found elsewhere appear only as a dated link, an archive copy and the group's short summary. The manager gets a to-do for each item the docket must list: the subject's responses and public statements, each new edition, and any undisclosed conflict on a relied-on finding. A withdrawal is a signed, permanent entry: the edition stays readable under a stamp, and everything that rested on it is flagged for re-evaluation. Anyone can read the docket and follow its feed. Nothing is sent, and nothing on the docket is ever evidence.
