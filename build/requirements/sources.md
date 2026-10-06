# sources — requirements

**Status** · APPROVED by Bob 2026-09-30 (K509 (1): a new product module, placed after `capture` in layer 3). DRAFT by a worker for BOB #69, 2026-09-30 (`build/plan/draft-N345-dec78-80-81.md` §2), reviewed by BOB (K497); Bob ruled its questions as recommended (K509: (1) this module; (4) a pseudonym is an identity detail, consent by the source's knocker secret or a member's evidenced record; (5) hand-carried material's rule recorded here, R12, its intake built with the upload redesign). Folded by a worker for BOB #71, 2026-09-30 (T16 opening). Layer 3. Code today: none; the module is written new by its first job. Met in T16 (SOURCES #1, K541). AMENDED by a fold worker for BOB #106 on `prep/T29-folds`, 2026-10-03, entry N529, ruling K1333 (`case-authoring`'s disclosures moved to `case-disclosures`): the Callers' reader of R8 re-pointed from `case-authoring` R37 to `case-disclosures` R4; wording only, no meaning changed. T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-22 (K1449, K1492 (3), (6); Choices 22: `sources` holds the grade and the marking, `credentials`/`acquisition` the keyed services): R16–R18 (a member-keyed outside source: a paid people-search result marked by the member's own act on their own account, cited at a lower grade, not reproducible by the public, never bulk-imported) and R19 (the tables declared explicitly, plan Rules (6)) added; not yet met (T33-22).

**Size (P6).** New. Expected well under 4,000 lines: a history table, a consent table, a read log and their reads.

## Public

### Purpose

Holds each source, meaning the knocker, the person who handed material over, and later the person revealed behind them, as a dated, attributed history of disclosures, never as one overwritten field (DEC-78 item 5). It also answers what of a source may be published, and to whom.

### Provides

Terms. A **source** is the person behind a capture that was given to the group rather than fetched, held under its own id. A **disclosure** is one entry of its history: what was revealed about the source, how, to whom it is known, with its evidence. An **audience** is `member`, `group` or `public`, lowest to highest. `by` and `viewer` are the control plane's stamps, never a body's. Every refusal names its `reason` and `code`, and carries its row's `check` and `translation`.

