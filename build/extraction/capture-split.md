<!-- Extraction map for capture's second split (K617, K624, K1821; N826, K2455), written for BOB on 2026-10-10 on tranche/T41 by a worker, as T42's P18 preparation. Uncommitted; BOB reviews it. -->
# capture → doorbell — extraction map (second split, N826)

**Status** · DRAFT for BOB, 2026-10-10, on `tranche/T41`, uncommitted.

**Why.** Plan N826 (`build/plan/next.md`:11): `capture` measures past K617's ~4,000 lines after T41-8a (R86, the upload). Over its own path (K1821; `modules.json`:49, `bio-plane/src/capture/` only, tests not counted), `wc -l` at HEAD `6d1719e8e6` gives **4,059**:
- `index.mjs` 2,907;
- `schema.mjs` 537;
- `ops.mjs` 197;
- `checks.mjs` 161;
- `doorbell.mjs` 161;
- `grammar.mjs` 96.

The plan's 4,053 is doubt 9.

**Read whole:**
- capture's `modules.json` entry (line 49) and every entry whose `uses` names `capture`;
- `requirements/capture.md`;
- all six files above;
- `extraction/publication-split-3.md` (the format model);
- `record-core/index.mjs` `declarePurge` and `#declare`, for the declaration refusal in doubt 4.

**Callers** were found by grep of every moved export, method, route and table over `bio-plane/src` and `bio-plane/test`, with the bundles excluded.

## 0. The answer

