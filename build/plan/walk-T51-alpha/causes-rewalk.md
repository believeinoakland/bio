# Causes of the re-walk defects (copy biosmoke8 at c5f792eb26, branch tranche/T51)

Diagnosis only; no product code was changed. Sources: `rewalk-E.md`, `rewalk-B.md`, `rewalk-A.md` (branches `walk/T51-rewalk10-E`, `-B`, `-A`). Module = the `build/modules.json` entry whose `paths` hold the cause. Local runs: `node --import ./bio-plane/test/platform-sqlite.mjs --test <file>` from the repository root. The live copy was not contacted.

## 1. `GET /api/?op=publishedlist` answers the instance status document (E R56-4 / N6, MAJOR)

**Cause: proved.** `publishedlist` has no arm at the public door, so it falls to the last line of `publicOp`, which answers the bootstrap report for any op nobody claims.

- `bio-plane/src/op-declarations/index.mjs:1034` declares `publishedlist` with `classes: null` (public). Fix round T47 (commit 0b57d31ab9, R63) changed it from `["admin","member","probe"]`, and the comment says "as the door serves it".
- `bio-plane/src/control-plane/index.mjs:998` sends every `classes: null` op to `hooks.publicOp` (line 1183) before any generic forward. The generic forward is what served `publishedlist` while it was gated.
- `bio-plane/src/plane/door.mjs:36` says "the bootstrap report answers any other". `publicOp` asks `publicReadDoorOp` (line 46), `publicationDoorOp`, then `doorbellPublicOp`, then ends at `door.mjs:66` with `bootstrapOp(...)`.
- `bio-plane/src/public-read/door.mjs:20-21` (`PUBLIC_READ_DOOR_OPS`) and `publicReadDoorOp` (lines 87-155) handle verify, publishedmanifest, publishedcase, publishedbytes, docketpublic, docketfeed, credit and publicread. They have no `publishedlist`.
- The store side exists and works: `bio-plane/src/public-read/index.mjs:2090` (`publishedlist: () => r.publishedList()`), and `setup.mjs:2734` reads the same list for `count_published: 4`. That is why the status document says 4 while `cases` is absent.
- This matches the walker's `Server-Timing: publishedlist;dur=756, do-bootstrap;dur=69, do-doorwindow`: the op name is the first metric, and the store was asked for `bootstrap`.

**Local reproduction.** I called `publicOp({op:"publishedlist", ...})` from `plane/door.mjs` with a recording store stub. The answer was `{ok:true, service, version, bootstrapConfigured, test_instance, part_signin...}` with no `cases`, and the only store route asked was `/bootstrap`.

**Owning module:** `public-read` (layer 8; `paths` include `bio-plane/src/public-read/`). The missing arm belongs in `public-read/door.mjs`, as `publishedmanifest` has it. The fallthrough is `plane`'s (`plane/door.mjs:66`) but it is by design.

**Why the tests missed it.**
- `test/m/public-read/door.test.mjs:108` asserts the door answers `null` for `publishedlist`, as "not its own". It never asks who does answer it.
- Every screen test (`screens-action/matter-t51.test.mjs:16`, `screens-inquiry/fixtures.mjs:160`, `screens-daily/home.test.mjs`, `world-A.mjs`) stubs the `publishedlist` read, or reads the store in process (`as.read("publishedlist")`). None goes through `publicOp` or `makeFetch`.
- `op-declarations/t47.test.mjs:367` checks only the table row, not that a door serves it.

**Red test** (module `public-read`, or `plane` as a door test): through `publicOp` (or `makeFetch` with no credential and no session), `op=publishedlist` over a world with one published case must answer a body whose `cases` is an array with that case, and the store must be asked `/publishedlist`, never `/bootstrap`. A second assertion holds the invariant: every op in `OPS` with `classes: null` that is not in `INSTANCE_SETUP_OPS` or a door's list must be claimed by some door arm. That sweep would have failed at T47.

