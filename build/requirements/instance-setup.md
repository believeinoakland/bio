# instance-setup — requirements

**Status** · DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 11. Code today (measured on `tranche/T3` @ `f324df9b`): its own paths `bio-plane/src/setup.mjs` (1,424 lines: `groupLine`, `setupPage`, `SETUP_HTML` and its page script) and `bio-plane/src/livefire.mjs` (247: `livefire`); and, moving in at its extraction (K69, N38; `build/extraction/instance-setup.md` has the table), the group-identity cluster C-64 in `bio-plane/src/store.mjs` 32566–32933 (`GROUP_SLUG_RE`, `#producingGroup`, `#recordGroupAtFirstBoot`, `NO_GROUP_RECORDED`, `instanceGroup`, `instanceGroupPublic`, `instanceGroupSeed`, `#groupUndetermined`, the display name and domain methods to `GROUP_DOMAIN_CHECKS_MAX`), the alarm consumer `group-domain-recheck` (3745–3753), the fact registration (900), the dispatch entries (49548–49560); `schema.mjs` 42–62 (`instance_group`) and 3622–3658 (`group_identity_history`, `group_domain_checks`); `bio-checks.mjs` 14080–14147 (`INSTANCE_GROUP_CHECKS` less C-64.1 and C-64.4); and from `index.mjs` `publicInstanceGroup` (3744–3766), `FLEET_BINDINGS` and `memberVersions` (4043–4097), the `instancegroup` and `groupidentity` arms (6257–6311), the `bootstrap` arm (6829–6847), `selftest` (7311–7384) and `livefire` (7402–7437). `from` should read `["legacy-store", "legacy-checks", "legacy-index"]`. Not yet met: R12–R16 (N10), R25 (D-719). Carried old-plan row: D-719. N65 (3) and N66 folded by a drafting worker for BOB #43, 2026-09-26: R32, not yet met; the first boot named as record-core's `isFirstBoot` (its R54).

**Size (P6).** About 2,440 lines once extracted (about 1,860 of code): its own files 1,671 (1,230), `store.mjs` 390 (245), `schema.mjs` 58 (24), `bio-checks.mjs` 68 (50), `index.mjs` 262 (127). Well under 4,000.

## Public

### Purpose

What this copy is and whose it is. It records once which group produces the record, and holds the group's display name and its verified domain beside that slug; it records which jurisdiction profiles the instance reads its local facts from; it serves the page a group first meets at its copy's root (claim, sign-in, enrolment); and it answers the instance's reports on itself: which build each part is serving, whether its bindings are healthy, and the release's canary.

### Provides

Terms. The **slug** is the producing group's short name, in `GROUP_SLUG_RE`'s grammar (3 to 40 of `a-z`, `0-9` and `-`, beginning and ending with a letter or digit). The **first boot** is the boot at which the store had never held the record's schema (record-core's `isFirstBoot`, its R54). **Scratch** is the instance's rehearsal namespace; each namespace holds its own values and nothing here crosses between them.

**The producing group: `producingGroup()`, `instanceGroup()`, `instanceGroupPublic()`, `instanceGroupSeed({slug, author})`** (`op=instancegroup`, `op=instancegroupseed`)
- **R1** `producingGroup()` answers the recorded slug, or `null` when none is recorded. It is the one reader: this module registers it with `promotion` as the fact `producingGroup` (promotion R40) at start, and every stamp and default in the record reads it there. It reads the store only, never a deploy-time variable.
- **R2** At the first boot, the value bound as `INSTANCE_NAME` is recorded as the slug (`source: bootstrap`, `recorded_by: null`) when it matches `GROUP_SLUG_RE`; absent or malformed, nothing is recorded. No later boot records or changes it, whatever `INSTANCE_NAME` then says.
- **R3** `instanceGroup()` (a credentialed read) answers `{ok: true, group, recorded_at, source, recorded_by}`, or `{ok: true, group: null, recorded_at: null, source: null, recorded_by: null, detail}` with the stated absence (`NO_GROUP_RECORDED`). `instanceGroupPublic()` answers `{ok: true, group}` or `{ok: true, group: null, detail}` and no other key (Publication §7 point 1).
- **R4** `instanceGroupSeed` (the root of trust's act; `author` is the control plane's stamp): a slug outside the grammar is refused `GROUP_SLUG_MALFORMED` (C-64.2); a store that already records a group is refused `GROUP_ALREADY_RECORDED` (C-64.3), naming the held group, when and how; in both, nothing is recorded. Otherwise it records the slug (`source: seed`, `recorded_by` the stamped author, or `null`) and says that documents already written are not rewritten.

