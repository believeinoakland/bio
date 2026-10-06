<!-- Seam read for instance-setup's split before T34-57 (K617, N622), written for BOB #125 on 2026-10-06 on tranche/T34 by a worker. Uncommitted; BOB reviews it. -->
# instance-setup — split before T34-57 (seam read, K617, N622)

**Status** · DRAFT for BOB #125, 2026-10-06, on `tranche/T34`, uncommitted. **Why:** instance-setup measures **3,700** lines: `setup.mjs` 3,414, `livefire.mjs` 247 and `setup-fleet.mjs` 39 (most specific `paths`). T34-57, T34-81 and T34-90 add page work to most open ids and store work to R50–R53, R60, R62, R64 and R65, so the module would pass 4,000. N622 (K1690) names the seam: "the page". **Read whole:** `requirements/instance-setup.md`, all three source files, the 16 test files (3,531 lines), its `modules.json` entry, the START `plan/starts-T34/instance-setup.txt`, K617, K1690, K1824, `extraction/ratification-split.md`, and checks 1 and 2 of `civicos-process` (an import from a test is checked like one from code). **Users** were found by grep over `bio-plane/src`, `bio-plane/test`, `newgroup/src` and `build/requirements/*.md`.

## 0. The answer

**Split out the page (seam A).** `setup.mjs` 1–1636 is the page and nothing else:
- the template `SETUP_HTML`, about 1,500 lines of HTML and script;
- `groupLine` and `setupPage`;
- the page's constants (`FIRST_STATE_JSON`, `HEADINGS_JSON`, `RISK_TIERS_JSON`, `COUNTERPARTY_LEVELS_OPTIONS`, `GROUP_LINE_UNREAD`).

It goes by copy to a new module **`setup-page`**, placed in layer 11 **directly before** `instance-setup`. instance-setup re-exports `setupPage`, `groupLine` and `SETUP_HTML`, so `control-plane/index.mjs:26` and every other importer stay as they are.

| seam | instance-setup after split | after T34 (est.) | new module | other modules' requirements re-worded |
|---|---|---|---|---|
| **A `setup-page`** (R15, R20–R25, R32, R44–R49, R56–R61, R63–R65 page shares) | **~2,110** | **~2,550–2,750** | ~1,620; ~2,100–2,450 after T34 | 2 (control-plane R1, installer R37); membership R11 optional |
| B `instance-reports` (R17–R19, R33–R42: `livefire.mjs`, `memberVersions`, the report and limit ops, the observation and probe tables) | ~3,060 | **~4,000–4,500** | ~640 | 2–3 (capture, plane, control-plane) |
| C `office-seeding` (R50–R52, `setup.mjs` 2529–2919 plus the seed tables) | ~3,250 | **~4,200–4,700** | ~450 | 5+ (id-spaces, jurisdictions, actions, conformance, op-declarations R50) |

**Why not B or C.** Most of T34's growth lands on the page: R21's `#join=`, R22's password asked twice, R56–R59's claim-section acts, R60's Places act, R61's offices section, R64's enrolment choice, R65's draft act and the 35 page rows of DEC-149. Neither B nor C removes the page, so each leaves instance-setup at or over the mark once T34's work lands. B and C together would make two modules and still end near 3,600–4,050. C also re-words the most requirements elsewhere.

**Why A.**
- It is the seam N622 and the START name.
- It is clean: the page imports only three earlier modules (record-grammar, action-grammar, jurisdictions) and one leaf.
- It holds no table, op, store or catalogue row.

## 1. The new module

- **Name:** `setup-page`, the page at the root of a group's Civicsmith (claim, sign-in, enrolment, the healthy panel, the settings sections and the record browser). The alternative is `root-page`.
- **Place:** layer 11, in `modules.json` directly before `instance-setup`: … `notice-producers`, `queue`, **`setup-page`**, `instance-setup`, `op-declarations`, …. `layers.md` row 11 gains it.
- **Paths:** `bio-plane/src/setup-page/index.mjs`, one pure file.
- **Tests:** `bio-plane/test/m/setup-page/`.
- `paths` and `tests` stay empty in `modules.json` until its job creates them (K1043).
- **Uses** (each earlier; none is instance-setup):
  - `record-grammar`: `STATES`, `HEADINGS` and `deriveInquiryTitle`, the last embedded by its `toString()`.
  - `action-grammar`: `RISK_TIERS` and `riskTierState`.
  - `jurisdictions`: `COUNTERPARTY_LEVELS`.
  - For tests only: `capture` (`INFORMATION_GRAMMAR`), `membership` and `credentials` (keys), and `record-core` (the copied `storage` shim).
