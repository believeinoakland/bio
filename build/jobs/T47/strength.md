# strength (T47)

**Status** · session_01P5pKUqiXNjTHEqGGQiP9oN · depth 2 · RUNNING until 2026-10-13T19:57:48Z (dependents' tests (affordances, answer-envelope, plane) and a test digest helper) · handled B1

## J1 · COMPLETE

T47-19 is complete on `job/T47/strength` @ 60502756be. It branched from `tranche/T47` @ 159744b8b1. Since then the tranche has only plan and mailbox commits, and none touches a file I read.

**Entries applied**
- **T47-19 (N976; R40).** New act: `projectBarSet({project, capture, connection, reason, author, viewer, identity})`, served as `op=projectbarset` in `strengthOps`.
  - **What it writes.** It writes `required_strength: {capture, connection}` into the project's `bundle.md`, replacing a bar already written there in place. It moves `last_updated` and appends one Session Log entry. That entry names the author, the bar before and after, and the reason. The reason is logged on one line, so a member's own line breaks never open a section of the document.
  - **How it is written.** Through `promotion.promote`, at the state the document already states. It carries the project's other files and the control plane's actor stamps. A refusal from promotion is answered unchanged.
  - **Withdrawing.** Given neither axis, it writes both axes as null, and R14 reads that as absent.
  - **Refusals, in R40's order, each writing nothing:**
    - an empty or machine author: C-32.9;
    - an absent or unseen project: `membership.noSuchProject`;
    - not a project: `NOT_A_PROJECT`;
    - an author who has not joined: `membership.projectAuthority`'s refusal (the control plane's identity stamp is asked when it gives one, else `member:<author>`);
    - an axis given that is not a grade: `BAD_GRADE`, C-107.2;
    - no reason: `PROJECT_BAR_NO_REASON`, the new row C-107.4 in `STRENGTH_BAR_CHECKS`, `where` `projectBarSet > is-project-bar-reason`.
  - **The answer:** `{ok, project, bar, previous, author, at, reason, bundleSha}`.
  - **One site each (K231).** `MACHINE_CANNOT_DECLARE` and `BAD_GRADE` are each minted at one module-level function, `machineCannotDeclare` and `badGrade`, which R15 and R40 both answer through. The `where`s of C-32.9 and C-107.2 now name those functions. Codes, numbers and translations are unchanged.
  - **Untouched.** The group's default is neither read nor changed. Nothing is gated.

**Flaws fixed in my own module (P8)**
- R14's declared-bar `detail` doubled the axis word ("capture capture B, connection C"). It now reads "capture B, connection C". This sentence is frozen into new case documents (`case-authoring`), so new cases read correctly. Signed cases are unchanged.
- R14's absent-bar `detail` and R15's `note` said a project declares its bar "in its bundle.md". They now say it does so by its own act, written into the project's document.
- In the tests:
  - Three titles claimed more than their tests checked (reads "the founder may", pair "R17", factory "R39"). They are re-titled to what is tested.
  - Three assertions that could hardly fail were tightened: C-107.1's translation is now compared exactly; factory's registration check, and testimony's pair shape.
  - The fixture's header comment now credits the earned registry to `leg-earning`.

**Reading set:** read whole by me: my requirements, all of this module's source (`index.mjs`, `arithmetic.mjs`, `method.mjs`, `origins.mjs`, `legs.mjs`, `checks.mjs`, `schema.mjs`), and the Provides I use (`promotion.promote` R1–R20, `membership` R55 and R78). The tests (18 files, 4,229 lines) were read whole by a helper in my session, which wrote me a digest citing file and line (K2032, §17 (3)). I acted on it: the R40 gaps it named (a bar written by hand, a state other than `forming`, a group default set first, exact membership answers, R21, R28 on the act's own sentences) each now have a test, and the flaws above were fixed.

**Deferred (partial tests of older ids the digest named; none is T47's)**
- R15's organisation-wide AI key clause.
- R25 checks a sample of place names.
- R36's per-input caps run only through stand-ins.

Each needs fixture work in another module's shape. I left them for a later strength job.

**For BOB, in other modules**
- (a) `op-declarations`, `op-grades` (T47-48), `control-plane` and `screens-inquiry` (T47-61): `op=projectbarset` exists in `strengthOps`. It reads `project`, `capture`, `connection` and `reason` from the body (`project` also from the query). It takes `author`, `viewer` and `identity` from the query stamps. `identity` is not in control-plane's `IDENTITY_READS` today, so without it the author is asked as `member:<author>`.
- (b) C-107.4 is new, and the `where`s of C-32.9 and C-107.2 moved. Both wait for T48's promotion stamp (plan rule 5 (2)).
- (c) `case-checker/program.mjs` bundles only `strength/method.mjs`, which I did not change, so no generated artifact is stale. The fleet bundle is regenerated at layer close as usual.
- (d) These are red on the base without my change too, so they are inherited, not mine:
  - `case-authoring` R73 (signing wording);
  - `affordances` R48 ×2 (ACT_HELP registry);
  - `answer-envelope` R8;
  - `plane` t46 R33 (sign-in grant) and R5/R9 (project-roster routing).

**Tests and checks**
- strength: `node --test bio-plane/test/m/strength/`: tests 160, pass 160, fail 0. This includes 17 tests in the new `projectbar.test.mjs`, which runs over the real record-core, membership and promotion.
- Users of strength:
  - all green: run-productions 58/58, skills 117/117, reevaluation 141/141, case-grammar 146/146, case-catalogue 16/16, ratification 233/233, case-checker 80/80, case-import 101/101, case-disclosures 97/97, review 46/46, conformance 109/109, consequences 63/63, filings 97/97, action-plans 79/79;
  - with only the inherited reds in (d): case-authoring 209/210, affordances 243/245, answer-envelope 32/33, plane 221/223.
- `format`: 166 modules, 164 requirements files; 0 failures.
- `architecture strength`: 25 product files, 95 relative imports; 0 failures.
- `coverage strength`: 40 of 40 live requirement ids named by a test; 0 failures.
- `ownership strength tranche/T47`: 10 files changed by strength; 0 failures.
- `run.mjs` over the product: architecture 0 failures (3,072 files); format 0; channels 0. Coverage has 44 failures, all in other modules' T47 ids; none is strength's.

Size (session_01P5pKUqiXNjTHEqGGQiP9oN): test runs 16, module lines 2928
