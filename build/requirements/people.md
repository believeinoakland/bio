# people — requirements

**Status** · New product module, layer 5, after `duties` and before `explore` (plan Rules (2); K1470). Meaning from the capability ladders §2 (PEOPLE; "Cross-cutting rulings"), §5A, §10, and rulings K1443, K1452, K1453, K1455, K1465, K1471, K1473, K1483–K1493, K1504; plan entry T33-36. Reviewed (K1505); met by PEOPLE #1–#2 in T33 (K1592).

**Size (P6).** New. Expected 1,800–2,300 lines (constructs-2 §4.1), under the 4,000 mark. M-P5 (the person read at 50,000 lines) and M-P6 (false merges) run inside the job.

## Public

### Purpose

The people the record is about, held fully (K1452, K1455): identity claims that link two person records and never merge them, with the derived identity cluster; dated person facts; the reads that gather a person's positions, career, credentials, interests, statements and acts from their owning modules; staffing as of a date; members' own declared ties; the protected link from a source to a person; and the machine's interest checks, held in the hypothesis layer and shown only after a measured false-alarm rate. Every fact is cited, dated and graded; the module never concludes about a person, never says two people know each other and stores no judgment on a person. Posts, memberships, education, credentials, interests and ties are `lines`; statements and acts are `events` participants; money given and received is money facts; `holderAt` is `lines'`.

### Provides

Terms. A **person** is an `entities` entity of kind `person`. A **viewer** is the control plane's stamp, read through `membership`; it fails closed when absent. A **validity** is `civil-time`'s `{valid: {from, to, precision, zone}, basis}`, read only through `civil-time.validAt`; a null bound means "not stated". A **citation** is a content extent `content` judges (`checkContentExtent`). A **grade** is the A–D family (`record-grammar`), A strongest. Every refusal is `{ok: false, reason, detail}`, and one with a catalogue row carries `code`, `check` and `translation`. Every write is stamped by the control plane (`by`); a caller's own author field is never read. A machine is named as one (`class:<cls>`, DEC-52).

**Identity claims: claimIdentity({a, b, kind, basis, evidence, project?, note, by}), withdrawIdentityClaim({claimId, reason, by}), identityOf({entityId, viewer})** (`op=identityclaim`, `op=identitywithdraw`, `op=identity`)
- **R1** `claimIdentity` records one claim `IDC-` (`record-grammar`'s opaque form) between two distinct registered persons `a` and `b`, of kind `same_as`, `not_same_as` or `unsure`. Refusals, in order: `NO_ENDS`, `SELF_CLAIM`, `NO_SUCH_ENTITY` (`entities.noSuchEntity`) naming the end, `NOT_A_PERSON` naming the end, `UNKNOWN_CLAIM_KIND` (naming the three), `UNKNOWN_BASIS`, `NO_EVIDENCE` (a basis other than `testimony` with no evidence), `NO_NOTE`, and R2's `IDENTITY_GRADE_UNEARNED`. It answers `{ok, claim_id, kind, grade, why, at}`.
- **R2** A claim's grade is earned from its basis (K1488), never stated by the caller: `identifier` earns A only when one scheme identifier (`entities`' scheme identifiers) is held, valid at both records' cited dates, on both `a` and `b`; `corroborated_name` earns B only when the evidence names a cited fact (a `lines` row such as the same post, licence or filer number) valid at both documents' dates, through `civil-time.validAt`; `name` earns C; `testimony` earns D. A basis whose condition fails is refused `IDENTITY_GRADE_UNEARNED`, naming the condition that failed. `why` says, in Civicsmith's words, "claimed the same person, grade B, because …", and never "is the same person".
- **R3** A machine (`class:<cls>`) may record only an `identifier` claim from source-native data with identifiers at both ends (K1443 as extended by BOB, K1470); any other machine claim is refused `MACHINE_CLAIM_REFUSED`.
- **R4** A claim is never edited or deleted. `withdrawIdentityClaim` refuses `NO_REASON` and `NO_SUCH_CLAIM`, answers a repeat `already: true`, and marks the claim withdrawn with who, when and why; a withdrawn claim links nothing. Neither act merges, re-points or changes any `entities` row, resolution or alias.
- **R5** `identityOf` answers the person's identity cluster for the viewer: the persons joined to it by `same_as` claims the viewer may see, transitively within one component, each link with its claim, grade and why; the cluster's state is `linked`, or `undetermined` when a `not_same_as` claim joins two members of the component (naming that claim); `unsure` claims are listed and join nothing. An unregistered id answers `found: false`. At most 500 members and 1,000 claims, with `truncated` by reading one past.
- **R6** The cluster is a derived cache under `record-core`'s derived-cache convention: rebuilt in the transaction of every claim and withdrawal, equal to its rebuild, and read fail-closed: a cache that differs from its rebuild answers `undetermined` with the reason, never a stale cluster.

**samePersonCandidates({entityId, limit, viewer})** (`op=samepersoncandidates`)
- **R7** It answers other persons that share a name's fold (an alias, `entities`) or a scheme identifier with the person, each explained field by field: names, identifiers, posts held (`lines`) and life facts (R9), each `agrees`, `differs` or `absent` with the rows compared. No probability, score or rank is computed or answered, and candidates are ordered by entity id. `limit` 1–200 (default 50), with `truncated`. It writes nothing and always says candidates are not claims (D167).
- **R8** On the synthetic same-name fixture (Suggestions), the share of offered candidates that are different people, among those R7 marks as agreeing on every compared field, is at most 0.5% (M-P6; K1504). The job's test asserts it; the read is not published to `op-declarations` until it passes.

**Person facts: recordPersonFact({person, kind, value, valid, citation, by}), withdrawPersonFact({factId, reason, by}), expunge({id, ground, demandKind?, order?, reason, by})** (`op=personfact`, `op=personfactwithdraw`, `op=personexpunge`)
- **R9** `recordPersonFact` records one `PFA-` (opaque form): `kind` closed, `name`, `birth`, `death`, `locality`, `address`, `contact`; the value as the cited document states it; a validity; a citation. Refusals, in order: `NO_SUCH_ENTITY`, `NOT_A_PERSON`, `UNKNOWN_FACT_KIND`, `NO_VALUE`, `NO_CITATION` (or `content`'s extent refusal), `BAD_VALIDITY` (`civil-time`'s refusal, naming the bound).
- **R10** An `address` or `contact` fact is recorded only by a member's act: a machine write of either is refused `CONTACT_NOT_IMPORTED` (K1485 row 9). Such facts are held in a table declared with export class `never` (R33), are answered only to a viewer who may see the citing capture, and every read carries them as `publishable: false`.
- **R11** A wrong fact is corrected forward: `withdrawPersonFact` refuses `NO_REASON` and `NO_SUCH_FACT`, keeps the fact and marks it withdrawn with who, when and why (DEC-19).
- **R12** `expunge` removes the value of a `PFA-`, `IDC-`, `MTI-` or source link (R21) and leaves a tombstone `{id, ground, at, by}`, only on a ground K1493 lists: `unlawful`, `confidential`, `court_order` (naming the recorded order) or `lawful_demand`, whose `demandKind` is one the active profiles list (`jurisdictions`). Any other ground is refused `EXPUNGE_GROUND_REFUSED`, naming the grounds and the correction act (R11); a demand kind the profiles do not list is refused `DEMAND_KIND_UNLISTED`. Only an administrator expunges (`membership`'s `notAnAdmin`). The removal reaches this instance and every later export; no read answers the removed value.

**Reads: personAt({entityId, at, viewer}), careerOf({entityId, viewer}), credentialsOf({entityId, at?, viewer}), interestsOf({entityId, at?, viewer}), statementsOf({entityId, from?, to?, viewer})** (`op=person`, `op=career`, `op=personcredentials`, `op=personinterests`, `op=personstatements`)
- **R13** Each read answers over the person's identity cluster as the viewer sees it (R5), stating the cluster and its state, and each item names the cluster member it is held on. A cluster that is `undetermined` answers each item with its own member and joins nothing across the `not_same_as`.
- **R14** `personAt` refuses `NO_ENTITY` (`entities.noEntity`) and `NO_DATE`; it answers the names and life facts (R9) valid at `at`, the posts held at `at` (`lines`' `holds`, with capacity), the duties binding the person at `at` (`duties.dutiesOf`, as obligor, K1453), and for each item its validity, grade and citation; an item whose validity does not settle `at` is listed `undetermined` with the reason, never as current.
- **R15** `careerOf` answers every `holds` line of the cluster, inside and outside government, in validity order, each with its capacity, title as written, bounds, grade and citation. `credentialsOf` answers the `educated_at` and `credentialed_by` lines, each `credentialed_by` with the issuer's scheme identifier it cites. `interestsOf` answers the `owns_interest_in` lines (a Form 700 interest is such a line, entered by a member from its cited schedule extent) and the money facts where the person is payee of kind `income` or `gift` or payer of kind `contribution` (`money`).
- **R16** `statementsOf` answers, for each cluster member, its statements (`events.statementsOf`) and its acts (the events `events.eventsFor` answers in which it is `decider`, `signatory`, `implementer` or `author`, K1465), merged in `events`' order (`events.sequence`), three-valued: two events whose order the record does not settle are answered as such, never placed.
- **R17** Every read bounds each list at 500 items in its stated order with `truncated` per list by reading one past, and never answers a count of a truncated list as whole.

**staffingAt({organisation, at, viewer}), registerRosterSource(module, source)** (`op=staffing`)
- **R18** `staffingAt` answers, for an organisation and its parts at `at` (`lines.structureAt`), the persons holding a `holds` line to it valid at `at`, and beside them each registered roster source's answer for that organisation and date, with the level stated: "held as a table, read by <source>" or "held as a table, not read". Roster rows are never copied into lines.
- **R19** `registerRosterSource(module, source)` takes one source per module, refused through `membership`'s `listenerRefusal` (`LISTENER_MALFORMED`, `LISTENER_DECLARED`); sources are asked in the modules' total order. A source that throws is named in the answer as failed, and the read still answers.

**Members' ties: declareTie({entity, kind, note, attribution, by}), withdrawTie({tieId, reason, by}), tiesOf({member, viewer}), tiesConcerning({entities, member, viewer})** (`op=membertie`, `op=membertiewithdraw`, `op=memberties`)
- **R20** A member declares only their own tie (`MTI-`), to a registered entity, of kind `employer`, `relative`, `business` or `other`, with a note and the attribution level they choose for its disclosure (K1490). `by` is the member, the control plane's stamp; there is no field naming another member, and a machine is refused. A tie is seen only by its member and by administrators: any other viewer's read answers exactly as for no tie. `tiesConcerning` answers, for `case-disclosures`, the member's ties to any of the given entities, each with its attribution level.

**The protected source link: linkSourceToPerson({source, person, evidence, sight, by}), sourceLinksOf({source | person, viewer})** (`op=sourcepersonlink`)
- **R21** It records that a source (`sources`) is a registered person, with evidence and a non-empty sight list of members (`NO_SIGHT_LIST`). Only the listed members read it; every other viewer, every other read of this module and every export answer exactly as if no link were held. Being a source is never stated by `personAt` or any other person read (DEC-78 item 5; K1484 row 18).

**Interest checks: defineCheck({name, condition, denominator, project?, by}), switchCheck({check, project, on, by}), evaluateChecks({budgetMs}), checkResults({project?, check?, viewer}), recordCheckGate({check, version, goldSet, falseAlarmRate, by}), onCheckResult(module, fn)** (`op=interestcheckdefine`, `op=interestcheckswitch`, `op=interestchecks`, `op=interestcheckgate`)
- **R22** A check (`CHK-`) is data-defined: its condition names line kinds, event roles or money-fact kinds at each end and a hop bound of at most two through `related_to` or `associate_of`; its denominator names the set it counts against. The shipped checks (the machine's own, K1491) include a revolving-door check (a `holds` in government followed, within the condition's span, by a `holds` at an organisation the earlier office oversees or contracts with). A member may add a check; a check naming a hypothesis id (`record-grammar.isHypothesisId`) is refused `HYPOTHESIS_NOT_A_FACT` (K1467). Any check may be switched off per project by a member of that project. A change to a check is a new version; earlier versions are kept.
- **R23** `evaluateChecks` evaluates every switched-on check over the held record within the time budget it is given, writing each match to the checks' own result table with its cited derivation (every row it rests on) and its denominator, and never to a person's or entity's row. It answers `{evaluated, remaining}`, `remaining` true when the budget ran out, and resumes from where it stopped. It is a computation, never a model run.
- **R24** `checkResults` answers a check version's results only once its gate is recorded: `recordCheckGate` (an administrator; `NO_GOLD_SET`, and a rate outside 0–1 refused) records the gold set and the measured false-alarm rate for one version, and results are answered only when that rate is at most 20% (K1504, M-C8), as `money-checks` gates its detectors. Until then the read answers `{gated: true, reason}` and no result. Each answered result is labelled the machine's, `layer: "hypothesis"`, "Noticed", with its derivation and denominator.
- **R25** A result whose derivation rests on any row the viewer may not see is withheld whole and not counted (K1489). `onCheckResult` registrations (R19's rule) are told of each new gated-open result, once, for `notice-producers`.

**neighbours({node, kinds, at, page, viewer})** (registered with `connection-grammar`)
- **R26** At start the module registers as the owner of the kinds `same_as`, `not_same_as` and `unsure` (`connection-grammar.registerOwner`). `neighbours` presents each visible claim on `node` as one hop in `connection-grammar`'s shape: evidentiary, its evidence the claim's, its grade the claim's, withdrawn claims never. It passes `connection-grammar`'s owner-conformance battery.

**The ops map**
- **R27** The module publishes `peopleOps(people, url, body)`, route arms keyed by the op names above, each answering what its service answers, its stamps from the control plane. Which credential reaches each op is `op-declarations'`.