**Smallest fix** (not made): add `if (op === "publishedlist")` to `publicReadDoorOp`, relaying `http://do/publishedlist` as `publishedmanifest` does, and add it to `PUBLIC_READ_DOOR_OPS`. This repairs the Matter page's finding offer (`screens-action/matter.mjs:266`), the project page (`screens-inquiry/project.mjs:420`), Home (`home.mjs:44`) and the front page's published section (`screens-entry/front.mjs:17`).

## 2. Undetermined-binding refusal: "...([object Object])" and raw ids (E N4, MAJOR)

**Cause: proved, in two parts.**

(a) `[object Object]`: `bio-plane/src/conformance/index.mjs:626` and `:627` (`Conformance.datesOf`) build `String(act.why ? \` (${act.why})\` : ...)`. `act.why` is `ev.why` (`index.mjs:451`, `:528`), and `events` has answered `why` as a reason object `{key, vars}` since R54 (`events/reasons.mjs:9`; `events/index.mjs:1063-1067` gives `reason("events.why.placed_nowhere_attestation")`). A template literal turns the object into `[object Object]`. The text then rides `#bindings` (`index.mjs:~794`, `open.why`) into `v2` of the refusal at `index.mjs:1076`. The same defect is at `whenWords` (`index.mjs:2156-2157`), which writes the determination's own document and the act's "when" sentence. The helper that renders it exists: `reasonText` in `events/reasons.mjs:29`.

(b) Raw ids: `index.mjs:1076` fills `{standard}` with `x.standard` (the STD id) and `{v1}` with `b.body`. The screen sends the body as an entity id (R56-2), so `b.body` is `ENT-2026-0006`. `#bindings` already resolves the body's label (`bodyLabel`, lines ~786-790) but keeps it only inside `label` (`"Standard · binds X"`), not as its own field. The standard's citation is not read.

**Local reproduction** (conformance `scene()`, an event placed nowhere, a body entity, outcome noncompliant). It answers exactly: "whether STD-2026-0001-ordinance binds ENT-2026-0002 is undetermined (the act's event is placed nowhere ([object Object])), and an act is found noncompliant only against a standard that binds its body: a member settles it in standards first. Nothing was written."

**Owning module:** `conformance` (layer 9; `bio-plane/src/conformance/`). Its stand-in dependency on `events` is only the carrier of the object.

**Why the tests missed it.**
- `conformance/t35.test.mjs:73-74` does run an event placed nowhere, but asserts only the reason code (`refused(..., "STANDARD_BINDING_UNDETERMINED")`).
- `t35.test.mjs:67-68` asserts `/undetermined/` on the detail.
- `screens-action/fix10-t51.test.mjs:43-46` compares the drawn sentence with the owner's own `detail`, so it is circular. Its world is a period with no end, not an event placed nowhere.
- No test asserts the absence of `[object Object]` or of an `ENT-`/`STD-` id in the member's sentence.

**Red test** (`test/m/conformance/`): the walker's case, `determine` with noncompliant, a body given as an entity id, and an act whose event has no dated attestation. Assert `detail` does not match `/\[object Object\]/` and does not match `/\b(ENT|STD)-\d{4}-\d{4}/`. Assert it names the body's label and the standard's citation. Add the same assertion on the determination document produced by `whenWords` for a determination of an act placed nowhere.

## 3. Plan checks and Timeline say "no time zone" though `@team/time_zone` is set (E N2)

**Cause: proved for the plan checks; the Timeline hint has a separate screen cause.** Local-facts R21 says "every module that needs the team's zone reads this path's governing value" (`build/requirements/local-facts.md:30`). The team zone is a fact kept apart from the profiles: `local-facts/index.mjs:278-281` `#teamZone` is its latest `correct`, else the profiles' agreed zone. A copy with no place profile holds the zone only there.

