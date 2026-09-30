# instance-setup (T17)

**Status** · session_01HAFaoP7GM4ubc6Vnncu5mP · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N397 (K573): no requirement of mine covers what the two old suites check, so I propose three, in my wording (BOB words them; I carry on against these meanwhile). Numbers are placeholders.

1. **R44** (D-605, beside R23): the members and keys section's key form sends `op=signeradd` the pasted public-key line split, as membership R25 takes it: when the trimmed text's first whitespace-separated token is `ssh-ed25519` and a second token follows, `keyB64` is that second token and `comment` is the tokens after it joined by single spaces, absent when there are none; any other text is sent trimmed, as pasted, as `keyB64`, and the plane says what it makes of it. `memberId` is the named member trimmed and lower-cased. So a whole line pasted from the signing page registers the key with its label.
   Test: the served page's `signerAddBody`, driven in `page.test.mjs`'s sandbox on real ed25519 lines (label, no label, tabs/runs/newline/many-word label, non-line), each body handed to the real `membership.signerAdd` (my Use) and the roster read back; the old K1 premise (a whole line is `BAD_KEY`) kept as the reason. The old K0 (the handler's call pinned by source text) becomes a driven arm: the form's register button, clicked in the sandbox, posts exactly `signerAddBody`'s body.

2. **R45** (D-62, beside R24): the intake form's bundle writer writes an information bundle's `content_hash: sha256:<hex>` in its frontmatter, the captured document's own digest, whenever a document was captured, and writes no `content_hash` for typed intake. So a document bundle clears C-2.7's content_hash requirement at `verified` (legacy-checks' `checkBundle`).
   Test: `mdFor` driven with and without a document, and the whole form driven through `acquire` → `promote`; the emitted bundle, advanced to `verified`, checked by `checkBundle` for C-2.7. The old source-text arms (the emission's spelling and guard in `SETUP_HTML`) are dropped (P7).

3. **R46** (D-110, `setup-honesty`'s other half; propose or rule it out): the intake form states each capture refusal `acquire` makes (`BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE`) in its own sentence, and any other reason as "could not be captured: <code>"; it explains no refusal the plane no longer makes (no `NO_AUTHORITY` sentence, D-97).
   Test: the form driven with `acquire` answering each reason. The old arm "the token appears nowhere in the served bytes, not even in a comment" is source text and dropped.

## J2 · COMPLETE

**Entries applied.** Layer 11, N397 (K573), R44–R46 as worded by BOB (K605, B2). No module source changed: `src/setup.mjs` already met all three; the job is their tests at the interface.
- `test/m/instance-setup/keys.test.mjs`, 4 tests, each titled R44: the served page's script in the fixture's sandbox, signed in as an administrator, its key form filled and its register button clicked; the body it posts is handed to the real `membership.signerAdd` (membership R25, a Use) on its own storage (founder, a second administrator, ruth enrolled), and the roster read back. Real ed25519 keys in the OpenSSH line format.
- `test/m/instance-setup/intake.test.mjs`, 3 tests (R45 ×2, R46): the intake form filled and saved against scripted `acquire`/`attest`/`allocid`/`promote`; the `bundle.md` it sends to `promote`, advanced to `verified`, checked by legacy-checks' `checkBundle` for C-2.7.
- `test/m/instance-setup/fixture.mjs`: `pageOver`'s `ui` also answers the script's `signerAddBody`, `describeKey` and `acquireWhy`.

**Old suite `test/setup-signeradd.test.mjs`: which arm each new test carries (for legacy-tests).**
- K0 (the page defines `signerAddBody` once and the handler posts through it; a source-text pin) → driven instead: R44 test 1 clicks the register button and checks the posted body equals `signerAddBody`'s. Not carried: "defined ONCE" and the served status 200 (source text; the page as served is `setupPage`, tested by R20).
- K0b (the fixture is a real line) → R44 test 1 (68-char field, R25's shape).
- K1 (a whole line is refused `BAD_KEY`, nothing written) → R44 test 1's premise, against real membership.
- K2, K3 (the line split; registers active with its label) → R44 test 1.
- K4 (tabs, runs, newline, many-word label, " Ruth ") → R44 test 2.
- K5 (no label: no comment sent or stored) → R44 test 3.
- K6 (non-line sent as pasted, refused `BAD_KEY`) → R44 test 4, plus an `ssh-rsa` line and a bare base64 field.
- K7 (roster holds exactly the registered keys, no whole line) → R44 test 4.
- The negative-control driver `setup-signeradd.control.mjs`: its arms were re-run against the new tests by patching `src/setup.mjs` in place and restoring it (verified `git diff` empty): whole-line → all 4 R44 tests fail; label-dropped → tests 1, 2 fail; handler-bypasses (the pre-D-605 call) → all 4 fail (the old suite saw it only through K0's source pin); `respelled` needs no arm (the tests check behaviour, not spelling).

**Old suite `test/setup-honesty.test.mjs`.**
- D-62 "SETUP_HTML emits content_hash", "guarded by a present document" (source text) → dropped (P7); carried by behaviour in R45 test 1 (a capture writes `content_hash: sha256:<its digest>`) and test 2 (typed intake, and `src` null, `{}`, empty or null hash, write none; other types none).
- D-62 checkBundle arms "WITHOUT content_hash C-2.7 refuses verified" → R45 test 2; "WITH content_hash the refusal is gone" → R45 test 1, over the form's own output rather than a hand-built bundle.
- D-110 "no longer names NO_AUTHORITY" (a token's absence from the served bytes, comments included) → dropped as source text; carried by behaviour in R46 (`NO_AUTHORITY` answered only by the generic "could not be captured: NO_AUTHORITY", never a sentence asking for the issuer). "BAD_LOCATOR is still explained" → R46, with every other reason `acquire` makes.
- Controls, same method: content_hash line dropped → R45 test 1 fails; a hash invented for typed intake → R45 test 2 fails; a `NO_AUTHORITY` sentence re-added → R46 fails.

**Deferred.** None.

**Found in another module.** None.

**Tests and checks.** `node --test bio-plane/test/m/instance-setup/` after merging `tranche/T17`: tests 65, pass 65, fail 0. Old suites unchanged: `setup-honesty` 6 pass, 0 fail; `setup-signeradd` 9 passed, 0 failed. `format`: 0 failures. `architecture instance-setup`: 14 product files, 47 relative imports; 0 failures. `coverage instance-setup`: 46 of 46 live requirement ids named by a test; 0 failures. `ownership instance-setup tranche/T17`: 4 files changed; legacy-store, legacy-checks, legacy-index 0 added, 0 removed; 0 failures.

Size (session_01HAFaoP7GM4ubc6Vnncu5mP): test runs 14, module lines 2863