## Private

### Uses

- `record-grammar`: `ID_TABLE` and `idPattern` (`IDC-`, `PFA-`, `MTI-`, `CHK-`), `isHypothesisId`, the grade vocabulary.
- `jurisdictions`: the active profiles' lawful-demand kinds (R12; K1493).
- `civil-time`: `validAt`, the validity value, three-valued comparison (R2, R9, R14, R16).
- `connection-grammar`: the shape, `registerOwner`, `ownerConformance` (R26).
- `record-core`: `allocId`/opaque minting, `transact`, `declareTable` (R33), the derived-cache convention (R6), expunge with tombstone (R12).
- `membership`: `viewerPredicate`, `inSight`, `listenerRefusal`, `MODULE_ORDER`, `notAnAdmin`.
- `provenance`, `content`: the citation and the capture's visibility (R9, R10, R25).
- `sources`: the source's existence (R21).
- `entities`: `has`, `readEntity` (kind, aliases, scheme identifiers), `noSuchEntity`, `noEntity`.
- `events`: `statementsOf`, `eventsFor`, `sequence` (R16).
- `lines`: `linesOf` (`holds`, `educated_at`, `credentialed_by`, `owns_interest_in`, `related_to`, `associate_of`), `structureAt` (R14, R15, R18, R22).
- `money`: `moneyOf` (R15, R22).
- `duties`: `dutiesOf` (R14).

