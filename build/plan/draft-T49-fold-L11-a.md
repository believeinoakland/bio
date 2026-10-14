# T49's fold, L11 (a): op-capabilities, op-declarations, op-grades, admission, control-plane, plane, and rule 7's wording edits (draft)

**Status** · A worker's draft for BOB #177 (2026-10-14), on `tranche/T49` @ 8d14f63fcf. Not folded: BOB reviews it and writes the lines into the requirement files at the fold (P5). Sources: `current.md` (rules 1, 5, 6, 7; T49-13, T49-16, T49-17, T49-18, T49-29, T49-30; "Settled by BOB #177"); `build/extraction/op-declarations-split.md` whole, checked against `bio-plane/src/op-declarations/index.mjs` (§0 below); `draft-T49-N1072-founder-handle.md` (control-plane, op-declarations); `draft-T49-fold-dec235-240.md` §7 (its R73 reduced to `projectownervotes`, its control-plane R98 reduced likewise); `draft-T49-walk.md` D1, D24; each target module's requirements read whole; the code at `control-plane/index.mjs`:723–752 and :2463–2484, `admission/index.mjs`:863–985, `ai-accounts/index.mjs`:182–207 and :1700–1712, `connections/index.mjs`:1549–1553.

**Ids** (README 5, 6; every id in each file listed, retired ids included):

| module | highest id in the file | ids taken here |
|---|---|---|
| op-capabilities | none (new file) | R1–R3 |
| op-declarations | R70 (R44 is a gap never used, below the highest; not reusable as "next free") | R71, R72; R3 re-worded |
| op-grades | R42 | R43 |
| admission | R26 | R27 |
| control-plane | R95 (K3254's `testInstance`; so N1072's draft "R95" moves to R97, as the plan says) | R96, R97, R98 |
| plane | R55 | none (§6) |
| basis-versions, plane, answers, file-scanner | — | none (rule 7, wording only, §7) |

---

## 0. The extraction map, reviewed against the code

Confirmed by a script over `index.mjs` and a load of the module: the moved ranges (2,413–3,301 and 3,307–3,330, 913 lines); 323 hand rows, 313 before `...FAMILY_NEEDS` and 10 after; `contribute` 185, `null` 130, `publish` 7 (`ratify`, `caseratify`, `publishat`, `publish`, `reviewgrant`, `reviewrevoke`, `strengthbar`), `create_projects` 1 (`projectfork`); no duplicate key; no hand row is an alias, and six alias targets are hand rows; `FAMILY_NEEDS` has 498 keys and shares none with the hand rows; `NEEDS` has 848 keys (323 + 498 + 27 aliases); every hand row equals `NEEDS`' value. The block references no identifier but `aliasRows` and `FAMILY_NEEDS`, both of which stay. The plan's sizes hold. `op-declarations` → `op-capabilities` is already in `modules.json`.

**What is wrong in the map:**

1. **Its op-capabilities R1 says the table "holds no row of a family op". That is false.** `credit`, `recover` and `passwordreset` are family ops (kinds `public` and `door`, `needs: undefined`, so their kind gives no row) and are hand rows. What is true is that no hand row is a row a family's kind gives. Corrected in §1.
2. **Its Purpose says the rows are "for every op a member's session reaches that the families … do not declare".** Also false: the rows include ops no session reaches. Among them are the unattended wakes (`scanbatch`, `renderbatch`, `deeperbatch`, `securityforward`, `moneydetectorsrun`), `exportpage` (classes `admin`) and the public `credit`, `recover` and `passwordreset`. Corrected in §1.
3. **Its Satisfies cites "CAPABILITIES.md §4".** That file is `docs/archive/research/CAPABILITIES.md`, an archived research note, not canon (README 8). Dropped. Membership Architecture v2 §5 is the canon.
4. **Its Terms list three capabilities.** That reads as membership's whole vocabulary, which also holds `administer` (op-declarations' Terms: "a capability is membership's"). Re-worded: the rows use three of them.
5. **Its op-declarations R3 draft adds a census sentence.** The sentence is "every mutating op a session reaches has a row; no row names an op no session reaches". The second half is not what `tables.test.mjs`:62 asserts: it admits public ops, reads a session's classes admit, and unattended ops with a `null` row. The sentence is also new meaning, and the plan says R3's meaning is unchanged. Dropped in §2. R3's census stays as tested.
6. **It omits a red that T49-17 opens (not caused by the split).** `tables.test.mjs`:75 pins the founder-only session set to exactly `["governorconfig"]`, and R71 adds `founderhandleset`. It goes in T49-17's START (§2).
7. **Minor.** The map's §2 says the block sits "inside `build()`". That is right (line 27), but the body is not indented, so a reader of the line numbers should not expect nesting. Its §1 header comment also names R3's test at `tables.test.mjs`. That stays true.

