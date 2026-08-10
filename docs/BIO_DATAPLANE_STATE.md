# BIO data plane: source state, migration plan, and build status

v32, July 27, 2026, third entry of the day. The plane is **0.35.0**, signed,
deployed and verified on biosmoke7, deployed bytes hash-identical to the
signed asset
(`3a028c8a97cb36a4633e56d5dbbed262ffa163f3448a780961c7ad0cb28640b3`).
Battery **1573 assertions green across 34 suites** plus the wizard's 90.

**THE FOCUS RENAME'S CODE SIDE IS DONE.** `focus` is the canonical
object_type end to end: the check catalog (OBJECT_TYPES with a FOCUS prefix,
`focus@1` schema, HEADINGS, the state machine with `STATES.problem` pointing
at the SAME object as `STATES.focus` so the tables cannot drift), the intake
form (Focus option, FOCUS- ids, focus@1 stamps), the browse surface
("Focuses"), and dispose. `problem` is a LEGAL LEGACY ALIAS everywhere it
already exists, judged by normalized type: a fully legacy `problem`/
`problem@1` document is conformant, a PROB- id carrying modernized
`focus` frontmatter is coherent (prefix and schema comparisons normalize),
and no history row was rewritten. THE PROJECTION IS THE LAYER THAT
NORMALIZES, as the decision doc promised: an idempotent boot UPDATE moved
existing rows, the upsert maps `problem` to `focus` on every future write,
`type:focus` and the legacy `type:problem` filter spelling both answer,
schema stamps stay document truth, and the type facet answers with one
spelling instead of a split count. The new focus suite (13 assertions) holds
all three claims in the directions a rename silently breaks: canonical
works, legacy keeps working, projection normalizes. Verified LIVE after
deploy: the store's one legacy Problem bundle answers `type:focus`, facets
as `focus`, still answers the legacy spelling, and `op=audit` stayed 30
checked, 30 clean, which is the append-only promise kept.

v31, July 27, 2026, later the same day as v30. The plane is **0.34.0**, signed,
tagged, deployed and verified on biosmoke7, deployed module bytes hashing
identically to the signed asset
(`4318de910fdfe67c9d3fcc845d20d161315effe59dbcbe0133ffd6176ec41fe7`).
Battery **1557 assertions green across 33 suites** plus the wizard's 90. Live
record unchanged, `op=audit` 30 checked and 30 clean after the deploy.

**S-11 IS COMPLETE. Step 5, bulk release, `op=release`, shipped in 0.34.0**
exactly as specified by Bob's 2026-07-27 rulings and Intake Doctrine v1.2:
collected -> verified over a selection at refuse weight, whole set or nothing.
The four properties that carry the doctrine, all asserted in
test/release.test.mjs (31 assertions): a NAMED MEMBER authors it, with the
machine-shaped author stamp (`token:<class>`, the generic `member` default, or
absence) refused as MACHINE_CANNOT_RELEASE; the ACKNOWLEDGMENT IS A RECORD,
with the member's homogeneity acknowledgment and mitigation steps required
parameters written into every released document's Session Log under a
`Released (batch)` heading, so batch releases are permanently distinguishable;
CRUCIAL NEVER RIDES A BATCH (CRUCIAL_IN_BATCH, offenders named, set refused
whole); and NOTHING VERIFIED HERE AUDITS DIRTY, with C-2.7's verified-entry
requirements (well-formed content_hash, data/dataset.json, a snapshots/ file)
checked per member BEFORE any state moves (ENTRY_REQUIREMENTS, offenders and
their exact lacks named). Release is not repeatable (ILLEGAL_TRANSITION from
verified or retired), non-Information refuses the set whole, an empty
selection is a refusal rather than a no-op, and the C-18.1 interplay is
asserted both ways: the transition this op writes carries the member author
and passes the check whose refusing direction the conformance suite already
held. The live behavior poll after deploy: `op=release` reachable and a
machine credential refused by name, which is the doctrine running in
production. The op rides STATE_ACTIONS, so it takes the server-side viewer,
owner and author stamps; capability is `contribute` like its siblings, with
the named-member rule enforced by the store on the author's SHAPE, since the
rule is about who a session IS, not what it may touch.

v30, July 27, 2026. Current state, on top of v29 and the narratives below. The
plane is **0.33.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed module bytes hashing identically
to the signed release asset
(`f89a9c7ac37319bbdcb3681b3288f75b954a81fbd1d1d0d39cbfb0bfb62fe481`).
Battery **1522 assertions green across 32 suites** plus the wizard's 90. Live
record unchanged at 30 bundles, 137 files, 239 history rows, 10 refs, 87
register rows, `op=audit` 30 checked and 30 clean after the deploy.

**CLASSIFICATION IS REMOVED FROM THE INFORMATION CATALOG, by Bob's decision in
the 2026-07-27 trust session: removed, not deprecated.** The finding that made
it cheap: nothing consumed it. The field appeared in the INFO_ENUMS table and
nowhere else; no check branched on it, no op read it, the doctrine's
load-bearing quality field is criticality. The reasoning that made it right:
fact/analysis/judgment is a stance a citing project takes toward a passage,
not a property a document has. The city's financial report is fact when a
project cites its table and judgment when it cites its characterisation of
lawfulness. The vocabulary moves to the citation model when anchored citations
land (see the kickoff's trust section for that direction).

What removal touched: the enum left `checks/bio-checks.mjs`; the column left
`src/schema.mjs` so a fresh install never has it; every projection write and
the upsert left `src/store.mjs`; the filter key, the default facet and the
provenance column left `src/query.mjs`; the instance page's facts card and the
typed-intake template left `src/setup.mjs`; the migrate tool stopped writing
it; and twenty-one suites and probes dropped it from fixtures and assertions.

**THE FIRST DESTRUCTIVE COLUMN MIGRATION THIS STORE HAS EVER RUN.** Boot now
drops `bundles.classification` if present, guarded on PRAGMA table_info so it
is idempotent across every boot, mirroring the additive ensureColumn pattern in
reverse. It ran live at deploy: the DO booted, `op=stats` answered the
unchanged record, and `op=search` answered with the new default facet set,
which is the BEHAVIOUR poll (standing lesson 9), not the version string.

**ASSERTED BOTH WAYS (standing lesson 2).** Every fixture in the battery now
omits the field and conformance-checks clean, which is the absent direction.
The present direction is a new conformance case: a bundle still CARRYING
`classification: fact` draws no finding of any severity, because history is
append-only and the live corpus drains the field on each bundle's next
promotion, not by decree. A catalog that errored on presence would have flagged
all 30 live bundles for a field it no longer defines, and `op=audit` staying
30/30 clean after the deploy is that assertion made against the real record.

**Frontmatter residue is inert and expected.** The 30 live bundles keep the
field until each is next promoted; nothing rewrites history and nothing needs
to.

v29, July 26, 2026. Current state, on top of v28 and the narratives below. The
plane is **0.32.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`138c1c6a8be5e4401a5bcf432d082d26bdfad60ad349de42ef18f09b69582500`).
Battery **1503 assertions across 32 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**S-11 STEP 4: BULK RETIREMENT OF INFORMATION, `op=retire`, weight `refuse`.**
Heavier than step 3's disposition for one structural reason: `retired` is TERMINAL
in the catalog's table, where every Problem disposition is reversible. A wrong
disposition is corrected by disposing again; a wrong retirement cannot be undone
through the state machine at all, so every refusal here is worth more than the
equivalent refusal there.

Only `verified` to `retired`, because that is the only legal edge. Retiring
something merely `collected` would skip the step where a human looked at it, which
is what the intake doctrine exists to protect.

**AND THE DOCTRINAL GUARD: INFORMATION A PROJECT STILL CITES IS REFUSED.** Nothing
in the catalog stops this, which is exactly why it matters. C-6.2 treats an
unresolvable reference target as an ERROR whose remedies are restore from history,
re-point to the successor, or sever the edge with a reason. A bulk retirement that
silently stranded live citations would manufacture that error condition at
whatever scale the operator selected. The citing Projects are NAMED, because an
operator told only "refused" cannot act.

A SEVERED edge does not count as a citation. Severing is the recorded decision to
stop relying on something, so counting it as a live dependency would make the
refusal unclearable by the very act doctrine prescribes for clearing it. Asserted
end to end: refused while cited, proceeds once severed. This reads the citing
DOCUMENT rather than the `refs` projection, because `refs` carries the edge but
not its status.

**THE BEFORE-CHECK CAUGHT MY OWN FIXTURE, TWICE IN TWO RELEASES.** The new
Information fixture was missing two required headings, the C-13.2 Session Log
entry, the `source_status` field, and used a `monitoring.frequency` outside the
enum. Five findings that would have appeared identically in the after-check and
proved nothing about retirement. Standing lesson 4 is not a formality; it has now
paid twice in two consecutive releases, both times against fixtures I wrote
believing they were fine.

v28, July 26, 2026. Current state, on top of v27 and the narratives below. The
plane is **0.31.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`9e28174b81e6a7e275e75acd80cdbff6a06bfc11c060e6c8fc54ea257a899315`).
Battery **1490 assertions across 32 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**S-11 STEP 3: BULK DISPOSITION OF PROBLEMS, `op=dispose`, weight `refuse`.** The
first selection-backed action to move an OBJECT's state rather than an edge's. An
edge is a claim about a relationship; a state is a claim about where the group's
thinking has got to.

Only `deferred` and `dismissed`. `elevated` is a legal Problem state and is
refused BY NAME rather than by omission, because elevating writes an
`elevated_into` edge and a Project bundle, so as a bulk state flip it would
produce Problems claiming to be elevated into nothing.

A selection carrying a non-Problem is refused WHOLE with offenders named, never
narrowed to the valid subset: the operator picked a set, and disposing part of it
decides something they did not.

**C-4.2 CAUGHT A REAL OMISSION.** The first version set `prior_state` and wrote
no `state_history` entry, which leaves the document asserting a history it does
not carry. `prior_state` is only a pointer; the ENTRY is the record. Now appended
with the five fields the catalog wants, and a document whose block cannot be
extended is refused rather than guessed at.

**THE BEFORE-CHECK EARNED ITS PLACE AGAIN** (standing lesson 4). The new
fixture was non-conformant on first write, missing the C-13.2 Session Log entry,
so an after-check alone would have measured nothing.

**SCALED UNTIL THE ASSUMPTION HELD** (standing lesson 1). Probed to 4,000
Problems in one call out of tree: linear at about 1ms each, no ceiling found.
D-36's variable and compound-term limits do NOT apply here, because `dispose`
issues one promote per member rather than one statement over all of them, so
there is no `IN (...)` list to chunk. The suite asserts 200 at a size the battery
can afford and conformance-checks one of them, since moving 200 states is
worthless if they are 200 documents the catalog rejects.

**A TEST HELPER THAT WOULD HAVE LIED AT SCALE.** `stateOf` scanned
`op=projection`, which caps at 200 rows, so it silently stopped finding things
exactly when the corpus got big enough for the scale assertions to matter, and
reported it as a crash rather than a miss. It asks for the one bundle now.

