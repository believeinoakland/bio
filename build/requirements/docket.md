# docket — requirements

**Status** · Requirements for T27, folded by a worker for BOB #103, 2026-10-02, entry N520 (DEC-116's share, with DEC-100: `plan/draft-T24-dec116.md`, its readings BOB's by K1134 (4); the module and its place BOB's by K1256, K1257), rebased on `main` @ 8f475cff60. A new product module with no `from`, in layer 8 directly after `publication` and before `public-read`. Its code is written by its own T27 job at `bio-plane/src/docket/`, its tests at `bio-plane/test/m/docket/`; that job adds both to its `modules.json` entry (K1043's form: `paths` and `tests` are empty until then, since the format check refuses a path naming nothing). Every requirement is not yet met (T27). Answers N470 (K943) and row H5 (DEC-100) of `plan/next.md`.

**Size (P6).** About 1,600–2,400 lines (tables, the two-step signing, take-back, withdrawal, standing, the core read, the public reads and the feed, catalogue rows), well under 4,000. `publication` (3,633 lines measured on `main` @ 8f475cff60) gains wording only.

## Public

### Purpose

After a case is published, the world responds without changing the case. This module keeps each case's docket: dated entries beside the case, each naming the edition it concerns, on three shelves. Any member files to the group's record; only the case's manager places an entry in public, signed with their registered key. It holds the withdrawal of an edition, grants of standing, and the required core the manager is asked to list, and it answers the public shelves and a feed per case for anybody to pull. It sends nothing anywhere, and no entry is ever evidence. (DEC-116; DEC-100; Publication §5D)

### Provides

Terms.
- The **case** and its **editions** are `publication`'s; an edition an entry names is a ratified edition number of that case.
- The **manager** of a case is an owner of its owning project (`membership.isProjectOwner`, its R54; DEC-72 clause 5).
- The **named subject** of an edition is each subject entity of its member findings (`inquiry.subjectEntityOf`, its R43).
- A **holder** is one to whom a grant of standing (R10) was made; a grant is **live** from its entry's `date` until a `standing-withdrawn` entry ends it.
- The **shelves** are `listed` ("what the group stands behind as accurately listed"), `reactions` ("Reactions elsewhere") and `record` ("In our record only"). Their labels, and every word a member or reader sees (the outward-act warning, the invitation, the stamp), are the UX design stream's, cited here and never decided.
- A **record entry** is a member's filing on `record`. A **public entry** is a manager's signed entry on `listed` or `reactions`.

