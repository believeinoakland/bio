# ratification (T16)

**Status** · session_01WThj1yrmjFsd1tK4dDXbRh · depth 2 · WORKING · handled B2

## J1 · QUESTION

R18's shape and five readings. I am building on these now; case-authoring can code against the shape today. Tell me if any is wrong.

1. **Shape.** `ratificationOf(host).caseRatifyPreflight({text, signer, viewer})` answers `{ok: true, ready, refusals}`. `refusals` lists every refusal that holds, each asked on its own (not stopping at the first), in R18's order. `ready` is true when the list is empty. Each entry is the act's own refusal body, built by the same function the act now calls. The one difference: the act's trailing envelope `store` and `tokenClass` (as appended after C-53.12, C-92.10, C-92.11, NO_SIGNERS and GATE_REFUSED) is not included, because the Durable Object side does not know the store's name. The gate's entry is the act's `{ok: false, reason: "GATE_REFUSED", gateVersion, findings}`. If something unexpected fails, the answer is `{ok: false, reason: "PREFLIGHT_UNDETERMINED", detail}`, never a throw.
2. **C-32.13 / C-32.15 from `viewer`.** R18 is given no credential class, so I read it from the control plane's viewer stamp. `class:ai` or `class:ai/<id>` is an agent credential: C-32.13, and C-32.15 also holds, both with `tokenClass: "ai"`. Any other machine identity `class:<cls>` gives C-32.15 with `tokenClass: <cls>`. A member's or the founder's session viewer gives neither. A null viewer is an internal caller and is not asked.
3. **`signer`.** A member id or its `member:<id>` spelling (case-authoring's `author`). `NO_ATTESTING_KEY` holds when no row of `membership.attestingKeys()` has that `member_id`. Like `NO_SIGNERS`, it has no catalogue row: `{ok:false, reason, code, signer, detail, remedy}`, where `remedy` names registering one's own key (`op=signerregister`, membership R89). If you want a C-row for it, say which one; promotion stamps it.
4. **CASE_SIGNER_NOT_AN_OWNER.** Asked through `membership.caseAuthority` with the deliverer not asked. R18's list names only the signer arm, and the deliverer is fixed only when the act is delivered.
5. **C-65.1 and the gate.** Both read the given text, not a stored row. C-65.1 compares the conclusion against this text through the act's one comparison (ratifyCaseDocument now passes the stored `doc.text` to the same function, so behaviour is unchanged). The gate is `runCaseGate` with `priorCase` read from `published_cases` (publication R40's read contract) and `memberBasis` from `record-core.textAtSha` at each `case_roles` pin, as publication's `caseDocumentFacts` builds them.

## J2 · REPORT

**R18 is met and tested at `b89c9dbab9` on `job/T16/ratification`. Please merge it early for case-authoring (K425).** The shape is J1's reading 1: `ratificationOf(host).caseRatifyPreflight({text, signer, viewer})` answers `{ok: true, ready, refusals}`, or `{ok: false, reason: "PREFLIGHT_UNDETERMINED", detail}`. It is tested in `test/m/ratification/preflight.test.mjs`: each entry deep-equals the act's own refusal (the Worker half's body less `store`/`tokenClass`, or the commit's), the full order is covered, nothing is written, and it never throws. R19 is pinned there too. The rest of the job (N354, N361) is also in that commit. My record and the remaining reports follow before COMPLETE.

Two things BOB should know now:
- **Six rows' `where` moved** (for promotion's stamp, N318). C-32.13, C-32.15, C-53.12, C-92.10, C-92.11 and C-65.1 now name builders in the new `src/ratification/refusals.mjs` (`machineCaseRefusal`, `operatorCaseRefusal`, `testimonyCaseRefusal`, `attributionUnchosenRefusal`, `attributionStaleRefusal`, `conclusionMovedRefusal`), with their regions moved with them. Codes, ids and translations are unchanged. The act and the pre-flight both answer through these builders, so each code keeps one literal site, as the DEC-49 guard's arm G requires. The act's wire bytes are unchanged; the module's existing act tests pass unmodified.
- **New code `NO_ATTESTING_KEY`**, the pre-flight's own. It has no catalogue row, as `NO_SIGNERS` has none (J1 item 3).

## J3 · COMPLETE

**Entries applied** (branch `job/T16/ratification` @ `78bd9ff254`; `tranche/T16` merged in after K555). The commits after the early merge, `1b8ac9c2be` and `78bd9ff254`, are needed: see "After the early merge" below.
- **N364: R18, R19.** R18 is `caseRatifyPreflight({text, signer, viewer})` in `src/ratification/index.mjs`. It answers `{ok: true, ready, refusals}`, or `PREFLIGHT_UNDETERMINED`, as ruled in K552. Every refusal of R2 and R3 that holds before a signature is listed, each asked on its own, in R18's order. Each refusal is built by the function the act answers through, so the two cannot differ:
  - the new `src/ratification/refusals.mjs` builds C-32.13, C-32.15, C-53.12, C-92.10, C-92.11, C-65.1 and `NO_ATTESTING_KEY`;
  - `membership.caseAuthority` builds `CASE_SIGNER_NOT_AN_OWNER`;
  - C-65.1's comparison (`#conclusionsMoved`) and the case gate call (`#caseGateOver`) are now shared by `ratifyCaseDocument`, `caseGate` and the pre-flight.

  The act's wire bytes are unchanged. R19 is pinned: a self-registered key (membership R89) verifies in both ceremonies exactly as an administrator's key does, and once revoked it does not.
