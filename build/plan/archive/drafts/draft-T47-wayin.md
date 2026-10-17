# Draft: T47 L11, the way in (DEC-200, DEC-201, DEC-202; K3052, K3053, K3060–K3062)

Drafting worker for BOB #166, 2026-10-13. Read-only: no repository file changed. Sources: `build/plan/current.md` (L11, BOB's acts), `next.md` N997, N999, N1001–N1008, `draft-T47-design-audit.md`, `modules.json`, the requirements of interface-shell, setup-page, control-plane, installer, screens-settings, screens-daily, op-declarations, instance-setup (whole) and credentials (Provides); rulings K3052, K3053, K3060, K3061, K3062; design branch `origin/claude/gallant-brown-zg0wc1` @ `cd8a3ee261` (DECISIONS DEC-200–DEC-202, `registry.json` 58 screens read entry by entry, `words.json` 1,692 words, `mock-screens.js` drawings, journey 28 in `mock-journeys.js`, `HANDOFF.md` §0). Ops checked against `bio-plane/src/op-declarations` `OPS` on `tranche/T47` by script.

Line counts (non-test source, `wc -l`, today): interface-shell 1,115 · screens-settings 1,042 · screens-daily 1,135 · screens-inquiry 1,338 · screens-intake 848 · setup-page 2,657 · setup-words 1,512 · op-declarations 3,641 · admission 1,398 · control-plane 3,760 · credentials 4,027 · instance-setup 3,592 · installer source 2,440 (`newgroup/src` 2,080 + scripts 190 + `public/newgroup` 133; `dist/` excluded) · legacy-ui 27,404 (`app.html` 26,550).

---

## 1. Screens: module, ops, exists or new

**Size reasoning.** Built screen modules run about 150–250 lines a screen plus ~70 of words. Estimates below are code lines, comparable to the counts above.

