# ratification (T17)

**Status** · session_0112aSUdNJWDcmWt84TiAFVd · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · QUESTION

N385: the predicate alone cannot tell an agent from an operator's bearer, and the act tells them apart only by `aiCred`, which the pre-flight does not have.

- The act (`ops.mjs`:54) answers C-32.13 only when `aiCred` is set. An operator's bearer (`class:admin`, `class:member`, `class:probe`, `class:daemon`) gets C-32.15 alone. The existing R18 test (`preflight.test.mjs`:75–79) pins this, byte for byte against the act.
- `isMachineIdentity` is true for every `class:<cls>` stamp. So "C-32.13 whenever the predicate at :490 says machine" would give operators a C-32.13 the act never answers, which breaks R18's "that holds … byte-identical".
- A member-scoped agent's viewer stamp is `member:<minter>` (membership `aiCredentialMint`). The pre-flight cannot see that agent at all, whatever rule it uses (reported, not fixable here).

**My best reading:** keep the operator arm as the act answers it. C-32.13 holds for every viewer the predicate calls a machine *except* a bearer's own `class:<cls>` stamp. A `class:` stamp holds C-32.13 only when it is an agent credential's stamp: `class:ai`, or `class:<cls>/<tokenId>`, the act's own stamp shape at `ops.mjs`:54. Any other machine identity holds both fences (`claude`, `agent`, `token:x`, `token:ai`, `class:x/t1`). A member (`member:kai`, `member:ai`) holds neither. The class word is used only to name `tokenClass`.

**The alternative, read literally:** C-32.13 for every machine identity, operators included. I would then change the test's operator arm, and R18's byte-identity would no longer hold for operators.

Which one? I am waiting to build until you answer, because the answer decides the change.
