# consequences (T41)

**Status** · session_01RtLmUT1q8BFu6o88GfAG8d · depth 2 · WORKING · handled B0

## Completion (CONSEQUENCES #10)

**Reading set** (mechanics §17): BOB's measure 496 KB counts each used module's whole public part; read as §3 asks it is about 265 KB (this module's requirements 16 KB, code 91 KB, tests with the fixture 117 KB, layer 9's row and contract, each used module's Purpose ~9 KB, and the services the Uses names, chiefly membership's Terms, R18, R43, R44, R45, R55, R77, R78, R80, R85), under 300 KB: read whole myself, with plan entry T41-46, the opening's rule 4 (11), K2408, K2409, K2442 and `build/jobs/T41/membership.md`'s Completion.

**Entries applied:** T41-46 (N822, D54; K2408, K2442), tests only. All nine D54 reds named in B1 re-stated, each with a negative control; no requirement changed.
- Fixture: its world note says P is hidden, so `carol` (an administrator neither invited nor joined) sees it only at `EXISTENCE`; two helpers, `discoverable()` (the owner sets the project discoverable, membership R45) and `invite(id)` (alice invites, not joined), give the negative controls.
- `record.test.mjs` :39 (R1, now "R1 (D54)"): carol at hidden P is answered `noSuchDetermination` for every case, ahead of every other refusal, nothing written; then P discoverable and R1's order holds for her as before. :126 (R1 R3): carol hidden → `noSuchDetermination`; invited → `CONSEQUENCE_NOT_A_PARTICIPANT`. :220 (R13): carol hidden → the part, `consequencesOf` and `addressed` absent, as to bob; P discoverable → carol reads both, bob (a member at `EXISTENCE`) still absent.
- `addressed.test.mjs` :47 (R9): carol hidden → `NO_SUCH_PART`, nothing written; P discoverable → `CONSEQUENCE_NOT_A_PARTICIPANT`, nothing written.
- `assessed.test.mjs` :163 (R6): carol hidden → `NO_SUCH_PART`; invited → `CONSEQUENCE_NOT_A_PARTICIPANT`.
- `computed.test.mjs` :183 (R2): carol hidden → `NO_SUCH_DETERMINATION`, synchronous; P discoverable → `CONSEQUENCE_NOT_A_PARTICIPANT`, synchronous.
- `person.test.mjs` :61 (R16, DEC-78): carol hidden → `NO_SUCH_PART`; invited, the link's rule holds for her as before. :82 (R16, N600): carol hidden → `NO_SUCH_PART`; P discoverable, she is answered the person as before.
- `reads.test.mjs` :348 (R13 R14): the `CONS-` object's sight is alice, pat → true, carol, bob → false, and both read the part as absent; P discoverable → carol true and reads it, bob still false and absent.

**Product code:** unchanged. No read here assumes the founder's or an administrator's `FULL` sight: every internal read already passes the machine viewer `machine:admin` (`INTERNAL`, index.mjs:98), which membership R43 admits to every bundle; `#seesPerson` maps a bare `admin` viewer to the founder's member id only for people R34's link list. The reds were the tests' premise alone.

**Deferred:** none. **Found in other modules:** none. **Final uses:** unchanged (`modules.json`'s list).

**Tests and checks:**
- `node --test bio-plane/test/m/consequences/`: tests 41, pass 41, fail 0 (before: 9 fail, exactly B1's nine).
- Layer tests: none named in `build/manifest.md`. No provided service changed, so no users' suites.
- `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures.
- `checks/architecture.mjs consequences`: 11 product files, 49 relative imports; 0 failures.
- `checks/coverage.mjs consequences`: 16 of 16 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs consequences tranche/T41`: run after the commit, below.

Size (session_01RtLmUT1q8BFu6o88GfAG8d): test runs 9, module lines 1443
