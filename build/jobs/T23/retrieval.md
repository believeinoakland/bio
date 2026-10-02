# retrieval (T23)

**Status** · session_01FjDUYaSx2mcGgMrfcNFUWL · depth 2 · WORKING · handled B1

## Completion (RETRIEVAL #9)

**Entries applied** (`build/plan/current.md` T23 L5: N497, with N469's rule; tests only, no assertion's meaning changed)
- N497: `test/m/retrieval/fixture.mjs` registers promotion's facts under the modules that provide them: `producingGroup` under `instance-setup`, `citedBy` under `connections`, `caseMember` under `publication`.
- N469's rule, notes that named `legacy-store` as a live owner, now name the owner of today or are in the past tense:
  - `fixture.mjs` header and the stand-in tables: `inquiry_basis` is inquiry's (its R40), `inquiry_basis_version_legs` basis-versions', `connections` connections' (its R59); "until each owner's extraction they were legacy-store's". `LEGACY_TABLES` renamed `STAND_IN_TABLES`.
  - `fixture.mjs` `bundles` columns: they are where strength's (`strength_cache`, its R23) and inquiry's (`inquiry_bundle_facts`, its R36) values stood before those owners moved them; the fixture registers no owner, so the fields read them in place (R62's unregistered case).
  - `fields.test.mjs`:3–6: the stand-in tables are for `inquiry_bundle_facts` and `strength_cache`; the columns on `bundles` are where those values stood before.
  - `selections.test.mjs`:267: the `hid` callers are record-core's `counts` (R67, read by `op=stats`) and queue.
- Found while re-scanning, same kind (fixed): `legs.test.mjs`:349–350 and `meaning.test.mjs`:73 named `strength` as the leg-grade resolver's registrant; R55 says it is inquiry's (its R52), registered under inquiry's name. Notes re-worded and the test registrations re-named `inquiry` (`legs.test.mjs`:534, `meaning.test.mjs`:69, :75). No assertion changed.
- Re-scan of `bio-plane/src/retrieval/` and the tests for the other kinds (a T20-deleted file, `tools/`, `legacy-tests`; N469, N471, N480): none. Provenance notes kept: `index.mjs`:179, `checks.mjs`:2 and the "Converted from the old battery's …" headers.

**Deferred**
- `bio-plane/src/retrieval/index.mjs`:222 (`registerLegGrades`' doc comment) and :624 (`#legEarnedCapture`'s comment) say the leg-grade resolver is `strength`'s and reads strength's earned registry. R55 says it is inquiry's (its R52, registered by plane, plane R10), over inquiry's earned registry (inquiry R13). Comments only, no behaviour. Left because changing a source file stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), and B1 said this job is tests only and stales no generated artifact. It is a two-line fix whenever BOB wants it: by CHANGE in this job (red 12 covers the stale bundle until the layer close regenerates it), or in retrieval's next source job.

**Other modules:** nothing found.

**Tests and checks** (on `job/T23/retrieval` after the change)
- `node --test test/m/retrieval/`: tests 122, pass 122, fail 0.
- users of the fixture: `test/m/citation/`: tests 55, pass 55, fail 0; `test/m/ratification/`: tests 192, pass 192, fail 0.
- `node --test test/m/`: tests 5038, pass 5025, fail 1, todo 12, skipped 0. The one fail is accepted red 9, control-plane `inbox-door.test.mjs`:81 (until control-plane's L11 merge, K1117). No other red.
- `checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `checks/architecture.mjs … retrieval`: 23 product files, 76 relative imports; 0 failures.
- `checks/coverage.mjs … retrieval`: 67 of 67 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … retrieval tranche/T23`: 6 files changed by retrieval; 0 failures.
- No generated artifact staled (test files only); nothing regenerated.

Size (session_01FjDUYaSx2mcGgMrfcNFUWL): test runs 4, module lines 2345

## J1 · COMPLETE

N497 applied: fixture.mjs registers producingGroup under instance-setup, citedBy under connections, caseMember under publication. N469's rule: the legacy-store notes in fixture.mjs, fields.test.mjs and selections.test.mjs now name inquiry, basis-versions, connections, strength and record-core, or are in the past tense. Same kind, also fixed: legs.test.mjs and meaning.test.mjs named strength as the leg-grade resolver's registrant (R55: it is inquiry's). No assertion changed; tests only, no artifact staled. Green: test/m/retrieval 122/122; the fixture's users test/m/citation 55/55 and test/m/ratification 192/192. test/m: 5025 pass, 1 fail, which is accepted red 9 (control-plane inbox-door.test.mjs:81). Checks: format 0, architecture 0, coverage 67/67, ownership 0. Deferred, needs your call: src/retrieval/index.mjs:222 and :624 comments also name strength as the resolver. Fixing them would stale the plane bundle, which B1 rules out; a CHANGE can have me fix them. Record: build/jobs/T23/retrieval.md.
