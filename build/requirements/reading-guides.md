# reading-guides — requirements

**Status** · Draft, BOB's (K2405, K2418, K2420): a new product module Bob approved (D51 A, D1), placed by BOB, written at T41's opening from `build/plan/draft-T41-investigation.md` §3.4 (N820; D8, D24, D65). Every requirement not yet met (T41).

**Size (P6).** About 900 lines.

## Public

### Purpose

Reading guides say what to look for in one kind of document (D8): by hand a checklist, for the AI what to read for, so the two are the same thing (D65). Civicsmith's library ships to every group; each group keeps its own; guides are offered across groups and reviewed before adoption. A guide says what to look for, never how the AI may behave (D24).

### Provides

Terms. A **guide** is `GUD-` (`record-grammar` R53): `{id, kind, origin, items, state, author, reviewed_by, based_on}`; `kind` a document kind (`doctypes`); `origin` `civicsmith`, `group` or `adopted`; each **item** `{label, look_for, where?}`, short plain strings. A **state** is `draft`, `usable_by_author`, `group`, `retired`.

- **R1** *(not yet met: T41)* `CIVICSMITH_GUIDES` is frozen data carried with the release, each guide approved by Bob or someone he names, each carrying the record of measured use that showed it works; read-only to every group.
- **R2** *(not yet met: T41)* `guideDraft({kind, items, based_on?, by})` by a member: usable by its author at once (`usable_by_author`). A machine may draft (`guidePropose`, labelled, R12), never approve.
- **R3** *(not yet met: T41)* `guideReview({guide, verdict, reason, by})` by another member (never the author): `approve` makes it the group's; `refuse` keeps it its author's with the reason. History kept.
- **R4** *(not yet met: T41)* `checkGuide(items)` (pure) refuses `GUIDE_CARRIES_CONDUCT`, naming the item, any item whose text names an act, op, tool, rule, the assistant, a permission or a control-flow pattern (`skills` R16's `controlFlowAuthority`), or is not a look-for statement (BOB's closed lists at the job's START); every draft, review, adoption and render runs it. No guide can loosen a rule (D24).
- **R5** *(not yet met: T41)* `guideFor({kind, viewer})` answers the guide in force for a kind: the viewer's own usable guide when she asks, else the group's, else Civicsmith's, else none, with its origin. Never throws.
- **R6** *(not yet met: T41)* (D8 cross-group) `guideOffer({guide, by})` by a group member answers the guide's canonical bytes and digest, labelled with the offering group's slug, for another group; `guideAdopt({bytes, by})` imports one as `adopted`, `based_on` the offer's digest, usable only after R3's review in the adopting group. A guide many groups use may be exported marked as a proposal for Civicsmith's library (`guideProposeToCivicsmith`); Civicsmith's adoption is a release's, not this module's. The channel between groups is registered later (`registerGuideChannel`, K31's pattern; `network-notices`), BOB's.
- **R7** *(not yet met: T41)* `guideRetire({guide, reason, by})` by an approver of its scope; retired guides stay readable; nothing is deleted.
- **R8** *(not yet met: T41)* `guidesOf({kind?, state?, viewer})` lists guides the viewer may see, at most 200, `truncated`.
- **R12** *(not yet met: T41)* `guidePropose({kind, items, run, by})` stores a machine draft apart, labelled (`record-grammar` R42); only a member's R2 act with `based_on` makes it a guide.

## Private

### Uses

- `record-grammar`: `ID_TABLE`'s `GUD` and `isGuideId` (its R53), the proposal labels (its R42).
- `civil-time`: dates of reviews and adoptions.
- `record-core`: `declareTable` (R9).
- `membership`: members, the group's sight (R2, R3, R7).

### Invariants

- **R9** *(not yet met: T41)* Tables declared through `record-core.declareTable`, purged with the store; a group guide's sight is the group's.
- **R10** *(not yet met: T41)* A guide never grades, concludes, or names a body's conduct; its items say what to look for and where.
- **R11** *(not yet met: T41)* Each refusal carries its row in this module's own `checks.mjs`, a new family. No place is named in behaviour or outward text.

### Satisfies

- The investigation design of record (K2417): D8, D24, D65; D1's "reading-guide library".

### Suggestions

- Paths: `bio-plane/src/reading-guides/`; tests `bio-plane/test/m/reading-guides/`.