- **N354: R17.** The `registerholds` probe in `op=ratify`'s gate no longer reads silence as "not held". The probe rejects, so `runGate` rejects (promotion R28). The act then answers the store's own refusal through `storeRefused`, or `STORE_DID_NOT_ANSWER` naming `ratify/registerholds` with the store's correlation. An answered probe still gives the gate's `PLANE_MISSING_BYTES` or `PLANE_HELD_IN_PARTS` (negative controls). It is now the eighth relay in `relays.test.mjs`. With the fix disabled, 4 tests fail.
- **N361 (K529).** The parity test `checks.test.mjs`:133–143 is retired. Its `SUBJECT_POSITIONS` arm stays as its own test, comparing the catalogue's copy (which stays) with this module, its owner.

**After the early merge (K555).** `1b8ac9c2be` moves each DEC-49 region inside its builder's body. It also splits the attribution gate's region into `is-attribution-unchosen` and `is-attribution-stale`, one per row, and puts C-65.1's `reason:` and `rowOf` on one line. At `b89c9dbab9`, the version merged early, the DEC-49 guard fails 6 new lines by name: its arm C reads the regions as outside the functions their `where`s name, and its arm G reads C-65.1 as two sites. At `1b8ac9c2be` those 6 are gone. `78bd9ff254` corrects `ops.mjs`'s header comment only.

**`not yet met` marks my work meets** (for BOB to strike): R18 (N364), R19 (N364), R17's "(N354: not yet met)", and the Status line's "R18–R19; not yet met".

**Check rows for promotion's stamp (N318).** Six rows moved their `where`; codes, ids and translations are unchanged:
- C-32.13 → `refusals.mjs machineCaseRefusal > is-machine-ratify-case`
- C-32.15 → `refusals.mjs operatorCaseRefusal > is-operator-ratify-case`
- C-53.12 → `refusals.mjs testimonyCaseRefusal > is-testimony-publish-case`
- C-92.10 → `refusals.mjs attributionUnchosenRefusal > is-attribution-unchosen` (region renamed)
- C-92.11 → `refusals.mjs attributionStaleRefusal > is-attribution-stale` (region renamed)
- C-65.1 → `refusals.mjs conclusionMovedRefusal > is-caseratify-conclusion-moved`

No row was added or retired. There are two new codes without rows, per K552: `NO_ATTESTING_KEY` and `PREFLIGHT_UNDETERMINED`. The R50 census moves for the six `where`s.

**Reported, not mine to change:**
1. **legacy-tests: four suites red on my tree and not on `tranche/T16` before K555.** Each reads `ops.mjs` as source text. The other 62 of the 66 legacy suites that touch ratification answer as on the baseline. Keeping the old inline literals would put a second site for each code in `refusals.mjs` and fail the DEC-49 guard's arm G, so these need re-anchoring, as with RATIFICATION #2's move:
   - `operator-attest.test.mjs` ("STRUCTURE, op=caseratify": it reads C-32.15's inline `if (!viaSession)` + `return json({… "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"`, now `return json(operatorCaseRefusal(cls), 403)`, with the region in `refusals.mjs`). Its `operator-attest.control.mjs` needles for the case fence go the same way.
   - `machine-fences.test.mjs` (2 FAILs: its fence harvest no longer finds C-32.13's mint beside its guard in the ops file).
   - `signer-enrolment.test.mjs` ("EXACTLY three readers" of `attestingKeys()`: R18's pre-flight is a fourth, as R18 words it).
   - `refusal-wire.test.mjs`'s forward-source set gains `refusal`, from `caseRatifyOp` forwarding a builder's refusal with its envelope. It is a new kind of forward, left named rather than renamed to hide it.
2. **DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`). It has 15 failures, the same 15 as the baseline (all floor slack); arm G is unchanged at 103 multi-site codes and 54 candidates. Measured figures that moved, baseline → mine:
   - census 1152 → 1154
   - governedSites 567 → 568
   - regions 529 → 530
   - regionLines 5972 → 5958
   - outcomeReturns 291 → 292
   - untranslated 290 → 292 (the two new codes)
   - arm F's F6 182 → 184
3. **Generated artifact (§14):** `bio-plane/dist/bio-plane.bundled.mjs` is stale (`fleetbundles.test.mjs`: bio-plane STALE BUNDLE). I did not rebuild it.
4. **civicos-ui and affordances greps:** no hits for `caseRatifyPreflight`, `NO_ATTESTING_KEY`, `PREFLIGHT_UNDETERMINED`, `refusals.mjs` or its builders, or `registerholds`. Affordances' `NON_ACTS.ratify` (`affordances.mjs`:2143) still calls the pre-flight deferred; its N364 R29 entry rewords it.

**Deferred:** nothing.

**Tests and checks run:**
- `node --test bio-plane/test/m/ratification/`: 86 pass, 0 fail. New file `preflight.test.mjs` (R18, R19); `relays.test.mjs` gains N354; `checks.test.mjs` updated for N361 and R14's `where` pattern.
- `node --test bio-plane/test/m/` (whole, merged tree): 3074 tests, 3053 pass, 0 fail, 21 todo.
- Legacy suites touching ratification (66): see report 1. DEC-49 guard: see report 2.
- `format`: 0 failures. `architecture ratification`: 0 failures. `coverage ratification`: 19 of 19, 0 failures. `ownership ratification tranche/T16`: 0 failures.

Size (session_01WThj1yrmjFsd1tK4dDXbRh): test runs 28, module lines 3259
