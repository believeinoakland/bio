# cause-action-t51 (T51)

**Status** · session_01HXzP2YgzLf6LWSpraLDFPx · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

QUESTION (non-blocking; I carried on with this reading).

1. C6, the passage. `conformance` `determine` takes the act's evidence as minted content ids, and no read lists a document's content ids (the record has `contentmint` only). Best reading, built: Matter offers the project's documents (`heldcaptures`, held and vouched) as ticks; on the press it marks each ticked document citable as a whole passage (`contentmint`, extent `document`, the way `docChoice` already treats "the passage" until a page lets a member select words) and sends the content ids the plane answers. A member who wants a narrower passage waits for the page that selects words. Tell me if you want otherwise.
2. Sentences. I invented none. Where the form refuses a missing choice client-side it uses the existing refusal rows that name the part (`refusal.NO_SUCH_EVENT`, `refusal.ACT_INCOMPLETE`, `refusal.NO_FINDINGS`), and `state.empty` for an empty picker and for "Show the routes" when a kind holds none. Rows the design could write to say these properly: `screen.matter.choose.event`, `screen.matter.choose.passage`, `screen.matter.choose.finding` (each "Choose the … first."), `screen.matter.none.events`, `screen.matter.none.documents`, `screen.matter.none.findings`, and `screen.action.guide.none` ("No routes are listed for this kind of action"). The reply show-back and the plan's Set-reminder use existing rows only (`screen.action.reply.account`, `screen.action.what.kind.of.reply`, `screen.reminder.on`, `act.reminderset.label.action`).

## Completion (J2)

**Causes met** (each: the requirement, the test that failed before the change and passes after, with its control).

| cause | held module | requirement | test |
| --- | --- | --- | --- |
| C6 (BLOCKER) | screens-action | R45 (amended reading: forms choose) | `matter-t51.test.mjs` "R45 (C6) …": the event (the events the project's document follows, read through the timeline), the passage (the project's documents, marked citable as whole passages when the act is pressed) and the finding (the project's concluded questions and the published cases' findings) are choices; none chosen is refused naming which one is missing and nothing is sent or minted; control: all three chosen sends the minted content id. R45 (c), (d) and the refusals test were re-pointed to choices (the typed boxes they filled no longer exist). |
| C53 | screens-action | R1, R44 (c), R52 | `plan-t51.test.mjs` "… (C53) …": a chosen, dated, unstarted option draws `act.reminderset.label.action` and the reminders the record holds (`screen.reminder.on`, read from the plan answer's `reminders`), and the act keeps the choice and sends the held reminders with the new one; controls: an undecided, an undated, a started option and a closed plan draw no act; no day asks for the day first. |
| C62 (my part) | screens-action | R2, R3 | `fix2-t51.test.mjs` "… (C62) …": Start and send step 2 names its project (the action's `project`, title from `list`); control: an action in no project names none. |
| C63 (my part) | screens-action | R1 | `fix2-t51.test.mjs` "… (C63) …": a plan's checks name the option or phase by its place (`date_past`, `subjects_not_live`, `outward_on_hypothesis`, `enforces_superseded`, `no_hostile_branch`, with the existing keys of the plan's own sentences), never `opt-1`/`p1`; control: a check whose sentence needs a fact the data does not carry keeps the plan's own sentence. The raw `not_met` inside the design's own sentence for `no_hostile_branch` is a WORDS row (found; see below). |
| C65 | filing-templates, screens-action | R3 (filing-templates), R48 | `send-t51.test.mjs` R48: the template act sends the action's `project` as its scope (control: an action in no project sends none); `draft.test.mjs` "R3 (C65)": owner and joined member accepted, a member outside, an invited one and a filing with no project refused. |
| C66 (my part) | screens-action | R5, R38, R31 | `fix2-t51.test.mjs` "… (C66) …": a reply's words, kind, decision, exemptions, answer-by date and quote are shown back beside it (control: none recorded, none shown); "Show the routes" says `state.empty` when the kind holds none (control: a kind with routes). |
| C68 | action-clocks | R2 | `t51.test.mjs` "R2 (C68)": `deadlinesFor(view, kind, fm)` puts the deadlines of the office's own level first (the level the addressee states, else the view's counterparty), those the profile ties to another level last, the rest between; control: a state office lists the state's first; an unknown office, a non-office addressee and no action keep the view's order. `clockPropose`'s `NO_SUCH_RULE` answers through it. |

**Not done, and why.** C63's planopen press is `screens-inquiry/project.mjs:335` (not held); the Brown Act line of Start and send step 1: no code or word row of `screens-action` prints one (searched `bio-plane/src` and the word table); the clock rows print each date's basis as the plan's option or the plane's preview holds it, so a "Brown Act" basis is record data (an option's regulated date typed with that basis, or a profile deadline of that kind); I could not reproduce it without the walk's data, so nothing was changed for it. C66's review-copy sentence is `screens-publish`; its console 400 `op=queue&limit=500` comes from `screens-inquiry/dashproject.mjs:30` (limit 500, the queue's cap is 200); `screens-action`'s own `queue` read (`dash-action.mjs:18`) sends no limit.

