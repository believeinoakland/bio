# T38 L11: requirement drafts (N783, N788, N792, N793): for BOB, before L11's START

Read on `tranche/T38` @ `aa0183c946`. Case-carriage's R14 (`obscureMarkWithdraw`) is cited as `plan/draft-T38-L8.md` §2 words it. L8 merges before L11, so each job reads R14 as it merged.

## 0. Findings BOB should settle first

1. **Two reds no rule names (run today):** affordances `t36.test.mjs`:40 (R48: 204 design texts, not 203) and op-declarations `t37.test.mjs`:175 (R21: the registry's `owed:obscuremarkwithdraw` is unserved). Both have been red since PR #15 (`c848b56671`, DEC-183) changed `mock-acts.js` and `registry.json`. T38-15 clears the second. The first needs **affordances**, which has no T38 entry. `ACT_HELP` is affordances' table (R48, generated from `mock-acts.js`, `affordances/act-help.mjs`:4), so "the `setpassword` text as the screens already have it" (T38-15) cannot be op-declarations' work. Suggest: a new entry, affordances (L11), that re-generates `ACT_HELP` from PR #15's file (`setpassword`'s new text, and `obscuremarkwithdraw` under its op). It merges after op-declarations by a merge-order line (rule 1), and R48 is re-read at PR #15. Name both reds in rule 6 until then.
2. **T38-15 names the wrong requirement.** R27 is DEC-148's *library* (`library.json` has no `obscuremarkwithdraw`). The registry rule is **R21**.
3. **N793 has two sites, not four.** In code, only `tasks/index.mjs`:612 and `setup.mjs`:2085 (R69, and R73 through `#translationMember`, :2492) mint `NO_SUCH_MEMBER`. Credentials already calls the helper (`credentials/index.mjs`:649). setup-page only maps the code to words in browser script (`setup-page/index.mjs`:1845). It cannot import membership. control-plane names the code only in a comment (`control-plane/index.mjs`:2430–2440). The split study already found this (`plan/membership-split.md`:227–233).
4. **op-grades: `obscuremark`'s own grade moves.** R27 grounds it `undetermined` because "no act takes it back (marks are append-only)". Withdrawal is a published act that takes it back, so by R3 it is `reversible`.

## 1. op-grades (T38-14)

**R27, `RUNG_ABSENT` clause:** "`RUNG_ABSENT` holds `obscuremark` (`case-carriage` R9), ground `undetermined`, on R3's rule: a mark asks no authored reason (…) and no act takes it back (marks are append-only, `case-carriage` R12); `setpassword` …"
**Proposed:** "`RUNG_ABSENT` holds `obscuremark` (`case-carriage` R9), ground `undetermined`, on R3's rule (… ) until T38, when R28 moves it to `RUNGS`; `setpassword` …". In the `NON_ACTS` bullet, `obscuremark`'s reason "…, append-only; moves no bundle" → "…; withdrawn only by a reasoned act, never erased (R28); moves no bundle" *(not yet met: T38)*.

**R28 (new):**
> **R28** (T38; N788; DEC-183 (2); `case-carriage` R9, R14; `op-declarations` R40) The withdrawal of a mark on a photo, by R5 and R3, `affordances` R12's totality holding over it, each grade read from its owner's requirements:
>   - `RUNGS` assigns `reasoned` to `obscuremarkwithdraw`: `case-carriage` R14 refuses it without a reason (`WITHDRAW_NO_REASON`, which joins `JUSTIFICATION_REFUSALS`), and a withdrawal is recorded beside the mark, never erased. `obscuremark` leaves `RUNG_ABSENT` and `RUNGS` assigns it `reversible`: a published act (`obscuremarkwithdraw`) takes a mark back (R3), and the mark is kept.
>   - `NON_ACTS` gives `obscuremarkwithdraw` "photo-directed: keyed by a photo's capture and one mark, reached from the Photos step; a member's reasoned withdrawal of a mark, recorded beside it, never erased; moves no bundle".
>   - Neither is in `MACHINE_REFUSALS`, which holds only `ACTS` (R5, `affordances` R20): `case-carriage` refuses a machine by name itself (`MACHINE_CANNOT_WITHDRAW_MARK`). By R18 both carry `phone: true`. No vocabulary or prompt is added. *(not yet met: T38)*

Note: grades live in `op-grades/t37.mjs`:29, :45. A `t38.mjs` follows the per-tranche files. Status line: "Last changed T38 (T38-14: R27 amended, R28 new; N788; DEC-183)". **Ask:** use the code names case-carriage R14 merged (the draft's `WITHDRAW_NO_REASON` and `MACHINE_CANNOT_WITHDRAW_MARK` may be re-coded at L8). If BOB keeps `obscuremark` `undetermined`, drop the second sentence of the first bullet and the NON_ACTS edit, but R27's ground sentence then states something false.

## 2. op-declarations (T38-15)

**R21, at its end (after "…no longer a function served in process."), add:**
> (T38; N788; DEC-183) The registry is read as PR #15 left it (`main` at T37's close, `c848b56671`): its owed act `obscuremarkwithdraw` (the ceremony's Photos step) is read as served and declared under its own name (R40). `infolevelset` stays without a spec. *(not yet met: T38)*

**R40 (new):**
> **R40** (T38; N788; DEC-183 (2); `case-carriage` R14) `OPS` holds a spec for `obscuremarkwithdraw`, in `SESSION_OPS.member` and `SESSION_OPS.admin`, none in `GOVERNANCE_ACTIONS` or `IDENTITY_ACTIONS`, not on `credentials`' `AI_GRANT_OPS`, for a session only (classes `admin`, `member`; `machineClasses: []`): a member's act, mutating, `by` stamped (from the query only, case-carriage's family, as `obscuremark`'s, R38), `captureSha`, `mark` and `reason` body fields, `NEEDS` `contribute`. R6 holds over it. *(not yet met: T38)*

**R34:** no text change. Once affordances re-generates `ACT_HELP` from PR #15 (§0.1), `obscuremarkwithdraw` is explained under its own name and is not named in `ACT_HELP_ABSENT`. Until that merge, the job reports the op as R34's one gap and names nothing in `ACT_HELP_ABSENT`.

**Uses, the T37 case-carriage bullet:** append "(T38) and `obscuremarkwithdraw` (its R14; R40)".

Note: add one line to `OP_FAMILIES["case-carriage"]` (`op-declarations/index.mjs`:415–416): `obscuremarkwithdraw: "member"`. The family's `actor: QUERY("by")` then gives control-plane its `by` stamp (`OP_STAMPS`, `control-plane/index.mjs`:904). Its `contribute` NEEDS follows from "member" as `obscuremark`'s does. **Ask:** does the plan's "`setpassword` text" mean anything here beyond §0.1? `op-declarations` holds no explanation text.

## 3. tasks (T38-21)

**R3, clause:** "`NO_SUCH_MEMBER` (an active member);"
**Proposed:** "`NO_SUCH_MEMBER` (an active member), answered through `membership`'s `noSuchMember` (its R121; K231: one code, one site) with `member` the `to` asked *(not yet met: T38)*;"

**Uses, `membership` bullet:** append "; `noSuchMember` (its R121, T38: R3's `NO_SUCH_MEMBER`)".

Note: the site is `tasks/index.mjs`:612. Its own `detail` ("a task is forwarded to an active member…") gives way to R121's fixed sentence (R121: `extra` never replaces `detail`). Tests `inbox.test.mjs`:439–440 assert the reason only. **Ask:** none. An inactive (`gone`) member is still this refusal, as R121's row allows.

## 4. setup-page (T38-22): req none

The page mints no code. `setup-page/index.mjs`:1845 is browser script that turns a refusal it received into a sentence ("There is no member by that name. Add them first, then register their key."). It cannot call a plane helper, and K231 governs mints, not readers. **Recommend dropping T38-22** (one job fewer). If BOB wants one wording of the condition, the START tells the job: delete line 1845's branch so D-158's rule (`:1851`, the refusal's own `translation`) shows C-96.47's words; add a test that a `NO_SUCH_MEMBER` refusal shows R121's translation; no requirement changes (no setup-page R names the sentence).

## 5. instance-setup (T38-23)

**R69, clause:** "`NO_SUCH_MEMBER` for a `member` that is not active."
**Proposed:** "`NO_SUCH_MEMBER` for a `member` that is absent, a machine identity or not active, answered through `membership`'s `noSuchMember` (its R121) with `member` the id asked *(not yet met: T38)*."

**R73, refusals clause:** "Refusals in order: `MACHINE_CANNOT_TRANSLATE`; `LANGUAGE_MALFORMED`; …"
**Proposed:** "Refusals in order: `MACHINE_CANNOT_TRANSLATE`; `NO_SUCH_MEMBER` (R69's, through `membership` R121) when `by` is not an active member *(not yet met: T38)*; `LANGUAGE_MALFORMED`; …" (job: confirm the order against `setup.mjs`:2492; state it as the code has it).

**Rows (add to R75's block or the T37 rows bullet, where C-64.17 sits):**
> (T38; N793; K231, K2275) This module holds no `NO_SUCH_MEMBER` row: C-64.18 is dropped and never reused, and the code's one row is `membership`'s C-96.47 (its R121). *(not yet met: T38)*

**Uses (T37 bullet):** "`membership`: `notAnAdmin` (its R84) and an active member's read (R69, R73)" → "…, and `noSuchMember` (its R121; R69, R73)".

Note: the sites are `setup.mjs`:276–281 (the row) and :2082–2087 (`#translationMember`, region `is-translation-member`, which goes with the row). The caller's sentence ("Nothing was changed/recorded") gives way to R121's fixed one. Tests `translations.test.mjs`:59–69 and :438 assert the reason only. **Ask:** none. The row's removal is stamped in T39 (K2275 (4)), so `row-census` keeps C-64.18 awaiting until then (rule 6 item 2).

## 6. admission (T38-24)

**R21, clause:** "`sourceOf(req, env)` answers the keyed fingerprint of the connecting address (…), made as `capture` R56 makes one (HMAC-SHA-256 under the same key), or one shared source of its own when the request states no address;"
**Proposed:** "… or one shared source of its own when the request states no address. (T38; N792; K2247) When the `KNOCK_FINGERPRINT_KEY` binding is unbound, the key is only in the store (`capture` R56's instance key), and `sourceOf` answers the fingerprint the store makes of the address under it, asked through the store-internal `doorwindow` route with `count: false`, which counts, refuses and writes nothing. So for one address `setpassword`'s `source` (`control-plane` R68) equals `login`'s (the window's, R58) with or without the binding, and `credentials` R38's sign-in window counts them as one source. When the store cannot be asked, `sourceOf` answers `null` as before, logged by correlation id only, and never throws *(not yet met: T38)*;"

Note: the cause is `admission/index.mjs`:786 (`if (!bound) return null`). `login`'s source comes from `doorWindowGate` (:800, the store's `window.mjs`:51, capture's `sourceFingerprint`). A non-public op never reaches that gate, so `control-plane/index.mjs`:915 stamps `sourceOf`'s `null`. A `count: false` flag on the existing route (`admissionOps`, `window.mjs`:95) is admission's own and needs no new route, so op-declarations R6 is untouched. **Ask:** a new route (`doorsource`) is the alternative. It would need op-declarations R6 to name it (op-declarations merges first in L11), so the flag is preferred. Test: with no binding, `sourceOf` for a stated address equals `doorWindow`'s `source` for it, and the count is unchanged.

## 7. answer-envelope (T38-25): req none

R7 already composes `CHECK_FAMILIES` "of the modules' own families, read in the order of `build/modules.json`… total over `build/modules.json`". The split only adds a module. The START tells the job:
- add `["src/project-roster/checks.mjs", PROJECT_ROSTER]` directly after membership's entry (`answer-envelope/families.mjs`:126), importing project-roster's checks (`modules.json` edge exists, K2270);
- clear rule 6 item 13 (`families.test.mjs`'s two totality tests) and item 11's `catalogue-end.test.mjs` (`LAST_OWNER`'s row). Each moved code reads the same `code`, `check` and `translation` as before (R7: no row moves; the `where` re-stamps are promotion's);
- `NO_SUCH_MEMBER` already resolves to membership's C-96.47 first (membership precedes instance-setup), so T38-23's drop changes no decoration.

## 8. plane (T38-26): req none

R2, R3 and R5 compose every module at its place in `build/modules.json` (R3: each owner's `migrate()`, R5: each ops map). The START tells the job:
- `store.mjs`:509: spread `...projectRosterOps(projectRosterOf(ctx), url, body, env)` directly after `membershipOps` (`project-roster/index.mjs`:685);
- `#migrate` (`store.mjs`:408): `projectRosterOf(this.ctx).migrate()` directly after `membershipOf(…).migrate()`, so a fresh store holds `project_join_requests`, `project_owner_votes` and `project_owner_decisions` (K2294). Building it there also starts it (`r.start()`, :676), registering its R15, R16 listeners before the first request;
- `stats.mjs`:25: add `["project-roster", ProjectRoster.COUNT_KEYS, (ctx, hid) => projectRosterOf(ctx).counts(hid)]` after membership's (`COUNT_KEYS` `["projectOwnerVotes"]`, `project-roster/index.mjs`:104);
- clear rule 6 item 11's plane, affordances and promotion reds and `migrate-released.test.mjs`. `obscuremarkwithdraw` needs nothing here: R18 already spreads `caseCarriageOps` (`store.mjs`:556–558).

## 9. control-plane (T38-16)

**`obscuremarkwithdraw`: no code change.** Routing is generic. The route map is the plane's, with `caseCarriageOps` spread there (case-carriage R14 adds the arm). Stamps come from `OP_STAMPS`, derived from `OP_FAMILIES` (`control-plane/index.mjs`:57, :904–923). The session-only gate comes from the spec's classes (op-declarations R40). No control-plane file names `obscuremark` (grep). The share is R67's wording and a test.

**R67, current:** "The door routes `obscuremark` and `photomarks` to `case-carriage`'s own map as `plane` composes it (R26's pattern), with the stamps `op-declarations` R38 declares …"
**Proposed:** "(… ; T38: N788, DEC-183 (2), `op-declarations` R40, `case-carriage` R14) The door routes `obscuremark`, `photomarks` and `obscuremarkwithdraw` *(not yet met: T38)* to `case-carriage`'s own map as `plane` composes it (R26's pattern), with the stamps `op-declarations` R38 and R40 declare (`obscuremarkwithdraw`'s `by` from the caller's session, never one the caller sends) and none taken from the caller (R29), each refused to any caller not arriving by a member's session, holding no arm's behaviour."

**Uses, T37 bullet:** "`case-carriage`: its ops map (R67)" stands; nothing is added.

**N793: none.** The code is not minted here. `index.mjs`:2430–2440 is a comment recording membership's measured refusal, so control-plane does not call `noSuchMember` and the Uses line gains nothing.

Note: test it in `t37-door.test.mjs`'s pattern (:13, :103–106, `routesForSessions`). `obscuremarkwithdraw` reaches case-carriage's route for a member's and the founder's session, with `by` from the session, a caller's `by` dropped, and machine and `ai` credentials refused. One route sentence and a test are well under P6 (3,263). **Ask:** whether T38-16 still needs a job. With R67 re-worded and the test written by the job, yes. Otherwise BOB moves the test to T38-15's START (op-declarations' tests already drive routes) and drops T38-16. The plan's "a route R" becomes R67 amended, not a new R69.
