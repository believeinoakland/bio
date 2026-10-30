# Task summary · T53 · store-request

Stands for: `build/plan/current.md` 478-482; `build/plan/T53-R1/store-request.md`; `build/requirements/store-request.md` (R1 to R28, all "not yet met (T51)"); `build/layers.md` (head, layer 11); the Public part of the used modules below. Sources stay binding: "read R<n> whole" means read it in full before touching it. Layer 11, directly after `store-assembly`; code `bio-plane/src/store-request/`, tests `bio-plane/test/m/store-request/`; uses only earlier modules of `build/modules.json` (P4; R21). `signin-door` is retired whole yet R17 (5) and R21 name it (T53-375).

## Entries

- C T52-48 (current.md:479; rows file, carried-T52-R1) · R22 *(not yet met: T52)* · the split by copy, then delete: when the job closes `control-plane/index.mjs` holds none of R2 to R13, R23, R24 and calls `innerRequest` for every store request; the constants of R24 and `promotedTypeOf` are imported from here by what still reads them. Wave A writes the module beside `control-plane`; Wave B has `control-plane` call it and delete its copy (retiring its R17, R37, R38, R73, R96, R113). `promotedTypeOf` has no id of its own: read R11 and R22 whole.
- T53-375 (current.md:480; rows file, FOLD-AI §2.8) · K5457 · off the retired AI ops: re-pointing as a CHANGE in this round, no aliases. Named here and retired by `op-declarations` R90: `projectkeyset` (R3 `BODY_ONLY` `key`), `accountreferenceset` (R9's example of an op declaring a `member` stamp: name another op or none), `subscriptiondisconnect`, `subscriptionsignin` (R17 (5), through `signin-door`); `signintrace` (R17 (5)) is retired by `signin-door` R3, R5. Also retired by R90: `groupkeyset`, `groupkeyremove`, `groupkeyswitch`, `groupkeynoticeseen`, `accountreferenceremove`, `projectsigninset`, `projectaccountremove`, `projectaccountswitch`, `projectkeynoticeseen`, `groupkeystate`, `accountreference`. R90 declares new `ai*` ops; by R14 an op named nowhere in R6 to R12 gets only R2 to R5, R9, R10, R23, so the job decides from R90 (read whole) whether one needs a stamp row; `signin-door` leaves `modules.json` at BOB's layer-11 START act, so R17 (5) and R21 drop it.
- T53-376 (current.md:481; rows file, plan-T53-tests-english) · K5565 · English in tests: convert the module's English-in-test sites to the word key and its values (each assertion reads the key the product reads, never a copied sentence); a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is kept as input data or removed with its reason; every test the job touches is converted too (the words check refuses English in a new or changed test). Evidence `tests-sweep/CENSUS.md`, `CENSUS-RX.md`. Counts: literal 0 A / 0 B files; regex 0 A / 1 B / 0 C sites (1 file). Test: the words check's baseline loses the module's files and the suite is green. Model `sonnet-5-5` (a B site needs a key first). R21: no member-facing English; `words-reads.json` holds no list for this module.

## store-request (own requirements)

### Public

Purpose (R1): one function takes an admitted caller and a page's request and makes the store's: every stamp set from the caller and none taken from the request, every credential in a header, the actor written into the body where the owner reads it there. It holds no door arm, gate or answer. Over `store-assembly's world it publishes the door a screen's test talks to, the real sign-ins and the recipes of real acts.

Terms (R1): stamps, `OP_STAMPS`, the families are `op-declarations' (R10 to R33, R75); the caller is what `admission.admit` answers; a world is `store-assembly's (R90). Session halves (`admission` R30): member (`ruth`; founder `admin`), viewer (`admin` founder, else `member:<id>`), identity (`member:<id>`); each none for a non-session. C = `class:<cls>`; `token:<cls>` = `MACHINE_AUTHOR_PREFIX` + class. Actor = session's viewer, `ai` caller's `class:ai/<tokenId>`, else C. Letters: M session's member, else C. T session's member, else `token:<cls>`. I session's identity, else C. A session's member, `ai` `class:ai/<tokenId>`, else C. AI session's identity, `ai` `class:ai/<tokenId>`, else C. P session's identity, `ai` `<principal>/<tokenId>`, else C. N session's identity, `ai` principal, else C. V session's viewer, `ai` the viewer `admission` answers (R30), else C. Order: R3, R4, R6, R7, R8, R11, R12, R23; a later rule's key replaces an earlier; a key no rule sets is absent.

- **R1** `innerRequest({op, url, method, body, caller, source?, country?, userAgent?, origin?, length?, resolving?, replay?, deferred?, secretSha?, bySecret?, mint?})`. `op` is the name after alias resolution; `url` the request address; `body` as the door read it (text, upload bytes or stream, or absent); `caller` as `admission.admit` admitted it (`cls`, `viaSession`, `member`, `viewer`, `identity`, `rights`, `caps`, `aiCred`, `storeName`, presented session token as `token`). Handed in by the door: `source` (keyed digest, never the address), `country`, `userAgent`, `origin` (scheme+host of the request's own address), `length` (`Content-Length` when a whole number, else absent), `resolving` (true when a knock resolved `pulled` was re-routed as `inboxpull`), `replay` (`{asserted, proven}`; `proven` the verified record or none), `deferred` (true when a `readheld` reading will not fit the bound), `secretSha`, `bySecret`, `mint` (R23). Answers `{url, body, headers}`: the route's in-process address (`http://x/<route>`), the body to pass (absent when none sent; a body that is not JSON text of an object passes as it came), the headers of R5; or `{refusal}` when a promotion creating a project is refused by `admission.projectCreationGate` (R11), answered as given. Synchronous, never throws, no clock, writes nothing, deterministic. `control-plane` calls it for every store request (its R136), the world's door too (R17); the gates, relays, forward and answer stay there. Test: R2 to R13 and R23 over every op `OPS` declares, each stamp name sent as a sentinel in address and body, for each caller kind (founder's session, member's, `ai` credential, each binding class).
- **R2** Route = the op's name, except `inbox`→`inboxlist`, `publish`→`publishcase`, `inboxpull`→`inboxpullfile`. The address carries every parameter of the request's address except `token` and `op`, before R3's deletions.
- **R3** Nothing the caller names survives in the address. For every op the address loses `identity` first, then the rest of `QUERY_STAMPS` (R24; eleven keys): `viewer`, `author`, `by`, `actor`, `who`, `origin`, `administer`, `aiCred`, `source`, `country`; also `secretSha`, `bySecret`, `session`, `grant`, `declared` (set only by R8). `BODY_ONLY` fields leave the address: `securitytooladd` `credentials`, `config`; `projectkeyset` `key` (retired op, see T53-375); `setpassword` `current`, `password`, `role`. For `ACT_CLOCK_OPS` (R24; twenty-one ops: an owner reads `at` as the record's time) the caller's `at` leaves; for `opencaptures`, `at` and `now` leave. Dates stated for any other op pass on.
- **R4** Declared stamps set from the caller, for each stamp in `OP_STAMPS[op]` and no other: `by` actor; `viewer` V; `author` AI; `proposer` A; `member` a session's viewer (not its member id), none for any other caller; `principal` P; `owner` I; `source`, `country` as handed in. A none value is not set. A page's `proposer`, `principal`, `owner` or `member` for an op that neither declares it nor is named in R7 passes as an argument (as `membercaps`' `member`).
- **R5** A credential reaches the store in a header: a stamped `session` (op declares it) → `x-bio-session`; an `ai` caller's `aiCred.grant` → `x-bio-grant`, that caller alone. Never in the address; a header is returned only when its value is.
- **R6** A read is stamped with its caller's sight: `viewer` = V for about 130 named ops and every op of the families `EDGE_ACTIONS`, `STATE_ACTIONS`, `ACTION_ACTIONS`, `STRUCTURE_ACTIONS`, `VERSION_ACTIONS`, `QUEUE_ACTIONS`, `INTENT_*`, `REEVALUATION_ACTIONS`, `PROJECT_ACTIONS`, `ACTION_LAYER_*`, `CONTRADICTION_*`, `SOURCE_READS`, `CAPTURE_VIEWER_ACTIONS`, `CAPTURE_READS`, `WHAT_CHANGED_*`, `NETWORK_NOTICES_*`, `DOCKET_*`, `CASE_IMPORT_*`, `RUN_VERB_ACTIONS`, `WIZARD_VIEWER_OPS`. Read R6 whole for the op list. Test: one op of each family and of the named set per caller kind; control: a caller's `viewer` absent.
- **R7** Who acted, per op: the address gets the key given by the expression named; read R7 whole for the op rows. By key: `by`=M for `PROJECT_ACTIONS`, `GOVERNANCE_ACTIONS`, `CUSTODIAL_ACTIONS`, `MEMBERSHIP_ADMIN_ACTS`, `ROSTER_SELF_ACTIONS`, `OWN_KEY_ACTIONS`, `CAPTURE_MEMBER_ACTIONS`, `SOURCE_ACTIONS`, `IDENTITY_ACTIONS` (these last also `origin`, handed in), `TRANSLATION_ACTS`, `adminremovalsopen`, `expertisewithdraw`, `profilesset`, `handlechange`, `captureupload`, `attribute`, three `project*` reads; `viewer`=M `translations`; `by`=I `NETWORK_NOTICES_BY`, `DOCKET_BY`, `CASE_IMPORT_ACTIONS`; `author`=T for eleven named ops (`reviewgrant`, `reviewrevoke`, `casedraft`, `publishpreflight`, `projectbarset` ...; `reviewgrant`, `reviewrevoke`, `casedraft` also lose the caller's `secretSha`), `REEVALUATION_ACTIONS` and the ops of `EDGE_ACTIONS`, `STATE_ACTIONS`, `ACTION_ACTIONS`, `DECLARATION_ACTIONS`, `STRUCTURE_ACTIONS`, `VERSION_ACTIONS` and five more; `author`=M `testify`, `lead`; =I `DOCKET_AUTHOR`, `WIZARD_AUTHOR_ACTIONS`; =A `WIZARD_PROPOSAL_ACTIONS`; =AI `QUERY_AUTHOR_ACTIONS`, `CONTRADICTION_ACTIONS`; `proposer`=A for `themepropose`, `actionlawspropose`, `actionriskpropose`, `PLAN_PROPOSAL_ACTIONS` (also `principal`=P), `TEMPLATE_PROPOSAL_ACTIONS` (also `author`=A); `proposedBy`=A for three extract/contradiction proposers, and with `author`=A for `WHAT_CHANGED_PROPOSAL_ACTIONS`; `mintedBy`=A `contentmint`; `principal`=P `RUN_VERB_ACTIONS`, `RUN_PRODUCTION_ACTIONS`, `capturerequestretry`; `attestor`, `transcriber`, `looker`, `sharer`, `declarer`, `placer`, `actor` (`themewithdraw`, `monitorpause`) =M for their one or two ops; `actor`=T `lease` (caller's `actor` deleted first, R3); `RUN_VERB_ACTIONS` `actor` = session's member, else the empty string; `who`=T `aicredentialrevoke`, `aicredentialmint`; `owner`=I `select`, `selection`, `selectionlist`, `selectionrelease`, `EDGE_ACTIONS`, `STATE_ACTIONS`; `member` stamp = session's member id, else the empty string, for `QUEUE_ACTIONS`; `identity`=N for the lead reads, `frontier`, `projectbarset`, `POSITIONAL_ACTS`, `calibrate`; `identity`=I `inboxpull` (carried as `actorIdentity`, R11). Test: one op per row and caller kind; control: caller's value absent.
- **R8** Facts the door states: `unpack` `cls` (`member` for a session, else `cls`) and `member` (`1` session, else `0`); `pagetranscribe`, `pdfstructure`: `cls`, `session` (`1`/`0`), `caps` (comma-joined), `viewer` (R4's), `author` (session's member, else the actor), `store` (namespace); `stats` `capacity` `1` when class `admin` or the session administers, else `0`; `memberlist`, `memberpairings`, `themedeclare`, `themeplace`, `themepropose`, `themeread`, `themewithdraw`: `administer` `1` when a session administers (binding: class `admin`), else `0`; `versionchain` `address` through `subresources.normalizeAddress`; `publishpreflight` by an `ai` caller: `aiCred` as `{tokenId, principal}` JSON; `readheld`: caller's `defer` deleted, `defer` set when `deferred`; `captureupload`, `captureuploadpart` with `length`: `declared` = that number (other ops lose a caller's `declared`); `inboxpull`: `resolve`=`pulled` when `resolving`, else none (caller's deleted).
- **R9** Nothing the caller names survives in the body. A JSON-object body loses `actorIdentity`, `actorViewer`, `actorMemberId`, `ownerMemberId`, `assistantPrincipal`, `migrationReplay`; `token`, `secretSha`, `bySecret`; the op's dropped keys (`setpassword`: `role`); `at` for R3's acts; `viewer` for `inboxpull`, `inboxresolve`; each of `by`, `viewer`, `session` the op declares as a stamp; `member` for `stepsource`, `stepsourcewithdraw` alone (`SESSION_MEMBER_BODY_OPS`; for any other op declaring a `member` stamp the body's `member` names the account and passes). Reserialised only when a key was deleted; a non-object body passes unchanged.
- **R10** An op declaring `bodyBy` with a POST: body `by` = the actor (R4's `by`), an empty body stamped too; a non-object body passes.
- **R11** A promotion's body (`promote`, JSON-object body): `ownerMemberId`, `actorMemberId`, `author`, `actorIdentity`, `actorViewer`, `setIn`, `personWarningSeen`, `replay`, `migrationReplay`, `memberUserAgent`, `assistantPrincipal` are deleted first for every caller, then set only as follows. `author` = session's member, else `token:<cls>` (a session's member is also `actorMemberId`); `actorIdentity` = session's identity, `ai` caller's principal, else `class:<cls>`; `actorViewer` = session's viewer, `ai` the `admission` viewer, else `class:<cls>`. `setIn` = request `project` parameter, else body `project` string, trimmed, at most 200 chars, none when empty. `personWarningSeen` `true` only on a session whose body said `true`. `replay` `true` only if `replay.proven`; `migrationReplay` the verified record, only for an inquiry creation (type by `promotedTypeOf` from `bundle.md` front matter or `meta`, spellings normalised). `memberUserAgent` = `User-Agent`, trimmed, at most 512 chars, on a session's creation (`base` null). `assistantPrincipal` for a non-session (`ai`: `<principal>/<tokenId>`, else `class:<cls>`), withheld from a verified replay. A session's project creation (`base` null, type `project`) is refused as `admission.projectCreationGate(caps)` refuses, else `ownerMemberId` = session's member. An unverified inquiry creation: `surfaced_by` in front matter = `human` (session) or `agent`; `bytes`, `sha256` recomputed only when the caller sent no digest or that of the text sent, else left so the store refuses; a revision is not restamped. Test: each key per caller kind; forged values deleted; digest rule both ways.
- **R12** The actor in the body, per op, for a POST with a JSON-object body (absent body treated as empty for `resolutiondefect`, `INTENT_ACTIONS`, `STANDARDS_ACTIONS`, `BODY_ACTOR` ops, `LOCAL_FACTS_ACTIONS`, else left alone); read R12 whole for the op rows. Keys: `memberId`=M (`expertisedeclare`); `by`=M (`expertiseconfirm`, `resolutiondefect`); `declaredBy`=M; `withdrawnBy`=M; `resolvedBy`=M; `threadedBy`=M (`thread`); `decidedBy`=M (`proposedispose`); `assertedBy`=`system` (`connect`); `by`=T `inboxresolve`; `actor`=T `taskforward`, `taskresolve`, `taskdrain`, `taskdecide`, `biasdebtresolve`; `INTENT_ACTIONS` `author`=AI (`triage`: `assistantPrincipal` deleted, then for a non-session set to the `ai` `<principal>/<tokenId>` else `class:<cls>`); `STANDARDS_ACTIONS` and `BODY_ACTOR` ops: `author`, `proposer` and the `BODY_ACTOR` keys deleted, the op's key (BODY_ACTOR entry, else `proposer` for `standardpropose`, else `author`) set AI; `LOCAL_FACTS_ACTIONS`: every key of R3's deleted-stamp list but `source` deleted, `by`=AI.
- **R13** `taskdecide` takes the body `actor` stamp that `taskforward`, `taskresolve`, `taskdrain`, `biasdebtresolve` take (R12): a forged `actor` is overwritten, an absent one stamped. Until `tasks` declares `taskdecide` (its R20) the door refuses it as an op with no spec.
- **R14** The function answers for every op `OPS` declares; an op named nowhere in R6 to R12 gets only R2 to R5, R9, R10, R23. A new stamp rule is added here, never in the door.
- **R15** For one op of each row of R6 to R12 and each caller kind, the world's door (R17) and the Worker's make equal store requests (address, body, headers), both being this function's answer; `control-plane` R137 holds the parity. Test here: the function is the only maker of either request.
- **R23** A grant's digest crosses in the body. The door hands in `secretSha` (SHA-256 of the secret), `bySecret`, and for `aicredentialmint` `mint` (`{writes, confinedTo, secretSha}`, judged by `admission`). Ops presenting a secret (`reviewcopy`, `reviewcomment`, `statementack`, `templateread`, `templatecomments`, `templatereview`, `templatecomment`): `bySecret` true → address `bySecret=1` and body (made `{}` when absent or not an object) gets `secretSha`; false → neither. Ops issuing a grant (`reviewgrant`, `templatereviewgrant`): body gets `secretSha` as handed in; a non-JSON-object body passes unchanged (the store refuses, no grant made); an absent body becomes `{secretSha}` (K5146). `aicredentialmint`: body gets `writes`, `confinedTo` of `mint` in place of the caller's, plus `secretSha`; address gets `who` (R7). The secret, a caller's own `secretSha`, `bySecret`, `secret` and `token` reach neither address nor body. Test: each op both ways; forged values replaced or absent; the digest in no address.
- **R24** The lists this function reads, moved with it: `QUERY_STAMPS` (R3's eleven keys), `ACT_CLOCK_OPS` (twenty-one ops), `BODY_ONLY`, `BODY_DROPPED`, `BODY_STAMPS` (six keys), `SESSION_MEMBER_BODY_OPS` (`stepsource`, `stepsourcewithdraw`), `MEMBERSHIP_ADMIN_ACTS`, `BODY_ACTOR` (op: key; `author` for twelve `law*`/`court*`/`standard*` ops, `proposer` for `lawpropose`, `standardforcepropose`), and the fixed member lists of the families in R6 and R7 with no id in `op-declarations` (`WIZARD_*`, `CASE_IMPORT_*`, `ACTION_LAYER_ACTIONS`, `CAPTURE_*`, `CONTRADICTION_*`, `DOCKET_*`, `INTENT_*`, `LOCAL_FACTS_ACTIONS`, `NETWORK_NOTICES_*`, `QUEUE_ACTIONS`, `RUN_*`, `SOURCE_*`, `STANDARDS_ACTIONS`, `WHAT_CHANGED_*` and the rest). `ACTION_ACTIONS`, `CUSTODIAL_ACTIONS`, `EDGE_ACTIONS`, `STATE_ACTIONS`, `GOVERNANCE_ACTIONS`, `IDENTITY_ACTIONS` are `op-declarations' R4's, `DECLARATION_ACTIONS` its R21's, `ACTION_LAYER_READS` its R82's; the export of each must equal R24's list. Read R24 whole for every member. Test: each constant equals R24's list; each family equals the export of its name; every op named in R3 to R12 is in `OPS`.
- **R25** (K5157) An op graded as `publish` (`publishcheck` among them) is stamped `author`, and for an agent `aiCred`, by publish's expression (the bare member id), as `publishpreflight` is.

The world's door, sign-ins and recipes (over `store-assembly`'s world; each part reads R16 to R20, R26 to R28 whole when touched):

- **R16** `signIn(world, handle, {admin?, capabilities?, device?})` → `{handle, member, token, session, act, read}`: the founder by the real `login`; any other member by real acts: the founder's `memberadd`, the invitation's `enroll` with a password, then `login` (with `adminendorse` for `admin: true`, `membercaps` for `capabilities`; ops as `op-tables.md` §5.3). `token` is what `login` issued; `session` the shell's record `{t, e, d, w}` (`interface-shell` R32). The world holds the claim's password (R92) and each enrolled member's own. `act(op, {query, body})`, `read(op, {query})` go through the world's door (R17) as that member; a refused act throws naming the op and the refusal.
- **R17** `doorOf(world)(req, as)` answers as the real door for caller `as` (a signed-in member of R16, or none for a public op). `req` = `{url, op, query, headers, body, init, method}` or a `Request`; answer `{status, json}` or `{status, bytes, type}`. (1) Resolve the alias; an op with no spec is refused `UNKNOWN_OP`, 400. (2) `admission.admit` over the bearer token (locked, ended, unknown sessions refused as admission refuses). (3) `innerRequest` (R1), by no rule of its own. (4) `world.send` (`store-assembly` R92); decorate in `answer-envelope`'s envelope `{ok, result, store, tokenClass}`, a refusal with its row and translation. (5) `subscriptionsignin`, `signintrace`, `subscriptiondisconnect` through `signin-door` (retired; T53-375); public reads through `public-read`'s registration (`casedetailspublic` among them); `attest` through `attestation`'s `attestOp`; every other op whose real handler is a door arm (arms `plane/door.mjs` composes) through that arm from the real module, handed the stamps the real hook is; `claim`, `login`, `recover`, `passwordresetlook`, `passwordreset`, `invitelook`, `enroll`, `whoami`, `selftest`, `runtime` (staying in `control-plane`) re-made (the store's route of that name with the body fields the real door passes, nothing else; `whoami` as `control-plane` R18), under R15. Neither route nor arm: `{status: 501, json: {ok: false, reason: "WORLD_NO_DOOR_ARM", op}}`, never guessed. Test: each family of (5), one store route per stamp kind; control: a stamp in the address reaches the store without it.
- **R18** `bootOf(world, as)` → `{door, session}`: `door` = `doorOf(world)` bound to `as` (what `interface-shell`'s `boot({screens, door, session})` consults, its R129); `session` the record of `as.session`. Used as `boot({screens, ...bootOf(world, as)})`.
- **R19** Recipes: functions of a world and a member performing real acts through the world's door, answering what they answered; they insert no row; a refused act throws naming the op. Shipped: `hold(world, as, name, text, project?)` → `{sha, bundle}` (`captureupload`, `allocid` `INFO`, `promote` of an information bundle at `collected`, under `project` when given); `project(world, as, title)` → bundle id (`promote`, no base); `trail(world, as, projectId, label?)` → set id (`createset`, `purpose: "trail"`); `profiles(world, as, ids)` → answer of `profilesset`; and the recipes of K5178, K5193 (`page`, `pdf`, `question`, `questions(n)`, `contradiction`, `setAside`, `finding`, `signer`, `published`, `imported`, `cited`, `rerun`, `conflict`, `assistant`, `writingHelp`, `grantAdmit`, `world.route(as)`: read R19 whole). ids, hashes, times are read from the acts' answers, never a literal.
- **R20** Every declared op is reachable by the world's door: iterated from `op-declarations`' export, each op is (a) a key of the assembled route map (`store-assembly` R6) or (b) answered by the world's door through an arm or function (R17), `selftest`, `runtime` and `attest` among them, re-made under R15. No third class, no list of exceptions. An op in neither fails by name; the cause goes to the declaring module or here. Test: the check over the real modules; control: an op declared and answered nowhere is named.
- **R26** (was `control-plane` R41) `agentPackOp({url, headers, gatedOp, stamps})` answers the `Response` for `op=agentpack` as `control-plane` R41 states; the world's door serves it.
- **R27** (was `control-plane` R77, R80, R93) `airunDispatchOp({stub, reqBody, who, at, trace, memberRef, storeName, cls})` answers the `Response` for `op=airundispatch` (as `control-plane` R77, R80, R93); the clock, trace and member reference are handed in (R-CLOCK); the world's door serves it.
- **R28** (was `control-plane` R57, R90, R93) `draftCheckOp({op, stub, viaSession, sessMember, session, reqBody, trace, memberRef, by, viewer, store, storeName, cls})` answers the `Response` for `textcheck` and `readtranslate` (as `control-plane` R57, R90, R93); the world's door serves both.

### Private

- **Uses** (R21): `op-declarations` (`OPS`, `OP_STAMPS`, `OP_ALIASES`, `NEEDS`, the families of R6, R7, R12); `record-grammar` (`MACHINE_CLASS_PREFIX`, `MACHINE_AUTHOR_PREFIX`, `parseFrontmatter`, `normalizeType`, `createSha256`); `admission` (`callerViewer`, `projectCreationGate`, `admit`, `presentedCredential`); `subresources` (`normalizeAddress`). For the world: `store-assembly`, `answer-envelope`, `signin-door` (retired), `public-read`, `attestation`, `membership` (`Membership.CAPABILITIES`, for `whoami`), the modules whose door arms `plane/door.mjs` composes as the tests reach them (`capture`, `extraction`, `queue`, `ratification`, `publication`, `doorbell`, `monitoring`, `connections`, `instance-setup`, `host-governor`, `bias`, `provenance`, `affordances`, and `signatures` for `caseRatifyStatement`, `NS_RATIFY`), `test-support`. Not available (`control-plane`'s, later): `sha256Hex`, `caseReader`, `captureKey`, `storageAbsent`; an arm needing one is not wired until the job re-makes it from an earlier module or reports it, and the world refuses that op by R17's code (K5052 (1)).
- **R21** Imports only modules earlier in `build/modules.json` (the four above, and for the world the Uses) and no platform module; an import it would need from a later module is reported, never added. Holds no member-facing English and names no place. Test: a census of its imports against the file's order.
- **R22** *(not yet met: T52)* The split by copy, then delete (Entries).
- Satisfies (R3 to R12, R23): `BIO_Membership_Architecture_v2.md` §5, `BIO_Assistant_and_AI_Roles_v0_1.md` §6; K3, K23, K4990, K5046, K5052 (P5). Suggestions (R1): the door reads the body once and computes `replay`, `deferred` and the digests before the call and `followed` after; gates, `agentpack`, the sign-in arms, `textcheck`, `airundispatch`, `acquire`, the mints and the forward stay in `control-plane`.

## Uses: store-assembly

- Purpose: builds every module of the record store on one Durable Object's storage in the modules' order, composes ops maps into one route map, publishes `storeWorld()`; imports no platform module (R17, R20).
- **R90** `storeWorld({claimed?, now?, env?, instanceName?, deliver?, releaseKeys?})` (async; `bio-plane/test/m/store-assembly/world.mjs`) answers a world: the real store over `node:sqlite`, migrated, `instance-setup` started; holds `store`, `ctx`, `sql`, `env`; `claimed: false` leaves it unclaimed; only platform doubles (R16, R17). **R91** one base per file, a copy per test, nothing shared between worlds.
- **R92** `world.claim({password, handle?})` makes the founder `admin` through the store's `claim` route; `world.send({url, body, headers})` (as `innerRequest` answers) goes to `dispatch`; the door, sign-ins and recipes are store-request's (R16 to R19). **R93** the clock is pinned and moved only by `world.tick(ms)`, which runs `scheduler`'s `onAlarm(now)`. **R94** doubles: `AGENT_WORKER` (default unbound), `FILE_SCANNER`, the network (default refuses every address); the world answers no made-up code but `WORLD_NO_DOOR_ARM`; other state is made by acts (R19).
- **R1**, **R6**, **R7**: `assembleStore(ctx, env, {deliver, releaseKeys})` → `{routes, dispatch, namespace, nowMs, read}`; the route map R6 is the union of every module's ops map plus `instanceSetupOps` and `store-door`'s `controlPlaneRoutes`; R20 (a) reads its keys. Read R90 to R94 whole when touching the world.

## Uses: record-grammar

- Purpose: the record's shared grammar (ids, types, front-matter parser, canonical JSON, the one SHA-256); no store, network or clock (R11, R21).
- **R13** `MACHINE_AUTHOR_PREFIX` is `'token:'`, `MACHINE_CLASS_PREFIX` is `'class:'`. **R5** `normalizeType(t)` returns the alias target for an own key of `LEGACY_TYPE_ALIASES`, else `t`; never throws (R11). `parseFrontmatter(text)` → `{data, findings, body}` (R11). **R20** `createSha256()` → `{update(Uint8Array), hex()}` (a string throws `TypeError`); **R21** `sha256HexSync(str)` hashes UTF-8 (R11's digest recompute).

## Uses: test-support

- Purpose: a temporary-file sandbox, stdout that keeps a test's final tally, an in-memory ZIP writer and the shared fixtures of the reading modules; this module's tests import the sandbox (R21).

## Uses: signatures

- Purpose: SSHSIG statements and RFC 3161 timestamps; no record, key or clock (R19).
- **R6** `caseRatifyStatement(caseId, edition, docSha)` → ASCII `bio-ratify-case ${caseId} ${edition} ${docSha}\n`; **R1** `NS_RATIFY` is `"bio-ratify"`, distinct from every other namespace (R19 `published`).

## Uses: subresources

- Purpose: renders a page as itself from raw bytes, and shared link encoding (R8).
- **R18** `normalizeAddress(url)`: lowercases scheme and host, drops fragment and default port, sorts query parameters by key then value; never throws (an unparseable `url` returns `String(url).trim()`) (R8 `versionchain`).

## Uses: membership

- Purpose: who the members are and what each may do; no record integrity, no credential (R17 `whoami`).
- **R154** `Membership` keeps `ROOT_ADMIN`, `CAPABILITIES`, `adminMath` as statics; `membershipOps` answers `member-roster`'s ops beside its own (R16, R17).

## Uses: host-governor

- Purpose only: paces outbound fetches per host (R17 (5)).

## Uses: provenance

- Purpose only: the register, receipts, capture grade; `registerHolds` (R17 (5)).

## Uses: capture

- Purpose only: fetches and stores a document (R17 (5); R19 `hold`).

## Uses: doorbell

- Purpose only: the knock and the inbox, `inboxpull` (R8, R17 (5)).

## Uses: extraction

- Purpose only: readings from captured bytes; `readheld` (R8, R17 (5)).

## Uses: connections

- Purpose only: door arm (R17 (5)).

## Uses: bias

- Purpose only: declared bias sets and adoptions (`biasadopt`, R7; R17 (5)).

## Uses: publication

- Purpose only: door arm (R17 (5); R19 `published`).

## Uses: ratification

- Purpose only: the two signing ceremonies, `caseratify` (R17 (5); R19 `published`, `rerun`).

## Uses: monitoring

- Purpose only: door arm (`monitorpause`, R7; R17 (5)).

## Uses: affordances

- Purpose only: door arm (R17 (5)).

## Uses: queue

- Purpose only: door arm; `QUEUE_ACTIONS` (R7; R17 (5)).

## Uses: instance-setup

- Purpose only: group setup and instance reports (R17 (5)).

## Uses: acquisition

- Purpose only: no service named (R21).

## Uses: setup-words

- Purpose only: no service named (R21).

## Uses: skills

- Purpose only: no service named (R21).

## Uses: ai-runs

- Purpose only: the AI run object (`RUN_VERB_ACTIONS`, R7; R27).

## Uses: runtime-limits

- Purpose only: no service named (R21).

## Uses: capture-sources

- Purpose only: no service named (R21).
## Uses: public-read

- Purpose: the published record served to anybody without a credential; writes nothing (R17 (5)).
- **R18** a later module registers once at start named credential-free reads served on the public path; a second registration of one name is refused; an unregistered name says so (C-98.10, R17); R17 (5) answers `casedetailspublic` and the other registered reads through it.

## Uses: attestation

- Purpose: co-attestation and the instance's own key (R17 (5), R20).
- `attestOp` is the `op=attest` arm; `attest({sha256, archive, locator}, {head, put, fetch})` takes `holds(sha)` beside them, answered by `provenance.registerHolds`; R20 holds `attest` as class (b).

## Uses: op-declarations

- Purpose: what each op is; declares, judges no caller, routes nothing (R1, R14, R20).
- **R2** `OPS`: op → `{classes, machineClasses?, mutating}` (`classes: null` public; no spec names `ai`). **R3** `SESSION_OPS` `{member, admin}`; `NEEDS` op → capability or `null`. **R4** the act lists and families name each op's stamps; every op a list names has a spec. **R5** all tables are frozen data. **R80** `registerDeclaredOps(rows)` merges owners' `DECLARED_OPS` into `OPS`, `OP_STAMPS`, `NEEDS` and both `SESSION_OPS` sets at first read. `OP_STAMPS`, `OP_ALIASES` are exports (R1, R4).
- **R10** to **R33** declare each tranche's op specs and stamps (docket R13, case-import R14, wizard-scripts R15, tasks R23, membership R22, publication R25, file-safety R32 ...): read the one that declares an op whole before touching its row in R6 to R12. **R75** takes ops out of `ACT_HELP_ABSENT`; **R82** makes `standardinforce` a session act.
- **R90** (T53, *not yet met*) declares the beta's assistant ops and removes the alpha's AI ops with no alias (list in T53-375); read R90 whole.

## Uses: admission

- Purpose: who may call an op, judged before it runs; never runs an op (R17 (2)).
- **R34** (T53, *not yet met*) `admit` is callable from inside the room; every refusal of R1 to R12 and R14 answered as now, in the same order (R8, R9, R10, R11). **R33** `admit` reads the session and whether a re-authentication is due in one awaited call.
- **R20** `presentedCredential({req, url, body})` → `{token, secret, inAddress}`, never throws: `token` from `Authorization: Bearer <value>`, else the JSON object body's `token`, never the address; `secret` from the body's `secret`; `inAddress` true exactly when the address names a `token` or `secret` parameter.
- **R21** `sourceOf(req, env)` → keyed fingerprint of `CF-Connecting-IP`, `null` when the store cannot be asked, never throws; `countryOf(req)` → `request.cf.country` or `null` (R1's `source`, `country`). **R30** `callerViewer`, `readerOf` answer for an `ai` caller the viewer `credentials.aiCredentialLook` answers (the project its credential was minted for), else the plain principal viewer (V).
- **R11** `projectCreationGate`: a session creating a project without `create_projects` is refused 403 `NOT_CAPABLE` (C-38.5), `needs: "create_projects"`. **R13** `reviewGrantSecret` passes a grant's secret on only as its SHA-256 (R23). Read R1 to R12, R14, R34 whole when touching `admit`.

## Uses: answer-envelope

- Purpose: the shape of every answer: JSON with the open origin, a refusal decorated with its catalogue row, a silent store told apart from a refusing one (R17 (4)).
- **R1** every answer is JSON with `access-control-allow-origin: *`; a forwarded answer is the handler's with `store` and `tokenClass` added and its status kept. **R2** a refusal (`ok: false`, top level or in `result`) whose `reason`/`code` has a row gains `code`, `check`, `translation` where absent. **R3** a store answer that is not JSON with a boolean `ok` is refused 502 `STORE_DID_NOT_ANSWER` (C-69.2); `ok: false` JSON is relayed with the store's status.

## Uses: signin-door

-Retired whole (T53, K5571 (6)). **R1** to **R6** retired: `subscriptionsignin` is replaced by the adapter's connect flow behind `agent-model` and the op `aisignin` (`ai-accounts` owns it; `op-declarations` R90 declares it); the relay, trace and token hand-off are retired. Its removal from `modules.json` and `layers.md` is BOB's act at the layer-11 START (R17 (5), R21; T53-375).
