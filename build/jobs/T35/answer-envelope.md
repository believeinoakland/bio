# answer-envelope (T35)

**Status** · session_017eKYzzg1hrdp8PcUr1pMS3 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, both carried on unless you answer otherwise.

(1) `uses` edge. R6's test drives `withPagePolicy` over both pages the plane serves as HTML: the setup page (`setupPage`, through `instance-setup`'s `src/setup.mjs`, already in my uses) and the signer page (`SIGN_HTML`, `src/signpage.mjs`, owned by `signatures`, not in my uses). My best reading: add `signatures` to answer-envelope's `uses` (layer 1, earlier; a test-only import). Until you add it, the architecture check names that one import.

(2) Where R6's route-level test lives. R6 says "a test fetches each HTML route twice". The routes (`/sign`, `/`) are `control-plane`'s `makeFetch`, a later module my tests cannot import; until T35-72 it calls its own `withPagePolicy`. My reading: my tests check R6 in full at my interface (`withPagePolicy` over each served page's real bytes, twice: two different nonces, a `script-src` of `'nonce-<n>'` alone with no other source, every `<script>` of each body carrying its response's nonce, no other origin anywhere in the policy, non-HTML untouched), and the door-level fetch-twice arm is control-plane's in T35-72 once its door calls this module's `withPagePolicy`. The same holds for the door-driven cases of `envelope.test.mjs` (R21–R25 through `makeFetch`): I test R1–R5 at this module's functions and leave those cases to control-plane's job to keep, re-name or delete; I delete nothing of control-plane's.
