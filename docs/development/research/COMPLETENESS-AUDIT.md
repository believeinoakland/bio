# COMPLETENESS-AUDIT — what nobody thought to ask about

Written 2026-08-01 (research pass; this file creates one document and edits nothing
else, and claims no area in `CLAIMS.md`). **Every claim about the code names its file
and, where it matters, its line.** Where a claim is a prediction rather than a
measurement it says so and names the test that would settle it. Nothing here is
scheduled and nothing here is a decision.

**This pass is defined by what it is NOT.** The eleven files in
`docs/development/research/` measured the system along the stack (`LAYERS`), the
unattended half (`MACHINE-PROCESSES`), one member's path (`JOURNEY-PRIMARY`), the
other audiences (`AUDIENCES`), every process (`PROCESS-CATALOGUE`), authority
(`CAPABILITIES`), the screens (`UI-BASELINE`), the schema (`DATA-MODEL`) and the
seven surfaces (`SB-*`). `DEBT.md` holds 143 rows. All of that was read before this
was written, and **every finding below was checked against it**: a finding appears
here only if no research file and no debt row names it.

The axes below are the ones no pass used. They were chosen by asking what every
earlier pass had in common, and the answer was: **each measured the system in a
steady state, at the size it will eventually be, with the work in flight and the
people present.** Failure, time, smallness, a second instance, and a person leaving
were nobody's axis.

---

## 0 · Negative results — axes that turned out covered

Recorded first, because a hunt that reports only hits is not a hunt.

| axis probed | verdict | where it is already covered |
| --- | --- | --- |
| **Alarm retry / double-firing of machine processes** | **COVERED, thoroughly** | `MACHINE-PROCESSES.md` §4 — retry re-runs succeeded consumers, the archive-monitor has no idempotence key and inflates `observations`, derive-then-delete fails safe |
| **Retraction / unpublishing a published case** | **COVERED, and deliberately foreclosed** | `PROCESS-CATALOGUE` P-63/P-64, `AUDIENCES` H1, `SB-OUTPUT` S14/S16 and O2 S6. Supersession is the only route, by doctrine, and the reasoning is written down |
| **The two-administrator floor as a governance rule** | **COVERED in code and correct** | `memberAdd`'s `ADMINS_FIRST` (`store.mjs:5696`) forces the second member to be an administrator; a group that drops to one admin self-heals because the sole-admin arm re-opens. `CAPABILITIES.md` §2.3 catalogues the arithmetic |
| **A purge destroying a published case's basis** | **COVERED and sound** | `purge` leaves R2 untouched by design (`store.mjs:4484-4486`), `published_bundles`/`published_shas` are EXEMPT, and `op=capture` GET is content-addressed and never consults the register (`index.mjs:1378-1408`). Named in `SB-OUTPUT` §2.3 |
| **A member of the public reading a published case** | **COVERED** | D-143 |
| **A capture stopped by the platform ceiling** | **COVERED** | `SB-EVIDENCE` A4/A10/D6, D-132, `PROCESS-CATALOGUE` P-80 |
| **Stale derived state (strength, overdue, connections)** | **COVERED, and the doctrine is settled** | derive-on-read against an injectable clock; `DATA-MODEL` §2.5, D-90 |

---

## 1 · Findings, ranked by consequence

---

### A1 · Bundle identifiers are per-instance sequential, so two instances mint the same ids — and the published surface says the opposite

**Missing.** `allocId` (`store.mjs`, id template at `:4401`) builds
`${prefix}-${year}-${nnnn}` from a per-store `seq` counter. `BUNDLE_ID_RE`
(`bio-checks.mjs:13`) admits exactly that shape. So the *first* Information bundle in
every BIO instance that will ever exist is `INFO-2026-0001-<slug>`. Nothing anywhere
qualifies an id by instance: `publishedManifest` (`store.mjs:5332-5342`) and
`publishedList` (`:5963-5966`) return bare `bundle_id`, and `bundles.group_id` exists
as a column that `DATA-MODEL` §1.3 records and no code discusses.

