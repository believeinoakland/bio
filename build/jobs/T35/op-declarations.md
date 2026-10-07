# op-declarations (T35)

**Status** · session_01636dBMY68z64H9eWzh6W3u · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

My readings, carried on now (P17: yours to correct):

1. **R6 reaches past the START's list.** Owners merged in T35 serve ops with no spec, each named by its requirements as op-declarations' to declare. I declare every one in its owner's family, by R19's kinds:
   - events (red 29; R43–R46): `discretionrecord`, `assessmentrecord` (member: MEMBER_ACT_ONLY), `usewithdraw` (open: no machine refusal), `usesof` (read);
   - calculations (red 29; R32, R33): `usesfreeze` (member), `applicationrecipes` (read);
   - duties (red 29; R27, R28): `uselink`, `useunlink` (member), `reviewpropose` (proposal), `poweruses` (read);
   - standards (T35-31; R35, R37, R40, R43, its "T35" suggestion names them mine): `standardforce`, `standardforcewithdraw`, `standardrelease`, `standardadoption`, `standardimpose`, `standardbenchmark` (member), `standardforcepropose` (proposal), `forcesof`, `overridesof`, `editioninforce`, `bindsat` (reads);
   - capture-requests (T35-45; R51–R53): `recordsrequestopen`, `recordsrequestanswer` (member, stamped `principal` beside `viewer`, as its map reads `by` from `principal`), `recordsrequests` (read);
   - credentials R43: `subscriptiondisconnect` (the member's own act, `by` stamped), the seventh of red 23's seven routes.
2. **The stamp interface (`OP_STAMPS`) gains four keys** the control plane sets: `source` and `country` (on `claim`, `login`, `recover`; admission R21), `owner` (on `findin`; K1972) and `principal` (the records requests). `signout` and `signouteverywhere` are stamped `session` alone, as R30 words them.
3. **Served elsewhere:** `coarchiveset`, `coarchivestate` (the acquisition instance's methods, routed by control-plane T35-72) and `adminrecoverystep` (instance-setup T35-69, running beside me) are declared now and named in my tests as served by those jobs, as T34's were. `unpack` and `archivelist` sit in an `acquisition` family; `capture`'s map serves them.
4. **`agentpack`** takes the untargeted `affordances`' spec (admin, member, probe; a read; in no session set; no NEEDS row), stamped `viewer`; an `ai` credential reaches it by its scope as it reaches `affordances` (affordances is not on `AI_GRANT_OPS`, so nothing in credentials changes).
5. **Found:** each new op is one affordances' grading totality (its t33:136, red 29) will meet at my merge unless T35-66 grades them; I will name the exact list in my REPORT after running affordances' suite.

## Completion (T35-70; B2 CHANGE, K2038; B3, K2041)

**Entries applied.**
- **K1901 (R21, red 9).** The registry is read as PR #12 left it. `personexpunge` is people's declared op, and `OP_ALIASES` no longer holds `expunge`. Eleven owed acts are declared under their own names and read as served, with no alias: `placewanted`, `securitymap`, `findin`, `archivelist`, `noterevise`, `notedelete` and five from T34. The seven owed acts no owner serves have no spec: `infolevelset`, `subscriptionsignin` and the five translation acts. `t34`:64 and :129 are green.
- **R27.** The library marks seven acts owed. `memberlanguageset`, `startfrom` and `publishat` are declared. `subscriptionsignin`, `translationdraft`, `translationadopt` and `translationconfirm` have no spec (N708, N669).
- **R30.** Each op is in its owner's family, with three new kinds: `daemonact` (unpack), `settingread` (coarchivestate) and `sessionend` (the two sign-outs).
  - `acquisition` family: `unpack` (admin, member, probe, daemon; `machineClasses` daemon, probe; contribute; `by`, `viewer`), `archivelist` (read), `coarchiveset` (`hostingaccessset`'s spec) and `coarchivestate` (stamped nothing, a present null row).
  - `hypotheses`: `noterevise` and `notedelete`, with `notewrite`'s kind.
  - `retrieval` family: `findin`, stamped `viewer` and `owner` (K1972).
  - `entities`: `entitieskind`.
  - `public-read` family: `credit`.
  - `credentials`: `securitymap`, `signout` and `signouteverywhere` (stamped `session` alone), `recoverycodesissue`, `recoverycodesstate`, `recover` (a public door stamped `source` and `country`) and `subscriptiondisconnect` (the seventh route of red 23).
  - `instance-setup`: `adminrecoverystep`.
  - `agentpack` is in `OPS`, with `affordances`' spec, session sets and absent row, stamped `viewer`.
  - `claim` and `login` are also stamped `source` and `country`.
  - None is in `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS`, `AI_GRANT_OPS` or a plan run's scope.
- **R6 (J1 (1), K2041).** The T35 ops of the earlier modules are declared by R19's kinds:
  - events: `discretionrecord`, `assessmentrecord`, `usewithdraw`, `usesof`;
  - duties: `uselink`, `useunlink`, `reviewpropose`, `poweruses`;
  - calculations: `usesfreeze`, `applicationrecipes`;
  - standards: eleven ops;
  - capture-requests: `recordsrequestopen`, `recordsrequestanswer` (stamped `principal`) and `recordsrequests`.

  `securitycount` and `doorwindow` are store-internal and have no spec. Red 23 is green, and op-declarations' half of red 29 (no spec) is cleared.
- **The stamp interface** gains `owner`, `principal`, `source` and `country`. The control plane sets them (control-plane R58; J1 (2)).
- **B2 (K2038).** `credit` and `recover` each carry a present null `NEEDS` row. op-grades names both in `NON_ACTS`, and affordances R12 would otherwise read them as stale. R3's test now counts a public op as one a session reaches.

**Deferred:** none.

**Found in other modules.** The REPORT (J2) has the details.
- **op-grades (K2041).** It grades 25 of the ops R6 adds nowhere. Its `OP_ALIASES` copy still holds `expunge`. Its `NON_ACTS` holds `agentpack`, which R30 gives no `NEEDS` row (as `affordances` has none), so R12 reads it as stale.
- **affordances.** Its `src/affordances/t34.mjs` alias copy still holds `expunge` (stale). Its `unaccounted` reads its own tables until it re-points to op-grades (K2038 (3)).
- **control-plane (T35-72).**
  - `r53-routes`:60 (red 29's other half) now fails on the new stamp keys, which are outside its closed set.
  - `r53-routes`:77 fails because the door does not yet stamp `principal`, `owner`, `source` or `country`.
  - `totality`:15 reads the gaps above.
  - Implementing the keys and grading the ops clears all three.
- **credentials.** `signout` and `signouteverywhere` read `session` from the query. control-plane R59 says the store gets a stamped `session` in the body or a header, never the query. Store-door R9 may bridge this; I have not checked.
- **Generated artifacts.** The plane bundle is stale, because `src/op-declarations/index.mjs` changed (§14).

**Tests and checks.**
- op-declarations: `ℹ pass 93`, `ℹ fail 0` (reds 9 and 23 cleared).
- Users of op-declarations (the tranche, then mine):
  - admission 23/0, the same.
  - plane 107/8, the same; `migrate-released` 1/0.
  - affordances 201/2, the same.
  - op-grades 25/0, the same.
  - control-plane goes from 178/4 to 176/6. The two new reds, `r53-routes`:77 and `totality`:15, and `r53-routes`:60's new cause are the gaps named above.
- `format: 133 modules, 132 requirements files; 0 failures`.
- `architecture: 12 product files, 69 relative imports (1 naming no tracked file, not judged); 0 failures`.
- `coverage: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures`.
- `ownership: 6 files changed by op-declarations between tranche/T35 and HEAD; 0 failures`.

Size (session_01636dBMY68z64H9eWzh6W3u): test runs 24, module lines 3092

## J2 · REPORT

B2 applied: `credit` and `recover` carry present null `NEEDS` rows (op-grades R22's `NON_ACTS`). `doorwindow` is tested as having no spec. B3 read.

**For op-grades (K2041).** These are computed with affordances' `unaccounted` rule over my `OPS`/`NEEDS` and op-grades' tables on the tranche.
- **Unpublished.** Gated, but in no published act and not in `NON_ACTS` (25):
  - `applicationrecipes`, `assessmentrecord`, `bindsat`, `discretionrecord`, `editioninforce`, `forcesof`, `overridesof`, `poweruses`;
  - `recordsrequestanswer`, `recordsrequestopen`, `recordsrequests`, `reviewpropose`;
  - `standardadoption`, `standardbenchmark`, `standardforce`, `standardforcepropose`, `standardforcewithdraw`, `standardimpose`, `standardrelease`;
  - `subscriptiondisconnect`, `uselink`, `usesfreeze`, `usesof`, `useunlink`, `usewithdraw`.
- **Unranked.** Mutating, with no rung or stated absence (17):
  - `assessmentrecord`, `discretionrecord`, `recordsrequestanswer`, `recordsrequestopen`, `reviewpropose`;
  - `standardadoption`, `standardbenchmark`, `standardforce`, `standardforcepropose`, `standardforcewithdraw`, `standardimpose`, `standardrelease`;
  - `subscriptiondisconnect`, `uselink`, `usesfreeze`, `useunlink`, `usewithdraw`.
- **Stale.**
  - `expunge` is in op-grades' `OP_ALIASES` copy and its grading rows. It is no op since K1901.
  - `agentpack` is in op-grades' `NON_ACTS`, but R30 gives it no `NEEDS` row (equal to `affordances`', which has none), so R12 reads it as stale. My reading: op-grades drops it from `NON_ACTS`. The alternative is that I give it a null row, against R30's "equal" (your call).

**Other modules.**
- **affordances.** `src/affordances/t34.mjs`'s alias copy still holds `expunge`. Its `unaccounted` reads its own tables until it re-points (K2038 (3)). Today control-plane's `totality`:15 lists every op above plus the op-grades-graded T35 ops, because affordances' tables have not re-pointed yet.
- **control-plane (T35-72).**
  - `r53-routes`:60's closed set of stamp keys must gain `owner`, `principal`, `source` and `country`.
  - `r53-routes`:77 fails until the door stamps them: `principal` on the records requests, `owner` on `findin`, `source` and `country` on `claim`, `login` and `recover`.
  - Two reds are new on control-plane from my merge (`r53-routes`:77, `totality`:15), and `:60`'s cause changes. Red 29's no-spec cause is gone.
- **credentials.** `signout` and `signouteverywhere` read `session` from the query. control-plane R59 sends a stamped `session` in the body or a header. Unless store-door R9 bridges it, credentials' map needs to read it there.
- **Generated artifacts.** The plane bundle is stale (`src/op-declarations/index.mjs`).
