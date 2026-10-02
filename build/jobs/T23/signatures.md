# signatures (T23)

**Status** · session_01DPXkTEEtaiwXbkr5PTZn6f · depth 2 · COMPLETE · handled B2

## Entries applied

- **N486, R1** (amended to four): `NS_NOTICE` joins `NS_RELEASE`, `NS_RATIFY`, `NS_FLEET`; the four are compiled constants, pairwise distinct (`bio-plane/src/sshsig.mjs`).
- **N486, R37**: `NS_NOTICE = "bio-working-on"`. The offline signer page (`src/sign-release.html`, rendered to `src/signpage.mjs` by `scripts/embed-signpage.mjs`) gains a "Sign a notice" tab: notice id, revision and hash, signed with the ratification key (the member's attesting key, which network-notices R5 checks against `credentials.attestingKeys()`) in `bio-working-on`, over exactly `noticeStatement`'s bytes; it refuses, signing nothing, wherever `noticeStatement` would throw. The page's header comment states the namespace.
- **N486, R38**: `noticeStatement(noticeId, revision, sha)` returns `` `bio-working-on ${noticeId} ${revision} ${sha}\n` `` and throws (`Error`, "noticeStatement: …") on an id not matching K1115's opaque-id pattern, a revision that is not a safe integer of at least 1 (a string such as `"1"` is not a whole number and throws), or a sha that is not 64 lowercase hex. J1's question, answered by B2 (K1115); `tranche/T23` merged.

## Deferred

- **R37's "browser signer"**: no in-app (browser) signer exists in code today. `civicos-ui/app.html` signs nothing (it holds no `crypto.subtle.sign`, no SSHSIG builder); the only browser signer this product has is the signer page above, which is served by the plane (`SIGN_HTML`) and also opened offline, and it now signs in `NS_NOTICE`. A member-facing notice ceremony in the UI is legacy-ui's and the UX design stream's (Bob's: UX). Reported in J2.

## Found in other modules (REPORT J2)

- **bundler / plane bundle (generated artifact, §14)**: my change edits two inputs of `bio-plane/dist/bio-plane.bundled.mjs`, `src/sshsig.mjs` and `src/signpage.mjs`; `test/system/fleetbundles.test.mjs` names both STALE (the D-298 arm, byte identity, the manifest's sha256 and the comment-only arm). Not regenerated (B1): BOB's at the layer close.
- **installer bundle**: `newgroup/dist/newgroup.bundled.mjs` takes `sshsig.mjs` as an input; `newgroup-bundle-fresh.test.mjs` still passes (the new exports are unused there and tree-shaken).
- **bundler's tests leave a written artifact**: running bundler's test set together (`test/m/bundler/`, the four `test/system/` files, `fleetbundles.control.mjs`, `newgroup-bundle-fresh.test.mjs`, in one `node --test`) left `bio-plane/dist/bio-plane.bundle.json` and `.bundled.mjs` modified in the working tree; I restored both from HEAD and committed neither. A lone `fleetbundles.test.mjs` run leaves the tree clean. Against `build/manifest.md` ("verification never writes"), one of those tests writes the committed artifact; not traced to which.

## Tests and checks

- `node --test bio-plane/test/m/signatures/`: tests 62, pass 62, fail 0, skipped 0 (ssh-keygen and openssl present).
- `node --test bio-plane/test/m/` (whole): tests 5014, pass 4998, fail 4, skipped 0. The four reds are accepted by name: membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58 (accepted red 2) and control-plane `inbox-door.test.mjs`:81 (accepted red 9).
- bundler's tests: tests 51, pass 50, fail 1: `test/system/fleetbundles.test.mjs`, the plane bundle staled by this change (above); it passes on `tranche/T23` without my change. `newgroup-bundle-fresh.test.mjs`: 1 pass.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `node checks/architecture.mjs … signatures`: 8 product files, 7 relative imports; 0 failures.
- `node checks/coverage.mjs … signatures`: 38 of 38 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … signatures tranche/T23`: 5 files changed; 0 failures.

Size (session_01DPXkTEEtaiwXbkr5PTZn6f): test runs 9, module lines 1239

## J1 · QUESTION

R38: "throws when `noticeId` is not an opaque id". No module states the opaque-id grammar as a pattern (record-grammar R1 states only BUNDLE_ID_RE; record-core R6 states the minter's output `<prefix>-<year>-DDDD<tail>`), and network-notices' prefix for a notice id is not named. signatures uses nothing, so it cannot import one.

My best reading, which I am building on: an opaque id is record-core R6's shape, `<PREFIX>-<4 digits>-<4 digits>` with an optional `-<slug>` tail (the tails in use today: none, or `-<slug>` as TASK and PROJ mint), PREFIX upper-case letters; that is `^[A-Z]+-\d{4}-\d{4}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$`. Any prefix is accepted, so network-notices picks its own (e.g. `NOTE`). Anything else (spaces, a newline, lower-case prefix, wrong digit counts, a non-string) throws. If you or network-notices fix a prefix, or forbid the tail, say so and I narrow the check.

## J2 · REPORT

1. Generated artifact staled: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`). My change edits two of its inputs, `bio-plane/src/sshsig.mjs` and `bio-plane/src/signpage.mjs` (R37 needed the signer page to change); `test/system/fleetbundles.test.mjs` names both STALE. Not regenerated (B1). The installer bundle `newgroup/dist/newgroup.bundled.mjs` also takes `sshsig.mjs` as input, but `newgroup-bundle-fresh.test.mjs` still passes (the new exports are tree-shaken out).
2. R37's "browser signer": no in-app browser signer exists in code (`civicos-ui/app.html` signs nothing). The signer page, served by the plane as `SIGN_HTML` and opened offline, now signs notices in `bio-working-on` with the ratification key. Any notice-signing step in the member UI is legacy-ui's and the UX stream's (Bob's: UX), not this module's.
3. bundler's tests: running its test set in one `node --test` left `bio-plane/dist/bio-plane.bundle.json` and `.bundled.mjs` modified in the working tree (restored from HEAD; nothing committed). A lone `fleetbundles.test.mjs` run leaves the tree clean. One of those tests seems to write the committed artifact, against the manifest's "verification never writes"; I did not trace which.

## J3 · COMPLETE

Complete. R1 (four namespaces), R37 (`NS_NOTICE` "bio-working-on"; the signer page's "Sign a notice" tab) and R38 (`noticeStatement`, with K1115's opaque-id pattern) applied on `job/T23/signatures`. `bio-plane/test/m/signatures/` 62/62, no skips; whole `bio-plane/test/m` 4998 pass, 4 fail, all accepted by name (red 2's three, red 9's inbox-door); bundler's set 50/51, the one red `fleetbundles.test.mjs` = the plane bundle staled by this change (J2). format, architecture, coverage (38/38) and ownership: 0 failures. Details in my record.
