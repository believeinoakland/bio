# standards (T37)

**Status** · session_01ESQ5WwKNKPndxaWdvzsiH9 · depth 2 · COMPLETE · handled B2

## Record

**Reading set (B1, mechanics §17).** Measured: own requirements 46 KB; the module's code 209 KB and its tests 206 KB (415 KB, so over 300 KB). Not split. **I read these whole:**
- `build/requirements/standards.md`
- layer 5's row of `build/layers.md`
- the code this entry changes and what it calls: `index.mjs` 1060–1340 (R7, R20, R51) and 1700–1990 (R40, R43)
- the tests on R43: `t35.test.mjs`, `t36.test.mjs` and `fixture.mjs`
- the used services R43 names: `civil-time.validAt` (through R20), `law-relations` R9 and R11 (`lawRelationsOf`, through `#incorporatedBy`) and `events` `when` (through `#eventDay`)

**My worker read the rest whole:** `index.mjs` 1–1059 and 1341–end; `checks.mjs`, `schema.mjs`, `instrument.mjs` and `words.mjs`; and the other nine test files. Its summary is about 9 KB. It cites, by file and line:
- every reader of `bindsAt`, `#bindingOf`, `#versionAt`, `#adoptionFrom`, `standard_body_adoptions` and `bindingWords`
- the outside callers: duties :388, conformance :694, publication :1084 and calculations :970
- that none of those nine test files exercises an adoption's binding
- four findings, listed below

None of what it left out mattered.

**Entries applied.**
- **T37-35 (N769).** R43's adoption branch of `#bindingOf` now binds only while the version is in force on the date (R20, R51). Before, an adoption's start alone decided.
  - The earliest adoption started on or before the date is named.
  - The version in force on the date gives `binds`.
  - A version whose in-force state is undetermined gives `undetermined`, naming the adoption and why.
  - An ended version gives `none`: a policy, standard or commitment is then a benchmark, and a law undetermined.
  - `t35.test.mjs`'s R43 test asserted `binds` for an adoption of a version with no end and no record. It now asserts `undetermined`, which is what R43 and R20 require.
- **New tests in `t37.test.mjs`:**
  - adopted, then ended (a standard, and a law)
  - adopted with a recorded `through`, then after it, and after the record is withdrawn
  - adopted with no end and no record
  - an adoption whose start is not read

  All four fail on the old code.

**Deferred, with the reason.** I first applied R40's "up to the next adoption's" inside `bindsAt`, so that a later adoption of another edition ends the earlier one's binding, and then took it out. It is beyond this entry, and through `editionInForce` an unread start on another adoption would make the answer undetermined. QUESTION J1 asks about it.

**Found (reported in J1).**
1. A `cited` or `absent` standard that a body adopted can no longer bind: R20 answers undetermined because its text is not held (R34). That is consistent with R43 as written, but T35's note uses `held: cited` for a paywalled standard known from its adopting ordinance.
2. An imposition checks only the law in force, not the imposed standard's own period. An incorporation checks only that the incorporating standard binds, not the incorporated standard's period. So the three branches differ.
3. R40 lets the adopting act be an event. `adoptionRecord` then stores `body` as null (`index.mjs` :1766), so that adoption never binds and `editionInForce` never sees it. The flaw is in this module; I'm leaving it for BOB's answer because R40 names no body for an event.

**Tests and checks.**
- `node --test test/m/standards/`: 75 pass, 0 fail.
- Modules using `bindsAt`, run before and after the change, all unchanged:
  - conformance: 80 pass, 0 fail
  - duties: 49 pass, 0 fail
  - calculations: 55 pass, 0 fail
  - publication: 121 pass, 0 fail
  - case-authoring: 158 pass, 0 fail
- format: 136 modules, 0 failures
- architecture: 17 product files, 0 failures
- coverage: 42 of 42 live requirement ids named by a test, 0 failures
- ownership: 0 failures