**THE v27 CONVERGENCE LESSON PAID OFF ON THE FIRST USE.** Polling for the
BEHAVIOUR rather than the version: try 1 answered version 0.30.0 and `unknown op`
for `op=dispose`; try 2 answered 0.31.0 and `NO_SUCH_SELECTION`, correctly. Had
this polled the version alone it would have reported convergence one poll early
again.

v27, July 26, 2026. Current state, on top of v26 and the narratives below. The
plane is **0.30.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`b88abea4be66790c6da077e0f79ff4e11e7db6bdb115c8b63755a12d0f1a8608`).
Battery **1454 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**S-12 IS COMPLETE, INCLUDING 7.13.** Every section of Membership Architecture v2
is now built.

**7.13, CLOSING D-47.** The single participation power an administrator has.
Only owners manage participation and lifecycle, and administrators may deactivate
members; those two rules together strand a project, because an administrator can
end the access of a project's only owner and then be unable to touch the project.

The condition is EVERY owner inactive, not any, so an administrator cannot reach
a live project by deactivating one inconvenient person. It ADDS rather than
replaces: the inactive owners keep their rows, a reactivated owner is an owner
again ALONGSIDE the added one, and removing them is then ordinary 7.10. Nothing
here strips anyone, which is what keeps it from becoming a route around 7.10.

**D-51 WAS NOT MERELY DRIFT.** v1.4 let an administrator ASSIGN expertise when
creating the invitation, and v2 1.3 forbids exactly that: an administrator who
can introduce the label is assigning rather than confirming. `memberAdd` now
REFUSES an `expertise` argument rather than ignoring it, because silently
dropping a caller's argument is how two copies of the same fact drift apart in
the first place. `memberList` serves from `member_expertise`. The dead column
stays, unused, since nothing here deletes.

**VERSION CONVERGENCE IS NOT FULL CONVERGENCE.** A refinement of the recorded
edge-propagation gotcha, learned the expensive way. After the 0.30.0 deploy,
`op=selftest` reported 0.30.0 on the FIRST poll, and a live call to the new
`op=projectownerrescue` still answered `unknown op`. The source was correct, the
local control plane resolved it, the built bundle contained it, and the deployed
bytes hashed identically to the signed asset. Different edges converge at
different times, and the version string converging says nothing about whether the
edge you reach next has the new op table. Poll for the BEHAVIOUR you changed, not
just for the version. On the retry it answered `ADMIN_ONLY`, correctly failing
closed for a machine credential.

**AND A LIVE PROBE THAT TESTED THE WRONG THING.** The first D-51 check on the
deployed instance answered `EXISTS` rather than the expected refusal, because the
member id it used already existed on the live roster from a previous session's
probe rows, so the `EXISTS` check fired before the new one. The rule was working;
the probe was not. Retried with a fresh id and it answered
`EXPERTISE_IS_NOT_ASSIGNED`.

v26, July 26, 2026. Current state, on top of v25 and the narratives below. The
plane is **0.29.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`796ce83c569a389e6a4e849243ba07ac74c3443a9ff9e352ded77f9e791a77b0`).
Battery **1444 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**S-12 IS COMPLETE.** Every section of Membership Architecture v2 is built except
7.13, which is tracked as D-47.

**SECTION 8, AND THE SHARP READING OF 8.1.** "The ADMIN_TOKEN-class credential,
not in-app administrator status" is NOT satisfied by a SESSION belonging to an
administrator. A session is derived from a password; the root of trust is the
token set in the hosting dashboard. So `op=export` refuses a stolen admin
password, refuses an in-app administrator's browser, and refuses **the FOUNDER's
own browser**, which is the one place in this system where being the founder is
not enough. 4.6 puts the founder above the membership model everywhere else;
section 8 is the exception, and it has to be, because the whole point is that a
credential someone can steal must not reach the corpus.

The refusal is checked BEFORE the generic session ACL. That ACL answers "this
operation requires a machine credential", which is true and misleading: a
MEMBER_TOKEN machine credential cannot export either. The op whose misuse takes
the entire unpublished corpus deserves the actual rule in its answer.

**8.2 REQUIRES NOTHING**, on the same unauthenticated path as `op=verify`,
reading the published projection and never the working corpus. That is the whole
safety of an open endpoint and it is asserted rather than intended: nothing from
the working corpus appears in the result. Live it answers 0 published bundles,
which is correct, because nothing has ever been ratified on this instance.

**AN EXPORT CAN NEVER HAPPEN SILENTLY.** `export_log` is append-only and readable
by in-app administrators, who cannot RUN an export and must be able to SEE that
one happened. An export a captured root of trust could take unnoticed would
defeat the recording.

**VERIFIED LIVE AGAINST THE REAL RECORD.** `op=export` with ADMIN_TOKEN returned
30 bundles and 137 files, matching `op=stats` exactly, with every bundle carrying
a sha, every file carrying a sha256, and the promotion chain and base links
present for re-derivation. The export log recorded it. A member-class token was
refused at the op table.

**A FOUNDER ASSERTION THAT TESTED NOTHING**, caught before it was trusted.
`setpassword` is Durable-Object-only and is not a control-plane op, so the first
version of the founder case built the string `"token=undefined"` and was
exercising an invalid credential rather than the founder. It goes through
`op=claim` now, which is the real path. This is the third time this session that
an assertion passed or failed for a reason other than the one it named.

**NOT DONE: NOTIFICATION.** Section 8.1 says every administrator is notified of
an export. There is no notification channel in this system, so what is
implemented is recording plus a readable log, which makes an export discoverable
rather than announced. Tracked as D-52.

v25, July 26, 2026. Current state, on top of v24 and the narratives below. The
plane is **0.28.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`5e46ed380b73065fba843ae9ef3d6459cbf3476aca87d0bdd1ac24f81b8a492d`).
Battery **1431 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**PROJECT NAME UNIQUENESS AT THE WRITE PATH, CLOSING D-48.** 7.1 was enforced at
fork since 0.26.0 and nowhere else, so two projects born the ordinary way could
collide. Fork is one of several ways a project comes into being.

Compared through the one `Store.projectNameKey` the fork check also uses, so the
two cannot disagree about what a collision is. Case-insensitive with runs of
whitespace collapsed: a plain unique index over the trimmed string is how HANDLES
work and would let "Sewer Fund" and "Sewer fund" coexist, which is the collision
the rule exists to stop. Held across every lifecycle state, deactivated projects
included, because a deactivated project is still cited and its name must still
resolve to what was cited. Excludes the bundle being written, so a project may be
revised without colliding with itself.

**A SEPARATE DEFECT, FOUND BY THAT ONE.** `members.test.mjs` failed on a cite,
and the cause was not the new rule. `cite`, `sever` and `reinstate` rebuild
`meta` from the document's frontmatter and re-promote, so a bundle whose
frontmatter carries no title field was being re-promoted with `title: undefined`
and SILENTLY BLANKED in the projection. The catalog requires a title on every
bundle, so such a document is malformed, but a malformed document is exactly when
a write path should preserve what it already knows rather than quietly discard
it. An update that omits the title now carries the old one forward, asserted
directly in `projects.test.mjs` rather than only through the suite that happened
to catch it.

**THE WRITE PATH WAS MEASURED, NOT ASSUMED.** Both new guards are narrowly
conditioned, the name scan only for projects and the carry-forward only when a
title is absent, so neither should touch ordinary writes. A single bench reading
of 8.01ms against an earlier 6.46ms looked like a 24% regression. Benching this
code against the PREVIOUS release, twice each, gave 7.91 to 8.05ms with the
change and 7.63 to 7.94ms without: overlapping ranges, and the 6.46ms reading was
a quieter container rather than faster code. A single sample is not a
measurement.

**A COMMIT MESSAGE RAN AS SHELL.** Backticks inside a double-quoted `-m` string
were command-substituted, so the word inside them vanished from the 0.28.0
message. Amended, retagged and force-pushed. Use `-F` with a file for anything
containing backticks.

v24, July 26, 2026. Current state, on top of v23 and the narratives below. The
plane is **0.27.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`d0f378135ba5eacaf3116a9b83c503e07528907c72138013e223dc2e50a6993f`).
Battery **1420 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**A 4.9 DEFECT, FOUND WHILE BUILDING SOMETHING ELSE.** A section 4.7 removal
sets `status='revoked'` and leaves `role='admin'` on the row, because the vote
ejects someone from the office rather than erasing the person. Any administrator
could then call `memberset(active)` and put an ejected administrator straight
back WITH THE OFFICE INTACT, undoing a group decision with one call. That defeats
4.7's consensus-on-addition, which exists precisely so administrators cannot be
manufactured unilaterally.

They now return as an ordinary MEMBER and the response says so. Reactivating the
person is a single administrator's call; restoring the office is an appointment
and goes through 4.7 like any other. Written as a failing test first and
confirmed failing for that reason before the fix.

**SECTION 1.3 LICENSES.** `member_expertise` is an append-only EVENT LOG rather
than a status column, because withdrawal supersedes rather than overwrites. A
group that can see a confirmation was once given and later withdrawn is better
informed than one that sees only today's answer; because confirmation gates
nothing, the reason is honesty of the roster and not security. The v1.4 model was
an `expertise` list on the member row, which cannot carry a confirmation state, a
confirmer and a withdrawal PER ENTRY. The old column is left unused rather than
dropped, since nothing here deletes.

Write authority is split by column. A member writes the `label` and never the
confirmation events; an administrator writes the confirmation events and can
never introduce a label the member did not declare, which is what keeps a
confirmation from being an assignment. Both actors are stamped server-side, so a
declaration cannot be addressed to someone else. An administrator may confirm for
another administrator (4.9).

**AND IT GATES NOTHING, ASSERTED RATHER THAN INTENDED.** After declaring, being
confirmed and being withdrawn, the test member's capabilities are unchanged and
he promotes exactly as before.

**THE TWO-WAY STRUCTURAL CHECK EARNED ITS PLACE.** `NEEDS` named both new ops
while `SESSION_OPS` did not, so no session could reach them. The suite failed on
the table naming something UNREACHABLE, which is the direction that exists only
because the check runs both ways. Nobody would have hit it as a user; it would
have shipped as two dead ops.

v23, July 26, 2026. Current state, on top of v22 and the narratives below. The
plane is **0.26.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`568a4b782425b4f3584ddc79bacde548551a0c1f29c5601d41d0521722fd51ad`).
Battery **1410 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**S-12 STEP 4 IS COMPLETE.** All of Membership Architecture v2 section 7 is built
except 7.13, which waits on member deactivation vacating nothing.

**7.11 IS NARROW ON PURPOSE.** The section is titled deactivation and
reactivation and says only owners may do THOSE. It does not say only owners may
move a project's lifecycle, and reading it broadly would stop a mechanical
writer advancing a project from `forming` to `investigating`, which is ordinary record
work gated by `contribute` like every other write. Exactly two transitions are
owner-only: entering `closed` with a `closed_reason` of `abandoned`, and `closed`
back to `investigating`. Both were already legal in the check catalog and nothing
was added to the state vocabulary.

