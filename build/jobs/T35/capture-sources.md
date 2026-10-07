# capture-sources (T35)

**Status** · session_012S54aktJ3qphu84YRvZEBV · depth 2 · WORKING · handled B0

## J1 · QUESTION

R22 and R64 meet at one point in the in-plane driver; my reading, which I am building on:

R22 says `requests` is `null` "when its domain would not enable". R64 says the render fails by name when the browser will not hold its requests. The WebSocket half of the hold is `Network.setBlockedURLs` (`ws://*`, `wss://*`), and Chromium applies blocked URLs only through an enabled network agent (the agent joins the instrumenting set in `Network.enable`), so with the network domain refused, sockets would go unguarded and the command would not even report it. My reading: in R19's driver a network domain that will not enable is a hold that cannot be enabled, so the render fails by name before any navigation ("the browser would not hold this render's requests (its network domain would not enable: …), so nothing was rendered"), and `requests: null` is no longer answered by this driver. R22's `null` stays true of the answer shape (R11, R12 still read it from any renderer, e.g. a service). The R22 test's arm for a refused `Network.enable` now asserts R64's failure and that `Page.navigate` was never sent; the `Debugger` arm (`scripts: null`) is unchanged.

If you want R22's wording to say so, it would read: "Either is `null` when its domain would not enable, except that a network domain that will not enable fails the render under R64."

## J2 · REPORT

Another module's test pins a string this job re-worded (DEC-149, `memento.mjs`:256): `bio-plane/test/m/acquisition/memento.test.mjs`:35 expects the memento hop's evidence to contain `computed by this instance over the bytes it received`; it now reads `computed by your group's Civicsmith over the bytes it received` (capture-sources R37 (9)). From this job's merge until acquisition's (T35-21, next in L3's order), that arm is red; ACQUISITION #12's job re-pins it. I am running every user module's tests now and will list any other such pin in my COMPLETE.
