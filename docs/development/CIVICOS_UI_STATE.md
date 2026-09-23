# CivicOS Layer 3 UI: state and next-session kickoff

> **BACKFILL, 2026-09-14 (UI-59, thread UI). THE FIFTY-SIX ENTRIES BELOW ARE WRITTEN
> RETROSPECTIVELY, AND SAYING SO IS THE POINT.** This ledger had not been prepended to
> since `v33` on 2026-07-31 — 45 days — while fifty-seven UI items landed against
> `QUEUE.md`'s rows and seven of them appended their session log to `kickoffs/UI.md`
> instead, which is a kickoff and is rewritten each session rather than accumulated
> (`kickoffs/README.md`). So **the file the record names as the authority on how each
> rung actually went answered with July**, and the log that did exist sat in the one
> file whose shape guarantees it would eventually be overwritten. UI-58's front-matter
> retrofit found it; this is the item that closes it.
>
> **What these entries are and are not.** Each is dated to its LANDING COMMIT, not to
> today, and names that commit. Each says which member surface moved. They are written
> from the tree and the history — `git log` over `civicos-ui/**`, `QUEUE.md`'s UI
> section and its CLOSED ITEMS register, and the seven kickoff blocks whose substance
> is carried here rather than deleted — and **not** from a session's own memory of the
> day, which no longer exists. So they are shorter and flatter than `v1`–`v33`, which
> were written by the session that did the work. **A retrospective entry cannot carry
> what nobody wrote down**, and where the landing's own record is thin the entry is
> thin; it does not invent the reasoning.
>
> **Numbering.** `v34`–`v89`, in the order `main` landed them, newest first. These are
> ledger entry numbers, not UI build ids: no build ever announced itself as `v34`, and
> `v33` and below are the live sequence this file kept at the time. The date and the
> thread name on each first line are what disambiguate, per `kickoffs/README.md`.
>
> **The 2026-08-04 CONDUCT amendment below was NOT moved.** It reads *"the v33 entry
> below"* and that is still literally true with this backfill above it. This file is
> prepend-never-edit, and relocating an existing entry is an edit.
>
> **Four entries record a landing that changed NO member surface** — `v85` (UI-53),
> `v78` (UI-52), `v67` (UI-36), `v63` (UI-31), all four instrument-only. They are here
> because the ledger is where a UI landing's log belongs and UI-53's kickoff block had
> to go somewhere, **not** because the completeness rule demanded them: a measurement
> item owes no surface entry, and the check that produced this backfill does not ask
> for one. **Four landed UI items are deliberately absent and named here so their
> absence is not read as an omission:** `UI-17` never landed (DEC-33 deferred it; its
> placeholder `UI-17a` is `v55`); `UI-43` never landed a surface at all (it was rowed
> in `IS-BUILD-PLAN.md`, partly ran, and its undrained version acts are `UI-60`);
> `UI-58` and `UI-59` are prose-only items that do not touch `civicos-ui/**`, and their
> record is their own `QUEUE.md` row.
>
> **WHAT THIS BACKFILL CANNOT SEE, stated because a complete-looking ledger otherwise
> reads as more than it is.** It is keyed on UI ITEM IDS. **143 commits touched
> `civicos-ui/` since `v33` and only 79 name a UI item in their subject** — the other
> 64 are other areas' items moving the member surface: `REC-*`, `PL-*`, `CASE-*`,
> `CPDF-*`, `SK-*`, `M0-*`, `VF-2`, `D-257`, and DIST's deploys. **Those landings are
> real surface changes and this ledger does not hold them.** The measurement is in
> UI-59's release; the consequence is that "every UI item has an entry" is a weaker
> claim than "every surface change has an entry", and only the first is true here.

v102, 2026-09-23 session, thread UI, D-82 (a WORKER of CONDUCT #16, cloud session). Landed on `land/worker/D-82` (base
`origin/main` @ `0e5f7054`), in the commit that carries this entry. (UI-73 runs beside this item and may also take `v102`;
CONDUCT renumbers on collision.) SURFACES: the record list, the finder's Questions scope, a project's contents, the
cited-by rows of a document page and of a question page, a question's own page, and the record page opened on a question.

**What was wrong.** D-78 has the plane stamp `surfaced_by: agent` on every question whose creation did not come through a
member's session, and `human` on a member's. Nothing a member sees read that stamp on a QUESTION (UI-5's
`proposalDerivedBadgeHtml` reads it only for a derived finding), so a question a machine opened was listed and shown exactly
like a colleague's judgement: the failure Interaction Constructs §P's accountability rule names.

**What it does now.** One helper, `surfacedByAgentHtml`, draws one marker, *"Raised by a machine · nobody has yet judged it
worth asking"*, beside a question whose record says `agent`, and nothing beside any other. It discounts nothing and hides
nothing; a member's question renders as before. A question's own page and the record page read the value from the
question's own front matter. No list read carries the field, so each list surface asks the record ONE `op=search` question,
`type:inquiry fm:surfaced_by=agent` in ids mode (the `fm:` grammar line `op=searchfields` publishes); where that read fails
or comes back short of its own total, the rows it did not name stay unmarked and the list says once that an unmarked
question is not thereby a member's. No plane change; no code is shown (DEC-49 guard unchanged, 356 in reach).

**Driven against the real plane**, `civicos-ui/test/agent-surfaced-inquiry.test.mjs` (34 assertions): one question opened
by a deploy token inside its run (REC-171's fixture), one by a member's session, the same title, text, author and
references, each sending the OPPOSITE `surfaced_by` claim, so the plane's stamp is what is read back. On every surface both
rows are present, the machine's carries the marker and the member's carries none; a failed set read marks nobody and says
so. NEGATIVE CONTROL `agent-surfaced-inquiry.control.mjs`, 6/6 AS DECLARED: the helper neutered RED 27/7 (every AGENT arm);
the liar marking every question RED 26/8 (every MEMBER arm); the set ignoring the stamp RED 24/10; the undetermined note
dropped RED 33/1; over-strictness GREEN. NOT A SURFACE HERE, measured: `op=queue` names no question as a subject today and
the Review screen lists documents only.

v100, 2026-09-23 session, thread UI, UI-81 (a WORKER of CONDUCT #15). Landed on `land/worker/UI-81` (base `origin/main` @
`4355bfda`), in the commit that carries this entry. SURFACE: the published case page (`pubOpen`), opened by a finding id
that several cases pin.

**What was wrong.** Since D-309 (IC-74) `op=publishedcase` handed a finding id alone that several cases pin refuses and
names every case, because each case is its own artifact and serving one would choose for the reader; Publication §3 rule
12 makes that shape normal. `pubOpen` printed the refusal under *"Not answered"*, with the plane's internal detail, as if the
question had failed, and offered nothing to open. And no `*_CHECKS` row named the code, so the DEC-49 guard could not see the
one refusal a stranger meets on that page (UI-80's worker found naming it in `app.html` broke the guard for that reason).

**What it does now.** `pubOpen` keys on the refusal's `cases[]` (UI-80's keying, no code literal on the surface) and draws
one choice per named case, in the plane's order, each opening that case's own published page at the newest edition the
refusal's `memberships` say pins the finding; it never opens one itself. The words above the choices are the refusal's
canned translation, read through `refusalWords` (the plane's detail on a plane older than this). The plane half: a row
`FINDING_IN_SEVERAL_CASES` (C-44.2) in `CASE_DERIVATION_CHECKS`, D-309's own family, and `#resolveOneCase` builds the
refusal through the file's `refusal` helper inside a DEC-49 region (IC-185 proposed, additive). The guard's floors moved from
its own print (rows, reach, governedSites, regions, regionLines, codesChecked, refusalsJudged up by the item; untranslated
FELL 297 -> 296, the reason at the site).

**Driven against the real plane**, `civicos-ui/test/several-cases-choice.test.mjs` (15 assertions): UI-80's fixture (two
projects, two cases over one finding, real SSHSIG); the plane's refusal and its row; the page opened by the finding id; each
choice CLICKED and read back from the plane's own answer for that case; a plane older than this over a wire-shaped mock.
NEGATIVE CONTROL `several-cases-choice.control.mjs`, 13/13 AS DECLARED, the earlier runs' wrong declarations corrected by
name in the suite's header (and `caseflip.test.mjs` now names C-44.2 through the op, its arm F3): the liar (open the first case silently) RED 5/10 at NEVER PICKS and CHOICES; origin/main's three files
RED 4/11; the row dropped RED in the guard naming the orphaned region (never the code — the code leaves the reach with its
row); its translation dropped RED naming the code; the store's helper alone removed GREEN (D-262's `dec49Attach` carries the
row to the wire).

v101, 2026-09-23 session, thread UI, UI-82 (a WORKER of CONDUCT #15). Landed on `land/worker/UI-82` (base `origin/main` @
`91913d6b`, which carries REC-170), in the commit that carries this entry. (`v100` is held by UI-81's claim, running
beside this item; if CONDUCT integrates this first, the numbers stand as written and are only a ledger order.) SURFACE: the
published index (`pubList`), each case row's member block.

**What was wrong.** Since REC-170 (IC-183), where the ratified case documents pinning one sha state different frozen pairs,
`op=publishedmanifest`'s `published[]` row serves `strength: null`, a reason in `strengthUndetermined`, and every case
edition's own pair in `strengthByCase`. The index read the scalar alone, so a finding two cases froze two different pairs
for was drawn, under BOTH cases, with *"The published record carries no frozen strength pair for this ratified member:
nothing was established on either axis"*: false under each case. (Before REC-170 the same row showed the first case's
pair under both, which IC-74 forbids; UI-80's v99 entry named the index as not done.)

