# signatures (T31)

**Status** · session_01JojTP81KLXqohStkarosgE · depth 2 · WORKING · handled B1

## Completion

**Entries applied** · L1 N538 (DEC-124, K1365, K1367): R32. `bio-plane/src/sign-release.html`: the five occurrences of the product name (title, h1, the load error "that does not look like a Civicsmith private key", the development-key note "When Civicsmith goes to real groups", and the header comment) now read Civicsmith; wire formats unchanged (`BIOKEY-RAW1.`/`BIOKEY1.`, `bio-release`/`bio-ratify`/`bio-working-on`/`bio-docket`, `bio-signing-keys.txt`). `bio-plane/src/signpage.mjs` re-rendered with `node scripts/embed-signpage.mjs` (R30 holds). `bio-plane/src/sshsig.mjs`:6, a comment, "no BIO code" → "no Civicsmith code" (consistency only; no behaviour).

**Tests** · `signatures.test.mjs` R32 (first test) rewritten for the new name and made total: the whole page carries no "CivicOS" (comments included) and no word BIO; the markup a person reads names the product exactly twice, both Civicsmith (title, heading); the load error, the key status lines, the generate output and the forget message, as the script writes them, carry neither BIO nor CivicOS; wire formats as before. The second R32 test (record, never a bundle) unchanged and green.

**Deferred** · none.

**Found elsewhere** · `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, BOB's at the close, manifest) now holds the stale `SIGN_HTML` with the old name; regenerate at the layer close. No other module's test names the page's strings (`git grep`).

**Runs** · `node --test test/m/signatures/` (from `bio-plane/`): tests 72, pass 72, fail 0, skipped 0. Checks: `format: 98 modules, 97 requirements files; 0 failures`; `architecture: 8 product files, 7 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 41 of 41 live requirement ids named by a test; 0 failures`; ownership re-run after the commit (below). R32's `*(not yet met: T31)*` mark is in `build/requirements/signatures.md`, BOB's to strike.

Size (session_01JojTP81KLXqohStkarosgE): test runs 2, module lines 1329
