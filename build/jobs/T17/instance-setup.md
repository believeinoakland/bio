# instance-setup (T17)

**Status** · session_01HAFaoP7GM4ubc6Vnncu5mP · depth 2 · WORKING · handled B2

## J1 · QUESTION

N397 (K573): no requirement of mine covers what the two old suites check, so I propose three, in my wording (BOB words them; I carry on against these meanwhile). Numbers are placeholders.

1. **R44** (D-605, beside R23): the members and keys section's key form sends `op=signeradd` the pasted public-key line split, as membership R25 takes it: when the trimmed text's first whitespace-separated token is `ssh-ed25519` and a second token follows, `keyB64` is that second token and `comment` is the tokens after it joined by single spaces, absent when there are none; any other text is sent trimmed, as pasted, as `keyB64`, and the plane says what it makes of it. `memberId` is the named member trimmed and lower-cased. So a whole line pasted from the signing page registers the key with its label.
   Test: the served page's `signerAddBody`, driven in `page.test.mjs`'s sandbox on real ed25519 lines (label, no label, tabs/runs/newline/many-word label, non-line), each body handed to the real `membership.signerAdd` (my Use) and the roster read back; the old K1 premise (a whole line is `BAD_KEY`) kept as the reason. The old K0 (the handler's call pinned by source text) becomes a driven arm: the form's register button, clicked in the sandbox, posts exactly `signerAddBody`'s body.

2. **R45** (D-62, beside R24): the intake form's bundle writer writes an information bundle's `content_hash: sha256:<hex>` in its frontmatter, the captured document's own digest, whenever a document was captured, and writes no `content_hash` for typed intake. So a document bundle clears C-2.7's content_hash requirement at `verified` (legacy-checks' `checkBundle`).
   Test: `mdFor` driven with and without a document, and the whole form driven through `acquire` → `promote`; the emitted bundle, advanced to `verified`, checked by `checkBundle` for C-2.7. The old source-text arms (the emission's spelling and guard in `SETUP_HTML`) are dropped (P7).

3. **R46** (D-110, `setup-honesty`'s other half; propose or rule it out): the intake form states each capture refusal `acquire` makes (`BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE`) in its own sentence, and any other reason as "could not be captured: <code>"; it explains no refusal the plane no longer makes (no `NO_AUTHORITY` sentence, D-97).
   Test: the form driven with `acquire` answering each reason. The old arm "the token appears nowhere in the served bytes, not even in a comment" is source text and dropped.
