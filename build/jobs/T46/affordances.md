# affordances (T46)

**Status** · session_01ALqCxKN9g4DMrH5R7g4DnX · depth 2 · WAITING ON BOB (J4) · handled B3

## J1 · QUESTION

Two readings of R53, each with my best reading; I carry on with these unless you answer otherwise.

1. **`textcheck`.** R53 (and `op-declarations` R51's last paragraph) list `textcheck` among T46's new ops "whose text the file lacks". It does not lack one: `mock-acts.js` @ 3f40899950 line 125 gives `textcheck: 'Asks the assistant to point out sentences that read as a claim of breach, a policy position, an ask for your group, or naming staff. It never rewrites them; you decide.'` (and `words.json` has `act.textcheck.does`). `textcheck` is not declared until T46-51 (merging after me), like `escalationreopen`, which R53 holds under its own text all the same.
   **Best reading:** hold `textcheck` under its own text, as `escalationreopen` is held (R48: every design text is held; R53's "lacks" was a mistaken premise). Then `op-declarations` R51 must **not** name `textcheck` in `ACT_HELP_ABSENT` (R34: no op both explained and absent); that is a requirement change on `op-declarations` (T46-51), yours. The alternative (not holding it, keeping R51 as written) leaves a design text unheld; say if you want that instead.

2. **`handlechange`'s refusal sentence** ("text BOB's"). R53 says the sentence states the refusal "as `membership` R129's row says it". The merged row (`membership` `HANDLE_FIXED`, C-96.52) reads: "Handles don't change in your group's Civicsmith: yours names your work for good, and no one else can ever take it. Nothing was changed."
   **Best reading:** `ACT_HELP.handlechange` is that row's translation, read from `membership`'s catalogue by reference (no copy here, so a re-wording of the row reaches the help too). If you want a separate sentence (e.g. R53's gloss "A handle is chosen when a member joins and is never changed; this act changes nothing."), give me its exact text.

Also noted (no answer needed): the design's `handlechange` text at 3f40899950 still describes a change of handle ("Changes the handle the record shows on your work. Members see your earlier handle beside it, and no one else can ever take it. …"); it is not held, named back to you for the design stream per R53.

## J2 · REPORT

**Totality gap in `op-grades` (R12's tables), found while re-pinning my totality tests; not mine to fix.**

`affordances.unaccounted` over `op-declarations`' own table as it stands on `tranche/T46` (`OPS`, `mutating` from each spec, `gated` = a `NEEDS` row) answers:

```
unpublished: advocacycheck, advocacychecks, bearingdraft, grouprules, infractiondraft
unranked:    advocacycheck
stale:       (none)
```

- `infractiondraft`, `bearingdraft` (`agent-worker` R76's drafts, `NEEDS` null), `advocacycheck` (mutating, `NEEDS` `contribute`) and `advocacychecks` (`case-account` R15) are T45 ops; `grouprules` is `local-facts` R15 (T46-9). None is in `RUNGS`, `RUNG_ABSENT` or `NON_ACTS`, and none is an act here (none is directed at an object's state: drafts and own reads), so each needs `op-grades` rows: `NON_ACTS` for all five and a rung or stated absence for `advocacycheck`. `op-grades` R33 (T46-44) names T46's new ops but none of these. Suggest folding them into T46-44 (or its next entry); my tests that enumerate the owners' op maps (`local-facts`' `grouprules`) stay red on this until `op-grades` grades them.

Not a red of my own making; nothing for my module to change once they are graded.

## J3 · REPORT

**R52 needs two `op-grades` changes for `clockadopt` that R33 (T46-44) does not state; please route them to OP-GRADES while its job is open.**

R52 makes `clockadopt` an `ACTS` row on an action (offered once per standing dated proposal). On `tranche/T46` today `op-grades` holds:
- `NON_ACTS.clockadopt` = "action-directed: keyed by (action, proposal); a new revision of the action's clock" — an act published here is never also a non-act (my R1/R12 tests, R32's rule "where affordances R51 makes them ACTS rows, they leave NON_ACTS");
- no `MACHINE_REFUSALS.clockadopt`, while `action-clocks.clockAdopt` refuses a machine author `MACHINE_CANNOT_ADOPT_CLOCK` first (R20: `MACHINE_REFUSALS` equals, both ways, the acts whose method answers a machine with a `MACHINE_*` code). Without it a machine caller would be offered `clockadopt` and refused (R18).

Asked of `op-grades` (the R33 pattern it already states for `escalationstoppursuing`/`escalationreopen`): `clockadopt` leaves `NON_ACTS`, and `MACHINE_REFUSALS.clockadopt = "MACHINE_CANNOT_ADOPT_CLOCK"`. Its `RUNG_ABSENT` (ground `undetermined`) stands.

Until it lands, my R20 and R1/R12 tests over `clockadopt` are red on `op-grades`' tables alone; I build to the end state and merge `tranche/T46` on op-grades' CHANGE.

Also for the record (R52, my reading, no answer needed unless you differ): `clockadopt` is offered only for a standing proposal **with a date** — `clockAdopt` refuses an undated one `CLOCK_PROPOSAL_UNDETERMINED`, so R18 withholds it; each offered act carries the proposal's key as `proposal` (one decorated act per dated proposal; R11's keys otherwise unchanged).

## J4 · REPORT

**Progress, and the reds left at my side until providers merge.** R52 and R53 (with K2996, K2999) are built and pushed; checks format, architecture, coverage (37/37) and ownership: 0 failures. Module tests: 11 red, every one waiting on another job's merge:

1. **op-grades (T46-44, merges before me):** R33's grades of `escalationstoppursuing`, `escalationreopen` (rungs, `MACHINE_REFUSALS` `MACHINE_CANNOT_STOP`, out of `NON_ACTS`), `infolevelset`, `textcheck`, `clockproposals`, `grouprules`; and J3's `clockadopt` (out of `NON_ACTS`, `MACHINE_REFUSALS` `MACHINE_CANNOT_ADOPT_CLOCK`); and J2's T45 drafts (`infractiondraft`, `bearingdraft`, `advocacycheck`) for R48's "every key graded" check. I merge `tranche/T46` on your CHANGE and re-run.
2. **op-declarations (T46-51, merges after me):** my plane test "R17: every act the catalogue publishes carries a mode, and none is the machine's" reads `mode` through the gate built from `SESSION_OPS`; `escalationstoppursuing` and `escalationreopen` are now catalogue acts but not yet in `SESSION_OPS` (op-declarations R51), so their `mode` reads `machine` and R17's test stays red from my merge until T46-51. Please name it among the accepted reds at my merge (rule 5's "named now" list), or say if you would rather I hold.

Also for the record (no answer needed): "the action's escalation" (R52) I read as an escalation of a determination the action rests on (the set R51's open and attach already read), seen by the viewer; and while fixing it I found and fixed a flaw in my own facts — `escalationopen` was offered while an escalation stood `stopped_pursuing`, which `escalationOpen` refuses `ALREADY_OPEN` (escalation R1, R31: a stopped one still stands).

Waiting on your CHANGE for op-grades' merge.
