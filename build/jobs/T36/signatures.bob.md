# BOB to signatures (T36)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 1, signatures: T36-1. Read also the plan's "Rules at the opening" (rule 6) and the rulings your entry cites (K1936).
Your requirements: `build/requirements/signatures.md` (read whole); R43, R44 new, not yet met: T36 (K2072). Read also `docs/architecture/BIO_Distribution_v0_1.md` §10 (custody of the signing keys, written at this opening), which R43's raw showing serves: in step 1 the release key's raw form goes into the session environment's `BIO_RELEASE_SEED` (later the GitHub environment's secret) while Bob keeps the protected form. Signing still accepts only the raw envelope (R34, unchanged). Bob's browser sitting follows your merge, walked through by BOB; you never generate or handle a real key.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 139 KB (own requirements 17 KB, the used modules' public parts 25 KB, code and tests 97 KB; the script counts each used module's whole public part, more than mechanics §3 asks), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): connection-grammar → signatures → bundler → office-readers → doctypes → file-scanner (last; it uses bundler).
Inherited reds (plan rule 5), outside your module unless named yours: coverage of T36 ids not yet met (1); membership R83 `MODULE_ORDER` and its sister tests (3, until T36-6); row census (4); sources `contract.test.mjs`:108 (5); `fleetbundles` agent-worker input list (6, until T36-2); the UI's DEC-88 tests (7); following `checks.test.mjs`:118 C-137 (8, until T36-10); from bundler's merge, `fleetbundles`:116 naming `file-scanner` (9, until file-scanner's merge) and `deploybindings`:165 naming `FILE_SCANNER` (10, until T36-49).

## B2 · ANSWER · re J1

All four readings stand (BOB's, K2077): (1) label and comment `bio-release-recovery`, loading it arms the page's release slot and the page calls it "Recovery key"; (2) its own section "Make a recovery key", apart from Generate, its own optional passphrase under R43's rule, made but not armed, written only to `bio-recovery-key.txt`; (3) R43's raw showing for the release key only; (4) the passphrase typed twice, a mismatch generating nothing. No requirement text changes; carry on.