The suite SHOWS the scope rather than asserting about it: the same caller closing
a project as `resolved` succeeds and closing it as `abandoned` is refused, one
line apart.

`actorMemberId` is stamped from the session and deleted first if a caller
supplies it, like `author`. A machine credential carries none and therefore
cannot deactivate a project: saying the group has stopped pursuing something is a
statement by its members about their own intent, and no automation holds that.

**7.12 FORK.** Joined participants only, because an invited member sees the
skeleton alone (7.9) and a fork by them would copy material they cannot read.
Requires `create_projects`, checked at the control plane where the session is, or
any participant creates projects they were not trusted to create. Copies NO
participants, or a forker manufactures visibility for people the origin's owners
chose. Starts at `forming`, because inheriting `matured` would claim a readiness
the clone has not earned.

**FORK CLAIMED AN EDGE IT NEVER WROTE, AND THE SUITE ASSERTED THE CLAIM.** The
first version returned `rel: "derived_from"` and set only `id`, `title`,
`current_state` and `last_updated`; the references block was never touched, so
every clone had no provenance. The assertion read `f.rel`, which is a literal the
method returns, so it passed. This is the `op=get` failure again in a different
costume: a test that reads the return value instead of the record proves nothing.
The edge is now spliced into the clone's frontmatter, the assertions read the
document and the refs projection count across a fork, and a fork whose origin
cannot be recorded is refused outright rather than written without provenance.

**7.1 NAME UNIQUENESS**, enforced at fork: case-insensitive, whitespace
collapsed, holding across deactivated projects. `Store.projectNameKey` is the one
comparison so a later write-path check cannot disagree with this one. A plain
unique index over the trimmed string is how HANDLES work and would let "Fork one"
and "FORK ONE" coexist, which is the collision the rule exists to stop.

v22, July 26, 2026. Current state, on top of v21 and the narratives below. The
plane is **0.25.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`69fca0c356a1d324211e59bc070990aa3a64976863a71692ebd2d10c96a2cac7`).
Battery **1380 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean.

**7.7 REVERSED, CLOSING D-46.** Only a project OWNER removes a participant.
Verified live: `op=projectremove` answered `ADMIN_ONLY` at 0.24.0 and answers
`NOT_THE_OWNER` at 0.25.0. Four assertions in `projects.test.mjs` asserted the
old rule and were CORRECTED rather than exempted.

**7.2 LOST ITS ADMINISTRATOR BYPASS, AND NOTHING HAD EVER EXERCISED IT.**
`projectInvite` carried `|| this.#isAdminMember(by)` and no test drove that
branch, so the bypass could have been removed or kept without a single assertion
noticing. Both directions are now asserted. Both checks run through one
`#isProjectOwner` helper, because the bypass sat on invite and remove with
DIFFERENT shapes, which is how they drifted apart to begin with.

**7.10 OWNER GOVERNANCE.** Ownership is a set. Addition follows 4.7 unchanged.
Removal follows 4.7 EXCEPT at exactly two owners, where both must agree and the
target is one of them.

`Store.ownerMath` is deliberately NOT `adminMath` reused. They differ at exactly
one row, n=2, and that row is the one a shared implementation gets wrong. For
administrators, impossibility at two prevents a capture at the smallest size, and
4.2's floor of two means a group never has to go below it. Projects have a floor
of ONE, so impossibility at two would make a second owner permanent. At two the
target votes, which is what the act is at that size: resignation with the other
owner's assent. **The suite asserts the divergence against `op=adminarith`
directly**, not only in isolation, so the two tables cannot silently converge.

Removing ownership leaves the person a PARTICIPANT (7.10); removing them from the
project entirely is then 7.7.

**A POLLING SCRIPT, NOT THE PLANE.** The 0.25.0 deploy appeared not to converge
for twenty polls. `op=selftest` reports `version` at the TOP level and the poll
read `result.version`; the 0.24.0 poll had a `|| j.version` fallback and this one
did not. The plane was healthy the whole time. Worth recording because the
failure looked exactly like the edge-propagation gotcha it was not.

v21, July 26, 2026. Current state, on top of v20 and the narratives below. The
plane is **0.24.0**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset (`707d2372640e4f25daff5523298a48a4aa8b44f373209347b62a4cc50638ba52`).
Battery **1353 assertions across 31 suites**. Live record unchanged at 30
bundles, 137 files, 239 history rows, 10 refs, 87 register rows, `op=audit` 30
checked and 30 clean, `op=registeraudit` sound (57 live, 30 captured, 0
unbacked).

**MEMBERSHIP ARCHITECTURE v2 SUPERSEDES v1.4.** Specified in session and
approved 2026-07-26. Work from `docs/architecture/BIO_Membership_Architecture_v2.md`
and not from v1. The document carries a change table at the top. The one that
bites: **v1.4 section 7.7 said only an ADMINISTRATOR removes a project
participant, and v2 says only an OWNER does.** The deployed instance still
enforces the v1.4 rule, because reversing it is S-12 step 4b and this release is
step 3.

**CAPABILITY ENFORCEMENT AT THE OP LAYER (section 5), 0.24.0.** Capabilities
were recorded and nothing consulted them. A member holding no `publish` reached
`op=ratify` and was stopped only by the absence of a signing key, which was the
key doing the capability's job.

Capabilities are resolved when the SESSION IS READ, not when it is created, so an
administrator revoking one takes effect on the next request rather than in eight
hours. They gate a session and never a machine credential: a token class has no
member behind it, and `op=whoami` reports its capabilities as `null` rather than
as an empty list or a full one.

`NEEDS` in `index.mjs` names a capability, or an explicit `null` with its reason,
for every mutating op a session can reach. `test/capability.test.mjs` reads that
table and `SESSION_OPS` out of the source and fails in EITHER direction: an op
added later cannot pass by not being mentioned, and an entry cannot outlive the
op it names.

`create_projects` gates a SHAPE and not an op, because no op creates a project: a
project is a promote with no base whose `object_type` is `project`.
`ownerMemberId` is deleted unconditionally and then stamped from the session, as
`author` is, and `promote` writes the 7.1 owner row inside the SAME transaction,
so a project cannot exist unowned even briefly.

**An in-app administrator holds every working capability**, read as a rule rather
than from their row. `memberCaps` refuses to edit an administrator's row at all,
to protect 4.4, so if the row were consulted an administrator's powers would be
frozen forever at whatever their invitation set, and one invited with the default
`["contribute"]` could never publish and could never be granted permission to.

The interface half shipped with it, which is what section 5 actually asks for:
`setup.mjs` builds its controls from `op=whoami` rather than from a second copy
of the rules, and `CAPS` starts EMPTY so the window before whoami answers hides
everything rather than showing controls that will refuse.

**THE SECTION 7 PARTICIPATION OPS WERE UNREACHABLE AND NOW ARE NOT.** They
existed in the Durable Object's route map and were absent from `OPS` in
`index.mjs`, so every real caller got `unknown op`: 7.2, 7.4, 7.6, 7.7 and 7.8
were shipped, tested at the DO, and reachable by nobody. Standing lesson 5 one
level worse. Verified live at all five, each failing closed for a machine
credential because `class:member` is not a member id: `NO_SUCH_PROJECT`,
`NOT_THE_OWNER`, `NOT_INVITED`, `NOT_A_PARTICIPANT`, `ADMIN_ONLY`.

**NOTHING IN THE OLD BATTERY BROKE, AND THAT IS NOT REASSURING.** Every session
in the existing suites belongs to an administrator, because 4.2 and 4.3 force the
second member of a group to be one and most suites create exactly one extra
member. No old test ever held a limited capability set, so the new gate was
unexercised by all 1321 prior assertions. This is standing lesson 6 again: the
battery was measuring something adjacent to the thing.

**TWO OF THE NEW SUITE'S OWN ASSERTIONS WERE VACUOUS AND WERE FIXED BEFORE IT WAS
TRUSTED.** One asked `op=get`, which does not exist, so it passed for every input
including the case where the bundle HAD been created; it now asks `op=image` and
is paired with a positive control. The structural denominator was blind to
`SESSION_OPS`'s spreads (`...EDGE_ACTIONS`, `...PROJECT_ACTIONS`,
`...RETRIEVAL_READS`) and so checked fewer ops than it appeared to; it now
resolves each spread against the const it names.

v20, July 25, 2026. Current state, on top of v19 and the narratives below. The
plane is **0.21.1**, signed, tagged, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset. Battery **1280 assertions across 28 suites**. Live record
unchanged at 30 bundles, `op=audit` 30 clean.

**BURNER-URL INVITATIONS (section 6, closing D-42).** The token in the URL is
the whole credential. It is spent the moment it is used, and afterwards the link
resolves to nothing and carries no record of what it formerly addressed.

The previous link was `#invite=<memberId>:<code>`, so anyone who saw a leaked or
archived one learned who had been invited, which broke half of what section 6
requires outright. The token is now opaque, the member id is never in it, never
returned by the lookup, and no longer needed to enrol. Invitations are looked up
BY HASH, so the store never holds a usable invitation and a leaked database is
not a set of live credentials.

A SPENT TOKEN AND A TOKEN THAT NEVER EXISTED RETURN BYTE-IDENTICAL ANSWERS,
asserted in the suite and confirmed on the deployed instance. That is the
security property rather than tidiness: a response distinguishing them would
confirm to whoever found the archived link that it had once addressed somebody
real. Cover, capabilities and role stay the administrator's and are not read
from the enrolment call, so an invitee cannot make themselves an administrator
by asking.

**0.21.0 SHIPPED THIS BROKEN AND 1276 ASSERTIONS DID NOT NOTICE.** The
control-plane branch referenced `stub2` and `body2`, which do not exist in that
scope, so every live call answered a Cloudflare 1101 worker exception. The
burner suite drove the Durable Object directly, the way every store-level suite
does, and exercised the control-plane route to it not at all.

That is a general lesson and not a slip. `op=invitelook` is `classes: null`,
which means the control plane is the ONLY way a real caller reaches it: the
invitee holds no credential, so there is no other path. A store-level test of an
unauthenticated op tests the half nobody uses. `fence.test.mjs` now drives it
through the control plane, which is where the rule about the unauthenticated
surface already lived.

It was found by exercising the deployed artifact. The suite was green, the
release was signed, the deployed bytes hashed identically to the signed asset,
and the feature did not work. Verifying against the deployment rather than only
the suite is what caught it, and it is the fourth time in two days that
discipline has paid.


v19, July 25, 2026. Current state, on top of v18 and the narratives below. The
plane is **0.20.0**, signed, tagged `v0.20.0`, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset. Battery **1255 assertions across 28 suites**, from 1184.
Live record unchanged at 30 bundles, `op=audit` 30 clean.

**THE MEMBERSHIP MODEL'S MEMBER HALF IS BUILT.**
`architecture/BIO_Membership_Architecture_v1.md` below Section 7 was the largest
unblocked piece of work in the repository and nothing in it was undecided.

