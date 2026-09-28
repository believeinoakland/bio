# BOB to actions (T8)

**Read** · handled J7

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 9 (the actions bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. Your map is `build/extraction/actions.md`: where it says nothing moves, build per your requirements. Where something moves, the extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–8 are merged into `tranche/T8`. Among them: jurisdictions' N130 sections (R23–R25, R31–R36), the catalogue's `STD`, `CONF`, `CONS`, `ESC` types and `proposalLabel` (N129), and publication R37 `publishedEditionsOf`, R36 `registerEvidenceBlock` and R38–R40. The earlier records are in `build/jobs/T8/`. Layer 9's six jobs run concurrently. A change to what another module uses goes through me (§4); I merge a provider early when a user needs it. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · ANSWER · re J1

(K247) Both stand. Merge `tranche/T8`: `retrieval` is now in your uses in `modules.json`. For Q2, build against conformance's R9 and R11 through `conformanceOf(host)`, injectable. I will merge conformance early and send you a CHANGE.

## B3 · CHANGE

(K248) Layer 9's seams (K248): providers merge early in module order (standards, conformance, consequences, actions, filings, escalation), each as soon as its Provides are built and tested. A provider posts a REPORT saying so, with the exact answer shapes it built, and I merge it and send users a CHANGE. Factories are `standardsOf`, `conformanceOf`, `consequencesModule` (K171 (17)), `actionsOf`, `filingsOf` and `escalationOf`, each `(host, deps)`. Until a provider lands, build against its Provides through injected deps, and refuse, never pass, where it is absent. Refusal families: C-112 standards, C-113 conformance, C-114 consequences, C-115 filings, C-116 escalation, C-117 actions if it needs a new one. Your users' readings, to confirm or correct in your early-merge REPORT: `actionRead({id, viewer})` (R29) → R25's keys plus `id`, `current_state`, `counterparty` (`{state: named, role, body, level?}` or `{state: undetermined, basis}`), `clock`, `legs` (`[{target, kind, …}]`), `governing_laws`, `law` and `risk_tier`. `NO_SUCH_BUNDLE` and `NOT_AN_ACTION` are distinguishable (FILINGS). Ledger entries are `{ord, direction, at, recorded_at}`, and legs come from `action_basis` with `breach: true` (ESCALATION). `actionFacts` is R12.

## B4 · CHANGE

From FILINGS #1 (J2.2–3), two things for your `actionRead` and clock:
1. Filings R9's chronology reads `state_history` from `actionRead` (R29). Answer it: the action's state moves in order, each with `{state, at, by}`. Your R25 does not list it yet; state it in your early-merge REPORT and I will fold it into R25 as wording.
2. Filings counts business days from the day after the start event (`COUNTED_FROM`, stated beside each date), on the view's holiday calendar. Your R32 `clockPropose` uses the same convention.

## B5 · CHANGE

(K252) Conformance's settled `determinationRead({id, viewer})` shape, from `build/jobs/T8/conformance.md` J2: `{ok, id, project, act: {id, description, actor: {role, body}, at, period, evidence}, outcomes: [{standard, outcome}], standards: [{standard, outcome, in_force, in_force_why, rows, disagreement}], findings: [{finding, case, edition, version_sha, role, frozen, live}], questions, author, at, supersedes, reason, superseded_by, live, proposal, basis_changed: null | {causes, says}}`. `findings[].finding` and `standards[].standard` (not `.id`). `at` is when it was recorded; the act's date is `act.at`/`act.period`. Absent or unseen: `NO_SUCH_DETERMINATION`. `determinationsFor` items are a strict subset. Conformance merges once it is green on the real standards; I will send a CHANGE. Reconcile your reader now.

## B6 · CHANGE

(K252) Conformance is merged into `tranche/T8` early, green on the real standards, with its shapes exactly as J2 (B-entry K252). The factory is `conformanceOf(host, deps)`. Merge `tranche/T8`, default your dep to it, and run your suite over the real module.

## B7 · CHANGE

(K256; P10: re-opened.) ESCALATION #1 reproduced a flaw against your R8 with R15 and R16. The acts that revise an action through `#revise` (`actionCorrespond` and the rest) call `promotion.promote` without the `viewer`, so your breach step (`#breachRefusal(nextFm, pkg.viewer ?? c.viewer ?? null)`) reads the determination with a null viewer. Conformance answers that as unseen, so every correspondence on a `breach: true` action is refused `ACTION_NO_DETERMINATION`. Pass the viewer (the act's viewer, or the author as viewer) into each promote. Add a test over the real conformance: a correspondence on a breach action resting on a live determination the author sees is accepted. Then merge `tranche/T8` and record completion again.
