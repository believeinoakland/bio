# T13 wordings: N322 (with N250), N324, N323, N319, N30 (a worker for BOB #64, 2026-09-29; P18)


**BOB's rulings on this draft (K408).** (1) N323: R14 and R27 bounded at 1,000 with `truncated` stated (K391's pattern); a cursor is not taken now. (2) N319: the census suite never stands red at a close: rows changed after the tranche's stamp and named by that tranche's job records are listed `awaiting stamp` and pass; any other difference fails. (3) N30: cap 262,144 units; R16 lists hidden rows as ranges `{min, max, visibility}`, as hidden columns are, the same set in another encoding (wording). (4) N324: C-96.1 moves to membership's table; legacy-checks' `CUSTODIAL_CHECKS` copy is removed in the tranche after (its `#custodialRefusal` reads it), so for one tranche the row is held twice, and legacy-tests' census accepts that duplicate by name. The four other codes for the same condition are N327. Fold these when T13 opens (P10), not while T12 runs.
Read on `tranche/T12` @ 22b5105ac7. Not folded. Every id below is the next free one in its module (record-core R62, membership R84, intent R29, promotion R50, odf-reader R45). No file marks a retired id at or above those numbers. Codes, helpers, bounds and cursors are wording under meaning Bob already approved (K238, K275, K338). The places where meaning might move are marked **MEANING?**.

---

## 1. N322 (with N250): `MINT_EXHAUSTED`, one site

**Decision.** record-core is the earliest module in the order that mints the code (K275), so it provides the helper and holds the row. The condition is: `mintOpaqueId` answers null. record-core has no row table of its own yet. The row is new in one (K174), numbered next in C-59, the opaque-id family whose C-59.5 is already record-core's: **C-59.6**. It takes C-87.12's translation. C-87.12 is retired and its number is not reused. **N250's legacy-checks share falls away**, because under K275 the row is record-core's, not the catalogue's.

**record-core.md, new service after `mintOpaqueId` (Provides):**

> **mintExhausted(prefix, extra?) → refusal** (N322, N250, K275, K392; a module-level function)
> - **R62** The one answer to one condition: no free opaque id could be drawn (R6's `mintOpaqueId` answered null, R9). It answers `{ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check, translation, prefix, detail}`: `prefix` the gated prefix asked (R3's set), `detail` one fixed sentence per prefix naming the id it could not draw (a project, case, draft, grant or task id) and saying nothing was written, the same for every caller, and `check` and `translation` its row's. `extra` adds a caller's own fields and never replaces these. Every act of any module that answers this condition answers through it (`promotion` R19, `case-authoring` R7, `review` R27, `queue` R23), so the code is minted at one site; its one row is this module's (C-59.6), its `where` naming this function, and review's C-87.12 gives way to it. It writes nothing and never throws. *(not yet met: N322)*

**record-core.md, Uses:** the `legacy-checks` line stays. Add a Suggestions line: "C-59.6 is held in this module's own row table (K174), beside C-59.5, which stays in the catalogue until it moves here."

**promotion.md, R19.** Replace "The plane mints the id and writes it into the document before hashing, so the returned `bundleSha` is of what is held." with:

> The plane mints the id and writes it into the document before hashing, so the returned `bundleSha` is of what is held; when no free id can be drawn the creation is refused `MINT_EXHAUSTED` through `record-core.mintExhausted` (its R62) and nothing is written. *(not yet met: N322)*

**promotion.md, Uses, `record-core` line.** Replace "`mintOpaqueId` (a project's id, R19)" with "`mintOpaqueId` and `mintExhausted` (its R62) (a project's id, R19; N322)".

**case-authoring.md, R7 (in full):**

> - **R7** The case: `caseId` with `newCase` is `CASE_IDENTITY_AMBIGUOUS` (C-44.1), and so is neither when the members serve more than one published case, naming them. A named case not published is `NO_SUCH_CASE`. Otherwise the named case, else the one case the members serve, else the case this act's own unsigned preparation names, else a minted opaque `CASE` id (`MINT_EXHAUSTED` through `record-core.mintExhausted`, its R62, if none is free, and nothing is published). `newCase` skips derivation. A case never changes project: `CASE_BELONGS_TO_ANOTHER_PROJECT`. *(not yet met: N322)*

