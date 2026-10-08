# affordances (T37)

**Status** · session_0187SVNmLrMtUDuMD6BfqRLx · depth 2 · WORKING · handled B1

## J1 · REPORT

R48's re-generation (ACT_HELP from mock-acts.js @ e08cd35ecb, 203 entries; work in progress, not yet pushed) moves two things outside affordances:
1. op-declarations: test/m/op-declarations/t36.test.mjs:291 (R34, the partition SESSION_OPS.member ⊆ ACT_HELP ∪ ACT_HELP_ABSENT, disjoint) goes red at my merge: 'member ops explained and named absent: clockpropose'. PR #14 gives clockpropose its own text (DEC-182 (1)), so op-declarations' ACT_HELP_ABSENT must drop it (T37-31's R34 re-read). The withdrawn keys (claimidentity etc.) do not move it. Red from my merge until T37-31.
2. The nine owed acts not declared at my merge (infolevelset, subscriptionsignin, obscuremark, setpassword, translationgrant/draft/adopt/confirm/revert) are held under owed_<op>, and my test states that set as it stands at my merge (affordances may not import op-declarations, later in the order). Once T37-31 declares eight of them, R48 holds them under their ops: that needs an affordances re-generation after T37-31 (a CHANGE or a later entry); my test stays green meanwhile, since it pins the set as of my merge.
3. bio-plane/dist/bio-plane.bundled.mjs holds a copy of ACT_HELP (and ACT_HELP_ABSENT): stale after my merge; I do not write it (mechanics §14).
Note for BOB (R48, as the START asks): the design's owed_setpassword text says 'Other sessions you have open stay signed in until they end', while credentials R3 ends every other session of that role. Held as given; the design stream's to re-word.

## Completion

