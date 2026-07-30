# Thread UI: paste-ready kickoff

Moved from `docs/development/SESSION-KICKOFF-UI.md` on 2026-07-30, when kickoffs
were split per thread. See `kickoffs/README.md` for the register, the paths this
thread owns, and the append-only rules for shared files.

Rewritten 2026-07-30 at the close of the session that closed the plane/UI gap
(link surface, capture honesty, U8; UI builds cbbade6bbd93 then 9a34a82fd0c8).
Bob pastes the block below verbatim and fills the three grant slots. Everything
the session needs it fetches for itself from the public repo; Bob attaches
nothing.

---

Kickoff: thread UI. Fetch these from
raw.githubusercontent.com/believeinoakland/bio/main and read them before anything
else: docs/development/kickoffs/README.md (the thread register: what this thread
owns, and the append-only rules for shared files), docs/development/UI-PLAN.md (the plan of record;
U1 through U8 are DONE and the standing dependencies section now names two plane
defects that make the link surface tell a member something untrue),
docs/development/CIVICOS_UI_STATE.md (read the newest entry only, v29),
docs/development/DEBT.md (D-57 through D-62 are the last session's; D-60 and D-62
are the first work of this one), docs/development/LINK-FIDELITY.md (the link design
with my rulings marked RATIFIED inline), bio-plane/package.json and
bio-plane/scripts/deploy.mjs (the plane's release path), civicos-ui/test/run.mjs
(the UI test path).

This session, in order:

(0) Read `docs/architecture/BIO_Content_Framework_v0_10.md` before anything else, then
`docs/architecture/CONSTRUCTS.md` for the evidence behind it. The framework is the
shape the code should take; the inventory is why. Note §2, the invariants, and §9,
the cost of absorbing a new stack, content type, connection rule or AXIS: that table
is the specification, and a change that raises one of those numbers needs to justify
itself. Bob's framing, which corrected mine: we have NOT discovered enough and will
keep discovering for a long time, so the framework exists to make the next surprise
cheap rather than to be complete. Development is
paused for consolidation and that document says why, with the measurements. Also
read UI-PLAN.md's "Who this is for": the audience is non-technical and the workflow
exists to keep members out of logistics, so technical complications get classified by
the system and never surfaced as choices. The suite carries a vocabulary guard over
member-facing strings.

(1) STEP 0 of the plan in CONSTRUCTS.md, and nothing else until it is done. Bob
ruled that this is the FULL version and not a deduplication: "we must do the work
upfront in order to end up with the results we need." So implement framework §4, one
recogniser interface and one registry helper, with both existing axes rewritten onto
them. The test of whether it worked is that Step 4, the entity axis, costs a
registry. Concretely: one confidence ladder rather than
`CONFIDENCE` and `TYPE_CONFIDENCE`; one entry point, `assess()`, with `monitor()` and
`compare()` made internal; one diff, `diffEntities`, with `diffMembers` deleted;
`CONTRACT` declared by the content type rather than derived from the stack handler; a
shared catalogue of event types instead of ad hoc strings inside one content type;
`meaningful` derived from `SIGNIFICANCE` rather than carried separately. This step
should shrink the codebase. Do not add capability while doing it.

(2) STEP 1: the plane records the profile. `op=acquire` calls `identify()` and
`doctypeFor()` and writes handler, content type, both confidences, signals and what
was normalised onto the capture. Roughly twenty lines and everything else depends on
it: without it, no verdict computed later can be re-evaluated when a handler turns
out to have been wrong. Consumer: the document page says what kind of document the
record thinks it holds.

(3) Then Steps 2 through 7 in order, and treat the ordering as binding. Each step is
finished only when something CONSUMES its output; that rule is why the last session
produced 1,463 unconsumed lines. Do not start a new content type until Step 6.

(4) Deploy discipline, both planes. Plane: full suite, signed, tagged, deployed
byte-identical through scripts/deploy.mjs, audit clean after. UI: node test/run.mjs
bare, deploy, verify /build has converged, push source and docs together.

(5) Update UI-PLAN.md and CONSTRUCTS.md, add a state doc entry, and rewrite this
kickoff file for the session after.

Grants for this session (sessions carry no secrets; paste all three even if
unchanged): Cloudflare deploy token: [PASTE]. GitHub fine-grained token for
believeinoakland/bio, Contents read/write: [PASTE]. Member token for post-deploy
verification: [PASTE]. Deploy target account id
20b533579290b9b93168345edd3b7f72 (biocloudflare), plane worker biosmoke7, UI
worker civicos. Work without asking me to confirm anything determinable from the
repo; decision items at the end only.

**Numbers come from MEASUREMENTS.md, never from memory or a vendor docs table.**
It records the subrequest ceiling (51 including the primary), the CPU probe
result (40,000,000 reference iterations fit; killed on the next 2,000,000,
against a documented 10ms that is plainly not what is enforced), what real pages
cost, and how reuse and continuation converge. If a figure looks stale, re-run
the instrument named beside it. A number in the source that nobody measured is a
guess wearing a constant's clothes, and that has already cost this project two
wrong constants.

**A Worker cannot time itself.** Cloudflare freezes `Date.now()` during
synchronous execution as a timing-attack defence, so any millisecond figure
measured inside a Worker is a fabrication. Count work, not time. See
`bio-plane/src/cpu.mjs`.

**Source access: BIO does not disguise its requests.** `www.oaklandca.gov`
returns 403 to the plane on every path including `robots.txt`, while its Socrata
and OpenGov properties answer normally. The user-agent question is deferred
pending Bob's counsel; the refusal to impersonate a browser is not, because a
system whose entire subject is provenance does not lie about who is asking.
SOURCE-ACCESS.md has the evidence, the practice, the law and the open questions.

**This thread does NOT hold the release baton** (`kickoffs/BATON.md`, held by
CAPTURE as of 2026-07-30). Deploying `civicos` is unaffected and needs no baton,
because the UI worker carries no version number in the shared repo. Cutting a
PLANE release does: `deploy.mjs` refuses without `--thread UI` matching the
remote baton. If this thread needs to ship a plane change, say so in the decision
items and let Bob pass the baton.