### Invariants

- **R28** Linked, never merged: no act of this module changes an `entities` row, alias or resolution, and two persons stay two ids whatever claims join them (K1488, D78).
- **R29** No judgment on a person: no table of this module holds a score, rank, suspicion or "conflict" field on a person or entity, and no outward text uses "knows", "conflict", "suspicious" or "most connected" (K1471, K1473, K1486).
- **R30** One home per fact: this module holds no post, membership, credential, interest, tie, statement or amount; it reads them from their owners (ladders §2 PEOPLE).
- **R31** Sight (K1489): the registry of people is group-wide; a fact from a document follows that document's visibility; identity claims, person facts by testimony and interest-check results made inside a project the viewer may not see are not answered and not counted; member ties (R20) and the source link (R21) take their own narrowest sight. Every withheld item answers exactly as an absent one.
- **R32** No place is named in this module's behaviour, defaults or outward text; schemes, filing officers and demand kinds are profile data.
- **R33** Table declarations (`record-core`): `person_facts` (export `yes`), its contact table (export `never`), `identity_claims` (export `yes`, sight by project), `member_ties` (export `admin-only`), `source_person_links` (export `never`), `interest_checks` and `interest_check_results` (export `admin-only`), and the cluster cache (`derived-rebuildable`). Purge: rows naming a bundle are keyed to it; the rest clear only with the whole store.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 PEOPLE, CONNECTIONS and "Cross-cutting rulings" (sight, member ties, lookup conduct, removal, machine checks); §5A.3 L1–L3, §5A.4 (both stages), §5A.6; §10 rows "People are tracked …", "Machine signals live in the hypothesis layer", "Hypotheses have a place, never in findings", "One home per fact", "One id grammar; one table declaration".
- Bob's rulings K1452, K1455, K1465, K1483, K1484, K1485, K1488, K1489, K1490, K1491, K1492, K1493; BOB's K1453 (as superseded by K1470), K1470, K1504 (gate values).
- `docs/architecture/BIO_Design_Requirements_v2.md` Design Requirement 6 as amended (K1483): the reads `case-disclosures` relies on (R20).
- DEC-19 (correct forward), DEC-52 (machine named), DEC-78 item 5 (the source link).

