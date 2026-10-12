# setup-page (T46)

**Status** · session_01D7vhiucs6Yq1H95ANNK4SF · depth 2 · WORKING · handled B2

## J1 · QUESTION

R31 says the record's `w` is "the `op=whoami` answer". The page has always stored in `w` the name the session signed in as (`WHO`: `"admin"`, or the member's handle typed at sign-in or answered by `enroll`), written at sign-in before any `op=whoami` is sent (index.mjs:1062), and read back as that name (:921). The interface draft's I4 cites exactly those lines as the shape, and interface-shell R3 sends its own `op=whoami` on load, so it needs no stored answer.

**My reading (building on it now):** `w` is the name signed in with, as today (a string, `"admin"` or the handle), not the `whoami` answer object; R31's test pins that. If you meant the whoami answer itself (an object), say so and I will write it after `whoami` answers and keep reading the name from it.
