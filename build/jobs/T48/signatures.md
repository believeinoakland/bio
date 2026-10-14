# signatures (T48)

**Status** · session_01QxoxoGkmDqhce5MjuwSXWv · depth 2 · COMPLETE · handled B1

## Completion

**Read, whole:** `build/requirements/signatures.md`; the public part of `record-grammar` (my one Use); layer 1's contract and the helper-modules section in `build/layers.md`; my entry T48-3 and the plan's "Rules at the opening" in `build/plan/current.md`; `build/plan/draft-updates.md` §1–2 (my entry cites it); every file of my code (`sshsig.mjs`, `tsa.mjs`, `sign-release.html`, `embed-signpage.mjs`, `sign-sshsig.mjs`; `signpage.mjs` is their generated render, checked byte-identical by R30) and all three test files (P20); and `newgroup/src/signers.mjs`, for R45's two lines. No flaw found in the existing code that this job had to fix.

**Entry applied:** T48-3 (N1047; K3158; draft-updates §1–2): R45–R48, and R1 amended to six namespaces. All in `bio-plane/src/sshsig.mjs`:
- `RELEASE_KEYS`: a frozen list of exactly the two lines the installer's `ARMED_SIGNERS` holds today (the release key, `bio-release`, and the recovery key, `bio-release-recovery`). The installer re-points to it in T48-79, not here.
- `NS_RELEASE_NOTICE = "bio-release-notice"`, the sixth namespace.
- `RELEASE_NOTES_MAX = 8000`, exported because R47 names it.
- `releaseNoticeStatement({version, date, manifest, security, notes})`: the exact bytes R47 gives, with the notes as `record-grammar`'s `canonicalJson`. It throws `REFUSED [NOTICE_FIELD]: <field>` before building any bytes.
- `verifyReleaseNotice(notice, armored, running, allowedKeys = RELEASE_KEYS)`: R48's checks in R48's order. The signature is judged before the version. It never throws, and it answers a frozen copy holding only R47's fields.

**My readings of R47 and R48** (none changes what the module promises, so I asked no question):
- The field names in `REFUSED [NOTICE_FIELD]: <field>` and in `MALFORMED`'s `field` are `notice` (not an object, or a field that cannot be read), `version`, `date`, `manifest`, `security`, `notes` (not exactly the three keys), `notes.members`, `notes.administrators`, `notes.must_do` and, for R48, `running`. A malformed `armored` is passed on as `verifySshsig`'s `MALFORMED`, with `field: "signature"` added.
- "At most 8,000 characters" counts code points, not UTF-16 units.
- "Non-empty" means a string of length ≥ 1.
- A notice's fields beyond R47's are ignored, not refused, since a published notice may sit beside other data. The notes object must hold exactly its three keys.
- Each field is read once into the copy that is checked and signed, so a getter cannot show the check one value and the statement another.
- Dates are checked with no clock (R26): the proleptic Gregorian calendar, with leap years.
- Versions are compared part by part as numbers of any size, by length and then digit by digit, so numbers past 2^53 are compared correctly.

**Tests:**
- New file `release-notice.test.mjs`, 22 tests:
  - R45: the exact two lines, each normalised as R2 reads a key, the two different, the list frozen; a key outside the list is refused for a release, a fleet statement and a notice.
  - R46, and R1 (T48) in its own test: the six namespaces.
  - R47: the exact bytes; every field-change control; each field's refusals, including the cap at 8,000 and 8,001 in both ASCII and astral characters; the leading token.
  - R48: the accepted case; the controls R48 names (a tampered note is `BAD_SIGNATURE`, an older version or a replay is `NOT_NEWER`, a notice signed in `NS_RELEASE` is `NAMESPACE`, another key is `UNKNOWN_KEY`); `RELEASE_KEYS` as the default key list; `MALFORMED` with each field; `CRYPTO_UNAVAILABLE`; the signature judged before the version; never throws; R29's rule over every refusal.
  - Signers: release-signer (`signSshsig`) signatures and stock `ssh-keygen` signatures, both checked both ways.
- `signatures.test.mjs`:
  - R1 now counts six;
  - R26's child process also runs `releaseNoticeStatement` and `verifyReleaseNotice` with its clock and network traps set;
  - R27 and R28 include the notice statement and namespace.
- Mutation checks, each reverted afterwards: comparing equal versions as newer, comparing versions with `Number`, allowing any day up to 31, counting UTF-16 units, and plain `JSON.stringify` for the notes each turn the tests red.

**Deferred:** none.

**Found in another module, and generated artifacts this change makes stale (mechanics §14):**
- `newgroup/dist/newgroup.bundled.mjs` (owned by `installer`) bundles `sshsig.mjs`, so it is now stale. `test/system/newgroup-bundle-fresh.test.mjs` fails 1 with this change and passes 1 with `sshsig.mjs` reverted. Rule 5 does not name it; BOB regenerates it at the layer's close.
- The plane bundle and `program.mjs` are stale too; that red is accepted (rule 5 (5)).
- Nothing in another module is wrong against its requirements.

**Tests and checks run:**
- signatures: `node --test test/m/signatures/`: tests 109, pass 109, fail 0 (86/86 before the change).
- Users of `signatures`:
  - bundler 93/0;
  - attestation 32/0;
  - doorbell 69/0;
  - membership 223/6: `module-order` R83, R140 and R79, rule 5 (3);
  - promotion 136/1: `registry.test.mjs` R39/R45/R46, rule 5 (3);
  - capture 141/1: R21/R27/R73 `{role}` sign-in, rule 5 (7) S, red with `sshsig.mjs` reverted too.
- The other users (installer and the layer 11 modules) were not run. This job adds exports only and changes no existing service.
- `node checks/format.mjs`: 168 modules, 166 requirements files; 0 failures.
- `node checks/architecture.mjs . signatures`: 9 product files, 13 relative imports; 0 failures.
- `node checks/coverage.mjs . signatures`: 48 of 48 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . signatures tranche/T48`: 0 failures.
- `node checks/run.mjs` over the product:
  - format 0, architecture 0 and channels 0 failures;
  - coverage 6 failures, all in other modules and all not yet met (rule 5 (1)): bundler R32, court-citations R11, file-scanner R32, jurisdictions R89–R92, ooxml R34, record-grammar R63.

Size (session_01QxoxoGkmDqhce5MjuwSXWv): test runs 12, module lines 1604

## J1 · COMPLETE

T48-3 applied: R45 RELEASE_KEYS (the two ARMED_SIGNERS lines, frozen), R46 NS_RELEASE_NOTICE, R47 releaseNoticeStatement (+RELEASE_NOTES_MAX), R48 verifyReleaseNotice (signature before version; NOT_NEWER for replay/downgrade; default RELEASE_KEYS); R1 six namespaces. New release-notice.test.mjs (22 tests). signatures 109/109; users bundler, attestation, doorbell green; membership/promotion module-order reds rule 5 (3); capture R21/R27/R73 {role} sign-in rule 5 (7) S, red with my change reverted too. format, architecture, coverage (48/48), ownership: 0 failures. Stale artifact not in rule 5: newgroup/dist/newgroup.bundled.mjs (installer's) bundles sshsig.mjs, newgroup-bundle-fresh fails 1 (passes reverted), for regeneration at layer close; plane bundle and program.mjs stale (rule 5 (5)). Readings of R47/R48 field names in the record. Bundler (T48-4) may start once merged. Record: build/jobs/T48/signatures.md.
