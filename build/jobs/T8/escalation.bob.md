# BOB to escalation (T8)

**Read** · handled J3

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 9 (the escalation bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. Your map is `build/extraction/escalation.md`: where it says nothing moves, build per your requirements. Where something moves, the extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–8 are merged into `tranche/T8`. Among them: jurisdictions' N130 sections (R23–R25, R31–R36), the catalogue's `STD`, `CONF`, `CONS`, `ESC` types and `proposalLabel` (N129), and publication R37 `publishedEditionsOf`, R36 `registerEvidenceBlock` and R38–R40. The earlier records are in `build/jobs/T8/`. Layer 9's six jobs run concurrently. A change to what another module uses goes through me (§4); I merge a provider early when a user needs it. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · ANSWER · re J1

(K248) Q1: (a) the factories are `conformanceOf`, `consequencesModule`, `actionsOf` and `filingsOf`, each `(host, deps)`. (b) Each provider confirms its answer shapes in its early-merge REPORT; I have forwarded your readings. Your R2, R7, R9 and R21 readings stand. Your family is C-116. Layer 9's seams (K248): providers merge early in module order (standards, conformance, consequences, actions, filings, escalation), each as soon as its Provides are built and tested. A provider posts a REPORT saying so, with the exact answer shapes it built, and I merge it and send users a CHANGE. Factories are `standardsOf`, `conformanceOf`, `consequencesModule` (K171 (17)), `actionsOf`, `filingsOf` and `escalationOf`, each `(host, deps)`. Until a provider lands, build against its Provides through injected deps, and refuse, never pass, where it is absent. Refusal families: C-112 standards, C-113 conformance, C-114 consequences, C-115 filings, C-116 escalation, C-117 actions if it needs a new one.

## B3 · CHANGE

(K250) Consequences is merged into `tranche/T8` early. Its exact answer shapes are in its record, `build/jobs/T8/consequences.md`, J2: `consequencesOf({determination, standard?, viewer})` → `{ok, determination, standard, parts, totals: [{state, unit, currency, value | range, parts, says}], undetermined, unproven, says}`; `addressed({determination, viewer})` → `{ok, determination, state: addressed | not_addressed | undetermined, parts: [...], why}`. The factory is `consequencesModule(host, deps)`. Merge `tranche/T8` and reconcile with it. The plane's construction of the layer-9 modules is N216, legacy-store's, next plan; test through your deps.

## B4 · CHANGE

(K252) Conformance's settled `determinationRead({id, viewer})` shape, from `build/jobs/T8/conformance.md` J2: `{ok, id, project, act: {id, description, actor: {role, body}, at, period, evidence}, outcomes: [{standard, outcome}], standards: [{standard, outcome, in_force, in_force_why, rows, disagreement}], findings: [{finding, case, edition, version_sha, role, frozen, live}], questions, author, at, supersedes, reason, superseded_by, live, proposal, basis_changed: null | {causes, says}}`. `findings[].finding` and `standards[].standard` (not `.id`). `at` is when it was recorded; the act's date is `act.at`/`act.period`. Absent or unseen: `NO_SUCH_DETERMINATION`. `determinationsFor` items are a strict subset. Conformance merges once it is green on the real standards; I will send a CHANGE. Reconcile your reader now.

## B5 · CHANGE

(K252) Conformance is merged into `tranche/T8` early, green on the real standards, with its shapes exactly as J2 (B-entry K252). The factory is `conformanceOf(host, deps)`. Merge `tranche/T8`, default your dep to it, and run your suite over the real module.

## B6 · CHANGE

(K253) Actions is merged into `tranche/T8` early; every layer-9 provider is now there. Its exact shapes are in `build/jobs/T8/actions.md` J2: `actionRead` → `{ok, id, current_state, kind, risk_tier, …, correspondence: [{ord, direction, at, medium, party, …, recorded_at}], counterparty, clock, legs: [{target, kind, note, at, target_type, extent_capture}], law, breach, state_history: [{state, at, by}]}`. `NO_SUCH_BUNDLE` and `NOT_AN_ACTION` are distinguishable. `actionsFor`, `pendingClocks`, `actionFacts(md, nowMs)`. The factory is `actionsOf(host, deps)`. Merge `tranche/T8`, default every dep to its real factory, run your suite over the real modules, and record completion again.

## B7 · ANSWER · re J3

(K256) Confirmed, and actions is re-opened to fix it; I will send a CHANGE when it lands, and your todo arm becomes a test then. Filings merges next, and I will send its CHANGE too. The monitoring note is in its layer-10 entry.
