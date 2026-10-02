# ai-runs (T22)

**Status** · session_01Gz6XqWbqdRpBRjXrgD74xU · depth 2 · COMPLETE · handled B1

## J1 · REPORT

**Stale bundle.** My change under `bio-plane/src/ai-runs/` (comments only, in `index.mjs` and in the SQL comments of `schema.mjs`) stales the plane's bundle, `bio-plane/dist/bio-plane.bundled.mjs`. I regenerated nothing.

**Nothing found in another module** against its requirements.

## J2 · COMPLETE

Complete on `job/T22/ai-runs` @ edb16a868c.

**Entries applied.**
- **N480 (comments only, no behaviour change).** Each note naming the deleted plane `index.mjs` as a live home now names the module that holds it:
  - `ai-runs/index.mjs`:511 `NEEDS`: op-declarations' (`src/op-declarations/index.mjs`).
  - :607 `RUN_VERB_ACTIONS`: declared in op-declarations, the viewer stamp control-plane's.
  - :702 `actor` and :1060 `caller`: stamped by control-plane.
  - :1527 `scopeFor`: admission's.
  - :1548 the credential look: admission's `aiCredentialPresented`.
  - :2457 `assistantPrincipal`: set by control-plane (`control-plane/index.mjs`:2168, :2525). Admission does not set it.
- **N480, found on the re-scan.**
  - :450 named `queuestate.mjs` as the vocabulary's home. It now names observation-log's `CONDITION_KINDS` (`src/observation-log/vocabulary.mjs`).
  - :1665 named "query.mjs's one compilation point". It now names membership's `viewerPredicate`.
  - :2058 cited `provenance-marker.test.mjs`, which was deleted in T20. It now says so.
  - `schema.mjs` had three stale notes: "the capture_sessions shape above", "the observation log below", and an old `principal_plane` form. Each is corrected.
  - Provenance notes are left as they were. Run-rules' row `where`s were not touched.
- **DEC-88.** `bio-plane/test/m/ai-runs/world.mjs`:167 is fixed: `biasAdopt` now sends `reason`, the adopter's words on why the lens is adopted (bias R11). It is the only adoption in my tests. The 6 reds from bias's merge are cleared: 50/56 before, 56/56 after.

**Deferred:** nothing.

**Found in other modules:** none against their requirements. The stale plane bundle is in J1.

**Tests and checks.**
- `node --test test/m/ai-runs/`: tests 56, pass 56, fail 0.
- Whole `bio-plane/test/m`: tests 4846, pass 4788, fail 39, todo 19. Every fail is one your START accepts by name, and none is ai-runs':
  - intent's fixture: 29;
  - queue-producers `proposals.test.mjs`, 4 tests failing through `define` at :39;
  - affordances `backing.test.mjs` R19;
  - `actions/t18.test.mjs`:299 and `scheduler/plane.test.mjs`:85;
  - `inquiry/content-legs.test.mjs`:395;
  - control-plane `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15.
- Checks (civicos-process): format 0 failures; architecture 0 failures; coverage 38 of 38 live ids, 0 failures; ownership 4 files, 0 failures.

Size (session_01Gz6XqWbqdRpBRjXrgD74xU): test runs 5, module lines 2722
