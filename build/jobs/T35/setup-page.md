# setup-page (T35)

**Status** · session_01UzzxoFjhwa51UKHYQCBUUs · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings, each carried on while the answer comes; neither stops the job.

(1) R26 against the L11 merge order. setup-page merges before admission (T35-71), but until admission's R20 the plane reads a session only from the query (no `Authorization` read anywhere in admission, control-plane or plane on `tranche/T35`). With R26 met the page sends the session only as `Authorization: Bearer`, so between my merge and admission's every signed-in request the real Worker serves the page is answered 401 and the page signs out: `test/m/setup-page/worker-page.test.mjs`'s founder-driven arms (R7 R5 chooser, R5 R7 driven, R5 question, R13 end to end) go red, and a page deployed from that state would sign everyone out. My best reading: BOB merges setup-page after admission (the plan's own rule, "admission reads the header before its callers send it"), or accepts those four arms red by name from my merge until admission's. I build to R26 either way, and I will run those arms with `job/T35/admission` merged locally (not committed) to show they pass once the header is read, and say so in my record.

(2) R28's "a test serves the page through the door". The door's half (a fresh nonce per response, the policy naming it) is answer-envelope R6, T35-80, after me. My reading: my test fills `NONCE_SLOT` exactly as the door is to (a fresh 128-bit nonce per response, `script-src 'nonce-<n>'`), and finds every `<script>` element carrying that nonce and no inline handler, `javascript:` address or string-made script; the fetch through the real door is answer-envelope R6's test. The slot is the literal `__CSP_NONCE__` in each script element's `nonce` attribute (harmless under today's `'unsafe-inline'` policy until the door fills it). For answer-envelope's START: replace every `NONCE_SLOT` (exported by `setup-page`) in the served body.

Also for instance-setup's START (R47, my R14): R27's guide is reached by a link to `ROTATION_GUIDE_HREF` (exported by `setup-page`, `#replace-one-time-password`); a link to it anywhere on the page, the slot's block included, opens the guide, signed in or out.
