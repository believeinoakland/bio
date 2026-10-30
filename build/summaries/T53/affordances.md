# Task summary · T53 · affordances

Stands for: the reading set of module job `affordances` (T53, layer 11; SESSIONS §6.3; 159,304 bytes read, limit 40,960): current.md:372-380; `build/plan/T53-R1/affordances.md`; `build/requirements/affordances.md`; `build/layers.md` (layer 11 uses only earlier modules, P4; nothing below depends on it); the Public part (Purpose, named services) of each used module. Sources stay binding; "read R<n> whole" means this compression is not enough to implement it.

## Entries

- Plan block current.md:372-380; rows `T53-R1/affordances.md`. R72-R75 are "not yet met: T53"; R74 is CONDITIONAL.
- T53-328 · N1260 (DEC-447) · "Follow from here" (current.md:373; rows plan-T53-draft.md: `cs.follow` fold in interface-shell; menus are affordances R72-R74; Find results draw it, screens-daily; screens-investigate R67-R69): R72, R73, R74.
- C T52-39 (current.md:374; carried-T52-R1.md) · DEC-443: read `act.leggrade.does`, `act.signerknown.does`, `act.factconfirm.does` and the five `act.standard*.does` by key (ACT_HELP words move; three tests re-pinned); DEC-444's two ACT_HELP sentences (`counselpacketread`, `counselpacketexport`): R48, R62, R66, R70, R71.
- T53-329 · K5471 (6) · JOURNEYS's defects (current.md:375; plan-T53-journeys.md): R-66 (read half), BLOCKS: `proceeding_kinds: []` returned when no profile (`affordances/facts.mjs:470-487`) · REG2 R-66 · D2 jurisdictions/affordances R?1: R75 (J3 = C, K5556). The job reads its rows in `planning/plan-T53-journeys.md` §A at START; a defect wholly a carried entry merges into it.
- T53-330 · K5457 · off the retired AI ops (FOLD-AI §2.8) (current.md:376): affordances is among sixteen modules still naming the retired ops/service names (ai-accounts' twelve); re-pointing is a CHANGE in this round, no aliases (ai-accounts For BOB 6): R12, R19; `## Uses: ai-accounts`, `credentials`.
- T53-331 · K5565 · English in tests (current.md:377; plan-T53-tests-english.md): convert the module's English-in-test sites to the word key and its values; each assertion reads the key the product reads, never a copied sentence; a B site (text only in the module's source) first gets its key (a words row, UX-DESIGN's wording where shown to a member); a C site is input data or a dead assertion, kept as input or removed with its reason; every test touched for other entries is converted too (the words check refuses English in a new or changed test). Sources `tests-sweep/CENSUS.md`, `CENSUS-RX.md`. Census: literal A/B 0/0; regex A/B/C 4/3/4 (7 files). Test: the words check's baseline loses the module's files; suite green (R62, R63).
- T53-605 · DEC-447 (moved from explore T53-163, K5786) · `followfrom` (current.md:378): the op in R73's menus.
- T53-606 · money's report (K5786) (current.md:379): `money_flow` in `words.mjs:39` and `:57`, R72 and `t48.test.mjs` read as money's five `money_*` kinds; `moneyby` and `moneyfiscalyears` carried (t33 R12 R24): R72, R12.

## affordances (own requirements)

### Public

- Purpose (R21, R22): plane-sourced act pre-flight (DEC-8): for one object and caller, which acts exist with needs, mode, weight, rung, wording; every surface's vocabularies, ladder and set acts; computes no refusal; every service is a read or pure.
- Terms (R11, R14): decorated act `{id, label, weight, needs, mode, rung, rung_absence, prompt}`; gate `{needs(op), mode(op)}` (control plane's `NEEDS`, `SESSION_OPS`); mode `session|admin-session|machine`; weight `refuse|report|single|per-item`. Grading tables (`RUNG_LADDER`, `RUNGS`, `RUNG_ABSENT`, `RUNG_ABSENCE_GROUNDS`, `JUSTIFICATION_REFUSALS`, `IRREVERSIBLE_CORRECTION_PATH`, `CONSEQUENCE_STATEMENTS`, `LARGER_SCREEN_ACTS`, `IRREVERSIBLE_WEIGHT`, `MACHINE_REFUSALS`, `NON_ACTS`) and `phoneOf` are `op-grades`' (its R1-R22), read by reference, never copied. Retired to op-grades, no work here: R2, R3, R27, R31, R7, R32, R33, R35, R38, R40, R42, R43, R45, R46, R47, R50.
- R1 `ACTS`: `refuse`: release, retire, dispose, sever, reinstate; `report`: cite; `single`: conclude, reopen, publish, inquirydivide, inquiryground, actionmove, actioncorrespond, actionlaws, actionrisktier, versionaccept, versionreject, versionconsider, versionrevert, versioncurrent, withdrawconclusion, versionhide, projectinvite, projectjoin, projectleave, projectremove, projectowneradd, projectownerremove, projectownerrescue, projectvisibilityset, contradictionresolve, sourceconsent (no bundle; carried by the no-target catalogue). `CAPTURE_ACTS`: attest, monitor, attesttext. `PER_ITEM_ACTS` (key `items`; `item_keys` / `shared_keys`): proposedispose `[[key],[progressionKey,stageKey],[project,finding]]` / `[to,reason,kind,definitionVersion]`; taskresolve `[[id]]` / `[]`; taskforward `[[id]]` / `[to]`; resolve `[[captureSha],[captureSha,ref]]` / `[ref]`.
- R4 `VOCABULARIES` exactly: `action_kind`, `law_levels`, `dispositions`, `subject_positions`, `basis_roles`, `entity_kinds`, `relation_kinds`, `stage_requiredness`, `action_basis_kinds`, `correspondence_directions`, `correspondence_stages`, `correspondence_outcomes`, `resolutions`, `risk_tiers`, `version_states`, `version_edges`, `version_reason_required`, `rung_ladder`, `rung_correction_path`, `rung_absence_grounds`, `rung_consequences`, `sufficiency_claim_states`, `content_mint_states`, `contradiction_coordinates`, `plurality_differences`, `resolution_kinds`, `norm_canons`, `dismissal_reasons`; each the very object the enforcer refuses against (reference, never a copy); `action_kind` is `actions`' answer at call time. `irreversible_weight`, `larger_screen_acts` and the ladder's are op-grades' objects. R6 re-exports `DISPOSITIONS` (inquiry), `STAGE_REQUIREDNESS` (progressions), `ENTITY_KINDS`, `RELATION_KINDS` (entities), `REOPENABLE_FROM` (promotion), `PER_ITEM_MAX` 100 (record-core).
- R5/R28/R29 prompts: `DIVIDE_PROMPT` (inquirydivide), `GROUND_PROMPT` (inquiryground), `ATTEST_FENCE` (attest; DEC-39 verbatim, two grade letters from capture ceiling and the grade above; `attestFence(c, u)` throws if either absent), `SELF_ATTESTED_PROMPT` (publish; DEC-81 item 3), `CONSENT_PROMPT` (sourceconsent; consent permanent for what is published, withdrawal binds later publications, DEC-78 5(d)); every other prompt null. Labels/`GROUND_PROMPT` use none of "AND", "OR", "disjunction", "branch", "ground" (DEC-32). R64 moves them to keys.
- R30 `VOCABULARIES` gains `template_states`, `template_uses`, `template_review_outcomes`, `local_fact_acts`, `local_fact_statuses`; R34 `docket_shelves`, `docket_entry_kinds`, `docket_proposals`, `docket_pressure_kinds`; R36 every act carries `phone` (`phoneOf`) and `larger_screen_acts` is published (advisory); R37 no-target answer gains `screens` and `wizard_scripts` (`wizard-scripts` R13, R11); R44 gains `writing_help_refused` (the very list `wizard-scripts` R24 item 2 holds).
- R39 `VOCABULARIES` also: `event_kinds`, `dated_fact_kinds`, `event_statuses`, `participant_roles`, `event_relation_kinds`; `line_kinds`, `line_capacities`, `line_roles`; `money_kinds`, `money_phases`, `money_stages`, `money_bases`, `money_precisions`; `connection_kinds`; `identity_claim_kinds` (owners' objects). Value word: owner's, else design's, else plain word with `provisional: true`; never "knows", "network", "conflict", "suspicious", "most connected". Owner not composed: absent, never empty. `connection_kinds` is `{values, words}` (`values` in `owners()` order; `words` each `{word, class, owner}`). Events' vocabularies come via the store's `affordancevocab` (`events_vocabularies`).
- R41 `explainRefusal({op, code, target?, viewer, identity, author, by, gate})` -> `{op, code, translation, check, rung, rung_absence, prompt, weight, acts}` (owner's catalogue row, never re-worded; with a target the acts R17 would answer now, dry run); uncatalogued code: `translation: null` with `refusal.uncatalogued`; writes nothing, never throws.
- R48/R49/R53/R54/R56/R57/R61 `ACT_HELP`: frozen, one explanation per op, held as keys read through `word` (R62). A declared op is held under itself; an alias never as a second entry; `owed_<op>` held under `<op>` once declared; a key naming no declared or owed op is not held (named back to BOB). Ops the design lacks a text for are in `op-declarations` `ACT_HELP_ABSENT` (its R34), never in both. `handlechange`'s help is `membership`'s `HANDLE_FIXED` translation by reference (R53); American spelling ("labeled", R57). R49: the no-target answer carries `act_help` = `ACT_HELP` (same reference); with a target not. Read R48 whole.
- R62 no member-facing English held: every sentence via `word(key, vars)`; keys are the `reads` list in `words-reads.json` (405 at `fa3c8b7e8e`) plus keys requirements name; test: each key `hasWord`, drawn text equals `word`, no test holds English. R63 vocabulary word order: `label.<set>.<value>` (spaces `_`; `label.connectionkinds.*`), else owner's word, else plain word `provisional: true`; provisional words named in the test report. R64 act `label` = `word("act.<id>.name")` (`PER_ITEM_ACTS`: `.name.selected`; 57 `ACTS`, 3 `CAPTURE_ACTS`, 4 `PER_ITEM_ACTS`); prompts `prompt.inquirydivide`, `prompt.inquiryground`, `prompt.attest.fence` (`{ceiling}`, `{unreachable}`); `SELF_ATTESTED_PROMPT`, `CONSENT_PROMPT` stay owners'; `refusal.uncatalogued` replaces `NOT_CATALOGUED`; `ACT_HELP_OPS` gains `reauth`. Control: an act with no `act.<id>.name` fails the load by id.
- R65 held under their ops: `watchitem`, `secondlook`, `projectstakeset`, `actionstake`, `actioninquiry` (`act.owed_<op>.does`), `secondlookclear`; none starts `owed_`; the 9 op-grades R45 reads have none. R66 `aliaswithdraw`, `factconfirm`, `projectrequest`, `projectrequestwithdraw`, `projectrequestanswer` held (`act.<op>.does`; alias from `act.owed_aliaswithdraw.does`), leave `ACT_HELP_ABSENT`. R69 seven browser acts `revisioncompare`, `hashcopy`, `linkopen`, `pubfloorset`, `pubfloorclear`, `pubprint`, `reviewexport` held from `act.owed_<name>.does` (`BROWSER_ACTS`); not ops; in no catalogue table. R70 design commit `8c5e692e19`: `actionhold`, `holdnoticesent` new texts, `holdnoticeprepare`, `counselpacket` new; table equals file's four. R71 `act.<op>.does` for `standardinforcethrough`, `standardinforcethroughwithdraw`, `standardadoption`, `standardimpose`, `standardbenchmark`, `signerknown`, `leggrade`; control: an op absent answers none.
- R51/R52/R55/R58 acts on an `action` target, each offered exactly where its refusal admits the caller (R18; null never narrows, R10; machine gets none in `MACHINE_REFUSALS`): escalation, filing/communication, hold, plan, `clockadopt`, `reminderset`, take-up, scope/receipt/links/notes/bearings; facts via owners' predicates (`project-roster` R23 `projectScope`); vocabularies by reference from `action-grammar` (`OVERRIDE_GROUNDS`, `PHRASING_KINDS`, `ASSERTION_RESOLUTIONS`, `PRESS_RECORD_TERMS`, `FOUND_ELSEWHERE_KINDS`, `BEARINGS`, `PROMISE_KINDS`, `CLOCK_OWED_BY`, basis kinds, escalation states incl. `stopped_pursuing`, plan states incl. `paused`, matter states, harm words, scopes, links `arose_from`, `cures`). R52: `escalationstoppursuing` when `open|suspended`, `escalationreopen` when `stopped_pursuing`; `clockadopt` only where `clockProposalsFor` (action-clocks R20) shows a standing proposal, naming its key; `filingsent` only on a draft with `second_needed: false` (filings R50); `escalationattach` at stage 7 only for purposes `attachConditions` (escalation R34) admits (undetermined: offered); not when already attached (`ALREADY_ATTACHED`). R55: `sever` on an `information` target where a visible question holds a leg with reference `confirmed|proposed`, `reinstate` where `severed`, naming the question; fact `legs_in {live, severed}` (counts, `connections.edgeSevered`). R58 `actionreplyquoting` on kind `request_for_comment` with a `received` entry (`bearingsOf`), never a machine.
- R59/R60 `connection_kinds` answers `group` from a frozen map covering every registry kind: six groups `pos`, `part`, `money`, `ment`, `same`, `step_source` (never `ment`); totality test. R26 `risk_tiers` = `RISK_TIERS`; `action_kind` = product kinds then profiles' `action_kinds`, none held here.
- R67 published answer (`op=affordances`, targeted or not) gains `proceeding_kinds: [{kind, label, forum_kind}]` from `jurisdictions.combine` (its R51), combined order, each kind once, read at call time; the door asks the store (`http://do/affordancevocab`, a read in `affordancesOps`) beside `actionkinds` in the same `Promise.all` (both arms) and passes it to pure `vocabulariesFor` as second argument; entry without string `kind` dropped; no profile `[]`; unreadable: key absent. Control: only `action_kind` and this change with profiles. R68 also `action_kind_labels` (kind -> `label` for non-product kinds with non-empty string label, from `actions`' governing view; `action_kind` keeps shape/order; none `{}`; unreadable absent).
- R72 (not yet met; amends R39, R59, R60) `connection_kinds` also answers `dimension`: `people`, `organizations`, `money`, `donations`, `events`, `documents`, `law`, or null for `hunch` kinds, from new frozen `CONNECTION_DIMENSIONS` beside `CONNECTION_GROUPS` (six groups unchanged). `people`: same_as, not_same_as, unsure, proxy_for, overlaps, line:related_to, line:associate_of, line:educated_at, line:credentialed_by. `organizations`: member_of, line:part_of, line:post_in, line:reports_to, line:oversees, line:appoints, line:seat_on, line:funds, line:contracts_with, line:acts_for, line:responsible_for, line:custodian_of, line:successor_of, line:belongs_to, line:owns_interest_in, all line:holds:*. `money`: money_transfer, money_payment, money_revenue, money_other. `donations`: money_contribution. `events`: all event_*, placed_on_flow. `documents`: mentioned_together, named_in, step_source, in_tension_with. `law`: all law_*, court_*, in_force_at_event, owes, owed_to, holds_power, met_by, used_in, line:party_to, line:appeal_of, line:consolidated_with, line:remanded_to, line:arises_from. Groups: `money` holds the five money kinds in place of `money_flow` (`GROUP_KINDS`, `words.mjs:57`); `named_in` in `ment`. Test: totality over the registry (dimension or null for hunch, and group; no key the registry lacks); `money_contribution` dimension `donations` group `money`, other money kinds dimension `money`; every `line:` kind above in both maps. Control: unmapped fixture kind fails by name; `CONNECTION_GROUP_NAMES` still six.
- R73 (not yet met; amends R17) `DIMENSION_ONWARD`: frozen item kind -> ordered `{entry, dimension, op, also?}` (`entry` = suffix of `screen.follow.<entry>`; `dimension` one of R72's seven, `registers`, `connections`). `person` (ENT- person) and `organization` (institution, body, movement): who.money (money; followfrom), who.donations (donations; followfrom), who.offices (organizations; followfrom), who.laws (law; followfrom), who.events (events; followfrom), who.docs (documents; followfrom, also search), who.rows (registers; registersearch), conn (connections; explore). `fund`: who.money, who.events, who.docs, who.rows, conn. `payment`/`donation` (MNY-; donation when kind in contribution family): money.who (people; followfrom), money.more (money; followfrom; omit if no payer), money.events (events; followfrom; omit if no event), money.docs (documents; search), rows.match (registers; registersearch), conn. `event` (EVT-): event.who (people; followfrom), event.money (money; followfrom), event.docs (documents; search), event.rows (registers; registersearch), conn. `document` (INFO-): document.who (people; followfrom), document.money (money; followfrom), document.events (events; followfrom), document.laws (law; followfrom), rows.match (registers; registersearch), conn. Any other id the explorer accepts: `conn` only. `who.money` excludes donations (DEC-447 (2), DEC-448). Test: table equals this; `fund` lacks who.offices/who.laws/who.donations; `person` has all eight. Control: no entry points to the item's own dimension except `conn`.
- R74 (not yet met; CONDITIONAL: BOB confirms after M-F1 that a document must be a hop's end; `connection-grammar` R2, R6-R9) register kind `named_in`, class `evidentiary`, provisional word "named in", entity (ENT-) -> document (bundle id). Routing: an ENT- node answers union of `step_source` hops (R69; today only these, `connections/index.mjs:1295-1300`) and `named_in`; a bundle node union of `mentioned_together` (R63) and `named_in`; `kinds` limits; ordered by hop id, paged by `BOUNDS.fanout`, each kind judging its own hub. Hops: ENT-: one per document the viewer may see whose capture resolves to it, the strongest resolution per capture via `entities.concerns` (not `strongestByCapture`: unbounded, no viewer, R76); bundle: one per entity its captures resolve to (`entities.resolutionsFor`). `id` SHA-256 of canonical JSON `{kind, from, to, capture_sha}`; `evidence` `[{capture_sha, ref}]`; `grade.assertion` the resolution's grade, `grade.ends` `[resolution's grade, capture's grade or lowest if none]`; `valid` unstated; `derived` null; unseen document neither item nor counted (R33); more than `hubBoundOf('named_in')` (1,000) hops: `hub: {set_size, why}` no items; a declared relation is never a hop; passes `ownerConformance`. Test: entity in three captures of two documents -> two `named_in` hops, `step_source` unchanged; 1,001 documents -> hub; `explore` reaches the document. Control: unresolved ref no hop; `kinds: ['step_source']` as before.
- R75 (not yet met; amends R67; JOURNEYS R-66; screens-investigate R36, R47) with no profile holding kinds the kind chooser still offers one: the profile's `proceeding_kinds` when held; otherwise the screen tells the member to choose places first (link) and the kind can be typed by name; register, parties, orders then draw. Test: a team with no profile registers a proceeding (court, number, kind, caption source) and the screen draws parties, register, orders; control: with kinds held, they are offered.
- R8 `deriveActs(facts)` (pure): release: information, edge to verified; retire: information, edge to retired, no confirmed citation in; dispose: inquiry, not case member, edge to a disposition; conclude: inquiry, edge to concluded or concluded with `concludes_for_project`; reopen: inquiry, edge to open, state in `REOPENABLE_FROM` or case member; publish: inquiry concluded or `concluded_for_project`, not case member unless `edition_warranted_for_project`, `project_owner !== false`; inquirydivide: edge to divided, not case member, a leg, nothing working rests on it; inquiryground: a leg, not case member, not divided; actionmove: any edge; actioncorrespond/actionlaws/actionrisktier: any action; version acts by reading-state edges; `contradiction_inquiry` withholds `conclude` and offers `contradictionresolve` where concluded edge holds and `contradiction_sides_seen !== false`. Read R8, R9 whole (cite/sever/reinstate and the roster acts). R10 null fact never narrows or offers a roster act; `actor_is_machine === true` withholds `MACHINE_REFUSALS`.
- R11 `decorate(act, gate)`: `needs`, `mode` from gate, `rung` = `RUNGS[id]|null`, `rung_absence` = `RUNG_ABSENT[id]|null`, `weight`, `prompt` (keys present). R12 `unaccounted(opTable)` over `{op, mutating, gated}` -> `{unpublished, unranked, stale}`: gated ops in none of `ACTS`, `CAPTURE_ACTS`, `PER_ITEM_ACTS`, `NON_ACTS`; mutating ops in neither `RUNGS` nor `RUNG_ABSENT`; `stale` = `NON_ACTS` keys with no table row, and `RUNGS`/`RUNG_ABSENT` keys not carried as mutating; all empty is totality.
- R13 `affordanceFacts({target, viewer, identity, author, by})`: `NO_TARGET`; `NO_SUCH_BUNDLE` (absent and unseen alike); never writes; a project seen only at `EXISTENCE` gives R14's keys with content facts null, `object_type: "project"`, `roster` only `rescue_open` (`rescueRefusal`). R14 facts `{ok, target, object_type, declared_type, current_state, criticality, case_member, project_owner, project_target_owner, project_participant, roster, actor_is_machine, concludes_for_project, concluded_for_project, edition_warranted_for_project, basis_legs, contradiction_inquiry, contradiction_sides_seen, rested_on {working, frozen, severed}, basis_version_states, basis_versions, cites_in, cites_out {confirmed, severed, severed_reinstatable}, cited_by_case}` + `legs_in`, each via the predicate the act's refusal runs (case relation `case-tensions.caseRelation`). R15 positional facts of `identity`, `roster` of `by`; R16 counts never ids. Read R13, R14 whole.
- R17 `affordances({target?, viewer, identity, author, by, gate})` (`op=affordances`): no target `{target: null, catalog, vocabularies, capture_acts, set_acts, detail}` plus R37/R44/R49 keys; `set_acts` with `set_key`, `item_keys`, `shared_keys`, `max_items`; with target R13's refusal else `{target, object_type, current_state, acts, vocabularies, capture_acts}`; no `catalog` act has mode `machine`.

### Private

- Invariants: R18 a published act is never refused for state, type or caller when the same caller performs it well-formed (`projectleave` to an owner only while another owner is committed). R19 each rung backed by its enforcement (every `reasoned` op without its reason refused with a `JUSTIFICATION_REFUSALS` code; DEC-88 acts by absent-words refusals; K1025 acts take no further reason; `terminal` only while `STATES.information.edges.retired` is empty; `irreversible` only `publish`, `publishat`, `publishatmove`). R20 `MACHINE_REFUSALS` equals, both ways, acts answering a machine credential with `MACHINE_*`. R21 no surface composes text. R22 nothing writes. R23 joined-project predicates asked for the caller's own member id only. R24 `rung: null` never without non-null `rung_absence` for a mutating op. R25 no place named; `NON_ACTS.idmatch` names none.
- Design: `affordancesOf(ctx)` for `affordanceFacts`; `ACTS`, `deriveActs`, `decorate`, `unaccounted` module-level and pure (queue, skills import them); control plane passes `gate`, stamps, maps `NO_SUCH_BUNDLE` to 404 (R17). N891 tests only: drop copies of op-grades' pins, keep R19, R20, R12 (R12). Uses (all earlier modules): `setup-words`, `record-grammar`, `record-core`, `membership`, `promotion`, `connections`, `citation`, `inquiry`, `basis-versions`, `case-tensions`, `publication`, `op-grades`, `jurisdictions`, owners' op maps (R12, R19); T53 R74: `explore`, `money`, `lines`, `events`, `entities`, `provenance`, `membership`, `standards`, `connections`, `content`: the reads `followfrom` answers (`moneyByParty`, `linesOf`, `eventsFor`, `concerns`, `readFact`, `readEvent`, `moneyOf`, `resolutionsFor`, `recordedBy`, `standardsFor`, `standardsBinding` owed), existing edges (R73, R74).

## Uses: action-clocks
- Deadline reads across actions: pending/passed entries, profile-proposed entries, reminders; used `clockProposalsFor` (its R20) (R52, R51).
## Uses: action-plans
- A project's plan: options, chosen one, up to three scenarios, link to created Action; never published; plan acts (R51).
## Uses: jurisdictions
- Holds jurisdiction profiles as data; lists, gets, validates, combines (R26, R67, R68). `list()` -> `[{id, name, covers, test}]` by `id`, never throws (its R8); `get(id)` -> profile or `null` (R9); `combine(list)` -> `{ok: true, view, conflicts}` or `{ok: false, errors}` (R12-R16, R29, R34): `UNKNOWN_PROFILE`, `INVALID_PROFILE`, `NOT_A_LIST`, `UNKNOWN_SECTION`; `view` has profile shape + `profiles`, `covers`, `test`, each fact carrying `profile`; lists unioned in order; one-value facts that disagree withheld into `conflicts` `{at, values, says}`, never chosen; empty list ok. Reads: R25 `action_kinds`, R51 `proceeding_kinds`.
## Uses: record-core
- Owns storage (ids, leases, history, purge) (R6, R14). `readFile(bundleId, path)` -> `{text, sha256}` | `{blobSha, bytes, sha256}` (blob: reference not bytes) | `null` when bundle or path not held; never throws (its R13, R14); `PER_ITEM_MAX` (R49).
## Uses: membership
- Who members are, project setup, the fence (R13-R15). `participation(projectId, memberId)` -> `{state, owner}` | `null` (none or project not held); never throws (its R74). `rescueRefusal(projectId, by)` -> refusal | `null` (R75): `NOT_AN_ADMIN` (R84) unless admin (R64); `NO_OWNERS`; `OWNERS_ARE_ACTIVE` naming them unless all inactive; writes nothing.
## Uses: promotion
- The one bundle write path; `REOPENABLE_FROM`, `fact(name)` for the case relation (R6, R8).
## Uses: content
- References to part of a captured document, extent grammar, content address, transcription; vocabularies (R4, R39).
## Uses: entities
- Entity registry, resolution with §8.1 grade (R6, R74). `resolutionsFor({captureSha, limit, viewer})` (its R14, R58): `NO_SHA`; resolutions by reference then entity with grade, `established`, `needs_confirmation`, method, basis, `raised_from`, `resolved_by`, `at`, reports; `limit` default 500 max 5,000, `truncated`; `unresolved`, `names`. `concerns({entityId, limit, viewer})` (R15): `NO_ENTITY`; one entry per capture with its strongest resolution; `found`, entity, `count`, `resolution_count`, `limit`, `truncated`; unseen bundles redacted. `strongestByCapture(entityId)` (R16): same collapse, unbounded, no viewer.
## Uses: connections
- Derived connections, bundle edges, themes; `citesInto`, `edgeSevered`, `STEP_SOURCE_NO_BASIS`, `neighbours` routing (R14, R55, R74).
## Uses: progressions
- Declared flows and stages; `STAGE_REQUIREDNESS` (R6).
## Uses: inquiry
- Inquiry lifecycle, legs, grounds; `DISPOSITIONS`, `restsOnLive`, R46 vocabularies (R6, R14, R4).
## Uses: citation
- Cite, sever, reinstate; `retiredNotCitable` (its R5), R15 question legs, R24 `leggrade` (R14, R55, R71).
## Uses: basis-versions
- Basis versions and their state machine; `SUFFICIENCY_CLAIM_STATES`, `VERSION_MACHINE`, joined-project predicates (R4, R14, R23).
## Uses: contradiction
- Contradiction identify/present/resolve; `DISMISSAL_REASONS` (its R31), `candidateSidesSeen` (its R56) (R4, R14).
## Uses: intent
- Aspirations, goals, objectives; open proposal backs `triage` (R19).
## Uses: publication
- The published record; case relation, edition answer (R14), ops of R42: `publishat`, `publishatmove`, `publishatcancel`, `publishschedule` (R19).
## Uses: ratification
- Signing ceremonies; ops R42 grades and backing (R19).
## Uses: case-authoring
- Prepares the case, `op=publish`; `edition_warranted_for_project`, prompt origin (R8, R14, R28).
## Uses: standards
- Standards held as content, in force at a date; op map, `standardsFor`, `standardsBinding` (owed), `standard*` help (R12, R71, R74).
## Uses: conformance
- A member's determination against standards; op map and backing (R12, R19).
## Uses: consequences
- Breach consequences, success record; `consequencerecord` arms (its R2-R4) back R19.
## Uses: actions
- The Action object; `kinds()` and `governingView` (R26, R68); correspondence refusals back `actioncorrespond` (its R15-R16) (R19).
## Uses: filings
- Filings and counsel packet; `filingsFor` `second_needed` (its R50) (R52); refusal R7 (R19).
## Uses: escalation
- Escalation stages; `attachConditions` (its R34), state (R31, R33) (R52).
## Uses: capture
- Fetch with provenance; op map, fence source (R5, R19).
## Uses: doorbell
- Public intake and inbox; `inboxresolve` backing (its R3) (R19).
## Uses: sources
- Source disclosure history; `CONSENT_PROMPT` origin (R5, R29).
## Uses: record-grammar
- Shared grammar; `STATES`, `normalizeType`, `vocabFor`, `parseFrontmatter`, `isMachineIdentity`, `EARNED_CAPTURE_CEILING`, `UNREACHABLE_CAPTURE_GRADE`, `BASIS_GRADES` (R5, R8, R14).
## Uses: action-grammar
- Action document grammar and vocabularies; `ACTION_KINDS`, `PRODUCT_KINDS`, `LAW_LEVELS`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_*`, `RESOLUTIONS`, `RISK_TIERS`, `actionKinds` (its R1, R2) (R4, R26, R51).
## Uses: credentials
- Credentials and sessions; `aikeepaway` backing (op-grades R25), `signerknown` help (its R83) (R19, R71).
## Uses: filing-templates
- Template library; `template_*` vocabularies (its R21) (R30).
## Uses: local-facts
- Member confirmation of calendar facts; `local_fact_acts`, `local_fact_statuses` (its R7) (R30).
## Uses: provenance
- Trust root: register, receipts, capture grade; op map (R19).
## Uses: attestation
- Co-attestation, instance key; op map (R19).
## Uses: provenance-routes
- Hop chains, route marker; op map (R19).
## Uses: observation-log
- Log of looking, leads; op map (R19).
## Uses: bias
- Declared bias sets; op map (R19).
## Uses: strength
- Derived strength pair, the bar; op map (R19).
## Uses: reevaluation
- Says which findings a change affects; op map (R19).
## Uses: monitoring
- Watches monitored documents; op map (R19).
## Uses: docket
- Post-publication docket; ops R34 grades, `docket_*` vocabularies (its R1, R2, R6) (R34, R19).
## Uses: case-import
- Imports another group's case read-only; ops R35, R38 and backing (R19).
## Uses: wizard-scripts
- Wizard script library; `wizardsAt` (its R11), registered screens (R13) for `screens`, `wizard_scripts`; R24-R27 list for `writing_help_refused` (R37, R44).
## Uses: events
- Events and dated facts (R39). `readEvent({eventId, viewer})` (its R26): `NO_EVENT`, `found: false`, kind, status, `when`, concerns, attestations, participants, relations. `eventsFor({entity, kinds?, from?, to?, limit, viewer})` (R27): events the entity takes part in or concerns, with roles, `limit` 1-500 default 100, `truncated`. `datedFactsFor({captureSha, viewer})`: a capture's dated facts in extent order. `recordedBy({captureSha, extent?, limit?, viewer})` (R49, the shared shape): `{ok: true, module, capture_sha, items, truncated}`, item `{module, record, kind, field, extent, relation, by, at, withdrawn}`; limit 1-500 default 100; `VIEWER_MISSING`, `NO_SHA`, `EXTENT_MALFORMED` as `{ok: false, refused, code, reason, why}`; unseen capture `items: []`.
## Uses: lines
- Dated graded lines between entities (R39). `withdrawLine({lineId, reason, by})` (its R8): `NO_REASON`, `NO_SUCH_LINE`, repeat `already: true`. `readLine({lineId, viewer})` (R9): `NO_LINE`, `found: false`. `linesOf({entity, kinds?, direction?, limit, viewer})` (R9): oldest first, `limit` 1-500 default 100, `truncated`.
## Uses: money
- Money facts as stated amounts (R39, R72); `moneyByParty` (its R38, `op=moneyby`) is the money read of `followfrom`: read it whole. `withdrawFact({factId, reason, by})` (its R7): `NO_REASON`, `NO_SUCH_FACT`, `already: true`. `readFact({factId, viewer})` (R8): `NO_FACT`, `found: false`. `moneyOf({entity, period?, kinds?, phases?, limit, viewer})` (R9): facts where the entity is a party or concerned, `limit` 1-500 default 100, `truncated`, never a total. `checkConstant({role, value})` (R7): role `period|kind|phase|stage|basis|currency` else `UNKNOWN_ROLE`; `{ok: true, role}` or money's refusal with `role` (`MONEY_BAD_PERIOD`). `factBySource({table, row, binding, viewer?})` (R7): `{found: true, fact_id}` | `{found: false}`; `NO_SOURCE`. `recordedBy` (R24): events R49's shape, `kind: "money_fact"`, `field: "source"`.
## Uses: people
- Person identity claims, dated facts; `identity_claim_kinds`, `personexpunge` grade (R39, op-grades R21).
## Uses: connection-grammar
- One relationship shape, registry; `owners()`; R2, R6-R9 for `named_in` (R39, R72, R74).
## Uses: money-checks
- Money checks raising questions; op map (R19).
## Uses: duties
- Obligation object `DUT-`; op map (R19).
## Uses: explore
- Bounded as-of read across relationship owners; op map, `explore` as the `conn` op (R19, R73).
## Uses: hypotheses
- Member hunches and notes; ops R43, `HYPOTHESIS_NO_REASON` (its R2) (R19).
## Uses: calculations
- `CALC-` calculations; op map (R12, R19).
## Uses: workbooks
- Member spreadsheet analysis; op map (R12).
## Uses: answers
- The plane's half of the assistant; its explain read uses `explainRefusal` (R41).
## Uses: following
- Follows bodies and registers; op map (R12, R19).
## Uses: ai-runs
- Bounded AI runs; op map (R12).
## Uses: corpus-export
- Verifiable corpus export; `export`, `exportlog` (R12).
## Uses: case-tensions
- Post-signing tensions, flags; `caseRelation` (its R1) (R14).
## Uses: op-grades
- Every op's grade; tables and `phoneOf` by reference; `affordances` checks totality and backing (R4, R11, R12, R19, R20, R36).
## Uses: file-safety
- Safe-to-open captured files; ops backing, `HOLD_NO_REASON` (its R17) (R12, R19).
## Uses: case-carriage
- What a case edition carries; fixtures `world`, `makePng` for `t38-backing.test.mjs` (R19).
## Uses: steps
- Steps toward an answer; op map (R12, R19).
## Uses: reading-guides
- What to look for per document kind; op map (R12, R19).
## Uses: investigation
- A project's milestones, reports; op map (R12, R19).
## Uses: publish-schedule
- Timed publishing of a signed edition; ops backing (R42, R19).
## Uses: project-roster
- Roster, votes, rescue; `projectScope` (its R23) and second-approval setting (R14, R19).
## Uses: case-check
- Held checks; op map, predicates (R51).
## Uses: action-holds
- Holds and pressure; `actionhold`, `actionholdrelease`, `actionpressure`, notice (R51).
## Uses: action-replies
- Reply layout; `bearingsOf` (its R1) (R58, R51).
## Uses: plan-work
- Plan management; take-up act (R51).
## Uses: case-inputs
- Pre-edition case inputs; tests only (R51).
## Uses: action-records
- Side records of an action; tests only (R51).
## Uses: ai-accounts
- AI accounts and which serves; `aikeepaway` backing (its R20), account ops (op-grades R25, R30) in `t36-backing`, `t41-backing`; the retired ops and service names (twelve) are re-pointed in this job (T53-330) (R19).
## Uses: setup-words
- Frozen word list; `word(key, vars)`, `hasWord` (its R11-R13) (R62).