| module | today | + T47 as planned | + the way in | after |
|---|---|---|---|---|
| interface-shell | 1,115 | ~600 (T47-56: R27–R31) | ~650 (front's frame and `/` routing, D3 session record and timers, lock/ended/reauth prompts, `unavailable`, fragment forwarding, test-instance banner) | ~2,350 |
| screens-settings | 1,042 | ~850 (T47-58: group-identity, security, translations) | ~750 (`group`, `settings`, `places`, `recovery`, account and members extended) | ~2,650 |
| screens-settings + setup + join | | | +~1,100 | **~3,750, too close to 4,000 with T47-58's spread** |
| **screens-entry (NEW)** | 0 | — | front ~280, forgot ~200 (with the reset-link state), join ~320, setup ~560, words ~350, index ~50 | **~1,750 (est. 1,500–2,200)** |
| screens-daily | 1,135 | ~250 (T47-60) | ~300 (`projects`, Home's first-visit and new-group states, empty states DEC-201 (13)) | ~1,700 |
| screens-investigate (new in T47) | 0 | est. 2,000–3,000 | help ~90, People directory ~300 | within its estimate |
| screens-publish (new in T47) | 0 | est. 2,000–3,000 | review-outside ~130 | within its estimate |
| installer | 2,440 | — | ~550 (the sequence's pages, refusals per step, update page) | ~3,000 |
| control-plane | 3,760 | ~150 (T47-65) | ~60 (`/` route, new public ops' relays) | **~3,970: at the mark; nothing else may land here** |

Recommendation: one NEW module **`screens-entry`** (front, forgot, join, setup: the screens drawn without a member session, frames `public` and `setup`), layer 11 after `interface-shell`, before `screens-wizards`; uses interface-shell, setup-words, op-declarations, wizard-scripts (the welcome hand-off is `cs.wizard`, never an import). Everything else goes to an existing module.

Op status key: **E** exists in `OPS` today; **T47** added by a T47 entry already planned; **N-L11** new, servable in L11 (T47); **N-L5/L8** new in a layer T47 has not started; **N-L2** new in credentials or another closed layer (section 4, needs Bob's approval).

| screen (registry id) | module | ops it uses |
|---|---|---|
| **front** "Your group's page" (public; `/`) | screens-entry, its frame and session states by interface-shell | reads: `groupidentity` E (public), `groupdescription` E (public parts), `publishedmanifest` E (public; carries edition, date, signer, one line? to verify at START, else public-read in L8, not started), `bootstrap` E (`test_instance`); acts: `login` E (**N-L2**: by handle, device kind own/shared), `unlock` **N-L2** (locked state), links to `doorbell` (T47-63) and `forgot`; "See how it works" → public walk-through read `walkthrough` **N-L11** (wizard-scripts) drawn by screens-wizards |
| **forgot** (public) | screens-entry | `recover` E (**N-L2**: any member, by handle); reset-link state (undrawn, doubt 9): `passwordresetlook`, `passwordreset` **N-L2** |
| **install** sequence: link page, before Cloudflare, progress, stop, finished | installer (separate Worker; cannot use interface-shell) | installer routes `GET /`, `POST /begin`, `GET /callback` E (installer R1–R3); on the new copy `selftest` E, `bootstrap` E; no new op. The registry's `bootstrap` "Continue to Cloudflare" is the installer's `POST /begin`, not the op (doubt 13) |
| **update** | installer | `GET /update`, `POST /begin` mode `update` E (R1, R17); `bootstrap` E (version before) |
| **setup** (setup frame, `/app/setup`) | screens-entry | `claim` E (public), `login` E, `recoverycodesissue` E, `groupnameset` E, `groupdomainset` E, `profilesset` E, `placewanted` E, `officesseed` E, `entitycreate` E, `aikeepaway` E, `groupkeyset` E, `groupkeyswitch` E, `ailimitset` E, `courtnoticeset` E, `hostingaccessset` E (registry says `hostingaccess`, doubt 4), `securitytoolcatalogue`/`securitytooladd`/`securitytooltest` E, `memberadd` (role admin) E, `bootstrap` E (parts); "Finished" → `/app` |
| **join** (setup frame, `/app/join`) | screens-entry | `invitelook` E, `joinlinkinvite` E, `handlecheck` E, `memberlanguageset` E, `enroll` E, `login` E, `recoverycodesissue` E (**N-L2**: refused to a non-administrator today, credentials R46) |
| **home** (extended: first visit, new group, empty) | screens-daily | `promote` E, `startfrom` E, `queue` E, `projectlist` T47 (T47-8, spec T47-53), `projectquestions` T47 (T47-18), `memberlist` E (new-group test); the welcome offer is screens-wizards R7's (device-kept finish) |
| **projects** | screens-daily | `projectlist` T47, `projectquestions` T47, `promote` E; owner per row: `projectlist` answers `{id, name, stage}` only (**N-L2**, project-roster, or drawn without owner, doubt 10); "1 plan": `plans` read of action-plans (L9, open) |
| **settings** (index) | screens-settings (interface-shell R28's list becomes this screen) | none (reads `whoami`'s `administer`) |
| **group** "Your group" | screens-settings | `groupidentity` E, `groupnameset` E, `groupdomainset` E, `courtnotice`/`courtnoticeset` E, `hostingaccess`/`hostingaccessset` E, `strengthbarof` E, `strengthbarset` E (NEEDS `publish`), logo: none (`grouplogoset` **N-L11**, doubt 2), "Languages": registry binds `profilesset`, wrong op (doubt 1) |
| **account** (extended) | screens-settings | `signout` E, `signouteverywhere` E (now drawn), the rest built |
| **members** (extended) | screens-settings | "Make a reset link" `passwordresetlink` **N-L2** (owed DEC-201); "More for administrators" links to `group`, `places`, `recovery` |
| **recovery** (every member's own, D4) | screens-settings | `recoverycodesstate` E, `recoverycodesissue` E (**N-L2** for members), `adminrecoverystep` E |
| **places** | screens-settings | `profiles` E (a read; not in `SESSION_OPS`, as reads need not be), `profilesset` E, `placewantedstate`/`placewanted` E, `entitieskind` E, `officesseed` E, `entitycreate` E (NEEDS `contribute`) |
| **unavailable** (nothing here, not yours, out of reach) | interface-shell (R9's "Nothing here" grown into the registry screen) | none |
| **review-outside** (published frame) | screens-publish | `reviewcopy` E (public), `reviewcomment` E (public) |
| **help** (spot-checks) | screens-investigate (beside `calculation`, which links it) | none (words) |
| **People directory** (K3061 D8; undrawn) | screens-investigate (beside `person`, `explore`) | `search` E with person/organisation types; per-row counts (documents, questions, projects naming them, last date, "your projects first"): `peopledirectory` **N-L5** (people, L5 not started) |

---

## 2. Draft plan entries and requirement lines

### 2.1 Entries (new ids from T47-78; amended ones named)

- **T47-78 · screens-entry** (new) · (N999, N1002, N1005; DEC-201 (1), (2), (5), (6); DEC-202 (1)–(4); K3052, K3053, K3060 D2, D4, D7, K3061 D3) `front`, `forgot`, `join`, `setup` built fresh in the public and setup frames, R1–R9 · registry.json at the design merge; text BOB's · first of the screen modules after interface-shell; `modules.json`/`layers.md` gain it with empty `paths` at L11's START (rule 3; membership's `MODULE_ORDER`, section 4 item 7).
- **T47-56 · interface-shell** (amended) · adds: (N999, K3061 D3, DEC-202 (2)) the session record kept across tabs, the device kind, idle lock and ending, the locked, ended and signed-out states, the password asked again on `REAUTH_DUE`, return to the page; (DEC-201 (8)) `unavailable`; (N1002) `/` serves the page: `front` with no session, else Home; old fragments forwarded; the test-instance notice as a band; `SESSION_STORE_KEY` owned here; R25 and R28's "Group settings → setup page" retired, Settings is the `settings` screen; R29 (People = Find) replaced by the directory (K3061 D8) · text BOB's.
- **T47-58 · screens-settings** (amended) · adds: (DEC-201 (8), DEC-200 (8), N997, N1002) `group`, `settings`, `places`, `recovery`; `account`'s `signout`, `signouteverywhere`; `members`' reset link and "More for administrators"; drops "places and offices, recovery codes stay on the setup page" · registry.json; text BOB's · doubts 1, 2.
- **T47-60 · screens-daily** (amended) · adds: (DEC-201 (7), (8), (13)) `projects`; Home's first visit, new group and empty states; Queue's and Find's empty states · text BOB's · doubt 10.
- **T47-62 · screens-investigate** (amended) · adds: (N997) `help`; (K3061 D8, N1008) the People directory, if drawn by L11's START, else held with its hard reason (the design stream's: not drawn) · text BOB's.
- **T47-63 · screens-publish** (amended) · adds: (DEC-201 (8)) `review-outside` in the published frame · text BOB's.
- **T47-79 · installer** · (N1003; DEC-201 (4), DEC-202; K3053, K3060 D5) the founder's link page as the installer's first page (E2; civicsmith.org is D6, designed after the refresh), the sequence before Cloudflare, progress line per step, each stop in member words, finished (one-time password, address, probe key behind "most groups never need it"), the hand-over to `/app/setup#boot=`, the update page; Workers Paid stated (D5); styling from `interface-assets` (a new edge, earlier in L11) · text BOB's · runs after plane (its `modules.json` place); its deploy waits on Bob's dashboard act (K2164).
- **T47-74 · setup-page** (replaced) · (N1002; K3052) **retired as a page**: its code and tests deleted after T47-78 and T47-56 merge (K624: copy-then-delete in spirit, the new screens first); R1–R34 retired, each naming its new home (section 3); the module's id stays registered with empty paths until membership's re-pin (section 4 item 7) · text BOB's · after T47-78. (N989's R34 work falls away.)
- **T47-75 · instance-setup** (amended) · adds: (N1002) `setupPage`, `SETUP_HTML` and the `setup-page` edge removed (R20–R25, R44–R49, R56–R59, R61 stay retired; the page share of R47 now goes to `screens-entry`'s setup and the installer, `HOSTING_CONTROL` still held here once); (doubt 2) `grouplogoset` and the logo read; (D7) nothing · text BOB's.
- **T47-47 · wizard-scripts** (amended) · adds: (K3060 D7, DEC-202 (4)) `walkthrough`, a public read of the "Welcome a new member" script's steps (what and why, no acts, no data), for the group's page · text BOB's.
- **T47-53 · op-declarations** (amended) · adds: specs for `walkthrough` (public), `grouplogoset`, `peopledirectory`; and, only if Bob approves the credentials job, `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook`, `passwordreset`; `REAUTH_OPS` (the four kinds of act, K3061 D3); R21 read at the design merge (58 screens) with `hostingaccess` re-pointed to `hostingaccessset` · text BOB's.
- **T47-77 · admission** (amended) · adds: (K3061 D3) a locked session admitted only to `unlock`, `signout`, `whoami`; an op in `REAUTH_OPS` refused `REAUTH_DUE` unless the session's reauth window is open (both rows credentials'); each conditional on the credentials job · text BOB's.
- **T47-48 · op-grades**, **T47-49 · affordances** (amended) · grade and explain the way-in ops (`login`, `recover`, `signout`, `signouteverywhere`, `joinlinkinvite`, `passwordresetlink`, `walkthrough`, `grouplogoset`) from `mock-acts.js` at the design merge.
- **T47-52 · setup-words** (amended) · `WORD_ROWS` re-taken at the design merge (1,692 words: `session.*`, `signin.founderhint`, the eleven way-in refusals, `screen.<17 ids>.*`).
- **T47-65 · control-plane** (amended) · adds: (N1002) R1's `/` answers `interfacePage` (not `setupPage`); the new public ops relayed (`walkthrough`; with the credentials job: `passwordresetlook`, `passwordreset`, `unlock`), `login` passing `handle` and `device` from the body only; end-to-end suite signs in at `/` · text BOB's · size: nothing else lands here.
- **T47-66 · plane** (amended) · `/` composed with the nine screen modules; route-map tests re-pinned.
- **T47-80 · journey-check** (not_product, N1004, K3059) · the Playwright walk of journey 28 on a test instance (link → install → claim → codes → setup → invite → join → codes → Home → first testimony → sign out → sign in kept → lock → unlock), screenshot per step, failing on any refusal, old page or missing screen · last in L11.

**L11 merge order (amended):** wizard-scripts, op-grades, affordances, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, interface-shell, **screens-entry**, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, **setup-page (deletes)**, installer, journey-check last. (setup-page's delete job runs after the screens it is replaced by; it can merge any time after control-plane re-points `/`.)

### 2.2 Requirement lines

**screens-entry (new; `build/requirements/screens-entry.md`)**
- **R1** (DEC-201 (1), DEC-202 (1); K3060 D2) **front**, "Your group's page", drawn in the public frame at `/` (and `/app/front`) for a visitor with no live session: the group's name (and logo when set) as masthead, its public purpose (`groupdescription`'s public parts), what it has published (`publishedmanifest`: each case with edition, date, signer and one line, linking `/app/published/<case>`), "Have something for us?" linking `/app/doorbell`, "How we work" with "See how it works, step by step" (R8), and members' sign-in as a panel; "<group> uses Civicsmith" at the foot. An unnamed group shows only what it chose to make public (DEC-132). *(not yet met: T47)*
- **R2** (K3061 D3; DEC-202 (2)) The sign-in panel asks "Your handle" (`signin.founderhint`), "Password", and "This device is" own (`session.keep`) or shared (`session.shared`), nothing preselected but own; sends `login` with `handle`, `password`, `device` in the body only; on success hands the session to interface-shell (its R32) and opens the page the member was on, else Home. States: refused (`refusal.SIGN_IN_REFUSED`), paused with its end (`refusal.SIGN_IN_PAUSED`, `{time}` from the answer's `stated`), signed out (`session.signedout`), ended (`session.ended`), locked (`session.locked`: "Welcome back, <handle>", password, "Unlock" sending `unlock`; "Not <handle>? Sign in as someone else" signs out). The form keeps the handle and clears the password on refusal. *(not yet met: T47)*
- **R3** (DEC-201 (2), DEC-202 (3); K3060 D4) **forgot**, public frame: "Use one of your recovery codes" (handle, code, new password twice) sends `recover` in the body only, one refusal for every arm (`refusal.RECOVERY_REFUSED`); on success states the codes left and that other sign-ins ended, linking the front; "No codes to hand? Ask an administrator" (the reset link); "If no administrator can get in" (the hosting account, linking the rotation guide). A reset link (`#reset=` in the address fragment, removed on load) draws the choose-a-new-password state: `passwordresetlook`, then `passwordreset` with the new password twice; a dead link draws one sentence. *(not yet met: T47)*
- **R4** (DEC-201 (5); K3053; setup-page R14–R18, R29, R30 moved) **setup**, setup frame at `/app/setup`: the seven parts in order (claim; recovery codes; name, logo, website; places and languages; offices and seats; who sees what about people; the assistant; court notice; administrators and the hosting account; security tools; finished). The claim fills the one-time password from `#boot=` (fragment removed on load), asks the founder's password twice (12+), sends `claim`, then `login` as `admin` (device own) and `recoverycodesissue`, showing the ten codes once (copy, save as a file made in the browser; never stored). Each later part is its op as the registry lists it; every part may be left and resumed; "Finished" links `/app` (Home's new-group state). The hosting-account block is `instance-setup` R47's words (`HOSTING_CONTROL`). "Administrators see spending by member" is not drawn (DEC-188 (5)); "safe view" and "file scanner" only (DEC-200 (5)). *(not yet met: T47)*
- **R5** (DEC-201 (6), DEC-202 (3); setup-page R2, R3, R22 moved) **join**, setup frame at `/app/join`: `#invite=` reads `invitelook`; `#join=` first asks the name the group will know the person by (`joinlinkinvite`); a used, expired, withdrawn or switched-off link draws "This link no longer works" (one sentence for `NO_SUCH_INVITATION`, `NO_SUCH_JOIN_LINK`, `JOIN_LINK_DAILY_CAP` by its own words); then language (`memberlanguageset` after sign-in), handle checked as typed (`handlecheck`; free, taken, not allowed; fixed for good, DEC-197), password twice; `enroll`; `login` (device own); `recoverycodesissue`, the codes shown once; then Home opens with the welcome offer. "Already a member? Sign in" links the front. *(not yet met: T47)*
- **R6** No password, one-time password, recovery code, reset or invitation link typed or shown on these screens is written to the browser's storage, an address, a log or a later request; every fragment is removed on load. *(not yet met: T47)*
- **R7** (K3060 D7; DEC-202 (4)) The walk-through: "See how it works, step by step" opens `walkthrough`'s steps (what and why of "Welcome a new member") in the public frame, readable before joining or being invited, offering no act. *(not yet met: T47)*
- **R8** `interface-shell` R5, R8–R13, R22 hold on every screen of this module; the public and setup frames draw no rail, tabs or dock. *(not yet met: T47)*
- **R9** (Invariant) No place is named in the module's behaviour or words (README rule 7). *(not yet met: T47)*

**interface-shell (R32 onward)**
- **R32** (N999; K3052; K3061 D3; amends R3, R4; replaces `setup-page` R31) The session record `SESSION_STORE_KEY` is this module's, held in `localStorage` (kept across tabs, K3052) as `{t, e, d, w}` (`d` the device kind `own`/`shared`); every tab sees a sign-out, lock or end through the storage event. `/` and `/app/*` with no live record draw `front`; with one, `/` opens Home. A 401 clears the record and draws `front`'s ended state, keeping the path to return to (in `sessionStorage`, never the token). *(not yet met: T47)*
- **R33** (K3061 D3) Idle: the shell counts the member's own input (keys, pointer, touch) and her acts, never its own timers' reads (`cs.later`, the queue count), and marks those reads background so the plane does not count them as activity. Kept device: at 30 minutes idle the page locks (`session.locked`), keeping the screen and what was typed; shared: at 15 minutes idle it signs out (`signout`) and draws `front`'s ended state. The plane's answer (`SESSION_LOCKED`, 401) governs over the page's own clock. *(not yet met: T47)*
- **R34** (K3061 D3; DEC-202 (2)) An act refused `REAUTH_DUE` opens a password dialog (`session.reauth`), sends `reauth`, and on success resends the act once; cancelling sends nothing. *(not yet met: T47)*
- **R35** (DEC-201 (8)) **unavailable**: an unknown screen or subject draws "Nothing is here"; a refusal meaning not visible (`NOT_VISIBLE`, `NOT_A_PARTICIPANT` and the rows BOB names) draws "You can't open this"; a failed fetch or a 5xx draws "can't be reached", retrying every 30 seconds and keeping what was typed. Replaces R9's bare `state.empty` for a whole screen. *(not yet met: T47)*
- **R36** (N1002; setup-page R2, R33 moved) Old addresses keep working: `/#invite=`, `/#join=` forward to `/app/join`, `/#boot=` to `/app/setup`, the fragment carried and nothing else; while `bootstrap` answers `test_instance: true` every frame shows the test-instance band (setup-page R33's words). *(not yet met: T47)*
- **R37** (amends R25, R28, R29) Settings is the `settings` screen (`screens-settings`); no link opens `/` for settings; the People place opens the directory (`screens-investigate`), "comes later" while it is not built. *(not yet met: T47)*

**screens-settings (R17 onward)**
- **R17** (DEC-201 (8)) **settings**: "Yours" (account, the assistant, ties, notes, recovery codes) then, to a session that administers, "The group's" (your group, who your group is, members, places and offices, security, translations, wizards), each a reference. *(not yet met: T47)*
- **R18** (DEC-201 (8)) **group**, administrators' (others see that it is administrators'): name (`groupnameset`), website (`groupdomainset`, verified date), the court notice (`courtnotice`, `courtnoticeset`), the hosting account's holder (`hostingaccess`, `hostingaccessset`), the group's bar (`strengthbarof`, `strengthbarset`, reasoned); logo and languages per doubts 1–2. *(not yet met: T47)*
- **R19** (DEC-200 (8), N997; setup-page R13, R19, R20 moved) **places**, administrators': the active profiles (`profiles`, `profilesset` with the warning that local facts read differently from then on), the place wanted (`placewantedstate`, `placewanted`, who and when), offices and seats (`entitieskind` office, paged, each marked by origin; `officesseed`; `entitycreate`). *(not yet met: T47)*
- **R20** (DEC-200 (8), DEC-202 (3); setup-page R16, R29 moved) **recovery**, each member's own: `recoverycodesstate` (held, unused, issued), `recoverycodesissue` (shown once, spending earlier codes, never stored), and to an administrator `adminrecoverystep`'s note while not met. *(not yet met: T47)*
- **R21** (DEC-201 (3)) **account** draws "Sign out on this device" (`signout`) and "Sign out everywhere" (`signouteverywhere`), each then drawing `front`'s signed-out state. *(not yet met: T47)*
- **R22** (DEC-201 (2), DEC-202 (3)) **members**: a member's row offers "Make a reset link" (`passwordresetlink`, reasoned; the link shown once with "Civicsmith sends no email"); "More for administrators" links `group`, `places`, `recovery`. Drawn only once the op is served. *(not yet met: T47)*

**screens-daily (R10 onward)**
- **R10** (DEC-201 (8)) **projects**: `projectlist` with each project's count (`projectquestions`), stage ladder and owner (doubt 10), `truncated` said; "Start a project" (`promote`). *(not yet met: T47)*
- **R11** (DEC-201 (7)) Home: with no project and one member, the new-group state ("Nothing is here yet", inviting members, saying who the group is); a member who has not finished "Welcome a new member" on this device sees the continue offer (screens-wizards R7). *(not yet met: T47)*
- **R12** (DEC-201 (13)) Queue's empty state "You are up to date", Find's no-result state (what search covers, "Capture it"). *(not yet met: T47)*

**screens-investigate (R11 onward)**
- **R11** (N997) **help**: one method in plain words, reached from `calculation`'s spot-check. *(not yet met: T47)*
- **R12** (K3061 D8) **People**: the directory of people and bodies the record follows (never members): search and filters (office or body, project, recent activity), each row role and office, counts of documents, questions, projects naming them and when last, the member's projects' first; a row opens `person`; "Explore connections" from it; the empty state saying how a person enters the record. As drawn by the design stream. *(not yet met: T47)*

**screens-publish (R12 onward)**
- **R12** (DEC-201 (8)) **review-outside** in the published frame at `/app/review/<grant>` (the secret in the fragment only): `reviewcopy`, the link's end date, `reviewcomment`; no session read. *(not yet met: T47)*

**installer (R50 onward)**
- **R50** (N1003; DEC-201 (4)) `GET /` is the founder's link page: what Civicsmith is (R42's lines), what is needed (Workers Paid and a payment method, ~20 minutes, no Claude account), the permanent short name (R41's dialog), the places (R21), then "Before Cloudflare": what will be allowed, in plain words, and R34's hosting-account words; `POST /begin` on "Continue to Cloudflare". *(not yet met: T47)*
- **R51** (DEC-201 (4)) The progress page draws one plain line per step (R4–R15, R46) as each starts and ends; a stop names the step, what to do, and "nothing was created" where R4 holds; the finished panel shows the checks, the one-time password and address once, the probe key behind "most groups never need it", no member key (R16), and hands over to `<address>/app/setup#boot=<password>`. *(not yet met: T47)*
- **R52** (DEC-201 (8)) `GET /update` draws the version before and after and "Continue to Cloudflare to update"; a stop says the group's Civicsmith keeps running as it was. *(not yet met: T47)*
- **R53** (DEC-122 (3)) Pages use `interface-assets`' stylesheet and faces, carried in the installer's bundle; no other origin (R35). *(not yet met: T47)*

**setup-page:** see section 3 (every id retired).

**control-plane (R82 onward)**
- **R82** (N1002; amends R1, R81) `GET /` with no `op` answers `interfacePage` (the page draws `front` or Home, interface-shell R32) under R75's gates and policy, `no-store`; `setupPage` is no longer served. *(not yet met: T47)*
- **R83** `login` passes `handle`, `password`, `device` from the body only (not `role`); `walkthrough` is routed with no credential; with the credentials job, `passwordresetlook`, `passwordreset` (public, body only), `unlock`, `reauth` (the session's own). *(not yet met: T47)*

**op-declarations (R57 onward)**
- **R57** Specs for `walkthrough` (public read), `grouplogoset` (administrator, mutating), `peopledirectory` (member read); each in its owner's family, tested by name with a negative control. *(not yet met: T47)*
- **R58** (conditional on the credentials job; K3061 D3) Specs for `unlock`, `reauth` (session ops), `passwordresetlink` (administrator), `passwordresetlook`, `passwordreset` (public); `REAUTH_OPS`, frozen: the signing and publishing acts (`caseratify`, `publishat`, `docketpost`, `signerregisterown`), the administrator changes (`memberset` to or from `admin`, `adminendorse`, `adminremove`, `memberadd` with role `admin`), connecting Claude (`subscriptionsignin` `start`, `accountreferenceset`); the list BOB's at START. *(not yet met: T47)*

**instance-setup (R83 onward)**
- **R83** (N1002; retires R47's page share) `setupPage`, `groupLine`'s page use and `SETUP_HTML` are removed; `HOSTING_CONTROL` stays the one holder of R47's words, read by `screens-entry` R4 and `installer` R34. *(not yet met: T47)*
- **R84** (DEC-201 (8); doubt 2) `groupLogoSet({image, by})` (`op=grouplogoset`), an administrator's act: PNG or JPEG only (magic bytes), at most 200 KB, stored once per group, `null` clears; `groupidentity` answers whether one is set; served at `/app/assets/group-logo`. *(not yet met: T47)*

**wizard-scripts (R35)**
- **R35** (K3060 D7) `walkthrough()` (`op=walkthrough`, public): the approved "Welcome a new member" script's steps (`what`, `why`, screen names), no drafts, no data, no acts. *(not yet met: T47)*

---

## 3. Retiring the setup page at `/` and legacy-ui for users (N1002)

**What moves (setup-page → new home):**

| setup-page | to |
|---|---|
| R1 group line | front (R1), masthead |
| R2 fragments `#boot=`, `#invite=`, `#join=` | interface-shell R36 (forwarding), screens-entry R4, R5 |
| R3 public ops before sign-in; claim/enrol twice-typed password | screens-entry R2–R5 |
| R4 acts by `whoami` | interface-shell R12 (as built) |
| R5, R7, R9, R10 intake form; R6 history listing | **retired**: `capture`, `document` (built) cover intake; no bundle-history screen exists (BOB notes it; no user surface needed for `seq` order) |
| R8 administrator registers a member's signing key (`signeradd`) | **no registry screen** (doubt 11); members self-register on `account` |
| R11 inbox resolve with reason | `inbox` (built, screens-intake) |
| R12, R26, R28 no outside load, token only in header, nonce | interface-shell R2, R3 (built) |
| R13 profiles | `places` (screens-settings R19) |
| R14, R27 hosting block slot, rotation guide | `setup` (R4) and `forgot` (R3, link); the guide becomes a `help`-style page (screens-entry or screens-investigate's help, BOB's) |
| R15 hosting access | `setup`, `group` |
| R16, R29 second administrator, recovery codes at claim | `setup`, `recovery` |
| R17 court notice | `setup`, `group` |
| R18, R24 assistant choices, keep-away | `setup`, `members`, `connect` (built) |
| R19, R20 place wanted, offices | `setup`, `places` |
| R21 DEC-149 words | the new screens' words |
| R22 language at enrolment | `join` |
| R23 description draft | `group-identity` (T47-58 R14) |
| R30, R34 security tools step, parts | `setup`, `security` (T47-58 R15) |
| R31 session record | interface-shell R32 |
| R32 hand-over to `/app` | retired (sign-in is in the interface) |
| R33 test-instance notice | interface-shell R36 band, front |
| R25 invariant | screens-entry R9 |

**Deleted:** `bio-plane/src/setup-page/index.mjs` (2,657 lines); instance-setup's `setupPage`/`SETUP_HTML` composition (`setup.mjs` line 12, 51); interface-shell's `import * as SETUP_PAGE`; control-plane's `/` branch calling `setupPage`. `HOSTING_CONTROL` stays (installer, setup screen).

**Tests that retire:** `bio-plane/test/m/setup-page/` whole (13 tests + `fixture.mjs`: claim, guide, handover, intake, keys, loads, nonce, page, security, session, settings, words, worker-page), each arm re-homed where its requirement moves (claim, session, security, settings, words, nonce rewritten under screens-entry / interface-shell / screens-settings; intake, keys, handover dropped). **Re-pointed:** `test/m/instance-setup/page.test.mjs` (drop), `instance-setup/profiles.test.mjs` (its page arm), `interface-shell/session.test.mjs` (new record), `answer-envelope/page-policy.test.mjs` (policy over `interfacePage` at `/`), `control-plane/t46-e2e.test.mjs` (sign in at `/` through `front`), `membership/module-order.test.mjs` (section 4 item 7).

**legacy-ui (`civicos-ui/`, the `civicos` Worker):** for users, it is retired by taking the `civicos` Worker off biosmoke7 (a deploy act, Bob approves in session, K1716) once T47-63's `published` and `doorbell` pages serve and the journey check passes; before that, a worker's census of what legacy-ui offers that `/app` does not (P4; e.g. ballots, conclude, elicitation, notifications) so nothing is lost silently. The code module stays registered (`legacy`) in T47: deleting `civicos-ui/` (32 tests in `civicos-ui/test/`, plus `bio-plane/test/budget.mjs`, `caseceremony.mjs`) changes membership's `MODULE_ORDER` (L2), so it goes in T48's first job with the re-pin, or in the out-of-layer job if Bob approves it. N794, N865 reds stay accepted until then. The legacy census row in `current.md` changes from "stays (Bob's K633…)" to "retired for users (K3052); code deleted in T48 (the order: membership's re-pin)".

---

## 4. Needs a module in an EARLIER (closed) layer: needs Bob's approval (K1548), else first in T48

Layers closed: L1, L2 (L3 in progress). L5, L6, L8, L9, L10 have not started, so N1001's agent-runner/agent-worker entries (D10's container side), a `people` read for the directory (L5) and any `public-read` field for the front (L8) can join T47 before those STARTs with no approval.

**credentials (L2), what it must newly provide** (one job, CREDENTIALS #14):
1. **Sessions per D3 (K3061).** `login({handle | role, password, device, …})`: `device` `own` or `shared` recorded on the session; `session(token)` answers `null` once the session is idle past its limit (shared: 15 minutes; own: 12 hours after it locked, BOB's reading, doubt 6), answers `locked: true` after 30 minutes idle (own), and records activity on each request not marked background; an absolute cap (BOB's detail, doubt 6). `unlock({token, password})` (counted under R38's window, R41's comparison) clears the lock. Rows `SESSION_LOCKED`.
2. **Password asked again (K3061 D3).** `reauth({token, password})` opens a short window (BOB's value, e.g. 5 minutes) answered by `session()` as `reauthUntil`; row `REAUTH_DUE` minted here once (admission refuses through it, K231).
3. **Sign-in by handle.** `login` and `recover` take a `handle`, resolved through `membership.memberByHandle` (exists, L2) with `admin` reserved for the founder, every arm still one refusal at one cost (R4, R47). (Today the role is `member:<memberId>`, and the member id is not the handle.)
4. **Recovery codes for every member (K3060 D4).** R46: any active member may issue their own (not only administrators); R47: any active member's role may recover; codes spent on revocation (R16 as now). `instance-setup` R66 (administrators' step) unchanged.
5. **The reset link (K3060 D4; owed `passwordresetlink`).** `passwordResetLinkMake({member, by})` (administrator only; one live per member; 7 days; answered once), `passwordResetLook({link})` (public: live or not, one answer for every dead arm), `passwordReset({link, password})` (public; R38's window; 12+; sets the password as R3 does, ends every session of that role, spends the link, records who made it and when); links die on revocation (R16). Rows C-29 next free.
6. **The held token (K3060 D10, K3061).** R43 replaced: a member's (and a project's, the group's) subscription sign-in token sealed under `ACCOUNT_SEAL_SECRET`, held until revoked at Anthropic or dropped (disconnect, revocation), handed in-plane only to the runner that serves that account, never in an answer; the container free to sleep. (The runner's side is N1001's L6 entries.)

**membership (L2):**
7. **`MODULE_ORDER` (R83)** re-pinned for `screens-entry` (new) and, when deleted, `setup-page` and `legacy-ui`. Without a membership job its `module-order.test.mjs` is red from L11's START (an accepted red, named then) until T48's membership job. Alternative avoiding it: no new module (screens-entry's four screens split between interface-shell and screens-settings, ~3,750 there, doubt 12).

**project-roster (L2):**
8. `projectlist` answering each project's owner (the `projects` screen's "owner Dev"). Or the screen draws without owner until T48 (doubt 10).

---

## 5. Conflicts and doubts, each with a recommendation

1. **`group`'s "Languages" is bound to `profilesset`** (the places' op), and no op sets a group's languages. Recommend: draw Languages as the languages the group holds translations for, read-only, linking Translations; registry correction asked of UX-DESIGN (HANDOFF). No new op.
2. **The logo ("Change your logo", setup's "Add your logo") has no op.** Recommend `grouplogoset` in instance-setup (L11, in T47; R84 above: PNG/JPEG, 200 KB, magic bytes, served from the plane). If BOB prefers, hold it with a named reason; P19 says build it.
3. **`act.recover.does` says "for an administrator"**, contradicting D4. Recommend the design stream rewords it (HANDOFF); build reads by key.
4. **The registry names `hostingaccess` (the read) as setup's and group's act**; the act is `hostingaccessset`. Recommend R21 re-point (as R28's four) plus a registry correction.
5. **Session storage.** K3052 wants sign-in kept across tabs; today `sessionStorage`, one tab. Recommend `localStorage` for both device kinds with the server enforcing idle and lock (a stolen-tab risk bounded by the plane, the CSP nonce and the header-only token); not cookies (admission R20).
6. **D3's "12 hours".** Read as: an own device is signed out 12 hours after it locked (idle), and a shared one at 15 minutes idle. Recommend also an absolute cap (30 days own, 12 hours shared), BOB's detail recorded in rulings, not asked.
7. **Idle measurement.** A page polling (queue count, `cs.later`) must not keep a session alive. Recommend a header marking background reads, which credentials does not count.
8. **Login by handle.** The design asks for the handle; `login` takes `member:<memberId>`. Recommend credentials item 3. If Bob refuses the L2 job, the front cannot sign members in by handle in T47: fallback is the plane resolving the handle before `login` (plane is L11), at one cost, a composition-root wrapper BOB would rather avoid.
9. **Undrawn states.** The reset link's choose-a-password state on `forgot` and the members' shown-once reset link; the visitor's walk-through (the design links "See how it works" to `home`, a member screen); People. Recommend one QUESTION to UX-DESIGN at L11's START naming all three; built as R3/R7/R12 above if drawn by START, else each held with its hard reason.
10. **Projects' owner and "1 plan".** `projectlist` has no owner (project-roster, L2). Recommend item 8 in the out-of-layer job; else draw without owner (named), and "plans" from action-plans' read (L9, open).
11. **Capability the setup page carries with no new screen:** `signeradd`/`signerset` (an administrator registers or revokes a member's key), the record browser and intake form, a bundle's history. Recommend: drop the page surfaces (ops kept), report to Bob as done (K3052 retires the old page; members self-register keys). If wanted later, a HANDOFF for members' row panel.
12. **A new module touches L2** (doubt in section 4 item 7). Recommend the new module anyway (P6: screens-settings would sit at ~3,750) with the red accepted until T48, or folded into the out-of-layer job.
13. **`install` and `update` are registry screens no plane module serves** (the installer is its own Worker; their `bootstrap` act is `POST /begin`). Recommend wizard-scripts and op-declarations tests that sweep the registry treat `frame: setup` screens owned by `installer` as served by it, by name.
14. **control-plane at ~3,970 lines.** Recommend nothing else routed there in T47; measure at T47-65's START (M-T47-1) and name its split map if over.
15. **The installer's deploy** still lacks `connectivity-directory.bind` (K2164, Bob's dashboard act) and the founding journey's start moves to civicsmith.org later (D6). Recommend: build E2 now (the installer's first page is the link page), walk Bob through the dashboard act at L11's START, civicsmith.org as a T48 design.
16. **Old invitation and hand-over links** (`/#invite=`, `/#join=`, `/#boot=`) in members' hands. Recommend interface-shell R36's forwarding, kept permanently (cheap).
17. **T47-74 (setup-page R34) and T47-58's "places and recovery stay on the setup page"** are superseded; T47-56's R25/R28 Group-settings link and R29 are replaced. Recommend these entries rewritten at L11's START, no job for R34.
18. **If Bob refuses the credentials job:** front, forgot (by code, administrators only, by member id), join and setup still ship in T47 on today's ops; D3's lock and reauth, members' codes, the reset link and D10's held token go first in T48, and the release cannot be called complete against K3053 (the member's lost-password path is missing). Recommend telling Bob that consequence when asking.
