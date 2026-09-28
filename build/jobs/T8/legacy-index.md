# legacy-index (T8)

**Status** · session_015DvrjDEhNepRfGzr6F7u2A · depth 2 · RUNNING until 2026-09-28T11:57:39Z (the old battery on this branch and on the tranche tip (after K263)) · handled B3

## J1 · REPORT

The op table I am routing in `index.mjs` (layer 11), so affordances can key its `NON_ACTS`/rung rows to the same names now. Escalation exports no ops map, so its op names are mine (below); legacy-store's N216 job reads them.

Every op below: classes `admin, member, probe` (`conclude`'s cut: a machine reaches it and the module refuses it by name), `viewer` stamped in the URL from the session (fail-closed viewer list). Every mutating op: in both `SESSION_OPS` sets, `NEEDS` `contribute` (no requirement names a capability; `actioncorrespond`'s and the version acts' reason, no fifth token). Reads carry no `NEEDS` row (K153).

The act stamp is the positional identity, intent's expression: a session `member:<id>` (the founder `member:admin`), an `ai` key `class:ai/<tokenId>`, any other credential `class:<cls>`. Bare ids are not used: `membership.projectAuthority` reads a bare id as DENY and lets the act through, so the identity form is what makes the modules' joined-participant fences hold.

- standards (body stamps; `viewer` in URL): `standarddeclare` (mut, `author`), `standardpropose` (mut, `proposer`), `standardadopt` (mut, `author`); reads `standard`, `standards`, `standardinforce`.
- conformance (`author` in URL): `determine`, `comparisonpropose` (mut); reads `determination`, `determinations`, `comparison`.
- consequences (`author` in URL): `consequencerecord`, `consequencerevise`, `addressedrecord` (mut); reads `consequence`, `consequencesof`, `addressed`.
- filings (`author` in URL): `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketexport`, `theorypropose` (mut); reads `counselpacketread`, `filingsfor`, `availableactions`.
- escalation (`author` in URL, `viewer` in URL; op names chosen here): `escalationopen`, `escalationattach`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationend`, `escalationsuspend`, `escalationresume` (mut); reads `escalation` (`escalationRead`) and `escalationsdue` (`escalationsDue`).
- actions: `actionriskpropose` (mut, `actionlawspropose`'s cut and its `proposer` expression in the URL).
- monitoring: `monitoring` (read, `driveshells`' cut, `viewer` in URL).

Until N216 (T9) the durable object dispatches none of the layer-9 modules' ops, so those routes answer the store's `unknown op` for now (K250); `actionriskpropose` and `monitoring` are dispatched today. N93 is already applied in the code (`memberpairings` stamps `viewer` and `administer`); I only test it. Next: N177 (build against affordances' R11 `decorate`, already on the tranche), N80, then the routes.

## J2 · QUESTION

**Routing layer 9 before N216 puts 34 ops on the wire with a codeless refusal (D-495's class).** Until legacy-store constructs the modules (N216, T9), the durable object answers each of the 34 layer-9 ops `{ok:false, error:"unknown op: <op>"}` (400), and the plane's generic forward carries that through with no `code`, `check` or `translation`. `refusal-wire.test.mjs` names them: 37/5 on the tip, 35/7 here. Its two added reds are its pinned-empty sets of codeless answers, which now list the 34 ops. `actionriskpropose` and `monitoring` are dispatched today and are not in that set.

Three ways to take it:
(a) **My best reading, and what I am building:** route them now as the bullet and K250 say. The codeless answer lasts only until N216, and legacy-tests names the 34 as pending N216 in refusal-wire rather than leaving the pin red.
(b) The plane answers a store that does not dispatch a routed op with a coded refusal. That needs a new `DISPATCH_CHECKS` row (for example `OP_NOT_DISPATCHED`) in legacy-checks, which is not mine. With the row in place, I would add the site in the forward.
(c) Leave the 34 out of `OPS` until N216, so each answers the plane's coded `UNKNOWN_OP`. That goes against K250.

I am carrying on with (a). The answer does not change anything else I build.