**Why nobody looked.** Every pass measured one instance. `AUDIENCES` row 17 got
closest and asked a different question — *what GRADE does a cross-instance citation
carry* — which presumes the citation can be addressed at all. `DATA-MODEL` §1.2
recorded `allocId`'s exact template and, as its own author notes, did not say two
instances mint identical ids.

**What breaks.** The sovereignty promise is stated at the identifier layer and
delivered only at the hash layer. `SB-OUTPUT` O2 S11 tells a reader, in the surface's
own words, that *"any copy of this record — a mirror, an export, another instance —
answers the same question this one would."* That is true of `verify(sha)` and false of
everything addressed by id: a case file citing `INFO-2026-0007`, a WARC or Memento
export (M6), a mirror, a merge of two exports, or one group citing another's published
case. Two instances' exports cannot be placed in one directory without silent
conflation, and that is precisely the M6 capability.

**Note the asymmetry, because it is the fix's shape.** Content hashes *already*
compose across instances perfectly — two groups capturing the same agenda hold the
same sha256. Everything above bytes is addressed by an identifier that does not.

**Disposition: decision for Bob.** Namespacing an id is cheap now and a migration
later, and it touches `BUNDLE_ID_RE`, the check catalogue, and every id a member has
quoted. Whether BIO wants inter-instance addressability at all is doctrine
(Membership v2 §2 says nothing crosses a group boundary), but M6 already promises
mirroring, so the question is live regardless.

---

### A2 · Re-ratifying a bundle DESTROYS the earlier attestation, and a designed surface promises it does not

**Missing.** `publish` (`store.mjs:5926-5949`) writes `published_bundles` with
`ON CONFLICT(bundle_id) DO UPDATE SET bundle_sha=…, ratified_at=…, attestor_key=…,
attestor_member=…, gate_version=…, sig_armored=…`. `published_shas` beneath it is
correctly `ON CONFLICT … DO NOTHING`, and carries the comment *"Append-only: a hash
once published stays answerable forever, across any number of re-ratifications."*
The comment is true of the table it sits on and false of the table above it.

**Why nobody looked.** `SB-OUTPUT` designed the ceremony (S16) around exactly this
case and reasoned it out correctly at the level it checked: *"Publishing again
publishes the new revision. It does NOT withdraw the one already published: that hash
keeps answering… Why re-ratification is shown as accumulation, not correction. Because
that is what `published_shas` does."* It cited the append-only table and did not read
the row above it. `DATA-MODEL` §2.4.4 lists `published_bundles` as needing no change.

**What breaks.** After a second ratification of one bundle id, the record can no
longer say **who attested the first version, when, with which key, or under which
gate** — the signature is gone. `verify(sha)` still answers `published: true` for the
old bytes, so the record asserts those bytes were ratified and cannot produce the
ratification. This is the one act the whole system calls irreversible and attributable,
and its attribution is the mutable part. It also makes `AUDIENCES` §5's claim —
*"ratification is not merely the publication boundary, it is the only act whose result
the custodian cannot later revise"* — untrue as implemented, in an administrator's
instance where that property is the whole argument.

**Disposition: defect.** `published_bundles` should be keyed
`(bundle_id, bundle_sha)` and append-only like its sibling, with reads taking the
latest. Building `SB-OUTPUT` O1 on the current table would ship a member-facing
sentence the store does not honour.

---

### A3 · A capture abandoned mid-add pins the instance's scheduler on forever, and starves the drain behind it

**Missing.** `taskDrain` (`store.mjs:6817-6829`) resolves a queued event to a bundle
through the register; when the capture was never promoted it takes the deliberate
`waiting` arm — *"the capture is not yet filed in any bundle; the event is kept, not
dropped"* — increments `attempts`, and continues. That is right. What follows is not:

- the `task-drain` consumer's `wake` (`store.mjs:901-907`) is non-null while
  `count(*) FROM task_queue > 0`, and a drain that resolves nothing sets
  `#lastDrainProgress = false`, so it re-arms at `TASK_DRAIN_BACKSTOP_MS` **forever**;
- every consumer is `due: () => now`, so each of those backstop wakes drags all five
  consumers behind it — including `overdue-scan`, whose wake `MACHINE-PROCESSES` §3c-2
  measured as an unbounded full-store walk;
