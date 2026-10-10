# filing-templates (T41)

**Status** · session_01NehprHgv3ad7XrEC8kKYLY · depth 2 · COMPLETE · handled B1

## Completion (FILING-TEMPLATES #7)

**Reading set** (mechanics §17): BOB measured 298 KB. I read these whole: `build/requirements/filing-templates.md`; the START (B1); plan entry T41-48a and the opening's rule 4; K2408 and K2442; membership's R18, R43, R44, R54, R60, R64, R65, R77, R80, R85 and R88 (the services named in my Uses that D54 changed); membership's Completion, "Users' suites" (my five lines); `bio-plane/src/filing-templates/index.mjs`; and the test files I changed (`fixture`, `lifecycle`, `reads`). I grepped the other test files (`draft`, `grant-channel`, `review`, `invariants`) for administrator and founder sight, and read whole the one place that relies on it (`invariants.test.mjs` R17). I did not read the rest of the reading set (other used modules' public parts, `blanks.mjs`, `checks.mjs`, `schema.mjs`) whole, because a tests-only entry about one service's sight does not depend on them.

**Entry applied (T41-48a, tests only; N822, K2442).** Each test below is now written for D54 and carries a negative control. In the fixture, P stays hidden. The fixture gains `discoverable(project)`, which writes `project_sight` the same way membership's visibility act indexes it (R85).
- `lifecycle.test.mjs`:12, the R10 refusals (red at :218). Erin, an administrator neither invited nor joined, is now refused `NO_SUCH_TEMPLATE` at the hidden P. Control: once invited, she is refused `NOT_AN_APPROVER`, as before.
- The R10 widen test (red at :250). Erin's widen of the hidden P's template is refused `NO_SUCH_TEMPLATE` and writes nothing. Control: once P is discoverable, an administrator sees it whole and widens as before, while dave (a member outside P) still sees none of it.
- The R11 group-wide retirement (red at :287). Erin's widen is refused while P is hidden; once she is invited it succeeds, and then she retires the template.
- `reads.test.mjs`:188, R20. Erin's widen is refused, and she gets no queue item from the hidden P. Control: once invited, she sees the item and widens.
- `reads.test.mjs`:234, R24. Erin, the founder's bare `admin` and `member:admin` are each answered as absent everywhere (`templatesFor`, `proposed`, `templateRead`, `offeredVersion`, `templateComments`), and the widen act is refused too. Controls: on a discoverable project, the administrator and the founder see the template whole and dave does not; at the hidden P, an invited administrator sees it.
- `reads.test.mjs`:298 and :360, R26. The administrator who widens P's templates is invited to P, and :360's widen now asserts `ok`.
- I also fixed a flaw in my own tests. `invariants.test.mjs` R17's administrator widen and retire steps did not check their answers, so they had been silently refused since D54 while the test stayed green. Erin is now invited, and both steps assert `ok`.

**Product code:** unchanged. No read in this module uses the founder's or an administrator's sight as an internal see-all. The module's sight goes only through `viewerPredicate` and `inSight` with the caller's viewer, and its queue read uses whatever viewer it is given.

**Action-grammar R13 (same layer):** my code and tests do not list `CORRESPONDENCE_OUTCOMES`, `none_exists` or a records request's `seeks` / fields. I use only `RISK_TIERS`, so nothing here depends on that change.

**Final `uses`:** unchanged: `record-grammar`, `jurisdictions`, `record-core`, `membership`, `action-grammar`.

**Deferred:** none. **Found in other modules:** none. **Generated artifacts:** none staled (tests only).

**Ran.**
- `node --test bio-plane/test/m/filing-templates/*.test.mjs`: before, 7 failing tests, at the five listed lines (rule 4 (11)); after, tests 56, pass 56, fail 0. The manifest names no layer tests. I changed no service, so I ran no users' suites (my fixture is imported by no other module's tests).
- `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures. `checks/architecture.mjs`: 11 product files, 34 relative imports; 0 failures. `checks/coverage.mjs`: 27 of 27 live requirement ids named by a test; 0 failures. `checks/ownership.mjs` against `tranche/T41`: 0 failures.

Size (session_01NehprHgv3ad7XrEC8kKYLY): test runs 6, module lines 1787