**sourceOf({captureSha, viewer})**
- **R1** A source exists for each pulled knock (`capture` R65): one per pseudonym, and one per knock sent without a secret. `sourceOf({captureSha, viewer})` answers the source as it stood when the capture was received (the capture's own `source`, verbatim) and, beside it, the source's current history (R5 governs which values the viewer reads). A capture's stated source never changes.

**recordDisclosure({source, revealed: {kind, value?}, how, knownTo, evidence, recorded, sight?, by})** (`op=sourcedisclose`)
- **R2** `kind` is one of `pseudonym_link`, `attribute` (occupation, employer, role), `name`. `how` is one of `self`, `filing`, `third_party`, `hostile`. `knownTo` is one of `member`, `group`, `public`. `evidence` is required. The entry is appended with `by` (a stamp) and the instant, and never edited; a later entry supersedes it on read. Refusals: `NO_SUCH_SOURCE` (C-121.1), `BAD_DISCLOSURE` (C-121.2, naming the field), `NO_EVIDENCE` (C-121.3).
- **R3** A `hostile` disclosure is stored as the exposer's claim, `{claimed_by, at}`, and read as "named by <claimed_by> on <date>; not confirmed by the group", with `confirmed: false` always. A confirmation is its own R2 entry, and R7 requires the source's consent for it (DEC-78 item 5(b)).
- **R4** `recorded: false` records that a detail is known to the group without storing its value ("known to the group, not recorded", item 5(c)). The entry holds no value, and no read answers one.
- **R5** A stored value (`recorded: true`) needs `sight: [member ids]`, a non-empty list (`NO_SIGHT_LIST`, C-121.4). Only those members read the value; any other viewer gets the entry with `value` withheld and `withheld: true`. Each read under sight that answers a value appends `{source, entry, reader, at}` to the source's read log; R8's answer is not such a read, since it answers only what consent or public record already opens to that audience (K539). `readLog({source})` answers that log to the listed members and to administrators.

**linkClaim({source, to, evidence, by})** (`op=sourcelink`)
- **R6** It claims that two sources are one person. It is recorded as a `pseudonym_link` disclosure with its evidence. When the revealed person presents the same knocker secret (R11's arm), the claim's basis is `same_secret`, the strongest. The claim does not merge the sources: each keeps its own history. `NO_SUCH_SOURCE`.

**recordConsent({source, entry, audience, evidence, by})** (`op=sourceconsent`) **and withdrawConsent({source, entry, audience, by})** (`op=sourceconsentwithdraw`)
- **R7** A consent covers one entry for one audience and is stated as permanent for anything published under it. A withdrawal binds only later publications: what is published stays published (item 5(d)). `CONSENT_NOT_STANDING` (C-121.5) when the entry does not exist, or when the audience is lower than what is already consented.

**publishableAt({source, audience, at?}), rungOf({source, viewer})**
- **R8** `publishableAt` answers each entry that may be shown to `audience`, with its value (a `recorded: false` entry answers none) and its basis: `consent` (R7, not withdrawn at `at`) or `public_elsewhere` (a `knownTo: public` entry whose evidence is a citation, and never a `hostile` one alone, which answers as R3's claim sentence). Every other entry is left out, and nothing is said about it. The group is never the first to make a detail more public (item 5(a)). It writes nothing and never throws.
- **R9** `rungOf` answers the ladder: `unknown`; `same_knocker` (proved by the secret); `partly_known`; `known_to_group`; `publicly_known`. Each rung comes with who knows and how, from the history, and a withheld value stays withheld (R5).

**onDisclosure(listener)** (a registration later modules fill once at start; K31's pattern)
- **R10** Each registration goes through `membership.listenerRefusal`, and each listener is called after every R2, R6 or R7 commit with `{source, entry, rung_before, rung_after}`; an R6 `same_secret` link that moves the linked source's rung also calls each listener for that source, with the same entry. A listener's failure never undoes the act.

**consentBySecret({knockerSecret, entry, audience, withdraw?})** (`op=knockerconsent`, no account)
- **R11** A source proves who they are by presenting their knocker secret (its digest and pseudonym as `capture.knockerDigestOf` answers them), and consents to, or withdraws from, one entry for one audience, as R7 records a consent. `SECRET_NOT_RECOGNISED` (C-121.6) is answered identically for every failure, and the act is rate-bound as a knock is, in the same windows as knocks (`capture` R31): a consent attempt counts as a knock from its source (K530).
- **R15** (K547) `source_knocks` is a read contract for later modules (`reevaluation` R28), as `inquiry` R40's columns are: one row per pulled knock a source stands behind, `(knock_id, source_id, capture_sha, bytes, received)`, written for every pulled knock of the source's pseudonym when the source is minted, and for one pulled later before any act that moves its rung; it holds no value, secret or contact, and its columns keep these names.

**markKeyedResult({captureSha, service, terms, by}), keyedResultOf(captureSha)** (`op=sourcekeyed`; T33-22; K1492 (3), K1449)
- **R16** `markKeyedResult` records that a capture is a result from a member-keyed outside source (a paid people-search database or another fee-bearing record), reached by the member's own act on their own account under the vendor's terms: `service` names the vendor, `terms` the vendor's terms as the member states them. Only by that member's own act, for a capture whose `actor` (`acquisition` R16) is that member: a machine or absent `by` is refused `MACHINE_CANNOT_MARK`, a capture of another actor `NOT_YOUR_CAPTURE`, an unknown capture `NO_SUCH_CAPTURE`, an empty `service` `NO_SERVICE`; each writes nothing. One capture per act; a mark is appended with `by` and the instant and never edited or removed.
- **R17** `keyedResultOf(captureSha)` answers a marked capture's `{member_keyed: true, service, by, at, reproducible_by_public: false, grade_cap}`, else null; never throws. `grade_cap` is one rank below the letter `provenance.captureGrade` answers for that capture, in `BASIS_GRADES`' order (never above it, and D stays D): a reader grading a fact that cites the capture caps its capture axis there, so the result is cited at a lower grade than a public capture of the same page.
- **R18** (K1492 (3), (6); K1449: never unattended) No path of this module takes rows in bulk from a member-keyed source: nothing here imports a vendor's records, and a result enters only as one capture marked by R16. No act here runs unattended: a machine credential, a daemon or a scheduled consumer is refused R16's `MACHINE_CANNOT_MARK`. Nothing records what a member searched for: the mark holds the vendor and terms, never a query, a search term or the results the member did not capture.

## Private

### Uses

- `record-grammar`: `isMachineIdentity` (its R15).
- `record-core`: `transact`, `stampInstant`, `mintOpaqueId` (a source's id) and `mintExhausted` (its R62, when no source id can be drawn; N376), `declarePurge` (R13's exemption), and `declareTable` (its R21; R19, T33-22).
- `provenance`: `captureGrade` (R17), and `record-grammar`'s `BASIS_GRADES` (R17).
- `membership`: `listenerRefusal` (R10), the member session stamp, `activeAdmins` (R5's administrators).
- `capture`: the inbox rows (`knocker_digest`, `pseudonym`, status; its R32, R66), `knocksOf` (its R67), `knockerDigestOf` (its R66; R11), the capture's `source` (`acquisition` R16, its R65), the knock's rate (its R31; R11).

### Invariants

- **R12** The capturing member is never recorded as the source of what someone else gave them (Membership v2 §1.2): no act here names a capture's `actor` as its source.
- **R13** Every table here is exempt from purge. A value is never written to a log, an error or a listener payload.
- **R19** (plan T33, Rules (6)) This module declares every table explicitly through `record-core.declareTable` (its R21), keeping R13's exemption from purge; the tables holding a source's disclosures and stored values (R2, R5), its read log and R16's marks are declared `export: "never"`, as the link from a source to a person is (K1489), their sight being R5's.
- **R14** No place is named in this module's behaviour or outward text; C-121.1–C-121.10 are held in its own table.

Rows C-121.1–C-121.10 (R14; N364; C-121.7–.10 K1549), a new family, "a source's disclosures", with their translations:

| row | code | translation |
|---|---|---|
| C-121.1 | `NO_SUCH_SOURCE` | "No source you can see answers to that id. Nothing was written." |
| C-121.2 | `BAD_DISCLOSURE` | "A disclosure names what was revealed (a pseudonym link, an attribute or a name), how it became known, and to whom it is known, each from the listed choices. The field that is not one of them is named. Nothing was written." |
| C-121.3 | `NO_EVIDENCE` | "What is recorded about a source is recorded with its evidence. Name the evidence. Nothing was written." |
| C-121.4 | `NO_SIGHT_LIST` | "A detail about a source that is stored can be read only by the members listed for it, and none is listed. List at least one member, or record that the detail is known without storing it. Nothing was written." |
| C-121.5 | `CONSENT_NOT_STANDING` | "That consent cannot be recorded: the detail it names is not in this source's history, or consent to a wider audience already stands. Nothing was written." |
| C-121.6 | `SECRET_NOT_RECOGNISED` | "That secret was not recognised, so nothing was recorded. Check it and try again." |
| C-121.7 | `MACHINE_CANNOT_MARK` | "Only a member, acting for themselves, can mark a result from a paid or account-gated service; no machine, scheduled task or unattended process can. Nothing was written." |
| C-121.8 | `NOT_YOUR_CAPTURE` | "Only the member who captured a result can mark it as from their own account on a paid service. Nothing was written." |
| C-121.9 | `NO_SUCH_CAPTURE` | "No capture the record holds answers to that digest. Nothing was written." |
| C-121.10 | `NO_SERVICE` | "A result from a paid or account-gated service names the service it came from. Name it. Nothing was written." |

### Satisfies

- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a (the doorbell): DEC-78 items 2, 3 and 5 (a source's history, its pseudonym, what may be published).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §1.2 (the capturing member is not the source): R12.
- DEC-78; Bob's rulings K509 (1), (4) and (5).

### Suggestions

- **Factory.** `sourcesOf(ctx)` answers the one instance per Durable Object storage (K61); the op handlers live in this module's paths, and the control plane routes them and stamps `by` and `viewer`.
- **Where a source comes from.** `capture` is earlier and cannot call this module, so R1's sources are derived from capture's pulled inbox rows at read (one per pseudonym, one per knock without a secret), or minted on first read and kept; either keeps R1 true.
- **Hand-carried material** (K509 (5)) has no intake route yet: R12 is its rule, and its intake is built with the upload redesign.
- **Callers.** `reevaluation` registers on R10 (its R28); `publication` (its R51, R52) and `case-disclosures` (its R4) read R8; `affordances` grades the ops (its R2, R3).
- **Tests.** Each C-121 refusal gets a negative control; R5's withheld value and read log; R3's hostile claim never reads confirmed; R7's withdrawal leaves an earlier publication's statement unchanged; R11's refusal byte-identical for a wrong secret, an unknown entry and a malformed call; R13's exemption declared.

- **T33 (T33-22).** R17's cap of one rank below the capture's own letter is this fold's reading of "a lower grade" (K1492 (3)), named to BOB. The callers that grade a fact citing a marked capture (`people`, `strength`) apply `grade_cap` in their own requirements; until they do, the mark is stated beside the capture and the cap is not yet applied anywhere. The price shown first (K1449) is the member-facing surface's, the design stream's. R16's refusal codes are this fold's. R19's `export: "never"` for the marks and stored values is this fold's reading of K1489, named to BOB.

## Open for Bob

None: ruled by Bob 2026-09-30 (K509).