Action-plans (the walker's plan checks):
- `bio-plane/src/action-plans/index.mjs:1708` `#zone() { return zoneOf(this.actions.place()) || null; }`.
- `actions/index.mjs:462` `place()` returns `#view()`, which is `combine(getSetting("jurisdiction_profiles"))` (`actions/index.mjs:451-459`), so null with no profile.
- `date_past` (`index.mjs:1888-1900`) and `date_before_phase` (`:1925-1933`) then answer `undetermined` with `DAY_UNDETERMINED` (`index.mjs:106`, the word `action-plans.time_zone_held_place`).

Timeline (two causes):
- `bio-plane/src/screens-investigate/timeline.mjs:115-116` decides the hint from `profiles` alone (`!pq.value.profiles.length`), not from the team zone. The screen's own `find-in.mjs:18` already reads `factstatus @team/time_zone`, so the Timeline did not follow R21. The note is drawn whenever an item is placed nowhere and no place is chosen.
- `bio-plane/src/events/index.mjs:249` `zone()` reads `combine(profiles).time_zone` only. It gives the zone to `readDate` (`:299`, `:382`, `:406`, `:470`), `#range` (`:1135`), `:1213` and `:1376`, so a date recorded now gets no zone. The same hint's claim that items are "placed nowhere" for want of a zone is unproven: an item placed nowhere is one with no dated attestation (`events/index.mjs:1263-1265`), and the zone does not change that.

**Remaining readers of the zone that never read `@team/time_zone`** (by grep: no `factStatus` or `TEAM_ZONE_PATH` in the file):
- Through `actions.place()` or `zoneOf(view)`: `actions/index.mjs:252` (`actionZone` fallback) and `:2995`; `action-plans/index.mjs:1708`; `action-producers/index.mjs:181`; `machinery-producers/index.mjs:131`.
- Through `combine(...)` or the active view's `time_zone`: `events/index.mjs:249`; `duties/index.mjs:212`; `following/index.mjs:218`; `investigation/index.mjs:240`; `steps/index.mjs:339`; `inquiry/index.mjs:1317`; `standards/index.mjs:266`; `money/index.mjs:276`; `entities/index.mjs:276`; `monitoring/index.mjs:668`; `lines/index.mjs:194`; `scheduler/index.mjs:196`; `setup.mjs:853`, `:1822`, `:2123`, `:2892`; `screens-investigate/timeline.mjs:116`.
- Already correct: `review/index.mjs:383`, `retrieval/index.mjs:516` (and so `ratification` and `answers`, which ask retrieval), `publish-schedule/schedule.mjs:57`, `case-disclosures/index.mjs:622`, `progressions` (its `zoneOf`), `screens-settings/group.mjs:36`, `screens-daily/find-in.mjs:18`.
- The read to use: `factStatus({path: TEAM_ZONE_PATH}).governs.value`.

**Owning module for the walker's symptom:** `action-plans` (the plan checks, `index.mjs:1708`), with `screens-investigate` (`timeline.mjs:115-116`) for the Timeline hint. Their shared root, `actions.place()` ignoring the team fact, is `actions`. A fix of `actions.place()` or an `actions` zone read through `this.localFacts` (the module already holds it, `uses` includes `local-facts`) would repair `action-plans`, `action-producers` and `machinery-producers` at once. `action-plans` itself does not list `local-facts` in `uses`.

**Words, "UTC day" and "not_met judgement"** (the two are different causes):
- "UTC day": the design's own sentence. `docs/development/ux-substrate/screens/words.json` has `action-plans.time_zone_held_place` (source DEC-260) saying "...not compared with the UTC day in its place", and it names no way to set the zone. The screen draws it by key (`screens-action/plan.mjs:176`), and the plane's `DAY_UNDETERMINED` (`action-plans/index.mjs:106`) says the same. The sentence is right only when no zone is held. Once the zone is read correctly, it is drawn only when truly none is set. The "UTC day" phrase remains design's to reword (a words change; BOB's to hand up).
- "not_met judgement": `screens-action/plan.mjs:196` draws the `no_hostile_branch` check with the plane's key `action-plans.index.phase_id_addresses_someone_outside` ("...a checkpoint whose not_met judgement leads somewhere", `rows.mjs:19549`) instead of the design's own key `action-plans.says.phase_addresses_someone` ("...whose "not met" judgment leads somewhere", `words.json`, DEC-260). Owner: `screens-action`. The fix is to use the design key at `plan.mjs:196` and add it to `words-fix-r56.mjs`.