**Cover and handle (section 3).** Two names assigned by two parties for two
purposes. A COVER is what an administrator calls someone in the roster and is
explicitly not a claim about who they are in the world; a HANDLE is chosen by the
member at enrolment, is unique across the instance, and is what the RECORD shows.
Only administrators see them together, which is why `op=memberlist` is admin-only.
> *(Amendment, 2026-08-03 — the D-160 pattern: a dated record gets an amendment, not a rewrite. The clause above was true as written for plane 0.35.0's INTENT but the op was never actually admin-only, and D-157 measured the pairing reaching ordinary members and MEMBER_TOKEN on the live store. REC-29 closed it the other way round: memberlist stays member-reachable per Membership Architecture §3 and the PROJECTION withholds `cover` from every non-administrator, server-stamped, fail-closed.)*
The uniqueness is a partial unique index rather than a convention, because a
roster in which two people answer to one name defeats the purpose of having one.

**Capabilities (section 5):** `contribute`, `publish`, `create_projects`, stored
as JSON because the set will grow and a column per capability is a migration per
capability. `administer` is deliberately NOT among them. It is granted and
removed only by the Section 4 process, so `memberCaps` refuses both to grant it
and to touch an administrator at all.

**The Section 4 arithmetic, which is the point.** The first invitation a group
issues creates a SECOND ADMINISTRATOR and there are no ordinary members until two
exist (4.2, 4.3), refused rather than nudged, because an ordinary member added
first is a group with a single point of failure that nobody notices until it
fails. Administrator status cannot be taken away (4.4): `memberSet` refuses to
revoke an administrator and that takes the 4.7 vote or it does not happen, which
is what stops an instance being captured by whoever acts first in a dispute.

Addition: the first administrator adds the second unilaterally, and every
subsequent addition needs the CONSENSUS of every existing administrator. That is
the load-bearing half of 4.7, because without it a captured administrator
recruits confederates and manufactures the majority that ejects the honest ones.
A proposal issues no invitation until all have endorsed.

Removal: a majority of ALL administrators, counting the target in the denominator
but not letting them vote, ties not ejecting. That single rule makes removal
impossible at two without a special case, demands unanimity while the group is
small enough for unanimity to be reasonable, and loosens as it grows. The table
in the architecture document is COMPUTED by `adminMath` rather than transcribed,
so code and document cannot drift, and it is exposed as `op=adminarith` so a UI
can tell a group what a removal would take before they begin one. Every vote is a
row in `admin_votes` and nothing is tallied anywhere else, so who decided and why
survives the decision.

**4.6, the root of trust, and it was the EXISTING suite that found it.** The
founding administrator has no members row: they claimed the instance by spending
ADMIN_TOKEN, which is what 4.1 describes. Counting only member rows made a
claimed instance with one invited administrator look like a group of one, so the
second invitation was being issued unilaterally when it should have required
consensus. The census now counts them, and they cannot be removed from inside the
application: whoever can set ADMIN_TOKEN can take the group over, there is no
arrangement in which nobody holds that power because the instance runs in
somebody's hosting account, and no interface may imply the membership model
bounds it.

**Three existing suites encoded the pre-Section-4 behaviour** and were updated
rather than worked around. `members.test.mjs` invited an ordinary member first
and revoked an administrator directly; `ratify.test.mjs` did the same. Both now
make their second member an administrator, which is what the rule requires. A
rule that breaks old tests is doing its job; a rule quietly exempted from them is
not a rule.

**What is NOT built, and is the next membership work.** Burner-URL invitations
exist in outline only: the invite is still a code the administrator hands over
and the enrolment screen is reached by a URL fragment (D-14), not by a
single-use URL that resolves to nothing afterwards. Section 7 project
participation and visibility positions are untouched, and they are what D-15
waits on. Section 8 secure verified export is untouched.

**Verified live to the limit a MEMBER_TOKEN allows.** Version converged, record
identical, all six bindings present, `op=audit` 30 clean, deployed bytes hashing
identically to the signed asset, and `op=adminarith` answering correctly. The
governance write path could NOT be exercised against the deployed plane, because
`memberadd`, `adminendorse` and `adminremove` are admin-only and no session has
ever held ADMIN_TOKEN. It is covered by 66 assertions in the suite instead, and
that gap is worth closing the next time an admin credential is issued.


v18, July 25, 2026. Current state, on top of v17 and the narratives below. The
plane is **0.19.0**, signed, tagged `v0.19.0`, deployed and verified on
biosmoke7.believeinoakland.workers.dev, deployed bytes hashing identically to the
signed release asset. Battery **1184 assertions across 27 suites**, from 1124.
Live record unchanged at 30 bundles, `op=audit` 30 clean.

**S-11 STEP 2: `op=sever` and `op=reinstate`, both at weight `refuse`.** These
are the first STATE-CHANGING actions to refer to a selection and therefore the
first callers of `selectionResolve`'s refusing arm, which shipped unused in
0.17.0. They also close a hole 0.18.0 opened: `cite` created edges and nothing
could withdraw one, which makes a citation list an accumulation rather than a
record of what a group currently relies on. The 0.18.0 suite had to hand-edit
frontmatter to produce a severed edge at all.

SEVERING IS NOT DELETION. The edge keeps its target and its rel and only its
status moves, the same doctrine that greys a dismissed Problem rather than
removing it. The reason is APPENDED to the note and never substituted, because
why a group cited something is as much a part of the record as why they stopped
relying on it. Both actions REQUIRE a reason: the catalog's own remediation for
a bad reference is "sever with reason" (C-6.1), and an edge moved with no reason
is an unexplained change wearing a status field.

THE WHOLE SET MOVES OR NONE OF IT DOES. A member in the wrong state refuses the
batch by name rather than applying to the eligible subset, because a half-run
state change is precisely what weight `refuse` exists to prevent and applying to
whatever happens to qualify would reintroduce it through the back door.

The refusing arm is now exercised: moving a record under a live selection makes
the severance refuse with `SET_MOVED`, hand over no members, and leave the
project byte-identical; re-selecting lets it proceed. Verified in the suite and
again on the deployed plane.

**The suite found two defects in this session's own code**, which is the process
working. An EMPTY selection made both actions succeed as no-ops that still
promoted an unchanged revision into an append-only history, a record saying
nothing happened, reported as success. And `reason` carried a refusal CODE on
failure but the operator's prose on success, so a caller checking it could not
tell the two apart. Both fixed, and the empty-selection guard was missing from
`cite` as well.

**D-32 CLOSED FURTHER, by measurement.** The register named two remaining
options and this implements one: counting facets from a SINGLE SCAN in JS
instead of a GROUP BY per field. Driven through the real op at 20,000 bundles,
`scan` beats `groupby` on every shape by 1.4x to 5x, and the facet sidebar over
the whole corpus is no longer the worst shape in the release. Both forms are
KEPT: `test/search.test.mjs` asserts they agree exactly across six query shapes
and the bench asserts it again at size, because an optimisation that disagrees
with the thing it replaces is not an optimisation. Same standard `op=audit` is
held to against an outside pass.

**Four more debt items cleared.** D-39, an empty POST body threw before any op
dispatched so every op answered a Cloudflare 1101 exception instead of a BIO
refusal. D-18, already true in code since S-3 and only the comment was stale.
D-33, the id tiebreak was held by a compile-time assertion alone and the bench
now pages the whole 20,000-row corpus on a heavily tied field and requires the
pages to partition it exactly, at a size where the sorter spills. D-28, the
absent Conversion Plan is now recorded in `architecture/README.md`, the index a
reader actually consults.

**D-36's open item was the CLASS of undocumented ceilings**, so
`npm run probe:limits` binary-searches them against a real Durable Object
instead of discovering them one at a time after they break something. Its first
draft reported four ceilings that were only the top of the ranges it was given,
plus a variables ceiling of 1500 with "headroom 1436" measured against 400
bundles through a path that chunks internally and therefore cannot reach the
limit at all. It measured nothing and said yes to everything. Corrected, it
distinguishes a measured ceiling from "never failed up to n", and found
something real: a query fails at **98 metadata filter terms on the VARIABLE
limit**, not the five-term compound limit, so the compiler's subquery nesting
successfully evades the ceiling D-36 documented and then meets a different one.

**Bench before signing:** worst shape 119ms at 20,000 bundles, index versus
corpus 20,000 checked with zero findings, paging exact. The absolute numbers moved
down from the 0.18.0 run on faster container hardware; the FACET improvement is
the like-for-like comparison, measured in the same run against the same corpus.


v17, July 25, 2026. Current state, on top of v16 and the narratives below. The
plane is **0.18.0**, signed, tagged `v0.18.0`, deployed and verified on
biosmoke7.believeinoakland.workers.dev. Deployed bytes hash identically to the
signed release asset. Battery **1124 assertions across 26 suites in about 92
seconds**, from 1032. Live record unchanged at 30 bundles, 137 files, 239 history
rows, 10 refs, 87 register rows, 30 indexed, `op=audit` 30 clean,
`op=searchindexcheck` clean.

**THE FIRST ACTION THAT REFERS TO A SELECTION IS BUILT: citing Information in a
Project, `op=cite`, at weight `report`.** `selectionResolve` shipped in 0.17.0
with no caller. Citing is the right first one because it ADDS references rather
than moving state, so drift is surfaced and survived rather than fatal, and the
reporting arm of the gate is exercised before anything can be broken by it. The
REFUSING arm still has no caller, deliberately: it gets one from the first
state-changing action, which is not this commit.

Citing writes the DOCUMENT, not the projection. `refs` is re-derived from
`bundle.md` frontmatter inside `promote`'s transaction and `promote` refuses a
`refs` payload outright (D-21), so `op=cite` splices `rel: cites` entries into
the Project's frontmatter and promotes a whole image. Edges land at `status:
confirmed`, per State Rules 5.1: an edge is proposed by an agent and confirmed by
a human, and a member driving a selection is the human act.

It is fully SYNCHRONOUS inside the Durable Object, which is load-bearing rather
than incidental. The catalog's own `createSha256` is pure JS, so nothing between
resolving the selection and committing the promotion awaits, and no other write
can interleave. The CAS is still passed and checked, but it is a backstop here
rather than the only guard.

**Three decisions, Bob's, 2026-07-25.**

A SEVERED EDGE IS NOT AN ABSENT ONE. A severed `cites` edge is a recorded human
judgment, preserved with its reason the way a dismissed Problem is greyed and
never deleted. Citing a severed target REFUSES, offenders named, nothing written.
Reinstating one silently would be a state change riding inside a report-weight
action; skipping past it would quietly narrow the operator's set. Both decide
something the operator did not, so the call is handed back. Reinstatement becomes
its own action, at weight `refuse`, recording its own reason the way severing
does. The distinction that keeps this consistent with proceeding on drift: drift
is the world moving under the operator and their intent still applies to the
shifted set, whereas a severance collision is the record itself contesting the
request.

THE OPERATOR'S SET IS NEVER QUIETLY NARROWED. A selection carrying anything that
is not Information is refused whole with the offenders listed, never filtered to
the citable subset. Same doctrine as the enumeration cap.

WEIGHT IS NOT A PARAMETER. `op=cite` reads no weight from the caller and is
`report` because of what it IS. A caller that could choose the weight would make
the whole distinction advisory and the gate decoration. Asserted.

**Found by scaling, and only by scaling (D-38).** `SELECTION_MAX_ITEMS` (10,000)
and `INLINE_MAX` (1MB) were set independently and collided: a maximum legal
enumeration produced a 1,070,846-byte `bundle.md` and was refused by `promote`
with `OVERSIZE_INLINE`, which is an error about inline byte storage handed to an
operator who selected a legal number of records. Part of the cause was this
session's own first draft, whose Session Log entry listed every cited id at 24
bytes per edge on top of the 83 the reference block costs. Bounding that entry to
20 ids plus a count, on the same reasoning `op=audit` bounds its offender list,
took an edge from 107 to 84 bytes and lets a maximum selection fit at 841KB. A
`CITATION_TOO_LARGE` refusal now names the real limit and the room remaining
before anything is written. The ceiling is now reachable only cumulatively, and
IS: at 12,000 edges a further 2,000 refuses and leaves the document
byte-identical. Bob's decision: leave it, revisit if a real corpus approaches it.

**Two gaps this work exposed, both fixed here.** `SESSION_OPS` gave a browser
member session `select` but not `search`, `searchfields`, `searchindexcheck`,
`selection` or `selectionlist`, so a signed-in member could create a selection
and then neither search to build one nor resolve the one they had made: the
browser half of S-10 was unreachable from a session. And `fence.test.mjs` tested
a FIXED LIST of ops, so `cite` passed it without a single assertion touching it
despite being mutating and reading the working corpus. The fence suite now reads
the guarded set out of the module and asserts the extraction discriminates by
confirming the `classes:null` public surface is excluded, so an op added later
cannot pass it by not being mentioned in it.

**Bench before signing, per the standing rule.** Worst shape 190ms (facet sidebar
over the whole corpus) at 20,000 bundles, index vs corpus 20,000 checked with
zero findings. v16 recorded 163ms for the same shape; this release touches
nothing in the facet path and the difference is machine variance in the session
container, recorded here rather than quietly restated.

**Verified against the deployed artifact, not only the suite.** Version converged
on `/version` and `op=selftest`, `stats` identical before and after, all six
bindings still present, `op=audit` 30 clean, and the deployed bytes read back out
of the multipart script envelope hash identically to the signed release asset.
`op=cite` was exercised end to end on the DEPLOYED plane in the `scratch`
namespace: edge written at `confirmed`, note landed, a sibling file survived the
whole-image write, Session Log entry present, idempotent on a second call,
`NOT_A_PROJECT` refused, scratch audit clean. Deliberately NOT exercised against
the real record: citing asserts that a Project depends on specific evidence, and
that is an editorial claim for the group to make, not a verification step. Two
test bundles remain in `scratch`; clearing them needs `op=purge`, which is
admin-only and no session has ever held ADMIN_TOKEN.


v16, July 25, 2026. Current state, on top of v15 and the v14 and v13 narratives
below. The plane is **0.17.0**. S-10 RETRIEVAL IS COMPLETE: steps 1 through 5.
Battery **1032 assertions across 25 suites in about 79 seconds**. Live record
unchanged at 30 bundles.

**Selections shipped (step 5).** Two kinds, because two intents were wearing one
word. A QUERY selection is what select-all makes: the operator picked a
criterion, so the current answer to the criterion is the correct set, and no
items are stored at all. That is O(1) storage and it is the honest
representation of what was meant rather than a size optimisation in disguise. An
ENUMERATED selection is specific items: membership frozen, each stored with the
sha it carried when picked. An enumeration above 10,000 items is REFUSED rather
than downgraded to a query, because downgrading would change what the operator's
click meant.

Drift is detected exactly and never absorbed. A revision is reported and
CLASSIFIED from the manifest's own `writer` and `operation`, so a monitor tick
reads differently from a member's rewrite. A purge is named. Visibility can only
shrink a selection, and that is not a policy choice: a frozen selection that
preserved access past a revocation would be a visibility leak outliving the
revocation. What drift MEANS depends on the action's weight, per Bob: a citing
action proceeds and reports, a state-changing action refuses and hands over
nothing so it cannot half-run.

Keep-alive is 300 seconds refreshed on read, the same number and shape as
`leases`, because a Worker holds no connection and a closed view is
unobservable, so the plane requires proof of life instead. A Durable Object alarm
sweeps what the lazy sweep cannot reach. A selection is the first thing in this
store that is legitimately collectable, and that exception to append-only
doctrine is written into the schema comment as well as the register.

**MEASURED, and the correction that matters (D-32).** `npm run bench:retrieval`
loads a corpus through the real `promote` and drives the real `op=search`. At
20,000 bundles the shipped path runs 5ms to 163ms. Probe 2 recorded nothing
above ~46ms, and those numbers were taken with a probe object that is not this
code: no gate, no provenance projection, no facet pass. Quoting them for this
code was wrong and has stopped.

Two structural causes were found by that bench and fixed, halving the worst
shape from 305ms:

- The viewer gate was a CTE intersected into every statement, costing a full
  table scan per statement. It is now a WHERE predicate on rows already
  selected. Same guarantee, same single compilation point, a fraction of the
  cost.
- The facet pass ran one statement per field, rebuilding the same scope six
  times. It is now batched.

**Two workerd limits, both far below SQLite's documented defaults, both found by
the bench and not by the suite (D-36).** A statement binds about 100 variables,
not 32,766. A compound SELECT takes five terms, not 500. The second would have
broken the compiler on six metadata filters, which is one ordinary pass over a
filter sidebar. Compound chains now nest through subqueries at four per
compound, id lists chunk at 64, and the suite asserts the nesting across four
query shapes.

v15, July 25, 2026. Current state, on top of the v14 and v13 narratives below.
The plane is **0.16.0**. S-10 RETRIEVAL steps 2, 3 and 4 shipped: the text index,
the query language, and `op=search`. Battery **1030 assertions across 24 suites
in about 63 seconds** (`npm test` in bio-plane). Live record unchanged at 30
bundles.

**The text index (step 2).** FTS5 lives inside the Durable Object as
`bundles_fts`, five columns (`title, body, meta, locator, authority`,
`unicode61`), keyed on a new explicit `bundles.fts_id` integer. Not the table's
implicit rowid: that is an implementation detail SQLite may renumber, and an
index keyed on a number the engine can change is an index that can silently
point at the wrong document. The row is written inside `promote`'s transaction,
so a creation, a revision and a purge each carry their index with them.
`meta` holds the flattened frontmatter, which is what makes the per-schema tail
searchable without a column per schema version. R2 captures are not indexed:
their bytes never enter the object. JSON data files are excluded from the
free-text body because machine records flood the term statistics bm25 depends on.

**The verifier.** "Maintained transactionally" is a design, and a design is not a
measurement, so `op=searchindexcheck` re-derives the expected index row for every
bundle from the stored files and compares it against what the index holds, and
reports orphans. It gets a negative control in the suite: the index is
deliberately broken, the checker must refuse and name the bundle, `op=reproject`
repairs it, and the checker passes again.

**The query language (step 3).** `src/query.mjs` is a parser and a compiler and
holds no database handle, which is what makes the whole language assertable in
plain node. `src/store.mjs` builds NO query at all and executes every compiled
statement through one guarded executor that throws if the statement lacks the
viewer gate. Bare words are AND ranked by relevance; a zero-result conjunction is
re-run as OR and the wider count offered. Enumerated fields compile to indexed
equality with the argument lowercased, which keeps the seek; free-text fields
(`title`, `locator`, `authority`) compile to column-scoped MATCH, because
equality on a title is a control that never answers. Also `-term`, `NOT`, `OR`,
parens, quoted phrases, `term*`, `field:>v`, `field:a..b`, `has:field`,
`fm:path=value` through json_extract, and `sort:field`. A pure-text subtree
collapses to ONE MATCH; only genuine text-plus-metadata mixing becomes set
algebra, since MATCH knows only the text table.

**The viewer gate (D-15), designed in from the first commit.** One function,
`viewerPredicate(viewer)`, returning true for a member today. FAIL CLOSED: an
unrecognised or absent viewer compiles to `0=1`, so a missing stamp yields an
empty result rather than an unfiltered one. The control plane stamps `viewer`
from the authenticated credential AFTER copying the caller's parameters, so a
forged `viewer=` is overwritten. Asserted structurally, behaviourally on every
mode including facet counts, and at the door.

**What is NOT verified, and is carried as debt rather than implied.** D-32: the
20,000-bundle actuals in `development/RETRIEVAL-SUBSTRATE.md` were measured with
a probe object that is not the plane. The shipped path is verified at 600 bundles
against workerd and at 30 against the live record, and is unmeasured past that.
Bob's decision, July 25: ship in that condition and carry it forward so later
steps read those numbers as inherited rather than earned. D-33: removing the id
tiebreak from the compiler does NOT make the 600-bundle paging suite fail, so the
tiebreak is held by a compile-time assertion and by argument, not by a
demonstrated runtime failure. D-34 and D-35: server-side selection snapshots
(step 5) are absent, along with their lifecycle, ownership, byte caps and drift
policy.

v14, July 25, 2026. Current state, on top of the v13 narrative below. The plane
is 0.15.0. The development instance is now biosmoke7.believeinoakland.workers.dev
(v13 below still names biosmoke5/6; the record moved forward with each fresh
install). The live record is 30 bundles, 87 register rows, and audits 30 clean
against the full 49-check catalog run inside the object via `op=audit`. The
battery is 660 assertions across 21 suites in about 52 seconds; `npm test` in
bio-plane runs all of it. plane-gate is `plane-gate/1.0` running the catalog
(1.16.6) rather than the `plane-gate/0.1` mechanical subset the v13 text
describes.

**Retrieval probe 1 answered (July 25).** FTS5 exists in the Durable Object's
SQLite and was measured against an exported index at 5,000 and 20,000 bundles
with three-way exact agreement against a brute-force scan. FTS5 wins on
corpus-independent selective latency, on being the one-call-in-answer-out shape
D-26 chose, and on keeping the index behind the two-bucket fence. Record and
open design questions in `development/RETRIEVAL-PROBE.md`; plan step S-10. No
retrieval op ships until the design questions are answered by Bob. The plane
source is unchanged by this probe.

**Retrieval probe 2 answered (July 25).** Bob set the scope: the surface is
search, filter, list, sort, and select, with Google-like query syntax and
searchable metadata and frontmatter, not free text alone. Probe 2 measured the
four verbs probe 1 did not. The engine has every feature the query language
needs, including nested booleans, phrases, prefix, NEAR, bm25, snippets,
column-scoped terms, JSON1, generated columns, and expression indexes. Typed
indexed columns beat a facet table by about 9x on write cost and 5.5x on space,
with JSON1 covering the heterogeneous per-schema frontmatter tail, so no facet
table is needed. Nothing exceeds about 46ms at 20,000 bundles, sidebar facet
counts included, and all shapes agree exactly with an unindexed ground truth at
20,000 and on the real 30-bundle corpus. The current `bundles` projection covers
roughly half the frontmatter the UX must filter on and needs extending. Record in
`development/RETRIEVAL-SUBSTRATE.md`. The plane source is unchanged by this probe
as well.

**0.15.0 is S-10 step 1: the metadata projection (July 25).** `bundles` now
carries every field the retrieval surface filters and sorts on, sixteen columns
plus `fm_json` for the per-schema tail, seven of them indexed with the query plan
asserted rather than assumed. Derived from bundle.md with the catalog's own
parser, written inside `promote`'s transaction so it cannot lag the document, and
NULL rather than guessed when frontmatter will not parse. `op=projection` is
member class and above, behind the same fence as `op=index`, because the
projection carries `source.locator`. Battery 718 across 23 suites, wizard 90.
Signed, tagged `v0.15.0`, asset sha256
`32684a72b594392314030ad35ab7b08a192c06f84a8aac7ae4c1c8ec98a7fb48`, deployed and
verified on biosmoke7.

The backfill was tested by the live record rather than only by the suite: all 30
bundles, written long before these columns existed, came back with a full
projection derived from their stored bundle.md. 28 carry `source.locator`; the two
that do not are the Problem and the Project, whose schemas have no source block,
which is the heterogeneity `fm_json` exists for. `json_extract` over the tail
finds `surfaced_by=agent` on the Problem, a field no column holds. Record
unchanged at 30 bundles, 137 files, 239 history, 10 refs, 87 register rows;
dbBytes moved 1,200,128 to 1,286,144, which is the new columns and indexes.
`op=audit` 30 checked, zero findings.

**0.14.2 retires the public token class (July 25).** A credential handed to the
public is not a credential: to be public it must be widely distributed, and once
distributed it bounds nothing. The class bought exactly two ops, `selftest` and
`publishedlist`, and cost one real defect, because its existence is what invited
`op=index` onto its list while `op=index` reads the working corpus (D-30). The
public surface is protected structurally instead, by the `classes: null` ops that
each enforce their own gate and answer only from the published projection, which
has never held unratified material: safety comes from where an op reads, not from
who holds a token, which is the model `verify` already followed. Observably a
no-op, since the installer issues exactly three credentials and no instance has
ever bound `PUBLIC_TOKEN`. `test/fence.test.mjs` now asserts the binding is
INERT, so a value left in that env slot authenticates nothing; it was written
first and failed on nine assertions. Battery 680, wizard 90, both green. Signed,
tagged `v0.14.2`, asset sha256
`b30ecc4f0c4e6e7f4cf19b4adf4ac08cfa029294eea8676dffbf9e17554b65fd`, and deployed
to biosmoke7: running bytes byte-identical to the signed release, zero
occurrences of `PUBLIC_TOKEN` in the running code, all seven bindings preserved,
`stats` identical before and after, `op=audit` 30 checked with zero findings.
Note for future deploys: the two version endpoints disagreed for about a minute
after upload while edge locations propagated, which is expected and not a failed
deploy; confirm convergence rather than reading one endpoint once.

**Retrieval design settled, and one fence hole closed in 0.14.1 (July 25).** Bob
answered all five design questions, so S-10 is unblocked: `source.locator` and
`source.authority` are searchable, a result carries ids plus full provenance,
default order is relevance with reordering trivially available, and a selection is
a server-side construct rather than a client-held set. Search ships at flat member
scope ahead of the membership model, with the D-15 viewer-visibility filter
designed in as a single compilation point that returns true for a member today, so
satisfying D-15 later is one function rather than an audit of every query path.

0.14.1 is the one source change: `op=index` no longer grants the `public` token
class (D-30). It reads the working-corpus `bundles` table while the module's own
header says the public class is published-scope reads only, so a public credential
was receiving every bundle's id, title, current state, last-updated time, and
image hash. `publishedlist` remains the public listing surface and reads the
projection that has never held unratified material. A new suite,
`test/fence.test.mjs`, holds the boundary and is run against the built `dist`
artifact as well as `src`; it was written first and failed on exactly the three
assertions covering the hole. The battery is now 22 suites.

**0.14.1 is cut, signed, and published**, tag `v0.14.1`, asset sha256
`9bccbd44596b1ad423afc5f256a679e0c22519458fe0cabe91a2c3bdbc84a37a`. Signed with
the `bio-release` key in the `bio-release` namespace over the asset bytes. Verified
four ways with negative controls at each: the signing key derives exactly the
public key compiled into the installer's `ARMED_SIGNERS`; stock `ssh-keygen -Y
verify` accepts it and refuses both a wrong namespace and altered bytes; the
repo's own `verifySshsig` accepts it and refuses wrong namespace, altered bytes,
and a stranger-only allow list; and the installer's real verification path accepts
the committed manifest. Finally the published bytes were fetched back from
`raw.githubusercontent.com/believeinoakland/bio/main/release`, the path the
installer actually uses, re-verified, and confirmed to carry the ACL fix.

**biosmoke7 runs 0.14.1 as of July 25.** Updated through the same shape the
wizard's update path uses: `keep_bindings` for `secret_text` and
`durable_object_namespace`, R2 bound explicitly because both buckets exist, and no
`migrations` field, because the `Store` class already exists and its storage
backend never changes. Verified after: the module Cloudflare is running is
byte-identical to the signed release asset (sha256
`9bccbd44596b1ad423afc5f256a679e0c22519458fe0cabe91a2c3bdbc84a37a`), its `op=index`
classes read admin, member, probe with `publishedlist` still public, all seven
bindings survived including the three secrets, `stats` is identical before and
after (30 bundles, 137 files, 239 history, 10 refs, 87 register, dbBytes
1200128), `op=audit` reports 30 checked with zero findings, a member still reads
the index and unauthenticated and bogus credentials are refused, and the
`newgroup` wizard on the same account was untouched. No `PUBLIC_TOKEN` is bound on
this instance, so the public-class refusal itself is proven by
`test/fence.test.mjs` and by the deployed bytes rather than by a live call.

---

v13, July 24, 2026. THE WRITE ARC IS BUILT AND LIVE ON BIOSMOKE6 (tree
0.4.1, 328 assertions green across fifteen suites, whole plane battery 20
seconds). 0.4.1 adds the instance-served signing page and the plain-words
roster refusals described at the end of this section. Members, intake, the gate, the doorbell,
and release signing all ship together, and the instance page is now a
working front end rather than a read-only window.

**Member credentials.** Admin invites a member, who spends a one-time
code to set their own password. Passwords live as PBKDF2 hashes under
credentials role `member:<id>`, which is why sessions and credentials
needed no schema change. Revoking a member kills their live sessions,
their login, and their signing keys in one stroke.

**Sessions can now write intake.** This reverses the 0.3.8 rule that a
signed-in browser could only read. A session may promote, lease, allocid,
capture, ratify, and review the inbox; it may never purge or run the
live-fire battery, and only an admin session may touch the roster.
Authorship is stamped server-side from the session, so a browser cannot
write history as someone else; the members suite proves it by sending an
author of "IMPOSTOR" and finding the real member in the record.

**The gate** is plane-native and versioned `plane-gate/0.1`, recorded on
every publish. It is honestly scoped to mechanical integrity: frontmatter
coherence, live hashes against the recorded bundle_sha, the base chain
against history snapshots, registered captures present in R2 at the
recorded size, and no dangling references. The full C-series catalog
still lives in the record rather than the repo and is a later port, which
is why the version string exists.

**Ratification.** Authority is an SSHSIG over `bio-ratify <id> <sha>`
from a registered active member key, verified against the signer
registry. It has its own CAS, so you can only publish the revision you
read. Publishing copies bytes content-addressed into the PUBLISHED
bucket and appends hash rows; re-ratifying converges, and a hash once
published verifies forever, including after later revisions.

**The doorbell.** `verify` is unauthenticated and answers ONLY from the
published projection, so working material cannot leak through it.
`knock` accepts material from anyone into a quarantined inbox, capped at
8MB with R2 or 64KB inline, rate-limited to 12 per source and 300 per
instance per ten minutes, transactional so a race cannot slip the caps.
Worst case under attack is a full inbox.

**Release signing is armed.** RELEASE.json carries `sig` and `signer`;
the installer holds Bob's release public key in ARMED_SIGNERS and refuses
any repository release that is unsigned, signed by a stranger, or signed
for a different purpose, falling back to its built-in copy and saying so
in plain words. Namespace separation means a ratification signature can
never install software. Bob signs in `tools/sign-release.html`, a single
local file with no network access, whose output stock `ssh-keygen -Y
verify` accepts. Development keys were generated July 24, 2026 and are
disposable; production gets fresh, passphrase-protected keys.

**The instance page** gained: member sign-in by name, create a bundle,
revise through lease plus CAS, inbox review with dispositions, member and
key administration for admins, enrolment for invited members, and a
publish panel that shows the exact id and hash to sign and explains every
refusal in plain words. The browse suite still parses AND executes the
served script, which is what caught the 0.3.8 generation defect.

**Standing credentials, revised by Bob (July 24).** Long-lived GitHub and
MEMBER tokens are acceptable during development; per-session minting was
friction without a threat, since nobody runs BIO while it is in
development. Claude still cannot carry a secret across sessions, so the
value is pasted once per session. Revisit at production.

**Two test-harness defects found by measuring, both costing hours.**
First, three suites written this session built Miniflare and never
disposed it. Miniflare runs a real workerd child process, so each suite
printed its result in about a second and then hung until something killed
it: roughly 150 seconds per suite per run, with nothing failing and no
symptom except slowness. Second, the whole plane battery now runs as one
command. `npm test` covers all fourteen suites in 23 seconds, and it runs
`hygiene.test.mjs` FIRST, which reads its sibling suites as text and
fails the battery if any of them constructs a Miniflare it does not
dispose, or ends without exiting on its own result. That guard caught
four older suites relying on the event loop draining; all are now
uniform. The lesson recorded for future sessions: measure before
theorising about performance, because both defects were invisible to
every assertion and obvious to a wall clock.

**One defect found and fixed in the existing wizard suite.** Four probe
stubs answered `{ ok: true }` without the `bindings.STORE` field the
installer requires, so `verifyInstall` exhausted ten retries at three
seconds each in eight blocks. The suite spent 240 of its 241 seconds
asleep and three original blocks had been silently exercising a failed
verification path. Fixed; the suite now runs in under a second.

**0.4.1, from watching Bob use it.** Three things were opaque or wrong.
(a) The instance asked for "the public key from the signing page" with no
link to any such page and no way to tell which of a member's two keys it
wanted. The plane now SERVES the signing page at `/sign`, embedded at
build time by `scripts/embed-signpage.mjs` from the same
`tools/sign-release.html` the conformance suite tests, and the roster page
links to it and explains in two sentences where a key comes from and why
the public half is safe to hand around. (b) The key box now reads a pasted
line back in words before it is committed, naming the label it sees and
refusing the RELEASE key by name if that is what was pasted. (c) Roster
refusals printed raw store codes (`BAD_MEMBER_ID`); they are now sentences,
and the member-name field normalizes what is typed instead of rejecting a
capital letter.

**A generation defect caught before it shipped.** The first cut of the key
reader used `split(/\s+/)` inside the page template, and the template ate
the backslash, so the browser would have received `split(/s+/)`: valid
JavaScript that splits on the letter s. That is the identical mechanism
that broke 0.3.8. The browse suite now executes the SERVED script and
asserts the key reader's behaviour, which is the only way this class of
defect is visible, and the page avoids backslash escapes entirely.

## Consistency audit, July 24, 2026

Run after the doctrine corpus and the retired promotion service were both
brought into the repository, comparing the documents, the authoritative check
catalog, and the shipped plane against each other. The catalog is
`bio-plane/checks/bio-checks.mjs`, version 1.16.4, hash-verified against the
constant that service pinned beside it.

**Finding 1: the plane's intake UI creates bundles the catalog would refuse.**
Severity: real defect, shipped in 0.4.0 and 0.4.1.

The "Add something new" form stamps `current_state` from a table reading
`{information: collected, problem: forming, project: forming, action: forming}`.
Only two of those are legal. The catalog's `STATES` table is:

| type | legal states |
|---|---|
| information | collected, verified, retired |
| problem | surfaced, elevated, deferred, dismissed |
| project | forming, investigating, matured, closed |
| action | planned, active, awaiting_response, resolved, abandoned |

So a Problem created through the browser lands at `forming`, which is not a
Problem state at all, and an Action lands at `forming`, which is not an Action
state. Check C-4.1 refuses both. `plane-gate/0.1` does not implement C-4.1, so
the plane accepts them silently and the defect is invisible until the catalog
is ported. Correct first states are `surfaced` for a Problem and `planned` for
an Action.

**Finding 2: the plane writes four frontmatter fields where fifteen are
required.** Severity: real defect, same scope.

`CORE_FIELDS` requires id, object_type, schema, title, current_state,
prior_state, created, last_updated, produced_by, group, references,
state_history, annotations_open, reeval_pending, visuals. The intake form
writes id, object_type, current_state, and title. Check C-2.2 fires once per
missing field, so every bundle created through the browser carries eleven
errors. The canonical headings per type (C-3.1) are also unmet: the form
writes `## Summary` for every type, which is right only for Information.

Both findings have the same root cause. The intake UI was written against the
plane's own tolerant store rather than against the catalog, because the catalog
was unavailable. It is available now.

**Finding 3: the plane's history projection is incompatible with the
authoritative checker.** Severity: real defect in the plane's read path. NOT a
migration defect.

The catalog was run against all 30 migrated bundles on biosmoke6, the first
time the authoritative checks have ever been applied to the live record. Result:
30 of 30 bundles report errors, and every one of the 168 errors is the same
check with the same shape:

```
C-12.2: history file '_history/20260719T044000Z_9ed7a0c8/bundle.md'
        maps to no manifest entry
```

The cause is a layout disagreement, not missing or corrupt content. The plane's
`readImage` emits history as a directory path:

```
_history/<snap_key>/<path>              store.mjs line 59
```

The canonical bundle layout, which the catalog parses and which Drive used, is
flat with the key as a filename suffix:

```
_history/bundle_<snap_key>.md          bio-checks checkHistoryCoherence
```

Same snapshots, same keys, same bytes, different arrangement. The catalog looks
for `bundle_<key>.md` beside the manifest, finds a directory instead, and
reports every snapshot as unaccounted for.

**Which side is wrong is not a matter of taste.** `schema.mjs` states the rule
in its own second line: "The bundle format is authoritative; this is a
projection of it and must never bend it." The plane's projection is the
deviation and the plane is what changes. Rewriting the catalog's path
expectations would bend the format to fit the projection, which is the one thing
the rule forbids.

**What this result says about the migration: it is sound, and now
independently so.** Beyond the projection mismatch there were ZERO findings.
No missing core fields, no illegal states, no wrong headings, no unresolved
references, no append-only violations, no hash mismatches, no release-authority
violations. The catalog checked frontmatter contracts, state legality and
transition edges, append-only surfaces against history snapshots, reference
resolution across the whole store, citation registers, provenance registers,
and mechanical-writer conformance, and found the migrated content conformant
throughout. The earlier migration verification compared the plane against the
Drive mirror; this is a stronger statement, because it checks the content
against the specification rather than against its source.

**There is therefore no reason to wipe and re-migrate.** The record is intact.
One function in the plane's read path emits the wrong shape.

**Finding 4: the relationship vocabulary disagrees between document and
implementation.** Severity: documentation drift.

State Rules 5.1 declares the vocabulary "closed until amended by this spec" and
lists six values: cites, relates_to, elevated_into, initiates, derived_from,
supersedes. The catalog's `REL_VOCAB` carries a seventh, `corroborates`. The
implementation is ahead of its specification, and since the spec claims to be
the closed authority, the document needs the amendment rather than the code
needing a change.

**Capture integrity, verified independently.** The conformance run above
ELIDED capture bytes, because the plane's image returns blob references rather
than content, so C-18.6 (registered hashes verify against stored bytes) was
skipped. Provenance rests on precisely that check, so the conformance result did
not cover it. Closed separately: all 67 distinct captures referenced anywhere in
the record, live or historical, were fetched and hashed in this session.

```
verified byte-identical : 67
hash mismatch           : 0
absent from storage     : 0
total bytes hashed      : 148.4 MB
```

Census also matches: 28 information, 1 problem, 1 project, 30 total, which is
what the Drive store held.

**One residual, small and named.** The register holds 87 rows; 67 are referenced
by a file in some revision of some bundle. The remaining 20 are registered
captures nothing in the record points at, most plausibly bytes superseded by a
later revision plus the dropped transport twins, and they were not verified
because nothing references them. Storage bookkeeping rather than provenance:
no claim in the record depends on them.

**The boundary of what is known.** Two things are established: the record is
conformant to its own specification, and every capture it references hashes
correctly. One thing is not: this session has never read the Drive store, so
fidelity to the source rests on the migration tool's own comparison against the
Drive mirror rather than on independent confirmation. Spec conformance is the
stronger check for the purposes the record serves, and it is the one that was
missing until now, but it is not the same claim as source fidelity and should
not be reported as though it were.

**THE STORE OF REFERENCE IS NOW BIOSMOKE6.** Decided July 24, 2026 on the
evidence above. The Drive CivicOS store is demoted to a frozen snapshot: it is
kept, it is not written to, and it is not of record. Two planes of record cannot
coexist, and the one with independent verification wins. Note the standing
qualification Bob attached: this corpus is real data taken from the web, and no
production system will ever use it without refetching from source, so its role
is development reference rather than evidentiary archive.

**What else was checked and found consistent.** Object type prefixes and their
type-root mapping; Project lifecycle and the work-product readiness ladder
against State Rules 4.3; Action kinds and risk tiers against 4.4; the
`bio-release` SSHSIG namespace, which the plane, the catalog, and the member
key registry all agree on; and the intake doctrine's release-authority rule
that a collected-to-verified transition is never authored by a surface or AI
identity, which the catalog enforces as C-18.1 and the plane's ratification
signature requirement independently satisfies.

NEXT: port the C-series catalog into the gate (needs the record), the
5,000 and 20,000 bundle benchmark from Conversion Plan step 6, and the
retrieval arc.

## The source of record, verified live today

FROZEN SNAPSHOT as of July 24, 2026, no longer of record. The former source
lived in the retired substrate's `CivicOS` folder tree — **decommissioned
July 27, 2026, folders and deployment both deleted**, per
`docs/archive/apps-script-README.md`: `information/` (28 bundles),
`problems/` (1, state elevated), `projects/` (1, state forming),
`actions/` (0), and `index/` holding `index.json` (registry v0.12.10, all
30 bundles with locator, state, and live bundle.md sha256) plus
`invocations.jsonl`. **That daemon ran through the migration and is now gone**;
the CivicOS zip Bob downloaded is the migration snapshot and is what survives. Canonical IDs
include the slug, so the repeated numeric prefixes at 0100 and 0106 are
distinct IDs, not collisions.

Nothing in the store is in a ratified state: the whole migration lands in
the working corpus, and bio-published starts empty until the first real
ratification on the new plane. `INFO-2026-5460-member-release-key-registry`
(verified, July 22) must arrive intact; signature enforcement depends on
it. 0098 (the retired plane's selftest) and 0120 (D5 acceptance test) are test
material; they migrate anyway and can be deleted later through the normal
path.

## Bundle anatomy and the capture evidence chain

Each bundle: `bundle.md`, `data/*.json`, `_history/` (snapshot pairs
`bundle_<stamp>_<hash8>.md` + `promotion_<stamp>_<hash8>.json`, archived
data files in a nested `data/`, `manifest.json`), and for capture-bearing
bundles `snapshots/` holding up to three forms per capture: the binary, a
`.b64` transport twin, and an RFC 3161 `.tsr` token.

Verified against INFO-2026-0103's actual records:
- Promotion records are `{target, base, files:[{name, sha256, encoding?}],
  created, author, skill_version}`; creation base is the empty-string SHA.
- Entries marked `encoding: "base64"` hash the single-line base64 transport
  text, not the binary. The authoritative binary hash is
  `capture.sha256` in `data/provenance.json`.
- The RFC 3161 token attests the `.b64` file's bytes (freetsa.org names
  the `.b64` form as its token_file). But base64 is a deterministic
  function of the binary, so the stamped bytes can be regenerated on
  demand and the twins are droppable transport remnants. Final policy:
  each twin is verified to decode to its binary AND to be byte-exactly
  reproducible by re-encoding, its hash is recorded in the provenance
  capture as the proof, and it is dropped. A twin that is not
  byte-reproducible is genuinely load-bearing for its token and is kept,
  flagged. A twin that lies aborts its bundle. Expected on the real
  store: every twin dropped.

Volume: low hundreds of MB dominated by PDF captures, twins excluded,
far inside the R2 free tier.

## Conversion Plan reconciliation (July 23 plan vs today)

Sequencing steps 2 through 4 of the plan (plane layer, core port, client)
were executed as the bio-plane conversion; the plane stands at 147 green
assertions across seven suites. Step 5, migration and acceptance, is what
this arc delivers. Of the four Section 2 probes: probe 3 (R2 at real
object sizes) is answered by the July 23 live measurements; probe 2 is
partially answered by the scaling runs; probes 1 (FTS5 virtual tables vs
export) and 4 (Vectorize under the cap) belong to the retrieval arc, which
per the plan's own lean ships after parity, and probe 1 only bites once
FTS5 tables exist. The plan's acceptance criteria are folded into the
migration tool's verification pass below. Retrieval architecture (plan
decision 1) and its scheduling (decision 2) remain open and are not
blocking the migration.

