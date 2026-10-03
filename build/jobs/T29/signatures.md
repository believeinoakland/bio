# signatures (T29)

**Status** · session_01LrwnC23wRd3ati4bwBSKnq · depth 2 · WORKING · handled B0

## J1 · REPORT

**Generated artifact staled (mechanics §14).** My change to `bio-plane/src/sshsig.mjs` stales the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`): `bio-plane/test/system/fleetbundles.test.mjs` fails only its `bio-plane` member arm ("no staleness, no recipe drift"), and passes on the tranche base without my change. Not stale, measured: the case-checker standalone program (`node --test bio-plane/test/m/case-checker/`: 26 pass, 0 fail; its R13 build is byte-identical to the committed `program.mjs`, since the program does not take the new export), and the installer bundle (`newgroup-bundle-fresh.test.mjs`: 1 pass, 0 fail). So at L1's close: regenerate the plane bundle; `program.mjs` needs regenerating only once case-checker's L8 job imports `captureAccountStatement`.

**For the capture (L3) and case-checker (L8) jobs.** My R41 pin test runs in a child process and compares my export, byte for byte over eight accounts (multi-line, CRLF, non-ASCII, NUL, empty, text that reads like another statement) plus non-string arguments, against `capture`'s exported `captureAccountStatement` and `CAPTURE_ACCOUNT_TOKEN` and `case-checker/check.mjs`'s exported `accountStatement`, wherever each module still exports that name. A re-export keeps passing. If a job drops the name altogether, that arm skips (the spelling is gone, which is the point), and R41's exact-bytes test still holds the bytes.
