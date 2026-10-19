# Census re-run (M-T51-3) on tranche/T51 @ 7e184a024a

Paths are under /home/user/bio/bio-plane/src (screens-* modules, interface-shell, control-plane) unless given. Static reading only; no test run. Header comments cite requirement ids and DEC/census row ids, used as evidence with spot reads of the code.

## Old interface gone
- `civicos-ui/` does not exist (ls fails). `bio-plane/test/budget.mjs`, `caseceremony.mjs`, `plane/screens.mjs`, `signpage.mjs`, `sign-release.html` do not exist. `bio-plane/public` holds only `newgroup/index.html` (installer).
- `GET /` and `/app/*` serve `interfacePage` (control-plane/index.mjs:37, 689-727, app.mjs). `/sign` is no route (control-plane/index.mjs:674, R109; app.mjs:39).
- No `legacy-ui`/`civicos-ui` in build/modules.json, .github/workflows, .claude/settings.json (grep empty).
- Remaining `civicos-ui` mentions: comments only (gate.mjs:1174, answer-envelope/checks.mjs:24, run-rules/checks.mjs:478, action-grammar/checks.mjs:511, test/members.test.mjs, test/system/row-census.test.mjs:258, .gitignore:128,135 notes), the embedded stylesheet text (interface-assets/index.mjs:11), generated bundles (release/*.bundled.mjs, newgroup/src/release.mjs; change only at release), and the trip-wire `LEGACY_UI_WORKER = "civicos"` (journey-check/walker.mjs:18, :204; test walker.test.mjs:23). All intended (K3807, T51-131, CR-5).
- No served route draws `app.html`.

## Table
Status words: SERVED = a new screen does it; DROPPED = Bob's ruling K3807 (build/rulings.md:3805; plan current.md:15); MISSING = no screen.

| Row | Feature | Verdict | Evidence |
|---|---|---|---|
| A1 | Sign-in gate | SERVED | screens-entry/front.mjs (`front`, login/unlock) |
| A2 | Plane-address field | DROPPED | K3807 (dev scaffolding) |
| A3 | No-data design preview | DROPPED | K3807 |
| A4 | View the public record | SERVED | screens-entry/front.mjs (`publishedlist`), screens-publish/published.mjs |
| A5 | Masthead, domain verdict line | SERVED | screens-settings/group.mjs:82 (domain.verdict), shell mark; T51-116 |
| A6 | Rail, counts, collapse | SERVED | interface-shell/browser.mjs:1117-1118 (queue counts), :1168 (count on Queue), :218 rail width grip (R26); see UNSURE note |
| A7 | Back button, scroll | SERVED | interface-shell/browser.mjs pushState, :1251-1255 scroll kept on redraw; addresses /app/<screen>/<subject> |
| A8 | Masthead search | SERVED | screens-daily/finder.mjs |
| A9 | Newer-version banner | SERVED | interface-shell/browser.mjs:1184, :1599 (R92, polls GET /version) |
| A10 | 45 s list refresh | SERVED | interface-shell/browser.mjs:344, :805 (R93) |
| A11 | State chips, glossary | SERVED | screens-settings/glossary.mjs (R59, `glossary`); `cs.stateChip`, `cs.term` (R95) |
| A12 | Refusal sentences | SERVED | shell `refusal.` family; every screen module |
| A13 | Read-only sentence | SERVED | interface-shell/browser.mjs:812 (R94 `readonly`); screens-action T51-122 |
| A14 | Whole record as sortable table | SERVED | screens-daily/finder-states.mjs (R55) |
| A15 | Evidence finder, three routes | SERVED | screens-daily/finder-states.mjs:110-175 (routes counted apart, ROUTES_CROSSED refusal, covered panel) |
| A16 | Hold documents together | SERVED | screens-daily/finder.mjs |
| A17 | Cite a whole held set | SERVED | screens-daily/finder-states.mjs (R57 `cite`) |
| A18 | Cite document or passage | SERVED | screens-inquiry/document.mjs, screens-daily/find-in.mjs, question.mjs |
| A19 | Retire a document | SERVED | screens-inquiry/document.mjs |
| A20 | Sever / reinstate edge | SERVED | screens-inquiry/question.mjs |
| A21 | Review screen, release many | SERVED | screens-intake/held.mjs |
| A22 | Release one document | SERVED | screens-inquiry/document.mjs; screens-intake/held.mjs |
| A23 | Defer / dismiss a question | SERVED | screens-inquiry/question.mjs:196-198, :820-830 (`proposedispose`, project arm) |
| A24 | Co-attest a capture | SERVED | screens-inquiry/document.mjs (attest) |
| A25 | Document "What it says" | SERVED | screens-inquiry/document.mjs |
| A26 | Fingerprints with copy | SERVED | screens-inquiry/document.mjs:526-532 (R66, `hashcopy`) |
| A27 | Record stratum, log, revisions, compare | SERVED | screens-inquiry/document.mjs:26, :387-389 (`bundlehistory`), :421-515 (`revisioncompare`) |
| A28 | Verify on open | SERVED | screens-intake/open-file.mjs (server digest check via `cs.download` verify; R39); mechanism changed |
| A29 | Unfinished capture, finish | SERVED | screens-intake/capture.mjs:179-195 |
| A30 | Link groups, leave-the-record | SERVED | screens-inquiry/document.mjs:570-575 (five groups, verdict words, leave dialog) |
| A31 | What the record knows | SERVED | screens-inquiry/document.mjs:597 (names with grade, how matched) |
| A32 | Cites / cited-by | SERVED | screens-inquiry/document.mjs |
| A33 | Watch a source | SERVED | screens-inquiry/document.mjs (monitor) |
| A34 | Newer version per leg | SERVED | screens-inquiry/document.mjs (versionnotice); T51-119 "leg by leg" |
| A35 | Question page | SERVED | screens-inquiry/question.mjs |
| A36 | Two strengths | SERVED | screens-inquiry/question.mjs |
| A37 | Frozen pair per published case | SERVED | screens-inquiry/question.mjs:709-725 (`publishedfrozen`, R72) |
| A38 | Conclude dialog | SERVED | screens-inquiry/question.mjs |
| A39 | Which reasons carry the answer | SERVED | screens-inquiry/question.mjs |
| A40 | Readings review, diff, tree | SERVED | screens-inquiry/question.mjs:631 (differences), :640-664 (derivation tree) |
| A41 | Accept ceremony, lens | SERVED | screens-inquiry/question.mjs:564-572 (R74, bias it was composed under) |
| A42 | Stance | SERVED | screens-inquiry/question.mjs (versioncurrent, withdrawconclusion) |
| A43 | Raised-by-machine mark | SERVED | screens-inquiry/question.mjs |
| A44 | Projects list | SERVED | screens-daily/projects.mjs |
| A45 | Project workspace | SERVED | screens-inquiry/project.mjs |
| A46 | Roster acts | SERVED | screens-inquiry/project.mjs, screens-daily/projects.mjs |
| A47 | Owner removal ballot, threshold table | SERVED | screens-inquiry/project.mjs:338-350 (`projectownerarith` table, votes) |
| A48 | Project visibility | SERVED | screens-inquiry/project.mjs |
| A49 | AI-run indicators | SERVED | screens-inquiry/assistant.mjs (airuns, airun) |
| A50 | Subjects of other kinds | SERVED | screens-investigate/people.mjs:27-54 (R40 other kinds), person.mjs |
| A51 | Register a subject, record's kinds | SERVED | screens-investigate/people.mjs:53-54 (person, institution, office, ordinance, contract, fund, program, place, parcel, source; entitysimilar near-match) |
| A52 | Alias, declare relation | SERVED | screens-investigate/person.mjs |
| A53 | Resolve mentions | SERVED | screens-investigate/person.mjs |
| A54 | Progressions | SERVED | screens-investigate/timeline.mjs, timeline-parts.mjs |
| A55 | Themes | SERVED | screens-investigate/theme.mjs |
| A56 | Queue | SERVED | screens-daily/queue.mjs |
| A57 | Resolve / forward obligation | SERVED | screens-daily/queue.mjs |
| A58 | Multi-select in queue | SERVED | screens-daily/queue-states.mjs (R58, `queue.multi.*`) |
| A59 | Noticed findings | SERVED | screens-daily/queue.mjs |
| A60 | Mute kinds | SERVED | screens-daily/queue.mjs |
| A61 | What was answered | SERVED | screens-daily/queue-states.mjs:203 (R59, `queue.answered.*`) |
| A62 | Queue honesty statements | SERVED | screens-daily/queue-states.mjs (R60 all-clear by kind, failed feed retry) |
| A63 | Set-aside findings | SERVED | screens-daily/queue-states.mjs:203 (R61); screens-investigate/timeline.mjs |
| A64 | Add by address, already held, changed | SERVED | screens-intake/capture.mjs:206, :293-294 (`heldat`, R38) |
| A65 | Add what you know | SERVED | screens-intake/capture.mjs |
| A66 | Add a question | SERVED | screens-inquiry/project.mjs, screens-daily/home.mjs |
| A67 | Add a project | SERVED | screens-daily/start-project.mjs, projects.mjs |
| A68 | Add an action, any kind | SERVED | screens-action/actionnew.mjs (`actionnew`, `actioncreate`), request.mjs |
| A69 | Action page | SERVED | screens-action/action.mjs, matter.mjs |
| A70 | Action acts | SERVED | screens-action/action.mjs |
| A71 | Non-response as finding | SERVED | screens-action/action.mjs:144-150 (`actioninquiry`); declared op-declarations/t50.mjs:8,48 |
| A72 | Members, admin-removal arithmetic | SERVED | screens-settings/members.mjs (adminarith, R56; `adminremovalsopen`) |
| A73 | Invite a member | SERVED | screens-settings/members.mjs |
| A74 | Admin registers key for another member | SERVED | screens-settings/members.mjs:15, :192-194 (`signeradd`); keys.mjs:375 |
| A75 | Public case list | SERVED | screens-entry/front.mjs, screens-publish/published.mjs |
| A76 | Public case page, per-finding pages | SERVED | screens-publish/published-pages.mjs (R37), published-parts.mjs |
| A77 | Reader floors | SERVED | screens-publish/published-pages.mjs, published.mjs:130-141 (`pubfloorset`) |
| A78 | Verify any hash | SERVED | screens-publish/published.mjs |
| A79 | Print layout | SERVED | screens-publish/published.mjs:146 (`pubprint`), interface-shell/browser.mjs:841 (`cs.print`) |
| A80 | Review copy, member door | SERVED | screens-publish/case-editor.mjs, review-copy.mjs |
| A81 | Export review copy to file | SERVED | screens-publish/review-copy-file.mjs, review-copy.mjs:71,143 (`reviewexport`) |
| A82 | Review copy, recipient door | SERVED | screens-publish/review-outside.mjs |
| A83 | AI session page: transcript, connections found | MISSING | screens-inquiry/assistant.mjs holds the dock (airunopen, airuns, airun, airunlog) only; no transcript or connections-found list. Waits on N1220 by K3807 / current.md:15, :392 (UNSURE: ruled deferred, not dropped) |
| A84 | Open object by type | SERVED | interface-shell/index.mjs REF_SCREENS |
| A85 | Old `#` deep links | DROPPED | K3807 / T51-126 (not redirected); new addresses /app/<screen>/<subject>, `/#invite=`, `/#join=` are served |
| B1 | Claim by founder | SERVED | screens-entry/setup.mjs |
| B2 | Sign-in, recovery | SERVED | screens-entry/front.mjs, forgot.mjs, reset.mjs; screens-settings/recovery.mjs |
| B3 | Enrol by invitation | SERVED | screens-entry/join.mjs |
| B4 | Healthy panel and settings sections | SERVED | screens-settings/places.mjs, connect.mjs, teamai.mjs, security.mjs, group.mjs |
| B5 | Members and keys form | SERVED | screens-settings/members.mjs, account.mjs (see A74) |
| B6 | Record browser | SERVED | screens-daily/finder-states.mjs (see A14) |
| B7 | Intake form and bundle history | SERVED | screens-intake/capture.mjs; screens-inquiry/document.mjs:387 (bundlehistory) |
| B8 | Inbox | SERVED | screens-intake/inbox.mjs |
| C1 | Ratification key (release key half) | SERVED | member key: interface-shell/browser.mjs signer, screens-settings/account.mjs:107,144 (`signerregisterown`); release-key half DROPPED (K3807, C2/C4 class: operator tooling) |
| C2 | Offline recovery key | DROPPED | K3807 (moved to release-sign.yml and BOB's command line) |
| C3 | Load a key, forget | SERVED | interface-shell/browser.mjs:1741 (`forget`), key file load; release-key half DROPPED (K3807) |
| C4 | Sign a release asset | DROPPED | K3807 (release-sign.yml) |
| C5 | Sign a ratification | SERVED | screens-publish/ceremony.mjs (signrequest) |
| C6 | Sign "working on" notice | SERVED | screens-inquiry/project.mjs:794 (`bio-working-on`, `screen.project.notice.*`, T51-119/DEC-332) |
| C7 | Sign a docket entry | SERVED | screens-publish/docket.mjs |

## Counts (100 rows)
- SERVED 94
- DROPPED 5 (A2, A3, A85, C2, C4; plus the release-key halves of C1 and C3, which I counted SERVED for their member halves)
- MISSING 1 (A83)

## MISSING
- A83 AI session page (transcript, connections the session found, selectable for review). Looked for: "transcript", "connections found" and a session page in screens-inquiry/assistant.mjs and all screens-*; found only the dock (run open/dispatch/poll/log). K3807 and current.md:15, :392 hold it for N1220 (the multi-AI assistant). UNSURE whether Bob's "no exceptions" (K3803) wants it listed as an open gap rather than a deferral.

## UNSURE
- A6: rail count is on Queue only and the "collapse toggle remembered" is replaced by a draggable rail width (browser.mjs:218, R26); I did not find a collapse button. Counted SERVED because the job (counts + rail memory) is done; a strict reading calls the collapse toggle changed.
- A7: scroll kept on redraw (browser.mjs:1251) but scroll restore on browser Back not confirmed.
- A28: SERVED by a different mechanism (server digest checked through `cs.download` verify, not per-part in-browser hashing); flagged by the census itself as a BOB call.
- A5: verdict line only on `group` (administrators), as before the census; not on every page.
- A71: `actioninquiry` is declared (op-declarations/t50.mjs) and drawn; whether its screen test is green not checked.
- Verdicts rest on header comments, plan entries and spot greps of the named lines, not on running screens.