**Why the tests missed it.** Every action-plans test replaces the zone by setting `w.actions.place = () => ({time_zone: ...})` or `() => null` (`action-plans/t46.test.mjs:74-87`, `t47.test.mjs:16,39-42`, `fixtures.mjs:57`). They never state the team zone through local-facts. `t47.test.mjs` line `seeded({profiles: null})` ("no profile, no zone") asserts the buggy behaviour as the control. The Timeline's R60 test uses a team with no place and never a team that stated a zone.

**Red test** (`test/m/action-plans/`): `seeded({profiles: null})`, then `localFacts.factConfirm({path: "@team/time_zone", act: "correct", value: "America/Los_Angeles", source, how})`. A pending option with a past regulated date must make `planRead(...).checks` hold `date_past` without `state: "undetermined"`. Also a `date_before_phase` check for a violating date must carry `start` non-null. For the Timeline: with the zone stated and no place, `data-nozone` must not be drawn.

## 4. action-plans `date_before_phase` stays undetermined, no start day drawn (E AP2)

**Cause: proved; the same as 3.** `action-plans/index.mjs:1925` computes `start = this.#localDay(msOf(ph.earliest), zone)` with the `zone` of `#zone()` (`:1890`), which is null on a copy that has no place profile. `:1927-1930` then pushes `{check: "date_before_phase", start: null, state: "undetermined", says: ...}` for each of the option's dates. The screen draws exactly that by key (`plan.mjs:178`), and `plan.mjs:184` has the start day only when `c.start` is a string.

One more fact for the re-walk. Even with the zone read, a check is emitted only when the regulated date is before the phase's start day (`index.mjs:1931-1933`). When it is not before, no check is drawn and no start day is shown anywhere. So the walker's expectation of seeing a start day cannot be met by this fix alone; a phase's start day is shown only inside a violating check. That is a design question (does the plan screen state each phase's start day?), not a plane defect.

**Owning module:** `action-plans` (same as 3). **Missed by tests** as in 3 (`fixtures.mjs dateBeforePhase()` sets the zone through `w.actions.place`). **Red test:** as in 3, using `fixtures.mjs dateBeforePhase()` with `place = () => null` and the team zone stated: `read.checks` must equal the control with the profile zone (one `date_before_phase`, `start: "2026-10-14"`).

## 5. Find: "When some documents hold only some of the words" with nothing under it (B F-B10 (a), MAJOR)

**Cause: proved.** `bio-plane/src/screens-daily/finder-states.mjs:226` draws, for a wider reading, the heading `screen.finder.partial.head` and, only when the fields route's `widen` is present, the count line `screen.finder.widen`. It draws nothing else: no list of those documents and no control to open them.

- `ordinance zzzqqq`: the fields route answers `widen = {interpretation: "OR", total: 5, q, detail}` (`retrieval/index.mjs:918-925`). The screen draws the heading and "Documents holding at least one of the words: 5." and stops.
- `alpha-B-6-u3-kbody zzzqqq` (words only in passages): the fields route has no `widen`; the passages route has one (`retrieval/index.mjs:1002-1009`). Lines 223-224 (`reading(p)`) make `wider` true, but `widen` is null, so the heading is drawn over nothing. That is the K5275 state: the passage count is withheld because `screen.finder.widen` says "Documents" while it counts passages, and a design sentence is owed (`build/rulings.md` K5275).
- The wider answer is only a count (`widen` carries `{interpretation, total, q, detail}`), so the screen cannot list rows from it. But the plane already serves the OR reading as a query: F-B9 is FIXED (`ordinance OR zzzqqq` draws title and passage rows).

