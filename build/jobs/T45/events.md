# events (T45)

**Status** · session_01834bxkNUQSs2DdTKq9mwAW · depth 2 · COMPLETE · handled B2

## Record

**How the reading set was read** (mechanics §17, K2032; B1). Read whole by me: `roles/JOB.md`; `build/manifest.md`; `build/requirements/events.md` (public and private); my entry T45-5 in `build/plan/current.md` and its "Rules at the opening" 1–5 (rule 4 as it stands at my START); K2780, K2781, K2787 in `build/rulings.md`; `BIO_Action_v0_2.md` rules 15 and 17; **all of my module's code** (`index.mjs`, `follow.mjs`, `owner.mjs`, `uses.mjs`, `recorded.mjs`, `schema.mjs`, `time.mjs`, `checks.mjs`; 2,615 lines) and **all of my tests** (`fixture.mjs` and the 11 test files), not only what I changed (P20, plan rule 2). The plan entry names no draft section ("text BOB's at the fold"); the folded R28/R30 text is the one I built to. The 13 used modules' public parts (Purpose and Provides of record-grammar, jurisdictions, civil-time, connection-grammar, legistar-reader, court-doctypes, record-core, membership, provenance, reading-pipeline, extraction, content, entities) were read whole by a helper in this session, given my entry and what follows it (`actions` R66, `docket` R26, `escalation` R30). It wrote me a digest citing each section: none of the 13 mentions `audience`; the refusal shapes, `listenerRefusal` (membership R81), `MODULE_ORDER` (R83) and connection-grammar R6's "passed to every owner unchanged" were the conventions that bore on the change. It also quoted the three callers' lines. The sources stay binding.

**Entries applied (T45-5):**
- **R28** `timeline` takes `audience`, `"public"` or absent (`undefined` or `null`). Any other value (`""`, `"PUBLIC"`, a number, an object…) is refused `{ok: false, reason: "AUDIENCE_UNKNOWN", detail, audiences: ["public"]}` after `NO_SET` and before anything is read: no source is asked and no world read happens (a bad `from` is never reached). There is no filter of its own: under `"public"` the world's lane is exactly what it is without the audience.
- **R30** every registered source's `fn` receives `audience: "public"` under a public timeline, and no `audience` key otherwise. Every source gets the same value, and the viewer still passes unchanged. Per J1 and BOB's B2 (K2805), a source item marked `public: true` keeps `public: true` in its lane exactly as given; the key is never added, and the lane's shape is otherwise unchanged.
- **R36** the `timeline` ops arm reads `audience` from the url (absent when the url names none).
- Refusal row: `AUDIENCE_UNKNOWN` is a plain refusal like `NO_SET` beside it (Terms: a catalogue row only where one exists); **no new catalogue row** for promotion's stamp.
- Tests: `reads.test.mjs` "R28 R30 audience (T45)": the refusal for ten other values with nothing read and NO_SET first; the control (stub sources `actions`, `docket` and `escalation` record `audience: "public"` under a public timeline and no key under none, `null` or `undefined`); the world lane equal with and without it; a source's lane exactly what it answered; a `public: true` mark carried, a non-true mark not invented; the ops arm passing, omitting and refusing the audience. The existing R28, R29 and R30 tests are unchanged and green.

Not-yet-met marks this job meets: **R28, R30** (T45).

**Flaws found in my own module while reading it (P8):**
- The "what we did" lane lists a source's items with no `when` in the same list marked `placed_nowhere: true`, while R29 says such items are "listed apart". The world lane does list them apart. I did not change this, because `case-authoring` and `filings` read the lane's present shape (`ours.sources[].items`), so moving these items is a change to a provided service: it needs BOB's wording of R29 first (step 5). Reported to BOB below; deferred.
- No other flaw found. `withdrawRelation` and `withdrawUse` write one UPDATE outside `#tx`, which is atomic as it stands; I left them.

**Other modules:** none changed. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) composes `events`, so this merge stales it (accepted red 5); I did not touch it. For my callers: `actions` R66, `docket` R26 and `escalation` R30 read `args.audience`, which is `"public"` or absent (no key); an item they mark `public: true` reaches `case-authoring` R57 unchanged.

**Tests and checks run** (final, on this commit):
- `node --test bio-plane/test/m/events/`: tests 64, pass 64, fail 0.
- Every module that uses `events` (29, the `uses` edges in `modules.json`): all pass, except two accepted reds: `filings` 69 pass, 1 fail, "R9 the six sections" (rule 4 (7), also red with `events` at `tranche/T45`, checked); `plane` 195 pass, 1 fail, `roster.test.mjs` "R5, R9" (rule 4 (9)). The rest have 0 failures, including actions 111, docket 59, escalation 63, case-authoring 185, filings' other 69 and control-plane 223. `test/system/migrate-released.test.mjs`: 1 pass.
- `checks/format.mjs`: 153 modules, 152 requirements files; 0 failures. `checks/architecture.mjs … events`: 0 failures. `checks/coverage.mjs … events`: 49 of 49 live ids named by a test; 0 failures. `checks/ownership.mjs … events tranche/T45`: 0 failures.
- The manifest names no layer tests.

Size (session_01834bxkNUQSs2DdTKq9mwAW): test runs 34, module lines 2,615.

## J1 · QUESTION

R28/R30 (T45-5): `timeline`'s "what we did" lane rebuilds each source item as `{at, label, ref, kind}` (R30's item shape). Under `audience: "public"` a source answers "only its public items, each marked `public: true`" (R30, actions R66, docket R26), and R28 says this module "adds, drops and re-marks no item". Rebuilding the item would drop that mark.

My reading, which I am building now: an item a source marks `public: true` keeps `public: true` in the lane, exactly as given; this module never adds the key (an item with no mark, or any other value, gets none), and it changes nothing else in the lane's shape. So callers that read the lane today (case-authoring, filings) see no change unless a source marks its items.

Say if you want the mark dropped instead (the lane strictly `{at, label, ref, kind}`); nothing else I build depends on the answer.
