# Task summary · T53 · instance-setup

Stands for: `build/plan/current.md` 417-424 (plan block); `build/plan/T53-R1/instance-setup.md` (rows file); `build/requirements/instance-setup.md` (R1-R115); `build/layers.md` (head, layer 11 row); and the Public part (Purpose, named services) of the 30 used modules. "read R<n> whole" marks a compressed requirement whose source text binds. Layer 11 (contract: ops, member surfaces, installer; nothing below depends on them); the module uses only earlier modules in the total order (P4); layers.md rule 2: active profiles are an instance setting chosen at install. R107-R115 are all "not yet met: T53".

## Entries

- T53-351 (current.md:418; DEC-466 U5, K5471 (2)) "AI gateway's two permissions", marked `[first: settle "AI Gateway - Edit" or "Read", Secrets Store scope]`. No requirement of this module names the gateway or Secrets Store; settle first (BOB's; DEC-466 U5 and K5471 are outside the reading set).  Context: ai-accounts R40, R59 (means incl. `gateway`).
- C T52-41 (current.md:419; rows file, carried-T52-R1): W21 A-K10 MINOR: the website check's detail never names the older product's file (`civicos-group.json`); the second read stays (R8, DEC-124). Words owed. In terms: R8's fallback fetch stays; detail read by key (R96 `instance-setup.domain.detail.*`).
- T53-352 (current.md:420; N824, K5504, N1257; rows file plan-T53-capabilities.md): mail domain and switch, "receiving" only after an accepted test message, uses `mail-door` (R114); and R112 (seeding finds what a package seeded; layer id in `profile`), R113 (package layers are not arrivals) added to the plan's R107-R111. Final ids: N1257 owns R107-R109, R111-R113; R110 is the health sender (AD38, K5487); R114 N824's; R115 AI-DESIGN's readiness. R110 and R115 have no plan line but the module must meet them. Job-START tests the drafter could not run: `#seedLine` (R112), package layers as arrivals (R113).
- T53-353 (current.md:421; K5565) English in tests: convert the module's English-in-test sites to the word key and its values: assertions read the key the product reads (and placeholders' values), never a copied sentence; a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or dead assertion, kept or removed with its reason; every test touched for other entries is converted too. Sources: `tests-sweep/CENSUS.md`, `CENSUS-RX.md`. Test: the words check's baseline loses the module's files; the suite is green. Counts before TESTS-SWEEP: literal A/B files 0 / 1; regex A/B/C sites 11 / 15 / 19 (15 files). It has other T53 entries, so no "only this" model note. Matches R96 (read R96 whole).
- T53-544 (current.md:422; K5650, jurisdictions R14, R105): `seeds.test.mjs:408` compares the unmatched bodies as a set; `setup.mjs:3052` copies `records_help` as a list. Binding: jurisdictions R14 (list facts unioned in order given), jurisdictions R105 (`records_help` becomes a list of blocks keyed by `law`), R12 here (`view` carries `records_help` as `combine` gives it). K5650 not in the reading set.
- ONB-2 (current.md:423; `build/GRANTS.md`, `next.md` ONB-2): `setup.mjs:458`: the release address and the contact URL name `believeinoakland/bio`; they must name `civicsmith/civicsmith`, the old raw address still answering for copies already installed (200 on 29 Oct). In terms: `RELEASE_NOTICE_ADDRESS` (R88) and `INSTALLER_UPDATE_ADDRESS` (R90) are this module's constants, BOB's values at START; the contact URL is acquisition's `CIVICSMITH_CONTACT_URL` (acquisition R24: the one spelling, never a copy). R88's fetch rules unchanged.
- rows: `build/plan/T53-R1/instance-setup.md` (current.md:424).

## instance-setup (own requirements)

### Public

Purpose: records the producing group's slug, display name and verified domain; the jurisdiction layers the instance reads local facts from; the instance's reports (build per part, bindings, canary, runtime cost and limits); the daily check for a signed newer release, its notice and the administrators' decisions (installs nothing). No page (R83). Slug grammar `GROUP_SLUG_RE` (3-40 of `a-z0-9-`, begin and end alphanumeric). Namespaces (bio, scratch) share nothing.