**What it does now.** For each case row it draws, the index reads the `strengthByCase` entry whose `case_id` and
`edition` are that row's (`pubCasePairOf`, one new helper above `pubList`) and draws THAT case's pair, with a sentence
naming the case and edition, saying the cases pinning these bytes froze different pairs, and naming the other cases whose
rows carry theirs. None is the finding's pair and none is combined. Where the list names no whole pair for this case
edition, or the record marks the scalar undetermined and lists none, the block says UNDETERMINED with its reason (the list's
cases, or the record's own reason word), never the no-pair sentence and never another case's pair. The helper keys on the
list's PRESENCE and never compares the reason's code, so no plane code is spelled in app.html (DEC-49 guard unchanged,
353 in reach). A one-pair row, and a true no-pair row, render exactly as before.

**Driven against the real plane**, `civicos-ui/test/published-index-pair.test.mjs` (20 assertions): REC-170's own fixture
through the ops under miniflare (two projects, cases X and Y over Q, S, R; Q and S frozen B under X and C under Y; R the
same under both; real SSHSIG), every expected pair read back from `op=publishedmanifest` and checked against
`op=publishedcase`. The undetermined arms go over the real manifest edited in one field (the plane cannot be made to serve a
list that misses a case it pins). On `origin/main` @ `91913d6b`'s app.html: 12/8. NEGATIVE CONTROL
(`published-index-pair.control.mjs`), 4/4 AS DECLARED: the scalar read again RED 12/8, by name at the four PER CASE arms,
NONE READS 'NO FROZEN PAIR' and the three UNDETERMINED arms; THE LIAR (the first listed case's pair under every case) RED
16/4, at NEVER ONE CASE'S PAIR UNDER ANOTHER; the per-case sentence re-worded GREEN 20/0.

**Not done, and where it lives.** The published case page (`pubOpen`) is UI-81's. A legacy `/1` case document does not
join the plane's comparison (REC-170's stated limit), so a finding pinned by one `/1` and one `/2` case with different
pairs is served as one pair, and this index draws that pair under both. That is the plane's reader and not this surface's.
Nothing is live; no deploy is this item's.

v99, 2026-09-23 session, thread UI, UI-80 (a WORKER of CONDUCT #15). Landed on `land/worker/UI-80` (base `origin/main` @
`95c40ed9`), in the commit that carries this entry. (Written as `v98`; renumbered `v99` by CONDUCT #15 at
integration, 2026-09-23, because UI-79's entry, integrated first in the same train, holds `v98`.) SURFACE: the working inquiry page's Strength section, and the published case
page's supersession banner, its edition twin and its roster sentence.

**What was wrong.** Since D-442 (Publication §3 rule 12, IC-179) `op=publish` writes nothing on a member finding: the
frozen pair is stated once, in the case's signed document, one pair per case. `inquiryPair` read the finding's own
`published_strength`, found none, and the page told a member that a published question was *"not published to this page
yet"*, promising a pair that would never appear there. The published case page said every pair was *"signed with that
finding's own bytes"*. For a `/2` case the case document's signature covers it.

**What it does now.** The working page reads `op=publishedcase` (through `apiQ`, the credential-free seam) and, for a
finding several cases pin, asks once per case: one block per case, headed with that case and edition, never one picked
and never combined, each naming the signature from `frozen_from`. A case's pair is shown as the page's own only when the
sha the case pinned is the sha the page shows (the published record is pinned to the record namespace; a probe's scratch
record can hold the same id). A published read that does not answer is said as that, never as "not published". A legacy
member, whose every case froze the pair into its own bytes, renders exactly as before. The case page's three sentences
branch on `frozen_from` through one helper, `pubPairSigner`, and keep the legacy wording word for word where it is true.

**Driven against the real plane**, `civicos-ui/test/case-frozen-pair.test.mjs` (24 assertions): D-442's fixture through
the ops (two projects, two cases over one finding, real SSHSIG); the legacy half, a question in both kinds of case, the
silence and the identity arms over a wire-shaped mock (a legacy member cannot be minted through the ops any more). On
`origin/main`'s app.html: 9/15. NEGATIVE CONTROL, 4/4 AS DECLARED: reading `published_strength` again RED 15/9; a
hard-coded case-document signer RED 23/1 (the both-kinds arm alone); the single banner sentence RED 23/1; re-worded
signer GREEN 24/0.

**Suites corrected, never exempted:** `inquiry-page` (its mock answers `op=publishedcase` with the store's own
`NOT_PUBLISHED`), `preauth-vocabulary` (`apiQ`'s callers five, not four; the op set is unchanged).

**Not done, and where it lives.** The published INDEX (`pubList`) still reads `op=publishedmanifest`'s
`published[].strength`, which the ratify committer leaves null where the case documents pinning one sha disagree, with
no `strengthUndetermined` on that op. The index then says the member has *no frozen pair on the record at all*, which is
false. The fix needs the plane first (per-case pairs, or the undetermined flag, on `publishedmanifest`), so it is in
UI-80's report for routing and not in this landing.

v98, 2026-09-23 session, thread UI, UI-79 (a WORKER of CONDUCT #14, wave 7). Landed on
`worktree-agent-af35e02341617dc41` (base `origin/main` @ `f05c1efd`), in the commit that carries this entry. SURFACE: the
write path — every document the member UI authors (`mdFor`; the `meta` of `addGo`, `doProposalAdopt` and
`reviseWithCapture`) — plus two member-visible strings: the FY glossary entry and the Add form's issuer placeholder.

**What was wrong.** `mdFor` wrote `group: believe-in-oakland` into every document's bytes and the three promote calls sent
it as `meta.group`, on every instance `newgroup` installs. Since D-436 the plane stamps a store's recorded group over it,
but on a store recording none the literal was kept as the caller's statement — a sovereign group's first bundles naming
this project as their producer. The glossary explained FY as one city's; the placeholder suggested one city's name.

**What it does now.** The UI composes no producing group; the plane writes the instance's one recorded value (IC-172). On a
store recording none the creation is refused C-64.1 and the member reads the plane's translation (the adoption dialog
printed a bare code for every non-gate refusal; it now renders the plane's words, as the Add surface already did). The
glossary and the placeholder name no place.

**Driven against the real plane**, `civicos-ui/test/authored-group.test.mjs` (40 assertions): a plane recording a slug
PLANTED AT RANDOM per run — the Add surface (a note, a project) and the proposal adoption each author a bundle held with
that slug in its bytes and its projection, and every group the surface SENT is the planted one or none (the liar, a
different hard-coded slug, can only pass by sending none); a plane recording none refuses in its own words and writes
nothing; the source census reads no literal anywhere and Oakland in CODE only at four declared recognisers. NEGATIVE
CONTROL `authored-group.control.mjs`, 4/4 AS DECLARED: one `meta.group` restored RED 31/40 naming the SENT arm while the
HELD arm stays green; the liar RED 32/40 with the literal census green; over-strictness GREEN.

**Suites corrected, never exempted, each with a dated comment:** the ten miniflare suites that seeded the literal
(`ai-session-context`, `ai-session-wire`, `conclude-nofalsifier`, `conclude-reading`, `content-extent`, `intent-write`,
`passage-surface`, `question-npc`, `recipe-drive`, `refusal-translation-surface`) now boot a store recording a fixture slug
and seed none; the two projection mocks (`document-page`, `document-structure`) carry a fixture slug; `add-surface` judges
`mdFor`'s bytes AS THE PLANE HOLDS THEM (`withProducingGroup`, conformance's correction) and pins that they name no group;
`project-id-surface` binds a group and pins the held bytes as the sent ones plus the id AND the stamp; `group-surface`'s
literal pattern could not see the hyphenated slug (it read GREEN over four hits) and now does. Every changed suite's
control was RE-RUN (ten controls, all AS DECLARED, app.html restored identical); that re-run found
`content-extent.control.mjs`'s `vocabdrift` arm REFUSING TO ARM since FW-19 wrapped `CONTENT_EXTENT_KINDS` onto two
lines — its anchor is corrected and the arm now fails `check-semantics` by name.

**Left, and why.** Oakland stays in 4 code lines — recogniser heuristics measured on that city's documents (`/^City of
Oakland$/i` twice in page-furniture lists, `CODE_REF` and `REG_CODE_REF`'s municipal-code form) — and in 37 comment lines
recording where a measurement came from. None is the surface naming a group. `worker.template.mjs` proxies to the dev
plane's workers.dev address, whose account subdomain contains the name: an address, not a claim, and not this row's.

v97, 2026-09-22 session, thread UI, UI-77 (a WORKER of CONDUCT #14, wave 2). Landed on
`worktree-agent-a40f17095e235d716` (base `origin/main` @ `14ffdbcf`), in the commit that carries this entry. SURFACE: the
member fence (`#m-grp`, `#m-idstr`) and the public header (`#p-gname`, `#p-gid`, `#p-mono`) — every instance's, since
`newgroup` installs this file into every group's account.

**What was wrong.** `const GROUP` declared one group's display name, domain and monogram, and both surfaces painted it;
the domain stood a third time in `#m-idstr`'s markup. A sovereign group's public page claimed to be this project's.

**What it does now.** Both surfaces read `op=instancegroup` (public since REC-163, IC-174) — the fence through the
member's own credential via `recR`, the header holding nothing via `apiQ` — and show one of three states, the setup
page's own: the recorded SLUG; *"No group is recorded for this copy yet"*; or, when the record does not answer (a 502, an
older plane refusing a stranger, a transport failure, the preview shell), *"This copy could not read its group just
now"* — never "none" for a silence. The markup carries the could-not-read line. The monogram is the slug's first
character; `#p-gid` (the domain) is empty because Publication §7 point 3 shows a domain only while verified and none is.
The state is named `silent`, not `unread`: `member-respect.test.mjs` ARM 3b bans "unread" as a diligence phrase, and it
was right to fire on the first spelling.

**Driven against the real plane**, `civicos-ui/test/group-surface.test.mjs` (45 assertions): a plane recording a second
slug, signed out and signed in through the real `boot()`; a plane recording none; three silences; the preview. The
no-literal arms read the DOM's TEXT (textContent and innerHTML, hidden or not), so a CSS-hidden literal fails them.
NEGATIVE CONTROL `group-surface.control.mjs`, 5/5 AS DECLARED: the `GROUP` literal restored RED 10/45 naming both DOM-text
no-literal arms; the CSS-hidden liar RED 31/45 with the source census GREEN (it cannot see a name built at run time; the
DOM arm did); silence-as-none RED 41/45; over-strictness GREEN.

**Suites corrected, never exempted:** `auth-surface` (the published space reaches `instancegroup` as well as the
manifest, both credential-free), `publishedcase` (five credential-free ops, not four), `preauth-vocabulary` (`apiQ`'s
callers four, not three; its mock answers `instancegroup` through `say`; `#p-gid` leaves the walked surfaces — the report
moved 22 surfaces → 21 and 47,841 → 47,761 characters, every term row character-identical).

**Not done, and where it lives.** The display name and the verified domain (§7 points 2 and 3) are not built. `app.html`
still WRITES the slug `believe-in-oakland` into every document it composes (`mdFor` and three `meta.group` keys) — a
write path, the D-436 worker's open DELEGATION to UI in `CLAIMS.md`, not this row's display.

v96, 2026-09-21 session, thread UI, D-434 PART 1 (a WORKER of CONDUCT #10). Landed on
`worktree-agent-a51b695c70bb123af` (base `origin/main` @ `2bd24da7`). SURFACE: `app.html`'s SURFACES block, ONE
`RECIPES` step — `capture-a-document-and-ground-a-question-on-it`'s last step, `inquiry/inquiryground` →
`bundle/cite`, with a `why` that says what the member does there. **No screen renders a recipe today** (the wizard of
`ASSISTANT-PILOT.md` §3 is unbuilt, `11.pilot` ABSENT), so no member saw this; the recipe is the record's own published
account of how its acts string together, and it taught the wrong act.

**What was wrong, driven rather than read.** `op=inquiryground` groups the legs a question ALREADY rests on. On a
question resting on nothing the plane does not even publish it, and sent anyway it refuses `NO_BASIS` in its own words
(*"Cite what it rests on first (op=cite)"*); on a question with a leg every step "completed" and the captured document
sat under nothing. Its `why` also used the grouping's own name, which `INVESTIGATIVE-SESSION.md` §0 bars from every
surface. `op=cite` from the document's page puts the document under the question on both.

**The instrument, `civicos-ui/test/recipe-drive.test.mjs` (25 assertions).** It reads the recipe out of the runtime
as data and PERFORMS each step against the real plane in miniflare, as a signed-in member, through `app.html`'s own
seams: the Add surface's own `addGo` for the capture, then the document page's read and its cite act. It judges each
step on the plane's answer and the recipe on its GOAL, read back through `op=image`, over two existing questions (one
resting on nothing, one on a leg). Its control, `recipe-drive.control.mjs`, came back 6/6 AS DECLARED: the old step and
THE LIAR (the grouping act with words rewritten to match it, which pass the vocabulary check) both fail naming
`NO_BASIS`, and the split cite-then-group passes. **The class sweep found no other recipe with this defect**: 10 steps
across 3 recipes, and every other step is a read whose op performs the read its `why` claims (`meaningrows` checked at
the code: its `passage` arm is the content-level read). PART 2 (an arm over every step) is not placed and was not built.

v95, 2026-09-19 session, thread UI, UI-72. Landed on `ui-72-refusal-translation` (base `origin/main` @ `5d6e4803`).
SURFACE: `app.html` — `actRefusalHtml` and `intentRefusalHtml`, which between them draw **every refusal a member reads
on an act surface** (27 call sites and 10). **A REFUSAL CARRYING THE PLANE'S CANNED `translation` NOW REACHES THE MEMBER
IN THAT SENTENCE, EVERYWHERE, INSTEAD OF IN THE SENTENCE WRITTEN FOR A CALLER OF THE OP.**

**What a member stops reading.** Both fields are the plane's own words, so DEC-8 was never broken — but they address
different readers, and the one that was rendered addresses a program. Three measured examples, each the sentence a member
actually met: *"…is not an inquiry. Only an inquiry has a basis, so only an inquiry has versions of one"* on the version
review; a conclusion refused for want of a falsifier answering with the op's own query parameter `…&no_falsifier=1`; and
`op=promote`'s *"send the fork with no newId"*. Each is TRUE OF THE OP AND FALSE OF THE MEMBER'S SITUATION — the record
claiming more precision than it can support at the one place a person meets it, which is the defect class `CLAUDE.md` §2
names as worse than a missing feature.

**The shape, and why it is one function.** `refusalWords(r)` decides the order once — a canned `translation` (DEC-49,
which amends DEC-8 to license an AUTHORED translation keyed on a code the plane SENT) first, `detail`/`error` behind it,
and an EMPTY or NON-STRING translation is not a sentence and falls through rather than blanking the member. Both
renderers read it. UI-66's per-site shim `refusalTranslated` is DELETED and its two call sites unwrapped: it applied the
rule at two of thirty-seven sites and its own comment recorded the rest as *"a class change, reported, not made here"*.
Applying a preference per site is the thirteen-surfaces drift DEC-49's option (b) was rejected for.

**`intentRefusalHtml` was found by the class sweep, not by the row.** Its body was BYTE-IDENTICAL to `actRefusalHtml`'s —
same markup, same code line, same `r.detail || r.error || ""` — and it serves ten member-facing intent panes. Fixing only
what was reported would have left the same defect one function over.

**Four suites went red and every one was CORRECTED at its site, never exempted.** `conclude-nofalsifier`,
`conclude-reading` and `question-npc` each build a DEC-8 sweep corpus from the wire's `detail` and `error` and NOT its
`translation`, so the moment the surface rendered a translation the sweep reported THE PLANE'S OWN SENTENCE as invented
by the surface — an instrument naming the wrong culprit. `version-review` §7 pinned the `detail` of a refusal whose
`translation` the member now reads, and its fixture was **wrong in two fields**: it named `C-25.19` where the row is
`C-25.18` and carried a one-line translation the plane has never sent. Both now come from the catalogue row itself.

**What is NOT fixed, and it is named rather than implied.** Eleven further member-facing sites read a refusal's `detail`
without going through `refusalWords` — `teach()` (the gate), `queueReason`, `planeSaid` (the published case page), the
finder's per-subject errors, the release, attest and capture receipts, the proposal pre-flight, the forward picker, the
leg pre-flight and `INTENT_VOCAB.words`. Each is the same class and each needs its own reading of whether its code is
translated; the fix is the same one line. It is in UI-72's report as an act for CONDUCT to route, not left here.

v94, 2026-09-19 session, thread UI, UI-67. Landed on `ui-67-question-page-npc` (base `origin/main` @ `4dd314ff`).
SURFACE: `app.html` — the QUESTION's page (`openInquiry`), the act bar (`actBarHtml`), and the three sites that land a
conclusion or a withdrawal (`doConclude`, `stanceConclude`, `stanceWithdraw`). **THE QUESTION'S PAGE NOW SHOWS WHAT THE
QUESTION CONCLUDED WITH NO PROJECT, AND STOPS OFFERING A DIALOG THE PLANE REFUSES.**

**What a member now sees.** Opening a question the record concluded outside any project: a section carrying that
conclusion — the claim it adopted, word for word, marked adopted; or, where the record cannot establish which claim was
concluded, the UNDETERMINED primitive with the PLANE's own basis sentence and never the conclusion text filled in for it;
the member's own words under their own label; what would falsify it; and the plane's sentence saying no project drew it.
It is rendered by `noProjectConclusionHtml`, the SAME helper the stance surface uses — one helper, two surfaces, so the
two cannot drift into saying different things. And on that same page the `conclude` act the record publishes there
(REC-142's PROJECT arm) is no longer a button into a refusal: it is NAMED under the plane's own label with a control per
project the record's reverse index says draws on the question, opening that project's own view (`#stands/<PROJ>/<INQ>`),
which is where a project's conclusion is taken.

**Why it could be built now, and it is the whole of the item's substrate.** UI-65 wanted this section and `bound-sweep`
ARM G refused it: the only read carrying `no_project_conclusion` was `op=basisversions`, a CAPPED list read, and this page
renders no list whose bound it could state. BOB #16 designed the answer (§7.1) and REC-144 (IC-160) built it — the field
moved onto the UNCAPPED single-bundle `op=projection`, computed by the same `#noProjectConclusionOf`. So the page reads it
off the projection it ALREADY takes, adds no `recR` call at all, and **ARM G is untouched with no new CARRIED-OUT-WHOLE
entry and no exemption**: buckets unchanged at CARRIED-OUT-WHOLE 3, findings 0.

**The cache was the other half.** `PROJ_CACHE` never expires, so a page reading a RELATIONSHIP off a cached row would show
a member the record as it stood before their own act. `projForget` is the one invalidator, called at every site that lands
a conclusion or a withdrawal and at none that does not; a walk over `app.html` holds that set to exactly four
(`concludePreflight` writes nothing and must NOT forget).

**Proved** against the REAL plane by `civicos-ui/test/question-npc.test.mjs` (49 assertions): the member concludes through
the page's own dialog, the page asks the record again and renders the plane's own answer read back independently; the
refusal REC-142 exposed is DRIVEN at the plane and `op=affordances` is confirmed to publish the act there, so the routing
is real on both sides; and an INSTRUMENT arm in every cache section proves the cache exists, without which "it asked
again" measures nothing. Control: `question-npc.control.mjs`, 6 arms ALL AS DECLARED — and its first run found the
INSTRUMENT rather than the subject, an assertion inside a bare `if` being SKIPPED rather than failed under two arms
(tally 48 against a baseline of 49); the else branch is that fix.

**What it could NOT do, stated.** The row's *"a withdrawal clears it"* names something the record cannot do:
`op=withdrawconclusion` is a PROJECT's act and refuses `NOT_A_PROJECT` with no `project=`, and `op=reopen` refuses a
concluded question that is in no case. Both are MEASURED in the suite rather than quoted (§7.1's own DESIGN GAP (b)), and
the withdrawal arm asserts the RE-READ and the render, never a disappearance.

v93, 2026-09-19 session, thread UI, UI-66. Landed on `worktree-agent-a50d25200c5cb65b6` (built ON
REC-141's `worktree-agent-a12cdccbace704eb6` @ `817a8f85`; the two land TOGETHER).
SURFACE: `app.html` — the Add surface's project creation (`addGo`, `mdFor`) and the project workspace's fork
form (`ROSTER_ACTS.projectfork`, `doRosterAct`). **A MEMBER NO LONGER CHOOSES A PROJECT'S ID, AND IS NOT
ASKED FOR ONE.** REC-141 (IC-158, C-59) made the plane mint project ids and REFUSE a creation or a fork that
names one (Membership v2 §7, *"HOW the plane mints a project id"*); the surface allocated `PROJ-<year>-<seq>-
<slug>` in the browser through `op=allocid`, wrote it into the document and sent it, and the fork form asked
the member to type the fork's id — so on a plane carrying IC-158 both were refused.

**What a member now sees.** Adding a project: the same form, and the project opens under the id the record
GAVE it — nothing is allocated here, no id is sent and the document carries no `id:` line; the id opened is
the one the plane answered, which is the `id:` line of the bytes it registered. Forking: the form asks for the
fork's NAME and nothing else; the receipt shows the id the record gave the fork. A refusal of either, if one
ever comes, is the plane's own canned sentence (DEC-49 `translation`) — the Add surface used to print a
refusal carrying no findings as its bare CODE ("Refused: PROJECT_ID_SUPPLIED").

**Proved** against the REAL plane by `civicos-ui/test/project-id-surface.test.mjs` (29 assertions): what is
SENT carries no id (the row's liar, a hidden prefilled field, is caught at the wire, not at the render), and
the id shown equals the `id:` line read back through `op=image`, for the creation and for the fork. Control:
`project-id-surface.control.mjs`, 5/5 AS DECLARED (restoring the fork field, the client-side allocation, or an
id written only into the bytes each fails naming the plane's C-59 sentence; `bundleId: undefined` passes).
`project-workspace.test.mjs` §6's fork arm, which drove a typed `newId`, is CORRECTED, not exempted.

v92, 2026-09-18 session, thread UI, UI-65. Landed on `ui-65-conclude` (built ON the held
`conduct/rec-136-held` @ `783054ac`; the two land TOGETHER).
SURFACE: `app.html` — the conclude dialog and the stance surface (`#stands/<PROJ>/<INQ>`). **THE CONCLUDE SURFACE AFTER REC-136.** REC-136 (IC-153) made a
no-project conclusion NAME the accepted reading whose claim it adopts (`version=`, else
`NO_CLAIM`) and made a project's conclusion record APPEND-ONLY with a withdrawal act; the
surface sent no `version`, so on any plane carrying IC-153 every conclude a member committed
was refused. REC-124 (IC-150) had already left the project's act, its commentary and the
undetermined legacy claim with no surface. Both delegations are discharged here.

**What a member now sees.** (1) The conclude dialog offers the question's ADOPTABLE readings
— accepted, stating a claim, resting on something: the plane's own adoption check, read off
`op=basisversions` — each with its claim verbatim, and **picks none**, including when there is
one; the picked reading's claim is shown word for word before the commit, and `version=` is
sent only when the member picked. With nothing to pick, the commit is refused by the plane and
its `NO_CLAIM` sentence, which names the door, is what the member reads. (2) The stance
surface carries the project's act (`op=conclude&project=`), showing the claim of the reading
the project STANDS ON verbatim before the commit — picking another reading is `versioncurrent`,
one section up — with a commentary field labelled the member's own words and never evidence,
UI-64's falsifier door kept structurally; the WITHDRAWAL (`op=withdrawconclusion`) with the
member's reason, offered only while the plane's stance reads `concluded`; the stance; and the
WHOLE history, every entry dated and authored, in order. (3) A no-project conclusion renders on
the stance surface with its claim ADOPTED, or UNDETERMINED through the C-14 primitive with the
plane's sentence — never filled in with the conclusion text — and the plane's own words saying
it is never a project's. It was first also put on the question's page, and
`bound-sweep.test.mjs` ARM G refused that site: it read `op=basisversions` (a capped op) and
dropped the bound. Routing it through a bound-stating helper and not rendering the bound would
have passed the walk by doing what it forbids, so the site was REMOVED instead.

**Tests.** `conclude-reading.test.mjs` (NEW, real plane under miniflare, 65/0);
`conclude-act.test.mjs`'s mock CORRECTED to IC-153 (answers `basisversions`, refuses a
no-version commit `NO_CLAIM` where the store does) and its journey picks a reading (93/0);
`conclude-nofalsifier.test.mjs`'s REC-136 transport stand-in REMOVED, its journey now picks
from the rendered picker (79/0); `surface-registry.test.mjs` struck `withdrawconclusion` from
`ACTS_AWAITING_SURFACE` (ARM A4c fired by name) and moved A4d/A4e 17 -> 18 and A3 20 -> 22
from the printed figures. Control: `conclude-reading.control.mjs`, five arms — no version sent,
prefilled picker, history-is-only-the-stance, project claim not shown, legacy claim filled in —
each failing exactly where declared, each restored by sha256 and cmp.

**Not done, and said so.** A project cannot conclude from the surface on a question that is
already concluded with no project: `op=affordances` publishes `conclude` only where the
catalog's edge table offers it, and `concluded` has no edge to itself, while the store accepts
the project's act there (DELEGATION to RECORD, `CLAIMS.md`). And nothing links to the stance
surface: it is reachable by its address alone, as it was under UI-45. And the question's own
page does not show a no-project conclusion's claim (ARM G, above) until the plane publishes it
on a read that carries no list bound.

v91, 2026-09-17 session, thread UI, UI-64. Landed on `worktree-agent-a3e2efc5bdd9b529e`.
SURFACE: `app.html`, the conclude act's commit slot. **THE FALSIFIER OVERRIDE WAS
REACHABLE ON THE WIRE AND INVISIBLE TO THE MEMBER.** REC-117 landed the plane half the
same day — `op=conclude` accepts `no_falsifier=1`, the document carries who and when,
the published page says so — and verified AT THE ARTIFACT that `no_falsifier` appeared
NOWHERE in this file. So the record accepted an act this surface offered no way to
perform, which left Bob's ruling half-standing: overridable by the plane, invisible to
the member, and a member who cannot find the override is still pressured into INVENTING
a falsifier. DEC-69 forbids compelling a member and a control that exists only on the
wire does not discharge it.

**THE DESIGN DECISION, AND IT IS THE SUBSTANCE OF THE ITEM RATHER THAN A PRELIMINARY.**
REC-117 declined to build this from the RECORD lane because the conclude flow DERIVES
the falsifier from leg selection (HARD 2), so how a member says *none* there is a UI
question. The answer taken here: **the override is NOT a field and NOT a checkbox — it
is an act offered BY THE PLANE'S OWN REFUSAL.** `concludeDoorHtml` renders it only while
`op=conclude` is answering `NO_FALSIFIER` to this member with this draft, and
`concludeNoFalsifier(true)` REFUSES TO SET THE FLAG at any other moment. That makes
*surfaced before overridden* a fact about the ACT rather than about the markup — the
distinction that matters, because a handler is a global on this page and "the button is
only rendered under the refusal" would otherwise be a claim about rendering that a
caller could walk straight past. **A checkbox beside the textarea cannot have that
property at all**, which is why it was rejected: it is reachable before the record has
said anything, so a member could set it having never been told what they were accepting
— the silent override the plane half was built to make impossible, reintroduced one
layer up.

**DEC-8 HOLDS BY CONSTRUCTION AND NOT BY CARE.** The sentence that teaches the override
is the refusal's own `detail`, which REC-117 wrote deliberately (*"If no falsifier can
honestly be stated, SAY SO rather than inventing one"*); this surface renders those bytes
and supplies only the CONTROL. What the member accepted stays on screen, in the record's
words, right up to the commit — a flow that showed the condition once and hid it would
satisfy *surfaced* on a transcript and fail it for the member standing at the button —
with the way back beside it. **A falsifier stated while the override stands is refused by
the PLANE (`FALSIFIER_AND_NONE_STATED`) and this surface clears NEITHER statement**,
because choosing between a member's two statements is exactly what REC-117 refused to let
the plane do, and a surface doing it instead would be the same act at a different layer.

**ONE LINE OF THE ORDINARY JOURNEY LEGITIMATELY MOVED AND IT IS NAMED RATHER THAN LET
PASS.** The empty-falsifier hint read *"Nothing yet. The record refuses a conclusion that
says nothing would overturn it."* — a sentence THIS SURFACE WROTE, true until REC-117 and
FALSE after it, stating the record's gate as absolute when the record's own refusal now
names a way through. **The only member who ever reads that line is the member with no
falsifier**: the exact member this item exists for, told the door was shut. It is now
*"Nothing yet."* and the rule is left entirely to the plane's sentence below it, which is
where DEC-8 says it belongs.

TESTS: `civicos-ui/test/conclude-nofalsifier.test.mjs`, 66 assertions against the REAL
plane under miniflare — real members enrolled through `op=memberadd`/`op=enroll`/
`op=login`, real questions promoted with real basis legs — driven THROUGH THE SURFACE and
**read back off the DOCUMENT rather than the envelope, because REC-117's arm B proved the
op's computed answer passes under a completely silent override.** Over-strictness is two
members, not one: one who states a falsifier by TYPING and one who states it by POINTING
at legs with an empty textarea, which is the spelling a door keyed on *the textarea is
blank* would get wrong. Control: `conclude-nofalsifier.control.mjs`.

**A GAP IN THIS LEDGER'S NUMBERING, STATED SO IT IS NOT READ AS A MISSING ITEM: UI-63
landed before this item (`3126e3bb`, merged `1829cb05`) and appended no entry here.** Its
record is its `QUEUE.md` row. This entry takes `v91` rather than leaving the number free,
because a reserved slot nobody fills is indistinguishable from one nobody noticed.

v90, 2026-09-17 session, thread UI, UI-62. Landed on `worktree-agent-a79a0995d1af935bb`.
SURFACE: `app.html`, the evidence finder and the cite composer. THE MEMBER CAN READ A
PASSAGE, AND THE SURFACE SAYS WHICH LEVEL WAS EMPTY. The finder asked two questions and
neither of them had ever read a word of a captured document: `op=search` compiles over
`bundles_fts`, which is projected frontmatter and the group's own notes. It now asks a
THIRD — `passage:` through `op=meaningrows&rows=passage`, REC-92's arm — so a bare word
reaches both grains at once and the three answers are reported apart. No overlap is
computed against the passages route, because an overlap between a set of DOCUMENTS and a
set of UNITS is not a set, and the surface says so where the other overlap is stated.
THE ABSENCE STATEMENT IS THE ITEM: four levels rendered with the plane's own `state` and
`why` verbatim, the answer's own `says` whole, and the FIVE-bucket content-axis tally
driven off `content_axis.vocabulary` rather than learned literals — rendered on a HIT as
well as on a miss, because the plane's hit sentence is the one that says how much of the
scope was never read at all. §4.4's open presentation question is ANSWERED with the
reasoning at the site: when `MEANING_AXIS_CAP` bites the denominator is named in the
HEADING, the word SAMPLE appears beside the figures, the uncounted captures are stated to
be in no bucket, and there are no proportions anywhere. CITING A PASSAGE CLOSES THE HALF
UI-61 LEFT OPEN — reached from a search there is no extent to pick, so the composer
carries the address, states it in the record's own `ref`, prefills nothing, and sends it
on the QUESTION arm only, because a case's edge has no slot for a part of a document and
`op=cite` refuses one by name. The wire fields are DERIVED (`extent_<key>`), so a
canonical form that grows a field is refused by name rather than dropped in silence.
TWO CLAIMS THIS SURFACE WAS ALREADY MAKING WERE CORRECTED, not extended: the `finder`
registry declared `content` among its levels and promised "documents and their extracted
content" while reaching no captured text at all, and the FIND recipe made the same
promise in one step — now two steps, because they are two levels. Measured on the branch:
UI harness 51 suites / 0 fail / exit 0 (own baseline 50/0); the new suite 94 assertions
driving the REAL plane through miniflare, mocking nothing; battery 213/213 · 13,344
identical to `78ef0efc`; `--strict` exit 0; plancheck 0 fail; corpuscheck 50/0. Controls
10 arms, all declared before arming, all run, restores by sha256 + `cmp` at 1,348,297
bytes: baseline 94/0; `levelhidden` 89/5 naming both scopes; `tallyfour` 93/1;
`reworded` 93/1; `prefilled` 93/1; `proportions` 93/1; `sampleunmarked` 92/2;
`extentdropped` 91/3 — the act still SUCCEEDS, which is what makes it dangerous;
`offbyone` 93/1; `reordered` 94/0, the over-strictness arm, taking nothing down.
`member-respect.test.mjs` CAUGHT TWO REAL DEFECTS in this item's first draft — a DEC-68
diligence word and an unclassified repeated control — and is extended rather than
exempted; `passageRowHtml` is registered as a SET OF DECISIONS whose bulk path is CARRIED
with its reason, because `op=cite` refuses `EXTENT_ON_MANY` by name. THE FINDING WORTH
MORE THAN THE SURFACE is a plane defect this item did NOT work around: `op=meaningrows`
means two different things by *in scope* in one envelope — `mode:"axis"` strips the row
arm from its scope and `mode:"levels"` does not, though its own comment says it does — so
`scope.documents` collapses to 0 on any passage miss and the two honest branches of
`says` become unreachable, publishing "no document was in scope" over a scope holding two.
`MEASUREMENTS.md` M-43, DELEGATED to RECORD, and the suite PRINTS the collapse on every
run rather than failing over it.

NOTE ON THE NUMBER: this entry takes `v90` and UI-61 (`7cf7443`, the leg extent display and the page jump, merged by CONDUCT #11) HAS NO LEDGER ENTRY — UI-59's backfill closed at UI-57/`v89` and UI-61 landed after it. The gap is named here rather than absorbed by this number, because a ledger whose sequence is continuous reads as complete. Writing UI-61's entry is UI-61's owed act and not this one's: its reasoning is in its `QUEUE.md` `landed:` line, and inventing a summary of somebody else's landing is exactly what this ledger's own backfill banner refuses to do.

v89, 2026-09-10 session, thread UI, UI-57. Landed `ab9449e` (arm retirement `8e61e8f`,
merged `77d8361`). SURFACE: `app.html`, `publicationEntryHtml`. THE GATE MOVED FROM THE
ACT'S PRESENCE TO THE OBJECT'S STATE. The whole "Publishing this case" section had been
gated on `publish` appearing in `op=affordances`' answer; D-310 correctly narrowed that
answer for non-owners, and CASE-6's `data-pubwho` paragraph — the surface statement of
the owner rule, written under DEC-33's deferral precisely so the fence is not learned by
silence — then disappeared for exactly the readers it was written for. The section now
renders for the case's STATE, and the act's presence gates one clause only: the record's
own published LABEL, which a surface may not invent. A non-owner sees the owner rule in
the record's words (0 B to 3,216 B, measured); an owner's rendering is BYTE-IDENTICAL to
its pre-item self (3,258 B, sha-compared in isolated VM contexts) — an over-strictness
measurement no arm can make. IC-75 resolved at integration, I3 13.0.0 to 14.0.0.

v88, 2026-09-10 session, thread UI, UI-56. Landed `9bd74b7` (merged `b834f26`). SURFACE:
`app.html`, the published index. THE JOIN IS ON THE PIN, NEVER EDITION TO EDITION. A
published index row was being joined to its member's roster row edition-to-edition, so a
diverged member read against the wrong ratified row. Five sites, not the three the item
named. The fixture-shape gap this opened is `M0-23`, an item rather than a note.

v87, 2026-08-10 session, thread UI, UI-55. Landed `050b164` (merged `9be29f3`). SURFACE:
`app.html`, the REC-21/C-3 mute block only — `queueMuteHtml`, `queueMuteCase`, `queueWire`
and two CSS rules. DEC-69 ENACTED: THE STANDING SWEEP FOR NAGGING, SECOND-GUESSING AND
FORCED MODES, with `member-respect.test.mjs` (428 assertions) and its six-arm control.
Bob's ruling, 2026-08-10, amended the same day, and the amendment is the harder half: the
operative word is FORCED and it cuts both ways — a surface that offers ONLY bulk is the
same flaw as one that offers only forty clicks.

THE CENSUS IS A FIGURE WITH ITS REACH, NEVER A CLAIM OF COMPLETENESS: 40 member-facing act
sites reaching 31 distinct mutating ops of the plane's 85, over 641 function bodies and
647,585 characters, with four blind spots PRINTED every run — including that 54 of the
plane's mutating ops are reached by no act site this walk sees. Shapes 1 to 3 absent by
assertion. Shape 4 found the amendment's bulk-only half and it is the real catch: the
queue's mute muted EVERY condition kind on a case, and **it read as respectful because it
NAMED the set — but naming a set is not offering a choice within it.** `op=queuemute`
already accepted an arbitrary subset, so the fix was one parameter and no plane delegation.
**If you find a surface that only offers the whole set, measure the op before assuming the
plane is the blocker.**

SIX THINGS A LATER UI SESSION NEEDS BEFORE TOUCHING ANY OF IT, carried here from
`kickoffs/UI.md` where they were appended on the day. (1) THE SCOPE BOUNDARY IS AN ARM
THAT RUNS EVERY TIME. DEC-69 protects three things by number — DEC-39's fence, DEC-51's
grade note, DEC-49's refusal reason — and ARM P asserts all three PRESENT on every run, so
a future tidy that strips one fails the very suite that would otherwise report the tidy as
a success. The cut that makes it decidable is the ruling's own: the record's voice is
PLANE-SOURCED and a nag is AUTHORED HERE, and ARM P proves none of the three is a literal
in `app.html` rather than assuming it. (2) The bulk-only half, above. (3) TWO SETS OF
DECISIONS ARE CARRIED, NOT CLEAN, AND THE CARRY IS SELF-EXPIRING: `op=resolve` and
`op=proposedispose`/`taskresolve`/`taskforward` give the member N identical buttons and no
bulk path, and a client-side loop is not the fix — N motions over N items is the
forty-dialogs shape wearing a bulk control's clothes. ARM 4d re-measures each carried op's
signature against `store.mjs` every run, so the day one accepts a set the arm goes RED and
the mode gets built. Do not delete the row; it is the alarm. Carried as D-291. (4) ARM 4
PARTITIONS BY REGISTER BECAUSE NO STATIC WALK CAN DO IT — whether a repeated control is a
SET OF DECISIONS or a CHOOSER FOR ONE DECISION is not readable from source, both compile to
the same shape; every site must be classified, a site in neither register fails by name,
and a register row naming a host that no longer renders a control fails too. The second
half caught eight speculative rows on the item's own first build. (5) THE INSTRUMENT WAS
WRONG TWICE, CONFIDENTLY, AND BOTH ARE NOW ARMS: a JS deriver over `app.html` starts inside
`<style>`, where an apostrophe in a CSS comment opens a string that never closes and every
later block comment lands in the member-facing prose corpus; and a single-slot string mode
let a nested backtick close its parent, reporting a longest function body of 92,964
characters against a real 13,117. **If you write a walk over this file, isolate the
`<script>` first and use a mode stack.** (6) THIS SUITE IS A CONSUMER OF UI-53's BAN
FAMILY, and it became one because UI-53's census called it a RIVAL on its first run.

NO PROSE WAS DELETED ANYWHERE. The one clause the sweep found at the boundary —
`elicPaint`'s persuasion tail about reading being easier than writing — is CARRIED for a
ruling rather than removed by a worker, because deleting the record's own voice in this
ruling's name is the failure the ruling itself warns about.

v86, 2026-08-10 session, thread UI, UI-54. Landed `a63c1b5` (merged `485a039`). SURFACE:
`app.html`, four sites in the unmarked Add region — `renderAdd`, `addCaptureNote`,
`addCapture`, `addGo`, and a new note holder in the Add form. DEC-51 ENACTED: `op=acquire`'s
GRADE NOTE IS RENDERED, WHOLE, AT THE MOMENT OF CAPTURE. `addCapture` had been receiving the
note on every `op=acquire` answer and throwing it away, so a member's only account of what a
capture is worth arrived on the document page afterwards — **a surface that RECEIVES the
record's own account and DISCARDS it withholds at exactly the moment the member forms the
belief.**

FIVE THINGS A LATER UI SESSION NEEDS, carried here from `kickoffs/UI.md`. (1) THE
CO-ATTESTATION CLAUSE SHIPS, AND REMOVING IT IS THE DEFECT RATHER THAN THE CAUTION. The
note's last clause describes an act this surface does not offer, so stripping it is the tidy
any careful reader reaches for; DEC-51 refuses that split by name, because DEC-39's
three-part shape was deliberate, UI-28 measured the parts reassemble character for character,
and that clause is exactly the sentence that stops a member reaching for co-attestation to
solve a problem it does not address. **A rendering that is merely MOST of the note is the
split Bob refused.** (2) UI-32 IS NOT REOPENED, AND THE TWO RULES LIVE ONE LINE APART: this
surface still states no grade letter IT derived — `ADD_CAPTURE_TEACH` and `addValidate` are
byte-unchanged — and it now withholds nothing the PLANE published about a capture that has
actually happened. The UI-32 assertion is ordered BEFORE the string-for-string equality
deliberately, so a fail-fast run reports the right reason; do not reorder them. (3) NOTHING
IS AUTHORED AND THERE IS NO FALLBACK: a plane that publishes no note, or a blank one, leaves
the holder EMPTY — UI-39's rule and UI-40's, both asserted rather than assumed. (4) DETECTOR
(C) IS NEW AND CLOSES A STRUCTURAL HOLE: detectors (A) and (B) both judge the remainder after
`minusPublications` — they must, or they fire on the record's own correct page (UI-28) — so
an EXACT copy of a publication is invisible to both. (C) reads each file's WORD STREAM and
sees a copy split across a concatenation. **If you need the record's sentence in a suite,
IMPORT it.** (5) THE CONTROL DRIVER HOLDS NO COPY OF THE RECORD'S WORDS, ON PURPOSE — it
imports `ACQUIRE_GRADE_NOTE` and serialises it, because a driver that typed the note out to
plant it would BE the copy, in the tree its own detector guards.

The zero-cost-agreement arm is the one worth re-reading: a hand-typed copy of the note left
every BEHAVIOURAL assertion green, and only detector (C) could tell.

v85, 2026-08-09 session, thread UI, UI-53. Landed `ac1c7d4` (merged `a7b027f`). **NO MEMBER
SURFACE CHANGED** — `civicos-ui/app.html` is not edited by this item and was not claimed; the
module only READS its two marked member-facing blocks. Seven files under `civicos-ui/test/`.
THE FOUR HAND-WRITTEN `BANNED` LISTS BECAME CONSUMERS OF ONE DERIVED FAMILY (D-269's
delegation to UI), and the standing rule it leaves behind: **THERE IS ONE DEFINITION OF
DEC-32 CLAUSE 1'S BAN IN THIS DIRECTORY, and it is
`civicos-ui/test/analyst-vocabulary.mjs`. If you are writing a sweep that asserts the
analyst's vocabulary reaches no member, import it. Do not write a list.**

WHY, carried here from `kickoffs/UI.md`. FOUR lists existed, not the three D-269 reported,
and no two agreed — the fourth was a COPY made to give the ban "ONE spelling in this
directory", and **copying a list to unify a rule makes another list**; it was missed because
the census was keyed on the phrase rather than on the subject. NOT ONE of the four carried
the phrase that was being rendered to members off the axis result and frozen into signed
`bundle.md` frontmatter; it is now enforced at all four sites, as is a second term no list
carried either. THE FAMILY IS DERIVED, NOT TYPED: the atoms are parsed from DEC-32 clause 1's
own sentence in `DECISIONS.md`, closed over by stem prefix so every spelling of a named
construct is caught unlisted, plus a ceilinged, printed RESIDUE each term of which is
asserted at run time to occur in DEC-32's entry — **a residue term that is not in the ruling
fails the suite, which is what keeps it from decaying back into a hand list.**

THE ONE THING THAT WILL BITE YOU, AND IT IS MEASURED: **the bare capitalised connective is
NOT banned, deliberately.** Three of the four lists banned it; the moment all four consumed
one family it fired on `notifications.test.mjs`'s own correct prose — ordinary English
capitalised for emphasis. Case-sensitivity is not enough. The connective is banned AS
VOCABULARY — compounded, paired, behind a determiner, naming the relationship. If you find
yourself widening it back to the bare token, run `analyst-vocabulary.control.mjs` first;
arms 5a/5b/5c exist to stop that.

WHAT THE FAMILY CANNOT SEE, stated because a clean sweep otherwise reads as more than it is:
a genuinely novel term for the construct, sharing no stem with a clause-1 atom and not in the
residue. There is no automatic tier for it and the reason is measured — D-269's open
*machine-side minus member-side* derivation is sound over 30 machine-composed sentences with
opaque values, but over a rendered UI surface it measures 208 words including `example`,
`correct`, `safe` and `bob`. **The open tier belongs to the plane suite's narrow corpus; this
family belongs to the broad one.** KEPT AND NAMED RATHER THAN FOLDED IN — three sites the
census surfaces that are NOT rivals: `capture-honesty.test.mjs`'s `JARGON` (Bob's
plain-language ruling, a different question), `publishedcase.test.mjs` (DEC-32's falsifier
clause, no ban list), and `version-review.control.mjs` (the negative-control DRIVER that
plants a leak to prove a consumer's sweep can fail — it must keep NAMING the ban rather than
importing it).

v84, 2026-08-09 session, thread UI, UI-44. Landed `5e57be5` (merged `134a9ed`). SURFACE:
`app.html`, a new region inside the existing AI-session block plus one expression in
`aiSessionPanelHtml`. THE CONNECTIONS SIDEBAR (DEC-52 final, 2026-08-07): connections the
machine identifies land MACHINE-ATTRIBUTED, and the sidebar is a VISIBILITY and BULK-REVIEW
surface, **not a required approval gate**.

IT SHIPPED FIXTURE-VERIFIED, AND THAT IS THE FIRST THING TO KNOW. No op publishes a machine
connection; the post-processing task scope that would produce one has no item and does not
exist. What is verified is HOW THIS SURFACE TREATS a machine-attributed connection; what is
NOT verified is that one exists to treat. The suite states it in its first paragraph, prints
it in its FOOT on every run, and — the part that matters — MEASURES it: SECTION 0 reads
`aiRunRead`'s own body out of `bio-plane/src/store.mjs` and fails the day the producer lands,
**so the caveat expires by itself instead of being inherited.**

THREE THINGS THIS AREA CARRIES FORWARD, from `kickoffs/UI.md`. **A D-82 DRESS IS NOT ONE
SENTENCE FOR EVERY DERIVED THING.** The proposal badge says *nobody has yet decided this is
worth pursuing… it changes nothing until a person acts on it* — TRUE of a proposal and FALSE
of a connection the machine was licensed to rule on, which is in the record and which the
record already stands on. Reusing it would have been cheap and would have made the surface
lie in the safe-sounding direction. Two claims, two sentences, one rule: say what the record
actually did. **ATTRIBUTION IS FOUND BY THE SHAPE OF A VALUE, NEVER BY A FIELD NAME OR A WORD
LIST** — the surface asks the question REC-46 made the plane ask once: did the CONTROL PLANE
mint this identity. A producer publishing the principal under a key nobody anticipated,
nested inside an array, is still attributed, and that is the over-strictness arm.
`MACHINE_STAMP_PREFIXES` is imported LIVE and compared, so a third spelling fails the build
here rather than un-attributing a machine. **THE ANTI-GATE ARM IS AN EQUALITY, AND IT IS THE
STRONGEST THING IN THE SUITE** — render with nothing selected and with everything selected,
strip the selection controls, and every word about what each connection is and who made it
must be BYTE-IDENTICAL. Under the superseded provisional that arm would have been the
opposite assertion, and it was corrected in place with its date and its reversal written out
rather than deleted.

ONE INSTRUMENT WAS CORRECTED IN PLACE AND IT WAS NOT THIS ITEM'S. `ai-session-wire.test.mjs`
ARM S5 asserts *the surface renders nothing the record did not publish* over every function
in the AI-session block — right about the RUN, and the WRONG RULE the moment the block hosts
D-82's dress, which by definition says something the record cannot say about itself. Left
standing it would have made delivering D-82 fail the build. The replacement partitions by
REGION MARKER rather than by a list of names, falls back to sweeping the WHOLE block when the
marker is missing (**a deleted marker fails loudly instead of widening the excuse silently**),
and requires the held-out region to be graded by this item's suite.

TWO THINGS DELIBERATELY NOT ADDED, both traps this area keeps meeting: no new ROUTER (the
sidebar is reached at the session address that already exists, so nothing arrived
unclassified in `preauth-vocabulary`) and no new PLANE READ (the sidebar renders the run
object `op=airun` already answered, so there is no explicit ask to state and `bound-sweep`'s
two walks see nothing new). Both were choices, not omissions.

v83, 2026-08-09 session, thread UI, UI-45. Landed `f6f9242` (merged `1081a6a`; post-merge
figures `4a27f24`). SURFACE: `app.html`, a new notifications block appended after the
version-review block, four named renderers inside the queue block, and one key in `SURFACES`.
NOTIFICATIONS RENDERED. UI-42's delegated `current`/project half is discharged here and
`versioncurrent` is struck from `ACTS_AWAITING_SURFACE` in the same commit.

FIVE THINGS TO READ BEFORE TOUCHING A NOTIFICATION RENDERER, carried from `kickoffs/UI.md`.
(1) EVERY WORD ABOUT WHAT HAPPENED IS THE PLANE'S. The queue renders a FINDING from the
producer's own summary and detail fields, and this item added three more of the plane's own
sentences. **The surface holds NO per-kind wording table and names no kind slug at all**,
asserted structurally over the block's source. The plane's per-kind sentences live in
`queuestate.mjs` and are published to no op; copying them here would be two answers to one
question in two repositories, which is DEC-8's drift class. (2) THE TWO SLUGS UI-45's ROW
NAMES DO NOT EXIST, AND THEIR ABSENCE IS ASSERTED — they are **PL-13's** to mint, and §0
requires both absent, **so the day PL-13 lands that arm goes red and the next session
surfaces them. Do not "fix" that failure by deleting the arm; it is the alarm.** (3) A
CONTROL THE RECORD CANNOT HONOUR IS WORSE THAN NO CONTROL, AND THIS IS NOW A PROPERTY:
`op=proposedispose` is keyed on a progression/stage pair, and until this item the queue drew
Adopt / Defer / Dismiss on every FINDING, so on PL-15's out-of-inquiry lead all three could
only ever be refused. `notifDispositionKeyed(it)` asks the ITEM whether it carries the
identity the act is keyed on. **If you add a control to a queue item, ask what identity the
act is keyed on and whether THIS item carries it — never what kind it is.** A list of kinds
goes stale the day somebody mints a fourth. (4) AN EMPTY LIST OWES THE READER WHICH LEVEL WAS
EMPTY: `notifAbsenceHtml` reads `op=queue`'s own class and count fields and says, per class,
which of three is true — nothing on this plane raises one yet (*we did not look*), the record
looked and raised none (*nothing happened*), or the record published no count at all (a third
fact, said as one rather than shown as zero). A feed that did not answer produces NO level
statement, because a line composed here would claim the record said something it did not.
(5) AN AGED PROPOSAL LEAVES THE OPEN LIST AND STAYS ON THE SCREEN — the surface used to show
the receipt inside a dialog that then closed, so the finding simply vanished; a field the
answer did not carry is now **said to be missing rather than filled in from what this page
sent**.

THE STANCE SURFACE IS A SECOND SURFACE RATHER THAN A SECOND READ. `op=basisversions`
publishes `current` only when a project is named, so the read names one and the surface hosts
`op=versioncurrent`. **A NULL `current` is NOT "this project has not chosen":** the plane's
`#currentVersionOf` collapses three situations into that one answer on purpose — no reading
named, no document to record one in, a project this credential may not see — and the page
says which three and why they answer identically. **Do not replace that with the flattering
one.** UI-42's state words and composition helpers are CALLED here; no third spelling exists
and the suite pins that.

v82, 2026-08-09 session, thread UI, UI-42. Landed `d31302d` (merged `d579ae8`). SURFACE:
`app.html`, a surface of its own — `SURFACES["basis-versions"]`, addressed at a versions
route, living between the version-review region markers. VERSION REVIEW: ROTATION IS THE
DIFF. It reads `op=basisversions` and `op=affordances`, hosts exactly ONE act
(`versionhide`), and is driven by `version-review.test.mjs` (85 assertions) with a nine-arm
control.

THREE THINGS TO KNOW BEFORE TOUCHING IT, carried from `kickoffs/UI.md`. (1) ROTATION IS THE
DIFF, AND THE MEMORY LIVES IN STATE. `VREV.focus` is the reading in front of the member and
`VREV.against` is the one they came from. The default focus is settled in
`versionReviewLoad` and NOT in the renderer — it was in the renderer first, and the first
rotation then compared against nothing, **which is the member's first move being the one
that tells them least.** If you make the focus a derived value again, that regression comes
back. (2) THE ANALYST'S VOCABULARY IS READ AND NEVER PRINTED: the record stores the
relationship as a token and files each set of reasons under a member-authored label; the
surface renders the CONSEQUENCE — the elicitation's own two stems — and names a set by the
reasons in it, never by its label. The fixture deliberately files one set under an
analyst-worded label, so a renderer that ever prints a label fails the sweep naming the phase
and the word. (3) HIDING SHRINKS THE DISPLAY AND NOTHING ELSE: `op=basisversions` keeps
returning a hidden reading and the surface keeps holding it; only the LIST is filtered, the
count line says how many it is holding back, one control puts them back, and the direct
address opens a hidden reading with its rejection act intact. The control's arm 1 makes the
load drop hidden readings — 10 of 85 assertions go red, five of them named ACTS PERSIST.

WHAT THIS SURFACE DOES NOT DO, STATED SO IT IS NOT READ AS A GAP. It shows no strength, no
grade and no pair for any reading. PL-14's `op=versionstrength` exists and is deliberately
not asked here, because DEC-32 clause 5's ordering rule is that structure is read before
strength is shown, and **a review surface that put a grade beside each alternative is the
surface that invites choosing by the number.**

v81, 2026-08-08 session, thread UI, UI-38. Landed `82ef337` and `3b1cbcf` (merged `818e863`
and `c728ff5`). SURFACE: `app.html`. THE SURFACE REGISTRY AND THE RECIPE FORMAT with their
build-time validation — `ASSISTANT-PILOT.md` §7 step 1, and it needs no AI at all. Surfaces
self-describe, recipes are data, and there is ONE running-session surface, enforced. The
panel had published three conditions and rendered one; **one recursive renderer replaced a
list of field names**, which is the same invert-do-not-lengthen move UI-53 made a day later
in the test tree. The integration also caught a sourcing arm that PASSED A COMPLETE HAND COPY
— the zero-cost-agreement class, measured here before UI-54 met it again.

v80, 2026-08-08 session, thread UI, UI-50. Landed `fbf1590` (merged `d892449`). SURFACE:
`app.html`. `heldMatch` WAS WRITING A WRONG PREDECESSOR INTO EVERY NEW BUNDLE, PERMANENTLY,
AND EVERY DAY ON THE OLD LOOKUP ADDED ANOTHER (PL-10's delegation). The record named the
wrong predecessor and wrote it down; the join that answers correctly already existed, and the
item was making the writer use it. The defect is enumerated as D-256 (renumbered from a
colliding D-236 by CONDUCT the same day). The surface walk this opened was routed as D-257.

THE DECISION THIS LANDING LEFT WITH BOB, carried here from `kickoffs/UI.md` where UI-50
appended it on 2026-08-08 — **it is recorded, not resolved, and it is still his.** What runs
NOW, provisionally: the lookup is fixed so no NEW bundle can be written with a wrong
*"changed from"* sentence, and **the bundles that already carry one are left exactly as they
are**, with the correction DEFERRED to a ruling rather than made by a worker. Why it was
genuinely ambiguous: the record is append-only and correction moves forward (DEC-19), so the
false sentence in a bundle body cannot be edited away — but leaving it unmarked means the
record keeps asserting something it cannot support, which this project ranks as worse than a
missing feature. **Both halves of the doctrine point in opposite directions here, and
choosing between them is a statement about what the record MEANS.** The alternative, stated
fairly: append a correction to each affected bundle — a new revision saying, in the record's
own voice, that the earlier sentence was composed by a lookup that returned the oldest
version at the address and naming the version that actually preceded this capture, the
original staying in the body visibly superseded rather than removed. That is the fuller
correction and entirely within DEC-19; it costs a write to every affected bundle and it needs
an AUTHOR, because a machine appending a correction on nobody's behalf is the shape DEC-54
(c) warns about. RECOMMENDATION: take the alternative, in two steps and in this order.
**First the enumeration, which needs no ruling at all** — the affected set is findable (the
sentence has one fixed literal shape) and every member is decidable today, because the
capture is now in the register and the version-chain read answers with the true predecessor
for it; that report splits into *provably wrong*, *provably right* (one prior version, where
the two routes cannot disagree) and *undetermined* (no chain rows), and **those three must be
reported separately or the report repeats the defect's own mistake.** **Then rule on whether
the correction lands in the bundles or in one published report, with the size of the
*provably wrong* set in front of you. A ruling made before that number exists is a ruling
about an unknown.** What reversing it costs: reversing the DEFERRAL costs nothing today and
gets no more expensive with time — the fix has stopped the set growing and every affected
bundle stays decidable as long as its capture is registered; reversing the ALTERNATIVE, once
correction revisions exist in bundles, costs the ordinary price of an append-only record,
since they cannot be removed, only superseded in turn. **That asymmetry is the reason the
enumeration comes first and the writing second.**

v79, 2026-08-08 session, thread UI, UI-48. Landed `4c04e33` (merged `bf69c27`). SURFACE:
`app.html`. FIVE SURFACES READ A CAPPED OP AND SAID NOTHING, AND AN UNSTATED BOUND READS AS
COMPLETENESS. The lesser half of UI-46's class, routed rather than absorbed. Five surfaces,
six sites — and the difference between those two numbers is the item.

v78, 2026-08-08 session, thread UI, UI-52. Landed `7e0476f` (merged `c1d71f0`). **NO MEMBER
SURFACE CHANGED** — `surface-registry-a4.control.mjs` (new) and `surface-registry.test.mjs`.
ARM A4's TWO CLAIMS SPLIT: the arm asserted a property that only holds at WAVE COMPLETION and
was blocking a finished plane item, so the ASSERTION was narrowed rather than the rule
relaxed — fiction stays unconditional, and the plane-first gap becomes a named, ratcheted
bill.

v77, 2026-08-08 session, thread UI, UI-51. Landed `40fcf64` (merged `a2f8f9b`). SURFACE:
`app.html` and `check-semantics.mjs`. THE FIFTH CANONICAL TYPE'S SEVEN UI ENTRIES — five read
from the plane, two authored. `bias` joins the catalogue's type vocabulary; until it did,
`check-semantics.mjs` FAILED, so the UI harness was RED on an unrelated integration and
CONDUCT was the one holding it.

v76, 2026-08-07 session, thread UI, UI-49. Landed `42f9fe9` (merged `d4a8d65`). SURFACE:
`app.html`. §14a's PROMISE REACHES SOMEBODY — the running-session indicator gets its call
sites. `INVESTIGATIVE-SESSION.md` §14a says any window focused on an inquiry shows that a run
is active; the indicator existed and had NO CALL SITE, which is the
mechanism-believed-on-its-existence class this project meets most. The integration also found
that no op can answer which runs are in a context — a ratchet blind spot, recorded rather
than smoothed.

v75, 2026-08-07 session, thread UI, UI-47. Landed `2f8acea` (merged `d294b3f`). SURFACE:
`app.html`. THE RUNNING-SESSION SURFACE READS THE RUN (IS-6's `op=airun`) — IS-6's
delegation, and its consumer was built FIRST on purpose. UI-38 shipped the once-only surface;
this wired the read. At integration §14a's promise was still undelivered, which is what
became UI-49.

v74, 2026-08-07 session, thread UI, UI-46. Landed `52bc9cf` (merged `a96bb06`). SURFACE:
`app.html`. **THE COMMIT SPELLS THIS ITEM `UI-42`, AND THAT IS NOT AN ERROR IN THE LEDGER —
IT IS A RENUMBERING.** The item was minted as UI-42, landed under that subject on 2026-08-07,
and was renumbered to UI-46 at integration (`71d0a5b`, *"UI-46 (was UI-42)"*) because the id
was reused for the version-review item that landed two days later as `v82`. **A subject-line
matcher cannot see a renumbering**, and this entry exists because a hand check caught it.

A LIVE MEMBER-FACING OVERCLAIM, CREATED BY REC-60 LANDING AND INVISIBLE TO EVERY SUITE — the
class this project ranks worst, which is why the item was taken at all. The false sentence was
DELETED and no new one was written in its place (the rule UI-39 and UI-40 also ran), and the
instrument that was the reason it could not announce itself was built in the same turn. Five
capped ops were invisible to the walk that should have caught this; the lesser half became
UI-48.

v73, 2026-08-05 session, thread UI, UI-41. Landed `f7e49fe` (merged `58b6533`). SURFACE:
`app.html`. THE SURFACES READ THE RECORD'S BOUND INSTEAD OF AUTHORING THEIR OWN. REC-57 gave
them the record's own bound sentence (UI-39's delegation, discharged on the plane side), so
no surface authors a bound any more and DEC-58's exception is retired. The pattern this and
its two neighbours establish, and it is the one to keep: **when a surface has been saying
something the record did not say, delete the sentence and render the record's — never write
a better one.**

v72, 2026-08-05 session, thread UI, UI-40. Landed `5020ec8` (merged `1da216f`). SURFACE:
`app.html`. RENDER THE RECORD'S TWO PUBLISHED ACCOUNTS; `opened` removed via IC-22. Three
publications on `op=publishedcase` were unread — decided by CONDUCT rather than raised,
because REC-41 had already set the precedent. **`unresolved[]` was a contradiction the reader
was never shown**, and the integration's own line for it is the one worth keeping.

v71, 2026-08-05 session, thread UI, UI-35. Landed `6212c65` (merged `1d3b164`). SURFACE:
`app.html`. MEASURE `op=publishedcase`'s CONSUMERS — AND THE PREMISE IS CONTRADICTED. The
item was raised on the belief that a published top-level detail was rendered nowhere for a
case that was found; the measurement said otherwise. **THE FIELD DOES NOT EXIST — AND THE
FIXTURE INVENTED IT, SO A DEAD BRANCH RENDERED AS ALIVE.** That is the finding: a fixture
that mints a field the plane never publishes makes unreachable code look reached, and no
assertion can tell.

v70, 2026-08-05 session, thread UI, UI-39. Landed `7e0a5c3` (merged `db82819`). SURFACE:
`app.html`. THE FOUR BOUND-DROPPING SITES UI-25 FOUND AND REPORTED RATHER THAN EDITED (they
sat outside its claim), plus the sweep for the class. **A CAP GOVERNED A WRITE, AND A STALE
CARRY WROTE A FALSEHOOD** — which is the same class one level worse than a cap governing a
display. Two delegations were raised rather than absorbed: the ops that cap without
publishing the cap (became REC-57, discharged into UI-41), and the battery's concurrency
sensitivity (became M0-10).

v69, 2026-08-05 session, thread UI, UI-25. Landed `fb0dadd` (merged `4e81fb2`). SURFACE:
`app.html`. THE UNCAPPED QUERY SELECTION — *"hold everything this query matches"*, UI-21's
follow-on. The finder's lease was drawn from a page capped at a limit, so a member holding
"everything this query matches" held a page of it. **`digestChanged` is its own fact and not
a synonym for per-row drift**, and separating the two is half the item. It reported four more
sites outside its own claim rather than editing them; those became UI-39.

v68, 2026-08-04 session, thread UI, UI-37. Landed `f51f8ae` (merged `d46a72d`). SURFACE:
`app.html`. THE PUBLIC VERIFICATION SURFACE STOPS ANSWERING A QUESTION THE PLANE DECLINED
(D-195, measured by UI-36). A plane REFUSAL was being rendered as a substantive negative —
the record saying *we did not determine this* shown to a member as *this is not so*, which is
the overclaim class in its purest form. **THE SWEEP FOUND THREE REFUSALS ACROSS THREE PUBLIC
SURFACES WHERE THE ITEM NAMED ONE.**

v67, 2026-08-04 session, thread UI, UI-36. Landed `3370514` (merged `4236109`). **NO MEMBER
SURFACE CHANGED** — `preauth-vocabulary.test.mjs` only. THE PUBLIC OP NOBODY ASKED, DRIVEN.
`pubVerify` is a public, uncredentialed op whose answers no scenario harvested, and driving
it grew DEC-49's SUBJECT from 8 plane-sourced rows to 11. **An op with no scenario is an op
whose wording nothing governs**, and the three rows it added are what made D-195 findable by
UI-37.

v66, 2026-08-04 session, thread UI, UI-34. Landed `f5add98` (merged `2012a0a`). SURFACE:
`app.html`. `handle` DECIDED PRODUCT-WIDE AND KEPT, WITH THE DRIFT ASSERTION AS THE ITEM —
the naming is settled by a machine-guarded assertion rather than by a note, so the next
session cannot re-litigate it by accident. Also: one pre-authentication surface that NO
SCENARIO DROVE, and the published rail's own links now discovered rather than authored.

v65, 2026-08-04 session, thread UI, UI-33. Landed `a33d84f` (merged `b243547`). SURFACE:
`app.html`. THE HALF OF THE PRE-AUTHENTICATION VOCABULARY NO RULING WOULD HAVE FIXED. UI-31's
measurement, routed as a queue question rather than raised as one: DEC-49 settles who owns
the words the PLANE publishes, and it can never settle the words the SURFACE authored. Those
are closed here, **with every plane string untouched** — the boundary is the item.

v64, 2026-08-04 session, thread UI, UI-32. Landed `b39ab4d` (merged `708495d`). SURFACE:
`app.html`. THE FOURTH HAND-WRITTEN STATEMENT OF THE CAPTURE-GRADE DOCTRINE, plus two small
stale copies in its neighbourhood, with a sweep so there is no fifth. **THE FOURTH STATEMENT
WAS A PREDICTION AND IT WAS RIGHT — and a second site fell out of that reading.** No surface
spells a capture grade letter it derived. This removal STANDS and UI-54 did not reopen it.

v63, 2026-08-04 session, thread UI, UI-31. Landed `272c5a6` and `0e66041` (merged `54dfc15`).
**NO MEMBER SURFACE CHANGED** — `preauth-vocabulary.test.mjs` only. THE VOCABULARY GUARD
REACHES THE PRE-AUTHENTICATION SURFACES, AND REPORTS RATHER THAN FAILS while DEC-49 was open.
UI-4's member-facing guard had never reached the sign-in gate. The follow-up commit asserts
BOTH structural rules live, SEPARATELY — **one assertion covering two rules is one rule
nobody is enforcing.** Its measurement is what routed UI-33.

v62, 2026-08-04 session, thread UI, UI-28. Landed `fa1ba32` (merged `98f1ede`). SURFACE:
`app.html`. THE SURFACE STOPS AUTHORING THE ATTESTATION FENCE — IT RENDERS THE PUBLISHED ONE
(DEC-39's UI half). `ATTEST_YIELDS_GRADE` and its hand-written honesty block go; the plane's
published fence arrives whole. **THE MEASUREMENT THAT MATTERS AND THAT UI-54 LATER LEANED ON:
the plane's three parts reassemble CHARACTER FOR CHARACTER**, which is what makes "render it
whole" a checkable rule rather than a preference.

v61, 2026-08-04 session, thread UI, UI-30. Landed `084cafa` (merged `238a1d0`). SURFACE:
`app.html`. THE SIGN-IN GATE RENDERS THE PLANE'S REFUSAL SENTENCE, and the harness stops
asserting a RETIRED code (REC-41's consumer half). **A harness asserting a code the plane no
longer emits is a test that passes for the wrong reason**, and correcting it — rather than
exempting it — is the standing rule. The wording-ownership question this raised became DEC-49.

v60, 2026-08-04 session, thread UI, UI-29. Landed `18fca89` and `bc0bb46` (merged `40e8638`).
SURFACE: `app.html` and `check-mock-envelope.mjs`. THE PUBLISHED CASE RENDERS ITS FINDINGS,
PLURAL (DEC-44's surface half). UI-18 rendered a single inquiry AS the case; **a case is a
SET**, and rendering one member of a set as the whole is a claim about the record that the
record does not make. The follow-up commit put an honest verification pointer in the awaiting
window and RE-MEASURED the negative-control counts rather than carrying the old ones.

v59, 2026-08-04 session, thread UI, UI-27. Landed `c46f365`, `d58067e` and `c4bd50e` (merged
`b3c9203`). SURFACE: `app.html` and `check-mock-envelope.mjs`. THE READER SUPPLIES THE FLOORS
(DEC-40), AND IT CORRECTS SHIPPED CODE — UI-18 had landed a four-stance selector and the
ruling removes it, so the named stance set is GONE. Then DEC-32's ELICITATION: **consequences
in, structure out**, reachable from the question's own act bar. Its eight negative controls
and their measurements were recorded in `CLAIMS.md` in a commit of their own, which is the
practice this ledger is the successor to.

v58, 2026-08-04 session, thread UI, UI-26. Landed `f98161e` (merged `08e5675`). SURFACE:
`app.html`. CONSUME `op=readingname` (REC-36's UI half) — ONE entity call where a per-name
loop was. UI-13's candidate loader ran one read per alias and stated a limit that was not the
one in force. The integration's line is the one to keep: **the measured bound stated clause by
clause, and the identifier-tier trade NAMED** rather than silently taken.

v57, 2026-08-04 session, thread UI, UI-18. Landed `7be97b5` (merged `55fca61`; the UI-18 ×
UI-24 seam corrected at `784c9d6`). SURFACE: `app.html` and `check-mock-envelope.mjs`. **O2
THE PUBLISHED CASE — THE CREDENTIAL-FREE READ, AT A REAL ADDRESS, AND THE REASON THE REST
EXISTS.** The critical path complete. Both strengths everywhere including the index row. Two
of its choices were superseded within the day by ruling rather than by defect — DEC-40 removed
the stance selector it shipped (UI-27) and DEC-44 corrected findings-singular to findings-plural
(UI-29) — and **both supersessions are recorded against this entry rather than hidden inside
the later ones**, because a rung that was right when built and re-ruled after is not a rung
that failed.

v56, 2026-08-04 session, thread UI, UI-24. Landed `ffa11da` (merged `15eab62`). SURFACE:
`app.html`. THE AUTHENTICATION SURFACE FINALLY HAS AN INSTRUMENT. Sign-in and the public list
had ZERO harness coverage; UI-23's sweep had found the token read broken and nothing could
have reported it. The attest label is read rather than authored, and the vocabulary mock is
tied to its source. Its two delegations became REC-39.

v55, 2026-08-04 session, thread UI, UI-17a. Landed `6ee25f0` (merged `9fd6254`). SURFACE:
`app.html`. THE PUBLICATION ENTRY POINT — the placeholder DEC-33 ships in UI-17's place. A
small surface stating what publication IS (irreversible, editions, correction moves forward —
DEC-19's corrected top rung) and that publication currently runs THROUGH THE OPERATOR. **No
ceremony controls, no signing, no pre-flight, and nothing calls the publish op — asserted on
the wire AND by driving the act handler directly.** The statement renders IDENTICALLY for
every credential, proved string for string, **because it is a statement about the record and
not a control.** Two instrument findings were kept rather than smoothed: a greyed control is
invisible from the credential it is not greyed for, so the read-only arm is not redundant;
and the act handler returns synchronously, so counting calls on the next line measured
nothing until a microtask drain made the arm honest.

v54, 2026-08-04 session, thread UI, UI-21. Landed `704e4fb` (merged `20f70ad`). SURFACE:
`app.html`. E1 THE EVIDENCE FINDER — ONE finder, TWO NAMED ROUTES, **the intersection REFUSED
rather than approximated.** Refusing the intersection is the record's rule showing up in a
search box: a result set the record cannot justify is not offered, however useful it would
look. The merge seam turned the Actions route into a finder scope, and the deletions are part
of the item rather than tidy-up. Its follow-on was UI-25.

v53, 2026-08-04 session, thread UI, UI-19. Landed `822aac3` (merged `9f227c5`). SURFACE:
`app.html`. O3 THE ACTION PAGE — the outward ask, and what came back. The intake was restored
and the conformance flip-back proved in BOTH directions, which is the part worth keeping: **a
conformance check that only proves the good direction proves half of nothing.**

v52, 2026-08-04 session, thread UI, UI-23. Landed `97f8bf0` (merged `0dbe4b1`). SURFACE:
`app.html` and `check-mock-envelope.mjs`. THE D-173 CLASS SWEEP — every DO-op read in the UI
opens the envelope, and a guard so the class cannot reopen. Five instances across two items;
six live defects found. **The envelope class is closed STRUCTURALLY, with a two-arm guard**,
rather than by five corrections and a note — which is why UI-24 exists: the sweep found
`signIn`'s token read had been broken and no instrument could have said so.

v51, 2026-08-04 session, thread UI, UI-22. Landed `5ab4f9e` (merged `54f0e91`). SURFACE:
`app.html`. THE FIVE PRE-DEC-8 REFUSAL RESIDUES — every flow now renders only plane-worded
refusals. `disposePreflight` (UI-2's, built before DEC-8) was still computing and WORDING its
own refusals; four more like it. **Dispose gets the probe the evidence supports** and no
more.

v50, 2026-08-04 session, thread UI, UI-16. Landed `b88fd8f` (merged `be5ec6c`). SURFACE:
`app.html` and `check-semantics.mjs`. E4 THE PROJECT WORKSPACE, and the ballot act's FIRST
CALL SITE. UI-3 built the ballot in July and nothing could reach it until this; **an act with
no call site is the mechanism-believed-on-its-existence class, and this area has now met it
three times (UI-3's ballot, UI-13's nine ops, UI-49's indicator).** The container side held.

v49, 2026-08-04 session, thread UI, UI-15. Landed `d397ab5` (merged `55a5a46`). SURFACE:
`app.html`. E3 ADD — THE TWO WORST LIVE DEFECTS IN THE MEMBER UI, plus F-6 and F-7 and the
`ADD_TYPES` amendment. **This is the landing the 2026-08-04 CONDUCT amendment at the head of
this file is about**: it REBUILT the A4 frame the 2026-07-30 ruling deleted, under the
2026-08-01 case-making handover whose own BOB-authored acceptance requires it — and the
rebuilt frame is not the one the ruling deleted. The old frame explained the platform limit
and asked the member to arbitrate it; the new one classifies the complication, never names the
ceiling, and asks only the record question: what may the record claim about a capture missing
part of itself. **Do not delete the frame on the strength of `v33`'s entry.** Reversal is one
function body and three assertions.

v48, 2026-08-04 session, thread UI, UI-20. Landed `9c7cd57` (merged `4cdc140`). SURFACE:
`app.html`. `op=cite` GETS ITS CALLER — **THE NEVER-BUILT U9 HALF**, in the item's own words.
The cite/retire/sever/reinstate acts reach a member for the first time; the pre-flight checks
every member is CITABLE before offering the act rather than after refusing it. The
inquiry-cite gap was MEASURED and NAMED rather than worked around, and became REC-37.

v47, 2026-08-04 session, thread UI, UI-12. Landed `0e6849e` (merged `73fd16a`). SURFACE:
`app.html`. S3's ACT BAR — CONCLUDE, with every option and rung READ FROM THE PLANE. The
target-withheld pre-flight lands here, and `DISPOSITIONS` is DELETED from the surface — a
surface-side vocabulary for a plane-side ruling is two answers to one question. Its cost
measurement is REC-34's, which also named the no-memo shape.

v46, 2026-08-04 session, thread UI, UI-14. Landed `8b1e77c` (merged `1bbfd46`). SURFACE:
`app.html`. **S1 THE QUEUE — THREE SCREENS BECOME ONE.** MILESTONES M8's build-order rule is
the queue FIRST, and this is it. The mute control reads *"Mute conditions on this case"* and
reaches the act; the receipt, the stated rule and **the honest all-clear** are the three
pieces — an all-clear that cannot distinguish *nothing happened* from *we did not look* is the
defect UI-45 later closed per-class.

v45, 2026-08-04 session, thread UI, UI-13. Landed `9b0b357` (merged `7dfe631`). SURFACE:
`app.html`. A WRITE SURFACE FOR THE INTENT LAYER — **NINE OPS, ZERO CALLERS**, and now nine
call sites. The envelope bug D-173 was fixed at ONE SEAM in the same integration; the class
sweep that followed is UI-23.

v44, 2026-08-04 session, thread UI, UI-11. Landed `018e44b` (merged `740255e`). SURFACE:
`app.html` and `check-semantics.mjs`. S3 THE INQUIRY PAGE, READ-ONLY — **TWO STRENGTHS, NEVER
ONE**, each naming its own weakest leg. The inert legs are NAMED and the gap is STATED rather
than left to be inferred, which is the undetermined-is-first-class rule reaching a page.

v43, 2026-08-04 session, thread UI, UI-10. Landed `a26617f` (merged `2c136fe`). SURFACE:
`app.html` and `check-semantics.mjs`. THE TYPE IN THE UI, AND THE DRIFT GUARD MADE REAL. The
first item of UI's post-promotion run and the one every other UI item depended on: the
member-facing type vocabulary comes from the plane, and the guard that says so is enforced
rather than described.

v42, 2026-07-31 session, thread UI, UI-9. Landed `e2e05e4` (merged `ba7fe07`; `op=captureprogressions`
followed at `49d10ac`, I3 1.6.0). SURFACE: `app.html`. CONSTRUCTS STEP 8, THE DOCUMENT-PAGE
HALF — a document page SHOWS its REFERENTIAL and TEMPORAL structure, so a member reading ONE
document can see what it points at and when it sits.

v41, 2026-07-31 session, thread UI, UI-8. Landed `1586ad2` (merged `1b2dc08`). SURFACE:
`app.html`. THE MEMBER HOME — the *"what needs you"* orientation surface, and M8's ENTRY
POINT. Live task and proposal summaries.

v40, 2026-07-31 session, thread UI, UI-7. Landed `af81f28` (merged `ce39e62`). SURFACE:
`app.html`. THE MEMBERS & GOVERNANCE ROSTER — the READ-ONLY half of U11, split from the rung
because the whole rung exceeded it. **The founder discrepancy it met was SURFACED HONESTLY
rather than reconciled**, which is the right answer and the one that costs something. U11's
other halves — key fingerprints and the doorbell — are still ABSENT and are `UI-60`'s.

v39, 2026-07-31 session, thread UI, UI-6. Landed `08f3e05` (merged `1245b61`). SURFACE:
`app.html`. THE ATTESTATION ACT — a member CO-ATTESTS a capture through `op=attest`, raising
it by co-attestation over the capture hash. Act four, **and with it the ACT construct fits all
four act types** — which is what v0.2's falsifiable test was asking.

v38, 2026-07-31 session, thread UI, UI-5. Landed `97e6b99` (merged `21739e6`; its two plane
gaps closed by REC-6 at `bf4af92` and REC-7 at `ccbab84`, I3 1.3.0/1.4.0, I5 1.8.0). SURFACE:
`app.html`. THE PROPOSAL SURFACE — THE THIRD ACT (derived findings; adopt, defer, dismiss),
completing v0.2's falsifiable test and closing D-82's DISPLAY half. The gap banner it shipped
with was retired by the plane rather than papered over, which is the pattern: **state the gap,
then close it at the source.**

v37, 2026-07-31 session, thread UI, UI-4. Landed `d2d94df` (merged `2aecb59`). SURFACE:
`app.html`. THE SUBJECT VIEW — *"what the record knows about a subject"*, making the M4
reverse index MEMBER-VISIBLE. Connection auto-derivation was logged as D-122 rather than
assumed.

v36, 2026-07-31 session, thread UI, UI-3. Landed `719473b` (merged `156d555`). SURFACE:
`app.html`. THE SECOND ACT — A BALLOT (project owner removal) through the ACT construct,
continuing v0.2's falsifiable test on an act UNLIKE the justified transition. **The construct
held and the collapse was corroborated.** The ballot had no call site until UI-16.

v35, 2026-07-31 session, thread UI, UI-2. Landed `bc434e1` (merged `3e57cb5`). SURFACE:
`app.html`. THE FIRST ACT SURFACE — focus disposition as a JUSTIFIED TRANSITION, and v0.2's
falsifiable test in its original form: build the queue and ONE act, and if the next three acts
each need a new construct, the collapse was wrong. It raised DEC-8, the ACT construct's
pre-flight source — **the ruling that later made UI-22's five residues findable**, because
`disposePreflight` was built here, before it.

v34, 2026-07-31 session, thread UI, UI-1. Landed `105198b` (merged `e69fd98`; the task-actor
fence REC-4 completed it at `17aae55`, I3 1.2.0). SURFACE: `app.html`. **THE TASK INBOX — the
member surface over the attention layer, and MILESTONES M8's FIRST item.** The plane half
already existed (D-98, 0.49.0): the producer/consumer split with no control-plane route to the
queue at all, and `actor` stamped server-side. This is the surface over it, and it is where
UI's run against `QUEUE.md`'s rows begins — **the run this ledger had not recorded until
today.**

> **Amendment, 2026-08-04 (CONDUCT, at UI-15's integration — the D-160 pattern: a
> dated record gets an amendment, not a rewrite).** The v33 entry below records the
> 2026-07-30 ruling that deleted the ceiling-choice frames ("ALL THREE ARE GONE").
> UI-15 (QUEUE, landed 2026-08-04) REBUILT the A4 frame under the 2026-08-01
> case-making handover, whose own BOB-authored acceptance requires it — and the
> rebuilt frame is NOT the one the ruling deleted: the old frame explained the
> platform limit and asked the member to arbitrate it; the new one classifies the
> complication, never names the ceiling (the capture-honesty vocabulary guard is
> asserted over the frame's HTML), and asks only the record question — what may the
> record claim about a capture missing part of itself — the same class as A7's
> grade-C archive choice, which the ruling left standing. Do NOT delete the frame on
> the strength of the entry below; if Bob reads the rebuild as re-litigating his
> correction, reversal is one function body and three assertions (recorded on
> UI-15's landed line).

v33, 2026-07-31 session, thread CAPTURE, continuation. FIVE RELEASES, 0.49.0
through 0.53.0, each signed, deployed byte-identical, tagged and live-verified.
op=audit 31/31 clean throughout and the real record untouched: every live proof
ran in the scratch namespace, which was swept at the end.

WHAT SHIPPED. 0.49.0, D-98, the task inbox: C-19.1 as a sibling of C-18.5 (not a
second grammar), the producer/consumer split enforced structurally with NO
control-plane route to the queue at all, and `actor` stamped server-side.
0.50.0, D-104, source reachability: a counter built BEFORE the fallback so its
exclusion is designed in rather than retrofitted. 0.51.0 and 0.52.0, the archive
fallback: `src/cdx.mjs` pure and separate from the plumbing, the eligibility
fence, and then the two halves composed into one act so the provenance hop is
built by the call that fetched the CDX record. 0.53.0, D-108 and D-113: a deploy
that waits for the build to actually serve, and a purge that means ALL.

THE THREE THINGS WORTH CARRYING, all of them the same shape.

(1) MEASURE BEFORE BUILDING, AND THE MEASUREMENT WILL SURPRISE YOU. D-105 was
closed by asking archive.org three questions through the plane's own egress, and
three of ARCHIVE-FALLBACK.md's claims were wrong: CDX `length` is the compressed
WARC record size and not the body length (6255 declared, 32,564 received); a
shared digest can mean an EMPTY BODY, since 3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ is
base32(SHA-1(empty)) and the NEWEST row in the sample is such a 301; and most
rows are not 200. Each is now a refusal in code rather than a note.

(2) AN EQUALITY OR AN OUTCOME THAT COSTS NOTHING TO PRODUCE IS NOT EVIDENCE.
This turned out to be one principle wearing three hats: a governed refusal is
not the source failing (D-104), two empty-body digests agreeing agree on nothing
(D-105), and a chain hop a caller can hand us is a chain hop a caller can invent
(D-112). All three are enforced structurally rather than by convention, and the
third is guarded at SOURCE in hygiene.test.mjs because a runtime test can only
show that one forged request was ignored.

(3) NEGATIVE CONTROLS FOUND WHAT THE ASSERTIONS MISSED. Neutering the inbox
write-path grammar check left all 67 assertions passing, because every task the
consumer builds from ordinary input is well-formed by construction; an
assertion driving it with a non-canonical bundle id was added and the control
then failed 3. Removing D-104's exclusion breaks 17 of 34. Run the control.

BOB'S RULING THIS TURN. There is no need to push capture traffic to the breaking
point: the governor keeps traffic low enough that being banned is not a concern,
and there is plenty of time to capture even large collections. This is why D-111
exists as an entry rather than an omission: establishing a rate ceiling means
hitting it, and the documented consequence lands on Cloudflare's SHARED egress,
on people who have never heard of this project. Their capacity gets discovered
by a refusal arriving in ordinary polite use, never by probing for the wall.

THE NEAR MISS, because it is the most useful thing here. Seconds after deploy.mjs
verified 0.52.0 byte-identical, /version answered 0.51.0 and a forged-locator
probe appeared to show the new code fetching evil.example.com. It was the OLD
code answering: the rollout is per-isolate and NOT atomic, so a verification in
that window can receive a mix of old and new answers. deploy.mjs now gates on
the version actually serving, and it fired correctly on 0.53.0. If a live probe
ever contradicts the suite, check which build answered before believing either.

v32, 2026-07-30 session, thread CAPTURE, continuation. A THIRD RELEASE AND FOUR
RULINGS. 0.48.0 cut, signed, deployed byte-identical, tagged, op=audit 31/31
clean. It carries D-103, the governor's operator surface: op=governorstate
(admin/member/probe, read) reports which hosts are held and why, because a
member watching a capture stall deserves to see the governor is the reason
rather than a broken source; op=governorconfig (admin/probe, mutating) sets a
host's appetite, REQUIRES a host so no fat-fingered global change is possible,
and resets to the instance default when the appetite is omitted. Verified on the
LIVE instance, not only in the suite: config wrote web.archive.org at 24/min,
state read it back, a member token was refused config BY CLASS, and the refused
write left the value unchanged.

BOB'S RULINGS THIS TURN, all recorded where the next session will hit them.
(1) D-98 is settled and improved: an undetermined capture creates an inbox task
AUTOMATICALLY AT CAPTURE, through a PRODUCER/CONSUMER QUEUE. The capture path
only enqueues; a separate consumer holds the sole inbox write path, applies
routing and the C-19.1 grammar, and dedups idempotently on (refers_to, kind).
This is the safety property, not a transport detail: the daemon credential's
blast radius stops at the queue boundary, so a leaked capture token can enqueue
noise but can never write a task, set an assignee, or forge history. Bob's queue
instinct made this safer than either option originally posed.
(2) D-102, RESOLVED and simpler than stated: the instance name IS THE WORKER
NAME. The wizard already collects it as `slug`, so there was no prompt to add,
only a binding to make; done on install AND update, the update half being what
retro-names copies that predate it. The interim 'development' override was
removed the same day and this instance is bound to biosmoke7, verified live in
the provenance chain. The rule is uniform: no second name, no override, no
prompt, because a name that can differ from the worker is a second source of
truth that drifts.
(3) Browser-UA delegation is LEGITIMATE but HELD IN RESERVE. Delegating the
operator's OWN browser user-agent to their OWN instance is speaking as
themselves through a tool they run, not inventing a client that does not exist.
It is not adopted while the honest CivicOS agent gains admission; the trigger is
measurement showing admission has stopped, and the veto is outside counsel (Bob
is consulting journalists and lawyers). Do not build it pre-emptively, and do
not read the no-disguise line as forbidding it.
(4) THE CITY IS NON-SUPPORTIVE. This inverts the D-94 plan. Akamai is Oakland's
CDN and sits in front of every request to their site; we pass only because its
bot filter does not recognise CivicOS, which is incidental and not granted. An
allowlist request to a hostile City may simply hand them the string to block,
and they already denylist archive.org_bot and GPTBot BY NAME. The strategic
consequence: the ARCHIVE path and egress diversity become the priority, not the
allowlist ask. Bob has not yet ruled on writing this into doctrine; the
reframing is offered and awaiting his read.

ALSO THIS TURN. D-98's grammar and routing were fixed as a CONTRACT
(INBOX-GRAMMAR.md) derived field-for-field from C-18.5, the exported
checkGatheringGrammar reuse path, BUNDLE_ID_RE, member_expertise's real columns,
and the RULED routing order, with every cited precedent verified present before
the claim was written; D-98 is now a build task. D-60's row was WRONG about its
own dependency (there is no civicos-ui/volatile.mjs; the machinery is
docprofile/index.mjs's digests and compare, with handlers in
docprofile/handlers/), corrected, and its one feasibility question measured:
docprofile is 37KB of dependency-free JS that tree-shakes to 5.3KB against 2.4MB
of headroom, imported as ../../docprofile/ and inlined by build, so the
installer is unaffected. D-104 and D-105 were filed as traps for the archive
session: a governor-refused monitor tick must NOT count toward the
source-failure threshold that triggers the fallback (our own politeness is not
the source being unreachable), and every CDX claim remains unverified because
web.archive.org is blocked from this egress.

ONE LIVE CONFIG STANDS AND IS NOT A FINDING. web.archive.org is set to 24/min on
the live instance, the LOW end of the archive's own published figures, chosen as
a conservative placeholder so that if the archive session fetches before
re-measuring it does so under the gentlest available number. Re-set it from our
own measurement once D-105 is discharged.

WHAT THE NEXT CAPTURE SESSION INHERITS. The archive fallback with its two traps
marked and its schema groundwork shipped; D-98 as a build task with the queue
ruling; D-102's wizard half; D-60 as a confirmed-feasible build task; D-91 and
D-65 untouched. The plane is at 0.48.0 live.

---


v31, 2026-07-30 session, thread CAPTURE. THE RELEASE THAT DID NOT HAPPEN LAST
SESSION HAPPENED, AND THEN A SECOND ONE. 0.46.0 (the legible agent, deployed
byte-verified over 0.45.0) and 0.47.0 (the governor, three-valued authority, and
the observation-source split), both signed, tagged, deployed to biosmoke7 with
the baton held by CAPTURE, op=audit 31 checked 31 clean after each. The
five-month capability gap D-100 recorded is CLOSED ON THE LIVE INSTANCE: the
deployed plane captures www.oaklandca.gov from Cloudflare egress, full transport
record, ak_p confirming Akamai in the path.

THE LIVE-EGRESS VERIFICATION PRODUCED A MEASUREMENT. Eleven captures through the
deployed 0.46.0: ten admitted, one SOURCE_REFUSED 403 on the second of the only
cold back-to-back pair, then six paced and three warmed burst requests all 200.
Intermittent and burst-shaped, not categorical, which is D-95's case made live,
and D-95 shipped in the next release the same day.

THE UA PROBE'S VALIDATION RUN FOUND THE DISCRIMINATOR. scripts/ua-probe.mjs
(D-94's instrument: a nine-rung ladder, one component removed per rung) against
the ACFR path, second-path confirmed: purpose and instance are droppable, and
REMOVING THE CONTACT URL flips admission 200 to 403 uniformly, all the way down.
The contact URL is the admission key within our component space, which also
means the resolvable-URL fix shipped in 0.46.0 (the agent now advertises the
GitHub repo, which resolves, instead of a path on a domain mid-transfer) was
load-bearing rather than cosmetic. Full table in MEASUREMENTS.md.

SHIPPED IN 0.47.0, all suites green (34 files, exit 0). D-95: per-host governor
in the Durable Object; appetite configured (12/min default, per-host override,
instance binding for suites), capacity discovered by refusal, 429 overrides the
bucket honouring Retry-After, escalation doubles per consecutive refusal and
resets on success, jittered human gaps with a three-token burst; all three
outbound sites wired; refusal is a named HOST_COOLING_OFF; a governed monitor
tick that never ran never stamps last_checked. D-96: captured_locators carries
via IN ITS KEY plus the document-address/retrieval-locator split; derived, so
reshaped per the links precedent; the bracket arm reads direct observations
only. D-97: authority three-valued at acquire; assertion recorded with a dated
basis, absence honestly undetermined instead of refused, single-hop
provenance_chain; C-18.1 learned the contract (legacy documents stay
conformant); C-18.9 implements the RULED publication fence and refused an
undetermined document at verified in a both-ways test. Verified live: an
assertion-free capture from Cloudflare egress lands authority_state
undetermined with its basis, and the chain names instance biosmoke7.

TWO CATCHES WORTH THE RECORD. The template-literal class (D-24) nearly shipped a
third time: a D-96 schema comment put backticks inside schema.mjs's SCHEMA
literal, node --check passed because the stray pair re-balanced, and only
miniflare refused it. Guarded now: hygiene.test.mjs covers schema.mjs. And
INSTANCE_NAME was never bound, so the live agent had said "instance unnamed"
through two releases; deploy.mjs now binds it from the slug, pushed to
biosmoke7, verified live. The installer wizard path is NOT fixed (D-102).

WHAT THE NEXT CAPTURE SESSION INHERITS. The archive fallback (ARCHIVE-FALLBACK
design, now with the via column and locator split it needed), the tasks table
D-98 so undetermined authority has somewhere to land, D-91 PDF structure
extraction, plane adoption of the volatile digest (D-60) and monitoring
contracts (D-65), and D-94's clock: we pass because Akamai does not recognise
CivicOS, and the durable fix is the allowlist request to the City, which is
Bob's to make and now has a measured, specific ask attached.


---


v30, 2026-07-30 session, thread CAPTURE. THE SOURCE-ACCESS FAILURE WAS OURS, AND
THREE SESSIONS OF REASONING ABOUT IT WERE WRONG. `www.oaklandca.gov` was never
refusing the record on policy. It was refusing an illegible user-agent. Measured
by varying the agent alone from one network, eight repeats per string: the bare
`bio-acquire` token returns 403, an honest `CivicOS/<version> (+url; instance;
purpose)` string returns 200, and all six previously-frozen documents are
reachable again, including the 32.5MB budget book and robots.txt. The standing
position that BIO does not disguise its requests is vindicated rather than merely
asserted: legibility was the fix, and an authorised one-off impersonation test
proved unnecessary because the honest string works identically.

WHY IT TOOK THREE SESSIONS. Every client that succeeded (Bob's browser, the
deleted predecessor plane on 2026-07-19, the Internet Archive) had BOTH a
reputable network AND a legible agent, while the plane had neither, so the two
variables were perfectly confounded and both competing theories fit all the
evidence. Nothing settles that except varying one alone. Recorded as D-100: two
clients differing in two variables is not evidence about either one.

SHIPPED, SUITE GREEN AT 1,914 ASSERTIONS, ZERO FAILURES, NOT YET RELEASED OR
DEPLOYED. D-58 fixed: `recordcapturedlocator` is unconditional, so PDFs and
plainly-captured pages file addresses and can be link targets, tested through
`op=acquire` with a negative control. Transport recording: every response header
in order, requested and resolved locators, redirect flag, status, and
`peer_address` null with a named reason because the runtime will not supply it.
`userAgent()` centralised. And a test that had begun failing on the calendar,
pinned to a `2026-07-2x` date prefix, which meant the whole suite had stopped
running past `members` on this and every later day.

TWO FINDINGS ABOUT THE CITY, recorded as dated facts and not as claims. Oakland's
CDN (Akamai) denies `archive.org_bot`, `ia_archiver`, `Googlebot`, `Bingbot` and
`GPTBot` by name, and IA's own index shows a twice-daily scheduled crawl
collapsing after 2026-02-04 with the first archived 403 on 02-14. And robots.txt,
readable for the first time, carries 82 Disallow rules of which 63 are Public
Ethics Commission publications, including the City's own report on meaningful
transparency. Whether that is deliberate or a CMS artifact is UNKNOWN and is not
assumed. None of the material this project needs was ever excluded by robots.txt.

BOB'S RULINGS, all new and all recorded in AUTHORITY-AND-TRUST.md. The renderer
is immaterial; authority follows the DATA, not the code, which killed a proposal
to block third-party origins that would have destroyed exactly the GIS, CAD and
hosted-document captures the project needs. Authority is three-valued, with
undetermined becoming a task rather than a blocker, which decouples D-55 from
D-53's granularity wall and unblocks rendered capture. An
authority-undetermined capture cannot be PUBLISHED. Transitive trust is accepted
where disclosed in the provenance chain with grade and confidence adjusted, which
revises the no-transitive-trust rule and gives D-53 its first worked example.
Authority tasks go to the project manager, falling back to a group admin, on a
per-user inbox whose transport might one day be email. An alternative source
counts as a re-fetch for monitoring after three failures or fourteen days.
Content must be identified in PDFs as it is in HTML.

NOT DONE. No release was cut and biosmoke7 still runs the old agent, so the
deployed instance still cannot reach oaklandca.gov. Ten debt items filed, D-91
through D-100, and the next session works through them from a clean context.

v29, 2026-07-30 session, part twenty-seven. THE UI CAUGHT UP TO THE PLANE, AND
THE LIVE EXERCISE TAUGHT MORE THAN THE CODE. Two deploys of the civicos worker
(builds cbbade6bbd93 then 9a34a82fd0c8), suite green at 10 harnesses with 150 new
assertions, and the record grew its first bundle carrying links, a snapshot
manifest and reuse facts. Audit 31/31 clean. No plane release: every defect the
exercise found in the plane is written down rather than patched, because the plane
ships signed and this session had no release grant.

WHAT THE UI NOW SHOWS. All four of the gaps UI-PLAN named. The five link
partitions with the element cited, the verdict, and the plane's own basis printed
verbatim rather than paraphrased. The unfinished-capture banner with the
outstanding count, naming WHICH bound stopped it. The reuse disclosure naming
when the source was last seen serving each reused part. And, per Bob's ruling,
the per-reference list of what a capture never got, on the render refusal a
member actually hits, reading the same manifest as the banner so the two cannot
disagree about the number.

COUNTS ARE NAMED, NEVER A RATIO. "126 links, 0 connections" reads as failure
because it collapses the middle case, so there are six counts: connection,
held-unclaimed, self-reference, outside the record, inside the capture, refused.
The self-reference count is a CORRECTNESS requirement rather than a nicety, and
live data proved it: the first render said one connection where op=linkproject
projected none, because a paginated Legistar calendar links to itself and
projectLinks drops a self-edge. A surface that counts one as a connection claims
an edge the plane refuses to make.

CONTINUATION IS A CACHE REFILL. Bob's ruling reshaped the whole of item 2. The
primary is never re-recorded; the re-fetch that op=acquire performs on every tick
serves only as a FENCE, and a changed primary hash refuses the continuation
outright because that is a source change and belongs to monitoring. Prior part
records are preserved with their original fetch dates and their
fetched_this_capture flags, so the merge takes from the fresh run only what was
outstanding, and a recorded part whose bytes now differ REFUSES the merge rather
than picking between two sets of bytes for one address. A first draft of the
counter read zero on exactly the run that did the work, because it counted by
absence from the prior manifest and a DEFERRED part is present there.

A LIVE SEAM NOTHING HAD CROSSED. op=image returns a blob-registered file as an
object while the viewer reads the manifest with typeof === "string". A manifest
promoted as a blob reference is one the viewer NEVER SEES, which would have put
the links, the outstanding count and the reuse facts all in the record and none of
them on screen. U7 had never met this because no bundle in the record carried a
manifest: 0 of 30 before this session. Both write paths now promote it as text,
read back out of the store and verified against its own hash.

AND A DEFECT THE LIVE PROMOTE FOUND IN ONE SHOT. docFiles pushed renditions with
no `bytes` and the store refused with NOT NULL on files.bytes. The fix closes a
real hole rather than adding a field: blobEntry reads the bytes back, verifies
them against the hash, and takes the length from what it verified, because naming
bytes in a bundle without having checked them is the move this system refuses
everywhere else.

MEASURED ON LIVE INFRASTRUCTURE, and the numbers are the session's real product.
A Legistar calendar: 368,904 bytes, 309 references discovered, 127 held, and 115
of those 127 REUSED from an earlier fetch of the same host, so a capture that
would have cost 127 subrequests completed in 20. Every reused part carries
fetched_this_capture:false with reused_from_fetched_at and a count of the
documents on that host it appears in. The 12 not reused are all
evidence_is_always_fetched: reuse is furniture only, exactly as designed. Its
links: 116 resolved, 27 anchors, 2 linked, 81 offsite, 6 refused, and 89 DISTINCT
RESOURCES AGAINST 115 DISTINCT CITATIONS, which is 0.43.0's second key earning its
place on the first real page it met. op=linkproject: 0 projected, 1 skipped_self,
1 skipped_unregistered, 81 unresolved. That is the "0 connections" case in the
wild with every reason named.

AN SPA CAPTURES AS A SHELL. The first target, oaklandca.opengov.com/transparency,
produced a perfectly good capture with ZERO links, because the served HTML names
no anchors and the content is assembled by script. It also hashed IDENTICAL to a
capture an existing bundle already claims, which is the cross-bundle duplication
hazard C-18.3 cannot see: promoting a second bundle for it would have written a
second register entry for one capture hash, so it was deliberately not promoted.
Both facts argue the same thing, which the JS-rendered ruling already says: for
these sources the served HTML is not the document.

THREE PLANE DEFECTS WRITTEN DOWN, NOT PATCHED. D-57: resolveLinks reports a
self-reference as a target that CHANGED, naming one capture hash twice as the two
sides of its own bracket, and the UI prints that false sentence verbatim because
it shows the plane's basis in the plane's words. D-58: captured_locators and links
are written ONLY inside the subresource branch, so a plainly captured document is
not a resolvable link target and no verdict about it can ever be established.
D-59: contemporaneous has never been observed on real data and may be unreachable
for municipal sources, because two captures of a Legistar page twelve minutes
apart hash differently on viewstate alone; identical-byte bracketing cannot fire
for such a page whatever happened to its content, which makes the timestamp,
archive and monitoring routes load-bearing rather than fallbacks.

BOB'S THREE RULINGS AT THE END OF THE SESSION, AND THE MEASUREMENT THAT SETTLED
THEM. A re-capture of bytes a bundle already claims is the REGULAR case, not an
exception, because monitoring exists to look again and the ordinary result of
looking is unchanged. Dig into WHY a source's bytes differ so innocuous
differences are noted without forcing a refetch. And promote monitoring across
the interval to the PRIMARY contemporaneity route, demoting identical-byte
bracketing to an opportunistic bonus.

THE MEASUREMENT. Two fetches of oakland.legistar.com/Calendar.aspx three seconds
apart: identical length, 114,177 DIFFERING BYTES, 31% of the document. Every
differing byte lay inside exactly two hidden fields, __VIEWSTATE (115,096 bytes)
and __EVENTVALIDATION (876 bytes). Normalise those two and the remaining 252,948
bytes, 68.6% of the document, are BYTE-IDENTICAL. Nothing had changed. ASP.NET
reserialises its control tree and reissues its anti-forgery list on every
response, and municipal publishing runs on that class of software.

That one measurement breaks three mechanisms at once, which is why it earns a
debt row of its own (D-60). Monitoring reports a change on every tick and
therefore reports nothing. Contemporaneity's strongest arm can never fire.
And duplicate detection does not fire on re-captures of exactly the pages that
get re-captured most: proven live, a second capture of the same calendar produced
a different hash, so the record would have grown a second bundle for one document
while C-18.3 and op=audit both stayed silent, because the hashes genuinely differ.
The answer is one thing rather than three: a capture carries a STABLE DIGEST
beside its raw identity, computed with known-volatile regions normalised. Identity
stays raw and raw bytes are never rewritten; comparison uses the digest; the
volatile regions are recorded with their names and extents, and two fetches
differing only there is itself a dated observation worth keeping.

WHAT SHIPPED FOR THE REGULAR CASE. The Add surface checks before it writes
anything, on BOTH keys. On a hash match it says the record already holds this
document, names the bundle, and does not offer a second copy, with the reason given
in terms of the corroboration count rather than tidiness: one capture hash under
two register entries makes every count that treats register entries as independent
read two corroborations of a thing captured once. On an ADDRESS match with
different bytes it says so and refuses to guess, because it cannot yet tell a
changed document from reissued page state, and adding it anyway is the member's
call rather than the surface's.

AND A THIRD DEFECT THE EXERCISE FOUND, worse than the first two. The installer's
mdFor omits content_hash even when a document is attached (D-62). C-2.7 makes a
well-formed content_hash an entry requirement for verified, so the first bundle U8
wrote COULD NEVER HAVE BEEN RELEASED, and it was invisible to the search layer's
hash facet, which is what the duplicate check above reads. Fixed in the UI's
ported copy and repaired live by revision. NOT fixed in setup.mjs, which is the
copy a new group gets.

D-61, found while repairing that: op=lease stamps leases.actor from the session
and the column is NOT NULL, so a machine credential cannot take a lease and no
unattended writer can revise a bundle. That collides directly with captures being
autonomous jobs a member can walk away from: a daemon that finishes a capture
cannot write the completed manifest back. The repair went through promote's CAS
on base instead, which is the actual integrity mechanism, the lease being a
courtesy lock against two members editing at once.

BOB'S CORRECTION, AND IT REACHED BACK THROUGH EVERYTHING BUILT TODAY. The primary
audience is NON-TECHNICAL, and the purpose of the workflow is to remove members
from logistics and nuance so they work at a higher level. The complications found
this session are technical complications and do not require human confirmation.
Recognise the patterns for what they are: mechanical artifacts of the host's tech
stack, ads, and other elements that vary every time a document is rendered.

That condemned three surfaces built earlier the same session, each of which had
turned a mechanical problem into a member-facing question, and each of which felt
like honesty at the time. The unfinished-capture dialog asked a member to choose
between recording an unfinished capture and writing nothing, which is asking
somebody researching a sewer fund to arbitrate a subrequest ceiling. The
already-held dialog asked whether to add a second copy. The address-match dialog
said "nothing here can tell those two cases apart, so nothing here will claim
to", which is abdication wearing honesty's clothes: the system CAN tell them
apart, and saying it cannot while handing the member the decision is worse than
either.

ALL THREE ARE GONE. The classifier decides and the surface reports. An unfinished
capture is recorded, labelled on its own page, and picked up later. A document
already in the record produces one sentence and then opens it. A genuinely changed
document is added, and its own text says which earlier capture it follows.

WHAT WAS BUILT INSTEAD: civicos-ui/volatile.mjs, five families of per-render
mechanism, each entry either measured in a real capture or a documented
per-response mechanism of a stack municipal publishing runs on. Server page state,
security tokens, visit identifiers, version stamps on design files, advertising
and analytics slots. Normalisation runs on a COPY so identity stays raw and a
misclassification can never destroy evidence; what was normalised is recorded with
its family, count and byte volume, because a difference that is not a change is
still an observation and a page whose page state stopped moving would be worth
knowing. A family is only added on measurement, since a careless family HIDES A
REAL CHANGE, which is the only failure here that matters.

VALIDATED BOTH DIRECTIONS, on the live record rather than a fixture. Two captures
of the same Legistar calendar held in the store: 368,904 bytes each, different
hashes, and the classifier calls them the same document, normalising 115,980 bytes
of page state and reporting one artifact family in plain words. One altered word in
the same document still comes back changed. The test asserts both, because a check
that only ever says "same" passes by being useless.

AND A VOCABULARY GUARD, which is how the ruling survives the next session. The
harnesses scan every member-facing string, the unfinished banner, the reuse
disclosure, the still-to-collect list and the Add form, for a list of words a
reader should never meet: subrequest, runtime, manifest, register entry,
corroboration, sha256, viewstate, content_hash, content-addressed, op=, ceiling.
Plain language erodes one helpful clarification at a time, and an assertion is the
only thing that holds it.

ARCHITECTURE, AT BOB'S DIRECTION, BECAUSE THE INCREMENTAL FIXES HAD SPREAD. Each
newly-discovered rendering variation had been getting another special case bolted
onto the capture path, and Bob called it: time for a structured, efficient,
extendable design that recognises what KIND of document this is, probably by
determining the host's tech stack, with a handler per type. Two requirements drive
it. A rendition must be perceived as rendering MEANINGFULLY THE SAME as the
document does on its host, because members present portions as evidence and the
system must be believed when it says the evidentiary portions match. And the system
must recognise when something meaningful in the evidentiary portions has changed,
and equally when it has NOT.

docs/development/DOCUMENT-PROFILES.md is the design of record; docprofile/ is the
implementation; civicos-ui/test/docprofile.test.mjs is the harness at 52
assertions. The flat volatile classifier built earlier the same day is DELETED and
superseded by it.

THREE REGIONS, which is the correction over the single stable digest. EVIDENTIARY,
the substance a member would quote. PRESENTATIONAL, furniture that is really on the
page and is not the document's claim about its own subject. MECHANICAL, per-render
machinery. Three digests follow: identity (raw bytes, the capture's name),
rendition (mechanical normalised, "would it look the same"), evidentiary (furniture
normalised too, "has the substance changed"). Five verdicts fall out and the
harness asserts every one on real bytes: identical, unchanged, restyled, changed,
undetermined.

MEASURED, THREE SOURCES, THREE DIFFERENT SITUATIONS. Legistar on ASP.NET WebForms:
31.4% of the document differs on every fetch, all of it viewstate, so byte
comparison reports change constantly and therefore reports nothing. Oaklandside on
WordPress behind nginx: two fetches BYTE-IDENTICAL, which corrects an assumption
this codebase was drifting toward, that churn is a property of the web rather than
of the stack. OpenGov: stable bytes, zero anchors, no prose, a technically perfect
capture that is evidentially worthless and the only failure here that is silent.

THE BOUNDARY BEAT THE FURNITURE LIST, and measurement is why. Legistar emits no
<nav>, no <header>, no <footer> at all; its furniture is ASP.NET control divs with
generated ids, and the rule that guessed at those ids normalised 303 BYTES OF A
369KB PAGE while looking like it worked. What the page carries is one <main
role="main">. So a handler may declare the document's BOUNDARY and everything
outside it becomes furniture in one stroke, which is both simpler and safer:
listing furniture means anything unlisted silently counts as substance, while
naming the boundary means anything outside counts as furniture. A boundary that
misses normalises NOTHING and records that it missed.

A MISCLASSIFICATION CAUGHT BY THE MEASUREMENT, and it is the dangerous kind. The
WordPress handler first tested content markers before the address and classified
oaklandside.org's FRONT PAGE as an article, on markup the theme puts on every page.
On a listing the articles ARE the substance, so the furniture rules would have
normalised the entire document and reported every front page as unchanged forever.
The address is now asked first. The harness pins it open.

THE FAILURE ASYMMETRY IS WRITTEN DOWN AND GOVERNS EVERY DEFAULT. Reporting a change
that did not happen costs attention; failing to report one that did puts a false
claim in the record, discovered if ever by the party it is aimed at. So an
unrecognised document gets the conservative handler, whose only rules are
DEFINITIONAL rather than observed (a nonce that repeated would not be a nonce); a
handler applied without CERTAINTY returns undetermined rather than claiming the
substance is unchanged, since ASP.NET also serves pages with no viewstate; and the
noise the conservative handler makes is the SIGNAL that a source needs measuring.

FIDELITY NOW HAS LEVELS, which is what "meaningfully the same" means in code.
Faithful, degraded (only decoration missing, named on screen and not hidden), and
insufficient (something render-critical missing, render refused). The predecessor
refused on any missing part, which is right for a stylesheet and wrong for a footer
icon. Under the conservative handler every missing part is still critical, which is
correct in ignorance.

MONITORING IS NOW A DIFFERENT CONTRACT PER DOCUMENT KIND, at Bob's ruling. A
Legistar calendar changing is the calendar working; a detail page changing is an
event. Applying the record's contract to an index is what turns monitoring into
noise on exactly the pages BIO watches most: an index moves whenever the body it
indexes does anything, so a substance check fires constantly, gets ignored, and the
one change that mattered arrives in the same stream as the rest.

Three contracts. SUBSTANCE for a record, an article or a page: the evidentiary
digest, any change an event, furniture a notice. MEMBERSHIP for an index whose
handler can read its entries: which entries are present, and whether each entry's
line still says what it said. UNMONITORABLE for a shell, which says so rather than
reporting unchanged forever while the figures behind it move.

MEMBERSHIP EVENTS, ordered so a report leads with the worst thing. REMOVED is an
event and is close to the reason this system exists: a public record that was on a
public list and is no longer on it, which NO substance check anywhere would surface,
not on the index where it is one row among dozens and not on the record's own page
which may still serve perfectly. ALTERED is an event: a meeting cancelled, a status
moved, or a document swapped under a heading that did not move. ADDED is routine.

MEASURED, and the measurement is the argument. Calendar.aspx carries 41 rows inside
<main>, 18 with a stable MeetingDetail ID, and FIVE OF THOSE EIGHTEEN READ
CANCELLED. A member watching the Rules and Legislation Committee needs that
cancellation, and it was invisible to both checks that existed before: a substance
check on the page reports it in the same breath as a meeting scheduled three weeks
out, and a substance check on the committee's own page does not see it at all. All
five outcomes were then verified against the real bytes, including the quiet
substitution: swapping one View.ashx agenda id under an unchanged title is caught,
because a row's digest folds in its document links.

BOTH SAFEGUARDS ARE ABOUT THE NEGATIVE CASE, which Bob named as equally important.
Confirmation is reported POSITIVELY: "all 18 entries are still present and
unchanged" is a stronger claim on an index than the same words about a record,
because an index is expected to move, and it is a dated first-party statement that
nothing was quietly withdrawn. And extraction failure claims NOTHING: a reader that
finds no entries has failed rather than discovered an empty list, and reporting a
mass removal there would be catastrophic and confident.

FLATTENING CAUGHT A BUG THE MODULE SYSTEM WAS HIDING. index.mjs and monitoring.mjs
both declared a top-level RANK, which is legal in modules and fatal once bundled
into one scope: the whole runtime and all twelve harnesses failed at once while each
module tested green alone. The bundler now refuses any duplicate top-level name,
which is cheaper than debugging it downstream.

RECOGNISING CHANGE IS NOW LAYERED, at Bob's ruling, and the layering is not
tidying: it exists because a false positive was living in the seam. Six layers,
each cheap relative to the next, each able to settle the question, with a trail
recording where reasoning stopped because a verdict whose depth is invisible cannot
be audited. Which stack. Whether anything differs at the byte level, and if not
that is NOTED. Whether the difference is noteworthy. What TYPE of content changed.
Whether the change is meaningful for that type. What connections it implies.

CONTENT TYPE IS A SEPARATE AXIS FROM STACK, and the earlier version had them fused.
A meeting calendar served by Legistar on ASP.NET and one served by Granicus are the
same kind of thing built two ways: "what counts as a meaningful change" has one
answer for both while "which bytes are machinery" has two. Hanging kind() off the
stack handler meant every new stack re-answered every content question.

THE FALSE POSITIVE THAT FORCED IT. MEASURED: the Legistar calendar's visible range
is "This Month", read from the control's own value, spanning 6/29 to 7/31. THE
WINDOW IS RELATIVE TO NOW. So a check a week later sees a different set of meetings
because some have scrolled out, and the membership diff built earlier the same day
reports those as REMOVED, which is the heaviest signal this system has and is
reserved for a public record being delisted. A meeting leaving the visible window is
not that, and no amount of care about bytes or furniture could tell them apart,
because the distinction is about what a calendar IS. Absence is now a delisting only
when the meeting's own date falls inside the range the new capture shows; outside it
absence is silent; and when the window cannot be read the verdict is
possibly_delisted, because neither claim is established.

THE CALENDAR TYPE, written from that page and nothing else. 18 meetings keyed by
stable MeetingDetail ids, 8 CANCELLED, 11 agendas and 10 minutes carrying View.ashx
type codes with AADA and MADA as accessible variants of the same document rather
than separate documents. Events are graded: delisted, cancelled, rescheduled, moved
and a document REPLACED or WITHDRAWN are events; a body being renamed is a notice; a
document ARRIVING and a meeting being scheduled are routine, because those are the
normal course of business. Two safeguards on the negative case: a read that finds no
meetings is a failed reader and never an emptied calendar, and the status word is
stripped out of the body name because Legistar writes it into the title, so leaving
it in makes a cancellation move two facts and report a spurious rename beside the
real event.

REFERENTIAL AND TEMPORAL CONNECTIONS ARE DIFFERENT THINGS and are emitted as
different kinds. Referential says two documents are ABOUT each other and is followed
to understand scope. Temporal says one thing happened after another, is strictly
directional, and is followed to understand a story; its most valuable form is an
ABSENCE WITH A DUE DATE, because minutes that have not appeared three weeks after a
meeting are a fact about the body rather than a gap in the record. Measured on the
real page: 39 referential and 11 temporal from one calendar. Nothing is owed for a
meeting that did not happen, so a cancelled meeting emits no missing-minutes fact,
and an upcoming meeting with no agenda emits a different absence dated to the
meeting itself.

THE BUNDLER CAUGHT TWO MORE BUGS THE MODULE SYSTEM HIDES, having caught one already.
A second duplicate top-level name (RANK again, in the doctype registry), and a
re-export form the stripper did not handle, which is not a subtle bug but a
SyntaxError in the runtime and all thirteen harnesses at once. It now refuses
duplicate names AND refuses any module syntax surviving the flattening.

THE LESSON OF THE SESSION. Reading the plane's SOURCE rather than the docs'
description of it caught four things before they shipped, and running against the
LIVE plane caught three more that no fixture would have. An anchor's recorded
address is the document's own with the element split off, so the row was about to
print the page's own URL on every in-page reference. platform.limited is FALSE on
a run that stops at a ceiling it already learned, and being refused is a
different fact from deferring in advance of a remembered refusal. The suite is
where both kinds of knowledge now live: link-surface.test.mjs holds the fields the
UI reads against the plane's own resolveLinks source, so a rename there fails
here, and add-surface.test.mjs runs what the surface assembles through the plane's
own checkBundle.

WHAT IS STILL NOT EXERCISED. Nobody has driven the Add surface from a BROWSER: the
live promote went through the UI's own assembly helpers called from Node against
the live plane, which proves the code and not the form. The member token is a
machine credential (session:false, capabilities:null), so canContribute() is false
for it and the surface correctly renders no form, which is the capability shaping
working rather than a defect, and it also means the browser half of U8's
acceptance needs a member or administrator session.

# CivicOS Layer 3 UI: state and next-session kickoff

v28, 2026-07-29 session, part twenty-six, closing the session. NINE PLANE
RELEASES, 0.36.0 through 0.45.0, each signed, deployed byte-identical, audit
30/30 clean. U7 done. v27 above covers 0.36.0 to 0.41.0; this covers the rest
and the measurements, which mattered more than the code.

0.42.0 LINK RESOLUTION AND THE THREE-VALUED VERDICT. captured_locators answers
the question nothing could: does the store hold a capture of this address? The
register is keyed by hash and carries no locator. One row per (address, DISTINCT
BYTES) carrying the INTERVAL those bytes were seen served, because identical
bytes observed on BOTH SIDES of another document's retrieval prove the target did
not change across it, and that settles contemporaneity without leaning on any
timestamp the source supplied. A first draft kept one date per sha and threw away
exactly that evidence. links, address-keyed. link_verdicts, appended and dated.
op=links computed at READ TIME, because which partition a link falls in depends
on what the record holds today.

0.43.0 ELEMENT REFERENCES. Bob ruled that scientific and legal practice cite
ELEMENTS and BIO citations support element references, so an anchor is part of
the citation. That exposed a defect shipped the day before: normalizeAddress
drops the fragment, which is right for a RESOURCE and wrong for a CITATION, and
keying links on the resource form made #findings and #methodology in one report
indistinguishable. Two keys now. Live on a Legistar calendar: one resource cited
28 different ways, which under the old key was one row.

A LIVE-MIGRATION HAZARD caught before it shipped. CREATE TABLE IF NOT EXISTS
cannot add a column, so the deployed links table would have kept its old shape
while the code wrote the new one. Derived tables now get a reshape pass, correct
there and only there because links is regenerable from the captures. The reshape
must run BEFORE schema application: dropping afterwards meant the new CREATE
INDEX hit the old table and threw inside blockConcurrencyWhile, which does not
fail a test, it BRICKS THE DURABLE OBJECT.

0.44.0 A WORKER CANNOT TIME ITSELF. Bob asked for CPU to be determined
empirically as fetch limits are. The meter timed synchronous segments with
Date.now() and reported ZERO for every segment of every real capture: Cloudflare
FREEZES THE CLOCK during synchronous execution as a timing-attack defence, so
nothing inside a Worker can measure its own compute and any millisecond figure
reported from inside one is a fabrication. Consumption is now counted in WORK
(calls, bytes) and the ceiling in REFERENCE ITERATIONS. The asymmetry with
subrequests is the design constraint: a refused subrequest throws and is caught,
while exceeding CPU TERMINATES the isolate, so the probe checkpoints durably
after every step and the trail is the whole record.

MEASURED on Workers Free: the probe completed 20 steps of 2,000,000 iterations,
40,000,000 total, killed during step 21 with HTTP 503 error 1102, trail intact.
The documented free figure is 10ms of CPU and 40 million modular multiplications
is not 10ms of anything. Real captures are nowhere near it: the heaviest, a news
front page, does 49 compute calls over 16.97MB. CPU is NOT a binding constraint.
D-56 stays open as a watch item with no task, because a CPU overrun can never
announce itself.

0.45.0 links_to JOINS THE VOCABULARY. The only relation there that is not a
member's act. C-6.1 requires asserted_by 'source', the address as a comment
string, and a verdict, because undetermined must be STATED rather than omitted.
projectLinks drops self-edges. A THIRD STATE inside 'linked', found by a test
failing: a link can resolve fully and still not project because no bundle has
registered the target's bytes, which is every acquired-but-unpromoted capture.
Reported as skipped_unregistered rather than a silent zero.

RULINGS SETTLED THIS SESSION, do not re-ask. Source addresses are NOT exempt from
canonical identity; the address is a comment string on a canonical-ID citation.
undetermined is first-class. A superseded link offers the capture the record does
hold, labelled. Re-fetch at ratification is MANDATORY, meaning the attempt and
its outcome are recorded, not that ratification requires a matching answer.
Cascade may run unattended behind the ratification fence. The cascade objective
is its own stored object. Chrome links are cascade-considered only when the
objective judgement reaches for them. site_chrome is a derived table. Workers
Paid is an optimisation and NEVER a requirement. JS-rendered content IS the
content and must be captured as evidence, at the SAME GRADE as the rest of the
document, because the JS render happened in the site's own execution environment
at capture time while the HTML/CSS rendition is rendered later in the reader's.
Third-party script output, if it is evidence, is evidence PRODUCED BY THAT THIRD
PARTY. Element references are part of citations.

A CORRECTION WORTH CARRYING. Browser Rendering is NOT paid-only: Workers Free
gets 10 minutes a day, Paid 10 hours a month. A requirement was nearly written
into the installer on the strength of my wrong claim. Bob is delaying the
subscription; the free tier remains the supported configuration and the one he
exercises daily, which is the right way to keep it from rotting.

THE LESSON OF THE SESSION, twice over. A continuation suite drove
captureSubresources DIRECTLY, 22 assertions green, while op=acquire threw 1101 on
every page big enough to need a session. A unit test that never crosses the
surface the caller uses is not testing the feature. The capability-table
assertion also caught two separate attempts to put a non-session-reachable op
into the table that must name only session-reachable mutating ops. Structural
assertions earned their place this session more than any test written by hand.

WHAT THE UI CANNOT SEE. The plane is six releases ahead of the viewer. A member
sees no partitioned links, no verdicts, no warning before leaving audited
content, no sign that a capture is incomplete or that parts were reused from an
earlier fetch. That is the next session's work.

v27, 2026-07-29 session, part twenty-five. SIX PLANE RELEASES AND U7. Plane
0.36.0 through 0.41.0 shipped, each signed, deployed byte-identical, audit
30/30 clean. U7 is DONE and marked in UI-PLAN.md.

0.36.0 CAPTURE FIDELITY. op=acquire gains subresources:true. Every
stylesheet, image, srcset candidate, favicon, media source and script the
page names is fetched over the same public-https fence that guards the
primary locator, hashed, stored as its own content-addressed capture. RAW
bytes are never rewritten: a SEPARATE derived render companion carries its
own hash, has scripts and frames removed, and replaces every subresource
reference with about:capture#<sha256> resolved through
data/snapshot-manifest.json. A content security policy travels inside the
companion, so a copy that escapes a resolving viewer renders blank rather
than reaching the network. Links are characterised into partitions rather
than blanked or left live. C-18.1 gains a renditions arm; `derived` was
already spent on the opposite claim.

U7 VIEWING SIDE. resolveSnapshot verifies every part by hash before it
reaches the screen and refuses the whole render on one bad byte. data: URIs
not blob:, because the sandboxed frame has an opaque origin and cannot read
a blob this document minted.

0.37.0 THE DOCUMENT BOUNDARY. Refs carry body or furniture from
<article>/<main> vs <nav>/<footer>/<header>/<aside> and ARIA landmarks;
body wins anywhere on the stack because <footer> inside <article> is the
article's byline. Stylesheets and anything a stylesheet names are kept
regardless of region: splitting them needs a layout engine, not a parser.
srcset collapses to its largest candidate with src as a family member.
Third-party scripts, images and media are not fetched, which is the
advertising cut and the same test rather than a special case.

0.38.0 THE CEILING IS DISCOVERED, NEVER DECLARED. 0.37.0 shipped
SUBRESOURCE_CAP = 45 with a comment reading "50 on this account", which is
a guess about somebody else's infrastructure wearing the clothes of a
constant. Our appetite and the runtime's capacity are now separate values.
On the first refusal the run records the count and stops; the rest become
DEFERRED, outstanding rather than failed, because nobody asked the source.

0.39.0 THE CEILING IS REMEMBERED. capture_limits, with previous and moved_at
because a ceiling that MOVED is a different fact from a ceiling that IS.
scripts/deploy.mjs believes only the bytes: it reports what the API said and
reads the module back to compare against the signed asset.

0.40.0 PER-SITE SHARED ASSETS. site_assets and site_asset_refs. Bytes were
always shared by content-addressing; FETCHES were not, and fetches are the
scarce thing. Reuse is furniture only, never an image inside the document
and never a script, and every reused part carries fetched_this_capture:false
and names when the source was last seen serving those bytes. Recurrence
chrome detection falls out of the same table and works on the municipal
sites that never write a <nav>.

0.41.0 RESUMABLE CAPTURE. capture_sessions, scratch with an expiry, naming
no bundle. The queue is parked rather than rediscovered. A heavy first
capture of a news front page now completes in three ticks.

MEASURED, and the measurements changed the design three times. www
.oaklandca.gov returns 403 to the plane on every path including robots.txt,
while data.oaklandca.gov and oaklandca.opengov.com still answer: the record
holds captures nobody can re-fetch, which is the circumstance the project
exists for. USER-AGENT POLICY IS DEFERRED pending Bob's counsel; disguising
the fetch is refused. The 40-subresource cap truncated every real page. 383
of 566 references on a news front page were duplicate srcset renditions.
Reuse gated on stability reused NOTHING, because a fresh instance has no
stability history; the condition is recency of FETCH.

THE LESSON WORTH KEEPING. The continuation suite drove captureSubresources
DIRECTLY, 22 assertions green, while op=acquire threw 1101 on every page big
enough to need a session: sessionId was block-scoped inside the capture
branch and the response literal reading it sits outside. A unit test that
never crosses the surface the caller uses is not testing the feature. Two
sibling defects the same day: a temporal dead zone that only fired on pages
with <a> elements (the fixture had none), and link dedup rebuilt empty each
tick. All three are now covered end to end through the op.

STILL OPEN, and it is the last of Bob's five: links are partitioned,
wrapped and inert, but nothing resolves a deferred address into a citation.
No links_to in REL_VOCAB, no links table, no reverse index, no three-valued
verdict. LINK-FIDELITY.md carries the design and Bob's rulings.

v26, 2026-07-28 session, part twenty-four, closing the session. THE PLAN OF
RECORD NOW EXISTS: docs/development/UI-PLAN.md lays out the full UI
development arc as a ladder, U1-U6 DONE (foundation, record surfaces,
document page, verified opening, release flow, liveness and the permanent
test discipline) and U7-U14 REMAINING (capture-fidelity viewing, the Add
surface, triage and cite, the crucial path, members, the published surface
G1, phone parity, hardening), each remaining rung with an acceptance test
and dependencies. SESSION-KICKOFF-UI.md beside it carries the paste-ready
initial prompt for the next session (plane 0.36.0 then U7) including the
grant slots; the kickoff file is rewritten at the end of every session so
it is always current. Division of labor from here: UI-PLAN.md is what and
why, this file is the session log of how, UI-KICKOFF.md is Bob's standing
principles.

(v25 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v25, 2026-07-28 session, part twenty-three. MONITORING COLUMNS: the two
monitoring tables replace Updated with "Last checked" (monitor_last_checked
from the search hit) and "Next check" (computed via monitorNext from the
frequency; the frequency word shows when the arithmetic cannot; reeval-only
rows dash both). Both columns sort with the shared mechanism. CONFORMANCE
ANSWER RECORDED (Bob asked whether crucial-while-collected is conformant):
YES. From store.mjs: cite refuses only non-Information targets and never
checks current_state, so collected Information is citable; criticality is a
declared frontmatter stance at promotion, not derived from citations; the
one hard crucial rule is CRUCIAL NEVER RIDES A BATCH. Declaring crucial
before verification is the design working as intended: it forces the
individually co-attested release path for the material that matters most.
If Bob ever wants "citation targets must be verified" as policy, that is a
new refusing arm in cite, a plane change to weigh deliberately.

(v24 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v24, 2026-07-28 session, part twenty-two: origin-scoped search. A search
launched from a typed page stays in that page's world: Focuses searches
type:focus, Projects type:project, Review state:collected (all as terms in
the plane's own query language, confirmed against query.mjs's filter
vocabulary), and Monitoring filters client-side on monitor_enabled or
reeval_flag since it is an or-of-flags. Scope predicates ride along so the
op=list fallback path honors the scope identically. The results line names
the scope with a "search everything" widen link (also offered on empty
scoped results); an empty search returns to the ORIGIN page, not always the
record; the remembered-search nav restore carries the scope. LESSON PAID
FOR A THIRD TIME and now a rule: every s.replace on app.html gets an
assert; the scope initially never reached the plane because a patch
targeted an api() call that is really rec() and no-opped silently. The
record-list harness drives the scoped path end to end (from Focuses, the
plane query carries type:focus and the results line names the scope).

(v23 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v23, 2026-07-28 session, part twenty-one, Bob's three. Focuses and Projects
lists drop the Type column (single-type lists; the sortable table takes a
showType flag). Review converts its collected chips and the crucial mark to
the SAME seals as everywhere else (the crucial seal replaces both the crux
text in the pick column and the word chip beside titles), and its Item,
State, and Updated headers sort with the shared mechanism; a sort repaint
preserves a selection in progress exactly like the liveness repaint does.
Monitoring's two sections (Needs a second look, Watched sources) gain full
sortable headed tables; one sort governs both, and the Type column stays
there because those lists can mix types.

(v22 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v22, 2026-07-28 session, part twenty. TYPE_LABEL for information shortened
to "Info" everywhere the label renders (the Type column, filtered lists,
the document page's cited-by rows). Harness updated.

(v21 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v21, 2026-07-28 session, part nineteen: the record list, Bob's four. An
identity band tops the list page (verdigris-dk from the palette; umber
stays the document page's). A Type column joins Item, State, and Updated
(the type label leaves the title cell). Every column header sorts:
ascending on click, flipped on a second click of the current column, with
an arrow on the active header; sorting is per-screen and resets on
navigation; the filtered lists (Focuses, Projects) share the same sortable
table. State indicators are now the SAME seals as the document page, with
the same hover strings and click-over disclosure (word chips everywhere
also gained hover titles); crucial shows as its seal beside the title. New
record-list harness asserts the band, the Type column, both sort
directions with arrows, and the seal indicators.

(v20 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v20, 2026-07-28 session, part eighteen. Default collapse revised by Bob: In
the case opens EXPANDED; only Trust and The record open collapsed (with
Session Log, Review Notes, and Source Material still folded within the
prose). Harness updated both ways.

(v19 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v19, 2026-07-28 session, part seventeen. "Source Material" (title case), and
its heading now matches Session Log and Review Notes exactly: those are the
document's own ## headings styled by the prose rules (19px record serif),
while the built heading had been the smaller structural h2.sec (17px). The
built subsection heading gets its own ch2 class carrying the prose
subsection treatment, so all subsection titles on the page read at one
size. Harness asserts the class and the title.

(v18 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v18, 2026-07-28 session, part sixteen. "The source material" renamed to
"Source material", and it now opens collapsed like Session Log and Review
Notes; the primary document remains one gesture away through the tab bar's
Open-the-document link regardless. Harness asserts the rename and the
default state.

(v17 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v17, 2026-07-28 session, part fifteen. Default collapse states: a document
page opens with What it says expanded and In the case, Trust, and The
record collapsed; within the prose, Session Log and Review Notes open
collapsed (matched by heading title, so it applies to any bundle carrying
them) while Summary, Provenance Notes, and other headings open expanded.
Selecting a collapsed section's tab scrolls to it AND expands it in the
same gesture, with the tab and the stratum's verdigris rule marked active
immediately rather than waiting for the scrollspy to catch up. The
document-page harness asserts the default states both ways (closed strata
closed, s1 and Summary open, Session Log closed).

(v16 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v16, 2026-07-28 session, part fourteen: search, round two. The stepped-on
icon and clear control were the input's own focus ring drawn inside the
field row; the ring moved to the FIELD (focus-within on the .msearch
wrapper, inner input outline suppressed), so it now wraps icon, text, and
clear as one control. ONE SEARCH BOX EVER: the masthead's on desktop (the
Search screen shows none), the screen's own on phones where the masthead
search is hidden; searchEl() picks the visible one, values mirror on run,
and the results line names the query ("2 results for \u201Csewer 2025\u201D").
Long queries follow the researched standard for single-line inputs: the
masthead field grows on focus (200 to 400px, quiet transition), text
ellipsizes when blurred, and editing relies on the input's native
horizontal scroll (browsers deliberately drop the ellipsis on focus so it
never fights the caret; css-wg text-overflow discussion, Gecko/WebKit
behavior).

(v15 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v15, 2026-07-28 session, part thirteen: search, Bob's four. The mangled
"running" indicator was the magnifier icon clipped: the sprite is drawn on
a 20-unit grid and the inline viewports never declared a viewBox, so it
truncated to a C in both the masthead and the search screen; viewBox added
everywhere the icon renders small. The Run button is gone (Enter runs; the
screen's box autofocuses). Both search boxes gain a clear \u00d7 inside
their right edge, shown only when there is text, clearing and refocusing
(and on the search screen, clearing the results). An EMPTY search (Enter on
an empty box, from either box while on the Search screen) returns to the
record with the cursor waiting in the masthead search box.

(v14 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v14, 2026-07-28 session, part twelve. Disclosure triangles: every stratum
title (the eyebrows) and every subsection title collapses and expands its
own contents. Subsections come from two places and both get the gesture:
the document's own ## headings (Summary, Provenance Notes, Session Log,
Review Notes) via mdLite, which now wraps each heading's run in a csec with
a triangle, and the built headings (The source material) via the sec2
helper. Built structurally in the templates, not DOM surgery, so the
harness asserts the shapes. A tab click on a collapsed stratum reopens it
before scrolling. The Release heading at the bottom deliberately keeps no
triangle: an action area should not fold away. State per page, not
persisted.

(v13 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v13, 2026-07-28 session, part eleven. The Open-the-document control moved
from a header button into the tab bar's final entry, after The record,
dressed as a link so its nature is legible: verdigris semibold with an
outward arrow, a hairline separating it from the strata tabs, hover
underline, and no underline-tab behavior (the scrollspy never activates it).
Same behavior as before: a browser tab for what renders, a native download
otherwise, verification silent until it refuses. The title row simplifies to
the title alone. Suite updated and green; the open tab now announces stale
builds itself (v12), so this is the first change shipped under that regime.

(v12 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v12, 2026-07-28 session, part ten: the missing tag was a stale tab, and the
app now tells you.

**Changelog v12.** Bob reported the type tag absent. Root cause: his open
tab was running the app instance loaded before the v11 deploy; the SPA never
reloads between deploys, so an old build keeps navigating live data.
Definitive proof before any code was touched: the LIVE served page code was
rendered against the LIVE data of the exact bundle in his screenshot and
produced the pdf tag and the "Released by bob" fact. The recurrence gap is
closed per the alive principle: the build step now injects a build id (12
hex of the app source's sha256) into both the page and the worker, the
worker serves it at /build (no-store), and an open tab checks every five
minutes while visible; when a newer build is serving, a quiet "Updated \u00b7
reload" button appears in the masthead. THE CANONICAL BUILD STEP CHANGED:
compute the id, inject __BUILD_ID__ into app.html bytes AND the template,
then base64-embed (see the build block in this session's transcript; the v1
snippet's plain embed is superseded). Also: a piped test invocation let a
shim-only failure slip past one deploy (exit status was grep's, not the
suite's); run `node test/run.mjs` bare, never piped, before deploying.

(v11 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v11, 2026-07-28 session, part nine: facts from the record's real shapes; the
type tag.

**Changelog v11.** The verified seal's document fact was silent because the
fact parser was built on INVENTED promotion-record fields (to_state, member,
acknowledgment); the real records carry target/base/files/created/author and
nothing else, and the who-released-it narrative lives in bundle.md's own
Session Log headings ("### Session DATE | TITLE | AUTHOR"). The fact now
reads the Session Log (releaseFact: the entry whose title says released /
collected to verified / ratification), verified live against the ACFR
bundle ("Ratification: collected to verified | bob"). Promotion records in
stratum four render their real fields (author, created, files count) as
"revision recorded" entries. The document-page harness fixture now mirrors
the record's REAL shapes so invented-field parsing can never pass again. NEW:
a file-type tag (pdf, html, csv, ...) sits beside the seals, derived from
the primary artifact (with .b64 wrappers stripped), speaking its filename,
size, and parts on hover and click-over from a FILETYPES table. An ordering
bug found on the way: PRIMARY_K was computed after the seals string was
built, so the tag could never have rendered; sources and the primary
artifact now precede the seals.

(v10 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v10, 2026-07-28 session, part eight: the two clarifications.

**Changelog v10.** THE SCROLL WINDOW IS THE AREA BELOW THE TAB BAR, as Bob
meant it. The document header (band, crumb, title, open control, tabs,
seals) is no longer a sticky element inside the page's scroller; the page is
now header plus its own scroll box (#docscroll) holding the strata. Nothing
can appear above the band, ever, because the region above the band does not
scroll; the sticky and negative-margin machinery is gone, the scrollspy
watches the document's own box, and navigation remembers and restores
whichever box scrolls on the current page (scrollBox()). CAPTURED HTML OPENS
IN A REAL BROWSER TAB, as Bob meant it, like any link. Safety moved from
the inline sandbox into the bytes: scripts, inline handlers, and
javascript: references are stripped before the rendering blob is created
(the RAW capture in the record stays untouched and is what the download
gives), and the tab is severed from its opener before it loads. The
document-page harness now asserts the structure (every stratum inside the
scroll box, the band in the fixed header, none leaking above) and the
artifact harness proves the sanitizer strips scripts, handlers, and
javascript: while preserving content, styles, and image references.

(v9 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v9, 2026-07-28 session, part seven: a production break, its root cause, and
the durable fix.

**Changelog v9.** The v8 deploy broke every document page ("Could not reach
the plane", which is errPane dressing a ReferenceError). Root cause: the v8
slice-replace that installed the link-style openArtifact was bounded "from
openArtifact to openBundle", and parseLog, renderLogEntry, lineDiff, and
toggleDiff sat between those anchors; the replacement deleted all four. The
harnesses missed it because none drove openBundle end to end. Fix: the four
functions are restored from the v3.3 commit, and the testing hole is closed
for good: the harnesses moved from /tmp into the repo as civicos-ui/test/
(six .test.mjs files, extract.mjs reading app.html directly, run.mjs running
everything plus the semantics check), including a NEW document-page harness
that renders the full page against a realistic stubbed plane (prose, bundle
glossary, chunked pdf, promotion log, revision, projection with references)
and asserts every element of the page: frozen header, open control, the
three fact-carrying seals, both glossary layers, the session log with the
member's acknowledgment as speech, revision compare, artifact links, trust
hashes, cited-by rows, and all four strata. Run `node test/run.mjs` before
every deploy. ALSO: per Bob, no more per-turn zip deliverables; the repo and
the live deploy are the delivery.

(v8 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v8, 2026-07-28 session, part six: Bob's five, round two.

**Changelog v8.** THE FROZEN HEADER: the sticky region is now everything
above the content, as Bob meant it: band, crumb, title, and the tab bar
freeze as one unit while the strata scroll beneath; anchor scrolling and the
scrollspy account for the header's measured height. SEALS SPEAK THE
DOCUMENT'S FACTS: the verified seal names who released it and when (read
from the bundle's own promotion log), the crucial seal names the cases it is
load-bearing for (from reverse citations), and the monitored seal gives the
last re-check and the approximate next one (computed from the monitor
frequency); the general meaning from SEMANTICS and the instance fact appear
together on hover and in the click-over. OPENING IS A LINK: one verdigris
"Open the document" in the frozen header opens the primary artifact the way
any link would: a new tab for what a browser renders (opened synchronously
so popup blockers never bite), a native download for what it does not;
verification runs underneath and speaks only on failure, when it REFUSES in
the plane's voice. Artifact names in the source-material cards are now plain
links to the same behavior; the fetch-and-verify button and the inline embed
are gone; the hashes live under a quiet "integrity" disclosure. Captured
HTML renders in a sandboxed, scriptless, unique-origin frame so a hostile
capture can reach nothing. BUNDLE-CARRIED GLOSSARY ADOPTED (Bob, today):
data/glossary.json in a bundle layers the document's own terms over the
shared floor for every prose render on its page; the convention is part of
capture from here on. CAPTURE FIDELITY for HTML sources (css and supporting
files captured so the rendition is credible) is specified in
CAPTURE-FIDELITY.md and is the next plane release (0.36.0).

(v7 and earlier follow; all still hold.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v7, 2026-07-28 session, part five: THE DOCUMENT ITSELF OPENS ON THE DOCUMENT
PAGE.

**Changelog v7, and a correction that retires gap G2.** G2 ("the plane
serves no binary blob bytes") was wrong: `op=capture`'s GET arm has served
raw capture bytes by sha256 all along, content-addressed under
`<store>/captures/<sha>`, Range-capable, and every snapshot part was written
to exactly those keys at promotion. The gap was the UI's knowledge of the
plane, not the plane; no plane release was needed and none was made. The
document page now has the viewer: every binary artifact card carries "Open
the document (size)". Opening fetches each part through `op=capture` with a
live progress bar, hashes every part in the browser with WebCrypto, and
compares against the sha the record carries. ONLY VERIFIED BYTES ARE EVER
SHOWN: a mismatch renders a refusal in the plane's voice (REFUSING TO
DISPLAY, expected vs got) instead of the document. On success: a verdigris
"every byte verified against the record" line, the PDF inline in an embed
(images inline as images; .tsr and unknown types verify-and-download), and a
download of the same verified bytes under the original filename. Proven
live end to end: both parts of the 41.5MB FY23-25 budget book fetched
through the civicos proxy, both shas identical to the record, and the
reassembled file is a well-formed PDF (%PDF header, %%EOF trailer). Harness
covers part ordering, concatenation, the integrity refusal, and the
missing-capture reason; all prior harnesses and the semantics check stay
green.

(v6 and earlier follow; all still hold, except G2 which is retired as
mis-diagnosed.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v6, 2026-07-28 session, part four: Bob's five fixes from the live document
page.

**Changelog v6.** THE ROOT CAUSE FIRST: #work used min-height:100vh, so a
tall page scrolled the whole body instead of the content pane. That single
bug produced two of Bob's five reports: the rail and tab bar scrolling away
(nothing could stick because the pane they stick within never scrolled), and
the strata strips staying grey past the first (the scrollspy watches the
content pane, which never moved). The grid is now height:100dvh with
min-height:0 on the scroll children; the rail and tab bar hold, and the
strips follow the reader. The rest: BACK moved to the masthead at top level,
left of the wordmark, bigger (21px), appearing whenever there is somewhere
to go back to; the crumb is a location line again. Back now restores the
EXACT scroll position through a settle-proof restore (set, two animation
frames, and a 120ms re-set, because web-font reflow was clamping the offset
set at first paint), the browser back button and the in-app arrow converge
on one stack without double-popping, and a Search screen on the way back
re-runs its remembered query so the result list the reader was working
through comes back scrolled to where they were. CHIPS became SEALS: the
document's states now render as single-mark stamps (V verified, ! crucial,
M monitored, and marks for every state in the semantics table) riding
right-justified in the sticky tab bar, so load-bearing state never scrolls
away; hover names them, click discloses the full semantics row, and the
seal marks live in the SEMANTICS table like everything else. The chips row
left the body of stratum one.

(v5 and earlier follow; all still hold.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v5, 2026-07-28 session, part three: Bob's eight document-page refinements.

**Changelog v5, all from Bob's review of the live page:** the strata tab bar's
stray scrollbar is gone and the bar now sticks to the top of the page while
content scrolls, with a scrollspy keeping the active tab true to the reader's
position (tabs scroll to a stratum; nothing is hidden, and the banding makes
that legible). Each stratum is a banded section: a left rule that turns
verdigris as the reader enters it, under a mono eyebrow naming it, so the
content belonging to each tab is visibly delimited without new colors. The
Design page's warm band is captured as an ADDITIVE token (--band, umber) in
tokens.css and tops every document page as its identity. The rail collapses
to an icon-only 56px strip (toggle in the masthead, persisted, tooltips on
icons; hidden on phones where the rail is already a top bar). Back returns
the reader to the exact scroll position of the page they came from, via an
in-app navigation stack wired to the browser's own back button; the crumb
shows where back leads. Tabs, eyebrows, and the docband carry explanatory
tooltips from STRATA_INFO. A GLOSSARY table (sibling of SEMANTICS: same
one-source-of-truth idea) wraps system and civic-finance terms (ACFR, GPF,
FY, sha256, RFC 3161, SSHSIG, manifest, provenance, frontmatter) in rendered
prose with dotted-underline click-overs; the wrapper never touches tags or
attributes and handles compounds like FY23. Document-SPECIFIC terminology is
deliberately not in the UI table; if adopted, it belongs in the bundle at
capture time (open decision below).

(v4 text follows; all of it still holds.)

---

v4, 2026-07-28 session, part two: the record screen rebuilt on Bob's UX
principles.

**Changelog v4: the document page is content-first on four strata, the
semantics table is live with its consistency check, lists are live-updating,
and the working space lays out on phones.**

## New in v4

- **The document page** (openBundle) now answers the reader's questions in the
  reader's order, four strata with an in-page nav: WHAT IT SAYS (state and
  criticality chips, the prose, then the captured source material itself:
  text files including JSON open and render in place; chunked binary
  snapshots fold into one card per artifact with parts, sizes, RFC 3161
  timestamp, and per-part hashes); IN THE CASE (a project's objective and
  work-product state, forward references with their notes, and reverse
  citations computed client-side by walking the projections of every focus
  and project); TRUST (authority, source link, retrieved, source status,
  content and bundle hashes with copy, monitor schedule, and the
  anyone-may-verify sentence); THE RECORD (the session log parsed from the
  bundle's own _history/promotion_*.json, each entry with its actor, its
  move, and the member's recorded acknowledgment and mitigation rendered as
  speech, plus every earlier revision with an in-place line diff against the
  current text). Release stays at the end, after the reading.
- **SEMANTICS** is the one source of truth for presentation: for every object
  type and state in the plane's catalog, plus criticality and flags and the
  two spaces, one row declares the chip, the reader-language meaning, what it
  enables, what it forbids and why, and the legal next states. Every chip is
  a click-over disclosing that row (tap works; nothing is hover-only). The
  block is marker-extractable, and `check-semantics.mjs` fails the build if
  any plane state lacks a row or the table invents a state. THE CHECK PAID
  FOR ITSELF ON ITS FIRST RUN: it caught two invented states ("modified",
  "deactivated") that existed in UI copy but nowhere in the plane; both are
  gone, and Monitoring now reads the real drift signals (reeval_flag,
  monitor_enabled) instead of a state that does not exist.
- **Liveness**: polite 45s polling while the tab is visible; the Record and
  Review lists reconcile in place when the record actually changed, never
  while a dialog is open, and a review selection in progress is preserved
  across an update.
- **Phones**: below 680px the rail becomes a scrolling top bar and everything
  lays out in one column; the strata nav scrolls horizontally. Viewing is
  fully served; judgment surfaces remain best on larger screens, per the
  agreed viewing-MVP posture.
- **Gap G2, named**: the plane serves no binary blob bytes (`op=file` returns
  text or hash metadata only), so archived binary snapshots (the captured
  PDFs) cannot be viewed in the browser yet. The document page says so
  honestly on each such artifact and shows the verify path. A blob-serving
  op is plane-side work, and the public reading surface (G1) will want it
  too.

(For the v1-v3 narrative, op contracts, and deploy procedure, see the v3 text
below; all of it still holds.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v3, 2026-07-28 session: record headings dropped to the canonical token
(--t-rec 22px, inline sizes removed); Bob resolved the open heading decision in
favor of the token/Design value. Bob's standing UX principles recorded verbatim
in UI-KICKOFF.md. (Previously: v2, 2026-07-27 session (doc previously dated ahead; plane is 0.35.0 on biosmoke7,
see BIO_DATAPLANE_STATE.md).)

**Changelog v2: the first write action is wired. Release runs end to end from
the UI: per-document from the bundle page and batch from Review, through
`op=select` (enumerated) then `op=release`, with the doctrine's recorded
acknowledgment and mitigation.** Details below; v1 narrative follows unchanged.

## New in v2: the release flow

- **Review** now loads collected Information via `op=search`
  (`type:information state:collected`, limit 500) because search's provenance
  columns carry `criticality`, which `op=list` does not; the flow needs it to
  keep crucial material out of `op=release` before the plane has to refuse it.
  Fallback to `op=list` if search cannot answer (criticality then unknown; the
  plane's refusal renders verbatim).
- **Batch release from Review.** Checkbox selection (select-all included), one
  verdigris primary that counts the set. The dialog states what a batch release
  is, lists the set, and requires the member to type the homogeneity
  acknowledgment and what they actually checked. Nothing is prefilled: the
  doctrine's record is the member's own words. Client-side validation mirrors
  the store exactly: each field <=500 chars, no quote, backslash, or newline.
- **Per-document release from the bundle page**, placed at the BOTTOM, after
  the prose and history, because the doctrine's reviewer must see the source
  material before the judgment. Same dialog, per-document language.
- **Crucial material never enters the flow.** Any selection containing
  crucial-criticality material is refused whole by the store, so the UI gives
  crucial rows no checkbox and says why: verifying crucial means checking its
  co-attestations, per-document work, surface not built yet.
- **Capability- and session-shaped.** The release affordance EXISTS only for a
  member session holding `contribute` (`canRelease()`); a machine token sees
  the read-only review with the doctrine's own sentence about why it cannot
  release. Absent, not greyed.
- **Refusals teach.** The plane's refusal JSON renders verbatim with offenders
  named (`ENTRY_REQUIREMENTS` lists each document's exact lacks,
  `ILLEGAL_TRANSITION` its current state). `SET_MOVED` refreshes the list and
  says to look again; it is never auto-retried, because refuse-weight means
  the operator looks again.
- **After success** the UI lands on Review with a confirmation card naming the
  released ids and the Session Log record each now carries, and the record
  cache is invalidated so chips show verified.
- The facts card no longer shows `classification` (removed from the catalog in
  plane 0.33.0; frontmatter residue is inert and drains on promotion).
- Flow verified against a stub plane implementing the store's exact contracts
  (select POST shape, release params, refusal shapes, the 500-char rule). The
  harness caught one real bug before it shipped: a local `const go` shadowing
  the router's `go()` in the success path.

### Op contracts added in v2 (verified against src/index.mjs, src/store.mjs)

- `POST /api/?op=select&kind=enumerated&token=T` with body `{ids:[...]}` ->
  `{ok, handle, kind, n, expires, ttlSeconds}`. Owner and viewer are stamped
  server-side from the credential; a selection is readable only by the
  credential that made it. TTL 300s, refreshed on resolve.
- `GET /api/?op=release&handle=H&acknowledgment=A&mitigation=M&token=T` ->
  `{ok, released:[ids], acknowledgment, mitigation, weight:"refuse", drift}`.
  Requires a MEMBER SESSION holding `contribute`; a machine credential is
  refused by the store on the author stamp's shape (MACHINE_CANNOT_RELEASE).
  Only collected, non-crucial Information; refusals carry offenders. Both text
  fields <=500 chars, no quote, backslash, or newline (RELEASE_ACK_MAX).

---

## v1 narrative (2026-07-27, first UI build session)

v1, 2026-07-28. Follows plane **0.35.0** on biosmoke7 (see BIO_DATAPLANE_STATE.md).

**The Layer 3 UI runtime exists and is live, reading the real record from R2.**
Open https://civicos.believeinoakland.workers.dev and it serves the CivicOS
client, which loads the actual 30-bundle working record (the sewer-fund
evidence series, the auditor report, the ACFR statements, the OpenGov transfer
series) from the biosmoke7 plane. It is a real runtime wired to the live ops,
not a prototype. The signed plane and its record are untouched: `op=audit`
reads 30 checked, 30 clean.

## What runs where, and why the UI is a separate worker

The UI does **not** live in the plane. It runs as an isolated dev worker named
`civicos`, which serves `app.html` and forwards `/api/*` to the plane
(`biosmoke7`) through a Cloudflare **service binding** named `PLANE`. The plane
is signed and its deployed bytes are verified identical to the signed release;
injecting UI code into it would break that discipline and put the record within
reach of a deploy mistake. So the dev UI is a separate artifact. For production
the UI folds into the real domain as `believeinoakland.com/CivicOS` once that
zone is in place; the dev proxy worker is scaffolding, not the shipped shape.

The service binding is required, not a preference: a worker cannot HTTP-fetch
another worker on the same `*.workers.dev` zone (Cloudflare error 1042). The
binding routes worker-to-worker directly and avoids it.

## The design source of truth

`civicos-ui/tokens.css` is canonical (Bob's design foundation from the Claude
Design session; the handoff calls it the drop-in deliverable, do not fork the
values). Civic-ledger register: verdigris `#2F6F62` is the only signature
(primary action, verified fill), terracotta `#B3441E` is rationed to at most one
attention element per screen, working sits on `--paper`, published on `--sheet`.
Two spaces are set by `[data-space="working"|"published"]` on the document root.
The fence is a printer's double rule and appears nowhere else. Serif is
judgment, sans is plain speech, mono is machine fact. Chips are lowercase; the
only uppercase in the system is mono eyebrows. Radius ceiling is 2px, no pill.
The standing design brief is `docs/development/UI-KICKOFF.md`; requirements are
`docs/development/BIO_Design_Requirements_v2.md`. The full design-language
foundation (tokens plus the two register proofs) came from the Claude Design
session; `civicos-ui/tokens.css` is its committed, canonical output.

## The runtime (`civicos-ui/app.html`)

Self-contained client. It inlines `tokens.css` verbatim for standalone opening
(canonical remains `tokens.css`; when served, swap the inline block for
`<link rel="stylesheet" href="/tokens.css">`). Fonts load from Google Fonts for
dev convenience; production embeds the OFL WOFF2 faces under `/fonts/` per the
`@font-face` block already in `tokens.css`.

Connection: `const PLANE = { base:"", token, session, preview }`. Empty `base`
means same-origin, which is true when served by the `civicos` worker, so
`/api/...` calls reach the proxy and no CORS is involved. The gate offers three
ways in: sign in with `op=login` (member handle, or empty handle for the
administrator), paste a `MEMBER_TOKEN`, or "preview the design" with no data.

Wired to real ops and live on connect:
- Rail is capability-shaped from `op=whoami` (a capability the member lacks is
  absent, not greyed; Members & Keys hides for a non-admin).
- Record from `op=list`, leading with the human title (bundle id dropped from
  the row), lowercase chips, verdigris fill for verified.
- Bundle view from `op=image`, parsing the real nested YAML frontmatter into the
  facts card plus a mono provenance line, and rendering the prose and the
  append-only history.
- Search from `op=search` with a client-side fallback over `op=list`.
- Published space from `op=publishedmanifest` (public, currently empty).
- Members from `op=memberlist`.

## Op contracts (verified against biosmoke7 this session)

- Auth is a query param: `/api/?op=X&token=Y`. `op=login` is a POST of
  `{role, password}` returning `{ok, token}`; `role` is the member handle, empty
  is the administrator. The returned token is then passed as `token=`.
- `op=list` -> `{result:[{bundle_id, object_type, title, current_state, last_updated}]}`.
- `op=image&id=X` -> `{result:{filename: content | {sha256, bytes, ...}}}`.
  `bundle.md` carries YAML frontmatter: top-level `current_state`,
  `criticality`, `classification`, `content_hash` (`sha256:...`),
  `source_status`, and a nested `source: { locator, authority, retrieved }`.
- `op=whoami` -> `{result:{tokenClass, session, member, handle, administer,
  capabilities, vocabulary}}`. A `MEMBER_TOKEN` returns `tokenClass:"member"`,
  `session:false`, `capabilities:null` (reads work; capability-shaping needs a
  member session via login).
- `op=publishedmanifest` is public, no token ->
  `{result:{published:[{bundle_id, bundle_sha, ratified_at, attestor_member,
  gate_version}], shas:[]}}`. Currently `published:[]`.
- The worker sets **no CORS headers**. That is the whole reason the UI must be
  same-origin (served or proxied) rather than a local file calling the plane.

## Build and deploy the dev worker

`civicos-ui/worker.template.mjs` is the proxy logic with an
`__APP_HTML_BASE64__` placeholder. To (re)deploy after any UI edit, from a shell
with a Cloudflare deploy token:

    # 1. embed the current app.html into a deployable worker.mjs
    python3 - <<'PY'
    import base64,re
    app=open("civicos-ui/app.html","rb").read()
    t=open("civicos-ui/worker.template.mjs").read()
    t=t.replace("__APP_HTML_BASE64__", base64.b64encode(app).decode())
    open("/tmp/worker.mjs","w").write(t)
    PY

    # 2. deploy the 'civicos' script (account + subdomain below)
    ACCT=20b533579290b9b93168345edd3b7f72        # from the credentials file
    curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -F 'metadata={"main_module":"worker.mjs","compatibility_date":"2026-07-01","bindings":[{"type":"service","name":"PLANE","service":"biosmoke7"}]};type=application/json' \
      -F 'worker.mjs=@/tmp/worker.mjs;type=application/javascript+module'

    # 3. first time only: enable the workers.dev URL
    curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos/subdomain" \
      -H "Authorization: Bearer $CF_TOKEN" -H "content-type: application/json" \
      --data '{"enabled":true,"previews_enabled":false}'

Account subdomain is `believeinoakland`, so the URL is
`https://civicos.believeinoakland.workers.dev`. The plane is never touched by
this.

## Done this session

Adopted the design foundation; built the runtime and wired it to the live ops;
stood up the `civicos` dev worker and verified it end to end against real R2
data; refined the record layout, wordmark, chips, and the bundle view to match
the storyboard.

## Next

1. **Wire the write actions.** Release is DONE (v2 above): per-document and
   batch, acknowledgment recorded. Next in the ladder: triage on Focuses
   (`op=dispose`, to deferred or dismissed with a reason), cite in Projects,
   capture in Add (`op=capture` / `op=promote`).
2. **Keep refining the look** against the storyboard as Bob drives real data.
3. **Production shape.** Decide whether to keep the dev proxy worker or fold the
   UI into the plane's own serving path for `believeinoakland.com/CivicOS`.
4. **Fonts.** Embed the OFL WOFF2 faces under `/fonts/` instead of Google Fonts.
5. **The published reading surface** (gap G1): no public op renders a ratified
   case-file body yet; the manifest and per-hash verify exist.

## Open decision for Bob

RESOLVED 2026-07-28: Bob chose the token value. Headings now ride `--t-rec`
(22px) with inline sizes removed; the token file stays unforked.

## Grants (pasted per session, never committed)

Same model as SESSION-KICKOFF.md. This work needs: a **Cloudflare deploy token**
(redeploy `civicos`), a throwaway **MEMBER_TOKEN** (read and verify against
biosmoke7), and the **GitHub token** (push). The account id and instance ids are
in the credentials file Bob pastes; no value is stored here.
