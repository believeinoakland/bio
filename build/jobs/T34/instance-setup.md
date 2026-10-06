# instance-setup (T34)

**Status** · session_01S3X36eJb4QMNJh8gf2c6jK · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

Readings I am building on (carrying on with each; none blocks me yet except (1), which I need before my merge):

1. **`modules.json`: `queue-producers` is missing from instance-setup's `uses`.** R62 registers `placeArrivals` with `queue-producers` (`registerPlaceArrivals`, its R38), so this module must import `queueProducersOf` from `bio-plane/src/queue-producers/index.mjs`; architecture check 1 refuses that import until `uses` names it. Please add `queue-producers` to instance-setup's `uses` on `tranche/T34` (BOB's file).
2. **R50 on the first profile as held:** its counterparties carry `ids.body` (Legistar BodyIds) and no `ids.office`, and `within.ids` is `[]`. My reading: each entity is seeded when, and only when, the profile gives its own identifier: the body is seeded under `ids.body` even when the office has none; the office is answered could-not-be-seeded (no `ids.office`), and so are `post_in` (no office) and `part_of` (`within` has no identifier). R51 then finds the body through a new ledger of seeded bodies (`seed_bodies`, purge-clear like the other seed tables), not only through a seeded office.
3. **R52's `member_types` with `organisation` (jurisdictions R60, K1729):** the seat's body's organisation is the matched profile counterparty's `organisation`, else the Legistar body's form under the body-variant map; an entry for that organisation is read before one with no `organisation`. Today's code ignores `organisation`, so on the first profile every Council seat would read undetermined.
4. **R65's `assistant` (control-plane R57 resolves it at the door):** my route reads it from the query as `assistant` (JSON `{on, account}`), a stamp like `by`, never from the body. CONTROL-PLANE #23 needs the same; tell me if you rule another channel.
5. **R65, an `answers` list that is not a list of `{question, text}` with each `text` a string of at most 1,000 characters:** refused `GROUP_DRAFT_NO_ANSWERS` only when every text is empty; a malformed list or an over-long text is refused by a new row `GROUP_DRAFT_ANSWERS_MALFORMED` ("The questions are answered in a short list, each answer at most 1,000 characters. Nothing was saved."). R65 names no code for it.
6. **Row numbering:** `PLACE_NAME_MALFORMED` C-64.8 and `GROUP_DRAFT_NO_ANSWERS` C-64.9 (then (5)'s row C-64.10); R64's `MACHINE_CANNOT_SET_LANGUAGE` C-119.11 and `LANGUAGE_MALFORMED` C-119.12; all `awaiting stamp`.
7. **R62's registration shape:** I register `({viewer}) => placeArrivals({viewer})` once at start through `queueProducersOf(ctx).registerPlaceArrivals(read)`; R62 compares at each start only (not on an administrator's read).
8. **R64:** a `by` that is absent or a machine (`class:…`) is refused `MACHINE_CANNOT_SET_LANGUAGE`; a tag is kept as given (trimmed) when `Intl.getCanonicalLocales` reads it as one tag, as jurisdictions' `isLocale` does (not exported, so the reading is repeated here; noted for jurisdictions).

## J2 · REPORT

B2–B6 applied (B6 was already done: `HOSTING_CONTROL` now says "who controls your group's Civicsmith", "controls it", "claim it again", "your group's Civicsmith can be claimed again").

1. **For QUEUE-PRODUCERS #13 (B2):** R62 is exposed in its shape: `placeArrivals({viewer: null})` → `{ok: true, arrivals: [{name, profile, profile_name, covers, found_at}]}` (the plane's in-process read; an administrator viewer gets the same, any other viewer `arrivals: []`). **R14's act of choosing a place is `op=profilesset`, body `{profiles: [<profile id>, …]}`** (the whole ordered list, an administrator's own session, `by` stamped), not `placeset`; there is no `placeset`. An arrival leaves when that op makes its profile active.
2. **A construction-order hazard in the registration (queue-producers, plane).** `queueProducersOf(ctx, deps)` memoizes the first instance per storage with the deps of its first caller. If instance-setup's `start` calls `queueProducersOf(ctx)` to reach `registerPlaceArrivals`, it creates the producers with no deps before `queue` asks for them with the providers the plane hands it (`Queue.PRODUCER_DEPS`), and those providers are lost. My start therefore registers only through a producers object it is handed (`deps.queueProducers`) and says so when it has none (`started.arrivals: {ok: false}`); it does not call `queueProducersOf` itself. Recommendation: either QUEUE-PRODUCERS #13 makes `registerPlaceArrivals` callable without constructing an instance (a module-level function keyed on the storage, as its own instance reads at R38), and I call that; or PLANE #23 hands instance-setup `queueProducers` when it constructs it. Tell me which; I wire it after queue-producers merges.
3. **Measured (N613, T34-57), informational:** on the first profile as held, over legistar-reader's captured Oakland JSON (2026-10-05): R50 seeds 3 bodies (Finance Department 171, Oakland City Council 1, Office Of The City Auditor 16) under `legistar_body_id`, no office (no counterparty carries `ids.office`) and no `post_in` or `part_of` (`within.ids` is `[]`); R51's bridge is **3 of 5** (the Council by its organisation `city_council`, with its cancellation form BodyId 226 added; the Grand Jury and the State Controller unmatched, no candidates); R52 seeds **46 seats, 46 holders, all `elected`** (35 Member and 1 Chair on BodyId 1, 10 Member on 226), 0 undetermined, 26 persons new and 20 already held, 9 same-name pairs, 2 matched bodies with no office records (Finance, Auditor). Every Council office record in the capture ends before 2026-10-06 (none open), so every `holds` line is bounded in the past: M-P2's staleness, `lines`' open point.
4. **For jurisdictions (next.md, layer 1 closed):** `isLocale` (R37's reading of a BCP 47 tag) is not exported, so R64 repeats it (`Intl.getCanonicalLocales`, no whitespace or comma). Exporting it would leave one reading.
5. **Stale generated artifact:** the `newgroup` bundle (installer's `writeMember`, inputs include `setup-fleet.mjs`) is stale from my change to `HOSTING_CONTROL`; the plane bundle from `setup.mjs`. Both are regenerated at the layer close.

## J3 · REPORT

The split's swap is done on my branch (pushed): my copy of the page is deleted; `setup.mjs` composes `setup-page`'s `PAGE_HTML` with R47's block in `HOSTING_SLOT` and re-exports `SETUP_HTML`, `setupPage` and `groupLine`; the moved test arms are deleted (seam §5). My suites: 97 of 99 pass; the two R65 arms fail only until wizard-scripts merges (both pass with its job branch overlaid: they read its `ASSISTANT_DRAFT_UNAVAILABLE` row and `checkDraft`). Checks: format, architecture, coverage (47 of 47) and ownership (18 files) 0 failures.

Users' tests, run on my branch against `tranche/T34` (the 11 files that import `setup.mjs` or `setup-fleet.mjs`): 94/2 on the tranche, 92/4 on mine. The two new reds, each another module's test pinning what this job changes:
1. **plane** `bio-plane/test/m/plane/door.test.mjs`:105 (R1, R5, K1690) pins `instanceSetupOps` at **20** routes and drives each. This job adds four, each a T34 requirement: `placewanted`, `placewantedstate` (R60), `memberlanguageset`, `memberlanguage` (R64), so 24. PLANE #23 needs to drive them: `placewanted?by=admin` POST `{name}`, `placewantedstate?viewer=admin`, `memberlanguageset?by=<member>` POST `{language}`, `memberlanguage?viewer=<member>`. (`groupdescriptiondraft` is not a route: the door calls it in-process, your B3.) Red from my merge until plane's.
2. **installer** `newgroup/test/requirements.test.mjs`:469 (R34) pins the block's old words ("controls the copy", "claim the copy again"). INSTALLER #8's branch has already re-worded that test, so it is red only from my merge until installer's.
The other two reds (plane `step.test.mjs` R2/R10, control-plane `families.test.mjs` R22) are red on the tranche without my change: accepted reds 8 and 9.

Also for op-declarations (its R26, R28): the four ops above are served by my routes now.
For `modules.json` (BOB's): instance-setup no longer imports `record-grammar` or `action-grammar` (they went with the page); its `uses` may drop them. It now imports `setup-page`.

## Completion (T34-57, T34-81, T34-90, T34-87's rows; the split's swap, K1851)

**Entries applied.**
- **The split (K1851; seam read §0–§5).** My copy of the page (`setup.mjs` 1–1636) is deleted. `setup.mjs` composes `setup-page`'s `PAGE_HTML` with R47's block in `HOSTING_SLOT` (`SETUP_HTML`), serves it through `setupPage(read)` (the unread group line replaced by the read's) and re-exports `groupLine`, so control-plane and every importer are unchanged. `setup-fleet.mjs` stays the one home of the block for the page and the installer. The moved test arms are deleted (`loads`, `intake`, `keys`, `worker-page` whole; `page` except R47; `profiles` R15's Miniflare arm; `assistant`'s page arm; the fixture's `pageOver`); R31 and R47 stay over the composed page.
- **T34-57.** R50–R52 seed from the first profile as held (N613). Each entity is seeded when, and only when, the profile gives its own identifier (J1 (2), accepted): a body under `ids.body` with or without its office, through a new body ledger `seed_bodies` (purge-clear, backfilled from `seed_offices`). R51 finds the matched body there, and R52's `member_types` read an entry for the seat's body's organisation before an all-bodies one (jurisdictions R60, K1729; J1 (3)). R53's sentences (K1755: the member's own account or the group's key; no credential bound).
- **T34-81.** R60 `placeWantedSet`/`placeWanted` (`op=placewanted`, `op=placewantedstate`; tables `place_wanted`, `place_seen`; export never). R62 `placeArrivals`: compared at each start, recorded once per name (`place_arrivals`), left when the profile is made active (R14) or the name is cleared or changed. It is registered with `queue-producers` R38 through `deps.queueProducers`, which the plane hands (B7), in B2's shape `{ok, arrivals}`. R64 `memberLanguageSet`/`memberLanguage` (`op=memberlanguageset`, `op=memberlanguage`; `member_languages`). R47's block, R53's and R55's words (DEC-149).
- **T34-90.** R65 `groupDescriptionDraft({answers, assistant, viewer, by})`, called in-process by the door (B3). Refusals in order: `NOT_AN_ADMIN`, `ASSISTANT_OFF`, `GROUP_DRAFT_ANSWERS_MALFORMED` (J1 (5)), `GROUP_DRAFT_NO_ANSWERS`; then wizard-scripts' `ASSISTANT_DRAFT_UNAVAILABLE` while no model turn exists (N686). The draft path a T35 turn takes is built and tested through an injected turn: wizard-scripts' `checkDraft` (firsthand false), the label `{kind: "machine", asked_by}`, holdings only with the account's suggestions switch on, and R109's limits. It writes nothing.
- **T34-87 (DEC-149, R63).** My 23 rows (`setup.mjs` :1701, :1731, :1742, :1755, :2245, :2351, :2368, :2371, :2373, :2451, :2479, :2493, :2502, :2925, :2933, :2945, :2947, :2958, :2959; `setup-fleet.mjs` :22, :24, :25, :31) and C-119.4's translation say "your group's Civicsmith" or need no name. Each is named by a test in `words.test.mjs`, which also sweeps every translation and sentence the new acts answer.
- **Rows, all `awaiting stamp` (plan Rules (5) 4):** new C-64.8 `PLACE_NAME_MALFORMED`, C-64.9 `GROUP_DRAFT_NO_ANSWERS`, C-64.10 `GROUP_DRAFT_ANSWERS_MALFORMED`, C-119.11 `MACHINE_CANNOT_SET_LANGUAGE`, C-119.12 `LANGUAGE_MALFORMED`; re-worded translations C-64.3, C-119.1, C-119.3, C-119.4, C-119.5 (the catalogue version moves with promotion's T35 stamp).

**Measured (N613), informational.** First profile as held, over legistar-reader's captured Oakland JSON (2026-10-05):
- R50 seeds 3 bodies under `legistar_body_id` (Finance Department 171, Oakland City Council 1, Office Of The City Auditor 16). It seeds no office (no `ids.office`) and no line (`within.ids` is `[]`).
- R51's bridge is 3 of 5 (the Council by `city_council`, its cancellation form 226 added).
- R52 seeds 46 seats and 46 holders, all elected, 0 undetermined, with 9 same-name pairs.
- Every Council record ends before 2026-10-06 (J2 (3)).

**Deferred:** nothing in this module.

**Found in other modules** (reported: J2, J3):
- **plane:** `door.test.mjs`:105 pins 20 instance-setup routes. It needs the four new ones (PLANE #23).
- **installer:** `requirements.test.mjs`:469 pins the old block words. Already re-worded on INSTALLER #8's branch.
- **jurisdictions:** `isLocale` is not exported (to N700).
- **modules.json:** `record-grammar` and `action-grammar` are no longer imported by this module.
- **Stale artifacts:** the `newgroup` bundle (`setup-fleet.mjs`) and the plane bundle (`setup.mjs`); both regenerate at the layer close.

**Tests and checks** (on `job/T34/instance-setup` merged with `tranche/T34` @ `c0c118e989`):
- `node --test bio-plane/test/m/instance-setup/*.test.mjs`: **tests 99, pass 99, fail 0**.
- Users' tests (the 11 files importing `setup.mjs`/`setup-fleet.mjs`): 92 pass, 4 fail. Two are red on the tranche too (accepted reds 8, 9); two are the plane and installer pins above.
- Layer tests: none named in the manifest.
- `format`: 0 failures. `architecture instance-setup`: 0 failures (19 files). `coverage instance-setup`: 47 of 47, 0 failures. `ownership instance-setup tranche/T34`: 18 files, 0 failures.

Size (session_01S3X36eJb4QMNJh8gf2c6jK): test runs 24, module lines 5274 (src 2472, tests 2802)

## J4 · COMPLETE

T34-57, T34-81, T34-90 and my T34-87 rows applied, with the split's swap (K1851). See the record's Completion section. On job/T34/instance-setup @ e5e7394590, merged with tranche/T34 @ c0c118e989: my suites 99/0. Checks: format, architecture, coverage (47/47) and ownership (18 files) 0 failures. Two users' pins go red at my merge until their own jobs merge (J3): plane door.test.mjs:105 (20 routes; 4 new) and installer requirements.test.mjs:469 (old block words, already re-worded on its branch). Rows C-64.8–.10 and C-119.11–.12 new; C-64.3 and C-119.1, .3, .4, .5 re-worded; all awaiting stamp. Stale: the newgroup and plane bundles.