- **No import cycle, by one device.** The page's only tie to instance-setup is `hostingControlBlock()` (`setup.mjs:230`, from the leaf `setup-fleet.mjs`). The leaf stays instance-setup's, because the installer imports `GROUP_SLUG_RE`, `FLEET_BINDINGS` and the block from it (`newgroup/src/index.mjs:34`, installer R30 and R34). So `setup-page`'s template carries a fixed slot, `<!--hosting-control-->`, where the block stood. instance-setup composes the page, which takes about 8 lines:
  - `SETUP_HTML = PAGE_HTML.replace(SLOT, () => hostingControlBlock("notice"))`;
  - `setupPage(read)` replaces the unread group line in that composed page, as it does today;
  - `groupLine` is re-exported.

  The served bytes are unchanged.
- **Why before instance-setup, not after:**
  - After would forbid the re-export, so `control-plane` would have to re-point its import.
  - instance-setup's job (T34-57) could then not delete its copy before control-plane's job (T34-60) without breaking the plane's import.
  - Before costs only the slot.

## 2. What moves (`setup.mjs`, by copy)

| moved | lines today | to |
|---|---|---|
| the page's header comment, the page's three imports, the injected constants | 1–22, 26–28 (part), 45–67 | R5, R7 |
| `escGroup`, `GROUP_LINE_UNREAD`, `verifiedDay`, `groupLine`, `setupPage` (uncomposed, as `pageOf`) | 68–121 | R1 |
| `SETUP_HTML`: every section and its script (claim, sign-in, enrolment, panel, browse, bundle, intake, revise, inbox, members and keys, profiles, assistant) | 123–1636 | R1–R24 |