---

## 1. op-capabilities (T49-16): `build/requirements/op-capabilities.md`, whole

```markdown
# op-capabilities — requirements

**Status** · Draft, T49 (K3298, K3327; `build/extraction/op-declarations-split.md`, reviewed in `build/plan/draft-T49-fold-L11-a.md` §0): split from `op-declarations` for size (P6) by copy. R1 states the hand-written half of `op-declarations` R3's `NEEDS`; R2 and R3 are the forms of its R5 and R69 for this table. No requirement changes meaning. Every requirement is not yet met (T49).

**Size (P6).** About 913 lines copy from `op-declarations/index.mjs` (2,413–3,301 and 3,307–3,330), most of them the rows' standing comments; about 945 with the header, the cache and the wrapper. Well under 4,000.

## Public

### Purpose

The hand-written half of the op layer's capability table: for each op whose row its family's kind does not give, the one capability a session needs for it, or a stated `null` with its reason. It holds data only. It decides no caller's right and judges no request: `op-declarations` composes it into `NEEDS` (its R3), and `admission` reads that.

### Provides

Terms. A **capability** is membership's (its vocabulary); the rows use three of them, `contribute`, `publish` and `create_projects`. A **row** is an op's name and either one capability or `null`: no capability, stated, with its reason in the comment beside it. A **family row** is one `op-declarations` gives from an op's kind (its R19); it is not held here.

**needsRows() → frozen `{op: capability | null}`**
- **R1** Answers the 323 hand-written rows exactly as `op-declarations` held them at T49's opening, each with the comment that gives its reason: `contribute` for 185 ops, `publish` for 7 (`ratify`, `caseratify`, `publishat`, `publish`, `reviewgrant`, `reviewrevoke`, `strengthbar`), `create_projects` for `projectfork`, and a present `null` for the other 130. A `null` states that the op needs no capability. That covers a read, a public op, an act bounded by who the session is, and an unattended wake. It is not the same as no row: an op with no row needs none, and the answer has no key for it. No key is an alias (`op-declarations` R21 makes those over the composed table), and no key has a row its family's kind gives (`op-declarations` R19). *(not yet met: T49)*
- **R2** The answer is frozen data. The module imports nothing, and neither importing it nor calling `needsRows()` reads or touches a store, the network, a clock, randomness or the environment. No place is named in a row or a comment. Every load of the module answers the same table. *(not yet met: T49)*
- **R3** The table is built on the first call to `needsRows()`, never when the module is evaluated: evaluating it freezes no table of a hundred entries or more, the first call builds and freezes the table once, and every later call answers the same object and builds nothing. *(not yet met: T49)*
- Errors: it takes no argument and never throws.

## Private

### Uses

- None. This module imports nothing: every value in the copied range is a string literal or `null`, and every other name in it is in a comment. Its `modules.json` `uses` is empty.

### Invariants

- Each row's value is one of `contribute`, `publish`, `create_projects` or `null` (R1).
- No op has two rows, and no key is an alias or has a family row (R1).

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §5 (capabilities enforced at the op layer; a capability gates a session and nothing else).
- Bob's rulings K3 and K23; `layers.md` ruling 2 (declarations stay with the door); K617, K624; K3298 (this split).

### Suggestions

- **Paths.** `bio-plane/src/op-capabilities/index.mjs`, exporting `needsRows`; tests in `bio-plane/test/m/op-capabilities/`.
- **Copy, then compose.** The rows and their comments are copied unchanged from `op-declarations/index.mjs` 2,413–3,301 and 3,307–3,330. The only new code is the wrapper (`let rows; export function needsRows() { return rows ??= build(); }`, with `build()` returning `Object.freeze({ … })`). `op-declarations` deletes its copy and composes at T49-17.
- **The census is the caller's.** That every mutating op a session reaches has a row in `NEEDS` is `op-declarations` R3's test over the composed table, because this module cannot read `OPS` or `SESSION_OPS`.
- **Tests.** R1 against a golden copy of the 323 rows taken at T49's opening, with the count by value, and a control that an absent op answers `undefined`, not `null`. R2 as `op-declarations` R5 and R7 are tested, with no `import` in the source text. R3 in a child process, by `op-declarations`' R69 method (`t48.test.mjs`:440).

## Open for Bob

None: the split is BOB's (K3298).
```