- the batch is `ORDER BY enqueued, capture_sha LIMIT 50` with **no cursor and no
  exclusion of events that cannot resolve**, so fifty permanently-waiting events at the
  head of that ordering starve every event behind them, indefinitely.

The producer is ordinary member behaviour: a capture with undetermined authority
enqueues at `op=acquire`, and the UI leaves authority empty as a matter of course
(`app.html:3564` falls back to `""`). Closing the tab between capture and save is the
common case, not an exotic one.

**Why nobody looked.** `MACHINE-PROCESSES` found both halves of the mechanism and did
not join them: it named the `due: () => now` coupling, named `overdue-scan`'s cost, and
found the identical no-cursor starvation in `#monitorTick` — but not in the drain, and
it never asked what *produces* a permanent wake. Every pass treated an abandoned
capture as a lost document rather than as a permanent scheduler input.

**What breaks.** An instance that abandons any capture never returns to holding no
alarm, which is the property `SCHEDULER.md` and the self-termination comments
throughout `#schedConsumers` are built to guarantee. On Workers Free that is a standing
cost on an otherwise idle instance, and the walk it drags is the thing predicted to
fall over first. The abandoned R2 bytes are a second, smaller leak: `purge`'s own
comment (`store.mjs:4484-4486`) defers reclamation to *"a separate sweep against the
register"* which does not exist.

**Disposition: defect.** Needs an eviction rule for an event whose capture has not
been filed after N attempts (recorded, never silently dropped — the D-79 discipline),
or a cursor so unresolvable events cannot hold the head of the queue.

---

### A4 · `op=export` carries no bytes, no membership and no published rows — and there is no import at all

**Missing.** `exportManifest` (`store.mjs:5276-5314`) selects bundle rows, file
*paths and hashes* (`(content IS NOT NULL) AS inline` — never `content`), promotions,
snapshot hashes, refs and the register. It contains **no file contents, no R2 objects,
no members, no signers, no projects or participants, no tasks, no entities,
connections or progressions, and no `published_bundles`/`published_shas`**. Its own
prose says *"every file hashed on the way out, so the receiving side can re-derive
everything and trust nothing the sender asserts"* — but a manifest of hashes gives a
receiver nothing to re-derive *from*. And there is no import: `op=import`,
`op=restore` and any equivalent do not exist in `index.mjs`'s OPS table, and
`newgroup` creates an empty instance and nothing else.

**Why nobody looked.** Export was inventoried three times — `PROCESS-CATALOGUE` P-29
(DESIGNED, no surface), P-92 (its missing notification), `CAPABILITIES` (its root-of-
trust gate), `DATA-MODEL` (`export_log`) — always as an *act with a permission*, never
as an artefact with contents. Restore is named in no research file and no debt row.

**What breaks.** M6 is *"the record can be left, mirrored and outlived"* and D-52
calls the export *"the sovereignty artifact"*. As built it is an inventory, not a copy.
Concretely: a group whose Cloudflare account is closed, whose DO is lost, or which
wants to move accounts has **no path back to a running instance**, and the installer's
whole premise is that the instance lives in the group's own account where those things
happen. A group can leave; it cannot arrive. Even a complete byte export would lose the
roster, the governance history and the published projection, so *who the group was*
does not survive the artefact that is supposed to outlive them.

**Disposition: gap, and it belongs under M6** — sharper than D-99's WARC/Memento
interchange, which is about a third party reading the record, not about the record
continuing to exist. The two are separable and this one is the floor.

---

### A5 · A verdict written in the same second as another is silently discarded, and the record then reports that nothing changed

**Missing.** `link_verdicts` has `PRIMARY KEY (source_capture, address_norm, at)`
(`schema.mjs:366-376`), the writer stamps `at` **truncated to whole seconds**
(`store.mjs:6417`, `new Date().toISOString().split(".")[0] + "Z"`), and the insert is
`ON CONFLICT DO NOTHING` (`:6419-6421`). It then reads the row set back and returns
`changed: all.length > 1`.