## What was built and proven today (tree 0.3.4)

**The capture op.** The plane had no way to move capture bytes: promote
records blobSha references, but nothing on the public surface wrote R2.
Any future client faces the same wall, so this is a plane feature, not
migration scaffolding. `op=capture` PUT lands bytes content-addressed
under `<store>/captures/<sha256>`, server-verifies the body hash against
the parameter, treats existing keys as immutable (re-put answers ok,
existed true, writes nothing), and GET reads bytes back honouring Range.
Probe confinement to scratch holds mechanically through the store prefix.
19 assertions.

**The migration tool** (`bio-plane/migrate/migrate.mjs`, runbook in
`migrate/README.md`). Front-door replay: reconstructs every revision state
of every bundle backward from `_history`, prunes files that had not yet
been created, cross-checks every reconstructed state against the SHA-256s
in the original promotion records (encoding-aware) and every base against
the prior revision's bundle.md hash, then replays forward through promote
with the Drive snapshot keys passed verbatim as snapKeys. Captures,
twins, and tokens travel through the capture op. The original promotion
records, manifest, and index entry migrate verbatim as a registered
`migration/drive-provenance.json` capture per bundle. Verification then
compares the plane's image against the mirror file by file, history key by
history key, checks the live hash against the index entry on both sides,
and range-reads every capture back byte-identical. Any failure aborts that
bundle with nothing partial landed, and a re-run refuses at creation
through the CAS. 35 assertions against a fixture modeled on the observed
store, including the tampered-twin abort, the b64-only recovery path, and
a kept unreproducible twin.