**Entry applied:** T37-27 (K2189; CREDENTIALS #8 J2; N776, DEC-182; N669, N708), against R48 as amended at the START.
- **R48, `ACT_HELP` re-generated** (`src/affordances/act-help.mjs`) from `mock-acts.js` at `e08cd35ecb` (byte-identical on the tranche), 203 entries, all held, in the design's order, each text verbatim:
  - The 28 aliases are held under their ops (`op-grades`' `OP_ALIASES`).
  - The nineteen owed acts declared in T36 are held under their ops.
  - The nine owed acts not declared at my merge are held as `owed_<op>`: `infolevelset`, `subscriptionsignin`, `obscuremark`, `setpassword` and the five translation ops.
  - `projectcreated`, `countask`, `registerproceeding`, `deadlinecompute`, `claimidentity` and `assistantset` are gone from the design and not held.
  - `clockpropose` is held under its own text; `entitycreate`'s text is the design's new one.
  - `translationmark` and the new reads have no text here; they are op-declarations' `ACT_HELP_ABSENT` (its R34).
- **`t36.test.mjs` (census row 29)** re-states its counts and named keys from the file at `e08cd35ecb`:
  - It pins 203 entries, the withdrawn and retired keys absent, and the exact `owed_` set. The set of undeclared owed acts is stated as it stands at my merge; affordances may not import op-declarations, which comes later in the order.
  - One assertion is re-pinned, not loosened. It read "each `owed_` op is not graded" as a proxy for "not declared"; op-grades T37-26 now grades `obscuremark`, `setpassword` and the translation ops before they are declared. It is replaced by the exact `owed_` set and "no undeclared owed op is held under its own name".
- **`t36-backing.test.mjs`:76–80 (R19; red 14)** is re-pinned from `NO_REASON` to `AI_KEEP_AWAY_NO_REASON`, and the test reads `JUSTIFICATION_REFUSALS` from op-grades.
  - Red until op-grades T37-26 merges (merge order: op-grades before me).
  - Proven: with `AI_KEEP_AWAY_NO_REASON` added locally (not committed) to op-grades' `JUSTIFICATION_REFUSALS`, `t36-backing` ran 5/0, and catalogue, t31, t33 and t34 still ran with 0 failures.
- **`plane.test.mjs` (red 17's rows 1–27)**: `call`, which `GET`, `POST` and `offered` share, now lifts `token=` out of the address into `Authorization: Bearer`, as members.test.mjs does (K2182). No request here carries a credential in its address. The `MEM` uses changed as follows:
  - **R18, both roster tests:** the `MEM` caller is replaced by `nell`, an enrolled member's session. The machine-row assertion now covers `ADM`.
  - **R20, my reading:** the machine is now `ADM` (`token:admin`, a machine identity), not a member session. A member session would make the machine map vacuous, which would loosen the check. An ai credential cannot be minted through the door until control-plane T37-33: the mint answers `AI_CREDENTIAL_NO_SECRET`, as probed. The test's assertions are unchanged, and every `MACHINE_*` code matches `MACHINE_REFUSALS` as before.
  - **New test (R18 R20)** pinning admission R5 for the retired shared credential: `op=affordances` with and without a target answers 401 `MEMBER_TOKEN_RETIRED` with no result; it is offered nothing; `projectjoin` and `select` are refused with that code.
- **R49:** unchanged, and the test passes over the wire with the new table.

**Deferred:** the re-keying of the eight owed acts that T37-31 declares (`setpassword`, `obscuremark`, `subscriptionsignin`, the five translation ops) under their ops. It cannot be done before op-declarations declares them and needs a re-generation after T37-31 (J1, item 2).

**Found in other modules (J1):**
- op-declarations: `t36.test.mjs`:291 (R34's partition) is red from my merge until T37-31 drops `clockpropose` from `ACT_HELP_ABSENT`. Its suite ran 12/1 with my change and 13/0 without it.
- The dist bundle's copy of `ACT_HELP` is stale after my merge.
- The `owed_setpassword` text conflicts with credentials R3 (held as given; the design stream's to re-word).
- Control-plane T37-33: until it lands, no test can mint an ai credential through the door.
- No R12 test of mine runs `unaccounted` against op-declarations' real table, so none names op-grades' newly graded, undeclared ops (`obscuremark`, `setpassword`, the translation ops, `photomarks`). They meet op-declarations' and control-plane's totality tests, not mine, until T37-31.

**Reading:**
- The set exceeded 300 KB, so I followed option (3). I read whole: my requirements; layer 11's contract through the START; `act-help.mjs` (its header and table, re-generated and compared entry by entry against the design programmatically); `plane.test.mjs`; `t36.test.mjs`; `t36-backing.test.mjs`; `mock-acts.js` at `e08cd35ecb`; op-grades' `OP_ALIASES`; DEC-174 and DEC-182; K2159, K2166, K2171, K2175, K2182, K2183 and K2189; and the plan's T37-26, T37-27 and T37-31 and rule 6 items 11, 14 and 17.
- A worker read in full the rest of the code (`affordances.mjs` 1,553 lines, `door.mjs`, `facts.mjs`, `words.mjs`) and the other 14 test files (about 4,800 lines). Its summary, about 12 KB, cites file and line for every `ACT_HELP` use, every request helper, every `NO_REASON` and `JUSTIFICATION_REFUSALS` use, the R12 tests, and the ids each file names. It found the op-declarations partition and the bundle copy, which mattered (J1). Nothing it left out mattered: no other in-scope file sends a credential or counts `ACT_HELP`.

**Tests:**
- `node --test test/m/affordances/`: 218 tests, 217 pass, 1 fail. The fail is `t36-backing` R19 `aikeepaway`, red 14, which clears at op-grades' merge.
- `plane.test.mjs`: 28/0. `t36.test.mjs`: 4/0.

**Checks:**
- format: 136 modules, 135 requirements files; 0 failures.
- architecture: 22 product files, 246 relative imports; 0 failures.
- coverage: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership: 0 failures.

Size (session_0187SVNmLrMtUDuMD6BfqRLx): test runs 19, module lines 2280

## J2 · COMPLETE

T37-27 applied; the record's Completion section has the detail. ACT_HELP is re-generated from mock-acts.js @ e08cd35ecb (203 held; nine owed_ acts until declared). plane.test.mjs: credentials go in the Authorization header; R18 uses nell's session; R20's machine is ADM (no ai credential can be minted before T37-33); the retired MEM is pinned to admission R5. 28/0. t36 counts are re-stated. t36-backing aikeepaway is re-pinned to AI_KEEP_AWAY_NO_REASON: red until op-grades T37-26 merges, proven green with it locally. Module: 218 tests, 217 pass, 1 fail (that one). Checks: 0 failures each. Reds named: op-declarations t36.test.mjs:291 (clockpropose) until T37-31; the eight owed acts' re-keying after T37-31; dist bundle stale.
