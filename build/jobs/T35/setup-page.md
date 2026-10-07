# setup-page (T35)

**Status** · session_01UzzxoFjhwa51UKHYQCBUUs · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied (T35-68; K1867, K1874, K1881, K1888, K1943; B2 = K2038).** Code `bio-plane/src/setup-page/index.mjs` 2,115 → 2,375 lines.
- R26 (F1): every request under a session carries the token only in `Authorization: Bearer` (`auth()`): the load probe (`op=stats`, was `:755`), every read (`rec`) and every act (`post`, was `:1137`). No query, body or link carries it. A captured file's download (was the `:1032` link) is now a button. It fetches `op=capture` with the header and hands the bytes to the browser as a `Blob` behind an object address, released once the download starts (`downloadCapture`, `saveFile`). A refusal is stated, and a `401` signs the page out (`signedOut`, one place).
- R27 (F10): the guide is a section of the page, `s-rotate`, with the plain steps, when to do it and what does not change. It has no field and reads nothing; the hosting provider's sign-in is a link. It opens from any link to the exported `ROTATION_GUIDE_HREF` (`#replace-one-time-password`) through `hashchange` or on load: from R14's block (instance-setup writes that link, B2) and from members and keys. Its fragment is stripped, and Back returns to where the reader was.
- R14: the slot is unchanged. A link to the guide placed in it opens the guide (test `guide.test.mjs`).
- R28 (F17): the one script element carries `nonce="${NONCE_SLOT}"`. `NONCE_SLOT` is `__CSP_NONCE__` and is exported. The page has no inline handler, no `javascript:` address and no script made from a string.
- R29 (K1888): at the claim, once signed in and before R15–R18, the page posts `op=recoverycodesissue` and shows the ten codes once, with what they are for. The codes are held only in `CODES`, never in storage, an address, a log or a later request, and are forgotten when the section is left (`show` → `forgetCodes`). They can be copied as text or saved as `recovery-codes.txt`, a file made in the browser. A refusal is stated and the section goes on. Members and keys shows `op=recoverycodesstate` (never a code) and offers issuing again, saying it spends the earlier codes.
- R16 (K1888, K1943): the claim now asks for a second administrator, with why (the reasons now include each administrator holding codes of their own) and the dependence statement. It offers the act there: `op=memberadd` `{memberId, cover, role: "admin"}`, the invitation shown once, membership's refusal stated. Members and keys shows instance-setup's step (`op=adminrecoverystep`) while it is not met: the count, whether codes are held, and the acts (add an administrator, issue codes). Once met it shows nothing; unanswered, it says so and offers nothing. Nothing is gated.
- R20 (N699): the offices section lists every office from `op=entitieskind` `{kind: "office"}`, following `next` until `null`, for every signed-in member. An office is marked added by the group when its `declared_by` is a member: not absent and not a machine by record-grammar's rule (its R15 vocabulary, injected). An unanswered read says "could not be read", never "no offices". With none, the section says why nothing is filled in and names R19's place. An administrator may add an office in either case, and the list is read again after.
- My own flaw fixed: the record browser threw on a `list` answer that was not a list; it now says the record could not be read.

**Deferred.** Nothing.

**Found in other modules, and generated artifacts made stale.**
- Red 35 (K2038) clears at control-plane's merge (T35-72), not admission's. The door must pass `presentedCredential` to `admit`, and admission's own J2 says the same. Measured: with `job/T35/admission` merged locally the four arms still fail. Over the tranche, with a local uncommitted shim that moves the header into the query (a door that reads it), all 11 worker-page tests pass: the page's flows are sound once the session reaches the plane. With admission merged and no control-plane change, sessions answer 401 even from the query. That is admission J2's store-door hand-over (T35-81), not this module's.
- Until control-plane routes the recovery ops (T35-72), the real plane answers `op=recoverycodesissue` 400. The page states the refusal and goes on, as R29 says.
- Stale generated artifacts (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`), `newgroup/dist/newgroup.bundled.mjs` (`installer`) and `newgroup/src/release.mjs` each embed this page. Regenerate them at layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/setup-page/`: `ℹ tests 71`, `ℹ pass 67`, `ℹ fail 4`. The four are red 35, accepted by name in K2038 (worker-page's R7 R5 chooser, R5 R7 driven, R5 question, R13 end to end). New files: `session.test.mjs` (R26), `guide.test.mjs` (R27, R14), `nonce.test.mjs` (R28). R29 and R16 are in `claim.test.mjs`, R20 in `settings.test.mjs`.
- `worker-page.test.mjs` with the local header shim (not committed): `ℹ tests 11`, `ℹ pass 11`, `ℹ fail 0`.
- Users of setup-page: `node --test bio-plane/test/m/instance-setup/`: `ℹ tests 99`, `ℹ pass 99`, `ℹ fail 0`.
- `node checks/format.mjs`: `format: 133 modules, 132 requirements files; 0 failures`.
- `node checks/architecture.mjs … setup-page`: `architecture: 13 product files, 41 relative imports (3 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs … setup-page`: `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs … setup-page tranche/T35`: `ownership: 12 files changed by setup-page between tranche/T35 and HEAD; 0 failures`.

Size (session_01UzzxoFjhwa51UKHYQCBUUs): test runs 21, module lines 2375

## J1 · QUESTION

Two readings, each carried on while the answer comes; neither stops the job.

(1) R26 against the L11 merge order. setup-page merges before admission (T35-71), but until admission's R20 the plane reads a session only from the query (no `Authorization` read anywhere in admission, control-plane or plane on `tranche/T35`). With R26 met the page sends the session only as `Authorization: Bearer`, so between my merge and admission's every signed-in request the real Worker serves the page is answered 401 and the page signs out: `test/m/setup-page/worker-page.test.mjs`'s founder-driven arms (R7 R5 chooser, R5 R7 driven, R5 question, R13 end to end) go red, and a page deployed from that state would sign everyone out. My best reading: BOB merges setup-page after admission (the plan's own rule, "admission reads the header before its callers send it"), or accepts those four arms red by name from my merge until admission's. I build to R26 either way, and I will run those arms with `job/T35/admission` merged locally (not committed) to show they pass once the header is read, and say so in my record.

(2) R28's "a test serves the page through the door". The door's half (a fresh nonce per response, the policy naming it) is answer-envelope R6, T35-80, after me. My reading: my test fills `NONCE_SLOT` exactly as the door is to (a fresh 128-bit nonce per response, `script-src 'nonce-<n>'`), and finds every `<script>` element carrying that nonce and no inline handler, `javascript:` address or string-made script; the fetch through the real door is answer-envelope R6's test. The slot is the literal `__CSP_NONCE__` in each script element's `nonce` attribute (harmless under today's `'unsafe-inline'` policy until the door fills it). For answer-envelope's START: replace every `NONCE_SLOT` (exported by `setup-page`) in the served body.

Also for instance-setup's START (R47, my R14): R27's guide is reached by a link to `ROTATION_GUIDE_HREF` (exported by `setup-page`, `#replace-one-time-password`); a link to it anywhere on the page, the slot's block included, opens the guide, signed in or out.
