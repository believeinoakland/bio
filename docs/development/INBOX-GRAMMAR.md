# The task inbox: field grammar and routing, derived before it is built

Written 2026-07-30, thread CAPTURE, as groundwork for D-98. This is a
CONTRACT, not a design proposal: every bound below is derived from a decision
already made, either a Bob ruling in `AUTHORITY-AND-TRUST.md` or an existing
grammar the F5 threat model already settled (C-18.5). Nothing here is a fresh
judgement call, which is the point. The archive session's item 2 builds against
this so it is not inventing a schema under time pressure, and the one genuine
open question is called out at the end rather than decided here.

## Why this is a grammar problem, not just a table

Bob's ruling: undetermined authority becomes a task for the project manager,
and the task's transport and UI surface **might later be email**. That single
clause is load-bearing. An email renders in a client we do not control, where a
plausible-looking instruction is exactly what phishing is. So the F5 posture
that governs `data/gathering.json` governs this file identically: **fields are
bounded at WRITE time, rendered as quoted data, and a leaked write token can
litter the inbox but never steer the member reading it.**

That makes the inbox a sibling of the gathering queue, not a new kind of thing.
It reuses C-18.5's machinery rather than growing a second grammar that pretends
to be the same one, the mistake `checkGatheringGrammar`'s own comment warns
against.

## The file

`data/inbox.json`, one per instance, in the WORKING store only. It never
crosses the publication fence: an inbox is the group talking to itself about
what it has not yet established, which is the opposite of ratified public
material. A capture whose `authority_state` is `undetermined` (D-97, shipped
0.47.0) is what puts a task here.

Shape mirrors `gathering.json`: a top-level object with a `tasks` array, so the
same reader/exporter pattern applies.

```
{
  "tasks": [ { task }, ... ]
}
```

## The task grammar (proposed C-19.1, mirroring C-18.5 field-for-field)

Each bound below cites the precedent it copies. Where C-18.5 already fixed a
pattern for the same kind of field, this uses THE SAME pattern, not a similar
one.

| Field | Rule | Precedent |
| --- | --- | --- |
| `id` | matches `/^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/` | `GATH_ID_RE`, same shape with the TASK prefix |
| `kind` | enum: `authority-undetermined` (more kinds later, added by revision not code) | `GATH_STATUS_ENUM` is a closed enum amended by revision |
| `subject.text` | nonempty single-line string, ≤200 chars, no `\r`/`\n` | C-18.5 `target.text` verbatim |
| `subject.description` | optional string, ≤2000 chars | C-18.5 `target.description` verbatim |
| `refers_to` | a canonical bundle ID matching `BUNDLE_ID_RE` (the exported C-1.2 validator) | the task points AT a bundle; reuse the existing exported regex, never a new one |
| `locators` | optional array; every element `isPublicHttpsLocator` | C-18.5 `locators`, same host guard |
| `assignee` | a `member_id` string, or the literal `"unassigned"` | see routing below; `member_id` is the `member_expertise.member_id` shape |
| `assignee_role` | enum: `project-manager`, `group-admin`, `member` | the RULED routing chain, named so the fallback is auditable |
| `status` | enum: `open`, `resolved`, `forwarded` | mirrors `GATH_STATUS_ENUM`'s closed-enum discipline |
| `created` | ISO 8601 UTC instant | `ISO_TS_RE` verbatim |
| `resolved_at` | optional ISO 8601 UTC instant | `ISO_TS_RE` verbatim |
| `history[]` | append-only list of `{at, event, actor}` | `member_expertise` columns (`event`, `actor`, `created`) exactly; a task's life is recorded the way expertise grants are |

Everything an attacker-with-a-write-token could put in a field that a member
reads (`subject.text`, `subject.description`) is length-bounded and
newline-stripped at write, so the exporter renders it as inert quoted data.
Everything that drives a MACHINE decision (`id`, `kind`, `status`,
`assignee_role`, timestamps) is enum- or pattern-bounded so a malformed value
is refused at the write rather than acted on. This is the C-18.5 split applied
unchanged: bound the data fields against attention-theft, bound the control
fields against steering.

