# DRAFT · T47 L11 fold: the way in, connect, signing, People, DEC-200–DEC-212 (K3062)

**Status** · DRAFT for BOB, 2026-10-13, written by a drafting helper on `tranche/T47` (read-only; this is the only file written). It rules nothing. Sources read whole: `current.md`; `next.md` N997, N999, N1001–N1008; `draft-T47-wayin.md`; `draft-T47-L6-connect.md` §3 (and §1.5, §4 for context); `draft-signing-service.md`; `draft-T47-interface.md`; DEC-200–DEC-212 and `registry.json` (63 screens), `library.json`, `words.json` (1,728 words, 617 protected), `mock-acts.js`, the relevant `mock-screens.js` drawings on `origin/claude/gallant-brown-zg0wc1` @ `45a364dd2d`; rulings K3041, K3051–K3054, K3059–K3062, K3064, K3068–K3070, K3076, K3079–K3082, K3084, K3086, K3089, K3096, `rulings-active.md`; the requirements of every module below (L11 ones whole; `credentials`, `signatures`, `ratification`, `filings`, `public-read`, `people`, `retrieval`, `membership` R83/R140 where cited).

**Numbering.** New entries from T47-86 (the way-in draft's T47-78…80 are T47-86…88). Requirement ids are each module's next free id today.

---

## A. Entries

### A1. Additions to existing L11 entries (one job per module, P8)

- **T47-47 · wizard-scripts** · adds: (K3062; DEC-200–DEC-212) R35 the registry re-taken at PR #33's head (63 screens); R36 BOB adopts version 2 of "Set up and claim" (step 14 `hostingaccessset`, DEC-205 (3)) and of "Publication ceremony" (steps 9–11, DEC-207 (10), DEC-208 (2)) · doubts 6, 13.
- **T47-48 · op-grades** · adds: (DEC-201, DEC-202, DEC-205, DEC-207; K3061 D3) R37 grades `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook`, `passwordreset`, `grouplogoset`, `grouplanguagesset`, `signrequest`, `signintrace`; `publish` re-graded as the preparation it is (doubt 9).
- **T47-49 · affordances** · adds: (K3062) R56 `ACT_HELP` re-generated from `mock-acts.js` at PR #33's head (`recover` for any member, DEC-205 (4); the `owed_` texts held under `passwordresetlink`, `passwordreset`, `grouplogoset`, `grouplanguagesset`, `signrequest` once declared).
- **T47-50 · action-producers** · adds: (DEC-212; K1364) R25 the "request left unsent" status item, through T47-90 (filings, a new earlier edge).
- **T47-52 · setup-words** · adds: (K3062) R7 `WORD_ROWS` re-taken at PR #33's head (1,728 words, 617 protected).
- **T47-53 · op-declarations** · adds: (K3084, K3061 D3) R57 the specs of `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook`, `passwordreset` (requirement text for the K3084 item); R58 `REAUTH_ACTS`; R59 specs of `grouplogoset`, `grouplanguagesset`, `signrequest`, `signintrace`; R60 R21/R27 read at PR #33's head (owed acts served by name) · doubt 10.
- **T47-54 · answer-envelope** · adds: (N1002; N1001) R16 R6's page policy names `interfacePage` at `/` (the setup page no longer served); the door's row for `signintrace`'s refusal.
- **T47-56 · interface-shell** · adds: (N999, K3052, K3061 D3, DEC-202 (2)) R32–R34 the session record across tabs, idle lock and sign-out, the password asked again; (DEC-201 (8)) R35 `unavailable`; (N1002) R36 old addresses forwarded, the test-instance band; (DEC-203, K3061 D8) R37 People opens the directory, R29 replaced, R25/R28's "Group settings" link retired; (DEC-200 (2), (4)) R38 R28's four re-points retired; (N1001; connect §3) R39 a refusal's `trace` drawn as a reference; (DEC-207, DEC-208, DEC-210; K3079 (a), K3080) R40–R42 the signer kit `cs.signer` (key made and kept on the device by choice, key file, one confirmation signs a listed set) · doubts 8, 11.
- **T47-57 · screens-wizards** · no addition (the tour is `screens-entry`'s, DEC-205 (5)).
- **T47-58 · screens-settings** · adds: (DEC-201 (8)) R17 `settings`; R18 `group` with `grouplogoset`, `grouplanguagesset` (DEC-205 (1), (2)); (DEC-200 (8), N997) R19 `places`; (K3060 D4, DEC-202 (3)) R20 `recovery` for every member; (DEC-201 (3)) R21 `account`'s sign-outs; R22 a key registered by the signer kit (K3079 (b): `signerregisterown`); (DEC-201 (2)) R23 `members`' reset link and "More for administrators"; (N1001; connect §3) R24 `connect`'s refusals in words with a reference, state read from the plane, "connect again"; drops "places and offices, recovery codes stay on the setup page" from T47-58's text.
- **T47-59 · screens-intake** · adds: (DEC-200 (2)) R16 "Watch this address" (`monitorset`) and "Check it now" (`monitor`) as two acts, amending R14.
- **T47-60 · screens-daily** · adds: (DEC-201 (8)) R10 `projects`; (DEC-201 (7), DEC-202 (4)) R11 Home's first-visit and new-group states; (DEC-201 (13)) R12 Queue's and Find's empty states; (DEC-212) R13 the unsent-request item's three acts.
- **T47-61 · screens-inquiry** · adds: (DEC-200 (2), (4)) R15 `document`'s `monitorset` and `monitor` as two acts; R16 `project`'s "Draw on a question from elsewhere" (`drawquestion`) as its own act, `projectbarset` by its registry label.
- **T47-62 · screens-investigate** · adds: (N997) R11 `help`; (DEC-203, K3061 D8, N1008) R12–R13 `people`, the directory (its counts through `peopledirectory`, doubt 1); (DEC-200 (4)) R14 `calculation`'s `testify` and `spotcheckvisit` as two acts, amending R5; `person`'s "Explore connections" (`explore`) a registry act.
- **T47-63 · screens-publish** · adds: (K1490, K3041, K3096: case-authoring R76) R5 amended, the Ties step sends `publish` with `tieAttested: true`; (DEC-207, DEC-208, DEC-210; K3079, K3080) R12–R15 the in-ceremony signer, its states, no key, phone, not an owner (`signrequest`); R16 `docketpost` signed with the kit; (K3079 (a)) R11 amended; (DEC-201 (8)) R17 `review-outside`.
- **T47-64 · screens-action** · adds: (DEC-209) R8 the request's period, form and cost-limit fields and the portal's number at sending; R9 `help-records`; (DEC-212) R10 "Pick up where you left off" opens the request at its step.
- **T47-65 · control-plane** · adds: (N1002) R82 `/` answers `interfacePage`; (K3084, K3061 D3) R83 `login`'s `handle` and `device`, background requests, `unlock`, `reauth`, the reset-link ops (requirement text for the K3084 items); (DEC-205) R84 `grouplogoset`, `grouplanguagesset`, `signrequest` routed, the logo served; (N1001; K3060 D10; connect §3) R85–R87 the sign-in door's trace, hold, state and drop (or T47-91's, doubt 2) · size: doubt 2.
- **T47-66 · plane** · adds: (K3084; K3060 D10; connect §3) R47 a `signin` account's held token on the wire for ask, draft and transcribe, R33's "no secret" retired, `SIGNIN_TOKEN_REFUSED` dropping the token; R48 the screen set `interfacePage` takes (nine modules, `screens-entry` among them).
- **T47-74 · setup-page** · replaced: (N1002, K3052) **retired as a page**: R1–R34 retired, each naming its new home (B, setup-page); its code and tests deleted; T47-74's N989 R34 work falls away; merges after T47-56, -86, -75, -65 (doubt 12).
- **T47-75 · instance-setup** · adds: (N1002) R83 `setupPage`, `SETUP_HTML` and the `setup-page` edge removed, `HOSTING_CONTROL` kept; (DEC-205 (2)) R84 `grouplogoset` and the logo read; (DEC-205 (1)) R85 `grouplanguagesset` and `groupLanguages`.
- **T47-77 · admission** · adds: (K3043) R23 an `ai` credential carrying a `run` confined to it (the existing item's text); (K3084, credentials R71) R24 a locked session admitted only to `unlock`, `reauth`, `signout`; R25 `REAUTH_ACTS` refused `REAUTH_DUE` outside the window.

### A2. New entries

- **T47-86 · screens-entry** (new; registered K3070) · (N999, N1002, N1005; DEC-201 (1), (2), (5), (6), (12); DEC-202 (1)–(4); DEC-205 (5); K3052, K3053, K3060 D2, D4, D7, K3061 D3) R1–R11: `front`, `tour`, `forgot`, `reset`, `setup`, `join`, in the public and setup frames · registry.json at PR #33's head; text BOB's · after T47-56 and T47-75 (it reads instance-setup's `HOSTING_CONTROL`, a new edge `screens-entry → instance-setup`).
- **T47-87 · installer** · (N1003; DEC-201 (4), DEC-206 (4); K3053, K3060 D5) R50–R53: the first page's two choices, the step lines, the stops, the finished panel's hand-over to `/app/setup#boot=`, the update page, `interface-assets`' styling (a new edge) · its deploy waits on Bob's dashboard act (K2164) · doubt 7.
- **T47-88 · journey-check** (new, a helper module carrying no product capability) · (N999, N1004; K3052, K3053, K3054, K3059) the release check: a Playwright walk of journeys 28 and 3 with screenshots, failing on any refusal, old page or missing screen (requirements in B) · registered at L11's START in `build/modules.json`, layer 11, **last** (after `stewards`), empty `paths` and `tests` (K1043), and in `build/layers.md` "Helper modules"; membership R140's list test is then red until T48's membership job (doubt 4) · last in L11.
- **T47-89 · tasks** · (DEC-207 (8)) R19 `signRequest` (`op=signrequest`): an edition prepared and ready to sign, put in each owner's To do.
- **T47-90 · filings** (L9, folded before L9's START) · (DEC-212) R53 `approvedUnsent`; (DEC-209 (3), (4)) R54 the venue's reference at sending, R55 a member's own fills for a template's blanks · DEC-209, DEC-212 · text BOB's.
- **T47-91 · signin-door** (new, proposed, doubt 2) · (N1001; connect §3) the subscription sign-in door (control-plane R65, R78 and R85–R87) split by copy from `control-plane` (K617, K624), layer 11 after `store-door`, before `interface-assets`; control-plane's job deletes its copy. Taken only if BOB rules the split.

### A3. Addition to an entry of an earlier, not-started layer

- **T47-72 · ratification** (L8, folded before L8's START) · adds: (Bob's S21 A, K3080; DEC-208 (1)) R52 `caseratify` and `publishat` take the findings' and the evidence's signatures of the same sitting, verified first, committed after the case now or held with the waiting edition · doubt 5.

### A4. Where each item lands

| item | entry |
|---|---|
| way-in draft: `screens-entry` | T47-86 |
| way-in: interface-shell, screens-settings, screens-daily, screens-investigate, screens-publish, installer, setup-page, instance-setup, wizard-scripts, op-declarations, admission, op-grades, affordances, setup-words, control-plane, plane, journey check | T47-56, -58, -60, -62, -63, -87, -74, -75, -47, -53, -77, -48, -49, -52, -65, -66, -88 (wayin's `walkthrough` op dropped: DEC-205's `tour` is static, doubt 13) |
| connect §3 | control-plane R85–R87 (or T47-91), plane R47, screens-settings R24, interface-shell R39, op-declarations R59 (`signintrace`), op-grades R37, answer-envelope R16; instance-setup's optional `warm_check` not taken (doubt 14) |
| signing service draft; DEC-206–DEC-210 (S21 A, K3080; key kept by choice, K3079 (a); `signerregisterown`, K3079 (b)) | interface-shell R40–R42; screens-publish R5, R11–R16; screens-settings R22; tasks R19 (T47-89); ratification R52 (T47-72); op-declarations R59; wizard-scripts R36; signatures' and credentials' op-name wording (doubt 3); DEC-206's site: N1011, gap |
| DEC-203 (People, interface-shell R29 replaced) | interface-shell R37; screens-investigate R12–R13; `peopledirectory` (doubt 1) |
| DEC-205 `grouplanguagesset`, `grouplogoset`, `reset`, `tour` | instance-setup R84, R85; op-declarations R59; control-plane R84; screens-settings R18; screens-entry R3, R5 |
| DEC-200 (1)–(4) words and re-points | setup-words R7, affordances R56, interface-shell R38, screens-intake R16, screens-inquiry R15–R16, screens-investigate R14; (5) done (T47-12); (6) closed layers' rows read by key: T48 (order); (8) screens-settings R19, R20, screens-investigate R11 |
| DEC-201, DEC-202 | screens-entry, interface-shell R32–R36, screens-settings R17–R23, screens-daily R10–R12, screens-publish R17, installer R50–R53, control-plane R82–R83 |
| DEC-204 | owes nothing |
| DEC-209 (CPRA template) | T47-41 (content, K3081), filings R54–R55, screens-action R8–R9; the profile's NextRequest venue words: T48 (jurisdictions L1, order) |
| DEC-211 | owes nothing to build |
| DEC-212 | filings R53, action-producers R25, screens-daily R13, screens-action R10 |
| N999 | control-plane R82, interface-shell R32–R36, screens-entry R1–R2, journey-check |
| N1002 | setup-page retired (T47-74), instance-setup R83, control-plane R82, interface-shell R36; legacy-ui: BOB's census, then Bob's deploy act (C, gaps) |
| N1003 | T47-87; Bob's dashboard act (K2164) |
| N1004 | T47-88 |
| N1005 | screens-entry; screens-settings R19–R20; screens-investigate R11 |
| N1008 | (D8) as DEC-203; (D15) the release (BOB's act); (D3, D4, D10) credentials (merged, K3084) and the L11 lines above; (D6, D9, D13) DEC-206 / DEC-207–DEC-208 / T47-41; (D11) no product change (doubt 15) |
| `tieAttested` sent by the screen (screens-publish R5, case-authoring R76) | screens-publish R5 amended |

**L11 merge order (amended):** wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, [signin-door, if T47-91], interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last.

**Counts:** L11 23 → 28 (T47-86, -87, -88, -89 new; T47-91 if taken: 29); L9 +1 (T47-90). Total 85 → 90 (91).

---

## B. Requirement text

Every line ends *(not yet met: T47)*; an amended line keeps its id and gains the mark.

### screens-entry (new file `build/requirements/screens-entry.md`)

Purpose: the screens drawn without a member session, in the public frame (`front`, `tour`, `forgot`, `reset`) and the setup frame (`setup`, `join`). Uses: `interface-shell` (the kit, R21, R30), `setup-words`, `op-declarations` (tests), `instance-setup` (`HOSTING_CONTROL`, R47).

- **R1** (DEC-202 (1); K3060 D2) **front** ("Your group's page", public frame, at `/` and `/app/front`, no session read): the masthead of the group's name and logo when set (`groupidentity`, `instance-setup` R84), its public purpose (`groupdescription`'s public parts), what it has published (`publishedlist`: each case edition's title, edition, signing date and signer as answered, linking `/app/published/<case>`), "Have something for us?" (`/app/doorbell`), "How we work" with "See how it works, step by step" (`/app/tour`), members' sign-in as a panel, and "<group> uses Civicsmith" at the foot; a part the group keeps from the public is not drawn (DEC-132). Test: each read in its four states (`interface-shell` R10) with no `Authorization` header sent. *(not yet met: T47)*
- **R2** (K3061 D3; DEC-201 (1), DEC-202 (2); `credentials` R65, R67) The sign-in panel asks the handle (`signin.founderhint` its help), the password and "This device is" (`session.keep`, checked by default, or `session.shared`), and sends `login` with `handle`, `password` and `device` in the body only; on success it hands the session to the shell (`interface-shell` R32) and opens the page kept to return to, else Home. It draws the states refused (`refusal.SIGN_IN_REFUSED`), paused with its end (`refusal.SIGN_IN_PAUSED`, `{time}` from `stated`), signed out (`session.signedout`), ended (`session.ended`) and locked (`session.locked`: the handle, the password, "Unlock" sending `unlock`; "Not <handle>?" signs out). A refusal keeps the handle and clears the password. "Forgot your password?" opens `forgot`; "Not a member yet?" says members join by invitation. Test: each state; control: a sentinel password in no request but `login`'s body. *(not yet met: T47)*
- **R3** (DEC-205 (5); K3060 D7) **tour** (public frame): the six steps of "How we work" (`screen.tour.*` and this module's `SCREEN_WORDS`), Back, Next, and "Stop here" returning to `front`; the fifth step links the doorbell; no account is asked, no op is sent and nothing is stored. Test: every step drawn; control: no request leaves the page while it is walked. *(not yet met: T47)*
- **R4** (DEC-201 (2), DEC-202 (3), DEC-205 (4); `credentials` R47, R68) **forgot** (public frame): "Use one of your recovery codes" (handle, code, new password typed twice alike) sends `recover` in the body only and draws `RECOVERY_REFUSED` as one sentence for every arm; on success it says how many codes are left and that other sign-ins ended, linking `front`; "No codes? Ask an administrator for a reset link"; "If no administrator can get in", the hosting account's way (`HOSTING_CONTROL` and the rotation guide's steps, `setup-page` R27's meaning). Test: success and refusal; control: two passwords that differ send nothing. *(not yet met: T47)*
- **R5** (DEC-205 (5); `credentials` R69, R71 (6)) **reset** (public frame, `/app/reset#reset=<link>`, the fragment removed on load): `passwordresetlook` draws for whom the link is (handle) and until when; "Set my new password" (typed twice alike, 12+) sends `passwordreset` with the link in the body only; states: set ("Sign in", to `front`), and `RESET_LINK_DEAD` ("Ask an administrator for a new one. Nothing was changed."). Test: live, set, dead; control: the link in no address after load and no storage. *(not yet met: T47)*
- **R6** (DEC-201 (5); K3053; setup-page R2, R3, R14–R20, R29, R30 moved) **setup** (setup frame, `/app/setup`): the claim fills the one-time password from `#boot=` (removed on load), asks the founder's password twice (12+), sends `claim`, then `login` as handle `admin` (device own) and `recoverycodesissue`, showing the ten codes once (copy; save as a file made in the browser). Then each part is the registry's act for it, every part skippable and resumable: name and website (`groupnameset`, `groupdomainset`), places (`profilesset`, `placewanted`), offices (`officesseed`, `entitycreate`), the assistant (`aikeepaway`, `groupkeyset`, `groupkeyswitch`, `ailimitset`), the court notice (`courtnoticeset`), the hosting account (`hostingaccessset`, beside `HOSTING_CONTROL`'s words), a second administrator (`memberadd`, role `admin`), security tools (`securitytooladd`, `securitytooltest`, the scanner's sentences only while `part_scanner` is `true`); "Finished" links `/app`. No sentence says administrators see spending by member (DEC-188 (5)); "file scanner" and "safe view" only (DEC-200 (5)). Test: a fake plane walked from claim to finish; control: a refused part keeps the step and sends nothing more. *(not yet met: T47)*
- **R7** (DEC-201 (6), DEC-202 (3); setup-page R2, R3, R22 moved; `credentials` R68) **join** (setup frame, `/app/join`): `#invite=` reads `invitelook`; `#join=` first asks the name the group will know the person by and sends `joinlinkinvite`; a dead link draws "This link no longer works" (one sentence for `NO_SUCH_INVITATION`, `NO_SUCH_JOIN_LINK`, and `JOIN_LINK_DAILY_CAP` by its own words); then the language among the group's (`grouplanguages`, `instance-setup` R85), the handle checked as typed (`handlecheck`; fixed for good, DEC-197), the password twice; `enroll`; `login` (device own); `memberlanguageset`; `recoverycodesissue`, the codes shown once; then Home opens with the welcome offer. "Already a member? Sign in" links `front`. Test: both link kinds walked; control: a dead link draws no form. *(not yet met: T47)*
- **R8** No password, one-time password, recovery code, reset or invitation link typed or shown here is written to the browser's storage, an address, a log or a later request; every fragment is removed on load. Test: sentinels across every flow. *(not yet met: T47)*
- **R9** `interface-shell` R5, R8–R13 and R22 hold on every screen here; the public and setup frames draw no rail, tabs or dock (`interface-shell` R30). *(not yet met: T47)*
- **R10** (Invariant) No place is named in this module's behaviour or words. *(not yet met: T47)*
- **R11** (K3052) A screen here is served at its address whether or not a session record exists (`interface-shell` R32 opens Home at `/` only for a live session); `setup` and `join` never forward a signed-in visitor away while a fragment is being consumed. *(not yet met: T47)*

### interface-shell (R32 onward)

- **R32** (N999; K3052; K3061 D3; amends R3, R4; replaces `setup-page` R31) The session record `SESSION_STORE_KEY` is this module's, held in `localStorage` as `{t, e, d, w}` (`d` `own` or `shared`); every tab sees a sign-in, lock, sign-out or end through the storage event. `/` and `/app/<working screen>` with no live record draw `front`; with one, `/` opens Home. A 401 clears the record and draws `front`'s ended state, keeping the path to return to in `sessionStorage` (never the token). Test: two tabs; control: the token in no address, body or storage but the record. *(not yet met: T47)*
- **R33** (K3061 D3; `credentials` R65, R71 (7)) The shell counts the member's own input and acts as activity; every read it makes on its own timers (`cs.later`, the queue count) carries `background=1`. A `shared` device at 15 minutes idle sends `signout` and draws `front`'s ended state; an `own` device at 30 minutes idle draws the lock (`session.locked`) over the screen, keeping what was typed; the plane's `SESSION_LOCKED` or 401 governs over the page's clock. Test: each limit at a fake clock; control: a timer read alone never keeps the session awake. *(not yet met: T47)*
- **R34** (K3061 D3; DEC-202 (2); `credentials` R66) An act answered `REAUTH_DUE` opens the password dialog (`session.reauth`), sends `reauth`, and on success sends the act once more; cancelling sends nothing. `unlock` from the lock returns to the screen as it was. Test: refused then resent; control: a wrong password resends nothing. *(not yet met: T47)*
- **R35** (DEC-201 (8); amends R9) **unavailable**: an unknown screen or subject draws "Nothing is here"; `NOT_VISIBLE`, `NOT_A_PARTICIPANT` and the absence answers BOB lists at START draw "You can't open this"; a failed fetch or a 5xx draws "can't be reached", retried every 30 seconds, what was typed kept. Test: each state. *(not yet met: T47)*
- **R36** (N1002; setup-page R2, R33 moved) `/#invite=`, `/#join=` forward to `/app/join` and `/#boot=` to `/app/setup`, the fragment carried and nothing else; while `bootstrap` answers `test_instance: true` every frame shows the test-instance band (setup-page R33's sentence until a word is given). Test: each address; control: no fragment reaches a request. *(not yet met: T47)*
- **R37** (DEC-203; K3061 D8; replaces R29, retires R25 and R28's "Group settings" sentence) The People place opens `people` (`screens-investigate`); the Settings place opens `settings` (`screens-settings`); no link opens `/` for settings. Test: both places; control: no `href="/"` drawn by a working screen. *(not yet met: T47)*
- **R38** (DEC-200 (2), (4); amends R28) R28's four re-points retire: the registry lists `monitorset`, `monitor`, `projectbarset`, `drawquestion` and `spotcheckvisit` on their screens; R21 admits only the registry's ops, `infolevelset`, and one re-point: `ratify` on `ceremony` (`screens-publish` R13) until the registry lists it. Test: a screen naming an unlisted op throws at `interfacePage`. *(not yet met: T47)*
- **R39** (N1001; connect §3) A refusal carrying `trace` is drawn with "Reference: <first 8 characters>" beside its words (R13); the trace is kept nowhere in the browser. Test: drawn and not stored. *(not yet met: T47)*
- **R40** (DEC-208 (3), DEC-210; K3079 (a); K509 (2)) `cs.signer` makes the member's Ed25519 key in the browser (WebCrypto) and never sends it: kept on the device only when the member ticks `signing.ceremony.keepkey`, as a non-extractable key in this origin's IndexedDB; unticked, the page offers a key file in `signatures` R43's passphrase form (`BIOKEY1.`), made in the browser, and keeps nothing. "Use a key file you already have" loads `BIOKEY1.` (with its passphrase) or `BIOKEY-RAW1.` for the sitting only. It answers the public line for `signerregisterown`. Test: a kept key survives a reload and is not exportable; control: unticked, IndexedDB and storage hold nothing. *(not yet met: T47)*
- **R41** (K3080: S21 A; DEC-207 (4), DEC-208 (1)) `cs.signer.sign(statements)` takes the listed statements (each `{label, bytes, namespace}`), draws "What your key signs, exactly" (each statement line), asks one confirmation of the device for the whole list (doubt 8), and answers one SSHSIG per statement (version 1, `ssh-ed25519`, `sha512`) or a declined answer, signing nothing (`signing.ceremony.declined`). Test: every signature verifies with `signatures.verifySshsig` and `ssh-keygen -Y verify` in its namespace; control: a declined confirmation answers no signature. *(not yet met: T47)*
- **R42** (K3079 (a); amends `screens-publish` R11's rule) The only key material any page keeps is R40's non-extractable key, kept by the member's choice; no key, passphrase or signature is written to the browser's storage, an address or a request other than the act it signs. Test: sentinels. *(not yet met: T47)*

### screens-settings (R17 onward)

- **R17** (DEC-201 (8)) **settings**: "Yours" (account, the assistant, ties, notes, recovery codes) then, to a session that administers, "The group's" (your group, who your group is, members, places and offices, security, translations, wizards), each a reference. Test: both sessions. *(not yet met: T47)*
- **R18** (DEC-201 (8); DEC-205 (1)–(3)) **group** (administrators'; others read it): `groupnameset`, `grouplogoset` (PNG or JPEG chosen, `instance-setup` R84), `groupdomainset` with the verified date, `grouplanguagesset` (tags among those `jurisdictions.isLocale` accepts, `instance-setup` R85), `courtnoticeset`, `hostingaccessset`, `strengthbarset` (reasoned). Test: each act; control: a member is drawn none. *(not yet met: T47)*
- **R19** (DEC-200 (8); N997; setup-page R13, R19, R20 moved) **places** (administrators'): `profiles` with `profilesset` (its warning first; none allowed), `placewantedstate` with `placewanted`, the offices (`entitieskind` office, paged to the end, marked by origin; a failed read never drawn as none) with `officesseed` and `entitycreate`. *(not yet met: T47)*
- **R20** (K3060 D4; DEC-202 (3); setup-page R16, R29 moved) **recovery** (each member's own): `recoverycodesstate`; `recoverycodesissue` shown once, saying issuing again spends the earlier codes; to an administrator, `adminrecoverystep`'s note while not met. *(not yet met: T47)*
- **R21** (DEC-201 (3)) **account** draws "Sign out on this device" (`signout`) and "Sign out everywhere" (`signouteverywhere`), each then drawing `front`'s signed-out state; the masthead's "Sign out" does the same (`interface-shell` R4). *(not yet met: T47)*
- **R22** (K3079 (b); `credentials` R9) **account**'s "Register your signing key" makes the key with `cs.signer` (`interface-shell` R40) and sends `signerregisterown` with its public line; "Revoke your signing key" sends `signerrevokeown`; no pasted line is asked. *(not yet met: T47)*
- **R23** (DEC-201 (2); `credentials` R69) **members**: a member's row offers "Make a reset link" (`passwordresetlink`, reasoned), the link shown once with "Civicsmith sends no email"; "More for administrators" links `group`, `places`, `recovery`. *(not yet met: T47)*
- **R24** (N1001; connect §3; amends R4, R5) **connect**: every `subscriptionsignin` refusal is drawn in words with its reference (`interface-shell` R39), a `refusal.<code>` word for each `SIGNIN_CODES` code (`agent-worker` R84) filled with `{detail}` where the word has one; the typed code is never drawn; a failed `state` read says it could not check (never "not connected"); connected draws since when and, when answered, until when (`credentials` R70); a refused-at-Anthropic state draws "connect again" once; the code field says to copy the whole code; "Open Anthropic's sign-in page" is disabled while a start is in flight. *(not yet met: T47)*

### screens-intake (R16)

- **R16** (DEC-200 (2); amends R1, R14) On "From an address", "Watch this address" sends `monitorset` (`enabled: true`, the frequency chosen) and "Check it now" sends `monitor`, two acts. Test: each act alone. *(not yet met: T47)*

### screens-inquiry (R15 onward)

- **R15** (DEC-200 (2)) On `document`, "Watch for changes" sends `monitorset` and "Check for a new version now" sends `monitor`. *(not yet met: T47)*
- **R16** (DEC-200 (3), (4); amends R10, R11) On `project`, "Draw on a question from elsewhere" chooses among the questions the member may see (`cs.choice` over record data) and sends `drawquestion`; "Set this project's bar" is `projectbarset` by its registry label. *(not yet met: T47)*

### screens-daily (R10 onward)

- **R10** (DEC-201 (8)) **projects**: `projectlist` (each project's name, owner, stage on the ladder) with each one's question count (`projectquestions`, paged), `truncated` said; "Start a project" (`promote`). *(not yet met: T47)*
- **R11** (DEC-201 (7), DEC-202 (4)) Home: with no project and one member, the new-group state ("Nothing is here yet", inviting members, saying who the group is); the welcome offer per `screens-wizards` R7. *(not yet met: T47)*
- **R12** (DEC-201 (13)) Queue's empty state ("You are up to date"); Find's no-result state (what search covers, "Capture it"). *(not yet met: T47)*
- **R13** (DEC-212; `action-producers` R25) R3's registered acts gain `actionmove`; the unsent-request item draws "Pick up where you left off" (opening the action's screen at its step), "Keep it for later" (`queuesnooze`) and "Drop the request, with a reason" (`actionmove` to `abandoned`). *(not yet met: T47)*

### screens-investigate (R11 onward)

- **R11** (N997) **help**: "How spot-checks work" in plain words, reached from `calculation`. *(not yet met: T47)*
- **R12** (DEC-203 (1)–(3); K3061 D8) **people**: the people and organisations the record follows, never the group's members (a link to Settings › Members); search ("Name or office") and four filters (show; holding an office in; named in; named recently); "In your projects" first, then the rest, newest added first; the counts line. Rows and order from `peopledirectory` (doubt 1); with it not served, rows from `search` with `type` person and organisation, newest first, no counts, saying so. *(not yet met: T47)*
- **R13** (DEC-203 (4)–(6)) Each row: the kind's mark, the name opening `person`, who they are today, the counts as answered, "Explore connections" (`explore`); "Add someone the record follows" (`entitycreate`, with the member's note); the two empty states. *(not yet met: T47)*
- **R14** (DEC-200 (4); amends R5) On `calculation`, "Record what you saw at a report" sends `testify` and "Count it for the drawn report" sends `spotcheckvisit`, two acts. *(not yet met: T47)*

### screens-publish (R12 onward; R5, R11 amended)

- **R5** amended (K1490, K3041; `case-authoring` R76; DEC-208 (2)): the Ties step's "Confirm, and prepare Edition <n> for signing" sends `publish` with `tieAttested: true`; Sign is offered only after it answers. Test: `publish` carries `tieAttested`; control: no Sign before it. *(not yet met: T47)*
- **R11** amended (K3079 (a)): "No secret this module's screens handle is written to the browser's storage, an address or a later request; the one exception is the signing key kept by the member's choice (`interface-shell` R40, R42)." *(not yet met: T47)*
- **R12** (DEC-207 (2), (3)) The Sign step: "When it becomes public" (now, or a date and time in the group's zone, offered as `publish_at` says), then one button, "Sign and publish now" (`caseratify`) or "Sign now and publish at <time>" (`publishat`), with `signing.ceremony.who`. *(not yet met: T47)*
- **R13** (K3080; DEC-207 (4), DEC-208 (1); `ratification` R52) The button asks the password again where due (`interface-shell` R34), then signs in one sitting (`cs.signer.sign`, R41) the case statement (`caseRatifyStatement`) and one `ratifyStatement` per finding the edition pins and per piece of evidence they rest on, each listed; it sends them in the one act R52 takes (until R52 is merged, `caseratify` then each `ratify`); declined, nothing is sent. Nothing is drawn signed before its answer (R10). *(not yet met: T47)*
- **R14** (DEC-207 (5)) Signed and waiting draws `signing.ceremony.signedat` with "Move the time" (`publishatmove`) and "Cancel publishing" (`publishatcancel`); signed and published draws `signing.ceremony.signednow` with the public page. *(not yet met: T47)*
- **R15** (DEC-207 (6)–(8), DEC-210) `NO_ATTESTING_KEY` draws `signing.ceremony.nokey` with the keep choice and "Register a signing key in this browser" (`signerregisterown`), returning to the step; at the phone width `signing.ceremony.phone`; `CASE_SIGNER_NOT_AN_OWNER` draws `signing.ceremony.notowner` and "Ask an owner to sign" (`signrequest`). *(not yet met: T47)*
- **R16** (DEC-116; R8) `docketpost` signs `docketStatement` in `NS_DOCKET` through `cs.signer.sign` within the prepared statement's 60 minutes. *(not yet met: T47)*
- **R17** (DEC-201 (8)) **review-outside** (published frame, `/app/review#grant=<secret>`, the fragment removed on load): `reviewcopy` (the secret in the body), the link's end date, `reviewcomment`; no session read. *(not yet met: T47)*

### screens-action (R8 onward)

- **R8** (DEC-209 (3), (4); `filings` R54, R55) **request**: the period, the form and the cost limit as fields sent as `fills`; the outward warning names that the portal shows the text to anyone; `filingrecordsent` takes the venue's reference (the portal's request number). *(not yet met: T47)*
- **R9** (DEC-209 (5)) **help-records**, from `request`: what the office must do, the profile's faster request where held (`profiles`' `view`), what the portal shows, what Civicsmith does with the due date; its sources listed. *(not yet met: T47)*
- **R10** (DEC-212) An action opened from the unsent-request item opens at its step (approved, not sent: the send step). *(not yet met: T47)*

### wizard-scripts (R35, R36)

- **R35** (K3062; DEC-200–DEC-212; amends R13, R31) The screen registry is re-taken from `registry.json` at PR #33's head (merged into `tranche/T47` at L11's START): 63 screens; owed acts `owed:passwordreset`, `owed:passwordresetlink`, `owed:grouplanguagesset`, `owed:grouplogoset`, `owed:signrequest` registered as those ops once declared, `owed:projectaikeepaway` as today. Test: `wizardsAt("group")` and `op=wizardcheck` admit `grouplogoset`; control: `hostingaccess` on `setup` is refused. *(not yet met: T47)*
- **R36** (K2241; DEC-205 (3), DEC-207 (10), DEC-208 (2)) BOB adopts from `library.json` at that commit version 2 of "Set up and claim" (step 14 `hostingaccessset`) and of "Publication ceremony" (steps 9–11 re-worded), each `approved` by BOB, its version 1 `updated`. *(not yet met: T47)*

### setup-words (R7)

- **R7** (K3062; amends R6) `WORD_ROWS` is `words.json` at PR #33's head (`WORDS_COMMIT` that commit): 1,728 rows, 617 protected, by R1's rule. Test: equal word by word. *(not yet met: T47)*

### instance-setup (R83 onward)

- **R83** (N1002; retires R47's page share; amends the Purpose) `setupPage`, `groupLine`'s page use, `SETUP_HTML` and the `setup-page` use are removed; `HOSTING_CONTROL` stays R47's one holder, read by `screens-entry` R4, R6 and `installer` R34. Test: no export names the page. *(not yet met: T47)*
- **R84** (DEC-205 (2); DEC-201 (8)) `groupLogoSet({image, by})` (`op=grouplogoset`), an administrator's act: PNG or JPEG by magic bytes, at most 200 KB, `null` clears; refusals `NOT_AN_ADMIN`, `LOGO_REFUSED` (C-64 next free); `groupidentity` answers `logo: true|false`; served public at `/app/assets/group-logo` (control-plane R84). Test: set, read, clear; control: a GIF refused. *(not yet met: T47)*
- **R85** (DEC-205 (1)) `groupLanguagesSet({languages, by})` (`op=grouplanguagesset`), an administrator's act: 1 to 20 tags `jurisdictions.isLocale` accepts, `LANGUAGE_MALFORMED` else; recorded through `setSetting` (`group_languages`); places unchanged. `groupLanguages()` (`op=grouplanguages`, public) answers the list, or the active profiles' languages while none is set. Test: set and read; control: profiles unchanged. *(not yet met: T47)*

### op-declarations (R57 onward)

- **R57** (K3084; `credentials` R65, R66, R69, R71) Specs: `unlock` and `reauth` (a session's own, `session` stamped as `signout`'s, `password` a body field, mutating, `NEEDS` `null`, `source` and `country` stamped); `passwordresetlink` (an administrator's act, `by` stamped, `member` a body field); `passwordresetlook` and `passwordreset` (public, `link` and `password` body fields only, `source` and `country` stamped). Each tested with a negative control, clearing R19/R30's two reds. *(not yet met: T47)*
- **R58** (K3061 D3; `credentials` R66) `REAUTH_ACTS`, frozen, names the acts that ask the password again and the argument that makes them so: `caseratify`, `publishat`, `publishatmove`, `ratify`, `docketpost`; `adminendorse`, `adminremove`, `memberset` (a role to or from `admin`), `memberadd` (role `admin`); `subscriptionsignin` (`step: "start"`), `accountreferenceset`, `groupkeyset`, `projectkeyset`, `projectsigninset`; read by `admission` R25 (doubt 10). *(not yet met: T47)*
- **R59** (DEC-205, DEC-207 (8), N1001) Specs: `grouplogoset`, `grouplanguagesset` (administrators' acts, `by` stamped, `NEEDS` `null`); `grouplanguages` (public read); `signrequest` (`tasks` R19; a member's act, `by` and `viewer` stamped, `NEEDS` `contribute`, `machineClasses: []`); `signintrace` (a test-instance read, administrators' session, `viewer` stamped). R34: each explained in `ACT_HELP` or named in `ACT_HELP_ABSENT`. *(not yet met: T47)*
- **R60** (K3062; amends R21, R27, R54) R21 and R27 read the registry and library at PR #33's head; the owed acts of `wizard-scripts` R35 are served under their names once R57, R59 declare them; `hostingaccessset` is the act on `setup` and `group`. *(not yet met: T47)*

### op-grades (R37)

- **R37** (R32's pattern) Graded, each tested by name: `unlock`, `reauth` (credential ground, `RUNG_ABSENT`); `passwordresetlink` (`reasoned`); `passwordresetlook` (read), `passwordreset` (credential ground); `grouplogoset`, `grouplanguagesset` (`reversible`); `signrequest` (`reversible`); `signintrace`, `grouplanguages` (reads). `publish` is re-graded from its owner's R34, R76 as it now stands (it prepares; `caseratify` signs; doubt 9). *(not yet met: T47)*

### affordances (R56)

- **R56** (K3062; amends R54) `ACT_HELP` re-generated from `mock-acts.js` at PR #33's head by R48's reading: `recover`'s text names any member; `owed_passwordresetlink`, `owed_passwordreset`, `owed_grouplanguagesset`, `owed_grouplogoset`, `owed_signrequest` held under those ops once declared; `publish`, `caseratify`, `publishat` under their re-worded texts. *(not yet met: T47)*

### answer-envelope (R16)

- **R16** (N1002; N1001; amends R6) R6 binds `interfacePage` at `/` and `/app/*`; the setup page is no longer served; the door's row for `signintrace` off a test instance (`SIGNINTRACE_NOT_TEST`) joins `DISPATCH_CHECKS` and its order test. *(not yet met: T47)*

### admission (R23 onward)

- **R23** (K3043; `credentials` R63) An `ai` credential whose row carries a `run` is admitted to a write only when the write names that run; a write naming another run is refused `AI_BEYOND_TASK_SCOPE`. Test with a control. *(not yet met: T47)*
- **R24** (K3084; `credentials` R65, R71 (1)) A locked session is admitted only to `unlock`, `reauth` and `signout`; any other op answers `credentials.sessionLockedRefusal`, relayed as given. Test with a control. *(not yet met: T47)*
- **R25** (K3084; `credentials` R66, R71 (2); `op-declarations` R58) An act `REAUTH_ACTS` names, with its argument, is refused by `credentials.reauthDue({token})`'s answer unless null. Test: inside and outside the window; control: an act not named. *(not yet met: T47)*

### control-plane (R82 onward)

- **R82** (N1002; amends R1, R81) `GET /` with no `op` answers `interfacePage` (the page draws `front` or Home, `interface-shell` R32), under R75's gates and policy, `no-store`; no route serves `setupPage`. Test: `/` answers the interface; control: no setup-page text. *(not yet met: T47)*
- **R83** (K3084; `credentials` R65–R71) `login` passes `handle`, `password` and `device` from the body only (no `role`); `background=1` is passed to the session read and to the store; `unlock`, `reauth` (the session's own token, as `signout`'s), `passwordresetlink` (`by`), `passwordresetlook` and `passwordreset` (credential-free, body only) are routed; the door holds a sign-in's token through `credentials` R70 (`hold: true`, `agent-worker` R81). *(not yet met: T47)*
- **R84** (DEC-205) `grouplogoset`, `grouplanguagesset` and `grouplanguages` routed through `instance-setup`'s map, `signrequest` through `tasksOps`; `GET /app/assets/group-logo` answers the stored logo with its type, or 404. *(not yet met: T47)*
- **R85** (N1001; connect §3) Each `subscriptionsignin` request gets a `trace`, sent with `member_ref` to `agent-worker` in headers, one log line `signin.door` per request, `trace` in every answer. *(not yet met: T47)*
- **R86** (K3060 D10; connect §3; amends R65) On `code` the door sends `hold: true`; an answer carrying `token` is handed to `credentials.subscriptionTokenHold` and its result read; `token` and `valid_for` are removed before answering `held: true`, or `held: false` with the fact's code; `state` is answered from `credentials.accountReferenceState`'s `subscription`; disconnect and revocation drop the token through `credentials` and send `signout`; an ask or draft answered `SIGNIN_TOKEN_REFUSED` calls `credentials.subscriptionTokenRefused`. Test: a sentinel token in no answer, log or request but the hold. *(not yet met: T47)*
- **R87** (connect §3) On a test instance only, a bounded trace store answers `op=signintrace` (the last 200 lines, no token, secret or code); elsewhere `SIGNINTRACE_NOT_TEST`. *(not yet met: T47)*

### plane (R47, R48)

- **R47** (K3084; K3060 D10; amends R33) A `signin` account answered by `answers.askAccount` carries its held token (`credentials` R70's `key`) as `secret` in `agent-worker` R6's wire shape, for ask, draft and transcription; R33's "no `secret` for a sign-in" retires; an answer `SIGNIN_TOKEN_REFUSED` calls `credentials.subscriptionTokenRefused`. Test: the secret reaches only the binding's request; control: an API key as before. *(not yet met: T47)*
- **R48** (N1002; DEC-201; amends R5) The composed page's screens are the nine modules' (`screens-entry` among them), and the route map's tests are re-pinned to the ops of R57–R59 and `tasks` R19. *(not yet met: T47)*

### installer (R50 onward)

- **R50** (N1003; DEC-201 (4), DEC-206 (4)) `GET /` asks only the permanent short name (R41's dialog) and the places (R21), with what is needed stated in one block (R23; doubt 7), then "Before Cloudflare": what will be allowed in plain words and R34's words; "Continue to Cloudflare" sends `POST /begin`. *(not yet met: T47)*
- **R51** (DEC-201 (4)) The progress page draws one plain line per step as it starts and ends; a stop names the step, what to do, and "nothing was created" where R4 holds; the finished panel shows the checks, the one-time password and address once, the probe key behind "most groups never need it", and hands over to `<address>/app/setup#boot=<password>`. *(not yet met: T47)*
- **R52** (DEC-201 (8)) `GET /update` draws the version before and after and "Continue to Cloudflare to update"; a stop says the group's Civicsmith keeps running as it was. *(not yet met: T47)*
- **R53** (DEC-122 (3)) The pages use `interface-assets`' stylesheet and faces, carried in the installer's bundle; no other origin (R35). *(not yet met: T47)*

### tasks (R19)

- **R19** (DEC-207 (8)) `signRequest({case, edition, by, viewer})` (`op=signrequest`): a member who may see the case asks its project's owners to sign a prepared edition; refusals, each writing nothing: a machine `by` `MACHINE_CANNOT_ASK_SIGN`, `NO_SUCH_CASE_EDITION` (absent, invisible or not prepared, one answer), `SIGN_ALREADY_ASKED` (answered with the first); each owner gets a To do of kind `sign-requested` on the case (R14's form), resolved by the owner or when the edition is signed. Test with a control. *(not yet met: T47)*

### action-producers (R25)

- **R25** (DEC-212; K1364; wide path rule 6) CONDITION `request-unsent`: one per filing `filings.approvedUnsent` answers the viewer, keyed `CONDITION::request-unsent::<filing>`, to the member who approved it, else the action's creator, else its project's owners; its subject the action, homed under its project, naming what is asked and the approval date; its doors the action's screen, `queuesnooze` and `actionmove` (`abandoned`, reasoned). Test with a control. *(not yet met: T47)*

### filings (R53 onward; L9)

- **R53** (DEC-212) `approvedUnsent({viewer})`: each filing draft or communication approved (R6) and not recorded sent (R7) on an action the viewer may see, `{filing, action, project, approved_by, approved_at}`, oldest first, at most 200 with `truncated`; writes nothing. *(not yet met: T47)*
- **R54** (DEC-209 (4)) `filingRecordSent` takes `reference`, the venue's own number for the sending (1–100 characters, one line), recorded on the `sent` entry and answered by R13; malformed `SENT_REFERENCE_MALFORMED` (C-115 next free). *(not yet met: T47)*
- **R55** (DEC-209 (3)) `filingPrepare` and `communicationPrepare` take `fills: {<blank>: text}`, the member's own values for blanks the template names, each filled and labelled the member's (R3); a blank the template does not name is refused `FILL_UNKNOWN_BLANK`. *(not yet met: T47)*

### ratification (R52; L8)

- **R52** (Bob's S21 A, K3080; DEC-208 (1)) `caseratify` and `publishat` take `members: [{id, sha, signature}]`, the same signer's signatures of the same sitting over `ratifyStatement` for each finding the edition pins and each piece of evidence they rest on; each is verified as R4 verifies before anything commits, a refusal naming the member and writing nothing; with `caseratify` each commits after the case as R5 does; with `publishat` they are held with the waiting edition and committed by R42's publisher after the case, or stopped with it. Without `members` both act as before. Test: a sitting of 1 + 2 + 5 signatures; control: one bad signature commits nothing. *(not yet met: T47)*

### setup-page (retired whole)

R1–R34 retire, each "moved to" its home: R1 → `screens-entry` R1; R2 → `interface-shell` R36, `screens-entry` R6, R7; R3 → `screens-entry` R2, R6, R7; R4 → `interface-shell` R12; R5, R6, R7, R9, R10 → retired, no home (the intake form and bundle history; `capture`, `document` serve intake; doubt 11); R8 → retired (no registry screen; doubt 11); R11 → `screens-intake` R7; R12, R26, R28 → `interface-shell` R2, R3; R13 → `screens-settings` R19; R14, R27 → `screens-entry` R4, R6; R15 → `screens-entry` R6, `screens-settings` R18; R16, R29 → `screens-entry` R6, `screens-settings` R20; R17 → `screens-entry` R6, `screens-settings` R18; R18, R24 → `screens-entry` R6, `screens-settings` R1, R2, R4; R19, R20 → `screens-entry` R6, `screens-settings` R19; R21 → the screens' words; R22 → `screens-entry` R7; R23 → `screens-settings` R14; R25 → `screens-entry` R10; R30, R34 → `screens-entry` R6, `screens-settings` R15; R31 → `interface-shell` R32; R32 → retired; R33 → `interface-shell` R36. Its code (`bio-plane/src/setup-page/`) and tests (`bio-plane/test/m/setup-page/`) are deleted; `modules.json` keeps the id with empty paths until T48 (K3070).

### journey-check (new file `build/requirements/journey-check.md`; helper, not product)

- **R1** (N1004; K3052, K3053) A Playwright (Chromium) walk, run by `npm run journey` from its directory, in two arms: (a) local, with no account: the installer Worker over the installer's fake Cloudflare account, the hand-over into a plane under Miniflare, then journey 28 (claim, codes, setup, invite, join, codes, a member's first settings, Home, first testimony, sign out, sign in kept, lock, unlock) and journey 3; (b) live, against a named test instance, signing in as the administrator and as a member with credentials read from the environment, never printed, opening `/` and every working screen of the registry. *(not yet met: T47)*
- **R2** Each step is screenshotted into its output directory (generated, never committed); the walk fails on any `ok: false` not expected by the step, any 4xx/5xx, any page whose script throws, any setup-page or legacy-ui address reached, and any registry screen not drawn. *(not yet met: T47)*
- **R3** It writes nothing to the instance but what the journey's acts write, and runs only against an instance whose `bootstrap` answers `test_instance: true`. Test: the walker refuses a non-test instance. *(not yet met: T47)*

### signin-door (new, only if T47-91 is taken)

Requirements by copy: `control-plane` R65, R78, R85–R87 move here (renumbered R1–R5, each "was"), meaning unchanged; control-plane routes `subscriptionsignin` and `subscriptiondisconnect` to it (its R26 pattern).

### Wording by BOB (no job; K3038's precedent)

- `credentials` R9's `op=signerregister` reads "`op=signerregister` (served also as `signerregisterown`, `op-declarations` R21's alias, the name the screens use)", R10 likewise (K3079 (b)).
- `signatures`' Purpose names the in-interface signer (`interface-shell` R40, R41) beside the page as a maker of R1's statements, unchanged in format (K3080).
- Citations of `setup-page` ids in `membership` R11, `entities` R51, `file-safety` R44, `jurisdictions` R88, `answer-envelope` R6, `installer` R45 re-pointed to the new homes above.

---

## C. Audit (K3052): screens and journeys after this fold

| journey / screen | designed where | built by | gap |
|---|---|---|---|
| founder's start: civicsmith.org (`site`) | DEC-206 (1)–(3), registry `site` | none | **gap**: not a product module; host and DNS are Bob's act (D14, N1011); journey 28's first two steps cannot run until then |
| install from the founder's link (`install`) | DEC-201 (4), DEC-206 (4) | T47-87 R50–R51 | deploy waits on Bob's dashboard act (K2164) |
| update (`update`) | DEC-201 (8) | T47-87 R52 | none |
| claim, setup (`setup`) | DEC-201 (5) | T47-86 R6 | "Set up and claim" wizard has no runner in the setup frame (doubt 13) |
| arrive at `/` (`front`) | DEC-201 (1), DEC-202 (1) | T47-86 R1, control-plane R82, interface-shell R32 | none |
| how we work (`tour`) | DEC-205 (5) | T47-86 R3 | none |
| sign in | DEC-201 (1), DEC-202 (2) | T47-86 R2, credentials R65/R67 (merged), control-plane R83 | none |
| sign out | DEC-201 (3) | screens-settings R21, interface-shell R4 | none |
| session expiry, lock, password again | DEC-202 (2) | interface-shell R33–R34, admission R24–R25, op-declarations R58 | none |
| forgotten password, by code (`forgot`) | DEC-201 (2), DEC-202 (3) | T47-86 R4 | none |
| reset link (`reset`, `members`) | DEC-205 (5), DEC-201 (2) | T47-86 R5, screens-settings R23 | the link's maker not answered by `passwordresetlook` (credentials closed; drawn without it) |
| join by invitation or join link (`join`) | DEC-201 (6), DEC-202 (3) | T47-86 R7 | none |
| recover (`recovery`) | DEC-200 (8), DEC-202 (3) | screens-settings R20 | none |
| Home (`home`) | DEC-198, DEC-201 (7) | T46, T47-60 R8, R9, R11 | none |
| `settings`, `group`, `places`, `account`, `members`, `connect`, `notes` | DEC-201 (8), DEC-200 (8), DEC-205 | T46 + T47-58 | none |
| `group-identity`, `security`, `translations` | DEC-152, DEC-165, DEC-157 | T47-58 R14–R16 | none |
| `projects`, `unavailable` | DEC-201 (8) | T47-60 R10, interface-shell R35 | none |
| `review-outside` | DEC-201 (8) | T47-63 R17 | none |
| 1 A group gets going | journey 1/28 | T47-87, -86 | `site` (above) |
| 2 The group says who it is | `group-identity`, `group` | T47-58 | none |
| 3 A member joins | `join`, `home` | T47-86, -60, -57 | none |
| 4 Connecting your own Claude account | `connect` | T47-78…80, -20 (L6), T47-65/-91, -66, -58 R24 | none |
| 5 Declaring your own ties | `ties` | T47-62 R9 | none |
| 6 From a problem to a question | `home`, `finder`, `project`, `question` | T46, T47-60, -61 | none |
| 7 Getting a record | `capture`, `request`, `help-records` | T47-59, -64 | "Get a record" withheld until `@records-request` is reviewed (K3081, Bob names the reviewer); the NextRequest venue words (jurisdictions, L1: T48) |
| 8 Checking a deadline's basis | `due-date` | T47-62 R7 | none |
| 9 Checking a claim | `calculation`, `help` | T47-62 R5, R11, R14 | none |
| 10 Following a person | `people`, `person` | T47-62 R1, R12–R13 | the directory's counts and order (doubt 1) |
| 11 Building a timeline | `timeline` | T47-62 R3 | none |
| 12 Following a money trail | `money` | T47-62 R4 | none |
| 13 Exploring connections | `people`, `explore` | T47-62 R2, R13 | as 10 |
| 14 Following a proceeding | `proceeding` | T47-62 R6 | none |
| 15 From a question to a published case | `case-editor`, `ceremony`, `published` | T47-63, T47-72 R52 (L8) | none if R52 is taken (doubt 5) |
| 16 A professional lends expertise | `members`, `question` (`checkrequest`) | T46, T47-61 | none |
| 17 Working with the assistant | `assistant`, `connect` | T46, T47-61, connect | runs refused at Anthropic do not drop the token (ai-runs merged: T48, order) |
| 18 Asking a standing question | `answers` | T46 | none |
| 19 The daily queue | `queue` (DEC-212) | T46, T47-60 R13, T47-50 R25, T47-90 R53 | none |
| 20 From a knock to the record | `doorbell`, `inbox` | T47-63 R9, T47-59 R12 | none |
| 21 A review copy, out and back | `review-copy`, `review-outside` | T47-63 R2, R17 | none |
| 22 From suspicion to a closed plan | `plan`, `start-send`, `action`, `matter` | T47-64 | none |
| 23 A source changes after publishing | `document`, `queue`, `docket` | T46, T47-61, -63 | none |
| 24 Complying with a court order | `docket`, `person` | T47-63 R8, R16, T47-62 R1 | none |
| 25 Exchanging cases | `imported` | T47-63 R7 | none |
| 26 Reading and checking a case | `published` | T47-63 R6 | none |
| 27 Changing the administrators | `members` | T46, interface-shell R34 | none |
| 28 civicsmith.org to first work | DEC-201 (9), DEC-206 (5) | all above, T47-88 | `site` (above) |
| old pages: `/` setup page | — | retired by T47-74, control-plane R82 | none |
| old pages: legacy-ui (`civicos` Worker) | — | no job in T47 | **gap**: BOB's census of what legacy-ui offers that `/app` does not, before the release; then Bob's deploy act (K1716) taking the Worker off `biosmoke7`; code deleted in T48 (order: membership's re-pin, K3070) |

Every registry screen is built by an entry above except `site` (Bob's DNS, N1011). No user meets the setup page after T47-74 and R82; legacy-ui stays reachable at its own Worker's address until Bob's deploy act.

---

## D. Doubts

### Bob's (P17)
1. **People's counts and order need a read no open layer can give.** The rows' counts (documents, questions, projects naming each one, newest added) and "your projects first" are `people`'s or `retrieval`'s data (L5, closed). Options: A, approve one out-of-layer `people` job adding `peopleDirectory({q, filters, viewer})` (`op=peopledirectory`), before L11's START (K1548); B, the directory without counts in T47 (search rows, newest first), the read first in T48. **Recommend A** (the screen is drawn as Bob delegated it; B ships it half).

### BOB's (technical, wording, packaging; each with its best reading)
2. **control-plane passes 4,000 lines** with T47-65's existing items, the way in and connect §3 (≈4,200 from 3,760). Recommend T47-91 `signin-door` (split by copy, no capability change, K617); else measure at T47-65's START and split there.
3. **`signerregisterown` vs `signerregister`.** It is an alias today (op-declarations R21); the two requirements are re-worded by BOB (K3038's precedent), no job (credentials, signatures closed).
4. **journey-check's registration** reopens membership R140's list test until T48's membership job. Recommend an accepted red named at L11's START (rule 5), not an out-of-layer job.
5. **S21 A with "Publish at…"**: findings can be signed only after the case commits (ratification R5), so a waiting edition cannot carry its findings' signatures today. Recommend T47-72 R52 (L8 not started; follows Bob's ruling, no new meaning).
6. **"Set up and claim" step 1 still says "The free plan works"** (contradicts D5, installer R6). Adopt version 2 as the file gives it and HANDOFF the correction to UX-DESIGN.
7. **The installer's first page** (DEC-206 (4): two choices, "What you need" on civicsmith.org) against installer R23 (the pages state the prerequisites) while civicsmith.org does not exist. Keep R23's one block until the site serves; HANDOFF.
8. **"Confirmed by device unlock"** (K509 (2)): WebAuthn cannot make Ed25519 SSHSIG. Recommend a WebAuthn user-verified assertion bound to the kept key as the one confirmation, the key file's passphrase where no platform authenticator exists; at START.
9. **`publish` is graded Irreversible** but now only prepares (DEC-208 (2)); recommend `terminal` (dialog, sent at phone width), at T47-48's START.
10. **`REAUTH_ACTS`' list** (R58) is BOB's reading of "signing or publishing a case, changing administrators and connecting Claude"; `ratify` and `docketpost` included as signing, the group's and projects' keys as connecting Claude.
11. **Setup-page surfaces with no designed screen** (the intake form, bundle history, an administrator registering a member's key, `signeradd`/`signerset`): dropped as pages, ops kept (K3052); HANDOFF if wanted.
12. **setup-page's delete** merges after its users drop their imports (instance-setup, interface-shell, control-plane); its id stays in `modules.json` (K3070).
13. **The wayin's `walkthrough` op** is superseded by DEC-205's static `tour` (dropped); **"Set up and claim" has no runner in the setup frame**: the setup screen's parts are its steps; the required wizard is offered by the installer's hand-over only (HANDOFF).
14. **connect §3's optional `warm_check`** (instance-setup) not taken: `signintrace` serves the diagnosis.
15. **D11** (a test group Bob installs may use the exception): no product change; the deployer sets `CIVICSMITH_TEST_INSTANCE` on that Worker (installer R49 unchanged); BOB walks Bob through it.
16. **DEC folds before `main`.** DEC-203, -205 and -212 were not named by Bob; K3062 folds PR #33's head at L11's START, read as covering every DEC on it. Recommend also merging PR #33's head before L8's START, so L8–L10 jobs read DEC-209's and DEC-212's words.
17. **DEC-200 (6)**: rows of closed layers read by key (record-core, credentials, file-safety): T48 (order).

---

## E. Reading sets (after this fold)

`python3 build/plan/reading-sets.py` (today), and the same measure with section B's lines placed in each module's public part and the new `uses` edges (`screens-entry → instance-setup`, `installer → interface-assets`, `action-producers → filings`, `tasks → case-authoring`, `journey-check` registered); code and tests as today, so each module's own growth comes with its job. KB, the script's upper bound (used modules' public parts whole); the limit is 600 KB (K2700).

| module | KB today | KB after |
|---|---|---|
| installer | 18,516 | 18,520 (its generated `newgroup` release data counted as code) |
| legacy-ui | 3,559 | 3,559 |
| plane | 3,425 | 3,435 |
| control-plane | 2,983 | 3,001 |
| affordances | 2,479 | 2,482 |
| answer-envelope | 2,309 | 2,314 |
| op-declarations | 2,207 | 2,213 |
| instance-setup | 1,315 | 1,318 |
| store-door | 1,271 | 1,274 |
| queue-producers | 1,207 | 1,209 |
| interface-assets | 1,135 | 1,135 |
| queue | 1,109 | 1,110 |
| notice-producers | 799 | 799 |
| setup-page | 793 | 794 |
| wizard-scripts | 761 | 761 |
| action-producers | 644 | 684 |
| tasks | 645 | 663 |
| admission | 573 | 575 |
| machinery-producers | 533 | 533 |
| op-grades | 506 | 507 |
| interface-shell | 429 | 438 |
| screens-settings | 298 | 307 |
| screens-inquiry | 271 | 280 |
| screens-intake | 272 | 279 |
| screens-daily | 247 | 254 |
| setup-words | 242 | 242 |
| stewards | 240 | 241 |
| screens-entry | 97 | 166 |
| screens-wizards | 153 | 160 |
| screens-investigate | 110 | 117 |
| screens-publish | 107 | 116 |
| screens-action | 107 | 114 |
| journey-check | (new) | 46 |

No module crosses 600 KB because of this fold; the seventeen already over it (installer to tasks) keep their task digests at START (K2032). The screen modules' own code is not yet counted (est. 2,000–3,700 lines each, M-T47-1).
