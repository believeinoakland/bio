# signatures (T53)

**Status** · session_018BhceeVjx2uYzrUetpWc1A · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# signatures · T53 · report

**Entries applied**
- T53-28 (K5457, K5471): `NS_AI_CATALOGUE`, `NS_AI_ADVISORY`, `NS_AI_RUN`; `aiCatalogueStatement`, `aiAdvisoryStatement`, `aiSealKeyStatement`, `runBundleStatement`; `verifyAiCatalogue`, `verifyAiAdvisory`, `verifyAiSealKey`, `verifyRunBundle` (the run-key check ai-issuer R12 needs). R1's namespace count is now nine; the two tests that counted six now count nine. `runBundleStatement` returns bytes synchronously, so it carries a small SHA-256 (tested against `node:crypto` at every padding boundary).
- T53-504 (K5577 (5)): `CATALOGUE_KEYS` holds two throwaway public lines labelled as test fixtures (private halves discarded). **Waiting on BOB's CHANGE** carrying the public lines of Bob's catalogue signing and recovery keys from the signer page; until then the list is a fixture only.
- T53-29 (K5565): the words check on this module reports 0 findings. The module's one CENSUS-RX C site (`release-signer.test.mjs:45`) is a regex for the SSHSIG armor's `BEGIN`/`END` lines, a wire format and not English; kept as is.

**Not done:** the real `CATALOGUE_KEYS` lines (above).
**Found in other modules:** nothing.

**Met** · R49, R50, R51, R52, R53, R54, R55, R56

Tests: 116/116. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeVjx2uYzrUetpWc1A): test runs 1, module lines 1138

## Completion (2026-10-27)

# signatures · T53 · report

**Entries applied**
- T53-28 (K5457, K5471): `NS_AI_CATALOGUE`, `NS_AI_ADVISORY`, `NS_AI_RUN`; `aiCatalogueStatement`, `aiAdvisoryStatement`, `aiSealKeyStatement`, `runBundleStatement`; `verifyAiCatalogue`, `verifyAiAdvisory`, `verifyAiSealKey`, `verifyRunBundle` (the run-key check ai-issuer R12 needs). R1's namespace count is now nine; the two tests that counted six now count nine. `runBundleStatement` returns bytes synchronously, so it carries a small SHA-256 (tested against `node:crypto` at every padding boundary).
- T53-504 (K5577 (5)): `CATALOGUE_KEYS` holds two throwaway public lines labelled as test fixtures (private halves discarded). **Waiting on BOB's CHANGE** carrying the public lines of Bob's catalogue signing and recovery keys from the signer page; until then the list is a fixture only.
- T53-29 (K5565): the words check on this module reports 0 findings. The module's one CENSUS-RX C site (`release-signer.test.mjs:45`) is a regex for the SSHSIG armor's `BEGIN`/`END` lines, a wire format and not English; kept as is.

**Not done:** the real `CATALOGUE_KEYS` lines (above).
**Found in other modules:** nothing.

**Met** · R49, R50, R51, R52, R53, R54, R55, R56

Tests: 116/116. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeVjx2uYzrUetpWc1A): test runs 2, module lines 1138

## Completion (2026-10-28)

# signatures · T53 · report (CHANGE: T53-512, R57)

**Entry applied.** T53-512 (K5625): R57, the offline key-ceremony page.
- **Path:** `bio-plane/scripts/catalogue-keys.html` (a script directory, so no bundle reaches it). It is outside this module's `paths` (which list files, not that folder), so BOB sets `paths` to add it.
- **SHA-256 of the file:** `87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5`
- It is one self-contained file: no network API, no loaded resource, no address (a test checks the text). One press makes the catalogue signing key and the recovery key (labels `bio-ai-catalogue`, `bio-ai-catalogue-recovery`), each private key in the passphrase-locked form (`BIOKEY1.<label>.<salt>.<iv>.<ciphertext>.<iterations>`, PBKDF2 600,000 rounds + AES-GCM, the form the retired page used) with its R35 public line. It loads a saved key with its passphrase, copies both public lines together, and signs an R51 statement only, in NS_AI_CATALOGUE, after showing its fields in words; either key can sign (a choice box). Opened in a real browser (Playwright): makes keys, shows the words, signs, and makes no request beyond its own file.
- **Tests** (`catalogue-keys.test.mjs`, 14): keys it makes open by an independent PBKDF2/AES-GCM reader into a seed R34 reads whose R35 line equals the page's; a signature verifies by R53 and by stock `ssh-keygen -Y verify` (and fails in another namespace or over changed bytes); 30 non-statements are refused; signing waits for the words and is withdrawn when the text is edited; no network names in the page.
- **Choices BOB may want to rule on:** the passphrase need only be non-empty (the retired page allowed none; R57 says "passphrase form"); loading a raw `BIOKEY-RAW1` key is refused (the page gives out and takes only the locked form).
- Suite 130/130; the words check is clean.

**Not done:** the real `CATALOGUE_KEYS` lines, which come after Bob's ceremony.
**Found in other modules:** nothing.

**Met** · R49, R50, R51, R52, R53, R54, R55, R56, R57

Tests: 130/130. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeVjx2uYzrUetpWc1A): test runs 3, module lines 1538
