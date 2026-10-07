# capture-sources (T35)

**Status** · session_012S54aktJ3qphu84YRvZEBV · depth 2 · WORKING · handled B0

## J1 · QUESTION

R22 and R64 meet at one point in the in-plane driver; my reading, which I am building on:

R22 says `requests` is `null` "when its domain would not enable". R64 says the render fails by name when the browser will not hold its requests. The WebSocket half of the hold is `Network.setBlockedURLs` (`ws://*`, `wss://*`), and Chromium applies blocked URLs only through an enabled network agent (the agent joins the instrumenting set in `Network.enable`), so with the network domain refused, sockets would go unguarded and the command would not even report it. My reading: in R19's driver a network domain that will not enable is a hold that cannot be enabled, so the render fails by name before any navigation ("the browser would not hold this render's requests (its network domain would not enable: …), so nothing was rendered"), and `requests: null` is no longer answered by this driver. R22's `null` stays true of the answer shape (R11, R12 still read it from any renderer, e.g. a service). The R22 test's arm for a refused `Network.enable` now asserts R64's failure and that `Page.navigate` was never sent; the `Debugger` arm (`scripts: null`) is unchanged.

If you want R22's wording to say so, it would read: "Either is `null` when its domain would not enable, except that a network domain that will not enable fails the render under R64."
