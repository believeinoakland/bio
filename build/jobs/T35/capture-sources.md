# capture-sources (T35)

**Status** · session_012S54aktJ3qphu84YRvZEBV · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R22 and R64 meet at one point in the in-plane driver; my reading, which I am building on:

R22 says `requests` is `null` "when its domain would not enable". R64 says the render fails by name when the browser will not hold its requests. The WebSocket half of the hold is `Network.setBlockedURLs` (`ws://*`, `wss://*`), and Chromium applies blocked URLs only through an enabled network agent (the agent joins the instrumenting set in `Network.enable`), so with the network domain refused, sockets would go unguarded and the command would not even report it. My reading: in R19's driver a network domain that will not enable is a hold that cannot be enabled, so the render fails by name before any navigation ("the browser would not hold this render's requests (its network domain would not enable: …), so nothing was rendered"), and `requests: null` is no longer answered by this driver. R22's `null` stays true of the answer shape (R11, R12 still read it from any renderer, e.g. a service). The R22 test's arm for a refused `Network.enable` now asserts R64's failure and that `Page.navigate` was never sent; the `Debugger` arm (`scripts: null`) is unchanged.

If you want R22's wording to say so, it would read: "Either is `null` when its domain would not enable, except that a network domain that will not enable fails the render under R64."

## J2 · REPORT

Another module's test pins a string this job re-worded (DEC-149, `memento.mjs`:256): `bio-plane/test/m/acquisition/memento.test.mjs`:35 expects the memento hop's evidence to contain `computed by this instance over the bytes it received`; it now reads `computed by your group's Civicsmith over the bytes it received` (capture-sources R37 (9)). From this job's merge until acquisition's (T35-21, next in L3's order), that arm is red; ACQUISITION #12's job re-pins it. I am running every user module's tests now and will list any other such pin in my COMPLETE.

## J3 · COMPLETE

T35-20 is applied on `job/T35/capture-sources` (`8df22460f6`, then this entry). R55 (amended), R64 and R65 are met, so their `*(not yet met: T35)*` marks can go at merge (BOB's).

**Entries applied**
- **F16, R55, R56, R65.** New `bio-plane/src/capture-sources/own-hosts.mjs` with `isOwnHost(host, ownHosts)`: an exact entry, or a `.suffix` entry for every host under it; case, port and a trailing dot are ignored; pure, never throws, false with no list. `credentialsOf(ctx, {ownHosts})` takes the list on any call that passes one, so a caller that reaches the store before `plane` does cannot leave it without the list. R55 refuses `CAPTURE_CREDENTIAL_OWN_HOST` (C-105.12, my number: the next free one in C-105, awaiting T36's stamp) after BAD_HOST and before the scope, and writes nothing. R56 never answers a credential for an own host, including one supplied before the refusal existed; its `reason` names the code. With no list handed in, nothing is refused (fail-open, F16 low, until T35-73).
- **F19, R64.** The driver now holds the page's requests before navigating, with `Fetch.enable` (`*`, at the Request stage) on the page session. `Network.setBlockedURLs` refuses `ws://*` and `wss://*`. `Target.setAutoAttach` (`waitForDebuggerOnStart`) puts the same hold on every frame and worker the page starts; one whose hold will not take is never resumed. Each paused request is either continued, or failed with `BlockedByClient` and listed `blocked` with `NOT_A_PUBLIC_LOCATOR` or `OWN_HOST`. WebSockets are listed `blocked` with `NOT_A_PUBLIC_LOCATOR`, and `data:` and `blob:` addresses are let go. An address that would be refused is refused before a session is opened. A refused navigation or redirect hop fails naming the refused address. If any part of the hold will not enable, the render fails by name before `Page.navigate`. That includes the network domain, my reading in J1: in this driver it replaces R22's `requests: null`. The fake browser in the test now pauses requests as interception does and counts only what was let go. The test drives a literal IPv4, the 169.254.169.254 metadata address, `localhost`, `http:`, an exact own host, a fleet-suffix host, a redirect to an own host, a frame's literal-IP load and two sockets. It asserts each is blocked and never sent, and that R12 counts them (10: NOT_A_PUBLIC_LOCATOR 7, OWN_HOST 3).
- **DEC-149, the 19 rows** (`drive.mjs`:216, :254, :444, :445, :448, :449, :451, :454, :456, :458; `render.mjs`:343, :384, :480; `credentials.mjs`:60, :268, :302, :360, :368; `memento.mjs`:256), as the sweep proposed. Each is named by a test at the interface: `dec149.test.mjs` (14) and `credentials.test.mjs` (5). C-105.8's translation moved and awaits stamp (accepted red 2). R12's text still quotes the old `digest_reason` ("the plane did not keep…"). The wording changes no requirement (rule 4), but that quote is BOB's to update.

**Deferred:** none.

**Found in other modules**
- **acquisition** pins the old memento wording in two tests: `test/m/acquisition/memento.test.mjs`:23 (R32) and `acquire.test.mjs`:78 (R3, R32). Both expect "computed by this instance". J2 named only the first. Both are red from this job's merge until T35-21 re-pins them.
- **acquisition** must pass `own_hosts` in its render request (`acquisition/index.mjs`:1013 builds the request from `RENDER_DEFAULTS`). Until then R64's own-host arm refuses nothing for real renders, though the not-a-public-locator arm does.

**Tests and checks**
- capture-sources `bio-plane/test/m/capture-sources/`: tests 96, pass 96, fail 0.
- User modules' tests: acquisition 86 pass / 2 fail (the two pins above), capture 127 / 0, reading-pipeline 85 / 0, extraction 115 / 6 (inherited red 6), capture-requests 86 / 0, monitoring 121 / 0, control-plane 181 / 1 (`catalogue-end.test.mjs`:15, inherited red 19, C-29.3).
- `format`: 129 modules, 128 requirements files; 0 failures. `architecture`: 23 product files, 31 relative imports (0 naming no tracked file); 0 failures. `coverage`: 65 of 65 live requirement ids named by a test; 0 failures. `ownership`: 14 files changed between tranche/T35 and HEAD; 0 failures.
- No generated artifact was regenerated. The plane bundle embeds these files, so it is stale until L3's close regenerates it (§14).

Size (session_012S54aktJ3qphu84YRvZEBV): test runs 13, module lines 2682
