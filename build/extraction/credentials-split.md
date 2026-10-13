# credentials → ai-accounts — split map (N996)

**Status** · Reviewed by BOB #167 (K3101): its readings (doubts 1–7) adopted; §2 and §5 line numbers re-taken at T48's START. N996.

**Why.** `plan/next.md` N996 and K3084: credentials is 4,433 lines after CREDENTIALS #14 (T47-81), past K617's ~4,000 mark. Its split is owed before any entry adds capability to it. It is done in T48 by copy, then delete (rulings-active §5, K624).

**Read whole:** `requirements/credentials.md`, its `modules.json` entry (index 36) and every user's entry, every file in its `paths` (`src/credentials/index.mjs`, `schema.mjs`, `checks.mjs`), `extraction/case-authoring-split-2.md` and `extraction/actions-split.md` (the format), `rulings-active.md`, and K617, K624, K2934, K3040, K3084 in `rulings.md`.
**Read in part:** the users' call sites, by `git grep` over `bio-plane/src`, `bio-plane/test`, `agent-*/` (bundles and `dist/` excluded), each site read. Tests were mapped by their headers and by the services each file drives.
**Line numbers:** `tranche/T47` @ `e05e0e9799` (T47 still open; L6 running).

## 0. The answer

**Size today (own code, K2513; with comments):** `index.mjs` 3,484, `schema.mjs` 542, `checks.mjs` 407 = **4,433**. About 3,330 without comment-only and blank lines. The figure is real: no generated file, no other module's path inside `src/credentials/`.

**The cut is the AI accounts.** Everything credentials holds about *which Claude account pays for an assistant's act* goes to a new module, **`ai-accounts`**:
- each member's own account: an API key (R22–R25) or her Claude sign-in, held as a fact and, since T47, as a sealed token (R43, R70);
- the group's API key, its switches and notice (R33, R34, R36, R37);
- a project's account, its notice and its suspended sign-ins (R54, R58, R59);
- every account's switch for each kind of use, its panel reads and change history (R55, R60–R62);
- the cascade that chooses the one account used (R35, R56);
- the material limits, the group's and each project's, with the one keep-away read (R51, R52, R57; R35's `aiKeptAway`);
- the disclosure-first order (R64);
- the seal those keys are held under.

**credentials keeps** the credentials a person or the instance acts *by*:
- the claim, passwords, sessions, the lock and re-ask (R1–R5, R38–R41, R65–R67);
- recovery codes and reset links (R46, R47, R68, R69);
- signer keys (R6–R11, R19, R21);
- AI credentials, including the run segment's (R12–R15, R42, R53, R63);
- the ask grant (R27, R28, R31, R32);
- the keyed outside services (R29);
- the security tally and map (R44, R45, R49, R50);
- the seam with membership (R16–R20).

| | lines (with comments) | without comments |
|---|---|---|
| credentials after | about **2,590** (`index.mjs` ~2,035, `schema.mjs` 290, `checks.mjs` ~262); about 2,600 with T48's transitional delegates (§3, doubt 1) | about 1,900 |
| ai-accounts | about **2,085** (`index.mjs` ~1,655, `schema.mjs` ~265, `checks.mjs` ~165) | about 1,560 |

Moved by copy: 1,885 lines (`index.mjs` 1,483, `schema.mjs` 252, `checks.mjs` 150; 1,455 without comments). Each side adds a header, a class shell, a factory and the small seam services (§1, §3).

**The edge runs one way: credentials uses ai-accounts, never the reverse.** ai-accounts reads only `record-grammar`, `record-core` and `membership`. It needs three things credentials holds today:
- the founder's claim fact: read as `membership.isAdministrator("admin")` (membership R64, which asks R17's registered fact). This is the same fact `#holderActive` reads through `claimed()` today.
- the run-credential revocation and the standing grants' end when a sign-in or reference goes: a notice credentials registers for (`onAccountCleared`, §1). That is membership R79's form.
- nothing else. The seal moves with the accounts, and credentials' keyed services (R29) ask it.

**Placed before credentials.** credentials' grants (R27, R32) and the run credential (R63) call the cascade, the serving account and `aiKeptAway` directly, so no registration is needed for the keep-away gate.

**A second seam, not chosen:** ai-accounts *after* credentials (seam B, doubt 2). It would take the grants too, because R27 and R32 call the cascade. It would need four new credentials services for sessions, and a keep-away registration for R63, since credentials could no longer call `aiKeptAway`. That registration fails open when nothing is registered. Seam A (this map) moves the same 1,885 lines with fewer new seams.

## 1. The new module

| | `ai-accounts` |
|---|---|
| purpose | Holds the AI accounts the assistant's use is paid by, sealed at rest, and chooses the one an act uses: a member's own (an API key, or her Claude sign-in's token), a project's, and the group's API key; each account's switch for every kind of use; the material limits that keep the group's or a project's material away from AI; the notices and the disclosure owed before an account pays; and each account's change history. Who the members are is `membership`'s; what a person signs in with, and the grant an ask reads under, are `credentials`'. |
| layer | 2 |
| place in `modules.json` | directly after `project-roster` (35), before `credentials`, which moves to 37: `membership`, `project-roster`, **`ai-accounts`**, `credentials`, `promotion`. It must come after `membership`, whose services it reads. It must come before `credentials`, whose grants (R27, R32), run credential (R63) and keyed services (R29) call it. Nothing in `project-roster` uses either. |
| paths / tests | `bio-plane/src/ai-accounts/` / `bio-plane/test/m/ai-accounts/`. Both are empty in `modules.json` until its COMPLETE (K1043). |
| from | none (not legacy; K624) |
| uses | `record-grammar` (`isMachineIdentity`), `record-core` (`transact`, `declareTable`, `bundleInfo`), `membership` (`Membership.ROOT_ADMIN`, `SIGHT_*`, `membershipOf`, `notAnAdmin`, `noSuchProject`, `notTheOwner`, `listenerRefusal`, `memberFacts`, `isAdministrator`, `sight`, `existenceAct`, `projectAuthority`, `isProjectOwner`, `isJoinedParticipant`, `joinedParticipants`, `onRevoked`). Tests: `test-support` if its fixture wants it, else `node:sqlite` as credentials' fixture does. |
| entry point | `aiAccountsOf(ctx, { record, membership, sealSecret })` (K61). credentials' factory creates it, passing the seal secret it is given (`plane/store.mjs`:148 is unchanged), so its tables exist and are declared at every boot (case-account R12's form). `aiAccountsOps(a, url, body, env)` is its route map. |
| exports | the 36 services of §2; `USE_KINDS`, `EXPLORE_VALUES`, `USE_SWITCHES`, `ACCOUNT_KINDS`, `ACCOUNT_SWITCHES`, `KEEP_AWAY_REASON`, `SIGNIN_TOKEN_LENGTH`; `AI_ACCOUNT_CHECKS`, `AI_WORDS`; `AI_ACCOUNTS_TABLES`, `AI_ACCOUNTS_PROJECT_TABLES`, `AI_ACCOUNTS_HISTORY_TABLE`; and the seam services credentials calls, each new and in-plane (no route, no viewer): `accountActBar`, `accountServing`, `servingAccountOf`, `notYourAccount`, `noAccount`, `accountMemberNotActive`, `sealText`, `unsealText`, `onAccountCleared`. |

