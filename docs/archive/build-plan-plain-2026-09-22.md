# BIO / CivicOS — the full build plan, in plain words

**A snapshot, taken 2026-09-22 at about 17:20 UTC, at the stand-down of the old account.** The plan itself lives in two
files the SCHEDULER lane keeps — `docs/development/QUEUE.md` (what runs next) and `docs/development/BACKLOG.md`
(everything after it, in order) — and this document will drift from them as work lands. Read it for the shape of the
plan; ask the lead (BOB) or the plan files for anything current.

## How to read it

- **It is in build order.** Entry 1 is next; entries 1 to 8 are "the queue" the building lane takes from, and the rest
  follow in order.
- **Each entry** gives its number, its id (a short tag the team uses to find it), a plain title, its status, the
  capability it serves, and one or two sentences on what it does and why.
- **Ids starting with D-** came from the old list of defects and keep their ids inside the plan.
- **Four entries were being built when the old account stood down** and are marked *paused*: two had saved their work on
  their own branches, two had not started editing. The building lane picks them up in the cloud.

## What the milestones mean

| milestone | in plain words |
| --- | --- |
| M0 | How the team works: the plan, the tests and the process are trustworthy |
| M1 | BIO keeps its own record current, unattended |
| M2 | Every kind of document the city publishes can become evidence |
| M3 | The record knows what it holds |
| M4 | The record connects what it holds |
| M5 | The record can be searched by its content, not only its notes |
| M6 | The record can be left, copied and outlived |
| M7 | A group can install BIO and run it honestly |
| M8 | Members can reach what the record holds |
| M9 | Members can state what they found, and what it rests on |
| M10 | The group can stand behind what it found, publish it, and act on it |

## The 125 entries

**1. LED-7 — Fold the separate defect list into the build plan**
*Waiting its turn · How the team works (process)*
The scheduling lane itself checks each open defect against the code, then closes it with evidence, places it in the build plan in order, or records it as a permanent limitation. The separate defect list then retires, as Bob directed.