So two verdicts for one (capture, address) computed inside the same second — which is
exactly what re-resolving a document's links in a loop does, and what
`op=linkproject`, a re-resolution sweep (P-83) or an alarm-driven re-check would do —
produce **one stored row, no error, and `changed: false`**. The doctrine this table
exists to serve, quoted in `schema.mjs:362-365`, is that *a verdict that changed is
itself a fact*; the write path drops the second fact and then reports the absence of
change as a finding.

`reuse_verdicts` (`schema.mjs:579-591`) has the identical shape —
`PRIMARY KEY (source_capture, address_norm, phase, at)` — and no writer yet, so CAP-4
will land in this trap on its first batch unless it is changed first.

**Why nobody looked.** `DATA-MODEL` §B4 recorded both primary keys and the
"a verdict that changed is itself a fact" rationale and, as its author states, did not
raise the same-tick collision. Nobody read the writer's timestamp precision against the
key it feeds.

**What breaks.** An append-only evidentiary history that silently is not one, in the
subsystem that feeds contemporaneity (D-59) and the link verdicts a member reads. The
loss is invisible: no error, no count discrepancy, and the derived answer flips in the
reassuring direction.

**Disposition: defect.** Either the key drops `at` for a monotonic sequence, or the
stamp carries sub-second precision — and the negative control is two verdicts written
in one tick, asserting two rows and `changed: true`.

---

### A6 · Civic deadlines are fixed 24-hour multiples of a UTC instant; the obligations they model are calendar or business days in local time

**Missing.** The overdue arithmetic is `anchorMs + n * 86400000` for days and
`n * 7 * 86400000` for weeks (`store.mjs:4005-4006`). **The string "timezone" does not
occur anywhere in `bio-plane/src`, `bio-plane/checks` or `docprofile`**, and no
`America/*` zone, offset or locale appears in any of them. `C-2.6` requires
ISO-8601-UTC and that is the whole of the time contract.

**Why nobody looked.** Time was examined as *staleness* (does a stored verdict rot)
and as *trust* (a Worker cannot time itself, D-56) — never as *calendar semantics*.
`SB-OUTPUT` A11 got closest and settled the right question, derive-on-read against an
injectable clock, without asking what the interval means.

**What breaks.** D-128 makes the delta between declared and observed flow *the
analytic product of the whole progression machinery*, and DEC-10 hangs member
notifications off it. A municipal duty — "minutes within ten days", a records-request
response clock, a Brown Act posting window — is a count of calendar or *business* days
in the body's own timezone, not 240 hours from a UTC instant. Fixed-ms arithmetic is
wrong by up to a day at every DST boundary, cannot express a business day at all, and
cannot express a holiday. `SB-OUTPUT` O3 S5 already renders a deadline with its
statutory basis (`Gov. Code §7922.535, ten days from receipt`) — the surface is
designed to state a legal claim that the arithmetic beneath it cannot compute
correctly, which is the overclaiming class this project's discipline exists to catch.

**Disposition: defect, with a decision inside it for Bob** — whether an instance
declares a jurisdiction timezone and a holiday calendar (see A12), and whether
`within_interval` gains a business-day form. Do not fix the multiplication without
settling that; a corrected constant with no zone is the same error one digit smaller.

---

### A7 · There is no LANGUAGE axis anywhere, and the record cannot search the languages a city is required to publish in

**Missing.** No language, locale or `lang` field exists on a capture, a bundle, a
reading or an entity — grep across `schema.mjs`, `bio-checks.mjs` and `docprofile`
returns nothing. `bundles_fts` is created `tokenize='unicode61'`
(`store.mjs:223-224`) over `["title","body","meta","locator","authority"]`
(`query.mjs:80`). And the framework's own axis inventory does not name it: §4's
candidate axes are host stack, content type, authority class, access mode and format,
and D-70's watch list repeats those.