Size (session_01ESQ5WwKNKPndxaWdvzsiH9): test runs 19, module lines 3317

## J1 · QUESTION

T37-35 is applied without waiting on this; my best reading is what I built. (1) Should R43's adoption branch also apply R40's 'up to the next adoption's', so that a body's later adoption of another edition of the designation ends the earlier edition's binding? My reading: not in this entry. I built it and took it out, because through editionInForce an unread start on any other adoption by the body would make the answer undetermined. (2) A cited or absent standard that a body adopted can no longer bind: R20 answers undetermined because its text is not held (R34). That is as written, but T35's note holds a paywalled standard known from its adopting ordinance as held: cited. Is that intended? (3) Findings in this module, not fixed: an imposition checks only the law in force, not the imposed standard's own period, and an incorporation does not check the incorporated standard's own period, so the three binding branches differ. Also, an adoption whose act is an event stores body null (index.mjs:1766), so it never binds and editionInForce never sees it, though R40 allows an event as the act. Fix them in a CHANGE, or leave them for a later entry?

## J2 · COMPLETE

T37-35 applied: an adoption binds only while the version is in force on the date (R20, R51). Tests in t37.test.mjs cover: adopted then ended; adopted with a recorded through, then after it; adopted with no end and no record. t35's R43 assertion is corrected from binds to undetermined. Standards tests: 75 pass, 0 fail. conformance, duties, calculations, publication and case-authoring are unchanged and all pass. format, architecture, coverage (42 of 42) and ownership: 0 failures. My questions are in J1; the record has the details.

## Record, after B2 (K2203)

**Applied.** BOB's answer (1) and (2) say no change. For (3), applied in this job:
- **Adoption by an event.** An adoption whose act is an event (`EVT-`) now stores its body. My reading of "the adopting body is `act`'s issuer" (R40) for an event: the one entity the event concerns (a meeting concerns its body, `events` R22), or its one standing `decider` participant. When it names none, or two, the body is null; none is guessed. That adoption then binds through R43, and `editionInForce` reads it.
- **Imposition.** It now binds only while the imposing law is in force (R20) and the imposed standard's own version is in force. R43 says the law's in-force date and "puts it in force (R20, R40)".
- **Incorporation.** It now binds only while the incorporating standard binds the body and the incorporated version is in force (R43, R20).
- **Requirement text.** Every branch's requirement text already says the version must be in force (R43's "puts it in force (R20, R40)" governs all four branches), so nothing was left as a change of meaning.

**New tests in `t37.test.mjs`:**
- an imposition: the imposed standard ended (a law and a policy), and its end not stated
- an incorporation: the incorporated version ended, and its end not stated
- an adoption whose act is an event: the event's body stored, it binds, `editionInForce` reads it, and two bodies or none store none

All three fail on the previous code.

**Tests and checks.**
- `node --test test/m/standards/`: 78 pass, 0 fail.
- Other modules' tests, all passing:
  - conformance: 80 pass, 0 fail
  - duties: 49 pass, 0 fail
  - calculations: 55 pass, 0 fail
  - publication: 121 pass, 0 fail
  - case-authoring: 158 pass, 0 fail
  - events: 61 pass, 0 fail
- format: 0 failures
- architecture: 18 product files, 0 failures
- coverage: 42 of 42, 0 failures
- ownership: 0 failures

Size (session_01ESQ5WwKNKPndxaWdvzsiH9): test runs 35, module lines 3342

## J3 · COMPLETE

B2 (K2203) applied. An adoption whose act is an event now stores its body: the one entity the event concerns, or its one decider participant; when it names none or two, the body is null. Impositions and incorporations now bind only while the standard's own version is in force (R43, R20); the requirement text already says this for every branch, so nothing was left as a change of meaning. Three new tests in t37.test.mjs fail on the previous code. Standards tests: 78 pass, 0 fail. conformance, duties, calculations, publication, case-authoring and events all pass. format, architecture, coverage (42 of 42) and ownership: 0 failures.