**The seam services, each new, each small:**
- `accountActBar({member, by})` is today's `#accountBar` (1303–1318). It answers null or R22's refusals, for R27's first step.
- `accountServing({member, use, project})` is today's `#resolve` (2209–2245) without the sealed `row`. It answers `{refusal}` or `{level, kind, project?, member?}`, for R27's cascade.
- `servingAccountOf({member})` is today's `#servingAccount` (2140–2148), for R32.
- `notYourAccount(detail)`, `noAccount(member, scope)` and `accountMemberNotActive(detail, extra)` are the one-site helpers of C-29.14, C-29.20 and C-29.15 (K231). credentials' grants and run credential answer through them.
- `sealText({owner, kind, text})` and `unsealText({owner, kind, sealed, iv})` are today's `#encrypt`/`#decrypt` (1461–1503). Both refuse through `ACCOUNT_SEAL_UNAVAILABLE` (C-29.22, one site), for R29's keys.
- `onAccountCleared(module, fn)`, refused through `membership.listenerRefusal`, is called inside the act with `{member, account: "reference" | "signin", by, why, reference_held}`:
  - when a reference is removed (`accountReferenceRemove`, 1579–1592);
  - when a sign-in is cleared (`#signinCleared`, 1682–1694: disconnection or revocation).

## 2. What moves (by copy, K624)

All from `src/credentials/`. The `where`s become `src/ai-accounts/index.mjs <fn> > <region>`, and the DEC-49 REGION markers move with their code.

