# connections — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d915799`; `build/extraction/connections.md` has the table): `bio-plane/src/store.mjs` 26180–27034 (the connection view, `deriveConnections`, `connectionsFor`, `connectionGradeForContent`, `chooseConnectionPair`), 3258–3335 and 3457–3471 (the dirty set, its sweep and its scheduler entry), 4796–4857 (`#refEdgeSevered`, `#citesInto`), 17278–17345 (`backlinks`, `danglingRefs`), 42334–42387 (`projectLinks`), 1255–1282 (the connection migrations), and the dispatch entries `connect`, `connections`, `connectionchoose`, `backlinks`, `projectlinks`, `dangling` (49991–50033, 49756–49759, 50122–50123, 50732); the `refs` projection inside `promote` (19110–19137) is registered here. `bio-plane/checks/bio-checks.mjs` 16077–16225 (C-49, C-74), 16367–16478 (`checkConnectionPairCovers`, `checkConnectionMentionUnchosen`). `schema.mjs` 8–15, 902–1027, 1188–1215: `refs`, `connections`, `connection_pair_choices`, `connection_dirty`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only routing, classes, gates and the `assertedBy`/`author` stamps (K3), and D-706's viewer stamp for `op=linkproject` is a `legacy-index` edit (map §5). Not yet met: R6 (D-575), R13 (content map §5), R15 (D-625), R26 (D-706), R27 (D-722), R28, R29, R30 (REC-206), R31, R32 (Open for Bob 1), R33 (Open for Bob 2). Old-plan rows carried to `connections`: D-575, D-625, D-706, D-722, REC-206, and D-701 (proposed for `capture`, map §5).

