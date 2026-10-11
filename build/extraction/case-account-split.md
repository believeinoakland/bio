<!-- Extraction map for case-authoring's second split (K617, K624, K625, K1821; N839, K2542), a DRAFT for BOB, written 2026-10-10 on tranche/T41 by a worker as T42's L8 preparation; uncommitted. The working tree moved to tranche/T42 (K2607) while it was read; the code read is identical on both (no diff under case-authoring, review, control-plane/owner-ops.mjs or plane/store.mjs between cf2bc961d7 and 5a03fc7fec). BOB reviews it. -->
# case-authoring → case-account — extraction map (second split, N839)

**Status** · DRAFT for BOB, 2026-10-10, uncommitted.

**Why.** Plan N839 (K2542): `case-authoring` passed K617's ~4,000 lines after T41-43 (R63–R68). Over its own path (K1821, K2513; `modules.json`:117, `bio-plane/src/case-authoring/` only, tests not counted), `wc -l` gives **4,139**:
- `index.mjs` 3,047;
- `document.mjs` 676;
- `checks.mjs` 169;
- `searched.mjs` 149;
- `schema.mjs` 98.

The plan's 4,131 is doubt 9.

**Read whole:**
- `requirements/case-authoring.md`; its `modules.json` entry and every entry whose `uses` names it (review, affordances, op-declarations, answer-envelope, control-plane, plane) and the opening's provisional `case-account` entry (`modules.json`:118, K2607);
- all five files above, and `test/m/case-authoring/account.test.mjs`;
- `extraction/capture-split.md` (the format model) and `extraction/case-authoring-split.md` (N529's precedent, K1333);
- `plan/current.md` (T42); rulings K31, K617, K624, K625, K657, K1333, K1821, K2513, K2536, K2540, K2542, K2607;
- `record-core.declarePurge` and `#declare`, `record-grammar.proposalLabel`, `review`'s factory, `control-plane/owner-ops.mjs`, `plane/store.mjs` 284–316 and 672–680.

**Callers** were found by grep of every moved export, method, table and op over `bio-plane/src` and `bio-plane/test`, bundles excluded.

## 0. The answer

**The seam is the account's own machinery:**
- the system's drafts of a case's account and its check flags (R64: `accountPropose`, `accountDrafts`, the label, the two tables);
- the account's shape and its judgment against what it cites (R63's half that is not `publishCase`'s: `accountShaped`, `#accountJudged`, `#citedFor`, `#accountFlags`, the cite helpers);
- the draft an account began as and its acceptance (R64: `#accountDraftJudged`, the `account_acceptances` write);
- the reviewers' comments (R66: the registered reader, `#reviewCommentsChosen`, `reviewCommentBodyLines`).

**What cannot move: R65, R67, R68.** They run inside `#publishCase` and `publishPreflight`:
- R65 is the act's own argument set (`...unknown`);
- R67 is the pre-flight's step 6;
- R68 renders the document twice around the approval digest and is the pre-flight's step 7.

This is K1333's D2 again: R32, R34 and R53 stayed with the code that runs them. They stay here, re-pointed, and a new case-authoring **R69** states the order in which `publishCase` asks `case-account`, as R55 does for `case-disclosures` (doubt 2).

**The placement must be directly BEFORE `case-authoring`, not after it (doubt 1).** `#publishCase` calls the moved code (`accountShaped`, `#accountDraftJudged`, `#accountJudged`, `#reviewCommentsChosen`, the acceptance write), and so does `publishPreflight`. A module may use only earlier modules (P4). That is exactly why `case-disclosures` was placed before `case-authoring` (`case-authoring-split.md` §1). Nothing that moves calls anything that stays. Two small things are only copied:
- `#preparedProject` (a `case_documents` read);
- `COMPLETENESS_MAX`.

**Sizes.** About **465 lines** move (§9):
- `case-authoring` falls to about **3,700**;
- `case-account` is about **550**.

**Edges:**
- `case-authoring` gains `case-account` and loses `ai-runs` (used only by `accountPropose`'s `runs`).
- The new module uses `case-disclosures` (`accountJudged`, its R30) and earlier modules only.
- Three users call moved code directly:
  - `review` (L8, `registerReviewComments` at its factory);
  - `control-plane` (L11, `owner-ops.mjs` `accountpropose`, `accountdrafts`);
  - `plane` (L11, which hands `control-plane` the instance).
  
  Hence the pass-throughs in §7.

**Seams considered and set aside:**
- **After `case-authoring`, as opened (K2607).** `publishCase` would call a later module. That is legal only through registered providers (K31's pattern) for five services. With none registered, `op=publish` would answer differently, which changes meaning. And `case-authoring` could then never delete R63's judgment. Moving only R64's two ops (about 130 lines) after it would leave the tables and their reads here, so `case-authoring` would stay near 4,010.
- **The acknowledgements** (R19–R21, `op=statementack`: `acknowledgeStatement`, `statementAcknowledgements`, `#statementWriter`, `#reauthorAcknowledgements`, C-82, the ack renderers, `statement_acknowledgements`; about 620 lines). This is the larger and cleaner seam, but `review` and `publishCase` both read `statementAcknowledgements`. It is noted as the next seam if case-authoring grows past ~4,000 again (doubt 8).

**Requirement ids:**
- move whole: R64, R66;
- moved in part: R63 (the shape and the judgment);
- stay, re-pointed: R63's `publishCase` half, R65, R67, R68;
- copied: R18 (synchronous, inside the caller's transaction), R27, R28's share, R30.

## 1. The new module

- **Name:** `case-account` (as opened).
- **Place:** layer 8, **directly before `case-authoring`**, after `case-disclosures`. The order becomes `… case-import, case-disclosures, case-account, case-authoring, review`.
  - It must come after `case-disclosures` because `#accountJudged` asks `disclosures.accountJudged`.
  - Its users are all later: `case-authoring` and `review` (L8); `control-plane` and `plane` (L11); `op-declarations` (L11) by owner name.
- **Paths:** `bio-plane/src/case-account/`:
  - `index.mjs`: the class, the factory and the services;
  - `document.mjs`: `reviewCommentBodyLines`;
  - `schema.mjs`: `account_drafts` and `account_acceptances`.
- **Tests:** `bio-plane/test/m/case-account/`.
- **Factory:** `caseAccountOf(host, deps)`, one instance per host (K61). At creation it:
  - creates its two tables (`CREATE TABLE IF NOT EXISTS`, the same DDL, so a running store's drafts and acceptances are kept, with no data move);
  - declares them whole to `record-core`'s purge (`declarePurge("case-account", …)`).

  `deps`: `record`, `membership`, `inquiry`, `runs` (ai-runs' `runFor`), `disclosures`, `now`, each reached lazily on the host unless given (the fixture passes its stand-ins).
- **Uses** (each earlier in the order):
  - `record-grammar`: `proposalLabel` (its R54 subjects `case_account`, `account_check`; T42-1), `acceptanceRecord`, `ACCEPTANCE_FORMS`, `ACCEPT_MUST_REAUTHOR`, `SHARED_ACT_CHECKS`, `parseFrontmatter`;
  - `record-core`: `recordOf`, `transact`, `mintOpaqueId`, `mintExhausted`, `stampInstant`, `declarePurge`, `readFile`; the `bundles` read contract (its R37);
  - `membership`: `viewerPredicate`;
  - `inquiry`: `basisFor`;
  - `content`: the `content` read contract (its R45);
  - `extraction`: `capture_text` (doubt 6);
  - `publication`: the `cases` and `case_documents` read contracts (its R40);
  - `case-grammar`: `ACCOUNT_CITE_KINDS`, `reviewCommentsLines`;
  - `ai-runs`: `runFor`;
  - `case-disclosures`: `accountJudged` (its R30);
  - `test-support`.

  The opening's provisional `uses` (`case-authoring` among them) are replaced by these.
- **Who creates it:**
  - `case-authoring`'s factory, eagerly, so its tables exist and are declared at every boot before `plane` names it (doubt 4);
  - `plane` (`store.mjs`): built before `caseAuthoringOf` (313) once its L11 job re-points, with `runs: aiRunsOf(ctx, env)`;
  - the fixture.

## 2. What moves (by copy, K624)

**`case-authoring/index.mjs`**

| moved | lines today | to (case-account) | id |
|---|---|---|---|
| header's account sentences | 9–13 (part) | header | — |
| imports of `lawProposalState`, `acceptanceRecord`, `ACCEPTANCE_FORMS`, `ACCEPT_MUST_REAUTHOR`, `SHARED_ACT_CHECKS` | 83–84 (part) | `index.mjs` | R64 |
| import of `aiRunsOf` | 85–86 | `index.mjs` | R64 |
| imports of `reviewCommentsLines`, `ACCOUNT_CITE_KINDS` | 91 (part) | `index.mjs` | R63, R66 |
| `ACCOUNT_SENTENCES_MAX`, `ACCOUNT_CITES_MAX`, `ACCOUNT_FRAMINGS`, `ACCOUNT_DRAFT_MAX`, `ACCOUNT_DRAFTS_MAX`, `ACCOUNT_DRAFT_PREFIX`, `ACCOUNT_ACCEPT_KIND`, `REVIEW_COMMENTS_INCLUDED_MAX` | 172–187 | `index.mjs` | R63, R64, R66 |
| `citeOf`, `citesOf`, `accountShaped` (exported), `citeAddress`, `exclusionSentence`, `namedOrds` | 221–300 | `index.mjs` | R63 |
| the `runs` getter and constructor slot | 331, 338, 353–354 | `index.mjs` | R64 |
| the acceptance write (`account_acceptances`) | 1251–1256 | `acceptanceRecorded({caseId, edition, drafted, by, at})` | R64 |
| `#accountDraftJudged` | 1328–1361 | `accountDraftJudged` | R64 |
| `#accountJudged` | 1363–1410 | `accountJudged` | R63 |
| `#accountFlags` | 1412–1425 | `accountFlags` | R63, R64 (K2536) |
| `#citedFor` | 1427–1464 | `citedFor` | R63 |
| `#reviewCommentsChosen`, `#reviewCommentsReader`, `registerReviewComments` | 1466–1523 | `reviewCommentsChosen`, `registerReviewComments` | R66 |
| the drafts block: banner, `#caseForDrafts`, `#accountLabel`, `accountPropose`, `accountDrafts` | 1661–1771 | `index.mjs` | R64 |

**`case-authoring/document.mjs`:** `reviewCommentBodyLines` (659–676) moves to `case-account/document.mjs`. `caseDocumentText` imports it, never a copy (K1333's renderer rule), so the signed bytes are unchanged.

**`case-authoring/schema.mjs`**

| moved | lines today | id |
|---|---|---|
| `account_drafts` and its index | 50–68 | R64 |
| `account_acceptances` and its index | 70–82 | R64 |
| their two entries in `CASE_AUTHORING_TABLES` | 88–89 | R28's share |

**Copied, and also staying in case-authoring:**

| helper | lines | stays for |
|---|---|---|
| `str` | 188 | everywhere |
| `refusal` | 317–320 | DEC-49 families |
| `#rows`, `#one`, `#when` | 375–379 | all |
| `#liveText` | 386–389 | R4, R16 |
| `#preparedProject` | 2249–2254 | R7 |
| `COMPLETENESS_MAX` | 120 | R3 (a K57 copy, as `case-disclosures` holds one) |

**In the copy:**
- The private methods become public, with their bodies unchanged (`#x` → `x`, as N529 did).
- **The label.** `CaseAuthoring.#accountLabel(by, kind)` (1686–1699) is dropped. `accountPropose` labels with `proposalLabel(by, kind)`, `kind` being `"case_account"` or `"account_check"` (record-grammar R54, T42-1, N838). The shape is unchanged (`{by, state, machine_work, says}`). Only `says` changes, to R54's sentences. Labels already stored keep the words they were stored with.
- `#accountJudged` reads `this.disclosures.accountJudged` and `this.inquiry.basisFor` as today.
- `#caseForDrafts` uses the copied `#preparedProject`.

The SQL is unchanged.

## 3. What stays in case-authoring

Everything else stays:
- `publishCase` and its whole order;
- R65 (`AUTHORED_FIELDS`, `ACT_FIELDS`, `CASE_FIELD_NOT_ALLOWED`);
- R67's step 6 and R68 (`#approvalsHeld`, the approvals block, the digest, step 7);
- the "what changed" drafts (R38, R39);
- the acknowledgements (R19–R21, R59);
- the ceremony (R32, R34, R53);
- calculations and the timeline (R56, R57);
- the standards check (R61);
- `searched.mjs`, `checks.mjs` (no account code holds a catalogue row: `ACCEPT_MUST_REAUTHOR` is record-grammar's, and the rest are rowless codes).

**Re-pointed in `#publishCase` and `publishPreflight`:**
- 766 `accountShaped(…)` becomes `this.account.accountShaped(…)`, and so does 2077 and 2089.
- 1047 becomes `this.account.accountDraftJudged`.
- 1051 and 2091 become `this.account.accountJudged`.
- 1059 becomes `this.account.reviewCommentsChosen`.
- 1251–1256 become `this.account.acceptanceRecorded(…)`.

The block renderers `accountLines`, `accountSectionLines`, `approvalsLines` and `approvalSubjectSha` stay imported here, because `publishCase` writes the document.

**Gained:**
- an `account` getter (`caseAccountOf(this.#deps.host)`, test-passable);
- `caseAccountOf(host)` called eagerly in `caseAuthoringOf`;
- three one-line pass-throughs until their users re-point (§7): `accountPropose`, `accountDrafts`, `registerReviewComments`.

**Header:** lines 9–13 and 49 are re-worded; the account is `case-account`'s.

**`modules.json`:** `uses` gains `case-account` and loses `ai-runs`.

## 4. Requirement ids

| case-authoring | case-account | what |
|---|---|---|
| R64 (drafts) | **R1** | `accountPropose`, `kind: "case_account"`. Its refusals, in order: `NO_SUCH_CASE` (published or prepared, unseen and absent alike), `BAD_ACCOUNT_DRAFT`, `BAD_ACCOUNT_FRAMING`, `NO_SUCH_RUN`. Labelled `proposalLabel(by, "case_account")` (record-grammar R54). Append-only. |
| R64 (K2536) | **R2** | `kind: "account_check"` with `flags: [{ord, text, cites}]`, labelled `proposalLabel(by, "account_check")`; `accountFlags(case, afterDraft)` answers those proposed after the named draft (all of them with none named), in proposal order |
| R64 (list) | **R3** | `accountDrafts`, oldest first, bounded, `truncated` |
| R64 (taken up) | **R4** | `accountDraftJudged`: `BAD_ACCOUNT`, `NO_SUCH_ACCOUNT_DRAFT`, `ACCEPT_MUST_REAUTHOR` (the shared row, record-grammar R52); `acceptanceRecorded` writes record-grammar R52's one shape, kind `case_account` |
| R63 (shape) | **R5** | `accountShaped`: `BAD_ACCOUNT` and `BAD_STATEMENT_CITES`, naming the field |
| R63 (judgment) | **R6** | `accountJudged`: case-grammar R23's rows (the account, then the four statements), what they cite as the viewer reads it (`citedFor`), the lens, the conclusions and the flags, judged by `case-disclosures` R30; `ACCOUNT_CHECK_UNDETERMINED` fails closed; it writes nothing |
| R66 | **R7** | `registerReviewComments(fn)` once (`REVIEW_COMMENTS_DECLARED`, `MALFORMED`); `reviewCommentsChosen` (`BAD_REVIEW_COMMENTS`, `REVIEW_COMMENTS_UNREAD`, `REVIEW_COMMENT_NOT_FOUND`), the count left out or undetermined; `reviewCommentBodyLines` |
| R28 (share) | **R8** | `account_drafts` and `account_acceptances` declared whole to purge |
| R18 (copy) | **R9** | the judgment services are synchronous and write only inside the caller's transaction |
| R27 (copy) | **R10** | a case not published or prepared, and one the viewer cannot see, answer alike |
| R30 (copy) | **R11** | no place is named |
| new | **R12** | `caseAccountOf`, one instance per host; tables created and declared at creation; it never throws on another module's failed read |

**Retired in case-authoring as "moved to case-account R<n>":** R64 → R1–R4 and R66 → R7. BOB does the retirement.

**Re-worded in case-authoring** (wording only, BOB's):
- **R63** keeps `publishCase`'s half (it takes `account`, `accountDraft?` and `statementCites?`, and writes case-grammar R23's block; R34 lists every R30 refusal) and names `case-account` R5, R6 for the shape and the judgment.
- **New R69** (as R55 is for `case-disclosures`):
  - `publishCase` asks `case-account`'s R5 last among R3's refusals, after R65;
  - after R10, it asks R4 and then R6 (after R55's judgments, before R11), then R7;
  - after storing, it asks R4's `acceptanceRecorded`;
  - each first refusal is answered, and nothing is written.
- **R65, R67, R68:** unchanged in meaning. R67 and R68 name `case-account` R6 where they say "R30's check result".
- **R28:** loses R64's two tables (now `case-account` R8).
- **Uses:** `ai-runs` (R64's run) leaves, and `case-account` joins (index before this module). `record-grammar`'s line loses `lawProposalState`, `acceptanceRecord`, `ACCEPTANCE_FORMS` and `ACCEPT_MUST_REAUTHOR`.
- **Purpose, Status, Size:** the second split, in K1333's form; "Decided by BOB" gains item 7 (this split, with doubt 1's place).

**Other requirement text naming the moved ids** (wording only, each module's own):
- review R33 ("`case-authoring.registerReviewComments` (its R66)");
- record-grammar R52, R54 and `ACCEPT_MUST_REAUTHOR`'s `where` (`acts.mjs`:68–73: "case-authoring R64");
- case-disclosures R30 (names R63, R65);
- control-plane R71, op-declarations R43, op-grades R30 (the two ops' owner).

## 5. Callers in other modules (grep of `bio-plane/src`)

| module (file:line) | what it calls | requirement text | re-pointed by |
|---|---|---|---|
| `review` (`index.mjs`:975 in `reviewOf`; header 46–47) | `r.caseAuthoring.registerReviewComments(…)`, **at creation, on every host that builds review** (the plane builds it at boot, `store.mjs`:307) | review R33 | **review's next job** (no T42 job): `caseAccountOf(host).registerReviewComments`, edge `case-account` added. Until then, case-authoring's pass-through. |
| `control-plane` (`owner-ops.mjs`:36–38) | `of.caseAuthoring().accountPropose(…)`, `.accountDrafts(…)` | control-plane R71 | **control-plane's L11 job (T42-29):** `of.caseAccount()`, edge `case-account` added |
| `plane` (`store.mjs`:677; 313) | hands `caseAuthoring: () => caseAuthoringOf(ctx)` to `controlPlaneOwnerOps`; builds `caseAuthoringOf` | plane R35 | **plane's L11 job (T42-30):** adds `caseAccount: () => caseAccountOf(ctx)`; builds `caseAccountOf(ctx, {runs: aiRunsOf(ctx, env)})` directly before `caseAuthoringOf`; edge added |
| `op-declarations` (`index.mjs`:526–530) | the family `"case-authoring"` (`owner`, `cite: "case-authoring R64…"`) over `accountpropose` and `accountdrafts`, data only | op-declarations R43 | **op-declarations' L11 job (T42-26):** the family is renamed `"case-account"`, cite `case-account R1, R3` |
| `op-grades` (`t41.mjs`:6, 101, 240–243) | words naming "case-authoring R64" | op-grades R30 | wording only; its next job (no T42 job) |
| `record-grammar` (`acts.mjs`:68–73, `acceptance.mjs`:6; `ids.mjs`:51) | `ACCEPT_MUST_REAUTHOR`'s `where` names "case-authoring R64"; `ACD` is not in `ID_TABLE` | record-grammar R52 | doubt 7 |
| `case-disclosures` (`index.mjs`:1169–1214), `case-grammar` (`account.mjs`:3, 34) | comments naming case-authoring R63, R65 | case-disclosures R30 | wording only |
| `ratification` (`index.mjs`:745–747) | `approvalsInForce`, for case-authoring R68 | ratification R50 | none: R68 stays |
| `membership` (`index.mjs`:270–272) | `MODULE_ORDER` | R83 | **T42-3:** `case-account` at the place doubt 1 settles |
| `layers.md` (14, 311, 315) | row 8's order and the section | — | BOB, with doubt 1's place |

**Tests in other modules that call the moved code:**

| test | calls | re-pointed by |
|---|---|---|
| `control-plane/owner-ops.test.mjs` 118, 133 | its stub `of.caseAuthoring()` with `accountDrafts`, `accountPropose` | control-plane's job (T42-29) |
| `op-declarations/t41.test.mjs` 119 | `ACT("case-authoring")`, `READ("case-authoring")` | op-declarations' job (T42-26) |
| `review/fixture.mjs` 87; `acts.test.mjs` 311, 323; `approvals.test.mjs` 198 | a stand-in `caseAuthoring.registerReviewComments` | review's next job; green meanwhile |

## 6. case-authoring's tests

**No test file moves** (K1333's D3). Nearly every arm of `account.test.mjs` drives `op=publish` or `op=publishpreflight`, and `case-account`, which is earlier, cannot call them. The arms stay here as end-to-end proofs, re-tagged R69 (R63, R67, R68 stay as they are):
- `account.test.mjs` 64–161 (R63), 197–253 and 255–275 (R64's hand-over and K2540), 279–299 (R65), 303–341 (R66's hand-over), 345–435 (R67, R68).
- Their `w.ca.accountPropose`, `accountDrafts` and `registerReviewComments` calls go through the pass-throughs until case-authoring's next job, then through `w.cacc` (the fixture's `caseAccountOf`).

**Changed in case-authoring's job:**
- `fixture.mjs` 306–319: it builds `caseAccountOf(host, {disclosures: judgedDisclosures, runs: aiRuns, inquiry, record, membership, now})` first, and hands `caseAuthoringOf` no `runs`.
- `invariants.test.mjs` 65–70: `CASE_AUTHORING_TABLES` is the first two entries; the two account tables' purge arm goes to case-account R8.
- `account.test.mjs` 10: `ACCOUNT_FRAMINGS` is imported from `case-account`.

**case-account's job writes its own interface tests**, R1–R12, over a fixture copied from case-authoring's without `caseAuthoringOf`. A case is published or prepared by writing `cases` and `case_documents` rows directly (publication is earlier). The arms port from:
- `account.test.mjs` 165–195 (R1, R3);
- 259–267 (R2's propose and list);
- 137–150 (R5's table);
- 316–318 (R7's registration);
- `#citedFor`'s unseen-cite arm (152–160) as R6;
- the label against `proposalLabel` (R54);
- each refusal's negative control.

## 7. Placement in T42 (K624; the delete question)

**Does a later module call the moved code directly?** Yes, three do:
- **`review` (L8, after case-authoring)** calls `registerReviewComments` inside `reviewOf`. Deleting it in case-authoring's L8 job makes `reviewOf` throw `TypeError` on every host that builds `review`, and `plane` builds it at boot (`store.mjs`:307). So the whole plane fails to start until review re-points. Review has **no T42 job**, so that would be T43.
- **`control-plane` (L11)** calls `accountPropose` and `accountDrafts` through `owner-ops.mjs`:37–38, and **`plane` (L11)** hands it `caseAuthoringOf`. A delete in L8 breaks `op=accountpropose` and `op=accountdrafts` until T42-29 and T42-30.
- `op-declarations` (L11) and `op-grades` (L11) only name the owner; nothing breaks.

**Recommended: K625's pattern, in K1333's pass-through form.** case-authoring's T42 job:
- retires R64 and R66;
- deletes every moved body and both tables;
- keeps three named one-line pass-throughs to `this.account` (`accountPropose`, `accountDrafts`, `registerReviewComments`), unused by new code.

Its T43 job deletes them, once `review` (its next job), `control-plane` (T42-29) and `plane` (T42-30) have re-pointed.

**Not K625's named copy.** A full copy would keep `account_drafts` and `account_acceptances` in `CASE_AUTHORING_TABLES`. `record-core.#declare` refuses the whole list when any table is already declared (`TABLE_DECLARED`, nothing declared), and `caseAuthoringOf` ignores the answer. So the second factory on a host would silently lose the purge declaration of all four of its tables, `statement_acknowledgements` included. Two writers of one table would also exist. The pass-through holds no code twice and declares each table once.

**A delete in L8** would leave the whole plane red from L8 until T43. It is not recommended.

**The order:**
1. **BOB, before T42-3 merges and before L8's START:**
   - `modules.json` moves `case-account` to directly before `case-authoring`, with §1's `uses`;
   - `case-authoring`'s `uses` gains `case-account` and loses `ai-runs`;
   - `layers.md` row 8 and its section;
   - T42-3's `MODULE_ORDER` at that place;
   - `requirements/case-account.md` (§4) and case-authoring's retirements and re-wordings.
2. **T42-22 `case-account`** builds by copy and merges first in L8. It does not edit case-authoring's paths.
3. **T42-23 `case-authoring`** deletes, re-points (§3), keeps the pass-throughs, edits its fixture and re-tags its tests.
4. **L11 shares:**
   - T42-26 op-declarations: the family;
   - T42-29 control-plane: `of.caseAccount()` and its stub;
   - T42-30 plane: the getter, the build before `caseAuthoringOf`, the edge.
5. **T43:** review re-points (R33's text, the edge); case-authoring deletes the pass-throughs.

**`record-grammar` R54 (N838, T42-1, L1)** merges long before L8, so the copy labels through `proposalLabel` from its first commit. No `#accountLabel` is left anywhere: case-authoring's copy goes with the delete, and T42-23's "(N838) any account label left here" is met by that.

## 8. Doubts for BOB (best readings)

1. **The place: before, not after.** As opened (K2607, `modules.json`:118, `layers.md` 311), "directly after `case-authoring`" makes `publishCase` a caller of a later module (P4); the architecture check refuses the import. Making it legal needs five registered providers, which change `op=publish`'s answer when none is registered. *Reading:* place `case-account` directly before `case-authoring`, after `case-disclosures` (N529's reasoning, `case-authoring-split.md` §1). This must be settled before T42-3 pins `MODULE_ORDER`.
2. **R65, R67, R68 do not move.** N839 says "R63–R68 moved". R65 is `publishCase`'s argument set; R67 and R68 are `publishPreflight`'s steps, and R68 renders the document around its digest. *Reading:* retire R64 and R66; split R63 (shape and judgment to `case-account` R5 and R6); R65, R67 and R68 stay, re-pointed; add case-authoring R69 for the order (K1333's D2 and R55).
3. **The label's words.** `proposalLabel` with R54's subjects gives new `says` sentences. Drafts already stored keep their JSON label. *Reading:* accepted. The label is stored as answered at the proposal (as `what_changed_drafts`'), and `account.test.mjs` 186 still holds `/machine work/`.
4. **Tables before `plane` names the module.** From T42-23 to T42-30, nothing but case-authoring creates `case-account`. *Reading:* `caseAuthoringOf` calls `caseAccountOf(host)` eagerly at its creation, so both tables are migrated and declared at every boot; plane's L11 job then builds it explicitly first, with `runs`.
5. **`registerReviewComments` once.** `review` registers through the pass-through. A later direct registration (after review re-points) lands on the same instance, so `REVIEW_COMMENTS_DECLARED` can never fire twice for one review. *Reading:* no window has two readers.
6. **`capture_text` has no stated contract.** `#citedFor` joins `capture_text` in its own SQL, which extraction R58 does not list (it names `readings`, `reading_refs`, `reading_ref_terms` and `capture_text_skipped`). *Reading:* copy it as is. T42-10 (extraction, L4) takes a share naming `capture_text` in R58; otherwise it goes to `next.md`.
7. **`ACD` and the shared row's `where`.** `ACCOUNT_DRAFT_PREFIX` `ACD` is minted by `mintOpaqueId` but is absent from record-grammar's `ID_TABLE` (`ids.mjs`:51 has `CASE` and `WCD`). `ACCEPT_MUST_REAUTHOR`'s `where` names "case-authoring R64". *Reading:* both are T42-1's share if L1 has not merged (`row('ACD', 'case-account')`; the `where` names `case-account` R4, a census change stamped at T42-5 or T43), else `next.md`.
8. **Headroom.** About 3,700 leaves case-authoring about 300 under the mark. *Reading:* enough for T42. The next seam, should it pass ~4,000 again, is the acknowledgements (~620 lines), which needs `review` and `publishCase` to read the list through the new module.
9. **The measure.** The plan cites 4,131; `wc -l` at `5a03fc7fec` gives 4,139, identical to T41's last code commit. Either way the split leaves about 3,700.

## 9. Line counts

| | lines |
|---|---|
| case-authoring today (K1821, K2513) | **4,139** |
| moved from case-authoring | `index.mjs` ~412 (§2's ranges: 2 + 16 + 80 + 4 + 6 + 34 + 48 + 14 + 38 + 58 + 111, plus import and header parts); `document.mjs` 18; `schema.mjs` ~35: **≈ 465** |
| `case-authoring` after its job | 4,139 − ~465 + ~25 (getter, import, eager creation, three pass-throughs, the acceptance call, R69's comments) ≈ **3,700** |
| `case-account` after its job | `index.mjs` ~480 (moved ~395, less `#accountLabel`'s 14; copied helpers ~25; constructor, getters, factory, owns ~45; header and imports ~30); `document.mjs` ~22; `schema.mjs` ~45 (tables, `CASE_ACCOUNT_TABLES`, migrate): **≈ 550** |