**Owning module:** `screens-daily` (`bio-plane/src/screens-daily/`).

**Smallest fix** (not made): under the heading, draw one act that re-asks the query with its terms joined by ` OR ` (for the plain query `w.join(" OR ")`, i.e. `ordinance OR zzzqqq`), in both the fields case and the passage-only case, with no count for the passages' grain. In `finder.mjs` `acts[0]` (`op: "search"`, line 310) add a branch for `el.dataset.widen` that does `cs.set("routes", null); cs.set("q", el.dataset.widen)`, as the main search does at the end of `send`. It needs one new word (a button: "Show documents holding any of these words"), which is the design sentence already owed in K5275. Without the word, the same act can borrow `act.search.label.finder`. This lets a member open those documents without a plane change.

**Why the tests missed it.**
- `screens-daily/finder.test.mjs:87-89` and `:244-253`, and `round10.test.mjs:190-204`, assert that the partial sentence and the count line are drawn.
- `round10.test.mjs:233-240` runs the real plane for `household zzzqqq`, but asserts the plane's `widen`, and that no passage count is drawn "under Documents holding".
- None asserts that a member can reach the documents (an act or a link under the heading), and none asserts that the heading is not drawn alone.

**Red test** (`test/m/screens-daily/round10.test.mjs`): with `search` answering `total: 0, widen: {total: 5, ...}` for `ordinance zzzqqq`, the page must contain, after `screen.finder.partial.head`, an act whose press sets the query to `ordinance OR zzzqqq` and re-reads the routes. Second case: passage-only widening (`widen` on `meaningrows`, none on `search`) must draw the same act, and must never draw the heading as the last element of the section.

## 6. Share for review pressed before `reviewcopy` returns does nothing and says nothing (A N-1, MINOR)

**Cause: proved.** `bio-plane/src/screens-publish/review-copy.mjs:145-147`: `held = view.ui.later && view.ui.later.copy; copy = held && held.state === "ok" ? held.value : null; if (!view.ui.draft || !copy) return null;`. The act's `send` returns null, which the shell takes as "nothing to send, nothing to say". `view.ui.later.copy` is the `reviewcopy` read begun at `review-copy.mjs:39` (`P.later(cs, view, "copy", "reviewcopy", ...)`), and it is `loading` for about 1 s. The button (and its reason box) are drawn before that read returns, so pressing in that window is silently dropped. The same `return null` also swallows a `failed` read.

**Owning module:** `screens-publish` (`bio-plane/src/screens-publish/`).

**Why the tests missed it.** `screens-publish/export.test.mjs:89-95` and `common.test.mjs:214` `await open(...)`, which settles every read before the press. No test holds the `reviewcopy` answer back.

**Red test** (`test/m/screens-publish/`): open `/app/review-copy/<project>` with a plane stub whose `reviewcopy` is a never-settled promise, fill name, role and day, press `reviewgrant`. Assert that something is drawn (the `state.loading` word, "Still loading", or the act waits) and that no `reviewgrant` call was sent. Then resolve the read, press again, and assert the call is sent (the control). A second case: a `reviewcopy` that fails must draw the failed state, not nothing. Smallest fix: when `held` is loading, return `{refuse: "state.loading"}` (the word exists, `rows.mjs:78`), and when failed, the screen's failed state.

## 7. The rest of E

