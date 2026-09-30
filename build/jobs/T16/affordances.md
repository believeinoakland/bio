# affordances (T16)

**Status** · session_01YBYWCekcBYGpqvZ6aGXxFP · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Six readings I am building on; answer any you would rule otherwise. (1), (2), (4) and (5) touch a requirement's wording or another module.

1. **`sourceconsent`'s place in `ACTS` (K530) against R1.** R1 lists `ACTS` exactly and does not name it. Reading: an `ACTS` row, weight `single` (one entry, one audience, one act), `types: ["source"]`, `prompt: CONSENT_PROMPT`, and `applies` false on every bundle: its subject is a source's entry, which no bundle's facts describe, so `deriveActs` never offers it beside a bundle (DEC-8), and the no-target catalogue (R17) carries it, decorated, with its prompt and rung for the surface that shows a source's history. R1 then needs `sourceconsent` added to `single`. It is not in `MACHINE_REFUSALS`: `recordConsent` answers a machine `NO_SUCH_SOURCE`, never a `MACHINE_*` code, so R20 holds as worded; R20's drive for it runs at sources' interface (the durable object does not route `sourcesOps`, item 6).
2. **`sourceconsentwithdraw` graded `reasoned` (R2), and R19.** `withdrawConsent({source, entry, audience, by})` asks no reason and no evidence, so nothing refuses it for want of an account and R19 cannot be backed for it. Reading: I grade it as R2 says and give its R19 backing a `test.todo` naming this cause. Two ways to close it: re-grade it `reversible` on R27's rule (a further `sourceconsent` restores the standing it lowered), or `sources` asks the withdrawal's reason. Your call.
3. **R2's "or evidence".** `sourcedisclose`, `sourcelink` and `sourceconsent` refuse an absent evidence `NO_EVIDENCE` (C-121.3) and ask no other account. Reading: `NO_EVIDENCE` joins `JUSTIFICATION_REFUSALS` (R19's family), since R2 now counts evidence as the account; the family's comment is amended to say so.
4. **R28's sentence.** `SELF_ATTESTED_SENTENCE` is `case-authoring`'s export (`document.mjs`:44), and `case-authoring` (layer 8) is not in affordances' `uses`. Reading: add the edge and import it, so the prompt is that very string (R21); I build it that way now. If you rule no edge, I hold a copy tested equal to case-authoring's export and to DEC-81 item 3.
5. **NON_ACTS rows and the control plane's table (R12).** Every new op except `sourceconsent` (an act) and `knockerconsent` gets a `NON_ACTS` reason: the writes by their subject (source-, knock-, capture-directed; the signer pair on `signeradd`'s reason), the reads `sourceof`, `sourcerung`, `sourcereadlog`, `sourcepublishable`, `knocksof`, `pulledknocks`, `lateattestations`, `captureaccounts` and `publishpreflight` as `read: …`. `knockerconsent` has no account, so no `NEEDS` row and no `NON_ACTS` row, as `knock`. For all three lists empty, CONTROL-PLANE's table must carry: mutating `sourcedisclose`, `sourcelink`, `sourceconsent`, `sourceconsentwithdraw`, `knockerconsent`, `inboxpull`, `reattest`, `captureaccount`, `signerregister`, `signerrevoke`; a `NEEDS` row (null capability for the reads, as the contradiction reads have) for every one of them but `knockerconsent`. If CONTROL-PLANE leaves a read without a `NEEDS` row, its `NON_ACTS` row reads `stale` and I drop it.
6. **Report, not mine:** the durable object dispatches `captureOps` and `caseAuthoringOps` (`store.mjs`:2813, :2831) but not `sourcesOps`, so no source op is reachable in the plane yet (CONTROL-PLANE's routing, or legacy-store's dispatch).

## J2 · COMPLETE

Job complete at `job/T16/affordances` @ f7f31d53f1 (`tranche/T16` merged in after B2/B3, K558 applied).

**Entries applied** (plan layer 11; N364, N365; K530, K546, K558, K559)
- **R1, R5, R29:** `sourceconsent` is an `ACTS` row, weight `single`, `types: ["source"]`, `applies` false on every bundle, `prompt: CONSENT_PROMPT`. `CONSENT_PROMPT` is `sources'` two statements joined (`CONSENT_STATEMENT`, `WITHDRAWAL_STATEMENT`, its R7), so the prompt says what the act records. It is not in `MACHINE_REFUSALS`: `recordConsent` answers a machine `NO_SUCH_SOURCE`.
- **R5, R28:** `publish` carries `SELF_ATTESTED_PROMPT`, which is `case-authoring`'s `SELF_ATTESTED_SENTENCE` imported (the new `uses` edge, K558 (4)).
- **R2:** `attested` gains `reattest` and `captureaccount`. `reasoned` gains `sourcedisclose`, `sourcelink` and `sourceconsent`. `reversible` gains `sourceconsentwithdraw` (K558 (2)). `NO_EVIDENCE` (sources C-121.3) joins `JUSTIFICATION_REFUSALS`, and its comment now says why.
- **R3, R27:** `signerregister`, `signerrevoke` and `knockerconsent` are `RUNG_ABSENT` on ground `credential`. `inboxpull` is `undetermined`, which makes 61. `inboxresolve`'s entry now names its `pulled` arm as the pull.
- **R7, R12:** every new op except `sourceconsent` (an act) and `knockerconsent` (no `NEEDS` row, as `knock`) has a worded `NON_ACTS` reason: the source-, knock- and self-attested-capture-directed writes, the signer pair on `signeradd`'s reason, and nine `read:` rows (`sourceof`, `sourcerung`, `sourcereadlog`, `sourcepublishable`, `knocksof`, `pulledknocks`, `lateattestations`, `captureaccounts`, `publishpreflight`). `NON_ACTS.ratify` names `op=publishpreflight` (case-authoring R34) and no longer calls it deferred; so does the file header. With B3's table (K559), nothing is unaccounted (tested).
- **R14, R8 (N365):** `affordanceFacts` answers `contradiction_sides_seen`, from `contradictionOf(ctx).candidateSidesSeen({inquiry, viewer})` (a new `contradiction` dep). It is null wherever `contradiction_inquiry` is not true. `contradictionresolve` is withheld on a stated `false`.