**Stays in instance-setup:** lines 1637–3414 (R1–R19, R26–R31, R33–R43, R47's block, R50–R55, R60–R65 store side), plus `livefire.mjs` and `setup-fleet.mjs`. It also gains a header, the re-exports and the composition. Of DEC-149's 58 rows (T34-87):
- 35 fall in 1–1636 and are applied in `setup-page`;
- 19 in `setup.mjs` (:1701 and on) and the leaf's 4 stay.

## 3. Requirement ids

**`setup-page`, numbered afresh** (each "(was instance-setup R…)", wording carried, meaning unchanged):

| new | was | what |
|---|---|---|
| R1 | R20 | the group line from one read; the template answers it as unread |
| R2 | R21 | the fragment, `#boot=`, `#invite=` and `#join=` |
| R3 | R22 | the ops before sign-in; the password typed twice (U77) |
| R4 | R23 | after sign-in, only the acts `whoami` reports |
| R5 | R24 | the intake form |
| R6 | R25 | the history order |
| R7 | R32 | the risk tiers |
| R8 | R44 | the key form |
| R9 | R45 | `content_hash` |
| R10 | R46 | the capture refusals |
| R11 | R48 | the inbox reason |
| R12 | R49 | no outside loads |
| R13 | R15 | the profiles under Places |
| R14 | R47's page share | the claim section carries, before the password fields and in place of the reassurance-only card, the one slot where `instance-setup` R47's block is placed; nothing is asked or recorded |
| R15–R18 | R56–R59 | the claim-section acts |
| R19 | R60's page half | "Name a place not yet listed", sent as `op=placewanted` |
| R20 | R61 | the offices section |
| R21 | R63's page share | every string of this page |
| R22 | R64's page sentence | the language choice at enrolment and in members and keys |
| R23 | R65's page half | the act on "Who your group is", offered only with the assistant; `ASSISTANT_DRAFT_UNAVAILABLE` leaves the fields as they are |
| R24 | R53's page share | whether the assistant is on, and the switch offered only to an administrator |
| R25 | copy of R31, which stays | no place is named in the page |

**Retired in instance-setup as moved:** R15, R20–R25, R32, R44–R46, R48, R49, R56–R59, R61.

**Re-worded in instance-setup (wording only, ids kept):**
- **R47:** the block's words, held once in `setup-fleet.mjs` for the claim page and installer R34. This module places them in `setup-page`'s slot (its R14) when it composes the page. `installer` R34 ("the same block as `instance-setup` R47") stays true, unchanged.
- **R53:** its last sentence becomes "(the page's words: `setup-page` R21, R24)".
- **R60:** its last sentence goes to `setup-page` R19.
- **R63:** its scope becomes this module's own strings: C-64.2–C-64.7, R65's new row, R47's block and the stated sentences. The page's share is `setup-page` R21.
- **R64:** "The enrolment page (R21, R22) offers…" becomes `setup-page` R22.
- **R65:** the page half becomes `setup-page` R23.
- **Purpose:** "it serves the page…" becomes "it composes and serves `setup-page`'s page (R47's block in its slot)".
- **Decided:** "The `/` route … calls R20" becomes "calls `setupPage`, re-exported from `setup-page` R1".
- **Suggestions:** the record-browser line points to `setup-page`.
- **Status:** gains a "SPLIT for T34" paragraph in K1505 (1)'s form.
- **Uses:** gains `setup-page`. The record-grammar clause for the page (R24, R32) and the `entities` `op=entitycreate` clause (R61) go with the page.

## 4. Other modules (requirement text: wording only)

| module | requirement text | code |
|---|---|---|
| `control-plane` | R1: "answers `instance-setup`'s page (its R20)" becomes "answers the page `setup-page` R1 builds, composed by `instance-setup`'s `setupPage`" | none (`index.mjs:26` reads through the re-export) |
| `installer` | R37: "the copy's setup (`instance-setup` R59)" becomes `setup-page` R18. Status history is left as written | none (the leaf is unchanged) |
| `membership` (optional) | R11 "asked at setup (`instance-setup`'s act)" and the T34 Suggestion line 201 become `setup-page`'s (its R15–R17) | none |

**Not touched:** queue-producers, op-declarations, wizard-scripts, affordances, plane, credentials and jurisdictions. Their ids (R1, R13, R14, R50–R55, R60, R62, R64, R65) name ops or reads that stay in instance-setup.

**Catalogue rows (C-…) that move: none.** The page holds no row; C-64 stays, and so do T34's new rows (`PLACE_NAME_MALFORMED`, `GROUP_DRAFT_NO_ANSWERS`).

**`modules.json`:**
- a new entry before `instance-setup`;
- `instance-setup.uses` gains `setup-page`.

## 5. Tests

Tests move to `test/m/setup-page/`, about 1,300 lines, re-labelled with the new ids. None may import `setup.mjs` or instance-setup's fixture: check 1 reads tests' imports, and instance-setup is later.

**Move:**
- `page.test.mjs`, except the R47 arm (281–306, which stays: the composition is instance-setup's);
- `loads.test.mjs` (R12);
- `intake.test.mjs` (R9, R10);
- `keys.test.mjs` (R8; copy `storage`);
- `worker-page.test.mjs` (Miniflare by path, not an import; the "R1 R3" arm is re-labelled so as not to name `setup-page`'s R1 and R3 wrongly);
- `profiles.test.mjs` R15 arm 180–267 (R13);
- `assistant.test.mjs` page arm 71–120 (R24), re-driven over a fake plane;
- fixture `pageOver` (198–257), copied.

**Stay:**
- the R31 test, over the composed `SETUP_HTML`, which is still re-exported (`setup-page` R25 copies the page part);
- R47;
- every store, Worker and report suite.

## 6. Line counts after the split

| module | lines |
|---|---|
| `setup-page` | ~1,620 (1,592 moved, plus header and imports) |
| `instance-setup` | **~2,110**: `setup.mjs` ~1,825, `livefire.mjs` 247, `setup-fleet.mjs` 39 |
| `instance-setup` after T34-57/81/90 | ~2,550–2,750 (store side +450–650: R50–R52 on the real profile, R53, R60, R62, R64, R65, the rows) |
| `setup-page` after T34 | ~2,100–2,450 (page side +500–800) |

Both stay clear of 4,000 (P6).

## 7. Risks and accepted reds

1. **Plane construction order.** Accept by name: extend accepted red 8 (K1832) to `setup-page`. plane `store.test.mjs`:91 R2/R10 asks every module for a construction step, and `setup-page` is pure, with none, like `case-catalogue`. The red lasts until plane's T34-76.
2. **Two copies in the window** (K624 (1)). Between `setup-page`'s merge and instance-setup's (T34-57), the page is held twice, and the served copy is still instance-setup's. No catalogue row and no census count is involved. Merge `setup-page` first in instance-setup's L11 slot. T34-57's opening act then swaps the copy for the re-export and the slot.
3. **The page's T34 work goes with the new module.** The page shares of T34-57, T34-81 and T34-90, and DEC-149's 35 page rows (T34-87), become a new entry: **SETUP-PAGE #1**. **T34 jobs: 74 → 75.**
   - Its new arms (R2 `#join=`, R15–R20, R22, R23) are tested over `pageOver` with a fake plane answering the ops' documented shapes.
   - End-to-end arms over the real ops (`placewanted`, `memberlanguageset`, `groupdescriptiondraft`) may follow in instance-setup's job, informational.
   - Coverage reds are accepted red 1's (`not yet met: T34`).
4. **Meaning: none changes.**
   - The served bytes are unchanged, the block included, and so are every op the page drives, R47's words and installer R34.
   - *Flag:* the ownership of "the page" in R47, R53, R60, R63, R64, R65 and Purpose moves (wording only).
   - R63 now holds in two modules, each for its own strings, with the same rule.
5. **The slot must stay unique.** Test it: `setup-page` R14 checks the slot appears once, in the claim section, before the password fields. instance-setup R47 checks the composed page shows the block there and no slot remains.
6. **Bundles.** `release/bio-plane.bundled.mjs` and the newgroup bundle go stale until the close, as K1690 already records. The leaf is untouched, so the installer is unaffected.
