# duties (T48)

**Status** · session_01XVQxUC4jHBQE5EcYVKTZdU · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R33's mapping, two paths that fit no code exactly; my best readings, on which I proceed: (1) a required response (R30) whose governing view holds SEVERAL deadlines a body owes the report's issuer and none named → `due_not_computed` (the profiles do hold rules, so `deadline_not_held`'s 'holds no rule' would be false; zero such deadlines → `deadline_not_held`). (2) no match held, and civil-time cannot settle whether asOf is past a due date held at a coarse precision without candidates (e.g. a commitment date of month precision) → `due_between_days` (the due date depends on a day the record does not settle); `order_unsettled` I keep for a matched event's comparison not settled by precision, and a matched event against a due with candidates (civil-time's POSSIBLY_OVERDUE) → `due_between_days`. A matched or measured occurrence whose due is undetermined takes the due's own code. Say if either should differ.

## Completion

**Entry applied.** T48-22 (N1044, K3150): R33. `occurrencesOf` answers, beside `why` (unchanged, still what transitions record as `cause`), `reason` on every occurrence: `null` unless the state is `undetermined` (the "possibly overdue" band among them), then `{code, says}`. `OCCURRENCE_REASONS` (six codes) is exported frozen from `vocab.mjs` and re-exported unchanged by `index.mjs`. `says` is `duty.reason.<code>` read by key (`reasonWords`, which throws on a code with no words) from `DUTIES_REASON_WORDS` in `checks.mjs`. `words.json` holds none of the six keys, so they are interim words in DEC-149's form, taken from the requirement's suggestions. The only one reworded is `deadline_not_held`: "Your group's Civicsmith holds no rule for this deadline yet." The list is kept apart from `DUTIES_WORDS`, so R32's three file-verbatim keys stay exactly as R32's test reads them. No catalogue row was added. Mapping (J1, ruled K3243): trigger placed nowhere or undated → `trigger_undated`; no rule held, or no deadline owed to a report's issuer → `deadline_not_held`; civil-time undetermined, a throw, an unknown basis, or several deadlines owed with none named → `due_not_computed`; candidates or an unsettled due against `asOf` (including a matched event against a due with candidates) → `due_between_days`; a matched event placed nowhere, undated or open-ended → `match_undated`; a matched comparison unsettled by precision → `order_unsettled`; a match or measured evidence against an undetermined due → the due's own code. `dutiesArisingIn`'s projection is unchanged (R31 does not name `reason`).

**Read.** My requirements, `vocab.mjs`, `schema.mjs`, `checks.mjs` and `index.mjs`, whole, myself, along with `fixture.mjs`, `occurrences.test.mjs` and `t46-words.test.mjs`. The reading set was over its limit, so the other seven test files were read whole by one helper, and the public parts of civil-time, extraction, local-facts, events, standards and membership, with `words.json` and DEC-149, by a second. Each wrote me a digest citing file:line or requirement ids (K2032, mechanics §17 (3)).

**Flaws dealt with in my own module.** `contract.test.mjs`'s R23 no-place check now also covers `OCCURRENCE_REASONS` and `DUTIES_REASON_WORDS`. `exports.test.mjs` read the profile's zone as a literal and now uses `ZONE`. Deferred: none. The helper also noted `acts.test.mjs:90` (a deliberate count of 17 accepted rows) and `exports.test.mjs:130` (a 50-key sample beside real keys for R24's regex form). Both are kept as they are: each checks what it states.

**Found in other modules.** None caused by this change; no generated artifact made stale. The plane bundle regenerates at layer close.

**Tests and checks.**
- duties: `node --test bio-plane/test/m/duties/` — tests 74, pass 74, fail 0 (new `t48-reasons.test.mjs`, 9 tests naming R33: each code's path, K3243's paths explicitly, the met/met_late/discharged/pending/overdue control, the route).
- Modules that use duties (20, with `test/system/migrate-released.test.mjs`): tests 2255, pass 2234, fail 21. The failures fall in 13 files (affordances t36, answer-envelope, control-plane envelope and t46-e2e, following checks, op-declarations t33–t47, scheduler plane). Those 13 files give an identical 131 tests, 111 pass, 20 fail on `origin/tranche/T48` and on this branch: inherited reds, none in duties. The 21st in the full concurrent run did not recur in isolation.
- `node checks/format.mjs` — 0 failures; `architecture.mjs … duties` — 14 product files, 0 failures; `coverage.mjs … duties` — 33 of 33 live ids named, 0 failures; `ownership.mjs … duties tranche/T48` — 0 failures.
- `node checks/run.mjs /home/user/bio` — format 0, architecture 0 failures (none in duties), coverage 45 failures (none in duties), channels 0.

Size (session_01XVQxUC4jHBQE5EcYVKTZdU): test runs 9, module lines 2242

## J2 · COMPLETE

T48-22 applied: R33 met (reason on every occurrence; OCCURRENCE_REASONS frozen; interim words duty.reason.* by key, DEC-149 form; K3243's mapping tested path by path). duties 74/74; users' tests: only inherited reds, identical on tranche/T48 (20 in 13 files: affordances, answer-envelope, control-plane, following, op-declarations, scheduler). Checks 0 failures for duties; run.mjs architecture 0. Record: build/jobs/T48/duties.md. Provider for T48-59: notice-producers reads reason.says. BOB: name the six duty.reason.* keys to the design stream.
