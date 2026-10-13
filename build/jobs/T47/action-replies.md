# action-replies (T47)

**Status** · session_01E2ruMUjxDrmfEsvonrJ9he · depth 2 · COMPLETE · handled B1

## Work

**Read, whole:** `build/requirements/action-replies.md`; `case-inputs` (whole, R8 and R10/R17 being the seam); the
public parts of `action-grammar` (R24) and the used services' code at the call sites (`case-inputs` R8, R16; `bearingFindings`);
the split map `build/extraction/case-authoring-split-2.md` §5, §7; this module's code (`index.mjs`, `checks.mjs`,
`schema.mjs`) and tests (all six files) whole (P20).

**Entries applied (T47-40):**
- (N908) R3, R8: the open-requests source registers once with `case-inputs.registerOpenRequests` (its R8) in place of
  `case-authoring`'s; the dep is `caseInputs` (given), else, at the composition root (`env`), `caseInputsOf(host)`, the
  host's one instance, which `case-authoring`'s factory creates. `uses` already held `case-inputs` (BOB's).
  `open.test.mjs` keeps `case-authoring` built for the sign step (test edge) and asserts the instance it creates is the
  one registered with; a new arm covers the composition-root path.
- (N992) R9: `BEARING_REFUSED` (C-150.3) reads DEC-199's sentence from `refusal.BEARING_REFUSED` by key
  (`ACTION_REPLY_WORDS`, now with `fillWords`, the `case-inputs` form); the row holds it with `{item}` for the screen;
  R1's refusal and R5's proposal answer it filled. `{item}`: "The list of claims" when the count is outside 1–50 (or no
  list), else "Claim <n>" counted from 1, with " (<claim>)" (first 60 characters) when the entry names one. Code,
  number, `where`, behaviour (the `item` field still the 0-based index) unmoved. Clears T46's two close reds (rule 7a).

**Deferred:** none. No flaw found in this module beyond the entries.

**Found in other modules (REPORT):**
- `plane`: `test/m/plane/t45.test.mjs` R39 ("every T45 registration is held once…") calls
  `caseAuthoringOf(...).registerOpenRequests`, red before and after this job (split window, plan rule 8); its re-point
  is the plane's L11 job (split map §5).
- `plan-work`: `test/m/plan-work/fixture.mjs` passes `caseAuthoring: null` to `actionRepliesOf`; that dep is now
  `caseInputs`. Harmless (no `env` is given, so nothing registers), but stale; `caseInputs: null` is its spelling now.

**Tests and checks:**
- `node --test test/m/action-replies/` (bio-plane): 25 pass, 0 fail (new `t47.test.mjs`: R9's row and every R24 arm at
  both acts, with controls).
- Users: `test/m/plan-work/`, `test/m/affordances/t45.test.mjs`, `test/m/case-inputs/`, `test/m/plane/t45.test.mjs`:
  108 pass, 1 fail (the plane R39 arm above, identical without this change).
- `format`: 168 modules, 0 failures. `architecture action-replies`: 9 product files, 0 failures. `coverage
  action-replies`: 9 of 9 live ids, 0 failures. `ownership action-replies tranche/T47`: 8 files, 0 failures.
  `checks/run.mjs`: architecture 0 failures; coverage's 36 failures are other modules', none action-replies'.

Size (session_01E2ruMUjxDrmfEsvonrJ9he): test runs 7, module lines 605

## J1 · REPORT

Found in other modules: (1) plane test/m/plane/t45.test.mjs R39 calls caseAuthoringOf(...).registerOpenRequests, red before and after this job; its re-point is plane's L11 job (split map §5). (2) plan-work test/m/plan-work/fixture.mjs passes caseAuthoring: null to actionRepliesOf; the dep is now caseInputs. Harmless (no env, nothing registers) but stale.

## J2 · COMPLETE

T47-40 applied: R3/R8 register through case-inputs (given, or caseInputsOf(host) at the composition root); R9 BEARING_REFUSED reads DEC-199's sentence by key with {item} filled, clearing T46's two close reds. Module tests 25/0; format, architecture, coverage (9/9), ownership 0 failures. Record: build/jobs/T47/action-replies.md on job/T47/action-replies.
