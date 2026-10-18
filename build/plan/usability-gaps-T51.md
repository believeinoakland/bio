# T51 usability gaps against K3815 (read on `origin/tranche/T51`, 2026-10-18)

Method: read whole `draft-T51-finish.md`, `lane-journeys/HANDOFF.md`, `PLAN.md`, `FINDINGS.md`, `browser/HANDOFF.md`, `browser/FINDINGS.md` (V1 to V4, B-1 to B-40, J-1 to J-11), `next.md`, K3783, K3795, K3664, K3598, K3560, K3545 to K3547, K3698. Then checked the T50 plan (`archive/T50.md`), the requirements and the code on the branch for each defect. "Built in T50" means merged and in a requirement, never walked live after T50 (the JOURNEYS walks were on release 0.85.0 rounds 6/7, 2026-10-16). Every "built in T50" item below is therefore checked only by the live walk (T51-131 and BOB's acts).

## SUMMARY: ADD to T51 (modules.json order)

| # | module (paths) | fix, one line | model |
|---|---|---|---|
| 1 | notice-producers (`bio-plane/src/notice-producers/`) | R12's security notice (index.mjs ~l.766 to 770) writes an ISO instant, "has been High since 2026-10-16T16:00:00Z", on Home and Queue to the administrator (B-17); write the instant as a plain date and time in the sentence (N889, narrow: dates only, not the key sweep) | haiku |
| 2 | screens-inquiry (`bio-plane/src/screens-inquiry/`) | Page numbers are drawn from the extent's zero-based `page` ("Page 0", "Pages 0 are pictures of text", page picker "0": `document.mjs` l.191, 205, 323; `question.mjs` l.142): draw page + 1 everywhere (B-11, B-30, B-31) | haiku |
| 3 | screens-inquiry | Draw the `dash-project` screen (registry id; journey 15; design in `mock-screens.js`, words `screen.dash-project.*`). Home's Investigation block and the shell's `dash-project` reference both open it, and no module draws it, so it shows "Nothing is here" (B-1 remainder) | sonnet |
| 4 | screens-investigate (`bio-plane/src/screens-investigate/`) | Same page + 1 in `person.mjs` l.58, 143, `explore.mjs` l.65 to 66 and the money "p. {page}" reading; also `m.page ?` tests that hide page 0 | haiku |
| 5 | screens-action (`bio-plane/src/screens-action/`) | Draw the `dash-action` screen (journey 22; Home's Action block links to `/app/dash-action`; R81 says "nothing links it", but `home.mjs` l.307 does) | sonnet |
| 6 | journey-check (`bio-plane/src/journey-check/`) (CHANGE to T51-131) | Remove `dash-action` and `dash-project` from `EXCEPTED` (`screens.mjs` l.11) so R1(b) and R6 walk and pair them; add a page-number assertion (first page reads "Page 1") | sonnet (inside T51-131) |

Everything else the JOURNEYS lane found is placed (T50 built it, or a T51 entry carries it). Bob's own exclusions stand and are not listed. Residual risks for the live walk are in part A.4.

---

## A. The JOURNEYS lane's defects

Legend: BUILT-T50 = merged in T50, named by its T50 job; T51-n = carried by a T51 entry; NOT PLACED = needs the ADD above. The lane's files are `HANDOFF.md` W1 to W4, `FINDINGS.md` J-1 to J-11, `browser/FINDINGS.md` B-1 to B-40 and the status tables.

### A.1 W3/W4 (HTTP round): J-1 to J-11

| id | defect | status |
|---|---|---|
| J-1 | unknown address draws raw JSON | BUILT-T50: T50-35 control-plane R104 (404 page; `/doorbell`, `/tour` aliases), T50-27 R79 |
| J-2 | "cuts against" refused from Find in | FIXED round 7 (K3562; B-40 confirms `cuts_against` recorded) |
| J-3 | a question cannot be concluded by hand | BUILT-T50: T50-12 basis-versions (own reading, N1109/N1173), T50-32 screens-inquiry (journey-check R16). The residue (a question resting on a standard or calculation leg is refused `BASIS_VERSION_REFUSED`) is T51-53 (N1215) |
| J-4 | Find does not search a document's words | FIXED (B-9 status table, J-4 FIXED) |
| J-5 | passages' lines joined | BUILT-T50: T50-58, T50-10 (retrieval R82) |
| J-6 | text file "unrecognised document / high risk" | FIXED (V2) |
| J-7 | publishing unreachable by hand | BUILT-T50: follows J-3; T50-73 case-checker gate words (`says` keys), T50-34 screens-publish (B-5, B-6 plain words, K3698 first-case states) |
| J-8 | person fact from Find in sends no `valid` | BUILT-T50: T50-31 (N1177). Person page's own form works (V4) |
| J-9 | standard from a text passage refused `STANDARD_NO_TEXT` | BUILT-T50: T50-10, T50-41 (found extent minted on the declaring act), T50-31, T50-33 (B-28/B-16) |
| J-10 | "no inquiry" for a missing action | BUILT-T50: T50-74/75 (`NO_SUCH_ACTION`); T51-90 follows in action-holds |
| J-11 | member asked for password before being told no | BUILT-T50: T50-79 admission |
| Q to BOB | member can read the inbox | closed: N1176, doorbell R3 reserves nothing (applied) |

### A.2 Browser pass: B-1 to B-26

| id | defect | status |
|---|---|---|
| B-1 | most screens have no door | BUILT-T50: T50-27 interface-shell R81 (request, matter, action, theme, published, archive, docket, calculation, plan, timeline, money, case-editor, review-copy, ceremony), T50-32 R63, DEC-299 (1). **NOT PLACED for `dash-project` and `dash-action`**: R81 adds a reference kind for `dash-project` and none for `dash-action`, and no screens module draws either (grep: only `interface-shell/index.mjs` l.91 and `screens-daily/home.mjs` l.302, 307 name them; `journey-check` excepts both). See ADD 3, 5, 6 |
| B-2 | review copy needs an unsettable time zone | BUILT-T50: T50-29 screens-settings R45 (settable zone); first-share zone T51-84 and T51-121 (N1229) |
| B-3 | Request records: no office | BUILT-T50: T50-80 screens-action, T50-29 "Add an office/court" |
| B-4 | no conclude form though the screen says so | BUILT-T50 (= J-3) |
| B-5, B-6 | ceremony and draft in developer prose | BUILT-T50 (= J-7) |
| B-7, B-39 | cite defaults to another project's question; empty choice says "Open a question first" | BUILT-T50: T50-32 (N1192 preselects own question) |
| B-8, B-34 | vouch/cite/note silent; Reasoned acts ask no reason | BUILT-T50: screens-inquiry R55 (held copy, vouch acknowledged), T50-27 R87 (Reasoned asks its reason) |
| B-9 | Find shows raw records | BUILT-T50: T50-31 R46, retrieval R80/R82 |
| B-10 | `{handle}` `{tie}` on Ties | BUILT-T50: screens-investigate `ties.mjs` fills both (R34), checked in code |
| B-11 | garbled sentences | partly BUILT-T50 (screens-settings R52 "set at setup", R51 founder handle, member count). **NOT PLACED: "Pages 0 ... pictures of text" and "Page 0"** (zero-based pages; ADD 2, 4). The other fragments ("started Findable: ... ., 16 October", "fails if any one of these fails:· note.txtRead it back") are keyed rows now (`project.visibility.*`, `question.rests.any`); confirm in the walk |
| B-12 | web capture titled "Undetermined, because" | BUILT-T50: T50-58 reading title, T50-30 R33; PDF/docx/pptx titles T51-6, T51-7 |
| B-13 | wizard opens beside "Nothing is here" | BUILT-T50: T50-51 screens-wizards R17 |
| B-14 | raw JSON at `/doorbell`, `/tour` | BUILT-T50 (= J-1) |
| B-15 | queue "Act on an item" opaque and silent | BUILT-T50: screens-daily R28/R49/R50 (titles and act labels) |
| B-16 | forms ask for a fingerprint | BUILT-T50: T50-33 screens-investigate R34 (choose, not type) |
| B-17 | raw ids and times | BUILT-T50 for held captures, breadcrumbs, inbox ids (N1183, screens-intake R32/R35). **NOT PLACED: the security notice's ISO instant** (ADD 1) |
| B-18 | member offered a form they cannot use | BUILT-T50: T50-33 (R34) |
| B-19 to B-23 | page title, tooltips, empty person graph, 390 px, tap targets, unnamed controls | BUILT-T50: interface-shell R84 (title `page.title`, 44 px targets, header-less cards at 390), screens-investigate R32 (no empty graph), screens-daily R51 (unnamed controls). Walk checks (T51-131) |
| B-24 | 503 under parallel reads | BUILT-T50: T50-36 plane (diagnosed on biosmoke8 or REPORT: confirm the outcome in the walk) |
| B-25, B-26 | Find in from a document; Find in acts | FIXED round 7 |

### A.3 V4 (real investigation): B-27 to B-40

| id | defect | status |
|---|---|---|
| B-27 | proceeding: court list empty | BUILT-T50: T50-54 jurisdictions R94, T50-59 entities `forum_kind`, T50-29 and T50-33 "Add a court", T50-23 `officesSeed`. Affordances' `proceeding_kinds` read: T51-99, T51-120 |
| B-28 | standard cannot be held | BUILT-T50 (= J-9); the form still asks for passage choice: T50-33 R34 |
| B-29 | Find in forms free text, unprefilled, wrong refusal word | BUILT-T50: T50-31 (N1192) |
| B-30 | one passage per text file, flat CSV/xlsx | BUILT-T50: T50-58 (split at line breaks), T50-10 (sheet/range/cells; a fact marks only its passage). "Page 0" part: NOT PLACED (ADD 2, 4) |
| B-31 | photograph not read | BUILT-T50: T50-55 ocr-worker R23, T50-58 R4 (accuracy measure N853c is only a measurement) |
| B-32, B-33 | followed person not found; timeline and person facts empty | BUILT-T50: N1193 in T50-10, T50-59, T50-60, T50-33 |
| B-35 | Security refuses a period ending today | BUILT-T50: T50-29 |
| B-36 | wizard draft saved not listed | BUILT-T50: T50-17, T50-51 R15. The "1. 1." double number (`guide.mjs` l.343 `recording.pair` "{i}. ..." inside a list) is unverified and cosmetic: confirm in the walk |
| B-37 | second file loses its name; large page capture ends with nothing | BUILT-T50: T50-30 R34, T50-35 `acquire` bound. R105's 25 s bound re-timed on biosmoke8: T51-123 and BOB's walk |
| B-38 | typed term ignored unless ticked | BUILT-T50: T50-31 |
| B-40 | knock with held bytes cannot move | BUILT-T50: T50-56 doorbell R13, screens-intake R32 |

Earlier D/F items still "STILL" at V4 (D8, D14 to D16, D21, F3, F4, F5, F6, F8) all map to the rows above and are BUILT-T50.

### A.4 Checks I could not complete from the repo (live-walk risks, not adds)

- Wizard recording numbering (B-36, above).
- Event and relation kind words (`stated_cause`, `precedes`, dated kinds) on Timeline and Explore: N1108's events vocabularies wait; journey-check R6's slug scan will fail the walk if one is drawn raw. If it does, add a vocabulary-keys job in events (haiku).
- Journey-check R17's "group" scan against the installer page's U347 sentence ("Neighborhood and issue groups", `newgroup/public/newgroup/index.html` l.54; T51-128): R17 allows only `GROUP_SENSE` rows keyed by word key; confirm the page sentence is allowed or R17 stays red.

---

## B. Left-out table (draft-T51-finish.md) and every open N entry the plan does not carry

Exclusions already Bob's: assistant (K3717), API keys (K3347), key sweeps deferred (K3804), stewards' address. Those are marked EXCL and not argued.

### B.1 The Left-out table

| entry | verdict | why / module |
|---|---|---|
| Bare key sweeps, 45 entries, and the sweep clause carried with other items (N1068, N1073's hand-lists, N1075, N1116, N1206, N1213, N1216, N1217, N1222, N1223, N1228) | EXCL (K3804). DOES NOT otherwise | The sentences are English a person reads now; only the by-key machinery is deferred. N1222 (case-checker's ~60 inline sentences) is the standalone reviewer's checker, not the member's path |
| N1061, N1070, N1071 | DOES NOT | test hygiene and a relay refusal; no screen or journey |
| N1200 | DOES NOT | serves only a run fenced to its project (assistant) |
| N1220 and A83; N1198, N1199, N1219; N842, N829; N1214 | EXCL | assistant |
| N1211 | DOES NOT | route/delegate tidy-up |
| N889 (notice-producers ISO dates) and N1108's events vocabularies | **N889 BEARS** (ADD 1: a raw instant in a Home/Queue notice, B-17, K3052). N1108 DOES NOT unless the walk shows a raw kind (A.4) | notice-producers; events |
| N1074, N898, N1073's four registries | DOES NOT | BOB's process-repository work |
| N1088 (Home's remaining DEC-218 readings), N1046 (template-by-handle op), N1110 (steward directory), N933's prompt screen (a prompt, never a gate), DEC-265's `.dated` photo date | DOES NOT | Home is usable without the extra readings; a records request is written in the member's own words when no template is offered (screens-action R3); the others are enhancements with no journey step |
| N858 (Actions D8 to D10) and N880 (D13) | DOES NOT bear on completion, **but the stated reason is stale** | K3469 ended the ACTIONS-DESIGN lane and K3183 says N880 waits only on BOB's requirements; "a dependency not yet built" will not survive "no excuses". Restate as "not needed for the unassisted journeys (own words path; hold and reply-quoting rules are enhancements)" or place them |
| N1028, N1105, N824, N1094's translation part | N1028 **BEARS in its dashboard half** (S20 was answered at K3146: one Home, "A"; the dashboards `dash-project`, `dash-action` remain registry screens with drawings and nothing draws them: ADD 3, 5); its three kind tokens DO NOT. N1105 EXCL. N824 DOES NOT (email capture is Bob's D42, later). Translation EXCL (K3190) | screens-inquiry, screens-action |
| N923, stewards R7, N1159 | EXCL (stewards' address) | |
| N1151 (Logpush scope) | DOES NOT | the install completes; R46 states the check "undetermined" with the one manual step. Bob's dashboard act (register the Logpush read scope on the OAuth client) would remove the permanent "undetermined" line from every install page; offer it, not required |
| N751, N853c | DOES NOT | measurements (header-field accuracy; OCR accuracy on members' photos). Fold a real photograph capture into BOB's walk script so the second is measured live |
| Installer's remaining ~70 inline sentences | DOES NOT | readable English; keys only |
| A2, A3, C2, C4, A85 | DOES NOT | developer/operator tooling, K3807 |
| setup-words, agent-model, action-plans, op-grades | DOES NOT | no reader text |

### B.2 Open `next.md` entries the plan neither carries nor lists in the table

All other open entries are carried (N794, N865, N1057, N1002: T51-126; N1184: R84 built in T50 + HANDOFF; N1202: T51-6/7; N1205, N1218: T51-45/65; N1207: T51-30; N1208: T51-94; N1209, N1230: T51-12; N1210, N1242: T51-5/9/64; N1212: T51-29/42; N1215: T51-53; N1221: T51-83; N1224: T51-82; N1225: T51-86/94/101; N1226: T51-38; N1227: T51-90; N1229: T51-84; N1231: T51-102; N1232: T51-113; N1233, N1234, N1237, N1238, N1239, N1240, N1235, N1236, N1241, N1243, N1244: their T51 entries). The only open entry with no placement and no table row that bears: none new beyond N889/N1028 above.

---

## C. Journey 29 local walk (K3783 (3), K3795)

Pair numbering is `design.mjs` `JOURNEY_29_ORDER` (1-based): 9 = question new + airunopen, 10 = question running, 11 = question ended + airunopen, 16 = question proposal + versionaccept. All four are **assistant pairs**, marked `only: ai` in the design; the unassisted step 12 (question new, `search`), 17 (`conclude` by own reading) and 18 (`concluded`) pass. Placed: T51-131 re-scopes pairs 9, 10, 11, 16, R9, R10, R11, R11 control, R15, R16/R18 and R1 (a)'s assistant steps to "not walked".

The 37 failing steps of K3795 are all: (1) "group" on installer/site pages from `setup-fleet.mjs` (T51-106; now also the K3811 mechanical pass); (2) "group" on `/app/security` from file-scanner's catalogue (T51-9); (3) the assistant's subscription sign-in, steps 4 (assistant, K3718 (2)); (4) the four pairs above. No other failing step, so nothing unplaced from the local walk. K3783 (4) (`request` with no subject) was resolved at K3784 (the screen asks only with a subject); the screen's no-subject state is Request records' "choose the office" path, covered by B-3/T50-80.

Note for T51-131: the local arm walks `EXCEPTED` screens as exempt (`site`, `dash-home`, `dash-action`, `dash-project`), which is why the dashboards' missing screens never failed any walk (ADD 6).
