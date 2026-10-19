# op-grades (T51)

**Status** · session_01DDDCMrcMGVh3JfV1ARpWWf · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

**QUESTION (words, K3268): how the 42 hand-lists are assembled.** Re-reading the words check after the conversion: 41 hand-lists are flagged in `test/m/op-grades/*.test.mjs` (ops, and refusal codes in `ladder`, `pins`, `t45`), plus K4036's and K4041's named lines, all of them other modules' ops or codes. The reading I take: each list is assembled from the owning module's own declaration, never typed here.

What I found, so the choice is yours:
- `op-declarations` exports `OP_FAMILIES[owner]` (kinds, acts, reads, proposals, extra) for 60 owners, so most lists have a declared owner there.
- Some owners have no family (`escalation`, `filing-templates`, `case-import`, `action-holds` in part): their declaration is their route map (`escalationOps`, `standardsOps`), or nothing exported.
- Most flagged lists are a requirement's subset of an owner's ops, or mix several owners (e.g. `pins.test.mjs:318`, `owners.test.mjs:161`), so a whole-family derivation would widen what a test asserts.

Recommended: a shared helper `test/m/op-grades/declared.mjs` that reads each owner's ops from `OP_FAMILIES` by kind, and, for the owners with no family, from the owner's exported route map; each requirement's subset is then the declared set filtered by the kind the test asserts. Where the subset is not a kind (a requirement's own list), the test keeps the requirement's ops by intersecting the declared set with a named list in `op-grades`' own data. Alternative: BOB rules that a test may name an owner's op only through the owner's own test fixture. I will use the recommendation unless you rule otherwise; I have not started the 41 conversions. The plain finding is a separate REPORT.

## J2 · REPORT

**REPORT (words, plain).** `bio-plane/src/op-grades/t36.mjs:18`, "scheduler: the security wakes; name no member and move no bundle", is the `NON_ACTS` reason of `scanbatch`, `renderbatch`, `deeperbatch` and `securityforward`. It says why the scheduler's wake is not an act, for the developer reading the grade table. No screen draws `NON_ACTS` (`VOCABULARIES` publishes its rung, ground, consequence, larger-screen and irreversible sets, not `NON_ACTS`; `affordances` R4). No member reads it, so it is not converted; please pass it to the design's `unkeyed` list (K3944), and the words check's plain arm then clears it.

## J3 · REPORT

**REPORT (words, progress, K4069).** Pushed. The hand-lists are down from 42 to 30. Converted: `t35` (the `B3_READS`, `R22_READS` reads), `t36` (`R24_READS`, the `aikeepaway` … rung list), `t47` (`READS`), `t48` (`READS`, the control list, the `R41` reads), `t50` (`REVERSIBLE`, `WRITES`, `READS`). Each derives from `test/m/op-grades/declared.mjs` (`OP_FAMILIES` of the owners) intersected with this module's table. All 125 op-grades tests pass; `checks/words.mjs` shows 30 hand-list findings and the plain one you asked me to leave.

Two kinds of list are not converted yet, and I need your ruling before I continue:
1. **Refusal codes** (`ladder.test.mjs:71`, `pins.test.mjs:287`, `t45.test.mjs:143`, `t48.test.mjs:169`). The owners (connections, money, citation, standards, …) write their codes as literals inside behaviour; no owner exports a code table, and the family declarations cover ops only. A test can only derive them from an owner export, so either the owners export their code lists (changes in those modules, a REPORT each, P9), or the controls are restated on the interface (for example, a refusal from the owner's own function is not in `JUSTIFICATION_REFUSALS`). Which do you rule?
2. **Op lists whose owner is not a family** (`escalation`, `filing-templates`, `case-import`, `wizard-scripts` in part): `pins.test.mjs` `@32`, `@36`, `@57`, `@123`, `@165`, `@176`, `@187`, `@331`, `@336`, `@342`; `owners.test.mjs` `@46`, `@120`, `@161`, `@283`; `ladder.test.mjs` `@178`, `@196`. Their declaration is `OPS` in op-declarations (no owner field) or an owner's route map (`escalationOps`, `standardsOps`). I am taking `OPS` filtered by this module's tables for these, unless you rule otherwise.

The `t41`, `t45` lists failed when I derived them from guessed owner families (the derived sets were wider than the requirements' lists), so those are unchanged and remain flagged; I will derive them from the exact requirement subsets.