**The display name and the domain: `groupNameSet({name, by})`, `groupDomainSet({domain, by, origin})`, `groupIdentityPublic()`, `groupIdentity()`** (`op=groupnameset`, `op=groupdomainset`, `op=groupidentity`)
- **R5** Both sets are refused `GROUP_IDENTITY_NOT_ADMIN` (C-64.5) unless `by` (the control plane's stamp) is an administrator (membership R64), before anything is read or validated.
- **R6** A display name is the trimmed text, 1 to 120 characters, one line, no control characters, else `GROUP_DISPLAY_NAME_MALFORMED` (C-64.6). Each set appends `{value, set_at, set_by}` to the name's history; the answer carries the history.
- **R7** A domain is lower-cased with a trailing dot removed and must be a bare host name (no scheme, path, port or IP literal; the last label begins with a letter), else `GROUP_DOMAIN_MALFORMED` (C-64.7). Each set appends the claim with `instance_address`, the origin the control plane stamped (`http(s)://host`, lower-cased), checks it at once (R8) and answers the claim, the check, `shown_publicly` and the history.
- **R8** A check fetches `https://<domain>/.well-known/civicos-group.json` through `host-governor` (admit, then report the status), following no redirect and reading at most 16 KiB, and appends one dated verdict with its trigger (`set` or `alarm`): `verified` exactly when the file is a JSON object whose `instance` is this claim's address and whose `group` is the recorded slug; `absent` for 404, 410 or a redirect; `mismatched` for any other readable answer; `undetermined` when the governor holds the host, the fetch does not complete, the status is anything else, or there is no slug or no address to compare. An `undetermined` is never recorded as `absent`.
- **R9** The current claim is re-checked on the reconciling alarm, due one interval after its latest verdict (a day unless the instance sets `GROUP_DOMAIN_RECHECK_MS`); an instance claiming no domain holds no wake.
- **R10** `groupIdentityPublic()` answers the slug, the display name only when a slug is recorded, and the domain with `domain_verified_at` only while the latest verdict on the current claim is `verified`; otherwise `null`s, with the stated absence when no slug is recorded.
- **R11** `groupIdentity()` (a credentialed read) answers R10 and also the recorded name, both histories oldest first, the current claim with its latest check, and at most the 20 newest checks with `domain_checks_limit` and a measured `domain_checks_truncated`.

**The jurisdiction profiles: `profiles()`, `profilesSet({profiles, by})`** (N10)
- **R12** The active profiles are record-core's setting `jurisdiction_profiles` (record-core R26), an ordered list of held profile ids. `profiles()` answers the list with each profile's `name` and `covers`, and the `conflicts` `jurisdictions.combine` reports over it; an empty or unset list is answered as "no active profile", which is valid (jurisdictions R16). *(not yet met: N10)*
- **R13** At the first boot, the ids the installer bound as `JURISDICTION_PROFILES` (comma-separated, in order) are recorded as the setting when every id is held and none is a test profile; otherwise nothing is recorded and `profiles()` says why. *(not yet met: N10)*
- **R14** `profilesSet` replaces the list: `NOT_A_LIST`; `UNKNOWN_PROFILE` naming an id not held; `PROFILE_IS_TEST` naming a test profile; `PROFILES_NOT_ADMIN` unless `by` is an administrator's own session (Open for Bob 1). It records through `setSetting` with `by`, so each change is dated and attributed. *(not yet met: N10)*
- **R15** The page (R20) shows the active profiles by name, and offers an administrator the choice among every held non-test profile, none preselected. *(not yet met: N10)*
- **R16** `profiles()` and `profilesSet` answer from the namespace addressed; a scratch store holds its own list. *(not yet met: N10)*

**The instance's reports: `bootstrapReport(env, fp, {members})`, `selftest(env, store, caller)`, `livefire(env, store, {capacity, viewer})`** (`op=bootstrap`, `op=selftest`, `op=livefire`)
- **R17** `op=bootstrap` answers `service`, `version` (this isolate's `VERSION`, `0.0.0` when unset), `bootstrapConfigured` (a live `ADMIN_TOKEN`: set, and not a published value), membership's `bootstrapState` (R72) and `storeVersion` read from the record store's own environment, never the isolate's; with `members=1` it adds `memberVersions`, for each member in `FLEET_BINDINGS` its own `/version` asked through the binding within 4 seconds: `SERVING` with its version, `UNBOUND`, `SILENT` or `MISNAMED` (another worker answered).
- **R18** `op=selftest` answers `bindings` (`STORE`; `CAPTURES` and `PUBLISHED` each `true` or `"not configured"`; each token binding live or not, `DAEMON_TOKEN` `"not configured"` when unset), `r2Configured`, the store's stats, and an R2 round trip under the scratch prefix; `ok` is false when exactly one bucket is bound, when the store does not answer, or when the round trip fails.
- **R19** `livefire` runs only against the namespace it is handed, writes only a nonce-named canary bundle there and R2 keys under `scratch/`, and asserts by name: creation, `EXISTS`, a revision on the right base, `row_version`, `CAS_STALE` on a stale and on a garbage base, the winning revision live, the superseded one in history, the promotion records and manifest projected, `OVERSIZE_INLINE`, the nonce read back, `allocid` gapless, the lease base and a second actor denied, no configured token a published value or under 16 characters, and R2 (both buckets or neither; round trip, range read and sized throughput when bound). It answers `ok: true` whenever it answers, `verdict` `pass` exactly when every assertion and R2 passed, and `failing` naming every failed assertion (never empty on `fail`).

**The page at the root: `setupPage(read)`, `groupLine(read)`**
- **R20** `setupPage` returns the page with one group line, from one read `{answered, result}`: *recorded* (the display name and `·` when given, the slug, "group instance", and the domain with its date only when `domain_verified_at` is a dated string); *none* (the read answered `group: null`); *unread* (anything else, never "none"). Every value is HTML-escaped.
- **R21** The page removes the URL fragment on load. `#boot=` pre-fills the one-time password; `#invite=` asks `op=invitelook` and shows enrolment, or states that the link is not live and hides the form.
- **R22** It drives only the public ops `bootstrap`, `claim`, `login`, `invitelook` and `enroll` before sign-in; a claim needs a password of at least 12 characters typed twice alike.
- **R23** After sign-in it offers only the acts `op=whoami` reports the session holds, and the members and keys section only to a session that administers.
- **R24** Its intake form offers the catalogue's own first states, headings and risk tiers; for an action, a named counterparty or "not determined yet" with a basis, and a risk tier, with nothing preselected (an untouched tier is written `undetermined`).
- **R25** A bundle's history is listed in write order when every entry carries a distinct integer `seq`, else by snap key, and the page says which order it shows. *(not yet met: D-719)*
- **R32** The risk tiers R24's form offers, and the tier it writes, are `actions`' `RISK_TIERS` and `riskTierState` (N65 (3)), never a copy; the page states `action_kind: other`, a product kind (actions R10), and offers no other kind. *(not yet met: N65; the page reads `RISK_TIERS` and `riskTierState` from `legacy-checks`)*

## Private

### Uses

- `jurisdictions`: `list`, `get`, `combine` (R12–R16).
- `legacy-checks`: C-64's rows until they move (R30); `STATES`, `HEADINGS`, `deriveInquiryTitle` for the page, and `RISK_TIERS`, `riskTierState` until `actions` holds them (R32); `civicosUserAgent`.
- `actions`: `RISK_TIERS`, `riskTierState` (R24, R32). *(not declared)*
- `runtime-limits`: `liveToken`, `PUBLISHED_TOKEN_HASHES` (R17–R19).
- `record-core`: `recordOf(ctx)`, `getSetting`/`setSetting` (R12–R14), `declarePurge` (R28), and `isFirstBoot` (its R54; R2, R13). *(not declared)*
- `membership`: `isAdministrator` (R64), `bootstrapState` (R72). *(not declared)*
- `promotion`: `registerFact` (R1). *(not declared)*
- `host-governor`: `governorAdmit`, `governorReport` (R8). *(not declared; K69)*
- `scheduler`: `register` for the `group-domain-recheck` consumer (scheduler R8), and arming after a domain is set (R7, R9). Being later, this module calls the arm itself. `legacy-store` offers the registration until `scheduler` is extracted. *(not declared; K69)*

### Invariants

- **R26** The slug is recorded once: no act updates or deletes it, and a second value is refused (R4). The history of names and claims and the log of checks are append-only.
- **R27** The display name is presentation only: it enters no signed bytes. Signed bytes carry the slug (State Rules §3.1).
- **R28** `instance_group`, `group_identity_history` and `group_domain_checks` are declared to record-core exempt from purge, in both forms (record-core R21, R23); the profiles setting is exempt as every setting is (record-core R25).
- **R29** Nothing a caller sends names who set a value or where the instance is: `by`, `author` and `origin` are the control plane's stamps.
- **R30** Each check moves here as an invariant with its test (K6): C-64.2, C-64.3, C-64.5, C-64.6, C-64.7. C-64.1 (`GROUP_UNDETERMINED`, raised at the write) is `promotion`'s; C-64.4 (a bearer on the two sets) is `control-plane`'s.
- **R31** No place is named in this module's behaviour or outward text; local facts come only through R12.

### Satisfies

- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (`group`, the producing group's slug).
- `docs/architecture/BIO_Publication_v0_1.md` §7 points 1–3 (the public slug, the display name, the verified domain; BOB #24, BOB #27, BOB #31).
- `docs/architecture/BIO_Distribution_v0_1.md` §2 (the instance), §5 (the one act an update leaves its operator), §6 rungs 6 and 8 (the canary's verdict; each part's own build).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §4.1 (a group of one: the founder claims), §4.6 and §9 (the root of trust: the seed, the claim re-armed by a new `ADMIN_TOKEN`).
- `build/layers.md`, "No jurisdiction in the product", rule 2 (the active profiles are an instance setting chosen at install).
- `docs/development/SCHEDULER.md` (one appended consumer, self-terminating).

### Suggestions

- **Factory and start.** `instanceSetupOf(ctx, env)` (K61). The Durable Object's composition root calls it at start: registers R1's fact, the purge exemptions and the scheduler consumer, and runs R2 and R13 when record-core's `isFirstBoot()` is true. Until `control-plane` holds the root (control-plane Open for Bob 1), `legacy-index`'s `Store` export wraps `legacy-store`'s class to do it, since `legacy-store`, earlier, cannot call this module.
- **The first boot.** record-core decides it today inside `#migrate` (`PRAGMA table_info(bundles)` empty before the schema pass); it offers the answer as `isFirstBoot()` (record-core R54, N66).
- **Readers of the group elsewhere** (testify, the divide, the group bar, attribution) read `promotion`'s fact (N56) and refuse C-64.1 with promotion's row; `#groupUndetermined` stays in `legacy-store` for them until each is extracted.
- **For the installer.** It imports `GROUP_SLUG_RE` and `FLEET_BINDINGS` from here, instead of a test pinning two copies by source text (`instance-group.test.mjs`, the wizard suite).
- **Tests.** R2 and R13 need a store booted twice (first and later boot); R8 needs a fake governor and fetch covering all four verdicts; R19 runs against a scratch store and a broken fixture per arm (its own negative controls).

## Open for Bob

1. **Who chooses the active jurisdiction profiles, and when?** Nothing records them today. *Recommendation:* the installer offers the choice with nothing preselected, and the instance records it at its first boot, as it records the slug. After that, changing the list is an administrator's own signed-in act, dated and attributed, and the page warns that local facts will read differently from then on. Choosing none is allowed and stated.
2. **Is the setup page's record browser part of this module?** `setup.mjs` serves claim, sign-in and enrolment. It also serves a small member surface: browse, add, revise, inbox, and members and keys. *Recommendation:* this module keeps claim, sign-in, enrolment, the healthy panel and the instance's settings (R20–R24). The record surfaces follow ruling 4: a UI placeholder, kept working, with no new work planned except the carried D-719 (R25).
3. **Confirm D-436's three provisional decisions as requirements.** The code calls them provisional: (a) the slug is recorded at the first boot from the name the installer bound (R2); (b) a store that already held a record is seeded once by the root of trust, never automatically (R4; the installer only tells, installer R18); (c) with nothing recorded, no default is ever supplied (C-64.1). *Recommendation:* confirm all three. They are what Publication §7 point 1 already relies on.

## Decided by BOB

- C-64 splits: C-64.1 goes to `promotion`, C-64.4 goes to `control-plane`, and the rest come here. `withProducingGroup` and `stampGroup` are already `promotion`'s (K69's list named `#stampGroup`, which T3 moved).
- `from`: `legacy-store`, `legacy-checks` and `legacy-index`. Uses gain `record-core`, `membership`, `promotion`, `host-governor` and `scheduler`.
- The instance's reports (`bootstrap`'s Worker arm, `selftest`, `livefire`) are this module's. The `/` route itself is `control-plane`'s, which calls R20.
- The profiles reach the instance at install as a plain binding, `JURISDICTION_PROFILES`, recorded once at first boot (R13), the same channel as the slug.
