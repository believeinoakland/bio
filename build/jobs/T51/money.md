# money (T51)

**Status** · session_01EALiSa4XrZJimPmaSkDTWA · depth 2 · WORKING · handled B0

## J1 · REPORT

Findings in other modules, seen by the checks run for money (not changed here, per P9; each is for its own module's job or for BOB):

- `contradiction` `bio-plane/src/contradiction/index.mjs:876`: inline sentence "{} candidate pair(s) were NOT formed because money's reconciliation..." (the words check, inline arm).
- `events` `bio-plane/src/events/index.mjs:109`: inline "a payer or payee lives on the money fact, never on an event" (inline, plain).
- `calculations` `bio-plane/test/m/calculations/money.test.mjs:99`: testcopy "only at a member's request" (code).
- `money-checks` `bio-plane/test/m/money-checks/run.test.mjs:167`: testcopy "no threshold stated" (its entry T51-199).
- `screens-investigate` `bio-plane/test/m/screens-investigate/money.test.mjs:58`: testcopy "phase or stage" (a words.json en; the test copies it).
- `affordances` `bio-plane/test/m/affordances/t33.test.mjs:57`: handlist of money's op names (moneyof, moneysummable, ...), K3268: a hand-list of another module's ops, assembled from that module's own declaration.
- Design list, for BOB: `docs/development/ux-substrate/screens/words-reads.json` lists money's refusal details as "never drawn by the shell" (DEC-258 (3)), with line numbers from before this job. R13 binds them, so this job read every money refusal detail through localize; the design may want its list updated.

One string left in source on purpose, for BOB to settle: `money/index.mjs` line 956, "events is not wired here, so no event the fact concerns is read", on the design's unkeyed list as a wiring diagnostic for builders (no member reaches it on a wired host). Every other sentence money reads is keyed.
