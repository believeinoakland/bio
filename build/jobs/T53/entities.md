# entities (T53)

**Status** · session_018BhcegLAJHLFmviGpxX2jK · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-28)

# entities T53 report (ENTITIES #1)

**Entries applied.**
- **T53-137** (N1257, N1256): `federalOfficesFind({query, viewer})` (`op=federaloffices`, arm in `entitiesOps`): the federal layer's offices (`counterparties` of level `federal` in the active view) whose role, agency, abbreviation or the agency's initials carry every word of the query, at most 20 with `truncated`, each `{role, body, contacts, as_of, layer}`; `VIEWER_MISSING`, `NO_QUERY`, none for an unrecognised viewer. `createEntity` takes `built_in: {role, body?}`: the office is created from the list (label = role, body, contact = portal else e-mail else mail address, law = the federal layer's FOIA with its layer), `named_by_member: false`, `built_in: {layer, as_of}`; an office not in the list is `NOT_IN_BUILT_IN_LIST`. An office a member names herself is marked as before (R63).
- **T53-138** (N1257, K5458; R69, R70): offices store `law_layer`; the lookup resolves a name through `jurisdictions.nameResolve` (R121) over the active layers, a citation over the layers' own `records_laws`; two layers giving it are `NAME_AMBIGUOUS` naming them (level, place) unless `law_layer` is stated; `UNKNOWN_LAW` names each law with its layer. Offices store `layer`; R65/R66's match no longer takes `held[0]`: a name held by offices of two or more layers is `NAME_AMBIGUOUS` naming them, an office of a stated layer matches only that layer's, one with no layer matches as before. `readEntity`, `entitiesOfKind`, `entitiesByAlias` answer `law_layer`, `layer`, `body`, `built_in` (null for other kinds and for rows stored before).
- **T53-139** (JOURNEYS): R71 (a second add with the same folded name and body is the existing office; a different body is a second office; `entitiesOfKind` draws one office per folded name, body and layer, the earliest, however many are stored), R72 and R73 (held already, now pinned by tests: every alias, the first included, carries its declarer; the note is kept and returned for every kind), R74 `subjectsOfProject({project, viewer})`: the `subject_entity` of the project's inquiry documents (`record-core` `listBundles`/`readFile`, `record-grammar` front matter), with their live identifiers, `NO_SUCH_PROJECT` alike for absent, no-project and unseen.
- **T53-140** (K5565): 23 English sites in 10 test files converted (word keys read through `word`/`wordRx`/a local `wordlike.mjs`; SQL and `where` paths are asserted as text of code). Two inline fragments in the module got keys (`entities.index.your_team_s_active_jurisdiction_profiles_give`, `entities.index.valid_when_the_document_was_retrieved`). The words check on `entities`: testenglish 0, 0 failures.

**Not done and why.**
- **R68 is not on the Met line.** Its module side is built and tested, but the federal layer holds no offices yet (`jurisdictions` R119/R120 wait on F4 and the makers' key), and `validate` refuses `contacts` on a counterparty today. The R68 tests build the view from `jurisdictions.combine` over a real layer and add three federal offices to its `counterparties` (`e.view` replaced in the test); until R119 lands, `federalOfficesFind` answers an empty list and the member names the office herself. The fields it reads are `role`, `body`, `abbreviation` (optional), `contacts: [{how, value}]` with `how` in `web|email|mail`, `level: federal`; R119 should use those names or tell me.
- Every other requirement of the entries is met.

**Choices BOB may reverse.**
1. R71 compares the body strictly: an absent body equals only an absent body, so a member naming "Clerk" with no body beside a seeded "Clerk" of a named body registers a second office (R70's `NAME_AMBIGUOUS` still comes first across layers).
2. The in-process `createEntity` takes `layer` for a seeding caller (instance-setup R112); it is not in `DECLARED_OPS` accepts, so the op door never lets a member state it. `law_layer`, `body` and `built_in` are accepted.
3. R73's control ("followed with no note carries none") conflicts with R1/DEC-88 (`ENTITY_NO_NOTE`); I kept R1 (asked BOB, no answer yet).

**Found in other modules.**
- `jurisdictions` R119: the field names above; the `us-federal` layer's `records_laws` holds FOIA, which an office chosen from the list takes as its law.
- `op-declarations`/`op-grades`/`control-plane`: route and grade `federaloffices` (a member read); `entitycreate` now accepts `law_layer`, `body`, `built_in` (a member's chosen-from-list office is not marked, so the door's admission of a member's `office` create from `request` must cover it); `screens-action` sends `built_in`.
- `instance-setup` (seeds): pass `layer` to `createEntity` for a seeded office (R70).
- `build/tests-english-baseline.json` still lists the ten `test/m/entities/` files; they now hold none (outside this module's paths, so I did not edit it).
- `setup-words` rows regenerate at merge for the new ids (`localize` ids in `index.mjs`).
- Tests that failed before my change and still fail (inherited): `instance-setup/seeds`, `journey-check/pseudo`, `affordances/backing` and `t33-backing`, `op-declarations/t35`, `screens-entry/setup`.

**Met** · R69, R70, R71, R72, R73, R74

Tests: 181/181. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegLAJHLFmviGpxX2jK): test runs 1, module lines 2901