### Suggestions

- **Factory.** `peopleOf(ctx)`, the one instance per Durable Object storage (K61).
- **Interests.** Entering a Form 700 interest is `lines`' write with the schedule's extent; this module adds no write for it (one home). If BOB wants a guided act, it calls `lines` and holds nothing.
- **Revolving door.** Kept as a shipped check (R22) so it shares the gate and the hypothesis label; the ladders' "as calculations with denominators" is met by R22's denominator.
- **Scheduler.** `scheduler` (T33-80) registers a consumer that calls `evaluateChecks` on the one alarm with a stated budget; `notice-producers` (T33-82) registers `onCheckResult`.
- **Rosters.** `calculations` registers a roster source; `roster-reader` is in layer 1 and cannot call this module, so `plane` registers its reader (open point).
- **Tests.** Negative controls for every refusal; R2 with an identifier held on one end only (refused A); R5 with a `not_same_as` inside a component; R6 rebuild-and-compare; R8 on a generated fixture of same-name officials (two Michael Houstons and a thousand others); R10 a machine address write refused; R12 each ground; R21 every other read silent; R24 gated; M-P5 a person read at 50,000 lines within the response budget.

## Open for Bob

None: the meaning is the ladders' and Bob's rulings. Open technical points for BOB are in the drafting report.