Plane totals: 24 store, 14 purge, 18 bootstrap, 18 livefire, 27 installer,
19 capture, 35 migrate, all green (155 total). Wizard untouched at 59 green. Tree 0.3.5.


## Migration rehearsal: DONE, all 30 bundles clean (this session)

The full real store (the CivicOS zip downloaded 2026-07-24 14:41 UTC,
151MB, 411 files) was migrated end to end into a local plane instance in
the session container and verified clean: exit 0, 30 bundles, 121
promotions replayed, 137 live files, 239 history revisions under the
original Drive snapshot keys, 10 cross-references, 87 registered
captures, 1.1MB of metadata. Per-bundle ledger in
`MIGRATION-REHEARSAL.log`.

Real-store facts the rehearsal established, now encoded in the tool:

- The daemon originally wrote captures under `.b64` transport names and a
  later daemon pass (0.11.x member-attest) decoded them, deleted most
  transport files, and re-issued RFC 3161 tokens. The tool synthesizes
  derivable historical transports (validated against the records' own
  hashes) and preserves the recorded hash where bytes are truly gone.
- 26 first-generation timestamp-token transports are unrecoverable; each
  is documented with its recorded hash in the per-bundle
  drive-provenance capture. All CURRENT tokens migrated byte-exact.
- 10 reproducible transport twins dropped with proofs; 12 captures
  verified against the store's own provenance registers, including the
  split-part budget book reassembly check.
