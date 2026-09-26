# entities — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d915799`, after membership's early merge; `build/extraction/entities.md` has the table): `bio-plane/src/store.mjs` 23216–23307 (`idMatch`), 25039–25405 (`documentsNamingEntity`, `readingNamePlan`, the candidate ranking, the kind sets), 25466–25759 (the registry: `createEntity`, `addEntityAlias`, `declareRelation`, the reads), 25761–26178 (the recogniser and its reads: `resolveReferences`, `testifyResolution`, `resolutionsForCapture`, `documentsConcerning`), 27347–27361 (`#strongestResolutionsFor`), and the dispatch entries `readingname`, `readingnameplan`, `entitycreate`, `entityalias`, `relationdeclare`, `entity`, `entitybyalias`, `relation`, `resolve`, `resolvetestify`, `resolutions`, `concerns`, `idmatch` (49949–49990, 50390–50396). `bio-plane/checks/bio-checks.mjs` 16337–16365 (C-91, `IDSPACE_CHECKS`). `schema.mjs` 746–901: `entities`, `entity_aliases`, `entity_relations`, `resolutions`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, classes and the `declaredBy`/`resolvedBy` stamps (13135–13170), which stay with `control-plane` (K3). Not yet met: R8 (Open for Bob 2), R19 (N4), R20 and R25 (N6), R23 (REC-225), R32 (Open for Bob 1). No old-plan row is carried to `entities`; plan entry N6 is.

**Size (P6).** About 1,430 lines move (about 650 without comment-only lines): `store.mjs` 1,235, `bio-checks.mjs` 29, `schema.mjs` 156, and the two vocabularies from `affordances.mjs` (9). The term fold the alias index shares with the reading writer (`#normAlias`, `#cleanLabel`, `#labelTerms`, `#refTermSources`, 60 lines) goes to `extraction` (its map §1) and is used from there. Well under the 4,000 at which BOB reports a module.

## Public

### Purpose

The entity axis and the bias doctrine's subject registry, one construct (Framework §13): the things a case is about, which outlive any document naming them, each with first-class aliases and member-declared constitutive relations. It resolves the references a reading carries to registered entities and states how each was matched as the §8.1 grade (A, B, C by the recogniser; D only by a member's testimony); it answers which documents concern an entity and which name it; and it judges whether one identifier in two captured documents is a shared identifier that counts (§8.3). It derives no connection: that is `connections`'.

### Provides

Terms. An **entity** is `{entity_id, kind, label, note, declared_by, at, aliases, relations}`. **Kinds** are closed: `source`, `institution`, `office`, `movement`, `person`, `body`, `ordinance`, `parcel`, `contract`, `fund`. **Relation kinds** are closed: `proxy_for`, `member_of`, `overlaps`. A **name's fold** is `extraction`'s term fold (trimmed, whitespace collapsed, lower-cased, at most 200 characters, no diacritic folding). A **reference** is a reading's reference row (`extraction`): `{capture_sha, bundle_id, ref, ref_kind, ref_key, label}`, read at its first place. A **grade** is §8.1's `A`–`D`, `A` strongest. The **viewer** is the control plane's stamp, read through `membership.viewerPredicate`; it fails closed when absent. Every refusal is `{ok: false, reason, detail}`; one with a catalogue row also carries `code`, `check` and `translation`.

**createEntity({kind, label, note?, aliases?, declaredBy}), addAlias({entityId, alias, declaredBy}), declareRelation({fromEntity, toEntity, relation, justification, citation, declaredBy})** (`op=entitycreate`, `op=entityalias`, `op=relationdeclare`)
- **R1** `createEntity` refuses `NO_KIND`, `UNKNOWN_KIND` (naming the closed list), then `NO_LABEL`. Otherwise it allocates `ENT-<year>-NNNN` (`record-core.allocId`), keeps the label cleaned (trimmed, whitespace collapsed, at most 200) and the note (at most 2,000), and records the label as the canonical alias and each other distinct folded alias once, in one transaction; it answers `{ok, entity_id, kind, label, alias_count, at}`.
- **R2** `addAlias` refuses `NO_ENTITY`, `NO_ALIAS` (a name that folds to nothing), `NO_SUCH_ENTITY`, then `ALREADY_ALIASED` (the same fold already on that entity, naming the held alias). The same fold may be held by different entities; nothing refuses an ambiguous name.
- **R3** `declareRelation` refuses, in order, `UNKNOWN_RELATION` (outside the closed list; the detail says a grade is not a relation), `NO_ENDS`, `SELF_RELATION`, `NO_JUSTIFICATION`, the act-shape `NO_CITATION`, then `NO_SUCH_ENTITY` naming the end (`from` or `to`). Otherwise it allocates `REL-<year>-NNNN` and keeps the justification (at most 4,000) and citation (at most 2,000). A relation has no grade field and answers none (constitutive, not evidentiary).
- **R4** `declared_by` is recorded exactly as the control plane stamps it (a member, or `class:<cls>` for a machine, DEC-52); a caller's own field is never read.