**2. M0-106 — Releases reuse an existing passing test record**
*Waiting its turn · How the team works (process)*
The release lane re-ran every test even when that exact code already had a full passing record (0.71.0's check took about 2.5 hours for a 16-minute test run). The instruction is now changed; the next release, 0.72.0, must show it working.

**3. M0-107 — Count test time-outs as "not measured", not as failures**
*Paused at the stand-down (not yet started) · How the team works (process)*
On a busy machine, a test that runs out of time is recorded as a failure and blocks the work from landing, as with the 0.71.0 release check. Time-outs will be reported as time-outs, and a run failing only on them will read "not measured".

**4. REC-166 — Keep a project's version choice out of the shared question**
*Paused at the stand-down (progress saved on its branch) · The group can publish and act on its findings*
Marking which version of an answer a project stands on also writes into the shared question, so cases resting on that finding lose their protections and are flagged, including other projects'. The choice will be recorded only in the project's own record.

**5. REC-165 — AI suggestions must come from the caller's own run**
*Paused at the stand-down (progress saved on its branch) · Members can state findings and what they rest on*
The actions recording an AI assistant's suggested answer versions and proposed extractions never check whose working session ("run") they cite, so a suggestion can be judged against another member's declared bias, evidence bar and identity. Both will require the caller's own open run.

**6. M0-110 — Move the team's coordination files off the main code line**
*Paused at the stand-down (not yet started) · How the team works (process)*
The team's message board (work claims, task queue, rulings index) lives on the main code line, so every update cancels other lanes' passing test records; 89 of the first 112 changes on 2026-09-22 touched it. Bob approved moving it to its own branch.

**7. REC-167 — Refuse ratifying a case whose conclusion was withdrawn**
*Waiting its turn · The group can publish and act on its findings*
If a project withdraws its conclusion after a case edition recording it is prepared, ratifying still succeeds, and the signed edition states a conclusion nobody holds. Ratifying will confirm each recorded conclusion still stands, and otherwise refuse, saying what changed and to publish again.

**8. UI-77 — Stop showing "Believe in Oakland" on every group's pages**
*Waiting its turn · A group can install and run it*
Every installed copy's members' area and public header say "Believe in Oakland", because the name is built into the page, so another group's public page claims to be this project's. Both will show the group's recorded short identifier, or say none is recorded.

**9. M0-114 — Run the tests on GitHub's machines, visible to everyone**
*Blocked until the first cloud session measures a full test run · How the team works (process)*
A test result lives in one working copy, so other sessions cannot read it and re-test code already tested. Bob approved moving tests to GitHub's machines, with each result attached to its change; test times and monthly usage are measured first.

**10. M0-111 — Land everyone's work on main in scheduled batches**
*Waiting its turn · How the team works (process)*
Every lane lands its own work on the main code line, so it moves under every test run and each landing must re-test. Bob approved batches: lanes hand in branches, and the coordinating lane merges them on a schedule and tests once.

**11. M0-116 — Stop needless test re-runs for measurement-only changes**
*Waiting its turn · How the team works (process)*
The test selector treats any mention of the measurements file, even in a comment or one shared list, as a dependency, so changing that file alone re-runs about a third of the tests. The fix moves the list and makes the selector skip comments.

**12. M0-100 — Give each new measurement and interface-change entry its own file**
*Waiting its turn · How the team works (process)*
Under batched landing, two branches that each add an entry to the end of the measurements file or the interface-change log would still collide. Each new entry will get its own file; the old files stay frozen as history, and one reader serves both.

**13. D-85 — Tie an AI assistant's questions to its own run**
*Waiting its turn · Connects what it holds*
An AI assistant can open a question outside any working session ("run") it holds, and a run keeps only the declared-bias statement it was handed, not the one in force. Its questions will name their run, and runs will record the statement in force.

**14. D-116 — Confirm which build each server part is actually running**
*Waiting its turn · A group can install and run it*
The installer checks only the version of the server's routing layer, never the build its storage core or helper services actually serve. Those will be read back too, and the update check will name any part that lags.

**15. CAP-13 — Count distinct pages, not captures, when judging element reuse**
*Waiting its turn · Every kind of city document can become evidence*
A shared website element reused from an earlier fetch says it was seen "across N documents", but N counts captures, so re-captures inflate it and one page captured twice meets the two-document reuse minimum alone. N will count distinct page addresses.

**16. D-389 — Stop reporting a possibly partial list as complete**
*Waiting its turn · Knows what it holds*
The "frontier" report (what is known to exist but not yet held or processed) reads a fixed number of rows; when that read comes back full, the rest go unread, yet the report calls the list complete. It will then mark the list incomplete.

**17. REC-160 — Show withdrawn supporting links as withdrawn, not as support**
*Waiting its turn · Members can state findings and what they rest on*
The list telling members what to re-examine says every supporting link "rests on" a particular edition, so a withdrawn link reads as support. Links will be marked withdrawn or confirmed, and a withdrawn one will only say it named that edition.

**18. D-57 — Give the true reason when a page links to itself**
*Waiting its turn · Knows what it holds*
Self-linking pages, such as every Legistar calendar, make the link check use one capture as both "before" and "after" copy, so members are told the target changed. The "undetermined" verdict stays, but the stated reason will be that the page refers to itself.

**19. D-440 — Allow embedded-image references only in office files**
*Waiting its turn · Connects what it holds*
An embedded-image "part" reference is accepted on any capture that is not an office file, such as a web page or PDF, citing bytes the document lacks. It will be refused there, explaining that an image beside a page is its own document to capture.

**20. D-420 — Check PDF image references against where images actually appear**
*Waiting its turn · Connects what it holds*
An image reference by page and rectangle is accepted anywhere on the page, even where the PDF shows no image, and only a later crop refuses it. Captured PDFs will record where their images sit, and a rectangle matching none will be refused.

**21. D-390 — Split an oversized database lookup into safe chunks**
*Waiting its turn · Knows what it holds*
One lookup in the frontier report packs up to 200 items (2,000 at most) into a database query, while the server's measured limit is about 100; no instance has yet held that many. It will be split into chunks of 64, and similar lookups checked.

**22. D-60 — Monitoring should ignore changes that alter nothing of substance**
*Waiting its turn · Keeps its own record current*
Monitoring compares raw bytes, and a hidden field that changes with every response makes up 31% of a Legistar page, so every check reads "modified" and monitoring reports nothing useful. It will compare the page's substance fingerprint when it safely can, and say which comparison it used.

**23. D-65 — Make monitoring use each document type's change rules**
*Waiting its turn · Knows what it holds*
Monitoring treats every kind of document alike and keeps no dated record of its checks, though per-type rules for grading a change already exist, unused. It will apply those rules, report graded changes and log each check, keeping any checking frequency set for a document.

**24. D-169 — Record the reason when an intake question is set aside**
*Waiting its turn · A group can install and run it*
When a question that came in through intake is deferred or dismissed, the reason the rules require is silently left out, so the record holds an item failing its own checks that only an audit finds. The reason will now be written.

**25. D-171 — Name a revision's writer by write order, not by label**
*Waiting its turn · A group can install and run it*
When two record entries share a creation time, the lookup naming who wrote a revision breaks the tie alphabetically by a caller-chosen label, not by write order, so it can name the wrong writer. It will use write order, as a similar lookup does.

**26. D-179 — Refuse filing one captured copy under a second record item**
*Waiting its turn · A group can install and run it*
Filing captured bytes that one record item already holds under a second item silently moves their register entry, the record's proof of origin. As ruled, this will be refused before anything is written, naming the holder only to those allowed to see it.

**27. CAP-14 — Name which earlier capture a reused page element came from**
*Waiting its turn · Every kind of city document can become evidence*
When a capture reuses a shared website element fetched earlier, the record says when those bytes were fetched but not which capture fetched them. As ruled, each reuse will name that capture; older reuses will say "undetermined", never guessed from timestamps.

**28. D-54 — Set the server's outgoing-request limit explicitly**
*Waiting its turn · A group can install and run it*
The server's settings leave its limit on outgoing requests unset, so it is whatever Cloudflare's default is that month (Cloudflare says it rose from 1,000 to 10,000 in February 2026). It will be set on purpose, with its reason, and checked after each deploy.

**29. REC-159 — Let enrolled administrators manage members from their own sign-in**
*Waiting its turn · Members can reach what the record holds*
Adding and changing members and signers works only from the founder's session, so an enrolled administrator is refused and told the act is "reserved to an administrator", though they are one. They will be able to act, credited to them; plain members stay refused.

**30. REC-162 — Correct the refusal message for founder-only actions**
*Waiting its turn · Members can reach what the record holds*
Five actions work only from the founder's session, and an enrolled administrator refused one is told, falsely, that they are not an administrator. The message will say the action is reserved to the founder's session; the fetch-rate setting was ruled the operator's act.

**31. REC-155 — Open five actions to signed-in members; two stay machine-only**
*Waiting its turn · Members can reach what the record holds*
Seven actions members are allowed to use could not be reached from any signed-in session, and nobody had ruled why. Now ruled: five open to member and administrator sessions (provenance rebuilding and assessment, three calibration actions); a maintenance pass and a live test run stay machine-only.

**32. REC-158 — Refuse unnamed key-based writes of provenance judgements**
*Waiting its turn · Members can reach what the record holds*
The two provenance actions can write with an access key instead of a member's sign-in, recording a judgement the design says must be a named member's under nobody's name. Such writes will be refused once REC-155 is proven working; the read-only report stays open.

**33. D-311 — Make the "what you may do" list match reality**
*Waiting its turn · Members can reach what the record holds*
The server's advance list of what someone may do leaves out seven project-membership actions, and offers "publish" to automated accounts that it then refuses. This makes the list offer each action exactly where it would succeed, since offering what will be refused is an overclaim.

**34. UI-73 — Use plain-language refusal messages in eleven remaining places**
*Waiting its turn · Members can reach what the record holds*
Eleven places on the member screens still show a refusal's raw technical message instead of the plain-language translation UI-72 just built, so members meet machine vocabulary at the moment they are told no. This switches all eleven to that one translator, correcting just-landed work.

**35. D-82 — Mark inquiries that an AI assistant raised**
*Waiting its turn · Members can reach what the record holds*
The server notes when an automated assistant opens an inquiry, but the screens show it just like a member's, so a machine's question can read as a colleague's judgement. This adds one marker wherever inquiries appear, saying nobody has yet judged it worth asking; it hides nothing.

**36. D-125 — Let members mute a "finding" notice for themselves**
*Waiting its turn · Members can reach what the record holds*
A member cannot stop being notified about a "finding" in their queue, such as a public body's overdue next step, though Bob's ruling (DEC-10) allows it. This adds that personal mute, for one item or a whole case, changing nothing for anyone else; obligations stay unmutable.

**37. D-278 — Give the last uncoded server refusals a code and translation**
*Waiting its turn · Members can state findings and what they rest on*
A few server refusals (storage unavailable, an unknown action, some complaints made before sign-in) still answer with a bare sentence, with no reason code or plain-language translation. This adds both while keeping today's wording; the messages are already true, so it follows fixes to false ones.

**38. COFF-13 — Record a slide deck's true length, including unreadable slides**
*Waiting its turn · Members can state findings and what they rest on*
When a slide deck's last slides can't be read, the record stores the deck as shorter than it is and refuses true citations of those real slides as "past the end". This records each deck's actual length, or an honest "unknown" where a format can't say.

**39. D-52 — Tell every administrator when the whole record is exported**
*Waiting its turn · A group can install and run it*
Exporting the group's entire working record needs the master (root-of-trust) key and is logged, but no administrator learns of it unless they check the log. This puts a notice in every administrator's queue, as the membership design promises; email is Bob's call and not included.

**40. D-84 — Published cases name the declared biases they were held to**
*Waiting its turn · The group can publish and act on its findings*
Every published case must name the group's declared-bias statements in force, with a fingerprint of the set, but the server never writes them in. This stamps them into each case at publication, frozen; a case published without them can only be fixed by a new edition.

**41. D-220 — AI investigation counts repeat captures of one document once**
*Waiting its turn · Members can state findings and what they rest on*
The AI investigative session counts sixty captures of one document as sixty documents, overstating what the record holds in work members may accept. This makes it use the version links Bob ruled for in August, counting each document once with its captures as versions.

**42. D-182 — Unassessed actions read "undetermined", not "file freely"**
*Waiting its turn · The group can publish and act on its findings*
An action nobody assessed for legal risk is recorded as "file freely", an overclaim on the field carrying legal exposure. As ruled, it will read "undetermined" until a member chooses "file freely", "file with caution" or "do not file without counsel"; actions already recorded are never back-filled.

**43. D-178 — Fix the audit's checks on evidence resting on published cases**
*Waiting its turn · The group can publish and act on its findings*
The server's audit, which must read clean before a new version is served, isn't told which cases are published, so it flags correct evidence that takes its grade from a published case and skips the checks meant for it. This records what the fix will change, then makes it.

**44. UI-74 — Rebuild the step where members accept AI-proposed answers**
*Waiting its turn · Members can state findings and what they rest on*
Members must accept any AI-proposed answer themselves, affirming each line of reasoning stands alone, but that step was built on a side branch and never merged (yet recorded done), so no screen offers it. This rebuilds it on current code, noting when two parts share one capture.

**45. REC-161 — Check a member's draft reasons for a shared source**
*Waiting its turn · Members can state findings and what they rest on*
When a member states their own answer, nothing checks, before it is saved, whether two of their reasons trace back to the same captured document. This adds a read-only server check on the draft, matching the existing check's answer once saved.

**46. UI-75 — Tell members when two of their reasons share one capture**
*Waiting its turn · Members can state findings and what they rest on*
A member affirming that their answer "fails only if ALL of these fail" is not told when two of those reasons trace to one capture. Using REC-161's check, the read-back names each shared source once, before answers are saved; it only informs, filling in and blocking nothing.

**47. REC-164 — Record a group's display name and verified web domain**
*Waiting its turn · A group can install and run it*
A group is identified only by its short address name (its "slug"). This lets an administrator set a display name, always shown beside the slug, and claim a web domain that is shown publicly only while a regularly repeated check on that domain confirms it.

**48. UI-78 — Show a group's name and verified domain on public pages**
*Waiting its turn · A group can install and run it*
The screen half of REC-164: the public header shows the group's display name beside its slug, never instead of it, and a web domain only while verified. Members can see the domain claim and its dated check result.

**49. MK-6 — Keep members' identities out of their observations' published files**
*Waiting its turn · Knows what it holds (a member's own knowledge, recorded as what it is)*
A member's firsthand observation carries their member ID in files a ratified case would publish. This replaces it, everywhere publishable, with an anonymous reference only the group's own register can resolve; nothing publishes yet, as a temporary block still keeps such observations out.

**50. MK-7 — Let members choose their credit, then let observations publish**
*Waiting its turn · Knows what it holds (a member's own knowledge, recorded as what it is)*
Each observation's author chooses, per case edition, how it is credited (group, project, cover or handle), with no default, and until every observation a case uses has a choice, the case cannot be ratified. Then the temporary publishing block lifts; that veto and "name" meaning handle stay provisional for Bob.

**51. MK-5 — Opinions may appear in cases but never count as evidence**
*Waiting its turn · Knows what it holds (a member's own knowledge, recorded as what it is)*
A member's opinion can be part of a case, with the attribution its author chose, but is refused by name if cited as supporting evidence, even weak evidence, because an opinion is not evidence. Screens for it are not part of this item.

**52. M0-71 — Measure contradiction-spotting accuracy before members ever see it**
*Waiting its turn · How the team works (process), a verification step*
Before members see any contradictions the system flags, this builds a labelled test set and measures, without writing to the record, how often a candidate method raises false conflicts and how many real ones it catches. It records the pass mark REC-147 must meet (step 2 of 3).

**53. REC-147 — Store machine-spotted contradictions as proposals, if accurate enough**
*Blocked: waits for M0-71's measurement to meet its pass mark · Members can state findings and what they rest on*
If M0-71's pass mark is met, the machine labels each candidate contradiction (sources conflict, the group's own holdings conflict, only precision differs, unrelated, or can't tell) and stores it as a marked "proposed" machine judgement. If it is missed, that is the finding and this goes back to BOB.

**54. UI-68 — Screens for sharing a case's review copy, without export**
*Waiting its turn · The group can publish and act on its findings*
Builds the screens for a review copy, a draft case shared for comment that never leaves the group's own system: editors draft, the owner grants and revokes access, and participants and recipients with a secret link read and comment. Deliberately, nothing can be exported or downloaded yet.

**55. REC-148 — Stamp review copies with fingerprint, date, author and thresholds**
*Waiting its turn · The group can publish and act on its findings*
A review copy must carry four facts: a fingerprint of exactly what it shows, its date, its author and the project's two minimum-strength thresholds, matching a published case's header. It carries only date and author, so this adds the rest before any copy leaves the group.

**56. UI-69 — Export review copies, stamped on every page**
*Waiting its turn · The group can publish and act on its findings*
Adds the export UI-68 held back: every page of an exported review copy carries REC-148's four facts, and at the moment of export the member is told once that what leaves cannot be revoked; only the access grant can.

**57. D-148 — Record agency fee quotes as structured, comparable evidence**
*Waiting its turn · The group can publish and act on its findings*
An agency's fee quote can be recorded only as free text, so quotes can't be compared across agencies or over time. Per Bob's ruling that a fee quote is evidence, a reply can carry the amount, currency, stated basis and the request it answers, and revisions, including waivers, keep both entries.

**58. D-149 — Records requests list every law that governs them**
*Waiting its turn · The group can publish and act on its findings*
A records request can't say which laws govern it. Per Bob's ruling that every records law governing the agency asked applies, a member can list them, each marked federal, state or local; an empty list reads "undetermined", never a default, and automated accounts can't set it.

**59. REC-149 — Discoverable or hidden projects, 1 of 4: the server's rules**
*Waiting its turn · Members can reach what the record holds*
Per Bob's ruling, an owner can make a project discoverable or hidden; unset means hidden, and existing projects start hidden. Members outside a discoverable project see only that it exists and can ask to join, never its contents; a hidden project looks exactly like one that doesn't exist.

**60. REC-150 — Discoverable or hidden projects, 2 of 4: requests to join**
*Waiting its turn · Members can reach what the record holds*
A member can ask to join a discoverable project (one open request, optional comment) or withdraw; the owner grants, which invites them, or declines, on the record. Only the requester, owners and administrators see requests; administrators and the founder cannot answer them, and requests lapse if the project goes hidden.

**61. UI-70 — Discoverable or hidden projects, 3 of 4: forms must ask**
*Waiting its turn · Members can reach what the record holds*
The create and fork forms must ask whether a project is discoverable or hidden, with neither preselected, and cannot submit without a choice; the owner can change the setting and others see it read-only. It follows UI-66, which changes the same forms.

**62. UI-71 — Discoverable or hidden projects, 4 of 4: directory and requests**
*Waiting its turn · Members can reach what the record holds*
Builds the screens: the project directory; the request-to-join button and comment; the owner's list of open requests with grant and decline; and each requester's own requests and status. They show the server's answers as given, and a hidden project never appears in the directory.

**63. D-260 — Resume paused AI runs once their awaited capture completes**
*Waiting its turn · Members can state findings and what they rest on*
When an AI investigation waits for a document capture, nothing restarts it once the capture finishes. As ruled, a group's system may hold one organisation AI account, carried by the installer as a secret, and resumes only runs opened under it; a member's own run is not resumed, and says so.

**64. D-126 — Handle several queue items at once, each judged separately**
*Waiting its turn · Connects what it holds; screen half: Members can reach what the record holds*
Members can't select several queue items and handle them together. This lets deciding on a finding, resolving a task or forwarding one apply to a selection, each item succeeding or staying listed with its reason (never all-or-nothing), server first, then the screen.

**65. D-134 — Let administrators manage members and signing keys**
*Waiting its turn · Members can reach what the record holds*
No screen lets administrators add a member, change a member's status, or add or change a signing key, though they can see membership. This builds those four, credited to the administrator and absent for ordinary members, after REC-159 opens them to administrators' sign-ins.

**66. D-74 — Measure which reference numbers Oakland's systems share**
*Waiting its turn · Connects what it holds*
Chains of events spanning Oakland's systems connect only at grade C, by names or dates, because nobody has measured which reference numbers the systems share. This measures five kinds, including contract, parcel and fund numbers; each found in two systems lifts a chain to grade B.

**67. REC-122 — Member chooses which mention a connection rests on**
*Waiting its turn · Connects what it holds*
When a document mentions something in several places, the system honestly says "undetermined" about which mention a connection rests on. This lets a member record, in their name, which one is on point, making the answer definite; the machine may suggest, never choose.

**68. D-394 — Tell members a cited document has a newer version**
*Waiting its turn · Connects what it holds*
A member whose case rests on a passage is never told a newer version of its document was captured. The system will say so with certainty and offer a possible match for the passage, or say it cannot tell, changing nothing the member cited.

**69. D-86 — Flag analysis runs owed a re-run after a lens change**
*Waiting its turn · Connects what it holds*
An analysis run records the group's declared bias (its "lens") when it starts, and the system can tell when that lens later changes, but nothing says a re-run is owed. This adds a regular sweep raising one notice per affected run, blocking nothing.

**70. D-162 — Connect documents through a member-declared theme**
*Waiting its turn · Connects what it holds*
Connections need a shared named thing, so two documents about one idea cannot be linked. Per Bob's ruling, a member declares a theme with a written test and places documents in it; machine suggestions stay hunches until confirmed, and no claim may rest on a theme.

**71. UI-76 — Screens to declare, test and place themes**
*Waiting its turn · Members can reach what the record holds*
The member-screen half of D-162: declare a theme with its test, place a document or part of one in it, and confirm or leave a machine's suggestion. Every theme shows who declared it, and suggestions display as hunches, never as confirmed membership.

**72. CAP-11 — Measure how reliable Google Drive document exports are**
*Waiting its turn · Every kind of city document can become evidence*
Downloads each of the 22 Google Drive files linked from city documents several times per format, recording whether the text stays stable and faithful. Exported text is capped at "undetermined"; this evidence lets a later step raise that cap.

**73. D-351 — Stop unchanged Drive files looking changed on download**
*Waiting its turn · Every kind of city document can become evidence*
Drive exports differ byte-for-byte on every download, so monitoring reports a change each time and checks for the same document never fire. This adds a fingerprint of the stable inner content; the download's own fingerprint stays the root of trust.

**74. FW-20 — Recognise staff-directory pages, after re-checking they can be read**
*Waiting its turn · Every kind of city document can become evidence*
Adds recognition of city staff-directory pages, the last of four measured document classes. None of 30 sampled directory PDFs could be read as text, so it first re-measures with text-from-images reading, closing on that finding if they stay unreadable.

**75. D-66 — Count budget and dataset documents before any reader**
*Waiting its turn · Every kind of city document can become evidence*
Budgets and datasets have no content type and were never counted. This adds them to the document census, judged by contents rather than file names, and reads a sample to record what they hold; any reader is a later entry.

**76. CPDF-3 — Verify PDF structure reading live on real Oakland PDFs**
*Waiting its turn · Every kind of city document can become evidence*
Confirms on the live server, in a scratch area cleaned up afterwards, that the PDF structure reader correctly maps real captured Oakland agenda PDFs to their items. Its stated blocker, a pending deploy, proved false.

**77. D-50 — Add an automated check for duplicate project names**
*Waiting its turn · A group can install and run it*
The server refuses a duplicate project name at creation, but the automated checks that judge a whole record, such as one brought in from elsewhere, never look for duplicates. This adds that check, ignoring case and spacing and including deactivated projects.

**78. M0-104 — Refuse publishing work after a failed uncommitted test run**
*Waiting its turn · How the team works (process)*
A test run on uncommitted changes records no result, so a failed run followed by committing and publishing everything passes the publish check. This records such a run's result against exactly the snapshot a commit would publish, so the check can refuse it.

**79. M0-105 — Trim the verification rulebook so new rulings fit**
*Waiting its turn · How the team works (process)*
The verification rules document is 4 bytes under its size limit, so new rulings land in an archive nobody reads whole. This trims it to 22 KB, archiving history word for word and keeping every rule, then adds M0-104's rule and an M0-97 example.

**80. M0-84 — Warn when a retired session publishes after its successor**
*Waiting its turn · How the team works (process)*
Nothing notices when a lane's older session publishes work after its replacement took over, as BOB #17 did after BOB #18, unnoticed for hours. This adds a plan-check warning naming both changes, unless the older session touched only its handoff note.

**81. M0-85 — Heartbeat should count from the current task list**
*Blocked on Bob's approval · How the team works (process)*
The scheduled heartbeat, whose idle-with-work alarm reaches Bob's phone, counts tasks from a copy of the list that never updates (34 changes behind on 2026-09-21). The fix reads the current list; the heartbeat's definition lives outside the repository and is Bob's to approve.

**82. D-412 — Report unused working copies whose disk can be reclaimed**
*Waiting its turn · How the team works (process)*
Nothing reclaims working copies that are clean, merged and used by no live session, though each costs about 286 MiB and disk is CONDUCT's tightest limit. This adds a check listing them with their size, never naming one a live session is using.

**83. REC-154 — Trim the RECORD lane's instructions to the reading limit**
*Waiting its turn · How the team works (process)*
The RECORD lane's instructions are 36,709 bytes against a 24,576-byte reading limit, so its sessions cannot read them whole. This cuts the file while no RECORD worker is active, archiving removed text word for word, and makes the limit enforced for it.

**84. CPDF-21 — Trim the CONTENT-PDF lane's instructions to the reading limit**
*Waiting its turn · How the team works (process)*
The CONTENT-PDF lane's instructions are 25,863 bytes against the same 24,576-byte limit, so the lane cannot read them whole. This cuts the file as REC-154 does, archiving removed text word for word, so that any later overrun fails.

**85. M0-82 — Add a duplicate-session check to CONDUCT's fallback start**
*Waiting its turn · How the team works (process)*
When CONDUCT starts its own successor because no BOB session answers, it must first confirm no live session holds the lane, retiring any duplicate rather than renaming it. The rule goes into its instructions within their reading limit, anything cut archived word for word.

**86. LED-8 — Make the ID lookup flag duplicates and show both**
*Waiting its turn · How the team works (process)*
Six registered ID collisions make the lookup tool return two different rows for one ID. Since cited IDs must keep working, none is renumbered: the lookup reports the collision and shows both rows, and one empty duplicate heading is deleted.

**87. LED-9 — Check that a task's foundations are actually built**
*Waiting its turn · How the team works (process)*
The plan check asks if prerequisite tasks are done, never if what a task rests on is built. This makes it consult the status record, failing work placed above unbuilt foundations and reporting as unjudged any task naming them only in prose.

**88. M0-115 — Stop one test breaking when D-388 moves**
*Waiting its turn · How the team works (process)*
A test requires D-388's line in the live debt list, so moving it out, as folding that list into the plan will, would fail every test run. The fix, landing before that move, looks D-388 up and requires an open entry wherever it lives.

**89. D-107 — Give the installer a verified, scripted deploy**
*Waiting its turn · A group can install and run it*
The installer is deployed by a dashboard paste that records nothing; D-106 went unnoticed for thirteen releases in that gap. A deploy script will read it back and fail unless it matches the signed release, with the right version and no added connections.

**90. D-438 — Repair the refusal-message check's failing self-test**
*Waiting its turn · How the team works (process)*
The self-test proving that the refusal-message check (every server refusal carries a code and a plain-language message) catches problems is failing: four parts fail for reasons unrelated to what they test. This fixes each, re-counting two stale figures and naming the refusals that changed them.

**91. M0-102 — Fix three test instruments that pass when they shouldn't**
*Waiting its turn · How the team works (process)*
Two coverage minimums fail only on a drop, so one set too low never fails; refusal-code minimums read uncommitted files, so a stray file can hide a drop; one self-test looks for code no longer there. Each is fixed so it can fail.

**92. M0-93 — Fix the cross-lane request self-test failing on main**
*Waiting its turn · How the team works (process)*
A self-test for the tool tracking work requests between lanes fails on the main line, assuming each request carries one "still open as of" date when the tool allows several. This corrects the self-test to match the tool; the record's real dated lines stay.

**93. M0-94 — Make the test census fail on unrecognised failures**
*Waiting its turn · How the team works (process)*
The tool inventorying self-test programs prints "UNCLASSIFIED" when one fails with an unrecognised message, yet still reports success. This makes that fail the census, still labelled unclassified, and counts them; it waits on M0-93 and D-438, which it would otherwise turn red.

**94. D-380 — OCR helper's tests must run on fresh copies**
*Waiting its turn · How the team works (process)*
On a fresh working copy the OCR (text-from-images) helper's tests silently don't run while the test battery reads green, and the skip message offers a remedy that cannot work. This loads its test tools as the other helpers do and corrects the message.

**95. M0-80 — Make four refusal-code tests really check the message**
*Waiting its turn · How the team works (process)*
Four refusal codes' tests pass only because their test data omits the plain-language message the server sends, so nothing is compared. This fixes the four and, since 185 of 198 examples lack it, counts those thinner than the server's reply, with a limit.

**96. M0-92 — Catch design pointers to files that don't exist**
*Waiting its turn · How the team works (process)*
The tool checking that each task names its design document accepts a path to a missing file if a same-named file exists elsewhere; D-339 cited a nonexistent document and passed. This reports such paths as dead, while correct paths and bare names still pass.

**97. D-437 — Test helper misreads some true-or-false comparisons**
*Waiting its turn · How the team works (process)*
A shared helper that three automated checks rely on claims to recognise every kind of true-or-false comparison in the code, but misses four (such as "at most" and "at least") and wrongly counts three that are not. No check is known to answer wrongly today, though three of the missed cases would change a verdict. Comes after D-438.

**98. M0-87 — Plan checker mistakes an unfindable citation for missing design**
*Waiting its turn · How the team works (process)*
Part of the plan checker tests whether the design section a plan entry cites actually describes what the entry builds. When it cannot find the cited section at all, it wrongly warns that the design does not cover the entry, instead of saying it could not judge (or checking the whole document). No current entry triggers this, but one could.

**99. M0-88 — Re-aim a case-ratification test at the danger it names**
*Waiting its turn · How the team works (process)*
A deliberate-break test (breaking code on purpose to prove the checks notice) should show the checks catching a dangerous case: the record crediting a ratified case to a project no signature covers. It uses a project nobody has joined, so a membership safeguard refuses it first and the dangerous case goes untested. The fix uses a project the member has joined.

**100. M0-89 — Judge one image-reading routine the workload test never checked**
*Waiting its turn · How the team works (process)*
An automated test hunts for server code whose work can multiply without limit, with a hand-kept list covering what it cannot see into. That list predates the test seeing one routine that reads an image for every stored item, so the routine has never been judged. The fix measures it and records a verdict with its reason.

**101. D-439 — Replace two hand-kept copies in the tests with shared ones**
*Waiting its turn · How the team works (process)*
Two pieces of test machinery are hand-kept copies: text-reading code duplicated across four suites that test the AI's skill pack, and a hand-typed list of files three suites depend on. They agree today, but copies drift silently, and one new dependency would break all three suites without naming the cause. The fix shares the reader and derives the list automatically.

**102. M0-95 — Break-test scripts leave backup folders behind when they fail**
*Waiting its turn · How the team works (process)*
By a rough count, 34 scripts that break code on purpose to test the tests leave their folder of backup copies behind when a run fails (two never remove it). The leftover makes a session's workspace look unclean, which blocks archiving that session, and could slip into a commit by accident. The fix removes it on every kind of exit.

**103. M0-96 — Two break-test scripts ignore stop requests until finished**
*Waiting its turn · How the team works (process)*
Two scripts that temporarily break real source files to test the tests don't act on a stop request until their whole run ends (measured: a stop sent at 1 second took effect at 4), so they keep editing real files after being told to stop. The fix lets them stop promptly and put every file back exactly as it was.

**104. M0-77 — ID-issuing tool silently does nothing through a linked folder**
*Waiting its turn · How the team works (process) — background task*
The tool every lane uses to issue new ids silently does nothing, yet reports success, when started through a linked (shortcut-style) folder path, as macOS's temporary folder is. The fix makes it run correctly that way, then checks about 25 other tools that start up the same way and fixes any with the same flaw.

**105. M0-68 — Correct a live test still expecting a since-fixed refusal**
*Waiting its turn · How the team works (process) — background task*
A test run against a live server copy still expects a refusal that the fix for D-323 removed, so on every current server it fails four checks because the fix works, not because anything broke. The fix corrects the test to expect the new behaviour, or retires it for a local test covering the same question; it is never simply exempted.

**106. M0-72 — Fix a stale test name causing a false failure report**
*Waiting its turn · How the team works (process) — background task*
The deliberate-break test for the merge checker (which confirms a merge kept everything a branch changed) reports a false failure: one step expects a named check to fail, but that check has since been renamed. The break itself works as intended; only the name is out of date, and the fix updates it to the full current name.

**107. M0-74 — Repoint a diagnostic probe at a check that moved**
*Waiting its turn · How the team works (process) — background task*
A diagnostic probe fails one of its ten checks on the main line because it looks for the check on whether a link has been cut where that check used to live, before D-267 moved it. The probe isn't part of the regular test runs, which is why those stayed green; the fix points it at the new location.

**108. M0-90 — Let a publishing probe actually reach its ratification step**
*Waiting its turn · How the team works (process)*
A probe built to test the rule that a case resting on a member's own firsthand observation cannot yet be published never reaches that step: its sample inquiry is concluded without naming the claim it adopts, so it is refused earlier. It now reports that path as dead rather than passing; the fix names the claim. Regular tests already check the rule.

**109. M0-91 — Add the missing test for all-digit ids in citations**
*Waiting its turn · How the team works (process)*
A citation can point at one part of a document by that part's id; an unquoted all-digit id is read as a number, and the citation could silently widen to the whole document. A check refuses this (D-362's fix), but no test has ever triggered it, so a later change could quietly undo it. This adds that test.

**110. D-40 — Fix sample test data using a disallowed importance label**
*Waiting its turn · How the team works (process)*
A test helper still builds sample items with the importance label "notable", which the record's rules refuse (only "crucial" or "supporting" are allowed), though the defect was recorded as fixed. No test is wrong today; the fix uses an allowed label and marks three tests that use "notable" on purpose, as filter data, so nobody copies it.

**111. M0-75 — Make two test suites report their check counts**
*Waiting its turn · How the team works (process) — background task*
Two test suites don't print the standard line counting their checks, so every full test run's summary notes that two suites were left out of its count. The fix has each print an honest count of the checks it actually makes, which removes that note and raises the reported total by exactly those two counts.

**112. M0-76 — Repair the break test guarding the evidence-strength bar fix**
*Waiting its turn · How the team works (process) — background task*
D-280's fix stopped a project that withdrew from a document from still setting that document's required evidence strength for publishing. Some steps of the deliberate-break test guarding it misreport on every run, and none covers the strength-bar read itself. The fix corrects them, adds that step, and checks whether misspelled link statuses (like "Severed") can enter the record.

**113. M0-69 — Wiping the scratch area should also wipe test members**
*Waiting its turn · How the team works (process)*
Wiping the server's scratch (testing) area leaves behind the member entries live tests create, and administrator and consensus counts read them, so each test run changes the membership arithmetic of the next. The fix makes a scratch wipe clear every member-related table, listed automatically from the database design; a wipe of the real record never touches members.

**114. M0-70 — Live test explains its leftover proposal and cleans up**
*Waiting its turn · How the team works (process) — background task*
When a live test's attempt to add a member is refused, a membership proposal is left for administrators to endorse, which is correct by design. The test will say so in its own output, then wipe the scratch area and confirm no members remain. It comes after M0-69 (which makes that wipe possible) and M0-68 (same test file).

**115. VF-7 — Verify the first live runs of monitoring and archive fallback**
*Waiting its turn · How the team works (process) — background verification task*
Watches the first live runs of two automatic features — scheduled re-checking of monitored sources, and falling back to a web archive when a source stays unreachable — confirming they use the limited automatic credential, never the master administrator one. The entry says it waits for the next deploy; its own notes say that deploy already happened (release 0.58.0).

**116. D-92 — Re-test unexplained refusals when members read stored files**
*Waiting its turn · How the team works (process)*
In July, members reading stored items on the live server were sometimes refused as "forbidden" during back-to-back requests, a different item each time, so not a real permission limit; it nearly produced a false finding that eleven items had no recorded source. A limited test will see if it recurs: a cause found gets its own fix; otherwise this closes as not reproduced.

**117. D-59 — Can the strongest "same version" link verdict ever occur?**
*Waiting its turn · Knows what it holds*
For links between captured pages, the strongest verdict, that the copy held is exactly the version linked to, has never been seen on real data: as built, it needs identical bytes from two fetches, and two captures of an Oakland Legistar page twelve minutes apart differed. A limited test will measure which sites repeat; whether to keep that route goes to BOB.

**118. M0-66 — Stop a test mistaking explanatory comments for real code**
*Waiting its turn · How the team works (process) — background task*
A test checks that the lines of code each deliberate-break script quotes still exist. It mistakes code mentioned in the scripts' explanatory comments for real quotes, which produced two false findings on 2026-09-17 and in effect penalises scripts for documenting themselves. The fix ignores comments while still catching a real quote that no longer exists.

**119. M0-64 — Re-aim or retire a test step whose subject vanished**
*Waiting its turn · How the team works (process) — background task*
One step of a deliberate-break test shows a census of id series admitting when it cannot detect ids issued outside the id tool. The series it used is now checkable, so the step no longer tests what it claims and partly passes for the wrong reason. The fix re-aims it at the one series still uncheckable, or retires it with the evidence.

**120. M0-44 — Test misses seven answers flagged as cut short**
*Waiting its turn · How the team works (process) — background task*
The test that checks server answers stay within limits, and honestly say when they were cut short, recognises only one way of writing "cut short", so seven places written differently have never been checked. The fix widens its reading and re-counts every list it feeds, explaining each change. (Briefly started on 2026-09-17, then put back with nothing lost.)

**121. M0-33 — Add a third check to the break-test health census**
*Waiting its turn · How the team works (process) — background task*
Deliberate-break scripts can quietly stop working in three known ways, and the periodic census of them watches for two. This adds the existing sweep for the third, a script whose target no longer exists (such as a deleted file), so an unexplained case fails the census and cases already explained are listed as notes.

**122. SK-5 — AI assistant's step-by-step recipes, checked against real screens**
*Blocked — waits for the server to publish its list of app screens, which nothing does yet · Members can state findings and what they rest on*
Adds the "recipes" layer to the AI assistant's training pack: step-by-step paths to a result, each step naming an app screen and a server action. It is only worth having if a recipe naming a screen or action that doesn't exist fails the build; writing recipes before that check is possible would only create the appearance of a layer.

**123. UI-60 — Placeholder for interface work not yet split into tasks**
*Blocked — waits for Bob to re-prioritise interface work (content comes first for now) · Members can reach what the record holds*
A placeholder listing interface work still to be planned: fuller phone support; a hardening pass (keyboard and screen-reader access, speed with 500+ items, rotating deploy keys); screens for members' expertise and licences, verified export and new-member requests; and some unfinished document-version actions. When interface work resumes each becomes its own task; nothing is built from this entry.

**124. REC-15 — Pre-publication check before a case goes for signatures**
*Blocked — deferred by Bob (DEC-33) until he reopens case-making; also waits for REC-14 · The group can publish and act on its findings*
One server action that checks, before anyone signs, whether a case can be published: it would refuse, naming each problem, when the group has no one set up to sign, when any part rests on an uncleared hunch, or when the evidence falls below the project's required strength. Bob deferred the publishing process; for now publishing runs through the operator.

**125. UI-17 — The on-screen ceremony for publishing a case**
*Blocked — deferred by Bob (DEC-33); waits for REC-15 and UI-11 · The group can publish and act on its findings*
The guided screens for publishing a case: showing the evidence it rests on, a stage for putting the case to its subject for a response before signing, and a plain statement that publishing cannot be undone (corrections go forward). Bob deferred this process; for now publishing runs through the operator, with a simpler screen (UI-17a) shipped in its place.

## Decided, and waiting to be placed in order

These three were ruled on 2026-09-22 and wait in the lead's inbox for the scheduling lane to place them:

**D-150 — A second person checks what a published case leaves out**
*To be placed · The group can publish and act on its findings*
Every published case states what it leaves out. A second member, or a reviewer who was sent the draft, can now formally
acknowledge that statement, and the published case lists who did — or says plainly that nobody but its author did. It
never blocks publishing, because a group may be one person.

**D-147 — Track every stage of a public-records request**
*To be placed, after D-148 · The group can publish and act on its findings*
A records request becomes a chain of dated steps — the request, a fee estimate, a fee-waiver decision, partial
productions, a denial, an appeal and its outcome — each answering the one before. A member may note when the next step is
legally due, citing the law; BIO never assumes a deadline, and a missed one it was told about is flagged.

**D-128 — Keep every version of "how a body is supposed to work"**
*To be placed · Connects what it holds*
A group describes how a public body is supposed to handle something, such as a contract going from solicitation to award,
and BIO compares that with what actually happened. Today revising the description erases the old one; from now on each
revision is kept, with its reason, so earlier findings can still be explained.

## Not in the plan yet

- **95 older defect records** still sit in the separate defect list. Entry 1 (LED-7) folds them in: each is checked
  against the code first, then closed with evidence, placed in order, or recorded as a permanent limit.
- **Two watched items (D-159, D-165)** are set aside until something specific happens: once a real group has published
  and acted on findings (milestone M10), the lead re-reads them.
