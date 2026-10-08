# capture-requests (T37)

**Status** · session_01UfHSTpAjFzV8dzVbcaskFH · depth 2 · COMPLETE · handled B1

## Completion (T37-47)

**Entry applied.** T37-47 (test only), in `bio-plane/test/m/capture-requests/plane.test.mjs`:
- `call` sends the credential as `Authorization: Bearer …`, never in the address (admission R20, C-38.10; as K2182 read membership's).
- Every use of the retired shared member token `mem-cr` (admission R5, C-38.11) is now an enrolled member's session: `mel`, role `member`, with `contribute`. It is admitted to `capturerequest` and `capturerequests` and kept out of `capturerequestdrain`. `nocon` still tests a member without `contribute`.
- **Reading (re-pinned, not loosened).** The old test checked "the member class" on the drain with the shared token and got `CLASS_FORBIDDEN`. A member's session is now refused earlier, by the unattended-path gate: 403 `MACHINE_CREDENTIAL_REQUIRED` (C-38.3). The arm now pins that exact answer for the member-role session and for Ruth's admin-role session, and asserts nothing was drained (no `configured` or `drained` in the answer). R30 ("no member class") holds either way. The new arm is stricter than Ruth's old bare 403.
- **Found and fixed (own flaw).** `world()` minted the ai credential without checking the result. While the mint is refused, `AI` was `undefined`, and R30's ai arm ran with no credential at all, so it could pass for the wrong reason. The mint now runs in the R30 test and is asserted. The other four tests no longer depend on it.

**State at merge, and after T37-33.** Four of the five tests pass now: :129 (R16 R31 R14), :154 (R19 R42 R38), :175 (R14 N295) and :187 (R48). R30 (:108) fails only at the mint, `AI_CREDENTIAL_NO_SECRET` (C-29.33): this is red 15's remaining part, waiting on T37-33. To check, I ran a throwaway copy that skips only the mint and the ai arm: all 5 passed, so once T37-33 lands, R30 should pass too.

**Reading.** Read whole myself: `build/requirements/capture-requests.md`, layer 6's row of `build/layers.md`, `plane.test.mjs`, K2166, K2182, K2189 and census rows 30–34, and plan lines 42 and 107. I read admission's C-38.10 and C-38.11 behaviour from the plane's own answers. I did not read the used modules' services, because this entry touches only the test's transport and principals. A worker read the rest of the module's code and tests in full: 12 files, 348,257 bytes. Its summary (about 1,500 words) cites file:line throughout. It found no other test in this module that sends a credential in the address, uses `MEMBER_TOKEN`, or runs Miniflare: they all call the module in process with control-plane stamps. It found nothing it left out that mattered.

**Deferred.** None. **Found in other modules.** None.

**Tests and checks.**
- `node --test test/m/capture-requests/`: tests 103, pass 102, fail 1 (R30 at the mint, as above).
- format: 136 modules, 135 requirements files; 0 failures.
- architecture: 13 product files, 47 relative imports; 0 failures.
- coverage: 54 of 54 live requirement ids named by a test; 0 failures.
- ownership: 1 file changed; 0 failures.

Size (session_01UfHSTpAjFzV8dzVbcaskFH): test runs 7, module lines 0 (test lines +25 −10)

## J1 · COMPLETE

T37-47 applied (test only, plane.test.mjs). Changes: credential sent in the Authorization header; mem-cr replaced by enrolled member sessions; the drain's member-class arm re-pinned to the session's 403 MACHINE_CREDENTIAL_REQUIRED (C-38.3) with nothing drained; the ai mint moved into the R30 test and asserted, since an unchecked failed mint left AI undefined and its arm could pass for the wrong reason. Results: 4 of 5 pass now. R30 (:108) fails only at the mint (AI_CREDENTIAL_NO_SECRET, T37-33). With the mint skipped, a throwaway run passed 5/5. Module suite: 102/1. format, architecture, coverage and ownership: 0 failures. Details are in the record.