| moved | from (file:lines) | lines | credentials id |
|---|---|---|---|
| `ACCOUNT_KINDS`, `ACCOUNT_SWITCHES`, `USE_KINDS`, `EXPLORE_VALUES`, `USE_SWITCHES`, `USE_DEFAULTS`, `ACT_KINDS` | `index.mjs` 52–73 | 22 | R22, R25, R55 |
| `KEEP_AWAY_REASON` | 91–92 | 2 | R51 |
| `SIGNIN_TOKEN_LENGTH` | 131–132 | 2 | R70 |
| `#retiredReferences` (and its call in `migrate`, 225) | 230–239 | 10 | R22, R35 |
| `#memberOf`, `#row`, `#accountBar`, `#notYours`, `#noAccount`, `#noSecret`, `#switchName` | 1281–1360 | 80 | R22–R24, R27's bar, R55 |
| `#USE_COLUMN` … `#switchedOff`, `accountUsesSet`, `#usesOwner` | 1362–1459 | 98 | R55, R56 |
| the seal: `#b64`, `#unb64`, `#sealKey`, `#sealRefusal`, `#seal`, `#encrypt`, `#decrypt` | 1461–1503 | 43 | R23, R29, R34 |
| `accountReferenceSet` | 1505–1537 | 33 | R22 |
| `registerDisclosureRead`, `disclosureDue` | 1539–1575 | 37 | R64 |
| `accountReferenceRemove`, `accountReferenceState` | 1577–1615 | 39 | R22, R23, R25 |
| `#change`, `#lastSeq`, `#legacyChange`, `#limitDetail`, `#carryHistory` (and its call, 226), `#signinCleared`, `#projectSigninsCleared`, `#ownerBar`, `#limitsFor`, `accountUses`, `accountUsesOf`, `#usesOwnerSpelled`, `#usesAnswer`, `accountHistory` | 1617–1816 | 200 | R43, R54, R60–R62 |
| `subscriptionConnected`, `#connected` | 1818–1853 | 36 | R43 |
| `subscriptionTokenHold`, `#validUntil`, `subscriptionTokenRefused`, `#signinKey`, `#signinNotHeld`, `subscriptionDisconnect` | 1855–1949 | 95 | R43, R70, R71 (4) |
| `#ownAct`, `#reference`, `#ownReference`, `accountReferenceFor` | 1951–1995 | 45 | R24, R35 |
| group key: `#groupKeyRow` … `groupKeyNoticeSeen`, `#noticeDue`, `#servingAccount`, `accountFor`, `#projectOf`, `#resolve` | 1997–2245 | 249 | R33–R37, R56 |
| `aiKeepAwayState`, `#usesList`, `#covers`, `#usesToStore`, `#keepAwayReason`, `aiKeepAwaySet`, `aiKeptAway`, `#projectLimit`, `#projectKeptAway` | 2247–2373 | 127 | R35, R51, R52, R57 |
| a project's account: `PROJECT_KEY_NOTICE_TEXT` … `projectAccountsSuspended` | 2375–2639 | 265 | R54, R58, R59 |
| `projectAiKeepAwaySet`, `projectAiKeepAwayState`, `projectsKeptAway` | 2641–2693 | 53 | R57 |
| ops `subscriptiondisconnect`, `accountreferenceset`, `accountreferenceremove`, `accountreference`, `groupkey*` (6), `aikeepaway`, `aikeepawaystate`, `accountusesset`, `accountuses`, `accounthistory`, `projectkeyset` … `projectaikeepawaystate` (9): 24 routes, with their comments | 3423–3424, 3429–3439, 3444–3449, 3453–3456, 3459–3478 | 43 | — |
| DDL: `account_references`, `group_key`, `group_key_acts`, `group_key_notices`, `ai_keep_away`, `subscription_connections`, `project_accounts`, `project_account_acts`, `project_key_notices`, `project_keep_away`, `account_changes` | `schema.mjs` 128–152, 186–229, 295–334, 350–433 | 193 | R30 |
| the additive columns of those tables | 452–492 | 41 | R30, R55, R57, R70 |
| their classes: the six group/owner rows of `CREDENTIALS_TABLES` (515–520) and `CREDENTIALS_EXEMPT_TABLES` (496–499), `CREDENTIALS_HISTORY_TABLE`, `CREDENTIALS_PROJECT_TABLES` | 496–520 in part, 525–542 | ~24 | R18, R30 |
| `AI_WORDS` (every key is the accounts': `ai.*`, `refusal.DISCLOSURE_DUE`) | `checks.mjs` 14–34 | 21 | R54–R58, R64 |
| `ACCOUNT_CHECKS` rows C-29.13, .14, .15, .17, .19–.22 | 156–208 | 53 | R22–R25, R35 |
| C-29.29, .27, .31, .34–.40 | 230–289 | 60 | R35, R36, R43, R54–R58, R64 |
| C-29.44, .45 | 303–312 | 10 | R70 |
| C-29.32 | 322–327 | 6 | R51, R57 |

The moved rows become one family object, **`AI_ACCOUNT_CHECKS`**. Their numbers, codes and translations are unchanged. The C-29 family then spans two files: credentials holds C-29.1–.5, .11, .23–.26, .28, .33, .41–.43, .46, .47, and ai-accounts the rest. This follows C-44's and C-136's precedent.

**Copied to both sides (K57's small-helper rule):**
- `stampSecond`, `DAY_MS`;
- `#tx`, `#rows`, `#one`;
- `#memberFacts` (773–776);
- `#holderActive` (766–770). In ai-accounts it reads the claim as `membership.isAdministrator(ROOT)`; credentials keeps its own for R46, R47 and R69.
- `#adminBar` (3250–3253), which is no row site: `notAnAdmin` is membership's.
- `#memberOf` and `#row` (1288–1297), which credentials keeps for its grants, recovery and run credential.

**In the copy:** no refusal text, code, number or translation changes. The seal's HKDF salt and info (`bio-credentials-seal/1`) and the AAD are byte-identical, so every row sealed today opens. The table names and DDL are unchanged, so a running store keeps its rows. Only the declaring module changes (§7).

## 3. What stays in credentials, and how it re-points

**Stays:**
- `claim`, `bootstrapState`, `setPassword`, `passwordChange`, `login`, `session`, `unlock`, `reauth`, `reauthDue`, `sessionLockedRefusal`, `signOut`, `signOutEverywhere`, the window and the tally's key (R1–R5, R38–R41, R65–R67, R71 (1), (2), (6), (7));
- the signer keys (R6–R11, R19, R21);
- `aiCredential*` and `aiRunCredential*` (R12–R15, R42, R53, R63);
- the grant (`#mintGrant` … `aiGrantHeld`, 2695–2806; R27, R28, R31, R32);
- the tally, map, level and totals (2808–3041; R44, R45, R49, R50);
- recovery and the reset link (3043–3230; R46, R47, R68, R69, R71 (5));
- the keyed services (3232–3343; R29);
- R16's and R17's seam (170–206);
- tables `credentials`, `sessions`, `bootstrap`, `signers`, `ai_credentials`, `keyed_services`, `ai_grants`, `signin_window`, `security_counts`, `security_pending`, `security_key`, `recovery_codes`, `recoveries`, `password_reset_links`;
- rows C-63, C-96.8, .15–.17, .19–.21, .39–.46, .53, and the C-29 rows named in §2.

**The call sites that become `this.accounts.<x>`:**

| credentials site | today | becomes |
|---|---|---|
| `aiRunCredentialMint` 1222, 1227 | `#row(ACCOUNT_CHECKS, "ACCOUNT_MEMBER_NOT_ACTIVE", …)`, `this.aiKeptAway()` | `accountMemberNotActive(…)`, `aiKeptAway()` |
| `aiGrantMint` 2722, 2724, 2729, 2733 | `#accountBar`, `aiKeptAway({use: "ask"})`, `#notYours`, `#resolve(id, "ask", project)` | `accountActBar`, `aiKeptAway`, `notYourAccount`, `accountServing({member, use: "ask", project})` |
| `aiGrantMintStanding` 2743–2750 | `#row(… "ACCOUNT_MEMBER_NOT_ACTIVE")`, `aiKeptAway({use: "standing"})`, `#servingAccount`, `#noAccount` | `accountMemberNotActive`, `aiKeptAway`, `servingAccountOf`, `noAccount` |
| `keyedServiceSet` 3287–3289; `keyedServiceFor` 3332–3341 | `#seal`, `#encrypt`, `#decrypt`, `#sealRefusal` | `sealText`, `unsealText` (owner `group:<service>`, as today) |
| `#memberRevoked` 187 | `#signinCleared(memberId, by, "revoked")` | removed: ai-accounts' own `membership.onRevoked` listener clears the sign-in in the same act (ai-accounts R27) |
| `migrate` 225–226, additive columns, `declareTables` | `#retiredReferences`, `#carryHistory`, the moved tables | `this.accounts.migrate()` first, then its own; declares only its own tables |

**Added (about 35 lines):**
- a getter `accounts` (`aiAccountsOf(ctx)`), created in `credentialsOf` with the seal secret;
- `void c.accounts` beside `c.start()`;
- in `start`, one registration with `accounts.onAccountCleared("credentials", …)`. On `account: "signin"` it revokes the member's run credentials (R63; today 1690). On `account: "reference"`, or `"signin"` with `reference_held: false`, it ends the member's standing grants (R32; today 1589, 1687).

**Transitional, T48 only (recommended, doubt 1):**
- one delegate per moved service, about 6 lines in a loop over the 36 names, each `(a) => this.accounts[name](a)`;
- re-exports of `USE_KINDS` and a frozen `ACCOUNT_CHECKS` view, `{...AI_ACCOUNT_CHECKS, ...own}`, from `index.mjs` only (never `checks.mjs`);
- `credentialsOps` keeps the moved op names, answered through the delegates.

Every user then answers byte-identically through T48, and re-points in its own next job (§5). This is K2608's pass-through form, as publication-split-2 used it. The delegates and the view are deleted by credentials' first job after the last user re-points (a `next.md` entry, T49).

## 4. Requirement ids

| credentials | ai-accounts | what |
|---|---|---|
| R22 | **R1** | `accountReferenceSet`, `accountReferenceRemove`; the `DISCLOSURE_DUE` clause through R23 |
| R23 | **R2** | sealed at rest; `accountReferenceState` |
| R24 | **R3** | `accountReferenceFor` |
| R25 | **R4** | the reference's two switches (set by R14's act) |
| R33 | **R5** | `groupKeySet`, `groupKeyRemove`, `groupKeySwitch` |
| R34 | **R6** | the group key sealed; `groupKeyState` |
| R35 | **R7** | `accountFor`; `aiKeptAway`, the one site of `AI_KEPT_AWAY` |
| R36 | **R8** | `groupKeyNotice`, `groupKeyNoticeSeen`, `GROUP_KEY_NOTICE_DUE` |
| R37 | **R9** | the group key's switches; `groupKeySwitches` |
| R54 | **R10** | a project's account |
| R56 | **R11** | the cascade, the account used |
| R58 | **R12** | a project key's notice |
| R59 | **R13** | `projectAccountsSuspended` |
| R55 | **R14** | `USE_KINDS`, `accountUsesSet` |
| R60 | **R15** | `accountUses` |
| R61 | **R16** | `accountHistory`, every change recorded |
| R62 | **R17** | `accountUsesOf` |
| R43 | **R18** | the connected sign-in as a fact; `subscriptionDisconnect` |
| R70 | **R19** | the held sign-in token |
| R51 | **R20** | `aiKeepAwaySet` |
| R52 | **R21** | `aiKeepAwayState` |
| R57 | **R22** | material limits by use, the group's and a project's |
| R64 | **R23** | the disclosure-first order, `DISCLOSURE_DUE`'s one site |
| R23's and R29's seal | **R24** | `sealText`, `unsealText`; `ACCOUNT_SEAL_UNAVAILABLE`'s one site (new as a service; the seal itself unchanged) |
| new | **R25** | the reads credentials' grant and run credential ask: `accountActBar`, `accountServing`, `servingAccountOf`, and the row helpers |
| new | **R26** | `onAccountCleared`, the notice credentials' R32 and R63 end by |
| R16 (its sign-in clause, T35; R70's and R71 (4)'s drops at revocation) | **R27** | its own revocation listener |
| R30 (the eleven tables), R18 (their exemption) | **R28**, **R29** | tables declared; purge exemption (project tables cleared with their project) |
| R48 (its rows' and details' share) | **R30** | "your group's Civicsmith" |
| R71 (3), (4) | **R31** | the claimed founder holds as an active member; a project's sign-in account holds no token |
| new | **R32** | created by credentials' factory with the seal secret; its ops spread by the plane (case-account R12's form) |