**Why nobody looked.** Every measured document — Legistar, Oaklandside, OpenGov, the
Oakland budget book — was English, so the conservative handler never made noise about
it, and the discipline that finds new stack handlers (D-63: *"the noise the
conservative handler makes on an unmeasured source is the signal"*) has no analogue
here, because a wrong-language document parses silently.

**What breaks.** `unicode61` splits on Unicode character class. For Spanish it is
adequate. For Chinese and Japanese there are no word boundaries, so a whole run of
CJK characters becomes **one token**, and a search for a term inside it returns
nothing — silently, with a confident empty state. Oakland publishes public notices in
Spanish, Chinese and Vietnamese. So a group can hold the multilingual half of a
publication and be unable to find anything in it, and M5 (indexing captured document
text) multiplies the exposure rather than reducing it. Downstream: `docprofile`'s
entity and fact extraction, every content type, and any recogniser that matches on
English words fails on the same documents while reporting ordinary confidence.

**Prediction, not measurement, and here is the test:** promote one bundle whose
`title` and body are Chinese, then `op=search` for a two-character word inside it. If
it returns nothing, use FTS5's `trigram` tokenizer or a per-language column. That test
is one bundle and one query and has never been run.

**Disposition: gap.** Recognising a document's language is the FORMAT-registry shape
D-121 is already standing up — it is a third axis of the same recogniser, and D-70
records that the uniformity claim has never been tested. This is a second candidate for
that test.

---

### A8 · Nothing about retrieval has ever been measured below 600 documents, and the arithmetic says relevance is degenerate at the size every group starts at

**Missing.** The retrieval measurement programme runs at 5,000 and 20,000 bundles
(D-12, D-32, `retrieval-scale.mjs`), and the smallest suite corpus is
`search.test.mjs`'s 600 (D-33). The live reference record holds 30 bundles. **The band
between 1 and 600 — where every real group spends its first months — is unmeasured in
both directions.**

**Why nobody looked.** Every scale question in the repository was asked as "does it
survive growth", so every instrument was built pointing upward. `MACHINE-PROCESSES`
inherited the frame exactly: its smallest unit of arithmetic is 1,000 documents.

**What breaks, predicted.** BM25's IDF term is negative for any term occurring in more
than half the corpus. At 1–30 documents almost every content word does, so matching
documents can score *worse* than the noise, and `ORDER BY relevance` is at best
arbitrary and at worst inverted — for a member's very first searches, when their
judgement of whether the tool works is being formed. Facet counts over a 5-row corpus
and `snippet()` on a single document have the same untested-band problem.

**This is stated as a prediction and the test is one line:** run
`bench:retrieval` at n = 1, 5, 30 and 100 and record what `relevance` orders. The
finding that matters is not the number — it is that **the measurement programme has a
blind spot exactly where every group begins**, and the same blind spot covers the UI's
empty and near-empty states, which `UI-BASELINE` catalogues screen by screen and
nothing exercises.

**Disposition: gap in the verification programme**, M0-shaped rather than M5-shaped.

---

### A9 · A published ratification names a catalogue version, and nobody outside this repository can find out what that version required

**Missing.** `GATE_VERSION` is `plane-gate/1.0 (bio-checks ${CATALOG_VERSION})`
(`gate.mjs:38`), stamped into `published_bundles.gate_version` and served by
`publishedManifest`. `SB-OUTPUT` renders it to a member as machine fact
(`catalogue 1.17.0`). There is no published, hashed or versioned artefact of the
catalogue itself: `bio-checks.mjs` is a source file, its version history is git
history, and nothing in the published projection carries it or its hash.

**Why nobody looked.** The version string was introduced as an integrity property —
D-98 corrected a test *"rather than loosened it to a pattern, because the point of that
assertion is that a ratification records WHICH catalog judged it"* — and everyone
treated recording the name as discharging the obligation.

**What breaks.** The published manifest's own words are that every hash is verifiable
*"without this instance's cooperation or continued existence"*. A verifier can confirm
bytes and can learn that gate `1.17.0` passed them; they cannot learn what `1.17.0`
checked, and there is no route to it that does not run through this project. Worse,
**the catalogue has already changed what publication MEANS**: D-114 moved C-18.9 off
the content axis onto the provenance chain at 1.18.0, so material published at 1.17.0
cleared a strictly stricter fence than material published at 1.18.0. Two rows in one
manifest make different claims, and the reader is given the version and no way to tell.

**Disposition: gap, and it belongs with D-99/M6** — the interchange promise is that a
third party's tooling can verify without BIO, and the checks are the half of that
promise nobody has shipped. The cheap form is publishing the catalogue's own sha256
alongside its version so a verifier can at least pin what they were told.

---

### A10 · A lost invitation cannot be reissued, the dead roster row is permanent, and at one member it blocks the group from growing

**Missing.** An invitation's plaintext code appears exactly once, at issue, and only
its hash is stored. There is then no path to reissue one:

- `memberAdd` refuses `EXISTS` on any existing `member_id` (`store.mjs:5671`);
- `adminEndorse` refuses `NOT_PROPOSED` for a member already at status `invited`
  (`:5584`);
- `memberSet` accepts only `active` and `revoked` (`:5822-5824`) and touches no
  `invite_hash`.

**Why nobody looked.** D-42 covers burner-URL *semantics*, P-94 covers *expiry*, and
`UI-BASELINE` covers the one-time link being *shown once*. All three are about the
invitation being too durable. Nobody asked what happens when it is lost.

**What breaks.** The remedy is to invite the same person under a different
`member_id`, leaving a roster row permanently at `invited` with `invite_pending: 1`,
in a store that by doctrine deletes nothing. And the first invitation is a special
case with a hard consequence: `ADMINS_FIRST` (`:5696`) refuses every ordinary member
until two administrators exist, so a founder whose one invitation to the second
administrator is lost **cannot add anybody at all** until they invite a different id.
That is the smallest possible group hitting the smallest possible accident, on day one.

**Disposition: defect**, and small — either an op that re-issues against an `invited`
row (recording the reissue, since the old code must stop working) or a withdrawal that
frees the id.

---

### A11 · Departure reconciles nothing: a revoked member's assigned work, leases and open acts are left pointing at them

**Missing.** A 4.7 removal sets `status='revoked'` and deletes their sessions
(`store.mjs:5651-5652`). Nothing else moves. Specifically, **no query anywhere joins
`tasks.assignee` against `members.status`** — `taskList` (`:6889-6896`) filters on
assignee and status and never on whether the assignee still exists as an active
member. Their tasks stay in their name; `#refuseNotYours` (`:6943-6954`) tells every
other member *"this task is not yours to resolve; it is with <name>"*. An administrator
can override, so the work is recoverable — but only by an administrator who happens to
go looking, and nothing tells anyone to look.

**Why nobody looked.** Departure was measured as an *authority* event: who may revoke
whom, with what arithmetic, reachable from which surface (`CAPABILITIES` F-4,
`PROCESS-CATALOGUE` P-42/P-43, D-134/D-136). `projectownerrescue` (D-47) exists because
one instance of the aftermath was noticed — a project whose owners are all inactive —
and that instance was closed without the class being named.

**What breaks.** Every obligation routed to a person becomes silently unowned when the
person goes: an authority-determination task, a lease they hold until TTL, a
`forwarded` task in flight, a declared expertise a departed administrator confirmed.
D-125 is building per-member notification state on top of this, which multiplies it.
The shape is the one `projectownerrescue` already solved once, and the general form —
*what does this group owe, and to whom, now that this person is gone* — has no query,
no surface and no debt row.

**Disposition: gap.** The cheap first move is a read: everything still addressed to an
inactive member, offered to an administrator. That is one join.

---

### A12 · An instance does not record what body it investigates

**Missing.** An instance knows its own name (`INSTANCE_NAME`, bound from the worker
slug) and nothing about its subject. There is no jurisdiction, institution or body
declared at instance level: `bundles.group_id` is a column nothing reads, and
`#ENTITY_KINDS` (`store.mjs:2992-2995`) admits `institution` and `body` as *entities
inside* the record, which any member may create and none is the instance's own subject.

**Why nobody looked.** Every document, measurement and worked example in the corpus is
Oakland. When there is one subject, naming it looks like configuration rather than
record.

**What breaks.** Three things that are already designed. D-128 wants *"a flow model
per institution that EVOLVES as understanding does"* and has no institution to anchor
one to. D-74's shared-identifier measurements are *"recorded per institution the way
stack measurements are recorded per host"*, with no per-institution place to record
them. And a published case says which group published it and never which body it
concerns — so a reader, an aggregator, or a second group cannot tell what a case is
*about* without reading it, which forecloses the only cheap form of discovery between
instances (A1).

**Disposition: decision for Bob.** It also carries the timezone and calendar A6 needs,
which is an argument for settling both at once rather than adding a bare `TZ` binding.

---

### A13 · The surface offers a control that discards the member's session and their in-flight work, and nothing warns them

**Missing.** `app.html` persists nothing: the only `localStorage` use in the file is
the rail-collapse flag (`:865`, `:871`), and `PLANE.token` lives in memory. Meanwhile
`buildCheck` polls `/build` every five minutes and reveals an **"Updated · reload"**
button. Pressing it ends the session, empties `NAVSTACK`, and discards any open
dialog — including the authored reason in a justified-transition box, which by
constraint C1 the system may never help the member rewrite. There is no
`beforeunload` handler anywhere in the file.

**Why nobody looked.** `UI-BASELINE` records both facts, in different sections
(§1.1 "there is no `localStorage`/`sessionStorage` of the session anywhere", §1.0 the
build-freshness reload) and, as its own author notes, does not connect them. Surface B
persists its session in `sessionStorage` (`setup.mjs:378`, `:469`) and has a restore
path, so the surface members are being moved *onto* is the one that lost the property.

**What breaks.** The one class of content this system must never regenerate is a
member's authored words, and it is the only content held nowhere but a DOM node. The
prompt-shaped version — a member halfway through a ceremony when the tab dies — has the
same answer: nothing survives.

**Disposition: defect**, and the fix is bounded: draft persistence for authored text
only, plus a confirmation on the reload button. Persisting the *session* is a separate
question with a security side to it and should not be folded in.

---

## 2 · What every pass assumed

Stated plainly, because the assumptions are more portable than the findings.

1. **The system is observed in a steady state.** Every inventory measured what runs,
   not what happens when something stops halfway. The one exception is
   `MACHINE-PROCESSES` §4, and it looked at retries rather than at abandonment.
2. **Scale means growth.** Every instrument points upward from 600 (A8). No question
   was asked at the size a group actually starts at, and the empty and near-empty
   states are the ones nothing exercises.
3. **There is one instance, and it is the only one there will ever be.** Hence A1,
   A12, and the fact that `AUDIENCES` could reach a cross-instance question and find
   the identifier layer beneath it unexamined.
4. **The record outlives the people, so nothing needs to be handed over.** True of
   authorship and false of obligation (A11).
5. **Time is a thing that makes stored answers stale.** That framing is correct, well
   developed, and it crowded out time as *calendar* (A6) and time as *precision*
   (A5).
6. **The documents are in English.** Never stated, never questioned (A7).
7. **An export is an act with a permission.** Never an artefact with contents, and
   never one end of a round trip (A4).

---

## 3 · Method, and what this pass did not check

**Read in full before writing:** all eleven files in `docs/development/research/`,
`DEBT.md` (143 rows), `MILESTONES.md`, `CLAUDE.md`. Each finding was grep-checked
against `DEBT.md` and against every research file before being written.

**Measured in code:** `bio-plane/src/store.mjs` (read with `/usr/bin/grep -a` per
D-131), `index.mjs`, `schema.mjs`, `query.mjs`, `gate.mjs`, `checks/bio-checks.mjs`,
`civicos-ui/app.html`, `bio-plane/src/setup.mjs`.

**Not checked, and each would change a finding if it went the other way:**

- **Nothing was run.** No suite, no bench, no live probe. A7 and A8 are explicitly
  predictions with their tests named; every other finding is a reading of source.
- **Whether SQLite's `unicode61` behaves as described on CJK in workerd** was not
  measured — the tokenizer choice is verified, its consequence is inferred (A7).
- **Whether Oakland's multilingual publication is a legal obligation** is an outside
  claim I did not verify against a primary source. The finding does not rest on it:
  the record cannot search those languages whether or not the city must publish them.
- **Durable Object alarm behaviour under a permanently non-empty queue** was reasoned
  from `#schedConsumers` and not observed (A3).
- **`newgroup/src`** was read only for the absence of a restore path (A4); its wizard
  flow was not read.
- **Git history of `bio-checks.mjs`** was not walked, so A9's claim is that no
  *published artefact* names what a catalogue version required, not that the
  information is unrecoverable by someone with the repository.