**Size (P6).** About 1,635 lines move (about 790 without comment-only lines): `store.mjs` 1,210, `bio-checks.mjs` 261, `schema.mjs` 162. The built work on the carried branches adds under 400 (REC-206's 173-line derivation, if it comes here, map §5). Well under the 4,000 at which BOB reports a module.

## Public

### Purpose

Holds the connections of the record, of two kinds. **Derived connections**: two captured documents that resolve to the same entity are connected (Framework §8), graded by the weaker of how each end resolved (§8.1). Each connection carries the reference that determined it on each side, a member's choice of the on-point mention, and what a cited part of a document may earn from it. **Edges between bundles**: the `references[]` of every document, projected so the record can answer who cites what, backlinks and dangling references. These edges include `links_to` edges, which the source asserted by a hyperlink the record resolved. Grade here states how a connection was established, and never how credible a document is.

### Provides

Terms. A **connection** is `{a_capture_sha, b_capture_sha, entity_id, a_bundle_id, b_bundle_id, grade, a_grade, b_grade, established, needs_confirmation, asserted_by, basis, at, determining_pair}`, its ends in canonical order (`a < b`). The **determining pair** is `{a_ref, a_position, b_ref, b_position, positioned, why, selection}`, or null on a row derived before pairs were kept. A **position** is `text-chain`'s reading source; **covers** is `text-chain.readingPositionInExtent`. An **edge** is `{bundle_id, target_id, kind}` with `kind` a relation of the closed vocabulary. The **viewer** is the control plane's stamp, read through `membership.viewerPredicate`, failing closed when absent. Every refusal is `{ok: false, reason, detail}`; one with a catalogue row also carries `code`, `check` and `translation`.

**derive({entityId, assertedBy, limit?})** (`op=connect`)
- **R1** `NO_ENTITY` for an empty id. It reads the entity's resolutions (`entities`), keeps per capture the strongest (ties: the first reference by sort), and writes one connection per unordered pair of captures, graded the weaker end, `established` only when both ends are `A` or `B`, `asserted_by` as given (`system` from the control plane and the sweep), a `basis` sentence naming both grades and the pair, each end's determining reference with the position of its first read (null where the reading could not say), and the pair rule `strongest-graded/first-reference-by-sort`. A held connection is updated in place, never duplicated. An unregistered entity id derives from whatever resolutions name it, `found: false`.
- **R2** The pair bound is `limit` (default 500, maximum 5,000); the document bound is the largest k with k(k−1)/2 within it (32 at 500, 100 at 5,000); at most 5,000 resolution rows are read, a trailing partly-read capture dropped rather than graded weaker. The answer carries `documents`, `document_limit`, `resolution_rows`, `count`, `limit` and `truncated`; every connection written is true, and a truncated set is the first documents by capture digest.
- **R3** `onDerived(module, fn)`: a later module registers once (`LISTENER_DECLARED` on a second); after each derivation `fn` runs with `{entityId, count, documents, truncated, entityKnown, assertedBy}` (for `observation-log`).

**read({entityId | captureSha, limit, viewer})** (`op=connections&id=`, `&sha256=`)
- **R4** By entity or by capture, else `NO_KEY`; ordered by grade; at most `limit` (as R2's default and maximum) with `truncated` measured by reading one more. Each row carries the connection, and `on_point` naming each end's standing member choice when any.
- **R5** With an entity, the answer carries its derivation statement from the registered provider (`observation-log`), or the missing cause when none is recorded.
- **R6** `selection` states the method (strongest-graded) and the tie-break, or that the row predates the recorded rule. When a member's choice stands on an end, it names the choice, never "nobody has chosen". A choice that has lapsed is stated on every arm (`id=`, `sha256=`, `content=`). *(not yet met: D-575)*

**portionGrade({contentId, limit, viewer})** (`op=connections&content=`)
- **R7** An unknown content row is `CONNECTION_PAIR_NO_CONTENT` (C-49.3). For a `document` extent every connection of the capture reaches it, and says so.
- **R8** For a part, each connection of the capture is `reaching`, `undetermined` or `outside`: no pair is `CONNECTION_PAIR_NO_PAIR`, undetermined; a pair with no position on this end is C-49.2 (`CONNECTION_PAIR_UNPLACED`), undetermined; a pair read outside is C-49.1 (`CONNECTION_PAIR_OUTSIDE_EXTENT`), outside; a pair read inside reaches. An outside verdict is C-49.4 (`CONNECTION_PAIR_MENTION_UNCHOSEN`), undetermined, when another mention of the subject in the document is inside or unplaced, or the mentions were not all read (at most 5,000). A reaching verdict is C-49.4 when the pair won only a tie against a mention not inside. Each C-49.4 names the mentions.
- **R9** A standing member choice on the cited end answers instead. Its position is tested by the same predicate, and its grade is the weaker of the chosen mention's grade and the other end's (that end's choice when it has one). A choice whose mention the document no longer carries at that place, or a choice made before occurrences were recorded whose reference is now read at several places, has lapsed. The lapse is stated with the places, and the machine's pair is read as unchosen.
- **R10** `connection_grade` is the strongest reaching grade, else null; `established` and `needs_confirmation` follow it. The answer carries the three lists, their counts, `limit`, `truncated`, the row's `stale`. Its `why` sentence tells apart four cases: no connection, an unchosen mention, unplaced connections, and every connection outside. Undetermined is never read as none.
- **R11** No capture grade or testimony grade is mixed into a connection grade, and a null grade is never ranked.
- **R12** Every bundle id in the answer is withheld from a viewer who may not see it.
- **R13** `portionGrades(contentIds, viewer)` answers R10's grade for at most 200 rows in one set-based read, for `content`'s standings and the earned-basis registry (content R20). *(not yet met: new service, content map §5)*

**choose({capture, other, entity, ref, occurrence?, author, viewer})** (`op=connectionchoose`)
- **R14** Refusals, in order: C-74.1 (`CONNECTION_CHOICE_NOT_A_MEMBER`: no author, or a machine identity); C-74.2 (`CONNECTION_CHOICE_NO_CONNECTION`: no such connection, or the chosen end's bundle hidden from the viewer, the same answer); C-74.3 (`CONNECTION_CHOICE_NOT_A_MENTION`: `ref` is not a resolution of the entity in that capture, or the named occurrence is not read there, listing the places); C-74.4 (`CONNECTION_CHOICE_OCCURRENCE_UNNAMED`: the reference is read at several places and none is named). Listed occurrences are at most 256, with `truncated`.
- **R15** An occurrence is named by its key, or by its place when exactly one occurrence is read there. An empty `occurrence` names the read that carries the empty key, the one with no recorded place. *(not yet met: D-625 — an empty value reads as none named)*
- **R16** Append-only: a new choice supersedes the current one on that end in the same transaction; at most one choice per end is current; choosing the current one again writes nothing (`wrote: false`). The answer names the choice, the superseded one, the machine's pair reference and a sentence. A choice never rewrites the connection's own pair.

**The dirty set: markDirty(entityId), wake(now), sweep()**
- **R17** Registered on `entities`' `onResolved` (its R13): an inserted or raised resolution marks its entity once, inside the resolving transaction; many marks of one entity are one row.
- **R18** `sweep` derives at most a batch of the oldest marked entities (default 100; a binding may set it), each at R2's default bound with `asserted_by: system`, and clears each only after its derivation (a crash leaves it marked). It answers `{entities, remaining, swept}`. `wake(now)` is null when nothing is marked, else `now` plus the delay (default 60 s; a binding may set it). The scheduler calls both; this module never arms an alarm.

**Edges between bundles: onPromote (registered with promotion), backlinks({target, viewer}), dangling(viewer), citesInto(id), edgeSevered(citingId, targetId, rel?), the fact `citedBy`** (`op=backlinks`, `op=dangling`)
- **R19** Registered with `promotion` as a projection (its R39, K31): in the promotion's transaction, the bundle's edges are replaced by the `references[]` entries of its document, one per (target, relation). The inquiry's `supersedes` reverse index is `inquiry`'s and reads these edges.
- **R20** `backlinks`: `NO_TARGET`; a target the viewer cannot see answers `NO_SUCH_BUNDLE` like an absent one. Otherwise every citing bundle the viewer can see, with its relation, type, title and state, and the edge's status read from the citing document (unreadable or unrecorded is `confirmed`). No count of what was withheld.
- **R21** `dangling` (C-6.2): every edge whose target no bundle holds, a hidden citing bundle's edge withheld whole.
- **R22** `edgeSevered` is true only when the citing document records that entry `severed`; an unreadable document or an unrecorded entry is live. `citesInto` partitions the `cites` edges into `confirmed` and `severed`, sorted.
- **R23** Registered with `promotion` as the fact `citedBy(id)` (its R16, R40): the confirmed citers of `id`.

**projectLinks({sourceCapture, sourceBundle?, viewer})** (`op=linkproject`)
- **R24** The capture's links are resolved by `capture` (its R27). Only a `linked` link whose target a bundle has registered becomes an edge, as `links_to`, never `cites`, asserted by the source. A self-edge is dropped. A target whose bytes no bundle claims is counted `skipped_unregistered`. The answer lists each edge with address, verdict and basis.
- **R25** A capture not registered to a bundle writes nothing and says so.
- **R26** Through the viewer: a source capture the viewer cannot see answers as one the record does not hold and writes nothing; a hidden target is neither listed nor counted; an absent viewer fails closed. *(not yet met: D-706)*
- **R27** It writes exactly the edges its answer names. A `bundle` the viewer cannot see, or one the record does not hold, is refused as not held. *(not yet met: D-722)*
- **R28** A projected `links_to` edge survives the source bundle's later promotions: the resolved link becomes a `references[]` entry of the source document (LINK-FIDELITY, "Links and citations"). *(not yet met: no row — the edge is written to the projection only, and R19's next replacement drops it)*
- **R29** When a target is promoted, the resolved links that point at it become edges (LINK-FIDELITY, step 8). *(not yet met: no row)*

**Item-to-file membership**
- **R30** An agenda item's membership in a file is derived from containment on positional text and served beside the links, never inside them. It is labelled `derived: containment, work: machine, asserted_by: system, grade: C, standing: inferred, established: false`, and never presented as the publisher's link. A file link above the first item is `unplaced`, never assigned. Item and file addresses are told apart by shapes the active profiles' systems supply (K1). *(not yet met: REC-206, built on its branch with one system's address shapes in code)*

**Authors other than the system**
- **R31** A member may assert a connection between two documents directly, with a stated basis, `asserted_by: member`, grade `D`. It is kept apart from derived rows and never rewritten by a derivation (Framework §8.1, "The connection table" 1). *(not yet met: no row)*
- **R32** A source's own link between two held documents counts as an `A` connection (§8.1's grade-A example), `asserted_by: source`, kept apart from the system's. *(not yet met: Open for Bob 1)*

## Private

### Uses

- `legacy-checks`: C-49 and C-74 until they move here (R35), C-6.2's row, `isMachineIdentity`, `describeExtent`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge` (R36), `bundleInfo`.
- `entities`: `strongestByCapture`, `has`, the read contract on `resolutions` (R1, R8, R14), and `onResolved` (R17).
- `content`: `contentRow` (R7–R10).
- `membership`: `membershipOf(ctx)`, `viewerPredicate` (R12, R14, R20, R21, R26, R33). *(not declared in `modules.json`)*
- `text-chain`: `readingSourceFromColumns`, `readingSourceJson`, `readingOccurrenceKey`, `readingPositionInExtent` (R1, R8, R9, R15). *(not declared)*
- `extraction`: the read contract over `reading_refs` (positions and occurrences, R1, R9, R14). *(not declared)*
- `promotion`: `registerStep` (R19), `registerFact` (R23). *(not declared)*
- `capture`: `resolveLinks` (R24). `provenance`: the register's capture-to-bundle read (R24, R25). *(neither declared)*
- `jurisdictions`: the systems' address shapes, if R30's derivation lives here (map §5).

### Invariants

- **R33** Sight: every act and read naming a bundle answers one the viewer may not see exactly as an absent one. Bob decides whether a derived connection shows the digest of a document filed only in a hidden project (Open for Bob 2). Today the id and capture reads keep the row and withhold only the bundle id. *(not yet met: Open for Bob 2)*
- **R34** A connection is no stronger than its weaker end; a `C` at either end is never established; a derivation never forms a connection through a declared relation; `asserted_by` is never the grade.
- **R35** Each check moves here as an invariant with its test (K6): C-49.1–C-49.4, C-74.1–C-74.4.
- **R36** Purge (K23): `connections` and `connection_pair_choices` keyed to either end's bundle; `refs` keyed by `bundle_id`; `connection_dirty` whole-store only.
- **R37** No place is named in this module's behaviour or outward text (K1).
- **R38** `author` on a choice and `asserted_by` on a derivation are the control plane's stamps; a caller cannot pass a derived connection off as a member's or the source's.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 6 (connections as data with their own grade).
- `docs/architecture/BIO_Content_Framework_v0_10.md` §8 (referential connections as data; D-224's stated bound), §8.1 (grade, `asserted_by`'s three authors), §14.4–§14.5 (the connection axis, the pair row), §16 (positional text, REC-206), §17.
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.1 (a portion earns only from what is in it), §5.3, §5.4 (the determining pair; the on-point choice, Bob's second pass).
- `docs/development/LINK-FIDELITY.md` "Links and citations", "The work, in order" (step 8).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7.9 (containment and sight; derived reverse edges filtered by position).
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (retire's `CITED`), I-6 (dangling reference); `BIO_Bundle_Skill_Composite_Design_v1_7.md` C-6.
- `docs/development/SCHEDULER.md` (the `connection-derive` consumer).

### Suggestions

- **Factory.** `connectionsOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `entities` and `content` through theirs (K61). The op handlers move here (K3).
- **Read contract.** Ten readers outside this module join `refs` in SQL (map §3). State `refs(bundle_id, target_id, kind)` as a read contract, as record-core R37 does for `bundles`, or offer `edgesInto`/`edgesFrom`; the job proposes which through BOB.
- **What stays out.** `cite`, `sever`, `reinstate` (`#edgeTransition`) are acts on a document's references and stay with `inquiry`, projecting through R19; `#writeSupersededBy` is `inquiry`'s; the progression table (Framework §8, "The connection table") is `progressions'` (§8.2 generalises it).
- Tests: each C-49 and C-74 refusal gets a negative control; R2 a bound arm at k=33; R16 an over-strictness arm (the same choice twice writes nothing); R28 a promotion of the source after `op=linkproject`. Built work for D-575, D-625, D-706, D-722 and REC-206 is on their `land/worker/*` branches, judged at the job.

## Open for Bob

1. **Is a source's own link a Grade A connection?** Framework §8.1's example of Grade A is a publisher's page linking to another page the record holds. The record keeps such a link as a `links_to` edge between bundles, with no grade. A derived connection reaches `A` only when a reference matches an entity's alias. So the strongest grade the framework names is never given for the source's own link. *Recommendation:* yes (R32). A resolved link between two held documents is a connection graded `A`, asserted by the source. It stays apart from the system's derived connections, and a link whose timing is undetermined is labelled so.
2. **May a member learn that a document exists when it is filed only in a project they cannot see?** This is the same question as `entities.md` question 1. A derived connection shows both documents' digests and hides only a hidden project's bundle id. BOB #35's rulings on D-701 and D-706 hid the digests at `op=links` and `op=linkproject`. *Recommendation:* your 2026-09-24 rule governs. The evidence (a document's digest, what the record read from it, the connection) stays visible. The project, its id and any act written into it are hidden, which is what R26–R27 keep.
3. **Should the item-to-file membership be stored?** REC-206 derives an agenda item's membership in a file each time the document is read, and stores nothing. *Recommendation:* store it as a system-asserted Grade C connection once both the item's document and the file's are held. Re-derive it on a re-read, and let a member confirm or reject it, keeping both acts. Until then it is served only at the read (R30).