**Retired in credentials as "moved to `ai-accounts` R<n>":** R22 → R1, R23 → R2, R24 → R3, R25 → R4, R33 → R5, R34 → R6, R35 → R7, R36 → R8, R37 → R9, R54 → R10, R56 → R11, R58 → R12, R59 → R13, R55 → R14, R60 → R15, R61 → R16, R62 → R17, R43 → R18, R70 → R19, R51 → R20, R52 → R21, R57 → R22, R64 → R23 (23 ids). Ids are never reused; R26 stays retired.

**New in credentials:**
- **R72** (T48, transitional): each moved service is answered through ai-accounts' own, byte-identical (§3). It retires when its last user re-points.
- **R73**: at start credentials registers with `ai-accounts.onAccountCleared` (ai-accounts R26). A sign-in cleared revokes the member's run credentials (R63). A reference removed, or a sign-in cleared while no reference serves her, ends her standing grants (R32).

**Re-worded in credentials** (meaning unchanged; BOB's wording):
- Purpose: §0's second half, ending "which AI account serves an act is `ai-accounts`'";
- R16: sessions, keys, grants, recovery codes, reset links and run credentials end in the revoking act; the sign-in is ai-accounts R27's;
- R27: its bar, cascade and notices are ai-accounts R1's, R11's, R8's and R12's; its keep-away is ai-accounts R7's;
- R32: keep-away through ai-accounts R7; the serving account and its `standing` switch through R25 and R4, R9, R14; its end through R26 (R73);
- R29: sealed through ai-accounts R24;
- R30 and R18: its own fourteen tables;
- R48: its own rows;
- R63: keep-away through ai-accounts R7; disconnection through R73;
- R71: (3) and (4) moved;
- Uses (gains `ai-accounts`), Status, Satisfies, Suggestions (the T33-20, T40, T41 and T47 paragraphs on accounts move).

**Wording only elsewhere** ("`credentials.<x>`" → "`ai-accounts.<x>`", each module's own text, in its own job):
- `ai-runs` (R52, R79); `ai-use` (R1, R3, R9, R12); `answers` (R19, R30, R33); `question-explorer` R3; `run-productions`; `reading-pipeline`;
- `instance-setup` (R53–R55; R54's disclosure registration); `store-door`; `wizard-scripts` R24; `notice-producers` R16;
- `control-plane` R65, R77; `agent-worker` R6 (the wire shape cites credentials R35);
- `file-safety`'s Uses (R44's counts stay credentials'; no change);
- `skilldoctrine.mjs`:1640's comment, `gate.mjs` 799, 826 (comments).

### ai-accounts — requirements draft (mechanics §3)

**Public**

*Purpose.* As §1.

*Provides.* Terms as `membership` states them; every refusal names its reason; no service throws. Each text below is credentials' text as it stands at T48's START, with "this module" read as ai-accounts. It is BOB's to copy whole.
- **R1** (was credentials R22) `accountReferenceSet({member, kind, secret, by})`, `accountReferenceRemove({member, by})`: one `apikey` reference per member, by her own act only, refused `MACHINE_CANNOT_HOLD_ACCOUNT`, `NOT_YOUR_ACCOUNT`, `ACCOUNT_MEMBER_NOT_ACTIVE`, `UNKNOWN_ACCOUNT_KIND`, `NO_SECRET`, then `DISCLOSURE_DUE` (R23), each writing nothing.
- **R2** (was R23) sealed at rest under its member; `accountReferenceState({member, viewer})` to that member alone.
- **R3** (was R24) `accountReferenceFor({member, act})`.
- **R4** (was R25) the reference's `suggestions` and `standing`, set by R14.
- **R5** (was R33) `groupKeySet`, `groupKeyRemove`, `groupKeySwitch`, by an active administrator.
- **R6** (was R34) the group key sealed; `groupKeyState({viewer})`.
- **R7** (was R35) `accountFor({member, act})`; `aiKeptAway({project?, use?})`, the one site of `AI_KEPT_AWAY`, failing closed.
- **R8** (was R36) `groupKeyNotice`, `groupKeyNoticeSeen`; `GROUP_KEY_NOTICE_DUE`.
- **R9** (was R37) the group key's switches; `groupKeySwitches()`.
- **R10** (was R54) a project's account: `projectKeySet`, `projectSigninSet`, `projectAccountRemove`, `projectAccountSwitch`, `projectAccountState`.
- **R11** (was R56) the cascade: the project's account, the member's own, the group key; the account chosen is the one used.
- **R12** (was R58) `projectKeyNotice`, `projectKeyNoticeSeen`; `PROJECT_KEY_NOTICE_DUE`.
- **R13** (was R59) `projectAccountsSuspended({viewer, at})`.
- **R14** (was R55) `USE_KINDS`, `EXPLORE_VALUES`, `USE_SWITCHES`; `accountUsesSet({owner, switch, on, by})`, the one act that sets a switch.
- **R15** (was R60) `accountUses({owner, viewer})`.
- **R16** (was R61) every change recorded; `accountHistory({owner, viewer, limit})`.
- **R17** (was R62) `accountUsesOf({owner})`, in-plane.
- **R18** (was R43) `subscriptionConnected({member})` in-plane; `subscriptionDisconnect({member, by})`.
- **R19** (was R70) `subscriptionTokenHold`, `subscriptionTokenRefused`, in-plane; a held sign-in answered by R7 and R11.
- **R20** (was R51) `aiKeepAwaySet({on, uses, reason, by})`.
- **R21** (was R52) `aiKeepAwayState()`.
- **R22** (was R57) material limits by use: `projectAiKeepAwaySet`, `projectAiKeepAwayState`, `projectsKeptAway`; R7's `aiKeptAway` the one site of both codes.
- **R23** (was R64) `registerDisclosureRead(module, fn)`, `disclosureDue({member})`.
- **R24** (new; R23's and R29's seal) `sealText({owner, kind, text})` → `{sealed, iv}`; `unsealText({owner, kind, sealed, iv})` → `{text}` or the refusal. Both are in-plane only, for `credentials` R29. AES-256-GCM under an HKDF-SHA-256 key from the seal secret, the owner as salt, `owner|kind` as AAD. `ACCOUNT_SEAL_UNAVAILABLE` (C-29.22) is minted here alone.
- **R25** (new) in-plane, for `credentials` R27, R32, R63:
  - `accountActBar({member, by})` answers R1's refusals, or null;
  - `accountServing({member, use, project})` answers R11's choice without unsealing: `{refusal}` or `{level, kind, project?, member?}`, never a key;
  - `servingAccountOf({member})` answers `{level, signin?, suggestions, standing}` or null;
  - `notYourAccount(detail)`, `noAccount(member, scope)` and `accountMemberNotActive(detail, extra)` each answer their row (C-29.14, .20, .15), so each code keeps one site (K231).
- **R26** (new) `onAccountCleared(module, fn)`, one registration per module, refused through `membership.listenerRefusal`. Each `fn` is called inside the act with `{member, account, by, why, reference_held}` when a reference is removed (R1) or a sign-in is cleared (R18, R27). A listener that throws changes nothing of the act.

**Private**

*Uses.*
- `membership`: `memberFacts` (R68), `isAdministrator` (R64, which also gives the founder's claim), `notAnAdmin` (R84), `onRevoked` (R79), `listenerRefusal` (R81), `sight` (R44), `existenceAct`, `projectAuthority` (R55), `isProjectOwner`, `isJoinedParticipant` (R54), `joinedParticipants` (R127), `notTheOwner` (R122), `noSuchProject`.
- `record-core`: `transact`, `declareTable` (R21), `bundleInfo` (R34).
- `record-grammar`: `isMachineIdentity`.

*Invariants.*
- **R27** (R16's share) At start, one listener on `membership.onRevoked`. A revoked member's sign-in, its token and her projects' sign-in accounts are cleared in the revoking act, each a change (R16), each told through R26.
- **R28** (R30's share) Its eleven tables are declared through `record-core.declareTable`, each `export: "never"` (`ai_keep_away` and `project_keep_away` `admin-only`), with today's sights. The project tables are `purge: "clear"` keyed by `project_id`; the history is `whole: "project_id IS NOT NULL"`.
- **R29** (R18's share) Its group and member tables are exempt from purge.
- **R30** (R48's share) Every member-facing string calls the group's installation "your group's Civicsmith".
- **R31** (R71 (3), (4)) The claimed founder holds as an active member wherever R1's refusals ask it. A project's sign-in account holds no token of its own.
- **R32** credentials' factory creates it with the seal secret, so its tables exist and are declared at every boot. Its ops are spread by the plane.
- **R33** (R29's and R12's form) Its rows keep their numbers, codes and words; their `where`s name this module.

*Satisfies.* credentials' Satisfies for R22–R25, R33–R37, R43, R51, R52, R54–R62, R64, R70 (K1449–K1503, K1755–K1761, K1798, K1819, K1957, DEC-156, DEC-172, DEC-188, D34, D37, D38, K2350–K2404, K2425, K2442, K2480, K3060, K3061, K3068, K3076).

*Suggestions.* The seal key may be cached per owner. `#carryHistory` stays a one-off at `migrate`, as now.

## 5. Users and what they re-point

With R72's delegates (recommended), **no user is red in T48**: each re-points in its own next job, and the list below is that job's entry. Without them, each row is owed in T48 in its own layer (§7).

| user (file:line) | uses today | re-points to | `uses` after | by |
|---|---|---|---|---|
| `membership` `MODULE_ORDER` (`src/membership/index.mjs`, R83), `module-order.test.mjs` | the ids | gains `ai-accounts` before `credentials` (K657) | — | membership's T48 job (L2) |
| `reading-pipeline` `src/reading-pipeline/index.mjs`:727–731 (its `credentials` dep) | `accountFor` | `ai-accounts`; its dep `accounts` | drops credentials, gains ai-accounts | its job (L4) |
| `ai-use` `src/ai-use/index.mjs`:23 (`USE_KINDS`), :482, :508, :539, :718, :724–725 | `accountUses`, `accountUsesOf`, `aiKeptAway`, `projectsKeptAway` | `aiAccountsOf` | drops credentials | L6 |
| `ai-runs` `src/ai-runs/index.mjs`:2089, :2091, :3154, :3160, :3172 | `groupKeySwitches`, `accountUses`, `accountReferenceState`, `groupKeyState`, `accountFor` | ai-accounts; keeps credentials for `aiRunCredentialMint`, `aiRunCredentialsEnd`, `aiCredentialLook` | both | L6 |
| `run-productions` :1066, :1069 | `aiKeepAwayState`, `projectsKeptAway` | ai-accounts | drops credentials | L6 |
| `question-explorer` :355–356, :682 | `accountUses`, `aiKeptAway` | ai-accounts | drops credentials | L6 |
| `answers` `src/answers/index.mjs`:33, :174, :265, :272; `standing.mjs`:311, :358 | `ACCOUNT_CHECKS.NOT_YOUR_ACCOUNT`, `projectsKeptAway`, `accountFor`, `aiKeptAway` | ai-accounts (its `dep("accounts")`); keeps credentials for `AI_GRANT_TTL_SECONDS`, `aiGrantMintStanding` | both | L6 |
| `instance-setup` `src/setup.mjs`:1916, :1931 (and T47-75's `registerDisclosureRead`) | `aiKeepAwayState`, `aiKeptAway` | ai-accounts; keeps credentials for `recoveryCodesState` (:2204) | both | L11 |
| `notice-producers` :1039 | `projectAccountsSuspended` | ai-accounts; keeps credentials for `securityMap`, `securityLevel` | both | L11 |
| `wizard-scripts` `src/wizard-scripts/index.mjs`:389 | `aiKeptAway` | ai-accounts | drops credentials | L11 |
| `store-door` `src/store-door/dispatch.mjs`:302, :318, :415 (`aikeptaway`), :416 (`subscriptionconnected`) | `aiKeptAway`, `accountFor`, `subscriptionConnected` | ai-accounts; keeps credentials for `aiGrantAdmit`, `signerRegisterOwn`, `signerRevokeOwn` | both | L11 |
| `plane` `src/plane/ask.mjs`:188, :192, :195, :310; `transcribe.mjs`:146; `store.mjs`:252, :451 (deps), the ops spread | `accountReferenceState`, `groupKeySwitches`, `aiKeptAway`; `credentialsOps` | ai-accounts; spreads `aiAccountsOps` directly before `credentialsOps` (same answers while R72 holds) | both | L11 |
| `control-plane` `src/control-plane/signin.mjs` (through store routes `aikeptaway`, `subscriptionconnected`); T47-65's `disclosureDue` relay | op and route names | none in code (names unchanged); T47-65's relay → ai-accounts | — | L11 |
| `op-declarations` `src/op-declarations/index.mjs`:307–349, the `credentials` family | op specs, `owner: "credentials"` | names unchanged; the moved ops form an `ai-accounts` family (doubt 4) | — | L11 |
| `answer-envelope` `src/answer-envelope/families.mjs`:23, :162; `families.test.mjs`:113 | credentials' `checks.mjs` | adds `src/ai-accounts/checks.mjs` directly before credentials'; the order test pins it | — | L11 |
| `affordances` (act-help by op name) | op names | none in code; tests below | — | L11 |
| `admission` | `groupkeyset`'s body rule, by op name | none | — | — |
| `agent-worker` `test/ask.test.mjs`:11 | `AI_GRANT_OPS` | none (stays credentials') | — | — |
| `extraction` (comment :1593; tests stub `credentials: {accountFor}` for reading-pipeline) | — | its tests follow reading-pipeline's dep name | — | its job (test only) |

**Tests of other modules that drive moved services** (each module's own job, test only):
- `ai-runs` (`reexam`, `scheduler`, `t46`, `usage`, `world.mjs`);
- `ai-use` (`explore`, `fixture`, `limits`, `reads`, `t42`; `t43`, `t44` import `USE_KINDS`);
- `answers` (`accounts`, `standing`, `words`);
- `control-plane` (`t34-routes`, `r53-routes` `ACCOUNT_CHECKS`);
- `instance-setup` (`assistant`, `t41`, `translations`, `recovery`, `fixture` `ACCOUNT_CHECKS`);
- `notice-producers` (`accounts`);
- `plane` (`ask`, `t33`, `t41`, `t42`, `t43`, `t45`, `t46`, `maps.mjs`);
- `question-explorer` (`choosing`, `fixture`, `runs`);
- `reading-pipeline` (`transcribe`); `run-productions` (`reading`);
- `store-door` (`dispatch`, `routes` `ACCOUNT_CHECKS`); `wizard-scripts` (`writing-help`);
- `affordances` (`t36-backing`, `t41-backing`).

Users of credentials only for what stays (unchanged): `provenance`, `attestation`, `provenance-routes`, `capture-sources`, `acquisition` (R29), `capture`, `doorbell` (R44), `file-safety` (R29, R49), `bias`, `intent`, `publication`, `docket`, `network-notices`, `ratification`, `case-authoring`, `monitoring`, `tasks`, `queue-producers`, `queue`, `setup-page`, `admission`.

**T47 is still running.** These jobs add calls on moved services:
- `ai-runs` T47-20 (R79's held sign-in, through `accountFor`);
- `answers` T47-84 and `question-explorer` T47-85 (R70);
- `control-plane` T47-65 (`disclosureDue`, the door's `subscriptionTokenHold`);
- `plane` T47-66 (the disclosure registration);
- `instance-setup` T47-75;
- `admission` T47-77.

T48's START re-takes §2's and §5's line numbers on `tranche/T47`'s close, as actions-split's risk 3 did.

## 6. Tests and the copy

**Copy instructions (AI-ACCOUNTS, the new job):**
1. Create `src/ai-accounts/index.mjs`:
   - a header: Purpose and R1–R33;
   - imports of `record-grammar`, `record-core`, `membership`;
   - the constants of §2;
   - `class AiAccounts`, with ctor `{sql, core, membership, sealSecret}`, `#rows`, `#one`, `#tx` and `start()` (R27's `onRevoked` listener only);
   - `migrate()`: additive columns, DDL, `#retiredReferences` (doubt 5), `#carryHistory`, `declareTables()` (throwing on a refusal, as credentials' does);
   - every function of §2, copied whole;
   - the R25 and R26 services (about 40 lines);
   - `aiAccountsOf`, `aiAccountsOps` (the 24 moved routes, copied).
2. Create `schema.mjs`: `AI_ACCOUNTS_SCHEMA` (the eleven tables), `AI_ACCOUNTS_ADDITIVE_COLUMNS`, `AI_ACCOUNTS_TABLES`, `AI_ACCOUNTS_PROJECT_TABLES`, `AI_ACCOUNTS_HISTORY_TABLE`, each declared under module `ai-accounts`.
3. Create `checks.mjs`: `AI_WORDS`, `AI_ACCOUNT_CHECKS` (§2's rows, `at()` naming `src/ai-accounts/index.mjs`).
4. Add `modules.json` row 36, `ai-accounts`, layer 2, `uses: ["record-grammar", "record-core", "membership"]`, empty `paths`/`tests` until COMPLETE (K1043). Add `requirements/ai-accounts.md` (§4, BOB's text) and a `layers.md` row.

**To `test/m/ai-accounts/`:**
- a new `fixture.mjs`: real membership, stub record-core, node:sqlite, `membership.registerClaimed` given a test fact. It may not build credentials, which is later.
- From credentials' tests:
  - `account.test.mjs` (R22–R25, whole);
  - `group-key.test.mjs` (R33–R37), except its `aiGrantMintStanding` arms;
  - `t38.test.mjs` (R22, R35, R43), except the grant arms;
  - `t40.test.mjs` (R54–R59), except its one `aiGrantMint` arm;
  - `t41.test.mjs` (R55, R56, R57, R58, R60, R61), except the `aiGrantMintStanding` arms;
  - `t42.test.mjs` (R62, whole);
  - the account arms of `t35-misc` (R35, R37, R43, R48's account details), `t36` (R51, R52, R35's keep-away), `t37` (R35's `aiKeptAway`, R51's row), `t47` (R64), `t47-signin` (R70, R71 (3), (4));
  - `seam.test.mjs`'s project-table and history-table arms.
- New arms for R24 (a sentinel sealed and opened; the wrong owner does not open), R25 (each read against its source's answer), R26 (a listener called once per clearing, a throwing one harmless), R27 and R28.
- Every arm keeps its old id under the new number, with an explicit test for each new id (K874).

**Stay in `test/m/credentials/`, re-tagged:**
- `signin`, `keys`, `own-keys`, `status-at`, `converts`, `ai`, `keyed` (R29 through R24), `t35-signin`, `t35-tally`, `rows-ops`;
- `grant.test.mjs` (R27, R28, R31, R32): it drives ai-accounts' acts for its setup, which credentials may, ai-accounts being earlier;
- the remaining arms of `seam`, `t35-misc`, `t36`, `t37`, `t47`, `t47-signin`;
- new arms for R72 (each delegate byte-identical to ai-accounts' answer) and R73 (a disconnection revokes the run credential; a reference removed ends a standing grant).

`fixture.mjs` builds `ai-accounts` beside credentials (through `credentialsOf`).

## 7. Red windows and risks

1. **Table declarations between the two merges** (`TABLE_DECLARED`; credentials' `declareTables` throws on a refusal, 272–273, as ai-accounts' copy will). Both declare the eleven tables until CREDENTIALS' job drops its own.
   - *Reading:* nothing composes both until that job, which creates ai-accounts in its factory and stops declaring the eleven in the same commit (K624). ai-accounts' own tests build it alone.
   - This is case-inputs' risk 1. No other module's fixture may build ai-accounts in between.
2. **The moved rows in two files, inside L2.** From AI-ACCOUNTS' merge to CREDENTIALS' merge, C-29.13 … .45's codes are held by both `checks.mjs` files. A check that reads every module's rows sees each moved code twice (the row census; file-safety's K2103 sweep reads all but checks only its own codes). This is accepted by name, and the window closes inside L2.
   - After CREDENTIALS' merge, the moved rows' `where`s differ from the census until promotion's L2 stamp. promotion merges last in L2 (K1965). This joins C-29.42–.47's and C-96.53's census red, already owed to T48's stamp (K3084).
3. **answer-envelope's family list (L2 to L11).** From CREDENTIALS' merge until answer-envelope's L11 job adds `src/ai-accounts/checks.mjs`, a refusal relayed with only its code is not decorated by `dec49Row` for the moved codes. Every moved service answers its row itself, so members see the same words. `families.test.mjs` R2 may read red; accepted by name until L11 (K2438's form).
4. **Users (L4 to L11).**
   - *With R72's delegates:* none is red. ai-accounts' merge changes nothing outside credentials.
   - *Without them*, red from CREDENTIALS' merge until each user's job merges: `reading-pipeline` (L4); `ai-use`, `ai-runs`, `run-productions`, `question-explorer`, `answers` (L6); `instance-setup`, `notice-producers`, `wizard-scripts`, `store-door`, `plane`, `control-plane`, `affordances` tests (L11).
5. **Ops change their owning map, not their names.** `accountreferenceset` … `projectaikeepawaystate` keep their op specs, grades, affordances and stamps. With R72, `credentialsOps` keeps answering them until its later job; the plane spreads `aiAccountsOps` before `credentialsOps`, so the later spread answers the same.
6. **Generated artifacts** (`build/manifest.md`):
   - `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) list `src/credentials/*.mjs` as inputs. They are stale from AI-ACCOUNTS' merge until L2's close regenerates them, gaining `src/ai-accounts/*.mjs`.
   - No other bundle takes credentials' files (checked over every `*.bundle.json`).
   - `newgroup/src/release.mjs`, written by `embed-release.mjs` at a release, embeds the plane's source and changes only at the next release.
7. **The seal secret's one holder.** The composition root still hands it to `credentialsOf` (`plane/store.mjs`:148), which passes it to `aiAccountsOf`. A caller that builds `aiAccountsOf(ctx)` before credentials on a cold object would hold no secret and answer `ACCOUNT_SEAL_UNAVAILABLE`. This is the same exposure as today's callers of `credentialsOf(ctx)`; the plane builds credentials at boot first.

## 8. T48 job sequence

1. **AI-ACCOUNTS (new, L2, first):** copy (§2, §6), its tests, `modules.json` row 36, `requirements/ai-accounts.md`. Merges early (K624).
2. **MEMBERSHIP (L2):** `MODULE_ORDER` gains `ai-accounts` before `credentials` (K657). This can run at T48's opening.
3. **CREDENTIALS (L2, after 1 merges):**
   - deletes the copies;
   - creates ai-accounts in its factory and runs its `migrate` first;
   - registers R73;
   - re-points §3's sites;
   - adds R72's delegates;
   - retires the 23 ids (§4) and re-words.
   - Its `uses` gains `ai-accounts`.
4. **PROMOTION (L2, last):** stamps the moved rows' `where`s, with T47's census red.
5. **Users (§5):** in their own layers, if delegates are not chosen; otherwise in their next jobs. answer-envelope (L11) adds the checks file; op-declarations (L11) the family. The plane bundle is regenerated at each layer close.

## 9. Doubts for BOB

1. **Delegates or reds.** About fourteen user modules across L4–L11 call moved services in code, and about a dozen more in tests.
   - *Reading:* R72's delegates in T48. The alternative is about fourteen modules red from L2 to their layers, each accepted by name, with every user's job in T48 owing a re-point.
   - The delegates are thin (a loop of 36 names), are not copies of code (K624), and go in credentials' next job once the last user re-points.
2. **The seam.** A (this map: ai-accounts before credentials) against B (after, taking the grants too).
   - B needs a keep-away registration for R63 that answers nothing when none is registered (R64's form), new session reads for the grants, and the grant tables moved.
   - *Reading:* A.
3. **R29's keyed services.** They stay in credentials and seal through ai-accounts' R24.
   - *Alternative:* move R29 with the seal (about 145 lines more to ai-accounts). That would re-point `acquisition` (CourtListener), `file-safety` (security tools' keys) and `setup-page`, and put non-AI keys in a module named for AI accounts.
   - *Reading:* keep R29 in credentials.
4. **op-declarations' family owner.** The moved ops sit in a family with `owner: "credentials"`.
   - *Reading:* op-declarations' L11 job splits them into an `ai-accounts` family. Their specs are unchanged, and only the label names the module that answers them.
5. **`#retiredReferences`' grant half.** At `migrate` it deletes standing grants of members holding a retired `subscription` reference (T38). ai-accounts cannot write credentials' `ai_grants`.
   - *Reading:* drop that `DELETE` in the copy. A standing grant lives `AI_GRANT_TTL_SECONDS` (900 s), so none from T38 survives, and the reference half stays.
   - This is technical, BOB's.
6. **The `ACCOUNT_CHECKS` name.** credentials keeps `ACCOUNT_CHECKS` for its C-29 grant, session and reset rows; ai-accounts' family is `AI_ACCOUNT_CHECKS`. The merged view in `index.mjs` (R72) keeps `answers`' and four tests' imports green until they re-point.
7. **Name.** `ai-accounts` (the accounts an assistant's act is paid by). *Alternatives:* `assistant-accounts`, `claude-accounts`; the latter names a provider, against Purpose's "Claude is today's only provider".
8. **Bob's or BOB's.** A size split is BOB's (K617: "low level technical decision"), as K2982's were. No requirement changes meaning: every moved id keeps its text, and each new one is a seam service or the transitional R72. Nothing here is Bob's.