**Filing to the record: docketFile({case, edition, kind, from, capture, contests?, proposed, reason, author, viewer})** (`op=docketfile`; member session; mutating)
- **R1** Any joined member of the case's project files a record entry. Refusals, in order, each writing nothing and carrying a catalogue row (DEC-49):
  - a machine or AI credential, or an operator token, is `MACHINE_CANNOT_FILE_DOCKET`;
  - a case that is absent, has no ratified edition, or whose project `viewer` does not see in full (`membership.sight`, its R44) is `NO_SUCH_CASE`, the same answer for each;
  - `author` not a joined participant of the project (`membership.isJoinedParticipant`, its R54) is `DOCKET_NOT_A_PARTICIPANT`;
  - then the form checks, never merit: `edition` not a ratified edition of the case is `DOCKET_NO_EDITION`; `from` absent is `DOCKET_NOT_ATTRIBUTED`; `from: {kind: "subject", entity}` naming no named subject of that edition is `DOCKET_NOT_THE_SUBJECT`; `from: {kind: "holder", grant}` naming no grant live at this instant (R10) is `DOCKET_NO_STANDING`; `from: {kind: "other", name}` with `name` absent, blank or over 200 characters is `DOCKET_NOT_ATTRIBUTED`; `capture` not a capture `provenance`'s register holds (its R48) with a locator in `captured_locators` is `DOCKET_NO_CAPTURE`; `kind` not one of `response` (from the subject or a holder), `statement` (the subject's public statement elsewhere, a press release included), `reaction` (anyone else) or `outcome` is `DOCKET_KIND_UNKNOWN`; `proposed` not one of `record`, `public`, `both`, or `reason` absent, blank or over 2,000 characters, is `DOCKET_NO_REASON`.

  Otherwise it records the entry with its instant, `author`, `from`, `capture`, `proposed`, `reason`, `contests` (true only when the member says the response contests the edition) and `found_by`: `watch` when the capture was filed with a sweep origin (`acquisition` R21's `origin.kind: "sweep"`, the origin `capture` R82 reads), else `paste`. A contesting entry is reported to `reevaluation` (R13). (DEC-116 items 1, 3, 6; DEC-100 items 1, 4)
- **R2** `docketPressure({entry, pressure: {kind, note}, author, viewer})` (`op=docketpressure`; mutating) marks a record entry as a threat: `kind` one of `legal`, `retaliation`, `discrediting`, `other` (as `actions` R48's), `note` at most 500 characters. The mark is appended and never rewrites the entry. Refusals, in order, each writing nothing: `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` (this module's own row, R22; `action-grammar`'s `MACHINE_CANNOT_MARK_PRESSURE`, C-117.14, is `actions`' and is never answered here; DEC-49; N526) *(not yet met: T28)*; an entry that is absent, or whose project `viewer` does not see in full, `NO_SUCH_DOCKET_ENTRY`, one answer; an entry already marked `PRESSURE_MARKED`; a kind outside the four, or a note over 500 characters, `PRESSURE_REFUSED`. (DEC-116 item 3)
- **R3** `docketOf({case, viewer})` (`op=docket`; a read) answers a viewer who sees the case's project in full every entry on all three shelves, oldest first:
  - each record entry with its `proposed`, `reason`, `found_by`, `contests`, pressure mark, and its state: `placed` (with the public entry), `declined` (with its reason, R7), `receipted` (R8), `taken-back` (R11) or `pending`;
  - each public entry as R14 answers it;
  - the core still due (R9);
  - for each contesting entry, its prompts: the re-evaluation cause it raised (R13) and the offer of a plan checkpoint (`action-plans`' own act, which this module never performs).

  A viewer who does not see the project in full receives `NO_SUCH_CASE`, as an absent case does. Writes nothing. (DEC-116 items 1, 3)

**Placing in public, signed: docketPrepare({case, kind, shelf, edition, entry?, summary?, reason?, holder?, takesBack?, viewer, by}) → `{entry, statement, digest, warning, expires}`** (`op=docketprepare`; writes nothing) **and docketPost({digest, signature, acknowledged, by}) → `{ok, case, seq, published_at}`** (`op=docketpost`; mutating)
- **R4** Only the manager prepares. Refusals, in order, each writing nothing:
  - a machine or AI credential, or an operator token, is `MACHINE_CANNOT_PLACE_DOCKET`;
  - `NO_SUCH_CASE` as R1;
  - `by` not the manager is `DOCKET_NOT_THE_MANAGER`;
  - no group slug recorded (`promotion`'s fact `producingGroup`, its R40) is `DOCKET_NO_GROUP_SLUG`, because there are no anonymous entries;
  - `entry` naming no record entry of the case is `NO_SUCH_DOCKET_ENTRY`; one already `placed`, `declined` or `receipted` is `DOCKET_ENTRY_SETTLED`;
  - R1's form checks on the entry it would sign, then the kind's own refusals (R7, R8, R10–R12);
  - `shelf` is `listed` or `reactions`: a `reaction` goes only to `reactions`, every other kind only to `listed`; any other pairing is `DOCKET_WRONG_SHELF`;
  - a `reactions` entry requires `summary`, the group's words, one paragraph of at most 600 characters (`DOCKET_NO_SUMMARY`), and a capture whose co-archive succeeded (`attestation` R3, R7) (`DOCKET_NO_ARCHIVE_COPY`; the member may re-attest, `capture` R68).

  Otherwise it answers the entry that would be published (R6) as canonical JSON (`record-grammar`'s), its SHA-256 `digest`, `statement` = `signatures.docketStatement(case, seq, digest)`, the outward-act warning (its meaning: the public will see it, and a later entry can take it back but never unsay it; its words the UX design stream's) and `expires` 60 minutes later. For the same inputs on the same UTC day, the answer is identical byte for byte. (DEC-116 items 1, 6)
- **R5** `docketPost` refuses, in order, each writing nothing: R4's caller refusals again at this instant; `acknowledged` other than exactly `true` `DOCKET_WARNING_NOT_ACKNOWLEDGED`; no prepared answer from `by` with this `digest`, or one past `expires`, or one whose `seq` another entry has taken since, `DOCKET_STALE` (prepare again); a signature `signatures.verifySshsig` rejects, in namespace `NS_DOCKET`, over exactly `statement`, against `credentials.attestingKeys()` (its R11) restricted to keys registered to `by`, `DOCKET_SIGNATURE_REFUSED` with the verifier's reason. Otherwise the entry is stored with its armored signature and its first-published instant and is answered by R14 and R15 from that instant on; a record entry it places reads `placed`; a withdrawal is reported to `reevaluation` (R13). `docketSigners()` answers each key (`keyB64`) that has signed a public entry, with the instant it first did; viewer-free, it writes nothing and names no member (for `network-notices` R21). (DEC-116 item 6)
- **R6** A public entry carries these fields and nothing else:
  - `format` (`civicos-docket-entry/1`), `group` (the slug), `case`, `seq` (1, 2, … per case) and `previous` (the prior public entry's digest, or null);
  - `shelf`; `kind`, one of `response`, `statement`, `reaction`, `outcome`, `edition`, `disclosure`, `withdrawal`, `standing-granted`, `standing-withdrawn`, `receipt`, `take-back`;
  - `edition` (a number, or `all` for a withdrawal of every edition, R12);
  - `date` (the entry's date) and `received` (the record entry's date, when it places one);
  - `from`: the subject entity's canonical name as the registry holds it (`entities.readEntity`, its R5), a holder's name as granted, or the source's name as filed;
  - `capture`: `{sha256, origin, archived}`, the origin locator and the archive's locator (null when none);
  - by kind, `summary`, `what_changed`, `reason`, `holder`, `answers` or `takes_back`.

  No member's name, handle or id appears in it. (DEC-116 items 1, 3, 6)

**What the group lists, and never trims**
- **R7** A `response` or `statement` placed on `listed` is listed whole: R14 answers its capture's bytes as captured, and nothing in this module alters, trims or redacts a submission's bytes. The manager may instead decline a submission that contains redactions: `docketDecline({entry, reason, by})` (`op=docketdecline`; mutating) records on the record entry, with a reason (`DOCKET_NO_REASON` as R1), that it was declined for containing redactions; nothing is published. Only the manager declines (R4's first three refusals, then `NO_SUCH_DOCKET_ENTRY` and `DOCKET_ENTRY_SETTLED` as R4). A submission from anyone without standing (a `reaction`, or `from: {kind: "other"}`) is listed only by the group's choice and is never core (R9). (DEC-100 items 1, 2, 5)
- **R8** A `receipt` entry lists a subject's or holder's reply that names a private person: its `received` date, `from`, and `reason` ("names a private person", with the manager's words), and neither its text nor its capture's bytes. `docketInvitation({entry, viewer})` (`op=docketinvitation`; a read) answers the request to resend the reply without the name, prefilled for a member to send by their own means; its words are the UX design stream's, and this module sends nothing. A resent reply is filed (R1) naming the receipt it answers (`answers`) and is placed whole (R7). (DEC-116 item 4; DEC-100 item 5)

**The required core: coreDue({case?, viewer})** (a read)
- **R9** Answers, for each case the viewer manages (one case when `case` is given), each core item still due, with its `since`:
  - (a) each record entry `from` the named subject, or from a holder whose grant was live at its filing, of kind `response`, or of kind `statement` from the subject, not yet `placed`, `declined` (R7) or `receipted` (R8);
  - (b) each ratified edition above 1 with no `edition` entry naming it; that entry quotes the edition's "What changed" statement (`case-grammar`'s `whatChangedOf`, its R8);
  - (c) each candidate `publication.caseTensions` (its R50) answers on a member of the latest ratified edition whose role is `load_bearing`, with no `disclosure` entry naming it.

  A withdrawal is core by being itself a `listed` entry (R12). `outcome` entries are never core, nor is anything about the group's own contacts with the subject (DEC-100 item 3). Writes nothing; answers no case the viewer does not manage. (DEC-116 item 2; DEC-100 items 1, 3, 4)

**Standing**
- **R10** A `standing-granted` entry, placed by the manager with a `reason` and the `holder`'s name, makes a grant: the holder's submissions filed while it is live carry exactly the named subject's rights (core, R9 (a); listed whole or declined only for redactions, R7). A `standing-withdrawn` entry, with a reason and naming the grant's entry, ends it for submissions filed after its `date` only; those filed before keep the grant's rights. A grant already ended is refused `DOCKET_NO_STANDING`. A grant is never deleted. (DEC-116 item 5; DEC-100 item 4)

**Taking back, and withdrawal**
- **R11** A `take-back` entry names an earlier public entry of the case (`takes_back`, its `seq`) with a reason; both stay answered, and reads mark the earlier one taken back. A record entry is taken back the same way, by a later record entry with a reason, and reads `taken-back`. Nothing in this module deletes an entry. Taking back a `withdrawal` is refused `DOCKET_WITHDRAWAL_FINAL`, and taking back a `take-back` `DOCKET_TAKE_BACK_FINAL`. (DEC-116 items 6, 7)
- **R12** A `withdrawal` entry, placed on `listed` by the manager, names one ratified edition or `all` (every edition ratified at its `date`; an edition ratified later is not withdrawn), with a published `reason` (`DOCKET_NO_REASON` as R1). An edition already withdrawn, or `all` when every ratified edition is, is refused `DOCKET_ALREADY_WITHDRAWN`. A withdrawal is never lifted (R11); standing behind the case again is a new edition. `withdrawalOf({case, edition})` answers the withdrawal entry naming that edition (its `seq`, `date`, `reason` and digest), or null; viewer-free, it writes nothing. The edition itself is untouched and answers forever (`publication` R24). (DEC-116 item 7; N470)
- **R13** At start this module fills `reevaluation`'s docket registration once (its R30) with `withdrawals({after, limit})` (each withdrawal: the case, its owning project, the editions it names, each member finding of each named edition at its pin as `{bundle_id, sha, edition}` (read through `publication`), the signing instant, its `seq` and its entry id; K1270) and `contested({after, limit})` (each record entry with `contests: true`: the case, the edition, the edition's member findings at their pins, the filing instant, the entry). After a withdrawal's post (R5) or a contesting filing (R1) commits, it calls `reevaluation.docketActed` (its R30) once with the act's kind, case and entry; a throw there never undoes the act. (DEC-116 items 3, 7)

**Public reads** (no credential; served by `public-read` R21)
- **R14** `docketPublic({case})` answers the case's public entries, oldest first, each with its JSON, armored signature and first-published instant, a taken-back entry marked so (R11), the bytes of each `listed` entry's capture by its hash (R7; never for a `receipt` or a `reactions` entry), and `last_entry`, the latest entry's date (null when none). A case with no ratified edition answers null, as an absent one. The `record` shelf never appears. (DEC-116 items 1, 8; DEC-100 item 2)
  `lastEntryOf({case})` answers, synchronously, whatever the viewer and without reading any capture's bytes, the `date` of the case's latest public entry (the `last_entry` `docketPublic` answers), or null; `public-read` R20 reads it for `docket_last_entry`. (K1276)
  Interface details settled at the build (K1274, K1278): `docketFile` takes an optional `takesBack` (a record entry id of the case) with `reason`, taking that entry back (R11); `docketPrepare` takes `candidate` (a disclosure, R9 (c)) or `grant` (a standing withdrawal, R10), published as the entry's `answers`; `docketPublic` answers each listed capture's bytes base64 under `captures: {<sha256>: <base64 or null>}`. Codes are family C-129.
- **R15** `docketFeed({case})` answers the same entries as an Atom 1.0 feed (RFC 4287), newest first, its `updated` the last entry's date, each entry linking to the case's docket; null for a case with no ratified edition. Reading it writes nothing and records nothing about the reader. The module exports `DOCKET_UNREADABLE`, the sentence "Could not read the publisher's docket", for a citing copy to say when a docket cannot be read (DEC-101 (3)'s side, not yet built). (DEC-116 item 8)

## Private

### Uses
- `record-grammar`: canonical JSON, `createSha256`, the id grammar.
- `signatures`: `verifySshsig` (its R2); the new `NS_DOCKET` and `docketStatement` (its R39, R40).
- `record-core`: `transact`; `stampInstant` (its R47); `declarePurge` (its R21); `registerCounts` (its R63).
- `membership`: `isProjectOwner` and `isJoinedParticipant` (its R54), `sight` (its R44), `viewerPredicate`.
- `credentials`: `attestingKeys` (its R11).
- `promotion`: the `producingGroup` fact (its R40).
- `provenance`: the `register` and `captured_locators` read contract (its R48) and the evidence store's bytes.
- `attestation`: the co-archive outcome a capture's entry records (its R3, R7).
- `acquisition`: the filed `origin` of a capture (its R21), for `found_by`.
- `entities`: `readEntity` (its R5), the subject's name (R6).
- `inquiry`: `subjectEntityOf` (its R43).
- `reevaluation`: the new docket registration and `docketActed` (its R30).
- `case-grammar`: `whatChangedOf` (its R8).
- `publication`: `cases`, `published_cases`, `published_case_members` and `case_documents` under its R40; `publishedEditionsOf` (its R37); `ratifiedCases` (its R43); `caseTensions` (its R50).

### Invariants
- **R16** One way: a public entry is never altered or deleted; only a whole-store purge clears this module's tables, and a bundle purge leaves the docket standing. (DEC-116 items 6, 7; DEC-12, DEC-19)
- **R17** A docket entry is never evidence: nothing here writes a bundle, a basis leg, an edge, a state, a strength or a grade, and no answer here composes or changes one. (DEC-116 item 1)
- **R18** Only a member files and only the manager places, declines or signs; no machine, AI run, operator token or administrator does any of these. (DEC-116 item 6)
- **R19** No sealed, confidential or redacted public entry exists: an entry is public whole or not public (R7, R8). (DEC-100 item 2)
- **R20** This module makes no outbound call and pushes nothing; no public answer names a member. (DEC-116 item 8)
- **R21** No place is named in this module's behaviour or outward text (`layers.md`, "No jurisdiction in the product").
- **R22** Each refusal code above, except `NO_SUCH_CASE`'s shared answer, is a row of this module's own table (DEC-49), a new family numbered at its stamp; a change to any moves `CATALOG_VERSION`.
- **R23** (N525) Every address this module answers (an entry's link to its case's docket, the feed's own address) is written as the rest of the public read path writes its addresses, the query alone with no leading `?` (`op=docketpublic&case=<case>`, `op=docketfeed&case=<case>`; `public-read` R20, R21). Inside the Atom feed (R15), where a link must resolve on its own, each `href` is that address as a query-only relative reference (`?op=…`, RFC 3986 §4.2), so it resolves against the feed's own address. *(not yet met: T28)*

### Satisfies
- `docs/architecture/BIO_Publication_v0_1.md` §5D (all of it), §2 (one way), §3 rules 6 (right of reply) and 10 (the credential-free read), §7 (the slug as the group's public identity).
- DEC-116 items 1–8; DEC-100 items 1–5; DEC-72 clause 5 (the manager); DEC-12, DEC-19; DEC-49.
- N470 (K943: the withdrawal act); `plan/next.md` row H5 (DEC-100).

### Suggestions
- **Tables:** `docket_entries` (public, with signatures), `docket_record` (record entries) and `docket_marks` (pressure marks, declines, receipts, take-backs of record entries). Each is declared to purge, whole store only (R16).
- **Two-step signing:** `network-notices`' and the case ceremony's pattern: prepare, sign in the browser, post.
- **The paste path** is the surface's: it calls `op=acquire` with the link, co-archive asked (`acquisition` R20), then `op=docketfile` with the capture. A watched source reaches the docket the same way, through a sweep's held capture (`link-sweep` R5, `capture` R82's `matched_sweep`). The assistant's labelled suggestion (DEC-95 (3)) has no home yet; `found_by` has no `suggestion` value until it does.
- **Not drafted** (the draft's unresolved readings, kept): disclosures other than tensions (R9 (c) covers `publication` R50 only); a `legal` pressure mark asking for a litigation hold; a link from a plan checkpoint to an entry; the citing side of DEC-101 (3).
- **Tests:**
  - each refusal, with a negative control;
  - a withdrawal of `all`, then a new edition, which is not withdrawn;
  - a take-back of a withdrawal, refused;
  - a holder's submission before and after `standing-withdrawn`;
  - a reply naming a private person: the receipt carries no text and no bytes, the resent reply is listed whole;
  - no member id in any public answer, checked over every answer;
  - the feed read leaves every table byte-identical.