**case-authoring.md, Uses:** "`mintOpaqueId` (R7)" becomes "`mintOpaqueId`, `mintExhausted` (its R62; R7)".

**review.md, R27 (in full):**

> - **R27** When no free opaque id can be minted (`record-core`'s `mintOpaqueId` answers none), `draft`'s new draft and `grant` answer `MINT_EXHAUSTED` through `record-core.mintExhausted` (its R62, prefix `DRAFT` or `RVG`, its detail naming a draft id or a grant id), and write nothing. C-87.12 is retired, its number not reused; the one row is record-core's C-59.6 (N322, K275). *(not yet met: N322)*

**review.md, Uses:** "`mintOpaqueId`" becomes "`mintOpaqueId`, `mintExhausted` (its R62; R27)". Its `legacy-checks` line is unchanged.

**queue.md, R23.** Replace "an exhausted id space keeps the event." with:

> an exhausted id space keeps the event, its `waiting` entry carrying `record-core.mintExhausted("TASK")`'s `code`, `check` and `detail` (its R62; N322). *(not yet met: N322)*

**queue.md, Uses, `record-core` line:** add `mintExhausted` (its R62).

**legacy-store** has no requirements file. Its share is code only. If T12's queue job did not take the task mint, the `store.mjs` site does the same as queue R23 above. **MEANING?** None. The task drain's `waiting` entry gains `code` and `check`, which is an added field, not a changed outcome.

**Rows (promotion stamps them, N318's pattern):** new C-59.6 `MINT_EXHAUSTED` (record-core); retired C-87.12.

Evidence: `src/record-core/index.mjs:328` (`mintOpaqueId`); `src/promotion/index.mjs:483-485`; `src/case-authoring/index.mjs:569-575`; `src/review/index.mjs:132-137, 436, 472`, `src/review/checks.mjs:144-151` (C-87.12); `src/store.mjs:6592-6597` (task mint, `waiting` detail); `checks/bio-checks.mjs:10925` (C-59.5, the family's last row).

---

## 2. N324: `NOT_AN_ADMIN`, one site

**Where C-96.1 lives: it moves to membership's own `MEMBERSHIP_CHECKS`.** Its number, code and translation stay the same, and its `where` becomes `notAnAdmin`. Reasons:
- K275 says the module that provides the helper holds the one row.
- C-96.13, of the same family, already sits in that table (K343), beside C-70.5, which R78's helper reads.
- K381 set the precedent with C-22.7, held once in its module's table.

Keeping the row in `CUSTODIAL_CHECKS` would not save a legacy-checks edit. Its `where` names `#custodialBar`, which stops holding the region either way.

**Sequencing:** membership adds the row at layer 2. legacy-checks removes its `CUSTODIAL_CHECKS.NOT_AN_ADMIN` copy in its next job (T14), as N251's legacy-checks share follows its reader. Removing it first would break `#custodialRefusal`, which reads `CUSTODIAL_CHECKS[code]`. Between the two, two tables hold one identical row. BOB should check that `check-refusal-codes` and d470 accept that for one tranche. If they do not, add a layer-1 legacy-checks job to T13, ordered after membership, or hold the share until T14.

**membership.md, new service after R78 (Provides):**

> **notAnAdmin(by, act, extra?) → refusal** (N324, K275, K403; a module-level function)
> - **R84** The one answer to one condition: the stamped caller `by` is not an administrator (R64) where the act is an administrator's. It answers `{ok: false, reason: "NOT_AN_ADMIN", code: "NOT_AN_ADMIN", check, translation, by, detail}`: `by` as stamped (null when none), `detail` one fixed sentence naming `act` (the caller's fixed phrase for its act, never taken from a request) and saying nothing was changed, and `check` and `translation` its row's (C-96.1). `extra` adds a caller's own fields and never replaces these. Each act that refuses this condition answers through it: R6, R7, R9, R10, R11, R12, R20, R25, R26 here, and `monitoring` R30. So the code is minted at one site. Its one row is this module's C-96.1, its `where` naming this function, moved from the catalogue's `CUSTODIAL_CHECKS` (the catalogue's copy retires in legacy-checks' next job). Who is admitted is still each act's own rule (R12's machine credential, R10's founder refused `ROOT_OF_TRUST` first); this function only answers the refusal. It writes nothing and never throws. *(not yet met: N324)*

**membership.md, existing statements.** Each change adds one pointer, and nothing else in them changes:
- R12: "is refused `NOT_AN_ADMIN` when `by` names a member who is not an administrator" becomes "is refused `NOT_AN_ADMIN` (R84) when `by` names a member who is not an administrator". R20, R25 and R26 say "as R12" and inherit it.
- R6, R7, R9: "`NOT_AN_ADMIN`" becomes "`NOT_AN_ADMIN` (R84)". Append *(not yet met: N324)* to R6, R7, R9 and R12.
- Uses, `legacy-checks` line: "(C-29, C-55, C-56, C-57, C-63, C-70, C-95, C-96)" becomes "(C-29, C-55, C-56, C-57, C-63, C-70, C-95, C-96; C-96.1 held here since N324)".

**monitoring.md, R30 (in full):**

> - **R30** The daemon is pausable by an administrator (monitoring's and the fallback's fetches stop; a paused tick says so); a pause or resume asked by a member who is not an administrator (`membership` R64's `isAdministrator`, read of the stamped `actor`) is refused `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84), with nothing written, and the root of trust is an administrator here (N314, K380); this module mints no `NOT_AN_ADMIN` of its own and reads no C-96.1 row (K403's local site retires; N324); and its due slate (every named request, sweep and monitored address now due) is exported as quoted data inside fixed instruction framing. *(not yet met: N324)*

**monitoring.md, Uses, `membership` line:** "`isAdministrator` (its R64), for R30's pause (N314)" becomes "`isAdministrator` (its R64) and `notAnAdmin` (its R84), for R30's pause (N314, N324)". Monitoring's legacy-checks Uses no longer needs `CUSTODIAL_CHECKS`.

**MEANING?** Two points:
- `adminResign`, `hostingAccessSet`, `memberCaps`, `adminEndorse` and `adminRemove` today answer `NOT_AN_ADMIN` without `code`, `check` or `translation`. `dec49Decorate` adds them only at the control plane. Through R84 they gain all three, as actions R8 did under K380. This adds fields and changes no outcome.
- Residue, not this entry: `ADMIN_ONLY` (R22, R41/R75), `AI_CREDENTIAL_ORG_NOT_ADMIN` (R62), intent's `GROUP_ASPIRATION_NOT_ADMIN` and bias' `BIAS_ADOPTION_NOT_AN_ADMINISTRATOR` name the same condition under different codes. K275's rule is one code, one site, so they break no rule here. If BOB wants one code per condition, that is a next.md entry.

Evidence: `src/membership/index.mjs:295-296` (`adminResign`), `322-323` (`hostingAccessSet`), `2212-2225` (`#custodialBar`; callers `2386, 2627, 2750, 2814`), `2264` (`memberCaps`), `2296` (`adminEndorse`), `2346` (`adminRemove`), `2227-2232` (`#custodialRefusal` reads `CUSTODIAL_CHECKS`); `src/membership/checks.mjs:19-30` (C-70.5, C-96.13); `checks/bio-checks.mjs:10566-10573` (C-96.1); `src/monitoring/index.mjs:1417-1423, 1437-1440`.

---

## 3. N323: intent's three unbounded internal reads

All three follow K391: a bound must bound the walk itself, and a cut must not reveal a hidden object.

**intent.md, R12 (in full).** The first sentence is unchanged. The bound's text already says "aspirations", and the code counts only held ones, which is the defect.

> - **R12** `aspirationsFor` answers those in force: the group's less any departure (each departure listed with its reason), the project's, and the member's, each with its scope. No precedence is stated or implied, and nothing is resolved between them. It reads at most the first 1,000 aspirations the viewer may see, in id order, held or retired and of any scope, each counted whether or not it is answered (a project aspiration of a project the viewer may not see is skipped and never counted: DEC-36, K391), answers those in force among them, and answers `limit` (1,000) and `truncated: true` when more follow. *(not yet met: N323)*

**intent.md, R13.** Replace "It pairs at most the first 1,000 held aspirations in id order" with "It pairs the held aspirations among the aspirations R12's read takes (the first 1,000 the viewer may see, in id order, held or retired)". Append *(not yet met: N323)*.

**intent.md, R14 (in full):**

> - **R14** `pursuitOf` answers the goals and objectives opened under the aspiration, the proposals triaged under them with each act and reason, the capture requests named in them with their outcome, and the dead ends. It carries no completion figure. It finds the aspiration's goals by reading at most the first 1,000 goals held, in id order, whatever aspiration each names (a goal is readable by every member, R23, so the read and its cut hide nothing), and answers `goals_read_truncated: true` when more goals follow. *(not yet met: N323)*

**intent.md, R17 and R27.** R17 is unchanged. R27 in full:

> - **R27** A question is **ageable** when R17 would move it (at `surfaced`, surfaced by a machine, no member's entry); its **ageing instant** is its last entry's time plus the ageing interval. `ageDue` answers the earliest ageing instant of any ageable question, past or not; `ageWake` the earliest one later than `now`; each answers null when there is none. A question R17 tried and could not move stays due and is tried again at a later firing, never woken for. Both write nothing and never throw. `ageDue`, `ageWake` and R17's `ageSurfaced` each read at most 1,000 questions at `surfaced`, those whose last entry is oldest first (then by id), and judge ageability among those alone; `ageSurfaced` answers `limit` (1,000) and `truncated: true` when more questions at `surfaced` follow. A question past the read is reached once earlier ones leave `surfaced` or take a newer entry. *(not yet met: N323)*

**intent.md, Bounds paragraph.** The whole paragraph, as it would read. Changed text is the R28 clause, the R12/R13 clause and the last two sentences.

> - **Bounds (N181, K239).** Every collection these services answer is bounded and says so: `progress` and `gaps` answer `limit` and `truncated`, and past 1,000 matched instances `satisfied` is null with its reason; `aspirationsFor` answers `departures_limit` and `departures_truncated`; `pursuitOf` answers `goals_limit`, `goals_truncated` (200), `triaged_limit` and `triaged_truncated` (1,000); `proposals` answers `set_aside_limit` (200, newest first) and `set_aside_truncated`. Their internal reads are bounded the same way, and each bound bounds the walk itself, never only what it keeps (N305, K367, K391, N323): R28's context reads the first 1,000 aspirations in id order, of any scope and held or retired alike, and takes the held ones of group or project scope in force, and, of the first 1,000 projects in id order, those with a condition, and `serves` answers `context_truncated` when either is cut; `proposals` with no project named reads at most the first 1,000 projects the viewer may see, in id order (a project hidden from the viewer is skipped and never counted, so `projects_truncated` says nothing of it; DEC-36), and answers `projects_truncated` when cut (K391); `pursuitOf` reads at most 1,000 named capture requests, in the order the basis names them, and answers `requests_limit` and `requests_truncated`; `aspirationsFor` and `contacts` read at most the first 1,000 aspirations the viewer may see (R12, R13); `pursuitOf` reads at most the first 1,000 goals (R14, `goals_read_truncated`); the ageing reads take at most 1,000 questions at `surfaced` (R27). *(not yet met: N323)*

Interface tests at each bound:
- 1,001 retired aspirations and then one held: `aspirationsFor` answers none held and `truncated: true`.
- 1,001 goals under other aspirations and then one under the asked aspiration: `pursuitOf` answers no goal and `goals_read_truncated: true`.
- 1,001 human-surfaced questions at `surfaced`, older than one ageable question: `ageDue` answers null and `ageSurfaced` answers `truncated: true`. Then one ageable question older than all of them: it is aged.

**MEANING?** Two points:
- (a) R27's "null when there is none" becomes "none among those read". scheduler may then not wake for an ageable question behind 1,000 older non-ageable ones at `surfaced`. A cursor would avoid that, but R27's two answers are bare instants with no place for one.
- (b) Past 1,000 goals, `pursuitOf` never reaches a later goal of the aspiration. This is K391's flag pattern, which K338 calls wording. A `goals_after` cursor is the alternative.

Both are BOB's choice under K338. I see neither as Bob's.

Evidence: `src/intent/index.mjs:889-905` (`pursuitOf`'s goal walk, stopping only on the 201st match), `1185-1203` (`#ageable`: every inquiry, and `readImage` for each at `surfaced`; callers `1165, 1211, 1223`), `808-824` (`#heldAspirations`: retired and out-of-scope ones `continue` uncounted; callers `854, 871, 558`), `68-70` (the bounds' constants).

---

## 4. N319: the census over every row table

**promotion.md, R34 (in full):**

> - **R34** `GATE_VERSION` contains `CATALOG_VERSION`, and both gates report the same `GATE_VERSION`. One version names one catalogue: `CATALOG_VERSION` changes whenever a check is added, removed or changed, wherever its row lives (R47), so two ratifications carrying the same string were judged by the same catalogue; `ROW_CENSUS` (R50) moves with it at every stamp. *(not yet met: N319)*

**promotion.md, new after R34:**

> **`ROW_CENSUS` → `{version, rows, digest}`** (N319, K382)
> - **R50** A frozen record of every refusal row as the last stamp read it. It covers every exported table in any module's `paths` or in `legacy-checks` whose values carry a `check` naming a C-number. `version` is the `CATALOG_VERSION` it was stamped with, and `rows` is the count of rows. `digest` is the SHA-256, lowercase hex, of the rows sorted by `check` and then code, one line each: the JSON array `[check, code, where, translation]`, newline-joined. Each stamp re-pins it: the job that moves `CATALOG_VERSION` sets `version` to that value and `rows` and `digest` to the census of the tree it stamps. A row that arrives, departs, or changes its `check`, code, `where` or translation therefore moves the census. This module states the pin only, and `legacy-tests`' census suite holds it against the tree, because this module cannot read a later module's table (P4). *(not yet met: N319)*

**When the census may be red (for R50 and the suite's header):**

> The census may be red only between two stamps. It turns red when a job in a layer after promotion's merges a row change, and it turns green when promotion's next stamp merges. That stamp is the next tranche's layer-2 promotion job, which stamps every row change made since the previous one (N318, K380). It is green at every stamp. A row changed in layers 1–2 of a tranche is stamped in that tranche, so it never turns the census red. While red, the suite names each row that arrived, departed or changed since the pin. The red is expected only when every row it names is one a job's record in the open tranche names, after that tranche's stamp. Any other red is a defect: a row moved with no record, or a stamp that missed a row.

**legacy-tests' share (no requirements file; the job's brief).**
- A census suite, beside `d470-catalog-census`, computes R50's census over every row table on the tree and compares it with `ROW_CENSUS`.
- A negative control: add a row to one module's table without re-pinning. The suite must fail by name.
- d470 stays as it is: it covers the catalogue file's literal emission sites, which carry no row table (S2).

**MEANING?** One process question: whether a suite that is red for a known reason between stamps is acceptable in a tranche's close, or whether the suite should instead pass while listing "awaiting stamp" rows that the open tranche's records name. The second option needs those records to be machine-readable. This is BOB's call on process (P10), not Bob's.

Evidence: `src/gate.mjs:301` (`CATALOG_VERSION`, the 1.42.0 note at 282-300); `test/d470-catalog-census.test.mjs:52-60` (S1 reads the catalogue file only), `288` (`CATALOG_CENSUS`, the per-version pin), `640` (1.41.0: 397); 35 module files export `*_CHECKS` tables (`grep -rl "_CHECKS = " bio-plane/src`: `src/*/checks.mjs` and six others).

---

## 5. N30: odf-reader, bounded repeat expansion

**What expands without a bound:**
- `text:s text:c` becomes `" ".repeat(c)`. `c` = 2,000,000,000 fails as `reader_failed:RangeError`.
- A carrying cell's `number-columns-repeated` is pushed one cell per column.
- A carrying row's `number-rows-repeated` copies the cells into every row.
- An empty hidden row run lists one row number per row (R16).
- R17 attaches a link at each repeated address.

Empty padding runs are advanced over, never materialised: the fixtures' 1,048,000, 2,000,000, 20,000 and 1,024. R12's `rows`/`cols` and R18's used extent only add, so they cost nothing and need no bound.

**The cap: `ODF_REPEAT_EXPANSION_MAX` = 262,144 units per `content.xml` read.** A unit is one of:
- one cell materialised at one address (a row repeat multiplies its cells);
- one hidden row number listed;
- one space from `text:c`.

How I measured it:
1. **Parity with literal markup.** The COFF-6 bound already admits a `content.xml` of 20,971,520 declared bytes (`MEASURED_OOXML_TEXT_BOUND_BYTES`). The smallest carrying cell a producer writes, `<table:table-cell office:value-type="float" office:value="1"/>`, is 62 bytes, so the bound admits at most 338,250 literal carrying cells. The more common string cell is 82 bytes, which gives 255,750. A cap near those figures lets repeats produce no more than the size bound already admits written out in full. 2^18 = 262,144 sits between them.
2. **Cost.** I timed `odsEntry` in node on crafted packages (`scratchpad/measure-odf.mjs`) at 262,144 units:
   - one cell repeated across columns: `text()` 646 ms, 112 MB heap;
   - one cell repeated down rows: `text()` 183 ms, 78 MB heap;
   - at 1,000,000 units: 4.1 s and 299 MB heap.

   262,144 is the largest power of two under the 128 MB Worker isolate in node's figures. 65,536 costs 216 ms and 36 MB if BOB wants headroom before DIST-14 measures a deployed plane.
3. **Fixtures.** No fixture expands more than 5. The large repeats in `test/m/odf-reader/ods.test.mjs:117-121, 177` are all padding and cost 0 units, so every current test stays green.

**odf-reader.md, new after R44 (Provides, shared envelope facts):**

> - **R45** (N30) Repeats are expanded within a bound: `ODF_REPEAT_EXPANSION_MAX` (262,144, exported) units per `content.xml` read, a unit being one cell given at one address (a carrying cell's `table:number-columns-repeated` and its row's `table:number-rows-repeated` multiplied, R15–R19; a link attached at a repeated address rides on its cell, R17), one hidden row number listed (R16), or one space a `<text:s text:c>` stands for (R11, R19, R24). An empty run advanced over, and every figure that only accumulates (R12's `rows`/`cols`, R18's used extent), costs none. The reader never expands past the bound: the read that would cross it stops, and the entry answers as over the size guard (R10, R13, R20, R27 for `text()`, R10's shape for each `structure()`), with the marker `{text: "undetermined", why: "over_repeat_bound", units, bound, boundName: "ODF_REPEAT_EXPANSION_MAX", metric: "expanded_repeat_units"}` in place of the guard's, `units` the count reached when it stopped (one past the bound). What R28–R30 read from outside `content.xml` is still answered, and `odfEvidentiaryDigest` (R32–R37), which expands nothing, is unaffected. It never ends in `reader_failed` for a repeat's size (R38). *(not yet met: N30)*

**odf-reader.md, R41:** add "R45's `over_repeat_bound`" to its list of stated "not read" branches.

Interface tests at the bound:
- A carrying cell with `number-columns-repeated="262144"` is read in full. At `262145` the reader answers `over_repeat_bound`.
- The same pair for rows × cells (512 × 512 against 512 × 513).
- `text:c="2000000000"` answers `over_repeat_bound`, not `reader_failed`.
- A collapsed empty row run of 262,145 answers `over_repeat_bound`.

**MEANING?** One point. An `.ods` that hides every row below its content (LibreOffice writes a collapsed empty run of about 1,048,5xx rows) lists that many row numbers under R16, which is over the cap, so a legitimate file would read undetermined. Rewording R16 to list hidden rows as ranges `{min, max, visibility}`, the shape `hidden-cols` already uses, would remove that expansion entirely. That changes R16's output shape. I recommend it, but it is BOB's to take as wording or to put to Bob. If R16 keeps row numbers, hidden row numbers count against the cap as worded above.

Evidence: `src/odf.mjs:350-368` (`visibleText`, `text:s`), `1214-1283` (`walkSheet`: columns 1219-1227 ranges only, cells 1236-1257, row materialisation 1263-1277, hidden empty rows 1278-1280), `1140-1148` (R12's table figures, accumulated only), `src/ooxml.mjs:107` (the 20 MiB bound), `src/formats-xlsx.mjs:376-377` (XLSX's grid, which expands no repeats: its cells are literal).
