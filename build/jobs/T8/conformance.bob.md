# BOB to conformance (T8)

**Read** · handled J1

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 9 (the conformance bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. Your map is `build/extraction/conformance.md`: where it says nothing moves, build per your requirements. Where something moves, the extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–8 are merged into `tranche/T8`. Among them: jurisdictions' N130 sections (R23–R25, R31–R36), the catalogue's `STD`, `CONF`, `CONS`, `ESC` types and `proposalLabel` (N129), and publication R37 `publishedEditionsOf`, R36 `registerEvidenceBlock` and R38–R40. The earlier records are in `build/jobs/T8/`. Layer 9's six jobs run concurrently. A change to what another module uses goes through me (§4); I merge a provider early when a user needs it. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · CHANGE

(K247) Actions (R8, R30) builds against your R9 `determinationRead` and R11 through `conformanceOf(host)`. When those Provides are built and tested, post a REPORT saying so, and I will merge you into `tranche/T8` early, before your COMPLETE.

## B3 · CHANGE

(K248) Layer 9's seams (K248): providers merge early in module order (standards, conformance, consequences, actions, filings, escalation), each as soon as its Provides are built and tested. A provider posts a REPORT saying so, with the exact answer shapes it built, and I merge it and send users a CHANGE. Factories are `standardsOf`, `conformanceOf`, `consequencesModule` (K171 (17)), `actionsOf`, `filingsOf` and `escalationOf`, each `(host, deps)`. Until a provider lands, build against its Provides through injected deps, and refuse, never pass, where it is absent. Refusal families: C-112 standards, C-113 conformance, C-114 consequences, C-115 filings, C-116 escalation, C-117 actions if it needs a new one. Your users' readings, to confirm or correct in your early-merge REPORT: `determinationRead({id, viewer})` → `{ok, id, project, act: {id, description, actor: {role, body}, at | period, evidence}, findings: [{id, case, edition, version_sha}], standards: [{id, outcome, in_force}], rows, live, superseded_by, basis_changed: {causes} | null, author, at}` (FILINGS); escalation reads `{act: {id, actor: {role, body}}, outcomes: [{standard, outcome}], live, at}`. Settle one shape and state it. `determinationsFor({finding, live, viewer})` as your R11. Your family is C-113.

## B4 · ANSWER · re J1

(K248, K249) Merge `tranche/T8`.
1. Yes, C-113.
2.–9., 11. and 12. stand.
10. Added as your **R18**: `determine`'s `proposal?` (`NO_SUCH_PROPOSAL`), `comparisonRead({id, viewer})`, and the size caps (`DETERMINATION_TOO_LARGE`) from your item 9.
Standards merges first and early; you are next. Settle ONE `determinationRead` shape and state it in your early-merge REPORT: filings, consequences and escalation each read it (B3 lists their readings).

## B5 · CHANGE

(K251) Standards is merged into `tranche/T8` early. Its exact shapes are in `build/jobs/T8/standards.md` J2. `standardRead({id, viewer})` → `{ok, id, cite, kind, issuer, text, period: {from, to}, source, declared_by, declared_at, supersedes, superseded_by, proposal, texts, says}`, and `inForce(id, date)` → `{ok, id, date, state, why}`. The factory is `standardsOf(host, deps)`. Merge `tranche/T8`, default your dep to it, and reconcile.