---

## 2. op-declarations (T49-17)

**Status line gains:** "Last changed T49 (T49-17: R3 re-worded, `NEEDS` composed from `op-capabilities.needsRows()` with its meaning unchanged, K3298; R71 new, `founderhandleset` specified, N1072, K3265; R72 new, `projectownervotes` a member-session read, N1091, DEC-237 (3)); marked not yet met (T49)."

**R3, re-worded (replaces the line; meaning unchanged).** The mark is a job's line, since T49-17 changes where the rows are held and the composition is testable. It is not one of rule 7's wording-only edits.

- **R3** `SESSION_OPS` is `{member, admin}`, two sets of op names: the ops a member's own session reaches and the ops the founder's session reaches. `NEEDS` maps an op to the one capability a session needs for it, or `null`; an op with no entry needs none. (T49; K3298) `NEEDS` is composed here, frozen and exported as before, from two parts that share no op: the hand-written rows, which are `op-capabilities.needsRows()` (its R1), and each family op's row from its kind (R19). The aliases (R21) are applied over the whole. `UNATTENDED_BY_DECISION` maps an op no session reaches to the citation of the recorded decision that it is addressed to a credential, not a person, and holds no op without one. *(not yet met: T49)*
  - Test: before the delete, the composed table deep-equals the pre-split `NEEDS` (848 keys). Control: a family row added for an op `needsRows()` holds makes the composition fail rather than silently win.

**New lines.** Place them under a new heading after R70: "**The specs of T49's ops** (T49; R2–R4's and R49's rules; each op tested by name with a negative control, K874; R6 holds over each)".

- **R71** (T49; N1072; K3265; `membership` R144) `OPS` holds a spec for `founderhandleset`, in `membership`'s family, in `SESSION_OPS.admin` only (the founder's session): classes `admin`, `machineClasses: []`, mutating, `by` stamped, `handle` a body field, `NEEDS` `null`. It is in neither `GOVERNANCE_ACTIONS` nor `IDENTITY_ACTIONS`, and not on `credentials`' `AI_GRANT_OPS`. `claim`'s spec is unchanged (still public); its new body field `handle` reaches `credentials` through the door (`control-plane` R97), because this module lists no body fields for `claim`. The registry's owed act `owed:founderhandleset K3265` is then declared under its own name (R21). R34 holds: `founderhandleset` is explained by `affordances`' `ACT_HELP` under its own name (its R61 holds the text), or else it is named in `ACT_HELP_ABSENT` until it is. *(not yet met: T49)*
  - Test: the spec as stated. Controls: `founderhandleset` is not in `SESSION_OPS.member`, and an `ai` credential is refused it.
