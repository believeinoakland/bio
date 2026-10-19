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
