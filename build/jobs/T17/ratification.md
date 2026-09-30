# ratification (T17)

**Status** · session_0112aSUdNJWDcmWt84TiAFVd · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N385: the predicate alone cannot tell an agent from an operator's bearer, and the act tells them apart only by `aiCred`, which the pre-flight does not have.

- The act (`ops.mjs`:54) answers C-32.13 only when `aiCred` is set. An operator's bearer (`class:admin`, `class:member`, `class:probe`, `class:daemon`) gets C-32.15 alone. The existing R18 test (`preflight.test.mjs`:75–79) pins this, byte for byte against the act.
- `isMachineIdentity` is true for every `class:<cls>` stamp. So "C-32.13 whenever the predicate at :490 says machine" would give operators a C-32.13 the act never answers, which breaks R18's "that holds … byte-identical".
- A member-scoped agent's viewer stamp is `member:<minter>` (membership `aiCredentialMint`). The pre-flight cannot see that agent at all, whatever rule it uses (reported, not fixable here).

**My best reading:** keep the operator arm as the act answers it. C-32.13 holds for every viewer the predicate calls a machine *except* a bearer's own `class:<cls>` stamp. A `class:` stamp holds C-32.13 only when it is an agent credential's stamp: `class:ai`, or `class:<cls>/<tokenId>`, the act's own stamp shape at `ops.mjs`:54. Any other machine identity holds both fences (`claude`, `agent`, `token:x`, `token:ai`, `class:x/t1`). A member (`member:kai`, `member:ai`) holds neither. The class word is used only to name `tokenClass`.

**The alternative, read literally:** C-32.13 for every machine identity, operators included. I would then change the test's operator arm, and R18's byte-identity would no longer hold for operators.

Which one? I am waiting to build until you answer, because the answer decides the change.

## J2 · COMPLETE

**Applied: N385 (K601), in commit `b6c2dc8f5c`.** `caseRatifyPreflight` (`index.mjs`) now decides C-32.13 by `isMachineIdentity` alone:
- Every machine identity holds both fences, except an operator bearer's own `class:<cls>` stamp, which holds C-32.15 alone, as the act answers it.
- A `class:` stamp counts as an agent's only in the two shapes the plane mints for one: `class:<cls>/<tokenId>`, and the whole stamp `class:ai` (membership's organisation principal, `AGENT_ORGANISATION_STAMP`).
- No class word or name is compared. The R18 header comment is updated to match.

**Test.** New in `preflight.test.mjs`: "R18 (N385): …". It covers:
- machine identities with no "ai" in the name (`claude`, `agent`, `daemon`, `token:claude`, `Token:Probe`, `class:bot/t7`, `class:admin/t2`), which hold both fences;
- the act's own C-32.13 for an agent credential of class `bot`;
- members whose names hold "ai" (`member:ai`, `member:kai`, `member:aisha`, `member:AI`) and `member:admin`, which hold neither;
- operator bearer stamps (`class:daemon`, `class:wait`, `class:main`), which hold C-32.15 alone, byte-identical with the act.

It fails on the old code (1 fail) and passes on the new.

**Deferred:** none. **Found elsewhere:** the member-scoped agent's `member:<minter>` stamp (J1) is N407, T18.

**Tests and checks:**
- `bio-plane/test/m/ratification/`: 87 pass, 0 fail.
- `bio-plane/test/m/case-authoring/` (uses the pre-flight): 68 pass, 0 fail.
- `format`: 0 failures (72 modules).
- `architecture ratification`: 0 failures.
- `coverage ratification`: 19 of 19 ids, 0 failures.
- `ownership ratification tranche/T17`: 0 failures, legacy files untouched.

Size (session_0112aSUdNJWDcmWt84TiAFVd): test runs 4, module lines 3268