**readEntity({entityId}), entitiesByAlias({alias}), readRelation({relationId}), has(entityId), kinds()** (`op=entity`, `op=entitybyalias`, `op=relation`)
- **R5** `readEntity`: `NO_ENTITY` for an empty id; an absent entity answers `{ok: true, found: false}`, never a refusal. The entity carries its aliases (canonical first, with `declared_by`, `at`) and every relation it is an end of, each with `direction` `out` or `in`, oldest first.
- **R6** `entitiesByAlias` answers every entity holding the alias's fold, in id order (ambiguity is kept, never resolved); a name that folds to nothing answers `count: 0`. `readRelation`: `NO_RELATION` for an empty id; absent answers `found: false`.
- **R7** `has(entityId)` answers whether the registry holds the id; `kinds()` and `relationKinds()` answer the closed lists, which `affordances` publishes (N13).
- **R8** A member may correct the registry without erasing it: withdraw an alias or a relation with a reason, and relabel an entity keeping the old label as an alias; nothing is deleted, and who did what, when, stays readable. *(not yet met: Open for Bob 2)*

**resolve({captureSha, ref?, resolvedBy, items?}), testify({captureSha, ref, entityId, basis, resolvedBy})** (`op=resolve`, `op=resolvetestify`)
- **R9** The recogniser, per reference: grade `A` when the fold of `ref` is an alias of one or more entities; otherwise `B` when the fold of `ref_key` (differing from `ref`'s) is; otherwise `C` when the fold of `label` is; otherwise unresolved. Every matching entity gets a resolution at that grade, with `basis` the matched string and a `method` sentence naming the tier. The cascade stops at the first tier that matches, for every entity. It never mints `D` and never matches through a declared relation.
- **R10** A resolution is keyed (capture, reference, entity). A stronger grade raises the held one in place, recording `raised_from`; an equal or weaker one keeps it and answers `kept: true`; a grade never falls. `established` is true only for `A` and `B`; `needs_confirmation` is true for `C`.
- **R11** `resolve` refuses `NO_SHA`, `NO_REF` (a `ref` given but empty), then `NO_SUCH_REFERENCE`; without `ref` it resolves every reference of the capture in one transaction. It answers `references`, `resolved`, `unresolved` (each with kind, key and label) and their counts. With `items` it takes the per-item set form (C-75) and answers per item.
- **R12** `testify` refuses `NO_SHA`, `NO_REF`, `NO_ENTITY`, the act-shape `NO_BASIS`, `NO_SUCH_REFERENCE`, then `NO_SUCH_ENTITY`. It records grade `D`, never established, with a method naming the testifier and the stated basis, under R10 (it never lowers a stronger resolution). `resolvedBy` is the control plane's stamp (R4's rule).
- **R13** `onResolved(module, fn)` and `onResolveAttempt(module, fn)`: later modules register once each (a second registration by one module is refused `LISTENER_DECLARED`). Inside the resolving transaction, `onResolved` listeners run for each inserted or raised resolution with `{entityId, captureSha, ref, grade, raised}` (a kept one runs none); `onResolveAttempt` listeners run once per reference tried, matched or not, with `{captureSha, bundleId, ref, matches, considered, resolvedBy}`. A listener that throws fails the resolve. (K31's pattern: `connections` marks the entity dirty; `observation-log` records the attempt.)

**resolutionsFor({captureSha, limit, viewer}), concerns({entityId, limit, viewer}), strongestByCapture(entityId)** (`op=resolutions`, `op=concerns`)
- **R14** `resolutionsFor` refuses `NO_SHA`; it answers the capture's resolutions ordered by reference then entity, each with grade, `established`, `needs_confirmation`, method, basis, `raised_from`, `resolved_by`, `at`, at most `limit` (default 500, maximum 5,000), with `limit` and `truncated` measured by reading one more.
- **R15** `concerns` refuses `NO_ENTITY`; it answers one entry per capture resolving to the entity, carrying that capture's strongest resolution, with `found` and the entity (an unregistered id answers `found: false` and whatever resolutions name it), `count`, `resolution_count`, `limit` (as R14) and `truncated`.
- **R16** `strongestByCapture` answers the same per-capture collapse as R15, unbounded, for `connections`, `progressions` and the earned-basis registry, so none of them spells the collapse again.

**namingDocuments({entityId, limit, viewer}), namingPlan(terms?)** (`op=readingname`, `op=readingnameplan`)
- **R17** `namingDocuments` refuses `NO_ENTITY`, then `NO_SUCH_ENTITY`. For each alias, it finds the references whose `ref`, `ref_key` or `label` carries every term of the alias (terms: the fold split on anything not a letter or digit, distinct, at most 24), through the reading term index. One candidate per (capture, reference), keeping the strongest correspondence (`reference`, `reference_key`, `name`, then the partial `name_in_reference`, `name_in_label`); partial candidates are ordered by `selectivity` (1 − reach ÷ corpus over the references this viewer can see at that source; null where the corpus is one). A partial match whose alias reaches every such reference (corpus above one) is not offered and is reported in `names_uninformative` with its arithmetic; an alias that folds to nothing is in `names_unusable`. Each candidate says how it corresponded and `grade_if_resolved`: the grade R9 would mint for this entity, or null. `limit` is clamped to 1–500 (default 100) and published; `truncated` is true when any alias's page filled or the merged list was cut. It writes nothing and always says candidates are not resolutions.
- **R18** A candidate in a bundle the viewer may not see is not offered, and nothing counts what was withheld.
- **R19** `namingPlan` answers the query plan of R17's lookup, showing the term index used. With no terms it uses the active profiles' `search_terms` (`jurisdictions`); with none held it answers undetermined, never a default. *(not yet met: N4 — defaults to a place name)*

**idMatch({space, a, b?, aCapture?, bCapture?, aName?, bName?, referent?, viewer})** (`op=idmatch`)
- **R20** The spaces and forms are `id-spaces`', over the view `jurisdictions.combine` makes of the instance's active profiles (`record-core` R26). An unknown space is `IDSPACE_UNKNOWN` (C-91.1), listing the spaces. *(not yet met: N6 — the old names `cms` and `apn` through `id-spaces`' legacy adapter R26, over every non-test profile)*
- **R21** A value that has the shape of no form of the space is `IDSPACE_VALUE_NOT_IN_SPACE` (C-91.2), naming which end and the space's forms. One value answers its recognition (form, `normal`, and for an enactment its kind and reach; for a parcel its standing over the vintages the record holds), `evidence: false`.
- **R22** Two values: each end's capture must be one the record holds and the viewer can see, else `IDSPACE_CAPTURE_NOT_HELD` (C-91.3), an invisible capture answering exactly as an absent one. Each end's system is judged from every address the record located that capture at (`provenance`'s captured locators), never from the request; at most 32 are read per capture, and a capture with more has system `origin: null` saying why, with `limit`, `a_truncated` and `b_truncated` published.
- **R23** A member's declared origin for the document (`provenance.originOf`) is asked before any address-derived system. *(not yet met: REC-225, provenance R29–R30)*
- **R24** The verdict is `id-spaces.judgePair`'s; `referent` is read only as `agrees` or `disagrees`, and the answer says the reading is the caller's; the fund name is the only referent compared here. It writes nothing.
- **R25** The C-91 translations and every sentence of the answer name no local system, office or example value (K1). *(not yet met: N6 — they name "cms", "apn" and local project and parcel numbers)*

## Private

### Uses

- `legacy-checks`: C-91 until it moves here (R29), C-75 (the per-item set form), the act-shape `NO_BASIS` and `NO_CITATION` rows, `isMachineIdentity`.
- `record-core`: `recordOf(ctx)`, `allocId` (R1, R3), `transact`, `declarePurge` (R30).
- `jurisdictions`: `combine` and the active profiles' view (R19, R20).
- `id-spaces`: `spaces`, `recognise`, `reach`, `parcelStanding`, `systemOf`, `judgePair` (R20–R24).
- `membership`: `membershipOf(ctx)`, `viewerPredicate` (R14, R15, R18, R22, R32). *(not declared in `modules.json`)*
- `extraction`: the term fold and the read contract over `readings`, `reading_refs` and `reading_ref_terms` (R9, R11, R17). *(not declared)*
- `provenance`: the captured locators (its R48 read contract) and `originOf` (R22, R23). *(not declared)*
- `content`: declared in `modules.json`; nothing here calls it (map §5).

### Invariants

- **R26** A declared relation is constitutive: it carries no grade, is never traversed to resolve a reference or to answer R15, and never forms a connection.
- **R27** Grade states how a reference was matched and nothing else: a `C` never reads as established, the recogniser never mints `D`, and a held grade only rises.
- **R28** Every authorship field (`declared_by`, `resolved_by`) is the control plane's stamp; a machine is named as one (`class:<cls>`), never as a person (DEC-52).
- **R29** Each check moves here as an invariant with its test (K6): C-91.1–C-91.3.
- **R30** Purge (K23, record-core R21/R46): `entities`, `entity_aliases` and `entity_relations` are cleared by the whole-store purge only; `resolutions` is keyed to its bundle.
- **R31** No place is named in this module's behaviour, defaults or outward text (K1).
- **R32** Sight: a read that names a bundle answers it only to a viewer who may see it. How much of a hidden document's row the reverse reads keep is Bob's question (Open for Bob 1): today R14 and R15 keep the row and its capture digest and withhold only the bundle id, while R17 withholds the row. *(not yet met: Open for Bob 1)*

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 6 (the entity axis) and 7 (the subject registry).
- `docs/architecture/BIO_Content_Framework_v0_10.md` §3 (ENTITY: resolved across documents, graded), §4 (the recogniser shape), §8.1 (grade A–D, D-219's label, entity resolution as the grading mechanism), §8.3 (rules 1–3 as ruled 2026-09-23 to 2026-09-25; REC-203), §13 (the subject registry and the entity axis are one construct).
- `docs/architecture/BIO_Declared_Bias_v0_1.md` safeguard 4 (the registry, aliases, justified and citable relations; every registry kind a legal subject).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7.9 (sight).
- Bob's ruling DEC-52 (a machine may declare, resolve and testify, and is named).

### Suggestions

- **Factory.** `entitiesOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `extraction` and `provenance` through theirs (K61). The op handlers move here (K3).
- **What stays out.** Connections, the dirty mark and the portion grade are `connections'`; the observation rows `#observeResolutionAttempt` writes are `observation-log`'s, through R13; the inquiry's subject-entity check (C-2.8, inside `promote`) is `inquiry`'s, registered with `promotion` and calling R7. `ENTITY_KINDS` and `RELATION_KINDS` move here from `affordances.mjs`, which re-exports them (N13).
- **Read contract.** `contradiction` and `basis-versions` join `resolutions` in SQL (map §3); state `resolutions(capture_sha, bundle_id, ref, entity_id, grade, established)` as a read contract, as record-core R37 does for `bundles`, rather than wrap each join.
- Tests: each C-91 refusal and R1–R3's refusals get a negative control; R9 gets a fall-through arm (an A on one entity suppresses a C on another); R10 an arm where testimony after an A keeps the A; R25 a profile that is not Oakland's. N6's test changes (`rec203-idspaces.test.mjs` to the new names) come with the job.

## Open for Bob

1. **May a member learn that a document exists when it is filed only in a project they cannot see?** Your ruling of 2026-09-24 says the evidence stays shared and only a project's attribution is withheld (Membership §7.9). `op=concerns`, `op=resolutions` and `op=connections` follow it: they show the document's digest and hide which project holds it. `op=readingname` hides the whole row, and BOB #35's ruling on D-701 and D-706 (2026-09-25) treated a hidden document's digest as a disclosure. *Recommendation:* your 2026-09-24 rule governs: a document's digest and what the record read from it stay visible, and the project, its id and its members' acts are hidden. `readingname` keeps hiding its candidates, because a candidate is an offer to act on a document. The same question is asked in `connections.md`.
2. **Can members correct the subject registry?** Framework §13 requires aliases and relations that members can edit. Today they can only be added: a mistaken alias keeps matching documents, and a mistaken relation cannot be withdrawn. *Recommendation:* yes, append-only (R8). A member can withdraw an alias or a relation with a reason, or relabel an entity, which keeps the old label as an alias. A withdrawn alias matches nothing new. Resolutions already made through it are kept and marked as resting on a withdrawn name, so a member can re-resolve them.
3. **Is the registry a bundle?** Framework §13 and safeguard 4 say the registry is "maintained as a bundle". It is built as tables for the whole instance, with authorship on every row. It has no bundle history, and only a whole-store purge clears it. *Recommendation:* keep it as tables with authorship and, once question 2 is answered, its append-only history, and change the text of §13 to match. A registry is not a document that anyone promotes, and a bias statement already names its subjects by id.