**Deferred:** nothing.

**`not yet met` marks my work meets (for you to strike, K460):** R2, R3, R5, R7, R28, R29 (N364); R27's "(not yet met: N364, for `inboxpull`)"; R8's and R14's "(its `contradiction_sides_seen` … not yet met: N365)"; and the Status line's "R28–R29 new, R2, R3, R5, R7 and R27 amended; not yet met" and "N365 (K520) … R14's `contradiction_sides_seen` and R8's arm; not yet met".

**Check rows:** none added, moved or retired (affordances holds none).

**Found in other modules (reported, not changed):**
1. **legacy-tests.** Four suites fail on this branch and pass on `tranche/T16` (4 of 4 on the tranche, 0 of 4 here):
   - `test/rung-ladder.test.mjs`:128, :136, :148 (BACKWARD, EXACTLY, `unaccounted` agreement): the dispatch table does not yet carry the ten new mutating ops. These should clear once CONTROL-PLANE's table (K559) lands.
   - `test/rung-ladder.test.mjs`:227: the exact `attested` set now includes `reattest` and `captureaccount`.
   - `test/rung-ladder.test.mjs`:503: its store-text scan finds no backing for `sourcedisclose`, `sourcelink` and `sourceconsent`, whose `NO_EVIDENCE` is in `src/sources/`. Their backing is driven here, in `test/m/affordances/sources.test.mjs`.
   - `test/rung-ladder.test.mjs`:517: the exact `reversible` set now includes `sourceconsentwithdraw`.
   - `test/affordances.test.mjs`:222, :226, :234, :1009: the new `NON_ACTS` rows and `sourceconsent` have no `NEEDS` or `OPS` row yet (CONTROL-PLANE, K559). `test/affordances.test.mjs`:757 counts "thirty-one acts" (now 32). `test/affordances.test.mjs`:779 does not know the prompts on `publish` and `sourceconsent`.
   - `test/d311-roster-affordances.test.mjs`:376, :381: its fixture guard wants a drive for every `ACTS` row, and `sourceconsent` has none there. The durable object does not route `sourcesOps` (N379), so it is driven at sources' interface.
   - `test/machine-attest.test.mjs`:187: its census finds `captureaccount` and `reattest` undriven and unnamed.
2. **Generated artifact (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale, because affordances' source changed. I did not rebuild it.
3. **Greps.** `civicos-ui/` has no hit for any op, constant or fact I added. The one hit is `civicos-ui/test/publication-entry.test.mjs`:624, a guard that the word `publishpreflight` never appears on a page, and it is unaffected. `bio-plane/src/setup.mjs`:1328 (the inbox's "Mark as taken up" button posts `inboxresolve` → `pulled`) is CAPTURE #8's report, and it still stands. Nothing was retired.

**Tests and checks run**
- `node --test bio-plane/test/m/affordances/`: tests 106, pass 106, fail 0, todo 0. Every live id, R1–R29, is named in a test title. There is a new file, `sources.test.mjs`, which covers R19 for the three source acts at sources' interface, R2 for the withdrawal taken back by a further consent and for the two `attested` acts at capture's interface, and R20 for `sourceconsent`. `contradiction.test.mjs` adds R14's `contradiction_sides_seen` and the R8/R18 offer-and-act agreement over contradiction R56's half-hidden scene. `derive.test.mjs`'s oracle gains the sides arm and `sourceconsent`.
- **Negative controls**, each restored after:
  - the sides arm removed from `contradictionresolve`: 4 fail;
  - `NO_EVIDENCE` taken out of the family: 4 fail;
  - `CONSENT_PROMPT` without the withdrawal sentence: 1 fail;
  - `publish` without its prompt: 2 fail;
  - `sourceconsent` offered on information: 2 fail;
  - `contradiction_sides_seen` always true: 2 fail.
- **Modules that use affordances:** `test/m/{queue,control-plane,skills,monitoring}`: 230 tests, 224 pass, 0 fail, 6 todo. `tasks` has no tests yet.
- **Checks:** format 72 modules, 67 requirements files, 0 failures. architecture: 9 product files, 74 relative imports, 0 failures. coverage: 29 of 29, 0 failures. ownership: 8 files, legacy-store and legacy-index 0 lines, 0 failures.

Size (session_01YBYWCekcBYGpqvZ6aGXxFP): test runs 24, module lines 2916