- R1 `producingGroup()` answers the slug or `null`; registered with `promotion` as fact `producingGroup` (promotion R40) at start; store only.
- R2 First boot (`isFirstBoot`): bound `INSTANCE_NAME` recorded as slug (`source: bootstrap`, `recorded_by: null`) if it matches the grammar, else nothing; no later boot changes it.
- R3 `instanceGroup()` (credentialed) `{ok:true, group, recorded_at, source, recorded_by}` or the same with nulls plus `detail` (`NO_GROUP_RECORDED`); `instanceGroupPublic()` `{ok:true, group}` or `{ok:true, group:null, detail}` and no other key (Publication §7 point 1).
- R4 `instanceGroupSeed({slug, author})` (`op=instancegroupseed`): `GROUP_SLUG_MALFORMED` (C-64.2); `GROUP_ALREADY_RECORDED` (C-64.3, names held group, when, how); else records (`source: seed`, `recorded_by` stamped author or null), says earlier documents are not rewritten.
- R5 `groupNameSet({name, by})`, `groupDomainSet({domain, by, origin})` (`op=groupnameset`, `op=groupdomainset`): `GROUP_IDENTITY_NOT_ADMIN` (C-64.5) unless `by` administrator, before anything is read or validated.
- R6 Name: trimmed 1-120 chars, one line, no control chars, else `GROUP_DISPLAY_NAME_MALFORMED` (C-64.6); each set appends `{value, set_at, set_by}`; answer carries history.
- R7 Domain: lower-cased, no trailing dot, bare host (no scheme, path, port, IP literal; last label starts with a letter), else `GROUP_DOMAIN_MALFORMED` (C-64.7); each set appends the claim with `instance_address` (stamped origin, lower-cased), checks at once (R8), answers claim, check, `shown_publicly`, history, `well_known` (R100).
- R8 Check: fetch `https://<domain>/.well-known/civicsmith-group.json` via `host-governor` (admit, then report status), no redirect, 16 KiB; if `absent`, then `.../civicos-group.json` and the second decides (DEC-124; K1365 (5)). Append a dated verdict with trigger (`set`/`alarm`): `verified` exactly when a JSON object whose `instance` is the claim's address and `group` the slug; `absent` (404, 410, redirect); `mismatched` (other readable); `undetermined` (governor holds host, fetch incomplete, other status, no slug or address), never recorded as `absent`. Read R8 whole.
- R9 Re-check on the reconciling alarm one interval after the latest verdict (a day unless `GROUP_DOMAIN_RECHECK_MS`); no domain, no wake. Consumer `group-domain-recheck` via `scheduler.register`; this module calls `arm` itself.
- R10 `groupIdentityPublic()`: slug, display name only when a slug is recorded, domain with `domain_verified_at` only while the latest verdict is `verified`; else nulls and stated absence.
- R11 `groupIdentity()` (credentialed): R10 plus recorded name, both histories oldest first, current claim with latest check, at most 20 newest checks with `domain_checks_limit` and `domain_checks_truncated`, the declared stake `{stake, set_by, set_at}` with history (R77), `logo` (R84), `domain_claim.well_known` (R100).
- R77 `declaredStakeSet({stake, by})` (`op=declaredstakeset`). Refusals in order, writing nothing: `NOT_AN_ADMIN` (`notAnAdmin`; machine included); `STAKE_MALFORMED` (not trimmed 1-1,000 chars on one line, no control chars, or `null`; new C-64 row). `null` clears. Records via `setSetting` setting `declared_stake` with `by`; `public-read` reads via `getSetting` strict; none set reads `null`. Read R77 whole.
- R78 At start registers `public-read.registerGroupIdentity({identity})` with `identity` = R10's read.
- R12 `profiles()`: active ids are record-core setting `jurisdiction_profiles`; answers list with each `name`, `covers`, `conflicts` from `jurisdictions.combine`, and `view: {deadlines, venues, legal_organisations}` (`venues` each `{kind, venue}` of an `action_kinds` entry that gives one), plus as `combine` gives them `records_laws` (each `level`, `name`, `citation`, `response`, `stages`, `requesters`), `records_help`, `name`; a fact not stated, withheld or errored is absent, never an empty list; empty list = "no active profile", valid.
- R13 First boot: ids bound as `JURISDICTION_PROFILES` (comma-separated) recorded when all held and none a test profile; else nothing and `profiles()` says why.
- R14 `profilesSet`: `NOT_A_LIST`; `UNKNOWN_PROFILE` (names id); `PROFILE_IS_TEST`; `PROFILES_NOT_ADMIN` unless `by` is an administrator's own signed-in session (K102); records via `setSetting` with `by`.
- R16 `profiles()` and `profilesSet` answer from the namespace addressed, `view` included.
- R76 Both also carry `stage_findings`: per records law with `stages`, each finding of `action-grammar.lawStagesFindings(stages)` as `{law, check:"LAW_STAGE_UNKNOWN", stage}`; `[]` when none; refuses nothing; a throwing call gives `null` with why, never `[]`.
- R17 `op=bootstrap`: `service`, `version` (`VERSION`, `0.0.0` unset), `bootstrapConfigured` (live `ADMIN_TOKEN`), `credentials.bootstrapState`, `storeVersion`; with `members=1` `memberVersions` per `FLEET_BINDINGS` member asked via binding within 4 s: `SERVING` (version), `UNBOUND`, `SILENT`, `MISNAMED`; `agent-runner` answered from agent-worker's `/version` `runner` (`true` SERVING, `false` UNBOUND, else agent-worker's state). Read R17 whole.
- R80 `bootstrap` also `test_instance`: true exactly when `ai-runs.testInstance()` is true (a throw gives false); names no variable's value.
- R81 superseded by R82. R82 flat keys `part_signin`, `part_scanner`, `part_safe_view` (`true`/`false`/`null`), no `parts`, nothing nested (`membership` R132's pre-auth key set holds); `part_signin` follows `agent-runner`; the other two follow `FILE_SCANNER` alike (none: false; silent: null).
- R95 `bootstrap` to a credentialed caller only (admin-class token or administrator session) also: `team_name`, `installed_at`, `last_used_at` (credentials R65), `count_projects`, `count_documents`, `count_published`, `count_members` (whole figures, not through a viewer's sight), flat scalars, unreadable = `null`, never omitted, never `0`; no value names a member; without a credential none of the seven and exactly R132's key set. Read R95 whole.
- R103 For a signed-in caller `bootstrap` also `language` (R64 or null) and `words_version` (`translations` R20); none without a session.
- R104 Fleet `/version` asks kept 60 s per copy (isolate; for a signed-in caller also in the team's object, K4874); `Server-Timing` `fleet;dur`, `facts;dur`, `isolate;desc=<id>` with age as `dur`. Read R104 whole.
- R18 `op=selftest`: `bindings` (`STORE`; `CAPTURES`/`PUBLISHED` `true` or `"not configured"`; token bindings live or not, `DAEMON_TOKEN` `"not configured"` unset), `r2Configured`, store stats, R2 round trip under the scratch prefix; `ok` false if exactly one bucket bound, store silent, round trip fails; `MEMBER_TOKEN` is no binding; `ok` and `bindingsAllPresent` rest on `STORE`, `ADMIN_TOKEN`, `PROBE_TOKEN`.
- R19 `livefire` runs only in the namespace handed; writes a nonce-named canary bundle and R2 keys under `scratch/`; asserts by name (creation through R2 round trip, `CAS_STALE`, `OVERSIZE_INLINE`, no token published or under 16 chars); `ok: true` whenever it answers, `verdict` `pass` exactly when all passed, `failing` names every failure; tokens `ADMIN_TOKEN`, `PROBE_TOKEN`, `DAEMON_TOKEN`; member-acting runs use a session or `aik-` credential. Read R19 whole.
- R102 Every site that obtains or names the team's room uses `runtime-limits.storeStub`/`storeId`; `selftest` states `store_location` and `store_generation` as configured, never a secret.
- R105 `selftest` answers `migrations` (`extractionOf(ctx).migrationCounts()`, extraction R110) for an administrator.
- R33-R40 limits (`recordRuntimeObservation({metric, ms, detail, at})`, `runtimeObservations()`, `recordCpuProbeStep({step, elapsedMs, iterations, at})`, `cpuProbeState()`; `op=runtime`, `op=cpuprobe({iterations, budget_ms})`). R33 needs non-empty `metric`, finite `ms`, else `{recorded:false}`; first = peak and last, `samples` 1; later: last, `samples`+1, total, peak only if strictly greater; answers `{metric, peak_ms, last_ms, samples, new_peak}`; never throws. R34 per metric peak, last, samples, total, `mean_ms`, unit as recorded. R35 answers `{step, elapsed_ms}`. R36 `{steps, highest_completed, elapsed_at_highest_ms, rows, note}`; writes nothing. R37 `op=runtime` `{ok:true, measured, cpu_probe, subrequests, asymmetry}` (R34, R36, `captureLimit("subrequests")`, a sentence); any read silent = store-silence refusal. R38 `op=cpuprobe` reads R36 first (silent: refusal, nothing burned); `runtime-limits.cpuProbe` with `iterations` (min 100,000; default 2,000,000) and `budget_ms` (min 50; default 20,000), from step 0 under its own run id, each step recorded via R35 before the next; answers `{ok:true, run, state, note}`. R39 an unconfirmed checkpoint ends the probe; the op says the trail is incomplete, naming the last confirmed step. R40 each run's trail kept apart; ceiling bracketed within the run cut off. Who may call: control-plane's (`runtime` read; `cpuprobe` write). Read R33-R40 whole.
- R47 `HOSTING_CONTROL` (`heading`, `sentences`, `guide`) in DEC-109's words (anyone who can sign in to the hosting account controls your group's Civicsmith; use a group account; add another trusted person; let someone other than the administrators hold it where possible; the same account is the way back in); no acknowledgement recorded; deployer steps are `HOSTING_RECOVERY_DEPLOYER` joined only by `hostingControlBlock(cls, {deployer: true})`; `FORGOT_HELP` (`heading`, `sentences`) for every visitor. Held in `setup-fleet.mjs`. Read R47 whole.
- R83 `setupPage`, `groupLine`'s page use, `SETUP_HTML` removed; no export names a page; `HOSTING_CONTROL` stays (`screens-entry` R4, R6; `installer` R34); `page.test.mjs` stays as control. R86 amends R83-R85 (below).
- R84 `groupLogoSet({image, by})` (`op=grouplogoset`): PNG/JPEG by magic bytes, at most 200 KB, `null` clears; `NOT_AN_ADMIN`, `LOGO_REFUSED`; served at `/app/assets/group-logo` (control-plane R84). R85 `groupLanguagesSet({languages, by})` (`op=grouplanguagesset`): 1-20 tags `isLocale` accepts, else `LANGUAGE_MALFORMED` (row now `translations` R13); setting `group_languages`; `groupLanguages()` (`op=grouplanguages`, public) or the profiles' languages while none. R86: `grouplogoset` takes raw bytes with type `{raw, rawType}`; store route `grouplogo` answers bytes with `content-type`; `grouplanguages` answers `{languages}`.
- R100 One function builds `{path, body:{instance, group}}` from `instance_address` and the slug; R8's comparison reads its `body`; `groupdomainset` answers `well_known`, `groupidentity` `domain_claim.well_known`; path `/.well-known/civicsmith-group.json`; no slug or address: `null` plus `well_known_detail` (R8's `no_team_name`/`no_address` by key); public projection carries neither.
- R101 `DECLARED_OPS` (exported from `setup.mjs`) has a row for `declaredstakeset`, `disclosureshown`, `groupdomainset`, `grouplanguagesset`, `grouplogoset`, `groupnameset`, `infolevelset`, `memberlanguageset`, `officesseed`, `placewanted`, `profilesset`, `runtime`, `selftest`, `updatelater`, `updateskip`, `updatestart`, matching `op-declarations`/`op-grades` (`runtime`, `selftest` reads: `weight:"read"`, `mutating:false`); `fields` exclude stamps; descriptions by key `instance-setup.declared.<op>`. Read R101 whole. R107, R114, R115 ops are declared likewise.
- R50 `officesSeed({by})` (`op=officesseed`) and at setup: each counterparty `{role, body}` of the active profiles seeded as `office` and `body` entities with profile identifiers (`ids.office`, `ids.body`; `entities.addIdentifier`), `post_in` and `part_of` lines (to `within`; `lines.recordLine`), machine-attributed, system-asserted; seeded again = `already: true`; none deleted; answer lists seeded, held, could not (why); job measures what the first profile seeds (N613). Read R50 whole.
- R51 Profile body matched to a Legistar `BodyId` only after term-fold and body-variant normalisation and an exact match; adds `BodyId` as scheme identifier (basis the capture); no or many matches = unmatched, with candidates, never a near name.
- R52 Seats from captured `persons` and `officerecords`: `office`, `seat_on`, `person` (Legistar `PersonId`), `holds` line with `capacity` (`elected`/`appointed` per jurisdictions R60, else `undetermined`), bounds as given, "as recorded by Legistar", machine-attributed; two `PersonId`s of one name = two persons naming each other, never merged; no contact field; a body with no office records seeds nothing, stated; keyless. Read R52 whole.
- R93 `officesSeed` also seeds each forum (jurisdictions R94) as a `body` entity with `forum_kind` and `ids`; `already` / `unseeded` with why; answer lists forums beside offices.
- R53 `assistantState()` `{on, set_by, set_at, reason}` from `ai-accounts.aiKeepAwayState()`: `on:false` exactly while kept away (unreadable = kept away, `reason` null), else `on:true`; `assistantSet` and `ASSISTANT_ENABLED` retired; writes nothing, never throws.
- R54 `disclosureShown({member, version, by})` appends who, when, version; `disclosureOf({member})` `shown:false` unless recorded at the current version; exported for the composition root to register with `ai-accounts.registerDisclosureRead` (its R23); this module registers nothing with ai-accounts. Read R54 whole.
- R55 While `on:false`, asks and runs are refused `AI_KEPT_AWAY` (`ASSISTANT_OFF`/C-119.5 retired) with the reason, who and when; `assistantGate()` stays exported (shape unchanged; `store-door` R10) and answers `ai-accounts.aiKeptAway()` as given. Read R55 whole.
- R115 `assistantReadiness({viewer})` (`op=assistantreadiness`, any signed-in member; class admin and member, `machineClasses` [], read): `{state:"ready", accounts_on:n}` (`screen.ai.ready` `{n}`, `.one`), `{state:"not_ready", reason:"no_account_on"}` (`screen.ai.notready`), `{state:"project_only", projects:[...]}` (`screen.ai.projectonly` `{project}`; id and name of visible projects only). Reads `ai-accounts.accountsOnSummary` (its R74); keep-away stays R53's; a member's own accounts never counted; unreadable = `not_ready`/`unreadable`; writes nothing. Read R115 whole.
- R60 `placeWantedSet({name, by})` (`op=placewanted`): administrator only (`NOT_AN_ADMIN`); trimmed 1-200 chars, one line, else `PLACE_NAME_MALFORMED`; `null` clears; appended with who and when. `placeWanted({viewer})` (`op=placewantedstate`) `{name, set_by, set_at, matches}` to an administrator, else `NOT_AN_ADMIN`. Held only in the group's Civicsmith, carried by nothing outward.
- R62 At each start a held non-test profile matching the named place (folded `name`/`covers`, exact), not held when the name was set or last compared, is recorded once as arrival `{name, profile, found_at}`; `placeArrivals({viewer})` to administrators only (`[]` else); registered with `queue-producers.registerPlaceArrivals` (its R38); leaves when made active or the name changes; tells no one outside administrators.
- R109 `placeWantedSet` accepts a set of names (state, county, city); an arriving layer whose `place` or `covers` matches is an arrival, one per layer; made active with `layersSet`; the arrival says the team's entries keep working in the team layer and stay beside the shipped layer's (jurisdictions R117). Control: an active layer is not an arrival.
- R63 Member- and founder-facing strings say "your group's Civicsmith" or need no name; never "copy", "instance", "plane" or "server" for it; "installation" only for the hosting subject.
- R64 `memberLanguageSet({language, by})` (`op=memberlanguageset`): the member's own act; machine refused `MACHINE_CANNOT_SET_LANGUAGE`; `language` valid exactly when `jurisdictions.isLocale` is true, else `LANGUAGE_MALFORMED`; `null` clears; appended with when. `memberLanguage({viewer})` (`op=memberlanguage`) answers only the viewer's own `{language, set_at}`.
- R79 `infoLevelSet({level, asked?, by})` (`op=infolevelset`): the member's own act; `level` `prompt`|`pause`; refusals writing nothing: C-64.28 `MACHINE_CANNOT_SET_INFO_LEVEL`, C-64.29 `INFO_LEVEL_UNKNOWN` (level, or `asked` other than absent/true/false); `asked:true` sets `asked_at` only when none recorded. `infoLevel({viewer})` (`op=infolevel`) own `{level, set_at, asked_at}`; default `prompt`, `set_at` null.
- R65 `groupDescriptionDraft({answers, assistant, viewer, by})` (`op=groupdescriptiondraft`): `answers` `[{question, text}]`, text 0-1,000; answers `{focus, purpose}` each `{text, label:{kind:"machine", asked_by}}` within membership R109 limits (1,000, 4,000); passes `wizard-scripts` R25 `checkDraft`; writes nothing; account via `ai-accounts.accountFor`, `draft` limits (`ai-use` R3). Refusals in order: `NOT_AN_ADMIN`; `AI_KEPT_AWAY`; `NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`; `GROUP_DRAFT_NO_ANSWERS`; unserved: `ASSISTANT_DRAFT_UNAVAILABLE`. Read R65 whole.
- R66 `adminRecoveryStep({viewer})` (`op=adminrecoverystep`): `{ok:true, administrators, codes_held, remaining, met}` (`activeAdmins()`; `credentials.recoveryCodesState`; `met` = at least 2 administrators and codes held); `NOT_AN_ADMIN` for non-administrator or machine; silent provider = store's silence (R43).
- R96 Every `detail`, `note`, `why` of the listed parts is read via `setup-words` `word(key, vars)`, never written here: website check `instance-setup.domain.detail.*` (`verified`, `mismatch`, `not_json`, `no_file`, `redirected`, `other_answer`, `not_finished`, `held`, `no_team_name`, `no_address`, `both_paths`; read R96 for fills), `instance-setup.offices.detail.no_profile`, `.bodies.detail.no_profile`, `.profiles.detail.none_active`, `.stages_unchecked`, `.assistant.detail.keep_away_unread`, `.disclosure.detail.not_shown`, `.no_member`, `.updates.detail.*` (twelve keys); each writing act's `note` is a `setup.note.*` key, each `why` a `setup.why.*` key; keys are the module's entry in `words-reads.json` (regenerated at the job's end); refusal `detail` is not keyed; unkeyed fills left empty and reported; shapes unchanged; no test holds English. Read R96 whole.
- R97/R98 `setup-fleet.mjs`: `HOSTING_CONTROL`, `FORGOT_HELP`, `HOSTING_RECOVERY_DEPLOYER` give each text as `word(key)` (`screen.hosting.heading`, `.s1`-`.s5`, `.guide`; `screen.forgot.help.heading`, `.s1`, `.s2`; `setup-fleet.hosting_recovery_deployer`; guide name `setup-fleet.name.replace_time_password`); the leaf imports only `setup-words` `index.mjs`; installer bundle holds no `bio-plane/src/plane/` or `store.mjs` module.
- R106 `updateNotice` also `setup` `{version, installed_at}` of the oldest `running_releases` row, else `null`.
- R88 Consumer `update-check` (`scheduler.register`): daily at a drawn, kept UTC minute (`update_check_slot`); plain GET of `RELEASE_NOTICE_ADDRESS` via `host-governor`, headers `accept` and `UPDATE_CHECK_USER_AGENT` (`Civicsmith-update-check/1`) only, 64 KiB, `redirect:"manual"`; accepted only if `signatures.verifyReleaseNotice(notice, sig, running, RELEASE_KEYS)` is `ok:true`; same/running = `none`, older = `NOT_NEWER`; notes plain text, never markup; each run appends `{at, outcome}` (`found`, `none`, `unreachable`, `MALFORMED`, `BAD_SIGNATURE`, `UNKNOWN_KEY`, `NAMESPACE`, `NOT_NEWER`...); records the release now running at start. Read R88 whole. R92: `tick(now)` hands `now` to `#runUpdateCheck`; `update_checks.at` is that `now`.
- R89 `updateNotice({viewer})` (`op=updatenotice`, administrators, `NOT_AN_ADMIN`): `running`, `last_check`, `ready` (newest unskipped newer notice with `decision`), `earlier` (limit 50, `earlier_truncated`), `holder`, `viewer_holds` (`membership.hostingAccess`). `updateNoticeState()` `{ok, running, ready, decisions}`; never throws; silence = R43. Read R89 whole.
- R90 `updateStart({version, by})` (`op=updatestart`; `{ok:true, version, address}`, `INSTALLER_UPDATE_ADDRESS` with `?version=`), `updateLater` (`op=updatelater`; 14 days, or next local day in the first active profile's zone for `security`), `updateSkip({version, reason, by})` (`op=updateskip`; reason 1-1,000 chars, else `UPDATE_SKIP_NO_REASON`); `NOT_AN_ADMIN` first, `UPDATE_NOT_READY` unless the `ready` release; append-only; C-64.32, C-64.33. Read R90 whole. R91 these tables are append-only, exempt from purge; no deploy credential.
- R94 Translation workspace left; eleven delegates remain (`translationDraftRefusal`, `translationDraft`, `readingLanguage`, `translationDraftRecord`, `translationGrant`, `translationAdopt`, `translationConfirm`, `translationRevert`, `translationMark`, `translations`, `interfaceWords`); `INTERFACE_WORDS` re-export; registers `memberLanguage` via `translations.registerMemberLanguageRead` at start and on first use. R99 `readingLanguage` and `#translations()` leave once `store-assembly` R54 merges. Read R94 whole.
- R107 `layersSet({layers, by})` (`op=layersset`; `PROFILES_NOT_ADMIN`): records `jurisdiction_profiles` (federal, then by level and place, each after what it sits within; team layer never in it); any set of held Civicsmith layer ids; nothing below federal preselected; `LAYER_NO_FEDERAL`, `LAYER_PARENT_MISSING`, `LAYER_NOT_SHIPPED` (team id), `PROFILE_IS_TEST`; federal offices not seeded. Read R107 whole.
- R108 `profiles()` lists the chain (setting's layers plus the team layer from `local-facts` R30) with `level`, `place`, `origin`, `coverage` (jurisdictions R108), fact count, `within`; `conflicts` per jurisdictions R102; `view.layers`; `stage_findings` over the chain.
- R110 Consumer `health-send` beside `update-check`, daily at a drawn, kept minute: `ai-use.healthReport` (R33); per report `POST` to `HEALTH_ADDRESS` (`ai-issuer` R26; set at START beside `CATALOGUE_ADDRESS`) via `host-governor`, headers only `content-type` and the fixed user agent, no redirect; on `2xx` `healthSent`; else retry next run; switch off = `null`, no request. `ai-issuer` not in the reading set.
- R111 An update leaves `jurisdiction_profiles` and the team layer as they are (`oakland-alameda` resolves to its layers, jurisdictions R114); new layers offered as arrivals, not activated; recorded requests, clocks, filings unchanged.
- R112 `officesSeed` seeds each active layer's `counterparties` as `combine` hands them; `seed_offices`/`seed_bodies` (`setup.mjs:642-660`) and seed-line keys (`post_in|<office>|<body>|<profile>`, `setup.mjs:1827, 1835`) take the layer id in `profile`; before a line, looks for one of the same kind and two ends under any `profile` key and answers `already` (`#seedLine`, `setup.mjs:1763-1775`); office entity records `layer` (`entities` R70).
- R113 `place_arrivals.profile` (`setup.mjs:680-689`) holds the layer id; `placeArrivals` answers `layer` beside `profile`; `place_seen.profiles` (`setup.mjs:673-677`) expanded to layers before comparison; old rows answer `layer` = `profile`; setting gains no field (`setup.mjs:1590, 1665`); never the team layer.
- R114 An administrator (`GROUP_IDENTITY_NOT_ADMIN`, R5) sets `MAIL_DOMAIN` (validated as R7) and turns "Email into the record" on or off, each a dated act in history as R6 (`{value, set_at, set_by}`); page states steps by key, shows "receiving" only after a test message `mail-door` (its R2) accepted; no domain: `MAIL_NOT_SET_UP`; no token or account id asked (installer R85). Read R114 whole.
- Retired, number never reused: R15, R20-R22, R23-R25, R32, R44-R46, R48, R49, R56-R59, R61, R67-R75, R87.

### Private

- Uses (see the Uses sections; R12-R14, R37, R50-R55, R65, R88, R110, R114): the used modules are those below plus `people`, `legacy-checks` (C-64 rows, R30); membership's `notAnAdmin` is now `member-roster` R28; T53 new `modules.json` edges: `ai-use` (layer 6), `mail-door` (layer 3), `local-facts` through the existing composition.
- R26 Slug recorded once; histories and check log append-only. R27 Display name enters no signed bytes. R28 `instance_group`, `group_identity_history`, `group_domain_checks` declared exempt from purge. R29 `by`, `author`, `origin` are the control plane's stamps. R30 C-64.2, C-64.3, C-64.5, C-64.6, C-64.7 are invariants here (C-64.1 promotion's; C-64.4 admission's). R31 No place named in behaviour or text; a location hint is not a jurisdiction. R41 Runtime observations and probe trail exempt from purge. R42 At start registers a capture listener (capture R55) recording `capture_work_bytes` via R33. R43 A store refusal below 500 is relayed with the store's status, code, sentence via `storeRefusal`; only no answer is `STORE_DID_NOT_ANSWER` with the correlation id.
- Satisfies: State Rules §3.1; Publication §7 points 1-3; Distribution §2, §5, §6; Membership Architecture v2 §4.1, §4.6, §9; layers.md rule 2; Action v0.2 §5 rules 11, 21; SCHEDULER.md.

## Uses: jurisdictions

- R8, R9 `list()` `[{id, name, covers, test}]` by `id`; `get(id)` profile or `null`; never throw. R12-R16 `combine(list)` `{ok:true, view, conflicts}` or `{ok:false, errors}` (`UNKNOWN_PROFILE`, `INVALID_PROFILE`, `NOT_A_LIST`); view has `profiles`, `covers`, `test`, `profile` per fact; list facts unioned in order; one-value facts withheld on disagreement into `conflicts`; empty list valid. R37 `isLocale(value)` true exactly for one well-formed BCP 47 tag; never throws. R24, R59, R60 counterparty `ids`, `within`, `organisation`; `member_types`. R76, R93, R94, R105 `stages`, `records_help` (list of blocks per law), `forums`. R99-R108, R114, R121 layers, forest checks (`LAYER_*`), `view.layers`, `COUNTERPARTY_LEVELS` gains `federal`, `oakland-alameda` is a package of four layers, `nameResolve`.

## Uses: runtime-limits

- R3 `cpuProbe({checkpoint, startStep, maxStep, iterationsPerStep, budgetMs, now})` `Promise<{completed, elapsed_ms, reason}>`. R11, R12 `liveToken(v)` false when its sha256 is in `PUBLISHED_TOKEN_HASHES`. R28 `storeId`, `storeStub` are the only way to obtain the team's room (R43-R44 jurisdiction rooms).

## Uses: legistar-reader

- Reads captured Legistar JSON as "as recorded by Legistar" rows (R2), no contact field (R3). R4 `bodies`; R5 `persons` (`same_name_as`); R6 `officerecords` `{OfficeRecordId, PersonId, BodyId, role, start, end}`.

## Uses: record-core

- R21 `declarePurge(module, tables, {exempt?})` (`TABLE_NAME_INVALID`, `TABLE_DECLARED`). R25 `getSetting(name, {strict?})`, `setSetting(name, value, by)` (refusals `SETTING_NAME_REQUIRED`, `SETTING_BY_REQUIRED`, `SETTING_VALUE_REQUIRED`, `SETTING_NOT_JSON`, `SETTING_INVALID`); R26 `jurisdiction_profiles` ordered distinct ids. R54 `isFirstBoot()` true throughout the first boot. R92 `getSettingAt(name, at)` (T53).

## Uses: membership

- `notAnAdmin(by, act, extra?)` → `{ok:false, reason:"NOT_AN_ADMIN", code, check, translation, by, detail}` (C-96.1), now `member-roster` R28, re-exported by `membership`; `isAdministrator` (member-roster R23), `activeAdmins()` (R29), `hostingAccess({limit})` (R8, R47).

## Uses: credentials

- R2 `bootstrapState`, R46 `recoveryCodesState`, R65 session activity.

## Uses: promotion

- Purpose: the one write path for a bundle, and the gate. Here: `registerFact` (fact `producingGroup`, R40).

## Uses: host-governor

- R1-R6 `governorAdmit({host})` `{admitted:true, wait_ms, appetite_per_min}` or `{admitted:false, reason, retry_in_ms}`; R7-R10 `governorReport({host, status, retry_after_ms})` `{recorded, ...}`; R15-R17 `governedFetch(target, {userAgent, fetch, governor})`; R30 a refused host answers within 3 s.

## Uses: provenance

- Purpose (R1 there): the trust root. No service named.

## Uses: acquisition

- R24 `civicsmithUserAgent(version, instance, purpose)` `Civicsmith/<version> (+<CIVICSMITH_CONTACT_URL>; instance <instance>; <purpose>)`; the one spelling (split from `capture`, K649 (1)).

## Uses: capture

- R23 `captureLimit(runtime)` / `recordCaptureLimit`: the outbound-request ceiling is learned by being refused; `probeDue` when none or after 25 unrefused runs.

## Uses: extraction

- Purpose: readings from captured bytes; mints no content, fetches nothing. Here: term fold (R51, R62).

## Uses: entities

- Purpose: the entity axis; resolves and grades references. Here: `createEntity`, `addIdentifier`, `entityByIdentifier`; `forum_kind` (R54); `layer` (R70).

## Uses: lines

- Purpose (R5 there): dated, graded lines; home of `holderAt`. Here: `recordLine`.

## Uses: scheduler

- R8 `register(module, consumer)` `{name, key, due(now), wake(now), tick(now)}` once at start, `CONSUMER_DECLARED` on repeat; R4 `arm`; R9 later modules call `arm` themselves; R7 cadence is the owner's; R30, R31 firing budget about 10 s.

## Uses: wizard-scripts

- R25 `checkDraft`, R24, `ASSISTANT_DRAFT_UNAVAILABLE`.

## Uses: queue-producers

- R38 `registerPlaceArrivals`.

## Uses: record-grammar

- Purpose: shared grammar, no store or clock (R54 there). Not in this module's Uses.

## Uses: action-grammar

- `lawStagesFindings` (R25), `CORRESPONDENCE_STAGES`.

## Uses: public-read

- R34 `registerGroupIdentity`.

## Uses: ai-runs

- R78 `testInstance()`.

## Uses: ai-accounts

- Purpose: sealed AI accounts and which serves an act; from T53 five means (R40, R59). Here: R7 `aiKeptAway`, `accountFor`; R21 `aiKeepAwayState`; R23 `registerDisclosureRead`; R74 `accountsOnSummary`.

## Uses: signatures

- R45, R48 `verifyReleaseNotice`, `RELEASE_KEYS`; R47 caps parts at 8,000 chars.

## Uses: civil-time

- (R5 there) `localDay`, `bounds` (R90).

## Uses: setup-words

- `word(key, vars)`, `hasWord` (R11-R13).

## Uses: translations

- R11 `registerMemberLanguageRead`, delegates, R13 `LANGUAGE_MALFORMED`, R20 `words_version`.

## Uses: test-support

- Purpose: test sandbox and generators (R15 there). For this module's tests.

## Uses: ai-use

- R32 `healthSent`, R33 `healthReport`; R3 `draft` limits.

## Uses: mail-door

- R2 whether a test message was accepted.

## Uses: local-facts

- R30 the placeless team layer handed to `combine`.