- The selftest bundle's rotated early history is handled as documented
  truncation. Refused-write records and packages are preserved verbatim.
- INFO-2026-0301's split `.p000`/`.p001` parts migrate as recorded
  first-class files; concatenation verified against `capture.sha256`.

The identical command loads biosmoke5 once it is reachable and current.

## Standing credentials process (agreed July 24)

Claude has no storage between sessions and its cross-session memory is
prohibited from holding credentials, so standing access means a process,
not a stored secret. The repo write token is supply-chain sensitive: the
repo is the distribution channel and its integrity manifest lives in the
same repo, so a leaked token could ship a poisoned release. Process:

- Cloudflare: already solved. Installs and updates authenticate through
  Cloudflare's own sign-in inside the wizard, approved by a click, no
  credential in chat. Instance work (like migrations) uses a throwaway
  token set in the Worker's settings and rotated after.
- GitHub: Bob keeps the token recipe in his password manager: GitHub,
  profile, Settings, Developer settings, Fine-grained tokens: 7-day
  expiry, only believeinoakland/bio, Contents read-write. Mint per
  release session, paste in chat, delete after. Under a minute.
- The relaxation that makes long-lived tokens acceptable later: signed
  releases, verified by installers against the member release key
  registry (INFO-2026-5460), planned with the write arc. After that, a
  leaked repo token cannot poison installs, and a long-lived token in
  the password manager becomes reasonable convenience.

