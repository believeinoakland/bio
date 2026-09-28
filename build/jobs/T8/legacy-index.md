# legacy-index (T8)

**Status** · session_015DvrjDEhNepRfGzr6F7u2A · depth 2 · COMPLETE · handled B3

**Job** · LEGACY-INDEX #5, session `session_015DvrjDEhNepRfGzr6F7u2A`, branch `job/T8/legacy-index`, the legacy-index bullet of layer 11 (`build/plan/current.md`). This is a legacy module, with no requirements file and no `tests` path. Its contract is the bullet and the Provides of the modules whose ops it routes. BOB's B2 (K262) and B3 (K263) are applied.

**Read whole:** `roles/JOB.md`, `build/manifest.md`, `build/plan/current.md` and the layer-11 bullet's `N` entries in `next.md`, `bio-plane/src/index.mjs` (6,928 lines at the base), and the op maps and stamp readers of standards, conformance, consequences, filings, escalation (its map §4), actions (`actionsOps`, R28) and monitoring (`monitoringOps`, R32). Also read: capture's `ACQUIRE_GRADE_NOTE`, affordances R11 and R12, membership's `projectAuthority` and `viewerPredicate`, and the earlier T8 records' REPORTs naming legacy-index.

## Entries applied

- **Layers 8–10's routes (N43's pattern).**
  - Layer 8's routes were already moved by its own jobs (publication, ratification, review; nothing left for layer 11).
  - `op=actionriskpropose` (actions R28, ACTIONS #1 J2.5): OPS row with `actionlawspropose`'s class cut, in both `SESSION_OPS` sets, `NEEDS` `contribute`, viewer-stamped. `proposer` is stamped in the URL by `actionlawspropose`'s own expression: a session its member id, an `ai` key `class:ai/<tokenId>`, any other credential `class:<cls>`. A caller's copy is overwritten.
  - `op=monitoring` (monitoring R32, MONITORING #1 J3.6): a read with `driveshells`' cut and `viewer` stamped in the URL. It reaches the DO route `monitoring`, which `monitoringOps` serves today.
- **Layer 9's 34 ops: not routed, by K263.** The durable object does not dispatch them until N216 (T9), and a route to an undispatched op would put a codeless refusal on the wire (D-495). Each therefore answers the plane's coded `UNKNOWN_OP` (C-69.1). Their route table, as built and then withdrawn (built in `7a4bbdb7ea`, withdrawn in `09008ee746`), is below for T9's legacy-store job.
- **N177:** `decorateAct` is now affordances' `decorate(act, gate)` (R11). The gate `ACT_GATE = {needs: NEEDS[op] ?? null, mode: session | admin-session | machine from SESSION_OPS}` is built once at module level (K262). It is used by `op=affordances` (catalogue, acts, capture acts, set acts) and by `op=queue`'s options. `RUNGS` and `RUNG_ABSENT` are no longer imported here. The `op=affordances` catalogue is byte-identical to the tranche tip's (14,707 B, compared).
- **N80:** `op=acquire`'s `note` is capture's `ACQUIRE_GRADE_NOTE`, imported from `./capture/index.mjs`, no longer affordances'. The value is identical (checked equal).
- **N93:** already applied (LEGACY-INDEX #3, T5): `op=memberpairings` is in the viewer-stamped list and takes `memberlist`'s `administer` stamp. Nothing changed; driven below.

## Layer 9's route table (K263: for T9's legacy-store job, with N216's construction)

K262 accepted this table. Every op: classes `admin, member, probe`, and `viewer` stamped in the URL (the fail-closed viewer list). Every mutating op: in both `SESSION_OPS` sets, `NEEDS` `contribute`. Reads carry no `NEEDS` row.

The act stamp is the positional identity: a session `member:<id>` (the founder `member:admin`), an `ai` key `class:ai/<tokenId>`, any other credential `class:<cls>`. A bare id must not be used: `membership.projectAuthority` reads it through `viewerPredicate` as DENY and proceeds, so the modules' joined-participant fences would not hold.

| module | acts (mutating) | stamp | reads |
|---|---|---|---|
| standards | `standarddeclare`, `standardadopt` (`author`); `standardpropose` (`proposer`) | in the POST body; the caller's `author` and `proposer` deleted first, and an empty body stamped | `standard`, `standards`, `standardinforce` |
| conformance | `determine`, `comparisonpropose` | `author` in the URL (`comparisonpropose` reads it as `proposer`) | `determination`, `determinations`, `comparison` |
| consequences | `consequencerecord`, `consequencerevise`, `addressedrecord` | `author` in the URL | `consequence`, `consequencesof`, `addressed` |
| filings | `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketexport`, `theorypropose` | `author` in the URL | `counselpacketread`, `filingsfor`, `availableactions` |
| escalation (op names chosen here, K262) | `escalationopen`, `escalationattach`, `escalationevaluate`, `escalationadvance`, `escalationdecline`, `escalationend`, `escalationsuspend`, `escalationresume` | `author` in the URL; the DO's op map reads `author` and `viewer` from the query | `escalation` (`escalationRead`), `escalationsdue` (`escalationsDue`) |

The built code is commit `7a4bbdb7ea`, withdrawn by `09008ee746` (the stamp blocks, the OPS rows, the arrays spread per module into `SESSION_OPS`, since the old battery's source parsers follow one level of spread, and the viewer list). The old battery also needs affordances' rows for these ops and legacy-tests' re-pins (rung-ladder's exact mutating count, gate-reads' classification).

## Deferred

Nothing in my module.

## Found in other modules (REPORT)

1. **affordances:** `actionriskpropose` needs a rung or a stated absence (`rung-ladder` FORWARD, 43/6 here against 47/2 on the tip, with its exact count 146 against 145) and a `NON_ACTS` row or published act. `monitoring` needs a `NON_ACTS` row or a published act (K225 (3)).
2. **legacy-tests (N177's share):** `rung-ladder`'s two source scans of `decorateAct` (`rung_absence: RUNG_ABSENT[a.id]…` and the `RUNG_ABSENT` import) and `affordances.test.mjs`' `capture_acts: CAPTURE_ACTS.map(decorate)` scan read source that N177 removes. They retire for `unaccounted` (R12). `skillpack` A10 still passes: the gate spells `"machine"` beside `decorateAct`.
3. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product; `fleetbundles` 92/4 here, 96/0 on the tip) is stale from `index.mjs`, for BOB to regenerate at the layer close (§14).
4. **legacy-store (N216, T9):** the route table above, and its own dispatch of the escalation op names it picks up.

## Tests and checks

No `tests` path (legacy). Measured on this branch (tranche merged, @ `48beaca6b0`) against the tranche tip (`bcf7d44e20`), same machine:

- **A scratch driver through the whole plane in Miniflare** (not committed). Its durable object echoes what it received for a request carrying `echo=1`. **55 pass, 0 fail here; 42 pass, 13 fail on the tip.** It covers:
  - each of the 34 layer-9 ops answering a member session the coded `UNKNOWN_OP`;
  - `actionriskpropose`'s and `monitoring`'s stamps from a member, the founder, an enrolled administrator, the admin bearer and an `ai` key (a caller's `proposer` and `viewer` overwritten);
  - a view-only member refused `NOT_CAPABLE` (`contribute`) on `actionriskpropose` and admitted to `monitoring`;
  - both answering from their modules;
  - N93's `viewer` and `administer` stamps for four callers;
  - N177's decorated `publish` and `attest`.
- **The whole old battery**, 369 suites, four at a time, on both trees: **87 red here, 86 on the tip.** Only two suites differ: `fleetbundles` (REPORT 3) and `rung-ladder` (REPORTs 1–2). Before K263, `capability`, `d270-refusal-truth` and `refusal-wire` also moved; K263's removal returned them to the tip's counts (63/0, 36/0, 37/5).
- No layer tests (manifest).
- Checks (civicos-process `main`, after the commit): see J3.

Size (session_015DvrjDEhNepRfGzr6F7u2A): test runs 790, module lines 6,926 (`index.mjs`)

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