- **R72** (T49; N1091; DEC-237 (3); `project-roster` R30; the fold's R73, reduced to the op T49 places) `OPS` holds a spec for `projectownervotes`, in `project-roster`'s family, in `SESSION_OPS.member` and `SESSION_OPS.admin`. It is a read for a member's session only: classes `admin`, `member`; `machineClasses: []`; not mutating; `viewer` stamped; `NEEDS` `null`; the project a query field, as `projectquestions`' `project` (R55). It is in neither `GOVERNANCE_ACTIONS` nor `IDENTITY_ACTIONS`, and not on `credentials`' `AI_GRANT_OPS`. R34 holds: it is named in `ACT_HELP_ABSENT` as a read a screen draws from, until `affordances`' `ACT_HELP` holds its text. *(not yet met: T49)*
  - Test: the spec as stated. Controls: an `ai` credential and a binding token are refused it; a `viewer` the caller sends is not the one stamped.

**Uses gains:** "(T49; R3, R71, R72) `op-capabilities`: `needsRows()` (its R1), composed into `NEEDS` (R3), a `modules.json` edge made at T49's opening. `membership` (`founderhandleset`, its R144) and `project-roster` (`projectownervotes`, its R30), already uses."

**START must say, beyond the entry:**
1. Measure first. Count the module's own code (4,026 at the opening; about 3,120 after the delete; about 3,160 with R71 and R72; M-T49-1). Assert that `{...needsRows(), ...FAMILY_NEEDS}` with `aliasRows` applied deep-equals today's `NEEDS` (848 keys) before deleting anything. Confirm that `founderhandleset`'s family kind gives a present `null` row (`own`), since R3's census needs a row for every mutating session op.
2. Inherited reds: K3321 (B)'s 10 reds, cleared here against the moved registry (rule 5 (7)); rule 5 (3)'s R19 census and `t45.test.mjs` for the two new ops, cleared here; coverage on R3, R71 and R72 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). R71 itself turns `tables.test.mjs`:75 red (the founder-only set pinned to `["governorconfig"]`), and the job re-pins it to `["founderhandleset", "governorconfig"]`. Rule 6's items and the `admin` grep run at START. The four registries' hand-lists wait on N1074.

---

## 3. op-grades (T49-13)

**Status line gains:** "Last changed T49 (T49-13: R43 new, `founderhandleset` and `projectownervotes` graded, N1072, N1091; R42's two reds cleared against the moved design files, K3321 (B)); marked not yet met (T49)."

**New line.** Place it after R42, under the heading "**T49's grades** (T49; R32's pattern; each op tested by name with a negative control, K874; `affordances` R12's totality holding over them)".

- **R43** (T49; N1072, N1091; R3, R5; `op-declarations` R71, R72; `membership` R144, R129; `project-roster` R30)
  - `founderhandleset` (`membership` R144): `RUNG_ABSENT`, ground `caller-owned`, as `handlechange` (R29, R34) and `setpassword` (R27). It is the founder's own handle and asks no reason. No published act takes it back: a second set is refused `HANDLE_FIXED`, and so is every `handlechange` (`membership` R129). So by R3 it is neither `reversible` nor `reasoned`. `NON_ACTS` gives it "member-directed: the founder's own handle, the one she signs in and is known by, chosen once and never changed (`HANDLE_FIXED`); writes no record and moves no bundle".
  - `projectownervotes` (`project-roster` R30): a read, `NON_ACTS` "read: the owner changes of a project still waiting on agreement, who has agreed and who is awaited, answered only to a viewer who sees the project whole".
  - Neither is in `MACHINE_REFUSALS` (`membership` refuses any `by` but the founder's, `FOUNDER_HANDLE_NOT_FOUNDER`). By R18 `founderhandleset` carries `phone: true`. No vocabulary or prompt is added. `IRREVERSIBLE_WEIGHT` and `CONSEQUENCE_STATEMENTS` gain none. R3's tally of `undetermined` ops is unchanged. *(not yet met: T49)*
  - Controls: `RUNG_ABSENT.founderhandleset.ground` is `caller-owned`, and `founderhandleset` is not in `RUNGS`. `projectownervotes` has no rung.

  **This departs from the plan's T49-13 text, which grades `founderhandleset` `reversible` "(a later handle change is R141's)".** R141 is `admin`'s reservation, not a change of handle. No act changes a held handle (`membership` R144's `HANDLE_FIXED`, R129). R3's rule therefore excludes `reversible`. A doubt for BOB, below.