## Getting the repository live: Bob's two browser steps, then Claude

1. Create a GitHub account (or organization) named exactly
   `believeinoakland` at github.com. If that name is taken, pick another
   and tell Claude the actual name so the installer constant can be
   re-cut; nothing else changes. Then create a new PUBLIC repository in
   it named exactly `bio`, empty, no README.
2. Mint Claude a credential: GitHub Settings, Developer settings,
   Personal access tokens, Fine-grained tokens, Generate new token.
   Repository access: Only select repositories, believeinoakland/bio.
   Permissions: Contents, Read and write. Expiration: 7 days. Paste the
   token in chat. It is burned by chat exposure; delete it from GitHub
   when the session is done.

Claude then pushes the full source tree, the release/ folder
(RELEASE.json plus bio-plane.bundled.mjs), and a v-tag, and verifies the
installer's fetch paths answer. Every future release: attach the current
tree zip in a session, provide a fresh short-lived token, and Claude
pushes source, release files, and tag. Bob pastes the wizard only when
the wizard itself changed, and the delivery note will say so.

One paste remains to activate repo distribution: newgroup-0_3_11-paste
into the newgroup Worker, after the repo is live.

## Deployment picture and migration sequence

biosmoke5.believeinoakland.workers.dev is THE development instance. All
development, including the trial migration of the real record, runs
against it. It will be wiped and a fresh production instance installed
once the workflow is ready for real work. **The retired store held the record
of authority through the migration and was decommissioned July 27, 2026**
(`docs/archive/apps-script-README.md`); what survives of it is the migration
snapshot, and the plane is the only thing running.

Installer hardened this session (tree 0.3.6, wizard 67 assertions green,
by Bob's direction that the installer must do everything because real BIO
groups are not tech savvy):

- Evidence storage (R2 buckets plus bindings) is now REQUIRED at install.
  If the account has no payment method, the installer stops before
  creating anything, with a plain-words page explaining the one Cloudflare
  prerequisite and the exact next step. No more half-instances like
  biosmoke5.
- The update path now self-heals: it creates the buckets and binds them
  explicitly when the account allows, quietly completing any copy
  installed before storage was required. Storage trouble never blocks an
  update.
- The unconfirmed-version ending is no longer a red failure. It reads as
  done, with a patient note that new addresses take a few minutes, which
  is true and normal. (Root cause of the confusing screen: every release
  used to report version 0.3.0, so confirmation could never see a change.
  Versions are now truthful and aligned; this release is 0.3.6
  everywhere.)

Development migration (repeatable, disposable):

1. DONE: payment method on the believeinoakland account.
2. Bob pastes the delivered newgroup-0_3_6-paste.mjs into the existing
   newgroup Worker (dashboard, Edit code, replace module, Deploy) so the
   live installer carries release 0.3.6 with required storage.
3. DONE: biosmoke5 deleted; biosmoke6 installed by the 0.3.6 installer,
   complete and claimed, storage proven live.
4. DONE this session: rehearsal migration of the full real store into a
   local plane, all 30 bundles verified clean (section above).
5. DONE: the full record loaded into biosmoke6 and verified, 30 of 30
   clean, via a throwaway MEMBER_TOKEN since rotated back. After any
   future wipe: re-download CivicOS, set a fresh throwaway, rerun the
   same command; resume makes interruptions harmless.
6. DONE: the read view (tree 0.3.8, browse suite 17 assertions). The
   instance page, after password sign-in, opens the record: bundles
   listed by type with states, each bundle readable with its rendered
   record, its files, downloadable captures, and its full append-only
   history including viewing any past revision. Sign-in sessions can
   read everything and write nothing; every write still requires a
   machine credential. To put it live: Bob pastes newgroup-0_3_8-paste
   into the newgroup Worker (Edit code, replace, Deploy), then runs the
   installer's /update against biosmoke6. This is also the first real
   update of a loaded instance: version goes 0.3.6 to 0.3.8 and the
   record must come through untouched, which the browsing page then
   proves by eye. NEXT: the write side of the workflow (member
   credentials, intake, promotion through the gate) and, per the
   Conversion Plan, the retrieval arc. ALSO NEXT, per Bob (July 24): the
   Conversion Plan step 6 benchmark has not run as such. Real live
   measurements exist and beat the plan's refutation thresholds by wide
   margins (July 23, on real infrastructure: whole-store pass 112ms at
   504 bundles against a refute-over-10s threshold; ~100ms fixed round
   trip; R2 ~32MB/s with 220-250ms per-object overhead; and today, the
   full 30-bundle record with 87 captures migrated and verified over the
   public internet in minutes). What has NOT been measured: synthesized
   stores at 5,000 and 20,000 bundles on the deployed plane, which is
   the formal benchmark against the plan's prediction table. It should
   run before the retrieval arc, using the plan's own tool approach, and
   costs about half a session.

7. REQUIRED IN THE WRITE ARC, per Bob (July 24): doorbell operations, a
   public surface safe even under attack, safe by construction:
   (a) public verification scoped to ratified material only: anyone can
   ask whether a document's SHA-256 is in the PUBLISHED record; the
   published corpus has never seen unratified material, so there is
   nothing to leak. (b) public intake, the knock: outsiders submit
   material into a quarantined inbox namespace confined the way probe is
   confined to scratch today, size-capped and rate-limited, touching
   nothing until a member pulls it through the gate. Worst case under
   attack is a full inbox. Ships with ratification and member review,
   which it depends on.

Production cutover (later, once the workflow is ready):

7. Install the production instance via the installer (the real test of
   the wizard's R2-create branch, now that a card is on the account).
8. Disable the daemon permanently, confirm the index files go quiet for a
   full trigger interval, download CivicOS one final time, run the same
   migration runbook against production, verify, prove with eyes.
9. Wipe biosmoke5. Decommission the old 0.2.0 test deployment on the old
   account (delete the Worker, empty and delete both old buckets; the 504
   scratch bundles die with them). This can also happen earlier at any
   point, since nothing needed lives there.
10. Zone move still waits on the Network Solutions registrar transfer.

The retired daemon was never repointed at the plane; its substrate
assumptions did not carry. Its plane-native replacement is future work in
the retrieval-and-beyond arc, before production cutover.

## Live findings on the Cloudflare side, from this morning, unchanged

- `bio-plane.neocloudflare.workers.dev` (0.2.0) answers on the legacy root
  form; the 0.3.x SECRETS.txt tokens are denylisted by design and are not
  the deployed ones. Nothing in the old store is needed; Drive is the
  record of authority.
- `newgroup.believeinoakland.workers.dev` answers 200.

## Open items

- Installer remainder 2 (host the invitation page at
  believeinoakland.org/newgroup on the old account) is still open.
- The workflow front end (the healthy-page dead end) is unbuilt; the
  migration wants at least a minimal read view for step 6.
- Retrieval arc: probes 1 and 4, then FTS5 plus Vectorize plus RRF, per
  the Conversion Plan. Not blocking.