**N7 (start an action, refusal words, MINOR).**
- The head, `refusal.ACTION_BASIS_REFUSED` (`rows.mjs:7318`: "...Choose again, or leave it out."), is one sentence for every cause, drawn by `screens-action/actionnew.mjs:171` and `start-send.mjs:213`. "Leave it out" is wrong when the owner's finding is that a request for comment must name questions. Owner: `screens-action` (the word is design's; the head cannot know the cause).
- The finding is the grammar's English, `bio-plane/src/action-grammar/grammar.mjs:182-185` ("a request_for_comment names ZERO inquiries ... action_basis legs of kind advances ... (DEC-13)"), passed through unchanged. Owner: `action-grammar`; the sentence is not localized (no `localize` key) and has plane jargon. Tests assert only that the finding is drawn (`screens-action/fix10-t51.test.mjs`). Red test: the refusal for a `request_for_comment` with no advanced question must not match `/ZERO|action_basis|legs of kind/`.

**N8 (a compliant determination's page offers "Open an escalation" and "Decline to escalate", MINOR).** `screens-action/matter.mjs:531`: `(!live ? ... cs.act("escalationopen", {}) + cs.act("declinetoescalate", {}) ...)`, where `live` is "an escalation exists that has not ended". Neither the determination's outcomes (`k.nc`, the noncompliant standards that `modes` uses at `:116` for `consequencerecord`) nor the owner's rule (the unavailable row at `:415`, "needs a recorded determination that the act did not comply") is consulted. Owner: `screens-action`. Why missed: the tests open a noncompliant determination (`matterWorld`, `determine` defaults to `a: noncompliant`). Red test: a determination with only `compliant` outcomes must not draw `escalationopen` or `declinetoescalate`, and must draw the `screen.matter.unavailable` row. Control: a noncompliant determination draws both.

**H1(b) (the same office named twice by an administrator makes two entities, MINOR).** `bio-plane/src/entities/index.mjs:616`: the dedup by folded name (R65, `existed: true`) runs only `if (marked === 1)`, and `marked` (`:614`) is 1 only for a non-administrator member (`by !== null && !isMachine(by) && !this.#administers(by)`). An administrator or a machine gets `marked = 0`, skips the dedup and always allocates a new ENT id (`:628-630`). That is why the member got `existed` and the administrator got ENT-2026-0009 and ENT-2026-0012. R65 says a member "names again" the held office; it does not state the administrator's case, so this is a gap in the rule as written, to be decided by BOB. Owner: `entities`. Why missed: the R65 tests register as a member only. Red test (`test/m/entities/`): `entityCreate` of the same office label twice as an administrator; the second answer must be `existed: true` with the first id and the office count must stay 1. Control: a different law key stays separate.

**N3 (the Request fold's "Office or body" lists only bodies; a team with none cannot finish, MINOR).** `bio-plane/src/screens-action/request.mjs:81-88` `bodiesOf` keeps only rows of `kind === "body"` from the 200-row `peopledirectory` read (`:47`). The same read can be capped at 200 rows, and institutions are excluded. The fold has no way to name a body on the screen, and the sentence for "no body to choose" is owed (K5285, as the walker notes). Owner: `screens-action`. Why missed: the Request tests seed a body first. Red test: a team with no body entity opens the fold; the form must either offer a way to name the body or say, in its own sentence, that none is held and where one is added (by key).

**N5 (Matter's "Office or body" does not offer the standard's issuer, MINOR).** `screens-action/matter.mjs:188` reads `entitieskind` for `["office", "body"]` only. `conformance`'s `ACTOR_KINDS` (`conformance/index.mjs:130`) are `office`, `institution`, `body`, `movement`, and the standard's issuer (ENT-2026-0005 "City of Walkton") is an institution, so it cannot be chosen. Owner: `screens-action`. Why missed: the fix-10 world's bodies are offices (`fix10-t51.test.mjs:30`, `["City of Oakland"]`). Red test: a team holding an institution that issued the standard must list it in `mt-d-body`. The smallest fix is to add `"institution"` (and `"movement"`) to the kinds read at `:188`. Note that this is one of the two readings the walker called "the design's last layer": the screen can offer it; whether a determination against it binds is `standards`'.