**The seam is the doorbell.** It is the public intake by which anyone, with no account, hands the group material (Intake Doctrine §2a), together with the member's inbox over it:
- the knock (R30, R49–R51, R53, R54, R66's secret);
- its rate (R31, R47, R48, R56, R71);
- the inbox (R32, R67, R70, R72);
- the pull that brings a knock into the record (R65);
- the two tallies (R80, R85);
- C-85 and four rows of C-118 (R37's share, R52).

**Why this seam:**
- **Sizes.** It moves about **900 lines** (§9), so `capture` falls to about **3,160**, and the new module is about **1,100**. Both are well under ~4,000.
- **Cohesion.** The doorbell already has its own file (`doorbell.mjs`), its own refusal family (C-85), its own six tables, and its own block of `index.mjs` (510–1026, which the file heads "The doorbell's store side").
- **Few edges.** Nothing that stays in capture reads the doorbell's tables or calls its code. The new module calls capture forward in only three places:
  - `recordCaptureActor` (`index.mjs`:1231, for R65's actor);
  - `evidenceAbsent` (`ops.mjs`:217, R63);
  - `relayUnanswered` (`ops.mjs`:179, R64).
- **Few new uses edges.** Two users swap `capture` for `doorbell` outright:
  - `sources`: every capture call it makes is a doorbell call (`sources/index.mjs`:152, 196, 488, 619);
  - `actions`: it uses capture only for the litigation-hold reader (`actions/index.mjs`:3024–3028).

  Three add `doorbell` beside `capture`: `store-door`, `answer-envelope` and `plane`.

**Seams considered and set aside:**
- **Held captures** (R77–R79, R81–R84; `index.mjs`:1418–1837, about 470 lines with tables and rows). This leaves capture at about 3,590, too near the line given R86's growth. Its `#heldWhere` also joins capture's `capture_actors` table (`index.mjs`:1447), which would need a new read contract.
- **Links and chrome** (R27–R29). The acquisition act writes them through the store capture hands it (R73), so it would have to reach a later module.

**Requirement ids that move:**
- whole: R30, R31, R32, R47, R48, R49, R50, R51, R52, R53, R54, R56, R65, R66, R67, R70, R71, R72, R80, R85;
- in part: R37 (C-85.1–.5, C-118.2, .3, .4, .7);
- copied: R38, R64, R74.

## 1. The new module

- **Name:** `doorbell`.
- **Place:** layer 3, in `modules.json` directly after `capture` (a new line 50, before `file-safety`). Its uses are all earlier, and its users all later: `sources` (layer 3, after it), `actions` (layer 9), `answer-envelope`, `store-door` and `plane` (layer 11).
- **Paths:** `bio-plane/src/doorbell/`, holding:
  - `index.mjs`: the class, factory and routes;
  - `door.mjs`: today's `capture/doorbell.mjs`, the op handler;
  - `checks.mjs`;
  - `schema.mjs`.
- **Tests:** `bio-plane/test/m/doorbell/`.
- **Factory:** `doorbellOf(ctx, deps)`, one instance per storage (K61). At creation it:
  - creates its six tables (`CREATE TABLE IF NOT EXISTS`, the same DDL, so a running store's inbox, keys and tally are kept as they are, with no data move);
  - declares them to `record-core` as purge-exempt (doubt 4).

  Its `env` (the `CAPTURES` bucket, `KNOCK_FINGERPRINT_KEY`, `KNOCKER_SECRET_KEY`, `INSTANCE_NAME`, `VERSION`) is read from capture's instance for the same storage (`captureOf(ctx).env`), so capture R58's one adoption rule stays the only one (doubt 5).
- **Uses** (each earlier in the order):
  - `record-core`: `transact`, `declarePurge`, `evidenceStore`, and the `bundles` read contract (its R37) for R32's `project` sort.
  - `membership`: `viewerPredicate` (R80's member fence), `listenerRefusal` (the litigation-hold slot).
  - `credentials`: `securityCount` (its R44; R85).
  - `provenance`: `recordReceipt`, `DOORBELL_VIA` (R65), and the `register` read contract (its R48; R32's join).
  - `acquisition`: `profileOf`, `profileView`, `firstHopWho`, `INSTALLATION_CHECKS` (R65).
  - `capture`: `recordCaptureActor` (the actor its R69 reads), `evidenceAbsent` (R63), `relayUnanswered` (R64), and `captureOf` (the `env`).
  - `test-support`.
- **Who creates it:**
  - `plane` (`store.mjs`): built after `captureOf(ctx, {env, attestation})` (303), migrated after capture (424), its routes spread after `captureOps` (524);
  - `sources`' factory (`deps.doorbell ?? doorbellOf(ctx)`, today `deps.capture`, `sources/index.mjs`:725);
  - `actions`' factory (the litigation-hold reader, `actions/index.mjs`:3024);
  - `store-door`'s `inboxpullfile` (`dispatch.mjs`:408).

## 2. What moves (by copy, K624)

**`capture/index.mjs`**

| moved | file and lines today | to (doorbell) | id |
|---|---|---|---|
| import of `KNOCK`, `isWeakKnockerSecret`, `knockerSecretWeak` | 19 | `index.mjs` | — |
| `B32`, `base32Of`, `pseudonymOf` (exported) | 53–64 | `index.mjs` | R66 |
| `PULL_WITHIN_FAILED_DETAIL` (exported) | 81–83 | `index.mjs` | R65 |
| `TALLY_DAYS` (exported) | 190–191 | `index.mjs` | R80 |
| `INBOX_SORTS` (exported) | 193–194 | `index.mjs` | R32 |
| `"litigation-hold"` slot of `CAPTURE_READERS` | 176–179 (part) | its own `registerReader("litigation-hold", …)` | R32 |
| `mayClearDiscarded` | 444–456 | `index.mjs` | R32 |
| the block "The doorbell's store side": `#knockKey`, `sourceFingerprint`, `#knockerKey`, `#knockerDigest`, `knockerDigestOf`, `#rateRefusal`, `#knockRateRefusal` (region `is-knock-rate`), `#LIMIT_REACHED`, `#tallyRefusal`, `#securityCount`, `#refusedKnock`, `doorbellRefused`, `doorbellTally`, `#rateWindows`, `#countKnock`, `knockAttempt`, `knock`, `inboxList` | 510–811 | `index.mjs` | R31, R32, R47, R48, R53, R54, R56, R66, R71, R80, R85 |
| `#noSuchKnock` (region `is-knock-held`), `inboxGet`, `inboxResolve` (region `is-resolve-reasoned`), `pullKnock`, `#pull` (region `is-knock-pullable`) | 830–979 | `index.mjs` | R32, R65, R70 |
| `#pulledDocument` | 994–1026 | `index.mjs` | R65, R70 |
| `knocksOf`, `pulledKnocksOf` | 1198–1223 | `index.mjs` | R67, R72 |
| routes `knock`, `inboxlist`, `inboxget`, `inboxresolve`, `doorbellrefused`, `doorbelltally`, `inboxpull`, `knocksof`, `pulledknocks` (in `captureOps`) | 2871–2879, 2888–2891 | `doorbellOps(d, url, body)` | as above |

Some helpers are **copied, and also stay in capture**, because capture's other code still uses them:

| helper | lines | stays in capture for |
|---|---|---|
| `stampSecond`, `ISO_INSTANT`, `HEX64`, `te`, `hexOf` | 46–50 | many callers |
| `b64Of` | 51 | (doorbell only; it can move) |
| `WITHIN_FAULT` | 80 | R86 |
| `READ_LIMIT`, `limitOf`, `cursorOf`, `keyOf`, `badCursor` | 146–162 | R24–R28, R77, R84 |
| `REASON_MAX`, `reasonGiven` | 186–188 | R79, R81 |
| `SORT_DIRS` | 195 | R77 |
| `#credentials` | 357–360 | R69 |
| `#rows`, `#tx`, `#one` | 362–370 | all |
| `#badArgument` | 815–820 | R77 |
| `#callWithin` | 984–992 | R86 |

**`capture/doorbell.mjs`:** the whole file, 1–161, moves to `door.mjs`. It holds `KNOCK`, the three pre-store refusals, `KNOCKER_SECRET_MIN`, `isWeakKnockerSecret`, `knockerSecretWeak`, `knockOp`, `tallyRefusal` and `capturePublicOp` (renamed `doorbellPublicOp`). Its imports change:
- `relayUnanswered` comes from `../capture/ops.mjs`;
- the rows come from `./checks.mjs`.

It covers R30, R49–R51, R53, R54, R64's use, R66 and R85.

**`capture/checks.mjs`**

| moved | lines today | id |
|---|---|---|
| `NO_SUCH_KNOCK` (C-118.2) | 132–135 | R32 |
| `KNOCKER_SECRET_WEAK` (C-118.3) | 136–140 | R66 |
| `KNOCK_DISCARDED` (C-118.4) | 141–144 | R65 |
| `RESOLVE_NO_REASON` (C-118.7) | 155–159 | R32 |
| `KNOCK_CHECKS` with its reasoning comment (C-85.1–.5) | 179–257 | R47–R52 |
| header paragraphs on C-85, NO_SUCH_KNOCK, C-118.3/.4/.7 | 101–103, 108–110, 116–120 (parts) | — |

Each row keeps its code, number and translation. Its `where` is re-pointed:
- `src/doorbell/index.mjs …` for `#noSuchKnock`, `pullKnock`, `inboxResolve` and `#knockRateRefusal`;
- `src/doorbell/door.mjs …` for the three pre-store helpers and `knockerSecretWeak`.

**`capture/schema.mjs`**

| moved | lines today | id |
|---|---|---|
| `inbox` and `inbox_status` | 5–36 | R32, R65, R66 |
| `knock_rate` | 38–44 | R31 |
| `knocker_key`, `inbox_pseudonym`, `inbox_capture` | 424–432 | R66, R67, R72 |
| `doorbell_tally`, `doorbell_limit_last` | 465–477 | R80 |
| `knock_key` | 499–505 | R56 |
| the eight `inbox` additive columns | 514–521 | R32, R65, R66 |
| `inbox`, `knock_rate`, `knock_key`, `knocker_key`, `doorbell_tally`, `doorbell_limit_last` from `CAPTURE_EXEMPT_TABLES` | 536–537 (part) | R56, R66, R80 |

**In the copy:**
- `this.recordCaptureActor(…)` (965) becomes `capture.recordCaptureActor(…)`.
- `evidenceAbsent` (933) is imported from `../capture/ops.mjs`.
- `this.env` is capture's `env`.

The SQL is unchanged.

## 3. What stays in capture

Everything else stays:
- the evidence store (R21, R63);
- reachability (R8, R43, R59);
- the event queue (R15, R45);
- sessions (R22, R46);
- the ceiling (R23);
- site assets (R24–R26);
- links and chrome (R27–R29, R57);
- the render allowance (R39, R40);
- late co-attestation and accounts (R68, R69);
- the upload (R86);
- the grade note (R76);
- held captures (R77–R79, R81–R84);
- the figures (R75);
- the acquisition delegates (R73);
- listeners (R44, R55);
- the grammar (R37's C-2.7).

**Removed with the copy:** all of §2's lines from `index.mjs`, `doorbell.mjs`, `checks.mjs` and `schema.mjs`, and `CAPTURE_READERS` loses `"litigation-hold"`.

**No seam is needed in capture:** nothing it keeps calls the doorbell. R76's `RECEIVED_VIAS` (86) reads `DOORBELL_VIA` from `provenance`, unchanged. The header (`index.mjs`:1–17) is re-worded: the doorbell goes, and so does R32's reader.

**`modules.json`:** capture's `uses` is unchanged. `credentials` stays for R69's `attestingKeys`.

## 4. Requirement ids

| capture | doorbell | what |
|---|---|---|
| R30 | **R1** | anyone may knock; the envelope, empty and size refusals |
| R31 | **R2** | the two-bucket rate, 5 per source and 10 per instance in any 10 minutes |
| R32 | **R3** | the inbox row; the member's list, read and resolve with a reason; `inboxList`'s sorts; the litigation-hold reader |
| R47 | **R4** | C-85.1 `RATE_IP` |
| R48 | **R5** | C-85.2 `RATE_GLOBAL` |
| R49 | **R6** | C-85.3 `KNOCK_ENVELOPE_TOO_LARGE` |
| R50 | **R7** | C-85.4 `KNOCK_PAYLOAD_TOO_LARGE` |
| R51 | **R8** | C-85.5 `KNOCK_EMPTY` |
| R52 | **R9** | C-85's translations name no figure; a missing row fails loud |
| R53 | **R10** | POST only; the order the refusals are tried in; what a refused knock counts |
| R54 | **R11** | an accepted knock's answer; no row without its bytes |
| R56 | **R12** | the keyed source fingerprint and `knock_key` |
| R65 | **R13** | `pullKnock`, `within`; the actor recorded through `capture` R69's table |
| R66 | **R14** | the knocker secret, digest, pseudonym, `knockerDigestOf` |
| R67 | **R15** | `knocksOf` |
| R70 | **R16** | `contact` reaches no document |
| R71 | **R17** | `knockAttempt` |
| R72 | **R18** | `pulledKnocksOf` |
| R80 | **R19** | the count-only tally, `doorbellTally` |
| R85 | **R20** | every refusal counted in `credentials`' security tally |
| R37 (its share) | **R21** | rows C-85.1–.5 and C-118.2, .3, .4, .7 in this module's table (doubt 3) |
| R74 (copy) | **R22** | every write through `record-core.transact` |
| R38 (copy) | **R23** | no place named |
| R64 (copy) | **R24** | the handler relays the store's own refusal through `capture`'s `relayUnanswered` |
| new | **R25** | `doorbellOf` one instance per storage, `env` read from capture's instance; its tables created and declared purge-exempt |

**Retired in capture as "moved to doorbell R<n>":** R30 → R1, R31 → R2, R32 → R3, R47 → R4, R48 → R5, R49 → R6, R50 → R7, R51 → R8, R52 → R9, R53 → R10, R54 → R11, R56 → R12, R65 → R13, R66 → R14, R67 → R15, R70 → R16, R71 → R17, R72 → R18, R80 → R19, R85 → R20. BOB does the retirement.

**Re-worded in capture** (wording only, BOB's):
- **R37:** keeps C-118.1, .5, .6, .8, .9, .10, and names `doorbell` R21 for the rest. The C-118 table below it loses .3, .4 and .7.
- **R86:** states its own member-session fence and its `within` in its own words, in place of "R32's" and "exactly as R65 does", since capture may not lean on a later module's text (P4). It keeps "built as a pulled knock's document" as description only.
- **R76:** wording unchanged.
- **Purpose, Uses, Satisfies:** the doorbell, DEC-78 items 1–4, DEC-108 and N703's lines go to `doorbell`. `credentials`' `securityCount` leaves capture's Uses.
- **Status:** the second split, in K649 (1)'s form.

## 5. Callers in other modules (grep of `bio-plane/src`)

| module (file:line) | what it calls | requirement text | re-pointed by |
|---|---|---|---|
| `sources` (`index.mjs`:38, 107, 117, 725; calls 152, 196, 488, 612–619) | `pulledKnocksOf`, `knocksOf`, `knockerDigestOf`, `knockAttempt` on `deps.capture ?? captureOf(ctx)` | sources R1, R11, R15 ("capture R31, R65, R66, R71, R72") | **sources' L3 job**: `deps.doorbell ?? doorbellOf(ctx)`; `modules.json` `capture` → `doorbell` |
| `actions` (`index.mjs`:43, 3024–3028; header 14, 28) | `capture.registerReader("litigation-hold", "actions", …)` | actions R55 ("capture R32") | **actions' L9 job**: `doorbellOf(host)`; edge `capture` → `doorbell` |
| `store-door` (`dispatch.mjs`:11, 408; `pull.mjs`:91–107) | `pullAndFile({capture})` → `capture.inboxResolve` / `capture.pullKnock` with `within` | store-door R7 ("capture R32, R65") | **store-door's L11 job**: deps `doorbell`; edge added |
| `plane` (`door.mjs`:16, 43; `store.mjs`:33, 303, 424, 524) | `capturePublicOp` (the public door); `captureOps` carries the nine routes; build and migrate | plane R5 | **plane's L11 job**: `doorbellPublicOp`; build `doorbellOf(ctx)` after capture, migrate after capture's, spread `doorbellOps` after `captureOps`; edge added |
| `answer-envelope` (`families.mjs`:33, 140) | `import * as CAPTURE from "../capture/checks.mjs"`, so C-85 and C-118.2–.4, .7 resolve under capture | its family table | **answer-envelope's L11 job**: add `["src/doorbell/checks.mjs", DOORBELL]` after capture's entry; edge added |
| `control-plane` (`index.mjs`:609–613, 887–888, 2043, 2769, 3002) | the store routes `inboxlist`, `inboxpullfile` and the reason `NO_SUCH_KNOCK` by name only; the routes keep their names | control-plane R32, R36 ("capture R32, R65, R85") | wording only |
| `op-declarations` (826–850, 1267–1270, 1552, 1557, 2537–2554, 2978), `op-grades` (543, 669–711, 1007–1029), `affordances` (`act-help.mjs`:224), `setup-words`, `setup-page` (1758–1778), `wizard-scripts` | op names only (`knock`, `inbox*`, `knocksof`, `pulledknocks`, `doorbelltally`), unchanged | comments "capture R32/R65/R80" | wording only |
| `acquisition` (`index.mjs`:1314; `checks.mjs`:27), `provenance` (`index.mjs`:98), `network-notices` (`index.mjs`:89), `case-disclosures` (572) | comments naming "capture R65" or "capture's knock, its R32" | acquisition, admission, credentials, membership, provenance, case-disclosures, op-declarations, op-grades, setup-page requirements name capture R30–R85 ids | wording only, each module's own |
| `promotion` (`gate.mjs`, census history 107, 548–551, 943–945) | names C-85 and C-118.3 as capture's | the census | promotion's stamp at T42's close: nine CHANGED rows (`where` re-pointed, words unchanged) |
| `layers.md` (117) | capture's row lists "the doorbell" | — | BOB, with a new `doorbell` row |

**Tests in other modules that call the moved code:**

| test | calls | re-pointed by |
|---|---|---|
| `sources/fixture.mjs` 1–2, 90–92, 115–124; `contract.test.mjs` 30; `source.test.mjs` 65 | `cap.knock`, `pullKnock`, `pulledKnocksOf`, `knockAttempt`, `inboxResolve`; SQL over `inbox` | sources' job |
| `actions/t22.test.mjs` 7, 28, 40–104 (9 sites) | `captureOf(…).mayClearDiscarded`, `registerReader("litigation-hold")` | actions' job |
| `store-door/pull.test.mjs` 13, 23, 109, 135, 205, 246, 270, 274 | `REASON_MAX`, `PULL_WITHIN_FAILED_DETAIL`, `inboxGet`, `inboxResolve`, `pullKnock`, `deps.capture` | store-door's job |
| `control-plane/doorbell.test.mjs` 14, 307, 334, 404, 445, 469, 473; `inbox-door.test.mjs` 11, 21, 101 | the same | control-plane's job |
| `affordances/backing.test.mjs` 492–493 | `f.c.knock`, `f.c.inboxResolve` | affordances' job |

## 6. capture's tests

**Move to `test/m/doorbell/`** (they may import capture's fixture, capture being earlier):
- whole files:
  - `doorbell.test.mjs` (1–330);
  - `inbox.test.mjs` (1–331);
  - `knock-origin.test.mjs` (1–51);
- from `knocker.test.mjs`: the tests at 54, 85, 133, 147, 175, 229, 252, 302, 317, 410 (R69's "the puller of a knock", over the pull), 544, 572, 596 and 628;
- from `t35.test.mjs`:
  - DEC-149's doorbell strings at 47, 57, 67, 76, 83 and 91, re-labelled with `door.mjs` and `index.mjs` lines;
  - R85 at 159, 188 and 207;
- `reads.test.mjs` 156–175 (R32, N90);
- `figures.test.mjs` 47–63 (R56, R66: the keys and the inbox exempt from purge);
- `ops.test.mjs` 9, and 169–170 (`capturePublicOp("knock")`);
- `plane.test.mjs` 66–75 (`op=knock` at the door);
- `relays.test.mjs` 11 and 47 (the `knockOp` relay).

**Split:**
- `knocker.test.mjs` 525: rows C-118.3, .4 and .7 go to doorbell R21; .5, .6, .8 and .9 stay.
- `act.test.mjs` 78–96 (R38): the knock and pull arm (85–96) goes to doorbell R23.
- `services.test.mjs` 423–491 (R74): the arms `knock`, `knockAttempt`, `inboxResolve`, `pullKnock` and `doorbellRefused` (442–447, 476, and the list 486–489) go to doorbell R22.

**Stay in capture, re-built:** `held.test.mjs` 546–563 (R76, K2455) makes a doorbell receipt by `knock` and `pullKnock`. A capture test cannot call the later module, so it writes the receipt with `provenance.recordReceipt({via: DOORBELL_VIA})`, as R76 reads it.

## 7. Placement in T42 (K624)

1. Doorbell's job builds by copy and merges first (layer 3).
2. Then `sources` (layer 3), `actions` (layer 9), and `answer-envelope`, `store-door` and `plane` (layer 11) re-point.
3. Capture's deletion is doubt 1.

## 8. Doubts for BOB (best readings)

1. **Capture's delete would break the Worker until layer 11.** `plane/door.mjs`:16 imports `../capture/doorbell.mjs`, so deleting that file in capture's layer-3 job fails every load of `plane` until plane's layer-11 job, not merely one act. *Reading:* use K625's pattern:
   - capture's T42 job retires the twenty ids and keeps the doorbell code as a named copy, unused by new code;
   - capture's next job deletes it once `plane`, `store-door`, `actions`, `sources` and `answer-envelope` have re-pointed.

   The alternative is a delete in T42 with the whole plane named red from L3 to L11. It is not recommended.
2. **Two copies writing one set of tables in the window.** Both copies run the same SQL on the same rows, harmlessly. The litigation-hold reader, though, is registered only where `actions` registers it: with capture until actions' L9 job, then with doorbell. The other copy's `mayClearDiscarded` then answers `may: false` (fail closed), which is R32's own answer with no reader. *Reading:* accepted. Nothing clears discarded knocks yet (R32: "no requirement here yet provides" the clearing).
3. **C-118 split across two modules.** C-118.2, .3, .4 and .7 move, while .1, .5, .6, .8, .9 and .10 stay. *Reading:* the rows move with their raisers, numbers kept (K93 (3); the C-92 precedent, `case-tensions` R9; `publish-schedule` R9's C-122.5). The next free C-118 number stays capture's to mint. `answer-envelope` resolves codes through both files (§5).
4. **The tables declared twice.** `record-core.#declare` refuses a table already declared by another module (`TABLE_DECLARED`), and capture's `declareTables` throws on any refusal (`index.mjs`:399–400). While capture still declares `inbox`, `knock_rate`, `knock_key`, `knocker_key`, `doorbell_tally` and `doorbell_limit_last` (doubt 1's window), doorbell's declaration would be refused. *Reading:*
   - doorbell's migrate treats `TABLE_DECLARED` with `declaredBy: "capture"` as held: the classes are identical (exempt), and it does not throw;
   - its R25 ownership arm is an accepted red until capture's delete;
   - plane migrates capture before doorbell, so capture's throw is never reached.
5. **`env`.** The doorbell needs the bucket, both keys and the instance's name and version, and capture R58 already decides which `env` a storage holds. *Reading:* `doorbellOf` reads `captureOf(ctx).env` at each use, rather than copying R58's adoption rule into a second module. The alternative (`doorbellOf(ctx, {env})` with its own R58) duplicates a rule and adds a second throw site.
6. **Placement before `file-safety`.** Directly after capture puts `doorbell` at 45 and `file-safety` at 46. `plane/store.mjs`:304, 425 and 525 say file-safety is "directly after capture"; that is code comment wording, and no requirement says so. *Reading:* place it directly after capture, the source module (as `publish-schedule` follows `publication`), with plane's comments re-worded in its job. Placing it after `file-safety` instead (it uses nothing of file-safety) is equally legal.
7. **R65's actor.** The pull writes `capture_actors` through `capture.recordCaptureActor` inside its own transaction. *Reading:* this works because `transact` nests as a savepoint (R74, record-core R32). Doorbell R13 names capture's R69 table as the actor's home, and no read contract is needed because doorbell never reads it.
8. **R86 leans on R32 and R65.** Capture's R86 text names "R32's" fence and "exactly as R65 does". *Reading:* re-word R86 to state both itself (§4). The code already does: `uploadCapture` has its own fence (1049–1051) and its own `#callWithin` use.
9. **The measure.** The plan cites 4,053; `wc -l` at HEAD `6d1719e8e6` gives 4,059 (the last commit, "capture T41 B5", may postdate the measure). Either way the split leaves capture at about 3,160.

## 9. Line counts

| | lines |
|---|---|
| capture today (K1821) | **4,059** |
| moved from capture | `index.mjs` ~560 (§2's ranges); `doorbell.mjs` 161; `checks.mjs` ~105; `schema.mjs` ~76: **≈ 900** |
| `capture` after its delete | 4,059 − ~900 + ~5 (header and `CAPTURE_READERS` re-worded) ≈ **3,160** |
| `doorbell` after its job | `index.mjs` ~740 (moved ~547, copied helpers ~65, factory, migrate, declaration and the reader slot ~70, `doorbellOps` ~20, header ~20); `door.mjs` ~161; `checks.mjs` ~110; `schema.mjs` ~90: **≈ 1,100** |