## Routing, exactly as RULED

Bob: task for the **project manager**, falling back to a **group admin** where
a project has no manager, **forwardable** to a member better placed to attest.
`member_expertise` already supplies the routing signal.

The contract encodes the ruling as a resolution order, not a policy to invent:

1. If the referred bundle's project has a manager, `assignee` is that member,
   `assignee_role` is `project-manager`.
2. Else `assignee` is a group admin (the existing admin set), `assignee_role`
   is `group-admin`.
3. A forward is a WRITE that sets a new `assignee`/`assignee_role: member` and
   appends a `forwarded` history entry with the forwarder as `actor`. The
   original assignment stays in `history`, because who a task was taken FROM is
   as much a fact as who holds it now. A forward names a target; the F5 bound
   on `subject.text` already prevents the forward note from carrying an
   instruction.

`member_expertise(member_id, label)` is the index that answers "who is better
placed", so a forward UI can offer members whose declared expertise matches the
task's subject. That is a HINT for a human, never an automatic reassignment:
the ruling makes forwarding a member action, not a daemon one.

## What the write path enforces, and where

Same two-layer shape D-97 used. `checkInboxGrammar` (the C-19.1 body) is
exported from `bio-checks`, exactly as `checkGatheringGrammar` is, so:

- the **gate** runs it at ratification for any bundle that carries
  `data/inbox.json` (scoped-by-contract: only where the file is present), and
- the **plane** runs the exported function at the WRITE, so a malformed task is
  refused before it lands and never waits for a member's attention to be
  wasted. The comment on `checkGatheringGrammar` already states this reasoning;
  the inbox inherits it.

## RULED 2026-07-30: auto-create at capture, through a queue

Bob's ruling: **an undetermined-authority capture creates an inbox task
automatically at the moment of capture, and the transport is a
producer/consumer queue.** The queue is not an implementation detail; it is
what makes auto-creation safe.

The capture path is the PRODUCER: on filing a capture whose `authority_state`
is `undetermined`, it enqueues one event carrying the referred bundle ID, the
subject text (the locator or document title, F5-bounded at enqueue), and the
capture timestamp. It does NOT write to the inbox table.

A separate CONSUMER drains the queue and writes tasks. Only the consumer holds
the write path to `data/inbox.json`, and it applies the routing order below and
the C-19.1 grammar at write. This is the important safety property: a capture
daemon, and therefore a leaked capture token, can only ENQUEUE. It cannot write
a task that renders in front of a member, cannot set an assignee, cannot forge
a `forwarded` history entry. The blast radius of the daemon credential stops at
the queue boundary, where every field is already F5-bounded and rendered as
quoted data.

Enqueue must be idempotent on `(refers_to, kind)`: a bundle re-captured while
still undetermined enqueues an event that the consumer must fold into the
existing open task rather than spawning a duplicate, so a noisy re-capture loop
cannot flood the inbox. The consumer is the natural place for that dedup,
because it is the only writer and can read the current task set first.

Transport shape is the consumer's choice between a Cloudflare Queue and a
durable table drained on a schedule, decided when D-98 is built; both satisfy
the producer/consumer split. The table-as-queue form keeps everything inside
the Durable Object and the audit model, which is the same reasoning that keeps
the store itself in the DO, so it is the default unless the Queue buys
something specific.

## What this unblocks

With this contract fixed, D-98 is a build task rather than a design task: the
table is the `tasks` array persisted in the Durable Object, the grammar is
C-18.5's pattern copied field-for-field, the routing is the RULED order, and
the tests are the both-ways C-18.5 tests with TASK fixtures. The only thing
that stops it being started this session is that it is next session's item 2
and carries the one open question above.