**Reported to BOB** (other modules, described against their requirements):
- `filings` `templateSave` (`filings/index.mjs:2871`) defaults a new template's project to the filing basis's `project` only; for an action not resting on a determination that is empty, so `filing-templates` R3 refuses every author with `TEMPLATE_SCOPE_REFUSED`. Its other sites read `a.project || basis.project` (`:1487`, `:1643`, `:2773`). The screen now sends the project itself; the `filings` default should be the same. (This was the real C65 site.)
- `action-clocks` R2 should state the order of `deadlines` in `NO_SUCH_RULE`'s answer (the office's own level first). Level of a deadline: its own `level` if a profile states one, else the `records_laws` level whose citation its citation begins with. `jurisdictions` could state `level` on a deadline (R26) and a `federal` office level (R88 lists `state, county, city, district` only; a federal office is not in any profile's `counterparties`, so its level comes from the addressee's own `level` field `actions` R9 allows). BOB's call.
- `conformance` `determine` needs minted content ids as evidence; no read lists a document's content ids. A read of the passages a project's documents already have (or a note that a whole-document mint per document is the rule) would be cleaner than the screen minting on the press.
- `screens-investigate`: the Timeline's event set (the project document's references plus page memory) is what Matter's event picker reads; a recorded event appears there only once C54 persists it into the project document's references.
- `setup-words/words-unreviewed.json` is stale on the tranche tip before my change (`build.mjs --check`); `build/rulings.md:4298` fails the format check (K4301); neither is mine.

**New keys wished for (never worded here):** see my QUESTION J1.

**Tests and checks.**
- `screens-action` 220 pass, 0 fail; `action-clocks` 84 pass, 0 fail; `filing-templates` 85 pass, 0 fail.
- Users: `affordances`, `action-plans`, `plan-work` 424 pass; `screens-investigate` 178 pass; `filings`, `action-producers` 208 pass; `op-declarations`, `wizard-scripts`, `answer-envelope` 408 pass (`impact.mjs origin/tranche/T51 HEAD` names 37 modules; the rest use nothing I changed).
- `checks/run.mjs`: format 1 failure (`build/rulings.md:4298`, not mine); architecture 0; coverage: none of my three modules fails (10 other modules do, not mine); channels 0; words 0.
- `ownership.mjs … action-clocks,filing-templates,screens-action origin/tranche/T51 job/T51/cause-action-t51` (the check of the process repository's branch `prep/cause-job-K4273`, which takes the list): 15 files, 0 failures.

Size (session_01HXzP2YgzLf6LWSpraLDFPx): test runs 34, module lines 8760

## J2 · COMPLETE

COMPLETE. Causes met: C6 (screens-action R45), C53 (R1, R44 c), C62 and C63 (my parts: step 2's project; the plan's checks named by place), C65 (filing-templates R3 and screens-action R48: the template act sends the action's project), C66 (my parts: reply words and quote shown back; "Show the routes" says none), C68 (action-clocks R2: deadlines in the office's own level order). Suites: screens-action 220, action-clocks 84, filing-templates 85, all pass; users (affordances, action-plans, plan-work, screens-investigate, filings, action-producers, op-declarations, wizard-scripts, answer-envelope) pass. Checks: architecture, words, channels 0 failures; coverage none of my modules; ownership (cause form) 15 files, 0 failures; format fails only on build/rulings.md:4298 (not mine). Reported to you in my record: the real C65 site is `filings.templateSave` (project defaults from the basis only); the Brown Act line of C63 has no source in screens-action (it is record data); C66's console 400 is screens-inquiry/dashproject.mjs:30 and the review-copy sentence is screens-publish; action-clocks R2 and jurisdictions want a line on the deadline order and a federal level. See QUESTION J1 for the evidence reading of C6 and the word rows wished for. Size (session_01HXzP2YgzLf6LWSpraLDFPx): test runs 34, module lines 8760.

## CHANGE B2 (J3)

C6's event picker now asks `timeline` with the project's capture shas (`captures`, events R53 as amended, K4310) alongside the references of the project's document as `set` when it has any; it waits for the documents read before asking, so one call is made. `matter-t51.test.mjs` "R45 (C6)" asserts both queries and the captures-only case. `screens-action` 220 pass. Whether EVENTS #10 has merged: I could not tell from the tranche tip (merged `origin/tranche/T51` at B2); the test uses the scripted plane, so re-run after EVENTS merges if you want it proven against the real answer.
Size (session_01HXzP2YgzLf6LWSpraLDFPx): test runs 36, module lines 8770
