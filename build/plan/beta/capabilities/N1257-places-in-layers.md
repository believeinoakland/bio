# N1257 places in layers, with N1256 federal offices: analysis, points and needs (draft)

**Status** · READY for PLANNING (reviewed by CAPABILITIES #1, C2), with section J added; written by a worker, checked against the reading in section H.
For the beta's build plan, tranche T53. Carries DEC-404 (Bob, 2026-10-21: "Let's go with A after the alpha"), K4362, and DEC-401's option B (N1256). Design and requirements only; no code was changed.
The requirement lines (section B) are in two companions: `N1257-requirements-jurisdictions.md` (draft R99 to R120) and `N1257-requirements-modules.md` (local-facts, instance-setup, installer, screens-settings, screens-action, actions, action-clocks, queue-producers, entities, filing-templates, reading-guides). Sections A and C to I are here.

## A. What exists today, and what DEC-404 requires

Read from `build/requirements/*.md` and from the profile data (`jurisdictions/profiles/oakland-alameda.mjs`, loaded and inspected with `node`, 2026-10-27), and from `jurisdictions/index.mjs` where a claim was tried (marked "tried").

| # | DEC-404 requires | Today | Gap |
|---|---|---|---|
| 1 | A place is four layers: federal, state, county, city | One package per place (`jurisdictions` R1, R44). The only real one, `oakland-alameda`, holds all four levels. Levels exist as tags: a law's (R31: `federal`, `state`, `county`, `city`), a standard source's, an office's (R88: `state`, `county`, `city`, `district`) | No layer concept; R88 has no `federal` level |
| 2 | Civicsmith ships the federal layer read-only: FOIA, its deadlines, federal holidays | Inside the package since T51 (R95 to R97): FOIA law with 8 stages, requesters, `response`; `foia_response` (20 business days, +10) and `foia_appeal_response`; closure list `federal` (2026, 2027); weekend | Not separable: `foia_response` counts on list `federal` by name, and `validate` accepts a closure name only if the same profile holds it (tried: `CLOSURES_UNKNOWN`, `index.mjs:1049`) |
| 3 | The federal records offices (N1256) | None. DEC-401 A is placed in fix round 3 (K4350) and its entity lines are in the file (R63, R64): a member names an office inside a request, saved "Named by a member" until an administrator confirms (`entities` R63, R64; `screens-action` R20) | Nothing built in. The government's list is `www.foia.gov`'s agency-component service; its developer page (fetched 2026-10-27) says it needs an api.data.gov key; the count was not measured |
| 4 | The California layer: the Public Records Act, its deadlines, state holidays and offices | Inside the package: the Act (`records_response`, 10 days, +14), 14 state-law deadlines (agenda notice, claims, Brown Act demand and cure, grand jury, anti-SLAPP), `ccp_12`, the judicial list (CCP § 135, 2026 and two earlier years), the State Controller's calendar, one state office (the State Controller) | "State holidays": the data holds the court list (CCP § 135) and one office's calendar, not a state-employee list. 2027 court and City lists were not published at 2026-10-11 (R85) |
| 5 | Alameda County its own layer | Little at county level: the Civil Grand Jury (office, fiscal year), the Superior Court (forum, hours), the assessor's systems and the parcel space, county pointers (legal aid). No county records law, deadline or holiday list | The layer is mostly new research |
| 6 | The City of Oakland its own layer | Everything else: Sunshine Ordinance, 3 Municipal Code deadlines, City holidays, 3 offices, portal venue and receipt rule, `observed` practice, vocabulary, spaces, Legistar schemes, policy series, pointers, forums | A split, with migration |
| 7 | A team chooses its state (California only) and, where held, its county | The installer offers whole held profiles, none preselected (`installer` R21); `profilesSet` replaces the list (`instance-setup` R14); setting `jurisdiction_profiles` (`record-core` R26) | No levels in the choice |
| 8 | A team adds a missing county or city, with sources, marked its own research, serving only that team | Part is built: a member drafts a deadline or a legal fact from a held source, a second member confirms, Tier 2 and 3 need a qualification statement (`local-facts` R10 to R13, R18, R19; `screens-settings` R61); a member names an office or a court (R46, `entities` R63); the team's zone (`local-facts` R21). `RULE_IN_PROFILE` refuses a key the profile holds | Not built: a team's records law, holiday list with closure lists, office hours, venue, place where records are published. DEC-404 and next.md N1257 speak as if nothing is built |
| 9 | A team never edits a read-only layer; it reports a rule it believes wrong | Profiles are release data; no op writes one. But `factConfirm` `correct` lets a member change a holiday year, hours or zone for this team, marked (`local-facts` R1, R2). `factStatus` lists disputes "so a member can report them for a profile fix; the instance transmits nothing" (R2); `ruleOffer` carries a team rule to the maintainers by hand (R13). The stewards' intake takes only abuse (`stewards` R3: four kinds) | No report of a rule; correction vs "read-only" is open (D2) |
| 10 | Layers side by side; a request names its law | Yes: laws are a list on the kind (`laws`, unioned, R29), each law names its window (`response`, R96); a request holds its laws by name and level (`actions` R18, D-149). Tried: two profiles' deadlines merge field by field, so a field given by one layer only is no disagreement (`index.mjs:2098-2125`) | The law picker offers laws without knowing which bind which office (R106) |
| 11 | A team outside California gets the federal layer only | A place not held: no profile active, `places` offers no law, deadline or holiday (`screens-settings` R60); the name is kept and its arrival told once (DEC-150; `instance-setup` R60, R62) | Federal alone is not a profile today |
| 12 | How layers stack, and a one-key disagreement: BOB's | `combine` unions lists and withholds a one-value key on disagreement, "never chooses" (R12 to R16, R34, R55) | C1, C2 |

**Four defects, found by trying the code or reading it, that the split meets at once** (each has a line in the jurisdictions companion):
1. `weekend` is compared whole, citation included. Tried (2026-10-27): two profiles with equal days and different citations conflict and the weekend is withheld (`index.mjs:2158-2165`). `time_zone`, `locale` and a kind's label do not do this (tried). Federal and California would each cite their own statute. R103.
2. A closure list is resolved inside one profile (R47; `index.mjs:1049, 1076`). R104.
3. `records_help` is one block per profile, and differing blocks conflict and give none (`index.mjs:1883-1886`). R105.
4. R88 lacks `federal`. R107.

**Places that store a profile id** (a split must not orphan them): the setting `jurisdiction_profiles`; the bound `JURISDICTION_PROFILES` (`installer` R21); `local_fact_acts` rows, whose path begins with the profile id (`local-facts` R6) and which are append-only (R5); a template's `profiles` (`filing-templates` R1); place arrivals (`instance-setup` R62); the `profile` tag on every fact in the view (`jurisdictions` R13), read by `filings` R29 and `actions` R100 (the zone of the profile that gives the addressee). Answer in R110 to R114 and `local-facts` R27: keep the id as a package, resolve old paths, rewrite no row.

**The sources of the shipped layers** (the layers cite the primary source for each fact, R44; the first column are the ones the profile already cites; the others are named for the research job and not read by this draft).
- Federal: the Freedom of Information Act, 5 U.S.C. § 552, with the periods in (a)(6)(A)(i), (a)(6)(B)(i) (cited in the profile; read on 2026-10-21, `foia-text`); the legal public holidays, 5 U.S.C. § 6103 (cited; 2026 and 2027 held); offices: the FOIA.gov agency-component list (to measure); the Office of Personnel Management's published federal holidays and the Department of Justice Office of Information Policy's guidance as cross-checks (to read).
- California: Gov. Code § 7920.000 et seq. (the Public Records Act; the profile cites leginfo, 2026-10-25), § 54950 et seq. (Brown Act), § 810 et seq. (Claims Act), Code Civ. Proc. §§ 12, 12a, 135, 425.16, Penal Code §§ 933, 933.05 (all cited); the state's own holiday list, Gov. Code § 6700 (named, to read), the Judicial Council's court holiday calendar (to read), the State Controller's calendar (held, M-191).
- Alameda County and Oakland: as the profile cites (M-187 to M-196, `time-law`, `actions-law`, `pointers`, 2026-10-05 to 2026-10-25); the county's own code and Board of Supervisors' pages (to read).

## B. Requirement lines

By module; every line is in the house format with Test and Control.
- `jurisdictions` (companion 1): R99 layer; R100 level fit; R101 chain; R102 one key, two layers; R103 weekend; R104 closure lists across layers; R105 records help per law; R106 `governs`; R107 federal level for offices; R108 coverage; R109 federal layer; R110 California; R111 Alameda County; R112 Oakland; R113 chains checked; R114 package and migration, with its equality test; R115 team layer; R116 what a team may write; R117 team never replaces shipped; R118 test chain; R119 federal offices (N1256); R120 kept current.
- `local-facts` (companion 2): R23 team layer entries, two members; R24 existing rules read as the team layer; R25 corrections stay the team's; R26 report a rule; R27 old paths.
- `instance-setup`: R107 choose layers; R108 `profiles()` tells each layer; R109 a place named at its level; R110 team layers held in the record; R111 an update changes no choice and no recorded fact.
- `installer`: R86. `screens-settings`: R82, R83. `screens-action`: R60. `actions`: R112. `action-clocks`: R27. `queue-producers`: R58. `entities`: R68. `filing-templates`: R36. `reading-guides`: R17.
- `civil-time`: none expected (F7). `stewards`: none now (C4). `newgroup`: no requirements file exists (`ls build/requirements`); the install's choice is `installer` R21's.

**The migration, in one paragraph.** `oakland-alameda` stays a held id, a package of the four layers in order (R114). The setting, the binding, templates and tests that name it are untouched; old fact paths resolve to the layer now holding the fact and no row is rewritten (`local-facts` R27); a recorded request, clock and filing holds laws by name and level and clocks written by members, so none changes (`instance-setup` R111). The proof is a saved view of `combine(["oakland-alameda"])` taken before the split and compared by deep equality after, with tags removed, plus every existing test file run unchanged (R114). Four defects above must be fixed first, or the equality cannot hold.

## C. BOB's points (lower level; DEC-404 gives them to BOB)

**C1. How layers stack.**
- A (recommended). A chain: one layer for each level, each naming the layer it sits in (`within`); city may sit directly in the state when no county layer is held (a team's own city). All active layers combine side by side, nothing overrides anything; a rule may count on a closure list a layer above it holds. Matches "a place is four layers" and "only its city"; lets the California rule for records be counted on a closure list and an Oakland observed practice be held in the Oakland layer. Cost: three new refusals and a `within` field. Lines R101, R104, `instance-setup` R107.
- B. A flat set: any layers, no parent, each self-contained. Simplest in code (as today), but each layer must repeat the weekend and any list it counts on, and a team could pick Oakland without California.
- C. Precedence by level. DEC-404 says no ("not overriding").
- Sub-point: at most one layer per level (A) against several cities or counties in one team (needs layer-qualified list and rule names to avoid collisions; two cities each with a list called `city` would conflict). Recommended: one per level now; sibling layers wait for a team that asks.

**C2. A disagreement within one key** (two layers give different values to one thing, such as a zone, a kind's tier, a holiday year of one list).
- A (recommended as the rule). Withhold the key and report both values with their layers; consumers answer "undetermined" (today's R15). Never guess a law.
- B (recommended as the team's way out, lines to be written if chosen). The administrator records which layer's value the team follows for that key, with a reason; the choice is shown beside the value and edits no layer.
- C. The nearer layer wins; or D. the stricter value wins (shorter period). Both are overriding or ranking; C contradicts DEC-404.
- With it: a build check that the layers Civicsmith ships never disagree with each other (R113), so a disagreement can only come from a team's own entry (R117).

**C3. Who confirms a team's own layer.** A (recommended): each entry by a second member as today's rules (K3935), the qualification statement for Tier 2 and 3; a screen can confirm several in one visit. B: the layer approved whole by two administrators. C: none. Recommended A because it extends a ruled practice (DEC-340).

**C4. Where a report of a wrong rule goes, and what it holds.**
- Holds (R26): the layer and its version, the entry's key, the value as shipped, what the member believes it should say, the source (a held capture extent or an address with the passage), the date. It holds no record content, no names beyond the member's choice, no other entries. Open until marked carried.
- Goes: A (recommended). The page builds the report as bytes with a digest and a member carries it to Civicsmith, as `ruleOffer` carries a team rule and as `factStatus` already expects of a dispute (the instance transmits nothing; `local-facts` R2, R13; v0.2 rule 14). B. A "Send" button posting to a Civicsmith-run intake after showing exactly what is sent. B needs the stewards' intake, which today takes four abuse kinds only (`stewards` R3) and opens only when Bob gives its address (K2799), and would be the first act by which a team's copy sends something to Civicsmith: that is Bob's (D-level doctrine, rule 14), not BOB's. A is drafted; B waits for Bob.

**C5. Migration by package alias** (R114, `local-facts` R27) against rewriting stored ids at update: recommended alias, because the paths are in an append-only table and `installer` R21 says an update never changes the choices.

**C6. The federal offices.** Hold them in the federal layer and make an office entity only when a member chooses one (`entities` R68), recommended, against seeding all at install (`instance-setup` R50 would create an office and a body entity for each: hundreds if the list has the size foia.gov suggests, F4, filling "Offices and seats" and the paged office list). Source: a snapshot rebuilt by the makers before each release with the key held as their secret, diffed and read by a person; a team's copy never fetches (R120). The alternative, a live read by each copy, needs the key in every copy.

**C7. Time zones.** A state layer states a zone only if the whole state has one (California does); the federal layer states none; a federal clock is read in the team's zone and says so (`actions` R112). Recommended; the other way, stating an office's zone, depends on whether the list publishes zones (F4).

## D. Bob's points (policy, doctrine, what a requirement means)

DEC-404 answered: four layers, who ships what, read-only, report not edit, side by side, own research serving only the team. These three remain.

**D1. What Civicsmith promises about how current the layers are.** A law changes, an office is renamed, a year's holiday list is published late (in October 2026 neither the City's nor the court's 2027 list was published: `jurisdictions` R85). A layer is a snapshot that Civicsmith researched on a day; the team's deadlines rest on it.
- A (recommended). Every layer says, in plain words beside each rule, where it comes from ("read from <source> on <date>") and how far its calendars reach; a count past that is shown as "not known", never guessed. Civicsmith promises the day it read, not that the law has not changed, and says "not legal advice". Updates arrive with releases, and an administrator is told once which rules changed.
- B. A stated promise of a delay (for example "within 30 days of a change"). Needs people and a process Civicsmith may not have; a broken promise on a deadline is the worst failure.
- C. No dates shown. Cheap; a team cannot judge a rule.
Recommended A; it is what the draft's lines build (R108, `instance-setup` R108, `queue-producers` R58).

**D2. What "read-only" means for a team that knows a shipped fact is wrong today.** Reporting takes time; a deadline or a holiday may be wrong now. Today a member can correct a holiday year, an office's hours or the zone for her own team, marked as hers, with how she checked it and a source (K921, K925). DEC-404 says a team does not edit a read-only layer.
- A (recommended). The layer is never changed. For the calendar facts (holiday dates, hours, the zone) the team's own marked correction stays, because a closed office is a fact the team can see and a count must follow it; for laws and deadlines, the team can only report. The team can add a rule of its own under a different name beside the shipped one (side by side), never over it. Draft R25 builds A.
- B. Reports only, for everything; corrections of calendar facts go. Matches the words "does not edit" most strictly; a team with a wrong holiday waits for a release.
- C. The team may apply its own value over a shipped one, marked. Overrides: contradicts DEC-404.

**D3. A team outside the United States.** The four levels (federal, state, county, city) and the federal layer are the United States'. A team in another country has no layer to choose; today it gets nothing filled in (DEC-150), and the draft preselects the federal layer for every team, removable.
- A (recommended). Say so on the choice: Civicsmith holds United States places; a team elsewhere names its place and writes none of the four levels, and adds its offices itself as today. The level names stay as DEC-404 has them.
- B. Rename the levels generally (nation, region, county, city) and let a team add a national layer. A bigger change to the vocabulary (R31) and to the decision.
The draft assumes A (`installer` R86: the federal layer may be removed, and the page says what that means).

## E. What the places screen needs from UX-DESIGN (needs only, to go through BOB)

1. A drawing of the chain: each active layer by level, its place, who holds it (Civicsmith's, read-only; or the team's own), when it was researched, how far its calendars reach.
2. The choice of state, county, city, in that order, optional at each step; the federal layer preselected and removable with its meaning said.
3. A federal-only state: what the team has (FOIA, federal holidays, federal offices) and what it lacks, with the place-name field (DEC-150).
4. "Add your county or city": a way to write entries of the sections in `jurisdictions` R116, each with its source and a second member's confirmation, and a way to see all unconfirmed ones together.
5. "Report a rule" beside each shipped rule: what is shown to the member before anything is carried; the "carried" state.
6. A read-only layer's rule drawn with its source beside it and no edit mark; a conflict drawn as "two layers disagree about X; nothing is assumed" with both values.
7. Choosing a federal office on `request`: a search by agency or abbreviation before "Name the office yourself" (DEC-402), with the list's date.
8. The install page: the same choice before a team exists (`installer` R86).
9. The words keyed in `setup-words`; no place named in a word that is not data (`build/layers.md` rule 1).

## F. What must be measured, and on what copy

1. One-value facts that compare citations: for each section in `index.mjs`'s one-value list (R55), combine two synthetic profiles equal in value and different in citation and basis; weekend is known to conflict (tried), the rest not yet. Copy: `jurisdictions/index.mjs` at the branch tip when the job opens.
2. Every stored use of a profile id (section A's list) in a test instance upgraded from the alpha build: rows naming `oakland-alameda` in each table. Copy: the T53 test instance with a walked alpha record.
3. The pre-split view fixture of R114: generated by script from the commit before the split; kept whole.
4. The federal offices list: how many agencies and components, which fields each has (form, e-mail, mail, liaison, time zone, parent), how many lack a request means, the bytes of the layer, and the change between two reads at least 30 days apart (for R120's bound). Copy: the FOIA.gov agency-component service read with the makers' api.data.gov key (the key is a secret: no value is printed or stored in the repository); the developer page (2026-10-27) names the endpoint `https://api.foia.gov/api/agency_components` and the key requirement; a request without a key answered 403 `API_KEY_MISSING` on that day.
5. Size and time of the layered view against the unsplit one: bytes of `combine`'s view and run time, on a request path and on the places screen (K4354: a screen within 2 seconds). Copy: the T53 test instance, 1280 px.
6. The county layer's real content: what Alameda County publishes as records and open-meeting rules, deadlines, holidays, hours, offices; by reading its own pages and code. Copy: the county's published sources, dated.
7. `civil-time` resolving a closure list across layers: its tests run against the four-layer test chain (R118) and the shipped chains; a count over the federal list for 2026 and 2027 against the unsplit values.
8. State holidays: Gov. Code § 6700 against CCP § 135 for 2026 and 2027, and whether either 2027 list is now published. Copy: the Legislature's text and the Judicial Council's calendar, dated.
9. A team writing a city layer: minutes and mistakes per entry with the made-up test city, walked by a person who did not write the screen. Copy: the test instance with the test chain. (No real team is measured.)
10. Which modules read `profile`, `view.id`, `view.name` or `covers` for logic or display (grep over `build/requirements` and the code), so a changed tag breaks none.

## G. Needs from other lanes

- PLATFORM: the record size and load a team layer adds (the table `team_layers`, its drafts, entries up to a stated number); the release bundle's size with the federal offices list; whether `combine` over four or five layers fits the request path's time and the plane's limits; the secret (the FOIA.gov key) as the makers' build secret, never in a team's copy.
- FILES: none expected.
- AI-DESIGN: yes, the assistant's answers rely on layers. DEC-405's answer "applies rules (what a provision requires, the law in force, a computed due date)" reads the combined view; it should name the layer and its `as_of` for each rule it uses, say "not held" for a law whose layer the team has not chosen (a team with federal only asked about the Public Records Act), offer the search for it, and never write into a layer; a draft of a team entry reaches a member as labelled run output and enters only by her act (`local-facts` R5, R14).
- UX-DESIGN (through BOB): section E.
- PLANNING: order: `jurisdictions` first (R99 to R108 and the four defects), then the shipped layers and the migration test, then `local-facts` and `instance-setup`, `installer`, then screens. N1256 can ship with the federal layer, or wait for the key and the measurement F4; the layers do not depend on it.
- BOB / Bob: the stewards' address (K2799) before any "Send" (C4 B).

## H. What I read whole, and what not

Whole: `build/requirements/README.md`; `PROCESS-MECHANICS.md` §3; DEC-401 to DEC-406 and the head of DEC-407, DEC-150, DEC-151; `build/layers.md` "No jurisdiction in the product"; `build/requirements/local-facts.md` (Provides and Invariants, lines cut at 2,600 characters); `build/plan/beta/LANES.md` first 3,500 bytes and the lines that name this lane.
In part: `jurisdictions.md` (Purpose; every Provides line read to 2,200 characters each; Invariants R20 to R94 read to 700 to 1,500 characters each; Satisfies; Suggestions to 600); `instance-setup.md` (R12 to R16, R50 to R52 headings, R60 to R62, R76, R93, Suggestions, installer binding), `installer.md` (R21, R22, line 80), `stewards.md` (header, R1 to R7, headings); `screens-settings.md` (R19, R45, R46, R60, R61 whole; others by grep); `filing-templates.md` (R1 to R6; R14, R15 by grep); `reading-guides.md` (R13 to R15 by grep); `entities.md` (R51, R63, R64, R67 by grep); `action-clocks.md` (R11), `actions.md` (R9, R10, R68, R100, Suggestions by grep); `queue-producers.md` (R38 by grep); `civil-time.md` by grep only. `build/rulings.md` K4350, K4354, K4362 and the lines found by grep 'DEC-404'. `docs/development/ux-substrate/layouts.html` line 1263 only.
Profile data: not read as text (100 KB); loaded with `node` and its sections, deadlines, laws, holidays, counterparties, pointers and forums printed. `jurisdictions/index.mjs`: the parts for `combine`, weekend, deadlines, records_help, records_laws and the closure check, and three small tests run against it.
Not read: `docs/development/DECISIONS.md` apart from the entries named; `lane-process-redesign`; the other lanes' drafts; the screens' mock files beyond a grep.

## I. Contradictions and claims I could not verify

1. DEC-404's provisional says offices carry a level (R88); R88's list has no `federal`, so federal offices cannot be stated today (R107).
2. DEC-404, `next.md` N1257 and the screens page read as if a team's own rules were wholly future; `local-facts` R10 to R13 and `screens-settings` R61 already let a team draft and confirm deadlines and legal facts (T51), and a member can add offices and courts.
3. `installer` R21: "An update never changes them" (the chosen profiles) against the split of a held id: kept true only by the package alias (R114).
4. DEC-404 ("read-only; a team does not edit") against `local-facts` R1, R2 (a member corrects a holiday, hours or the zone for the team): D2.
5. DEC-404 says the California layer holds "state holidays"; the data holds the court list (CCP § 135) and the State Controller's calendar; whether Gov. Code § 6700's list is also wanted is not stated (F8).
6. Unverifiable here: the size of the FOIA.gov list; that it publishes time zones or request means for every component; Gov. Code § 6700's text; the OPM and Judicial Council pages; that Alameda County publishes a records or meeting law of its own; whether the stewards' address has been given since K2799; the effect of the four defects on the whole of `combine` beyond what was tried (weekend, closure name, records_help read in the code, not run; the others in section F1).

## J. Added by CAPABILITIES #1: DEC-458 A2 (fiscal year), Bob via UX-DESIGN, 2026-10-27

Bob (via UX-DESIGN, DEC-458, A2 "as recommended"): a government's fiscal year comes from the place's records, or is stated by a member with how they checked it, as the time zone is; Money never prints "*" and offers the fiscal-year view only where the year is known (money, civil-time, places). Consequences for this draft, to be written as lines by PLANNING with the owning modules:
1. `fiscal_year` is a one-value fact of a layer (the profile already holds it for the Civil Grand Jury office, section A row 5). It follows the same rules as `time_zone`: a layer states it only where the whole government has one; a federal layer states the federal year; a team's own entry for a county or city carries a source or "how I checked" (the `local-facts` R21 pattern for the zone).
2. Where no layer states a government's year, the year is undetermined and Money offers no fiscal-year view for it (money R34 states the period refusal naming no placeholder). No default of July–June is ever assumed.
3. The F1 measure (section F) covers `fiscal_year`: combine two synthetic profiles equal in value, different in citation.
4. Money and civil-time lines belong to a separate job's reading; this lane gives the layer side only.

## K. Bob's answers (2026-10-27)

D1 (K5450): option A, plus an 'information' tag ('i' in a circle) next to each entry, or on the page overall, showing how current the information is: add to section E (UX need, sent through BOB). D2 (K5451): "as recommended": option A. D3 still with Bob.