**START must say, beyond the entry:**
1. Measure first: R3's `undetermined` tally and the `RUNG_ABSENT` `caller-owned` set at START, so R43's controls state the counts. Also check whether the registry still names the act `owed:founderhandleset` (it then reaches R42's `MARKS` only once spelled; the kit's `owed_founderhandleset` weight is 2, Reasoned, which is also `MARKS`' default).
2. Inherited reds: R42's 2 (K3321 (B)), cleared here; rule 5 (3)'s op-grades census for the two new ops, cleared here; coverage on R43 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6's items and the `admin` grep run at START.

---

## 4. admission (T49-18)

**Status line gains:** "Last changed T49 (T49-18: R27 new, amending R21 and R22, a signed-in session's public reads counted in its own window, D24, K1881); marked not yet met (T49)."

**New line.** Place it under a new heading "#### T49 (T49-18)" after R26.

- **R27** (T49; D24 **M**; K1881, a protective limit, BOB's; amends R21, R22) **A signed-in session's own window.** A request to a public op that does not mutate (`classes: null` and `mutating: false`: `bootstrap`, `groupidentity`, `instancegroup` and the other public reads) is counted in that session's own window, never in its source's (R21), when it presents a live session: R20's `token`, resolved by R6 through `credentials.session`, the founder's or a member's.
  - The bound is `SESSION_WINDOW`, exported frozen as `{limit: 3000, windowMs: 600000}`: at most 3,000 such requests per session in any 10 minutes, estimated as R21 estimates (two buckets, `prev × (1 − elapsed/W) + cur`).
  - At `≥ limit` the request is refused 429 `DOOR_RATE_LIMITED` (R21's row, C-38.9). The refusal carries `retryAfter` in whole seconds and `stated`, which is `SESSION_WINDOW_STATED`, the sentence composed from the same constants ("at most 3000 requests from one signed-in session in any 10 minutes"). Nothing of the op is read or written.
  - Every other request to a public op is counted by source, as R21 states:
    - one presenting no credential, or an unknown, expired or ended one;
    - an `ai` credential or a binding token;
    - every request to a mutating public op (`claim`, `recover`, `enroll`, R17's doors, the review and template doors, `knock`), whatever it presents.
  - A session that cannot be resolved (R6's store silence) is counted by source, as before.
  - The session window's counts hold a digest of the session token (never the token), the bucket and the count, nothing else. They are dropped once both buckets have passed. A count that cannot be read or written admits the request (it fails open), named in the log by correlation id only.
  - The source is still made and stamped wherever R21's stamps need it.
  - A refusal is counted in R22's tally as kind `rate`, with `country` `null` (a credential naming a member, DEC-166 (2)).
  - The limit is confirmed at this job's START against M-T49-4, so that at least 400 page loads in 10 minutes fit within it. If M-T49-4 finds more than 7 public requests per page load, BOB re-sets `limit` (K1881) before the job's work. *(not yet met: T49)*
  - Tests:
    - 400 signed-in page loads in 10 minutes, under one session and from one source, are admitted (each load makes the public reads M-T49-4 measures, at least `bootstrap` and `groupidentity`), and that source's window is not counted by them.
    - The session's request past `limit` is refused 429 with `SESSION_WINDOW_STATED`.
  - Controls:
    - 301 anonymous requests from one source are refused at the 301st;
    - a request presenting an unknown 64-hex token is counted by source;
    - a signed-in session's `enroll` is counted by source.

**Satisfies gains:** "(T49) K1881 and D24 (a signed-in member's ordinary page loads never meet the public door's bound): R27."

**START must say, beyond the entry:**
1. Measure M-T49-4 first, on the local arm: the public requests per signed-in page load, against R21's window. Also confirm how the screens present the session on `bootstrap` and `groupidentity` (the `Authorization` header or a body `token`). `doorWindowGate` is called before any credential is resolved (`control-plane/index.mjs`:723) and is handed no body. If the session travels in the body, the door's call must pass the parsed body: one line that goes to control-plane's T49-29 through BOB (P9).
2. Inherited reds: coverage on R27 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is admission's. Rule 6's items, the `admin` grep and N1073's hand-lists run at START.

---

## 5. control-plane (T49-29)

**Status line gains:** "Last changed T49 (T49-29: R96 new, amending R17, R29 and R92, a body `member` stripped only for `stepsource` and `stepsourcewithdraw`, D1, N1095, K3321 (A); R97 new, amending R15, `claim` passes `handle` and `founderhandleset` routed, N1072, K3265; R98 new, `projectownervotes` routed, N1091); marked not yet met (T49)."

**New lines.** Place them under a new heading "#### T49 (T49-29)" after R95.

- **R96** (T49; D1 **B**; N1095; K3320, K3321 (A); amends R17, R29, R92) The door strips a `member` from a request's body only for `stepsource` and `stepsourcewithdraw` (R92), whose `member` is the session's own (stamped, never the body's). It does not strip it for every op that declares a `member` stamp, as `control-plane/index.mjs`:2477 does today. For `accountreferenceset` and `accountreferenceremove`, the body's `member` is the account named and not a statement of who is acting. It reaches `ai-accounts` as given, and `ai-accounts` judges it against the `by` stamped from the session (its R1: `NOT_YOUR_ACCOUNT` for another member's account). The `member` the door stamps in the address is set and any caller's copy there is deleted, as R17 states, for every op that declares it. R29 holds with that exception named: its test reads the address stamp for these two ops, and the body for `stepsource` and `stepsourcewithdraw`. *(not yet met: T49)*
  - Test: through the real door, a member connects her own API key (`accountreferenceset` with `member` her own) and removes it, and so does the founder. Controls: a body `member` naming another member is refused `NOT_YOUR_ACCOUNT`, writing nothing; `stepsource` with a body `member` naming another member records the session's member. This clears capture-requests' `plane.test.mjs` (6), agent-worker's `harness.test.mjs` REC100-1b/2/2b and scheduler `plane` R12's first failure (rule 5 (7) (A)).
- **R97** (T49; N1072; K3265; amends R15; `op-declarations` R71; `credentials` R74; drafted as "R95") `claim` passes `handle` from the body beside `password`, still checked against the bootstrap credential first (R15). The body it sends names no `role` (`credentials` R75 reads none). The claim's answer is relayed with its `handle`. `founderhandleset` is routed through `membership`'s map. It is refused to any caller not arriving by the founder's own session, with `by` from the session (R17) and `handle` from the body. *(not yet met: T49)*
  - Tests: a claim's body `handle` reaches `credentials.claim`, and no `role` does. Controls: a `founderhandleset` under a member's session (an enrolled administrator's included) or under the bootstrap credential is refused at the door, with nothing sent to the store.
- **R98** (T49; N1091; DEC-237 (3); `op-declarations` R72; `project-roster` R30; the fold's R98, reduced to the op T49 places) `projectownervotes` is routed through `project-roster`'s map, refused to any caller not arriving by a member's session, with `viewer` stamped from the session (R17) and never taken from the caller (R29); the project is passed from the query. It holds no arm's behaviour: the answer, the absent one included, is `project-roster`'s, relayed as given. *(not yet met: T49)*
  - Test: an owner's session reads a change waiting on agreement. Controls: a `viewer` the caller sends in the query or body is deleted; an `ai` credential is refused.

**START must say, beyond the entry:**
1. Measure first. Seven ops declare a `member` stamp today: `ask`, `aigrantmint`, `stepsource`, `stepsourcewithdraw`, `accountreferenceset`, `accountreferenceremove` and `accountreference`. Only `accountreferenceset` and `accountreferenceremove` read `member` from the body (`ai-accounts/index.mjs`:1709–1710); the others read it from the address (`connections/index.mjs`:1551–1553, `credentials` `aigrantmint`). So R96 changes what reaches an owner for those two alone. Confirm this against the merged owners at START.
2. Inherited reds: rule 5 (7) (A)'s reds (capture-requests 6, agent-worker REC100-1b/2/2b, scheduler `plane` R12), run at the merge and named cleared or not; rule 5 (3)'s route censuses for `founderhandleset` and `projectownervotes`, cleared here; coverage on R96–R98 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). Rule 6's items and the `admin` grep run at START.

---

## 6. plane (T49-30): no line needed

R5 already makes the route map the union of every owner's map. `store.mjs`:711 and :714 spread `membershipOps` and `projectRosterOps`. So `founderhandleset` and `projectownervotes` reach their handlers once their owners serve them (T49-1, T49-2), as `pressurefor` and `filingread` did (K3280). Wiring them adds no requirement. The job re-pins R5's route-map tests by name (`split.test.mjs`, `t41.test.mjs`:124, a T49 list as `t48.test.mjs`:419's), with no new id. A line would be owed only if START found an owner map not spread.

**START must say, beyond the entry:**
1. Measure first: the route map's op count and `split.test.mjs`'s per-layer counts at START, before and after the two ops. Confirm that `membershipOps` serves `founderhandleset` and `projectRosterOps` serves `projectownervotes` (both maps are already spread).
2. Inherited reds: rule 5 (3)'s `split.test.mjs` and `t41.test.mjs` re-reds, cleared here at their root; the plane bundle and `program.mjs`, regenerated at L11's close (5 (5)); legacy-ui (5 (4)). Rule 6's items and the `admin` grep run at START.

---

## 7. Rule 7: wording-only edits (no job, no mark)

1. **basis-versions**, the heading of R12–R15 (line 35). Old: "(`op=versionaccept` … `op=versionhide`)". New: "(`op=versionaccept`, `op=versionreject`, `op=versionconsider`, `op=versionrevert`, `op=versioncurrent`, `op=versionhide`)".
2. **plane** R50's first sentence. Old: "The draft door takes `readtranslate`, `{subject: {kind, id, project?}, language?}`". New: "The draft door takes `readtranslate` (`op=readtranslate`), `{subject: {kind, id, project?}, language?}`".
3. **answers**, Provides. Old: "#### The answer contract and its checks (ladders §9.4 L1)". New: the same heading, followed by one paragraph before R3: "`ANSWER_FIELDS` is the frozen list of R3's fields in R3's order, exported (`answers/check.mjs`:21, re-exported by `index.mjs`), so a caller that must name the contract's fields reads them here and never lists them by hand (`agent-worker` R89; K3268)." This states an export that already exists.
4. **file-scanner**, Uses. Old: "- `runtime-limits`: `makeMeter` (the time limits), `sha256hex` (R2, R24, R25's prefixes)." New: "- `runtime-limits`: `sha256hex` (R2, R24, R25's prefixes)." No source under `file-scanner/src/` imports `makeMeter`, and no other line of the file names it.

---

## 8. Doubts for BOB (all BOB's, P17)

1. **`founderhandleset`'s grade.** The plan says `reversible`, but R3 forbids it, since no act takes a held handle back. *Recommended:* `RUNG_ABSENT`, `caller-owned`, as `handlechange` and `setpassword` (R43 as written). *Alternative:* `undetermined`, which interface-shell would draw as reasoned (DEC-87). The design kit already weighs it 2 (Reasoned), so either draws the same.
2. **The session window's refusal row.** *Recommended:* reuse `DOOR_RATE_LIMITED` (C-38.9) with the session's `stated`, so no new row is owed to T50's stamp and no new key to the design stream. Its translation ("from the same place") still reads true. *Alternative:* a new C-38 row `SESSION_RATE_LIMITED` (C-38.12), with a `words.json` key owed.
3. **The session window covers public reads only.** R27 leaves every mutating public op (`claim`, `recover`, `enroll`, the doors) under the source window, even with a session presented. That keeps the abuse limit on the credential-free acts. *Recommended:* as written.
4. **`SESSION_WINDOW`'s limit (3,000 per 10 minutes)** is a draft value, from the walk's ~4.3 public requests per page load. It is confirmed or re-set at START from M-T49-4 (K1881).
5. **R3 marked not yet met.** It is a job's line (T49-17 composes the table), not a rule 7 edit. *Recommended:* marked, as written.
